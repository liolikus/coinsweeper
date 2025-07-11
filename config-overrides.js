// config-overrides.js
module.exports = function override(config) {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      buffer: require.resolve('buffer/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
    };
    
    // Add global polyfill for browser environment
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        global: 'globalThis',
      })
    );

    // Add proxy configuration for Zama relayer to avoid CORS issues
    if (config.devServer) {
      config.devServer.proxy = {
        '/api/relayer': {
          target: 'https://relayer.testnet.zama.cloud',
          changeOrigin: true,
          pathRewrite: {
            '^/api/relayer': '',
          },
          secure: true,
        },
      };
    }
    
    return config;
  };