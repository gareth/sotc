import path from "path";
import ZipPlugin from "zip-webpack-plugin";

export default {
  extends: [path.resolve(import.meta.dirname, "webpack.firefox.config.js")],

  mode: "production",
  devtool: false,
  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, "../../dist/firefox-production"),
  },
  plugins: [
    new ZipPlugin({
      filename: "stream-on-the-clocktower.zip",
    }),
  ],
};
