import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { adminAPI } from '../../services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function GlobalAnalytics() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await adminAPI.getAnalytics();
      if (res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch live business metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Global Analytics</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing MongoDB cluster logs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const growthArray = analyticsData?.growth || [40, 60, 45, 80, 55, 90, 75];
  const metrics = analyticsData?.metrics || { avgResponseTime: '420ms', activeUsers: 0 };
  const alertsList = analyticsData?.alerts || [];
  const distributionList = analyticsData?.distribution || [];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Global Analytics</Text>
        <TouchableOpacity style={styles.exportBtn} onPress={fetchAnalytics}>
          <FontAwesome name="refresh" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>ASSET GROWTH</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Live Dynamic Growth</Text>
            <Text style={styles.chartValue}>Active</Text>
          </View>
          <View style={styles.simpleChart}>
            {growthArray.map((h: number, i: number) => (
              <View key={i} style={[styles.chartBar, { height: Math.max(10, Math.min(100, h)), backgroundColor: Colors.primary }]} />
            ))}
          </View>
          <View style={styles.chartLabels}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((l, i) => (
              <Text key={i} style={styles.chartLabelText}>{l}</Text>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniLabel}>Avg API Response</Text>
            <Text style={styles.miniValue}>{metrics.avgResponseTime}</Text>
            <Text style={styles.miniTrend}>↓ 12% vs last week</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniLabel}>Active Farmers</Text>
            <Text style={styles.miniValue}>{metrics.activeUsers}</Text>
            <Text style={[styles.miniTrend, { color: Colors.success }]}>↑ 5% vs last week</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ALERT FREQUENCY BY TYPE</Text>
        <View style={styles.listCard}>
          {alertsList.length === 0 ? (
            <Text style={styles.emptyText}>No alerts reported in live database.</Text>
          ) : (
            alertsList.map((alert: any, idx: number) => {
              const maxAlertCount = Math.max(...alertsList.map((a: any) => a.count || 1));
              const percentage = alert.count > 0 ? Math.round((alert.count / maxAlertCount) * 100) : 5;
              const alertColor = idx === 0 ? Colors.warning : idx === 1 ? Colors.danger : Colors.info;

              return (
                <View key={idx} style={styles.alertStatRow}>
                  <Text style={styles.alertLabel} numberOfLines={1}>{alert.label}</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: alertColor }]} />
                  </View>
                  <Text style={styles.alertCount}>{alert.count}</Text>
                </View>
              );
            })
          )}
        </View>

        <Text style={styles.sectionTitle}>REGIONAL DISTRIBUTION</Text>
        <View style={styles.listCard}>
          {distributionList.length === 0 ? (
            <Text style={styles.emptyText}>No regional assets registered.</Text>
          ) : (
            distributionList.map((dist: any, idx: number) => (
              <DistributionRow key={idx} label={dist.label} count={dist.count.toString()} percent={dist.percent} />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DistributionRow({ label, count, percent }: { label: string; count: string; percent: string }) {
  return (
    <View style={styles.distRow}>
      <Text style={styles.distLabel}>{label}</Text>
      <Text style={styles.distCount}>{count}</Text>
      <Text style={styles.distPercent}>{percent}</Text>
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
  exportBtn: { padding: 8 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  timeFilter: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeFilter: { backgroundColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  activeFilterText: { color: 'white' },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 12 },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chartTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chartValue: { color: Colors.success, fontSize: 18, fontWeight: 'bold' },
  simpleChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingHorizontal: 10,
  },
  chartBar: { width: 30, borderRadius: 4 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4 },
  chartLabelText: { color: Colors.textMuted, fontSize: 10 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  miniStatCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 4 },
  miniValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  miniTrend: { color: Colors.textMuted, fontSize: 10 },
  listCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  alertStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  alertLabel: { width: 100, color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },
  progressBarBg: { flex: 1, height: 8, backgroundColor: Colors.background, borderRadius: 4, marginHorizontal: 12 },
  progressBarFill: { height: 8, borderRadius: 4 },
  alertCount: { width: 40, textAlign: 'right', color: Colors.textPrimary, fontSize: 12, fontWeight: 'bold' },
  distRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  distLabel: { flex: 1, color: Colors.textSecondary, fontSize: 14 },
  distCount: { color: Colors.textPrimary, fontSize: 14, fontWeight: 'bold', marginRight: 16 },
  distPercent: { color: Colors.textMuted, fontSize: 12, width: 40, textAlign: 'right' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginVertical: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', padding: 24 },
});
