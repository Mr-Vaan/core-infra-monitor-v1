import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Check,
  Palette,
  Type,
  Layout,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BrandingConfig, defaultBrandingConfig } from '../types';
import { ICON_MAP, GRADIENT_PRESETS, BORDER_RADIUS_OPTIONS, BrandingLogo } from './BrandingLogo';

interface EditLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingConfig;
  onSave: (newConfig: BrandingConfig) => Promise<void> | void;
  onReset: () => Promise<void> | void;
}

export const EditLogoModal: React.FC<EditLogoModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSave,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'icon' | 'image' | 'style' | 'text'>('icon');
  const [formData, setFormData] = useState<BrandingConfig>({ ...branding });
  const [iconSearch, setIconSearch] = useState('');
  const [iconCategory, setIconCategory] = useState<string>('All');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when opened
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...branding });
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, branding]);

  if (!isOpen) return null;

  // Handle image upload & base64 encoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap unggah file gambar yang valid (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 4MB untuk performa optimal');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        logoType: 'image',
        customImageUrl: result
      }));
    };
    reader.onerror = () => {
      setErrorMessage('Gagal memproses file gambar');
    };
    reader.readAsDataURL(file);
  };

  // Filtered icons
  const categories = ['All', 'Hardware', 'Infrastructure', 'Network', 'Security', 'Performance', 'Diagnostics', 'DevOps', 'AI & Ops'];

  const filteredIcons = Object.entries(ICON_MAP).filter(([name, info]) => {
    const matchesSearch = name.toLowerCase().includes(iconSearch.toLowerCase()) ||
      info.label.toLowerCase().includes(iconSearch.toLowerCase());
    const matchesCategory = iconCategory === 'All' || info.category === iconCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan perubahan logo');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Kembalikan logo dan nama aplikasi ke pengaturan bawaan default?')) {
      setFormData({ ...defaultBrandingConfig });
      await onReset();
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Sesuaikan Logo & Branding
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20">
                  Kustomisasi
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ubah ikon, logo gambar, warna latar belakang, nama sistem, dan teks advisor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Bar */}
        <div className="bg-slate-950/70 border-b border-slate-800/80 px-6 py-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                Pratinjau Langsung (Live Preview Header)
              </span>
              
              {/* Sidebar Header Simulation */}
              <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl shadow-inner">
                <BrandingLogo branding={formData} size="md" />
                <div className="text-left">
                  <div className="font-sans font-bold text-base tracking-tight text-slate-100 leading-none">
                    {formData.title || 'Infra Health'}
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider uppercase block mt-1">
                    {formData.subtitle || 'INTEL ADVISOR'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navbar Mobile Simulation */}
            <div className="hidden md:block">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                Pratinjau Navbar Mini
              </span>
              <div className="inline-flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
                <BrandingLogo branding={formData} size="sm" />
                <span className="font-sans font-bold text-xs text-white">
                  {formData.title || 'Infra Health'} Control
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50 shrink-0 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('icon')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'icon'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Pilih Ikon Lucide
            {formData.logoType === 'icon' && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'image'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Unggah Logo Gambar
            {formData.logoType === 'image' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('style')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'style'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layout className="w-4 h-4" />
            Warna & Bentuk
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'text'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            Nama & Subjudul
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: LUCIDE ICONS */}
          {activeTab === 'icon' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Cari ikon (misal: Cpu, Server, Shield, Brain)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Categories */}
                <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'Hardware', 'Network', 'Security', 'Performance', 'AI & Ops'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setIconCategory(cat)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                        iconCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of icons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredIcons.map(([iconKey, { label, icon: IconComponent, category }]) => {
                  const isSelected = formData.logoType === 'icon' && formData.iconName === iconKey;
                  return (
                    <button
                      key={iconKey}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          logoType: 'icon',
                          iconName: iconKey
                        }));
                      }}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate leading-tight group-hover:text-white">
                          {iconKey}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {category}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE UPLOAD */}
          {activeTab === 'image' && (
            <div className="space-y-5">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/50 hover:bg-slate-950/80 rounded-2xl p-6 text-center transition-all cursor-pointer group flex flex-col items-center justify-center gap-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-white">
                    Klik untuk memilih atau seret gambar logo ke sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mendukung PNG transparan, SVG, JPG, atau WebP (Maksimal 4MB)
                  </p>
                </div>
              </div>

              {/* Current / Custom Image Status */}
              {formData.customImageUrl && (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.customImageUrl}
                      alt="Custom logo"
                      className="w-12 h-12 object-contain rounded-lg border border-slate-700 bg-slate-900"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Logo Kustom Aktif
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formData.imageFit === 'contain' ? 'Mode: Pas Proporsional (Contain)' : 'Mode: Isi Penuh (Cover)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Fit Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          imageFit: prev.imageFit === 'contain' ? 'cover' : 'contain'
                        }))
                      }
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    >
                      {formData.imageFit === 'contain' ? 'Ubah ke Cover' : 'Ubah ke Contain'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          customImageUrl: '',
                          logoType: 'icon'
                        }))
                      }
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Preset Images */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Atau gunakan logo preset enterprise:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Intel Blue Tech', url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=128&auto=format&fit=crop&q=80' },
                    { name: 'Microchip Circuit', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=128&auto=format&fit=crop&q=80' },
                    { name: 'Server Matrix', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=128&auto=format&fit=crop&q=80' },
                    { name: 'AI Neural Node', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=128&auto=format&fit=crop&q=80' }
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          logoType: 'image',
                          customImageUrl: preset.url
                        }));
                      }}
                      className="p-2 bg-slate-950/40 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center gap-2 text-left cursor-pointer transition-colors"
                    >
                      <img src={preset.url} alt={preset.name} className="w-7 h-7 rounded-lg object-cover" />
                      <span className="text-[11px] font-medium text-slate-300 truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STYLE, GRADIENTS & SHAPES */}
          {activeTab === 'style' && (
            <div className="space-y-6">
              {/* Gradients */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2.5">
                  Warna Latar & Gradien (Squircle Gradient)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {GRADIENT_PRESETS.map((preset) => {
                    const isSelected = formData.gradient === preset.classes;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gradient: preset.classes }))}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${preset.classes} shrink-0 shadow-sm`} />
                        <span className="text-xs font-medium text-slate-200 truncate">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2.5">
                  Bentuk Sudut Kontainer (Border Radius)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {BORDER_RADIUS_OPTIONS.map((item) => {
                    const isSelected = formData.borderRadius === item.class;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, borderRadius: item.class as any }))}
                        className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500/50 text-white'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-medium">{item.label}</span>
                        <div className={`w-5 h-5 bg-indigo-500/30 border border-indigo-400 ${item.class}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Animations */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2.5">
                  Efek Animasi Ikon
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'pulse', label: 'Denyut (Pulse)' },
                    { id: 'glow', label: 'Bersinar (Glow)' },
                    { id: 'bounce', label: 'Membal (Bounce)' },
                    { id: 'none', label: 'Statis (None)' }
                  ].map((anim) => {
                    const isSelected = formData.iconAnimation === anim.id;
                    return (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, iconAnimation: anim.id as any }))}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300 font-semibold ring-1 ring-indigo-500/50'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className="text-xs">{anim.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEXT / TITLES */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nama Sistem / Judul Aplikasi (Title)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Infra Health"
                  maxLength={32}
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Tampil tebal di bagian atas sidebar dan judul tab browser
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Subjudul / Tagline (Subtitle)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. INTEL ADVISOR"
                  maxLength={32}
                  className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm font-mono text-indigo-400 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Tampil dengan font monospace di bawah judul aplikasi
                </span>
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Contoh Penamaan Cepat:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { title: 'Infra Health', subtitle: 'INTEL ADVISOR' },
                    { title: 'Arcane Infra', subtitle: 'ENTERPRISE OPS' },
                    { title: 'Cluster Monitor', subtitle: 'PRODUCTION SYS' },
                    { title: 'Core Stack', subtitle: 'HEALTH DASHBOARD' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, title: preset.title, subtitle: preset.subtitle }))}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white cursor-pointer"
                    >
                      {preset.title} · <span className="font-mono text-indigo-400">{preset.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset ke Pengaturan Bawaan
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Tersimpan!
                </>
              ) : saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Terapkan & Simpan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
