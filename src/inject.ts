import { TaggedLogger } from "./util/TaggedLogger";
import setupVueScraper from "./scrapers/VueScraper";
import { watch } from "vue";

type HTMLVueElement = HTMLElement & { __vue_app__: any };

const logger = new TaggedLogger("Inject");
logger.info("initialized");

const main = document.getElementById("main") as HTMLVueElement;

// setTimeout(() => {
//   if (main.__vue_app__) {
//     const globals = main.__vue_app__._context.config.globalProperties;
//   }
// }, 3000);

setupVueScraper(main);
