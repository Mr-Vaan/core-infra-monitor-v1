import { ContainerInfo, DockerStack, DockerImage, ContainerTemplate, ContainerLogEntry, ContainerActivityLog } from '../types';

export const defaultContainers: ContainerInfo[] = [
  {
    id: 'a8f3b19c4d',
    name: 'traefik-proxy',
    image: 'traefik:v3.1.2',
    imageId: 'sha256:d9b28f80479b',
    state: 'running',
    status: 'Up 14 days (healthy)',
    created: '2026-09-15T08:20:00Z',
    stackName: 'edge-routing',
    ports: [
      { ip: '0.0.0.0', privatePort: 80, publicPort: 80, type: 'tcp' },
      { ip: '0.0.0.0', privatePort: 443, publicPort: 443, type: 'tcp' },
      { ip: '127.0.0.1', privatePort: 8080, publicPort: 8080, type: 'tcp' }
    ],
    mounts: [
      { type: 'bind', source: '/var/run/docker.sock', destination: '/var/run/docker.sock', mode: 'ro' },
      { type: 'volume', source: 'traefik_certificates', destination: '/etc/traefik/acme', mode: 'rw' }
    ],
    env: {
      TRAEFIK_API_DASHBOARD: 'true',
      TRAEFIK_ENTRYPOINTS_WEB_ADDRESS: ':80',
      TRAEFIK_ENTRYPOINTS_WEBSECURE_ADDRESS: ':443',
      TRAEFIK_CERTIFICATESRESOLVERS_MYRESOLVER_ACME_EMAIL: 'ops@infra-health.internal'
    },
    command: 'traefik --providers.docker=true --entrypoints.web.address=:80 --entrypoints.websecure.address=:443',
    stats: {
      cpuPercent: 1.4,
      memoryUsageBytes: 78643200, // ~75 MB
      memoryLimitBytes: 1073741824, // 1 GB
      memoryPercent: 7.3,
      networkRxBytes: 1425890000,
      networkTxBytes: 3840210000,
      blockReadBytes: 15400000,
      blockWriteBytes: 4200000,
      pids: 18,
      uptime: '14d 6h 32m'
    },
    vulnerabilities: { critical: 0, high: 0, medium: 1, low: 4 },
    healthStatus: 'healthy',
    restartPolicy: 'unless-stopped',
    updateAvailable: false
  },
  {
    id: 'c4e92a71f0',
    name: 'postgres-master',
    image: 'postgres:16.4-alpine',
    imageId: 'sha256:71a0e194bd11',
    state: 'running',
    status: 'Up 21 days (healthy)',
    created: '2026-09-08T12:00:00Z',
    stackName: 'data-tier',
    ports: [
      { ip: '0.0.0.0', privatePort: 5432, publicPort: 5432, type: 'tcp' }
    ],
    mounts: [
      { type: 'volume', source: 'pgdata_primary', destination: '/var/lib/postgresql/data', mode: 'rw' },
      { type: 'bind', source: '/etc/postgres/custom.conf', destination: '/etc/postgresql/postgresql.conf', mode: 'ro' }
    ],
    env: {
      POSTGRES_DB: 'infra_telemetry',
      POSTGRES_USER: 'admin_sys',
      POSTGRES_PASSWORD: '••••••••••••••••',
      PGDATA: '/var/lib/postgresql/data/pgdata',
      POSTGRES_INITDB_ARGS: '--data-checksums'
    },
    command: 'postgres -c config_file=/etc/postgresql/postgresql.conf',
    stats: {
      cpuPercent: 5.8,
      memoryUsageBytes: 524288000, // ~500 MB
      memoryLimitBytes: 4294967296, // 4 GB
      memoryPercent: 12.2,
      networkRxBytes: 890400000,
      networkTxBytes: 945200000,
      blockReadBytes: 284000000,
      blockWriteBytes: 742000000,
      pids: 32,
      uptime: '21d 18h 12m'
    },
    vulnerabilities: { critical: 0, high: 1, medium: 2, low: 5 },
    healthStatus: 'healthy',
    restartPolicy: 'always',
    updateAvailable: false
  },
  {
    id: 'f1d380e2b5',
    name: 'redis-cache',
    image: 'redis:7.2.5-alpine',
    imageId: 'sha256:4b9121c97a55',
    state: 'running',
    status: 'Up 21 days (healthy)',
    created: '2026-09-08T12:05:00Z',
    stackName: 'data-tier',
    ports: [
      { ip: '127.0.0.1', privatePort: 6379, publicPort: 6379, type: 'tcp' }
    ],
    mounts: [
      { type: 'volume', source: 'redis_cache_data', destination: '/data', mode: 'rw' }
    ],
    env: {
      ALLOW_EMPTY_PASSWORD: 'no',
      REDIS_MAXMEMORY: '512mb',
      REDIS_MAXMEMORY_POLICY: 'allkeys-lru'
    },
    command: 'redis-server --save 60 1 --loglevel notice',
    stats: {
      cpuPercent: 0.9,
      memoryUsageBytes: 48234496, // ~46 MB
      memoryLimitBytes: 536870912, // 512 MB
      memoryPercent: 8.9,
      networkRxBytes: 412000000,
      networkTxBytes: 681000000,
      blockReadBytes: 4200000,
      blockWriteBytes: 89000000,
      pids: 6,
      uptime: '21d 18h 7m'
    },
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 1 },
    healthStatus: 'healthy',
    restartPolicy: 'unless-stopped',
    updateAvailable: false
  },
  {
    id: 'b7c41e98d2',
    name: 'grafana-dashboard',
    image: 'grafana/grafana:11.2.0',
    imageId: 'sha256:f5e128cb4310',
    state: 'running',
    status: 'Up 11 days (healthy)',
    created: '2026-09-18T14:30:00Z',
    stackName: 'observability',
    ports: [
      { ip: '0.0.0.0', privatePort: 3000, publicPort: 3001, type: 'tcp' }
    ],
    mounts: [
      { type: 'volume', source: 'grafana_storage', destination: '/var/lib/grafana', mode: 'rw' },
      { type: 'bind', source: '/etc/grafana/provisioning', destination: '/etc/grafana/provisioning', mode: 'ro' }
    ],
    env: {
      GF_SECURITY_ADMIN_USER: 'admin',
      GF_USERS_ALLOW_SIGN_UP: 'false',
      GF_SERVER_DOMAIN: 'grafana.infra-health.internal',
      GF_INSTALL_PLUGINS: 'grafana-clock-panel,grafana-piechart-panel'
    },
    command: '/run.sh',
    stats: {
      cpuPercent: 2.1,
      memoryUsageBytes: 188743680, // ~180 MB
      memoryLimitBytes: 1073741824, // 1 GB
      memoryPercent: 17.5,
      networkRxBytes: 198000000,
      networkTxBytes: 254000000,
      blockReadBytes: 81000000,
      blockWriteBytes: 32000000,
      pids: 24,
      uptime: '11d 2h 45m'
    },
    vulnerabilities: { critical: 0, high: 0, medium: 2, low: 6 },
    healthStatus: 'healthy',
    restartPolicy: 'unless-stopped',
    updateAvailable: true
  },
  {
    id: 'e3a199f762',
    name: 'prometheus-core',
    image: 'prom/prometheus:v2.54.1',
    imageId: 'sha256:29c88210feaa',
    state: 'running',
    status: 'Up 11 days (healthy)',
    created: '2026-09-18T14:28:00Z',
    stackName: 'observability',
    ports: [
      { ip: '0.0.0.0', privatePort: 9090, publicPort: 9090, type: 'tcp' }
    ],
    mounts: [
      { type: 'volume', source: 'prometheus_tsdb', destination: '/prometheus', mode: 'rw' },
      { type: 'bind', source: '/etc/prometheus/prometheus.yml', destination: '/etc/prometheus/prometheus.yml', mode: 'ro' }
    ],
    env: {
      PROMETHEUS_STORAGE_TSDB_RETENTION_TIME: '30d'
    },
    command: '--config.file=/etc/prometheus/prometheus.yml --storage.tsdb.path=/prometheus --web.console.libraries=/usr/share/prometheus/console_libraries',
    stats: {
      cpuPercent: 4.7,
      memoryUsageBytes: 429916160, // ~410 MB
      memoryLimitBytes: 2147483648, // 2 GB
      memoryPercent: 20.0,
      networkRxBytes: 1240000000,
      networkTxBytes: 450000000,
      blockReadBytes: 190000000,
      blockWriteBytes: 650000000,
      pids: 19,
      uptime: '11d 2h 47m'
    },
    vulnerabilities: { critical: 0, high: 0, medium: 1, low: 3 },
    healthStatus: 'healthy',
    restartPolicy: 'unless-stopped',
    updateAvailable: false
  },
  {
    id: '9d2f44c8b0',
    name: 'ollama-local-ai',
    image: 'ollama/ollama:latest',
    imageId: 'sha256:55f891b0cc44',
    state: 'running',
    status: 'Up 3 days',
    created: '2026-10-17T03:15:00Z',
    stackName: 'self-hosted-services',
    ports: [
      { ip: '0.0.0.0', privatePort: 11434, publicPort: 11434, type: 'tcp' }
    ],
    mounts: [
      { type: 'volume', source: 'ollama_models', destination: '/root/.ollama', mode: 'rw' }
    ],
    env: {
      OLLAMA_ORIGINS: '*',
      OLLAMA_HOST: '0.0.0.0:11434',
      OLLAMA_KEEP_ALIVE: '24h'
    },
    command: 'ollama serve',
    stats: {
      cpuPercent: 18.2,
      memoryUsageBytes: 4509715660, // ~4.2 GB
      memoryLimitBytes: 17179869184, // 16 GB
      memoryPercent: 26.2,
      networkRxBytes: 78000000,
      networkTxBytes: 142000000,
      blockReadBytes: 1450000000,
      blockWriteBytes: 21000000,
      pids: 48,
      uptime: '3d 11h 20m'
    },
    vulnerabilities: { critical: 0, high: 1, medium: 3, low: 2 },
    healthStatus: 'none',
    restartPolicy: 'unless-stopped',
    updateAvailable: true
  },
  {
    id: '50e2a3c791',
    name: 'vaultwarden-server',
    image: 'vaultwarden/server:latest-alpine',
    imageId: 'sha256:9a3bf108dd83',
    state: 'running',
    status: 'Up 30 days (healthy)',
    created: '2026-08-30T09:00:00Z',
    stackName: 'self-hosted-services',
    ports: [
      { ip: '127.0.0.1', privatePort: 80, publicPort: 8081, type: 'tcp' }
    ],
    mounts: [
      { type: 'volume', source: 'vaultwarden_data', destination: '/data', mode: 'rw' }
    ],
    env: {
      SIGNUPS_ALLOWED: 'false',
      INVITATIONS_ALLOWED: 'true',
      ROCKET_PORT: '80',
      WEBSOCKET_ENABLED: 'true'
    },
    command: '/vaultwarden',
    stats: {
      cpuPercent: 0.3,
      memoryUsageBytes: 37748736, // ~36 MB
      memoryLimitBytes: 536870912, // 512 MB
      memoryPercent: 7.0,
      networkRxBytes: 32000000,
      networkTxBytes: 41000000,
      blockReadBytes: 11000000,
      blockWriteBytes: 19000000,
      pids: 8,
      uptime: '30d 14h 05m'
    },
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 2 },
    healthStatus: 'healthy',
    restartPolicy: 'always',
    updateAvailable: false
  },
  {
    id: '7c6a51d904',
    name: 'meilisearch-engine',
    image: 'getmeili/meilisearch:v1.9.0',
    imageId: 'sha256:332e185ab9f0',
    state: 'running',
    status: 'Up 18 days (healthy)',
    created: '2026-09-11T16:45:00Z',
    stackName: 'data-tier',
    ports: [
      { ip: '127.0.0.1', privatePort: 7700, publicPort: 7700, type: 'tcp' }
    ],
    mounts: [
      { type: 'volume', source: 'meili_data', destination: '/meili_data', mode: 'rw' }
    ],
    env: {
      MEILI_ENV: 'production',
      MEILI_NO_ANALYTICS: 'true',
      MEILI_MASTER_KEY: '••••••••••••••••'
    },
    command: 'meilisearch --db-path /meili_data',
    stats: {
      cpuPercent: 1.1,
      memoryUsageBytes: 125829120, // ~120 MB
      memoryLimitBytes: 1073741824, // 1 GB
      memoryPercent: 11.7,
      networkRxBytes: 145000000,
      networkTxBytes: 312000000,
      blockReadBytes: 74000000,
      blockWriteBytes: 45000000,
      pids: 14,
      uptime: '18d 7h 12m'
    },
    vulnerabilities: { critical: 0, high: 0, medium: 1, low: 3 },
    healthStatus: 'healthy',
    restartPolicy: 'unless-stopped',
    updateAvailable: false
  },
  {
    id: '2b4c8f1039',
    name: 'cadvisor-telemetry',
    image: 'gcr.io/cadvisor/cadvisor:v0.49.1',
    imageId: 'sha256:4421b0e9a712',
    state: 'running',
    status: 'Up 25 days',
    created: '2026-09-04T10:10:00Z',
    stackName: 'observability',
    ports: [
      { ip: '0.0.0.0', privatePort: 8080, publicPort: 8085, type: 'tcp' }
    ],
    mounts: [
      { type: 'bind', source: '/', destination: '/rootfs', mode: 'ro' },
      { type: 'bind', source: '/var/run', destination: '/var/run', mode: 'ro' },
      { type: 'bind', source: '/sys', destination: '/sys', mode: 'ro' },
      { type: 'bind', source: '/var/lib/docker/', destination: '/var/lib/docker', mode: 'ro' }
    ],
    env: {
      CADVISOR_HEALTHCHECK_URL: 'http://localhost:8080/healthz'
    },
    command: '/usr/bin/cadvisor -logtostderr',
    stats: {
      cpuPercent: 2.8,
      memoryUsageBytes: 94371840, // ~90 MB
      memoryLimitBytes: 536870912, // 512 MB
      memoryPercent: 17.5,
      networkRxBytes: 520000000,
      networkTxBytes: 980000000,
      blockReadBytes: 25000000,
      blockWriteBytes: 1200000,
      pids: 12,
      uptime: '25d 14h 22m'
    },
    vulnerabilities: { critical: 0, high: 1, medium: 2, low: 4 },
    healthStatus: 'none',
    restartPolicy: 'always',
    updateAvailable: false
  },
  {
    id: '8f12d49c71',
    name: 'portainer-agent',
    image: 'portainer/agent:2.20.3',
    imageId: 'sha256:1290e4fbc871',
    state: 'stopped',
    status: 'Exited (0) 2 days ago',
    created: '2026-08-15T10:00:00Z',
    ports: [
      { ip: '0.0.0.0', privatePort: 9001, publicPort: 9001, type: 'tcp' }
    ],
    mounts: [
      { type: 'bind', source: '/var/run/docker.sock', destination: '/var/run/docker.sock', mode: 'rw' },
      { type: 'volume', source: 'portainer_agent_data', destination: '/data', mode: 'rw' }
    ],
    env: {
      AGENT_PORT: '9001',
      LOG_LEVEL: 'INFO'
    },
    command: './agent',
    stats: {
      cpuPercent: 0,
      memoryUsageBytes: 0,
      memoryLimitBytes: 536870912,
      memoryPercent: 0,
      networkRxBytes: 12000000,
      networkTxBytes: 18000000,
      blockReadBytes: 3400000,
      blockWriteBytes: 1200000,
      pids: 0,
      uptime: '0s'
    },
    vulnerabilities: { critical: 1, high: 2, medium: 4, low: 7 },
    healthStatus: 'none',
    restartPolicy: 'no',
    updateAvailable: true
  },
  {
    id: '3c8e9f201a',
    name: 'gitlab-runner-worker',
    image: 'gitlab/gitlab-runner:alpine-v17.2.1',
    imageId: 'sha256:8812c30ef221',
    state: 'paused',
    status: 'Paused (maintenance window)',
    created: '2026-09-22T08:00:00Z',
    ports: [],
    mounts: [
      { type: 'bind', source: '/var/run/docker.sock', destination: '/var/run/docker.sock', mode: 'rw' },
      { type: 'volume', source: 'gitlab_runner_config', destination: '/etc/gitlab-runner', mode: 'rw' }
    ],
    env: {
      CI_SERVER_URL: 'https://gitlab.infra-health.internal',
      RUNNER_EXECUTOR: 'docker',
      REGISTER_NON_INTERACTIVE: 'true'
    },
    command: 'run --user=gitlab-runner --working-directory=/home/gitlab-runner',
    stats: {
      cpuPercent: 0.1,
      memoryUsageBytes: 41943040,
      memoryLimitBytes: 1073741824,
      memoryPercent: 3.9,
      networkRxBytes: 89000000,
      networkTxBytes: 94000000,
      blockReadBytes: 12000000,
      blockWriteBytes: 8000000,
      pids: 5,
      uptime: '8d 4h 10m'
    },
    vulnerabilities: { critical: 0, high: 0, medium: 1, low: 2 },
    healthStatus: 'none',
    restartPolicy: 'unless-stopped',
    updateAvailable: false
  },
  {
    id: 'f41c90e21b',
    name: 'legacy-memcached-cache',
    image: 'memcached:1.6-alpine',
    imageId: 'sha256:47c1a80d92ef',
    state: 'stopped',
    status: 'Di Tempat Sampah (Recycle Bin)',
    created: '2026-07-10T11:00:00Z',
    deletedAt: '2026-10-20T01:30:00Z',
    isDeleted: true,
    stackName: 'legacy-services',
    ports: [
      { ip: '127.0.0.1', privatePort: 11211, publicPort: 11211, type: 'tcp' }
    ],
    mounts: [],
    env: {
      MEMCACHED_MAX_MEMORY: '256m'
    },
    command: 'memcached -m 256',
    stats: {
      cpuPercent: 0,
      memoryUsageBytes: 0,
      memoryLimitBytes: 268435456,
      memoryPercent: 0,
      networkRxBytes: 1500000,
      networkTxBytes: 850000,
      blockReadBytes: 200000,
      blockWriteBytes: 100000,
      pids: 0,
      uptime: '0s'
    },
    vulnerabilities: { critical: 0, high: 0, medium: 2, low: 1 },
    healthStatus: 'none',
    restartPolicy: 'no',
    updateAvailable: false
  }
];

export const defaultStacks: DockerStack[] = [
  {
    id: 'stack-edge-routing',
    name: 'edge-routing',
    status: 'active',
    servicesCount: 1,
    containers: ['a8f3b19c4d'],
    updatedAt: '2026-10-18T10:30:00Z',
    composeYaml: `services:
  traefik:
    image: traefik:v3.1.2
    container_name: traefik-proxy
    restart: unless-stopped
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
    ports:
      - "80:80"
      - "443:443"
      - "127.0.0.1:8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "traefik_certificates:/etc/traefik/acme"

volumes:
  traefik_certificates:`
  },
  {
    id: 'stack-data-tier',
    name: 'data-tier',
    status: 'active',
    servicesCount: 3,
    containers: ['c4e92a71f0', 'f1d380e2b5', '7c6a51d904'],
    updatedAt: '2026-10-15T14:10:00Z',
    composeYaml: `services:
  postgres:
    image: postgres:16.4-alpine
    container_name: postgres-master
    restart: always
    environment:
      POSTGRES_DB: infra_telemetry
      POSTGRES_USER: admin_sys
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - pgdata_primary:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7.2.5-alpine
    container_name: redis-cache
    restart: unless-stopped
    command: redis-server --save 60 1 --loglevel notice
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_cache_data:/data

  meilisearch:
    image: getmeili/meilisearch:v1.9.0
    container_name: meilisearch-engine
    restart: unless-stopped
    environment:
      MEILI_ENV: production
      MEILI_MASTER_KEY: \${MEILI_MASTER_KEY}
    volumes:
      - meili_data:/meili_data
    ports:
      - "127.0.0.1:7700:7700"

volumes:
  pgdata_primary:
  redis_cache_data:
  meili_data:`
  },
  {
    id: 'stack-observability',
    name: 'observability',
    status: 'active',
    servicesCount: 3,
    containers: ['b7c41e98d2', 'e3a199f762', '2b4c8f1039'],
    updatedAt: '2026-10-12T09:15:00Z',
    composeYaml: `services:
  prometheus:
    image: prom/prometheus:v2.54.1
    container_name: prometheus-core
    restart: unless-stopped
    volumes:
      - prometheus_tsdb:/prometheus
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:11.2.0
    container_name: grafana-dashboard
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - grafana_storage:/var/lib/grafana
    depends_on:
      - prometheus

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    container_name: cadvisor-telemetry
    restart: always
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    ports:
      - "8085:8080"

volumes:
  prometheus_tsdb:
  grafana_storage:`
  },
  {
    id: 'stack-self-hosted-services',
    name: 'self-hosted-services',
    status: 'active',
    servicesCount: 2,
    containers: ['9d2f44c8b0', '50e2a3c791'],
    updatedAt: '2026-10-17T03:10:00Z',
    composeYaml: `services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama-local-ai
    restart: unless-stopped
    environment:
      OLLAMA_ORIGINS: "*"
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama

  vaultwarden:
    image: vaultwarden/server:latest-alpine
    container_name: vaultwarden-server
    restart: always
    environment:
      SIGNUPS_ALLOWED: "false"
    ports:
      - "127.0.0.1:8081:80"
    volumes:
      - vaultwarden_data:/data

volumes:
  ollama_models:
  vaultwarden_data:`
  }
];

export const defaultImages: DockerImage[] = [
  {
    id: 'sha256:d9b28f80479b',
    repository: 'traefik',
    tag: 'v3.1.2',
    sizeMB: 154,
    created: '2026-08-20',
    inUse: true,
    updateAvailable: false,
    vulnerabilities: { critical: 0, high: 0, medium: 1, low: 4 }
  },
  {
    id: 'sha256:71a0e194bd11',
    repository: 'postgres',
    tag: '16.4-alpine',
    sizeMB: 284,
    created: '2026-08-15',
    inUse: true,
    updateAvailable: false,
    vulnerabilities: { critical: 0, high: 1, medium: 2, low: 5 }
  },
  {
    id: 'sha256:4b9121c97a55',
    repository: 'redis',
    tag: '7.2.5-alpine',
    sizeMB: 48,
    created: '2026-07-29',
    inUse: true,
    updateAvailable: false,
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 1 }
  },
  {
    id: 'sha256:f5e128cb4310',
    repository: 'grafana/grafana',
    tag: '11.2.0',
    sizeMB: 395,
    created: '2026-08-28',
    inUse: true,
    updateAvailable: true,
    vulnerabilities: { critical: 0, high: 0, medium: 2, low: 6 }
  },
  {
    id: 'sha256:29c88210feaa',
    repository: 'prom/prometheus',
    tag: 'v2.54.1',
    sizeMB: 242,
    created: '2026-08-10',
    inUse: true,
    updateAvailable: false,
    vulnerabilities: { critical: 0, high: 0, medium: 1, low: 3 }
  },
  {
    id: 'sha256:55f891b0cc44',
    repository: 'ollama/ollama',
    tag: 'latest',
    sizeMB: 1980,
    created: '2026-10-10',
    inUse: true,
    updateAvailable: true,
    vulnerabilities: { critical: 0, high: 1, medium: 3, low: 2 }
  },
  {
    id: 'sha256:9a3bf108dd83',
    repository: 'vaultwarden/server',
    tag: 'latest-alpine',
    sizeMB: 98,
    created: '2026-08-12',
    inUse: true,
    updateAvailable: false,
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 2 }
  },
  {
    id: 'sha256:1290e4fbc871',
    repository: 'portainer/agent',
    tag: '2.20.3',
    sizeMB: 32,
    created: '2026-06-15',
    inUse: false,
    updateAvailable: true,
    vulnerabilities: { critical: 1, high: 2, medium: 4, low: 7 }
  },
  {
    id: 'sha256:bb01289cf122',
    repository: 'node',
    tag: '20-alpine',
    sizeMB: 180,
    created: '2026-05-10',
    inUse: false,
    updateAvailable: true,
    vulnerabilities: { critical: 0, high: 2, medium: 5, low: 8 }
  }
];

export const defaultTemplates: ContainerTemplate[] = [
  {
    id: 'tpl-postgres',
    title: 'PostgreSQL 16 High-Performance',
    category: 'Databases',
    description: 'Battle-tested relational database with tuned memory defaults and checksum validation.',
    image: 'postgres:16-alpine',
    defaultPorts: ['5432:5432'],
    composeYaml: `services:
  postgres:
    image: postgres:16-alpine
    container_name: postgres-app
    restart: unless-stopped
    environment:
      POSTGRES_DB: app_db
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:`,
    envDefaults: [
      { key: 'POSTGRES_DB', defaultValue: 'app_db', description: 'Initial database name' },
      { key: 'POSTGRES_USER', defaultValue: 'postgres', description: 'Admin user' },
      { key: 'POSTGRES_PASSWORD', defaultValue: 'SecureDbPass123!', description: 'Strong database password' }
    ]
  },
  {
    id: 'tpl-redis',
    title: 'Redis 7 In-Memory Cache',
    category: 'Databases',
    description: 'Lightning-fast key-value cache and pub/sub message broker with LRU memory eviction.',
    image: 'redis:7.2-alpine',
    defaultPorts: ['6379:6379'],
    composeYaml: `services:
  redis:
    image: redis:7.2-alpine
    container_name: redis-cache
    restart: unless-stopped
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:`,
    envDefaults: []
  },
  {
    id: 'tpl-grafana-prom',
    title: 'Grafana & Prometheus Stack',
    category: 'Monitoring',
    description: 'Complete metrics collection and visualization dashboard suite for systems telemetry.',
    image: 'grafana/grafana:latest',
    defaultPorts: ['3000:3000', '9090:9090'],
    composeYaml: `services:
  prometheus:
    image: prom/prometheus:v2.54.1
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - prom_data:/prometheus

  grafana:
    image: grafana/grafana:11.2.0
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prom_data:
  grafana_data:`,
    envDefaults: [
      { key: 'GF_SECURITY_ADMIN_PASSWORD', defaultValue: 'admin123', description: 'Grafana initial admin password' }
    ]
  },
  {
    id: 'tpl-vaultwarden',
    title: 'Vaultwarden Password Manager',
    category: 'Security',
    description: 'Lightweight Bitwarden server written in Rust, ideal for self-hosted secrets & credential sharing.',
    image: 'vaultwarden/server:latest-alpine',
    defaultPorts: ['8080:80'],
    composeYaml: `services:
  vaultwarden:
    image: vaultwarden/server:latest-alpine
    container_name: vaultwarden
    restart: always
    environment:
      SIGNUPS_ALLOWED: "false"
      INVITATIONS_ALLOWED: "true"
    ports:
      - "8080:80"
    volumes:
      - vaultwarden_data:/data

volumes:
  vaultwarden_data:`,
    envDefaults: [
      { key: 'SIGNUPS_ALLOWED', defaultValue: 'false', description: 'Allow new public signups' }
    ]
  },
  {
    id: 'tpl-traefik',
    title: 'Traefik v3 Edge Router',
    category: 'Web Servers',
    description: 'Cloud-native reverse proxy with automated Let’s Encrypt SSL and dynamic Docker label discovery.',
    image: 'traefik:v3.1',
    defaultPorts: ['80:80', '443:443', '8080:8080'],
    composeYaml: `services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro`,
    envDefaults: []
  },
  {
    id: 'tpl-ollama',
    title: 'Ollama Local LLM Engine',
    category: 'AI & Tools',
    description: 'Run deep reasoning models (Llama 3, Mistral, Qwen, DeepSeek) locally on CPU or GPU inside Docker.',
    image: 'ollama/ollama:latest',
    defaultPorts: ['11434:11434'],
    composeYaml: `services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    environment:
      OLLAMA_ORIGINS: "*"

volumes:
  ollama_models:`,
    envDefaults: [
      { key: 'OLLAMA_ORIGINS', defaultValue: '*', description: 'CORS origins allowlist' }
    ]
  }
];

export const mockContainerLogs: Record<string, ContainerLogEntry[]> = {
  'a8f3b19c4d': [
    { timestamp: '2026-10-20T09:12:01.002Z', stream: 'stdout', message: 'time="2026-10-20T09:12:01Z" level=info msg="Configuration loaded from flags."' },
    { timestamp: '2026-10-20T09:12:01.005Z', stream: 'stdout', message: 'time="2026-10-20T09:12:01Z" level=info msg="Starting provider aggregator aggregator.ProviderAggregator"' },
    { timestamp: '2026-10-20T09:12:01.010Z', stream: 'stdout', message: 'time="2026-10-20T09:12:01Z" level=info msg="Starting provider *docker.Provider"' },
    { timestamp: '2026-10-20T09:12:01.120Z', stream: 'stdout', message: 'time="2026-10-20T09:12:01Z" level=info msg="Provider connection established with Docker 27.2.0"' },
    { timestamp: '2026-10-20T09:12:02.301Z', stream: 'stdout', message: 'time="2026-10-20T09:12:02Z" level=info msg="Entrypoint web listening on :80"' },
    { timestamp: '2026-10-20T09:12:02.302Z', stream: 'stdout', message: 'time="2026-10-20T09:12:02Z" level=info msg="Entrypoint websecure listening on :443"' },
    { timestamp: '2026-10-20T09:30:15.820Z', stream: 'stdout', message: '192.168.1.104 - - [20/Oct/2026:09:30:15 +0000] "GET /healthz HTTP/1.1" 200 14 "-" "Kube-Probe/1.30"' },
    { timestamp: '2026-10-20T09:35:44.112Z', stream: 'stdout', message: '192.168.1.52 - - [20/Oct/2026:09:35:44 +0000] "GET /api/v1/metrics HTTP/2.0" 200 458 "-" "Prometheus/2.54.1"' },
    { timestamp: '2026-10-20T09:40:02.990Z', stream: 'stdout', message: 'time="2026-10-20T09:40:02Z" level=info msg="ACME certificate renewed successfully for *.infra-health.internal"' }
  ],
  'c4e92a71f0': [
    { timestamp: '2026-10-20T08:00:00.100Z', stream: 'stdout', message: 'PostgreSQL database server initialized [16.4 Alpine Linux]' },
    { timestamp: '2026-10-20T08:00:01.210Z', stream: 'stdout', message: '2026-10-20 08:00:01.210 UTC [1] LOG:  starting PostgreSQL 16.4 on x86_64-pc-linux-musl' },
    { timestamp: '2026-10-20T08:00:01.220Z', stream: 'stdout', message: '2026-10-20 08:00:01.220 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432' },
    { timestamp: '2026-10-20T08:00:01.250Z', stream: 'stdout', message: '2026-10-20 08:00:01.250 UTC [1] LOG:  database system was properly shut down; ready to accept connections' },
    { timestamp: '2026-10-20T09:15:32.410Z', stream: 'stdout', message: '2026-10-20 09:15:32.410 UTC [28] LOG:  checkpoint starting: time' },
    { timestamp: '2026-10-20T09:15:34.900Z', stream: 'stdout', message: '2026-10-20 09:15:34.900 UTC [28] LOG:  checkpoint complete: wrote 418 buffers (2.6%); 0 WAL file(s) added, 0 removed' },
    { timestamp: '2026-10-20T09:42:11.005Z', stream: 'stdout', message: '2026-10-20 09:42:11.005 UTC [119] LOG:  connection authorized: user=admin_sys database=infra_telemetry application_name=telemetry_worker' }
  ],
  'f1d380e2b5': [
    { timestamp: '2026-10-20T08:05:00.001Z', stream: 'stdout', message: '1:M 20 Oct 2026 08:05:00.001 * Running mode=standalone, port=6379.' },
    { timestamp: '2026-10-20T08:05:00.002Z', stream: 'stdout', message: '1:M 20 Oct 2026 08:05:00.002 # Server initialized' },
    { timestamp: '2026-10-20T08:05:00.003Z', stream: 'stdout', message: '1:M 20 Oct 2026 08:05:00.003 * Ready to accept connections tcp' },
    { timestamp: '2026-10-20T09:20:00.050Z', stream: 'stdout', message: '1:M 20 Oct 2026 09:20:00.050 * 10000 changes in 60 seconds. Saving...' },
    { timestamp: '2026-10-20T09:20:00.120Z', stream: 'stdout', message: '1:M 20 Oct 2026 09:20:00.120 * Background saving started by pid 44' },
    { timestamp: '2026-10-20T09:20:00.320Z', stream: 'stdout', message: '1:M 20 Oct 2026 09:20:00.320 * DB saved on disk' },
    { timestamp: '2026-10-20T09:20:00.325Z', stream: 'stdout', message: '1:M 20 Oct 2026 09:20:00.325 * RDB: 1.84 MB memory allocated by AOF/RDB' }
  ],
  '9d2f44c8b0': [
    { timestamp: '2026-10-20T08:10:00.000Z', stream: 'stdout', message: 'time=2026-10-20T08:10:00.000Z level=INFO source=images.go:732 msg="total blobs: 12"' },
    { timestamp: '2026-10-20T08:10:00.015Z', stream: 'stdout', message: 'time=2026-10-20T08:10:00.015Z level=INFO source=server.go:582 msg="Listening on 0.0.0.0:11434 (version 0.3.12)"' },
    { timestamp: '2026-10-20T09:05:12.440Z', stream: 'stdout', message: 'time=2026-10-20T09:05:12.440Z level=INFO source=sched.go:338 msg="loaded model llama3.1:8b (size: 4.7 GB, runner: cpu_avx2)"' },
    { timestamp: '2026-10-20T09:05:14.990Z', stream: 'stdout', message: 'time=2026-10-20T09:05:14.990Z level=INFO source=server.go:610 msg="[GIN] 2026/10/20 - 09:05:14 | 200 | 2.54s | 127.0.0.1 | POST /api/generate"' }
  ]
};

export const defaultContainerActivityLogs: ContainerActivityLog[] = [
  {
    id: 'act-109',
    timestamp: '2026-10-20T10:14:22Z',
    containerId: 'f41c90e21b',
    containerName: 'legacy-memcached-cache',
    image: 'memcached:1.6-alpine',
    eventType: 'SOFT_DELETE',
    actor: 'admin@core-infra.internal',
    ipAddress: '10.244.0.1',
    status: 'WARNING',
    summary: 'Container dipindahkan ke Tempat Sampah (Recycle Bin) untuk decommissioning',
    details: { reason: 'Migrated to Redis cluster', previousState: 'stopped' }
  },
  {
    id: 'act-108',
    timestamp: '2026-10-20T09:42:15Z',
    containerId: 'c4e92a71f0',
    containerName: 'postgres-primary-db',
    image: 'postgres:16.4-alpine',
    eventType: 'HEALTH_CHECK',
    actor: 'system-daemon',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    summary: 'Healthcheck berkala pg_isready sukses respon dalam 4ms',
    details: { connections: 18, buffersHitRatio: '99.8%' }
  },
  {
    id: 'act-107',
    timestamp: '2026-10-20T09:22:40Z',
    containerId: 'a8f3b19c4d',
    containerName: 'traefik-proxy',
    image: 'traefik:v3.1.2',
    eventType: 'CONFIG_CHANGE',
    actor: 'admin@core-infra.internal',
    ipAddress: '192.168.1.100',
    status: 'SUCCESS',
    summary: 'Pembaruan middleware TLS certificate resolver dan dynamic route reload',
    details: { domain: '*.infra-health.internal', entrypoints: ['web', 'websecure'] }
  },
  {
    id: 'act-106',
    timestamp: '2026-10-20T09:05:12Z',
    containerId: '9d2f44c8b0',
    containerName: 'ollama-local-ai',
    image: 'ollama/ollama:latest',
    eventType: 'EXEC_COMMAND',
    actor: 'devops-lead',
    ipAddress: '192.168.1.45',
    status: 'SUCCESS',
    summary: 'Model llama3.1:8b diinisialisasi ke memori runner avx2',
    details: { command: 'ollama run llama3.1:8b', memoryAllocated: '4.7GB' }
  },
  {
    id: 'act-105',
    timestamp: '2026-10-20T08:45:00Z',
    containerId: 'b7c2d91e84',
    containerName: 'grafana-observability',
    image: 'grafana/grafana-oss:11.2.0',
    eventType: 'RESTART',
    actor: 'admin@core-infra.internal',
    ipAddress: '192.168.1.100',
    status: 'SUCCESS',
    summary: 'Container direstart untuk pembaruan plugin grafana-piechart',
    details: { exitCode: 0, restartTimeMs: 1240 }
  },
  {
    id: 'act-104',
    timestamp: '2026-10-20T08:15:30Z',
    containerId: '50e2a3c791',
    containerName: 'vaultwarden-server',
    image: 'vaultwarden/server:latest-alpine',
    eventType: 'EDIT',
    actor: 'secops-admin',
    ipAddress: '10.244.0.15',
    status: 'SUCCESS',
    summary: 'Perubahan parameter environment SIGNUPS_ALLOWED diset ke false',
    details: { modifiedKeys: ['SIGNUPS_ALLOWED', 'ROCKET_PORT'] }
  },
  {
    id: 'act-103',
    timestamp: '2026-10-20T07:30:10Z',
    containerId: '8f12d49c71',
    containerName: 'portainer-agent',
    image: 'portainer/agent:2.20.3',
    eventType: 'STOP',
    actor: 'system-scheduler',
    ipAddress: '127.0.0.1',
    status: 'INFO',
    summary: 'Container dihentikan sesuai jadwal maintenance windows',
    details: { reason: 'scheduled maintenance' }
  },
  {
    id: 'act-102',
    timestamp: '2026-10-20T06:50:00Z',
    containerId: 'f1d380e2b5',
    containerName: 'redis-cache-cluster',
    image: 'redis:7.4-alpine',
    eventType: 'START',
    actor: 'system-daemon',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    summary: 'Container Redis cache cluster berhasil dimulai pada port 6379',
    details: { maxMemory: '2gb', policy: 'allkeys-lru' }
  },
  {
    id: 'act-101',
    timestamp: '2026-10-20T06:00:00Z',
    containerId: 'c4e92a71f0',
    containerName: 'postgres-primary-db',
    image: 'postgres:16.4-alpine',
    eventType: 'DIAGNOSTIC_AUDIT',
    actor: 'trivy-scanner',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    summary: 'Pemeriksaan keamanan CVE Trivy: 0 Critical, 0 High vulnerability',
    details: { target: 'alpine:3.20', totalScanned: 184 }
  },
  {
    id: 'act-100',
    timestamp: '2026-10-19T22:10:00Z',
    containerId: '7c6a51d904',
    containerName: 'meilisearch-engine',
    image: 'getmeili/meilisearch:v1.9.0',
    eventType: 'CREATE',
    actor: 'admin@core-infra.internal',
    ipAddress: '192.168.1.100',
    status: 'SUCCESS',
    summary: 'Container baru meilisearch-engine berhasil dibuat dan dideploy ke stack data-tier',
    details: { port: 7700, volume: 'meili_data' }
  }
];

