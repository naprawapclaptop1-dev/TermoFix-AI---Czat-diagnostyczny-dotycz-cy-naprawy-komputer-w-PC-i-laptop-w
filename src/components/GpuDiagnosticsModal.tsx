import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Cpu,
  Flame,
  ShieldAlert,
  Activity,
  Play,
  Square,
  Wrench,
  Layers,
  Gauge,
  Thermometer,
  Zap,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Monitor,
  HardDrive,
  CircuitBoard,
  BatteryCharging,
  Sliders,
  Laptop,
  Check,
  Search,
  Filter,
  Tv
} from 'lucide-react';
import { AUTOMATED_200_SIMULATORS } from '../data/simulators';
import { FURMARK_SIMULATORS, FurmarkSimulatorPreset } from '../data/furmarkSimulators';
import { DiagnosticVideoTutorialsTab } from './DiagnosticVideoTutorialsTab';
import { LiveSpecsAuditTab } from './LiveSpecsAuditTab';

interface GpuDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string) => void;
}

interface HardwareProfile {
  id: string;
  name: string;
  type: 'desktop' | 'laptop';
  gpu: {
    brand: 'Nvidia' | 'AMD' | 'Intel';
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
    brand: 'AMD' | 'Intel';
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
}

const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: 'amd-desktop-rx7900xtx',
    name: '🖥️ PC Stacjonarny: AMD Ryzen 7 7800X3D + AMD Radeon RX 7900 XTX 24GB',
    type: 'desktop',
    gpu: {
      brand: 'AMD',
      model: 'AMD Radeon RX 7900 XTX (Navi 31 XTX / RDNA 3)',
      vram: '24 GB GDDR6 (20 Gbps / 960 GB/s)',
      busWidth: '384-bit',
      vBios: '022.001.002.000 (AMD Reference)',
      driver: 'AMD Software: Adrenalin Edition 24.7.1',
      samEnabled: true,
      tgp: '355 W (TBP Board Power)',
      pcieGen: 'PCIe 4.0 x16 (Resizable BAR Active)'
    },
    cpu: {
      brand: 'AMD',
      model: 'AMD Ryzen 7 7800X3D (Zen 4 z 3D V-Cache)',
      coresThreads: '8 Rdzeni / 16 Wątków',
      socket: 'Socket AM5 (LGA1718)',
      frequency: '4.2 GHz Base / 5.0 GHz Boost',
      tdp: '120 W (PPT 162 W)',
      l3Cache: '96 MB 3D V-Cache (L2+L3 = 104 MB)',
      microcode: '0xa601206'
    },
    motherboard: {
      vendorModel: 'ASUS ROG STRIX X670E-F GAMING WIFI',
      chipset: 'AMD X670E (Promontory 21 Dual)',
      biosVersion: 'v2202 (UEFI x64, 2026-05-10)',
      agesaOrEC: 'AGESA ComboAM5PI 1.1.0.2b',
      vrmPhases: '16+2+2 SPS 90A DrMOS (Digi+ EPU)'
    },
    ram: {
      typeSize: '32 GB (2x 16GB) DDR5 SDRAM',
      speedTimings: '6000 MT/s (CL30-38-38-96 1.35V)',
      channels: 'Dual-Channel 128-bit',
      profile: 'AMD EXPO I Włączony',
      brand: 'SK Hynix A-Die (G.Skill Trident Z5 Neo)'
    },
    disk: {
      model: 'Crucial T700 2TB NVMe PCIe Gen5 x4 M.2 SSD',
      health: '100% Stan Doskonały',
      speedReadWrite: '12 400 MB/s Odczyt / 11 800 MB/s Zapis',
      tbw: '18.4 TB Zapisano / 1200 TBW Limit',
      temp: '44°C (Z Radiatorem Płyty)',
      interface: 'NVMe 2.0 PCIe 5.0 x4'
    },
    display: {
      panelModel: 'ASUS ROG Swift PG27AQDM OLED Monitor',
      resolution: '2560 x 1440 QHD (16:9)',
      refreshRate: '240 Hz (FreeSync Premium Pro & G-Sync Compatible)',
      panelType: 'OLED (Micro Lens Array / Anti-Glare)',
      edpLanes: 'DisplayPort 1.4a / HDMI 2.1 (DSC Active)',
      gamutBrightness: '99% DCI-P3 / 1000 nits Peak HDR',
      pwmDimming: 'DC Dimming (Brak migotania PWM)'
    },
    powerBattery: {
      adapter: 'Zasilacz ATX3.0: Seasonic Vertex GX-1000W 80 Gold',
      batteryCapacity: 'Brak (Zasilanie Stacjonarne 230V AC)',
      wearLevel: '0%',
      cycleCount: 'N/A'
    }
  },
  {
    id: 'nvidia-desktop-rtx4090',
    name: '🖥️ PC Stacjonarny: Intel Core i9-14900K + Nvidia GeForce RTX 4090 24GB',
    type: 'desktop',
    gpu: {
      brand: 'Nvidia',
      model: 'Nvidia GeForce RTX 4090 (AD102 / Ada Lovelace)',
      vram: '24 GB GDDR6X (Micron 21 Gbps / 1008 GB/s)',
      busWidth: '384-bit',
      vBios: '95.02.20.00.01 (ASUS ROG Strix OC)',
      driver: 'Nvidia Game Ready Driver 555.99',
      samEnabled: true,
      tgp: '450 W (PL1 450W / PL2 600W 12VHPWR)',
      pcieGen: 'PCIe 4.0 x16 (Resizable BAR Active)'
    },
    cpu: {
      brand: 'Intel',
      model: 'Intel Core i9-14900K (Raptor Lake Refresh)',
      coresThreads: '24 Rdzenie (8P + 16E) / 32 Wątki',
      socket: 'LGA1700',
      frequency: '3.2 GHz Base / 6.0 GHz TVB Boost',
      tdp: '125 W PL1 / 253 W PL2 Maximum Turbo',
      l3Cache: '36 MB Intel Smart Cache + 32 MB L2',
      microcode: '0x125'
    },
    motherboard: {
      vendorModel: 'MSI MEG Z790 ACE MAX',
      chipset: 'Intel Z790 Chipset',
      biosVersion: 'E7D86IMS.180 (UEFI x64)',
      agesaOrEC: 'Intel ME Firmware 16.1.30.2264',
      vrmPhases: '24+1+2 Smart Power Stage 105A'
    },
    ram: {
      typeSize: '64 GB (2x 32GB) DDR5 SDRAM',
      speedTimings: '7200 MT/s (CL34-45-45-115 1.40V)',
      channels: 'Dual-Channel 128-bit',
      profile: 'Intel XMP 3.0 Włączony',
      brand: 'SK Hynix A-Die (Corsair Dominator Titanium)'
    },
    disk: {
      model: 'Samsung 990 PRO 2TB NVMe M.2 SSD z Radiatorem',
      health: '98% Stan Bardzo Dobry',
      speedReadWrite: '7450 MB/s Odczyt / 6900 MB/s Zapis',
      tbw: '42.1 TB Zapisano / 1200 TBW Limit',
      temp: '41°C',
      interface: 'NVMe 2.0 PCIe 4.0 x4'
    },
    display: {
      panelModel: 'Dell Alienware AW3225QF QD-OLED',
      resolution: '3840 x 2160 4K UHD (16:9)',
      refreshRate: '240 Hz z Nvidia G-Sync Ultimate',
      panelType: 'Quantum Dot OLED (Curved 1700R)',
      edpLanes: 'DisplayPort 1.4a DSC / HDMI 2.1 48Gbps',
      gamutBrightness: '99% DCI-P3 / 1000 nits HDR Peak',
      pwmDimming: 'DC Dimming (Flicker-Free)'
    },
    powerBattery: {
      adapter: 'Zasilacz ATX3.0: Corsair RM1200x SHIFT 1200W',
      batteryCapacity: 'Brak (Zasilanie Stacjonarne 230V AC)',
      wearLevel: '0%',
      cycleCount: 'N/A'
    }
  },
  {
    id: 'laptop-lenovo-legion',
    name: '💻 Laptop Gamingowy: Lenovo Legion Pro 7 (i9-13900HX + RTX 4080 Mobile + Matryca 240Hz)',
    type: 'laptop',
    gpu: {
      brand: 'Nvidia',
      model: 'Nvidia GeForce RTX 4080 Laptop GPU (AD104 Mobile)',
      vram: '12 GB GDDR6 (Samsung 18 Gbps)',
      busWidth: '192-bit',
      vBios: '95.04.38.00.62 (Lenovo Dynamic Boost 175W)',
      driver: 'Nvidia Studio Driver 555.85',
      samEnabled: true,
      tgp: '175 W z Advanced Optimus / MUX Switch',
      pcieGen: 'PCIe 4.0 x8 (Resizable BAR Active)'
    },
    cpu: {
      brand: 'Intel',
      model: 'Intel Core i9-13900HX (Raptor Lake-HX Mobile)',
      coresThreads: '24 Rdzenie (8P + 16E) / 32 Wątki',
      socket: 'BGA1900 (Logic Board Soldered)',
      frequency: '2.2 GHz Base / 5.4 GHz Turbo',
      tdp: '55 W Base / 157 W Short Power Limit',
      l3Cache: '36 MB Smart Cache',
      microcode: '0x11d'
    },
    motherboard: {
      vendorModel: 'Lenovo Legion Pro 7 16IRX8H Motherboard',
      chipset: 'Intel HM770 Express Chipset',
      biosVersion: 'KWCN44WW (Lenovo UEFI BIOS 2026)',
      agesaOrEC: 'Embedded Controller: ITE IT8227E-128',
      vrmPhases: '12+2+1 DrMOS z Ciekłym Metalem (Liquid Metal)'
    },
    ram: {
      typeSize: '32 GB (2x 16GB) SO-DIMM DDR5',
      speedTimings: '5600 MT/s (CL40-40-40-80)',
      channels: 'Dual-Channel 128-bit SO-DIMM',
      profile: 'Jedec Standard 5600',
      brand: 'Micron / Crucial DDR5 SO-DIMM'
    },
    disk: {
      model: 'SK Hynix PC801 1TB NVMe PCIe Gen4 x4 M.2 2280',
      health: '96% Stan Dobry',
      speedReadWrite: '7000 MB/s Odczyt / 6500 MB/s Zapis',
      tbw: '68.2 TB Zapisano',
      temp: '48°C',
      interface: 'NVMe 1.4 PCIe 4.0 x4'
    },
    display: {
      panelModel: 'BOE NV160WUM-NX1 / Lenovo Part No: 5D10W69938',
      resolution: '2560 x 1600 WQXGA (16:10 Ratio)',
      refreshRate: '240 Hz z G-Sync / Advanced Optimus',
      panelType: 'IPS Anti-Glare (Matowa Matryca)',
      edpLanes: 'eDP 1.4b (4-Lane HBR3 32.4 Gbps)',
      gamutBrightness: '100% sRGB / 500 nits HDR400 DisplayHDR',
      pwmDimming: 'Hardware DC Dimming (Flicker-Free)'
    },
    powerBattery: {
      adapter: 'Oryginalny Zasilacz Lenovo 330W GaN Slim Charger (20V / 16.5A)',
      batteryCapacity: '4-Cell Li-Polymer 99.9 Wh (Pojemność Fabryczna: 99900 mWh)',
      wearLevel: '4.2% Zużycia (Aktualna Pojemność: 95700 mWh)',
      cycleCount: '52 Cykli Ładowania'
    }
  },
  {
    id: 'laptop-amd-advantage',
    name: '💻 Laptop AMD Advantage: ASUS ROG Zephyrus G14 (Ryzen 9 7940HS + Radeon RX 7700S + OLED)',
    type: 'laptop',
    gpu: {
      brand: 'AMD',
      model: 'AMD Radeon RX 7700S Mobile (Navi 33 / RDNA 3)',
      vram: '8 GB GDDR6 (18 Gbps / 128-bit)',
      busWidth: '128-bit',
      vBios: '022.001.000.038 (ASUS VBIOS)',
      driver: 'AMD Software: Adrenalin Edition 24.6.1',
      samEnabled: true,
      tgp: '120 W z AMD SmartShift Max',
      pcieGen: 'PCIe 4.0 x8 (Smart Access Memory Active)'
    },
    cpu: {
      brand: 'AMD',
      model: 'AMD Ryzen 9 7940HS (Zen 4 Phoenix APU z Ryzen AI NPU)',
      coresThreads: '8 Rdzeni / 16 Wątków z NPU AI Engine',
      socket: 'FP8 BGA (Soldered Onboard)',
      frequency: '4.0 GHz Base / 5.2 GHz Boost',
      tdp: '35 W Base / 65 W SmartShift Max',
      l3Cache: '16 MB L3 Cache + 8 MB L2',
      microcode: '0xa704103'
    },
    motherboard: {
      vendorModel: 'ASUS ROG Zephyrus G14 GA402XY Board',
      chipset: 'AMD Integrated SoC / Promontory Controller',
      biosVersion: 'GA402XY.318 (ASUS UEFI BIOS 2026)',
      agesaOrEC: 'Embedded Controller: Nuvoton EC NCT6798D',
      vrmPhases: '8+2 Phase z Komorą Parową (Vapor Chamber)'
    },
    ram: {
      typeSize: '32 GB LPDDR5X-6400 Onboard',
      speedTimings: '6400 MT/s Quad-Channel 16-bit x 4',
      channels: 'Quad-Channel 64-bit Bus',
      profile: 'LPDDR5X Low Power High Speed',
      brand: 'Micron LPDDR5X Soldered'
    },
    disk: {
      model: 'Western Digital Black SN850X 1TB NVMe M.2 SSD',
      health: '99% Stan Doskonały',
      speedReadWrite: '7300 MB/s Odczyt / 6300 MB/s Zapis',
      tbw: '21.0 TB Zapisano',
      temp: '43°C',
      interface: 'NVMe 2.0 PCIe 4.0 x4'
    },
    display: {
      panelModel: 'Samsung OLED ATNA40CU01-0 Panel',
      resolution: '2880 x 1800 2.8K (16:10 Ratio)',
      refreshRate: '120 Hz OLED Response Time 0.2ms',
      panelType: 'OLED (Glossy z Powłoką Anti-Reflective)',
      edpLanes: 'eDP 1.4a (4-Lane HBR3)',
      gamutBrightness: '100% DCI-P3 / 500 nits VESA DisplayHDR True Black 500',
      pwmDimming: 'PWM Frequency 480Hz z Ochroną Wzroku Low Blue Light'
    },
    powerBattery: {
      adapter: 'Zasilacz ROG 240W Compact Adapter + 100W USB-C PD 3.0',
      batteryCapacity: '76 Wh Li-Ion 4-Cell (Pojemność Fabryczna: 76000 mWh)',
      wearLevel: '2.8% Zużycia (Aktualna Pojemność: 73872 mWh)',
      cycleCount: '29 Cykli Ładowania'
    }
  }
];

const GPU_FAULTS = [
  {
    id: 'fault-code-43',
    title: 'Błąd Menedżera Urządzeń: Nvidia / AMD Kod 43 (Code 43)',
    symptoms: 'Karta graficzna wyświetla żółty wykrzyknik w Windows. Sterownik nie podnosi karty.',
    cause: 'Uszkodzona pamięć VRAM (zimny lut / uszkodzona kostka GDDR6), zimne luty pod rdzeniem GPU lub uszkodzenie BIOS karty (VBIOS).',
    solution: 'Uruchom test pamięci VRAM (Nvidia MATS/MODS lub AMD ttest). Przetestuj obwody zasilania VCORE i NVVDD.'
  },
  {
    id: 'fault-artifacts',
    title: 'Artefakty Obrazu (Szachownica, Dziwne Kolory, Paski na Ekranie)',
    symptoms: 'Pojawianie się kolorowych kwadratów na pulpicie, zawieszanie się pod obciążeniem DirectX/Vulkan.',
    cause: 'Uszkodzony jeden z kanałów pamięci VRAM (np. Channel A0/A1) lub pęknięcie kulek BGA pod rdzeniem GPU.',
    solution: 'Wykonaj test MATS/ttest, aby zidentyfikować konkretny chip VRAM. Wymień uszkodzoną kostkę lub wykonaj reballing.'
  },
  {
    id: 'fault-vrm-temp',
    title: 'Przegrzewanie Sekcji VRM & HotSpot GPU (>105°C)',
    symptoms: 'Wiatraki zaczynają kręcić na 100% (RPM Max), po czym ekran gaśnie (Black Screen z dźwiękiem w tle).',
    cause: 'Wyschnięta pasta termoprzewodząca (efekt Pump-Out) lub nieprawidłowa grubość termopadów (np. 1.5mm zamiast 1.0mm unosi chłodzenie).',
    solution: 'Wymień pastę na PTM7950 (Phase Change Material) i zastosuj termopady o precyzyjnej grubości fabrycznej.'
  }
];

export const GpuDiagnosticsModal: React.FC<GpuDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'furmark' | 'mods_vram' | 'vram_coils_map' | 'hardware' | 'faults' | 'videos'>('furmark');

  // MODS 60GB VRAM Parser State
  const [selectedModsPreset, setSelectedModsPreset] = useState<'rtx3080_bank_b1' | 'rtx4090_clean' | 'rtx2080ti_dual_fail'>('rtx3080_bank_b1');
  const [customModsLogContent, setCustomModsLogContent] = useState<string>('');
  const [activeSelectedBank, setActiveSelectedBank] = useState<string>('B1');

  const MODS_PRESET_DUMPS = useMemo(() => {
    return {
      rtx3080_bank_b1: {
        gpuModel: 'NVIDIA GeForce RTX 3080 10GB GDDR6X',
        modsVersion: 'MODS v455.122 (60GB VRAM Full Stress Dump)',
        timestamp: '2026-08-05 01:45:10',
        totalScannedGb: 10,
        overallResult: 'FAIL' as const,
        failedBanksCount: 1,
        banks: [
          { name: 'A0', location: 'U1', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000000000000 - 0x000000003FFFFFFF' },
          { name: 'A1', location: 'U2', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000040000000 - 0x000000007FFFFFFF' },
          { name: 'B0', location: 'U7', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000080000000 - 0x00000000BFFFFFFF' },
          { name: 'B1', location: 'U8 (Micron GDDR6X)', status: 'FAIL', badBits: 248, badSectors: 14, address: '0x000000007E01A4F0 - 0x000000007E01B8C0', errorDetails: 'Channel B1 Read Parity Error. Flipped bits 0x00000040 (Bit 6).' },
          { name: 'C0', location: 'U11', status: 'PASS', badBits: 0, badSectors: 0, address: '0x00000000C0000000 - 0x00000000FFFFFFFF' },
          { name: 'C1', location: 'U12', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000100000000 - 0x000000013FFFFFFF' },
          { name: 'D0', location: 'U15', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000140000000 - 0x000000017FFFFFFF' },
          { name: 'D1', location: 'U16', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000180000000 - 0x00000001BFFFFFFF' }
        ]
      },
      rtx4090_clean: {
        gpuModel: 'NVIDIA GeForce RTX 4090 24GB GDDR6X',
        modsVersion: 'MODS v520.88 (60GB VRAM Full Stress Dump)',
        timestamp: '2026-08-05 01:50:22',
        totalScannedGb: 24,
        overallResult: 'PASS' as const,
        failedBanksCount: 0,
        banks: [
          { name: 'A0', location: 'U1', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000000000000 - 0x00000000BFFFFFFF' },
          { name: 'A1', location: 'U2', status: 'PASS', badBits: 0, badSectors: 0, address: '0x00000000C0000000 - 0x000000017FFFFFFF' },
          { name: 'B0', location: 'U3', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000180000000 - 0x000000023FFFFFFF' },
          { name: 'B1', location: 'U4', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000240000000 - 0x00000002FFFFFFFF' },
          { name: 'C0', location: 'U5', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000300000000 - 0x00000003BFFFFFFF' },
          { name: 'C1', location: 'U6', status: 'PASS', badBits: 0, badSectors: 0, address: '0x00000003C0000000 - 0x000000047FFFFFFF' },
          { name: 'D0', location: 'U7', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000480000000 - 0x000000053FFFFFFF' },
          { name: 'D1', location: 'U8', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000540000000 - 0x00000005FFFFFFFF' }
        ]
      },
      rtx2080ti_dual_fail: {
        gpuModel: 'NVIDIA GeForce RTX 2080 Ti 11GB GDDR6',
        modsVersion: 'MODS v400.22 (60GB VRAM Full Stress Dump)',
        timestamp: '2026-08-05 01:30:15',
        totalScannedGb: 11,
        overallResult: 'FAIL' as const,
        failedBanksCount: 2,
        banks: [
          { name: 'A0', location: 'U1', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000000000000 - 0x000000003FFFFFFF' },
          { name: 'A1', location: 'U2 (Samsung GDDR6)', status: 'FAIL', badBits: 112, badSectors: 8, address: '0x000000003A4100C0 - 0x000000003A410900', errorDetails: 'Channel A1 Read Error at 0x3A4100C0. Single Bit Flip 0x00000010.' },
          { name: 'B0', location: 'U3', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000040000000 - 0x000000007FFFFFFF' },
          { name: 'B1', location: 'U4', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000080000000 - 0x00000000BFFFFFFF' },
          { name: 'C0', location: 'U6 (Samsung GDDR6)', status: 'FAIL', badBits: 512, badSectors: 32, address: '0x00000000B2104080 - 0x00000000B2109000', errorDetails: 'Channel C0 Write Pattern Error. Multiple bit flips across byte lane 2.' },
          { name: 'C1', location: 'U7', status: 'PASS', badBits: 0, badSectors: 0, address: '0x00000000C0000000 - 0x00000000FFFFFFFF' },
          { name: 'D0', location: 'U8', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000100000000 - 0x000000013FFFFFFF' },
          { name: 'D1', location: 'U9', status: 'PASS', badBits: 0, badSectors: 0, address: '0x0000000140000000 - 0x000000017FFFFFFF' }
        ]
      }
    };
  }, []);

  const activeModsReport = MODS_PRESET_DUMPS[selectedModsPreset];
  const [selectedProfileId, setSelectedProfileId] = useState<string>('amd-desktop-rx7900xtx');
  const [isScanningHardware, setIsScanningHardware] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);

  // RESOLUTION & RENDERING MODES (2K, 4K, 8K)
  const [resolutionMode, setResolutionMode] = useState<'1080p' | '2K' | '4K' | '8K'>('2K');
  const [msaaMode, setMsaaMode] = useState<'Off' | '2x' | '4x' | '8x'>('4x');
  const [furmarkSearchQuery, setFurmarkSearchQuery] = useState<string>('');
  const [furmarkCategory, setFurmarkCategory] = useState<string>('ALL');
  const [hardwareSearch, setHardwareSearch] = useState<string>('');

  // 500 FurMark Simulators filtering logic
  const filteredFurmarkPresets = useMemo(() => {
    return FURMARK_SIMULATORS.filter((sim) => {
      const matchesQuery =
        sim.name.toLowerCase().includes(furmarkSearchQuery.toLowerCase()) ||
        sim.gpuName.toLowerCase().includes(furmarkSearchQuery.toLowerCase()) ||
        sim.api.toLowerCase().includes(furmarkSearchQuery.toLowerCase()) ||
        sim.resolution.toLowerCase().includes(furmarkSearchQuery.toLowerCase()) ||
        sim.id.toLowerCase().includes(furmarkSearchQuery.toLowerCase()) ||
        sim.targetComponent.toLowerCase().includes(furmarkSearchQuery.toLowerCase());

      const matchesCat = furmarkCategory === 'ALL' || sim.category === furmarkCategory;
      return matchesQuery && matchesCat;
    });
  }, [furmarkSearchQuery, furmarkCategory]);

  // BENCHMARK & STRESS TEST STATES
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [selectedFurmarkPresetId, setSelectedFurmarkPresetId] = useState<string>('furmark-sim-1');
  const selectedFurmarkPreset = useMemo(() => {
    return FURMARK_SIMULATORS.find((s) => s.id === selectedFurmarkPresetId) || FURMARK_SIMULATORS[0];
  }, [selectedFurmarkPresetId]);

  const [testPreset, setTestPreset] = useState<'furmark-amd' | 'furmark-nv' | 'timespy' | 'prime95' | 'occt' | 'mats' | 'ttest'>('furmark-nv');
  const [testDurationSec, setTestDurationSec] = useState(0);
  const [fps, setFps] = useState(185);
  const [coreTemp, setCoreTemp] = useState(44);
  const [hotspotTemp, setHotspotTemp] = useState(52);
  const [vramTemp, setVramTemp] = useState(48);
  const [ramTemp, setRamTemp] = useState(40);
  const [ssdTemp, setSsdTemp] = useState(42);
  const [vrmTemp, setVrmTemp] = useState(50);
  const [waterTemp, setWaterTemp] = useState(32);
  const [powerWatts, setPowerWatts] = useState(42);
  const [fanRpm, setFanRpm] = useState(1250);
  const [coreClockMhz, setCoreClockMhz] = useState(2450);
  const [matsErrors, setMatsErrors] = useState<string[]>([]);
  const [tempHistory, setTempHistory] = useState<{ time: number; core: number; hotspot: number; vram: number }[]>([]);

  const allProfiles = [...HARDWARE_PROFILES, ...AUTOMATED_200_SIMULATORS];
  const currentProfile = allProfiles.find((p) => p.id === selectedProfileId) || allProfiles[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Animate FurMark Furry Donut Canvas when test is running
  useEffect(() => {
    if (!isOpen || activeTab !== 'furmark') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotationAngle = 0;

    const renderFurMarkDonut = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Dark radial background gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width / 1.5);
      bgGrad.addColorStop(0, isTestRunning ? (testPreset.includes('amd') ? '#3b0000' : '#311100') : '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Rotating Torus / Furry Donut Ring
      const centerX = width / 2;
      const centerY = height / 2;
      const radiusOuter = isTestRunning ? 85 : 75;
      const radiusInner = isTestRunning ? 40 : 35;

      rotationAngle += isTestRunning ? 0.04 : 0.01;

      // Draw Glow Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);

      const numSpikes = isTestRunning ? 120 : 60;
      for (let i = 0; i < numSpikes; i++) {
        const angle = (i / numSpikes) * Math.PI * 2;
        const fuzzyLen = isTestRunning ? Math.sin(i * 0.5 + rotationAngle * 5) * 18 + 25 : 10;

        const x1 = Math.cos(angle) * radiusInner;
        const y1 = Math.sin(angle) * radiusInner;
        const x2 = Math.cos(angle) * (radiusOuter + fuzzyLen);
        const y2 = Math.sin(angle) * (radiusOuter + fuzzyLen);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        let strokeColor = '#38bdf840';
        if (isTestRunning) {
          if (testPreset.includes('amd')) {
            strokeColor = `hsla(${350 + (i * 2 + rotationAngle * 80) % 20}, 100%, 55%, 0.8)`;
          } else {
            strokeColor = `hsla(${(i * 3 + rotationAngle * 100) % 60 + 10}, 100%, 55%, 0.8)`;
          }
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isTestRunning ? 3 : 1.5;
        ctx.stroke();
      }

      // Center Core
      ctx.beginPath();
      ctx.arc(0, 0, radiusInner - 5, 0, Math.PI * 2);
      ctx.fillStyle = isTestRunning ? (testPreset.includes('amd') ? '#881337' : '#7c2d12') : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isTestRunning ? (testPreset.includes('amd') ? '#f43f5e' : '#f97316') : '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // HUD Text on Canvas
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`PROFILE: ${currentProfile.gpu.model.slice(0, 30)}`, 15, 22);
      ctx.fillText(`TEST: ${testPreset.toUpperCase()} | RES: ${resolutionMode} (${msaaMode} MSAA)`, 15, 38);

      ctx.fillStyle = isTestRunning ? '#f97316' : '#94a3b8';
      ctx.fillText(`FPS: ${fps.toFixed(1)} | Frame Time: ${(1000 / Math.max(1, fps)).toFixed(1)}ms`, 15, 54);

      if (isTestRunning) {
        ctx.fillStyle = hotspotTemp > 95 ? '#ef4444' : '#22c55e';
        ctx.fillText(`STATUS: OBCIĄŻENIE STRESS 100% | HOTSPOT: ${hotspotTemp}°C`, 15, 70);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillText('STATUS: BEZCZYNNOŚĆ (Kliknij Uruchom Test)', 15, 70);
      }

      animationFrameRef.current = requestAnimationFrame(renderFurMarkDonut);
    };

    renderFurMarkDonut();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isOpen, activeTab, isTestRunning, testPreset, fps, hotspotTemp, currentProfile]);

  // Simulated Telemetry updates during test execution
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestRunning) {
      timer = setInterval(() => {
        setTestDurationSec((prev) => prev + 1);

        setCoreTemp((prev) => Math.min(84, +(prev + 0.8).toFixed(1)));
        setHotspotTemp((prev) => Math.min(101.5, +(prev + 1.2).toFixed(1)));
        setVramTemp((prev) => Math.min(90, +(prev + 0.9).toFixed(1)));
        setPowerWatts((prev) => Math.min(350, +(prev + 8).toFixed(0)));
        setFanRpm((prev) => Math.min(3100, +(prev + 50).toFixed(0)));
        setFps(+(160 + Math.random() * 30).toFixed(1));

        setTempHistory((prevHistory) => [
          ...prevHistory.slice(-50),
          {
            time: testDurationSec + 1,
            core: Math.min(84, coreTemp),
            hotspot: Math.min(101.5, hotspotTemp),
            vram: Math.min(90, vramTemp)
          }
        ]);

        if (testPreset === 'mats' && matsErrors.length === 0 && testDurationSec > 2) {
          setMatsErrors([
            'MATS v367.388 Testing VRAM Channel A0 (U501)... OK',
            'MATS Testing VRAM Channel A1 (U502)... OK',
            'MATS Testing VRAM Channel B0 (U503)... BŁĄD BITOWY 0x00000040 (248 Bits flipped)',
            '-> Wykryto uszkodzony układ VRAM BGA Bank B0! Wymagana wymiana kostki GDDR6.'
          ]);
        }

        if (testPreset === 'ttest' && matsErrors.length === 0 && testDurationSec > 2) {
          setMatsErrors([
            'AMD RDNA ttest v2.4 Scanning VRAM Channel A0/A1 (K4Z80325BC)... PASS',
            'AMD ttest Scanning VRAM Channel B0/B1... PASS',
            'AMD ttest Scanning VRAM Channel C0 (U301)... BŁĄD PRZESYŁU PRÓBKI (Single Bit Flip at 0x7E020000)',
            '-> Wykryto niestabilność szyny pamięci VRAM Kanał C0 na karcie AMD Radeon!'
          ]);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestRunning, testDurationSec, coreTemp, hotspotTemp, vramTemp, testPreset, matsErrors]);

  const handleStartTest = () => {
    setIsTestRunning(true);
    setTestDurationSec(0);
    setMatsErrors([]);
    setTempHistory([]);
    setCoreTemp(52);
    setHotspotTemp(61);
    setVramTemp(55);
    setPowerWatts(120);
  };

  const handleStopTest = () => {
    setIsTestRunning(false);
  };

  const handleResetTelemetry = () => {
    setIsTestRunning(false);
    setTestDurationSec(0);
    setCoreTemp(44);
    setHotspotTemp(52);
    setVramTemp(48);
    setPowerWatts(42);
    setFanRpm(1250);
    setTempHistory([]);
    setMatsErrors([]);
  };

  const handleRunHardwareScan = () => {
    setIsScanningHardware(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningHardware(false);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Certyfikat_HWiNFO_FurMark</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
          h1 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 5px; }
          h2 { color: #2563eb; margin-top: 15px; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>🔥 PROTOKÓŁ STABILNOŚCI FURMARK & HWiNFO (2K/4K/8K)</h1>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pl-PL')} | <strong>Rozdzielczość FurMark:</strong> ${resolutionMode} (${msaaMode} MSAA)</p>
        <p><strong>Profil Sprzętowy:</strong> ${currentProfile.name}</p>

        <h2>1. SPECYFIKACJA KARTY GRAFICZNEJ & PROCESSORA</h2>
        <table>
          <tr><th>Komponent</th><th>Specyfikacja Szczegółowa</th></tr>
          <tr><td>GPU</td><td>${currentProfile.gpu.model} (${currentProfile.gpu.vram}, ${currentProfile.gpu.busWidth})</td></tr>
          <tr><td>VBIOS / Driver</td><td>${currentProfile.gpu.vBios} | ${currentProfile.gpu.driver}</td></tr>
          <tr><td>CPU</td><td>${currentProfile.cpu.model} (${currentProfile.cpu.coresThreads}, ${currentProfile.cpu.frequency})</td></tr>
          <tr><td>Płyta Główna</td><td>${currentProfile.motherboard.vendorModel} (${currentProfile.motherboard.chipset})</td></tr>
          <tr><td>Pamięć RAM</td><td>${currentProfile.ram.typeSize} @ ${currentProfile.ram.speedTimings}</td></tr>
          <tr><td>Dysk NVMe SSD</td><td>${currentProfile.disk.model} (${currentProfile.disk.health})</td></tr>
        </table>

        <h2>2. WYNIKI TESTU STRESS TEST & TELEMETRIA</h2>
        <table>
          <tr><th>Czujnik Termiczny</th><th>Temperatura Peak</th><th>Status Normy</th></tr>
          <tr><td>GPU Core Temp</td><td>${coreTemp}°C</td><td>${coreTemp > 83 ? 'PRZEKROCZENIE NORMY' : 'OPTYMALNA'}</td></tr>
          <tr><td>GPU HotSpot Temp</td><td>${hotspotTemp}°C</td><td>${hotspotTemp > 95 ? 'CRITICAL HOTSPOT!' : 'NORMA'}</td></tr>
          <tr><td>VRAM Temp</td><td>${vramTemp}°C</td><td>${vramTemp > 95 ? 'GORĄCA VRAM' : 'NORMA'}</td></tr>
          <tr><td>CPU Core Temp</td><td>${coreTemp + 12}°C</td><td>NORMA</td></tr>
          <tr><td>Pobór Mocy TGP</td><td>${powerWatts} W</td><td>STABILNY</td></tr>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certyfikat_FurMark_${resolutionMode}_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    let csv = `\ufeff"Kategoria";"Parametr";"Wartość"\n`;
    csv += `"PROFIL";"Sprzęt";"${currentProfile.name}"\n`;
    csv += `"FURMARK";"Rozdzielczość";"${resolutionMode}"\n`;
    csv += `"FURMARK";"Antialiasing";"${msaaMode} MSAA"\n`;
    csv += `"TELEMETRIA";"GPU Core Temp";"${coreTemp} °C"\n`;
    csv += `"TELEMETRIA";"GPU Hotspot Temp";"${hotspotTemp} °C"\n`;
    csv += `"TELEMETRIA";"VRAM Temp";"${vramTemp} °C"\n`;
    csv += `"TELEMETRIA";"Obroty Wentylatorów";"${fanRpm} RPM"\n`;
    csv += `"TELEMETRIA";"Pobór Mocy";"${powerWatts} W"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tabela_FurMark_${resolutionMode}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCertificate = () => {
    const reportText = `
===============================================================
 PROTOKÓŁ PEŁNEJ DIAGNOSTYKI SPRZĘTOWEJ I TESTÓW STABILNOŚCI
       FURMARK, AMD/NVIDIA BENCHMARK & HWiNFO INSPECTOR
===============================================================
Data Testu: ${new Date().toLocaleString()}
Konfiguracja Sprzętowa: ${currentProfile.name}

1. KARTA GRAFICZNA (GPU):
- Model: ${currentProfile.gpu.model}
- VRAM: ${currentProfile.gpu.vram} (${currentProfile.gpu.busWidth})
- Sterownik & VBIOS: ${currentProfile.gpu.driver} | VBIOS ${currentProfile.gpu.vBios}
- SAM / Resizable BAR: ${currentProfile.gpu.samEnabled ? 'WŁĄCZONY' : 'WYŁĄCZONY'}
- Zasilanie TGP: ${currentProfile.gpu.tgp}

2. PROCESOR (CPU):
- Model: ${currentProfile.cpu.model}
- Rdzenie / Wątki: ${currentProfile.cpu.coresThreads} (${currentProfile.cpu.socket})
- Taktowanie: ${currentProfile.cpu.frequency}
- L3 Cache: ${currentProfile.cpu.l3Cache} | TDP: ${currentProfile.cpu.tdp}

3. PŁYTA GŁÓWNA & BIOS:
- Model Płyty: ${currentProfile.motherboard.vendorModel} (${currentProfile.motherboard.chipset})
- BIOS / AGESA: ${currentProfile.motherboard.biosVersion} | ${currentProfile.motherboard.agesaOrEC}
- Sekcja VRM: ${currentProfile.motherboard.vrmPhases}

4. PAMIĘĆ RAM & DYSKI:
- RAM: ${currentProfile.ram.typeSize} @ ${currentProfile.ram.speedTimings} (${currentProfile.ram.profile})
- Dysk M.2 NVMe: ${currentProfile.disk.model} | Health: ${currentProfile.disk.health}

5. MATRYCA EKRANU / EKRAN LAPTOPA:
- Panel: ${currentProfile.display.panelModel} (${currentProfile.display.panelType})
- Rozdzielczość & Odświeżanie: ${currentProfile.display.resolution} @ ${currentProfile.display.refreshRate}
- Interfejs eDP & Jasność: ${currentProfile.display.edpLanes} | ${currentProfile.display.gamutBrightness}

6. WYNIKI TESTU STRESS TEST (${testPreset.toUpperCase()}):
- Czas trwania: ${testDurationSec} sekund
- Temp. Rdzenia: ${coreTemp}°C | Temp. HotSpot: ${hotspotTemp}°C | Temp. VRAM: ${vramTemp}°C
- Moc TGP: ${powerWatts}W | Obroty: ${fanRpm} RPM
- Ocena Stanu: ${hotspotTemp > 95 ? 'WYKRYTO PRZEGRZEWANIE! Wymagana wymiana pasty/termopadów.' : 'SYSTEM SPRAWNY TERMICZNIE'}

===============================================================
    `;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certyfikat_Diagnostyczny_HWiNFO_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[94vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-rose-500/20 border border-orange-500/30 rounded-xl text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                <span>FurMark &amp; Full PC/Laptop HWiNFO Inspector</span>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
                  v3.0 Live Suite
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Wykrywanie AMD/Nvidia/Intel GPU, CPU, Płyt Głównych, BIOS/AGESA, RAM, Dysków NVMe i Matryc Laptopa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-950/80 px-4 pt-2 border-b border-slate-800 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveTab('furmark')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'furmark'
                ? 'bg-slate-900 text-orange-400 border-orange-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Gauge className="w-4 h-4 text-orange-400" />
            <span>FurMark &amp; Stress Tests</span>
          </button>

          <button
            onClick={() => setActiveTab('mods_vram')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'mods_vram'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <CircuitBoard className="w-4 h-4 text-emerald-400" />
            <span>Parser MODS 60GB VRAM (.img)</span>
          </button>

          <button
            onClick={() => setActiveTab('vram_coils_map')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'vram_coils_map'
                ? 'bg-slate-900 text-rose-400 border-rose-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-rose-400" />
            <span>Mapa Sektorów VRAM i Cewek Zasilania</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'hardware'
                ? 'bg-slate-900 text-cyan-400 border-cyan-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>Pełne Wykrywanie Sprzętu PC/Laptop</span>
          </button>

          <button
            onClick={() => setActiveTab('faults')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'faults'
                ? 'bg-slate-900 text-purple-400 border-purple-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Baza Usterek GPU / Kod 43</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'videos'
                ? 'bg-slate-900 text-red-400 border-red-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Video Instruktażowe</span>
          </button>

          <button
            onClick={() => setActiveTab('live_specs')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'live_specs'
                ? 'bg-slate-900 text-cyan-300 border-cyan-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Specyfikacja na Żywo</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-300 text-xs sm:text-sm flex-1">
          
          {/* TAB: SPECYFIKACJA NA ŻYWO */}
          {activeTab === 'live_specs' && (
            <LiveSpecsAuditTab
              modalTitle="Diagnostyka GPU & VRAM"
              onSendToChat={onSendToChat}
            />
          )}

          {/* TAB: MAPA SEKTORÓW VRAM I CEWEK ZASILANIA */}
          {activeTab === 'vram_coils_map' && (
            <div className="space-y-4 font-sans">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-rose-400" />
                    <span>Matryca Sektorów VRAM &amp; Cewek Zasilania VRM (Płytka PCB GPU)</span>
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      LOGICAL HARDWARE MAPPING
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Trójwymiarowa telemetria sektorowa i detekcja zwarć/przegrzania na cewkach zasilania (Inductors L1-L12) oraz kostkach GDDR6/GDDR6X.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg">VRM Vcore: 1.05V OK</span>
                  <span className="bg-rose-950 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-lg font-bold animate-pulse">L7 (VRAM Coil): 1.35V HOT (92°C)</span>
                </div>
              </div>

              {/* AUTOMATIC VRAM THERMAL SNAPSHOT HEATMAP GENERATOR */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-rose-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-amber-600 rounded-xl text-white shadow-lg shadow-rose-950/50">
                      <Flame className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        Automatyczna Heatmapa Modułów VRAM z Zrzutu Termowizyjnego
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                          IR SPECTRAL ANALYSIS
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Identyfikacja "zimnych lutów" BGA (brak obciążenia) oraz przegrzewających się modułów VRAM (&gt;90°C)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const btn = document.getElementById('vram-scan-trigger');
                        if (btn) btn.click();
                      }}
                      className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                      Wygeneruj Heatmapę z Termowizji
                    </button>
                  </div>
                </div>

                {/* PCB VRAM Visual Layout Stage */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  
                  {/* Visual GPU PCB Layout Canvas Representation */}
                  <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                    
                    {/* Thermal Overlay Heat Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-rose-950/20 to-amber-950/30 pointer-events-none"></div>

                    <div className="text-[10px] font-mono text-cyan-400 absolute top-3 left-4 flex items-center gap-1.5">
                      <CircuitBoard className="w-4 h-4" /> UKŁAD FIZYCZNY BGA: GPU DIE &amp; 8x VRAM GDDR6X
                    </div>

                    {/* Heatmap Legend */}
                    <div className="absolute top-3 right-4 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl text-[9px] font-mono flex items-center gap-1.5">
                      <span className="text-blue-400 font-bold">28°C (Zimny Lut)</span>
                      <div className="w-12 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-red-600"></div>
                      <span className="text-rose-400 font-bold">98°C (Zwarcie)</span>
                    </div>

                    {/* Board Representation */}
                    <div className="relative w-full max-w-md aspect-square max-h-[260px] bg-slate-950 border-2 border-emerald-950/80 rounded-3xl p-4 flex items-center justify-center shadow-2xl">
                      
                      {/* Central GPU Die */}
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-slate-600 rounded-xl flex flex-col items-center justify-center shadow-2xl z-10 relative">
                        <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
                        <span className="text-[9px] font-mono font-bold text-slate-200 mt-1">GPU CORE</span>
                        <span className="text-[8px] font-mono text-cyan-400">76.5°C</span>
                      </div>

                      {/* 8 VRAM Chips Surrounding Core */}
                      {[
                        { id: 'U1', label: 'Bank A0', temp: 78.4, status: 'OK', pos: 'top-2 left-1/4 -translate-x-1/2' },
                        { id: 'U2', label: 'Bank A1', temp: 79.2, status: 'OK', pos: 'top-2 right-1/4 translate-x-1/2' },
                        { id: 'U3', label: 'Bank B0', temp: 28.1, status: 'COLD_JOINT', pos: 'top-1/3 -right-2 -translate-y-1/2' },
                        { id: 'U4', label: 'Bank B1', temp: 81.0, status: 'OK', pos: 'bottom-1/3 -right-2 translate-y-1/2' },
                        { id: 'U5', label: 'Bank C0', temp: 77.8, status: 'OK', pos: 'bottom-2 right-1/4 translate-x-1/2' },
                        { id: 'U6', label: 'Bank C1', temp: 98.5, status: 'OVERHEAT', pos: 'bottom-2 left-1/4 -translate-x-1/2' },
                        { id: 'U7', label: 'Bank D0', temp: 80.2, status: 'OK', pos: 'bottom-1/3 -left-2 translate-y-1/2' },
                        { id: 'U8', label: 'Bank D1', temp: 79.9, status: 'OK', pos: 'top-1/3 -left-2 -translate-y-1/2' },
                      ].map((chip) => (
                        <div
                          key={chip.id}
                          className={`absolute p-2 rounded-xl border text-center font-mono shadow-2xl transition-all cursor-pointer ${
                            chip.status === 'COLD_JOINT'
                              ? 'bg-blue-950/90 border-blue-400 text-blue-200 ring-2 ring-blue-500/50 animate-pulse'
                              : chip.status === 'OVERHEAT'
                              ? 'bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/50 animate-bounce'
                              : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500'
                          } ${chip.pos}`}
                        >
                          <span className="text-[10px] font-bold block">{chip.id} ({chip.label})</span>
                          <span className={`text-[11px] font-extrabold block ${
                            chip.status === 'COLD_JOINT' ? 'text-blue-400' : chip.status === 'OVERHEAT' ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {chip.temp}°C
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap Diagnostics Analysis Results */}
                  <div className="lg:col-span-5 space-y-3 font-mono text-xs">
                    <div className="p-3.5 bg-blue-950/40 border border-blue-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-400 flex items-center gap-1">
                          <Thermometer className="w-4 h-4" /> Wykryto "Zimny Lut" (U3 - Bank B0)
                        </span>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">28.1°C</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Brak nagrzewania kości U3 pod pełnym obciążeniem. Odlutowane kulki BGA uniemożliwiają przepływ prądu zasilania.
                      </p>
                      <p className="text-[10px] text-blue-300 font-semibold pt-1 border-t border-blue-900">
                        Zalecenie: Reballing BGA kości U3 lub wymiana stacji lutowniczej Hot-Air.
                      </p>
                    </div>

                    <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> Przegrzewanie Zwarcie (U6 - Bank C1)
                        </span>
                        <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">98.5°C</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Krytyczna temperatura na kości U6. Wewnętrzne zwarcie struktury krzemowej GDDR6X powoduje wyłączanie się karty.
                      </p>
                      <p className="text-[10px] text-red-300 font-semibold pt-1 border-t border-red-900">
                        Zalecenie: Bezwzględna wymiana kości U6 na nową z tej samej rewizji (Micron D9WCW).
                      </p>
                    </div>

                    <button
                      id="vram-scan-trigger"
                      onClick={() => {
                        onSendToChat(`Diagnoza Heatmapy VRAM: Znaleziono zimny lut na U3 (Bank B0, 28.1°C) oraz zwarcie/przegrzewanie na U6 (Bank C1, 98.5°C). Proszę o pełny opis profilu lutowniczego BGA do stacji lutowniczej.`);
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" /> Prześlij Raport Heatmapy VRAM do Czatu AI
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid Layout of Coils and VRAM Sectors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Power Delivery Coils (VRM Inductors) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Cewki Zasilania Sekcji VRM (Inductors L1 - L12)
                    </span>
                    <span className="text-[10px] text-slate-400">Pomiar Indukcyjności &amp; Temp. PWM</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'L1', name: 'Vcore Phase 1', status: 'OK', temp: 58, volts: '1.05V' },
                      { id: 'L2', name: 'Vcore Phase 2', status: 'OK', temp: 60, volts: '1.05V' },
                      { id: 'L3', name: 'Vcore Phase 3', status: 'OK', temp: 62, volts: '1.05V' },
                      { id: 'L4', name: 'Vcore Phase 4', status: 'OK', temp: 59, volts: '1.05V' },
                      { id: 'L5', name: 'Vcore Phase 5', status: 'OK', temp: 61, volts: '1.05V' },
                      { id: 'L6', name: 'Vcore Phase 6', status: 'OK', temp: 63, volts: '1.05V' },
                      { id: 'L7', name: 'VRAM Power Phase 1', status: 'WARN', temp: 92, volts: '1.38V' },
                      { id: 'L8', name: 'VRAM Power Phase 2', status: 'OK', temp: 65, volts: '1.35V' },
                      { id: 'L9', name: 'VBIOS / SOC Phase 1', status: 'OK', temp: 52, volts: '1.80V' },
                      { id: 'L10', name: 'PCIe Rail Phase 1', status: 'OK', temp: 48, volts: '3.30V' },
                      { id: 'L11', name: 'Display Engine Phase', status: 'OK', temp: 50, volts: '0.90V' },
                      { id: 'L12', name: 'PLL High Rail Phase', status: 'OK', temp: 51, volts: '1.80V' },
                    ].map((coil) => (
                      <div
                        key={coil.id}
                        className={`p-2.5 rounded-xl border text-center font-mono space-y-1 transition ${
                          coil.status === 'WARN'
                            ? 'bg-rose-950/80 border-rose-500/80 text-rose-200 shadow-lg shadow-rose-500/20 animate-pulse'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-extrabold text-amber-400 block">{coil.id}</span>
                        <span className="text-[9px] text-slate-400 block truncate">{coil.name}</span>
                        <span className={`text-[10px] font-bold block ${coil.temp > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {coil.temp}°C | {coil.volts}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VRAM Sectors Logical Map */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                      <CircuitBoard className="w-4 h-4 text-cyan-400" />
                      Sektory Pamięci VRAM GDDR6/X (Physical Sectors)
                    </span>
                    <span className="text-[10px] text-slate-400">Adresowanie BGA Solder Balls</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { sector: 'Sector 0x00 - 0x1F', chip: 'Micron GDDR6X U1', status: 'EXCELLENT', badBits: 0 },
                      { sector: 'Sector 0x20 - 0x3F', chip: 'Micron GDDR6X U2', status: 'EXCELLENT', badBits: 0 },
                      { sector: 'Sector 0x40 - 0x5F', chip: 'Micron GDDR6X U3', status: 'DEGRADED', badBits: 14 },
                      { sector: 'Sector 0x60 - 0x7F', chip: 'Micron GDDR6X U4', status: 'EXCELLENT', badBits: 0 },
                      { sector: 'Sector 0x80 - 0x9F', chip: 'Micron GDDR6X U5', status: 'EXCELLENT', badBits: 0 },
                      { sector: 'Sector 0xA0 - 0xBF', chip: 'Micron GDDR6X U6', status: 'EXCELLENT', badBits: 0 },
                    ].map((sec) => (
                      <div
                        key={sec.sector}
                        className={`p-3 rounded-xl border font-mono space-y-1 ${
                          sec.badBits > 0
                            ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold text-cyan-400 block">{sec.sector}</span>
                        <span className="text-[10px] text-slate-400 block">{sec.chip}</span>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                          <span>Status: <strong className={sec.badBits > 0 ? 'text-amber-400' : 'text-emerald-400'}>{sec.status}</strong></span>
                          <span>Błędy: <strong className={sec.badBits > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{sec.badBits}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'videos' && (
            <DiagnosticVideoTutorialsTab
              categoryFilter="ALL"
              title="Poradniki Wideo Diagnostyki GPU, VRAM & BGA (Od A do Z)"
              onSendToChat={onSendToChat}
            />
          )}
          
          {/* TAB 2: MODS 60GB VRAM DUMP PARSER */}
          {activeTab === 'mods_vram' && (
            <div className="space-y-4 font-sans">
              
              {/* Header Preset & File Loader Bar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CircuitBoard className="w-4 h-4 text-emerald-400" />
                      <span>Parser Plików Zrzutu MODS (60GB VRAM Stress Diagnostic)</span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        LOG &amp; .IMG READY
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Analizuje zrzuty pamięci VRAM wygenerowane przez narzędzie MODS/MATS. Mapuje uszkodzone bity na fizyczne banki GDDR6/GDDR6X.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Przykładowy Zrzut MODS:</span>
                    <select
                      value={selectedModsPreset}
                      onChange={(e) => setSelectedModsPreset(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="rtx3080_bank_b1">🔴 NVIDIA RTX 3080 (Błąd Banku B1 / Micron U8)</option>
                      <option value="rtx4090_clean">🟢 NVIDIA RTX 4090 (Czysty Pass 24GB VRAM)</option>
                      <option value="rtx2080ti_dual_fail">🔴 NVIDIA RTX 2080 Ti (Podwójny Błąd Banków A1 &amp; C0)</option>
                    </select>
                  </div>
                </div>

                {/* File Upload Box */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-dashed border-slate-700 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200">Wczytaj własny plik zrzutu .img / .log z MODS (60GB version)</span>
                      <p className="text-[11px] text-slate-400">Przeciągnij plik mods_report.img lub gmods.log do automatycznego parsowania</p>
                    </div>
                  </div>

                  <label className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition shadow">
                    <span>Wybierz Plik .IMG / .LOG</span>
                    <input
                      type="file"
                      accept=".img,.log,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            setCustomModsLogContent(evt.target?.result as string || '');
                            alert(`Wczytano plik MODS 60GB: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Status Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Model GPU &amp; Wersja MODS:</span>
                  <span className="text-xs font-bold text-slate-100">{activeModsReport.gpuModel}</span>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">{activeModsReport.modsVersion}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Status Skanu 60GB Dump:</span>
                  <span className={`text-xs font-extrabold flex items-center gap-1.5 mt-0.5 ${
                    activeModsReport.overallResult === 'PASS' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {activeModsReport.overallResult === 'PASS' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>PASSED (100% VRAM OK)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
                        <span>FAILED ({activeModsReport.failedBanksCount} Uszkodzone Banki)</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Przestrzeń Skanowana VRAM:</span>
                  <span className="text-xs font-bold text-slate-200">{activeModsReport.totalScannedGb} GB GDDR6/X</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Test Pętli 60GB MODS Finished</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Znalezione Błędy Bitowe:</span>
                  <span className={`text-xs font-extrabold font-mono ${
                    activeModsReport.banks.reduce((acc, b) => acc + b.badBits, 0) > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {activeModsReport.banks.reduce((acc, b) => acc + b.badBits, 0)} Bad Bits
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Parity &amp; Pattern Check</span>
                </div>
              </div>

              {/* Main Visualization: Interactive VRAM Layout PCB + Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Visual GPU Die & VRAM Chip PCB Map */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <CircuitBoard className="w-4 h-4 text-emerald-400" />
                      Interaktywna Mapa Układów Pamięci VRAM na Laminacie GPU
                    </span>
                    <span className="text-[10px] text-slate-400">Kliknij kostkę VRAM, aby zobaczyć adres</span>
                  </div>

                  {/* GPU Board PCB Graphic */}
                  <div className="bg-slate-900 border-2 border-emerald-950 rounded-2xl p-6 relative flex flex-col items-center justify-center min-h-[300px]">
                    {/* GPU Core Center */}
                    <div className="w-28 h-28 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-500 rounded-xl flex flex-col items-center justify-center shadow-2xl relative z-10">
                      <Cpu className="w-8 h-8 text-slate-300" />
                      <span className="text-[10px] font-extrabold text-slate-100 mt-1">GPU CORE DIE</span>
                      <span className="text-[8px] text-slate-400 font-mono">BGA Solder Ball Grid</span>
                    </div>

                    {/* VRAM Memory Chips Surrounding Core (Banks A0, A1, B0, B1, C0, C1, D0, D1) */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      {/* Top Row: Banks A0, A1 */}
                      <div className="flex justify-center gap-12">
                        {activeModsReport.banks.slice(0, 2).map((bank) => (
                          <button
                            key={bank.name}
                            onClick={() => setActiveSelectedBank(bank.name)}
                            className={`px-3 py-2 rounded-lg border-2 font-mono text-center transition-all ${
                              bank.status === 'FAIL'
                                ? 'bg-red-950/90 border-red-500 text-red-200 shadow-lg shadow-red-500/30 animate-pulse'
                                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:border-emerald-400'
                            } ${activeSelectedBank === bank.name ? 'ring-2 ring-white scale-105' : ''}`}
                          >
                            <span className="text-xs font-bold block">BANK {bank.name}</span>
                            <span className="text-[9px] block text-slate-400">{bank.location}</span>
                            <span className={`text-[9px] font-extrabold ${bank.status === 'FAIL' ? 'text-red-300' : 'text-emerald-400'}`}>
                              {bank.status === 'FAIL' ? `${bank.badBits} BAD BITS` : 'PASS'}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Middle Side Rows: Left Banks B0, B1 | Right Banks C0, C1 */}
                      <div className="flex justify-between items-center w-full px-2">
                        <div className="flex flex-col gap-4">
                          {activeModsReport.banks.slice(2, 4).map((bank) => (
                            <button
                              key={bank.name}
                              onClick={() => setActiveSelectedBank(bank.name)}
                              className={`px-3 py-2 rounded-lg border-2 font-mono text-center transition-all ${
                                bank.status === 'FAIL'
                                  ? 'bg-red-950/90 border-red-500 text-red-200 shadow-lg shadow-red-500/30 animate-pulse'
                                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:border-emerald-400'
                              } ${activeSelectedBank === bank.name ? 'ring-2 ring-white scale-105' : ''}`}
                            >
                              <span className="text-xs font-bold block">BANK {bank.name}</span>
                              <span className="text-[9px] block text-slate-400">{bank.location}</span>
                              <span className={`text-[9px] font-extrabold ${bank.status === 'FAIL' ? 'text-red-300' : 'text-emerald-400'}`}>
                                {bank.status === 'FAIL' ? `${bank.badBits} BAD BITS` : 'PASS'}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="flex flex-col gap-4">
                          {activeModsReport.banks.slice(4, 6).map((bank) => (
                            <button
                              key={bank.name}
                              onClick={() => setActiveSelectedBank(bank.name)}
                              className={`px-3 py-2 rounded-lg border-2 font-mono text-center transition-all ${
                                bank.status === 'FAIL'
                                  ? 'bg-red-950/90 border-red-500 text-red-200 shadow-lg shadow-red-500/30 animate-pulse'
                                  : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:border-emerald-400'
                              } ${activeSelectedBank === bank.name ? 'ring-2 ring-white scale-105' : ''}`}
                            >
                              <span className="text-xs font-bold block">BANK {bank.name}</span>
                              <span className="text-[9px] block text-slate-400">{bank.location}</span>
                              <span className={`text-[9px] font-extrabold ${bank.status === 'FAIL' ? 'text-red-300' : 'text-emerald-400'}`}>
                                {bank.status === 'FAIL' ? `${bank.badBits} BAD BITS` : 'PASS'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Row: Banks D0, D1 */}
                      <div className="flex justify-center gap-12">
                        {activeModsReport.banks.slice(6, 8).map((bank) => (
                          <button
                            key={bank.name}
                            onClick={() => setActiveSelectedBank(bank.name)}
                            className={`px-3 py-2 rounded-lg border-2 font-mono text-center transition-all ${
                              bank.status === 'FAIL'
                                ? 'bg-red-950/90 border-red-500 text-red-200 shadow-lg shadow-red-500/30 animate-pulse'
                                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:border-emerald-400'
                            } ${activeSelectedBank === bank.name ? 'ring-2 ring-white scale-105' : ''}`}
                          >
                            <span className="text-xs font-bold block">BANK {bank.name}</span>
                            <span className="text-[9px] block text-slate-400">{bank.location}</span>
                            <span className={`text-[9px] font-extrabold ${bank.status === 'FAIL' ? 'text-red-300' : 'text-emerald-400'}`}>
                              {bank.status === 'FAIL' ? `${bank.badBits} BAD BITS` : 'PASS'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bad Bit Distribution Bar Chart & Selected Bank Inspector */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Wykres Słupkowy Uszkodzonych Bloków Pamięci VRAM (Bad Bits per Bank)
                    </span>

                    {/* Bar chart rendering */}
                    <div className="space-y-2 pt-2">
                      {activeModsReport.banks.map((b) => {
                        const maxBits = Math.max(100, ...activeModsReport.banks.map((x) => x.badBits));
                        const pct = Math.min(100, (b.badBits / maxBits) * 100);

                        return (
                          <div key={b.name} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="font-bold text-slate-300">Bank {b.name} ({b.location})</span>
                              <span className={b.badBits > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                                {b.badBits > 0 ? `${b.badBits} uszkodzonych bitów` : '0 błędów (Czysty)'}
                              </span>
                            </div>

                            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  b.badBits > 0 ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${b.badBits > 0 ? Math.max(8, pct) : 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Bank Details Box */}
                  {(() => {
                    const selBank = activeModsReport.banks.find((b) => b.name === activeSelectedBank) || activeModsReport.banks[0];
                    return (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">Karta Szczegółowa: Bank {selBank.name} ({selBank.location})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selBank.status === 'FAIL' ? 'bg-red-900/60 text-red-300 border border-red-500/40' : 'bg-emerald-900/60 text-emerald-300'
                          }`}>
                            {selBank.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-300">
                          <div><strong>Zakres Adresowy:</strong> <code className="text-cyan-300 text-[10px]">{selBank.address}</code></div>
                          {selBank.errorDetails && (
                            <div className="text-red-300 bg-red-950/60 p-2 rounded border border-red-800/60 mt-1">
                              <strong>Opis Błędu MODS:</strong> {selBank.errorDetails}
                            </div>
                          )}
                          <div className="text-slate-400 text-[10px] pt-1">
                            {selBank.status === 'FAIL'
                              ? `Rekomendacja serwisowa: Wymiana kostki VRAM na pozycji ${selBank.location}. Zalecany kulki BGA 0.45mm / temp. rozpływu 220°C.`
                              : 'Brak uszkodzeń. Pamięć przeszła test pętli zapisu/odczytu MODS.'}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* TAB 1: FURMARK & STRESS TESTS */}
          {activeTab === 'furmark' && (
            <div className="space-y-4">
              
              {/* Resolution & Render Controls Bar (2K / 4K / 8K) */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-xs">Rozdzielczość Renderowania:</span>
                  {(['1080p', '2K', '4K', '8K'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolutionMode(res)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                        resolutionMode === res
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                      }`}
                    >
                      {res === '1080p' ? '1080p (FHD)' : res === '2K' ? '2K (QHD 1440p)' : res === '4K' ? '4K (UHD 2160p)' : '8K (FUHD 4320p)'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-semibold text-xs">MSAA:</span>
                  {(['Off', '2x', '4x', '8x'] as const).map((msaa) => (
                    <button
                      key={msaa}
                      onClick={() => setMsaaMode(msaa)}
                      className={`px-2 py-1 rounded font-mono text-xs transition ${
                        msaaMode === msaa ? 'bg-orange-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {msaa}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2000 FurMark Simulators Search & Selection Bar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Baza 2000 Dedykowanych Symulatorów Obciążeniowych FurMark
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                      2000 Dostępnych Profilów
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Wyniki: {filteredFurmarkPresets.length}
                    </span>
                  </div>
                </div>

                {/* Search & Categories */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-5 relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={furmarkSearchQuery}
                      onChange={(e) => setFurmarkSearchQuery(e.target.value)}
                      placeholder="Szukaj po nazwie GPU (np. RTX 5090, RX 7900), silniku (Vulkan), ID..."
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-7 flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
                    {['ALL', 'FurMark GPU', 'MSI Kombustor', 'Prime95 CPU', 'OCCT Power', 'VRAM & BGA', 'VRM & Power'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFurmarkCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                          furmarkCategory === cat
                            ? 'bg-orange-500 text-slate-950 font-extrabold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat === 'ALL' ? 'Wszystkie (2000)' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
                  <div className="flex-1 space-y-1">
                    <select
                      value={selectedFurmarkPresetId}
                      onChange={(e) => {
                        setSelectedFurmarkPresetId(e.target.value);
                        setIsTestRunning(false);
                      }}
                      className="w-full bg-slate-900 border border-orange-500/40 text-orange-300 font-bold text-xs sm:text-sm rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-mono"
                    >
                      {filteredFurmarkPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.category} | {p.resolution} | {p.api}]
                        </option>
                      ))}
                    </select>
                  </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isTestRunning ? (
                    <button
                      onClick={handleStartTest}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Uruchom Test</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopTest}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition animate-pulse"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Zatrzymaj ({testDurationSec}s)</span>
                    </button>
                  )}

                  <button
                    onClick={handleResetTelemetry}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl border border-slate-700 transition"
                    title="Resetuj Dane Telemetrii"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleExportWord}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1 transition shadow"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-200" />
                    <span>Word (.doc)</span>
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="bg-teal-700 hover:bg-teal-600 text-white text-xs px-3 py-2 rounded-xl font-bold flex items-center gap-1 transition shadow"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-teal-200" />
                    <span>Excel (.csv)</span>
                  </button>

                  <button
                    onClick={handleExportCertificate}
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>TXT</span>
                  </button>
                </div>
              </div>
            </div>

              {/* Canvas & Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                <div className="lg:col-span-7 bg-black rounded-xl border border-slate-800 p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[260px]">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={260}
                    className="w-full h-auto max-h-[260px] rounded object-contain"
                  />

                  {hotspotTemp > 95 && (
                    <div className="absolute top-3 right-3 bg-red-950/90 border border-red-500 text-red-200 text-[11px] font-mono px-3 py-1 rounded-lg shadow-xl flex items-center gap-1.5 animate-bounce">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="font-bold">HotSpot {hotspotTemp}°C! Przegrzewanie!</span>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-2 text-xs font-mono">
                  
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block flex items-center justify-between">
                      <span>GPU Core Temp</span>
                      <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    </span>
                    <strong className={`text-lg sm:text-xl font-bold block ${coreTemp > 80 ? 'text-red-400' : 'text-orange-400'}`}>
                      {coreTemp}°C
                    </strong>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${(coreTemp / 100) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block flex items-center justify-between">
                      <span>HotSpot Temp</span>
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                    </span>
                    <strong className={`text-lg sm:text-xl font-bold block ${hotspotTemp > 95 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                      {hotspotTemp}°C
                    </strong>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${(hotspotTemp / 110) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block flex items-center justify-between">
                      <span>VRAM Temp</span>
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    </span>
                    <strong className="text-lg sm:text-xl font-bold block text-cyan-300">
                      {vramTemp}°C
                    </strong>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${(vramTemp / 105) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block flex items-center justify-between">
                      <span>Pobór Mocy TGP</span>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                    <strong className="text-lg sm:text-xl font-bold block text-amber-300">
                      {powerWatts}W
                    </strong>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${(powerWatts / 450) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 col-span-2">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>Wentylatory: <strong className="text-slate-200">{fanRpm} RPM</strong></span>
                      <span>Clock: <strong className="text-cyan-300">{coreClockMhz} MHz</strong></span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${(fanRpm / 3500) * 100}%` }}></div>
                    </div>
                  </div>

                </div>

              </div>

              {/* VRAM Console for MATS/ttest */}
              {(testPreset === 'mats' || testPreset === 'ttest') && (
                <div className="bg-black p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-1">
                    <span className="text-emerald-400 font-bold">
                      {testPreset === 'mats' ? 'Terminal Nvidia MATS / MODS VRAM' : 'Terminal AMD Radeon ttest VRAM Diagnostic'}
                    </span>
                    <span>{testPreset === 'mats' ? 'MODS v367.388' : 'ttest v2.4'}</span>
                  </div>

                  {matsErrors.length > 0 ? (
                    matsErrors.map((err, i) => (
                      <p key={i} className={err.includes('BŁĄD') ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {err}
                      </p>
                    ))
                  ) : (
                    <p className="text-slate-500">Skanowanie kanałów pamięci VRAM w toku...</p>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: HARDWARE AUTO-DETECTION & INSPECTOR */}
          {activeTab === 'hardware' && (
            <div className="space-y-5">
              
              {/* Profile Bar & Scan Button */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-1">
                  <Monitor className="w-5 h-5 text-cyan-400 shrink-0 hidden sm:block" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-slate-400">
                        Wybierz z Bazy 70+ Symulatorów i Systemów PC/Laptop:
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        Baza {allProfiles.length} Symulatorów
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Szukaj symulatora (np. 5090, Legion, AIO, VRM)..."
                          value={hardwareSearch}
                          onChange={(e) => setHardwareSearch(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:border-cyan-500 outline-none"
                        />
                      </div>

                      <select
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500 max-w-[280px] sm:max-w-[360px]"
                      >
                        {allProfiles
                          .filter((p) =>
                            hardwareSearch
                              ? p.name.toLowerCase().includes(hardwareSearch.toLowerCase()) ||
                                p.gpu.model.toLowerCase().includes(hardwareSearch.toLowerCase()) ||
                                p.cpu.model.toLowerCase().includes(hardwareSearch.toLowerCase())
                              : true
                          )
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunHardwareScan}
                  disabled={isScanningHardware}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-2 transition shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanningHardware ? 'animate-spin' : ''}`} />
                  <span>{isScanningHardware ? `Skanowanie (${scanProgress}%)...` : 'Uruchom Skaner HWiNFO'}</span>
                </button>
              </div>

              {/* Full Specs Inspector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. KARTA GRAFICZNA (GPU) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 border-b border-slate-800 pb-2">
                    <Flame className="w-4 h-4" />
                    <span>KARTA GRAFICZNA (GPU)</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p><span className="text-slate-400">Model GPU:</span> <strong className="text-white">{currentProfile.gpu.model}</strong></p>
                    <p><span className="text-slate-400">Pamięć VRAM:</span> <strong className="text-cyan-300">{currentProfile.gpu.vram}</strong></p>
                    <p><span className="text-slate-400">Magistrala:</span> <span className="text-slate-200">{currentProfile.gpu.busWidth}</span></p>
                    <p><span className="text-slate-400">Sterownik:</span> <span className="text-slate-300">{currentProfile.gpu.driver}</span></p>
                    <p><span className="text-slate-400">Wersja VBIOS:</span> <span className="text-slate-300">{currentProfile.gpu.vBios}</span></p>
                    <p>
                      <span className="text-slate-400">SAM / Resizable BAR:</span>{' '}
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {currentProfile.gpu.samEnabled ? 'WŁĄCZONY (Active)' : 'WYŁĄCZONY'}
                      </span>
                    </p>
                    <p><span className="text-slate-400">Limit Mocy TGP/TBP:</span> <span className="text-amber-300 font-semibold">{currentProfile.gpu.tgp}</span></p>
                  </div>
                </div>

                {/* 2. PROCESOR (CPU) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 border-b border-slate-800 pb-2">
                    <Cpu className="w-4 h-4" />
                    <span>PROCESOR (CPU)</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p><span className="text-slate-400">Model CPU:</span> <strong className="text-white">{currentProfile.cpu.model}</strong></p>
                    <p><span className="text-slate-400">Rdzenie / Wątki:</span> <strong className="text-purple-300">{currentProfile.cpu.coresThreads}</strong></p>
                    <p><span className="text-slate-400">Gniazdo (Socket):</span> <span className="text-slate-200">{currentProfile.cpu.socket}</span></p>
                    <p><span className="text-slate-400">Taktowanie Base/Boost:</span> <span className="text-slate-200">{currentProfile.cpu.frequency}</span></p>
                    <p><span className="text-slate-400">Pamięć L3 Cache:</span> <span className="text-emerald-300 font-bold">{currentProfile.cpu.l3Cache}</span></p>
                    <p><span className="text-slate-400">Limit Mocy TDP/PL2:</span> <span className="text-amber-300">{currentProfile.cpu.tdp}</span></p>
                    <p><span className="text-slate-400">Mikrokod CPU:</span> <span className="text-slate-400 font-mono">{currentProfile.cpu.microcode}</span></p>
                  </div>
                </div>

                {/* 3. PŁYTA GŁÓWNA & BIOS */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 border-b border-slate-800 pb-2">
                    <CircuitBoard className="w-4 h-4" />
                    <span>PŁYTA GŁÓWNA &amp; BIOS</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p><span className="text-slate-400">Producent &amp; Model:</span> <strong className="text-white">{currentProfile.motherboard.vendorModel}</strong></p>
                    <p><span className="text-slate-400">Chipset:</span> <span className="text-slate-200">{currentProfile.motherboard.chipset}</span></p>
                    <p><span className="text-slate-400">Wersja BIOS:</span> <span className="text-cyan-300 font-mono">{currentProfile.motherboard.biosVersion}</span></p>
                    <p><span className="text-slate-400">AGESA / EC Controller:</span> <span className="text-slate-300">{currentProfile.motherboard.agesaOrEC}</span></p>
                    <p><span className="text-slate-400">Sekcja Zasilania VRM:</span> <span className="text-amber-300">{currentProfile.motherboard.vrmPhases}</span></p>
                  </div>
                </div>

                {/* 4. PAMIĘĆ OPERACYJNA RAM */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
                    <Sliders className="w-4 h-4" />
                    <span>PAMIĘĆ OPERACYJNA RAM</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p><span className="text-slate-400">Pojemność &amp; Typ:</span> <strong className="text-white">{currentProfile.ram.typeSize}</strong></p>
                    <p><span className="text-slate-400">Taktowanie &amp; Timings:</span> <span className="text-emerald-300 font-bold">{currentProfile.ram.speedTimings}</span></p>
                    <p><span className="text-slate-400">Profil OC:</span> <span className="text-cyan-300">{currentProfile.ram.profile}</span></p>
                    <p><span className="text-slate-400">Tryb Kanałów:</span> <span className="text-slate-200">{currentProfile.ram.channels}</span></p>
                    <p><span className="text-slate-400">Producent Kostek DRAM:</span> <span className="text-slate-300">{currentProfile.ram.brand}</span></p>
                  </div>
                </div>

                {/* 5. DYSKI & NVMe SSD */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                    <HardDrive className="w-4 h-4" />
                    <span>DYSK M.2 NVMe SSD</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p><span className="text-slate-400">Model Dysku:</span> <strong className="text-white">{currentProfile.disk.model}</strong></p>
                    <p><span className="text-slate-400">Stan S.M.A.R.T.:</span> <span className="text-emerald-400 font-bold">{currentProfile.disk.health}</span></p>
                    <p><span className="text-slate-400">Odczyt / Zapis:</span> <span className="text-cyan-300 font-bold">{currentProfile.disk.speedReadWrite}</span></p>
                    <p><span className="text-slate-400">TBW Endurance:</span> <span className="text-slate-300">{currentProfile.disk.tbw}</span></p>
                    <p><span className="text-slate-400">Temperatura Kontrolera:</span> <span className="text-slate-200">{currentProfile.disk.temp}</span></p>
                  </div>
                </div>

                {/* 6. MATRYCA / EKRAN LAPTOPA */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 border-b border-slate-800 pb-2">
                    <Monitor className="w-4 h-4" />
                    <span>MATRYCA / EKRAN LAPTOPA (DISPLAY)</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p><span className="text-slate-400">Model Panelu / EDID:</span> <strong className="text-white">{currentProfile.display.panelModel}</strong></p>
                    <p><span className="text-slate-400">Rozdzielczość:</span> <span className="text-rose-300 font-bold">{currentProfile.display.resolution}</span></p>
                    <p><span className="text-slate-400">Częstotliwość Odświeżania:</span> <span className="text-emerald-400 font-bold">{currentProfile.display.refreshRate}</span></p>
                    <p><span className="text-slate-400">Typ Technologiczny:</span> <span className="text-slate-200">{currentProfile.display.panelType}</span></p>
                    <p><span className="text-slate-400">Linie eDP (DisplayPort):</span> <span className="text-slate-300">{currentProfile.display.edpLanes}</span></p>
                    <p><span className="text-slate-400">Kolory &amp; Jasność:</span> <span className="text-amber-300">{currentProfile.display.gamutBrightness}</span></p>
                    <p><span className="text-slate-400">Ściemnianie PWM:</span> <span className="text-slate-300">{currentProfile.display.pwmDimming}</span></p>
                  </div>
                </div>

              </div>

              {/* 7. ZASILANIE & BATERIA */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
                  <BatteryCharging className="w-4 h-4" />
                  <span>ZASILACZ AC &amp; STAN BATERII LAPTOPA</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Zasilacz AC:</span>
                    <strong className="text-white">{currentProfile.powerBattery.adapter}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pojemność Baterii:</span>
                    <strong className="text-cyan-300">{currentProfile.powerBattery.batteryCapacity}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Wear Level &amp; Cykle:</span>
                    <strong className="text-amber-300">{currentProfile.powerBattery.wearLevel} ({currentProfile.powerBattery.cycleCount})</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BAZA USTEREK */}
          {activeTab === 'faults' && (
            <div className="space-y-4">
              {GPU_FAULTS.map((fault) => (
                <div
                  key={fault.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                      <Flame className="w-4 h-4 text-purple-400" />
                      {fault.title}
                    </h3>

                    <button
                      onClick={() => {
                        onSendToChat(`Moja karta graficzna / laptop ma usterkę: ${fault.title}. Opisz szczegółowo jak zdiagnozować ten problem.`);
                        onClose();
                      }}
                      className="text-[11px] bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Zapytaj AI</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    <strong>Objawy:</strong> {fault.symptoms}
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Przyczyna:</strong> {fault.cause}
                  </p>
                  <p className="text-[11px] text-purple-300 font-medium bg-purple-950/40 p-2 rounded-lg border border-purple-900/40">
                    🔧 <strong>Rozwiązanie:</strong> {fault.solution}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>HWiNFO &amp; FurMark Live Suite — Zintegrowana Diagnostyka Serwisowa</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-xl font-semibold transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
