import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function NotificationsScreen() {
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(false);
  const [temp, setTemp] = useState(true);
  const [boundary, setBoundary] = useState(true);
  const [battery, setBattery] = useState(false);

  const renderToggle = (title: string, desc: string, value: boolean, onValueChange: (val: boolean) => void) => (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 16 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: Colors.cardElevated, true: Colors.primary }}
        thumbColor="#FFF"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>DELIVERY METHODS</Text>
        <View style={styles.card}>
          {renderToggle('Push Notifications', 'Receive alerts on this device', push, setPush)}
          <View style={styles.divider} />
          {renderToggle('SMS Alerts', 'Receive critical alerts via SMS (charges apply)', sms, setSms)}
        </View>

        <Text style={styles.sectionTitle}>ALERT TYPES</Text>
        <View style={styles.card}>
          {renderToggle('High Temperature', 'Alert when animal temperature exceeds 39°C', temp, setTemp)}
          <View style={styles.divider} />
          {renderToggle('Safe Zone Breach', 'Alert when an asset leaves the Safe Zone', boundary, setBoundary)}
          <View style={styles.divider} />
          {renderToggle('Low Battery', 'Alert when tracker battery drops below 15%', battery, setBattery)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  sectionTitle: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginTop: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  toggleTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  toggleDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  divider: { height: 1, backgroundColor: Colors.border },
});
