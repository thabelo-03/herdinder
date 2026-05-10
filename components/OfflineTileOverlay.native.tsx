import React from 'react';
import { UrlTile } from 'react-native-maps';

interface OfflineTileOverlayProps {
    cachePath: string;
    urlTemplate?: string;
    maximumZ?: number;
    zIndex?: number;
    opacity?: number;
    fade?: boolean;
    visible?: boolean;
    tileSize?: number;
}

/**
 * Fallback to react-native-maps' built-in UrlTile for mobile.
 * This avoids "View config not found" errors when the custom native bridge
 * hasn't been compiled into the current development build.
 */
const OfflineTileOverlay = (props: OfflineTileOverlayProps) => {
    return (
        <UrlTile
            urlTemplate={props.urlTemplate}
            zIndex={props.zIndex}
            maximumZ={props.maximumZ}
            tileSize={props.tileSize}
            // @ts-ignore - tileCachePath and offlineMode are supported on Android
            offlineMode={true}
            tileCachePath={props.cachePath}
            opacity={props.opacity}
        />
    );
};

export default OfflineTileOverlay;
