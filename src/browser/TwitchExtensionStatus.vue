<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { twitchApi } from "./twitch/api";
import useLocalStore from "./stores/local";
import { HelixExtension, HelixUserExtension } from "@twurple/api";
import { twitchAuth } from "./twitch/auth";
import { TaggedLogger } from "../core/util/TaggedLogger";
import { clone } from "../core/util/clone";
import { cmp, compare, gte, lt } from "semver";
import Async from "./Promise.vue";

const logger = new TaggedLogger("Options/Extension");

type Props = {
  clientId: string;
};

const store = useLocalStore();
const props = defineProps<Props>();

const connectedAccount = computed(() =>
  store.connection
    ? {
        api: twitchApi(store.connection.auth.access_token),
        connection: store.connection,
      }
    : undefined
);

const expectedSOTC = ref<HelixExtension | undefined>(undefined);
const expectedSOTCPromise = ref<Promise<HelixExtension> | undefined>(undefined);

const installedExtension = ref<HelixUserExtension | undefined>(undefined);

const installCheckPromise = ref<
  Promise<[HelixUserExtension, HelixExtension]> | undefined
>(undefined);

watch(installCheckPromise, (newV, oldV) => {
  logger.info("Changing installCheckPromise", oldV, newV);
});

watch(connectedAccount, (value, oldValue) => {
  if (value != oldValue) installedExtension.value = undefined;
  if (value) {
    checkExtensionStatus();
  }
});

async function checkExtensionStatus() {
  installCheckPromise.value = undefined;
  const expectPromise = getExpectedExtension();
  expectedSOTCPromise.value = expectPromise;
  expectedSOTCPromise.value.then((extension) => {
    expectedSOTC.value = extension;
  });
  const installPromise = getInstalledExtensions().then((extensions) => {
    if (!extensions.length) throw new Error("Extension not installed");
    extensions.sort((a, b) => compare(b.version, a.version));
    return extensions[0];
  });
  installPromise
    .then((extensions) => {
      installedExtension.value = extensions;
    })
    .catch(() => {});
  installCheckPromise.value = Promise.all([installPromise, expectPromise]).then(
    ([installed, expected]) => {
      const target = expected.version;
      // const target = "0.0.4";
      if (lt(installed.version, target))
        throw new Error(
          `Installed Twitch extension (${installed.version}) is outdated. Install the newest version (${target})`
        );
      return [installed, expected];
    }
  );
}

async function getExpectedExtension() {
  if (!connectedAccount.value)
    throw new Error("Can't load extensions: account not linked");
  return connectedAccount.value.api.extensions.getReleasedExtension(
    props.clientId
  );
}

async function getInstalledExtensions() {
  if (!connectedAccount.value)
    throw new Error("Can't load extensions: account not linked");
  const extensions = (
    await connectedAccount.value.api.users.getExtensionsForAuthenticatedUser(
      connectedAccount.value.connection.id.sub
    )
  ).filter((ext) => ext.id == props.clientId);
  logger.debug("Found extensions", extensions);
  return extensions;
}

async function connect(verify = false) {
  const data = await twitchAuth(verify).catch((e) => {
    logger.error("Authentication failed:", e);
    return undefined;
  });

  if (data) {
    const { auth, id } = data;

    // // TODO: Maybe use remote call the verify connection
    // const token_info = await getTokenInfo(auth.access_token);
    // console.log("Got token info", token_info);

    if (auth) {
      store.auth = { data: auth };
      store.id = { data: id };
    }
  }
}

function disconnect() {
  store.auth = {};
  store.id = {};
}
</script>

<template>
  <div class="extensionStatus">
    <div class="extensionStep">
      <div class="description">Connect your Twitch account</div>
      <div class="status">
        <template v-if="connectedAccount">
          <span class="promise-success">
            <span class="twitchAccount">{{
              connectedAccount.connection.id.preferred_username
            }}</span>
          </span>
          <button
            class="btn"
            title="Disconnect your account"
            @click="disconnect()"
          >
            X
          </button>
        </template>
        <template v-else>
          <span class="promise-failure">Account not connected</span>
          <button class="btn btn__external btn--twitch" @click="connect(false)">
            Connect your account
          </button>
        </template>
      </div>
    </div>

    <div class="extensionStep">
      <div class="description">Install the Twitch extension</div>
      <div class="status">
        <template v-if="connectedAccount">
          <Async :promise="installCheckPromise">
            <template #pending>Checking…</template>
            <template #failure="{ value: error }"
              >{{ error
              }}<a
                :href="`https://dashboard.twitch.tv/extensions/${clientId}`"
                target="_blank"
                class="btn btn--twitch btn__external"
              >
                Install
              </a>
              <button
                class="btn"
                title="Refresh this data"
                @click="checkExtensionStatus"
              >
                ↻
              </button>
            </template>
            <template #success="{ value: [installed] }"
              >Version {{ installed.version }} installed
              <button
                class="btn"
                title="Refresh this data"
                @click="checkExtensionStatus"
              >
                ↻
              </button>
            </template>
          </Async>
        </template>
      </div>
    </div>

    <div class="extensionStep">
      <div class="description">Activate the stream overlay</div>
      <div class="status">
        <template v-if="connectedAccount">…</template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.btn {
  appearance: none;
  border: 1px solid black;
  padding: 0.2em 0.5em;
  text-decoration: none;
  display: inline-block;
  box-sizing: border-box;
  margin-left: 0.3em;
  line-height: initial;
  font-family: Arial;
}

.btn--twitch {
  border-color: purple;
  background: purple;
  color: white;
}

.btn__external::after {
  content: "⤴";
}

.extensionStatus {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 0.2rem 1rem;
  vertical-align: middle;
}

.extensionStep {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  align-items: baseline;
  line-height: 2;
  counter-increment: extensionStep;
}

.description {
  min-height: 2em;
  color: inherit;

  &::before {
    content: counter(extensionStep) ". ";
  }
}

.status {
  color: inherit;
}

.promise-pending {
  color: #666;
}

.promise-success {
  color: green;

  &::before {
    content: "✅";
    margin-right: 0.2rem;
  }
}

.promise-failure {
  color: red;

  &::before {
    content: "❌";
    margin-right: 0.2rem;
  }
}
</style>
