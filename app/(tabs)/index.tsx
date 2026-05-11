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
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimalDetailCard from '../../components/AnimalDetailCard';
import CriticalAlertOverlay from '../../components/CriticalAlertOverlay';
import GatewayBanner from '../../components/GatewayBanner';
import Colors from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import { Animal } from '../../types';
import { StorageManager } from '../../services/storageManager';
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
  const showHeatmap = useAnimalStore((s) => s.showHeatmap);
  const toggleHeatmap = useAnimalStore((s) => s.toggleHeatmap);

  const [filter, setFilter] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleSyncHerd = async () => {
    setIsSyncing(true);
    try {
      await StorageManager.syncHerdArea(animals, (d, t) => {
        setSyncProgress(Math.round((d / t) * 100));
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

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

  const filteredAnimals = filter 
    ? animals.filter(a => a.category === filter || (filter === 'Alerts' && ((a.category === 'cattle' && a.temperature > 39) || a.tamperDetected || a.status === 'Offline')))
    : animals;

  const handleToggleLockdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    toggleLockdown();
  };

  const handleToggleHeatmap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleHeatmap();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      {/* Floating Critical Alert Overlay */}
      <CriticalAlertOverlay />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Menu', 'Settings and Profile options coming soon!');
          }}
        >
          <FontAwesome name="navicon" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <FontAwesome name="shield" size={18} color={isLockdownMode ? Colors.danger : Colors.primary} />
          <Text style={[styles.headerTitle, isLockdownMode && { color: Colors.danger }]}>
            {isLockdownMode ? 'LOCKDOWN' : 'HERDFINDER'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.controlBtn, isLockdownMode && styles.lockdownBtnActive]} 
            onPress={handleToggleLockdown}
          >
            <FontAwesome name="shield" size={16} color={isLockdownMode ? '#FFF' : Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, showHeatmap && { backgroundColor: Colors.warning }]} 
            onPress={handleToggleHeatmap}
          >
            <FontAwesome name="fire" size={16} color={showHeatmap ? '#FFF' : Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlBtn, isSyncing && { backgroundColor: Colors.info }]} 
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              handleSyncHerd();
            }}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <FontAwesome name="cloud-download" size={16} color={Colors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Gateway Banner */}
      <GatewayBanner gateway={gateway} />

      {/* Map — platform-specific (native or web) */}
      <View style={styles.mapContainer}>
        <HerdMapView
          animals={filteredAnimals}
          safeZone={safeZone}
          selectedAnimal={selectedAnimal}
          onMarkerPress={(a) => {
            Haptics.selectionAsync();
            handleMarkerPress(a);
          }}
          showHeatmap={showHeatmap}
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
            <StatCard 
              icon="paw" label="Cattle" value={cattleCount} color={Colors.cattle} 
              isActive={filter === 'cattle'} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(filter === 'cattle' ? null : 'cattle'); }} 
            />
            <StatCard 
              icon="motorcycle" label="Bikes" value={bikeCount} color={Colors.motorbike} 
              isActive={filter === 'motorbike'} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(filter === 'motorbike' ? null : 'motorbike'); }} 
            />
            <StatCard 
              icon="car" label="Vehicles" value={vehicleCount} color={Colors.vehicle} 
              isActive={filter === 'vehicle'} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(filter === 'vehicle' ? null : 'vehicle'); }} 
            />
            <StatCard 
              icon="exclamation-triangle" label="Alerts" value={alertCount} color={Colors.danger} 
              isActive={filter === 'Alerts'} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); setFilter(filter === 'Alerts' ? null : 'Alerts'); }} 
            />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color, isActive, onPress }: { 
  icon: string; label: string; value: number; color: string; isActive?: boolean; onPress: () => void 
}) {
  return (
    <TouchableOpacity 
      style={[styles.statCard, isActive && { borderColor: color, backgroundColor: `${color}05`, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIcon, { backgroundColor: isActive ? color : `${color}15` }]}>
        <FontAwesome name={icon as any} size={12} color={isActive ? '#FFF' : color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  controlBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  lockdownBtnActive: {
    backgroundColor: Colors.danger, borderColor: Colors.danger,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
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
