/**
 * AlertItem - Individual alert card
 * Supports cattle alerts (temp, zone) + vehicle alerts (theft, speeding, tamper)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../constants/Colors';
import { Alert as AlertType, AlertType as AlertTypeEnum } from '../types';

interface Props {
  alert: AlertType;
  onPress: () => void;
}

function getAlertIcon(type: AlertTypeEnum): { name: string; color: string; bg: string } {
  switch (type) {
    case 'HIGH_TEMPERATURE':
      return { name: 'thermometer-full', color: '#FFFFFF', bg: Colors.danger };
    case 'LEFT_SAFE_ZONE':
      return { name: 'sign-out', color: '#FFFFFF', bg: Colors.warning };
    case 'MOVEMENT_ALERT':
      return { name: 'bolt', color: '#FFFFFF', bg: Colors.danger };
    case 'LOW_BATTERY':
      return { name: 'battery-quarter', color: '#FFFFFF', bg: Colors.warning };
    case 'HEALTH_WARNING':
      return { name: 'medkit', color: '#FFFFFF', bg: Colors.info };
    case 'ISOLATION_ALERT':
      return { name: 'users', color: '#FFFFFF', bg: Colors.warning };
    case 'TAG_TAMPER':
      return { name: 'exclamation-triangle', color: '#FFFFFF', bg: Colors.danger };
    case 'THEFT_ALERT':
      return { name: 'lock', color: '#FFFFFF', bg: '#B71C1C' };
    case 'SPEEDING':
      return { name: 'tachometer', color: '#FFFFFF', bg: Colors.warning };
    case 'BUZZER_TRIGGERED':
      return { name: 'volume-up', color: '#FFFFFF', bg: Colors.motorbike };
    case 'OFFLINE':
      return { name: 'wifi', color: '#FFFFFF', bg: Colors.textMuted };
    default:
      return { name: 'info-circle', color: '#FFFFFF', bg: Colors.info };
  }
}

function getAlertLabel(type: AlertTypeEnum): string {
  switch (type) {
    case 'HIGH_TEMPERATURE': return 'HIGH TEMPERATURE';
    case 'LEFT_SAFE_ZONE': return 'LEFT SAFE ZONE';
    case 'MOVEMENT_ALERT': return 'MOVEMENT ALERT';
    case 'LOW_BATTERY': return 'LOW BATTERY';
    case 'HEALTH_WARNING': return 'HEALTH WARNING';
    case 'ISOLATION_ALERT': return 'ISOLATION ALERT';
    case 'TAG_TAMPER': return 'TAMPER DETECTED';
    case 'THEFT_ALERT': return 'THEFT ALERT';
    case 'SPEEDING': return 'SPEEDING';
    case 'BUZZER_TRIGGERED': return 'BUZZER ALARM';
    case 'OFFLINE': return 'OFFLINE';
    default: return 'ALERT';
  }
}

function formatTime(date: any): string {
  if (!date || !(date instanceof Date)) return '---';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function AlertItem({ alert, onPress }: Props) {
  const icon = getAlertIcon(alert.type);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, alert.read && styles.read]}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
        <FontAwesome name={icon.name as any} size={16} color={icon.color} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.typeLabel, { color: icon.bg }]}>
            {getAlertLabel(alert.type)}
          </Text>
          <Text style={styles.time}>{formatTime(alert.createdAt)}</Text>
        </View>
        <Text style={styles.message}>{alert.message}</Text>
      </View>

      {/* Unread dot */}
      {!alert.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  read: { opacity: 0.6 },
  iconContainer: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  content: { flex: 1 },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  typeLabel: { fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  time: { color: Colors.textSecondary, fontSize: 11 },
  message: { color: Colors.textPrimary, fontSize: 13, lineHeight: 19, marginTop: 2 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 8,
  },
});
