<<<<<<< HEAD
// src/screens/LoginScreen.tsx
=======
// src/screens/LoginScreen.tsx — SDK 540
>>>>>>> 4eb5acbe87c843d3be7ac1e77de3c440cd2b2329

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { StackNavigationProp } from '@react-navigation/stack';

import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../types';
import {
  loginUserDenganFirestore,
  registerUser,
} from '../services/authAccessService';

type Nav = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen({
  navigation,
}: {
  navigation: Nav;
}): React.JSX.Element {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const resetForm = () => {
    setNama('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async () => {
    const emailTrimmed = email.trim().toLowerCase();
    const namaTrimmed = nama.trim();

    if (isRegister && namaTrimmed.length < 3) {
      Alert.alert('Data belum lengkap', 'Nama minimal 3 karakter.');
      return;
    }

    if (!emailTrimmed || !password) {
      Alert.alert('Data belum lengkap', 'Email dan password wajib diisi.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password terlalu pendek', 'Password minimal 6 karakter.');
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        await registerUser({
          nama: namaTrimmed,
          email: emailTrimmed,
          password,
        });

        Alert.alert(
          'Akun berhasil dibuat',
          'Data akun kamu sudah tersimpan di Firestore.',
          [
            {
              text: 'Masuk ke Dashboard',
              onPress: () => navigation.replace('MainTabs'),
            },
          ],
        );

        return;
      }

      await loginUserDenganFirestore(emailTrimmed, password);
      navigation.replace('MainTabs');
    } catch (error: any) {
      const message = String(error?.message ?? '');

      if (
        message.includes('Kamu belum mendaftar') ||
        message.includes('auth/user-not-found') ||
        message.includes('auth/invalid-credential')
      ) {
        Alert.alert('Login gagal', 'Kamu belum mendaftar.');
        return;
      }

      if (message.includes('auth/email-already-in-use')) {
        Alert.alert('Gagal membuat akun', 'Email ini sudah terdaftar.');
        return;
      }

      if (message.includes('auth/wrong-password')) {
        Alert.alert('Login gagal', 'Password salah.');
        return;
      }

      Alert.alert(
        isRegister ? 'Gagal membuat akun' : 'Login gagal',
        message || 'Terjadi kesalahan. Coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    resetForm();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <View style={styles.card}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🔥</Text>
        </View>

        <Text style={styles.title}>
          map<Text style={{ color: COLORS.brand }}>FIRE</Text>
        </Text>

        <Text style={styles.subtitle}>
          {isRegister
            ? 'Buat akun baru untuk mengakses dashboard.'
            : 'Masuk untuk memantau sensor kebakaran.'}
        </Text>

        {isRegister && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama kamu"
              placeholderTextColor={COLORS.text_hint}
              value={nama}
              onChangeText={setNama}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="contoh@email.com"
            placeholderTextColor={COLORS.text_hint}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimal 6 karakter"
            placeholderTextColor={COLORS.text_hint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {isRegister ? 'Create Account' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={switchMode}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.switchText}>
            {isRegister
              ? 'Sudah punya akun? Login'
              : 'Belum punya akun? Create Account'}
          </Text>
        </TouchableOpacity>

        {!isRegister && (
          <Text style={styles.note}>
            Jika belum terdaftar, sistem akan menampilkan pesan “Kamu belum mendaftar.”
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg_primary,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  card: {
    backgroundColor: COLORS.bg_secondary,
    borderRadius: 22,
    padding: 22,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },

  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.brand_dim,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },

  logoIcon: {
    fontSize: 28,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.text_muted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
  },

  inputGroup: {
    marginBottom: 14,
  },

  label: {
    color: COLORS.text_secondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    backgroundColor: COLORS.bg_primary,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text_primary,
    fontSize: 14,
  },

  primaryBtn: {
    backgroundColor: COLORS.brand,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  disabledBtn: {
    opacity: 0.7,
  },

  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  switchBtn: {
    marginTop: 16,
    alignItems: 'center',
  },

  switchText: {
    color: COLORS.brand,
    fontWeight: '600',
    fontSize: 13,
  },

  note: {
    marginTop: 16,
    color: COLORS.text_hint,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});