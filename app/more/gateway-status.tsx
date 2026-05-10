import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';

export default function GatewayStatusScreen() {
  const gateway = useAnimalStore((s) => s.gateway);
  const isOnline = gateway.status === 'online';

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.header}>
          <View style={[styles.iconRing, isOnline ? { borderColor: Colors.success } : { borderColor: Colors.danger }]}>
            <FontAwesome name="wifi" size={32} color={isOnline ? Colors.success : Colors.danger} />
          </View>
          <Text style={styles.title}>{gateway.name}</Text>
          <View style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
            <Text style={[styles.badgeText, isOnline ? styles.badgeTextOnline : styles.badgeTextOffline]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>SYSTEM DIAGNOSTICS</Text>
        
        <View style={styles.grid}>
          <View style={styles.card}>
            <FontAwesome name="battery-full" size={20} color={Colors.success} style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Battery</Text>
            <Text style={styles.cardValue}>{gateway.battery}%</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome name="signal" size={20} color={Colors.primary} style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Network</Text>
            <Text style={styles.cardValue}>LoRaWAN</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome name="clock-o" size={20} color={Colors.info} style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Uptime</Text>
            <Text style={styles.cardValue}>14d 6h</Text>
          </View>
          <View style={styles.card}>
            <FontAwesome name="refresh" size={20} color={Colors.warning} style={styles.cardIcon} />
            <Text style={styles.cardLabel}>Last Ping</Text>
            <Text style={styles.cardValue}>2 mins ago</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>HARDWARE INFO</Text>
        <View style={styles.listCard}>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Model</Text>
            <Text style={styles.listValue}>MikroTik wAP LR8</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Firmware</Text>
            <Text style={styles.listValue}>v7.12.1</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>MAC Address</Text>
            <Text style={styles.listValue}>D4:CA:6D:E1:92:4A</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Coordinates</Text>
            <Text style={styles.listValue}>{gateway.location.latitude.toFixed(4)}, {gateway.location.longitude.toFixed(4)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn}>
          <FontAwesome name="power-off" size={16} color={Colors.textPrimary} />
          <Text style={styles.actionBtnText}>Reboot Gateway</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
  iconRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeOnline: { backgroundColor: Colors.success + '20' },
  badgeOffline: { backgroundColor: Colors.danger + '20' },
  badgeText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  badgeTextOnline: { color: Colors.success },
  badgeTextOffline: { color: Colors.danger },
  sectionTitle: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: { flex: 1, minWidth: '45%', backgroundColor: Colors.cardElevated, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  cardIcon: { marginBottom: 12 },
  cardLabel: { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },
  cardValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  listCard: { backgroundColor: Colors.cardElevated, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, marginBottom: 24 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 },
  listLabel: { color: Colors.textSecondary, fontSize: 14 },
  listValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cardElevated, borderWidth: 1, borderColor: Colors.border, paddingVertical: 16, borderRadius: 12, gap: 10 },
  actionBtnText: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
});
