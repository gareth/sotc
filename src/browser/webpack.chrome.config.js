import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";

export default {
  extends: [path.resolve(import.meta.dirname, "../../webpack.base.config.js")],

  resolveLoader: {
    modules: [path.resolve(import.meta.dirname, "webpack")],
  },
  entry: {
    popup: "./popup.ts",
    content: "./content.ts",
    inject: "./inject.ts",
    worker: "./worker.ts",
    options: "./options.ts",
    manifest: "./manifest.json",
  },
  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, "../..", "dist", "chrome"),
  },

  module: {
    rules: [
      {
        // Generate a CRX manifest programatically
        test: /manifest.json$/,
        use: ["manifest-loader"],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: "options.html",
      chunks: ["options"],
      filename: "options.html",
    }),
  ],
};
