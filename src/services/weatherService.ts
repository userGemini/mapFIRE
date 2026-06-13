import axios from 'axios';

export interface KondisiCuacaLuar {
  kecepatanAngin: number;
  kelembapan: number;
  suhuLingkungan: number;
}

export const ambilCuacaSektorKebakaran = async (lat: number, lng: number): Promise<KondisiCuacaLuar | null> => {
  try {
    // Memanfaatkan API publik gratis Open-Meteo tanpa perlu API Key
    const urlAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    
    const respon = await axios.get(urlAPI, { timeout: 4000 });

    if (respon.status === 200) {
      const currentData = respon.data.current;
      return {
        suhuLingkungan: currentData.temperature_2m,
        kelembapan: currentData.relative_humidity_2m,
        kecepatanAngin: currentData.wind_speed_10m, // Data ini sangat berguna bagi petugas lapangan
      };
    }
    return null;
  } catch (error: any) {
    console.error("Error Axios GET Cuaca:", error.message);
    return null;
  }
};

