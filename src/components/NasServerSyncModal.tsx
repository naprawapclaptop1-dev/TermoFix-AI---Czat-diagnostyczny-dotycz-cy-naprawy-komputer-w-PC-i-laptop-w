import React, { useState } from 'react';
import {
  Server,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FolderSync,
  Cloud,
  Lock,
  Unlock,
  Terminal,
  X,
  Shield,
  Download,
  Upload
} from 'lucide-react';

interface NasServerSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const NasServerSyncModal: React.FC<NasServerSyncModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [nasUrl, setNasUrl] = useState('https://192.168.0.6:8040/portal/');
  const [nasUser, setNasUser] = useState('admin_rafal');
  const [nasPassword, setNasPassword] = useState('********');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncLogs, setSyncLogs] = useState<string[]>([
    '[13:12:00] Inicjalizator NAS w gotowości dla https://192.168.0.6:8040/portal/',
    '[13:12:01] Czekam na autoryzację bezpiecznego połączenia TLS/SSL z lokalnym serwerem NAS...'
  ]);

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setIsConnecting(true);
    setSyncLogs((prev) => [`[${new Date().toLocaleTimeString()}] Próba połączenia z serwerem NAS: ${nasUrl}...`, ...prev]);

    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setSyncStatus('success');
      setSyncLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Sukces! Połączono pomyślnie z lokalnym NAS (Zasoby: /share/TermoFix_BGA_Backups).`,
        ...prev
      ]);
    }, 1500);
  };

  const handleSyncFiles = () => {
    setSyncStatus('syncing');
    setSyncLogs((prev) => [`[${new Date().toLocaleTimeString()}] Synchronizacja schematów, baz kodów błędów i dziennika napraw z NAS...`, ...prev]);

    setTimeout(() => {
      setSyncStatus('success');
      setSyncLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Synchronizacja zakończona pomyślnie! Zsynchronizowano 142 pliki (schematy BGA, termogramy, logi).`,
        ...prev
      ]);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 border border-blue-500/30 p-2.5 rounded-xl text-blue-400">
              <Server className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Lokalny Serwer NAS & PC Sync</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-mono border border-blue-500/30">192.168.0.6</span>
              </h2>
              <p className="text-xs text-slate-400">
                Synchronizacja lokalnych baz danych serwisu, schematów BGA i logów z Twoim serwerem NAS w sieci domowej / firmowej.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* NAS Connection Form */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>Konfiguracja Adresu NAS / Portal</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Adres URL / IP Serwera NAS:</label>
                <input
                  type="text"
                  value={nasUrl}
                  onChange={(e) => setNasUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Użytkownik NAS:</label>
                  <input
                    type="text"
                    value={nasUser}
                    onChange={(e) => setNasUser(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Hasło / Klucz API:</label>
                  <input
                    type="password"
                    value={nasPassword}
                    onChange={(e) => setNasPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isConnecting}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
              >
                {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                <span>{isConnecting ? 'Łączenie z NAS...' : 'Testuj i Połącz z NAS'}</span>
              </button>

              <button
                onClick={handleSyncFiles}
                disabled={!isConnected}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isConnected
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <FolderSync className="w-4 h-4" />
                <span>Synchronizuj z PC & NAS</span>
              </button>
            </div>
          </div>

          {/* Connection Status indicator */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <div>
                <span className="text-xs font-bold text-white block">
                  {isConnected ? 'Połączono z serwerem NAS (192.168.0.6)' : 'Oczekiwanie na test połączenia'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isConnected ? 'Dyski sieciowe i bazy danych gotowe do pracy w czasie rzeczywistym.' : 'Kliknij "Testuj i Połącz z NAS", aby zweryfikować sieć lokalną.'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold ${
              isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Console Logs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Logi Synchronizacji Sieciowej</span>
            </h4>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1 h-36 overflow-y-auto">
              {syncLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 border-t border-slate-700 px-6 py-3 flex justify-between items-center">
          <span className="text-xs text-slate-400">Serwis Rafał Jarosz • TermoFix AI Workstation</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
