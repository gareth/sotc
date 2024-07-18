<script setup lang="ts">
import { computed, ref } from "vue";
import { Bounds, Offsets } from "../chrome/util/bounds";
import { TaggedLogger } from "../chrome/util/TaggedLogger";

const logger = new TaggedLogger("ClickCalibrator");

interface Props {
  container: HTMLElement;
  offsets: Offsets;
  inset: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  setOffsets: [offsets: Offsets];
}>();

interface Point {
  x: number;
  y: number;
}

type Handle = Point | undefined;

const targetAspectRatio = 1;

const aspectRatioTolerance = 10;
const aspectRatioFactor = 1 - 1 / aspectRatioTolerance;

const handles = ref<[Handle, Handle]>([undefined, undefined]);

const gradient = computed(() => {
  const [h1, h2] = handles.value;
  if (h1 && h2) {
    return (h1.y - h2.y) / (h1.x - h2.x);
  }
});

const area = computed(() => {
  const [h1, h2] = handles.value;
  if (h1 && h2) {
    return Math.abs((h1.y - h2.y) * (h1.x - h2.x));
  }
});

const bounds = computed<Bounds | undefined>(() => {
  const [h1, h2] = handles.value;
  if (h1 && h2) {
    return {
      x: Math.min(h1.x, h2.x),
      y: Math.min(h1.y, h2.y),
      width: Math.abs(h1.x - h2.x),
      height: Math.abs(h1.y - h2.y),
    };
  }
});

const validateBounds = computed(() => {
  if (undefined !== gradient.value && gradient.value < 0) {
    return "wrong orientation";
  }

  if (
    undefined !== gradient.value &&
    gradient.value < targetAspectRatio * aspectRatioFactor
  ) {
    return "too shallow";
  }

  if (
    undefined !== gradient.value &&
    gradient.value > targetAspectRatio / aspectRatioFactor
  ) {
    return "too steep";
  }

  return bounds.value;
});

const handleClick = (event: MouseEvent) => {
  logger.info("Click handled", event);

  handles.value.shift();
  handles.value.push({ x: event.clientX, y: event.clientY });
};

const mapToPixels = (object: Record<string, number>) =>
  Object.fromEntries(
    [...Object.entries(object)].map(([k, v]) => [k, `${v}px`])
  );
</script>

<template>
  <div class="container">
    <div class="target" @click="handleClick">
      <div class="details">
        {{ gradient }} / {{ area }} / {{ validateBounds }}
      </div>
      <div
        class="ghost"
        v-if="bounds"
        :style="mapToPixels({ ...bounds })"
      ></div>
      <div
        class="handle"
        v-for="handle in handles.filter(Boolean)"
        :style="handle && mapToPixels({ left: handle.x, top: handle.y })"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: grid;
}

.details {
  position: absolute;
  background-color: white;
}

.ghost {
  position: absolute;
  background: rgba(128, 0, 128, 0.1);
}

.target {
  background-color: rgba(128, 0, 0, 0.2);
}

.handle {
  position: absolute;
  width: 10px;
  height: 10px;
  margin: -5px;
  background: green;
  border-radius: 10px;
}
</style>
