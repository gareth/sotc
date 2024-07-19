<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import {
  Bounds,
  boundsToOffsets,
  Offsets,
  offsetsToBounds,
} from "../chrome/util/bounds";
import Calibrator from "./ClickCalibrator.vue";

import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { round } from "../chrome/util/round";
const logger = new TaggedLogger("CalibratorPanel");

interface Props {
  calibrationId: string;
  inset: number;
  offsets: Offsets;
}

const props = defineProps<Props>();

// Refs to elements that we want to manipulate
const container = ref<HTMLElement | null>(null);
const boundsEl = ref<HTMLElement | null>(null);

// Stores the (initial/updated) offsets in the format required
const offsets = ref<Offsets>(props.offsets);
const bounds = computed(() => {
  if (container.value) {
    const boundingBox = container.value.getBoundingClientRect();
    return offsetsToBounds(offsets.value, boundingBox);
  }
});

const newOffsets = ref<Offsets | undefined>(props.offsets);
const configData = computed(() => {
  const data = newOffsets.value;

  if (data) {
    return [
      round(data.top, 4),
      round(data.right, 4),
      round(data.bottom, 4),
      round(data.left, 4),
    ];
  }
});

function selectConfig() {
  if (boundsEl.value) {
    logger.debug("Setting selection");
    const range = document.createRange();
    range.selectNodeContents(boundsEl.value);

    const selection = window.getSelection();
    selection?.empty();
    selection?.addRange(range);
  }
}

function handleBounds(newBounds: Bounds | undefined) {
  logger.info("Changing bounds", newBounds);

  if (newBounds && container.value) {
    newOffsets.value = boundsToOffsets(newBounds, container.value);
    nextTick(() => {
      selectConfig();
    });
  } else {
    newOffsets.value = undefined;
  }
}
</script>

<template>
  <div class="container" ref="container">
    <Calibrator
      class="calibrator"
      :calibrationId="props.calibrationId"
      :bounds="bounds"
      :inset="inset"
      :container="container"
      @set-bounds="handleBounds"
      v-if="container && bounds"
    ></Calibrator>
    <div class="config" v-if="configData" @click="selectConfig">
      <div class="display">
        <div
          class="bounds"
          ref="boundsEl"
          v-text="JSON.stringify(configData)"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: grid;
}

.config {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);

  .display {
    padding: 1em;
    background-color: white;
    text-align: center;
  }

  .bounds {
    font-family: monospace;

    &::before {
      content: "✅";
      padding-right: 0.5ex;
    }
  }
}

.calibrator {
  display: grid;
}
</style>
