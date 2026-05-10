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

    const isSecretKey = props.urlTemplate?.includes('access_token=sk.');

    if (__DEV__) {
        if (isSecretKey) {
            console.warn('[HFMapOfflineOverlay] WARNING: You are using a Mapbox SECRET KEY (sk.). Tiles will likely be blocked on mobile. Please use a PUBLIC TOKEN (pk.).');
        }
        console.log('[HFMapOfflineOverlay] urlTemplate:', props.urlTemplate);
    }

    if (!props.urlTemplate) return null;

    return (
        <UrlTile
            urlTemplate={props.urlTemplate}
            // Use a positive zIndex to ensure it's above the base layer on Android
            zIndex={props.zIndex && props.zIndex > 0 ? props.zIndex : 1}
            maximumZ={props.maximumZ ?? 19}
            tileSize={props.tileSize ?? 256}
            // Removed caching props temporarily to debug network loading
            opacity={props.opacity ?? 1}
        />
    );
}
