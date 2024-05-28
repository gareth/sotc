import { Script } from "../sotc/Game";

type HTMLVueElement = HTMLElement & { __vue_app__: any };

export default function (_container: HTMLElement): Script {
  const vueApp = (_container as HTMLVueElement).__vue_app__;
  const store = vueApp._context.config.globalProperties.$store;

  // debugger;

  return {
    name: "GameScript",
    author: "Vue",
    characters: [],
  };
}
