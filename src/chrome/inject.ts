import { Seat, sotcEvent } from "./types/event";
import { TaggedLogger } from "./util/TaggedLogger";
import type { BOTCVueApp } from "botc";
import { clone } from "./util/clone";
import { Bounds, Character, CharacterAlignments, Script, characterType } from "./types/sotc";
import { nextTick } from "vue";
import { round } from "./util/round";

import sentry, { promiseHandler } from "./util/sentry";

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

      document.dispatchEvent(sotcEvent("sotc-scriptChanged", { detail: clone(script) }));
    }
  );

  logger.info("Adding players watcher");
  globals.$store.watch(
    (state) => ({ players: state.players.players, users: state.session.users }),
    ({ players, users }) => {
      // `nextTick` because we need Vue to render the result of this change
      // otherwise the bounds won't be calculated correctly.
      void nextTick(async () => {
        const locations = await getTokensBounds(container);
        if (locations?.length != players.length) {
          logger.warn(`Incorrect number of tokens (${locations?.length}) found (expected ${players.length})`);
        }
        const activePlayers = players.map((player, idx): Seat => {
          const pos = locations?.[idx];
          const user = users.get(player.id);
          const roleDetail = isEmptyObject(player.role)
            ? undefined
            : {
                id: player.role.id,
                alignment: player.alignment,
                team: player.role.team,
              };
          return { user: user?.username, role: roleDetail, pos };
        });

        logger.info("Players changed", [...activePlayers]);

        document.dispatchEvent(sotcEvent("sotc-playersChanged", { detail: clone(activePlayers) }));
        updateGrim(container);
      });
    },
    { deep: true }
  );

  // logger.info("Adding game watcher");
  // const unwatchGame = globals.$store.watch(
  //   (state, getters) => ({
  //     history: state.game.history,
  //     phase: state.game.phase,
  //     isRunning: state.game.isRunning,
  //     isNight: getters["game/isNight"],
  //   }),
  //   ({ history, phase, isRunning, isNight }) => {
  //     const newState = { history, phase, isRunning, isNight };
  //     logger.info("Detected VueX game change", newState);

  //     const detail = JSON.parse(
  //       JSON.stringify({
  //         history,
  //         phase,
  //         isRunning,
  //         isNight,
  //       })
  //     );
  //     document.dispatchEvent(new CustomEvent("sotc-gameState", { detail }));
  //   }
  // );

  logger.info("Adding route watcher to", globals.$router);
  globals.$router.afterEach((to) => {
    logger.debug("Routing to", to);
    const detail = { page: to.name?.toString() };

    logger.debug("Dispatching navigated route", detail);
    document.dispatchEvent(sotcEvent("sotc-navigate", { detail }));
  });

  const detail = { page: globals.$route.name?.toString() };
  logger.debug("Dispatching initial route", detail);
  const event = sotcEvent("sotc-navigate", { detail });
  document.dispatchEvent(event);

  logger.info("Adding mutation watcher");
  globals.$store.subscribe((mutation, _state) => {
    if (IGNORED_MUTATIONS.includes(mutation.type)) return;

    // logger.debug("VueX mutation", mutation, state);
  });

  logger.info("Adding game watcher");
}

const updateGrim = (container: HTMLElement) => {
  const grimBounds = getGrimoireBounds(container);
  const windowBounds = {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  if (grimBounds) {
    document.dispatchEvent(sotcEvent("sotc-size", { detail: { pos: grimBounds, container: windowBounds } }));
  }
};

const getGrimoireBounds = (container: HTMLElement) => {
  const grim = container.querySelector(".circle");
  if (grim) {
    const { x, y, width, height } = grim.getBoundingClientRect();
    return {
      x: Math.round(x),
      y: Math.round(y),
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
    x: round((x - base.x) / base.width, 4),
    y: round((y - base.y) / base.height, 4),
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
  const tokens = container.querySelectorAll(".circle .player");
  const promises = [...tokens].map(async (el) => {
    const animations = el.getAnimations();
    // If there are no animations, this resolves instantly
    await Promise.all(animations.map((a) => a.finished));
    return getElementBounds(el, base);
  });

  return Promise.all(promises);
};

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
