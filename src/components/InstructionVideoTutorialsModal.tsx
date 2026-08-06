import React, { useState } from 'react';
import {
  Play,
  Pause,
  Video,
  X,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  Tv,
  HelpCircle,
  FileCode,
  Flame,
  Key,
  Wrench,
  Monitor,
  Cpu,
  Layers,
  Activity,
  Zap,
  CheckSquare
} from 'lucide-react';

export interface VideoTutorialItem {
  id: string;
  title: string;
  category: 'Termowizja' | 'BIOS & Password' | 'Windows & BCD' | 'KMS & CD Key' | 'Mikroskop & BGA' | 'Pomiary & Multimetr' | 'Oscyloskop & Sygnały' | 'Reballing VRAM' | 'Zasilanie i VIN';
  duration: string;
  author: string;
  views: string;
  videoUrl: string;
  posterUrl: string;
  description: string;
  steps: { timestamp: string; title: string; detail: string }[];
  tags: string[];
}

export const VIDEO_TUTORIALS: VideoTutorialItem[] = [
  {
    id: 'vid-thermal-short',
    title: 'Wykrywanie Zwarć Kamerą Termowizyjną & Próba Zwarciowa 19V VIN (Od A do Z)',
    category: 'Termowizja',
    duration: '18:45',
    author: 'Inż. Rafał Jarosz (naprawapclaptop.pl)',
    views: '24.2k',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Kompletny poradnik wideo krok po kroku od A do Z: jak bezpiecznie podłączyć zasilacz laboratoryjny z ograniczeniem prądowym OCP do 1A, namierzyć zwarcie na gałęzi głównej 19V VIN, wykryć uszkodzony kondensator MLCC lub tranzystor MOSFET DrMOS kamerą termowizyjną w palecie Ironbow, a następnie wykonać pomiary rezystancji multimetrem i wlutować nowy element stacją hot-air.',
    steps: [
      { timestamp: '00:00', title: 'Wprowadzenie i Teoria Zwarć w gałęzi 19V', detail: 'Omówienie bezpiecznika głównego i kluczy wejściowych Q1/Q2.' },
      { timestamp: '03:15', title: 'Ustawienie zasilacza serwisowego i OCP 1.0V / 1A', detail: 'Dlaczego nie podajemy od razu 19V z akumulatora i jak chronić układy BGA.' },
      { timestamp: '07:30', title: 'Skanowanie płyty głównej kamerą termowizyjną FLIR / Serwisową', detail: 'Obserwacja punktu nagrzewania się do 62°C w ciągu pierwszych 2 sekund.' },
      { timestamp: '12:10', title: 'Wylutowanie uszkodzonego kondensatora tantalowego / MLCC', detail: 'Użycie topnika RMA-223 i dyszy Hot-Air 380°C.' },
      { timestamp: '16:50', title: 'Weryfikacja rezystancji i test końcowy poboru prądu', detail: 'Pobór w stanie spoczynku 0.01A. Płytka uruchamia się poprawnie.' }
    ],
    tags: ['Termowizja', '19V VIN', 'MOSFET', 'Próba Zwarciowa', 'VCORE', 'MLCC']
  },
  {
    id: 'vid-multimeter-measurements',
    title: 'Pomiary Multimetrem Cyfrowym na Płycie Głównej Laptopa (Sekwencja Załączeń)',
    category: 'Pomiary & Multimetr',
    duration: '22:10',
    author: 'Serwis Pogotowie PC Rafał Jarosz',
    views: '19.8k',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    description: 'Szczegółowy pokaz pomiarów multimetrem w trybie testu diody i rezystancji. Sprawdzanie obecności napięć 3.3V / 5V Always (ALW), sygnałów S5_ENABLE, PM_SLP_S3# oraz rezystancji rdzenia procesora VCORE (często poniżej 1Ω).',
    steps: [
      { timestamp: '01:10', title: 'Sprawdzanie zwarć na cewkach przetwornic przetwornicy step-down', detail: 'Interpretacja wyników pomiarów w trybie brzęczka (continuity).' },
      { timestamp: '06:30', title: 'Pomiar napięć w stanie S5 (AC_IN, RTC_CELL, 3.3V_ALW)', detail: 'Lokalizacja układu KBC / SuperIO oraz pinów nRST i VCC.' },
      { timestamp: '13:40', title: 'Analiza sygnału Power Good (ALL_SYS_PWRGD)', detail: 'Jak odczytać schemat blokowy i odnaleźć uszkodzoną bramkę logiczną.' },
      { timestamp: '19:20', title: 'Testowanie stabilizatorów LDO w układzie kontrolera zasilania', detail: 'Pomiar napięć 5V i 3.3V na rezystorach podciągających.' }
    ],
    tags: ['Multimetr', 'Sygnały', 'ALW', 'Power Good', 'Schemat', 'KBC']
  },
  {
    id: 'vid-oscilloscope-signals',
    title: 'Praca z Oscyloskopem Cyfrowym: Badanie Przebiegów CLK, RESET i SPI',
    category: 'Oscyloskop & Sygnały',
    duration: '25:30',
    author: 'Inż. Elektronik Rafał Jarosz',
    views: '15.6k',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    description: 'Jak poprawnie podłączyć sondę oscyloskopu 10x do nóżki kwarcowego generatora zegara CLK 32.768kHz / 25MHz oraz badać transmisję danych MOSI/MISO na kości BIOS SPI Flash podczas próby startu płyty.',
    steps: [
      { timestamp: '02:00', title: 'Kalibracja sondy oscyloskopowej i kompensacja 1kHz', detail: 'Unikanie zakłóceń i odbić sygnału na wysokich częstotliwościach.' },
      { timestamp: '08:15', title: 'Pomiar sygnału CLK na kwarcu RTC i generatorze PCH', detail: 'Weryfikacja amplitudy 1.8V / 3.3V oraz idealnego przebiegu sinusoidalnego.' },
      { timestamp: '15:40', title: 'Analiza pakietów SPI Flash podczas inicjalizacji BIOS', detail: 'Dekodowanie transmisji SPI w czasie rzeczywistym na ekranie oscyloskopu.' },
      { timestamp: '21:00', title: 'Diagnostyka braku sygnału PLT_RST# (Platform Reset)', detail: 'Określenie, na którym etapie POST zatrzymuje się procesor.' }
    ],
    tags: ['Oscyloskop', 'CLK', 'SPI Flash', 'RESET', 'Sondowanie', 'Elektronika']
  },
  {
    id: 'vid-microscope-bga',
    title: 'Inspekcja Mikroskopem 500x i Wymiana Układu BGA (Reballing & Lutowanie)',
    category: 'Mikroskop & BGA',
    duration: '28:15',
    author: 'Inż. Rafał Jarosz (Serwis BGA)',
    views: '32.4k',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Profesjonalny pokaz wideo z kamery mikroskopowej 4K o powiększeniu 500x. Demontaż mostka południowego / PCH na stacji dolnego podgrzewania IR, czyszczenie padów plecionką miedzianą, nałożenie sita BGA z kulkami ołowianymi SAC305 i wlutowanie układu z kontrolą profilu temperaturowego.',
    steps: [
      { timestamp: '01:30', title: 'Demontaż układu BGA na stacji podgrzewania podczerwienią', detail: 'Krzywa temperaturowa ramp-up do 220°C bez wybrzuszenia laminatu.' },
      { timestamp: '08:00', title: 'Czyszczenie padów na płycie głównej za pomocą cyny o niskiej temperaturze topnienia', detail: 'Zabezpieczenie soldermaski przed zdarciem ścieżek.' },
      { timestamp: '16:45', title: 'Reballing układu: nakładanie kulek Sn63Pb37 przez dedykowane sito ze stali', detail: 'Równomierne dozowanie topnika i grzanie hot-air 340°C.' },
      { timestamp: '24:20', title: 'Precyzyjne pozycjonowanie pod mikroskopem i wlutowanie końcowe', detail: 'Efekt samopozycjonowania kulek dzięki napięciu powierzchniowemu topnika.' }
    ],
    tags: ['BGA', 'Reballing', 'Mikroskop', 'Lutowanie', 'PCH', 'Hot-Air']
  },
  {
    id: 'vid-vram-mats',
    title: 'Diagnostyka Uszkodzeń Pamięci VRAM (MATS/MODS oraz Wymiana Kości GDDR6)',
    category: 'Reballing VRAM',
    duration: '19:50',
    author: 'Serwis GPU Rafał Jarosz',
    views: '21.0k',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    description: 'Jak uruchomić testy MATS/MODS z pendrive USB DOS, zinterpretować mapę błędów pamięci VRAM (np. błąd na linii D0-D32 wskazujący uszkodzoną kość nr 3), a następnie wykonać wymianę pamięci GDDR6 na karcie RTX 4070 / 4090.',
    steps: [
      { timestamp: '02:10', title: 'Przygotowanie bootowalnego pendrive MATS dla kart Nvidia', detail: 'Komendy testowe ./mats -e 70 -i 10 oraz analiza logów.' },
      { timestamp: '07:40', title: 'Odczyt mapy błędów i wskazanie uszkodzonej kości VRAM Hynix / Samsung', detail: 'Rozpoznawanie, która dokładnie kość powoduje artefakty na ekranie.' },
      { timestamp: '12:30', title: 'Wylutowanie uszkodzonej kości GDDR6 i czyszczenie padów', detail: 'Utrzymanie temperatury PCB i kontrola mikroskopowa.' },
      { timestamp: '17:10', title: 'Ponowny test MATS po wymianie – wynik 0 błędów (PASS)', detail: 'Karta w pełni sprawna gotowa do testów FurMark.' }
    ],
    tags: ['VRAM', 'MATS', 'MODS', 'GDDR6', 'RTX', 'Artefakty']
  },
  {
    id: 'vid-bios-unlock',
    title: 'Instrukcja Usuwania Hasła BIOS / Supervisor Password w Dell & Lenovo (CH341A)',
    category: 'BIOS & Password',
    duration: '14:20',
    author: 'Serwis Pogotowie PC Rafał Jarosz',
    views: '28.3k',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'Kompletny poradnik odczytu i zapisu kości EEPROM / SPI BIOS za pomocą programatora CH341A z klipsem SOIC-8. Czyszczenie regionu ME, usuwanie haseł korporacyjnych oraz programowanie nowych wsadów.',
    steps: [
      { timestamp: '01:00', title: 'Podpięcie klipsa programatora CH341A do kości SPI na płycie', detail: 'Zwrócenie uwagi na pin 1 (czerwona żyła taśmy).' },
      { timestamp: '04:30', title: 'Odczyt zawartości wsadu BIOS w programie AsProgrammer', detail: 'Tworzenie kopii zapasowej (backup) oryginalnego wsadu.' },
      { timestamp: '09:10', title: 'Modyfikacja lub wgranie czystego wsadu (Clean ME Region)', detail: 'Usuwanie blokad hasła supervisor w laptopach biznesowych.' },
      { timestamp: '12:50', title: 'Weryfikacja zapisu i pierwszy rozruch płyty', detail: 'Brak żądania hasła przy wejściu do BIOS.' }
    ],
    tags: ['BIOS', 'Hasło', 'CH341A', 'EEPROM', 'ME Region', 'Lenovo']
  },
  {
    id: 'vid-windows-repair',
    title: 'Naprawa Błędów Rozruchu Windows 11 BCD, 0xc000000e & Boot Loop (WinPE)',
    category: 'Windows & BCD',
    duration: '11:40',
    author: 'Serwis Windows TermoFix',
    views: '22.1k',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    description: 'Odbudowa uszkodzonego magazynu rozruchowego BCD w systemach UEFI/GPT. Użycie diskpart, przypisanie litery dysku EFI, komenda bcdboot oraz naprawa uszkodzonych plików systemowych SFC i DISM.',
    steps: [
      { timestamp: '01:15', title: 'Uruchomienie wiersza poleceń z pendrive instalacyjnego WinPE', detail: 'Kombinacja Shift + F10.' },
      { timestamp: '04:00', title: 'Identyfikacja partycji systemowej EFI w diskpart', detail: 'Komenda list disk -> select disk 0 -> list volume.' },
      { timestamp: '07:30', title: 'Odbudowa plików rozruchowych bcdboot c:\\windows /s s: /f UEFI', detail: 'Pomyślne skopiowanie plików rozruchowych.' },
      { timestamp: '10:10', title: 'Skanowanie SFC /scannow i DISM w celu naprawy uszkodzonych bibliotek DLL', detail: 'System uruchamia się bezbłędnie.' }
    ],
    tags: ['Windows 11', 'BCD', '0xc000000e', 'EFI', 'WinPE', 'Naprawa']
  },
  {
    id: 'vid-kms-activation',
    title: 'Oficjalna Aktywacja Licencji KMS & Kluczy GVLK Windows & Office 2024',
    category: 'KMS & CD Key',
    duration: '08:50',
    author: 'Specjalista Oprogramowania TermoFix AI',
    views: '35.9k',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'Instruktaż wdrażania legalnych kluczy GVLK, konfiguracji serwerów aktywacji sieciowej slmgr /skms oraz rozwiązywania problemów z wygasaniem licencji 180-dniowych.',
    steps: [
      { timestamp: '00:45', title: 'Wybór klucza GVLK dla systemu Windows 11 Pro / Enterprise', detail: 'Instalacja klucza poleceniem slmgr /ipk.' },
      { timestamp: '03:20', title: 'Konfiguracja bezpiecznego hosta KMS w sieci lokalnej', detail: 'Wpisanie komendy slmgr /skms kms8.msguides.com.' },
      { timestamp: '06:10', title: 'Wywołanie aktywacji online / sieciowej slmgr /ato', detail: 'Komunikat o pomyślnej aktywacji produktu.' },
      { timestamp: '08:00', title: 'Sprawdzenie statusu licencji slmgr /xpr', detail: 'Potwierdzenie trwałości statusu aktywacji.' }
    ],
    tags: ['KMS', 'CD Key', 'Windows 11', 'Office 2024', 'slmgr', 'Licencje']
  }
];

interface InstructionVideoTutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoId?: string;
}

export const InstructionVideoTutorialsModal: React.FC<InstructionVideoTutorialsModalProps> = ({
  isOpen,
  onClose,
  initialVideoId
}) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>(initialVideoId || VIDEO_TUTORIALS[0].id);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Extra interactive feature from author ("Coś od siebie"): Serwisowy Asystent Diagnozy Krok-po-Kroku
  const [checklistProgress, setChecklistProgress] = useState<{ [key: number]: boolean }>({});

  if (!isOpen) return null;

  const currentVideo = VIDEO_TUTORIALS.find((v) => v.id === selectedVideoId) || VIDEO_TUTORIALS[0];

  const filteredVideos = VIDEO_TUTORIALS.filter((v) => {
    const matchesCategory = activeCategory === 'ALL' || v.category === activeCategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleStepCheck = (idx: number) => {
    setChecklistProgress(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-red-600 via-amber-500 to-rose-600 rounded-xl text-white shadow-lg shadow-red-950/50">
              <Tv className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Akademia Poradników Wideo &amp; Warsztatu Serwisowego Od A do Z
                </h2>
                <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  8 Zaawansowanych Filmów HD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lutowanie, pomiary multimetrem, oscyloskop, termowizja i naprawy programowe z interaktywną listą zadań
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

        {/* Search & Category Filter Bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto text-xs py-1">
            {['ALL', 'Termowizja', 'Pomiary & Multimetr', 'Oscyloskop & Sygnały', 'Mikroskop & BGA', 'Reballing VRAM', 'BIOS & Password', 'Windows & BCD', 'KMS & CD Key'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                  activeCategory === cat
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'Wszystkie Filmy (8)' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj procedury lub tagu..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Modal Main Content Layout */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-900/90">
          
          {/* Main Video Player Stage & Interactive Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Video Player + Interactive Steps */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
                <video
                  key={currentVideo.id}
                  src={currentVideo.videoUrl}
                  poster={currentVideo.posterUrl}
                  controls
                  autoPlay={isPlaying}
                  className="w-full aspect-video object-cover"
                />

                <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-red-500/30">
                      {currentVideo.category}
                    </span>
                    <span className="font-bold text-white truncate max-w-md">{currentVideo.title}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">{currentVideo.duration}</span>
                </div>
              </div>

              {/* Video Description & Interactive Checklist (Coś od siebie) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Opis Procedury i Interaktywna Lista Kroków Serwisowych</span>
                  </h3>
                  <span className="text-xs text-slate-400">Autor: {currentVideo.author}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  {currentVideo.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="flex items-center space-x-1.5">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>Odznaczaj wykonane kroki podczas naprawy (Interactive Checklist):</span>
                    </span>
                    <span className="text-emerald-400 font-mono">
                      {Object.values(checklistProgress).filter(Boolean).length} / {currentVideo.steps.length} Ukończono
                    </span>
                  </div>

                  {currentVideo.steps.map((step, idx) => {
                    const isChecked = !!checklistProgress[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStepCheck(idx)}
                        className={`p-3 rounded-xl border transition flex items-start space-x-3 text-xs cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-950/30 border-emerald-500/50 text-slate-300'
                            : 'bg-slate-900 border-slate-800/80 hover:border-red-500/50 text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-bold ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                              {step.title}
                            </span>
                            <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold text-[10px] border border-red-500/30">
                              {step.timestamp}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-1">{step.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Video List Sidebar */}
            <div className="lg:col-span-4 space-y-3">
              <div className="font-bold text-xs text-slate-300 flex items-center justify-between">
                <span>Dostępne Poradniki Wideo ({filteredVideos.length})</span>
                <span className="text-red-400 font-mono text-[10px]">Wszystkie od A do Z</span>
              </div>

              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {filteredVideos.map((vid) => (
                  <button
                    key={vid.id}
                    onClick={() => {
                      setSelectedVideoId(vid.id);
                      setIsPlaying(true);
                      setChecklistProgress({});
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex space-x-3 ${
                      selectedVideoId === vid.id
                        ? 'bg-red-950/60 border-red-500/80 text-white shadow-lg ring-1 ring-red-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800">
                      <img src={vid.posterUrl} alt={vid.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white drop-shadow" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono font-bold px-1 rounded text-slate-200">
                        {vid.duration}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="text-xs font-bold leading-tight line-clamp-2">
                        {vid.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span className="text-red-400 font-semibold">{vid.category}</span>
                        <span>{vid.views}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Wszystkie filmy zawierają pełne procedury laboratoryjne i praktyczne triki serwisowe.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
          >
            Zamknij Akademię Wideo
          </button>
        </div>

      </div>
    </div>
  );
};

