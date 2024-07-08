<script async setup lang="ts">
import { ref } from "vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { decode } from "../chrome/twitch/sync";
import { ExtensionState } from "../chrome/types/sotc";

const logger = new TaggedLogger("OverlayApp");

const context = ref<object>({});

const config = ref<Partial<ExtensionState>>({});

window.Twitch.ext.onContext((ctx) => {
  context.value = ctx;
});

window.Twitch.ext.configuration.onChanged(() => {
  logger.info("Change detected");
  if (Twitch.ext.configuration.broadcaster) {
    const content = Twitch.ext.configuration.broadcaster.content;
    const decompressed = decode(content) as Partial<ExtensionState>;
    config.value = decompressed;
  }
});

logger.info("Got initial config", config);
</script>

<template>
  <div class="overlay">
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
  </div>
</template>

<style lang="scss" scoped></style>
