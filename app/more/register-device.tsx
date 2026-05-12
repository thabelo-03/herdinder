import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors, { getCategoryColor, getCategoryIcon } from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import { AssetCategory, Animal } from '../../types';

export default function RegisterDeviceScreen() {
  const router = useRouter();
  const addAnimal = useAnimalStore((s) => s.addAnimal);
  const gateway = useAnimalStore((s) => s.gateway);

  const [name, setName] = useState('');
  const [tagId, setTagId] = useState('');
  const [devEUI, setDevEUI] = useState('');
  const [appKey, setAppKey] = useState('');
  const [category, setCategory] = useState<AssetCategory>('cattle');

  const categories: { label: string; value: AssetCategory }[] = [
    { label: 'Cattle', value: 'cattle' },
    { label: 'Motorbike', value: 'motorbike' },
    { label: 'Vehicle', value: 'vehicle' },
  ];

  const handleRegister = () => {
    if (!name.trim() || !tagId.trim()) {
      Alert.alert('Missing Info', 'Please provide a name and a Tag ID for the device.');
      return;
    }

    const newDevice: Animal = {
      id: Math.random().toString(36).substring(7),
      name: name.trim(),
      category: category,
      deviceType: category === 'cattle' ? 'ear_tag' : 'dragino_tracker',
      herdName: category === 'cattle' ? 'New Herd' : 'New Fleet',
      location: gateway.name,
      tagId: tagId.trim(),
      devEUI: devEUI.trim(),
      appEUI: '0000000000000000',
      appKey: appKey.trim(),
      temperature: 36.5,
      battery: 100,
      status: 'Stationary',
      lastSeen: new Date(),
      distanceFromHome: 0,
      latitude: gateway.location.latitude + (Math.random() - 0.5) * 0.01,
      longitude: gateway.location.longitude + (Math.random() - 0.5) * 0.01,
      temperatureHistory: [],
      positionHistory: [],
    };

    addAnimal(newDevice);
    Alert.alert('Success', `${name} has been successfully registered!`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerIconContainer}>
            <View style={styles.headerIconBg}>
              <FontAwesome name="qrcode" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Add New Device</Text>
            <Text style={styles.subtitle}>Enter the details below or scan the QR code on your tracking device to register it to your account.</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Asset Type</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => {
                const isSelected = category === cat.value;
                const catColor = getCategoryColor(cat.value);
                const catIcon = getCategoryIcon(cat.value) as any;
                
                return (
                  <TouchableOpacity 
                    key={cat.value} 
                    style={[styles.categoryBtn, isSelected && { borderColor: catColor, backgroundColor: catColor + '15' }]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <FontAwesome name={catIcon} size={16} color={isSelected ? catColor : Colors.textMuted} />
                    <Text style={[styles.categoryBtnText, isSelected && { color: catColor }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Device / Asset Name</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. Cow 042, Tractor A"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Hardware Tag ID (End Device ID)</Text>
            <View style={styles.inputWithScan}>
              <TextInput 
                style={[styles.input, { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                placeholder="e.g. tag01"
                placeholderTextColor={Colors.textMuted}
                value={tagId}
                onChangeText={setTagId}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.scanBtn} onPress={() => Alert.alert('Camera', 'QR Scanner would open here.')}>
                <FontAwesome name="qrcode" size={20} color={Colors.textOnPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Device EUI (DevEUI)</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. 70B3D57ED0077732"
              placeholderTextColor={Colors.textMuted}
              value={devEUI}
              onChangeText={setDevEUI}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>App Key (AppKey)</Text>
            <TextInput 
              style={styles.input}
              placeholder="e.g. 2148E1F1C326EEE72483BA9637F5BEEC"
              placeholderTextColor={Colors.textMuted}
              value={appKey}
              onChangeText={setAppKey}
              autoCapitalize="characters"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
            <Text style={styles.submitBtnText}>Register Device</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24 },
  headerIconContainer: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
  headerIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  formGroup: { marginBottom: 24 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  inputWithScan: { flexDirection: 'row' },
  scanBtn: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  categoryRow: { flexDirection: 'row', gap: 10 },
  categoryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  categoryBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnText: { color: Colors.textOnPrimary, fontSize: 15, fontWeight: 'bold' },
});
