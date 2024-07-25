<script setup lang="ts">
import { computed, ref } from "vue";
import { Seat } from "../chrome/types/event";
import { mapToPercent } from "../chrome/util/bounds";
import { Character, Script } from "../chrome/types/sotc";
import InfoBox from "./InfoBox.vue";
import PlayerCounts from "./PlayerCounts.vue";

interface Props {
  mode?: string;
  script: Script;
  seats?: Seat[];
  offset: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const props = defineProps<Props>();

const pct = (left: number) => `${left * 100}%`;

const svgBounds = computed(() => ({
  top: pct(props.offset.top),
  right: pct(props.offset.right),
  bottom: pct(props.offset.bottom),
  left: pct(props.offset.left),
}));

const circles = computed(() => {
  if (props.seats) {
    return props.seats.map((seat: Seat, idx: number) => {
      const r = (seat.pos?.width ?? 0) / 2;
      const x = (seat.pos?.left ?? 0) + r;
      const y = (seat.pos?.top ?? 0) + r;
      const visible = props.mode == "reveal" ? seat.revealed : true;
      const classes = [
        seat.isDead ? "status-dead" : "status-alive",
        (visible && seat.role?.team) || `unknown`,
        visible && `alignment-${seat.role?.alignment ?? "default"}`,
      ];
      const seatRole = props.script.characters.find(
        (char: Character) => char.id == seat.role?.id
      );
      return {
        visible,
        seat,
        seatRole,
        idx,
        position: { x, y, r },
        classes,
      };
    });
  }
});

const selectedCharacter = ref<Character | undefined>(undefined);
const showInfoPanel = ref(false);

function select(seat: unknown, role: Character | undefined) {
  selectedCharacter.value = role;
}

function deselect() {
  selectedCharacter.value = undefined;
}
</script>

<template>
  <div class="panel-grimoire">
    <div class="grimoire" :style="svgBounds">
      <div
        class="infoBox"
        @mouseenter="showInfoPanel = true"
        @mouseleave="showInfoPanel = false"
      >
        <InfoBox>
          <template #head v-if="selectedCharacter">
            {{ selectedCharacter.name }}
          </template>
          <template #default v-if="selectedCharacter">
            {{ selectedCharacter.ability }}
          </template>
          <template #default v-else-if="showInfoPanel">
            <PlayerCounts :seats="seats"></PlayerCounts>
          </template>
        </InfoBox>
      </div>
      <svg viewBox="0 0 100 100">
        <defs>
          <linearGradient id="traveler">
            <stop offset="45%" stop-color="blue" />
            <stop offset="55%" stop-color="#c80c0c" />
          </linearGradient>
          <g id="shroud">
            <path d="M -3.3 0 l 0 8.8 l 3.3 -2.8 l 3.3 2.8 l 0 -8.8 Z"></path>
          </g>
        </defs>
        <g
          class="seat"
          :class="classes"
          v-for="{ classes, position, seat, seatRole } in circles"
          :transform="`translate(${position.x * 100}, ${position.y * 100})`"
        >
          <circle
            @mouseenter="select(seat, seatRole)"
            @mouseout="deselect()"
            :r="position.r * 100 - 0.2"
          ></circle>
          <Transition name="shroud" :duration="3000">
            <g v-if="seat.isDead">
              <use
                class="shroud"
                href="#shroud"
                :transform="`translate(0, ${-position.r * 100})`"
              ></use>
            </g>
          </Transition>
        </g>
      </svg>
      <div class="labelContainer">
        <div class="labels">
          <div
            v-for="{ visible, seat, seatRole, position, classes } in circles"
          >
            <span
              class="label"
              :class="classes"
              v-if="seatRole && visible"
              :style="{
                ...mapToPercent({
                  left: position.x,
                  top: position.y,
                }),
              }"
            >
              {{ seatRole.name }}
            </span>
            <span
              class="label user"
              :class="classes"
              v-if="seat.user"
              :style="{
                ...mapToPercent({
                  left: position.x,
                  top: position.y + position.r,
                }),
              }"
            >
              {{ seat.user }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grimoire {
  position: absolute;
  transition: opacity linear 0.3s;
  opacity: 0.4;
  container: grimoire / size;

  --character-fill: 255, 255, 255;
  --character-stroke: 0, 0, 0;
}

.townsfolk {
  --character-fill: 0, 0, 255;
  --character-stroke: 0, 0, 255;
}

.outsider {
  --character-fill: 79, 187, 224;
  --character-stroke: 79, 187, 224;
}

.minion {
  --character-fill: 234, 121, 121;
  --character-stroke: 255, 105, 0;
}

.demon {
  --character-fill: 200, 12, 12;
  --character-stroke: 200, 12, 12;
}

.traveler {
  --character-fill: 103, 65, 191;
  --character-stroke: 160, 19, 195;
}

.alignment-g {
  --alignment-color: 0, 0, 255;
}

.alignment-e {
  --alignment-color: 200, 12, 12;
}

svg {
  width: 100%;
  height: 100%;
}

g.seat {
  circle {
    stroke: black;
    stroke-width: 0.5;

    transition: all linear 0.3s;
  }

  .shroud {
    pointer-events: none;
    stroke-width: 0.5;
    fill: #303030;
    stroke: #222;
    transition: opacity 0.3s linear;
    opacity: 0;
  }

  circle {
    fill: rgba(var(--character-fill), 0.2);
    stroke: RGB(var(--character-stroke));
  }

  &.unknown circle {
    stroke-width: 0;
    fill: white;
    opacity: 0.06;
  }

  &.alignment-g,
  &.alignment-e {
    circle {
      stroke: RGB(var(--alignment-color));
    }
  }

  circle:hover {
    stroke: white;
  }
}

.labelContainer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  justify-content: center;
  pointer-events: none;
}

.labels {
  position: relative;
  aspect-ratio: 1 / 1;
}

@container (aspect-ratio < 1) {
  .labelContainer {
    flex-direction: column;
  }
}

.label {
  position: absolute;
  transform: translate(-50%, -50%);
  font-weight: bold;
  font-size: 1.3em;
  text-align: center;
  background-color: rgb(197, 197, 197);
  outline: 1px solid black;
  padding: 0.2em 0.4em;
  border-radius: 3px;

  transition: opacity linear 0.3s;
  display: none;
  // pointer-events: none;

  &.user {
    margin-top: 5px;
    transform: translateX(-50%);
    font-weight: normal;
    font-size: inherit;
    display: block;
    color: antiquewhite;
    background-color: color-mix(
      in oklab,
      RGB(var(--alignment-color, var(--character-fill))) 30%,
      black 70%
    );
  }

  color: white;
  opacity: 0;
}

.infoBox {
  position: absolute;
  top: 30%;
  left: 30%;
  bottom: 35%;
  right: 30%;
  display: grid;
  place-items: center;
  z-index: 1000;
  // outline: 1px solid white;
}

.grimoire:hover {
  opacity: 1;

  .label {
    opacity: 1;
  }

  .shroud {
    opacity: 1;
  }
}

.shroud-enter-active {
  transition: all 0.3s ease-out;
}

.shroud-leave-active {
  transition: all 0.3s ease-in;
}

.shroud-enter-from,
.shroud-leave-to {
  transform: scale(1.15);
  opacity: 0;
}
</style>
