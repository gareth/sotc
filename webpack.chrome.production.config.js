import path from "path";
import ZipPlugin from "zip-webpack-plugin";

import WebpackBundleAnalyzer from "webpack-bundle-analyzer";

export default {
  extends: [path.resolve(import.meta.dirname, "webpack.chrome.config.js")],

  mode: "production",
  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, "dist", "chrome-production"),
  },
  plugins: [
    new WebpackBundleAnalyzer.BundleAnalyzerPlugin(),
    new ZipPlugin({
      filename: "stream-on-the-clocktower.zip",
    }),
  ],
};
