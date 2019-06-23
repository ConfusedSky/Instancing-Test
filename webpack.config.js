const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./src/bootstrap.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bootstrap.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test:/\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.frag|.vert$/i,
        use: 'raw-loader',
      },
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js', '.wasm', '.frag', '.vert' ]
  },
  plugins: [
    new CopyWebpackPlugin(['index.html'])
  ],
};
