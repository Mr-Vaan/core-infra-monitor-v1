import React, { useState, useEffect } from 'react';
import { Cluster } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, Sparkles, RefreshCw, AlertTriangle, Zap, Server, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FeatureAnalysisType } from '../types';

interface ForecastsViewProps {
  clusters: Cluster[];
  onOpenAiAnalysis?: (feature?: FeatureAnalysisType) => void;
}

export default function ForecastsView({ clusters, onOpenAiAnalysis }: ForecastsViewProps) {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [forecastReport, setForecastReport] = useState<string>('');
  const [reportsCache, setReportsCache] = useState<Record<string, string>>({});

  const cluster = clusters.find(c => c.id === selectedClusterId);

  // Staggered loading messages
  const loadingSteps = [
    'Menarik data historis dari telemetry lake di Cloud Storage...',
    'Memproses deret waktu (time-series) dengan akselerasi GPU NVIDIA cuDF...',
    'Mengirim dataset ke BigQuery untuk kalkulasi trendline regresi...',
    'Menghubungkan ke Gemini Enterprise Agent Platform untuk penalaran kognitif...',
    'Menghasilkan rekomendasi mitigasi kapasitas proaktif...'
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Generate projections for Recharts (15 days actual, 15 days forecast)
  const getProjectionData = () => {
    if (!cluster) return [];
    
    // Take the last 15 points of telemetry as actuals
    const lastTelemetry = cluster.telemetry.slice(-15);
    const data: any[] = [];
    
    // Add actual points
    lastTelemetry.forEach((t, index) => {
      data.push({
        dayIndex: index + 1,
        label: t.timestamp,
        actual: t.storage,
        forecast: null
      });
    });

    // We assume storage grows linearly for projection
    const lastActual = lastTelemetry[lastTelemetry.length - 1].storage;
    const firstActual = lastTelemetry[0].storage;
    const growthRate = (lastActual - firstActual) / (lastTelemetry.length || 1); // average daily growth
    
    const now = new Date();
    
    // Add 15 forecast points
    for (let i = 1; i <= 15; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const forecastVal = Math.min(100, lastActual + growthRate * i);
      data.push({
        dayIndex: 15 + i,
        label: `Hari +${i}`,
        actual: i === 1 ? lastActual : null, // bridge line
        forecast: Math.round(forecastVal * 10) / 10
      });
    }

    return data;
  };

  const handleRunForecast = async () => {
    if (!selectedClusterId) return;
    setIsGenerating(true);
    setForecastReport('');

    try {
      const response = await fetch('/api/gemini/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId: selectedClusterId })
      });
      const data = await response.json();
      
      if (response.ok) {
        setForecastReport(data.text);
        setReportsCache(prev => ({ ...prev, [selectedClusterId]: data.text }));
      } else {
        setForecastReport(`Gagal memuat prediksi AI: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setForecastReport(`Gagal menghubungkan ke server untuk analisis AI: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Pre-load report from cache if switching clusters
  useEffect(() => {
    if (selectedClusterId && reportsCache[selectedClusterId]) {
      setForecastReport(reportsCache[selectedClusterId]);
    } else {
      setForecastReport('');
    }
  }, [selectedClusterId]);

  const storagePercent = cluster ? Math.round((cluster.storageUsedGB / cluster.storageCapacityGB) * 100) : 0;
  const projectionData = getProjectionData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
          Predictive Capacity Forecasting
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Gunakan model bahasa besar Gemini untuk memprediksi kehabisan resource dan merencanakan pemeliharaan proaktif.
        </p>
      </div>

      {/* Cluster Selection & Trigger Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-slate-400 text-xs font-sans font-semibold shrink-0">Pilih Kluster untuk Analisis:</span>
          <div className="flex flex-wrap gap-2">
            {clusters.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClusterId(c.id)}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  selectedClusterId === c.id
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 disabled:opacity-50'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          {onOpenAiAnalysis && (
            <button
              onClick={() => onOpenAiAnalysis('forecasts')}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/20 cursor-pointer group"
              title="Audit & Analisis AI Prediksi Kapasitas & FinOps"
            >
              <Sparkles className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform animate-pulse" />
              <span>Analisis AI Kapasitas</span>
            </button>
          )}

          <button
            onClick={handleRunForecast}
            disabled={isGenerating || !selectedClusterId}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            <span>{isGenerating ? 'Menghitung Prediksi...' : 'Jalankan AI Forecast'}</span>
          </button>
        </div>
      </div>

      {cluster && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Stats & Chart Projection */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Metrics Dials (Snapshot 10) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 font-sans">Kapasitas Kluster Saat Ini</h3>
              
              <div className="grid grid-cols-3 gap-4 text-center font-sans">
                {/* CPU */}
                <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">CPU</span>
                  <div className="text-xl font-bold text-slate-200 mt-1 font-mono">
                    {Math.round(cluster.nodes.reduce((acc, n) => acc + n.cpuUsage, 0) / (cluster.nodes.length || 1))}%
                  </div>
                </div>

                {/* RAM */}
                <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3.5">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">RAM</span>
                  <div className="text-xl font-bold text-slate-200 mt-1 font-mono">
                    {Math.round(cluster.nodes.reduce((acc, n) => acc + n.ramUsage, 0) / (cluster.nodes.length || 1))}%
                  </div>
                </div>

                {/* Storage */}
                <div className={`bg-slate-950/60 border rounded-xl p-3.5 ${
                  storagePercent >= 85 ? 'border-rose-500/20 text-rose-400' : 'border-slate-800/60 text-slate-200'
                }`}>
                  <span className="text-slate-500 text-[10px] uppercase font-semibold block">Penyimpanan / Ceph</span>
                  <div className="text-xl font-bold mt-1 font-mono flex items-center justify-center gap-1.5">
                    <span>{storagePercent}%</span>
                    {storagePercent >= 85 && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Capacity Projection */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">Proyeksi Kapasitas Penyimpanan (30 Hari ke Depan)</h3>
                <p className="text-slate-400 text-xs mt-0.5">Membandingkan tren nyata 15 hari terakhir dengan proyeksi 15 hari mendatang.</p>
              </div>

              <div className="h-[250px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-800)" />
                    <XAxis dataKey="label" stroke="var(--color-slate-500)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--color-slate-500)" fontSize={10} tickLine={false} domain={[40, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px' }}
                      labelStyle={{ color: 'var(--color-slate-400)', fontWeight: 600 }}
                    />
                    <ReferenceLine y={90} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Kritis (90%)', fill: '#f43f5e', fontSize: 10, position: 'top' }} />
                    
                    {/* Actual Area */}
                    <Area
                      type="monotone"
                      dataKey="actual"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.1}
                      strokeWidth={2.5}
                      name="Metrik Riwayat"
                    />

                    {/* Forecast Area */}
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.05}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      name="Prediksi Masa Depan"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-4 text-[11px] text-slate-400 font-sans border-t border-slate-800/50 pt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Suhu Nyata (15 Hari Terakhir)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" style={{ borderStyle: 'dashed' }} />
                  <span>Proyeksi Regresi AI (15 Hari Mendatang)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Markdown Advisor Response (Snapshot 10) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col flex-1 h-full min-h-[400px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm text-slate-100 font-sans">Gemini Recommendation</span>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              {isGenerating ? (
                /* Staggered loading state */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                    <Brain className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <span className="text-xs font-semibold text-slate-300 block">Memproses Analitik AI</span>
                    <p className="text-[11px] text-slate-500 font-mono transition-all duration-300 min-h-[40px]">
                      {loadingSteps[loadingStep]}
                    </p>
                  </div>
                </div>
              ) : forecastReport ? (
                /* Markdown Report Panel */
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="markdown-body">
                    <ReactMarkdown>{forecastReport}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                /* Empty state instructing to trigger forecast */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
                  <div className="bg-slate-950 p-4 rounded-full border border-slate-800 text-slate-500">
                    <Brain className="w-10 h-10" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">Menunggu Analisis AI</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Silakan pilih kluster dan klik tombol **"Jalankan AI Forecast"** untuk memprediksi kapasitas & menghasilkan rekomendasi.
                    </p>
                  </div>
                  <button
                    onClick={handleRunForecast}
                    className="flex items-center gap-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all mt-2"
                  >
                    <span>Mulai Sekarang</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
