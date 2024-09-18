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

interface StorageEventDetail {
  key: string;
  newValue: string | null | undefined;
  oldValue: string | null | undefined;
}

class StorageEvent extends Event {
  key: string;
  newValue: string | null | undefined;
  oldValue: string | null | undefined;

  constructor(type: string, options: EventInit & StorageEventDetail) {
    const superOptions: Partial<EventInit & StorageEventDetail> = { ...options };
    delete superOptions.key;
    delete superOptions.newValue;
    delete superOptions.oldValue;
    super(type, superOptions);
    this.key = options.key;
    this.newValue = options.newValue;
    this.oldValue = options.oldValue;
  }
}

// Proxy the extension-native `chrome.storage` change event into a "fake"
// `StorageEvent`.
//
// This is because @vueuse attaches a `storage` event listener to its "window"
// object. We're not in a window though, so we have to make vueuse believe we
// are.
chrome.storage.onChanged.addListener((changes) => {
  Object.entries(changes).forEach(([key, change]) => {
    const detail = {
      key: key,
      oldValue: change.oldValue as string | null | undefined,
      newValue: change.newValue as string | null | undefined,
    };
    const event = new StorageEvent("storage", { ...detail });
    dispatchEvent(event);
  });
});

export default defineStore("sotc", {
  state: () => ({
    auth: useStorageAsync<Partial<{ data: Auth }>>("auth", {}, new ChromeStorageWrapper(chrome.storage.local), {
      window: self,
    }),
    // There were problems using `OIDCIdentity | undefined` because Pinia
    // serialized the object as "[object Object]". By forcing it always to be an
    // object (if only a partial object), we avoided that problem.
    id: useStorageAsync<Partial<{ data: OIDCIdentity }>>("id", {}, new ChromeStorageWrapper(chrome.storage.local), {
      window: self,
    }),
    overlay: useStorageAsync<Partial<{ pos: Offsets }>>("overlay", {}, new ChromeStorageWrapper(chrome.storage.local), {
      window: self,
    }),
  }),
  getters: {
    accessToken: (state) => state.auth.data?.access_token,
    broadcasterId: (state) => state.id.data?.sub,
    connection: (state) =>
      state.id.data && state.auth.data ? { auth: state.auth.data, id: state.id.data } : undefined,
  },
});
