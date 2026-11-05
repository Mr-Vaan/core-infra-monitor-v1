import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Server, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Fingerprint, 
  Terminal, 
  Layers,
  Cpu
} from 'lucide-react';
import { BrandingConfig, AuthUser, AuthRole } from '../types';
import { BrandingLogo } from './BrandingLogo';
import { saveStoredUser } from '../data/mockAuth';

interface LoginViewProps {
  branding: BrandingConfig;
  onLoginSuccess: (user: AuthUser) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function LoginView({
  branding,
  onLoginSuccess,
  showToast
}: LoginViewProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // 2FA state
  const [require2FA, setRequire2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<AuthRole>('sre_lead');
  const [regDepartment, setRegDepartment] = useState('Site Reliability Engineering');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Perform login action
  const executeLogin = async (idVal: string, passVal: string, remember: boolean) => {
    if (!idVal.trim() || !passVal.trim()) {
      setErrorMessage('Username/Email dan Password wajib diisi.');
      return;
    }

    if (require2FA && totpCode.trim().length !== 6) {
      setErrorMessage('Masukkan kode 6-digit TOTP Authenticator yang valid.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: idVal.trim(),
          password: passVal.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        saveStoredUser(data.user, remember);
        showToast?.(`Selamat datang kembali, ${data.user.name}! Sesi produksi aktif.`, 'success');
        onLoginSuccess(data.user);
      } else if (response.status === 429) {
        // Brute force lockout triggered
        setErrorMessage(data.error || 'Terlalu banyak percobaan gagal. Akses diblokir sementara.');
      } else {
        setErrorMessage(data.error || 'Autentikasi gagal. Kredensial tidak valid.');
      }
    } catch (err) {
      setErrorMessage('Gagal menghubungi server autentikasi. Pastikan koneksi aman.');
    } finally {
      setIsLoading(false);
    }
  };

  // Perform register action
  const executeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Semua kolom formulir pendaftaran wajib diisi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword.trim(),
          role: regRole,
          department: regDepartment.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        saveStoredUser(data.user, true);
        showToast?.(`Akun berhasil dibuat! Selamat datang, ${data.user.name}.`, 'success');
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'Gagal mendaftar akun baru.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kendala jaringan saat mendaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background Cyber Ambient & Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[-10%] right-[15%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[5%] w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <BrandingLogo branding={branding} size="sm" />
          <div className="flex flex-col">
            <span className="font-sans font-bold text-base tracking-tight text-white flex items-center gap-2">
              {branding.title || 'Infra Health'}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                SRE GATEWAY
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider uppercase">
              {branding.subtitle || 'INTEL ADVISOR'} · SECURE AUTH
            </span>
          </div>
        </div>

        {/* Security badges */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TLS 1.3 SECURE</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>JAKARTA EQUINIX DC</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Platform Overview & Live Status */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>ENTERPRISE SRE ACCESS CONTROL</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Pusat Kendali & <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Intelijen Infrastruktur
                </span>
              </h1>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Silakan masuk dengan akun resmi untuk mengakses telemetri kluster virtualisasi (Proxmox VE, Nutanix, OpenStack), Kubernetes HA, inventaris hardware, dan analisa AI SRE.
              </p>
            </div>

            {/* Platform Highlights */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Kluster Virtualisasi Terpadu</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pantau utilisasi CPU, RAM, disk CEPH, dan deteksi anomali real-time.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Kubernetes & Hardware Health</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Inspeksi pod crashloop, simulasi kubectl terminal, dan diagnostik IPMI.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Asisten AI SRE Berbasis Gemini 3.8</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rekomendasi mitigasi otomatis dengan fallback mesin domain pakar.</p>
                </div>
              </div>
            </div>

            {/* Enterprise Security Notice */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Keamanan Sesi Produksi
                </span>
                <span className="text-[10px] text-slate-400 font-mono">STANDAR SRE</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 leading-relaxed font-sans">
                Akses diawasi oleh Intrusion Prevention System (IPS). Sesi terenkripsi 256-bit dengan proteksi brute-force otomatis.
              </p>
            </div>
          </div>

          {/* Right Column: Authentication Card Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-1/4 w-40 h-20 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Tab Selector: Login vs Register */}
              <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMessage(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tab === 'login'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Masuk Sistem (Sign In)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMessage(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    tab === 'register'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Daftar Akun Baru (Register)</span>
                </button>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ============================================== */}
              {/* TAB 1: LOGIN FORM */}
              {/* ============================================== */}
              {tab === 'login' ? (
                <div>
                  <form onSubmit={(e) => { e.preventDefault(); executeLogin(identifier, password, rememberMe); }} className="space-y-4">
                    {/* Identifier Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Username atau Email Perusahaan
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="contoh: admin atau budi.sre@corp.internal"
                          className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Password
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan password Anda"
                          className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors"
                          title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Options: Remember Me & 2FA Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>Ingat sesi di perangkat ini</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-indigo-300 transition-colors select-none">
                        <Fingerprint className="w-4 h-4 text-indigo-400" />
                        <input
                          type="checkbox"
                          checked={require2FA}
                          onChange={(e) => setRequire2FA(e.target.checked)}
                          className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>Verifikasi 2FA (TOTP)</span>
                      </label>
                    </div>

                    {/* 2FA Code Input (if enabled) */}
                    {require2FA && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 animate-in fade-in space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5" />
                            Kode Authenticator (6-Digit)
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">Simulasi Live OTP: 849201</span>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="849201"
                          className="w-full text-center tracking-[0.4em] py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-lg font-mono font-black text-indigo-300 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Memverifikasi Kredensial...</span>
                          </>
                        ) : (
                          <>
                            <span>Masuk ke Dashboard Telemetri</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* ============================================== */
                /* TAB 2: REGISTER NEW SRE ACCOUNT */
                /* ============================================== */
                <div>
                  <form onSubmit={executeRegister} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Ahmad Fauzi"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          placeholder="e.g. afauzi"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Email Korporat
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. ahmad.fauzi@corp.internal"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Password Baru (Standar Produksi)
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Kombinasi kuat 8+ karakter"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors"
                            title={showRegPassword ? 'Sembunyikan password' : 'Lihat password'}
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-400 hover:text-slate-300" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Departemen
                        </label>
                        <input
                          type="text"
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          placeholder="e.g. Cloud Infrastructure"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Real-time Password Policy Checklist */}
                    {regPassword.length > 0 && (
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px] font-mono grid grid-cols-2 gap-1.5 animate-in fade-in">
                        <span className={`flex items-center gap-1 ${regPassword.length >= 8 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                          {regPassword.length >= 8 ? '✓' : '○'} Min. 8 Karakter
                        </span>
                        <span className={`flex items-center gap-1 ${/[A-Z]/.test(regPassword) ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                          {/[A-Z]/.test(regPassword) ? '✓' : '○'} Huruf Besar (A-Z)
                        </span>
                        <span className={`flex items-center gap-1 ${/[a-z]/.test(regPassword) ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                          {/[a-z]/.test(regPassword) ? '✓' : '○'} Huruf Kecil (a-z)
                        </span>
                        <span className={`flex items-center gap-1 ${/[0-9]/.test(regPassword) ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                          {/[0-9]/.test(regPassword) ? '✓' : '○'} Angka Numerik (0-9)
                        </span>
                        <span className={`col-span-2 flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword) ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword) ? '✓' : '○'} Simbol Khusus (!@#$%^&*)
                        </span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Hak Akses / Peran SRE (Role)
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as AuthRole)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="sre_lead">🛡️ Senior SRE Lead (Akses Penuh + CLI + AI Deep Analysis)</option>
                        <option value="sysops">⚡ DevOps / SysOps Engineer (Manajemen Kluster + Restart Pod)</option>
                        <option value="auditor">🔍 Security & Compliance Auditor (Read-Only Telemetri & PDF Audit)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Memproses Pendaftaran...</span>
                          </>
                        ) : (
                          <>
                            <span>Daftarkan Akun & Masuk</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-500 border-t border-slate-800/60">
        <div>
          © 2026 {branding.title || 'Infra Health Control'} · Enterprise SRE Management Platform
        </div>
        <div className="flex items-center gap-4">
          <span>Security Protocol: ISO 27001 / SOC-2</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gateway Online
          </span>
        </div>
      </footer>
    </div>
  );
}
