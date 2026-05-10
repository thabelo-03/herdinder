import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import SafeZoneEditorMap from '../../components/SafeZoneEditorMap';
import { useAnimalStore } from '../../store/animalStore';

export default function SafeZoneScreen() {
  const router = useRouter();
  const safeZone = useAnimalStore((s) => s.safeZone);
  const updateSafeZone = useAnimalStore((s) => s.updateSafeZone);
  const gateway = useAnimalStore((s) => s.gateway);
  
  // Initialize with current safe zone points
  const [points, setPoints] = useState<{ latitude: number; longitude: number }[]>(
    safeZone.coordinates || []
  );

  const handleMapPress = (coordinate: { latitude: number; longitude: number }) => {
    setPoints((prev) => [...prev, coordinate]);
  };

  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handleSave = () => {
    if (points.length >= 3) {
      updateSafeZone({
        ...safeZone,
        coordinates: points,
      });
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <SafeZoneEditorMap 
        initialCenter={
          points.length > 0 
            ? points[0] 
            : gateway.location
        }
        points={points}
        onMapPress={handleMapPress}
      />

      {/* Floating Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Tap on the map to place boundary points. You need at least 3 points to create a zone.
        </Text>
      </View>

      {/* Control Panel */}
      <SafeAreaView edges={['bottom']} style={styles.controlPanel}>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>Points: {points.length}</Text>
          <Text style={styles.statsText}>
            Status: {points.length < 3 ? 'Needs more points' : 'Ready to save'}
          </Text>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.btn, styles.btnSecondary]} 
            onPress={handleUndo}
            disabled={points.length === 0}
          >
            <FontAwesome name="undo" size={16} color={points.length === 0 ? Colors.textMuted : Colors.textPrimary} />
            <Text style={[styles.btnText, points.length === 0 && { color: Colors.textMuted }]}>Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.btnSecondary]} 
            onPress={handleClear}
            disabled={points.length === 0}
          >
            <FontAwesome name="trash" size={16} color={points.length === 0 ? Colors.textMuted : Colors.danger} />
            <Text style={[styles.btnText, points.length === 0 ? { color: Colors.textMuted } : { color: Colors.danger }]}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.btnPrimary, points.length < 3 && styles.btnDisabled]} 
            onPress={handleSave}
            disabled={points.length < 3}
          >
            <FontAwesome name="check" size={16} color={points.length < 3 ? Colors.textMuted : Colors.textOnPrimary} />
            <Text style={[styles.btnText, points.length < 3 ? { color: Colors.textMuted } : { color: Colors.textOnPrimary }]}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  instructionsContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: Colors.cardElevated + 'E6', // translucent
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionsText: { color: Colors.textPrimary, fontSize: 13, textAlign: 'center', fontWeight: '500' },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8, // extra padding handled by SafeAreaView
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  btnSecondary: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnDisabled: {
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.border,
  },
  btnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});
