// src/constants/icons.ts
// Helper untuk semua icon PNG yang digunakan di aplikasi mapFIRE
// Letakkan file-file PNG di folder: assets/icons/
//
// Cara pakai di komponen:
//   import { ICONS } from '../constants/icons';
//   <Image source={ICONS.fire} style={{ width: 24, height: 24 }} />

import { ImageSourcePropType } from 'react-native';

const ICONS: Record<string, ImageSourcePropType> = {
  // ── Branding & Navigation ──────────────────────────────────────
  fire:        require('../../assets/icons/icon_fire.png'),       // 🔥 Logo app (Login + Dashboard topbar)
//   shield:      require('../../assets/icons/icon_shield.png'),     // 🛡️ Header card login
//   building:    require('../../assets/icons/icon_building.png'),   // 🏢 Unit info Dinas Damkar

//   // ── Dashboard ─────────────────────────────────────────────────
//   bell:        require('../../assets/icons/icon_bell.png'),       // 🔔 Tombol notifikasi di header
//   house:       require('../../assets/icons/icon_house.png'),      // 🏠 Panel slide-up rumah

//   // ── Detail Screen ─────────────────────────────────────────────
//   radar:       require('../../assets/icons/icon_radar.png'),      // 📡 Section "Data Sensor Real-time"
//   chart:       require('../../assets/icons/icon_chart.png'),      // 📈 Section "Historis"
//   info:        require('../../assets/icons/icon_info.png'),       // ℹ️  Section "Informasi Perangkat"
//   firetruck:   require('../../assets/icons/icon_firetruck.png'),  // 🚒 Tombol "Kirim Tim Pemadam"
//   worker:      require('../../assets/icons/icon_worker.png'),     // 👷 Tombol "Kirim Petugas Cek"

//   // ── Sensor Icons (SensorCard + NotifikasiScreen) ──────────────
//   thermometer: require('../../assets/icons/icon_thermometer.png'),// 🌡️ Sensor Suhu
//   smoke:       require('../../assets/icons/icon_smoke.png'),      // 💨 Sensor Asap
//   co:          require('../../assets/icons/icon_co.png'),         // ☁️ Sensor CO Gas

//   // ── Status ────────────────────────────────────────────────────
//   check:       require('../../assets/icons/icon_check.png'),      // ✅ Notifikasi kosong
};

export { ICONS };