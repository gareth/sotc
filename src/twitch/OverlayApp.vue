<script async setup lang="ts">
import { ref } from "vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";

const logger = new TaggedLogger("OverlayApp");

const context = ref<object>({});

const config = ref<object | undefined>({});

window.Twitch.ext.onContext((ctx) => {
  context.value = ctx;
});

window.Twitch.ext.configuration.onChanged(() => {
  logger.info("Change detected");
  if (Twitch.ext.configuration.broadcaster) {
    config.value = JSON.parse(Twitch.ext.configuration.broadcaster.content);
  }
});

logger.info("Got initial config", config);
</script>

<template>
  <div class="overlay">
    <h1>Stream on the Clocktower</h1>
    <div>
      {{ context }}
    </div>
    <div>
      {{ config }}
    </div>
  </div>
</template>

<style scoped></style>
