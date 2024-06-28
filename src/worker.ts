// import { Game } from "./sotc/Game";
import { GameManager } from "./sotc/GameManager";
import { TaggedLogger } from "./util/TaggedLogger";
import { RuntimeMessageType, isRuntimeMessage } from "./types/messages";

const logger = new TaggedLogger("Worker");

logger.info("initialized");

type GamePort = chrome.runtime.Port & { name: "gameTab" };
const isGamePort = (port: chrome.runtime.Port): port is GamePort => port.name == "gameTab";

// Handle connection from game tabs
chrome.runtime.onConnect.addListener((port) => {
  if (isGamePort(port)) {
    const sender = port.sender;
    logger.info("Game tab connected", sender);
    if (!sender) {
      logger.warn("gameTab port opened without a sender", port);
      return;
    }

    GameManager.instance.connect(port);
  }
});

// Handle connection from the extension popup window
chrome.runtime.onMessage.addListener((message: object, sender: unknown, sendResponse: (response: unknown) => void) => {
  logger.debug("Received runtime message", message, sender);

  if (!isRuntimeMessage(message)) {
    logger.warn("Unexpected runtime message", message, sender);
    return;
  }

  switch (message.type) {
    case RuntimeMessageType.GET_GAME_STATE: {
      logger.info("Retrieving game state with instance", GameManager.instance);
      /**/
      const response = null;
      logger.info("Sending game state", GameManager.instance, response, JSON.parse(JSON.stringify(response)));
      sendResponse(response);
    }
    /*/
        sendResponse(GameManager.instance.game);
        /**/
  }
});

// GameManager.instance.on("game:updated", (game: Game | undefined) => {
//   logger.debug("Game updated", game);
//   chrome.action.setBadgeText({ text: game ? " " : "" });
// });

GameManager.instance.on("port:connected", () => updateBadge({ color: "green", visible: true }));
GameManager.instance.on("port:waiting", () => updateBadge({ color: "yellow" }));
GameManager.instance.on("port:disconnected", () => updateBadge({ color: "red", visible: false }));

interface Badge {
  color: string;
  visible?: boolean;
}

function updateBadge({ color, visible }: Badge) {
  chrome.action.setBadgeBackgroundColor({ color }).catch((e) => logger.error("Error setting badge color", e));
  if (undefined !== visible) {
    chrome.action
      .setBadgeText({ text: visible ? " " : "" })
      .catch((e) => logger.error("Error setting badge visibility", e));
  }
}
