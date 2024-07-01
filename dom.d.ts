import { SOTCEventMap } from "./src/types/event";

// Declare the event types for our custom events. This allows for compile-time
// checking of our own event handling code, otherwise event data would be
// inferred as `any`
declare global {
  // It's OK to create an empty interface because we're merging with the type
  // from lib.dom.d.ts - Typescript doesn't know this automatically
  interface GlobalEventHandlersEventMap extends SOTCEventMap {} // eslint-disable-line @typescript-eslint/no-empty-interface
}

export {};
