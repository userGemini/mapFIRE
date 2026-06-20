// src/services/emergencyService.ts
import axios from 'axios';

// 🌟 Tambahkan interface untuk tipe data cuaca luar dari Open-Meteo
export interface KondisiCuacaLuar {
  suhuLingkungan: number;
  kelembapan: number;
  kecepatanAngin: number; //
}

// Definisi type parameter payload
export interface RangkumanDarurat {
  idRumah: string;
  namaPemilik: string;
  alamatRumah: string;
  suhu: number;
  asap: number;
  co: number;
  level: 'waspada' | 'bahaya'; // 🌟 Membedakan isi tombol/status
  cuacaLuar?: KondisiCuacaLuar | null; // 🌟 Tambahkan properti opsional untuk membawa data cuaca
}

export const kirimNotifikasiDaruratTeks = async (payload: RangkumanDarurat): Promise<boolean> => {
  const TELEGRAM_BOT_TOKEN = "8715412067:AAEanRJMmVke_6U3j4ug1cuA0Ct1LDjWHLY";
  const TELEGRAM_CHAT_ID = "-5518925694"; 

  const waktuLog = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  // 🌟 Membuat teks cuaca jika datanya berhasil dilemparkan dari DetailScreen
  let teksCuaca = '';
  if (payload.cuacaLuar) {
    teksCuaca = 
`*☁️ [DATA KONDISI CUACA OUTDOOR]*
\`\`\`
Suhu Udara Luar: ${payload.cuacaLuar.suhuLingkungan} °C
Kelembapan     : ${payload.cuacaLuar.kelembapan} %
Kecepatan Angin: ${payload.cuacaLuar.kecepatanAngin} km/h
\`\`\`
_Rekomendasi Taktis: Perhatikan arah embusan angin luar untuk mengantisipasi laju persebaran asap._
---------------------------------------------`;
  } else {
    teksCuaca = 
`*☁️ [DATA KONDISI CUACA OUTDOOR]*
\`\`\`
Data cuaca lingkungan gagal terintegrasi.
\`\`\`
---------------------------------------------`;
  }

  // 🌟 Logika Penyesuaian Pesan Berdasarkan Level Status
  let teksPesan = '';

  if (payload.level === 'bahaya') {
    teksPesan = 
`🚨 *[EMERGENCY CALL] PANGGILAN KEDARURATAN MAPFIRE* 🚨
---------------------------------------------
*Status Sektor* : CRITICAL (BAHAYA)
*Waktu Log* : ${waktuLog}

*📍 [DETAIL LOKASI]*
• ID Perangkat : \`${payload.idRumah}\`
• Nama Pemilik : *${payload.namaPemilik}*
• Alamat       : *${payload.alamatRumah}*

*📊 [DATA TELEMETRI SENSOR]*
\`\`\`
Suhu Udara   : ${payload.suhu} °C
Densitas Asap: ${payload.asap} %
Kadar Gas CO : ${payload.co} ppm
\`\`\`
---------------------------------------------
${teksCuaca}
*KETERANGAN:*
⚠️ *PERINGATAN KRITIKAL!* Indikasi kebakaran terdeteksi kuat oleh sistem otomatis. Armada pemadam kebakaran sektor terkait segera dikerahkan penuh secepatnya menuju titik lokasi!

_Pesan otomatis dialirkan via mapFIRE REST API Gateway._`;
  } else {
    teksPesan = 
`⚠️ *[SYSTEM ALERT] PERINGATAN DINI MAPFIRE* ⚠️
---------------------------------------------
*Status Sektor* : WARNING (WASPADA)
*Waktu Log* : ${waktuLog}

*📍 [DETAIL LOKASI]*
• ID Perangkat : \`${payload.idRumah}\`
• Nama Pemilik : *${payload.namaPemilik}*
• Alamat       : *${payload.alamatRumah}*

*📊 [DATA TELEMETRI SENSOR]*
\`\`\`
Suhu Udara   : ${payload.suhu} °C
Densitas Asap: ${payload.asap} %
Kadar Gas CO : ${payload.co} ppm
\`\`\`
---------------------------------------------
${teksCuaca}
*KETERANGAN:*
Sistem mendeteksi lonjakan parameter di atas ambang batas normal. Petugas patroli sektor telah diinstruksikan untuk melakukan validasi visual ke lokasi check point.

_Pesan otomatis dialirkan via mapFIRE REST API Gateway._`;
  }

  try {
    const responseAxios = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: teksPesan,
      parse_mode: 'Markdown' // 🌟 WAJIB ditambah agar format bold (*) dan code block (```) aktif di Telegram
    });

    if (responseAxios.status === 200) {
      console.log(`🚀 [Axios POST] Sukses mengirim notifikasi level [${payload.level}] dengan data cuaca ke Telegram!`);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('❌ [Axios POST] Gagal mengirim pesan ke Telegram:', error.response?.data || error.message);
    return false;
  }
};