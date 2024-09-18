<script setup lang="ts" generic="T">
import { Ref, ref, watch } from "vue";
import { TaggedLogger } from "../core/util/TaggedLogger";

const logger = new TaggedLogger("Promise");

type Props<T> = {
  promise?: Promise<T>;
};

const props = defineProps<Props<T>>();

watch(
  () => props.promise,
  (newValue, oldValue) => {
    if (oldValue == newValue) return;
    state.value = { state: "unknown" };
    setupPromise();
  }
);

type State =
  | { state: "unknown" }
  | { state: "pending" }
  | { state: "success"; result: Ref<T> }
  | { state: "failure"; error: any };

const state = ref<State>({ state: "unknown" });

function setupPromise() {
  if (props.promise) {
    state.value = { state: "pending" };
    props.promise
      .then((result) => {
        state.value = { state: "success", result };
      })
      .catch((error) => {
        state.value = { state: "failure", error };
      });
  }
}

setupPromise();
</script>

<template>
  <div class="promise-unknown" v-if="state.state == 'unknown'">
    <slot name="unknown"></slot>
  </div>
  <div class="promise-pending" v-else-if="state.state == 'pending'">
    <slot name="pending"></slot>
  </div>
  <div class="promise-success" v-else-if="state.state == 'success'">
    <slot :value="state.result" name="success"></slot>
  </div>
  <div class="promise-failure" v-else-if="state.state == 'failure'">
    <slot :value="state.error" name="failure"></slot>
  </div>
</template>
