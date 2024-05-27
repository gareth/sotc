import HtmlWebpackPlugin from "html-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import path from "path";
import webpack from "webpack";

export default {
  mode: "development",

  entry: {
    popup: "./src/popup.ts",
    content: "./src/content.ts",
    inject: "./src/inject.ts",
    worker: "./src/worker.ts",
    manifest: "./manifest.json",
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
      template: "src/popup.html",
      chunks: ["popup"],
    }),
    new VueLoaderPlugin(),
  ],
};
