import { Script } from "../sotc/Game";
import { mapState } from "vuex";
import { CharacterAlignment, CharacterType } from "../sotc/Game";

type HTMLVueElement = HTMLElement & { __vue_app__: any };

const ALIGNMENTS = new Map([
  ["townsfolk", CharacterAlignment.GOOD],
  ["outsider", CharacterAlignment.GOOD],
  ["minion", CharacterAlignment.EVIL],
  ["demon", CharacterAlignment.EVIL],
]);

const TYPES = new Map([
  ["townsfolk", CharacterType.TOWNSFOLK],
  ["outsider", CharacterType.OUTSIDER],
  ["minion", CharacterType.MINION],
  ["demon", CharacterType.DEMON],
]);

export default function (_container: HTMLElement): Script {
  const vueApp = (_container as HTMLVueElement).__vue_app__;
  const globals = vueApp._context.config.globalProperties;

  const map = (prop) => mapState([prop])[prop].bind(globals)();

  const roles = map("roles");
  const edition = map("edition");

  const mapRole = (r) => {
    const { id, name, team, ability } = r;
    const alignment = ALIGNMENTS.get(team);
    const type = TYPES.get(team);
    return { id, name, ability, alignment, type };
  };

  return {
    name: edition.name,
    author: edition.author,
    characters: [...roles.values()].map(mapRole),
  };
}
