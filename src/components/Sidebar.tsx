import React from 'react';
import { LayoutDashboard, Server, Boxes, Brain, AlertTriangle, MessageSquare, ShieldAlert, Cpu, Sun, Moon, X, Network, Pencil, Layers, ShieldCheck } from 'lucide-react';
import { BrandingConfig, AuthUser } from '../types';
import { BrandingLogo } from './BrandingLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  anomaliesCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingConfig;
  onOpenEditLogo: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenSecurityCenter?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  anomaliesCount,
  theme,
  onToggleTheme,
  isOpen,
  onClose,
  branding,
  onOpenEditLogo,
  currentUser,
  onLogout,
  onOpenSecurityCenter
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'clusters', name: 'Cluster', icon: Server },
    { id: 'kubernetes', name: 'Kubernetes K8s', icon: Layers },
    { id: 'hardware', name: 'Hardware Health', icon: Cpu },
    { id: 'containers', name: 'Containers', icon: Boxes },
    { id: 'topology', name: 'Topology', icon: Network },
    { id: 'forecasts', name: 'Forecasts', icon: Brain },
    { id: 'alerts', name: 'Alerts', icon: AlertTriangle, badge: anomaliesCount },
    { id: 'assistant', name: 'Assistant', icon: MessageSquare }
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop overlay with smooth transition */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen transition-all duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)]' : '-translate-x-full shadow-none'
      }`}>
        {/* Branding Header with Edit capability */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 group relative">
          <div 
            onClick={onOpenEditLogo}
            className="flex items-center gap-3 cursor-pointer p-1.5 -m-1.5 rounded-xl hover:bg-slate-800/60 transition-all flex-1 min-w-0"
            title="Klik untuk mengubah logo & branding"
          >
            <div className="relative">
              <BrandingLogo branding={branding} size="md" />
              {/* Hover Edit Pencil Overlay */}
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] rounded-[inherit] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Pencil className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="font-sans font-bold text-base tracking-tight text-slate-100 leading-none truncate">
                  {branding.title || 'Infra Health'}
                </h1>
                <span className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity">
                  <Pencil className="w-3 h-3 text-indigo-400" />
                </span>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider uppercase block mt-1 truncate">
                {branding.subtitle || 'INTEL ADVISOR'}
              </span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/10 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300 group-hover:scale-105'
                }`} />
                <span className="text-sm font-sans">{item.name}</span>
              </div>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-0.5 text-2xs font-bold rounded-full font-mono ${
                  isActive ? 'bg-white text-indigo-600' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Active accent bar */}
              {isActive && (
                <div className="absolute right-0 top-1/4 h-1/2 w-1 bg-white rounded-l-md" />
              )}
            </button>
          );
        })}
      </nav>



      {/* Security Center Quick Action */}
      {onOpenSecurityCenter && (
        <div className="px-4 py-1.5 mx-4">
          <button
            onClick={onOpenSecurityCenter}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 hover:text-emerald-200 transition-all duration-200 cursor-pointer shadow-xs"
            title="Buka Pusat Keamanan & Monitor Ancaman"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold font-sans">Pusat Keamanan</span>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GRADE A+
            </span>
          </button>
        </div>
      )}

      {/* Theme Toggle Button */}
      <div className="px-4 py-2 border-t border-slate-800/60 mx-4">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
            <span className="text-xs font-semibold font-sans">
              {theme === 'dark' ? 'Light Mode' : 'Sleek Dark'}
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

      {/* Integrasi Status & Credit */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 m-4 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-sans font-semibold text-slate-300">Sesi SRE Terautentikasi</span>
        </div>
        <p className="text-[10px] font-sans text-slate-500 leading-relaxed">
          PVE, Nutanix, & K8s diproteksi otorisasi berbasis peran (RBAC).
        </p>
      </div>
    </aside>
  </>
  );
}
