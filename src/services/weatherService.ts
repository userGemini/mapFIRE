// src/services/weatherService.ts
import axios from 'axios'; // Wajib menggunakan Axios

export interface KondisiCuacaLuar {
  kecepatanAngin: number;
  kelembapan: number;
  suhuLingkungan: number;
}

export const ambilCuacaSektorKebakaran = async (lat: number, lng: number): Promise<KondisiCuacaLuar | null> => {
  // Menggunakan backtick (`) agar tidak terkena error 403 Forbidden
  const urlAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

  try {
    const respon = await axios.get(urlAPI, { timeout: 4000 }); // Menggunakan Axios
    
    if (respon.status === 200 && respon.data.current) {
      const dataCurrent = respon.data.current;
      return {
        suhuLingkungan: dataCurrent.temperature_2m,
        kelembapan: dataCurrent.relative_humidity_2m,
        kecepatanAngin: dataCurrent.wind_speed_10m,
      };
    }
    return null;
  } catch (error) {
    console.error('❌ [Axios GET] Gagal mengambil data cuaca:', error);
    return null;
  }
};