/**
 * Stream on the Clocktower extension content script.
 *
 * This code runs in the context of every matching URL in the "content_scripts"
 * section of the extension's manifest.json.
 *
 * It runs in an "isolated world" meaning that although it can access the page's
 * DOM, it doesn't have access to variables in the page's global context. It
 * also doesn't have access to any DOM properties that are set in that context.
 * This includes the Vue objects that we want to monitor as part of the
 * extension.
 *
 * However by injecting a <script> tag into the host DOM, *that* script has
 * access to the host variables, and can inspect the data we need.
 *
 * Even though they're run in different contexts, both scripts can create and
 * detect DOM events. That gives us a way to communicate between the two
 * contexts. Unfortunately because of the "isolated world" model, it's not
 * possible to pass any variables with DOM references this way - any protected
 * references you pass this way will become `null` when received at the other
 * end.
 *
 * To receive data from the injected script, we listen for these DOM CustomEvent
 * objects which contain sanitised data in the `detail` property.
 *
 * To pass that data on to the worker script, we use a Port obejct from the
 * Chrome extension API (`chrome.runtime`) which we can pass JSON objects to and
 * they will be distributed to any other port listeners.
 */

import { sotcEvent, SOTCEvent } from "./types/event";
import { TaggedLogger } from "../core/util/TaggedLogger";

const logger = new TaggedLogger("Content");
logger.info("initialized");

let port: chrome.runtime.Port;
const connectPort = () => {
  port = chrome.runtime.connect({ name: "gameTab" });
  console.info("Connected port", port);

  // Keep the port alive before the 30 second idle timeout
  setInterval(() => {
    try {
      port.postMessage("ping");
    } catch (e) {
      logger.info("Ping failed", e);
    }
  }, 25000);

  // Reconnect on fail
  port.onDisconnect.addListener(() => {
    connectPort();
  });

  port.onMessage.addListener((message) => {
    logger.debug("Message received", message);
    if (typeof message == "object" && "type" in message) {
      switch ((message as { type: string }).type) {
        case "startCalibration":
          {
            const event = sotcEvent("sotc-startCalibration", {});
            logger.debug("Dispatching", event);
            dispatchEvent(event);
          }
          break;

        case "endCalibration":
          {
            const event = sotcEvent("sotc-endCalibration", {});
            logger.debug("Dispatching", event);
            dispatchEvent(event);
          }
          break;

        default:
          break;
      }
    }
  });
};
connectPort();

// Listen for a DOM CustomEvent of name `eventName` (generated by the injected
// script) and relay it to the extension worker script as a JSON message. The
// CustomEvent's `detail` property is passed as the `payload` value of the JSON
// message, passed through the `callback` function if present.
export function relay<T extends keyof SOTCEvent>(eventName: T) {
  document.addEventListener(eventName, (e) => {
    if (e instanceof CustomEvent) {
      const detail = e.detail as unknown;
      logger.info("Relaying event", eventName, detail, port);

      try {
        port.postMessage({
          type: eventName,
          payload: detail,
        });
      } catch (error) {
        if (error instanceof Error && error.message == "Extension context invalidated") {
          logger.warn("Extension has been updated, refreshing to inject updated content");
          window.location.reload();
        }
      }
    }
  });
}

const output = document.createElement("div");
output.classList.add("sotc--debug-output");
document.documentElement.appendChild(output);

function injectScript() {
  const script = document.createElement("script");
  const runtimeUrl = chrome.runtime.getURL("inject.js");
  logger.debug("Injecting Vue monitor script", runtimeUrl);
  script.src = runtimeUrl;

  relay("sotc-navigate");
  relay("sotc-scriptChanged");
  relay("sotc-playersChanged");
  relay("sotc-size");
  relay("sotc-overlayOffsets");

  (document.head || document.documentElement).appendChild(script);
}

injectScript();
