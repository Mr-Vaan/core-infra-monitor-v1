import { AuthUser, PresetAccount, AuthRole, UserPermissions } from '../types';

export const rolePermissions: Record<AuthRole, UserPermissions> = {
  sre_lead: {
    canManageClusters: true,
    canTriggerDiagnostics: true,
    canExecuteCommands: true,
    canModifyBranding: true,
    canExportReports: true,
  },
  sysops: {
    canManageClusters: true,
    canTriggerDiagnostics: true,
    canExecuteCommands: true,
    canModifyBranding: false,
    canExportReports: true,
  },
  auditor: {
    canManageClusters: false,
    canTriggerDiagnostics: false,
    canExecuteCommands: false,
    canModifyBranding: false,
    canExportReports: true,
  },
};

export const defaultPresetAccounts: PresetAccount[] = [
  {
    id: 'usr-sre-01',
    username: 'admin',
    name: 'Budi Wicaksono',
    email: 'budi.sre@corp.internal',
    role: 'sre_lead',
    roleTitle: 'Senior SRE Lead & Cloud Architect',
    badgeColor: 'from-purple-600 to-indigo-600',
    description: 'Akses penuh root cluster, AI deep diagnostics, hardware IPMI blink, dan kubectl CLI.',
    defaultPassword: 'password123'
  },
  {
    id: 'usr-ops-02',
    username: 'ops',
    name: 'Rian Pratama',
    email: 'rian.ops@corp.internal',
    role: 'sysops',
    roleTitle: 'DevOps & SysAdmin Engineer',
    badgeColor: 'from-blue-600 to-cyan-600',
    description: 'Manajemen workload kluster, monitoring telemetri, live restart pods, dan ekspor laporan.',
    defaultPassword: 'password123'
  },
  {
    id: 'usr-aud-03',
    username: 'auditor',
    name: 'Siti Rahmawati',
    email: 'siti.audit@corp.internal',
    role: 'auditor',
    roleTitle: 'Security & Compliance Officer',
    badgeColor: 'from-emerald-600 to-teal-600',
    description: 'Akses read-only audit telemetri, jejak aktivitas sistem, dan cetak PDF laporan kepatuhan.',
    defaultPassword: 'password123'
  }
];

const AUTH_STORAGE_KEY = 'infra_health_auth_session';
const REMEMBER_KEY = 'infra_health_remember_me';

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && parsed.username) {
      return parsed as AuthUser;
    }
  } catch (err) {
    console.warn('Failed to parse stored auth session:', err);
  }
  return null;
}

export function saveStoredUser(user: AuthUser, rememberMe: boolean = true) {
  try {
    const serialized = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, serialized);
      localStorage.setItem(REMEMBER_KEY, 'true');
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch (err) {
    console.warn('Failed to save auth session:', err);
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear auth session:', err);
  }
}
