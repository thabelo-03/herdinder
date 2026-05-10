import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useAnimalStore } from '../../store/animalStore';

export default function SubscriptionScreen() {
  const user = useAuthStore((s) => s.user);
  const animals = useAnimalStore((s) => s.animals);
  
  const activeTags = animals.length;
  // Monthly connected cost = Active tags * R100
  const monthlyCost = activeTags * 100;

  // Buy new devices calculator state
  const [newDeviceCount, setNewDeviceCount] = useState(1);
  
  const increment = () => setNewDeviceCount(p => p + 1);
  const decrement = () => setNewDeviceCount(p => (p > 1 ? p - 1 : 1));

  // Hardware pricing logic
  // 1-3 devices = R1000 each
  // 4+ devices = R800 each
  const devicePrice = newDeviceCount >= 4 ? 800 : 1000;
  const totalHardwareCost = newDeviceCount * devicePrice;
  const newMonthlyAddedCost = newDeviceCount * 100;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Current Billing Overview */}
        <View style={styles.billingCard}>
          <Text style={styles.sectionLabel}>CURRENT BILLING</Text>
          <Text style={styles.monthlyValue}>R{monthlyCost.toFixed(2)}<Text style={styles.perMonth}>/mo</Text></Text>
          <View style={styles.usageTextRow}>
            <Text style={styles.usageLabel}>Connected Devices</Text>
            <Text style={styles.usageValue}>{activeTags} Active</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome name="info-circle" size={16} color={Colors.info} />
            <Text style={styles.infoText}>You are billed R100.00 per month for each active tracking device on your account.</Text>
          </View>
        </View>

        {/* Purchase New Hardware */}
        <Text style={styles.sectionTitle}>BUY NEW TRACKERS</Text>
        <View style={styles.storeCard}>
          <Text style={styles.storeDesc}>
            Need more trackers? Hardware costs R1,000.00 each. 
            {"\n"}<Text style={{color: Colors.success, fontWeight: 'bold'}}>Buy 4 or more to get them for R800.00 each!</Text>
          </Text>
          
          <View style={styles.counterRow}>
            <Text style={styles.counterLabel}>Quantity</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity style={styles.counterBtn} onPress={decrement}>
                <FontAwesome name="minus" size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{newDeviceCount}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={increment}>
                <FontAwesome name="plus" size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Hardware Cost (Once-off)</Text>
            <Text style={styles.costValue}>R{totalHardwareCost.toLocaleString()}</Text>
          </View>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Added to Monthly Bill</Text>
            <Text style={styles.costValue}>+R{newMonthlyAddedCost.toLocaleString()}/mo</Text>
          </View>

          <TouchableOpacity style={styles.checkoutBtn}>
            <Text style={styles.checkoutBtnText}>Checkout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  billingCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 30,
  },
  sectionLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  monthlyValue: { color: Colors.primary, fontSize: 36, fontWeight: 'bold', marginBottom: 16 },
  perMonth: { fontSize: 16, color: Colors.textSecondary, fontWeight: 'normal' },
  usageTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  usageLabel: { color: Colors.textSecondary, fontSize: 14 },
  usageValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  infoBox: { flexDirection: 'row', backgroundColor: Colors.info + '15', padding: 12, borderRadius: 10, gap: 10, alignItems: 'flex-start' },
  infoText: { color: Colors.info, fontSize: 12, lineHeight: 16, flex: 1 },
  
  sectionTitle: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
  storeCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storeDesc: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 24 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  counterLabel: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  counterControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardElevated, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  counterBtn: { padding: 12, paddingHorizontal: 16 },
  counterValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold', width: 40, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 20 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  costLabel: { color: Colors.textSecondary, fontSize: 14 },
  costValue: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutBtnText: { color: Colors.textOnPrimary, fontSize: 15, fontWeight: 'bold' },
});
