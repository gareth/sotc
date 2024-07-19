// import { Game } from "./sotc/Game";
import { GameManager } from "./sotc/GameManager";
import { whisper } from "./twitch/sync";
import { TaggedLogger } from "./util/TaggedLogger";
import { clone } from "./util/clone";
import useLocalStore from "./stores/local";

import { capture } from "./util/sentry";

const logger = new TaggedLogger("Worker");

logger.info("initialized");

type GamePort = chrome.runtime.Port & { name: "gameTab" };
const isGamePort = (port: chrome.runtime.Port): port is GamePort => port.name == "gameTab";

interface Badge {
  color: string;
  visible?: boolean;
}

// Handle connection from game tabs
chrome.runtime.onConnect.addListener(
  capture((port) => {
    if (isGamePort(port)) {
      const sender = port.sender;
      logger.info("Game tab connected", sender);
      if (!sender) {
        logger.warn("gameTab port opened without a sender", port);
        return;
      }

      GameManager.instance.connect(port);
    }
  })
);

// Handle connection from the extension popup window
chrome.runtime.onMessage.addListener(
  capture((message: string, sender: unknown, sendResponse: (response: unknown) => void) => {
    logger.debug("Received runtime message", message, sender);

    switch (message) {
      case "getState":
        {
          logger.info("Retrieving game state with instance", GameManager.instance);

          const response = clone(GameManager.instance.state);
          logger.info("Sending game state", response);
          sendResponse(response);
        }
        break;
      case "startCalibration":
        {
          const localStore = useLocalStore();
          logger.info("Calibration started");
          if (localStore.broadcasterId) {
            const message = {
              type: "startCalibration",
              calibrationId: "x",
              inset: 0.2,
              existingBounds: {
                top: 0.3,
                right: 0.2,
                bottom: 0.5,
                left: 0.2,
              },
            };
            whisper(localStore.broadcasterId, `U${localStore.broadcasterId}`, message).catch((e) => {
              logger.error(e);
            });
          }
        }
        break;
      default: {
        logger.error("Expected runtime message, got", message);
      }
    }
  })
);

function updateBadge({ color, visible }: Badge) {
  chrome.action.setBadgeBackgroundColor({ color }).catch((e) => logger.error("Error setting badge color", e));
  if (undefined !== visible) {
    chrome.action
      .setBadgeText({ text: visible ? " " : "" })
      .catch((e) => logger.error("Error setting badge visibility", e));
  }
}

GameManager.instance.on(
  "port:connected",
  capture(() => updateBadge({ color: "green", visible: true }))
);
GameManager.instance.on(
  "port:waiting",
  capture(() => updateBadge({ color: "yellow" }))
);
GameManager.instance.on(
  "port:disconnected",
  capture(() => updateBadge({ color: "red", visible: false }))
);
