@echo off
title Push Project to GitHub
echo ==================================================
echo       Push ASIP Monitor ke GitHub
echo ==================================================
echo.

set GIT_PATH=git
if exist ".git-portable\cmd\git.exe" (
    echo [INFO] Menggunakan Git Portabel yang sudah disiapkan...
    set GIT_PATH="%~dp0.git-portable\cmd\git.exe"
) else (
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
)

set REPO_URL=https://github.com/luviadibaskoro-beep/ASIP-MAS-LUVI.git

echo.
echo [1/4] Menginisialisasi repositori Git lokal...
%GIT_PATH% init

echo [2/4] Menambahkan file proyek...
%GIT_PATH% add .

echo [3/4] Membuat commit...
%GIT_PATH% config user.name "Ibu Hebat"
%GIT_PATH% config user.email "ibu@asipmonitor.com"
%GIT_PATH% commit -m "Initial commit with GitHub Actions workflow"
%GIT_PATH% branch -M main
%GIT_PATH% remote remove origin >nul 2>&1
%GIT_PATH% remote add origin %REPO_URL%

echo [4/4] Mengunggah proyek ke GitHub...
echo Jendela web/browser untuk login GitHub akan terbuka otomatis.
echo Silakan lakukan login/otorisasi untuk melanjutkan unggahan.
echo.
%GIT_PATH% push -u origin main

echo.
echo ==================================================
echo Proyek berhasil diunggah ke GitHub!
echo Silakan periksa tab "Actions" di halaman GitHub Anda.
echo Proses build APK akan berjalan otomatis di sana.
echo ==================================================
echo.
pause
