import { sotcEvent } from "./types/event";
import { TaggedLogger } from "./util/TaggedLogger";
import type { BOTCVueApp } from "botc";
import { clone } from "./util/clone";
import { Character, CharacterAlignments, Script, characterType } from "./types/sotc";

type HTMLVueAppElement = HTMLElement & { __vue_app__: BOTCVueApp };
function isHTMLVueAppElement(el: HTMLElement | null): el is HTMLVueAppElement {
  return !!(el && "__vue_app__" in el);
}

const logger = new TaggedLogger("Inject");
logger.info("initialized");

const IGNORED_MUTATIONS = ["chat/updateServer", "chat/toggleMuted", "session/setPing", "toggleModal"];

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

const main = document.getElementById("main");
if (isHTMLVueAppElement(main)) {
  logger.info("Injecting into Vue app", main.__vue_app__);
  inject(main);
}
