<script async setup lang="ts">
import { onMounted, ref } from "vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { decode } from "../chrome/twitch/sync";
import { ExtensionState, Script } from "../chrome/types/sotc";
import { Seat } from "../chrome/types/event";
import ScriptPanel from "./ScriptPanel.vue";
import GrimoirePanel from "./GrimoirePanel.vue";
import { delay } from "underscore";

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

const latency = ref<number>(0);

setInterval(() => {
  window.Twitch.ext.onContext((ctx) => {
    latency.value = ctx.hlsLatencyBroadcaster ?? 0;
  });
}, 1000);

const broadcastHandler = (
  target: string,
  contentType: string,
  rawMessage: string
) => {
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
        page.value = (message as SOTCPubSubUpdateStateMessage<"page">).payload;
        break;

      default:
        break;
    }
  }
};

window.Twitch.ext.listen("broadcast", (...args) => {
  delay(broadcastHandler, (0.15 + latency.value) * 1000, ...args);
});

const context = ref<object>({});

const script = ref<Script | undefined>(undefined);
const page = ref<string | undefined>(undefined);
const seats = ref<Seat[] | undefined>(undefined);

window.Twitch.ext.onContext((ctx) => {
  context.value = ctx;
});

onMounted(() => {
  window.Twitch.ext.configuration.onChanged(() => {
    if (Twitch.ext.configuration.broadcaster) {
      const content = Twitch.ext.configuration.broadcaster.content;
      const decompressed = decode(content) as Partial<ExtensionState>;
      logger.debug("Decompressed to", decompressed);
      script.value = decompressed.script;
      page.value = decompressed.page;
      seats.value = decompressed.seats;
    }
  });
});
</script>

<template>
  <main>
    <div class="latency" v-text="latency"></div>
    <GrimoirePanel class="panel-grimoire" :seats="seats"></GrimoirePanel>
    <ScriptPanel class="panel-script" :script="script"></ScriptPanel>
  </main>
</template>

<style lang="scss" scoped>
main {
  height: 100%;

  display: grid;
  grid-template-columns: 22% auto 23%;
  grid-template-rows: 1fr;
  grid-template-areas: ". grimoire script";
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}

.latency {
  position: absolute;
  background: white;
  color: black;
  padding: 10px;
  top: 10px;
  left: 10px;
  opacity: 0.3;
}

.panel-script {
  grid-area: script;
  background-color: rgba(242, 230, 243, 0.95);
  border: 2px solid rgb(76, 10, 71);
  padding: 0rem 1rem;
  margin: 13% 0 0 0;

  overflow: scroll;
}

.panel-grimoire {
  grid-area: grimoire;
  margin-top: -55px;
}
</style>
