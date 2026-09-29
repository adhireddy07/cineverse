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
cf_url_file = os.path.join(app_dir, "cloudflare_url.txt")
server_log = os.path.join(app_dir, "cineverse_server.log")
cf_log = os.path.join(app_dir, "cloudflared.log")
ssh_log = os.path.join(app_dir, "ssh_tunnel.log")
qr_artifact = r"C:\Users\kadhi\.gemini\antigravity\brain\b382abbf-f8de-4be3-b19e-221325a547ec\qr_mobile.png"
qr_local = os.path.join(app_dir, "qr_mobile.png")

# Locate ssh executable (accounting for 32-bit Python on 64-bit Windows)
ssh_exe = None
for candidate in [
    r"C:\Windows\Sysnative\OpenSSH\ssh.exe",
    r"C:\Windows\System32\OpenSSH\ssh.exe",
    shutil.which("ssh")
]:
    if candidate and os.path.exists(candidate):
        ssh_exe = candidate
        break

print(f"[SUPERVISOR] OpenSSH executable: {ssh_exe}", flush=True)

def generate_qr(url):
    try:
        import qrcode
        img = qrcode.make(url)
        img.save(qr_artifact)
        shutil.copy(qr_artifact, qr_local)
        print(f"[SUPERVISOR] Offline QR code updated for: {url}", flush=True)
    except Exception as e:
        print(f"[SUPERVISOR] QR generation note: {e}", flush=True)

def kill_tunnels():
    try:
        subprocess.run(["powershell", "-Command", "Stop-Process -Name 'cloudflared', 'ssh' -Force -ErrorAction SilentlyContinue"], capture_output=True)
    except Exception:
        pass
    time.sleep(1)

kill_tunnels()

# 1. Check or Start Spring Boot backend
server_ready = False
try:
    req = urllib.request.urlopen("http://127.0.0.1:8080/", timeout=2)
    if req.status == 200:
        server_ready = True
        print("[SUPERVISOR] Spring Boot is already running on http://127.0.0.1:8080", flush=True)
except Exception:
    pass

java_proc = None
if not server_ready:
    print("[SUPERVISOR] Starting CineVerse Spring Boot backend...", flush=True)
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
                print("[SUPERVISOR] Spring Boot is LIVE and healthy on http://127.0.0.1:8080", flush=True)
                break
        except Exception:
            time.sleep(1.5)

if not server_ready:
    print("[ERROR] Spring Boot failed to initialize. Check cineverse_server.log!", flush=True)
    sys.exit(1)

# 2. Launch Primary OpenSSH Tunnel (localhost.run)
ssh_proc = None
primary_url = None

def start_ssh_tunnel():
    global ssh_proc, primary_url
    if not ssh_exe:
        return None
    print("[SUPERVISOR] Launching primary OpenSSH tunnel (localhost.run)...", flush=True)
    ssh_proc = subprocess.Popen(
        [
            ssh_exe,
            "-o", "StrictHostKeyChecking=no",
            "-o", "ServerAliveInterval=15",
            "-o", "ServerAliveCountMax=3",
            "-o", "ExitOnForwardFailure=yes",
            "-R", "80:localhost:8080",
            "nokey@localhost.run"
        ],
        cwd=app_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    start_t = time.time()
    found_url = None
    log_ssh = open(ssh_log, "a", encoding="utf-8")
    while time.time() - start_t < 25:
        line = ssh_proc.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
        try:
            log_ssh.write(line)
            log_ssh.flush()
        except Exception:
            pass
        m = re.search(r'https://[a-zA-Z0-9\.\-]+\.lhr\.life', line)
        if m:
            found_url = m.group(0)
            break
            
    if found_url:
        primary_url = found_url
        with open(url_file, "w", encoding="utf-8") as f:
            f.write(primary_url)
        with open(public_url_file, "w", encoding="utf-8") as f:
            f.write(primary_url)
        print(f"\n=======================================================", flush=True)
        print(f"[PRIMARY PUBLIC LIVE URL]: {primary_url}", flush=True)
        print(f"=======================================================\n", flush=True)
        generate_qr(primary_url)
    return found_url

start_ssh_tunnel()

# Thread to drain ssh log
def ssh_drainer():
    global ssh_proc
    while True:
        try:
            if ssh_proc and ssh_proc.stdout:
                l = ssh_proc.stdout.readline()
                if not l:
                    time.sleep(0.5)
            else:
                time.sleep(1)
        except Exception:
            time.sleep(1)

threading.Thread(target=ssh_drainer, daemon=True).start()

# 3. Launch Secondary Cloudflare Tunnel
cf_proc = None
cf_url = None

def start_cloudflare():
    global cf_proc, cf_url
    if not os.path.exists(cloudflared_exe):
        return None
    print("[SUPERVISOR] Launching secondary Cloudflare Tunnel...", flush=True)
    cf_f = open(cf_log, "a", encoding="utf-8")
    cf_proc = subprocess.Popen(
        [cloudflared_exe, "tunnel", "--protocol", "http2", "--url", "http://127.0.0.1:8080", "--http-host-header", "localhost"],
        cwd=app_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    st = time.time()
    while time.time() - st < 25:
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
            cf_url = m.group(0)
            with open(cf_url_file, "w", encoding="utf-8") as f:
                f.write(cf_url)
            print(f"[CLOUDFLARE SECONDARY LIVE URL]: {cf_url}", flush=True)
            break
    return cf_url

start_cloudflare()

def cf_drainer():
    global cf_proc
    cf_f = open(cf_log, "a", encoding="utf-8")
    while True:
        try:
            if cf_proc and cf_proc.stdout:
                l = cf_proc.stdout.readline()
                if l and cf_f:
                    cf_f.write(l)
                    cf_f.flush()
                else:
                    time.sleep(0.5)
            else:
                time.sleep(1)
        except Exception:
            time.sleep(1)

threading.Thread(target=cf_drainer, daemon=True).start()

print("[SUPERVISOR] All services active. Monitoring every 20s.", flush=True)

# 4. Continuous Supervision Loop
while True:
    time.sleep(20)

    # Check Spring Boot
    if java_proc and java_proc.poll() is not None:
        print(f"[SUPERVISOR ALERT] Java process died ({java_proc.poll()}). Restarting Spring Boot...", flush=True)
        log_f = open(server_log, "a", encoding="utf-8")
        java_proc = subprocess.Popen(
            ["java", "-jar", jar_path],
            cwd=app_dir,
            stdout=log_f,
            stderr=subprocess.STDOUT
        )
        time.sleep(4)
    else:
        try:
            urllib.request.urlopen("http://127.0.0.1:8080/", timeout=3)
        except Exception:
            pass

    # Check SSH tunnel process
    if ssh_proc and ssh_proc.poll() is not None:
        print(f"[SUPERVISOR ALERT] SSH tunnel exited ({ssh_proc.poll()}). Re-establishing...", flush=True)
        start_ssh_tunnel()
    elif primary_url:
        # Active probe to detect silent server-side disconnections ("no tunnel here :(")
        tunnel_healthy = False
        try:
            req = urllib.request.Request(primary_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=6) as resp:
                if resp.status == 200:
                    tunnel_healthy = True
        except Exception as probe_err:
            print(f"[SUPERVISOR ALERT] Primary URL probe failed ({probe_err}). Reconnecting tunnel...", flush=True)
        
        if not tunnel_healthy:
            if ssh_proc:
                try:
                    ssh_proc.kill()
                except Exception:
                    pass
            time.sleep(2)
            start_ssh_tunnel()

    # Check Cloudflare tunnel
    if cf_proc and cf_proc.poll() is not None:
        print(f"[SUPERVISOR ALERT] Cloudflare exited ({cf_proc.poll()}). Re-establishing...", flush=True)
        start_cloudflare()
