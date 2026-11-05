import React, { useState, useEffect } from 'react';
import { Cluster, VirtualizationType, FeatureAnalysisType } from '../types';
import { 
  Server, 
  Cpu, 
  Database, 
  HardDrive, 
  Plus, 
  Trash2, 
  Play, 
  RefreshCw, 
  Layers, 
  ShieldAlert, 
  Wifi, 
  Globe, 
  Terminal, 
  X, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  Download, 
  Check, 
  Activity, 
  Sparkles,
  Calendar,
  CalendarRange,
  SlidersHorizontal,
  ArrowRight,
  Edit3,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Code
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportMultiClusterTelemetry } from '../utils/exportGenerators';
import { 
  VIRTUALIZATION_PLATFORMS, 
  VIRTUALIZATION_CATEGORIES, 
  getPlatformMeta 
} from '../data/virtualizationPlatforms';

export type TimeRangePreset = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface ClustersViewProps {
  clusters: Cluster[];
  onAddCluster: (name: string, type: VirtualizationType, endpoint: string, capacityGB: number) => Promise<Cluster | null> | void;
  onDeleteCluster: (id: string) => void;
  onSimulateWorkload: (id: string, scenario: 'spike_cpu' | 'leak_ram' | 'heavy_io' | 'clear') => void;
  onNavigateToHardware?: (nodeId: string) => void;
  onOpenAiAnalysis?: (feature?: FeatureAnalysisType) => void;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function ClustersView({ clusters, onAddCluster, onDeleteCluster, onSimulateWorkload, onNavigateToHardware, onOpenAiAnalysis }: ClustersViewProps) {
  const [selectedClusterId, setSelectedClusterId] = useState<string>(clusters[0]?.id || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState<Cluster | null>(null);

  // Grafana style states
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('month');
  const [selectedMetric, setSelectedMetric] = useState<'storage' | 'cpu' | 'ram' | 'network'>('storage');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Custom Date Range states
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [customGranularity, setCustomGranularity] = useState<'auto' | 'hourly' | 'daily' | 'weekly'>('auto');
  const [appliedCustomRange, setAppliedCustomRange] = useState<{
    startDate: string;
    endDate: string;
    granularity: 'auto' | 'hourly' | 'daily' | 'weekly';
    label: string;
    totalDays: number;
  }>({
    startDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 14);
      return d.toISOString().split('T')[0];
    })(),
    endDate: new Date().toISOString().split('T')[0],
    granularity: 'auto',
    label: '14 Hari Terakhir',
    totalDays: 14
  });
  const [dateError, setDateError] = useState<string | null>(null);

  const formatShortDate = (isoDate: string) => {
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        const m = parseInt(parts[1], 10) - 1;
        return `${d} ${MONTHS_SHORT[m] || ''}`;
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  const handleApplyCustomRange = () => {
    if (!customStartDate || !customEndDate) {
      setDateError('Tanggal mulai dan selesai harus diisi.');
      return;
    }
    const start = new Date(customStartDate + 'T00:00:00');
    const end = new Date(customEndDate + 'T23:59:59');
    if (start > end) {
      setDateError('Tanggal mulai tidak boleh melebihi tanggal selesai.');
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    const label = `${formatShortDate(customStartDate)} - ${formatShortDate(customEndDate)} (${totalDays} Hari)`;

    setAppliedCustomRange({
      startDate: customStartDate,
      endDate: customEndDate,
      granularity: customGranularity,
      label,
      totalDays
    });
    setTimeRange('custom');
    setDateError(null);
    setShowCustomRangeModal(false);
    setShowTimeRangeDropdown(false);
  };

  const setQuickRangeDays = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setCustomStartDate(start.toISOString().split('T')[0]);
    setCustomEndDate(end.toISOString().split('T')[0]);
    setDateError(null);
  };

  const setQuickMonthRange = (which: 'thisMonth' | 'lastMonth') => {
    const now = new Date();
    if (which === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setCustomStartDate(start.toISOString().split('T')[0]);
      setCustomEndDate(now.toISOString().split('T')[0]);
    } else {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      setCustomStartDate(start.toISOString().split('T')[0]);
      setCustomEndDate(end.toISOString().split('T')[0]);
    }
    setDateError(null);
  };

  // Helper to generate elegant simulated telemetry data depending on selected range
  const getTelemetryDataForRange = (range: TimeRangePreset, metric: 'storage' | 'cpu' | 'ram' | 'network') => {
    const clustersTelemetry: any[] = [];
    
    if (range === 'day') {
      // Generate 24 hourly data points
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const dataPoint: any = { timestamp: timeStr };
        
        clusters.forEach((c, idx) => {
          const baseCpu = c.nodes.reduce((acc, n) => acc + n.cpuUsage, 0) / (c.nodes.length || 1);
          const baseRam = c.nodes.reduce((acc, n) => acc + n.ramUsage, 0) / (c.nodes.length || 1);
          const baseStorage = (c.storageUsedGB / c.storageCapacityGB) * 100;
          
          const fluctuation = Math.sin((24 - i + idx) / 2) * 4;
          const randomVal = (Math.random() - 0.5) * 3;
          
          if (metric === 'storage') {
            dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseStorage + (Math.random() - 0.5) * 0.15)) * 10) / 10;
          } else if (metric === 'cpu') {
            dataPoint[c.name] = Math.round(Math.max(5, Math.min(99, baseCpu + fluctuation + randomVal)) * 10) / 10;
          } else if (metric === 'ram') {
            dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseRam + (fluctuation / 2) + randomVal)) * 10) / 10;
          } else { // network
            dataPoint[c.name] = Math.round(Math.max(0.5, 18 + fluctuation * 2.5 + (Math.random() * 6)) * 10) / 10;
          }
        });
        clustersTelemetry.push(dataPoint);
      }
    } else if (range === 'week') {
      // 7 days daily data points
      const now = new Date();
      const daysShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayLabel = `${daysShort[d.getDay()]}, ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
        const dataPoint: any = { timestamp: dayLabel };
        
        clusters.forEach((c, idx) => {
          const baseCpu = c.nodes.reduce((acc, n) => acc + n.cpuUsage, 0) / (c.nodes.length || 1);
          const baseRam = c.nodes.reduce((acc, n) => acc + n.ramUsage, 0) / (c.nodes.length || 1);
          const baseStorage = (c.storageUsedGB / c.storageCapacityGB) * 100;
          const fluctuation = Math.sin((7 - i + idx)) * 3;
          
          if (metric === 'storage') {
            dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseStorage - i * 0.15 + (Math.random() - 0.5) * 0.2)) * 10) / 10;
          } else if (metric === 'cpu') {
            dataPoint[c.name] = Math.round(Math.max(5, Math.min(99, baseCpu + fluctuation + (Math.random() - 0.5) * 4)) * 10) / 10;
          } else if (metric === 'ram') {
            dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseRam + (fluctuation / 2) + (Math.random() - 0.5) * 2)) * 10) / 10;
          } else {
            dataPoint[c.name] = Math.round(Math.max(0.5, 18 + fluctuation * 2 + (Math.random() * 5)) * 10) / 10;
          }
        });
        clustersTelemetry.push(dataPoint);
      }
    } else if (range === 'quarter') {
      // 12 weeks data points (90 days)
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const label = `W-${12 - i} (${d.getDate()} ${MONTHS_SHORT[d.getMonth()]})`;
        const dataPoint: any = { timestamp: label };
        
        clusters.forEach((c, idx) => {
          const baseCpu = c.nodes.reduce((acc, n) => acc + n.cpuUsage, 0) / (c.nodes.length || 1);
          const baseRam = c.nodes.reduce((acc, n) => acc + n.ramUsage, 0) / (c.nodes.length || 1);
          const baseStorage = (c.storageUsedGB / c.storageCapacityGB) * 100;
          const growth = baseStorage - (i * 0.45);
          const fluctuation = Math.sin((12 - i + idx)) * 2;
          
          if (metric === 'storage') {
            dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, growth + fluctuation)) * 10) / 10;
          } else if (metric === 'cpu') {
            dataPoint[c.name] = Math.round(Math.max(5, Math.min(99, baseCpu + fluctuation + (Math.random() - 0.5) * 3)) * 10) / 10;
          } else if (metric === 'ram') {
            dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseRam + (fluctuation / 2))) * 10) / 10;
          } else {
            dataPoint[c.name] = Math.round(Math.max(1, 20 + fluctuation * 1.5) * 10) / 10;
          }
        });
        clustersTelemetry.push(dataPoint);
      }
    } else if (range === 'year') {
      // Generate 12 months data points
      const currentMonth = new Date().getMonth();
      
      for (let i = 11; i >= 0; i--) {
        const monthIdx = (currentMonth - i + 12) % 12;
        const monthLabel = MONTHS_SHORT[monthIdx];
        const dataPoint: any = { timestamp: monthLabel };
        
        clusters.forEach((c, idx) => {
          const baseCpu = c.nodes.reduce((acc, n) => acc + n.cpuUsage, 0) / (c.nodes.length || 1);
          const baseRam = c.nodes.reduce((acc, n) => acc + n.ramUsage, 0) / (c.nodes.length || 1);
          const baseStorage = (c.storageUsedGB / c.storageCapacityGB) * 100;
          
          const storageGrowthTrend = baseStorage - (i * 1.3); 
          const fluctuation = Math.sin((12 - i + idx)) * 2;
          
          if (metric === 'storage') {
            dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, storageGrowthTrend + fluctuation)) * 10) / 10;
          } else if (metric === 'cpu') {
            dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseCpu - 3 + fluctuation + (Math.random() - 0.5) * 3)) * 10) / 10;
          } else if (metric === 'ram') {
            dataPoint[c.name] = Math.round(Math.max(15, Math.min(99, baseRam - 1 + (fluctuation / 2) + (Math.random() - 0.5) * 2)) * 10) / 10;
          } else { // network
            dataPoint[c.name] = Math.round(Math.max(1, 22 - i * 0.7 + fluctuation + (Math.random() * 4)) * 10) / 10;
          }
        });
        clustersTelemetry.push(dataPoint);
      }
    } else if (range === 'custom') {
      // Dynamic Custom Date Range Telemetry Generation
      const start = new Date(appliedCustomRange.startDate + 'T00:00:00');
      const end = new Date(appliedCustomRange.endDate + 'T23:59:59');
      const totalDays = appliedCustomRange.totalDays || 1;

      let mode = appliedCustomRange.granularity;
      if (mode === 'auto') {
        if (totalDays <= 2) mode = 'hourly';
        else if (totalDays <= 60) mode = 'daily';
        else mode = 'weekly';
      }

      if (mode === 'hourly') {
        const stepHours = totalDays <= 1 ? 1 : totalDays <= 2 ? 2 : 4;
        const totalHours = totalDays * 24;
        const count = Math.min(48, Math.max(2, Math.floor(totalHours / stepHours)));
        for (let i = 0; i < count; i++) {
          const pt = new Date(start.getTime() + i * stepHours * 3600 * 1000);
          if (pt > end && i > 0) break;
          const label = totalDays > 1
            ? `${pt.getDate()} ${MONTHS_SHORT[pt.getMonth()]} ${String(pt.getHours()).padStart(2, '0')}:00`
            : `${String(pt.getHours()).padStart(2, '0')}:00`;
          const dataPoint: any = { timestamp: label };
          clusters.forEach((c, idx) => {
            const baseCpu = c.nodes.reduce((acc, n) => acc + n.cpuUsage, 0) / (c.nodes.length || 1);
            const baseRam = c.nodes.reduce((acc, n) => acc + n.ramUsage, 0) / (c.nodes.length || 1);
            const baseStorage = (c.storageUsedGB / c.storageCapacityGB) * 100;
            const fluctuation = Math.sin((count - i + idx) / 2) * 4;
            const detJitter = Math.sin(i * 1.7 + idx * 2.3) * 0.5;
            if (metric === 'storage') {
              dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseStorage + detJitter * 0.3)) * 10) / 10;
            } else if (metric === 'cpu') {
              dataPoint[c.name] = Math.round(Math.max(5, Math.min(99, baseCpu + fluctuation + detJitter * 3)) * 10) / 10;
            } else if (metric === 'ram') {
              dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseRam + (fluctuation / 2) + detJitter * 2)) * 10) / 10;
            } else {
              dataPoint[c.name] = Math.round(Math.max(0.5, 18 + fluctuation * 2.5 + detJitter * 4) * 10) / 10;
            }
          });
          clustersTelemetry.push(dataPoint);
        }
      } else if (mode === 'weekly') {
        const count = Math.max(2, Math.ceil(totalDays / 7));
        for (let i = 0; i < count; i++) {
          const pt = new Date(start.getTime() + i * 7 * 24 * 3600 * 1000);
          if (pt > end && i > 0) break;
          const label = `${pt.getDate()} ${MONTHS_SHORT[pt.getMonth()]}`;
          const dataPoint: any = { timestamp: label };
          clusters.forEach((c, idx) => {
            const baseCpu = c.nodes.reduce((acc, n) => acc + n.cpuUsage, 0) / (c.nodes.length || 1);
            const baseRam = c.nodes.reduce((acc, n) => acc + n.ramUsage, 0) / (c.nodes.length || 1);
            const baseStorage = (c.storageUsedGB / c.storageCapacityGB) * 100;
            const growth = baseStorage - (count - i) * 0.3;
            const fluctuation = Math.sin((count - i + idx)) * 2;
            const detJitter = Math.cos(i * 1.5 + idx * 2.1) * 0.4;
            if (metric === 'storage') {
              dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, growth + fluctuation)) * 10) / 10;
            } else if (metric === 'cpu') {
              dataPoint[c.name] = Math.round(Math.max(5, Math.min(99, baseCpu + fluctuation + detJitter * 3)) * 10) / 10;
            } else if (metric === 'ram') {
              dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseRam + (fluctuation / 2))) * 10) / 10;
            } else {
              dataPoint[c.name] = Math.round(Math.max(1, 20 + fluctuation * 1.5) * 10) / 10;
            }
          });
          clustersTelemetry.push(dataPoint);
        }
      } else {
        // Daily
        const stepDays = totalDays > 45 ? 2 : 1;
        const count = Math.max(1, Math.ceil(totalDays / stepDays));
        for (let i = 0; i < count; i++) {
          const pt = new Date(start.getTime() + i * stepDays * 24 * 3600 * 1000);
          if (pt > end && i > 0) break;
          const label = `${pt.getDate()} ${MONTHS_SHORT[pt.getMonth()]}`;
          const dataPoint: any = { timestamp: label };
          clusters.forEach((c, idx) => {
            const baseCpu = c.nodes.reduce((acc, n) => acc + n.cpuUsage, 0) / (c.nodes.length || 1);
            const baseRam = c.nodes.reduce((acc, n) => acc + n.ramUsage, 0) / (c.nodes.length || 1);
            const baseStorage = (c.storageUsedGB / c.storageCapacityGB) * 100;
            const growth = baseStorage - (count - i) * 0.12;
            const fluctuation = Math.sin((count - i + idx)) * 2.5;
            const detJitter = Math.sin(i * 1.9 + idx * 2.7) * 0.4;
            if (metric === 'storage') {
              dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, growth + detJitter * 0.3)) * 10) / 10;
            } else if (metric === 'cpu') {
              dataPoint[c.name] = Math.round(Math.max(5, Math.min(99, baseCpu + fluctuation + detJitter * 3)) * 10) / 10;
            } else if (metric === 'ram') {
              dataPoint[c.name] = Math.round(Math.max(10, Math.min(99, baseRam + (fluctuation / 2) + detJitter * 1.5)) * 10) / 10;
            } else {
              dataPoint[c.name] = Math.round(Math.max(0.5, 18 + fluctuation * 2 + detJitter * 3) * 10) / 10;
            }
          });
          clustersTelemetry.push(dataPoint);
        }
      }
    } else {
      // Month range (30 days - default cluster telemetries mapped)
      const telemetryLen = clusters[0]?.telemetry.length || 30;
      for (let idx = 0; idx < telemetryLen; idx++) {
        const origPoint = clusters[0]?.telemetry[idx];
        const timeLabel = origPoint ? origPoint.timestamp : `Tgl ${idx + 1}`;
        const dataPoint: any = { timestamp: timeLabel };
        
        clusters.forEach(c => {
          const p = c.telemetry[idx];
          if (p) {
            if (metric === 'storage') {
              dataPoint[c.name] = p.storage;
            } else if (metric === 'cpu') {
              dataPoint[c.name] = p.cpu;
            } else if (metric === 'ram') {
              dataPoint[c.name] = p.ram;
            } else {
              dataPoint[c.name] = Math.round((p.networkIn + p.networkOut) * 10) / 10;
            }
          }
        });
        clustersTelemetry.push(dataPoint);
      }
    }
    
    return clustersTelemetry;
  };

  const chartTelemetryData = React.useMemo(() => {
    return getTelemetryDataForRange(timeRange, selectedMetric);
  }, [timeRange, selectedMetric, appliedCustomRange, clusters]);

  const exportToCSV = () => {
    const dataToExport = chartTelemetryData;
    if (!dataToExport.length) return;

    const clusterNames = clusters.map(c => c.name);
    const headers = ['Timestamp', ...clusterNames];
    
    const rows = dataToExport.map(point => {
      return [
        point.timestamp,
        ...clusterNames.map(name => point[name] !== undefined ? point[name] : '')
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const rangeName = timeRange === 'day' 
      ? 'hari_ini' 
      : timeRange === 'week'
      ? '7_hari'
      : timeRange === 'month'
      ? 'bulan_ini'
      : timeRange === 'quarter'
      ? '3_bulan'
      : timeRange === 'year' 
      ? 'tahun_ini' 
      : `kustom_${appliedCustomRange.startDate}_sd_${appliedCustomRange.endDate}`;

    const metricName = selectedMetric;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `telemetri_${metricName}_${rangeName}_${dateStr}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const exportToJSON = () => {
    const dataToExport = chartTelemetryData;
    if (!dataToExport.length) return;

    const exportObject = {
      metadata: {
        metric: selectedMetric,
        timeRange: timeRange,
        customRange: timeRange === 'custom' ? appliedCustomRange : undefined,
        exportedAt: new Date().toISOString(),
        clusters: clusters.map(c => ({ id: c.id, name: c.name, type: c.type }))
      },
      data: dataToExport
    };

    const jsonContent = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const rangeName = timeRange === 'day' 
      ? 'hari_ini' 
      : timeRange === 'week'
      ? '7_hari'
      : timeRange === 'month'
      ? 'bulan_ini'
      : timeRange === 'quarter'
      ? '3_bulan'
      : timeRange === 'year' 
      ? 'tahun_ini' 
      : `kustom_${appliedCustomRange.startDate}_sd_${appliedCustomRange.endDate}`;

    const metricName = selectedMetric;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `telemetri_${metricName}_${rangeName}_${dateStr}.json`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const handleExportDocument = (format: 'excel' | 'pdf' | 'word') => {
    const rangeLabel = timeRange === 'day' 
      ? 'Hari Ini (24 Jam)' 
      : timeRange === 'week' 
      ? '7 Hari Terakhir' 
      : timeRange === 'month' 
      ? 'Bulan Ini (30 Hari)' 
      : timeRange === 'quarter'
      ? '3 Bulan Terakhir (90 Hari)'
      : timeRange === 'year' 
      ? 'Tahun Ini (12 Bulan)' 
      : `Kustom (${appliedCustomRange.startDate} s/d ${appliedCustomRange.endDate})`;

    const telemetryData = chartTelemetryData;
    exportMultiClusterTelemetry(clusters, rangeLabel, selectedMetric, telemetryData, format);
    setShowExportDropdown(false);
  };

  // Slot Disk & Node Monitoring states
  const [nodeViewTab, setNodeViewTab] = useState<'metrics' | 'disks'>('metrics');
  const [selectedDisk, setSelectedDisk] = useState<any | null>(null);
  const [blinkingSlots, setBlinkingSlots] = useState<{ [key: string]: boolean }>({});
  const [smartTestProgress, setSmartTestProgress] = useState<number>(-1); // -1 means idle

  const vmTableRef = React.useRef<HTMLDivElement>(null);

  const scrollVMs = (direction: 'up' | 'down') => {
    if (vmTableRef.current) {
      const scrollAmount = 140;
      vmTableRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Helper to generate deterministic stable disk slot telemetry data
  const getDiskSlotsForNode = (nodeId: string, nodeName: string, anomalyScore: number) => {
    const slots: any[] = [];
    const models = [
      { model: 'Intel D7-P5510 NVMe Enterprise', type: 'NVMe SSD', speedR: '6500 MB/s', speedW: '3400 MB/s', interface: 'PCIe Gen4 x4' },
      { model: 'Samsung PM1733 U.3 Dual-Port', type: 'U.2 NVMe', speedR: '7000 MB/s', speedW: '3800 MB/s', interface: 'PCIe Gen4 x4' },
      { model: 'Seagate Exos X18 Helium SAS', type: 'SAS HDD', speedR: '270 MB/s', speedW: '250 MB/s', interface: 'SAS 12Gbps' },
      { model: 'Micron 5300 PRO SATA Enterprise', type: 'SATA SSD', speedR: '540 MB/s', speedW: '520 MB/s', interface: 'SATA III 6Gbps' }
    ];

    for (let i = 0; i < 8; i++) {
      // Create a deterministic hash seed from the node name + index
      const charCodeSum = (nodeId + nodeName).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const seed = (charCodeSum + i) % 100;
      
      // Determine if empty (say slots 6 and 7 are empty on some nodes)
      const isEmpty = (i === 6 || i === 7) && seed % 2 === 0;
      
      if (isEmpty) {
        slots.push({
          slotId: i,
          status: 'empty',
          type: 'N/A',
          capacity: 'N/A',
          model: 'Empty Slot',
          serial: 'N/A',
          temp: 0,
          usage: 0,
          raidGroup: 'N/A',
          wearout: 100,
          readSpeed: '0 MB/s',
          writeSpeed: '0 MB/s'
        });
        continue;
      }

      const modelIdx = (seed + i) % models.length;
      const m = models[modelIdx];
      
      // Capacity allocation
      const capacities = ['960 GB', '1.92 TB', '3.84 TB', '10 TB', '12 TB'];
      const cap = capacities[(seed + i) % (m.type.includes('HDD') ? 2 : 3) + (m.type.includes('HDD') ? 3 : 0)];

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let temp = 32 + (seed % 14);
      let wearout = 84 + (seed % 16);
      let usage = 25 + (seed % 60);
      let raidGroup = seed % 3 === 0 ? 'rpool (RAID-10)' : seed % 3 === 1 ? 'ceph-pool-sata (Replica 3x)' : 'local-lvm-nvme (RAID-1)';

      // Inject simulated anomalies to make slots reactive to overall cluster health
      if (anomalyScore >= 50) {
        if (i === 2 && anomalyScore >= 75) {
          status = 'critical';
          temp = 69; // Critical heat
          wearout = 3; // Degraded wearout life
          usage = 99;
          raidGroup = 'CEPH_DEGRADED';
        } else if (i === 4 && anomalyScore >= 50) {
          status = 'warning';
          temp = 54; // Warning heat
          wearout = 11;
          usage = 94;
        }
      }

      slots.push({
        slotId: i,
        status,
        type: m.type,
        capacity: cap,
        model: m.model,
        serial: `SN-${m.type.substring(0, 2)}-${charCodeSum}${i}${seed}`,
        temp,
        wearout: m.type.includes('HDD') ? undefined : wearout,
        readSpeed: status === 'critical' ? '0 KB/s' : status === 'warning' ? '15 MB/s' : m.speedR,
        writeSpeed: status === 'critical' ? '0 KB/s' : status === 'warning' ? '8 MB/s' : m.speedW,
        usage,
        raidGroup,
        interface: m.interface
      });
    }

    return slots;
  };

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterHealth, setFilterHealth] = useState<string>('ALL');

  // Form states
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VirtualizationType>('Proxmox VE');
  const [newEndpoint, setNewEndpoint] = useState('https://pve-cluster.corp.internal:8006/api2/json');
  const [newAuthToken, setNewAuthToken] = useState('root@pam!token');
  const [newCapacityGB, setNewCapacityGB] = useState(10240);

  const handlePlatformChange = (selected: VirtualizationType) => {
    setNewType(selected);
    const meta = getPlatformMeta(selected);
    if (meta) {
      setNewEndpoint(meta.defaultEndpoint);
      setNewAuthToken(meta.authPlaceholder);
      if (!newName || newName.includes('-Prod-')) {
        const shortName = selected.replace(/[^a-zA-Z0-9]/g, '-').split('-')[0];
        setNewName(`${shortName}-Prod-Cluster`);
      }
    }
  };

  // Dynamic filtered clusters list
  const filteredClusters = clusters.filter((c) => {
    // 1. Search filter (Name, Endpoint, Version)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesEndpoint = c.endpoint.toLowerCase().includes(q);
      const matchesVersion = c.version.toLowerCase().includes(q);
      if (!matchesName && !matchesEndpoint && !matchesVersion) {
        return false;
      }
    }
    // 2. Virtualization Type filter
    if (filterType !== 'ALL' && c.type !== filterType) {
      return false;
    }
    // 3. Health & Status filter
    if (filterHealth !== 'ALL') {
      if (filterHealth === 'CONNECTED' && c.status !== 'connected') return false;
      if (filterHealth === 'DISCONNECTED' && c.status === 'connected') return false;
      if (filterHealth === 'HEALTHY' && c.anomalyScore >= 50) return false;
      if (filterHealth === 'ANOMALY' && c.anomalyScore < 50) return false;
    }
    return true;
  });

  const selectedCluster = filteredClusters.find(c => c.id === selectedClusterId);

  // Keep selected cluster synchronized with filtered results
  useEffect(() => {
    if (filteredClusters.length > 0) {
      const isStillVisible = filteredClusters.some(c => c.id === selectedClusterId);
      if (!isStillVisible) {
        setSelectedClusterId(filteredClusters[0].id);
      }
    } else {
      setSelectedClusterId('');
    }
  }, [searchQuery, filterType, filterHealth, clusters]);

  // Test connection state
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    protocol?: string;
  } | null>(null);
  const [skipTlsVerify, setSkipTlsVerify] = useState(true);

  const handleTestConnection = async () => {
    if (!newEndpoint.trim()) {
      setConnectionTestResult({ success: false, message: 'Harap masukkan Endpoint URL terlebih dahulu.' });
      return;
    }

    setTestingConnection(true);
    setConnectionTestResult(null);

    try {
      const res = await fetch('/api/clusters/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: newEndpoint.trim(),
          type: newType,
          skipTlsVerify
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConnectionTestResult({
          success: true,
          message: data.message || 'Koneksi TLS & API Endpoint terverifikasi!',
          latencyMs: data.latencyMs,
          protocol: data.protocol
        });
        if (data.normalizedEndpoint && data.normalizedEndpoint !== newEndpoint) {
          setNewEndpoint(data.normalizedEndpoint);
        }
      } else {
        setConnectionTestResult({
          success: false,
          message: data.error || 'Gagal tersambung ke endpoint. Periksa alamat host dan port.'
        });
      }
    } catch (err: any) {
      setConnectionTestResult({
        success: false,
        message: 'Tidak dapat menjangkau server untuk pengujian koneksi.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEndpoint.trim()) return;

    let targetEndpoint = newEndpoint.trim();
    if (!targetEndpoint.startsWith('http://') && !targetEndpoint.startsWith('https://')) {
      targetEndpoint = `https://${targetEndpoint}`;
    }

    setLoading(true);
    try {
      const created = await onAddCluster(newName.trim(), newType, targetEndpoint, Number(newCapacityGB));
      if (created) {
        if (typeof created === 'object' && (created as any).id) {
          setSelectedClusterId((created as any).id);
        }
        setShowAddForm(false);
        setNewName('');
        setNewType('Proxmox VE');
        setNewEndpoint('https://pve-cluster.corp.internal:8006/api2/json');
        setNewAuthToken('root@pam!token');
        setNewCapacityGB(10240);
        setConnectionTestResult(null);
      }
    } catch (err) {
      console.error('Error adding cluster:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
            Manajemen Kluster Virtualisasi
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Pantau hypervisor fisik, kelola VM, dan simulasikan load untuk anomali.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {onOpenAiAnalysis && (
            <button
              onClick={() => onOpenAiAnalysis('clusters')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer group"
              title="Audit & Analisis AI Keseimbangan Beban Kluster"
            >
              <Sparkles className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform animate-pulse" />
              <span>Analisis AI Kluster</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Integrasi Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Clusters List */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search & Filter Bar Panel */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">Cari & Filter</span>
              {(searchQuery || filterType !== 'ALL' || filterHealth !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('ALL');
                    setFilterHealth('ALL');
                  }}
                  className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Text Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari kluster (nama, endpoint, versi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-9 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Filters Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Filter: Virtualization Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Tipe Virtualisasi</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Platform ({clusters.length})</option>
                  {VIRTUALIZATION_CATEGORIES.map(cat => {
                    const platforms = VIRTUALIZATION_PLATFORMS.filter(p => p.category === cat);
                    return (
                      <optgroup key={cat} label={cat} className="bg-slate-900 text-indigo-300 font-bold">
                        {platforms.map(p => (
                          <option key={p.value} value={p.value} className="bg-slate-950 text-slate-300 font-normal">
                            {p.label}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Filter: Health / Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Kesehatan / Status</label>
                <select
                  value={filterHealth}
                  onChange={(e) => setFilterHealth(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="CONNECTED">Terhubung</option>
                  <option value="DISCONNECTED">Terputus / Error</option>
                  <option value="HEALTHY">Sehat (Anomali &lt; 50)</option>
                  <option value="ANOMALY">Anomali Aktif (&ge; 50)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block font-sans">
              Daftar Kluster Aktif ({filteredClusters.length})
            </span>
          </div>
          
          <div className="space-y-2.5">
            {filteredClusters.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 space-y-3">
                <p className="text-xs">Tidak ada kluster yang cocok dengan pencarian atau filter Anda.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('ALL');
                    setFilterHealth('ALL');
                  }}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-all font-semibold hover:underline"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              filteredClusters.map((c) => {
                const isActive = c.id === selectedClusterId;
                const storagePercent = Math.round((c.storageUsedGB / c.storageCapacityGB) * 100);
                
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClusterId(c.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-slate-900 border-indigo-500 shadow-xl'
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isActive ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-slate-100 leading-tight">{c.name}</h4>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                            }`} />
                          </div>
                          <span className="text-[11px] font-sans text-indigo-400 font-semibold block mt-1">{c.type}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setClusterToDelete(c);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus Integrasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metrics Row */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-mono border-t border-slate-800/60 pt-3">
                      <div>
                        <span className="text-slate-500 block uppercase">Node</span>
                        <strong className="text-slate-200 mt-0.5 block">{c.nodes.length} Unit</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase">Mesin VM</span>
                        <strong className="text-slate-200 mt-0.5 block">{c.vms.length} VM</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase">Anomali</span>
                        <strong className={`mt-0.5 block ${c.anomalyScore > 60 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                          {c.anomalyScore}/100
                        </strong>
                      </div>
                    </div>

                    {/* Storage Status */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-500">Penyimpanan Terpakai</span>
                        <span className="text-slate-300 font-semibold">{storagePercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            storagePercent >= 85 ? 'bg-rose-500' : storagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${storagePercent}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Cluster Detail Panel */}
        <div className="lg:col-span-8">
          {selectedCluster ? (
            <div className="space-y-6">
              {/* Core Info & Workload Simulator Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg text-xs font-semibold font-sans">
                        {selectedCluster.type}
                      </span>
                      <span className="text-slate-500 text-xs font-mono">{selectedCluster.version}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mt-1.5 font-sans">{selectedCluster.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedCluster.endpoint}</span>
                    </div>
                  </div>

                  {/* Storage Fabric / SDS Health Badge */}
                  {selectedCluster.cephStatus && selectedCluster.cephStatus !== 'N/A' ? (
                    <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-3">
                      <Layers className="w-5 h-5 text-indigo-400" />
                      <div>
                        <span className="text-[10px] font-sans text-slate-500 block uppercase leading-none">
                          {selectedCluster.type.includes('Proxmox') ? 'Ceph SDS Health' :
                           selectedCluster.type.includes('vSphere') || selectedCluster.type.includes('ESXi') ? 'vSAN Cluster Health' :
                           selectedCluster.type.includes('Nutanix') ? 'Nutanix DSF Health' :
                           selectedCluster.type.includes('OpenStack') ? 'Cinder/Ceph Health' : 'Storage Fabric Health'}
                        </span>
                        <strong className={`text-xs font-mono mt-1 block leading-none ${
                          selectedCluster.cephStatus.includes('OK') || selectedCluster.cephStatus.includes('OPTIMAL')
                            ? 'text-emerald-400' 
                            : selectedCluster.cephStatus.includes('WARN')
                              ? 'text-amber-400'
                              : 'text-rose-400 font-bold'
                        }`}>
                          {selectedCluster.cephStatus}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-3">
                      <Database className="w-5 h-5 text-indigo-400" />
                      <div>
                        <span className="text-[10px] font-sans text-slate-500 block uppercase leading-none">Storage Subsystem</span>
                        <strong className="text-xs font-mono mt-1 block leading-none text-emerald-400">
                          ONLINE (ACTIVE)
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulation Control Panel */}
                <div className="mt-5 bg-indigo-950/20 border border-indigo-500/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide font-sans">Konsol Simulasi Beban Kerja (Anomaly Generator)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Picu skenario anomali buatan untuk menguji reaksi visual dashboard dan respon asisten Gemini AI terhadap kegagalan infrastruktur real-time:
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onSimulateWorkload(selectedCluster.id, 'spike_cpu')}
                      className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Spike CPU Node & VM</span>
                    </button>
                    <button
                      onClick={() => onSimulateWorkload(selectedCluster.id, 'leak_ram')}
                      className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Kebocoran RAM</span>
                    </button>
                    <button
                      onClick={() => onSimulateWorkload(selectedCluster.id, 'heavy_io')}
                      className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Storage / Ceph Kritis</span>
                    </button>
                    <button
                      onClick={() => onSimulateWorkload(selectedCluster.id, 'clear')}
                      className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all ml-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset Kluster Normal</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Physical Nodes Overview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <span>Node Fisik (Hypervisors)</span>
                  </h4>
                  <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-xl text-[11px] font-sans">
                    <button
                      type="button"
                      onClick={() => setNodeViewTab('metrics')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                        nodeViewTab === 'metrics'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Utilitas CPU/RAM
                    </button>
                    <button
                      type="button"
                      onClick={() => setNodeViewTab('disks')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1.5 ${
                        nodeViewTab === 'disks'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>Monitor Slot Disk</span>
                    </button>
                  </div>
                </div>
                
                {nodeViewTab === 'metrics' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCluster.nodes.map((node) => (
                      <div key={node.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-100">{node.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            node.status === 'online'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : node.status === 'offline'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {node.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Bar Metrics */}
                        <div className="space-y-2 text-[11px] font-sans text-slate-400">
                          {/* CPU usage */}
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[10px]">
                              <span>Penggunaan CPU</span>
                              <span className="text-slate-200">{node.cpuUsage}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full" style={{ width: `${node.cpuUsage}%` }} />
                            </div>
                          </div>

                          {/* RAM usage */}
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[10px]">
                              <span>Penggunaan RAM</span>
                              <span className="text-slate-200">{node.ramUsage}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${node.ramUsage}%` }} />
                            </div>
                          </div>

                          {/* Storage usage */}
                          <div className="space-y-1">
                            <div className="flex justify-between font-mono text-[10px]">
                              <span>Penyimpanan Lokal</span>
                              <span className="text-slate-200">{node.storageUsage}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{ width: `${node.storageUsage}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Hardware Health Check Quick Link */}
                        {onNavigateToHardware && (
                          <button
                            type="button"
                            onClick={() => onNavigateToHardware(node.id)}
                            className="w-full mt-2.5 py-1.5 px-2.5 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 hover:border-indigo-700 rounded-lg text-2xs font-mono font-medium flex items-center justify-between transition cursor-pointer group"
                          >
                            <span className="flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                              <span>Diagnostik Hardware Lengkap</span>
                            </span>
                            <span className="text-indigo-400 font-bold">&rarr;</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-400 leading-relaxed -mt-2">
                      Visualisasi layout slot bay fisik (hot-swap drive trays) untuk masing-masing Node di kluster <strong className="text-slate-200">{selectedCluster.name}</strong>. Klik pada slot disk yang terpasang untuk melihat spesifikasi detail dan status S.M.A.R.T.
                    </p>
                    
                    {selectedCluster.nodes.map((node) => {
                      const diskSlots = getDiskSlotsForNode(selectedCluster.id, node.name, selectedCluster.anomalyScore);
                      return (
                        <div key={node.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-100">{node.name}</span>
                              <span className="text-[10px] text-slate-500">({diskSlots.filter(s => s.status !== 'empty').length}/8 Slot Terisi)</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              node.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              CHASSIS OK
                            </span>
                          </div>

                          {/* Physical Drive Bay representation */}
                          <div className="bg-slate-900 border border-slate-950 p-2.5 rounded-xl grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                            {diskSlots.map((slot) => {
                              const blinkKey = `${node.name}-${slot.slotId}`;
                              const isBlinking = blinkingSlots[blinkKey];
                              
                              return (
                                <button
                                  key={slot.slotId}
                                  type="button"
                                  onClick={() => {
                                    if (slot.status !== 'empty') {
                                      setSelectedDisk({ ...slot, nodeName: node.name, nodeId: node.id });
                                      setSmartTestProgress(-1);
                                    }
                                  }}
                                  disabled={slot.status === 'empty'}
                                  className={`relative text-left rounded-lg p-2 flex flex-col justify-between h-[84px] transition-all border select-none group/slot ${
                                    slot.status === 'empty'
                                      ? 'bg-slate-950/20 border-slate-900/60 border-dashed cursor-not-allowed'
                                      : 'bg-slate-950 border-slate-800/80 hover:border-indigo-500 cursor-pointer hover:bg-slate-950/80'
                                  }`}
                                >
                                  {/* Slot Number Badge */}
                                  <span className="text-[9px] font-mono font-bold text-slate-500 leading-none">
                                    S{slot.slotId}
                                  </span>

                                  {slot.status !== 'empty' ? (
                                    <>
                                      {/* Slot Contents */}
                                      <div className="flex flex-col mt-1 leading-none">
                                        <span className="text-[9px] font-sans font-bold text-slate-200 truncate group-hover/slot:text-indigo-400 transition-colors">
                                          {slot.capacity}
                                        </span>
                                        <span className="text-[8px] font-mono text-slate-500 mt-0.5 truncate uppercase">
                                          {slot.type.split(' ')[0]}
                                        </span>
                                      </div>

                                      {/* Bottom indicator row: LED & Temp */}
                                      <div className="flex items-center justify-between w-full mt-2 pt-1 border-t border-slate-900">
                                        <span className="text-[8px] font-mono text-slate-400">
                                          {slot.temp}°C
                                        </span>
                                        {/* Status LED */}
                                        <div className="relative flex h-2 w-2">
                                          {isBlinking ? (
                                            <>
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></span>
                                            </>
                                          ) : slot.status === 'healthy' ? (
                                            <>
                                              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"></span>
                                            </>
                                          ) : slot.status === 'warning' ? (
                                            <>
                                              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]"></span>
                                            </>
                                          ) : (
                                            <>
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-40"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,1)]"></span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center w-full h-full">
                                      <span className="text-[8px] font-mono font-bold text-slate-700 tracking-wider">KOSONG</span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Virtual Machines Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-100 font-sans">Mesin Virtual Terdaftar (VMs)</h4>
                  
                  {/* Elegant Scroll controls */}
                  <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-1">
                    <button
                      onClick={() => scrollVMs('up')}
                      className="p-1.5 rounded-lg bg-slate-900/40 text-slate-400 hover:text-white hover:bg-indigo-600/25 border border-transparent hover:border-indigo-500/30 transition-all cursor-pointer"
                      title="Scroll ke Atas"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3 bg-slate-800/60" />
                    <button
                      onClick={() => scrollVMs('down')}
                      className="p-1.5 rounded-lg bg-slate-900/40 text-slate-400 hover:text-white hover:bg-indigo-600/25 border border-transparent hover:border-indigo-500/30 transition-all cursor-pointer"
                      title="Scroll ke Bawah"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div 
                  ref={vmTableRef}
                  className="overflow-auto -mx-5 max-h-[280px] scroll-smooth"
                >
                  <table className="w-full text-left text-xs text-slate-300 font-sans min-w-[600px] relative">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider font-mono sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-3.5 bg-slate-950">Nama VM</th>
                        <th className="px-5 py-3.5 bg-slate-950">Status</th>
                        <th className="px-5 py-3.5 bg-slate-950">vCPU/RAM</th>
                        <th className="px-5 py-3.5 bg-slate-950">Alamat IP</th>
                        <th className="px-5 py-3.5 text-right bg-slate-950">Utilisasi CPU</th>
                        <th className="px-5 py-3.5 text-right bg-slate-950">Utilisasi RAM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {selectedCluster.vms.map((vm) => (
                        <tr key={vm.id} className="hover:bg-slate-900/40">
                          <td className="px-5 py-3.5 font-bold text-slate-100">{vm.name}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              vm.status === 'running' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {vm.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-400 text-2xs">
                            {vm.cpuCores} vCPU / {vm.ramGB} GB RAM
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-400">{vm.ipAddress}</td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-200">
                            {vm.status === 'running' ? `${vm.cpuUsage}%` : '0%'}
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-200">
                            {vm.status === 'running' ? `${vm.ramUsage}%` : '0%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              {clusters.length > 0 ? (
                <span>Tidak ada kluster yang cocok dengan kriteria filter Anda. Silakan sesuaikan pencarian.</span>
              ) : (
                <span>Belum ada kluster terdaftar. Klik "Tambah Integrasi Baru" untuk mengintegrasikan.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grafana-Style Telemetry History Panel */}
      <div id="grafana-telemetry-panel" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-5 shadow-xl">
        {/* Header section with Title and Metric Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              Analisis Telemetri Multi-Cluster (History & Export)
            </h3>
            <p className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 font-medium">
              Monitoring metrik performa historis hari, bulan, tahun dan ekspor data dalam format CSV atau JSON.
            </p>
          </div>

          {/* Metric select pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
            {(['storage', 'cpu', 'ram', 'network'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer ${
                  selectedMetric === metric
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {metric === 'storage' ? 'Penyimpanan' : metric === 'cpu' ? 'CPU' : metric === 'ram' ? 'RAM' : 'Jaringan'}
              </button>
            ))}
          </div>
        </div>

          {/* Controls Bar: Time Range Selector & Exporters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-300 dark:border-slate-800/80">
          {/* Range Info */}
          <div className="text-slate-900 dark:text-slate-200 text-xs font-bold font-sans flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Menampilkan metrik: <strong className="text-indigo-700 dark:text-indigo-400 uppercase font-black">{selectedMetric === 'storage' ? 'Penyimpanan' : selectedMetric === 'cpu' ? 'CPU' : selectedMetric === 'ram' ? 'RAM' : 'Jaringan'}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Custom Range Direct Edit Button (Visible when Custom is active) */}
            {timeRange === 'custom' && (
              <button
                onClick={() => setShowCustomRangeModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-2 bg-indigo-50 dark:bg-indigo-600/15 hover:bg-indigo-100 dark:hover:bg-indigo-600/25 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Ubah Rentang Tanggal Kustom"
              >
                <CalendarRange className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline font-bold">Ubah Tanggal</span>
              </button>
            )}

            {/* Time Range Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTimeRangeDropdown(!showTimeRangeDropdown);
                  setShowExportDropdown(false);
                }}
                className={`flex items-center gap-2 border text-xs font-bold px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  timeRange === 'custom'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-500/50 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                    : 'bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                }`}
              >
                {timeRange === 'custom' ? (
                  <CalendarRange className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />
                )}
                <span className="font-bold">
                  {timeRange === 'day' 
                    ? 'Hari Ini (24 Jam)' 
                    : timeRange === 'week' 
                    ? '7 Hari Terakhir'
                    : timeRange === 'month' 
                    ? 'Bulan Ini (30 Hari)' 
                    : timeRange === 'quarter'
                    ? '3 Bulan Terakhir (90 Hari)'
                    : timeRange === 'year' 
                    ? 'Tahun Ini (12 Bulan)' 
                    : `Kustom: ${appliedCustomRange.label}`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500" />
              </button>

              {showTimeRangeDropdown && (
                <div 
                  className="absolute right-0 mt-1.5 w-60 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 border-2 font-sans"
                  style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000000' }}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-black mb-1 border-b border-slate-200" style={{ color: '#000000' }}>
                    Pilihan Preset Waktu
                  </div>
                  {[
                    { id: 'day', label: 'Hari Ini (24 Jam)' },
                    { id: 'week', label: '7 Hari Terakhir' },
                    { id: 'month', label: 'Bulan Ini (30 Hari)' },
                    { id: 'quarter', label: '3 Bulan Terakhir (90 Hari)' },
                    { id: 'year', label: 'Tahun Ini (12 Bulan)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTimeRange(item.id as any);
                        setShowTimeRangeDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-sans font-bold rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                      style={{ color: '#000000' }}
                    >
                      <span className="font-bold" style={{ color: '#000000' }}>{item.label}</span>
                      {timeRange === item.id && <Check className="w-3.5 h-3.5 text-indigo-600 font-black" />}
                    </button>
                  ))}

                  <div className="my-1 border-t border-slate-200" />

                  <button
                    onClick={() => {
                      setShowTimeRangeDropdown(false);
                      setShowCustomRangeModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-sans font-black rounded-lg transition-colors cursor-pointer border"
                    style={{
                      backgroundColor: timeRange === 'custom' ? '#e0e7ff' : '#f8fafc',
                      borderColor: timeRange === 'custom' ? '#4f46e5' : '#cbd5e1',
                      color: '#4338ca'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarRange className="w-3.5 h-3.5 text-indigo-700" />
                      <span className="font-black" style={{ color: '#4338ca' }}>Kustom Rentang Tanggal...</span>
                    </div>
                    {timeRange === 'custom' && <Check className="w-3.5 h-3.5 text-indigo-700 font-black" />}
                  </button>
                </div>
              )}
            </div>

            {/* Export Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowExportDropdown(!showExportDropdown);
                  setShowTimeRangeDropdown(false);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Data</span>
                <ChevronDown className="w-3 h-3 text-indigo-200" />
              </button>

              {showExportDropdown && (
                <div 
                  className="absolute right-0 mt-1.5 w-56 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 border-2 font-sans"
                  style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000000' }}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider font-black border-b border-slate-200 mb-1" style={{ color: '#000000' }}>
                    FORMAT DOKUMEN & SPREADSHEET
                  </div>

                  {/* Excel */}
                  <button
                    onClick={() => handleExportDocument('excel')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    style={{ color: '#000000' }}
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold" style={{ color: '#000000' }}>Microsoft Excel</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-black border border-emerald-300">.XLSX</span>
                  </button>

                  {/* PDF */}
                  <button
                    onClick={() => handleExportDocument('pdf')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    style={{ color: '#000000' }}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span className="font-bold" style={{ color: '#000000' }}>Dokumen PDF</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px] font-black border border-rose-300">.PDF</span>
                  </button>

                  {/* Word */}
                  <button
                    onClick={() => handleExportDocument('word')}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    style={{ color: '#000000' }}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-bold" style={{ color: '#000000' }}>Microsoft Word</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-black border border-blue-300">.DOC</span>
                  </button>

                  <div className="my-1 border-t border-slate-200" />

                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider font-black" style={{ color: '#000000' }}>
                    DATA RAW TELEMETRI
                  </div>

                  {/* CSV */}
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    style={{ color: '#000000' }}
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-teal-600" />
                      <span className="font-bold" style={{ color: '#000000' }}>Ekspor ke CSV</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-[10px] font-black border border-teal-300">.CSV</span>
                  </button>

                  {/* JSON */}
                  <button
                    onClick={exportToJSON}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    style={{ color: '#000000' }}
                  >
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-amber-600" />
                      <span className="font-bold" style={{ color: '#000000' }}>Ekspor ke JSON</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-black border border-amber-300">.JSON</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Chart Display */}
        <div className="h-[300px] w-full bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartTelemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {clusters.map((c, i) => (
                  <linearGradient key={c.id} id={`color-cluster-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={['#6366f1', '#f43f5e', '#10b981', '#f59e0b'][i % 4]} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={['#6366f1', '#f43f5e', '#10b981', '#f59e0b'][i % 4]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-slate-800)" />
              <XAxis dataKey="timestamp" stroke="var(--color-slate-500)" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="var(--color-slate-500)" 
                fontSize={11} 
                tickLine={false} 
                domain={selectedMetric === 'network' ? [0, 'auto'] : [0, 100]}
                unit={selectedMetric === 'network' ? ' MB/s' : '%'} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-slate-900)', borderColor: 'var(--color-slate-800)', borderRadius: '12px' }}
                labelStyle={{ color: 'var(--color-slate-400)', fontWeight: 600 }}
                formatter={(value) => [`${value} ${selectedMetric === 'network' ? 'MB/s' : '%'}`, undefined]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
              {clusters.map((c, i) => (
                <Area
                  key={c.id}
                  type="monotone"
                  dataKey={c.name}
                  stroke={['#6366f1', '#f43f5e', '#10b981', '#f59e0b'][i % 4]}
                  fillOpacity={1}
                  fill={`url(#color-cluster-${c.id})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Cluster Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-1.5 font-sans">Tambah Integrasi Virtualisasi Baru</h3>
            <p className="text-slate-400 text-xs mb-5 leading-relaxed">
              Konfigurasikan API Endpoint untuk melacak telemetri resource secara terpusat.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Platform Virtualisasi (Enterprise Standard)</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
                    {VIRTUALIZATION_PLATFORMS.length} Platform Didukung
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={newType}
                    onChange={(e) => handlePlatformChange(e.target.value as VirtualizationType)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-3 text-slate-100 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all shadow-inner font-sans appearance-none pr-10"
                  >
                    {VIRTUALIZATION_CATEGORIES.map(category => {
                      const platforms = VIRTUALIZATION_PLATFORMS.filter(p => p.category === category);
                      return (
                        <optgroup key={category} label={category} className="bg-slate-900 text-indigo-300 font-bold py-1">
                          {platforms.map(p => (
                            <option key={p.value} value={p.value} className="bg-slate-950 text-slate-100 py-1.5 font-sans font-medium">
                              {p.label}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Selected Platform Informational Badge */}
                {(() => {
                  const meta = getPlatformMeta(newType);
                  if (!meta) return null;
                  return (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {meta.category} · {meta.vendor}
                        </span>
                        <span className="text-slate-400">
                          Port Bawaan: <code className="text-slate-200 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">:{meta.defaultPort}</code>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        {meta.description}
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Nama Kluster (Alias)</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Proxmox-Prod-Core"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Telemetry API Endpoint URL</label>
                  <span className="text-[10px] font-mono text-slate-500">Mendukung Hostname / IP:Port</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="misal: https://pve.domain.id:8006/api2/json atau 10.10.20.100:8006"
                    value={newEndpoint}
                    onChange={(e) => {
                      setNewEndpoint(e.target.value);
                      setConnectionTestResult(null);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    disabled={testingConnection || !newEndpoint.trim()}
                    onClick={handleTestConnection}
                    className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 rounded-xl font-semibold text-xs transition-all cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                    title="Uji koneksi TLS dan ketersediaan API Endpoint"
                  >
                    {testingConnection ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">Menguji...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Uji Koneksi</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Connection Test Result Badge */}
                {connectionTestResult && (
                  <div className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between gap-2 animate-in fade-in ${
                    connectionTestResult.success 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {connectionTestResult.success ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{connectionTestResult.message}</span>
                    </div>
                    {connectionTestResult.latencyMs && (
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800 shrink-0 font-bold">
                        {connectionTestResult.latencyMs}ms · {connectionTestResult.protocol || 'TLS 1.3'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Kapasitas Penyimpanan (GB)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newCapacityGB}
                    onChange={(e) => setNewCapacityGB(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Username / Auth Token</label>
                  <input
                    type="text"
                    value={newAuthToken}
                    onChange={(e) => setNewAuthToken(e.target.value)}
                    placeholder="root@pam!token"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Advanced TLS / Self-Signed Option */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Sertifikat Internal / Self-Signed</span>
                    <span className="text-[10px] text-slate-500 block">Abaikan verifikasi CA publik untuk IP lokal datacenter</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipTlsVerify}
                    onChange={(e) => setSkipTlsVerify(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="bg-indigo-950/20 border border-indigo-500/10 p-3.5 rounded-xl text-slate-400 text-2xs leading-relaxed mt-2">
                "Koneksi terenkripsi. Telemetri akan ditarik secara berkala (setiap 10 detik) dan dianalisis menggunakan akselerasi RAPIDS dan Gemini AI."
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/10"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Menyambungkan...' : 'Selesaikan Integrasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disk Detail & SMART Diagnostics Modal */}
      {selectedDisk && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedDisk(null);
                setSmartTestProgress(-1);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-indigo-400 mb-4 pb-3 border-b border-slate-800/80">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">S.M.A.R.T. Spesifikasi & Kesehatan Disk</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Node: {selectedDisk.nodeName} • Slot Bay: {selectedDisk.slotId}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Core Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-[11px]">
                <div className="space-y-1">
                  <span className="text-slate-500 block uppercase text-[9px] font-bold">Model Disk</span>
                  <span className="text-slate-200 font-bold">{selectedDisk.model}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block uppercase text-[9px] font-bold">Serial Number</span>
                  <span className="text-slate-300 font-bold">{selectedDisk.serial}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block uppercase text-[9px] font-bold">Tipe & Interface</span>
                  <span className="text-indigo-400 font-bold">{selectedDisk.type} ({selectedDisk.interface})</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 block uppercase text-[9px] font-bold">Kapasitas Disk</span>
                  <span className="text-emerald-400 font-bold">{selectedDisk.capacity}</span>
                </div>
              </div>

              {/* Status metrics bar */}
              <div className="space-y-3.5">
                {/* Temperature Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Temperatur Drive</span>
                    <strong className={`font-bold ${
                      selectedDisk.temp > 60 ? 'text-rose-400' : selectedDisk.temp > 48 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {selectedDisk.temp}°C {selectedDisk.temp > 60 ? '(Kritis)' : selectedDisk.temp > 48 ? '(Tinggi)' : '(Normal)'}
                    </strong>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-800 h-2.5 rounded-full p-0.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedDisk.temp > 60 ? 'bg-rose-500' : selectedDisk.temp > 48 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} 
                      style={{ width: `${Math.min(100, (selectedDisk.temp / 80) * 100)}%` }} 
                    />
                  </div>
                </div>

                {/* SSD Wearout percentage if NVMe or SATA SSD */}
                {selectedDisk.wearout !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Kesehatan SSD (Wearout Remaining)</span>
                      <strong className={`font-bold ${selectedDisk.wearout < 15 ? 'text-rose-400 font-bold' : selectedDisk.wearout < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {selectedDisk.wearout}% Remaining {selectedDisk.wearout < 15 ? '(Kritis)' : ''}
                      </strong>
                    </div>
                    <div className="w-full bg-slate-950 border border-slate-800 h-2.5 rounded-full p-0.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedDisk.wearout < 15 ? 'bg-rose-500' : selectedDisk.wearout < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${selectedDisk.wearout}%` }} 
                      />
                    </div>
                  </div>
                )}

                {/* Disk Space Usage */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Penyimpanan Terpakai di RAID Array</span>
                    <strong className="text-slate-200">{selectedDisk.usage}% ({selectedDisk.raidGroup})</strong>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-800 h-2.5 rounded-full p-0.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedDisk.usage}%` }} />
                  </div>
                </div>
              </div>

              {/* Read/Write real-time speeds */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Kecepatan Baca</span>
                    <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">{selectedDisk.readSpeed}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                </div>
                <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Kecepatan Tulis</span>
                    <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">{selectedDisk.writeSpeed}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                </div>
              </div>

              {/* S.M.A.R.T. Self-Testing UI */}
              {smartTestProgress >= 0 && (
                <div className="bg-slate-950 border border-indigo-950/40 p-4 rounded-xl space-y-2 mt-2">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Mengecek S.M.A.R.T. Sector...
                    </span>
                    <span className="text-slate-300 font-bold">{smartTestProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${smartTestProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-between gap-2.5 pt-5 mt-5 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  const blinkKey = `${selectedDisk.nodeName}-${selectedDisk.slotId}`;
                  setBlinkingSlots(prev => ({ ...prev, [blinkKey]: !prev[blinkKey] }));
                }}
                className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all border flex items-center gap-2 cursor-pointer ${
                  blinkingSlots[`${selectedDisk.nodeName}-${selectedDisk.slotId}`]
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  blinkingSlots[`${selectedDisk.nodeName}-${selectedDisk.slotId}`] ? 'bg-blue-400 animate-ping' : 'bg-slate-400'
                }`} />
                <span>
                  {blinkingSlots[`${selectedDisk.nodeName}-${selectedDisk.slotId}`] ? 'Matikan Blink LED' : 'Blink LED Disk'}
                </span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={smartTestProgress >= 0}
                  onClick={() => {
                    setSmartTestProgress(0);
                    let current = 0;
                    const interval = setInterval(() => {
                      current += 10;
                      setSmartTestProgress(current);
                      if (current >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                          setSmartTestProgress(-1);
                        }, 500);
                      }
                    }, 250);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                >
                  Jalankan Self-Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDisk(null);
                    setSmartTestProgress(-1);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deletion */}
      {clusterToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setClusterToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <div className="p-3 bg-rose-500/10 rounded-full">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">Hapus Integrasi Kluster</h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">Tindakan ini tidak dapat dibatalkan</span>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus integrasi kluster <strong className="text-slate-100">{clusterToDelete.name}</strong> ({clusterToDelete.type})? Seluruh data riwayat telemetri dan deteksi anomali akan dihapus secara permanen dari sistem.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setClusterToDelete(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCluster(clusterToDelete.id);
                  if (selectedClusterId === clusterToDelete.id) {
                    setSelectedClusterId(clusters.find(x => x.id !== clusterToDelete.id)?.id || '');
                  }
                  setClusterToDelete(null);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/15"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Range Picker Modal */}
      {showCustomRangeModal && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setShowCustomRangeModal(false)}
        >
          <div 
            className="custom-date-modal rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 border-2"
            style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#000000' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-md shadow-indigo-500/20 shrink-0">
                  <CalendarRange className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-sans tracking-tight" style={{ color: '#000000' }}>
                    Kustomisasi Rentang Waktu Telemetri
                  </h3>
                  <p className="text-xs font-bold mt-0.5" style={{ color: '#334155' }}>
                    Pilih tanggal mulai, tanggal selesai, dan resolusi sampel grafik performa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomRangeModal(false)}
                className="p-1.5 rounded-xl transition-colors cursor-pointer"
                style={{ color: '#000000', backgroundColor: '#f1f5f9' }}
                title="Tutup Modal"
              >
                <X className="w-5 h-5" style={{ color: '#000000' }} />
              </button>
            </div>

            {/* Quick Preset Chips */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-black block" style={{ color: '#000000' }}>
                PILIHAN CEPAT (PRESET SHORTCUTS)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '3 Hari', days: 3 },
                  { label: '7 Hari', days: 7 },
                  { label: '14 Hari', days: 14 },
                  { label: '30 Hari', days: 30 },
                  { label: '60 Hari', days: 60 },
                  { label: '90 Hari', days: 90 },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setQuickRangeDays(item.days)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs border-2"
                    style={{ backgroundColor: '#f1f5f9', color: '#000000', borderColor: '#94a3b8' }}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setQuickMonthRange('thisMonth')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs border-2"
                  style={{ backgroundColor: '#f1f5f9', color: '#000000', borderColor: '#94a3b8' }}
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setQuickMonthRange('lastMonth')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shadow-xs border-2"
                  style={{ backgroundColor: '#f1f5f9', color: '#000000', borderColor: '#94a3b8' }}
                >
                  Bulan Lalu
                </button>
              </div>
            </div>

            {/* Date Range Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-black flex items-center justify-between" style={{ color: '#000000' }}>
                  <span className="font-black" style={{ color: '#000000' }}>Tanggal Mulai (Start)</span>
                  <span className="text-[11px] font-mono font-black" style={{ color: '#000000' }}>YYYY-MM-DD</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={customStartDate}
                    max={customEndDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setDateError(null);
                    }}
                    style={{ color: '#000000', backgroundColor: '#ffffff', colorScheme: 'light', WebkitTextFillColor: '#000000', borderColor: '#475569' }}
                    className="date-input-solid w-full bg-white border-2 rounded-xl px-3.5 py-2.5 text-xs font-black text-black focus:outline-none focus:border-indigo-600 transition-all cursor-pointer shadow-inner"
                  />
                </div>
                {customStartDate && (
                  <div className="text-[11px] font-mono font-black px-2 py-0.5 rounded" style={{ backgroundColor: '#e2e8f0', color: '#000000' }}>
                    Terpilih: {formatShortDate(customStartDate)}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black flex items-center justify-between" style={{ color: '#000000' }}>
                  <span className="font-black" style={{ color: '#000000' }}>Tanggal Selesai (End)</span>
                  <span className="text-[11px] font-mono font-black" style={{ color: '#000000' }}>YYYY-MM-DD</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={customEndDate}
                    min={customStartDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setDateError(null);
                    }}
                    style={{ color: '#000000', backgroundColor: '#ffffff', colorScheme: 'light', WebkitTextFillColor: '#000000', borderColor: '#475569' }}
                    className="date-input-solid w-full bg-white border-2 rounded-xl px-3.5 py-2.5 text-xs font-black text-black focus:outline-none focus:border-indigo-600 transition-all cursor-pointer shadow-inner"
                  />
                </div>
                {customEndDate && (
                  <div className="text-[11px] font-mono font-black px-2 py-0.5 rounded" style={{ backgroundColor: '#e2e8f0', color: '#000000' }}>
                    Terpilih: {formatShortDate(customEndDate)}
                  </div>
                )}
              </div>
            </div>

            {/* Granularity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black block" style={{ color: '#000000' }}>
                Resolusi Sampel Data (Granularity)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'auto', label: 'Otomatis', desc: 'Disesuaikan rentang' },
                  { id: 'hourly', label: 'Per Jam', desc: 'Interval 1-4 jam' },
                  { id: 'daily', label: 'Harian', desc: '1 titik per hari' },
                  { id: 'weekly', label: 'Mingguan', desc: '1 titik per 7 hari' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCustomGranularity(item.id as any)}
                    className="p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer"
                    style={{
                      backgroundColor: customGranularity === item.id ? '#e0e7ff' : '#ffffff',
                      borderColor: customGranularity === item.id ? '#4338ca' : '#94a3b8',
                      color: '#000000'
                    }}
                  >
                    <span className="text-xs font-black block" style={{ color: '#000000' }}>{item.label}</span>
                    <span className="text-[10px] font-black block mt-0.5" style={{ color: customGranularity === item.id ? '#312e81' : '#1e293b' }}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Live Summary Card */}
            {customStartDate && customEndDate && (
              <div className="p-3.5 rounded-xl space-y-1.5 text-xs border-2" style={{ backgroundColor: '#f8fafc', borderColor: '#94a3b8', color: '#000000' }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-[11px]" style={{ color: '#000000' }}>Rentang Terpilih:</span>
                  <span className="font-black font-mono text-xs" style={{ color: '#312e81' }}>
                    {formatShortDate(customStartDate)} s/d {formatShortDate(customEndDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-black" style={{ color: '#000000' }}>Total Durasi:</span>
                  <span className="font-black" style={{ color: '#000000' }}>
                    {Math.max(1, Math.round(Math.abs(new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1)} Hari Kalender
                  </span>
                </div>
              </div>
            )}

            {/* Date Validation Alert */}
            {dateError && (
              <div className="p-3 border-2 rounded-xl font-black text-xs flex items-center gap-2" style={{ backgroundColor: '#ffe4e6', borderColor: '#f43f5e', color: '#881337' }}>
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#be123c' }} />
                <span>{dateError}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2" style={{ borderTop: '1px solid #cbd5e1' }}>
              <button
                type="button"
                onClick={() => setShowCustomRangeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer border-2"
                style={{ backgroundColor: '#e2e8f0', borderColor: '#94a3b8', color: '#000000' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyCustomRange}
                className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Rentang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
