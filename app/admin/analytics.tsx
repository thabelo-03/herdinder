import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function GlobalAnalytics() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Global Analytics</Text>
        <TouchableOpacity style={styles.exportBtn}>
          <FontAwesome name="download" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.timeFilter}>
          <TouchableOpacity style={[styles.filterBtn, styles.activeFilter]}>
            <Text style={[styles.filterText, styles.activeFilterText]}>7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>30 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>90 Days</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ASSET GROWTH</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>New Tags Registered</Text>
            <Text style={styles.chartValue}>+124</Text>
          </View>
          <View style={styles.simpleChart}>
            {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
              <View key={i} style={[styles.chartBar, { height: h, backgroundColor: Colors.primary }]} />
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
            <Text style={styles.miniLabel}>Avg Response Time</Text>
            <Text style={styles.miniValue}>420ms</Text>
            <Text style={styles.miniTrend}>↓ 12% vs last week</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Text style={styles.miniLabel}>Active Users</Text>
            <Text style={styles.miniValue}>1,204</Text>
            <Text style={[styles.miniTrend, { color: Colors.success }]}>↑ 5% vs last week</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ALERT FREQUENCY BY TYPE</Text>
        <View style={styles.listCard}>
          <View style={styles.alertStatRow}>
            <Text style={styles.alertLabel}>Left Safe Zone</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '75%', backgroundColor: Colors.warning }]} />
            </View>
            <Text style={styles.alertCount}>1,450</Text>
          </View>
          <View style={styles.alertStatRow}>
            <Text style={styles.alertLabel}>Theft Alerts</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '15%', backgroundColor: Colors.danger }]} />
            </View>
            <Text style={styles.alertCount}>240</Text>
          </View>
          <View style={styles.alertStatRow}>
            <Text style={styles.alertLabel}>Low Battery</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '45%', backgroundColor: Colors.info }]} />
            </View>
            <Text style={styles.alertCount}>890</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>REGIONAL DISTRIBUTION</Text>
        <View style={styles.listCard}>
          <DistributionRow label="Mat South" count="2,450" percent="71%" />
          <DistributionRow label="Mat North" count="650" percent="19%" />
          <DistributionRow label="Midlands" count="350" percent="10%" />
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
});
