<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  Bounds,
  insetBoundsBy,
  invertInsetBoundsBy,
  mapToPixels,
  Offsets,
} from "../chrome/util/bounds";
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { round } from "../chrome/util/round";
import { isEqual } from "underscore";

const logger = new TaggedLogger("ClickCalibrator");

interface Props {
  calibrationId: string;
  container: HTMLElement;
  bounds: Bounds;
  inset: number;
}

type BoundsError = "missing" | "orientation" | "steep" | "shallow" | "small";

const errorMessages = {
  missing: "Select 2 distinct points",
  orientation: "Points need to be top-left/bottom-right",
  steep: "Bounds are not square: too steep",
  shallow: "Bounds are not square: too shallow",
  small: "Bounds are too small",
};

const props = defineProps<Props>();

const emit = defineEmits<{
  setBounds: [bounds: Bounds | undefined];
}>();

interface Point {
  left: number;
  top: number;
}

type Handle = Point | undefined;

const targetAspectRatio = 1;

const aspectRatioTolerance = 10;
const aspectRatioFactor = 1 - 1 / aspectRatioTolerance;
const handles = ref<[Handle, Handle]>(handlesFromBounds(props.bounds));

watch(
  { bounds: props.bounds, id: props.calibrationId },
  ({ bounds, id: _id }) => {
    handles.value = handlesFromBounds(bounds);
  }
);

function handlesFromBounds(bounds: Bounds): [Handle, Handle] {
  const handleBounds = insetBoundsBy(bounds, props.inset);
  return [
    { left: handleBounds.left, top: handleBounds.top },
    {
      left: handleBounds.left + handleBounds.width,
      top: handleBounds.top + handleBounds.height,
    },
  ];
}

const gradient = computed(() => {
  const [h1, h2] = handles.value;
  if (h1 && h2 && !isEqual(h1, h2)) {
    return (h1.top - h2.top) / (h1.left - h2.left);
  }
});

const area = computed(() => {
  const [h1, h2] = handles.value;
  if (h1 && h2 && !isEqual(h1, h2)) {
    return Math.abs((h1.top - h2.top) * (h1.left - h2.left));
  }
});

const bounds = computed<Bounds | undefined>(() => {
  const [h1, h2] = handles.value;
  if (h1 && h2) {
    return {
      left: Math.min(h1.left, h2.left),
      top: Math.min(h1.top, h2.top),
      width: Math.abs(h1.left - h2.left),
      height: Math.abs(h1.top - h2.top),
    };
  }
});

const validBounds = computed(() => {
  if (!boundsError.value) return bounds.value;
});

const invertedInsetValidBounds = computed(() => {
  if (validBounds.value)
    return invertInsetBoundsBy(validBounds.value, props.inset);
});

const boundsError = computed<false | BoundsError>(() => {
  if (undefined == gradient.value) return "missing";
  if (gradient.value < 0) return "orientation";
  if (gradient.value < targetAspectRatio * aspectRatioFactor) return "shallow";
  if (gradient.value > targetAspectRatio / aspectRatioFactor) return "steep";
  if (area.value && area.value < 150 * 150) return "small";

  return false;
});

const handleStyle = (handle: Handle, bounds: Bounds | undefined) => {
  let style = {};
  if (bounds) {
    style = Object.assign(style, { backgroundColor: "green" });
  }
  if (handle) {
    style = Object.assign(
      style,
      mapToPixels({ left: handle.left, top: handle.top })
    );
  }
  return style;
};

const processClick = (event: MouseEvent) => {
  handles.value.shift();
  handles.value.push({ left: event.clientX, top: event.clientY });
  emit("setBounds", invertedInsetValidBounds.value);
};
</script>

<template>
  <div class="container">
    <div class="target" @click="processClick">
      <div class="error" v-if="boundsError">
        <span>⚠️ {{ errorMessages[boundsError] }}</span>
      </div>
      <div
        class="ghost"
        v-if="invertedInsetValidBounds"
        :style="mapToPixels({ ...invertedInsetValidBounds })"
      ></div>
      <div
        class="handle"
        v-for="handle in handles.filter(Boolean)"
        :style="handle && handleStyle(handle, validBounds)"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: grid;
}

.error {
  position: absolute;
  display: grid;
  place-items: center;
  opacity: 0.7;

  pointer-events: none;

  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  span {
    background-color: white;
    padding: 1em;
  }
}

.ghost {
  position: absolute;
  background: rgba(128, 0, 128, 0.1);
}

.target {
  background-color: transparent;
}

.handle {
  position: absolute;
  width: 10px;
  height: 10px;
  margin: -5px;
  background: red;
  border-radius: 10px;
}
</style>
