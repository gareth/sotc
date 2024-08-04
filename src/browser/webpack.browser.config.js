import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

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
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "public", to: "public" }],
    }),
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
