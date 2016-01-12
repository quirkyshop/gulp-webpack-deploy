/**
 * Created by john on 15/9/28.
 */
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var node_modules_dir = path.resolve(__dirname, 'node_modules');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var config = {
    devtool: 'cheap-source-map',
    entry: {
        app:path.resolve(__dirname, "app/src/app.js"),
        old:path.resolve(__dirname, "app/src/old.js")
    },
    resolve: {
        alias: {}
    },
    output: {
        path: path.resolve(__dirname, 'app/dist'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js[x]?$/,
                exclude:[node_modules_dir],
                loaders: ['babel-loader'],
            },
            // 外部的css文件
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            },
            {test: /\.(png|jpg)$/, loader: 'url?limit=25000'}
        ],
        noParse: []
    },
    plugins: [
        new ExtractTextPlugin("style.css"),
        new webpack.optimize.DedupePlugin(),
        new uglifyJsPlugin({
          compress: {
            warnings: false
          }
        }),
        new CopyWebpackPlugin([
          { from: './app/src/index.html', to: 'index.html' }
        ])
    ]
};

module.exports = config;