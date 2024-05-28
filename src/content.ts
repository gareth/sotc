import { Game } from "./sotc/Game";
import { TaggedLogger } from "./util/TaggedLogger";

const logger = new TaggedLogger("Content");
logger.info("initialized");

const port = chrome.runtime.connect({ name: "gameTab" });

function _injectScript() {
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

  /* This never works, because the event is dispatched before the script loads.
  Instead, we just rely on the injected script to notify us immediately (and
  again whenever a change is detected) */
  // logger.info("requesting Script");
  // document.dispatchEvent(new CustomEvent("detectScript", {}));
}

_injectScript();
