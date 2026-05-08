/**
 * AnimalDetailCard - Bottom slide-up card showing animal vitals
 * Matches the bottom detail card in the dashboard mockup exactly
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { getTempColor, getTempStatus } from '../constants/Colors';
import { Animal } from '../types';
import TempChart from './TempChart';

interface Props {
  animal: Animal;
  onClose: () => void;
  onViewDetail: () => void;
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

export default function AnimalDetailCard({ animal, onClose, onViewDetail }: Props) {
  const tempStatus = getTempStatus(animal.temperature);

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.handleBar} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header: Name + Temp */}
        <TouchableOpacity onPress={onViewDetail} activeOpacity={0.7}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FontAwesome name="paw" size={20} color={Colors.primary} />
              <View style={styles.nameBlock}>
                <Text style={styles.name}>{animal.name}</Text>
                <Text style={styles.subtitle}>
                  {animal.location} · {animal.herdName}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={[styles.tempValue, { color: getTempColor(animal.temperature) }]}>
                {animal.temperature}°C
              </Text>
              <View style={[styles.badge, { backgroundColor: tempStatus.color }]}>
                <Text style={styles.badgeText}>{tempStatus.label}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Info Rows */}
        <View style={styles.infoGrid}>
          <InfoRow label="Status" value={animal.status} valueColor={
            animal.status === 'Moving' ? Colors.success : Colors.textSecondary
          } />
          <InfoRow label="Last Seen" value={formatLastSeen(animal.lastSeen)} />
          <InfoRow label="Battery" value={`${animal.battery}%`} valueColor={
            animal.battery < 20 ? Colors.danger : Colors.textPrimary
          } />
          <InfoRow label="Distance from Home" value={`${animal.distanceFromHome} km`} />
        </View>

        {/* Temperature Chart */}
        <TempChart data={animal.temperatureHistory} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    maxHeight: 420,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameBlock: {
    marginLeft: 10,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  tempValue: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  infoGrid: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
