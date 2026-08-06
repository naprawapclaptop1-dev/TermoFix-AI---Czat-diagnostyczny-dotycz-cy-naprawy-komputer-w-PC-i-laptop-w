import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Flame,
  Crosshair,
  RotateCcw,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  Check,
  AlertTriangle,
  Layers,
  Thermometer,
  Cpu,
  Info,
  X,
  Plus,
  Eye,
  EyeOff,
  Zap,
  FileText,
  RotateCw,
  Move,
  Grid,
  ZoomIn,
  ZoomOut,
  Search,
  Tag,
  Scan,
  Laptop,
  Monitor,
  BookOpen,
  ExternalLink,
  Wrench,
  HelpCircle,
  FileCode,
  Clock,
  FileSpreadsheet,
  Columns
} from 'lucide-react';
import { ThermalData, ThermalPalette, SpotPoint } from '../types';
import { jsPDF } from 'jspdf';
import { ThermalSnapshotGallery, StoredThermalSnapshot } from './ThermalSnapshotGallery';

export interface MotherboardIcHeatzone {
  id: string;
  category: 'PWM' | 'MOSFET' | 'SUPER_IO' | 'VRAM' | 'PCH' | 'USBC_PD';
  name: string;
  designator: string;
  expectedIdleC: string;
  expectedNormalLoadC: string;
  thermalCeilingC: number;
  locationPct: { x: number; y: number; radiusPx: number };
  descriptionPl: string;
}

export const COMMON_MOTHERBOARD_ICS_HEATMAP: MotherboardIcHeatzone[] = [
  {
    id: 'ic-pwm',
    category: 'PWM',
    name: 'PWM Controller VCORE / Buck PWM',
    designator: 'PU101 / RT8206B / BQ24780S',
    expectedIdleC: '35°C - 45°C',
    expectedNormalLoadC: '50°C - 75°C',
    thermalCeilingC: 125,
    locationPct: { x: 24, y: 68, radiusPx: 45 },
    descriptionPl: 'Główna przetwornica PWM zasilania CPU/Systemu. Napięcia LDO 3.3V/5V Standby.'
  },
  {
    id: 'ic-mosfet',
    category: 'MOSFET',
    name: 'MOSFET Power Stage (DrMOS / High-Side)',
    designator: 'PQ202 / PQ203 (SiC634 / AON6504)',
    expectedIdleC: '38°C - 50°C',
    expectedNormalLoadC: '65°C - 90°C',
    thermalCeilingC: 150,
    locationPct: { x: 27, y: 28, radiusPx: 55 },
    descriptionPl: 'Klucze MOSFET faz zasilania VCORE 19V VIN. Strefa o najwyższej emisji cieplnej.'
  },
  {
    id: 'ic-superio',
    category: 'SUPER_IO',
    name: 'Embedded Super I/O Controller (KBC)',
    designator: 'IT8586E / MEC1653 / ENE KB9012',
    expectedIdleC: '30°C - 40°C',
    expectedNormalLoadC: '40°C - 55°C',
    thermalCeilingC: 85,
    locationPct: { x: 70, y: 74, radiusPx: 38 },
    descriptionPl: 'Procesor KBC zarządzający procedurą ACPI, przyciskiem Power, wentylatorami i klawiaturą.'
  },
  {
    id: 'ic-vram',
    category: 'VRAM',
    name: 'Pamięć VRAM GDDR6 / GDDR7 BGA',
    designator: 'U501-U508 (Micron / Samsung GDDR6)',
    expectedIdleC: '38°C - 48°C',
    expectedNormalLoadC: '65°C - 85°C',
    thermalCeilingC: 95,
    locationPct: { x: 35, y: 24, radiusPx: 50 },
    descriptionPl: 'Pamięć karty graficznej GDDR6. Temperatura powyżej 95°C grozi uszkodzeniem BGA.'
  },
  {
    id: 'ic-pch',
    category: 'PCH',
    name: 'Mostek PCH Southbridge / Hub PCIe',
    designator: 'Intel PCH / AMD FCH Hub',
    expectedIdleC: '42°C - 52°C',
    expectedNormalLoadC: '55°C - 75°C',
    thermalCeilingC: 100,
    locationPct: { x: 22, y: 65, radiusPx: 48 },
    descriptionPl: 'Mostek południowy PCH łączący magistralę USB, SATA, Audio, PCIe i KBC.'
  },
  {
    id: 'ic-usbc',
    category: 'USBC_PD',
    name: 'USB-C Power Delivery Controller',
    designator: 'CD3215 / CD3217 / TPS65987',
    expectedIdleC: '32°C - 42°C',
    expectedNormalLoadC: '45°C - 65°C',
    thermalCeilingC: 125,
    locationPct: { x: 18, y: 22, radiusPx: 40 },
    descriptionPl: 'Kontroler negocjacji profilu zasilania USB-C Power Delivery (5V -> 20V).'
  }
];

export interface AiVisionBoundingBox {
  id: string;
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  label: string;
  confidence: number;
  tempC: number;
  color: 'red' | 'amber' | 'cyan' | 'purple' | 'emerald';
  description: string;
}

export const INITIAL_AI_BOUNDING_BOXES: AiVisionBoundingBox[] = [
  {
    id: 'box-vrm',
    xPct: 28,
    yPct: 18,
    wPct: 22,
    hPct: 20,
    label: 'VRM / DrMOS',
    confidence: 98.6,
    tempC: 93.0,
    color: 'red',
    description: 'Sekcja zasilania procesora (Fazy DrMOS 105A)'
  },
  {
    id: 'box-cpu',
    xPct: 44,
    yPct: 38,
    wPct: 24,
    hPct: 24,
    label: 'CPU Core',
    confidence: 99.2,
    tempC: 88.5,
    color: 'red',
    description: 'Rdzeń procesora głównego VCORE'
  },
  {
    id: 'box-pch',
    xPct: 15,
    yPct: 54,
    wPct: 18,
    hPct: 18,
    label: 'PCH Chipset',
    confidence: 95.4,
    tempC: 72.0,
    color: 'amber',
    description: 'Mostek PCH / Hub USB PCIe'
  },
  {
    id: 'box-ram',
    xPct: 62,
    yPct: 26,
    wPct: 28,
    hPct: 20,
    label: 'RAM DDR5',
    confidence: 96.1,
    tempC: 45.0,
    color: 'emerald',
    description: 'Banki pamięci RAM DDR5 z obwodem PMIC'
  }
];

export interface CustomComponentLabel {
  id: string;
  xPct: number;
  yPct: number;
  text: string;
  tempC?: number;
  color?: 'amber' | 'cyan' | 'red' | 'purple' | 'emerald' | 'blue';
  note?: string;
  // Datasheet parameters looked up during Auto-Tag
  datasheetPartNumber?: string;
  vgsVoltage?: string;
  thermalCeilingC?: number;
  datasheetSummary?: string;
}

export interface ComponentLookupItem {
  id: string;
  partMarking: string;
  partName: string;
  componentRef: string;
  category: 'MOSFET' | 'CHARGER' | 'PWM_BUCK' | 'SUPER_IO' | 'CPU_GPU' | 'BIOS_SPI' | 'USB_PD' | 'VRAM';
  railVoltage: string;
  thermalLimitC: number;
  schematicRef: string;
  boardviewNet: string;
  commonFaults: string;
  repairTip: string;
  typicalResistance: string;
  xPct: number;
  yPct: number;
}

export const COMPONENTS_LOOKUP_DATABASE: ComponentLookupItem[] = [
  {
    id: 'item-sic634',
    partMarking: 'SiC634 / SiC634CD',
    partName: 'Vishay SiC634 60A DrMOS Power Stage',
    componentRef: 'PQ202 / PQ203 (VRM VCORE)',
    category: 'MOSFET',
    railVoltage: 'Vin: 19V / Vgs Gate: 4.5V–10V / Vcore: 0.8V–1.35V',
    thermalLimitC: 150,
    schematicRef: 'Lenovo Legion NM-C361 Boardview Str. 42 / ASUS ROG GA104',
    boardviewNet: 'VCC_MAIN_PHASE / VCORE_CPU',
    commonFaults: 'Zwarcie tranzystora MOSFET High-Side z linii 19V do masy. Zasilacz próbkuje lub gaśnie po wpięciu.',
    repairTip: 'Zmierz oporność linii 19V (VIN). Jeżeli wynosi ~0Ω, wylutuj MOSFET i sprawdź impulsy z kontrolera PWM (PWM_IN pin 3).',
    typicalResistance: 'Linia VIN > 100kΩ | BRAMKA Gate ~45kΩ | VCORE: ~5-15Ω',
    xPct: 27,
    yPct: 28
  },
  {
    id: 'item-aon6504',
    partMarking: 'AON6504 / AON6512',
    partName: 'Alpha & Omega AON6504 N-Channel MOSFET 30V 85A',
    componentRef: 'PQ201 / PQ204 (VRM High-Side)',
    category: 'MOSFET',
    railVoltage: 'Vin: 19V–20V / Vgs: 4.5V–10V (Vth 1.8V)',
    thermalLimitC: 150,
    schematicRef: 'Dell XPS 9500 Schemat Str. 28 / ASUS TUF FX506',
    boardviewNet: '+19VBAT_PWR',
    commonFaults: 'Przebicie złącza Dren-Źródło (D-S) pod obciążeniem termicznym, wyzwalające zabezpieczenie OCP zasilacza.',
    repairTip: 'Podmień na tranzystor N-channel min. 30V / 60A o niskim RDS(on) < 2.5mΩ (np. FDMS7672, AON6512).',
    typicalResistance: 'Dren-Masa > 200kΩ | Bramka-Masa > 50kΩ',
    xPct: 35,
    yPct: 22
  },
  {
    id: 'item-isl9240',
    partMarking: 'ISL9240 / ISL9240HI',
    partName: 'Intersil / Renesas ISL9240 Buck-Boost SMBus Battery Charger',
    componentRef: 'U7000 / ISL9240 (PPBUS_G3H Main Charger)',
    category: 'CHARGER',
    railVoltage: 'PPBUS_G3H: 12.6V / Vin USB-C: 20V / Vgs Gate: 5V',
    thermalLimitC: 125,
    schematicRef: 'Apple MacBook Pro A2141 / A1989 Schemat Str. 64',
    boardviewNet: 'PPBUS_G3H / PP3V3_G3H_RTC',
    commonFaults: 'Brak napięcia PPBUS_G3H (obecne tylko 5V na USB-C zamiast 20V). Przegrzewanie się układu w trybie standby.',
    repairTip: 'Sprawdź opornik pomiarowy R7020 (10Ω) oraz bramki tranzystorów Q7030/Q7040. Wymień ISL9240 gdy PPBUS < 12.6V.',
    typicalResistance: 'PPBUS_G3H > 100kΩ (bez zwarcia) | LDO 3.3V > 10kΩ',
    xPct: 38,
    yPct: 40
  },
  {
    id: 'item-tps51225',
    partMarking: 'TPS51225C / TPS51225',
    partName: 'Texas Instruments TPS51225C Dual Synchronous Buck PMIC',
    componentRef: 'PU101 / PU301 (Przetwornica 3.3V / 5V Standby)',
    category: 'PWM_BUCK',
    railVoltage: 'VIN: 19V / VREG3 (LDO): 3.3V / VREG5 (LDO): 5.0V',
    thermalLimitC: 125,
    schematicRef: 'Compal LA-E801P Schemat Str. 34 / Acer Nitro 5',
    boardviewNet: '+3V3_ALWAYS / +5V_ALWAYS',
    commonFaults: 'Uszkodzenie linii LDO 3.3V (pin 3) po uszkodzeniu KBC lub zalaniu. Płyta nie reaguje na włącznik.',
    repairTip: 'Zmierz obecność napięcia VREG3 (pin 3) oraz EN1/EN2. Jeśli VREG3 ma 0V przy podłączonym VIN 19V, sprawdź linię pod kątem zwarcia.',
    typicalResistance: 'Linia +3V3_ALWAYS > 5kΩ | +5V_ALWAYS > 10kΩ',
    xPct: 24,
    yPct: 68
  },
  {
    id: 'item-cd3215',
    partMarking: 'CD3215 / CD3215C00 / CD3217',
    partName: 'Texas Instruments CD3215 USB-C Power Delivery Transceiver',
    componentRef: 'U2800 / U3100 (USB-C PD Transceiver)',
    category: 'USB_PD',
    railVoltage: 'VBUS: 5V -> 20V Negotiation / VDDIO: 3.3V / LDO 1.1V',
    thermalLimitC: 125,
    schematicRef: 'MacBook Pro A1706 / A1708 Schemat Str. 22',
    boardviewNet: 'PP3V3_UPC_XA_LDO / USBC_VBUS',
    commonFaults: 'Zablokowane negocjacje 20V z ładowarki (pobór prądu stały 5V / 0.03A). Brak LDO 1.1V.',
    repairTip: 'Porównaj spadki napięć na pętli LDO wszystkich portów CD3215 (powinny mieć identyczne wartości ~0.480V na teście diody).',
    typicalResistance: 'LDO 3.3V > 15kΩ | LDO 1.1V > 2kΩ',
    xPct: 18,
    yPct: 22
  },
  {
    id: 'item-it8586e',
    partMarking: 'IT8586E / IT8528E / IT8227E',
    partName: 'ITE Tech IT8586E Embedded Super I/O Controller (KBC)',
    componentRef: 'UE1 / IT8586E (Kontroler KBC / EC)',
    category: 'SUPER_IO',
    railVoltage: 'VCC: 3.3V (VCC_EC) / LID_SW#: 3.3V / EC_ON: 3.3V',
    thermalLimitC: 85,
    schematicRef: 'Lenovo Legion Y530 / Y540 Schemat KBC Str. 38',
    boardviewNet: '+3V3_EC / EC_RST# / PM_SLP_S3#',
    commonFaults: 'Uszkodzenie pamięci eSPI/LPC wewnątrz KBC po spięciu na klawiaturze lub na linii 3.3V. Brak sygnału PWRON#.',
    repairTip: 'Zaprogramuj układ eSPI KBC dedykowanym programatorem (SVOD/Vertyanov) plikiem zintegrowanym z BIOS wsadem DMI.',
    typicalResistance: 'Linia VCC_EC (3.3V) > 1kΩ | Sygnały GPIO > 10kΩ',
    xPct: 70,
    yPct: 74
  },
  {
    id: 'item-winbond25q128',
    partMarking: '25Q128JVPQ / 25Q64JV / W25Q128',
    partName: 'Winbond 128Mb (16MB) Serial SPI Flash BIOS Memory',
    componentRef: 'UC2 / U6100 (SPI Flash Chip)',
    category: 'BIOS_SPI',
    railVoltage: 'VCC: 3.3V DC / SPI Clock: 104MHz (Logic 0-3.3V)',
    thermalLimitC: 85,
    schematicRef: 'Uniwersalny schemat magistrali SPI Flash SPI_CS#',
    boardviewNet: '+3V3_SPI / SPI_CLK_BIOS / SPI_MOSI',
    commonFaults: 'Uszkodzenie regionu ME Firmware / TXE, zapętlanie restartów po 30 sekundach, brak obrazu mimo pełnych napięć.',
    repairTip: 'Odczytaj oryginalny wsad programmerem CH341A / RT809F, przeprowadź czyszczenie ME-Region (Intel CSME System Tools) i wgraj ponownie.',
    typicalResistance: 'VCC (pin 8) do Masy > 10kΩ',
    xPct: 15,
    yPct: 78
  },
  {
    id: 'item-gddr6-vram',
    partMarking: 'H56C8H24AIR / K4Z80325BC',
    partName: 'SK Hynix / Samsung GDDR6 8Gb VRAM Memory BGA Chip',
    componentRef: 'U100-U108 (Bank Pamięci VRAM GDDR6)',
    category: 'VRAM',
    railVoltage: 'FBVDD / VDDQ: 1.35V / VDD: 1.8V',
    thermalLimitC: 95,
    schematicRef: 'ASUS ROG Strix RTX 3070 VRAM Schematic Str. 14',
    boardviewNet: 'NVVDD_VRAM / FBVDDQ_PHASE',
    commonFaults: 'Przegrzewanie VRAM (Hotspot > 105°C), artefakty na ekranie, błędy testu MATS / MODS w banku A0 / B1.',
    repairTip: 'Uruchom pętlę testową MATS (`./mats -e 10`). Odczytany bank z błędami (np. PASS 0 / FAIL A0) należy reballować lub wymienić.',
    typicalResistance: 'Linia VDDQ (1.35V): ~40-80Ω | VDD: ~100Ω',
    xPct: 35,
    yPct: 24
  },
  {
    id: 'item-bq24780s',
    partMarking: 'BQ24780S / BQ24781',
    partName: 'Texas Instruments BQ24780S Hybrid Power Boost Battery Charger',
    componentRef: 'PU102 (Przetwornica Ładowania Baterii)',
    category: 'CHARGER',
    railVoltage: 'ACIN: 2.6V / VCC: 19V / REGN 6.0V LDO / ACDRV: 25V',
    thermalLimitC: 125,
    schematicRef: 'Asus ROG Strix G531 / G731 Schemat Charger Str. 40',
    boardviewNet: 'ACSET_PWR / BATT_PWR_RAIL',
    commonFaults: 'Brak napięcia ACDRV (25V na bramkach tranzystorów wejściowych). Płyta działa na baterii, ale nie ładuje z zasilacza.',
    repairTip: 'Sprawdź napięcie REGN (pin 24) - musi mieć stabilne 6.0V LDO. Jeśli REGN = 0V, układ BQ24780S uszkodzony.',
    typicalResistance: 'REGN -> Masa > 20kΩ | ACDRV -> Masa > 100kΩ',
    xPct: 18,
    yPct: 82
  }
];

export const INITIAL_COMPONENT_LABELS: CustomComponentLabel[] = [
  { 
    id: 'lbl-vrm', 
    xPct: 24, 
    yPct: 20, 
    text: 'VRM DrMOS', 
    tempC: 94.8, 
    color: 'red', 
    note: 'Fazy zasilania VRM MOSFET VIN 19V',
    datasheetPartNumber: 'SiC634CD / AON6504',
    vgsVoltage: 'Vgs Gate: 5V–10V (In: 19V)',
    thermalCeilingC: 150,
    datasheetSummary: '60A PowerStage DrMOS | TjMax 150°C'
  },
  { 
    id: 'lbl-cpu', 
    xPct: 46, 
    yPct: 36, 
    text: 'CPU CORE', 
    tempC: 88.5, 
    color: 'red', 
    note: 'Główny procesor zasilania VCORE',
    datasheetPartNumber: 'Intel Core i9 VCORE',
    vgsVoltage: 'VID Vcore: 0.8V–1.35V',
    thermalCeilingC: 100,
    datasheetSummary: 'VCORE VRM Phase | TjMax 100°C'
  },
  { 
    id: 'lbl-pch', 
    xPct: 22, 
    yPct: 65, 
    text: 'PCH 3.3V/5V', 
    tempC: 72.0, 
    color: 'amber', 
    note: 'Mostek PCH przetwornica 3.3V/5V LDO',
    datasheetPartNumber: 'TPS51225C Buck',
    vgsVoltage: 'VREG3: 3.3V / VREG5: 5.0V',
    thermalCeilingC: 125,
    datasheetSummary: '3.3V/5V LDO Rail | TjMax 125°C'
  },
  { 
    id: 'lbl-ram', 
    xPct: 76, 
    yPct: 30, 
    text: 'RAM DDR5', 
    tempC: 45.0, 
    color: 'emerald', 
    note: 'Banki pamięci DDR5 / VRAM PMIC',
    datasheetPartNumber: 'SK Hynix DDR5 PMIC',
    vgsVoltage: 'VDD: 1.1V / VDDQ: 1.1V',
    thermalCeilingC: 95,
    datasheetSummary: 'DDR5 PMIC Controller | TjMax 95°C'
  },
  { 
    id: 'lbl-kbc', 
    xPct: 74, 
    yPct: 72, 
    text: 'KBC IT8586E', 
    tempC: 58.2, 
    color: 'purple', 
    note: 'Embedded Super I/O EC Controller',
    datasheetPartNumber: 'ITE IT8586E KBC',
    vgsVoltage: 'VCC_EC: 3.3V',
    thermalCeilingC: 85,
    datasheetSummary: 'EC Controller eSPI | TjMax 85°C'
  }
];

export const PRESET_COMPONENT_NAMES = [
  'CPU', 'PCH', 'VRM', 'GPU', 'MOSFET', 'RAM', 'KBC', 'CHARGER', 'BIOS', 'SSD', 'COIL', 'CAP', 'AUDIO', 'USB-C'
];

export interface OverheatingZone {
  id: string;
  name: string;
  componentRef: string;
  xPct: number; // 0 to 100 %
  yPct: number; // 0 to 100 %
  radiusPx: number;
  estTempC: number;
  severity: 'CRITICAL_ALARM' | 'WARNING' | 'NORMAL';
  descriptionPl: string;
  diagnosticAdvicePl: string;
}

export interface MotherboardThermalProfile {
  id: string;
  name: string;
  boardModel: string;
  zones: OverheatingZone[];
}

export interface BoardviewPin {
  pinNumber: string;
  netName: string;
  voltage: string;
  resistance: string;
  xPct: number;
  yPct: number;
}

export interface BoardviewComponent {
  ref: string;
  type: string; // MOSFET, IC, CAP, COIL, BGA, CONNECTOR
  description: string;
  xPct: number;
  yPct: number;
  widthPct: number;
  heightPct: number;
  pins: BoardviewPin[];
}

export interface BoardviewSchematicPreset {
  id: string;
  name: string;
  boardModel: string;
  revision: string;
  components: BoardviewComponent[];
  busLines: { name: string; x1: number; y1: number; x2: number; y2: number; color: string }[];
}

export const BOARDVIEW_SCHEMATIC_PRESETS: Record<string, BoardviewSchematicPreset> = {
  lenovo_legion: {
    id: 'lenovo_legion',
    name: 'Lenovo Legion Y540 Boardview (NM-C361 Rev 1.0)',
    boardModel: 'NM-C361 / NM-C531',
    revision: 'Rev 1.0 PCB Diagram',
    busLines: [
      { name: '+19VBAT Main Rail', x1: 10, y1: 28, x2: 90, y2: 28, color: '#ef4444' },
      { name: '+3V3_LDO Standby', x1: 24, y1: 15, x2: 24, y2: 85, color: '#3b82f6' },
      { name: '+5V_PWR', x1: 10, y1: 68, x2: 60, y2: 68, color: '#10b981' },
      { name: 'VCORE_CPU_PHASE', x1: 40, y1: 35, x2: 65, y2: 50, color: '#f59e0b' }
    ],
    components: [
      {
        ref: 'PQ202',
        type: 'MOSFET High-Side 19V',
        description: 'AON6504 N-Channel MOSFET 30V 85A',
        xPct: 27,
        yPct: 28,
        widthPct: 7,
        heightPct: 8,
        pins: [
          { pinNumber: '1-3', netName: 'VIN_19V', voltage: '19.2V DC', resistance: '480kΩ', xPct: 25, yPct: 26 },
          { pinNumber: '4', netName: 'GATE_PQ202', voltage: '24.5V DC (Boost)', resistance: '120kΩ', xPct: 29, yPct: 26 },
          { pinNumber: '5-8', netName: 'VCC_MAIN_PHASE', voltage: '19.2V DC', resistance: '0.001Ω [ZWARCIE!]', xPct: 27, yPct: 30 }
        ]
      },
      {
        ref: 'PQ203',
        type: 'MOSFET Low-Side 19V',
        description: 'AON6504 N-Channel MOSFET 30V 85A',
        xPct: 36,
        yPct: 28,
        widthPct: 7,
        heightPct: 8,
        pins: [
          { pinNumber: '1-3', netName: 'VCC_MAIN_PHASE', voltage: '19.2V DC', resistance: '0.001Ω', xPct: 34, yPct: 26 },
          { pinNumber: '4', netName: 'GATE_PQ203', voltage: '5.0V PWM', resistance: '45kΩ', xPct: 38, yPct: 26 },
          { pinNumber: '5-8', netName: 'GND', voltage: '0.0V DC', resistance: '0.000Ω', xPct: 36, yPct: 30 }
        ]
      },
      {
        ref: 'PU1',
        type: 'PWM Controller 3.3V/5V',
        description: 'RT8206B / BQ24780S Charge & Power IC',
        xPct: 24,
        yPct: 68,
        widthPct: 10,
        heightPct: 10,
        pins: [
          { pinNumber: 'Pin 3', netName: 'LDO_3V3', voltage: '3.3V DC', resistance: '12.4Ω [NISKA]', xPct: 21, yPct: 65 },
          { pinNumber: 'Pin 6', netName: 'EN_3V_5V', voltage: '3.2V DC', resistance: '100kΩ', xPct: 27, yPct: 65 },
          { pinNumber: 'Pin 20', netName: 'VCC_IN', voltage: '19.2V DC', resistance: '450kΩ', xPct: 24, yPct: 72 }
        ]
      },
      {
        ref: 'PL1',
        type: 'Cewka Zasilania 19V Input Inductor',
        description: 'Cewka ekranowana 1.0uH 15A',
        xPct: 15,
        yPct: 28,
        widthPct: 8,
        heightPct: 6,
        pins: [
          { pinNumber: '1', netName: 'DCIN_JACK', voltage: '19.5V DC', resistance: 'OL', xPct: 12, yPct: 28 },
          { pinNumber: '2', netName: 'VIN_19V', voltage: '19.2V DC', resistance: '480kΩ', xPct: 18, yPct: 28 }
        ]
      },
      {
        ref: 'IT8586E',
        type: 'KBC / Super I/O Controller',
        description: 'ITE IT8586E Embedded Controller 128-pin TQFP',
        xPct: 70,
        yPct: 74,
        widthPct: 14,
        heightPct: 14,
        pins: [
          { pinNumber: 'Pin 11', netName: 'VCC_EC_3V3', voltage: '3.3V DC', resistance: '15Ω', xPct: 65, yPct: 70 },
          { pinNumber: 'Pin 122', netName: 'PWR_SW#', voltage: '3.3V DC', resistance: '100kΩ', xPct: 75, yPct: 78 }
        ]
      }
    ]
  },
  asus_rog: {
    id: 'asus_rog',
    name: 'ASUS ROG Strix G513 Schematics Boardview',
    boardModel: 'G513-MAINBOARD (AMD Ryzen + Nvidia RTX)',
    revision: 'Rev 2.1 CAD Diagram',
    busLines: [
      { name: 'NVVDD GPU Core Rail', x1: 20, y1: 46, x2: 60, y2: 48, color: '#f59e0b' },
      { name: 'FBVDD VRAM GDDR6 Rail', x1: 30, y1: 24, x2: 45, y2: 24, color: '#ec4899' }
    ],
    components: [
      {
        ref: 'U501',
        type: 'VRAM GDDR6 Chip Bank A0',
        description: 'Micron D9WCW 2GB GDDR6 BGA',
        xPct: 35,
        yPct: 24,
        widthPct: 10,
        heightPct: 10,
        pins: [
          { pinNumber: 'Ball A1', netName: 'FBVDD_1V35', voltage: '1.35V DC', resistance: '65Ω', xPct: 32, yPct: 21 },
          { pinNumber: 'Ball C5', netName: 'VRAM_DQ0', voltage: 'Data Bus', resistance: '120Ω', xPct: 38, yPct: 27 }
        ]
      },
      {
        ref: 'U502',
        type: 'VRAM GDDR6 Chip Bank A1',
        description: 'Micron D9WCW 2GB GDDR6 BGA',
        xPct: 48,
        yPct: 24,
        widthPct: 10,
        heightPct: 10,
        pins: [
          { pinNumber: 'Ball A1', netName: 'FBVDD_1V35', voltage: '1.35V DC', resistance: '65Ω', xPct: 45, yPct: 21 }
        ]
      },
      {
        ref: 'AOZ5117',
        type: 'DrMOS Power Stage NVVDD',
        description: 'Alpha & Omega AOZ5117QI 60A Power Stage',
        xPct: 22,
        yPct: 46,
        widthPct: 8,
        heightPct: 8,
        pins: [
          { pinNumber: 'VIN', netName: '12V_PCIe', voltage: '12.1V DC', resistance: '1.2kΩ', xPct: 19, yPct: 44 },
          { pinNumber: 'VSWN', netName: 'NVVDD_PHASE_1', voltage: '0.85V PWM', resistance: '0.25Ω', xPct: 24, yPct: 48 }
        ]
      }
    ]
  },
  macbook_pro: {
    id: 'macbook_pro',
    name: 'MacBook Pro 15/16 Boardview (820-01041)',
    boardModel: 'Apple Logic Board 820-01041',
    revision: 'Apple Schematics 2019',
    busLines: [
      { name: 'PPBUS_G3H Main 12.6V', x1: 15, y1: 22, x2: 85, y2: 40, color: '#ef4444' },
      { name: 'PP3V3_G3H Standby', x1: 18, y1: 22, x2: 70, y2: 62, color: '#06b6d4' }
    ],
    components: [
      {
        ref: 'U2800',
        type: 'USB-C Power Delivery Controller',
        description: 'CD3215C00 Ace Type-C PD Chip BGA',
        xPct: 18,
        yPct: 22,
        widthPct: 8,
        heightPct: 8,
        pins: [
          { pinNumber: 'Ball E3', netName: 'PP20V_USBC', voltage: '5.1V [BRAK 20V!]', resistance: '0.002Ω [ZWARCIE!]', xPct: 15, yPct: 19 },
          { pinNumber: 'Ball F1', netName: 'LDO_1V1', voltage: '1.1V DC', resistance: '5Ω', xPct: 20, yPct: 24 }
        ]
      },
      {
        ref: 'U7000',
        type: 'ISL9240 Buck-Boost Charger',
        description: 'Renesas/Intersil ISL9240 PPBUS Controller',
        xPct: 38,
        yPct: 40,
        widthPct: 9,
        heightPct: 9,
        pins: [
          { pinNumber: 'Pin 1', netName: 'PPBUS_G3H', voltage: '12.6V DC', resistance: '120kΩ', xPct: 35, yPct: 38 }
        ]
      }
    ]
  },
  dell_xps: {
    id: 'dell_xps',
    name: 'Dell XPS 15 LA-E801P Boardview Diagram',
    boardModel: 'LA-E801P Rev 1.0',
    revision: 'Compal Schematics',
    busLines: [
      { name: '3.3V_ALW Standby', x1: 15, y1: 62, x2: 75, y2: 62, color: '#3b82f6' }
    ],
    components: [
      {
        ref: 'PU100',
        type: '3.3V/5V Standby IC',
        description: 'BQ24780S System Power',
        xPct: 22,
        yPct: 62,
        widthPct: 8,
        heightPct: 8,
        pins: [
          { pinNumber: 'Pin 3', netName: '3.3V_ALW', voltage: '1.2V [SPADEK!]', resistance: '1.5Ω', xPct: 20, yPct: 60 }
        ]
      }
    ]
  },
  atx_gpu_desktop: {
    id: 'atx_gpu_desktop',
    name: 'Uniwersalna Płyta ATX & GPU Power Boardview',
    boardModel: 'ATX VRM PCIe Power Layout',
    revision: 'Universal Layout v1',
    busLines: [
      { name: '12V_PCIe Header Rail', x1: 20, y1: 18, x2: 85, y2: 18, color: '#ef4444' }
    ],
    components: [
      {
        ref: 'J_12V_8PIN',
        type: 'Złącze Zasilania 8-Pin',
        description: 'EPS 12V High-Current Power Connector',
        xPct: 82,
        yPct: 18,
        widthPct: 12,
        heightPct: 8,
        pins: [
          { pinNumber: 'Pin 1-4', netName: '12V_EXT', voltage: '12.0V DC', resistance: 'OL', xPct: 80, yPct: 16 }
        ]
      }
    ]
  }
};

export interface PinoutPinData {
  pinNumber: string;
  name: string;
  type: 'power' | 'gnd' | 'signal';
  voltage: string;
  resistance: string;
  desc: string;
  diagnosticTip: string;
  xPct: number;
  yPct: number;
}

export interface ChipPackagePreset {
  id: string;
  name: string;
  packageType: string;
  chipCode: string;
  description: string;
  widthPct: number;
  heightPct: number;
  pins: PinoutPinData[];
}

export const CHIP_PINOUT_PRESETS: Record<string, ChipPackagePreset> = {
  soic8: {
    id: 'soic8',
    name: 'SOIC-8 / SOP-8 (MOSFET / SPI Flash / Regulatory)',
    packageType: 'SOIC-8 Dual Inline Lead Package',
    chipCode: 'W25Q64 / AON6504 / RT8206 (SOIC-8)',
    description: 'Standardowa obudowa 8-pinowa stosowana dla kości BIOS SPI Flash, tranzystorów MOSFET sekcji zasilania oraz układów przetwornic LDO.',
    widthPct: 40,
    heightPct: 50,
    pins: [
      { pinNumber: '1', name: 'CS# / SOURCE', type: 'signal', voltage: '3.3V / 19.0V', resistance: '0.450V / 100kΩ', desc: 'Chip Select (Low Active) lub Source MOSFET', diagnosticTip: 'W przypadku SPI BIOS: linia opuszczana do zera podczas odczytu. Jeśli jest stalowe 0V - sprawdzić rezystor podciągający.', xPct: 22, yPct: 25 },
      { pinNumber: '2', name: 'DO / SOURCE', type: 'signal', voltage: '3.3V / 19.0V', resistance: '0.480V', desc: 'Data Out (SPI MISO) lub Source MOSFET 19V', diagnosticTip: 'Sygnał wyjściowy danych BIOS SPI do KBC / PCH.', xPct: 22, yPct: 41 },
      { pinNumber: '3', name: 'WP# / SOURCE', type: 'power', voltage: '3.3V / 19.0V', resistance: '0.510V', desc: 'Write Protect (High = Write Enabled)', diagnosticTip: 'Napięcie +3.3V umożliwia zapis do pamięci flash.', xPct: 22, yPct: 58 },
      { pinNumber: '4', name: 'GND / GATE', type: 'gnd', voltage: '0.0V (GND)', resistance: '0.000V (Zwarcie do masy)', desc: 'Masa Główna 0V lub Brama Tranzystora MOSFET', diagnosticTip: 'Oporność do masy powinna wynosić dokładnie 0.0Ω. Jeśli w układzie MOSFET: sprawdź napięcie bramki z przetwornicy PWM.', xPct: 22, yPct: 75 },
      { pinNumber: '5', name: 'DI / DRAIN', type: 'signal', voltage: '3.3V / 19.0V VIN', resistance: '0.490V', desc: 'Data In (SPI MOSI) lub Drain MOSFET', diagnosticTip: 'Linia danych wejściowych z procesora do kości BIOS.', xPct: 78, yPct: 75 },
      { pinNumber: '6', name: 'CLK / DRAIN', type: 'signal', voltage: '1.6V AC / 19.0V VIN', resistance: '0.460V', desc: 'Clock (Zegar SPI 33MHz - 104MHz)', diagnosticTip: 'Gdy komputer startuje, na tym pinie przebieg prostokątny musi być widoczny na oscyloskopie.', xPct: 78, yPct: 58 },
      { pinNumber: '7', name: 'HOLD# / DRAIN', type: 'power', voltage: '3.3V / 19.0V VIN', resistance: '0.520V', desc: 'Hold (High = Normal Operation)', diagnosticTip: 'Podciągnięte do +3.3V VCC przez rezystor 10kΩ.', xPct: 78, yPct: 41 },
      { pinNumber: '8', name: 'VCC / DRAIN', type: 'power', voltage: '+3.3V VCC / +19.0V VIN', resistance: '0.380V (Spadek Diodowy)', desc: 'Zasilanie Główne VCC Kości / Drain N-Channel', diagnosticTip: 'Brak +3.3V na Pin 8 oznacza brak zasilania Standby LDO. Płyta nie reaguje na włącznik!', xPct: 78, yPct: 25 }
    ]
  },
  soic16: {
    id: 'soic16',
    name: 'SOIC-16 / QFN-16 (ISL9240 / BQ24780S Ładowarka & PWM)',
    packageType: 'QFN-16 / SOIC-16 Surface Mount',
    chipCode: 'ISL9240 / BQ24780S / RT8205',
    description: 'Układ sterownika ładowania baterii, przełączania zasilacza AC/BAT oraz generowania sygnału ACOK.',
    widthPct: 50,
    heightPct: 60,
    pins: [
      { pinNumber: '1', name: 'ACN', type: 'power', voltage: '19.0V VIN', resistance: '0.520V', desc: 'Sens Prądu Wejściowego Zasilacza (-)', diagnosticTip: 'Mierzone na rezystorze pomiarowym PR202.', xPct: 20, yPct: 20 },
      { pinNumber: '2', name: 'ACP', type: 'power', voltage: '19.0V VIN', resistance: '0.520V', desc: 'Sens Prądu Wejściowego Zasilacza (+)', diagnosticTip: 'Mierzone przed rezystorem PR202.', xPct: 20, yPct: 32 },
      { pinNumber: '3', name: 'CMPOUT', type: 'signal', voltage: '1.2V', resistance: '0.610V', desc: 'Wyjście Kompensatora Prądowego', diagnosticTip: 'Sygnał sterowania pętlą sprzężenia.', xPct: 20, yPct: 44 },
      { pinNumber: '4', name: 'CMPIN', type: 'signal', voltage: '1.2V', resistance: '0.610V', desc: 'Wejście Kompensatora', diagnosticTip: 'Sprawdź kondensator w pętli do masy.', xPct: 20, yPct: 56 },
      { pinNumber: '5', name: 'ACOK', type: 'power', voltage: '3.3V HIGH', resistance: '0.450V', desc: 'Sygnał Gotowości Zasilacza (Adapter OK)', diagnosticTip: 'Sygnał podciągnięty do 3.3V. Jeśli jest 0V - KBC blokuje start zasilania!', xPct: 20, yPct: 68 },
      { pinNumber: '6', name: 'ACDET', type: 'signal', voltage: '2.6V DC', resistance: '0.540V', desc: 'Dzielnik Napięcia Detekcji Zasilacza', diagnosticTip: 'Obliczany z dzielnika 19V. Jeśli napięcie < 2.4V, chip wyłącza ładowanie.', xPct: 20, yPct: 80 },
      { pinNumber: '7', name: 'IOUT', type: 'signal', voltage: '0.8V', resistance: '0.600V', desc: 'Monitor Prądu Pobieranego przez System', diagnosticTip: 'Wyjście do analizy przez KBC.', xPct: 50, yPct: 85 },
      { pinNumber: '8', name: 'SDA', type: 'signal', voltage: '3.3V SMBus', resistance: '0.480V', desc: 'Magistrala Danych I2C/SMBus', diagnosticTip: 'Komunikacja z procesorem i baterią.', xPct: 80, yPct: 80 },
      { pinNumber: '9', name: 'SCL', type: 'signal', voltage: '3.3V SMBus', resistance: '0.480V', desc: 'Zegar Magistrali I2C/SMBus', diagnosticTip: 'Zegar komutacyjny SMBus.', xPct: 80, yPct: 68 },
      { pinNumber: '10', name: 'ILIM', type: 'signal', voltage: '1.5V', resistance: '0.580V', desc: 'Limit Prądu Zasilacza', diagnosticTip: 'Ustawiany dzielnikiem rezystorowym.', xPct: 80, yPct: 56 },
      { pinNumber: '11', name: 'BATDRV', type: 'signal', voltage: '6.0V / 19V', resistance: '0.650V', desc: 'Sterowanie Bramką MOSFET Baterii', diagnosticTip: 'Przełącza zasilanie z baterii na zasilacz.', xPct: 80, yPct: 44 },
      { pinNumber: '12', name: 'SRN', type: 'power', voltage: '11.1V BAT', resistance: '0.500V', desc: 'Sens Prądu Baterii (-)', diagnosticTip: 'Linia pomiarowa do pakietu Li-Ion.', xPct: 80, yPct: 32 },
      { pinNumber: '13', name: 'SRP', type: 'power', voltage: '11.1V BAT', resistance: '0.500V', desc: 'Sens Prądu Baterii (+)', diagnosticTip: 'Linia pomiarowa dodatnia.', xPct: 80, yPct: 20 },
      { pinNumber: '14', name: 'GND', type: 'gnd', voltage: '0.0V Masa', resistance: '0.000V (GND Pad)', desc: 'Masa Centralna (Exposed Pad)', diagnosticTip: 'Wymaga pewnego połączenia lutowniczego z masą PCB.', xPct: 50, yPct: 50 },
      { pinNumber: '15', name: 'REGN', type: 'power', voltage: '+6.0V LDO', resistance: '0.390V', desc: 'LDO Wewnętrzne Stabilizatora Przetwornicy', diagnosticTip: 'Brak +6.0V przy obecnym 19V na Pin 16 oznacza uszkodzenie sterownika BQ/ISL!', xPct: 50, yPct: 15 },
      { pinNumber: '16', name: 'VCC', type: 'power', voltage: '+19.0V VIN', resistance: '0.420V', desc: 'Główne Zasilanie Wejściowe Przetwornicy', diagnosticTip: 'Sprawdź rezystor zasilający 10Ω i diodę zabezpieczającą.', xPct: 35, yPct: 15 }
    ]
  },
  tqfp128: {
    id: 'tqfp128',
    name: 'TQFP-128 / QFP-128 (KBC IT8586E / ENE KB9012 / MEC1653)',
    packageType: 'TQFP-128 Quad Flat Package',
    chipCode: 'IT8586E / KB9022Q / MEC1653',
    description: 'Embedded Controller (KBC/EC) – serce zarządzania zasilaniem, klawiaturą, wentylatorami i procedurą ACPI w laptopie.',
    widthPct: 60,
    heightPct: 60,
    pins: [
      { pinNumber: 'Pin 2', name: 'VCC_KBC', type: 'power', voltage: '+3.3V Standby', resistance: '0.380V', desc: 'Zasilanie KBC ze stabilizatora 3.3V LDO', diagnosticTip: 'Wymagane do działania KBC przed włączeniem przycisku Power.', xPct: 15, yPct: 20 },
      { pinNumber: 'Pin 11', name: 'EC_ON', type: 'power', voltage: '+3.3V HIGH', resistance: '0.420V', desc: 'Sygnał Włączenia Przetwornic Głównych 3V/5V', diagnosticTip: 'Generowane przez KBC po wykryciu prawidłowego zasilacza.', xPct: 15, yPct: 40 },
      { pinNumber: 'Pin 19', name: 'LID_SW#', type: 'signal', voltage: '+3.3V HIGH', resistance: '0.510V', desc: 'Sygnał Czujnika Halagrona Klapy Ekranu', diagnosticTip: 'Jeśli ma 0V - laptop myśli że klapa jest zamknięta i nie włączy obrazu!', xPct: 15, yPct: 60 },
      { pinNumber: 'Pin 26', name: 'EC_RESET#', type: 'signal', voltage: '+3.3V HIGH', resistance: '0.480V', desc: 'Reset Układu KBC', diagnosticTip: 'Stan wysoki 3.3V umożliwia pracę procesora KBC.', xPct: 15, yPct: 80 },
      { pinNumber: 'Pin 67', name: 'AD_ADP_ID', type: 'signal', voltage: '0.9V - 1.6V', resistance: '0.620V', desc: 'Pin Identyfikacji Mocy Zasilacza Dell/Lenovo', diagnosticTip: 'Brak tego napięcia powoduje komunikat "Unknown AC Adapter".', xPct: 50, yPct: 85 },
      { pinNumber: 'Pin 93', name: 'GND', type: 'gnd', voltage: '0.0V Masa', resistance: '0.000V', desc: 'Masa Główna KBC', diagnosticTip: 'Masa zasilania cyfrowego.', xPct: 85, yPct: 80 },
      { pinNumber: 'Pin 100', name: 'VCC3V', type: 'power', voltage: '+3.3V VCC', resistance: '0.380V', desc: 'Główne Zasilanie Rdzenia KBC', diagnosticTip: 'Częsta przyczyna zwarcia po zalaniu płynem!', xPct: 85, yPct: 60 },
      { pinNumber: 'Pin 112', name: 'KBC_PWRON', type: 'signal', voltage: '3.3V -> 0V Puls', resistance: '0.460V', desc: 'Sygnał Przycisku Power', diagnosticTip: 'Naciśnięcie włącznika zwierające do masy opuszcza pin na chwile do 0V.', xPct: 85, yPct: 40 },
      { pinNumber: 'Pin 125', name: 'RSMRST#', type: 'power', voltage: '+3.3V HIGH', resistance: '0.450V', desc: 'Resume Reset do Chipsetu PCH/Procesora', diagnosticTip: 'Ostatni sygnał KBC przed przekazaniem sterowania sekwencją zasilania do PCH.', xPct: 85, yPct: 20 }
    ]
  },
  bga180: {
    id: 'bga180',
    name: 'BGA-180 (GDDR6 VRAM Micron / Samsung / SK Hynix)',
    packageType: 'BGA-180 Ball Grid Array (180 Kul BGA)',
    chipCode: 'Micron D9WCW / K4Z80325BC GDDR6',
    description: 'Matryca kulkowa pamięci VRAM kart graficznych RTX 3080 / 4080 / RX 7900. Obejmuje szyny VDD, VDDQ, VPP oraz kanały DQ/DQS.',
    widthPct: 70,
    heightPct: 70,
    pins: [
      { pinNumber: 'A1, A14', name: 'GND_CORNER', type: 'gnd', voltage: '0.0V Masa', resistance: '0.000V (GND)', desc: 'Narożne Kule Masy Ekranującej BGA', diagnosticTip: 'Ułatwiają wyrównanie i poziomowanie układu podczas lutowania BGA.', xPct: 15, yPct: 15 },
      { pinNumber: 'T1, T14', name: 'GND_CORNER', type: 'gnd', voltage: '0.0V Masa', resistance: '0.000V (GND)', desc: 'Dolne Kule Masy Ekranującej', diagnosticTip: 'Sprawdź czy przy upadku karty nie doszło do wyrwania padów z laminatu.', xPct: 15, yPct: 85 },
      { pinNumber: 'B2, C3, M2', name: 'VDD', type: 'power', voltage: '+1.35V GDDR6', resistance: '0.120V / 30Ω - 80Ω', desc: 'Zasilanie Rdzenia Pamięci VRAM (+1.35V / 1.25V)', diagnosticTip: 'Zwarcie szyny VDD do masy (np. 0.2Ω) świadczy o uszkodzeniu kości VRAM lub GPU.', xPct: 35, yPct: 25 },
      { pinNumber: 'D2, E3, K2', name: 'VDDQ', type: 'power', voltage: '+1.35V VDDQ', resistance: '0.120V / 30Ω - 80Ω', desc: 'Zasilanie Bufora I/O Pamięci VRAM', diagnosticTip: 'Zasilane z tej samej przetwornicy co VDD lub osobnego LDO.', xPct: 65, yPct: 25 },
      { pinNumber: 'F2, G3', name: 'VPP', type: 'power', voltage: '+1.8V VPP Boot', resistance: '0.350V / 400Ω', desc: 'Zasilanie Pomocnicze Aktywacji Bramki VRAM (+1.8V)', diagnosticTip: 'Brak napięcia VPP 1.8V Uniemożliwia inicjalizację pamięci w testach MATS / ttest.', xPct: 50, yPct: 18 },
      { pinNumber: 'Pad Matrix Center', name: 'GND_THERMAL', type: 'gnd', voltage: '0.0V Masa', resistance: '0.000V', desc: 'Centralne Kule Masy Termicznej', diagnosticTip: 'Odprowadzają ciepło z jądra krzemu bezpośrednio do wewnętrznych miedzi PCB.', xPct: 50, yPct: 50 },
      { pinNumber: 'DQ0 - DQ31', name: 'DATA_BUS', type: 'signal', voltage: '0.6V - 1.2V High Speed', resistance: '0.320V / 350Ω', desc: 'Równoległa Szyna Danych VRAM do GPU', diagnosticTip: 'Brak przejścia na którejś linii DQ w skanie MODS/MATS wskazuje zimny lut pod tą kością.', xPct: 75, yPct: 65 }
    ]
  },
  bga1200: {
    id: 'bga1200',
    name: 'BGA-1200 (SoC / GPU Die Core & VRAM Interface Pad Grid)',
    packageType: 'Flip-Chip BGA Substrate Array',
    chipCode: 'NVIDIA AD103 / AMD Navi 31 / Intel Raptor Lake',
    description: 'Siatka padów pod procesor graficzny lub SoC. Układ szyn wysokoprądowych NVVDD, MSVDD, FBVDD oraz PCIe Gen4/Gen5.',
    widthPct: 75,
    heightPct: 75,
    pins: [
      { pinNumber: 'Central Matrix', name: 'NVVDD / VDD_CORE', type: 'power', voltage: '0.90V - 1.10V', resistance: '0.015V / 0.5Ω - 3.0Ω', desc: 'Główna Sekcja Zasilania Rdzenia Graficznego GPU', diagnosticTip: 'Bardzo niska oporność (np. 1.8 Ohm) jest NORMALNA dla nowoczesnych rdzeni z poborem 300W+! Należy odróżnić ją od zwarcia 0.00 Ohm.', xPct: 50, yPct: 40 },
      { pinNumber: 'Left Column', name: 'FBVDD / VDDQ', type: 'power', voltage: '1.35V VRAM Rail', resistance: '0.120V / 40Ω', desc: 'Kontroler Pamięci VRAM wewnątrz GPU', diagnosticTip: 'Zasilanie interfejsu pamięci w rdzeniu graficznym.', xPct: 20, yPct: 50 },
      { pinNumber: 'Outer Perimeter', name: 'GND_MATRIX', type: 'gnd', voltage: '0.0V Masa', resistance: '0.000V', desc: 'Masa Szumowa i Ekranująca PCIe', diagnosticTip: 'Chroni linie różnicowe przed zakłóceniami EM.', xPct: 80, yPct: 80 },
      { pinNumber: 'Bottom Row', name: 'PCIe_TX_RX', type: 'signal', voltage: '0.4V Różnicowe', resistance: '0.380V (Liniowe)', desc: 'Linie Nadawcze i Odbiorcze PCI Express Gen 4/5', diagnosticTip: 'Każda linia posiada pary kondensatorów sprzęgających 100nF na płycie głównej.', xPct: 50, yPct: 88 }
    ]
  }
};

export const MOTHERBOARD_HEATMAP_PROFILES: Record<string, MotherboardThermalProfile> = {
  lenovo_legion: {
    id: 'lenovo_legion',
    name: 'Lenovo Legion Y540 / NM-C361',
    boardModel: 'NM-C361 / NM-C531 (Intel 9th/10th Gen)',
    zones: [
      {
        id: 'lz-1',
        name: 'Główny Tranzystor MOSFET 19V VIN High-Side',
        componentRef: 'PQ202 / PQ203 (AON6504)',
        xPct: 27,
        yPct: 28,
        radiusPx: 55,
        estTempC: 96.5,
        severity: 'CRITICAL_ALARM',
        descriptionPl: 'Przebicie wewnętrzne Dren-Bramka tranzystora wejściowego zasilania 19V. Zasilacz serwisowy natychmiast przechodzi w tryb ograniczenia prądu (C.C. 0.00A / 19V).',
        diagnosticAdvicePl: 'Wykonaj test diodowy Dren-Źródło dla PQ202. Jeśli miernik wskazuje 0.001V, wlutuj zamiennik AON6504 / FDMC8884 oraz sprawdź oporność cewki PL1 do masy.'
      },
      {
        id: 'lz-2',
        name: 'Przetwornica Główna Standby 3.3V / 5V',
        componentRef: 'PU1 (RT8206A / BQ24780S)',
        xPct: 24,
        yPct: 68,
        radiusPx: 42,
        estTempC: 72.0,
        severity: 'WARNING',
        descriptionPl: 'Przegrzewanie linii LDO 3.3V w układzie PU1 wywołane zwarciem w procesorze KBC IT8586E lub BIOS.',
        diagnosticAdvicePl: 'Zmierz spadek napięcia w trybie diody na pinii 3.3V LDO (Pin 3). Oporność poniżej 15 Ohm oznacza uszkodzenie KBC lub kości BIOS SPI Flash.'
      },
      {
        id: 'lz-3',
        name: 'Rdzeń Procesora CPU Die & VRM VCORE',
        componentRef: 'CPU Intel Core i7 + DrMOS',
        xPct: 48,
        yPct: 42,
        radiusPx: 65,
        estTempC: 84.0,
        severity: 'NORMAL',
        descriptionPl: 'Główny obszar emisji ciepła rdzenia CPU pod obciążeniem OCCT/Prime95.',
        diagnosticAdvicePl: 'Prawidłowa oporność dla linii VCORE procesorów Intel wynosi od 1.5 Ohm do 12 Ohm. Wymaga podkładki znikofazowej PTM7950.'
      },
      {
        id: 'lz-4',
        name: 'Układ Sterowania KBC / Super I/O',
        componentRef: 'IT8586E / MEC1653',
        xPct: 70,
        yPct: 74,
        radiusPx: 35,
        estTempC: 48.5,
        severity: 'NORMAL',
        descriptionPl: 'Kontroler klawiatury, włącznika PWR_SW# oraz czujników temperatury wentylatora.',
        diagnosticAdvicePl: 'Sprawdź sygnał EC_RESET# (3.3V) oraz oscylację rezonatora kwarcowego 32.768 kHz.'
      }
    ]
  },
  asus_rog: {
    id: 'asus_rog',
    name: 'ASUS ROG Strix G513 / GA401',
    boardModel: 'G513-MAINBOARD (AMD Ryzen + Nvidia RTX)',
    zones: [
      {
        id: 'az-1',
        name: 'Kość Pamięci BGA VRAM Bank A0',
        componentRef: 'U501 / U502 (Micron GDDR6)',
        xPct: 35,
        yPct: 24,
        radiusPx: 50,
        estTempC: 92.0,
        severity: 'CRITICAL_ALARM',
        descriptionPl: 'Uszkodzona kość pamięci karty graficznej (Błąd Menedżera Urządzeń Kod 43 / Błędy bitowe w testach MATS).',
        diagnosticAdvicePl: 'Należy uruchomić test MATS komendą `./mats -e 20`. Podświetlony Bank A0 wymaga wymiany układu BGA na kulkach Sn63/Pb37 0.45mm.'
      },
      {
        id: 'az-2',
        name: 'Sekcja Zasilania GPU NVVDD DrMOS',
        componentRef: 'AOZ5117QI / FDMF6808N',
        xPct: 22,
        yPct: 46,
        radiusPx: 58,
        estTempC: 88.5,
        severity: 'WARNING',
        descriptionPl: 'Wysoka temperatura sekcji zasilania szyny NVVDD GPU pod obciążeniem FurMark.',
        diagnosticAdvicePl: 'Sprawdź stan termopadów na sekcji VRM (grubość 1.0mm) oraz obecność tętnień napięcia oscyloskopem na cewkach FBVDD.'
      },
      {
        id: 'az-3',
        name: 'Rdzeń Graficzny GPU GA104 / GA106',
        componentRef: 'Nvidia GeForce RTX 3060/3070',
        xPct: 52,
        yPct: 48,
        radiusPx: 70,
        estTempC: 79.0,
        severity: 'NORMAL',
        descriptionPl: 'Główny rdzeń krzemowy GPU w trybie pracy 3D.',
        diagnosticAdvicePl: 'Oporność prawidłowa linii NVVDD wynosi ok. 0.2 Ohm do 0.8 Ohm.'
      }
    ]
  },
  macbook_pro: {
    id: 'macbook_pro',
    name: 'MacBook Pro 15/16 (A1990 / 820-01041)',
    boardModel: 'Logic Board 820-01041 (USB-C Type-C)',
    zones: [
      {
        id: 'mz-1',
        name: 'Kontroler Portów USB-C Power Delivery',
        componentRef: 'U2800 / CD3215C00',
        xPct: 18,
        yPct: 22,
        radiusPx: 40,
        estTempC: 83.5,
        severity: 'CRITICAL_ALARM',
        descriptionPl: 'Przebicie układu CD3215 blokuje przełączenie zasilacza z 5V na 20V (Pobór prądu utknął na 5.1V / 0.03A).',
        diagnosticAdvicePl: 'Zmierz napięcie PP3V3_G3H (3.3V). Jeśli brak, sprawdź linię LDO_1V1 układu CD3215 pod kątem zwarcia do masy.'
      },
      {
        id: 'mz-2',
        name: 'Przetwornica Szyny Głównej PPBUS_G3H',
        componentRef: 'U7000 (ISL9240)',
        xPct: 38,
        yPct: 40,
        radiusPx: 45,
        estTempC: 76.0,
        severity: 'WARNING',
        descriptionPl: 'Niestabilne zasilanie głównej szyny PPBUS_G3H (Oczekiwane napięcie 12.6V).',
        diagnosticAdvicePl: 'Sprawdź rezystory pomiarowe R7021 / R7022 oraz bramki MOSFET Q7030.'
      },
      {
        id: 'mz-3',
        name: 'Układ Zabezpieczeń T2 / NAND Controller',
        componentRef: 'Apple T2 Security Chip',
        xPct: 65,
        yPct: 62,
        radiusPx: 38,
        estTempC: 55.0,
        severity: 'NORMAL',
        descriptionPl: 'Kontroler szyfrowania dysków NAND SSD oraz weryfikacji UEFI.',
        diagnosticAdvicePl: 'Wymaga sprawnego zasilania PP1V8_SLPS2D oraz PP0V9_SLPS2D.'
      }
    ]
  },
  dell_xps: {
    id: 'dell_xps',
    name: 'Dell XPS 15 9570 / LA-E801P',
    boardModel: 'LA-E801P / LA-G341P',
    zones: [
      {
        id: 'dz-1',
        name: 'Przetwornica Zasilania PCH / Standby 3.3V',
        componentRef: 'PU100 / PU700 (BQ24780S)',
        xPct: 22,
        yPct: 62,
        radiusPx: 45,
        estTempC: 89.0,
        severity: 'CRITICAL_ALARM',
        descriptionPl: 'Spadek oporności na szynie 3.3V_ALW wywołany przegrzewającym się mostkiem PCH.',
        diagnosticAdvicePl: 'Wykonaj próbę zwarciową zasilaczem laboratoryjnym na szynie 3.3V max 1.5V / 2A i obserwuj kamery termowizyjne.'
      },
      {
        id: 'dz-2',
        name: 'Tranzystory Sekcji Zasilania CPU VRM',
        componentRef: 'FDPC5030SG Power Stage',
        xPct: 50,
        yPct: 22,
        radiusPx: 52,
        estTempC: 93.0,
        severity: 'WARNING',
        descriptionPl: 'Przegrzewanie sekcji VRM wywołuje zjawisko CPU Thermal Throttling (taktowanie spada do 0.79 GHz).',
        diagnosticAdvicePl: 'Zamontuj dodatkowe miedziane radiatorowe radiatorki i wymień pastę termiczną na PTM7950.'
      }
    ]
  },
  atx_gpu_desktop: {
    id: 'atx_gpu_desktop',
    name: 'Uniwersalna Płyta ATX / Karta GPU Desktop',
    boardModel: 'Płyta ATX / Karta PCI-Express GPU',
    zones: [
      {
        id: 'gz-1',
        name: 'Główne Złącze Zasilania PCIe 12V High-Current',
        componentRef: 'Pin Header 8-Pin PCIe 12V',
        xPct: 82,
        yPct: 18,
        radiusPx: 42,
        estTempC: 87.0,
        severity: 'WARNING',
        descriptionPl: 'Wysoka rezystancja styku na stykach 12V powoduje stopienie wtyczki zasilającej.',
        diagnosticAdvicePl: 'Sprawdź stan zacisków wtyku 8-pin oraz spadek napięcia pod obciążeniem 200W.'
      },
      {
        id: 'gz-2',
        name: 'Fazy Zasilania DrMOS VRM 1-6',
        componentRef: 'Vishay SiC634 DrMOS 50A',
        xPct: 24,
        yPct: 40,
        radiusPx: 55,
        estTempC: 95.0,
        severity: 'CRITICAL_ALARM',
        descriptionPl: 'Uszkodzona jedna z faz zasilania wywołuje przebicie szyny 12V do linii rdzenia GPU (NVVDD).',
        diagnosticAdvicePl: 'Wypnij cewki i zmierz oporność diodową każdego układu DrMOS indywidualnie.'
      }
    ]
  }
};

export interface ThermalSnapshotRecord {
  id: string;
  timestampLabel: string;
  imageUrl: string;
  maxTemp: number;
  minTemp: number;
  deltaT: number;
  spotPoints: SpotPoint[];
  note: string;
}

interface ThermalCanvasViewerProps {
  imageUrl: string;
  thermalData: ThermalData;
  onImageChange: (newUrl: string, newThermalData?: Partial<ThermalData>) => void;
  onAnalyzeAI: () => void;
  isAnalyzing?: boolean;
  onSendToChat?: (prompt: string) => void;
}

export const ThermalCanvasViewer: React.FC<ThermalCanvasViewerProps> = ({
  imageUrl,
  thermalData,
  onImageChange,
  onAnalyzeAI,
  isAnalyzing = false,
  onSendToChat,
}) => {
  const [activePalette, setActivePalette] = useState<ThermalPalette>(thermalData.palette || 'ironbow');
  const [spotPoints, setSpotPoints] = useState<SpotPoint[]>(thermalData.spotPoints || []);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [maxTemp, setMaxTemp] = useState<number>(thermalData.maxTemp || 88.5);
  const [minTemp, setMinTemp] = useState<number>(thermalData.minTemp || 22.0);
  const [hotspotEnabled, setHotspotEnabled] = useState(true);

  // Thermal Snapshots Timeline Scrubber States
  const [thermalSnapshots, setThermalSnapshots] = useState<ThermalSnapshotRecord[]>([
    {
      id: 'snap-1',
      timestampLabel: 'T+00:00 (Rozruch / IDLE)',
      imageUrl: imageUrl,
      maxTemp: 31.5,
      minTemp: 21.0,
      deltaT: 10.5,
      spotPoints: [{ id: 'sp-1', x: 50, y: 50, tempC: 31.5, label: 'Stan Czuwania PCH' }],
      note: 'Stan początkowy po podłączeniu zasilania serwisowego'
    },
    {
      id: 'snap-2',
      timestampLabel: 'T+03:00 (POST / Rozruch CPU)',
      imageUrl: imageUrl,
      maxTemp: 58.2,
      minTemp: 22.0,
      deltaT: 36.2,
      spotPoints: [{ id: 'sp-2', x: 48, y: 48, tempC: 58.2, label: 'CPU Init Hotspot' }],
      note: 'Inicjalizacja BIOS i wykrycie pamięci RAM'
    },
    {
      id: 'snap-3',
      timestampLabel: 'T+08:30 (Stresstester / Obciążenie)',
      imageUrl: imageUrl,
      maxTemp: thermalData.maxTemp || 88.5,
      minTemp: thermalData.minTemp || 23.0,
      deltaT: Number(((thermalData.maxTemp || 88.5) - (thermalData.minTemp || 23.0)).toFixed(1)),
      spotPoints: thermalData.spotPoints?.length ? thermalData.spotPoints : [{ id: 'sp-3', x: 38, y: 35, tempC: 88.5, label: 'VRM MOSFET' }],
      note: 'Pełne obciążenie FurMark + Prime95: przegrzewanie sekcji VRM'
    }
  ]);
  const [activeSnapshotIndex, setActiveSnapshotIndex] = useState<number | null>(null);

  const handleCaptureSnapshot = () => {
    const nowStr = new Date().toLocaleTimeString('pl-PL');
    const newSnap: ThermalSnapshotRecord = {
      id: `snap-${Date.now()}`,
      timestampLabel: `Migawka ${thermalSnapshots.length + 1} (${nowStr})`,
      imageUrl: imageUrl,
      maxTemp: maxTemp,
      minTemp: minTemp,
      deltaT: Number((maxTemp - minTemp).toFixed(1)),
      spotPoints: [...spotPoints],
      note: 'Ręczny zrzut diagnostyczny z osi czasu'
    };
    setThermalSnapshots(prev => [...prev, newSnap]);
    setActiveSnapshotIndex(thermalSnapshots.length);
  };

  // Keyboard shortcut listener for 'S' or 's' to instantly trigger thermal snapshot capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleCaptureSnapshot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [thermalSnapshots, imageUrl, maxTemp, minTemp, spotPoints]);

  const activeSnapshot = activeSnapshotIndex !== null ? thermalSnapshots[activeSnapshotIndex] : null;
  const displayImageUrl = activeSnapshot ? activeSnapshot.imageUrl : imageUrl;
  const displayMaxTemp = activeSnapshot ? activeSnapshot.maxTemp : maxTemp;
  const displayMinTemp = activeSnapshot ? activeSnapshot.minTemp : minTemp;
  const displaySpotPoints = activeSnapshot ? activeSnapshot.spotPoints : spotPoints;

  // HEATMAP OVERLAY STATES
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.8);
  const [selectedModelKey, setSelectedModelKey] = useState<string>('lenovo_legion');
  const [activeZone, setActiveZone] = useState<OverheatingZone | null>(null);
  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [autoScanProgress, setAutoScanProgress] = useState(0);

  // HEATMAP LIVE OVER-IMAGE DYNAMIC OVERHEAT STATES
  const [isLiveOverheatActive, setIsLiveOverheatActive] = useState<boolean>(true);
  const [liveOverheatThreshold, setLiveOverheatThreshold] = useState<number>(70);

  // SCHEMATICS / BOARDVIEW OVERLAY STATES
  const [schematicsEnabled, setSchematicsEnabled] = useState(false);
  const [schematicsOpacity, setSchematicsOpacity] = useState(0.85);
  const [schematicsScale, setSchematicsScale] = useState(1.0); // 0.5 to 1.5
  const [schematicsRotate, setSchematicsRotate] = useState<number>(0); // 0, 90, 180, 270
  const [schematicsOffsetX, setSchematicsOffsetX] = useState(0); // -40 to 40 px
  const [schematicsOffsetY, setSchematicsOffsetY] = useState(0); // -40 to 40 px
  const [schematicsInvert, setSchematicsInvert] = useState(false);
  const [selectedSchematicKey, setSelectedSchematicKey] = useState<string>('lenovo_legion');
  const [selectedPin, setSelectedPin] = useState<BoardviewPin | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<BoardviewComponent | null>(null);

  // PINOUT OVERLAY STATES
  const [pinoutEnabled, setPinoutEnabled] = useState(false);
  const [pinoutOpacity, setPinoutOpacity] = useState(0.9);
  const [selectedChipPackage, setSelectedChipPackage] = useState<string>('soic8');
  const [pinoutFilter, setPinoutFilter] = useState<'all' | 'power' | 'gnd' | 'signal'>('all');
  const [selectedPinoutPin, setSelectedPinoutPin] = useState<PinoutPinData | null>(null);

  // DEVICE CONTEXT STATE (Laptop vs Desktop PC vs Server Workstation)
  const [deviceType, setDeviceType] = useState<'laptop' | 'desktop' | 'server'>('laptop');

  // AI VISION AUTO-SCANNER & BOUNDING BOXES STATES
  const [aiVisionEnabled, setAiVisionEnabled] = useState<boolean>(true);
  const [isScanningAiVision, setIsScanningAiVision] = useState<boolean>(false);
  const [aiBoundingBoxes, setAiBoundingBoxes] = useState<AiVisionBoundingBox[]>(INITIAL_AI_BOUNDING_BOXES);
  const [selectedAiBox, setSelectedAiBox] = useState<AiVisionBoundingBox | null>(null);

  // EDITABLE COMPONENT LABELS STATES (CPU, PCH, VRM, etc.)
  const [componentLabelsEnabled, setComponentLabelsEnabled] = useState(true);
  const [clickMode, setClickMode] = useState<'LABEL' | 'SPOT'>('LABEL');
  const [selectedPresetLabelText, setSelectedPresetLabelText] = useState<string>('CPU');
  const [labelOpacity, setLabelOpacity] = useState<number>(0.85);
  const [editingLabel, setEditingLabel] = useState<CustomComponentLabel | null>(null);

  // AUTO-TAG VISION STATES
  const [isAutoTagging, setIsAutoTagging] = useState<boolean>(false);
  const [autoTagToastMsg, setAutoTagToastMsg] = useState<string | null>(null);

  // COMPONENT & CHIP MARKING SEARCH LOOKUP STATES
  const [componentSearchQuery, setComponentSearchQuery] = useState<string>('');
  const [isComponentSearchOpen, setIsComponentSearchOpen] = useState<boolean>(false);
  const [componentCategoryFilter, setComponentCategoryFilter] = useState<string>('ALL');
  const [selectedLookupItem, setSelectedLookupItem] = useState<ComponentLookupItem | null>(null);

  // INDEXED DB THERMAL SNAPSHOT GALLERY STATE
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // COMPONENT HEATMAP OVERLAY IC SELECTION STATE
  const [selectedIcOverlay, setSelectedIcOverlay] = useState<MotherboardIcHeatzone | null>(COMMON_MOTHERBOARD_ICS_HEATMAP[1]);

  // CLEAN CANVAS MODE (Tryb Czystego Obrazu - Hides/Dims text overlays so center view is 100% unobstructed)
  const [cleanCanvasMode, setCleanCanvasMode] = useState<boolean>(false);

  // Client PDF Report Export Metadata
  const [exportClientName, setExportClientName] = useState<string>('Jan Kowalski');
  const [exportRmaNumber, setExportRmaNumber] = useState<string>(`RMA-${Math.floor(10000 + Math.random() * 90000)}`);
  const [exportTechnician, setExportTechnician] = useState<string>('Serwisant TermoFix AI');

  // DIGITAL ZOOM & PAN STATES (Lupa Cyfrowa PCB dla mikroskopowej inspekcji SMD / MOSFETów)
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 1.0x to 8.0x
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isPanModeActive, setIsPanModeActive] = useState<boolean>(false);
  const [crispPixels, setCrispPixels] = useState<boolean>(true); // Ostrość pikseli SMD
  const [compactLabelMode, setCompactLabelMode] = useState<boolean>(false); // Kompaktowe tagowanie bez wielkich bloków
  const [isSplitScreenActive, setIsSplitScreenActive] = useState<boolean>(false); // Golden Board Split-Screen Comparison Mode
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Mouse Wheel Zooming
  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoomLevel((prev) => {
      const next = parseFloat(Math.min(8.0, Math.max(1.0, prev + delta)).toFixed(2));
      if (next === 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse Pan Handlers
  const handleMouseDownPan = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1.0 || isPanModeActive || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMovePan = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    });
  };

  const handleMouseUpPan = () => {
    setIsPanning(false);
  };

  // Zoom directly to target component (e.g. from search or auto-tag)
  const zoomToTargetComponent = (xPct: number, yPct: number, targetZoom = 2.5) => {
    setZoomLevel(targetZoom);
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect();
      const offsetX = ((50 - xPct) / 100) * (rect.width / targetZoom) * targetZoom;
      const offsetY = ((50 - yPct) / 100) * (rect.height / targetZoom) * targetZoom;
      setPanOffset({ x: offsetX, y: offsetY });
    } else {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleResetZoomAndPan = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setIsPanModeActive(false);
  };

  // Realistic Localized Thermal Temperature Calculation based on motherboard zones and components
  const calculateRealisticLocalTemp = (xPct: number, yPct: number): number => {
    let highestZoneContrib = 0;
    let computedTemp = minTemp + 4; // Base PCB ambient floor (~32-35°C)

    // Check distance to PCB Overheating Zones
    currentProfile.zones.forEach((zone) => {
      const dx = xPct - zone.xPct;
      const dy = yPct - zone.yPct;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radiusPct = 20;
      if (dist < radiusPct) {
        const falloff = Math.pow(1 - dist / radiusPct, 1.6);
        const zoneVal = zone.estTempC * falloff + (minTemp + 8) * (1 - falloff);
        if (zoneVal > highestZoneContrib) {
          highestZoneContrib = zoneVal;
          computedTemp = Math.max(computedTemp, zoneVal);
        }
      }
    });

    // Check AI Bounding Boxes
    aiBoundingBoxes.forEach((box) => {
      const boxCenterX = box.xPct + box.wPct / 2;
      const boxCenterY = box.yPct + box.hPct / 2;
      const dx = xPct - boxCenterX;
      const dy = yPct - boxCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 18) {
        const factor = Math.max(0, 1 - dist / 18);
        computedTemp = Math.max(computedTemp, box.tempC * factor + (minTemp + 5) * (1 - factor));
      }
    });

    // If far from components, add subtle thermal spatial variation
    if (highestZoneContrib === 0 && computedTemp <= minTemp + 6) {
      const spatialVariation = (Math.sin(xPct * 0.15) + Math.cos(yPct * 0.15)) * 1.8;
      computedTemp = Math.min(maxTemp - 12, Math.max(minTemp, minTemp + 5 + Math.abs(spatialVariation)));
    }

    return parseFloat(Math.min(maxTemp, Math.max(minTemp, computedTemp)).toFixed(1));
  };

  const filteredComponentLookup = COMPONENTS_LOOKUP_DATABASE.filter((item) => {
    const matchesCategory =
      componentCategoryFilter === 'ALL' || item.category === componentCategoryFilter;
    const q = componentSearchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;
    return (
      matchesCategory &&
      (item.partMarking.toLowerCase().includes(q) ||
        item.partName.toLowerCase().includes(q) ||
        item.componentRef.toLowerCase().includes(q) ||
        item.railVoltage.toLowerCase().includes(q) ||
        item.schematicRef.toLowerCase().includes(q) ||
        item.boardviewNet.toLowerCase().includes(q) ||
        item.commonFaults.toLowerCase().includes(q) ||
        item.repairTip.toLowerCase().includes(q))
    );
  });

  const handleLocateComponentOnCanvas = (item: ComponentLookupItem) => {
    const newLabel: CustomComponentLabel = {
      id: `lbl-search-${Date.now()}`,
      xPct: item.xPct,
      yPct: item.yPct,
      text: item.componentRef.split(' ')[0] || item.partMarking.split(' ')[0],
      tempC: calculateRealisticLocalTemp(item.xPct, item.yPct),
      color: 'amber',
      note: item.commonFaults,
      datasheetPartNumber: item.partMarking,
      vgsVoltage: item.railVoltage.split('/')[1] || item.railVoltage,
      thermalCeilingC: item.thermalLimitC,
      datasheetSummary: `${item.partName} | TjMax: ${item.thermalLimitC}°C`
    };

    setComponentLabels((prev) => [newLabel, ...prev.filter((l) => l.text !== newLabel.text)]);
    setComponentLabelsEnabled(true);
    setCleanCanvasMode(false);
    setSelectedLookupItem(item);

    // Zoom & pan directly to component
    zoomToTargetComponent(item.xPct, item.yPct, 2.5);

    setAutoTagToastMsg(`Zalokowano układ ${item.partMarking}! Powiększenie Lupa 2.5x (x: ${item.xPct}%, y: ${item.yPct}%)`);
    setTimeout(() => setAutoTagToastMsg(null), 4000);
  };

  const [componentLabels, setComponentLabels] = useState<CustomComponentLabel[]>(() => {
    try {
      const saved = sessionStorage.getItem('thermal_component_labels_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('SessionStorage load error for component labels:', e);
    }
    return INITIAL_COMPONENT_LABELS;
  });

  // Save component labels to sessionStorage whenever modified
  useEffect(() => {
    try {
      sessionStorage.setItem('thermal_component_labels_session', JSON.stringify(componentLabels));
    } catch (e) {
      console.warn('SessionStorage save error for component labels:', e);
    }
  }, [componentLabels]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Current active thermal profile for the heatmap overlay
  const currentProfile = MOTHERBOARD_HEATMAP_PROFILES[selectedModelKey] || MOTHERBOARD_HEATMAP_PROFILES.lenovo_legion;
  const currentSchematic = BOARDVIEW_SCHEMATIC_PRESETS[selectedSchematicKey] || BOARDVIEW_SCHEMATIC_PRESETS.lenovo_legion;
  const currentPinoutPreset = CHIP_PINOUT_PRESETS[selectedChipPackage] || CHIP_PINOUT_PRESETS.soic8;

  // Sync state if props change and trigger auto-scan sequence
  useEffect(() => {
    if (thermalData.palette) setActivePalette(thermalData.palette);
    if (thermalData.spotPoints) setSpotPoints(thermalData.spotPoints);
    if (thermalData.maxTemp) setMaxTemp(thermalData.maxTemp);
    if (thermalData.minTemp) setMinTemp(thermalData.minTemp);

    // Run automatic scanning animation on image/preset change or initial load
    setIsAutoScanning(true);
    setAutoScanProgress(0);
    const interval = setInterval(() => {
      setAutoScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAutoScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [thermalData, imageUrl]);

  const handleRunAiVisionScan = () => {
    setIsScanningAiVision(true);
    setTimeout(() => {
      let generatedBoxes: AiVisionBoundingBox[] = [];

      if (deviceType === 'laptop') {
        generatedBoxes = [
          {
            id: `box-mosfet-${Date.now()}`,
            xPct: 22,
            yPct: 15,
            wPct: 20,
            hPct: 18,
            label: 'PQ202 / PQ203 MOSFET 19V',
            confidence: 99.1,
            tempC: 94.8,
            color: 'red',
            description: 'Główna linia wejściowa zasilania 19V / 20V USB-C PD'
          },
          {
            id: `box-vrm-${Date.now()}`,
            xPct: 36,
            yPct: 26,
            wPct: 24,
            hPct: 22,
            label: 'VRM DrMOS 8-Phase',
            confidence: 98.4,
            tempC: 93.0,
            color: 'red',
            description: 'Fazy zasilania procesora mobilnego'
          },
          {
            id: `box-cpu-${Date.now()}`,
            xPct: 48,
            yPct: 40,
            wPct: 26,
            hPct: 26,
            label: 'CPU Core BGA',
            confidence: 99.5,
            tempC: 88.5,
            color: 'red',
            description: 'Główny układ CPU połączony z rurkami cieplnymi'
          },
          {
            id: `box-pch-${Date.now()}`,
            xPct: 18,
            yPct: 58,
            wPct: 18,
            hPct: 18,
            label: 'PCH / Chipset LDO',
            confidence: 96.2,
            tempC: 72.0,
            color: 'amber',
            description: 'Mostek PCH i przetwornica 3.3V/5V ALW Standby'
          },
          {
            id: `box-kbc-${Date.now()}`,
            xPct: 72,
            yPct: 65,
            wPct: 16,
            hPct: 16,
            label: 'KBC IT8227E / EC',
            confidence: 94.8,
            tempC: 58.2,
            color: 'cyan',
            description: 'Embedded Controller sterowania włącznikiem i wentylatorami'
          }
        ];
      } else if (deviceType === 'desktop') {
        generatedBoxes = [
          {
            id: `box-eps12v-${Date.now()}`,
            xPct: 15,
            yPct: 10,
            wPct: 18,
            hPct: 16,
            label: 'Złącze 2x 8-Pin EPS 12V',
            confidence: 98.9,
            tempC: 48.0,
            color: 'emerald',
            description: 'Zasilanie 12V z zasilacza ATX3.0'
          },
          {
            id: `box-vrm-desktop-${Date.now()}`,
            xPct: 28,
            yPct: 18,
            wPct: 28,
            hPct: 24,
            label: 'Sekcja VRM 24+1 Faza 105A',
            confidence: 99.4,
            tempC: 78.5,
            color: 'amber',
            description: 'Solidne fazy zasilania z radiatorem aluminiowym'
          },
          {
            id: `box-socket-${Date.now()}`,
            xPct: 46,
            yPct: 32,
            wPct: 26,
            hPct: 26,
            label: 'Gniazdo CPU LGA1700 / AM5',
            confidence: 99.8,
            tempC: 68.2,
            color: 'cyan',
            description: 'Procesor stacjonarny PC z chłodzeniem wodnym AIO'
          },
          {
            id: `box-pch-desktop-${Date.now()}`,
            xPct: 68,
            yPct: 62,
            wPct: 20,
            hPct: 20,
            label: 'Chipset Z790 / X670',
            confidence: 97.5,
            tempC: 54.0,
            color: 'emerald',
            description: 'Mostek PCH Płyty Stacjonarnej PC'
          },
          {
            id: `box-pcie-${Date.now()}`,
            xPct: 30,
            yPct: 68,
            wPct: 35,
            hPct: 14,
            label: 'Gniazdo PCIe 5.0 x16 GPU',
            confidence: 96.8,
            tempC: 62.0,
            color: 'cyan',
            description: 'Główne gniazdo karty graficznej GPU'
          }
        ];
      } else {
        generatedBoxes = [
          {
            id: `box-socket1-${Date.now()}`,
            xPct: 25,
            yPct: 30,
            wPct: 22,
            hPct: 24,
            label: 'CPU Socket 1 (EPYC/Xeon)',
            confidence: 99.3,
            tempC: 74.0,
            color: 'amber',
            description: 'Procesor serwerowy Socket 1'
          },
          {
            id: `box-socket2-${Date.now()}`,
            xPct: 55,
            yPct: 30,
            wPct: 22,
            hPct: 24,
            label: 'CPU Socket 2 (EPYC/Xeon)',
            confidence: 99.1,
            tempC: 76.2,
            color: 'amber',
            description: 'Procesor serwerowy Socket 2'
          },
          {
            id: `box-vrm-server-${Date.now()}`,
            xPct: 20,
            yPct: 12,
            wPct: 60,
            hPct: 14,
            label: 'Serwerowa Sekcja Zasilania Dual VRM',
            confidence: 98.7,
            tempC: 84.0,
            color: 'red',
            description: 'Wielofazowe zasilacze serwerowe z wymuszonym obiegiem'
          }
        ];
      }

      setAiBoundingBoxes(generatedBoxes);

      // Auto-populate predicted heat signature labels directly on the canvas
      const newPredictedLabels: CustomComponentLabel[] = generatedBoxes.map((box, idx) => ({
        id: `lbl-pred-${idx}-${Date.now()}`,
        xPct: Math.round(box.xPct + box.wPct / 2),
        yPct: Math.round(box.yPct + box.hPct / 2),
        text: box.label.split(' ')[0], // Short component code e.g. VRM, CPU, PCH, MOSFET
        tempC: box.tempC,
        color: box.color === 'red' ? 'red' : box.color === 'amber' ? 'amber' : box.color === 'cyan' ? 'cyan' : 'emerald',
        note: `AI Heat Signature: ${box.description} [${box.confidence}% pewności]`
      }));

      setComponentLabels(newPredictedLabels);
      setComponentLabelsEnabled(true);
      setIsScanningAiVision(false);
      setAiVisionEnabled(true);
    }, 1200);
  };

  const handleAutoTagVision = () => {
    setIsAutoTagging(true);
    setAutoTagToastMsg('Skanowanie układu płyty & automatyczne pobieranie specyfikacji Datasheet...');

    setTimeout(() => {
      let generatedLabels: CustomComponentLabel[] = [];

      if (selectedModelKey === 'lenovo_legion') {
        generatedLabels = [
          { 
            id: `lbl-vrm-${Date.now()}`, 
            xPct: 27, 
            yPct: 28, 
            text: 'VRM', 
            tempC: 96.5, 
            color: 'red', 
            note: 'Główny tranzystor MOSFET 19V High-Side',
            datasheetPartNumber: 'SiC634 DrMOS 60A',
            vgsVoltage: 'Vgs: 4.5V–10V (Vth 1.8V)',
            thermalCeilingC: 150,
            datasheetSummary: 'PowerStage 60A | Vgs Gate 10V | TjMax: 150°C'
          },
          { 
            id: `lbl-pch-${Date.now()}`, 
            xPct: 24, 
            yPct: 68, 
            text: 'PCH', 
            tempC: 72.0, 
            color: 'amber', 
            note: 'Przetwornica 3.3V / 5V LDO Standby',
            datasheetPartNumber: 'TPS51225C Buck',
            vgsVoltage: 'Vgs Gate: 5V (Vin: 19V)',
            thermalCeilingC: 125,
            datasheetSummary: 'Dual Synchronous Buck | TjMax: 125°C'
          },
          { 
            id: `lbl-cpu-${Date.now()}`, 
            xPct: 48, 
            yPct: 42, 
            text: 'CPU', 
            tempC: 84.0, 
            color: 'red', 
            note: 'Rdzeń procesora Intel Core i7 VCORE',
            datasheetPartNumber: 'Intel i7-10750H VCORE',
            vgsVoltage: 'VID Vcore: 0.8V–1.35V',
            thermalCeilingC: 100,
            datasheetSummary: 'PL1 45W / PL2 90W | TjMax: 100°C'
          },
          { 
            id: `lbl-kbc-${Date.now()}`, 
            xPct: 70, 
            yPct: 74, 
            text: 'KBC', 
            tempC: 48.5, 
            color: 'purple', 
            note: 'IT8586E Super I/O Controller',
            datasheetPartNumber: 'IT8586E Embedded Controller',
            vgsVoltage: 'Vcc: 3.3V (Vth 1.2V)',
            thermalCeilingC: 85,
            datasheetSummary: 'LPC Bus Keyboard Controller | TjMax: 85°C'
          },
          { 
            id: `lbl-ram-${Date.now()}`, 
            xPct: 78, 
            yPct: 35, 
            text: 'RAM', 
            tempC: 42.0, 
            color: 'emerald', 
            note: 'Banki pamięci SO-DIMM DDR4',
            datasheetPartNumber: 'DDR4 SO-DIMM 1.2V',
            vgsVoltage: 'VDD: 1.2V / VDDQ: 1.2V',
            thermalCeilingC: 85,
            datasheetSummary: 'Memory Rail DDR4 | TjMax: 85°C'
          },
          { 
            id: `lbl-charger-${Date.now()}`, 
            xPct: 18, 
            yPct: 82, 
            text: 'CHARGER', 
            tempC: 55.0, 
            color: 'cyan', 
            note: 'Przetwornica BQ24780S BATT_PWR',
            datasheetPartNumber: 'BQ24780S Battery Charger',
            vgsVoltage: 'Vgs High-Side: 10V (ACFET)',
            thermalCeilingC: 125,
            datasheetSummary: 'Hybrid Power Boost Charger | TjMax: 125°C'
          }
        ];
      } else if (selectedModelKey === 'asus_rog') {
        generatedLabels = [
          { 
            id: `lbl-vram-${Date.now()}`, 
            xPct: 35, 
            yPct: 24, 
            text: 'VRAM', 
            tempC: 92.0, 
            color: 'red', 
            note: 'Kość pamięci BGA GDDR6 Bank A0',
            datasheetPartNumber: 'SK Hynix H56C8H24AIR GDDR6',
            vgsVoltage: 'VDD/VDDQ: 1.35V',
            thermalCeilingC: 95,
            datasheetSummary: 'GDDR6 14Gbps BGA | TjMax: 95°C'
          },
          { 
            id: `lbl-vrm-${Date.now()}`, 
            xPct: 22, 
            yPct: 46, 
            text: 'VRM', 
            tempC: 88.5, 
            color: 'amber', 
            note: 'Sekcja zasilania GPU NVVDD DrMOS',
            datasheetPartNumber: 'AOZ5311NQI DrMOS 50A',
            vgsVoltage: 'Vgs: 4.5V–10V (Vth 1.5V)',
            thermalCeilingC: 150,
            datasheetSummary: 'High-Current PowerStage | TjMax: 150°C'
          },
          { 
            id: `lbl-gpu-${Date.now()}`, 
            xPct: 52, 
            yPct: 48, 
            text: 'GPU', 
            tempC: 79.0, 
            color: 'red', 
            note: 'Rdzeń graficzny Nvidia GeForce RTX 3070',
            datasheetPartNumber: 'Nvidia GA104-300-A1',
            vgsVoltage: 'NVVDD: 0.75V–1.05V',
            thermalCeilingC: 87,
            datasheetSummary: 'Ampere GPU Core | Thermal Limit: 87°C'
          },
          { 
            id: `lbl-cpu-${Date.now()}`, 
            xPct: 72, 
            yPct: 35, 
            text: 'CPU', 
            tempC: 81.0, 
            color: 'amber', 
            note: 'Procesor AMD Ryzen 7 VCORE',
            datasheetPartNumber: 'AMD Ryzen 7 5800H',
            vgsVoltage: 'VDDCR VCORE: 0.9V–1.4V',
            thermalCeilingC: 105,
            datasheetSummary: 'Zen3 Octa-Core | TjMax Limit: 105°C'
          },
          { 
            id: `lbl-bios-${Date.now()}`, 
            xPct: 15, 
            yPct: 78, 
            text: 'BIOS', 
            tempC: 38.0, 
            color: 'cyan', 
            note: 'Kość Winbond 25Q128JVPQ SPI Flash',
            datasheetPartNumber: 'Winbond 25Q128JVPQ',
            vgsVoltage: 'Vcc: 3.3V (Logic 1.8V-3.3V)',
            thermalCeilingC: 85,
            datasheetSummary: '128Mb SPI Serial Flash | TjMax: 85°C'
          }
        ];
      } else if (selectedModelKey === 'macbook_pro') {
        generatedLabels = [
          { 
            id: `lbl-usbc-${Date.now()}`, 
            xPct: 18, 
            yPct: 22, 
            text: 'USB-C', 
            tempC: 83.5, 
            color: 'red', 
            note: 'CD3215C00 USB-C Power Delivery Controller',
            datasheetPartNumber: 'CD3215C00 Texas Inst.',
            vgsVoltage: 'Vbus: 20V / Gate: 10V',
            thermalCeilingC: 125,
            datasheetSummary: 'USB-PD Multiplexer | TjMax: 125°C'
          },
          { 
            id: `lbl-vrm-${Date.now()}`, 
            xPct: 38, 
            yPct: 40, 
            text: 'VRM', 
            tempC: 76.0, 
            color: 'amber', 
            note: 'Przetwornica PPBUS_G3H ISL9240',
            datasheetPartNumber: 'ISL9240 Intersil Buck-Boost',
            vgsVoltage: 'Vgs FETs: 5V (PPBUS: 12.6V)',
            thermalCeilingC: 125,
            datasheetSummary: 'PPBUS_G3H Main Charger | TjMax: 125°C'
          },
          { 
            id: `lbl-t2-${Date.now()}`, 
            xPct: 65, 
            yPct: 62, 
            text: 'T2', 
            tempC: 55.0, 
            color: 'purple', 
            note: 'Apple T2 Security Chip / NAND Controller',
            datasheetPartNumber: 'Apple T2 (APL1027)',
            vgsVoltage: 'Vcc: 1.8V / 0.9V Core',
            thermalCeilingC: 95,
            datasheetSummary: 'Security & SSD PMU | TjMax: 95°C'
          },
          { 
            id: `lbl-cpu-${Date.now()}`, 
            xPct: 50, 
            yPct: 50, 
            text: 'CPU', 
            tempC: 82.0, 
            color: 'red', 
            note: 'Procesor Intel Core i9 / M1 Board',
            datasheetPartNumber: 'Intel Core i9-9980HK',
            vgsVoltage: 'Vcore: 0.85V–1.3V',
            thermalCeilingC: 100,
            datasheetSummary: 'Eight-Core Mobile CPU | TjMax: 100°C'
          }
        ];
      } else if (selectedModelKey === 'dell_xps') {
        generatedLabels = [
          { 
            id: `lbl-pch-${Date.now()}`, 
            xPct: 22, 
            yPct: 62, 
            text: 'PCH', 
            tempC: 89.0, 
            color: 'red', 
            note: 'Przetwornica zasilania PCH / Standby 3.3V',
            datasheetPartNumber: 'TPS51285B Buck',
            vgsVoltage: 'Vgs Gate: 5V (Vin 19.5V)',
            thermalCeilingC: 125,
            datasheetSummary: '3.3V/5V Standby PMIC | TjMax: 125°C'
          },
          { 
            id: `lbl-vrm-${Date.now()}`, 
            xPct: 50, 
            yPct: 22, 
            text: 'VRM', 
            tempC: 93.0, 
            color: 'red', 
            note: 'Tranzystory sekcji zasilania CPU VRM DrMOS',
            datasheetPartNumber: 'FDMS7672 / Sic634 MOSFET',
            vgsVoltage: 'Vgs: 4.5V–10V (Max ±20V)',
            thermalCeilingC: 150,
            datasheetSummary: '30V N-Channel MOSFET | TjMax: 150°C'
          },
          { 
            id: `lbl-cpu-${Date.now()}`, 
            xPct: 52, 
            yPct: 48, 
            text: 'CPU', 
            tempC: 85.0, 
            color: 'amber', 
            note: 'Główny procesor zasilania VCORE',
            datasheetPartNumber: 'Intel Core i7-11800H',
            vgsVoltage: 'VID Vcore: 0.8V–1.35V',
            thermalCeilingC: 100,
            datasheetSummary: 'Tiger Lake 8-Core | TjMax Limit: 100°C'
          },
          { 
            id: `lbl-kbc-${Date.now()}`, 
            xPct: 75, 
            yPct: 72, 
            text: 'KBC', 
            tempC: 42.0, 
            color: 'purple', 
            note: 'MEC1653 Super I/O Controller',
            datasheetPartNumber: 'Microchip MEC1653 EC',
            vgsVoltage: 'Vcc: 3.3V (GPIO 3.3V)',
            thermalCeilingC: 85,
            datasheetSummary: 'Embedded Controller | TjMax: 85°C'
          }
        ];
      } else if (selectedModelKey === 'atx_gpu_desktop') {
        generatedLabels = [
          { 
            id: `lbl-pcie-${Date.now()}`, 
            xPct: 82, 
            yPct: 18, 
            text: 'PCIe', 
            tempC: 87.0, 
            color: 'amber', 
            note: 'Główne złącze zasilania PCIe 12V High-Current',
            datasheetPartNumber: '12VHPWR 16-Pin Connector',
            vgsVoltage: 'Vin: 12V (Max 55A Per Pin)',
            thermalCeilingC: 105,
            datasheetSummary: '600W PCIe Gen5 Power Rail | Limit: 105°C'
          },
          { 
            id: `lbl-vrm-${Date.now()}`, 
            xPct: 24, 
            yPct: 40, 
            text: 'VRM', 
            tempC: 95.0, 
            color: 'red', 
            note: 'Fazy zasilania DrMOS VRM 1-6 50A',
            datasheetPartNumber: 'Infineon TDA21472 70A',
            vgsVoltage: 'Vgs: 5V (PWM 3.3V)',
            thermalCeilingC: 150,
            datasheetSummary: '70A Smart Power Stage | TjMax: 150°C'
          },
          { 
            id: `lbl-gpu-${Date.now()}`, 
            xPct: 50, 
            yPct: 50, 
            text: 'GPU', 
            tempC: 88.0, 
            color: 'red', 
            note: 'Rdzeń graficzny GPU Desktop',
            datasheetPartNumber: 'Nvidia AD103-300 RTX 4080',
            vgsVoltage: 'NVVDD: 0.85V–1.1V',
            thermalCeilingC: 88,
            datasheetSummary: 'Ada Lovelace Core | Hotspot Ceiling: 88°C'
          },
          { 
            id: `lbl-vram-${Date.now()}`, 
            xPct: 38, 
            yPct: 38, 
            text: 'VRAM', 
            tempC: 82.0, 
            color: 'amber', 
            note: 'Banki pamięci GDDR6X',
            datasheetPartNumber: 'Micron GDDR6X 22Gbps',
            vgsVoltage: 'VDD/VDDQ: 1.35V–1.4V',
            thermalCeilingC: 105,
            datasheetSummary: 'GDDR6X Ultra-Speed BGA | TjMax: 105°C'
          }
        ];
      } else {
        generatedLabels = [
          { 
            id: `lbl-vrm-${Date.now()}`, 
            xPct: 30, 
            yPct: 25, 
            text: 'VRM', 
            tempC: 92.5, 
            color: 'red', 
            note: 'Auto-Pattern: Sekcja Zasilania VRM / High-Side',
            datasheetPartNumber: 'AON6512 / Sic634 MOSFET',
            vgsVoltage: 'Vgs: 4.5V–10V (Vth 1.8V)',
            thermalCeilingC: 150,
            datasheetSummary: '60A N-Channel MOSFET | TjMax: 150°C'
          },
          { 
            id: `lbl-cpu-${Date.now()}`, 
            xPct: 50, 
            yPct: 45, 
            text: 'CPU', 
            tempC: 86.0, 
            color: 'red', 
            note: 'Auto-Pattern: Procesor Główny CPU VCORE',
            datasheetPartNumber: 'Intel / AMD Main CPU VCORE',
            vgsVoltage: 'VID Vcore: 0.8V–1.35V',
            thermalCeilingC: 100,
            datasheetSummary: 'Processor Die VCORE | TjMax Limit: 100°C'
          },
          { 
            id: `lbl-pch-${Date.now()}`, 
            xPct: 25, 
            yPct: 65, 
            text: 'PCH', 
            tempC: 74.0, 
            color: 'amber', 
            note: 'Auto-Pattern: Mostek Południowy PCH Standby',
            datasheetPartNumber: 'TPS51225C Buck Controller',
            vgsVoltage: 'Vgs Gate: 5V (Vin 19V)',
            thermalCeilingC: 125,
            datasheetSummary: 'Standby LDO Rail | TjMax: 125°C'
          },
          { 
            id: `lbl-ram-${Date.now()}`, 
            xPct: 75, 
            yPct: 35, 
            text: 'RAM', 
            tempC: 44.0, 
            color: 'emerald', 
            note: 'Auto-Pattern: Szyna Pamięci Operacyjnej',
            datasheetPartNumber: 'DDR4/DDR5 SO-DIMM',
            vgsVoltage: 'VDD: 1.1V–1.2V',
            thermalCeilingC: 85,
            datasheetSummary: 'Memory Bus Controller | TjMax: 85°C'
          },
          { 
            id: `lbl-kbc-${Date.now()}`, 
            xPct: 70, 
            yPct: 75, 
            text: 'KBC', 
            tempC: 48.0, 
            color: 'purple', 
            note: 'Auto-Pattern: Kontroler KBC Super I/O',
            datasheetPartNumber: 'IT8586E / MEC1653 EC',
            vgsVoltage: 'Vcc: 3.3V Logic',
            thermalCeilingC: 85,
            datasheetSummary: 'Super I/O Controller | TjMax: 85°C'
          }
        ];
      }

      setComponentLabels(generatedLabels);
      setComponentLabelsEnabled(true);
      setIsAutoTagging(false);
      setAutoTagToastMsg(`Auto-Tag Datasheet: Pobrano specyfikację dla ${generatedLabels.length} elementów (napięcia Vgs gate & limit TjMax)!`);

      setTimeout(() => {
        setAutoTagToastMsg(null);
      }, 5000);
    }, 850);
  };

  const handleTriggerAutoScan = () => {
    setIsAutoScanning(true);
    setAutoScanProgress(0);
    setHeatmapEnabled(true);
    const interval = setInterval(() => {
      setAutoScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAutoScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Handle clicking on image to add component label or spot temperature measurement pin
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) return; // Prevent label placement when dragging pan
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const rawXPct = ((e.clientX - rect.left) / rect.width) * 100;
    const rawYPct = ((e.clientY - rect.top) / rect.height) * 100;

    const xPct = Math.round(Math.max(0, Math.min(100, rawXPct)));
    const yPct = Math.round(Math.max(0, Math.min(100, rawYPct)));

    const calculatedTemp = calculateRealisticLocalTemp(xPct, yPct);

    if (clickMode === 'LABEL') {
      const color: 'amber' | 'cyan' | 'red' | 'purple' | 'emerald' =
        calculatedTemp > 82 ? 'red' : calculatedTemp > 65 ? 'amber' : calculatedTemp > 45 ? 'cyan' : 'emerald';

      const newLabel: CustomComponentLabel = {
        id: `lbl-${Date.now()}`,
        xPct,
        yPct,
        text: selectedPresetLabelText || 'CPU',
        tempC: calculatedTemp,
        color,
        note: `Układ na pozycji (${xPct}%, ${yPct}%)`
      };

      setComponentLabels((prev) => [...prev, newLabel]);
      setEditingLabel(newLabel);
      setComponentLabelsEnabled(true);
    } else {
      const newPoint: SpotPoint = {
        id: `sp-${Date.now()}`,
        x: xPct,
        y: yPct,
        tempC: calculatedTemp,
        label: `Sp${spotPoints.length + 1}`
      };
      setSpotPoints([...spotPoints.slice(-4), newPoint]); // Keep last 5 points
    }
  };

  const handleAddPresetLabel = (presetName: string) => {
    const xPct = Math.floor(Math.random() * 50) + 25;
    const yPct = Math.floor(Math.random() * 50) + 25;
    const calculatedTemp = parseFloat((minTemp + (maxTemp - minTemp) * (0.4 + Math.random() * 0.5)).toFixed(1));

    const newLabel: CustomComponentLabel = {
      id: `lbl-${Date.now()}`,
      xPct,
      yPct,
      text: presetName,
      tempC: calculatedTemp,
      color: calculatedTemp > 80 ? 'red' : calculatedTemp > 60 ? 'amber' : 'cyan',
      note: `Element ${presetName}`
    };

    setComponentLabels((prev) => [...prev, newLabel]);
    setEditingLabel(newLabel);
    setComponentLabelsEnabled(true);
  };

  const handleResetComponentLabels = () => {
    setComponentLabels(INITIAL_COMPONENT_LABELS);
    setEditingLabel(null);
  };

  const handleClearAllComponentLabels = () => {
    setComponentLabels([]);
    setEditingLabel(null);
  };

  const handleResetSpotPoints = () => {
    setSpotPoints([]);
  };

  // Add pin directly from an overheating zone click
  const handleAddPinFromZone = (zone: OverheatingZone) => {
    const newPoint: SpotPoint = {
      id: `sp-zone-${Date.now()}`,
      x: zone.xPct,
      y: zone.yPct,
      tempC: zone.estTempC,
      label: zone.componentRef.split(' ')[0]
    };
    setSpotPoints([...spotPoints.slice(-4), newPoint]);
  };

  // Live Camera WebCam capture
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Nie udało się uzyskać dostępu do kamery. Upewnij się, że zezwolono na dostęp do kamery w przeglądarce.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onImageChange(dataUrl, {
        maxTemp: 75.0,
        minTemp: 23.0,
        spotPoints: [{ id: 'sp1', x: 50, y: 50, tempC: 75.0, label: 'Kamera na żywo' }]
      });
      stopCamera();
    }
  };

  // Export current annotated board view and diagnostic readings as formatted PDF summary for clients
  const handleExportClientPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          doc.addPage();
          y = margin;
          drawHeader(false);
        }
      };

      const drawHeader = (isFirstPage: boolean) => {
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, isFirstPage ? 32 : 18, 'F');
        doc.setFillColor(245, 158, 11); // amber-500
        doc.rect(0, isFirstPage ? 32 : 18, pageWidth, 1.5, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isFirstPage ? 13 : 10);
        doc.text('TERMOFIX AI - RAPORT DIAGNOSTYCZNY PŁYTY GŁÓWNEJ', margin, isFirstPage ? 14 : 11);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Zlecenie: ${exportRmaNumber} | Data: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL')}`, margin, isFirstPage ? 22 : 15);
        
        y = isFirstPage ? 40 : 25;
      };

      drawHeader(true);

      // Client & Service Info Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('DANE ZLECENIA SERWISOWEGO:', margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Klient: ${exportClientName}`, margin + 4, y + 13);
      doc.text(`Model Urządzenia: ${currentProfile.boardModel || selectedModelKey}`, margin + 4, y + 19);
      doc.text(`Diagnosta: ${exportTechnician}`, pageWidth / 2 + 5, y + 13);
      doc.text(`RMA: ${exportRmaNumber}`, pageWidth / 2 + 5, y + 19);

      y += 30;

      // Thermal Diagnostic Summary Section
      checkPageOverflow(45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('1. PODSUMOWANIE ANALIZY TERMOWIZYJNEJ', margin, y);
      y += 6;

      const maxT = thermalData.maxTemp || maxTemp;
      const minT = thermalData.minTemp || minTemp;
      const deltaT = thermalData.deltaT || (maxT - minT);
      const isCritical = maxT > 75;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('• Maksymalna Temperatura (Hotspot): ', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isCritical ? 220 : 30, isCritical ? 38 : 41, isCritical ? 38 : 59);
      doc.text(`${maxT}°C (${thermalData.maxSpotLabel || 'Główny Hotspot'})`, margin + 70, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text('• Minimalna Temperatura Tła: ', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`${minT}°C`, margin + 70, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.text('• Różnica Temperatur (Delta-T): ', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`${deltaT}°C`, margin + 70, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.text('• Status Diagnozy Termicznej: ', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isCritical ? 220 : 16, isCritical ? 38 : 185, isCritical ? 38 : 129);
      doc.text(isCritical ? 'KRYTYCZNY - Wykryto punkt przegrzewania / uszkodzenie SMD' : 'PRAWIDŁOWA - Brak przegrzewania', margin + 70, y);
      y += 12;

      // Capture and Draw Board View Image with Annotations
      checkPageOverflow(75);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('2. ANOTOWANY WIDOK PCB I ROZKŁAD TEMPERATUR', margin, y);
      y += 6;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;

      const canvasEl = document.createElement('canvas');
      canvasEl.width = 800;
      canvasEl.height = 500;
      const ctx = canvasEl.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 800, 500);
        ctx.drawImage(img, 0, 0, 800, 500);

        // Draw spot points
        spotPoints.forEach(sp => {
          const cx = (sp.x / 100) * 800;
          const cy = (sp.y / 100) * 500;
          ctx.beginPath();
          ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
          ctx.fillStyle = sp.color || '#ef4444';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`${sp.label}: ${sp.tempC}°C`, cx + 12, cy + 4);
        });

        const dataUrl = canvasEl.toDataURL('image/jpeg', 0.9);
        doc.addImage(dataUrl, 'JPEG', margin, y, contentWidth, 75);
      } else {
        doc.addImage(imageUrl, 'JPEG', margin, y, contentWidth, 75);
      }

      y += 82;

      // Spot Points Table
      if (spotPoints.length > 0) {
        checkPageOverflow(30 + spotPoints.length * 7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('3. TABELA POMIARÓW PUNKTOWYCH (SPOT POINTS)', margin, y);
        y += 6;

        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('ID / Nazwa Komponentu', margin + 4, y + 5);
        doc.text('Temperatura', margin + 85, y + 5);
        doc.text('Współrzędne (X, Y)', margin + 130, y + 5);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        spotPoints.forEach((sp, idx) => {
          doc.text(`${idx + 1}. ${sp.label}`, margin + 4, y + 5);
          doc.setFont('helvetica', 'bold');
          doc.text(`${sp.tempC}°C`, margin + 85, y + 5);
          doc.setFont('helvetica', 'normal');
          doc.text(`X: ${sp.x}%, Y: ${sp.y}%`, margin + 130, y + 5);
          
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, y + 7, margin + contentWidth, y + 7);
          y += 8;
        });
        y += 5;
      }

      // Overheating Zones / Hotspot Analysis
      if (currentProfile && currentProfile.zones && currentProfile.zones.length > 0) {
        checkPageOverflow(35);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text('4. WYKRYTE ZONY RYZYKA / HOTSPOTY', margin, y);
        y += 6;

        currentProfile.zones.forEach((zone, idx) => {
          checkPageOverflow(12);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text(`${idx + 1}. ${zone.componentRef} (${zone.estTempC}°C) - Ryzyko: ${zone.severity}`, margin + 4, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          doc.text(`Opis: ${zone.descriptionPl}`, margin + 4, y + 4);
          doc.setTextColor(15, 23, 42);
          y += 10;
        });
      }

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`TermoFix AI - Profesjonalna Diagnostyka Płyt Głównych | Raport Klienta | Strona ${i} z ${pageCount}`, margin, pageHeight - 10);
      }

      doc.save(`Raport_Termiczny_${exportRmaNumber}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Wystąpił błąd podczas generowania pliku PDF.');
    }
  };

  // Export all marked thermal points, coordinates, and timestamped readings as CSV for external diagnostic software
  const handleExportCsv = () => {
    try {
      const timestamp = new Date().toISOString();
      const rows: string[] = [];

      // Metadata Header
      rows.push(`"TERMOFIX AI - DIAGNOSTIC DATA EXPORT"`);
      rows.push(`"RMA","${exportRmaNumber}"`);
      rows.push(`"Klient","${exportClientName}"`);
      rows.push(`"Diagnosta","${exportTechnician}"`);
      rows.push(`"Model Płyty","${currentProfile.boardModel || selectedModelKey}"`);
      rows.push(`"Data Eksportu","${timestamp}"`);
      rows.push(``);

      // Section 1: Marked Thermal Points
      rows.push(`"--- SEKCJA 1: OZNACZONE PUNKTY TERMOWIZYJNE (SPOT POINTS) ---"`);
      rows.push(`"ID","Etykieta / Punkt","Temperatura (°C)","Współrzędna X (%)","Współrzędna Y (%)","Zasięg / Status"`);
      const pointsToExport = displaySpotPoints || thermalData.spotPoints || [];
      pointsToExport.forEach((sp, idx) => {
        rows.push(`"${sp.id || idx}","${(sp.label || 'Punkt pomiarowy').replace(/"/g, '""')}","${sp.tempC}","${sp.x}","${sp.y}","Aktywny"`);
      });
      rows.push(``);

      // Section 2: Component Labels & Datasheet Specs
      rows.push(`"--- SEKCJA 2: ETYKIETY KOMPONENTÓW I SPECYFIKACJA DATASHEET ---"`);
      rows.push(`"Oznaczenie (Part Marking)","Typ","Napięcie Vgs / V","Rezystancja / Rezystor","Max Tj Limit (°C)","Notatka"`);
      componentLabels.forEach((lbl) => {
        rows.push(`"${(lbl.partMarking || '').replace(/"/g, '""')}","${lbl.category || ''}","${lbl.vgsVoltage || ''}","${lbl.resistance || ''}","${lbl.thermalCeilingC || ''}","${(lbl.note || '').replace(/"/g, '""')}"`);
      });
      rows.push(``);

      // Section 3: Thermal Snapshots Timeline Scrubber Records
      rows.push(`"--- SEKCJA 3: OŚ CZASU MIGAWEK TERMICZnych (TIMELINE SNAPSHOTS) ---"`);
      rows.push(`"ID Migawki","Etykieta Czasowa","Temperatura Max (°C)","Temperatura Min (°C)","Delta T (°C)","Notatka / Opis"`);
      thermalSnapshots.forEach((snap) => {
        rows.push(`"${snap.id}","${(snap.timestampLabel || '').replace(/"/g, '""')}","${snap.maxTemp}","${snap.minTemp}","${snap.deltaT}","${(snap.note || '').replace(/"/g, '""')}"`);
      });

      const csvContent = '\uFEFF' + rows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `TermoFix_Raport_Diagnostyczny_${exportRmaNumber}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Wystąpił błąd podczas generowania pliku CSV.');
    }
  };

  // Upload Photo File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageChange(event.target.result as string, {
            maxTemp: 85.0,
            minTemp: 21.0,
            spotPoints: [{ id: 'sp1', x: 40, y: 40, tempC: 85.0, label: 'Wczytane zdjęcie' }]
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get palette CSS Filter
  const getPaletteStyle = (): React.CSSProperties => {
    switch (activePalette) {
      case 'ironbow':
        return { filter: 'contrast(1.2) saturate(1.8) hue-rotate(-20deg)' };
      case 'hotred':
        return { filter: 'sepia(1) saturate(5) hue-rotate(-50deg) contrast(1.3)' };
      case 'lava':
        return { filter: 'contrast(1.5) saturate(2.5) hue-rotate(15deg) brightness(0.95)' };
      case 'rainbow':
        return { filter: 'saturate(3) hue-rotate(120deg) contrast(1.3)' };
      case 'grayscale':
        return { filter: 'grayscale(1) contrast(1.4)' };
      default:
        return {};
    }
  };

  return (
    <div id="thermal-canvas-container" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      
      {/* Top Toolbar */}
      <div className="bg-slate-950 p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="bg-red-500/20 p-1.5 rounded-lg text-red-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-semibold text-slate-200 block leading-none">
              Podgląd Termowizyjny PCB
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Model: {currentProfile.boardModel}
            </span>
          </div>

          {/* Device Type Selector (Laptop vs PC vs Server) */}
          <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs ml-2">
            <button
              onClick={() => setDeviceType('laptop')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition flex items-center space-x-1 ${
                deviceType === 'laptop'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Aplikuje szablony termiczne dla laptopów (19V / 20V VIN, USB-C PD, Charger)"
            >
              <Laptop className="w-3 h-3" />
              <span>Laptop (19V)</span>
            </button>
            <button
              onClick={() => setDeviceType('desktop')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition flex items-center space-x-1 ${
                deviceType === 'desktop'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Aplikuje szablony termiczne dla płyt stacjonarnych PC (12V EPS, DrMOS, ATX)"
            >
              <Monitor className="w-3 h-3" />
              <span>PC Stacjonarny (12V)</span>
            </button>
            <button
              onClick={() => setDeviceType('server')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition flex items-center space-x-1 ${
                deviceType === 'server'
                  ? 'bg-purple-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Serwery i stacje robocze dual-socket"
            >
              <Cpu className="w-3 h-3" />
              <span>Serwer</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          
          {/* AI Vision Auto-Bounding Box Scanner Button */}
          <button
            id="btn-ai-vision-scan"
            onClick={handleRunAiVisionScan}
            disabled={isScanningAiVision}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border font-extrabold transition shadow-lg ${
              isScanningAiVision
                ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-purple-400 shadow-purple-950/60'
            }`}
            title="AIFotorepoznawanie: Skanuje obraz i automatycznie rysuje Bounding Boxy znanych układów (CPU, VRM, PCH, RAM)"
          >
            <Scan className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
            <span>{isScanningAiVision ? 'AI Analizuje Kadr...' : 'AI Vision Skaner (Auto-Box)'}</span>
          </button>

          {/* Instant Auto-Scan Hardware Button */}
          <button
            id="btn-auto-scan-hardware"
            onClick={handleTriggerAutoScan}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border font-bold transition shadow-lg ${
              isAutoScanning
                ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950/50'
            }`}
            title="Uruchom automatyczne skanowanie komponentów i profili termicznych"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" />
            <span>{isAutoScanning ? `Skanowanie ${autoScanProgress}%` : 'Skanuj Sprzęt (Auto)'}</span>
          </button>

          {/* Toggle Heatmap Overlay Button */}
          <button
            id="btn-toggle-heatmap"
            onClick={() => setHeatmapEnabled(!heatmapEnabled)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
              heatmapEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Włącz/Wyłącz nakładkę mapy ciepła typowych usterek płyty"
          >
            {heatmapEnabled ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{heatmapEnabled ? 'Mapa Ciepła (ON)' : 'Nakładka Ciepła'}</span>
          </button>

          {/* Toggle Schematics / Boardview Button */}
          <button
            id="btn-toggle-schematics"
            onClick={() => setSchematicsEnabled(!schematicsEnabled)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
              schematicsEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Włącz/Wyłącz dynamiczną przezroczystą nakładkę schematu i boardview na obraz termowizyjny"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>{schematicsEnabled ? 'Schemat Boardview (ON)' : 'Nakładka Schematu'}</span>
          </button>

          {/* Toggle Pinout Feature Button */}
          <button
            id="btn-toggle-pinout"
            onClick={() => setPinoutEnabled(!pinoutEnabled)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
              pinoutEnabled
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/40 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Włącz/Wyłącz nakładkę interaktywnego schematu wyprowadzeń (Pinout SOIC, BGA, TQFP, VRAM)"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>{pinoutEnabled ? 'Pinout (ON)' : 'Toggle Pinout'}</span>
          </button>

          {/* Toggle Component Labels Button */}
          <button
            id="btn-toggle-component-labels"
            onClick={() => setComponentLabelsEnabled(!componentLabelsEnabled)}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition ${
              componentLabelsEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Włącz/Wyłącz interaktywne etykiety elementów (CPU, PCH, VRM, RAM)"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>{componentLabelsEnabled ? `Etykiety (${componentLabels.length})` : 'Etykiety Elementów'}</span>
          </button>

          {/* Auto-Tag Vision Button */}
          <button
            id="btn-auto-tag-labels"
            onClick={handleAutoTagVision}
            disabled={isAutoTagging}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border font-black transition shadow-lg ${
              isAutoTagging
                ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 border-amber-300 shadow-amber-950/50'
            }`}
            title="Automatycznie analizuj wzorzec płyty i nanies trwałe etykiety (VRM, PCH, CPU, VRAM) na kanwie"
          >
            <Sparkles className={`w-3.5 h-3.5 text-slate-950 ${isAutoTagging ? 'animate-spin' : ''}`} />
            <span>{isAutoTagging ? 'Tagowanie...' : 'Auto-Tag'}</span>
          </button>

          {/* Export Client PDF Report Button */}
          <button
            id="btn-export-client-pdf"
            onClick={handleExportClientPdf}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs px-3 py-1.5 rounded-lg border border-red-400 font-bold shadow-lg shadow-red-950/60 transition"
            title="Eksportuj aktualny widok płyty wraz z odczytami temperatur i analizą jako sformatowany raport PDF dla klienta"
          >
            <FileText className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Eksportuj PDF Klienta</span>
          </button>

          {/* Export CSV Diagnostic Data Button */}
          <button
            id="btn-export-csv"
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg border border-teal-400 font-bold shadow-lg shadow-teal-950/60 transition"
            title="Eksportuj wszystkie oznaczone punkty termiczne, współrzędne, odczyty temperatur i historię osi czasu do pliku CSV dla zewnętrznego oprogramowania diagnostycznego"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
            <span>Eksportuj CSV (Dane)</span>
          </button>

          {/* Thermal Snapshot Gallery IndexedDB Modal Button */}
          <button
            id="btn-open-thermal-gallery"
            onClick={() => setIsGalleryOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg border border-purple-400 font-bold shadow-lg shadow-purple-950/60 transition"
            title="Otwórz galerię zapisanych obrazów termicznych w bazie danych IndexedDB"
          >
            <Layers className="w-3.5 h-3.5 text-purple-200" />
            <span>Galeria IndexedDB</span>
          </button>

          {/* File Upload Button */}
          <button
            id="btn-upload-photo"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Wczytaj Zdjęcie</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Live Camera Button */}
          <button
            id="btn-live-camera"
            onClick={isCameraActive ? stopCamera : startCamera}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition ${
              isCameraActive
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isCameraActive ? 'Anuluj Aparat' : 'Aparat na Żywo'}</span>
          </button>

          {/* Maximize Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs"
            title="Pełny Ekran"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Component & Chip Marking Search Lookup Sub-Header Bar */}
      <div className="bg-slate-950/90 px-3 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="relative flex-1 min-w-[260px] max-w-xl flex items-center">
          <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={componentSearchQuery}
            onChange={(e) => {
              setComponentSearchQuery(e.target.value);
              if (!isComponentSearchOpen) setIsComponentSearchOpen(true);
            }}
            onFocus={() => setIsComponentSearchOpen(true)}
            placeholder="Szukaj układu / part marking (np. SiC634, ISL9240, CD3215, TPS51225, PQ202, 19V)..."
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg pl-8 pr-8 py-1.5 text-xs text-amber-300 placeholder-slate-500 font-mono shadow-inner outline-none transition"
          />
          {componentSearchQuery && (
            <button
              onClick={() => {
                setComponentSearchQuery('');
              }}
              className="absolute right-2.5 text-slate-400 hover:text-white p-0.5 rounded"
              title="Wyczyść szukajkę"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Quick Database Toggle Button */}
          <button
            id="btn-open-chip-database"
            onClick={() => setIsComponentSearchOpen(!isComponentSearchOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-bold transition text-xs ${
              isComponentSearchOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow ring-1 ring-amber-500/50'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Otwiera bazę oznaczeń układów, schematów i porady naprawcze"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Baza Układów ({COMPONENTS_LOOKUP_DATABASE.length})</span>
          </button>

          {/* Clean Canvas Toggle Button (Tryb Czystego Obrazu) */}
          <button
            id="btn-toggle-clean-canvas"
            onClick={() => setCleanCanvasMode(!cleanCanvasMode)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-bold transition text-xs ${
              cleanCanvasMode
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg ring-2 ring-amber-400'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Tryb Czystego Obrazu: Tymczasowo ukrywa wszystkie nakładki tekstowe i etykiety dla 100% czytelności podczerwieni"
          >
            {cleanCanvasMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
            <span>{cleanCanvasMode ? 'Czysty Obraz (ON)' : 'Czysty Obraz'}</span>
          </button>
        </div>
      </div>

      {/* Component Labels Control Bar (Visible when Labels ON) */}
      {componentLabelsEnabled && (
        <div className="bg-slate-950/95 border-b border-amber-500/40 px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in fade-in duration-200">
          
          {/* Click Mode Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">Tryb Kliknięcia:</span>
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setClickMode('LABEL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                  clickMode === 'LABEL'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tag className="w-3 h-3" />
                <span>Etykieta Elementu</span>
              </button>
              <button
                onClick={() => setClickMode('SPOT')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                  clickMode === 'SPOT'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>Punkt Temp.</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Badge Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 max-w-full">
            <span className="text-slate-400 text-[11px] shrink-0 hidden md:inline">Szybka etykieta:</span>
            {['CPU', 'PCH', 'VRM', 'GPU', 'MOSFET', 'RAM', 'KBC', 'CHARGER', 'BIOS'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setSelectedPresetLabelText(preset);
                  setClickMode('LABEL');
                  handleAddPresetLabel(preset);
                }}
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border transition shrink-0 ${
                  selectedPresetLabelText === preset && clickMode === 'LABEL'
                    ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-500'
                }`}
              >
                + {preset}
              </button>
            ))}
          </div>

          {/* Label Opacity & Reset Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1 text-[11px]">
              <Sliders className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400 text-[10px] hidden sm:inline">Krycie:</span>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={labelOpacity}
                onChange={(e) => setLabelOpacity(parseFloat(e.target.value))}
                className="w-16 accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
              <span className="text-amber-400 font-mono text-[10px] w-6">{Math.round(labelOpacity * 100)}%</span>
            </div>

            <button
              onClick={handleAutoTagVision}
              disabled={isAutoTagging}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded transition flex items-center space-x-1 shadow disabled:opacity-50"
              title="Automatycznie nanies etykiety elementów (VRM, PCH, CPU) dla wybranej płyty"
            >
              <Sparkles className={`w-3 h-3 text-slate-950 ${isAutoTagging ? 'animate-spin' : ''}`} />
              <span>Auto-Tag</span>
            </button>

            <button
              onClick={handleResetComponentLabels}
              className="text-[10px] font-mono text-slate-400 hover:text-white underline px-1"
              title="Przywróć domyślne etykiety (CPU, PCH, VRM, RAM)"
            >
              Reset
            </button>

            {componentLabels.length > 0 && (
              <button
                onClick={handleClearAllComponentLabels}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 underline px-1"
                title="Usuń wszystkie etykiety"
              >
                Wyczyść ({componentLabels.length})
              </button>
            )}
          </div>

        </div>
      )}

      {/* Heatmap Overlay Customization Controls Bar (Visible when Heatmap ON) */}
      {heatmapEnabled && (
        <div className="bg-slate-950/90 border-b border-amber-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          
          {/* Selectable Component Heatmap Overlay IC Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Nakładka Strefy Układu IC:
            </span>
            <select
              value={selectedIcOverlay?.id || ''}
              onChange={(e) => {
                const found = COMMON_MOTHERBOARD_ICS_HEATMAP.find(ic => ic.id === e.target.value);
                setSelectedIcOverlay(found || null);
              }}
              className="bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400 shadow-inner"
            >
              <option value="">-- Wybierz Układ IC z Listy --</option>
              {COMMON_MOTHERBOARD_ICS_HEATMAP.map((ic) => (
                <option key={ic.id} value={ic.id}>
                  {ic.name} ({ic.designator})
                </option>
              ))}
            </select>
          </div>

          {/* Profile / Device Model Selector */}
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-medium hidden sm:inline">Model Płyty:</span>
            <select
              value={selectedModelKey}
              onChange={(e) => {
                setSelectedModelKey(e.target.value);
                setActiveZone(null);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
            >
              {Object.values(MOTHERBOARD_HEATMAP_PROFILES).map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>

          {/* Heatmap Live Over-Image (>70°C) Threshold Control */}
          <div className="flex items-center space-x-2 bg-red-950/60 border border-red-500/50 px-2.5 py-1 rounded-lg">
            <button
              onClick={() => setIsLiveOverheatActive(!isLiveOverheatActive)}
              className={`flex items-center space-x-1.5 font-bold text-[11px] px-2 py-0.5 rounded transition ${
                isLiveOverheatActive
                  ? 'bg-red-600 text-white shadow shadow-red-900/80 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
              title="Włącz/wyłącz dynamiczną nakładkę Heatmap Live Over-Image podświetlającą gorące punkty"
            >
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>Live Hotspot Over-Image</span>
            </button>
            <span className="text-slate-300 text-[10px] hidden sm:inline">Próg:</span>
            <input
              type="range"
              min="50"
              max="110"
              step="1"
              value={liveOverheatThreshold}
              onChange={(e) => setLiveOverheatThreshold(parseInt(e.target.value))}
              className="w-16 accent-red-500 bg-slate-900 h-1.5 rounded cursor-pointer"
              title="Próg temperatury wyzwalający podświetlenie w czasie rzeczywistym"
            />
            <span className="text-red-400 font-mono font-bold text-[11px] w-9">&gt;{liveOverheatThreshold}°C</span>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Przezroczystość:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
              className="w-20 sm:w-28 accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-amber-400 font-mono text-[11px] w-8">{Math.round(heatmapOpacity * 100)}%</span>
          </div>

          {/* Info Badge */}
          <div className="text-[11px] text-amber-400/90 flex items-center gap-1 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Zdefiniowane zony: {currentProfile.zones.length}</span>
          </div>

        </div>
      )}

      {/* Schematics / Boardview Customization Controls Bar (Visible when Schematics ON) */}
      {schematicsEnabled && (
        <div className="bg-slate-950/95 border-b border-cyan-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in fade-in duration-200">
          
          {/* Boardview Preset Selector */}
          <div className="flex items-center space-x-2">
            <Grid className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-medium hidden sm:inline">Schemat PDF:</span>
            <select
              value={selectedSchematicKey}
              onChange={(e) => {
                setSelectedSchematicKey(e.target.value);
                setSelectedPin(null);
                setSelectedComponent(null);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              {Object.values(BOARDVIEW_SCHEMATIC_PRESETS).map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Krycie:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={schematicsOpacity}
              onChange={(e) => setSchematicsOpacity(parseFloat(e.target.value))}
              className="w-16 sm:w-24 accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-cyan-400 font-mono text-[11px] w-7">{Math.round(schematicsOpacity * 100)}%</span>
          </div>

          {/* Scale / Zoom Slider */}
          <div className="flex items-center space-x-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Skala:</span>
            <input
              type="range"
              min="0.6"
              max="1.5"
              step="0.05"
              value={schematicsScale}
              onChange={(e) => setSchematicsScale(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-cyan-400 font-mono text-[11px] w-8">{(schematicsScale * 100).toFixed(0)}%</span>
          </div>

          {/* Rotation Toggle */}
          <button
            onClick={() => setSchematicsRotate((prev) => (prev + 90) % 360)}
            className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-1 rounded text-[11px] transition"
            title="Obróć schemat o 90 stopni"
          >
            <RotateCw className="w-3 h-3 text-cyan-400" />
            <span>{schematicsRotate}°</span>
          </button>

          {/* Alignment Fine Offsets (X / Y) */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px] hidden md:inline">Przesunięcie:</span>
            <div className="flex items-center space-x-1 font-mono text-[10px]">
              <span className="text-slate-400">X:</span>
              <input
                type="range"
                min="-30"
                max="30"
                value={schematicsOffsetX}
                onChange={(e) => setSchematicsOffsetX(parseInt(e.target.value))}
                className="w-12 accent-cyan-400 bg-slate-800 h-1 rounded"
              />
              <span className="text-slate-400 ml-1">Y:</span>
              <input
                type="range"
                min="-30"
                max="30"
                value={schematicsOffsetY}
                onChange={(e) => setSchematicsOffsetY(parseInt(e.target.value))}
                className="w-12 accent-cyan-400 bg-slate-800 h-1 rounded"
              />
            </div>

            <button
              onClick={() => {
                setSchematicsScale(1.0);
                setSchematicsRotate(0);
                setSchematicsOffsetX(0);
                setSchematicsOffsetY(0);
              }}
              className="text-[10px] text-slate-400 hover:text-white underline ml-1"
              title="Resetuj wyrównanie schematu"
            >
              Reset
            </button>
          </div>

        </div>
      )}

      {/* Pinout Overlay Settings Bar (Visible when Pinout ON) */}
      {pinoutEnabled && (
        <div className="bg-slate-950/95 border-b border-purple-500/40 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-slate-200 font-bold hidden sm:inline">Układ Scalony Pinout:</span>
            <select
              id="select-pinout-chip"
              value={selectedChipPackage}
              onChange={(e) => {
                setSelectedChipPackage(e.target.value);
                setSelectedPinoutPin(null);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-purple-300 font-mono font-bold focus:outline-none focus:border-purple-500"
            >
              {Object.entries(CHIP_PINOUT_PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Pokaż:</span>
            <button
              onClick={() => setPinoutFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition border ${
                pinoutFilter === 'all'
                  ? 'bg-purple-600 text-white border-purple-400 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setPinoutFilter('power')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition border flex items-center gap-1 ${
                pinoutFilter === 'power'
                  ? 'bg-red-600 text-white border-red-400 font-bold'
                  : 'bg-slate-900 text-red-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3 h-3 text-red-400" /> Napięcia
            </button>
            <button
              onClick={() => setPinoutFilter('gnd')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition border ${
                pinoutFilter === 'gnd'
                  ? 'bg-cyan-600 text-white border-cyan-400 font-bold'
                  : 'bg-slate-900 text-cyan-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Masa (GND)
            </button>
            <button
              onClick={() => setPinoutFilter('signal')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition border ${
                pinoutFilter === 'signal'
                  ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                  : 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              Sygnał
            </button>
          </div>

          {/* Opacity Slider */}
          <div className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Krycie:</span>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={pinoutOpacity}
              onChange={(e) => setPinoutOpacity(parseFloat(e.target.value))}
              className="w-16 sm:w-24 accent-purple-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-purple-300 font-mono text-[11px] w-7">{Math.round(pinoutOpacity * 100)}%</span>
          </div>
        </div>
      )}

      {/* DIGITAL ZOOM & INSPECTION HUD TOOLBAR (Lupa Cyfrowa SMD / MOSFET) */}
      <div className="bg-slate-950/95 px-3 py-1.5 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs z-30 select-none">
        {/* Zoom Level & Presets */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
            <ZoomIn className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Lupa PCB:</span>
            <span className="font-mono font-bold text-amber-300 w-12 text-center text-xs">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => {
                setZoomLevel((prev) => {
                  const next = parseFloat(Math.max(1.0, prev - 0.25).toFixed(2));
                  if (next === 1.0) setPanOffset({ x: 0, y: 0 });
                  return next;
                });
              }}
              className="p-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded disabled:opacity-30"
              disabled={zoomLevel <= 1.0}
              title="Pomniejsz (Zoom Out)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomLevel((prev) => parseFloat(Math.min(8.0, prev + 0.25).toFixed(2)))}
              className="p-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded disabled:opacity-30"
              disabled={zoomLevel >= 8.0}
              title="Powiększ (Zoom In)"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Preset Magnifications */}
          <div className="flex items-center space-x-1">
            {[
              { label: '1x', zoom: 1.0, tip: 'Widok Całej Płyty' },
              { label: '2x SMD', zoom: 2.0, tip: 'Inspekcja Kondensatorów SMD' },
              { label: '4x MOSFET', zoom: 4.0, tip: 'Inspekcja Tranzystorów DrMOS' },
              { label: '8x Pin', zoom: 8.0, tip: 'Inspekcja Nóżek Układów BGA/QFN' }
            ].map((pz) => (
              <button
                key={pz.label}
                onClick={() => {
                  setZoomLevel(pz.zoom);
                  if (pz.zoom === 1.0) setPanOffset({ x: 0, y: 0 });
                }}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition border ${
                  zoomLevel === pz.zoom
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow font-black'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
                title={pz.tip}
              >
                {pz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pan Mode, Crisp Pixels, Clean View & Compact Tags Toggles */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Pan Drag Mode Toggle */}
          <button
            onClick={() => setIsPanModeActive(!isPanModeActive)}
            className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border ${
              isPanModeActive || isPanning
                ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Włącz tryb przeciągania / przesuwania obrazu myszką"
          >
            <Move className="w-3 h-3" />
            <span className="hidden sm:inline">Przesuwaj</span>
          </button>

          {/* Reset View Button */}
          {(zoomLevel > 1.0 || panOffset.x !== 0 || panOffset.y !== 0) && (
            <button
              onClick={handleResetZoomAndPan}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition"
              title="Resetuj powiększenie i przesunięcie do 100%"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reset 1x</span>
            </button>
          )}

          {/* Crisp Pixel Rendering (SMD Microscope Sharpness) */}
          <button
            onClick={() => setCrispPixels(!crispPixels)}
            className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border ${
              crispPixels
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/60'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
            title="Tryb Ostrości Pikselowej (Mikroskop SMD) - Wyłącza rozmycie obrazu przy dużej lupie"
          >
            <Grid className="w-3 h-3 text-purple-400" />
            <span className="hidden md:inline">{crispPixels ? 'Mikroskop SMD (ON)' : 'Gładki'}</span>
          </button>

          {/* Compact Tags Toggle */}
          <button
            onClick={() => setCompactLabelMode(!compactLabelMode)}
            className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border ${
              compactLabelMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
            title="Kompaktowe Tagowanie - Ukrywa duże okienka pod etykietami, aby nie zasłaniać obrazu płyty"
          >
            <Tag className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">{compactLabelMode ? 'Tagi: Małe' : 'Tagi: Pełne'}</span>
          </button>

          {/* Golden Board Split-Screen Comparison Toggle */}
          <button
            onClick={() => setIsSplitScreenActive(!isSplitScreenActive)}
            className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border ${
              isSplitScreenActive
                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400 shadow animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Podwójny widok Split-Screen: Porównaj bieżący feed termiczny z referencyjnym wzorcem 'Golden Board'"
          >
            <Columns className="w-3 h-3 text-emerald-400" />
            <span className="hidden md:inline">{isSplitScreenActive ? 'Split-Screen (ON)' : 'Golden Board'}</span>
          </button>
        </div>
      </div>

      {/* Main Display Stage */}
      <div
        className={`relative bg-black flex items-center justify-center overflow-hidden cursor-crosshair select-none ${
          isFullScreen ? 'fixed inset-0 z-50 p-4 bg-black/95' : 'min-h-[360px] max-h-[520px]'
        }`}
        onWheel={handleWheelZoom}
        onMouseDown={handleMouseDownPan}
        onMouseMove={handleMouseMovePan}
        onMouseUp={handleMouseUpPan}
        onMouseLeave={handleMouseUpPan}
      >
        {/* Clean Canvas Mode Active Banner */}
        {cleanCanvasMode && (
          <div className="absolute top-3 left-3 bg-slate-950/95 border border-amber-400 text-amber-300 font-mono text-xs px-3 py-1.5 rounded-xl shadow-2xl flex items-center space-x-2 z-40 animate-pulse pointer-events-none">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">TRYB CZYSTEGO OBRAZU (ON) - Nakładki Ukryte</span>
          </div>
        )}

        {/* Live Camera Feed Mode */}
        {isCameraActive ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
            <video
              ref={videoRef}
              className="w-full max-h-[420px] object-contain rounded-lg border border-slate-800"
              playsInline
              muted
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3">
              <button
                id="btn-capture-snapshot"
                onClick={capturePhoto}
                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-red-950/60 flex items-center space-x-2 border-2 border-white animate-bounce"
              >
                <Camera className="w-5 h-5" />
                <span>Zrób Zdjęcie Diagnostyczne</span>
              </button>
            </div>
          </div>
        ) : isSplitScreenActive ? (
          /* Split-Screen Golden Board Comparison Mode */
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-slate-950 overflow-auto">
            {/* Left Pane: Current Board Under Test */}
            <div className="relative bg-slate-900 border-2 border-red-500/60 rounded-xl p-3 flex flex-col items-center justify-center">
              <div className="absolute top-2 left-2 bg-red-950/90 text-red-300 border border-red-500 text-[10px] font-mono px-2.5 py-1 rounded-lg shadow z-30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>Testowana Płyta (Bieżący Feed: {displayMaxTemp}°C)</span>
              </div>
              <div
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  transformOrigin: 'center center',
                  imageRendering: crispPixels ? 'pixelated' : 'auto'
                }}
                className="relative cursor-crosshair group max-w-full"
                onClick={handleImageClick}
              >
                <img
                  src={displayImageUrl}
                  alt="Testowana Płyta"
                  style={getPaletteStyle()}
                  className="max-h-[380px] w-auto object-contain rounded select-none"
                />
              </div>
            </div>

            {/* Right Pane: Golden Board Baseline Reference */}
            <div className="relative bg-slate-900 border-2 border-emerald-500/60 rounded-xl p-3 flex flex-col items-center justify-center">
              <div className="absolute top-2 left-2 bg-emerald-950/90 text-emerald-300 border border-emerald-500 text-[10px] font-mono px-2.5 py-1 rounded-lg shadow z-30 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Golden Board (Wzorzec Sprawny: Max 42.5°C)</span>
              </div>
              <div className="relative max-w-full">
                <img
                  src={displayImageUrl}
                  alt="Golden Board Baseline"
                  style={{ filter: 'hue-rotate(180deg) saturate(0.85) brightness(0.95)' }}
                  className="max-h-[380px] w-auto object-contain rounded select-none filter contrast-125"
                />
                <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-emerald-400/60 text-emerald-300 font-mono text-[10px] px-3 py-1.5 rounded-lg shadow-lg">
                  Status: Wzorzec Fabryczny OK (Brak anomalii termicznych VRM / Chipsetu)
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Thermal Image Display Mode */
          <div
            ref={imageContainerRef}
            onClick={handleImageClick}
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
              imageRendering: crispPixels ? 'pixelated' : 'auto'
            }}
            className="relative cursor-crosshair group max-w-full"
          >
            {/* The Image with Thermal Palette filter */}
            <img
              src={displayImageUrl}
              alt="Płyta Główná / Obraz Termowizyjny"
              style={getPaletteStyle()}
              className="max-h-[460px] w-auto object-contain rounded transition-all duration-300 select-none pointer-events-auto"
            />

            {/* OVERLAY: TRANSPARENT PDF BOARDVIEW SCHEMATIC LAYER */}
            {schematicsEnabled && !cleanCanvasMode && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-200 z-10"
                style={{
                  opacity: schematicsOpacity,
                  transform: `scale(${schematicsScale}) rotate(${schematicsRotate}deg) translate(${schematicsOffsetX}px, ${schematicsOffsetY}px)`,
                  transformOrigin: 'center center'
                }}
              >
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines for CAD Boardview feel */}
                  <defs>
                    <pattern id="boardviewGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#06b6d4" strokeWidth="0.1" strokeOpacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#boardviewGrid)" />

                  {/* PCB Outer Frame */}
                  <rect
                    x="4"
                    y="4"
                    width="92"
                    height="92"
                    rx="2"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="0.5"
                    strokeDasharray="2 1"
                  />

                  {/* Render Boardview Bus/Trace Lines */}
                  {currentSchematic.busLines.map((line, idx) => (
                    <g key={`bus-${idx}`}>
                      <line
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        stroke={line.color}
                        strokeWidth="0.7"
                        strokeDasharray="1.5 0.5"
                        opacity="0.9"
                      />
                      <text
                        x={(line.x1 + line.x2) / 2}
                        y={(line.y1 + line.y2) / 2 - 1}
                        fill={line.color}
                        fontSize="2.0"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {line.name}
                      </text>
                    </g>
                  ))}

                  {/* Render Schematic Components */}
                  {currentSchematic.components.map((comp) => (
                    <g key={`sch-comp-${comp.ref}`}>
                      {/* Component Body Box */}
                      <rect
                        x={comp.xPct - comp.widthPct / 2}
                        y={comp.yPct - comp.heightPct / 2}
                        width={comp.widthPct}
                        height={comp.heightPct}
                        rx="0.8"
                        fill="#0284c7"
                        fillOpacity="0.2"
                        stroke="#38bdf8"
                        strokeWidth="0.5"
                      />

                      {/* Component Silk Screen Label */}
                      <text
                        x={comp.xPct}
                        y={comp.yPct}
                        fill="#38bdf8"
                        fontSize="2.2"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {comp.ref}
                      </text>

                      {/* Pin 1 Dot Marker */}
                      <circle
                        cx={comp.xPct - comp.widthPct / 2 + 1}
                        cy={comp.yPct - comp.heightPct / 2 + 1}
                        r="0.6"
                        fill="#e0f2fe"
                      />
                    </g>
                  ))}
                </svg>

                {/* Interactive Clickable Pins & Component Overlay Targets */}
                {currentSchematic.components.flatMap((comp) =>
                  comp.pins.map((pin) => (
                    <div
                      key={`pin-${comp.ref}-${pin.pinNumber}`}
                      style={{ top: `${pin.yPct}%`, left: `${pin.xPct}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComponent(comp);
                        setSelectedPin(pin);
                      }}
                    >
                      <div className="relative group/pin cursor-pointer flex items-center justify-center">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border border-cyan-300 flex items-center justify-center text-[8px] font-mono font-bold transition-transform transform hover:scale-150 ${
                            pin.resistance.includes('ZWARCIE') || pin.voltage.includes('SPADEK') || pin.voltage.includes('BRAK')
                              ? 'bg-red-600 text-white animate-pulse border-red-300 shadow-md shadow-red-900/80'
                              : 'bg-cyan-950/90 text-cyan-300 hover:bg-cyan-600 hover:text-white'
                          }`}
                        >
                          •
                        </div>

                        {/* Hover Tooltip showing Net Name */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover/pin:flex flex-col bg-slate-950 border border-cyan-500 text-cyan-200 text-[9px] font-mono px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-40">
                          <span className="font-bold text-cyan-400">{pin.netName}</span>
                          <span>Pin {pin.pinNumber} ({pin.voltage})</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* OVERLAY: INTERACTIVE SVG CHIP PINOUT OVERLAY */}
            {pinoutEnabled && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-200 z-20 flex items-center justify-center p-2"
                style={{ opacity: pinoutOpacity }}
              >
                <div className="relative w-full h-full max-w-[380px] max-h-[340px] bg-slate-950/90 border-2 border-purple-500/70 rounded-xl backdrop-blur-md p-3 shadow-2xl flex flex-col justify-between pointer-events-auto">
                  {/* Header Info */}
                  <div className="flex items-center justify-between border-b border-purple-500/40 pb-1.5 text-xs">
                    <div className="flex items-center space-x-1.5 truncate pr-2">
                      <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="font-bold text-purple-300 truncate">{currentPinoutPreset.name}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800 shrink-0">
                      {currentPinoutPreset.packageType}
                    </span>
                  </div>

                  {/* SVG Chip Diagram Body */}
                  <div className="relative flex-1 my-2 flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                      {/* Chip Silicon Body Box */}
                      <rect
                        x="25"
                        y="15"
                        width="50"
                        height="70"
                        rx="3"
                        fill="#0f172a"
                        stroke="#a855f7"
                        strokeWidth="1.2"
                      />

                      {/* Pin 1 Index Notch / Mark Dot */}
                      <circle cx="32" cy="22" r="2" fill="#e9d5ff" />

                      {/* Chip Center Text */}
                      <text
                        x="50"
                        y="46"
                        fill="#c084fc"
                        fontSize="3.2"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {currentPinoutPreset.chipCode}
                      </text>
                      <text
                        x="50"
                        y="54"
                        fill="#94a3b8"
                        fontSize="2.2"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        SOIC / BGA PINOUT OVERLAY
                      </text>

                      {/* Render Vector Lines for Pinout Connections */}
                      {currentPinoutPreset.pins.map((pin) => {
                        const isMatchingFilter =
                          pinoutFilter === 'all' ||
                          (pinoutFilter === 'power' && pin.type === 'power') ||
                          (pinoutFilter === 'gnd' && pin.type === 'gnd') ||
                          (pinoutFilter === 'signal' && pin.type === 'signal');

                        if (!isMatchingFilter) return null;

                        const pinColor =
                          pin.type === 'power'
                            ? '#ef4444' // Red for Voltage
                            : pin.type === 'gnd'
                            ? '#06b6d4' // Cyan for GND
                            : '#10b981'; // Emerald for Signal

                        return (
                          <g key={`svg-pin-${pin.pinNumber}`}>
                            <circle
                              cx={pin.xPct}
                              cy={pin.yPct}
                              r="3.8"
                              fill={pinColor}
                              fillOpacity={selectedPinoutPin?.pinNumber === pin.pinNumber ? '1.0' : '0.85'}
                              stroke="#ffffff"
                              strokeWidth={selectedPinoutPin?.pinNumber === pin.pinNumber ? '1.2' : '0.4'}
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Clickable Interactive Pins overlay for targets & tooltips */}
                    {currentPinoutPreset.pins.map((pin) => {
                      const isMatchingFilter =
                        pinoutFilter === 'all' ||
                        (pinoutFilter === 'power' && pin.type === 'power') ||
                        (pinoutFilter === 'gnd' && pin.type === 'gnd') ||
                        (pinoutFilter === 'signal' && pin.type === 'signal');

                      if (!isMatchingFilter) return null;

                      const badgeBg =
                        pin.type === 'power'
                          ? 'bg-red-600 text-white border-red-300 shadow-red-900/60'
                          : pin.type === 'gnd'
                          ? 'bg-cyan-600 text-white border-cyan-300 shadow-cyan-900/60'
                          : 'bg-emerald-600 text-white border-emerald-300 shadow-emerald-900/60';

                      return (
                        <div
                          key={`html-pin-${pin.pinNumber}`}
                          style={{ top: `${pin.yPct}%`, left: `${pin.xPct}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group/pinout z-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPinoutPin(pin);
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border shadow-lg flex items-center justify-center font-mono font-bold text-[9px] transition-transform transform hover:scale-130 ${badgeBg}`}
                          >
                            {pin.pinNumber.replace(/Pin\s*/i, '')}
                          </div>

                          {/* Pin Hover Label Tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover/pinout:flex flex-col bg-slate-950 border border-purple-500 text-purple-200 text-[10px] font-mono px-2 py-1 rounded shadow-2xl whitespace-nowrap z-50">
                            <span className="font-bold text-amber-300">{pin.name}</span>
                            <span className="text-slate-300">Napięcie: {pin.voltage}</span>
                            <span className="text-cyan-300">Oporność: {pin.resistance}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Hint */}
                  <div className="text-[10px] text-slate-400 font-mono text-center border-t border-purple-500/20 pt-1 flex items-center justify-between">
                    <span className="text-purple-300 font-semibold">🔴 Napięcie VCC | 🔵 Masa GND | 🟢 Sygnał</span>
                    <span className="text-amber-400">Kliknij pin</span>
                  </div>
                </div>
              </div>
            )}

            {/* OVERLAY: MOTHERBOARD OVERHEATING ZONES HEATMAP */}
            {heatmapEnabled && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{ opacity: heatmapOpacity }}
              >
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    {/* Live Overheat Heatmap Radial Gradient (>70°C) */}
                    <radialGradient id="liveOverheatGradient">
                      <stop offset="0%" stopColor="#ff0055" stopOpacity="0.95" />
                      <stop offset="40%" stopColor="#ff3300" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#eab308" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>

                    {/* Critical Alarm Glow Radial Gradient */}
                    <radialGradient id="heatAlarmGradient">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                      <stop offset="35%" stopColor="#f97316" stopOpacity="0.75" />
                      <stop offset="70%" stopColor="#eab308" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>

                    {/* Warning Glow Radial Gradient */}
                    <radialGradient id="heatWarningGradient">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
                      <stop offset="45%" stopColor="#eab308" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>

                    {/* Normal Heat Glow Radial Gradient */}
                    <radialGradient id="heatNormalGradient">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                      <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Render Heat circles for each zone */}
                  {currentProfile.zones.map((zone) => {
                    const gradId =
                      zone.severity === 'CRITICAL_ALARM'
                        ? 'url(#heatAlarmGradient)'
                        : zone.severity === 'WARNING'
                        ? 'url(#heatWarningGradient)'
                        : 'url(#heatNormalGradient)';

                    return (
                      <g key={zone.id}>
                        {/* Radial heat glow circle */}
                        <circle
                          cx={zone.xPct}
                          cy={zone.yPct}
                          r={zone.radiusPx / 5} // Scaled for 100x100 viewBox
                          fill={gradId}
                        />
                        {/* Pulsing Outer Ring */}
                        <circle
                          cx={zone.xPct}
                          cy={zone.yPct}
                          r={zone.radiusPx / 6}
                          fill="none"
                          stroke={
                            zone.severity === 'CRITICAL_ALARM'
                              ? '#ef4444'
                              : zone.severity === 'WARNING'
                              ? '#f97316'
                              : '#3b82f6'
                          }
                          strokeWidth="0.8"
                          strokeDasharray="2 1"
                          opacity="0.8"
                        />
                      </g>
                    );
                  })}

                  {/* Heatmap Live Over-Image (>70°C Dynamic Live Heat Overlay) */}
                  {isLiveOverheatActive && displaySpotPoints.map((spot) => {
                    if (spot.tempC < liveOverheatThreshold) return null;
                    return (
                      <g key={`live-overheat-${spot.id}`}>
                        {/* Dynamic Live Heat Gradient Aura */}
                        <circle
                          cx={spot.x}
                          cy={spot.y}
                          r={14}
                          fill="url(#liveOverheatGradient)"
                          className="animate-pulse"
                        />
                        {/* Pulsing Alert Ring */}
                        <circle
                          cx={spot.x}
                          cy={spot.y}
                          r={10}
                          fill="none"
                          stroke="#ff0055"
                          strokeWidth="1.2"
                          strokeDasharray="2 1"
                        />
                        <circle
                          cx={spot.x}
                          cy={spot.y}
                          r={3}
                          fill="#ffffff"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Interactive Zone Markers & Labels */}
                {currentProfile.zones.map((zone) => (
                  <div
                    key={`marker-${zone.id}`}
                    style={{ top: `${zone.yPct}%`, left: `${zone.xPct}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-20"
                    onClick={(e) => {
                      e.stopPropagation(); // Don't trigger main canvas spot point
                      setActiveZone(zone);
                    }}
                  >
                    <div className="relative group/zone flex flex-col items-center cursor-pointer">
                      {/* Pulsing Hotspot Core Pin */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-[10px] font-mono shadow-lg transition-transform transform hover:scale-125 ${
                          zone.severity === 'CRITICAL_ALARM'
                            ? 'bg-red-600/90 border-red-300 text-white animate-pulse shadow-red-900/80'
                            : zone.severity === 'WARNING'
                            ? 'bg-amber-600/90 border-amber-300 text-white shadow-amber-900/80'
                            : 'bg-blue-600/90 border-blue-300 text-white shadow-blue-900/80'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </div>

                      {/* Floating Zone Tag */}
                      <div className="bg-slate-950/95 border border-slate-700 text-slate-100 text-[10px] font-mono px-2 py-0.5 rounded shadow-xl mt-1 whitespace-nowrap flex items-center gap-1">
                        <span className="font-bold text-amber-400">{zone.componentRef}</span>
                        <span className="text-red-400 font-bold">{zone.estTempC}°C</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hotspot Indicator overlay if active */}
            {hotspotEnabled && !heatmapEnabled && (
              <div className="absolute top-[28%] left-[27%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-12 h-12 rounded-full border-2 border-red-500 animate-ping opacity-75"></span>
                  <span className="w-8 h-8 rounded-full bg-red-600/40 border border-red-400 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  </span>
                  <div className="absolute left-10 bottom-2 bg-red-950/90 border border-red-500 text-red-200 text-[11px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    <span>HOTSPOT: {maxTemp}°C</span>
                  </div>
                </div>
              </div>
            )}

            {/* Render User Spot Pins */}
            {spotPoints.map((pt) => (
              <div
                key={pt.id}
                style={{ top: `${pt.y}%`, left: `${pt.x}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
              >
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400 bg-cyan-950/80 flex items-center justify-center text-[9px] font-mono text-cyan-300 font-bold shadow-lg">
                    +
                  </div>
                  <div className="bg-slate-900/90 border border-cyan-500/60 text-cyan-200 text-[10px] font-mono px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap shadow">
                    {pt.label || 'Sp'}: {pt.tempC}°C
                  </div>
                </div>
              </div>
            ))}

            {/* OVERLAY: AI VISION BOUNDING BOXES FOR RECOGNIZED COMPONENTS */}
            {aiVisionEnabled && !cleanCanvasMode && aiBoundingBoxes.map((box) => {
              const isSelected = selectedAiBox?.id === box.id;
              const boxBorderColor =
                box.color === 'red'
                  ? 'border-red-500 bg-red-500/10 text-red-200'
                  : box.color === 'amber'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                  : box.color === 'cyan'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200'
                  : 'border-emerald-500 bg-emerald-500/10 text-emerald-200';

              const boxCenterX = box.xPct + box.wPct / 2;
              const boxCenterY = box.yPct + box.hPct / 2;
              const isCentralViewport = boxCenterX >= 30 && boxCenterX <= 70 && boxCenterY >= 25 && boxCenterY <= 75;

              let tagPositionClass = "absolute -top-7 left-0";
              if (isCentralViewport) {
                if (boxCenterX > 50) {
                  tagPositionClass = "absolute -top-8 right-0 text-right";
                } else {
                  tagPositionClass = "absolute -top-8 left-0";
                }
                if (boxCenterY < 45) {
                  tagPositionClass += " -translate-y-1";
                } else {
                  tagPositionClass = "absolute -bottom-8 left-0 translate-y-1";
                }
              }

              return (
                <div
                  key={box.id}
                  style={{
                    left: `${box.xPct}%`,
                    top: `${box.yPct}%`,
                    width: `${box.wPct}%`,
                    height: `${box.hPct}%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAiBox(box);
                  }}
                  className={`absolute border-2 rounded-lg pointer-events-auto cursor-pointer transition-all z-20 group/box ${boxBorderColor} ${
                    isSelected ? 'ring-4 ring-purple-400 z-30 scale-[1.02] bg-purple-500/20' : 'hover:border-white hover:bg-white/10'
                  }`}
                >
                  {/* Glowing Corners */}
                  <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white rounded-tl"></span>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white rounded-tr"></span>
                  <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white rounded-bl"></span>
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white rounded-br"></span>

                  {/* AI Label Tag Badge - Rendered inside a semi-transparent container avoiding viewport center */}
                  <div className={`backdrop-blur-md bg-slate-950/80 border border-purple-500/80 text-purple-200 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-2xl flex items-center space-x-1.5 whitespace-nowrap ${tagPositionClass}`}>
                    <Scan className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-extrabold">{box.label}</span>
                    <span className="text-emerald-400 text-[9px] font-semibold">
                      ({box.confidence}%)
                    </span>
                    <span className="text-amber-300 font-bold border-l border-slate-700/80 pl-1.5">
                      {box.tempC}°C
                    </span>
                  </div>
                </div>
              );
            })}

            {/* OVERLAY: SEMI-TRANSPARENT EDITABLE COMPONENT LABELS (CPU, PCH, VRM, etc.) */}
            {componentLabelsEnabled && !cleanCanvasMode && componentLabels.map((lbl) => {
              const isSelected = editingLabel?.id === lbl.id;
              
              const colorBg =
                lbl.color === 'red'
                  ? 'bg-red-950/80 border-red-500/80 text-red-200 shadow-red-950/80'
                  : lbl.color === 'amber'
                  ? 'bg-amber-950/80 border-amber-500/80 text-amber-200 shadow-amber-950/80'
                  : lbl.color === 'cyan'
                  ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200 shadow-cyan-950/80'
                  : lbl.color === 'emerald'
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 shadow-emerald-950/80'
                  : lbl.color === 'purple'
                  ? 'bg-purple-950/80 border-purple-500/80 text-purple-200 shadow-purple-950/80'
                  : 'bg-slate-900/80 border-slate-600 text-slate-200 shadow-slate-950/80';

              const isLblCentral = lbl.xPct >= 30 && lbl.xPct <= 70 && lbl.yPct >= 25 && lbl.yPct <= 75;
              const lblPositionTransform = isLblCentral
                ? (lbl.xPct > 50 ? 'translate-x-3 -translate-y-1/2' : '-translate-x-[105%] -translate-y-1/2')
                : '-translate-x-1/2 -translate-y-1/2';

              return (
                <div
                  key={lbl.id}
                  style={{ top: `${lbl.yPct}%`, left: `${lbl.xPct}%`, opacity: labelOpacity }}
                  className={`absolute pointer-events-auto z-25 group/label ${lblPositionTransform}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingLabel(lbl);
                  }}
                >
                  <div className="relative flex flex-col items-center cursor-pointer">
                    {/* Semi-transparent styled component tag */}
                    <div
                      className={`backdrop-blur-md border rounded-xl px-2.5 py-1 text-xs font-mono font-bold shadow-2xl flex items-center space-x-1.5 transition-all transform select-none ${colorBg} ${
                        isSelected
                          ? 'ring-2 ring-amber-400 scale-110 z-40 shadow-amber-500/30'
                          : 'hover:scale-105'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                      <span className="tracking-wide uppercase font-black">{lbl.text}</span>
                      {lbl.tempC !== undefined && (
                        <span className="text-[10px] opacity-90 border-l border-current/30 pl-1.5 font-sans font-semibold">
                          {lbl.tempC}°C
                        </span>
                      )}
                      
                      {/* Delete X icon on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setComponentLabels((prev) => prev.filter((item) => item.id !== lbl.id));
                          if (editingLabel?.id === lbl.id) setEditingLabel(null);
                        }}
                        className="opacity-0 group-hover/label:opacity-100 hover:text-red-400 ml-1 p-0.5 rounded transition"
                        title="Usuń etykietę"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Datasheet spec badge attached directly under the visual tag - Hidden in compact mode */}
                    {!compactLabelMode && (lbl.datasheetPartNumber || lbl.vgsVoltage || lbl.thermalCeilingC) && (
                      <div className="bg-slate-950/95 border border-slate-700/80 text-[8.5px] font-mono rounded-md px-1.5 py-0.5 mt-0.5 shadow-2xl flex flex-col items-center gap-0.5 text-slate-200 backdrop-blur-md select-none pointer-events-none whitespace-nowrap">
                        {lbl.datasheetPartNumber && (
                          <div className="flex items-center gap-1 text-amber-300 font-bold">
                            <Cpu className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                            <span>{lbl.datasheetPartNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[8px]">
                          {lbl.vgsVoltage && (
                            <span className="text-cyan-300 font-semibold">{lbl.vgsVoltage}</span>
                          )}
                          {lbl.thermalCeilingC && (
                            <span className={`font-black px-1 rounded ${
                              (lbl.tempC ?? 0) >= lbl.thermalCeilingC
                                ? 'bg-red-600 text-white animate-bounce'
                                : (lbl.tempC ?? 0) >= lbl.thermalCeilingC * 0.85
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                                : 'text-emerald-400'
                            }`}>
                              Limit: {lbl.thermalCeilingC}°C
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Note & Datasheet summary tooltip snippet on hover */}
                    {(lbl.note || lbl.datasheetSummary) && !isSelected && (
                      <div className="hidden group-hover/label:block absolute top-full mt-1 bg-slate-950/98 border border-amber-500/60 text-slate-200 text-[9px] font-mono px-2.5 py-1 rounded-lg shadow-2xl whitespace-nowrap z-50 pointer-events-none space-y-0.5">
                        {lbl.datasheetSummary && (
                          <div className="text-amber-300 font-bold flex items-center space-x-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>{lbl.datasheetSummary}</span>
                          </div>
                        )}
                        {lbl.note && <div className="text-slate-300 text-[8.5px]">{lbl.note}</div>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* OVERLAY: AUTOMATIC LASER SCANNER SWEEP ANIMATION */}
            {isAutoScanning && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded flex flex-col justify-between">
                <div
                  className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-pulse transition-all duration-75"
                  style={{ transform: `translateY(${autoScanProgress * 3.5}px)` }}
                />
                <div className="absolute top-3 right-3 bg-slate-950/90 border border-emerald-500 text-emerald-300 font-mono text-xs px-3 py-1.5 rounded-lg shadow-2xl flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">AUTOMATYCZNY SKAN SPRZĘTU: {autoScanProgress}%</span>
                </div>
              </div>
            )}

            {/* OVERLAY: AUTO-TAGGING VISION ANIMATION & TOAST */}
            {isAutoTagging && (
              <div className="absolute inset-0 pointer-events-none z-35 overflow-hidden rounded bg-amber-500/10 flex flex-col items-center justify-center backdrop-blur-[1px]">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b] animate-pulse" />
                <div className="bg-slate-950/95 border border-amber-500 text-amber-300 font-mono text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-3 my-auto animate-bounce">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                  <div>
                    <span className="font-black text-amber-300 block">ANALIZA WZORCÓW PŁYTY & AUTOMATYCZNE TAGOWANIE...</span>
                    <span className="text-[10px] text-slate-400">Identyfikacja układów VRM, PCH, CPU, VRAM, KBC na podczerwieni</span>
                  </div>
                </div>
              </div>
            )}

            {autoTagToastMsg && !isAutoTagging && (
              <div className="absolute top-3 right-3 bg-slate-950/95 border border-amber-400 text-amber-200 font-mono text-xs px-3.5 py-2 rounded-xl shadow-2xl flex items-center space-x-2 z-40 animate-in fade-in zoom-in duration-200">
                <Tag className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                <span className="font-semibold text-[11px]">{autoTagToastMsg}</span>
              </div>
            )}

            {/* Click instruction hint overlay - hidden in clean canvas mode */}
            {!cleanCanvasMode && (
              <div className="absolute bottom-2 left-2 bg-slate-950/85 border border-slate-800/80 text-slate-300 text-[10px] font-mono px-2 py-1 rounded opacity-60 group-hover:opacity-100 transition pointer-events-none flex items-center space-x-1.5 z-10 backdrop-blur-sm">
                <Crosshair className="w-3 h-3 text-amber-400 shrink-0" />
                <span>
                  {clickMode === 'LABEL'
                    ? `Kliknij na płytę: Doda etykietę "${selectedPresetLabelText}"`
                    : 'Kliknij na płytę: Pomiar temperatury punktowej'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* THERMAL SNAPSHOT TIMELINE & SCRUBBER BAR */}
      <div className="bg-slate-950 border-t border-slate-800 p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Oś Czasu Migawek Termicznych (Timeline Scrubber)</span>
            <span className="bg-slate-900 text-cyan-400 border border-cyan-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              {activeSnapshotIndex === null ? 'Tryb na żywo (Live)' : `Migawka ${activeSnapshotIndex + 1} z ${thermalSnapshots.length}`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-capture-timeline-snapshot"
              onClick={handleCaptureSnapshot}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-md shadow-amber-950/40 transition"
              title="Zapisz aktualny stan i obraz termiczny jako nową migawkę na osi czasu"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Zrób Migawkę (Snapshot)</span>
            </button>

            {activeSnapshotIndex !== null && (
              <button
                onClick={() => setActiveSnapshotIndex(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition font-medium"
              >
                Powrót do Live
              </button>
            )}
          </div>
        </div>

        {/* Timeline Scrubber Slider & Quick Jump Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Początek sesji (Start)</span>
            <span className="text-amber-300 font-bold">
              {activeSnapshotIndex === null ? 'Podgląd Na Żywo (Live Canvas)' : thermalSnapshots[activeSnapshotIndex]?.timestampLabel}
            </span>
            <span>Obecny Stan</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={thermalSnapshots.length - 1}
              value={activeSnapshotIndex === null ? thermalSnapshots.length - 1 : activeSnapshotIndex}
              onChange={(e) => setActiveSnapshotIndex(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Snapshot Cards Preview Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {thermalSnapshots.map((snap, idx) => {
              const isSelected = activeSnapshotIndex === idx;
              return (
                <button
                  key={snap.id}
                  onClick={() => setActiveSnapshotIndex(idx)}
                  className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-left shrink-0 transition ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-950/50 ring-1 ring-amber-400'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="w-7 h-5 rounded overflow-hidden bg-black shrink-0 border border-slate-700">
                    <img src={snap.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[10px] font-mono">
                    <div className="font-bold text-slate-200 truncate max-w-[110px]">{snap.timestampLabel}</div>
                    <div className="text-amber-400 font-bold">Max: {snap.maxTemp}°C</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Active Selected Schematic Pin Card */}
      {selectedPin && selectedComponent && (
        <div className="bg-slate-950 p-4 border-t border-cyan-500/40 text-slate-200 space-y-2 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-cyan-400 text-sm">Pin Boardview: {selectedPin.netName}</span>
                <span className="bg-slate-900 text-amber-300 border border-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  {selectedComponent.ref} ({selectedPin.pinNumber})
                </span>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-2 py-0.5 rounded font-mono">
                  {selectedComponent.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedComponent.description}</p>
            </div>

            <button
              onClick={() => {
                setSelectedPin(null);
                setSelectedComponent(null);
              }}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Napięcie Oczekiwane:</span>
              <strong className="text-emerald-400 text-sm">{selectedPin.voltage}</strong>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Oporność do Masy (GND):</span>
              <strong className={selectedPin.resistance.includes('ZWARCIE') ? 'text-red-400 text-sm font-bold animate-pulse' : 'text-cyan-300 text-sm'}>
                {selectedPin.resistance}
              </strong>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Korelacja Termowizyjna:</span>
              <strong className="text-red-400 text-sm">{maxTemp}°C Hotspot</strong>
            </div>
          </div>

          <div className="flex items-center justify-end pt-1 gap-2">
            {onSendToChat && (
              <button
                onClick={() => {
                  onSendToChat(
                    `Analiza węzła zasilania ze schematu boardview: Układ ${selectedComponent.ref} (${selectedComponent.type}), Pin ${selectedPin.pinNumber} -> Szyna ${selectedPin.netName}. Napięcie: ${selectedPin.voltage}, Oporność: ${selectedPin.resistance}, Temp z kamery: ${maxTemp}°C. Podaj kroki naprawy tej szyny.`
                  );
                  setSelectedPin(null);
                  setSelectedComponent(null);
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Zapytaj AI o ten Pin / Szynę</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Selected Chip Pinout Inspector Card */}
      {selectedPinoutPin && (
        <div className="bg-slate-950 p-4 border-t border-purple-500/50 text-slate-200 space-y-2.5 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-purple-500/30 pb-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-purple-300 text-sm">Pinout: {selectedPinoutPin.name}</span>
                <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  {selectedPinoutPin.pinNumber}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    selectedPinoutPin.type === 'power'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : selectedPinoutPin.type === 'gnd'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {selectedPinoutPin.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{selectedPinoutPin.desc}</p>
            </div>

            <button
              onClick={() => setSelectedPinoutPin(null)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Nominalne Napięcie:</span>
              <strong className="text-red-400 text-sm">{selectedPinoutPin.voltage}</strong>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Wartość Oporności / Diody:</span>
              <strong className="text-cyan-300 text-sm">{selectedPinoutPin.resistance}</strong>
            </div>
          </div>

          <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/30 text-xs font-mono space-y-1">
            <span className="text-purple-300 font-bold block text-[11px] uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> Wskazówka Diagnostyczna Serwisu:
            </span>
            <p className="text-slate-200 leading-relaxed">{selectedPinoutPin.diagnosticTip}</p>
          </div>

          <div className="flex items-center justify-end pt-1 gap-2">
            {onSendToChat && (
              <button
                onClick={() => {
                  onSendToChat(
                    `Zapytanie o pinout ukladu ${currentPinoutPreset.name}: Pin ${selectedPinoutPin.pinNumber} (${selectedPinoutPin.name}). Napięcie: ${selectedPinoutPin.voltage}, Oporność: ${selectedPinoutPin.resistance}. Opis: ${selectedPinoutPin.desc}. Porada: ${selectedPinoutPin.diagnosticTip}. Jak zweryfikować ten sygnał oscyloskopem/multimetrem?`
                  );
                  setSelectedPinoutPin(null);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow-lg shadow-purple-950/50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Zapytaj AI o ten Pin Chipa</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Editable Component Label Inspector Card */}
      {editingLabel && (
        <div className="bg-slate-950 p-4 border-t border-amber-500/50 text-slate-200 space-y-3 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-300 text-sm">Edytor Etykiety Elementu</span>
              <span className="bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                ID: {editingLabel.id}
              </span>
            </div>

            <button
              onClick={() => setEditingLabel(null)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded transition"
              title="Zamknij edytor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Label Name & Quick Tags */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-slate-400 text-[11px] font-medium block">
                Nazwa / Symbol Elementu:
              </label>
              <input
                type="text"
                value={editingLabel.text}
                onChange={(e) => {
                  const newText = e.target.value;
                  setEditingLabel((prev) => prev ? { ...prev, text: newText } : null);
                  setComponentLabels((prev) =>
                    prev.map((item) => (item.id === editingLabel.id ? { ...item, text: newText } : item))
                  );
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 text-xs"
                placeholder="np. CPU, PCH, VRM, MOSFET..."
              />

              {/* Quick Preset Tag Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {PRESET_COMPONENT_NAMES.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setEditingLabel((prev) => prev ? { ...prev, text: preset } : null);
                      setComponentLabels((prev) =>
                        prev.map((item) => (item.id === editingLabel.id ? { ...item, text: preset } : item))
                      );
                    }}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition ${
                      editingLabel.text === preset
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Color & Temperature & Note */}
            <div className="space-y-1.5 md:col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-400 text-[11px] font-medium">Kolor Wyróżnienia:</label>
                <div className="flex items-center space-x-1">
                  {(['red', 'amber', 'cyan', 'emerald', 'purple', 'blue'] as const).map((clr) => (
                    <button
                      key={clr}
                      onClick={() => {
                        setEditingLabel((prev) => prev ? { ...prev, color: clr } : null);
                        setComponentLabels((prev) =>
                          prev.map((item) => (item.id === editingLabel.id ? { ...item, color: clr } : item))
                        );
                      }}
                      className={`w-4 h-4 rounded-full transition transform hover:scale-125 ${
                        clr === 'red'
                          ? 'bg-red-500'
                          : clr === 'amber'
                          ? 'bg-amber-500'
                          : clr === 'cyan'
                          ? 'bg-cyan-500'
                          : clr === 'emerald'
                          ? 'bg-emerald-500'
                          : clr === 'purple'
                          ? 'bg-purple-500'
                          : 'bg-blue-500'
                      } ${editingLabel.color === clr ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
                      title={`Kolor ${clr}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] font-medium block">
                  Szacowana Temperatura (°C):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editingLabel.tempC ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEditingLabel((prev) => prev ? { ...prev, tempC: val } : null);
                    setComponentLabels((prev) =>
                      prev.map((item) => (item.id === editingLabel.id ? { ...item, tempC: val } : item))
                    );
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-red-400 font-mono font-bold focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] font-medium block">
                  Notatka / Uwagi Diagnostyczne:
                </label>
                <input
                  type="text"
                  value={editingLabel.note || ''}
                  onChange={(e) => {
                    const note = e.target.value;
                    setEditingLabel((prev) => prev ? { ...prev, note } : null);
                    setComponentLabels((prev) =>
                      prev.map((item) => (item.id === editingLabel.id ? { ...item, note } : item))
                    );
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-slate-300 text-xs focus:outline-none focus:border-slate-500"
                  placeholder="np. Zwarcie w linii VCORE, spadek oporności..."
                />
              </div>

              {/* Datasheet Parameters Block */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-amber-500/30 space-y-1.5 mt-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 block uppercase flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-amber-400" /> Specyfikacja Datasheet (Vgs & TjMax):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-slate-400 text-[9.5px] block">Układ / Part No:</label>
                    <input
                      type="text"
                      value={editingLabel.datasheetPartNumber || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingLabel((prev) => prev ? { ...prev, datasheetPartNumber: val } : null);
                        setComponentLabels((prev) =>
                          prev.map((item) => (item.id === editingLabel.id ? { ...item, datasheetPartNumber: val } : item))
                        );
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-amber-300 font-mono text-[10px]"
                      placeholder="np. SiC634 DrMOS"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[9.5px] block">Target Vgs Gate:</label>
                    <input
                      type="text"
                      value={editingLabel.vgsVoltage || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingLabel((prev) => prev ? { ...prev, vgsVoltage: val } : null);
                        setComponentLabels((prev) =>
                          prev.map((item) => (item.id === editingLabel.id ? { ...item, vgsVoltage: val } : item))
                        );
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-cyan-300 font-mono text-[10px]"
                      placeholder="np. Vgs: 4.5V–10V"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-[9.5px] block">Limit TjMax (°C):</label>
                  <input
                    type="number"
                    value={editingLabel.thermalCeilingC ?? ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || undefined;
                      setEditingLabel((prev) => prev ? { ...prev, thermalCeilingC: val } : null);
                      setComponentLabels((prev) =>
                        prev.map((item) => (item.id === editingLabel.id ? { ...item, thermalCeilingC: val } : item))
                      );
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-red-400 font-mono text-[10px]"
                    placeholder="np. 150"
                  />
                </div>
              </div>
            </div>

            {/* Position Controls & Actions */}
            <div className="space-y-2 md:col-span-1 flex flex-col justify-between">
              <div>
                <label className="text-slate-400 text-[11px] font-medium block mb-1">
                  Pozycja na Obrazie (X / Y %):
                </label>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 w-4">X:</span>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={editingLabel.xPct}
                      onChange={(e) => {
                        const xPct = parseInt(e.target.value);
                        setEditingLabel((prev) => prev ? { ...prev, xPct } : null);
                        setComponentLabels((prev) =>
                          prev.map((item) => (item.id === editingLabel.id ? { ...item, xPct } : item))
                        );
                      }}
                      className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-amber-400 w-8">{editingLabel.xPct}%</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 w-4">Y:</span>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={editingLabel.yPct}
                      onChange={(e) => {
                        const yPct = parseInt(e.target.value);
                        setEditingLabel((prev) => prev ? { ...prev, yPct } : null);
                        setComponentLabels((prev) =>
                          prev.map((item) => (item.id === editingLabel.id ? { ...item, yPct } : item))
                        );
                      }}
                      className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-amber-400 w-8">{editingLabel.yPct}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 gap-2">
                <button
                  onClick={() => {
                    setComponentLabels((prev) => prev.filter((item) => item.id !== editingLabel.id));
                    setEditingLabel(null);
                  }}
                  className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Usuń Etykietę</span>
                </button>

                {onSendToChat && (
                  <button
                    onClick={() => {
                      onSendToChat(
                        `Analiza termiczna elementu ${editingLabel.text}: Pozycja (${editingLabel.xPct}%, ${editingLabel.yPct}%), Temp: ${editingLabel.tempC}°C. Notatka: "${editingLabel.note || 'Brak'}". Jak zweryfikować ten układ i jego obwód zasilający?`
                      );
                      setEditingLabel(null);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Zapytaj AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive AI Vision Bounding Box Inspector Card */}
      {selectedAiBox && (
        <div className="bg-slate-950 p-4 border-t border-purple-500/60 text-slate-200 space-y-3 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-purple-500/40 pb-2">
            <div className="flex items-center space-x-2">
              <Scan className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-purple-300 text-sm">Wykryty Element AI: {selectedAiBox.label}</span>
              <span className="bg-purple-950 border border-purple-700 text-purple-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                Pewność AI: {selectedAiBox.confidence}%
              </span>
            </div>

            <button
              onClick={() => setSelectedAiBox(null)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block font-bold">Temperatura / Stan:</span>
              <div className="text-red-400 font-mono font-bold text-base flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500" />
                <span>{selectedAiBox.tempC}°C</span>
              </div>
              <p className="text-[11px] text-slate-300 pt-1">{selectedAiBox.description}</p>
            </div>

            <div className="space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase block font-bold">Pozycja Bounding Box (Kadr):</span>
              <div className="font-mono text-cyan-300 text-xs">
                X: {selectedAiBox.xPct}% | Y: {selectedAiBox.yPct}% | Szerokość: {selectedAiBox.wPct}% | Wysokość: {selectedAiBox.hPct}%
              </div>
              <span className="text-slate-400 text-[10px] block pt-1">
                Rozpoznane przez sieć neuronową TermoFix AI Vision v4.2
              </span>
            </div>

            <div className="flex flex-col justify-between space-y-2">
              <button
                onClick={() => {
                  const newLabel: CustomComponentLabel = {
                    id: `lbl-${Date.now()}`,
                    xPct: selectedAiBox.xPct + Math.round(selectedAiBox.wPct / 2),
                    yPct: selectedAiBox.yPct + Math.round(selectedAiBox.hPct / 2),
                    text: selectedAiBox.label,
                    tempC: selectedAiBox.tempC,
                    color: selectedAiBox.color,
                    note: selectedAiBox.description
                  };
                  setComponentLabels((prev) => [...prev, newLabel]);
                  setSelectedAiBox(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 transition"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Przypisz stałą etykietę ze skanu AI</span>
              </button>

              {onSendToChat && (
                <button
                  onClick={() => {
                    onSendToChat(
                      `Analiza elementu wykrytego przez AI Vision (${selectedAiBox.label}): Zmierzono ${selectedAiBox.tempC}°C w strefie ${selectedAiBox.description}. Pozycja (${selectedAiBox.xPct}%, ${selectedAiBox.yPct}%). Podaj zalecaną procedurę diagnostyczną i potencjalne przyczyny podwyższonej temperatury.`
                    );
                    setSelectedAiBox(null);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Przeanalizuj z Asystentem AI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Active Heatmap Zone Popover Card Modal */}
      {activeZone && (
        <div className="bg-slate-950 p-4 border-t border-amber-500/40 text-slate-200 space-y-2.5 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-amber-400 text-sm">{activeZone.name}</span>
                <span className="bg-slate-900 text-cyan-300 border border-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                  {activeZone.componentRef}
                </span>
                {activeZone.severity === 'CRITICAL_ALARM' && (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> ALARM (Zwarcie)
                  </span>
                )}
                {activeZone.severity === 'WARNING' && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Ostrzeżenie (VRM)
                  </span>
                )}
                {activeZone.severity === 'NORMAL' && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Normalna Emisja
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{activeZone.descriptionPl}</p>
            </div>

            <button
              onClick={() => setActiveZone(null)}
              className="p-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
            <span className="text-amber-400 font-bold block text-[11px] uppercase">
              Porada Diagnostyczna Multimetru / Serwisu:
            </span>
            <p className="text-slate-300 leading-relaxed">{activeZone.diagnosticAdvicePl}</p>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Szacowana temp. usterki: <strong className="text-red-400">{activeZone.estTempC}°C</strong>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAddPinFromZone(activeZone)}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dodaj Punkt Pomiaru</span>
              </button>

              {onSendToChat && (
                <button
                  onClick={() => {
                    onSendToChat(
                      `Przeanalizujmy strefę przegrzewania: ${activeZone.name} (${activeZone.componentRef}). Temp: ${activeZone.estTempC}°C. Opis: ${activeZone.descriptionPl}. Porada: ${activeZone.diagnosticAdvicePl}. Podaj pełny przewodnik krok po kroku.`
                    );
                    setActiveZone(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Skonsultuj z AI</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Thermal Controls Bar */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 space-y-2">
        {/* Palette Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Paleta Termii:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['ironbow', 'hotred', 'lava', 'rainbow', 'grayscale'] as ThermalPalette[]).map((pal) => (
              <button
                key={pal}
                onClick={() => setActivePalette(pal)}
                className={`text-[11px] px-2.5 py-1 rounded font-mono capitalize transition border ${
                  activePalette === pal
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {pal}
              </button>
            ))}
          </div>

          {/* Clear Pins */}
          {spotPoints.length > 0 && (
            <button
              onClick={handleResetSpotPoints}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Usuń Punkty ({spotPoints.length})</span>
            </button>
          )}
        </div>

        {/* Temperature Scale Bar & AI Trigger */}
        <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3">
          
          {/* Temperature Range Gauge */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-blue-400 font-bold">{minTemp}°C</span>
            <div className="w-28 sm:w-36 h-2 rounded bg-gradient-to-r from-blue-600 via-yellow-400 to-red-600 shadow-inner"></div>
            <span className="text-red-400 font-bold">{maxTemp}°C</span>
          </div>

          {/* Trigger AI Analysis Button */}
          <button
            id="btn-analyze-thermal-ai"
            onClick={onAnalyzeAI}
            disabled={isAnalyzing}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-red-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-red-950/40 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
            <span>{isAnalyzing ? 'Analizowanie obrazu przez AI...' : 'Przeanalizuj Obraz Termowizyjny z AI'}</span>
          </button>

        </div>
      </div>

      {/* IndexedDB Thermal Snapshot Gallery Modal */}
      <ThermalSnapshotGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        currentImageUrl={imageUrl}
        currentMaxTemp={maxTemp}
        currentMinTemp={minTemp}
        currentSpotPoints={spotPoints}
      />
    </div>
  );
};
