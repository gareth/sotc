import { createApp } from "vue";
// import "@/style.css";
import PopupApp from "./PopupApp.vue";
import { ExtensionState } from "./types/sotc";
import { TaggedLogger } from "./util/TaggedLogger";
import { Offsets } from "./util/bounds";

const logger = new TaggedLogger("Popup");
logger.info("initialized");

function handleOverlayOffsets(event: CustomEvent) {
  switch (event.type) {
    case "sotc-overlayOffsets":
      {
        const payload = event.detail as { offsets: Offsets };
        logger.debug("Was sotc-overlayOffsets", payload);
        void chrome.runtime.sendMessage({ type: "sotc-overlayOffsets", payload });
      }
      break;
    default:
      break;
  }
}

logger.debug("Loading game from worker");
chrome.runtime
  .sendMessage("getState")
  .then((state: Partial<ExtensionState>) => {
    logger.debug("Loaded state from worker", state);

    const container = document.getElementById("app");
    if (container) {
      createApp(PopupApp, { state }).mount(container);
      container.addEventListener("startCalibration", () => {
        void chrome.runtime.sendMessage("startCalibration");
      });
      container.addEventListener("cancelCalibration", () => {
        void chrome.runtime.sendMessage("endCalibration");
      });
      container.addEventListener("sotc-overlayOffsets", (event: Event) => {
        if (event instanceof CustomEvent) {
          handleOverlayOffsets(event);
          void chrome.runtime.sendMessage("endCalibration");
        }
      });
    }
  })
  .catch((e) => {
    logger.error("Error sending message to worker", e);
  });
