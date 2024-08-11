// import { Game } from "./sotc/Game";
import { GameManager } from "./sotc/GameManager";
import { whisper } from "./twitch/sync";
import { TaggedLogger } from "../core/util/TaggedLogger";
import { clone } from "../core/util/clone";
import useLocalStore from "./stores/local";

import { capture } from "../core/util/sentry";
import { SOTCEventMessage } from "./types/event";
import { Offsets } from "../core/util/bounds";

const logger = new TaggedLogger("Worker");

logger.info("initialized");

type GamePort = chrome.runtime.Port & { name: "gameTab" };
const isGamePort = (port: chrome.runtime.Port): port is GamePort => port.name == "gameTab";

interface Badge {
  color: string;
  visible?: boolean;
}

const defaultOffsets: Offsets = {
  top: 0,
  right: 0.22,
  bottom: 0,
  left: 0.22,
};

const localStore = useLocalStore();

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
      if (localStore.overlay.pos) {
        GameManager.instance.overlay = { pos: localStore.overlay.pos };
      }
    }
  })
);

// Handle connection from the extension popup window
chrome.runtime.onMessage.addListener(
  capture(
    (
      message: string | SOTCEventMessage<"overlayOffsets">,
      sender: unknown,
      sendResponse: (response: unknown) => void
    ) => {
      logger.debug("Received runtime message", message, sender);

      if (typeof message == "string") {
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
              logger.info("Calibration requested");
              if (localStore.broadcasterId) {
                const message = {
                  type: "startCalibration",
                  calibrationId: crypto.randomUUID(),
                  inset: 0.2,
                  existingBounds: localStore.overlay.pos ?? defaultOffsets,
                };
                whisper(localStore.broadcasterId, `U${localStore.broadcasterId}`, message).catch((e) => {
                  logger.error(e);
                });
                GameManager.instance.startCalibration();
              }
            }
            break;
          case "endCalibration":
            {
              logger.info("Calibration ending");
              if (localStore.broadcasterId) {
                const message = {
                  type: "endCalibration",
                  calibrationId: crypto.randomUUID(),
                };
                whisper(localStore.broadcasterId, `U${localStore.broadcasterId}`, message).catch((e) => {
                  logger.error(e);
                });
                GameManager.instance.endCalibration();
              }
            }
            break;
          default: {
            logger.error("Expected runtime message, got", message);
          }
        }
      } else {
        switch (message.type) {
          case "overlayOffsets":
            {
              logger.info("Calibration saving", message.payload);
              localStore.overlay.pos = message.payload.offsets;
              GameManager.instance.overlay = { pos: message.payload.offsets };
            }
            break;

          default:
            break;
        }
      }
    }
  )
);

function updateBadge({ color, visible }: Badge) {
  chrome.action.setBadgeBackgroundColor({ color }).catch((e) => logger.error("Error setting badge color", e));
  chrome.action.setBadgeTextColor({ color }).catch((e) => logger.error("Error setting badge text color", e));
  if (undefined !== visible) {
    chrome.action
      .setBadgeText({ text: visible ? "-" : "" })
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
