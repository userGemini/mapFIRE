// src/screens/DashboardScreen.tsx — SDK 54 REVISI MEMBERSIHKAN PANEL AKSES

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

import { COLORS } from '../constants/colors';
import { useMQTT } from '../hooks/useMQTT';
import { useRealtimeDatabaseSensors } from '../hooks/useRealtimeDatabaseSensors';
import {
  simpanBanyakSensorMQTTKeRealtimeDatabase,
} from '../services/realtimeSensorService';

import { RUMAH_DATA } from '../constants/mqttConfig';
import MapViewMap from '../components/MapViewMap';
import SensorCard from '../components/SensorCard';
import StatusBadge from '../components/StatusBadge';
import type { RootStackParamList, RumahSensor, StatusSensor } from '../types';

type Nav = StackNavigationProp<RootStackParamList, 'MainTabs'>;
type Route = RouteProp<RootStackParamList, 'MainTabs'>;

type FilterOption = 'semua' | StatusSensor;

const FILTERS: FilterOption[] = ['semua', 'aman', 'waspada', 'bahaya'];
const DEMO_SENSOR_IDS = ['rumah_001', 'rumah_002', 'rumah_003'];

const adaDataSensor = (rumah: RumahSensor | undefined): rumah is RumahSensor => {
  if (!rumah) return false;
  return rumah.suhu != null || rumah.asap != null || rumah.co != null;
};

const pakaiDefaultNol = (rumah: RumahSensor): RumahSensor => {
  return {
    ...rumah,
    suhu: rumah.suhu ?? 0,
    asap: rumah.asap ?? 0,
    co: rumah.co ?? 0,
    online: rumah.online ?? false,
    status: rumah.status ?? 'aman',
  };
};

export default function DashboardScreen({
  navigation,
}: {
  navigation: Nav;
  route: Route;
}): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const {
    brokerStatus,
    sensorList: mqttSensorList,
    notifikasiTerbaru,
  } = useMQTT();

  const { sensorList: firebaseSensorList } = useRealtimeDatabaseSensors();
  const [selectedRumah, setSelectedRumah] = useState<RumahSensor | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterOption>('semua');

  // 🌟 Diubah menjadi 280 (Kembali ideal karena tombol taktis lama sudah dibersihkan)
  const slideAnim = useRef(new Animated.Value(280)).current; 
  const mqttSensorListRef = useRef<RumahSensor[]>([]);

  useEffect(() => {
    mqttSensorListRef.current = mqttSensorList;
  }, [mqttSensorList]);

  const demoList: RumahSensor[] = DEMO_SENSOR_IDS.map((id) => {
    const fromMQTT = mqttSensorList.find((rumah) => rumah.id === id);
    const fromFirebase = firebaseSensorList.find((rumah) => rumah.id === id);

    if (fromMQTT) return pakaiDefaultNol(fromMQTT);
    if (fromFirebase) return pakaiDefaultNol(fromFirebase);

    const rumahConfig = RUMAH_DATA.find((rumah) => rumah.id === id)!;
    return {
      ...rumahConfig,
      suhu: 0,
      asap: 0,
      co: 0,
      status: 'aman',
      lastUpdate: null,
      online: false,
    };
  });

  useEffect(() => {
    const simpanMQTTKeRealtimeDatabase = async () => {
      try {
        const dataMQTTValid = DEMO_SENSOR_IDS
          .map((id) => mqttSensorListRef.current.find((rumah) => rumah.id === id))
          .filter(adaDataSensor)
          .map(pakaiDefaultNol);

        if (dataMQTTValid.length === 0) return;

        const jumlah = await simpanBanyakSensorMQTTKeRealtimeDatabase(dataMQTTValid);
        console.log(`${jumlah} data MQTT berhasil disimpan`);
      } catch (error) {
        console.error(error);
      }
    };

    simpanMQTTKeRealtimeDatabase();
    const interval = setInterval(() => {
      simpanMQTTKeRealtimeDatabase();
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const openPanel = useCallback((rumah: RumahSensor) => {
    setSelectedRumah(rumah);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [slideAnim]);

  const closePanel = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 280,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSelectedRumah(null));
  }, [slideAnim]);

  const filteredList: RumahSensor[] =
    filterStatus === 'semua'
      ? demoList
      : demoList.filter((rumah) => rumah.status === filterStatus);

  const brokerColor =
    brokerStatus === 'connected'
      ? COLORS.safe
      : brokerStatus === 'reconnecting'
        ? COLORS.warning
        : COLORS.danger;

  const demoSummary = {
    aman: demoList.filter((rumah) => rumah.status === 'aman').length,
    waspada: demoList.filter((rumah) => rumah.status === 'waspada').length,
    bahaya: demoList.filter((rumah) => rumah.status === 'bahaya').length,
    total: demoList.length,
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View style={[styles.topbar, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}><Text style={{ fontSize: 13 }}>🔥</Text></View>
          <Text style={styles.appName}>map<Text style={{ color: COLORS.brand }}>FIRE</Text></Text>
        </View>

        <View style={styles.statsRow}>
          {([
            [COLORS.safe, `${demoSummary.aman} Aman`],
            [COLORS.warning, `${demoSummary.waspada} Waspada`],
            [COLORS.danger, `${demoSummary.bahaya} Bahaya`],
          ] as [string, string][]).map(([color, label]) => (
            <View key={label} style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.statTxt}>{label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifikasi', { notifikasi: notifikasiTerbaru })}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
          {notifikasiTerbaru.length > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeTxt}>{Math.min(notifikasiTerbaru.length, 99)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.chip, filterStatus === filter && styles.chipActive]}
            onPress={() => setFilterStatus(filter)}
          >
            <Text style={[styles.chipTxt, filterStatus === filter && styles.chipTxtActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}{' '}
              ({filter === 'semua' ? demoSummary.total : demoSummary[filter as StatusSensor] ?? 0})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Peta MapView */}
      <View style={styles.mapContainer}>
        <MapViewMap
          markers={filteredList}
          selectedId={selectedRumah?.id ?? null}
          onMarkerPress={openPanel}
          onMapPress={closePanel}
          onInfoPress={(rumah) => navigation.navigate('Detail', { rumah })}
        />

        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, { backgroundColor: brokerColor }]} />
          <Text style={styles.liveTxt}>
            {brokerStatus === 'connected' ? 'Live · HiveMQ Connected' : brokerStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}
          </Text>
        </View>

        <View style={[styles.legend, { bottom: insets.bottom + 16 }]}>
          <Text style={styles.legendTitle}>STATUS SENSOR</Text>
          {([
            ['safe', 'Aman'],
            ['warning', 'Waspada'],
            ['danger', 'Bahaya'],
          ] as [keyof typeof COLORS, string][]).map(([key, label]) => (
            <View key={key} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: COLORS[key] as string }]} />
              <Text style={styles.legendTxt}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Slide-up panel */}
      {selectedRumah != null && (
        <Animated.View
          style={[
            styles.detailPanel,
            { paddingBottom: insets.bottom + 14 },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.panelHandle} />

          <View style={styles.panelHeader}>
            <View style={styles.panelIcon}><Text style={{ fontSize: 22 }}>🏠</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.panelName}>{selectedRumah.nama}</Text>
              <Text style={styles.panelAddr}>{selectedRumah.alamat}</Text>
            </View>
            <StatusBadge status={selectedRumah.status} size="sm" />
            <TouchableOpacity style={styles.closeBtn} onPress={closePanel}>
              <Text style={{ color: COLORS.text_muted, fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sensorGrid}>
            <SensorCard icon="🌡️" label="Suhu" value={selectedRumah.suhu ?? 0} unit="°C" status={selectedRumah.status} />
            <SensorCard icon="💨" label="Asap" value={selectedRumah.asap ?? 0} unit="%" status={selectedRumah.status} />
            <SensorCard icon="☁️" label="CO Gas" value={selectedRumah.co ?? 0} unit="ppm" status={selectedRumah.status} />
          </View>

          {/* 🌟 ACTION BUTTON BARU: Lansung Navigasi untuk memicu Telegram dari Detail */}
          <TouchableOpacity
            style={styles.detailBtn}
            activeOpacity={0.8}
            onPress={() => {
              const dataRumahKirim = selectedRumah;
              closePanel();
              navigation.navigate('Detail', { rumah: dataRumahKirim });
            }}
          >
            <Text style={styles.detailBtnTxt}>
              {selectedRumah.status === 'aman' 
                ? 'Lihat Grafik & History Kinerja  →' 
                : '⚠️ Ambil Tindakan / Lihat Grafik Detail  →'}
            </Text>
          </TouchableOpacity>

          {selectedRumah.lastUpdate != null && (
            <Text style={styles.updateTxt}>
              Update: {selectedRumah.lastUpdate.toLocaleTimeString('id-ID')}
            </Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg_primary },
  topbar: { backgroundColor: COLORS.bg_secondary, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border_brand, flexDirection: 'row', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 10 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statTxt: { fontSize: 10, color: COLORS.text_secondary },
  notifBtn: { position: 'relative', padding: 4 },
  notifBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.brand, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  notifBadgeTxt: { fontSize: 9, color: '#fff', fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.bg_secondary, gap: 7 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: COLORS.bg_primary, borderWidth: 0.5, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.brand_dim, borderColor: COLORS.brand + '60' },
  chipTxt: { fontSize: 11, color: COLORS.text_muted },
  chipTxtActive: { color: COLORS.brand, fontWeight: '600' },
  mapContainer: { flex: 1, position: 'relative' },
  liveBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(22,25,33,0.88)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: COLORS.border },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveTxt: { fontSize: 11, color: COLORS.text_secondary },
  legend: { position: 'absolute', right: 10, backgroundColor: 'rgba(22,25,33,0.9)', borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: COLORS.border },
  legendTitle: { fontSize: 9, color: COLORS.text_hint, marginBottom: 6, letterSpacing: 0.8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, color: COLORS.text_secondary },
  detailPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.bg_secondary, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderTopWidth: 0.5, borderTopColor: COLORS.border },
  panelHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 14 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  panelIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.brand_dim, alignItems: 'center', justifyContent: 'center' },
  panelName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  panelAddr: { fontSize: 12, color: COLORS.text_muted },
  closeBtn: { padding: 6 },
  sensorGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  detailBtn: { backgroundColor: COLORS.bg_primary, borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border },
  detailBtnTxt: { color: COLORS.text_secondary, fontWeight: '700', fontSize: 14 },
  updateTxt: { textAlign: 'center', fontSize: 11, color: COLORS.text_hint, marginTop: 8 },
});