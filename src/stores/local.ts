import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export interface Auth {
  access_token: string;
  id_token: string;
  scope: string;
  state: string;
  token_type: string;
}

export const useStore = defineStore("sotc", {
  state: () => ({
    auth: useStorage<Partial<Auth>>("auth", {}),
  }),
  getters: {
    accessToken(state) {
      return state.auth.access_token;
    },
  },
});
