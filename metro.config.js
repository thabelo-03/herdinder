const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

/**
 * Custom resolver to:
 * 1. Fix leaflet resolution (Metro tries to add platform extensions to its .js main field)
 * 2. Redirect native-only modules to web stubs when bundling for web
 */
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // --- Web-only redirects ---
  if (platform === 'web') {
    // Redirect native MQTT service to web stub
    if (
      moduleName.includes('/services/mqtt') &&
      !moduleName.includes('.web')
    ) {
      return {
        filePath: path.resolve(__dirname, 'services/mqtt.web.ts'),
        type: 'sourceFile',
      };
    }

    // Redirect native StorageManager to web stub
    if (
      moduleName.includes('/services/storageManager') &&
      !moduleName.includes('.web')
    ) {
      return {
        filePath: path.resolve(__dirname, 'services/storageManager.web.ts'),
        type: 'sourceFile',
      };
    }

    // Fix leaflet resolution on web only
    if (moduleName === 'leaflet') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/leaflet/dist/leaflet-src.js'),
        type: 'sourceFile',
      };
    }
  }

  // Fall back to default resolution for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

