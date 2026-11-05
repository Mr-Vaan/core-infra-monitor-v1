import { ServerHardware, DiagnosticTestItem, HardwareDiagnosticResult, DimmModuleInfo, StorageDriveHealth, PcieSlotInfo, PsuUnitInfo } from '../types';
import { multiBrandAdditionalServers } from './multiBrandServers';

export const initialHardwareServers: ServerHardware[] = [
  {
    id: 'hw-pve-01',
    nodeId: 'node-pve-01',
    nodeName: 'pve-node-01',
    clusterId: 'cluster-pve-01',
    clusterName: 'Proxmox-CEPH-Prod',
    serverModel: 'Dell PowerEdge R750 Rack Server 2U',
    vendor: 'Dell Technologies',
    originCountry: 'United States',
    isTkdnCertified: false,
    bmcProtocol: 'Dell iDRAC RESTful & DMTF Redfish v1.18',
    serialNumber: 'DELL-CN0285-R750-X8',
    assetTag: 'DC1-RACK04-U18',
    biosVersion: 'BIOS v1.9.2 (Microcode 0x0f00037)',
    bmcType: 'iDRAC9 Enterprise',
    bmcIp: '10.10.15.21',
    bmcStatus: 'optimal',
    overallHealthScore: 98,
    overallStatus: 'healthy',
    uptimeDays: 142,
    formFactor: '2U Rackmount',
    chassisIntrusion: 'closed',
    cmosBattery: { voltage: 3.08, status: 'good' },
    cpu: {
      governor: 'performance',
      microcodeVersion: '0x0f00037',
      spectreMeltdownMitigations: true,
      sockets: [
        {
          socketId: 0,
          model: 'Intel Xeon Platinum 8380 (40 Cores / 80 Threads @ 2.30GHz - Boost 3.40GHz)',
          cores: 40,
          threads: 80,
          baseGhz: 2.30,
          currentGhz: 3.10,
          temperatureC: 48.5,
          tjMaxC: 86.0,
          voltageV: 1.18,
          vrmTempC: 52.4,
          throttleStatus: 'none',
          l1CacheKb: 3200,
          l2CacheMb: 50,
          l3CacheMb: 60,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 47, usagePercent: 62 },
            { coreId: 1, tempC: 49, usagePercent: 68 },
            { coreId: 2, tempC: 46, usagePercent: 55 },
            { coreId: 3, tempC: 51, usagePercent: 74 },
            { coreId: 4, tempC: 48, usagePercent: 60 },
            { coreId: 5, tempC: 50, usagePercent: 65 },
            { coreId: 6, tempC: 47, usagePercent: 58 },
            { coreId: 7, tempC: 49, usagePercent: 70 },
            { coreId: 8, tempC: 52, usagePercent: 80 },
            { coreId: 9, tempC: 48, usagePercent: 63 }
          ]
        },
        {
          socketId: 1,
          model: 'Intel Xeon Platinum 8380 (40 Cores / 80 Threads @ 2.30GHz - Boost 3.40GHz)',
          cores: 40,
          threads: 80,
          baseGhz: 2.30,
          currentGhz: 3.05,
          temperatureC: 49.8,
          tjMaxC: 86.0,
          voltageV: 1.19,
          vrmTempC: 54.1,
          throttleStatus: 'none',
          l1CacheKb: 3200,
          l2CacheMb: 50,
          l3CacheMb: 60,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 48, usagePercent: 59 },
            { coreId: 1, tempC: 51, usagePercent: 71 },
            { coreId: 2, tempC: 49, usagePercent: 64 },
            { coreId: 3, tempC: 52, usagePercent: 77 },
            { coreId: 4, tempC: 47, usagePercent: 54 },
            { coreId: 5, tempC: 50, usagePercent: 67 },
            { coreId: 6, tempC: 48, usagePercent: 61 },
            { coreId: 7, tempC: 53, usagePercent: 79 },
            { coreId: 8, tempC: 49, usagePercent: 66 },
            { coreId: 9, tempC: 50, usagePercent: 68 }
          ]
        }
      ]
    },
    memory: {
      totalCapacityGb: 512,
      installedDimmCount: 8,
      totalSlots: 16,
      dimmType: 'DDR5 ECC Registered',
      speedMhz: 4800,
      multiBitUncorrectableErrors: 0,
      singleBitCorrectableErrors: 2,
      eccScrubbingStatus: 'active',
      dimmModules: [
        // Socket 0 (CPU 1) Channels A - D
        { slot: 'DIMM_A1', channel: 'Channel A', cpuSocket: 0, sizeGb: 64, manufacturer: 'Samsung Enterprise', partNumber: 'M321R8GA0BB0-CQK', serialNumber: '92A481B0', speedMhz: 4800, temperatureC: 41.2, status: 'optimal', detectionState: 'detected', correctableErrors: 1 },
        { slot: 'DIMM_A2', channel: 'Channel A', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY_SLOT', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0, errorDetails: 'Slot Kosong (Mendukung DDR5 ECC hingga 64GB)' },
        { slot: 'DIMM_B1', channel: 'Channel B', cpuSocket: 0, sizeGb: 64, manufacturer: 'Samsung Enterprise', partNumber: 'M321R8GA0BB0-CQK', serialNumber: '92A481B1', speedMhz: 4800, temperatureC: 40.8, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_B2', channel: 'Channel B', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY_SLOT', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0, errorDetails: 'Slot Kosong (Mendukung DDR5 ECC hingga 64GB)' },
        { slot: 'DIMM_C1', channel: 'Channel C', cpuSocket: 0, sizeGb: 64, manufacturer: 'Samsung Enterprise', partNumber: 'M321R8GA0BB0-CQK', serialNumber: '92A481B2', speedMhz: 4800, temperatureC: 42.1, status: 'optimal', detectionState: 'detected', correctableErrors: 1 },
        { slot: 'DIMM_C2', channel: 'Channel C', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY_SLOT', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0, errorDetails: 'Slot Kosong (Mendukung DDR5 ECC hingga 64GB)' },
        { slot: 'DIMM_D1', channel: 'Channel D', cpuSocket: 0, sizeGb: 64, manufacturer: 'Samsung Enterprise', partNumber: 'M321R8GA0BB0-CQK', serialNumber: '92A481B3', speedMhz: 4800, temperatureC: 41.0, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_D2', channel: 'Channel D', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY_SLOT', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0, errorDetails: 'Slot Kosong (Mendukung DDR5 ECC hingga 64GB)' },
        // Socket 1 (CPU 2) Channels E - H
        { slot: 'DIMM_E1', channel: 'Channel E', cpuSocket: 1, sizeGb: 64, manufacturer: 'Samsung Enterprise', partNumber: 'M321R8GA0BB0-CQK', serialNumber: '92A481C0', speedMhz: 4800, temperatureC: 43.0, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_E2', channel: 'Channel E', cpuSocket: 1, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY_SLOT', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0, errorDetails: 'Slot Kosong (Mendukung DDR5 ECC hingga 64GB)' },
        { slot: 'DIMM_F1', channel: 'Channel F', cpuSocket: 1, sizeGb: 64, manufacturer: 'Samsung Enterprise', partNumber: 'M321R8GA0BB0-CQK', serialNumber: '92A481C1', speedMhz: 4800, temperatureC: 42.5, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_F2', channel: 'Channel F', cpuSocket: 1, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY_SLOT', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0, errorDetails: 'Slot Kosong (Mendukung DDR5 ECC hingga 64GB)' },
        { slot: 'DIMM_G1', channel: 'Channel G', cpuSocket: 1, sizeGb: 64, manufacturer: 'Samsung Enterprise', partNumber: 'M321R8GA0BB0-CQK', serialNumber: '92A481C2', speedMhz: 4800, temperatureC: 41.7, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_G2', channel: 'Channel G', cpuSocket: 1, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY_SLOT', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0, errorDetails: 'Slot Kosong (Mendukung DDR5 ECC hingga 64GB)' },
        { slot: 'DIMM_H1', channel: 'Channel H', cpuSocket: 1, sizeGb: 64, manufacturer: 'Samsung Enterprise', partNumber: 'M321R8GA0BB0-CQK', serialNumber: '92A481C3', speedMhz: 4800, temperatureC: 41.4, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_H2', channel: 'Channel H', cpuSocket: 1, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY_SLOT', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0, errorDetails: 'Slot Kosong (Mendukung DDR5 ECC hingga 64GB)' }
      ]
    },
    storage: {
      totalBays: 8,
      populatedBays: 4,
      controller: {
        model: 'Broadcom MegaRAID 9560-8i (SAS/SATA/PCIe NVMe Tri-Mode)',
        firmware: '52.18.0-4102',
        cacheGb: 8,
        bbuStatus: 'optimal',
        bbuCapacityPercent: 100,
        writePolicy: 'WriteBack'
      },
      drives: [
        {
          bayId: 0,
          model: 'Samsung PM1733 3.84TB Enterprise NVMe U.3 PCIe 4.0',
          protocol: 'NVMe Gen4',
          capacityGb: 3840,
          healthPercent: 99,
          temperatureC: 38.5,
          wearLevelPercent: 2,
          tbwWrittenTb: 142.8,
          powerOnHours: 6840,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'healthy',
          smartStatus: 'PASSED',
          detectionState: 'detected',
          lastSelfTest: '2026-10-18T04:00:00Z',
          criticalWarning: 0,
          slotNote: 'Populated & Active - Primary CEPH OSD 0'
        },
        {
          bayId: 1,
          model: 'Samsung PM1733 3.84TB Enterprise NVMe U.3 PCIe 4.0',
          protocol: 'NVMe Gen4',
          capacityGb: 3840,
          healthPercent: 99,
          temperatureC: 39.0,
          wearLevelPercent: 2,
          tbwWrittenTb: 139.5,
          powerOnHours: 6840,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'healthy',
          smartStatus: 'PASSED',
          detectionState: 'detected',
          lastSelfTest: '2026-10-18T04:05:00Z',
          criticalWarning: 0,
          slotNote: 'Populated & Active - Primary CEPH OSD 1'
        },
        {
          bayId: 2,
          model: 'Kioxia CM6-R 7.68TB Enterprise NVMe PCIe 4.0',
          protocol: 'NVMe Gen4',
          capacityGb: 7680,
          healthPercent: 98,
          temperatureC: 41.0,
          wearLevelPercent: 3,
          tbwWrittenTb: 215.0,
          powerOnHours: 6840,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'healthy',
          smartStatus: 'PASSED',
          detectionState: 'detected',
          lastSelfTest: '2026-10-18T04:10:00Z',
          criticalWarning: 0,
          slotNote: 'Populated & Active - Fast Tier Storage'
        },
        {
          bayId: 3,
          model: 'Kioxia CM6-R 7.68TB Enterprise NVMe PCIe 4.0',
          protocol: 'NVMe Gen4',
          capacityGb: 7680,
          healthPercent: 98,
          temperatureC: 40.5,
          wearLevelPercent: 3,
          tbwWrittenTb: 212.4,
          powerOnHours: 6840,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'healthy',
          smartStatus: 'PASSED',
          detectionState: 'detected',
          lastSelfTest: '2026-10-18T04:15:00Z',
          criticalWarning: 0,
          slotNote: 'Populated & Active - Fast Tier Storage'
        },
        {
          bayId: 4,
          model: 'Bay Kosong (Hot-Swap Caddy Siap Digunakan)',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong (Tersedia untuk Hot-Plug Disk 2.5" NVMe / SAS)'
        },
        {
          bayId: 5,
          model: 'Bay Kosong (Hot-Swap Caddy Siap Digunakan)',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong (Tersedia untuk Hot-Plug Disk 2.5" NVMe / SAS)'
        },
        {
          bayId: 6,
          model: 'Bay Kosong (Hot-Swap Caddy Siap Digunakan)',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong (Tersedia untuk Hot-Plug Disk 2.5" NVMe / SAS)'
        },
        {
          bayId: 7,
          model: 'Bay Kosong (Hot-Swap Caddy Siap Digunakan)',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong (Tersedia untuk Hot-Plug Disk 2.5" NVMe / SAS)'
        }
      ]
    },
    power: {
      redundancyMode: '1+1 Redundant (Active/Standby)',
      totalPowerDrawW: 425,
      powerCapacityW: 1400,
      psus: [
        {
          id: 'PSU-1',
          model: 'Dell 1400W Titanium Hot-plug Redundant Power Supply',
          status: 'online',
          detectionState: 'detected',
          inputVoltageV: 228.6,
          outputWatts: 220,
          efficiencyRating: '80 PLUS Titanium',
          tempC: 43.2,
          hotPlugReady: true
        },
        {
          id: 'PSU-2',
          model: 'Dell 1400W Titanium Hot-plug Redundant Power Supply',
          status: 'online',
          detectionState: 'detected',
          inputVoltageV: 229.1,
          outputWatts: 205,
          efficiencyRating: '80 PLUS Titanium',
          tempC: 42.8,
          hotPlugReady: true
        }
      ]
    },
    cooling: {
      ambientIntakeTempC: 21.2,
      ambientExhaustTempC: 33.8,
      airflowCfm: 148,
      fanProfile: 'Optimal Auto',
      fans: [
        { fanId: 'FAN-1 (Dual Rotor)', dualRotor: true, rpm: 6850, maxRpm: 14000, pwmPercent: 48, status: 'ok' },
        { fanId: 'FAN-2 (Dual Rotor)', dualRotor: true, rpm: 6920, maxRpm: 14000, pwmPercent: 49, status: 'ok' },
        { fanId: 'FAN-3 (Dual Rotor)', dualRotor: true, rpm: 6780, maxRpm: 14000, pwmPercent: 48, status: 'ok' },
        { fanId: 'FAN-4 (Dual Rotor)', dualRotor: true, rpm: 6940, maxRpm: 14000, pwmPercent: 49, status: 'ok' },
        { fanId: 'FAN-5 (Dual Rotor)', dualRotor: true, rpm: 6810, maxRpm: 14000, pwmPercent: 48, status: 'ok' },
        { fanId: 'FAN-6 (Dual Rotor)', dualRotor: true, rpm: 6890, maxRpm: 14000, pwmPercent: 49, status: 'ok' }
      ],
      thermalZones: [
        { name: 'CPU 0 Subsystem', tempC: 48.5, warnThreshold: 75.0, critThreshold: 85.0 },
        { name: 'CPU 1 Subsystem', tempC: 49.8, warnThreshold: 75.0, critThreshold: 85.0 },
        { name: 'Memory Bank A/B', tempC: 41.5, warnThreshold: 65.0, critThreshold: 75.0 },
        { name: 'Storage Backplane', tempC: 39.8, warnThreshold: 60.0, critThreshold: 70.0 },
        { name: 'PCIe Riser Zone', tempC: 44.2, warnThreshold: 70.0, critThreshold: 80.0 },
        { name: 'PCH Chipset', tempC: 42.1, warnThreshold: 65.0, critThreshold: 78.0 }
      ]
    },
    pcieAndNetwork: {
      pcieSlots: [
        { slotId: 'PCIe Slot 1 (Riser 1)', cardName: 'Mellanox ConnectX-6 Dx Dual-port 25GbE SFP28', linkSpeed: 'PCIe 4.0 @ 16.0 GT/s', mechanicalWidth: 'x16', negotiatedWidth: 'x16', aerStatus: 'clean', tempC: 46.2, detectionState: 'detected', slotNote: 'High Speed Cluster Interconnect' },
        { slotId: 'PCIe Slot 2 (Riser 1)', cardName: 'Broadcom MegaRAID 9560-8i Tri-Mode Controller', linkSpeed: 'PCIe 4.0 @ 16.0 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x8', aerStatus: 'clean', tempC: 48.0, detectionState: 'detected', slotNote: 'Hardware NVMe/SAS RAID Storage Controller' },
        { slotId: 'PCIe Slot 3 (Riser 2)', cardName: 'Intel X710 Quad-port 10GbE BASE-T Adapter', linkSpeed: 'PCIe 3.0 @ 8.0 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x8', aerStatus: 'clean', tempC: 51.5, detectionState: 'detected', slotNote: 'VLAN Management & VM Traffic' },
        { slotId: 'PCIe Slot 4 (Riser 2)', cardName: 'Slot Kosong (Tersedia untuk GPU / FPGA)', linkSpeed: 'N/A', mechanicalWidth: 'x16', negotiatedWidth: 'x0', aerStatus: 'n/a', tempC: 0, detectionState: 'empty', slotNote: 'PCIe Gen4 x16 Mechanical / x16 Electrical - Slot Siap Digunakan' },
        { slotId: 'PCIe Slot 5 (Riser 3)', cardName: 'Slot Kosong (Tersedia)', linkSpeed: 'N/A', mechanicalWidth: 'x8', negotiatedWidth: 'x0', aerStatus: 'n/a', tempC: 0, detectionState: 'empty', slotNote: 'PCIe Gen4 x8 Mechanical / x8 Electrical' },
        { slotId: 'PCIe Slot 6 (Riser 3)', cardName: 'Slot Kosong (Tersedia)', linkSpeed: 'N/A', mechanicalWidth: 'x8', negotiatedWidth: 'x0', aerStatus: 'n/a', tempC: 0, detectionState: 'empty', slotNote: 'PCIe Gen4 x8 Mechanical / x8 Electrical' }
      ],
      opticsDom: [
        { port: 'eth0 (SFP28-1)', transceiverType: '25GBASE-SR SFP28 (850nm MMF)', rxPowerDbm: -2.8, txPowerDbm: -1.9, laserBiasMa: 6.4, tempC: 38.2, status: 'optimal' },
        { port: 'eth1 (SFP28-2)', transceiverType: '25GBASE-SR SFP28 (850nm MMF)', rxPowerDbm: -3.1, txPowerDbm: -2.0, laserBiasMa: 6.5, tempC: 38.6, status: 'optimal' }
      ]
    },
    selLogs: [
      { id: 'sel-01', timestamp: '2026-10-20T04:12:00Z', sensor: 'Power Supply', severity: 'INFORMATIONAL', description: 'PSU Redundancy mode confirmed: 1+1 fully redundant active', code: '0x0801' },
      { id: 'sel-02', timestamp: '2026-10-19T14:30:22Z', sensor: 'Memory Parity', severity: 'INFORMATIONAL', description: 'Correctable ECC error handled on DIMM_A1. Scrubbing completed successfully.', code: '0x0211' },
      { id: 'sel-03', timestamp: '2026-10-18T08:00:10Z', sensor: 'Thermal Monitor', severity: 'INFORMATIONAL', description: 'Intake air temperature normalized to 21.2°C', code: '0x0105' }
    ],
    lastDiagnostic: null
  },

  // hw-pve-03 (Dell PowerEdge R650 1U - Has Undetected / Warning Slots for testing!)
  {
    id: 'hw-pve-03',
    nodeId: 'node-pve-03',
    nodeName: 'pve-node-03',
    clusterId: 'cluster-pve-01',
    clusterName: 'Proxmox-CEPH-Prod',
    serverModel: 'Dell PowerEdge R650 1U High-Density Rack Server',
    vendor: 'Dell Technologies',
    originCountry: 'United States',
    isTkdnCertified: false,
    bmcProtocol: 'Dell iDRAC RESTful & DMTF Redfish v1.18',
    serialNumber: 'DELL-CN0192-R650-Z4',
    assetTag: 'DC1-RACK04-U22',
    biosVersion: 'BIOS v1.8.4 (Microcode 0x0f00035)',
    bmcType: 'iDRAC9 Enterprise',
    bmcIp: '10.10.15.23',
    bmcStatus: 'warning',
    overallHealthScore: 82,
    overallStatus: 'warning',
    uptimeDays: 210,
    formFactor: '1U Rackmount',
    chassisIntrusion: 'closed',
    cmosBattery: { voltage: 2.85, status: 'low' },
    cpu: {
      governor: 'ondemand',
      microcodeVersion: '0x0f00035',
      spectreMeltdownMitigations: true,
      sockets: [
        {
          socketId: 0,
          model: 'Intel Xeon Gold 6338 (32 Cores / 64 Threads @ 2.00GHz - Boost 3.20GHz)',
          cores: 32,
          threads: 64,
          baseGhz: 2.00,
          currentGhz: 2.85,
          temperatureC: 62.4,
          tjMaxC: 84.0,
          voltageV: 1.15,
          vrmTempC: 68.2,
          throttleStatus: 'none',
          l1CacheKb: 2048,
          l2CacheMb: 40,
          l3CacheMb: 48,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 61, usagePercent: 72 },
            { coreId: 1, tempC: 64, usagePercent: 78 },
            { coreId: 2, tempC: 60, usagePercent: 68 },
            { coreId: 3, tempC: 65, usagePercent: 82 }
          ]
        }
      ]
    },
    memory: {
      totalCapacityGb: 256,
      installedDimmCount: 4,
      totalSlots: 16,
      dimmType: 'DDR4 ECC Registered',
      speedMhz: 3200,
      multiBitUncorrectableErrors: 0,
      singleBitCorrectableErrors: 14,
      eccScrubbingStatus: 'active',
      dimmModules: [
        { slot: 'DIMM_A1', channel: 'Channel A', cpuSocket: 0, sizeGb: 64, manufacturer: 'Micron Tech', partNumber: 'MTA36ASF8G72PZ', serialNumber: '19F239A', speedMhz: 3200, temperatureC: 48.0, status: 'correctable_ecc_warn', detectionState: 'detected', correctableErrors: 12 },
        { slot: 'DIMM_A2', channel: 'Channel A', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_B1', channel: 'Channel B', cpuSocket: 0, sizeGb: 64, manufacturer: 'Micron Tech', partNumber: 'MTA36ASF8G72PZ', serialNumber: '19F239B', speedMhz: 3200, temperatureC: 46.5, status: 'optimal', detectionState: 'detected', correctableErrors: 2 },
        { slot: 'DIMM_B2', channel: 'Channel B', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_C1', channel: 'Channel C', cpuSocket: 0, sizeGb: 64, manufacturer: 'Micron Tech', partNumber: 'MTA36ASF8G72PZ', serialNumber: '19F239C', speedMhz: 3200, temperatureC: 47.0, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_C2', channel: 'Channel C', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_D1', channel: 'Channel D', cpuSocket: 0, sizeGb: 64, manufacturer: 'Micron Tech', partNumber: 'MTA36ASF8G72PZ', serialNumber: '19F239D', speedMhz: 3200, temperatureC: 46.8, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        // CRITICAL PRODUCTION ERROR SLOT: Physically present, but Memory Training Failed during POST!
        { slot: 'DIMM_D2', channel: 'Channel D', cpuSocket: 0, sizeGb: 64, manufacturer: 'Micron Tech (Unknown)', partNumber: 'UNREADABLE_SPD', serialNumber: 'ERR-TRAIN-FAIL', speedMhz: 0, temperatureC: 0, status: 'training_failed', detectionState: 'not_detected_error', correctableErrors: 0, errorDetails: 'PERINGATAN: Modul RAM terpasang di slot DIMM_D2 tetapi GAGAL DETEKSI / Memory Training Failed saat BIOS POST. Modul dinonaktifkan oleh firmware.' },
        // Empty slots
        { slot: 'DIMM_E1', channel: 'Channel E', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_E2', channel: 'Channel E', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_F1', channel: 'Channel F', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_F2', channel: 'Channel F', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_G1', channel: 'Channel G', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_G2', channel: 'Channel G', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_H1', channel: 'Channel H', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_H2', channel: 'Channel H', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 }
      ]
    },
    storage: {
      totalBays: 8,
      populatedBays: 2,
      controller: {
        model: 'Dell PERC H745 Front NVMe / SAS RAID',
        firmware: '51.14.0-3900',
        cacheGb: 4,
        bbuStatus: 'degraded',
        bbuCapacityPercent: 64,
        writePolicy: 'WriteThrough'
      },
      drives: [
        {
          bayId: 0,
          model: 'Micron 7450 PRO 1.92TB NVMe SSD',
          protocol: 'NVMe Gen4',
          capacityGb: 1920,
          healthPercent: 79,
          temperatureC: 49.2,
          wearLevelPercent: 21,
          tbwWrittenTb: 840.5,
          powerOnHours: 18400,
          reallocatedSectors: 2,
          mediaErrors: 1,
          status: 'warning',
          smartStatus: 'WARNING',
          detectionState: 'detected',
          lastSelfTest: '2026-10-17T03:00:00Z',
          criticalWarning: 1,
          slotNote: 'Populated - 2 Reallocated Sectors & Wear Level 21%'
        },
        {
          bayId: 1,
          model: 'Bay Kosong',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong'
        },
        {
          bayId: 2,
          model: 'Bay Kosong',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong'
        },
        {
          bayId: 3,
          model: 'Bay Kosong',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong'
        },
        // CRITICAL PRODUCTION ERROR BAY: Drive physically locked in tray, but controller PHY link down!
        {
          bayId: 4,
          model: 'Drive Terpasang GAGAL DETEKSI (Link PHY Drop)',
          protocol: 'SAS 12Gb/s',
          capacityGb: 1920,
          healthPercent: 0,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 99,
          status: 'fault',
          smartStatus: 'COMMUNICATION_ERROR',
          detectionState: 'not_detected_error',
          lastSelfTest: 'FAIL',
          criticalWarning: 1,
          slotNote: 'PERINGATAN: Caddy terkunci dan terpasang pada Bay #4, namun Controller SAS/NVMe tidak mendeteksi heartbeat drive (Link PHY Drop / Power Pin Failure).'
        },
        {
          bayId: 5,
          model: 'Bay Kosong',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong'
        },
        {
          bayId: 6,
          model: 'Bay Kosong',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong'
        },
        {
          bayId: 7,
          model: 'Bay Kosong',
          protocol: 'EMPTY',
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty',
          smartStatus: 'N/A',
          detectionState: 'empty',
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong'
        }
      ]
    },
    power: {
      redundancyMode: '1+1 Redundant (Active/Standby)',
      totalPowerDrawW: 340,
      powerCapacityW: 800,
      psus: [
        { id: 'PSU-1', model: 'Dell 800W Platinum Hot-plug', status: 'online', detectionState: 'detected', inputVoltageV: 227.1, outputWatts: 175, efficiencyRating: '80 PLUS Platinum', tempC: 47.0, hotPlugReady: true },
        { id: 'PSU-2', model: 'Dell 800W Platinum Hot-plug', status: 'online', detectionState: 'detected', inputVoltageV: 227.4, outputWatts: 165, efficiencyRating: '80 PLUS Platinum', tempC: 46.2, hotPlugReady: true }
      ]
    },
    cooling: {
      ambientIntakeTempC: 24.5,
      ambientExhaustTempC: 38.6,
      airflowCfm: 110,
      fanProfile: 'Optimal Auto',
      fans: [
        { fanId: 'FAN-1 (1U Dual Rotor)', dualRotor: true, rpm: 9800, maxRpm: 18000, pwmPercent: 65, status: 'ok' },
        { fanId: 'FAN-2 (1U Dual Rotor)', dualRotor: true, rpm: 9950, maxRpm: 18000, pwmPercent: 66, status: 'ok' },
        { fanId: 'FAN-3 (1U Dual Rotor)', dualRotor: true, rpm: 9780, maxRpm: 18000, pwmPercent: 65, status: 'ok' },
        { fanId: 'FAN-4 (1U Dual Rotor)', dualRotor: true, rpm: 5400, maxRpm: 18000, pwmPercent: 65, status: 'degraded' }
      ],
      thermalZones: [
        { name: 'CPU 0 Subsystem', tempC: 62.4, warnThreshold: 75.0, critThreshold: 84.0 },
        { name: 'PERC Controller VRM', tempC: 68.2, warnThreshold: 70.0, critThreshold: 80.0 }
      ]
    },
    pcieAndNetwork: {
      pcieSlots: [
        { slotId: 'PCIe Slot 1 (Riser 1)', cardName: 'Broadcom 57414 Dual-Port 25GbE SFP28', linkSpeed: 'PCIe 3.0 @ 8.0 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x8', aerStatus: 'correctable_errors', tempC: 54.0, detectionState: 'detected', slotNote: 'NIC Adapter' },
        { slotId: 'PCIe Slot 2 (Riser 1)', cardName: 'PCIe Riser Expander Card (Link Degraded)', linkSpeed: 'PCIe 3.0 @ 2.5 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x4 (Downgraded)', aerStatus: 'correctable_errors', tempC: 48.0, detectionState: 'link_degraded', slotNote: 'PERINGATAN: Kartu terpasang di Slot 2 mengalami degradasi lane: Berjalan pada link x4 dari kapasitas fisik x8.' },
        { slotId: 'PCIe Slot 3 (Riser 2)', cardName: 'Slot Kosong', linkSpeed: 'N/A', mechanicalWidth: 'x8', negotiatedWidth: 'x0', aerStatus: 'n/a', tempC: 0, detectionState: 'empty', slotNote: 'PCIe Gen4 x8 Mechanical - Slot Kosong' }
      ],
      opticsDom: [
        { port: 'eth0 (SFP28-1)', transceiverType: '25GBASE-SR SFP28', rxPowerDbm: -6.4, txPowerDbm: -2.2, laserBiasMa: 6.9, tempC: 44.5, status: 'low_rx_warn' }
      ]
    },
    selLogs: [
      { id: 'sel-05', timestamp: '2026-10-20T03:40:12Z', sensor: 'Fan 4 Tachometer', severity: 'WARNING', description: 'Fan 4 rotor 2 RPM transient dip below warning threshold (5,400 RPM)', code: '0x0402' },
      { id: 'sel-06', timestamp: '2026-10-19T18:15:00Z', sensor: 'Battery CMOS', severity: 'WARNING', description: 'CMOS CR2032 battery voltage reached 2.85V (Threshold: 2.80V replace recommended)', code: '0x0903' },
      { id: 'sel-07', timestamp: '2026-10-19T06:12:44Z', sensor: 'Storage S.M.A.R.T.', severity: 'WARNING', description: 'Drive bay 0 Micron 7450 reported 2 reallocated sectors and 21% wear level', code: '0x0308' },
      { id: 'sel-07b', timestamp: '2026-10-19T06:00:00Z', sensor: 'Memory Controller', severity: 'CRITICAL', description: 'DIMM_D2 Memory training timed out during boot. Slot isolated to prevent BSOD.', code: '0x02EE' },
      { id: 'sel-07c', timestamp: '2026-10-19T05:58:00Z', sensor: 'Storage Backplane', severity: 'CRITICAL', description: 'Drive Bay #4 SAS PHY lost sync. Communication error flagged.', code: '0x03F1' }
    ],
    lastDiagnostic: null
  },

  // hw-ntnx-01 (Supermicro Ultra 24-Bay All-Flash)
  {
    id: 'hw-ntnx-01',
    nodeId: 'node-ntnx-01',
    nodeName: 'ahv-node-01',
    clusterId: 'cluster-ntnx-01',
    clusterName: 'Cluster-RDDS-NTNX',
    serverModel: 'Supermicro Ultra SuperServer 2029U-TN24R4T',
    vendor: 'Supermicro',
    originCountry: 'United States',
    isTkdnCertified: false,
    bmcProtocol: 'Supermicro IPMI 2.0 / Redfish',
    serialNumber: 'SM-US-2029U-8921',
    assetTag: 'DC2-RACK01-U12',
    biosVersion: 'AMI BIOS v3.4a (Redfish 1.8)',
    bmcType: 'Supermicro IPMI 2.0 / Redfish',
    bmcIp: '10.20.15.11',
    bmcStatus: 'optimal',
    overallHealthScore: 76,
    overallStatus: 'warning',
    uptimeDays: 98,
    formFactor: '2U 24-Bay All-Flash NVMe',
    chassisIntrusion: 'closed',
    cmosBattery: { voltage: 3.02, status: 'good' },
    cpu: {
      governor: 'performance',
      microcodeVersion: '0x2006906',
      spectreMeltdownMitigations: true,
      sockets: [
        {
          socketId: 0,
          model: 'AMD EPYC 7763 (64 Cores / 128 Threads @ 2.45GHz - Boost 3.50GHz)',
          cores: 64,
          threads: 128,
          baseGhz: 2.45,
          currentGhz: 3.15,
          temperatureC: 56.8,
          tjMaxC: 90.0,
          voltageV: 1.22,
          vrmTempC: 59.4,
          throttleStatus: 'none',
          l1CacheKb: 4096,
          l2CacheMb: 32,
          l3CacheMb: 256,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 55, usagePercent: 75 },
            { coreId: 1, tempC: 58, usagePercent: 82 },
            { coreId: 2, tempC: 56, usagePercent: 78 }
          ]
        },
        {
          socketId: 1,
          model: 'AMD EPYC 7763 (64 Cores / 128 Threads @ 2.45GHz - Boost 3.50GHz)',
          cores: 64,
          threads: 128,
          baseGhz: 2.45,
          currentGhz: 3.12,
          temperatureC: 57.5,
          tjMaxC: 90.0,
          voltageV: 1.22,
          vrmTempC: 60.1,
          throttleStatus: 'none',
          l1CacheKb: 4096,
          l2CacheMb: 32,
          l3CacheMb: 256,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 57, usagePercent: 79 },
            { coreId: 1, tempC: 59, usagePercent: 84 }
          ]
        }
      ]
    },
    memory: {
      totalCapacityGb: 1024,
      installedDimmCount: 16,
      totalSlots: 16,
      dimmType: 'DDR4 ECC Registered LRDIMM',
      speedMhz: 3200,
      multiBitUncorrectableErrors: 0,
      singleBitCorrectableErrors: 38,
      eccScrubbingStatus: 'active',
      dimmModules: [
        { slot: 'DIMM_A1', channel: 'Channel A', cpuSocket: 0, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104A1', speedMhz: 3200, temperatureC: 45.0, status: 'correctable_ecc_warn', detectionState: 'detected', correctableErrors: 28, errorDetails: 'Tingginya error bit tunggal yang dikoreksi (28 kali) mendekati batas toleransi 30.' },
        { slot: 'DIMM_A2', channel: 'Channel A', cpuSocket: 0, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104A2', speedMhz: 3200, temperatureC: 44.5, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_B1', channel: 'Channel B', cpuSocket: 0, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104B1', speedMhz: 3200, temperatureC: 44.5, status: 'optimal', detectionState: 'detected', correctableErrors: 10 },
        { slot: 'DIMM_B2', channel: 'Channel B', cpuSocket: 0, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104B2', speedMhz: 3200, temperatureC: 44.0, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_C1', channel: 'Channel C', cpuSocket: 0, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104C1', speedMhz: 3200, temperatureC: 43.8, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_C2', channel: 'Channel C', cpuSocket: 0, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104C2', speedMhz: 3200, temperatureC: 43.5, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_D1', channel: 'Channel D', cpuSocket: 0, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104D1', speedMhz: 3200, temperatureC: 44.0, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_D2', channel: 'Channel D', cpuSocket: 0, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104D2', speedMhz: 3200, temperatureC: 43.9, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_E1', channel: 'Channel E', cpuSocket: 1, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104E1', speedMhz: 3200, temperatureC: 44.8, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_E2', channel: 'Channel E', cpuSocket: 1, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104E2', speedMhz: 3200, temperatureC: 44.2, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_F1', channel: 'Channel F', cpuSocket: 1, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104F1', speedMhz: 3200, temperatureC: 44.1, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_F2', channel: 'Channel F', cpuSocket: 1, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104F2', speedMhz: 3200, temperatureC: 43.7, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_G1', channel: 'Channel G', cpuSocket: 1, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104G1', speedMhz: 3200, temperatureC: 44.3, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_G2', channel: 'Channel G', cpuSocket: 1, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104G2', speedMhz: 3200, temperatureC: 44.0, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_H1', channel: 'Channel H', cpuSocket: 1, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104H1', speedMhz: 3200, temperatureC: 44.6, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_H2', channel: 'Channel H', cpuSocket: 1, sizeGb: 64, manufacturer: 'SK Hynix', partNumber: 'HMA88GL7AFR4N', serialNumber: '89104H2', speedMhz: 3200, temperatureC: 44.1, status: 'optimal', detectionState: 'detected', correctableErrors: 0 }
      ]
    },
    storage: {
      totalBays: 24,
      populatedBays: 2,
      controller: {
        model: 'Nutanix Direct-Attached NVMe Pass-Through HBA',
        firmware: 'IT-Mode v20.00.07',
        cacheGb: 0,
        bbuStatus: 'optimal',
        bbuCapacityPercent: 100,
        writePolicy: 'WriteBack'
      },
      drives: [
        {
          bayId: 0,
          model: 'Samsung PM9A3 7.68TB Enterprise NVMe U.2',
          protocol: 'NVMe Gen4',
          capacityGb: 7680,
          healthPercent: 92,
          temperatureC: 46.0,
          wearLevelPercent: 9,
          tbwWrittenTb: 610.0,
          powerOnHours: 12400,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'healthy',
          smartStatus: 'PASSED',
          detectionState: 'detected',
          lastSelfTest: '2026-10-18T02:00:00Z',
          criticalWarning: 0,
          slotNote: 'Nutanix Storage Pool Data Drive 1'
        },
        {
          bayId: 1,
          model: 'Samsung PM9A3 7.68TB Enterprise NVMe U.2',
          protocol: 'NVMe Gen4',
          capacityGb: 7680,
          healthPercent: 90,
          temperatureC: 47.5,
          wearLevelPercent: 11,
          tbwWrittenTb: 740.0,
          powerOnHours: 12400,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'healthy',
          smartStatus: 'PASSED',
          detectionState: 'detected',
          lastSelfTest: '2026-10-18T02:00:00Z',
          criticalWarning: 0,
          slotNote: 'Nutanix Storage Pool Data Drive 2'
        },
        // Remaining bays 2-23 are empty Hot-swap slots
        ...Array.from({ length: 22 }, (_, idx) => ({
          bayId: idx + 2,
          model: `Slot Bay #${idx + 2} Kosong (Ready for Hot-Plug NVMe U.2)`,
          protocol: 'EMPTY' as const,
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty' as const,
          smartStatus: 'N/A' as const,
          detectionState: 'empty' as const,
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: `Slot Bay #${idx + 2} Kosong (Tersedia untuk Hot-Plug Disk NVMe U.2)`
        }))
      ]
    },
    power: {
      redundancyMode: '1+1 Redundant (Active/Standby)',
      totalPowerDrawW: 580,
      powerCapacityW: 1600,
      psus: [
        { id: 'PSU-1', model: 'Supermicro 1600W Titanium Redundant', status: 'online', detectionState: 'detected', inputVoltageV: 230.1, outputWatts: 300, efficiencyRating: '80 PLUS Titanium', tempC: 46.0, hotPlugReady: true },
        { id: 'PSU-2', model: 'Supermicro 1600W Titanium Redundant', status: 'online', detectionState: 'detected', inputVoltageV: 229.8, outputWatts: 280, efficiencyRating: '80 PLUS Titanium', tempC: 45.4, hotPlugReady: true }
      ]
    },
    cooling: {
      ambientIntakeTempC: 23.8,
      ambientExhaustTempC: 37.0,
      airflowCfm: 165,
      fanProfile: 'Optimal Auto',
      fans: [
        { fanId: 'FAN-1 (80mm PWM)', dualRotor: true, rpm: 7400, maxRpm: 12000, pwmPercent: 58, status: 'ok' },
        { fanId: 'FAN-2 (80mm PWM)', dualRotor: true, rpm: 7520, maxRpm: 12000, pwmPercent: 59, status: 'ok' },
        { fanId: 'FAN-3 (80mm PWM)', dualRotor: true, rpm: 7380, maxRpm: 12000, pwmPercent: 58, status: 'ok' },
        { fanId: 'FAN-4 (80mm PWM)', dualRotor: true, rpm: 7490, maxRpm: 12000, pwmPercent: 59, status: 'ok' }
      ],
      thermalZones: [
        { name: 'EPYC Socket 0', tempC: 56.8, warnThreshold: 80.0, critThreshold: 90.0 },
        { name: 'EPYC Socket 1', tempC: 57.5, warnThreshold: 80.0, critThreshold: 90.0 }
      ]
    },
    pcieAndNetwork: {
      pcieSlots: [
        { slotId: 'PCIe Slot 1', cardName: 'Mellanox ConnectX-5 Dual-Port 100GbE QSFP28', linkSpeed: 'PCIe 4.0 @ 16.0 GT/s', mechanicalWidth: 'x16', negotiatedWidth: 'x16', aerStatus: 'clean', tempC: 52.0, detectionState: 'detected', slotNote: 'Primary Nutanix Storage Interconnect' },
        { slotId: 'PCIe Slot 2', cardName: 'Slot Kosong (Tersedia)', linkSpeed: 'N/A', mechanicalWidth: 'x16', negotiatedWidth: 'x0', aerStatus: 'n/a', tempC: 0, detectionState: 'empty', slotNote: 'PCIe Gen4 x16 Mechanical / x16 Electrical - Slot Kosong' }
      ],
      opticsDom: [
        { port: 'qsfp0', transceiverType: '100GBASE-SR4 QSFP28', rxPowerDbm: -2.1, txPowerDbm: -1.5, laserBiasMa: 7.2, tempC: 42.0, status: 'optimal' }
      ]
    },
    selLogs: [
      { id: 'sel-08', timestamp: '2026-10-20T05:10:00Z', sensor: 'Memory Bank A', severity: 'WARNING', description: 'Single-bit correctable ECC counter increased to 28 on DIMM_A1 (Threshold: 30)', code: '0x0219' }
    ],
    lastDiagnostic: null
  },

  // hw-os-01 (HPE ProLiant DL380 Gen10 Plus)
  {
    id: 'hw-os-01',
    nodeId: 'node-os-01',
    nodeName: 'compute-01-hypervisor',
    clusterId: 'cluster-openstack-01',
    clusterName: 'OpenStack-Edge-Cloud',
    serverModel: 'HPE ProLiant DL380 Gen10 Plus 2U',
    vendor: 'HPE',
    originCountry: 'United States',
    isTkdnCertified: false,
    bmcProtocol: 'HPE iLO 5 RESTful & Redfish',
    serialNumber: 'HPE-SGH1049J21',
    assetTag: 'DC3-RACK02-U08',
    biosVersion: 'HPE UEFI v2.56 (iLO 5 v2.72)',
    bmcType: 'iLO 5 Advanced',
    bmcIp: '192.168.10.11',
    bmcStatus: 'optimal',
    overallHealthScore: 97,
    overallStatus: 'healthy',
    uptimeDays: 85,
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
          model: 'Intel Xeon Gold 6348 (28 Cores / 56 Threads @ 2.60GHz - Boost 3.50GHz)',
          cores: 28,
          threads: 56,
          baseGhz: 2.60,
          currentGhz: 3.20,
          temperatureC: 46.5,
          tjMaxC: 85.0,
          voltageV: 1.16,
          vrmTempC: 50.1,
          throttleStatus: 'none',
          l1CacheKb: 2240,
          l2CacheMb: 35,
          l3CacheMb: 42,
          mceErrorCount: 0,
          coresThermal: [
            { coreId: 0, tempC: 45, usagePercent: 38 },
            { coreId: 1, tempC: 47, usagePercent: 42 },
            { coreId: 2, tempC: 46, usagePercent: 40 }
          ]
        }
      ]
    },
    memory: {
      totalCapacityGb: 256,
      installedDimmCount: 4,
      totalSlots: 16,
      dimmType: 'HPE SmartMemory DDR4 ECC Reg',
      speedMhz: 3200,
      multiBitUncorrectableErrors: 0,
      singleBitCorrectableErrors: 0,
      eccScrubbingStatus: 'active',
      dimmModules: [
        { slot: 'DIMM_1', channel: 'Channel 1', cpuSocket: 0, sizeGb: 64, manufacturer: 'HPE / Samsung', partNumber: 'P03052-091', serialNumber: 'HP291041', speedMhz: 3200, temperatureC: 39.5, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_2', channel: 'Channel 1', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_3', channel: 'Channel 2', cpuSocket: 0, sizeGb: 64, manufacturer: 'HPE / Samsung', partNumber: 'P03052-091', serialNumber: 'HP291042', speedMhz: 3200, temperatureC: 39.8, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_4', channel: 'Channel 2', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_5', channel: 'Channel 3', cpuSocket: 0, sizeGb: 64, manufacturer: 'HPE / Samsung', partNumber: 'P03052-091', serialNumber: 'HP291043', speedMhz: 3200, temperatureC: 40.1, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_6', channel: 'Channel 3', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        { slot: 'DIMM_7', channel: 'Channel 4', cpuSocket: 0, sizeGb: 64, manufacturer: 'HPE / Samsung', partNumber: 'P03052-091', serialNumber: 'HP291044', speedMhz: 3200, temperatureC: 39.7, status: 'optimal', detectionState: 'detected', correctableErrors: 0 },
        { slot: 'DIMM_8', channel: 'Channel 4', cpuSocket: 0, sizeGb: 0, manufacturer: 'None', partNumber: 'EMPTY', serialNumber: 'N/A', speedMhz: 0, temperatureC: 0, status: 'empty', detectionState: 'empty', correctableErrors: 0 },
        ...Array.from({ length: 8 }, (_, idx) => ({
          slot: `DIMM_${idx + 9}`,
          channel: `Channel ${(idx % 4) + 5}`,
          cpuSocket: 1,
          sizeGb: 0,
          manufacturer: 'None',
          partNumber: 'EMPTY',
          serialNumber: 'N/A',
          speedMhz: 0,
          temperatureC: 0,
          status: 'empty' as const,
          detectionState: 'empty' as const,
          correctableErrors: 0
        }))
      ]
    },
    storage: {
      totalBays: 8,
      populatedBays: 1,
      controller: {
        model: 'HPE Smart Array P408i-a SR Gen10',
        firmware: '4.11',
        cacheGb: 2,
        bbuStatus: 'optimal',
        bbuCapacityPercent: 100,
        writePolicy: 'WriteBack'
      },
      drives: [
        {
          bayId: 0,
          model: 'HPE 1.92TB SATA 6G Mixed Use SFF SC SSD',
          protocol: 'SATA 6Gb/s',
          capacityGb: 1920,
          healthPercent: 99,
          temperatureC: 36.0,
          wearLevelPercent: 1,
          tbwWrittenTb: 88.0,
          powerOnHours: 4200,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'healthy',
          smartStatus: 'PASSED',
          detectionState: 'detected',
          lastSelfTest: '2026-10-18T00:00:00Z',
          criticalWarning: 0,
          slotNote: 'OpenStack Compute Host Root Disk'
        },
        ...Array.from({ length: 7 }, (_, idx) => ({
          bayId: idx + 1,
          model: `Slot Bay #${idx + 1} Kosong`,
          protocol: 'EMPTY' as const,
          capacityGb: 0,
          healthPercent: 100,
          temperatureC: 0,
          wearLevelPercent: 0,
          tbwWrittenTb: 0,
          powerOnHours: 0,
          reallocatedSectors: 0,
          mediaErrors: 0,
          status: 'empty' as const,
          smartStatus: 'N/A' as const,
          detectionState: 'empty' as const,
          lastSelfTest: 'N/A',
          criticalWarning: 0,
          slotNote: 'Slot Bay Kosong'
        }))
      ]
    },
    power: {
      redundancyMode: '1+1 Redundant (Active/Standby)',
      totalPowerDrawW: 295,
      powerCapacityW: 800,
      psus: [
        { id: 'PSU-1', model: 'HPE 800W Flex Slot Platinum Hot-plug', status: 'online', detectionState: 'detected', inputVoltageV: 228.0, outputWatts: 150, efficiencyRating: '80 PLUS Platinum', tempC: 40.5, hotPlugReady: true },
        { id: 'PSU-2', model: 'HPE 800W Flex Slot Platinum Hot-plug', status: 'online', detectionState: 'detected', inputVoltageV: 228.4, outputWatts: 145, efficiencyRating: '80 PLUS Platinum', tempC: 40.0, hotPlugReady: true }
      ]
    },
    cooling: {
      ambientIntakeTempC: 20.8,
      ambientExhaustTempC: 31.5,
      airflowCfm: 130,
      fanProfile: 'Optimal Auto',
      fans: [
        { fanId: 'Fan 1 (Dual Rotor)', dualRotor: true, rpm: 5600, maxRpm: 14000, pwmPercent: 42, status: 'ok' },
        { fanId: 'Fan 2 (Dual Rotor)', dualRotor: true, rpm: 5650, maxRpm: 14000, pwmPercent: 42, status: 'ok' },
        { fanId: 'Fan 3 (Dual Rotor)', dualRotor: true, rpm: 5580, maxRpm: 14000, pwmPercent: 41, status: 'ok' }
      ],
      thermalZones: [
        { name: 'System Ambient Zone', tempC: 20.8, warnThreshold: 42.0, critThreshold: 48.0 },
        { name: 'CPU 1 Package', tempC: 46.5, warnThreshold: 75.0, critThreshold: 85.0 }
      ]
    },
    pcieAndNetwork: {
      pcieSlots: [
        { slotId: 'PCIe Slot 1', cardName: 'HPE Ethernet 10Gb 2-port 562SFP+ Adapter', linkSpeed: 'PCIe 3.0 @ 8.0 GT/s', mechanicalWidth: 'x8', negotiatedWidth: 'x8', aerStatus: 'clean', tempC: 44.0, detectionState: 'detected', slotNote: 'OpenStack Neutron Data Port' },
        { slotId: 'PCIe Slot 2', cardName: 'Slot Kosong', linkSpeed: 'N/A', mechanicalWidth: 'x16', negotiatedWidth: 'x0', aerStatus: 'n/a', tempC: 0, detectionState: 'empty', slotNote: 'PCIe Gen4 x16 Mechanical - Slot Kosong' }
      ],
      opticsDom: [
        { port: 'eth0', transceiverType: '10GBASE-SR SFP+', rxPowerDbm: -3.2, txPowerDbm: -2.0, laserBiasMa: 6.2, tempC: 37.0, status: 'optimal' }
      ]
    },
    selLogs: [
      { id: 'sel-09', timestamp: '2026-10-19T12:00:00Z', sensor: 'iLO 5 Security', severity: 'INFORMATIONAL', description: 'Silicon Root of Trust verified firmware signature on boot', code: '0x00A1' }
    ],
    lastDiagnostic: null
  },
  ...multiBrandAdditionalServers
];

// Helper to generate dynamic test items
export function createStandardDiagnosticSuite(): DiagnosticTestItem[] {
  return [
    { id: 't-cpu', name: 'CPU Instruction Parity, MCE & TjMax Margin', category: 'CPU', status: 'PENDING', durationMs: 0, details: 'Memeriksa register MCE, microcode security mitigations, dan suhu core vs TJMax.' },
    { id: 't-ram', name: 'RAM ECC Parity Scrubbing & Physical Slot Detection', category: 'RAM', status: 'PENDING', durationMs: 0, details: 'Menguji memory banks, mendeteksi bit-flips, memverifikasi deteksi SPD slot terisi vs kosong.' },
    { id: 't-storage', name: 'NVMe/SAS Drive Bay Backplane & S.M.A.R.T. Health Scan', category: 'STORAGE', status: 'PENDING', durationMs: 0, details: 'Memverifikasi TBW written, available spare, status deteksi bay fisik, dan media integrity.' },
    { id: 't-raid', name: 'Hardware RAID Controller & Cache BBU / SuperCap', category: 'STORAGE', status: 'PENDING', durationMs: 0, details: 'Memeriksa kapasitas BBU, NVRAM write-back protection, dan integritas firmware.' },
    { id: 't-psu', name: 'Dual PSU Redundancy 1+1 & Voltage Rail Stability', category: 'PSU', status: 'PENDING', durationMs: 0, details: 'Memvalidasi tegangan input AC 230V, kestabilan rail 12V/5V/3.3V, dan failover readiness.' },
    { id: 't-fan', name: 'Chassis Cooling Fans Tachometer & Thermal Airflow', category: 'FANS', status: 'PENDING', durationMs: 0, details: 'Uji respons PWM duty cycle dan tachometer dual-rotor fan tanpa rotor lock/stall.' },
    { id: 't-pcie', name: 'PCIe Expansion Slots Link Speed Negotiation & Optics', category: 'PCIE', status: 'PENDING', durationMs: 0, details: 'Memindai integritas link lane width (x16/x8), lane degradation, dan optical DOM RX/TX levels.' },
    { id: 't-bmc', name: 'BMC / IPMI 2.0 / Redfish Out-of-Band Integrity', category: 'BMC', status: 'PENDING', durationMs: 0, details: 'Memeriksa buffer System Event Log (SEL), baterai CMOS, dan chassis tamper sensor.' }
  ];
}
