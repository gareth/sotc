import { createApp } from "vue";
import "./config.scss";
import ConfigApp from "./ConfigApp.vue";
import { TaggedLogger } from "../core/util/TaggedLogger";

const logger = new TaggedLogger("Config");
logger.info("initialized");

const app = createApp(ConfigApp);

app.mount("#app");
