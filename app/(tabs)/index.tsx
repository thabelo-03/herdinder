/**
 * HerdFinder - Map Dashboard (Main Screen)
 * 
 * This is the primary screen matching the dashboard mockup:
 * - Dark satellite map with cow markers
 * - Temperature labels on each marker
 * - Safe Zone polygon overlay
 * - Gateway status banner
 * - Bottom detail card on marker tap
 * 
 * TODO: HARDWARE INTEGRATION
 * - Connect to MQTT broker for real-time position/temp updates
 * - Replace mock coordinates with actual gateway triangulation data
 * - Add real safe zone polygon from farmer's configuration
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors, { getTempColor, getTempStatus } from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import { useAlertStore } from '../../store/alertStore';
import { Animal } from '../../types';
import GatewayBanner from '../../components/GatewayBanner';
import AnimalDetailCard from '../../components/AnimalDetailCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const animals = useAnimalStore((s) => s.animals);
  const gateway = useAnimalStore((s) => s.gateway);
  const safeZone = useAnimalStore((s) => s.safeZone);
  const selectedAnimal = useAnimalStore((s) => s.selectedAnimal);
  const selectAnimal = useAnimalStore((s) => s.selectAnimal);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleMarkerPress = useCallback((animal: Animal) => {
    selectAnimal(animal);
  }, [selectAnimal]);

  const handleCloseDetail = useCallback(() => {
    selectAnimal(null);
  }, [selectAnimal]);

  const handleViewDetail = useCallback(() => {
    if (selectedAnimal) {
      router.push(`/animal/${selectedAnimal.id}`);
    }
  }, [selectedAnimal, router]);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(!showSidebar)} style={styles.menuBtn}>
          <FontAwesome name="bars" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <FontAwesome name="shield" size={16} color={Colors.primary} />
          <Text style={styles.headerTitle}> HerdFinder</Text>
        </View>
        <View style={styles.onlineIndicator}>
          <View style={[styles.onlineDot, { backgroundColor: gateway.status === 'online' ? Colors.success : Colors.danger }]} />
          <Text style={styles.onlineText}>
            {gateway.status === 'online' ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Gateway Banner */}
      <GatewayBanner gateway={gateway} />

      {/* Map Area (simulated with dark background + markers) */}
      {/* TODO: HARDWARE INTEGRATION - Replace with react-native-maps MapView with satellite tiles */}
      <View style={styles.mapContainer}>
        {/* Dark map background with grid pattern */}
        <View style={styles.mapBackground}>
          {/* Grid overlay for visual effect */}
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`hline-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 12}%` }]} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={`vline-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 16}%` }]} />
          ))}
          
          {/* Safe Zone */}
          <View style={styles.safeZone}>
            <Text style={styles.safeZoneLabel}>SAFE ZONE</Text>
          </View>

          {/* Animal Markers */}
          {animals.map((animal, index) => {
            const positions = [
              { top: '18%', left: '22%' },
              { top: '15%', left: '55%' },
              { top: '30%', left: '70%' },
              { top: '50%', left: '65%' },
              { top: '55%', left: '20%' },
            ];
            const pos = positions[index % positions.length];
            const isSelected = selectedAnimal?.id === animal.id;
            const tempColor = getTempColor(animal.temperature);
            
            return (
              <TouchableOpacity
                key={animal.id}
                style={[
                  styles.marker,
                  { top: pos.top, left: pos.left },
                  isSelected && styles.markerSelected,
                ]}
                onPress={() => handleMarkerPress(animal)}
                activeOpacity={0.8}
              >
                <View style={[styles.markerBubble, isSelected && { borderColor: Colors.primary, borderWidth: 2 }]}>
                  <Text style={styles.markerName}>{animal.name}</Text>
                  <Text style={[styles.markerTemp, { color: tempColor }]}>
                    {animal.temperature}°C
                  </Text>
                </View>
                <View style={[styles.markerPin, { backgroundColor: tempColor }]}>
                  <FontAwesome name="paw" size={10} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Map Controls (right side) */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlBtn}>
            <FontAwesome name="compass" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlBtn}>
            <FontAwesome name="crosshairs" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlBtn}>
            <FontAwesome name="plus" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Detail Card */}
      {selectedAnimal && (
        <AnimalDetailCard
          animal={selectedAnimal}
          onClose={handleCloseDetail}
          onViewDetail={handleViewDetail}
        />
      )}

      {/* Quick Stats Bar (visible when no animal selected) */}
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
              <Text style={styles.statValue}>
                {animals.filter(a => a.temperature <= 38).length}
              </Text>
              <Text style={styles.statLabel}>Normal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FontAwesome name="exclamation-triangle" size={14} color={Colors.danger} />
              <Text style={styles.statValue}>
                {animals.filter(a => a.temperature > 39).length}
              </Text>
              <Text style={styles.statLabel}>Alerts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <FontAwesome name="signal" size={14} color={Colors.success} />
              <Text style={styles.statValue}>
                {animals.filter(a => a.status !== 'Offline').length}
              </Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  menuBtn: {
    padding: 6,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  onlineText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  // Map
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#0D1B0E',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(255,215,0,0.06)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: 'rgba(255,215,0,0.06)',
  },
  // Safe Zone
  safeZone: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '20%',
    borderWidth: 2,
    borderColor: Colors.safeZoneBorder,
    borderStyle: 'dashed',
    backgroundColor: Colors.safeZoneFill,
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  safeZoneLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.7,
  },
  // Markers
  marker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  markerSelected: {
    zIndex: 20,
  },
  markerBubble: {
    backgroundColor: 'rgba(15, 15, 26, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  markerName: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  markerTemp: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 1,
  },
  markerPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  // Map Controls
  mapControls: {
    position: 'absolute',
    right: 12,
    top: '30%',
    gap: 8,
  },
  mapControlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(30, 30, 48, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  // Quick Stats
  quickStats: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
});
