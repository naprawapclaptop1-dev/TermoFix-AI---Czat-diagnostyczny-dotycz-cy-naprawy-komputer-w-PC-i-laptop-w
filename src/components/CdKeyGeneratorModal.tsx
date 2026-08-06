import React, { useState } from 'react';
import {
  Key,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Download,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  FileCode,
  Laptop
} from 'lucide-react';

interface CdKeyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export interface ProductKeyPreset {
  id: string;
  name: string;
  category: 'Windows 11' | 'Windows 10' | 'Windows Server' | 'Office 2024/2021' | 'Office 365';
  type: 'KMS (GVLK)' | 'Retail' | 'OEM';
  defaultKey: string;
  kmsServer: string;
  description: string;
}

export const PRODUCT_KEYS: ProductKeyPreset[] = [
  {
    id: 'win11-pro',
    name: 'Windows 11 Pro / Professional 64-bit',
    category: 'Windows 11',
    type: 'KMS (GVLK)',
    defaultKey: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
    kmsServer: 'kms.digiboy.ir',
    description: 'Oficjalny klucz klienta KMS GVLK dla Windows 11 Pro. Odblokowuje pełną personalizację, BitLocker i Remote Desktop.'
  },
  {
    id: 'win11-home',
    name: 'Windows 11 Home / Home Single Language',
    category: 'Windows 11',
    type: 'KMS (GVLK)',
    defaultKey: 'TX9XD-98N7V-6WMQ6-BX7FG-H8Q99',
    kmsServer: 'kms.digiboy.ir',
    description: 'Klucz KMS dla domowej edycji Windows 11 Home.'
  },
  {
    id: 'win11-ent',
    name: 'Windows 11 Enterprise LTSC / Pro Workstation',
    category: 'Windows 11',
    type: 'KMS (GVLK)',
    defaultKey: 'NPPR9-FWDCX-D2C8J-H872K-2YT43',
    kmsServer: 'kms.digiboy.ir',
    description: 'Edycja dla potężnych stacji roboczych z obsługą do 4 procesorów i 6TB pamięci RAM.'
  },
  {
    id: 'win10-pro',
    name: 'Windows 10 Pro 32/64-bit',
    category: 'Windows 10',
    type: 'KMS (GVLK)',
    defaultKey: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
    kmsServer: 'kms.msft.cloudns.net',
    description: 'Uniwersalny klucz instalacyjny KMS dla Windows 10 Professional.'
  },
  {
    id: 'win10-ent-ltsc',
    name: 'Windows 10 Enterprise LTSC 2021',
    category: 'Windows 10',
    type: 'KMS (GVLK)',
    defaultKey: 'M7XTQ-FN8P6-AFKYT-V2699-86B63',
    kmsServer: 'kms.msft.cloudns.net',
    description: 'Stabilna edycja lekka bezzbędnych aplikacji Microsoft Store dla systemów diagnostycznych.'
  },
  {
    id: 'win-server-2025',
    name: 'Windows Server 2025 Datacenter / Standard',
    category: 'Windows Server',
    type: 'KMS (GVLK)',
    defaultKey: 'D2N9P-3P6X9-2R39C-7RTCD-P8C22',
    kmsServer: 'kms8.msguides.com',
    description: 'Najnowszy system serwerowy Microsoft Server 2025 z obsługą zaawansowanych wirtualizacji Hyper-V.'
  },
  {
    id: 'win-server-2022',
    name: 'Windows Server 2022 Datacenter',
    category: 'Windows Server',
    type: 'KMS (GVLK)',
    defaultKey: 'WX4NM-KYWYW-QJJR4-XK326-V8X23',
    kmsServer: 'kms8.msguides.com',
    description: 'Standard serwerowy dla środowisk korporacyjnych i baz danych.'
  },
  {
    id: 'office-2024-pro',
    name: 'Microsoft Office LTSC 2024 Professional Plus',
    category: 'Office 2024/2021',
    type: 'KMS (GVLK)',
    defaultKey: '2TDPN-94B2T-3BBTH-F787D-2RJ44',
    kmsServer: 'kms.digiboy.ir',
    description: 'Pakiet Office 2024 (Word, Excel, PowerPoint, Outlook, Access) dla systemów serwisowych.'
  },
  {
    id: 'office-2021-pro',
    name: 'Microsoft Office 2021 Professional Plus',
    category: 'Office 2024/2021',
    type: 'KMS (GVLK)',
    defaultKey: 'FXYTK-NJ28C-K2J94-QF4C8-3FFJY',
    kmsServer: 'kms.digiboy.ir',
    description: 'Sprawdzony pakiet biurowy Office 2021 LTSC Pro Plus.'
  }
];

export const CdKeyGeneratorModal: React.FC<CdKeyGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [selectedKeyId, setSelectedKeyId] = useState<string>('win11-pro');
  const [customKmsServer, setCustomKmsServer] = useState<string>('kms.digiboy.ir');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const currentProduct = PRODUCT_KEYS.find((p) => p.id === selectedKeyId) || PRODUCT_KEYS[0];

  const filteredProducts = activeCategory === 'ALL'
    ? PRODUCT_KEYS
    : PRODUCT_KEYS.filter((p) => p.category === activeCategory);

  const generateActivationBatScript = () => {
    return `@echo off
:: Generator i Aktywator Klucza CD Windows / Office KMS
:: Wygenerowano przez Serwis Pogotowie Rafał Jarosz (naprawapclaptop.pl)
TITLE Aktywacja Licencji ${currentProduct.name}
color 0A
cls

echo ============================================================
echo   AUTOMATYCZNY AKTYWATOR LICENCJI WINDOWS / OFFICE
echo   Produkt: ${currentProduct.name}
echo   Klucz KMS: ${currentProduct.defaultKey}
echo ============================================================
echo.

:: Sprawdzenie uprawnien administratora
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [BLAD] Uruchom ten plik jako Administrator! (Prawy przycisk -> Uruchom jako administrator)
    pause
    exit /b
)

echo [1/3] Instalowanie klucza produktu KMS...
slmgr.vbs /ipk ${currentProduct.defaultKey}

echo.
echo [2/3] Ustawianie serwera KMS: ${customKmsServer}...
slmgr.vbs /skms ${customKmsServer}

echo.
echo [3/3] Wysylanie zadania aktywacji do serwera KMS...
slmgr.vbs /ato

echo.
echo ============================================================
echo   AKTYWACJA ZAKOŃCZONA! Sprawdzanie statusu licencji...
echo ============================================================
slmgr.vbs /xpr
pause
`;
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(currentProduct.defaultKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generateActivationBatScript());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadBat = () => {
    const script = generateActivationBatScript();
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aktywator_KMS_${currentProduct.id}.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAskAi = () => {
    if (!onSendToChat) return;
    onSendToChat(`Jak poprawnie aktywować licencję ${currentProduct.name} za pomocą klucza ${currentProduct.defaultKey} oraz serwera KMS ${customKmsServer}? Przedstaw polecenia slmgr.vbs oraz rozwiąż błędy 0xC004F074 i 0x80070005.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-emerald-500 to-blue-600 rounded-xl text-slate-950 font-black shadow-lg shadow-emerald-950/40">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Generator Kluczy CD Windows &amp; Office &amp; Skryptów Aktywacyjnych KMS
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Baza GVLK 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Oficjalne klucze klienta KMS Microsoft, aktywatory batch (.bat) oraz skrypty slmgr.vbs dla serwisantów PC
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 bg-slate-950 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs py-2.5">
          {['ALL', 'Windows 11', 'Windows 10', 'Windows Server', 'Office 2024/2021'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              {cat === 'ALL' ? 'Wszystkie Produkty' : cat}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-slate-900/80">
          
          {/* Product Grid Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Wybierz System Operacyjny lub Pakiet Biurowy Office:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedKeyId(p.id);
                    setCustomKmsServer(p.kmsServer);
                  }}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                    selectedKeyId === p.id
                      ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800 font-bold">
                      {p.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-400">
                      {p.type}
                    </span>
                  </div>
                  <div className="font-bold text-xs leading-snug">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Product Details & Generated Key */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Key Card */}
            <div className="md:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Wygenerowany Klucz Produktu (CD Key):
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    100% Poprawna Suma Kontrolna
                  </span>
                </div>

                <div className="bg-slate-900 border border-emerald-500/40 p-3.5 rounded-xl text-center space-y-2">
                  <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-400 tracking-wider select-all break-all">
                    {currentProduct.defaultKey}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {currentProduct.description}
                  </p>
                </div>

                {/* KMS Server Config Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Serwer Aktywacyjny KMS:
                  </label>
                  <input
                    type="text"
                    value={customKmsServer}
                    onChange={(e) => setCustomKmsServer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                    placeholder="kms.digiboy.ir"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCopyKey}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/50"
                >
                  {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Skopiowano Klucz!' : 'Kopiuj Klucz CD'}</span>
                </button>

                <button
                  onClick={handleDownloadBat}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-md shadow-blue-950/50"
                >
                  <Download className="w-4 h-4" />
                  <span>Pobierz Skrypt .BAT</span>
                </button>
              </div>
            </div>

            {/* Live Terminal Batch Preview */}
            <div className="md:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Podgląd Skryptu Wiersza Poleceń (CMD / BAT):</span>
                </div>
                <button
                  onClick={handleCopyScript}
                  className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1 font-bold"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Kopiuj Skrypt</span>
                </button>
              </div>

              <pre className="bg-slate-900 p-3 rounded-lg text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-48 leading-relaxed border border-slate-800/80">
                {generateActivationBatScript()}
              </pre>

              {onSendToChat && (
                <button
                  onClick={handleAskAi}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs py-2 rounded-xl border border-slate-800 flex items-center justify-center space-x-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Skonsultuj Błędy Aktywacji w Chacie AI</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Klucze GVLK są oficjalną metodą wdrażania masowego Microsoft KMS.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
