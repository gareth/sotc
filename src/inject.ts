import { TaggedLogger } from "./util/TaggedLogger";
import extractScript from "./scrapers/VueScraper";

type HTMLVueElement = HTMLElement & { __vue_app__: any };

const logger = new TaggedLogger("Inject");
logger.info("initialized");

document.addEventListener("detectScript", () => {
  logger.info("Script requested");
  const main = document.getElementById("main") as HTMLVueElement;
  if (!main) return;

  const script = extractScript(main);

  if (script) {
    logger.info("Detected script", script);
    document.dispatchEvent(
      new CustomEvent("detectedScript", {
        detail: script,
      })
    );
  }
});

setTimeout(() => {
  document.dispatchEvent(new CustomEvent("detectScript", {}));
}, 3000);
