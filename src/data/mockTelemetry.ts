import { Cluster, Anomaly, TelemetryPoint } from '../types';

// Helper to generate historical points with a specified trend and volatility
function generateHistoryPoints(
  days: number,
  baseCpu: number,
  baseRam: number,
  baseStorage: number,
  storageGrowthRate: number, // daily percent growth
  cpuVolatility: number,
  ramVolatility: number
): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayFactor = Math.sin((days - i) / 3) * 5; // cyclic factor
    
    const cpu = Math.max(10, Math.min(98, baseCpu + dayFactor + (Math.random() - 0.5) * cpuVolatility));
    const ram = Math.max(15, Math.min(98, baseRam + (Math.sin((days - i) / 5) * 3) + (Math.random() - 0.5) * ramVolatility));
    
    // Storage has a steady growth trend plus slight fluctuations
    const dayGrowth = baseStorage * Math.pow(1 + storageGrowthRate, days - 1 - i);
    const storage = Math.max(10, Math.min(99, dayGrowth + (Math.random() - 0.5) * 0.5));
    
    points.push({
      timestamp: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
      cpu: Math.round(cpu * 10) / 10,
      ram: Math.round(ram * 10) / 10,
      storage: Math.round(storage * 10) / 10,
      networkIn: Math.round((20 + Math.random() * 40 + dayFactor) * 10) / 10,
      networkOut: Math.round((25 + Math.random() * 50 + dayFactor) * 10) / 10,
      vmCount: Math.round(12 + (days - 1 - i) / 10)
    });
  }
  
  return points;
}

export const defaultClusters: Cluster[] = [
  {
    id: 'cluster-pve-01',
    name: 'Proxmox-CEPH-Prod',
    type: 'Proxmox VE',
    endpoint: 'https://pve-cluster-01.corp.internal:8006',
    status: 'connected',
    version: 'PVE 8.1.4',
    storageCapacityGB: 20480, // 20 TB
    storageUsedGB: 16180, // ~79%
    cephStatus: 'HEALTH_WARN',
    anomalyScore: 42,
    nodes: [
      { id: 'node-pve-01', name: 'pve-node-01', status: 'online', cpuUsage: 65, ramUsage: 78, storageUsage: 82, vmsCount: 14 },
      { id: 'node-pve-02', name: 'pve-node-02', status: 'online', cpuUsage: 58, ramUsage: 72, storageUsage: 77, vmsCount: 16 },
      { id: 'node-pve-03', name: 'pve-node-03', status: 'online', cpuUsage: 45, ramUsage: 61, storageUsage: 79, vmsCount: 11 },
      { id: 'node-pve-04', name: 'pve-node-04', status: 'maintenance', cpuUsage: 5, ramUsage: 12, storageUsage: 10, vmsCount: 0 }
    ],
    vms: [
      { id: 'vm-pve-101', name: 'SQL-Prod-Primary', status: 'running', cpuCores: 8, ramGB: 32, storageGB: 500, cpuUsage: 78, ramUsage: 88, ipAddress: '10.10.20.101' },
      { id: 'vm-pve-102', name: 'SQL-Prod-Replica', status: 'running', cpuCores: 8, ramGB: 32, storageGB: 500, cpuUsage: 42, ramUsage: 85, ipAddress: '10.10.20.102' },
      { id: 'vm-pve-103', name: 'WebGateway-Nginx', status: 'running', cpuCores: 4, ramGB: 16, storageGB: 80, cpuUsage: 15, ramUsage: 45, ipAddress: '10.10.20.50' },
      { id: 'vm-pve-104', name: 'AuthService-OAuth', status: 'running', cpuCores: 2, ramGB: 8, storageGB: 40, cpuUsage: 33, ramUsage: 62, ipAddress: '10.10.20.55' },
      { id: 'vm-pve-105', name: 'Redis-Cache-01', status: 'running', cpuCores: 4, ramGB: 16, storageGB: 60, cpuUsage: 85, ramUsage: 94, ipAddress: '10.10.20.110' },
      { id: 'vm-pve-106', name: 'Dev-Sandbox-Test', status: 'stopped', cpuCores: 4, ramGB: 8, storageGB: 120, cpuUsage: 0, ramUsage: 0, ipAddress: '10.10.30.99' }
    ],
    telemetry: generateHistoryPoints(30, 52, 70, 68, 0.005, 12, 6) // base values, growing storage
  },
  {
    id: 'cluster-ntnx-01',
    name: 'Cluster-RDDS-NTNX',
    type: 'Nutanix AHV',
    endpoint: 'https://prism.ntnx-rdds.corp.internal:9440',
    status: 'connected',
    version: 'AOS 6.5.2 LTS',
    storageCapacityGB: 40960, // 40 TB
    storageUsedGB: 36044, // ~88%
    cephStatus: 'N/A',
    anomalyScore: 78,
    nodes: [
      { id: 'node-ntnx-01', name: 'ahv-node-01', status: 'online', cpuUsage: 72, ramUsage: 85, storageUsage: 91, vmsCount: 22 },
      { id: 'node-ntnx-02', name: 'ahv-node-02', status: 'online', cpuUsage: 64, ramUsage: 79, storageUsage: 86, vmsCount: 18 },
      { id: 'node-ntnx-03', name: 'ahv-node-03', status: 'online', cpuUsage: 81, ramUsage: 94, storageUsage: 88, vmsCount: 25 }
    ],
    vms: [
      { id: 'vm-ntnx-201', name: 'SAP-Application-Server', status: 'running', cpuCores: 16, ramGB: 64, storageGB: 1024, cpuUsage: 88, ramUsage: 92, ipAddress: '10.20.10.11' },
      { id: 'vm-ntnx-202', name: 'SAP-Hana-Database', status: 'running', cpuCores: 32, ramGB: 128, storageGB: 2048, cpuUsage: 64, ramUsage: 96, ipAddress: '10.20.10.12' },
      { id: 'vm-ntnx-203', name: 'CRM-Core-Service', status: 'running', cpuCores: 8, ramGB: 32, storageGB: 400, cpuUsage: 95, ramUsage: 89, ipAddress: '10.20.10.20' },
      { id: 'vm-ntnx-204', name: 'MailGateway-Exchange', status: 'running', cpuCores: 8, ramGB: 16, storageGB: 1200, cpuUsage: 35, ramUsage: 71, ipAddress: '10.20.10.33' },
      { id: 'vm-ntnx-205', name: 'ElasticSearch-Cluster', status: 'running', cpuCores: 12, ramGB: 48, storageGB: 1500, cpuUsage: 74, ramUsage: 82, ipAddress: '10.20.10.45' }
    ],
    telemetry: generateHistoryPoints(30, 68, 83, 76, 0.007, 8, 4) // heavy usage, rapid storage growth
  },
  {
    id: 'cluster-openstack-01',
    name: 'OpenStack-Edge-Cloud',
    type: 'OpenStack',
    endpoint: 'https://identity.openstack.edge.corp:5000/v3',
    status: 'connected',
    version: '2023.2 Bobcat',
    storageCapacityGB: 81920, // 80 TB
    storageUsedGB: 42598, // ~52%
    cephStatus: 'HEALTH_OK',
    anomalyScore: 18,
    nodes: [
      { id: 'node-os-01', name: 'compute-01-hypervisor', status: 'online', cpuUsage: 38, ramUsage: 55, storageUsage: 54, vmsCount: 45 },
      { id: 'node-os-02', name: 'compute-02-hypervisor', status: 'online', cpuUsage: 41, ramUsage: 48, storageUsage: 51, vmsCount: 41 },
      { id: 'node-os-03', name: 'compute-03-hypervisor', status: 'online', cpuUsage: 28, ramUsage: 42, storageUsage: 53, vmsCount: 38 },
      { id: 'node-os-04', name: 'compute-04-hypervisor', status: 'online', cpuUsage: 32, ramUsage: 46, storageUsage: 50, vmsCount: 42 }
    ],
    vms: [
      { id: 'vm-os-301', name: 'kubernetes-worker-1', status: 'running', cpuCores: 8, ramGB: 16, storageGB: 200, cpuUsage: 45, ramUsage: 78, ipAddress: '192.168.10.2' },
      { id: 'vm-os-302', name: 'kubernetes-worker-2', status: 'running', cpuCores: 8, ramGB: 16, storageGB: 200, cpuUsage: 51, ramUsage: 74, ipAddress: '192.168.10.3' },
      { id: 'vm-os-303', name: 'kubernetes-worker-3', status: 'running', cpuCores: 8, ramGB: 16, storageGB: 200, cpuUsage: 38, ramUsage: 69, ipAddress: '192.168.10.4' },
      { id: 'vm-os-304', name: 'kubernetes-master-1', status: 'running', cpuCores: 4, ramGB: 8, storageGB: 100, cpuUsage: 25, ramUsage: 60, ipAddress: '192.168.10.1' },
      { id: 'vm-os-305', name: 'CI-CD-Runner-Pod', status: 'running', cpuCores: 8, ramGB: 32, storageGB: 300, cpuUsage: 90, ramUsage: 85, ipAddress: '192.168.12.50' }
    ],
    telemetry: generateHistoryPoints(30, 34, 47, 49, 0.002, 15, 8)
  }
];

export const defaultAnomalies: Anomaly[] = [
  {
    id: 'anomaly-01',
    clusterId: 'cluster-ntnx-01',
    clusterName: 'Cluster-RDDS-NTNX',
    type: 'STORAGE_IMBALANCE',
    severity: 'critical',
    description: 'Penyimpanan lokal di node-01 mencapai 91% sementara node-03 sebesar 88%. Distribusi VM tidak seimbang.',
    detectedAt: new Date(Date.now() - 4 * 3600 * 1000).toLocaleString('id-ID'), // 4 hours ago
    resolved: false,
    recommendation: 'Migrasikan VM non-kritis CRM-Core-Service dari node-01 ke node-03 untuk menyeimbangkan utilisasi penyimpanan lokal.'
  },
  {
    id: 'anomaly-02',
    clusterId: 'cluster-pve-01',
    clusterName: 'Proxmox-CEPH-Prod',
    type: 'STORAGE_IMBALANCE',
    severity: 'high',
    description: 'Ceph OSD status menunjukkan degradasi performa pada OSD #4. Ceph cluster berstatus HEALTH_WARN.',
    detectedAt: new Date(Date.now() - 12 * 3600 * 1000).toLocaleString('id-ID'), // 12 hours ago
    resolved: false,
    recommendation: 'Jalankan pemeriksaan disk ceph-volume lvm list pada pve-node-01. Ganti disk SSD OSD #4 yang mengalami kegagalan latency.'
  },
  {
    id: 'anomaly-03',
    clusterId: 'cluster-ntnx-01',
    clusterName: 'Cluster-RDDS-NTNX',
    type: 'CPU_SPIKE',
    severity: 'medium',
    description: 'VM SAP-Application-Server mengalami CPU spike sebesar 95% selama lebih dari 30 menit.',
    detectedAt: new Date(Date.now() - 1 * 3600 * 1000).toLocaleString('id-ID'), // 1 hour ago
    resolved: false,
    recommendation: 'Tingkatkan alokasi vCPU dari 16 vCPU menjadi 24 vCPU, atau periksa proses latar belakang SAP yang menggantung.'
  },
  {
    id: 'anomaly-04',
    clusterId: 'cluster-pve-01',
    clusterName: 'Proxmox-CEPH-Prod',
    type: 'NODE_DEGRADATION',
    severity: 'high',
    description: 'Node pve-node-04 berstatus "maintenance" dengan 0 VM aktif. Beban kerja dialihkan otomatis.',
    detectedAt: new Date(Date.now() - 48 * 3600 * 1000).toLocaleString('id-ID'),
    resolved: true,
    recommendation: 'Pekerjaan pemeliharaan selesai. Kembalikan node pve-node-04 ke status online dan re-balance beban kerja VM.'
  }
];
