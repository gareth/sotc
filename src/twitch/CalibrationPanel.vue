<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";

const logger = new TaggedLogger("Calibrator");

interface Dimensions {
  width: number;
  height: number;
}

const dimensions = ref<Dimensions | null>(null);

const observer = new ResizeObserver((events) => {
  events.forEach((event) => {
    const target = event.target;
    if (target instanceof HTMLElement) {
      const { width } = event.contentRect;
      const currentHeight = target.clientHeight;
      if (Math.abs(width - currentHeight) > 1) {
        requestAnimationFrame(() => {
          target.style.height = `${width}px`;
        });
      }
      dimensions.value = {
        width: Math.round(width),
        height: Math.round(width),
      };
    }
  });
});

const calibrator = ref<HTMLElement | null>(null);

onMounted(() => {
  if (calibrator.value) {
    logger.info("Observing", calibrator.value);
    observer.observe(calibrator.value);
  }
});
</script>

<template>
  <div class="container">
    {{ dimensions }}
    <div class="calibrator" draggable="true" ref="calibrator"></div>
  </div>
</template>

<style scoped lang="scss">
.calibrator {
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  min-width: 50px;
  min-height: 50px;

  border: 2px solid red;

  cursor: move;
  resize: horizontal;

  &::-moz-resizer {
    background: red;
  }

  &::-webkit-resizer {
    background: red;
  }
}
</style>
