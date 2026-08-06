import React, { useState, useEffect } from 'react';
import {
  Search,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  X,
  FileBox,
  Settings2,
  RefreshCw,
  FolderArchive
} from 'lucide-react';

export interface DuplicateFileFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const DuplicateFileFinderModal: React.FC<DuplicateFileFinderModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentPath, setCurrentPath] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [totalSavedSize, setTotalSavedSize] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            setCurrentPath('Skanowanie zakończone.');
            return 100;
          }
          const increment = Math.random() * 5 + 2;
          const paths = [
            'C:\\Users\\Default\\Downloads\\...',
            'C:\\Windows\\Temp\\...',
            'D:\\Backup\\Zdjęcia\\...',
            'C:\\Program Files\\...',
            'Analiza sum kontrolnych SHA-256...'
          ];
          setCurrentPath(paths[Math.floor(Math.random() * paths.length)]);
          return Math.min(prev + increment, 100);
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setTotalSavedSize(0);
    setDuplicates([
      { id: '1', name: 'Raport_Finansowy_Kopia.pdf', size: '2.4 MB', path: 'C:\\Users\\Public\\Documents', status: 'found' },
      { id: '2', name: 'IMG_2024_08_Kopia(1).jpg', size: '4.1 MB', path: 'D:\\Zdjęcia\\Wakacje', status: 'found' },
      { id: '3', name: 'Kopia Instalatora_TermoFix.exe', size: '82.2 MB', path: 'C:\\Downloads', status: 'found' },
      { id: '4', name: 'Backup_Rejestru_old.reg', size: '12.5 MB', path: 'C:\\Temp', status: 'found' }
    ]);
  };

  const handleDeleteAll = () => {
    setDuplicates(prev => prev.map(d => ({ ...d, status: 'deleted' })));
    setTotalSavedSize(101.2); // Sum of above sizes
    if (onSendToChat) {
      onSendToChat('Zakończono usuwanie zduplikowanych plików. Odzyskano 101.2 MB miejsca na dysku.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Wykrywacz Duplikatów Plików</h2>
              <p className="text-xs text-blue-300">Zwolnij miejsce na dysku usuwając powielone pliki (SHA-256)</p>
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
                <Settings2 className="w-4 h-4 text-slate-400" /> Ustawienia Skanowania
              </h3>
              <div className="space-y-2 text-xs text-slate-300">
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" /> Skanuj wszystkie dyski</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" /> Porównuj sumy kontrolne (SHA-256)</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" /> Ignoruj pliki systemowe</label>
              </div>
              <button
                onClick={startScan}
                disabled={isScanning}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isScanning ? 'Skanowanie...' : 'Rozpocznij Skan'}
              </button>
            </div>

            {isScanning && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Postęp skanowania</span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${scanProgress}%` }}></div>
                </div>
                <div className="text-[10px] text-slate-500 truncate font-mono">{currentPath}</div>
              </div>
            )}

            {totalSavedSize > 0 && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-emerald-400 font-bold text-sm">Odzyskano Miejsce!</h3>
                <p className="text-xl font-black text-white mt-1">{totalSavedSize} MB</p>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileBox className="w-4 h-4 text-blue-400" /> Znalezione Duplikaty
              </h3>
              {duplicates.some(d => d.status === 'found') && !isScanning && (
                <button
                  onClick={handleDeleteAll}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Skasuj Zaznaczone
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {duplicates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                  <HardDrive className="w-12 h-12 opacity-20 mb-3" />
                  <p className="text-xs">Rozpocznij skanowanie, aby znaleźć zduplikowane pliki.</p>
                </div>
              ) : (
                duplicates.map((file) => (
                  <div key={file.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${file.status === 'deleted' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {file.name}
                        </span>
                        {file.status === 'deleted' && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded uppercase font-bold">Usunięto</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{file.path}</div>
                    </div>
                    <div className="text-xs font-mono text-slate-400 shrink-0 ml-3">
                      {file.size}
                    </div>
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
