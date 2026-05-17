import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { adminAPI } from '../../services/api';

export default function DatabaseMaintenance() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    latency: '12ms',
    storage: '4.2 / 512 GB',
    uptime: '99.99%',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const fetchDatabaseInfo = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await adminAPI.getDatabaseLogs();
      if (res.data) {
        setLogs(res.data.logs);
        setMetrics(res.data.metrics);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch database health metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenanceAction = async (action: string) => {
    try {
      setIsProcessing(true);
      const res = await adminAPI.runDatabaseAction(action);
      if (res.data && res.data.success) {
        Alert.alert('Success', res.data.message);
        // Prepend the new log to list or refresh
        setLogs(prev => [res.data.log, ...prev]);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Maintenance Error', 'Failed to run database action.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Database Maintenance</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchDatabaseInfo}>
          <FontAwesome name="refresh" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Connecting to MongoDB Atlas...</Text>
        </View>
      ) : (
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
                  <Text style={styles.metricValue}>{metrics.latency}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Storage</Text>
                  <Text style={styles.metricValue}>{metrics.storage}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Uptime</Text>
                  <Text style={styles.metricValue}>{metrics.uptime}</Text>
                </View>
              </View>
            </View>
          </View>

          {isProcessing && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.processingText}>Processing maintenance task...</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>MAINTENANCE TOOLS</Text>
          <View style={styles.toolGrid}>
            <MaintenanceTool icon="database" label="Backup Now" description="Trigger immediate cloud backup" onPress={() => handleMaintenanceAction('backup')} />
            <MaintenanceTool icon="trash-o" label="Clear Cache" description="Purge old telemetry logs (>90 days)" onPress={() => handleMaintenanceAction('clear')} />
            <MaintenanceTool icon="bolt" label="Optimize" description="Re-index tables and vacuum DB" onPress={() => handleMaintenanceAction('optimize')} />
            <MaintenanceTool icon="history" label="Restore" description="Restore from previous snapshot" onPress={() => handleMaintenanceAction('restore')} />
          </View>

          <Text style={styles.sectionTitle}>RECENT SYSTEM LOGS</Text>
          <View style={styles.logContainer}>
            {logs.length === 0 ? (
              <Text style={styles.emptyText}>No recent maintenance logs found.</Text>
            ) : (
              logs.map((log) => (
                <LogEntry key={log.id} type={log.type} message={log.message} time={log.time} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MaintenanceTool({ icon, label, description, onPress }: { icon: string; label: string; description: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.toolCard} onPress={onPress} activeOpacity={0.7}>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginVertical: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', padding: 24 },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '15',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  processingText: { color: Colors.primary, fontSize: 12, fontWeight: '500' },
});
