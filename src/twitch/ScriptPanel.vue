<script setup lang="ts">
import { TaggedLogger } from "../core/util/TaggedLogger";
import { computed } from "vue";
import { ExtensionState, Script } from "../browser/types/sotc";
import { Seat } from "../browser/types/event";

const logger = new TaggedLogger("OverlayApp");

interface Props {
  script: Script;
  expanded: boolean;
}

const props = defineProps<Partial<Props>>();

const handleDetailsToggle = (event: ToggleEvent) => {
  if (!(event.target instanceof HTMLDetailsElement)) return;

  if (event.target.open) {
    event.target.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
};

const classes = computed(() => (props.expanded ? "expanded" : "contracted"));
</script>

<template>
  <div class="script" :class="classes">
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
        <summary>
          <span class="role-name">{{ role.name }}</span>
        </summary>
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
    background-color: color-mix(in oklab, blue 30%, black 50%);
  }
}

.script-role.outsider {
  & summary {
    background-color: color-mix(in oklab, rgb(35, 163, 206) 30%, black 50%);
  }
}

.script-role.minion {
  & summary {
    background-color: color-mix(in oklab, rgb(241, 131, 72) 30%, black 50%);
  }
}

.script-role.demon {
  & summary {
    background-color: color-mix(in oklab, rgb(230, 0, 0) 30%, black 50%);
  }
}

details {
  > summary {
    display: flex;
    align-items: center;
    margin: 0 -1rem 0.1rem;
    padding: 0.3em 1rem;
    list-style: none;
    cursor: pointer;

    color: antiquewhite;

    font-family: "Germania One", serif;
    font-size: 1.1em;
    background: rgba(179, 161, 143, 0.641);

    &::before {
      display: none;
    }
    &::after {
      display: inline-block;
      text-align: center;
      width: 0.3em;
      margin-right: 0.7em;
      font-size: 0.7em;
      content: "▶";
    }
  }
}

.role-name {
  flex-grow: 1;
}

details[open] {
  > summary {
    margin-bottom: 0.3em;

    &::after {
      content: "▼";
    }
  }

  padding-bottom: 0.4em;
}

.contracted details {
  pointer-events: none;
}
</style>
