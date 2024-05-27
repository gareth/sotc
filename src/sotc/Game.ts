enum CharacterType {
  TOWNSFOLK,
  OUTSIDER,
  MINION,
  DEMON,
}

enum CharacterAlignment {
  GOOD,
  EVIL,
}

export type Character = {
  id: string;
  name: string;
  ability: string;
  wiki_url?: string;
  type: CharacterType;
  alignment: CharacterAlignment;
};

export type Script = {
  name: string;
  author: string;
  characters: Character[];
};

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
