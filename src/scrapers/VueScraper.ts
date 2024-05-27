import { Script } from "../sotc/Game";

export default function (_container: HTMLElement): Script {
  return {
    name: "GameScript",
    author: "Vue",
    characters: [],
  };
}

// Useful nodes here (although the context may not be available in extension space)
// const vueApp = (parentNode as any).__vue_app__;
// const store = vueApp._context.config.globalProperties.$store;
