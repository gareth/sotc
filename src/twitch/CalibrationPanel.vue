<script setup lang="ts">
import { ref } from "vue";
import { Bounds, Offsets } from "../chrome/util/bounds";
import Calibrator from "./Calibrator.vue";

import { TaggedLogger } from "../chrome/util/TaggedLogger";
const logger = new TaggedLogger("CalibratorPanel");

interface Props {
  inset: number;
  offsets: Offsets;
}

const props = withDefaults(defineProps<Props>(), {
  inset: 0.2,
  offsets: () => ({
    top: -0.002,
    right: 0.216931216931217,
    bottom: 0,
    left: 0.216931216931217,
  }),
});

// Refs to elements that we want to manipulate
const container = ref<HTMLElement | null>(null);

// Stores the (initial/updated) offsets in the format required
const offsets = ref<Offsets>(props.offsets);

const handleBounds = (e: Offsets) => {
  logger.info("Changing offsets", e);
};
</script>

<template>
  <div class="container" ref="container">
    <div class="buttons"><button>Reset</button><button>Save</button></div>
    <Calibrator
      :offsets="offsets"
      :inset="inset"
      :container="container"
      @set-bounds="handleBounds"
      v-if="container"
    ></Calibrator>
  </div>
</template>

<style scoped lang="scss">
.container {
  outline: 1px solid orange;
}

.unwrapped {
  position: absolute;
  outline: 1px solid green;
}
</style>
