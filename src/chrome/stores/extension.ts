import { createPinia, defineStore } from "pinia";
import { ExtensionState, Script } from "../types/sotc";
import { computed, ref, watch } from "vue";
import { TaggedLogger } from "../util/TaggedLogger";
import { clone } from "../util/clone";
import useLocalStore from "../stores/local";
import { synchronizeExtensionState } from "../twitch/sync";

import { throttle } from "underscore";
import { Seat } from "../types/event";

const pinia = createPinia();
const localStore = useLocalStore(pinia);

const logger = new TaggedLogger("Estore");

const synchroniseState = async (newState: object) => {
  logger.info("Change detected", clone(newState), localStore.broadcasterId);
  if (localStore.broadcasterId) {
    logger.info("Synchronising extension state");
    await synchronizeExtensionState(localStore.broadcasterId, newState);
  } else {
    logger.info("Not synchronising - no authenticated user");
  }
};

export default defineStore("extension", () => {
  const script = ref<Script | undefined>(undefined);
  const page = ref<string | undefined>(undefined);
  const seats = ref<Seat[] | undefined>(undefined);

  const state = computed(() => ({
    script: script.value,
    page: page.value,
    seats: seats.value,
  }));

  const setState = (newState: Partial<ExtensionState>) => {
    script.value = newState.script;
    page.value = newState.page;
    seats.value = newState.seats;
  };

  logger.debug("Watching", state);
  watch(state, throttle(synchroniseState, 1000), { deep: true });

  return { script, page, seats, state, setState };
});
