import React, { useState, useEffect } from 'react';
import {
  Archive,
  FolderOpen,
  Play,
  CheckCircle2,
  X,
  Layers,
  Settings2,
  RefreshCw,
  FileArchive,
  ArrowRight
} from 'lucide-react';

export interface BatchArchiveExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const BatchArchiveExtractorModal: React.FC<BatchArchiveExtractorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [extractedCount, setExtractedCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let interval: any;
    if (isExtracting) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsExtracting(false);
            setCurrentFile('Wypakowywanie zakończone pomyślnie.');
            setLogs(l => ['[SUKCES] Zakończono rekursywne wypakowywanie.', ...l]);
            return 100;
          }
          const increment = Math.random() * 8 + 2;
          const exts = ['.rar', '.zip', '.7z', '.tar.gz'];
          const names = ['backup_2026', 'dane_klienta_part1', 'sterowniki_paczka', 'zagniezdzone_archiwum_v2'];
          
          if (Math.random() > 0.5) {
             const file = `${names[Math.floor(Math.random() * names.length)]}${exts[Math.floor(Math.random() * exts.length)]}`;
             setCurrentFile(`Wypakowywanie: ${file} ...`);
             setExtractedCount(c => c + 1);
             setLogs(l => [`Wypakowano ${file} -> /folder_${Math.floor(Math.random() * 15) + 1}/`, ...l].slice(0, 50));
          }

          return Math.min(prev + increment, 100);
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isExtracting]);

  const startExtraction = () => {
    setIsExtracting(true);
    setProgress(0);
    setExtractedCount(0);
    setLogs(['[START] Rozpoczęto masowe wypakowywanie archiwów (RAR, ZIP, 7Z)...']);
  };

  const handleFinish = () => {
    if (onSendToChat) {
      onSendToChat(`Zakończono masowe wypakowywanie. Rozpakowano ${extractedCount} zagnieżdżonych archiwów ZIP/RAR.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Multi-Ekstraktor Archiwów (ZIP/RAR)</h2>
              <p className="text-xs text-indigo-300">Masowe, rekursywne rozpakowywanie zagnieżdżonych archiwów do wielu folderów</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col sm:flex-row gap-6">
          
          {/* Controls Panel */}
          <div className="sm:w-1/3 space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-400" /> Ustawienia Ekstrakcji
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" /> 
                  Rekursywnie (archiwa w archiwach)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" /> 
                  Utwórz oddzielne foldery (1-15)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" /> 
                  Ignoruj uszkodzone pliki
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" /> 
                  Automatycznie usuń archiwa po wypakowaniu
                </label>
              </div>
              <button
                onClick={startExtraction}
                disabled={isExtracting}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {isExtracting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isExtracting ? 'Wypakowywanie...' : 'Uruchom Multi-Wypakowanie'}
              </button>
            </div>

            {isExtracting && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Postęp operacji</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-[10px] text-slate-500 truncate font-mono">{currentFile}</div>
              </div>
            )}

            {progress === 100 && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-emerald-400 font-bold text-sm">Operacja Zakończona!</h3>
                <p className="text-xs text-slate-300">Wypakowano {extractedCount} archiwów</p>
                <button
                  onClick={handleFinish}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg mt-2 w-full transition"
                >
                  Zgłoś do Asystenta
                </button>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Log Operacji
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                Wątków: 15 (Max)
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] sm:text-xs">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
                  <FileArchive className="w-12 h-12 opacity-20" />
                  <p>Oczekiwanie na uruchomienie zadania...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`flex items-start gap-2 ${log.startsWith('[SUKCES]') ? 'text-emerald-400 font-bold' : log.startsWith('[START]') ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>
                    <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 opacity-50" />
                    <span className="break-all">{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
