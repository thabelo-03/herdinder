const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');


/**
 * Fix: Metro's platform-extension resolver tries to append .web.ts, .ts, etc.
 * to the `main` field of packages like leaflet (dist/leaflet-src.js).
 * We short-circuit it by explicitly pointing to the built file.
 */
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'leaflet') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/leaflet/dist/leaflet-src.js'),
      type: 'sourceFile',
    };
  }
  // Fall back to default resolution for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

