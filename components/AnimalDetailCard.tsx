/**
 * AnimalDetailCard - Bottom slide-up card showing asset vitals
 * Supports cattle (temperature focus) and vehicles (speed/GPS focus)
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors, { getCategoryColor, getCategoryIcon, getCategoryLabel, getTempColor, getTempStatus } from '../constants/Colors';
import { Animal, SafeZone } from '../types';
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

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.handleBar} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header: Name + Temp/Speed */}
        <TouchableOpacity onPress={onViewDetail} activeOpacity={0.7}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FontAwesome name={categoryIcon} size={20} color={categoryColor} />
              <View style={styles.nameBlock}>
                <Text style={styles.name}>{animal.name}</Text>
                <Text style={styles.subtitle}>
                  {animal.location} · {animal.herdName}
                  {animal.plateNumber ? ` · ${animal.plateNumber}` : ''}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              {isCattle ? (
                <>
                  <Text style={[styles.tempValue, { color: getTempColor(animal.temperature) }]}>
                    {animal.temperature}°C
                  </Text>
                  <View style={[styles.badge, { backgroundColor: tempStatus.color }]}>
                    <Text style={styles.badgeText}>{tempStatus.label}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.tempValue, { color: categoryColor }]}>
                    {animal.speed != null && animal.speed > 0 ? `${animal.speed} km/h` : animal.status}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: animal.status === 'Moving' ? Colors.success : categoryColor }]}>
                    <Text style={styles.badgeText}>
                      {getCategoryLabel(animal.category).toUpperCase()}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

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
    </View>
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  nameBlock: { marginLeft: 10 },
  name: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  tempValue: { fontSize: 24, fontWeight: 'bold' },
  badge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  mapPreviewContainer: {
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoGrid: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12, padding: 12, marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  infoLabel: { color: Colors.textSecondary, fontSize: 13 },
  infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
});

const actionStyles = StyleSheet.create({
  actionRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#25D366', borderRadius: 10, paddingVertical: 12, gap: 8,
  },
  shareBtnText: { color: Colors.textOnPrimary, fontSize: 15, fontWeight: 'bold' },
});
Object.assign(styles, actionStyles);
