import { Bounds, Offsets } from "../../core/util/bounds";
import { CharacterType, Grimoire, Script } from "./sotc";

export interface NavigateEventDetail {
  page?: string;
}

export interface PlayerCharacter {
  id: string;
  alignment: botc.Alignment;
  team: CharacterType;
}

export type Seat = Partial<{
  user?: string;
  role?: PlayerCharacter;
  pos: Bounds;
}> & {
  isDead: boolean;
  isVoteless: boolean;
  revealed: boolean;
};

export type GamePhase = { phase: "inactive" } | { phase: "running"; count: number } | { phase: "reveal" };

export interface GameState {
  phase: number;
  isRunning: boolean;
  isNight: boolean;
}

export interface SOTCMessagePayloadType {
  pageChange: NavigateEventDetail;
  scriptChange: Script;
  playersChange: Seat[];
  grimChange: Grimoire;
  overlayOffsets: { offsets: Offsets };
  startCalibration: void;
  endCalibration: void;
  gameState: GameState;
}

export type SOTCEvent = {
  [K in keyof SOTCMessagePayloadType as `sotc-${K}`]: SOTCMessagePayloadType[K];
};

export type SOTCEventMap = {
  [K in keyof SOTCEvent]: CustomEvent<{ detail: SOTCEvent[K] }>;
};

export interface SOTCEventMessage<T extends keyof SOTCEvent> {
  type: T;
  payload: SOTCEvent[T];
}

export function isSOTCEventMessage<T extends keyof SOTCEvent>(message: object): message is SOTCEventMessage<T> {
  return typeof message == "object" && "type" in message && typeof message.type == "string" && "payload" in message;
}

// Generate a CustomEvent object with type checking
//
// Custom Event objects don't include type-checking by default, you can pass any
// detail object into any named event. This wrapper ensures that a) the event
// name matches one of the SOTC events we're expecting and b) the corresponding
// detail type is correctly typed too.
export const sotcEvent = <T extends keyof SOTCEvent>(type: T, detail: CustomEventInit<SOTCEvent[T]>) =>
  // We use `no-restricted-syntax` to guard against `new CustomEvent` in *other*
  // places, specifically because we want to use this version
  new CustomEvent(type, detail); // eslint-disable-line no-restricted-syntax
