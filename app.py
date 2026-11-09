# =====================================================================
# SERVER UTAMA PYTHON FLASK — FILEMATE (SAFE DOWNLOAD ADVISOR)
# Tim Satgas Salah Download (Kelompok 6 RKS Polibatam)
# Cara menjalankan:
#   1. pip install flask
#   2. python app.py
#   3. Buka browser di http://127.0.0.1:5000
# =====================================================================
import os
from flask import Flask, jsonify, request, send_from_directory, redirect
from core.algorithms import (
    baca_skenario, nilai, tulis_log, baca_leaderboard, tulis_feedback
)
from core.linux_utils import jalankan_sha256sum_linux, jalankan_inspeksi_linux

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__)


# Header Keamanan HTTP (AppSec Hardening)
@app.after_request
def tambah_security_headers(response):
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Rute Halaman Statis Frontend (page/ dan tampilan/)
@app.route("/")
def root_index():
    return redirect("/page/index.html")


@app.route("/page/<path:filename>")
def serve_pages(filename):
    return send_from_directory(os.path.join(BASE_DIR, "page"), filename)


@app.route("/tampilan/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(BASE_DIR, "tampilan"), filename)


# =====================================================================
# ENDPOINT API BACKEND (UNTUK KONEKSI FETCH DARI FRONTEND)
# =====================================================================

@app.route("/api/start-session", methods=["GET"])
def api_start_session():
    """Mengambil 3 skenario acak dari data/skenario.json (Tugas Rohit)."""
    return jsonify(baca_skenario())


@app.route("/api/leaderboard", methods=["GET"])
def api_get_leaderboard():
    """Membaca daftar peringkat dari data/hasil.csv (Tugas Kaysan & Yazid)."""
    return jsonify(baca_leaderboard(limit=6))


@app.route("/api/inspect", methods=["GET"])
def api_inspect_file():
    """Menjalankan utilitas Linux `file --mime-type` dan `ls -l` (Tugas Yazid)."""
    nama_file = request.args.get("file", "")
    try:
        hasil = jalankan_inspeksi_linux(nama_file)
        return jsonify({"status": "ok", "data": hasil})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/hash", methods=["GET"])
def api_hash_file():
    """Menjalankan utilitas Linux `sha256sum` (Tugas Yazid)."""
    nama_file = request.args.get("file", "")
    try:
        hasil = jalankan_sha256sum_linux(nama_file)
        return jsonify({"status": "ok", "data": hasil})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/submit-score", methods=["POST"])
def api_submit_score():
    """Menyimpan skor ke data/hasil.csv dengan nama disensor (Tugas Kaysan)."""
    body = request.get_json(silent=True) or {}
    nama_raw = body.get("username", "Anonim")
    waktu_str = body.get("time", "01:00")

    if "malware_opened" in body:
        skor_akhir, kategori = nilai(
            body.get("malware_opened", 0),
            body.get("false_alarm", 0),
            body.get("hints_used", 0)
        )
    else:
        skor_akhir = int(body.get("score", 100))
        kategori = "TINGGI" if skor_akhir <= 50 else ("SEDANG" if skor_akhir <= 80 else "RENDAH")

    nama_tersensor = tulis_log(nama_raw, skor_akhir, waktu_str, kategori)
    return jsonify({
        "status": "ok",
        "masked_name": nama_tersensor,
        "score": skor_akhir,
        "risk_category": kategori
    })


@app.route("/api/submit-feedback", methods=["POST"])
def api_submit_feedback():
    """Menyimpan saran responden ke data/feedback_user.csv (Tugas Kaysan & Yazid)."""
    body = request.get_json(silent=True) or {}
    inisial = body.get("user", "A****M")
    skor = body.get("score", 100)
    pesan = body.get("message", "")
    berhasil = tulis_feedback(inisial, skor, pesan)
    return jsonify({"status": "ok", "saved": berhasil})


if __name__ == "__main__":
    print("====================================================")
    print(" 🛡️ Server FileMate Aktif di http://127.0.0.1:5000 ")
    print("====================================================")
    app.run(host="127.0.0.1", port=5000, debug=False)
