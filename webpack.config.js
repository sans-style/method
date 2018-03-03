const LiveReloadPlugin = require('webpack-livereload-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: [
        './assets/js/app.js',
        './assets/scss/app.scss',
    ],
    output: {
        filename: './public/js/app.js'
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.(sass|scss|css)$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader',
                    options: {
                        minimize: true,
                        sourceMap: true
                    }
                }, {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true
                    }
                }]
            })
        }]
    },
    plugins: [
        new ExtractTextPlugin('./public/css/app.css'),
        new LiveReloadPlugin({ port: 43215 }),
        new NodemonPlugin({
			watch: './',
            ignore: ['public/*', 'assets/*'],
			script: './server.js',
		}),
    ]
};
