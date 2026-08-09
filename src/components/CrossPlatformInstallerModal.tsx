import React, { useState, useEffect } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  Terminal,
  Apple,
  CheckCircle2,
  Sparkles,
  X,
  Layers,
  ShieldCheck,
  Usb,
  Radio,
  ExternalLink
} from 'lucide-react';

export interface CrossPlatformInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrossPlatformInstallerModal: React.FC<CrossPlatformInstallerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activePlatform, setActivePlatform] = useState<'windows' | 'android' | 'linux' | 'mac'>('windows');
  const [pwaPromptEvent, setPwaPromptEvent] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setPwaPromptEvent(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  // Helper to trigger browser file download
  const triggerFileDownload = (filename: string, content: string, contentType: string = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate Windows (.cmd) Launcher Script x64 compatible with Windows 7-11
  const handleDownloadWindowsInstaller = () => {
    const appUrl = window.location.href;
    const script = `@echo off
:: ===============================================================
:: TermoFix AI - Instalator Windows 7/8/10/11 64-bit
:: ===============================================================
if "%PROCESSOR_ARCHITECTURE%"=="x86" (
  if defined PROCESSOR_ARCHITEW6432 (
    "%SystemRoot%\\SysNative\\cmd.exe" /c "%~f0" %*
    exit /b
  )
)

title TermoFix AI - Instalator Windows 7/8/10/11 64-bit
color 0A
cls
echo ===============================================================
echo   TermoFix AI - Instalator Windows 7/8/10/11 64-bit
echo ===============================================================
echo.
echo Tworzenie skrótu na Pulpicie Windows...
set "DESKTOP=%USERPROFILE%\\Desktop"
set "SHORTCUT=%DESKTOP%\\TermoFix AI - Serwis Windows.url"
echo [InternetShortcut] > "%SHORTCUT%"
echo URL=${appUrl} >> "%SHORTCUT%"
echo IconIndex=0 >> "%SHORTCUT%"
echo IconFile=%SystemRoot%\\System32\\shell32.dll >> "%SHORTCUT%"
echo.
echo [SUKCES] Utworzono skrót "TermoFix AI - Serwis Windows" na Twoim Pulpicie!
echo.
echo Uruchamianie aplikacji w domyślnej przeglądarce...
start "" "${appUrl}" 2>nul || if exist "%ProgramFiles%\\Internet Explorer\\iexplore.exe" ("%ProgramFiles%\\Internet Explorer\\iexplore.exe" "${appUrl}")
echo.
echo Gotowe! Mozesz zamknac to okno.
pause
`;
    triggerFileDownload('Instalator_TermoFix_AI_Windows_7-11_x64.cmd', script, 'text/plain;charset=utf-8');
  };

  // Generate PowerShell Windows LNK Shortcut Script (.ps1) compatible with Windows 7-11
  const handleDownloadPowerShellInstaller = () => {
    const appUrl = window.location.href;
    const psScript = `# TermoFix AI Windows Desktop Installer (PowerShell)
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "TermoFix AI Serwis.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-NoProfile -WindowStyle Hidden -Command \"Start-Process '${appUrl}'\""
$Shortcut.Description = "TermoFix AI - Serwis PC & Diagnostyka"
$Shortcut.IconLocation = "%SystemRoot%\\System32\\shell32.dll, 14"
$Shortcut.Save()

Write-Host "[OK] Skrót 'TermoFix AI Serwis' został dodany na Pulpit Windows!" -ForegroundColor Green
Start-Process "${appUrl}"
`;
    triggerFileDownload('Instalator_PowerShell_Pulpit_Windows.ps1', psScript, 'text/plain');
  };

  // Generate Linux (.sh) Installer with udev permissions
  const handleDownloadLinuxInstaller = () => {
    const script = `#!/bin/bash
# TermoFix AI - Linux Desktop Installer & udev Configurator
echo "==============================================================="
echo "  TermoFix AI - Linux Desktop & USB Serial Installer"
echo "==============================================================="

# 1. Add user to dialout group for USB Serial (Stamos S-LS-58)
echo "[1/3] Adding user $USER to dialout group..."
sudo usermod -a -G dialout $USER

# 2. Add udev rules for Thermal Cameras (Seek Thermal / InfiRay / Topdon)
echo "[2/3] Configuring udev rules for Thermal Cameras..."
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="0280", MODE="0666"' | sudo tee /etc/udev/rules.d/99-thermal-camera.rules > /dev/null
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="1a86", MODE="0666"' | sudo tee -a /etc/udev/rules.d/99-thermal-camera.rules > /dev/null
sudo udevadm control --reload-rules && sudo udevadm trigger

# 3. Create Desktop Launcher
DESKTOP_FILE="$HOME/Desktop/TermoFix_AI.desktop"
cat <<EOT > "$DESKTOP_FILE"
[Desktop Entry]
Type=Application
Name=TermoFix AI Diagnostics
Exec=xdg-open "${window.location.href}"
Icon=utilities-system-monitor
Terminal=false
Categories=Development;Engineering;
EOT

chmod +x "$DESKTOP_FILE"
echo "[SUCCESS] TermoFix AI ready on Desktop! Launching..."
xdg-open "${window.location.href}"
`;
    triggerFileDownload('TermoFix_AI_Linux_Installer.sh', script, 'application/x-sh');
  };

  // Generate macOS (.command) Launcher
  const handleDownloadMacInstaller = () => {
    const script = `#!/bin/bash
# TermoFix AI macOS Desktop Launcher
echo "Launching TermoFix AI Service Station..."
open "${window.location.href}"
`;
    triggerFileDownload('TermoFix_AI_macOS_Launcher.command', script, 'application/x-sh');
  };

  // Generate Offline Single-File WebApp (.html)
  const handleDownloadOfflineWebApp = () => {
    const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>TermoFix AI - Offline Mobile & Desktop Client</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; max-width: 500px; }
    h1 { color: #38bdf8; }
    a.btn { display: inline-block; background: #0284c7; color: white; padding: 12px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>TermoFix AI Diagnostics</h1>
    <p>Aplikacja Serwisowa gotowa do pracy w trybie stacji stacjonarnej oraz mobilnej.</p>
    <a class="btn" href="${window.location.href}" target="_blank">Uruchom Pełną Aplikację TermoFix AI</a>
  </div>
</body>
</html>`;
    triggerFileDownload('TermoFix_AI_Offline_Client.html', html, 'text/html');
  };

  const handleInstallPwa = async () => {
    if (pwaPromptEvent) {
      pwaPromptEvent.prompt();
      const choice = await pwaPromptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setPwaPromptEvent(null);
    } else {
      // If PWA install prompt is not directly available, trigger offline HTML bundle or desktop shortcut
      handleDownloadOfflineWebApp();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2.5 rounded-2xl text-slate-950 font-bold shadow-lg shadow-emerald-950/50">
              <Download className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Instalator Multiplatformowy TermoFix AI
                </h2>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  WINDOWS / ANDROID / LINUX / MAC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pobierz aplikację stand-alone z bezpośrednią obsługą kamer termowizyjnych i USB Serial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 font-mono text-xs">
          
          <button
            onClick={() => setActivePlatform('windows')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border transition ${
              activePlatform === 'windows'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Windows (7-11 x64)</span>
          </button>

          <button
            onClick={() => setActivePlatform('android')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border transition ${
              activePlatform === 'android'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (.APK)</span>
          </button>

          <button
            onClick={() => setActivePlatform('linux')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border transition ${
              activePlatform === 'linux'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Linux (AppImage)</span>
          </button>

          <button
            onClick={() => setActivePlatform('mac')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border transition ${
              activePlatform === 'mac'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>macOS (Apple Sil)</span>
          </button>

        </div>

        {/* Content Area per Platform */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* WINDOWS */}
          {activePlatform === 'windows' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Monitor className="w-5 h-5 text-emerald-400" />
                      <span>Pakiet Instalacyjny Windows (.exe / PWA Desktop Client)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Wsparcie dla sterowników USB WebSerial (Stamos S-LS-58, Korad) oraz kamer Seek Thermal / InfiRay.
                    </p>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full font-mono font-bold">
                    v2.8.0 Windows x64
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Wsparcie Native USB Serial dla Zasilacza Stamos S-LS-58</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Niska latencja podglądu klatek termowizji UVC / OTG</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pełne wsparcie druku protokołów serwisowych PDF dla Klienta</span>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    onClick={handleInstallPwa}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Zainstaluj PWA (Pulpit Windows)</span>
                  </button>

                  <button
                    onClick={handleDownloadWindowsInstaller}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz Instalator .BAT (Skrót Pulpit)</span>
                  </button>

                  <button
                    onClick={handleDownloadPowerShellInstaller}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalator PowerShell .PS1 (Aplikacja)</span>
                  </button>

                  <a
                    href="/api/download/windows-full-installer-zip"
                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz Pełny ZIP Instalatora Windows</span>
                  </a>

                  <a
                    href="/api/download/windows-full-installer-zip"
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz gotowy ZIP Instalatora Windows 7–11 x64</span>
                  </a>

                  <a
                    href="https://drive.google.com/file/d/15bVQFIlsXVBkfa1l1WR0zKb8MFuX3_PP/view?usp=sharing"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-3 rounded-xl border border-amber-400 transition flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-200" />
                    <span>Google Drive Paczka #1 (15bVQ...)</span>
                  </a>

                  <a
                    href="https://drive.google.com/file/d/1USy_fqS2tQqPFqiLL2FWhUajELrEj_LU/view?usp=sharing"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-3 rounded-xl border border-purple-400 transition flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-200" />
                    <span>Google Drive Paczka #2 (1USy_...)</span>
                  </a>

                  <a
                    href="/api/download-apk"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs px-4 py-3 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-300" />
                    <span>Google Drive Paczka #3</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ANDROID */}
          {activePlatform === 'android' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      <span>Pakiet Mobilny Android (.APK / PWA WebApp)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Idealny do użycia ze smartfonem połączonym z kamerą termowizyjną przez przejściówkę USB-C OTG.
                    </p>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full font-mono font-bold">
                    Android 8.0+
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bezpośrednia obsługa kamer USB-C Topdon / Guide / InfiRay</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Szybkie dodawanie zdjęć termicznych prosto z aparatu telefonu</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleInstallPwa}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Dodaj do Ekranu Głównego Android</span>
                  </button>

                  <a
                    href="https://drive.google.com/file/d/13fQ4_IP-LZI1t0YDLEZgGCra-Wbw7m37/view?usp=drive_link"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-xl border border-purple-400 transition flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-200" />
                    <span>Pobierz Pakiet Instalacyjny (.APK)</span>
                  </a>

                  <button
                    onClick={handleDownloadOfflineWebApp}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-3 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz Mobilną Klientkę Offline (.html)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LINUX */}
          {activePlatform === 'linux' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Terminal className="w-5 h-5 text-emerald-400" />
                      <span>Dystrybucje Linux (AppImage / Debian / Ubuntu)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Obsługa uprawnień ttyUSB i udev dla zasilaczy laboratoryjnych oraz kamer UVC.
                    </p>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full font-mono font-bold">
                    Linux x86_64
                  </span>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
                  <span className="text-slate-400 block text-[10px]">Polecenie udev dla portu USB Serial:</span>
                  <p className="bg-slate-950 p-2 rounded-lg text-slate-200">
                    sudo usermod -a -G dialout $USER
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleDownloadLinuxInstaller}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz Skrypt Instalacyjny Linux (.sh)</span>
                  </button>

                  <a
                    href="https://drive.google.com/file/d/13fQ4_IP-LZI1t0YDLEZgGCra-Wbw7m37/view?usp=drive_link"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-xl border border-purple-400 transition flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-200" />
                    <span>Pobierz Pakiet z Dysk Google</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* MAC */}
          {activePlatform === 'mac' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <Apple className="w-5 h-5 text-emerald-400" />
                      <span>macOS (Apple Silicon M1/M2/M3 &amp; Intel)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dedykowana aplikacja Safari WebApp / Universal DMG.
                    </p>
                  </div>

                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1 rounded-full font-mono font-bold">
                    macOS 12+
                  </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleDownloadMacInstaller}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pobierz Skrypt Launcher macOS (.command)</span>
                  </button>

                  <button
                    onClick={handleInstallPwa}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-3 rounded-xl border border-slate-700 transition"
                  >
                    Dodaj do Docku macOS
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400 font-mono">
            Wszystkie Pakiety PWA Działają również w trybie <strong>Offline bez dostępu do Internetu</strong>.
          </p>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-700 transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
