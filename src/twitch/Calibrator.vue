<script setup lang="ts">
import { computed, nextTick, onMounted, ref, render } from "vue";
import {
  Bounds,
  boundsToOffsets,
  insetBoundsBy,
  invertInsetBoundsBy,
  Offsets,
  offsetsToBounds,
} from "../chrome/util/bounds";

import { TaggedLogger } from "../chrome/util/TaggedLogger";
import Draggable from "draggable";
import { throttle } from "underscore";
const logger = new TaggedLogger("Calibrator");

interface Props {
  container: HTMLElement;
  offsets: Offsets;
  inset: number;
}

const props = defineProps<Props>();

// Stores the (initial/updated) offsets in the format required
const offsets = ref<Offsets>(props.offsets);

const calibrator = ref<HTMLElement | undefined>(undefined);

const containerBounds = ref<Bounds>(props.container.getBoundingClientRect());
const bounds = computed(() =>
  offsetsToBounds(offsets.value, containerBounds.value)
);
const insetBounds = computed(() => insetBoundsBy(bounds.value, props.inset));

// Although we compute initial layout based on
// props.container.getBoundingClientRect(), its values are all zero while
// mounting, and don't reactively trigger an update when layout is complete.
// Even waiting for nextTick as suggested in some places online doesn't wait
// long enough (possibly because we're checking for something in the parent
// component?)
//
// So instead, we have to trigger at intervals until the width is finally
// non-zero and use that as the trigger. [vomit emoji]
onMounted(() => {
  const renderedDetector = () => {
    const rect = props.container.getBoundingClientRect();
    if (rect.width) {
      logger.info("Initial bounds determined as", rect);
      containerBounds.value = rect;
      logger.info("Initial outer bounds", bounds.value);
      clearInterval(renderedDetectorInterval);
    }
  };
  let renderedDetectorInterval = setInterval(renderedDetector, 10);
});

const boundsToStyle = (bounds: Bounds) => {
  const { x, y, width, height } = bounds;
  return mapToPixels({ left: x, top: y, width, height });
};

const mapToPixels = (object: Record<string, number>) =>
  Object.fromEntries(
    [...Object.entries(object)].map(([k, v]) => [k, `${v}px`])
  );

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
    }
  });
});

const setCalibrationBounds = (container: HTMLElement, element: HTMLElement) => {
  const innerBounds = element.getBoundingClientRect();
  const extrapolatedBounds = invertInsetBoundsBy(innerBounds, props.inset);

  offsets.value = boundsToOffsets(extrapolatedBounds, container);
  throttleLog("Setting", {
    offsets: offsets.value,
    innerBounds,
    extrapolatedBounds,
  });
};

const throttleLog = throttle(logger.info, 500);

onMounted(() => {
  const con = props.container;
  const cal = calibrator.value;
  if (cal) {
    logger.info("Observing", cal);
    observer.observe(cal);

    const handle = cal.querySelector(".move-handle");

    if (handle) {
      new Draggable(cal, {
        handle,
        onDrag: (el, x, y) => {
          setCalibrationBounds(con, cal);
        },
        onDragStart: (el, x, y) => {
          logger.debug("Dragging from", x, y);
        },
        onDragEnd: (el, x, y) => {
          logger.debug("Dragging to", x, y);
        },
      });
    }
  }
});
</script>

<template>
  <div class="ghost" :style="boundsToStyle(bounds)"></div>
  <div class="calibrator" :style="boundsToStyle(insetBounds)" ref="calibrator">
    <div class="move-handle"></div>
  </div>
</template>

<style lang="scss">
.ghost {
  position: absolute;
  background: purple;
  opacity: 0.1;
}
.calibrator {
  position: absolute;
  overflow: hidden;
  top: 0;
  left: 0;
  min-width: 150px;
  min-height: 150px;

  // The Draggable library tries to override this to `block` which breaks our
  // positioning
  display: grid !important;

  outline: 2px solid red;

  resize: horizontal;

  &::-moz-resizer {
    background: red;
  }

  &::-webkit-resizer {
    background: red;
  }

  .move-handle {
    cursor: move;
    margin: 20px;
  }
}
</style>
