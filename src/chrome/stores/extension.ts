import { createPinia, defineStore } from "pinia";
import { ExtensionState, Script } from "../types/sotc";
import { computed, ref, watch } from "vue";
import { TaggedLogger } from "../util/TaggedLogger";
import { clone } from "../util/clone";
import useLocalStore from "../stores/local";
import { broadcastBulkStateChange, synchronizeExtensionState } from "../twitch/sync";

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

export default defineStore("extension", () => {
  const script = ref<Script | undefined>(undefined);
  const page = ref<string | undefined>(undefined);
  const seats = ref<Seat[] | undefined>(undefined);
  const grim = ref<{ pos: Bounds; container: Bounds } | undefined>(undefined);
  const overlay = ref<{ pos: Offsets } | undefined>(undefined);

  const state = computed(() => ({
    script: script.value,
    page: page.value,
    seats: seats.value,
    grim: grim.value,
    overlay: overlay.value,
  }));

  const synchroniser = new BatchSynchroniser();

  const setState = (newState: Partial<ExtensionState>) => {
    script.value = newState.script;
    page.value = newState.page;
    seats.value = newState.seats;
    grim.value = newState.grim;
    overlay.value = newState.overlay;
  };

  logger.debug("Watching", state);
  watch(state, throttle(synchroniseState, 1000), { deep: true });

  watch(script, synchroniser.updater("script"), { deep: true });
  watch(seats, synchroniser.updater("seats"), { deep: true });
  watch(page, synchroniser.updater("page"), { deep: true });
  watch(grim, synchroniser.updater("grim"), { deep: true });
  watch(overlay, synchroniser.updater("overlay"), { deep: true });

  return { script, page, seats, grim, state, overlay, setState };
});

class BatchSynchroniser {
  diff: Partial<ExtensionState> = {};

  updater(key: keyof ExtensionState) {
    return this.update.bind(this, key);
  }

  async update<T extends keyof ExtensionState>(key: T, value: ExtensionState[T] | undefined) {
    logger.debug("Updating", key, value);
    if (undefined === value) {
      delete this.diff[key];
    } else {
      this.diff[key] = value;
    }
    await this.synchronise();
  }

  synchronise = throttle(async () => {
    if (localStore.broadcasterId) {
      const batch = clone(this.diff);
      this.diff = {};
      logger.info("Broadcasting extension state for keys", Object.keys(batch));
      await broadcastBulkStateChange(localStore.broadcasterId, batch);
    } else {
      logger.info("Not broadcasting - no authenticated user");
    }
  }, 1000 / 3);
}
