<script async setup lang="ts">
import { computed, ref } from "vue";
import { TaggedLogger } from "./util/TaggedLogger";
import { ExtensionState } from "./types/sotc";
import { indexBy } from "underscore";
import { Seat, sotcEvent } from "./types/event";
import { parse } from "@babel/core";

const props = defineProps<{ state: Partial<ExtensionState> }>();
const emit = defineEmits<{
  startCalibration: [];
}>();

const logger = new TaggedLogger("App");
const root = ref<HTMLElement | null>(null);

const calibrationData = ref<string>("");

const activeScript = computed(() =>
  props.state.page == "Grimoire" ? props.state.script : undefined
);

const characters = computed(() => {
  if (props.state.script) {
    return indexBy(props.state.script.characters, (char) => char.id);
  }
});

const seats = computed(() => {
  return props.state.seats?.map((seat: Seat) => {
    return {
      pos: seat.pos,
      user: seat.user,
      role: characters.value?.[seat.role?.id!],
    };
  });
});

function startCalibration() {
  if (root.value) {
    logger.debug("Sending calibration request to", root.value);
    const event = new CustomEvent("startCalibration", { bubbles: true });
    root.value.dispatchEvent(event);
  }
}

function cancelCalibration() {
  if (root.value) {
    logger.debug("Cancelling calibration request to", root.value);
    const event = new CustomEvent("cancelCalibration", { bubbles: true });
    root.value.dispatchEvent(event);
  }
}

function saveCalibration() {
  if (root.value) {
    const parsedJSON = JSON.parse(calibrationData.value);
    if (parsedJSON instanceof Array) {
      const [top, right, bottom, left] = parsedJSON;
      if (
        typeof top == "number" &&
        typeof right == "number" &&
        typeof bottom == "number" &&
        typeof left == "number"
      ) {
        const offsets = { top, right, bottom, left };
        logger.debug("Sending calibration result to", root.value);
        const event = sotcEvent("sotc-overlayOffsets", {
          bubbles: true,
          detail: { offsets },
        });
        root.value.dispatchEvent(event);
      }
    }
  }
}
</script>

<template>
  <div class="popup" ref="root">
    <h1>Stream on the Clocktower</h1>
    <div class="calibration">
      <div class="div">
        <button @click="startCalibration">Calibrate</button>
        <button @click="cancelCalibration">Cancel</button>
      </div>
      <input v-model="calibrationData" /><button @click="saveCalibration">
        Save
      </button>
    </div>
    <details v-if="activeScript">
      <summary>{{ activeScript.name }}</summary>
      <span>by {{ activeScript.author }}</span>
      <ul>
        <li v-for="character in activeScript?.characters">
          {{ character.name }}
        </li>
      </ul>
    </details>
    <div v-else>Grimoire not visible on {{ state.page }} page</div>

    <details open v-if="props.state.seats">
      <summary>Seats ({{ state.seats?.length }})</summary>
      <ul>
        <li v-for="seat in seats">
          <div v-if="seat.role">
            <span>{{ seat.role.name }}</span>
            <span v-if="seat.user"> ({{ seat.user }})</span>
          </div>
          <div v-else class="empty">[empty]</div>
        </li>
      </ul>
    </details>
  </div>
</template>

<style scoped></style>
