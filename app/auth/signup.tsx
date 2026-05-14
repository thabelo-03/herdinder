import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // localhost = web, LAN IP = physical Android device
  const API_URL = Platform.OS === 'web'
    ? 'http://localhost:5000/api/auth'
    : 'http://192.168.3.64:5000/api/auth';

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success! Show message and navigate to login after a delay
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.replace('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Network error. Make sure your server is running.');
    } finally {
      setIsLoading(false);
    }
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
            {error ? <View style={styles.errorContainer}><FontAwesome name="exclamation-circle" size={14} color={Colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
            {successMsg ? <View style={styles.successContainer}><FontAwesome name="check-circle" size={14} color="#34C759" /><Text style={styles.successText}>{successMsg}</Text></View> : null}

            <View style={styles.inputGroup}>
              <FontAwesome name="user" size={16} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                value={name}
                onChangeText={(text) => { setName(text); setError(''); }}
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
                onChangeText={(text) => { setEmail(text); setError(''); }}
              />
            </View>

            <View style={styles.inputGroup}>
              <FontAwesome name="lock" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => { setPassword(text); setError(''); }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <FontAwesome name="lock" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showConfirmPassword ? "eye" : "eye-slash"} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>By signing up, you agree to our </Text>
              <TouchableOpacity onPress={() => router.push('/terms')}>
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} activeOpacity={0.8} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <>
                  <Text style={styles.signupBtnText}>Create Account</Text>
                  <FontAwesome name="check" size={16} color={Colors.background} />
                </>
              )}
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
  eyeIcon: { padding: 8 },
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    gap: 8,
  },
  errorText: { color: Colors.danger, fontSize: 13, flex: 1 },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
    gap: 8,
  },
  successText: { color: '#34C759', fontSize: 13, flex: 1 },
});
