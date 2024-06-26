// import { Game } from "./sotc/Game";
import { GameManager } from "./sotc/GameManager";
import { TaggedLogger } from "./util/TaggedLogger";
import { RuntimeMessageType, isRuntimeMessage } from "./types/messages";

const logger = new TaggedLogger("Worker");

logger.info("initialized");

type GamePort = chrome.runtime.Port & { name: "gameTab" };
const isGamePort = (port: chrome.runtime.Port): port is GamePort =>
  port.name == "gameTab";

chrome.runtime.onMessage.addListener(
  (
    message: object,
    sender: unknown,
    sendResponse: (...args: unknown[]) => void
  ) => {
    logger.debug("Received runtime message", message, sender);

    if (!isRuntimeMessage(message)) {
      logger.warn("Unexpected runtime message", message, sender);
      return;
    }

    switch (message.type) {
      case RuntimeMessageType.GET_GAME_STATE: {
        logger.info(
          "Retrieving game state with instance",
          GameManager.instance
        );
        /**/
        const response =
          GameManager.instance.page == "Grimoire"
            ? GameManager.instance.game
            : null;
        logger.info(
          "Sending game state",
          GameManager.instance,
          response,
          JSON.parse(JSON.stringify(response))
        );
        sendResponse(response);
      }
      /*/
        sendResponse(GameManager.instance.game);
        /**/
    }
  }
);

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

// GameManager.instance.on("game:updated", (game: Game | undefined) => {
//   logger.debug("Game updated", game);
//   chrome.action.setBadgeText({ text: game ? " " : "" });
// });

GameManager.instance.on("port:connected", () =>
  updateBadge({ color: "green" })
);
GameManager.instance.on("port:waiting", () => updateBadge({ color: "yellow" }));
GameManager.instance.on("port:disconnected", () =>
  updateBadge({ color: "red" })
);

interface Badge {
  color: string;
}

function updateBadge({ color }: Badge) {
  chrome.action
    .setBadgeBackgroundColor({ color })
    .catch((e) => logger.error("Error setting badge color", e));
}
