import React, { useState, useRef, useMemo } from 'react';
import { Cluster, NodeInfo, VMInfo } from '../types';
import { 
  Network, 
  Search, 
  SlidersHorizontal, 
  Download, 
  Maximize2, 
  Minimize2, 
  Server, 
  Cpu, 
  Activity, 
  ToggleLeft, 
  ToggleRight, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Play, 
  Square, 
  RefreshCw, 
  X, 
  Layers, 
  Monitor, 
  Info,
  ExternalLink,
  Settings,
  Grid,
  Tag,
  Sparkles
} from 'lucide-react';
import { FeatureAnalysisType } from '../types';

interface TopologyViewProps {
  clusters: Cluster[];
  onOpenAiAnalysis?: (feature?: FeatureAnalysisType) => void;
}

export default function TopologyView({ clusters, onOpenAiAnalysis }: TopologyViewProps) {
  // Filters & State
  const [selectedClusterId, setSelectedClusterId] = useState<string>('ALL');
  const [vmStatusFilter, setVmStatusFilter] = useState<'ALL' | 'RUNNING' | 'STOPPED'>('ALL');
  const [vlanGrouping, setVlanGrouping] = useState<boolean>(false);
  const [tagGrouping, setTagGrouping] = useState<boolean>(false);
  const [groupingThreshold, setGroupingThreshold] = useState<number>(8);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  // Selected Node / VM detail drawer
  const [expandedNode, setExpandedNode] = useState<{ clusterId: string; node: NodeInfo } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // References and state for image downloads
  const topologyRef = useRef<HTMLDivElement>(null);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState<boolean>(false);

  // Close download dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setShowDownloadDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Local VM interactive states (simulating actions)
  const [localVmStates, setLocalVmStates] = useState<Record<string, 'running' | 'stopped'>>({});

  // Collapsed and expanded state for groups/threshold lists
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVmAction = (vmId: string, vmName: string, action: 'start' | 'stop' | 'restart') => {
    if (action === 'start') {
      setLocalVmStates(prev => ({ ...prev, [vmId]: 'running' }));
      showToast(`Mesin Virtual "${vmName}" berhasil dinyalakan`, 'success');
    } else if (action === 'stop') {
      setLocalVmStates(prev => ({ ...prev, [vmId]: 'stopped' }));
      showToast(`Mesin Virtual "${vmName}" berhasil dihentikan`, 'success');
    } else {
      showToast(`Mesin Virtual "${vmName}" sedang di-restart...`, 'info');
      setTimeout(() => {
        showToast(`Mesin Virtual "${vmName}" selesai di-restart`, 'success');
      }, 1500);
    }
  };

  // Filtered dataset computed reactively
  const filteredClusters = useMemo(() => {
    return clusters.filter(c => selectedClusterId === 'ALL' || c.id === selectedClusterId);
  }, [clusters, selectedClusterId]);

  // Aggregate global stats for Root Node (ProxCenter)
  const globalStats = useMemo(() => {
    let totalClustersCount = clusters.length;
    let totalNodesCount = 0;
    let totalVmsCount = 0;

    clusters.forEach(c => {
      totalNodesCount += c.nodes.length;
      totalVmsCount += c.vms.length;
    });

    return {
      clustersCount: totalClustersCount,
      nodesCount: totalNodesCount,
      vmsCount: totalVmsCount
    };
  }, [clusters]);

  // Download topology diagram as an image (PNG, JPEG, JPG)
  const handleDownloadImage = async (format: 'png' | 'jpeg' | 'jpg') => {
    if (!topologyRef.current) return;
    
    showToast(`Mempersiapkan unduhan gambar (${format.toUpperCase()})...`, "info");
    
    const originalZoom = zoomLevel;
    // Momentarily set zoom to 100% to ensure element captures 1:1 crisp dimensions
    setZoomLevel(100);
    
    // Give browser a short window to redraw layout at 100%
    setTimeout(async () => {
      try {
        const element = topologyRef.current;
        if (!element) return;
        
        const { toPng, toJpeg } = await import('html-to-image');
        
        let dataUrl = '';
        let extension = 'png';
        
        const options = {
          backgroundColor: '#020617', // bg-slate-950 color
          style: {
            transform: 'none', // reset transform zoom if any is active inside the element
          },
          pixelRatio: 3, // Boost resolution by 3x for extremely crisp text and elements
          cacheBust: true,
        };
        
        if (format === 'png') {
          dataUrl = await toPng(element, options);
          extension = 'png';
        } else {
          dataUrl = await toJpeg(element, { ...options, quality: 0.95 });
          extension = 'jpg';
        }
        
        const link = document.createElement('a');
        link.download = `ProxCenter-Topology-${Date.now()}.${extension}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`Gambar topologi berhasil diunduh (${format.toUpperCase()})!`, 'success');
      } catch (err) {
        console.error('Gagal membuat gambar topologi:', err);
        showToast('Gagal memproses gambar topologi', 'info');
      } finally {
        // Restore user's previous zoom level
        setZoomLevel(originalZoom);
      }
    }, 180);
  };

  return (
    <div className={`space-y-6 ${fullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Peta Interaktif</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-sans tracking-tight flex items-center gap-2">
            Topologi Infrastruktur <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">ProksCenter v2.4</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi hubungan hirarkis kluster, hypervisor node, dan mesin virtual terdaftar.
          </p>
        </div>

        {/* Top controls panel for zooming & fullscreen */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onOpenAiAnalysis && (
            <button
              onClick={() => onOpenAiAnalysis('topology')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all group"
              title="Audit & Analisis AI Ketahanan Topologi Jaringan"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200 group-hover:scale-110 transition-transform animate-pulse" />
              <span>Analisis AI Topologi</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs text-slate-400">
            <button 
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="px-2.5 py-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer font-mono"
            >
              -
            </button>
            <span className="px-3 py-1 font-mono text-slate-300 font-medium select-none min-w-[50px] text-center">
              {zoomLevel}%
            </span>
            <button 
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="px-2.5 py-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer font-mono"
            >
              +
            </button>
          </div>

          {/* Format-selective image download dropdown */}
          <div className="relative" ref={downloadDropdownRef}>
            <button
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
              title="Download Gambar Topologi"
            >
              <Download className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-slate-500 hover:text-white transition-colors" />
            </button>

            {showDownloadDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 animate-fade-in text-left">
                <div className="px-3 py-1.5 text-[9px] font-mono text-indigo-400 uppercase tracking-wider border-b border-slate-800/60 mb-1 font-bold">
                  Unduh Gambar Topologi
                </div>
                <button
                  onClick={() => {
                    handleDownloadImage('png');
                    setShowDownloadDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Format PNG (.png)</span>
                  <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/10 font-bold">Saran</span>
                </button>
                <button
                  onClick={() => {
                    handleDownloadImage('jpeg');
                    setShowDownloadDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Format JPEG (.jpeg)</span>
                </button>
                <button
                  onClick={() => {
                    handleDownloadImage('jpg');
                    setShowDownloadDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Format JPG (.jpg)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{fullscreen ? 'Normal' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Grid Dashboard Controls - Matching the user image perfectly */}
      <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 text-xs">
          
          {/* Group 1: Filter Koneksi & VM Status */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Filter Koneksi (Cluster)
              </span>
              <select
                value={selectedClusterId}
                onChange={(e) => setSelectedClusterId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer min-w-[180px]"
              >
                <option value="ALL">Semua Cluster (All Clusters)</option>
                {clusters.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Status VM (VM Status)
              </span>
              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                {(['ALL', 'RUNNING', 'STOPPED'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setVmStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer capitalize ${
                      vmStatusFilter === status 
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-semibold shadow-inner' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {status === 'ALL' ? 'Semua (All)' : status === 'RUNNING' ? 'Aktif (Running)' : 'Mati (Stopped)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Group 2: VM threshold slider */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
              <span>Ambang Batas Pengelompokan (Grouping Threshold)</span>
              <span className="text-indigo-400 font-bold">{groupingThreshold} VMs</span>
            </span>
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 min-w-[200px]">
              <input
                type="range"
                min="1"
                max="30"
                value={groupingThreshold}
                onChange={(e) => setGroupingThreshold(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Group 3: Grouping Switch Toggles (VLAN & Tag) */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Parameter Pengelompokan (Grouping Parameters)
              </span>
              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 h-[38px]">
                <button
                  onClick={() => setVlanGrouping(!vlanGrouping)}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {vlanGrouping ? (
                    <ToggleRight className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-600" />
                  )}
                  <span>Kelompokkan Berdasarkan VLAN</span>
                </button>

                <div className="w-[1px] h-4 bg-slate-800" />

                <button
                  onClick={() => setTagGrouping(!tagGrouping)}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {tagGrouping ? (
                    <ToggleRight className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-600" />
                  )}
                  <span>Kelompokkan Berdasarkan Tag</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Topology Board Canvas */}
      <div 
        ref={topologyRef}
        className="relative bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl p-6 md:p-10 select-none transition-all duration-300"
        style={{
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.1) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: 'center'
        }}
      >
        <div 
          className="w-full flex flex-col items-center gap-12 origin-top transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {/* LEVEL 1: Root Node (ProxCenter Control Plane) */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              {/* Outer orange glowing ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-300" />
              
              {/* Card wrapper */}
              <div className="relative w-[340px] bg-slate-900 border-2 border-orange-500/80 rounded-2xl px-6 py-5 flex items-center gap-4 text-slate-100 shadow-xl">
                <div className="p-3 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
                  <Network className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-base tracking-tight text-slate-100 leading-tight">
                      ProxCenter
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    {globalStats.clustersCount} clusters &nbsp;•&nbsp; {globalStats.nodesCount} nodes &nbsp;•&nbsp; {globalStats.vmsCount} VMs
                  </p>
                  <p className="text-[9px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md inline-block mt-1.5 font-bold uppercase tracking-wider">
                    Hypervisor Master Control
                  </p>
                </div>
              </div>
            </div>

            {/* Connecting Vertical Dotted Line Down to Level 2 */}
            <div className="w-[2px] h-10 border-r-2 border-dashed border-orange-500/40 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
            </div>
          </div>

          {/* LEVEL 2: Cluster Level (DR Clusters) */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-12 relative">
            {/* SVG Connector overlay for connections between Level 1 and Level 2 */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              {/* If single selected, we don't draw splits */}
              {filteredClusters.length > 1 && (
                <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                  {/* Connect root to clusters using soft green/orange lines */}
                  <path 
                    d="M 50% 0 L 50% 12" 
                    fill="none" 
                    stroke="rgba(99, 102, 241, 0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                  />
                </svg>
              )}
            </div>

            {filteredClusters.map((cluster) => {
              // Aggregate node status info for this cluster
              const runningVMsCount = cluster.vms.filter(v => (localVmStates[v.id] || v.status) === 'running').length;
              const stoppedVMsCount = cluster.vms.filter(v => (localVmStates[v.id] || v.status) === 'stopped').length;
              const hasAnomaly = cluster.anomalyScore > 60;
              const totalVmsInCluster = cluster.vms.length;

              const storagePercent = Math.round((cluster.storageUsedGB / cluster.storageCapacityGB) * 100);

              return (
                <div key={cluster.id} className="flex flex-col items-center min-w-[320px]">
                  {/* Cluster Card */}
                  <div className={`relative group w-[320px] bg-slate-900 border rounded-2xl px-5 py-4 text-slate-200 transition-all shadow-lg ${
                    hasAnomaly 
                      ? 'border-rose-500/80 shadow-rose-500/5' 
                      : 'border-emerald-500/60 shadow-emerald-500/5'
                  }`}>
                    {/* Glowing Accent Border */}
                    <div className={`absolute -inset-px rounded-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity ${
                      hasAnomaly ? 'bg-rose-500/30' : 'bg-emerald-500/30'
                    }`} />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl text-white ${
                          hasAnomaly ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors">
                            {cluster.name}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-400 leading-none mt-0.5">
                            {cluster.type} &nbsp;•&nbsp; {cluster.nodes.length} nodes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${hasAnomaly ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{cluster.status}</span>
                      </div>
                    </div>

                    {/* Progress bars inside cluster info */}
                    <div className="mt-4 space-y-2">
                      <div className="text-[10px] font-sans flex items-center justify-between text-slate-400">
                        <span>Cluster Storage Usage</span>
                        <span className={`font-mono font-bold ${storagePercent > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {storagePercent}% ({Math.round(cluster.storageUsedGB / 1024)}TB / {Math.round(cluster.storageCapacityGB / 1024)}TB)
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            storagePercent > 85 ? 'bg-rose-500 shadow-lg shadow-rose-500/40' : 'bg-emerald-500 shadow-lg shadow-emerald-500/40'
                          }`}
                          style={{ width: `${storagePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>VMs: <strong className="text-slate-100">{totalVmsInCluster}</strong> total</span>
                      <span className="flex items-center gap-2">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{runningVMsCount} running</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" />{stoppedVMsCount} stopped</span>
                      </span>
                    </div>
                  </div>

                  {/* Connecting Line Down to Node Level */}
                  <div className="w-[2px] h-8 border-r-2 border-dashed border-emerald-500/40 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  </div>

                  {/* LEVEL 3: Hypervisor Nodes Under This Cluster */}
                  <div className="flex flex-wrap items-stretch justify-center gap-6 mt-2">
                    {cluster.nodes.map((node) => {
                      // Filter VMs belonging to this specific node based on mock telemetry simulation.
                      // In our data:
                      // pve-node-01 -> has VMs running
                      // ahv-node-01 -> has CRM-Core-Service, etc.
                      // Let's dynamically partition the cluster's VMs among its nodes based on index
                      const nodeVms = cluster.vms.filter((vm, index) => {
                        // Distribute VMs deterministically among online nodes
                        const onlineNodes = cluster.nodes.filter(n => n.status !== 'offline');
                        const nodeIndex = onlineNodes.findIndex(n => n.id === node.id);
                        if (nodeIndex === -1) return false;
                        return index % onlineNodes.length === nodeIndex;
                      });

                      const nodeRunningCount = nodeVms.filter(v => (localVmStates[v.id] || v.status) === 'running').length;
                      const nodeStoppedCount = nodeVms.filter(v => (localVmStates[v.id] || v.status) === 'stopped').length;
                      const nodeTotalCount = nodeVms.length;

                      // Filter VM statuses
                      const matchesStatusFilter = 
                        vmStatusFilter === 'ALL' ||
                        (vmStatusFilter === 'RUNNING' && nodeRunningCount > 0) ||
                        (vmStatusFilter === 'STOPPED' && nodeStoppedCount > 0);

                      if (!matchesStatusFilter) return null;

                      const isSelected = expandedNode?.node.id === node.id;
                      const isMaintenance = node.status === 'maintenance';
                      const isOffline = node.status === 'offline';

                      return (
                        <div key={node.id} className="flex flex-col items-center transition-all duration-300">
                          {/* Node Card */}
                          <div className={`w-[260px] bg-slate-900 border rounded-xl p-4 flex flex-col justify-between text-slate-300 relative group transition-all duration-300 ${
                            isSelected 
                              ? 'border-indigo-500 bg-slate-900/40 ring-2 ring-indigo-500/20 scale-[1.02]' 
                              : isMaintenance 
                                ? 'border-amber-500/40 opacity-75' 
                                : isOffline 
                                  ? 'border-rose-500/40 opacity-50' 
                                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}>
                            
                            {/* Inner glowing effect on hover */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500/50 to-blue-500/50 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Server className={`w-4 h-4 ${
                                  isMaintenance ? 'text-amber-400' : isOffline ? 'text-rose-400' : 'text-slate-400'
                                }`} />
                                <span className="font-sans font-bold text-xs text-slate-100 tracking-tight block truncate max-w-[130px]">
                                  {node.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  isMaintenance ? 'bg-amber-400' : isOffline ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
                                }`} />
                                <span className="text-[9px] font-mono text-slate-400 uppercase">
                                  {node.status}
                                </span>
                              </div>
                            </div>

                            {/* Node Metrics Progress Bars */}
                            <div className="mt-3.5 space-y-2 text-[10px]">
                              {/* CPU Metrics */}
                              <div>
                                <div className="flex justify-between text-slate-400">
                                  <span>CPU Utilization</span>
                                  <span className="font-mono text-slate-300">{node.cpuUsage}%</span>
                                </div>
                                <div className="h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      node.cpuUsage > 80 ? 'bg-rose-500' : node.cpuUsage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${node.cpuUsage}%` }}
                                  />
                                </div>
                              </div>

                              {/* RAM Metrics */}
                              <div>
                                <div className="flex justify-between text-slate-400">
                                  <span>RAM Utilization</span>
                                  <span className="font-mono text-slate-300">{node.ramUsage}%</span>
                                </div>
                                <div className="h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      node.ramUsage > 80 ? 'bg-rose-500' : node.ramUsage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${node.ramUsage}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Clickable footer trigger matching user image behavior */}
                            <button
                              onClick={() => setExpandedNode({ clusterId: cluster.id, node })}
                              className="mt-4 pt-2.5 border-t border-slate-800/80 w-full text-left flex items-center justify-between text-[10px] text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="font-mono text-slate-300 font-semibold">{nodeTotalCount} VMs Terdaftar</span>
                                <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                                  {nodeRunningCount} running, {nodeStoppedCount} stopped
                                </span>
                              </div>
                              <div className="flex items-center text-indigo-400 font-bold font-sans gap-0.5 group-hover:translate-x-1 transition-transform">
                                <span>Detail</span>
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            </button>
                          </div>

                          {/* LEVEL 4: Direct Virtual Machines (VMs) Topology Nodes */}
                          {selectedClusterId !== 'ALL' && nodeVms.length > 0 && (() => {
                            // Apply VM status filter to rendered VMs
                            const filteredVms = nodeVms.filter(vm => {
                              const vmStatus = localVmStates[vm.id] || vm.status;
                              if (vmStatusFilter === 'RUNNING') return vmStatus === 'running';
                              if (vmStatusFilter === 'STOPPED') return vmStatus === 'stopped';
                              return true;
                            });

                            if (filteredVms.length === 0) return null;

                            // Dynamic groupings helper
                            const getVlan = (vm: VMInfo) => {
                              const parts = vm.ipAddress.split('.');
                              if (parts.length >= 3) {
                                return `VLAN ${parts[2]}`;
                              }
                              return 'VLAN 10';
                            };

                            const getTag = (vm: VMInfo) => {
                              const name = vm.name.toLowerCase();
                              if (name.includes('sql') || name.includes('db') || name.includes('database') || name.includes('hana') || name.includes('redis')) {
                                return 'Database Tier';
                              }
                              if (name.includes('server') || name.includes('gateway') || name.includes('nginx') || name.includes('web') || name.includes('auth')) {
                                return 'Web/App Tier';
                              }
                              if (name.includes('kubernetes') || name.includes('worker') || name.includes('master')) {
                                return 'Kubernetes Pods';
                              }
                              if (name.includes('runner') || name.includes('ci-cd') || name.includes('test') || name.includes('sandbox')) {
                                return 'DevOps & CI/CD';
                              }
                              return 'Infrastructure Services';
                            };

                            const getGroupLabel = (vm: VMInfo) => {
                              if (vlanGrouping && tagGrouping) {
                                return `[${getVlan(vm)}] ${getTag(vm)}`;
                              }
                              if (vlanGrouping) return getVlan(vm);
                              if (tagGrouping) return getTag(vm);
                              return 'Default Group';
                            };

                            // Group VMs if at least one grouping parameter is enabled
                            const isGroupingActive = vlanGrouping || tagGrouping;

                            // Common VM Card Renderer to avoid code duplication
                            const renderVmCard = (vm: VMInfo, tight = false) => {
                              const vmStatus = localVmStates[vm.id] || vm.status;
                              const isRunning = vmStatus === 'running';

                              return (
                                <div
                                  key={vm.id}
                                  className={`bg-slate-900 border rounded-xl text-left relative group/vm transition-all duration-300 ${
                                    tight ? 'p-2.5 border-slate-800/60' : 'p-3 border-slate-800/80'
                                  } ${
                                    isRunning
                                      ? 'border-emerald-500/40 hover:border-emerald-500/80 bg-slate-900/80 shadow-lg shadow-emerald-500/5'
                                      : 'border-slate-800/80 hover:border-slate-700 opacity-80'
                                  }`}
                                >
                                  {/* Colored top gradient for active VM */}
                                  {isRunning && (
                                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/50 to-teal-500/50 rounded-t-xl" />
                                  )}

                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                                        }`} />
                                        <h5 className="text-[11px] font-bold text-slate-200 truncate max-w-[110px]" title={vm.name}>
                                          {vm.name}
                                        </h5>
                                      </div>
                                      <p className="text-[9px] font-mono text-slate-500 mt-0.5">{vm.ipAddress}</p>
                                    </div>

                                    {/* Inline Quick Action Switches */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      {isRunning ? (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleVmAction(vm.id, vm.name, 'stop');
                                            }}
                                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 cursor-pointer transition-all"
                                            title="Hentikan VM"
                                          >
                                            <Square className="w-2.5 h-2.5 fill-rose-400" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleVmAction(vm.id, vm.name, 'restart');
                                            }}
                                            className="p-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 cursor-pointer transition-all"
                                            title="Restart VM"
                                          >
                                            <RefreshCw className="w-2.5 h-2.5" />
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleVmAction(vm.id, vm.name, 'start');
                                          }}
                                          className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 cursor-pointer transition-all flex items-center gap-1 text-[8px] font-bold px-2 py-0.5"
                                          title="Jalankan VM"
                                        >
                                          <Play className="w-2 h-2 fill-emerald-400" />
                                          <span>Start</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* CPU / RAM usage inside topology card */}
                                  {isRunning && (
                                    <div className="mt-2.5 pt-2 border-t border-slate-800/50 grid grid-cols-2 gap-2 text-[8px]">
                                      <div>
                                        <div className="flex justify-between text-slate-500">
                                          <span>vCPU ({vm.cpuCores}c)</span>
                                          <span className="font-mono text-slate-400">{vm.cpuUsage}%</span>
                                        </div>
                                        <div className="h-0.5 bg-slate-950 rounded-full mt-0.5 overflow-hidden">
                                          <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${vm.cpuUsage}%` }}
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between text-slate-500">
                                          <span>RAM ({vm.ramGB}G)</span>
                                          <span className="font-mono text-slate-400">{vm.ramUsage}%</span>
                                        </div>
                                        <div className="h-0.5 bg-slate-950 rounded-full mt-0.5 overflow-hidden">
                                          <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: `${vm.ramUsage}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            };

                            if (isGroupingActive) {
                              const groupedVms: Record<string, VMInfo[]> = {};
                              filteredVms.forEach(vm => {
                                const label = getGroupLabel(vm);
                                if (!groupedVms[label]) {
                                  groupedVms[label] = [];
                                }
                                groupedVms[label].push(vm);
                              });

                              return (
                                <>
                                  {/* Connector line from node down to VMs */}
                                  <div className="w-[2px] h-8 border-r-2 border-dashed border-indigo-500/40 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                  </div>

                                  <div className="flex flex-col gap-3.5 w-[240px]">
                                    {Object.entries(groupedVms).map(([groupName, vmsInGroup]) => {
                                      const groupKey = `${node.id}-${groupName}`;
                                      const isCollapsed = collapsedGroups[groupKey] || false;

                                      // Apply Threshold within groups as well
                                      const isGroupThresholdExceeded = vmsInGroup.length > groupingThreshold;
                                      const isGroupShowAll = expandedGroups[groupKey] || false;

                                      const groupVmsToRender = isGroupThresholdExceeded && !isGroupShowAll
                                        ? vmsInGroup.slice(0, groupingThreshold - 1)
                                        : vmsInGroup;

                                      const groupHiddenCount = vmsInGroup.length - groupVmsToRender.length;

                                      return (
                                        <div 
                                          key={groupName} 
                                          className="flex flex-col gap-2 w-full border border-slate-800/80 bg-slate-900/30 rounded-2xl p-3 animate-fade-in text-slate-200"
                                        >
                                          {/* Group Header */}
                                          <button
                                            onClick={() => setCollapsedGroups(prev => ({ ...prev, [groupKey]: !isCollapsed }))}
                                            className="flex items-center justify-between w-full text-left font-sans font-bold text-[10px] text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                                          >
                                            <div className="flex items-center gap-1.5 truncate">
                                              {vlanGrouping ? (
                                                <Network className="w-3 h-3 text-indigo-400" />
                                              ) : (
                                                <Tag className="w-3 h-3 text-teal-400" />
                                              )}
                                              <span className="truncate max-w-[130px]" title={groupName}>{groupName}</span>
                                              <span className="text-[9px] bg-slate-950 border border-slate-800 px-1.5 rounded-full font-mono text-slate-400">
                                                {vmsInGroup.length}
                                              </span>
                                            </div>
                                            <div className="shrink-0 text-slate-500">
                                              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                            </div>
                                          </button>

                                          {/* Group VMs */}
                                          {!isCollapsed && (
                                            <div className="flex flex-col gap-2 mt-1.5 pl-1.5 border-l border-slate-800/40">
                                              {groupVmsToRender.map(vm => renderVmCard(vm, true))}

                                              {groupHiddenCount > 0 && (
                                                <button
                                                  onClick={() => setExpandedGroups(prev => ({ ...prev, [groupKey]: true }))}
                                                  className="w-full bg-slate-900 hover:bg-slate-800 border border-dashed border-indigo-500/30 hover:border-indigo-500/50 rounded-lg py-2 text-center text-[9px] text-indigo-400 font-bold transition-all cursor-pointer"
                                                >
                                                  +{groupHiddenCount} VM Lainnya (Klik)
                                                </button>
                                              )}

                                              {isGroupThresholdExceeded && isGroupShowAll && (
                                                <button
                                                  onClick={() => setExpandedGroups(prev => ({ ...prev, [groupKey]: false }))}
                                                  className="text-center text-[8px] font-mono text-slate-500 hover:text-indigo-400 py-1 transition-colors cursor-pointer"
                                                >
                                                  Sembunyikan sebagian
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              );
                            }

                            // Flat list with threshold grouping applied
                            const isThresholdExceeded = filteredVms.length > groupingThreshold;
                            const groupKey = `${node.id}-all`;
                            const isGroupExpanded = expandedGroups[groupKey] || false;

                            const vmsToRender = isThresholdExceeded && !isGroupExpanded
                              ? filteredVms.slice(0, groupingThreshold - 1)
                              : filteredVms;

                            const hiddenCount = filteredVms.length - vmsToRender.length;

                            return (
                              <>
                                {/* Connector line from node down to VMs */}
                                <div className="w-[2px] h-8 border-r-2 border-dashed border-indigo-500/40 relative">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                </div>

                                {/* Stack of interactive VM cards */}
                                <div className="flex flex-col gap-2.5 w-[240px] animate-fade-in">
                                  {vmsToRender.map(vm => renderVmCard(vm))}

                                  {hiddenCount > 0 && (
                                    <button
                                      onClick={() => setExpandedGroups(prev => ({ ...prev, [groupKey]: true }))}
                                      className="w-full bg-slate-900 hover:bg-slate-800 border border-dashed border-indigo-500/40 hover:border-indigo-500/80 rounded-xl p-3 text-center transition-all duration-300 cursor-pointer text-indigo-400 group/expand"
                                    >
                                      <div className="flex flex-col items-center justify-center gap-1">
                                        <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider">
                                          <Layers className="w-3.5 h-3.5 text-indigo-400 group-hover/expand:scale-110 transition-transform" />
                                          <span>+{hiddenCount} VM Lainnya</span>
                                        </div>
                                        <p className="text-[9px] text-slate-500">
                                          Disembunyikan karena ambang batas ({groupingThreshold} VMs). Klik untuk membuka.
                                        </p>
                                      </div>
                                    </button>
                                  )}

                                  {isThresholdExceeded && isGroupExpanded && (
                                    <button
                                      onClick={() => setExpandedGroups(prev => ({ ...prev, [groupKey]: false }))}
                                      className="w-full bg-slate-950/40 hover:bg-slate-900 border border-indigo-500/40 rounded-xl py-1.5 text-center text-[9px] font-mono text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                                    >
                                      Tutup / Sembunyikan sebagian
                                    </button>
                                  )}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Detail Drawer for Selected Node & its virtual machines */}
      {expandedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative animate-slide-left text-slate-100">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Kombinasi Hypervisor & Node</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 font-sans tracking-tight">
                  Node: {expandedNode.node.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Host virtualisasi dengan active state monitor.
                </p>
              </div>

              <button
                onClick={() => setExpandedNode(null)}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Node Stats Summary Block */}
            <div className="p-6 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">vCPU Usage</span>
                <span className="text-base font-mono font-bold text-indigo-400 mt-1 block">
                  {expandedNode.node.cpuUsage}%
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">RAM Allocation</span>
                <span className="text-base font-mono font-bold text-emerald-400 mt-1 block">
                  {expandedNode.node.ramUsage}%
                </span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Local Disk</span>
                <span className="text-base font-mono font-bold text-amber-500 mt-1 block">
                  {expandedNode.node.storageUsage}%
                </span>
              </div>
            </div>

            {/* List of VMs on this Node */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h4 className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-2">
                Daftar Virtual Machines Terkoneksi
              </h4>

              {(() => {
                const cluster = clusters.find(c => c.id === expandedNode.clusterId);
                if (!cluster) return <p className="text-xs text-slate-500 font-mono">No active virtual machines found.</p>;

                // Recalculate deterministic split of VMs
                const nodeVms = cluster.vms.filter((vm, index) => {
                  const onlineNodes = cluster.nodes.filter(n => n.status !== 'offline');
                  const nodeIndex = onlineNodes.findIndex(n => n.id === expandedNode.node.id);
                  if (nodeIndex === -1) return false;
                  return index % onlineNodes.length === nodeIndex;
                });

                if (nodeVms.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      <Monitor className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs font-mono">Tidak ada Virtual Machine aktif di node ini</p>
                      <span className="text-[10px] text-slate-600 block mt-1">Status node dalam pemeliharaan (maintenance)</span>
                    </div>
                  );
                }

                return nodeVms.map((vm) => {
                  const vmStatus = localVmStates[vm.id] || vm.status;
                  const isRunning = vmStatus === 'running';

                  return (
                    <div 
                      key={vm.id} 
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-200">{vm.name}</h5>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                              isRunning ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {isRunning ? 'running' : 'stopped'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{vm.ipAddress}</span>
                        </div>

                        {/* Interactive Console Controls */}
                        <div className="flex items-center gap-1">
                          {isRunning ? (
                            <>
                              <button
                                onClick={() => handleVmAction(vm.id, vm.name, 'stop')}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 cursor-pointer transition-colors"
                                title="Stop VM"
                              >
                                <Square className="w-3 h-3 fill-rose-400" />
                              </button>
                              <button
                                onClick={() => handleVmAction(vm.id, vm.name, 'restart')}
                                className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 cursor-pointer transition-colors"
                                title="Restart VM"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleVmAction(vm.id, vm.name, 'start')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-semibold px-2"
                              title="Start VM"
                            >
                              <Play className="w-3 h-3 fill-emerald-400" />
                              <span>Start</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* VM CPU/RAM Stats (Only if running) */}
                      {isRunning && (
                        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-800/50">
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>vCPU ({vm.cpuCores} Cores)</span>
                              <span>{vm.cpuUsage}%</span>
                            </div>
                            <div className="h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${vm.cpuUsage}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>RAM ({vm.ramGB} GB)</span>
                              <span>{vm.ramUsage}%</span>
                            </div>
                            <div className="h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${vm.ramUsage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer with custom help text */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/30 flex items-center gap-3">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-[10px] font-sans text-slate-400 leading-relaxed">
                Anda dapat memulai, menghentikan, atau melakukan restart VM di konsol virtualisasi lokal ini. Tindakan disimulasikan secara aman tanpa memutus konektivitas telemetry endpoint.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating System Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0">
          <div className={`p-2 rounded-lg ${
            toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
          }`}>
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">{toast.message}</p>
            <span className="text-[9px] font-mono text-slate-500">Sistem Telemetry Aktif</span>
          </div>
        </div>
      )}
    </div>
  );
}
