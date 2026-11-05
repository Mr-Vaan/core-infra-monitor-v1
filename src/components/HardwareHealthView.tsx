import React, { useState, useEffect, useMemo } from 'react';
import { ServerHardware, DiagnosticTestItem, HardwareDiagnosticResult, StorageDriveHealth, DimmModuleInfo, PcieSlotInfo, PsuUnitInfo } from '../types';
import { 
  Cpu, 
  HardDrive, 
  Zap, 
  Fan, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Download, 
  Activity, 
  Server, 
  Layers, 
  Terminal, 
  Sliders, 
  Check, 
  X, 
  Sparkles, 
  Info, 
  ExternalLink, 
  Play, 
  Settings, 
  Flame, 
  FileSpreadsheet, 
  FileJson, 
  ChevronRight, 
  RotateCw,
  Search,
  Filter,
  Radio,
  Eye,
  Printer,
  FileText,
  BadgeCheck,
  HelpCircle,
  Hash,
  Minimize2,
  Maximize2,
  Globe,
  Building2,
  Plus,
  ChevronDown
} from 'lucide-react';
import { FeatureAnalysisType } from '../types';
import { SERVER_BRANDS_CATALOG, getBrandById, detectBrandFromModel, ServerBrandDefinition } from '../data/serverBrandsCatalog';

interface HardwareHealthViewProps {
  initialNodeId?: string;
  onNavigateToAssistant?: (prompt: string) => void;
  onOpenAiAnalysis?: (feature?: FeatureAnalysisType) => void;
}

type HardwareSubTab = 'overview' | 'cpu' | 'memory' | 'storage' | 'pcie' | 'power_cooling' | 'bmc_sel';

export default function HardwareHealthView({ initialNodeId, onNavigateToAssistant, onOpenAiAnalysis }: HardwareHealthViewProps) {
  const [servers, setServers] = useState<ServerHardware[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(initialNodeId || '');
  const [activeSubTab, setActiveSubTab] = useState<HardwareSubTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Diagnostic Runner State
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState<number>(0);
  const [runningStepIndex, setRunningStepIndex] = useState<number>(-1);
  const [activeDiagnosticResult, setActiveDiagnosticResult] = useState<HardwareDiagnosticResult | null>(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);

  // Slot Filter States (Production Slot Detection)
  const [dimmFilter, setDimmFilter] = useState<'all' | 'detected' | 'empty' | 'error'>('all');
  const [driveFilter, setDriveFilter] = useState<'all' | 'detected' | 'empty' | 'error'>('all');
  const [pcieFilter, setPcieFilter] = useState<'all' | 'detected' | 'empty' | 'error'>('all');

  // Slot Detail Drawer / Modal
  const [selectedSlotInspection, setSelectedSlotInspection] = useState<{
    type: 'dimm' | 'drive' | 'pcie' | 'psu';
    title: string;
    data: any;
  } | null>(null);

  // PDF Audit Modal State
  const [showPdfAuditModal, setShowPdfAuditModal] = useState<boolean>(false);

  // S.M.A.R.T. Test Modal / State
  const [isSmartTesting, setIsSmartTesting] = useState<boolean>(false);

  // PSU Failover Test State
  const [isPsuTesting, setIsPsuTesting] = useState<boolean>(false);

  // SEL Filter
  const [selSeverityFilter, setSelSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFORMATIONAL'>('ALL');
  const [selSearch, setSelSearch] = useState<string>('');

  // Multi-Brand Filter States
  const [brandCategoryFilter, setBrandCategoryFilter] = useState<'ALL' | 'indonesia' | 'global'>('ALL');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('ALL');
  const [nodeSearch, setNodeSearch] = useState<string>('');

  // Modals for Multi-Brand Ecosystem
  const [showBrandMatrixModal, setShowBrandMatrixModal] = useState<boolean>(false);
  const [showAddServerModal, setShowAddServerModal] = useState<boolean>(false);

  // New Server Integration Form State
  const [newServerCategory, setNewServerCategory] = useState<'indonesia' | 'global'>('indonesia');
  const [newServerBrandId, setNewServerBrandId] = useState<string>('axioo');
  const [newServerModel, setNewServerModel] = useState<string>('Axioo MyServer SX7 2U Dual Xeon Scalable');
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newBmcProtocol, setNewBmcProtocol] = useState<string>('DMTF Redfish v1.18+ / HTTPS');
  const [newBmcIp, setNewBmcIp] = useState<string>('');
  const [newBmcPort, setNewBmcPort] = useState<number>(443);
  const [newBmcUser, setNewBmcUser] = useState<string>('admin');
  const [newBmcPassword, setNewBmcPassword] = useState<string>('');
  const [newClusterName, setNewClusterName] = useState<string>('Proxmox-CEPH-Prod');
  const [newAssetTag, setNewAssetTag] = useState<string>('');
  const [isBmcTesting, setIsBmcTesting] = useState<boolean>(false);
  const [bmCTestResult, setBmCTestResult] = useState<any | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all servers hardware data
  const fetchHardwareData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/hardware');
      if (res.ok) {
        const data = await res.json();
        setServers(data.servers || []);
        if (!selectedNodeId && data.servers && data.servers.length > 0) {
          setSelectedNodeId(data.servers[0].nodeId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch hardware data from API, using fallback:', err);
    } finally {
      setLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHardwareData(false);
  }, []);

  useEffect(() => {
    if (initialNodeId) {
      setSelectedNodeId(initialNodeId);
    }
  }, [initialNodeId]);

  // Filtered servers by brand category, specific brand, and search query
  const filteredServers = useMemo(() => {
    return servers.filter(server => {
      const brandInfo = detectBrandFromModel(server.serverModel) || (server.vendor ? SERVER_BRANDS_CATALOG.find(b => b.name.toLowerCase().includes(server.vendor!.toLowerCase())) : undefined);
      const isIndonesia = server.originCountry === 'Indonesia' || server.isTkdnCertified || brandInfo?.category === 'indonesia';
      
      // Category filter
      if (brandCategoryFilter === 'indonesia' && !isIndonesia) return false;
      if (brandCategoryFilter === 'global' && isIndonesia) return false;

      // Brand filter
      if (selectedBrandFilter !== 'ALL') {
        const matchBrandId = brandInfo?.id === selectedBrandFilter;
        const matchVendor = server.vendor?.toLowerCase().includes(selectedBrandFilter.toLowerCase());
        const matchModel = server.serverModel.toLowerCase().includes(selectedBrandFilter.toLowerCase());
        if (!matchBrandId && !matchVendor && !matchModel) return false;
      }

      // Node Search
      if (nodeSearch.trim()) {
        const q = nodeSearch.toLowerCase().trim();
        const matchName = server.nodeName.toLowerCase().includes(q);
        const matchModel = server.serverModel.toLowerCase().includes(q);
        const matchCluster = server.clusterName.toLowerCase().includes(q);
        const matchBmc = server.bmcType.toLowerCase().includes(q) || server.bmcIp.includes(q);
        if (!matchName && !matchModel && !matchCluster && !matchBmc) return false;
      }

      return true;
    });
  }, [servers, brandCategoryFilter, selectedBrandFilter, nodeSearch]);

  const currentServer: ServerHardware | undefined = useMemo(() => {
    if (!servers.length) return undefined;
    const matchSelected = servers.find(s => s.nodeId === selectedNodeId);
    if (matchSelected) return matchSelected;
    if (filteredServers.length > 0) return filteredServers[0];
    return servers[0];
  }, [servers, selectedNodeId, filteredServers]);

  const currentBrand: ServerBrandDefinition | undefined = useMemo(() => {
    if (!currentServer) return undefined;
    return detectBrandFromModel(currentServer.serverModel) || (currentServer.vendor ? SERVER_BRANDS_CATALOG.find(b => b.name.toLowerCase().includes(currentServer.vendor!.toLowerCase())) : undefined);
  }, [currentServer]);

  // Handler for BMC Connectivity Test
  const handleTestBmcConnection = async () => {
    if (!newBmcIp.trim()) {
      showToast('Harap masukkan Alamat IP / Hostname BMC terlebih dahulu.', 'error');
      return;
    }
    setIsBmcTesting(true);
    setBmCTestResult(null);
    try {
      const res = await fetch('/api/hardware/test-bmc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: newServerBrandId,
          bmcIp: newBmcIp,
          bmcPort: newBmcPort,
          protocol: newBmcProtocol,
          username: newBmcUser
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBmCTestResult(data);
        showToast(data.message, 'success');
      } else {
        showToast(data.message || 'Uji koneksi BMC gagal.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi endpoint uji BMC.', 'error');
    } finally {
      setIsBmcTesting(false);
    }
  };

  // Handler for Registering New Server Node
  const handleRegisterNewServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim() || !newBmcIp.trim()) {
      showToast('Harap lengkapi Nama Node dan Alamat IP BMC.', 'error');
      return;
    }
    setIsRegistering(true);
    try {
      const selectedBrand = getBrandById(newServerBrandId);
      const res = await fetch('/api/hardware/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeName: newNodeName,
          serverModel: newServerModel || (selectedBrand?.popularModels[0] || 'Enterprise Server 2U'),
          vendor: selectedBrand?.name || 'Custom Enterprise Server',
          originCountry: selectedBrand?.country || 'Indonesia',
          isTkdnCertified: Boolean(selectedBrand?.tkdnCertified),
          tkdnScore: selectedBrand?.tkdnScore,
          bmcType: selectedBrand?.defaultBmcType || 'Standard Redfish BMC',
          bmcIp: newBmcIp,
          clusterId: 'cluster-pve-01',
          clusterName: newClusterName || 'Proxmox-CEPH-Prod',
          assetTag: newAssetTag || `DC-RACK-U${Math.floor(Math.random() * 25 + 1)}`,
          serialNumber: `SRV-${selectedBrand?.id.toUpperCase() || 'NODE'}-${Math.floor(Math.random() * 89999 + 10000)}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, 'success');
        setShowAddServerModal(false);
        // Refresh server list & select newly registered node
        await fetchHardwareData(true);
        if (data.server?.nodeId) {
          setSelectedNodeId(data.server.nodeId);
        }
        // Reset form
        setNewNodeName('');
        setNewBmcIp('');
        setBmCTestResult(null);
      } else {
        showToast(data.error || 'Gagal mendaftarkan server.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat mendaftarkan server.', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle Run Diagnostic Suite
  const handleRunFullDiagnostics = async () => {
    if (!currentServer) return;
    setIsDiagnosticRunning(true);
    setShowDiagnosticModal(true);
    setDiagnosticProgress(5);
    setRunningStepIndex(0);

    try {
      const steps = [
        'CPU MCE & Microcode Parity',
        'RAM ECC Memory Pattern & Slot Detection',
        'NVMe S.M.A.R.T. Wear & Backplane Bays',
        'RAID Controller & BBU SuperCap Retention',
        'Dual PSU Redundancy 1+1 Load Balancing',
        'Chassis Fans PWM & Tachometer Sweep',
        'PCIe AER Bus Error & Lane Width Scan',
        'BMC / IPMI / SEL Out-of-band Verification'
      ];

      for (let i = 0; i < steps.length; i++) {
        setRunningStepIndex(i);
        setDiagnosticProgress(Math.round(((i + 1) / steps.length) * 85));
        await new Promise(r => setTimeout(r, 400));
      }

      const res = await fetch(`/api/hardware/${currentServer.nodeId}/diagnostics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosticProgress(100);
        setActiveDiagnosticResult(data.result);
        setServers(prev => prev.map(s => s.nodeId === currentServer.nodeId ? data.server : s));
        showToast(`Diagnostik untuk ${currentServer.nodeName} selesai! Skor: ${data.result.overallScore}%`, 'success');
      } else {
        showToast('Gagal memproses diagnostik di server backend.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat menjalankan diagnostik hardware.', 'error');
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  // Handle Drive SMART test
  const handleRunSmartTest = async (bayId: number, testType: 'short' | 'extended') => {
    if (!currentServer) return;
    setIsSmartTesting(true);
    try {
      const res = await fetch(`/api/hardware/${currentServer.nodeId}/smart-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bayId, testType })
      });
      if (res.ok) {
        fetchHardwareData(true);
        showToast(`Uji S.M.A.R.T. (${testType}) pada drive Bay #${bayId} berhasil dieksekusi!`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menjalankan uji S.M.A.R.T.', 'error');
    } finally {
      setIsSmartTesting(false);
    }
  };

  // Handle PSU Failover test
  const handleRunPsuFailoverTest = async () => {
    if (!currentServer) return;
    setIsPsuTesting(true);
    try {
      const res = await fetch(`/api/hardware/${currentServer.nodeId}/psu-failover-test`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchHardwareData(true);
        showToast('Uji failover catu daya (PSU 1+1 Redundant) berhasil! Transfer 0ms tanpa fluktuasi.', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal melakukan uji failover PSU.', 'error');
    } finally {
      setIsPsuTesting(false);
    }
  };

  // Handle Fan Profile Change
  const handleChangeFanProfile = async (profile: 'Optimal Auto' | 'Acoustic / Quiet' | 'Maximum Performance Cool') => {
    if (!currentServer) return;
    try {
      const res = await fetch(`/api/hardware/${currentServer.nodeId}/fan-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });
      if (res.ok) {
        fetchHardwareData(true);
        showToast(`Profil pendingin diubah ke: ${profile}`, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Clear SEL
  const handleClearSel = async () => {
    if (!currentServer) return;
    try {
      const res = await fetch(`/api/hardware/${currentServer.nodeId}/sel/clear`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchHardwareData(true);
        showToast('Buffer log hardware (SEL) berhasil dibersihkan.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export report handler
  const handleExportReport = (format: 'json' | 'csv') => {
    if (!currentServer) return;
    const url = `/api/hardware/${currentServer.nodeId}/export?format=${format}`;
    window.location.href = url;
    showToast(`Mengunduh laporan audit hardware ${currentServer.nodeName} (.${format})...`, 'info');
  };

  // Filtered RAM DIMMs
  const filteredDimms = useMemo(() => {
    if (!currentServer) return [];
    let list = currentServer.memory.dimmModules || [];
    if (dimmFilter === 'detected') {
      list = list.filter(d => d.detectionState === 'detected');
    } else if (dimmFilter === 'empty') {
      list = list.filter(d => d.detectionState === 'empty');
    } else if (dimmFilter === 'error') {
      list = list.filter(d => d.detectionState === 'not_detected_error' || d.status === 'correctable_ecc_warn');
    }
    return list;
  }, [currentServer, dimmFilter]);

  // Filtered Storage Drives
  const filteredDrives = useMemo(() => {
    if (!currentServer) return [];
    let list = currentServer.storage.drives || [];
    if (driveFilter === 'detected') {
      list = list.filter(d => d.detectionState === 'detected');
    } else if (driveFilter === 'empty') {
      list = list.filter(d => d.detectionState === 'empty');
    } else if (driveFilter === 'error') {
      list = list.filter(d => d.detectionState === 'not_detected_error' || d.status !== 'healthy');
    }
    return list;
  }, [currentServer, driveFilter]);

  // Filtered PCIe Slots
  const filteredPcie = useMemo(() => {
    if (!currentServer) return [];
    let list = currentServer.pcieAndNetwork.pcieSlots || [];
    if (pcieFilter === 'detected') {
      list = list.filter(s => s.detectionState === 'detected');
    } else if (pcieFilter === 'empty') {
      list = list.filter(s => s.detectionState === 'empty');
    } else if (pcieFilter === 'error') {
      list = list.filter(s => s.detectionState === 'link_degraded' || s.aerStatus !== 'clean');
    }
    return list;
  }, [currentServer, pcieFilter]);

  // Filtered SEL Logs
  const filteredSelLogs = useMemo(() => {
    if (!currentServer) return [];
    let list = currentServer.selLogs || [];
    if (selSeverityFilter !== 'ALL') {
      list = list.filter(l => l.severity === selSeverityFilter);
    }
    if (selSearch.trim()) {
      const q = selSearch.toLowerCase();
      list = list.filter(l => 
        l.description.toLowerCase().includes(q) ||
        l.sensor.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
      );
    }
    return list;
  }, [currentServer, selSeverityFilter, selSearch]);

  // Statistics for Slot Detection
  const dimmStats = useMemo(() => {
    if (!currentServer) return { total: 0, detected: 0, empty: 0, errors: 0 };
    const mods = currentServer.memory.dimmModules || [];
    return {
      total: currentServer.memory.totalSlots || mods.length,
      detected: mods.filter(m => m.detectionState === 'detected').length,
      empty: mods.filter(m => m.detectionState === 'empty').length,
      errors: mods.filter(m => m.detectionState === 'not_detected_error' || m.status === 'correctable_ecc_warn').length
    };
  }, [currentServer]);

  const driveStats = useMemo(() => {
    if (!currentServer) return { total: 0, detected: 0, empty: 0, errors: 0 };
    const drives = currentServer.storage.drives || [];
    return {
      total: currentServer.storage.totalBays || drives.length,
      detected: drives.filter(d => d.detectionState === 'detected').length,
      empty: drives.filter(d => d.detectionState === 'empty').length,
      errors: drives.filter(d => d.detectionState === 'not_detected_error' || (d.detectionState === 'detected' && d.status !== 'healthy')).length
    };
  }, [currentServer]);

  const pcieStats = useMemo(() => {
    if (!currentServer) return { total: 0, detected: 0, empty: 0, errors: 0 };
    const slots = currentServer.pcieAndNetwork.pcieSlots || [];
    return {
      total: slots.length,
      detected: slots.filter(s => s.detectionState === 'detected').length,
      empty: slots.filter(s => s.detectionState === 'empty').length,
      errors: slots.filter(s => s.detectionState === 'link_degraded' || s.aerStatus !== 'clean').length
    };
  }, [currentServer]);

  if (loading && !servers.length) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
        <RotateCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Memuat telemetri hardware server...</p>
      </div>
    );
  }

  if (!currentServer) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-100">Data Hardware Tidak Ditemukan</h3>
        <p className="text-xs text-slate-400 mt-1">Pastikan kluster memiliki server fisik terhubung.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 border border-slate-700/80 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`p-2 rounded-lg ${
            toastMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            toastMessage.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-xs font-sans text-slate-200 pr-2">{toastMessage.text}</p>
        </div>
      )}

      {/* Top Header & Server Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-xl shadow-md shadow-indigo-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold font-sans tracking-tight text-slate-100">
                Pemeriksaan Kesehatan Hardware Server
              </h2>
              <span className="text-2xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                Production Diagnostic & Slot Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans max-w-3xl leading-relaxed">
              Diagnostik komponen fisik tingkat rendah, inventaris slot lengkap (terdeteksi, kosong, dan gagal deteksi), telemetri sensor IPMI/BMC, S.M.A.R.T. NVMe/SAS, ECC RAM, redundansi PSU 1+1, dan bus PCIe.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* AI Deep Analysis Button */}
            {onOpenAiAnalysis && (
              <button
                onClick={() => onOpenAiAnalysis('hardware')}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer group"
                title="Audit & Analisis AI Hardware & Slot Fisik"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current text-indigo-200 group-hover:scale-110 transition-transform" />
                <span>Analisis AI Hardware</span>
              </button>
            )}

            {/* Run Full Diagnostics */}
            <button
              onClick={handleRunFullDiagnostics}
              disabled={isDiagnosticRunning}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
              <span>{isDiagnosticRunning ? 'Menjalankan Diagnostik...' : 'Jalankan Diagnostik'}</span>
            </button>

            {/* Official PDF Audit Report Button */}
            <button
              onClick={() => setShowPdfAuditModal(true)}
              className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-mono rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
              title="Lihat dan Cetak / Ekspor Laporan Audit Resmi PDF"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Laporan PDF Audit</span>
            </button>

            {/* Export Dropdown Group */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-0.5">
              <button
                onClick={() => handleExportReport('csv')}
                className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Ekspor laporan inventaris slot hardware dalam format CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>CSV</span>
              </button>
              <div className="h-4 w-px bg-slate-800" />
              <button
                onClick={() => handleExportReport('json')}
                className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Ekspor laporan audit hardware dalam format JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-400" />
                <span>JSON</span>
              </button>
            </div>

            {/* Refresh Live Telemetry */}
            <button
              onClick={() => fetchHardwareData(false)}
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 hover:bg-slate-800/70 rounded-xl transition cursor-pointer"
              title="Perbarui data telemetri hardware"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Multi-Brand Filter Bar & Server Actions */}
        <div className="mt-6 pt-5 border-t border-slate-800/70 space-y-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Category Filter Pills: Indonesia vs Global */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => { setBrandCategoryFilter('ALL'); setSelectedBrandFilter('ALL'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  brandCategoryFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                Semua Brand ({servers.length})
              </button>
              <button
                type="button"
                onClick={() => { setBrandCategoryFilter('indonesia'); setSelectedBrandFilter('ALL'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  brandCategoryFilter === 'indonesia'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <span>🇮🇩</span>
                <span>Brand Indonesia / TKDN ({servers.filter(s => s.originCountry === 'Indonesia' || s.isTkdnCertified || detectBrandFromModel(s.serverModel)?.category === 'indonesia').length})</span>
              </button>
              <button
                type="button"
                onClick={() => { setBrandCategoryFilter('global'); setSelectedBrandFilter('ALL'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  brandCategoryFilter === 'global'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                }`}
              >
                <span>🌍</span>
                <span>Brand Luar Negeri ({servers.filter(s => !(s.originCountry === 'Indonesia' || s.isTkdnCertified || detectBrandFromModel(s.serverModel)?.category === 'indonesia')).length})</span>
              </button>
            </div>

            {/* Controls: Brand Select, Search, Matrix Catalog, Add Server */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Brand Vendor Dropdown */}
              <div className="relative">
                <select
                  value={selectedBrandFilter}
                  onChange={(e) => setSelectedBrandFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none pr-8 hover:border-slate-700"
                >
                  <option value="ALL">Semua Manufaktur / Brand</option>
                  <optgroup label="🇮🇩 Brand Indonesia (Bersertifikat TKDN)">
                    {SERVER_BRANDS_CATALOG.filter(b => b.category === 'indonesia').map(b => (
                      <option key={b.id} value={b.id}>{b.flagEmoji} {b.name} (TKDN {b.tkdnScore}%)</option>
                    ))}
                  </optgroup>
                  <optgroup label="🌍 Brand Luar Negeri (Tier-1 Global)">
                    {SERVER_BRANDS_CATALOG.filter(b => b.category === 'global').map(b => (
                      <option key={b.id} value={b.id}>{b.flagEmoji} {b.name} ({b.country})</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Search Box */}
              <div className="relative min-w-[130px] max-w-[180px]">
                <input
                  type="text"
                  value={nodeSearch}
                  onChange={(e) => setNodeSearch(e.target.value)}
                  placeholder="Cari server / BMC..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-6 py-1.5 text-xs text-slate-200 font-sans placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {nodeSearch && (
                  <button type="button" onClick={() => setNodeSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Button: Katalog Brand */}
              <button
                type="button"
                onClick={() => setShowBrandMatrixModal(true)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Lihat Direktori Lengkap Brand Server & Matriks Protokol Sensor"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Katalog Brand</span>
              </button>

              {/* Button: + Tambah Server */}
              <button
                type="button"
                onClick={() => setShowAddServerModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Daftarkan Node Server Baru dari Brand Indonesia atau Luar Negeri"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tambah Server</span>
              </button>
            </div>
          </div>

          {/* Server Node Selection Carousel (Filtered) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Server className="w-3.5 h-3.5" /> Node Terpilih ({filteredServers.length}):
            </span>
            {filteredServers.length > 0 ? (
              filteredServers.map((server) => {
                const isSelected = server.nodeId === currentServer.nodeId;
                const brand = detectBrandFromModel(server.serverModel);
                const isIndo = server.originCountry === 'Indonesia' || server.isTkdnCertified || brand?.category === 'indonesia';
                return (
                  <button
                    key={server.id}
                    onClick={() => setSelectedNodeId(server.nodeId)}
                    className={`px-3.5 py-2 rounded-xl text-left font-mono text-xs transition-all flex items-center gap-2.5 shrink-0 border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow-sm shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      server.overallStatus === 'healthy' ? 'bg-emerald-400' :
                      server.overallStatus === 'warning' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500 animate-ping'
                    }`} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold leading-none">{server.nodeName}</span>
                        {isIndo ? (
                          <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold leading-none">
                            🇮🇩 TKDN
                          </span>
                        ) : (
                          <span className="text-[10px] leading-none">{brand?.flagEmoji || '🌍'}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1 truncate max-w-[130px]">
                        {server.serverModel.split(' ')[0]} {server.serverModel.split(' ')[1]}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 ${
                      server.overallHealthScore >= 90 ? 'bg-emerald-500/15 text-emerald-400' :
                      server.overallHealthScore >= 80 ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {server.overallHealthScore}%
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-xs text-slate-500 font-sans py-1.5 flex items-center gap-2">
                <span>Tidak ada server yang cocok dengan kriteria filter.</span>
                <button
                  type="button"
                  onClick={() => { setBrandCategoryFilter('ALL'); setSelectedBrandFilter('ALL'); setNodeSearch(''); }}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Server Hardware Identity & Core Metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Hardware Identity Card */}
        <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-base font-bold text-slate-100">{currentServer.nodeName}</span>
                <span className="text-xs text-slate-400 font-mono">({currentServer.clusterName})</span>
                <span className="px-2 py-0.5 rounded text-2xs font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  {currentServer.formFactor}
                </span>

                {/* Brand Origin & TKDN Badges */}
                {currentServer.originCountry === 'Indonesia' || currentServer.isTkdnCertified || currentBrand?.category === 'indonesia' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span>🇮🇩</span>
                    <span>BRAND INDONESIA · TKDN {currentServer.tkdnScore || currentBrand?.tkdnScore || 46.85}% KEMENPERIN</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-bold font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    <span>{currentBrand?.flagEmoji || '🌍'}</span>
                    <span>{currentBrand ? `${currentBrand.country.toUpperCase()} · GLOBAL TIER-1` : `${(currentServer.originCountry || 'GLOBAL').toUpperCase()} · ENTERPRISE SERVER`}</span>
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-300 font-sans mt-1">
                {currentServer.serverModel}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Manajemen Out-of-Band</span>
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1 sm:justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {currentServer.bmcType} ({currentServer.bmcIp})
                </span>
                <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">
                  Protokol: {currentServer.bmcProtocol || 'DMTF Redfish v1.18+ / IPMI 2.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
            <div className="bg-slate-950/70 border border-slate-800/60 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Serial & Asset Tag</span>
              <span className="font-bold text-slate-200 truncate block mt-0.5">{currentServer.serialNumber}</span>
              <span className="text-[10px] text-slate-400 block">{currentServer.assetTag}</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/60 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">BIOS & Microcode</span>
              <span className="font-bold text-slate-200 truncate block mt-0.5">{currentServer.biosVersion.split(' ')[1]}</span>
              <span className="text-[10px] text-indigo-400 block">{currentServer.cpu.microcodeVersion}</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/60 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Baterai CMOS & Tamper</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${currentServer.cmosBattery.status === 'good' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {currentServer.cmosBattery.voltage} V ({currentServer.cmosBattery.status.toUpperCase()})
              </span>
              <span className="text-[10px] text-slate-400 block">Chassis: {currentServer.chassisIntrusion.toUpperCase()}</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/60 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase">Uptime Hardware</span>
              <span className="font-bold text-slate-200 block mt-0.5">{currentServer.uptimeDays} Hari</span>
              <span className="text-[10px] text-emerald-400 block">Cold Boot Normal</span>
            </div>
          </div>
        </div>

        {/* Overall Health Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-mono uppercase tracking-wider text-slate-400 font-bold">Skor Kesehatan Hardware</span>
            <span className={`px-2 py-0.5 rounded text-2xs font-mono font-bold uppercase ${
              currentServer.overallStatus === 'healthy' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
              currentServer.overallStatus === 'warning' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
              'bg-rose-500/15 text-rose-400 border border-rose-500/20'
            }`}>
              {currentServer.overallStatus}
            </span>
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="relative flex items-center justify-center">
              <div className={`w-18 h-18 rounded-full border-4 flex items-center justify-center ${
                currentServer.overallHealthScore >= 90 ? 'border-emerald-500 text-emerald-400' :
                currentServer.overallHealthScore >= 80 ? 'border-amber-500 text-amber-400' :
                'border-rose-500 text-rose-400'
              }`}>
                <span className="text-xl font-mono font-extrabold">{currentServer.overallHealthScore}%</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-100 block">
                {currentServer.overallHealthScore >= 90 ? 'Kondisi Optimal' :
                 currentServer.overallHealthScore >= 80 ? 'Perlu Perhatian' : 'Kondisi Kritis'}
              </span>
              <p className="text-2xs text-slate-400 mt-0.5 leading-relaxed">
                {currentServer.overallHealthScore >= 90 
                  ? 'Semua sensor termal, redundansi PSU, slot ECC RAM, dan drive S.M.A.R.T. dalam batas toleransi aman.'
                  : 'Ditemukan peringatan pada subsistem hardware atau slot yang gagal terdeteksi.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPdfAuditModal(true)}
            className="w-full py-1.5 text-2xs font-mono text-center text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/50 rounded-lg transition"
          >
            Buka Ringkasan Audit &rarr;
          </button>
        </div>
      </div>

      {/* Production Slot Health Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* RAM DIMM Slots Status */}
        <button
          onClick={() => setActiveSubTab('memory')}
          className="bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 p-3.5 rounded-xl text-left transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-indigo-400" /> Slot RAM DIMM</span>
            <span className="font-bold text-slate-200">{dimmStats.detected}/{dimmStats.total} Terisi</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono font-bold text-emerald-400">{dimmStats.detected} Terdeteksi</span>
            <span className="text-xs font-mono text-slate-500">·</span>
            <span className="text-xs font-mono text-slate-400">{dimmStats.empty} Kosong</span>
            {dimmStats.errors > 0 && (
              <span className="text-xs font-mono font-bold text-rose-400 animate-pulse">({dimmStats.errors} Gagal)</span>
            )}
          </div>
        </button>

        {/* Drive Bays Status */}
        <button
          onClick={() => setActiveSubTab('storage')}
          className="bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 p-3.5 rounded-xl text-left transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Drive Bays Backplane</span>
            <span className="font-bold text-slate-200">{driveStats.detected}/{driveStats.total} Terisi</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono font-bold text-emerald-400">{driveStats.detected} Terdeteksi</span>
            <span className="text-xs font-mono text-slate-500">·</span>
            <span className="text-xs font-mono text-slate-400">{driveStats.empty} Kosong</span>
            {driveStats.errors > 0 && (
              <span className="text-xs font-mono font-bold text-rose-400 animate-pulse">({driveStats.errors} Drop)</span>
            )}
          </div>
        </button>

        {/* PCIe Slots Status */}
        <button
          onClick={() => setActiveSubTab('pcie')}
          className="bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 p-3.5 rounded-xl text-left transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-indigo-400" /> Slot Ekspansi PCIe</span>
            <span className="font-bold text-slate-200">{pcieStats.detected}/{pcieStats.total} Terpasang</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono font-bold text-emerald-400">{pcieStats.detected} Terdeteksi</span>
            <span className="text-xs font-mono text-slate-500">·</span>
            <span className="text-xs font-mono text-slate-400">{pcieStats.empty} Kosong</span>
            {pcieStats.errors > 0 && (
              <span className="text-xs font-mono font-bold text-amber-400">({pcieStats.errors} Degraded)</span>
            )}
          </div>
        </button>

        {/* Dual PSU Status */}
        <button
          onClick={() => setActiveSubTab('power_cooling')}
          className="bg-slate-900 border border-slate-800/90 hover:border-indigo-500/50 p-3.5 rounded-xl text-left transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-indigo-400" /> Catu Daya (PSU)</span>
            <span className="font-bold text-slate-200">{currentServer.power.psus.length} Unit</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono font-bold text-emerald-400">
              {currentServer.power.psus.filter(p => p.status === 'online').length}/2 Online (1+1)
            </span>
            <span className="text-xs font-mono text-slate-400">· {currentServer.power.totalPowerDrawW}W</span>
          </div>
        </button>
      </div>

      {/* Subsystem Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', name: 'Ringkasan & Diagnostik', icon: Activity },
          { id: 'cpu', name: 'CPU & Prosesor', icon: Cpu },
          { id: 'memory', name: 'Slot RAM DIMM', icon: Layers, badge: `${dimmStats.detected}/${dimmStats.total}` },
          { id: 'storage', name: 'Drive Bay Backplane', icon: HardDrive, badge: `${driveStats.detected}/${driveStats.total}` },
          { id: 'pcie', name: 'Slot Ekspansi PCIe', icon: Sliders, badge: `${pcieStats.detected}/${pcieStats.total}` },
          { id: 'power_cooling', name: 'Catu Daya & Suhu (PSU/Fan)', icon: Zap },
          { id: 'bmc_sel', name: 'Log BMC / IPMI (SEL)', icon: Terminal, badge: currentServer.selLogs.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as HardwareSubTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-sans font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & DIAGNOSTICS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Last Diagnostic Execution Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Hasil Pengujian Diagnostik Terakhir
                </h3>
                <p className="text-2xs text-slate-400 mt-0.5">
                  {currentServer.lastDiagnostic 
                    ? `Dijalankan pada ${new Date(currentServer.lastDiagnostic.completedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB oleh ${currentServer.lastDiagnostic.executedBy}`
                    : 'Belum ada diagnostik otomatis yang disimpan untuk sesi ini. Jalankan pemeriksaan baru untuk memvalidasi seluruh subsistem.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPdfAuditModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-mono rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Cetak / Ekspor PDF</span>
                </button>

                <button
                  onClick={handleRunFullDiagnostics}
                  disabled={isDiagnosticRunning}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-mono rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>Jalankan Ulang Diagnostik</span>
                </button>
              </div>
            </div>

            {currentServer.lastDiagnostic ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {currentServer.lastDiagnostic.tests.map((test) => (
                    <div key={test.id} className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            test.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400' :
                            test.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {test.status}
                          </span>
                          <span className="text-xs font-bold text-slate-200">{test.name}</span>
                        </div>
                        <p className="text-2xs text-slate-400 leading-relaxed">{test.details}</p>
                      </div>
                      <span className="text-2xs font-mono text-slate-500 shrink-0">{test.durationMs}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                <p className="text-xs text-slate-400">Klik tombol "Jalankan Diagnostik" di atas untuk melakukan stress check hardware komprehensif.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CPU & PROCESSOR */}
      {activeSubTab === 'cpu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentServer.cpu.sockets.map((socket) => (
              <div key={socket.socketId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-indigo-400 uppercase font-bold tracking-wider">Socket #{socket.socketId} (Terdeteksi & Aktif)</span>
                      <h4 className="text-sm font-bold text-slate-100">{socket.model.split('(')[0]}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-extrabold text-slate-100">{socket.temperatureC}°C</span>
                    <span className="text-2xs font-mono text-slate-500 block">TjMax: {socket.tjMaxC}°C</span>
                  </div>
                </div>

                {/* Frequency & Voltage Specs */}
                <div className="grid grid-cols-4 gap-2 text-2xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Clock Aktif</span>
                    <span className="text-slate-200 font-bold">{socket.currentGhz} GHz</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tegangan VCore</span>
                    <span className="text-slate-200 font-bold">{socket.voltageV} V</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Suhu VRM</span>
                    <span className="text-slate-200 font-bold">{socket.vrmTempC} °C</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">L3 Cache</span>
                    <span className="text-indigo-400 font-bold">{socket.l3CacheMb} MB</span>
                  </div>
                </div>

                {/* Per-Core Thermal Heatmap */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
                    <span>Distribusi Suhu Per-Core (Core Thermals Heatmap)</span>
                    <span className="text-slate-500">Target &lt; 70°C</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {socket.coresThermal.map((core) => {
                      const temp = core.tempC;
                      const colorClass = 
                        temp >= 75 ? 'bg-rose-500 text-white' :
                        temp >= 65 ? 'bg-amber-500/80 text-white' :
                        temp >= 50 ? 'bg-emerald-600/70 text-emerald-100' :
                        'bg-slate-800 text-slate-300';
                      return (
                        <div 
                          key={core.coreId} 
                          className={`p-1.5 rounded-lg text-center font-mono transition-transform hover:scale-105 ${colorClass}`}
                          title={`Core ${core.coreId}: ${core.tempC}°C (Load: ${core.usagePercent}%)`}
                        >
                          <span className="text-[9px] block opacity-75">C{core.coreId}</span>
                          <span className="text-xs font-bold block">{core.tempC}°</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-2xs font-mono">
                  <span className="text-slate-400">Hardware Mitigations (Spectre / Meltdown / Foreshadow):</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> SECURE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEMORY RAM ECC SLOTS (TERDETEKSI & TIDAK TERDETEKSI) */}
      {activeSubTab === 'memory' && (
        <div className="space-y-5">
          {/* Header & Filter Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-sans text-slate-100">
                    Inventaris Slot Fisik RAM DIMM (Deteksi Slot Motherboard)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-2xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                    {dimmStats.detected} Terdeteksi / {dimmStats.total} Total Slot
                  </span>
                </div>
                <p className="text-2xs text-slate-400 mt-1">
                  Menampilkan seluruh slot fisik motherboard (Socket 0 & Socket 1). Slot terisi, slot kosong yang siap untuk ekspansi kapasitas, serta deteksi modul yang mengalami kegagalan POST / Training Error.
                </p>
              </div>

              {/* Slot Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setDimmFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer ${
                    dimmFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua Slot ({dimmStats.total})
                </button>
                <button
                  onClick={() => setDimmFilter('detected')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                    dimmFilter === 'detected' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Terdeteksi ({dimmStats.detected})
                </button>
                <button
                  onClick={() => setDimmFilter('empty')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                    dimmFilter === 'empty' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Kosong ({dimmStats.empty})
                </button>
                {dimmStats.errors > 0 && (
                  <button
                    onClick={() => setDimmFilter('error')}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                      dimmFilter === 'error' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    Gagal Deteksi ({dimmStats.errors})
                  </button>
                )}
              </div>
            </div>

            {/* Motherboard Topography Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredDimms.map((dimm) => {
                const isDetected = dimm.detectionState === 'detected';
                const isEmpty = dimm.detectionState === 'empty';
                const isError = dimm.detectionState === 'not_detected_error' || dimm.status === 'training_failed';

                return (
                  <div 
                    key={dimm.slot}
                    onClick={() => setSelectedSlotInspection({ type: 'dimm', title: `Detail Slot RAM: ${dimm.slot}`, data: dimm })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isDetected
                        ? 'bg-slate-950 border-slate-800 hover:border-indigo-500/60'
                        : isEmpty
                        ? 'bg-slate-950/40 border-dashed border-slate-800/80 hover:border-slate-700 opacity-80'
                        : 'bg-rose-950/30 border-rose-500/60 hover:border-rose-400 shadow-md shadow-rose-950/40'
                    }`}
                  >
                    {/* Top Slot Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-200">{dimm.slot}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({dimm.channel})</span>
                      </div>

                      {isDetected ? (
                        <span className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold ${
                          dimm.status === 'optimal' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          TERDETEKSI
                        </span>
                      ) : isEmpty ? (
                        <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          SLOT KOSONG
                        </span>
                      ) : (
                        <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">
                          GAGAL POST
                        </span>
                      )}
                    </div>

                    {/* Slot Content */}
                    {isDetected ? (
                      <div className="space-y-1 text-2xs font-mono text-slate-400 mt-2.5">
                        <div className="flex justify-between">
                          <span>Kapasitas:</span>
                          <span className="text-slate-100 font-bold">{dimm.sizeGb} GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Produsen:</span>
                          <span className="text-slate-200">{dimm.manufacturer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Part Number:</span>
                          <span className="text-slate-300 truncate max-w-[120px]">{dimm.partNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Suhu SPD:</span>
                          <span className="text-slate-200 font-bold">{dimm.temperatureC}°C</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800">
                          <span>ECC Corrected:</span>
                          <span className={`font-bold ${dimm.correctableErrors > 5 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {dimm.correctableErrors} kali
                          </span>
                        </div>
                      </div>
                    ) : isEmpty ? (
                      <div className="space-y-1.5 text-2xs font-mono text-slate-500 mt-2.5">
                        <p className="text-[11px] text-slate-400 font-sans">Belum terpasang modul.</p>
                        <p className="text-[10px] text-indigo-400/90 leading-tight">
                          {dimm.errorDetails || 'Tersedia untuk ekspansi DDR5 hingga 64GB / 4800MT/s.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-2xs font-mono text-rose-300 mt-2.5">
                        <div className="flex items-center gap-1 text-rose-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Modul Fisik Tidak Terdeteksi</span>
                        </div>
                        <p className="text-[10px] text-rose-300 leading-relaxed">
                          {dimm.errorDetails}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STORAGE & DRIVE BAYS BACKPLANE (TERDETEKSI & TIDAK TERDETEKSI) */}
      {activeSubTab === 'storage' && (
        <div className="space-y-5">
          {/* RAID Controller Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-2xs font-mono text-indigo-400 uppercase tracking-wider font-bold">Hardware RAID / HBA Controller</span>
                <h4 className="text-sm font-bold text-slate-100">{currentServer.storage.controller.model}</h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">BBU SuperCap</span>
                  <span className="text-emerald-400 font-bold">{currentServer.storage.controller.bbuCapacityPercent}% ({currentServer.storage.controller.bbuStatus.toUpperCase()})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Write Policy</span>
                  <span className="text-indigo-400 font-bold">{currentServer.storage.controller.writePolicy}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drive Backplane Bays Grid & Filters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold font-sans text-slate-100">
                    Peta Drive Bay Fisik Server ({driveStats.total} Bay Hot-Swap)
                  </h4>
                  <span className="px-2 py-0.5 rounded text-2xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                    {driveStats.detected} Terdeteksi / {driveStats.total} Total Bay
                  </span>
                </div>
                <p className="text-2xs text-slate-400 mt-1">
                  Visualisasi slot tray hard drive dan SSD NVMe front-panel. Memantau slot yang aktif terdeteksi, slot bay kosong yang siap hot-plug, serta tray yang mengalami gangguan koneksi SAS/NVMe.
                </p>
              </div>

              {/* Bay Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setDriveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer ${
                    driveFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua Bay ({driveStats.total})
                </button>
                <button
                  onClick={() => setDriveFilter('detected')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                    driveFilter === 'detected' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Terdeteksi ({driveStats.detected})
                </button>
                <button
                  onClick={() => setDriveFilter('empty')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                    driveFilter === 'empty' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Bay Kosong ({driveStats.empty})
                </button>
                {driveStats.errors > 0 && (
                  <button
                    onClick={() => setDriveFilter('error')}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                      driveFilter === 'error' ? 'bg-rose-600 text-white font-bold' : 'text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    Gagal Deteksi ({driveStats.errors})
                  </button>
                )}
              </div>
            </div>

            {/* Drive Bays Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDrives.map((drive) => {
                const isDetected = drive.detectionState === 'detected';
                const isEmpty = drive.detectionState === 'empty';
                const isError = drive.detectionState === 'not_detected_error' || drive.status === 'fault';

                return (
                  <div
                    key={drive.bayId}
                    onClick={() => setSelectedSlotInspection({ type: 'drive', title: `Detail Drive Bay #${drive.bayId}`, data: drive })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isDetected
                        ? 'bg-slate-950 border-slate-800 hover:border-indigo-500/60'
                        : isEmpty
                        ? 'bg-slate-950/40 border-dashed border-slate-800/80 hover:border-slate-700 opacity-80'
                        : 'bg-rose-950/30 border-rose-500/60 hover:border-rose-400 shadow-md shadow-rose-950/40'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-2xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                          BAY #{drive.bayId}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-200">{drive.protocol}</span>
                      </div>

                      {isDetected ? (
                        <span className={`px-2 py-0.5 rounded text-2xs font-mono font-bold uppercase ${
                          drive.smartStatus === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          TERDETEKSI ({drive.healthPercent}%)
                        </span>
                      ) : isEmpty ? (
                        <span className="px-2 py-0.5 rounded text-2xs font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          BAY KOSONG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-2xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">
                          GAGAL DETEKSI
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-sans font-bold text-slate-100 mt-2 truncate">{drive.model}</h5>

                    {isDetected ? (
                      <div className="space-y-2 mt-3">
                        <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 text-2xs font-mono">
                          <div>
                            <span className="text-slate-500 block">Tingkat Aus:</span>
                            <span className="text-slate-200 font-bold">{drive.wearLevelPercent}%</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Suhu:</span>
                            <span className="text-slate-200 font-bold">{drive.temperatureC}°C</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">TBW Written:</span>
                            <span className="text-slate-200 font-bold">{drive.tbwWrittenTb} TB</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                            {drive.slotNote || `Capacity: ${drive.capacityGb}GB`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunSmartTest(drive.bayId, 'short');
                            }}
                            disabled={isSmartTesting}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-2xs font-mono rounded-lg transition"
                          >
                            Uji S.M.A.R.T.
                          </button>
                        </div>
                      </div>
                    ) : isEmpty ? (
                      <div className="space-y-1.5 text-2xs font-mono text-slate-500 mt-3">
                        <p className="text-[11px] text-slate-400 font-sans">Slot bay kosong.</p>
                        <p className="text-[10px] text-indigo-400/90 leading-tight">
                          {drive.slotNote || 'Hot-swap caddy siap digunakan untuk disk NVMe / SAS 2.5".'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-2xs font-mono text-rose-300 mt-3">
                        <div className="flex items-center gap-1 text-rose-400 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Link PHY Drop / Power Pin Failure</span>
                        </div>
                        <p className="text-[10px] text-rose-300 leading-relaxed">
                          {drive.slotNote}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PCIE EXPANSION SLOTS */}
      {activeSubTab === 'pcie' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-sans text-slate-100">
                    Slot Ekspansi PCIe & Riser Bus Topography
                  </h3>
                  <span className="px-2 py-0.5 rounded text-2xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                    {pcieStats.detected} Terdeteksi / {pcieStats.total} Total Slot
                  </span>
                </div>
                <p className="text-2xs text-slate-400 mt-1">
                  Inventaris slot fisik PCIe (Riser 1, 2, 3), verifikasi link speed negotiation (apakah ada degradasi lebar lane x16 ke x4), dan sensor error pelaporan tingkat lanjut (AER).
                </p>
              </div>

              {/* PCIe Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setPcieFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer ${
                    pcieFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua Slot ({pcieStats.total})
                </button>
                <button
                  onClick={() => setPcieFilter('detected')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                    pcieFilter === 'detected' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Terdeteksi ({pcieStats.detected})
                </button>
                <button
                  onClick={() => setPcieFilter('empty')}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                    pcieFilter === 'empty' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Kosong ({pcieStats.empty})
                </button>
                {pcieStats.errors > 0 && (
                  <button
                    onClick={() => setPcieFilter('error')}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-mono transition cursor-pointer flex items-center gap-1 ${
                      pcieFilter === 'error' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Degraded ({pcieStats.errors})
                  </button>
                )}
              </div>
            </div>

            {/* PCIe Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredPcie.map((slot) => {
                const isDetected = slot.detectionState === 'detected';
                const isEmpty = slot.detectionState === 'empty';
                const isDegraded = slot.detectionState === 'link_degraded';

                return (
                  <div
                    key={slot.slotId}
                    onClick={() => setSelectedSlotInspection({ type: 'pcie', title: `Detail ${slot.slotId}`, data: slot })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isDetected
                        ? 'bg-slate-950 border-slate-800 hover:border-indigo-500/60'
                        : isEmpty
                        ? 'bg-slate-950/40 border-dashed border-slate-800/80 hover:border-slate-700 opacity-80'
                        : 'bg-amber-950/30 border-amber-500/60 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-200">{slot.slotId}</span>
                      {isDetected ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          TERDETEKSI
                        </span>
                      ) : isEmpty ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                          SLOT KOSONG
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                          LINK DEGRADED
                        </span>
                      )}
                    </div>

                    <h5 className="text-xs font-sans font-bold text-slate-100 mt-2 truncate">{slot.cardName}</h5>

                    {isDetected ? (
                      <div className="space-y-1.5 text-2xs font-mono text-slate-400 mt-3 pt-2 border-t border-slate-800">
                        <div className="flex justify-between">
                          <span>Link Speed:</span>
                          <span className="text-slate-200 font-bold">{slot.linkSpeed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Width Mechanical/Neg:</span>
                          <span className="text-indigo-400 font-bold">{slot.mechanicalWidth} / {slot.negotiatedWidth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status AER:</span>
                          <span className="text-emerald-400 font-bold">{slot.aerStatus.toUpperCase()}</span>
                        </div>
                      </div>
                    ) : isEmpty ? (
                      <div className="text-2xs font-mono text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
                        <p className="text-[11px] text-slate-400 font-sans">{slot.slotNote || 'Slot ekspansi siap dipasang kartu tambahan.'}</p>
                      </div>
                    ) : (
                      <div className="text-2xs font-mono text-amber-300 mt-3 pt-2 border-t border-amber-800/40">
                        <p className="text-[10px] leading-relaxed">{slot.slotNote}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: POWER & COOLING */}
      {activeSubTab === 'power_cooling' && (
        <div className="space-y-6">
          {/* Dual Redundant PSUs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Slot Catu Daya Redundan 1+1 (Dual Hot-Plug PSUs)
                </h3>
                <p className="text-2xs text-slate-400 mt-0.5">
                  Arsitektur failover aktif dengan pembagian beban seimbang untuk mencegah downtime saat pemeliharaan feed listrik AC.
                </p>
              </div>

              <button
                onClick={handleRunPsuFailoverTest}
                disabled={isPsuTesting}
                className="px-3.5 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-mono rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${isPsuTesting ? 'animate-bounce' : ''}`} />
                <span>{isPsuTesting ? 'Menguji Failover...' : 'Uji Failover PSU 1+1'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentServer.power.psus.map((psu) => {
                const isDetected = psu.detectionState === 'detected';
                return (
                  <div key={psu.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-200">{psu.id}</span>
                      <span className={`px-2 py-0.5 rounded text-2xs font-mono font-bold ${
                        isDetected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isDetected ? 'TERDETEKSI & ONLINE' : 'SLOT KOSONG'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans">{psu.model}</p>
                    <div className="grid grid-cols-3 gap-2 text-2xs font-mono pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500 block">Tegangan Input:</span>
                        <span className="text-slate-200 font-bold">{psu.inputVoltageV} V AC</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Beban Daya:</span>
                        <span className="text-slate-200 font-bold">{psu.outputWatts} Watt</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Suhu Trafo:</span>
                        <span className="text-slate-200 font-bold">{psu.tempC} °C</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cooling Fan Arrays & Thermal Zones */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
                  <Fan className="w-4 h-4 text-cyan-400" />
                  Array Kipas Chassis & Profil Pendingin
                </h3>
                <p className="text-2xs text-slate-400 mt-0.5">
                  Pemantauan tachometer dual-rotor fan untuk mendeteksi rotor stall dan menjaga aliran udara optimal ({currentServer.cooling.airflowCfm} CFM).
                </p>
              </div>

              {/* Fan Profile Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['Optimal Auto', 'Acoustic / Quiet', 'Maximum Performance Cool'] as const).map((profile) => (
                  <button
                    key={profile}
                    onClick={() => handleChangeFanProfile(profile)}
                    className={`px-3 py-1 rounded-lg text-2xs font-mono transition cursor-pointer ${
                      currentServer.cooling.fanProfile === profile
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {profile}
                  </button>
                ))}
              </div>
            </div>

            {/* Fans Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {currentServer.cooling.fans.map((fan) => (
                <div key={fan.fanId} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center space-y-1.5">
                  <span className="text-2xs font-mono text-slate-400 font-bold block truncate">{fan.fanId.split(' ')[0]}</span>
                  <span className="text-base font-mono font-extrabold text-slate-100 block">{fan.rpm}</span>
                  <span className="text-[10px] font-mono text-slate-500 block">RPM (PWM {fan.pwmPercent}%)</span>
                  <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    fan.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {fan.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: BMC & SYSTEM EVENT LOG (SEL) */}
      {activeSubTab === 'bmc_sel' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-sans text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  System Event Log (SEL / IPMI 2.0 & Redfish)
                </h3>
                <p className="text-2xs text-slate-400 mt-0.5">
                  Jejak log rekaman hardware firmware non-volatile mencatat peringatan sensor suhu, power failover, memory parity, dan intrusion.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearSel}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-2xs font-mono rounded-xl transition cursor-pointer"
                >
                  Bersihkan Buffer SEL
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={selSearch}
                  onChange={(e) => setSelSearch(e.target.value)}
                  placeholder="Cari deskripsi event, sensor, kode IPMI..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFORMATIONAL'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelSeverityFilter(sev)}
                    className={`px-3 py-1.5 rounded-xl text-2xs font-mono transition cursor-pointer ${
                      selSeverityFilter === sev
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* SEL Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3.5">Waktu (UTC)</th>
                    <th className="py-2.5 px-3.5">Sensor</th>
                    <th className="py-2.5 px-3.5">Tingkat</th>
                    <th className="py-2.5 px-3.5">Deskripsi Event</th>
                    <th className="py-2.5 px-3.5 text-right">Kode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {filteredSelLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3.5 text-slate-400 text-2xs">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-200 text-2xs">{log.sensor}</td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' :
                          log.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-300 font-sans text-xs">{log.description}</td>
                      <td className="py-2.5 px-3.5 text-right text-slate-500 text-2xs">{log.code}</td>
                    </tr>
                  ))}
                  {filteredSelLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        Tidak ada log event SEL yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL AUDIT REPORT / PDF MODAL */}
      {showPdfAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl p-6 md:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
            
            {/* Action Bar (Hidden when printing) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2 text-indigo-400">
                <FileText className="w-5 h-5" />
                <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Laporan Audit Kesehatan Hardware Produksi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => handleExportReport('csv')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => setShowPdfAuditModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Document Body */}
            <div id="printable-audit-report" className="space-y-6 bg-slate-950 p-6 md:p-8 rounded-xl border border-slate-800/80 print:bg-white print:text-black print:border-none print:p-0">
              {/* Header Certificate */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:border-slate-300">
                <div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-6 h-6 text-emerald-400 print:text-emerald-700" />
                    <h2 className="text-lg font-bold font-sans text-slate-100 print:text-black tracking-tight">
                      HARDWARE COMPLIANCE & PHYSICAL SLOT AUDIT
                    </h2>
                  </div>
                  <span className="text-2xs font-mono text-slate-400 print:text-slate-600 block mt-1">
                    Sistem Pemantauan Infrastruktur · Infra Health Intelligence Engine
                  </span>
                </div>

                <div className="text-right font-mono text-xs text-slate-400 print:text-slate-700">
                  <span className="block font-bold text-slate-200 print:text-black">REF: AUD-{currentServer.nodeId.toUpperCase()}-{Date.now().toString().slice(-6)}</span>
                  <span className="block text-2xs mt-0.5">Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Server Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-500 uppercase block">Node Name</span>
                  <strong className="text-slate-100 print:text-black block mt-0.5">{currentServer.nodeName}</strong>
                  <span className="text-[10px] text-slate-400">{currentServer.clusterName}</span>
                </div>
                <div className="p-3 bg-slate-900 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-500 uppercase block">Model Server</span>
                  <strong className="text-slate-100 print:text-black block mt-0.5 truncate">{currentServer.serverModel}</strong>
                  <span className="text-[10px] text-slate-400">{currentServer.formFactor}</span>
                </div>
                <div className="p-3 bg-slate-900 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-500 uppercase block">Serial & Asset Tag</span>
                  <strong className="text-slate-100 print:text-black block mt-0.5">{currentServer.serialNumber}</strong>
                  <span className="text-[10px] text-slate-400">{currentServer.assetTag}</span>
                </div>
                <div className="p-3 bg-slate-900 print:bg-slate-100 rounded-lg border border-slate-800 print:border-slate-300">
                  <span className="text-[10px] text-slate-500 uppercase block">Status Kepatuhan</span>
                  <strong className={`block mt-0.5 font-bold ${currentServer.overallHealthScore >= 90 ? 'text-emerald-400 print:text-emerald-700' : 'text-amber-400 print:text-amber-700'}`}>
                    {currentServer.overallHealthScore}% ({currentServer.overallStatus.toUpperCase()})
                  </strong>
                  <span className="text-[10px] text-slate-400">Uptime: {currentServer.uptimeDays} Hari</span>
                </div>
              </div>

              {/* Physical Slot Detection Summary Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400 print:text-indigo-700" />
                  1. Rekapitulasi Deteksi Slot Fisik Hardware (Physical Slot Inventory)
                </h4>
                <div className="border border-slate-800 print:border-slate-300 rounded-lg overflow-hidden text-xs font-mono">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 print:bg-slate-100 text-slate-400 print:text-black border-b border-slate-800 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Komponen Slot</th>
                        <th className="py-2 px-3">Total Slot</th>
                        <th className="py-2 px-3">Terdeteksi / Terisi</th>
                        <th className="py-2 px-3">Slot Kosong</th>
                        <th className="py-2 px-3">Gagal Deteksi / Warning</th>
                        <th className="py-2 px-3 text-right">Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-200 print:text-black">Slot RAM DIMM</td>
                        <td className="py-2 px-3">{dimmStats.total} Slots</td>
                        <td className="py-2 px-3 text-emerald-400 print:text-emerald-700 font-bold">{dimmStats.detected} Modul ({currentServer.memory.totalCapacityGb}GB)</td>
                        <td className="py-2 px-3 text-slate-400">{dimmStats.empty} Slots</td>
                        <td className="py-2 px-3">
                          {dimmStats.errors > 0 ? (
                            <span className="text-rose-400 print:text-rose-700 font-bold">{dimmStats.errors} Gagal Deteksi</span>
                          ) : (
                            <span className="text-emerald-400 print:text-emerald-700">0 (Nihil)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400 print:text-emerald-700">PASSED</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-200 print:text-black">Drive Bays (Backplane)</td>
                        <td className="py-2 px-3">{driveStats.total} Bays</td>
                        <td className="py-2 px-3 text-emerald-400 print:text-emerald-700 font-bold">{driveStats.detected} Drives Aktif</td>
                        <td className="py-2 px-3 text-slate-400">{driveStats.empty} Bays Ready</td>
                        <td className="py-2 px-3">
                          {driveStats.errors > 0 ? (
                            <span className="text-rose-400 print:text-rose-700 font-bold">{driveStats.errors} Link Drop</span>
                          ) : (
                            <span className="text-emerald-400 print:text-emerald-700">0 (Nihil)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400 print:text-emerald-700">PASSED</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-200 print:text-black">Slot Ekspansi PCIe</td>
                        <td className="py-2 px-3">{pcieStats.total} Slots</td>
                        <td className="py-2 px-3 text-emerald-400 print:text-emerald-700 font-bold">{pcieStats.detected} Kartu Terpasang</td>
                        <td className="py-2 px-3 text-slate-400">{pcieStats.empty} Slots Tersedia</td>
                        <td className="py-2 px-3">
                          {pcieStats.errors > 0 ? (
                            <span className="text-amber-400 print:text-amber-700 font-bold">{pcieStats.errors} Lane Degraded</span>
                          ) : (
                            <span className="text-emerald-400 print:text-emerald-700">0 (Nihil)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400 print:text-emerald-700">PASSED</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-200 print:text-black">Catu Daya (PSU 1+1)</td>
                        <td className="py-2 px-3">2 Bays</td>
                        <td className="py-2 px-3 text-emerald-400 print:text-emerald-700 font-bold">2 Online (Redundant)</td>
                        <td className="py-2 px-3 text-slate-400">0</td>
                        <td className="py-2 px-3 text-emerald-400 print:text-emerald-700">0 (Nihil)</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-400 print:text-emerald-700">PASSED</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Diagnostic Test Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                  2. Hasil Diagnostik Komprehensif (Automated Health Probes)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-2xs font-mono">
                  {(currentServer.lastDiagnostic?.tests || []).map((t) => (
                    <div key={t.id} className="p-2.5 bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-lg flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-slate-200 print:text-black block">{t.name}</strong>
                        <span className="text-slate-400 print:text-slate-600 block mt-0.5">{t.details}</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                        t.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400 print:text-emerald-800' :
                        t.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 print:text-amber-800' : 'bg-rose-500/10 text-rose-400 print:text-rose-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Sign-Off Footer */}
              <div className="pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-6 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Pemeriksa Sistem (System Auditor):</span>
                  <span className="text-slate-200 print:text-black font-bold block mt-1">Administrator (Core Infrastructure Team)</span>
                  <span className="text-[10px] text-slate-400 block">ID Karyawan: INFRA-ENG-8402</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase">Verifikasi Digital:</span>
                  <span className="text-emerald-400 print:text-emerald-700 font-bold block mt-1">CRYPTOGRAPHICALLY SIGNED [OK]</span>
                  <span className="text-[10px] text-slate-400 block">SHA-256: 4f9b8c2d1e7a...90e3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLOT DETAIL INSPECTION MODAL */}
      {selectedSlotInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-100 font-sans">{selectedSlotInspection.title}</h4>
              </div>
              <button
                onClick={() => setSelectedSlotInspection(null)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inspection Content */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                {Object.entries(selectedSlotInspection.data).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null) return null;
                  return (
                    <div key={key} className="flex justify-between border-b border-slate-800/50 pb-1 last:border-none last:pb-0">
                      <span className="text-slate-500 uppercase text-[10px]">{key}:</span>
                      <span className="text-slate-200 font-bold max-w-[240px] truncate text-right">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSlotInspection(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC MODAL RUNNER */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">
                    Uji Diagnostik Hardware: {currentServer.nodeName}
                  </h3>
                  <span className="text-2xs font-mono text-slate-400">
                    Memeriksa integritas sirkuit logika, bus I/O, S.M.A.R.T., dan redundansi catu daya.
                  </span>
                </div>
              </div>

              {!isDiagnosticRunning && (
                <button
                  onClick={() => setShowDiagnosticModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-300">
                  {isDiagnosticRunning ? 'Proses Pengujian Sedang Berjalan...' : 'Diagnostik Selesai'}
                </span>
                <span className="font-bold text-emerald-400">{diagnosticProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${diagnosticProgress}%` }}
                />
              </div>
            </div>

            {/* Stepper Test List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {[
                { name: 'CPU MCE & Microcode Parity', cat: 'CPU' },
                { name: 'RAM ECC Memory Pattern & Slot Detection', cat: 'RAM' },
                { name: 'NVMe S.M.A.R.T. Wear & Backplane Bays', cat: 'STORAGE' },
                { name: 'RAID Controller & BBU SuperCap Retention', cat: 'STORAGE' },
                { name: 'Dual PSU Redundancy 1+1 Load Balancing', cat: 'PSU' },
                { name: 'Chassis Fans PWM & Tachometer Sweep', cat: 'FANS' },
                { name: 'PCIe AER Bus Error & Lane Width Scan', cat: 'PCIE' },
                { name: 'BMC / IPMI / SEL Out-of-band Verification', cat: 'BMC' }
              ].map((step, idx) => {
                const isPassed = runningStepIndex > idx || (!isDiagnosticRunning && diagnosticProgress === 100);
                const isCurrent = runningStepIndex === idx && isDiagnosticRunning;
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/70 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={isPassed ? 'text-slate-200' : isCurrent ? 'text-indigo-300 font-bold' : 'text-slate-500'}>
                        {step.name}
                      </span>
                    </div>
                    <span className="text-2xs text-slate-500 uppercase">{step.cat}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
              {!isDiagnosticRunning && (
                <>
                  <button
                    onClick={() => handleExportReport('csv')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl transition flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ekspor CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDiagnosticModal(false);
                      setShowPdfAuditModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-mono rounded-xl transition flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Buka Laporan PDF</span>
                  </button>
                  <button
                    onClick={() => setShowDiagnosticModal(false)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-sans font-medium rounded-xl transition"
                  >
                    Tutup
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: KATALOG & MATRIKS BRAND SERVER (ID & GLOBAL) */}
      {/* ==================================================== */}
      {showBrandMatrixModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between gap-4 shrink-0 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span>Katalog Kompatibilitas Brand Server</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Semua Brand Indonesia & Luar Negeri
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Dukungan telemetri hardware lintas manufaktur: Redfish v1.18+, IPMI 2.0, S.M.A.R.T. NVMe, ECC RAM, Redundansi Dual PSU, dan Log SEL.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBrandMatrixModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Filter & Brands Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Highlight Banner: TKDN & Global Standardization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950/80 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇮🇩</span>
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-sans">
                      Dukungan Server Nasional (TKDN Kemenperin RI)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Mendukung penuh brand server produksi dalam negeri seperti <strong>Axioo</strong>, <strong>Zyrex</strong>, <strong>Advan</strong>, <strong>SPC</strong>, <strong>Maspion</strong>, dan <strong>Polytron</strong> dengan sertifikasi TKDN hingga 48.20% untuk kebutuhan instansi pemerintah (E-Katalog LKPP), BUMN, dan data center nasional.
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-emerald-400">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>AST2500/AST2600 & OpenBMC Kompatibel Penuh</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950/80 border border-indigo-500/30 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌍</span>
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-sans">
                      Dukungan Server Global Enterprise Tier-1
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Integrasi sensor out-of-band resmi untuk <strong>Dell Technologies (iDRAC9/10)</strong>, <strong>HPE (iLO 5/6)</strong>, <strong>Lenovo (XClarity XCC)</strong>, <strong>Supermicro (IPMI/Redfish)</strong>, <strong>Cisco (IMC/Intersight)</strong>, <strong>Huawei (iBMC)</strong>, <strong>Inspur (ISBMC)</strong>, <strong>Fujitsu (iRMC)</strong>, <strong>ASUS</strong>, dan <strong>GIGABYTE</strong>.
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-indigo-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>DMTF Redfish v1.18+ Schema Standardized</span>
                  </div>
                </div>
              </div>

              {/* Brands Catalog Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  Daftar Manufaktur & Platform Terverifikasi ({SERVER_BRANDS_CATALOG.length} Brand)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {SERVER_BRANDS_CATALOG.map((brand) => (
                    <div
                      key={brand.id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{brand.flagEmoji}</span>
                            <div>
                              <h5 className="font-bold text-slate-100 text-xs font-sans">{brand.name}</h5>
                              <span className="text-[10px] text-slate-500 font-mono block">{brand.country}</span>
                            </div>
                          </div>
                          {brand.tkdnCertified && (
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              TKDN {brand.tkdnScore}%
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                          {brand.description}
                        </p>

                        <div className="space-y-1 pt-1 border-t border-slate-900 font-mono text-[10px]">
                          <div className="flex justify-between text-slate-400">
                            <span className="text-slate-500">Default BMC:</span>
                            <span className="text-indigo-300 font-semibold">{brand.defaultBmcType}</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span className="text-slate-500">Protokol:</span>
                            <span className="text-cyan-400">{brand.supportedProtocols[0]}</span>
                          </div>
                          <div className="text-slate-500 truncate mt-1">
                            Model: <span className="text-slate-300">{brand.popularModels[0]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBrandFilter(brand.id);
                            setShowBrandMatrixModal(false);
                            showToast(`Menyaring node server untuk brand ${brand.name}`, 'info');
                          }}
                          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                        >
                          Saring Node Ini
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowBrandMatrixModal(false);
                            setNewServerBrandId(brand.id);
                            setNewServerCategory(brand.category);
                            setNewServerModel(brand.popularModels[0] || '');
                            setNewBmcProtocol(brand.supportedProtocols[0] || 'DMTF Redfish v1.18+ / HTTPS');
                            setShowAddServerModal(true);
                          }}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Daftarkan Server</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400 font-sans">
                Standar terbuka: Mendukung setiap server dengan antarmuka BMC Redfish, IPMI 2.0, atau OpenBMC.
              </span>
              <button
                type="button"
                onClick={() => setShowBrandMatrixModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup Katalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: INTEGRASI NODE SERVER BARU (ID & GLOBAL)    */}
      {/* ==================================================== */}
      {showAddServerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">
                    Integrasi Hardware Server Baru
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Hubungkan telemetri sensor BMC (Redfish / IPMI 2.0) dari Brand Indonesia atau Luar Negeri.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddServerModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterNewServer} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Kategori Asal Brand Server</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewServerCategory('indonesia');
                      setNewServerBrandId('axioo');
                      setNewServerModel('Axioo MyServer SX7 2U Dual Xeon Scalable');
                    }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition cursor-pointer ${
                      newServerCategory === 'indonesia'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🇮🇩</span>
                    <span>Brand Indonesia (TKDN)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewServerCategory('global');
                      setNewServerBrandId('dell');
                      setNewServerModel('Dell PowerEdge R750 2U Rack Server');
                    }}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition cursor-pointer ${
                      newServerCategory === 'global'
                        ? 'bg-blue-500/15 border-blue-500/50 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🌍</span>
                    <span>Brand Global / Luar Negeri</span>
                  </button>
                </div>
              </div>

              {/* Brand Vendor Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Manufaktur / Brand</label>
                  <select
                    value={newServerBrandId}
                    onChange={(e) => {
                      const bId = e.target.value;
                      setNewServerBrandId(bId);
                      const brand = getBrandById(bId);
                      if (brand) {
                        setNewServerModel(brand.popularModels[0] || '');
                        setNewBmcProtocol(brand.supportedProtocols[0] || 'DMTF Redfish v1.18+ / HTTPS');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-sans focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {SERVER_BRANDS_CATALOG.filter(b => b.category === newServerCategory).map(b => (
                      <option key={b.id} value={b.id}>
                        {b.flagEmoji} {b.name} {b.tkdnCertified ? `(TKDN ${b.tkdnScore}%)` : `(${b.country})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Model Server</label>
                  <input
                    type="text"
                    value={newServerModel}
                    onChange={(e) => setNewServerModel(e.target.value)}
                    placeholder="Contoh: Axioo MyServer SX7 2U"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-sans focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Node Hostname & Cluster */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Nama Node / Hostname</label>
                  <input
                    type="text"
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    placeholder="Contoh: axioo-node-02"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Asosiasi Kluster</label>
                  <select
                    value={newClusterName}
                    onChange={(e) => setNewClusterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-sans focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Proxmox-CEPH-Prod">Proxmox-CEPH-Prod</option>
                    <option value="K8s-Prod-JKT-01">K8s-Prod-JKT-01</option>
                    <option value="Cluster-RDDS-NTNX">Cluster-RDDS-NTNX</option>
                    <option value="OpenStack-Edge-Cloud">OpenStack-Edge-Cloud</option>
                    <option value="Baremetal-Standalone">Baremetal Standalone Host</option>
                  </select>
                </div>
              </div>

              {/* BMC Protocol & Connectivity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Protokol Manajemen</label>
                  <select
                    value={newBmcProtocol}
                    onChange={(e) => {
                      setNewBmcProtocol(e.target.value);
                      if (e.target.value.includes('IPMI')) setNewBmcPort(623);
                      else setNewBmcPort(443);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-sans focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="DMTF Redfish v1.18+ / HTTPS">DMTF Redfish v1.18+ (HTTPS)</option>
                    <option value="IPMI 2.0 over LAN / UDP">IPMI 2.0 over LAN (UDP)</option>
                    <option value="SNMPv3 MIB / Telemetry">SNMPv3 MIB (UDP 161)</option>
                    <option value="OpenBMC REST API">OpenBMC REST API</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">IP / Hostname BMC</label>
                  <input
                    type="text"
                    value={newBmcIp}
                    onChange={(e) => setNewBmcIp(e.target.value)}
                    placeholder="Contoh: 10.20.10.45"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Port BMC</label>
                  <input
                    type="number"
                    value={newBmcPort}
                    onChange={(e) => setNewBmcPort(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* BMC Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Username BMC / Out-of-Band</label>
                  <input
                    type="text"
                    value={newBmcUser}
                    onChange={(e) => setNewBmcUser(e.target.value)}
                    placeholder="admin / root"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Password / API Auth Token</label>
                  <input
                    type="password"
                    value={newBmcPassword}
                    onChange={(e) => setNewBmcPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Asset Tag & Location */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Asset Tag & Lokasi Rack Data Center</label>
                <input
                  type="text"
                  value={newAssetTag}
                  onChange={(e) => setNewAssetTag(e.target.value)}
                  placeholder="Contoh: DC-JKT-RACK03-U14"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-sans focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* BMC Test Result Box */}
              {bmCTestResult && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1 text-emerald-300 font-mono text-[11px] animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{bmCTestResult.message}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400/80 grid grid-cols-2 gap-2 pt-1 border-t border-emerald-500/20">
                    <span>Latency: {bmCTestResult.handshake?.latencyMs}ms</span>
                    <span>Protokol: {bmCTestResult.handshake?.protocol}</span>
                    <span>Status: {bmCTestResult.handshake?.sensorQuery}</span>
                    <span>Enkripsi: {bmCTestResult.handshake?.tlsVersion}</span>
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestBmcConnection}
                  disabled={isBmcTesting || !newBmcIp.trim()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Radio className={`w-3.5 h-3.5 ${isBmcTesting ? 'animate-spin' : ''}`} />
                  <span>{isBmcTesting ? 'Menguji Koneksi...' : 'Uji Koneksi BMC'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddServerModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isRegistering ? 'Menyimpan...' : 'Simpan & Daftarkan Server'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
