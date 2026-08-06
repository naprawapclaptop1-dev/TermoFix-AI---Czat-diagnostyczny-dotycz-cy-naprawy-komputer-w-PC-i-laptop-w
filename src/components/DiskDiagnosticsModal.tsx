import React, { useState } from 'react';
import { X, HardDrive, AlertTriangle, CheckCircle, Search, Activity, ShieldAlert, Copy, RefreshCw, Cpu, Layers, Tv } from 'lucide-react';
import { DiagnosticVideoTutorialsTab } from './DiagnosticVideoTutorialsTab';
import { LiveSpecsAuditTab } from './LiveSpecsAuditTab';

interface DiskDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string) => void;
}

interface SmartAttribute {
  id: string;
  name: string;
  importance: string;
  symptomIfFailed: string;
  actionRequired: string;
}

const SMART_ATTRIBUTES: SmartAttribute[] = [
  {
    id: '05',
    name: '05 - Reallocated Sectors Count (Liczba Relokowanych Sektorów)',
    importance: 'KRYTYCZNA',
    symptomIfFailed: 'Fizyczne bad sektory talerza HDD. Dysk napotkał błąd odczytu/zapisu i przeniósł dane do strefy zapasowej.',
    actionRequired: 'Natychmiast zrób kopię zapasową! Dysk ulega degradacji mechanicznej.'
  },
  {
    id: 'C5',
    name: 'C5 - Current Pending Sector Count (Sektory Niestabilne / Oczekujące)',
    importance: 'KRYTYCZNA',
    symptomIfFailed: 'Sektory oczekujące na remapowanie z powodu błędu CRC I/O. Powoduje zacięcia eksploratora Windows (100% obciążenia dysku).',
    actionRequired: 'Uruchom chkdsk C: /f /r lub pełne formatowanie powolne (Zero-fill).'
  },
  {
    id: 'B8',
    name: 'B8 - End-to-End Error / Parity Fail',
    importance: 'KRYTYCZNA',
    symptomIfFailed: 'Błąd spójności danych przesyłanych między buforem pamięci RAM kontrolera a kością pamięci NAND / talerzem.',
    actionRequired: 'Możliwe uszkodzenie pamięci cache dysku lub uszkodzona taśma SATA / gniazdo M.2.'
  },
  {
    id: 'NVME-PERCENT',
    name: 'Percentage Used (Zużycie Żywotności SSD NVMe)',
    importance: 'OSTRZEŻENIE',
    symptomIfFailed: 'Mówi o szacowanym stopniu zużycia komórek pamięci Flash NAND (TBW - Total Bytes Written).',
    actionRequired: 'Powyżej 95% kontroler przejdzie w tryb Read-Only (Tylko Do Odczytu), aby chronić dane.'
  }
];

export const DiskDiagnosticsModal: React.FC<DiskDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'smart' | 'videos'>('smart');
  const [smartInput, setSmartInput] = useState('');

  if (!isOpen) return null;

  const handleAnalyzeCustomLog = () => {
    if (!smartInput.trim()) return;
    onSendToChat(`Przeanalizuj poniższy log SMART / opis stanu dysku SSD/HDD i podaj diagnozę uszkodzenia, prognozę żywotności oraz instrukcję klonowania systemowego:\n\n${smartInput}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">
                Skaner &amp; Analizator Dysków SSD / HDD (SMART &amp; Bad Sectors)
              </h2>
              <p className="text-xs text-slate-400">
                Wykrywanie bad sektorów, kontrolera NVMe, zacięć I/O oraz poradnik klonowania systemowego
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

        {/* Tab Selector Bar */}
        <div className="bg-slate-950 px-4 pt-2 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('smart')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'smart'
                ? 'bg-slate-900 text-emerald-400 border-emerald-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Skaner SMART &amp; Bad Sectors</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-xl font-bold transition border-t border-x ${
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'live_specs'
                ? 'bg-slate-900 text-cyan-300 border-cyan-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Specyfikacja na Żywo</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm">
          
          {activeTab === 'live_specs' ? (
            <LiveSpecsAuditTab
              modalTitle="Diagnostyka Dysków SMART"
              onSendToChat={onSendToChat}
            />
          ) : activeTab === 'videos' ? (
            <DiagnosticVideoTutorialsTab
              categoryFilter="ALL"
              title="Poradniki Wideo Diagnostyki Dysków, Odzyskiwania Danych & Reballingu"
              onSendToChat={onSendToChat}
            />
          ) : (
            <>
              {/* Paste Log Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-amber-400 text-xs sm:text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              Wklej Raport SMART (CrystalDiskInfo, HWInfo, HD Tune lub opisz objawy):
            </h3>

            <textarea
              value={smartInput}
              onChange={(e) => setSmartInput(e.target.value)}
              placeholder="np. CrystalDiskInfo pokazał: 05 Reallocated Sectors Count = 1266, Dysk C ma 100% obciążenia w menedżerze zadań i Windows zawiesza się na 5 minut..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <div className="flex justify-end">
              <button
                onClick={handleAnalyzeCustomLog}
                disabled={!smartInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 disabled:opacity-40"
              >
                <Activity className="w-4 h-4" />
                <span>Przeanalizuj SMART z AI</span>
              </button>
            </div>
          </div>

          {/* Reference SMART Guide */}
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Kluczowe Atrybuty SMART i Ich Znaczenie
            </h3>

            <div className="space-y-3">
              {SMART_ATTRIBUTES.map((attr) => (
                <div
                  key={attr.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 font-mono text-xs sm:text-sm">{attr.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      attr.importance === 'KRYTYCZNA' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {attr.importance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{attr.symptomIfFailed}</p>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    📍 <strong>Zalecana reakcja:</strong> {attr.actionRequired}
                  </p>
                </div>
              ))}
            </div>
          </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
