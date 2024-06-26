export interface SOTCEvent {
  "sotc-noop": object;
}

// Generate a CustomEvent object with type checking
//
// Custom Event objects don't include type-checking by default, you can pass any
// detail object into any named event. This wrapper ensures that a) the event
// name matches one of the SOTC events we're expecting and b) the corresponding
// detail type is correctly typed too.
export const sotcEvent = <T extends keyof SOTCEvent>(
  type: T,
  detail: CustomEventInit<SOTCEvent[T]>
) => new CustomEvent(type, detail);
