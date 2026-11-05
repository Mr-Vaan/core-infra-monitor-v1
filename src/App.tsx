import React, { useState, useEffect } from 'react';
import { Cluster, Anomaly, WebhookConfig, ChatMessage, VirtualizationType, BrandingConfig, defaultBrandingConfig, AuthUser, FeatureAnalysisType } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClustersView from './components/ClustersView';
import ForecastsView from './components/ForecastsView';
import AlertsView from './components/AlertsView';
import AssistantView from './components/AssistantView';
import TopologyView from './components/TopologyView';
import ContainersView from './components/ContainersView';
import HardwareHealthView from './components/HardwareHealthView';
import KubernetesView from './components/KubernetesView';
import LoginView from './components/LoginView';
import { defaultClusters, defaultAnomalies } from './data/mockTelemetry';
import { Activity, ShieldAlert, Cpu, Layers, Menu, X, RefreshCw, Palette, Pencil, Sparkles, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { BrandingLogo } from './components/BrandingLogo';
import { EditLogoModal } from './components/EditLogoModal';
import { AiFeatureAnalysisModal } from './components/AiFeatureAnalysisModal';
import { SecurityCenterModal } from './components/SecurityCenterModal';
import { getStoredUser, clearStoredUser } from './data/mockAuth';
import { authFetch } from './utils/apiClient';


function RealTimeClock() {
  const [clock, setClock] = useState<{ date: string; time: string }>(() => {
    const now = new Date();
    return {
      date: new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(now),
      time: new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(now) + ' WIB'
    };
  });

  useEffect(() => {
    const dateFormatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const timer = setInterval(() => {
      const now = new Date();
      setClock({
        date: dateFormatter.format(now),
        time: timeFormatter.format(now) + ' WIB'
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col text-left md:text-right bg-slate-950/40 border border-slate-800/40 px-3.5 py-1.5 rounded-xl min-w-[145px]">
      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1 md:justify-end">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
        WIB (REAL-TIME)
      </span>
      <span className="text-xs font-mono text-slate-100 font-bold mt-0.5">
        {clock.time}
      </span>
      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
        {clock.date}
      </span>
    </div>
  );
}

export default function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());

  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (_) {}
    clearStoredUser();
    setCurrentUser(null);
    showToast('Anda telah keluar dari sesi sistem.', 'info');
  };

  // Security Center & Threat Monitor modal state
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState(false);

  // Auto-logout if server revokes token or returns 401
  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredUser();
      setCurrentUser(null);
      showToast('Sesi Anda telah berakhir atau diputus oleh sistem keamanan.', 'error');
    };
    window.addEventListener('infra-auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('infra-auth-unauthorized', handleUnauthorized);
  }, []);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedHardwareNodeId, setSelectedHardwareNodeId] = useState<string>('');
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  
  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Chat states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Synchronization state
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Branding & Logo State with localStorage persistence
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    try {
      const saved = localStorage.getItem('infra_health_branding_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse cached branding config:', e);
    }
    return defaultBrandingConfig;
  });

  const [isEditLogoOpen, setIsEditLogoOpen] = useState(false);

  // AI Multi-Feature Deep Analysis Modal State
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [aiAnalysisTargetFeature, setAiAnalysisTargetFeature] = useState<FeatureAnalysisType>('dashboard');

  const handleOpenAiAnalysis = (feature?: FeatureAnalysisType) => {
    const validFeatures: FeatureAnalysisType[] = ['dashboard', 'clusters', 'kubernetes', 'hardware', 'containers', 'topology', 'forecasts', 'alerts'];
    const feat = feature || (validFeatures.includes(activeTab as FeatureAnalysisType) ? (activeTab as FeatureAnalysisType) : 'dashboard');
    setAiAnalysisTargetFeature(feat);
    setAiAnalysisModalOpen(true);
  };

  // Sync document title with branding title
  useEffect(() => {
    if (branding.title) {
      document.title = `${branding.title} | ${branding.subtitle || 'Infrastructure Intelligence'}`;
    }
  }, [branding.title, branding.subtitle]);

  // Fetch initial branding from server
  useEffect(() => {
    authFetch('/api/branding')
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          setBranding(data);
          try {
            localStorage.setItem('infra_health_branding_config', JSON.stringify(data));
          } catch (e) {
            console.warn('Failed to cache branding to localStorage:', e);
          }
        }
      })
      .catch(err => {
        console.warn('Could not fetch server branding:', err);
      });
  }, []);

  const handleSaveBranding = async (newConfig: BrandingConfig) => {
    setBranding(newConfig);
    try {
      localStorage.setItem('infra_health_branding_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to cache branding to localStorage:', e);
    }

    try {
      const res = await authFetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (!res.ok) {
        throw new Error('Server mengembalikan status gagal saat menyimpan branding');
      }
      showToast('Logo & branding berhasil diperbarui dan disimpan!', 'success');
    } catch (err: any) {
      console.error('Failed to sync branding to server:', err);
      showToast('Branding tersimpan di browser lokal.', 'info');
    }
  };

  const handleResetBranding = async () => {
    setBranding(defaultBrandingConfig);
    try {
      localStorage.setItem('infra_health_branding_config', JSON.stringify(defaultBrandingConfig));
    } catch (e) {}

    try {
      await authFetch('/api/branding/reset', { method: 'POST' });
      showToast('Logo & branding dikembalikan ke konfigurasi bawaan!', 'info');
    } catch (err) {
      console.error('Failed to reset branding on server:', err);
    }
  };

  // Load initial global state from Express backend API
  const fetchGlobalState = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const response = await authFetch('/api/state');
      if (response.ok) {
        const data = await response.json();
        setClusters(data.clusters);
        setAnomalies(data.anomalies);
        setWebhooks(data.webhooks);
      } else {
        // Fallback if Express isn't ready
        loadFallbackDefaults();
      }
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { 
        timeZone: 'Asia/Jakarta', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      }) + ' WIB');
    } catch (err) {
      console.warn('Backend server connection failed, loading local defaults:', err);
      loadFallbackDefaults();
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { 
        timeZone: 'Asia/Jakarta', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      }) + ' WIB');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    showToast('Memperbarui data telemetri...', 'info');
    // Simulate a brief delay (e.g. 500ms) for realistic feel and transition
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchGlobalState(false);
    showToast('Data telemetri berhasil diperbarui!', 'success');
  };

  const loadFallbackDefaults = () => {
    setClusters(defaultClusters);
    setAnomalies(defaultAnomalies);
    setWebhooks([
      { id: 'wh-01', name: 'Slack Alerts Channel', url: 'https://hooks.slack.com/services/T00/B00/X00', events: ['critical_alert', 'anomaly_detected'], active: true },
      { id: 'wh-02', name: 'Ops Genio Webhook', url: 'https://api.opsgenie.com/v1/json/proxmox', events: ['node_offline', 'storage_exhaustion'], active: false }
    ]);
  };

  useEffect(() => {
    fetchGlobalState(true); // Initial load is silent to avoid excessive banners on startup
  }, []);



  // API operations matching the backend routes
  const handleAddCluster = async (name: string, type: VirtualizationType, endpoint: string, capacityGB: number): Promise<Cluster | null> => {
    try {
      const response = await authFetch('/api/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, endpoint, storageCapacityGB: capacityGB })
      });
      if (response.ok) {
        const newCluster = await response.json();
        setClusters((prev) => [...prev, newCluster]);
        showToast(`Koneksi kluster "${name}" berhasil diintegrasikan!`, 'success');
        return newCluster;
      } else {
        const data = await response.json().catch(() => ({}));
        showToast(data.error || 'Gagal menambahkan integrasi kluster baru.', 'error');
        return null;
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghubungi server backend.', 'error');
      return null;
    }
  };

  const handleDeleteCluster = async (id: string) => {
    try {
      const response = await authFetch(`/api/clusters/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setClusters((prev) => prev.filter(c => c.id !== id));
        setAnomalies((prev) => prev.filter(a => a.clusterId !== id));
        showToast('Integrasi kluster berhasil dihapus.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus integrasi kluster.', 'error');
    }
  };

  const handleResolveAnomaly = async (id: string) => {
    try {
      const response = await authFetch(`/api/anomalies/${id}/resolve`, { method: 'POST' });
      if (response.ok) {
        const updated = await response.json();
        setAnomalies((prev) => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
        showToast('Anomali berhasil diselesaikan dan diarsipkan.', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyelesaikan anomali.', 'error');
    }
  };

  const handleSimulateWorkload = async (id: string, scenario: 'spike_cpu' | 'leak_ram' | 'heavy_io' | 'clear') => {
    try {
      const response = await authFetch(`/api/clusters/${id}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      if (response.ok) {
        const data = await response.json();
        // Update both cluster metrics and global anomalies list
        setClusters((prev) => prev.map(c => c.id === id ? data.cluster : c));
        setAnomalies(data.anomalies);
        showToast('Simulasi beban kerja berhasil diperbarui!', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal melakukan simulasi beban kerja.', 'error');
    }
  };

  const handleToggleWebhook = async (id: string) => {
    try {
      const response = await authFetch(`/api/webhooks/${id}/toggle`, { method: 'POST' });
      if (response.ok) {
        const updated = await response.json();
        setWebhooks((prev) => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
        showToast('Status keaktifan Webhook berhasil diperbarui.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWebhook = async (name: string, url: string, events: string[]) => {
    try {
      const response = await authFetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, events })
      });
      if (response.ok) {
        const newWh = await response.json();
        setWebhooks((prev) => [...prev, newWh]);
        showToast('Integrasi Webhook baru berhasil ditambahkan!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menambahkan webhook.', 'error');
    }
  };

  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await authFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, chatHistory })
      });
      const data = await response.json();

      if (response.ok) {
        const botMsg: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory((prev) => [...prev, botMsg]);
      } else {
        const botMsg: ChatMessage = {
          id: `msg-bot-err-${Date.now()}`,
          sender: 'assistant',
          text: `Maaf, saya mengalami kegagalan internal saat berdiskusi: ${data.error || 'Unknown error'}`,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      const botMsg: ChatMessage = {
        id: `msg-bot-err-${Date.now()}`,
        sender: 'assistant',
        text: `Error koneksi: Gagal berkomunikasi dengan server AI Advisor. ${err.message}`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory((prev) => [...prev, botMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Active anomalies badge count
  const activeAnomaliesCount = anomalies.filter(a => !a.resolved).length;

  // Gate: User MUST login before accessing the application
  if (!currentUser) {
    return (
      <div className={theme === 'light' ? 'theme-light' : ''}>
        <LoginView
          branding={branding}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showToast(`Autentikasi berhasil. Selamat bertugas, ${user.name}!`, 'success');
          }}
          showToast={showToast}
        />
        {/* Toast Notification Container */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 font-sans text-xs ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border border-rose-500/50 text-rose-200'
              : toast.type === 'info'
              ? 'bg-blue-950/90 border border-blue-500/50 text-blue-200'
              : 'bg-slate-900 border border-emerald-500/40 text-emerald-200'
          }`}>
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex bg-slate-950 text-slate-100 min-h-screen font-sans antialiased selection:bg-indigo-500/30 selection:text-white ${theme === 'light' ? 'theme-light' : ''}`}>
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        anomaliesCount={activeAnomaliesCount} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        branding={branding}
        onOpenEditLogo={() => setIsEditLogoOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSecurityCenter={() => setIsSecurityCenterOpen(true)}
      />

      {/* Main Content Pane */}
      <main id="main-scroll-container" className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 space-y-6">
        
        {/* Unified Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer md:hidden"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <div 
                onClick={() => setIsEditLogoOpen(true)}
                className="flex items-center gap-3 cursor-pointer group p-1 -m-1 rounded-xl hover:bg-slate-800/40 transition-colors"
                title="Klik untuk mengubah logo & nama sistem"
              >
                <div className="relative">
                  <BrandingLogo branding={branding} size="sm" />
                  <div className="absolute inset-0 bg-slate-950/60 rounded-[inherit] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Pencil className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-bold text-sm tracking-tight text-white leading-tight">
                      {branding.title || 'Infra Health'} Control
                    </span>
                    <Pencil className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 font-bold">
                    {branding.subtitle || 'INTEL ADVISOR'} · AKTIF
                  </span>
                </div>
              </div>
            </div>

            {/* Quick status dot */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[11px] text-slate-300 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{clusters.length} Kluster Terhubung</span>
            </div>
          </div>

          {/* Sync Time & Action Button */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-4 w-full md:w-auto border-t border-slate-800/50 pt-3 md:border-t-0 md:pt-0">
            {/* Real-time Indonesian Clock */}
            <RealTimeClock />

            {/* Last Sync */}
            <div className="flex flex-col text-left md:text-right">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                WAKTU SINKRONISASI (LAST SYNC)
              </span>
              <span className="text-xs font-mono text-indigo-400 font-bold mt-0.5">
                {lastSyncTime ? `${lastSyncTime}` : 'Sedang menyinkronkan...'}
              </span>
            </div>

            <button
              onClick={() => handleOpenAiAnalysis()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400/30 text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center gap-2 cursor-pointer group"
              title={`Jalankan Audit & Analisis AI untuk Fitur ${activeTab.toUpperCase()}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200 group-hover:scale-110 transition-transform animate-pulse" />
              <span className="font-sans font-bold">Analisis AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-white/20 text-white font-bold leading-none hidden sm:inline">
                {activeTab}
              </span>
            </button>

            <button
              onClick={() => setIsSecurityCenterOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 hover:text-emerald-200 transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Pusat Keamanan & Monitor Ancaman Produksi"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Pusat Keamanan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <button
              onClick={() => setIsEditLogoOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 hover:text-white transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
              title="Kustomisasi Logo & Branding Sistem"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Ubah Logo</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                isRefreshing
                  ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui Data'}</span>
            </button>

            {/* Authenticated User Profile Pill & Quick Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div 
                className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 px-2.5 py-1.5 rounded-xl cursor-default"
                title={`Login sebagai ${currentUser.name} (${currentUser.roleTitle})`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                  currentUser.role === 'sre_lead'
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                    : currentUser.role === 'sysops'
                    ? 'bg-gradient-to-tr from-blue-600 to-cyan-600'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                }`}>
                  {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200 leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] font-mono text-indigo-400 mt-0.5 leading-none font-semibold">
                    {currentUser.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all cursor-pointer shadow-xs"
                title="Keluar dari sesi sistem (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Global Banner for Active Critical Anomalies */}
        {activeAnomaliesCount > 0 && activeTab !== 'alerts' && (
          <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-rose-400 font-medium">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>Perhatian: Terdeteksi **{activeAnomaliesCount} Anomali Kritis** di kluster aktif yang memerlukan penanganan!</span>
            </div>
            <button 
              onClick={() => setActiveTab('alerts')}
              className="text-rose-400 hover:text-rose-300 text-xs font-bold underline font-sans"
            >
              Lihat Rincian
            </button>
          </div>
        )}

        {/* Tab rendering switcher */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            clusters={clusters} 
            anomalies={anomalies} 
            onNavigate={setActiveTab} 
            onOpenAiAnalysis={handleOpenAiAnalysis}
          />
        )}

        {activeTab === 'clusters' && (
          <ClustersView 
            clusters={clusters} 
            onAddCluster={handleAddCluster} 
            onDeleteCluster={handleDeleteCluster} 
            onSimulateWorkload={handleSimulateWorkload} 
            onNavigateToHardware={(nodeId) => {
              setSelectedHardwareNodeId(nodeId);
              setActiveTab('hardware');
            }}
            onOpenAiAnalysis={handleOpenAiAnalysis}
          />
        )}

        {activeTab === 'kubernetes' && (
          <KubernetesView 
            onNavigateToAssistant={(prompt) => {
              handleSendChatMessage(prompt);
              setActiveTab('assistant');
            }}
            onOpenAiAnalysis={handleOpenAiAnalysis}
          />
        )}

        {activeTab === 'hardware' && (
          <HardwareHealthView 
            initialNodeId={selectedHardwareNodeId}
            onNavigateToAssistant={(prompt) => {
              handleSendChatMessage(prompt);
              setActiveTab('assistant');
            }}
            onOpenAiAnalysis={handleOpenAiAnalysis}
          />
        )}

        {activeTab === 'containers' && (
          <ContainersView 
            onNavigateToAssistant={(prompt) => {
              handleSendChatMessage(prompt);
              setActiveTab('assistant');
            }}
            onOpenAiAnalysis={handleOpenAiAnalysis}
          />
        )}

        {activeTab === 'topology' && (
          <TopologyView 
            clusters={clusters} 
            onOpenAiAnalysis={handleOpenAiAnalysis}
          />
        )}

        {activeTab === 'forecasts' && (
          <ForecastsView 
            clusters={clusters} 
            onOpenAiAnalysis={handleOpenAiAnalysis}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView 
            anomalies={anomalies} 
            webhooks={webhooks} 
            onResolveAnomaly={handleResolveAnomaly} 
            onToggleWebhook={handleToggleWebhook} 
            onAddWebhook={handleAddWebhook} 
            clusters={clusters}
            onOpenAiAnalysis={handleOpenAiAnalysis}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantView 
            chatHistory={chatHistory} 
            onSendMessage={handleSendChatMessage} 
            isThinking={isThinking} 
          />
        )}
      </main>

      {/* Elegant Floating System Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 animate-pulse">
          <div className={`p-2 rounded-lg ${
            toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
            toast.type === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div className="max-w-xs">
            <span className="text-xs font-bold text-slate-100 block">Notifikasi Sistem</span>
            <span className="text-[11px] text-slate-300 mt-0.5 block leading-relaxed">{toast.message}</span>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-slate-300 ml-3 shrink-0 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Logo & Branding Customization Modal */}
      <EditLogoModal
        isOpen={isEditLogoOpen}
        onClose={() => setIsEditLogoOpen(false)}
        branding={branding}
        onSave={handleSaveBranding}
        onReset={handleResetBranding}
      />

      {/* Comprehensive AI Feature Analysis Modal */}
      <AiFeatureAnalysisModal
        isOpen={aiAnalysisModalOpen}
        onClose={() => setAiAnalysisModalOpen(false)}
        initialFeature={aiAnalysisTargetFeature}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setAiAnalysisModalOpen(false);
        }}
      />

      {/* Production Security Center & Threat Monitor Modal */}
      <SecurityCenterModal
        isOpen={isSecurityCenterOpen}
        onClose={() => setIsSecurityCenterOpen(false)}
        showToast={showToast}
      />
    </div>
  );
}
