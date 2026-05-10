import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { getTempColor } from '../constants/Colors';
import { Animal, SafeZone } from '../types';

interface Props {
  animals: Animal[];
  safeZone: SafeZone;
  selectedAnimal: Animal | null;
  onMarkerPress: (animal: Animal) => void;
}

const BASE_LAT = -20.85;
const BASE_LNG = 29.05;
const INITIAL_REGION = { latitude: BASE_LAT, longitude: BASE_LNG, latitudeDelta: 0.06, longitudeDelta: 0.06 };

export default function HerdMapView({ animals, safeZone, selectedAnimal, onMarkerPress }: Props) {
  const mapRef = useRef<MapView>(null);
  const [delta, setDelta] = useState(0.06);

  const zoom = useCallback((factor: number) => {
    const next = Math.min(Math.max(delta * factor, 0.002), 1);
    setDelta(next);
    mapRef.current?.animateToRegion({ latitude: BASE_LAT, longitude: BASE_LNG, latitudeDelta: next, longitudeDelta: next }, 300);
  }, [delta]);

  const recenter = useCallback(() => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 400);
    setDelta(0.06);
  }, []);

  const handlePress = useCallback((animal: Animal) => {
    onMarkerPress(animal);
    mapRef.current?.animateToRegion({ latitude: animal.latitude, longitude: animal.longitude, latitudeDelta: delta, longitudeDelta: delta }, 400);
  }, [onMarkerPress, delta]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType="hybrid"
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={(r) => setDelta((r.latitudeDelta + r.longitudeDelta) / 2)}
      >

        <Polygon coordinates={safeZone.coordinates} strokeColor={Colors.safeZoneBorder} strokeWidth={2} fillColor={Colors.safeZoneFill} lineDashPattern={[8, 6]} />

        {animals.map((animal) => {
          const tempColor = getTempColor(animal.temperature);
          const isSelected = selectedAnimal?.id === animal.id;
          return (
            <Marker key={animal.id} coordinate={{ latitude: animal.latitude, longitude: animal.longitude }} onPress={() => handlePress(animal)} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
              <View style={styles.markerWrapper}>
                <View style={[styles.markerBubble, isSelected && { borderColor: Colors.primary, borderWidth: 2 }]}>
                  <Text style={styles.markerName}>{animal.name}</Text>
                  <Text style={[styles.markerTemp, { color: tempColor }]}>{animal.temperature}°C</Text>
                </View>
                <View style={[styles.markerPin, { backgroundColor: tempColor }]}>
                  <FontAwesome name="paw" size={10} color="#FFF" />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={recenter}>
          <FontAwesome name="crosshairs" size={17} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => zoom(0.5)}>
          <FontAwesome name="plus" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => zoom(2)}>
          <FontAwesome name="minus" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Safe Zone badge */}
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Safe Zone Active</Text>
      </View>

      {/* Google provides its own attribution automatically */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerWrapper: { alignItems: 'center' },
  markerBubble: {
    backgroundColor: 'rgba(10,10,20,0.90)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },
  markerName: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  markerTemp: { fontSize: 13, fontWeight: 'bold', marginTop: 1 },
  markerPin: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    marginTop: -2, borderWidth: 2, borderColor: '#FFF', elevation: 6,
  },
  controls: { position: 'absolute', right: 12, top: '28%', gap: 10 },
  controlBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(10,10,20,0.88)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', elevation: 6,
  },
  badge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,10,20,0.82)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.safeZoneBorder, gap: 6,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.safeZoneBorder },
  badgeText: { color: Colors.safeZoneBorder, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

});
