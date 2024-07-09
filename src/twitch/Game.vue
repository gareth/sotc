<script setup lang="ts">
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { computed } from "vue";
import { ExtensionState, Script } from "../chrome/types/sotc";
import { Seat } from "../chrome/types/event";

const logger = new TaggedLogger("OverlayApp");

interface Props {
  script: Script;
  page: string;
  seats: Seat[];
}

const props = defineProps<Props>();

const config = computed(() => ({
  script: props.script,
  page: props.page,
  seats: props.seats,
}));
</script>

<template>
  <h1>Stream on the Clocktower</h1>
  <details v-if="config.script">
    <summary v-text="config.script.name"></summary>
    <div>by {{ config.script.author }}</div>
    <ul>
      <li v-for="role in config.script.characters" v-text="role.name"></li>
    </ul>
  </details>
  <details open v-if="config.seats?.length">
    <summary>Seats ({{ config.seats?.length }})</summary>
    <ul>
      <li v-for="player in config.seats">
        <span v-if="player.user">{{ player.user }} </span>
        <span v-else class="empty">[empty] </span>
        <span v-if="player.role"> ({{ player.role?.name }})</span>
      </li>
    </ul>
  </details>
</template>

<style scoped lang="scss">
h1 {
  font-size: 1.2em;
}
</style>
