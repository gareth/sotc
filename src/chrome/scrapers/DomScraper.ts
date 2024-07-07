import { Script } from "../types/sotc";

export default function (container: HTMLElement): Script | undefined {
  if (container.querySelector("#grimoire")) {
    return {
      name: "GameScript",
      author: "The DOM",
      characters: [],
    };
  }
}
