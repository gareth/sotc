import { defineStore } from "pinia";
import { ExtensionState } from "../types/sotc";
import { ref, watch } from "vue";
import { TaggedLogger } from "../util/TaggedLogger";
import { clone } from "../util/clone";

const logger = new TaggedLogger("Estore");

const doWatch = (target: object) => {
  logger.debug("Watching", target);
  watch(
    target,
    (a) => {
      logger.info("Change detected", clone(a));
    },
    { deep: true }
  );
};

export default defineStore("extension", () => {
  const state = ref<Partial<ExtensionState>>({});

  doWatch(state);

  return { state };
});
