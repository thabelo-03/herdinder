import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';

export default function GatewayConfigScreen() {
  const router = useRouter();
  const [networkId, setNetworkId] = useState('HerdNet_LoRa');
  const [server, setServer] = useState('eu1.cloud.thethings.network');
  const [freqPlan, setFreqPlan] = useState('EU_863_870');

  const handleSave = () => {
    Alert.alert('Saved', 'Gateway configuration has been saved.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.warningBox}>
          <FontAwesome name="exclamation-triangle" size={24} color={Colors.warning} />
          <Text style={styles.warningText}>
            Modifying these settings may disconnect your MikroTik wAP LR8 gateway from The Things Network. Proceed with caution.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Network ID</Text>
          <TextInput style={styles.input} value={networkId} onChangeText={setNetworkId} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Network Server Address</Text>
          <TextInput style={styles.input} value={server} onChangeText={setServer} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Frequency Plan</Text>
          <TextInput style={styles.input} value={freqPlan} onChangeText={setFreqPlan} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Apply Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  warningBox: { flexDirection: 'row', backgroundColor: Colors.warning + '15', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.warning + '40', marginBottom: 24, alignItems: 'center', gap: 12 },
  warningText: { color: Colors.textPrimary, flex: 1, fontSize: 13, lineHeight: 18 },
  formGroup: { marginBottom: 20 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.cardElevated, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.textPrimary, fontSize: 15 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: Colors.textOnPrimary, fontSize: 15, fontWeight: 'bold' },
});
