import { Game } from "./sotc/Game";
import { TaggedLogger } from "./util/TaggedLogger";
import extractScript from "./scrapers/DomScraper";

const logger = new TaggedLogger("Content");
logger.info("initialized");

const port = chrome.runtime.connect({ name: "gameTab" });

const main = document.getElementById("main");

if (main) {
  logger.debug("Extracting script from", main);

  const script = extractScript(main);

  if (script) {
    const game = new Game(script);

    logger.debug("…got", game);

    port.postMessage({
      type: "gameState",
      payload: game,
    });
  } else {
    logger.debug("No game detected");
  }
}

// function retrievePageVariable() {
//   document.dispatchEvent(new CustomEvent("retrievePageVariable", {}));
// }

function _injectScript() {
  const script = document.createElement("script");
  const runtimeUrl = chrome.runtime.getURL("inject.js");
  script.src = runtimeUrl;
  logger.debug("injecting", runtimeUrl);
  (document.head || document.documentElement).appendChild(script);

  // document.addEventListener("variableRetrieved", (e) => {
  //   console.log("variableRetrieved", e.detail);
  // });
}

_injectScript();
