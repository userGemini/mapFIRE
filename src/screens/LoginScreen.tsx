// src/screens/LoginScreen.tsx — SDK 540

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../types';
import { COLORS } from '../constants/colors';

type Nav = StackNavigationProp<RootStackParamList, 'Login'>;

interface Account {
  username: string;
  password: string;
  nama:     string;
  jabatan:  string;
}

const DEMO_ACCOUNTS: Account[] = [
  { username: 'petugas01', password: 'damkar123', nama: 'Brigadir Slamet',  jabatan: 'Petugas Jaga' },
  { username: 'komandan',  password: 'komandan99', nama: 'Kompol Haryanto', jabatan: 'Komandan Piket' },
];

export default function LoginScreen({ navigation }: { navigation: Nav }): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [loading, setLoading]    = useState(false);

  const handleLogin = async (): Promise<void> => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Username dan password harus diisi.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const akun = DEMO_ACCOUNTS.find(
      a => a.username === username.trim() && a.password === password,
    );
    setLoading(false);
    if (akun) {
      navigation.replace('MainTabs', { petugas: akun });
    } else {
      Alert.alert('Login Gagal', 'Username atau password salah.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}><Text style={{ fontSize: 18 }}>🔥</Text></View>
          <Text style={styles.brandText}>map<Text style={styles.brandRed}>FIRE</Text></Text>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeTxt}>DINAS DAMKAR</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>🛡️</Text>
          <Text style={styles.cardTitle}>Selamat Datang</Text>
          <Text style={styles.cardSub}>Masuk ke sistem monitoring kebakaran</Text>

          <Text style={styles.label}>ID Petugas / Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan username..."
            placeholderTextColor={COLORS.text_hint}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Masukkan password..."
              placeholderTextColor={COLORS.text_hint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
              <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnTxt}>🔐  Masuk ke Dashboard</Text>
            }
          </TouchableOpacity>

          {/* Unit info */}
          <View style={styles.unitBox}>
            <Text style={{ fontSize: 20 }}>🏢</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.unitName}>Dinas Pemadam Kebakaran</Text>
              <Text style={styles.unitSub}>Kota Surabaya — Pusat Komando</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
        </View>

        <Text style={styles.hint}>Demo: "petugas01" / "damkar123"</Text>
        <Text style={styles.footer}>mapFIRE v1.0 · Expo SDK 54 · OpenStreetMap</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet;
const styles = S.create({
  container:     { flex: 1, backgroundColor: COLORS.bg_primary },
  scroll:        { flexGrow: 1, justifyContent: 'center', padding: 20 },
  brandRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 10 },
  logoCircle:    { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
  brandText:     { fontSize: 22, fontWeight: '700', color: '#fff' },
  brandRed:      { color: COLORS.brand },
  brandBadge:    { backgroundColor: COLORS.brand_dim, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5, borderColor: COLORS.brand + '50' },
  brandBadgeTxt: { fontSize: 10, color: COLORS.brand, fontWeight: '600' },
  card:          { backgroundColor: COLORS.bg_secondary, borderRadius: 16, padding: 22, borderWidth: 0.5, borderColor: COLORS.border },
  cardTitle:     { textAlign: 'center', fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 4 },
  cardSub:       { textAlign: 'center', fontSize: 13, color: COLORS.text_muted, marginBottom: 20 },
  label:         { fontSize: 12, color: COLORS.text_muted, marginBottom: 6 },
  input:         { backgroundColor: COLORS.bg_primary, borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: '#fff', marginBottom: 14 },
  inputRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  eyeBtn:        { paddingHorizontal: 12 },
  loginBtn:      { backgroundColor: COLORS.brand, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  loginBtnTxt:   { color: '#fff', fontSize: 15, fontWeight: '600' },
  unitBox:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.bg_primary, borderRadius: 10, padding: 12, marginTop: 16, borderWidth: 0.5, borderColor: COLORS.border },
  unitName:      { fontSize: 13, color: COLORS.text_secondary, fontWeight: '500' },
  unitSub:       { fontSize: 11, color: COLORS.text_muted },
  onlineDot:     { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.safe },
  hint:          { textAlign: 'center', fontSize: 11, color: COLORS.text_hint, marginTop: 14 },
  footer:        { textAlign: 'center', fontSize: 11, color: COLORS.text_hint, marginTop: 6 },
});
