import React from 'react';
import { View } from 'react-native';

/**
 * Mock component for Web - the web map uses Leaflet which handles 
 * its own tile caching/overlays differently.
 */
export default function OfflineTileOverlay() {
    return <View />;
}
