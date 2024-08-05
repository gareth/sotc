<script async setup lang="ts">
import { TaggedLogger } from "../core/util/TaggedLogger";
import useLocalStore from "./stores/local";
import { twitchAuth } from "./twitch/auth";
import { twitchApi } from "./twitch/api";
import { computed } from "vue";

const store = useLocalStore();

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

async function connect(verify = false) {
  const data = await twitchAuth(verify).catch((e) => {
    logger.error("Authentication failed:", e);
    return undefined;
  });

  // debugger;
  if (data) {
    const { auth, id } = data;

    // // TODO: Maybe use remote call the verify connection
    // const token_info = await getTokenInfo(auth.access_token);
    // console.log("Got token info", token_info);

    if (auth) {
      store.auth = auth;
      store.id = { data: id };
    }
  }
}

function disconnect() {
  store.auth = {};
  store.id = {};
}

const api = computed(() =>
  store.accessToken ? twitchApi(store.accessToken) : undefined
);
</script>

<template>
  <div>
    <h1>Stream on the Clocktower</h1>
    <h2>Options</h2>
    <h3>Twitch integration</h3>
    <div v-if="store.id.data">
      <div>
        Connected as:
        <strong>{{ store.id.data.preferred_username }}</strong>
      </div>
      <button @click="disconnect()">Disconnect</button>
    </div>
    <div v-else>
      <button class="twitch" @click="connect(false)">
        Connect with Twitch
      </button>
    </div>
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
