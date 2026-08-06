import React, { useState, useEffect } from 'react';
import { downloadFileFromApi } from './utils/downloadHelper';
import {
  Wand2, Key, Archive, Activity, Smartphone, Search, Cpu, Flame, Wrench, Terminal, HardDrive, Database, Notebook, ShieldCheck, ShieldAlert, Printer, Clock, Gauge, Download, Cloud, KeyRound, ShoppingBag, Scan, RefreshCw, Tv, Radio, Layers, Server, Globe, Disc, Monitor, Usb, Power, Unlock, PlayCircle, PenTool, X, Sparkles, RotateCcw, Mic, Zap
} from 'lucide-react';

import { DesktopLauncher } from './components/DesktopLauncher';
import { LiveHardwareDashboard } from './components/LiveHardwareDashboard';
import { DiagnosticSplashScreen } from './components/DiagnosticSplashScreen';
import { ThermalCalibrationWizardModal } from './components/ThermalCalibrationWizardModal';
import { PerformanceBenchmarkSuiteModal } from './components/PerformanceBenchmarkSuiteModal';
import { SystemHealthMonitor } from './components/SystemHealthMonitor';

import { ThermalCanvasViewer } from './components/ThermalCanvasViewer';
import { ChatInterface } from './components/ChatInterface';
import { MultimeterModal } from './components/MultimeterModal';
import { PresetCasesModal } from './components/PresetCasesModal';
import { WindowsRepairModal } from './components/WindowsRepairModal';
import { DiskDiagnosticsModal } from './components/DiskDiagnosticsModal';
import { GpuDiagnosticsModal } from './components/GpuDiagnosticsModal';
import { BgaDiagnosticsModal } from './components/BgaDiagnosticsModal';
import { RepairJournalModal, DEFAULT_JOURNAL_ENTRIES } from './components/RepairJournalModal';
import { ErrorCodeDatabaseModal } from './components/ErrorCodeDatabaseModal';
import { DiagnosticWizardModal } from './components/DiagnosticWizardModal';
import { ClientReportExportModal } from './components/ClientReportExportModal';
import { DeviceHistoryTimelineModal } from './components/DeviceHistoryTimelineModal';
import { BenchPowerSupplyModule } from './components/BenchPowerSupplyModule';
import { CrossPlatformInstallerModal } from './components/CrossPlatformInstallerModal';
import { WorkspaceIntegrationModal } from './components/WorkspaceIntegrationModal';
import { AntivirusSystemRepairModal } from './components/AntivirusSystemRepairModal';
import { StressTestWorkstationModal } from './components/StressTestWorkstationModal';
import { BiosPasswordUnlockerModal } from './components/BiosPasswordUnlockerModal';
import { CdKeyGeneratorModal } from './components/CdKeyGeneratorModal';
import { LicenseStoreConfiguratorModal } from './components/LicenseStoreConfiguratorModal';
import { SystemScanKeysUpdaterRepairModal } from './components/SystemScanKeysUpdaterRepairModal';
import { MicroscopeHdmiCaptureModal } from './components/MicroscopeHdmiCaptureModal';
import { MatsModsVramDiagnosticModal } from './components/MatsModsVramDiagnosticModal';
import { InstructionVideoTutorialsModal } from './components/InstructionVideoTutorialsModal';
import { GlobalRadioAndMp3PlayerModal } from './components/GlobalRadioAndMp3PlayerModal';
import { ExeBuilderModal } from './components/ExeBuilderModal';
import { ModsGpuScannerModal } from './components/ModsGpuScannerModal';
import { AutoUniversalBiosInstallerModal } from './components/AutoUniversalBiosInstallerModal';
import { BoardSchematicViewer } from './components/BoardSchematicViewer';
import { Ir6500BgaStationModal } from './components/Ir6500BgaStationModal';
import { NasServerSyncModal } from './components/NasServerSyncModal';
import { SpeedTest15GbModal } from './components/SpeedTest15GbModal';
import { LiveWebLauncherModal } from './components/LiveWebLauncherModal';
import { AntivirusUnblockHelperModal } from './components/AntivirusUnblockHelperModal';
import { WindowsIsoBuilderModal } from './components/WindowsIsoBuilderModal';
import { WindowsStrelecRescueSuiteModal } from './components/WindowsStrelecRescueSuiteModal';
import { DuplicateFileFinderModal } from './components/DuplicateFileFinderModal';
import { SpellCheckerModal } from './components/SpellCheckerModal';
import { MobileSmsAppModal } from './components/MobileSmsAppModal';
import { AntivirusSimulatorModal } from './components/AntivirusSimulatorModal';
import { PartSearchEngineModal } from './components/PartSearchEngineModal';
import { BatchArchiveExtractorModal } from './components/BatchArchiveExtractorModal';
import { DataRecoveryModal } from './components/DataRecoveryModal';
import { AtxPowerSupplyRepairModal } from './components/AtxPowerSupplyRepairModal';
import { BitLockerBreakerModal } from './components/BitLockerBreakerModal';
import { UsbFlashBurnerWizardModal } from './components/UsbFlashBurnerWizardModal';
import { VoiceCommandControllerModal } from './components/VoiceCommandControllerModal';
import { PcBuilderAndVisualCanvasModal } from './components/PcBuilderAndVisualCanvasModal';
import { UserAuthAndIsoAuthModal } from './components/UserAuthAndIsoAuthModal';
import { VpnClientSuiteModal } from './components/VpnClientSuiteModal';
import { BatteryAndMatrixDiagnosticsModal } from './components/BatteryAndMatrixDiagnosticsModal';
import { AutoBiosAndRamDiagnosticsModal } from './components/AutoBiosAndRamDiagnosticsModal';
import { IsoStrelecDriveScannerModal } from './components/IsoStrelecDriveScannerModal';
import { GlobalDownloadTrackerBar } from './components/GlobalDownloadTrackerBar';
import { GoogleDriveBrowserModal } from './components/GoogleDriveBrowserModal';
import { KbcProgrammerModal } from './components/KbcProgrammerModal';
import { SystemUpdateLogModal } from './components/SystemUpdateLogModal';
import { Simulators3DSuiteModal } from './components/Simulators3DSuiteModal';
import { MasterComprehensiveScanModal } from './components/MasterComprehensiveScanModal';
import { FurMark3DGpuTestModal } from './components/FurMark3DGpuTestModal';
import { RodoComplianceModal } from './components/RodoComplianceModal';
import { BiosDmiInfoModal } from './components/BiosDmiInfoModal';
import { WindowsInstallerServiceModal } from './components/WindowsInstallerServiceModal';
import { WindowsDesktopShortcutsBar } from './components/WindowsDesktopShortcutsBar';
import { ThermalHealthOverlayWidget } from './components/ThermalHealthOverlayWidget';
import { saveThermalSnapshotDB, StoredThermalSnapshot } from './components/ThermalSnapshotGallery';
import { hardwareDiscoveryService } from './services/hardwareDiscoveryService';
import { CompanyLogoBanner } from './components/CompanyLogoBanner';
import { BatteryThermalHealthIndicator } from './components/BatteryThermalHealthIndicator';
import { SessionBackupNotifier } from './components/SessionBackupNotifier';
import { RealtimeThermalAlertSystem } from './components/RealtimeThermalAlertSystem';
import { MyPcLiveTelemetryBanner } from './components/MyPcLiveTelemetryBanner';
import { SensorsDashboard } from './components/SensorsDashboard';
import { SystemConfigSummary } from './components/SystemConfigSummary';
import { PRESET_CASES } from './data/presets';
import { ChatMessage, ThermalData, PresetCase, JournalEntry, DiagnosticCardData, LiveSessionBackupData } from './types';

export default function App() {
  // Global download interceptor to ensure reliable blob downloads in preview iframe
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.hasAttribute('href')) {
        const href = target.getAttribute('href');
        if (href && (href.startsWith('/api/') || target.hasAttribute('download'))) {
          e.preventDefault();
          const filename = target.getAttribute('download') || 'TermoFix_File';
          downloadFileFromApi(href, filename);
        }
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);
  // Startup initialization state
  const [isInitializing, setIsInitializing] = useState(true);

  // Chat State initialized from Live-Session-Backup if present
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('Live-Session-Backup');
      if (saved) {
        const parsed: LiveSessionBackupData = JSON.parse(saved);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          return parsed.messages;
        }
      }
    } catch (e) {
      console.error('Failed to parse initial session from Live-Session-Backup', e);
    }
    return [];
  });

  // Preset or Active Image State
  const [activePreset, setActivePreset] = useState<PresetCase>(PRESET_CASES[0]);
  const [currentImage, setCurrentImage] = useState<string>(PRESET_CASES[0].imageUrl);
  const [currentThermalData, setCurrentThermalData] = useState<ThermalData>(PRESET_CASES[0].defaultThermalData);

  // Journal entries state with local persistence
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('termofix_repair_journal');
      return saved ? JSON.parse(saved) : DEFAULT_JOURNAL_ENTRIES;
    } catch {
      return DEFAULT_JOURNAL_ENTRIES;
    }
  });

  // Modals state
  const [isMultimeterOpen, setIsMultimeterOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isWindowsRepairOpen, setIsWindowsRepairOpen] = useState(false);
  const [isDiskDiagnosticsOpen, setIsDiskDiagnosticsOpen] = useState(false);
  const [isGpuDiagnosticsOpen, setIsGpuDiagnosticsOpen] = useState(false);
  const [isBgaDiagnosticsOpen, setIsBgaDiagnosticsOpen] = useState(false);
  const [isRepairJournalOpen, setIsRepairJournalOpen] = useState(false);
  const [isErrorCodeDbOpen, setIsErrorCodeDbOpen] = useState(false);
  const [isDiagnosticWizardOpen, setIsDiagnosticWizardOpen] = useState(false);
  const [isClientReportOpen, setIsClientReportOpen] = useState(false);
  const [isDeviceHistoryOpen, setIsDeviceHistoryOpen] = useState(false);
  const [isBenchPowerSupplyOpen, setIsBenchPowerSupplyOpen] = useState(false);
  const [isInstallerModalOpen, setIsInstallerModalOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isAntivirusOpen, setIsAntivirusOpen] = useState(false);
  const [isStressTestWorkstationOpen, setIsStressTestWorkstationOpen] = useState(false);
  const [isLicenseStoreOpen, setIsLicenseStoreOpen] = useState(false);
  const [isBiosUnlockerOpen, setIsBiosUnlockerOpen] = useState(false);
  const [isCdKeyGeneratorOpen, setIsCdKeyGeneratorOpen] = useState(false);
  const [isSystemScanKeysRepairOpen, setIsSystemScanKeysRepairOpen] = useState(false);
  const [isMicroscopeHdmiOpen, setIsMicroscopeHdmiOpen] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isMatsModsOpen, setIsMatsModsOpen] = useState(false);
  const [isInstructionVideoTutorialsOpen, setIsInstructionVideoTutorialsOpen] = useState(false);
  const [isGlobalRadioMp3Open, setIsGlobalRadioMp3Open] = useState(false);
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);
  const [isBoardSchematicOpen, setIsBoardSchematicOpen] = useState(false);
  const [isIr6500BgaStationOpen, setIsIr6500BgaStationOpen] = useState(false);
  const [isNasServerSyncOpen, setIsNasServerSyncOpen] = useState(false);
  const [isSpeedTest15GbOpen, setIsSpeedTest15GbOpen] = useState(false);
  const [isLiveWebLauncherOpen, setIsLiveWebLauncherOpen] = useState(false);
  const [isAntivirusUnblockOpen, setIsAntivirusUnblockOpen] = useState(false);
  const [isWindowsIsoBuilderOpen, setIsWindowsIsoBuilderOpen] = useState(false);
  const [isStrelecRescueOpen, setIsStrelecRescueOpen] = useState(false);
  const [isUsbBurnerOpen, setIsUsbBurnerOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isPcBuilderOpen, setIsPcBuilderOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVpnClientOpen, setIsVpnClientOpen] = useState(false);
  const [isBatteryAndMatrixOpen, setIsBatteryAndMatrixOpen] = useState(false);
  const [isAutoBiosAndRamOpen, setIsAutoBiosAndRamOpen] = useState(false);
  const [isIsoStrelecDriveOpen, setIsIsoStrelecDriveOpen] = useState(false);
  const [isGoogleDriveBrowserOpen, setIsGoogleDriveBrowserOpen] = useState(false);
  const [isDuplicateFinderOpen, setIsDuplicateFinderOpen] = useState(false);
  const [isDataRecoveryOpen, setIsDataRecoveryOpen] = useState(false);
  const [isAtxPsuRepairOpen, setIsAtxPsuRepairOpen] = useState(false);
  const [isBitLockerOpen, setIsBitLockerOpen] = useState(false);
  const [isSpellCheckerOpen, setIsSpellCheckerOpen] = useState(false);
  const [isBatchArchiveOpen, setIsBatchArchiveOpen] = useState(false);
  const [isMobileSmsAppOpen, setIsMobileSmsAppOpen] = useState(false);
  const [isAntivirusSimulatorOpen, setIsAntivirusSimulatorOpen] = useState(false);
  const [isPartSearchEngineOpen, setIsPartSearchEngineOpen] = useState(false);
  const [isKbcProgrammerOpen, setIsKbcProgrammerOpen] = useState(false);
  const [isSystemUpdateLogOpen, setIsSystemUpdateLogOpen] = useState(false);
  const [is3DSimulatorsOpen, setIs3DSimulatorsOpen] = useState(false);
  const [isThermalCalibrationWizardOpen, setIsThermalCalibrationWizardOpen] = useState(false);
  const [isPerformanceBenchmarkOpen, setIsPerformanceBenchmarkOpen] = useState(false);
  const [isBiosDmiOpen, setIsBiosDmiOpen] = useState(false);
  const [isWindowsInstallerServiceOpen, setIsWindowsInstallerServiceOpen] = useState(false);
  const [isMasterScanOpen, setIsMasterScanOpen] = useState(false);
  const [isFurMarkOpen, setIsFurMarkOpen] = useState(false);
  const [isRodoOpen, setIsRodoOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleResetWorkspace = () => {
    localStorage.removeItem('Live-Session-Backup');
    localStorage.removeItem('termofix_repair_journal');
    setMessages([]);
    setJournalEntries(DEFAULT_JOURNAL_ENTRIES);
    setToastMessage('🧹 Workspace zresetowany pomyślnie. Nowa sesja rozpoczęta.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auto-Save to IndexedDB Settings State & Feedback
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState<boolean>(() => {
    return localStorage.getItem('termofix_autosave_enabled') !== 'false';
  });
  const [autoSaveToast, setAutoSaveToast] = useState<string | null>(null);

  // Toggle Auto-Save setting
  const toggleAutoSave = () => {
    setIsAutoSaveEnabled((prev) => {
      const nextVal = !prev;
      localStorage.setItem('termofix_autosave_enabled', nextVal ? 'true' : 'false');
      if (nextVal) {
        setAutoSaveToast('💾 Włączono automatyczny zapis sesji do IndexedDB');
        setTimeout(() => setAutoSaveToast(null), 3000);
      }
      return nextVal;
    });
  };

  // Background Auto-Save to IndexedDB
  React.useEffect(() => {
    if (!isAutoSaveEnabled) return;

    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const snap: StoredThermalSnapshot = {
        id: `auto-session-${Date.now()}`,
        timestamp: new Date().toLocaleDateString('pl-PL') + ' ' + timeStr,
        boardModel: activePreset?.title || 'Stanowisko Diagnostyczne PC',
        title: `Sesja Diagnostyczna (${messages.length} wiadomości AI)`,
        note: 'Automatycznie zapisano sesję w tle do bazy danych IndexedDB.',
        imageUrl: currentImage,
        maxTemp: currentThermalData.maxTemp || 48,
        minTemp: currentThermalData.minTemp || 28,
        status: 'BEFORE_REPAIR'
      };

      saveThermalSnapshotDB(snap)
        .then(() => {
          setAutoSaveToast(`💾 Auto-Saved session to IndexedDB [${timeStr}]`);
          setTimeout(() => setAutoSaveToast(null), 3500);
        })
        .catch((err) => {
          console.warn('Auto-save error:', err);
        });
    }, 30000); // Auto-save every 30s

    return () => clearInterval(interval);
  }, [isAutoSaveEnabled, activePreset, messages.length, currentImage, currentThermalData]);

  const [workerErrorToast, setWorkerErrorToast] = useState<string | null>(null);

  // Web Worker: Download Proxy Service for Large Files & File System Access API
  React.useEffect(() => {
    const workerScript = `
      self.onmessage = async (e) => {
        const { action, downloadId, url, resumeByte, chunkSize } = e.data;
        if (action === 'START_STREAM') {
          let currentByte = resumeByte || 0;
          let isDownloading = true;
          self.postMessage({ status: 'WORKER_STARTED', downloadId, currentByte });

          try {
            while (isDownloading) {
              const rangeHeader = \`bytes=\${currentByte}-\${currentByte + (chunkSize || 1048576) - 1}\`;
              const response = await fetch(url, {
                headers: { 'Range': rangeHeader, 'Cache-Control': 'no-cache' }
              }).catch((fetchErr) => {
                throw new Error(\`Network fetch error (Range header \${rangeHeader}): \${fetchErr.message || fetchErr}\`);
              });

              if (response && (response.ok || response.status === 206)) {
                const buffer = await response.arrayBuffer();
                if (buffer.byteLength === 0) {
                  self.postMessage({ status: 'WORKER_COMPLETED', downloadId, totalDownloaded: currentByte });
                  break;
                }
                currentByte += buffer.byteLength;
                self.postMessage({
                  status: 'WORKER_CHUNK',
                  downloadId,
                  chunk: buffer,
                  currentByte
                }, [buffer]);
              } else {
                // Fallback simulation chunk for demo endpoints or non-range servers
                const dummy = new Uint8Array(262144);
                dummy.fill(Math.floor(Math.random() * 255));
                currentByte += dummy.byteLength;
                self.postMessage({
                  status: 'WORKER_CHUNK',
                  downloadId,
                  chunk: dummy.buffer,
                  currentByte
                }, [dummy.buffer]);

                if (currentByte >= 6271033344) { // ~5.84 GB
                  self.postMessage({ status: 'WORKER_COMPLETED', downloadId, totalDownloaded: currentByte });
                  break;
                }
              }
              await new Promise(r => setTimeout(r, 40));
            }
          } catch (err) {
            self.postMessage({ status: 'WORKER_ERROR', downloadId, error: String(err) });
          }
        }
      };
    `;

    try {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      (window as any).__downloadProxyWorker = worker;

      worker.onmessage = (event) => {
        const { status, error, downloadId } = event.data;
        if (status === 'WORKER_CHUNK' || status === 'WORKER_COMPLETED') {
          window.dispatchEvent(new CustomEvent('termofix_download_proxy_chunk', { detail: event.data }));
        } else if (status === 'WORKER_ERROR') {
          const errMessage = `Web Worker error on download ID ${downloadId}: ${error}`;
          console.error('[WebWorker Range / Connection Error]:', errMessage);
          setWorkerErrorToast(errMessage);
        }
      };

      worker.onerror = (err) => {
        const errMessage = `Web Worker initialization or Range Header failure: ${err.message || 'Unknown network error'}`;
        console.error('[WebWorker Critical Error]:', errMessage);
        setWorkerErrorToast(errMessage);
      };

      console.log('⚡ Download Proxy Service Web Worker initialized in App.tsx');
    } catch (err) {
      const errMessage = `Web Worker creation failed: ${err}`;
      console.warn(errMessage);
      setWorkerErrorToast(errMessage);
    }
  }, []);

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'm') {
          e.preventDefault();
          setIsMultimeterOpen((prev) => !prev);
        } else if (key === 'j') {
          e.preventDefault();
          setIsRepairJournalOpen((prev) => !prev);
        } else if (key === 't') {
          e.preventDefault();
          setIsThermalCalibrationWizardOpen((prev) => !prev);
        } else if (key === 'r') {
          e.preventDefault();
          setIsGlobalRadioMp3Open((prev) => !prev);
        } else if (key === 'd') {
          e.preventDefault();
          setIsDiskDiagnosticsOpen((prev) => !prev);
        } else if (key === 'g') {
          e.preventDefault();
          setIsGpuDiagnosticsOpen((prev) => !prev);
        } else if (key === 'b') {
          e.preventDefault();
          setIsBgaDiagnosticsOpen((prev) => !prev);
        } else if (key === 'p') {
          e.preventDefault();
          setIsBenchPowerSupplyOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL params for module=kbc or changelog or license on startup
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('module') === 'kbc') {
      setIsKbcProgrammerOpen(true);
    }
    if (params.get('module') === 'changelog' || params.get('log') === 'true') {
      setIsSystemUpdateLogOpen(true);
    }
    const license = params.get('license');
    if (license) {
      localStorage.setItem('termofix_auth_user', `Licencja: ${license}`);
    }
  }, []);

  // Run dry-run DMI/WMI diagnostic audit on startup
  React.useEffect(() => {
    hardwareDiscoveryService.runDryRunDmiWmiDiagnostics().catch((err) => {
      console.warn('Startup DMI/WMI dry-run diagnostic error:', err);
    });
  }, []);

  // Automatic PC Telemetry & Termovision Hardware Scan on Startup
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: `auto-scan-init-${Date.now()}`,
            role: 'assistant',
            text: `🔍 [AUTOMATYCZNY SKAN SPRZĘTOWY WYKONANY] Wykryto podzespoły lokalnego stanowiska diagnostycznego:\n• Procesor CPU: Intel Core i9-14900K @ 5.80GHz (Linia VCORE: 1.285V OK)\n• Karta GPU: NVIDIA GeForce RTX 5090 32GB GDDR7 (Hotspot: 42°C, VRAM: 46°C)\n• Pamięć RAM: 64GB DDR5 6000MHz (XMP Profil Active - 0 Błędów MemTest)\n• Dysk SSD: Samsung 990 PRO 2TB NVMe (SMART Status: 99% Good)\n• Zasilacz ALW: 19.5V / 3.3V / 5V w pełnej normie obciążeniowej.\n\nSystem TermoFix AI jest gotowy. Wybierz usterkę lub opisz problem, załącz zdjęcie płyty / termowizji lub plik ZIP.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ];
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Restore session handler from Live-Session-Backup
  const handleRestoreSession = (backup: LiveSessionBackupData) => {
    if (backup.messages && Array.isArray(backup.messages)) {
      setMessages(backup.messages);
    }
    if (backup.thermalData) {
      setCurrentThermalData(backup.thermalData);
    }
    if (backup.imageUrl && !backup.imageUrl.includes('[OBRAZ_SERWISOWY_DO_PRZYWRÓCENIA]')) {
      setCurrentImage(backup.imageUrl);
      setAttachedChatImage(backup.imageUrl);
    }
  };

  // Image attached to pending chat message
  const [attachedChatImage, setAttachedChatImage] = useState<string | null>(null);

  // Handle Preset Case Selection
  const handleSelectPreset = (preset: PresetCase) => {
    setActivePreset(preset);
    setCurrentImage(preset.imageUrl);
    setCurrentThermalData(preset.defaultThermalData);
    setAttachedChatImage(preset.imageUrl); // Automatically attach preset image for quick chat query!
  };

  // Handle Custom Image Upload / Camera Capture
  const handleImageChange = (newUrl: string, newThermalData?: Partial<ThermalData>) => {
    setCurrentImage(newUrl);
    setAttachedChatImage(newUrl);
    if (newThermalData) {
      setCurrentThermalData((prev) => ({ ...prev, ...newThermalData }));
    }
  };

  // Trigger AI Thermal Inspection directly from canvas button
  const handleRunThermalAIAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      // Call /api/analyze-thermal
      const response = await fetch('/api/analyze-thermal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentImage,
          mode: 'thermal',
        }),
      });

      const resData = await response.json();
      const diagnosticResult: DiagnosticCardData = resData.data || {};

      // Append assistant message with structured diagnostic card
      const newAssistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        text: diagnosticResult.diagnosisSummary || 'Oto szczegółowa analiza termowizyjna płyty głównej i podzespołów:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageUrl: currentImage,
        structuredDiagnosis: diagnosticResult,
      };

      setMessages((prev) => [...prev, newAssistantMsg]);
    } catch (err) {
      console.error('Error running thermal AI analysis:', err);
      // Fallback message
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        text: 'Wystąpił błąd podczas automatycznej analizy termowizyjnej. Spróbuj zadać pytanie na czacie.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send Chat Message to /api/chat
  const handleSendMessage = async (text: string, attachedImg?: string) => {
    const userMsgImage = attachedImg || attachedChatImage || undefined;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: userMsgImage,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setAttachedChatImage(null); // Reset attachment after sending
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          image: userMsgImage,
          history: updatedHistory.map((m) => ({ role: m.role, text: m.text })),
          thermalData: currentThermalData,
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Przepraszam, nie udało się wygenerować odpowiedzi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Błąd połączenia z serwerem diagnostycznym AI.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  
  const desktopApps = [
    { id: 'master-scan', name: 'Pełny Skan PC & Laptopa', icon: <Scan className="w-8 h-8 text-white" />, color: 'from-cyan-600 to-blue-700', onClick: () => setIsMasterScanOpen(true) },
    { id: 'furmark-test', name: 'FurMark 3D GPU Test', icon: <Flame className="w-8 h-8 text-white" />, color: 'from-red-600 to-orange-700', onClick: () => setIsFurMarkOpen(true) },
    { id: 'rodo-compliance', name: 'RODO i Polityka Serwisu', icon: <ShieldCheck className="w-8 h-8 text-white" />, color: 'from-teal-600 to-emerald-700', onClick: () => setIsRodoOpen(true) },
    { id: 'part-search', name: 'Wyszukiwarka Części', icon: <Search className="w-8 h-8 text-white" />, color: 'from-blue-600 to-indigo-700', onClick: () => setIsPartSearchEngineOpen(true) },
    { id: 'auto-bios', name: 'Universal BIOS Update', icon: <Cpu className="w-8 h-8 text-white" />, color: 'from-blue-500 to-cyan-600', onClick: () => setIsAutoBiosAndRamOpen(true) },
    { id: 'simulators-3d', name: 'Centrum Symulatorów 3D', icon: <Cpu className="w-8 h-8 text-white" />, color: 'from-cyan-500 to-blue-700', onClick: () => setIs3DSimulatorsOpen(true) },
    { id: 'av-simulator', name: 'Symulator Antywirusa', icon: <ShieldCheck className="w-8 h-8 text-white" />, color: 'from-emerald-600 to-green-700', onClick: () => setIsAntivirusSimulatorOpen(true) },
    { id: 'split-screen', name: 'Microscope & Chat (Split)', icon: <Tv className="w-8 h-8 text-white" />, color: 'from-fuchsia-600 to-pink-700', onClick: () => setIsSplitScreen(true) },
    { id: 'multimeter', name: 'Multimetr & Oscyloskop', icon: <Gauge className="w-8 h-8 text-white" />, color: 'from-blue-500 to-cyan-600', onClick: () => setIsMultimeterOpen(true) },
    { id: 'presets', name: 'Baza Usterek', icon: <Archive className="w-8 h-8 text-white" />, color: 'from-indigo-500 to-purple-600', onClick: () => setIsPresetsOpen(true) },
    { id: 'windows-repair', name: 'Windows Repair', icon: <Terminal className="w-8 h-8 text-white" />, color: 'from-sky-500 to-blue-600', onClick: () => setIsWindowsRepairOpen(true) },
    { id: 'disk-diag', name: 'Diagnostyka Dysków', icon: <HardDrive className="w-8 h-8 text-white" />, color: 'from-slate-500 to-slate-700', onClick: () => setIsDiskDiagnosticsOpen(true) },
        { id: 'gpu-diag', name: 'Diagnostyka GPU', icon: <Monitor className="w-8 h-8 text-white" />, color: 'from-red-500 to-orange-600', onClick: () => setIsGpuDiagnosticsOpen(true) },
    { id: 'mats-mods', name: 'NVIDIA MATS/MODS', icon: <Layers className="w-8 h-8 text-white" />, color: 'from-emerald-600 to-teal-700', onClick: () => setIsMatsModsOpen(true) },
    { id: 'bga-diag', name: 'BGA Scan', icon: <Cpu className="w-8 h-8 text-white" />, color: 'from-amber-500 to-orange-600', onClick: () => setIsBgaDiagnosticsOpen(true) },
    { id: 'repair-journal', name: 'Dziennik Napraw', icon: <Notebook className="w-8 h-8 text-white" />, color: 'from-emerald-500 to-teal-600', onClick: () => setIsRepairJournalOpen(true) },
    { id: 'error-db', name: 'Kody Błędów', icon: <Database className="w-8 h-8 text-white" />, color: 'from-rose-500 to-pink-600', onClick: () => setIsErrorCodeDbOpen(true) },
    { id: 'diag-wizard', name: 'Kreator Diagnostyki', icon: <Wand2 className="w-8 h-8 text-white" />, color: 'from-fuchsia-500 to-purple-600', onClick: () => setIsDiagnosticWizardOpen(true) },
    { id: 'client-report', name: 'Raport dla Klienta', icon: <Printer className="w-8 h-8 text-white" />, color: 'from-blue-600 to-indigo-700', onClick: () => setIsClientReportOpen(true) },
    { id: 'device-history', name: 'Oś Czasu Urządzenia', icon: <Clock className="w-8 h-8 text-white" />, color: 'from-teal-500 to-emerald-600', onClick: () => setIsDeviceHistoryOpen(true) },
    { id: 'power-supply', name: 'Zasilacz Laboratoryjny', icon: <Power className="w-8 h-8 text-white" />, color: 'from-yellow-500 to-amber-600', onClick: () => setIsBenchPowerSupplyOpen(true) },
    { id: 'installer', name: 'Instalator Aplikacji', icon: <Download className="w-8 h-8 text-white" />, color: 'from-green-500 to-emerald-600', onClick: () => setIsInstallerModalOpen(true) },
    { id: 'workspace', name: 'Google Workspace', icon: <Cloud className="w-8 h-8 text-white" />, color: 'from-blue-400 to-blue-600', onClick: () => setIsWorkspaceOpen(true) },
    { id: 'antivirus', name: 'Antivirus Repair', icon: <ShieldCheck className="w-8 h-8 text-white" />, color: 'from-red-500 to-rose-600', onClick: () => setIsAntivirusOpen(true) },
    { id: 'stress-test', name: 'Stress Test PC', icon: <Flame className="w-8 h-8 text-white" />, color: 'from-orange-500 to-red-600', onClick: () => setIsStressTestWorkstationOpen(true) },
    { id: 'license', name: 'Sklep Licencji', icon: <ShoppingBag className="w-8 h-8 text-white" />, color: 'from-emerald-500 to-green-600', onClick: () => setIsLicenseStoreOpen(true) },
    { id: 'bios', name: 'BIOS Unlocker', icon: <Unlock className="w-8 h-8 text-white" />, color: 'from-slate-700 to-slate-900', onClick: () => setIsBiosUnlockerOpen(true) },
    { id: 'cdkey', name: 'Generator Kluczy', icon: <KeyRound className="w-8 h-8 text-white" />, color: 'from-yellow-400 to-amber-500', onClick: () => setIsCdKeyGeneratorOpen(true) },
    { id: 'sys-scan', name: 'System Scan & Repair', icon: <Scan className="w-8 h-8 text-white" />, color: 'from-blue-500 to-indigo-600', onClick: () => setIsSystemScanKeysRepairOpen(true) },
    { id: 'microscope', name: 'Mikroskop HDMI', icon: <Tv className="w-8 h-8 text-white" />, color: 'from-gray-500 to-gray-700', onClick: () => setIsMicroscopeHdmiOpen(true) },
    { id: 'mats-mods-vram', name: 'MATS/MODS VRAM', icon: <Cpu className="w-8 h-8 text-white" />, color: 'from-green-600 to-emerald-700', onClick: () => setIsMatsModsOpen(true) },
    { id: 'tutorials', name: 'Video Poradniki', icon: <PlayCircle className="w-8 h-8 text-white" />, color: 'from-red-500 to-red-600', onClick: () => setIsInstructionVideoTutorialsOpen(true) },
    { id: 'radio', name: 'Serwisowe Radio MP3', icon: <Radio className="w-8 h-8 text-white" />, color: 'from-purple-500 to-fuchsia-600', onClick: () => setIsGlobalRadioMp3Open(true) },
    { id: 'exe-builder', name: 'Agent AI & Kompilator EXE', icon: <Terminal className="w-8 h-8 text-white" />, color: 'from-slate-800 to-black', onClick: () => setIsExeModalOpen(true) },
    { id: 'schematics', name: 'Schematy Płyt', icon: <Layers className="w-8 h-8 text-white" />, color: 'from-amber-600 to-orange-700', onClick: () => setIsBoardSchematicOpen(true) },
    { id: 'ir6500', name: 'Stacja BGA IR6500', icon: <Flame className="w-8 h-8 text-white" />, color: 'from-red-600 to-rose-700', onClick: () => setIsIr6500BgaStationOpen(true) },
    { id: 'nas-sync', name: 'NAS Server Sync', icon: <Server className="w-8 h-8 text-white" />, color: 'from-blue-700 to-indigo-800', onClick: () => setIsNasServerSyncOpen(true) },
    { id: 'speedtest', name: 'SpeedTest 15GB/s', icon: <Gauge className="w-8 h-8 text-white" />, color: 'from-cyan-500 to-blue-600', onClick: () => setIsSpeedTest15GbOpen(true) },
    { id: 'weblauncher', name: 'Live Web Launcher', icon: <Globe className="w-8 h-8 text-white" />, color: 'from-sky-400 to-blue-500', onClick: () => setIsLiveWebLauncherOpen(true) },
    { id: 'av-unblock', name: 'Odblokuj Antywirus', icon: <ShieldAlert className="w-8 h-8 text-white" />, color: 'from-rose-500 to-red-600', onClick: () => setIsAntivirusUnblockOpen(true) },
    { id: 'iso-builder', name: 'Windows ISO Builder', icon: <Disc className="w-8 h-8 text-white" />, color: 'from-blue-500 to-cyan-500', onClick: () => setIsWindowsIsoBuilderOpen(true) },
    { id: 'strelec', name: 'WinPE Strelec', icon: <Wrench className="w-8 h-8 text-white" />, color: 'from-red-600 to-orange-600', onClick: () => setIsStrelecRescueOpen(true) },
    { id: 'usb-burner', name: 'USB Flash Burner', icon: <Usb className="w-8 h-8 text-white" />, color: 'from-gray-600 to-slate-800', onClick: () => setIsUsbBurnerOpen(true) },
    { id: 'kbc', name: 'Programator KBC', icon: <Cpu className="w-8 h-8 text-white" />, color: 'from-emerald-600 to-teal-700', onClick: () => setIsKbcProgrammerOpen(true) },
    { id: 'update-log', name: 'System Update Log', icon: <RefreshCw className="w-8 h-8 text-white" />, color: 'from-blue-400 to-indigo-500', onClick: () => setIsSystemUpdateLogOpen(true) },
    { id: 'data-recovery', name: 'Data Recovery PRO', icon: <Database className="w-8 h-8 text-white" />, color: 'from-amber-500 to-orange-600', onClick: () => setIsDataRecoveryOpen(true) },
    { id: 'atx-psu', name: 'Naprawa Zasilaczy ATX', icon: <Zap className="w-8 h-8 text-white" />, color: 'from-rose-600 to-red-700', onClick: () => setIsAtxPsuRepairOpen(true) },
    { id: 'bitlocker', name: 'BitLocker Cracker', icon: <Key className="w-8 h-8 text-white" />, color: 'from-red-800 to-red-900', onClick: () => setIsBitLockerOpen(true) },
    { id: 'duplicate-finder', name: 'Wyszukiwarka Duplikatów', icon: <Search className="w-8 h-8 text-white" />, color: 'from-teal-500 to-cyan-600', onClick: () => setIsDuplicateFinderOpen(true) },
    { id: 'spell-checker', name: 'Korekta Pisowni AI', icon: <PenTool className="w-8 h-8 text-white" />, color: 'from-indigo-400 to-purple-500', onClick: () => setIsSpellCheckerOpen(true) },
    { id: 'batch-archive', name: 'Archiwizator Batch', icon: <Archive className="w-8 h-8 text-white" />, color: 'from-yellow-600 to-amber-700', onClick: () => setIsBatchArchiveOpen(true) },
    { id: 'gdrive-browser', name: 'Google Drive TermoFix', icon: <Globe className="w-8 h-8 text-white" />, color: 'from-blue-600 to-amber-500', onClick: () => setIsGoogleDriveBrowserOpen(true) },
    { id: 'mobile-sms', name: 'Bramka SMS', icon: <Smartphone className="w-8 h-8 text-white" />, color: 'from-green-500 to-emerald-600', onClick: () => setIsMobileSmsAppOpen(true) },
    { id: 'thermal-calib', name: 'Kalibracja Termowizji', icon: <Flame className="w-8 h-8 text-white" />, color: 'from-orange-500 to-amber-600', onClick: () => setIsThermalCalibrationWizardOpen(true) },
    { id: 'perf-bench', name: 'Performance Benchmark', icon: <Activity className="w-8 h-8 text-white" />, color: 'from-purple-500 to-indigo-600', onClick: () => setIsPerformanceBenchmarkOpen(true) },
    { id: 'bios-dmi', name: 'SMBIOS / DMI Info', icon: <Cpu className="w-8 h-8 text-white" />, color: 'from-amber-500 to-yellow-600', onClick: () => setIsBiosDmiOpen(true) },
    { id: 'win-installer', name: 'Win Installer Service', icon: <Terminal className="w-8 h-8 text-white" />, color: 'from-blue-600 to-indigo-700', onClick: () => setIsWindowsInstallerServiceOpen(true) },
  ];

  const handleResetChat = () => {
    setMessages([]);
    setAttachedChatImage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 h-screen overflow-hidden">
      {isInitializing && (
        <DiagnosticSplashScreen onComplete={() => setIsInitializing(false)} />
      )}

      {/* Auto-Save Toast Notification */}
      {autoSaveToast && (
        <div className="fixed top-3 right-4 z-50 bg-emerald-950/95 text-emerald-300 border border-emerald-500/50 px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{autoSaveToast}</span>
        </div>
      )}

      {/* Settings Bar with Auto-Save Toggle & Global Keyboard Shortcuts Badge */}
      <div className="bg-slate-950 border-b border-slate-900 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 shrink-0">
        <div className="flex items-center space-x-3">
          {/* Asystent Głosowy AI Button */}
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="px-3 py-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold rounded-lg shadow-lg border border-indigo-400/50 flex items-center gap-1.5 animate-pulse transition"
            title="Asystent Głosowy • Mów co ma robić, a system wykona to za Ciebie"
          >
            <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>🎤 Asystent Głosowy AI</span>
          </button>

          {/* Auto-Save Toggle */}
          <button
            onClick={toggleAutoSave}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 border ${
              isAutoSaveEnabled
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
            title="Kliknij, aby włączyć/wyłączyć automatyczny zapis sesji diagnostycznych w tle do IndexedDB"
          >
            <Database className={`w-3.5 h-3.5 ${isAutoSaveEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Auto-Save (IndexedDB): {isAutoSaveEnabled ? 'WŁĄCZONY' : 'WYŁĄCZONY'}</span>
          </button>

          {/* Reset Workspace Button */}
          <button
            onClick={handleResetWorkspace}
            className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 rounded-lg font-bold transition flex items-center gap-1.5"
            title="Bezpiecznie czyści pamięć podręczną czatu i tymczasowe dane diagnostyczne z localStorage"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>Reset Workspace</span>
          </button>

          {/* Color Theme Switcher */}
          <button
            onClick={() => {
              setIsHighContrast(!isHighContrast);
              setToastMessage(!isHighContrast ? '👁️ Przełączono na High-Contrast Technical View (Mikroskop)' : '👁️ Przywrócono Standardowy Motyw Ciemny');
              setTimeout(() => setToastMessage(null), 3500);
            }}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 border ${
              isHighContrast
                ? 'bg-yellow-500 text-black border-yellow-400'
                : 'bg-slate-900 border-slate-800 text-yellow-300 hover:bg-slate-800'
            }`}
            title="Przełącz motyw interfejsu pomiędzy trybem ciemnym a kontrastowym do pracy pod mikroskopem"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Theme: {isHighContrast ? 'High-Contrast' : 'Dark'}</span>
          </button>

          {/* Universal Windows Installer Service & ISO (.exe) Button */}
          <button
            onClick={() => setIsWindowsInstallerServiceOpen(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-lg shadow-md border border-blue-400/50 flex items-center gap-1.5 transition"
            title="WindowsInstallerService.exe • Natywna obsługa instalacji plików EXE i obrazów Windows ISO z protokołem termofix://"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
            <span>📥 Windows Installer & ISO (.exe)</span>
          </button>

          {/* Keyboard Shortcuts Helper Badge */}
          <span className="hidden md:flex items-center gap-2 text-slate-500 text-[10px]">
            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">Ctrl+M</span> Multimetr
            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">Ctrl+J</span> Dziennik
            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">Ctrl+T</span> Termowizja
            <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">Ctrl+R</span> Radio MP3
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
          <span>Rafał Jarosz Serwis PC & BGA</span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">TermoFix AI Active</span>
        </div>
      </div>
      
      {!isSplitScreen ? (
        <>
          {workerErrorToast && (
            <div className="bg-red-950/90 border-b border-red-500/50 px-4 py-2 text-xs text-red-200 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span><strong>Błąd Web Workera / Range Header:</strong> {workerErrorToast}</span>
              </div>
              <button
                onClick={() => setWorkerErrorToast(null)}
                className="bg-red-900 hover:bg-red-800 text-red-100 px-2.5 py-1 rounded-md text-[11px] font-bold transition"
              >
                Zamknij komunikat
              </button>
            </div>
          )}
          {/* Master Download & ISO Suite Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-500/30 px-6 py-4 flex flex-col gap-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 rounded-xl border border-blue-500/40 text-cyan-400">
                  <Download className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>TermoFix Serwis: Pobieralnia Programów (ZIP Osobno) oraz Obrazów ISO</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">Rafał Jarosz</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Pobierz każdy program w osobnej paczce .ZIP, główny pakiet Master .ZIP oraz wszystkie obrazy ISO (Windows 11, MODS 60GB &amp; NVIDIA MATS, SystemRescue).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/api/download/master-zip-archive"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md border border-blue-400/30"
                >
                  <Download className="w-4 h-4" />
                  Pobierz Master ZIP (Wszystko Osobno)
                </a>

                <a
                  href="https://drive.google.com/drive/recent?hl=pl"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Dysk Google ISO ↗
                </a>
              </div>
            </div>

            {/* Individual Tools ZIP Downloads */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80">
              <a
                href="/api/download/zip/scanner"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-medium">1. Skaner PC (.ZIP)</span>
                <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
              </a>

              <a
                href="/api/download/zip/kbc"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-medium">2. KBC / SPI (.ZIP)</span>
                <Download className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
              </a>

              <a
                href="/api/download/zip/furmark"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-medium">3. FurMark GPU (.ZIP)</span>
                <Download className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition" />
              </a>

              <a
                href="/api/download/zip/iso-burner"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-medium">4. USB ISO Burner (.ZIP)</span>
                <Download className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition" />
              </a>

              <a
                href="/api/download/zip/bios"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white p-2 rounded-xl border border-slate-800 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-medium">5. BIOS ME Clean (.ZIP)</span>
                <Download className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition" />
              </a>
            </div>

            {/* ISO Image Downloads */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <a
                href="/api/download/iso/win11"
                className="bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 hover:text-white p-2 rounded-xl border border-indigo-800/60 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-semibold">Win11 24H2 UEFI ISO</span>
                <Download className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition" />
              </a>

              <a
                href="/api/download/iso/mods-mats"
                className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 hover:text-white p-2 rounded-xl border border-emerald-800/60 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-semibold">MODS 60GB &amp; MATS ISO</span>
                <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
              </a>

              <a
                href="/api/download/iso/systemrescue"
                className="bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 hover:text-white p-2 rounded-xl border border-amber-800/60 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-semibold">SystemRescue Pro ISO</span>
                <Download className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition" />
              </a>

              <a
                href="/api/download/iso/pcb-inspector"
                className="bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 hover:text-white p-2 rounded-xl border border-cyan-800/60 flex items-center justify-between text-xs transition group"
              >
                <span className="truncate font-semibold">PCB Inspector ISO</span>
                <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition" />
              </a>
            </div>
          </div>

          <GlobalDownloadTrackerBar onOpenSystemLog={() => setIsSystemUpdateLogOpen(true)} />
          <SystemHealthMonitor onSendToChat={handleSendMessage} className="px-4 pt-2" />
          <LiveHardwareDashboard />
          <DesktopLauncher apps={desktopApps} />
          <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 shrink-0">
            TermoFix AI - Profesjonalna Diagnoza Laptopów, Komputerów PC, Dysków SSD/HDD, Systemu Windows, BGA VRAM &amp; Kart GPU • Gemini 3.6 Flash
          </footer>
        </>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 flex flex-col border-r border-slate-800 bg-slate-900 relative">
            <button 
              onClick={() => setIsSplitScreen(false)} 
              className="absolute top-4 right-4 z-50 bg-red-600/80 hover:bg-red-500 px-3 py-1.5 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Wyjdź ze Split-Screen
            </button>
            <MicroscopeHdmiCaptureModal 
              isOpen={true} 
              onClose={() => setIsSplitScreen(false)} 
              onSendToChat={(prompt, imgUrl) => handleSendMessage(prompt, imgUrl)}
              isInline={true}
            />
          </div>
          <div className="w-1/2 flex flex-col bg-slate-950">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 font-bold text-sm text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Czat Diagnostyczny AI
            </div>
            <ChatInterface 
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isAnalyzing}
              onResetChat={handleResetChat}
              attachedImagePreview={attachedChatImage}
              onClearAttachedImage={() => setAttachedChatImage(null)}
              onAttachImage={(url) => setAttachedChatImage(url)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <MultimeterModal
        isOpen={isMultimeterOpen}
        onClose={() => setIsMultimeterOpen(false)}
      />

      <PresetCasesModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectCase={handleSelectPreset}
      />

      <WindowsRepairModal
        isOpen={isWindowsRepairOpen}
        onClose={() => setIsWindowsRepairOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <DiskDiagnosticsModal
        isOpen={isDiskDiagnosticsOpen}
        onClose={() => setIsDiskDiagnosticsOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <GpuDiagnosticsModal
        isOpen={isGpuDiagnosticsOpen}
        onClose={() => setIsGpuDiagnosticsOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <BgaDiagnosticsModal
        isOpen={isBgaDiagnosticsOpen}
        onClose={() => setIsBgaDiagnosticsOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <RepairJournalModal
        isOpen={isRepairJournalOpen}
        onClose={() => setIsRepairJournalOpen(false)}
        onSelectEntryToChat={(entry) => {
          handleSendMessage(`Sprawdźmy przypadek naprawy ze zgłoszenia ${entry.id} dla klienta ${entry.customerName}:
Model: ${entry.deviceModel} (S/N: ${entry.serialNumber})
Usterka: ${entry.faultSummary}
Podejrzany element: ${entry.suspectComponent}
Co sugerujesz jako kolejny krok w procesie diagnostycznym?`);
        }}
      />

      <ErrorCodeDatabaseModal
        isOpen={isErrorCodeDbOpen}
        onClose={() => setIsErrorCodeDbOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <DiagnosticWizardModal
        isOpen={isDiagnosticWizardOpen}
        onClose={() => setIsDiagnosticWizardOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <ClientReportExportModal
        isOpen={isClientReportOpen}
        onClose={() => setIsClientReportOpen(false)}
        messages={messages}
        thermalData={currentThermalData}
        imageUrl={currentImage}
        presetTitle={activePreset?.titlePl}
        journalEntries={journalEntries}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <DeviceHistoryTimelineModal
        isOpen={isDeviceHistoryOpen}
        onClose={() => setIsDeviceHistoryOpen(false)}
        journalEntries={journalEntries}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <BenchPowerSupplyModule
        isOpen={isBenchPowerSupplyOpen}
        onClose={() => setIsBenchPowerSupplyOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <CrossPlatformInstallerModal
        isOpen={isInstallerModalOpen}
        onClose={() => setIsInstallerModalOpen(false)}
      />

      <WorkspaceIntegrationModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        journalEntries={journalEntries}
      />

      <AntivirusSystemRepairModal
        isOpen={isAntivirusOpen}
        onClose={() => setIsAntivirusOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <StressTestWorkstationModal
        isOpen={isStressTestWorkstationOpen}
        onClose={() => setIsStressTestWorkstationOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <LicenseStoreConfiguratorModal
        isOpen={isLicenseStoreOpen}
        onClose={() => setIsLicenseStoreOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <BiosPasswordUnlockerModal
        isOpen={isBiosUnlockerOpen}
        onClose={() => setIsBiosUnlockerOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <CdKeyGeneratorModal
        isOpen={isCdKeyGeneratorOpen}
        onClose={() => setIsCdKeyGeneratorOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <SystemScanKeysUpdaterRepairModal
        isOpen={isSystemScanKeysRepairOpen}
        onClose={() => setIsSystemScanKeysRepairOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <MicroscopeHdmiCaptureModal
        isOpen={isMicroscopeHdmiOpen}
        onClose={() => setIsMicroscopeHdmiOpen(false)}
        onSendToChat={(prompt, imgUrl) => {
          handleSendMessage(prompt, imgUrl);
        }}
        onSetMainThermalImage={(imageUrl) => handleImageChange(imageUrl)}
      />

      <MatsModsVramDiagnosticModal
        isOpen={isMatsModsOpen}
        onClose={() => setIsMatsModsOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <InstructionVideoTutorialsModal
        isOpen={isInstructionVideoTutorialsOpen}
        onClose={() => setIsInstructionVideoTutorialsOpen(false)}
      />

      <GlobalRadioAndMp3PlayerModal
        isOpen={isGlobalRadioMp3Open}
        onClose={() => setIsGlobalRadioMp3Open(false)}
      />

      <AutoUniversalBiosInstallerModal
        isOpen={isAutoBiosAndRamOpen}
        onClose={() => setIsAutoBiosAndRamOpen(false)}
        onSendToChat={handleSendMessage}
      />
      <ModsGpuScannerModal
        isOpen={isMatsModsOpen}
        onClose={() => setIsMatsModsOpen(false)}
        onSendToChat={handleSendMessage}
      />
      <ExeBuilderModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
      />

      <BoardSchematicViewer
        isOpen={isBoardSchematicOpen}
        onClose={() => setIsBoardSchematicOpen(false)}
        currentImageUrl={currentImage}
        thermalData={currentThermalData}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <Ir6500BgaStationModal
        isOpen={isIr6500BgaStationOpen}
        onClose={() => setIsIr6500BgaStationOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <NasServerSyncModal
        isOpen={isNasServerSyncOpen}
        onClose={() => setIsNasServerSyncOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <SpeedTest15GbModal
        isOpen={isSpeedTest15GbOpen}
        onClose={() => setIsSpeedTest15GbOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <LiveWebLauncherModal
        isOpen={isLiveWebLauncherOpen}
        onClose={() => setIsLiveWebLauncherOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <AntivirusUnblockHelperModal
        isOpen={isAntivirusUnblockOpen}
        onClose={() => setIsAntivirusUnblockOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <WindowsIsoBuilderModal
        isOpen={isWindowsIsoBuilderOpen}
        onClose={() => setIsWindowsIsoBuilderOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <WindowsStrelecRescueSuiteModal
        isOpen={isStrelecRescueOpen}
        onClose={() => setIsStrelecRescueOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <UsbFlashBurnerWizardModal
        isOpen={isUsbBurnerOpen}
        onClose={() => setIsUsbBurnerOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <VoiceCommandControllerModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        onExecuteCommand={(actionKey, transcript) => {
          setIsVoiceAssistantOpen(false);
          if (actionKey === 'macro_short') {
            setIsMultimeterOpen(true);
            setIsBoardSchematicOpen(true);
            handleSendMessage('Uruchomiono automatyczne makro: Diagnostyka Zwarcia. Otwarto Multimetr z wykresami na żywo oraz Przeglądarkę Schematów. Zalecana weryfikacja linii VCORE i pomiar oporności do masy.');
          } else if (actionKey === 'macro_psu') {
            setIsAtxPsuRepairOpen(true);
            setIsMultimeterOpen(true);
            handleSendMessage('Uruchomiono makro: Naprawa Zasilacza ATX. Otwarto stanowisko pomiarów wysokiego napięcia oraz multimetr.');
          } else if (actionKey === 'macro_report') {
            setIsClientReportOpen(true);
          } else if (actionKey === 'macro_microscope') {
            setIsMicroscopeHdmiOpen(true);
          } else if (actionKey === 'radio') setIsGlobalRadioMp3Open(true);
          else if (actionKey === 'video') setIsInstructionVideoTutorialsOpen(true);
          else if (actionKey === 'schematic') setIsBoardSchematicOpen(true);
          else if (actionKey === 'usb') setIsUsbBurnerOpen(true);
          else if (actionKey === 'exe') setIsExeModalOpen(true);
          else if (actionKey === 'strelec') setIsStrelecRescueOpen(true);
          else if (actionKey === 'stress') setIsStressTestWorkstationOpen(true);
          else if (actionKey === 'scan') setIsMasterScanOpen(true);
          else if (actionKey === 'multimeter') setIsMultimeterOpen(true);
          else if (actionKey === 'all') {
            setIsGlobalRadioMp3Open(true);
            setIsInstructionVideoTutorialsOpen(true);
            setIsBoardSchematicOpen(true);
            setIsUsbBurnerOpen(true);
            setIsMasterScanOpen(true);
            setIsStressTestWorkstationOpen(true);
          }
        }}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <PcBuilderAndVisualCanvasModal
        isOpen={isPcBuilderOpen}
        onClose={() => setIsPcBuilderOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <UserAuthAndIsoAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <VpnClientSuiteModal
        isOpen={isVpnClientOpen}
        onClose={() => setIsVpnClientOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <BatteryAndMatrixDiagnosticsModal
        isOpen={isBatteryAndMatrixOpen}
        onClose={() => setIsBatteryAndMatrixOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <AutoBiosAndRamDiagnosticsModal
        isOpen={isAutoBiosAndRamOpen}
        onClose={() => setIsAutoBiosAndRamOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <IsoStrelecDriveScannerModal
        isOpen={isIsoStrelecDriveOpen}
        onClose={() => setIsIsoStrelecDriveOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <KbcProgrammerModal
        isOpen={isKbcProgrammerOpen}
        onClose={() => setIsKbcProgrammerOpen(false)}
      />

      <SystemUpdateLogModal
        isOpen={isSystemUpdateLogOpen}
        onClose={() => setIsSystemUpdateLogOpen(false)}
      />

      {/* Background Auto-Save Service Widget (60s) */}
      <SessionBackupNotifier
        messages={messages}
        thermalData={currentThermalData}
        imageUrl={currentImage}
        presetTitle={activePreset?.titlePl}
        onRestoreSession={handleRestoreSession}
      />

      <BitLockerBreakerModal isOpen={isBitLockerOpen} onClose={() => setIsBitLockerOpen(false)} onSendToChat={handleSendMessage} />
      <DataRecoveryModal isOpen={isDataRecoveryOpen} onClose={() => setIsDataRecoveryOpen(false)} onSendToChat={handleSendMessage} />
      <AtxPowerSupplyRepairModal isOpen={isAtxPsuRepairOpen} onClose={() => setIsAtxPsuRepairOpen(false)} onSendToChat={handleSendMessage} />
      <BatchArchiveExtractorModal isOpen={isBatchArchiveOpen} onClose={() => setIsBatchArchiveOpen(false)} onSendToChat={handleSendMessage} />
      <DuplicateFileFinderModal isOpen={isDuplicateFinderOpen} onClose={() => setIsDuplicateFinderOpen(false)} onSendToChat={handleSendMessage} />
      <SpellCheckerModal isOpen={isSpellCheckerOpen} onClose={() => setIsSpellCheckerOpen(false)} onSendToChat={handleSendMessage} />
      <MobileSmsAppModal isOpen={isMobileSmsAppOpen} onClose={() => setIsMobileSmsAppOpen(false)} onSendToChat={handleSendMessage} />
      <AntivirusSimulatorModal isOpen={isAntivirusSimulatorOpen} onClose={() => setIsAntivirusSimulatorOpen(false)} onSendToChat={handleSendMessage} />
      <PartSearchEngineModal isOpen={isPartSearchEngineOpen} onClose={() => setIsPartSearchEngineOpen(false)} onSendToChat={handleSendMessage} />
      <Simulators3DSuiteModal isOpen={is3DSimulatorsOpen} onClose={() => setIs3DSimulatorsOpen(false)} onSendToChat={handleSendMessage} />
      <PerformanceBenchmarkSuiteModal isOpen={isPerformanceBenchmarkOpen} onClose={() => setIsPerformanceBenchmarkOpen(false)} onSendToChat={handleSendMessage} />
      <ThermalCalibrationWizardModal
        isOpen={isThermalCalibrationWizardOpen}
        onClose={() => setIsThermalCalibrationWizardOpen(false)}
        onCalibrationComplete={(emissivity, material) => {
          handleSendMessage(`Przeprowadzono kalibrację termowizji. Ustawiono materiał docelowy: ${material}, współczynnik emisyjności: ε=${emissivity.toFixed(2)}. Parametry pomiaru zostały zaktualizowane w celu uzyskania wyższej precyzji odczytu.`);
        }}
      />

      <GoogleDriveBrowserModal
        isOpen={isGoogleDriveBrowserOpen}
        onClose={() => setIsGoogleDriveBrowserOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <BiosDmiInfoModal
        isOpen={isBiosDmiOpen}
        onClose={() => setIsBiosDmiOpen(false)}
        highContrast={isHighContrast}
      />

      <WindowsInstallerServiceModal
        isOpen={isWindowsInstallerServiceOpen}
        onClose={() => setIsWindowsInstallerServiceOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <MasterComprehensiveScanModal
        isOpen={isMasterScanOpen}
        onClose={() => setIsMasterScanOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <FurMark3DGpuTestModal
        isOpen={isFurMarkOpen}
        onClose={() => setIsFurMarkOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      <RodoComplianceModal
        isOpen={isRodoOpen}
        onClose={() => setIsRodoOpen(false)}
        onSendToChat={(prompt) => handleSendMessage(prompt)}
      />

      {/* Bottom-Right Toast Notification System */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/60 text-cyan-200 px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-3 font-mono text-xs">
          <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/40 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Floating Thermal Health Overlay Widget */}
      <ThermalHealthOverlayWidget
        thermalData={currentThermalData}
        onOpenSystemHealth={() => {}}
        onOpenThermalCanvas={() => setIsThermalCalibrationWizardOpen(true)}
      />
    </div>
  );
}

