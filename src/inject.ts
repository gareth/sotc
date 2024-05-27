import { TaggedLogger } from "./util/TaggedLogger";

type HTMLVueElement = HTMLElement & { __vue_app__: any };

const logger = new TaggedLogger("Injected");

logger.info("Content");

document.addEventListener("detectVueInstance", () => {
  const main = document.getElementById("main") as HTMLVueElement;
  if (!main) return;
  if (main.__vue_app__) {
    console.log("Detected Vue app", main.__vue_app__);
    document.dispatchEvent(
      new CustomEvent("vueInstance", {
        detail: main.__vue_app__,
      })
    );
  }
});
