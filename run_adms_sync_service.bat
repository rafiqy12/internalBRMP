@echo off
title BRMP DIY - Auto Sync Mesin Absensi ke Server ADMS
color 0a

echo ==============================================================
echo       BRMP DIY - DAEMON BRIDGE SYNC MESIN ABSENSI FISIK
echo   Sinkronisasi Otomatis Mesin (TCP 4370) -> ADMS cPanel & Synology
echo ==============================================================
echo.

:loop
python sync_adms_bridge.py
echo.
echo Menunggu 60 detik untuk sinkronisasi berikutnya (Tekan Ctrl+C untuk berhenti)...
timeout /t 60 /nobreak >nul
goto loop

