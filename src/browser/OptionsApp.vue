<script async setup lang="ts">
import { TaggedLogger } from "../core/util/TaggedLogger";
import useLocalStore from "./stores/local";
import { twitchAuth } from "./twitch/auth";
import { twitchApi } from "./twitch/api";
import { computed } from "vue";

// import InstallStatus from "./ExtensionInstallStatus.vue";
// import ActivationStatus from "./ExtensionActivationStatus.vue";
import TwitchExtensionStatus from "./TwitchExtensionStatus.vue";

const store = useLocalStore();

const props = defineProps({
  ownerId: { type: String, required: true },
  broadcasterId: { type: String, required: true },
  clientId: { type: String, required: true },
  secret: { type: String, required: true },
});

const logger = new TaggedLogger("Options");

const api = computed(() =>
  store.accessToken ? twitchApi(store.accessToken) : undefined
);
</script>

<template>
  <div>
    <h1>Stream on the Clocktower</h1>
    <h2>Options</h2>
    <h3>Twitch integration</h3>
    <TwitchExtensionStatus
      :access-token="store.accessToken"
      :broadcaster-id="store.broadcasterId"
      :client-id="props.clientId"
    ></TwitchExtensionStatus>
  </div>
</template>

<style scoped lang="scss">
button.twitch {
  background-color: #6441a5;
  appearance: none;
  border: 1px solid black;
  padding: 0.6em 1.2em;
  font-weight: bold;
  color: white;

  &:not(:disabled) {
    cursor: pointer;
  }

  &:disabled {
    background-color: grey;
  }
}
</style>
