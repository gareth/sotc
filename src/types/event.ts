export type ScriptEvent = {
  edition: any;
  roles: unknown[];
};

export type GameStateEvent = {
  history: unknown;
  phase: unknown;
  isRunning: unknown;
  isNight: unknown;
};

export type NavigateEvent = {
  page: string;
};

interface SOTCEvent {
  "sotc-script": ScriptEvent;
  "sotc-gameState": GameStateEvent;
  "sotc-navigate": NavigateEvent;
}

export const sotcEvent = <T extends keyof SOTCEvent>(
  type: T,
  detail: CustomEventInit<SOTCEvent[T]>
) => new CustomEvent(type, detail);
