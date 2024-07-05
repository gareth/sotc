import { createApp } from "vue";
import { createPinia } from "pinia";

// import "@/style.css";
import { TaggedLogger } from "./util/TaggedLogger";
import OptionsApp from "./OptionsApp.vue";

const logger = new TaggedLogger("Options");
logger.info("initialized");

const ownerId = "59942572";
import clientId from "../config/client_id";
import secret from "../config/secret";

const pinia = createPinia();
const app = createApp(OptionsApp, {
  ownerId,
  clientId,
  secret,
});
app.use(pinia);
app.mount("#app");
