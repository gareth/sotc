import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";

export default {
  extends: [path.resolve(import.meta.dirname, "webpack.base.config.js")],

  entry: {
    overlay: "./src/twitch/overlay.ts",
  },
  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, "dist", "twitch"),
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: "overlay.html",
      template: "src/twitch/overlay.html",
      chunks: ["overlay"],
    }),
    new HtmlWebpackPlugin({
      filename: "panel.html",
      template: "src/twitch/overlay.html",
      chunks: ["overlay"],
    }),
  ],
};
