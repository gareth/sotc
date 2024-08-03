import path from "path";

import WebExtPlugin from "web-ext-plugin";

export default {
  extends: [path.resolve(import.meta.dirname, "webpack.firefox.config.js")],
  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, "../../dist/firefox"),
  },
  plugins: [
    new WebExtPlugin({
      sourceDir: path.resolve(import.meta.dirname, "../../dist/firefox"),
      firefoxProfile: "streamclocktower",
      keepProfileChanges: true,
    }),
  ],
};
