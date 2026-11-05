import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ContainerInfo, 
  ContainerState, 
  DockerStack, 
  DockerImage, 
  ContainerTemplate,
  ContainerLogEntry,
  ContainerActivityLog,
  ContainerAuditEventType
} from '../types';
import { 
  defaultContainers, 
  defaultStacks, 
  defaultImages, 
  defaultTemplates, 
  mockContainerLogs,
  defaultContainerActivityLogs
} from '../data/mockContainers';
import { 
  Boxes, 
  Play, 
  Square, 
  RotateCw, 
  Pause, 
  Terminal as TerminalIcon, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Layers, 
  HardDrive, 
  ShieldAlert, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  Server, 
  X,
  Code2,
  FolderGit2,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  Filter,
  Pencil,
  RotateCcw,
  Undo2,
  AlertCircle,
  Save,
  PlusCircle,
  ScrollText,
  FileSpreadsheet,
  FileJson,
  User,
  Globe
} from 'lucide-react';
import { SwarmDeploymentModal } from './SwarmDeploymentModal';

import { FeatureAnalysisType } from '../types';

interface ContainersViewProps {
  onNavigateToAssistant?: (promptText: string) => void;
  onOpenAiAnalysis?: (feature?: FeatureAnalysisType) => void;
}

type ActiveSubTab = 'containers' | 'stacks' | 'images' | 'templates' | 'trash' | 'audit';
type InspectorTab = 'stats' | 'logs' | 'terminal' | 'env' | 'mounts' | 'ports' | 'ai-diagnose';

export default function ContainersView({ onNavigateToAssistant, onOpenAiAnalysis }: ContainersViewProps) {
  // Main state
  const [containers, setContainers] = useState<ContainerInfo[]>(defaultContainers);
  const [stacks, setStacks] = useState<DockerStack[]>(defaultStacks);
  const [images, setImages] = useState<DockerImage[]>(defaultImages);
  const [templates] = useState<ContainerTemplate[]>(defaultTemplates);

  // Navigation & Sub-views
  const [subTab, setSubTab] = useState<ActiveSubTab>('containers');
  const [filterState, setFilterState] = useState<string>('all'); // 'all' | 'running' | 'stopped' | 'stacks'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Inspector Modal / Drawer
  const [selectedContainer, setSelectedContainer] = useState<ContainerInfo | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('stats');
  const [showSecrets, setShowSecrets] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Logs state
  const [logSearch, setLogSearch] = useState<string>('');
  const [autoScrollLogs, setAutoScrollLogs] = useState<boolean>(true);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Interactive Terminal State
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'input' | 'output' | 'error'; text: string }>>([
    { type: 'output', text: 'Connected to Docker daemon (API v1.47, Linux 6.8.0-45-generic x86_64)' },
    { type: 'output', text: 'Type "help" to view simulated shell commands.' }
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // AI Diagnostics State
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);

  // Deploy Stack Modal
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [showSwarmGuideModal, setShowSwarmGuideModal] = useState<boolean>(false);
  const [newStackName, setNewStackName] = useState<string>('');
  const [newStackYaml, setNewStackYaml] = useState<string>(`services:
  app:
    image: nginx:alpine
    container_name: web-app
    restart: unless-stopped
    ports:
      - "8088:80"`);

  // Toast notification with Undo capability
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (message: string, onUndo?: () => void) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, onUndo });
    toastTimeoutRef.current = setTimeout(() => setToast(null), onUndo ? 5500 : 3500);
  };

  // Create Container State
  const initialCreateForm = {
    name: '',
    image: '',
    stackName: '',
    restartPolicy: 'unless-stopped' as 'always' | 'unless-stopped' | 'on-failure' | 'no',
    command: '',
    ports: [{ host: '8080', container: '80', type: 'tcp' as const }],
    env: [{ key: 'NODE_ENV', value: 'production' }],
    mounts: [{ source: 'app_data', destination: '/app/data', mode: 'rw' as const, type: 'volume' as const }]
  };
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);

  // Edit Container State
  const [editingContainer, setEditingContainer] = useState<ContainerInfo | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    image: '',
    stackName: '',
    restartPolicy: 'unless-stopped' as 'always' | 'unless-stopped' | 'on-failure' | 'no',
    command: '',
    ports: [] as Array<{ host: string; container: string; type: 'tcp' | 'udp' }>,
    env: [] as Array<{ key: string; value: string }>,
    mounts: [] as Array<{ source: string; destination: string; mode: 'rw' | 'ro'; type: 'volume' | 'bind' }>
  });

  // Delete & Trash Confirmation Modals
  const [deleteConfirmContainer, setDeleteConfirmContainer] = useState<ContainerInfo | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<ContainerInfo | null>(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState<boolean>(false);

  // Container Activity & Audit Logs State
  const [activityLogs, setActivityLogs] = useState<ContainerActivityLog[]>(defaultContainerActivityLogs);
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditEventFilter, setAuditEventFilter] = useState<string>('all');
  const [auditContainerFilter, setAuditContainerFilter] = useState<string>('all');
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Export Modal State (supports CSV and JSON format for Activity & Daemon logs)
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportScope, setExportScope] = useState<'audit' | 'container_logs'>('audit');
  const [exportTargetContainerId, setExportTargetContainerId] = useState<string>('all');
  const [exportDateRange, setExportDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');

  // Universal browser file download helper (works in iframe & desktop)
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fetch activity logs from server
  const fetchActivityLogs = async () => {
    try {
      const res = await fetch('/api/containers/activity-logs?limit=300');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs)) {
          setActivityLogs(data.logs);
        }
      }
    } catch {
      // Keep initial mock logs
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // Helper to record an audit activity log entry
  const recordAuditLog = (entry: {
    containerId: string;
    containerName: string;
    image: string;
    eventType: ContainerAuditEventType;
    actor?: string;
    ipAddress?: string;
    status?: 'SUCCESS' | 'WARNING' | 'FAILED' | 'INFO';
    summary: string;
    details?: Record<string, any> | string;
  }) => {
    const newLog: ContainerActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      containerId: entry.containerId,
      containerName: entry.containerName,
      image: entry.image,
      eventType: entry.eventType,
      actor: entry.actor || 'admin@core-infra.internal',
      ipAddress: entry.ipAddress || '192.168.1.100',
      status: entry.status || 'SUCCESS',
      summary: entry.summary,
      details: entry.details
    };
    setActivityLogs(prev => [newLog, ...prev]);

    fetch('/api/containers/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(() => {});
  };

  // Export Container Activity Logs (CSV or JSON)
  const handleExportActivityLogs = (format: 'csv' | 'json', targetContainerId = auditContainerFilter) => {
    let list = [...activityLogs];
    if (targetContainerId && targetContainerId !== 'all') {
      list = list.filter(l => l.containerId === targetContainerId);
    }
    if (auditEventFilter && auditEventFilter !== 'all') {
      list = list.filter(l => l.eventType === auditEventFilter);
    }
    if (auditStatusFilter && auditStatusFilter !== 'all') {
      list = list.filter(l => l.status === auditStatusFilter);
    }
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      list = list.filter(l => 
        l.containerName.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.eventType.toLowerCase().includes(q) ||
        l.image.toLowerCase().includes(q)
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      const jsonStr = JSON.stringify({
        exportMetadata: {
          system: "Core Container Engine - Container Activity & Audit Trail",
          exportDate: new Date().toISOString(),
          totalRecords: list.length,
          exportedBy: "admin@core-infra.internal",
          filters: {
            containerId: targetContainerId,
            eventType: auditEventFilter,
            status: auditStatusFilter,
            search: auditSearch
          }
        },
        auditLogs: list
      }, null, 2);

      downloadFile(jsonStr, `container-activity-audit-${timestamp}.json`, 'application/json;charset=utf-8');
      showToast(`Log aktivitas berhasil diekspor (${list.length} entri JSON)`);
      return;
    }

    // CSV format
    const csvHeaders = ["ID", "Timestamp (UTC)", "Container ID", "Container Name", "Image", "Event Type", "Actor", "IP Address", "Status", "Summary", "Details JSON"];
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = [
      csvHeaders.join(','),
      ...list.map(l => [
        escapeCsv(l.id),
        escapeCsv(l.timestamp),
        escapeCsv(l.containerId),
        escapeCsv(l.containerName),
        escapeCsv(l.image),
        escapeCsv(l.eventType),
        escapeCsv(l.actor),
        escapeCsv(l.ipAddress || ''),
        escapeCsv(l.status),
        escapeCsv(l.summary),
        escapeCsv(l.details || '')
      ].join(','))
    ];

    downloadFile(rows.join('\r\n'), `container-activity-audit-${timestamp}.csv`, 'text/csv;charset=utf-8');
    showToast(`Log aktivitas berhasil diekspor (${list.length} entri CSV)`);
  };

  // Export Container Daemon stdout/stderr logs (CSV or JSON)
  const handleExportContainerLogs = (container: ContainerInfo, format: 'csv' | 'json') => {
    const logs = mockContainerLogs[container.id] || [
      { timestamp: new Date().toISOString(), stream: 'stdout', message: `Standard daemon logs active for ${container.name}` }
    ];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      const jsonStr = JSON.stringify({
        containerId: container.id,
        containerName: container.name,
        image: container.image,
        exportDate: new Date().toISOString(),
        totalLines: logs.length,
        logs
      }, null, 2);

      downloadFile(jsonStr, `container-${container.name}-logs-${timestamp}.json`, 'application/json;charset=utf-8');
      showToast(`Log daemon "${container.name}" diekspor (${logs.length} baris JSON)`);
      return;
    }

    // CSV format
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows = [
      ["Timestamp (UTC)", "Stream", "Container ID", "Container Name", "Message"].join(','),
      ...logs.map(l => [
        escapeCsv(l.timestamp),
        escapeCsv(l.stream),
        escapeCsv(container.id),
        escapeCsv(container.name),
        escapeCsv(l.message)
      ].join(','))
    ];

    downloadFile(rows.join('\r\n'), `container-${container.name}-logs-${timestamp}.csv`, 'text/csv;charset=utf-8');
    showToast(`Log daemon "${container.name}" diekspor (${logs.length} baris CSV)`);
  };

  // Live simulation: slightly fluctuate CPU & RAM for running containers to feel real like Arcane
  useEffect(() => {
    const timer = setInterval(() => {
      setContainers(prev => prev.map(c => {
        if (c.state !== 'running' || c.isDeleted) return c;
        const cpuDelta = (Math.random() - 0.48) * 0.4;
        const newCpu = Math.max(0.1, Math.min(95, Math.round((c.stats.cpuPercent + cpuDelta) * 10) / 10));
        
        const netRxDelta = Math.floor(Math.random() * 45000);
        const netTxDelta = Math.floor(Math.random() * 62000);

        return {
          ...c,
          stats: {
            ...c.stats,
            cpuPercent: newCpu,
            networkRxBytes: c.stats.networkRxBytes + netRxDelta,
            networkTxBytes: c.stats.networkTxBytes + netTxDelta
          }
        };
      }));
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Update selected container reference when containers state changes
  useEffect(() => {
    if (selectedContainer) {
      const updated = containers.find(c => c.id === selectedContainer.id);
      if (updated) setSelectedContainer(updated);
    }
  }, [containers]);

  // Handle Container Lifecycle Action
  const handleContainerAction = async (id: string, action: 'start' | 'stop' | 'restart' | 'pause' | 'unpause' | 'remove') => {
    setActionLoadingId(`${id}-${action}`);
    try {
      const res = await fetch(`/api/containers/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const data = await res.json();
        if (action === 'remove') {
          const target = containers.find(c => c.id === id);
          setContainers(prev => prev.map(c => c.id === id ? {
            ...c,
            isDeleted: true,
            deletedAt: new Date().toISOString(),
            state: 'stopped',
            status: 'Di Tempat Sampah'
          } : c));
          if (selectedContainer?.id === id) setSelectedContainer(null);
          showToast(
            `Container "${target?.name || id}" dipindahkan ke Tempat Sampah.`,
            () => handleRestoreContainer(id, target?.name)
          );
        } else if (data.container) {
          setContainers(prev => prev.map(c => c.id === id ? data.container : c));
          showToast(`Action ${action} berhasil dijalankan pada ${data.container.name}.`);
        }
      } else {
        // Local fallback update
        setContainers(prev => prev.map(c => {
          if (c.id !== id) return c;
          if (action === 'start' || action === 'unpause') {
            return { ...c, state: 'running', status: 'Up just now (healthy)', stats: { ...c.stats, cpuPercent: 1.2 } };
          }
          if (action === 'stop') {
            return { ...c, state: 'stopped', status: 'Exited (0) just now', stats: { ...c.stats, cpuPercent: 0, pids: 0 } };
          }
          if (action === 'pause') {
            return { ...c, state: 'paused', status: 'Paused', stats: { ...c.stats, cpuPercent: 0 } };
          }
          if (action === 'remove') {
            return { ...c, isDeleted: true, deletedAt: new Date().toISOString(), state: 'stopped', status: 'Di Tempat Sampah' };
          }
          return c;
        }));
        showToast(`Action ${action} berhasil diterapkan.`);
      }
    } catch {
      // Offline fallback
      setContainers(prev => prev.map(c => {
        if (c.id !== id) return c;
        if (action === 'start') return { ...c, state: 'running', status: 'Up just now' };
        if (action === 'stop') return { ...c, state: 'stopped', status: 'Exited (0)' };
        if (action === 'remove') return { ...c, isDeleted: true, deletedAt: new Date().toISOString(), state: 'stopped' };
        return c;
      }));
      showToast(`Action ${action} diterapkan (mode offline).`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Edit Container Modal
  const handleOpenEdit = (container: ContainerInfo) => {
    setEditingContainer(container);
    setEditForm({
      name: container.name,
      image: container.image,
      stackName: container.stackName || '',
      restartPolicy: container.restartPolicy || 'unless-stopped',
      command: container.command || '',
      ports: container.ports && container.ports.length > 0 
        ? container.ports.map(p => ({
            host: p.publicPort ? String(p.publicPort) : '',
            container: String(p.privatePort),
            type: p.type || 'tcp'
          }))
        : [{ host: '', container: '80', type: 'tcp' }],
      env: container.env && Object.keys(container.env).length > 0
        ? Object.entries(container.env).map(([k, v]) => ({ key: k, value: v }))
        : [{ key: '', value: '' }],
      mounts: container.mounts && container.mounts.length > 0
        ? container.mounts.map(m => ({
            source: m.source,
            destination: m.destination,
            mode: m.mode || 'rw',
            type: m.type || 'volume'
          }))
        : []
    });
  };

  // Submit Create Container
  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.image.trim()) {
      showToast('Nama container dan Image wajib diisi.');
      return;
    }

    const formattedPorts = createForm.ports
      .filter(p => p.container.trim())
      .map(p => ({
        ip: '0.0.0.0',
        privatePort: parseInt(p.container.trim(), 10) || 80,
        publicPort: p.host.trim() ? parseInt(p.host.trim(), 10) : undefined,
        type: p.type
      }));

    const formattedEnv: Record<string, string> = {};
    createForm.env.forEach(item => {
      if (item.key.trim()) {
        formattedEnv[item.key.trim()] = item.value;
      }
    });

    const formattedMounts = createForm.mounts
      .filter(m => m.destination.trim())
      .map(m => ({
        source: m.source.trim() || `vol_${createForm.name}_${Date.now().toString(36)}`,
        destination: m.destination.trim(),
        mode: m.mode,
        type: m.type
      }));

    const payload = {
      name: createForm.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      image: createForm.image.trim(),
      stackName: createForm.stackName.trim() || undefined,
      restartPolicy: createForm.restartPolicy,
      command: createForm.command.trim() || '/bin/sh -c "exec daemon"',
      ports: formattedPorts,
      env: formattedEnv,
      mounts: formattedMounts
    };

    try {
      const res = await fetch('/api/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setContainers(prev => [data.container, ...prev]);
        showToast(`Container "${data.container.name}" berhasil dibuat dan dijalankan!`);
      } else {
        throw new Error('Failed to create on server');
      }
    } catch {
      // Local fallback
      const generatedId = Math.random().toString(36).substring(2, 12);
      const newLocalContainer: ContainerInfo = {
        id: generatedId,
        name: payload.name,
        image: payload.image,
        imageId: `sha256:${Math.random().toString(16).substring(2, 14)}`,
        state: 'running',
        status: 'Up just now (healthy)',
        created: 'Just now',
        stackName: payload.stackName,
        ports: formattedPorts,
        mounts: formattedMounts,
        env: formattedEnv,
        command: payload.command,
        stats: {
          cpuPercent: 0.8,
          memoryUsageBytes: 67108864,
          memoryLimitBytes: 1073741824,
          memoryPercent: 6.2,
          networkRxBytes: 25000,
          networkTxBytes: 18000,
          blockReadBytes: 120000,
          blockWriteBytes: 60000,
          pids: 6,
          uptime: '1m'
        },
        vulnerabilities: { critical: 0, high: 0, medium: 1, low: 2 },
        healthStatus: 'healthy',
        restartPolicy: payload.restartPolicy,
        updateAvailable: false,
        isDeleted: false
      };
      setContainers(prev => [newLocalContainer, ...prev]);
      showToast(`Container "${newLocalContainer.name}" dibuat (offline mode).`);
    }

    setShowCreateModal(false);
    setCreateForm(initialCreateForm);
    setSubTab('containers');
  };

  // Submit Edit Container
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContainer) return;
    if (!editForm.name.trim() || !editForm.image.trim()) {
      showToast('Nama dan image container tidak boleh kosong.');
      return;
    }

    const formattedPorts = editForm.ports
      .filter(p => p.container.trim())
      .map(p => ({
        ip: '0.0.0.0',
        privatePort: parseInt(p.container.trim(), 10) || 80,
        publicPort: p.host.trim() ? parseInt(p.host.trim(), 10) : undefined,
        type: p.type
      }));

    const formattedEnv: Record<string, string> = {};
    editForm.env.forEach(item => {
      if (item.key.trim()) {
        formattedEnv[item.key.trim()] = item.value;
      }
    });

    const formattedMounts = editForm.mounts
      .filter(m => m.destination.trim())
      .map(m => ({
        source: m.source.trim(),
        destination: m.destination.trim(),
        mode: m.mode,
        type: m.type
      }));

    const updatePayload = {
      name: editForm.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      image: editForm.image.trim(),
      stackName: editForm.stackName.trim() || undefined,
      restartPolicy: editForm.restartPolicy,
      command: editForm.command.trim() || editingContainer.command,
      ports: formattedPorts,
      env: formattedEnv,
      mounts: formattedMounts
    };

    try {
      const res = await fetch(`/api/containers/${editingContainer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      if (res.ok) {
        const data = await res.json();
        setContainers(prev => prev.map(c => c.id === editingContainer.id ? data.container : c));
        if (selectedContainer?.id === editingContainer.id) {
          setSelectedContainer(data.container);
        }
        showToast(`Konfigurasi container "${data.container.name}" berhasil diperbarui.`);
      } else {
        throw new Error('Edit failed on server');
      }
    } catch {
      // Local fallback
      setContainers(prev => prev.map(c => {
        if (c.id !== editingContainer.id) return c;
        const updated = {
          ...c,
          name: updatePayload.name,
          image: updatePayload.image,
          stackName: updatePayload.stackName,
          restartPolicy: updatePayload.restartPolicy,
          command: updatePayload.command,
          ports: formattedPorts,
          env: formattedEnv,
          mounts: formattedMounts
        };
        if (selectedContainer?.id === editingContainer.id) {
          setSelectedContainer(updated);
        }
        return updated;
      }));
      showToast(`Konfigurasi "${updatePayload.name}" diperbarui (offline mode).`);
    }

    setEditingContainer(null);
  };

  // Handle Delete Container (Soft or Permanent)
  const handleDeleteContainer = async (container: ContainerInfo, permanent = false) => {
    try {
      const res = await fetch(`/api/containers/${container.id}?permanent=${permanent}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (permanent) {
          setContainers(prev => prev.filter(c => c.id !== container.id));
          showToast(`Container "${container.name}" dihapus secara permanen.`);
        } else {
          setContainers(prev => prev.map(c => c.id === container.id ? {
            ...c,
            isDeleted: true,
            deletedAt: new Date().toISOString(),
            state: 'stopped',
            status: 'Di Tempat Sampah'
          } : c));
          showToast(
            `Container "${container.name}" dipindahkan ke Tempat Sampah.`,
            () => handleRestoreContainer(container.id, container.name)
          );
        }
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      // Local fallback
      if (permanent) {
        setContainers(prev => prev.filter(c => c.id !== container.id));
        showToast(`Container "${container.name}" dihapus permanen.`);
      } else {
        setContainers(prev => prev.map(c => c.id === container.id ? {
          ...c,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          state: 'stopped',
          status: 'Di Tempat Sampah'
        } : c));
        showToast(
          `Container "${container.name}" dipindahkan ke Tempat Sampah.`,
          () => handleRestoreContainer(container.id, container.name)
        );
      }
    } finally {
      setDeleteConfirmContainer(null);
      setPermanentDeleteTarget(null);
      if (selectedContainer?.id === container.id) {
        setSelectedContainer(null);
      }
    }
  };

  // Handle Restore Container from Trash
  const handleRestoreContainer = async (id: string, name?: string) => {
    setActionLoadingId(`${id}-restore`);
    try {
      const res = await fetch(`/api/containers/${id}/restore`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setContainers(prev => prev.map(c => c.id === id ? data.container : c));
        showToast(`Container "${name || id}" berhasil dipulihkan!`);
      } else {
        throw new Error('Restore failed');
      }
    } catch {
      setContainers(prev => prev.map(c => c.id === id ? {
        ...c,
        isDeleted: false,
        deletedAt: undefined,
        state: 'stopped',
        status: 'Exited (0) - Dipulihkan'
      } : c));
      showToast(`Container "${name || id}" dipulihkan (mode offline).`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Restore All Containers from Trash
  const handleRestoreAll = async () => {
    try {
      await fetch('/api/containers/trash/restore-all', { method: 'POST' });
    } catch {}
    setContainers(prev => prev.map(c => c.isDeleted ? {
      ...c,
      isDeleted: false,
      deletedAt: undefined,
      state: 'stopped',
      status: 'Exited (0) - Dipulihkan'
    } : c));
    showToast('Semua container di tempat sampah berhasil dipulihkan!');
  };

  // Purge / Empty Trash permanently
  const handlePurgeTrash = async () => {
    try {
      await fetch('/api/containers/trash/purge', { method: 'DELETE' });
    } catch {}
    setContainers(prev => prev.filter(c => !c.isDeleted));
    setShowPurgeConfirm(false);
    showToast('Tempat sampah berhasil dikosongkan.');
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Run AI container diagnostics
  const handleRunAiDiagnosis = async (container: ContainerInfo) => {
    setIsDiagnosing(true);
    setDiagnosisResult(null);
    try {
      const res = await fetch('/api/containers/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container })
      });
      if (res.ok) {
        const data = await res.json();
        setDiagnosisResult(data.analysis);
      } else {
        setDiagnosisResult(`### 🩺 Diagnosa Container: ${container.name}
- Kondisi resource: RAM ${(container.stats?.memoryPercent || 0)}%, CPU ${(container.stats?.cpuPercent || 0)}%.
- Evaluasi keamanan: Tidak terdeteksi privilege escalation berlebih.
- Rekomendasi: Pertahankan restart policy ${container.restartPolicy} dan batasi swap limit.`);
      }
    } catch {
      setDiagnosisResult(`### 🩺 Diagnosa Container: ${container.name}
- Status: Berjalan normal.
- Rekomendasi: Konfigurasikan pemantauan log berkala.`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Handle Terminal Execution
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    const newHistory = [...terminalHistory, { type: 'input' as const, text: `$ ${cmd}` }];
    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      setTerminalHistory([]);
      setTerminalInput('');
      return;
    }

    let output = '';
    let isError = false;

    if (lower === 'help') {
      output = `Available simulated commands:
  ls [-la]             List directory contents
  ps [aux]             Show running container processes
  top                  Display CPU & process resource metrics
  df -h                Display disk filesystem usage
  env                  Inspect environment variables
  cat /etc/os-release  Display container Linux distribution
  whoami               Current container user
  uptime               Current container uptime
  uname -a             Kernel system architecture
  clear                Clear terminal output`;
    } else if (lower === 'whoami') {
      output = selectedContainer?.name.includes('postgres') ? 'postgres (uid=70 gid=70)' : 'root (uid=0 gid=0)';
    } else if (lower.startsWith('ls')) {
      output = `drwxr-xr-x   1 root root  4096 Oct 18 10:14 bin
drwxr-xr-x   2 root root  4096 Aug 12 04:12 boot
drwxr-xr-x   5 root root  4096 Oct 18 10:14 dev
drwxr-xr-x   1 root root  4096 Oct 20 08:00 etc
drwxr-xr-x   1 root root  4096 Oct 18 10:14 home
drwxr-xr-x   1 root root  4096 Aug 12 04:12 lib
drwxr-xr-x   5 root root  4096 Oct 20 08:00 media
drwxr-xr-x   2 root root  4096 Aug 12 04:12 mnt
dr-xr-xr-x 248 root root     0 Oct 20 08:00 proc
drwx------   1 root root  4096 Oct 20 09:12 root
dr-xr-xr-x  13 root root     0 Oct 20 08:00 sys
drwxrwxrwt   1 root root  4096 Oct 20 09:40 tmp
drwxr-xr-x   1 root root  4096 Oct 18 10:14 var`;
    } else if (lower.startsWith('ps')) {
      output = `PID   USER     TIME  COMMAND
    1 root      0:14 ${selectedContainer?.command || '/bin/sh'}
   24 root      0:02 worker-process --pool=4
   48 root      0:00 /bin/sh -c exec-sh`;
    } else if (lower === 'top') {
      output = `Mem: ${Math.round(selectedContainer?.stats.memoryUsageBytes ? selectedContainer.stats.memoryUsageBytes / 1024 / 1024 : 120)}M used, ${Math.round(selectedContainer?.stats.memoryLimitBytes ? selectedContainer.stats.memoryLimitBytes / 1024 / 1024 : 1024)}M free
CPU:  ${selectedContainer?.stats.cpuPercent || 1.2}% usr,  0.4% sys,  0.0% nic, 98.4% idle
Load average: 0.12, 0.08, 0.04`;
    } else if (lower.startsWith('df')) {
      output = `Filesystem           1K-blocks      Used Available Use% Mounted on
overlay               61865880  12480112  46209848  21% /
tmpfs                    65536         0     65536   0% /dev
/dev/nvme0n1p2        61865880  12480112  46209848  21% /etc/hosts
shm                      65536         0     65536   0% /dev/shm`;
    } else if (lower === 'env') {
      const envLines = selectedContainer?.env ? Object.entries(selectedContainer.env).map(([k, v]) => `${k}=${v}`).join('\n') : 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin';
      output = envLines;
    } else if (lower.includes('os-release')) {
      output = `NAME="Alpine Linux"
ID=alpine
VERSION_ID=3.20.3
PRETTY_NAME="Alpine Linux v3.20"
HOME_URL="https://alpinelinux.org/"
BUG_REPORT_URL="https://gitlab.alpinelinux.org/alpine/aports/-/issues"`;
    } else if (lower === 'uptime') {
      output = `09:45:12 up 14 days,  6:32,  load average: 0.14, 0.09, 0.06`;
    } else if (lower.startsWith('uname')) {
      output = `Linux ${selectedContainer?.name || 'container'} 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 Linux`;
    } else {
      output = `sh: command not found: ${cmd}. Type "help" for a list of available commands.`;
      isError = true;
    }

    newHistory.push({ type: isError ? 'error' : 'output', text: output });
    setTerminalHistory(newHistory);
    setTerminalInput('');

    setTimeout(() => {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Deploy New Stack
  const handleDeployStack = () => {
    if (!newStackName.trim()) {
      showToast('Masukkan nama stack terlebih dahulu.');
      return;
    }

    const newStack: DockerStack = {
      id: `stack-${Date.now().toString(36)}`,
      name: newStackName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      status: 'active',
      servicesCount: Math.max(1, (newStackYaml.match(/image:/g) || []).length),
      containers: [],
      composeYaml: newStackYaml,
      updatedAt: new Date().toISOString()
    };

    setStacks(prev => [newStack, ...prev]);
    setShowDeployModal(false);
    setNewStackName('');
    showToast(`Stack "${newStack.name}" berhasil di-deploy!`);
  };

  // Stack Action (Restart, Down, Up)
  const handleStackAction = (stackId: string, action: 'restart' | 'down' | 'up') => {
    setStacks(prev => prev.map(s => {
      if (s.id !== stackId) return s;
      if (action === 'down') return { ...s, status: 'inactive' };
      if (action === 'up' || action === 'restart') return { ...s, status: 'active', updatedAt: new Date().toISOString() };
      return s;
    }));
    showToast(`Stack action ${action} berhasil diterapkan.`);
  };

  // Prune unused images
  const handlePruneImages = () => {
    const beforeCount = images.length;
    setImages(prev => prev.filter(img => img.inUse));
    const pruned = beforeCount - images.filter(img => img.inUse).length;
    showToast(`Berhasil membersihkan ${pruned} image yang tidak aktif.`);
  };

  // Deploy template shortcut
  const handleDeployTemplate = (tpl: ContainerTemplate) => {
    setNewStackName(tpl.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    setNewStackYaml(tpl.composeYaml);
    setShowDeployModal(true);
    setSubTab('stacks');
  };

  // Active containers (not in trash)
  const activeContainers = useMemo(() => containers.filter(c => !c.isDeleted), [containers]);
  // Trashed containers
  const trashedContainers = useMemo(() => containers.filter(c => Boolean(c.isDeleted)), [containers]);

  // Filtered active containers
  const filteredContainers = useMemo(() => {
    return activeContainers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.image.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.stackName && c.stackName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterState === 'running') return c.state === 'running';
      if (filterState === 'stopped') return c.state === 'stopped' || c.state === 'exited';
      if (filterState === 'stacks') return Boolean(c.stackName);

      return true;
    });
  }, [activeContainers, searchQuery, filterState]);

  // Filtered trash containers
  const filteredTrashContainers = useMemo(() => {
    return trashedContainers.filter(c => {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.image.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.stackName && c.stackName.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [trashedContainers, searchQuery]);

  // Filtered Activity & Audit Logs
  const filteredActivityLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const q = auditSearch.trim().toLowerCase();
      const matchesSearch = !q || 
        log.containerName.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.eventType.toLowerCase().includes(q) ||
        log.image.toLowerCase().includes(q);
      
      const matchesContainer = auditContainerFilter === 'all' || log.containerId === auditContainerFilter;
      const matchesEvent = auditEventFilter === 'all' || log.eventType === auditEventFilter;
      const matchesStatus = auditStatusFilter === 'all' || log.status === auditStatusFilter;

      return matchesSearch && matchesContainer && matchesEvent && matchesStatus;
    });
  }, [activityLogs, auditSearch, auditContainerFilter, auditEventFilter, auditStatusFilter]);

  // Aggregate stats (Arcane style metrics bar) based on active containers
  const runningCount = activeContainers.filter(c => c.state === 'running').length;
  const stoppedCount = activeContainers.filter(c => c.state === 'stopped' || c.state === 'exited').length;
  const pausedCount = activeContainers.filter(c => c.state === 'paused').length;
  const totalContainers = activeContainers.length;

  const totalCpuPercent = Math.round(
    activeContainers.filter(c => c.state === 'running').reduce((sum, c) => sum + c.stats.cpuPercent, 0) * 10
  ) / 10;

  const totalMemUsedMB = Math.round(
    activeContainers.filter(c => c.state === 'running').reduce((sum, c) => sum + (c.stats.memoryUsageBytes || 0), 0) / 1024 / 1024
  );

  const totalVulnerabilities = activeContainers.reduce((acc, c) => ({
    critical: acc.critical + (c.vulnerabilities?.critical || 0),
    high: acc.high + (c.vulnerabilities?.high || 0)
  }), { critical: 0, high: 0 });

  return (
    <div className="space-y-6">
      {/* Toast Alert with Undo button */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-sm font-sans">{toast.message}</span>
          {toast.onUndo && (
            <button
              onClick={() => {
                toast.onUndo?.();
                setToast(null);
              }}
              className="ml-2 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pulihkan (Undo)</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner / Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-sans text-slate-100 tracking-tight">
                  Container Management
                </h2>
                <span className="text-2xs font-mono font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md">
                  Core Container Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring lifecycle, Docker Compose stacks, real-time logs, web terminal, dan analisis kerentanan CVE
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAiAnalysis && (
            <button
              onClick={() => onOpenAiAnalysis('containers')}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer group"
              title="Audit & Analisis AI Keamanan serta Efisiensi Container"
            >
              <Sparkles className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform animate-pulse" />
              <span>Analisis AI Container</span>
            </button>
          )}

          <button
            onClick={() => {
              setCreateForm(initialCreateForm);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Container</span>
          </button>

          <button
            onClick={() => setShowDeployModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Stack</span>
          </button>

          <button
            onClick={() => {
              setContainers(prev => prev.map(c => ({
                ...c,
                stats: {
                  ...c.stats,
                  cpuPercent: Math.max(0.2, Math.round((c.stats.cpuPercent + (Math.random() - 0.5)) * 10) / 10)
                }
              })));
              showToast('Metrik container disinkronkan.');
            }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700/90 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/10"
            title="Ekspor Log Aktivitas & Jejak Audit (CSV / JSON)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Log</span>
          </button>

          <button
            onClick={() => setShowSwarmGuideModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/10"
            title="Panduan Deployment Docker & Docker Swarm (HA)"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Panduan Swarm</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry Metric Strip (Arcane style) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/60 border border-slate-800/70 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Running Containers</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{runningCount}</span>
            <span className="text-xs font-mono text-slate-500">/ {totalContainers} active</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            {stoppedCount} stopped · {pausedCount} paused
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/70 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total CPU Load</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{totalCpuPercent}%</span>
            <span className="text-xs text-slate-500">allocated</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, totalCpuPercent * 2)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/70 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Memory Allocation</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{totalMemUsedMB} MB</span>
            <span className="text-xs text-slate-500">in use</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500 font-mono">
            Host limit: 16.0 GB (31.4% total)
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/70 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Security & Trivy CVE</span>
            <ShieldAlert className={`w-4 h-4 ${totalVulnerabilities.critical > 0 ? 'text-rose-400' : 'text-amber-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${totalVulnerabilities.critical > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {totalVulnerabilities.critical}
            </span>
            <span className="text-xs text-slate-500 font-medium">Critical CVEs</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            {totalVulnerabilities.high} high severity issues detected
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Containers | Stacks | Images | Templates | Sampah (Trash) | Aktivitas & Audit */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSubTab('containers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'containers' 
                ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Containers</span>
            <span className={`text-2xs font-mono px-1.5 py-0.2 rounded-md ${
              subTab === 'containers' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {activeContainers.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('stacks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'stacks' 
                ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stacks (Compose)</span>
            <span className={`text-2xs font-mono px-1.5 py-0.2 rounded-md ${
              subTab === 'stacks' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {stacks.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('images')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'images' 
                ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Images</span>
            <span className={`text-2xs font-mono px-1.5 py-0.2 rounded-md ${
              subTab === 'images' ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {images.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('templates')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'templates' 
                ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>App Templates</span>
          </button>

          <button
            onClick={() => setSubTab('trash')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'trash' 
                ? 'bg-rose-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sampah (Trash)</span>
            {trashedContainers.length > 0 && (
              <span className={`text-2xs font-mono px-1.5 py-0.2 rounded-md ${
                subTab === 'trash' ? 'bg-rose-700 text-white' : 'bg-rose-950/80 text-rose-400 border border-rose-800/40'
              }`}>
                {trashedContainers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'audit' 
                ? 'bg-cyan-600 text-white shadow-sm font-semibold' 
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Aktivitas & Audit</span>
            <span className={`text-2xs font-mono px-1.5 py-0.2 rounded-md ${
              subTab === 'audit' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-cyan-400'
            }`}>
              {activityLogs.length}
            </span>
          </button>
        </div>

        {/* Search bar & quick filter */}
        {(subTab === 'containers' || subTab === 'trash') && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={subTab === 'trash' ? 'Cari container terhapus...' : 'Cari container, image, stack...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter segmented buttons (only for containers subTab) */}
            {subTab === 'containers' && (
              <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
                {(['all', 'running', 'stopped', 'stacks'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setFilterState(filterKey)}
                    className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-all cursor-pointer capitalize ${
                      filterState === filterKey 
                        ? 'bg-slate-800 text-slate-100 font-semibold shadow-xs' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: CONTAINERS LIST */}
      {/* ============================================================== */}
      {subTab === 'containers' && (
        <div className="space-y-4">
          {filteredContainers.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <Boxes className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">Tidak ada container ditemukan</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Silakan ubah kata kunci pencarian atau bersihkan filter status untuk melihat container lainnya.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setFilterState('all'); }}
                className="mt-4 px-3.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-950/40 text-2xs font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 pl-5 pr-3">Container & Image</th>
                      <th className="py-3.5 px-3">State & Uptime</th>
                      <th className="py-3.5 px-3">CPU / Memory</th>
                      <th className="py-3.5 px-3">Ports</th>
                      <th className="py-3.5 px-3">Stack</th>
                      <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs">
                    {filteredContainers.map((container) => {
                      const isRunning = container.state === 'running';
                      const isPaused = container.state === 'paused';
                      const isStopped = container.state === 'stopped' || container.state === 'exited';

                      return (
                        <tr 
                          key={container.id}
                          className="hover:bg-slate-800/30 transition-colors group"
                        >
                          {/* Container name & Image */}
                          <td className="py-3.5 pl-5 pr-3">
                            <div className="flex items-start gap-3">
                              <div className="pt-0.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  isRunning ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' :
                                  isPaused ? 'bg-amber-400' : 'bg-slate-600'
                                }`} />
                              </div>
                              <div>
                                <button
                                  onClick={() => {
                                    setSelectedContainer(container);
                                    setInspectorTab('stats');
                                  }}
                                  className="font-semibold text-slate-100 hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                                >
                                  <span>{container.name}</span>
                                  {container.updateAvailable && (
                                    <span className="text-[10px] font-mono text-amber-400 font-normal">
                                      · update
                                    </span>
                                  )}
                                </button>
                                <div className="flex items-center gap-2 mt-0.5 text-2xs text-slate-400 font-mono">
                                  <span>{container.image}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-slate-500">{container.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* State & Uptime */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col">
                              <span className={`font-mono text-2xs capitalize ${
                                isRunning ? 'text-emerald-400 font-medium' :
                                isPaused ? 'text-amber-400' : 'text-slate-400'
                              }`}>
                                {container.state}
                              </span>
                              <span className="text-2xs text-slate-400 mt-0.5 truncate max-w-[130px]" title={container.status}>
                                {container.status}
                              </span>
                            </div>
                          </td>

                          {/* CPU / Memory Gauges */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1.5 w-36">
                              {/* CPU */}
                              <div>
                                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                  <span>CPU</span>
                                  <span className={isRunning ? 'text-slate-200' : 'text-slate-600'}>
                                    {container.stats.cpuPercent}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      container.stats.cpuPercent > 80 ? 'bg-rose-500' :
                                      container.stats.cpuPercent > 40 ? 'bg-amber-400' : 'bg-cyan-400'
                                    }`}
                                    style={{ width: `${Math.min(100, container.stats.cpuPercent)}%` }}
                                  />
                                </div>
                              </div>

                              {/* RAM */}
                              <div>
                                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                                  <span>RAM</span>
                                  <span className={isRunning ? 'text-slate-200' : 'text-slate-600'}>
                                    {Math.round(container.stats.memoryUsageBytes / 1024 / 1024)} MB ({container.stats.memoryPercent}%)
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                                  <div 
                                    className="bg-indigo-400 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, container.stats.memoryPercent)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Ports */}
                          <td className="py-3.5 px-3">
                            {container.ports.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {container.ports.slice(0, 2).map((port, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-2xs font-mono text-slate-300">
                                    <span>
                                      {port.publicPort ? `${port.publicPort}:${port.privatePort}` : `${port.privatePort}`}
                                    </span>
                                    <span className="text-slate-500">/{port.type}</span>
                                    {port.publicPort && (
                                      <a 
                                        href={`http://localhost:${port.publicPort}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-slate-500 hover:text-blue-400 transition-colors"
                                        title={`Buka http://localhost:${port.publicPort}`}
                                      >
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    )}
                                  </div>
                                ))}
                                {container.ports.length > 2 && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    +{container.ports.length - 2} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-2xs text-slate-500 font-mono">-</span>
                            )}
                          </td>

                          {/* Stack */}
                          <td className="py-3.5 px-3">
                            {container.stackName ? (
                              <button
                                onClick={() => {
                                  setSubTab('stacks');
                                }}
                                className="text-xs font-mono text-slate-300 hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Layers className="w-3 h-3 text-slate-500" />
                                <span>{container.stackName}</span>
                              </button>
                            ) : (
                              <span className="text-2xs text-slate-500">Standalone</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 pr-5 pl-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Start / Stop toggle */}
                              {isRunning ? (
                                <button
                                  onClick={() => handleContainerAction(container.id, 'stop')}
                                  disabled={actionLoadingId === `${container.id}-stop`}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Stop container"
                                >
                                  <Square className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleContainerAction(container.id, 'start')}
                                  disabled={actionLoadingId === `${container.id}-start`}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Start container"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Restart */}
                              <button
                                onClick={() => handleContainerAction(container.id, 'restart')}
                                disabled={actionLoadingId === `${container.id}-restart`}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Restart container"
                              >
                                <RotateCw className={`w-3.5 h-3.5 ${actionLoadingId === `${container.id}-restart` ? 'animate-spin' : ''}`} />
                              </button>

                              {/* Logs shortcut */}
                              <button
                                onClick={() => {
                                  setSelectedContainer(container);
                                  setInspectorTab('logs');
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="View Logs"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {/* Terminal shortcut */}
                              <button
                                onClick={() => {
                                  setSelectedContainer(container);
                                  setInspectorTab('terminal');
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Exec Shell / Terminal"
                              >
                                <TerminalIcon className="w-3.5 h-3.5" />
                              </button>

                              {/* AI Diagnostics shortcut */}
                              <button
                                onClick={() => {
                                  setSelectedContainer(container);
                                  setInspectorTab('ai-diagnose');
                                  handleRunAiDiagnosis(container);
                                }}
                                className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 transition-colors cursor-pointer"
                                title="AI Container Audit"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Container */}
                              <button
                                onClick={() => handleOpenEdit(container)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit container"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Container */}
                              <button
                                onClick={() => setDeleteConfirmContainer(container)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Hapus container"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: DOCKER COMPOSE STACKS */}
      {/* ============================================================== */}
      {subTab === 'stacks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Docker Compose Stacks</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola file compose multi-container, restart services, dan sinkronisasi konfigurasi stack
              </p>
            </div>
            <button
              onClick={() => setShowDeployModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy New Stack</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stacks.map((stack) => (
              <div 
                key={stack.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-800/80 text-blue-400 rounded-xl">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold font-mono text-slate-100">{stack.name}</h4>
                        <div className="flex items-center gap-2 text-2xs text-slate-400 mt-0.5">
                          <span>{stack.servicesCount} services</span>
                          <span aria-hidden="true">·</span>
                          <span className={stack.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}>
                            {stack.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stack quick actions */}
                    <div className="flex items-center gap-1">
                      {stack.status === 'active' ? (
                        <button
                          onClick={() => handleStackAction(stack.id, 'down')}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Stop Stack (docker compose down)"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStackAction(stack.id, 'up')}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Start Stack (docker compose up -d)"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStackAction(stack.id, 'restart')}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Restart Stack"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* YAML preview snippet */}
                  <div className="mt-4 bg-slate-950/80 border border-slate-800/70 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-36">
                    <pre>{stack.composeYaml}</pre>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-2xs text-slate-500 font-mono">
                  <span>Updated: {new Date(stack.updatedAt).toLocaleDateString('id-ID')}</span>
                  <button
                    onClick={() => {
                      setNewStackName(stack.name);
                      setNewStackYaml(stack.composeYaml);
                      setShowDeployModal(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Edit YAML</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: DOCKER IMAGES & VULNERABILITIES */}
      {/* ============================================================== */}
      {subTab === 'images' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Docker Images & Vulnerabilities</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daftar cache image lokal dan hasil pemindaian keamanan Trivy
              </p>
            </div>
            <button
              onClick={handlePruneImages}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-slate-300 text-xs font-medium rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Prune Unused Images</span>
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-2xs font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 pl-5 pr-3">Repository & Tag</th>
                    <th className="py-3.5 px-3">Size</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Security Scan (Trivy CVE)</th>
                    <th className="py-3.5 pr-5 pl-3 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {images.map((img) => (
                    <tr key={img.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="font-mono font-semibold text-slate-200">
                          {img.repository}:{img.tag}
                        </div>
                        <div className="text-2xs font-mono text-slate-500 mt-0.5">
                          {img.id.slice(0, 19)}...
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-xs text-slate-300">
                        {img.sizeMB} MB
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xs font-medium ${
                            img.inUse ? 'text-emerald-400' : 'text-slate-500'
                          }`}>
                            {img.inUse ? 'In Use' : 'Unused'}
                          </span>
                          {img.updateAvailable && (
                            <span className="text-[10px] font-mono text-amber-400">
                              · New version available
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3 text-2xs font-mono">
                          {img.vulnerabilities.critical > 0 ? (
                            <span className="text-rose-400 font-semibold">
                              {img.vulnerabilities.critical} Critical
                            </span>
                          ) : (
                            <span className="text-emerald-400">0 Critical</span>
                          )}
                          <span className="text-slate-500">·</span>
                          <span className={img.vulnerabilities.high > 0 ? 'text-amber-400' : 'text-slate-400'}>
                            {img.vulnerabilities.high} High
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400">{img.vulnerabilities.medium} Med</span>
                        </div>
                      </td>

                      <td className="py-3.5 pr-5 pl-3 text-right text-2xs font-mono text-slate-500">
                        {img.created}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 4: APP TEMPLATES CATALOG (Arcane Store) */}
      {/* ============================================================== */}
      {subTab === 'templates' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Container App Catalog</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deploy container populer dalam 1-klik dengan konfigurasi compose yang sudah dioptimasi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div 
                key={tpl.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xs font-mono text-cyan-400">{tpl.category}</span>
                    <span className="text-2xs font-mono text-slate-500">{tpl.image}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">{tpl.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{tpl.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-2xs font-mono text-slate-500">
                    Ports: {tpl.defaultPorts.join(', ')}
                  </span>
                  <button
                    onClick={() => handleDeployTemplate(tpl)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Deploy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 5: TRASH / RECYCLE BIN (Restore & Permanent Delete) */}
      {/* ============================================================== */}
      {subTab === 'trash' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Tempat Sampah Container</h3>
                <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/40">
                  {trashedContainers.length} Terhapus
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Container yang dihapus disimpan sementara di sini dan dapat dipulihkan sewaktu-waktu tanpa kehilangan konfigurasi.
              </p>
            </div>

            {trashedContainers.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestoreAll}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pulihkan Semua</span>
                </button>
                <button
                  onClick={() => setShowPurgeConfirm(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700/60 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Sampah</span>
                </button>
              </div>
            )}
          </div>

          {filteredTrashContainers.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <Trash2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-200">
                {trashedContainers.length === 0 ? 'Tempat Sampah Kosong' : 'Tidak ada hasil pencarian'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {trashedContainers.length === 0 
                  ? 'Tidak ada container di Tempat Sampah. Semua container berjalan atau disimpan secara aktif.'
                  : 'Tidak ada container terhapus yang cocok dengan filter pencarian.'}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-950/40 text-2xs font-mono text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 pl-5 pr-3">Container & Image</th>
                      <th className="py-3.5 px-3">Waktu Dihapus</th>
                      <th className="py-3.5 px-3">Stack / Port</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 pr-5 pl-3 text-right">Opsi Pemulihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs">
                    {filteredTrashContainers.map((container) => (
                      <tr key={container.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pl-5 pr-3">
                          <div className="flex items-start gap-3">
                            <div className="pt-0.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">
                                {container.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-2xs text-slate-400 font-mono">
                                <span>{container.image}</span>
                                <span>·</span>
                                <span className="text-slate-500">{container.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-2xs text-slate-400">
                          {container.deletedAt ? new Date(container.deletedAt).toLocaleString('id-ID') : 'Baru saja'}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex flex-col gap-0.5 font-mono text-2xs text-slate-400">
                            <span>{container.stackName || 'Standalone'}</span>
                            <span className="text-slate-500">
                              {container.ports.map(p => p.publicPort ? `${p.publicPort}:${p.privatePort}` : p.privatePort).join(', ') || 'Tanpa Port'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-2xs">
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/40 font-mono">
                            Di Tempat Sampah
                          </span>
                        </td>

                        <td className="py-3.5 pr-5 pl-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestoreContainer(container.id, container.name)}
                              disabled={actionLoadingId === `${container.id}-restore`}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-2xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                              title="Pulihkan container ini"
                            >
                              <RotateCcw className={`w-3 h-3 ${actionLoadingId === `${container.id}-restore` ? 'animate-spin' : ''}`} />
                              <span>Pulihkan</span>
                            </button>

                            <button
                              onClick={() => setPermanentDeleteTarget(container)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/60 rounded-lg text-2xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Hapus permanen dari sistem"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus Permanen</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 6: CONTAINER ACTIVITY & AUDIT LOGS (Export CSV / JSON) */}
      {/* ============================================================== */}
      {subTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/20 p-5 rounded-2xl">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0">
                <ScrollText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-sans text-slate-100">
                    Log Aktivitas & Jejak Audit Container
                  </h3>
                  <span className="text-2xs font-mono bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 px-2 py-0.5 rounded-full font-semibold">
                    {filteredActivityLogs.length} Events
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Jejak audit menyeluruh mencatat setiap aksi operator (create, edit konfigurasi, start/stop, restart, pemindahan ke recycle bin, dan restore). Format siap diekspor ke CSV untuk laporan kepatuhan atau JSON untuk integrasi SIEM.
                </p>
              </div>
            </div>

            {/* Quick Export Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => handleExportActivityLogs('csv')}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-emerald-950/50"
                title="Ekspor seluruh log aktivitas yang difilter ke file CSV (Excel compatible)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => handleExportActivityLogs('json')}
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-600/40 text-amber-300 hover:text-amber-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-amber-950/50"
                title="Ekspor log aktivitas ke JSON terstruktur (SIEM / Syslog format)"
              >
                <FileJson className="w-4 h-4 text-amber-400" />
                <span>Ekspor JSON</span>
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                title="Buka pengaturan ekspor kustom"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Opsi Lanjutan</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="text-2xs text-slate-400 uppercase tracking-wider font-semibold font-mono">
                Total Audit Log
              </div>
              <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                {activityLogs.length}
              </div>
              <div className="text-2xs text-slate-500 mt-0.5">
                {filteredActivityLogs.length} cocok dengan filter
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="text-2xs text-emerald-400 uppercase tracking-wider font-semibold font-mono">
                Operasi Sukses
              </div>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                {activityLogs.filter(l => l.status === 'SUCCESS').length}
              </div>
              <div className="text-2xs text-slate-500 mt-0.5">
                Status 200 OK / Completed
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="text-2xs text-amber-400 uppercase tracking-wider font-semibold font-mono">
                Peringatan / Trash
              </div>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                {activityLogs.filter(l => l.status === 'WARNING').length}
              </div>
              <div className="text-2xs text-slate-500 mt-0.5">
                Penghapusan & state change
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="text-2xs text-cyan-400 uppercase tracking-wider font-semibold font-mono">
                Operator Teridentifikasi
              </div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                {Array.from(new Set(activityLogs.map(l => l.actor))).length}
              </div>
              <div className="text-2xs text-slate-500 mt-0.5">
                Sesi audit terautentikasi
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari log: nama container, ringkasan aktivitas, operator, atau tipe event..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {auditSearch && (
                <button
                  onClick={() => setAuditSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Container selector */}
              <select
                value={auditContainerFilter}
                onChange={(e) => setAuditContainerFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">Semua Container</option>
                {containers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isDeleted ? '(Trash)' : ''}
                  </option>
                ))}
              </select>

              {/* Event Type selector */}
              <select
                value={auditEventFilter}
                onChange={(e) => setAuditEventFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">Semua Event Aksi</option>
                <option value="CREATE">CREATE (Buat)</option>
                <option value="START">START (Jalankan)</option>
                <option value="STOP">STOP (Hentikan)</option>
                <option value="RESTART">RESTART (Mulai Ulang)</option>
                <option value="EDIT">EDIT (Ubah Konfigurasi)</option>
                <option value="SOFT_DELETE">SOFT_DELETE (Ke Sampah)</option>
                <option value="RESTORE">RESTORE (Pulihkan)</option>
                <option value="PERMANENT_DELETE">PERMANENT_DELETE (Hapus)</option>
                <option value="CONFIG_CHANGE">CONFIG_CHANGE</option>
                <option value="EXEC_COMMAND">EXEC_COMMAND</option>
                <option value="HEALTH_CHECK">HEALTH_CHECK</option>
                <option value="DIAGNOSTIC_AUDIT">DIAGNOSTIC_AUDIT</option>
              </select>

              {/* Status selector */}
              <select
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
                <option value="FAILED">FAILED</option>
              </select>

              {/* Reset filter if any active */}
              {(auditSearch || auditContainerFilter !== 'all' || auditEventFilter !== 'all' || auditStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setAuditSearch('');
                    setAuditContainerFilter('all');
                    setAuditEventFilter('all');
                    setAuditStatusFilter('all');
                  }}
                  className="px-2.5 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Reset semua filter"
                >
                  Reset
                </button>
              )}

              <button
                onClick={fetchActivityLogs}
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
                title="Muat ulang log aktivitas dari server"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          {filteredActivityLogs.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
              <ScrollText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-slate-300">
                Tidak ada log aktivitas ditemukan
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Kriteria filter yang Anda pilih saat ini tidak menghasilkan entri log aktivitas apapun. Coba sesuaikan kata kunci atau ubah filter dropdown.
              </p>
              <button
                onClick={() => {
                  setAuditSearch('');
                  setAuditContainerFilter('all');
                  setAuditEventFilter('all');
                  setAuditStatusFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-2xs border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Waktu (UTC)</th>
                      <th className="py-3 px-4">Container</th>
                      <th className="py-3 px-4">Event Aksi</th>
                      <th className="py-3 px-4">Operator / Actor</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Ringkasan Aktivitas</th>
                      <th className="py-3 px-4 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredActivityLogs.map((log) => {
                      const isExpanded = expandedLogId === log.id;
                      const dateObj = new Date(log.timestamp);
                      const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

                      return (
                        <React.Fragment key={log.id}>
                          <tr className="hover:bg-slate-800/30 transition-colors">
                            {/* Timestamp */}
                            <td className="py-3 px-4 whitespace-nowrap font-mono">
                              <div className="text-slate-200 font-medium">{timeStr}</div>
                              <div className="text-2xs text-slate-500">{dateStr}</div>
                            </td>

                            {/* Container */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                                <span>{log.containerName}</span>
                              </div>
                              <div className="text-2xs font-mono text-slate-400 mt-0.5 truncate max-w-[180px]">
                                {log.image}
                              </div>
                            </td>

                            {/* Event Type */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              {log.eventType === 'CREATE' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                                  <Plus className="w-3 h-3 text-emerald-400" />
                                  <span>CREATE</span>
                                </span>
                              )}
                              {log.eventType === 'START' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-teal-950/70 text-teal-300 border border-teal-800/60">
                                  <Play className="w-3 h-3 text-teal-400" />
                                  <span>START</span>
                                </span>
                              )}
                              {log.eventType === 'STOP' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                                  <Square className="w-3 h-3 text-slate-400" />
                                  <span>STOP</span>
                                </span>
                              )}
                              {log.eventType === 'RESTART' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-800/60">
                                  <RotateCw className="w-3 h-3 text-indigo-400" />
                                  <span>RESTART</span>
                                </span>
                              )}
                              {log.eventType === 'EDIT' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60">
                                  <Pencil className="w-3 h-3 text-amber-400" />
                                  <span>EDIT</span>
                                </span>
                              )}
                              {log.eventType === 'SOFT_DELETE' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-rose-950/70 text-rose-300 border border-rose-800/60">
                                  <Trash2 className="w-3 h-3 text-rose-400" />
                                  <span>TRASH</span>
                                </span>
                              )}
                              {log.eventType === 'RESTORE' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                                  <RotateCcw className="w-3 h-3 text-emerald-400" />
                                  <span>RESTORE</span>
                                </span>
                              )}
                              {log.eventType === 'PERMANENT_DELETE' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-red-950/90 text-red-200 border border-red-700/80">
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                  <span>PERM_DELETE</span>
                                </span>
                              )}
                              {log.eventType === 'CONFIG_CHANGE' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-blue-950/70 text-blue-300 border border-blue-800/60">
                                  <Code2 className="w-3 h-3 text-blue-400" />
                                  <span>CONFIG</span>
                                </span>
                              )}
                              {log.eventType === 'EXEC_COMMAND' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-purple-950/70 text-purple-300 border border-purple-800/60">
                                  <TerminalIcon className="w-3 h-3 text-purple-400" />
                                  <span>EXEC</span>
                                </span>
                              )}
                              {log.eventType === 'HEALTH_CHECK' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                                  <Activity className="w-3 h-3 text-cyan-400" />
                                  <span>HEALTH</span>
                                </span>
                              )}
                              {log.eventType === 'DIAGNOSTIC_AUDIT' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-mono font-medium bg-violet-950/70 text-violet-300 border border-violet-800/60">
                                  <Sparkles className="w-3 h-3 text-violet-400" />
                                  <span>AUDIT</span>
                                </span>
                              )}
                            </td>

                            {/* Operator / Actor */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                <span>{log.actor}</span>
                              </div>
                              {log.ipAddress && (
                                <div className="text-2xs font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-slate-600" />
                                  <span>{log.ipAddress}</span>
                                </div>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              {log.status === 'SUCCESS' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono font-semibold bg-emerald-950/50 text-emerald-400 border border-emerald-800/50">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>SUCCESS</span>
                                </span>
                              )}
                              {log.status === 'WARNING' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono font-semibold bg-amber-950/50 text-amber-400 border border-amber-800/50">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>WARNING</span>
                                </span>
                              )}
                              {log.status === 'INFO' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono font-semibold bg-cyan-950/50 text-cyan-400 border border-cyan-800/50">
                                  <Activity className="w-3 h-3" />
                                  <span>INFO</span>
                                </span>
                              )}
                              {log.status === 'FAILED' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-mono font-semibold bg-rose-950/50 text-rose-400 border border-rose-800/50">
                                  <ShieldAlert className="w-3 h-3" />
                                  <span>FAILED</span>
                                </span>
                              )}
                            </td>

                            {/* Summary */}
                            <td className="py-3 px-4">
                              <div className="text-slate-200 leading-relaxed font-sans max-w-lg">
                                {log.summary}
                              </div>
                            </td>

                            {/* Actions / Details button */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className={`px-2.5 py-1 text-2xs font-mono rounded-lg transition-colors cursor-pointer border ${
                                  isExpanded 
                                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60' 
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                                }`}
                              >
                                {isExpanded ? 'Tutup' : 'Detail'}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Detail Payload Drawer */}
                          {isExpanded && (
                            <tr className="bg-slate-950/60 border-t border-b border-cyan-900/40">
                              <td colSpan={7} className="p-4">
                                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                                  <div className="flex items-center justify-between text-2xs text-slate-400 pb-2 border-b border-slate-800">
                                    <span className="font-semibold text-cyan-400">Payload Metadata & Audit Checksum</span>
                                    <span>Log ID: {log.id} · Timestamp: {log.timestamp}</span>
                                  </div>
                                  <pre className="text-slate-300 overflow-x-auto text-2xs leading-relaxed max-h-48 p-2 bg-slate-900/80 rounded-lg">
                                    {JSON.stringify({
                                      id: log.id,
                                      timestamp: log.timestamp,
                                      containerId: log.containerId,
                                      containerName: log.containerName,
                                      image: log.image,
                                      eventType: log.eventType,
                                      actor: log.actor,
                                      ipAddress: log.ipAddress,
                                      status: log.status,
                                      summary: log.summary,
                                      details: log.details || null
                                    }, null, 2)}
                                  </pre>
                                  <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                        showToast('Data audit disalin ke clipboard');
                                      }}
                                      className="px-2.5 py-1 text-2xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                      <Copy className="w-3 h-3" />
                                      <span>Salin JSON Entri Ini</span>
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* CONTAINER INSPECTOR DRAWER / MODAL */}
      {/* ============================================================== */}
      {selectedContainer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  selectedContainer.state === 'running' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' :
                  selectedContainer.state === 'paused' ? 'bg-amber-400' : 'bg-slate-600'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-sans text-slate-100">
                      {selectedContainer.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      ({selectedContainer.id})
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {selectedContainer.image} · {selectedContainer.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct lifecycle triggers inside modal */}
                {selectedContainer.state === 'running' ? (
                  <button
                    onClick={() => handleContainerAction(selectedContainer.id, 'stop')}
                    className="px-2.5 py-1 text-xs bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg hover:bg-rose-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Square className="w-3 h-3" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleContainerAction(selectedContainer.id, 'start')}
                    className="px-2.5 py-1 text-xs bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-lg hover:bg-emerald-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    <span>Start</span>
                  </button>
                )}
                <button
                  onClick={() => handleContainerAction(selectedContainer.id, 'restart')}
                  className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Restart</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(selectedContainer)}
                  className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Edit konfigurasi"
                >
                  <Pencil className="w-3 h-3 text-amber-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmContainer(selectedContainer)}
                  className="px-2.5 py-1 text-xs bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg hover:bg-rose-900/50 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Hapus container"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
                <button
                  onClick={() => setSelectedContainer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="px-5 border-b border-slate-800 bg-slate-900 flex items-center gap-2 overflow-x-auto shrink-0">
              {[
                { id: 'stats', label: 'Stats & Metrics', icon: Activity },
                { id: 'logs', label: 'Logs', icon: FileText },
                { id: 'terminal', label: 'Terminal (Exec)', icon: TerminalIcon },
                { id: 'env', label: 'Environment', icon: Code2 },
                { id: 'mounts', label: 'Volumes & Mounts', icon: HardDrive },
                { id: 'ports', label: 'Network & Ports', icon: ArrowUpRight },
                { id: 'ai-diagnose', label: 'AI Diagnosis', icon: Sparkles }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = inspectorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInspectorTab(tab.id as InspectorTab)}
                    className={`flex items-center gap-2 py-3 px-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'border-blue-500 text-blue-400 font-semibold' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Tab Contents */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* TAB 1: STATS & METRICS */}
              {inspectorTab === 'stats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                      <span className="text-2xs text-slate-400">CPU Usage</span>
                      <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                        {selectedContainer.stats.cpuPercent}%
                      </div>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                      <span className="text-2xs text-slate-400">Memory Usage</span>
                      <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                        {Math.round(selectedContainer.stats.memoryUsageBytes / 1024 / 1024)} MB
                      </div>
                      <span className="text-2xs font-mono text-slate-500">
                        {selectedContainer.stats.memoryPercent}% of {Math.round(selectedContainer.stats.memoryLimitBytes / 1024 / 1024)} MB
                      </span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                      <span className="text-2xs text-slate-400">Network I/O</span>
                      <div className="text-sm font-bold font-mono text-slate-200 mt-1 truncate">
                        {(selectedContainer.stats.networkRxBytes / 1024 / 1024).toFixed(1)}M / {(selectedContainer.stats.networkTxBytes / 1024 / 1024).toFixed(1)}M
                      </div>
                      <span className="text-2xs font-mono text-slate-500">Rx / Tx</span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                      <span className="text-2xs text-slate-400">Threads / PIDs</span>
                      <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                        {selectedContainer.stats.pids}
                      </div>
                      <span className="text-2xs font-mono text-slate-500">Active tasks</span>
                    </div>
                  </div>

                  {/* Config Metadata */}
                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-semibold text-slate-200">Container Configuration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-500">Command:</span>
                        <p className="text-slate-300 mt-0.5 truncate">{selectedContainer.command}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Restart Policy:</span>
                        <p className="text-slate-300 mt-0.5">{selectedContainer.restartPolicy}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Created At:</span>
                        <p className="text-slate-300 mt-0.5">{selectedContainer.created}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Healthcheck:</span>
                        <p className="text-emerald-400 mt-0.5 capitalize">{selectedContainer.healthStatus || 'none'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE LOGS */}
              {inspectorTab === 'logs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter log output..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAutoScrollLogs(!autoScrollLogs)}
                        className={`px-2.5 py-1 text-2xs font-mono rounded-lg transition-colors cursor-pointer ${
                          autoScrollLogs ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Auto-scroll {autoScrollLogs ? 'ON' : 'OFF'}
                      </button>

                      <button
                        onClick={() => handleExportContainerLogs(selectedContainer, 'csv')}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium bg-slate-800 hover:bg-emerald-950/40 text-slate-200 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-600/50 rounded-lg transition-colors cursor-pointer"
                        title="Ekspor log container ini dalam format CSV"
                      >
                        <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                        <span>CSV</span>
                      </button>

                      <button
                        onClick={() => handleExportContainerLogs(selectedContainer, 'json')}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium bg-slate-800 hover:bg-amber-950/40 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-600/50 rounded-lg transition-colors cursor-pointer"
                        title="Ekspor log container ini dalam format JSON"
                      >
                        <FileJson className="w-3 h-3 text-amber-400" />
                        <span>JSON</span>
                      </button>

                      <button
                        onClick={() => {
                          const logLines = (mockContainerLogs[selectedContainer.id] || [])
                            .map(l => `[${l.timestamp}] ${l.message}`).join('\n');
                          handleCopy(logLines, 'all-logs');
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="Copy logs ke clipboard"
                      >
                        {copiedId === 'all-logs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Terminal Log Box */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-300 h-96 overflow-y-auto space-y-1">
                    {(mockContainerLogs[selectedContainer.id] || [
                      { timestamp: new Date().toISOString(), stream: 'stdout', message: `Standard daemon logs active for ${selectedContainer.name}` }
                    ])
                      .filter(log => !logSearch || log.message.toLowerCase().includes(logSearch.toLowerCase()))
                      .map((log, index) => (
                        <div key={index} className="flex items-start gap-2 leading-relaxed hover:bg-slate-900/60 px-1 rounded">
                          <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp.slice(11, 23)}</span>
                          <span className={log.stream === 'stderr' ? 'text-rose-400' : 'text-slate-300'}>
                            {log.message}
                          </span>
                        </div>
                      ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              )}

              {/* TAB 3: INTERACTIVE TERMINAL (EXEC SHELL) */}
              {inspectorTab === 'terminal' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-2xs text-slate-400 font-mono">
                    <span>Shell: /bin/sh · User: root</span>
                    <span>Type "help" for interactive commands</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-300 h-96 overflow-y-auto flex flex-col justify-between">
                    <div className="space-y-1.5 overflow-y-auto">
                      {terminalHistory.map((item, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                          {item.type === 'input' ? (
                            <span className="text-emerald-400 font-bold">{item.text}</span>
                          ) : item.type === 'error' ? (
                            <span className="text-rose-400">{item.text}</span>
                          ) : (
                            <span className="text-slate-300">{item.text}</span>
                          )}
                        </div>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>

                    <form onSubmit={handleTerminalSubmit} className="mt-3 pt-2 border-t border-slate-800/60 flex items-center gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">$</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type a command (ls, ps, top, env, df -h)..."
                        className="w-full bg-transparent border-none text-xs text-slate-100 font-mono focus:outline-none"
                        autoFocus
                      />
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: ENVIRONMENT VARIABLES */}
              {inspectorTab === 'env' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Environment Variables ({Object.keys(selectedContainer.env).length})</span>
                    <button
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSecrets ? 'Hide Secrets' : 'Reveal Secrets'}</span>
                    </button>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl divide-y divide-slate-800/60 font-mono text-xs">
                    {Object.entries(selectedContainer.env).map(([key, value]) => {
                      const isSecret = key.toLowerCase().includes('password') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret');
                      const displayVal = isSecret && !showSecrets ? '••••••••••••••••' : value;

                      return (
                        <div key={key} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-900/40">
                          <span className="text-cyan-400 font-semibold">{key}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 select-all">{displayVal}</span>
                            <button
                              onClick={() => handleCopy(value, key)}
                              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                              title="Copy value"
                            >
                              {copiedId === key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: VOLUMES & MOUNTS */}
              {inspectorTab === 'mounts' && (
                <div className="space-y-3">
                  <span className="text-xs text-slate-400">Attached Storage Volumes & Bind Mounts</span>
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl divide-y divide-slate-800/60 text-xs font-mono">
                    {selectedContainer.mounts.map((mount, idx) => (
                      <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                              {mount.type}
                            </span>
                            <span className="text-slate-400">Destination:</span>
                            <span className="text-emerald-400 font-semibold">{mount.destination}</span>
                          </div>
                          <div className="text-slate-500 text-2xs mt-1">
                            Host Source: {mount.source}
                          </div>
                        </div>
                        <span className={`text-2xs font-bold uppercase px-2 py-0.5 rounded ${
                          mount.mode === 'ro' ? 'bg-amber-950/60 text-amber-300' : 'bg-blue-950/60 text-blue-300'
                        }`}>
                          {mount.mode === 'ro' ? 'Read-Only' : 'Read-Write'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: NETWORK & PORTS */}
              {inspectorTab === 'ports' && (
                <div className="space-y-3">
                  <span className="text-xs text-slate-400">Port Forwarding & Network Interfaces</span>
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl divide-y divide-slate-800/60 text-xs font-mono">
                    {selectedContainer.ports.map((port, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">Private:</span>
                          <span className="text-slate-200 font-semibold">{port.privatePort}/{port.type}</span>
                          <span className="text-slate-600">➔</span>
                          <span className="text-slate-400">Host Binding:</span>
                          <span className="text-cyan-400 font-semibold">{port.ip || '0.0.0.0'}:{port.publicPort || port.privatePort}</span>
                        </div>
                        {port.publicPort && (
                          <a
                            href={`http://localhost:${port.publicPort}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-2xs transition-colors flex items-center gap-1"
                          >
                            <span>Open Port</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: AI CONTAINER DIAGNOSIS */}
              {inspectorTab === 'ai-diagnose' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Gemini Container Advisor</h4>
                      <p className="text-2xs text-slate-400 mt-0.5">
                        Audit otomatis resource overhead, port exposure, volume permission, dan CVE remediation
                      </p>
                    </div>
                    <button
                      onClick={() => handleRunAiDiagnosis(selectedContainer)}
                      disabled={isDiagnosing}
                      className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                      <span>{isDiagnosing ? 'Menganalisis...' : 'Re-Analyze'}</span>
                    </button>
                  </div>

                  {isDiagnosing ? (
                    <div className="text-center py-12 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse mx-auto" />
                      <p className="text-xs font-mono text-slate-400">
                        Memeriksa arsitektur container, batasan memori, dan celah keamanan...
                      </p>
                    </div>
                  ) : diagnosisResult ? (
                    <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-5 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                      {diagnosisResult}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                      <p className="text-xs text-slate-400">Klik tombol di atas untuk memulai audit AI.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DEPLOY STACK MODAL */}
      {/* ============================================================== */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Deploy Docker Compose Stack</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tulis atau paste definisi docker-compose.yml</p>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Stack Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. production-api or redis-cluster"
                  value={newStackName}
                  onChange={(e) => setNewStackName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Compose Configuration (YAML)
                </label>
                <textarea
                  rows={8}
                  value={newStackYaml}
                  onChange={(e) => setNewStackYaml(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeployStack}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Deploy Stack</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE CONTAINER MODAL */}
      {/* ============================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Buat Container Baru</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Konfigurasikan image, port binding, environment variables, dan volume mount</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateContainer} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Quick Image Presets */}
              <div>
                <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                  Template Cepat (1-Klik Isi)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Nginx Web Server', image: 'nginx:alpine', defaultPort: '8080:80', name: 'nginx-web' },
                    { label: 'PostgreSQL 16', image: 'postgres:16-alpine', defaultPort: '5432:5432', name: 'postgres-db' },
                    { label: 'Redis 7 In-Memory', image: 'redis:7-alpine', defaultPort: '6379:6379', name: 'redis-cache' },
                    { label: 'Node.js 20 App', image: 'node:20-alpine', defaultPort: '3000:3000', name: 'node-app' },
                    { label: 'Python 3.11 API', image: 'python:3.11-slim', defaultPort: '8000:8000', name: 'python-api' },
                    { label: 'RabbitMQ Message Broker', image: 'rabbitmq:3-management', defaultPort: '15672:15672', name: 'rabbitmq-mq' }
                  ].map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        const [hostP, contP] = preset.defaultPort.split(':');
                        setCreateForm(prev => ({
                          ...prev,
                          image: preset.image,
                          name: prev.name || preset.name,
                          ports: [{ host: hostP, container: contP, type: 'tcp' }]
                        }));
                      }}
                      className="px-2.5 py-1 text-2xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Nama Container <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. backend-api"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Docker Image Tag <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. redis:7-alpine or nginx:latest"
                    value={createForm.image}
                    onChange={(e) => setCreateForm({ ...createForm, image: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Stack & Restart Policy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Docker Stack / Group (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. web-tier or data-tier"
                    value={createForm.stackName}
                    onChange={(e) => setCreateForm({ ...createForm, stackName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Restart Policy
                  </label>
                  <select
                    value={createForm.restartPolicy}
                    onChange={(e) => setCreateForm({ ...createForm, restartPolicy: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="unless-stopped">unless-stopped (Direkomendasikan)</option>
                    <option value="always">always</option>
                    <option value="on-failure">on-failure</option>
                    <option value="no">no</option>
                  </select>
                </div>
              </div>

              {/* Port Mappings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                    Port Mappings (Host : Container)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreateForm(prev => ({
                      ...prev,
                      ports: [...prev.ports, { host: '', container: '', type: 'tcp' }]
                    }))}
                    className="text-2xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Port</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {createForm.ports.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Host (e.g. 8080)"
                        value={p.host}
                        onChange={(e) => {
                          const updated = [...createForm.ports];
                          updated[idx].host = e.target.value;
                          setCreateForm({ ...createForm, ports: updated });
                        }}
                        className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-slate-500 font-mono">:</span>
                      <input
                        type="text"
                        placeholder="Container (e.g. 80)"
                        value={p.container}
                        onChange={(e) => {
                          const updated = [...createForm.ports];
                          updated[idx].container = e.target.value;
                          setCreateForm({ ...createForm, ports: updated });
                        }}
                        className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <select
                        value={p.type}
                        onChange={(e) => {
                          const updated = [...createForm.ports];
                          updated[idx].type = e.target.value as any;
                          setCreateForm({ ...createForm, ports: updated });
                        }}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                      </select>
                      {createForm.ports.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCreateForm(prev => ({
                              ...prev,
                              ports: prev.ports.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                    Environment Variables (KEY=VALUE)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreateForm(prev => ({
                      ...prev,
                      env: [...prev.env, { key: '', value: '' }]
                    }))}
                    className="text-2xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Variabel</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {createForm.env.map((envItem, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="KEY (e.g. DB_HOST)"
                        value={envItem.key}
                        onChange={(e) => {
                          const updated = [...createForm.env];
                          updated[idx].key = e.target.value;
                          setCreateForm({ ...createForm, env: updated });
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-slate-500 font-mono">=</span>
                      <input
                        type="text"
                        placeholder="VALUE (e.g. postgres)"
                        value={envItem.value}
                        onChange={(e) => {
                          const updated = [...createForm.env];
                          updated[idx].value = e.target.value;
                          setCreateForm({ ...createForm, env: updated });
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      {createForm.env.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCreateForm(prev => ({
                              ...prev,
                              env: prev.env.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Volumes & Mounts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                    Storage Mounts & Volumes
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreateForm(prev => ({
                      ...prev,
                      mounts: [...prev.mounts, { source: '', destination: '', mode: 'rw', type: 'volume' }]
                    }))}
                    className="text-2xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Mount</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {createForm.mounts.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Host Source / Vol Name"
                        value={m.source}
                        onChange={(e) => {
                          const updated = [...createForm.mounts];
                          updated[idx].source = e.target.value;
                          setCreateForm({ ...createForm, mounts: updated });
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-slate-500 font-mono">→</span>
                      <input
                        type="text"
                        placeholder="Container Path (/data)"
                        value={m.destination}
                        onChange={(e) => {
                          const updated = [...createForm.mounts];
                          updated[idx].destination = e.target.value;
                          setCreateForm({ ...createForm, mounts: updated });
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <select
                        value={m.mode}
                        onChange={(e) => {
                          const updated = [...createForm.mounts];
                          updated[idx].mode = e.target.value as any;
                          setCreateForm({ ...createForm, mounts: updated });
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="rw">RW</option>
                        <option value="ro">RO</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setCreateForm(prev => ({
                            ...prev,
                            mounts: prev.mounts.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Command override */}
              <div>
                <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Custom Command / Entrypoint (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. npm start or python app.py"
                  value={createForm.command}
                  onChange={(e) => setCreateForm({ ...createForm, command: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat & Jalankan Container</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EDIT CONTAINER MODAL */}
      {/* ============================================================== */}
      {editingContainer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-600/20 border border-amber-500/30 rounded-xl text-amber-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Edit Konfigurasi Container: {editingContainer.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    ID: {editingContainer.id} · Status: {editingContainer.status}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingContainer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Nama Container <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Docker Image Tag <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.image}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Stack & Restart Policy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Docker Stack / Group (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editForm.stackName}
                    onChange={(e) => setEditForm({ ...editForm, stackName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Restart Policy
                  </label>
                  <select
                    value={editForm.restartPolicy}
                    onChange={(e) => setEditForm({ ...editForm, restartPolicy: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="unless-stopped">unless-stopped (Direkomendasikan)</option>
                    <option value="always">always</option>
                    <option value="on-failure">on-failure</option>
                    <option value="no">no</option>
                  </select>
                </div>
              </div>

              {/* Port Mappings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                    Port Mappings (Host : Container)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({
                      ...prev,
                      ports: [...prev.ports, { host: '', container: '', type: 'tcp' }]
                    }))}
                    className="text-2xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Port</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editForm.ports.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Host (e.g. 8080)"
                        value={p.host}
                        onChange={(e) => {
                          const updated = [...editForm.ports];
                          updated[idx].host = e.target.value;
                          setEditForm({ ...editForm, ports: updated });
                        }}
                        className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-500 font-mono">:</span>
                      <input
                        type="text"
                        placeholder="Container (e.g. 80)"
                        value={p.container}
                        onChange={(e) => {
                          const updated = [...editForm.ports];
                          updated[idx].container = e.target.value;
                          setEditForm({ ...editForm, ports: updated });
                        }}
                        className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <select
                        value={p.type}
                        onChange={(e) => {
                          const updated = [...editForm.ports];
                          updated[idx].type = e.target.value as any;
                          setEditForm({ ...editForm, ports: updated });
                        }}
                        className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            ports: prev.ports.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                    Environment Variables (KEY=VALUE)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({
                      ...prev,
                      env: [...prev.env, { key: '', value: '' }]
                    }))}
                    className="text-2xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Variabel</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editForm.env.map((envItem, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="KEY"
                        value={envItem.key}
                        onChange={(e) => {
                          const updated = [...editForm.env];
                          updated[idx].key = e.target.value;
                          setEditForm({ ...editForm, env: updated });
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-500 font-mono">=</span>
                      <input
                        type="text"
                        placeholder="VALUE"
                        value={envItem.value}
                        onChange={(e) => {
                          const updated = [...editForm.env];
                          updated[idx].value = e.target.value;
                          setEditForm({ ...editForm, env: updated });
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            env: prev.env.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volumes & Mounts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                    Storage Mounts & Volumes
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({
                      ...prev,
                      mounts: [...prev.mounts, { source: '', destination: '', mode: 'rw', type: 'volume' }]
                    }))}
                    className="text-2xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Mount</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editForm.mounts.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Host Source / Vol Name"
                        value={m.source}
                        onChange={(e) => {
                          const updated = [...editForm.mounts];
                          updated[idx].source = e.target.value;
                          setEditForm({ ...editForm, mounts: updated });
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-500 font-mono">→</span>
                      <input
                        type="text"
                        placeholder="Container Path"
                        value={m.destination}
                        onChange={(e) => {
                          const updated = [...editForm.mounts];
                          updated[idx].destination = e.target.value;
                          setEditForm({ ...editForm, mounts: updated });
                        }}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                      <select
                        value={m.mode}
                        onChange={(e) => {
                          const updated = [...editForm.mounts];
                          updated[idx].mode = e.target.value as any;
                          setEditForm({ ...editForm, mounts: updated });
                        }}
                        className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="rw">RW</option>
                        <option value="ro">RO</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            mounts: prev.mounts.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Command override */}
              <div>
                <label className="text-2xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Custom Command / Entrypoint
                </label>
                <input
                  type="text"
                  value={editForm.command}
                  onChange={(e) => setEditForm({ ...editForm, command: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingContainer(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL (Soft Delete vs Hard Delete) */}
      {/* ============================================================== */}
      {deleteConfirmContainer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Hapus Container "{deleteConfirmContainer.name}"?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pilih cara penghapusan yang diinginkan. Anda dapat memindahkannya ke Tempat Sampah agar bisa dipulihkan kembali sewaktu-waktu.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleDeleteContainer(deleteConfirmContainer, false)}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>Pindahkan ke Tempat Sampah (Dapat Dipulihkan)</span>
              </button>

              <button
                onClick={() => handleDeleteContainer(deleteConfirmContainer, true)}
                className="w-full py-2.5 px-4 bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 border border-rose-700/50 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Hapus Permanen Sekarang</span>
              </button>

              <button
                onClick={() => setDeleteConfirmContainer(null)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-center"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PERMANENT DELETE TARGET CONFIRMATION (Inside Trash) */}
      {/* ============================================================== */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/50 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Hapus Permanen?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Container <span className="font-mono font-semibold text-rose-300">"{permanentDeleteTarget.name}"</span> akan dihapus selamanya dari penyimpanan dan tidak dapat dipulihkan lagi.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setPermanentDeleteTarget(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteContainer(permanentDeleteTarget, true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Selamanya</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PURGE TRASH CONFIRMATION */}
      {/* ============================================================== */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/50 w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-rose-400">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Kosongkan Tempat Sampah?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Semua ({trashedContainers.length}) container yang berada dalam Tempat Sampah akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handlePurgeTrash}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EXPORT LOGS MODAL (CSV & JSON AUDIT / DAEMON LOGS) */}
      {/* ============================================================== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-sans text-slate-100">
                    Ekspor Log Aktivitas & Jejak Audit
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unduh rekaman riwayat aktivitas kontainer dalam format CSV atau JSON
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 text-xs text-slate-300">
              {/* Section 1: Format File */}
              <div>
                <label className="block text-2xs uppercase tracking-wider font-mono font-semibold text-slate-400 mb-2">
                  1. Pilih Format Berkas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setExportFormat('csv')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      exportFormat === 'csv'
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className={`w-4 h-4 ${exportFormat === 'csv' ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-slate-100 text-sm">CSV (.csv)</span>
                      </div>
                      <span className="text-2xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Spreadsheet
                      </span>
                    </div>
                    <p className="text-2xs text-slate-400 leading-relaxed mt-1.5">
                      Cocok untuk analisis data tabular di Microsoft Excel, Google Sheets, atau pelaporan audit kepatuhan IT.
                    </p>
                  </div>

                  <div
                    onClick={() => setExportFormat('json')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      exportFormat === 'json'
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <FileJson className={`w-4 h-4 ${exportFormat === 'json' ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-slate-100 text-sm">JSON (.json)</span>
                      </div>
                      <span className="text-2xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        SIEM / Syslog
                      </span>
                    </div>
                    <p className="text-2xs text-slate-400 leading-relaxed mt-1.5">
                      Data hierarkis terstruktur dengan metadata ekspor ISO untuk integrasi log pipeline, Splunk, Elastic, atau SIEM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Jenis Log */}
              <div>
                <label className="block text-2xs uppercase tracking-wider font-mono font-semibold text-slate-400 mb-2">
                  2. Jenis Log yang Diekspor
                </label>
                <div className="space-y-2">
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    exportScope === 'audit' ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'audit'}
                      onChange={() => setExportScope('audit')}
                      className="mt-0.5 text-cyan-500 focus:ring-cyan-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">
                        Log Aktivitas & Audit Lifecycle Container (Audit Trail)
                      </div>
                      <div className="text-2xs text-slate-400 mt-0.5">
                        Mencakup catatan create, edit konfigurasi, start/stop, restart, pemindahan ke recycle bin, restore, dan identitas operator.
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    exportScope === 'container_logs' ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === 'container_logs'}
                      onChange={() => setExportScope('container_logs')}
                      className="mt-0.5 text-cyan-500 focus:ring-cyan-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">
                        Log Output Daemon / Runtime Console (Stdout & Stderr)
                      </div>
                      <div className="text-2xs text-slate-400 mt-0.5">
                        Mencakup log output aplikasi runtime daemon yang berjalan di dalam container yang dipilih.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section 3: Cakupan Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs uppercase tracking-wider font-mono font-semibold text-slate-400 mb-1.5">
                    3. Cakupan Container
                  </label>
                  <select
                    value={exportTargetContainerId}
                    onChange={(e) => setExportTargetContainerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {exportScope === 'audit' && (
                      <option value="all">Semua Container (Keseluruhan Host)</option>
                    )}
                    {containers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.image}) {c.isDeleted ? '[Trash]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-2xs uppercase tracking-wider font-mono font-semibold text-slate-400 mb-1.5">
                    4. Rentang Waktu
                  </label>
                  <select
                    value={exportDateRange}
                    onChange={(e) => setExportDateRange(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="all">Semua Riwayat (Tanpa Batas Waktu)</option>
                    <option value="24h">24 Jam Terakhir</option>
                    <option value="7d">7 Hari Terakhir</option>
                    <option value="30d">30 Hari Terakhir</option>
                  </select>
                </div>
              </div>

              {/* Summary Preview Box */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-2xs text-slate-300 font-medium">
                    {exportScope === 'audit'
                      ? `Menyiapkan ${
                          exportTargetContainerId === 'all'
                            ? activityLogs.length
                            : activityLogs.filter(l => l.containerId === exportTargetContainerId).length
                        } entri log aktivitas`
                      : `Menyiapkan log stream daemon untuk container terpilih`}
                  </span>
                </div>
                <span className="text-2xs font-mono font-semibold text-cyan-400 uppercase">
                  .{exportFormat}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  if (exportScope === 'audit') {
                    handleExportActivityLogs(exportFormat, exportTargetContainerId);
                  } else {
                    const target = containers.find(c => c.id === exportTargetContainerId) || containers[0];
                    if (target) {
                      handleExportContainerLogs(target, exportFormat);
                    }
                  }
                  setShowExportModal(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md shadow-cyan-600/20 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File Ekspor ({exportFormat.toUpperCase()})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swarm & Docker Production Deployment Guide Modal */}
      <SwarmDeploymentModal
        isOpen={showSwarmGuideModal}
        onClose={() => setShowSwarmGuideModal(false)}
      />
    </div>
  );
}
