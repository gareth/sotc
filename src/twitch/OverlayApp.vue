<script async setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { decode } from "../chrome/twitch/sync";
import { ExtensionState, Script } from "../chrome/types/sotc";
import { Seat } from "../chrome/types/event";
import Game from "./Game.vue";

// import * as jose from "jose";

interface SOTCPubSubMessage {
  type: string;
  key: string;
}

interface SOTCPubSubUpdateStateMessage<T extends keyof ExtensionState> {
  type: "updateState";
  key: T;
  payload: ExtensionState[T];
}

const logger = new TaggedLogger("OverlayApp");

window.Twitch.ext.onAuthorized((auth) => {
  // const helix = jose.decodeJwt(auth.helixToken);
  // const id = jose.decodeJwt(auth.token);
  // logger.debug({ auth, helix, id });

  window.Twitch.ext.listen("broadcast", (target, contentType, rawMessage) => {
    logger.debug("Received broadcast message", target, contentType, rawMessage);
    const message = decode(rawMessage) as SOTCPubSubMessage;
    logger.debug("Decoded, this is", message);

    if (message.type == "updateState") {
      switch (message.key) {
        case "script":
          script.value = (
            message as SOTCPubSubUpdateStateMessage<"script">
          ).payload;
          break;

        case "seats":
          seats.value = (
            message as SOTCPubSubUpdateStateMessage<"seats">
          ).payload;
          break;

        case "page":
          page.value = (
            message as SOTCPubSubUpdateStateMessage<"page">
          ).payload;
          break;

        default:
          break;
      }
    }
  });
});

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
    <Game v-if="config && config.page == `Grimoire`" v-bind="config"></Game>
  </div>
</template>

<style lang="scss" scoped></style>
