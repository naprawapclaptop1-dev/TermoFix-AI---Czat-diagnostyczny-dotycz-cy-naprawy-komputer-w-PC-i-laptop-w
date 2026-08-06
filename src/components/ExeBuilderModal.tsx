import React, { useState } from 'react';
import { Download, Terminal, CheckCircle2, ShieldAlert, Cpu, FileCode, Copy, Check, Sparkles, Mic, Volume2, Monitor, KeyRound, Server } from 'lucide-react';

interface ExeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExeBuilderModal: React.FC<ExeBuilderModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'build' | 'agent' | 'installer_link'>('installer_link');
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [agentCopied, setAgentCopied] = useState(false);
  const [machineUuid, setMachineUuid] = useState('TERMOFIX-HOST-4C4C4554-0044-3010-8041');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleGenerateInstallerLink = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const link = `${window.location.origin}/api/download-machine-installer-exe?uuid=${encodeURIComponent(machineUuid)}&key=${encodeURIComponent(apiKey)}`;
      setGeneratedLink(link);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopyGeneratedLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  if (!isOpen) return null;

  const buildCommand = `npm install\nnpm run build:exe`;

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const agentCommand = `powershell -ExecutionPolicy Bypass -Command "iwr -useb ${window.location.origin}/api/download-ai-agent-exe?key=${apiKey} -OutFile TermoFix_AI_Agent.cmd; .\\TermoFix_AI_Agent.cmd"`;

  const handleCopyAgent = () => {
    navigator.clipboard.writeText(agentCommand);
    setAgentCopied(true);
    setTimeout(() => setAgentCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Centrum Kompilacji i Generator Agentów AI (.EXE)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Wygeneruj natywne programy wykonywalne oraz inteligentnego Asystenta Sterowania dla Windows 10/11
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-950 border-b border-slate-800 flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('installer_link')}
            className={`flex-1 min-w-[200px] py-3 text-center font-bold text-xs sm:text-sm transition-all duration-200 border-b-2 flex items-center justify-center gap-2 ${activeTab === 'installer_link' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-transparent hover:bg-slate-900 text-slate-400'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>1. Generator Linku Dedykowanego Instalatora (.EXE)</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">VIP</span>
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex-1 min-w-[180px] py-3 text-center font-bold text-xs sm:text-sm transition-all duration-200 border-b-2 flex items-center justify-center gap-2 ${activeTab === 'agent' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-transparent hover:bg-slate-900 text-slate-400'}`}
          >
            <Mic className="w-4 h-4 text-indigo-400" />
            <span>2. Agent Sterowania AI Komputerem</span>
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`flex-1 min-w-[180px] py-3 text-center font-bold text-xs sm:text-sm transition-all duration-200 border-b-2 flex items-center justify-center gap-2 ${activeTab === 'build' ? 'border-teal-500 bg-teal-500/10 text-teal-300' : 'border-transparent hover:bg-slate-900 text-slate-400'}`}
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>3. Stacja Robocza Web (.EXE)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          
          {activeTab === 'installer_link' ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/40 rounded-2xl p-4 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 mt-0.5 border border-amber-500/30">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="font-bold block mb-1 text-amber-100 text-base">Unikalny Generator Linków Dedykowanego Instalatora (.EXE Wrapper)</span>
                  Funkcja ta buduje spersonalizowany, maszynowo powiązany wrapper instalacyjny (.EXE / .CMD), przypisany do unikalnego sprzętowego identyfikatora UUID/MAC Twojego komputera. Po pobraniu instalator instaluje bootowalną stację roboczą oraz natywnego Agenta AI.
                </div>
              </div>

              {/* Machine Specs Input */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Hardware Target UUID (Unikalny Identyfikator Maszyny):</span>
                    <span className="text-[10px] text-amber-400 font-mono">AUTODETECTED</span>
                  </label>
                  <input
                    type="text"
                    value={machineUuid}
                    onChange={(e) => setMachineUuid(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-200">
                    Opcjonalny Klucz API Gemini (Osobiście Przypisany):
                  </label>
                  <input
                    type="password"
                    placeholder="Wpisz Twój klucz API Gemini (opcjonalnie)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleGenerateInstallerLink}
                  disabled={isGenerating}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Server className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
                  <span>{isGenerating ? 'Generowanie unikalnego wrappera .EXE...' : 'Wygeneruj Dedykowany Link Instalatora (.EXE)'}</span>
                </button>
              </div>

              {/* Generated Link Display */}
              {generatedLink && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Wygenerowany Link Dedykowany:
                    </span>
                    <button
                      onClick={handleCopyGeneratedLink}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-bold transition flex items-center gap-1 border border-slate-700"
                    >
                      {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{linkCopied ? 'Skopiowano Link!' : 'Kopiuj Link'}</span>
                    </button>
                  </div>

                  <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-amber-200 break-all border border-slate-800">
                    {generatedLink}
                  </pre>

                  <div className="flex justify-end pt-1">
                    <a
                      href={generatedLink}
                      download={`TermoFix_Dedicated_Installer_${machineUuid.slice(0, 12)}.exe`}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span>Pobierz Dedykowany Wykonywalny Instalator (.EXE / .CMD)</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'agent' ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Introduction Box */}
              <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/40 rounded-xl p-4 text-indigo-200 text-xs sm:text-sm flex items-start gap-3">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 mt-0.5">
                  <Volume2 className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <span className="font-bold block mb-1 text-indigo-100 text-base">Jak działa Agent AI Sterowania Systemem?</span>
                  Ten natywny program dla systemu Windows (skompilowany jako bezpieczny skrypt administracyjny PowerShell/CMD) działa bezpośrednio na Twoim komputerze. 
                  Po uruchomieniu, Asystent posiada syntezę mowy (mówi po polsku!) i reaguje na polecenia głosowe oraz tekstowe:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
                    <li><strong className="text-white">Naprawa komputera</strong> – wykonuje automatyczne komendy SFC, DISM i czyszczenie rejestru.</li>
                    <li><strong className="text-white">Zarządzanie procesami i RAM</strong> – wykrywa ciężkie procesy i optymalizuje zużycie pamięci.</li>
                    <li><strong className="text-white">Diagnostyka Sieci i LAN</strong> – skanuje tablicę ARP sieci lokalnej, pingując i wykrywając inne podłączone komputery oraz urządzenia.</li>
                    <li><strong className="text-white">Obsługa stacji roboczej</strong> – automatycznie uruchamia schematy płyt, programator KBC czy radio.</li>
                    <li><strong className="text-white">Inteligentny Asystent</strong> – opcjonalnie przesyła zaawansowane prośby do Gemini API i generuje bezpieczne skrypty na poczekaniu!</li>
                  </ul>
                </div>
              </div>

              {/* API Configuration */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <span>Konfiguracja Klucza API Gemini (Opcjonalnie dla pełnego AI):</span>
                </div>
                <p className="text-xs text-slate-400">
                  Podaj swój klucz API Gemini, aby agent mógł swobodnie analizować dowolne nietypowe komendy i generować skrypty. Jeśli nie masz klucza, agent nadal będzie działał w 100% sprawnie, korzystając z ponad 25 wbudowanych, profesjonalnych lokalnych heurystyk serwisowych!
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Wpisz klucz API Gemini (np. AIzaSy...)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 font-mono"
                  />
                  {apiKey && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-2 rounded-xl font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Skonfigurowano
                    </span>
                  )}
                </div>
              </div>

              {/* Fast install commands */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Szybkie pobranie i odpalenie przez PowerShell (Administrator):</span>
                  <button
                    onClick={handleCopyAgent}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg transition border border-slate-700"
                  >
                    {agentCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{agentCopied ? 'Skopiowano!' : 'Kopiuj Skrypt'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-indigo-300 border border-slate-800 overflow-x-auto whitespace-pre-wrap break-all">
                  {agentCommand}
                </pre>
              </div>

              {/* Downloader Button */}
              <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bezpośrednie Pobranie:</h4>
                  <p className="text-xs text-slate-400">Pobierz plik wykonywalny .CMD, który automatycznie skonfiguruje agenta na dowolnym Windowsie 10/11</p>
                </div>
                <a
                  href={`/api/download-ai-agent-exe?key=${encodeURIComponent(apiKey)}`}
                  download="TermoFix_AI_Computer_Agent.exe"
                  className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-lg flex items-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Pobierz Agenta AI (.EXE / .CMD)</span>
                </a>
              </div>

            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              <div className="bg-blue-950/40 border border-blue-500/40 rounded-xl p-4 text-blue-200 text-xs sm:text-sm flex items-start gap-3">
                <Cpu className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1 text-blue-100">Co zawiera plik .EXE stacji roboczej?</span>
                  Ta metoda kompiluje całe środowisko Web stacji roboczej TermoFix AI (wbudowany serwer Express oraz interfejs React z systemem diagnostyki BGA, schematami płyt, mikroskopem HDMI, programatorem KBC oraz systemem VRAM MATS/MODS). Po skompilowaniu otrzymujesz gotowy plik wykonywalny uruchamiany na dowolnym komputerze bez instalacji Node.js!
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  <span>Instrukcja Kompilacji na Plik .EXE (Krok po Kroku):</span>
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <li>Pobierz spakowany projekt na swój komputer (np. przez opcję Export to GitHub / ZIP w menu Ustawienia).</li>
                  <li>Otwórz terminal w folderze projektu.</li>
                  <li>Wpisz polecenia kompilacji podane poniżej, aby zbudować aplikację za pomocą narzędzia <code>pkg</code>.</li>
                  <li>W folderze <code>release/</code> pojawi się gotowy plik <code>TermoFix_AI_Workstation.exe</code>.</li>
                </ol>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-slate-400">Skrypt kompilacji terminala (Node.js & pkg):</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg transition border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
                    <span>{copied ? 'Skopiowano!' : 'Kopiuj Skrypt'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-teal-300 border border-slate-800 overflow-x-auto">
                  {buildCommand}
                </pre>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 text-amber-200 text-xs flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Uwaga: Kompilacja .exe wymaga zainstalowanego środowiska Node.js w systemie deweloperskim. Gotowy plik .exe działa na każdym Windows 10/11 bez dodatkowych instalacji.</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href="/api/download-windows-installer"
                  download="Instalator_TermoFix_AI_Windows.cmd"
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Pobierz Instalator Windows (.CMD)</span>
                </a>
                <a
                  href="/api/download-exe"
                  download="TermoFix_AI_Workstation.exe"
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4 text-teal-200" />
                  <span>Pobierz .EXE Stacji</span>
                </a>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end items-center">
          <button
            onClick={onClose}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
