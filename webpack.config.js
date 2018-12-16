const ExtractTextPlugin = require("extract-text-webpack-plugin");
var http = require('http');
var querystring = require('querystring');


let path = require('path');

console.log("webpack Dev Server (WDS) is launched. DEV");

module.exports = {
    devtool: 'source-map', //only to debug
    entry: {
        /*'server' : './src/server.ts',*/
        'index' : './src/index.ts'
    },
    mode: 'development',
    performance: { hints: false },

    module: {
        rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        },
        {
            test:/\.(s*)css$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader','sass-loader']
            })
        },
        {
            test:/\.(mp3|aac|ogg)$/,
            loader: 'file-loader'
        },
        {
            test: /\.(png|jp(e*)g|svg)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8000, // Convert images < 8kb to base64 strings
                    name: 'images/[hash]-[name].[ext]'
                }
            }]
        }]

    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    devServer: {
        contentBase: './',
        https: false,
        open: false,
        progress:false,
        inline:true,
        port: 8080,
        host: '127.0.0.1',
        overlay: {
          warnings: false,
          errors: true
        },
        proxy: {
          "/api/*": {
            target: "http://localhost:9090"
          }
        },
        compress: true
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        library: 'MCP'
    }
};
