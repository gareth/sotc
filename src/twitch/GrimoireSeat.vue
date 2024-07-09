<script setup lang="ts">
defineProps({
  role: String,
  user: String,
});
</script>

<template>
  <div class="seat">
    <div class="role" v-if="role" v-text="role"></div>
    <div class="user" v-if="user">({{ user }})</div>
  </div>
</template>

<style scoped lang="scss">
.seat {
  border: 1px solid black;
  margin-bottom: 1px;
}
</style>
