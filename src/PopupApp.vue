<script async setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Ref } from "vue";
import { Game } from "./sotc/Game";
import { TaggedLogger } from "./util/TaggedLogger";
import { RuntimeMessageType } from "./types/messages";

const props = defineProps<{ game: Game | undefined }>();

const logger = new TaggedLogger("App");

onMounted(async () => {
  logger.debug("Loading game from worker");
  activeGame.value = await chrome.runtime.sendMessage({
    type: RuntimeMessageType.GET_GAME_STATE,
  });
  logger.debug("Loaded game from worker", activeGame.value);
});

const activeGame: Ref<Game | undefined> = ref(
  props.game || new Game({ name: "Hello", author: "Author", characters: [] })
);

const gameState = computed(() => JSON.stringify(activeGame.value));
</script>

<template>
  <div v-text="gameState"></div>
</template>

<style scoped></style>
