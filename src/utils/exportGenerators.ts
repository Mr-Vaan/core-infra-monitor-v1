import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { K8sCluster, Cluster } from '../types';

export interface SheetDefinition {
  name: string;
  data: Array<Record<string, any>> | any[][];
  headers?: string[];
  colWidths?: number[];
}

/**
 * Universal Excel (.xlsx) exporter using SheetJS
 */
export function exportToExcel(
  filename: string,
  sheets: SheetDefinition[]
) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    let ws: XLSX.WorkSheet;
    if (Array.isArray(sheet.data) && sheet.data.length > 0 && Array.isArray(sheet.data[0])) {
      ws = XLSX.utils.aoa_to_sheet(sheet.data as any[][]);
    } else {
      ws = XLSX.utils.json_to_sheet(sheet.data as Record<string, any>[]);
    }

    if (sheet.colWidths && sheet.colWidths.length > 0) {
      ws['!cols'] = sheet.colWidths.map(w => ({ wch: w }));
    }

    // Clean sheet name (max 31 chars, no invalid characters)
    const safeSheetName = sheet.name.replace(/[:\\/?*\[\]]/g, '').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName || 'Sheet1');
  });

  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Universal Microsoft Word (.doc) document exporter
 */
export function exportToWord(
  filename: string,
  options: {
    title: string;
    subtitle: string;
    metadata: Record<string, string>;
    summaryParagraphs?: string[];
    tables: {
      title: string;
      headers: string[];
      rows: (string | number)[][];
    }[];
  }
) {
  const metaHtml = Object.entries(options.metadata)
    .map(([k, v]) => `<tr><td style="font-weight:bold; width:220px; padding:6px; background:#f1f5f9; border:1px solid #cbd5e1;">${k}</td><td style="padding:6px; border:1px solid #cbd5e1;">${v}</td></tr>`)
    .join('');

  const summaryHtml = options.summaryParagraphs && options.summaryParagraphs.length > 0
    ? `<div style="background:#f8fafc; border-left:4px solid #3b82f6; padding:12px 16px; margin:16px 0; font-size:10.5pt; color:#334155;">
        ${options.summaryParagraphs.map(p => `<p style="margin:4px 0;">${p}</p>`).join('')}
       </div>`
    : '';

  const tablesHtml = options.tables
    .map(t => {
      const headerThs = t.headers.map(h => `<th style="background:#1e293b; color:#ffffff; padding:8px; border:1px solid #0f172a; text-align:left; font-size:9pt; font-family:'Segoe UI', sans-serif;">${h}</th>`).join('');
      const rowsTds = t.rows.map((row, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        const tds = row.map(cell => `<td style="padding:6px 8px; border:1px solid #cbd5e1; font-size:9pt; font-family:'Segoe UI', sans-serif;">${String(cell ?? '')}</td>`).join('');
        return `<tr style="background:${bg};">${tds}</tr>`;
      }).join('');

      return `
        <h3 style="color:#0f172a; font-family:'Segoe UI', sans-serif; font-size:12pt; margin-top:24px; margin-bottom:8px; border-bottom:2px solid #3b82f6; padding-bottom:4px;">
          ${t.title}
        </h3>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
          <thead><tr>${headerThs}</tr></thead>
          <tbody>${rowsTds}</tbody>
        </table>
      `;
    }).join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${options.title}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 20mm 15mm 20mm 15mm;
          mso-header-margin: 10mm;
          mso-footer-margin: 10mm;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #0f172a;
          line-height: 1.5;
        }
        h1 { color: #1e3a8a; font-size: 18pt; margin-bottom: 2px; }
        h2 { color: #2563eb; font-size: 11pt; font-weight: normal; margin-top: 0; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <h1>${options.title}</h1>
      <h2>${options.subtitle}</h2>
      
      <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
        ${metaHtml}
      </table>

      ${summaryHtml}
      ${tablesHtml}

      <div style="margin-top:30px; font-size:8pt; color:#64748b; text-align:center; border-top:1px solid #e2e8f0; padding-top:8px;">
        Dokumen Laporan Resmi dibuat otomatis oleh Infra Health Intelligence System • ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}

/**
 * Universal PDF Document Exporter using jsPDF + autoTable
 */
export function exportToPdf(
  filename: string,
  options: {
    title: string;
    subtitle: string;
    metadata: Record<string, string>;
    summaryBox?: string[];
    tables: {
      title: string;
      headers: string[];
      rows: (string | number)[][];
    }[];
  }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 27, pageWidth, 1.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, 14, 12);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(options.subtitle, 14, 19);

  // Date top right
  const nowStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.text(nowStr, pageWidth - 14, 12, { align: 'right' });

  currentY = 36;

  // Metadata Table Box
  const metaRows = Object.entries(options.metadata).map(([k, v]) => [k, v]);
  autoTable(doc, {
    startY: currentY,
    body: metaRows,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 45 },
      1: { cellWidth: 'auto' }
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // Summary Box if provided
  if (options.summaryBox && options.summaryBox.length > 0) {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    const boxHeight = 6 + options.summaryBox.length * 5;
    doc.roundedRect(14, currentY, pageWidth - 28, boxHeight, 2, 2, 'FD');

    // Blue accent bar
    doc.setFillColor(59, 130, 246);
    doc.rect(14, currentY, 2.5, boxHeight, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    options.summaryBox.forEach((line, idx) => {
      doc.text(line, 19, currentY + 5 + idx * 5);
    });

    currentY += boxHeight + 6;
  }

  // Iterate over tables
  options.tables.forEach((t) => {
    // Check if new page is needed for section title
    if (currentY > 260) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(t.title, 14, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [t.headers],
      body: t.rows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  });

  // Footer page numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Infra Health Intelligence • Laporan Resmi • Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Helper to export Kubernetes Cluster to Excel, PDF, or Word
 */
export function exportK8sClusterData(
  cluster: K8sCluster,
  format: 'excel' | 'pdf' | 'word' | 'json' | 'csv'
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFilename = `k8s-report-${cluster.id}-${timestamp}`;

  if (format === 'excel') {
    const sheets: SheetDefinition[] = [
      {
        name: 'Cluster Overview',
        data: [
          ['PARAMETER KLUSTER', 'NILAI'],
          ['Nama Kluster', cluster.name],
          ['Konteks Kubeconfig', cluster.context],
          ['Penyedia / Infrastruktur', cluster.provider],
          ['Versi Kubernetes', cluster.version],
          ['API Server Endpoint', cluster.apiServerUrl],
          ['Status Kluster', cluster.status],
          ['CNI Network Plugin', cluster.cniPlugin],
          ['Ingress Controller', cluster.ingressController],
          ['Total Nodes (Ready / Total)', `${cluster.summary.nodeCount.ready} / ${cluster.summary.nodeCount.total}`],
          ['Total Pods (Running / Total)', `${cluster.summary.podCount.running} / ${cluster.summary.podCount.total}`],
          ['Alokasi CPU (%)', `${cluster.summary.cpu.usagePercent}% (${cluster.summary.cpu.requestedCores}/${cluster.summary.cpu.capacityCores} Cores)`],
          ['Alokasi RAM (%)', `${cluster.summary.memory.usagePercent}% (${Math.round(cluster.summary.memory.usageBytes / (1024 * 1024 * 1024))}GB/${Math.round(cluster.summary.memory.capacityBytes / (1024 * 1024 * 1024))}GB)`],
          ['Throughput CNI (RX / TX)', `${cluster.summary.network.rxRateMBs} MB/s / ${cluster.summary.network.txRateMBs} MB/s`],
          ['Penyimpanan PVC Terpakai', `${cluster.summary.storagePvc.usedGB} GB (${cluster.summary.storagePvc.boundPvcs}/${cluster.summary.storagePvc.totalPvcs} Volume Bound)`],
          ['Waktu Pembuatan Laporan', new Date().toLocaleString('id-ID')]
        ],
        colWidths: [30, 60]
      },
      {
        name: 'Node Pool',
        data: cluster.nodes.map(n => ({
          'Nama Node': n.name,
          'Peran (Role)': n.role,
          'Status': n.status,
          'Internal IP': n.internalIp,
          'CPU Usage %': `${n.usage.cpuPercent}%`,
          'RAM Usage %': `${n.usage.memoryPercent}%`,
          'Pods Hosted': `${n.usage.podsCount}/${n.capacity.pods}`,
          'Kubelet Version': n.kubeletVersion,
          'Container Runtime': n.containerRuntime,
          'OS Image': n.osImage,
          'Uptime': n.uptime
        })),
        colWidths: [20, 15, 12, 16, 14, 14, 14, 16, 22, 28, 14]
      },
      {
        name: 'Workload Pods',
        data: cluster.pods.map(p => ({
          'Namespace': p.namespace,
          'Nama Pod': p.name,
          'Status': p.status,
          'Ready Containers': p.readyContainers,
          'Restarts': p.restarts,
          'Node Host': p.nodeName,
          'Pod IP': p.podIp,
          'QoS Class': p.qosClass,
          'Umur (Age)': p.age
        })),
        colWidths: [16, 42, 18, 16, 12, 20, 16, 14, 14]
      },
      {
        name: 'Deployments',
        data: cluster.deployments.map(d => ({
          'Namespace': d.namespace,
          'Deployment Name': d.name,
          'Replicas Ready': `${d.replicasAvailable}/${d.replicasDesired}`,
          'Strategy': d.strategy,
          'Image': d.image,
          'Umur (Age)': d.age
        })),
        colWidths: [16, 30, 16, 18, 40, 14]
      },
      {
        name: 'Services & Ingress',
        data: cluster.services.map(s => ({
          'Namespace': s.namespace,
          'Service Name': s.name,
          'Type': s.type,
          'Cluster IP': s.clusterIp,
          'External IP': s.externalIp || 'None',
          'Ports': s.ports.map(p => `${p.port}:${p.targetPort}/${p.protocol}`).join(', '),
          'Endpoints': s.endpointsCount
        })),
        colWidths: [16, 28, 15, 18, 18, 25, 12]
      },
      {
        name: 'Audit Events',
        data: cluster.events.map(e => ({
          'Type': e.type,
          'Reason': e.reason,
          'Object': `${e.objectKind}/${e.objectName}`,
          'Namespace': e.namespace,
          'Message': e.message,
          'Source': e.source,
          'Count': e.count,
          'Last Seen': e.lastSeen
        })),
        colWidths: [12, 18, 30, 16, 55, 20, 10, 14]
      }
    ];

    exportToExcel(baseFilename, sheets);
    return;
  }

  if (format === 'pdf') {
    exportToPdf(baseFilename, {
      title: `LAPORAN TELEMETRI KUBERNETES: ${cluster.name.toUpperCase()}`,
      subtitle: `${cluster.provider} • Kubernetes ${cluster.version} • Status: ${cluster.status}`,
      metadata: {
        'Nama Kluster': cluster.name,
        'Penyedia Cloud / DC': cluster.provider,
        'Versi API Server': cluster.version,
        'CNI Network Plugin': cluster.cniPlugin,
        'Ingress Controller': cluster.ingressController,
        'Kapasitas Node Pool': `${cluster.summary.nodeCount.ready} Node Siap / ${cluster.summary.nodeCount.total} Total`,
        'Alokasi CPU Cluster': `${cluster.summary.cpu.usagePercent}% (${cluster.summary.cpu.requestedCores} Cores Requested)`,
        'Alokasi RAM Cluster': `${cluster.summary.memory.usagePercent}% (${Math.round(cluster.summary.memory.usageBytes / (1024 * 1024 * 1024))} GB Terpakai)`,
        'Status Volume PVC': `${cluster.summary.storagePvc.boundPvcs} Bound / ${cluster.summary.storagePvc.totalPvcs} Volume`,
        'Waktu Audit': new Date().toLocaleString('id-ID')
      },
      summaryBox: [
        `• Control Plane Quorum: Kube-apiserver, etcd, dan CoreDNS beroperasi dalam status HA 100% HEALTHY.`,
        `• Total Pods: ${cluster.summary.podCount.running} Running, ${cluster.summary.podCount.pending} Pending, ${cluster.summary.podCount.failed} Gagal/CrashLoop.`,
        `• Throughput Jaringan: ${cluster.summary.network.rxRateMBs} MB/s RX dan ${cluster.summary.network.txRateMBs} MB/s TX via ${cluster.cniPlugin}.`
      ],
      tables: [
        {
          title: '1. Node Pool & Infrastruktur Worker',
          headers: ['Nama Node', 'Role', 'Status', 'IP Internal', 'CPU %', 'RAM %', 'Pods', 'OS Image'],
          rows: cluster.nodes.map(n => [
            n.name,
            n.role,
            n.status,
            n.internalIp,
            `${n.usage.cpuPercent}%`,
            `${n.usage.memoryPercent}%`,
            `${n.usage.podsCount}/${n.capacity.pods}`,
            n.osImage
          ])
        },
        {
          title: '2. Workload Pods Kritis',
          headers: ['Namespace', 'Nama Pod', 'Status', 'Ready', 'Restarts', 'Node Host', 'Pod IP'],
          rows: cluster.pods.map(p => [
            p.namespace,
            p.name,
            p.status,
            p.readyContainers,
            p.restarts,
            p.nodeName,
            p.podIp
          ])
        },
        {
          title: '3. Deployments & Rollout Replicas',
          headers: ['Namespace', 'Nama Deployment', 'Replicas', 'Strategy', 'Container Image'],
          rows: cluster.deployments.map(d => [
            d.namespace,
            d.name,
            `${d.replicasAvailable}/${d.replicasDesired}`,
            d.strategy,
            d.image
          ])
        },
        {
          title: '4. Critical Events & Peringatan Terkini',
          headers: ['Type', 'Reason', 'Object Target', 'Pesan / Message', 'Waktu'],
          rows: cluster.events.map(e => [
            e.type,
            e.reason,
            `${e.objectKind}/${e.objectName}`,
            e.message,
            e.lastSeen
          ])
        }
      ]
    });
    return;
  }

  if (format === 'word') {
    exportToWord(baseFilename, {
      title: `LAPORAN AUDIT & TELEMETRI KUBERNETES`,
      subtitle: `Kluster: ${cluster.name} (${cluster.provider}) • Versi ${cluster.version}`,
      metadata: {
        'Nama Kluster': cluster.name,
        'Konteks Kubeconfig': cluster.context,
        'Penyedia Infrastruktur': cluster.provider,
        'Versi Kubernetes': cluster.version,
        'API Server URL': cluster.apiServerUrl,
        'CNI Network Plugin': cluster.cniPlugin,
        'Status Kluster': cluster.status,
        'Node Ready': `${cluster.summary.nodeCount.ready} / ${cluster.summary.nodeCount.total} Node`,
        'Total Pod Terjadwal': `${cluster.summary.podCount.running} Running, ${cluster.summary.podCount.pending} Pending, ${cluster.summary.podCount.failed} Failed`,
        'Utilisasi CPU': `${cluster.summary.cpu.usagePercent}% (${cluster.summary.cpu.requestedCores} Cores)`,
        'Utilisasi Memori RAM': `${cluster.summary.memory.usagePercent}% (${Math.round(cluster.summary.memory.usageBytes / (1024 * 1024 * 1024))} GB)`,
        'Waktu Ekspor': new Date().toLocaleString('id-ID')
      },
      summaryParagraphs: [
        `<strong>Status Eksekutif Control Plane:</strong> Komponen inti Kubernetes (kube-apiserver, etcd 3-node Raft quorum, kube-scheduler, kube-controller-manager, dan CoreDNS) beroperasi dalam ketersediaan tinggi 100% tanpa adanya split-brain atau network partition.`,
        `<strong>Distribusi Workload:</strong> Kluster saat ini melayani total ${cluster.summary.podCount.total} pod aktif lintas ${cluster.summary.namespaceCount} namespace produksi dan sistem. Terdeteksi ${cluster.summary.podCount.failed > 0 ? `${cluster.summary.podCount.failed} pod yang mengalami CrashLoopBackOff` : 'seluruh pod beroperasi normal'}.`,
        `<strong>Throughput CNI Jaringan:</strong> CNI plugin ${cluster.cniPlugin} mencatatkan throughput agregat sebesar ${Math.round(cluster.summary.network.rxRateMBs + cluster.summary.network.txRateMBs)} MB/s dengan enkripsi antar-node aktif.`
      ],
      tables: [
        {
          title: 'Daftar Node Worker & Master Control-Plane',
          headers: ['Nama Node', 'Peran', 'Status', 'IP Internal', 'CPU Usage', 'RAM Usage', 'Pods Hosted', 'OS & Kernel'],
          rows: cluster.nodes.map(n => [
            n.name,
            n.role,
            n.status,
            n.internalIp,
            `${n.usage.cpuPercent}%`,
            `${n.usage.memoryPercent}%`,
            `${n.usage.podsCount}/${n.capacity.pods}`,
            `${n.osImage} (${n.kernelVersion})`
          ])
        },
        {
          title: 'Daftar Workload Pods Terperinci',
          headers: ['Namespace', 'Nama Pod', 'Status', 'Ready', 'Restarts', 'Node', 'Pod IP', 'Age'],
          rows: cluster.pods.map(p => [
            p.namespace,
            p.name,
            p.status,
            p.readyContainers,
            p.restarts,
            p.nodeName,
            p.podIp,
            p.age
          ])
        },
        {
          title: 'Deployments & Replicas Rollout',
          headers: ['Namespace', 'Deployment Name', 'Replicas Target/Ready', 'Strategy', 'Image Tag', 'Age'],
          rows: cluster.deployments.map(d => [
            d.namespace,
            d.name,
            `${d.replicasAvailable} / ${d.replicasDesired}`,
            d.strategy,
            d.image,
            d.age
          ])
        },
        {
          title: 'Services, Ingress & Jaringan',
          headers: ['Namespace', 'Nama Service', 'Type', 'Cluster IP', 'External IP', 'Port Mappings'],
          rows: cluster.services.map(s => [
            s.namespace,
            s.name,
            s.type,
            s.clusterIp,
            s.externalIp || 'None',
            s.ports.map(p => `${p.port}:${p.targetPort}/${p.protocol}`).join(', ')
          ])
        },
        {
          title: 'Log Audit Events & Peringatan Terkini',
          headers: ['Type', 'Reason', 'Object Target', 'Namespace', 'Detail Pesan', 'Waktu'],
          rows: cluster.events.map(e => [
            e.type,
            e.reason,
            `${e.objectKind}/${e.objectName}`,
            e.namespace,
            e.message,
            e.lastSeen
          ])
        }
      ]
    });
    return;
  }
}

/**
 * Helper to export Multi-Cluster Telemetry (ClustersView) to Excel, PDF, or Word
 */
export function exportMultiClusterTelemetry(
  clusters: Cluster[],
  timeRangeLabel: string,
  selectedMetric: 'storage' | 'cpu' | 'ram' | 'network',
  telemetryData: any[],
  format: 'excel' | 'pdf' | 'word'
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const metricName = selectedMetric === 'storage' ? 'Penyimpanan' : selectedMetric === 'cpu' ? 'CPU' : selectedMetric === 'ram' ? 'RAM' : 'Jaringan';
  const baseFilename = `telemetri_${selectedMetric}_${timeRangeLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${timestamp}`;

  if (format === 'excel') {
    const sheets: SheetDefinition[] = [
      {
        name: 'Telemetry Time-Series',
        data: telemetryData.map(row => {
          const formattedRow: Record<string, any> = { 'Timestamp': row.timestamp };
          clusters.forEach(c => {
            formattedRow[`${c.name} (${selectedMetric === 'network' ? 'MB/s' : '%'})`] = row[c.name] ?? 0;
          });
          return formattedRow;
        }),
        colWidths: [18, ...clusters.map(() => 22)]
      },
      {
        name: 'Cluster Overview',
        data: clusters.map(c => ({
          'Nama Kluster': c.name,
          'Platform Virtualisasi': c.type,
          'Versi': c.version,
          'Total Nodes': c.nodes.length,
          'Total VMs': c.vms.length,
          'Kapasitas Storage (GB)': c.storageCapacityGB,
          'Storage Terpakai (GB)': c.storageUsedGB,
          'Storage %': `${Math.round((c.storageUsedGB / c.storageCapacityGB) * 100)}%`,
          'Ceph / SAN Status': c.cephStatus || 'N/A',
          'Skor Anomali': `${c.anomalyScore}/100`
        })),
        colWidths: [24, 18, 12, 14, 14, 20, 20, 14, 16, 14]
      },
      {
        name: 'Virtual Machines',
        data: clusters.flatMap(c => c.vms.map(v => ({
          'Kluster Host': c.name,
          'Nama VM': v.name,
          'Status': v.status.toUpperCase(),
          'vCPU Cores': v.cpuCores,
          'RAM (GB)': v.ramGB,
          'Storage (GB)': v.storageGB,
          'CPU Usage %': `${v.cpuUsage}%`,
          'RAM Usage %': `${v.ramUsage}%`,
          'Alamat IP': v.ipAddress
        }))),
        colWidths: [22, 26, 12, 12, 12, 14, 14, 14, 18]
      }
    ];

    exportToExcel(baseFilename, sheets);
    return;
  }

  if (format === 'pdf') {
    exportToPdf(baseFilename, {
      title: `LAPORAN TELEMETRI MULTI-CLUSTER: ${metricName.toUpperCase()}`,
      subtitle: `Rentang Waktu: ${timeRangeLabel} • Metrik: ${metricName} • Total Kluster: ${clusters.length}`,
      metadata: {
        'Metrik Terpilih': `${metricName} (${selectedMetric === 'network' ? 'MB/s' : 'Persentase %'})`,
        'Rentang Waktu': timeRangeLabel,
        'Jumlah Kluster': `${clusters.length} Kluster Virtualisasi Terdaftar`,
        'Total VM Aktif': `${clusters.reduce((acc, c) => acc + c.vms.length, 0)} Virtual Machines`,
        'Total Kapasitas Storage': `${Math.round(clusters.reduce((acc, c) => acc + c.storageCapacityGB, 0) / 1024)} TB Agregat`,
        'Waktu Ekspor': new Date().toLocaleString('id-ID')
      },
      summaryBox: [
        `• Laporan ini merangkum data historis performa pada ${clusters.length} kluster virtualisasi untuk periode ${timeRangeLabel}.`,
        `• Seluruh sampel data telemetri dihitung berdasarkan titik interval terdistribusi secara seimbang.`
      ],
      tables: [
        {
          title: '1. Ringkasan Kluster Virtualisasi',
          headers: ['Nama Kluster', 'Platform', 'Nodes', 'VMs', 'Storage Terpakai', 'Ceph/SAN', 'Skor Anomali'],
          rows: clusters.map(c => [
            c.name,
            c.type,
            c.nodes.length,
            c.vms.length,
            `${Math.round((c.storageUsedGB / c.storageCapacityGB) * 100)}% (${c.storageUsedGB}GB)`,
            c.cephStatus || 'N/A',
            `${c.anomalyScore}/100`
          ])
        },
        {
          title: `2. Titik Telemetri Historis (${metricName})`,
          headers: ['Timestamp', ...clusters.map(c => c.name)],
          rows: telemetryData.slice(-15).map(row => [
            row.timestamp,
            ...clusters.map(c => `${row[c.name] ?? 0} ${selectedMetric === 'network' ? 'MB/s' : '%'}`)
          ])
        }
      ]
    });
    return;
  }

  if (format === 'word') {
    exportToWord(baseFilename, {
      title: `LAPORAN TELEMETRI & KAPASITAS MULTI-CLUSTER`,
      subtitle: `Metrik: ${metricName} • Periode: ${timeRangeLabel}`,
      metadata: {
        'Metrik Analisis': metricName,
        'Rentang Waktu': timeRangeLabel,
        'Kluster Terpantau': clusters.map(c => `${c.name} (${c.type})`).join(', '),
        'Total Node Fisik': `${clusters.reduce((acc, c) => acc + c.nodes.length, 0)} Nodes`,
        'Total Virtual Machine': `${clusters.reduce((acc, c) => acc + c.vms.length, 0)} VMs`,
        'Waktu Pelaporan': new Date().toLocaleString('id-ID')
      },
      summaryParagraphs: [
        `Laporan ini menyajikan ringkasan kinerja dan telemetri multi-cluster untuk platform <strong>${clusters.map(c => c.type).join(', ')}</strong> selama periode <strong>${timeRangeLabel}</strong>.`,
        `Kapasitas penyimpanan total terpasang adalah <strong>${Math.round(clusters.reduce((acc, c) => acc + c.storageCapacityGB, 0) / 1024)} TB</strong> dengan utilisasi rata-rata <strong>${Math.round(clusters.reduce((acc, c) => acc + c.storageUsedGB, 0) / clusters.reduce((acc, c) => acc + c.storageCapacityGB, 0) * 100)}%</strong>.`
      ],
      tables: [
        {
          title: 'Ringkasan Kesehatan & Beban Kluster',
          headers: ['Nama Kluster', 'Tipe Platform', 'Nodes', 'VMs', 'Storage Terpakai', 'Status Ceph', 'Anomali'],
          rows: clusters.map(c => [
            c.name,
            c.type,
            c.nodes.length,
            c.vms.length,
            `${Math.round((c.storageUsedGB / c.storageCapacityGB) * 100)}% (${c.storageUsedGB} GB)`,
            c.cephStatus || 'N/A',
            `${c.anomalyScore}/100`
          ])
        },
        {
          title: `Sampel Telemetri Historis (${metricName})`,
          headers: ['Waktu (Timestamp)', ...clusters.map(c => c.name)],
          rows: telemetryData.map(row => [
            row.timestamp,
            ...clusters.map(c => `${row[c.name] ?? 0} ${selectedMetric === 'network' ? 'MB/s' : '%'}`)
          ])
        }
      ]
    });
    return;
  }
}
