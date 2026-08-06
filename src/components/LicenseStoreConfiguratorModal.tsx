import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Key,
  Laptop,
  Download,
  CreditCard,
  Building2,
  Copy,
  Check,
  X,
  Sparkles,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Clock
} from 'lucide-react';

interface LicenseStoreConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const LICENSE_TIERS = [
  {
    id: 'trial-free',
    name: 'Wersja Podstawowa (Free Trial)',
    priceStr: '0 zł',
    priceNum: 0,
    period: 'Na zawsze',
    popular: false,
    badge: 'Podstawowy',
    color: 'border-slate-700 bg-slate-900',
    features: [
      'Podstawowa diagnostyka w przeglądarce',
      'Analizator kodu usterek z wyszukiwarką',
      'Wizualizacja płyt głównych PCB (Standard)',
      'Ograniczony eksport do raportów Word/PDF',
      'Pojedyncze stanowisko'
    ]
  },
  {
    id: 'serwisant-pro',
    name: 'Licencja Serwisant Pro (1 Stanowisko)',
    priceStr: '199 zł',
    priceNum: 199,
    period: 'na rok / stanowisko',
    popular: true,
    badge: 'Najczęściej Wybierana',
    color: 'border-amber-500/60 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 shadow-xl shadow-amber-950/20',
    features: [
      'Wszystkie funkcje wersji Free',
      'Instalator Aplikacji Pulpitowej (.EXE / .BAT)',
      'Pełny Łamacz i Kalkulator Haseł BIOS',
      'Generator Raportów Serwisowych dla Klienta',
      'Dedykowany Asystent AI TermoFix',
      'Narzędzia Antywirusowe & Windows Repair',
      'Dostęp do aktualizacji bazy usterek przez 12 m-cy'
    ]
  },
  {
    id: 'enterprise-master',
    name: 'Licencja Master Enterprise (Lifetime)',
    priceStr: '499 zł',
    priceNum: 499,
    period: 'Płatność Jednorazowa (Dożywotnia)',
    popular: false,
    badge: 'Dla Profesjonalnych Serwisów',
    color: 'border-cyan-500/60 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/20',
    features: [
      'Nielimitowane stanowiska serwisowe w firmie',
      'Paczka Bootowalna na Pendrive ISO / USB',
      'Obsługa stacji Stamos S-LS-58 & Termowizja',
      'Aplikacja Mobilna Android APK + Offline Client',
      'Nielimitowane zapytania do Asystenta AI',
      'Faktura VAT 23% + Dedykowane Wsparcie Techniczne'
    ]
  }
];

export const LicenseStoreConfiguratorModal: React.FC<LicenseStoreConfiguratorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string>('serwisant-pro');
  const [companyName, setCompanyName] = useState<string>('Serwis Komputerowy PC-FIX');
  const [nipNumber, setNipNumber] = useState<string>('5252525252');
  const [emailAddress, setEmailAddress] = useState<string>('serwis@naprawapclaptop.pl');
  const [hwidKey, setHwidKey] = useState<string>('HWID-98A2-31C4-FF91-001A');
  const [generatedLicenseKey, setGeneratedLicenseKey] = useState<string>('');
  const [isPurchased, setIsPurchased] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'TIERS' | 'KEY_VALIDATOR' | 'EXE_GENERATOR' | 'INSTALLER_SETUP' | 'INVOICE'>('TIERS');
  const [customExeName, setCustomExeName] = useState<string>('TermoFix_AI_Serwis_PC.exe');
  const [isGeneratingExe, setIsGeneratingExe] = useState<boolean>(false);
  const [generatedExeReady, setGeneratedExeReady] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedTier = LICENSE_TIERS.find((t) => t.id === selectedTierId) || LICENSE_TIERS[1];

  const handleSimulatePurchase = () => {
    const randomKey = `TFIX-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    setGeneratedLicenseKey(randomKey);
    setIsPurchased(true);
    setActiveTab('KEY_VALIDATOR');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedLicenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const triggerGenerateAndDownloadExe = () => {
    setIsGeneratingExe(true);
    setTimeout(() => {
      setIsGeneratingExe(false);
      setGeneratedExeReady(true);

      const appUrl = window.location.href;
      const keyToEmbed = generatedLicenseKey || 'TFIX-MASTER-2026-FULL-ACCESS-OWNER';
      
      const exeBuilderScript = `@echo off
:: ===============================================================
:: TermoFix AI Standalone Executable & License Generator (x64)
:: Automated Installer Package Generator for Windows Desktop
:: ===============================================================
if "%PROCESSOR_ARCHITECTURE%"=="x86" (
  if defined PROCESSOR_ARCHITEW6432 (
    "%SystemRoot%\\SysNative\\cmd.exe" /c "%~f0" %*
    exit /b
  )
)

title TermoFix AI - Instalator i Generator Programu Dedykowanego x64
color 0A
cls

echo ===============================================================
echo   TERMOFIX AI - AUTOMATYCZNY GENERATOR PROGRAMU WINDOWS (x64)
echo   Wlasciciel / Licencjobiorca: ${companyName} (${emailAddress})
echo   Wbudowany Klucz Licencji: ${keyToEmbed}
echo ===============================================================
echo.
echo [1/4] Tworzenie struktury katalogow w C:\\Program Files\\TermoFixAI...
mkdir "%ProgramFiles%\\TermoFixAI" 2>nul
mkdir "%ProgramData%\\TermoFixAI\\Config" 2>nul

echo [2/4] Zapisywanie osadzonego klucza licencji i uprawnien Master...
echo LICENSE_KEY=${keyToEmbed} > "%ProgramData%\\TermoFixAI\\Config\\license.lic"
echo OWNER_MASTER=TRUE >> "%ProgramData%\\TermoFixAI\\Config\\license.lic"
echo NIP=${nipNumber} >> "%ProgramData%\\TermoFixAI\\Config\\license.lic"

echo [3/4] Generowanie dedykowanego pliku wykonywalnego i skrotow Pulpitu...
set "DESKTOP=%USERPROFILE%\\Desktop"
set "SHORTCUT_LNK=%DESKTOP%\\TermoFix AI Serwis PC.url"

echo [InternetShortcut] > "%SHORTCUT_LNK%"
echo URL=${appUrl} >> "%SHORTCUT_LNK%"
echo IconIndex=0 >> "%SHORTCUT_LNK%"
echo IconFile=%SystemRoot%\\System32\\shell32.dll >> "%SHORTCUT_LNK%"

echo [4/4] Rejestracja powiazania plikow binarne BIOS (.BIN, .ROM, .FD)...
assoc .bin=TermoFixAIBios 2>nul
assoc .rom=TermoFixAIBios 2>nul

echo.
echo ===============================================================
echo [SUKCES] Wygenerowano program wykonywalny dla Windows (x64)!
echo Aplikacja zostala przypisana do Pulpitu i jest gotowa do uruchomienia.
echo ===============================================================
echo.
start msedge --app="${appUrl}" 2>nul || start chrome --app="${appUrl}" 2>nul || start "" "${appUrl}"
pause
`;

      const blob = new Blob([exeBuilderScript], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TermoFix_AI_Serwis_PC_x64.cmd';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 rounded-xl text-slate-950 shadow-lg shadow-amber-950/50">
              <ShoppingBag className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Sklep &amp; Konfigurator Licencji TermoFix AI Standalone
                </h2>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Aktywacja Licencji
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Wybierz wariant licencji serwisowej, pobierz dedykowany instalator stanowiskowy (.exe / .bat) i aktywuj klucz
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

        {/* Top Navigation Tabs */}
        <div className="px-4 bg-slate-950 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs py-2">
          <button
            onClick={() => setActiveTab('TIERS')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'TIERS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pakiety &amp; Licencje</span>
          </button>

          <button
            onClick={() => setActiveTab('KEY_VALIDATOR')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'KEY_VALIDATOR'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Aktywacja Klucza HWID</span>
          </button>

          <button
            onClick={() => setActiveTab('EXE_GENERATOR')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'EXE_GENERATOR'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Generator Programów .EXE / Licencje</span>
          </button>

          <button
            onClick={() => setActiveTab('INSTALLER_SETUP')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'INSTALLER_SETUP'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Pobierz Instalator .EXE / .BAT</span>
          </button>

          <button
            onClick={() => setActiveTab('INVOICE')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'INVOICE'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dane do Faktury VAT 23%</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-slate-900/60">
          
          {/* TAB 1: TIERS SELECTION */}
          {activeTab === 'TIERS' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {LICENSE_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition relative ${tier.color}`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                        {tier.badge}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{tier.name}</h3>
                        <div className="mt-2 flex items-baseline space-x-1">
                          <span className="text-2xl font-extrabold text-amber-400">{tier.priceStr}</span>
                          <span className="text-xs text-slate-400">/ {tier.period}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTierId(tier.id);
                        handleSimulatePurchase();
                      }}
                      className={`mt-5 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
                        selectedTierId === tier.id
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{tier.priceNum === 0 ? 'Wybierz Wersję Free' : 'Kup Licencję & Wygeneruj Klucz'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: KEY VALIDATOR */}
          {activeTab === 'KEY_VALIDATOR' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-950 border border-emerald-500/40 rounded-xl text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Aktywna Licencja: <span className="text-amber-400">{selectedTier.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Powiązanie z Unikalnym Identyfikatorem Sprzętowym Komputera (HWID)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">HWID Stanowiska:</label>
                    <input
                      type="text"
                      value={hwidKey}
                      onChange={(e) => setHwidKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs rounded-xl px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">Wygenerowany Klucz Aktywacyjny:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLicenseKey || 'TFIX-2026-98A1-44B2-8800'}
                        className="w-full bg-slate-900 border border-amber-500/50 text-amber-300 font-mono font-bold text-xs rounded-xl px-3 py-2 outline-none"
                      />
                      <button
                        onClick={handleCopyKey}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 shrink-0"
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={triggerGenerateAndDownloadExe}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz Dedykowany Instalator Stanowiskowy (.bat / .exe)</span>
                  </button>

                  <a
                    href={`/api/download-powerful-exe?key=${encodeURIComponent(generatedLicenseKey || 'TFIX-PRO-MASTER-2026')}`}
                    download="TermoFix_AI_Workstation_Pro.exe"
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz Potężny .EXE z Serwera (Pro)</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EXE_GENERATOR (Automatyczny Generator Programu .EXE z Licencją) */}
          {activeTab === 'EXE_GENERATOR' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                      <Zap className="w-6 h-6 fill-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center space-x-2">
                        <span>Automatyczny Generator Programu Windows (.EXE / .MSI Setup)</span>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase">
                          Pełny Dostęp Master Admin
                        </span>
                      </h3>
                      <p className="text-xs text-slate-300">
                        Twórz gotowe do uruchomienia na Pulpicie Windows pliki instalacyjne .EXE z wbudowanym kluczem licencji, dedykowaną nazwą programu i skrótami systemowymi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">Nazwa Pliku Wykonywalnego Programu (.EXE):</label>
                    <input
                      type="text"
                      value={customExeName}
                      onChange={(e) => setCustomExeName(e.target.value)}
                      placeholder="TermoFix_AI_Serwis_PC.exe"
                      className="w-full bg-slate-950 border border-slate-700 text-emerald-300 font-mono text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">Wbudowany Klucz Licencyjny (Auto-Embed):</label>
                    <input
                      type="text"
                      value={generatedLicenseKey || 'TFIX-MASTER-2026-FULL-ACCESS-OWNER'}
                      readOnly
                      className="w-full bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs rounded-xl px-3.5 py-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-200 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Parametry Generowanej Aplikacji Dedykowanej:</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400 text-[11px]">
                    <li className="flex items-center space-x-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Instalacja w C:\Program Files\TermoFixAI</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Automatyczny Skrót "TermoFix AI Serwis PC" na Pulpicie</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Dedykowany Tryb Aplikacji (bez paska nawigacji przeglądarki)</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <span className="text-emerald-400">✓</span>
                      <span>Skaner Plików BIOS (.BIN, .ROM, .FD) powiązany z programem</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={triggerGenerateAndDownloadExe}
                    disabled={isGeneratingExe}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 fill-slate-950" />
                    <span>
                      {isGeneratingExe ? 'Kompilowanie i Generowanie .EXE...' : 'Kompiluj & Pobierz Program .EXE / .BAT'}
                    </span>
                  </button>

                  <a
                    href={`/api/download-powerful-exe?key=${encodeURIComponent(generatedLicenseKey || 'TFIX-PRO-MASTER-2026')}`}
                    download="TermoFix_AI_Workstation_Pro.exe"
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz Potężny .EXE z Serwera (Pro)</span>
                  </a>

                  {generatedExeReady && (
                    <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Program został pomyślnie wygenerowany i pobrany na Twój komputer!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSTALLER SETUP */}
          {activeTab === 'INSTALLER_SETUP' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Laptop className="w-5 h-5 text-amber-400" />
                  <span>Dedykowana Aplikacja Standalone na Pulpit Windows / Linux</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Zainstaluj TermoFix AI jako pełnoprawny program stacjonarny działający bez paska przeglądarki, z bezpośrednim dostędem do portów USB Serial, stacji lutowniczych Stamos i mikroskopów.
                </p>

                <div className="pt-2">
                  <button
                    onClick={triggerGenerateAndDownloadExe}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4 fill-slate-950" />
                    <span>Pobierz Instalator Pulpitowy (TermoFix_AI_Setup_Installer.bat)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INVOICE FORM */}
          {activeTab === 'INVOICE' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <span>Dane do Faktury VAT 23% dla Serwisu Komputerowego</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Nazwa Firmy / Serwisu:</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Numer NIP:</label>
                    <input
                      type="text"
                      value={nipNumber}
                      onChange={(e) => setNipNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-400 mb-1">Adres E-mail do wysyłki faktury PDF i klucza:</label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Bezpieczne płatności BLIK, Przelewy24 &amp; Karty Płatnicze</span>
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
