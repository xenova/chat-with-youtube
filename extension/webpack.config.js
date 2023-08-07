
import path from 'path';
import { fileURLToPath } from 'url';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        popup: './src/popup.js',
        content: './src/content.js',
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                // Use babel loaded for JS and JSX files:
                // https://stackoverflow.com/a/52693007/10952640
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',

                options: {
                    presets: [
                        '@babel/preset-env',
                        // https://stackoverflow.com/a/64994595/13989043
                        ['@babel/preset-react', { 'runtime': 'automatic' }]
                    ]
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/popup.html',
            filename: 'popup.html',
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'public',
                    to: '.' // Copies to build folder
                },
                {
                    from: 'src/popup.css',
                    to: 'popup.css'
                }
            ],
        })
    ],
};

export default config;
