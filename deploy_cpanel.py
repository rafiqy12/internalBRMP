#!/usr/bin/env python3
"""
BRMP DIY - Auto Deployment Script to cPanel Hosting
Usage:
    python deploy_cpanel.py
    python deploy_cpanel.py --skip-build
"""

import os
import sys
import io
import ftplib
import subprocess
from datetime import datetime

# Pastikan output konsol aman di terminal Windows (cp1252 / utf-8)
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ==============================================================================
# KONFIGURASI FTP CPANEL
# ==============================================================================
FTP_HOST = os.getenv('CPANEL_FTP_HOST', 'brmpdiy.my.id')
FTP_USER = os.getenv('CPANEL_FTP_USER', 'belajar@brmpdiy.my.id')
FTP_PASS = os.getenv('CPANEL_FTP_PASS', 'belajaradms12')
FTP_TIMEOUT = 30

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REMOTE_KITA = "/public_html/kita.brmpdiy.my.id"
REMOTE_ADMS = "/public_html/adms.brmpdiy.my.id"


def log(msg, symbol="[INFO]"):
    now = datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] {symbol} {msg}")


def build_frontend():
    log("Menjalankan Vite production build (client)...", "[BUILD]")
    client_dir = os.path.join(BASE_DIR, "client")
    try:
        subprocess.run(["npm", "run", "build"], cwd=client_dir, check=True, shell=True)
        log("Vite client build sukses!", "[OK]")
    except subprocess.CalledProcessError as e:
        log(f"Build gagal: {e}. Melanjutkan dengan build yang ada...", "[WARN]")


def ensure_remote_dir(ftp, remote_dir):
    parts = [p for p in remote_dir.split('/') if p]
    cur = ''
    for p in parts:
        cur += '/' + p
        try:
            ftp.cwd(cur)
        except ftplib.error_perm:
            try:
                ftp.mkd(cur)
                ftp.cwd(cur)
            except Exception:
                pass


def upload_file(ftp, local_path, remote_path):
    if not os.path.exists(local_path):
        log(f"File lokal tidak ditemukan, dilewati: {local_path}", "[WARN]")
        return False

    remote_dir = os.path.dirname(remote_path).replace('\\', '/')
    ensure_remote_dir(ftp, remote_dir)
    filename = os.path.basename(remote_path)
    
    with open(local_path, 'rb') as f:
        ftp.storbinary(f"STOR {filename}", f)
    
    size_kb = os.path.getsize(local_path) / 1024
    log(f"Uploaded: {filename} ({size_kb:.1f} KB) -> {remote_dir}", "[OK]")
    return True


def upload_dir_recursive(ftp, local_dir, remote_dir):
    if not os.path.exists(local_dir):
        log(f"Direktori lokal tidak ditemukan, dilewati: {local_dir}", "[WARN]")
        return
    for root, dirs, files in os.walk(local_dir):
        rel_path = os.path.relpath(root, local_dir).replace('\\', '/')
        cur_remote = remote_dir if rel_path == '.' else f"{remote_dir}/{rel_path}"
        ensure_remote_dir(ftp, cur_remote)
        for f in files:
            loc_f = os.path.join(root, f)
            rem_f = f"{cur_remote}/{f}"
            upload_file(ftp, loc_f, rem_f)


def upload_bytes(ftp, content_bytes, remote_path):
    remote_dir = os.path.dirname(remote_path).replace('\\', '/')
    ensure_remote_dir(ftp, remote_dir)
    filename = os.path.basename(remote_path)
    ftp.storbinary(f"STOR {filename}", io.BytesIO(content_bytes))
    log(f"Uploaded: {filename} (in-memory) -> {remote_dir}", "[OK]")


def main():
    skip_build = "--skip-build" in sys.argv
    print("=" * 65)
    print(" >>> BRMP DIY - CPANEL AUTO DEPLOYMENT SYSTEM <<<")
    print("=" * 65)
    print(f" Target Host   : {FTP_HOST}")
    print(f" Target User   : {FTP_USER}")
    print(f" Portal Target : {REMOTE_KITA}")
    print(f" ADMS Target   : {REMOTE_ADMS}")
    print("=" * 65)

    if not skip_build:
        build_frontend()
    else:
        log("Melewati tahap build (--skip-build aktif)", "[SKIP]")

    log("Menghubungkan ke server FTP...", "[FTP]")
    try:
        ftp = ftplib.FTP(FTP_HOST, timeout=FTP_TIMEOUT)
        ftp.login(FTP_USER, FTP_PASS)
        ftp.set_pasv(True)
        log("Koneksi & Login FTP berhasil!", "[OK]")
    except Exception as e:
        log(f"Gagal koneksi FTP: {e}", "[ERROR]")
        sys.exit(1)

    try:
        # 1. DEPLOY KITA.BRMPDIY.MY.ID (Portal Web & API)
        print("\n" + "-" * 50)
        log("Mulai deploy ke portal: kita.brmpdiy.my.id...", "[DEPLOY]")
        print("-" * 50)

        # Upload Backend PHP files
        backend_files = [
            (os.path.join(BASE_DIR, "php_backend", "api.php"), f"{REMOTE_KITA}/api.php"),
            (os.path.join(BASE_DIR, "php_backend", "cdata.php"), f"{REMOTE_KITA}/cdata.php"),
            (os.path.join(BASE_DIR, "php_backend", "config.php"), f"{REMOTE_KITA}/config.php"),
            (os.path.join(BASE_DIR, "php_backend", "pegawaiData.json"), f"{REMOTE_KITA}/pegawaiData.json"),
            (os.path.join(BASE_DIR, "php_backend", "cutiData.json"), f"{REMOTE_KITA}/cutiData.json"),
            (os.path.join(BASE_DIR, "php_backend", ".htaccess"), f"{REMOTE_KITA}/.htaccess"),
            (os.path.join(BASE_DIR, "database", "brmp_database.sql"), f"{REMOTE_KITA}/brmp_database.sql"),
            (os.path.join(BASE_DIR, "ADMS_SETUP.md"), f"{REMOTE_KITA}/ADMS_SETUP.md"),
        ]
        for loc, rem in backend_files:
            upload_file(ftp, loc, rem)

        # Upload Frontend Assets (client/dist secara rekursif termasuk spt-portal)
        dist_dir = os.path.join(BASE_DIR, "client", "dist")
        if os.path.exists(dist_dir):
            upload_dir_recursive(ftp, dist_dir, REMOTE_KITA)

        # 2. DEPLOY ADMS.BRMPDIY.MY.ID (Receiver Mesin Absensi)
        print("\n" + "-" * 50)
        log("Mulai deploy ke subdomain: adms.brmpdiy.my.id...", "[DEPLOY]")
        print("-" * 50)

        adms_files = [
            (os.path.join(BASE_DIR, "adms_legacy", "adms.brmpdiy.my.id", "index.php"), f"{REMOTE_ADMS}/index.php"),
            (os.path.join(BASE_DIR, "adms_legacy", "adms.brmpdiy.my.id", "func.php"), f"{REMOTE_ADMS}/func.php"),
            (os.path.join(BASE_DIR, "adms_legacy", "adms.brmpdiy.my.id", "konek.php"), f"{REMOTE_ADMS}/konek.php"),
            (os.path.join(BASE_DIR, "adms_legacy", "adms.brmpdiy.my.id", "konek_pusat_data.php"), f"{REMOTE_ADMS}/konek_pusat_data.php"),
            (os.path.join(BASE_DIR, "php_backend", "cdata.php"), f"{REMOTE_ADMS}/cdata.php"),
            (os.path.join(BASE_DIR, "php_backend", "config.php"), f"{REMOTE_ADMS}/config.php"),
        ]
        for loc, rem in adms_files:
            upload_file(ftp, loc, rem)

        # Upload .htaccess routing untuk ADMS
        adms_htaccess = b"""<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# 1. Route ADMS machine protocol requests
RewriteRule ^iclock/(.*)$ index.php [QSA,L]
RewriteRule ^cdata$ index.php [QSA,L]
RewriteRule ^fdata$ index.php [QSA,L]
</IfModule>
"""
        upload_bytes(ftp, adms_htaccess, f"{REMOTE_ADMS}/.htaccess")

        ftp.quit()
        print("\n" + "=" * 65)
        log("SELURUH PROSES DEPLOYMENT KE CPANEL BERHASIL!", "[SUKSES]")
        print("=" * 65)
        print("  1. Portal Web : https://kita.brmpdiy.my.id")
        print("  2. API ADMS   : https://kita.brmpdiy.my.id/api/adms/machines")
        print("  3. Host ADMS  : http://adms.brmpdiy.my.id")
        print("=" * 65)

    except Exception as e:
        log(f"Error saat transfer file: {e}", "[ERROR]")
        try:
            ftp.quit()
        except Exception:
            pass
        sys.exit(1)


if __name__ == '__main__':
    main()
