import { Game } from "../sotc/Game";

export enum RuntimeMessageType {
  GET_GAME_STATE = "get_game_state",
  NAVIGATE = "navigate",
}

export type RuntimeMessage = { type: RuntimeMessageType; payload?: any };
export const isRuntimeMessage = (message: any): message is RuntimeMessage =>
  "type" in message;

export type SOTCMessage =
  | {
      type: "gameState";
      payload: Game;
    }
  | { type: "navigate"; payload: string };
