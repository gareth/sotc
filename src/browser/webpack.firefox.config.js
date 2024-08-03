import path from "path";

export default {
  extends: [path.resolve(import.meta.dirname, "webpack.browser.config.js")],
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
