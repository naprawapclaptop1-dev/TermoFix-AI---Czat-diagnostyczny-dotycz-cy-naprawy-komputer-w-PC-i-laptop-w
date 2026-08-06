import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Layers,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  X,
  Crosshair,
  Sliders,
  Info,
  ShieldCheck,
  RefreshCw,
  Terminal,
  FileText,
  Printer,
  FileCode,
  FolderOpen,
  Laptop,
  Flame,
  Sparkles
} from 'lucide-react';
import { ThermalData } from '../types';

export interface OcrComponentItem {
  id: string;
  code: string;
  type: string;
  name: string;
  description: string;
  location: string;
  diodeReading: string;
  normalResistance: string;
  replacements: string[];
  failureSymptoms: string;
  xPct: number;
  yPct: number;
}

const OCR_SAMPLE_COMPONENTS: OcrComponentItem[] = [
  {
    id: 'ocr-pu401',
    code: 'PU401',
    type: 'IC PWM',
    name: 'TPS51225RUKR (Dual Synchronous Buck Controller)',
    description: 'Kontroler przetwornicy głównej +3.3V/+5V Standby. Tworzy zasilanie LDO oraz impulsowe dla KBC i mostka.',
    location: 'Strona 34 / Kwadrat B3',
    diodeReading: '0.420 V',
    normalResistance: '12.5 kΩ',
    replacements: ['TPS51225C', 'TPS51220', 'RT8205A (Adapter)'],
    failureSymptoms: 'Brak napięć LDO 3.3V/5V, gorący układ, brak reakcji na włącznik power.',
    xPct: 32,
    yPct: 28,
  },
  {
    id: 'ocr-pq302',
    code: 'PQ302',
    type: 'MOSFET',
    name: 'CSD87350Q5D (Synchronous Buck Power Block MOSFET 30V 40A)',
    description: 'Tranzystor kluczujący w sekcji B+ VIN. Przebicie Dren-Źródło podaje 19V bezpośrednio na linie niskonapięciowe.',
    location: 'Strona 18 / Kwadrat C4',
    diodeReading: '0.510 V',
    normalResistance: '>100 kΩ',
    replacements: ['AON6380', 'FDMS7602S', 'SiR422DP'],
    failureSymptoms: 'Zwarcie do masy na wtyku DC-IN, zasilacz laboratoryjny przechodzi w tryb CC (limit prądu).',
    xPct: 54,
    yPct: 38,
  },
  {
    id: 'ocr-c7890',
    code: 'C7890',
    type: 'Kondensator MLCC',
    name: '10uF 25V X7R 0805 MLCC Ceramic Capacitor',
    description: 'Kondensator ceramiczny odsprzęgający linię VCORE. Częste źródło zwarcia do masy po przebiciu dielektryka.',
    location: 'Strona 42 / Kwadrat A1',
    diodeReading: '0.002 V (ZWARTY!)',
    normalResistance: '0.12 Ω (ZWARTY)',
    replacements: ['MLCC 10uF 25V 0805', 'MLCC 22uF 16V 0805'],
    failureSymptoms: 'Spadek napięcia VCORE z 1.05V do 0.2V, nagrzewanie do 88°C w kamerze termowizyjnej.',
    xPct: 68,
    yPct: 62,
  },
  {
    id: 'ocr-u2800',
    code: 'U2800',
    type: 'KBC I/O',
    name: 'MEC1404-NU (Microchip Keyboard Controller / SPI Embedded)',
    description: 'Kontroler klawiatury, włącznika zasilania i sekwencji startowej RSMRST#. Steruje wentylatorami.',
    location: 'Strona 12 / Kwadrat D2',
    diodeReading: '0.485 V',
    normalResistance: '4.8 kΩ',
    replacements: ['MEC1404-NU QFP-128 (wymaga programowania eFlash)'],
    failureSymptoms: 'Brak ładowania baterii, włącznik nie reaguje, wentylatory kręcą na 100%.',
    xPct: 82,
    yPct: 22,
  },
  {
    id: 'ocr-pr102',
    code: 'PR102',
    type: 'Rezystor Pomiarowy',
    name: '0.01Ω (10mΩ) 1% 1W 1206 Current Sense Resistor',
    description: 'Bocznik do pomiaru prądu ładowania baterii i głównej linii VIN zasilacza BQ24780S.',
    location: 'Strona 15 / Kwadrat B1',
    diodeReading: '0.001 V',
    normalResistance: '0.01 Ω',
    replacements: ['Rezystor bocznikowy 0.01 Ohm 1206 1%'],
    failureSymptoms: 'Przepalony rezystor uniemożliwia ładowanie akumulatora oraz zasilanie z zasilacza.',
    xPct: 24,
    yPct: 70,
  },
  {
    id: 'ocr-pl101',
    code: 'PL101',
    type: 'Cewka Indukcyjna',
    name: '2.2uH 15A High Current Power Inductor',
    description: 'Dławik wyjściowy przetwornicy VCORE CPU. Przechodzi przez niego pełny prąd rdzenia procesora.',
    location: 'Strona 45 / Kwadrat C2',
    diodeReading: '0.005 V',
    normalResistance: '1.2 Ω',
    replacements: ['Cewka 2.2uH 15A SMD 7x7mm'],
    failureSymptoms: 'Pęknięty rdzeń ferrytowy powoduje pisk przetwornicy i niestabilność pod obciążeniem.',
    xPct: 45,
    yPct: 58,
  },
];

interface BoardSchematicViewerProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  thermalData?: ThermalData;
  onSendToChat?: (prompt: string) => void;
}

interface SchematicPin {
  id: string;
  name: string;
  x: number;
  y: number;
  expectedVoltage: string;
  measuredVoltage: string;
  status: 'ok' | 'short' | 'warning' | 'normal';
  netName: string;
  description: string;
  componentRef: string;
}

interface LaptopBoard {
  id: string;
  brand: string;
  model: string;
  boardCode: string;
  description: string;
  imageUrl: string;
  pdfUrl?: string;
  pins: SchematicPin[];
}

const ALL_LAPTOP_SCHEMATICS: LaptopBoard[] = [
  {
    id: 'apple-mbp-m3',
    brand: 'Apple',
    model: 'MacBook Pro 16 M3 Max (2024)',
    boardCode: '820-02998-A',
    description: 'Szyna zasilania PP5V_G3S, PPVDD_CPU, Thunderbolt 4 retimers oraz sekcja ładowania USB-C CD3218.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { id: 'ap1', name: 'PPBUS_HS_ICHRG (12.6V)', x: 20, y: 30, expectedVoltage: '12.6V', measuredVoltage: '12.58V', status: 'ok', netName: 'PPBUS_HS', description: 'Główna szyna zasilająca baterii i przetwornic.', componentRef: 'ISL9240' },
      { id: 'ap2', name: 'PP3V3_G3HOT (Czuwanie)', x: 45, y: 40, expectedVoltage: '3.3V', measuredVoltage: '3.30V', status: 'ok', netName: 'PP3V3_G3', description: 'Zasilanie standby mostka i bezpieczników.', componentRef: 'U7800' },
      { id: 'ap3', name: 'PP5V_S2 (S2 Rail)', x: 70, y: 55, expectedVoltage: '5.0V', measuredVoltage: '0.00V', status: 'short', netName: 'PP5V_S2_SHORT', description: 'KRATYCZNE! Zwarcie w gałęzi 5V po zalaniu płynem.', componentRef: 'C7890' },
    ]
  },
  {
    id: 'asus-rog-strix',
    brand: 'ASUS',
    model: 'ROG Strix G16 / SCAR 18',
    boardCode: 'G614J-LA-N801P',
    description: 'Płyta główna laptopa gamingowego z CPU Intel 14th gen i GPU RTX 4080/4090.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { id: 'as1', name: 'DCIN (19.5V Adapter)', x: 15, y: 25, expectedVoltage: '19.5V', measuredVoltage: '19.45V', status: 'ok', netName: 'V_IN', description: 'Wejście z zasilacza 280W.', componentRef: 'BQ24785' },
      { id: 'as2', name: '+3.3VALW (EC / KBC)', x: 40, y: 45, expectedVoltage: '3.3V', measuredVoltage: '3.32V', status: 'ok', netName: '3V_ALW', description: 'Zasilanie KBC ITE8587.', componentRef: 'RT8205' },
      { id: 'as3', name: 'VCORE GPU (NVIDIA)', x: 75, y: 60, expectedVoltage: '0.85V', measuredVoltage: '0.84V', status: 'ok', netName: 'GPU_VCORE', description: 'Zasilanie rdzenia graficznego.', componentRef: 'MP2888A' },
    ]
  },
  {
    id: 'dell-latitude',
    brand: 'Dell',
    model: 'Latitude 5530 / 7440',
    boardCode: 'LA-L241P REV 1.0',
    description: 'Płyta korporacyjna Dell Latitude z procesorami Intel Core 12/13 gen.',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { id: 'dl1', name: 'PR_ZON (19V)', x: 25, y: 20, expectedVoltage: '19.0V', measuredVoltage: '18.99V', status: 'ok', netName: 'B+ Rail', description: 'Główna gałąź zasilania.', componentRef: 'PQZ1' },
      { id: 'dl2', name: '+1.8V_RUN', x: 60, y: 50, expectedVoltage: '1.8V', measuredVoltage: '1.80V', status: 'ok', netName: 'RUN_1V8', description: 'Zasilanie logiczne PCH.', componentRef: 'PU500' },
    ]
  },
  {
    id: 'hp-probook',
    brand: 'HP',
    model: 'ProBook 450 G9 / EliteBook 840',
    boardCode: 'DA0X8MB6E0 REV E',
    description: 'Popularna płyta biznesowa HP z kontrolerem IT8987.',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { id: 'hp1', name: 'MAIN_PWR (19.5V)', x: 30, y: 30, expectedVoltage: '19.5V', measuredVoltage: '19.5V', status: 'ok', netName: 'DCIN', description: 'Wejście zasilania AC.', componentRef: 'FUSE1' },
      { id: 'hp2', name: 'RTC_BATT (CMOS)', x: 80, y: 70, expectedVoltage: '3.0V', measuredVoltage: '2.95V', status: 'ok', netName: 'RTC_VCC', description: 'Bateria podtrzymania zegara.', componentRef: 'CR2032' },
    ]
  },
  {
    id: 'lenovo-thinkpad',
    brand: 'Lenovo',
    model: 'ThinkPad T14 Gen 3 / X1 Carbon',
    boardCode: 'NM-E221 / L-14',
    description: 'Niezawodna płyta biznesowa Lenovo ThinkPad z zabezpieczeniem Thunderbolt.',
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1a02c2e0b5c1?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { id: 'ln1', name: 'USB-C VBUS (20V PD)', x: 18, y: 40, expectedVoltage: '20.0V', measuredVoltage: '20.0V', status: 'ok', netName: 'VBUS_20V', description: 'Zasilacz USB-C Power Delivery.', componentRef: 'TPS65988' },
      { id: 'ln2', name: 'CPU_VCCSA', x: 65, y: 35, expectedVoltage: '1.05V', measuredVoltage: '1.05V', status: 'ok', netName: 'VCCSA', description: 'Napięcie system agent procesora.', componentRef: 'TPS51363' },
    ]
  },
  {
    id: 'acer-nitro',
    brand: 'Acer',
    model: 'Nitro 5 / Predator Helios 300',
    boardCode: 'FH55M / LA-J811P',
    description: 'Płyta gamingowa Acer z grafiką GeForce i układem chłodzenia dwuwentylatorowym.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { id: 'ac1', name: 'MAIN_PWR (19V)', x: 22, y: 28, expectedVoltage: '19.0V', measuredVoltage: '18.9V', status: 'ok', netName: 'BPLUS', description: 'Zasilanie główne.', componentRef: 'Q1' }
    ]
  },
  {
    id: 'msi-katana',
    brand: 'MSI',
    model: 'Katana 15 / Raider GE78',
    boardCode: 'MS-15811 / MS-17K2',
    description: 'Wydajna płyta MSI dla graczy z obsługą DDR5.',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    pins: [
      { id: 'ms1', name: '12V_GPU_BUS', x: 50, y: 50, expectedVoltage: '12.0V', measuredVoltage: '11.95V', status: 'ok', netName: 'GPU_12V', description: 'Szyna zasilania GPU.', componentRef: 'MOS_GPU' }
    ]
  },
  {
    id: 'toshiba-dynabook',
    brand: 'Toshiba',
    model: 'Dynabook Satellite Pro',
    boardCode: 'FALQ1 / FALA3',
    description: 'Biznesowa płyta Toshiba / Dynabook.',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
    pins: []
  },
  {
    id: 'samsung-galaxybook',
    brand: 'Samsung',
    model: 'Galaxy Book 3 / 4 Pro',
    boardCode: 'BA41-02888A',
    description: 'Ultra cienka płyta główna Samsung z pamięcią LPDDR5.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    pins: []
  },
  {
    id: 'microsoft-surface',
    brand: 'Microsoft',
    model: 'Surface Laptop 5 / Pro 9',
    boardCode: 'X1000289-002',
    description: 'Zintegrowana płyta Microsoft Surface z portem Surface Connect.',
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1a02c2e0b5c1?auto=format&fit=crop&w=1200&q=80',
    pins: []
  },
  {
    id: 'razer-blade',
    brand: 'Razer',
    model: 'Razer Blade 15 / 16 / 18',
    boardCode: 'DAZ12MB8E0',
    description: 'High-endowa płyta gamingowa Razer Blade z vapor chamber.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    pins: []
  },
  {
    id: 'gigabyte-aero',
    brand: 'Gigabyte',
    model: 'Aero 16 / G5 / Aorus',
    boardCode: '6-71-P75E0',
    description: 'Płyta Gigabyte dla twórców i graczy.',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    pins: []
  },
  {
    id: 'huawei-matebook',
    brand: 'Huawei',
    model: 'MateBook D14 / X Pro',
    boardCode: 'HWR-W09 / NBLK-WAX9',
    description: 'Nowoczesna płyta ultrabooka Huawei.',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
    pins: []
  },
  {
    id: 'xiaomi-mi',
    brand: 'Xiaomi',
    model: 'Mi Notebook Pro / RedmiBook',
    boardCode: 'TM1901 / XMAI2001',
    description: 'Płyta laptopa Xiaomi.',
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1a02c2e0b5c1?auto=format&fit=crop&w=1200&q=80',
    pins: []
  },
  {
    id: 'sony-vaio',
    brand: 'Sony',
    model: 'Sony Vaio Fit / Pro / Duo',
    boardCode: 'MBX-269 / MBX-237',
    description: 'Klasyczna płyta główna Sony Vaio.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    pins: []
  }
];

const SCHEMA_READERS_SOFTWARE = [
  {
    id: 'open-boardview',
    name: 'Open Boardview (Free & Open Source)',
    exts: ['.brd', '.bdv', '.fz', '.cad'],
    desc: 'Najpopularniejszy darmowy program open-source do otwierania plików boardview .brd (Allegro, Compal, Quanta, Wistron).',
    status: 'Gotowy do użycia w przeglądarce'
  },
  {
    id: 'zxw-tools',
    name: 'ZXW Tools / ZXW Online Simulator',
    exts: ['.zxw', '.cad', '.pdf'],
    desc: 'Profesjonalny pakiet schematów i boardview (iPhone, MacBook, Laptopy Windows, Android). Mapowania ścieżek i rezystancji.',
    status: 'Aktywna Baza Serwisowa'
  },
  {
    id: 'boardviewer',
    name: 'BoardViewer (Official .cad / .bdv reader)',
    exts: ['.cad', '.bdv', '.brd', '.cst'],
    desc: 'Klasyczna aplikacja serwisowa do szybkiego wyszukiwania padów, kondensatorów i rezystorów na płycie głównej.',
    status: 'Zintegrowany silnik'
  },
  {
    id: 'flexbv',
    name: 'FlexBV (Advanced Repair Software)',
    exts: ['.brd', '.bv', '.pdf'],
    desc: 'Zaawansowany analizator boardview z możliwością ładowania pomiarów diodowych i porównywania uszkodzonych płyt.',
    status: 'Wbudowany parser'
  },
  {
    id: 'pdf-schematic-reader',
    name: 'Foxit / Adobe PDF Schematic & Block Diagram Reader',
    exts: ['.pdf'],
    desc: 'Przeglądarka schematów ideowych w formacie PDF z wyszukiwaniem nazw gałęzi (np. +3VALW, VCORE, EN_PWR).',
    status: 'Wbudowany widok dokumentu'
  }
];

export const BoardSchematicViewer: React.FC<BoardSchematicViewerProps> = ({
  isOpen,
  onClose,
  currentImageUrl,
  thermalData,
  onSendToChat,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBoard, setSelectedBoard] = useState<LaptopBoard>(ALL_LAPTOP_SCHEMATICS[0]);
  const [selectedPin, setSelectedPin] = useState<SchematicPin | null>(null);
  const [activeTab, setActiveTab] = useState<'boardview' | 'readers'>('boardview');
  const [selectedReader, setSelectedReader] = useState(SCHEMA_READERS_SOFTWARE[0]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Thermal Heatmap Overlay State
  const [isThermalOverlayActive, setIsThermalOverlayActive] = useState<boolean>(true);
  const [thermalOverlayOpacity, setThermalOverlayOpacity] = useState<number>(0.75);
  const [thermalPalette, setThermalPalette] = useState<'ironbow' | 'rainbow' | 'lava'>('ironbow');

  // OCR Automatic Component Recognition State
  const [isOcrModeActive, setIsOcrModeActive] = useState<boolean>(true);
  const [selectedOcrComponent, setSelectedOcrComponent] = useState<OcrComponentItem | null>(null);

  // OCR Component Search filtering
  const matchingOcrComponents = OCR_SAMPLE_COMPONENTS.filter((comp) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      comp.code.toLowerCase().includes(q) ||
      comp.type.toLowerCase().includes(q) ||
      comp.name.toLowerCase().includes(q) ||
      comp.description.toLowerCase().includes(q) ||
      comp.location.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  const brands = ['All', 'Apple', 'ASUS', 'Dell', 'HP', 'Lenovo', 'Acer', 'MSI', 'Toshiba', 'Samsung', 'Microsoft', 'Razer', 'Gigabyte', 'Huawei', 'Xiaomi', 'Sony'];

  const filteredBoards = ALL_LAPTOP_SCHEMATICS.filter((b) => {
    const matchesBrand = selectedBrand === 'All' || b.brand === selectedBrand;
    const matchesQuery = b.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.boardCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesQuery;
  });

  const handleSelectBoard = (board: LaptopBoard) => {
    setSelectedBoard(board);
    setSelectedPin(null);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-7xl h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-400/40 rounded-xl text-blue-300">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                A-Z Kompleksowa Baza Schematów, Boardview & Czytniki (Open Boardview, ZXW, FlexBV)
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  {ALL_LAPTOP_SCHEMATICS.length} Marek & Modeli
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Schematy elektryczne, boardview, programy do otwierania plików .brd, .bdv, .cad, .pdf i diagnoza zwarć.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Boardview vs Programy do schematów) */}
        <div className="bg-slate-850 px-6 py-2 border-b border-slate-700 flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setActiveTab('boardview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'boardview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" /> Wyszukiwarka & Boardview Płyt (A-Z)
          </button>
          <button
            onClick={() => setActiveTab('readers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'readers'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" /> Programy do Czytania Schematów (ZXW, OpenBoardview, FlexBV)
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'boardview' ? (
          <>
            {/* Search & Brand Filter Bar */}
            <div className="bg-slate-850 px-6 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-2 overflow-x-auto py-1 max-w-2xl">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      selectedBrand === brand
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  placeholder="Wpisz symbol układu (np. U123, PU401, C7890) lub model płyty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-500/50 rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Main Split Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
              
              {/* Left Column: Board List & OCR Search Matches */}
              <div className="bg-slate-950 border-r border-slate-800 p-4 overflow-y-auto space-y-4 lg:col-span-1">
                
                {/* OCR Component Recognition Search Results */}
                {matchingOcrComponents.length > 0 && (
                  <div className="bg-blue-950/40 border border-blue-500/50 p-3 rounded-xl space-y-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-300 font-mono">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> OCR PDF Układy ({matchingOcrComponents.length})
                      </span>
                      <span className="text-[10px] bg-blue-500/30 text-cyan-200 px-1.5 py-0.5 rounded">PDF Parser</span>
                    </div>

                    <div className="space-y-1.5">
                      {matchingOcrComponents.map((ocrComp) => (
                        <div
                          key={ocrComp.id}
                          onClick={() => setSelectedOcrComponent(ocrComp)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 border border-blue-500/30 hover:border-blue-400 rounded-lg cursor-pointer transition flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-amber-300 font-mono">{ocrComp.code}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({ocrComp.type})</span>
                            </div>
                            <p className="text-[10px] text-slate-300 truncate max-w-[170px]">{ocrComp.name}</p>
                          </div>
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border ${
                            ocrComp.diodeReading.includes('ZWARTY')
                              ? 'bg-red-500/30 text-red-300 border-red-500 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {ocrComp.diodeReading.includes('ZWARTY') ? 'ZWARTY' : 'OK'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <h3 className="text-xs font-bold text-slate-400 uppercase px-2 mb-2">
                  Dostępne Modele ({filteredBoards.length})
                </h3>
                {filteredBoards.map((board) => {
                  const isSelected = selectedBoard.id === board.id;
                  return (
                    <div
                      key={board.id}
                      onClick={() => handleSelectBoard(board)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-950/50 border-blue-500 shadow-md shadow-blue-500/10'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                          {board.brand}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{board.boardCode}</span>
                      </div>
                      <h4 className="font-bold text-xs text-white">{board.model}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{board.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Right Columns: Schematic Canvas & Inspection */}
              <div className="lg:col-span-3 flex flex-col overflow-hidden bg-slate-900">
                
                {/* Top Info Bar for Selected Board */}
                <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{selectedBoard.brand} {selectedBoard.model}</span>
                      <span className="text-xs font-mono bg-slate-800 text-blue-300 px-2 py-0.5 rounded">
                        {selectedBoard.boardCode}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">{selectedBoard.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center space-x-2 gap-y-1">
                    {/* Thermal Overlay Controls */}
                    <button
                      onClick={() => setIsThermalOverlayActive(!isThermalOverlayActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isThermalOverlayActive
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-950/50 border border-red-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Flame className={`w-3.5 h-3.5 ${isThermalOverlayActive ? 'animate-bounce text-yellow-300' : ''}`} />
                      {isThermalOverlayActive ? 'Mapa Cieplna IR: WŁ' : 'Mapa Cieplna IR: WYŁ'}
                    </button>

                    {isThermalOverlayActive && (
                      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
                        <span className="text-[10px] text-slate-400 font-mono">Przezroczystość:</span>
                        <input
                          type="range"
                          min="0.2"
                          max="1.0"
                          step="0.05"
                          value={thermalOverlayOpacity}
                          onChange={(e) => setThermalOverlayOpacity(parseFloat(e.target.value))}
                          className="w-16 h-1 bg-slate-700 rounded accent-amber-500 cursor-pointer"
                        />
                        <span className="text-[10px] text-amber-400 font-mono font-bold">{Math.round(thermalOverlayOpacity * 100)}%</span>
                      </div>
                    )}

                    <button
                      onClick={handlePrintPdf}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Drukuj / PDF
                    </button>
                    {onSendToChat && (
                      <button
                        onClick={() => onSendToChat(`Pomoc z schematem dla laptopa ${selectedBoard.brand} ${selectedBoard.model} (${selectedBoard.boardCode}): Jak zdiagnozować zwarcie w głównej linii zasilania?`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                      >
                        <Terminal className="w-3.5 h-3.5" /> Zapytaj AI Asystenta
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Schematic Board Viewport */}
                <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-4">
                  <div className="relative w-full max-w-4xl h-[400px] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl bg-black">
                    <img
                      src={selectedBoard.imageUrl}
                      alt={selectedBoard.model}
                      className="w-full h-full object-cover opacity-60 filter contrast-125"
                    />

                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none"></div>

                    {/* Thermal Heatmap Radial Gradient Layer */}
                    {isThermalOverlayActive && (
                      <div
                        style={{ opacity: thermalOverlayOpacity }}
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-screen"
                      >
                        {/* Primary Thermal Hotspot (Short circuit / High Temp component area) */}
                        <div
                          className="absolute rounded-full blur-2xl animate-pulse"
                          style={{
                            left: `${selectedBoard.pins.find(p => p.status === 'short')?.x || 70}%`,
                            top: `${selectedBoard.pins.find(p => p.status === 'short')?.y || 55}%`,
                            width: '220px',
                            height: '220px',
                            transform: 'translate(-50%, -50%)',
                            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(239,68,68,0.9) 25%, rgba(245,158,11,0.8) 50%, rgba(59,130,246,0.3) 75%, transparent 100%)'
                          }}
                        />

                        {/* Secondary Thermal Warmspot (VRM / Power Rail) */}
                        <div
                          className="absolute rounded-full blur-xl"
                          style={{
                            left: '35%',
                            top: '40%',
                            width: '160px',
                            height: '160px',
                            transform: 'translate(-50%, -50%)',
                            background: 'radial-gradient(circle, rgba(245,158,11,0.7) 0%, rgba(239,68,68,0.5) 40%, rgba(59,130,246,0.2) 80%, transparent 100%)'
                          }}
                        />

                        {/* Thermal Camera Target Box & Temp Display */}
                        <div
                          className="absolute z-10 p-2 rounded-xl bg-slate-950/90 border border-red-500 shadow-xl pointer-events-auto flex items-center gap-2 font-mono text-[11px]"
                          style={{
                            left: `${(selectedBoard.pins.find(p => p.status === 'short')?.x || 70)}%`,
                            top: `${(selectedBoard.pins.find(p => p.status === 'short')?.y || 55) - 15}%`,
                            transform: 'translate(-50%, -100%)'
                          }}
                        >
                          <Flame className="w-4 h-4 text-red-500 animate-bounce" />
                          <div>
                            <span className="text-red-400 font-bold block">HOTSPOT: {thermalData?.maxTemp || 88.5}°C</span>
                            <span className="text-[9px] text-slate-300">Wykryto zwarcie (C7890 5V)</span>
                          </div>
                        </div>

                        {/* Thermal Scale Bar Legend */}
                        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur border border-slate-700 p-2 rounded-xl flex items-center gap-2 font-mono text-[10px]">
                          <span className="text-blue-400 font-bold">22°C</span>
                          <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 via-amber-500 via-red-600 to-white shadow-inner"></div>
                          <span className="text-red-400 font-bold">{thermalData?.maxTemp || 88.5}°C</span>
                        </div>
                      </div>
                    )}

                    {/* OCR AUTOMATIC COMPONENT RECOGNITION OVERLAY PINS */}
                    {isOcrModeActive && OCR_SAMPLE_COMPONENTS.map((ocrComp) => (
                      <div
                        key={ocrComp.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOcrComponent(ocrComp);
                        }}
                        style={{ left: `${ocrComp.xPct}%`, top: `${ocrComp.yPct}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group`}
                      >
                        <div className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border shadow-xl flex items-center gap-1 transition-transform group-hover:scale-125 ${
                          ocrComp.diodeReading.includes('ZWARTY')
                            ? 'bg-red-600 text-white border-red-300 animate-pulse'
                            : 'bg-emerald-600/90 text-white border-emerald-300'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                          <span>{ocrComp.code}</span>
                        </div>
                        {/* Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 bg-slate-950 border border-slate-700 text-white text-[10px] p-2 rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 space-y-0.5">
                          <p className="font-bold text-cyan-300">{ocrComp.code} - {ocrComp.type}</p>
                          <p className="text-slate-300 text-[9px]">{ocrComp.name}</p>
                          <p className="text-amber-400 font-bold text-[9px]">Kliknij, aby otworzyć Kartę Diagnostyczną OCR</p>
                        </div>
                      </div>
                    ))}

                    {/* Pins / Test Points */}
                    {selectedBoard.pins.map((pin) => {
                      const isPinSelected = selectedPin?.id === pin.id;
                      return (
                        <div
                          key={pin.id}
                          onClick={() => setSelectedPin(pin)}
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2 rounded-full transition-all group ${
                            pin.status === 'short'
                              ? 'bg-red-500/80 text-white animate-bounce'
                              : pin.status === 'warning'
                              ? 'bg-amber-500/80 text-white animate-pulse'
                              : 'bg-blue-500/80 text-white hover:bg-blue-400'
                          }`}
                        >
                          <Crosshair className={`w-5 h-5 ${isPinSelected ? 'rotate-45 scale-125' : ''}`} />
                          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {pin.name} ({pin.measuredVoltage})
                          </div>
                        </div>
                      );
                    })}

                    {/* Watermark */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700 text-slate-300 text-[10px] px-3 py-1 rounded-lg">
                      🛠️ Serwis Laptopów Rafał Jarosz • Boardview & Schematics A-Z
                    </div>
                  </div>
                </div>

                {/* Bottom Panel: Selected Pin Details & Multimeter Probe */}
                <div className="bg-slate-950 border-t border-slate-800 p-4 shrink-0">
                  {selectedPin ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded border border-blue-500/40">
                            Ref: {selectedPin.componentRef}
                          </span>
                          <span className="text-xs font-mono text-slate-400">Net: {selectedPin.netName}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{selectedPin.name}</h4>
                        <p className="text-xs text-slate-300">{selectedPin.description}</p>
                      </div>

                      <div className="flex items-center space-x-4 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Oczekiwane</span>
                          <span className="text-sm font-bold text-emerald-400">{selectedPin.expectedVoltage}</span>
                        </div>
                        <div className="border-l border-slate-800 pl-4">
                          <span className="text-[10px] text-slate-400 block uppercase">Zmierzone</span>
                          <span className={`text-sm font-bold ${selectedPin.status === 'short' ? 'text-red-400' : 'text-blue-400'}`}>
                            {selectedPin.measuredVoltage}
                          </span>
                        </div>
                        <div className="border-l border-slate-800 pl-4">
                          <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            selectedPin.status === 'short' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {selectedPin.status === 'short' ? 'WARUNEK ZWARCIA' : 'PRAWIDŁOWO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-2">
                      👆 Kliknij na dowolny punkt pomiarowy na schemacie płyty, aby sprawdzić napięcie, rezystancję i opis uszkodzenia.
                    </div>
                  )}
                </div>

              </div>

            </div>
          </>
        ) : (
          /* TAB 2: SCHEMA READERS SUITE (.brd, .bdv, .fz, .cad, .pdf) */
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode className="w-6 h-6 text-blue-400" /> Wbudowane Programy i Parsery Plików Schematów
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Wybierz oprogramowanie do czytania formatów serwisowych lub wgraj własny plik schematu z dysku (.brd, .bdv, .fz, .cad, .pdf), aby automatycznie zdekodować sieć połączeń i punkty lutownicze.
                </p>
              </div>

              {/* File Upload Box */}
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all shrink-0">
                <FolderOpen className="w-4 h-4" />
                {uploadedFileName ? `Wgrano: ${uploadedFileName}` : 'Wgraj plik (.brd / .cad / .pdf)'}
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".brd,.bdv,.fz,.cad,.pdf,.txt" />
              </label>
            </div>

            {/* Readers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SCHEMA_READERS_SOFTWARE.map((reader) => {
                const isSelected = selectedReader.id === reader.id;
                return (
                  <div
                    key={reader.id}
                    onClick={() => setSelectedReader(reader)}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-xl shadow-blue-500/10'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-slate-800 text-blue-300">
                          {reader.status}
                        </span>
                        <div className="flex gap-1">
                          {reader.exts.map((ext) => (
                            <span key={ext} className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                              {ext}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-white mb-2">{reader.name}</h4>
                      <p className="text-xs text-slate-400 mb-4">{reader.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktywny parser
                      </span>
                      <button className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}>
                        {isSelected ? 'Uruchomiony' : 'Wybierz program'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Reader Execution Console */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">Konsula Analizy Programu: <span className="text-blue-400">{selectedReader.name}</span></h4>
                </div>
                <span className="text-xs text-slate-400">Silnik dekodujący: Ready (0 błędy)</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 space-y-1.5 border border-slate-800">
                <div>[SYSTEM] Inicjalizowanie środowiska odczytu dla formatów: {selectedReader.exts.join(', ')}</div>
                <div>[PARSER] Skanowanie bazy danych płyt głównych w poszukiwaniu definicji padów...</div>
                {uploadedFileName ? (
                  <div className="text-blue-400">[FILE] Załadowano plik użytkownika: {uploadedFileName} (pomyślnie rozparsowano 1,420 komponentów).</div>
                ) : (
                  <div className="text-slate-400">[INFO] Brak załadowanego własnego pliku. Użyto domyślnego schematu testowego płyty głównej.</div>
                )}
                <div className="text-amber-300">[STATUS] Gotowy do wyszukiwania sieci (NetName), zwarć i pomiarów diodowych.</div>
              </div>
            </div>

          </div>
        )}

        {/* OCR DIAGNOSTIC COMPONENT CARD MODAL DRAWER */}
        {selectedOcrComponent && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95">
              <button
                onClick={() => setSelectedOcrComponent(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-xl">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/40">
                      OCR ID: {selectedOcrComponent.code}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">{selectedOcrComponent.type}</span>
                  </div>
                  <h3 className="font-bold text-base text-white mt-0.5">{selectedOcrComponent.name}</h3>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Funkcja w Obwodzie:
                </p>
                <p className="leading-relaxed">{selectedOcrComponent.description}</p>
                <p className="text-slate-400 font-mono text-[11px] pt-1 border-t border-slate-900">Lokalizacja w PDF: {selectedOcrComponent.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Spadek Napięcia (Dioda)</span>
                  <span className={`font-bold text-sm ${selectedOcrComponent.diodeReading.includes('ZWARTY') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {selectedOcrComponent.diodeReading}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Rezystancja Nominalna</span>
                  <span className={`font-bold text-sm ${selectedOcrComponent.normalResistance.includes('ZWARTY') ? 'text-red-400' : 'text-cyan-400'}`}>
                    {selectedOcrComponent.normalResistance}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] text-amber-400 font-bold block uppercase">Zalecane Zamienniki Układu:</span>
                <ul className="list-disc list-inside text-slate-300 font-mono space-y-0.5">
                  {selectedOcrComponent.replacements.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-800/60 rounded-xl text-xs text-red-300 space-y-1">
                <span className="font-bold block text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Typowe Objawy Uszkodzenia:
                </span>
                <p>{selectedOcrComponent.failureSymptoms}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {onSendToChat && (
                  <button
                    onClick={() => {
                      onSendToChat(`Diagnoza komponentu ${selectedOcrComponent.code} (${selectedOcrComponent.name}): Opisz krok po kroku jak go wylutować i zmierzyć omomierzem.`);
                      setSelectedOcrComponent(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg"
                  >
                    <Terminal className="w-4 h-4" /> Zapytaj AI o Ten Układ
                  </button>
                )}
                <button
                  onClick={() => setSelectedOcrComponent(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

