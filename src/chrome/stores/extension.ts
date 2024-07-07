import { createPinia, defineStore } from "pinia";
import { ExtensionState } from "../types/sotc";
import { ref, watch } from "vue";
import { TaggedLogger } from "../util/TaggedLogger";
import { clone } from "../util/clone";
import useLocalStore from "../stores/local";
import { synchronizeExtensionState } from "../twitch/sync";

import { throttle } from "underscore";

const pinia = createPinia();
const localStore = useLocalStore(pinia);

const logger = new TaggedLogger("Estore");

const synchroniseState = async (newState: object) => {
  logger.info("Change detected", clone(newState), localStore.broadcasterId);
  if (localStore.broadcasterId) {
    logger.info("Synchronising extension state");
    // return Promise.resolve();
    const returnData = (await synchronizeExtensionState(localStore.broadcasterId, newState)) as { content: string };
    logger.info("Confirmed data", JSON.parse(returnData.content));
  } else {
    logger.info("Not synchronising - no authenticated user");
  }
};

export default defineStore("extension", () => {
  const state = ref<Partial<ExtensionState>>({});

  logger.debug("Watching", state);
  watch(state, throttle(synchroniseState, 1000), { deep: true });

  return { state };
});
