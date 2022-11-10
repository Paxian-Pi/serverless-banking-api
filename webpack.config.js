const path = require("path")

module.exports = {
  entry: "./functions/server.js",
  output: {
    filename: "bundled.js",
    path: path.resolve(__dirname, "dist")

    // path: path.resolve(__dirname, './src'), //src instead of dist
    // publicPath: '/src/', //src instead of dist
    // filename: 'main.js' //main.js instead of build.js
  },
  mode: "production",
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       exclude: /(node_modules|bower_components)/,
  //       use: {
  //         loader: "babel-loader",
  //         options: {
  //           presets: [["@babel/preset-env", { "useBuiltIns": "usage", "corejs": 3, "targets": "defaults" }], "@babel/preset-react"]
  //         }
  //       }
  //     }
  //   ]
  // }
}
