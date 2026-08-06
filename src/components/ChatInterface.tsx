import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  Send,
  Image as ImageIcon,
  Bot,
  User,
  Sparkles,
  Flame,
  Wrench,
  RotateCcw,
  AlertTriangle,
  Zap,
  CheckCircle,
  Paperclip,
  Trash2,
  Mic,
  MicOff,
  Download,
  FileText,
  Terminal,
  X
} from 'lucide-react';
import { ChatMessage, DiagnosticCardData } from '../types';
import { StructuredDiagnosisCard } from './StructuredDiagnosisCard';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachedImage?: string) => void;
  isLoading: boolean;
  onResetChat: () => void;
  attachedImagePreview?: string | null;
  onClearAttachedImage?: () => void;
  onAttachImage?: (base64Img: string) => void;
}

const QUICK_PROMPTS = [
  { label: 'Karta GPU Błąd Code 43', prompt: 'Karta graficzna ma błąd Menedżera Urządzeń Code 43 i artefakty obrazu. Jak krok po kroku uruchomić test MATS/MODS i sprawdzić zasilanie VRAM oraz reballing?' },
  { label: 'Uszkodzony Dysk & Bad Sectors', prompt: 'Dysk SSD/HDD wykazuje bad sektory w SMART (05/C5). Windows wiesza się na 100% obciążenia dysku. Jak użyć chkdsk, odzyskać pliki i bezpiecznie sklonować dysk?' },
  { label: 'Naprawa Rozruchu Windows & BSOD', prompt: 'Windows wyświetla BSOD INACCESSIBLE_BOOT_DEVICE lub uszkodzone pliki systemowe. Przedstaw instrukcję naprawy sfc, dism oraz odbudowy bootloader BCD i EFI.' },
  { label: 'Test RAM & Procesora CPU', prompt: 'Komputer zawiesza się losowo i rzuca niebieskim ekranem. Jak przetestować pamięć RAM (MemTest86) oraz sprawdzić stabilność CPU (OCCT, Prime95) i sekcję VCORE?' },
  { label: 'Krótkie Spięcie 19V', prompt: 'Mam zwarcie na głównej linii 19V (0.02 Ohm do masy). Kamera termowizyjna pokazuje nagrzewający się klucz MOSFET. Jak zrobić próbę zwarciową zasilaczem?' },
  { label: 'Brak reakcji na Power (0.00A)', prompt: 'Laptop nie reaguje na przycisk power (No Power). Płytka pobiera 0.00A z zasilacza. Jak zacząć diagnostykę linii 19V i 3.3V/5V ALW?' }
];

export interface AttachedFileItem {
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
  contentSnippet?: string;
}

// Code Syntax Highlighter Component for Hardware Dumps, BIOS Registers & Assembly
function CodeHighlighterBlock({ code, lang }: { code: string; lang?: string; key?: React.Key }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  // Syntax highlighting tokenization for hardware log dump lines
  const highlightLine = (line: string) => {
    const tokens = line.split(/(\s+|[(),:;=+\-*\/[\]{}])/);
    return tokens.map((token, idx) => {
      if (/^0x[0-9a-fA-F]+/i.test(token)) {
        return <span key={idx} className="text-emerald-400 font-mono font-bold">{token}</span>;
      }
      if (/^(RAX|RBX|RCX|RDX|RSI|RDI|RSP|RBP|EAX|EBX|ECX|EDX|RIP|CR0|CR2|CR3|NVVDD|VCORE|FBVDD|3V_ALW|5V_ALW|19V_VIN)$/i.test(token)) {
        return <span key={idx} className="text-amber-400 font-mono font-bold">{token}</span>;
      }
      if (/^(MOV|XOR|JMP|CALL|PUSH|POP|RET|CMP|ADD|SUB|INC|DEC|NOP|LEA|INT|OUT|IN|AND|OR|SHL|SHR)$/i.test(token)) {
        return <span key={idx} className="text-cyan-400 font-mono font-bold">{token}</span>;
      }
      if (/^(ERROR|FAIL|BSOD|BUGCHECK|EXCEPTION|CRITICAL|PANIC|CORRUPT|FATAL|PAGE_FAULT)/i.test(token)) {
        return <span key={idx} className="text-red-400 font-mono font-extrabold">{token}</span>;
      }
      if (/^(PASS|OK|SUCCESS|HEALTHY|NORMAL)/i.test(token)) {
        return <span key={idx} className="text-emerald-300 font-mono font-bold">{token}</span>;
      }
      return <span key={idx}>{token}</span>;
    });
  };

  return (
    <div className="my-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px] text-slate-200 shadow-xl">
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400">
        <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-amber-400" />
          {lang || 'HARDWARE DUMP / CODE BLOCK'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="hover:text-slate-200 text-slate-400 bg-slate-800 px-2 py-0.5 rounded transition text-[10px] flex items-center gap-1"
        >
          {copied ? 'Skopiowano!' : 'Kopiuj Kod'}
        </button>
      </div>
      <div className="p-3 overflow-x-auto bg-slate-950/90 leading-relaxed">
        {lines.map((line, idx) => (
          <div key={idx} className="flex space-x-3">
            <span className="text-slate-600 select-none text-right w-6 text-[10px] shrink-0 font-mono">
              {idx + 1}
            </span>
            <span className="whitespace-pre">{highlightLine(line)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormattedMessageText({ text }: { text: string }) {
  if (!text) return null;

  // Split by backtick code blocks ```...```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-1">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const content = part.slice(3, -3);
          const firstLineBreak = content.indexOf('\n');
          let lang = 'CODE / LOG DUMP';
          let codeStr = content;

          if (firstLineBreak !== -1) {
            const possibleLang = content.slice(0, firstLineBreak).trim();
            if (possibleLang) {
              lang = possibleLang.toUpperCase();
              codeStr = content.slice(firstLineBreak + 1);
            }
          }

          return <CodeHighlighterBlock key={idx} code={codeStr} lang={lang} />;
        }

        // Check if raw text looks like memory dump or register values
        const isRawMemoryDump = /0x[0-9a-fA-F]{4,16}:/i.test(part) || /(RAX:|RBX:|EAX:)\s*[0-9a-fA-F]/i.test(part);
        if (isRawMemoryDump) {
          return <CodeHighlighterBlock key={idx} code={part} lang="AUTO-DETECTED DUMP LOG" />;
        }

        return (
          <div key={idx} className="whitespace-pre-wrap">
            {part}
          </div>
        );
      })}
    </div>
  );
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onResetChat,
  attachedImagePreview,
  onClearAttachedImage,
  onAttachImage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFileItem | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [clipboardLogDetected, setClipboardLogDetected] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Clipboard Detection for Windows Error Logs / Memory Dumps
  useEffect(() => {
    const checkClipboardForErrorLogs = async () => {
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) return;
        const text = await navigator.clipboard.readText();
        if (!text || text.length < 10) return;

        const errorPatterns = [
          '0x00000', '0xC0000', 'BugCheck', 'CRITICAL_PROCESS_DIED', 'MEMORY_MANAGEMENT',
          'PAGE_FAULT_IN_NONPAGED_AREA', 'SYSTEM_SERVICE_EXCEPTION', 'Event ID', 'Kernel-Power',
          'ntoskrnl.exe', 'nvlddmkm.sys', 'atikmpag.sys', 'dmp', 'BSOD', 'Dump File',
          'WHEA_UNCORRECTABLE_ERROR', 'KMODE_EXCEPTION_NOT_HANDLED', 'IRQL_NOT_LESS_OR_EQUAL'
        ];

        const isErrorLog = errorPatterns.some((pattern) => text.toLowerCase().includes(pattern.toLowerCase()));
        if (isErrorLog) {
          setClipboardLogDetected(text.slice(0, 1200));
        }
      } catch (err) {
        // Clipboard permission may be denied in iframe or restricted context
      }
    };

    const handleFocus = () => {
      checkClipboardForErrorLogs();
    };

    window.addEventListener('focus', handleFocus);
    checkClipboardForErrorLogs();

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleApplyClipboardLog = () => {
    if (!clipboardLogDetected) return;
    setInputText((prev) => {
      const prefix = `[LOG BŁĘDU / ZRZUT PAMIĘCI ZE SCHOWKA]:\n\`\`\`text\n${clipboardLogDetected}\n\`\`\`\nProszę o dokładną diagnozę tego loga i instrukcję naprawy.`;
      return prev ? `${prev}\n\n${prefix}` : prefix;
    });
    setClipboardLogDetected(null);
  };

  const processFile = (file: File) => {
    if (!file) return;

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    if (file.type.startsWith('image/') || ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'BMP'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setLocalImagePreview(result);
          if (onAttachImage) {
            onAttachImage(result);
          }
          setAttachedFile({
            name: file.name,
            size: sizeFormatted,
            type: ext,
            dataUrl: result,
          });
          if (!inputText.trim()) {
            setInputText(`[Załączono obraz do analizy: ${file.name}] Proszę o przeprowadzenie analizy tego zdjęcia / termogramu.`);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      // ZIP, LOG, TXT, PDF, BIN, etc.
      const isText = file.type.startsWith('text/') || ['TXT', 'LOG', 'JSON', 'CSV', 'INI'].includes(ext);
      if (isText) {
        const textReader = new FileReader();
        textReader.onload = (ev) => {
          const raw = ev.target?.result as string;
          const snippet = raw ? raw.slice(0, 1500) : '';
          setAttachedFile({
            name: file.name,
            size: sizeFormatted,
            type: ext,
            contentSnippet: snippet,
          });
          if (!inputText.trim()) {
            setInputText(`[Załączono plik logów: ${file.name} (${sizeFormatted})]. Proszę o analizę tego pliku.`);
          }
        };
        textReader.readAsText(file);
      } else {
        // ZIP / RAR / 7Z / BIN
        setAttachedFile({
          name: file.name,
          size: sizeFormatted,
          type: ext,
        });
        if (!inputText.trim()) {
          setInputText(`[Załączono pakiet/archiwum ZIP: ${file.name} (${sizeFormatted})]. Proszę o analizę zawartości tej paczki.`);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pl-PL';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Rozpoznawanie mowy nie jest wspierane w tej przeglądarce.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const sanitizePdfText = (text: string): string => {
    if (!text) return '';
    return text
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

  const handleExportPdf = () => {
    if (messages.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageOverflow = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 15) {
        doc.addPage();
        y = margin;
        drawHeaderBanner(false);
      }
    };

    const drawHeaderBanner = (isFirstPage: boolean) => {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, isFirstPage ? 28 : 16, 'F');

      doc.setFillColor(245, 158, 11); // amber-500
      doc.rect(0, isFirstPage ? 28 : 16, pageWidth, 1.5, 'F');

      if (isFirstPage) {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('TERMOFIX AI - RAPORT DIAGNOSTYCZNY SERWISU PC / LAPTOP', margin, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(203, 213, 225);
        doc.text(sanitizePdfText(`Data wygenerowania: ${new Date().toLocaleString('pl-PL')}`), margin, 18);
        doc.text(sanitizePdfText(`ID Raportu: TFIX-${Date.now().toString().slice(-6)}`), margin, 23);
        y = 35;
      } else {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('TERMOFIX AI - RAPORT SERWISOWY (Kontynuacja)', margin, 10);
        y = 22;
      }
    };

    drawHeaderBanner(true);

    // Extract structured diagnoses
    const structuredData = messages
      .map((m) => m.structuredDiagnosis)
      .filter((sd): sd is DiagnosticCardData => Boolean(sd));

    if (structuredData.length > 0) {
      const latestDiagnosis = structuredData[structuredData.length - 1];

      checkPageOverflow(25);
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');

      doc.setTextColor(245, 158, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(sanitizePdfText('1. WYNIKI ANALIZY TERMOWIZYJNEJ I SPRZETOWEJ'), margin + 4, y + 5.5);
      y += 12;

      checkPageOverflow(30);
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(sanitizePdfText(`Wykryte Urzadzenie: ${latestDiagnosis.detectedDevice || 'Brak danych'}`), margin + 4, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.text(sanitizePdfText(`Status Termiczny: ${latestDiagnosis.thermalAnalysis?.severity || 'NORMAL'}`), margin + 4, y + 11);
      doc.text(sanitizePdfText(`Maksymalna Temp. Hotspot: ${latestDiagnosis.thermalAnalysis?.maxTemp || 'N/A'}`), margin + 4, y + 16);

      const suspects = latestDiagnosis.suspectedComponents?.map((c) => c.designator).join(', ') || 'Brak';
      doc.text(sanitizePdfText(`Podejrzane Komponenty: ${suspects}`), margin + 4, y + 21);
      y += 28;

      if (latestDiagnosis.testPoints && latestDiagnosis.testPoints.length > 0) {
        checkPageOverflow(15 + latestDiagnosis.testPoints.length * 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(sanitizePdfText('Punkty Pomiarowe Multimetru (Test Diodowy & Napiecia):'), margin, y);
        y += 4;

        doc.setFillColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, 6, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);

        doc.text('Komponent', margin + 2, y + 4);
        doc.text('Szyna Zasilania', margin + 35, y + 4);
        doc.text('Oczekiwane V', margin + 80, y + 4);
        doc.text('Tryb Diodowy', margin + 115, y + 4);
        doc.text('Status', margin + 150, y + 4);
        y += 6;

        doc.setFont('helvetica', 'normal');
        latestDiagnosis.testPoints.forEach((tp) => {
          checkPageOverflow(6);
          doc.setFillColor(255, 255, 255);
          doc.rect(margin, y, contentWidth, 5.5, 'F');
          doc.setFontSize(7);
          doc.setTextColor(51, 65, 85);

          doc.text(sanitizePdfText(tp.component), margin + 2, y + 3.8);
          doc.text(sanitizePdfText(tp.railName), margin + 35, y + 3.8);
          doc.text(sanitizePdfText(tp.expectedVoltage), margin + 80, y + 3.8);
          doc.text(sanitizePdfText(tp.expectedDiodeReading), margin + 115, y + 3.8);
          doc.text(sanitizePdfText(tp.status), margin + 150, y + 3.8);

          doc.setDrawColor(241, 245, 249);
          doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);
          y += 6;
        });
        y += 4;
      }

      if (latestDiagnosis.repairSteps && latestDiagnosis.repairSteps.length > 0) {
        checkPageOverflow(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(sanitizePdfText('Zalecane Kroki Naprawcze Serwisanta:'), margin, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        latestDiagnosis.repairSteps.forEach((step, idx) => {
          const stepLines = doc.splitTextToSize(sanitizePdfText(`${idx + 1}. ${step}`), contentWidth - 4);
          checkPageOverflow(stepLines.length * 4 + 2);
          doc.text(stepLines, margin + 2, y);
          y += stepLines.length * 4 + 2;
        });
        y += 4;
      }
    }

    checkPageOverflow(20);
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(sanitizePdfText('2. DOKUMENTACJA ZLECENIA I HISTORIA CZATU'), margin + 4, y + 5.5);
    y += 12;

    messages.forEach((m) => {
      const isUser = m.role === 'user';
      const roleLabel = isUser ? 'SERWISANT:' : 'ASYSTENT TERMOFIX AI:';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const cleanContent = sanitizePdfText(m.text);
      const lines = doc.splitTextToSize(cleanContent, contentWidth - 8);
      const boxHeight = lines.length * 3.8 + 9;

      checkPageOverflow(boxHeight + 4);

      if (isUser) {
        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(245, 158, 11);
      } else {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
      }

      doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(isUser ? 180 : 15, isUser ? 83 : 23, isUser ? 9 : 42);
      doc.text(roleLabel, margin + 3, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(m.timestamp, margin + contentWidth - 25, y + 4.5);

      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(lines, margin + 3, y + 9);

      y += boxHeight + 4;
    });

    checkPageOverflow(15);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      sanitizePdfText('Raport wygenerowany automatycznie przez system TermoFix AI. Wszelkie pomiary musza byc zweryfikowane multimetrem.'),
      margin,
      y
    );

    doc.save(`Raport_Diagnostyczny_TermoFix_${Date.now()}.pdf`);
  };

  const handleExportText = () => {
    if (messages.length === 0) return;

    let fullReport = `====================================================
TERMOFIX AI - DOKUMENTACJA DIAGNOSTYCZNA I PRZEBIEG ROZMOWY
Data Utworzenia: ${new Date().toLocaleString('pl-PL')}
====================================================\n\n`;

    messages.forEach((m) => {
      fullReport += `[${m.timestamp}] ${m.role === 'user' ? 'SERWISANT' : 'ASYSTENT AI'}:\n${m.text}\n`;
      if (m.structuredDiagnosis) {
        fullReport += `--- STRUKTURALNA DIAGNOZA AI ---\n`;
        fullReport += `Urządzenie: ${m.structuredDiagnosis.detectedDevice || 'B/D'}\n`;
        fullReport += `Status: ${m.structuredDiagnosis.thermalAnalysis?.severity || 'NORMAL'}\n`;
        if (m.structuredDiagnosis.repairSteps) {
          fullReport += `Kroki naprawy:\n${m.structuredDiagnosis.repairSteps.join('\n')}\n`;
        }
      }
      fullReport += `\n----------------------------------------------------\n`;
    });

    const blob = new Blob([fullReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Raport_Diagnostyczny_TermoFix_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveImage = attachedImagePreview || localImagePreview || attachedFile?.dataUrl;

    if ((!inputText.trim() && !effectiveImage && !attachedFile) || isLoading) return;

    let textToSend = inputText.trim();

    if (attachedFile && !textToSend.includes(attachedFile.name)) {
      textToSend = `[Załączono plik z dysku: ${attachedFile.name} (${attachedFile.type}, ${attachedFile.size})]\n${attachedFile.contentSnippet ? `Wycinek zawartości:\n${attachedFile.contentSnippet}\n\n` : ''}${textToSend}`;
    }

    onSendMessage(textToSend || `Analiza pliku: ${attachedFile?.name || 'Załącznik'}`, effectiveImage || undefined);

    setInputText('');
    setAttachedFile(null);
    setLocalImagePreview(null);
    if (onClearAttachedImage) {
      onClearAttachedImage();
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    const effectiveImage = attachedImagePreview || localImagePreview || attachedFile?.dataUrl;
    onSendMessage(prompt, effectiveImage || undefined);
    setAttachedFile(null);
    setLocalImagePreview(null);
    if (onClearAttachedImage) {
      onClearAttachedImage();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if ((inputText.trim() || attachedImagePreview || attachedFile) && !isLoading) {
        handleSubmit(e as any);
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      onResetChat();
    }
  };

  return (
    <div
      id="chat-interface-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px] lg:h-[720px]"
    >
      {/* Drag & Drop Local File Upload Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md border-2 border-dashed border-amber-400 rounded-2xl flex flex-col items-center justify-center text-amber-300 p-6 pointer-events-none animate-in fade-in duration-150">
          <Paperclip className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
          <span className="text-base font-bold text-white">Upuść plik z dysku lokalnego (ZIP, JPG, PNG, LOG)</span>
          <span className="text-xs text-slate-300 mt-1">Plik zostanie zachowany w stanie lokalnym i dołączony do analizy AI</span>
        </div>
      )}
      
      {/* Chat Header */}
      <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-red-600 rounded-xl text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-1.5">
              <span>Serwisant AI - Czat Diagnostyczny</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Analiza sprzętowa, schematy, napięcia, próba zwarciowa i termowizja
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportPdf}
                className="p-1.5 text-xs text-red-300 bg-red-950/80 border border-red-500/40 hover:bg-red-900 rounded-lg transition flex items-center gap-1 font-medium shadow"
                title="Generuj i pobierz raport PDF (jsPDF)"
              >
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Raport PDF</span>
              </button>

              <button
                onClick={handleExportText}
                className="p-1.5 text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 hover:bg-amber-900 rounded-lg transition flex items-center gap-1"
                title="Eksportuj historię diagnostyki do pliku TXT"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">TXT</span>
              </button>
            </div>
          )}

          <button
            onClick={onResetChat}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-xs flex items-center space-x-1"
            title="Wyczyszczenie rozmowy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nowa Diagnostyka</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Welcome Message if chat empty */}
        {messages.length === 0 && (
          <div className="text-center py-8 px-4 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 via-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-950/50">
              <Flame className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Witaj w Serwisowym Asystencie AI!
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Opisz usterkę laptopa/PC lub prześlij zdjęcie płyty głównej/z kamery termowizyjnej. AI zdiagnozuje zwarcie, poda punkty pomiarowe multimetru i procedurę naprawczą.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Szybkie Prompty Usterek:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPromptClick(qp.prompt)}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl border border-slate-800 hover:border-amber-500/50 transition font-medium text-left"
                  >
                    ⚡ {qp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Render Chat Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`p-2 rounded-xl shrink-0 shadow ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-red-400 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble Content */}
            <div className="max-w-[85%] sm:max-w-[78%] space-y-2">
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {/* Attached Image Thumbnail if present */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-slate-700/60 max-w-sm bg-black">
                    <img
                      src={msg.imageUrl}
                      alt="Załączony obraz do analizy"
                      className="max-h-52 w-auto object-contain"
                    />
                  </div>
                )}

                {/* Text Message with Syntax Highlighting for Hardware Dumps & Code */}
                <FormattedMessageText text={msg.text} />

                {/* Timestamp */}
                <div
                  className={`text-[10px] mt-1.5 text-right font-mono ${
                    msg.role === 'user' ? 'text-slate-900/70' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Render Structured Diagnostic Card if attached to assistant turn */}
              {msg.structuredDiagnosis && (
                <StructuredDiagnosisCard data={msg.structuredDiagnosis} />
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-slate-400">
            <div className="p-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Analizowanie pomiarów i generowanie diagnozy...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached Image Preview Bar before sending */}
      {(attachedImagePreview || localImagePreview) && (
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-500 bg-black shrink-0">
              <img src={attachedImagePreview || localImagePreview || ''} alt="Załącznik" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs text-amber-300 font-bold block">
                Obraz gotowy do analizy AI / potoku termowizyjnego
              </span>
              <span className="text-[10px] text-slate-400">
                Załącznik zostanie przekazany bezpośrednio do modeli wizyjnych
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setLocalImagePreview(null);
              if (onClearAttachedImage) onClearAttachedImage();
            }}
            className="p-1 text-slate-400 hover:text-red-400 bg-slate-900 rounded-lg transition"
            title="Usuń załączone zdjęcie"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attached ZIP / Document File Preview Bar */}
      {attachedFile && (
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
              {attachedFile.type}
            </div>
            <span className="text-xs text-slate-200 font-medium truncate max-w-[250px]">
              {attachedFile.name} ({attachedFile.size})
            </span>
          </div>

          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 text-slate-400 hover:text-red-400 bg-slate-900 rounded-lg transition"
            title="Usuń załączony plik"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clipboard Windows Log / Memory Dump Suggestion Banner */}
      {clipboardLogDetected && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-t border-b border-blue-500/40 px-4 py-2.5 flex items-center justify-between text-xs animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center space-x-2 text-blue-200 truncate pr-2">
            <span className="p-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 font-bold shrink-0 text-[10px]">📋 SCHOWEK</span>
            <span className="truncate text-slate-200 text-xs">
              Wykryto log błędu Windows / kod zrzutu pamięci ({clipboardLogDetected.slice(0, 45)}...)
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleApplyClipboardLog}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded-lg transition text-[11px] shadow flex items-center gap-1"
            >
              <span>Wklej do Czatu</span>
            </button>
            <button
              type="button"
              onClick={() => setClipboardLogDetected(null)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Voice Listening Active Banner */}
      {isListening && (
        <div className="bg-red-950/80 border-t border-red-500/40 px-4 py-2 text-xs text-red-200 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-red-400" />
            <span>Tryb Mikrofonu (Hands-Free): Mów do asystenta trzymając sondy pomiarowe...</span>
          </div>
          <button
            onClick={toggleVoiceListening}
            className="text-[10px] bg-red-800 px-2 py-0.5 rounded text-white font-bold"
          >
            Zatrzymaj
          </button>
        </div>
      )}

      {/* Input Bar Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,.zip,.rar,.7z,.txt,.log,.pdf,.bin"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 bg-slate-900 text-slate-400 hover:text-amber-400 border border-slate-800 rounded-xl transition shrink-0"
          title="Załącz zdjęcie płyty, zbiór termowizji, plik ZIP lub logi diagnostyczne"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleVoiceListening}
          className={`p-2.5 rounded-xl border transition shrink-0 ${
            isListening
              ? 'bg-red-600 text-white border-red-500 animate-ping'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400'
          }`}
          title="Uruchom mikrofon dla komunikacji Hands-Free"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={isListening ? 'Słucham... mów swoje pytanie...' : 'Zapytaj o usterkę, napięcie na cewce PL lub załącz zdjęcie/ZIP...'}
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition pr-20"
          />
          <span className="absolute right-2 text-[10px] text-slate-500 font-mono hidden md:inline pointer-events-none select-none">
            Ctrl+↵ wyślij | Ctrl+K wyczyść
          </span>
        </div>

        <button
          type="submit"
          disabled={(!inputText.trim() && !attachedImagePreview && !attachedFile) || isLoading}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Wyślij</span>
        </button>
      </form>

    </div>
  );
};

