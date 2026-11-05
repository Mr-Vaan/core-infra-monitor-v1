import { ServerHardware } from '../types';

export const multiBrandAdditionalServers: ServerHardware[] = [
  // ==========================================
  // BRAND SERVER INDONESIA (TKDN CERTIFIED)
  // ==========================================
  {
    id: 'hw-axioo-01',
    nodeId: 'node-axioo-01',
    nodeName: 'axioo-myserver-sx7',
    clusterId: 'cluster-pve-01',
    clusterName: 'Proxmox-CEPH-Prod',
    serverModel: 'Axioo MyServer SX7 2U Dual Xeon Scalable',
    vendor: 'Axioo Enterprise',
    originCountry: 'Indonesia',
    isTkdnCertified: true,
    tkdnScore: 46.85,
    bmcProtocol: 'DMTF Redfish v1.18 & MegaRAC SP-X',
    serialNumber: 'AXIOO-ID-SX7-2026-JKT01',
    assetTag: 'DC-JKT-RACK02-U16',
    biosVersion: 'AMI Aptio V (Axioo Custom v2.4.1)',
    bmcType: 'Axioo MegaRAC / OpenBMC',
    bmcIp: '10.20.10.15',
    bmcStatus: 'optimal',
    overallHealthScore: 99,
    overallStatus: 'healthy',
    uptimeDays: 98,
    formFactor: '2U Rackmount',
    chassisIntrusion: 'closed',
    cmosBattery: { voltage: 3.10, status: 'good' },
    cpu: {
      governor: 'performance',
      microcodeVersion: '0x0d000375',
      spectreMeltdownMitigations: true,
      sockets: [
        {
          socketId: 0,
          model: 'Intel Xeon Gold 6330 (28 Cores / 56 Threads @ 2.00GHz - Boost 3.10GHz)',
          cores: 28,
          threads: 56,
          baseGhz: 2.00,
          currentGhz: 2.85,
          temperatureC: 44.2,
          tjMaxC: 86.0,
          voltageV: 1.15,
          vrmTempC: 49.0,
          throttleStatus: 'none',
          l1CacheKb: 2240,
          l2CacheMb: 35,
          l3CacheMb: 42,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 43, usagePercent: 55 },
            { coreId: 1, tempC: 45, usagePercent: 60 },
            { coreId: 2, tempC: 42, usagePercent: 48 },
            { coreId: 3, tempC: 46, usagePercent: 62 },
            { coreId: 4, tempC: 44, usagePercent: 53 }
          ]
        },
        {
          socketId: 1,
          model: 'Intel Xeon Gold 6330 (28 Cores / 56 Threads @ 2.00GHz - Boost 3.10GHz)',
          cores: 28,
          threads: 56,
          baseGhz: 2.00,
          currentGhz: 2.80,
          temperatureC: 45.1,
          tjMaxC: 86.0,
          voltageV: 1.15,
          vrmTempC: 50.2,
          throttleStatus: 'none',
          l1CacheKb: 2240,
          l2CacheMb: 35,
          l3CacheMb: 42,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 44, usagePercent: 52 },
            { coreId: 1, tempC: 46, usagePercent: 58 },
            { coreId: 2, tempC: 43, usagePercent: 50 },
            { coreId: 3, tempC: 47, usagePercent: 64 },
            { coreId: 4, tempC: 45, usagePercent: 56 }
          ]
        }
      ]
    },
    memory: {
      totalCapacityGb: 256,
      installedDimmCount: 8,
      totalSlots: 16,
      dimmType: 'DDR4 ECC Registered',
      speedMhz: 3200,
      multiBitUncorrectableErrors: 0,
      singleBitCorrectableErrors: 0,
      eccScrubbingStatus: 'active',
      dimmModules: [
        { slot: 'DIMM_A1', channel: 'Channel A', cpuSocket: 0, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'AX-MEM-01', speedMhz: 3200, temperatureC: 39.5, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_A2', channel: 'Channel A', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_B1', channel: 'Channel B', cpuSocket: 0, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'AX-MEM-02', speedMhz: 3200, temperatureC: 40.1, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_B2', channel: 'Channel B', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_C1', channel: 'Channel C', cpuSocket: 0, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'AX-MEM-03', speedMhz: 3200, temperatureC: 38.9, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_C2', channel: 'Channel C', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_D1', channel: 'Channel D', cpuSocket: 0, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'AX-MEM-04', speedMhz: 3200, temperatureC: 39.8, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_D2', channel: 'Channel D', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_E1', channel: 'Channel E', cpuSocket: 1, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'AX-MEM-05', speedMhz: 3200, temperatureC: 40.5, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_E2', channel: 'Channel E', cpuSocket: 1, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_F1', channel: 'Channel F', cpuSocket: 1, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'AX-MEM-06', speedMhz: 3200, temperatureC: 39.2, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_F2', channel: 'Channel F', cpuSocket: 1, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_G1', channel: 'Channel G', cpuSocket: 1, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'AX-MEM-07', speedMhz: 3200, temperatureC: 41.0, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_G2', channel: 'Channel G', cpuSocket: 1, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_H1', channel: 'Channel H', cpuSocket: 1, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'AX-MEM-08', speedMhz: 3200, temperatureC: 40.0, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_H2', channel: 'Channel H', cpuSocket: 1, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 }
      ]
    },
    storage: {
      totalBays: 24,
      populatedBays: 4,
      controller: {
        model: 'Broadcom MegaRAID SAS 9361-8i 12Gb/s',
        firmware: '4.680.00-8542',
        cacheGb: 2,
        bbuStatus: 'optimal',
        bbuCapacityPercent: 100,
        writePolicy: 'WriteBack'
      },
      drives: [
        { bayId: 0, model: 'Micron 7450 PRO 3.84TB NVMe M.2/U.3', protocol: 'NVMe Gen4', capacityGb: 3840, healthPercent: 99, temperatureC: 38.2, wearLevelPercent: 1, tbwWrittenTb: 82.5, powerOnHours: 3200, reallocatedSectors: 0, mediaErrors: 0, status: 'healthy', smartStatus: 'PASSED', detectionState: 'detected', lastSelfTest: '2026-10-25T02:00:00Z', criticalWarning: 0, slotNote: 'Axioo High Speed Ceph OSD #1' },
        { bayId: 1, model: 'Micron 7450 PRO 3.84TB NVMe M.2/U.3', protocol: 'NVMe Gen4', capacityGb: 3840, healthPercent: 99, temperatureC: 37.8, wearLevelPercent: 1, tbwWrittenTb: 80.1, powerOnHours: 3200, reallocatedSectors: 0, mediaErrors: 0, status: 'healthy', smartStatus: 'PASSED', detectionState: 'detected', lastSelfTest: '2026-10-25T02:15:00Z', criticalWarning: 0, slotNote: 'Axioo High Speed Ceph OSD #2' },
        { bayId: 2, model: 'Micron 7450 PRO 3.84TB NVMe M.2/U.3', protocol: 'NVMe Gen4', capacityGb: 3840, healthPercent: 99, temperatureC: 38.5, wearLevelPercent: 1, tbwWrittenTb: 81.4, powerOnHours: 3200, reallocatedSectors: 0, mediaErrors: 0, status: 'healthy', smartStatus: 'PASSED', detectionState: 'detected', lastSelfTest: '2026-10-25T02:30:00Z', criticalWarning: 0, slotNote: 'Axioo High Speed Ceph OSD #3' },
        { bayId: 3, model: 'Micron 7450 PRO 3.84TB NVMe M.2/U.3', protocol: 'NVMe Gen4', capacityGb: 3840, healthPercent: 99, temperatureC: 38.0, wearLevelPercent: 1, tbwWrittenTb: 79.8, powerOnHours: 3200, reallocatedSectors: 0, mediaErrors: 0, status: 'healthy', smartStatus: 'PASSED', detectionState: 'detected', lastSelfTest: '2026-10-25T02:45:00Z', criticalWarning: 0, slotNote: 'Axioo High Speed Ceph OSD #4' },
        { bayId: 4, model: 'Bay Kosong (Hot-Swap Caddy Siap Digunakan)', protocol: 'EMPTY', capacityGb: 0, healthPercent: 100, temperatureC: 0, wearLevelPercent: 0, tbwWrittenTb: 0, powerOnHours: 0, reallocatedSectors: 0, mediaErrors: 0, status: 'empty', smartStatus: 'N/A', detectionState: 'empty', lastSelfTest: 'N/A', criticalWarning: 0, slotNote: 'Slot Bay Kosong (Hot-Plug 2.5" U.3 NVMe/SAS Siap Digunakan)' },
        { bayId: 5, model: 'Bay Kosong (Hot-Swap Caddy Siap Digunakan)', protocol: 'EMPTY', capacityGb: 0, healthPercent: 100, temperatureC: 0, wearLevelPercent: 0, tbwWrittenTb: 0, powerOnHours: 0, reallocatedSectors: 0, mediaErrors: 0, status: 'empty', smartStatus: 'N/A', detectionState: 'empty', lastSelfTest: 'N/A', criticalWarning: 0, slotNote: 'Slot Bay Kosong' }
      ]
    },
    power: {
      redundancyMode: '1+1 Redundant (Active/Standby)',
      totalPowerDrawW: 345,
      powerCapacityW: 2400,
      psus: [
        { id: 'PSU-1', model: 'Axioo 1200W Titanium 80Plus Redundant PSU', status: 'online', detectionState: 'detected', inputVoltageV: 230.2, outputWatts: 175, efficiencyRating: '80 PLUS Titanium', tempC: 39.5, hotPlugReady: true },
        { id: 'PSU-2', model: 'Axioo 1200W Titanium 80Plus Redundant PSU', status: 'online', detectionState: 'detected', inputVoltageV: 230.0, outputWatts: 170, efficiencyRating: '80 PLUS Titanium', tempC: 39.8, hotPlugReady: true }
      ]
    },
    cooling: {
      ambientIntakeTempC: 21.0,
      ambientExhaustTempC: 32.5,
      airflowCfm: 135,
      fanProfile: 'Optimal Auto',
      fans: [
        { fanId: 'Fan 1 (Dual Rotor)', dualRotor: true, rpm: 5900, maxRpm: 14000, pwmPercent: 42, status: 'ok' },
        { fanId: 'Fan 2 (Dual Rotor)', dualRotor: true, rpm: 5950, maxRpm: 14000, pwmPercent: 42, status: 'ok' },
        { fanId: 'Fan 3 (Dual Rotor)', dualRotor: true, rpm: 5880, maxRpm: 14000, pwmPercent: 41, status: 'ok' },
        { fanId: 'Fan 4 (Dual Rotor)', dualRotor: true, rpm: 5920, maxRpm: 14000, pwmPercent: 42, status: 'ok' }
      ],
      thermalZones: [
        { name: 'Axioo Chassis Intake Zone', tempC: 21.0, warnThreshold: 40.0, critThreshold: 46.0 },
        { name: 'CPU 0 Subsystem', tempC: 44.2, warnThreshold: 75.0, critThreshold: 85.0 },
        { name: 'CPU 1 Subsystem', tempC: 45.1, warnThreshold: 75.0, critThreshold: 85.0 }
      ]
    },
    pcieAndNetwork: {
      pcieSlots: [
        { slotId: 'PCIe Slot 1 (Riser 1)', cardName: 'Mellanox ConnectX-5 Dual-port 25GbE SFP28', linkSpeed: 'PCIe 4.0 @ 16.0 GT/s', mechanicalWidth: 'x16', negotiatedWidth: 'x16', aerStatus: 'clean', tempC: 43.5, detectionState: 'detected', slotNote: 'CEPH Storage Replication High Speed Interconnect' },
        { slotId: 'PCIe Slot 2 (Riser 1)', cardName: 'Intel X550 Dual-port 10GbE BASE-T', linkSpeed: 'PCIe 3.0 @ 8.0 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x8', aerStatus: 'clean', tempC: 48.0, detectionState: 'detected', slotNote: 'VM Traffic & Corporate Gateway' },
        { slotId: 'PCIe Slot 3 (Riser 2)', cardName: 'Slot Kosong (Mendukung GPU / HBA)', linkSpeed: 'N/A', mechanicalWidth: 'x16', negotiatedWidth: 'x0', aerStatus: 'n/a', tempC: 0, detectionState: 'empty', slotNote: 'PCIe Gen4 x16 Siap Digunakan' }
      ],
      opticsDom: [
        { port: 'eth0 (SFP28-1)', transceiverType: '25GBASE-SR SFP28', rxPowerDbm: -2.6, txPowerDbm: -1.8, laserBiasMa: 6.2, tempC: 37.5, status: 'optimal' },
        { port: 'eth1 (SFP28-2)', transceiverType: '25GBASE-SR SFP28', rxPowerDbm: -2.8, txPowerDbm: -1.9, laserBiasMa: 6.3, tempC: 37.8, status: 'optimal' }
      ]
    },
    selLogs: [
      { id: 'sel-ax-01', timestamp: '2026-10-28T09:00:00Z', sensor: 'Axioo MegaRAC', severity: 'INFORMATIONAL', description: 'TKDN Kemenperin RI Sertifikasi validasi: Nilai 46.85% aktif terverifikasi.', code: '0x00A1' },
      { id: 'sel-ax-02', timestamp: '2026-10-27T18:14:20Z', sensor: 'Power Redundancy', severity: 'INFORMATIONAL', description: 'Dual PSU 1+1 Titanium mode confirmed normal on 230VAC.', code: '0x0801' }
    ],
    lastDiagnostic: null
  },

  // Zyrex Zaxtro Enterprise (Indonesia - TKDN 48.20%)
  {
    id: 'hw-zyrex-01',
    nodeId: 'node-zyrex-01',
    nodeName: 'zyrex-zaxtro-zs240',
    clusterId: 'cluster-zyrex-id',
    clusterName: 'Zyrex-Zaxtro-HCI',
    serverModel: 'Zyrex Zaxtro ZS-240 2U Enterprise Rack',
    vendor: 'Zyrex Zaxtro',
    originCountry: 'Indonesia',
    isTkdnCertified: true,
    tkdnScore: 48.20,
    bmcProtocol: 'IPMI 2.0 & Redfish v1.16',
    serialNumber: 'ZYREX-ID-ZS240-8819',
    assetTag: 'DC-NEUCENTRIX-RACK05-U20',
    biosVersion: 'Zyrex Zaxtro Enterprise BIOS v2.1',
    bmcType: 'Zyrex AST2600 IPMI 2.0',
    bmcIp: '10.20.10.18',
    bmcStatus: 'optimal',
    overallHealthScore: 98,
    overallStatus: 'healthy',
    uptimeDays: 115,
    formFactor: '2U Rackmount',
    chassisIntrusion: 'closed',
    cmosBattery: { voltage: 3.08, status: 'good' },
    cpu: {
      governor: 'performance',
      microcodeVersion: '0x0830107a',
      spectreMeltdownMitigations: true,
      sockets: [
        {
          socketId: 0,
          model: 'AMD EPYC 7763 (64 Cores / 128 Threads @ 2.45GHz - Boost 3.50GHz)',
          cores: 64,
          threads: 128,
          baseGhz: 2.45,
          currentGhz: 3.20,
          temperatureC: 46.8,
          tjMaxC: 90.0,
          voltageV: 1.12,
          vrmTempC: 51.0,
          throttleStatus: 'none',
          l1CacheKb: 4096,
          l2CacheMb: 32,
          l3CacheMb: 256,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 45, usagePercent: 65 },
            { coreId: 1, tempC: 47, usagePercent: 70 },
            { coreId: 2, tempC: 46, usagePercent: 62 },
            { coreId: 3, tempC: 48, usagePercent: 74 }
          ]
        },
        {
          socketId: 1,
          model: 'AMD EPYC 7763 (64 Cores / 128 Threads @ 2.45GHz - Boost 3.50GHz)',
          cores: 64,
          threads: 128,
          baseGhz: 2.45,
          currentGhz: 3.15,
          temperatureC: 47.5,
          tjMaxC: 90.0,
          voltageV: 1.12,
          vrmTempC: 52.3,
          throttleStatus: 'none',
          l1CacheKb: 4096,
          l2CacheMb: 32,
          l3CacheMb: 256,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 46, usagePercent: 63 },
            { coreId: 1, tempC: 48, usagePercent: 69 },
            { coreId: 2, tempC: 47, usagePercent: 64 }
          ]
        }
      ]
    },
    memory: {
      totalCapacityGb: 512,
      installedDimmCount: 16,
      totalSlots: 16,
      dimmType: 'DDR4 ECC Registered',
      speedMhz: 3200,
      multiBitUncorrectableErrors: 0,
      singleBitCorrectableErrors: 1,
      eccScrubbingStatus: 'active',
      dimmModules: [
        { slot: 'DIMM_A1', channel: 'Channel A', cpuSocket: 0, sizeGb: 32, manufacturer: 'SK Hynix', partNumber: 'HMA84GR7CJR4N-WM', serialNumber: 'ZY-M01', speedMhz: 3200, temperatureC: 41.2, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_B1', channel: 'Channel B', cpuSocket: 0, sizeGb: 32, manufacturer: 'SK Hynix', partNumber: 'HMA84GR7CJR4N-WM', serialNumber: 'ZY-M02', speedMhz: 3200, temperatureC: 41.5, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_C1', channel: 'Channel C', cpuSocket: 0, sizeGb: 32, manufacturer: 'SK Hynix', partNumber: 'HMA84GR7CJR4N-WM', serialNumber: 'ZY-M03', speedMhz: 3200, temperatureC: 40.8, status: 'optimal', detectionState: 'detected', correctableErrors: 1 }
      ]
    },
    storage: {
      totalBays: 24,
      populatedBays: 2,
      controller: {
        model: 'LSI 9400-16i Tri-Mode HBA',
        firmware: '16.00.12.00',
        cacheGb: 0,
        bbuStatus: 'optimal',
        bbuCapacityPercent: 100,
        writePolicy: 'WriteThrough'
      },
      drives: [
        { bayId: 0, model: 'Kioxia CM6-R 7.68TB Enterprise NVMe', protocol: 'NVMe Gen4', capacityGb: 7680, healthPercent: 99, temperatureC: 39.5, wearLevelPercent: 1, tbwWrittenTb: 145.0, powerOnHours: 4200, reallocatedSectors: 0, mediaErrors: 0, status: 'healthy', smartStatus: 'PASSED', detectionState: 'detected', lastSelfTest: '2026-10-26T01:00:00Z', criticalWarning: 0, slotNote: 'Zyrex NVMe HCI Tier' },
        { bayId: 1, model: 'Kioxia CM6-R 7.68TB Enterprise NVMe', protocol: 'NVMe Gen4', capacityGb: 7680, healthPercent: 99, temperatureC: 39.0, wearLevelPercent: 1, tbwWrittenTb: 142.0, powerOnHours: 4200, reallocatedSectors: 0, mediaErrors: 0, status: 'healthy', smartStatus: 'PASSED', detectionState: 'detected', lastSelfTest: '2026-10-26T01:15:00Z', criticalWarning: 0, slotNote: 'Zyrex NVMe HCI Tier' },
        { bayId: 2, model: 'Bay Kosong', protocol: 'EMPTY', capacityGb: 0, healthPercent: 100, temperatureC: 0, wearLevelPercent: 0, tbwWrittenTb: 0, powerOnHours: 0, reallocatedSectors: 0, mediaErrors: 0, status: 'empty', smartStatus: 'N/A', detectionState: 'empty', lastSelfTest: 'N/A', criticalWarning: 0, slotNote: 'Slot Bay Kosong' }
      ]
    },
    power: {
      redundancyMode: '1+1 Redundant (Active/Standby)',
      totalPowerDrawW: 460,
      powerCapacityW: 3200,
      psus: [
        { id: 'PSU-1', model: 'Zyrex 1600W Platinum Redundant PSU', status: 'online', detectionState: 'detected', inputVoltageV: 228.8, outputWatts: 232, efficiencyRating: '80 PLUS Platinum', tempC: 41.5, hotPlugReady: true },
        { id: 'PSU-2', model: 'Zyrex 1600W Platinum Redundant PSU', status: 'online', detectionState: 'detected', inputVoltageV: 228.6, outputWatts: 228, efficiencyRating: '80 PLUS Platinum', tempC: 41.8, hotPlugReady: true }
      ]
    },
    cooling: {
      ambientIntakeTempC: 21.5,
      ambientExhaustTempC: 34.0,
      airflowCfm: 155,
      fanProfile: 'Optimal Auto',
      fans: [
        { fanId: 'Fan 1', dualRotor: true, rpm: 6400, maxRpm: 15000, pwmPercent: 44, status: 'ok' },
        { fanId: 'Fan 2', dualRotor: true, rpm: 6450, maxRpm: 15000, pwmPercent: 44, status: 'ok' }
      ],
      thermalZones: [
        { name: 'Ambient Zone', tempC: 21.5, warnThreshold: 42.0, critThreshold: 48.0 },
        { name: 'AMD EPYC Socket 0', tempC: 46.8, warnThreshold: 78.0, critThreshold: 88.0 }
      ]
    },
    pcieAndNetwork: {
      pcieSlots: [
        { slotId: 'PCIe Slot 1', cardName: 'Broadcom BCM57414 Dual-port 25GbE PCIe', linkSpeed: 'PCIe 4.0 @ 16.0 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x8', aerStatus: 'clean', tempC: 44.0, detectionState: 'detected', slotNote: 'K8s Overlay Network' },
        { slotId: 'PCIe Slot 2', cardName: 'Slot Kosong', linkSpeed: 'N/A', mechanicalWidth: 'x16', negotiatedWidth: 'x0', aerStatus: 'n/a', tempC: 0, detectionState: 'empty', slotNote: 'PCIe Gen4 x16' }
      ],
      opticsDom: [
        { port: 'eth0', transceiverType: '25GBASE-SR SFP28', rxPowerDbm: -2.9, txPowerDbm: -2.0, laserBiasMa: 6.4, tempC: 38.0, status: 'optimal' }
      ]
    },
    selLogs: [
      { id: 'sel-zy-01', timestamp: '2026-10-27T10:15:00Z', sensor: 'Zyrex AST2600 BMC', severity: 'INFORMATIONAL', description: 'TKDN Kemenperin RI Sertifikasi validasi: Nilai 48.20% aktif terverifikasi.', code: '0x00A1' }
    ],
    lastDiagnostic: null
  },

  // ==========================================
  // BRAND SERVER GLOBAL (LENOVO & HUAWEI & CISCO)
  // ==========================================
  {
    id: 'hw-lenovo-01',
    nodeId: 'node-lenovo-01',
    nodeName: 'lenovo-sr650-01',
    clusterId: 'cluster-pve-01',
    clusterName: 'Proxmox-CEPH-Prod',
    serverModel: 'Lenovo ThinkSystem SR650 V3 2U Dual Socket',
    vendor: 'Lenovo ThinkSystem',
    originCountry: 'China / Global',
    isTkdnCertified: false,
    bmcProtocol: 'Lenovo XCC REST API & Redfish',
    serialNumber: 'LENOVO-J308291-SR650',
    assetTag: 'DC1-RACK07-U14',
    biosVersion: 'UEFI v3.10 (Lenovo XCC)',
    bmcType: 'Lenovo XClarity Controller (XCC)',
    bmcIp: '10.10.20.55',
    bmcStatus: 'optimal',
    overallHealthScore: 98,
    overallStatus: 'healthy',
    uptimeDays: 160,
    formFactor: '2U Rackmount',
    chassisIntrusion: 'closed',
    cmosBattery: { voltage: 3.10, status: 'good' },
    cpu: {
      governor: 'performance',
      microcodeVersion: '0x0f00037',
      spectreMeltdownMitigations: true,
      sockets: [
        {
          socketId: 0,
          model: 'Intel Xeon Platinum 8468 (48 Cores / 96 Threads @ 2.10GHz - Boost 3.80GHz)',
          cores: 48,
          threads: 96,
          baseGhz: 2.10,
          currentGhz: 3.00,
          temperatureC: 47.0,
          tjMaxC: 86.0,
          voltageV: 1.16,
          vrmTempC: 51.5,
          throttleStatus: 'none',
          l1CacheKb: 3840,
          l2CacheMb: 60,
          l3CacheMb: 105,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 46, usagePercent: 58 },
            { coreId: 1, tempC: 48, usagePercent: 64 }
          ]
        }
      ]
    },
    memory: {
      totalCapacityGb: 256,
      installedDimmCount: 8,
      totalSlots: 16,
      dimmType: 'DDR5 ECC Registered',
      speedMhz: 4800,
      multiBitUncorrectableErrors: 0,
      singleBitCorrectableErrors: 0,
      eccScrubbingStatus: 'active',
      dimmModules: [
        { slot: 'DIMM_A1', channel: 'Channel A', cpuSocket: 0, sizeGb: 32, manufacturer: 'Micron', partNumber: 'MTC20F2085S1RC48BA1', serialNumber: 'LN-M01', speedMhz: 4800, temperatureC: 39.8, status: 'optimal', detectionState: 'detected', correctableErrors: 0 }
      ]
    },
    storage: {
      totalBays: 24,
      populatedBays: 1,
      controller: {
        model: 'Lenovo ThinkSystem RAID 940-8i 4GB Flash',
        firmware: '52.16.0-4100',
        cacheGb: 4,
        bbuStatus: 'optimal',
        bbuCapacityPercent: 100,
        writePolicy: 'WriteBack'
      },
      drives: [
        { bayId: 0, model: 'Lenovo ThinkSystem 3.84TB Read Intensive NVMe', protocol: 'NVMe Gen4', capacityGb: 3840, healthPercent: 99, temperatureC: 37.0, wearLevelPercent: 1, tbwWrittenTb: 95.0, powerOnHours: 3800, reallocatedSectors: 0, mediaErrors: 0, status: 'healthy', smartStatus: 'PASSED', detectionState: 'detected', lastSelfTest: '2026-10-24T00:00:00Z', criticalWarning: 0, slotNote: 'Lenovo High-Speed Flash' }
      ]
    },
    power: {
      redundancyMode: '1+1 Redundant (Active/Standby)',
      totalPowerDrawW: 380,
      powerCapacityW: 2200,
      psus: [
        { id: 'PSU-1', model: 'Lenovo 1100W Titanium Hot-Swap PSU', status: 'online', detectionState: 'detected', inputVoltageV: 230.1, outputWatts: 192, efficiencyRating: '80 PLUS Titanium', tempC: 40.2, hotPlugReady: true },
        { id: 'PSU-2', model: 'Lenovo 1100W Titanium Hot-Swap PSU', status: 'online', detectionState: 'detected', inputVoltageV: 229.8, outputWatts: 188, efficiencyRating: '80 PLUS Titanium', tempC: 40.5, hotPlugReady: true }
      ]
    },
    cooling: {
      ambientIntakeTempC: 20.5,
      ambientExhaustTempC: 31.8,
      airflowCfm: 140,
      fanProfile: 'Optimal Auto',
      fans: [
        { fanId: 'Fan 1', dualRotor: true, rpm: 5700, maxRpm: 14000, pwmPercent: 41, status: 'ok' }
      ],
      thermalZones: [
        { name: 'XCC Ambient Zone', tempC: 20.5, warnThreshold: 42.0, critThreshold: 48.0 }
      ]
    },
    pcieAndNetwork: {
      pcieSlots: [
        { slotId: 'PCIe Slot 1', cardName: 'Intel E810-DA2 Dual-port 25GbE SFP28', linkSpeed: 'PCIe 4.0 @ 16.0 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x8', aerStatus: 'clean', tempC: 42.0, detectionState: 'detected', slotNote: 'Core Data Link' }
      ],
      opticsDom: [
        { port: 'eth0', transceiverType: '25GBASE-SR SFP28', rxPowerDbm: -2.7, txPowerDbm: -1.9, laserBiasMa: 6.3, tempC: 37.2, status: 'optimal' }
      ]
    },
    selLogs: [
      { id: 'sel-ln-01', timestamp: '2026-10-25T14:20:00Z', sensor: 'Lenovo XCC', severity: 'INFORMATIONAL', description: 'XClarity Controller firmware v8.40 signature verified.', code: '0x0010' }
    ],
    lastDiagnostic: null
  },

  // Huawei FusionServer Pro (China - Global)
  {
    id: 'hw-huawei-01',
    nodeId: 'node-huawei-01',
    nodeName: 'huawei-2288h-01',
    clusterId: 'cluster-openstack-01',
    clusterName: 'OpenStack-Edge-Cloud',
    serverModel: 'Huawei FusionServer Pro 2288H V6 2U',
    vendor: 'Huawei Enterprise Server',
    originCountry: 'China',
    isTkdnCertified: false,
    bmcProtocol: 'Huawei iBMC RESTful & Redfish',
    serialNumber: 'HW-FS2288H-V6-9932',
    assetTag: 'DC-TELCO-RACK03-U12',
    biosVersion: 'Huawei BIOS v5.12',
    bmcType: 'Huawei iBMC',
    bmcIp: '10.10.30.88',
    bmcStatus: 'optimal',
    overallHealthScore: 97,
    overallStatus: 'healthy',
    uptimeDays: 189,
    formFactor: '2U Rackmount',
    chassisIntrusion: 'closed',
    cmosBattery: { voltage: 3.12, status: 'good' },
    cpu: {
      governor: 'performance',
      microcodeVersion: '0x0f00035',
      spectreMeltdownMitigations: true,
      sockets: [
        {
          socketId: 0,
          model: 'Intel Xeon Gold 6348 (28 Cores / 56 Threads @ 2.60GHz - Boost 3.50GHz)',
          cores: 28,
          threads: 56,
          baseGhz: 2.60,
          currentGhz: 3.10,
          temperatureC: 46.2,
          tjMaxC: 86.0,
          voltageV: 1.18,
          vrmTempC: 51.0,
          throttleStatus: 'none',
          l1CacheKb: 2240,
          l2CacheMb: 35,
          l3CacheMb: 42,
          mceErrorCount: 0,
          coresThermal: [{ coreId: 0, tempC: 45, usagePercent: 60 }]
        }
      ]
    },
    memory: {
      totalCapacityGb: 256,
      installedDimmCount: 8,
      totalSlots: 16,
      dimmType: 'DDR4 ECC Registered',
      speedMhz: 3200,
      multiBitUncorrectableErrors: 0,
      singleBitCorrectableErrors: 0,
      eccScrubbingStatus: 'active',
      dimmModules: [
        { slot: 'DIMM_A1', channel: 'Channel A', cpuSocket: 0, sizeGb: 32, manufacturer: 'Samsung Enterprise', partNumber: 'M393A4K40EB3-CWE', serialNumber: 'HW-M01', speedMhz: 3200, temperatureC: 40.2, status: 'optimal', detectionState: 'detected', correctableErrors: 0 }
      ]
    },
    storage: {
      totalBays: 24,
      populatedBays: 1,
      controller: {
        model: 'Huawei Avago MegaRAID SAS3508',
        firmware: '5.160.00-3321',
        cacheGb: 2,
        bbuStatus: 'optimal',
        bbuCapacityPercent: 100,
        writePolicy: 'WriteBack'
      },
      drives: [
        { bayId: 0, model: 'Huawei ES3000 V5 3.2TB Enterprise NVMe SSD', protocol: 'NVMe Gen4', capacityGb: 3200, healthPercent: 98, temperatureC: 38.0, wearLevelPercent: 2, tbwWrittenTb: 190.0, powerOnHours: 7200, reallocatedSectors: 0, mediaErrors: 0, status: 'healthy', smartStatus: 'PASSED', detectionState: 'detected', lastSelfTest: '2026-10-20T03:00:00Z', criticalWarning: 0, slotNote: 'Huawei High-Performance Tier' }
      ]
    },
    power: {
      redundancyMode: '1+1 Redundant (Active/Standby)',
      totalPowerDrawW: 370,
      powerCapacityW: 1800,
      psus: [
        { id: 'PSU-1', model: 'Huawei 900W Platinum Hot-Swap PSU', status: 'online', detectionState: 'detected', inputVoltageV: 229.5, outputWatts: 186, efficiencyRating: '80 PLUS Platinum', tempC: 41.0, hotPlugReady: true },
        { id: 'PSU-2', model: 'Huawei 900W Platinum Hot-Swap PSU', status: 'online', detectionState: 'detected', inputVoltageV: 229.3, outputWatts: 184, efficiencyRating: '80 PLUS Platinum', tempC: 41.2, hotPlugReady: true }
      ]
    },
    cooling: {
      ambientIntakeTempC: 21.0,
      ambientExhaustTempC: 33.2,
      airflowCfm: 145,
      fanProfile: 'Optimal Auto',
      fans: [
        { fanId: 'Fan 1', dualRotor: true, rpm: 6100, maxRpm: 14500, pwmPercent: 43, status: 'ok' }
      ],
      thermalZones: [
        { name: 'iBMC Ambient Zone', tempC: 21.0, warnThreshold: 42.0, critThreshold: 48.0 }
      ]
    },
    pcieAndNetwork: {
      pcieSlots: [
        { slotId: 'PCIe Slot 1', cardName: 'Huawei IN300 Dual-Port 25GbE SFP28', linkSpeed: 'PCIe 3.0 @ 8.0 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x8', aerStatus: 'clean', tempC: 45.0, detectionState: 'detected', slotNote: 'Telco Cloud Interconnect' }
      ],
      opticsDom: [
        { port: 'eth0', transceiverType: '25GBASE-SR SFP28', rxPowerDbm: -2.8, txPowerDbm: -1.9, laserBiasMa: 6.3, tempC: 38.0, status: 'optimal' }
      ]
    },
    selLogs: [
      { id: 'sel-hw-01', timestamp: '2026-10-23T08:10:00Z', sensor: 'Huawei iBMC', severity: 'INFORMATIONAL', description: 'Hi1711 iBMC management engine operating normally.', code: '0x00B2' }
    ],
    lastDiagnostic: null
  }
];
