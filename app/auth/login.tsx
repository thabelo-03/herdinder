import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ImageBackground, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Colors from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>HerdFinder</Text>
          <Text style={styles.subtitle}>Secure GPS & LoRaWAN Tracking</Text>
        </View>

        <BlurView intensity={20} tint="dark" style={styles.formCard}>
          <View style={styles.inputGroup}>
            <FontAwesome name="envelope" size={16} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <FontAwesome name="lock" size={18} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginBtnText}>Log In</Text>
            <FontAwesome name="arrow-right" size={16} color={Colors.background} />
          </TouchableOpacity>
        </BlurView>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B13' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 100, height: 100, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 36, fontWeight: 'bold', marginBottom: 4, letterSpacing: 1 },
  subtitle: { color: Colors.primary, fontSize: 14, textAlign: 'center', letterSpacing: 0.5 },
  formCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 32,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12, width: 20, textAlign: 'center' },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' },
  loginBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loginBtnText: { color: Colors.background, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  signupText: { color: Colors.primary, fontSize: 14, fontWeight: 'bold' },
});
