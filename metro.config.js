const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for resolving react-navigation modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper module resolution for react-navigation
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 