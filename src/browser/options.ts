import { createApp } from "vue";
import { createPinia } from "pinia";

import "./global.scss";
import { TaggedLogger } from "../core/util/TaggedLogger";
import OptionsApp from "./OptionsApp.vue";

const logger = new TaggedLogger("Options");
logger.info("initialized");

import ownerId from "../core/config/owner_id";
import clientId from "../core/config/client_id";
import secret from "../core/config/secret";

const pinia = createPinia();
const app = createApp(OptionsApp, {
  ownerId,
  broadcasterId: ownerId,
  clientId,
  secret,
});
app.use(pinia);
app.mount("#app");
