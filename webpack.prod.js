const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

/*let babelOptions = {
    "presets": [[
        "es2015",
        {
            "modules": false
        }
        ],
        "es2016"
    ]
};*/
console.log("webpack Dev Server (WDS) is launched. PROD");

module.exports = {
    devtool: 'source-map',
    entry: {
        'server' : './src/server/server.ts',
        'index'  : './src/index.ts'
    },
    target : 'node',
    mode: 'production',
    performance: { hints: false },
    optimization: {
    minimizer: [
      // we specify a custom UglifyJsPlugin here to get source maps in production
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 6,
          mangle: true
        },
        sourceMap: true
      })
    ]},
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: [
                /*{
                    loader: 'babel-loader',
                    options: babelOptions
                },*/
                {
                    loader: 'ts-loader'
                }
            ],
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
    plugins:[
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        //new webpack.optimize.UglifyJsPlugin({sourceMap: true, compress: true})
        //,new BundleAnalyzerPlugin()
    ],

    devServer: {
        contentBase: './',
        https: false,
        inline:true,
        port: 8080,
        host: '192.168.1.17',
        open: false,
        progress:false,
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
