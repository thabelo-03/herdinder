import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Colors from '../../constants/Colors';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join HerdFinder and start tracking your assets today.</Text>
          </View>

          <BlurView intensity={20} tint="dark" style={styles.formCard}>
            <View style={styles.inputGroup}>
              <FontAwesome name="user" size={16} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>

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

            <View style={styles.inputGroup}>
              <FontAwesome name="lock" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>By signing up, you agree to our </Text>
              <TouchableOpacity onPress={() => router.push('/terms')}>
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} activeOpacity={0.8}>
              <Text style={styles.signupBtnText}>Create Account</Text>
              <FontAwesome name="check" size={16} color={Colors.background} />
            </TouchableOpacity>
          </BlurView>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0B13' },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 20, padding: 8, marginLeft: -8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 64, height: 64, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: Colors.primary, fontSize: 13, textAlign: 'center', opacity: 0.8 },
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
  termsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, marginTop: 4, justifyContent: 'center' },
  termsText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  termsLink: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
  signupBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  signupBtnText: { color: Colors.background, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto' },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  loginText: { color: Colors.primary, fontSize: 14, fontWeight: 'bold' },
});
