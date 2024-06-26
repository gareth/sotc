import { Game } from "../sotc/Game";

export enum RuntimeMessageType {
  GET_GAME_STATE = "get_game_state",
  NAVIGATE = "navigate",
}

export interface RuntimeMessage {
  type: RuntimeMessageType;
  payload?: unknown;
}
export const isRuntimeMessage = (message: object): message is RuntimeMessage => "type" in message;

export type SOTCMessage =
  | {
      type: "gameState";
      payload: Game;
    }
  | { type: "navigate"; payload: string };
