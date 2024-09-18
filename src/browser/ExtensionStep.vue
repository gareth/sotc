<script setup lang="ts">
type Props = {
  summary: string;
};

const props = defineProps<Props>();
</script>

<template>
  <div class="extensionStep">
    <div class="description" v-text="props.summary"></div>
    <div class="status"><slot></slot></div>
    <div class="actions" v-if="$slots.actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
