/* =========================================================================
   [PANDUAN MIGRASI BACKEND - TUGAS ROHIT & YAZID]
   - Saat Backend Python dibuat nanti:
     1. Rohit memindahkan objek SCENARIO_BANK di bawah ini ke file `data/skenario.json` di Python.
     2. Yazid mengatur permission file fisik dummy di folder `data/dummy_files/`.
     3. Jangan hapus variabel `SATGAS_TEAM` karena dipakai untuk Pop-up Profil Tim!
   ========================================================================= */

const SATGAS_TEAM = [
    { 
        name: "Muhammad Fardan", 
        instagram: "@bymfn_", 
        role: "Project Leader & UI/UX Designer", 
        badge: "PROJECT LEAD & FRONTEND", 
        specialty: "Arsitektur antarmuka interaktif, alur pengguna, & konsep Dasar Keamanan Siber (DKS)." 
    },
    { 
        name: "Muhamad Yazid Firdaus", 
        instagram: "@zyffa_", 
        role: "Linux & Infrastructure Specialist", 
        badge: "LINUX & NGINX INFRA", 
        specialty: "Konfigurasi server Nginx, manajemen permission file Linux, & utilitas sistem." 
    },
    { 
        name: "Kaysan Nawfal", 
        instagram: "@kaysan_220", 
        role: "Backend & Logic Developer", 
        badge: "PYTHON & SCORING LOGIC", 
        specialty: "Algoritma perhitungan skor risiko, aturan bobot keputusan, & validasi edge-cases." 
    },
    { 
        name: "Rohit Al Bukhori", 
        instagram: "@rht.alb_", 
        role: "Scenario & Data Handling Developer", 
        badge: "THREAT SCENARIO & DATA", 
        specialty: "Perancangan bank skenario ancaman, pengacakan soal, & panduan keamanan dunia nyata." 
    }
];

// === [AWAL ZONA MIGRASI BACKEND 1: PINDAHKAN KE data/skenario.json] ===
const SCENARIO_BANK = {
    SPOOFING: [
        {
            id: "spoof_hrd_01",
            type: "SPOOFING",
            title: "Lampiran Email Mendesak dari HRD Magang",
            story: "Kamu menerima email yang mengaku dari HRD tempat magang, meminta segera menandatangani kontrak kerja dan memeriksa foto denah ruangan. HRD juga menyertakan kode SHA-256 resmi untuk file Kontrak_Magang_2026.pdf. Gunakan X-Ray Inspect dan Cek SHA-256 sebelum mengambil keputusan!",
            path: "~/Downloads/Email_HRD_Magang/",
            hintAuthor: "Muhammad Fardan (Project Leader & DKS)",
            hintText: "Jangan hanya melihat nama akhir file! Periksa baris 'Header / Magic Bytes' dan 'File Permission' di X-Ray Inspect. Cocokkan juga SHA-256 pada dokumen kontrak yang memiliki target hash resmi!",
            goodEnding: "🎬 <strong>Ending Skenario Ini (Keputusan Tepat!):</strong> Kamu berhasil menghapus kedua file jebakan tersebut dan hanya membuka kontrak PDF yang terverifikasi asli. Laptop dan akunmu 100% selamat!",
            badEnding: "🎬 <strong>Ending Skenario Ini (Insiden Terjadi!):</strong><br>• <strong>Detik ke-03:</strong> Program <em>infostealer</em> berjalan diam-diam saat kamu membuka file berbahaya.<br>• <strong>Menit ke-15:</strong> <em>Session cookies</em> browser dan password tersimpanmu dicuri.<br>• <strong>Hari berikutnya:</strong> Akun email kampusmu diambil alih untuk menyebarkan jebakan serupa ke teman sekelas!",
            lessonTitle: "Mengapa Ekstensi Ganda & Manipulasi Header (.jpg) Sangat Berbahaya?",
            lessonBody: "Selain menyembunyikan <code>.exe</code> di belakang <code>.pdf</code>, penyerang juga sering memalsukan ekstensi menjadi <code>.jpg</code> padahal struktur biner di dalamnya (<em>Magic Bytes</em>) adalah program eksekusi atau mengandung <em>script payload</em>.",
            realLifeTip: "Di Windows, centang 'File name extensions' pada tab View. Di Linux, jalankan perintah <code>file --mime-type namafile</code> untuk melihat tipe biner aslinya.",
            files: [
                { id: "sp1_f1", shownName: "Kontrak_Magang_2026.pdf", realName: "Kontrak_Magang_2026.pdf", fakeExt: null, realExt: ".pdf", mime: "application/pdf", magicBytes: "%PDF-1.7 (Valid PDF Header)", payloadStatus: "Bersih (Dokumen PDF Asli)", perm: "-rw-r--r--", size: "412 KB", hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4", expectedHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4", isMalware: false },
                { id: "sp1_f2", shownName: "Kontrak_Magang_2026.pdf ", realName: "Kontrak_Magang_2026.pdf.exe", fakeExt: ".pdf", realExt: ".exe", mime: "application/x-msdownload", magicBytes: "4D 5A / MZ (Program Eksekusi Windows!)", payloadStatus: "Trojan.Win32.InfoStealer", perm: "-rwxr-xr-x", size: "1.9 MB", hash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", expectedHash: null, isMalware: true },
                { id: "sp1_f3", shownName: "Denah_Ruangan_Kantor.jpg", realName: "Denah_Ruangan_Kantor.jpg", fakeExt: null, realExt: ".jpg", mime: "application/x-executable (Mismatch!)", magicBytes: "4D 5A / MZ (Executable menyamar jadi .jpg!)", payloadStatus: "Embedded PowerShell Dropper di EXIF", perm: "-rwxr-xr-x", size: "680 KB", hash: "3c99d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00e99", expectedHash: null, isMalware: true }
            ]
        },
        {
            id: "spoof_ukt_02",
            type: "SPOOFING",
            title: "Pengumuman Keringanan UKT & Bukti Transfer Mendadak",
            story: "Seseorang di grup chat mengirimkan dokumen pengumuman keringanan UKT, form pengajuan, dan foto bukti transfer bank. Portal akademik hanya merilis checksum SHA-256 resmi untuk file Panduan_Resmi_Keringanan_UKT.pdf. Periksa dengan teliti!",
            path: "~/Downloads/Grup_Angkatan/",
            hintAuthor: "Rohit Al Bukhori (Scenario & Threat Analyst)",
            hintText: "Jangan panik oleh batas waktu mendesak! Periksa setiap file dengan X-Ray Inspect untuk memastikan tidak ada script .vbs yang menyamar sebagai dokumen Word.",
            goodEnding: "🎬 <strong>Ending Skenario Ini (Keputusan Tepat!):</strong> Kamu menyadari adanya penyamaran ekstensi <code>.docx.vbs</code> dan segera memperingatkan teman-teman di grup angkatan sehingga tidak ada yang menjadi korban ransomware!",
            badEnding: "🎬 <strong>Ending Skenario Ini (Insiden Terjadi!):</strong><br>• <strong>Detik ke-05:</strong> Script VBS berjalan otomatis dan mengenkripsi seluruh dokumen tugas kuliahmu.<br>• <strong>Menit ke-02:</strong> Layar laptopmu menampilkan pesan tebusan (<em>Ransomware</em>)!",
            lessonTitle: "Kombinasi Rekayasa Sosial (Urgency) & Penyamaran File",
            lessonBody: "Penyerang sengaja menciptakan kepanikan agar korban terburu-buru mengklik file tanpa memeriksa ekstensi aslinya terlebih dahulu.",
            realLifeTip: "Jangan pernah langsung mengeksekusi berkas dari grup chat sebelum memverifikasi properti file tersebut.",
            files: [
                { id: "sp2_f1", shownName: "Panduan_Resmi_Keringanan_UKT.pdf", realName: "Panduan_Resmi_Keringanan_UKT.pdf", fakeExt: null, realExt: ".pdf", mime: "application/pdf", magicBytes: "%PDF-1.5 (Valid PDF Header)", payloadStatus: "Bersih (Dokumen Resmi)", perm: "-rw-r--r--", size: "520 KB", hash: "1a434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327cc2", expectedHash: "1a434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327cc2", isMalware: false },
                { id: "sp2_f2", shownName: "Form_Pengajuan_Beasiswa.docx ", realName: "Form_Pengajuan_Beasiswa.docx.vbs", fakeExt: ".docx", realExt: ".vbs", mime: "text/vbscript", magicBytes: "VBScript Downloader", payloadStatus: "Ransomware.VBS.Locker", perm: "-rwxr-xr-x", size: "28 KB", hash: "5b86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00d41", expectedHash: null, isMalware: true },
                { id: "sp2_f3", shownName: "Foto_Bukti_Transfer_Bank.jpg", realName: "Foto_Bukti_Transfer_Bank.jpg", fakeExt: null, realExt: ".jpg", mime: "image/jpeg", magicBytes: "FF D8 FF E0 (Valid JPEG Image)", payloadStatus: "Bersih (Gambar Asli)", perm: "-rw-r--r--", size: "310 KB", hash: "9d224346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa9", expectedHash: null, isMalware: false }
            ]
        }
    ],
    HASH: [
        {
            id: "hash_forum_01",
            type: "HASH",
            title: "Verifikasi Paket Installer & Modul Runtime dari Forum",
            story: "Kamu mengunduh Patch_Update_v2.zip, Runtime_Pack_v1.msi, dan gambar tutorial dari sebuah forum pihak ketiga. Developer aslinya mencantumkan daftar kode SHA-256 resmi untuk kedua file paket aplikasi di bawah ini. Cocokkan SHA-256 keduanya dan periksa gambar tutorialnya dengan X-Ray Inspect!",
            path: "~/Downloads/Forum_Installer/",
            hintAuthor: "Kaysan Nawfal (Backend & Scoring Logic)",
            hintText: "Klik '#️⃣ Cek SHA-256' pada Patch_Update_v2.zip dan Runtime_Pack_v1.msi lalu klik 'Bandingkan Otomatis'. File yang mengalami Mismatch (merah) wajib dihapus, sedangkan yang 100% Identik (hijau) aman dibuka!",
            goodEnding: "🎬 <strong>Ending Skenario Ini (Keputusan Tepat!):</strong> Berkat pemeriksaan SHA-256, kamu mendeteksi bahwa Patch_Update_v2.zip telah disusupi trojan oleh pengunggah forum, sementara Runtime_Pack_v1.msi dan gambar tutorialnya terbukti murni dan aman!",
            badEnding: "🎬 <strong>Ending Skenario Ini (Insiden Terjadi!):</strong><br>• Kamu mengabaikan ketidakcocokan kode hash pada Patch_Update_v2.zip dan tetap menjalankannya.<br>• Celah <em>Remote Access Trojan (RAT)</em> terbuka di laptopmu sehingga hacker dapat memantau aktivitas sistemmu dari jarak jauh!",
            lessonTitle: "Prinsip Integrity (CIA Triad) Melalui Verifikasi SHA-256",
            lessonBody: "Nama dan ukuran file yang tampak sama tidak menjamin keaslian isinya. Perubahan 1 bit saja akibat penyisipan malware akan mengubah kode SHA-256 secara keseluruhan.",
            realLifeTip: "Selalu jalankan <code>sha256sum</code> di Linux atau <code>Get-FileHash</code> di PowerShell sebelum menginstal software dari internet.",
            files: [
                { id: "hs1_f1", shownName: "Patch_Update_v2.zip", realName: "Patch_Update_v2.zip", fakeExt: null, realExt: ".zip", mime: "application/zip", magicBytes: "50 4B 03 04 (ZIP Archive)", payloadStatus: "Hash Mismatch! (Isi arsip telah dimodifikasi pihak ketiga)", perm: "-rw-r--r--", size: "14.2 MB", hash: "e3b0c44298fc1c149afbf4c8996fb92499999999649b934ca495991b7852b855", expectedHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", isMalware: true },
                { id: "hs1_f2", shownName: "Runtime_Pack_v1.msi", realName: "Runtime_Pack_v1.msi", fakeExt: null, realExt: ".msi", mime: "application/x-msi", magicBytes: "D0 CF 11 E0 (Valid MSI Package)", payloadStatus: "Bersih (Checksum SHA-256 100% Sesuai Developer)", perm: "-rw-r--r--", size: "8.4 MB", hash: "7c434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327ff1", expectedHash: "7c434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327ff1", isMalware: false },
                { id: "hs1_f3", shownName: "Screenshot_Cara_Install.png", realName: "Screenshot_Cara_Install.png", fakeExt: null, realExt: ".png", mime: "image/png", magicBytes: "89 50 4E 47 (Valid PNG Image)", payloadStatus: "Bersih (Gambar Tutorial Aman)", perm: "-rw-r--r--", size: "450 KB", hash: "4a434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327bb8", expectedHash: null, isMalware: false }
            ]
        }
    ],
    FATIGUE: [
        {
            id: "fatigue_usb_01",
            type: "FATIGUE",
            title: "Uji Ketelitian Ekstrem: Flashdisk Teman yang Terinfeksi (10 File)",
            story: "Teman sekelompokmu memberikan 10 file bahan laporan dari flashdisk yang habis dipakai di warnet. Terdapat 5 file aman dan 5 file berbahaya (termasuk ekstensi ganda, file .jpg ber-payload, dan skrip yang telah dimodifikasi). Gunakan X-Ray Inspect dan Cek SHA-256!",
            path: "/media/usb_flashdisk/Bahan_Laporan_PBL/",
            hintAuthor: "Muhamad Yazid Firdaus (Linux & Infrastructure)",
            hintText: "Jangan lengah saat memeriksa 10 file! Cek dengan X-Ray Inspect dan cocokkan SHA-256 untuk file yang ada di daftar checksum resmi. Waspadai file berizin eksekusi (-rwxr-xr-x) atau file .jpg ber-header MZ!",
            goodEnding: "🎬 <strong>Ending Skenario Ini (Keputusan Tepat!):</strong> Luar biasa! Meski dihadapkan pada 10 file sekaligus, kamu tidak mengalami <em>Awareness Fatigue</em>. Kelima dokumen asli berhasil diselamatkan untuk laporan kelompok, dan kelima malware berhasil dihapus!",
            badEnding: "🎬 <strong>Ending Skenario Ini (Insiden Terjadi!):</strong><br>• Karena terburu-buru memeriksa banyak file, kamu meloloskan file berbahaya di tengah tumpukan dokumen.<br>• Malware langsung menginfeksi partisi disk dan menyebar ke seluruh folder tugas kuliahmu!",
            lessonTitle: "Mengatasi Awareness Fatigue (Kelelahan Kewaspadaan)",
            lessonBody: "Penyerang mengandalkan kelelahan manusia saat memeriksa puluhan file sekaligus, berharap korban menjadi ceroboh pada file urutan tengah hingga akhir.",
            realLifeTip: "Gunakan perintah <code>find . -type f -executable</code> di Linux untuk langsung menemukan file mana saja di dalam folder yang diam-diam memiliki izin eksekusi berbahaya.",
            files: [
                { id: "ft1", shownName: "Draft_Laporan_Kelompok.pdf", realName: "Draft_Laporan_Kelompok.pdf", fakeExt: null, realExt: ".pdf", mime: "application/pdf", magicBytes: "%PDF-1.7 (Valid PDF)", payloadStatus: "Bersih", perm: "-rw-r--r--", size: "1.2 MB", hash: "a1b2c3d4e5f601928374655647382910abcdef1234567890abcdef1234567890", expectedHash: null, isMalware: false },
                { id: "ft2", shownName: "Data_Kuisioner_User.xlsx", realName: "Data_Kuisioner_User.xlsx.vbs", fakeExt: ".xlsx", realExt: ".vbs", mime: "text/vbscript", magicBytes: "VBScript Engine", payloadStatus: "Worm.VBS.Autorun", perm: "-rwxr-xr-x", size: "14 KB", hash: "f9e8d7c6b5a432109876543210fedcba0987654321fedcba0987654321fedcba", expectedHash: null, isMalware: true },
                { id: "ft3", shownName: "Slide_Presentasi_Kelompok6.pptx", realName: "Slide_Presentasi_Kelompok6.pptx", fakeExt: null, realExt: ".pptx", mime: "application/vnd.ms-powerpoint", magicBytes: "50 4B 03 04 (Office Open XML)", payloadStatus: "Bersih", perm: "-rw-r--r--", size: "4.1 MB", hash: "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff", expectedHash: null, isMalware: false },
                { id: "ft4", shownName: "Poster_Kegiatan_Kampus.jpg", realName: "Poster_Kegiatan_Kampus.jpg", fakeExt: null, realExt: ".jpg", mime: "application/x-msdownload (Mismatch!)", magicBytes: "4D 5A / MZ (Executable berkedok .jpg!)", payloadStatus: "Stego-Malware Loader", perm: "-rwxr-xr-x", size: "890 KB", hash: "99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa", expectedHash: null, isMalware: true },
                { id: "ft5", shownName: "Catatan_Rapat_Minggu5.txt", realName: "Catatan_Rapat_Minggu5.txt", fakeExt: null, realExt: ".txt", mime: "text/plain", magicBytes: "ASCII Text", payloadStatus: "Bersih", perm: "-rw-r--r--", size: "4 KB", hash: "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789", expectedHash: null, isMalware: false },
                { id: "ft6", shownName: "Cleanup_Cache_Otomatis", realName: "Cleanup_Cache_Otomatis.bat", fakeExt: null, realExt: ".bat", mime: "application/x-bat", magicBytes: "DOS Batch Script", payloadStatus: "Malicious System Deleter", perm: "-rwxr-xr-x", size: "9 KB", hash: "77777777888888889999999900000000aaaaaaaabbbbbbbbccccccccdddddddd", expectedHash: null, isMalware: true },
                { id: "ft7", shownName: "Modul_Praktikum_Linux.pdf", realName: "Modul_Praktikum_Linux.pdf", fakeExt: null, realExt: ".pdf", mime: "application/pdf", magicBytes: "%PDF-1.6 (Valid PDF)", payloadStatus: "Bersih (Sesuai Checksum Dosen)", perm: "-rw-r--r--", size: "3.1 MB", hash: "1231231231231231231231231231231231231231231231231231231231231231", expectedHash: "1231231231231231231231231231231231231231231231231231231231231231", isMalware: false },
                { id: "ft8", shownName: "Foto_Dokumentasi_Tim.png", realName: "Foto_Dokumentasi_Tim.png", fakeExt: null, realExt: ".png", mime: "image/png", magicBytes: "89 50 4E 47 (Valid PNG)", payloadStatus: "Bersih", perm: "-rw-r--r--", size: "1.5 MB", hash: "4564564564564564564564564564564564564564564564564564564564564564", expectedHash: null, isMalware: false },
                { id: "ft9", shownName: "Update_Dependency_Server", realName: "Update_Dependency_Server.sh", fakeExt: null, realExt: ".sh", mime: "application/x-sh", magicBytes: "#!/bin/sh", payloadStatus: "Cryptominer Dropper Script (Hash Mismatch!)", perm: "-rwxr-xr-x", size: "19 KB", hash: "7897897897897897897897897897897897897897897897897897897897897897", expectedHash: "7897897897897897897897897897897800000000000000007897897897897897", isMalware: true },
                { id: "ft10", shownName: "Invoice_Sewa_Hosting.pdf ", realName: "Invoice_Sewa_Hosting.pdf.exe", fakeExt: ".pdf", realExt: ".exe", mime: "application/x-msdownload", magicBytes: "4D 5A / MZ (PE32 Executable)", payloadStatus: "Trojan.Win32.Banker", perm: "-rwxr-xr-x", size: "2.1 MB", hash: "000111222333444555666777888999aaabbbcccdddeeefff0001112223334445", expectedHash: null, isMalware: true }
            ]
        }
    ]
};
// === [AKHIR ZONA MIGRASI BACKEND 1] ===