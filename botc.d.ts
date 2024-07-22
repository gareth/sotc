// This file defines types and interfaces which are implemented in the botc.app
// website and are therefore not available to our code.
//
// It's not a complete list, in fact the only properties included are the ones
// we're directly using or are immediately related. So for example most
// properties of a Vue app are missing. But properties that do exist are
// intended to be typed correctly. The Vue $store actually uses the Vue `Store`
// interface to ensure correct typing as far as possible.
declare namespace botc {
  export interface Role {
    ability: string;
    edition?: string;
    firstNight?: number;
    firstNightReminder?: string;
    id: string;
    name: string;
    otherNight?: number;
    otherNightReminder?: string;
    reminders?: string[];
    setup?: boolean;
    team: string;
  }

  export interface Edition {
    name: string;
    author?: string;
    isOfficial: boolean;
  }

  export type Alignment = "g" | "e" | null;

  export interface Player {
    id: string;
    role: Role | Record<string, never>; // {} used for blank tokens
    alignment: Alignment;
    isDead: boolean;
    isVoteless: boolean;
    revealed: boolean;
  }

  export interface User {
    username: string;
  }

  export interface Store {
    edition: Edition;
    roles: Map<string, Role>;
    game: {
      history: never[];
      phase: never;
      isRunning: never;
    };
    grimoire: {
      mode: string | undefined;
    };
    players: {
      players: Player[];
    };
    session: {
      users: Map<string, User>;
    };
  }
}

declare module "botc" {
  import type { Store } from "vuex/types/index.d.ts";
  import type { Router, RouteRecord } from "vue-router";

  interface BOTCVueApp {
    _context: {
      config: {
        globalProperties: {
          $store: Store<botc.Store>;
          $router: Router;
          $route: RouteRecord;
        };
      };
    };
  }
}
