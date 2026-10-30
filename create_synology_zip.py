import os
import sys
import zipfile
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ZIP_NAME = "synology_brmp_deploy.zip"
ZIP_PATH = os.path.join(BASE_DIR, ZIP_NAME)

def log(msg, symbol="[INFO]"):
    now = datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] {symbol} {msg}")

def main():
    print("=" * 65)
    print(" >>> BRMP DIY - SYNOLOGY WEB STATION PACKAGE BUILDER <<<")
    print("=" * 65)

    dist_dir = os.path.join(BASE_DIR, "client", "dist")
    if not os.path.exists(dist_dir):
        log("Client dist folder tidak ditemukan, silakan run 'npm run build' terlebih dahulu", "[ERROR]")
        sys.exit(1)

    log(f"Membuat paket ZIP: {ZIP_NAME}...", "[ZIP]")

    if os.path.exists(ZIP_PATH):
        try:
            os.remove(ZIP_PATH)
        except Exception:
            pass

    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 1. Add Backend PHP Files & Configs
        backend_files = [
            ("php_backend/api.php", "api.php"),
            ("php_backend/cdata.php", "cdata.php"),
            ("php_backend/config.php", "config.php"),
            ("php_backend/pegawaiData.json", "pegawaiData.json"),
            ("php_backend/cutiData.json", "cutiData.json"),
            ("php_backend/.htaccess", ".htaccess"),
            ("php_backend/nginx_synology.conf", "nginx_synology.conf"),
            ("php_backend/README_SYNOLOGY.md", "README_SYNOLOGY.md"),
        ]

        for src, arc in backend_files:
            src_path = os.path.join(BASE_DIR, src)
            if os.path.exists(src_path):
                zipf.write(src_path, arc)
                log(f"Added backend: {arc}", "[OK]")
            else:
                log(f"File tidak ditemukan, dilewati: {src}", "[WARN]")

        # 2. Add Database Directory (SQLite and protection)
        db_dir = os.path.join(BASE_DIR, "database")
        if os.path.exists(db_dir):
            for root, dirs, files in os.walk(db_dir):
                for f in files:
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, BASE_DIR)
                    zipf.write(full_p, rel_p.replace('\\', '/'))
                    log(f"Added database: {rel_p}", "[OK]")

        # 3. Add Frontend Dist Files (SPA Entry, Assets, and SPT Portal)
        for root, dirs, files in os.walk(dist_dir):
            for f in files:
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, dist_dir)
                zipf.write(full_p, rel_p.replace('\\', '/'))
                log(f"Added frontend: {rel_p}", "[OK]")

    size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
    print("=" * 65)
    log(f"BERHASIL! File ZIP Synology telah dibuat: {ZIP_NAME} ({size_mb:.2f} MB)", "[SUKSES]")
    print(f" Lokasi File : {ZIP_PATH}")
    print("=" * 65)

if __name__ == '__main__':
    main()

