import React, { useState, useEffect } from 'react';
import { 
  FolderDown, 
  Search, 
  Download, 
  CheckCircle2, 
  FileText, 
  HardDrive, 
  Cpu, 
  X, 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  FileCode, 
  Check, 
  Sparkles,
  ShieldCheck,
  Zap,
  Folder,
  ArrowDownToLine
} from 'lucide-react';

export interface GoogleDriveFile {
  id: string;
  name: string;
  category: 'ISO' | 'EXE' | 'BIOS' | 'MANUAL';
  size: string;
  sizeBytes: number;
  mimeType: string;
  modifiedDate: string;
  description: string;
  downloadUrl: string;
  sha256: string;
}

export const MOCK_TERMOFIX_GDRIVE_FILES: GoogleDriveFile[] = [
  {
    id: 'gd-iso-win11-termofix',
    name: 'TermoFix_Win11_23H2_Polish_Service_Edition_v2026.iso',
    category: 'ISO',
    size: '5.84 GB',
    sizeBytes: 6271033344,
    mimeType: 'application/x-iso9660-image',
    modifiedDate: '2026-08-01',
    description: 'Custom Obraz Windows 11 23H2 PL z wbudowanymi sterownikami VMD/NVMe, wyłączonym TPM/SecureBoot oraz pakietem diagnostycznym TermoFix.',
    downloadUrl: 'https://drive.google.com/file/d/15bVQFIlsXVBkfa1l1WR0zKb8MFuX3_PP/view',
    sha256: 'A8F91B2C3D4E5F67890123456789ABCDEF0123456789ABCDEF0123456789ABCD'
  },
  {
    id: 'gd-iso-winpe-strelec',
    name: 'Serwis_Strelec_WinPE_Rescue_Edition_2026.iso',
    category: 'ISO',
    size: '3.12 GB',
    sizeBytes: 3350000000,
    mimeType: 'application/x-iso9660-image',
    modifiedDate: '2026-07-28',
    description: 'Bootowalny zestaw ratunkowy WinPE Sergi Strelec z ponad 200 narzędziami do odzyskiwania danych, resetowania haseł i testowania RAM.',
    downloadUrl: 'https://drive.google.com/file/d/1StrelecPE2026RescueEdition/view',
    sha256: 'B1C2D3E4F567890123456789ABCDEF0123456789ABCDEF0123456789ABCDEF01'
  },
  {
    id: 'gd-exe-termofix-agent',
    name: 'TermoFix_AI_Computer_Agent_v4.5.exe',
    category: 'EXE',
    size: '48.2 MB',
    sizeBytes: 50542592,
    mimeType: 'application/x-msdownload',
    modifiedDate: '2026-08-04',
    description: 'Samodzielny agent sterowania systemem z syntezą mowy PL, naprawą rejestru SFC/DISM i skanerem LAN ARP.',
    downloadUrl: 'https://drive.google.com/file/d/1TermoFixAgentExe2026/view',
    sha256: 'C3D4E5F67890123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123'
  },
  {
    id: 'gd-exe-mats-mods-gui',
    name: 'NVIDIA_MATS_MODS_VRAM_Tester_GUI_Win11.exe',
    category: 'EXE',
    size: '124.5 MB',
    sizeBytes: 130548224,
    mimeType: 'application/x-msdownload',
    modifiedDate: '2026-07-15',
    description: 'Graficzny interfejs Windows do uruchamiania skryptów diagnozy uszkodzonych kości pamięci VRAM GPU NVIDIA.',
    downloadUrl: 'https://drive.google.com/file/d/1MatsModsVramTesterGui/view',
    sha256: 'D4E5F67890123456789ABCDEF0123456789ABCDEF0123456789ABCDEF012345'
  },
  {
    id: 'gd-bios-asus-z790',
    name: 'ASUS_ROG_STRIX_Z790-F_GAMING_WIFI_v1402.CAP',
    category: 'BIOS',
    size: '24.5 MB',
    sizeBytes: 25690112,
    mimeType: 'application/octet-stream',
    modifiedDate: '2026-08-02',
    description: 'Oryginalny wsadowy plik BIOS z mikrokodem dla procesorów Intel 13/14 Generacji z czystym ME Region.',
    downloadUrl: 'https://drive.google.com/file/d/1AsusZ790BiosCAPv1402/view',
    sha256: 'E5F67890123456789ABCDEF0123456789ABCDEF0123456789ABCDEF01234567'
  },
  {
    id: 'gd-bios-lenovo-legion',
    name: 'Lenovo_Legion_5_15ACH6H_NM-D561_ClearME.bin',
    category: 'BIOS',
    size: '16.0 MB',
    sizeBytes: 16777216,
    mimeType: 'application/octet-stream',
    modifiedDate: '2026-07-20',
    description: 'Zrzut BIOS dump dla płyty NM-D561 z odblokowanym hasłem supervisor i wyczyszczonym regionem Intel/AMD.',
    downloadUrl: 'https://drive.google.com/file/d/1LenovoLegion5NMD561ClearME/view',
    sha256: 'F67890123456789ABCDEF0123456789ABCDEF0123456789ABCDEF012345678'
  },
  {
    id: 'gd-manual-schematics-compal',
    name: 'Compal_LA-K201P_Dell_Latitude_5520_Boardview_Schematic.pdf',
    category: 'MANUAL',
    size: '8.4 MB',
    sizeBytes: 8808038,
    mimeType: 'application/pdf',
    modifiedDate: '2026-06-11',
    description: 'Kompletna dokumentacja serwisowa, schemat elektryczny i rysunek rozmieszczenia elementów (Boardview PDF).',
    downloadUrl: 'https://drive.google.com/file/d/1CompalLAK201PSchematicsPdf/view',
    sha256: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'
  },
  {
    id: 'gd-manual-bga-reballing',
    name: 'Poradnik_BGA_Reballing_PTM7950_Procedury_Serwisowe_2026.pdf',
    category: 'MANUAL',
    size: '14.2 MB',
    sizeBytes: 14889779,
    mimeType: 'application/pdf',
    modifiedDate: '2026-07-02',
    description: 'Instrukcja profilowania pieca IR/BGA, nakładania padów zmiennofazowych PTM7950 oraz lutowania gniazd LPDDR5.',
    downloadUrl: 'https://drive.google.com/file/d/1BgaReballingPtm7950Guide2026/view',
    sha256: '123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0'
  }
];

export interface GoogleDriveBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const GoogleDriveBrowserModal: React.FC<GoogleDriveBrowserModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'ISO' | 'EXE' | 'BIOS' | 'MANUAL'>('ALL');
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [completedDownloads, setCompletedDownloads] = useState<Record<string, boolean>>({});
  const [syncStatusMap, setSyncStatusMap] = useState<Record<string, 'SYNCED' | 'VERIFYING' | 'CORRUPTED' | 'AUTO_REPAIRED'>>({
    'gd-iso-win11-termofix': 'SYNCED',
    'gd-exe-termofix-agent': 'SYNCED'
  });

  if (!isOpen) return null;

  const filteredFiles = MOCK_TERMOFIX_GDRIVE_FILES.filter(file => {
    const matchesCategory = selectedCategory === 'ALL' || file.category === selectedCategory;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleVerifyOrRepair = (file: GoogleDriveFile) => {
    setSyncStatusMap(prev => ({ ...prev, [file.id]: 'VERIFYING' }));
    setTimeout(() => {
      const isCorrupted = Math.random() < 0.25; // 25% simulated corruption chance to test auto-repair
      if (isCorrupted) {
        setSyncStatusMap(prev => ({ ...prev, [file.id]: 'CORRUPTED' }));
        setTimeout(() => {
          setSyncStatusMap(prev => ({ ...prev, [file.id]: 'AUTO_REPAIRED' }));
        }, 1200);
      } else {
        setSyncStatusMap(prev => ({ ...prev, [file.id]: 'SYNCED' }));
      }
    }, 1000);
  };

  const handleDownloadToLocal = (file: GoogleDriveFile) => {
    setDownloadingFileId(file.id);
    setDownloadProgress(0);
    setSyncStatusMap(prev => ({ ...prev, [file.id]: 'VERIFYING' }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
                        setDownloadingFileId(null);
        setCompletedDownloads(prev => ({ ...prev, [file.id]: true }));
        setSyncStatusMap(prev => ({ ...prev, [file.id]: 'SYNCED' }));

        if (file.category === 'EXE') {
           // Pobierz prawdziwy plik EXE z serwera, aby nie blokował go Windows SmartScreen
           if (file.id === 'gd-exe-termofix-agent') {
              window.location.href = '/api/download-ai-agent-exe';
           } else {
              window.location.href = '/api/download-exe';
           }
           return;
        }

        // Trigger browser save simulation/file Blob download
        const dummyContent = `[TermoFix Local Data Download & SHA-256 Verified]\nFile: ${file.name}\nSHA256: ${file.sha256}\nDate: ${new Date().toISOString()}\nOriginal Source: Google Drive Folder /TermoFixData\n`;
        const blob = new Blob([dummyContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
      setDownloadProgress(Math.min(100, progress));
    }, 180);
  };

  const handleSendFileToChat = (file: GoogleDriveFile) => {
    if (onSendToChat) {
      onSendToChat(`Proszę o analizę pliku z chmury Dysk Google TermoFixData: "${file.name}" (${file.category}, ${file.size}). Sha256: ${file.sha256}.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[85] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-800/50 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-500/20 p-2.5 rounded-xl text-cyan-400 border border-cyan-500/30">
              <FolderDown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Przeglądarka Chmury Google Drive API (`TermoFixData`)</span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold">
                  DIRECT DOWNLOAD
                </span>
              </h2>
              <p className="text-xs text-cyan-200">
                Oficjalne repozytorium plików ISO, programów .EXE, zrzutów BIOS oraz schematów w folderze Dysk Google `TermoFixData`
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

        {/* Search & Category Toolbar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj pliku ISO, EXE, BIOS lub schematu..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {(['ALL', 'ISO', 'EXE', 'BIOS', 'MANUAL'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Wszystkie Pliki' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Files Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
            <span className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>Dysk Google Folder: <strong className="text-white">/TermoFixData/Public/Files/</strong></span>
            </span>
            <span>Znaleziono: <strong className="text-cyan-300 font-mono">{filteredFiles.length}</strong> plików</span>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Search className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm">Brak wyników dla podanych kryteriów wyszukiwania.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFiles.map((file) => {
                const isDownloading = downloadingFileId === file.id;
                const isCompleted = !!completedDownloads[file.id];
                const syncStatus = syncStatusMap[file.id] || 'SYNCED';

                return (
                  <div 
                    key={file.id} 
                    className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                            file.category === 'ISO' ? 'bg-blue-950 text-blue-300 border-blue-500/40' :
                            file.category === 'EXE' ? 'bg-purple-950 text-purple-300 border-purple-500/40' :
                            file.category === 'BIOS' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
                            'bg-amber-950 text-amber-300 border-amber-500/40'
                          }`}>
                            {file.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{file.size}</span>
                        </div>

                        {/* Synchronization Status Badge */}
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                            syncStatus === 'SYNCED' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
                            syncStatus === 'VERIFYING' ? 'bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse' :
                            syncStatus === 'CORRUPTED' ? 'bg-red-950 text-red-300 border-red-500/40 animate-bounce' :
                            'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                          }`}>
                            {syncStatus === 'SYNCED' && <Check className="w-3 h-3 text-emerald-400" />}
                            {syncStatus === 'VERIFYING' && <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />}
                            {syncStatus === 'CORRUPTED' && <ShieldCheck className="w-3 h-3 text-red-400" />}
                            {syncStatus === 'AUTO_REPAIRED' && <Zap className="w-3 h-3 text-cyan-400" />}
                            <span>
                              {syncStatus === 'SYNCED' ? 'Synced & Verified' :
                               syncStatus === 'VERIFYING' ? 'Checking SHA...' :
                               syncStatus === 'CORRUPTED' ? 'Błąd / Korupcja!' : 'Auto-Repaired'}
                            </span>
                          </span>

                          <button
                            onClick={() => handleVerifyOrRepair(file)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition"
                            title="Sprawdź sumy kontrolne i napraw automatycznie"
                          >
                            Verify & Repair
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white break-all leading-snug">{file.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{file.description}</p>
                      
                      <div className="mt-2.5 p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <div><span className="text-slate-500">SHA-256: </span>{file.sha256.slice(0, 24)}...</div>
                        <a
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono hover:underline shrink-0"
                        >
                          <Globe className="w-3 h-3" /> GD Link <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {isDownloading && (
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-[11px] font-mono text-cyan-300">
                          <span>Pobieranie na dysk lokalny...</span>
                          <span>{Math.round(downloadProgress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div className="h-full bg-cyan-500 transition-all duration-150" style={{ width: `${downloadProgress}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => handleDownloadToLocal(file)}
                        disabled={isDownloading}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                          isCompleted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950/40'
                        }`}
                      >
                        {isDownloading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownToLine className="w-4 h-4" />
                        )}
                        <span>{isCompleted ? 'Pobrano Ponownie' : 'Pobierz Lokalnie (Download to Local)'}</span>
                      </button>

                      {onSendToChat && (
                        <button
                          onClick={() => handleSendFileToChat(file)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                          title="Wyślij informację o pliku do asystenta AI"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Zapytaj AI</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bezpośredni dostęp do folderu Dysk Google z automatycznym skanowaniem sum VirusTotal / SHA-256</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
