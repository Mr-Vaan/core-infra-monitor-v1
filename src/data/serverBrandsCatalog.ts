export interface ServerBrandDefinition {
  id: string;
  name: string;
  category: 'indonesia' | 'global';
  country: string;
  countryCode: string;
  flagEmoji: string;
  tkdnCertified: boolean;
  tkdnScore?: number; // Nilai TKDN Kemenperin RI (%)
  headquarters: string;
  defaultBmcType: string;
  supportedProtocols: string[];
  popularModels: string[];
  formFactors: string[];
  description: string;
  sensorCapabilities: {
    cpuTelemetry: boolean;
    dimmSlotMapping: boolean;
    storageSmart: boolean;
    psuRedundancy: boolean;
    fanPwmControl: boolean;
    pcieAerLogs: boolean;
    selLogDecoding: boolean;
  };
}

export const SERVER_BRANDS_CATALOG: ServerBrandDefinition[] = [
  // ==========================================
  // BRAND SERVER INDONESIA (LOKAL & TKDN CERTIFIED)
  // ==========================================
  {
    id: 'axioo',
    name: 'Axioo Enterprise',
    category: 'indonesia',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    tkdnCertified: true,
    tkdnScore: 46.85,
    headquarters: 'Jakarta, Indonesia (PT Tera Data Indonusa Tbk)',
    defaultBmcType: 'Axioo MegaRAC / OpenBMC',
    supportedProtocols: ['DMTF Redfish v1.18+', 'IPMI 2.0 / LAN', 'SNMPv3', 'RESTful API'],
    popularModels: [
      'Axioo MyServer SX7 2U Dual Xeon Scalable',
      'Axioo MyServer RX5 1U High-Density',
      'Axioo MyServer GX8 4U AI Multi-GPU',
      'Axioo MyServer Storage Node 24-Bay'
    ],
    formFactors: ['1U Rackmount', '2U Rackmount', '4U GPU Chassis'],
    description: 'Server enterprise karya anak bangsa bersertifikasi TKDN Kemenperin RI, dirancang khusus untuk instansi pemerintah (LKPP), perbankan nasional, BUMN, dan data center lokal.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'zyrex',
    name: 'Zyrex Zaxtro',
    category: 'indonesia',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    tkdnCertified: true,
    tkdnScore: 48.20,
    headquarters: 'Jakarta Barat, Indonesia (PT Zyrexindo Mandiri Buana Tbk)',
    defaultBmcType: 'Zyrex AST2600 IPMI 2.0',
    supportedProtocols: ['IPMI 2.0', 'DMTF Redfish v1.16', 'SNMP v2c/v3', 'Web KVM (HTML5)'],
    popularModels: [
      'Zyrex Zaxtro ZS-240 2U Enterprise Rack',
      'Zyrex Zaxtro ZS-120 1U Compute Node',
      'Zyrex Zaxtro ZS-420 4U Big Storage',
      'Zyrex Zaxtro AI Edge Server'
    ],
    formFactors: ['1U Rack', '2U Rack', '4U Storage Tower/Rack'],
    description: 'Pelopor hardware teknologi komputasi nasional Indonesia dengan sertifikasi TKDN tinggi, mendukung prosesor AMD EPYC dan Intel Xeon untuk beban kerja cloud & virtualisasi.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'advan',
    name: 'Advan ProServer',
    category: 'indonesia',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    tkdnCertified: true,
    tkdnScore: 43.10,
    headquarters: 'Semarang & Jakarta, Indonesia (PT Bangga Teknologi Indonesia)',
    defaultBmcType: 'Advan AST2500 Redfish',
    supportedProtocols: ['DMTF Redfish API', 'IPMI 2.0 over LAN', 'SNMPv3'],
    popularModels: [
      'Advan ProServer G2 2U Dual Socket',
      'Advan ProServer G1 1U Web Front-End',
      'Advan DataCore DC-300 Storage Server'
    ],
    formFactors: ['1U Rack', '2U Rack'],
    description: 'Server infrastruktur berstandar nasional yang diproduksi di fasilitas perakitan modern Indonesia dengan efisiensi energi tinggi dan keandalan 24/7 non-stop.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'spc',
    name: 'SPC Enterprise Server',
    category: 'indonesia',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    tkdnCertified: true,
    tkdnScore: 41.50,
    headquarters: 'Jakarta, Indonesia (PT Supertone)',
    defaultBmcType: 'SPC MegaRAC Enterprise',
    supportedProtocols: ['IPMI 2.0', 'Redfish DMTF', 'SNMPv3'],
    popularModels: [
      'SPC Server Rack RS-200 2U Dual Xeon',
      'SPC Server Rack RS-100 1U Compact Node',
      'SPC Storage Master SM-400 24-Bay'
    ],
    formFactors: ['1U Rack', '2U Rack', '3U Storage'],
    description: 'Brand lokal berpengalaman lebih dari 30 tahun di industri manufaktur elektronik Indonesia, menyuplai server tangguh untuk sektor publik, edukasi, dan smart city.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'maspion',
    name: 'Maspion IT Server',
    category: 'indonesia',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    tkdnCertified: true,
    tkdnScore: 40.25,
    headquarters: 'Surabaya, Jawa Timur, Indonesia (Maspion Electronics)',
    defaultBmcType: 'Maspion OpenBMC',
    supportedProtocols: ['OpenBMC Linux API', 'IPMI 2.0', 'Redfish v1.17'],
    popularModels: [
      'Maspion M-Rack 2U Datacenter Node',
      'Maspion M-Cloud 1U Web Server'
    ],
    formFactors: ['1U Rack', '2U Rack'],
    description: 'Solusi perangkat keras server manufaktur Jawa Timur dengan kandungan lokal, didedikasikan untuk komputasi terdistribusi dan fasilitas edge computing di nusantara.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'polytron',
    name: 'Polytron Cloud Compute',
    category: 'indonesia',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    tkdnCertified: true,
    tkdnScore: 42.00,
    headquarters: 'Kudus, Jawa Tengah, Indonesia (PT Hartono Istana Teknologi)',
    defaultBmcType: 'Polytron AST2600 BMC',
    supportedProtocols: ['DMTF Redfish', 'IPMI 2.0', 'SNMPv3'],
    popularModels: [
      'Polytron CS-200 2U Cloud Computing Server',
      'Polytron EdgeBox EB-100 Industrial Server'
    ],
    formFactors: ['1U Rack', '2U Rack', 'Rugged Edge'],
    description: 'Pengembangan teknologi server komputasi canggih dengan standar ISO dan fasilitas SMT presisi di Indonesia.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },

  // ==========================================
  // BRAND SERVER GLOBAL / LUAR NEGERI (TIER-1)
  // ==========================================
  {
    id: 'dell',
    name: 'Dell Technologies',
    category: 'global',
    country: 'United States',
    countryCode: 'US',
    flagEmoji: '🇺🇸',
    tkdnCertified: false,
    headquarters: 'Round Rock, Texas, Amerika Serikat',
    defaultBmcType: 'iDRAC9 Enterprise',
    supportedProtocols: ['Dell iDRAC RESTful API', 'DMTF Redfish v1.18+', 'IPMI 2.0', 'WS-Man', 'SNMPv3'],
    popularModels: [
      'Dell PowerEdge R750 2U Rack Server',
      'Dell PowerEdge R760 / R760xa AI Server',
      'Dell PowerEdge R650 / R660 1U Ultra-Dense',
      'Dell PowerEdge MX7000 Modular Chassis',
      'Dell PowerEdge XE9680 8x H100 AI Supercomputer'
    ],
    formFactors: ['1U Rack', '2U Rack', '4U Rack', 'Modular Blade', 'Tower'],
    description: 'Pemimpin pasar server global dengan sistem manajemen jarak jauh terintegrasi iDRAC9/10, telemetri sensor terlengkap, dan integrasi enterprise OpenManage.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'hpe',
    name: 'Hewlett Packard Enterprise (HPE)',
    category: 'global',
    country: 'United States',
    countryCode: 'US',
    flagEmoji: '🇺🇸',
    tkdnCertified: false,
    headquarters: 'Spring, Texas, Amerika Serikat',
    defaultBmcType: 'iLO 6 Advanced',
    supportedProtocols: ['HPE iLO RESTful API', 'DMTF Redfish v1.18+', 'IPMI 2.0', 'SNMPv3', 'Silicon Root of Trust'],
    popularModels: [
      'HPE ProLiant DL380 Gen11 2U Server',
      'HPE ProLiant DL360 Gen10 Plus 1U',
      'HPE ProLiant DL385 Gen11 (AMD EPYC)',
      'HPE Apollo 4200 Gen10 High Density Storage',
      'HPE Synergy 480 Gen11 Composable Blade'
    ],
    formFactors: ['1U Rack', '2U Rack', '4U Rack', 'Composable Blade', 'Apollo'],
    description: 'Server tier-1 global terpercaya dengan Integrated Lights-Out (iLO 5 & iLO 6), proteksi keamanan Silicon Root of Trust, serta manajemen HPE OneView.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'lenovo',
    name: 'Lenovo ThinkSystem',
    category: 'global',
    country: 'China / Global',
    countryCode: 'CN',
    flagEmoji: '🇨🇳',
    tkdnCertified: false,
    headquarters: 'Beijing, Tiongkok & Morrisville, NC, Amerika Serikat',
    defaultBmcType: 'Lenovo XClarity Controller (XCC)',
    supportedProtocols: ['Lenovo XCC REST API', 'DMTF Redfish', 'IPMI 2.0', 'SNMPv3', 'XClarity Energy Manager'],
    popularModels: [
      'Lenovo ThinkSystem SR650 V3 2U Dual Socket',
      'Lenovo ThinkSystem SR630 V2 1U',
      'Lenovo ThinkSystem SR675 V3 AI GPU Server',
      'Lenovo ThinkEdge SE350 Rugged Edge Server'
    ],
    formFactors: ['1U Rack', '2U Rack', '3U GPU', 'Rugged Edge'],
    description: 'Infrastruktur datacenter kelas enterprise dengan peringkat reliabilitas uptime x86 nomor 1 di industri (ITIC survey) dan kontroler XClarity modern.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'supermicro',
    name: 'Supermicro (Super Micro Computer)',
    category: 'global',
    country: 'United States / Taiwan',
    countryCode: 'US',
    flagEmoji: '🇺🇸',
    tkdnCertified: false,
    headquarters: 'San Jose, California, Amerika Serikat & New Taipei, Taiwan',
    defaultBmcType: 'Supermicro IPMI 2.0 / Redfish',
    supportedProtocols: ['Supermicro Redfish API', 'IPMI 2.0 / ASPEED BMC', 'SNMPv3', 'SMCIPMITool'],
    popularModels: [
      'Supermicro Ultra SuperServer 2029U-TN24R4T',
      'Supermicro Hyper SuperServer SYS-221H-TNR',
      'Supermicro CloudDC 1U SYS-111C-NR',
      'Supermicro BigTwin Multi-Node 2U 4-Node',
      'Supermicro 8U 8-GPU HGX H100 AI Server'
    ],
    formFactors: ['1U Rack', '2U Rack', '2U 4-Node Multi-Node', '4U/8U GPU AI'],
    description: 'Produsen server modular terkemuka dunia dengan efisiensi termal tinggi, arsitektur Green Computing, dan dukungan terluas untuk CPU Intel, AMD, dan GPU NVIDIA.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'cisco',
    name: 'Cisco UCS (Unified Computing System)',
    category: 'global',
    country: 'United States',
    countryCode: 'US',
    flagEmoji: '🇺🇸',
    tkdnCertified: false,
    headquarters: 'San Jose, California, Amerika Serikat',
    defaultBmcType: 'Cisco IMC',
    supportedProtocols: ['Cisco IMC XML/JSON API', 'Cisco Intersight Cloud', 'DMTF Redfish', 'IPMI 2.0'],
    popularModels: [
      'Cisco UCS C240 M7 2U Rack Server',
      'Cisco UCS C220 M6 1U Rack Server',
      'Cisco UCS X-Series Modular System',
      'Cisco UCS B200 M6 Blade Server'
    ],
    formFactors: ['1U Rack', '2U Rack', 'Modular Blade UCS-X'],
    description: 'Arsitektur komputasi terpadu yang menggabungkan networking fabric 100GbE, komputasi, dan storage yang dikelola secara cloud melalui Cisco Intersight.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'huawei',
    name: 'Huawei Enterprise Server',
    category: 'global',
    country: 'China',
    countryCode: 'CN',
    flagEmoji: '🇨🇳',
    tkdnCertified: false,
    headquarters: 'Shenzhen, Guangdong, Tiongkok',
    defaultBmcType: 'Huawei iBMC',
    supportedProtocols: ['Huawei iBMC RESTful API', 'DMTF Redfish v1.17', 'IPMI 2.0', 'SNMPv3'],
    popularModels: [
      'Huawei FusionServer Pro 2288H V6 2U',
      'Huawei FusionServer Pro 1288H V6 1U',
      'Huawei TaiShan 200 ARM Server (Kunpeng 920)',
      'Huawei Atlas 800 AI Training Server'
    ],
    formFactors: ['1U Rack', '2U Rack', '4U AI / Storage'],
    description: 'Server performa tinggi dengan prosesor x86 dan arsitektur Kunpeng ARM, diperkuat chip manajemen cerdas Huawei Hi1710/Hi1711 iBMC.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'inspur',
    name: 'Inspur Information',
    category: 'global',
    country: 'China / Global',
    countryCode: 'CN',
    flagEmoji: '🇨🇳',
    tkdnCertified: false,
    headquarters: 'Jinan, Shandong, Tiongkok',
    defaultBmcType: 'Inspur ISBMC',
    supportedProtocols: ['Inspur ISBMC REST API', 'DMTF Redfish', 'IPMI 2.0', 'Open Computing OCP'],
    popularModels: [
      'Inspur NF5280M6 2U Dual Socket Server',
      'Inspur NF5180M6 1U Compute',
      'Inspur NF8480M6 4-Socket Mission Critical',
      'Inspur NF5468M6 AI HPC Server'
    ],
    formFactors: ['1U Rack', '2U Rack', '4U Mission Critical', 'Hyperscale Rack'],
    description: 'Raksasa penyedia server cloud hyperscale dan AI nomor satu di Asia, pelopor standar terbuka Open Compute Project (OCP).',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'fujitsu',
    name: 'Fujitsu PRIMERGY',
    category: 'global',
    country: 'Japan',
    countryCode: 'JP',
    flagEmoji: '🇯🇵',
    tkdnCertified: false,
    headquarters: 'Tokyo, Jepang',
    defaultBmcType: 'Fujitsu iRMC S5/S6',
    supportedProtocols: ['Fujitsu iRMC REST API', 'DMTF Redfish', 'IPMI 2.0', 'Fujitsu ServerView Suite'],
    popularModels: [
      'Fujitsu PRIMERGY RX2540 M7 2U Server',
      'Fujitsu PRIMERGY RX2530 M6 1U Server',
      'Fujitsu PRIMERGY TX1330 Tower Server'
    ],
    formFactors: ['1U Rack', '2U Rack', 'Tower'],
    description: 'Kualitas rekayasa dan presisi teknologi Jepang (Monozukuri) dengan tingkat efisiensi daya Cool-safe Advanced Thermal Design dan iRMC canggih.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'asus',
    name: 'ASUS Enterprise Server',
    category: 'global',
    country: 'Taiwan',
    countryCode: 'TW',
    flagEmoji: '🇹🇼',
    tkdnCertified: false,
    headquarters: 'Taipei, Taiwan',
    defaultBmcType: 'ASUS ASMB10-iKVM Redfish',
    supportedProtocols: ['ASMB10-iKVM Redfish API', 'ASUS Control Center (ACC)', 'IPMI 2.0', 'SNMPv3'],
    popularModels: [
      'ASUS RS720-E11-RS12U 2U Enterprise Server',
      'ASUS RS700-E11 1U High-Density',
      'ASUS ESC8000 G4 / G5 AI Training Server',
      'ASUS ExpertCenter Server Node'
    ],
    formFactors: ['1U Rack', '2U Rack', '4U AI GPU'],
    description: 'Solusi server serverboard nomor 1 Taiwan dengan kemampuan overclocking datacenter, pendinginan termal cerdas, dan sertifikasi SPEC benchmark teratas.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'gigabyte',
    name: 'GIGABYTE Technology',
    category: 'global',
    country: 'Taiwan',
    countryCode: 'TW',
    flagEmoji: '🇹🇼',
    tkdnCertified: false,
    headquarters: 'New Taipei City, Taiwan',
    defaultBmcType: 'GIGABYTE MegaRAC SP-X',
    supportedProtocols: ['GIGABYTE Management Console (GMC)', 'DMTF Redfish', 'IPMI 2.0', 'GSM CLI'],
    popularModels: [
      'GIGABYTE R282-Z90 2U AMD EPYC Server',
      'GIGABYTE R182-M90 1U Dual Intel',
      'GIGABYTE G292 / G492 High Density AI Server',
      'GIGABYTE E252 Edge Computing Server'
    ],
    formFactors: ['1U Rack', '2U Rack', '2U 4-GPU', '4U Multi-GPU', 'Short-depth Edge'],
    description: 'Inovator server HPC dan AI komputasi berkecepatan tinggi dengan motherboard teruji serta dukungan prosesor AMD EPYC dan Ampere Altra ARM.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'oracle',
    name: 'Oracle Server / Exadata',
    category: 'global',
    country: 'United States',
    countryCode: 'US',
    flagEmoji: '🇺🇸',
    tkdnCertified: false,
    headquarters: 'Austin, Texas, Amerika Serikat',
    defaultBmcType: 'Oracle ILOM v5',
    supportedProtocols: ['Oracle Integrated Lights Out Manager (ILOM)', 'DMTF Redfish', 'IPMI 2.0', 'SNMPv3'],
    popularModels: [
      'Oracle Server X9-2 1U Server',
      'Oracle Server X9-2L 2U Storage Server',
      'Oracle Exadata X9M Database Machine Compute Node'
    ],
    formFactors: ['1U Rack', '2U Rack', 'Exadata Engineered System'],
    description: 'Perangkat keras komputasi enterprise yang dioptimalkan secara khusus untuk beban kerja basis data mission-critical Oracle dan telemetri ILOM tingkat tinggi.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'ibm',
    name: 'IBM Systems',
    category: 'global',
    country: 'United States',
    countryCode: 'US',
    flagEmoji: '🇺🇸',
    tkdnCertified: false,
    headquarters: 'Armonk, New York, Amerika Serikat',
    defaultBmcType: 'IBM ASMI / HMC',
    supportedProtocols: ['IBM Advanced System Management Interface (ASMI)', 'HMC REST API', 'DMTF Redfish', 'SNMPv3'],
    popularModels: [
      'IBM Power Systems S1024 (POWER10 4U)',
      'IBM Power S1014 Enterprise Edge',
      'IBM LinuxONE 4 / z16 Mainframe Compute'
    ],
    formFactors: ['2U Rack', '4U Rack', 'Mainframe Frame'],
    description: 'Sistem komputasi keandalan tinggi (99.9999% availability) dengan prosesor IBM POWER10 dan enkripsi kuantum-aman terintegrasi.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'qct',
    name: 'Quanta Cloud Technology (QCT)',
    category: 'global',
    country: 'Taiwan',
    countryCode: 'TW',
    flagEmoji: '🇹🇼',
    tkdnCertified: false,
    headquarters: 'Taoyuan City, Taiwan',
    defaultBmcType: 'QCT OrCA BMC',
    supportedProtocols: ['DMTF Redfish', 'IPMI 2.0', 'OpenBMC', 'QCT System Manager'],
    popularModels: [
      'QCT QuantaGrid D52B-1U Cloud Server',
      'QCT QuantaPlex T42S-2U 4-Node',
      'QCT QuantaGrid D54X-1U'
    ],
    formFactors: ['1U Rack', '2U Rack', '2U 4-Node Multi-Node'],
    description: 'Pionir server hyperscale ODM untuk penyedia cloud raksasa dunia, berarsitektur OCP dengan efisiensi datacenter skala besar.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'wiwynn',
    name: 'Wiwynn Cloud Server',
    category: 'global',
    country: 'Taiwan',
    countryCode: 'TW',
    flagEmoji: '🇹🇼',
    tkdnCertified: false,
    headquarters: 'New Taipei City, Taiwan',
    defaultBmcType: 'OpenBMC Linux Foundation',
    supportedProtocols: ['OpenBMC REST', 'DMTF Redfish v1.18+', 'IPMI 2.0'],
    popularModels: [
      'Wiwynn SV7220G3 OCP Cloud Server',
      'Wiwynn SV5100G4 1U Rack Server',
      'Wiwynn Mt. Jade 2-Socket Ampere ARM'
    ],
    formFactors: ['19" EIA Rack', '21" OCP Open Rack'],
    description: 'Kontributor utama Open Compute Project yang merancang infrastruktur cloud server hyperscale berbasis OpenBMC murni.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  },
  {
    id: 'tyan',
    name: 'TYAN (MiTAC Computing)',
    category: 'global',
    country: 'Taiwan',
    countryCode: 'TW',
    flagEmoji: '🇹🇼',
    tkdnCertified: false,
    headquarters: 'Taoyuan, Taiwan',
    defaultBmcType: 'ASPEED AST2600 Redfish',
    supportedProtocols: ['IPMI 2.0', 'DMTF Redfish', 'SNMPv3'],
    popularModels: [
      'TYAN Transport CX GC68-B7136 1U Cloud',
      'TYAN Transport HX TN83-B8251 2U GPU',
      'TYAN Transport SX TS70-B7126 Storage'
    ],
    formFactors: ['1U Rack', '2U Rack', '4U GPU Chassis'],
    description: 'Spesialis server platform OEM/ODM dengan keandalan motherboard kelas enterprise dan kompatibilitas industri yang luas.',
    sensorCapabilities: {
      cpuTelemetry: true,
      dimmSlotMapping: true,
      storageSmart: true,
      psuRedundancy: true,
      fanPwmControl: true,
      pcieAerLogs: true,
      selLogDecoding: true
    }
  }
];

export function getBrandById(id: string): ServerBrandDefinition | undefined {
  return SERVER_BRANDS_CATALOG.find(b => b.id.toLowerCase() === id.toLowerCase());
}

export function detectBrandFromModel(modelName: string): ServerBrandDefinition | undefined {
  const lower = modelName.toLowerCase();
  if (lower.includes('axioo')) return getBrandById('axioo');
  if (lower.includes('zyrex') || lower.includes('zaxtro')) return getBrandById('zyrex');
  if (lower.includes('advan')) return getBrandById('advan');
  if (lower.includes('spc')) return getBrandById('spc');
  if (lower.includes('maspion')) return getBrandById('maspion');
  if (lower.includes('polytron')) return getBrandById('polytron');
  if (lower.includes('dell') || lower.includes('poweredge')) return getBrandById('dell');
  if (lower.includes('hpe') || lower.includes('proliant') || lower.includes('apollo')) return getBrandById('hpe');
  if (lower.includes('lenovo') || lower.includes('thinksystem')) return getBrandById('lenovo');
  if (lower.includes('supermicro') || lower.includes('superserver')) return getBrandById('supermicro');
  if (lower.includes('cisco') || lower.includes('ucs')) return getBrandById('cisco');
  if (lower.includes('huawei') || lower.includes('fusionserver') || lower.includes('taishan')) return getBrandById('huawei');
  if (lower.includes('inspur')) return getBrandById('inspur');
  if (lower.includes('fujitsu') || lower.includes('primergy')) return getBrandById('fujitsu');
  if (lower.includes('asus')) return getBrandById('asus');
  if (lower.includes('gigabyte')) return getBrandById('gigabyte');
  if (lower.includes('oracle') || lower.includes('exadata') || lower.includes('sun')) return getBrandById('oracle');
  if (lower.includes('ibm') || lower.includes('power10') || lower.includes('zsystems')) return getBrandById('ibm');
  if (lower.includes('quanta') || lower.includes('qct')) return getBrandById('qct');
  if (lower.includes('wiwynn')) return getBrandById('wiwynn');
  if (lower.includes('tyan')) return getBrandById('tyan');
  return undefined;
}
