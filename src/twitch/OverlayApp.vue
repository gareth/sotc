<script async setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { TaggedLogger } from "../core/util/TaggedLogger";
import { decode } from "../browser/twitch/sync";
import { ExtensionState, Grimoire, Script } from "../browser/types/sotc";
import { GamePhase, GameState, Seat } from "../browser/types/event";
import ScriptPanel from "./ScriptPanel.vue";
import GrimoirePanel from "./GrimoirePanel.vue";
import CalibrationPanel from "./CalibrationPanel.vue";
import { delay } from "underscore";
import { Bounds, Offsets } from "../core/util/bounds";

interface SOTCPubSubMessage {
  type: string;
}

interface SOTCPubSubBulkUpdateStateMessage {
  type: "bulkUpdateState";
  payload: Partial<ExtensionState>;
}

interface SOTCPubSubStartCalibrationMessage {
  type: "startCalibration";
  calibrationId: string;
  inset: number;
  existingBounds: Offsets;
}

interface SOTCPubSubEndCalibrationMessage {
  type: "endCalibration";
}

const logger = new TaggedLogger("OverlayApp");

const latency = ref<number>(0);

interface Calibration {
  id: string;
  inset: number;
  offsets: Offsets;
}

const activeCalibration = ref<Calibration | null>(null);

const scriptExpanded = ref(false);

setInterval(() => {
  Twitch.ext.onContext((ctx) => {
    latency.value = ctx.hlsLatencyBroadcaster ?? 0;
  });
}, 1000);

const broadcastHandler = (
  target: string,
  contentType: string,
  rawMessage: string
) => {
  logger.info("Received broadcast message", target, contentType);
  const message = decode(rawMessage) as SOTCPubSubMessage;
  logger.debug("Decoded, this is", message);

  switch (message.type) {
    case "bulkUpdateState":
      const stateMessage = message as SOTCPubSubBulkUpdateStateMessage;
      const data = stateMessage.payload;

      if (undefined !== data.script) script.value = data.script;
      if (undefined !== data.page) page.value = data.page;
      if (undefined !== data.seats) seats.value = data.seats;
      if (undefined !== data.grim) grim.value = data.grim;
      if (undefined !== data.overlay) overlay.value = data.overlay;
      if (undefined !== data.game) game.value = data.game;

      break;
  }
};

Twitch.ext.listen("broadcast", (...args) => {
  delay(broadcastHandler, latency.value * 1000, ...args);
});

const whisperHandler = (
  target: string,
  contentType: string,
  rawMessage: string
) => {
  logger.debug("Received whisper message", target, contentType, rawMessage);
  const message = JSON.parse(rawMessage) as SOTCPubSubMessage;
  logger.debug("Decoded, this is", message);

  switch (message.type) {
    case "startCalibration":
      {
        const calibrationMessage = message as SOTCPubSubStartCalibrationMessage;
        activeCalibration.value = {
          id: calibrationMessage.calibrationId,
          inset: calibrationMessage.inset,
          offsets: calibrationMessage.existingBounds,
        };
      }
      break;

    case "endCalibration":
      activeCalibration.value = null;
      break;

    default:
      break;
  }
};

Twitch.ext.onAuthorized((auth) => {
  logger.debug("Got auth", auth);
  Twitch.ext.listen(`whisper-${auth.userId}`, (...args) => {
    logger.debug("Received whisper", ...args);
    whisperHandler(...args);
    // delay(whisperHandler, latency.value * 1000, ...args);
  });
});

const defaultOffsets = {
  top: -0.002,
  right: 0.216931216931217,
  bottom: 0,
  left: 0.216931216931217,
};

const script = ref<Script | undefined>(undefined);
const page = ref<string | undefined>(undefined);
const seats = ref<Seat[] | undefined>(undefined);
const grim = ref<Grimoire | undefined>(undefined);
const overlay = ref<{ pos: Offsets }>({ pos: defaultOffsets });
const game = ref<GamePhase | undefined>(undefined);

Twitch.ext.configuration.onChanged(() => {
  if (Twitch.ext.configuration.broadcaster) {
    const content = Twitch.ext.configuration.broadcaster.content;
    const decompressed = decode(content) as Partial<ExtensionState>;
    logger.debug("Decompressed to", decompressed);
    script.value = decompressed.script;
    page.value = decompressed.page;
    seats.value = decompressed.seats;
    grim.value = decompressed.grim;
    overlay.value = decompressed.overlay || { pos: defaultOffsets };
    game.value = decompressed.game;
  }
});
</script>

<template>
  <main>
    <div class="details">
      <div class="latency" v-text="latency"></div>
    </div>
    <GrimoirePanel
      v-if="script && grim"
      class="panel-grimoire"
      :mode="grim.mode"
      :script="script"
      :seats="seats"
      :offset="overlay.pos"
    ></GrimoirePanel>
    <div class="panel-script--container" v-if="script">
      <input
        v-model="scriptExpanded"
        type="checkbox"
        class="panel-script--handleState"
        id="panel-script--handleState"
      />
      <div class="panel-script">
        <div class="panel-script--handle">
          <label for="panel-script--handleState">
            <span class="arrow">{{ scriptExpanded ? "▲" : "▼" }}</span>
            Characters
            <span class="arrow">{{ scriptExpanded ? "▲" : "▼" }}</span>
          </label>
        </div>
        <ScriptPanel
          @click="scriptExpanded = true"
          class="panel-script--contents"
          :script="script"
          :expanded="scriptExpanded"
        ></ScriptPanel>
      </div>
    </div>
    <CalibrationPanel
      v-if="activeCalibration"
      :key="activeCalibration?.id"
      :calibrationId="activeCalibration?.id"
      :offsets="activeCalibration?.offsets"
      :inset="activeCalibration?.inset"
      class="panel-calibration"
    ></CalibrationPanel>
  </main>
</template>

<style lang="scss" scoped>
main {
  height: 100%;

  font-family: "Radley", "Gothic A1", sans-serif;

  scroll-behavior: smooth;
  transform: rotate(0deg);
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

  display: none;
}

.panel-script--container {
  --script-container-width: 17rem;

  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  padding: 0;
  height: 100vh;
  width: var(--script-container-width);

  contain: layout;
}

.panel-script {
  --script-background-color: rgb(210, 200, 186);
  --script-border-color: rgb(118, 86, 55);
  --script-border-size: 2px;
  --script-width: 25vw;

  transition: left cubic-bezier(0.39, 0.575, 0.565, 1) 0.4s;

  position: fixed;
  top: 5rem;
  max-height: calc(100% - 10rem);
  bottom: 5rem;
  left: 100%;
  min-height: 15em;
  width: var(--script-width);
  border: var(--script-border-size) solid var(--script-border-color);
  border-radius: calc(2px + var(--script-border-size));

  background-color: var(--script-background-color);

  .panel-script--handle {
    font-family: "Germania One";
    font-size: 1.3em;

    position: absolute;
    display: grid;
    top: 1rem;
    right: 100%;
    writing-mode: vertical-rl;
    text-orientation: sideways;
    border: var(--script-border-size) solid var(--script-border-color);
    border-right-width: 1px;
    border-radius: 0.2em 0 0 2em;
    padding-bottom: 2em;

    background-color: var(--script-background-color);
    background-color: rgb(219, 202, 106);

    label {
      padding: 1em 0.5em;
      cursor: pointer;
    }

    .arrow {
      font-size: 0.7em;
      color: var(--script-border-color);
    }
  }
}

.panel-script--contents {
  overflow-y: scroll;
  max-height: 100%;

  cursor: pointer;
}

#panel-script--handleState {
  display: none;

  &:checked + .panel-script {
    left: calc(
      0rem - var(--script-width) + var(--script-container-width) - 7rem
    );

    .panel-script--contents {
      cursor: initial;
    }
  }
}

.panel-script--container:hover .panel-script {
  left: calc(100% - 7rem);
}

.panel-grimoire {
  grid-area: grimoire;
}

.panel-calibration {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
