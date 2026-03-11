const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Expo's getDefaultConfig enables unstable_enablePackageExports:true.
// This causes Metro to apply a package's exports map to ALL imports — including
// relative ones INSIDE the package itself (e.g. ./ExponentConstants inside
// expo-constants, ./infiniteQueryOptions.js inside @tanstack/react-query).
// Files not listed in the exports map are treated as non-existent, which breaks
// many packages (expo-constants, @tanstack/react-query, etc.).
//
// Fix: disable package exports resolution. Metro falls back to the "main" field
// (via resolverMainFields: ['react-native', 'browser', 'main']) which correctly
// points to CJS/native builds for all our dependencies. Relative imports within
// packages are resolved directly from the filesystem as expected.
config.resolver.unstable_enablePackageExports = false;

// axios main field points to dist/node/axios.cjs which requires 'crypto' (Node-only).
// extraNodeModules doesn't override existing packages — use resolveRequest instead.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs'),
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16,
});
