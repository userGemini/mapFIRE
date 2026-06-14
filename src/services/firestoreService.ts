import { writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase'; // Pastikan di-import dari file config lokalmu, BUKAN dari 'firebase/firestore'
import axios from 'axios';

// Definisi struktur data yang lengkap agar TypeScript tidak eror
export interface RumahSensor {
  id: string;
  namaPemilik: string;
  alamat: string;
  koordinat: string; // Format: "-7.26580, 112.75240"
  suhu: number;
  asap: number;
  coGas: number;
  statusKoneksi: boolean;
  latitude?: number;
  longitude?: number;
  kecepatanAngin?: number; // Tambahan properti hasil GET API Cuaca
}

/**
 * Fitur GET: Mengambil data kecepatan angin terkini berdasarkan koordinat rumah menggunakan Axios
 */
export const fetchKecepatanAnginSektor = async (lat: number, lng: number): Promise<number> => {
  try {
    // Menggunakan API Open-Meteo untuk mendapatkan data kecepatan angin (wind_speed_10m)
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m`
    );
    
    // Ambil data kecepatan angin dari response payload
    const windSpeed = response.data?.current?.wind_speed_10m || 0;
    console.log(`🌤️ [Axios GET] Kecepatan angin di lokasi (${lat}, ${lng}): ${windSpeed} km/h`);
    return windSpeed;
  } catch (error) {
    console.error('❌ [Axios GET] Gagal mengambil data cuaca/angin:', error);
    return 0; // fallback nilai 0 jika API down atau error
  }
};

/**
 * Fitur BATCH SET: Memproses data sensor, memecah koordinat, fetch data angin, dan simpan ke Firestore
 */
export const simpanBanyakSensorMQTTKeFirestore = async (dataValid: RumahSensor[]): Promise<void> => {
  const batch = writeBatch(db);

  // Menggunakan for...of agar proses async/await di dalam loop berjalan sekuensial dengan benar
  for (const rumah of dataValid) {
    // Pastikan documentId aman
    const documentId = rumah.id || `rumah_${Math.random().toString(36).substr(2, 9)}`;
    const docRef = doc(db, 'sensors', documentId);

    let lat = 0;
    let lng = 0;

    // SOLUSI TS: Memecah string 'rumah.koordinat' menjadi latitude & longitude numerik
    if (typeof rumah.koordinat === 'string' && rumah.koordinat.includes(',')) {
      const [splitLat, splitLng] = rumah.koordinat.split(',');
      lat = parseFloat(splitLat.trim()) || 0;
      lng = parseFloat(splitLng.trim()) || 0;
    }

    // Panggil fungsi GET Cuaca untuk mendapatkan data angin eksternal sektor tersebut
    const anginSektor = await fetchKecepatanAnginSektor(lat, lng);

    // Siapkan objek data final yang bersih dan aman
    const dataToSave = {
      id: documentId,
      namaPemilik: rumah.namaPemilik || 'Tanpa Nama',
      alamat: rumah.alamat || 'Tidak Ada Alamat',
      koordinat: rumah.koordinat || '0,0',
      latitude: lat,
      longitude: lng,
      suhu: rumah.suhu || 0,
      asap: rumah.asap || 0,
      coGas: rumah.coGas || 0,
      statusKoneksi: rumah.statusKoneksi ?? true,
      kecepatanAnginSektor: anginSektor, // Data dari Axios GET digabungkan ke database Firestore
      updatedAt: new Date().toISOString() // String ISO agar aman dari warning non-serializable di Navigation
    };

    batch.set(docRef, dataToSave);
  }

  // Eksekusi pengiriman batch data ke Cloud Firestore
  await batch.commit();
  console.log('💾 [Firestore Batch] Semua data sensor dan cuaca berhasil disinkronkan ke Firestore!');
};