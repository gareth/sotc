export enum RuntimeMessageType {
  GET_GAME_STATE = "get_game_state",
}

export type RuntimeMessage = { type: RuntimeMessageType.GET_GAME_STATE };
export const isRuntimeMessage = (message: any): message is RuntimeMessage =>
  "type" in message;
