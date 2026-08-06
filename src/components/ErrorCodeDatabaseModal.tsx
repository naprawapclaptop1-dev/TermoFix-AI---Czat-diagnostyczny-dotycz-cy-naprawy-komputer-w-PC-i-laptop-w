import React, { useState, useEffect } from 'react';
import { Database, Search, Code, Cpu, ShieldAlert, ArrowRight, Zap, CheckCircle2, Wrench, WifiOff, Plus, HardDrive } from 'lucide-react';

export interface DbItem {
  id: string;
  category: 'Device Manager Code' | 'BSOD Stop Code' | 'PWM IC Datasheet' | 'MOSFET / Transistor' | 'Power Rail Spec' | 'Beep Code / POST';
  codeOrName: string;
  titlePl: string;
  symptoms: string;
  quickDiagnosis: string;
  recommendedAction: string;
}

const DATABASE_ITEMS: DbItem[] = [
  {
    id: 'db-1',
    category: 'Device Manager Code',
    codeOrName: 'Kod 43 (Code 43)',
    titlePl: 'Menedżer Urządzeń zgłasza zatrzymanie karty graficznej',
    symptoms: 'Karta GPU (Nvidia/AMD) z żółtym wykrzyknikiem w Menedżerze Urządzeń. Brak obrazu 3D, niska rozdzielczość.',
    quickDiagnosis: '1. Uszkodzenie kostki VRAM (błąd linii danych MATS).\n2. Zimny lut pod rdzeniem GPU (reballing BGA).\n3. Brak napięcia NVVDD / FBVDD.',
    recommendedAction: 'Przeprowadź test VRAM programem MATS/MODS (-e 20). Zmierz napięcia zasilania NVVDD (0.8V) i FBVDD (1.35V).',
  },
  {
    id: 'db-2',
    category: 'Device Manager Code',
    codeOrName: 'Kod 10 (Code 10)',
    titlePl: 'Nie można uruchomić tego urządzenia',
    symptoms: 'Karta sieciowa Wi-Fi / Audio / Controller USB nie odpowiada.',
    quickDiagnosis: 'Brak zasilania LDO (3.3V_ALW) lub przerwana linia danych PCIe/USB.',
    recommendedAction: 'Sprawdź napięcie 3.3V na nodze zasilającej oraz stan kondensatorów filtrujących.',
  },
  {
    id: 'db-3',
    category: 'BSOD Stop Code',
    codeOrName: '0x0000007B (INACCESSIBLE_BOOT_DEVICE)',
    titlePl: 'Błąd dostępu do partycji rozruchowej Windows',
    symptoms: 'Niebieski ekran podczas ładowania systemu po zmianie trybu AHCI/NVMe lub awarii dysku.',
    quickDiagnosis: 'Brak sterownika NVMe/AHCI lub uszkodzony sektor rozruchowy BCD.',
    recommendedAction: 'Uruchom WinRE CMD i wpisz: bootrec /fixmbr && bootrec /rebuildbcd. Sprawdź tryb SATA w BIOS (AHCI vs RAID/VMD).',
  },
  {
    id: 'db-4',
    category: 'BSOD Stop Code',
    codeOrName: 'WHEA_UNCORRECTABLE_ERROR',
    titlePl: 'Sprzętowy błąd krytyczny procesora / pamięci',
    symptoms: 'Niewyjaśnione zawieszenia komputera pod obciążeniem.',
    quickDiagnosis: 'Niestabilne napięcie VCORE, niestabilny RAM lub uszkodzony kontroler pamięci w CPU.',
    recommendedAction: 'Przetestuj pamięć MemTest86. Sprawdź czy sekcja VRM CPU nie przegrzewa się (hotspot > 95°C).',
  },
  {
    id: 'db-5',
    category: 'PWM IC Datasheet',
    codeOrName: 'BQ24780S / BQ24725A',
    titlePl: 'Smart Battery Charger IC (Kontroler Ładowania)',
    symptoms: 'Laptop nie ładuje baterii, miga dioda zasilania, brak przełączania zasilacza na baterię.',
    quickDiagnosis: 'Pin 1 (VCC 19V), Pin 6 (ACDET 2.6V), Pin 28 (PHASE), Pin 24 (REGN 6V).',
    recommendedAction: 'Zmierz ACDET (wymagane min. 2.4V-2.8V z dzielnika rezystorowego). Jeśli ACDET = 0V, wymien dwa rezystory dzielnika.',
  },
  {
    id: 'db-6',
    category: 'PWM IC Datasheet',
    codeOrName: 'RT8206A / TPS51125',
    titlePl: 'Dual Step-Down Controller (Przetwornica 3.3V / 5V ALW)',
    symptoms: 'Całkowity brak reakcji na włącznik, pobór prądu z zasilacza 0.000A.',
    quickDiagnosis: 'Pin 16 (VIN 19V), Pin 13 (EN0 3.3V), Pin 3 (VREG3 3.3V LDO), Pin 17 (VREG5 5V LDO).',
    recommendedAction: 'Upewnij się czy LDO 3.3V i 5V są obecne przed włączeniem płyty. Jeśli LDO 3.3V ma 0V i mocno się grzeje - zwarcie w KBC (IT8586 / MEC1653).',
  },
  {
    id: 'db-7',
    category: 'MOSFET / Transistor',
    codeOrName: 'AON6504 / FDMC8884',
    titlePl: 'N-Channel Power MOSFET 30V 85A (High-Side / Low-Side)',
    symptoms: 'Zwarcie do masy na linii 19V VIN. Zasilacz serwisowy natychmiast przechodzi w tryb ograniczenia prądu C.C.',
    quickDiagnosis: 'Diode test Dren-Źródło: spadek 0.450V. Jeśli wskazuje 0.001V - zwarcie wewnętrzne.',
    recommendedAction: 'Wykonaj próbę zwarciową zasilaczem serwisowym (1V / limit 1A). Wylutuj przebity tranzystor.',
  },
  {
    id: 'db-8',
    category: 'Power Rail Spec',
    codeOrName: '19V VIN / BATT_V Rail',
    titlePl: 'Główna szyna zasilająca płyty głównej laptopa',
    symptoms: 'Brak zasilania na całej płycie głównej.',
    quickDiagnosis: 'Oporność do masy norma: > 100k Ohm. Poniżej 10 Ohm ozacza zwarcie głównego kondensatora lub MOSFETu.',
    recommendedAction: 'Odepnij zasilacz, podepnij omomierz i zmierz oporność na pierwszym rezystorze pomiarowym PR (Shunt 10mOhm).',
  },
  {
    id: 'db-9',
    category: 'Beep Code / POST',
    codeOrName: '3 Długie Sygnały (Dell / HP)',
    titlePl: 'Błąd Inicjalizacji Pamięci RAM (Memory Failure)',
    symptoms: 'Brak obrazu na matrycy, płyta powtarza cykl 3 sygnałów dźwiękowych.',
    quickDiagnosis: 'Brak zasilania VDDQ RAM (1.2V DDR4 / 1.1V DDR5), uszkodzony slot SO-DIMM lub utlenione stykı.',
    recommendedAction: 'Przetrzyj stykı RAM alkoholem IPA. Zmierz obecność VDDQ 1.2V i VDDSPD 3.3V.',
  },
];

// IndexedDB Helper Functions
const DB_NAME = 'TermoFixErrorCodeDB';
const DB_VERSION = 1;
const STORE_NAME = 'errorCodes';

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB unsupported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result as IDBDatabase);
    request.onerror = (e) => reject(e);
  });
}

async function syncAndLoadIndexedDBCache(): Promise<{ items: DbItem[]; isOfflineReady: boolean }> {
  try {
    const db = await openIDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const getReq = store.getAll();
    return new Promise((resolve) => {
      getReq.onsuccess = () => {
        let stored: DbItem[] = getReq.result || [];
        if (stored.length === 0) {
          // Seed database
          DATABASE_ITEMS.forEach((item) => store.put(item));
          stored = DATABASE_ITEMS;
        }
        resolve({ items: stored, isOfflineReady: true });
      };
      getReq.onerror = () => {
        resolve({ items: DATABASE_ITEMS, isOfflineReady: false });
      };
    });
  } catch (err) {
    return { items: DATABASE_ITEMS, isOfflineReady: false };
  }
}

async function saveCustomItemToIDB(newItem: DbItem): Promise<boolean> {
  try {
    const db = await openIDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(newItem);
    return true;
  } catch (err) {
    return false;
  }
}

interface ErrorCodeDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export function ErrorCodeDatabaseModal({ isOpen, onClose, onSendToChat }: ErrorCodeDatabaseModalProps) {
  const [dbItems, setDbItems] = useState<DbItem[]>(DATABASE_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<DbItem>(DATABASE_ITEMS[0]);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);

  // Custom Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCodeOrName, setNewCodeOrName] = useState('');
  const [newCategory, setNewCategory] = useState<DbItem['category']>('BSOD Stop Code');
  const [newTitlePl, setNewTitlePl] = useState('');
  const [newSymptoms, setNewSymptoms] = useState('');
  const [newQuickDiagnosis, setNewQuickDiagnosis] = useState('');
  const [newRecommendedAction, setNewRecommendedAction] = useState('');

  useEffect(() => {
    if (isOpen) {
      syncAndLoadIndexedDBCache().then(({ items, isOfflineReady }) => {
        setDbItems(items);
        setIsOfflineCached(isOfflineReady);
        if (items.length > 0) setSelectedItem(items[0]);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = dbItems.filter((item) => {
    const matchesSearch =
      item.codeOrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titlePl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.quickDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddCustomCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeOrName || !newTitlePl) return;

    const newItem: DbItem = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      codeOrName: newCodeOrName,
      titlePl: newTitlePl,
      symptoms: newSymptoms || 'Brak wprowadzonych symptomów',
      quickDiagnosis: newQuickDiagnosis || 'Sprawdzenie zasilania i sygnałów szyny',
      recommendedAction: newRecommendedAction || 'Diagnostyka multimetrem i oscyloskopem'
    };

    await saveCustomItemToIDB(newItem);
    setDbItems((prev) => [newItem, ...prev]);
    setSelectedItem(newItem);
    setIsAddModalOpen(false);

    setNewCodeOrName('');
    setNewTitlePl('');
    setNewSymptoms('');
    setNewQuickDiagnosis('');
    setNewRecommendedAction('');
  };

  const handleAskAI = (item: DbItem) => {
    if (!onSendToChat) return;
    const prompt = `Szukam instrukcji naprawy i informacji technicznych dla: ${item.codeOrName} (${item.category}).
Tytuł: ${item.titlePl}.
Symptomy: ${item.symptoms}.
Podaj mi pełny schemat diagnostyczny krok po kroku, zalecane napięcia i procedury naprawy.`;
    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 shadow-2xl space-y-6 my-8 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Baza Kodu Błędów, Datasheetów &amp; Specyfikacji Układów
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-emerald-400" />
                  {isOfflineCached ? 'IndexedDB Active (Tryb Offline Ready)' : 'Tryb Pamięci Podręcznej'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-normal">
                Błyskawicznie sprawdzaj kody BSOD, beep codes, opisy układów PWM, pętle zasilania i specyfikacje szyn płyty głównej - działa także offline!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 transition"
              title="Dodaj nowy kod błędu do lokalnej bazy IndexedDB"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj Do Bazy IDB</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Wpisz np. Kod 43, BQ24780S, WHEA, 3 Długie Sygnały, AON6504 lub 19V VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs py-2.5 pl-9 pr-3 text-slate-200 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Device Manager Code', 'BSOD Stop Code', 'PWM IC Datasheet', 'MOSFET / Transistor', 'Power Rail Spec', 'Beep Code / POST'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-3 py-1.5 rounded-lg border whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'Wszystkie' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* List column */}
          <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-2 max-h-[380px] overflow-y-auto space-y-2">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Brak wyników wyszukiwania w lokalnej bazie IndexedDB.
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-3 rounded-lg border transition space-y-1 ${
                    selectedItem.id === item.id
                      ? 'bg-amber-950/40 border-amber-500/60 text-slate-100 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-semibold">{item.category}</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{item.codeOrName}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">{item.titlePl}</div>
                </button>
              ))
            )}
          </div>

          {/* Details column */}
          <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            {selectedItem ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">{selectedItem.category}</span>
                    <h3 className="text-lg font-bold text-slate-100">{selectedItem.codeOrName}</h3>
                    <p className="text-xs text-slate-300 font-medium">{selectedItem.titlePl}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      Symptomy Usterki:
                    </div>
                    <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                      {selectedItem.symptoms}
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Kluczowe Pomiary &amp; Szybka Diagnoza:
                    </div>
                    <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                      {selectedItem.quickDiagnosis}
                    </pre>
                  </div>

                  <div>
                    <div className="font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                      Rekomendowana Procedura Naprawy:
                    </div>
                    <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-emerald-300">
                      {selectedItem.recommendedAction}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAskAI(selectedItem)}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition mt-4"
                >
                  Skonsultuj {selectedItem.codeOrName} z Asystentem AI
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Wybierz element z listy po lewej stronie.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-emerald-400" />
            Lokalna baza danych w pamięci podręcznej IndexedDB ({dbItems.length} rekordów w pamięci offline).
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Zamknij
          </button>
        </div>

      </div>

      {/* Modal Dodawania Własnego Kodu Do IndexedDB */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Dodaj Nowy Kod do IndexedDB
            </h3>
            <form onSubmit={handleAddCustomCode} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Kod lub Nazwa (np. 0x0000001A / BQ24735):</label>
                <input
                  type="text"
                  required
                  value={newCodeOrName}
                  onChange={(e) => setNewCodeOrName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Kategoria:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="BSOD Stop Code">BSOD Stop Code</option>
                  <option value="Device Manager Code">Device Manager Code</option>
                  <option value="PWM IC Datasheet">PWM IC Datasheet</option>
                  <option value="MOSFET / Transistor">MOSFET / Transistor</option>
                  <option value="Power Rail Spec">Power Rail Spec</option>
                  <option value="Beep Code / POST">Beep Code / POST</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tytuł Opisowy (Polski):</label>
                <input
                  type="text"
                  required
                  value={newTitlePl}
                  onChange={(e) => setNewTitlePl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Symptomy Usterki:</label>
                <textarea
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Kluczowe Pomiary &amp; Diagnoza:</label>
                <textarea
                  value={newQuickDiagnosis}
                  onChange={(e) => setNewQuickDiagnosis(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rekomendowana Naprawa:</label>
                <input
                  type="text"
                  value={newRecommendedAction}
                  onChange={(e) => setNewRecommendedAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Zapisz w IndexedDB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

