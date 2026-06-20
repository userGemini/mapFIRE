// src/services/realtimeSensorService.ts

import {
  get,
  onValue,
  ref,
  update,
} from 'firebase/database';
import { realtimeDb } from './firebase';
import { RUMAH_DATA } from '../constants/mqttConfig';
import type { RumahSensor, StatusSensor } from '../types';

const SATU_HARI_MS = 24 * 60 * 60 * 1000;

export type SensorHistoryPoint = {
  timestamp: number;
  tanggal: string;
  jam: string;
  waktuLabel: string;
  id: string;
  nama: string;
  alamat: string;
  lat: number;
  lng: number;
  suhu: number;
  asap: number;
  co: number;
  status: StatusSensor;
  online: boolean;
  sumber?: string;
};

const pad2 = (value: number): string => {
  return String(value).padStart(2, '0');
};

const pad3 = (value: number): string => {
  return String(value).padStart(3, '0');
};

// Key history agar di Firebase tidak lagi angka panjang.
// Contoh: 2026-06-13_12-30-05-123
const buatHistoryKey = (timestamp: number): string => {
  const date = new Date(timestamp);

  const tahun = date.getFullYear();
  const bulan = pad2(date.getMonth() + 1);
  const tanggal = pad2(date.getDate());
  const jam = pad2(date.getHours());
  const menit = pad2(date.getMinutes());
  const detik = pad2(date.getSeconds());
  const miliDetik = pad3(date.getMilliseconds());

  return `${tahun}-${bulan}-${tanggal}_${jam}-${menit}-${detik}-${miliDetik}`;
};

const buatTanggalLabel = (timestamp: number): string => {
  const date = new Date(timestamp);

  const tahun = date.getFullYear();
  const bulan = pad2(date.getMonth() + 1);
  const tanggal = pad2(date.getDate());

  return `${tanggal}-${bulan}-${tahun}`;
};

const buatJamLabel = (timestamp: number): string => {
  const date = new Date(timestamp);

  const jam = pad2(date.getHours());
  const menit = pad2(date.getMinutes());
  const detik = pad2(date.getSeconds());

  return `${jam}:${menit}:${detik}`;
};

const toNumberOrZero = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const ubahTimestampKeDate = (value: unknown): Date | null => {
  if (typeof value === 'number') {
    return new Date(value);
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

const hitungStatusSensor = (
  suhu: number,
  asap: number,
  co: number,
): StatusSensor => {
  if (suhu > 65 || asap > 70 || co > 100) {
    return 'bahaya';
  }

  if (suhu >= 45 || asap >= 40 || co >= 50) {
    return 'waspada';
  }

  return 'aman';
};

const normalisasiSensor = (id: string, sensor: any): RumahSensor => {
  const rumahConfig = RUMAH_DATA.find((rumah) => rumah.id === id);
  const rumahAny = rumahConfig as any;

  const suhu = toNumberOrZero(sensor?.suhu);
  const asap = toNumberOrZero(sensor?.asap);
  const co = toNumberOrZero(sensor?.co);

  const status =
    sensor?.status === 'aman' ||
    sensor?.status === 'waspada' ||
    sensor?.status === 'bahaya'
      ? sensor.status
      : hitungStatusSensor(suhu, asap, co);

  return {
    ...(rumahConfig ?? {}),
    id,
    nama: sensor?.nama ?? rumahConfig?.nama ?? id,
    alamat: sensor?.alamat ?? rumahConfig?.alamat ?? '-',
    lat: Number(sensor?.lat ?? sensor?.latitude ?? rumahAny?.lat ?? -7.265),
    lng: Number(sensor?.lng ?? sensor?.longitude ?? rumahAny?.lng ?? 112.752),
    suhu,
    asap,
    co,
    status,
    online: Boolean(sensor?.online ?? false),
    lastUpdate: ubahTimestampKeDate(sensor?.lastUpdate ?? sensor?.timestamp),
  } as RumahSensor;
};

export const ambilSensorRealtimeDatabase = async (): Promise<RumahSensor[]> => {
  const snapshot = await get(ref(realtimeDb, 'sensors'));

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();

  return Object.keys(data).map((id) => normalisasiSensor(id, data[id]));
};

export const listenSensorRealtimeDatabase = (
  callback: (data: RumahSensor[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const sensorRef = ref(realtimeDb, 'sensors');

  const unsubscribe = onValue(
    sensorRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.val();

      const sensorList = Object.keys(data).map((id) =>
        normalisasiSensor(id, data[id]),
      );

      callback(sensorList);
    },
    (error) => {
      console.error('Gagal membaca Realtime Database:', error);
      onError?.(error);
    },
  );

  return unsubscribe;
};

export const listenHistorySensor24Jam = (
  rumahId: string,
  callback: (data: SensorHistoryPoint[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const historyRef = ref(realtimeDb, `sensorHistory/${rumahId}`);

  const unsubscribe = onValue(
    historyRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const batas24Jam = Date.now() - SATU_HARI_MS;
      const history: SensorHistoryPoint[] = [];

      snapshot.forEach((childSnapshot) => {
        const sensor = childSnapshot.val();

        const timestampDariData = Number(sensor?.timestamp);
        const timestampDariKey = Number(childSnapshot.key);
        const timestamp = Number.isFinite(timestampDariData)
          ? timestampDariData
          : timestampDariKey;

        if (!Number.isFinite(timestamp)) {
          return;
        }

        if (timestamp < batas24Jam) {
          return;
        }

        const rumahConfig = RUMAH_DATA.find((rumah) => rumah.id === rumahId);
        const rumahAny = rumahConfig as any;

        const suhu = toNumberOrZero(sensor?.suhu);
        const asap = toNumberOrZero(sensor?.asap);
        const co = toNumberOrZero(sensor?.co);

        const status =
          sensor?.status === 'aman' ||
          sensor?.status === 'waspada' ||
          sensor?.status === 'bahaya'
            ? sensor.status
            : hitungStatusSensor(suhu, asap, co);

        history.push({
          timestamp,
          tanggal: sensor?.tanggal ?? buatTanggalLabel(timestamp),
          jam: sensor?.jam ?? buatJamLabel(timestamp),
          waktuLabel:
            sensor?.waktuLabel ??
            `${buatTanggalLabel(timestamp)} ${buatJamLabel(timestamp)}`,
          id: rumahId,
          nama: sensor?.nama ?? rumahConfig?.nama ?? rumahId,
          alamat: sensor?.alamat ?? rumahConfig?.alamat ?? '-',
          lat: Number(sensor?.lat ?? sensor?.latitude ?? rumahAny?.lat ?? -7.265),
          lng: Number(sensor?.lng ?? sensor?.longitude ?? rumahAny?.lng ?? 112.752),
          suhu,
          asap,
          co,
          status,
          online: Boolean(sensor?.online ?? false),
          sumber: sensor?.sumber,
        });
      });

      history.sort((a, b) => a.timestamp - b.timestamp);
      callback(history);
    },
    (error) => {
      console.error('Gagal membaca history sensor:', error);
      onError?.(error);
    },
  );

  return unsubscribe;
};

const bersihkanHistoryLebihDari24Jam = async (
  rumahId: string,
  updates: Record<string, any>,
) => {
  const batas24Jam = Date.now() - SATU_HARI_MS;
  const historySnapshot = await get(ref(realtimeDb, `sensorHistory/${rumahId}`));

  if (!historySnapshot.exists()) {
    return;
  }

  historySnapshot.forEach((childSnapshot) => {
    const sensor = childSnapshot.val();

    const timestampDariData = Number(sensor?.timestamp);
    const timestampDariKey = Number(childSnapshot.key);
    const timestamp = Number.isFinite(timestampDariData)
      ? timestampDariData
      : timestampDariKey;

    if (!Number.isFinite(timestamp)) {
      return;
    }

    if (timestamp < batas24Jam) {
      updates[`sensorHistory/${rumahId}/${childSnapshot.key}`] = null;
    }
  });
};

export const bersihkanSemuaHistoryLebihDari24Jam = async () => {
  const updates: Record<string, any> = {};

  for (const rumah of RUMAH_DATA) {
    await bersihkanHistoryLebihDari24Jam(rumah.id, updates);
  }

  if (Object.keys(updates).length === 0) {
    return 0;
  }

  await update(ref(realtimeDb), updates);

  return Object.keys(updates).length;
};

export const simpanBanyakSensorMQTTKeRealtimeDatabase = async (
  sensorList: RumahSensor[],
) => {
  const updates: Record<string, any> = {};
  const waktuSekarang = Date.now();
  const historyKey = buatHistoryKey(waktuSekarang);

  let jumlahSensorTersimpan = 0;

  for (const rumah of sensorList) {
    const suhu = rumah.suhu ?? 0;
    const asap = rumah.asap ?? 0;
    const co = rumah.co ?? 0;

    const dataSensor = {
      id: rumah.id,
      nama: rumah.nama,
      alamat: rumah.alamat,
      lat: (rumah as any).lat,
      lng: (rumah as any).lng,
      suhu,
      asap,
      co,
      status: rumah.status ?? hitungStatusSensor(suhu, asap, co),
      online: rumah.online ?? false,
      lastUpdate: waktuSekarang,
      timestamp: waktuSekarang,
      tanggal: buatTanggalLabel(waktuSekarang),
      jam: buatJamLabel(waktuSekarang),
      waktuLabel: `${buatTanggalLabel(waktuSekarang)} ${buatJamLabel(waktuSekarang)}`,
      sumber: 'mqtt',
    };

    // Data terbaru.
    updates[`sensors/${rumah.id}`] = dataSensor;

    // Data history dengan key berbentuk tanggal dan jam.
    updates[`sensorHistory/${rumah.id}/${historyKey}`] = dataSensor;

    // Hapus history milik rumah ini yang sudah lebih dari 24 jam.
    await bersihkanHistoryLebihDari24Jam(rumah.id, updates);

    jumlahSensorTersimpan += 1;
  }

  if (Object.keys(updates).length === 0) {
    return 0;
  }

  await update(ref(realtimeDb), updates);

  return jumlahSensorTersimpan;
};