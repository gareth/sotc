import { createApp } from "vue";
// import "@/style.css";
import PopupApp from "./PopupApp.vue";
import { ExtensionState } from "./types/sotc";
import { TaggedLogger } from "./util/TaggedLogger";

const logger = new TaggedLogger("Popup");
logger.info("initialized");

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
    }
  })
  .catch((e) => {
    logger.error("Error sending message to worker", e);
  });
