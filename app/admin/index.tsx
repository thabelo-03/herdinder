import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Mock Admin Data
const ADMIN_STATS = {
  totalUsers: 142,
  activeGateways: 18,
  totalAssets: 3450,
  systemHealth: 98.5,
};

const RECENT_ALERTS = [
  { id: '1', type: 'Gateway Offline', location: 'Mat South Node 4', time: '10 mins ago', critical: true },
  { id: '2', type: 'High API Latency', location: 'TTN Webhook', time: '1 hour ago', critical: false },
  { id: '3', type: 'Database Backup', location: 'EU-West Cluster', time: '3 hours ago', critical: false },
];

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Admin</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <FontAwesome name="cog" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>All Systems Operational</Text>
        </View>

        {/* Overview Grid */}
        <Text style={styles.sectionTitle}>OVERVIEW</Text>
        <View style={styles.grid}>
          <StatCard icon="users" label="Total Users" value={ADMIN_STATS.totalUsers.toString()} color={Colors.info} />
          <StatCard icon="signal" label="Gateways" value={ADMIN_STATS.activeGateways.toString()} color={Colors.success} />
          <StatCard icon="microchip" label="Tracked Assets" value={ADMIN_STATS.totalAssets.toString()} color={Colors.primary} />
          <StatCard icon="heartbeat" label="System Health" value={`${ADMIN_STATS.systemHealth}%`} color={Colors.warning} />
        </View>

        {/* System Alerts */}
        <Text style={styles.sectionTitle}>RECENT SYSTEM LOGS</Text>
        <View style={styles.cardList}>
          {RECENT_ALERTS.map((alert) => (
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
          ))}
        </View>

        {/* Management Links */}
        <Text style={styles.sectionTitle}>MANAGEMENT</Text>
        <View style={styles.cardList}>
          <MenuLink icon="user-circle" label="Manage Users & Subscriptions" />
          <MenuLink icon="wifi" label="TTN Gateway Management" />
          <MenuLink icon="database" label="Database Maintenance" />
          <MenuLink icon="line-chart" label="Global Analytics" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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

function MenuLink({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={styles.menuLink}>
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
});
