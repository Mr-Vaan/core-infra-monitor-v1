# Panduan Deploy Docker & Docker Swarm (Standar Produksi)

Dokumen ini menyediakan panduan lengkap untuk melakukan *deployment*, manajemen kluster, dan orkestrasi aplikasi **Infra Health Intelligence** menggunakan **Docker Standalone**, **Docker Compose**, dan **Docker Swarm (Multi-Node High Availability)**.

---

## 1. Persiapan & Port Firewall Docker Swarm

Jika Anda menjalankan Docker Swarm pada beberapa server (bare-metal atau VM multi-node), pastikan port berikut telah dibuka antar-node:

| Port / Protokol | Tujuan | Deskripsi |
| :--- | :--- | :--- |
| **TCP 2377** | Cluster Management | Komunikasi kontrol antar node Swarm Manager |
| **TCP & UDP 7946** | Node Communication | *Gossip protocol* untuk penemuan node dan sinkronisasi status |
| **UDP 4789** | Overlay Network | Komunikasi paket VXLAN untuk data traffic antar kontainer di node berbeda |
| **TCP 3000** | Aplikasi Web & API | Port akses UI dan REST API (Ingress Routing Mesh) |

Contoh konfigurasi UFW (Ubuntu/Debian):
```bash
sudo ufw allow 2377/tcp
sudo ufw allow 7946/tcp
sudo ufw allow 7946/udp
sudo ufw allow 4789/udp
sudo ufw allow 3000/tcp
sudo ufw reload
```

---

## 2. Docker Registry: Panduan Membuat & Menggunakan Docker Hub

Dalam arsitektur Docker Swarm multi-node, server **Worker Node** memerlukan akses ke sebuah *Container Registry* untuk mengunduh (*pull*) image aplikasi. Terdapat dua pilihan utama:
1. **Docker Hub (Cloud)**: Mudah dan gratis (1 private repo & unlimited public repos).
2. **Local Private Registry (On-Premise)**: Langsung dijalankan di server lokal tanpa perlu mendaftar akun apa pun.

---

### Cara A: Menggunakan Docker Hub (Langkah demi Langkah)

#### 1. Mendaftar Akun Docker Hub
1. Kunjungi [https://hub.docker.com/signup](https://hub.docker.com/signup) di browser.
2. Tentukan **Docker ID (Username)** unik Anda (contoh: `ivandevops`), isi email dan password.
3. Buka inbox email Anda untuk klik tautan verifikasi.

#### 2. Membuat Personal Access Token (PAT)
Untuk lingkungan produksi, gunakan **Personal Access Token** (bukan password akun biasa) agar aman saat login dari terminal server:
1. Klik foto avatar profil di pojok kanan atas Docker Hub → pilih **Account Settings**.
2. Masuk ke tab **Security** di panel navigasi kiri.
3. Klik tombol **New Access Token**.
4. Beri deskripsi (contoh: `swarm-prod-server`) dan atur Access Permissions menjadi **Read, Write, Delete** (atau Read & Write).
5. Klik **Generate**, lalu salin string token yang muncul (token ini hanya ditampilkan satu kali).

#### 3. Login di Terminal Server
Jalankan perintah ini di server terminal Anda:
```bash
docker login -u <username_dockerhub>
```
Saat terminal meminta `Password:`, *paste* **Personal Access Token (PAT)** yang baru Anda buat, lalu tekan Enter.
Output yang berhasil akan menampilkan: `Login Succeeded`.

#### 4. Build dan Tag Image dengan Format Docker Hub
Docker Hub mewajibkan nama image diawali dengan nama akun (*namespace*) Anda:
```bash
# Format: docker build -t <username>/<nama-repo>:<tag> .
docker build -t <username_dockerhub>/infra-health-intel:latest .
```

#### 5. Push Image ke Docker Hub
Upload image dari server/komputer Anda ke repositori Docker Hub:
```bash
docker push <username_dockerhub>/infra-health-intel:latest
```
*(Docker Hub akan otomatis membuat repositori baru dengan nama `infra-health-intel` jika belum pernah dibuat sebelumnya).*

#### 6. Deploy ke Docker Swarm Menggunakan Image Docker Hub
Jalankan deploy dengan menyertakan variabel environment dan flag `--with-registry-auth`:
```bash
IMAGE_NAME=<username_dockerhub>/infra-health-intel:latest \
docker stack deploy -c docker-stack.yml --with-registry-auth infra
```
*Catatan:* Flag `--with-registry-auth` mengirimkan tiket autentikasi dari node Manager ke semua Worker node, sehingga worker node dapat mengunduh image meskipun repositori Anda bersifat *private*.

---

### Cara B: Alternatif Tanpa Buat Akun (Local Private Registry di Swarm)

Jika server Anda berada di jaringan intranet tertutup (air-gapped / on-premise) dan tidak ingin membuat akun di luar:

1. **Jalankan container registry resmi bawaan Docker pada Swarm**:
```bash
docker service create \
  --name registry \
  --publish published=5000,target=5000 \
  registry:2
```

2. **Tag dan Push image ke registry lokal**:
```bash
docker tag infra-health-intel:latest 127.0.0.1:5000/infra-health-intel:latest
docker push 127.0.0.1:5000/infra-health-intel:latest
```

3. **Deploy Swarm Stack dengan Image Lokal**:
```bash
IMAGE_NAME=127.0.0.1:5000/infra-health-intel:latest \
docker stack deploy -c docker-stack.yml infra
```

---

## 3. Opsi 1: Menjalankan dengan Standalone Docker

Jika hanya ingin menguji satu container di satu server:
```bash
docker run -d \
  --name infra-health-intel \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e GEMINI_API_KEY="kunci-api-anda" \
  infra-health-intel:latest
```

Verifikasi:
```bash
docker ps
docker logs -f infra-health-intel
curl -i http://localhost:3000/api/health
```

---

## 4. Opsi 2: Menjalankan dengan Docker Compose

Untuk server *single-node* produksi:
```bash
# Menjalankan di latar belakang (daemon)
docker compose up -d --build

# Melihat status container dan log
docker compose ps
docker compose logs -f

# Menghentikan aplikasi
docker compose down
```

---

## 5. Opsi 3: Orkestrasi Menggunakan Docker Swarm (Rekomendasi Produksi)

Docker Swarm menyediakan fitur bawaan:
- **High Availability (HA)** dengan replikasi lintas node fisik
- **Ingress Routing Mesh** (permintaan ke IP node mana pun akan diteruskan otomatis ke kontainer yang aktif)
- **Zero-Downtime Rolling Updates** (`order: start-first`)
- **Self-Healing & Auto-Restart** bila ada node atau container yang *crash*
- **Auto-Rollback** jika versi baru gagal melewati pemeriksaan `healthcheck`

### Langkah 1: Inisialisasi Swarm di Manager Node
Pada server pertama yang bertindak sebagai **Manager**:
```bash
# Ganti 192.168.1.10 dengan IP privat server manager Anda
docker swarm init --advertise-addr 192.168.1.10
```

Output terminal akan menampilkan perintah `join` token seperti ini:
```bash
docker swarm join --token SWMTKN-1-xxxx... 192.168.1.10:2377
```

### Langkah 2: Tambahkan Worker Node ke Kluster
Jalankan perintah token tadi di server-server worker (misal Worker-1, Worker-2, Worker-3):
```bash
docker swarm join --token SWMTKN-1-xxxx... 192.168.1.10:2377
```

Untuk melihat daftar semua node di Manager:
```bash
docker node ls
```

*(Opsional: Jika kluster Anda hanya memiliki 1 node manager dan ingin menjalankan aplikasi langsung di manager, hapus constraint `node.role == worker` di `docker-stack.yml` atau jalankan `docker node update --role worker <NODE_NAME>`)*.

### Langkah 3: Deploy Stack ke Docker Swarm
Siapkan variabel environment (jika menggunakan registry privat atau API key):
```bash
export IMAGE_NAME="registry.perusahaan.co.id/sre/infra-health:latest"
export GEMINI_API_KEY="kunci-api-anda"

# Deploy file konfigurasi stack
docker stack deploy -c docker-stack.yml infra-stack
```

### Langkah 4: Memantau Status Deployment Swarm
```bash
# 1. Cek daftar stack yang berjalan
docker stack ls

# 2. Cek status service dan jumlah replika (misal: 3/3 aktif)
docker stack services infra-stack

# 3. Cek sebaran replika kontainer di tiap node fisik
docker stack ps infra-stack

# 4. Cek log gabungan dari seluruh replika secara streaming
docker service logs -f infra-stack_app
```

---

## 6. Operasi Produksi Tingkat Lanjut (Day-2 Operations)

### A. Skalabilitas Dinamis (Scaling Out / In)
Menambah replika kontainer menjadi 5 instance tanpa downtime:
```bash
docker service scale infra-stack_app=5
```

### B. Rolling Update ke Versi Baru (Nol Downtime)
Ketika Anda merilis versi baru (misal `v1.1.0`), jalankan update:
```bash
docker service update \
  --image registry.perusahaan.co.id/sre/infra-health:v1.1.0 \
  --update-parallelism 1 \
  --update-delay 10s \
  --update-order start-first \
  infra-stack_app
```
*Swarm akan menyalakan kontainer versi baru dahulu, menunggu healthcheck lulus, lalu mematikan kontainer versi lama secara bertahap satu per satu.*

### C. Rollback Otomatis & Manual
Jika terjadi kendala pada rilis baru, kembalikan ke versi stabil sebelumnya:
```bash
docker service rollback infra-stack_app
```

### D. Perawatan Node (Node Maintenance / Drain)
Ketika Anda perlu mereboot atau meng-upgrade hardware server worker tertentu tanpa mengganggu traffic pengguna:
```bash
# Pindahkan semua beban kontainer dari node tersebut ke node lain
docker node update --availability drain worker-node-02

# Setelah maintenance selesai, aktifkan kembali
docker node update --availability active worker-node-02
```

### E. Menghapus / Undeploy Stack
```bash
docker stack rm infra-stack
```

---

## 7. Endpoint Verifikasi Sistem
- **Web UI & Dashboard**: `http://<IP-NODE-MANA-PUN>:3000`
- **Healthcheck REST API**: `http://<IP-NODE-MANA-PUN>:3000/api/health`
- **Hardware Telemetry**: `http://<IP-NODE-MANA-PUN>:3000/api/hardware`
- **Akun Login Bawaan**:
  - Username: `admin` | Password: `password123` (Peran: SRE Lead)
  - Username: `ops` | Password: `password123` (Peran: SysOps)
  - Username: `auditor` | Password: `password123` (Peran: Security Auditor)
