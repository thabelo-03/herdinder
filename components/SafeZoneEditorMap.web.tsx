import React, { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Colors from '../constants/Colors';

interface Props {
  initialCenter: { latitude: number; longitude: number };
  points: { latitude: number; longitude: number }[];
  onMapPress: (coordinate: { latitude: number; longitude: number }) => void;
}

// Dynamically import the Leaflet map so it is NOT executed on the server.
// Leaflet uses 'window' at the module level which crashes Expo static rendering (SSR).
const InnerSafeZoneEditorMap = React.lazy(() => import('./InnerSafeZoneEditorMap.web'));

export default function SafeZoneEditorMapWeb(props: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This only runs on the client browser, never on the server.
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Suspense fallback={
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    }>
      <InnerSafeZoneEditorMap {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { justifyContent: 'center', alignItems: 'center' },
});
