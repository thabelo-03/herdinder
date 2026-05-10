/**
 * HerdFinder - Map Dashboard (Main Screen)
 *
 * - Native (Android/iOS): real react-native-maps + OpenStreetMap tiles
 * - Web: Leaflet.js in iframe (no API key, 100% free)
 *
 * TODO: HARDWARE INTEGRATION
 * - Connect to MQTT broker for real-time position/temp updates
 * - Replace mock coordinates with actual gateway triangulation data
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import { Animal } from '../../types';
import GatewayBanner from '../../components/GatewayBanner';
import AnimalDetailCard from '../../components/AnimalDetailCard';
// Metro automatically picks HerdMapView.native.tsx on device and HerdMapView.web.tsx on browser
import HerdMapView from '../../components/HerdMapView';

export default function MapScreen() {
  const router = useRouter();

  const animals = useAnimalStore((s) => s.animals);
  const gateway = useAnimalStore((s) => s.gateway);
  const safeZone = useAnimalStore((s) => s.safeZone);
  const selectedAnimal = useAnimalStore((s) => s.selectedAnimal);
  const selectAnimal = useAnimalStore((s) => s.selectAnimal);

  const handleMarkerPress = useCallback((animal: Animal) => selectAnimal(animal), [selectAnimal]);
  const handleCloseDetail = useCallback(() => selectAnimal(null), [selectAnimal]);
  const handleViewDetail = useCallback(() => {
    if (selectedAnimal) router.push(`/animal/${selectedAnimal.id}`);
  }, [selectedAnimal, router]);

  return (
    <SafeAreaView style={styles.screen}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn}>
          <FontAwesome name="bars" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <FontAwesome name="shield" size={16} color={Colors.primary} />
          <Text style={styles.headerTitle}> HerdFinder</Text>
        </View>
        <View style={styles.onlineIndicator}>
          <View style={[styles.onlineDot, { backgroundColor: gateway.status === 'online' ? Colors.success : Colors.danger }]} />
          <Text style={styles.onlineText}>{gateway.status === 'online' ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      {/* Gateway Banner */}
      <GatewayBanner gateway={gateway} />

      {/* Map — platform-specific (native or web) */}
      <View style={styles.mapContainer}>
        <HerdMapView
          animals={animals}
          safeZone={safeZone}
          selectedAnimal={selectedAnimal}
          onMarkerPress={handleMarkerPress}
        />
      </View>

      {/* Bottom Detail Card */}
      {selectedAnimal && (
        <AnimalDetailCard
          animal={selectedAnimal}
          onClose={handleCloseDetail}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* Quick Stats Bar */}
      {!selectedAnimal && (
        <View style={styles.quickStats}>
          <View style={styles.quickStatsRow}>
            <View style={styles.statItem}>
              <FontAwesome name="paw" size={14} color={Colors.primary} />
              <Text style={styles.statValue}>{animals.length}</Text>
              <Text style={styles.statLabel}>Cattle</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FontAwesome name="check-circle" size={14} color={Colors.success} />
              <Text style={styles.statValue}>{animals.filter((a) => a.temperature <= 38).length}</Text>
              <Text style={styles.statLabel}>Normal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FontAwesome name="exclamation-triangle" size={14} color={Colors.danger} />
              <Text style={styles.statValue}>{animals.filter((a) => a.temperature > 39).length}</Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FontAwesome name="signal" size={14} color={Colors.success} />
              <Text style={styles.statValue}>{animals.filter((a) => a.status !== 'Offline').length}</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.background,
  },
  menuBtn: { padding: 6 },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: Colors.primary, fontSize: 20, fontWeight: 'bold' },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  onlineText: { color: Colors.textSecondary, fontSize: 12 },
  mapContainer: { flex: 1 },
  quickStats: {
    backgroundColor: Colors.card, borderTopWidth: 1,
    borderTopColor: Colors.border, paddingVertical: 14, paddingHorizontal: 20,
  },
  quickStatsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
});
