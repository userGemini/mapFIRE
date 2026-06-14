// src/screens/DetailScreen.tsx — SDK 54 REVISI INTEGRASI TELEGRAM

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import SensorCard from '../components/SensorCard';
import StatusBadge from '../components/StatusBadge';
import type { RootStackParamList } from '../types';
// 🌟 Import service Axios POST Telegram
import { kirimNotifikasiDaruratTeks } from '../services/emergencyService';

type Nav = StackNavigationProp<RootStackParamList, 'Detail'>;
type Route = RouteProp<RootStackParamList, 'Detail'>;

const { width } = Dimensions.get('window');

interface ChartProps {
  data: number[];
  color: string;
  maxVal: number;
}

function MiniChart({ data, color, maxVal }: ChartProps): React.JSX.Element {
  const barW = (width - 80) / data.length - 2;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: 2 }}>
      {data.map((val, i) => {
        const safeValue = Number.isFinite(val) ? val : 0;
        const h = Math.max(4, Math.min((safeValue / maxVal) * 56, 56));

        return (
          <View
            key={i}
            style={{
              width: barW,
              height: h,
              backgroundColor: color,
              borderRadius: 3,
              opacity: i === data.length - 1 ? 1 : 0.35,
            }}
          />
        );
      })}
    </View>
  );
}

const appendHistoryValue = (
  previousValues: number[],
  newValue: number | null | undefined,
): number[] => {
  const lastValue =
    previousValues.length > 0 ? previousValues[previousValues.length - 1] : 0;

  const nextValue =
    typeof newValue === 'number' && Number.isFinite(newValue)
      ? newValue
      : lastValue;

  return [...previousValues.slice(1), nextValue];
};

export default function DetailScreen({
  route,
  navigation,
}: {
  route: Route;
  navigation: Nav;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { rumah } = route.params;

  const [history, setHistory] = useState({
    suhu: Array.from({ length: 12 }, () => rumah.suhu ?? 0),
    asap: Array.from({ length: 12 }, () => rumah.asap ?? 0),
    co: Array.from({ length: 12 }, () => rumah.co ?? 0),
  });

  // 🌟 State Loading untuk proses Axios POST
  const [loadingAxios, setLoadingAxios] = useState<boolean>(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const adaDataSensor =
        rumah.suhu != null || rumah.asap != null || rumah.co != null;

      if (!adaDataSensor) {
        return;
      }

      setHistory((prev) => ({
        suhu: appendHistoryValue(prev.suhu, rumah.suhu),
        asap: appendHistoryValue(prev.asap, rumah.asap),
        co: appendHistoryValue(prev.co, rumah.co),
      }));
    }, 5000);

    return () => clearInterval(iv);
  }, [rumah]);

  // 🌟 Fungsi Handler pemicu Notifikasi Dinamis berdasarkan status device
  const handleKirimLaporanDarurat = async (levelAksi: 'waspada' | 'bahaya') => {
    setLoadingAxios(true);
    try {
      const payload = {
        idRumah: rumah.id,
        namaPemilik: rumah.nama,
        alamatRumah: rumah.alamat,
        suhu: rumah.suhu ?? 0,
        asap: rumah.asap ?? 0,
        co: rumah.co ?? 0,
        level: levelAksi, // Menyalin parameter level ke service Axios
      };

      const sukses = await kirimNotifikasiDaruratTeks(payload);

      if (sukses) {
        const teksAlert = levelAksi === 'bahaya'
          ? "Laporan Kedaruratan Terkirim! Armada pemadam kebakaran segera dikerahkan ke lokasi."
          : "Peringatan Dini Terkirim! Petugas sektor patroli sedang menuju lokasi pengecekan.";
        Alert.alert("🚒 Posko Terintegrasi", teksAlert);
      } else {
        Alert.alert("Pengiriman Gagal", "Gagal meneruskan laporan taktis ke Telegram.");
      }
    } catch (err) {
      Alert.alert("Error", "Terjadi kegagalan interkoneksi REST API.");
    } finally {
      setLoadingAxios(false);
    }
  };

  const infoRows = [
    { label: 'ID Perangkat', value: rumah.id },
    { label: 'Nama Pemilik', value: rumah.nama },
    { label: 'Alamat', value: rumah.alamat },
    { label: 'Koordinat', value: `${rumah.lat.toFixed(5)}, ${rumah.lng.toFixed(5)}` },
    { label: 'Status Koneksi', value: rumah.online ? '✅ Online' : '❌ Offline' },
    { label: 'Update Terakhir', value: rumah.lastUpdate?.toLocaleTimeString('id-ID') ?? '-' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 24, color: COLORS.text_secondary }}>‹</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{rumah.nama}</Text>
          <Text style={styles.headerSub}>{rumah.alamat}</Text>
        </View>

        <StatusBadge status={rumah.status} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>📡 Data Sensor Real-time</Text>

        <View style={styles.sensorGrid}>
          <SensorCard
            icon="🌡️"
            label="Suhu"
            value={rumah.suhu ?? 0}
            unit="°C"
            status={rumah.status}
          />

          <SensorCard
            icon="💨"
            label="Asap"
            value={rumah.asap ?? 0}
            unit="%"
            status={rumah.status}
          />

          <SensorCard
            icon="☁️"
            label="CO Gas"
            value={rumah.co ?? 0}
            unit="ppm"
            status={rumah.status}
          />
        </View>

        {/* Ambang batas */}
        <View style={styles.threshBox}>
          <Text style={styles.threshTitle}>Ambang Batas Sensor</Text>

          <View style={styles.threshRow}>
            {([
              [COLORS.safe, 'Suhu < 45°C'],
              [COLORS.warning, 'Suhu 45–65°C'],
              [COLORS.danger, 'Suhu > 65°C'],
            ] as [string, string][]).map(([c, l]) => (
              <View key={l} style={styles.threshItem}>
                <View style={[styles.threshDot, { backgroundColor: c }]} />
                <Text style={styles.threshTxt}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.section}>📈 Historis Suhu (°C)</Text>
        <View style={styles.chartCard}>
          <MiniChart data={history.suhu} color={COLORS.brand} maxVal={100} />
          <View style={styles.chartFoot}>
            <Text style={styles.chartLbl}>12 mnt lalu</Text>
            <Text style={styles.chartLbl}>Sekarang</Text>
          </View>
        </View>

        <Text style={styles.section}>📈 Historis Asap (%)</Text>
        <View style={styles.chartCard}>
          <MiniChart data={history.asap} color={COLORS.warning} maxVal={100} />
          <View style={styles.chartFoot}>
            <Text style={styles.chartLbl}>12 mnt lalu</Text>
            <Text style={styles.chartLbl}>Sekarang</Text>
          </View>
        </View>

        <Text style={styles.section}>📈 Historis CO Gas (ppm)</Text>
        <View style={styles.chartCard}>
          <MiniChart data={history.co} color={COLORS.danger} maxVal={150} />
          <View style={styles.chartFoot}>
            <Text style={styles.chartLbl}>12 mnt lalu</Text>
            <Text style={styles.chartLbl}>Sekarang</Text>
          </View>
        </View>

        <Text style={styles.section}>ℹ️ Informasi Perangkat</Text>

        <View style={styles.infoCard}>
          {infoRows.map((row, i) => (
            <View
              key={i}
              style={[
                styles.infoRow,
                i < infoRows.length - 1 && styles.infoRowBorder,
              ]}
            >
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* 🌟 TOMBOL AKSI DINAMIS TERKONEKSI TELEGRAM */}
        {(rumah.status === 'bahaya' || rumah.status === 'waspada') && (
          <TouchableOpacity
            style={[
              styles.dispatchBtn,
              rumah.status === 'bahaya' && { backgroundColor: COLORS.brand },
              loadingAxios && { opacity: 0.6 }
            ]}
            disabled={loadingAxios}
            onPress={() => handleKirimLaporanDarurat(rumah.status as 'waspada' | 'bahaya')}
          >
            {loadingAxios ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.dispatchTxt}>
                {rumah.status === 'bahaya'
                  ? '🚒 Kirim Tim Pemadam Sekarang'
                  : '👷 Kirim Petugas Cek Lokasi'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg_primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg_secondary,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.text_muted,
  },
  scroll: {
    flex: 1,
    padding: 14,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text_secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  threshBox: {
    backgroundColor: COLORS.bg_secondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  threshTitle: {
    fontSize: 11,
    color: COLORS.text_muted,
    marginBottom: 8,
  },
  threshRow: {
    flexDirection: 'row',
    gap: 10,
  },
  threshItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  threshDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  threshTxt: {
    fontSize: 11,
    color: COLORS.text_secondary,
  },
  chartCard: {
    backgroundColor: COLORS.bg_secondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  chartFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chartLbl: {
    fontSize: 10,
    color: COLORS.text_hint,
  },
  infoCard: {
    backgroundColor: COLORS.bg_secondary,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.text_muted,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.text_primary,
    flex: 2,
    textAlign: 'right',
  },
  dispatchBtn: {
    marginTop: 20,
    backgroundColor: COLORS.warning_dim,
    borderWidth: 1,
    borderColor: COLORS.warning + '50',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  dispatchTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});