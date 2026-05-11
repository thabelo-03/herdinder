/**
 * AnimalDetailCard - Bottom slide-up card showing asset vitals
 * Supports cattle (temperature focus) and vehicles (speed/GPS focus)
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useRef } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors, { getCategoryColor, getCategoryIcon, getCategoryLabel, getTempColor, getTempStatus } from '../constants/Colors';
import { Animal, SafeZone } from '../types';
import { useAlertStore } from '../store/alertStore';
import { useAnimalStore } from '../store/animalStore';
import HerdMapView from './HerdMapView';
import TempChart from './TempChart';

interface Props {
  animal: Animal;
  onClose: () => void;
  onViewDetail: () => void;
  safeZone?: SafeZone;
}

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

export default function AnimalDetailCard({ animal, onClose, onViewDetail, safeZone }: Props) {
  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${animal.latitude},${animal.longitude}`;
    Linking.openURL(url);
  };

  const shareLocationViaWhatsApp = () => {
    const message = `Check out ${animal.name}'s location: https://www.google.com/maps/search/?api=1&query=${animal.latitude},${animal.longitude}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  const isCattle = animal.category === 'cattle';
  const categoryColor = getCategoryColor(animal.category);
  const categoryIcon = getCategoryIcon(animal.category) as any;
  const tempStatus = getTempStatus(animal.temperature);

  // Animation for swipe-down gesture
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical downward swipes and if the scroll view is at the top
        // For simplicity, let's assume the PanResponder takes precedence for now.
        // A more robust solution would involve checking scroll position.
        return gestureState.dy > 5 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return gestureState.dy > 5 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) { // If swiped down more than 100 pixels
          Animated.timing(translateY, {
            toValue: 600, // Animate off-screen downwards (maxHeight is 550)
            duration: 200,
            useNativeDriver: true,
          }).start(onClose); // Call onClose after animation completes
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 5 }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: translateY }] },
      ]}
      {...panResponder.panHandlers} // Apply pan handlers to the Animated.View
    >
      {/* Dismiss/Minimise Handle */}
      <TouchableOpacity onPress={onClose} style={styles.dismissHandle} activeOpacity={0.6}>
        <View style={styles.handleBar} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
        <FontAwesome name="times-circle" size={24} color={Colors.textMuted} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header: Name + Temp/Speed */}
        <TouchableOpacity 
          onPress={() => {
            Haptics.selectionAsync();
            onViewDetail();
          }} 
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15`, borderColor: `${categoryColor}40` }]}>
                <FontAwesome name={categoryIcon} size={18} color={categoryColor} />
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.name}>{animal.name}</Text>
                <Text style={styles.subtitle}>
                  {animal.location} · {animal.herdName}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              {isCattle ? (
                <>
                  <Text style={[styles.tempValue, { color: getTempColor(animal.temperature) }]}>
                    {animal.temperature.toFixed(1)}°C
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: tempStatus.color }]}>
                    <Text style={styles.statusBadgeText}>{tempStatus.label.toUpperCase()}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.tempValue, { color: categoryColor }]}>
                    {animal.speed != null && animal.speed > 0 ? `${animal.speed} km/h` : animal.status}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: animal.status === 'Moving' ? Colors.success : categoryColor }]}>
                    <Text style={styles.statusBadgeText}>
                      {getCategoryLabel(animal.category).toUpperCase()}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Remote Buzzer Action for Vehicles */}
        {!isCattle && (
          <View style={styles.buzzerSection}>
            <TouchableOpacity 
              style={[styles.buzzerBtn, animal.buzzerEnabled && styles.buzzerBtnActive]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                useAnimalStore.getState().triggerBuzzer(animal.id);
              }}
            >
              <FontAwesome name="bullhorn" size={20} color={animal.buzzerEnabled ? '#FFF' : categoryColor} />
              <Text style={[styles.buzzerBtnText, animal.buzzerEnabled && { color: '#FFF' }]}>
                {animal.buzzerEnabled ? 'STOP ALARM' : 'TRIGGER BUZZER'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.buzzerSub}>Use this to scare off thieves or locate the vehicle</Text>
          </View>
        )}

        {/* Small Map Preview */}
        {safeZone && (
          <View style={styles.mapPreviewContainer}>
            <HerdMapView
              animals={[animal]}
              safeZone={safeZone}
              selectedAnimal={animal}
              onMarkerPress={() => { }} // Non-interactive in preview
              isPreview={true}
            />
            {/* Overlay to catch touches if you want to prevent interaction */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none" />
          </View>
        )}

        {/* Info Rows */}
        <View style={styles.infoGrid}>
          <InfoRow label="Status" value={animal.status} valueColor={
            animal.status === 'Moving' ? Colors.success :
              animal.status === 'Parked' ? categoryColor : Colors.textSecondary
          } />
          <InfoRow label="Last Seen" value={formatLastSeen(animal.lastSeen)} />
          <InfoRow label="Battery" value={`${animal.battery}%`} valueColor={
            animal.battery < 20 ? Colors.danger : Colors.textPrimary
          } />
          <InfoRow label="Distance from Home" value={`${animal.distanceFromHome} km`} />
          {/* Vehicle-specific rows */}
          {!isCattle && animal.speed != null && (
            <InfoRow label="Speed" value={`${animal.speed} km/h`} valueColor={
              animal.speed > 60 ? Colors.danger : Colors.success
            } />
          )}
          {!isCattle && animal.make && (
            <InfoRow label="Vehicle" value={`${animal.make} ${animal.model || ''}`} />
          )}
          {!isCattle && animal.buzzerEnabled !== undefined && (
            <InfoRow label="Buzzer Alarm" value={animal.buzzerEnabled ? 'Armed' : 'Off'}
              valueColor={animal.buzzerEnabled ? Colors.success : Colors.textMuted} />
          )}
          {!isCattle && animal.tamperDetected && (
            <InfoRow label="⚠ Tamper" value="DETECTED" valueColor={Colors.danger} />
          )}
          <InfoRow
            label="Latitude"
            value={animal.latitude.toFixed(6)}
            valueColor={Colors.primary}
            onPress={openInMaps}
          />
          <InfoRow
            label="Longitude"
            value={animal.longitude.toFixed(6)}
            valueColor={Colors.primary}
            onPress={openInMaps}
          />
        </View>

        {/* Share Location Button */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={shareLocationViaWhatsApp}>
            <FontAwesome name="whatsapp" size={18} color={Colors.textOnPrimary} />
            <Text style={styles.shareBtnText}>Share via WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* Temperature Chart (relevant for cattle, shows ambient temp for vehicles) */}
        <TempChart data={animal.temperatureHistory} />
      </ScrollView>
    </Animated.View>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
  onPress
}: { label: string; value: string; valueColor?: string; onPress?: () => void }) {
  const content = (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.6}>{content}</TouchableOpacity>;
  }
  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    maxHeight: 550,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.textMuted, alignSelf: 'center', marginBottom: 12,
  },
  dismissHandle: {
    width: '100%',
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 5,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryBadge: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
  },
  nameBlock: { marginLeft: 12 },
  name: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  tempValue: { fontSize: 24, fontWeight: 'bold' },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4,
  },
  statusBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  mapPreviewContainer: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoGrid: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  infoLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  actionRow: {
    marginTop: 8,
    marginBottom: 20,
  },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#25D366', borderRadius: 12, paddingVertical: 14, gap: 10,
    shadowColor: '#25D366', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  shareBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  buzzerSection: {
    paddingHorizontal: 4,
    marginBottom: 20,
    alignItems: 'center',
  },
  buzzerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.card, borderRadius: 12, paddingVertical: 14, gap: 12,
    width: '100%', borderWidth: 2, borderColor: Colors.border,
  },
  buzzerBtnActive: {
    backgroundColor: Colors.danger, borderColor: Colors.danger,
    shadowColor: Colors.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  buzzerBtnText: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5, color: Colors.textPrimary },
  buzzerSub: { color: Colors.textMuted, fontSize: 11, marginTop: 8, textAlign: 'center' },
});
