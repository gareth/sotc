import { TaggedLogger, LogLevel } from "./util/TaggedLogger";

type HTMLVueElement = HTMLElement & { __vue_app__: any };

const logger = new TaggedLogger("Inject");
logger.info("initialized");

const IGNORED_MUTATIONS = [
  "chat/updateServer",
  "session/setPing",
  "toggleModal",
];

// "deep clones" an object by stringifying and parsing it through JSON
const clone: <T>(o: T) => T = (o) => JSON.parse(JSON.stringify(o));

function inject(container: HTMLVueElement) {
  const vueApp = container.__vue_app__;
  const globals = vueApp._context.config.globalProperties;

  logger.info("Adding Vue hooks");

  logger.info("Adding script watcher");
  const unwatchScript = globals.$store.watch(
    (state) => [state.edition, state.roles],
    ([edition, roles]) => {
      const detail = { edition, roles: [...roles.values()] };
      logger.info("Detected VueX script change", detail);

      document.dispatchEvent(
        new CustomEvent("sotc-script", { detail: clone(detail) })
      );
    }
  );

  logger.info("Adding game watcher");
  const unwatchGame = globals.$store.watch(
    (state, getters) => [
      state.game.history,
      state.game.phase,
      state.game.isRunning,
      getters["game/isNight"],
    ],
    ([history, phase, isRunning, isNight]) => {
      // const changes = oldValue.map((e, i) => [e, newValue[i]]);
      const newState = { history, phase, isRunning, isNight };
      logger.info("Detected VueX game change", newState);

      const detail = JSON.parse(
        JSON.stringify({
          history,
          phase,
          isRunning,
          isNight,
        })
      );
      document.dispatchEvent(new CustomEvent("sotc-gameState", { detail }));
    }
  );

  logger.info("Adding mutation watcher");
  const unsubscribe = globals.$store.subscribe((mutation, state) => {
    if (IGNORED_MUTATIONS.includes(mutation.type)) return;

    // logger.debug("VueX mutation", mutation, state);
  });

  logger.info("Adding route watcher to", globals.$router);
  globals.$router.afterEach((to) => {
    logger.debug("Routing to", to);
    const detail = { page: to.name };
    logger.debug("Dispatching navigated route", detail);
    document.dispatchEvent(new CustomEvent("sotc-navigate", { detail }));
  });

  const detail = { page: globals.$route.name };
  logger.debug("Dispatching initial route", detail);
  document.dispatchEvent(new CustomEvent("sotc-navigate", { detail }));
}

const main = document.getElementById("main") as HTMLVueElement;
if (main.__vue_app__) {
  inject(main);
}
