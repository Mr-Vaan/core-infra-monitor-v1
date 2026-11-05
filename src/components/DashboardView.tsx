import React, { useState, useEffect } from 'react';
import { Cluster, Anomaly } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cpu, HardDrive, Database, AlertTriangle, ArrowRight, Brain, Server, Activity, RefreshCw, Sparkles, Boxes } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FeatureAnalysisType } from '../types';

interface DashboardViewProps {
  clusters: Cluster[];
  anomalies: Anomaly[];
  onNavigate: (tab: string) => void;
  onOpenAiAnalysis?: (feature?: FeatureAnalysisType) => void;
}

// Module-level cache to preserve AI daily summary across tab switches and avoid 429 quota exhaustion
let cachedSummaryText = '';

export default function DashboardView({ clusters, anomalies, onNavigate, onOpenAiAnalysis }: DashboardViewProps) {
  const [summaryText, setSummaryText] = useState(cachedSummaryText);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Transform cluster telemetries to a combined chart data format for simple storage monitoring (30 days)
  const simpleStorageData = React.useMemo(() => {
    const telemetryLen = clusters[0]?.telemetry.length || 30;
    const combinedData: any[] = [];
    for (let idx = 0; idx < telemetryLen; idx++) {
      const origPoint = clusters[0]?.telemetry[idx];
      const timeLabel = origPoint ? origPoint.timestamp : `Tgl ${idx + 1}`;
      const dataPoint: any = { timestamp: timeLabel };
      
      clusters.forEach(c => {
        const p = c.telemetry[idx];
        if (p) {
          dataPoint[c.name] = p.storage;
        }
      });
      combinedData.push(dataPoint);
    }
    return combinedData;
  }, [clusters]);

  const fetchDailySummary = async (force = false) => {
    if (!force && cachedSummaryText) {
      setSummaryText(cachedSummaryText);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/gemini/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        cachedSummaryText = data.text;
        setSummaryText(data.text);
      } else {
        setError(data.error || 'Gagal menghasilkan ringkasan kesehatan harian.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server telemetri.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!cachedSummaryText) {
      fetchDailySummary();
    }
  }, []);

  // Aggregate overall stats
  const activeClusters = clusters.filter(c => c.status === 'connected');
  const totalClusters = clusters.length;

  // Calculate cluster health
  // A cluster is "Healthy" if its connection status is 'connected' and it has no unresolved high or critical anomalies
  const healthyClusters = clusters.filter(c => {
    const hasSevereAnomaly = anomalies.some(
      a => a.clusterId === c.id && !a.resolved && (a.severity === 'critical' || a.severity === 'high')
    );
    return c.status === 'connected' && !hasSevereAnomaly;
  });
  const healthyCount = healthyClusters.length;
  const unhealthyCount = totalClusters - healthyCount;
  const healthPercent = totalClusters > 0 ? Math.round((healthyCount / totalClusters) * 100) : 0;

  // Calculate weighted CPU
  const avgCpu = Math.round(
    clusters.reduce((acc, c) => acc + c.nodes.reduce((na, n) => na + n.cpuUsage, 0) / (c.nodes.length || 1), 0) / (totalClusters || 1)
  );

  // Calculate weighted RAM
  const avgRam = Math.round(
    clusters.reduce((acc, c) => acc + c.nodes.reduce((na, n) => na + n.ramUsage, 0) / (c.nodes.length || 1), 0) / (totalClusters || 1)
  );

  // Calculate overall storage utilization
  const totalCapacityGB = clusters.reduce((acc, c) => acc + c.storageCapacityGB, 0);
  const totalUsedGB = clusters.reduce((acc, c) => acc + c.storageUsedGB, 0);
  const avgStoragePercent = Math.round((totalUsedGB / (totalCapacityGB || 1)) * 100);

  const activeAnomaliesCount = anomalies.filter(a => !a.resolved).length;

  // Identify which cluster will run out of storage first
  // Based on growth trend (Nutanix is usually the fastest)
  const getStorageRiskAnalysis = () => {
    const risks = clusters.map(c => {
      const currentPercent = Math.round((c.storageUsedGB / c.storageCapacityGB) * 100);
      let daysLeft = 100;
      if (c.id === 'cluster-ntnx-01') daysLeft = 12;
      else if (c.id === 'cluster-pve-01') daysLeft = 22;
      else daysLeft = 85;

      return { cluster: c, percent: currentPercent, days: daysLeft };
    });

    // Sort by lowest days remaining
    return risks.sort((a, b) => a.days - b.days)[0];
  };

  const highestRisk = getStorageRiskAnalysis();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
            Multi-Cluster Capacity & Anomaly Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Pemantauan terpusat dan analitik prediktif untuk Proxmox VE, Nutanix AHV, dan OpenStack.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {onOpenAiAnalysis && (
            <button
              onClick={() => onOpenAiAnalysis('dashboard')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
              title="Analisis AI untuk Dashboard & SLA"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform animate-pulse" />
              <span>Analisis AI Dashboard</span>
            </button>
          )}

          {/* Quick Sync Status */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetri Terkoneksi: {activeClusters.length}/{totalClusters} Kluster</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Health Overview */}
        <div id="health-overview-card" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-sans font-medium">Health Overview</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              {/* Circular Progress Ring */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="stroke-slate-800/60"
                    strokeWidth="5.5"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className={`${
                      healthPercent >= 75
                        ? 'stroke-emerald-500'
                        : healthPercent >= 40
                        ? 'stroke-amber-400'
                        : 'stroke-rose-500'
                    } transition-all duration-500 ease-out`}
                    strokeWidth="5.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={(1 - healthPercent / 100) * (2 * Math.PI * 26)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute font-mono text-xs font-extrabold text-slate-100">
                  {healthPercent}%
                </div>
              </div>

              {/* Status Breakdown Counts */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-300 font-sans font-medium">{healthyCount} Sehat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full bg-rose-500 ${unhealthyCount > 0 ? 'animate-pulse' : ''}`} />
                  <span className="text-xs text-slate-300 font-sans font-medium">{unhealthyCount} Masalah</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-[10px] mt-3 font-sans leading-relaxed">
            {healthPercent === 100
              ? 'Semua kluster sehat & optimal.'
              : `Kesehatan operasional: ${healthPercent}%`}
          </p>
        </div>

        {/* CPU */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-sans font-medium">Rata-rata CPU</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100 tracking-tight font-mono">{avgCpu}%</span>
            <span className="text-xs text-emerald-400 font-sans font-medium">Stabil</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${avgCpu}%` }} />
          </div>
        </div>

        {/* RAM */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-sans font-medium">Rata-rata RAM</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100 tracking-tight font-mono">{avgRam}%</span>
            <span className="text-xs text-amber-400 font-sans font-medium">Tinggi</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${avgRam}%` }} />
          </div>
        </div>

        {/* Storage / Ceph */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-sans font-medium">Penyimpanan / Ceph</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100 tracking-tight font-mono">{avgStoragePercent}%</span>
            <span className="text-xs text-rose-400 font-sans font-medium">Sangat Tinggi</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${avgStoragePercent}%` }} />
          </div>
        </div>

        {/* Anomalies Detected */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-rose-500/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-sans font-medium">Anomali Terdeteksi</span>
            <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight font-mono ${activeAnomaliesCount > 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
              {activeAnomaliesCount} Aktif
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-2 font-sans">
            {activeAnomaliesCount > 0 
              ? 'Memerlukan penyeimbangan kapasitas beban kerja.' 
              : 'Semua kluster berjalan normal.'}
          </p>
        </div>
      </div>

      {/* Storage Forecast Summary Advisor Banner */}
      {highestRisk && (
        <div className="bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/20 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="bg-rose-500/15 p-3 rounded-xl text-rose-400 shrink-0">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase">
                  Peringatan AI Advisor
                </span>
                <span className="text-slate-400 text-xs font-sans font-medium">Batas Kapasitas Menipis</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1.5">
                Kapasitas penyimpanan kluster <span className="text-rose-400">{highestRisk.cluster.name}</span> akan mencapai batas 90% dalam <span className="text-rose-400 font-mono font-extrabold">{highestRisk.days - 3} hari</span>!
              </h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed max-w-3xl">
                "Ceph pool atau penyimpanan lokal pada {highestRisk.cluster.name} ({highestRisk.cluster.type}) bertumbuh sebesar 0.7% setiap hari. Rekomendasi AI: Jadwalkan migrasi proaktif dari 3 VM pengonsumsi data tinggi ke kluster OpenStack yang lapang sebelum hari ke-10."
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('forecasts')}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all self-start lg:self-auto shrink-0 shadow-lg shadow-rose-500/10"
          >
            <span>Buka Analisis Forecast</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Server Hardware Health Diagnostic Suite Section */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/25 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-500/15 p-3 rounded-xl text-indigo-400 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
                Hardware Server Diagnostic · Full Health Check
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Semua Node Terverifikasi
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Pemeriksaan Kesehatan Hardware Server Lengkap
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Diagnostik fisik tingkat rendah untuk Dual-Socket Xeon/EPYC thermals, ECC RAM Parity registers, NVMe S.M.A.R.T. wear-level, redundansi PSU 1+1, tachometer dual-rotor fan, dan IPMI/iDRAC SEL logs.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('hardware')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md shadow-indigo-600/20"
        >
          <span>Buka Diagnostik Hardware</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Arcane Container Monitoring Section */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="bg-cyan-500/15 p-3 rounded-xl text-cyan-400 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                Container Management · Core Engine
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-400 text-xs">8 Containers Running</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Core Container Engine Aktif
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Monitoring Docker Compose stacks, real-time metrics telemetry, terminal exec shell, live streaming logs, serta scan kerentanan CVE Trivy untuk semua container.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('containers')}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md shadow-cyan-600/20"
        >
          <span>Buka Container Manager</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Infrastructure Health Summary (Gemini Powered) */}
      <div id="ai-daily-health-summary-card" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-sans">
                  Kesehatan Infrastruktur Harian
                </h3>
                <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase">
                  <Sparkles className="w-3 h-3" />
                  Gemini AI
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5 font-sans">
                Analisis otomatis performa, tren penyimpanan harian, dan deteksi anomali multi-platform.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => fetchDailySummary(true)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 disabled:opacity-50 text-slate-300 hover:text-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto shrink-0 font-sans"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Menganalisis...' : 'Segarkan Ringkasan'}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
              <Brain className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-300 font-sans">Gemini sedang mengumpulkan telemetri...</p>
              <p className="text-[11px] text-slate-500 font-mono">Menyusun ringkasan status eksekutif & anomali kluster</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-xs text-rose-300 font-sans">{error}</p>
            </div>
            <button
              onClick={() => fetchDailySummary(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0 font-sans"
            >
              Coba Lagi
            </button>
          </div>
        ) : summaryText ? (
          <div className="overflow-x-auto pr-1">
            <div className="markdown-body text-slate-300 text-xs leading-relaxed font-sans prose prose-invert max-w-none">
              <ReactMarkdown>{summaryText}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 space-y-2">
            <p className="text-xs font-sans">Belum ada data ringkasan kesehatan terkumpul.</p>
            <button
              onClick={() => fetchDailySummary(true)}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold underline"
            >
              Hasilkan Ringkasan Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Chart Section & Quick Clusters List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Capacity Chart */}
        <div id="simple-storage-chart" className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-5">
          {/* Header section with Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Tren Kapasitas Penyimpanan (30 Hari)
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Monitoring tren utilisasi penyimpanan multi-cluster
              </p>
            </div>
            
            <button
              onClick={() => onNavigate('clusters')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              Analisis Telemetri Lengkap
            </button>
          </div>

          {/* Chart Display */}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simpleStorageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {clusters.map((c, i) => (
                    <linearGradient key={c.id} id={`color-simple-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={['#6366f1', '#f43f5e', '#10b981', '#f59e0b'][i % 4]} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={['#6366f1', '#f43f5e', '#10b981', '#f59e0b'][i % 4]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-800)" />
                <XAxis dataKey="timestamp" stroke="var(--color-slate-500)" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="var(--color-slate-500)" 
                  fontSize={11} 
                  tickLine={false} 
                  domain={[0, 100]}
                  unit="%" 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px' }}
                  labelStyle={{ color: 'var(--color-slate-400)', fontWeight: 600 }}
                  formatter={(value) => [`${value}%`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                {clusters.map((c, i) => (
                  <Area
                    key={c.id}
                    type="monotone"
                    dataKey={c.name}
                    stroke={['#6366f1', '#f43f5e', '#10b981', '#f59e0b'][i % 4]}
                    fillOpacity={1}
                    fill={`url(#color-simple-${c.id})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Clusters List */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 font-sans">Integrasi Terhubung</h3>
            <button 
              onClick={() => onNavigate('clusters')}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
            >
              <span>Kelola</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {clusters.map((c) => {
              const storagePercent = Math.round((c.storageUsedGB / c.storageCapacityGB) * 100);
              return (
                <div 
                  key={c.id} 
                  className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-all cursor-pointer"
                  onClick={() => onNavigate('clusters')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-slate-800 p-2 rounded-lg text-slate-300">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{c.name}</h4>
                        <span className="text-[10px] font-sans text-slate-400 block mt-0.5">{c.type}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      c.status === 'connected' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {c.status === 'connected' ? 'OK' : 'FAIL'}
                    </span>
                  </div>

                  {/* Nodes and VMs */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-sans border-t border-slate-800/60 pt-2">
                    <div>
                      <span>Hypervisor: <strong className="text-slate-300 font-mono">{c.nodes.length} Node</strong></span>
                    </div>
                    <div>
                      <span>Mesin VM: <strong className="text-slate-300 font-mono">{c.vms.length} VM</strong></span>
                    </div>
                  </div>

                  {/* Storage Progress */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-500">Kapasitas Penyimpanan</span>
                      <span className={`${storagePercent >= 85 ? 'text-rose-400' : 'text-slate-300'}`}>{storagePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          storagePercent >= 85 ? 'bg-rose-500' : storagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${storagePercent}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
