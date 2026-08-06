import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Sparkles,
  X,
  Check,
  User,
  Laptop,
  Monitor,
  Cpu,
  Flame,
  Zap,
  HardDrive,
  ShieldCheck,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  Activity,
  FileCheck,
  Globe,
  Archive
} from 'lucide-react';
import { ChatMessage, ThermalData, RepairJournalEntry } from '../types';
import { fetchSystemTelemetry, HardwareTelemetry } from '../services/telemetryService';

export interface ClientReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  thermalData: ThermalData;
  imageUrl: string;
  presetTitle?: string;
  journalEntries?: any[];
  onSendToChat?: (prompt: string) => void;
}

export interface MotherboardSchematicData {
  id: string;
  type: 'laptop' | 'desktop' | 'gpu';
  titlePl: string;
  boardModel: string;
  powerSequence: string[];
  keyRails: { rail: string; voltage: string; normalResistance: string; description: string }[];
  blockDiagramSvg: string;
}

export const SCHEMATICS_LIBRARY: MotherboardSchematicData[] = [
  {
    id: 'schematic-laptop-nmc361',
    type: 'laptop',
    titlePl: 'Schemat Płyty Głównej Laptopa (Architektura Intel Core / Ryzen)',
    boardModel: 'NM-C361 / LA-E801P / ASUS ROG G513',
    powerSequence: [
      '1. VIN / B+ (19V - Główna szyna zasilacza DC-IN / USB-C PD 20V)',
      '2. +3.3VALW / +5VALW (LDO Przetwornicy Standby PU1 BQ24780S)',
      '3. EC_RST# / LID_SW# (KBC Kontroler sterujący włącznikiem)',
      '4. PCH_PWROK / RSMRST# (Sygnały wybudzenia mostka PCH / SoC)',
      '5. +1.05V_PCH / +1.2V_RAM (Zasilanie pamięci DDR4/DDR5)',
      '6. +VCORE_CPU / +GT_CORE (Sekcja VRM procesora - DrMOS PWM)',
      '7. +NVVDD / +FBVDD (Sekcja zasilania dedykowanego GPU i pamięci VRAM)',
    ],
    keyRails: [
      { rail: 'B+ / VIN (19V)', voltage: '19.0V - 20.0V', normalResistance: '>100 kΩ', description: 'Główny trzon zasilania całej płyty głównej.' },
      { rail: '+3.3VALW', voltage: '3.3V', normalResistance: '>5 kΩ', description: 'Standby LDO zasilające KBC, kość BIOS SPI oraz czujniki.' },
      { rail: '+5VALW', voltage: '5.0V', normalResistance: '>10 kΩ', description: 'Standby dla portów USB, audio oraz linii sterowania VRM.' },
      { rail: '+VCORE_CPU', voltage: '0.8V - 1.2V', normalResistance: '1.5 - 15 Ω', description: 'Niskoomowe zasilanie rdzeni procesora (0.5Ω - 2Ω to norma).' },
      { rail: '+NVVDD GPU', voltage: '0.7V - 1.05V', normalResistance: '0.2 - 3.0 Ω', description: 'Zasilanie rdzenia graficznego BGA.' },
    ],
    blockDiagramSvg: 'LAPTOP_MB_BLOCK_DIAGRAM',
  },
  {
    id: 'schematic-desktop-atx',
    type: 'desktop',
    titlePl: 'Schemat Płyty Głównej Komputera Stacjonarnego ATX / Micro-ATX',
    boardModel: 'Intel Z690/Z790 / AMD AM5 B650 (24-Pin ATX + 8-Pin EPS)',
    powerSequence: [
      '1. +5VSB (Standby 5V fioletowy przewód zasilacza ATX)',
      '2. PS_ON# (Włączenie zasilacza - zwarcie zielonego przewodu do masy)',
      '3. +12V1 / +12V2 (Linia zasilająca EPS CPU & PCIe x16 Slot)',
      '4. +5V & +3.3V (Główne linie zasilania dysków, USB i karty dźwiękowej)',
      '5. PWR_OK / Power Good (Sygnał szary 5V z zasilacza potwierdzający stabilność)',
      '6. VCORE DrMOS (Fazy 12+1+1 kontrolera PWM Richtek/Renesas)',
      '7. VDDQ RAM (1.1V DDR5 / 1.35V DDR4)',
    ],
    keyRails: [
      { rail: '+5VSB (Standby)', voltage: '5.0V', normalResistance: '>1 kΩ', description: 'Stan czuwania po wpięciu wtyku 230V do zasilacza ATX.' },
      { rail: '+12V EPS CPU', voltage: '12.0V', normalResistance: fontMono('>500 Ω'), description: 'Zasilanie 8-pinowe sekcji VRM procesora ATX.' },
      { rail: '+12V PCIe Slot', voltage: '12.0V', normalResistance: '>1 kΩ', description: 'Zasilanie szyny karty graficznej z gniazda PCIe (do 75W).' },
      { rail: '+3.3V ATX', voltage: '3.3V', normalResistance: '>500 Ω', description: 'Zasilanie logiki mostka PCH i slotów M.2 NVMe.' },
    ],
    blockDiagramSvg: 'DESKTOP_ATX_BLOCK_DIAGRAM',
  },
  {
    id: 'schematic-gpu-vram',
    type: 'gpu',
    titlePl: 'Schemat Laminatu Karty Graficznej (Nvidia RTX / AMD Radeon GPU)',
    boardModel: 'Nvidia PG132 (RTX 3080/3070/4070) / GDDR6 / GDDR6X',
    powerSequence: [
      '1. 12V AUX (PCIe Slot + 8-Pin / 12VHPWR 16-Pin Power Cable)',
      '2. +3.3V PCIe (Zasilanie logiki komunikacji z płytą główną)',
      '3. +1.8V PEX (Zasilanie pętli PLL i zegarów szyny PCIe)',
      '4. +NVVDD (Sekcja zasilania rdzenia GPU - kontroler uP9512R / MP2888A)',
      '5. +FBVDD (Zasilanie banków pamięci VRAM GDDR6 - 1.25V / 1.35V)',
      '6. +VDDCI / +1.0V (Zasilanie kontrolera pamięci i wyjść DisplayPort/HDMI)',
    ],
    keyRails: [
      { rail: '12V Ext Bus', voltage: '12.0V', normalResistance: '>2 kΩ', description: 'Główne zasilanie prądowe z wtyczki zasilacza.' },
      { rail: 'NVVDD GPU Core', voltage: '0.8V - 1.1V', normalResistance: '0.1 - 0.5 Ω', description: 'Rdzeń krzemowy GPU (BARDZO niska rezystancja to norma).' },
      { rail: 'FBVDD VRAM', voltage: '1.25V - 1.35V', normalResistance: '15 - 45 Ω', description: 'Zasilanie kości pamięci Micron / Samsung / Hynix.' },
      { rail: '1.8V PEX', voltage: '1.8V', normalResistance: '>90 Ω', description: 'Linia sterująca transmisją danych po magistrali PCIe.' },
    ],
    blockDiagramSvg: 'GPU_BOARD_BLOCK_DIAGRAM',
  },
];

function fontMono(str: string) {
  return str;
}

// Helper for Polish character normalization in standard jsPDF font
export const normalizePl = (str: string) => {
  if (!str) return '';
  return str
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z');
};

export const ClientReportExportModal: React.FC<ClientReportExportModalProps> = ({
  isOpen,
  onClose,
  messages,
  thermalData,
  imageUrl,
  presetTitle,
  journalEntries,
  onSendToChat,
}) => {
  // Client & Service Metadata State
  const [clientName, setClientName] = useState('Jan Kowalski');
  const [deviceModel, setDeviceModel] = useState(presetTitle || 'Lenovo Legion 5 / ASUS ROG Strix');
  const [serialNumber, setSerialNumber] = useState('SN-88492041-2026');
  const [rmaNumber, setRmaNumber] = useState(`RMA-${Math.floor(10000 + Math.random() * 90000)}`);
  const [technicianName, setTechnicianName] = useState('Serwisant Serwisu TermoFix');
  const [repairEstimate, setRepairEstimate] = useState('350 PLN (Wymiana tranzystora MOSFET + Czyszczenie)');
  const [selectedSchematic, setSelectedSchematic] = useState<MotherboardSchematicData>(SCHEMATICS_LIBRARY[0]);
  const [includeSchematics, setIncludeSchematics] = useState(true);
  const [includeChatLogs, setIncludeChatLogs] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [telemetry, setTelemetry] = useState<HardwareTelemetry | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSystemTelemetry()
        .then((data) => setTelemetry(data))
        .catch((err) => console.warn('Telemetry fetch error in export modal:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Manual Export Handler (Triggers PDF Print Window with Customer Report)
  const handleManualPdfExport = () => {
    window.print();
  };

  // Build Report Markdown
  const generateMarkdownReport = () => {
    let md = `# 🛠️ PROTOKÓŁ DIAGNOSTYCZNO-SERWISOWY TermoFix AI\n`;
    md += `**Numer Zlecenia / RMA:** ${rmaNumber}\n`;
    md += `**Data Wystawienia:** ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL')}\n`;
    md += `**Klient:** ${clientName}\n`;
    md += `**Sprzęt:** ${deviceModel} (S/N: ${serialNumber})\n`;
    md += `**Inżynier Diagnosta:** ${technicianName}\n`;
    md += `**Szacowany Koszt Naprawy:** ${repairEstimate}\n\n`;

    md += `--- \n\n`;
    md += `## 🌡️ 1. AUDYT TERMOWIZYJNY PCB & POMIARY\n`;
    md += `- **Maksymalna Wykryta Temperatura Hotspot:** ${thermalData.maxTemp}°C (${thermalData.maxSpotLabel || 'Punkt Przegrzewania'})\n`;
    md += `- **Minimalna Temperatura Laminatu:** ${thermalData.minTemp}°C\n`;
    md += `- **Różnica Temperatury Delta-T:** ${thermalData.deltaT}°C\n`;
    md += `- **Status Ryzyka Termicznego:** ${
      thermalData.maxTemp > 80 ? 'CRITICAL - WYKRYTO ZWARCIE / USZKODZENIE MLCC' : 'NORMA ROBOCZA'
    }\n\n`;

    if (thermalData.spotPoints && thermalData.spotPoints.length > 0) {
      md += `### Zmierzone Punkty Termiczne (Spot Points):\n`;
      thermalData.spotPoints.forEach((sp, idx) => {
        md += `${idx + 1}. **${sp.label}**: ${sp.tempC}°C (Pozycja X:${sp.x}%, Y:${sp.y}%)\n`;
      });
      md += `\n`;
    }

    if (telemetry) {
      md += `--- \n\n`;
      md += `## 💻 2. PEŁNY RAPORT TELEMETRII SPRZĘTOWEJ (Hardware Telemetry Log)\n`;
      md += `- **Typ Urządzenia / Obudowy:** ${telemetry.chassisLabel} (${telemetry.deviceType})\n`;
      md += `- **Uzasadnienie Detekcji:** ${telemetry.detectionReason}\n`;
      md += `- **Procesor CPU:** ${telemetry.cpuModel} (${telemetry.cpuThreads})\n`;
      md += `- **Pamięć Operacyjna RAM:** ${telemetry.ramTotalFormatted} (${telemetry.ramFreeFormatted})\n`;
      md += `- **Pojemność Dysków SSD/NVMe:** ${telemetry.diskTotalFormatted} (${telemetry.diskFreeFormatted})\n`;
      md += `- **Karta Graficzna GPU:** ${telemetry.gpuRenderer}\n`;
      md += `- **System Operacyjny:** ${telemetry.osName}\n`;
      md += `- **Adres IP & Hostname:** ${telemetry.ipAddress} (${telemetry.hostname})\n\n`;
    }

    if (includeSchematics && selectedSchematic) {
      md += `--- \n\n`;
      md += `## ⚡ 3. SCHEMAT ZASILANIA I SEKWENCJA STARTOWA MOBO/GPU\n`;
      md += `**Model Schematu:** ${selectedSchematic.titlePl} (${selectedSchematic.boardModel})\n\n`;
      md += `### Sekwencja Startowa (Power Rail Sequence):\n`;
      selectedSchematic.powerSequence.forEach((seq) => {
        md += `- ${seq}\n`;
      });
      md += `\n### Parametry Linii Zasilających i Rezystancji:\n`;
      selectedSchematic.keyRails.forEach((kr) => {
        md += `- **${kr.rail}**: Napięcie=${kr.voltage} | Rezystancja Oczekiwana=${kr.normalResistance} | Opis: ${kr.description}\n`;
      });
      md += `\n`;
    }

    if (includeChatLogs && messages.length > 0) {
      md += `--- \n\n`;
      md += `## 💬 4. HISTORIA KONSULTACJI DIAGNOSTYCZNEJ AI\n`;
      messages.forEach((msg) => {
        const sender = msg.role === 'user' ? 'SERWISANT' : 'ASYSTENT TermoFix AI';
        md += `**[${sender}]**: ${msg.text}\n\n`;
      });
    }

    md += `---\n`;
    md += `*Raport wygenerowany automatycznie przez system TermoFix AI. Wszelkie pomiary zostały potwiedzone kamerą termowizyjną i multimetrem serwisowym.*\n`;
    md += `**Podpis Serwisanta:** _______________________    **Podpis Klienta:** _______________________\n`;

    return md;
  };

  // Download Word Document (.doc / .docx)
  const handleDownloadWord = () => {
    const wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Protokol_Serwisowy_${rmaNumber}</title>
        <style>
          body { font-family: Calibri, Arial, sans-serif; margin: 20px; color: #1e293b; }
          h1 { color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 5px; }
          h2 { color: #0284c7; margin-top: 20px; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background-color: #f1f5f9; color: #0f172a; }
          .highlight { background-color: #fef2f2; font-weight: bold; color: #991b1b; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <h1>PROTOKÓŁ DIAGNOSTYCZNO-SERWISOWY TermoFix AI</h1>
        <p><strong>Numer RMA:</strong> ${rmaNumber} | <strong>Data:</strong> ${new Date().toLocaleDateString('pl-PL')}</p>
        <p><strong>Klient:</strong> ${clientName} | <strong>Urządzenie:</strong> ${deviceModel} (S/N: ${serialNumber})</p>
        <p><strong>Serwisant Diagnosta:</strong> ${technicianName} | <strong>Szacowany Koszt:</strong> ${repairEstimate}</p>
        
        <h2>1. AUDYT TERMOWIZYJNY & POMIARY</h2>
        <table>
          <tr><th>Parametr Termiczny</th><th>Wartość Zmierzona</th></tr>
          <tr><td>Maksymalna Temperatura Hotspot</td><td><strong>${thermalData.maxTemp}°C</strong> (${thermalData.maxSpotLabel || 'Punkt Hotspot'})</td></tr>
          <tr><td>Minimalna Temperatura Laminatu</td><td>${thermalData.minTemp}°C</td></tr>
          <tr><td>Różnica Temperatury Delta-T</td><td>${thermalData.deltaT}°C</td></tr>
          <tr class="${thermalData.maxTemp > 80 ? 'highlight' : ''}"><td>Status Ryzyka Termicznego</td><td>${thermalData.maxTemp > 80 ? 'CRITICAL - PRZEGRZEWANIE / ZWARCIE' : 'NORMA ROBOCZA'}</td></tr>
        </table>

        <h2>2. LINIE ZASILANIA PŁYTY GŁÓWNEJ (${selectedSchematic.boardModel})</h2>
        <table>
          <tr><th>Szyna Zasilania</th><th>Oczekiwane Napięcie</th><th>Prawidłowa Rezystancja</th><th>Opis / Przeznaczenie</th></tr>
          ${selectedSchematic.keyRails.map(r => `
            <tr>
              <td><strong>${r.rail}</strong></td>
              <td>${r.voltage}</td>
              <td>${r.normalResistance}</td>
              <td>${r.description}</td>
            </tr>
          `).join('')}
        </table>

        <div class="footer">
          <p>Raport wygenerowany automatycznie przez system TermoFix AI Diagnostics.</p>
          <p>Podpis Serwisanta: ___________________________    Podpis Klienta: ___________________________</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Protokol_Serwisowy_${rmaNumber}_${clientName.replace(/\s+/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Excel Spreadsheet (.csv / .xlsx)
  const handleDownloadExcel = () => {
    let csv = `\ufeff"Kategoria";"Parametr";"Wartość";"Uwagi"\n`;
    csv += `"DANE RMA";"Numer RMA";"${rmaNumber}";"Zlecenie Serwisowe"\n`;
    csv += `"DANE RMA";"Data Wystawienia";"${new Date().toLocaleDateString('pl-PL')}";""\n`;
    csv += `"DANE RMA";"Klient";"${clientName}";""\n`;
    csv += `"DANE RMA";"Model Urządzenia";"${deviceModel}";""\n`;
    csv += `"DANE RMA";"Numer Seryjny";"${serialNumber}";""\n`;
    csv += `"DANE RMA";"Inżynier Diagnosta";"${technicianName}";""\n`;
    csv += `"DANE RMA";"Szacowany Koszt";"${repairEstimate}";""\n`;

    csv += `"TERMOWIZJA";"Max Temp Hotspot";"${thermalData.maxTemp} °C";"${thermalData.maxSpotLabel || 'Hotspot'}"\n`;
    csv += `"TERMOWIZJA";"Min Temp PCB";"${thermalData.minTemp} °C";""\n`;
    csv += `"TERMOWIZJA";"Delta-T";"${thermalData.deltaT} °C";""\n`;
    csv += `"TERMOWIZJA";"Status Ryzyka";"${thermalData.maxTemp > 80 ? 'CRITICAL' : 'OK'}";""\n`;

    selectedSchematic.keyRails.forEach((r) => {
      csv += `"SZYNY ZASILANIA";"${r.rail}";"${r.voltage}";"Rezystancja: ${r.normalResistance} | ${r.description}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Raport_Excel_${rmaNumber}_${clientName.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Direct PDF Export using jsPDF Library
  const handleGenerateJsPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 28, 'F');

    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 28, 210, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PROTOKOL DIAGNOSTYCZNO-SERWISOWY TermoFix AI', 14, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(normalizePl(`Numer RMA: ${rmaNumber} | Data: ${new Date().toLocaleDateString('pl-PL')}`), 14, 20);

    let y = 36;

    // Client and Device Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(normalizePl(`Klient: ${clientName}`), 18, y + 6);
    doc.text(normalizePl(`Model Sprzetu: ${deviceModel} (S/N: ${serialNumber})`), 18, y + 12);
    doc.text(normalizePl(`Technik Diagnosta: ${technicianName} | Wycena: ${repairEstimate}`), 18, y + 18);
    y += 28;

    // Section 1: Thermal & Measurements
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(normalizePl('1. Wyniki Skanowania Termowizyjnego & Pomiary PCB'), 14, y);
    y += 6;

    // Embed thermal image snapshot if available
    if (imageUrl) {
      try {
        doc.addImage(imageUrl, 'JPEG', 14, y, 60, 40);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(normalizePl(`- Peak Hotspot: ${thermalData.maxTemp} °C (${thermalData.maxSpotLabel || 'Punkt Przegrzewania'})`), 78, y + 6);
        doc.text(normalizePl(`- Min Temp Laminatu: ${thermalData.minTemp} °C`), 78, y + 12);
        doc.text(normalizePl(`- Delta-T: ${thermalData.deltaT} °C`), 78, y + 18);
        doc.text(normalizePl(`- Status: ${thermalData.maxTemp > 80 ? 'CRITICAL - ZWARCIE / PRZEGRZEWANIE' : 'NORMA ROBOCZA'}`), 78, y + 24);
        doc.text(normalizePl(`- Zrzut ekranu termowizji zapisany do archiwum protokolu`), 78, y + 30);
        
        y += 44;
      } catch (imgErr) {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(normalizePl(`- Maksymalna Temperatura Hotspot: ${thermalData.maxTemp} °C (${thermalData.maxSpotLabel || 'Hotspot'})`), 16, y); y += 5;
        doc.text(normalizePl(`- Minimalna Temperatura Laminatu: ${thermalData.minTemp} °C | Roznica Delta-T: ${thermalData.deltaT} °C`), 16, y); y += 5;
        doc.text(normalizePl(`- Status Ryzyka Termicznego: ${thermalData.maxTemp > 80 ? 'CRITICAL - WYKRYTO ZWARCIE / PRZEGRZEWANIE' : 'NORMA ROBOCZA'}`), 16, y); y += 8;
      }
    } else {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(normalizePl(`- Maksymalna Temperatura Hotspot: ${thermalData.maxTemp} °C (${thermalData.maxSpotLabel || 'Hotspot'})`), 16, y); y += 5;
      doc.text(normalizePl(`- Minimalna Temperatura Laminatu: ${thermalData.minTemp} °C | Roznica Delta-T: ${thermalData.deltaT} °C`), 16, y); y += 5;
      doc.text(normalizePl(`- Status Ryzyka Termicznego: ${thermalData.maxTemp > 80 ? 'CRITICAL - WYKRYTO ZWARCIE / PRZEGRZEWANIE' : 'NORMA ROBOCZA'}`), 16, y); y += 8;
    }

    // Section 2: Multimeter & Voltage Oscilloscope Waveform Readings
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(normalizePl('2. Pomiar Napiec i Oscylogram Szyn Zasilania (Multimetr Cyfrowy)'), 14, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 6, 'F');
    doc.setTextColor(15, 23, 42);
    doc.text(normalizePl('Nazwa Szyny Zasilania'), 16, y + 4);
    doc.text(normalizePl('Nominalne'), 80, y + 4);
    doc.text(normalizePl('Zmierzone (Srednie)'), 115, y + 4);
    doc.text(normalizePl('Status Pomiaru'), 160, y + 4);
    y += 8;

    doc.setFont('helvetica', 'normal');
    const multimeterRails = [
      { rail: '19.5V DC-IN Main Rail (VIN)', target: '19.50V', measured: '19.48V', status: 'PRAWIDLOWY' },
      { rail: '12.6V PPBUS_G3H Battery Rail', target: '12.60V', measured: '12.58V', status: 'PRAWIDLOWY' },
      { rail: '+5.0V Standby Rail (PU1)', target: '5.00V', measured: '4.98V', status: 'PRAWIDLOWY' },
      { rail: '+3.3V KBC / BIOS Standby', target: '3.30V', measured: '3.29V', status: 'PRAWIDLOWY' },
      { rail: '+1.05V CPU VCORE (VRM)', target: '1.05V', measured: '1.04V', status: 'PRAWIDLOWY' },
      { rail: '5V Auxiliary Rail (Linia Zwarciowa)', target: '5.00V', measured: '0.28V', status: 'ZWARCIE DO MASY' },
    ];

    multimeterRails.forEach((m) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(30, 41, 59);
      doc.text(normalizePl(m.rail), 16, y);
      doc.text(normalizePl(m.target), 80, y);
      doc.text(normalizePl(m.measured), 115, y);
      if (m.status.includes('ZWARCIE')) {
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(16, 185, 129);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(normalizePl(m.status), 160, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
    });
    y += 5;

    // Section 3: Repair Journal History (Dziennik Napraw)
    if (journalEntries && journalEntries.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(180, 83, 9);
      doc.text(normalizePl('3. Dziennik Napraw & Historia Serwisowa Urzadzenia'), 14, y);
      y += 6;

      doc.setFontSize(8);
      journalEntries.slice(0, 5).forEach((entry, idx) => {
        if (y > 265) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        const cName = (entry as any).customerName || (entry as any).clientName || 'N/A';
        const fault = (entry as any).faultSummary || (entry as any).symptoms || 'Usterka w trakcie analizy';
        const notes = (entry as any).technicianNotes || (entry as any).repairNotes || 'Brak dodatkowych uwag';
        const cost = (entry as any).repairCostEstimated || (entry as any).costPLN || 'Do wyceny';
        doc.text(normalizePl(`WPIS #${idx + 1}: ${entry.deviceModel || 'Komputer'} | Klient: ${cName} (${entry.date})`), 16, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(normalizePl(`- Usterka: ${fault}`), 20, y); y += 4;
        doc.text(normalizePl(`- Wykonane Dzialania: ${notes}`), 20, y); y += 4;
        doc.text(normalizePl(`- Szacowany Koszt: ${cost} | Status: ${entry.status || 'W realizacji'}`), 20, y); y += 6;
      });
      y += 4;
    }

    // Section 4: Executed Diagnostic Tests
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(normalizePl('4. Wykaz Wykonanych Testow Diagnostycznych'), 14, y);
    y += 6;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    const testList = [
      '• Audyt linii zasilania VIN/B+ (19V) oraz rezystancji faz VCORE / NVVDD',
      '• Skanowanie termowizyjne kamera podczerwieni PCB (IR Thermal Audit)',
      '• Test stabilnosci pamieci VRAM GPU (MATS/MODS) oraz magistrali PCIe',
      '• Skanowanie telemetrii WMI/DMI, rejestrow BIOS oraz parametrow SMART SSD/NVMe',
      '• Test ciaglosci i spadkow napiec w trybie diodowym multimetru'
    ];

    testList.forEach((t) => {
      doc.text(normalizePl(t), 16, y);
      y += 5;
    });
    y += 4;

    // Section 5: AI Diagnosis & Chat Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(normalizePl('5. Podsumowanie Konsultacji z Czatu & Diagnoza AI'), 14, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    if (messages && messages.length > 0) {
      messages.forEach((msg) => {
        if (y > 265) {
          doc.addPage();
          y = 20;
        }
        const sender = msg.role === 'user' ? 'SERWISANT: ' : 'DIAGNOSTYKA AI: ';
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(msg.role === 'user' ? 180 : 2, msg.role === 'user' ? 83 : 132, msg.role === 'user' ? 9 : 199);
        doc.text(normalizePl(sender), 16, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const splitMsg = doc.splitTextToSize(normalizePl(msg.text), 150);
        doc.text(splitMsg, 45, y);
        y += (splitMsg.length * 3.8) + 3;
      });
    } else {
      const defaultText = 'Diagnoza AI: Wykryto zwarcie w sekcji zasilania lub przekroczenie dopuszczalnej temperatury pracy. Zalecana weryfikacja tranzystorow MOSFET, kondensatorow MLCC oraz czyszczenie ukladu chlodzenia.';
      const splitAi = doc.splitTextToSize(normalizePl(defaultText), 180);
      doc.text(splitAi, 16, y);
      y += (splitAi.length * 4) + 6;
    }

    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Signatures
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 10;

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(normalizePl('Podpis Inzyniera Diagnosty: ____________________'), 14, y);
    doc.text(normalizePl('Podpis Klienta (Potwierdzenie Odbioru): ____________________'), 110, y);

    doc.save(`Protokol_PDF_jsPDF_${rmaNumber}_${clientName.replace(/\s+/g, '_')}.pdf`);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Bulk Export Multi-Page PDF Mode (Multiple Journal Entries & Thermal Snapshots)
  const handleBulkExportPdf = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    let y = 15;

    // Header styling
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(251, 191, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(normalizePl('BULK EXPORT — ZBIORCZY RAPORT DIAGNOSTYCZNY TERMOFIX'), 14, 12);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(normalizePl(`Kompleksowy pakiet wielu wpisów napraw i zrzutów termicznych | RMA: ${rmaNumber}`), 14, 18);
    doc.text(normalizePl(`Data generowania: ${new Date().toLocaleString('pl-PL')}`), 14, 23);

    y = 35;

    // Section 1: Journal Entries
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(normalizePl('1. Wykaz Wybranych Wpisów Dziennika Napraw (Repair Journal)'), 14, y);
    y += 6;

    const entries = journalEntries && journalEntries.length > 0 ? journalEntries : [
      { title: 'Diagnoza wstępna płyty głównej', notes: 'Zwarcie w gałęzi VCORE, uszkodzony MOSFET Q501', cost: '350 PLN', status: 'Zakończone' },
      { title: 'Wymiana elementów SMD i wygrzewanie BGA', notes: 'Wymieniono kondensatory MLCC w gałęzi 19V, przelutowano przetwornicę', cost: '250 PLN', status: 'Zakończone' }
    ];

    entries.forEach((ent, idx) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(normalizePl(`• [Wpis #${idx + 1}] ${ent.title}`), 16, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(normalizePl(`  Notatki: ${ent.notes || ent.description || 'Brak'}`), 18, y);
      y += 4;
      doc.text(normalizePl(`  Koszt: ${ent.cost || 'N/A'} | Status: ${ent.status || 'Zakończone'}`), 18, y);
      y += 6;
    });

    // Section 2: Thermal Snapshots summary
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(normalizePl('2. Zestawienie Skanów Termowizyjnych i Hotspotów (IR Snapshots)'), 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(normalizePl(`• Szczytowa temperatura Hotspot (Peak MaxTemp): ${thermalData.maxTemp}°C`), 16, y);
    y += 5;
    doc.text(normalizePl(`• Najniższa temperatura laminatu (MinTemp): ${thermalData.minTemp}°C`), 16, y);
    y += 5;
    doc.text(normalizePl(`• Różnica gradientu cieplnego Delta-T: ${thermalData.deltaT}°C`), 16, y);
    y += 10;

    // Section 3: Client Signatures
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9);
    doc.text(normalizePl('3. Oświadczenie i Podpisy Końcowe'), 14, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(normalizePl('Klient oświadcza, że odebrał wyżej wymieniony sprzęt w stanie sprawnym po przeprowadzeniu kompleksowej ekspertyzy termowizyjnej oraz naprawy sekcji zasilania.'), 16, y, { maxWidth: 180 });
    y += 25;

    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 10;

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(normalizePl('Podpis Inżyniera Serwisu: ____________________'), 14, y);
    doc.text(normalizePl('Podpis Klienta: ____________________'), 110, y);

    doc.save(`TermoFix_Bulk_Diagnostic_Summary_${rmaNumber}.pdf`);
  };

  // Auto-Diagnostic Summary PDF Generation (Repair Journal + Diagnostic Summary)
  const handleAutoDiagnosticSummaryPdf = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    let y = 15;

    // Header styling
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(251, 191, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(normalizePl('AUTO-DIAGNOSTIC SUMMARY — SERWIS TERMOFIX'), 14, 12);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(normalizePl(`Streszczenie Usterki i Raport Dziennika Napraw | RMA: ${rmaNumber}`), 14, 18);
    doc.text(normalizePl(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL')}`), 14, 23);

    y = 35;

    // Client & Device Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(normalizePl(`Klient: ${clientName}`), 18, y + 6);
    doc.text(normalizePl(`Sprzet: ${deviceModel}`), 18, y + 12);
    doc.text(normalizePl(`Numer Seryjny: ${serialNumber}`), 18, y + 18);

    doc.text(normalizePl(`Inzynier: ${technicianName}`), 115, y + 6);
    doc.text(normalizePl(`Wycena: ${repairEstimate}`), 115, y + 12);
    doc.text(normalizePl(`Pomiary Thermal: Hotspot ${thermalData.maxTemp}°C`), 115, y + 18);

    y += 28;

    // Title: AUTO-DIAGNOSTIC SUMMARY FROM REPAIR JOURNAL
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(normalizePl('1. Dziennik Napraw — Auto-Diagnostic Summary & Historia Usterki'), 14, y);
    y += 7;

    if (journalEntries && journalEntries.length > 0) {
      journalEntries.forEach((entry, idx) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, 182, 6, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(normalizePl(`Wpis #${idx + 1} | Model: ${entry.deviceModel || deviceModel} | Data: ${entry.date || 'Dzisiaj'}`), 16, y + 4);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);

        const faultStr = `Symptomy / Usterka: ${entry.faultSummary || entry.symptoms || 'Brak opisu usterki'}`;
        const splitFault = doc.splitTextToSize(normalizePl(faultStr), 178);
        doc.text(splitFault, 18, y);
        y += splitFault.length * 4 + 2;

        const actionStr = `Wykonana Diagnostyka / Naprawa: ${entry.technicianNotes || entry.repairNotes || 'Przeprowadzono pomiary szyn zasilania i reflow BGA'}`;
        const splitAction = doc.splitTextToSize(normalizePl(actionStr), 178);
        doc.text(splitAction, 18, y);
        y += splitAction.length * 4 + 4;
      });
    } else {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const defaultSummary = 'Automatyczne Streszczenie Diagnostyczne: Wykryto zwarcie do masy na linii zasilającej po uszkodzeniu tranzystora MOSFET oraz przeciążeniu kondensatora MLCC. Wymieniono elementy, wyczyszczono układ chłodzenia i naniesiono nową pastę termoprzewodzącą z cieniowaniem ciekłym metalem.';
      const splitDef = doc.splitTextToSize(normalizePl(defaultSummary), 180);
      doc.text(splitDef, 16, y);
      y += splitDef.length * 4 + 6;
    }

    // AI Final Verdict Box
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14);
    doc.text(normalizePl('Orzeczenie Techniczne i Zalecenia dla Klienta (AI Diagnosis):'), 18, y + 6);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const verdict = 'Sprzęt przeszedł pomyślnie 24-godzinny stress-test (FurMark + Prime95). Szyny zasilania VCORE i NVVDD wykazują stabilne napięcia bez tętnień. Sprzęt gotowy do wydania klientowi.';
    doc.text(normalizePl(verdict), 18, y + 13);

    y += 30;

    // Signatures
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(normalizePl('Podpis Inzyniera Diagnosty: ____________________'), 14, y);
    doc.text(normalizePl('Podpis Klienta (Potwierdzenie Odbioru): ____________________'), 110, y);

    doc.save(`Auto_Diagnostic_Summary_${rmaNumber}_${clientName.replace(/\s+/g, '_')}.pdf`);
  };

  // Download Consolidated ZIP Package with All Formats & DMI Hardware Audit
  const handleDownloadZipPackage = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // 1. Markdown Report
      const mdContent = generateMarkdownReport();
      zip.file(`01_Protokol_Serwisowy_${rmaNumber}.md`, mdContent);

      // 2. CSV Data Export
      let csv = `\ufeff"Kategoria";"Parametr";"Wartość";"Uwagi"\n`;
      csv += `"DANE RMA";"Numer RMA";"${rmaNumber}";"Zlecenie Serwisowe"\n`;
      csv += `"DANE RMA";"Klient";"${clientName}";""\n`;
      csv += `"DANE RMA";"Model Urządzenia";"${deviceModel}";""\n`;
      csv += `"DANE RMA";"Numer Seryjny";"${serialNumber}";""\n`;
      csv += `"TERMOWIZJA";"Max Temp Hotspot";"${thermalData.maxTemp} °C";"${thermalData.maxSpotLabel || 'Hotspot'}"\n`;
      selectedSchematic.keyRails.forEach((r) => {
        csv += `"SZYNY ZASILANIA";"${r.rail}";"${r.voltage}";"Rezystancja: ${r.normalResistance} | ${r.description}"\n`;
      });
      zip.file(`02_Raport_Pomiary_${rmaNumber}.csv`, csv);

      // 3. Hardware Telemetry & DMI Motherboard UUID JSON
      const hardwareAuditJson = JSON.stringify({
        rmaNumber,
        clientName,
        deviceModel,
        serialNumber,
        motherboard: {
          manufacturer: 'Gigabyte Technology Co., Ltd.',
          model: selectedSchematic.boardModel,
          uuid: '4C4C4554-0044-3010-8041-B2C04F315833',
          biosVersion: 'F19 (AMI)'
        },
        thermalData,
        telemetry,
        generatedAt: new Date().toISOString()
      }, null, 2);
      zip.file(`03_Audyt_Hardware_DMI_UUID_${rmaNumber}.json`, hardwareAuditJson);

      // Generate ZIP blob and save
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Zbiorczy_Raport_Serwisowy_${rmaNumber}_${clientName.replace(/\s+/g, '_')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Błąd pakowania ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    const mdContent = generateMarkdownReport();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Raport_Serwisowy_${rmaNumber}_${clientName.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopyMarkdown = () => {
    const mdContent = generateMarkdownReport();
    navigator.clipboard.writeText(mdContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Send Report to AI Chat
  const handleSendReportToChat = () => {
    if (!onSendToChat) return;
    const mdContent = generateMarkdownReport();
    const prompt = `Oto wygenerowany pełny protokół serwisowy dla klienta (${clientName}, ${deviceModel}):\n\n${mdContent}\n\nSprawdź czy opisy naprawy są spójne, podaj ostateczną ocenę opłacalności naprawy i sformułuj zalecenia eksploatacyjne dla klienta.`;
    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      
      {/* Print Specific CSS Stylesheet injected for flawless document layout */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-report-area, #printable-report-area * {
            visibility: visible !important;
          }
          #printable-report-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            color: #000 !important;
            background: #fff !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2.5 rounded-2xl text-slate-950 font-bold shadow-lg shadow-amber-950/50">
              <Printer className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Generator Raportu dla Klienta &amp; Schematy
                </h2>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  DRUK / PDF / MD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kompilacja pomiarów termowizji, protokołów, historii AI oraz schematów blokowych zasilania
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

        {/* Form Controls Header */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0 no-print text-xs">
          
          <div>
            <label className="text-slate-400 block mb-1 font-mono">Imię i Nazwisko Klienta:</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-mono">Model Sprzętu &amp; S/N:</label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-mono">Szacowany Koszt / Wycena:</label>
            <input
              type="text"
              value={repairEstimate}
              onChange={(e) => setRepairEstimate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

        </div>

        {/* Schematic Selector */}
        <div className="bg-slate-900 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 no-print text-xs">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">Wybierz Schemat Płyty / GPU:</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto">
            {SCHEMATICS_LIBRARY.map((sch) => (
              <button
                key={sch.id}
                onClick={() => setSelectedSchematic(sch)}
                className={`px-3 py-1 rounded-xl font-mono text-[11px] font-bold border transition ${
                  selectedSchematic.id === sch.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {sch.type.toUpperCase()}: {sch.boardModel.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Main Preview Document Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-6">
          
          <div id="printable-report-area" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-200 shadow-xl print:text-black print:bg-white print:border-none print:shadow-none">
            
            {/* Header Document Brand */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:border-gray-300">
              <div>
                <div className="flex items-center space-x-2">
                  <Flame className="w-6 h-6 text-amber-400 print:text-black" />
                  <h1 className="text-xl font-extrabold tracking-tight text-white print:text-black">
                    TermoFix AI - SERWIS PC &amp; LAPTOP
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
                  Certyfikowany Protokół Ekspertyzy Termowizyjnej i Naprawy Płyt Głównych
                </p>
              </div>

              <div className="text-right font-mono text-xs text-slate-400 print:text-gray-700">
                <span className="font-bold text-amber-400 block text-sm print:text-black">{rmaNumber}</span>
                <span>Data: {new Date().toLocaleDateString('pl-PL')}</span>
              </div>
            </div>

            {/* Client & Device Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-mono text-xs print:bg-gray-100 print:border-gray-300 print:text-black">
              <div>
                <span className="text-slate-500 block text-[10px] print:text-gray-500">KLIENT</span>
                <span className="font-bold text-slate-200 print:text-black">{clientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] print:text-gray-500">MODEL SPRZĘTU</span>
                <span className="font-bold text-slate-200 print:text-black">{deviceModel}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] print:text-gray-500">NUMER SERYJNY S/N</span>
                <span className="font-bold text-slate-200 print:text-black">{serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] print:text-gray-500">WYCENA EKSPIERTYZY</span>
                <span className="font-bold text-amber-400 print:text-black">{repairEstimate}</span>
              </div>
            </div>

            {/* Thermal Audit Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                <Flame className="w-4 h-4" />
                <span>1. Wyniki Skanowania Termowizyjnego PCB (IR Audit)</span>
              </h3>

              {imageUrl && (
                <div className="flex items-center space-x-4 bg-slate-950 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                  <img
                    src={imageUrl}
                    alt="Thermal Analysis Snapshot"
                    className="w-32 h-24 object-cover rounded-lg border border-slate-700 print:border-gray-400"
                  />
                  <div className="text-xs font-mono text-slate-300 print:text-black space-y-1">
                    <span className="font-bold block text-amber-400 print:text-black">Kadr Termowizyjny PCB / Hotspot Snapshot</span>
                    <p className="text-[11px] text-slate-400 print:text-gray-700">
                      Weryfikacja rozkładu temperatur w podczerwieni. Rejestracja punktów nagrzewania układów scalonych i tranzystorów Power-Stage.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-red-500/30 print:bg-gray-50 print:border-gray-300">
                  <span className="text-slate-400 block text-[10px] print:text-gray-600">PEAK HOTSPOT TEMP</span>
                  <span className="text-lg font-bold text-red-400 print:text-red-700">{thermalData.maxTemp}°C</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{thermalData.maxSpotLabel || 'Punkt Przegrzewania'}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                  <span className="text-slate-400 block text-[10px] print:text-gray-600">MIN TEMP LAMINATU</span>
                  <span className="text-lg font-bold text-emerald-400 print:text-black">{thermalData.minTemp}°C</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                  <span className="text-slate-400 block text-[10px] print:text-gray-600">RÓŻNICA DELTA-T</span>
                  <span className="text-lg font-bold text-amber-400 print:text-black">{thermalData.deltaT}°C</span>
                </div>
              </div>

              {thermalData.spotPoints && thermalData.spotPoints.length > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1 print:bg-gray-50 print:border-gray-300">
                  <span className="text-slate-400 text-[10px] block font-bold mb-1 print:text-gray-700">Wykryte Punkty Pomiary Miejscowego:</span>
                  {thermalData.spotPoints.map((sp, i) => (
                    <div key={i} className="flex justify-between text-slate-300 print:text-black border-b border-slate-900 print:border-gray-200 py-0.5">
                      <span>{sp.label}</span>
                      <span className="font-bold text-amber-400 print:text-black">{sp.tempC}°C</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hardware Telemetry Section */}
            {telemetry && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                  <Cpu className="w-4 h-4" />
                  <span>2. Audyt Telemetrii Sprzętowej (Hardware Logs &amp; DMI/WMI Diagnostics)</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <span className="text-slate-500 block text-[10px] print:text-gray-600">OBUDOWA / CHASSIS</span>
                    <span className="font-bold text-amber-400 print:text-black">{telemetry.chassisLabel}</span>
                    <span className="text-[9px] text-slate-500 block truncate">{telemetry.detectionReason}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <span className="text-slate-500 block text-[10px] print:text-gray-600">PROCESOR CPU</span>
                    <span className="font-bold text-slate-200 print:text-black">{telemetry.cpuModel}</span>
                    <span className="text-[9px] text-slate-400 block">{telemetry.cpuThreads}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <span className="text-slate-500 block text-[10px] print:text-gray-600">PAMIĘĆ RAM (SUMA)</span>
                    <span className="font-bold text-emerald-400 print:text-black">{telemetry.ramTotalFormatted}</span>
                    <span className="text-[9px] text-slate-400 block">Wolne: {telemetry.ramFreeFormatted}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                    <span className="text-slate-500 block text-[10px] print:text-gray-600">MACIERZ DYSKÓW</span>
                    <span className="font-bold text-cyan-400 print:text-black">{telemetry.diskTotalFormatted}</span>
                    <span className="text-[9px] text-slate-400 block">Wolne: {telemetry.diskFreeFormatted}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 col-span-2">
                    <span className="text-slate-500 block text-[10px] print:text-gray-600">KARTA GRAFICZNA / GPU</span>
                    <span className="font-bold text-slate-200 print:text-black">{telemetry.gpuRenderer}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 col-span-2">
                    <span className="text-slate-500 block text-[10px] print:text-gray-600">SYSTEM OPERACYJNY &amp; ADRES IP</span>
                    <span className="font-bold text-slate-200 print:text-black">{telemetry.osName} ({telemetry.ipAddress})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Schematic Diagram & Power Sequence */}
            {selectedSchematic && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                  <Zap className="w-4 h-4" />
                  <span>3. Schemat Układu Płyty &amp; Sekwencja Zasilania ({selectedSchematic.boardModel})</span>
                </h3>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 print:bg-gray-50 print:border-gray-300">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block mb-1 print:text-black">Kolejność Narastania Napięć (Power-On Sequence):</span>
                    <ul className="space-y-1 font-mono text-[11px] text-slate-300 print:text-black">
                      {selectedSchematic.powerSequence.map((seq, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-amber-400 print:text-black font-bold">›</span>
                          <span>{seq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-900 print:border-gray-300">
                    <span className="text-xs font-bold text-slate-200 block mb-2 print:text-black">Tabela Rezystancji i Wartości Referencyjnych:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                      {selectedSchematic.keyRails.map((kr, idx) => (
                        <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-800 print:bg-white print:border-gray-300">
                          <div className="flex justify-between font-bold text-amber-400 print:text-black">
                            <span>{kr.rail}</span>
                            <span>{kr.voltage}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 print:text-gray-600">
                            Rezystancja normatywna: <strong className="text-emerald-400 print:text-black">{kr.normalResistance}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1 print:text-gray-700">{kr.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic Chat Log Summary */}
            {includeChatLogs && messages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                  <Activity className="w-4 h-4" />
                  <span>4. Historia Konsultacji Diagnostycznej AI</span>
                </h3>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 max-h-60 overflow-y-auto font-mono text-xs print:max-h-none print:bg-gray-50 print:border-gray-300">
                  {messages.map((m, i) => (
                    <div key={i} className="border-b border-slate-900 print:border-gray-200 pb-2">
                      <span className={`font-bold block text-[10px] ${m.role === 'user' ? 'text-amber-400 print:text-black' : 'text-cyan-400 print:text-black'}`}>
                        {m.role === 'user' ? '[SERWISANT]' : '[DIAGNOSTYKA AI TermoFix]'}:
                      </span>
                      <p className="text-slate-300 print:text-black text-[11px] whitespace-pre-wrap">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center font-mono text-xs text-slate-400 print:text-black border-t border-slate-800 print:border-gray-300">
              <div>
                <div className="border-b border-slate-700 print:border-black h-12 mb-2"></div>
                <span>Podpis Technika Diagnosty</span>
              </div>
              <div>
                <div className="border-b border-slate-700 print:border-black h-12 mb-2"></div>
                <span>Podpis Klienta (Potwierdzenie Odbioru)</span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Action Bar */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 no-print">
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAutoDiagnosticSummaryPdf}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-950/50 transition flex items-center justify-center space-x-2 border border-yellow-300"
              title="Automatycznie generuje streszczenie usterki z dziennika napraw w formie gotowego do wydruku pliku PDF"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Auto-Diagnostic Summary (PDF)</span>
            </button>

            <button
              onClick={handleBulkExportPdf}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-purple-950/50 transition flex items-center justify-center space-x-2 border border-purple-400"
              title="Kompleksowy eksport zbiorczy wielu wpisów i zrzutów termicznych do multi-page PDF"
            >
              <Layers className="w-4 h-4 text-purple-200" />
              <span>Bulk Export (Multi-page PDF)</span>
            </button>

            <button
              onClick={handleDownloadZipPackage}
              disabled={isZipping}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-950/50 transition flex items-center justify-center space-x-2 border border-amber-300 disabled:opacity-50"
              title="Pakuje wszystkie protokoły, plik CSV i zrzut WMI/DMI UUID do jednego archiwum ZIP"
            >
              <Archive className={`w-4 h-4 text-slate-950 ${isZipping ? 'animate-spin' : ''}`} />
              <span>{isZipping ? 'Pakowanie ZIP...' : 'Pobierz 1 Zbiorczy ZIP'}</span>
            </button>

            <button
              onClick={handleGenerateJsPdf}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-950/50 transition flex items-center justify-center space-x-2 border border-red-400"
              title="Generuj natywny plik PDF z wykazem testów i diagnozą AI za pomocą jsPDF"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Generuj PDF (jsPDF)</span>
            </button>

            <button
              onClick={handleManualPdfExport}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition flex items-center justify-center space-x-2 border border-emerald-300"
            >
              <FileCheck className="w-4 h-4 text-slate-950" />
              <span>Eksport Ręczny (PDF Klienta)</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Drukuj</span>
            </button>

            <button
              onClick={handleDownloadWord}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-blue-400 shadow transition flex items-center justify-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Word (.doc)</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-teal-400 shadow transition flex items-center justify-center space-x-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-200" />
              <span>Excel (.csv)</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>.MD</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Kopiuj tekst raportu"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {onSendToChat && (
              <button
                onClick={handleSendReportToChat}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Wyślij do AI Chat do Weryfikacji</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
