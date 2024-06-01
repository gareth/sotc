import { CharacterAlignment, CharacterType, Game } from "./sotc/Game";
import { TaggedLogger } from "./util/TaggedLogger";

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
    const { edition, roles } = e.detail;

    const mapRole = (r) => {
      const { id, name, team, ability } = r;
      const alignment = ALIGNMENTS.get(team);
      const type = TYPES.get(team);
      return { id, name, ability, alignment, type };
    };

    const script = {
      name: edition.name,
      author: edition.author,
      characters: roles.map(mapRole),
    };

    const game = new Game(script);

    port.postMessage({
      type: "gameState",
      payload: game,
    });
  });

  document.addEventListener("sotc/gameState", (e: CustomEvent) => {
    logger.info("Detected game state change", e.detail);
  });
}

injectScript();
