<script setup lang="ts">
import { computed, ref } from "vue";
import { Offsets, offsetsToBounds } from "../chrome/util/bounds";
import Calibrator from "./ClickCalibrator.vue";

import { TaggedLogger } from "../chrome/util/TaggedLogger";
const logger = new TaggedLogger("CalibratorPanel");

interface Props {
  key: string;
  inset: number;
  offsets: Offsets;
}

const props = defineProps<Props>();

// Refs to elements that we want to manipulate
const container = ref<HTMLElement | null>(null);

// Stores the (initial/updated) offsets in the format required
const offsets = ref<Offsets>(props.offsets);
const bounds = computed(() => {
  if (container.value) {
    const boundingBox = container.value.getBoundingClientRect();
    return offsetsToBounds(offsets.value, boundingBox);
  }
});

const handleOffsets = (e: Offsets) => {
  logger.info("Changing offsets", e);
};
</script>

<template>
  <div class="container" ref="container">
    <div class="buttons"><button>Reset</button><button>Save</button></div>
    <Calibrator
      class="calibrator"
      :calibrationId="props.key"
      :bounds="bounds"
      :inset="inset"
      :container="container"
      @set-offsets="handleOffsets"
      v-if="container && bounds"
    ></Calibrator>
  </div>
</template>

<style scoped lang="scss">
.buttons {
  position: absolute;
  display: none;
}

.container {
  display: grid;
}

.unwrapped {
  position: absolute;
  outline: 1px solid green;
}

.calibrator {
  display: grid;
}
</style>
