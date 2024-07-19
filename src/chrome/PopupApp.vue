<script async setup lang="ts">
import { computed, ref } from "vue";
import { TaggedLogger } from "./util/TaggedLogger";
import { ExtensionState } from "./types/sotc";
import { indexBy } from "underscore";

const props = defineProps<{ state: Partial<ExtensionState> }>();
const emit = defineEmits<{
  startCalibration: [];
}>();

const logger = new TaggedLogger("App");
const root = ref<HTMLElement | null>(null);

const activeScript = computed(() =>
  props.state.page == "Grimoire" ? props.state.script : undefined
);

const characters = computed(() => {
  if (props.state.script) {
    return indexBy(props.state.script.characters, (char) => char.id);
  }
});

const seats = computed(() => {
  return props.state.seats?.map((seat) => {
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
</script>

<template>
  <div class="popup" ref="root">
    <h1>Stream on the Clocktower</h1>
    <div class="buttons">
      <button @click="startCalibration">Calibrate</button>
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
