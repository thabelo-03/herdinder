import { Platform } from 'react-native';
import NativeMap from './SafeZoneEditorMap.native';
import WebMap from './SafeZoneEditorMap.web';

export default Platform.select({
  native: () => NativeMap,
  default: () => WebMap,
})();
