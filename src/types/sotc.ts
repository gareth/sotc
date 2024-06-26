export enum CharacterType {
  TOWNSFOLK = "townsfolk",
  OUTSIDER = "outsider",
  MINION = "minion",
  DEMON = "demon",
  TRAVELER = "traveler",
}

export enum CharacterAlignment {
  GOOD = "good",
  EVIL = "evil",
  UNKNOWN = "unknown", // e.g. a traveller without an alignment
}

export interface Character {
  id: string;
  name: string;
  ability: string;
  wiki_url?: string;
  type: CharacterType;
  alignment: CharacterAlignment;
}

export interface Script {
  name: string;
  author: string;
  characters: Character[];
}
