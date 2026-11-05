import React, { useState, useEffect, useMemo } from 'react';
import { Anomaly, WebhookConfig, Cluster, FeatureAnalysisType } from '../types';
import { AlertTriangle, CheckCircle, Bell, Plus, ShieldAlert, Check, RefreshCw, X, Link, Mail, Sliders, Zap, Camera, Trash2, Play, Sparkles, Filter, ChevronDown, RotateCcw, Search } from 'lucide-react';

interface AlertsViewProps {
  anomalies: Anomaly[];
  webhooks: WebhookConfig[];
  onResolveAnomaly: (id: string) => void;
  onToggleWebhook: (id: string) => void;
  onAddWebhook: (name: string, url: string, events: string[]) => void;
  clusters: Cluster[];
  onOpenAiAnalysis?: (feature?: FeatureAnalysisType) => void;
}

interface AutoRule {
  id: string;
  clusterId: string;
  clusterName: string;
  severityTrigger: 'critical' | 'high_or_critical' | 'any';
  actionType: 'snapshot' | 'snapshot_and_alert';
  active: boolean;
  createdAt: string;
}

interface ActionLog {
  id: string;
  timestamp: string;
  ruleName: string;
  clusterName: string;
  anomalyDescription: string;
  actionTaken: string;
  status: 'success' | 'failed';
  details: string;
}

const DEFAULT_RULES: AutoRule[] = [
  {
    id: 'rule-1',
    clusterId: 'all',
    clusterName: 'Semua Kluster',
    severityTrigger: 'critical',
    actionType: 'snapshot',
    active: true,
    createdAt: '2026-07-01 10:00',
  },
  {
    id: 'rule-2',
    clusterId: 'all',
    clusterName: 'Semua Kluster',
    severityTrigger: 'high_or_critical',
    actionType: 'snapshot_and_alert',
    active: true,
    createdAt: '2026-07-02 14:30',
  }
];

const DEFAULT_LOGS: ActionLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-08 04:12:00',
    ruleName: 'Pemicu: Anomali Kritis',
    clusterName: 'Proxmox-VE-01',
    anomalyDescription: 'Suhu core CPU mencapai batas keselamatan tertinggi (91°C)',
    actionTaken: 'Trigger Cluster Snapshot',
    status: 'success',
    details: 'Snapshot auto-snap-pmx-main-1720447100 berhasil dibuat.'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-07 23:45:00',
    ruleName: 'Pemicu: Anomali Tinggi/Kritis',
    clusterName: 'Nutanix AHV Cluster',
    anomalyDescription: 'Volume Ceph Storage terpakai > 88%',
    actionTaken: 'Trigger Cluster Snapshot',
    status: 'success',
    details: 'Snapshot auto-snap-ntx-02-1720447200 berhasil dibuat.'
  }
];

export default function AlertsView({ anomalies, webhooks, onResolveAnomaly, onToggleWebhook, onAddWebhook, clusters, onOpenAiAnalysis }: AlertsViewProps) {
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [whName, setWhName] = useState('');
  const [whUrl, setWhUrl] = useState('');
  const [whEvents, setWhEvents] = useState<string[]>(['critical_alert']);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  // Automated Rules & Action logs states
  const [rules, setRules] = useState<AutoRule[]>(() => {
    const saved = localStorage.getItem('auto_rules');
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
  });

  const [logs, setLogs] = useState<ActionLog[]>(() => {
    const saved = localStorage.getItem('auto_action_logs');
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });

  const [showAddRule, setShowAddRule] = useState(false);
  const [ruleClusterId, setRuleClusterId] = useState('all');
  const [ruleSeverity, setRuleSeverity] = useState<'critical' | 'high_or_critical' | 'any'>('critical');
  const [ruleAction, setRuleAction] = useState<'snapshot' | 'snapshot_and_alert'>('snapshot');
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('auto_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('auto_action_logs', JSON.stringify(logs));
  }, [logs]);

  // Automatically trigger rule simulation when a new active anomaly is detected
  useEffect(() => {
    const active = anomalies.filter(a => !a.resolved);
    if (active.length === 0) return;

    const processedStr = localStorage.getItem('processed_anomaly_snapshots');
    const processedIds: string[] = processedStr ? JSON.parse(processedStr) : [];

    let hasNewTrigger = false;
    const newLogs: ActionLog[] = [];

    active.forEach(anomaly => {
      if (processedIds.includes(anomaly.id)) return;

      const matchingRules = rules.filter(rule => {
        if (!rule.active) return false;
        
        const clusterMatch = rule.clusterId === 'all' || 
          clusters.some(c => c.id === rule.clusterId && c.name === anomaly.clusterName);
        
        if (!clusterMatch) return false;

        if (rule.severityTrigger === 'any') return true;
        if (rule.severityTrigger === 'critical' && anomaly.severity === 'critical') return true;
        if (rule.severityTrigger === 'high_or_critical' && (anomaly.severity === 'critical' || anomaly.severity === 'high')) return true;

        return false;
      });

      if (matchingRules.length > 0) {
        processedIds.push(anomaly.id);
        hasNewTrigger = true;

        matchingRules.forEach(rule => {
          const snapId = `snap-auto-${Math.floor(Math.random() * 900000 + 100000)}`;
          const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

          newLogs.push({
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp,
            ruleName: rule.severityTrigger === 'critical' ? 'Pemicu: Anomali Kritis' : rule.severityTrigger === 'high_or_critical' ? 'Pemicu: Anomali Tinggi/Kritis' : 'Pemicu: Semua Anomali',
            clusterName: anomaly.clusterName,
            anomalyDescription: anomaly.description,
            actionTaken: rule.actionType === 'snapshot' ? 'Trigger Cluster Snapshot' : 'Trigger Snapshot & Webhook Alert',
            status: 'success',
            details: `Snapshot otomatis ${snapId} berhasil dibuat sebagai tindakan preventif.`
          });
        });
      }
    });

    if (hasNewTrigger) {
      localStorage.setItem('processed_anomaly_snapshots', JSON.stringify(processedIds));
      setLogs(prev => [...newLogs, ...prev]);
    }
  }, [anomalies, rules, clusters]);

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCluster = clusters.find(c => c.id === ruleClusterId);
    const clusterName = ruleClusterId === 'all' ? 'Semua Kluster' : (targetCluster?.name || 'Kluster');

    const newRule: AutoRule = {
      id: `rule-${Date.now()}`,
      clusterId: ruleClusterId,
      clusterName,
      severityTrigger: ruleSeverity,
      actionType: ruleAction,
      active: true,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setRules(prev => [newRule, ...prev]);
    setShowAddRule(false);
  };

  const handleTestRule = (rule: AutoRule) => {
    setTestingRuleId(rule.id);
    setTimeout(() => {
      let targetClusterName = rule.clusterName;
      if (rule.clusterId === 'all') {
        const randomCluster = clusters[Math.floor(Math.random() * clusters.length)];
        targetClusterName = randomCluster ? randomCluster.name : 'Proxmox-VE-01';
      }

      const snapId = `snap-auto-${Math.floor(Math.random() * 900000 + 100000)}`;
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const newLog: ActionLog = {
        id: `log-${Date.now()}`,
        timestamp,
        ruleName: rule.severityTrigger === 'critical' ? 'Pemicu: Anomali Kritis' : rule.severityTrigger === 'high_or_critical' ? 'Pemicu: Anomali Tinggi/Kritis' : 'Pemicu: Semua Anomali',
        clusterName: targetClusterName,
        anomalyDescription: 'Simulasi pengujian aturan otomatis oleh pengguna.',
        actionTaken: rule.actionType === 'snapshot' ? 'Trigger Cluster Snapshot' : 'Trigger Snapshot & Webhook Alert',
        status: 'success',
        details: `Snapshot ${snapId} berhasil dibuat. Konfigurasi penyimpanan disinkronkan.`
      };

      setLogs(prev => [newLog, ...prev]);
      setTestingRuleId(null);
    }, 1200);
  };

  // Filter states
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all available clusters from clusters prop and anomalies
  const availableClusters = useMemo(() => {
    const map = new Map<string, string>();
    clusters.forEach(c => map.set(c.id, c.name));
    anomalies.forEach(a => {
      if (a.clusterId && !map.has(a.clusterId)) {
        map.set(a.clusterId, a.clusterName || a.clusterId);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [clusters, anomalies]);

  // Filter anomalies based on severity, cluster, and optional search query
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(a => {
      // 1. Severity filter
      if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) {
        return false;
      }

      // 2. Cluster filter (matches clusterId or clusterName)
      if (selectedCluster !== 'ALL') {
        const matchId = a.clusterId === selectedCluster;
        const matchName = a.clusterName === selectedCluster;
        const targetCluster = clusters.find(c => c.id === selectedCluster);
        const matchByTargetObj = targetCluster ? a.clusterName === targetCluster.name : false;
        if (!matchId && !matchName && !matchByTargetObj) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = a.description?.toLowerCase().includes(q);
        const matchType = a.type?.toLowerCase().includes(q);
        const matchCluster = a.clusterName?.toLowerCase().includes(q);
        const matchRec = a.recommendation?.toLowerCase().includes(q);
        if (!matchDesc && !matchType && !matchCluster && !matchRec) {
          return false;
        }
      }

      return true;
    });
  }, [anomalies, selectedSeverity, selectedCluster, searchQuery, clusters]);

  const activeAnomalies = useMemo(() => filteredAnomalies.filter(a => !a.resolved), [filteredAnomalies]);
  const resolvedAnomalies = useMemo(() => filteredAnomalies.filter(a => a.resolved), [filteredAnomalies]);

  const totalRawActive = useMemo(() => anomalies.filter(a => !a.resolved).length, [anomalies]);
  const totalRawResolved = useMemo(() => anomalies.filter(a => a.resolved).length, [anomalies]);

  const hasActiveFilters = selectedSeverity !== 'ALL' || selectedCluster !== 'ALL' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedSeverity('ALL');
    setSelectedCluster('ALL');
    setSearchQuery('');
  };

  const handleAddWebhookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whUrl) return;
    onAddWebhook(whName, whUrl, whEvents);
    setWhName('');
    setWhUrl('');
    setShowAddWebhook(false);
  };

  const handleTestWebhook = (id: string) => {
    setTestingId(id);
    setTestSuccessMessage(null);
    setTimeout(() => {
      setTestingId(null);
      setTestSuccessMessage('Koneksi Webhook Berhasil Teruji! Payload uji sukses dikirim ke endpoint.');
      setTimeout(() => setTestSuccessMessage(null), 4000);
    }, 1000);
  };

  const toggleEvent = (event: string) => {
    setWhEvents(prev => 
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
            Manajemen Anomali & Notifikasi
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Lacak anomali aktif, tangani insiden, dan integrasikan peringatan langsung ke Slack atau webhook operasional lainnya.
          </p>
        </div>

        {onOpenAiAnalysis && (
          <button
            onClick={() => onOpenAiAnalysis('alerts')}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer self-start sm:self-auto group shrink-0"
            title="Audit & Analisis AI Korelasi Insiden & MTTR"
          >
            <Sparkles className="w-4 h-4 text-rose-200 group-hover:scale-110 transition-transform animate-pulse" />
            <span>Analisis AI Insiden</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active & Resolved Anomalies */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dropdown Filters Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span>Filter & Penyaringan Anomali</span>
                    {hasActiveFilters && (
                      <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Filter Aktif
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Saring insiden berdasarkan tingkat keparahan, kluster spesifik, atau kata kunci.
                  </p>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 px-2.5 py-1.5 rounded-lg transition-all font-medium cursor-pointer self-start sm:self-auto shrink-0"
                  title="Kembalikan semua filter ke kondisi awal"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Dropdown 1: Severity */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Tingkat Keparahan (Severity)</span>
                  {selectedSeverity !== 'ALL' && (
                    <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wide">Aktif</span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none pr-9 hover:border-slate-700"
                  >
                    <option value="ALL">Semua Tingkat Keparahan ({anomalies.length})</option>
                    <option value="critical">🔴 Kritis (Critical) — {anomalies.filter(a => a.severity === 'critical').length}</option>
                    <option value="high">🟠 Tinggi (High) — {anomalies.filter(a => a.severity === 'high').length}</option>
                    <option value="medium">🟡 Sedang (Medium) — {anomalies.filter(a => a.severity === 'medium').length}</option>
                    <option value="low">🔵 Rendah (Low) — {anomalies.filter(a => a.severity === 'low').length}</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Dropdown 2: Specific Cluster */}
              <div className="lg:col-span-4 space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Kluster Spesifik</span>
                  {selectedCluster !== 'ALL' && (
                    <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wide">Aktif</span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={selectedCluster}
                    onChange={(e) => setSelectedCluster(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none pr-9 hover:border-slate-700"
                  >
                    <option value="ALL">Semua Kluster Terintegrasi ({availableClusters.length} Kluster)</option>
                    {availableClusters.map(c => {
                      const count = anomalies.filter(a => a.clusterId === c.id || a.clusterName === c.name).length;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} {count > 0 ? `(${count} insiden)` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Quick Search */}
              <div className="sm:col-span-2 lg:col-span-4 space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Cari Anomali / Tipe
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik kata kunci insiden..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-8 py-2.5 text-xs text-slate-200 font-sans placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors hover:border-slate-700"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Filter Badges and Status Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 text-[11px] text-slate-400 gap-2 border-t border-slate-800/40">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500">Hasil:</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {activeAnomalies.length} aktif
                </span>
                <span className="text-slate-600">|</span>
                <span className="font-semibold text-slate-400 font-mono">
                  {resolvedAnomalies.length} terselesaikan
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-500">Total {anomalies.length} anomali</span>
                {hasActiveFilters && (
                  <span className="text-indigo-400 text-[10px] italic">
                    (disaring dari {totalRawActive} aktif, {totalRawResolved} selesai)
                  </span>
                )}
              </div>

              {/* 1-click Quick Severity Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 mr-1">Pintasan:</span>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    selectedSeverity === 'ALL'
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity(selectedSeverity === 'critical' ? 'ALL' : 'critical')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    selectedSeverity === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                      : 'text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Kritis
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity(selectedSeverity === 'high' ? 'ALL' : 'high')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    selectedSeverity === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                      : 'text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Tinggi
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeverity(selectedSeverity === 'medium' ? 'ALL' : 'medium')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    selectedSeverity === 'medium'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-blue-400 hover:bg-blue-500/10'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Sedang
                </button>
              </div>
            </div>
          </div>

          {/* Active Anomalies List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-100 font-sans">
                  Anomali Aktif ({activeAnomalies.length}{hasActiveFilters ? ` / ${totalRawActive}` : ''})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Real-time Detection</span>
            </div>

            {activeAnomalies.length > 0 ? (
              <div className="space-y-3">
                {activeAnomalies.map((a) => (
                  <div key={a.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-slate-200 text-xs">{a.clusterName}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase ${
                            a.severity === 'critical'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                              : a.severity === 'high'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                                : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                          }`}>
                            {a.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{a.detectedAt}</span>
                        </div>
                        <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                          {a.description}
                        </p>
                      </div>

                      <button
                        onClick={() => onResolveAnomaly(a.id)}
                        className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Selesaikan</span>
                      </button>
                    </div>

                    {/* Recommendation box */}
                    <div className="bg-slate-900/60 border-l-2 border-indigo-500 p-2.5 rounded-r-lg text-[11px] text-indigo-300 font-sans leading-relaxed">
                      <strong>AI Resolusi Rekomendasi:</strong> {a.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            ) : hasActiveFilters ? (
              <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Filter className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-slate-200 text-xs font-bold">Tidak ada anomali aktif yang cocok dengan kriteria filter</h4>
                  <p className="text-slate-400 text-[11px] mt-1 max-w-sm mx-auto">
                    Kriteria filter saat ini tidak menghasilkan anomali aktif. Coba ubah tingkat keparahan, kluster, atau kata kunci pencarian.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2.5" />
                <span>Hebat! Tidak ada anomali terdeteksi saat ini. Infrastruktur Anda stabil.</span>
              </div>
            )}
          </div>

          {/* Automated Actions Rules Engine */}
          <div id="automated-actions-section" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">Aksi Otomatis (Rules Engine)</h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">Memicu snapshot kluster preventif berdasarkan kondisi kustom.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddRule(!showAddRule)}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/25 transition-all"
              >
                {showAddRule ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{showAddRule ? 'Batal' : 'Tambah Aturan'}</span>
              </button>
            </div>

            {/* Collapsible Add Rule Form */}
            {showAddRule && (
              <form onSubmit={handleAddRuleSubmit} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 text-xs">
                <h4 className="font-bold text-slate-200">Konfigurasi Aturan If-Then Baru</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Jika Terjadi Pada Kluster</label>
                    <select
                      value={ruleClusterId}
                      onChange={(e) => setRuleClusterId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">Semua Kluster (All Clusters)</option>
                      {clusters.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Tingkat Keparahan Anomali (IF)</label>
                    <select
                      value={ruleSeverity}
                      onChange={(e) => setRuleSeverity(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="critical">Kritis Saja (Critical only)</option>
                      <option value="high_or_critical">Tinggi & Kritis (High & Critical)</option>
                      <option value="any">Setiap Anomali (Any Anomaly)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Tindakan Otomatis (THEN)</label>
                    <select
                      value={ruleAction}
                      onChange={(e) => setRuleAction(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="snapshot">Ambil Snapshot Kluster (Take Snapshot)</option>
                      <option value="snapshot_and_alert">Snapshot & Kirim Alert Webhook</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-900/60">
                  <button
                    type="button"
                    onClick={() => setShowAddRule(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aktifkan Aturan</span>
                  </button>
                </div>
              </form>
            )}

            {/* Rules Cards List */}
            <div className="space-y-2.5">
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <div key={rule.id} className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-xs font-sans">
                          IF: {rule.severityTrigger === 'critical' ? 'Anomali Kritis' : rule.severityTrigger === 'high_or_critical' ? 'Anomali Tinggi/Kritis' : 'Semua Anomali'}
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-xs text-indigo-400 font-mono font-medium">{rule.clusterName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>THEN: {rule.actionType === 'snapshot' ? 'Buat Snapshot Kluster Preventif' : 'Buat Snapshot & Kirim Peringatan Webhook'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      {/* Active/Inactive Toggle */}
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          rule.active ? 'bg-indigo-600' : 'bg-slate-800'
                        }`}
                        title={rule.active ? 'Aturan Aktif' : 'Aturan Nonaktif'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            rule.active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      {/* Manual Trigger Test Button */}
                      <button
                        onClick={() => handleTestRule(rule)}
                        disabled={testingRuleId === rule.id}
                        title="Simulasikan Aturan"
                        className="bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/25 text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                      >
                        {testingRuleId === rule.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        <span>{testingRuleId === rule.id ? 'Menguji...' : 'Uji'}</span>
                      </button>

                      {/* Delete Rule */}
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-all"
                        title="Hapus Aturan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Tidak ada aturan kustom aktif saat ini. Buat aturan baru untuk otomatisasi penanganan insiden.
                </div>
              )}
            </div>

            {/* Execution History Panel */}
            <div className="border-t border-slate-800/80 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Log Eksekusi Snapshot Otomatis</h4>
                <span className="text-[10px] font-mono text-slate-500">Auto-Snapshot Engine Active</span>
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-300">{log.clusterName}</span>
                        <span className="text-slate-600 text-[10px]">|</span>
                        <span className="text-[10px] text-indigo-400 font-mono">{log.ruleName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono tracking-wider">
                          {log.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                    {log.anomalyDescription && (
                      <p className="text-[10px] text-slate-500 italic">
                        Kondisi: "{log.anomalyDescription}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resolved History */}
          {resolvedAnomalies.length > 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Riwayat Kejadian Terselesaikan ({resolvedAnomalies.length}{hasActiveFilters ? ` / ${totalRawResolved}` : ''})
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">Resolved Archive</span>
              </div>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {resolvedAnomalies.map((a) => (
                  <div key={a.id} className="bg-slate-950/60 border border-slate-800/40 rounded-xl p-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">{a.clusterName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                          a.severity === 'critical'
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                            : a.severity === 'high'
                              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                              : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                        }`}>
                          {a.severity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{a.detectedAt}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 leading-relaxed line-clamp-1">{a.description}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ) : hasActiveFilters && totalRawResolved > 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 text-center text-slate-500 text-xs">
              <span>Tidak ada riwayat kejadian terselesaikan yang cocok dengan filter aktif saat ini.</span>
            </div>
          ) : null}
        </div>

        {/* Right Column: Webhooks & Alarm Trigger Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Webhook Integrations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 font-sans">Notifikasi Webhook</h3>
              </div>
              <button
                onClick={() => setShowAddWebhook(true)}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {testSuccessMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-[11px] leading-relaxed flex items-start gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5 animate-pulse" />
                  <span>{testSuccessMessage}</span>
                </div>
              )}

              {webhooks.map((w) => (
                <div key={w.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{w.name}</h4>
                      <span className="text-[9px] font-mono text-slate-500 block mt-1 overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">
                        {w.url}
                      </span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => onToggleWebhook(w.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        w.active ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          w.active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Webhook actions */}
                  <div className="flex items-center justify-between border-t border-slate-900/80 pt-2.5 text-[10px]">
                    <span className="text-slate-500 font-mono">
                      Event: {w.events.length} Terpilih
                    </span>
                    <button
                      onClick={() => handleTestWebhook(w.id)}
                      disabled={testingId === w.id}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      {testingId === w.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Link className="w-3 h-3" />}
                      <span>{testingId === w.id ? 'Menguji...' : 'Uji Kirim'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alarm Config Presets */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100 font-sans">Batas Ambang Alert</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Pemicu insiden otomatis berdasarkan aturan margin keselamatan global.
            </p>

            <div className="space-y-3.5 text-xs font-sans text-slate-300">
              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40">
                <span className="font-medium">Peringatan Penyimpanan / Ceph</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded font-bold text-amber-400">85%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40">
                <span className="font-medium">Kritis Penyimpanan / Ceph</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded font-bold text-rose-500">90%</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40">
                <span className="font-medium">Ambang Puncak CPU Node</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded font-bold text-rose-500">95%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Webhook Form overlay */}
      {showAddWebhook && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddWebhook(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-1.5 font-sans">Tambah Integrasi Webhook</h3>
            <p className="text-slate-400 text-xs mb-4">
              Kirim data notifikasi anomali secara real-time ke Slack, Microsoft Teams, atau custom handler API.
            </p>

            <form onSubmit={handleAddWebhookSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Nama Webhook</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Slack Production Alerts"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Payload URL (HTTPS)</label>
                <input
                  type="url"
                  required
                  placeholder="https://hooks.slack.com/services/..."
                  value={whUrl}
                  onChange={(e) => setWhUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Event Terkait</label>
                <div className="space-y-2">
                  {[
                    { id: 'critical_alert', label: 'Critical Threshold Breach' },
                    { id: 'anomaly_detected', label: 'New Anomaly Detected' },
                    { id: 'node_offline', label: 'Hypervisor Node Offline' },
                    { id: 'storage_exhaustion', label: 'AI Storage Capacity Warn (<15 days)' }
                  ].map((evt) => (
                    <label key={evt.id} className="flex items-center gap-2.5 text-slate-400 hover:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whEvents.includes(evt.id)}
                        onChange={() => toggleEvent(evt.id)}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                      />
                      <span>{evt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddWebhook(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/15"
                >
                  Tambah Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
