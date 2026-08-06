import React, { useState, useEffect } from 'react';
import { HardDrive, Save, RefreshCw, Trash2, Check, Clock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage, ThermalData, LiveSessionBackupData } from '../types';

const STORAGE_KEY = 'Live-Session-Backup';
const AUTO_SAVE_INTERVAL_MS = 60000; // 60 seconds

interface SessionBackupNotifierProps {
  messages: ChatMessage[];
  thermalData: ThermalData;
  imageUrl: string;
  presetTitle?: string;
  onRestoreSession: (backup: LiveSessionBackupData) => void;
}

export const SessionBackupNotifier: React.FC<SessionBackupNotifierProps> = ({
  messages,
  thermalData,
  imageUrl,
  presetTitle,
  onRestoreSession,
}) => {
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [nextSaveSeconds, setNextSaveSeconds] = useState<number>(60);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [hasBackupInStorage, setHasBackupInStorage] = useState<boolean>(false);
  const [backupDetails, setBackupDetails] = useState<{ msgCount: number; maxTemp: number; time: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Check storage on mount
  useEffect(() => {
    checkExistingBackup();
  }, []);

  const checkExistingBackup = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: LiveSessionBackupData = JSON.parse(saved);
        setHasBackupInStorage(true);
        setLastSavedTime(parsed.readableTime || 'Nieznany');
        setBackupDetails({
          msgCount: parsed.messages?.length || 0,
          maxTemp: parsed.thermalData?.maxTemp || 0,
          time: parsed.readableTime || '',
        });
      } else {
        setHasBackupInStorage(false);
        setBackupDetails(null);
      }
    } catch (e) {
      console.error('Failed to parse Live-Session-Backup from localStorage', e);
    }
  };

  // Perform save operation to localStorage
  const performSave = (isManual = false) => {
    const now = new Date();
    const readableTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const backupPayload: LiveSessionBackupData = {
      timestamp: now.toISOString(),
      readableTime,
      messages,
      thermalData,
      imageUrl,
      presetTitle,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(backupPayload));
    } catch (err) {
      console.warn('LocalStorage quota exceeded on full session backup, attempting lightweight save', err);
      // Strip base64 data URLs if quota exceeded
      const lightweightMessages = messages.map((m) => ({
        ...m,
        imageUrl: m.imageUrl?.startsWith('data:') ? '[OBRAZ_SERWISOWY_DO_PRZYWRÓCENIA]' : m.imageUrl,
      }));
      const lightweightPayload: LiveSessionBackupData = {
        ...backupPayload,
        messages: lightweightMessages,
        imageUrl: imageUrl.startsWith('data:') ? '[OBRAZ_SERWISOWY_DO_PRZYWRÓCENIA]' : imageUrl,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightPayload));
      } catch (innerErr) {
        console.error('Failed to save even lightweight session backup', innerErr);
      }
    }

    setLastSavedTime(readableTime);
    setHasBackupInStorage(true);
    setNextSaveSeconds(60);
    setBackupDetails({
      msgCount: messages.length,
      maxTemp: thermalData.maxTemp,
      time: readableTime,
    });

    // Show temporary notification toast
    setToastMessage(isManual ? 'Kopia zapasowa zapisana ręcznie!' : `Autozapis sesji wykonany o ${readableTime}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // 60-Second Auto Save Interval & Countdown Timer
  useEffect(() => {
    // Timer interval tick every 1s to update countdown
    const countdownInterval = setInterval(() => {
      setNextSaveSeconds((prev) => {
        if (prev <= 1) {
          performSave(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [messages, thermalData, imageUrl, presetTitle]);

  // Handle Restore
  const handleRestore = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: LiveSessionBackupData = JSON.parse(saved);
        onRestoreSession(parsed);
        setToastMessage(`Przywrócono sesję diagnostyczną z godziny ${parsed.readableTime}!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (e) {
      console.error('Failed to restore session backup', e);
    }
  };

  // Handle Clear
  const handleClearBackup = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasBackupInStorage(false);
    setBackupDetails(null);
    setLastSavedTime(null);
    setToastMessage('Usunięto kopię zapasową Live-Session-Backup.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end space-y-2 pointer-events-none">
      
      {/* Toast Banner Notification */}
      {showToast && (
        <div className="pointer-events-auto bg-slate-900 border border-emerald-500/60 text-slate-100 text-xs px-3 py-2 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-emerald-500/20 p-1 rounded-full text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-emerald-300 font-mono">{toastMessage}</span>
        </div>
      )}

      {/* Main Backup Status Widget */}
      <div className="pointer-events-auto bg-slate-900/95 border border-slate-700/80 hover:border-amber-500/60 text-slate-200 rounded-2xl shadow-2xl backdrop-blur-md p-2.5 transition-all duration-200 max-w-xs">
        
        {/* Compact Header Row */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="relative">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-100 text-[11px] leading-none">Live-Session-Backup</span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                  60s
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                {lastSavedTime ? `Zapisano: ${lastSavedTime}` : 'Oczekuje na zapis...'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Manual Save Now Button */}
            <button
              onClick={() => performSave(true)}
              className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-lg border border-slate-700 transition"
              title="Wymuś Zapis Nowej Kopii Zapastowej"
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            {/* Restore Session Button */}
            {hasBackupInStorage && (
              <button
                onClick={handleRestore}
                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-lg border border-emerald-500/40 font-bold transition flex items-center space-x-1 text-[10px]"
                title="Przywróć dane ostatniej zapisanej sesji"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Toggle Expand Details */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-1.5 py-1 text-slate-400 hover:text-slate-200 text-[10px] font-mono"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div className="w-full bg-slate-950 h-1 rounded-full mt-2 overflow-hidden border border-slate-800">
          <div
            className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${((60 - nextSaveSeconds) / 60) * 100}%` }}
          ></div>
        </div>

        {/* Expanded Panel Details */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] space-y-2 animate-in fade-in duration-150">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Następny auto-zapis za:</span>
                <span className="text-amber-400 font-bold">{nextSaveSeconds}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wiadomości w czacie:</span>
                <span className="text-slate-200 font-bold">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Peak Temp PCB:</span>
                <span className="text-red-400 font-bold">{thermalData.maxTemp}°C</span>
              </div>
              {backupDetails && (
                <div className="flex justify-between border-t border-slate-900 pt-1 text-[10px] text-slate-400">
                  <span>Plik w localStorage:</span>
                  <span className="text-emerald-400 font-bold">Live-Session-Backup</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              {hasBackupInStorage ? (
                <button
                  onClick={handleRestore}
                  className="w-full mr-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center space-x-1 shadow transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Przywróć Zapisana Sesję</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 italic">Brak zapisanej kopii.</span>
              )}

              {hasBackupInStorage && (
                <button
                  onClick={handleClearBackup}
                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg border border-slate-700 transition"
                  title="Wyczyszcz kopię zapasową z pamięci przeglądarki"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
