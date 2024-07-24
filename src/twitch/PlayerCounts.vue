<script setup lang="ts">
import { computed } from "vue";
import { Seat } from "../chrome/types/event";
import playerCountMap from "./player_counts";
import { CharacterType } from "../chrome/types/sotc";

interface Props {
  seats: Seat[];
}

const props = defineProps<Props>();

function isAlive(seat: Seat) {
  return !seat.isDead;
}

const residents = computed(() =>
  props.seats.filter((seat: Seat) => seat.role?.team != "traveler")
);
const travelers = computed(() =>
  props.seats.filter((seat: Seat) => seat.role?.team == "traveler")
);

const breakdown = computed(() => playerCountMap.get(residents.value.length));

const residentTypes = CharacterType.filter((t) => t != "traveler");
</script>

<template>
  <dl class="player-count-breakdown">
    <dt>Players</dt>
    <dd>
      {{ residents.length
      }}<span class="traveler" v-if="travelers.length"
        >+{{ travelers.length }}</span
      >
    </dd>
    <dt>Alive</dt>
    <dd>
      {{ residents.filter(isAlive).length
      }}<span class="traveler" v-if="travelers.filter(isAlive).length"
        >+{{ travelers.filter(isAlive).length }}</span
      >
    </dd>
    <template v-for="roleType in residentTypes" v-if="breakdown">
      <dt :class="roleType">{{ roleType }}</dt>
      <dd :class="roleType">
        {{ breakdown[roleType] }}
      </dd>
    </template>
    <template v-if="travelers.length">
      <dt class="traveler">Traveller</dt>
      <dd class="traveler">
        {{ travelers.length }}
      </dd>
    </template>
  </dl>
</template>

<style scoped lang="scss">
dl {
  display: grid;
  grid-template-columns: auto auto auto auto;
  margin: 0.5em auto;
  gap: 1px;
  place-content: center;
}

dd,
dt {
  margin: 0;
  padding: 0.2em 0.5em;
}

dt {
  text-transform: capitalize;
}

dt.traveler {
  grid-column: span 3;
}

dd {
  white-space: nowrap;
  border: 1px dotted brown;
  border-width: 0 1px;
}

.townsfolk,
.outsider {
  color: blue;
}

.minion,
.demon {
  color: rgb(200, 12, 12);
}

.traveler {
  color: #cc04ff;
}
</style>
