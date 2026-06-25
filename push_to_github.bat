@echo off
title Push Project to GitHub
echo ==================================================
echo       Push ASIP Monitor ke GitHub
echo ==================================================
echo.
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git tidak terdeteksi di komputer Anda.
    echo Silakan unduh dan instal Git untuk Windows terlebih dahulu dari:
    echo https://git-scm.com/download/win
    echo.
    echo Setelah menginstal Git, jalankan kembali file batch ini.
    pause
    exit /b
)

set /p REPO_URL="Masukkan URL Repositori GitHub Anda (misal: https://github.com/username/asip-monitor.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] URL Repositori tidak boleh kosong.
    pause
    exit /b
)

echo.
echo [1/5] Menginisialisasi repositori Git lokal...
git init

echo [2/5] Menambahkan file proyek (mengabaikan node_modules & .node)...
git add .

echo [3/5] Membuat commit pertama...
git commit -m "Initial commit with GitHub Actions workflow"

echo [4/5] Mengatur branch utama dan link remote...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo [5/5] Mengunggah proyek ke GitHub...
echo (Anda mungkin akan dimintai otorisasi login GitHub di peramban/browser)
git push -u origin main

echo.
echo ==================================================
echo Proyek berhasil diunggah ke GitHub!
echo Silakan periksa tab "Actions" di halaman GitHub Anda.
echo Proses build APK akan berjalan otomatis di sana.
echo ==================================================
echo.
pause
