<script setup lang="ts">
import { TaggedLogger } from "../chrome/util/TaggedLogger";
import { computed } from "vue";
import { ExtensionState, Script } from "../chrome/types/sotc";
import { Seat } from "../chrome/types/event";

const logger = new TaggedLogger("OverlayApp");

interface Props {
  script: Script;
}

const props = defineProps<Partial<Props>>();
</script>

<template>
  <div>
    <h1>{{ props.script?.name ?? "Stream on the Clocktower" }}</h1>
    <div v-if="props.script">
      <div class="author">by {{ props.script.author }}</div>
      <details
        v-for="role in props.script.characters"
        class="script-role"
        :class="role.type"
      >
        <summary>{{ role.name }}</summary>
        {{ role.ability }}
      </details>
    </div>
  </div>
</template>

<style scoped lang="scss">
h1 {
  font-size: 1.2em;
  margin-bottom: 0;
}

.author {
  margin-bottom: 0.5rem;
}

.script-role.traveler {
  display: none;
}

.script-role.townsfolk {
  & summary {
    color: blue;
  }
}

.script-role.outsider {
  & summary {
    color: rgb(35, 163, 206);
  }
}

.script-role.minion {
  & summary {
    color: rgb(241, 72, 72);
  }
}

.script-role.demon {
  & summary {
    color: rgb(148, 0, 0);
  }
}

details {
  margin-bottom: 0.1rem;
}

summary {
  cursor: pointer;
  font-weight: bold;

  list-style-position: outside;
  padding-left: 5px;
  margin-left: 1rem;
}
</style>
