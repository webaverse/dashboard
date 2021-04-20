module.exports = {
  webpack (config, { webpack }) {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000
        }
      }
    })
    config.plugins.push(new webpack.IgnorePlugin(/^electron$/));
    // config.optimization.minimize = false;

    return config
  }
}

