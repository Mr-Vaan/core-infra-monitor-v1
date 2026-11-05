export type VirtualizationType = 
  | 'Proxmox VE'
  | 'VMware vSphere / ESXi'
  | 'Nutanix AHV'
  | 'OpenStack'
  | 'Microsoft Hyper-V / Azure Stack HCI'
  | 'Red Hat OpenShift Virtualization (KubeVirt)'
  | 'oVirt / Red Hat Enterprise Virtualization'
  | 'Citrix XenServer / XCP-ng'
  | 'Harvester HCI (SUSE / Rancher)'
  | 'Apache CloudStack'
  | 'Canonical MicroCloud / LXD'
  | 'Sangfor HCI (aCloud)'
  | 'Huawei FusionSphere / FusionCompute'
  | 'SmartOS / Joyent Triton (Illumos)'
  | 'Oracle Linux KVM / OLVM'
  | 'Google Cloud VMware Engine (GCVE)'
  | 'Azure VMware Solution (AVS)'
  | 'AWS Outposts / EC2 Nitro Bare Metal'
  | 'Oracle Cloud VMware Solution (OCVS)'
  | 'FreeBSD Bhyve'
  | 'Cisco HyperFlex HCI'
  | 'OpenNebula Enterprise Cloud'
  | (string & {});

export interface VMInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'suspended';
  cpuCores: number;
  ramGB: number;
  storageGB: number;
  cpuUsage: number;
  ramUsage: number;
  ipAddress: string;
}

export interface NodeInfo {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
  vmsCount: number;
}

export interface TelemetryPoint {
  timestamp: string;
  cpu: number;
  ram: number;
  storage: number;
  networkIn: number; // MB/s
  networkOut: number; // MB/s
  vmCount: number;
}

export interface StorageForecastPoint {
  day: number;
  dateString: string;
  actual?: number;
  forecast: number;
}

export interface Cluster {
  id: string;
  name: string;
  type: VirtualizationType;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'error';
  version: string;
  nodes: NodeInfo[];
  vms: VMInfo[];
  telemetry: TelemetryPoint[];
  storageCapacityGB: number;
  storageUsedGB: number;
  cephStatus?: 'HEALTH_OK' | 'HEALTH_WARN' | 'HEALTH_ERR' | 'N/A';
  anomalyScore: number; // 0 to 100
}

export interface Anomaly {
  id: string;
  clusterId: string;
  clusterName: string;
  type: 'CPU_SPIKE' | 'STORAGE_IMBALANCE' | 'NODE_DEGRADATION' | 'RAM_LEAK';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  resolved: boolean;
  recommendation: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

export type ContainerState = 'running' | 'stopped' | 'restarting' | 'paused' | 'exited';

export interface ContainerPort {
  ip?: string;
  privatePort: number;
  publicPort?: number;
  type: 'tcp' | 'udp';
}

export interface ContainerMount {
  type: 'volume' | 'bind';
  source: string;
  destination: string;
  mode: 'rw' | 'ro';
}

export interface ContainerStats {
  cpuPercent: number;
  memoryUsageBytes: number;
  memoryLimitBytes: number;
  memoryPercent: number;
  networkRxBytes: number; // Bytes
  networkTxBytes: number; // Bytes
  blockReadBytes: number;
  blockWriteBytes: number;
  pids: number;
  uptime: string;
}

export interface ContainerLogEntry {
  timestamp: string;
  stream: 'stdout' | 'stderr';
  message: string;
}

export interface ContainerVulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  imageId: string;
  state: ContainerState;
  status: string;
  created: string;
  stackName?: string;
  ports: ContainerPort[];
  mounts: ContainerMount[];
  env: Record<string, string>;
  command: string;
  stats: ContainerStats;
  vulnerabilities?: ContainerVulnerabilitySummary;
  healthStatus?: 'healthy' | 'unhealthy' | 'starting' | 'none';
  restartPolicy: 'always' | 'unless-stopped' | 'on-failure' | 'no';
  updateAvailable?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface DockerStack {
  id: string;
  name: string;
  status: 'active' | 'partially-running' | 'inactive';
  servicesCount: number;
  containers: string[];
  composeYaml: string;
  updatedAt: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  sizeMB: number;
  created: string;
  inUse: boolean;
  updateAvailable: boolean;
  vulnerabilities: ContainerVulnerabilitySummary;
}

export interface ContainerTemplate {
  id: string;
  title: string;
  category: 'Databases' | 'Monitoring' | 'Web Servers' | 'Security' | 'DevTools' | 'AI & Tools';
  description: string;
  image: string;
  defaultPorts: string[];
  composeYaml: string;
  envDefaults: { key: string; defaultValue: string; description: string }[];
}

export type ContainerAuditEventType = 
  | 'CREATE' 
  | 'START' 
  | 'STOP' 
  | 'RESTART' 
  | 'EDIT' 
  | 'SOFT_DELETE' 
  | 'RESTORE' 
  | 'PERMANENT_DELETE' 
  | 'EXEC_COMMAND' 
  | 'CONFIG_CHANGE'
  | 'HEALTH_CHECK'
  | 'DIAGNOSTIC_AUDIT';

export interface ContainerActivityLog {
  id: string;
  timestamp: string;
  containerId: string;
  containerName: string;
  image: string;
  eventType: ContainerAuditEventType;
  actor: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'INFO';
  summary: string;
  details?: Record<string, any> | string;
}

// Hardware Server Health Check Types
export interface CpuCoreDetail {
  coreId: number;
  tempC: number;
  usagePercent: number;
}

export interface CpuSocketInfo {
  socketId: number;
  model: string;
  cores: number;
  threads: number;
  baseGhz: number;
  currentGhz: number;
  temperatureC: number;
  tjMaxC: number;
  voltageV: number;
  vrmTempC: number;
  throttleStatus: 'none' | 'thermal' | 'power_limit';
  coresThermal: CpuCoreDetail[];
  l1CacheKb: number;
  l2CacheMb: number;
  l3CacheMb: number;
  mceErrorCount: number;
}

export interface CpuSubsystem {
  sockets: CpuSocketInfo[];
  spectreMeltdownMitigations: boolean;
  governor: string;
  microcodeVersion: string;
}

export interface DimmModuleInfo {
  slot: string;
  channel: string;
  cpuSocket: number;
  sizeGb: number;
  manufacturer: string;
  partNumber: string;
  serialNumber: string;
  speedMhz: number;
  temperatureC: number;
  status: 'optimal' | 'correctable_ecc_warn' | 'failed' | 'empty' | 'training_failed' | 'not_detected';
  detectionState: 'detected' | 'empty' | 'not_detected_error';
  correctableErrors: number;
  errorDetails?: string;
}

export interface MemorySubsystem {
  totalCapacityGb: number;
  installedDimmCount: number;
  totalSlots: number;
  dimmType: string;
  speedMhz: number;
  multiBitUncorrectableErrors: number;
  singleBitCorrectableErrors: number;
  eccScrubbingStatus: 'active' | 'idle';
  dimmModules: DimmModuleInfo[];
}

export interface StorageDriveHealth {
  bayId: number;
  model: string;
  protocol: 'NVMe Gen4' | 'NVMe Gen5' | 'SAS 12Gb/s' | 'SATA 6Gb/s' | 'EMPTY';
  capacityGb: number;
  healthPercent: number;
  temperatureC: number;
  wearLevelPercent: number;
  tbwWrittenTb: number;
  powerOnHours: number;
  reallocatedSectors: number;
  mediaErrors: number;
  status: 'healthy' | 'warning' | 'failing' | 'empty' | 'fault';
  smartStatus: 'PASSED' | 'WARNING' | 'FAILED' | 'N/A' | 'COMMUNICATION_ERROR';
  detectionState: 'detected' | 'empty' | 'not_detected_error';
  lastSelfTest: string;
  criticalWarning: number;
  slotNote?: string;
}

export interface StorageSubsystem {
  totalBays: number;
  populatedBays: number;
  controller: {
    model: string;
    firmware: string;
    cacheGb: number;
    bbuStatus: 'optimal' | 'charging' | 'degraded' | 'failed';
    bbuCapacityPercent: number;
    writePolicy: 'WriteBack' | 'WriteThrough';
  };
  drives: StorageDriveHealth[];
}

export interface PsuUnitInfo {
  id: string;
  model: string;
  status: 'online' | 'offline' | 'unplugged' | 'fan_failed' | 'empty';
  detectionState: 'detected' | 'empty' | 'fault';
  inputVoltageV: number;
  outputWatts: number;
  efficiencyRating: '80 PLUS Titanium' | '80 PLUS Platinum' | 'N/A';
  tempC: number;
  hotPlugReady: boolean;
}

export interface PowerSubsystem {
  redundancyMode: '1+1 Redundant (Active/Standby)' | 'Load Balanced (Active/Active)';
  totalPowerDrawW: number;
  powerCapacityW: number;
  psus: PsuUnitInfo[];
}

export interface ChassisFanInfo {
  fanId: string;
  dualRotor: boolean;
  rpm: number;
  maxRpm: number;
  pwmPercent: number;
  status: 'ok' | 'degraded' | 'stalled';
}

export interface ThermalZoneInfo {
  name: string;
  tempC: number;
  warnThreshold: number;
  critThreshold: number;
}

export interface ThermalCoolingSubsystem {
  ambientIntakeTempC: number;
  ambientExhaustTempC: number;
  airflowCfm: number;
  fanProfile: 'Optimal Auto' | 'Acoustic / Quiet' | 'Maximum Performance Cool';
  fans: ChassisFanInfo[];
  thermalZones: ThermalZoneInfo[];
}

export interface PcieSlotInfo {
  slotId: string;
  cardName: string;
  linkSpeed: string;
  mechanicalWidth: string;
  negotiatedWidth: string;
  aerStatus: 'clean' | 'correctable_errors' | 'fatal_errors' | 'n/a';
  tempC: number;
  detectionState: 'detected' | 'empty' | 'link_degraded';
  slotNote?: string;
}

export interface OpticsDomInfo {
  port: string;
  transceiverType: string;
  rxPowerDbm: number;
  txPowerDbm: number;
  laserBiasMa: number;
  tempC: number;
  status: 'optimal' | 'low_rx_warn' | 'link_down';
}

export interface PcieAndNicSubsystem {
  pcieSlots: PcieSlotInfo[];
  opticsDom: OpticsDomInfo[];
}

export interface BmcSelLogEntry {
  id: string;
  timestamp: string;
  sensor: string;
  severity: 'INFORMATIONAL' | 'WARNING' | 'CRITICAL';
  description: string;
  code: string;
}

export interface DiagnosticTestItem {
  id: string;
  name: string;
  category: 'CPU' | 'RAM' | 'STORAGE' | 'FANS' | 'PSU' | 'PCIE' | 'BMC';
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'RUNNING' | 'PENDING';
  durationMs: number;
  details: string;
}

export interface HardwareDiagnosticResult {
  id: string;
  startedAt: string;
  completedAt: string;
  executedBy: string;
  overallPass: boolean;
  overallScore: number;
  tests: DiagnosticTestItem[];
}

export type BmcType = 
  | 'iDRAC9 Enterprise' 
  | 'iDRAC10 Enterprise'
  | 'iLO 5 Advanced' 
  | 'iLO 6 Advanced'
  | 'Lenovo XClarity Controller (XCC)'
  | 'Supermicro IPMI 2.0 / Redfish' 
  | 'Huawei iBMC'
  | 'Cisco IMC'
  | 'Inspur ISBMC'
  | 'Fujitsu iRMC S5/S6'
  | 'ASUS ASMB10-iKVM Redfish'
  | 'GIGABYTE MegaRAC SP-X'
  | 'Axioo MegaRAC / OpenBMC'
  | 'Zyrex AST2600 IPMI 2.0'
  | 'Advan AST2500 Redfish'
  | 'SPC MegaRAC Enterprise'
  | 'Maspion OpenBMC'
  | 'Polytron AST2600 BMC'
  | 'Oracle ILOM v5'
  | 'IBM ASMI / HMC'
  | 'QCT OrCA BMC'
  | 'OpenBMC Linux Foundation'
  | (string & {});

export interface ServerHardware {
  id: string;
  nodeId: string;
  nodeName: string;
  clusterId: string;
  clusterName: string;
  serverModel: string;
  vendor?: string;
  originCountry?: string; // 'Indonesia' | 'United States' | 'China' | 'Japan' | 'Taiwan' | etc.
  isTkdnCertified?: boolean;
  tkdnScore?: number;
  bmcProtocol?: string;
  serialNumber: string;
  assetTag: string;
  biosVersion: string;
  bmcType: BmcType;
  bmcIp: string;
  bmcStatus: 'optimal' | 'warning' | 'degraded';
  overallHealthScore: number; // 0-100
  overallStatus: 'healthy' | 'warning' | 'critical';
  uptimeDays: number;
  formFactor: string;
  chassisIntrusion: 'closed' | 'open';
  cmosBattery: { voltage: number; status: 'good' | 'low' | 'replace' };
  cpu: CpuSubsystem;
  memory: MemorySubsystem;
  storage: StorageSubsystem;
  power: PowerSubsystem;
  cooling: ThermalCoolingSubsystem;
  pcieAndNetwork: PcieAndNicSubsystem;
  selLogs: BmcSelLogEntry[];
  lastDiagnostic: HardwareDiagnosticResult | null;
}

export type LogoType = 'icon' | 'image';
export type IconAnimationType = 'none' | 'pulse' | 'glow' | 'bounce';
export type LogoBorderRadius = 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full';

export interface BrandingConfig {
  logoType: LogoType;
  iconName: string;
  customImageUrl?: string;
  imageFit?: 'contain' | 'cover';
  gradient: string;
  title: string;
  subtitle: string;
  borderRadius: LogoBorderRadius;
  iconAnimation: IconAnimationType;
  updatedAt?: string;
}

export const defaultBrandingConfig: BrandingConfig = {
  logoType: 'icon',
  iconName: 'Cpu',
  customImageUrl: '',
  imageFit: 'cover',
  gradient: 'from-blue-600 to-indigo-500',
  title: 'Infra Health',
  subtitle: 'INTEL ADVISOR',
  borderRadius: 'rounded-xl',
  iconAnimation: 'pulse',
  updatedAt: new Date().toISOString()
};

export type FeatureAnalysisType = 
  | 'dashboard'
  | 'clusters'
  | 'kubernetes'
  | 'hardware'
  | 'containers'
  | 'topology'
  | 'forecasts'
  | 'alerts';

export interface FeatureAiAnalysisResult {
  feature: FeatureAnalysisType;
  title: string;
  subtitle: string;
  healthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  keyFindings: string[];
  deepDive: {
    category: string;
    status: 'optimal' | 'warning' | 'critical';
    details: string;
  }[];
  risksAndImpact: string[];
  recommendations: {
    priority: 'P1' | 'P2' | 'P3';
    title: string;
    action: string;
    impact: string;
  }[];
  remediationCommands: string[];
  generatedAt: string;
  source: string;
}

// ==========================================
// KUBERNETES MONITORING & TELEMETRY TYPES
// ==========================================

export type K8sClusterStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL';
export type K8sPodStatus = 
  | 'Running' 
  | 'CrashLoopBackOff' 
  | 'Pending' 
  | 'Completed' 
  | 'Error' 
  | 'Terminating' 
  | 'ImagePullBackOff' 
  | 'OOMKilled';

export interface K8sClusterSummary {
  nodeCount: { ready: number; total: number };
  podCount: { running: number; pending: number; failed: number; total: number };
  namespaceCount: number;
  cpu: {
    capacityCores: number;
    requestedCores: number;
    limitCores: number;
    usageCores: number;
    usagePercent: number;
    requestedPercent: number;
  };
  memory: {
    capacityBytes: number;
    requestedBytes: number;
    limitBytes: number;
    usageBytes: number;
    usagePercent: number;
    requestedPercent: number;
  };
  network: {
    rxRateMBs: number;
    txRateMBs: number;
    podIpsAllocated: number;
    maxPodIps: number;
  };
  storagePvc: {
    totalPvcs: number;
    boundPvcs: number;
    pendingPvcs: number;
    capacityGB: number;
    usedGB: number;
  };
}

export interface K8sControlPlaneComponent {
  name: string;
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  replicas: string;
  version?: string;
  latencyMs: number;
  message: string;
}

export interface K8sNodeCondition {
  type: 'Ready' | 'MemoryPressure' | 'DiskPressure' | 'PIDPressure' | 'NetworkUnavailable';
  status: 'True' | 'False' | 'Unknown';
  reason: string;
  message: string;
}

export interface K8sNode {
  name: string;
  role: 'control-plane' | 'worker';
  status: 'Ready' | 'NotReady' | 'SchedulingDisabled';
  internalIp: string;
  externalIp?: string;
  osImage: string;
  kernelVersion: string;
  kubeletVersion: string;
  containerRuntime: string;
  uptime: string;
  cordoned: boolean;
  taints: { key: string; value?: string; effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute' }[];
  conditions: K8sNodeCondition[];
  capacity: { cpuCores: number; memoryBytes: number; pods: number };
  allocatable: { cpuCores: number; memoryBytes: number; pods: number };
  usage: {
    cpuCores: number;
    cpuPercent: number;
    memoryBytes: number;
    memoryPercent: number;
    podsCount: number;
  };
}

export interface K8sContainerStatus {
  name: string;
  image: string;
  state: 'running' | 'waiting' | 'terminated';
  ready: boolean;
  restartCount: number;
  startedAt?: string;
  exitCode?: number;
  ports: number[];
  cpuUsagePercent: number;
  memoryUsageBytes: number;
  requestCpu?: string;
  requestMem?: string;
  limitCpu?: string;
  limitMem?: string;
}

export interface K8sPod {
  name: string;
  namespace: string;
  status: K8sPodStatus;
  readyContainers: string; // e.g. "2/2"
  restarts: number;
  nodeName: string;
  podIp: string;
  hostIp: string;
  age: string;
  qosClass: 'Guaranteed' | 'Burstable' | 'BestEffort';
  labels: Record<string, string>;
  containers: K8sContainerStatus[];
  yamlManifest: string;
  logs: { timestamp: string; stream: 'stdout' | 'stderr'; message: string }[];
  events: { type: 'Normal' | 'Warning'; reason: string; message: string; age: string }[];
}

export interface K8sDeployment {
  name: string;
  namespace: string;
  replicasDesired: number;
  replicasCurrent: number;
  replicasAvailable: number;
  replicasUpdated: number;
  strategy: 'RollingUpdate' | 'Recreate';
  image: string;
  conditions: string;
  age: string;
  labels: Record<string, string>;
  yamlManifest?: string;
}

export interface K8sDaemonSet {
  name: string;
  namespace: string;
  desiredNumberScheduled: number;
  currentNumberScheduled: number;
  numberReady: number;
  nodeSelector: string;
  image: string;
  age: string;
}

export interface K8sStatefulSet {
  name: string;
  namespace: string;
  replicasDesired: number;
  replicasReady: number;
  serviceName: string;
  image: string;
  age: string;
}

export interface K8sServicePort {
  name: string;
  protocol: 'TCP' | 'UDP';
  port: number;
  targetPort: number;
  nodePort?: number;
}

export interface K8sService {
  name: string;
  namespace: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
  clusterIp: string;
  externalIp?: string;
  ports: K8sServicePort[];
  selector: Record<string, string>;
  endpointsCount: number;
  age: string;
}

export interface K8sIngressPath {
  path: string;
  backendService: string;
  backendPort: number;
}

export interface K8sIngress {
  name: string;
  namespace: string;
  hosts: string[];
  loadBalancerIp: string;
  paths: K8sIngressPath[];
  tls: boolean;
  certStatus: 'Valid' | 'ExpiringSoon' | 'Invalid';
  age: string;
}

export interface K8sPersistentVolumeClaim {
  name: string;
  namespace: string;
  status: 'Bound' | 'Pending' | 'Lost';
  volumeName: string;
  capacity: string;
  accessModes: string[];
  storageClass: string;
  age: string;
}

export interface K8sEvent {
  id: string;
  type: 'Normal' | 'Warning' | 'Critical';
  reason: string;
  objectKind: string;
  objectName: string;
  namespace: string;
  message: string;
  source: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
}

export interface K8sHelmRelease {
  name: string;
  namespace: string;
  chart: string;
  appVersion: string;
  status: 'deployed' | 'failed' | 'pending-upgrade';
  revision: number;
  updated: string;
}

export interface K8sCluster {
  id: string;
  name: string;
  context: string;
  provider: string; // e.g. "Baremetal K8s", "Amazon EKS", "GKE Enterprise", "K3s Edge"
  version: string;
  apiServerUrl: string;
  status: K8sClusterStatus;
  cniPlugin: 'Cilium' | 'Calico' | 'Flannel';
  ingressController: string;
  summary: K8sClusterSummary;
  controlPlane: K8sControlPlaneComponent[];
  nodes: K8sNode[];
  pods: K8sPod[];
  deployments: K8sDeployment[];
  daemonSets: K8sDaemonSet[];
  statefulSets: K8sStatefulSet[];
  services: K8sService[];
  ingresses: K8sIngress[];
  pvcs: K8sPersistentVolumeClaim[];
  events: K8sEvent[];
  helmReleases: K8sHelmRelease[];
}

export type AuthRole = 'sre_lead' | 'sysops' | 'auditor';

export interface UserPermissions {
  canManageClusters: boolean;
  canTriggerDiagnostics: boolean;
  canExecuteCommands: boolean;
  canModifyBranding: boolean;
  canExportReports: boolean;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: AuthRole;
  roleTitle: string;
  avatar?: string;
  token?: string;
  lastLogin: string;
  department?: string;
  twoFactorEnabled?: boolean;
  permissions: UserPermissions;
}

export interface PresetAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  role: AuthRole;
  roleTitle: string;
  badgeColor: string;
  description: string;
  defaultPassword: string;
}

export interface ActiveSessionInfo {
  tokenPrefix: string;
  username: string;
  name: string;
  role: AuthRole;
  roleTitle: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActive: string;
  expiresInMinutes: number;
  isCurrentSession: boolean;
}

export interface SecurityStats {
  status: 'HARDENED_PRODUCTION' | 'WARNING' | 'ELEVATED_RISK';
  securityScore: number;
  tlsVersion: string;
  cipherSuite: string;
  passwordHashingAlgo: string;
  hashingIterations: number;
  bruteForceProtection: boolean;
  rateLimitWindowMinutes: number;
  maxFailedAttempts: number;
  currentlyBlockedIps: string[];
  totalFailedAttempts24h: number;
  activeSessionsCount: number;
  sessions: ActiveSessionInfo[];
  recentSecurityAudit: ContainerActivityLog[];
}



