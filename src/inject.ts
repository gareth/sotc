import { TaggedLogger } from "./util/TaggedLogger";
import type { BOTCVueApp } from "botc";

type HTMLVueAppElement = HTMLElement & { __vue_app__: BOTCVueApp };
function isHTMLVueAppElement(el: HTMLElement | null): el is HTMLVueAppElement {
  return !!(el && "__vue_app__" in el);
}

const logger = new TaggedLogger("Inject");
logger.info("initialized");

const IGNORED_MUTATIONS = [
  "chat/updateServer",
  "session/setPing",
  "toggleModal",
];

// "Deep clones" an object by stringifying and parsing it through JSON.
// Good for removing "proxy" references
const clone: <T>(o: T) => T = (o) => JSON.parse(JSON.stringify(o));

function inject(container: HTMLVueAppElement) {
  const vueApp = container.__vue_app__;
  const globals = vueApp._context.config.globalProperties;

  // logger.info("Adding Vue hooks");
}

const main = document.getElementById("main");
if (isHTMLVueAppElement(main)) {
  inject(main);
}
