<script async setup lang="ts">
import { TaggedLogger } from "./util/TaggedLogger";
import { useStore } from "./store";
import { twitchAuth } from "./twitch/auth";

const store = useStore();

const logger = new TaggedLogger("Options");

const doAuth = async (verify = false) => {
  const data = await twitchAuth(verify);

  if (data) {
    store.auth = data;
  }
};
</script>

<template>
  <div>
    <h1>Stream on the Clocktower</h1>
    <h2>Options</h2>
    <div v-text="store.auth.id_token"></div>
    <button @click="doAuth(false)">Connect with Twitch</button>
  </div>
</template>

<style scoped></style>
