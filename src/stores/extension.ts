import { createPinia, defineStore } from "pinia";
import { ExtensionState } from "../types/sotc";
import { ref, watch } from "vue";
import { TaggedLogger } from "../util/TaggedLogger";
import { clone } from "../util/clone";
import useLocalStore from "../stores/local";
// import { synchronizeExtensionState } from "../twitch/sync";

const pinia = createPinia();
const localStore = useLocalStore(pinia);

const logger = new TaggedLogger("Estore");

const synchroniseState = async (newState: object) => {
  logger.info("Change detected", clone(newState), localStore.broadcasterId);
  if (localStore.broadcasterId) {
    logger.info("Synchronising extension state");
    return Promise.resolve();
    // await synchronizeExtensionState(localStore.broadcasterId, newState);
  }
};

export default defineStore("extension", () => {
  const state = ref<Partial<ExtensionState>>({});

  logger.debug("Watching", state);
  watch(state, synchroniseState, { deep: true });

  return { state };
});
