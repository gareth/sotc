<script setup lang="ts">
import { computed } from "vue";
import { Seat } from "../chrome/types/event";

interface Props {
  seats: Seat[];
}

const props = defineProps<Partial<Props>>();

function position(
  radius: number,
  points: number,
  i: number
): { x: number; y: number } {
  // Calculate the angle between each point in radians
  const angle = (2 * Math.PI) / points;

  // Calculate the angle for the i-th point
  const theta = angle * i - Math.PI / 2;

  // Calculate the x and y coordinates
  const x = radius * Math.cos(theta);
  const y = radius * Math.sin(theta);

  return { x: Math.round(x), y: Math.round(y) };
}

const circles = computed(() => {
  if (props.seats) {
    return props.seats.map((seat: Seat, idx: number) => {
      return {
        seat,
        idx,
        position: position(97, props.seats?.length || 1, idx),
      };
    });
  }
});
</script>

<template>
  <div class="panel-grimoire">
    <svg viewBox="-120 -120 240 240">
      <g
        class="seat"
        :class="seat.role?.team || `unknown`"
        v-for="{ seat, idx, position } in circles"
      >
        <circle :cx="position.x" :cy="position.y" r="22.5"></circle>
        <text :x="position.x" :y="position.y">{{ seat.role?.name }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped lang="scss">
.panel-grimoire {
  display: grid;
  place-items: center;
}

svg {
  width: 95%;
}

g.seat {
  circle {
    stroke: black;
    stroke-width: 1.5;
    cursor: pointer;
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
    stroke-width: 1.5;
    stroke: white;
    fill: transparent;
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
      stroke: rgb(234, 121, 121);
    }
  }

  &.demon {
    circle {
      fill: rgba(200, 12, 12, 0.2);
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
