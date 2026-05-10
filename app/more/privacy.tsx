import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function PrivacyScreen() {
  const [analytics, setAnalytics] = useState(false);
  const [location, setLocation] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Your Data, Your Control</Text>
        <Text style={styles.paragraph}>
          HerdFinder is built with privacy-first principles. Location data for your assets is transmitted securely and is only accessible by authorized users in your organization.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.rowTitle}>Background Location</Text>
              <Text style={styles.rowDesc}>Allow app to receive gateway alerts in background</Text>
            </View>
            <Switch value={location} onValueChange={setLocation} trackColor={{ true: Colors.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.rowTitle}>Share Analytics</Text>
              <Text style={styles.rowDesc}>Help us improve by sharing anonymous usage data</Text>
            </View>
            <Switch value={analytics} onValueChange={setAnalytics} trackColor={{ true: Colors.primary }} />
          </View>
        </View>

        <Text style={styles.link}>Read Full Privacy Policy</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  header: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  paragraph: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  rowTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  rowDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  divider: { height: 1, backgroundColor: Colors.border },
  link: { color: Colors.primary, fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
});
