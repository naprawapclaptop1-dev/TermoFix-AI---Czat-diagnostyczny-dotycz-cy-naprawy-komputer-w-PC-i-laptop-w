import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Calendar, User, FileText, FileSpreadsheet, Download, Filter, Plus, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, Sparkles, Database, Tag, Trash2, Copy, Send, HardDrive, Laptop } from 'lucide-react';
import { ChatMessage, DiagnosticCardData } from '../types';

export interface JournalEntry {
  id: string;
  customerName: string;
  deviceModel: string;
  serialNumber: string;
  date: string;
  status: 'Naprawiono' | 'W trakcie' | 'Oczekuje na części' | 'Nieoplacalna';
  faultSummary: string;
  peakTemp: string;
  suspectComponent: string;
  repairCostEstimated: string;
  technicianNotes: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  laptopModel: string;
  symptom: string;
  solution: string;
  affectedComponents: string;
  tags: string[];
  createdAt: string;
}

const DEFAULT_KB_ENTRIES: KnowledgeBaseEntry[] = [
  {
    id: 'kb-001',
    laptopModel: 'Asus ROG Strix G15 (G513Q / G513)',
    symptom: 'Zwarcie do masy na głównej linii 19V DC-IN (VIN). Zasilacz przechodzi w ochronę CC.',
    solution: 'Przebity MOSFET górnej gałęzi PQ202 (AON6504) w fazie VCORE. Po wymianie tranzystora oraz kondensatora ceramicznego MLCC C12 (10uF 25V) napięcie powraca do 19.5V.',
    affectedComponents: 'PQ202 (AON6504), C12 (MLCC 10uF)',
    tags: ['#zwarcie', '#19v', '#vcore', '#mosfet', '#asus'],
    createdAt: '2026-08-01',
  },
  {
    id: 'kb-002',
    laptopModel: 'Lenovo Legion 5 15ACH6H / 15ARH05',
    symptom: 'Brak ładowania baterii, mruga czerwona dioda USB-C PD, płyta nie wstaje z zasilacza.',
    solution: 'Przepalony rezystor bocznikowy pomiarowy PR102 (0.01 Ohm 1206 1%) oraz uszkodzony układ ładowania BMS BQ24780S (PU101). Po wymianie obu elementów ładowanie wynosi 3.8A.',
    affectedComponents: 'PR102 (0.01R 1206), PU101 (BQ24780S)',
    tags: ['#charging', '#bq24780s', '#pr102', '#lenovo', '#bms'],
    createdAt: '2026-07-28',
  },
  {
    id: 'kb-003',
    laptopModel: 'Acer Nitro 5 AN515-55 / AN515-57',
    symptom: 'Czarny ekran, włącznik świeci, wentylatory kręcą na 100%, brak obrazu na HDMI.',
    solution: 'Uszkodzony wsad SPI Flash EC/BIOS z powdowu spadku napięcia baterii CMOS. Przeprogramowano układ W25Q128JV (U12) z czystym ME-Region v15.0.',
    affectedComponents: 'U12 (Winbond W25Q128JV SPI Flash)',
    tags: ['#bios', '#meregion', '#noimage', '#acer', '#ec'],
    createdAt: '2026-07-20',
  },
  {
    id: 'kb-004',
    laptopModel: 'HP Pavilion Gaming 15-dk / Omen 15',
    symptom: 'Nvidia Menedżer Urządzeń zgłasza Kod 43 (Code 43). Zawieszanie sterownika pod obciążeniem.',
    solution: 'Wyryte błędy w testach MATS na kości VRAM Bank B0 (U601 - Samsung K4Z80325BC-HC14). Wymiana kości BGA na nową rozwiązuje problem. Kod 43 zniknął.',
    affectedComponents: 'U601 (Samsung GDDR6 2GB)',
    tags: ['#vram', '#code43', '#mats', '#hp', '#gddr6'],
    createdAt: '2026-07-15',
  },
];

// IndexedDB Helper Functions
const DB_NAME = 'TermoFix_ServiceKB_DB';
const DB_VERSION = 1;
const STORE_NAME = 'knowledge_base';

const openKBDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('laptopModel', 'laptopModel', { unique: false });
        store.createIndex('symptom', 'symptom', { unique: false });
      }
    };
  });
};

export const DEFAULT_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'REP-2026-0801',
    customerName: 'Marek Kowalski',
    deviceModel: 'Asus ROG Strix G15 (G513Q)',
    serialNumber: 'SN-G513Q-99214',
    date: '2026-08-01',
    status: 'Naprawiono',
    faultSummary: 'Zwarcie na linii 19V Main Rail. Przebity tranzystor MOSFET PQ202 w sekcji VCORE.',
    peakTemp: '94.8°C',
    suspectComponent: 'PQ202 (N-Channel MOSFET)',
    repairCostEstimated: '450 PLN',
    technicianNotes: 'Wymieniono PQ202 na nowy element AON6504, wyczyszczono układ chłodzenia i zaaplikowano dołączony termopad PTM7950.',
  },
  {
    id: 'REP-2026-0728',
    customerName: 'Piotr Wiśniewski',
    deviceModel: 'Lenovo Legion 5 15ACH6H',
    serialNumber: 'SN-LEG5-88310',
    date: '2026-07-28',
    status: 'Naprawiono',
    faultSummary: 'GPU Menedżer Urządzeń Code 43. Uszkodzona kość VRAM Bank B0 (U601).',
    peakTemp: '78.2°C',
    suspectComponent: 'U601 (Samsung GDDR6 2GB)',
    repairCostEstimated: '600 PLN',
    technicianNotes: 'Wykonano wymianę kości BGA VRAM U601. Testy MATS przechodzą 100% pozytywnie.',
  },
  {
    id: 'REP-2026-0720',
    customerName: 'Firma TechService Sp. z o.o.',
    deviceModel: 'Dell XPS 15 9500',
    serialNumber: 'SN-DELL-55102',
    date: '2026-07-20',
    status: 'Oczekuje na części',
    faultSummary: 'Uszkodzony kontroler ładowania i BMS BQ24780S oraz zwarcie w linii BATT_V.',
    peakTemp: '89.0°C',
    suspectComponent: 'PU101 (BQ24780S Charger IC)',
    repairCostEstimated: '380 PLN',
    technicianNotes: 'Zamówiono układ PU101 z hurtowni technicznej. Czas oczekiwania 2 dni.',
  },
  {
    id: 'REP-2026-0715',
    customerName: 'Anna Nowak',
    deviceModel: 'HP Pavilion Gaming 15-dk',
    serialNumber: 'SN-HP-112093',
    date: '2026-07-15',
    status: 'Nieoplacalna',
    faultSummary: 'Wypalona dziura w laminacie PCB pod rdzeniem CPU po zalaniu cieczą.',
    peakTemp: '105°C',
    suspectComponent: 'CPU Die / Laminat PCB Layer 3',
    repairCostEstimated: '1800 PLN (Wymiana Płyty)',
    technicianNotes: 'Zwarcie międzywarstwowe na 19V do linii VCC_CORE. Naprawa nieopłacalna, zaproponowano wymianę całej płyty.',
  },
];

interface RepairJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntryToChat?: (entry: JournalEntry) => void;
}

export function RepairJournalModal({ isOpen, onClose, onSelectEntryToChat }: RepairJournalModalProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'knowledge_base'>('journal');
  const [journal, setJournal] = useState<JournalEntry[]>(DEFAULT_JOURNAL_ENTRIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(DEFAULT_JOURNAL_ENTRIES[0]);

  // IndexedDB Knowledge Base State
  const [kbEntries, setKbEntries] = useState<KnowledgeBaseEntry[]>(DEFAULT_KB_ENTRIES);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddingKB, setIsAddingKB] = useState(false);
  const [kbModel, setKbModel] = useState('');
  const [kbSymptom, setKbSymptom] = useState('');
  const [kbSolution, setKbSolution] = useState('');
  const [kbComponents, setKbComponents] = useState('');
  const [kbTagsInput, setKbTagsInput] = useState('');
  const [dbStatus, setDbStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Load from IndexedDB on mount / open
  useEffect(() => {
    let isMounted = true;
    openKBDatabase()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getAllReq = store.getAll();

        getAllReq.onsuccess = () => {
          if (!isMounted) return;
          const items: KnowledgeBaseEntry[] = getAllReq.result || [];
          if (items.length === 0) {
            // Seed database with defaults
            const seedTx = db.transaction(STORE_NAME, 'readwrite');
            const seedStore = seedTx.objectStore(STORE_NAME);
            DEFAULT_KB_ENTRIES.forEach((e) => seedStore.put(e));
            seedTx.oncomplete = () => {
              if (isMounted) {
                setKbEntries(DEFAULT_KB_ENTRIES);
                setDbStatus('ready');
              }
            };
          } else {
            setKbEntries(items);
            setDbStatus('ready');
          }
        };
      })
      .catch((err) => {
        console.warn('IndexedDB fallback to memory:', err);
        if (isMounted) setDbStatus('ready');
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const saveKBToIndexedDB = (entry: KnowledgeBaseEntry) => {
    openKBDatabase()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(entry);
      })
      .catch((err) => console.error('Failed to save to IndexedDB:', err));
  };

  const deleteKBFromIndexedDB = (id: string) => {
    openKBDatabase()
      .then((db) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        setKbEntries((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((err) => console.error('Failed to delete from IndexedDB:', err));
  };

  const handleAddKBEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbModel || !kbSymptom || !kbSolution) return;

    const parsedTags = kbTagsInput
      ? kbTagsInput
          .split(',')
          .map((t) => t.trim())
          .map((t) => (t.startsWith('#') ? t : `#${t}`))
      : ['#serwis', `#${kbModel.toLowerCase().split(' ')[0]}`];

    const newKBItem: KnowledgeBaseEntry = {
      id: `kb-${Date.now()}`,
      laptopModel: kbModel,
      symptom: kbSymptom,
      solution: kbSolution,
      affectedComponents: kbComponents || 'Brak danych',
      tags: parsedTags,
      createdAt: new Date().toISOString().split('T')[0],
    };

    saveKBToIndexedDB(newKBItem);
    setKbEntries((prev) => [newKBItem, ...prev]);
    setIsAddingKB(false);
    setKbModel('');
    setKbSymptom('');
    setKbSolution('');
    setKbComponents('');
    setKbTagsInput('');
  };

  // Form for adding a new report
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState('');
  const [newDevice, setNewDevice] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newFault, setNewFault] = useState('');
  const [newSuspectComponent, setNewSuspectComponent] = useState('');

  // Smart-Suggest database for fault analysis
  const getSmartSuggestions = (faultText: string) => {
    const text = faultText.toLowerCase();

    if (text.includes('19v') || text.includes('zwarcie') || text.includes('vin') || text.includes('zasilacz') || text.includes('cc') || text.includes('brak zasilania') || text.includes('pobór')) {
      return [
        {
          component: 'Tranzystor MOSFET Górnej Gałęzi VIN (PQ202 / PQ302)',
          confidence: '94%',
          reason: 'Wykryto słowa kluczowe zwrotu zasilania. Przebicie dren-źródło w linii 19V to najczęstsza przyczyna zwarcia do masy.',
          action: 'Zmierz rezystancję D-S multimetrem.',
        },
        {
          component: 'Kondensator Ceramiczny MLCC Linia B+ (C7890 / C210)',
          confidence: '88%',
          reason: 'Przebicie dielektryka pod wpływem wysokiego napięcia w gałęzi filtracji głównej.',
          action: 'Użyj kamery termowizyjnej lub próby zwarciowej 2V.',
        },
        {
          component: 'Kontroler Charger IC (BQ24780S / ISL88739)',
          confidence: '76%',
          reason: 'Uszkodzenie obwodu pomiaru prądu ACDET lub diody zabezpieczającej wejście DC-IN.',
          action: 'Sprawdź napięcie ACDET (powinno wynosić ~2.6V).',
        },
      ];
    } else if (text.includes('code 43') || text.includes('vram') || text.includes('artefakt') || text.includes('ekran') || text.includes('paski') || text.includes('grafika')) {
      return [
        {
          component: 'Kość Pamięci VRAM GDDR6 (Bank A1 / U601)',
          confidence: '96%',
          reason: 'Kod błędu Code 43 w Menedżerze Urządzeń zazwyczaj wskazuje uszkodzony sektor pamięci graficznej.',
          action: 'Uruchom test sprawności pamięci MATS / MODS.',
        },
        {
          component: 'Zimne Luty Pod Rdzeniem GPU BGA (Nvidia / AMD)',
          confidence: '89%',
          reason: 'Mikropęknięcia spoin kulkowych BGA po odkształceniu termicznym laminatu.',
          action: 'Wykonaj wstępne wygrzanie (reflow) z topnikiem no-clean.',
        },
        {
          component: 'Przetwornica Zasilania VRAM / NVVDD (PU701)',
          confidence: '72%',
          reason: 'Tętnienia napięcia zasilania pamięci VRAM uniemożliwiające inicjalizację kontrolera.',
          action: 'Sprawdź oscyloskopem poziom tętnień na cewce PL701.',
        },
      ];
    } else if (text.includes('ładunk') || text.includes('bater') || text.includes('ładowania') || text.includes('mruga') || text.includes('dioda')) {
      return [
        {
          component: 'Układ Ładowania Baterii BMS Charger (BQ24780S)',
          confidence: '92%',
          reason: 'Brak komunikacji z pakietem baterii lub przepalony rezystor bocznikowy 10mΩ.',
          action: 'Zmierz spadki napięć na boczniku PR102.',
        },
        {
          component: 'Tranzystor Kluczujący Baterii MOSFET (PQ101)',
          confidence: '84%',
          reason: 'Przebita bramka tranzystora łączącego linię baterii z VIN.',
          action: 'Sprawdź sygnał sterujący BATDRV z chargera.',
        },
        {
          component: 'Kontroler KBC / EC (MEC1404 / IT8586E)',
          confidence: '71%',
          reason: 'Brak autoryzacji zasilacza po szynie SMBus / I2C.',
          action: 'Odczytaj linię EC_SMB_CK1 / EC_SMB_DA1.',
        },
      ];
    } else if (text.includes('reset') || text.includes('wyłącza') || text.includes('temperatura') || text.includes('gorąc') || text.includes('pisk') || text.includes('hałas')) {
      return [
        {
          component: 'Układ Chłodzenia & Pasta PTM7950 / Radiator',
          confidence: '91%',
          reason: 'Wyschnięta pasta termoprzewodząca lub zatkane żeberka radiatora syfem.',
          action: 'Wymień pastę na termopad PTM7950 i przedmuchaj ciepłowód.',
        },
        {
          component: 'Sekcja Zasilania VRM / DrMOS CPU (SPS 90A)',
          confidence: '83%',
          reason: 'Przegrzewanie się jednej z faz zasilania procesora pod obciążeniem.',
          action: 'Sprawdź termowizją równomierność temperatur faz.',
        },
        {
          component: 'Przetwornica Zasilania VCORE (TPS51225)',
          confidence: '70%',
          reason: 'Uszkodzony kondensator Tantalowy / MLCC w obwodzie sprzężenia zwrotnego.',
          action: 'Zmierz napięcie VCORE pod obciążeniem OCCT.',
        },
      ];
    }

    // Default suggestions
    return [
      {
        component: 'Główny Tranzystor MOSFET Zasilania (PQ302)',
        confidence: '78%',
        reason: 'Podstawowy element kluczujący w większości układów zasilania laptopów.',
        action: 'Zweryfikuj przejście na teście diody.',
      },
      {
        component: 'Kondensator Ceramiczny MLCC LDO (C501)',
        confidence: '70%',
        reason: 'Odsprzęganie linii zasilających niskiego napięcia.',
        action: 'Zmierz rezystancję do masy na cewce ALW.',
      },
      {
        component: 'Kontroler KBC / BIOS SPI Flash (W25Q128)',
        confidence: '62%',
        reason: 'Uszkodzenie mikrokodu startowego lub kości pamięci Flash.',
        action: 'Zrób kopię wsadu i zaprogramuj czysty obraz ME Region.',
      },
    ];
  };

  if (!isOpen) return null;

  const filteredEntries = journal.filter((entry) => {
    const matchesSearch =
      entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.faultSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.date.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newDevice) return;

    const newEntry: JournalEntry = {
      id: `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newCustomer,
      deviceModel: newDevice,
      serialNumber: newSerial || 'SN-BRAK',
      date: new Date().toISOString().split('T')[0],
      status: 'W trakcie',
      faultSummary: newFault || 'Diagnostyka wstępna w toku...',
      peakTemp: '75.0°C',
      suspectComponent: newSuspectComponent || getSmartSuggestions(newFault)[0]?.component || 'W trakcie weryfikacji',
      repairCostEstimated: 'Do wyceny',
      technicianNotes: 'Wpis utworzony z automatyczną sugestią AI Smart-Suggest.',
    };

    setJournal([newEntry, ...journal]);
    setSelectedEntry(newEntry);
    setIsAddingNew(false);
    setNewCustomer('');
    setNewDevice('');
    setNewSerial('');
    setNewFault('');
    setNewSuspectComponent('');
  };

  const handleExportWord = (entry: JournalEntry) => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Raport_Serwisowy_${entry.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 25px; color: #0f172a; }
          h1 { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 5px; }
          h2 { color: #0f172a; margin-top: 15px; font-size: 16px; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f1f5f9; }
          .highlight { font-weight: bold; color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>🛠️ TERMOFIX AI - OFICJALNY RAPORT SERWISOWY</h1>
        <p><strong>ID Naprawy:</strong> ${entry.id} | <strong>Data:</strong> ${entry.date} | <strong>Status:</strong> ${entry.status}</p>

        <h2>1. DANE KLIENTA I URZĄDZENIA</h2>
        <table>
          <tr><th>Parametr</th><th>Dane</th></tr>
          <tr><td>Imię i Nazwisko Klienta</td><td>${entry.customerName}</td></tr>
          <tr><td>Model Urządzenia</td><td>${entry.deviceModel}</td></tr>
          <tr><td>Numer Seryjny (S/N)</td><td>${entry.serialNumber}</td></tr>
          <tr><td>Podejrzany Komponent</td><td>${entry.suspectComponent}</td></tr>
          <tr><td>Temperatura Peak (HotSpot)</td><td class="highlight">${entry.peakTemp}</td></tr>
          <tr><td>Szacowany Koszt Naprawy</td><td>${entry.repairCostEstimated}</td></tr>
        </table>

        <h2>2. DIAGNOZA TERMOVISION I NOTATKI INŻYNIERA</h2>
        <p><strong>Podsumowanie Usterki:</strong> ${entry.faultSummary}</p>
        <p><strong>Notatki Serwisowe:</strong> ${entry.technicianNotes}</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Raport_Serwisowy_${entry.id}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = (entry: JournalEntry) => {
    let csv = `\ufeff"ID Naprawy";"Klient";"Model Urządzenia";"S/N";"Data";"Status";"Temperatura Peak";"Podejrzany Element";"Koszt";"Opis Usterki"\n`;
    csv += `"${entry.id}";"${entry.customerName}";"${entry.deviceModel}";"${entry.serialNumber}";"${entry.date}";"${entry.status}";"${entry.peakTemp}";"${entry.suspectComponent}";"${entry.repairCostEstimated}";"${entry.faultSummary.replace(/"/g, '""')}"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dziennik_Napraw_${entry.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportText = (entry: JournalEntry) => {
    const textContent = `====================================================
TERMOFIX AI - RAPORT SERWISOWY
====================================================
Identyfikator Naprawy: ${entry.id}
Data Rejestracji: ${entry.date}
Klient: ${entry.customerName}
Model Urządzenia: ${entry.deviceModel}
Numer Seryjny (S/N): ${entry.serialNumber}
Status Naprawy: ${entry.status}
----------------------------------------------------
Podsumowanie Usterki:
${entry.faultSummary}

Temperatura Krytyczna Hotspot: ${entry.peakTemp}
Podejrzany Element: ${entry.suspectComponent}
Szacowany Koszt: ${entry.repairCostEstimated}

Notatki Inżyniera Serwisu:
${entry.technicianNotes}
====================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Raport_${entry.id}_${entry.customerName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Knowledge Base items
  const filteredKBEntries = kbEntries.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.laptopModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.solution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.affectedComponents.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = !selectedTag || item.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(
    new Set(kbEntries.flatMap((e) => e.tags))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 shadow-2xl space-y-5 my-8 text-slate-100">
        
        {/* Header with Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              {activeTab === 'journal' ? <BookOpen className="w-6 h-6" /> : <HardDrive className="w-6 h-6 text-emerald-400" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                {activeTab === 'journal' ? 'Dziennik Napraw & Raporty' : 'Prywatna Baza Wiedzy Serwisu'}
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs px-2.5 py-0.5 rounded-full font-mono">
                  {activeTab === 'journal' ? `${journal.length} Zapisanych Napraw` : `${kbEntries.length} Rozwiązań (IndexedDB)`}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-normal">
                {activeTab === 'journal'
                  ? 'Wyszukuj i przeglądaj historię diagnostyki po nazwisku klienta, modelu laptopa lub dacie.'
                  : 'Lokalna, prywatna baza sprawdzonych rozwiązań serwisowych dla konkretnych modeli laptopów przechowywana w IndexedDB.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition self-start sm:self-auto"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition ${
              activeTab === 'journal'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Dziennik Raportów Serwisowych
          </button>

          <button
            onClick={() => setActiveTab('knowledge_base')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition ${
              activeTab === 'knowledge_base'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-300" /> Prywatna Baza Wiedzy (IndexedDB)
          </button>
        </div>

        {/* ================= TAB 1: DZIENNIK NAPRAW ================= */}
        {activeTab === 'journal' ? (
          <>
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Szukaj po nazwisku klienta, modelu, S/N lub usterce..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg text-xs py-2 px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Wszystkie Statusy</option>
                  <option value="Naprawiono">Naprawiono</option>
                  <option value="W trakcie">W trakcie</option>
                  <option value="Oczekuje na części">Oczekuje na części</option>
                  <option value="Nieoplacalna">Nieopłacalna</option>
                </select>

                <button
                  onClick={() => setIsAddingNew(!isAddingNew)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Nowy Raport
                </button>
              </div>
            </div>

            {/* Add New Entry Drawer Form */}
            {isAddingNew && (
              <form onSubmit={handleAddEntry} className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-3 animate-fadeIn">
                <h3 className="text-xs font-bold text-cyan-400">Dodaj Nowy Raport Diagnostyczny do Dziennika:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Imię i Nazwisko Klienta"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Model Urządzenia (np. Asus Strix G15)"
                    value={newDevice}
                    onChange={(e) => setNewDevice(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Numer Seryjny S/N"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200"
                  />
                </div>
                <textarea
                  placeholder="Opis usterki i spostrzeżenia diagnostyczne..."
                  value={newFault}
                  onChange={(e) => setNewFault(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                />

                <div className="p-3 bg-slate-900/90 border border-cyan-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      SMART-SUGGEST AI: Podpowiedzi 3 Prawdopodobnych Komponentów:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {getSmartSuggestions(newFault).map((sugg, idx) => (
                      <div
                        key={idx}
                        onClick={() => setNewSuspectComponent(sugg.component)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all space-y-1 ${
                          newSuspectComponent === sugg.component
                            ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950/50 scale-[1.02]'
                            : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-cyan-300 text-[10px]"># {idx + 1} Sonda</span>
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.2 rounded font-bold">
                            {sugg.confidence}
                          </span>
                        </div>
                        <p className="font-bold text-[11px] text-slate-100 leading-tight">{sugg.component}</p>
                        <p className="text-[9px] text-slate-400 leading-tight">{sugg.reason}</p>
                        <p className="text-[9px] text-emerald-400 font-mono font-semibold pt-1 border-t border-slate-900">
                          💡 {sugg.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Podejrzany Komponent / Element"
                  value={newSuspectComponent}
                  onChange={(e) => setNewSuspectComponent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2 text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs text-slate-400 px-3 py-1.5 hover:text-slate-200"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg"
                  >
                    Zapisz Raport
                  </button>
                </div>
              </form>
            )}

            {/* Table & Details Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Table Side */}
              <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <div className="max-h-[360px] overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 z-10 font-semibold">
                      <tr>
                        <th className="p-3">Data &amp; ID</th>
                        <th className="p-3">Klient</th>
                        <th className="p-3">Model</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-slate-500">
                            Brak pasujących raportów napraw w dzienniku.
                          </td>
                        </tr>
                      ) : (
                        filteredEntries.map((entry) => (
                          <tr
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            className={`cursor-pointer transition hover:bg-slate-900/80 ${
                              selectedEntry?.id === entry.id ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : ''
                            }`}
                          >
                            <td className="p-3 font-mono">
                              <div className="text-slate-200 font-semibold">{entry.id}</div>
                              <div className="text-[10px] text-slate-500">{entry.date}</div>
                            </td>
                            <td className="p-3 font-medium text-slate-200">
                              {entry.customerName}
                            </td>
                            <td className="p-3 text-slate-300 max-w-[140px] truncate">
                              {entry.deviceModel}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  entry.status === 'Naprawiono'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : entry.status === 'W trakcie'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                    : entry.status === 'Oczekuje na części'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                                }`}
                              >
                                {entry.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Report Detail Side */}
              <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                {selectedEntry ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 font-semibold">{selectedEntry.id}</span>
                        <h3 className="text-sm font-bold text-slate-100">{selectedEntry.deviceModel}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleExportWord(selectedEntry)}
                          className="px-2 py-1 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1 transition shadow font-bold"
                        >
                          <FileText className="w-3 h-3 text-blue-200" />
                          Word
                        </button>

                        <button
                          onClick={() => handleExportExcel(selectedEntry)}
                          className="px-2 py-1 text-xs text-white bg-teal-700 hover:bg-teal-600 rounded-lg flex items-center gap-1 transition shadow font-bold"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-teal-200" />
                          Excel
                        </button>

                        <button
                          onClick={() => handleExportText(selectedEntry)}
                          className="px-2 py-1 text-xs text-cyan-300 bg-cyan-950 border border-cyan-500/30 hover:bg-cyan-900 rounded-lg flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3" />
                          TXT
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Klient:</span>
                        <span className="font-semibold text-slate-200">{selectedEntry.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Numer Seryjny S/N:</span>
                        <span className="font-mono text-slate-300">{selectedEntry.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hotspot Termowizji:</span>
                        <span className="font-mono text-amber-400 font-bold">{selectedEntry.peakTemp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Podejrzany Element:</span>
                        <span className="font-mono text-purple-300">{selectedEntry.suspectComponent}</span>
                      </div>
                    </div>

                    <div className="space-y-1 border-t border-slate-800 pt-3">
                      <div className="text-[11px] font-semibold text-slate-400">Opis Usterki:</div>
                      <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        {selectedEntry.faultSummary}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400">Notatki Inżyniera:</div>
                      <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        {selectedEntry.technicianNotes}
                      </p>
                    </div>

                    {onSelectEntryToChat && (
                      <button
                        onClick={() => {
                          onSelectEntryToChat(selectedEntry);
                          onClose();
                        }}
                        className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        Przeanalizuj ten przypadek z Asystentem AI
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Wybierz przypadek z tabeli po lewej stronie.
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          /* ================= TAB 2: PRYWATNA BAZA WIEDZY (INDEXEDDB) ================= */
          <div className="space-y-4">
            
            {/* Top Bar: Search, Tags Filter, Add Button */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Przeszukuj Baza Wiedzy (np. Asus Strix, Code 43, #19v, BQ24780S)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 font-mono"
                  />
                </div>

                <button
                  onClick={() => setIsAddingKB(!isAddingKB)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shrink-0 font-mono"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj Rozwiązanie do IndexedDB
                </button>
              </div>

              {/* Tag Filtering Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-900 text-xs">
                <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-400" /> Tagi:
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                    selectedTag === null
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Wszystkie ({kbEntries.length})
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                      selectedTag === tag
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:text-emerald-300 border border-slate-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Add Knowledge Entry Form */}
            {isAddingKB && (
              <form onSubmit={handleAddKBEntry} className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-3 animate-fadeIn">
                <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Database className="w-4 h-4" /> Dodaj Nowe Rozwiązanie do Prywatnej Bazy Wiedzy (IndexedDB):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Model Laptopa (np. Asus ROG Strix G15 G513)"
                    value={kbModel}
                    onChange={(e) => setKbModel(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-800 rounded-lg text-xs p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Wymienione Komponenty (np. PQ202, C12 MLCC 10uF)"
                    value={kbComponents}
                    onChange={(e) => setKbComponents(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg text-xs p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Symptom / Objaw Usterki (np. Zwarcie 19V, brak obrazu, dioda mruga)"
                  value={kbSymptom}
                  onChange={(e) => setKbSymptom(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
                <textarea
                  placeholder="Dokładny Opis Rozwiązania i Naprawy (Co wymienić, jak zmierzyć, wartości napięć)..."
                  value={kbSolution}
                  onChange={(e) => setKbSolution(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Tagi rozdzielone przecinkami (np. #zwarcie, #19v, #vram, #bios)"
                  value={kbTagsInput}
                  onChange={(e) => setKbTagsInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setIsAddingKB(false)}
                    className="text-xs text-slate-400 px-3 py-1.5 hover:text-slate-200"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg font-mono shadow"
                  >
                    Zapisz w IndexedDB
                  </button>
                </div>
              </form>
            )}

            {/* List of Knowledge Base Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
              {filteredKBEntries.length === 0 ? (
                <div className="col-span-2 p-12 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                  <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  Brak pasujących wpisów w Prywatnej Bazie Wiedzy. Dodaj nowe rozwiązanie lub zmień filtry tagów.
                </div>
              ) : (
                filteredKBEntries.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
                          {item.laptopModel}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.createdAt}</span>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                        <span className="text-[10px] text-amber-400 font-mono font-bold block">OBJAW / SYMPTOM:</span>
                        <p className="text-slate-300 leading-relaxed">{item.symptom}</p>
                      </div>

                      <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30 text-xs space-y-1">
                        <span className="text-[10px] text-emerald-400 font-mono font-bold block">SPRAWDZONE ROZWIĄZANIE:</span>
                        <p className="text-slate-200 leading-relaxed font-sans">{item.solution}</p>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between bg-slate-900 p-2 rounded-lg">
                        <span>Elementy: <strong className="text-purple-300">{item.affectedComponents}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 gap-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.tags.map((t) => (
                          <span key={t} className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onSelectEntryToChat && (
                          <button
                            onClick={() => {
                              onSelectEntryToChat({
                                id: item.id,
                                customerName: 'Baza Wiedzy',
                                deviceModel: item.laptopModel,
                                serialNumber: 'KB-INDEXEDDB',
                                date: item.createdAt,
                                status: 'Naprawiono',
                                faultSummary: item.symptom,
                                peakTemp: 'N/A',
                                suspectComponent: item.affectedComponents,
                                repairCostEstimated: 'Baza Wiedzy',
                                technicianNotes: item.solution,
                              });
                              onClose();
                            }}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 transition text-[10px] flex items-center gap-1"
                            title="Wyślij rozwiązanie z Bazy Wiedzy do Czatu AI"
                          >
                            <Send className="w-3 h-3 text-cyan-400" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${item.laptopModel}\nSymptom: ${item.symptom}\nRozwiązanie: ${item.solution}`);
                          }}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition"
                          title="Kopiuj opis naprawy do schowka"
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => deleteKBFromIndexedDB(item.id)}
                          className="p-1.5 bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg border border-slate-800 transition"
                          title="Usuń wpis z IndexedDB"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>IndexedDB Engine: {dbStatus === 'ready' ? 'Lokalny Magazyn Aktywny' : 'Ładowanie Bazy...'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Zamknij Dziennik &amp; Bazę
          </button>
        </div>

      </div>
    </div>
  );
}
