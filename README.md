# mapFIRE 🔥

Aplikasi monitoring kebakaran real-time berbasis Expo (React Native) untuk sisi client dan Node.js Server untuk background automation. Menampilkan peta lokasi, data sensor (suhu, asap, CO) secara real-time, autentikasi petugas via Firebase, notifikasi darurat Telegram, dan integrasi cuaca Open-Meteo.

## ✨ Fitur Utama

* **Monitoring Real-time & Peta** : Visualisasi status rumah (Aman/Waspada/Bahaya) pada peta interaktif menggunakan data live dari MQTT (ESP32) yang disinkronkan ke Firebase Realtime Database.
* **Histori 24 Jam & Grafik** : Menampilkan tren fluktuasi 12 data terakhir lewat komponen MiniChart.
* **Otomatisasi Server & Cuaca** : Background service Node.js yang otomatis mengambil data cuaca Open-Meteo dan melakukan batch update ke Cloud Firestore untuk analisis jangka panjang.
* **Notifikasi Telegram Gateway** : Pengiriman pesan darurat otomatis ke grup Telegram petugas via Telegram Bot API saat sensor mendeteksi status Waspada/Bahaya.
* **Manajemen Akses Petugas** : Registrasi dan validasi hak akses petugas pemadam secara terpusat melalui Firebase Auth dan Cloud Firestore.

## 🛠️ Tech Stack & Struktur Ringkas

* **Client:** Expo SDK 54, TypeScript, React Navigation, react-native-maps, Axios.
* **Backend & Cloud:** Node.js, Firebase (Auth, Firestore, Realtime Database), MQTT Protocol.

```text
mapFIRE/
├── server/          # Backend automation service (server.ts)
├── src/
│   ├── components/  # MapViewMap, SensorCard, StatusBadge
│   ├── constants/   # Tema warna & konfigurasi MQTT
│   ├── hooks/       # Custom hooks untuk sub MQTT & Firebase RTDB
│   ├── navigation/  # AppNavigator (Stack Screen)
│   ├── screens/     # Login, Dashboard, Detail, & Notifikasi
│   ├── services/    # Firebase, Auth, MQTT, Firestore, Weather, & Emergency Service
│   └── types/       # Type definitions TypeScript
└── App.tsx          # Root entry point aplikasi

⚙️ Catatan Penting Keamanan
⚠️ PERINGATAN: Kredensial Firebase dan token Telegram Bot saat ini masih tertanam langsung di dalam kode (hardcoded). Sebelum melakukan push ke repositori publik, pindahkan seluruh token sensitif ke variabel lingkungan (.env atau app.config.js) dan daftarkan .env ke dalam file .gitignore.

Dibuat dengan ❤️ untuk keselamatan masyarakat — mapFIRE v1.0