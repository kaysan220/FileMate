/* =========================================================
   FILEMATE MAIN.JS — Engine UI/UX, VirusTotal Lookup, & Sandbox
   ========================================================= */

function escapeHTML(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 1. TEMA DARK / LIGHT MODE
function initTheme() {
    const saved = localStorage.getItem('filemate_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = saved === 'dark' ? '☀️ Light' : '🌙 Dark';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('filemate_theme', next);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderHomeLeaderboard();
    initSandboxSession();
    initSecretMaintainerTrigger();
});

// Toast Notification Minimalis
let toastTimer = null;
function showToastNotification(htmlMessage) {
    let toast = document.getElementById('filemateToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'filemateToast';
        toast.className = 'toast-notify';
        document.body.appendChild(toast);
    }
    toast.innerHTML = htmlMessage;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function copyGuideCommand(cmdText, targetFileExample) {
    navigator.clipboard.writeText(cmdText);
    if (targetFileExample) {
        showToastNotification(`
            <strong style="color: var(--accent); display: block; margin-bottom: 2px;">Perintah disalin ke clipboard</strong>
            <span style="color: var(--text-secondary);">Ganti argumen <code class="mono" style="color: var(--text-primary);">${escapeHTML(targetFileExample)}</code> dengan nama file asli yang ingin kamu periksa.</span>
        `);
    } else {
        showToastNotification(`
            <strong style="color: var(--accent); display: block; margin-bottom: 2px;">Perintah disalin ke clipboard</strong>
            <span style="color: var(--text-secondary);">Siap dijalankan pada terminal di direktori target.</span>
        `);
    }
}

// 2. MODAL PROFIL TIM PENGEMBANG
function openTeamCredits() {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop || typeof SATGAS_TEAM === 'undefined') return;

    document.getElementById('modalTitle').innerHTML = `🛡️ Profil Tim Pengembang — Satgas Salah Download`;
    let cardsHtml = '';
    SATGAS_TEAM.forEach(m => {
        const cleanIg = (m.instagram || '').replace('@', '');
        cardsHtml += `
            <div class="member-card">
                <span class="role-badge">${escapeHTML(m.badge)}</span>
                <strong style="display: block; font-size: 0.96rem;">${escapeHTML(m.name)}</strong>
                <a href="https://instagram.com/${encodeURIComponent(cleanIg)}" target="_blank" rel="noopener noreferrer" class="mono" style="font-size: 0.78rem; color: var(--accent); text-decoration: none; display: inline-block; margin-top: 2px;">
                    Instagram: ${escapeHTML(m.instagram)} &nearr;
                </a>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px;">${escapeHTML(m.specialty)}</p>
            </div>
        `;
    });

    document.getElementById('modalContent').innerHTML = `
        <p style="font-size: 0.88rem; color: var(--text-secondary);">
            Aplikasi <strong>FileMate (Safe Download Advisor)</strong> dirancang oleh <strong>Kelompok 6</strong> sebagai Mini PBL Program Studi Rekayasa Keamanan Siber Politeknik Negeri Batam.
        </p>
        <div class="team-grid">${cardsHtml}</div>
    `;
    backdrop.classList.add('open');
}

function closeModal() {
    const backdrop = document.getElementById('modalBackdrop');
    if (backdrop) backdrop.classList.remove('open');
}

// 3. RENDER LEADERBOARD BERANDA (index.html)
function renderHomeLeaderboard() {
    const container = document.getElementById('homeLeaderboardList');
    if (!container) return;

    // === [AWAL ZONA MIGRASI BACKEND 2 - TUGAS KAYSAN & YAZID] ===
    const defaultLb = [
        { name: "R****T", score: 95, time: "01:12", risk: "RENDAH" },
        { name: "F****N", score: 90, time: "01:28", risk: "RENDAH" },
        { name: "K****N", score: 85, time: "01:45", risk: "RENDAH" },
        { name: "Y****D", score: 75, time: "02:05", risk: "SEDANG" }
    ];
    const lb = JSON.parse(localStorage.getItem('filemate_leaderboard') || JSON.stringify(defaultLb));
    // === [AKHIR ZONA MIGRASI BACKEND 2] ===

    container.innerHTML = '';
    lb.slice(0, 6).forEach((item, idx) => {
        const safeScore = Number(item.score) || 0;
        const scoreColor = safeScore > 80 ? 'var(--safe)' : (safeScore > 50 ? 'var(--warning)' : 'var(--danger)');
        container.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-subtle); border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.88rem;">
                <div>
                    <strong style="color: var(--accent); margin-right: 8px;">#${idx + 1}</strong>
                    <strong class="mono">${escapeHTML(item.name)}</strong>
                </div>
                <div>
                    <strong style="color: ${scoreColor};">${safeScore} Pts</strong>
                    <small class="mono" style="color: var(--text-muted); margin-left: 6px;">(${escapeHTML(item.time)})</small>
                </div>
            </div>
        `;
    });
}

// =========================================================
// AKSES RAHASIA TIM SATGAS (MURNI CTRL + SHIFT + L)
// PIN Rahasia Tim: katakbijer
// Menampilkan 3 Tombol Terpisah:
//   1. Reset Leaderboard
//   2. Reset Masukan
//   3. Unduh CSV Feedback
// =========================================================
function initSecretMaintainerTrigger() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
            e.preventDefault();
            promptMaintainerAccess();
        }
    });
}

function promptMaintainerAccess() {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop) return;

    document.getElementById('modalTitle').innerHTML = `🔒 Akses Maintainer Tim Satgas`;
    document.getElementById('modalContent').innerHTML = `
        <p style="font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 12px;">
            Masukkan PIN Maintainer untuk melihat rekapitulasi masukan pengguna dan manajemen data demo.
        </p>
        <div>
            <input type="password" id="maintainerPinField" class="pin-input-clean" placeholder="Masukkan PIN Maintainer..." autocomplete="off" onkeydown="if(event.key==='Enter') verifyMaintainerPin()" style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-subtle); color: var(--text-primary);">
            <div id="pinErrorMsg" style="color: var(--danger); font-size: 0.78rem; margin-top: 6px; min-height: 18px; font-weight: 500;"></div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
            <button class="btn btn-ghost btn-sm" onclick="closeModal()">Batal</button>
            <button class="btn btn-primary btn-sm" onclick="verifyMaintainerPin()">Verifikasi</button>
        </div>
    `;
    backdrop.classList.add('open');
    setTimeout(() => {
        const input = document.getElementById('maintainerPinField');
        if (input) input.focus();
    }, 60);
}

function verifyMaintainerPin() {
    const input = document.getElementById('maintainerPinField');
    const err = document.getElementById('pinErrorMsg');
    const card = document.getElementById('modalCard');
    if (!input) return;

    if (input.value === "katakbijer") {
        openFeedbackViewer();
    } else {
        if (err) err.textContent = "PIN tidak sesuai. Akses ditolak.";
        if (card) {
            card.classList.remove('shake-error');
            void card.offsetWidth;
            card.classList.add('shake-error');
        }
        input.value = '';
        input.focus();
    }
}

function openFeedbackViewer() {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop) return;

    const feedbacks = JSON.parse(localStorage.getItem('filemate_feedbacks') || '[]');
    document.getElementById('modalTitle').innerHTML = `🛠️ Menu Satgas — Rekap Masukan (${feedbacks.length})`;

    let listHtml = '';
    if (feedbacks.length === 0) {
        listHtml = `<p style="font-size: 0.88rem; color: var(--text-muted); padding: 12px 0;">Belum ada saran/masukan dari pengguna.</p>`;
    } else {
        feedbacks.forEach((fb, i) => {
            listHtml += `
                <div style="padding: 10px 12px; background: var(--bg-subtle); border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 8px; font-size: 0.85rem;">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px; color: var(--text-muted); font-size: 0.76rem; margin-bottom: 4px;">
                        <span>Responden #${i + 1} (<strong class="mono" style="color: var(--accent);">${escapeHTML(fb.user)}</strong> • Skor: ${Number(fb.score) || 0})</span>
                        <span>${escapeHTML(fb.date)}</span>
                    </div>
                    <div style="color: var(--text-primary); word-break: break-word;">"${escapeHTML(fb.message)}"</div>
                </div>
            `;
        });
    }

    // Tampilkan 3 Tombol Terpisah Secara Permanen
    document.getElementById('modalContent').innerHTML = `
        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 12px;">
            Saat Backend Python aktif, seluruh data ini disimpan langsung di server Linux (<code>chmod 600 data/feedback_user.csv</code>).
        </p>
        <div style="max-height: 240px; overflow-y: auto; margin-bottom: 14px; padding-right: 4px;">
            ${listHtml}
        </div>
        <div class="maintainer-footer-actions" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding-top: 14px; border-top: 1px solid var(--border-color);">
            <div class="maintainer-reset-group" style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="btn btn-danger btn-sm" onclick="confirmResetLeaderboardOnly()">🗑️ Reset Leaderboard</button>
                <button type="button" class="btn btn-danger btn-sm" onclick="confirmResetFeedbackOnly()">🗑️ Reset Masukan</button>
            </div>
            <button type="button" class="btn btn-primary btn-sm" onclick="exportFeedbackCSV()">📥 Unduh CSV Feedback</button>
        </div>
    `;
    backdrop.classList.add('open');
}

// Tombol 1: Konfirmasi & Eksekusi Reset Leaderboard Saja
function confirmResetLeaderboardOnly() {
    document.getElementById('modalTitle').innerHTML = `⚠️ Konfirmasi Reset Leaderboard`;
    document.getElementById('modalContent').innerHTML = `
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55;">
            Apakah kamu yakin ingin mengembalikan <strong>Papan Peringkat (Leaderboard)</strong> ke 4 data awal demo?<br>
            <span style="font-size: 0.8rem; color: var(--text-muted);">(Catatan: Data saran &amp; masukan responden tidak akan ikut terhapus).</span>
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-color);">
            <button type="button" class="btn btn-ghost btn-sm" onclick="openFeedbackViewer()">Batal</button>
            <button type="button" class="btn btn-danger btn-sm" onclick="executeResetLeaderboardOnly()">Ya, Reset Leaderboard</button>
        </div>
    `;
}

function executeResetLeaderboardOnly() {
    localStorage.removeItem('filemate_leaderboard');
    renderHomeLeaderboard();
    openFeedbackViewer();
    showToastNotification(`<strong style="color: var(--safe);">✅ Papan Peringkat berhasil di-reset ke data awal!</strong>`);
}

// Tombol 2: Konfirmasi & Eksekusi Reset Masukan/Feedback Saja
function confirmResetFeedbackOnly() {
    document.getElementById('modalTitle').innerHTML = `⚠️ Konfirmasi Reset Masukan`;
    document.getElementById('modalContent').innerHTML = `
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55;">
            Apakah kamu yakin ingin menghapus seluruh daftar <strong>Saran &amp; Masukan Responden</strong> di browser ini?<br>
            <span style="font-size: 0.8rem; color: var(--text-muted);">(Catatan: Data skor di Papan Peringkat tidak akan berubah).</span>
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-color);">
            <button type="button" class="btn btn-ghost btn-sm" onclick="openFeedbackViewer()">Batal</button>
            <button type="button" class="btn btn-danger btn-sm" onclick="executeResetFeedbackOnly()">Ya, Reset Masukan</button>
        </div>
    `;
}

function executeResetFeedbackOnly() {
    localStorage.removeItem('filemate_feedbacks');
    openFeedbackViewer();
    showToastNotification(`<strong style="color: var(--safe);">✅ Daftar saran &amp; masukan berhasil dikosongkan!</strong>`);
}

// Tombol 3: Unduh CSV Feedback
function exportFeedbackCSV() {
    const feedbacks = JSON.parse(localStorage.getItem('filemate_feedbacks') || '[]');
    if (!feedbacks.length) {
        showToastNotification(`<strong style="color: var(--warning);">Belum ada data masukan responden untuk diunduh.</strong>`);
        return;
    }
    let csvContent = "Kode_Responden,Inisial_Anonim,Skor,Waktu_Input,Saran_dan_Masukan\n";
    feedbacks.forEach((f, idx) => {
        const code = `P${String(idx + 1).padStart(2, '0')}`;
        let cleanMsg = String(f.message || '').replace(/"/g, '""');
        if (/^[=+\-@]/.test(cleanMsg)) cleanMsg = "'" + cleanMsg;
        csvContent += `${code},${f.user},${f.score},"${f.date}","${cleanMsg}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "feedback_user.csv";
    a.click();
}

// Konfirmasi keluar/restart sesi simulasi
function confirmRestartSimulation(targetUrl = 'play.html') {
    const backdrop = document.getElementById('modalBackdrop');
    if (!backdrop) {
        isNavigatingIntentionally = true;
        window.location.href = targetUrl;
        return;
    }
    const isLeaving = targetUrl !== 'play.html';
    document.getElementById('modalTitle').innerHTML = isLeaving ? `Tinggalkan Sesi Simulasi?` : `Mulai Ulang Sesi Simulasi?`;
    document.getElementById('modalContent').innerHTML = `
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55;">
            ${isLeaving 
                ? `Sesi simulasi kamu sedang berjalan. Jika kamu keluar sekarang, progres dan skor pada sesi ini akan di-reset dari awal.` 
                : `Skor sesi saat ini akan dikembalikan ke <strong>100 Pts</strong> dan urutan skenario beserta file akan diacak ulang.`}
        </p>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-color);">
            <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal()">Batal</button>
            <button type="button" class="btn ${isLeaving ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="proceedNavigation('${escapeHTML(targetUrl)}')">
                ${isLeaving ? 'Ya, Keluar Sesi' : 'Ya, Mulai Ulang'}
            </button>
        </div>
    `;
    backdrop.classList.add('open');
}

function proceedNavigation(url) {
    isNavigatingIntentionally = true;
    window.location.href = url;
}

// 4. LIVE FILE SCANNER + VIRUSTOTAL + MANUAL HASH MATCHER (index.html)
let lastScannedFileHash = '';

const dz = document.getElementById('dropzone');
if (dz) {
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', (e) => {
        e.preventDefault();
        dz.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleLiveFile(e.dataTransfer.files[0]);
    });
}

async function handleLiveFile(file) {
    if (!file) return;
    document.getElementById('liveScanResult').style.display = 'block';
    document.getElementById('liveSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
    document.getElementById('liveMime').textContent = file.type || 'application/octet-stream';

    const sliceBuffer = await file.slice(0, 4).arrayBuffer();
    const byteArr = Array.from(new Uint8Array(sliceBuffer));
    const hexHeader = byteArr.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

    let detectedSignature = "Dokumen / Data Umum";
    const isMZ = (byteArr[0] === 0x4D && byteArr[1] === 0x5A);
    const isELF = (byteArr[0] === 0x7F && byteArr[1] === 0x45 && byteArr[2] === 0x4C && byteArr[3] === 0x46);
    const isJPG = (byteArr[0] === 0xFF && byteArr[1] === 0xD8 && byteArr[2] === 0xFF);
    const isPNG = (byteArr[0] === 0x89 && byteArr[1] === 0x50 && byteArr[2] === 0x4E && byteArr[3] === 0x47);
    const isPDF = (byteArr[0] === 0x25 && byteArr[1] === 0x50 && byteArr[2] === 0x44 && byteArr[3] === 0x46);
    const isZIP = (byteArr[0] === 0x50 && byteArr[1] === 0x4B && byteArr[2] === 0x03 && byteArr[3] === 0x04);

    if (isMZ) detectedSignature = "Program Eksekusi Windows (PE32 / MZ)";
    else if (isELF) detectedSignature = "Program Eksekusi Linux (ELF)";
    else if (isJPG) detectedSignature = "Gambar JPEG Asli (FF D8 FF)";
    else if (isPNG) detectedSignature = "Gambar PNG Asli (89 50 4E 47)";
    else if (isPDF) detectedSignature = "Dokumen PDF Asli (%PDF)";
    else if (isZIP) detectedSignature = "Arsip ZIP / Dokumen Office Modern (PK)";

    const safeFileName = escapeHTML(file.name);
    const parts = safeFileName.split('.');
    const execExts = ['exe', 'msi', 'bat', 'vbs', 'scr', 'sh', 'cmd', 'ps1'];
    const lastExt = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    const isExecExt = execExts.includes(lastExt);
    const isHiddenExec = (isMZ || isELF) && !isExecExt;

    if (parts.length > 2) {
        const base = parts.slice(0, -2).join('.');
        const firstExt = '.' + parts[parts.length - 2];
        const realExt = '.' + parts[parts.length - 1];
        document.getElementById('liveXrayName').innerHTML = `
            ${base}<span class="ext-badge ext-fake">${firstExt}</span><span class="ext-badge ${isExecExt ? 'ext-danger' : 'ext-safe'}">${realExt}</span>
        `;
        if (isExecExt || isHiddenExec) {
            document.getElementById('liveVerdict').innerHTML = `
                <span style="color: var(--danger); font-weight: 700;">🚨 BAHAYA: Terdeteksi Ekstensi Ganda Berupa Program (${realExt})!</span><br>
                <span style="color: var(--text-secondary); font-size: 0.84rem;">File ini menggunakan nama pengecoh <code>${firstExt}</code> tetapi aslinya adalah <strong>${detectedSignature}</strong>. Jangan dibuka kecuali kamu mengecek hash-nya di VirusTotal!</span>
            `;
        } else {
            document.getElementById('liveVerdict').innerHTML = `
                <span style="color: var(--safe); font-weight: 700;">✅ AMAN DARI SPOOFING: Nama Bertitik Ganda, Tapi Isi Biner Cocok (${detectedSignature})</span><br>
                <span style="color: var(--text-secondary); font-size: 0.84rem;">Walaupun memakai lebih dari satu titik, buntut terakhirnya adalah <code>${realExt}</code> dan segel binernya <code>[${hexHeader}]</code> terbukti bukan program eksekusi.</span>
            `;
        }
    } else {
        const base = parts[0];
        const realExt = parts.length > 1 ? '.' + parts[1] : '(Tanpa Ekstensi)';
        document.getElementById('liveXrayName').innerHTML = `
            ${base}<span class="ext-badge ${isHiddenExec ? 'ext-danger' : 'ext-safe'}">${realExt}</span>
        `;

        if (isHiddenExec) {
            document.getElementById('liveVerdict').innerHTML = `
                <span style="color: var(--danger); font-weight: 700;">🚨 BAHAYA: Penyamaran File! Ekstensi ${realExt} Tapi Isi Binernya Program!</span><br>
                <span style="color: var(--text-secondary); font-size: 0.84rem;">Nama file terlihat seperti <code>${realExt}</code>, tetapi segel biner di dalamnya adalah <strong>${detectedSignature} [${hexHeader}]</strong>!</span>
            `;
        } else if (isExecExt) {
            document.getElementById('liveVerdict').innerHTML = `
                <span style="color: var(--accent); font-weight: 700;">ℹ️ File Aplikasi / Installer (${detectedSignature})</span><br>
                <span style="color: var(--text-secondary); font-size: 0.84rem;">Struktur ekstensi dan header <code>[${hexHeader}]</code> jujur (tidak menyamar). Karena ini file program, silakan klik <strong>Cek di VirusTotal</strong> di bawah untuk memverifikasi reputasi keamanannya.</span>
            `;
        } else {
            document.getElementById('liveVerdict').innerHTML = `
                <span style="color: var(--safe); font-weight: 700;">✅ TERVERIFIKASI AMAN: ${detectedSignature} (Header: [${hexHeader || 'Text'}])</span><br>
                <span style="color: var(--text-secondary); font-size: 0.84rem;">Ekstensi <code>${realExt}</code> cocok dengan segel biner aslinya dan tidak ditemukan kode program eksekusi. <em>(Catatan: Jika file foto/dokumen pribadimu tertulis "Not Found" saat dicek di VirusTotal, itu wajar dan aman karena file pribadimu belum pernah diunggah ke database virus publik).</em></span>
            `;
        }
    }

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    lastScannedFileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('liveHash').textContent = lastScannedFileHash;

    const vtBtn = document.getElementById('vtLookupBtn');
    if (vtBtn) {
        vtBtn.href = `https://www.virustotal.com/gui/search/${lastScannedFileHash}`;
    }

    const manualInput = document.getElementById('manualOfficialHash');
    if (manualInput && manualInput.value.trim() !== '') {
        checkManualHashMatch();
    }
}

function checkManualHashMatch() {
    const inputVal = document.getElementById('manualOfficialHash').value.trim().toLowerCase();
    const badge = document.getElementById('manualHashVerdict');
    if (!badge) return;

    if (!inputVal) {
        badge.innerHTML = '';
        return;
    }
    if (!lastScannedFileHash) {
        badge.innerHTML = `<span style="color: var(--warning);">Pilih file di atas terlebih dahulu!</span>`;
        return;
    }
    if (inputVal === lastScannedFileHash.toLowerCase()) {
        badge.innerHTML = `<span style="color: var(--safe); font-weight: 600;">✅ 100% COCOK! File kamu identik dan asli sesuai checksum developer.</span>`;
    } else {
        badge.innerHTML = `<span style="color: var(--danger); font-weight: 600;">❌ TIDAK COCOK (Mismatch)! Kode SHA-256 berbeda, hati-hati file mungkin sudah dimodifikasi!</span>`;
    }
}

// =========================================================
// 5. ENGINE LAB SIMULASI 3 KASUS ACAK + PROTEKSI REFRESH (play.html)
// =========================================================
let sessionScenarios = {};
let activeStage = 1;
let currentScore = 100;
let secondsElapsed = 0;
let mistakeTracker = { SPOOFING: 0, HASH: 0, FATIGUE: 0, IMPULSIVE: 0 };
let actionHistoryLog = [];
let isNavigatingIntentionally = false;

function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function initSandboxSession() {
    if (!document.getElementById('sandboxPanel') || typeof SCENARIO_BANK === 'undefined') return;

    // === [AWAL ZONA MIGRASI BACKEND 3 - TUGAS ROHIT] ===
    const pickOne = (pool) => JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
    const selectedPool = [
        pickOne(SCENARIO_BANK.SPOOFING),
        pickOne(SCENARIO_BANK.HASH),
        pickOne(SCENARIO_BANK.FATIGUE)
    ];

    const randomizedOrder = shuffleArray(selectedPool);
    randomizedOrder.forEach((scen, index) => {
        scen.files = shuffleArray(scen.files);
        sessionScenarios[index + 1] = scen;
    });
    // === [AKHIR ZONA MIGRASI BACKEND 3] ===

    setInterval(() => {
        secondsElapsed++;
        const m = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const s = String(secondsElapsed % 60).padStart(2, '0');
        const el = document.getElementById('timerIndicator');
        if (el) el.textContent = `${m}:${s}`;
    }, 1000);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'))) {
            e.preventDefault();
            confirmRestartSimulation('play.html');
        }
    });

    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('javascript')) {
                e.preventDefault();
                confirmRestartSimulation(href);
            }
        });
    });

    window.addEventListener('beforeunload', (e) => {
        if (!isNavigatingIntentionally) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    switchScenario(1);
}

function switchScenario(num) {
    activeStage = num;
    const c = sessionScenarios[num];
    document.getElementById('stageIndicator').textContent = `Kasus ${num} dari 3`;
    document.getElementById('caseTitle').textContent = `Kasus ${num}: ${c.title}`;
    document.getElementById('caseStory').textContent = c.story;
    document.getElementById('folderPath').textContent = `📁 ${c.path}`;

    const hashBox = document.getElementById('officialHashBox');
    const hashValContainer = document.getElementById('officialHashValue');
    const filesWithHash = c.files.filter(f => f.expectedHash);

    if (hashBox && hashValContainer) {
        if (filesWithHash.length > 0) {
            hashBox.style.display = 'block';
            hashValContainer.innerHTML = filesWithHash.map(f => `
                <div style="margin-top: 6px; padding: 6px 10px; background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border-color);">
                    <span style="color: var(--accent); font-weight: 700;">📄 ${escapeHTML(f.shownName.trim())}</span><br>
                    <span style="font-size: 0.78rem; color: var(--text-secondary);">SHA-256 Resmi: <code>${escapeHTML(f.expectedHash)}</code></span>
                </div>
            `).join('');
        } else if (c.officialHash) {
            hashBox.style.display = 'block';
            hashValContainer.textContent = c.officialHash;
        } else {
            hashBox.style.display = 'none';
        }
    }

    const drawer = document.getElementById('feedbackDrawer');
    if (drawer) drawer.classList.remove('show');

    const nextBtn = document.getElementById('btnNextStage');
    if (nextBtn) {
        nextBtn.innerHTML = num < 3 ? `Lanjut ke Kasus Berikutnya &rarr;` : `Lihat Hasil &amp; Evaluasi Akhir &rarr;`;
    }

    renderFiles();
}

function renderFiles() {
    const c = sessionScenarios[activeStage];
    const container = document.getElementById('fileRowsContainer');
    if (!container) return;
    container.innerHTML = '';

    let doneCount = 0;
    c.files.forEach((f, idx) => {
        if (f.status) doneCount++;

        let actionArea = '';
        if (f.status === 'OPENED_SAFE') {
            actionArea = `<span class="file-status-tag" style="background: var(--safe-soft); color: var(--safe);">✅ Dibuka (Aman)</span>`;
        } else if (f.status === 'QUARANTINED_CORRECT') {
            actionArea = `<span class="file-status-tag" style="background: var(--safe-soft); color: var(--safe);">🛡️ Ancaman Telah Terhapus</span>`;
        } else if (f.status === 'INFECTED') {
            actionArea = `<span class="file-status-tag" style="background: var(--danger-soft); color: var(--danger);">💥 Malware Terpicu (-15 Pts)</span>`;
        } else if (f.status === 'FALSE_ALARM') {
            actionArea = `<span class="file-status-tag" style="background: var(--warning-soft); color: var(--warning);">⚠️ File Aman Dihapus (-5 Pts)</span>`;
        } else {
            actionArea = `
                <button class="btn btn-safe btn-sm" onclick="takeAction(${idx}, 'OPEN')">📂 Buka File</button>
                <button class="btn btn-danger btn-sm" onclick="takeAction(${idx}, 'QUARANTINE')">🗑️ Hapus File</button>
            `;
        }

        const inspectedBadge = f.inspected ? `<span style="font-size: 0.72rem; color: var(--accent); margin-left: 6px;">[Diperiksa ✓]</span>` : '';

        const row = document.createElement('div');
        row.className = 'file-item';
        row.innerHTML = `
            <div>
                <strong class="mono" style="font-size: 0.95rem;">📄 ${escapeHTML(f.shownName)}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 6px;">(${escapeHTML(f.size)})</span>
                ${inspectedBadge}
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-ghost btn-sm" onclick="openXrayAnimated(${idx})">🔍 X-Ray Inspect</button>
                <button class="btn btn-ghost btn-sm" onclick="openHashAnimated(${idx})">#️⃣ Cek SHA-256</button>
                ${actionArea}
            </div>
        `;
        container.appendChild(row);
    });

    document.getElementById('progressStatus').textContent = `Diselesaikan: ${doneCount} / ${c.files.length} file`;

    if (doneCount === c.files.length) {
        showScenarioLessonWithEnding(c);
    }
}

// 6. ANIMASI X-RAY DENGAN LABEL "File Permission:"
function openXrayAnimated(idx) {
    const f = sessionScenarios[activeStage].files[idx];
    f.inspected = true;
    renderFiles();

    document.getElementById('modalTitle').textContent = '🔍 Pemindaian X-Ray & Kamus Metadata';
    document.getElementById('modalContent').innerHTML = `
        <div style="padding: 12px 0;">
            <div id="scanStageText" class="mono" style="font-size: 0.85rem; color: var(--accent);">[1/3] Membaca magic bytes &amp; signature biner...</div>
            <div class="scan-progress-wrap"><div class="scan-progress-bar" id="scanProgressBar"></div></div>
        </div>
        <div id="xrayFinalOutput" style="display: none;"></div>
    `;
    document.getElementById('modalBackdrop').classList.add('open');

    const bar = document.getElementById('scanProgressBar');
    const txt = document.getElementById('scanStageText');

    setTimeout(() => { bar.style.width = '50%'; txt.textContent = '[2/3] Memeriksa embedded payload &amp; file permission...'; }, 220);
    setTimeout(() => { bar.style.width = '100%'; txt.textContent = '[3/3] Pemindaian selesai!'; }, 500);

    setTimeout(() => {
        const baseName = f.realName.replace(f.fakeExt || '', '').replace(f.realExt, '');
        const visualName = f.fakeExt
            ? `${escapeHTML(baseName)}<span class="ext-badge ext-fake">${escapeHTML(f.fakeExt)} (Pengecoh)</span> &rarr; <span class="ext-badge ext-danger">${escapeHTML(f.realExt)} (Ekstensi Asli!)</span>`
            : `${escapeHTML(baseName)}<span class="ext-badge ${f.isMalware ? 'ext-danger' : 'ext-safe'}">${escapeHTML(f.realExt)}</span>`;

        const permExplain = f.perm.includes('x')
            ? `⚠️ Ada huruf 'x' (Executable): File ini bisa mengeksekusi kode program di sistem! Dokumen/foto biasa tidak boleh punya izin 'x'.`
            : `✅ Hanya baca/tulis ('rw-'): File pasif biasa, tidak memiliki izin eksekusi program.`;

        const out = document.getElementById('xrayFinalOutput');
        out.style.display = 'block';
        out.className = 'reveal-anim';
        out.innerHTML = `
            <div class="xray-box">
                <div class="xray-scanline"></div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">BEDAH EKSTENSI &amp; HEADER:</div>
                <div class="mono" style="font-size: 1rem; font-weight: 600;">${visualName}</div>
            </div>
            <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
                <div>
                    <span style="color: var(--text-muted);">Nama Fisik Sebenarnya:</span> <strong class="mono">${escapeHTML(f.realName)}</strong>
                </div>
                <div>
                    <span style="color: var(--text-muted);">MIME Type (Identitas File):</span> <span class="mono">${escapeHTML(f.mime)}</span>
                    <span class="explain-pill">💡 Penjelasan Awam: Jenis asli file yang dikenali sistem operasi, terlepas dari nama filenya.</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">Header Biner (Magic Bytes):</span> <strong class="mono" style="color: ${f.isMalware ? 'var(--danger)' : 'var(--safe)'};">${escapeHTML(f.magicBytes)}</strong>
                    <span class="explain-pill">💡 Penjelasan Awam: Segel kode pertama di dalam isi file (misal %PDF untuk PDF asli, atau MZ untuk program .exe).</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">Pemindaian Isi (Payload):</span> <span class="mono">${escapeHTML(f.payloadStatus)}</span>
                </div>
                <div>
                    <span style="color: var(--text-muted);">File Permission:</span> <span class="mono">${escapeHTML(f.perm)}</span>
                    <span class="explain-pill">${permExplain}</span>
                </div>
            </div>
        `;
    }, 750);
}

// 7. ANIMASI MATRIX SHA-256 (Mendukung expectedHash per file)
function openHashAnimated(idx) {
    const f = sessionScenarios[activeStage].files[idx];
    f.inspected = true;
    renderFiles();

    const targetOfficialHash = f.expectedHash || (sessionScenarios[activeStage].officialHash && f.realName.endsWith('.zip') ? sessionScenarios[activeStage].officialHash : null);
    document.getElementById('modalTitle').textContent = '#️⃣ Generator Checksum SHA-256';

    let compareSection = '';
    if (targetOfficialHash) {
        compareSection = `
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">
                    Target SHA-256 Resmi untuk <strong>${escapeHTML(f.shownName.trim())}</strong>:<br>
                    <code class="mono" style="color: var(--text-secondary); word-break: break-all;">${escapeHTML(targetOfficialHash)}</code>
                </div>
                <button class="btn btn-primary btn-sm" id="btnCompareHash" style="display: none;" onclick="animateHashDiff('${escapeHTML(f.hash)}', '${escapeHTML(targetOfficialHash)}')">⚡ Bandingkan Otomatis dengan Hash Resmi</button>
                <div id="hashCompareResult" style="margin-top: 12px;"></div>
            </div>
        `;
    } else {
        compareSection = `
            <div style="margin-top: 14px; padding: 10px 12px; background: var(--bg-subtle); border-radius: 8px; border-left: 3px solid var(--accent); font-size: 0.82rem; color: var(--text-secondary);">
                ℹ️ Pengirim tidak menyertakan kode SHA-256 resmi untuk <code>${escapeHTML(f.shownName.trim())}</code>. Gunakan <strong>🔍 X-Ray Inspect</strong> untuk memeriksa keaslian header biner dan <em>File Permission</em>-nya.
            </div>
        `;
    }

    document.getElementById('modalContent').innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-secondary);">Menjalankan <code>sha256sum</code> pada <strong>${escapeHTML(f.realName)}</strong>:</div>
        <div id="matrixHashBox" class="mono" style="background: var(--bg-subtle); padding: 12px; border-radius: 8px; margin-top: 8px; font-size: 0.82rem; word-break: break-all; color: var(--accent);">Memproses...</div>
        <span class="explain-pill" style="margin-top: 6px;">💡 Sidik jari unik 64 karakter. Jika isi file diubah hacker 1 huruf saja, kode ini pasti berubah drastis.</span>
        ${compareSection}
    `;
    document.getElementById('modalBackdrop').classList.add('open');

    const targetHash = f.hash;
    const hexChars = '0123456789abcdef';
    let step = 0;
    const box = document.getElementById('matrixHashBox');

    const interval = setInterval(() => {
        step++;
        const locked = Math.floor((step / 16) * targetHash.length);
        let output = targetHash.substring(0, locked);
        for (let i = locked; i < targetHash.length; i++) output += hexChars[Math.floor(Math.random() * 16)];
        box.textContent = output;

        if (step >= 16) {
            clearInterval(interval);
            box.textContent = targetHash;
            const btn = document.getElementById('btnCompareHash');
            if (btn) btn.style.display = 'inline-flex';
        }
    }, 35);
}

function animateHashDiff(fileHash, officialHash) {
    const resBox = document.getElementById('hashCompareResult');
    resBox.innerHTML = `
        <div style="background: var(--bg-subtle); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
            <div id="diffStream" class="mono" style="font-size: 0.8rem; word-break: break-all;"></div>
            <div id="diffVerdict" style="margin-top: 10px; font-size: 0.85rem; font-weight: 600;"></div>
        </div>
    `;
    const stream = document.getElementById('diffStream');
    const verdict = document.getElementById('diffVerdict');
    let i = 0, mismatch = false;

    const scanInterval = setInterval(() => {
        for (let c = 0; c < 4 && i < fileHash.length; c++, i++) {
            if (fileHash[i] !== officialHash[i]) {
                mismatch = true;
                stream.innerHTML += `<span class="hash-char-diff">${escapeHTML(fileHash[i])}</span>`;
            } else {
                stream.innerHTML += `<span class="hash-char-match">${escapeHTML(fileHash[i])}</span>`;
            }
        }
        if (i >= fileHash.length) {
            clearInterval(scanInterval);
            verdict.style.color = mismatch ? 'var(--danger)' : 'var(--safe)';
            verdict.innerHTML = mismatch ? '❌ MISMATCH! Karakter merah menunjukkan file telah dimodifikasi/disisipi malware. Wajib dihapus!' : '✅ 100% IDENTIK & AMAN! Checksum sesuai dengan rilis resmi.';
        }
    }, 25);
}

// 8. KEPUTUSAN TINDAKAN USER + PENCATATAN LOG REVIEW
function takeAction(idx, action) {
    const c = sessionScenarios[activeStage];
    const f = c.files[idx];
    if (!f.inspected) mistakeTracker.IMPULSIVE++;

    if (action === 'OPEN' && f.isMalware) {
        f.status = 'INFECTED';
        mistakeTracker[c.type]++;
        updateScore(-15);
        actionHistoryLog.push({ file: f.realName, stage: activeStage, userAction: "Dibuka", correct: false, note: "Malware Terpicu (-15 Pts)" });

        const panel = document.getElementById('sandboxPanel');
        panel.classList.remove('malware-triggered');
        void panel.offsetWidth;
        panel.classList.add('malware-triggered');

        document.getElementById('modalTitle').innerHTML = `<span style="color: var(--danger);">🚨 PERINGATAN: MALWARE DIEKSEKUSI!</span>`;
        document.getElementById('modalContent').innerHTML = `
            <p style="font-size: 0.92rem;">Kamu membuka file berbahaya: <strong class="mono">${escapeHTML(f.realName)}</strong>!</p>
            <div style="margin-top: 12px; padding: 12px; background: var(--danger-soft); border-left: 3px solid var(--danger); border-radius: 6px; font-size: 0.85rem;">
                <strong>Mengapa file ini berbahaya?</strong><br>
                • Header/Magic Bytes: <code>${escapeHTML(f.magicBytes)}</code><br>
                • Analisis Payload: <code>${escapeHTML(f.payloadStatus)}</code>
            </div>
        `;
        document.getElementById('modalBackdrop').classList.add('open');
    } else if (action === 'OPEN' && !f.isMalware) {
        f.status = 'OPENED_SAFE';
        actionHistoryLog.push({ file: f.realName, stage: activeStage, userAction: "Dibuka", correct: true, note: "Tepat (File Aman)" });
    } else if (action === 'QUARANTINE' && f.isMalware) {
        f.status = 'QUARANTINED_CORRECT';
        actionHistoryLog.push({ file: f.realName, stage: activeStage, userAction: "Hapus", correct: true, note: "Tepat (Ancaman Dihapus)" });
    } else if (action === 'QUARANTINE' && !f.isMalware) {
        f.status = 'FALSE_ALARM';
        mistakeTracker[c.type]++;
        updateScore(-5);
        actionHistoryLog.push({ file: f.realName, stage: activeStage, userAction: "Hapus", correct: false, note: "Salah Hapus File Aman (-5 Pts)" });
    }
    renderFiles();
}

function showScenarioLessonWithEnding(c) {
    const drawer = document.getElementById('feedbackDrawer');
    if (!drawer) return;

    const anyInfected = c.files.some(f => f.status === 'INFECTED');
    const endingHtml = anyInfected
        ? `<div class="ending-box ending-bad">${c.badEnding}</div>`
        : `<div class="ending-box ending-good">${c.goodEnding}</div>`;

    drawer.innerHTML = `
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent); text-transform: uppercase;">
            📖 Akhir Cerita &amp; Pembahasan Kasus ${activeStage}
        </div>
        ${endingHtml}
        <h3 style="font-size: 1.02rem; margin-top: 14px;">${c.lessonTitle}</h3>
        <p style="font-size: 0.87rem; color: var(--text-secondary); margin-top: 4px;">${c.lessonBody}</p>
        <div style="margin-top: 10px; padding: 10px 12px; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.84rem;">
            🛠️ <strong>Tips Dunia Nyata:</strong> ${c.realLifeTip}
        </div>
    `;
    drawer.classList.add('show');
}

function showHint() {
    updateScore(-5);
    const c = sessionScenarios[activeStage];
    document.getElementById('modalTitle').textContent = '💡 Bantuan Analis Satgas (-5 Pts)';
    document.getElementById('modalContent').innerHTML = `
        <div style="padding: 12px; background: var(--bg-subtle); border-radius: 8px; border-left: 3px solid var(--accent);">
            <div style="font-size: 0.78rem; color: var(--accent); font-weight: 700; margin-bottom: 4px;">
                🎙️ Pesan dari ${escapeHTML(c.hintAuthor)}:
            </div>
            <p style="font-size: 0.9rem;">"${escapeHTML(c.hintText)}"</p>
        </div>
    `;
    document.getElementById('modalBackdrop').classList.add('open');
}

function updateScore(delta) {
    currentScore = Math.max(0, currentScore + delta);
    const el = document.getElementById('scoreIndicator');
    if (el) el.textContent = `${currentScore} Pts`;
}

function nextScenario() {
    const currentFiles = sessionScenarios[activeStage].files;
    const allAnswered = currentFiles.every(f => f.status !== undefined && f.status !== null);

    if (!allAnswered) {
        document.getElementById('modalTitle').textContent = '⚠️ Tindakan Belum Lengkap';
        document.getElementById('modalContent').innerHTML = `<p style="font-size: 0.9rem;">Selesaikan keputusan (<strong>Buka File</strong> atau <strong>Hapus File</strong>) pada seluruh file di folder ini sebelum lanjut!</p>`;
        document.getElementById('modalBackdrop').classList.add('open');
        return;
    }

    if (activeStage < 3) {
        switchScenario(activeStage + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        isNavigatingIntentionally = true;
        localStorage.setItem('filemate_final_score', currentScore);
        localStorage.setItem('filemate_seconds', secondsElapsed);
        localStorage.setItem('filemate_mistakes', JSON.stringify(mistakeTracker));
        localStorage.setItem('filemate_history', JSON.stringify(actionHistoryLog));
        window.location.href = 'result.html';
    }
}