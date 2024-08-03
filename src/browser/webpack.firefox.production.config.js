import path from "path";
import WebExtPlugin from "web-ext-plugin";

export default {
  extends: [path.resolve(import.meta.dirname, "webpack.firefox.config.js")],
  mode: "production",
  devtool: false,

  output: {
    clean: true,
    path: path.resolve(import.meta.dirname, "../../dist/firefox-production"),
  },
  plugins: [
    new WebExtPlugin({
      buildPackage: true,
      sourceDir: path.resolve(
        import.meta.dirname,
        "../../dist/firefox-production"
      ),
    }),
  ],
};
