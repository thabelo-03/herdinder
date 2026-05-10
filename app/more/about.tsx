import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>HF</Text>
      </View>
      <Text style={styles.appName}>HerdFinder</Text>
      <Text style={styles.version}>Version 1.0.0 (Build 42)</Text>

      <Text style={styles.desc}>
        Advanced IoT tracking and management system for livestock and assets. Built with React Native, powered by LoRaWAN.
      </Text>

      <View style={styles.links}>
        <TouchableOpacity><Text style={styles.linkText}>Terms of Service</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.linkText}>Privacy Policy</Text></TouchableOpacity>
        <TouchableOpacity><Text style={styles.linkText}>Open Source Licenses</Text></TouchableOpacity>
      </View>

      <Text style={styles.copyright}>© 2026 HerdFinder. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: Colors.background, padding: 32, paddingTop: 64 },
  logoBox: { width: 100, height: 100, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  logoText: { fontSize: 40, fontWeight: 'bold', color: Colors.backgroundSecondary },
  appName: { color: Colors.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  version: { color: Colors.textMuted, fontSize: 14, marginBottom: 32 },
  desc: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 48 },
  links: { gap: 20, alignItems: 'center', marginBottom: 48 },
  linkText: { color: Colors.info, fontSize: 16, fontWeight: '500' },
  copyright: { color: Colors.textMuted, fontSize: 12, position: 'absolute', bottom: 40 },
});
