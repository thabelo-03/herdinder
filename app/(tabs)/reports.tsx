/**
 * Reports Screen - Temperature trends, movement logs, analytics
 * Supports cattle, motorbikes, and vehicles
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { getTempColor, getCategoryColor } from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import { useAlertStore } from '../../store/alertStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

type TimeRange = '24h' | '7d' | '30d';

export default function ReportsScreen() {
  const animals = useAnimalStore((s) => s.animals);
  const alerts = useAlertStore((s) => s.alerts);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const cattle = animals.filter(a => a.category === 'cattle');
  
  const avgTemp = cattle.length > 0
    ? (cattle.reduce((sum, a) => sum + a.temperature, 0) / cattle.length).toFixed(1)
    : '0';

  const highTempCount = cattle.filter((a) => a.temperature > 39).length;
  const movingCount = animals.filter((a) => a.status === 'Moving').length;
  const alertsToday = alerts.filter((a) => {
    const today = new Date();
    return a.createdAt.toDateString() === today.toDateString();
  }).length;

  // Mini bar chart data for alerts by type
  const alertsByType = [
    { label: 'Temp', count: alerts.filter(a => a.type === 'HIGH_TEMPERATURE').length, color: Colors.danger },
    { label: 'Zone', count: alerts.filter(a => a.type === 'LEFT_SAFE_ZONE').length, color: Colors.warning },
    { label: 'Theft', count: alerts.filter(a => a.type === 'THEFT_ALERT' || a.type === 'TAG_TAMPER').length, color: Colors.danger },
    { label: 'Speed', count: alerts.filter(a => a.type === 'SPEEDING').length, color: Colors.warning },
    { label: 'Batt', count: alerts.filter(a => a.type === 'LOW_BATTERY').length, color: Colors.primary },
  ];
  const maxAlertCount = Math.max(...alertsByType.map(a => a.count), 1);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reports</Text>
          <TouchableOpacity style={styles.exportBtn}>
            <FontAwesome name="download" size={14} color={Colors.primary} />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRow}>
          {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timePill, timeRange === range && styles.timePillActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.timeText, timeRange === range && styles.timeTextActive]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <SummaryCard
            icon="thermometer-half"
            label="Cattle Avg Temp"
            value={`${avgTemp}°C`}
            color={Colors.primary}
          />
          <SummaryCard
            icon="exclamation-triangle"
            label="High Temp"
            value={`${highTempCount}`}
            color={Colors.danger}
          />
          <SummaryCard
            icon="arrows"
            label="Active/Moving"
            value={`${movingCount}`}
            color={Colors.success}
          />
          <SummaryCard
            icon="bell"
            label="Alerts Today"
            value={`${alertsToday}`}
            color={Colors.warning}
          />
        </View>

        {/* Cattle Temperature Overview */}
        {cattle.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Cattle Temperature Overview</Text>
            <View style={styles.tempBars}>
              {cattle.map((animal) => (
                <View key={animal._id || animal.id} style={styles.tempBarItem}>
                  <Text style={styles.tempBarLabel}>{animal.name.split(' ')[1]}</Text>
                  <View style={styles.tempBarTrack}>
                    <View style={[
                      styles.tempBarFill,
                      {
                        height: `${((animal.temperature - 35) / 5) * 100}%`,
                        backgroundColor: getTempColor(animal.temperature),
                      }
                    ]} />
                  </View>
                  <Text style={[styles.tempBarValue, { color: getTempColor(animal.temperature) }]}>
                    {animal.temperature}°
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.tempLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.legendText}>Normal ≤38°C</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.legendText}>Warm 38-39°C</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
                <Text style={styles.legendText}>High &gt;39°C</Text>
              </View>
            </View>
          </View>
        )}

        {/* Alert Distribution */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Alert Distribution</Text>
          <View style={styles.alertBars}>
            {alertsByType.map((item, i) => (
              <View key={i} style={styles.alertBarRow}>
                <Text style={styles.alertBarLabel}>{item.label}</Text>
                <View style={styles.alertBarTrack}>
                  <View style={[
                    styles.alertBarFill,
                    {
                      width: `${(item.count / maxAlertCount) * 100}%`,
                      backgroundColor: item.color,
                    }
                  ]} />
                </View>
                <Text style={styles.alertBarCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Battery Status */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Device Battery Status</Text>
          {animals.map((animal) => (
            <View key={animal._id || animal.id} style={styles.batteryRow}>
              <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(animal.category) }]} />
              <Text style={styles.batteryName} numberOfLines={1}>{animal.name}</Text>
              <View style={styles.batteryTrack}>
                <View style={[
                  styles.batteryFill,
                  {
                    width: `${animal.battery}%`,
                    backgroundColor: animal.battery > 50 ? Colors.success :
                      animal.battery > 20 ? Colors.warning : Colors.danger,
                  }
                ]} />
              </View>
              <Text style={styles.batteryPercent}>{animal.battery}%</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, label, value, color }: {
  icon: string; label: string; value: string; color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}20` }]}>
        <FontAwesome name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: 'bold' },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  exportText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  timeRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  timePill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timePillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  timeTextActive: { color: Colors.textOnPrimary },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: { color: Colors.textPrimary, fontSize: 22, fontWeight: 'bold' },
  summaryLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' },
  chartCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  // Temperature bars
  tempBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 12,
  },
  tempBarItem: { alignItems: 'center', gap: 4 },
  tempBarLabel: { color: Colors.textSecondary, fontSize: 10 },
  tempBarTrack: {
    width: 28,
    height: 80,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  tempBarFill: { width: '100%', borderRadius: 6 },
  tempBarValue: { fontSize: 11, fontWeight: 'bold' },
  tempLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.textSecondary, fontSize: 10 },
  // Alert bars
  alertBars: { gap: 10 },
  alertBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertBarLabel: { color: Colors.textSecondary, fontSize: 12, width: 50 },
  alertBarTrack: {
    flex: 1,
    height: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  alertBarFill: { height: '100%', borderRadius: 6, minWidth: 4 },
  alertBarCount: { color: Colors.textPrimary, fontSize: 13, fontWeight: 'bold', width: 24 },
  // Battery
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryIndicator: { width: 8, height: 8, borderRadius: 4 },
  batteryName: { color: Colors.textSecondary, fontSize: 12, width: 60 },
  batteryTrack: {
    flex: 1,
    height: 14,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 7,
    overflow: 'hidden',
  },
  batteryFill: { height: '100%', borderRadius: 7 },
  batteryPercent: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600', width: 36 },
});
