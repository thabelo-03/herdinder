import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function DatabaseMaintenance() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Database Maintenance</Text>
        <TouchableOpacity style={styles.refreshBtn}>
          <FontAwesome name="refresh" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.healthSection}>
          <View style={styles.healthCard}>
            <Text style={styles.healthTitle}>Database Status</Text>
            <View style={styles.healthRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected (Healthy)</Text>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Latency</Text>
                <Text style={styles.metricValue}>12ms</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Storage</Text>
                <Text style={styles.metricValue}>4.2 / 512 GB</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Uptime</Text>
                <Text style={styles.metricValue}>99.99%</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>MAINTENANCE TOOLS</Text>
        <View style={styles.toolGrid}>
          <MaintenanceTool icon="database" label="Backup Now" description="Trigger immediate cloud backup" />
          <MaintenanceTool icon="trash-o" label="Clear Cache" description="Purge old telemetry logs (>90 days)" />
          <MaintenanceTool icon="bolt" label="Optimize" description="Re-index tables and vacuum DB" />
          <MaintenanceTool icon="history" label="Restore" description="Restore from previous snapshot" />
        </View>

        <Text style={styles.sectionTitle}>RECENT SYSTEM LOGS</Text>
        <View style={styles.logContainer}>
          <LogEntry type="INFO" message="Database backup completed successfully" time="2h ago" />
          <LogEntry type="WARNING" message="Slow query detected on 'telemetry' table" time="5h ago" />
          <LogEntry type="INFO" message="Index optimization started" time="Yesterday" />
          <LogEntry type="ERROR" message="Connection timeout on Node 4" time="Yesterday" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MaintenanceTool({ icon, label, description }: { icon: string; label: string; description: string }) {
  return (
    <TouchableOpacity style={styles.toolCard}>
      <View style={styles.toolIconContainer}>
        <FontAwesome name={icon as any} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.toolLabel}>{label}</Text>
      <Text style={styles.toolDescription}>{description}</Text>
    </TouchableOpacity>
  );
}

function LogEntry({ type, message, time }: { type: 'INFO' | 'WARNING' | 'ERROR'; message: string; time: string }) {
  const color = type === 'ERROR' ? Colors.danger : type === 'WARNING' ? Colors.warning : Colors.info;
  return (
    <View style={styles.logEntry}>
      <View style={[styles.logTypeBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.logTypeText, { color }]}>{type}</Text>
      </View>
      <Text style={styles.logMessage} numberOfLines={1}>{message}</Text>
      <Text style={styles.logTime}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8 },
  refreshBtn: { padding: 8 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  healthSection: { marginBottom: 24 },
  healthCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  healthTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: 'bold', marginBottom: 12 },
  healthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success, marginRight: 8 },
  statusText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { alignItems: 'flex-start' },
  metricLabel: { color: Colors.textMuted, fontSize: 10, marginBottom: 4 },
  metricValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold' },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  toolCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  toolDescription: { color: Colors.textSecondary, fontSize: 11 },
  logContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  logEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  logTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 10,
  },
  logTypeText: { fontSize: 9, fontWeight: 'bold' },
  logMessage: { flex: 1, color: Colors.textPrimary, fontSize: 12 },
  logTime: { color: Colors.textMuted, fontSize: 10, marginLeft: 8 },
});
