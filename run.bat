@echo off
title ASIP Monitor Launcher

echo ==================================================
echo       ASIP Monitor Prototype Launcher
echo ==================================================
echo.

REM Set local Node.js Path
set NODE_DIR=%~dp0.node\node-v22.13.0-win-x64
set PATH=%NODE_DIR%;%PATH%

echo [1/3] Memeriksa instalasi Node.js lokal...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Gagal memuat Node.js portable dari direktori .node.
    echo Pastikan file Node.js sudah terunduh dan diekstrak dengan lengkap.
    pause
    exit /b
)
echo Node.js terdeteksi: v22.13.0
echo.

echo [2/3] Memulai database dan server Express (Backend)...
start "ASIP Monitor - Backend (Express)" cmd /k "set PATH=%NODE_DIR%;%%PATH%% && cd backend && echo Menjalankan Backend Express... && npm start"

echo [3/3] Memulai aplikasi React + Vite (Frontend)...
start "ASIP Monitor - Frontend (React)" cmd /k "set PATH=%NODE_DIR%;%%PATH%% && cd /d %~dp0frontend && echo Menjalankan Frontend React... && npm run dev -- --host"

echo.
echo ==================================================
echo.
echo    ASIP Monitor Berhasil Diluncurkan!
echo.
echo    - Backend API: http://localhost:5000
echo    - Frontend Web: http://localhost:5173 (buka di Chrome)
echo.
echo    - Akun Demo Prototype:
echo      Email: ibu@asipmonitor.com
echo      Password: password123
echo.
echo ==================================================
echo.
echo Silakan tekan tombol apa saja untuk menutup launcher ini. Jendela server
echo backend dan frontend akan tetap berjalan di latar belakang.
echo.
pause
