import { createApp } from "vue";
import "./overlay.scss";
import OverlayApp from "./OverlayApp.vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";

import * as Sentry from "@sentry/vue";
import { twitchExtensionDSN } from "../chrome/config/dsn";

const logger = new TaggedLogger("Overlay");
logger.info("initialized");

const app = createApp(OverlayApp);

Sentry.init({
  app,
  dsn: twitchExtensionDSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

app.mount("#app");
