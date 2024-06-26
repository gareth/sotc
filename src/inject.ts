import { TaggedLogger } from "./util/TaggedLogger";
import type { BOTCVueApp } from "botc";

type HTMLVueAppElement = HTMLElement & { __vue_app__: BOTCVueApp };
function isHTMLVueAppElement(el: HTMLElement | null): el is HTMLVueAppElement {
  return !!(el && "__vue_app__" in el);
}

const logger = new TaggedLogger("Inject");
logger.info("initialized");

const IGNORED_MUTATIONS = ["chat/updateServer", "session/setPing", "toggleModal"];

function inject(container: HTMLVueAppElement) {
  const vueApp = container.__vue_app__;
  const globals = vueApp._context.config.globalProperties;
  logger.info("Adding Vue hooks");

  logger.info("Adding mutation watcher");
  globals.$store.subscribe((mutation, state) => {
    if (IGNORED_MUTATIONS.includes(mutation.type)) return;

    logger.debug("VueX mutation", mutation, state);
  });
}

const main = document.getElementById("main");
if (isHTMLVueAppElement(main)) {
  inject(main);
}
