import { K8sCluster } from '../types';

export const defaultK8sClusters: K8sCluster[] = [
  {
    id: 'k8s-prod-jkt-01',
    name: 'K8s-Prod-JKT-01',
    context: 'kubernetes-admin@k8s-prod-jkt-01',
    provider: 'Baremetal HA Cluster (Equinix DC Jakarta)',
    version: 'v1.30.2',
    apiServerUrl: 'https://k8s-api.jkt-dc.corp:6443',
    status: 'WARNING',
    cniPlugin: 'Cilium',
    ingressController: 'ingress-nginx (v1.10.1)',
    summary: {
      nodeCount: { ready: 5, total: 5 },
      podCount: { running: 78, pending: 2, failed: 1, total: 81 },
      namespaceCount: 8,
      cpu: {
        capacityCores: 160,
        requestedCores: 98,
        limitCores: 135,
        usageCores: 68.4,
        usagePercent: 42.8,
        requestedPercent: 61.2
      },
      memory: {
        capacityBytes: 640 * 1024 * 1024 * 1024, // 640 GB
        requestedBytes: 412 * 1024 * 1024 * 1024, // 412 GB
        limitBytes: 520 * 1024 * 1024 * 1024,
        usageBytes: 374 * 1024 * 1024 * 1024, // 374 GB
        usagePercent: 58.4,
        requestedPercent: 64.3
      },
      network: {
        rxRateMBs: 184.2,
        txRateMBs: 236.7,
        podIpsAllocated: 81,
        maxPodIps: 512
      },
      storagePvc: {
        totalPvcs: 14,
        boundPvcs: 13,
        pendingPvcs: 1,
        capacityGB: 3400,
        usedGB: 2180
      }
    },
    controlPlane: [
      {
        name: 'kube-apiserver',
        status: 'Healthy',
        replicas: '3/3 HA',
        version: 'v1.30.2',
        latencyMs: 1.8,
        message: 'Endpoint quorum aktif pada 3 master nodes'
      },
      {
        name: 'etcd-cluster',
        status: 'Healthy',
        replicas: '3/3 Members',
        version: '3.5.13',
        latencyMs: 2.1,
        message: 'Raft consensus leader: k8s-master-01 (Term 48)'
      },
      {
        name: 'kube-scheduler',
        status: 'Healthy',
        replicas: '3/3 Active/Standby',
        version: 'v1.30.2',
        latencyMs: 0.9,
        message: 'Leader elected: k8s-master-02'
      },
      {
        name: 'kube-controller-manager',
        status: 'Healthy',
        replicas: '3/3 Active/Standby',
        version: 'v1.30.2',
        latencyMs: 1.2,
        message: 'Reconciliation loop synchronized'
      },
      {
        name: 'coredns',
        status: 'Healthy',
        replicas: '3/3 Pods',
        version: 'v1.11.1',
        latencyMs: 0.4,
        message: 'DNS resolution cache hit 99.4%'
      },
      {
        name: 'cilium-ebpf-agent',
        status: 'Healthy',
        replicas: '5/5 DaemonSet',
        version: 'v1.15.5',
        latencyMs: 0.2,
        message: 'eBPF Host Routing & Wireguard encryption active'
      }
    ],
    nodes: [
      {
        name: 'k8s-master-01',
        role: 'control-plane',
        status: 'Ready',
        internalIp: '10.240.10.11',
        osImage: 'Ubuntu 24.04 LTS (Noble Numbat)',
        kernelVersion: '6.8.0-38-generic',
        kubeletVersion: 'v1.30.2',
        containerRuntime: 'containerd://1.7.18',
        uptime: '84 Hari',
        cordoned: false,
        taints: [
          { key: 'node-role.kubernetes.io/control-plane', effect: 'NoSchedule' }
        ],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' },
          { type: 'MemoryPressure', status: 'False', reason: 'KubeletHasSufficientMemory', message: 'kubelet has sufficient memory available' },
          { type: 'DiskPressure', status: 'False', reason: 'KubeletHasNoDiskPressure', message: 'kubelet has no disk pressure' },
          { type: 'PIDPressure', status: 'False', reason: 'KubeletHasSufficientPID', message: 'kubelet has sufficient PID available' }
        ],
        capacity: { cpuCores: 16, memoryBytes: 64 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 15.6, memoryBytes: 62 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 3.2, cpuPercent: 20.5, memoryBytes: 18 * 1024 * 1024 * 1024, memoryPercent: 29.0, podsCount: 14 }
      },
      {
        name: 'k8s-master-02',
        role: 'control-plane',
        status: 'Ready',
        internalIp: '10.240.10.12',
        osImage: 'Ubuntu 24.04 LTS (Noble Numbat)',
        kernelVersion: '6.8.0-38-generic',
        kubeletVersion: 'v1.30.2',
        containerRuntime: 'containerd://1.7.18',
        uptime: '84 Hari',
        cordoned: false,
        taints: [
          { key: 'node-role.kubernetes.io/control-plane', effect: 'NoSchedule' }
        ],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' },
          { type: 'MemoryPressure', status: 'False', reason: 'KubeletHasSufficientMemory', message: 'kubelet has sufficient memory' },
          { type: 'DiskPressure', status: 'False', reason: 'KubeletHasNoDiskPressure', message: 'kubelet has no disk pressure' },
          { type: 'PIDPressure', status: 'False', reason: 'KubeletHasSufficientPID', message: 'kubelet has sufficient PID' }
        ],
        capacity: { cpuCores: 16, memoryBytes: 64 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 15.6, memoryBytes: 62 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 2.8, cpuPercent: 17.9, memoryBytes: 16.5 * 1024 * 1024 * 1024, memoryPercent: 26.6, podsCount: 12 }
      },
      {
        name: 'k8s-worker-01',
        role: 'worker',
        status: 'Ready',
        internalIp: '10.240.10.21',
        osImage: 'Ubuntu 24.04 LTS (Noble Numbat)',
        kernelVersion: '6.8.0-38-generic',
        kubeletVersion: 'v1.30.2',
        containerRuntime: 'containerd://1.7.18',
        uptime: '42 Hari',
        cordoned: false,
        taints: [],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' },
          { type: 'MemoryPressure', status: 'False', reason: 'KubeletHasSufficientMemory', message: 'kubelet has sufficient memory' },
          { type: 'DiskPressure', status: 'False', reason: 'KubeletHasNoDiskPressure', message: 'kubelet has no disk pressure' },
          { type: 'PIDPressure', status: 'False', reason: 'KubeletHasSufficientPID', message: 'kubelet has sufficient PID' }
        ],
        capacity: { cpuCores: 48, memoryBytes: 192 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 46.8, memoryBytes: 188 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 24.2, cpuPercent: 51.7, memoryBytes: 118 * 1024 * 1024 * 1024, memoryPercent: 62.7, podsCount: 22 }
      },
      {
        name: 'k8s-worker-02',
        role: 'worker',
        status: 'Ready',
        internalIp: '10.240.10.22',
        osImage: 'Ubuntu 24.04 LTS (Noble Numbat)',
        kernelVersion: '6.8.0-38-generic',
        kubeletVersion: 'v1.30.2',
        containerRuntime: 'containerd://1.7.18',
        uptime: '42 Hari',
        cordoned: false,
        taints: [],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' },
          { type: 'MemoryPressure', status: 'False', reason: 'KubeletHasSufficientMemory', message: 'kubelet has sufficient memory' },
          { type: 'DiskPressure', status: 'False', reason: 'KubeletHasNoDiskPressure', message: 'kubelet has no disk pressure' },
          { type: 'PIDPressure', status: 'False', reason: 'KubeletHasSufficientPID', message: 'kubelet has sufficient PID' }
        ],
        capacity: { cpuCores: 48, memoryBytes: 192 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 46.8, memoryBytes: 188 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 31.8, cpuPercent: 67.9, memoryBytes: 142 * 1024 * 1024 * 1024, memoryPercent: 75.5, podsCount: 26 }
      },
      {
        name: 'k8s-worker-03',
        role: 'worker',
        status: 'Ready',
        internalIp: '10.240.10.23',
        osImage: 'Ubuntu 24.04 LTS (Noble Numbat)',
        kernelVersion: '6.8.0-38-generic',
        kubeletVersion: 'v1.30.2',
        containerRuntime: 'containerd://1.7.18',
        uptime: '18 Hari',
        cordoned: false,
        taints: [],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' },
          { type: 'MemoryPressure', status: 'False', reason: 'KubeletHasSufficientMemory', message: 'kubelet has sufficient memory' },
          { type: 'DiskPressure', status: 'False', reason: 'KubeletHasNoDiskPressure', message: 'kubelet has no disk pressure' },
          { type: 'PIDPressure', status: 'False', reason: 'KubeletHasSufficientPID', message: 'kubelet has sufficient PID' }
        ],
        capacity: { cpuCores: 32, memoryBytes: 128 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 31.2, memoryBytes: 124 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 6.4, cpuPercent: 20.5, memoryBytes: 79.5 * 1024 * 1024 * 1024, memoryPercent: 64.1, podsCount: 7 }
      }
    ],
    pods: [
      {
        name: 'payment-gateway-worker-7df94689cb-x9v2k',
        namespace: 'production',
        status: 'CrashLoopBackOff',
        readyContainers: '0/1',
        restarts: 12,
        nodeName: 'k8s-worker-02',
        podIp: '10.244.2.89',
        hostIp: '10.240.10.22',
        age: '4h 12m',
        qosClass: 'Burstable',
        labels: { app: 'payment-gateway', tier: 'backend', release: 'v2.4.1' },
        containers: [
          {
            name: 'payment-worker',
            image: 'registry.corp.internal/fintech/payment-worker:v2.4.1',
            state: 'waiting',
            ready: false,
            restartCount: 12,
            exitCode: 137,
            ports: [8080, 9090],
            cpuUsagePercent: 0,
            memoryUsageBytes: 0,
            requestCpu: '500m',
            requestMem: '1Gi',
            limitCpu: '2000m',
            limitMem: '2Gi'
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: payment-gateway-worker-7df94689cb-x9v2k
  namespace: production
  labels:
    app: payment-gateway
    tier: backend
    release: v2.4.1
spec:
  containers:
  - name: payment-worker
    image: registry.corp.internal/fintech/payment-worker:v2.4.1
    ports:
    - containerPort: 8080
      name: http
    - containerPort: 9090
      name: metrics
    resources:
      requests:
        cpu: "500m"
        memory: "1Gi"
      limits:
        cpu: "2000m"
        memory: "2Gi"
    env:
    - name: NODE_ENV
      value: "production"
    - name: REDIS_HOST
      value: "redis-cluster.database.svc.cluster.local"`,
        logs: [
          { timestamp: '14:28:10.104', stream: 'stdout', message: 'Initializing Payment Gateway Worker v2.4.1 on port 8080...' },
          { timestamp: '14:28:12.420', stream: 'stdout', message: 'Connected to Redis pool [redis-cluster.database.svc.cluster.local:6379]' },
          { timestamp: '14:28:15.890', stream: 'stderr', message: '[CRITICAL] In-memory transaction cache heap overflow: 2048 MB exceeded' },
          { timestamp: '14:28:16.002', stream: 'stderr', message: 'java.lang.OutOfMemoryError: Java heap space at com.fintech.cache.TxBatchManager.loadUnsettledLedgers()' },
          { timestamp: '14:28:16.020', stream: 'stderr', message: 'Terminated with exit code 137 (OOMKilled by Linux kernel cgroup oom_killer)' },
          { timestamp: '14:31:02.122', stream: 'stdout', message: 'Restarting container after CrashLoopBackOff backoff-period 5m...' }
        ],
        events: [
          { type: 'Warning', reason: 'OOMKilled', message: 'Container payment-worker in pod payment-gateway-worker-7df94689cb-x9v2k was OOMKilled by cgroup limit (2GiB)', age: '14m' },
          { type: 'Warning', reason: 'BackOff', message: 'Back-off restarting failed container payment-worker in pod payment-gateway-worker-7df94689cb-x9v2k', age: '12m' },
          { type: 'Normal', reason: 'Scheduled', message: 'Successfully assigned production/payment-gateway-worker-7df94689cb-x9v2k to k8s-worker-02', age: '4h 12m' }
        ]
      },
      {
        name: 'frontend-web-app-59bc76899-7lk4d',
        namespace: 'production',
        status: 'Running',
        readyContainers: '2/2',
        restarts: 0,
        nodeName: 'k8s-worker-01',
        podIp: '10.244.1.45',
        hostIp: '10.240.10.21',
        age: '14d 6h',
        qosClass: 'Guaranteed',
        labels: { app: 'frontend-web', tier: 'ui' },
        containers: [
          {
            name: 'nextjs-app',
            image: 'registry.corp.internal/web/frontend:v3.1.0',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [3000],
            cpuUsagePercent: 12.4,
            memoryUsageBytes: 420 * 1024 * 1024,
            requestCpu: '500m',
            requestMem: '512Mi',
            limitCpu: '500m',
            limitMem: '512Mi'
          },
          {
            name: 'envoy-sidecar',
            image: 'envoyproxy/envoy:v1.29.3',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [15001, 15021],
            cpuUsagePercent: 3.1,
            memoryUsageBytes: 95 * 1024 * 1024,
            requestCpu: '100m',
            requestMem: '128Mi',
            limitCpu: '100m',
            limitMem: '128Mi'
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: frontend-web-app-59bc76899-7lk4d
  namespace: production
spec:
  containers:
  - name: nextjs-app
    image: registry.corp.internal/web/frontend:v3.1.0`,
        logs: [
          { timestamp: '15:00:01.000', stream: 'stdout', message: 'Ready in 2.1s on port 3000' },
          { timestamp: '15:01:23.110', stream: 'stdout', message: 'GET /api/health HTTP/1.1 200 OK - 3.4ms' },
          { timestamp: '15:02:44.200', stream: 'stdout', message: 'GET /dashboard/overview HTTP/1.1 200 OK - 28.1ms' }
        ],
        events: [
          { type: 'Normal', reason: 'Started', message: 'Started container nextjs-app', age: '14d' },
          { type: 'Normal', reason: 'Started', message: 'Started container envoy-sidecar', age: '14d' }
        ]
      },
      {
        name: 'frontend-web-app-59bc76899-mn91a',
        namespace: 'production',
        status: 'Running',
        readyContainers: '2/2',
        restarts: 0,
        nodeName: 'k8s-worker-02',
        podIp: '10.244.2.19',
        hostIp: '10.240.10.22',
        age: '14d 6h',
        qosClass: 'Guaranteed',
        labels: { app: 'frontend-web', tier: 'ui' },
        containers: [
          {
            name: 'nextjs-app',
            image: 'registry.corp.internal/web/frontend:v3.1.0',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [3000],
            cpuUsagePercent: 14.8,
            memoryUsageBytes: 450 * 1024 * 1024
          },
          {
            name: 'envoy-sidecar',
            image: 'envoyproxy/envoy:v1.29.3',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [15001],
            cpuUsagePercent: 3.5,
            memoryUsageBytes: 98 * 1024 * 1024
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: frontend-web-app-59bc76899-mn91a
  namespace: production`,
        logs: [{ timestamp: '15:00:00.000', stream: 'stdout', message: 'Server listening on :3000' }],
        events: []
      },
      {
        name: 'postgres-ha-cluster-0',
        namespace: 'database',
        status: 'Running',
        readyContainers: '2/2',
        restarts: 0,
        nodeName: 'k8s-worker-03',
        podIp: '10.244.3.12',
        hostIp: '10.240.10.23',
        age: '38d 14h',
        qosClass: 'Guaranteed',
        labels: { app: 'postgres-ha', role: 'master', cluster: 'main-db' },
        containers: [
          {
            name: 'postgresql',
            image: 'postgres:16.3-alpine',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [5432],
            cpuUsagePercent: 28.5,
            memoryUsageBytes: 24 * 1024 * 1024 * 1024,
            requestCpu: '4000m',
            requestMem: '32Gi',
            limitCpu: '8000m',
            limitMem: '48Gi'
          },
          {
            name: 'patroni-agent',
            image: 'patroni/patroni:v3.2.2',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [8008],
            cpuUsagePercent: 1.2,
            memoryUsageBytes: 180 * 1024 * 1024
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: postgres-ha-cluster-0
  namespace: database`,
        logs: [
          { timestamp: '14:00:00.000', stream: 'stdout', message: 'PostgreSQL 16.3 database system is ready to accept connections' },
          { timestamp: '14:30:10.000', stream: 'stdout', message: 'checkpoint complete: wrote 4281 buffers (2.6%); 0 WAL file(s) added' }
        ],
        events: []
      },
      {
        name: 'redis-cluster-leader-0',
        namespace: 'database',
        status: 'Running',
        readyContainers: '1/1',
        restarts: 0,
        nodeName: 'k8s-worker-01',
        podIp: '10.244.1.77',
        hostIp: '10.240.10.21',
        age: '28d',
        qosClass: 'Guaranteed',
        labels: { app: 'redis-ha', role: 'primary' },
        containers: [
          {
            name: 'redis',
            image: 'redis:7.2.4-alpine',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [6379],
            cpuUsagePercent: 8.4,
            memoryUsageBytes: 8.2 * 1024 * 1024 * 1024
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: redis-cluster-leader-0
  namespace: database`,
        logs: [{ timestamp: '14:00:00.000', stream: 'stdout', message: 'Ready to accept connections' }],
        events: []
      },
      {
        name: 'ai-inferencing-worker-8b74-pt2kd',
        namespace: 'ai-pipelines',
        status: 'Pending',
        readyContainers: '0/1',
        restarts: 0,
        nodeName: 'Unassigned',
        podIp: 'None',
        hostIp: 'None',
        age: '28m',
        qosClass: 'Guaranteed',
        labels: { app: 'llm-inferencing', accelerator: 'nvidia-h100' },
        containers: [
          {
            name: 'vllm-engine',
            image: 'vllm/vllm-openai:v0.4.3',
            state: 'waiting',
            ready: false,
            restartCount: 0,
            ports: [8000],
            cpuUsagePercent: 0,
            memoryUsageBytes: 0,
            requestCpu: '16000m',
            requestMem: '64Gi'
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: ai-inferencing-worker-8b74-pt2kd
  namespace: ai-pipelines
spec:
  nodeSelector:
    accelerator: nvidia-h100`,
        logs: [],
        events: [
          { type: 'Warning', reason: 'FailedScheduling', message: '0/5 nodes are available: 2 node(s) had untolerated taint {node-role.kubernetes.io/control-plane}, 3 node(s) didn\'t match Pod\'s node selector {accelerator: nvidia-h100}', age: '28m' }
        ]
      },
      {
        name: 'ingress-nginx-controller-6789b-q5l82',
        namespace: 'ingress-nginx',
        status: 'Running',
        readyContainers: '1/1',
        restarts: 0,
        nodeName: 'k8s-worker-01',
        podIp: '10.244.1.9',
        hostIp: '10.240.10.21',
        age: '42d',
        qosClass: 'Guaranteed',
        labels: { app: 'ingress-nginx', component: 'controller' },
        containers: [
          {
            name: 'controller',
            image: 'registry.k8s.io/ingress-nginx/controller:v1.10.1',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [80, 443, 10254],
            cpuUsagePercent: 18.2,
            memoryUsageBytes: 1240 * 1024 * 1024
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: ingress-nginx-controller-6789b-q5l82
  namespace: ingress-nginx`,
        logs: [{ timestamp: '14:00:00.000', stream: 'stdout', message: 'Configuration reloaded successfully. 18 backends synced.' }],
        events: []
      },
      {
        name: 'prometheus-k8s-0',
        namespace: 'monitoring',
        status: 'Running',
        readyContainers: '3/3',
        restarts: 0,
        nodeName: 'k8s-worker-02',
        podIp: '10.244.2.14',
        hostIp: '10.240.10.22',
        age: '42d',
        qosClass: 'Burstable',
        labels: { app: 'prometheus', component: 'server' },
        containers: [
          {
            name: 'prometheus',
            image: 'prom/prometheus:v2.52.0',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [9090],
            cpuUsagePercent: 22.1,
            memoryUsageBytes: 6.8 * 1024 * 1024 * 1024
          },
          {
            name: 'config-reloader',
            image: 'quay.io/prometheus-operator/prometheus-config-reloader:v0.73.2',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [8080],
            cpuUsagePercent: 0.2,
            memoryUsageBytes: 32 * 1024 * 1024
          },
          {
            name: 'rules-validator',
            image: 'prom/alertmanager:v0.27.0',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [9093],
            cpuUsagePercent: 0.5,
            memoryUsageBytes: 45 * 1024 * 1024
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: prometheus-k8s-0
  namespace: monitoring`,
        logs: [{ timestamp: '14:00:00.000', stream: 'stdout', message: 'Server is ready to receive web requests.' }],
        events: []
      }
    ],
    deployments: [
      {
        name: 'frontend-web-app',
        namespace: 'production',
        replicasDesired: 3,
        replicasCurrent: 3,
        replicasAvailable: 3,
        replicasUpdated: 3,
        strategy: 'RollingUpdate',
        image: 'registry.corp.internal/web/frontend:v3.1.0',
        conditions: 'MinimumReplicasAvailable',
        age: '42d',
        labels: { app: 'frontend-web', tier: 'ui' }
      },
      {
        name: 'payment-gateway-worker',
        namespace: 'production',
        replicasDesired: 2,
        replicasCurrent: 2,
        replicasAvailable: 1,
        replicasUpdated: 2,
        strategy: 'RollingUpdate',
        image: 'registry.corp.internal/fintech/payment-worker:v2.4.1',
        conditions: 'ReplicaFailure',
        age: '8d',
        labels: { app: 'payment-gateway', tier: 'backend' }
      },
      {
        name: 'account-auth-service',
        namespace: 'production',
        replicasDesired: 4,
        replicasCurrent: 4,
        replicasAvailable: 4,
        replicasUpdated: 4,
        strategy: 'RollingUpdate',
        image: 'registry.corp.internal/identity/auth:v1.8.9',
        conditions: 'MinimumReplicasAvailable',
        age: '60d',
        labels: { app: 'auth-service', tier: 'auth' }
      },
      {
        name: 'ingress-nginx-controller',
        namespace: 'ingress-nginx',
        replicasDesired: 2,
        replicasCurrent: 2,
        replicasAvailable: 2,
        replicasUpdated: 2,
        strategy: 'RollingUpdate',
        image: 'registry.k8s.io/ingress-nginx/controller:v1.10.1',
        conditions: 'MinimumReplicasAvailable',
        age: '84d',
        labels: { app: 'ingress-nginx' }
      }
    ],
    daemonSets: [
      {
        name: 'cilium',
        namespace: 'kube-system',
        desiredNumberScheduled: 5,
        currentNumberScheduled: 5,
        numberReady: 5,
        nodeSelector: 'kubernetes.io/os: linux',
        image: 'quay.io/cilium/cilium:v1.15.5',
        age: '84d'
      },
      {
        name: 'node-exporter',
        namespace: 'monitoring',
        desiredNumberScheduled: 5,
        currentNumberScheduled: 5,
        numberReady: 5,
        nodeSelector: 'All Nodes',
        image: 'prom/node-exporter:v1.8.0',
        age: '84d'
      }
    ],
    statefulSets: [
      {
        name: 'postgres-ha-cluster',
        namespace: 'database',
        replicasDesired: 3,
        replicasReady: 3,
        serviceName: 'postgres-ha-headless',
        image: 'postgres:16.3-alpine',
        age: '84d'
      },
      {
        name: 'redis-cluster-leader',
        namespace: 'database',
        replicasDesired: 3,
        replicasReady: 3,
        serviceName: 'redis-headless',
        image: 'redis:7.2.4-alpine',
        age: '84d'
      }
    ],
    services: [
      {
        name: 'frontend-web-service',
        namespace: 'production',
        type: 'ClusterIP',
        clusterIp: '10.96.120.44',
        ports: [{ name: 'http', protocol: 'TCP', port: 80, targetPort: 3000 }],
        selector: { app: 'frontend-web' },
        endpointsCount: 3,
        age: '42d'
      },
      {
        name: 'payment-gateway-service',
        namespace: 'production',
        type: 'ClusterIP',
        clusterIp: '10.96.184.212',
        ports: [{ name: 'http', protocol: 'TCP', port: 8080, targetPort: 8080 }],
        selector: { app: 'payment-gateway' },
        endpointsCount: 1,
        age: '8d'
      },
      {
        name: 'ingress-nginx-lb',
        namespace: 'ingress-nginx',
        type: 'LoadBalancer',
        clusterIp: '10.96.0.180',
        externalIp: '103.189.201.50',
        ports: [
          { name: 'http', protocol: 'TCP', port: 80, targetPort: 80, nodePort: 30080 },
          { name: 'https', protocol: 'TCP', port: 443, targetPort: 443, nodePort: 30443 }
        ],
        selector: { app: 'ingress-nginx' },
        endpointsCount: 2,
        age: '84d'
      },
      {
        name: 'postgres-rw',
        namespace: 'database',
        type: 'ClusterIP',
        clusterIp: '10.96.44.11',
        ports: [{ name: 'postgres', protocol: 'TCP', port: 5432, targetPort: 5432 }],
        selector: { app: 'postgres-ha', role: 'master' },
        endpointsCount: 1,
        age: '84d'
      }
    ],
    ingresses: [
      {
        name: 'production-main-ingress',
        namespace: 'production',
        hosts: ['app.company.id', 'api.company.id'],
        loadBalancerIp: '103.189.201.50',
        paths: [
          { path: '/', backendService: 'frontend-web-service', backendPort: 80 },
          { path: '/api/v1/payment', backendService: 'payment-gateway-service', backendPort: 8080 }
        ],
        tls: true,
        certStatus: 'Valid',
        age: '84d'
      }
    ],
    pvcs: [
      {
        name: 'data-postgres-ha-cluster-0',
        namespace: 'database',
        status: 'Bound',
        volumeName: 'pvc-8bf92038-d7e1-4562-b91c',
        capacity: '500Gi',
        accessModes: ['ReadWriteOnce'],
        storageClass: 'ceph-rbd-nvme-fast',
        age: '84d'
      },
      {
        name: 'data-postgres-ha-cluster-1',
        namespace: 'database',
        status: 'Bound',
        volumeName: 'pvc-91a02931-e8f2-4562-b91c',
        capacity: '500Gi',
        accessModes: ['ReadWriteOnce'],
        storageClass: 'ceph-rbd-nvme-fast',
        age: '84d'
      },
      {
        name: 'ai-training-dataset-pvc',
        namespace: 'ai-pipelines',
        status: 'Pending',
        volumeName: 'Unbound',
        capacity: '2000Gi',
        accessModes: ['ReadWriteMany'],
        storageClass: 'cephfs-shared-pool',
        age: '2d'
      }
    ],
    events: [
      {
        id: 'evt-01',
        type: 'Warning',
        reason: 'OOMKilled',
        objectKind: 'Pod',
        objectName: 'payment-gateway-worker-7df94689cb-x9v2k',
        namespace: 'production',
        message: 'Container payment-worker in pod was killed by kernel cgroup limit (Memory 2048Mi exceeded)',
        source: 'kubelet (k8s-worker-02)',
        count: 12,
        firstSeen: '4h ago',
        lastSeen: '14m ago'
      },
      {
        id: 'evt-02',
        type: 'Warning',
        reason: 'FailedScheduling',
        objectKind: 'Pod',
        objectName: 'ai-inferencing-worker-8b74-pt2kd',
        namespace: 'ai-pipelines',
        message: '0/5 nodes available: Pod requires nodeSelector accelerator=nvidia-h100 which is not available in node pool',
        source: 'default-scheduler',
        count: 38,
        firstSeen: '28m ago',
        lastSeen: '1m ago'
      },
      {
        id: 'evt-03',
        type: 'Normal',
        reason: 'LeaderElection',
        objectKind: 'Lease',
        objectName: 'kube-scheduler',
        namespace: 'kube-system',
        message: 'k8s-master-02 renewed lease for leader election',
        source: 'kube-scheduler',
        count: 1240,
        firstSeen: '84d ago',
        lastSeen: '10s ago'
      },
      {
        id: 'evt-04',
        type: 'Normal',
        reason: 'CertificateRenewed',
        objectKind: 'Certificate',
        objectName: 'tls-company-id-secret',
        namespace: 'production',
        message: 'Cert-manager successfully renewed Let\'s Encrypt Wildcard Certificate (Valid for 89 days)',
        source: 'cert-manager-controller',
        count: 1,
        firstSeen: '3h ago',
        lastSeen: '3h ago'
      }
    ],
    helmReleases: [
      {
        name: 'cilium-enterprise',
        namespace: 'kube-system',
        chart: 'cilium-1.15.5',
        appVersion: '1.15.5',
        status: 'deployed',
        revision: 4,
        updated: '18 hari yang lalu'
      },
      {
        name: 'ingress-nginx',
        namespace: 'ingress-nginx',
        chart: 'ingress-nginx-4.10.1',
        appVersion: '1.10.1',
        status: 'deployed',
        revision: 6,
        updated: '42 hari yang lalu'
      },
      {
        name: 'cert-manager',
        namespace: 'cert-manager',
        chart: 'cert-manager-v1.14.4',
        appVersion: 'v1.14.4',
        status: 'deployed',
        revision: 2,
        updated: '60 hari yang lalu'
      },
      {
        name: 'kube-prometheus-stack',
        namespace: 'monitoring',
        chart: 'kube-prometheus-stack-58.2.0',
        appVersion: 'v0.73.2',
        status: 'deployed',
        revision: 5,
        updated: '28 hari yang lalu'
      }
    ]
  },
  {
    id: 'k8s-stg-bali-02',
    name: 'K8s-Staging-Bali-02',
    context: 'developer@k8s-stg-bali-02',
    provider: 'OpenStack KVM Private Cloud (Bali Region)',
    version: 'v1.30.1',
    apiServerUrl: 'https://k8s-staging.bali.corp:6443',
    status: 'HEALTHY',
    cniPlugin: 'Calico',
    ingressController: 'Traefik (v3.0.2)',
    summary: {
      nodeCount: { ready: 3, total: 3 },
      podCount: { running: 34, pending: 0, failed: 0, total: 34 },
      namespaceCount: 5,
      cpu: {
        capacityCores: 48,
        requestedCores: 22,
        limitCores: 36,
        usageCores: 11.2,
        usagePercent: 23.3,
        requestedPercent: 45.8
      },
      memory: {
        capacityBytes: 192 * 1024 * 1024 * 1024,
        requestedBytes: 74 * 1024 * 1024 * 1024,
        limitBytes: 110 * 1024 * 1024 * 1024,
        usageBytes: 52 * 1024 * 1024 * 1024,
        usagePercent: 27.1,
        requestedPercent: 38.5
      },
      network: {
        rxRateMBs: 42.1,
        txRateMBs: 38.4,
        podIpsAllocated: 34,
        maxPodIps: 256
      },
      storagePvc: {
        totalPvcs: 6,
        boundPvcs: 6,
        pendingPvcs: 0,
        capacityGB: 800,
        usedGB: 280
      }
    },
    controlPlane: [
      {
        name: 'kube-apiserver',
        status: 'Healthy',
        replicas: '1/1',
        version: 'v1.30.1',
        latencyMs: 1.4,
        message: 'All endpoints responding within SLA'
      },
      {
        name: 'etcd-cluster',
        status: 'Healthy',
        replicas: '1/1',
        version: '3.5.12',
        latencyMs: 1.8,
        message: 'Database size: 84 MB'
      },
      {
        name: 'coredns',
        status: 'Healthy',
        replicas: '2/2',
        version: 'v1.11.1',
        latencyMs: 0.5,
        message: 'DNS lookup average 0.5ms'
      }
    ],
    nodes: [
      {
        name: 'k8s-stg-master-01',
        role: 'control-plane',
        status: 'Ready',
        internalIp: '10.250.20.10',
        osImage: 'Debian GNU/Linux 12 (bookworm)',
        kernelVersion: '6.1.0-21-amd64',
        kubeletVersion: 'v1.30.1',
        containerRuntime: 'containerd://1.7.15',
        uptime: '24 Hari',
        cordoned: false,
        taints: [{ key: 'node-role.kubernetes.io/control-plane', effect: 'NoSchedule' }],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' }
        ],
        capacity: { cpuCores: 8, memoryBytes: 32 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 7.8, memoryBytes: 30 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 1.4, cpuPercent: 17.5, memoryBytes: 8.5 * 1024 * 1024 * 1024, memoryPercent: 26.5, podsCount: 8 }
      },
      {
        name: 'k8s-stg-worker-01',
        role: 'worker',
        status: 'Ready',
        internalIp: '10.250.20.21',
        osImage: 'Debian GNU/Linux 12 (bookworm)',
        kernelVersion: '6.1.0-21-amd64',
        kubeletVersion: 'v1.30.1',
        containerRuntime: 'containerd://1.7.15',
        uptime: '24 Hari',
        cordoned: false,
        taints: [],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' }
        ],
        capacity: { cpuCores: 20, memoryBytes: 80 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 19.5, memoryBytes: 78 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 5.2, cpuPercent: 26.0, memoryBytes: 24 * 1024 * 1024 * 1024, memoryPercent: 30.0, podsCount: 14 }
      },
      {
        name: 'k8s-stg-worker-02',
        role: 'worker',
        status: 'Ready',
        internalIp: '10.250.20.22',
        osImage: 'Debian GNU/Linux 12 (bookworm)',
        kernelVersion: '6.1.0-21-amd64',
        kubeletVersion: 'v1.30.1',
        containerRuntime: 'containerd://1.7.15',
        uptime: '24 Hari',
        cordoned: false,
        taints: [],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' }
        ],
        capacity: { cpuCores: 20, memoryBytes: 80 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 19.5, memoryBytes: 78 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 4.6, cpuPercent: 23.0, memoryBytes: 19.5 * 1024 * 1024 * 1024, memoryPercent: 24.3, podsCount: 12 }
      }
    ],
    pods: [
      {
        name: 'staging-api-gateway-55f6b9c8-l9k2w',
        namespace: 'staging',
        status: 'Running',
        readyContainers: '1/1',
        restarts: 0,
        nodeName: 'k8s-stg-worker-01',
        podIp: '10.244.1.18',
        hostIp: '10.250.20.21',
        age: '12d',
        qosClass: 'Burstable',
        labels: { app: 'api-gateway', env: 'staging' },
        containers: [
          {
            name: 'gateway',
            image: 'traefik:v3.0.2',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [80, 443],
            cpuUsagePercent: 6.2,
            memoryUsageBytes: 210 * 1024 * 1024
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: staging-api-gateway-55f6b9c8-l9k2w
  namespace: staging`,
        logs: [{ timestamp: '10:00:00.000', stream: 'stdout', message: 'Configuration loaded from Kubernetes IngressRoute' }],
        events: []
      }
    ],
    deployments: [
      {
        name: 'staging-api-gateway',
        namespace: 'staging',
        replicasDesired: 2,
        replicasCurrent: 2,
        replicasAvailable: 2,
        replicasUpdated: 2,
        strategy: 'RollingUpdate',
        image: 'traefik:v3.0.2',
        conditions: 'MinimumReplicasAvailable',
        age: '24d',
        labels: { app: 'api-gateway' }
      }
    ],
    daemonSets: [],
    statefulSets: [],
    services: [
      {
        name: 'staging-api-gateway-service',
        namespace: 'staging',
        type: 'NodePort',
        clusterIp: '10.96.20.5',
        ports: [{ name: 'http', protocol: 'TCP', port: 80, targetPort: 80, nodePort: 32080 }],
        selector: { app: 'api-gateway' },
        endpointsCount: 2,
        age: '24d'
      }
    ],
    ingresses: [],
    pvcs: [],
    events: [
      {
        id: 'evt-stg-01',
        type: 'Normal',
        reason: 'Synced',
        objectKind: 'Deployment',
        objectName: 'staging-api-gateway',
        namespace: 'staging',
        message: 'Deployment scaling completed successfully',
        source: 'deployment-controller',
        count: 1,
        firstSeen: '12d ago',
        lastSeen: '12d ago'
      }
    ],
    helmReleases: []
  },
  {
    id: 'k8s-edge-surabaya',
    name: 'K8s-Edge-Surabaya-03',
    context: 'edge-operator@k8s-edge-surabaya',
    provider: 'K3s Lightweight Edge Node (Warehouse SBY)',
    version: 'v1.29.6+k3s1',
    apiServerUrl: 'https://k3s.surabaya.edge.corp:6443',
    status: 'HEALTHY',
    cniPlugin: 'Flannel',
    ingressController: 'Traefik (embedded)',
    summary: {
      nodeCount: { ready: 2, total: 2 },
      podCount: { running: 14, pending: 0, failed: 0, total: 14 },
      namespaceCount: 3,
      cpu: {
        capacityCores: 16,
        requestedCores: 6,
        limitCores: 12,
        usageCores: 2.8,
        usagePercent: 17.5,
        requestedPercent: 37.5
      },
      memory: {
        capacityBytes: 32 * 1024 * 1024 * 1024,
        requestedBytes: 11 * 1024 * 1024 * 1024,
        limitBytes: 18 * 1024 * 1024 * 1024,
        usageBytes: 8.4 * 1024 * 1024 * 1024,
        usagePercent: 26.2,
        requestedPercent: 34.3
      },
      network: {
        rxRateMBs: 8.5,
        txRateMBs: 12.1,
        podIpsAllocated: 14,
        maxPodIps: 128
      },
      storagePvc: {
        totalPvcs: 2,
        boundPvcs: 2,
        pendingPvcs: 0,
        capacityGB: 200,
        usedGB: 68
      }
    },
    controlPlane: [
      {
        name: 'k3s-server',
        status: 'Healthy',
        replicas: '1/1',
        version: 'v1.29.6+k3s1',
        latencyMs: 0.8,
        message: 'K3s embedded SQLite database engine healthy'
      }
    ],
    nodes: [
      {
        name: 'k3s-edge-sby-01',
        role: 'control-plane',
        status: 'Ready',
        internalIp: '192.168.100.11',
        osImage: 'Ubuntu Core 22.04 LTS (x86_64)',
        kernelVersion: '5.15.0-107-generic',
        kubeletVersion: 'v1.29.6+k3s1',
        containerRuntime: 'containerd://1.7.15-k3s1',
        uptime: '92 Hari',
        cordoned: false,
        taints: [],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' }
        ],
        capacity: { cpuCores: 8, memoryBytes: 16 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 7.9, memoryBytes: 15.5 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 1.5, cpuPercent: 18.7, memoryBytes: 4.5 * 1024 * 1024 * 1024, memoryPercent: 28.1, podsCount: 8 }
      },
      {
        name: 'k3s-edge-sby-02',
        role: 'worker',
        status: 'Ready',
        internalIp: '192.168.100.12',
        osImage: 'Ubuntu Core 22.04 LTS (x86_64)',
        kernelVersion: '5.15.0-107-generic',
        kubeletVersion: 'v1.29.6+k3s1',
        containerRuntime: 'containerd://1.7.15-k3s1',
        uptime: '92 Hari',
        cordoned: false,
        taints: [],
        conditions: [
          { type: 'Ready', status: 'True', reason: 'KubeletReady', message: 'kubelet is posting ready status' }
        ],
        capacity: { cpuCores: 8, memoryBytes: 16 * 1024 * 1024 * 1024, pods: 110 },
        allocatable: { cpuCores: 7.9, memoryBytes: 15.5 * 1024 * 1024 * 1024, pods: 110 },
        usage: { cpuCores: 1.3, cpuPercent: 16.2, memoryBytes: 3.9 * 1024 * 1024 * 1024, memoryPercent: 24.3, podsCount: 6 }
      }
    ],
    pods: [
      {
        name: 'iot-mqtt-broker-786d4-54c2a',
        namespace: 'iot-edge',
        status: 'Running',
        readyContainers: '1/1',
        restarts: 0,
        nodeName: 'k3s-edge-sby-01',
        podIp: '10.42.0.12',
        hostIp: '192.168.100.11',
        age: '60d',
        qosClass: 'Burstable',
        labels: { app: 'emqx-broker' },
        containers: [
          {
            name: 'emqx',
            image: 'emqx/emqx:5.6.0',
            state: 'running',
            ready: true,
            restartCount: 0,
            ports: [1883, 8083],
            cpuUsagePercent: 11.2,
            memoryUsageBytes: 480 * 1024 * 1024
          }
        ],
        yamlManifest: `apiVersion: v1
kind: Pod
metadata:
  name: iot-mqtt-broker-786d4-54c2a
  namespace: iot-edge`,
        logs: [{ timestamp: '08:00:00.000', stream: 'stdout', message: 'EMQX 5.6.0 started with 142 connected IoT edge devices' }],
        events: []
      }
    ],
    deployments: [],
    daemonSets: [],
    statefulSets: [],
    services: [],
    ingresses: [],
    pvcs: [],
    events: [],
    helmReleases: []
  }
];
