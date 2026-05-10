import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '../../constants/Colors';

const FAQS = [
  { q: 'How do I add a new tracker?', a: 'Go to More > Register Device and enter the Tag ID printed on the hardware.' },
  { q: 'Why is my gateway offline?', a: 'Check the power source and ensure the MikroTik wAP LR8 has an active internet connection.' },
  { q: 'How accurate is the location?', a: 'GPS accuracy is typically within 5-10 meters outdoors. Indoors, it relies on network triangulation.' },
];

export default function HelpScreen() {
  const handleSupport = () => Linking.openURL('https://wa.me/263777926123');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.supportBtn} onPress={handleSupport}>
          <FontAwesome name="whatsapp" size={24} color="#FFF" />
          <Text style={styles.supportBtnText}>Chat with Support</Text>
        </TouchableOpacity>

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
});
