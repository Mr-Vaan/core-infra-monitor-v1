import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Layers, 
  Server, 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  Boxes, 
  Activity, 
  Cpu, 
  HardDrive, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Download,
  AlertCircle,
  CloudUpload,
  Globe,
  Key,
  Lock,
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';

interface SwarmDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SwarmDeploymentModal({ isOpen, onClose }: SwarmDeploymentModalProps) {
  const [activeTab, setActiveTab] = useState<'swarm' | 'dockerhub' | 'compose' | 'files' | 'firewall'>('dockerhub');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<'stack' | 'dockerfile' | 'compose'>('stack');
  const [dockerHubUser, setDockerHubUser] = useState<string>('username_anda');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerStackContent = `version: '3.8'

services:
  app:
    image: \${IMAGE_NAME:-infra-health-intel:latest}
    ports:
      - target: 3000
        published: 3000
        protocol: tcp
        mode: ingress
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY:-}
    networks:
      - infra-overlay-net
    deploy:
      mode: replicated
      replicas: 3
      endpoint_mode: vip
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        monitor: 15s
        max_failure_ratio: 0.1
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 10s
        order: stop-first
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 5
        window: 120s
      resources:
        limits:
          cpus: '1.5'
          memory: 1536M
        reservations:
          cpus: '0.25'
          memory: 384M
      placement:
        constraints:
          - node.role == worker
        preferences:
          - spread: node.id
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/api/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 15s

networks:
  infra-overlay-net:
    driver: overlay
    attachable: true
    driver_opts:
      encrypted: "true"`;

  const dockerfileContent = `# Multi-stage production Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
USER node
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`;

  const dockerComposeContent = `version: '3.8'

services:
  infra-health:
    build:
      context: .
      dockerfile: Dockerfile
    image: infra-health-intel:latest
    container_name: infra-health-intel
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY:-}
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2048M
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://127.0.0.1:3000/api/health"]
      interval: 20s
      timeout: 5s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"
    networks:
      - infra-network

networks:
  infra-network:
    driver: bridge`;

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Panduan Produksi: Deploy ke Docker & Docker Swarm
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-md">
                  High Availability
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi kluster multi-node, rolling updates tanpa downtime, dan healthcheck
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dockerhub')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dockerhub'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            <span>Docker Hub & Registry Setup</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full font-mono">Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('swarm')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'swarm'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Docker Swarm (Multi-Node HA)</span>
          </button>

          <button
            onClick={() => setActiveTab('compose')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'compose'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Docker Compose (Single Node)</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'files'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-4 h-4" />
            <span>File Konfigurasi</span>
          </button>

          <button
            onClick={() => setActiveTab('firewall')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'firewall'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Port Firewall</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB: DOCKER HUB SETUP */}
          {activeTab === 'dockerhub' && (
            <div className="space-y-6">
              {/* Introduction Card */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
                      <CloudUpload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        Kenapa Membutuhkan Docker Hub di Docker Swarm?
                      </h4>
                      <p className="text-xs text-slate-400">
                        Pada kluster Swarm multi-node, Worker Node berada di server fisik terpisah sehingga tidak dapat membaca image lokal di laptop atau server manager tanpa Registry.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Username Generator */}
                <div className="mt-3 p-3.5 bg-slate-950/80 border border-indigo-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Masukkan Username Docker Hub Anda (Untuk memperbarui perintah otomatis):
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">Contoh: ivandevops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-400">
                      hub.docker.com/u/
                    </span>
                    <input
                      type="text"
                      value={dockerHubUser}
                      onChange={(e) => setDockerHubUser(e.target.value.trim().toLowerCase() || 'username_anda')}
                      placeholder="username_anda"
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-indigo-500/50 focus:border-indigo-400 focus:outline-none rounded-lg text-xs font-mono text-indigo-200"
                    />
                  </div>
                </div>
              </div>

              {/* Step 1: Daftar Akun */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold border border-blue-500/30">1</span>
                    Langkah 1: Daftar Akun Docker Hub Gratis
                  </h4>
                  <a
                    href="https://hub.docker.com/signup"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    <span>Buka hub.docker.com/signup</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <p>1. Buka <strong>hub.docker.com/signup</strong> di browser Anda.</p>
                  <p>2. Masukkan <strong>Username</strong> unik (misalnya: <code className="text-indigo-300 font-mono">{dockerHubUser}</code>), Email, dan Password.</p>
                  <p>3. Verifikasi tautan konfirmasi yang dikirimkan ke email Anda.</p>
                  <p className="text-slate-400 text-2xs">Akun gratis Docker Hub mencakup 1 repositori privat dan repositori publik tanpa batas.</p>
                </div>
              </div>

              {/* Step 2: Buat Access Token (PAT) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold border border-blue-500/30">2</span>
                    Langkah 2: Buat Personal Access Token (PAT)
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">Rekomendasi Produksi</span>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <p>Docker Hub sangat menyarankan menggunakan <strong>Access Token</strong> (bukan password akun biasa) untuk terminal server:</p>
                  <p>1. Klik foto profil Anda di pojok kanan atas Docker Hub &gt; <strong>Account Settings</strong>.</p>
                  <p>2. Pilih menu <strong>Security</strong> di sidebar kiri &gt; Klik tombol <strong>New Access Token</strong>.</p>
                  <p>3. Beri deskripsi (contoh: <code className="text-indigo-300 font-mono">server-swarm-prod</code>) dan pilih izin <strong>Read &amp; Write</strong>.</p>
                  <p>4. Klik <strong>Generate</strong> dan salin token yang muncul (token ini hanya ditampilkan sekali).</p>
                </div>
              </div>

              {/* Step 3: Login Terminal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold border border-blue-500/30">3</span>
                    Langkah 3: Login Docker di Terminal Server
                  </h4>
                  <button
                    onClick={() => copyToClipboard(`docker login -u ${dockerHubUser}`, 'hub_login')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
                  >
                    {copiedKey === 'hub_login' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'hub_login' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto">
                  <code># Jalankan di terminal server Manager Anda:{'\n'}docker login -u {dockerHubUser}{'\n'}# Saat diminta Password, paste Personal Access Token (PAT) dari Langkah 2{'\n'}# Output sukses: Login Succeeded</code>
                </pre>
              </div>

              {/* Step 4: Build, Tag & Push */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold border border-blue-500/30">4</span>
                    Langkah 4: Build, Tag, dan Push Image ke Docker Hub
                  </h4>
                  <button
                    onClick={() => copyToClipboard(`docker build -t ${dockerHubUser}/infra-health-intel:latest .\ndocker push ${dockerHubUser}/infra-health-intel:latest`, 'hub_push')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
                  >
                    {copiedKey === 'hub_push' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'hub_push' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto">
                  <code># 1. Build image dengan tag nama akun Docker Hub:{'\n'}docker build -t {dockerHubUser}/infra-health-intel:latest .{'\n\n'}# 2. Upload (push) image ke Docker Hub:{'\n'}docker push {dockerHubUser}/infra-health-intel:latest</code>
                </pre>
              </div>

              {/* Step 5: Deploy dengan Registry Auth */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold border border-blue-500/30">5</span>
                    Langkah 5: Deploy Stack Swarm dengan Autentikasi Registry
                  </h4>
                  <button
                    onClick={() => copyToClipboard(`IMAGE_NAME=${dockerHubUser}/infra-health-intel:latest docker stack deploy -c docker-stack.yml --with-registry-auth infra`, 'hub_deploy')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
                  >
                    {copiedKey === 'hub_deploy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'hub_deploy' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto">
                  <code># Gunakan flag --with-registry-auth agar semua worker node otomatis dapat izin menarik image:{'\n'}IMAGE_NAME={dockerHubUser}/infra-health-intel:latest docker stack deploy -c docker-stack.yml --with-registry-auth infra</code>
                </pre>
              </div>

              {/* ALTERNATIVE: Local Private Registry */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h5 className="text-xs font-bold text-slate-200">
                    Opsi Alternatif: Local Private Registry (Tanpa Perlu Bikin Akun Docker Hub)
                  </h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jika server Anda berada di lingkungan on-premise, intranet tertutup, atau Anda tidak ingin membuat akun di luar, Anda dapat menjalankan <strong>Private Registry lokal</strong> langsung di dalam Docker Swarm hanya dalam 1 detik:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-300">1. Jalankan service registry lokal port 5000:</span>
                    <button
                      onClick={() => copyToClipboard('docker service create --name registry --publish published=5000,target=5000 registry:2', 'local_reg1')}
                      className="text-[11px] text-slate-400 hover:text-slate-200 font-mono"
                    >
                      {copiedKey === 'local_reg1' ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-emerald-300 overflow-x-auto">
                    <code>docker service create --name registry --publish published=5000,target=5000 registry:2</code>
                  </pre>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-300">2. Tag &amp; Push ke registry lokal:</span>
                    <button
                      onClick={() => copyToClipboard('docker tag infra-health-intel:latest 127.0.0.1:5000/infra-health-intel:latest && docker push 127.0.0.1:5000/infra-health-intel:latest', 'local_reg2')}
                      className="text-[11px] text-slate-400 hover:text-slate-200 font-mono"
                    >
                      {copiedKey === 'local_reg2' ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                    <code>docker tag infra-health-intel:latest 127.0.0.1:5000/infra-health-intel:latest{'\n'}docker push 127.0.0.1:5000/infra-health-intel:latest</code>
                  </pre>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-300">3. Deploy stack menggunakan image lokal tersebut:</span>
                    <button
                      onClick={() => copyToClipboard('IMAGE_NAME=127.0.0.1:5000/infra-health-intel:latest docker stack deploy -c docker-stack.yml infra', 'local_reg3')}
                      className="text-[11px] text-slate-400 hover:text-slate-200 font-mono"
                    >
                      {copiedKey === 'local_reg3' ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                    <code>IMAGE_NAME=127.0.0.1:5000/infra-health-intel:latest docker stack deploy -c docker-stack.yml infra</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DOCKER SWARM */}
          {activeTab === 'swarm' && (
            <div className="space-y-6">
              {/* Architecture Highlight Box */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Arsitektur Swarm: Replikasi Otomatis & Routing Mesh
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Setiap request HTTP port 3000 akan ditangani oleh <strong>Ingress Routing Mesh</strong> Docker Swarm dan didistribusikan secara round-robin ke 3 replika aktif pada node worker. Update rilis dilakukan dengan strategi <code className="text-indigo-300 font-mono">start-first</code> sehingga <strong>zero-downtime</strong> tercapai.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs font-mono text-indigo-300 whitespace-nowrap">
                  3 Replicas · Auto-Rollback
                </div>
              </div>

              {/* Step 1: Inisialisasi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[11px] font-bold">1</span>
                    Inisialisasi Swarm pada Manager Node
                  </h4>
                  <button
                    onClick={() => copyToClipboard('docker swarm init --advertise-addr <IP_MANAGER_SERVER>', 'step1')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
                  >
                    {copiedKey === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'step1' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto">
                  <code># Jalankan pada server pertama (Manager Node){'\n'}docker swarm init --advertise-addr 192.168.1.10</code>
                </pre>
              </div>

              {/* Step 2: Join Worker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[11px] font-bold">2</span>
                    Gabungkan Worker Node ke Kluster
                  </h4>
                  <button
                    onClick={() => copyToClipboard('docker swarm join-token worker', 'step2')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
                  >
                    {copiedKey === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'step2' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto">
                  <code># Dapatkan token dari Manager Node:{'\n'}docker swarm join-token worker{'\n\n'}# Jalankan perintah yang dihasilkan pada setiap server Worker:{'\n'}docker swarm join --token SWMTKN-1-xxxx... 192.168.1.10:2377</code>
                </pre>
              </div>

              {/* Step 3: Deploy Stack */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[11px] font-bold">3</span>
                    Deploy Stack Menggunakan docker-stack.yml
                  </h4>
                  <button
                    onClick={() => copyToClipboard('docker stack deploy -c docker-stack.yml infra-stack', 'step3')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
                  >
                    {copiedKey === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'step3' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto">
                  <code># Deploy stack ke swarm cluster (otomatis membuat 3 replika & encrypted overlay network){'\n'}docker stack deploy -c docker-stack.yml infra-stack</code>
                </pre>
              </div>

              {/* Step 4: Perintah Monitoring & Operasional */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[11px] font-bold">4</span>
                  Perintah Operasional & Day-2 Management
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">Cek Status Replikasi & Node</span>
                      <button 
                        onClick={() => copyToClipboard('docker stack services infra-stack && docker stack ps infra-stack', 'cmd1')}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {copiedKey === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-400 block bg-slate-900 p-2 rounded-lg">
                      docker stack services infra-stack{'\n'}docker stack ps infra-stack
                    </code>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">Scale Up / Down Replicas</span>
                      <button 
                        onClick={() => copyToClipboard('docker service scale infra-stack_app=5', 'cmd2')}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {copiedKey === 'cmd2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-400 block bg-slate-900 p-2 rounded-lg">
                      docker service scale infra-stack_app=5
                    </code>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">Rolling Update (Nol Downtime)</span>
                      <button 
                        onClick={() => copyToClipboard('docker service update --image registry.corp.id/infra-health:v2.0 infra-stack_app', 'cmd3')}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {copiedKey === 'cmd3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-400 block bg-slate-900 p-2 rounded-lg">
                      docker service update --image &lt;NEW_IMAGE&gt; infra-stack_app
                    </code>
                  </div>

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">Rollback Cepat Jika Error</span>
                      <button 
                        onClick={() => copyToClipboard('docker service rollback infra-stack_app', 'cmd4')}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {copiedKey === 'cmd4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <code className="text-[11px] font-mono text-slate-400 block bg-slate-900 p-2 rounded-lg">
                      docker service rollback infra-stack_app
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCKER COMPOSE */}
          {activeTab === 'compose' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Deployment Single-Host Menggunakan Docker Compose
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ideal untuk server tunggal (VPS / VM / Baremetal Standalone) sebelum beralih ke kluster Swarm multi-node.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">1. Jalankan Compose Daemon</span>
                  <button
                    onClick={() => copyToClipboard('docker compose up -d --build', 'c_run')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono"
                  >
                    {copiedKey === 'c_run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'c_run' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200">
                  <code>docker compose up -d --build</code>
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">2. Cek Log & Status Container</span>
                  <button
                    onClick={() => copyToClipboard('docker compose ps && docker compose logs -f', 'c_logs')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono"
                  >
                    {copiedKey === 'c_logs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'c_logs' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200">
                  <code>docker compose ps{'\n'}docker compose logs -f</code>
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">3. Stop & Bersihkan</span>
                  <button
                    onClick={() => copyToClipboard('docker compose down', 'c_down')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono"
                  >
                    {copiedKey === 'c_down' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'c_down' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200">
                  <code>docker compose down</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: FILE KONFIGURASI */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setSelectedFile('stack')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedFile === 'stack' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    docker-stack.yml (Swarm)
                  </button>
                  <button
                    onClick={() => setSelectedFile('dockerfile')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedFile === 'dockerfile' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Dockerfile (Multi-Stage)
                  </button>
                  <button
                    onClick={() => setSelectedFile('compose')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedFile === 'compose' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    docker-compose.yml
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = selectedFile === 'stack' ? dockerStackContent : selectedFile === 'dockerfile' ? dockerfileContent : dockerComposeContent;
                      copyToClipboard(text, 'file_content');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedKey === 'file_content' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'file_content' ? 'Tersalin' : 'Salin File'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedFile === 'stack') downloadFile('docker-stack.yml', dockerStackContent);
                      else if (selectedFile === 'dockerfile') downloadFile('Dockerfile', dockerfileContent);
                      else downloadFile('docker-compose.yml', dockerComposeContent);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 max-h-[360px] overflow-y-auto leading-relaxed">
                  <code>
                    {selectedFile === 'stack' && dockerStackContent}
                    {selectedFile === 'dockerfile' && dockerfileContent}
                    {selectedFile === 'compose' && dockerComposeContent}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: FIREWALL */}
          {activeTab === 'firewall' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <div className="font-bold">Wajib Dibuka Antar-Server Node Swarm</div>
                  <div className="mt-1 text-slate-300 leading-relaxed">
                    Jika server Anda berada di belakang firewall hardware (Fortinet, Cisco ASA) atau firewall software (UFW, Firewalld, iptables), pastikan port berikut dibuka untuk IP subnet kluster:
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-2xs">
                    <tr>
                      <th className="p-3">Port / Protokol</th>
                      <th className="p-3">Tujuan</th>
                      <th className="p-3">Fungsi Teknis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                    <tr>
                      <td className="p-3 font-bold text-indigo-400">TCP 2377</td>
                      <td className="p-3 font-sans">Swarm Management</td>
                      <td className="p-3 font-sans text-slate-400">Komunikasi Raft Consensus antar Manager Nodes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-400">TCP & UDP 7946</td>
                      <td className="p-3 font-sans">Node Discovery</td>
                      <td className="p-3 font-sans text-slate-400">Gossip protocol untuk pertukaran status & node health</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-400">UDP 4789</td>
                      <td className="p-3 font-sans">Overlay Network</td>
                      <td className="p-3 font-sans text-slate-400">Enkapsulasi paket VXLAN antar kontainer multi-host</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-400">TCP 3000</td>
                      <td className="p-3 font-sans">Aplikasi Web</td>
                      <td className="p-3 font-sans text-slate-400">Ingress routing mesh untuk dashboard dan API</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">Script Buka Port (UFW - Ubuntu / Debian)</span>
                  <button
                    onClick={() => copyToClipboard('sudo ufw allow 2377/tcp && sudo ufw allow 7946/tcp && sudo ufw allow 7946/udp && sudo ufw allow 4789/udp && sudo ufw allow 3000/tcp && sudo ufw reload', 'ufw')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 font-mono"
                  >
                    {copiedKey === 'ufw' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'ufw' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto">
                  <code>sudo ufw allow 2377/tcp{'\n'}sudo ufw allow 7946/tcp{'\n'}sudo ufw allow 7946/udp{'\n'}sudo ufw allow 4789/udp{'\n'}sudo ufw allow 3000/tcp{'\n'}sudo ufw reload</code>
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 text-2xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Dokumentasi lengkap tersimpan di file DEPLOY_DOCKER_SWARM.md</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
