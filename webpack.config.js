const HtmlWebPackPlugin = require("html-webpack-plugin")
const TerserPlugin = require('terser-webpack-plugin')
const BrotliPlugin = require('brotli-webpack-plugin')
const path = require('path')

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./public/index.html",
  filename: "./index.html",
  favicon: "./public/favicon.ico",
});


module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          toplevel: true,
          compress: {
            arrows: true,
            arguments: true,
            booleans_as_integers: true,
            dead_code: true, // big one--strip code that will never execute
            warnings: false, // good for prod apps so users can't peek behind curtain
            drop_debugger: true,
            drop_console: true, // strips console statements
          }
        }
      })
    ],
  },
  devServer: {
    historyApiFallback: true,
    contentBase: path.join(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: "[local]",
              sourceMap: true
            }
          }
	]
      },
      {
        test: /\.(png|svg|jpg|gif|ico)$/, 
	use: [
		'file-loader',	
             ],
      }
    ],
  },
  plugins: [
    htmlPlugin,
    new BrotliPlugin({
      asset: '[path].br[query]',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8
    }),
  ]
}
