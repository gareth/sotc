import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";

export default {
  extends: [path.resolve(import.meta.dirname, "webpack.base.config.js")],

  entry: {
    popup: "./src/chrome/popup.ts",
    content: "./src/chrome/content.ts",
    inject: "./src/chrome/inject.ts",
    worker: "./src/chrome/worker.ts",
    options: "./src/chrome/options.ts",
    manifest: "./manifest.json",
  },
  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, "dist", "chrome"),
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
      template: "src/chrome/popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: "src/chrome/options.html",
      chunks: ["options"],
      filename: "options.html",
    }),
  ],
};
