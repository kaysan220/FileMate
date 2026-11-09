# =====================================================================
# SKRIP PEMBUAT FILE FISIK DUMMY OTOMATIS — TUGAS ROHIT AL BUKHORI
# Jalankan dengan perintah: python data/buat_dummy.py
# Catatan: Semua file ini 100% AMAN (hanya berisi header simulasi beberapa byte
# agar dapat dibaca oleh perintah Linux `file --mime-type`, `sha256sum`, & `ls -l`).
# =====================================================================
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DUMMY_DIR = os.path.join(BASE_DIR, "dummy_files")
SKENARIO_FILE = os.path.join(BASE_DIR, "skenario.json")

os.makedirs(DUMMY_DIR, exist_ok=True)

def generate_safe_dummy_bytes(file_info):
    magic = file_info.get("magicBytes", "")
    real_name = file_info.get("realName", "dummy.txt")
    # Berikan byte header pembuka yang sesuai agar perintah `file` di Linux mengenali tipenya
    if "%PDF" in magic:
        return b"%PDF-1.7\n%Simulasi Dokumen PDF Aman FileMate - " + real_name.encode()
    elif "FF D8 FF" in magic:
        return b"\xff\xd8\xff\xe0\x00\x10JFIF\x00Simulasi Gambar JPEG FileMate"
    elif "89 50 4E 47" in magic:
        return b"\x89PNG\r\n\x1a\nSimulasi Gambar PNG FileMate"
    elif "50 4B 03 04" in magic:
        return b"PK\x03\x04Simulasi Arsip ZIP/Office FileMate - " + real_name.encode()
    elif "#!/bin/sh" in magic:
        return b"#!/bin/sh\n# Simulasi Script Aman untuk Pelatihan FileMate\necho 'Simulasi FileMate'\n"
    elif "4D 5A" in magic:
        return b"MZ\x90\x00Simulasi Header PEExecutable Dummy FileMate (Bukan Malware Asli) - " + real_name.encode()
    else:
        return b"Simulasi File Teks/Script Pelatihan FileMate - " + real_name.encode()

def main():
    with open(SKENARIO_FILE, "r", encoding="utf-8") as f:
        bank = json.load(f)

    count = 0
    for kategori, daftar_skenario in bank.items():
        for sken in daftar_skenario:
            for f_info in sken["files"]:
                fname = f_info["realName"]
                fpath = os.path.join(DUMMY_DIR, fname)
                with open(fpath, "wb") as out:
                    out.write(generate_safe_dummy_bytes(f_info))
                # Jika di Linux dan file ditandai memiliki permission 'x', set permissionnya
                if "x" in f_info.get("perm", ""):
                    try:
                        os.chmod(fpath, 0o755)
                    except Exception:
                        pass
                else:
                    try:
                        os.chmod(fpath, 0o644)
                    except Exception:
                        pass
                count += 1
                print(f"[OK] Berhasil membuat file dummy: {fname}")

    print(f"\nSelesai! Total {count} file fisik dummy berhasil dibuat di folder data/dummy_files/")

if __name__ == "__main__":
    main()
