import { createApp } from "vue";
// import "@/style.css";
import OverlayApp from "./OverlayApp.vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";

const logger = new TaggedLogger("Overlay");
logger.info("initialized");

createApp(OverlayApp).mount("#app");
