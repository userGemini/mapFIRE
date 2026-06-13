import axios from 'axios';

// Definisi type parameter payload
export interface RangkumanDarurat {
  idRumah: string;
  namaPemilik: string;
  alamatRumah: string;
  suhu: number;
  asap: number;
  co: number;
  level: 'waspada' | 'bahaya'; // 🌟 Ditambahkan untuk membedakan isi tombol/status
}

export const kirimNotifikasiDaruratTeks = async (payload: RangkumanDarurat): Promise<boolean> => {
  const TELEGRAM_BOT_TOKEN = "8715412067:AAEanRJMmVke_6U3j4ug1cuA0Ct1LDjWHLY";
  const TELEGRAM_CHAT_ID = "-5518925694"; 

  // 🌟 Logika Penyesuaian Pesan Berdasarkan Level Status
  const judulStatus = payload.level === 'bahaya' 
    ? '🚨 PANGGILAN KEDARURATAN MAPFIRE (BAHAYA) 🚨' 
    : '⚠️ PERINGATAN DINI MAPFIRE (WASPADA) ⚠️';

  const tindakanKonklusi = payload.level === 'bahaya'
    ? '🚒 STATUS CRITICAL: Tim armada pemadam dikerahkan penuh secepatnya ke lokasi!'
    : '👮 STATUS WARNING: Petugas patroli sektor dikerahkan untuk cek lokasi!';

  const teksPesan = 
    `${judulStatus}\n\n` +
    `Detail Lokasi:\n` +
    `• Nama Pemilik: ${payload.namaPemilik}\n` +
    `• ID Perangkat: ${payload.idRumah}\n` +
    `• Alamat: ${payload.alamatRumah}\n\n` +
    `Kondisi Sensor Terkini:\n` +
    `• Parameter Suhu: ${payload.suhu} °C\n` +
    `• Densitas Asap: ${payload.asap} %\n` +
    `• Gas CO: ${payload.co} ppm\n\n` +
    `Pesan ini dikirim otomatis via Axios REST API. ${tindakanKonklusi}`;

  try {
    const responseAxios = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: teksPesan
    });

    if (responseAxios.status === 200) {
      console.log(`🚀 [Axios POST] Sukses mengirim notifikasi level [${payload.level}] ke Telegram!`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('❌ [Axios POST] Gagal mengirim pesan ke Telegram:', error.response?.data || error.message);
    return false;
  }
};