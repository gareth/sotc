import path from "path";

export default {
  extends: [path.resolve(import.meta.dirname, "webpack.browser.config.js")],
  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, "../../dist/firefox"),
  },
  module: {
    rules: [
      {
        // Generate a CRX manifest programatically
        test: /manifest.json$/,
        use: ["manifest-loader", "manifest-firefox-transformer"],
      },
    ],
  },
};
