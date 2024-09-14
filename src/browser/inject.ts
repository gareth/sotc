import { PlayerCharacter, Seat, sotcEvent } from "./types/event";
import { TaggedLogger } from "../core/util/TaggedLogger";
import type { BOTCVueApp } from "botc";
import { clone } from "../core/util/clone";
import { Character, CharacterAlignments, Script, characterType } from "./types/sotc";
import { round } from "../core/util/round";

import sentry, { promiseHandler } from "../core/util/sentry";
import { Bounds, mapToPixels } from "../core/util/bounds";

const logger = new TaggedLogger("Inject");
logger.info("initialized");

type HTMLVueAppElement = HTMLElement & { __vue_app__: BOTCVueApp };
function isHTMLVueAppElement(el: HTMLElement | null): el is HTMLVueAppElement {
  return !!(el && "__vue_app__" in el);
}

const IGNORED_MUTATIONS = ["chat/updateServer", "chat/toggleMuted", "session/setPing", "toggleModal"];

function isEmptyObject(o: object): o is Record<string, never> {
  return !Object.keys(o).length;
}

function roleToCharacter(role: botc.Role): Character[] {
  const { id, name, ability } = role;

  const type = characterType(role.team);
  if (!type) {
    logger.error("Unexpected team", role.team, "for role", role);
    return [];
  }

  const alignment = CharacterAlignments.get(type);
  if (!alignment) {
    logger.error("No known alignment for type", type);
    return [];
  }

  return [{ id, name, ability, type, alignment }];
}

function editionToScript(data: Pick<botc.Store, "edition" | "roles">): Script {
  const name = data.edition.name;

  let author = data.edition.author;
  if (!author && data.edition.isOfficial) author = "The Pandemonium Institute";
  if (!author) {
    logger.warn("Unofficial script detected with no author:", data);
    author = "Unknown";
  }

  const characters = [...data.roles.values()].flatMap(roleToCharacter);

  return { name, author, characters };
}

function inject(container: HTMLVueAppElement) {
  addEventListener("unhandledrejection", promiseHandler);

  const vueApp = container.__vue_app__;
  const globals = vueApp._context.config.globalProperties;
  logger.info("Adding Vue hooks to", globals);

  logger.info("Adding script watcher");
  globals.$store.watch(
    (state) => ({ edition: state.edition, roles: state.roles }),
    ({ edition, roles }) => {
      const script = editionToScript({ edition, roles });

      logger.info("Detected VueX script change", script);
      if (!script) return;

      document.dispatchEvent(sotcEvent("sotc-scriptChange", { detail: clone(script) }));
    }
  );

  addEventListener("sotc-startCalibration", () => {
    addCalibrationOverlay(container);
  });

  addEventListener("sotc-endCalibration", () => {
    hideCalibrationOverlay(container);
  });

  function roleDetail(player: botc.Player) {
    if (isEmptyObject(player.role)) return;

    const team = characterType(player.role.team);
    if (!team) throw new Error(`Unable to lookup team type ${player.role.team}`);
    return {
      id: player.role.id,
      alignment: player.alignment,
      team: team,
    };
  }

  logger.info("Adding players/camera visibility watcher");
  globals.$store.watch(
    (state, getters: botc.StoreGetters) => ({
      players: state.players.players,
      users: state.session.users,
      mode: state.grimoire.mode,
      hasVideo: getters["chat/hasVideo"],
    }),
    ({ players, users, mode, hasVideo: _hasVideo }) => {
      updateGrimoireTokenPositions(container, players, users, roleDetail, mode).catch((e) => {
        sentry.captureException(e);
      });
    },
    { deep: true, flush: "post" }
  );

  globals.$store.watch(
    (state) => state.grimoire.mode,
    (value, oldValue) => {
      logger.debug("Grimoire mode changed from", oldValue, "to", value);
    }
  );

  logger.info("Adding game watcher");
  globals.$store.watch(
    (state, getters: botc.StoreGetters) => ({
      history: state.game.history,
      phase: state.game.phase,
      isRunning: state.game.isRunning,
      isNight: getters["game/isNight"],
    }),
    ({ history, phase, isRunning, isNight }) => {
      const newState = { history, phase, isRunning, isNight };
      logger.info("Detected VueX game change", newState);

      const detail = clone({
        history: history.length,
        phase,
        isRunning,
        isNight,
      });
      const event = sotcEvent("sotc-gameState", { detail });
      document.dispatchEvent(event);
    }
  );

  logger.info("Adding route watcher to", globals.$router);
  globals.$router.afterEach((to) => {
    logger.debug("Routing to", to);
    const detail = { page: to.name?.toString() };

    logger.debug("Dispatching navigated route", detail);
    document.dispatchEvent(sotcEvent("sotc-pageChange", { detail }));
  });

  const detail = { page: globals.$route.name?.toString() };
  logger.debug("Dispatching initial route", detail);
  const event = sotcEvent("sotc-pageChange", { detail });
  document.dispatchEvent(event);

  logger.info("Adding mutation watcher");
  globals.$store.subscribe((mutation, state) => {
    if (IGNORED_MUTATIONS.includes(mutation.type)) return;
    logger.debug("VueX mutation", mutation, state);
  });

  // There may be other ways for the grim position to move, but for now we're
  // just worrying about the side panel opening/closing.
  logger.info("Adding grim position observer");
  globals.$store.watch(
    (state) => ({ rightSideTabState: state.grimoire.rightSideTabState }),
    (rightSideTabState) => {
      // TODO: Avoid one-off hardcoded ID lookup here.
      // Is the difference between #center and .circle important?
      const grimContainer = document.querySelector("#center");
      if (!(grimContainer instanceof HTMLElement)) return;
      logger.info("Tab state now", rightSideTabState);

      // The tab state changing might have caused the grim to animate, so we
      // wait for the animations to finish before detecting the new position. If
      // there are no animations, this resolves instantly
      Promise.allSettled(grimContainer.getAnimations().map((a) => a.finished))
        .then(() => {
          const bounds = getGrimoireBounds(grimContainer);
          logger.info("Bounds", bounds);
        })
        .catch((e) => logger.error(e));
    }
  );
}

const updateGrim = (container: HTMLElement, mode: string | undefined) => {
  const grimBounds = getGrimoireBounds(container);
  const windowBounds = {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  document.dispatchEvent(sotcEvent("sotc-grimChange", { detail: { pos: grimBounds, container: windowBounds, mode } }));
};

const calibratorClass = "sotc-overlay";

async function updateGrimoireTokenPositions(
  container: HTMLVueAppElement,
  players: botc.Player[],
  users: Map<string, botc.User>,
  roleDetail: (player: botc.Player) => PlayerCharacter | undefined,
  mode: string | undefined
) {
  const locations = await getTokensBounds(container);
  logger.info("Animations finished!");
  if (locations?.length != players.length) return;

  const activePlayers = players.map((player, idx): Seat => {
    const pos = locations?.[idx];
    const user = users.get(player.id);
    return {
      user: user?.username,
      role: roleDetail(player),
      pos,
      isDead: player.isDead,
      isVoteless: player.isVoteless,
      revealed: player.revealed,
    };
  });

  logger.info("Players changed", [...activePlayers]);

  document.dispatchEvent(sotcEvent("sotc-playersChange", { detail: clone(activePlayers) }));
  updateGrim(container, mode);
}

function addCalibrationOverlay(container: HTMLElement) {
  logger.info("Adding calibration overlay to", container);
  let calibrator: HTMLElement | null = container.querySelector(`.${calibratorClass}`);
  if (!calibrator) {
    calibrator = document.createElement("div");
    calibrator.classList.add("sotc-overlay");
    Object.assign(calibrator.style, {
      position: "absolute",
      pointerEvents: "none",
      zIndex: 1000,
    });
    const handleStyle = {
      position: "absolute",
      width: "20px",
      height: "20px",
      borderRadius: "10px",
      outline: "15px solid black",
      background: "yellow",
      transform: "translateX(-50%) translateY(-50%)",
    };
    const handle1 = document.createElement("div");
    Object.assign(handle1.style, {
      ...handleStyle,
      top: "20%",
      left: "20%",
      transform: "translateX(-50%) translateY(-50%)",
    });
    const handle2 = document.createElement("div");
    Object.assign(handle2.style, {
      ...handleStyle,
      bottom: "20%",
      right: "20%",
      transform: "translateX(50%) translateY(50%)",
    });

    calibrator.appendChild(handle1);
    calibrator.appendChild(handle2);
    container.appendChild(calibrator);
  } else {
    calibrator.style.display = "block";
  }

  const grimBounds = getGrimoireBounds(container);
  Object.assign(calibrator.style, { ...mapToPixels(grimBounds) });
}

function hideCalibrationOverlay(container: HTMLElement) {
  logger.info("Removing calibration overlay from", container);
  const calibrator: HTMLElement | null = container.querySelector(`.${calibratorClass}`);
  if (calibrator) {
    calibrator.style.display = "none";
  }
}

const getGrimoireBounds = (container: HTMLElement) => {
  const grim = container.querySelector(".circle");
  if (grim) {
    const { x, y, width, height } = grim.getBoundingClientRect();
    return {
      left: Math.round(x),
      top: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    };
  } else {
    throw new Error(`Grim not found in container .circle`);
  }
};

const getElementBounds = (el: Element, base: Bounds) => {
  const { x, y, width, height } = el.getBoundingClientRect();
  const result = {
    left: round((x - base.left) / base.width, 4),
    top: round((y - base.top) / base.height, 4),
    width: round(Math.round(width) / base.width, 4),
    height: round(Math.round(height) / base.height, 4),
  };
  return result;
};

// Get bounds for every token, after waiting for their animations to finish
const getTokensBounds = async (container: HTMLElement) => {
  logger.debug("Getting token bounds");
  const base = getGrimoireBounds(container);
  logger.debug("Base bounds", base);
  const playerContainers = container.querySelectorAll(".circle > li");
  const promises = [...playerContainers].map(async (el) => {
    const player = el.querySelector(":scope .player");
    if (!player) throw new Error("Player not found in circle scope");
    const animationTargets = el.querySelectorAll(":scope .player, :scope .chat-video");
    await animationsResolved([...animationTargets]);
    return getElementBounds(player, base);
  });

  return Promise.all(promises);
};

async function animationsResolved(elements: Element[]) {
  let animations;
  do {
    animations = elements.flatMap((el) => el.getAnimations());
    await Promise.allSettled(animations.map((a) => a.finished));
  } while (animations.length);
}

try {
  const main = document.getElementById("main");
  if (isHTMLVueAppElement(main)) {
    logger.info("Injecting into Vue app", main.__vue_app__);
    inject(main);
  }
} catch (error) {
  logger.error("Caught error", error);
  sentry.captureException(error);
}
