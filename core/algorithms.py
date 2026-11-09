# =====================================================================
# MODUL ALGORITMA & LOGIKA PENILAIAN — TUGAS KAYSAN NAWFAL & ROHIT
# Mata Kuliah: Algoritma & Pemrograman + Dasar Keamanan Siber
# Berisi 5 Fungsi Modular Utama sesuai panduan Mini PBL:
#   1. baca_skenario()      -> Membaca & mengacak 3 skenario dari skenario.json
#   2. nilai()              -> Menghitung skor akhir & klasifikasi kategori risiko
#   3. sensor_nama()        -> Pseudonimisasi nama user (R****T) & Sanitasi Anti-XSS
#   4. tulis_log()          -> Menyimpan skor ke hasil.csv (Anti-CSV Injection)
#   5. tulis_feedback()     -> Menyimpan masukan responden ke feedback_user.csv
# =====================================================================
import os
import json
import csv
import random
import re
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKENARIO_PATH = os.path.join(BASE_DIR, "data", "skenario.json")
HASIL_CSV_PATH = os.path.join(BASE_DIR, "data", "hasil.csv")
FEEDBACK_CSV_PATH = os.path.join(BASE_DIR, "data", "feedback_user.csv")


# 1. FUNGSI MEMBACA & MENGACAK SKENARIO (TUGAS ROHIT & KAYSAN)
def baca_skenario():
    """
    Membaca bank skenario dari data/skenario.json, memilih 1 soal acak
    dari masing-masing kategori (SPOOFING, HASH, FATIGUE), lalu mengacak
    urutan kemunculan soal dan urutan file di dalamnya.
    """
    with open(SKENARIO_PATH, "r", encoding="utf-8") as f:
        bank = json.load(f)

    terpilih = [
        random.choice(bank["SPOOFING"]),
        random.choice(bank["HASH"]),
        random.choice(bank["FATIGUE"])
    ]
    random.shuffle(terpilih)

    sesi_skenario = {}
    for idx, sken in enumerate(terpilih, start=1):
        kopi_sken = dict(sken)
        kopi_files = list(kopi_sken["files"])
        random.shuffle(kopi_files)
        kopi_sken["files"] = kopi_files
        sesi_skenario[str(idx)] = kopi_sken

    return sesi_skenario


# 2. FUNGSI PERHITUNGAN SKOR & KLASIFIKASI RISIKO (TUGAS KAYSAN)
def nilai(jumlah_malware_dibuka, jumlah_salah_hapus, jumlah_hint):
    """
    Menghitung skor akhir dari nilai awal 100 dengan bobot penalti:
      - Membuka file berbahaya (malware): -15 poin
      - Menghapus file aman (false alarm): -5 poin
      - Menggunakan bantuan (Hint): -5 poin
    Edge-case: Skor tidak boleh kurang dari 0 (max(0, skor)).
    Klasifikasi Kategori Risiko:
      - Skor <= 50  : TINGGI
      - Skor 51-80  : SEDANG
      - Skor > 80   : RENDAH
    """
    skor_awal = 100
    penalti = (int(jumlah_malware_dibuka) * 15) + (int(jumlah_salah_hapus) * 5) + (int(jumlah_hint) * 5)
    skor_akhir = max(0, skor_awal - penalti)

    if skor_akhir <= 50:
        kategori = "TINGGI"
    elif skor_akhir <= 80:
        kategori = "SEDANG"
    else:
        kategori = "RENDAH"

    return skor_akhir, kategori


# 3. FUNGSI SANITASI & PSEUDONIMISASI NAMA (KEAMANAN & PRIVASI DATA)
def sensor_nama(nama_input):
    """
    Membersihkan input nama dari karakter berbahaya (< > " ' & = + - @)
    dan menyensor nama menjadi huruf awal & akhir saja (contoh: Rohit -> R****T).
    Jika kosong (edge-case), otomatis menjadi A****M (Anonim).
    """
    bersih = re.sub(r'[<>"\'&=+\-@]', '', str(nama_input or '')).strip()
    if not bersih:
        bersih = "Anonim"
    bersih = bersih[:20]  # Batasi maksimal 20 karakter

    if len(bersih) > 1:
        return f"{bersih[0].upper()}****{bersih[-1].upper()}"
    return f"{bersih.upper()}****"


def sanitasi_teks_csv(teks, max_len=300):
    """
    Mencegah XSS dan CSV Formula Injection saat disimpan ke file .csv.
    """
    bersih = re.sub(r'[<>]', '', str(teks or '')).strip()[:max_len]
    if bersih and bersih[0] in ('=', '+', '-', '@'):
        bersih = "'" + bersih
    return bersih


# 4. FUNGSI PENCATATAN LOG LEADERBOARD KE hasil.csv (TUGAS KAYSAN & YAZID)
def tulis_log(nama_input, skor, waktu_str, kategori_risiko):
    """
    Menyimpan baris baru ke data/hasil.csv secara aman.
    """
    nama_aman = sensor_nama(nama_input)
    skor_aman = max(0, min(100, int(skor)))
    waktu_aman = sanitasi_teks_csv(waktu_str, max_len=10)
    kategori_aman = kategori_risiko if kategori_risiko in ("TINGGI", "SEDANG", "RENDAH") else "RENDAH"

    file_exists = os.path.exists(HASIL_CSV_PATH)
    with open(HASIL_CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["nama_anonim", "skor", "waktu", "kategori_risiko"])
        writer.writerow([nama_aman, skor_aman, waktu_aman, kategori_aman])

    return nama_aman


def baca_leaderboard(limit=6):
    """
    Membaca isi data/hasil.csv, mengurutkan dari skor tertinggi, dan mengembalikan daftar Top N.
    """
    if not os.path.exists(HASIL_CSV_PATH):
        return []

    rows = []
    with open(HASIL_CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            try:
                rows.append({
                    "name": r["nama_anonim"],
                    "score": int(r["skor"]),
                    "time": r["waktu"],
                    "risk": r["kategori_risiko"]
                })
            except Exception:
                continue

    rows.sort(key=lambda x: (-x["score"], x["time"]))
    return rows[:limit]


# 5. FUNGSI PENCATATAN FEEDBACK RESPONDEN KE feedback_user.csv
def tulis_feedback(inisial_user, skor, pesan_saran):
    """
    Menyimpan masukan/saran pengguna ke data/feedback_user.csv untuk dokumentasi User Testing.
    """
    pesan_aman = sanitasi_teks_csv(pesan_saran, max_len=300)
    if not pesan_aman:
        return False

    urutan = 1
    if os.path.exists(FEEDBACK_CSV_PATH):
        with open(FEEDBACK_CSV_PATH, "r", encoding="utf-8") as f:
            urutan = max(1, sum(1 for _ in f))

    kode_resp = f"P{urutan:02d}"
    waktu_skrg = datetime.now().strftime("%d/%m/%Y %H.%M")

    file_exists = os.path.exists(FEEDBACK_CSV_PATH)
    with open(FEEDBACK_CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["kode_responden", "inisial_anonim", "skor", "waktu_input", "saran_dan_masukan"])
        writer.writerow([kode_resp, sanitasi_teks_csv(inisial_user, 10), int(skor), waktu_skrg, pesan_aman])

    return True
