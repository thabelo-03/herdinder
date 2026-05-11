import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <FontAwesome name="times" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: May 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using the HerdFinder platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.
        </Text>

        <Text style={styles.sectionTitle}>2. Service Description</Text>
        <Text style={styles.paragraph}>
          HerdFinder provides GPS and LoRaWAN-based tracking services for livestock, motorbikes, and vehicles. The accuracy of tracking data depends on hardware functionality, network coverage (including TTN and cellular), and environmental factors.
        </Text>

        <Text style={styles.sectionTitle}>3. Hardware & Network</Text>
        <Text style={styles.paragraph}>
          Users are responsible for the physical maintenance of LoRaWAN ear tags, Dragino Trackers, and MikroTik gateways. HerdFinder is not liable for data loss due to hardware damage, battery depletion, or gateway downtime.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Privacy</Text>
        <Text style={styles.paragraph}>
          We collect and process location data, temperature readings, and alerts to provide the service. Your data is encrypted and will not be sold to third parties without your explicit consent.
        </Text>

        <Text style={styles.sectionTitle}>5. Subscriptions</Text>
        <Text style={styles.paragraph}>
          Subscription fees are billed according to your selected plan. You may cancel at any time, but no refunds will be issued for partial months. Free trial periods automatically convert to paid subscriptions unless cancelled beforehand.
        </Text>

        <Text style={styles.sectionTitle}>6. Alerts & Notifications</Text>
        <Text style={styles.paragraph}>
          Theft, temperature, and safe zone alerts are provided as-is. HerdFinder does not guarantee 100% immediate delivery of push notifications, as they are dependent on external push notification services and device connectivity.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  closeBtn: { padding: 8, width: 36, alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  content: { padding: 24 },
  lastUpdated: { color: Colors.textMuted, fontSize: 12, marginBottom: 24, fontStyle: 'italic' },
  sectionTitle: { color: Colors.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
  paragraph: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 16 },
});
