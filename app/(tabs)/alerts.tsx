/**
 * Alerts Screen - Shows all smart alerts
 * Matches the Smart Alerts section from the mockup:
 * - HIGH TEMPERATURE, LEFT SAFE ZONE, MOVEMENT ALERT
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../../constants/Colors';
import { useAlertStore } from '../../store/alertStore';
import { Alert, AlertType } from '../../types';
import AlertItem from '../../components/AlertItem';

const FILTER_OPTIONS: { label: string; value: AlertType | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Temperature', value: 'HIGH_TEMPERATURE' },
  { label: 'Safe Zone', value: 'LEFT_SAFE_ZONE' },
  { label: 'Movement', value: 'MOVEMENT_ALERT' },
  { label: 'Battery', value: 'LOW_BATTERY' },
];

export default function AlertsScreen() {
  const alerts = useAlertStore((s) => s.alerts);
  const filter = useAlertStore((s) => s.filter);
  const setFilter = useAlertStore((s) => s.setFilter);
  const markAsRead = useAlertStore((s) => s.markAsRead);
  const markAllAsRead = useAlertStore((s) => s.markAllAsRead);
  const unreadCount = useAlertStore((s) => s.unreadCount);

  const filteredAlerts = filter === 'ALL'
    ? alerts
    : alerts.filter((a) => a.type === filter);

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alerts</Text>
          <Text style={styles.headerSub}>
            {unreadCount} unread · {alerts.length} total
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterPill, filter === opt.value && styles.filterPillActive]}
            onPress={() => setFilter(opt.value)}
          >
            <Text style={[styles.filterText, filter === opt.value && styles.filterTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alert List */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertItem alert={item} onPress={() => markAsRead(item.id)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="bell-slash" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No alerts</Text>
            <Text style={styles.emptySubText}>All your cattle are safe</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSub: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  markAllBtn: {
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 4,
  },
  markAllText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.textOnPrimary,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
