<script async setup lang="ts">
import { computed, ref } from "vue";
import { TaggedLogger } from "../core/util/TaggedLogger";
import { ExtensionState } from "./types/sotc";
import { indexBy } from "underscore";
import { Seat, sotcEvent } from "./types/event";

const props = defineProps<{ state: Partial<ExtensionState> }>();
const emit = defineEmits<{
  startCalibration: [];
}>();

const logger = new TaggedLogger("App");
const root = ref<HTMLElement | null>(null);

const activeCalibration = ref(false);
const calibrationData = ref<string>("");

const calibrationDataError = computed(() => {
  if (!calibrationData.value) return;
  try {
    const values = JSON.parse(calibrationData.value);
    if (!(values instanceof Array)) return "Invalid config string";
    if (values.length != 4) return "Config needs 4 values";
    if (!values.every((el) => typeof el == "number"))
      return "Config needs 4 numbers";
  } catch (e) {
    return "Invalid config string";
  }
  return false;
});

const activeScript = computed(() =>
  props.state.page == "Grimoire" ? props.state.script : undefined
);

const characters = computed(() => {
  if (props.state.script) {
    return indexBy(props.state.script.characters, (char) => char.id);
  }
});

const seats = computed(() => {
  return props.state.seats?.map((seat: Seat) => {
    return {
      pos: seat.pos,
      user: seat.user,
      role: characters.value?.[seat.role?.id!],
    };
  });
});

function startCalibration() {
  if (root.value) {
    activeCalibration.value = true;
    logger.debug("Sending calibration request to", root.value);
    const event = new CustomEvent("startCalibration", { bubbles: true });
    root.value.dispatchEvent(event);
  }
}

function cancelCalibration() {
  if (root.value) {
    activeCalibration.value = false;
    logger.debug("Cancelling calibration request to", root.value);
    const event = new CustomEvent("cancelCalibration", { bubbles: true });
    root.value.dispatchEvent(event);
  }
}

function saveCalibration() {
  if (root.value) {
    activeCalibration.value = false;
    const parsedJSON = JSON.parse(calibrationData.value);
    if (parsedJSON instanceof Array) {
      const [top, right, bottom, left] = parsedJSON;
      if (
        typeof top == "number" &&
        typeof right == "number" &&
        typeof bottom == "number" &&
        typeof left == "number"
      ) {
        const offsets = { top, right, bottom, left };
        logger.debug("Sending calibration result to", root.value);
        const event = sotcEvent("sotc-overlayOffsets", {
          bubbles: true,
          detail: { offsets },
        });
        root.value.dispatchEvent(event);
      }
    }
  }
}

function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}
</script>

<template>
  <div class="popup" ref="root">
    <header>
      <h1>Stream on the Clocktower</h1>
      <button class="settings" @click="openOptionsPage" title="Settings">
        ⚙️
      </button>
    </header>
    <details>
      <summary>Detected state</summary>
      <p>
        Summarises what the extension has detected about your current game tab
      </p>
      <div v-if="activeScript">
        <details>
          <summary>{{ activeScript.name }}</summary>
          <span>by {{ activeScript.author }}</span>
          <ul>
            <li v-for="character in activeScript?.characters">
              {{ character.name }}
            </li>
          </ul>
        </details>

        <details class="seatInfo" open v-if="props.state.seats">
          <summary>Seats ({{ state.seats?.length }})</summary>
          <ol>
            <li v-for="seat in seats">
              <span class="seatInfo__user" v-if="seat.user">
                {{ seat.user }}</span
              >
              <span class="seatInfo__user seatInfo--empty" v-else>[empty]</span>
              <span class="seatInfo__role" v-if="seat.role">{{
                seat.role.name
              }}</span>
            </li>
          </ol>
        </details>
      </div>
      <div v-else>Grimoire not visible on {{ state.page }} page</div>
    </details>
    <details>
      <summary>Twitch extension calibration</summary>
      <div class="calibration">
        <div class="inactiveCalibration" v-if="!activeCalibration">
          <ol>
            <li>
              <strong>While streaming your game tab</strong>, open your Twitch
              page in a new browser window as the broadcaster account. (Mute the
              stream if necessary)
            </li>
            <li>
              <strong>When the Clocktower overlay is visible</strong> in that
              window, click the "Calibrate" button below.
            </li>
          </ol>
          <div class="controls">
            <button @click="startCalibration">Calibrate</button>
          </div>
        </div>
        <div class="activeCalibration" v-else>
          <ol>
            <li>
              <strong>On your Twitch stream</strong>, click on the overlay where
              the two yellow circles end up appearing in the broadcast.
            </li>
            <li>
              Copy the config text that appears (including the surrounding
              <code>[]</code>) and paste it into the box below.
            </li>
          </ol>
          <div class="controls">
            <input v-model="calibrationData" />
            <button
              @click="saveCalibration"
              :disabled="!!calibrationDataError || !calibrationData"
            >
              Save
            </button>
            <button @click="cancelCalibration">Cancel</button>
          </div>
          <div class="calibrationDataError" v-if="calibrationDataError">
            {{ calibrationDataError }}
          </div>
        </div>
      </div>
    </details>
  </div>
</template>

<style scoped lang="scss">
.popup {
  padding: 1em;
  background-color: rgb(244, 241, 244);
}

h1 {
  margin: 0 0 0.3em 0;
  font-family: "Pirata One", serif;
  font-style: normal;
}

details {
  padding: 0.2em 0.5em;

  &:not(:last-child) {
    margin-bottom: 1em;
  }
}

summary {
  margin: 0 -0.5em;

  cursor: pointer;
  font-weight: bold;
  background-color: #ddd;
  padding: 5px;
  list-style: none;

  &::before {
    display: inline-block;
    width: 1em;
    text-align: center;
    margin-right: 0.3em;
    content: "▶";
    transition: transform 0.15s ease-in-out;
  }
}

details[open] > summary::before {
  transform: rotate(90deg);
}

ol {
  padding-left: 15px;
  margin-left: 0;
}

.controls button:not(:first-child) {
  margin-left: 0.2em;
}

header {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;

  h1 {
    flex-grow: 1;
  }

  button.settings {
    appearance: none;
    font-size: 1.5em;

    background-color: #ddd;
    border-radius: 4px;

    border: 1px solid #999;

    cursor: pointer;

    &:hover {
      background-color: #999;
    }
  }
}

.seatInfo ol {
  display: grid;
  grid-template-columns: auto auto 1fr;

  padding: 0;

  counter-reset: seatInfo;

  li {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: span 3;

    span:not(:last-child) {
      margin-right: 1em;
    }

    &::before {
      counter-increment: seatInfo;
      content: counter(seatInfo) ".";
      margin-right: 0.3em;
    }

    .seatInfo--empty {
      color: #888;
    }
  }
}
</style>
