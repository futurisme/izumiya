#!/usr/bin/env bash
# ==============================================================================
# 🛡️ FADHILBOT 2026 - VPS 1-CLICK AUTO-REPAIR & RESTART (Ubuntu 22.04 LTS / Debian)
# Menjamin bot hidup 24/7 permanen tanpa resiko crash / restart loop di PM2.
# ==============================================================================
set -e

echo -e "\e[35m[FADHILBOT 2026]\e[0m Memulai perbaikan otomatis & sinkronisasi VPS..."

# 1. Pindah ke direktori proyek
TARGET_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$TARGET_DIR"

# 2. Stop dan bersihkan proses PM2 yang error/terhenti
echo -e "\e[34m[PM2]\e[0m Menyetop proses lama agar terbebas dari restart loop..."
pm2 stop fadhilbot 2>/dev/null || true
pm2 delete fadhilbot 2>/dev/null || true

# 3. Sinkronisasi Git dengan aman (menjaga .env tetap 100% utuh)
if [ -d ".git" ]; then
  echo -e "\e[34m[GIT]\e[0m Menarik pembaruan dari repositori utama..."
  git checkout -- index.js index.cjs ecosystem.config.cjs 2>/dev/null || true
  git pull origin main || true
fi

# 4. Pastikan file index terproteksi oleh AETHER-OMNI v26.11
echo -e "\e[32m[AETHER-OMNI]\e[0m Mengaktifkan engine loader virtual V8 RAM..."
if [ -f "scripts/protect.cjs" ]; then
  node scripts/protect.cjs
fi

# 5. Jalankan bot melalui PM2
echo -e "\e[36m[PM2]\e[0m Menyalakan engine fadhilbot..."
pm2 start ecosystem.config.cjs
pm2 save

echo -e "\e[32m[SELESAI]\e[0m Fadhilbot 2026 telah aktif online dan berjalan stabil 24/7!"
echo -e "Cek status live: \e[33mpm2 logs fadhilbot\e[0m"
pm2 status
