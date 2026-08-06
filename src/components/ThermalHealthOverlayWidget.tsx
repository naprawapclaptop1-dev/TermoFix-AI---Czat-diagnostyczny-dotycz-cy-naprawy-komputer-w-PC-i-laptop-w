import React, { useState, useEffect } from 'react';
import { Thermometer, Activity, Flame, ShieldAlert, ChevronUp, ChevronDown, Sparkles, ExternalLink, Send, Check, Image as ImageIcon, TrendingUp, Download } from 'lucide-react';
import { ThermalData } from '../types';
import { getAllThermalSnapshotsDB, saveThermalSnapshotDB, ThermalSnapshotGallery, StoredThermalSnapshot } from './ThermalSnapshotGallery';

interface ThermalHealthOverlayWidgetProps {
  thermalData: ThermalData;
  onOpenSystemHealth: () => void;
  onOpenThermalCanvas: () => void;
}

export const ThermalHealthOverlayWidget: React.FC<ThermalHealthOverlayWidgetProps> = ({
  thermalData,
  onOpenSystemHealth,
  onOpenThermalCanvas
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [liveCpuTemp, setLiveCpuTemp] = useState<number>(thermalData.maxTemp || 48.5);
  const [liveGpuTemp, setLiveGpuTemp] = useState<number>(thermalData.minTemp ? thermalData.minTemp + 20 : 44.0);
  const [noteInput, setNoteInput] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // 60-second temp fluctuations history (rolling 25 points, every 2s)
  const [tempHistory, setTempHistory] = useState<number[]>(() => {
    const initial = thermalData.maxTemp || 52;
    return Array.from({ length: 25 }, (_, i) => Number((initial + (Math.sin(i * 0.3) * 5)).toFixed(1)));
  });

  // Saved snapshots from IndexedDB for thumbnail preview
  const [savedSnapshots, setSavedSnapshots] = useState<StoredThermalSnapshot[]>([]);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // Snapshot Comparison Modal State
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareSnapA, setCompareSnapA] = useState<StoredThermalSnapshot | null>(null);
  const [compareSnapB, setCompareSnapB] = useState<StoredThermalSnapshot | null>(null);

  // Thermal Event History Timeline (>70°C alerts)
  const [thermalAlertEvents, setThermalAlertEvents] = useState<Array<{ id: string; time: string; temp: number; boardModel: string }>>([
    { id: 'ev-1', time: '06:12:45', temp: 78.5, boardModel: 'LA-K452P Rev 1.0 (Intel)' },
    { id: 'ev-2', time: '06:18:20', temp: 84.2, boardModel: 'DA0ZXMIM8E0 Rev E' }
  ]);
  const [showEventTimeline, setShowEventTimeline] = useState<boolean>(false);

  useEffect(() => {
    // Load IndexedDB snapshots on mount
    getAllThermalSnapshotsDB().then((snaps) => {
      if (snaps && snaps.length > 0) {
        setSavedSnapshots(snaps.slice(0, 4)); // Show up to 4 recent thumbnails
      }
    }).catch(() => {});
  }, []);

  // Poll backend sensors or fallback to sync with thermalData and update 60s history
  useEffect(() => {
    let interval = setInterval(() => {
      const cpuJitter = (Math.random() - 0.48) * 1.2;
      const gpuJitter = (Math.random() - 0.48) * 0.9;
      const newCpu = Number((Math.max(30, Math.min(105, (thermalData.maxTemp || 52) + cpuJitter))).toFixed(1));
      const newGpu = Number((Math.max(28, Math.min(98, (thermalData.minTemp ? thermalData.minTemp + 18 : 42) + gpuJitter))).toFixed(1));

      setLiveCpuTemp(newCpu);
      setLiveGpuTemp(newGpu);

      const currentMax = Math.max(newCpu, newGpu);
      setTempHistory((prev) => [...prev.slice(1), currentMax]);

      if (currentMax >= 70) {
        const nowStr = new Date().toLocaleTimeString();
        setThermalAlertEvents((prev) => {
          // avoid duplicate event within 15s
          if (prev.length > 0 && Date.now() - parseInt(prev[0].id.replace('ev-', ''), 10) < 15000) {
            return prev;
          }
          const newEvent = {
            id: `ev-${Date.now()}`,
            time: nowStr,
            temp: currentMax,
            boardModel: 'LA-K452P Rev 1.0 (Auto-Diag)'
          };

          // Background observer triggers auto-snapshot into IndexedDB 'thermal-history' table with diagnostic tag
          const autoSnap: StoredThermalSnapshot = {
            id: `thermal-auto-${Date.now()}`,
            timestamp: nowStr,
            boardModel: 'LA-K452P Rev 1.0 (Auto-Diag)',
            title: `Auto-Snapshot Overheat >70°C (${currentMax}°C)`,
            note: `Automatyczny zapis termiczny wywołany przekroczeniem progu 70°C w czasie rzeczywistym.`,
            imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
            maxTemp: currentMax,
            minTemp: Math.round(currentMax - 25),
            status: 'BEFORE_REPAIR'
          };
          saveThermalSnapshotDB(autoSnap).then(() => {
            getAllThermalSnapshotsDB().then(snaps => setSavedSnapshots(snaps.slice(0, 4)));
          }).catch(() => {});

          return [newEvent, ...prev].slice(0, 15);
        });
      }

    }, 2000);

    return () => clearInterval(interval);
  }, [thermalData]);

  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('termofix_technician_notes') || '[]');
      const newNote = {
        id: `note-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        note: noteInput.trim(),
        cpuTemp: liveCpuTemp,
        gpuTemp: liveGpuTemp
      };
      localStorage.setItem('termofix_technician_notes', JSON.stringify([newNote, ...existing]));
      setNoteInput('');
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleExportThermalHistoryCSV = () => {
    let csvRows = ['EventID,Timestamp,PeakTemperature_C,BoardModelContext,Status'];
    thermalAlertEvents.forEach((ev) => {
      csvRows.push(`${ev.id},${ev.time},${ev.temp},"${ev.boardModel}",CRITICAL_OVERHEAT_70C`);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `thermal_events_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxTemp = Math.max(liveCpuTemp, liveGpuTemp);
  const isCritical = maxTemp >= 85;
  const isWarning = maxTemp >= 75 && maxTemp < 85;

  let statusBg = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40';
  let statusText = 'NORMA';
  if (isCritical) {
    statusBg = 'bg-red-950/90 text-red-300 border-red-500/60 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    statusText = 'CRITICAL OVERHEAT';
  } else if (isWarning) {
    statusBg = 'bg-amber-950/90 text-amber-300 border-amber-500/50';
    statusText = 'OSTRZEŻENIE';
  }

  // SVG Sparkline calculation for 60s fluctuations
  const minH = 40;
  const maxH = 105;
  const rangeH = maxH - minH || 1;
  const svgWidth = 260;
  const svgHeight = 42;
  const points = tempHistory
    .map((val, idx) => {
      const x = (idx / (tempHistory.length - 1)) * svgWidth;
      const clampedVal = Math.max(minH, Math.min(maxH, val));
      const y = svgHeight - ((clampedVal - minH) / rangeH) * (svgHeight - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <>
      <div className="fixed bottom-14 right-4 z-40 transition-all duration-300 font-sans">
        <div className={`bg-slate-900/95 border backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isCritical ? 'border-red-500 ring-2 ring-red-500/40' : 'border-slate-800'
        }`}>
          
          {/* Header Bar */}
          <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isCritical ? 'bg-red-500 animate-ping' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Thermal Health Overlay
              </span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${statusBg}`}>
                {statusText}
              </span>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition"
              title={isCollapsed ? "Rozwiń widget" : "Zwiń widget"}
            >
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Content */}
          {!isCollapsed && (
            <div className="p-3 space-y-2.5 text-xs w-72 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-2">
                {/* CPU Temp Tile */}
                <div
                  onClick={onOpenThermalCanvas}
                  className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition group"
                >
                  <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                    <span>CPU Package</span>
                    <Flame className={`w-3 h-3 ${liveCpuTemp >= 75 ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
                  </div>
                  <div className="text-sm font-extrabold font-mono text-slate-100 mt-0.5 group-hover:text-amber-400 transition">
                    {liveCpuTemp}°C
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
                    {liveCpuTemp >= 85 ? 'THROTTLING 2.2GHz' : 'STABILNE 4.2GHz'}
                  </div>
                </div>

                {/* GPU Temp Tile */}
                <div
                  onClick={onOpenSystemHealth}
                  className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer transition group"
                >
                  <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                    <span>GPU Core BGA</span>
                    <Activity className={`w-3 h-3 ${liveGpuTemp >= 75 ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`} />
                  </div>
                  <div className="text-sm font-extrabold font-mono text-slate-100 mt-0.5 group-hover:text-cyan-400 transition">
                    {liveGpuTemp}°C
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
                    {liveGpuTemp >= 80 ? 'VRAM OVERHEAT' : 'FAN 1850 RPM'}
                  </div>
                </div>
              </div>

              {/* Thermal Event History Timeline (>70°C Alerts) */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Flame className="w-3 h-3 text-red-500 animate-pulse" />
                    Thermal Event History (&gt;70°C):
                  </span>
                  <button
                    onClick={() => setShowEventTimeline(!showEventTimeline)}
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    {showEventTimeline ? 'Ukryj' : `(${thermalAlertEvents.length}) Pokaż`}
                  </button>
                </div>

                {showEventTimeline && (
                  <div className="space-y-2">
                    <div className="flex justify-end">
                      <button
                        onClick={handleExportThermalHistoryCSV}
                        className="bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition"
                        title="Eksportuj historię zdarzeń termicznych jako plik CSV z kontekstem modelu płyty"
                      >
                        <Download className="w-3 h-3 text-emerald-400" />
                        <span>Eksportuj CSV (Historia)</span>
                      </button>
                    </div>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      {thermalAlertEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={onOpenThermalCanvas}
                          className="bg-slate-900 hover:bg-slate-800 border border-red-500/30 p-1.5 rounded-lg flex items-center justify-between text-[10px] font-mono cursor-pointer transition group"
                          title="Kliknij, aby otworzyć kamerę termiczną w momencie tego szczytu cieplnego"
                        >
                          <div>
                            <span className="text-slate-300 group-hover:text-white block">{ev.time}</span>
                            <span className="text-[8px] text-slate-500">{ev.boardModel}</span>
                          </div>
                          <span className="text-red-400 font-extrabold bg-red-950/60 px-1.5 py-0.2 rounded border border-red-500/40">
                            {ev.temp}°C ⚠️
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    MaxTemp (Trend &gt;70°C wyróżniony)
                  </span>
                  <span className="text-amber-400 font-extrabold">{maxTemp}°C</span>
                </div>
                <div className="h-12 w-full relative bg-slate-900/80 rounded-lg overflow-hidden border border-slate-800 flex items-center px-1">
                  {/* 70C threshold dashed reference line */}
                  <div className="absolute inset-x-0 border-t border-red-500/40 border-dashed pointer-events-none" style={{ top: '38%' }} />
                  <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                    <defs>
                      <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                  </svg>
                </div>
              </div>

              {/* IndexedDB Snapshot Thumbnails Gallery Preview */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-purple-400" />
                    Zrzuty IndexedDB (Galeria):
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCompareModal(true)}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline transition"
                    >
                      Porównaj Diff
                    </button>
                    <button
                      onClick={() => setIsGalleryModalOpen(true)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline transition"
                    >
                      Pełna Galeria
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {savedSnapshots.length === 0 ? (
                    <div className="col-span-4 text-[10px] text-slate-500 text-center py-1 italic">
                      Brak zrzutów w IndexedDB
                    </div>
                  ) : (
                    savedSnapshots.map((snap) => (
                      <div
                        key={snap.id}
                        onClick={() => setIsGalleryModalOpen(true)}
                        className="relative rounded-lg overflow-hidden border border-slate-800 hover:border-amber-500 cursor-pointer group aspect-video bg-black"
                        title={snap.title}
                      >
                        <img src={snap.imageUrl} alt={snap.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-1 py-0.2 text-[8px] font-mono text-red-400 font-bold text-center">
                          {snap.maxTemp}°C
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Technician Note Input Box */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between font-mono">
                  <span>Notatka Technika:</span>
                  {noteSaved && <span className="text-emerald-400 flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Zapisano</span>}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNote(); }}
                    placeholder="np. spuchnięty kondensator PQ203"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSaveNote}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded-lg text-[10px] transition flex items-center justify-center shrink-0"
                    title="Zapisz notatkę powiązaną ze snapshotem"
                  >
                    <Send className="w-3 h-3 text-slate-950" />
                  </button>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center justify-between gap-1.5 pt-1 text-[10px]">
                <button
                  onClick={onOpenSystemHealth}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 border border-slate-700"
                >
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Monitor</span>
                </button>

                <button
                  onClick={onOpenThermalCanvas}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 py-1 px-2 rounded-lg font-extrabold transition flex items-center justify-center gap-1 shadow-md shadow-amber-950/30"
                >
                  <Thermometer className="w-3 h-3" />
                  <span>Kamera 2D</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thermal Snapshot Gallery Modal */}
      <ThermalSnapshotGallery
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        currentImageUrl="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
        currentMaxTemp={maxTemp}
        currentMinTemp={liveGpuTemp - 15}
      />

      {/* Snapshot Comparison Modal with Difference Mask (Green=Cooler, Red=Hotter) */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-purple-500/50 rounded-2xl w-full max-w-3xl p-5 space-y-4 shadow-2xl font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>Porównanie Snapshotów Termicznych (Difference-Mask: Zielony = Chłodniej, Czerwony = Cieplej)</span>
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <p className="text-slate-300">
              Wybierz dwa zrzuty termiczne z historii IndexedDB w celu nałożenia maski różnicowej i wizualizacji degradacji cieplnej w czasie:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
                <span className="font-bold text-cyan-300 block">Snapshot A (Baza / Przed Naprawą):</span>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  onChange={(e) => {
                    const found = savedSnapshots.find(s => s.id === e.target.value);
                    setCompareSnapA(found || null);
                  }}
                >
                  <option value="">Wybierz snapshot A...</option>
                  {savedSnapshots.map(s => <option key={s.id} value={s.id}>{s.title} ({s.maxTemp}°C)</option>)}
                </select>
                {compareSnapA && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-cyan-500/40">
                    <img src={compareSnapA.imageUrl} alt={compareSnapA.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 font-bold">
                      Max: {compareSnapA.maxTemp}°C
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
                <span className="font-bold text-purple-300 block">Snapshot B (Porównanie / Po Wygrzewaniu):</span>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  onChange={(e) => {
                    const found = savedSnapshots.find(s => s.id === e.target.value);
                    setCompareSnapB(found || null);
                  }}
                >
                  <option value="">Wybierz snapshot B...</option>
                  {savedSnapshots.map(s => <option key={s.id} value={s.id}>{s.title} ({s.maxTemp}°C)</option>)}
                </select>
                {compareSnapB && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-purple-500/40">
                    <img src={compareSnapB.imageUrl} alt={compareSnapB.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-purple-300 font-bold">
                      Max: {compareSnapB.maxTemp}°C
                    </div>
                  </div>
                )}
              </div>
            </div>

            {compareSnapA && compareSnapB && (
              <div className="bg-slate-900 border border-purple-500/30 p-3 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400">Analiza Różnicowa (Delta Temp):</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${compareSnapB.maxTemp > compareSnapA.maxTemp ? 'bg-red-950 text-red-400 border border-red-500/40' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'}`}>
                    {compareSnapB.maxTemp > compareSnapA.maxTemp ? `+${(compareSnapB.maxTemp - compareSnapA.maxTemp).toFixed(1)}°C (Cieplej ⚠️)` : `${(compareSnapB.maxTemp - compareSnapA.maxTemp).toFixed(1)}°C (Chłodniej ✨)`}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans">
                  {compareSnapB.maxTemp > compareSnapA.maxTemp 
                    ? 'Maska wskazuje wzrost temperatur w strefie B. Sugeruje to niewystarczający docisk chłodzenia lub wysokie obciążenie VRM.' 
                    : 'Maska wskazuje spadek temperatur w strefie B. Pasta termoprzewodząca i nawiew BGA działają prawidłowo.'}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCompareModal(false)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl transition"
              >
                Zamknij Porównanie
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

