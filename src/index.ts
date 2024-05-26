import { createApp } from "vue";

import VueTest from "./test.vue";

createApp({
  components: {
    "vue-test": VueTest,
  },
  template: "<vue-test />",
}).mount("#app");
