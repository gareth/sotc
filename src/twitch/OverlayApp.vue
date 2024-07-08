<script async setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { decode } from "../chrome/twitch/sync";
import { ExtensionState, Script } from "../chrome/types/sotc";
import { Seat } from "../chrome/types/event";
import Game from "./Game.vue";

const logger = new TaggedLogger("OverlayApp");

const context = ref<object>({});

const script = ref<Script | undefined>(undefined);
const page = ref<string | undefined>(undefined);
const seats = ref<Seat[] | undefined>(undefined);

const config = computed(() => {
  if (script.value && page.value && seats.value) {
    return {
      script: script.value,
      page: page.value,
      seats: seats.value,
    };
  } else {
    return;
  }
});

window.Twitch.ext.onContext((ctx) => {
  context.value = ctx;
});

onMounted(() => {
  window.Twitch.ext.configuration.onChanged(() => {
    if (Twitch.ext.configuration.broadcaster) {
      const content = Twitch.ext.configuration.broadcaster.content;
      const decompressed = decode(content) as Partial<ExtensionState>;
      script.value = decompressed.script;
      page.value = decompressed.page;
      seats.value = decompressed.seats;
    }
  });
});
</script>

<template>
  <div class="overlay">
    <Game v-if="config" v-bind="config">1</Game>
  </div>
</template>

<style lang="scss" scoped></style>
