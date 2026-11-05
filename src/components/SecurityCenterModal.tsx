import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Server, 
  UserX, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Cpu, 
  Globe, 
  Terminal,
  Unlock,
  Ban
} from 'lucide-react';
import { SecurityStats, ActiveSessionInfo, ContainerActivityLog } from '../types';
import { getAuthHeaders } from '../utils/apiClient';

interface SecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function SecurityCenterModal({
  isOpen,
  onClose,
  showToast
}: SecurityCenterModalProps) {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'firewall' | 'audit'>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSecurityStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/security/stats', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('Failed to load security stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSecurityStats();
    }
  }, [isOpen]);

  const handleTerminateSession = async (tokenPrefix: string) => {
    setActionLoading(tokenPrefix);
    try {
      const res = await fetch('/api/security/terminate-session', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tokenPrefix })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast?.('Sesi token berhasil diputus secara instan!', 'success');
        fetchSecurityStats();
      } else {
        showToast?.(data.error || 'Gagal memutuskan sesi.', 'error');
      }
    } catch (err) {
      showToast?.('Gagal menghubungi server.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockIp = async (ip: string) => {
    setActionLoading(ip);
    try {
      const res = await fetch('/api/security/unblock-ip', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ip })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast?.(`IP ${ip} berhasil dipulihkan dari daftar blokir.`, 'success');
        fetchSecurityStats();
      } else {
        showToast?.(data.error || 'Gagal membuka blokir IP.', 'error');
      }
    } catch (err) {
      showToast?.('Gagal menghubungi server.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden font-sans">
        
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Pusat Keamanan & Pemantauan Ancaman SRE
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-black">
                  PROD-HARDENED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                OWASP ASVS Level 2 · ISO 27001 · PBKDF2-SHA512 · IPS Protection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSecurityStats}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Perbarui data metrik keamanan"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-900/40 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-emerald-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Postur Keamanan (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'border-emerald-500 text-emerald-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Sesi Aktif ({stats?.activeSessionsCount || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('firewall')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'firewall'
                ? 'border-emerald-500 text-emerald-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>IPS & Blokir IP ({stats?.currentlyBlockedIps.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Jejak Audit Keamanan</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Security Score Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex flex-col items-center justify-center font-mono">
                    <span className="text-2xl font-black text-emerald-400">99</span>
                    <span className="text-[9px] font-bold text-slate-400">SCORE / 100</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-white">Status Keamanan: HARDENED PRODUKSI</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">GRADE A+</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                      Seluruh sistem telah diperkuat dengan hashing salted PBKDF2 (100.000 iterasi), pencegahan serangan brute-force sliding-window, token CSPRNG 256-bit, dan proteksi otorisasi berbasis peran (RBAC).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 font-mono text-xs text-slate-400 sm:text-right shrink-0">
                  <span className="text-emerald-400 font-bold flex items-center gap-1 sm:justify-end">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    IPS Firewall Aktif
                  </span>
                  <span>Otorisasi RBAC: Ketat</span>
                  <span>Idle Timeout: 2 Jam</span>
                </div>
              </div>

              {/* Security Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
                    <KeyRound className="w-4 h-4" />
                    <span>Enkripsi Password</span>
                  </div>
                  <div className="text-sm font-black text-slate-100 font-mono">PBKDF2-HMAC-SHA512</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    100.000 iterasi per hash dengan salt unik kriptografi acak 16-byte dan verifikasi constant-time.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Brute-Force Shield (IPS)</span>
                  </div>
                  <div className="text-sm font-black text-slate-100 font-mono">Maks 5 Percobaan / 15 Mnt</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Pemblokiran otomatis IP dan akun secara bertingkat saat terdeteksi anomali login.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                    <Globe className="w-4 h-4" />
                    <span>Protokol Enkripsi Jaringan</span>
                  </div>
                  <div className="text-sm font-black text-slate-100 font-mono">TLS 1.3 / ChaCha20</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Enkripsi transit kuat dengan HSTS, CSP no-sniff, dan proteksi clickjacking SAMEORIGIN.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                    <Lock className="w-4 h-4" />
                    <span>Token Sesi Kriptografis</span>
                  </div>
                  <div className="text-sm font-black text-slate-100 font-mono">CSPRNG 256-Bit Hex</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Token tidak dapat ditebak, memiliki masa kadaluarsa 24 jam dan timeout inaktivitas 2 jam.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kebijakan Password Ketat</span>
                  </div>
                  <div className="text-sm font-black text-slate-100 font-mono">Standar ISO 27001</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Wajib minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan karakter khusus.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                    <Terminal className="w-4 h-4" />
                    <span>RBAC Otorisasi Berlapis</span>
                  </div>
                  <div className="text-sm font-black text-slate-100 font-mono">Lead SRE vs Ops vs Auditor</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Endpoint mutasi dilindungi middleware server, melarang eksekusi destruktif tanpa izin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>DAFTAR SESI LOGIN AKTIF YANG TERVERIFIKASI ({stats?.sessions.length || 0})</span>
                <span className="text-indigo-400">Pemberhentian Sesi Berefek Instan</span>
              </div>

              <div className="space-y-2.5">
                {stats?.sessions.map((s, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-sm shrink-0">
                        {s.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{s.name}</span>
                          <span className="text-xs font-mono text-slate-400">(@{s.username})</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                            {s.roleTitle}
                          </span>
                          {s.isCurrentSession && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black">
                              SESI ANDA
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span>Token: <code className="text-slate-300">{s.tokenPrefix}</code></span>
                          <span>•</span>
                          <span>IP: <code className="text-indigo-300">{s.ipAddress}</code></span>
                          <span>•</span>
                          <span>Sisa Waktu: <strong className="text-emerald-400">{s.expiresInMinutes} menit</strong></span>
                        </div>
                      </div>
                    </div>

                    {!s.isCurrentSession && (
                      <button
                        onClick={() => handleTerminateSession(s.tokenPrefix.replace('...', ''))}
                        disabled={actionLoading === s.tokenPrefix.replace('...', '')}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Putus Sesi Paksa</span>
                      </button>
                    )}
                  </div>
                ))}

                {(!stats?.sessions || stats.sessions.length === 0) && (
                  <div className="p-8 text-center text-slate-500 text-xs font-mono">
                    Tidak ada sesi aktif lain.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FIREWALL & BLOCKED IPS */}
          {activeTab === 'firewall' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>INTRUSION PREVENTION SYSTEM (IPS) - DAFTAR IP DIBLOKIR</span>
                <span className="text-amber-400">Ambang: 5 Kegagalan / 15 Menit</span>
              </div>

              {stats?.currentlyBlockedIps && stats.currentlyBlockedIps.length > 0 ? (
                <div className="space-y-2">
                  {stats.currentlyBlockedIps.map((ip) => (
                    <div 
                      key={ip}
                      className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <Ban className="w-4 h-4 text-rose-400" />
                        <div>
                          <span className="font-mono font-bold text-white text-sm">{ip}</span>
                          <span className="text-xs text-rose-300 block font-mono">Status: Diblokir sementara akibat kegagalan autentikasi berulang</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblockIp(ip)}
                        disabled={actionLoading === ip}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Buka Blokir</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 rounded-2xl bg-slate-950/40 border border-slate-800 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <h4 className="text-sm font-bold text-slate-200">Tidak Ada Alamat IP yang Sedang Diblokir</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Seluruh lalu lintas autentikasi dalam batas aman. Total percobaan gagal 24 jam terakhir: {stats?.totalFailedAttempts24h || 0}.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-mono">
                JEJAK REKAM KEAMANAN & AUTENTIKASI SISTEM TERKINI
              </div>

              <div className="space-y-2">
                {stats?.recentSecurityAudit?.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs font-mono"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-200 truncate">{log.summary}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap gap-x-2">
                        <span>Aktor: <strong className="text-slate-300">{log.actor}</strong></span>
                        <span>•</span>
                        <span>IP: <code>{log.ipAddress}</code></span>
                        <span>•</span>
                        <span>Event: <code className="text-indigo-300">{log.eventType}</code></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-500 shrink-0">
          <div>Status: TLS 1.3 Terverifikasi · Equinix Jakarta DC</div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
