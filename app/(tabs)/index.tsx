/**
 * HerdFinder - Map Dashboard (Main Screen)
 *
 * - Native (Android/iOS): real react-native-maps + OpenStreetMap tiles
 * - Web: Google Maps in iframe
 * - Supports cattle, motorbikes, and vehicles on the same map
 *
 * TODO: HARDWARE INTEGRATION
 * - Connect to MQTT broker for real-time position/temp updates
 * - Replace mock coordinates with actual gateway triangulation data
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimalDetailCard from '../../components/AnimalDetailCard';
import CriticalAlertOverlay from '../../components/CriticalAlertOverlay';
import GatewayBanner from '../../components/GatewayBanner';
import Colors from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import { Animal } from '../../types';
// Metro automatically picks HerdMapView.native.tsx on device and HerdMapView.web.tsx on browser
import HerdMapView from '../../components/HerdMapView';

export default function MapScreen() {
  const router = useRouter();

  const animals = useAnimalStore((s) => s.animals);
  const gateway = useAnimalStore((s) => s.gateway);
  const safeZone = useAnimalStore((s) => s.safeZone);
  const selectedAnimal = useAnimalStore((s) => s.selectedAnimal);
  const selectAnimal = useAnimalStore((s) => s.selectAnimal);
  const isLockdownMode = useAnimalStore((s) => s.isLockdownMode);
  const toggleLockdown = useAnimalStore((s) => s.toggleLockdown);

  const handleMarkerPress = useCallback((animal: Animal) => selectAnimal(animal), [selectAnimal]);
  const handleCloseDetail = useCallback(() => selectAnimal(null), [selectAnimal]);
  const handleViewDetail = useCallback(() => {
    if (selectedAnimal) router.push(`/animal/${selectedAnimal.id}`);
  }, [selectedAnimal, router]);

  // Counts by category
  const cattleCount = animals.filter((a) => a.category === 'cattle').length;
  const bikeCount = animals.filter((a) => a.category === 'motorbike').length;
  const vehicleCount = animals.filter((a) => a.category === 'vehicle').length;
  const alertCount = animals.filter((a) =>
    (a.category === 'cattle' && a.temperature > 39) || a.tamperDetected || a.status === 'Offline'
  ).length;
  const onlineCount = animals.filter((a) => a.status !== 'Offline').length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Floating Critical Alert Overlay */}
      <CriticalAlertOverlay />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <FontAwesome name="navicon" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <FontAwesome name="shield" size={18} color={isLockdownMode ? Colors.danger : Colors.primary} />
          <Text style={[styles.headerTitle, isLockdownMode && { color: Colors.danger }]}>
            {isLockdownMode ? 'LOCKDOWN' : 'HERDFINDER'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.lockdownBtn, isLockdownMode && styles.lockdownBtnActive]} 
          onPress={toggleLockdown}
        >
          <FontAwesome name={isLockdownMode ? 'lock' : 'unlock'} size={14} color={isLockdownMode ? '#FFF' : Colors.textMuted} />
          <Text style={[styles.lockdownText, isLockdownMode && { color: '#FFF' }]}>
            {isLockdownMode ? 'Active' : 'Secure'}
          </Text>
        </TouchableOpacity>
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
          safeZone={safeZone}
        />
      )}

      {/* Quick Stats Bar — shows asset counts by category */}
      {!selectedAnimal && (
        <View style={styles.quickStats}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickStatsScroll}>
            <StatCard icon="paw" label="Cattle" value={cattleCount} color={Colors.cattle} />
            <StatCard icon="motorcycle" label="Bikes" value={bikeCount} color={Colors.motorbike} />
            <StatCard icon="car" label="Vehicles" value={vehicleCount} color={Colors.vehicle} />
            <StatCard icon="exclamation-triangle" label="Alerts" value={alertCount} color={Colors.danger} />
            <StatCard icon="signal" label="Online" value={onlineCount} color={Colors.success} />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <FontAwesome name={icon as any} size={12} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  lockdownBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
    gap: 6,
  },
  lockdownBtnActive: {
    backgroundColor: Colors.danger, borderColor: Colors.danger,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
  lockdownText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { color: Colors.textSecondary, fontSize: 10, fontWeight: 'bold' },
  mapContainer: { flex: 1 },
  quickStats: {
    backgroundColor: Colors.background, paddingVertical: 12,
  },
  quickStatsScroll: { paddingHorizontal: 16, gap: 10 },
  statCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
    minWidth: 100,
  },
  statIcon: {
    width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  statValue: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  statLabel: { color: Colors.textSecondary, fontSize: 9, fontWeight: '600' },
});
