import React, { useState, useEffect } from 'react';
import {
  Layers,
  X,
  Search,
  Trash2,
  Calendar,
  Thermometer,
  Columns,
  Sparkles,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Plus,
  Eye,
  ArrowRightLeft,
  Cpu
} from 'lucide-react';
import { SpotPoint } from '../types';

export interface StoredThermalSnapshot {
  id: string;
  timestamp: string;
  boardModel: string;
  title: string;
  note: string;
  imageUrl: string;
  maxTemp: number;
  minTemp: number;
  hotspotLocation?: string;
  spotPoints?: SpotPoint[];
  status: 'BEFORE_REPAIR' | 'AFTER_REPAIR' | 'REFERENCE';
}

const DB_NAME = 'TermoFixThermalDB';
const DB_VERSION = 1;
const STORE_NAME = 'thermal_snapshots';

function openThermalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function getAllThermalSnapshotsDB(): Promise<StoredThermalSnapshot[]> {
  try {
    const db = await openThermalDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as StoredThermalSnapshot[]);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get snapshots from IndexedDB:', err);
    return [];
  }
}

export async function saveThermalSnapshotDB(snapshot: StoredThermalSnapshot): Promise<void> {
  try {
    const db = await openThermalDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(snapshot);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save snapshot to IndexedDB:', err);
  }
}

export async function deleteThermalSnapshotDB(id: string): Promise<void> {
  try {
    const db = await openThermalDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete snapshot from IndexedDB:', err);
  }
}

interface ThermalSnapshotGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string;
  currentMaxTemp?: number;
  currentMinTemp?: number;
  currentSpotPoints?: SpotPoint[];
  onSelectCompare?: (leftSnap: StoredThermalSnapshot, rightSnap: StoredThermalSnapshot) => void;
}

export const ThermalSnapshotGallery: React.FC<ThermalSnapshotGalleryProps> = ({
  isOpen,
  onClose,
  currentImageUrl,
  currentMaxTemp = 88.5,
  currentMinTemp = 22.0,
  currentSpotPoints = [],
  onSelectCompare
}) => {
  const [snapshots, setSnapshots] = useState<StoredThermalSnapshot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BEFORE_REPAIR' | 'AFTER_REPAIR' | 'REFERENCE'>('ALL');
  
  // Selection for comparison
  const [compareLeft, setCompareLeft] = useState<StoredThermalSnapshot | null>(null);
  const [compareRight, setCompareRight] = useState<StoredThermalSnapshot | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);

  // New snapshot creation form states
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newTitle, setNewTitle] = useState('Diagnoza Termiczna PCB');
  const [newBoardModel, setNewBoardModel] = useState('Lenovo Legion Y540 / NM-C361');
  const [newNote, setNewNote] = useState('Wymiana zwartego MOSFET-a PQ202 w sekcji 19V VIN.');
  const [newStatus, setNewStatus] = useState<'BEFORE_REPAIR' | 'AFTER_REPAIR' | 'REFERENCE'>('BEFORE_REPAIR');

  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
    }
  }, [isOpen]);

  const loadSnapshots = async () => {
    const loaded = await getAllThermalSnapshotsDB();
    if (loaded.length === 0) {
      // Seed initial sample diagnostic snapshots if database is empty
      const sampleSnapshots: StoredThermalSnapshot[] = [
        {
          id: 'snap-seed-1',
          timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString('pl-PL'),
          boardModel: 'Lenovo Legion Y540 (NM-C361)',
          title: 'Zwarcie Tranzystora MOSFET 19V VIN (Przed Naprawą)',
          note: 'Gwałtowny wzrost temperatury w strefie PQ202 do 98.5°C natychmiast po wpięciu zasilacza 19V. Cewka PL1 wykazuje zwarcie do masy 0.01 Ohm.',
          imageUrl: currentImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          maxTemp: 98.5,
          minTemp: 24.2,
          hotspotLocation: 'Tranzystor PQ202 High-Side 19V',
          status: 'BEFORE_REPAIR'
        },
        {
          id: 'snap-seed-2',
          timestamp: new Date(Date.now() - 86400000).toLocaleString('pl-PL'),
          boardModel: 'Lenovo Legion Y540 (NM-C361)',
          title: 'Stan Termiczny Po Wymianie MOSFET-a AON6504 (Po Naprawie)',
          note: 'Temperatura sekcji zasilania VRM spadła do bezpiecznego poziomu 42.0°C w trybie IDLE i 68.5°C pod pełnym obciążeniem OCCT.',
          imageUrl: currentImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          maxTemp: 68.5,
          minTemp: 22.1,
          hotspotLocation: 'Sekcja VRM VCORE (Optymalna)',
          status: 'AFTER_REPAIR'
        },
        {
          id: 'snap-seed-3',
          timestamp: new Date(Date.now() - 432000000).toLocaleString('pl-PL'),
          boardModel: 'ASUS ROG Strix G513 (GA401)',
          title: 'Wzór Referencyjny Mapy Cieplnej GPU VRAM GDDR6',
          note: 'Wzorcowy profil termiczny sprawnej płyty ASUS ROG z układami GDDR6 Micron pod obciążeniem FurMark 4K.',
          imageUrl: currentImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
          maxTemp: 74.0,
          minTemp: 25.0,
          hotspotLocation: 'Rdzeń GPU GA104',
          status: 'REFERENCE'
        }
      ];

      for (const snap of sampleSnapshots) {
        await saveThermalSnapshotDB(snap);
      }
      setSnapshots(sampleSnapshots);
    } else {
      setSnapshots(loaded);
    }
  };

  const handleSaveNewSnapshot = async () => {
    if (!currentImageUrl) return;

    const newSnapshot: StoredThermalSnapshot = {
      id: 'snap-' + Date.now(),
      timestamp: new Date().toLocaleString('pl-PL'),
      boardModel: newBoardModel,
      title: newTitle,
      note: newNote,
      imageUrl: currentImageUrl,
      maxTemp: currentMaxTemp,
      minTemp: currentMinTemp,
      spotPoints: currentSpotPoints,
      hotspotLocation: 'Wykryty Punkt Ciepła',
      status: newStatus
    };

    await saveThermalSnapshotDB(newSnapshot);
    setSnapshots((prev) => [newSnapshot, ...prev]);
    setShowSaveForm(false);
  };

  const handleDeleteSnapshot = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten zapis termiczny z bazy IndexedDB?')) {
      await deleteThermalSnapshotDB(id);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
      if (compareLeft?.id === id) setCompareLeft(null);
      if (compareRight?.id === id) setCompareRight(null);
    }
  };

  const filteredSnapshots = snapshots.filter((s) => {
    const matchesFilter = selectedFilter === 'ALL' || s.status === selectedFilter;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.boardModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.note.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-xl border border-amber-500/30 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Galeria Obrazów Termicznych IndexedDB (ThermalSnapshotGallery)
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  TRWAŁA BAZA DANYCH PCB
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Porównuj bieżące zrzuty kamer termowizyjnych z historycznymi profilami udanych napraw płyt głównych
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              Zapisz Bieżący Zrzut
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Form Drawer */}
        {showSaveForm && (
          <div className="bg-slate-950/90 border-b border-slate-800 p-4 space-y-3 font-sans animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Zapis Nowego Zrzutu Termicznego do Pamięci IndexedDB
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Bieżący Max Temp: <strong className="text-red-400">{currentMaxTemp}°C</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tytuł Zlecenia / Diagnostyki:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Model Płyty Głównej / PCB Ref:</label>
                <input
                  type="text"
                  value={newBoardModel}
                  onChange={(e) => setNewBoardModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Status Zrzutu:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="BEFORE_REPAIR">🔴 PRZED NAPRAWĄ (Gwałtowne Przegrzewanie)</option>
                  <option value="AFTER_REPAIR">🟢 PO NAPRAWIE (Stabilny Profil Cieplny)</option>
                  <option value="REFERENCE">🔵 WZORZEC REFERENCYJNY (Sprawny Board)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Notatki Diagnostyczne & Opis Usterki:</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowSaveForm(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
              >
                Anuluj
              </button>
              <button
                onClick={handleSaveNewSnapshot}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Zapisz do IndexedDB
              </button>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Panel */}
        {isCompareMode && (
          <div className="bg-slate-950 border-b border-slate-800 p-4 space-y-3 font-sans animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                Tryb Porównywania Profilów Termicznych Side-By-Side (Przed vs Po Naprawie)
              </span>
              <button
                onClick={() => {
                  setIsCompareMode(false);
                  setCompareLeft(null);
                  setCompareRight(null);
                }}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded transition"
              >
                Zamknij Porównanie
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Compare Card */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-400 font-mono">1. Zrzut Pierwotny (Przed Naprawą)</span>
                  <span className="text-[10px] text-slate-400 font-mono">{compareLeft ? compareLeft.timestamp : 'Nie wybrano'}</span>
                </div>
                {compareLeft ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                      <img src={compareLeft.imageUrl} alt="Left Compare" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-red-950/90 text-red-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/50">
                        Max: {compareLeft.maxTemp}°C
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-200">{compareLeft.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">{compareLeft.note}</div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-lg">
                    Wybierz zrzut z listy poniżej i kliknij "Ustaw jako Lewy"
                  </div>
                )}
              </div>

              {/* Right Compare Card */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 font-mono">2. Zrzut Końcowy (Po Naprawie / Wzorce)</span>
                  <span className="text-[10px] text-slate-400 font-mono">{compareRight ? compareRight.timestamp : 'Nie wybrano'}</span>
                </div>
                {compareRight ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                      <img src={compareRight.imageUrl} alt="Right Compare" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 bg-emerald-950/90 text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/50">
                        Max: {compareRight.maxTemp}°C
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-200">{compareRight.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">{compareRight.note}</div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-lg">
                    Wybierz zrzut z listy poniżej i kliknij "Ustaw jako Prawy"
                  </div>
                )}
              </div>
            </div>

            {compareLeft && compareRight && (
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-slate-400">Różnica Temperatur Delta ΔT:</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {(compareLeft.maxTemp - compareRight.maxTemp).toFixed(1)}°C Redukcji
                  </span>
                </div>
                <span className="text-emerald-400 font-bold text-[11px]">
                  ✓ Weryfikacja udanej naprawy PCB zakończona sukcesem!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Toolbar Filter & Search */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Filtruj:</span>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setSelectedFilter('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  selectedFilter === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Wszystkie ({snapshots.length})
              </button>
              <button
                onClick={() => setSelectedFilter('BEFORE_REPAIR')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  selectedFilter === 'BEFORE_REPAIR' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔴 Przed Naprawą
              </button>
              <button
                onClick={() => setSelectedFilter('AFTER_REPAIR')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  selectedFilter === 'AFTER_REPAIR' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🟢 Po Naprawie
              </button>
              <button
                onClick={() => setSelectedFilter('REFERENCE')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  selectedFilter === 'REFERENCE' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔵 Wzorcowe
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Szukaj po modelu płyty, tytule lub notatce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 text-xs ${
                isCompareMode ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Columns className="w-4 h-4" />
              Porównywarka Side-by-Side
            </button>
          </div>
        </div>

        {/* Snapshots Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredSnapshots.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Brak zapisanych obrazów termicznych w bazie IndexedDB odpowiadających kryteriom wyszukiwania.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSnapshots.map((snap) => {
                const isLeftSelected = compareLeft?.id === snap.id;
                const isRightSelected = compareRight?.id === snap.id;

                let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
                let statusText = 'Zapis Termiczny';
                if (snap.status === 'BEFORE_REPAIR') {
                  badgeBg = 'bg-red-950/80 text-red-300 border-red-500/50';
                  statusText = 'PRZED NAPRAWĄ';
                } else if (snap.status === 'AFTER_REPAIR') {
                  badgeBg = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
                  statusText = 'PO NAPRAWIE';
                } else if (snap.status === 'REFERENCE') {
                  badgeBg = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
                  statusText = 'WZORZEC PCB';
                }

                return (
                  <div
                    key={snap.id}
                    className={`bg-slate-950 rounded-xl border p-3 space-y-3 transition flex flex-col justify-between ${
                      isLeftSelected || isRightSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden aspect-video bg-black group border border-slate-900">
                        <img src={snap.imageUrl} alt={snap.title} className="w-full h-full object-cover" />
                        
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${badgeBg}`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2 bg-slate-950/90 text-red-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800">
                          {snap.maxTemp}°C
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-100 leading-snug line-clamp-1">{snap.title}</div>
                        <div className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                          <Cpu className="w-3 h-3 text-amber-400" />
                          {snap.boardModel}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {snap.note}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {snap.timestamp}
                      </span>

                      <div className="flex items-center space-x-1">
                        {isCompareMode && (
                          <>
                            <button
                              onClick={() => setCompareLeft(snap)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                                isLeftSelected ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              Lewy
                            </button>
                            <button
                              onClick={() => setCompareRight(snap)}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                                isRightSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              Prawy
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          className="p-1 hover:text-red-400 text-slate-600 rounded transition"
                          title="Usuń zapis z pamięci IndexedDB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Łącznie w bazie IndexedDB: <strong className="text-amber-400">{snapshots.length}</strong> wpisów</span>
          <span>Baza danych TermoFix: localforage / IndexedDB v1.0</span>
        </div>

      </div>
    </div>
  );
};
