import React, { useState, useEffect, Suspense } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Animal, SafeZone } from '../types';

interface Props {
  animals: Animal[];
  safeZone: SafeZone;
  selectedAnimal: Animal | null;
  onMarkerPress: (animal: Animal) => void;
}

// Dynamically import the Leaflet map so it is NOT executed on the server.
// Leaflet uses 'window' at the module level which crashes Expo static rendering (SSR).
const InnerMap = React.lazy(() => import('./InnerMap.web'));

export default function HerdMapView(props: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This only runs on the client browser, never on the server.
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <Suspense fallback={
      <View style={[styles.container, styles.loading]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    }>
      <InnerMap {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B0E' },
  loading: { justifyContent: 'center', alignItems: 'center' },
});
