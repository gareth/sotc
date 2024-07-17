<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Bounds, Offsets } from "../chrome/util/bounds";
import Draggable from "draggable";
import { throttle } from "underscore";
import Calibrator from "./Calibrator.vue";

import { TaggedLogger } from "../chrome/util/TaggedLogger";
const logger = new TaggedLogger("Calibrator");

interface Props {
  inset: number;
  offsets: Offsets;
}

const props = withDefaults(defineProps<Props>(), {
  inset: 0.15,
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

// const observer = new ResizeObserver((events) => {
//   events.forEach((event) => {
//     const target = event.target;
//     const parent = target.parentElement;
//     if (target instanceof HTMLElement && parent) {
//       const { width } = event.contentRect;
//       const currentHeight = target.clientHeight;
//       if (Math.abs(width - currentHeight) > 1) {
//         requestAnimationFrame(() => {
//           target.style.height = `${width}px`;
//           // setCalibrationBounds(parent, target);
//         });
//       }
//     }
//   });
// });
</script>

<template>
  <div class="container" ref="container">
    <!-- {{ props.offsets }}
    {{ calibratorBounds }}
    <div
      v-if="unwrappedBounds"
      class="unwrapped"
      :style="mapToPixels({ ...unwrappedBounds })"
    ></div>
    <div class="output">
      {{ mapToPixels({ ...unwrappedBounds }) }}
    </div> -->
    <Calibrator
      :offsets="offsets"
      :inset="inset"
      :container="container"
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
