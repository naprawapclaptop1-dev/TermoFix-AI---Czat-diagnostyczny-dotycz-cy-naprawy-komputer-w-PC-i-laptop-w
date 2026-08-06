import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Camera,
  Flame,
  Zap,
  Cpu,
  HardDrive,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Laptop,
  Monitor,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  Video,
  Check,
  HelpCircle,
  Sliders,
  RotateCcw
} from 'lucide-react';

export type DeviceCategory = 'laptop' | 'desktop';

export interface ChecklistItem {
  id: string;
  titlePl: string;
  descriptionPl: string;
  category: 'visual' | 'thermal' | 'electrical' | 'bios' | 'system';
  isMandatory: boolean;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'NA';
  note: string;
  photoUrl?: string;
  videoUrl?: string;
}

export interface StepProtocol {
  stepNumber: number;
  titlePl: string;
  subtitlePl: string;
  iconName: string;
  items: ChecklistItem[];
}

const LAPTOP_PROTOCOL: StepProtocol[] = [
  {
    stepNumber: 1,
    titlePl: '1. Inspekcja Wizualna (Normalna Kamera, Zdjęcia & Wideo)',
    subtitlePl: 'Ocena fizyczna stanu płyty głównej, gniazd i obudowy pod mikroskopem / kamerą',
    iconName: 'camera',
    items: [
      {
        id: 'lap-vis-1',
        titlePl: 'Ślady zalania cieczą i korozja elektrolityczna',
        descriptionPl: 'Dokładny przegląd drobnicy SMD, nóżek układów QFN/BGA pod kątem białego/zielonego nalotu śniedzi.',
        category: 'visual',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-vis-2',
        titlePl: 'Stan gniazda zasilania DC-IN / USB-C Power Delivery',
        descriptionPl: 'Sprawdzenie wyłamanych pinów, zwęglenia plastiku gniazda, popękanych lutów mocujących do laminate.',
        category: 'visual',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-vis-3',
        titlePl: 'Mechaniczne uszkodzenia płytki PCB i elementów SMD',
        descriptionPl: 'Weryfikacja wyrwanych kondensatorów filtracyjnych wokół śrub chłodzenia, pęknięć laminatu po upadku.',
        category: 'visual',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-vis-4',
        titlePl: 'Stan taśm matrycy eDP/LVDS oraz złącza ekranu',
        descriptionPl: 'Sprawdzenie sprofanowanych pinów zasilania podświetlenia 19V w złączu matrycy.',
        category: 'visual',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
  {
    stepNumber: 2,
    titlePl: '2. Badanie Kamera Termowizyjną (IR Thermal Audit)',
    subtitlePl: 'Wykrywanie miejscowych zwarć i przeciążeń prądowych w podczerwieni',
    iconName: 'flame',
    items: [
      {
        id: 'lap-thm-1',
        titlePl: 'Test Termowizyjny Standby (Przed naciśnięciem włącznika)',
        descriptionPl: 'Podłączenie zasilacza serwisowego z ograniczeniem prądowym 1A. Skanowanie układów ALW 3.3V/5V, KBC, PCH.',
        category: 'thermal',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-thm-2',
        titlePl: 'Próba Zwarciowa 19V VIN / B+ w Podczerwieni',
        descriptionPl: 'Aplikacja napięcia 1V-3V na główną linię zasilania i obserwacja nagrzewania tranzystorów MOSFET / kondensatorów MLCC.',
        category: 'thermal',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-thm-3',
        titlePl: 'Rozkład Temperatur Sekcji VCORE / VRAM podczas uruchamiania',
        descriptionPl: 'Weryfikacja czy faza zasilania procesora i GPU równomiernie oddaje ciepło na radiatory chłodzenia.',
        category: 'thermal',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
  {
    stepNumber: 3,
    titlePl: '3. Pomiary Rezystancji i Napięć Multimetrem',
    subtitlePl: 'Sprawdzenie linii zasilających w omach (Ω) oraz napięć na cewkach zasilania',
    iconName: 'zap',
    items: [
      {
        id: 'lap-ele-1',
        titlePl: 'Rezystancja głównej linii 19V (VIN / B+) do masy',
        descriptionPl: 'Wartość prawidłowa: >100kΩ. Rezystancja bliska 0Ω oznacza zwarcie w linii głównej.',
        category: 'electrical',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-ele-2',
        titlePl: 'Rezystancje cewek przetwornic LDO / ALW (3.3V i 5V)',
        descriptionPl: 'Sprawdzenie wyjść przetwornicy Standby. Niska rezystancja (<10Ω) na 3.3V oznacza uszkodzenie KBC/PCH.',
        category: 'electrical',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-ele-3',
        titlePl: 'Rezystancja linii VCORE CPU i VDD1 / VDD2 RAM',
        descriptionPl: 'Pomiary niskoomowe rdzenia (zwykle 2-15Ω dla nowoczesnych CPU). Upewnij się, że nie ma pełnego zwarcia 0.1Ω.',
        category: 'electrical',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-ele-4',
        titlePl: 'Sygnał ac_in / charger ic (BQ24780S/ISL88739)',
        descriptionPl: 'Napięcia komunikacji chargera z kablem zasilającym (ACDET, REGN 6V, ACOK).',
        category: 'electrical',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
  {
    stepNumber: 4,
    titlePl: '4. Komunikacja KBC, Sygnały Sterujące & Wsad BIOS',
    subtitlePl: 'Sekwencja startowa, reset sygnałowy i weryfikacja kości SPI Flash',
    iconName: 'cpu',
    items: [
      {
        id: 'lap-bio-1',
        titlePl: 'Zasilanie i komunikacja układu KBC (EC_RST#, LID_SW#)',
        descriptionPl: 'Obecność zasilania VCC 3.3V na nóżce KBC oraz stabilny stan wysoki na czujniku otwarcia klapy (LID_SW# 3.3V).',
        category: 'bios',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-bio-2',
        titlePl: 'Napięcie zasilania i impulsy na kości BIOS SPI (Winbond/GigaDevice)',
        descriptionPl: 'Odczyt linii CS#, CLK i VCC (1.8V lub 3.3V) w pierwszej sekundzie po podłączeniu zasilania.',
        category: 'bios',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-bio-3',
        titlePl: 'Programowanie czystego wsadu BIOS z czyszczeniem ME-Region',
        descriptionPl: 'Wgrywanie sprawdzonego wsadu z dedykowanym Clear ME w przypadku braku obrazu (POST Error).',
        category: 'bios',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
  {
    stepNumber: 5,
    titlePl: '5. Diagnostic Stress Test, SMART Dysku & Weryfikacja końcowa',
    subtitlePl: 'Testy stabilności systemu pod obciążeniem oraz diagnostyka dysku',
    iconName: 'hard-drive',
    items: [
      {
        id: 'lap-sys-1',
        titlePl: 'Skanowanie dysku SSD NVMe / SATA (Atrybuty SMART)',
        descriptionPl: 'Sprawdzenie zliczeń niepoprawnych bloków (05, C5, C6), temperatury pracy kontrolera SSD oraz sprawności %.',
        category: 'system',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-sys-2',
        titlePl: 'Test stabilności GPU i RAM (MemTest86 / FurMark / MODS)',
        descriptionPl: '30-minutowy stress-test termiczno-prądowy w celu wykluczenia zawieszania się pod obciążeniem.',
        category: 'system',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'lap-sys-3',
        titlePl: 'Sprawdzenie sprawności ładowania baterii i balansu ogniw',
        descriptionPl: 'Weryfikacja prądu ładowania (Charge Rate) w programie BatteryInfoView oraz stanu zużycia Wear Level.',
        category: 'system',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
];

const DESKTOP_PROTOCOL: StepProtocol[] = [
  {
    stepNumber: 1,
    titlePl: '1. Inspekcja Wizualna Stacjonarna (Kamera, ZDJĘCIA / WIDEO)',
    subtitlePl: 'Sprawdzenie obudowy PC, sekcji VRM, banków RAM i złączy PCIe',
    iconName: 'camera',
    items: [
      {
        id: 'dt-vis-1',
        titlePl: 'Stan pinów w gnieździe procesora LGA / PGA (Socket CPU)',
        descriptionPl: 'Inspekcja mikroskopowa zgiętych lub wyłamanych pinów w socokecie Intel (LGA1700/1200) lub AMD (AM5/AM4).',
        category: 'visual',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-vis-2',
        titlePl: 'Stan kondensatorów polimerowych / elektrolitycznych',
        descriptionPl: 'Weryfikacja wybulonych kondensatorów filtrujących w sekcji zasilania CPU i złączach kart rozszerzeń.',
        category: 'visual',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-vis-3',
        titlePl: 'Uszkodzenia mechaniczne złącza PCIe x16 oraz slotów RAM',
        descriptionPl: 'Sprawdzenie wyrwanych zatrzasków karty graficznej, pękniętych ścieżek sygnałowych wokół slotu PCIe.',
        category: 'visual',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
  {
    stepNumber: 2,
    titlePl: '2. Termowizja Płyty ATX i Karty Graficznej GPU',
    subtitlePl: 'Analiza emisji ciepła na laminacie ATX, mostku PCH oraz karcie GPU',
    iconName: 'flame',
    items: [
      {
        id: 'dt-thm-1',
        titlePl: 'Termowizyjny skan linii ATX 24-PIN & EPS 8-PIN (Standby 5VSB)',
        descriptionPl: 'Obserwacja nagrzewania mostka PCH lub układu Super I/O po podłączeniu zasilacza ATX bez włączania komputer.',
        category: 'thermal',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-thm-2',
        titlePl: 'Audyt termiczny sekcji VRM (DrMOS / MOSFETy zasilania CPU)',
        descriptionPl: 'Skanowanie temperatur dławików i tranzystorów faz zasilania pod obciążeniem (rozkojarzenie faz >85°C).',
        category: 'thermal',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-thm-3',
        titlePl: 'Termowizja kości VRAM i rdzenia GPU na dedykowanej karcie',
        descriptionPl: 'Lokalizacja przegrzewającej się kości pamięci GDDR6/GDDR6X na laminacie karty graficznej.',
        category: 'thermal',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
  {
    stepNumber: 3,
    titlePl: '3. Pomiary Rezystancji i Napięć Linii Zasilania ATX',
    subtitlePl: 'Kontrola linii +12V, +5V, +3.3V, +5VSB oraz VCORE, VRAM',
    iconName: 'zap',
    items: [
      {
        id: 'dt-ele-1',
        titlePl: 'Pomiar rezystancji do masy na wtyku ATX 24-Pin (+12V, +5V, +3.3V)',
        descriptionPl: 'Upewnienie się, że linie wyjściowe zasilacza nie mają zwarcia do masy przed włączeniem zasilacza.',
        category: 'electrical',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-ele-2',
        titlePl: 'Rezystancja linii EPS 12V zasilającej CPU',
        descriptionPl: 'Sprawdzenie tranzystorów faz zasilania CPU. Zwarcie 0Ω oznacza przebity tranzystor MOSFET Górnej Gałęzi.',
        category: 'electrical',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-ele-3',
        titlePl: 'Pomiary zasilania szyny PCIe (+12V i +3.3V złącza GPU)',
        descriptionPl: 'Pomiary linii zasilających na gnieździe rozszerzeń grafiki pod kątem przeskoku zwarciowego.',
        category: 'electrical',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
  {
    stepNumber: 4,
    titlePl: '4. Sygnał PWR_OK, Kody POST i Flash BIOS z przycisku',
    subtitlePl: 'Analiza głośniczka PC-Speaker / diod EZ Debug LED i komunikatorów POST',
    iconName: 'cpu',
    items: [
      {
        id: 'dt-bio-1',
        titlePl: 'Odczyt diod stanu EZ Debug LED (CPU / DRAM / VGA / BOOT)',
        descriptionPl: 'Zidentyfikowanie etapu, na którym płyta zatrzymuje proces inicjalizacji POST.',
        category: 'bios',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-bio-2',
        titlePl: 'Pomiar sygnału PWR_OK (Gray Wire 5V z zasilacza ATX)',
        descriptionPl: 'Sprawdzenie czy zasilacz potwierdza wystawienie stabilnych napięć sygnałem Power Good.',
        category: 'bios',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-bio-3',
        titlePl: 'Aktualizacja / Ratunkowy Flash BIOS przez Q-Flash / Flashback',
        descriptionPl: 'Wgrywanie najnowszej wersji mikrokodu CPU w przypadku nieobsługiwanego procesora nowej generacji.',
        category: 'bios',
        isMandatory: false,
        status: 'PENDING',
        note: '',
      },
    ],
  },
  {
    stepNumber: 5,
    titlePl: '5. Skaner Stabilności, Dysk SMART & Raport Końcowy PC',
    subtitlePl: 'Kompleksowa weryfikacja pod kątem restartów, BSOD i błędów danych',
    iconName: 'hard-drive',
    items: [
      {
        id: 'dt-sys-1',
        titlePl: 'Skaner kondycji dysków SSD/HDD (Atrybuty SMART)',
        descriptionPl: 'Sprawdzenie ilości przerezerwowanych sektorów, błędów CRC transmisji kabla SATA/NVMe.',
        category: 'system',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
      {
        id: 'dt-sys-2',
        titlePl: 'Test syntetyczny CPU + GPU (OCCT Power Supply Test)',
        descriptionPl: 'Maksymalny pobór prądu przez pełny zestaw w celu przetestowania zabezpieczeń OCP/OVP zasilacza.',
        category: 'system',
        isMandatory: true,
        status: 'PENDING',
        note: '',
      },
    ],
  },
];

interface DiagnosticWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const DiagnosticWizardModal: React.FC<DiagnosticWizardModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>('laptop');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [protocols, setProtocols] = useState<StepProtocol[]>(LAPTOP_PROTOCOL);

  // Switch category
  const handleSelectCategory = (cat: DeviceCategory) => {
    setDeviceCategory(cat);
    setProtocols(cat === 'laptop' ? LAPTOP_PROTOCOL : DESKTOP_PROTOCOL);
    setActiveStep(1);
  };

  // Toggle item status
  const handleItemStatusChange = (stepIdx: number, itemId: string, status: 'PENDING' | 'PASS' | 'FAIL' | 'NA') => {
    const updated = protocols.map((step, sIdx) => {
      if (sIdx !== stepIdx) return step;
      return {
        ...step,
        items: step.items.map((it) => (it.id === itemId ? { ...it, status } : it)),
      };
    });
    setProtocols(updated);
  };

  // Update item note
  const handleItemNoteChange = (stepIdx: number, itemId: string, note: string) => {
    const updated = protocols.map((step, sIdx) => {
      if (sIdx !== stepIdx) return step;
      return {
        ...step,
        items: step.items.map((it) => (it.id === itemId ? { ...it, note } : it)),
      };
    });
    setProtocols(updated);
  };

  // Attach photo note mock
  const handleAttachPhotoMock = (stepIdx: number, itemId: string) => {
    const photoPrompt = prompt('Wprowadź link do zdjęcia z inspekcji (lub nazwij plik ze zdjęciem):');
    if (!photoPrompt) return;
    const updated = protocols.map((step, sIdx) => {
      if (sIdx !== stepIdx) return step;
      return {
        ...step,
        items: step.items.map((it) => (it.id === itemId ? { ...it, photoUrl: photoPrompt } : it)),
      };
    });
    setProtocols(updated);
  };

  // Reset checklist
  const handleResetChecklist = () => {
    setProtocols(deviceCategory === 'laptop' ? LAPTOP_PROTOCOL : DESKTOP_PROTOCOL);
    setActiveStep(1);
  };

  // Calculate statistics
  const allItems = protocols.flatMap((s) => s.items);
  const totalCount = allItems.length;
  const passCount = allItems.filter((i) => i.status === 'PASS').length;
  const failCount = allItems.filter((i) => i.status === 'FAIL').length;
  const naCount = allItems.filter((i) => i.status === 'NA').length;
  const checkedCount = passCount + failCount + naCount;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  // Generate AI Diagnosis Report Prompt
  const handleGenerateAIReport = () => {
    if (!onSendToChat) return;

    let reportText = `[KREATOR DIAGNOSTYKI SERWISOWEJ - RAPORT STANDARDOWY]\n`;
    reportText += `Kategoria Sprzętu: ${deviceCategory === 'laptop' ? 'Laptop / Notebook' : 'Komputer Stacjonarny PC'}\n`;
    reportText += `Postęp Protokołu Testowego: ${progressPercent}% (${checkedCount}/${totalCount} kroków wykonanych)\n`;
    reportText += `Wyniki ogólne: POZYTYWNE [${passCount}], BŁĘDY/AWARIE [${failCount}], N/A [${naCount}]\n\n`;

    reportText += `--- PEŁNY PROTOKÓŁ BADANIA ---\n`;
    protocols.forEach((step) => {
      reportText += `\n📌 ${step.titlePl}:\n`;
      step.items.forEach((item) => {
        const symbol =
          item.status === 'PASS'
            ? '✅ PASSED'
            : item.status === 'FAIL'
            ? '❌ FAILED'
            : item.status === 'NA'
            ? '⚪ N/A'
            : '⏳ NIEPRZEPROWADZONO';

        reportText += `- [${symbol}] ${item.titlePl}`;
        if (item.note) {
          reportText += ` | UWAGI: "${item.note}"`;
        }
        if (item.photoUrl) {
          reportText += ` | DOWÓD WIDEO/ZDJĘCIE: ${item.photoUrl}`;
        }
        reportText += `\n`;
      });
    });

    reportText += `\n=== PROŚBA DO ASYSTENTA AI ===\n`;
    reportText += `Przeanalizuj powyższy protokół badania sprzętu. Podaj końcową diagnozę usterki, wskaż z dużym prawdopodobieństwem uszkodzone komponenty, oszacuj trudność naprawy oraz podaj zalecane kolejne kroki lutownicze i serwisowe.`;

    onSendToChat(reportText);
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = protocols[activeStep - 1];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-amber-500 to-red-600 p-2.5 rounded-2xl text-slate-950 font-bold shadow-lg shadow-red-950/50">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Kreator Diagnozy &amp; Protokół Testowy
                </h2>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  STANDARD PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ustrukturyzowana ścieżka weryfikacji: Zdjecia/Wideo inspekcyjne, Termowizja, Multimetr, BIOS &amp; SMART
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetChecklist}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 rounded-xl border border-slate-700 transition"
              title="Resetuj cały protokół"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Device Category Selector & Progress Bar */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Toggle Laptop / Desktop */}
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 shrink-0">
              <button
                onClick={() => handleSelectCategory('laptop')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  deviceCategory === 'laptop'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Laptop / Notebook</span>
              </button>

              <button
                onClick={() => handleSelectCategory('desktop')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  deviceCategory === 'desktop'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Komputer Stacjonarny PC</span>
              </button>
            </div>

            {/* Overall Stats Pills */}
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                OK: <strong>{passCount}</strong>
              </span>
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg">
                Błędy: <strong>{failCount}</strong>
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg">
                Postęp: <strong>{progressPercent}%</strong>
              </span>
            </div>

          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                failCount > 0 ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* ANIMATED INTERACTIVE DIAGNOSTIC FLOW PATH (Ścieżka Naprawy) */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              INTERAKTYWNY PRZEPŁYW DIAGNOSTYCZNY (DIAGNOSTIC FLOW PATH):
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Ścieżka: Pomiar ➔ Analiza ➔ Naprawa ➔ Test</span>
          </div>

          <div className="relative flex items-center justify-between gap-1 overflow-x-auto py-2">
            {/* Background Animated Pipeline Glowing Wire Line */}
            <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-500 transition-all duration-500 relative"
                style={{ width: `${((activeStep - 1) / (protocols.length - 1)) * 100}%` }}
              >
                {/* Flow signal pulse animation */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/80 blur-sm animate-pulse"></div>
              </div>
            </div>

            {/* Interactive Flow Nodes */}
            {[
              { id: 1, label: 'Pomiar', sub: 'Inspekcja & Termo', icon: Camera },
              { id: 2, label: 'Audyt IR', sub: 'Kamera Podczerwieni', icon: Flame },
              { id: 3, label: 'Analiza', sub: 'Multimetr & Linie', icon: Zap },
              { id: 4, label: 'Naprawa', sub: 'Flash BIOS & BGA', icon: Cpu },
              { id: 5, label: 'Test', sub: 'Stabilność SMART', icon: HardDrive },
            ].map((node) => {
              const NodeIcon = node.icon;
              const stepData = protocols[node.id - 1];
              const isCurrent = node.id === activeStep;
              const isPast = node.id < activeStep;
              const hasFail = stepData?.items.some((i) => i.status === 'FAIL');
              const isComplete = stepData?.items.every((i) => i.status !== 'PENDING');

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveStep(node.id)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group shrink-0"
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 border shadow-xl ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110 shadow-amber-500/50 ring-4 ring-amber-500/20'
                        : hasFail
                        ? 'bg-red-950 text-red-300 border-red-500 animate-bounce'
                        : isComplete || isPast
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-5 h-5 text-emerald-400 font-black" />
                    ) : hasFail ? (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <NodeIcon className={`w-4 h-4 ${isCurrent ? 'text-slate-950 font-bold' : ''}`} />
                    )}
                  </div>

                  <div className="text-center mt-1.5 space-y-0.5">
                    <span
                      className={`block text-[11px] font-bold font-mono transition-colors ${
                        isCurrent ? 'text-amber-400 scale-105' : 'text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {node.label}
                    </span>
                    <span className="block text-[9px] text-slate-500 font-mono whitespace-nowrap">{node.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-2 overflow-x-auto flex items-center space-x-2 shrink-0">
          {protocols.map((step) => {
            const isCurrent = step.stepNumber === activeStep;
            const stepItems = step.items;
            const hasFail = stepItems.some((i) => i.status === 'FAIL');
            const isComplete = stepItems.every((i) => i.status !== 'PENDING');

            return (
              <button
                key={step.stepNumber}
                onClick={() => setActiveStep(step.stepNumber)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border ${
                  isCurrent
                    ? 'bg-slate-800 text-amber-400 border-amber-500/60 shadow'
                    : hasFail
                    ? 'bg-red-950/30 text-red-300 border-red-500/30'
                    : isComplete
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950'
                    : hasFail
                    ? 'bg-red-500 text-slate-950'
                    : isComplete
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {step.stepNumber}
                </span>
                <span className="truncate max-w-[140px] sm:max-w-none">{step.titlePl.split('.')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Step Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Step Header info */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                {currentStepData.titlePl}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentStepData.subtitlePl}
              </p>
            </div>
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl font-mono shrink-0">
              Krok {activeStep} z {protocols.length}
            </span>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {currentStepData.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.status === 'PASS'
                    ? 'bg-slate-950/80 border-emerald-500/40'
                    : item.status === 'FAIL'
                    ? 'bg-red-950/20 border-red-500/60 ring-1 ring-red-500/30'
                    : item.status === 'NA'
                    ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Item Description */}
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-100">
                        {item.titlePl}
                      </span>
                      {item.isMandatory && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                          WYMAGANE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.descriptionPl}
                    </p>
                  </div>

                  {/* Pass / Fail / NA Status Buttons */}
                  <div className="flex items-center space-x-1.5 shrink-0 self-start md:self-center">
                    <button
                      onClick={() => handleItemStatusChange(activeStep - 1, item.id, 'PASS')}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        item.status === 'PASS'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-slate-900 text-emerald-400 border-slate-700 hover:bg-emerald-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PRAWIDŁOWY</span>
                    </button>

                    <button
                      onClick={() => handleItemStatusChange(activeStep - 1, item.id, 'FAIL')}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        item.status === 'FAIL'
                          ? 'bg-red-600 text-white border-red-400 shadow-md animate-pulse'
                          : 'bg-slate-900 text-red-400 border-slate-700 hover:bg-red-500/20'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>USTERKA / BŁĄD</span>
                    </button>

                    <button
                      onClick={() => handleItemStatusChange(activeStep - 1, item.id, 'NA')}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-mono border transition ${
                        item.status === 'NA'
                          ? 'bg-slate-700 text-slate-200 border-slate-600'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      N/A
                    </button>
                  </div>

                </div>

                {/* Additional Technician Notes & Media Input */}
                <div className="mt-3 pt-3 border-t border-slate-900/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={item.note}
                    onChange={(e) => handleItemNoteChange(activeStep - 1, item.id, e.target.value)}
                    placeholder="Wpisz wynik pomiaru (np. 0.2Ω na B+, zalanie przy PU10, śniedź na piniach)..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 font-mono"
                  />

                  <button
                    onClick={() => handleAttachPhotoMock(activeStep - 1, item.id)}
                    className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition shrink-0 ${
                      item.photoUrl
                        ? 'bg-purple-950/60 text-purple-300 border-purple-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                    title="Załącz zdjęcie z inspekcji mikro/zwykłej kamery"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.photoUrl ? 'Foto/Wideo Załączone' : 'Załącz Foto/Wideo'}</span>
                  </button>
                </div>

                {item.photoUrl && (
                  <div className="mt-2 text-[11px] text-purple-300 bg-purple-950/30 border border-purple-500/30 px-3 py-1 rounded-lg font-mono flex items-center justify-between">
                    <span>Załączony dowód: {item.photoUrl}</span>
                    <button
                      onClick={() => handleItemNoteChange(activeStep - 1, item.id, '')}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Footer Navigation & Generate AI Summary */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs px-4 py-2 rounded-xl border border-slate-700 transition font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Poprzedni Krok</span>
            </button>

            <button
              onClick={() => setActiveStep((prev) => Math.min(protocols.length, prev + 1))}
              disabled={activeStep === protocols.length}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs px-4 py-2 rounded-xl border border-slate-700 transition font-bold"
            >
              <span>Następny Krok</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {onSendToChat && (
              <button
                onClick={handleGenerateAIReport}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center space-x-2 transition"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Wygeneruj Diagnozę AI z Protokołu</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
