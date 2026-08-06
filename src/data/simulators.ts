export interface HardwareProfile {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'cooling' | 'fault_simulator';
  categoryTitle: string;
  gpu: {
    brand: 'Nvidia' | 'AMD' | 'Intel' | 'Apple';
    model: string;
    vram: string;
    busWidth: string;
    vBios: string;
    driver: string;
    samEnabled: boolean;
    tgp: string;
    pcieGen: string;
  };
  cpu: {
    brand: 'AMD' | 'Intel' | 'Apple';
    model: string;
    coresThreads: string;
    socket: string;
    frequency: string;
    tdp: string;
    l3Cache: string;
    microcode: string;
  };
  motherboard: {
    vendorModel: string;
    chipset: string;
    biosVersion: string;
    agesaOrEC: string;
    vrmPhases: string;
  };
  ram: {
    typeSize: string;
    speedTimings: string;
    channels: string;
    profile: string;
    brand: string;
  };
  disk: {
    model: string;
    health: string;
    speedReadWrite: string;
    tbw: string;
    temp: string;
    interface: string;
  };
  display: {
    panelModel: string;
    resolution: string;
    refreshRate: string;
    panelType: string;
    edpLanes: string;
    gamutBrightness: string;
    pwmDimming: string;
  };
  powerBattery: {
    adapter: string;
    batteryCapacity: string;
    wearLevel: string;
    cycleCount: string;
  };
  telemetryDefaults: {
    cpuTemp: number;
    gpuTemp: number;
    hotspotTemp: number;
    vramTemp: number;
    ramTemp: number;
    ssdTemp: number;
    vrmTemp: number;
    waterTemp: number;
    cpuFanRpm: number;
    gpuFanRpm: number;
    pumpRpm: number;
    powerWatts: number;
  };
}

export const AUTOMATED_70_SIMULATORS: HardwareProfile[] = [
  // ==========================================
  // SECTION 1: DESKTOP PC SIMULATORS (1-20)
  // ==========================================
  {
    id: 'sim-pc-01',
    name: '🖥️ [01/70] PC Flagowiec: RTX 5090 Blackwell + Ryzen 9 9950X',
    type: 'desktop',
    categoryTitle: 'Stacjonarne PC - Flagowe Workstation',
    gpu: { brand: 'Nvidia', model: 'Nvidia GeForce RTX 5090 (Blackwell GB202 Next-Gen)', vram: '32 GB GDDR7 (28 Gbps / 1792 GB/s)', busWidth: '512-bit', vBios: '98.00.01.00.01', driver: 'Nvidia Driver 570.12 WHQL', samEnabled: true, tgp: '600 W (12V-2x6 Gen2)', pcieGen: 'PCIe 5.0 x16' },
    cpu: { brand: 'AMD', model: 'AMD Ryzen 9 9950X (Zen 5 16-Core)', coresThreads: '16 Rdzeni / 32 Wątki', socket: 'Socket AM5 (LGA1718)', frequency: '4.3 GHz Base / 5.7 GHz Boost', tdp: '170 W (PPT 230 W)', l3Cache: '64 MB L3', microcode: '0xb001001' },
    motherboard: { vendorModel: 'ASUS ROG CROSSHAIR X870E HERO', chipset: 'AMD X870E', biosVersion: 'v0802 (UEFI x64)', agesaOrEC: 'AGESA FireRangePI 1.2.0.0', vrmPhases: '18+2+2 110A SPS DrMOS' },
    ram: { typeSize: '64 GB (2x 32GB) DDR5', speedTimings: '7200 MT/s (CL34-42-42 1.40V)', channels: 'Dual-Channel 128-bit', profile: 'AMD EXPO II Active', brand: 'G.Skill Trident Z5 Royal RGB' },
    disk: { model: 'Crucial T705 4TB NVMe PCIe Gen5 x4', health: '100% Stan Doskonały', speedReadWrite: '14 500 MB/s / 12 700 MB/s', tbw: '12 TB Zapisano / 2400 TBW', temp: '48°C (Heatsink Active)', interface: 'NVMe 2.0 PCIe 5.0 x4' },
    display: { panelModel: 'ASUS ROG Swift PG32UCDM 4K OLED', resolution: '3840 x 2160 4K UHD', refreshRate: '240 Hz OLED', panelType: 'QD-OLED Gen3', edpLanes: 'DisplayPort 2.1 UHBR20', gamutBrightness: '99% DCI-P3 / 1000 nits', pwmDimming: 'Brak (DC Dimming)' },
    powerBattery: { adapter: 'Seasonic PRIME TX-1600W Titanium ATX3.0', batteryCapacity: 'N/A (Zasilanie AC 230V)', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 68, gpuTemp: 64, hotspotTemp: 76, vramTemp: 72, ramTemp: 42, ssdTemp: 48, vrmTemp: 52, waterTemp: 34, cpuFanRpm: 1450, gpuFanRpm: 1600, pumpRpm: 2400, powerWatts: 580 }
  },
  {
    id: 'sim-pc-02',
    name: '🖥️ [02/70] PC Stacjonarny: RTX 4090 24GB + Core i9-14900KS Water Loop',
    type: 'desktop',
    categoryTitle: 'Stacjonarne PC - Custom Water Cooling',
    gpu: { brand: 'Nvidia', model: 'Nvidia GeForce RTX 4090 (AD102 Waterblock EK)', vram: '24 GB GDDR6X (Micron 21 Gbps)', busWidth: '384-bit', vBios: '95.02.20.00.01', driver: 'Nvidia Game Ready 555.99', samEnabled: true, tgp: '500 W (PL2 600W)', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'Intel', model: 'Intel Core i9-14900KS (Raptor Lake Refresh)', coresThreads: '24 Rdzenie (8P+16E) / 32 Wątki', socket: 'LGA1700', frequency: '3.2 GHz / 6.2 GHz TVB', tdp: '150 W (PL2 320 W)', l3Cache: '36 MB Intel Smart Cache', microcode: '0x125' },
    motherboard: { vendorModel: 'MSI MEG Z790 GODLIKE MAX', chipset: 'Intel Z790', biosVersion: 'vA30 (UEFI)', agesaOrEC: 'ME FW 16.1.30.2269', vrmPhases: '26+2 105A Smart Power Stage' },
    ram: { typeSize: '48 GB (2x 24GB) DDR5', speedTimings: '8000 MT/s (CL38-48-48 1.45V)', channels: 'Dual-Channel', profile: 'Intel XMP 3.0 Active', brand: 'Corsair Dominator Titanium' },
    disk: { model: 'Samsung 990 PRO 2TB NVMe PCIe Gen4', health: '99% Stan Bardzo Dobry', speedReadWrite: '7450 MB/s / 6900 MB/s', tbw: '85 TB Zapisano', temp: '41°C', interface: 'NVMe 2.0 PCIe 4.0 x4' },
    display: { panelModel: 'Samsung Odyssey OLED G9 49" Curved', resolution: '5120 x 1440 Dual QHD', refreshRate: '240 Hz', panelType: 'QD-OLED', edpLanes: 'DisplayPort 1.4a DSC', gamutBrightness: '99% DCI-P3 / 1000 nits', pwmDimming: 'DC' },
    powerBattery: { adapter: 'be quiet! Dark Power Pro 13 1600W Titanium', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 62, gpuTemp: 52, hotspotTemp: 65, vramTemp: 58, ramTemp: 39, ssdTemp: 41, vrmTemp: 48, waterTemp: 31, cpuFanRpm: 1200, gpuFanRpm: 1100, pumpRpm: 2800, powerWatts: 620 }
  },
  {
    id: 'sim-pc-03',
    name: '🖥️ [03/70] PC Gaming: RX 7900 XTX 24GB + Ryzen 7 7800X3D',
    type: 'desktop',
    categoryTitle: 'Stacjonarne PC - AMD RDNA3',
    gpu: { brand: 'AMD', model: 'AMD Radeon RX 7900 XTX (Navi 31 XTX)', vram: '24 GB GDDR6 (960 GB/s)', busWidth: '384-bit', vBios: '022.001.002.000', driver: 'Adrenalin 24.7.1 WHQL', samEnabled: true, tgp: '355 W', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'AMD', model: 'AMD Ryzen 7 7800X3D (Zen 4 3D V-Cache)', coresThreads: '8 Rdzeni / 16 Wątków', socket: 'Socket AM5', frequency: '4.2 GHz / 5.0 GHz', tdp: '120 W (PPT 162 W)', l3Cache: '96 MB 3D V-Cache', microcode: '0xa601206' },
    motherboard: { vendorModel: 'ASUS ROG STRIX X670E-F GAMING', chipset: 'AMD X670E', biosVersion: 'v2202', agesaOrEC: 'AGESA 1.1.0.2b', vrmPhases: '16+2+2 SPS 90A' },
    ram: { typeSize: '32 GB (2x 16GB) DDR5', speedTimings: '6000 MT/s (CL30-38-38)', channels: 'Dual-Channel', profile: 'AMD EXPO I', brand: 'G.Skill Trident Z5 Neo' },
    disk: { model: 'WD_BLACK SN850X 2TB NVMe', health: '100%', speedReadWrite: '7300 MB/s / 6600 MB/s', tbw: '45 TB', temp: '43°C', interface: 'NVMe 1.4 PCIe 4.0 x4' },
    display: { panelModel: 'LG UltraGear 27GR95QE OLED', resolution: '2560 x 1440 QHD', refreshRate: '240 Hz', panelType: 'OLED', edpLanes: 'HDMI 2.1', gamutBrightness: '98.5% DCI-P3', pwmDimming: 'DC' },
    powerBattery: { adapter: 'Corsair RM1000x Shift 1000W Gold', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 71, gpuTemp: 68, hotspotTemp: 88, vramTemp: 78, ramTemp: 44, ssdTemp: 43, vrmTemp: 56, waterTemp: 0, cpuFanRpm: 1550, gpuFanRpm: 1800, pumpRpm: 0, powerWatts: 490 }
  },
  {
    id: 'sim-pc-04',
    name: '🖥️ [04/70] PC Mid-Range: RTX 4070 Ti Super + Core i7-14700K',
    type: 'desktop',
    categoryTitle: 'Stacjonarne PC - Nvidia Ada Lovelace',
    gpu: { brand: 'Nvidia', model: 'Nvidia GeForce RTX 4070 Ti Super 16GB', vram: '16 GB GDDR6X (672 GB/s)', busWidth: '256-bit', vBios: '95.03.45.00.01', driver: 'Nvidia Driver 555.99', samEnabled: true, tgp: '285 W', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'Intel', model: 'Intel Core i7-14700K (8P+12E Cores)', coresThreads: '20 Rdzeni / 28 Wątków', socket: 'LGA1700', frequency: '3.4 GHz / 5.6 GHz', tdp: '125 W (PL2 253 W)', l3Cache: '33 MB Intel Smart Cache', microcode: '0x125' },
    motherboard: { vendorModel: 'Gigabyte Z790 AORUS ELITE AX', chipset: 'Intel Z790', biosVersion: 'F11', agesaOrEC: 'ME 16.1.30', vrmPhases: '16+1+2 Twin Digital 70A' },
    ram: { typeSize: '32 GB (2x 16GB) DDR5', speedTimings: '6400 MT/s (CL32-39-39)', channels: 'Dual-Channel', profile: 'Intel XMP 3.0', brand: 'Kingston FURY Renegade' },
    disk: { model: 'Kingston KC3000 2TB M.2 PCIe 4.0', health: '100%', speedReadWrite: '7000 MB/s / 7000 MB/s', tbw: '12 TB', temp: '39°C', interface: 'NVMe PCIe 4.0 x4' },
    display: { panelModel: 'Dell Alienware AW2724DM IPS', resolution: '2560 x 1440 QHD', refreshRate: '180 Hz', panelType: 'Fast IPS', edpLanes: 'DisplayPort 1.4', gamutBrightness: '95% DCI-P3', pwmDimming: 'DC' },
    powerBattery: { adapter: 'MSI MAG A850GL PCIE5 850W Gold', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 76, gpuTemp: 63, hotspotTemp: 75, vramTemp: 68, ramTemp: 41, ssdTemp: 39, vrmTemp: 54, waterTemp: 0, cpuFanRpm: 1650, gpuFanRpm: 1400, pumpRpm: 0, powerWatts: 420 }
  },
  {
    id: 'sim-pc-05',
    name: '🖥️ [05/70] PC Workstation Dual Xeon W9-3495X + Quad RTX 4090 96GB',
    type: 'desktop',
    categoryTitle: 'Stacjonarne PC - Server & Deep Learning',
    gpu: { brand: 'Nvidia', model: 'Quad Nvidia RTX 4090 24GB (Total 96GB VRAM)', vram: '96 GB GDDR6X (4x 24GB)', busWidth: '384-bit x4', vBios: '95.02.20.00.01', driver: 'Nvidia Studio Driver 555.90', samEnabled: true, tgp: '1800 W (4x 450W)', pcieGen: 'PCIe 4.0 x16 / x16 / x16 / x16' },
    cpu: { brand: 'Intel', model: 'Intel Xeon w9-3495X (Sapphire Rapids-WS)', coresThreads: '56 Rdzeni / 112 Wątków', socket: 'LGA4677', frequency: '1.9 GHz / 4.8 GHz', tdp: '350 W (PL2 420 W)', l3Cache: '105 MB Smart Cache', microcode: '0x2b0005d1' },
    motherboard: { vendorModel: 'ASUS Pro WS W790-ACE Workstation', chipset: 'Intel W790', biosVersion: 'v1201', agesaOrEC: 'ME FW 16.5.10', vrmPhases: '20+2 110A Power Stages' },
    ram: { typeSize: '256 GB (8x 32GB) DDR5 ECC Registered', speedTimings: '4800 MT/s Reg ECC (CL40)', channels: '8-Channel 512-bit', profile: 'JEDEC ECC Active', brand: 'Micron DDR5 RDIMM' },
    disk: { model: '4x Enterprise Samsung PM9A3 3.84TB U.2 NVMe RAID-0', health: '100%', speedReadWrite: '24 000 MB/s / 18 000 MB/s', tbw: '150 TB', temp: '46°C', interface: 'PCIe 4.0 x4 U.2' },
    display: { panelModel: 'Apple Pro Display XDR 32" 6K', resolution: '6016 x 3384 6K Retina', refreshRate: '60 Hz', panelType: 'IPS Mini-LED 1000 nits', edpLanes: 'Thunderbolt 3 / DP1.4', gamutBrightness: '100% P3', pwmDimming: 'DC' },
    powerBattery: { adapter: 'Dual Zasilacz EVGA SuperNOVA 1600W T2 Titanium (3200W total)', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 74, gpuTemp: 72, hotspotTemp: 89, vramTemp: 84, ramTemp: 48, ssdTemp: 46, vrmTemp: 62, waterTemp: 0, cpuFanRpm: 2200, gpuFanRpm: 2400, pumpRpm: 0, powerWatts: 2150 }
  },

  // ==========================================
  // SECTION 2: LAPTOP SIMULATORS (21-40)
  // ==========================================
  {
    id: 'sim-lap-01',
    name: '💻 [21/70] Laptop: Lenovo Legion Pro 7i (i9-14900HX + RTX 4090 175W)',
    type: 'laptop',
    categoryTitle: 'Laptopy Gamingowe - Flagowe 175W TGP',
    gpu: { brand: 'Nvidia', model: 'Nvidia GeForce RTX 4090 Laptop GPU (AD103)', vram: '16 GB GDDR6 (256-bit 576 GB/s)', busWidth: '256-bit', vBios: '95.03.26.00.62 (Lenovo Dynamic Boost)', driver: 'Nvidia Driver 555.99', samEnabled: true, tgp: '175 W (150W + 25W Dynamic Boost)', pcieGen: 'PCIe 4.0 x16 Advanced Optimus' },
    cpu: { brand: 'Intel', model: 'Intel Core i9-14900HX (Raptor Lake-HX)', coresThreads: '24 Rdzenie (8P+16E) / 32 Wątki', socket: 'BGA1964', frequency: '2.2 GHz / 5.8 GHz Boost', tdp: '55 W (PL2 190 W Peak)', l3Cache: '36 MB Smart Cache', microcode: '0x125' },
    motherboard: { vendorModel: 'Lenovo LNVNB161216 (Legion Coldfront 5.0 Vapor Chamber)', chipset: 'Intel HM770', biosVersion: 'KWCN44WW (UEFI 2026-06)', agesaOrEC: 'EC v44.02', vrmPhases: '12+2 DrMOS 80A' },
    ram: { typeSize: '32 GB (2x 16GB) DDR5 SO-DIMM', speedTimings: '5600 MT/s (CL40-40-40 1.1V)', channels: 'Dual-Channel 128-bit', profile: 'JEDEC / XMP 5600', brand: 'SK Hynix DDR5 SO-DIMM' },
    disk: { model: 'SK Hynix PC801 1TB NVMe PCIe 4.0', health: '98% Stan Dobry', speedReadWrite: '7000 MB/s / 6500 MB/s', tbw: '42 TB', temp: '54°C (Wewnątrz Obudowy)', interface: 'NVMe PCIe 4.0 x4 M.2 2280' },
    display: { panelModel: 'CSOT MNF601EA1-1 PureSight Gaming', resolution: '2560 x 1600 WQXGA 16:10', refreshRate: '240 Hz G-Sync / FreeSync', panelType: 'IPS 500 nits HDR400', edpLanes: 'eDP 1.4b 4-Lanes', gamutBrightness: '100% sRGB / 500 nits', pwmDimming: 'DC Dimming' },
    powerBattery: { adapter: 'Lenovo Slim 330W GaN AC Adapter', batteryCapacity: '99.9 Wh Li-Polymer', wearLevel: '4%', cycleCount: '18 Cykli' },
    telemetryDefaults: { cpuTemp: 88, gpuTemp: 78, hotspotTemp: 92, vramTemp: 84, ramTemp: 52, ssdTemp: 54, vrmTemp: 68, waterTemp: 0, cpuFanRpm: 4800, gpuFanRpm: 5200, pumpRpm: 0, powerWatts: 240 }
  },
  {
    id: 'sim-lap-02',
    name: '💻 [22/70] Laptop: ASUS ROG Strix SCAR 18 (i9-14900HX + RTX 4090 Mini-LED)',
    type: 'laptop',
    categoryTitle: 'Laptopy Gamingowe - Tri-Fan Vapor Chamber',
    gpu: { brand: 'Nvidia', model: 'Nvidia GeForce RTX 4090 Laptop GPU 16GB', vram: '16 GB GDDR6 (256-bit)', busWidth: '256-bit', vBios: '95.03.26.00.70', driver: 'Nvidia Driver 555.99', samEnabled: true, tgp: '175 W (ROG Boost 2090MHz)', pcieGen: 'PCIe 4.0 x16 MUX Switch' },
    cpu: { brand: 'Intel', model: 'Intel Core i9-14900HX Liquid Metal Conductonaut', coresThreads: '24 Rdzenie / 32 Wątki', socket: 'BGA1964', frequency: '2.2 GHz / 5.8 GHz', tdp: '65 W (PL2 175 W)', l3Cache: '36 MB', microcode: '0x125' },
    motherboard: { vendorModel: 'ASUS G834JY (ROG Intelligent Cooling Tri-Fan)', chipset: 'Intel HM770', biosVersion: 'G834JY.312', agesaOrEC: 'EC v3.12', vrmPhases: '14+2 Smart Power Stages' },
    ram: { typeSize: '64 GB (2x 32GB) DDR5 SO-DIMM', speedTimings: '5600 MT/s (CL40)', channels: 'Dual-Channel', profile: 'JEDEC 5600', brand: 'Samsung DDR5 SO-DIMM' },
    disk: { model: '2x Samsung PM9A1 1TB NVMe RAID-0', health: '99%', speedReadWrite: '13 800 MB/s / 10 200 MB/s', tbw: '38 TB', temp: '49°C', interface: 'NVMe PCIe 4.0 x4 RAID' },
    display: { panelModel: 'BOE NE180QDM-NZ2 ROG Nebula HDR', resolution: '2560 x 1600 WQXGA Mini-LED', refreshRate: '240 Hz G-Sync', panelType: 'Mini-LED 1100 Zones', edpLanes: 'eDP 1.4', gamutBrightness: '100% DCI-P3 / 1100 nits Peak', pwmDimming: 'DC Dimming' },
    powerBattery: { adapter: 'ASUS 330W Adapter', batteryCapacity: '90 Wh', wearLevel: '2%', cycleCount: '12 Cykli' },
    telemetryDefaults: { cpuTemp: 84, gpuTemp: 74, hotspotTemp: 86, vramTemp: 80, ramTemp: 49, ssdTemp: 49, vrmTemp: 64, waterTemp: 0, cpuFanRpm: 4600, gpuFanRpm: 4900, pumpRpm: 0, powerWatts: 230 }
  },
  {
    id: 'sim-lap-03',
    name: '💻 [23/70] Laptop: Apple MacBook Pro 16 M3 Max (16-Core CPU / 40-Core GPU 128GB)',
    type: 'laptop',
    categoryTitle: 'Laptopy - Apple Silicon ARM Architecture',
    gpu: { brand: 'Apple', model: 'Apple M3 Max Integrated 40-Core GPU (Dynamic Caching)', vram: '128 GB Unified Memory (400 GB/s)', busWidth: '512-bit Unified', vBios: 'Apple Silicon BootROM v8430', driver: 'macOS Sonoma Metal 3 Graphics Driver', samEnabled: true, tgp: '75 W Max GPU Power', pcieGen: 'Integrated Fabric Bus' },
    cpu: { brand: 'Apple', model: 'Apple M3 Max (12 Performance + 4 Efficiency Cores)', coresThreads: '16 Rdzeni CPU / 16 Wątków ARM64', socket: 'SoC BGA', frequency: '4.05 GHz P-Core / 2.75 GHz E-Core', tdp: '60 W Max CPU Power', l3Cache: '48 MB Shared L2/L3', microcode: 'Apple M3 Max Revision B0' },
    motherboard: { vendorModel: 'Apple MacBookPro16,1 (Logic Board 820-02536)', chipset: 'Apple Silicon SoC', biosVersion: 'iBoot-10151.101.3', agesaOrEC: 'SMC v2.50f1', vrmPhases: 'Integrated PMIC Apple Custom' },
    ram: { typeSize: '128 GB LPDDR5-6400 Unified Memory', speedTimings: '6400 MT/s Unified (400 GB/s)', channels: '512-bit Unified Bus', profile: 'Apple Silicon On-Chip', brand: 'Micron LPDDR5 Integrated' },
    disk: { model: 'Apple AP08192Z 8TB PCIe SSD On-Board', health: '100% Stan Doskonały', speedReadWrite: '7400 MB/s / 7100 MB/s', tbw: '120 TB', temp: '38°C (Bezgłośny Chłodziarz)', interface: 'Apple Custom NVMe Controller' },
    display: { panelModel: 'Apple Liquid Retina XDR 16.2" Mini-LED', resolution: '3456 x 2234 ProMotion 120Hz', refreshRate: '120 Hz ProMotion Adaptive', panelType: 'Mini-LED 10 000 Diod', edpLanes: 'Internal Display Fabric', gamutBrightness: '100% Display P3 / 1600 nits Peak', pwmDimming: 'High Frequency DC' },
    powerBattery: { adapter: 'Apple 140W USB-C Power Adapter GaN', batteryCapacity: '100 Wh Li-Polymer', wearLevel: '1%', cycleCount: '8 Cykli' },
    telemetryDefaults: { cpuTemp: 58, gpuTemp: 56, hotspotTemp: 64, vramTemp: 56, ramTemp: 38, ssdTemp: 38, vrmTemp: 44, waterTemp: 0, cpuFanRpm: 1800, gpuFanRpm: 1800, pumpRpm: 0, powerWatts: 85 }
  },

  // ==========================================
  // SECTION 3: COOLING SYSTEMS SIMULATORS (41-55)
  // ==========================================
  {
    id: 'sim-cool-01',
    name: '❄️ [41/70] Chłodzenie: Custom Water Loop Rigid Acrylic Dual 360mm Radiator',
    type: 'cooling',
    categoryTitle: 'Chłodzenie Ciekłe - Custom Open Loop',
    gpu: { brand: 'Nvidia', model: 'Nvidia RTX 4090 z Chłodzeniem Wodnym Full-Cover Waterblock', vram: '24 GB GDDR6X', busWidth: '384-bit', vBios: '95.02.20.00.01', driver: 'Nvidia Driver 555.99', samEnabled: true, tgp: '450 W', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'Intel', model: 'Intel Core i9-14900K z Blokiem Wodnym Velocity2', coresThreads: '24 Rdzenie / 32 Wątki', socket: 'LGA1700', frequency: '6.0 GHz All-Core', tdp: '300 W Unlimited PL2', l3Cache: '36 MB Cache', microcode: '0x125' },
    motherboard: { vendorModel: 'ASUS ROG MAXIMUS Z790 HERO', chipset: 'Intel Z790', biosVersion: 'v2102', agesaOrEC: 'ME FW 16.1.30', vrmPhases: '20+1 Phase 90A' },
    ram: { typeSize: '32 GB DDR5 7600 MT/s', speedTimings: 'CL36-46-46', channels: 'Dual-Channel', profile: 'XMP 3.0', brand: 'G.Skill' },
    disk: { model: 'Samsung 990 PRO 2TB', health: '100%', speedReadWrite: '7450 MB/s / 6900 MB/s', tbw: '10 TB', temp: '36°C', interface: 'PCIe 4.0 x4' },
    display: { panelModel: '4K Gaming Monitor', resolution: '3840 x 2160', refreshRate: '144 Hz', panelType: 'IPS', edpLanes: 'DP 1.4', gamutBrightness: '98% DCI-P3', pwmDimming: 'DC' },
    powerBattery: { adapter: 'ASUS ROG Thor 1200W Platinum II', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 52, gpuTemp: 44, hotspotTemp: 56, vramTemp: 50, ramTemp: 36, ssdTemp: 36, vrmTemp: 42, waterTemp: 29, cpuFanRpm: 1100, gpuFanRpm: 1100, pumpRpm: 3200, powerWatts: 550 }
  },

  // ==========================================
  // SECTION 4: FAULT & HARDWARE FAILURE SIMULATORS (56-70)
  // ==========================================
  {
    id: 'sim-fault-01',
    name: '🚨 [56/70] AWARIA: Uszkodzenie Pamięci VRAM GDDR6X (Błędy MATS / Artefakty)',
    type: 'fault_simulator',
    categoryTitle: 'Symulator Awarii - VRAM GDDR6X Fault',
    gpu: { brand: 'Nvidia', model: 'Nvidia RTX 3080 10GB (Uszkodzona Kość VRAM Channel B1)', vram: '10 GB GDDR6X (Wykryto Błędy Odczytu Bitów)', busWidth: '320-bit', vBios: '94.02.42.00.01', driver: 'Nvidia Driver (Awaria Kodu 43)', samEnabled: false, tgp: '320 W', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'AMD', model: 'AMD Ryzen 7 5800X', coresThreads: '8 Rdzeni / 16 Wątków', socket: 'AM4', frequency: '3.8 GHz / 4.7 GHz', tdp: '105 W', l3Cache: '32 MB', microcode: '0xa001072' },
    motherboard: { vendorModel: 'MSI MAG B550 TOMAHAWK', chipset: 'AMD B550', biosVersion: 'v180', agesaOrEC: 'AGESA 1.2.0.7', vrmPhases: '10+2+1 60A' },
    ram: { typeSize: '32 GB DDR4 3600 MT/s', speedTimings: 'CL16-18-18', channels: 'Dual-Channel', profile: 'XMP 2.0', brand: 'Kingston' },
    disk: { model: 'Crucial P5 Plus 1TB', health: '100%', speedReadWrite: '6600 MB/s / 5000 MB/s', tbw: '20 TB', temp: '42°C', interface: 'PCIe 4.0 x4' },
    display: { panelModel: 'FHD Monitor z Artefaktami', resolution: '1920 x 1080', refreshRate: '144 Hz', panelType: 'IPS', edpLanes: 'DP 1.2', gamutBrightness: '100% sRGB', pwmDimming: 'DC' },
    powerBattery: { adapter: 'SilentiumPC Supremo FM2 750W Gold', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 64, gpuTemp: 78, hotspotTemp: 98, vramTemp: 108, ramTemp: 40, ssdTemp: 42, vrmTemp: 58, waterTemp: 0, cpuFanRpm: 1500, gpuFanRpm: 2800, pumpRpm: 0, powerWatts: 280 }
  },
  {
    id: 'sim-fault-02',
    name: '🚨 [57/70] AWARIA: Przegrzewanie VRM MOSFET (Thermal Runaway 115°C)',
    type: 'fault_simulator',
    categoryTitle: 'Symulator Awarii - VRM MOSFET Overheating',
    gpu: { brand: 'Nvidia', model: 'Nvidia RTX 3090 24GB z Brakującym Thermalpadem na VRM', vram: '24 GB GDDR6X', busWidth: '384-bit', vBios: '94.02.26.00.01', driver: 'Nvidia Driver 555.99', samEnabled: true, tgp: '350 W', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'Intel', model: 'Intel Core i9-12900K', coresThreads: '16 Rdzeni / 24 Wątki', socket: 'LGA1700', frequency: '3.2 GHz / 5.2 GHz', tdp: '125 W (PL2 241 W)', l3Cache: '30 MB', microcode: '0x18' },
    motherboard: { vendorModel: 'ASUS Prime Z690-P', chipset: 'Intel Z690', biosVersion: 'v1003', agesaOrEC: 'ME FW 16.0', vrmPhases: '14+1 DrMOS 50A' },
    ram: { typeSize: '32 GB DDR5 5200 MT/s', speedTimings: 'CL40', channels: 'Dual-Channel', profile: 'XMP 3.0', brand: 'Crucial' },
    disk: { model: 'WD Blue SN570 1TB', health: '98%', speedReadWrite: '3500 MB/s / 3000 MB/s', tbw: '15 TB', temp: '45°C', interface: 'PCIe 3.0 x4' },
    display: { panelModel: 'QHD Monitor', resolution: '2560 x 1440', refreshRate: '165 Hz', panelType: 'IPS', edpLanes: 'DP 1.4', gamutBrightness: '95% sRGB', pwmDimming: 'DC' },
    powerBattery: { adapter: 'be quiet! Straight Power 11 850W Platinum', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 78, gpuTemp: 82, hotspotTemp: 104, vramTemp: 112, ramTemp: 44, ssdTemp: 45, vrmTemp: 118, waterTemp: 0, cpuFanRpm: 1800, gpuFanRpm: 3100, pumpRpm: 0, powerWatts: 420 }
  },
  {
    id: 'sim-fault-03',
    name: '🚨 [58/70] AWARIA: Awaria Pompy AIO (0 RPM Flow Rate / Thermal Spike 100°C)',
    type: 'fault_simulator',
    categoryTitle: 'Symulator Awarii - AIO Pump Failure',
    gpu: { brand: 'Nvidia', model: 'Nvidia RTX 4080 Super 16GB', vram: '16 GB GDDR6X', busWidth: '256-bit', vBios: '95.03.44.00.01', driver: 'Nvidia Driver 555.99', samEnabled: true, tgp: '320 W', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'Intel', model: 'Intel Core i9-13900K (Przegrzanie 100°C z Powodu Awarii AIO)', coresThreads: '24 Rdzenie / 32 Wątki', socket: 'LGA1700', frequency: 'Thrrottled to 1.1 GHz', tdp: '125 W', l3Cache: '36 MB', microcode: '0x125' },
    motherboard: { vendorModel: 'Gigabyte Z790 AORUS MASTER', chipset: 'Intel Z790', biosVersion: 'F10', agesaOrEC: 'ME FW 16.1', vrmPhases: '20+1+2 105A' },
    ram: { typeSize: '64 GB DDR5 6000 MT/s', speedTimings: 'CL30', channels: 'Dual-Channel', profile: 'XMP 3.0', brand: 'Corsair' },
    disk: { model: 'Samsung 980 PRO 2TB', health: '100%', speedReadWrite: '7000 MB/s / 5100 MB/s', tbw: '22 TB', temp: '48°C', interface: 'PCIe 4.0 x4' },
    display: { panelModel: '4K Gaming Display', resolution: '3840 x 2160', refreshRate: '144 Hz', panelType: 'IPS', edpLanes: 'HDMI 2.1', gamutBrightness: '98% DCI-P3', pwmDimming: 'DC' },
    powerBattery: { adapter: 'Corsair RM1000x 1000W', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 100, gpuTemp: 58, hotspotTemp: 68, vramTemp: 62, ramTemp: 41, ssdTemp: 48, vrmTemp: 74, waterTemp: 65, cpuFanRpm: 2400, gpuFanRpm: 1200, pumpRpm: 0, powerWatts: 210 }
  },
  {
    id: 'sim-fault-04',
    name: '🚨 [59/70] AWARIA: Spadek Napięcia 12VHPWR Wtyku GPU (Stopiona Wtyczka 11.1V)',
    type: 'fault_simulator',
    categoryTitle: 'Symulator Awarii - 12VHPWR Connector Melting',
    gpu: { brand: 'Nvidia', model: 'Nvidia RTX 4090 24GB ze Przegrzanym Wtykiem 12VHPWR 16-Pin', vram: '24 GB GDDR6X', busWidth: '384-bit', vBios: '95.02.20.00.01', driver: 'Nvidia Driver 555.99', samEnabled: true, tgp: '450 W (Spadek Napięcia Linii do 11.1V)', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'AMD', model: 'AMD Ryzen 7 7800X3D', coresThreads: '8 Rdzeni / 16 Wątków', socket: 'AM5', frequency: '4.2 GHz / 5.0 GHz', tdp: '120 W', l3Cache: '96 MB', microcode: '0xa601206' },
    motherboard: { vendorModel: 'ASRock X670E Taichi', chipset: 'AMD X670E', biosVersion: 'v2.10', agesaOrEC: 'AGESA 1.1.0.2b', vrmPhases: '24+2+1 105A' },
    ram: { typeSize: '32 GB DDR5 6000 MT/s', speedTimings: 'CL30', channels: 'Dual-Channel', profile: 'EXPO I', brand: 'G.Skill' },
    disk: { model: 'Kingston KC3000 1TB', health: '100%', speedReadWrite: '7000 MB/s / 6000 MB/s', tbw: '8 TB', temp: '40°C', interface: 'PCIe 4.0 x4' },
    display: { panelModel: 'QHD Monitor', resolution: '2560 x 1440', refreshRate: '240 Hz', panelType: 'OLED', edpLanes: 'DP 1.4', gamutBrightness: '99% DCI-P3', pwmDimming: 'DC' },
    powerBattery: { adapter: 'Thermaltake Toughpower GF3 1200W Gold ATX3.0', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 68, gpuTemp: 86, hotspotTemp: 108, vramTemp: 94, ramTemp: 42, ssdTemp: 40, vrmTemp: 65, waterTemp: 0, cpuFanRpm: 1500, gpuFanRpm: 3200, pumpRpm: 0, powerWatts: 480 }
  },
  {
    id: 'sim-fault-05',
    name: '🚨 [60/70] AWARIA: Przegrzewanie Kontrolera Dysku M.2 NVMe PCIe Gen5 (89°C Throttle)',
    type: 'fault_simulator',
    categoryTitle: 'Symulator Awarii - NVMe Gen5 SSD Throttling',
    gpu: { brand: 'AMD', model: 'AMD Radeon RX 7800 XT 16GB', vram: '16 GB GDDR6', busWidth: '256-bit', vBios: '022.001.001.000', driver: 'Adrenalin 24.7.1', samEnabled: true, tgp: '263 W', pcieGen: 'PCIe 4.0 x16' },
    cpu: { brand: 'AMD', model: 'AMD Ryzen 5 7600X', coresThreads: '6 Rdzeni / 12 Wątków', socket: 'AM5', frequency: '4.7 GHz / 5.3 GHz', tdp: '105 W', l3Cache: '32 MB', microcode: '0xa601206' },
    motherboard: { vendorModel: 'MSI PRO B650-P WIFI', chipset: 'AMD B650', biosVersion: 'v190', agesaOrEC: 'AGESA 1.1.0.0', vrmPhases: '12+2+1 75A' },
    ram: { typeSize: '32 GB DDR5 5600 MT/s', speedTimings: 'CL36', channels: 'Dual-Channel', profile: 'EXPO I', brand: 'Kingston' },
    disk: { model: 'Crucial T700 1TB NVMe Gen5 (Bez Radiatora - Overheating Controller)', health: '97%', speedReadWrite: 'Throttled to 1200 MB/s (Hot)', tbw: '18 TB', temp: '89°C (CRITICAL HOT)', interface: 'PCIe 5.0 x4 M.2' },
    display: { panelModel: 'FHD Monitor', resolution: '1920 x 1080', refreshRate: '165 Hz', panelType: 'IPS', edpLanes: 'HDMI 2.0', gamutBrightness: '100% sRGB', pwmDimming: 'DC' },
    powerBattery: { adapter: 'be quiet! Pure Power 12 M 750W Gold', batteryCapacity: 'N/A', wearLevel: '0%', cycleCount: 'N/A' },
    telemetryDefaults: { cpuTemp: 72, gpuTemp: 66, hotspotTemp: 82, vramTemp: 74, ramTemp: 45, ssdTemp: 89, vrmTemp: 58, waterTemp: 0, cpuFanRpm: 1600, gpuFanRpm: 1700, pumpRpm: 0, powerWatts: 340 }
  }
];

// Helper to expand up to 200 total simulators programmatically
for (let i = 61; i <= 200; i++) {
  AUTOMATED_70_SIMULATORS.push({
    id: `sim-auto-${i}`,
    name: `⚡ [${i}/200] Symulator Diagnostyczny Podzespołów Specjalnych nr ${i}`,
    type: i % 3 === 0 ? 'desktop' : i % 3 === 1 ? 'laptop' : 'fault_simulator',
    categoryTitle: i % 3 === 0 ? 'Stacjonarne Workstation (200 Setów)' : i % 3 === 1 ? 'Laptopy Serwisowe (200 Setów)' : 'Symulatory Awarii BGA / VRAM (200 Setów)',
    gpu: {
      brand: i % 3 === 0 ? 'Nvidia' : i % 3 === 1 ? 'AMD' : 'Intel',
      model: `Karta Graficzna Diagnostic Rig #${i} (${i % 2 === 0 ? 'RTX 4080 / RTX 5080' : 'RX 7900 XTX / ARC A770'})`,
      vram: `${i % 2 === 0 ? 16 : 24} GB GDDR6X / GDDR7`,
      busWidth: '256-bit / 384-bit',
      vBios: `95.${i % 10}.20.00.01`,
      driver: 'WHQL Pro Diagnostic Driver v570',
      samEnabled: true,
      tgp: `${220 + (i % 150)} W`,
      pcieGen: 'PCIe 4.0 / PCIe 5.0 x16'
    },
    cpu: {
      brand: i % 2 === 0 ? 'Intel' : 'AMD',
      model: `Procesor Diagnostic CPU #${i} (${i % 2 === 0 ? 'Core i9-14900HX / Core Ultra 9' : 'Ryzen 9 7940HS / Ryzen 9 9950X'})`,
      coresThreads: `${16 + (i % 8)} Rdzeni / ${24 + (i % 8) * 2} Wątków`,
      socket: i % 2 === 0 ? 'BGA / LGA1700' : 'Socket AM5',
      frequency: '4.0 GHz Base / 5.5 GHz Boost',
      tdp: `${115 + (i % 65)} W`,
      l3Cache: '64 MB L3 Cache',
      microcode: '0xb001'
    },
    motherboard: {
      vendorModel: `Płyta Główna Serwisowa Rig #${i} (Pogotowie Rafał Jarosz)`,
      chipset: i % 2 === 0 ? 'Intel Z790 / HM770' : 'AMD X670E / PRO560',
      biosVersion: `v${(i % 5) + 2}.10`,
      agesaOrEC: 'UEFI x64 / AMI Aptio V',
      vrmPhases: '16+2+1 DrMOS 90A'
    },
    ram: {
      typeSize: `${32 + (i % 2) * 32} GB DDR5`,
      speedTimings: '6000 MT/s CL30 / 7200 CL34',
      channels: 'Dual-Channel 128-bit',
      profile: 'XMP 3.0 / EXPO Active',
      brand: 'Corsair / G.Skill / Kingston Fury'
    },
    disk: {
      model: `Dysk NVMe PCIe Gen4/Gen5 SSD #${i}`,
      health: '100% Stan Doskonały',
      speedReadWrite: '7400 MB/s / 6500 MB/s',
      tbw: '600 TBW',
      temp: `${38 + (i % 15)}°C`,
      interface: 'NVMe M.2 PCIe 4.0 x4'
    },
    display: {
      panelModel: `Matryca / Monitor Testowy #${i}`,
      resolution: i % 4 === 0 ? '3840 x 2160 4K UHD' : '2560 x 1440 QHD',
      refreshRate: `${144 + (i % 3) * 60} Hz`,
      panelType: 'IPS / Mini-LED / OLED',
      edpLanes: 'DisplayPort 1.4 / eDP 1.4b',
      gamutBrightness: '100% DCI-P3 / 500 nits',
      pwmDimming: 'DC Dimming (Brak migotania)'
    },
    powerBattery: {
      adapter: 'Zasilacz Serwisowy 240W / ATX 1000W',
      batteryCapacity: i % 2 === 0 ? 'N/A (Desktop)' : '99.9 Wh Li-Ion',
      wearLevel: `${i % 12}%`,
      cycleCount: `${120 + (i * 3)}`
    },
    telemetryDefaults: {
      cpuTemp: 58 + (i % 22),
      gpuTemp: 55 + (i % 20),
      hotspotTemp: 68 + (i % 25),
      vramTemp: 60 + (i % 20),
      ramTemp: 38 + (i % 10),
      ssdTemp: 40 + (i % 15),
      vrmTemp: 48 + (i % 18),
      waterTemp: i % 4 === 0 ? 32 + (i % 8) : 0,
      cpuFanRpm: 1400 + (i * 5),
      gpuFanRpm: 1500 + (i * 5),
      pumpRpm: i % 4 === 0 ? 2500 : 0,
      powerWatts: 250 + (i * 3)
    }
  });
}

export const AUTOMATED_200_SIMULATORS = AUTOMATED_70_SIMULATORS;

