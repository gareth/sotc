import { createApp } from "vue";
// import "@/style.css";
import PopupApp from "./PopupApp.vue";
import { RuntimeMessageType } from "./types/messages";
import { TaggedLogger } from "./util/TaggedLogger";

const logger = new TaggedLogger("Popup");
logger.info("initialized");

logger.debug("Loading game from worker");
chrome.runtime
  .sendMessage({
    type: RuntimeMessageType.GET_GAME_STATE,
  })
  .then((game) => {
    logger.debug("Loaded game from worker", game);

    createApp(PopupApp, { game }).mount("#app");
  })
  .catch((e) => {
    logger.error("Error sending message to worker", e);
  });
