import { Script } from "../sotc/Game";
import { mapState } from "vuex";
import { CharacterAlignment, CharacterType } from "../sotc/Game";
import { TaggedLogger } from "../util/TaggedLogger";

const logger = new TaggedLogger("VueScraper");
logger.debug("initialized");

type HTMLVueElement = HTMLElement & { __vue_app__: any };

const ALIGNMENTS = new Map([
  ["townsfolk", CharacterAlignment.GOOD],
  ["outsider", CharacterAlignment.GOOD],
  ["minion", CharacterAlignment.EVIL],
  ["demon", CharacterAlignment.EVIL],
]);

const TYPES = new Map([
  ["townsfolk", CharacterType.TOWNSFOLK],
  ["outsider", CharacterType.OUTSIDER],
  ["minion", CharacterType.MINION],
  ["demon", CharacterType.DEMON],
]);

const IGNORED_MUTATIONS = [
  "chat/updateServer",
  "session/setPing",
  "toggleModal",
];

export default function (
  container: HTMLElement,
  _callback?: (s: Script) => any
) {
  const vueApp = (container as HTMLVueElement).__vue_app__;
  const globals = vueApp._context.config.globalProperties;
  logger.debug("Adding Vue hooks");

  logger.debug("Adding script watcher");
  const unwatchScript = globals.$store.watch(
    (state) => [state.edition, state.roles],
    (newValue, oldValue) => {
      logger.info("Detected VueX script change", newValue, oldValue);
    }
  );

  logger.debug("Adding game watcher");
  const unwatchGame = globals.$store.watch(
    (state, getters) => [
      state.game.history,
      state.game.phase,
      state.game.isRunning,
      getters["game/isNight"],
    ],
    (newValue, oldValue) => {
      const changes = oldValue.map((e, i) => [e, newValue[i]]);
      const [history, phase, isRunning, isNight] = changes;
      logger.info("Detected VueX game change", {
        history,
        phase,
        isRunning,
        isNight,
      });
    }
  );

  logger.debug("Adding mutation watcher");
  const unsubscribe = globals.$store.subscribe((mutation, state) => {
    if (IGNORED_MUTATIONS.includes(mutation.type)) return;

    logger.debug("VueX mutation", mutation, state);
  });

  // const map = (prop) => mapState([prop])[prop].bind(globals)();

  // const roles = map("roles");
  // const edition = map("edition");

  // const mapRole = (r) => {
  //   const { id, name, team, ability } = r;
  //   const alignment = ALIGNMENTS.get(team);
  //   const type = TYPES.get(team);
  //   return { id, name, ability, alignment, type };
  // };

  // const script = {
  //   name: edition.name,
  //   author: edition.author,
  //   characters: [...roles.values()].map(mapRole),
  // };
}
