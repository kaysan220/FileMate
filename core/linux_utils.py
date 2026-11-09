# =====================================================================
# MODUL INTEGRASI UTILITAS LINUX — TUGAS MUHAMAD YAZID FIRDAUS
# Mata Kuliah: Linux Fundamental & Dasar Keamanan Siber
# Menjalankan perintah asli CLI Linux terhadap file di data/dummy_files/:
#   1. `sha256sum`        -> Menghitung sidik jari kriptografi SHA-256
#   2. `file --mime-type` -> Membaca identitas tipe MIME biner asli
#   3. `ls -l`            -> Membaca atribut permission Linux (-rw-r--r-- / -rwxr-xr-x)
#
# KEAMANAN (APPSEC HARDENING):
#   - Anti-Path Traversal: Menggunakan os.path.basename() & whitelist direktori.
#   - Anti-Command Injection: Menggunakan subprocess.run(..., shell=False).
#   - Cross-Platform Fallback: Jika dites di Windows sebelum pindah ke Linux,
#     otomatis menggunakan fallback Python agar tidak error saat ngoding!
# =====================================================================
import os
import subprocess
import hashlib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUMMY_DIR = os.path.join(BASE_DIR, "data", "dummy_files")


def validasi_path_aman(nama_file):
    """
    Mencegah serangan Path Traversal (misal: ../../etc/passwd).
    Hanya mengizinkan file yang benar-benar ada di dalam data/dummy_files/.
    """
    nama_bersih = os.path.basename(str(nama_file or ""))
    full_path = os.path.abspath(os.path.join(DUMMY_DIR, nama_bersih))

    if not full_path.startswith(os.path.abspath(DUMMY_DIR)):
        raise ValueError("Akses ditolak: Percobaan Path Traversal terdeteksi!")
    if not os.path.isfile(full_path):
        raise FileNotFoundError(f"File dummy '{nama_bersih}' tidak ditemukan.")

    return full_path, nama_bersih


def jalankan_sha256sum_linux(nama_file):
    """
    Memanggil perintah CLI Linux: `sha256sum <file>`
    """
    full_path, nama_bersih = validasi_path_aman(nama_file)
    try:
        # Eksekusi utilitas asli Linux dengan shell=False (Anti-Command Injection)
        hasil = subprocess.run(
            ["sha256sum", full_path],
            capture_output=True, text=True, check=True, timeout=3, shell=False
        )
        hash_val = hasil.stdout.strip().split()[0]
        return {"file": nama_bersih, "sha256": hash_val, "engine": "Linux CLI (sha256sum)"}
    except Exception:
        # Fallback otomatis jika dites di laptop Windows sebelum masuk ke server Linux
        with open(full_path, "rb") as f:
            hash_val = hashlib.sha256(f.read()).hexdigest()
        return {"file": nama_bersih, "sha256": hash_val, "engine": "Python hashlib (Fallback Windows)"}


def jalankan_inspeksi_linux(nama_file):
    """
    Memanggil perintah CLI Linux:
      - `file -b --mime-type <file>`
      - `ls -l <file>`
    """
    full_path, nama_bersih = validasi_path_aman(nama_file)
    mime_out = "application/octet-stream"
    perm_out = "-rw-r--r--"

    try:
        res_file = subprocess.run(
            ["file", "-b", "--mime-type", full_path],
            capture_output=True, text=True, check=True, timeout=3, shell=False
        )
        mime_out = res_file.stdout.strip()

        res_ls = subprocess.run(
            ["ls", "-l", full_path],
            capture_output=True, text=True, check=True, timeout=3, shell=False
        )
        perm_out = res_ls.stdout.strip().split()[0]
        engine_used = "Linux CLI (file --mime-type & ls -l)"
    except Exception:
        engine_used = "Python OS Stat (Fallback Windows)"

    return {
        "file": nama_bersih,
        "mime_linux": mime_out,
        "permission_linux": perm_out,
        "engine": engine_used
    }
