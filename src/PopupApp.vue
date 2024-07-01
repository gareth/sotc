<script async setup lang="ts">
import { computed } from "vue";
import { TaggedLogger } from "./util/TaggedLogger";
import { ExtensionState } from "./types/sotc";

const props = defineProps<{ state: Partial<ExtensionState> }>();

const logger = new TaggedLogger("App");

const activeScript = computed(() =>
  props.state.page == "Grimoire" ? props.state.script : undefined
);
</script>

<template>
  <div class="popup">
    <h1>Stream on the Clocktower</h1>
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
  </div>
</template>

<style scoped></style>
