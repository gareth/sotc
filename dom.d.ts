import { GameStateEvent, NavigateEvent, ScriptEvent } from "./src/types/event";

// Declare the event types for our custom events. This allows for compile-time
// checking of our own event handling code, otherwise event data would be
// inferred as `any`
declare global {
  interface GlobalEventHandlersEventMap {
    "sotc-script": CustomEvent<ScriptEvent>;
    "sotc-gameState": CustomEvent<GameStateEvent>;
    "sotc-navigate": CustomEvent<NavigateEvent>;
  }
}

export {}; // Tell Typescript to treat this as a module
