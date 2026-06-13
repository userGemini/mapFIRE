// src/services/realtimeSensorService.ts

import {
  get,
  onValue,
  orderByKey,
  query,
  ref,
  startAt,
  update,
} from 'firebase/database';
import { realtimeDb } from './firebase';
import { RUMAH_DATA } from '../constants/mqttConfig';
import type { RumahSensor, StatusSensor } from '../types';

const SATU_HARI_MS = 24 * 60 * 60 * 1000;

export type SensorHistoryPoint = {
  timestamp: number;
  id: string;
  nama: string;
  alamat: string;
  lat: number;
  lng: number;
  suhu: number | null;
  asap: number | null;
  co: number | null;
  status: StatusSensor;
  online: boolean;
  sumber?: string;
};

const toNumberOrZero = (value: unknown): number  => {
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
  suhu: number | null,
  asap: number | null,
  co: number | null,
): StatusSensor => {
  const nilaiSuhu = suhu ?? 0;
  const nilaiAsap = asap ?? 0;
  const nilaiCo = co ?? 0;

  if (nilaiSuhu > 65 || nilaiAsap > 70 || nilaiCo > 100) {
    return 'bahaya';
  }

  if (nilaiSuhu >= 45 || nilaiAsap >= 40 || nilaiCo >= 50) {
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
    online: Boolean(sensor?.online ?? true),
    lastUpdate: ubahTimestampKeDate(sensor?.lastUpdate ?? sensor?.updatedAt),
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
  const batas24Jam = Date.now() - SATU_HARI_MS;

  const historyRef = query(
    ref(realtimeDb, `sensorHistory/${rumahId}`),
    orderByKey(),
    startAt(String(batas24Jam)),
  );

  const unsubscribe = onValue(
    historyRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const history: SensorHistoryPoint[] = [];

      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key ?? '';
        const timestamp = Number(key);

        if (!Number.isFinite(timestamp) || timestamp < batas24Jam) {
          return;
        }

        const sensor = childSnapshot.val();
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
          id: rumahId,
          nama: sensor?.nama ?? rumahConfig?.nama ?? rumahId,
          alamat: sensor?.alamat ?? rumahConfig?.alamat ?? '-',
          lat: Number(sensor?.lat ?? sensor?.latitude ?? rumahAny?.lat ?? -7.265),
          lng: Number(sensor?.lng ?? sensor?.longitude ?? rumahAny?.lng ?? 112.752),
          suhu,
          asap,
          co,
          status,
          online: Boolean(sensor?.online ?? true),
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
    const key = childSnapshot.key ?? '';
    const timestamp = Number(key);

    if (Number.isFinite(timestamp) && timestamp < batas24Jam) {
      updates[`sensorHistory/${rumahId}/${key}`] = null;
    }
  });
};

export const simpanBanyakSensorMQTTKeRealtimeDatabase = async (
  sensorList: RumahSensor[],
) => {
  const updates: Record<string, any> = {};
  const waktuSekarang = Date.now();
  let jumlahSensorTersimpan = 0;

  for (const rumah of sensorList) {
    const adaData =
      rumah.suhu != null || rumah.asap != null || rumah.co != null;

    if (!adaData) {
      continue;
    }

    const dataSensor = {
      id: rumah.id,
      nama: rumah.nama,
      alamat: rumah.alamat,
      lat: (rumah as any).lat,
      lng: (rumah as any).lng,
      suhu: rumah.suhu ?? 0,
      asap: rumah.asap ?? 0,
      co: rumah.co ?? 0,
      status: rumah.status,
      online: rumah.online,
      lastUpdate: waktuSekarang,
      sumber: 'mqtt',
    };

    // Data terbaru. Bagian ini akan selalu diperbarui.
    updates[`sensors/${rumah.id}`] = dataSensor;

    // Data history. Bagian ini tidak menimpa data lama karena pakai timestamp.
    updates[`sensorHistory/${rumah.id}/${waktuSekarang}`] = dataSensor;

    // Hapus history yang lebih dari 24 jam.
    await bersihkanHistoryLebihDari24Jam(rumah.id, updates);

    jumlahSensorTersimpan += 1;
  }

  if (Object.keys(updates).length === 0) {
    return 0;
  }

  await update(ref(realtimeDb), updates);

  return jumlahSensorTersimpan;
<<<<<<< HEAD
};
=======
};
>>>>>>> caf9b93 (Axios untuk mengirim perintah dari TELEGRAM)
