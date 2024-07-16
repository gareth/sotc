<script async setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { decode } from "../chrome/twitch/sync";
import { Bounds, ExtensionState, Script } from "../chrome/types/sotc";
import { Seat } from "../chrome/types/event";
import ScriptPanel from "./ScriptPanel.vue";
import GrimoirePanel from "./GrimoirePanel.vue";
import CalibrationPanel from "./CalibrationPanel.vue";
import { delay } from "underscore";

interface Point {
  x: number;
  y: number;
}

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

      case "grim":
        grim.value = (message as SOTCPubSubUpdateStateMessage<"grim">).payload;
        break;

      default:
        break;
    }
  }
};

window.Twitch.ext.listen("broadcast", (...args) => {
  delay(broadcastHandler, latency.value * 1000, ...args);
});

const script = ref<Script | undefined>(undefined);
const page = ref<string | undefined>(undefined);
const seats = ref<Seat[] | undefined>(undefined);
const grim = ref<{ pos: Bounds; container: Bounds } | undefined>(undefined);

// Sample grim offset
const grimOffset = ref<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>({
  top: -0.002,
  right: 0.216931216931217,
  bottom: 0,
  left: 0.216931216931217,
});

// onMounted(() => {
window.Twitch.ext.configuration.onChanged(() => {
  if (Twitch.ext.configuration.broadcaster) {
    const content = Twitch.ext.configuration.broadcaster.content;
    const decompressed = decode(content) as Partial<ExtensionState>;
    logger.debug("Decompressed to", decompressed);
    script.value = decompressed.script;
    page.value = decompressed.page;
    seats.value = decompressed.seats;
    grim.value = decompressed.grim;
  }
});
// });
</script>

<template>
  <main>
    <div class="details">
      <div class="latency" v-text="latency"></div>
    </div>
    <GrimoirePanel
      class="panel-grimoire"
      :seats="seats"
      :offset="grimOffset"
    ></GrimoirePanel>
    <ScriptPanel class="panel-script" :script="script"></ScriptPanel>
    <CalibrationPanel class="panel-calibration"></CalibrationPanel>
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

.square {
  position: absolute;
  top: 0;
  left: 0;
  outline: 2px solid blue;
  outline-offset: -2px;
}

.details {
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
  transition: opacity linear 0.3s;
  opacity: 0.7;
}

body:hover .panel-grimoire {
  opacity: 1;
}

.panel-calibration {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
