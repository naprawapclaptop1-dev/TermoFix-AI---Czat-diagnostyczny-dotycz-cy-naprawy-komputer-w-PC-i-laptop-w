import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Calendar,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wrench,
  DollarSign,
  TrendingUp,
  Cpu,
  User,
  Activity,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { RepairJournalEntry } from '../types';

export interface DeviceHistoryTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: RepairJournalEntry[];
  onSendToChat?: (prompt: string) => void;
}

// Sample initial repair history database if journal is sparse
const MOCK_HISTORY_ENTRIES: RepairJournalEntry[] = [
  {
    id: 'entry-sn-101',
    customerName: 'Jan Kowalski',
    deviceModel: 'Lenovo Legion 5 15ARH05',
    serialNumber: 'SN-88492041-2026',
    date: '2025-03-12',
    status: 'Naprawiono',
    faultSummary: 'Zwarcie w głównej linii zasilania 19V B+ (Kondensator MLCC PC201)',
    peakTemp: '94°C',
    suspectComponent: 'MLCC 10uF/25V PC201 + MOSFET PQ202',
    repairCostEstimated: '350 PLN',
    technicianNotes: 'Wymieniono przebity kondensator ceramiczny obok przetwornicy 19V. System wstał, obraz jest.',
  },
  {
    id: 'entry-sn-102',
    customerName: 'Jan Kowalski',
    deviceModel: 'Lenovo Legion 5 15ARH05',
    serialNumber: 'SN-88492041-2026',
    date: '2025-11-04',
    status: 'Naprawiono',
    faultSummary: 'Przegrzewanie CPU podczas obciążenia benschmarkiem FurMark / Prime95',
    peakTemp: '98°C',
    suspectComponent: 'Wyschnięta pasta termoprzewodząca + Kurz w radiatorze',
    repairCostEstimated: '150 PLN',
    technicianNotes: 'Czyszczenie układu chłodzenia, nałożenie Honeywell PTM7950. Temperatura po zabiegu: 74°C.',
  },
  {
    id: 'entry-sn-103',
    customerName: 'Jan Kowalski',
    deviceModel: 'Lenovo Legion 5 15ARH05',
    serialNumber: 'SN-88492041-2026',
    date: '2026-08-01',
    status: 'W trakcie',
    faultSummary: 'Brak ładowania baterii, mrugająca dioda LED (Brak sygnału ADP_ID z zasilacza)',
    peakTemp: '68°C',
    suspectComponent: 'Gniazdo zasilania DC-IN + Dioda zabezpieczająca TVS',
    repairCostEstimated: '220 PLN',
    technicianNotes: 'Uszkodzenie mechaniczne bolca sygnałowego centralnego w gnieździe DC.',
  },
  {
    id: 'entry-sn-201',
    customerName: 'Marek Nowak',
    deviceModel: 'ASUS ROG Strix RTX 3080 10GB',
    serialNumber: 'SN-RTX3080-9912',
    date: '2024-08-20',
    status: 'Naprawiono',
    faultSummary: 'Artefakty na ekranie w grach 3D (Pamięć VRAM Bank B0 / B1)',
    peakTemp: '88°C',
    suspectComponent: 'Kość GDDR6 Micron D9WCW',
    repairCostEstimated: '500 PLN',
    technicianNotes: 'Wymiana uszkodzonej kości pamięci VRAM na nową z dawcy, reballing.',
  },
  {
    id: 'entry-sn-202',
    customerName: 'Marek Nowak',
    deviceModel: 'ASUS ROG Strix RTX 3080 10GB',
    serialNumber: 'SN-RTX3080-9912',
    date: '2026-02-15',
    status: 'Naprawiono',
    faultSummary: 'Czarny ekran po wgraniu sterowników (Brak napięcia 1.8V PEX)',
    peakTemp: '76°C',
    suspectComponent: 'LDO 1.8V GS7256',
    repairCostEstimated: '280 PLN',
    technicianNotes: 'Wymieniony stabilizator LDO 1.8V. Karta przechodzi test 3DMark Stress Test.',
  },
];

export const DeviceHistoryTimelineModal: React.FC<DeviceHistoryTimelineModalProps> = ({
  isOpen,
  onClose,
  journalEntries = [],
  onSendToChat,
}) => {
  // Combine user journal entries with mock baseline history
  const allEntries = useMemo(() => {
    const combined = [...journalEntries, ...MOCK_HISTORY_ENTRIES];
    // deduplicate by id
    const map = new Map<string, RepairJournalEntry>();
    combined.forEach((item) => map.set(item.id || item.serialNumber + item.date, item));
    return Array.from(map.values());
  }, [journalEntries]);

  // Extract list of unique serial numbers
  const uniqueSerials = useMemo(() => {
    const set = new Set<string>();
    allEntries.forEach((e) => {
      if (e.serialNumber) set.add(e.serialNumber);
    });
    return Array.from(set);
  }, [allEntries]);

  // Active Serial Number selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSerial, setSelectedSerial] = useState<string>(uniqueSerials[0] || 'SN-88492041-2026');

  // Filter entries for current serial number
  const timelineEvents = useMemo(() => {
    const target = selectedSerial.trim().toLowerCase();
    const matches = allEntries.filter(
      (e) =>
        e.serialNumber.toLowerCase().includes(target) ||
        e.customerName.toLowerCase().includes(target) ||
        e.deviceModel.toLowerCase().includes(target)
    );
    // Sort chronologically ascending
    return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEntries, selectedSerial]);

  // Stats calculation
  const totalCostSum = useMemo(() => {
    return timelineEvents.reduce((acc, ev) => {
      const num = parseInt((ev.repairCostEstimated || '').replace(/\D/g, ''), 10);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  }, [timelineEvents]);

  const maxHistoricalTemp = useMemo(() => {
    let max = 0;
    timelineEvents.forEach((ev) => {
      const num = parseInt((ev.peakTemp || '').replace(/\D/g, ''), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    return max;
  }, [timelineEvents]);

  if (!isOpen) return null;

  const handleSendTimelineToAI = () => {
    if (!onSendToChat) return;
    const summary = timelineEvents
      .map(
        (ev, idx) =>
          `${idx + 1}. [Data: ${ev.date}] [Stan: ${ev.status}] - Usterka: ${ev.faultSummary} | Temp Peak: ${
            ev.peakTemp
          } | Wymienione: ${ev.suspectComponent} | Uwagi: ${ev.technicianNotes}`
      )
      .join('\n');

    const prompt = `Przeanalizuj nawracającą historię napraw dla urządzenia o S/N: ${selectedSerial} (${
      timelineEvents[0]?.deviceModel || 'Komputer'
    }):\n\n${summary}\n\nCzy występuje tutaj wada fabryczna, zmęczenie materiałowe BGA czy problem z zasilaniem zewnętrznym? Jakie są rokowania na przyszłość?`;

    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-500 p-2.5 rounded-2xl text-slate-950 font-bold shadow-lg shadow-cyan-950/50">
              <Clock className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Oś Czasu Historia Napraw S/N
                </h2>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  SERIAL NUMBER TRACKER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interaktywna chronologia usterek, wymiany komponentów BGA i historii temperatur
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Serial Number Selector & Search Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Szukaj po S/N lub modelu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setSelectedSerial(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Quick S/N Tags */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-mono shrink-0">S/N:</span>
            {uniqueSerials.slice(0, 4).map((sn) => (
              <button
                key={sn}
                onClick={() => {
                  setSelectedSerial(sn);
                  setSearchQuery('');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
                  selectedSerial === sn
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sn}
              </button>
            ))}
          </div>

        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Device Summary & Stats */}
          {timelineEvents.length > 0 ? (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
              
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">MODEL URZĄDZENIA</span>
                <span className="font-bold text-slate-100 text-sm block line-clamp-1">
                  {timelineEvents[0]?.deviceModel || 'Niezdefiniowany'}
                </span>
                <span className="text-cyan-400 text-[11px] font-bold block mt-0.5">S/N: {selectedSerial}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block uppercase">ŁĄCZNIE NAPRAW</span>
                <span className="font-bold text-amber-400 text-base block">{timelineEvents.length} Wpisy</span>
                <span className="text-slate-400 text-[10px] block">
                  Pierwszy wpis: {timelineEvents[0]?.date}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block uppercase">SUMA KOSZTÓW NAPRAW</span>
                <span className="font-bold text-emerald-400 text-base block">{totalCostSum} PLN</span>
                <span className="text-slate-400 text-[10px] block">Suma inwestycji w sprzęt</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block uppercase">MAX TEMPERATURA HISTORYCZNA</span>
                <span className="font-bold text-red-400 text-base block">{maxHistoricalTemp}°C</span>
                <span className="text-slate-400 text-[10px] block">Punkt szczytowy IR</span>
              </div>

            </div>
          ) : (
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-slate-300 font-bold text-sm">Brak historii serwisowej dla wpisanego S/N</p>
              <p className="text-slate-500 text-xs">Użyj przycisków szybkiego wyboru S/N powyżej lub wpisz istniejący numer seryjny.</p>
            </div>
          )}

          {/* Visual Interactive Timeline Graph */}
          {timelineEvents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Wykres Czasowy Incydentów i Temperatur Hotspot (°C)</span>
                </h3>
              </div>

              {/* Graphical Timeline Bar */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
                <div className="relative h-24 flex items-end justify-between px-4 pt-4 pb-2 border-b border-slate-800">
                  {timelineEvents.map((ev, idx) => {
                    const temp = parseInt((ev.peakTemp || '60').replace(/\D/g, ''), 10) || 60;
                    const heightPercent = Math.min(100, Math.max(20, ((temp - 40) / 60) * 100));

                    return (
                      <div key={ev.id || idx} className="flex flex-col items-center group relative flex-1">
                        
                        {/* Temp Label above bar */}
                        <span className="text-[10px] text-slate-300 font-bold mb-1 opacity-90 group-hover:text-cyan-400 transition">
                          {ev.peakTemp || `${temp}°C`}
                        </span>

                        {/* Bar Segment */}
                        <div
                          className={`w-6 rounded-t-lg transition-all duration-300 group-hover:scale-110 ${
                            temp > 85
                              ? 'bg-gradient-to-t from-red-600 to-amber-500 shadow-lg shadow-red-950/80'
                              : 'bg-gradient-to-t from-cyan-600 to-emerald-400 shadow-lg shadow-cyan-950/80'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />

                        {/* Date Label below bar */}
                        <span className="text-[9px] text-slate-500 mt-2 rotate-[-25px] sm:rotate-0">
                          {ev.date}
                        </span>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vertical Detailed Chronological Nodes */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {timelineEvents.map((ev, idx) => (
                  <div key={ev.id || idx} className="relative group">
                    
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[9px] font-mono text-cyan-400 font-bold shadow-md shadow-cyan-950">
                      {idx + 1}
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 hover:border-cyan-500/50 transition shadow-lg space-y-3">
                      
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-amber-400 font-mono">{ev.date}</span>
                          <span className="text-xs text-slate-400 font-bold">•</span>
                          <span className="text-xs text-slate-200 font-bold">{ev.customerName || 'Klient Serwisowy'}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                              ev.status === 'Naprawiono'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {ev.status}
                          </span>

                          {ev.repairCostEstimated && (
                            <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                              {ev.repairCostEstimated}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Fault Info */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                          <Wrench className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{ev.faultSummary}</span>
                        </h4>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-500 block text-[10px]">PUNKT PRZEGRZEWANIA / HOTSPOT:</span>
                          <span className="text-red-400 font-bold flex items-center space-x-1">
                            <Flame className="w-3 h-3 text-red-400" />
                            <span>{ev.peakTemp || 'B/D'}</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px]">WYMIENIONY KOMPONENT / DIAGNOZA:</span>
                          <span className="text-cyan-300 font-bold">{ev.suspectComponent || 'Brak danych'}</span>
                        </div>
                      </div>

                      {/* Technician Notes */}
                      {ev.technicianNotes && (
                        <p className="text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50 italic">
                          "{ev.technicianNotes}"
                        </p>
                      )}

                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <p className="text-xs text-slate-400 font-mono">
            Znaleziono <strong className="text-cyan-400">{timelineEvents.length}</strong> wpisów w archiwum serwisu.
          </p>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onSendToChat && timelineEvents.length > 0 && (
              <button
                onClick={handleSendTimelineToAI}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Analizuj Nawracające Usterki AI</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-700 transition"
            >
              Zamknij
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
