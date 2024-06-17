const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'NYC Celluloid Guide',
      xhtml: true,
      hash: true,
      template: "./src/frontend/index.html"
    }),
  ],
  entry: './src/frontend/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [__dirname + '/node_modules', __dirname + '/src/generator']
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};