<script setup lang="ts">
const slots = defineSlots<{
  head: () => any;
  default(): any;
}>();
</script>

<template>
  <Transition name="infoBox">
    <div class="contents" v-if="$slots.default">
      <div class="head" v-if="$slots.head">
        <slot name="head"></slot>
      </div>
      <div class="body">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.contents {
  text-align: center;
  background-color: antiquewhite;
  border-radius: 4px;
  border: 1px solid brown;

  pointer-events: none;

  .head {
    font-weight: bold;
    font-size: 1.2em;
    border-bottom: 1px solid brown;
    padding: 0.3em 0.6em;
  }

  .body {
    padding: 0.3em 0.6em;
  }
}

.infoBox-enter-active {
  transition: all 0.2s ease-out;
}

.infoBox-leave-active {
  transition: all 0.2s ease-in-out;
}

.infoBox-enter-from,
.infoBox-leave-to {
  opacity: 0;
}
</style>
