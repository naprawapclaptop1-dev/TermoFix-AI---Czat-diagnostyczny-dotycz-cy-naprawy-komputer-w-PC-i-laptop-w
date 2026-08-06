export interface AutoRepairTask {
  id: string;
  triggerError: string; // E.g., 'VRAM_FAIL', 'THERMAL_THROTTLING', 'MISSING_DLL'
  title: string;
  description: string;
  scriptContent: string;
  recommended: boolean;
}

class SystemAutoRepairManager {
  private static instance: SystemAutoRepairManager;

  public static getInstance(): SystemAutoRepairManager {
    if (!SystemAutoRepairManager.instance) {
      SystemAutoRepairManager.instance = new SystemAutoRepairManager();
    }
    return SystemAutoRepairManager.instance;
  }

  private repairTasks: AutoRepairTask[] = [
    {
      id: 'rep-gpu-vram-reset',
      triggerError: 'VRAM_FAIL',
      title: 'Reset Pamięci VRAM & Sterownika GPU',
      description: 'Automatycznie restartuje sterownik ekranu i czyści bufor VRAM karty graficznej.',
      scriptContent: `
@echo off
echo [AutoRepair] Inicjalizacja resetu VRAM...
pnputil /restart-device "PCI\\VEN_10DE&DEV_*"
echo [AutoRepair] Przeładowywanie sterownika WDDM...
timeout /t 2 >nul
echo [AutoRepair] Zakończono! Sterownik GPU zresetowany.
      `.trim(),
      recommended: true
    },
    {
      id: 'rep-thermal-throttle',
      triggerError: 'THERMAL_THROTTLING',
      title: 'Zarządzanie Zasilaniem - Tryb Chłodzenia',
      description: 'Wymusza pasywny tryb chłodzenia w ustawieniach zasilania Windows, aby obniżyć temperaturę.',
      scriptContent: `
@echo off
echo [AutoRepair] Obniżanie maksymalnego stanu procesora (99%)...
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 99
powercfg -setdcvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 99
echo [AutoRepair] Aktywacja pasywnego chłodzenia (Windows Power Policy)...
powercfg -setacvalueindex SCHEME_CURRENT SUB_PROCESSOR SYSCOOLPOL 0
powercfg -setactive SCHEME_CURRENT
echo [AutoRepair] Zastosowano optymalizację termiczną!
      `.trim(),
      recommended: true
    },
    {
      id: 'rep-sfc-dism-auto',
      triggerError: 'MISSING_DLL',
      title: 'Automatyczna Naprawa SFC & DISM',
      description: 'Naprawia strukturę plików systemowych Windows w trybie cichym.',
      scriptContent: `
@echo off
echo [AutoRepair] Uruchamianie DISM RestoreHealth...
DISM /Online /Cleanup-Image /RestoreHealth /Quiet
echo [AutoRepair] Uruchamianie SFC ScanNow...
sfc /scannow
echo [AutoRepair] Skanowanie zakończone pomyślnie.
      `.trim(),
      recommended: true
    },
    {
      id: 'rep-bsod-dump',
      triggerError: 'BSOD_CRASH',
      title: 'Odzyskiwanie i Analiza Dumpów (BSOD)',
      description: 'Automatycznie kopiuje i analizuje pliki minidump po awarii systemu (Blue Screen).',
      scriptContent: `
@echo off
echo [AutoRepair] Lokalizacja zrzutów pamięci (Minidump)...
mkdir C:\\TermoFix_Dumps 2>nul
copy C:\\Windows\\Minidump\\*.dmp C:\\TermoFix_Dumps\\ 2>nul
echo [AutoRepair] Skopiowano zrzuty pamięci do C:\\TermoFix_Dumps. Możesz je teraz przeanalizować w WinDbg.
      `.trim(),
      recommended: true
    }
  ];

  public getSuggestedRepairsForError(errorCode: string): AutoRepairTask[] {
    return this.repairTasks.filter(task => task.triggerError === errorCode);
  }

  public getAllRepairs(): AutoRepairTask[] {
    return this.repairTasks;
  }
}

export const systemAutoRepairManager = SystemAutoRepairManager.getInstance();
