import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  K8sCluster,
  K8sNode,
  K8sPod,
  K8sDeployment,
  K8sDaemonSet,
  K8sStatefulSet,
  K8sService,
  K8sIngress,
  K8sPersistentVolumeClaim,
  K8sEvent,
  FeatureAnalysisType
} from '../types';
import { defaultK8sClusters } from '../data/mockKubernetes';
import {
  Activity,
  Server,
  Layers,
  Cpu,
  HardDrive,
  Network,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Terminal as TerminalIcon,
  Search,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCw,
  Pause,
  ExternalLink,
  ChevronDown,
  X,
  Copy,
  Check,
  Code2,
  AlertCircle,
  Sliders,
  Plus,
  Minus,
  ArrowUpRight,
  Maximize2,
  FileText,
  Boxes,
  Zap,
  Globe,
  Lock,
  CornerDownRight,
  ShieldAlert,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { exportK8sClusterData } from '../utils/exportGenerators';

interface KubernetesViewProps {
  onNavigateToAssistant?: (promptText: string) => void;
  onOpenAiAnalysis?: (feature?: FeatureAnalysisType) => void;
}

type K8sTabType = 'overview' | 'nodes' | 'pods' | 'workloads' | 'network' | 'storage' | 'events' | 'terminal';
type WorkloadSubTab = 'deployments' | 'statefulsets' | 'daemonsets' | 'helm';
type InspectorTab = 'specs' | 'containers' | 'logs' | 'terminal' | 'yaml' | 'ai-diagnose';

export default function KubernetesView({ onNavigateToAssistant, onOpenAiAnalysis }: KubernetesViewProps) {
  // Clusters state
  const [clusters, setClusters] = useState<K8sCluster[]>(defaultK8sClusters);
  const [selectedClusterId, setSelectedClusterId] = useState<string>('k8s-prod-jkt-01');

  // Active Cluster
  const currentCluster = useMemo(() => {
    return clusters.find(c => c.id === selectedClusterId) || clusters[0];
  }, [clusters, selectedClusterId]);

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<K8sTabType>('overview');
  const [workloadTab, setWorkloadTab] = useState<WorkloadSubTab>('deployments');

  // Filters
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [podStatusFilter, setPodStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [eventSeverityFilter, setEventSeverityFilter] = useState<'all' | 'Warning' | 'Normal'>('all');

  // Live Refresh & Countdown
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(15); // seconds, 0 = off
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(15);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString('id-ID'));

  // Inspector Drawer (Pod or Node)
  const [inspectingPod, setInspectingPod] = useState<K8sPod | null>(null);
  const [inspectingNode, setInspectingNode] = useState<K8sNode | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('specs');
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);

  // Pod Logs state
  const [logFilterQuery, setLogFilterQuery] = useState<string>('');
  const [autoScrollLogs, setAutoScrollLogs] = useState<boolean>(true);
  const logScrollRef = useRef<HTMLDivElement | null>(null);

  // In-Pod Exec Terminal state
  const [podExecInput, setPodExecInput] = useState<string>('');
  const [podExecHistory, setPodExecHistory] = useState<Array<{ type: 'input' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: 'Connected to container shell session via WebSocket stream (TTY)' },
    { type: 'output', text: 'Linux 6.8.0-38-generic #38-Ubuntu SMP x86_64 x86_64 x86_64 GNU/Linux' },
    { type: 'output', text: 'Type "help" or standard linux commands (ls, env, ps, netstat, df -h)' }
  ]);
  const execScrollRef = useRef<HTMLDivElement | null>(null);

  // AI Pod Diagnosing
  const [isDiagnosingPod, setIsDiagnosingPod] = useState<boolean>(false);
  const [podDiagnosisResult, setPodDiagnosisResult] = useState<any | null>(null);

  // Scale Deployment Modal
  const [scalingDeployment, setScalingDeployment] = useState<K8sDeployment | null>(null);
  const [newReplicasCount, setNewReplicasCount] = useState<number>(1);
  const [isScaling, setIsScaling] = useState<boolean>(false);

  // Interactive Web Kubectl Terminal Tab
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'input' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: 'Connected to Kubernetes API Server v1.30.2' },
    { type: 'output', text: 'Active context: kubernetes-admin@k8s-prod-jkt-01 (Namespace: default)' },
    { type: 'output', text: 'Kubeconfig loaded. Type "help" or run any kubectl command (e.g., "kubectl get pods -A", "kubectl top nodes")' }
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const termScrollRef = useRef<HTMLDivElement | null>(null);

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      setSecondsUntilRefresh(prev => {
        if (prev <= 1) {
          triggerRefreshTelemetry(true);
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  // Trigger manual refresh
  const triggerRefreshTelemetry = (silent = false) => {
    if (!silent) setIsRefreshing(true);
    setTimeout(() => {
      // Simulate minor jitter in telemetry
      setClusters(prevClusters => {
        return prevClusters.map(cl => {
          if (cl.id !== selectedClusterId) return cl;
          const cpuJitter = (Math.random() * 2 - 1);
          const memJitter = (Math.random() * 2 - 1);
          return {
            ...cl,
            summary: {
              ...cl.summary,
              cpu: {
                ...cl.summary.cpu,
                usagePercent: Math.max(10, Math.min(95, Math.round((cl.summary.cpu.usagePercent + cpuJitter) * 10) / 10))
              },
              memory: {
                ...cl.summary.memory,
                usagePercent: Math.max(15, Math.min(95, Math.round((cl.summary.memory.usagePercent + memJitter) * 10) / 10))
              }
            }
          };
        });
      });
      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
      setSecondsUntilRefresh(autoRefreshInterval);
      if (!silent) setIsRefreshing(false);
    }, 600);
  };

  // Namespaces in current cluster
  const availableNamespaces = useMemo(() => {
    const set = new Set<string>();
    currentCluster.pods.forEach(p => set.add(p.namespace));
    currentCluster.deployments.forEach(d => set.add(d.namespace));
    currentCluster.services.forEach(s => set.add(s.namespace));
    return ['all', ...Array.from(set).sort()];
  }, [currentCluster]);

  // Filtered pods
  const filteredPods = useMemo(() => {
    return currentCluster.pods.filter(p => {
      const matchNs = selectedNamespace === 'all' || p.namespace === selectedNamespace;
      const matchStatus = 
        podStatusFilter === 'all' 
          ? true 
          : podStatusFilter === 'warnings' 
          ? (p.status === 'CrashLoopBackOff' || p.status === 'OOMKilled' || p.status === 'ImagePullBackOff' || p.status === 'Pending' || p.restarts > 0)
          : p.status === podStatusFilter;
      const matchSearch = searchQuery.trim() === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.nodeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.podIp.includes(searchQuery);
      return matchNs && matchStatus && matchSearch;
    });
  }, [currentCluster, selectedNamespace, podStatusFilter, searchQuery]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return currentCluster.events.filter(e => {
      const matchType = eventSeverityFilter === 'all' || e.type === eventSeverityFilter;
      const matchSearch = searchQuery.trim() === '' ||
        e.objectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [currentCluster, eventSeverityFilter, searchQuery]);

  // Cordon / Uncordon Node
  const handleToggleCordonNode = (nodeName: string) => {
    setClusters(prev => prev.map(cl => {
      if (cl.id !== selectedClusterId) return cl;
      return {
        ...cl,
        nodes: cl.nodes.map(n => {
          if (n.name === nodeName) {
            const nextCordoned = !n.cordoned;
            return {
              ...n,
              cordoned: nextCordoned,
              status: nextCordoned ? 'SchedulingDisabled' : 'Ready'
            };
          }
          return n;
        })
      };
    }));
  };

  // Rolling Restart Deployment
  const handleRolloutRestartDeployment = (deployName: string) => {
    alert(`Triggered rolling restart untuk Deployment "${deployName}" pada namespace target. Kube-controller-manager sedang merefresh pod replicas.`);
  };

  // Scale Deployment Action
  const handleApplyScaling = () => {
    if (!scalingDeployment) return;
    setIsScaling(true);
    setTimeout(() => {
      setClusters(prev => prev.map(cl => {
        if (cl.id !== selectedClusterId) return cl;
        return {
          ...cl,
          deployments: cl.deployments.map(d => {
            if (d.name === scalingDeployment.name && d.namespace === scalingDeployment.namespace) {
              return {
                ...d,
                replicasDesired: newReplicasCount,
                replicasCurrent: newReplicasCount,
                replicasAvailable: newReplicasCount
              };
            }
            return d;
          })
        };
      }));
      setIsScaling(false);
      setScalingDeployment(null);
    }, 600);
  };

  // AI Diagnostic for Pod
  const handleRunAiPodDiagnosis = (pod: K8sPod) => {
    setIsDiagnosingPod(true);
    setPodDiagnosisResult(null);

    // Call server API or fallback
    fetch('/api/ai/analyze-feature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feature: 'kubernetes',
        contextData: {
          podName: pod.name,
          namespace: pod.namespace,
          status: pod.status,
          restarts: pod.restarts,
          nodeName: pod.nodeName,
          events: pod.events,
          recentLogs: pod.logs.slice(-10)
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        setPodDiagnosisResult(data);
        setIsDiagnosingPod(false);
      })
      .catch(() => {
        // Fallback diagnosis
        setTimeout(() => {
          setPodDiagnosisResult({
            title: `Diagnosa Anomali Pod: ${pod.name}`,
            healthScore: pod.status === 'Running' ? 95 : 28,
            riskLevel: pod.status === 'Running' ? 'LOW' : 'HIGH',
            summary: pod.status === 'CrashLoopBackOff'
              ? `Pod mengalami CrashLoopBackOff akibat pembatasan memori cgroup (OOMKilled exit code 137). JVM Heap Space melampaui limit 2GiB yang ditetapkan di container spec.`
              : pod.status === 'Pending'
              ? `Pod tidak dapat dijadwalkan (Unschedulable) karena meminta nodeSelector 'accelerator=nvidia-h100' yang tidak tersedia pada 5 node worker saat ini.`
              : `Pod beroperasi normal dengan tingkat utilisasi resource dalam batas wajar.`,
            keyFindings: [
              `Status Terkini: ${pod.status} (${pod.readyContainers} Containers Ready)`,
              `Total Restarts: ${pod.restarts} kali pada node ${pod.nodeName}`,
              `QoS Class: ${pod.qosClass}`
            ],
            recommendations: [
              {
                priority: 'P1',
                title: 'Tingkatkan Batas Memory Limit',
                action: 'Naikkan limits.memory dari 2Gi ke 4Gi pada Deployment YAML manifest',
                impact: 'Mencegah kernel Linux oom_killer menembak proses batch transaction'
              },
              {
                priority: 'P2',
                title: 'Konfigurasi JVM MaxRAMPercentage',
                action: 'Tambahkan env flag: JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0"',
                impact: 'Memastikan garbage collector mengklaim kembali memori sebelum mencapai cgroup threshold'
              }
            ],
            remediationCommands: [
              `kubectl -n ${pod.namespace} get pod ${pod.name} -o yaml`,
              `kubectl -n ${pod.namespace} describe pod ${pod.name}`,
              `kubectl -n ${pod.namespace} logs ${pod.name} --previous --tail=50`,
              `kubectl -n ${pod.namespace} set resources deployment ${pod.labels?.app || 'app'} --limits=memory=4Gi`
            ]
          });
          setIsDiagnosingPod(false);
        }, 800);
      });
  };

  // In-Pod Exec Shell handler
  const handleSendPodExec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podExecInput.trim()) return;
    const cmd = podExecInput.trim();
    const newHist = [...podExecHistory, { type: 'input' as const, text: `$ ${cmd}` }];

    if (cmd === 'clear') {
      setPodExecHistory([]);
      setPodExecInput('');
      return;
    }

    if (cmd === 'help') {
      newHist.push({
        type: 'output',
        text: 'Simulated K8s Exec Shell Commands: ls, pwd, env, ps, netstat, df -h, cat /etc/resolv.conf, uname -a, clear'
      });
    } else if (cmd === 'ls' || cmd === 'ls -la') {
      newHist.push({
        type: 'output',
        text: 'bin   dev  home  lib64  mnt  proc  run   srv  tmp  var\nboot  etc  lib   media  opt  root  sbin  sys  usr  app'
      });
    } else if (cmd === 'pwd') {
      newHist.push({ type: 'output', text: '/app' });
    } else if (cmd === 'env') {
      newHist.push({
        type: 'output',
        text: 'KUBERNETES_SERVICE_PORT=443\nKUBERNETES_PORT=tcp://10.96.0.1:443\nNODE_ENV=production\nHOSTNAME=' + (inspectingPod?.name || 'pod-01')
      });
    } else if (cmd === 'ps' || cmd === 'ps aux') {
      newHist.push({
        type: 'output',
        text: 'PID   USER     TIME  COMMAND\n    1 root      0:14 node server.js\n   42 root      0:01 /bin/sh'
      });
    } else if (cmd === 'df -h') {
      newHist.push({
        type: 'output',
        text: 'Filesystem      Size  Used Avail Use% Mounted on\noverlay         100G   24G   76G  24% /\ntmpfs            64M     0   64M   0% /dev'
      });
    } else {
      newHist.push({
        type: 'output',
        text: `Executed: ${cmd}\nCommand exit code 0`
      });
    }

    setPodExecHistory(newHist);
    setPodExecInput('');
    setTimeout(() => {
      execScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Global Kubectl Simulator handler
  const handleRunKubectlTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    const newHist = [...terminalHistory, { type: 'input' as const, text: `$ ${cmd}` }];

    if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    }

    if (cmd === 'help') {
      newHist.push({
        type: 'output',
        text: `Available Kubectl Commands:\n  kubectl get nodes -o wide\n  kubectl get pods -A\n  kubectl get pods -n <namespace>\n  kubectl get deployments\n  kubectl get svc\n  kubectl top nodes\n  kubectl top pods\n  kubectl cluster-info\n  clear`
      });
    } else if (cmd.includes('get nodes')) {
      const lines = [
        'NAME            STATUS   ROLES           AGE    VERSION   INTERNAL-IP    OS-IMAGE',
        ...currentCluster.nodes.map(n => 
          `${n.name.padEnd(16)} ${n.status.padEnd(8)} ${n.role.padEnd(15)} ${n.uptime.padEnd(6)} ${n.kubeletVersion.padEnd(9)} ${n.internalIp.padEnd(14)} ${n.osImage}`
        )
      ];
      newHist.push({ type: 'output', text: lines.join('\n') });
    } else if (cmd.includes('get pods')) {
      const lines = [
        'NAMESPACE     NAME                                           READY   STATUS             RESTARTS   AGE',
        ...currentCluster.pods.map(p => 
          `${p.namespace.padEnd(13)} ${p.name.padEnd(46)} ${p.readyContainers.padEnd(7)} ${p.status.padEnd(18)} ${String(p.restarts).padEnd(10)} ${p.age}`
        )
      ];
      newHist.push({ type: 'output', text: lines.join('\n') });
    } else if (cmd.includes('get deploy') || cmd.includes('get deployments')) {
      const lines = [
        'NAMESPACE     NAME                      READY   UP-TO-DATE   AVAILABLE   AGE',
        ...currentCluster.deployments.map(d =>
          `${d.namespace.padEnd(13)} ${d.name.padEnd(25)} ${`${d.replicasAvailable}/${d.replicasDesired}`.padEnd(7)} ${String(d.replicasUpdated).padEnd(12)} ${String(d.replicasAvailable).padEnd(11)} ${d.age}`
        )
      ];
      newHist.push({ type: 'output', text: lines.join('\n') });
    } else if (cmd.includes('top nodes')) {
      const lines = [
        'NAME            CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%',
        ...currentCluster.nodes.map(n =>
          `${n.name.padEnd(16)} ${`${n.usage.cpuCores}m`.padEnd(12)} ${`${n.usage.cpuPercent}%`.padEnd(6)} ${`${Math.round(n.usage.memoryBytes / (1024 * 1024 * 1024))}Gi`.padEnd(15)} ${n.usage.memoryPercent}%`
        )
      ];
      newHist.push({ type: 'output', text: lines.join('\n') });
    } else if (cmd.includes('cluster-info')) {
      newHist.push({
        type: 'output',
        text: `Kubernetes control plane is running at ${currentCluster.apiServerUrl}\nCoreDNS is running at https://${currentCluster.apiServerUrl}:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy\nCilium eBPF CNI active with VXLAN tunneling`
      });
    } else {
      newHist.push({
        type: 'output',
        text: `[kubectl] Command dispatched successfully on cluster '${currentCluster.name}'\nResult: 200 OK (Processed via Kubernetes API Server)`
      });
    }

    setTerminalHistory(newHist);
    setTerminalInput('');
    setTimeout(() => {
      termScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Export cluster telemetry in 5 formats: Excel (.xlsx), PDF (.pdf), Word (.doc), CSV, JSON
  const handleExportData = (format: 'excel' | 'pdf' | 'word' | 'json' | 'csv') => {
    setShowExportMenu(false);

    if (format === 'excel' || format === 'pdf' || format === 'word') {
      exportK8sClusterData(currentCluster, format);
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentCluster, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `k8s-telemetry-${currentCluster.id}-${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // CSV format
      const rows = [
        ['Namespace', 'Pod Name', 'Status', 'Ready', 'Restarts', 'Node', 'Pod IP', 'Age'],
        ...currentCluster.pods.map(p => [
          p.namespace,
          p.name,
          p.status,
          p.readyContainers,
          p.restarts,
          p.nodeName,
          p.podIp,
          p.age
        ])
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `k8s-pods-${currentCluster.id}-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Cluster Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative">
        {/* Subtle decorative glow - isolated overflow hidden so dropdowns are not clipped */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Cluster Switcher & Identity */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Boxes className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  KUBERNETES CLUSTER INTELLIGENCE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {currentCluster.version}
                </span>
              </div>

              {/* Cluster Dropdown Selector */}
              <div className="mt-1 flex items-center gap-2.5">
                <select
                  value={selectedClusterId}
                  onChange={(e) => setSelectedClusterId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-100 font-extrabold text-lg sm:text-xl rounded-xl px-3 py-1 focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
                >
                  {clusters.map(cl => (
                    <option key={cl.id} value={cl.id} className="bg-slate-900 text-white font-bold">
                      {cl.name} ({cl.provider})
                    </option>
                  ))}
                </select>

                <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 border ${
                  currentCluster.status === 'HEALTHY'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : currentCluster.status === 'WARNING'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {currentCluster.status === 'HEALTHY' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>{currentCluster.status}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
                <span>CNI: <strong className="text-slate-200">{currentCluster.cniPlugin}</strong></span>
                <span>•</span>
                <span>Ingress: <strong className="text-slate-200">{currentCluster.ingressController}</strong></span>
                <span>•</span>
                <span>API: <span className="text-blue-400 underline">{currentCluster.apiServerUrl}</span></span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AI Deep Analysis Button */}
            <button
              onClick={() => onOpenAiAnalysis?.('kubernetes')}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
              title="Analisa kesehatan menyeluruh kluster Kubernetes ini dengan AI"
            >
              <Sparkles className="w-4 h-4 animate-spin text-amber-300" style={{ animationDuration: '4s' }} />
              <span>Analisa AI Kluster</span>
            </button>

            {/* Quick Web Kubectl Button */}
            <button
              onClick={() => setActiveTab('terminal')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono shadow-xs"
              title="Buka Terminal Kubectl"
            >
              <TerminalIcon className="w-4 h-4 text-emerald-400" />
              <span>CLI Kubectl</span>
            </button>

            {/* Live Refresh Button & Timer */}
            <button
              onClick={() => triggerRefreshTelemetry(false)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh data telemetri K8s"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="text-[10px] font-mono opacity-60">({secondsUntilRefresh}s)</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  showExportMenu ? 'ring-2 ring-blue-500/50 bg-slate-800 text-white border-blue-500/50' : ''
                }`}
                title="Ekspor Laporan & Telemetri Kluster K8s"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Ekspor</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {showExportMenu && (
                <>
                  {/* Backdrop overlay to close when clicking anywhere outside */}
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setShowExportMenu(false)}
                  />

                  {/* Dropdown Menu Container */}
                  <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50 text-slate-200 font-sans animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-800 mb-1 flex items-center justify-between">
                      <span>PILIHAN FORMAT EKSPOR</span>
                      <span className="text-[8px] text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-500/10">5 FORMAT</span>
                    </div>

                    {/* Excel */}
                    <button
                      onClick={() => handleExportData('excel')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>Microsoft Excel</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-black border border-emerald-500/30">.XLSX</span>
                    </button>

                    {/* PDF */}
                    <button
                      onClick={() => handleExportData('pdf')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                        <span>Dokumen PDF</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono text-[10px] font-black border border-rose-500/30">.PDF</span>
                    </button>

                    {/* Word */}
                    <button
                      onClick={() => handleExportData('word')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span>Microsoft Word</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono text-[10px] font-black border border-blue-500/30">.DOC</span>
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    {/* CSV */}
                    <button
                      onClick={() => handleExportData('csv')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Download className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                        <span>Spreadsheet CSV</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400 font-mono text-[10px] font-black border border-teal-500/30">.CSV</span>
                    </button>

                    {/* JSON */}
                    <button
                      onClick={() => handleExportData('json')}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Code2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>Raw Telemetry</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono text-[10px] font-black border border-amber-500/30">.JSON</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Key Performance Indicators (KPI HUD) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Nodes KPI */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Node Pool</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {currentCluster.summary.nodeCount.ready} <span className="text-xs text-slate-400 font-normal">/ {currentCluster.summary.nodeCount.total}</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% Nodes Ready
            </div>
          </div>
        </div>

        {/* Pods KPI */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Total Pods</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {currentCluster.summary.podCount.running} <span className="text-xs text-slate-400 font-normal">/ {currentCluster.summary.podCount.total}</span>
            </div>
            <div className="text-[11px] font-semibold text-amber-400 mt-0.5 flex items-center gap-1 truncate">
              {currentCluster.summary.podCount.failed > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-rose-400">{currentCluster.summary.podCount.failed} CrashLoop</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Semua Sehat
                </>
              )}
            </div>
          </div>
        </div>

        {/* CPU Allocation & Usage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>CPU Cluster</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {currentCluster.summary.cpu.usagePercent}%
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              Req: {currentCluster.summary.cpu.requestedCores} / {currentCluster.summary.cpu.capacityCores} Cores
            </div>
          </div>
        </div>

        {/* Memory Allocation & Usage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>RAM Cluster</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {currentCluster.summary.memory.usagePercent}%
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              {Math.round(currentCluster.summary.memory.usageBytes / (1024 * 1024 * 1024))} GB / {Math.round(currentCluster.summary.memory.capacityBytes / (1024 * 1024 * 1024))} GB
            </div>
          </div>
        </div>

        {/* Network Throughput */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Throughput CNI</span>
            <Network className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {Math.round(currentCluster.summary.network.rxRateMBs + currentCluster.summary.network.txRateMBs)} <span className="text-xs font-normal">MB/s</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              RX {currentCluster.summary.network.rxRateMBs} / TX {currentCluster.summary.network.txRateMBs}
            </div>
          </div>
        </div>

        {/* Storage Volume Claims */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Penyimpanan PVC</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-100 font-mono">
              {currentCluster.summary.storagePvc.boundPvcs} <span className="text-xs text-slate-400 font-normal">/ {currentCluster.summary.storagePvc.totalPvcs}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
              {currentCluster.summary.storagePvc.usedGB} GB Terpakai
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Main tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'overview', label: 'Ringkasan & Control Plane', icon: Activity },
            { id: 'nodes', label: `Node Pool (${currentCluster.nodes.length})`, icon: Server },
            { id: 'pods', label: `Pods (${currentCluster.pods.length})`, icon: Boxes },
            { id: 'workloads', label: 'Workloads (Deployments)', icon: Layers },
            { id: 'network', label: 'Networking & Ingress', icon: Network },
            { id: 'storage', label: 'Storage & PVC', icon: HardDrive },
            { id: 'events', label: `Audit Events (${currentCluster.events.length})`, icon: AlertTriangle },
            { id: 'terminal', label: 'Kubectl Shell', icon: TerminalIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as K8sTabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Namespace Filter */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-bold text-slate-400">Namespace:</span>
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs font-mono font-bold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {availableNamespaces.map(ns => (
              <option key={ns} value={ns}>
                {ns === 'all' ? 'Semua Namespace (All)' : ns}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW & CONTROL PLANE */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Control Plane Components Health Matrix */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Kesehatan Komponen Control Plane (HA Master Quorum)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitoring latensi dan ketersediaan layanan inti Kubernetes API, etcd Raft consensus, dan scheduler.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                100% HEALTHY QUORUM
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {currentCluster.controlPlane.map((comp, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-slate-100">{comp.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {comp.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {comp.message}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Replicas: <strong className="text-slate-200">{comp.replicas}</strong></span>
                    <span>Latensi: <strong className="text-emerald-400">{comp.latencyMs} ms</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Pressure & Top Consumers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pods by Resource Consumption */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Top Pods dengan Utilisasi Resource Tertinggi
                </h4>
                <button
                  onClick={() => setActiveTab('pods')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Lihat Semua Pods <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {currentCluster.pods.slice(0, 4).map(pod => (
                  <div
                    key={pod.name}
                    onClick={() => {
                      setInspectingPod(pod);
                      setInspectorTab('specs');
                    }}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/50 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-100 truncate group-hover:text-blue-400">
                          {pod.name}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          pod.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {pod.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Namespace: <span className="text-slate-300">{pod.namespace}</span> • Node: <span className="text-slate-300">{pod.nodeName}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono text-xs">
                      <div className="font-bold text-slate-200">
                        {pod.containers[0]?.cpuUsagePercent || 0}% CPU
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {Math.round((pod.containers[0]?.memoryUsageBytes || 0) / (1024 * 1024))} MB RAM
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Cluster Warnings & Events */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Peringatan Anomali & Critical Events Terbaru
                  </h4>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Semua Events <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {currentCluster.events.slice(0, 3).map(evt => (
                    <div
                      key={evt.id}
                      className={`p-3 rounded-xl border text-xs font-mono ${
                        evt.type === 'Warning'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${evt.type === 'Warning' ? 'bg-rose-500 animate-ping' : 'bg-blue-500'}`} />
                          [{evt.reason}] {evt.objectKind}/{evt.objectName}
                        </span>
                        <span className="text-[10px] opacity-70">{evt.lastSeen}</span>
                      </div>
                      <p className="mt-1 text-[11px] opacity-90 font-sans leading-relaxed">
                        {evt.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick AI Callout */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-purple-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-indigo-200 font-medium">
                    Terdeteksi 1 Pod CrashLoopBackOff & 1 PVC Pending di kluster ini.
                  </span>
                </div>
                <button
                  onClick={() => onOpenAiAnalysis?.('kubernetes')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shrink-0 transition-colors cursor-pointer"
                >
                  Analisis Solusi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: NODES VIEW */}
      {/* ============================================================== */}
      {activeTab === 'nodes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" />
                Daftar Node Worker & Control-Plane ({currentCluster.nodes.length} Nodes)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola status penjadwalan (cordon/uncordon), alokasi CPU, RAM, kondisi tekanan memori, dan versi Kubelet.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCluster.nodes.map(node => (
              <div
                key={node.name}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between ${
                  node.cordoned
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Node Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono font-bold text-base text-slate-100">{node.name}</h4>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          node.role === 'control-plane'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {node.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        IP: <span className="text-slate-200">{node.internalIp}</span> • Uptime: {node.uptime}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono border ${
                      node.status === 'Ready'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  {/* Resource Gauges */}
                  <div className="mt-4 space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {/* CPU Usage */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">CPU Usage:</span>
                        <span className="font-bold text-slate-200">{node.usage.cpuPercent}% ({node.usage.cpuCores} Cores)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            node.usage.cpuPercent > 80 ? 'bg-rose-500' : node.usage.cpuPercent > 60 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${node.usage.cpuPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* RAM Usage */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-400">Memory Usage:</span>
                        <span className="font-bold text-slate-200">
                          {node.usage.memoryPercent}% ({Math.round(node.usage.memoryBytes / (1024 * 1024 * 1024))} GB)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            node.usage.memoryPercent > 80 ? 'bg-rose-500' : node.usage.memoryPercent > 60 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${node.usage.memoryPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Pods capacity */}
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Pods Hosted:</span>
                      <span className="font-bold text-slate-200">{node.usage.podsCount} / {node.capacity.pods} Max</span>
                    </div>
                  </div>

                  {/* Node Spec details */}
                  <div className="mt-3 text-[11px] font-mono text-slate-400 space-y-1">
                    <div>OS: <span className="text-slate-300">{node.osImage}</span></div>
                    <div>Runtime: <span className="text-slate-300">{node.containerRuntime}</span></div>
                    <div>Kubelet: <span className="text-slate-300">{node.kubeletVersion}</span></div>
                  </div>
                </div>

                {/* Node Actions Toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleCordonNode(node.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      node.cordoned
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {node.cordoned ? 'Uncordon Node' : 'Cordon (Disable)'}
                  </button>

                  <button
                    onClick={() => {
                      setInspectingNode(node);
                    }}
                    className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Detail Node
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PODS WORKLOADS VIEW */}
      {/* ============================================================== */}
      {activeTab === 'pods' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 font-mono">Status:</span>
              {(['all', 'warnings', 'Running', 'CrashLoopBackOff', 'Pending'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setPodStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                    podStatusFilter === st
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {st === 'all' ? 'Semua Status' : st === 'warnings' ? '⚠️ Warnings Only' : st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pod, IP, atau node..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Pods Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Nama Pod</th>
                    <th className="px-4 py-3.5">Namespace</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Ready</th>
                    <th className="px-4 py-3.5">Restarts</th>
                    <th className="px-4 py-3.5">Node</th>
                    <th className="px-4 py-3.5">Pod IP</th>
                    <th className="px-4 py-3.5">Age</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredPods.map(pod => (
                    <tr
                      key={pod.name}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setInspectingPod(pod);
                        setInspectorTab('specs');
                      }}
                    >
                      <td className="px-4 py-3 font-bold text-slate-100 group-hover:text-blue-400 flex items-center gap-2">
                        <Boxes className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[240px]">{pod.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-bold">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          {pod.namespace}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                          pod.status === 'Running'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : pod.status === 'CrashLoopBackOff' || pod.status === 'OOMKilled'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pod.status === 'Running' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {pod.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{pod.readyContainers}</td>
                      <td className="px-4 py-3">
                        <span className={pod.restarts > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {pod.restarts}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[120px]">{pod.nodeName}</td>
                      <td className="px-4 py-3 text-slate-400">{pod.podIp}</td>
                      <td className="px-4 py-3 text-slate-400">{pod.age}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Logs shortcut */}
                          <button
                            onClick={() => {
                              setInspectingPod(pod);
                              setInspectorTab('logs');
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Buka Live Logs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Exec terminal */}
                          <button
                            onClick={() => {
                              setInspectingPod(pod);
                              setInspectorTab('terminal');
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Exec Shell Terminal"
                          >
                            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          {/* AI Diagnose */}
                          <button
                            onClick={() => {
                              setInspectingPod(pod);
                              setInspectorTab('ai-diagnose');
                              handleRunAiPodDiagnosis(pod);
                            }}
                            className="p-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg transition-colors cursor-pointer"
                            title="Diagnosa Pod dengan AI"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: WORKLOADS (DEPLOYMENTS, DAEMONSETS, STATEFULSETS) */}
      {/* ============================================================== */}
      {activeTab === 'workloads' && (
        <div className="space-y-4">
          {/* Sub-Workload Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'deployments', label: `Deployments (${currentCluster.deployments.length})` },
              { id: 'statefulsets', label: `StatefulSets (${currentCluster.statefulSets.length})` },
              { id: 'daemonsets', label: `DaemonSets (${currentCluster.daemonSets.length})` },
              { id: 'helm', label: `Helm Releases (${currentCluster.helmReleases.length})` }
            ].map(w => (
              <button
                key={w.id}
                onClick={() => setWorkloadTab(w.id as WorkloadSubTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  workloadTab === w.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>

          {/* Deployments Table */}
          {workloadTab === 'deployments' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Deployment Name</th>
                    <th className="px-5 py-3.5">Namespace</th>
                    <th className="px-5 py-3.5">Replicas (Ready/Target)</th>
                    <th className="px-5 py-3.5">Strategy</th>
                    <th className="px-5 py-3.5">Container Image</th>
                    <th className="px-5 py-3.5">Age</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {currentCluster.deployments.map(dep => (
                    <tr key={dep.name} className="hover:bg-slate-800/40">
                      <td className="px-5 py-3.5 font-bold text-slate-100">{dep.name}</td>
                      <td className="px-5 py-3.5 text-slate-300">{dep.namespace}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${dep.replicasAvailable === dep.replicasDesired ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {dep.replicasAvailable} / {dep.replicasDesired}
                          </span>
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${(dep.replicasAvailable / (dep.replicasDesired || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{dep.strategy}</td>
                      <td className="px-5 py-3.5 text-slate-300 truncate max-w-[200px]" title={dep.image}>
                        {dep.image}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{dep.age}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setScalingDeployment(dep);
                              setNewReplicasCount(dep.replicasDesired);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Scale (+/-)
                          </button>
                          <button
                            onClick={() => handleRolloutRestartDeployment(dep.name)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="Rolling Restart Pods"
                          >
                            Restart
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* StatefulSets */}
          {workloadTab === 'statefulsets' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">StatefulSet Name</th>
                    <th className="px-5 py-3.5">Namespace</th>
                    <th className="px-5 py-3.5">Replicas</th>
                    <th className="px-5 py-3.5">Headless Service</th>
                    <th className="px-5 py-3.5">Image</th>
                    <th className="px-5 py-3.5">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {currentCluster.statefulSets.map(sts => (
                    <tr key={sts.name}>
                      <td className="px-5 py-3.5 font-bold text-slate-100">{sts.name}</td>
                      <td className="px-5 py-3.5 text-slate-300">{sts.namespace}</td>
                      <td className="px-5 py-3.5 text-emerald-400 font-bold">{sts.replicasReady} / {sts.replicasDesired}</td>
                      <td className="px-5 py-3.5 text-slate-400">{sts.serviceName}</td>
                      <td className="px-5 py-3.5 text-slate-300">{sts.image}</td>
                      <td className="px-5 py-3.5 text-slate-400">{sts.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DaemonSets */}
          {workloadTab === 'daemonsets' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">DaemonSet Name</th>
                    <th className="px-5 py-3.5">Namespace</th>
                    <th className="px-5 py-3.5">Scheduled / Desired</th>
                    <th className="px-5 py-3.5">Node Selector</th>
                    <th className="px-5 py-3.5">Image</th>
                    <th className="px-5 py-3.5">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {currentCluster.daemonSets.map(ds => (
                    <tr key={ds.name}>
                      <td className="px-5 py-3.5 font-bold text-slate-100">{ds.name}</td>
                      <td className="px-5 py-3.5 text-slate-300">{ds.namespace}</td>
                      <td className="px-5 py-3.5 text-emerald-400 font-bold">{ds.numberReady} / {ds.desiredNumberScheduled}</td>
                      <td className="px-5 py-3.5 text-slate-400">{ds.nodeSelector}</td>
                      <td className="px-5 py-3.5 text-slate-300">{ds.image}</td>
                      <td className="px-5 py-3.5 text-slate-400">{ds.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Helm Releases */}
          {workloadTab === 'helm' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Release Name</th>
                    <th className="px-5 py-3.5">Namespace</th>
                    <th className="px-5 py-3.5">Chart Version</th>
                    <th className="px-5 py-3.5">App Version</th>
                    <th className="px-5 py-3.5">Revision</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {currentCluster.helmReleases.map(h => (
                    <tr key={h.name}>
                      <td className="px-5 py-3.5 font-bold text-slate-100">{h.name}</td>
                      <td className="px-5 py-3.5 text-slate-300">{h.namespace}</td>
                      <td className="px-5 py-3.5 text-blue-400">{h.chart}</td>
                      <td className="px-5 py-3.5 text-slate-300">{h.appVersion}</td>
                      <td className="px-5 py-3.5 text-slate-400">rev #{h.revision}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {h.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{h.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: NETWORKING & INGRESS */}
      {/* ============================================================== */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          {/* Services */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                Kubernetes Services (ClusterIP, NodePort, LoadBalancer)
              </h4>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Service Name</th>
                  <th className="px-5 py-3.5">Namespace</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Cluster IP</th>
                  <th className="px-5 py-3.5">External IP</th>
                  <th className="px-5 py-3.5">Ports (Service &rarr; Pod)</th>
                  <th className="px-5 py-3.5">Endpoints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {currentCluster.services.map(svc => (
                  <tr key={svc.name}>
                    <td className="px-5 py-3.5 font-bold text-slate-100">{svc.name}</td>
                    <td className="px-5 py-3.5 text-slate-300">{svc.namespace}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        svc.type === 'LoadBalancer' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {svc.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{svc.clusterIp}</td>
                    <td className="px-5 py-3.5 font-bold text-blue-400">{svc.externalIp || 'None'}</td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {svc.ports.map(p => `${p.port}:${p.targetPort}/${p.protocol}${p.nodePort ? ` (NodePort ${p.nodePort})` : ''}`).join(', ')}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{svc.endpointsCount} Replicas</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ingresses */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Ingress Routes & TLS Certificates
              </h4>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Ingress Name</th>
                  <th className="px-5 py-3.5">Namespace</th>
                  <th className="px-5 py-3.5">Host Domains</th>
                  <th className="px-5 py-3.5">LoadBalancer IP</th>
                  <th className="px-5 py-3.5">TLS Status</th>
                  <th className="px-5 py-3.5">Routing Paths</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {currentCluster.ingresses.map(ing => (
                  <tr key={ing.name}>
                    <td className="px-5 py-3.5 font-bold text-slate-100">{ing.name}</td>
                    <td className="px-5 py-3.5 text-slate-300">{ing.namespace}</td>
                    <td className="px-5 py-3.5 text-blue-400 font-bold">{ing.hosts.join(', ')}</td>
                    <td className="px-5 py-3.5 text-slate-300">{ing.loadBalancerIp}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                        <Lock className="w-3 h-3" />
                        TLS Aktif ({ing.certStatus})
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {ing.paths.map(p => `${p.path} &rarr; ${p.backendService}:${p.backendPort}`).join(' | ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: STORAGE & PVCs */}
      {/* ============================================================== */}
      {activeTab === 'storage' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                Persistent Volume Claims (PVC) & StorageClasses
              </h4>
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">PVC Name</th>
                  <th className="px-5 py-3.5">Namespace</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Kapasitas</th>
                  <th className="px-5 py-3.5">Volume Binding</th>
                  <th className="px-5 py-3.5">StorageClass</th>
                  <th className="px-5 py-3.5">Access Modes</th>
                  <th className="px-5 py-3.5">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {currentCluster.pvcs.map(pvc => (
                  <tr key={pvc.name}>
                    <td className="px-5 py-3.5 font-bold text-slate-100">{pvc.name}</td>
                    <td className="px-5 py-3.5 text-slate-300">{pvc.namespace}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        pvc.status === 'Bound'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                      }`}>
                        {pvc.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-200">{pvc.capacity}</td>
                    <td className="px-5 py-3.5 text-slate-400 truncate max-w-[160px]">{pvc.volumeName}</td>
                    <td className="px-5 py-3.5 text-blue-400">{pvc.storageClass}</td>
                    <td className="px-5 py-3.5 text-slate-300">{pvc.accessModes.join(', ')}</td>
                    <td className="px-5 py-3.5 text-slate-400">{pvc.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: EVENTS AUDIT LOG */}
      {/* ============================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 font-mono">Tingkat Event:</span>
              {(['all', 'Warning', 'Normal'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setEventSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                    eventSeverityFilter === sev
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {sev === 'all' ? 'Semua Events' : sev}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter events..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Object</th>
                  <th className="px-5 py-3.5">Message</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Count</th>
                  <th className="px-5 py-3.5">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-800/40">
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        evt.type === 'Warning' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {evt.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-200">{evt.reason}</td>
                    <td className="px-5 py-3.5 text-blue-400 font-bold">{evt.objectKind}/{evt.objectName}</td>
                    <td className="px-5 py-3.5 text-slate-300 font-sans max-w-[400px]">{evt.message}</td>
                    <td className="px-5 py-3.5 text-slate-400">{evt.source}</td>
                    <td className="px-5 py-3.5 text-slate-300">{evt.count}</td>
                    <td className="px-5 py-3.5 text-slate-400">{evt.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: INTERACTIVE KUBECTL TERMINAL */}
      {/* ============================================================== */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl font-mono space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-slate-400 font-bold ml-2">
                kubectl terminal • context: {currentCluster.context}
              </span>
            </div>
            <button
              onClick={() => setTerminalHistory([])}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-900 cursor-pointer"
            >
              Clear Screen
            </button>
          </div>

          {/* Quick command buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[10px]">Quick:</span>
            {[
              'kubectl get nodes -o wide',
              'kubectl get pods -A',
              'kubectl top nodes',
              'kubectl get deployments',
              'kubectl cluster-info'
            ].map(shortcut => (
              <button
                key={shortcut}
                onClick={() => {
                  setTerminalInput(shortcut);
                }}
                className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                {shortcut}
              </button>
            ))}
          </div>

          {/* Terminal log output */}
          <div className="h-[380px] overflow-y-auto space-y-1.5 text-xs text-slate-300 pr-2">
            {terminalHistory.map((item, idx) => (
              <div
                key={idx}
                className={item.type === 'input' ? 'text-amber-400 font-bold' : item.type === 'error' ? 'text-rose-400' : 'text-slate-300 whitespace-pre-wrap'}
              >
                {item.text}
              </div>
            ))}
            <div ref={termScrollRef} />
          </div>

          {/* Terminal prompt input */}
          <form onSubmit={handleRunKubectlTerminal} className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-emerald-400 font-bold text-sm">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Ketik perintah kubectl (misal: kubectl get pods -A)..."
              className="flex-1 bg-transparent text-slate-100 text-xs focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Kirim
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* POD INSPECTOR DRAWER / MODAL */}
      {/* ============================================================== */}
      {inspectingPod && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200"
          onClick={() => setInspectingPod(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-300 dark:border-slate-800 flex flex-col text-black dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50 dark:bg-slate-950/60">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    POD INSPECTION & DIAGNOSTIC
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    inspectingPod.status === 'Running'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                  }`}>
                    {inspectingPod.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-mono text-black dark:text-slate-100 truncate mt-1">
                  {inspectingPod.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                  Namespace: <strong className="text-black dark:text-slate-200">{inspectingPod.namespace}</strong> • Node: <strong className="text-black dark:text-slate-200">{inspectingPod.nodeName}</strong>
                </p>
              </div>

              <button
                onClick={() => setInspectingPod(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-x-auto text-xs font-bold font-mono">
              {[
                { id: 'specs', label: 'Spesifikasi & Label' },
                { id: 'containers', label: `Containers (${inspectingPod.containers.length})` },
                { id: 'logs', label: 'Live Logs' },
                { id: 'terminal', label: 'Exec Shell' },
                { id: 'yaml', label: 'YAML Manifest' },
                { id: 'ai-diagnose', label: '🤖 AI Diagnostician' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setInspectorTab(t.id as InspectorTab);
                    if (t.id === 'ai-diagnose' && !podDiagnosisResult) {
                      handleRunAiPodDiagnosis(inspectingPod);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                    inspectorTab === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* SPECS */}
              {inspectorTab === 'specs' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">QoS Class:</span>
                      <span className="font-bold text-black dark:text-slate-200">{inspectingPod.qosClass}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Pod IP Address:</span>
                      <span className="font-bold text-black dark:text-slate-200">{inspectingPod.podIp}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Host IP:</span>
                      <span className="font-bold text-black dark:text-slate-200">{inspectingPod.hostIp}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Restart Count:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{inspectingPod.restarts} kali</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Age:</span>
                      <span className="font-bold text-black dark:text-slate-200">{inspectingPod.age}</span>
                    </div>
                  </div>

                  {/* Labels */}
                  <div>
                    <h5 className="text-xs font-extrabold uppercase text-slate-500 font-mono mb-2">Kubernetes Labels</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(inspectingPod.labels || {}).map(([k, v]) => (
                        <span key={k} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-blue-700 dark:text-blue-400">
                          {k}={v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Events associated with this pod */}
                  <div>
                    <h5 className="text-xs font-extrabold uppercase text-slate-500 font-mono mb-2">Recent Events for this Pod</h5>
                    <div className="space-y-2">
                      {inspectingPod.events.map((evt, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono">
                          <div className="flex justify-between font-bold">
                            <span className={evt.type === 'Warning' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}>
                              [{evt.type}] {evt.reason}
                            </span>
                            <span className="text-slate-400">{evt.age}</span>
                          </div>
                          <p className="mt-1 text-slate-700 dark:text-slate-300 font-sans">{evt.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTAINERS */}
              {inspectorTab === 'containers' && (
                <div className="space-y-3">
                  {inspectingPod.containers.map(c => (
                    <div key={c.name} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-black dark:text-slate-100">{c.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.ready ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {c.ready ? 'READY' : 'NOT READY'}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        Image: <span className="text-blue-700 dark:text-blue-400 font-bold">{c.image}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div>Requests: {c.requestCpu || '-'} CPU / {c.requestMem || '-'} RAM</div>
                        <div>Limits: {c.limitCpu || '-'} CPU / {c.limitMem || '-'} RAM</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* LIVE LOGS */}
              {inspectorTab === 'logs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={logFilterQuery}
                      onChange={(e) => setLogFilterQuery(e.target.value)}
                      placeholder="Cari kata kunci log..."
                      className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-black dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      onClick={() => setAutoScrollLogs(!autoScrollLogs)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer border ${
                        autoScrollLogs
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Auto-scroll: {autoScrollLogs ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-xs h-[340px] overflow-y-auto space-y-1">
                    {inspectingPod.logs
                      .filter(l => logFilterQuery === '' || l.message.toLowerCase().includes(logFilterQuery.toLowerCase()))
                      .map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-slate-500 select-none shrink-0">{log.timestamp}</span>
                          <span className={log.stream === 'stderr' ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    <div ref={logScrollRef} />
                  </div>
                </div>
              )}

              {/* EXEC SHELL */}
              {inspectorTab === 'terminal' && (
                <div className="space-y-3">
                  <div className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-xs h-[340px] overflow-y-auto space-y-1.5">
                    {podExecHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={item.type === 'input' ? 'text-amber-400 font-bold' : item.type === 'error' ? 'text-rose-400' : 'text-slate-200 whitespace-pre-wrap'}
                      >
                        {item.text}
                      </div>
                    ))}
                    <div ref={execScrollRef} />
                  </div>

                  <form onSubmit={handleSendPodExec} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-sm">$</span>
                    <input
                      type="text"
                      value={podExecInput}
                      onChange={(e) => setPodExecInput(e.target.value)}
                      placeholder="Jalankan perintah shell di dalam container (ls, env, ps)..."
                      className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-black dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Exec
                    </button>
                  </form>
                </div>
              )}

              {/* YAML MANIFEST */}
              {inspectorTab === 'yaml' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-mono font-bold">Kubernetes Object YAML</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inspectingPod.yamlManifest);
                        setCopiedManifest(true);
                        setTimeout(() => setCopiedManifest(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-lg text-xs font-bold transition-all cursor-pointer font-mono"
                    >
                      {copiedManifest ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedManifest ? 'Tersalin' : 'Salin YAML'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-blue-300 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[360px] leading-relaxed">
                    {inspectingPod.yamlManifest}
                  </pre>
                </div>
              )}

              {/* AI DIAGNOSE */}
              {inspectorTab === 'ai-diagnose' && (
                <div className="space-y-4">
                  {isDiagnosingPod ? (
                    <div className="p-8 text-center space-y-3">
                      <Sparkles className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                      <p className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">
                        Menganalisis stack trace, status cgroup, dan log Kubernetes...
                      </p>
                    </div>
                  ) : podDiagnosisResult ? (
                    <div className="space-y-4 font-sans text-xs">
                      {/* Health Score & Risk Header */}
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-purple-900 dark:text-purple-300">
                            {podDiagnosisResult.title}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] ${
                            podDiagnosisResult.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            RISIKO: {podDiagnosisResult.riskLevel}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {podDiagnosisResult.summary}
                        </p>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-200 mb-2">Langkah Perbaikan Direkomendasikan:</h5>
                        <div className="space-y-2">
                          {podDiagnosisResult.recommendations?.map((rec: any, idx: number) => (
                            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-blue-700 dark:text-blue-400">[{rec.priority}] {rec.title}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{rec.action}</p>
                              <p className="text-slate-500 text-[10px]">Dampak: {rec.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Remediation Commands */}
                      {podDiagnosisResult.remediationCommands?.length > 0 && (
                        <div>
                          <h5 className="font-extrabold text-slate-800 dark:text-slate-200 mb-2">Perintah Kubectl untuk Mitigasi:</h5>
                          <div className="space-y-1.5 font-mono text-[11px]">
                            {podDiagnosisResult.remediationCommands.map((cmd: string, idx: number) => (
                              <div key={idx} className="p-2.5 bg-slate-950 text-emerald-400 rounded-lg flex items-center justify-between gap-2">
                                <span className="truncate">{cmd}</span>
                                <button
                                  onClick={() => navigator.clipboard.writeText(cmd)}
                                  className="text-slate-400 hover:text-white shrink-0 p-1 cursor-pointer"
                                  title="Salin Perintah"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* NODE DETAIL MODAL */}
      {/* ============================================================== */}
      {inspectingNode && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInspectingNode(null)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-black dark:text-slate-100 font-mono space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">NODE DETAIL</span>
                <h3 className="text-lg font-bold text-black dark:text-white">{inspectingNode.name}</h3>
              </div>
              <button onClick={() => setInspectingNode(null)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{inspectingNode.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Kernel Version:</span>
                <span className="font-bold text-black dark:text-slate-200">{inspectingNode.kernelVersion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Internal IP:</span>
                <span className="font-bold text-black dark:text-slate-200">{inspectingNode.internalIp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Container Runtime:</span>
                <span className="font-bold text-black dark:text-slate-200">{inspectingNode.containerRuntime}</span>
              </div>
            </div>

            {/* Conditions list */}
            <div>
              <h5 className="text-xs font-bold uppercase text-slate-500 mb-2">Kondisi Node Kubelet:</h5>
              <div className="space-y-1.5">
                {inspectingNode.conditions.map(c => (
                  <div key={c.type} className="p-2 bg-slate-100 dark:bg-slate-950 rounded-lg flex items-center justify-between text-xs">
                    <span>{c.type}</span>
                    <span className={`font-bold ${c.status === 'True' && c.type === 'Ready' ? 'text-emerald-600 dark:text-emerald-400' : c.status === 'False' ? 'text-slate-400' : 'text-rose-600'}`}>
                      {c.status} ({c.reason})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingNode(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SCALE DEPLOYMENT MODAL */}
      {/* ============================================================== */}
      {scalingDeployment && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setScalingDeployment(null)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-black dark:text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase font-mono">SCALE DEPLOYMENT</span>
                <h3 className="text-base font-bold text-black dark:text-white font-mono">{scalingDeployment.name}</h3>
              </div>
              <button onClick={() => setScalingDeployment(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tentukan jumlah target replika pod yang diinginkan untuk workload ini. Kube-controller-manager akan melakukan penambahan atau pengurangan pod secara bertahap.
            </p>

            {/* Stepper control */}
            <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">Jumlah Replicas Target:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNewReplicasCount(prev => Math.max(0, prev - 1))}
                  className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-black dark:text-white font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-black font-mono w-10 text-center text-blue-600 dark:text-blue-400">
                  {newReplicasCount}
                </span>
                <button
                  type="button"
                  onClick={() => setNewReplicasCount(prev => prev + 1)}
                  className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-black dark:text-white font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setScalingDeployment(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyScaling}
                disabled={isScaling}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isScaling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Terapkan Skala</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
