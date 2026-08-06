const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const importDesktopLauncher = `import { DesktopLauncher } from './components/DesktopLauncher';\n`;
if (!content.includes('DesktopLauncher')) {
  content = content.replace(`import { Header } from './components/Header';`, `${importDesktopLauncher}`);
}

const launcherApps = `
  const desktopApps = [
    { id: 'multimeter', name: 'Multimetr & Oscyloskop', icon: <Gauge className="w-8 h-8 text-white" />, color: 'from-blue-500 to-cyan-600', onClick: () => setIsMultimeterOpen(true) },
    { id: 'presets', name: 'Baza Usterek', icon: <Archive className="w-8 h-8 text-white" />, color: 'from-indigo-500 to-purple-600', onClick: () => setIsPresetsOpen(true) },
    { id: 'windows-repair', name: 'Windows Repair', icon: <Terminal className="w-8 h-8 text-white" />, color: 'from-sky-500 to-blue-600', onClick: () => setIsWindowsRepairOpen(true) },
    { id: 'disk-diag', name: 'Diagnostyka Dysków', icon: <HardDrive className="w-8 h-8 text-white" />, color: 'from-slate-500 to-slate-700', onClick: () => setIsDiskDiagnosticsOpen(true) },
    { id: 'gpu-diag', name: 'Diagnostyka GPU', icon: <Monitor className="w-8 h-8 text-white" />, color: 'from-red-500 to-orange-600', onClick: () => setIsGpuDiagnosticsOpen(true) },
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
    { id: 'mats-mods', name: 'MATS/MODS VRAM', icon: <Cpu className="w-8 h-8 text-white" />, color: 'from-green-600 to-emerald-700', onClick: () => setIsMatsModsOpen(true) },
    { id: 'tutorials', name: 'Video Poradniki', icon: <PlayCircle className="w-8 h-8 text-white" />, color: 'from-red-500 to-red-600', onClick: () => setIsInstructionVideoTutorialsOpen(true) },
    { id: 'radio', name: 'Serwisowe Radio MP3', icon: <Radio className="w-8 h-8 text-white" />, color: 'from-purple-500 to-fuchsia-600', onClick: () => setIsGlobalRadioMp3Open(true) },
    { id: 'exe-builder', name: 'Kompilator EXE', icon: <Terminal className="w-8 h-8 text-white" />, color: 'from-slate-800 to-black', onClick: () => setIsExeModalOpen(true) },
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
    { id: 'bitlocker', name: 'BitLocker Cracker', icon: <Key className="w-8 h-8 text-white" />, color: 'from-red-800 to-red-900', onClick: () => setIsBitLockerOpen(true) },
    { id: 'duplicate-finder', name: 'Wyszukiwarka Duplikatów', icon: <Search className="w-8 h-8 text-white" />, color: 'from-teal-500 to-cyan-600', onClick: () => setIsDuplicateFinderOpen(true) },
    { id: 'spell-checker', name: 'Korekta Pisowni AI', icon: <PenTool className="w-8 h-8 text-white" />, color: 'from-indigo-400 to-purple-500', onClick: () => setIsSpellCheckerOpen(true) },
    { id: 'batch-archive', name: 'Archiwizator Batch', icon: <Archive className="w-8 h-8 text-white" />, color: 'from-yellow-600 to-amber-700', onClick: () => setIsBatchArchiveOpen(true) },
    { id: 'mobile-sms', name: 'Bramka SMS', icon: <Smartphone className="w-8 h-8 text-white" />, color: 'from-green-500 to-emerald-600', onClick: () => setIsMobileSmsAppOpen(true) },
  ];
`;

content = content.replace(/const handleResetChat = \(\) => \{/, `${launcherApps}\n  const handleResetChat = () => {`);

// Replace Header and the 2 columns with DesktopLauncher and Modals
const headerRegex = /<Header[\s\S]*?onOpenSystemUpdateLog=\{[^}]*\}[\s\S]*?\/>/;
content = content.replace(headerRegex, `<DesktopLauncher apps={desktopApps} />`);

// Remove the left column and right column grid entirely if the user wants just the desktop
const mainContentRegex = /<div className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

// We will keep ChatInterface accessible via a button or floating? 
// The user asked for "only on desktop all exes list click and I launch". 
// I will just replace the main flex-1 div with DesktopLauncher.
content = content.replace(mainContentRegex, ``);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log("App.tsx patched for DesktopLauncher");
