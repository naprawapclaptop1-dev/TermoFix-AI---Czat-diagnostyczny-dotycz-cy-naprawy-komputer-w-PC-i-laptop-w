import React, { useState, useEffect } from 'react';
import { X, Shield, ShieldAlert, ShieldCheck, Search, Activity, Bug, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

interface AntivirusSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const AntivirusSimulatorModal: React.FC<AntivirusSimulatorModalProps> = ({ isOpen, onClose, onSendToChat }) => {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'cleaning' | 'clean'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [threats, setThreats] = useState<{name: string, file: string}[]>([]);

  useEffect(() => {
    let interval: any;
    if (scanStatus === 'scanning') {
      interval = setInterval(() => {
        setProgress(p => {
          const newP = p + Math.random() * 5;
          if (newP >= 45 && threats.length === 0) {
            setThreats([{ name: 'Trojan.Win32.Miner', file: 'C:\\Windows\\System32\\svchost.exe (Infected)' }]);
            setScanStatus('found');
            return newP;
          }
          if (newP >= 80 && threats.length === 1) {
            setThreats(prev => [...prev, { name: 'Adware.BrowserHijacker', file: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\setup.exe' }]);
            setScanStatus('found');
          }
          if (newP >= 100) {
            clearInterval(interval);
            setScanStatus(threats.length > 0 ? 'found' : 'clean');
            return 100;
          }
          return newP;
        });
        setCurrentFile(`C:\\Windows\\System32\\...\\file_${Math.floor(Math.random() * 1000)}.dll`);
      }, 200);
    } else if (scanStatus === 'cleaning') {
      interval = setInterval(() => {
        setProgress(p => {
          const newP = p + 10;
          if (newP >= 100) {
            clearInterval(interval);
            setThreats([]);
            setScanStatus('clean');
            if (onSendToChat) {
              onSendToChat("Zakończono symulację usuwania wirusów. Wyczyściłem: Trojan.Win32.Miner oraz Adware.BrowserHijacker. System jest zabezpieczony.");
            }
            return 100;
          }
          return newP;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [scanStatus, threats.length, onSendToChat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-900/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-4 flex items-center justify-between border-b border-emerald-800/30">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-white font-bold text-lg">Symulator Antywirusa TermoFix AI</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            {scanStatus === 'idle' && <Shield className="w-24 h-24 text-slate-600" />}
            {scanStatus === 'scanning' && <Activity className="w-24 h-24 text-emerald-500 animate-pulse" />}
            {scanStatus === 'found' && <ShieldAlert className="w-24 h-24 text-red-500 animate-bounce" />}
            {scanStatus === 'cleaning' && <Trash2 className="w-24 h-24 text-amber-500 animate-pulse" />}
            {scanStatus === 'clean' && <ShieldCheck className="w-24 h-24 text-emerald-500" />}
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              {scanStatus === 'idle' && 'System gotowy do skanowania'}
              {scanStatus === 'scanning' && 'Skanowanie w toku...'}
              {scanStatus === 'found' && 'Znaleziono zagrożenia!'}
              {scanStatus === 'cleaning' && 'Usuwanie złośliwego oprogramowania...'}
              {scanStatus === 'clean' && 'System bezpieczny. Brak zagrożeń.'}
            </h3>
            <p className="text-slate-400 font-mono text-sm h-6">
              {scanStatus === 'scanning' ? currentFile : ''}
            </p>
          </div>

          {(scanStatus === 'scanning' || scanStatus === 'cleaning' || progress > 0) && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-emerald-400 font-mono">
                <span>Postęp</span>
                <span>{Math.min(100, Math.floor(progress))}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${scanStatus === 'found' ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          )}

          {threats.length > 0 && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 space-y-2">
              <h4 className="text-red-400 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Wykryto zainfekowane pliki:
              </h4>
              {threats.map((t, idx) => (
                <div key={idx} className="bg-slate-900 border border-red-900 p-2 rounded flex items-center gap-3">
                  <Bug className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="truncate">
                    <p className="text-white text-sm font-bold">{t.name}</p>
                    <p className="text-slate-500 text-xs font-mono truncate">{t.file}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-emerald-900/30 flex justify-end gap-3">
          {scanStatus === 'idle' || scanStatus === 'clean' ? (
            <button
              onClick={() => {
                setProgress(0);
                setThreats([]);
                setScanStatus('scanning');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              Skanuj System
            </button>
          ) : scanStatus === 'found' ? (
            <button
              onClick={() => {
                setProgress(0);
                setScanStatus('cleaning');
              }}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" />
              Usuń Wirusy (Kwarantanna)
            </button>
          ) : (
            <button disabled className="bg-slate-800 text-slate-500 px-6 py-2 rounded-lg font-bold">
              Przetwarzanie...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
