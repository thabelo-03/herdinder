import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { adminAPI } from '../../services/api';

export default function GatewayManagement() {
  const router = useRouter();
  const [gateways, setGateways] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGateways = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await adminAPI.getGateways();
      if (res.data) {
        setGateways(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch gateway status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TTN Gateways</Text>
        <TouchableOpacity style={styles.addBtn}>
          <FontAwesome name="plus" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching gateways...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={gateways}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.gatewayCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusIndicator, { backgroundColor: item.status === 'online' ? Colors.success : Colors.danger }]} />
              <View style={styles.nameContainer}>
                <Text style={styles.gatewayName}>{item.name}</Text>
                <Text style={styles.gatewayId}>{item.id}</Text>
              </View>
              <View style={styles.signalContainer}>
                <FontAwesome name="signal" size={14} color={getSignalColor(item.signalStrength)} />
                <Text style={[styles.signalText, { color: getSignalColor(item.signalStrength) }]}>{item.signalStrength}</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>BATTERY</Text>
                <View style={styles.valueRow}>
                  <FontAwesome name={getBatteryIcon(item.battery)} size={12} color={getBatteryColor(item.battery)} />
                  <Text style={styles.detailValue}>{item.battery}%</Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>LAST SEEN</Text>
                <Text style={styles.detailValue}>{new Date(item.lastSeen).toLocaleTimeString()}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>LOCATION</Text>
                <Text style={styles.detailValue}>{item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome name="gears" size={14} color={Colors.primary} />
                <Text style={styles.actionText}>Configure</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome name="refresh" size={14} color={Colors.primary} />
                <Text style={styles.actionText}>Reboot</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome name="map-marker" size={14} color={Colors.primary} />
                <Text style={styles.actionText}>View Map</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      )}
    </SafeAreaView>
  );
}

function getSignalColor(strength: string) {
  switch (strength) {
    case 'Strong': return Colors.success;
    case 'Medium': return Colors.warning;
    case 'Weak': return Colors.danger;
    default: return Colors.textMuted;
  }
}

function getBatteryColor(level: number) {
  if (level > 60) return Colors.success;
  if (level > 20) return Colors.warning;
  return Colors.danger;
}

function getBatteryIcon(level: number) {
  if (level > 90) return 'battery-4';
  if (level > 65) return 'battery-3';
  if (level > 35) return 'battery-2';
  if (level > 10) return 'battery-1';
  return 'battery-0';
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
  addBtn: { padding: 8 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  listContent: { padding: 16 },
  gatewayCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  nameContainer: { flex: 1 },
  gatewayName: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  gatewayId: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  signalText: { fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailItem: { width: '45%' },
  detailLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  detailValue: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginVertical: 8 },
});
