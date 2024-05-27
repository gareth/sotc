export enum RuntimeMessageType {
  GET_GAME_STATE,
}

export type RuntimeMessage = { type: RuntimeMessageType.GET_GAME_STATE };
export const isRuntimeMessage = (message: any): message is RuntimeMessage =>
  "type" in message;
