import HtmlWebpackPlugin from "html-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import path from "path";
import webpack from "webpack";

export default {
  mode: "development",

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
  devtool: "source-map",

  resolveLoader: {
    modules: [path.resolve(import.meta.dirname, "webpack"), "node_modules"],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      vue: "vue/dist/vue.esm-bundler.js",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.scss$/,
        use: ["vue-style-loader", "css-loader", "sass-loader"],
      },
      {
        // Generate a CRX manifest programatically
        test: /manifest.json$/,
        use: ["manifest-loader"],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: "true",
      __VUE_PROD_DEVTOOLS__: "false",
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
    }),
    new HtmlWebpackPlugin({
      template: "src/chrome/popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      template: "src/chrome/options.html",
      chunks: ["options"],
      filename: "options.html",
    }),
    new VueLoaderPlugin(),
  ],
};
