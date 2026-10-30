import os
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime
from zk import ZK

# Daftar Mesin Absensi yang Disinkronkan
MACHINES = [
    {
        'ip': '192.168.2.26',
        'port': 4370,
        'sn': 'BJ36193960370',
        'name': 'Mesin Solution X302-S (2.26)'
    },
    {
        'ip': '192.168.10.218',
        'port': 4370,
        'sn': 'BJ36193960367',
        'name': 'Mesin Solution X302-S (10.218)'
    },
    {
        'ip': '192.168.2.73',
        'port': 4370,
        'sn': 'UCR6235200084',
        'name': 'Mesin Lobi Utama (2.73)'
    }
]

# Target ADMS Endpoints (cPanel & Synology)
TARGET_ENDPOINTS = [
    'http://adms.brmpdiy.my.id/cdata',
    'http://adms.brmpdiy.id/cdata'
]

STATE_FILE = os.path.join(os.path.dirname(__file__), 'last_synced_logs.txt')

def load_last_synced():
    if not os.path.exists(STATE_FILE):
        return {}
    res = {}
    try:
        with open(STATE_FILE, 'r') as f:
            for line in f:
                parts = line.strip().split('|')
                if len(parts) == 2:
                    res[parts[0]] = parts[1]
    except Exception:
        pass
    return res

def save_last_synced(state):
    try:
        with open(STATE_FILE, 'w') as f:
            for sn, ts in state.items():
                f.write(f"{sn}|{ts}\n")
    except Exception:
        pass

def push_attendance_to_adms(sn, pin, timestamp, status_punch=0):
    """
    Format ADMS ZKTeco / Solution standard:
    PIN\tYYYY-MM-DD HH:MM:SS\tStatus\tVerifyType
    Dikirim via POST ke /cdata?SN=...&table=ATTLOG
    """
    # format timestamp: YYYY-MM-DD HH:MM:SS
    time_str = str(timestamp)
    payload_body = f"{pin}\t{time_str}\t{status_punch}\t1\r\n"
    
    for endpoint in TARGET_ENDPOINTS:
        url = f"{endpoint}?SN={sn}&table=ATTLOG"
        try:
            req = urllib.request.Request(
                url,
                data=payload_body.encode('utf-8'),
                headers={
                    'User-Agent': 'iClock Proxy',
                    'Content-Type': 'text/plain'
                }
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                resp.read()
        except Exception:
            pass

def sync_machine(m, last_state):
    ip = m['ip']
    port = m['port']
    sn = m['sn']
    name = m['name']
    
    last_ts = last_state.get(sn, '')
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Memeriksa {name} ({ip})...")
    
    zk = ZK(ip, port=port, timeout=4)
    try:
        conn = zk.connect()
        records = conn.get_attendance()
        conn.disconnect()
    except Exception as e:
        print(f"  -> Gagal koneksi ke {ip}: {e}")
        return

    if not records:
        return

    # Urutkan berdasarkan waktu
    records.sort(key=lambda r: str(r.timestamp))
    
    # Ambil record baru (jika belum pernah sync, ambil 50 log terakhir)
    new_records = []
    if not last_ts:
        new_records = records[-50:]
    else:
        new_records = [r for r in records if str(r.timestamp) > last_ts]

    if new_records:
        print(f"  -> Mengirim {len(new_records)} log baru dari {sn} ke cPanel & Synology...")
        for r in new_records:
            push_attendance_to_adms(sn, r.user_id, r.timestamp, r.status)
        last_state[sn] = str(new_records[-1].timestamp)
        save_last_synced(last_state)
        print(f"  -> SUKSES! Log terakhir: {last_state[sn]}")
    else:
        print(f"  -> Sudah up-to-date (Total log di mesin: {len(records)})")

def main():
    print("=" * 60)
    print(" >>> BRMP DIY - MESIN ABSENSI TCP TO ADMS BRIDGE SYNC <<<")
    print("=" * 60)
    last_state = load_last_synced()
    
    for m in MACHINES:
        sync_machine(m, last_state)
        time.sleep(1)
        
    print("=" * 60)
    print("Sinkronisasi selesai!")

if __name__ == '__main__':
    main()

