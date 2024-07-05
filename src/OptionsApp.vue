<script async setup lang="ts">
import { TaggedLogger } from "./util/TaggedLogger";
import { useStore } from "./store";
import { twitchAuth } from "./twitch/auth";
import { twitchApi } from "./twitch/api";
import { computed, toRefs } from "vue";

import {
  setExtensionBroadcasterConfiguration,
  getExtensionBroadcasterConfiguration,
} from "@twurple/ebs-helper";

const store = useStore();

const props = defineProps({
  ownerId: {
    type: String,
    required: true,
  },
  broadcasterId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    required: true,
  },
});

const logger = new TaggedLogger("Options");

const doAuth = async (verify = false) => {
  const data = await twitchAuth(verify).catch((e) => {
    logger.error("Authentication failed:", e);
  });

  if (data) {
    store.auth = data;
  }
};

const ebsCallConfig = computed(() => {
  return {
    ownerId: props.ownerId,
    clientId: props.clientId,
    secret: props.secret,
  };
});

const api = computed(() =>
  store.accessToken ? twitchApi(store.accessToken) : undefined
);

const getInfo = async (api: ReturnType<typeof twitchApi> | undefined) => {
  if (api) {
    const newValue = Math.floor(Math.random() * 1000);
    console.log("Setting new value", newValue);
    await setExtensionBroadcasterConfiguration(
      ebsCallConfig.value,
      props.broadcasterId,
      JSON.stringify({ random: newValue })
    );
    const data = await getExtensionBroadcasterConfiguration(
      ebsCallConfig.value,
      props.broadcasterId
    );
    if (data) {
      logger.info("External config", JSON.parse(data.content));
    }
  }
};
</script>

<template>
  <div>
    <h1>Stream on the Clocktower</h1>
    <h2>Options</h2>
    <div v-text="store.auth.id_token"></div>
    <div v-text="api"></div>
    <button @click="doAuth(false)">Connect with Twitch</button>
    <button v-if="api" @click="getInfo(api)">Get info</button>
  </div>
</template>

<style scoped></style>
