<script async setup lang="ts">
import { computed, ref } from "vue";
import { TaggedLogger } from "./util/TaggedLogger";
// const props = defineProps<{ state: Partial<ExtensionState> }>();

type OAuth2Response = {
  access_token: string;
  id_token: string;
  scope: string;
  state: string;
  token_type: string;
};

const oauth = ref<OAuth2Response | undefined>();

const logger = new TaggedLogger("Options");

const auth = () => {
  const redirect_uri = chrome.identity.getRedirectURL();
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  const scopes = ["openid", "channel:manage:predictions"];

  const url = new URL("https://id.twitch.tv/oauth2/authorize");
  Object.entries({
    client_id: "uxheujux1fgxziwxggp54dl3t31u7d",
    state,
    nonce,
    response_type: "token id_token",
    scope: scopes.join(" "),
    force_verify: true,
    redirect_uri,
  }).forEach(([k, v]) => {
    url.searchParams.append(k, v.toString());
  });

  chrome.identity
    .launchWebAuthFlow({
      url: url.toString(),
      interactive: true,
    })
    .then((url) => {
      if (url) {
        const resultURL = new URL(url);
        const params = new URLSearchParams(resultURL.hash.substring(1));
        oauth.value = Object.fromEntries(params.entries()) as OAuth2Response;
        console.info("Got params", oauth.value);
      }
    })
    .catch((e) => {
      console.warn("Error getting auth", e);
    });
};
</script>

<template>
  <div>
    <h1>Stream on the Clocktower</h1>
    <h2>Options</h2>
    <div v-if="oauth">{{ oauth.id_token }}</div>
    <button v-else @click="auth">Connect with Twitch</button>
  </div>
</template>

<style scoped></style>
