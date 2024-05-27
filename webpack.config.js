import HtmlWebpackPlugin from "html-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";

export default {
  mode: "development",

  entry: {
    popup: "./src/popup.ts",
    content: "./src/content.ts",
    inject: "./src/inject.ts",
    worker: "./src/worker.ts",
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
      chunks: ["popup"],
    }),
    new VueLoaderPlugin(),
  ],
};
