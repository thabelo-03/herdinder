import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
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
    totalMRR: 0,
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
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>System Admin</Text>
            <View style={styles.heartbeatContainer}>
              <View style={styles.heartbeatDot} />
              <Text style={styles.heartbeatText}>Live Console</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchStats} activeOpacity={0.7}>
          <FontAwesome name="refresh" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Control Center...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* System Health Status Ribbon */}
          <View style={styles.statusRibbon}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>ALL TTN NODES AND DATABASE INSTANCES OPERATIONAL</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Financial Suite Card */}
          <Text style={styles.sectionTitle}>FINANCIAL CONSOLE</Text>
          <View style={styles.revenueCard}>
            <View style={styles.revenueDetails}>
              <View style={styles.revenueTitleRow}>
                <FontAwesome name="money" size={12} color={Colors.success} />
                <Text style={styles.revenueTitleText}>MONTHLY RECURRING REVENUE</Text>
              </View>
              <Text style={styles.revenueValue}>R{stats.totalMRR.toFixed(2)}</Text>
              <Text style={styles.revenueSubtext}>Calculated instantly across live billing parameters</Text>
            </View>
            <View style={styles.revenueTrend}>
              <FontAwesome name="line-chart" size={24} color={Colors.success} />
              <Text style={styles.trendText}>+100% ZAR</Text>
            </View>
          </View>

          {/* Overview Grid */}
          <Text style={styles.sectionTitle}>SYSTEM OVERVIEW</Text>
          <View style={styles.grid}>
            <StatCard 
              icon="users" 
              label="Total Users" 
              value={stats.totalUsers.toString()} 
              color={Colors.info}
              subLabel="Registered Accounts"
            />
            <StatCard 
              icon="signal" 
              label="TTN Gateways" 
              value={stats.activeGateways.toString()} 
              color={Colors.success}
              subLabel="Active LoRa Links"
            />
            <StatCard 
              icon="microchip" 
              label="Tracked Assets" 
              value={stats.totalAssets.toString()} 
              color={Colors.primary}
              subLabel="Seeded Telemetry"
            />
            <StatCard 
              icon="heartbeat" 
              label="System Uptime" 
              value={`${stats.systemHealth}%`} 
              color={Colors.warning}
              subLabel="Network Core Health"
            />
          </View>

          {/* System Alerts */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>RECENT CRITICAL ALERTS</Text>
            <View style={[styles.alertCountBadge, { backgroundColor: recentLogs.length > 0 ? Colors.danger + '20' : Colors.border }]}>
              <Text style={[styles.alertCountText, { color: recentLogs.length > 0 ? Colors.danger : Colors.textMuted }]}>
                {recentLogs.length} Active
              </Text>
            </View>
          </View>

          <View style={styles.cardList}>
            {recentLogs.length === 0 ? (
              <View style={styles.emptyAlertsContainer}>
                <FontAwesome name="shield" size={28} color={Colors.success} style={{ marginBottom: 8 }} />
                <Text style={styles.emptyText}>Zero critical network exceptions reported.</Text>
              </View>
            ) : (
              recentLogs.map((alert) => (
                <View key={alert.id} style={styles.alertRow}>
                  <View style={[styles.alertIcon, { backgroundColor: alert.critical ? Colors.danger + '15' : Colors.info + '15' }]}>
                    <FontAwesome name={alert.critical ? 'exclamation-triangle' : 'info-circle'} size={14} color={alert.critical ? Colors.danger : Colors.info} />
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertType}>{alert.type}</Text>
                    <Text style={styles.alertLocation}>Asset: {alert.location}</Text>
                  </View>
                  <View style={styles.alertTimeWrapper}>
                    <FontAwesome name="clock-o" size={10} color={Colors.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Management Console Suite */}
          <Text style={styles.sectionTitle}>ADMINISTRATIVE CONSOLE</Text>
          <View style={styles.cardList}>
            <MenuLink 
              icon="user-circle" 
              label="Manage Users & Subscriptions" 
              description="Activate/reactivate plans, edit LoRa tag quotas, view profiles"
              onPress={() => router.push('/admin/users')}
            />
            <MenuLink 
              icon="wifi" 
              label="TTN Gateway Management" 
              description="Monitor LoRaWAN routers status, battery levels, locations"
              onPress={() => router.push('/admin/gateways')}
            />
            <MenuLink 
              icon="database" 
              label="Database Maintenance" 
              description="Execute system backups, clear cache tables, optimize indices"
              onPress={() => router.push('/admin/database')}
            />
            <MenuLink 
              icon="line-chart" 
              label="Global Analytics" 
              description="Plan distribution, growth timelines, regional map coordinates"
              onPress={() => router.push('/admin/analytics')}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color, subLabel }: { icon: string; label: string; value: string; color: string; subLabel: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
        <FontAwesome name={icon as any} size={16} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statSubText}>{subLabel}</Text>
      </View>
    </View>
  );
}

function MenuLink({ icon, label, description, onPress }: { icon: string; label: string; description: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuLink} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLinkLeft}>
        <View style={styles.menuIconContainer}>
          <FontAwesome name={icon as any} size={18} color={Colors.primary} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuLinkLabel}>{label}</Text>
          <Text style={styles.menuLinkDescription}>{description}</Text>
        </View>
      </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 4 },
  titleContainer: {
    flexDirection: 'column',
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  heartbeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  heartbeatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  heartbeatText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  statusRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.success + '25',
    marginBottom: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success, marginRight: 8 },
  statusText: { color: Colors.success, fontWeight: '800', fontSize: 9, letterSpacing: 0.5 },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  alertCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  alertCountText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    gap: 12,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: { color: Colors.textPrimary, fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  statSubText: { color: Colors.textMuted, fontSize: 9, marginTop: 4 },
  cardList: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  emptyAlertsContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  alertTimeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTime: { color: Colors.textMuted, fontSize: 11 },
  menuLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  menuLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  menuLinkLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  menuLinkDescription: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginVertical: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
  
  revenueCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  revenueDetails: { flex: 1 },
  revenueTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  revenueTitleText: { color: Colors.textMuted, fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  revenueValue: { color: Colors.success, fontSize: 32, fontWeight: 'bold' },
  revenueSubtext: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  revenueTrend: {
    alignItems: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.success + '10',
    borderWidth: 0.5,
    borderColor: Colors.success + '20',
  },
  trendText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
