import { defineStore } from "pinia";
import { useStorageAsync } from "@vueuse/core";
import { Offsets } from "../../core/util/bounds";

export interface Auth {
  access_token: string;
  id_token: string;
  scope: string;
  state: string;
  token_type: string;
}

export interface OIDCIdentity {
  preferred_username: string;
  sub: string;
}

class ChromeStorageWrapper {
  storage: chrome.storage.StorageArea;

  constructor(storage: chrome.storage.StorageArea) {
    this.storage = storage;
  }

  getItem = (key: string) => {
    return this.storage.get(key).then((o) => {
      const value = o[key] as unknown;
      return typeof value == "string" ? value : JSON.stringify(value);
    });
  };
  setItem = (key: string, value: string) => this.storage.set({ [key]: value });
  removeItem = (key: string) => this.storage.remove(key);
}

export default defineStore("sotc", {
  state: () => ({
    auth: useStorageAsync<Partial<Auth>>("auth", {}, new ChromeStorageWrapper(chrome.storage.local)),
    // There were problems using `OIDCIdentity | undefined` because Pinia
    // serialized the object as "[object Object]". By forcing it always to be an
    // object (if only a partial object), we avoided that problem.
    id: useStorageAsync<Partial<{ data: OIDCIdentity }>>("id", {}, new ChromeStorageWrapper(chrome.storage.local)),
    overlay: useStorageAsync<Partial<{ pos: Offsets }>>("overlay", {}, new ChromeStorageWrapper(chrome.storage.local)),
  }),
  getters: {
    accessToken: (state) => state.auth.access_token,
    broadcasterId: (state) => state.id.data?.sub,
  },
});
