import { requireNativeComponent, ViewProps } from 'react-native';

interface OfflineTileOverlayProps extends ViewProps {
    cachePath: string;
    urlTemplate?: string;
    maximumZ?: number;
    zIndex?: number;
    opacity?: number;
    fade?: boolean;
    visible?: boolean;
    tileSize?: number;
}

// requireNativeComponent will look for a ViewManager named "OfflineTileOverlay"
// registered in the native Android/iOS code.
const OfflineTileOverlay = requireNativeComponent<OfflineTileOverlayProps>('OfflineTileOverlay');

export default OfflineTileOverlay;
