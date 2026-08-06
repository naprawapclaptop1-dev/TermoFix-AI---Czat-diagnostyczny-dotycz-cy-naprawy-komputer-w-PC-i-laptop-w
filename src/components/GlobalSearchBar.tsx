import React, { useState, useRef, useEffect } from 'react';
import { Search, Database, Notebook, Cpu, ArrowRight, X, Zap, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import { RepairJournalEntry } from '../types';

export interface SearchResultItem {
  id: string;
  source: 'error_db' | 'journal' | 'component_kb';
  categoryLabel: string;
  title: string;
  subtitle: string;
  details: string;
  rawItem?: any;
}

// Built-in Component Knowledge Base items
const COMPONENT_KNOWLEDGE_ITEMS = [
  {
    id: 'ckb-1',
    title: 'Główna Szyna Zasilania 19V / 20V VIN',
    subtitle: 'Sekcja Wejściowa & Klucze MOSFET High-Side',
    details: 'Napięcie: 19.0V - 20.0V. Test diodowy: >0.400V (300k+ Ω). Próba zwarciowa: maks. 1V / 1A. Najczęstsze awarie: przebity kondensator ceramiczny SMD, zwarte tranzystory wejściowe MOSFET (AON6504), uszkodzony sterownik ładowania BQ24780S.',
    modalType: 'multimeter',
    aiPrompt: 'Szukam informacji technicznych i schematu diagnostyki dla Głównej Szyny Zasilającej 19V VIN w laptopie. Jak wykonać próbę zwarciową i zidentyfikować uszkodzony MOSFET?',
  },
  {
    id: 'ckb-2',
    title: 'Szyna Gotowości +3.3V ALW / +5V ALW',
    subtitle: 'Przetwornica Główna Standby (PU1) & KBC',
    details: 'Napięcie: 3.3V i 5.0V ALW. Test diodowy: >0.300V. Przetwornice RT8206A / TPS51125. Zwarte 3.3V LDO sygnalizuje najczęściej uszkodzony procesor KBC (IT8586E / MEC1653) lub chip BIOS.',
    modalType: 'multimeter',
    aiPrompt: 'Jak zdiagnozować brak napięć stanów gotowości +3.3V ALW / +5V ALW na płycie głównej laptopa? Podaj kolejność pomiarów pinów VIN, EN, LDO i VREG.',
  },
  {
    id: 'ckb-3',
    title: 'Kości Pamięci BGA VRAM (GDDR6 / GDDR5)',
    subtitle: 'Banki A0, A1, B0, B1 & Testy MATS/MODS Nvidia',
    details: 'Diagnostyka kodów Menedżera Urządzeń (Kod 43). Wykrywanie uszkodzonych bitów w bankach VRAM komendą ./mats -e 20. Reballing układów BGA, kulki Sn63/Pb37 (temp. 183°C) lub zmiana profilu rezystorów Straps / ID Config.',
    modalType: 'bga',
    aiPrompt: 'Nvidia Karta Graficzna zgłasza błąd Kod 43. Wklejam logi z testu MATS/MODS. Wyjaśnij jak zidentyfikować uszkodzony bank VRAM (np. Bank A0 / A1) i przeprowadzić wymianę kości BGA.',
  },
  {
    id: 'ckb-4',
    title: 'Sekcja Zasilania Procesora CPU VCORE / VCCGT',
    subtitle: 'DrMOS, Smart Power Stage & Controller PWM',
    details: 'Napięcie: 0.8V - 1.2V. Oporność do masy: 5 - 20 Ω (NISKA OPORNOŚĆ JEST NORMALNA!). Zwykle wykorzystuje tranzystory FDMF6808N / AOZ5117QI oraz kondensatory tantalowe POSCAP / NEC TOKIN 330uF.',
    modalType: 'multimeter',
    aiPrompt: 'Jak sprawdzić czy niska oporność na linii VCORE CPU to prawidłowy opór rdzenia procesora czy zwarte tranzystory DrMOS zasilania?',
  },
  {
    id: 'ckb-5',
    title: 'Układ KBC / Super I/O (IT8586E / MEC1653 / KB9022)',
    subtitle: 'Kontroler Włącznika, Ładowania, Klawiatury & Wentylatorów',
    details: 'Odbiera sygnał z przycisku Power (PWR_SW#), wysyła sygnał wybudzenia EC_RESET#, steruje bramkami ładowania baterii i komunikacją po szynie SMBus/LPC.',
    modalType: 'multimeter',
    aiPrompt: 'Laptop nie reaguje na przycisk włącznika. Jak sprawdzić sygnały KBC IT8586E: LID_SW#, EC_RESET#, ACIN, PM_SLP_S3# i wsad programowalny?',
  },
  {
    id: 'ckb-6',
    title: 'Zaprogramowany Chip BIOS SPI Flash (W25Q128 / MX25L128)',
    subtitle: 'Czyszczenie ME Region & Wsad UEFI',
    details: 'Zasilanie: 1.8V lub 3.3V na pinie 8 VCC. Objawy uszkodzenia: laptop włącza się, pobór prądu 0.350A, brak obrazu (No Post), kręcą się wentylatory. Wymaga weryfikacji sumy kontrolnej i wymiany/czyszczenia ME Region.',
    modalType: 'windows',
    aiPrompt: 'Laptop włącza się z czarnym ekranem (No Display). Jak poprawnie wyczyścić Intel ME-Region w pliku binarnym BIOS SPI Flash i wgrać go programatorem RT809F/CH341A?',
  },
  {
    id: 'ckb-7',
    title: 'Podkładka Zmiany Fazy PTM7950 & Termopady VRM',
    subtitle: 'Regeneracja Chłodzenia & Pasta Termoprzewodząca',
    details: 'Zmiennofazowy materiał PTM7950 (3100 W/mK) topnieje przy 45°C eliminując pęcherzyki powietrza na rdzeniach GPU/CPU. Do sekcji VRM/DrMOS stosuje się termopady 15 W/mK o dokładnej grubości (0.5mm / 1.0mm / 1.5mm).',
    modalType: 'gpu',
    aiPrompt: 'Jak prawidłowo nałożyć podkładkę termoprzewodzącą PTM7950 oraz dobrać grubość termopadów na sekcję VRM i kości VRAM w karcie graficznej?',
  },
  {
    id: 'ckb-8',
    title: 'Stanowisko Testów Obciążeniowych CPU/GPU (Stress Test)',
    subtitle: 'FurMark, Prime95, OCCT, AIDA64, Monitorowanie HotSpot & Throttling',
    details: 'Procedura testowania stabilności pod obciążeniem TDP 100%. Monitorowanie temperatur CPU Core, GPU HotSpot, VRAM, MOSFET VRM oraz wyliczanie delty temperatur.',
    modalType: 'gpu',
    aiPrompt: 'Jak przeprowadzić procedurę testu obciążeniowego (Stress Test) CPU i GPU? Wyjaśnij wartości graniczne temperatur HotSpot, VRAM oraz wyciskanie pasty pump-out.',
  },
  {
    id: 'ckb-9',
    title: 'Łamacz i Odkodowywanie Haseł BIOS / Master Key Calculator',
    subtitle: 'Dell, HP System Disabled, ThinkPad EEPROM 24C08, InsydeH2O',
    details: 'Generowanie haseł ratunkowych Master Passcode na podstawie Service Tag / System Disabled Code. Procedury zworkowe CLRP1/CLRP2 i bypass linii SDA/SCL.',
    modalType: 'windows',
    aiPrompt: 'Jak odblokować zablokowany BIOS w laptopie Dell/HP/ThinkPad? Jak podglądnąć lub zresetować hasło Supervisor Password za pomocą Master Key lub zworki?',
  },
  {
    id: 'ckb-10',
    title: 'Sklep Licencji & Dedykowany Instalator Stanowiskowy TermoFix AI',
    subtitle: 'Klucze Aktywacyjne HWID, Instalator .EXE/.BAT na Pulpit, Faktury VAT',
    details: 'Zakup licencji Serwisant Pro oraz Enterprise Lifetime. Pobieranie instalatora desktopowego działającego bez przeglądarki.',
    modalType: 'windows',
    aiPrompt: 'Jak pobrać dedykowaną aplikację TermoFix AI na pulpit oraz jak aktywować klucz licencyjny powiązany z HWID komputera?',
  },
  {
    id: 'ckb-11',
    title: 'Odbiór Obrazu Mikroskopu HDMI / Przejściówka USB Video Capture (UVC Grabber)',
    subtitle: 'Inspekcja Mikrolutowania, Ścieżek PCB, Kul BGA, Piny HDMI & Zwarcia',
    details: 'Bezpośredni podgląd wideo 4K/1080p z mikroskopu stereoskopowego z chwytakiem USB HDMI. Filtry detekcji krawędzi lutu, inwersja kolorów miedzi, celownik BGA, skala 500µm i zrzut klatek HD do chatu AI.',
    modalType: 'bga',
    aiPrompt: 'Jak skonfigurować mikroskop HDMI z kartą przechwytującą USB Video Capture do inspekcji lutowania BGA i ścieżek PCB na żywo?',
  },
];

// Error Code Database static items reference
const ERROR_DB_ITEMS = [
  {
    id: 'db-1',
    codeOrName: 'Kod 43 (Code 43)',
    titlePl: 'Menedżer Urządzeń zgłasza zatrzymanie karty graficznej',
    symptoms: 'Karta GPU z żółtym wykrzyknikiem. Brak obrazu 3D, niska rozdzielczość.',
    quickDiagnosis: '1. Uszkodzenie kostki VRAM (błąd linii danych MATS). 2. Zimny lut pod rdzeniem GPU. 3. Brak napięcia NVVDD / FBVDD.',
  },
  {
    id: 'db-2',
    codeOrName: 'Kod 10 (Code 10)',
    titlePl: 'Nie można uruchomić tego urządzenia',
    symptoms: 'Karta sieciowa Wi-Fi / Audio / Controller USB nie odpowiada.',
    quickDiagnosis: 'Brak zasilania LDO (3.3V_ALW) lub przerwana linia danych PCIe/USB.',
  },
  {
    id: 'db-3',
    codeOrName: '0x0000007B (INACCESSIBLE_BOOT_DEVICE)',
    titlePl: 'Błąd dostępu do partycji rozruchowej Windows',
    symptoms: 'Niebieski ekran podczas ładowania systemu po zmianie trybu AHCI/NVMe lub awarii dysku.',
    quickDiagnosis: 'Brak sterownika NVMe/AHCI lub uszkodzony sektor rozruchowy BCD.',
  },
  {
    id: 'db-4',
    codeOrName: 'WHEA_UNCORRECTABLE_ERROR',
    titlePl: 'Sprzętowy błąd krytyczny procesora / pamięci',
    symptoms: 'Niewyjaśnione zawieszenia komputera pod obciążeniem.',
    quickDiagnosis: 'Niestabilne napięcie VCORE, niestabilny RAM lub uszkodzony kontroler pamięci w CPU.',
  },
  {
    id: 'db-5',
    codeOrName: 'BQ24780S / BQ24725A',
    titlePl: 'Smart Battery Charger IC (Kontroler Ładowania)',
    symptoms: 'Laptop nie ładuje baterii, miga dioda zasilania, brak przełączania zasilacza na baterię.',
    quickDiagnosis: 'Pin 1 (VCC 19V), Pin 6 (ACDET 2.6V), Pin 28 (PHASE), Pin 24 (REGN 6V).',
  },
  {
    id: 'db-6',
    codeOrName: 'RT8206A / TPS51125',
    titlePl: 'Dual Step-Down Controller (Przetwornica 3.3V / 5V ALW)',
    symptoms: 'Całkowity brak reakcji na włącznik, pobór prądu z zasilacza 0.000A.',
    quickDiagnosis: 'Pin 16 (VIN 19V), Pin 13 (EN0 3.3V), Pin 3 (VREG3 3.3V LDO), Pin 17 (VREG5 5V LDO).',
  },
  {
    id: 'db-7',
    codeOrName: 'AON6504 / FDMC8884',
    titlePl: 'N-Channel Power MOSFET 30V 85A (High-Side / Low-Side)',
    symptoms: 'Zwarcie do masy na linii 19V VIN. Zasilacz serwisowy natychmiast ogranicza prąd C.C.',
    quickDiagnosis: 'Diode test Dren-Źródło: spadek 0.450V. Jeśli 0.001V - zwarcie wewnętrzne.',
  },
  {
    id: 'db-8',
    codeOrName: '19V VIN / BATT_V Rail',
    titlePl: 'Główna szyna zasilająca płyty głównej laptopa',
    symptoms: 'Brak zasilania na całej płycie głównej.',
    quickDiagnosis: 'Oporność do masy norma: > 100k Ohm. Poniżej 10 Ohm oznacza zwarcie.',
  },
];

interface GlobalSearchBarProps {
  journalEntries?: RepairJournalEntry[];
  onOpenErrorCodeDatabase: () => void;
  onOpenRepairJournal: () => void;
  onOpenMultimeterGuide: () => void;
  onOpenBgaDiagnostics: () => void;
  onOpenGpuDiagnostics: () => void;
  onOpenWindowsRepair: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  journalEntries = [],
  onOpenErrorCodeDatabase,
  onOpenRepairJournal,
  onOpenMultimeterGuide,
  onOpenBgaDiagnostics,
  onOpenGpuDiagnostics,
  onOpenWindowsRepair,
  onSendToChat,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'error_db' | 'journal' | 'component_kb'>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate unified search results
  const getSearchResults = (): SearchResultItem[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // 1. Search Error Code Database
    if (categoryFilter === 'all' || categoryFilter === 'error_db') {
      ERROR_DB_ITEMS.forEach((item) => {
        if (
          item.codeOrName.toLowerCase().includes(q) ||
          item.titlePl.toLowerCase().includes(q) ||
          item.symptoms.toLowerCase().includes(q) ||
          item.quickDiagnosis.toLowerCase().includes(q)
        ) {
          results.push({
            id: `err-${item.id}`,
            source: 'error_db',
            categoryLabel: 'Baza Błędów & PWM',
            title: item.codeOrName,
            subtitle: item.titlePl,
            details: `Symptomy: ${item.symptoms} | Diagnoza: ${item.quickDiagnosis}`,
            rawItem: item,
          });
        }
      });
    }

    // 2. Search Repair Journal Entries
    if (categoryFilter === 'all' || categoryFilter === 'journal') {
      journalEntries.forEach((entry) => {
        if (
          entry.deviceModel.toLowerCase().includes(q) ||
          (entry.clientName && entry.clientName.toLowerCase().includes(q)) ||
          (entry.serialNumber && entry.serialNumber.toLowerCase().includes(q)) ||
          entry.faultCategory.toLowerCase().includes(q) ||
          entry.diagnosisSummary.toLowerCase().includes(q)
        ) {
          results.push({
            id: `jr-${entry.id}`,
            source: 'journal',
            categoryLabel: 'Dziennik Napraw',
            title: `${entry.deviceModel} (${entry.status})`,
            subtitle: `Klient: ${entry.clientName || 'Indywidualny'} | Kat: ${entry.faultCategory}`,
            details: `Diagnoza: ${entry.diagnosisSummary} | Data: ${entry.date}`,
            rawItem: entry,
          });
        }
      });
    }

    // 3. Search Component Knowledge Base
    if (categoryFilter === 'all' || categoryFilter === 'component_kb') {
      COMPONENT_KNOWLEDGE_ITEMS.forEach((comp) => {
        if (
          comp.title.toLowerCase().includes(q) ||
          comp.subtitle.toLowerCase().includes(q) ||
          comp.details.toLowerCase().includes(q)
        ) {
          results.push({
            id: comp.id,
            source: 'component_kb',
            categoryLabel: 'Wiedza o Komponentach',
            title: comp.title,
            subtitle: comp.subtitle,
            details: comp.details,
            rawItem: comp,
          });
        }
      });
    }

    return results;
  };

  const results = getSearchResults();

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);

    if (item.source === 'error_db') {
      onOpenErrorCodeDatabase();
    } else if (item.source === 'journal') {
      onOpenRepairJournal();
    } else if (item.source === 'component_kb') {
      const modalType = item.rawItem?.modalType;
      if (modalType === 'bga') onOpenBgaDiagnostics();
      else if (modalType === 'gpu') onOpenGpuDiagnostics();
      else if (modalType === 'windows') onOpenWindowsRepair();
      else onOpenMultimeterGuide();
    }
  };

  const handleAskAIForResult = (e: React.MouseEvent, item: SearchResultItem) => {
    e.stopPropagation();
    setIsOpen(false);
    if (!onSendToChat) return;

    let prompt = '';
    if (item.source === 'error_db') {
      prompt = `Szukam pełnego schematu naprawczego dla: ${item.title} (${item.subtitle}). Podaj krok po kroku jak zmierzyć ten układ multimetrem i jak rozwiązać usterkę.`;
    } else if (item.source === 'journal') {
      prompt = `Przeanalizujmy archiwalną naprawę z Dziennika dla urządzenia ${item.title}. Symptomy: ${item.subtitle}. Diagnoza: ${item.details}. Podaj sugestie zapobiegawcze i opis naprawy.`;
    } else if (item.source === 'component_kb') {
      prompt = item.rawItem?.aiPrompt || `Przedstaw zaawansowaną wiedzę serwisową i pomiary dla: ${item.title}. Specyfikacja: ${item.details}`;
    }

    onSendToChat(prompt);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md w-full">
      
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Szukaj kodu błędów, zlecenia, BQ24780, Kod 43, VRAM..."
          className="w-full bg-slate-950/80 border border-slate-700/80 hover:border-amber-500/60 focus:border-amber-500 rounded-xl pl-9 pr-14 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none transition shadow-inner"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-2.5 hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded shadow-sm pointer-events-none">
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Unified Search Results Dropdown */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[75vh] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Top Filter Tabs */}
          <div className="bg-slate-950 p-2 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium px-2 shrink-0">Wyniki ({results.length}):</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  categoryFilter === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setCategoryFilter('error_db')}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  categoryFilter === 'error_db'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Baza Błędów
              </button>
              <button
                onClick={() => setCategoryFilter('journal')}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  categoryFilter === 'journal'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dziennik
              </button>
              <button
                onClick={() => setCategoryFilter('component_kb')}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  categoryFilter === 'component_kb'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Komponenty
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="p-2 overflow-y-auto space-y-1.5 divide-y divide-slate-800/60">
            {results.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2 opacity-70" />
                Brak pasujących wyników dla: <span className="text-white font-semibold">"{query}"</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Spróbuj wpisać inną frazę, np. <code className="text-amber-400 font-mono">19V</code>, <code className="text-amber-400 font-mono">Kod 43</code>, <code className="text-amber-400 font-mono">BQ24780</code>, <code className="text-amber-400 font-mono">VRAM</code>
                </p>
              </div>
            ) : (
              results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className="p-3 rounded-xl hover:bg-slate-800/80 transition cursor-pointer group flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 truncate">
                      {/* Source Badge */}
                      {item.source === 'error_db' && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 shrink-0">
                          <Database className="w-3 h-3" /> Baza Błędów
                        </span>
                      )}
                      {item.source === 'journal' && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 shrink-0">
                          <Notebook className="w-3 h-3" /> Dziennik
                        </span>
                      )}
                      {item.source === 'component_kb' && (
                        <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 shrink-0">
                          <Cpu className="w-3 h-3" /> Komponent
                        </span>
                      )}

                      <span className="font-bold text-slate-100 group-hover:text-amber-300 transition truncate">
                        {item.title}
                      </span>
                    </div>

                    {/* Ask AI Action */}
                    {onSendToChat && (
                      <button
                        onClick={(e) => handleAskAIForResult(e, item)}
                        className="opacity-90 sm:opacity-0 group-hover:opacity-100 transition bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 shrink-0"
                        title="Skonsultuj wynik z Asystentem AI Gemini"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Zapytaj AI</span>
                      </button>
                    )}
                  </div>

                  <div className="text-slate-300 font-medium text-[11px]">
                    {item.subtitle}
                  </div>

                  <div className="text-slate-400 text-[10.5px] line-clamp-2 leading-relaxed bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60 font-mono">
                    {item.details}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer info */}
          <div className="bg-slate-950 p-2.5 border-t border-slate-800 flex justify-between items-center text-[10.5px] text-slate-400">
            <span>Kliknij pozycję, aby otworzyć właściwy moduł diagnostyczny</span>
            <span className="font-mono text-amber-400">TermoFix Global Search</span>
          </div>

        </div>
      )}

    </div>
  );
};
