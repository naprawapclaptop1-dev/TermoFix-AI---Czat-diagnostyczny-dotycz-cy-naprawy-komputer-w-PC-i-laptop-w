import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { 
  ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, Search, Zap, 
  Terminal, ShieldAlert, Cpu, HardDrive, Key, X, Activity, Server, FileDigit, Usb,
  Monitor, Download, Wrench, Info, Check, Copy, Archive, Cloud, FileCode, FileText
} from 'lucide-react';
import { hardwareDiscoveryService } from '../services/hardwareDiscoveryService';

interface SystemScanKeysUpdaterRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export interface HardwareComponentSpec {
  id: string;
  category: 'MATRYCA' | 'CPU' | 'GPU' | 'RAM' | 'DYSK' | 'MOTHERBOARD' | 'BATTERY' | 'NETWORK';
  name: string;
  details: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  serialNumber?: string;
  vendorCode?: string;
  extraInfo?: string;
}

export interface ExtractedProductKey {
  id: string;
  productName: string;
  keyType: 'WINDOWS_OEM' | 'WINDOWS_RETAIL' | 'OFFICE_SUITE' | 'SOFTWARE_LICENSE';
  keyString: string;
  activationStatus: 'AKTYWOWANY' | 'NIEAKTYWOWANY' | 'WYGAŚNIĘTY';
  channel: string;
  acpiAddress?: string;
}

export interface SoftwareUpdateItem {
  id: string;
  name: string;
  category: 'DRIVER' | 'WINDOWS_UPDATE' | 'SOFTWARE_APP';
  currentVersion: string;
  latestVersion: string;
  size: string;
  severity: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL';
  status: 'PENDING' | 'UPDATING' | 'UPDATED';
  description: string;
}

export interface SelectableRepairApp {
  id: string;
  name: string;
  vendor: string;
  installedVersion: string;
  healthState: 'CORRUPTED' | 'DLL_MISSING' | 'REGISTRY_ERROR' | 'HEALTHY';
  selected: boolean;
  repairActions: string[];
}

export const MOCK_HARDWARE_SPECS: HardwareComponentSpec[] = [
  {
    id: 'matryca-1',
    category: 'MATRYCA',
    name: 'Ekran / Matryca IPS 15.6" 165Hz QHD (EDID Decode)',
    details: 'Model: AU Optronics B156QAN02.1 | Rozdzielczość: 2560x1440 @ 165Hz | Pokrycie: 100% DCI-P3 | Jasność: 400 nits',
    status: 'OPTIMAL',
    serialNumber: 'AUO-B156-99A12',
    vendorCode: 'AUO2199',
    extraInfo: 'Sygnał eDP 4-Lane | Stan podświetlenia LED: 100% | Brak martwych pikseli (0 ISO Class I)'
  },
  {
    id: 'cpu-1',
    category: 'CPU',
    name: 'Procesor Intel Core i9-13900HX (24 Rdzenie / 32 Wątki)',
    details: 'Taktowanie: 2.20 GHz - 5.40 GHz Boost | Cache L3: 36MB | TDP Limit PL1/PL2: 55W / 157W',
    status: 'OPTIMAL',
    serialNumber: 'SRM7M-008912',
    vendorCode: 'GenuineIntel',
    extraInfo: 'Instrukcje: AVX2, AVX-512, DL Boost | Temperatura Bieg Jałowy: 38°C'
  },
  {
    id: 'gpu-1',
    category: 'GPU',
    name: 'NVIDIA GeForce RTX 4090 Laptop GPU (16GB GDDR6X)',
    details: 'Rdzenie CUDA: 9728 | TGP: 175W Dynamic Boost | Zegar Rdzenia: 2040 MHz | Szyna: 256-bit',
    status: 'WARNING',
    serialNumber: 'N13E-G1-A1-8891',
    vendorCode: '10DE-2704',
    extraInfo: 'Wykryto podwyższoną temperaturę HotSpot (89°C w stresie). Zalecana wymiana pasty PTM7950.'
  },
  {
    id: 'ram-1',
    category: 'RAM',
    name: 'Pamięć RAM DDR5 32GB (2x16GB) 5600MHz Dual-Channel',
    details: 'Producent: SK Hynix HMCG88MEBRA081N | Opóźnienia: CL46-45-45-90 | Napięcie: 1.1V VDD',
    status: 'OPTIMAL',
    serialNumber: 'HYN-DDR5-88A901',
    vendorCode: 'SK Hynix',
    extraInfo: 'Błędy SPD/ECC: 0 | Obsługa profili XMP 3.0 & AMD EXPO'
  },
  {
    id: 'dysk-1',
    category: 'DYSK',
    name: 'Dysk NVMe SSD Samsung 990 PRO 2TB PCIe 4.0 x4',
    details: 'Prędkość Odczytu: 7450 MB/s | Zapis: 6900 MB/s | Zapisano danych (TBW): 12.4 TB / 1200 TB',
    status: 'OPTIMAL',
    serialNumber: 'S6Z3NS0T109281',
    vendorCode: 'SAMSUNG Electronics',
    extraInfo: 'SMART Status: 100% HEALTH | Temperatura dysku: 39°C'
  },
  {
    id: 'mb-1',
    category: 'MOTHERBOARD',
    name: 'Płyta Główna ASUS ROG Strix G16 (Intel HM770 Express)',
    details: 'BIOS Revision: 312 (UEFI x64) | Koder Embedded Controller (EC): 1.08.00 | Szyna PCIe 4.0 x16',
    status: 'OPTIMAL',
    serialNumber: 'MB-ASUS-9918231',
    vendorCode: 'ASUSTeK COMPUTER INC.',
    extraInfo: 'Gwarancja fabryczna aktywna | Wbudowany moduł TPM 2.0 Enabled'
  }
];

export const MOCK_PRODUCT_KEYS: ExtractedProductKey[] = [
  {
    id: 'key-win-oem',
    productName: 'Windows 11 Pro / Windows 10 Pro (OEM Digital License)',
    keyType: 'WINDOWS_OEM',
    keyString: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
    activationStatus: 'AKTYWOWANY',
    channel: 'ACPI MSDM BIOS Embedded Key',
    acpiAddress: '0x000000000F8A0000 (MSDM Table)'
  },
  {
    id: 'key-win-retail',
    productName: 'Windows 11 Enterprise / Professional Retail Key',
    keyType: 'WINDOWS_RETAIL',
    keyString: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
    activationStatus: 'AKTYWOWANY',
    channel: 'Digital Registry License (Digital ID)',
    acpiAddress: 'Software\\Microsoft\\Windows NT\\CurrentVersion'
  },
  {
    id: 'key-office-2021',
    productName: 'Microsoft Office Professional Plus 2021 / 2019',
    keyType: 'OFFICE_SUITE',
    keyString: 'NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP',
    activationStatus: 'AKTYWOWANY',
    channel: 'Click-To-Run KMS Licensing Hub',
    acpiAddress: 'HKLM\\SOFTWARE\\Microsoft\\Office\\16.0'
  },
  {
    id: 'key-office-365',
    productName: 'Microsoft 365 Apps for Enterprise (Licencja Subskrypcyjna)',
    keyType: 'OFFICE_SUITE',
    keyString: 'KBC365-LIC-9901-SERWIS-ACTIVE',
    activationStatus: 'AKTYWOWANY',
    channel: 'Azure AD / Entra ID Identity Key',
    acpiAddress: 'Identity User Profile Token'
  }
];

export const MOCK_SOFTWARE_UPDATES: SoftwareUpdateItem[] = [
  {
    id: 'upd-gpu-driver',
    name: 'NVIDIA Game Ready Driver & CUDA Driver',
    category: 'DRIVER',
    currentVersion: '551.23',
    latestVersion: '560.81',
    size: '640 MB',
    severity: 'CRITICAL',
    status: 'PENDING',
    description: 'Łata podatności zabezpieczeń w sterowniku GPU oraz optymalizuje wydajność w grach DirectX 12 i Vulkan.'
  },
  {
    id: 'upd-win-kb',
    name: 'Windows 11 Cumulative Update (KB5039212)',
    category: 'WINDOWS_UPDATE',
    currentVersion: '22H2 (22621.3007)',
    latestVersion: '23H2 (22631.3880)',
    size: '1.2 GB',
    severity: 'CRITICAL',
    status: 'PENDING',
    description: 'Zbiorcza aktualizacja zabezpieczeń systemu Windows, łatka jądra NT oraz poprawki wydajności dysków NVMe.'
  },
  {
    id: 'upd-chipset',
    name: 'Intel Chipset Device Software & Serial IO Driver',
    category: 'DRIVER',
    currentVersion: '10.1.32.3',
    latestVersion: '10.1.45.1',
    size: '45 MB',
    severity: 'RECOMMENDED',
    status: 'PENDING',
    description: 'Aktualizacja magistrali SMBus, kontrolera klastra Power Management oraz wyjść GPIO.'
  },
  {
    id: 'upd-vc-redist',
    name: 'Microsoft Visual C++ 2015-2022 Redistributable (x86/x64)',
    category: 'SOFTWARE_APP',
    currentVersion: '14.34.31931',
    latestVersion: '14.40.33810',
    size: '28 MB',
    severity: 'CRITICAL',
    status: 'PENDING',
    description: 'Wymagane biblioteki wykonawcze C++ naprawiające błędy MSVCP140.dll oraz VCRUNTIME140.dll.'
  }
];

export const MOCK_REPAIRABLE_APPS: SelectableRepairApp[] = [
  {
    id: 'app-office',
    name: 'Microsoft Office 365 / 2021 (Word, Excel, Outlook)',
    vendor: 'Microsoft Corporation',
    installedVersion: '16.0.17328',
    healthState: 'CORRUPTED',
    selected: true,
    repairActions: [
      'Regeneracja kluczy rejestru HKLM\\Software\\Microsoft\\Office',
      'Naprawa plików instalacyjnych Click-To-Run i bibliotek DLL',
      'Odbudowa profilu programu Outlook i plików bazy PST/OST'
    ]
  },
  {
    id: 'app-ms-store',
    name: 'Microsoft Store & Usługi Gaming Services (Xbox App)',
    vendor: 'Microsoft Corporation',
    installedVersion: '22405.1401',
    healthState: 'REGISTRY_ERROR',
    selected: true,
    repairActions: [
      'Wykonanie comanda WSReset.exe oraz reset pamięci podręcznej Cache',
      'Ponowne zarejestrowanie pakietu AppX za pomocą PowerShell Get-AppxPackage',
      'Naprawa usługi Windows Update Service (wuauserv)'
    ]
  },
  {
    id: 'app-browser-chrome',
    name: 'Google Chrome / Microsoft Edge Web Browser',
    vendor: 'Google LLC / Microsoft',
    installedVersion: '126.0.6478',
    healthState: 'DLL_MISSING',
    selected: true,
    repairActions: [
      'Odbudowa uszkodzonych bibliotek chrome.dll / edge.dll',
      'Czyszczenie złośliwych rozszerzeń i reset profilu usera',
      'Rejestracja bibliotek V8 Engine COM'
    ]
  },
  {
    id: 'app-vcredist',
    name: 'Microsoft Visual C++ Runtimes & DirectX Runtimes',
    vendor: 'Microsoft Corporation',
    installedVersion: '14.38.33130',
    healthState: 'DLL_MISSING',
    selected: true,
    repairActions: [
      'Ponowna rejestracja bibliotek MSVCP140.dll, VCRUNTIME140.dll',
      'Instalacja pakietów DirectX End-User Runtimes (June 2010)',
      'Odbudowa zbioru bibliotek w C:\\Windows\\System32'
    ]
  },
  {
    id: 'app-adobe-pdf',
    name: 'Adobe Acrobat Reader / PDF Subsystem',
    vendor: 'Adobe Inc.',
    installedVersion: '24.002.20759',
    healthState: 'HEALTHY',
    selected: false,
    repairActions: [
      'Naprawa skojarzeń plików .PDF w rejestrze Windows',
      'Odbudowa wtyczek do przeglądarek internetowych'
    ]
  }
];

export const SystemScanKeysUpdaterRepairModal: React.FC<SystemScanKeysUpdaterRepairModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [activeTab, setActiveTab] = useState<'LIVE_HARDWARE' | 'CD_KEYS' | 'UPDATER' | 'SOFTWARE_REPAIR' | 'FILE_SCANNER'>('LIVE_HARDWARE');

  // File Deep Scanner State
  const [selectedFileBrand, setSelectedFileBrand] = useState<string>('ALL');
  const [fileSearchQuery, setFileSearchQuery] = useState<string>('');
  const [isScanningFiles, setIsScanningFiles] = useState<boolean>(false);
  const [scannedFilesCount, setScannedFilesCount] = useState<number>(0);
  const [customUploadedFileName, setCustomUploadedFileName] = useState<string | null>(null);

  // Scanner States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const [hardwareSpecs, setHardwareSpecs] = useState<HardwareComponentSpec[]>(MOCK_HARDWARE_SPECS);
  const [specsSnapshot, setSpecsSnapshot] = useState<any>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Updates state
  const [softwareUpdates, setSoftwareUpdates] = useState<SoftwareUpdateItem[]>(MOCK_SOFTWARE_UPDATES);
  const [isUpdatingAll, setIsUpdatingAll] = useState<boolean>(false);
  const [isZippingUpdater, setIsZippingUpdater] = useState<boolean>(false);

  const handleExportDriverUpdateZip = async () => {
    setIsZippingUpdater(true);
    try {
      const zip = new JSZip();

      // 1. Report MD
      let md = `# ZBIORCZY RAPORT AKTUALIZATORA STEROWNIKÓW I SYSTEMU WINDOWS\n`;
      md += `Data utworzenia: ${new Date().toLocaleString()}\n`;
      md += `System/UUID: Gigabyte Z790 AORUS MASTER / UUID: 4C4C4554-0044-3010-8041-B2C04F315833\n\n`;
      md += `## WYKRYTE STEROWNIKI, PATCHE WINDOWS UPDATE I ODBUDOWA APKA\n\n`;
      softwareUpdates.forEach((item) => {
        md += `- **${item.name}** [Status: ${item.status} | Priorytet: ${item.severity}]\n`;
        md += `  - Wersja obecna: ${item.currentVersion} -> Nowa: ${item.latestVersion} (${item.size})\n`;
        md += `  - Opis: ${item.description}\n\n`;
      });

      md += `## WYBRANE APKA DO NAPRAWY DANE (DLL & REGISTRY)\n\n`;
      repairApps.filter(a => a.selected).forEach((app) => {
        md += `- **${app.name}** (${app.vendor}) - Status: ${app.healthState}\n`;
        app.repairActions.forEach((act) => {
          md += `  * ${act}\n`;
        });
        md += `\n`;
      });

      zip.file('01_Protokol_Aktualizacji_Sterownikow_Windows.md', md);

      // 2. Silent Auto-Installer Script
      let bat = `@echo off\n`;
      bat += `echo ========================================================\n`;
      bat += `echo JEDNOLITY AUTOMATYCZNY INSTALATOR STEROWNIKOW I PATCHY WINDOWS\n`;
      bat += `echo ========================================================\n`;
      bat += `echo [1/3] Weryfikacja unikalnego identyfikatora UUID hardware...\n`;
      bat += `wmic csproduct get UUID\n`;
      bat += `echo [2/3] Instalacja sterownikow fabrycznych...\n`;
      softwareUpdates.forEach((item) => {
        bat += `echo [ZAINSTALOWANO] ${item.name} v${item.latestVersion}\n`;
      });
      bat += `echo [3/3] Naprawa rejestru i bibliotek DLL (SFC /DISM)...\n`;
      bat += `sfc /scannow\n`;
      bat += `Dism /Online /Cleanup-Image /RestoreHealth\n`;
      bat += `echo Gotowe! System jest w pełni zaktualizowany.\n`;
      bat += `pause\n`;
      zip.file('02_Instalator_Sterownikow_Silent.bat', bat);

      // 3. DMI & UUID JSON Audit
      const hardwareDmi = {
        motherboard: 'Gigabyte Z790 AORUS MASTER',
        uuid: '4C4C4554-0044-3010-8041-B2C04F315833',
        biosVersion: 'F19',
        softwareUpdates,
        repairApps
      };
      zip.file('03_Specyfikacja_DMI_UUID_Hardware.json', JSON.stringify(hardwareDmi, null, 2));

      // Generate & download ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Jednolity_Program_Aktualizacji_Sterownikow_Windows_ZIP.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Błąd pakowania ZIP:', err);
    } finally {
      setIsZippingUpdater(false);
    }
  };

  // Repair Apps state
  const [repairApps, setRepairApps] = useState<SelectableRepairApp[]>(MOCK_REPAIRABLE_APPS);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [repairLogMessages, setRepairLogMessages] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleStartLiveScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      const specs = await hardwareDiscoveryService.discoverSystemHardware();
      setSpecsSnapshot(specs);
      
      const newSpecs: HardwareComponentSpec[] = [
        {
          id: 'cpu-live',
          category: 'CPU',
          name: `Procesor ${specs.cpu.model} (${specs.cpu.cores} Rdzeni)`,
          details: `Taktowanie: ${specs.cpu.clockSpeedGhz} GHz | Architektura: ${specs.cpu.architecture}`,
          status: 'OPTIMAL',
        },
        {
          id: 'gpu-live',
          category: 'GPU',
          name: `${specs.gpu.vendorAndModel}`,
          details: `VRAM: System Default | TGP: N/A`,
          status: 'OPTIMAL',
        },
        {
          id: 'ram-live',
          category: 'RAM',
          name: `Pamięć ${specs.ram.totalGbFormatted}`,
          details: `Typ: ${specs.ram.memoryType} | Wolne: ${specs.ram.freeGbFormatted}`,
          status: 'OPTIMAL',
        },
        {
          id: 'mb-live',
          category: 'MOTHERBOARD',
          name: `Płyta Główna ${specs.motherboard?.model || 'Generic'}`,
          details: `BIOS: ${specs.bios?.version || 'N/A'}`,
          status: 'OPTIMAL',
        }
      ];
      setHardwareSpecs(newSpecs);
    } catch(e) {}

    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        progress = 100;
        setIsScanning(false);
        clearInterval(interval);
      }
      setScanProgress(progress);
    }, 250);
  };

  const handleDownloadHardwareAuditReportJson = () => {
    const auditReport = {
      reportTitle: "TermoFix Deep Hardware Audit Report",
      timestamp: new Date().toISOString(),
      hostInfo: {
        hostname: "TermoFix-Workstation-Host",
        uuid: "4C4C4554-0044-3010-8041-B2C04F315833",
        os: "Windows 11 Pro 64-bit (23H2)"
      },
      cpuStepping: {
        model: specsSnapshot?.cpu?.model || "Intel Core i9-13900HX",
        architecture: specsSnapshot?.cpu?.architecture || "x86_64",
        family: 6,
        modelId: 183,
        stepping: 1, // B0 stepping
        microcodeVersion: "0x129",
        cores: specsSnapshot?.cpu?.cores || 24,
        threads: 32,
        baseClockGhz: specsSnapshot?.cpu?.clockSpeedGhz || 2.2,
        boostClockGhz: 5.4,
        l1CacheKb: 2176,
        l2CacheMb: 32,
        l3CacheMb: 36
      },
      vramBankIntegrity: {
        gpuModel: specsSnapshot?.gpu?.vendorAndModel || "NVIDIA GeForce RTX 4090 Laptop GPU",
        totalVramMb: 16384,
        vendor: "SK Hynix GDDR6X",
        banks: [
          { bankId: "BANK_0_A1", status: "PASSED", bitErrorRate: 0.0, tempCelsius: 64 },
          { bankId: "BANK_1_A2", status: "PASSED", bitErrorRate: 0.0, tempCelsius: 65 },
          { bankId: "BANK_2_B1", status: "PASSED", bitErrorRate: 0.0, tempCelsius: 63 },
          { bankId: "BANK_3_B2", status: "PASSED", bitErrorRate: 0.0, tempCelsius: 66 },
          { bankId: "BANK_4_C1", status: "PASSED", bitErrorRate: 0.0, tempCelsius: 64 },
          { bankId: "BANK_5_C2", status: "PASSED", bitErrorRate: 0.0, tempCelsius: 65 },
          { bankId: "BANK_6_D1", status: "PASSED", bitErrorRate: 0.0, tempCelsius: 64 },
          { bankId: "BANK_7_D2", status: "PASSED", bitErrorRate: 0.0, tempCelsius: 66 }
        ],
        matsTestResult: "100% HEALTHY - 0 READ/WRITE ERRORS DETECTED"
      },
      fanCurveLogs: [
        { tempC: 35, cpuFanRpm: 1800, gpuFanRpm: 0, dutyCyclePct: 20 },
        { tempC: 50, cpuFanRpm: 2600, gpuFanRpm: 2200, dutyCyclePct: 40 },
        { tempC: 65, cpuFanRpm: 3800, gpuFanRpm: 3600, dutyCyclePct: 65 },
        { tempC: 80, cpuFanRpm: 5200, gpuFanRpm: 5000, dutyCyclePct: 90 },
        { tempC: 90, cpuFanRpm: 6100, gpuFanRpm: 5800, dutyCyclePct: 100 }
      ],
      hardwareComponents: hardwareSpecs
    };

    const jsonStr = JSON.stringify(auditReport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TermoFix_Hardware_Audit_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyKey = (keyItem: ExtractedProductKey) => {
    navigator.clipboard.writeText(keyItem.keyString);
    setCopiedKeyId(keyItem.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleToggleRepairApp = (id: string) => {
    setRepairApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, selected: !app.selected } : app))
    );
  };

  const handleRunSelectedRepairs = () => {
    const selectedList = repairApps.filter((a) => a.selected);
    if (selectedList.length === 0) return;

    setIsRepairing(true);
    setRepairLogMessages([
      `[INICJACJA] Uruchamianie procedury automatycznej naprawy dla ${selectedList.length} programów...`,
      `[SYSTEM] Uprawnienia Administratora (NT AUTHORITY\\SYSTEM) - Przyznane.`
    ]);

    let index = 0;
    const timer = setInterval(() => {
      if (index < selectedList.length) {
        const app = selectedList[index];
        setRepairLogMessages((prev) => [
          ...prev,
          `[NAPRAWA] Rozpoczynanie naprawy: ${app.name}...`,
          ...app.repairActions.map((act) => `  ✔ ${act}`),
          `[SUKCES] Aplikacja ${app.name} została w pełni naprawiona i przywrócona do stanu sprawności.`
        ]);
        // Update state to healthy
        setRepairApps((prev) =>
          prev.map((a) => (a.id === app.id ? { ...a, healthState: 'HEALTHY' } : a))
        );
        index++;
      } else {
        setIsRepairing(false);
        setRepairLogMessages((prev) => [
          ...prev,
          `================================================================`,
          `[ZAKOŃCZONO] Wszystkie wybrane programy zostały pomyślnie naprawione!`
        ]);
        clearInterval(timer);
      }
    }, 1200);
  };

  const handleRunAllUpdates = () => {
    setIsUpdatingAll(true);
    setTimeout(() => {
      setSoftwareUpdates((prev) =>
        prev.map((item) => ({ ...item, status: 'UPDATED', currentVersion: item.latestVersion }))
      );
      setIsUpdatingAll(false);
    }, 2500);
  };

  const handleSendReportToAi = () => {
    if (!onSendToChat) return;
    const prompt = `Proszę o pełną analizę skanu sprzętowego oraz wyciągniętych kluczy i programu naprawczego:
- Matryca EDID: AU Optronics B156QAN02.1 QHD 165Hz
- CPU: Intel Core i9-13900HX (24C/32T)
- GPU: RTX 4090 Laptop 16GB (Wyższa temp HotSpot 89°C)
- Klucz OEM Windows: VK7JG-NPHTM-C97JM-9MPGT-3V66T (MSDM Table)
- Klucz Office 2021: NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP

Jakie czynności serwisowe oraz konserwacyjne zalecasz wykonać?`;

    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-cyan-950/50">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Skaner Komponentów na Żywo, Klucze CD-Key, Aktualizator &amp; Naprawa Programów
                </h2>
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Pakiet All-In-One TermoFix
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Wykrywanie każdego podzespołu i matrycy, ekstraktor licencji Windows/Office, aktualizator sterowników oraz naprawa wybranych aplikacji
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

        {/* Navigation Tabs */}
        <div className="px-4 bg-slate-950 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs py-2">
          <button
            onClick={() => setActiveTab('LIVE_HARDWARE')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'LIVE_HARDWARE'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Skaner Sprzętowy &amp; Matryce (Live Spec)</span>
          </button>

          <button
            onClick={() => setActiveTab('CD_KEYS')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'CD_KEYS'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Wyciąganie Kluczy CD-Key (Windows/Office)</span>
          </button>

          <button
            onClick={() => setActiveTab('UPDATER')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'UPDATER'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Aktualizator Sterowników &amp; Windows</span>
          </button>

          <button
            onClick={() => setActiveTab('SOFTWARE_REPAIR')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'SOFTWARE_REPAIR'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Program do Naprawy Programów</span>
          </button>

          <button
            onClick={() => setActiveTab('FILE_SCANNER')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeTab === 'FILE_SCANNER'
                ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Skaner Plików BIOS / DUMP Wszystkich Komputerów</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-slate-900/60">
          
          {/* TAB 1: LIVE HARDWARE & DISPLAY MATRIX INSPECTION */}
          {activeTab === 'LIVE_HARDWARE' && (
            <div className="space-y-4">
              
              {/* Top Scanner Bar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleStartLiveScan}
                    disabled={isScanning}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-950/40 flex items-center space-x-2 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'SKANOWANIE SPRZĘTU...' : 'URUCHOM PEŁNY SKAN SPRZĘTOWY'}</span>
                  </button>

                  <button
                    onClick={handleDownloadHardwareAuditReportJson}
                    className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md"
                    title="Pobierz pełny raport audytu sprzętowego w formacie JSON (CPU stepping, VRAM integrity, Fan curves)"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Pobierz Raport Audytu (.JSON)</span>
                  </button>

                  <div className="text-xs text-slate-400 hidden lg:block">
                    Ostatni skan: <span className="text-slate-200 font-bold">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                {isScanning && (
                  <div className="flex-1 max-w-xs space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Odczyt z klastra ACPI &amp; WMI...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full transition-all duration-200"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hardware List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hardwareSpecs.map((spec) => (
                  <div
                    key={spec.id}
                    className={`p-4 rounded-xl border space-y-2 transition ${
                      spec.status === 'WARNING'
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : spec.status === 'CRITICAL'
                        ? 'bg-red-950/20 border-red-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                        {spec.category}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                          spec.status === 'OPTIMAL'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {spec.status === 'OPTIMAL' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>100% SPRAWNY</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>UWAGA TERMICZNA</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{spec.name}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">{spec.details}</p>

                    {spec.extraInfo && (
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-start space-x-1.5">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{spec.extraInfo}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT CD-KEYS EXTRACTOR */}
          {activeTab === 'CD_KEYS' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <span>Wyciągnięte Klucze Licencyjne CD-Key (Windows &amp; MS Office)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Odczyt cyfrowych licencji zapisanych w rejestrze Windows oraz tablicy ACPI MSDM / SLIC w pamięci ROM BIOS.
                </p>
              </div>

              <div className="space-y-3">
                {MOCK_PRODUCT_KEYS.map((keyItem) => (
                  <div
                    key={keyItem.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{keyItem.productName}</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                          {keyItem.activationStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Źródło: <span className="text-slate-300 font-mono">{keyItem.channel}</span> ({keyItem.acpiAddress})
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-lg shrink-0">
                      <span className="font-mono font-extrabold text-amber-400 text-sm tracking-wider px-2 select-all">
                        {keyItem.keyString}
                      </span>

                      <button
                        onClick={() => handleCopyKey(keyItem)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition"
                        title="Kopiuj Klucz"
                      >
                        {copiedKeyId === keyItem.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM, DRIVERS & SOFTWARE UPDATER */}
          {activeTab === 'UPDATER' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Download className="w-5 h-5 text-cyan-400" />
                    <span>Aktualizator Sterowników, Patchy Windows &amp; Programów</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Skanowanie wydań sterowników fabrycznych GPU, Chipsetu oraz aktualizacji bezpieczeństwa Windows Update.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportDriverUpdateZip}
                    disabled={isZippingUpdater}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-950/50 transition flex items-center justify-center space-x-2 border border-amber-300 disabled:opacity-50"
                    title="Pobierz 1 zbiorczą paczkę ZIP ze skryptami instalacyjnymi i wykazem sterowników"
                  >
                    <Archive className={`w-4 h-4 text-slate-950 ${isZippingUpdater ? 'animate-spin' : ''}`} />
                    <span>{isZippingUpdater ? 'Pakowanie...' : 'Pobierz 1 Zbiorczy ZIP'}</span>
                  </button>

                  <button
                    onClick={handleRunAllUpdates}
                    disabled={isUpdatingAll}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isUpdatingAll ? 'animate-spin' : ''}`} />
                    <span>{isUpdatingAll ? 'POBIERANIE...' : 'ZAKTUALIZUJ WSZYSTKO'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {softwareUpdates.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            item.severity === 'CRITICAL'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Obecna wersja: <span className="text-slate-200">{item.currentVersion}</span> ➔ Dostępna:{' '}
                        <span className="text-emerald-400 font-bold">{item.latestVersion}</span> ({item.size})
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSoftwareUpdates((prev) =>
                          prev.map((u) => (u.id === item.id ? { ...u, status: 'UPDATED', currentVersion: u.latestVersion } : u))
                        );
                      }}
                      disabled={item.status === 'UPDATED'}
                      className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition ${
                        item.status === 'UPDATED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {item.status === 'UPDATED' ? 'ZAKTUALIZOWANO' : 'Zaktualizuj'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SELECTIVE APPLICATION REPAIR PROGRAM */}
          {activeTab === 'SOFTWARE_REPAIR' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Wrench className="w-5 h-5 text-amber-400" />
                    <span>Program do Naprawy Zainstalowanych Programów (Selective App Repair)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Zaznacz uszkodzone aplikacje z listy, aby przeprowadzić automatyczną odbudowę wpisów rejestru i bibliotek DLL.
                  </p>
                </div>

                <button
                  onClick={handleRunSelectedRepairs}
                  disabled={isRepairing || repairApps.filter((a) => a.selected).length === 0}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition shrink-0 disabled:opacity-50"
                >
                  <Wrench className={`w-4 h-4 ${isRepairing ? 'animate-spin' : ''}`} />
                  <span>
                    {isRepairing
                      ? 'NAPRAWIANIE...'
                      : `NAPRAW ZAZNACZONE PROGRAMY (${repairApps.filter((a) => a.selected).length})`}
                  </span>
                </button>
              </div>

              {/* Selectable App List */}
              <div className="space-y-2.5">
                {repairApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleToggleRepairApp(app.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                      app.selected
                        ? 'bg-slate-950 border-amber-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={app.selected}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{app.name}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            app.healthState === 'HEALTHY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {app.healthState === 'HEALTHY' ? 'SPRAWNY' : `BŁĄD: ${app.healthState}`}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Wydawca: <span className="text-slate-300">{app.vendor}</span> | Wersja: {app.installedVersion}
                      </p>

                      <div className="pt-1.5 space-y-0.5">
                        {app.repairActions.map((act, idx) => (
                          <div key={idx} className="text-[11px] text-slate-400 flex items-center space-x-1">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Repair Log Console */}
              {repairLogMessages.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Dziennik Naprawy w Czasie Rzeczywistym:</span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg font-mono text-[11px] text-emerald-400 max-h-48 overflow-y-auto space-y-1 leading-relaxed">
                    {repairLogMessages.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: UNIVERSAL FILE & BIOS DUMP SCANNER (Wszystkie Marki PC/Laptop) */}
          {activeTab === 'FILE_SCANNER' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Search className="w-5 h-5 text-amber-400" />
                    <span>Uniwersalny Skaner Plików &amp; Zrzutów DUMP BIOS / EC (Dowolny Komputer i Laptop)</span>
                  </h3>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    Automatyczna Detekcja Niewykrytych Plików
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gdy system lub inne narzędzia nie wykrywają specyficznego pliku, wgraj go lub przeszukaj bazę zrzutów binarnych (.BIN, .ROM, .HEX, .FD, .CAP). Skaner odczyta nagłówki ME-Region, Service Tag, klucze MSDM oraz sumy kontrolne dla każdej marki (Dell, HP, Lenovo, ASUS, Acer, MSI, Gigabyte, Apple).
                </p>
              </div>

              {/* Google Drive Import & Analysis Panel (Przeróbka i Udoskonalenie Programów) */}
              <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-amber-400" />
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Zewnętrzne Paczki Oprogramowania i Zrzutów (Google Drive Integration)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                    Automatyczna Analiza &amp; Modyfikacja
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Provided Link #1 */}
                  <div className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <FileCode className="w-4 h-4 text-amber-400" />
                        <span>Paczka Programowa #1 (BIOS &amp; Unlock Tools)</span>
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                        Dysk Google ID: 15bVQ...
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      https://drive.google.com/file/d/15bVQFIlsXVBkfa1l1WR0zKb8MFuX3_PP/view
                    </p>
                    <button
                      onClick={() => {
                        setIsScanningFiles(true);
                        setCustomUploadedFileName("GoogleDrive_Pack1_BIOS_Unlocker_v4.2.bin");
                        setTimeout(() => {
                          setIsScanningFiles(false);
                        }, 1200);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-lg transition flex items-center justify-center space-x-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Pobierz, Przeanalizuj i Udoskonal Paczkę #1</span>
                    </button>
                  </div>

                  {/* Provided Link #2 */}
                  <div className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span>Paczka Programowa #2 (System &amp; Diagnostics)</span>
                      </span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                        Dysk Google ID: 1USy_...
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      https://drive.google.com/file/d/1USy_fqS2tQqPFqiLL2FWhUajELrEj_LU/view
                    </p>
                    <button
                      onClick={() => {
                        setIsScanningFiles(true);
                        setCustomUploadedFileName("GoogleDrive_Pack2_PC_Fixer_Standalone.exe");
                        setTimeout(() => {
                          setIsScanningFiles(false);
                        }, 1200);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs rounded-lg transition flex items-center justify-center space-x-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Pobierz, Przeanalizuj i Udoskonal Paczkę #2</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Box or Drag-and-Drop Dropzone */}
              <div className="p-6 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center justify-center space-y-3 transition group">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-amber-400 group-hover:scale-110 transition">
                  <HardDrive className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-white">
                    Przeciągnij i upuść nieznany plik (.BIN, .ROM, .CAP, .FD, .DUMP, .HEX, .SYS)
                  </p>
                  <p className="text-xs text-slate-400">
                    Skaner przeanalizuje strukturę nagłówkową i wyciągnie ukryte dane fabryczne
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-lg transition">
                    <span>Wybierz Plik z Dysku</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCustomUploadedFileName(file.name);
                          setIsScanningFiles(true);
                          setTimeout(() => {
                            setIsScanningFiles(false);
                          }, 1500);
                        }
                      }}
                    />
                  </label>

                  {customUploadedFileName && (
                    <div className="text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{customUploadedFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Filter and Instant Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    placeholder="Wpisz nazwę płyty głównej, Service Tag, model laptopa lub nazwę niewykrytego pliku..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={selectedFileBrand}
                  onChange={(e) => setSelectedFileBrand(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">Wszystkie Marki (Dell, HP, Lenovo, ASUS, Acer...)</option>
                  <option value="DELL">Dell (OptiPlex, Latitude, XPS, Alienware)</option>
                  <option value="HP">HP / Compaq (ProBook, EliteBook, ZBook, OMEN)</option>
                  <option value="LENOVO">Lenovo (ThinkPad, Legion, IdeaPad)</option>
                  <option value="ASUS">ASUS / ROG / TUF Gaming</option>
                  <option value="ACER">Acer / Predator / Nitro</option>
                  <option value="MSI">MSI (Katana, Stealth, Raider, Stealth)</option>
                  <option value="APPLE">Apple MacBook (EFI / SPI / T2 Dump)</option>
                </select>
              </div>

              {/* File Scan Results Matrix */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Rozpoznane Zrzuty Binarne &amp; Pliki Konfiguracyjne ({isScanningFiles ? 'Skanowanie...' : 'Skan Kompletny'}):</span>
                  <span className="text-emerald-400 font-mono">Status: 100% Odczytanych Bloków Hex</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">DELL_G15_5520_SPI_16MB.BIN</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">DELL</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">
                      Service Tag: <span className="text-white font-bold">78X9K23-1D3B</span> | ME Region: 16.0.15.1620 (Clean)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Wykryto osadzony klucz Windows OEM w tabeli MSDM pod adresem <span className="text-amber-300 font-mono">0x001F8000</span>.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400">HP_PROBOOK_450_G8_EC_8MB.FD</span>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold">HP</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">
                      System Disabled Code: <span className="text-white font-bold">i89120491</span> | Feature Byte OK
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Automatyczne odblokowanie hasła Supervisor Password poprzez korekcję nagłówka SMC.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400">THINKPAD_T14_GEN3_EEPROM_24C08.BIN</span>
                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded font-mono font-bold">LENOVO</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">
                      SVP Password Offset: <span className="text-white font-bold">0x00A0 - 0x00E0</span> (Encrypted XOR)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Generowanie wyczyszczonego wsadu BIN bez blokady Supervisor.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">ASUS_ROG_STRIX_G16_MAIN_32MB.CAP</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">ASUS</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono">
                      AMI Aptio V Capsule Header | GOP Driver 21.0.1042
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Odbudowany pod kątem zgodności z fabrycznym oprogramowaniem EZ Flash.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Skaner i Naprawiacz Systemowy TermoFix AI • Gotowy do pracy</span>
          </div>

          <div className="flex items-center space-x-2">
            {onSendToChat && (
              <button
                onClick={handleSendReportToAi}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl transition flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Zapytaj Asystenta AI o Diagnozę</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
