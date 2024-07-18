<script setup lang="ts">
import { computed } from "vue";
import { Seat } from "../chrome/types/event";
// import { TaggedLogger } from "../chrome/util/TaggedLogger";

// const logger = new TaggedLogger("GrimoirePanel");

interface Props {
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
      const classes = [
        seat.role?.team || `unknown`,
        `alignment-${seat.role?.alignment ?? "default"}`,
      ];
      return {
        seat,
        idx,
        position: { x, y, r },
        classes,
      };
    });
  }
});
</script>

<template>
  <div class="panel-grimoire">
    <div class="grimoire" :style="svgBounds">
      <svg viewBox="0 0 100 100">
        <defs>
          <linearGradient id="traveler">
            <stop offset="45%" stop-color="blue" />
            <stop offset="55%" stop-color="#c80c0c" />
          </linearGradient>
        </defs>
        <g
          class="seat"
          :class="classes"
          v-for="{ classes, position } in circles"
        >
          <circle
            :cx="position.x * 100"
            :cy="position.y * 100"
            :r="position.r * 100 - 0.2"
          ></circle>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grimoire {
  position: absolute;
}

svg {
  width: 100%;
  height: 100%;
}

g.seat {
  circle {
    stroke: black;
    stroke-width: 0.5;
    // cursor: pointer;
  }
  text {
    pointer-events: none;
    opacity: 0;
    font-weight: bold;
    fill: white;
    stroke: black;
    stroke-width: 0.2;
  }

  &.unknown circle {
    stroke-width: 0;
    stroke: white;
    fill: white;
    opacity: 0.06;
  }

  &.townsfolk {
    circle {
      fill: rgba(0, 0, 255, 0.2);
      stroke: rgb(0, 0, 255);
    }
  }

  &.outsider {
    circle {
      fill: rgba(79, 187, 224, 0.2);
      stroke: rgb(79, 187, 224);
    }
  }

  &.minion {
    circle {
      fill: rgba(234, 121, 121, 0.2);
      stroke: rgb(255, 105, 0);
    }
  }

  &.demon {
    circle {
      fill: rgba(200, 12, 12, 0.2);
      stroke: rgb(200, 12, 12);
    }
  }

  &.traveler {
    circle {
      fill: transparent;
      stroke: url(#traveler);
    }
  }

  &.alignment-g {
    circle {
      stroke: blue;
    }
  }

  &.alignment-e {
    circle {
      stroke: rgb(200, 12, 12);
    }
  }

  text {
    text-anchor: middle;
    font-size: 9px;
  }

  circle:hover {
    stroke: white;
    & + text {
      opacity: 1;
    }
  }
}
</style>
