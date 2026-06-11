1. KUNCI IDENTITAS
   Sebelum commit, pastikan Git di VS Code kamu sudah terkunci pakai nama akun GitHub-mu sendiri. 
   Jalankan perintah ini di terminal:
   
   git config --global user.name "NAMA_AKUN_GITHUBMU"
   git config --global user.email "EMAIL_GITHUBMU"

2. JANGAN PERNAH PAKAI '--force' SAAT PUSH
   Gunakan push normal saja:
   
   git push origin main
   
   *Catatan: Penggunaan '--force' dilarang keras karena bisa menghapus riwayat commit lama milik anggota kelompok lain secara permanen dari server!

3. CARA AMAN UPDATE KODINGAN (BIAR GAK TABRAKAN)
   Sebelum kamu mulai ngoding fitur baru, biasakan tarik dulu kode terbaru yang ada di GitHub biar sinkron:
   
   git pull origin main

4. FORMAT PESAN COMMIT
   Biar kita tahu file apa saja yang diubah, tolong tulis pesan commit yang jelas.
   Contoh:
   git commit -m "Fix: Memperbaiki eror mqtt di Screen Dashboard"
   git commit -m "Update: Menambahkan marker baru di MapViewMap.tsx"

==================CHAT==============================
userGEMINI : ojo diangger commit rek, file ku ono sg ilang huhuhuu
