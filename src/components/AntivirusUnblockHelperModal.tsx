import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ExternalLink,
  X,
  Lock,
  Unlock,
  CheckCircle2
} from 'lucide-react';

interface AntivirusUnblockHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const AntivirusUnblockHelperModal: React.FC<AntivirusUnblockHelperModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const commandUnblock = `Unblock-File -Path "$HOME\\Downloads\\TermoFix_AI_Workstation.exe"`;
  const commandDefenderExclusion = `Add-MpPreference -ExclusionPath "C:\\TermoFixAI"`;
  const commandSmartScreenBypass = `Set-ExecutionPolicy Bypass -Scope Process -Force`;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/20 border border-amber-500/30 p-2.5 rounded-xl text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Antivirus & Windows Defender - Pomocnik Odblokowania Pliku</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono border border-amber-500/30">SmartScreen / Fals Alarm</span>
              </h2>
              <p className="text-xs text-slate-400">
                Instrukcja i skrypty PowerShell do bezproblemowego uruchomienia programu Serwisu Rafał Jarosz.
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto bg-slate-950 flex-1">
          
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1 text-amber-100">Dlaczego Windows Defender / SmartScreen blokuje plik .exe?</span>
              Niezależnie skompilowane pliki `.exe` (bez drogiego certyfikatu Commercial Code Signing za kilkaset dolarów rocznie) są często oznaczane przez system jako "Nieznany wydawca" (Windows SmartScreen) lub klasyfikowane heurystycznie jako potencjalny fałszywy alarm (False Positive). Poniżej znajdziesz szybkie sposoby na ich odblokowanie.
            </div>
          </div>

          {/* Method 1: SmartScreen Bypass */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">1</span>
              <span>Metoda A: Ominięcie ostrzeżenia SmartScreen w Windows Explorer</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-2">
              <li>Kliknij dwukrotnie pobrany plik <code>TermoFix_AI_Workstation.exe</code>.</li>
              <li>Gdy pojawi się niebieskie okno <span className="text-white font-bold">"System Windows ochronił komputer"</span>, kliknij mały napis <span className="text-cyan-400 font-bold underline">Więcej informacji</span>.</li>
              <li>W prawym dolnym rogu pojawi się ukryty wcześniej przycisk <span className="text-emerald-400 font-bold">Uruchom mimo to</span>. Kliknij go. Aplikacja uruchomi się natychmiast.</li>
            </ol>
          </div>

          {/* Method 2: PowerShell Unblock-File */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">2</span>
              <span>Metoda B: Odblokowanie pobranego pliku przez PowerShell (Administrator)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Otwórz PowerShell jako Administrator i wklej poniższe polecenie, aby usunąć flagę blokady strefy internetowej:
            </p>
            <div className="relative bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between">
              <span>{commandUnblock}</span>
              <button
                onClick={() => handleCopy(commandUnblock, 1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-700"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Skopiowano' : 'Kopiuj'}</span>
              </button>
            </div>
          </div>

          {/* Method 3: Windows Defender Exclusion */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">3</span>
              <span>Metoda C: Dodanie wyjątku do Windows Defender (Wykluczenie folderu)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Jeżeli Twój antywirus nadal blokuje plik, dodaj folder roboczy serwisu do wykluczeń w PowerShell (uruchom jako Administrator):
            </p>
            <div className="relative bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between">
              <span>{commandDefenderExclusion}</span>
              <button
                onClick={() => handleCopy(commandDefenderExclusion, 2)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition border border-slate-700"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? 'Skopiowano' : 'Kopiuj'}</span>
              </button>
            </div>
          </div>

          {/* Recommendation: Use .CMD / .BAT script */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block text-emerald-100">Alternatywa 100% Bez Blokad: Skrypt Instalacyjny .CMD</span>
                <span>Skrypty wsadowe `.cmd` / `.bat` nigdy nie wywołują fałszywych alarmów SmartScreen i uruchamiają stację błyskawicznie.</span>
              </div>
            </div>
            <a
              href="/api/download-windows-installer"
              download="Instalator_TermoFix_AI_Windows.cmd"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz .CMD</span>
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 border-t border-slate-700 px-6 py-3 flex justify-between items-center">
          <span className="text-xs text-slate-400">Serwis Rafał Jarosz • Bezpieczeństwo i Diagnostyka Windows</span>
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
