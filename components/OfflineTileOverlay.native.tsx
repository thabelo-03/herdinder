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
 * Using UrlTile from react-native-maps.
 * Note: Mapbox tiles require a PUBLIC TOKEN (pk....), not a secret key (sk....).
 */
export default function HFMapOfflineOverlay(props: OfflineTileOverlayProps) {
    // Native layers often expect a raw path without the "file://" prefix
    const cleanPath = props.cachePath ? props.cachePath.replace('file://', '') : undefined;

    if (__DEV__) {
        console.log('[HFMapOfflineOverlay] urlTemplate:', props.urlTemplate);
        console.log('[HFMapOfflineOverlay] cachePath:', cleanPath);
    }

    // Fallback if urlTemplate is missing to prevent crashes
    if (!props.urlTemplate) {
        return null;
    }

    return (
        <UrlTile
            urlTemplate={props.urlTemplate}
            zIndex={props.zIndex ?? -1}
            maximumZ={props.maximumZ ?? 19}
            tileSize={props.tileSize ?? 256}
            // @ts-ignore - tileCachePath and offlineMode are supported on Android
            offlineMode={false} 
            tileCachePath={cleanPath}
            opacity={props.opacity ?? 1}
        />
    );
}
