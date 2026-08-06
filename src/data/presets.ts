import { PresetCase } from '../types';

// Helper SVG Data URIs for realistic laptop motherboard & thermal camera views
export const MOCK_BOARD_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <rect width="800" height="500" fill="#0d2b1d" />
  <!-- Circuit Traces -->
  <path d="M 50 100 L 200 100 L 250 150 L 500 150 M 100 200 L 300 200 L 350 250 M 600 50 L 600 350 L 700 400" stroke="#1b5e3a" stroke-width="3" fill="none" opacity="0.6"/>
  <path d="M 120 400 L 220 300 L 420 300 L 450 350" stroke="#1b5e3a" stroke-width="4" fill="none" opacity="0.6"/>
  <!-- Mounting holes & Ports -->
  <rect x="20" y="20" width="40" height="80" fill="#2d3748" rx="4"/>
  <text x="25" y="65" font-family="monospace" font-size="12" fill="#a0aec0">USB-C</text>
  <rect x="20" y="120" width="40" height="60" fill="#2d3748" rx="4"/>
  <text x="25" y="155" font-family="monospace" font-size="12" fill="#a0aec0">HDMI</text>
  <rect x="20" y="200" width="40" height="100" fill="#2d3748" rx="4"/>
  <!-- CPU Socket area -->
  <rect x="280" y="120" width="180" height="180" fill="#1f2937" stroke="#4b5563" stroke-width="4" rx="8"/>
  <rect x="310" y="150" width="120" height="120" fill="#374151" rx="4"/>
  <text x="345" y="215" font-family="sans-serif" font-weight="bold" font-size="16" fill="#9ca3af">CPU DIE</text>
  <!-- RAM Slots -->
  <rect x="520" y="80" width="30" height="260" fill="#374151" stroke="#6b7280" rx="2"/>
  <rect x="570" y="80" width="30" height="260" fill="#374151" stroke="#6b7280" rx="2"/>
  <text x="532" y="360" font-family="monospace" font-size="12" fill="#9ca3af">DDR4_DIMM1</text>
  <!-- Power Section VRM MOSFETs & Inductors (PL coils) -->
  <g id="vrm-section">
    <rect x="200" y="130" width="35" height="25" fill="#111827" stroke="#ef4444" stroke-width="2" rx="2"/>
    <text x="205" y="147" font-family="monospace" font-size="10" fill="#f87171">PQ202</text>
    <rect x="200" y="165" width="35" height="25" fill="#111827" stroke="#ef4444" stroke-width="2" rx="2"/>
    <text x="205" y="182" font-family="monospace" font-size="10" fill="#f87171">PQ203</text>
    <rect x="200" y="200" width="35" height="25" fill="#111827" stroke="#3b82f6" stroke-width="1" rx="2"/>
    <text x="205" y="217" font-family="monospace" font-size="10" fill="#60a5fa">PQ204</text>
    <!-- Coils -->
    <rect x="245" y="130" width="25" height="30" fill="#4b5563" rx="2"/>
    <text x="247" y="150" font-family="monospace" font-size="9" fill="#e5e7eb">PL1</text>
    <rect x="245" y="170" width="25" height="30" fill="#4b5563" rx="2"/>
    <text x="247" y="190" font-family="monospace" font-size="9" fill="#e5e7eb">PL2</text>
  </g>
  <!-- Standby PWM Chip PU1 -->
  <rect x="180" y="320" width="45" height="45" fill="#111827" stroke="#eab308" stroke-width="2" rx="3"/>
  <text x="188" y="347" font-family="monospace" font-weight="bold" font-size="12" fill="#fde047">PU1</text>
  <text x="170" y="380" font-family="sans-serif" font-size="11" fill="#fef08a">3.3V/5V Standby</text>
  <!-- Bios IC -->
  <rect x="350" y="360" width="30" height="20" fill="#111827" stroke="#9ca3af" rx="2"/>
  <text x="352" y="374" font-family="monospace" font-size="9" fill="#e5e7eb">BIOS</text>
  <!-- Overlay Hotspot Heat Glow -->
  <circle cx="217" cy="142" r="60" fill="url(#hotspotGradient)" opacity="0.85"/>
  <defs>
    <radialGradient id="hotspotGradient">
      <stop offset="0%" stop-color="#ff0055" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#ff6600" stop-opacity="0.7"/>
      <stop offset="70%" stop-color="#ffcc00" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="217" cy="142" r="6" fill="#ffffff" stroke="#ff0000" stroke-width="2"/>
  <text x="230" y="125" font-family="monospace" font-weight="bold" font-size="14" fill="#ff4d4d">HOTSPOT: 94.8°C</text>
</svg>
`)}`;

export const MOCK_THERMAL_GPU_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <rect width="800" height="500" fill="#020617" />
  <!-- Thermal color background -->
  <rect width="800" height="500" fill="url(#thermalBg)" />
  <defs>
    <linearGradient id="thermalBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="40%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="gpuThermal" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#facc15"/>
      <stop offset="45%" stop-color="#f97316"/>
      <stop offset="70%" stop-color="#dc2626"/>
      <stop offset="90%" stop-color="#4c1d95"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <radialGradient id="vramThermal" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="50%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Board contour -->
  <rect x="100" y="60" width="600" height="380" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="6,6" rx="12"/>
  <text x="120" y="90" font-family="monospace" font-size="14" fill="#64748b">THERMAL CAMERA: FLIR E8-XT [IRONBOW]</text>
  <!-- GPU Core Thermal Heat -->
  <circle cx="400" cy="250" r="140" fill="url(#gpuThermal)" opacity="0.9"/>
  <circle cx="280" cy="200" r="45" fill="url(#vramThermal)" opacity="0.8"/>
  <!-- Crosshairs -->
  <line x1="380" y1="250" x2="420" y2="250" stroke="#000" stroke-width="2"/>
  <line x1="400" y1="230" x2="400" y2="270" stroke="#000" stroke-width="2"/>
  <rect x="410" y="215" width="130" height="30" fill="#000000" opacity="0.8" rx="4"/>
  <text x="418" y="235" font-family="monospace" font-weight="bold" font-size="14" fill="#00ffcc">Sp1: 89.2°C</text>

  <line x1="270" y1="200" x2="290" y2="200" stroke="#fff" stroke-width="1.5"/>
  <line x1="280" y1="190" x2="280" y2="210" stroke="#fff" stroke-width="1.5"/>
  <rect x="200" y="150" width="110" height="26" fill="#000000" opacity="0.8" rx="4"/>
  <text x="208" y="168" font-family="monospace" font-weight="bold" font-size="12" fill="#ffaa00">Sp2: 76.4°C</text>

  <!-- Scale Bar -->
  <rect x="730" y="80" width="20" height="320" rx="3" fill="url(#thermalScale)"/>
  <linearGradient id="thermalScale" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="25%" stop-color="#facc15"/>
    <stop offset="50%" stop-color="#f97316"/>
    <stop offset="75%" stop-color="#dc2626"/>
    <stop offset="100%" stop-color="#1e1b4b"/>
  </linearGradient>
  <text x="710" y="75" font-family="monospace" font-size="12" fill="#ffffff">95°C</text>
  <text x="710" y="415" font-family="monospace" font-size="12" fill="#94a3b8">22°C</text>
</svg>
`)}`;

export const MOCK_DISK_SMART_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <rect width="800" height="500" fill="#0f172a" />
  <rect x="40" y="30" width="720" height="440" fill="#1e293b" stroke="#334155" stroke-width="2" rx="12"/>
  <!-- Header -->
  <rect x="40" y="30" width="720" height="60" fill="#0f172a" rx="12"/>
  <text x="60" y="68" font-family="monospace" font-weight="bold" font-size="20" fill="#f87171">CRITICAL SMART ALERT: Samsung NVMe 980 PRO 1TB</text>
  <rect x="620" y="48" width="120" height="28" fill="#7f1d1d" rx="6"/>
  <text x="635" y="67" font-family="monospace" font-weight="bold" font-size="12" fill="#fca5a5">BAD SECTORS</text>

  <!-- Table mockup -->
  <text x="60" y="120" font-family="monospace" font-size="14" fill="#94a3b8">ID | Attribute Name | Current | Worst | Threshold | Raw Values (Hex/Dec)</text>
  <line x1="60" y1="130" x2="740" y2="130" stroke="#475569" stroke-width="1.5"/>

  <text x="60" y="160" font-family="monospace" font-size="13" fill="#f87171">05 | Reallocated Sectors Count | 035 | 035 | 036 | 0000000004F2 (1266 Bad Sectors!)</text>
  <text x="60" y="190" font-family="monospace" font-size="13" fill="#fbbf24">B8 | End-to-End Error | 098 | 098 | 099 | 000000000002 (IO Parity Fail)</text>
  <text x="60" y="220" font-family="monospace" font-size="13" fill="#f87171">C5 | Current Pending Sector | 001 | 001 | 000 | 0000000000E8 (232 Pending Unreadable)</text>
  <text x="60" y="250" font-family="monospace" font-size="13" fill="#e2e8f0">C6 | Offline Uncorrectable | 100 | 100 | 000 | 000000000000</text>
  <text x="60" y="280" font-family="monospace" font-size="13" fill="#38bdf8">09 | Power-On Hours | 088 | 088 | 000 | 000000002AC0 (10,944 Hours)</text>

  <!-- Visual gauge -->
  <rect x="60" y="320" width="680" height="120" fill="#090d16" stroke="#1e293b" rx="8"/>
  <text x="80" y="350" font-family="monospace" font-weight="bold" font-size="15" fill="#fca5a5">Stan Dysku: ZDEGRADOWANY (Zalecany natychmiastowy klon/kopia zapasowa)</text>
  <text x="80" y="380" font-family="monospace" font-size="12" fill="#cbd5e1">Błędy I/O spowalniają uruchamianie Windows. Próba odczytu zawiesza eksplorator (100% obciążenia dysku).</text>
  <text x="80" y="410" font-family="monospace" font-weight="bold" font-size="12" fill="#38bdf8">Użyj komendy: chkdsk C: /f /r lub wyklucz uszkodzone bloki narzędziem HDD Regenerator / DDRescue.</text>
</svg>
`)}`;

export const MOCK_WINDOWS_BSOD_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <rect width="800" height="500" fill="#0078d7" />
  <text x="80" y="140" font-family="sans-serif" font-size="90" fill="#ffffff">:(</text>
  <text x="80" y="220" font-family="sans-serif" font-weight="bold" font-size="22" fill="#ffffff">Komputer napotkał problem i należy go uruchomić ponownie.</text>
  <text x="80" y="255" font-family="sans-serif" font-size="16" fill="#e0f2fe">Zbieramy tylko informacje o błędach, a następnie komputer zostanie automatycznie uruchomiony ponownie. (0% ukończono)</text>

  <rect x="80" y="310" width="100" height="100" fill="#ffffff"/>
  <!-- QR Mock -->
  <rect x="90" y="320" width="30" height="30" fill="#000"/>
  <rect x="140" y="320" width="30" height="30" fill="#000"/>
  <rect x="90" y="370" width="30" height="30" fill="#000"/>

  <text x="200" y="335" font-family="sans-serif" font-size="13" fill="#ffffff">Aby uzyskać więcej informacji na temat tego problemu i możliwych rozwiązań, odwiedź stronę:</text>
  <text x="200" y="355" font-family="sans-serif" font-weight="bold" font-size="13" fill="#ffffff">https://windows.com/stopcode</text>
  <text x="200" y="385" font-family="sans-serif" font-size="12" fill="#bae6fd">Kod zatrzymania: INACCESSIBLE_BOOT_DEVICE</text>
  <text x="200" y="405" font-family="sans-serif" font-size="12" fill="#bae6fd">Co uległo awarii: vstorflt.sys / uszkodzony magazyn BCD rozruchu UEFI</text>
</svg>
`)}`;

export const PRESET_CASES: PresetCase[] = [
  {
    id: 'case-19v-short',
    title: 'Short Circuit on 19V Main Rail',
    titlePl: 'Krótkie spięcie na linii 19V (Brak reakcji / Próba zwarciowa)',
    category: 'laptop',
    description: 'Laptop Lenovo/ASUS completely dead. 19V rail shorted to ground (0.02 Ohm). Thermal camera shows MOSFET PQ202 glowing red at 94.8°C immediately upon connecting 1V/1A service power supply.',
    imageUrl: MOCK_BOARD_SVG,
    isThermal: true,
    defaultThermalData: {
      palette: 'ironbow',
      maxTemp: 94.8,
      minTemp: 24.2,
      hotspotLocation: 'Tranzystor PQ202 (High-Side MOSFET 19V)',
      spotPoints: [
        { id: 'sp1', x: 27, y: 28, tempC: 94.8, label: 'PQ202 High-Side' },
        { id: 'sp2', x: 48, y: 43, tempC: 38.5, label: 'CPU Die' },
        { id: 'sp3', x: 23, y: 68, tempC: 25.1, label: 'PU1 3.3V/5V' }
      ]
    },
    symptoms: [
      'Brak jakiejkolwiek reakcji na przycisk Power (No Power)',
      'Dioda ładowarki gaśnie po podłączeniu do gniazda laptopa',
      'Rezystancja linii 19V VIN do masy: 0.02 Ω (zwarcie całkowite)'
    ],
    suggestedPrompt: 'Mam laptopa z całkowitym zwarciem na linii 19V. Kamera termowizyjna pokazuje 94.8°C na tranzystorze PQ202. Jakie kroki podjąć, aby bezbiecznie wymienić element i wykluczyć uszkodzenie sterownika PWM?'
  },
  {
    id: 'case-disk-smart',
    title: 'SSD / HDD Bad Sectors & SMART Failure',
    titlePl: 'Uszkodzony Dysk SSD/HDD (Sektory Bad Sector / Błędy SMART 05/C5)',
    category: 'disk',
    description: 'Skanowanie dysku wykazało 1266 relokowanych sektorów (Bad Sectors) oraz uszkodzenia I/O. Windows zawiesza się na 100% obciążenia dysku.',
    imageUrl: MOCK_DISK_SMART_SVG,
    isThermal: false,
    defaultThermalData: {
      palette: 'ironbow',
      maxTemp: 52.0,
      minTemp: 22.0,
      hotspotLocation: 'Kontroler NVMe / Talerze HDD',
      spotPoints: [{ id: 'sp1', x: 50, y: 50, tempC: 52.0, label: 'NVMe Controller' }]
    },
    symptoms: [
      'Zawieszanie się eksploratora Windows i kursor ze spinning wheel',
      'Atrybut SMART 05 (Reallocated Sectors) i C5 (Current Pending) z ostrzeżeniem',
      'Błędy odczytu danych CRC I/O podczas kopiowania plików'
    ],
    suggestedPrompt: 'Skaner SMART wykazał 1266 bad sektorów na dysku C. System bardzo wolno reaguje. Jakich komend chkdsk / sfc / DISM użyć, oraz jak wykonać bezpieczny klon dysku na nowy SSD NVMe?'
  },
  {
    id: 'case-windows-boot',
    title: 'Windows Boot BSOD & Corrupted System Files',
    titlePl: 'Błąd Rozruchu Windows (BSOD Inaccessible Boot Device / Uszkodzone Pliki)',
    category: 'windows',
    description: 'Niebieski ekran śmierci BSOD. Windows nie uruchamia się po aktualizacji. Uszkodzony magazyn BCD rozruchu EFI oraz brakujące pliki systemowe DLL.',
    imageUrl: MOCK_WINDOWS_BSOD_SVG,
    isThermal: false,
    defaultThermalData: {
      palette: 'ironbow',
      maxTemp: 35.0,
      minTemp: 20.0,
      hotspotLocation: 'Partycja EFI System',
      spotPoints: []
    },
    symptoms: [
      'Niebieski ekran BSOD: INACCESSIBLE_BOOT_DEVICE lub CRITICAL_PROCESS_DIED',
      'Pętla automatycznej naprawy Windows (Automatic Repair Loop)',
      'Brak dostępu do pulpitów i uszkodzone pliki systemowe Windows'
    ],
    suggestedPrompt: 'Windows nie uruchamia się i wyświetla błąd BSOD INACCESSIBLE_BOOT_DEVICE po aktualizacji. Jak krok po kroku naprawić sektor bootloader BCD komendami bootrec, bcdboot oraz przeskanować SFC i DISM w wierszu poleceń WinRE?'
  },
  {
    id: 'case-gpu-vrm',
    title: 'GPU VRM Thermal Throttling & Artifacts',
    titlePl: 'Przegrzewanie sekcji zasilania GPU (Wyłączanie w grach / Artefakty)',
    category: 'gpu',
    description: 'Nvidia RTX 3070 card crashing under load. Thermal scan reveals VRAM Power Controller and Phase 1 DrMOS IC hitting 89.2°C within 10 seconds.',
    imageUrl: MOCK_THERMAL_GPU_SVG,
    isThermal: true,
    defaultThermalData: {
      palette: 'lava',
      maxTemp: 89.2,
      minTemp: 22.0,
      hotspotLocation: 'GPU VCORE Core Phase 1 (DrMOS)',
      spotPoints: [
        { id: 'sp1', x: 50, y: 50, tempC: 89.2, label: 'GPU Core / VRM' },
        { id: 'sp2', x: 35, y: 40, tempC: 76.4, label: 'VRAM Chip 2' }
      ]
    },
    symptoms: [
      'Karta wyłącza ekran pod obciążeniem FurMark / Gry',
      'Artefakty obrazu (szachownica / kreski) lub błąd drivera Nvidia Code 43',
      'Temp. na czujniku HotSpot GPU przekracza 105°C'
    ],
    suggestedPrompt: 'Moja karta graficzna wyłącza się w grach i ma artefakty. Analiza termowizyjna wykazuje 89.2°C na pierwszej fazie zasilania GPU i 76.4°C na kostce VRAM. Jak wymienić termopady i przetestować pamięć VRAM programem MATS/MODS?'
  }
];

export const MULTIMETER_GUIDE = [
  {
    rail: '19V / 20V VIN (Main Power Rail)',
    expected: '19.0V - 20.0V',
    diodeReading: '> 0.400 V (300k+ Ω)',
    commonCause: 'Uszkodzony klucz wejściowy MOSFET, przebity kondensator ceramiczny SMD.'
  },
  {
    rail: '+3.3V ALW / LDO (Always On Power)',
    expected: '3.3V',
    diodeReading: '> 0.300 V (10k+ Ω)',
    commonCause: 'Zwarty układ KBC (Super I/O), uszkodzony chip BIOS, przetwornica stanów gotowości.'
  },
  {
    rail: '+5V ALW (Always On Power)',
    expected: '5.0V',
    diodeReading: '> 0.350 V (20k+ Ω)',
    commonCause: 'Zwarte gniazdo USB, przebity kontroler zasilania.'
  },
  {
    rail: '+VCCCORE (CPU Core Voltage)',
    expected: '0.8V - 1.2V',
    diodeReading: '0.010 V - 0.050 V (5-20 Ω)',
    commonCause: 'Niska oporność jest NORMALNA dla CPU! Zwarcie jest poniżej 1 Ω.'
  },
  {
    rail: '+1.35V / +1.2V VDDQ (RAM Voltage)',
    expected: '1.2V - 1.35V',
    diodeReading: '> 0.200 V (100-300 Ω)',
    commonCause: 'Uszkodzony moduł pamięci RAM lub pod kontrolerem w CPU.'
  }
];
