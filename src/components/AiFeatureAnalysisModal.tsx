import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Terminal,
  Activity,
  Server,
  Boxes,
  Cpu,
  Network,
  Brain,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Send,
  Zap,
  Printer,
  Layers
} from 'lucide-react';
import { FeatureAnalysisType, FeatureAiAnalysisResult } from '../types';

interface AiFeatureAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFeature: FeatureAnalysisType;
  onNavigateToTab?: (tab: string) => void;
}

const FEATURE_METADATA: Record<FeatureAnalysisType, { label: string; icon: any; color: string; desc: string }> = {
  dashboard: {
    label: 'Dashboard Global',
    icon: Activity,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    desc: 'Audit SLA, kesehatan lintas kluster, & anomali'
  },
  clusters: {
    label: 'Kluster Virtualisasi',
    icon: Server,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    desc: 'Keseimbangan VM, DRS, & failover N+1'
  },
  kubernetes: {
    label: 'Kubernetes K8s',
    icon: Layers,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    desc: 'Pods CrashLoop, Control Plane HA, & Node pressure'
  },
  hardware: {
    label: 'Hardware Health',
    icon: Cpu,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    desc: 'Slot RAM DIMM, Drive Bays, PSU & BMC'
  },
  containers: {
    label: 'Containers & Pods',
    icon: Boxes,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    desc: 'Keamanan CVE, cgroups limit, & daemon'
  },
  topology: {
    label: 'Topologi Mesh',
    icon: Network,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    desc: 'Interkoneksi jaringan, latensi, & SPOF'
  },
  forecasts: {
    label: 'Forecast Kapasitas',
    icon: Brain,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    desc: 'Runway storage & timeline pengadaan'
  },
  alerts: {
    label: 'Alerts & Insiden',
    icon: AlertTriangle,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    desc: 'Korelasi akar masalah & mitigasi MTTR'
  }
};

export const AiFeatureAnalysisModal: React.FC<AiFeatureAnalysisModalProps> = ({
  isOpen,
  onClose,
  initialFeature,
  onNavigateToTab
}) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureAnalysisType>(initialFeature);
  const [analysis, setAnalysis] = useState<FeatureAiAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedCmdIndex, setCopiedCmdIndex] = useState<number | null>(null);
  
  // Follow-up Q&A prompt state
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState<{ q: string; a: string; time: string }[]>([]);
  const [askingFollowUp, setAskingFollowUp] = useState(false);

  // Synchronize initialFeature when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedFeature(initialFeature);
      fetchAnalysis(initialFeature);
      setFollowUpHistory([]);
      setFollowUpQuestion('');
    }
  }, [isOpen, initialFeature]);

  const fetchAnalysis = async (feat: FeatureAnalysisType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/analyze-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: feat })
      });
      if (!response.ok) {
        throw new Error('Gagal mendapatkan respon analisis dari server AI.');
      }
      const data: FeatureAiAnalysisResult = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses analisis.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFeature = (feat: FeatureAnalysisType) => {
    setSelectedFeature(feat);
    fetchAnalysis(feat);
    setFollowUpHistory([]);
  };

  const handleCopyMarkdown = () => {
    if (!analysis) return;
    const md = `
# 🤖 Analisis AI Infrastruktur: ${analysis.title}
*Subjudul:* ${analysis.subtitle}
*Kesehatan Skor:* ${analysis.healthScore}/100 | *Tingkat Risiko:* ${analysis.riskLevel}
*Waktu Analisis:* ${new Date(analysis.generatedAt).toLocaleString('id-ID')}
*Engine:* ${analysis.source}

## 📋 Ringkasan Eksekutif
${analysis.summary}

## 🔍 Temuan Kunci (Key Findings)
${analysis.keyFindings.map(f => `- ${f}`).join('\n')}

## 🔬 Analisis Mendalam Sub-sistem
${analysis.deepDive.map(d => `### [${d.status.toUpperCase()}] ${d.category}\n${d.details}`).join('\n\n')}

## ⚠️ Potensi Risiko Operasional
${analysis.risksAndImpact.map(r => `- ${r}`).join('\n')}

## 🎯 Rekomendasi Tindakan Prioritas
${analysis.recommendations.map(rec => `### [${rec.priority}] ${rec.title}\n- **Aksi:** ${rec.action}\n- **Dampak:** ${rec.impact}`).join('\n\n')}

## 💻 Perintah Remedi CLI
\`\`\`bash
${analysis.remediationCommands.join('\n')}
\`\`\`
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmdIndex(idx);
    setTimeout(() => setCopiedCmdIndex(null), 1500);
  };

  const handleAskFollowUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!followUpQuestion.trim() || askingFollowUp) return;

    const q = followUpQuestion.trim();
    setFollowUpQuestion('');
    setAskingFollowUp(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Sebagai arsitektur sistem, berikan jawaban spesifik dan tajam untuk pertanyaan ini mengenai fitur ${selectedFeature.toUpperCase()} (Konteks analisis saat ini: skor ${analysis?.healthScore}/100, ringkasan: "${analysis?.summary}"): "${q}"`,
          chatHistory: []
        })
      });
      const data = await response.json();
      setFollowUpHistory(prev => [
        ...prev,
        {
          q,
          a: data.text || 'Tidak dapat memproses jawaban saat ini.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setFollowUpHistory(prev => [
        ...prev,
        {
          q,
          a: 'Gagal menghubungi asisten AI. Periksa koneksi backend.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAskingFollowUp(false);
    }
  };

  if (!isOpen) return null;

  const currentMeta = FEATURE_METADATA[selectedFeature];
  const IconComponent = currentMeta.icon;

  const getScoreColor = (score: number) => {
    if (score >= 88) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 75) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  Analisis AI Cerdas Multidimensi
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/25">
                  Gemini 3.8 Flash Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit otomatis performa, kesehatan komponen fisik, keamanan, dan rekomendasi operasional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAnalysis(selectedFeature)}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="Analisis Ulang Fitur Ini"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <button
              onClick={handleCopyMarkdown}
              disabled={!analysis}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Salin Laporan Lengkap (Markdown)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Tersalin!' : 'Salin Laporan'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feature Switcher Ribbon */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-2.5 shrink-0 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mr-1 shrink-0">
            Pilih Fitur:
          </span>
          {(Object.keys(FEATURE_METADATA) as FeatureAnalysisType[]).map((featKey) => {
            const meta = FEATURE_METADATA[featKey];
            const FeatIcon = meta.icon;
            const isSelected = selectedFeature === featKey;
            return (
              <button
                key={featKey}
                onClick={() => handleSelectFeature(featKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 font-semibold'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <FeatIcon className="w-3.5 h-3.5" />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold block">Gagal Melakukan Analisis</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => fetchAnalysis(selectedFeature)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {loading && !analysis ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Gemini sedang menganalisis telemetri {currentMeta.label}...
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Menghubungkan data sensor, kapasitas, deteksi slot, log anomali, dan memetakan rekomendasi mitigasi.
                </p>
              </div>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Hero Analysis Score & Title Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl border ${currentMeta.color} shrink-0`}>
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">
                          FITUR: {currentMeta.label.toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md border ${getRiskBadge(analysis.riskLevel)}`}>
                          RISK: {analysis.riskLevel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • {new Date(analysis.generatedAt).toLocaleTimeString('id-ID')} WIB
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                          {analysis.source === 'gemini-3.8-flash' ? '⚡ Gemini 3.8 Flash' : '⚙️ Expert SRE Engine'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100 mt-1 leading-snug">
                        {analysis.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {analysis.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Health Score Gauge Badge */}
                  <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                        SKOR KESEHATAN
                      </span>
                      <span className="text-xs text-slate-400 font-sans">
                        Kondisi Komponen
                      </span>
                    </div>
                    <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-mono ${getScoreColor(analysis.healthScore)}`}>
                      <span className="text-xl font-bold leading-none">{analysis.healthScore}</span>
                      <span className="text-[9px] opacity-70">/100</span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary Box */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {analysis.summary}
                  </p>
                </div>
              </div>

              {/* Key Findings Grid */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  Temuan Kunci Operasional (Key Findings)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {analysis.keyFindings.map((finding, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {finding}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Dive Subsystem Breakdown */}
              {analysis.deepDive && analysis.deepDive.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Analisis Mendalam per Sub-Sistem
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {analysis.deepDive.map((item, idx) => {
                      const statusStyles = {
                        optimal: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
                        warning: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
                        critical: 'border-rose-500/20 bg-rose-500/5 text-rose-400'
                      };
                      return (
                        <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-100 truncate">
                              {item.category}
                            </span>
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-bold ${statusStyles[item.status]}`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {item.details}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Risks & Impact */}
              {analysis.risksAndImpact && analysis.risksAndImpact.length > 0 && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 font-mono uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Potensi Risiko & Dampak Operasional
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-300 leading-relaxed">
                    {analysis.risksAndImpact.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Recommendations */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  Rekomendasi Tindakan Prioritas (Action Plan)
                </h4>
                <div className="space-y-2.5">
                  {analysis.recommendations.map((rec, idx) => {
                    const priorityColor = {
                      P1: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                      P2: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                      P3: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }[rec.priority] || 'bg-slate-800 text-slate-300 border-slate-700';

                    return (
                      <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${priorityColor}`}>
                            {rec.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-100">
                            {rec.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 pl-8 leading-relaxed">
                          <strong className="text-indigo-400 font-medium">Aksi:</strong> {rec.action}
                        </p>
                        <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                          <strong className="text-emerald-400 font-medium">Dampak:</strong> {rec.impact}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remediation CLI Commands */}
              {analysis.remediationCommands && analysis.remediationCommands.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Perintah Remedi CLI Langsung (Copy & Run)
                  </h4>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-xs">
                    {analysis.remediationCommands.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 group bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        <code className={`truncate ${cmd.startsWith('#') ? 'text-slate-500 italic' : 'text-emerald-300'}`}>
                          {cmd}
                        </code>
                        {!cmd.startsWith('#') && (
                          <button
                            onClick={() => handleCopyCommand(cmd, idx)}
                            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                            title="Salin Perintah"
                          >
                            {copiedCmdIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Interactive Q&A */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Tanya AI Lebih Lanjut Mengenai Fitur Ini
                </div>

                {followUpHistory.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {followUpHistory.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-200">
                          <strong>Anda:</strong> {item.q}
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 leading-relaxed">
                          <strong>AI Advisor:</strong> {item.a}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAskFollowUp} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={followUpQuestion}
                    onChange={(e) => setFollowUpQuestion(e.target.value)}
                    placeholder={`Tanyakan hal teknis seputar ${currentMeta.label} (misal: cara migrasi tanpa downtime)...`}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!followUpQuestion.trim() || askingFollowUp}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {askingFollowUp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Kirim</span>
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry AI Engine: Model <strong>gemini-3.8-flash</strong> (Fallback otomatis aktif)</span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToTab(selectedFeature);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Buka Halaman {currentMeta.label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
