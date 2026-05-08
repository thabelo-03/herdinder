/**
 * GatewayBanner - Shows gateway connection status
 * Matches the "Gateway: Mat South 01 · Signal: Strong" bar in the mockup
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../constants/Colors';
import { Gateway } from '../types';

interface Props {
  gateway: Gateway;
}

export default function GatewayBanner({ gateway }: Props) {
  const signalIcon = gateway.signalStrength === 'Strong' ? 'signal' : 'signal';
  const statusColor = gateway.status === 'online' ? Colors.success : Colors.danger;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Gateway: </Text>
      <Text style={styles.name}>{gateway.name}</Text>
      <View style={styles.dividerDot} />
      <Text style={styles.signalLabel}>Signal: </Text>
      <Text style={[styles.signalValue, { color: statusColor }]}>
        {gateway.signalStrength}
      </Text>
      <FontAwesome
        name={signalIcon}
        size={12}
        color={statusColor}
        style={styles.signalIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 48, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  dividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 8,
  },
  signalLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  signalValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  signalIcon: {
    marginLeft: 4,
  },
});
