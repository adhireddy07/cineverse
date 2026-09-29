import subprocess
import time
import os
import sys
import re
import urllib.request
import threading
import shutil

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

app_dir = r"C:\Users\kadhi\.gemini\antigravity\scratch\cineverse"
jar_path = os.path.join(app_dir, "target", "cineverse-0.0.1-SNAPSHOT.jar")
cloudflared_exe = os.path.join(app_dir, "cloudflared.exe")
url_file = os.path.join(app_dir, "current_live_url.txt")
public_url_file = os.path.join(app_dir, "public_url.txt")
server_log = os.path.join(app_dir, "cineverse_server.log")
cf_log = os.path.join(app_dir, "cloudflared.log")
qr_artifact = r"C:\Users\kadhi\.gemini\antigravity\brain\b382abbf-f8de-4be3-b19e-221325a547ec\qr_mobile.png"
qr_local = os.path.join(app_dir, "qr_mobile.png")

def generate_qr(url):
    try:
        import qrcode
        img = qrcode.make(url)
        img.save(qr_artifact)
        shutil.copy(qr_artifact, qr_local)
        print(f"[CINEVERSE] QR code updated for: {url}", flush=True)
    except Exception as e:
        print(f"[CINEVERSE] QR generation note: {e}", flush=True)

def kill_previous():
    try:
        subprocess.run(["powershell", "-Command", "Stop-Process -Name 'cloudflared', 'ssh' -Force -ErrorAction SilentlyContinue"], capture_output=True)
    except Exception:
        pass
    time.sleep(1)

kill_previous()

# 1. Start or Verify Spring Boot backend
server_ready = False
try:
    req = urllib.request.urlopen("http://127.0.0.1:8080/", timeout=2)
    if req.status == 200:
        server_ready = True
        print("[CINEVERSE] Spring Boot is already running on http://127.0.0.1:8080", flush=True)
except Exception:
    pass

java_proc = None
if not server_ready:
    print("[CINEVERSE] Starting CineVerse Spring Boot backend...", flush=True)
    log_f = open(server_log, "w", encoding="utf-8")
    java_proc = subprocess.Popen(
        ["java", "-jar", jar_path],
        cwd=app_dir,
        stdout=log_f,
        stderr=subprocess.STDOUT
    )
    start_wait = time.time()
    while time.time() - start_wait < 60:
        if java_proc.poll() is not None:
            print(f"[ERROR] Java process exited with code {java_proc.poll()}", flush=True)
            break
        try:
            req = urllib.request.urlopen("http://127.0.0.1:8080/", timeout=2)
            if req.status == 200:
                server_ready = True
                print("[CINEVERSE] Spring Boot is LIVE and healthy on http://127.0.0.1:8080", flush=True)
                break
        except Exception:
            time.sleep(1.5)

if not server_ready:
    print("[ERROR] Spring Boot failed to initialize. Check cineverse_server.log!", flush=True)
    sys.exit(1)

# 2. Launch Cloudflare Tunnel
cf_proc = None
current_url = None

def start_tunnel():
    global cf_proc, current_url
    print("[CINEVERSE] Launching Cloudflare Tunnel...", flush=True)
    cf_f = open(cf_log, "a", encoding="utf-8")
    cf_proc = subprocess.Popen(
        [cloudflared_exe, "tunnel", "--url", "http://127.0.0.1:8080", "--http-host-header", "localhost"],
        cwd=app_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    st = time.time()
    found = None
    while time.time() - st < 30:
        line = cf_proc.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
        try:
            cf_f.write(line)
            cf_f.flush()
        except Exception:
            pass
        m = re.search(r'https://[a-zA-Z0-9\.\-]+\.trycloudflare\.com', line)
        if m and "api.trycloudflare.com" not in m.group(0):
            found = m.group(0)
            break

    if found:
        current_url = found
        with open(url_file, "w", encoding="utf-8") as f:
            f.write(current_url)
        with open(public_url_file, "w", encoding="utf-8") as f:
            f.write(current_url)
        print("\n=======================================================", flush=True)
        print(f"[PERMANENT PUBLIC LIVE URL]: {current_url}", flush=True)
        print("=======================================================\n", flush=True)
        generate_qr(current_url)
    else:
        print("[WARNING] Could not extract Cloudflare URL in 30s.", flush=True)
    return current_url

start_tunnel()

def pipe_drainer():
    global cf_proc
    cf_f = open(cf_log, "a", encoding="utf-8")
    while True:
        try:
            if cf_proc and cf_proc.stdout:
                line = cf_proc.stdout.readline()
                if line and cf_f:
                    cf_f.write(line)
                    cf_f.flush()
                else:
                    time.sleep(0.5)
            else:
                time.sleep(1)
        except Exception:
            time.sleep(1)

threading.Thread(target=pipe_drainer, daemon=True).start()

print("[CINEVERSE] Supervisor running. Monitoring every 20s.", flush=True)

while True:
    time.sleep(20)

    # 1. Spring Boot check
    if java_proc and java_proc.poll() is not None:
        print(f"[ALERT] Java died ({java_proc.poll()}). Restarting Spring Boot...", flush=True)
        log_f = open(server_log, "a", encoding="utf-8")
        java_proc = subprocess.Popen(
            ["java", "-jar", jar_path],
            cwd=app_dir,
            stdout=log_f,
            stderr=subprocess.STDOUT
        )
        time.sleep(5)
    else:
        try:
            urllib.request.urlopen("http://127.0.0.1:8080/", timeout=3)
        except Exception:
            pass

    # 2. Cloudflare tunnel check
    if cf_proc and cf_proc.poll() is not None:
        print(f"[ALERT] Cloudflare exited ({cf_proc.poll()}). Restarting tunnel...", flush=True)
        start_tunnel()
