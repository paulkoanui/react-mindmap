const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './src/index.jsx',

  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'MindMap',
  },

  module: {
    loaders: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
      },
      // {
      //   test: /\.css$/,
      //   include: '/node_modules/semantic-ui-css',
      //   use: ExtractTextPlugin.extract({
      //     fallback: "style-loader",
      //     use: [
      //       {
      //         loader: 'css-loader',
      //       },
      //       {
      //         loader: 'postcss-loader',
      //       },
      //     ],
      //   })
      // },
      {
        test: /\.css$/,
        include: /node_modules/,
        loader: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        exclude: /node_modules/,
        loader: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            limit: 100000,
          },
        },
      },
    ],
  },

  resolve: {
    alias: { d3: path.resolve(__dirname, 'dist/d3.min.js') },
  },

  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
  },
};
