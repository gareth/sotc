import { createApp } from "vue";
// import "@/style.css";
import { TaggedLogger } from "./util/TaggedLogger";
import OptionsApp from "./OptionsApp.vue";

const logger = new TaggedLogger("Options");
logger.info("initialized");

createApp(OptionsApp, {}).mount("#app");
