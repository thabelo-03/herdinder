import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../../constants/Colors';

export default function OfflineDataScreen() {
  const [autoSync, setAutoSync] = useState(true);

  const handleDownload = () => Alert.alert('Downloading', 'Starting map cache download...');
  const handleClear = () => Alert.alert('Clear Cache', 'Offline data cleared.');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <FontAwesome name="map-o" size={24} color={Colors.info} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Offline Maps</Text>
            <Text style={styles.infoDesc}>Download your Safe Zone map area so it remains visible even without an internet connection.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleDownload}>
          <FontAwesome name="download" size={16} color={Colors.textOnPrimary} />
          <Text style={styles.btnPrimaryText}>Download Offline Area (142 MB)</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Auto-Sync Data</Text>
            <Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ true: Colors.primary }} />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.rowBtn} onPress={handleClear}>
            <Text style={styles.clearText}>Clear Cached Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  infoBox: { flexDirection: 'row', backgroundColor: Colors.cardElevated, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 20, alignItems: 'center', gap: 16 },
  infoTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  infoDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, padding: 16, borderRadius: 12, gap: 8, marginBottom: 32 },
  btnPrimaryText: { color: Colors.textOnPrimary, fontSize: 15, fontWeight: 'bold' },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  rowLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  rowBtn: { padding: 16, alignItems: 'center' },
  clearText: { color: Colors.danger, fontSize: 15, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: Colors.border },
});
