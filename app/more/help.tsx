import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { StorageManager } from '../../services/storageManager';

const FAQS = [
  { q: 'How do I add a new tracker?', a: 'Go to More > Register Device and enter the Tag ID printed on the hardware.' },
  { q: 'Why is my gateway offline?', a: 'Check the power source and ensure the MikroTik wAP LR8 has an active internet connection.' },
  { q: 'How accurate is the location?', a: 'GPS accuracy is typically within 5-10 meters outdoors. Indoors, it relies on network triangulation.' },
];

export default function HelpScreen() {
  const [cacheSize, setCacheSize] = useState('Calculating...');

  const handleSupport = () => Linking.openURL('https://wa.me/263777926123');

  useEffect(() => {
    updateCacheSize();
  }, []);

  const updateCacheSize = async () => {
    const size = await StorageManager.getMapCacheSize();
    setCacheSize(`${(size / (1024 * 1024)).toFixed(1)} MB`);
  };

  const handleClearCache = async () => {
    await StorageManager.clearMapCache();
    updateCacheSize();
    Alert.alert('Success', 'Offline map cache has been cleared.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity style={styles.supportBtn} onPress={handleSupport}>
          <FontAwesome name="whatsapp" size={24} color="#FFF" />
          <Text style={styles.supportBtnText}>Chat with Support</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>STORAGE MANAGEMENT</Text>
        <View style={styles.faqCard}>
          <View style={styles.storageRow}>
            <View>
              <Text style={styles.faqQ}>Map Tile Cache</Text>
              <Text style={styles.faqA}>Currently using {cacheSize}</Text>
            </View>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearCache}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>

        {FAQS.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQ}>{faq.q}</Text>
            <Text style={styles.faqA}>{faq.a}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 20 },
  supportBtn: { flexDirection: 'row', backgroundColor: '#25D366', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 32 },
  supportBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
  faqCard: { backgroundColor: Colors.cardElevated, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  faqQ: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  faqA: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  storageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearBtn: { backgroundColor: 'rgba(255, 69, 58, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FF453A' },
  clearBtnText: { color: '#FF453A', fontWeight: 'bold', fontSize: 13 },
});
