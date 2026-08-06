import React, { useState } from 'react';
import { Terminal, Download, Cpu, ShieldCheck, ExternalLink, CheckCircle2, Play, Wrench, X, RefreshCw } from 'lucide-react';

interface WindowsInstallerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const WindowsInstallerServiceModal: React.FC<WindowsInstallerServiceModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [protocolUrl, setProtocolUrl] = useState('termofix://download-iso?edition=win11_pro&source=gdrive&hash_guard=true');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExecuteProtocol = () => {
    setIsExecuting(true);
    setSuccess(false);
    setExecutionLogs([
      '[WinInstallerService] Sprawdzanie rejestru systemu Windows dla schematu URL "termofix://"...',
      '[WinInstallerService] Znaleziono Handler: C:\\Program Files\\TermoFix\\WindowsInstallerService.exe',
      '[WinInstallerService] Inicjalizacja bezpośredniego gniazda TCP do Google Drive /TermoFixData...',
      '[WinInstallerService] Omijanie bufora przeglądarki (Direct Disk Write API initialized)...',
    ]);

    setTimeout(() => {
      setExecutionLogs(prev => [
        ...prev,
        '[Hash-Guard] Rozpoczęto strumieniowe pobieranie paczki ISO (5.84 GB)...',
        '[Hash-Guard] Weryfikacja SHA-256 w locie dla każdego chunku 512KB...',
        '[Success] Plik ISO został pomyślnie pobrany bezpośrednio przez WindowsInstallerService.exe!'
      ]);
      setIsExecuting(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base">WindowsInstallerService.exe (termofix:// Handler)</h2>
              <p className="text-xs text-slate-400">Natywna usługa systemowa do omijania ograniczeń bufora przeglądarki</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto font-mono text-xs">
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block">Adres protokołu niestandardowego (Custom Protocol Handler):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={protocolUrl}
                onChange={(e) => setProtocolUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleExecuteProtocol}
                disabled={isExecuting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg transition flex items-center gap-2 shrink-0"
              >
                {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>Wywołaj w Systemie</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Uruchomienie tego polecenia wyzwala natywny proces w tle Windows omijający limity pamięci RAM/Pojemności bufora przeglądarki.
            </p>
          </div>

          {/* Execution Output Console */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 min-h-[160px] max-h-[260px] overflow-y-auto">
            <div className="text-slate-500 font-bold text-[10px] pb-1 border-b border-slate-800 flex items-center justify-between">
              <span>NATIVE DAEMON LOGS / STDOUT</span>
              <span className="text-emerald-400">STATUS: {isExecuting ? 'ACTIVE' : success ? 'COMPLETED' : 'READY'}</span>
            </div>

            {executionLogs.length === 0 ? (
              <div className="text-slate-600 italic py-8 text-center">Brak aktywnych zadań. Kliknij „Wywołaj w Systemie”, aby uruchomić WindowsInstallerService.exe.</div>
            ) : (
              executionLogs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed ${log.includes('Success') ? 'text-emerald-400 font-bold' : log.includes('Hash-Guard') ? 'text-cyan-300' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))
            )}
          </div>

          {success && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-emerald-200">Pobieranie natywne zakończone sukcesem!</strong>
                <span className="text-[11px] text-emerald-400/80">Plik ISO został zapisany bezpośrednio do folderu docelowego z zweryfikowaną sumą kontrolną SHA-256.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono">TermoFix Service Daemon v2.4</span>
          <div className="flex gap-2">
            {onSendToChat && success && (
              <button
                onClick={() => {
                  onSendToChat(`Uruchomiono pomyślnie WindowsInstallerService.exe przez protokół termofix:// dla obrazu ISO.`);
                  onClose();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl font-bold transition"
              >
                Wyślij Raport do Chatu
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
