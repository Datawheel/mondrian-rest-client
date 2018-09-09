var path = require("path");
var webpack = require("webpack");
var WriteFilePlugin = require("write-file-webpack-plugin");
var packageJson = require("./package.json");
var execSync = require('child_process').execSync;

var LICENSE_HEADER =
`mondrian-rest-client ${packageJson.version} (https://github.com/Datawheel/mondrian-rest-client)
rev ${execSync('git rev-parse --short HEAD')}
Copyright 2018 Datawheel, LLC
Licensed under MIT`;

module.exports = [
  {
    entry: "./build/src/index.js",
    output: {
      filename: "lib/mondrian-rest.js",
      // adds the UMD header to allow export to AMD, commonJS, or global
      libraryTarget: "umd",
      // the name of the AMD/commonJS/global
      library: "mondrian-rest"
    },
    externals: [
      {
        'axios': {
          root: 'axios',
          commonjs2: 'axios',
          commonjs: 'axios',
          amd: 'axios'
        }
      }
    ],
    module: {
      loaders: [
          {
              exclude: path.join(__dirname, 'node_modules'),
              test: path.join(__dirname, 'build', 'src'),
              loader: 'babel-loader',
              query: {
                  presets: ['es2015', 'stage-0']
              }
          }
      ]
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: LICENSE_HEADER,
        entryOnly: true
      }),
      new webpack.DefinePlugin({
        "__VERSION__": JSON.stringify(packageJson.version)
      }),
      new webpack.optimize.UglifyJsPlugin({
          compress: {
              warnings: false
          }
      }),
      new WriteFilePlugin()
    ]
  }
];
