import { GamePhase, Seat } from "./event";
import { lookup } from "./lookup";
import { Bounds, Offsets } from "../../core/util/bounds";

export const CharacterType = ["townsfolk", "outsider", "minion", "demon", "traveler"] as const;
export type CharacterType = (typeof CharacterType)[number];
export const characterType = lookup<string, CharacterType>(CharacterType);

export const CharacterAlignment = ["good", "evil", "unknown"] as const;
export type CharacterAlignment = (typeof CharacterAlignment)[number];
export const characterAlignment = lookup<string, CharacterAlignment>(CharacterAlignment);

export const CharacterAlignments = new Map<CharacterType, CharacterAlignment>([
  ["townsfolk", "good"],
  ["outsider", "good"],
  ["minion", "evil"],
  ["demon", "evil"],
  ["traveler", "unknown"],
]);

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

export interface Grimoire {
  pos: Bounds;
  container: Bounds;
  mode: string | undefined;
}

export interface ExtensionState {
  script: Script;
  page: string;
  seats: Seat[];
  grim: Grimoire;
  overlay: { pos: Offsets };
  game: GamePhase;
}
