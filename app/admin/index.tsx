import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { adminAPI } from '../../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeGateways: 0,
    totalAssets: 0,
    systemHealth: 100,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await adminAPI.getStats();
      if (res.data) {
        setStats(res.data.stats);
        setRecentLogs(res.data.recentLogs);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch live admin stats.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Admin</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={fetchStats}>
          <FontAwesome name="refresh" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching system status...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* Status Banner */}
          <View style={styles.statusBanner}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>All Systems Operational</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Overview Grid */}
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <View style={styles.grid}>
            <StatCard icon="users" label="Total Users" value={stats.totalUsers.toString()} color={Colors.info} />
            <StatCard icon="signal" label="Gateways" value={stats.activeGateways.toString()} color={Colors.success} />
            <StatCard icon="microchip" label="Tracked Assets" value={stats.totalAssets.toString()} color={Colors.primary} />
            <StatCard icon="heartbeat" label="System Health" value={`${stats.systemHealth}%`} color={Colors.warning} />
          </View>

          {/* System Alerts */}
          <Text style={styles.sectionTitle}>RECENT CRITICAL ALERTS</Text>
          <View style={styles.cardList}>
            {recentLogs.length === 0 ? (
              <Text style={styles.emptyText}>No recent critical logs detected.</Text>
            ) : (
              recentLogs.map((alert) => (
                <View key={alert.id} style={styles.alertRow}>
                  <View style={[styles.alertIcon, { backgroundColor: alert.critical ? Colors.danger + '20' : Colors.info + '20' }]}>
                    <FontAwesome name={alert.critical ? 'exclamation-triangle' : 'info-circle'} size={14} color={alert.critical ? Colors.danger : Colors.info} />
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertType}>{alert.type}</Text>
                    <Text style={styles.alertLocation}>{alert.location}</Text>
                  </View>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
              ))
            )}
          </View>

          {/* Management Links */}
          <Text style={styles.sectionTitle}>MANAGEMENT</Text>
        <View style={styles.cardList}>
          <MenuLink 
            icon="user-circle" 
            label="Manage Users & Subscriptions" 
            onPress={() => router.push('/admin/users')}
          />
          <MenuLink 
            icon="wifi" 
            label="TTN Gateway Management" 
            onPress={() => router.push('/admin/gateways')}
          />
          <MenuLink 
            icon="database" 
            label="Database Maintenance" 
            onPress={() => router.push('/admin/database')}
          />
          <MenuLink 
            icon="line-chart" 
            label="Global Analytics" 
            onPress={() => router.push('/admin/analytics')}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <FontAwesome name={icon as any} size={24} color={color} style={{ marginBottom: 12 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuLink({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuLink} onPress={onPress}>
      <FontAwesome name={icon as any} size={16} color={Colors.primary} style={{ width: 24 }} />
      <Text style={styles.menuLinkLabel}>{label}</Text>
      <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
    </TouchableOpacity>
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
  settingsBtn: { padding: 8 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.success + '30',
    marginBottom: 20,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success, marginRight: 10 },
  statusText: { color: Colors.success, fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  cardList: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  alertIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertContent: { flex: 1 },
  alertType: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  alertLocation: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  alertTime: { color: Colors.textMuted, fontSize: 11 },
  menuLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  menuLinkLabel: { flex: 1, color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginVertical: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', padding: 24 },
});
