import HtmlWebpackPlugin from "html-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";

import path from "path";

const __dirname = import.meta.dirname;

export default {
  mode: "none",

  entry: "./src/index.ts",
  // output: {
  //   filename: "main.js",
  //   path: path.resolve(__dirname, "dist"),
  // },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
  },
  devtool: "source-map",

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
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "src/popup.html",
    }),
    new VueLoaderPlugin(),
  ],
};
