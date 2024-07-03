import { createApp } from "vue";
import { createPinia } from "pinia";

// import "@/style.css";
import { TaggedLogger } from "./util/TaggedLogger";
import OptionsApp from "./OptionsApp.vue";

const logger = new TaggedLogger("Options");
logger.info("initialized");

const pinia = createPinia();
const app = createApp(OptionsApp, {});
app.use(pinia);
app.mount("#app");
