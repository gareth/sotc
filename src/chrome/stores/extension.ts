import { createPinia, defineStore } from "pinia";
import { ExtensionState, Script } from "../types/sotc";
import { computed, ref, watch } from "vue";
import { TaggedLogger } from "../util/TaggedLogger";
import { clone } from "../util/clone";
import useLocalStore from "../stores/local";
import { broadcastStateChange, synchronizeExtensionState } from "../twitch/sync";

import { throttle } from "underscore";
import { Seat } from "../types/event";
import { Bounds, Offsets } from "../util/bounds";

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

const broadcastState = <T extends object>(key: string) => {
  return async (newState: T) => {
    if (localStore.broadcasterId) {
      logger.info("Broadcasting extension state for", key);
      await broadcastStateChange(localStore.broadcasterId, key, newState);
    } else {
      logger.info("Not broadcasting - no authenticated user");
    }
  };
};

export default defineStore("extension", () => {
  const script = ref<Script | undefined>(undefined);
  const page = ref<string | undefined>(undefined);
  const seats = ref<Seat[] | undefined>(undefined);
  const grim = ref<{ pos: Bounds } | undefined>(undefined);
  const overlay = ref<{ pos: Offsets } | undefined>(undefined);

  const state = computed(() => ({
    script: script.value,
    page: page.value,
    seats: seats.value,
    grim: grim.value,
    overlay: overlay.value,
  }));

  const setState = (newState: Partial<ExtensionState>) => {
    script.value = newState.script;
    page.value = newState.page;
    seats.value = newState.seats;
    grim.value = newState.grim;
    overlay.value = newState.overlay;
  };

  logger.debug("Watching", state);
  watch(state, throttle(synchroniseState, 1000), { deep: true });

  watch(script, throttle(broadcastState("script"), 1000), { deep: true });
  watch(seats, throttle(broadcastState("seats"), 1000), { deep: true });
  watch(page, throttle(broadcastState("page"), 1000), { deep: true });
  watch(grim, throttle(broadcastState("grim"), 1000), { deep: true });
  watch(overlay, throttle(broadcastState("overlay"), 1000), { deep: true });

  return { script, page, seats, grim, state, overlay, setState };
});
