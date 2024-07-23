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

const handleDetailsToggle = (event: ToggleEvent) => {
  if (!(event.target instanceof HTMLDetailsElement)) return;

  if (event.target.open) {
    event.target.scrollIntoView({ block: "nearest" });
  }
};
</script>

<template>
  <div class="script">
    <h1>
      {{ props.script?.name ?? "Custom script" }}
    </h1>
    <div v-if="props.script">
      <div class="author">by {{ props.script.author }}</div>
      <details
        @toggle="handleDetailsToggle"
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
.script {
  padding: 0rem 1rem;
}

h1 {
  font-family: "Germania One", serif;
  font-style: normal;
  margin: 0.3em auto 0;
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

  > summary {
    list-style: none;
    cursor: pointer;
    font-weight: 800;

    &::before {
      // display: none;
      display: inline-block;
      text-align: center;
      width: 0.3em;
      margin-right: 0.7em;
      content: "+";
      // font-size: 0.7em;
    }
  }
}

details[open] {
  > summary {
    margin-bottom: 0.3em;
  }

  padding-bottom: 1em;

  > summary::before {
    content: "-";
  }
}
</style>
