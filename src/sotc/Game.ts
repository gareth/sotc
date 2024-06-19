import { Script } from "../types/sotc";

type InactiveGame = { type: "pregame" | "postgame" };
type ActiveGame = { type: "day" | "night"; count: number };

type GamePhase = InactiveGame | ActiveGame;

export class Game {
  script: Script;
  phase: GamePhase = { type: "pregame" };

  constructor(script: Script) {
    this.script = script;
  }
}
