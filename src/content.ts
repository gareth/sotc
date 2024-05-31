import { Game } from "./sotc/Game";
import { TaggedLogger } from "./util/TaggedLogger";

const logger = new TaggedLogger("Content");
logger.info("initialized");

const port = chrome.runtime.connect({ name: "gameTab" });

function injectScript() {
  const script = document.createElement("script");
  const runtimeUrl = chrome.runtime.getURL("inject.js");
  logger.debug("Injecting Vue monitor script", runtimeUrl);
  script.src = runtimeUrl;
  (document.head || document.documentElement).appendChild(script);

  document.addEventListener("detectedScript", (e: CustomEvent) => {
    logger.info("Script detected", e.detail);

    const game = new Game(e.detail);

    port.postMessage({
      type: "gameState",
      payload: game,
    });
  });

  document.addEventListener("sotc/script", (e: CustomEvent) => {
    logger.info("Detected script change", e.detail);
  });

  document.addEventListener("sotc/gameState", (e: CustomEvent) => {
    logger.info("Detected game state change", e.detail);
  });
}

injectScript();
