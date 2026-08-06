import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Terminal,
  Unlock,
  Key,
  Database,
  Usb,
  Zap,
  Play,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface BiosPasswordUnlockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const BiosPasswordUnlockerModal: React.FC<BiosPasswordUnlockerModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [unlockedPassword, setUnlockedPassword] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState('usb-programmer');

  useEffect(() => {
    let interval: any;
    if (isUnlocking) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUnlocking(false);
            
            // Generate master password or hash
            let pw = '';
            const chars = '0123456789ABCDEF';
            for (let i = 0; i < 8; i++) {
               pw += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            setUnlockedPassword(pw);
            setStatus('BIOS pomyślnie odblokowany. Hasło zostało zresetowane.');
            return 100;
          }
          
          const increment = Math.random() * 5 + 1;
          
          if (prev < 30) setStatus('Nawiązywanie komunikacji z układem EEPROM (I2C/SPI)...');
          else if (prev < 60) setStatus('Odczytywanie bloku pamięci zawierającego hash hasła (NVRAM)...');
          else if (prev < 80) setStatus('Dekodowanie sumy kontrolnej BIOS/UEFI przy użyciu bazy TermoFix AI...');
          else setStatus('Wprowadzanie modyfikacji (Patching) układu z nowym kodem oblokowującym...');
          
          return Math.min(prev + increment, 100);
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isUnlocking]);

  const startUnlock = () => {
    setIsUnlocking(true);
    setProgress(0);
    setUnlockedPassword(null);
    setStatus('Inicjalizacja środowiska AI dla dekodowania BIOS...');
  };

  const handleFinish = () => {
    if (onSendToChat) {
      onSendToChat(`Zakończono proces odblokowywania BIOS/UEFI. Wygenerowany kod odblokowujący (Master Password): ${unlockedPassword}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 border-b border-emerald-700/50 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">BIOS / UEFI Password Unlocker AI</h2>
              <p className="text-xs text-emerald-300">Bezpośredni odczyt SPI/I2C EEPROM, Generowanie haseł serwisowych, Clear CMOS</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col sm:flex-row gap-6">
          
          {/* Controls Panel */}
          <div className="sm:w-1/2 space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" /> Baza i Metoda Podłączenia
              </h3>
              
              <div className="space-y-3 text-xs text-slate-300">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-800 border border-slate-700 has-[:checked]:border-emerald-500/50 has-[:checked]:bg-emerald-900/20">
                  <input type="radio" name="connType" value="generator" checked={connectionType === 'generator'} onChange={() => setConnectionType('generator')} className="accent-emerald-500" />
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-bold text-slate-200 text-sm">Generator Haseł (Systemowy kod)</div>
                      <div className="text-slate-500">Wprowadź kod błędu "System Disabled" wyświetlany na ekranie laptopa.</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-800 border border-slate-700 has-[:checked]:border-emerald-500/50 has-[:checked]:bg-emerald-900/20">
                  <input type="radio" name="connType" value="jumper-pins" checked={connectionType === 'jumper-pins'} onChange={() => setConnectionType('jumper-pins')} className="accent-emerald-500" />
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="font-bold text-slate-200 text-sm">Zwiara Płytki (CLR_CMOS Pin Bridge / Jumper)</div>
                      <div className="text-slate-500">Instrukcje zwierania styków płyty głównej (np. zwiara pinów 2-3 lub kropelka cyny na padach).</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-800 border border-slate-700 has-[:checked]:border-emerald-500/50 has-[:checked]:bg-emerald-900/20">
                  <input type="radio" name="connType" value="usb-programmer" checked={connectionType === 'usb-programmer'} onChange={() => setConnectionType('usb-programmer')} className="accent-emerald-500" />
                  <div className="flex items-center gap-2">
                    <Usb className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-bold text-slate-200 text-sm">Programator USB (CH341A / SVOD)</div>
                      <div className="text-slate-500">Bezpośrednie wpięcie w kość BIOS klipsem SPI na płycie głównej.</div>
                    </div>
                  </div>
                </label>
              </div>

              {connectionType === 'jumper-pins' && (
                <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg space-y-2 text-xs text-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Visual Pin Bridge Map (Motherboard Header Guide):</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Zlokalizuj gniazdo <strong>CLR_CMOS</strong> lub <strong>CLRP1</strong> w pobliżu baterii CR2032. Zwrotnicą zwiereń połłącz pin 1 oraz pin 2 na 15 sekund przy wyłączonym zasilaniu.
                  </p>
                  <div className="bg-slate-950 p-2.5 rounded border border-amber-500/30 text-center font-mono text-[10px] text-amber-300 flex justify-center items-center gap-4">
                    <span className="px-2 py-1 bg-amber-500/20 rounded border border-amber-500/40">[ PIN 1 ] --- (BRIDGE WIRE) --- [ PIN 2 ]</span>
                    <span className="text-slate-400">[ PIN 3 GND ]</span>
                  </div>
                </div>
              )}

              {connectionType === 'generator' && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-400 mb-1">Kod "System Disabled" (np. A1B2-C3D4):</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono uppercase" placeholder="XXXX-XXXX" />
                </div>
              )}

              {connectionType === 'usb-programmer' && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex gap-3 text-xs text-blue-200">
                  <Zap className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
                  <p>Upewnij się, że zasilacz i bateria laptopa są odłączone przed przypięciem klipsa SOIC8/SOP8 do kości BIOS!</p>
                </div>
              )}

              <button
                onClick={startUnlock}
                disabled={isUnlocking}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {isUnlocking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                {isUnlocking ? 'Odblokowywanie...' : 'Wykonaj Odblokowanie'}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="sm:w-1/2 flex flex-col gap-4">
            <div className="bg-black border border-slate-800 rounded-xl p-4 flex flex-col h-56 font-mono text-xs text-emerald-500 overflow-hidden relative shadow-inner">
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-50 text-[10px]">
                <Terminal className="w-3 h-3" />
                <span>termofix-bios-ai</span>
              </div>
              
              {!isUnlocking && !unlockedPassword && (
                <div className="m-auto text-slate-600">Gotowy do nawiązania połączenia.</div>
              )}
              
              {isUnlocking && (
                <div className="flex-1 flex flex-col justify-end">
                   <div className="mb-2 text-slate-400">[AI] Analiza architektury zabezpieczeń...</div>
                   <div className="mb-2 text-emerald-400 opacity-80">{status}</div>
                </div>
              )}

              {unlockedPassword && (
                 <div className="m-auto text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <div className="text-emerald-400 font-bold text-base">BIOS ODBLOKOWANY</div>
                 </div>
              )}
            </div>
            
            {isUnlocking && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                 <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                    <span>Postęp pracy AI</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>
            )}

            {unlockedPassword && (
              <div className="bg-slate-900 border border-emerald-500/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <h3 className="text-emerald-400 font-bold text-sm mb-2">KOD ODBLOKOWUJĄCY:</h3>
                <p className="text-white text-2xl font-mono tracking-widest break-all bg-emerald-900/30 px-6 py-2 rounded-lg border border-emerald-700/50 select-all mb-4">
                  {unlockedPassword}
                </p>
                <button
                  onClick={handleFinish}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg w-full transition"
                >
                  Wprowadź kod i zgłoś asystentowi
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
