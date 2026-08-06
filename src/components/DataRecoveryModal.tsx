import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  HardDrive,
  FileImage,
  FileText,
  File,
  Play,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderSearch,
  Save
} from 'lucide-react';

export interface DataRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface RecoveredFile {
  name: string;
  type: string;
  size: string;
  chance: 'Wysoka' | 'Średnia' | 'Niska';
}

export const DataRecoveryModal: React.FC<DataRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSector, setCurrentSector] = useState('');
  const [foundFiles, setFoundFiles] = useState<RecoveredFile[]>([]);
  const [scanType, setScanType] = useState('szybkie');

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100 && scanType !== "ciagle") {
            clearInterval(interval);
            setIsScanning(false);
            setCurrentSector('Skanowanie zakończone.');
            return 100;
          }
          const increment = scanType === "szybkie" ? Math.random() * 5 + 1 : (scanType === "ciagle" ? (Math.random() * 2) * (prev > 95 ? -5 : 1) : Math.random() * 2 + 0.5);
          let nextProgress = prev + increment;
          if (scanType === "ciagle") {
             if (nextProgress > 99) nextProgress = Math.random() * 50 + 20; // reset to simulate continuous neural loop
          }
          
          if (Math.random() > 0.6) {
             const types = ['jpg', 'docx', 'pdf', 'mp4', 'xlsx', 'zip'];
             const names = ['wakacje', 'raport_finansowy', 'faktura_2025', 'backup', 'dokument_nowy'];
             const type = types[Math.floor(Math.random() * types.length)];
             const name = names[Math.floor(Math.random() * names.length)];
             
             const chances: ('Wysoka' | 'Średnia' | 'Niska')[] = ['Wysoka', 'Wysoka', 'Średnia', 'Niska'];
             const newFile: RecoveredFile = {
               name: `${name}_odzyskano.${type}`,
               type: type.toUpperCase(),
               size: `${(Math.random() * 50 + 1).toFixed(2)} MB`,
               chance: chances[Math.floor(Math.random() * chances.length)]
             };
             
             setFoundFiles(f => [newFile, ...f]);
          }
          
          if (scanType === "ciagle") {
            setCurrentSector(`AI Neural Node: 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()} | Rekonstrukcja wektora danych...`);
          } else {
            setCurrentSector(`Sektor: 0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}`);
          }
          return scanType === "ciagle" ? nextProgress : Math.min(nextProgress, 100);
        });
      }, scanType === 'szybkie' ? 200 : 500);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanType]);

  const startScan = () => {
    setIsScanning(true);
    setProgress(0);
    setFoundFiles([]);
    setCurrentSector('Inicjalizacja skanowania...');
  };

  const handleFinish = () => {
    if (onSendToChat) {
      onSendToChat(`Skanowanie odzyskiwania danych zakończone. Znaleziono ${foundFiles.length} plików do przywrócenia.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Data Recovery PRO</h2>
              <p className="text-xs text-amber-300">Odzyskiwanie danych po formacie i usunięciu (dla odblokowanych nośników)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          
          {/* Controls Panel */}
          <div className="md:w-1/3 space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" /> Wybór Nośnika
              </h3>
              <select className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5 mb-4">
                <option>Dysk C: (System) - 512 GB</option>
                <option>Dysk D: (Dane) - 1 TB</option>
                <option>Dysk E: (USB Flash) - 32 GB</option>
              </select>

              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" /> Tryb Skanowania
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800 border border-transparent has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-900/20">
                  <input type="radio" name="scanType" value="szybkie" checked={scanType === 'szybkie'} onChange={() => setScanType('szybkie')} className="accent-amber-500" />
                  <div>
                    <div className="font-bold text-slate-200">Szybkie skanowanie</div>
                    <div className="text-slate-500">Szuka niedawno usuniętych plików</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800 border border-transparent has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-900/20">
                  <input type="radio" name="scanType" value="ciagle" checked={scanType === 'ciagle'} onChange={() => setScanType('glebokie')} className="accent-amber-500" />
                  <div>
                    <div className="font-bold text-slate-200">Ciągła Analiza AI (Live Neural Scan)</div>
                    <div className="text-slate-500">Nieskończone skanowanie i rekonstrukcja danych przez sieć neuronową</div>
                  </div>
                </label>
              </div>

              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex gap-3 text-xs text-blue-200">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <p>Uwaga: Odzyskiwanie z partycji szyfrowanych (np. BitLocker) wymaga uprzedniego odblokowania nośnika poprawnym hasłem lub kluczem odzyskiwania.</p>
              </div>

              <button
                onClick={startScan}
                disabled={isScanning}
                className="w-full mt-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-amber-900/20"
              >
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isScanning ? 'Skanowanie trwa...' : 'Rozpocznij Skanowanie'}
              </button>
            </div>

            {isScanning && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Postęp skanowania</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-[10px] text-slate-500 truncate font-mono">{currentSector}</div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderSearch className="w-4 h-4 text-amber-400" /> Znalezione pliki ({foundFiles.length})
              </h3>
              {(progress === 100 || scanType === "ciagle") && foundFiles.length > 0 && (
                <button
                  onClick={handleFinish}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <Save className="w-4 h-4" /> Przywróć Zaznaczone
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {foundFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 p-6 text-center">
                  <Search className="w-12 h-12 opacity-20" />
                  <p>Kliknij "Rozpocznij Skanowanie", aby rozpocząć wyszukiwanie usuniętych plików.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900/80 sticky top-0 backdrop-blur-md text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-4 font-medium"><input type="checkbox" className="rounded border-slate-700 bg-slate-800" defaultChecked /></th>
                      <th className="py-2 px-4 font-medium">Nazwa pliku</th>
                      <th className="py-2 px-4 font-medium">Rozmiar</th>
                      <th className="py-2 px-4 font-medium">Szansa przywrócenia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foundFiles.map((file, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition">
                        <td className="py-2 px-4"><input type="checkbox" className="rounded border-slate-700 bg-slate-800" defaultChecked /></td>
                        <td className="py-2 px-4 flex items-center gap-2 text-slate-200">
                          {file.type === 'JPG' || file.type === 'PNG' ? <FileImage className="w-4 h-4 text-blue-400" /> : <File className="w-4 h-4 text-slate-400" />}
                          {file.name}
                        </td>
                        <td className="py-2 px-4 text-slate-400">{file.size}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            file.chance === 'Wysoka' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            file.chance === 'Średnia' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {file.chance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
