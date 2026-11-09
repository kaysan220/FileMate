# 🛡️ BUKU PANDUAN INTEGRASI TIM BACKEND — FILEMATE (KELOMPOK 6)

Selamat datang Tim Satgas Salah Download! Folder proyek ini sudah disiapkan dengan **Starter Kit Lengkap** agar setiap anggota langsung tahu file mana yang menjadi tanggung jawabnya.

## 📁 Struktur Folder & Penanggung Jawab (PIC)
1. **`page/` & `tampilan/`** — **Muhammad Fardan (Project Leader & Frontend)**
   - Berisi seluruh tampilan UI/UX, Live Static File Inspector, Lab Simulasi, dan 6 Modul Panduan.
   - Saat ini berjalan mandiri menggunakan `localStorage` agar bebas konflik saat demo UI.
2. **`data/`** — **Rohit Al Bukhori (Scenario & Data Handling Developer)**
   - `data/skenario.json` : Bank skenario ancaman (Spoofing, Hash, Fatigue).
   - `data/buat_dummy.py` : Skrip otomatis pembuat 18 file fisik dummy di `data/dummy_files/`.
   - `data/hasil.csv` & `data/feedback_user.csv` : Tempat penyimpanan log Leaderboard & masukan user.
3. **`core/algorithms.py` & `app.py`** — **Kaysan Nawfal (Backend & Logic Developer)**
   - Berisi 5 fungsi utama Algoritma & Pemrograman (`baca_skenario`, `nilai`, `sensor_nama`, `tulis_log`, `tulis_feedback`) dan rute server Flask (`app.py`).
4. **`core/linux_utils.py` & Server Linux** — **Muhamad Yazid Firdaus (Linux & Infrastructure Specialist)**
   - Berisi pemanggilan utilitas asli Linux (`sha256sum`, `file --mime-type`, `ls -l`) dengan pengamanan Anti-Command Injection & Anti-Path Traversal, serta pengaturan `chmod` dan Nginx.
