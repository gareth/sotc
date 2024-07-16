<script setup lang="ts">
import { onMounted, ref } from "vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import Draggable from "draggable";
import { Bounds } from "../chrome/types/sotc";
import { round } from "../chrome/util/round";
import { throttle } from "underscore";

const logger = new TaggedLogger("Calibrator");

interface Dimensions {
  width: number;
  height: number;
}

const props = defineProps({
  inset: { type: Number, required: true },
});

const dimensions = ref<Dimensions | null>(null);

const observer = new ResizeObserver((events) => {
  events.forEach((event) => {
    const target = event.target;
    const parent = target.parentElement;
    if (target instanceof HTMLElement && parent) {
      const { width } = event.contentRect;
      const currentHeight = target.clientHeight;
      if (Math.abs(width - currentHeight) > 1) {
        requestAnimationFrame(() => {
          target.style.height = `${width}px`;
          setCalibrationBounds(parent, target);
        });
      }
      dimensions.value = {
        width: Math.round(width),
        height: Math.round(width),
      };
    }
  });
});

const container = ref<HTMLElement | null>(null);
const calibrator = ref<HTMLElement | null>(null);

const bounds = ref<Bounds | null>();

const logBoundsChange = throttle((bounds: Bounds) => {
  logger.info("Setting bounds", bounds);
}, 500);

const setCalibrationBounds = (container: HTMLElement, element: HTMLElement) => {
  const outerBounds = container.getBoundingClientRect();
  const innerBounds = element.getBoundingClientRect();

  const calibratorBounds = {
    x: (innerBounds.x - outerBounds.x) / outerBounds.width,
    y: (innerBounds.y - outerBounds.y) / outerBounds.height,
    width: innerBounds.width / outerBounds.width,
    height: innerBounds.height / outerBounds.height,
  };

  // Compensate for the inset value, which is the percentage taken off of the
  // original container.
  const ratio = 1 - 2 * props.inset;

  const width = calibratorBounds.width / ratio;
  const height = calibratorBounds.height / ratio;

  bounds.value = {
    x: round(calibratorBounds.x - width * ((1 - ratio) / 2), 4),
    y: round(calibratorBounds.y - width * ((1 - ratio) / 2), 4),
    width: round(width, 4),
    height: round(height, 4),
  };

  logBoundsChange(bounds.value);
};

onMounted(() => {
  const con = container.value;
  const cal = calibrator.value;
  if (con && cal) {
    logger.info("Observing", cal);
    observer.observe(cal);

    const handle = cal.querySelector(".move-handle");

    if (handle) {
      new Draggable(cal, {
        handle,
        limit: document.body,
        onDrag: (el, x, y) => {
          setCalibrationBounds(con, cal);
        },
      });
    }
  }
});
</script>

<template>
  <div class="container" ref="container">
    {{ bounds }}
    <div class="calibrator" ref="calibrator">
      <div class="move-handle"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  outline: 1px solid orange;
}

.calibrator {
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  min-width: 150px;
  min-height: 150px;

  padding: 20px;
  // The Draggable library tries to override this to `block` which breaks our
  // positioning
  display: grid !important;

  border: 2px solid red;

  resize: horizontal;

  &::-moz-resizer {
    background: red;
  }

  &::-webkit-resizer {
    background: red;
  }

  .move-handle {
    cursor: move;
  }
}
</style>
