import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import Colors from '../../constants/Colors';

export default function ResetPasswordScreen() {
  const router = useRouter();
  // Expecting a ?token=XYZ from the email link
  const { token } = useLocalSearchParams<{ token?: string }>();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const API_URL = Platform.OS === 'web' 
    ? 'http://localhost:5000/api/auth' 
    : 'http://10.0.2.2:5000/api/auth';

  const handleResetPassword = async () => {
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccessMsg('Password successfully reset! Redirecting to login...');
      
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
          
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/auth/login')}>
            <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>Your new password must be different from previously used passwords.</Text>
          </View>

          <BlurView intensity={20} tint="dark" style={styles.formCard}>
            {error ? <View style={styles.errorContainer}><FontAwesome name="exclamation-circle" size={14} color={Colors.danger} /><Text style={styles.errorText}>{error}</Text></View> : null}
            {successMsg ? <View style={styles.successContainer}><FontAwesome name="check-circle" size={14} color="#34C759" /><Text style={styles.successText}>{successMsg}</Text></View> : null}

            {!token && !error && !successMsg && (
              <View style={styles.errorContainer}>
                <FontAwesome name="exclamation-circle" size={14} color={Colors.warning} />
                <Text style={[styles.errorText, { color: Colors.warning }]}>No reset token found in URL. The link might be invalid.</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <FontAwesome name="lock" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={(text) => { setNewPassword(text); setError(''); }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <FontAwesome name="lock" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <FontAwesome name={showConfirmPassword ? "eye" : "eye-slash"} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleResetPassword} activeOpacity={0.8} disabled={isLoading || !token}>
              {isLoading ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Save Password</Text>
                  <FontAwesome name="check" size={16} color={Colors.background} />
                </>
              )}
            </TouchableOpacity>
          </BlurView>
          
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
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
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
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  submitBtnText: { color: Colors.background, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
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
