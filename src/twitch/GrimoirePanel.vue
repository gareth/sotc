<script setup lang="ts">
import { Seat } from "../chrome/types/event";
import GrimoireSeat from "./GrimoireSeat.vue";

interface Props {
  seats: Seat[];
}

defineProps<Props>();
</script>

<template>
  <div>
    <GrimoireSeat
      v-for="seat in seats"
      :role="seat.role?.name"
      :user="seat.user"
    ></GrimoireSeat>
  </div>
</template>
