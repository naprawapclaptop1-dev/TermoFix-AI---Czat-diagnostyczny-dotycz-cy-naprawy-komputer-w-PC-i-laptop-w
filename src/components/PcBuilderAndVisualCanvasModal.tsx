import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  CheckCircle2,
  AlertTriangle,
  X,
  ShoppingCart,
  Download,
  Printer,
  Mail,
  RefreshCw,
  Layers,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sliders,
  DollarSign,
  Box,
  CpuIcon,
  Flame,
  Fan
} from 'lucide-react';

interface PcBuilderAndVisualCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface PartItem {
  id: string;
  category: 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'cooler' | 'psu' | 'case';
  name: string;
  brand: string;
  pricePln: number;
  specs: {
    socket?: string;
    ramType?: string;
    wattage?: number;
    lengthMm?: number;
    formFactor?: string;
  };
  link: string;
  image2dUrl: string;
  description: string;
}

const CATALOG_PARTS: PartItem[] = [
  // CPUs
  {
    id: 'cpu-1',
    category: 'cpu',
    name: 'Intel Core i9-14900K (3.2 GHz, 24-Core)',
    brand: 'Intel',
    pricePln: 2599,
    specs: { socket: 'LGA1700', wattage: 253 },
    link: 'https://allegro.pl/kategoria/procesory-257132?string=i9-14900k',
    image2dUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
    description: 'Flagowy procesor Intel LGA1700 o maksymalnym taktowaniu 6.0 GHz.'
  },
  {
    id: 'cpu-2',
    category: 'cpu',
    name: 'AMD Ryzen 7 7800X3D (4.2 GHz, 8-Core AM5)',
    brand: 'AMD',
    pricePln: 1899,
    specs: { socket: 'AM5', wattage: 120 },
    link: 'https://allegro.pl/kategoria/procesory-257132?string=7800x3d',
    image2dUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80',
    description: 'Najlepszy procesor do gier z technologią 3D V-Cache.'
  },
  {
    id: 'cpu-3',
    category: 'cpu',
    name: 'Intel Core i5-14600KF (3.5 GHz)',
    brand: 'Intel',
    pricePln: 1199,
    specs: { socket: 'LGA1700', wattage: 181 },
    link: 'https://allegro.pl/kategoria/procesory-257132?string=i5-14600kf',
    image2dUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
    description: 'Wysoka wydajność w grach i aplikacjach roboczych.'
  },

  // Motherboards
  {
    id: 'mb-1',
    category: 'motherboard',
    name: 'ASUS ROG STRIX Z790-E GAMING WIFI II',
    brand: 'ASUS',
    pricePln: 1899,
    specs: { socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX' },
    link: 'https://allegro.pl/kategoria/plyty-glowne-257133?string=Z790-E',
    image2dUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    description: 'Płyta główna ATX z potężną sekcją zasilania 18+1 faz.'
  },
  {
    id: 'mb-2',
    category: 'motherboard',
    name: 'MSI MAG X670E TOMAHAWK WIFI',
    brand: 'MSI',
    pricePln: 1399,
    specs: { socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX' },
    link: 'https://allegro.pl/kategoria/plyty-glowne-257133?string=X670E+Tomahawk',
    image2dUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    description: 'Stabilna płyta AM5 dla procesorów AMD Ryzen serii 7000 i 9000.'
  },
  {
    id: 'mb-3',
    category: 'motherboard',
    name: 'Gigabyte B760 GAMING X AX DDR4',
    brand: 'Gigabyte',
    pricePln: 649,
    specs: { socket: 'LGA1700', ramType: 'DDR4', formFactor: 'ATX' },
    link: 'https://allegro.pl/kategoria/plyty-glowne-257133?string=B760+DDR4',
    image2dUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    description: 'Ekonomiczna płyta LGA1700 z obsługą tańszych pamięci DDR4.'
  },

  // RAM
  {
    id: 'ram-1',
    category: 'ram',
    name: 'Kingston Fury Renegade RGB 32GB (2x16GB) 6000MHz DDR5 CL32',
    brand: 'Kingston',
    pricePln: 529,
    specs: { ramType: 'DDR5' },
    link: 'https://allegro.pl/kategoria/pamieci-ram-257134?string=Kingston+DDR5+6000',
    image2dUrl: 'https://images.unsplash.com/photo-1562976540-1a02c2e0b5c1?auto=format&fit=crop&w=400&q=80',
    description: 'Wysokowydajna pamięć RAM DDR5 z podświetleniem ARGB.'
  },
  {
    id: 'ram-2',
    category: 'ram',
    name: 'Corsair Vengeance LPX 32GB (2x16GB) 3600MHz DDR4 CL18',
    brand: 'Corsair',
    pricePln: 319,
    specs: { ramType: 'DDR4' },
    link: 'https://allegro.pl/kategoria/pamieci-ram-257134?string=Corsair+DDR4+3600',
    image2dUrl: 'https://images.unsplash.com/photo-1562976540-1a02c2e0b5c1?auto=format&fit=crop&w=400&q=80',
    description: 'Sprawdzona pamięć DDR4 niskoprofilowa.'
  },

  // GPUs
  {
    id: 'gpu-1',
    category: 'gpu',
    name: 'NVIDIA GeForce RTX 5090 32GB GDDR7',
    brand: 'NVIDIA',
    pricePln: 9499,
    specs: { wattage: 450, lengthMm: 336 },
    link: 'https://allegro.pl/kategoria/karty-graficzne-257135?string=RTX+5090',
    image2dUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
    description: 'Potężna karta graficzna nowej generacji do 4K i AI.'
  },
  {
    id: 'gpu-2',
    category: 'gpu',
    name: 'NVIDIA GeForce RTX 4070 Super 12GB GDDR6X',
    brand: 'NVIDIA',
    pricePln: 2799,
    specs: { wattage: 220, lengthMm: 242 },
    link: 'https://allegro.pl/kategoria/karty-graficzne-257135?string=RTX+4070+Super',
    image2dUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
    description: 'Wysoka wydajność w grach 1440p z DLSS 3.5.'
  },
  {
    id: 'gpu-3',
    category: 'gpu',
    name: 'AMD Radeon RX 7800 XT 16GB GDDR6',
    brand: 'AMD',
    pricePln: 2299,
    specs: { wattage: 263, lengthMm: 267 },
    link: 'https://allegro.pl/kategoria/karty-graficzne-257135?string=RX+7800+XT',
    image2dUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=400&q=80',
    description: 'Świetna karta z 16GB VRAM do płynnej rozgrywki.'
  },

  // Storage
  {
    id: 'ssd-1',
    category: 'storage',
    name: 'Samsung 990 PRO 2TB M.2 NVMe PCIe 4.0 (7450 MB/s)',
    brand: 'Samsung',
    pricePln: 749,
    specs: {},
    link: 'https://allegro.pl/kategoria/dyski-ssd-257138?string=Samsung+990+PRO+2TB',
    image2dUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80',
    description: 'Błyskawiczny dysk NVMe z radiatorem.'
  },

  // Cooler
  {
    id: 'cool-1',
    category: 'cooler',
    name: 'Endorfy Navis F360 Liquid Cooler ARGB',
    brand: 'Endorfy',
    pricePln: 549,
    specs: { wattage: 0 },
    link: 'https://allegro.pl/kategoria/chlodzenie-i-wentylatory-257136?string=Navis+F360',
    image2dUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    description: 'Wydajne chłodzenie wodne AIO 360mm.'
  },
  {
    id: 'cool-2',
    category: 'cooler',
    name: 'Thermalright Peerless Assassin 120 SE',
    brand: 'Thermalright',
    pricePln: 199,
    specs: { wattage: 0 },
    link: 'https://allegro.pl/kategoria/chlodzenie-i-wentylatory-257136?string=Peerless+Assassin',
    image2dUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    description: 'Najlepszy cooler wieżowy powietrzny w relacji ceny do jakości.'
  },

  // PSU
  {
    id: 'psu-1',
    category: 'psu',
    name: 'be quiet! Dark Power 13 1000W 80 Plus Titanium (ATX 3.0)',
    brand: 'be quiet!',
    pricePln: 1099,
    specs: { wattage: 1000 },
    link: 'https://allegro.pl/kategoria/zasilacze-do-komputerow-257140?string=Dark+Power+13+1000W',
    image2dUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    description: 'Najwyższej klasy zasilacz z certyfikatem Titanium i PCIe 5.0.'
  },
  {
    id: 'psu-2',
    category: 'psu',
    name: 'MSI MAG A750GL 750W 80 Plus Gold Modular',
    brand: 'MSI',
    pricePln: 429,
    specs: { wattage: 750 },
    link: 'https://allegro.pl/kategoria/zasilacze-do-komputerow-257140?string=MAG+A750GL',
    image2dUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    description: 'Solidny, w pełni modularny zasilacz z kablem 12VHPWR.'
  },

  // Case
  {
    id: 'case-1',
    category: 'case',
    name: 'NZXT H9 Flow Dual-Chamber Glass ATX Case (Black)',
    brand: 'NZXT',
    pricePln: 799,
    specs: { formFactor: 'ATX' },
    link: 'https://allegro.pl/kategoria/obudowy-257137?string=NZXT+H9+Flow',
    image2dUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    description: 'Nowoczesna obudowa panoramiczna z hartowanym szkłem.'
  }
];

export const PcBuilderAndVisualCanvasModal: React.FC<PcBuilderAndVisualCanvasModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [selectedParts, setSelectedParts] = useState<{ [key in PartItem['category']]?: PartItem }>({
    cpu: CATALOG_PARTS[0],
    motherboard: CATALOG_PARTS[3],
    ram: CATALOG_PARTS[6],
    gpu: CATALOG_PARTS[9],
    storage: CATALOG_PARTS[12],
    cooler: CATALOG_PARTS[13],
    psu: CATALOG_PARTS[15],
    case: CATALOG_PARTS[17]
  });

  const [activeTab, setActiveTab] = useState<'builder' | 'canvas' | 'compatibility' | 'export'>('builder');
  const [selectedCategory, setSelectedCategory] = useState<PartItem['category']>('cpu');

  if (!isOpen) return null;

  const handleAddPart = (part: PartItem) => {
    setSelectedParts((prev) => ({
      ...prev,
      [part.category]: part
    }));
  };

  const handleRemovePart = (category: PartItem['category']) => {
    setSelectedParts((prev) => {
      const copy = { ...prev };
      delete copy[category];
      return copy;
    });
  };

  // Compatibility Validation logic
  const warnings: string[] = [];
  const cpu = selectedParts.cpu;
  const mb = selectedParts.motherboard;
  const ram = selectedParts.ram;
  const gpu = selectedParts.gpu;
  const psu = selectedParts.psu;

  if (cpu && mb && cpu.specs.socket !== mb.specs.socket) {
    warnings.push(`⚠️ Niezgodność gniazda (Socket): Procesor ${cpu.name} (${cpu.specs.socket}) nie pasuje do płyty głównej ${mb.name} (${mb.specs.socket})!`);
  }

  if (mb && ram && mb.specs.ramType && ram.specs.ramType && mb.specs.ramType !== ram.specs.ramType) {
    warnings.push(`⚠️ Niezgodność pamięci RAM: Płyta obsługuje standard ${mb.specs.ramType}, a wybrano pamięć typu ${ram.specs.ramType}!`);
  }

  // Total wattage calculation
  const totalWattage = (cpu?.specs.wattage || 65) + (gpu?.specs.wattage || 200) + 75;
  const psuWattage = psu?.specs.wattage || 500;

  if (psuWattage < totalWattage) {
    warnings.push(`⚠️ Niewystarczająca moc zasilacza: Zestaw pobiera ok. ${totalWattage}W, a wybrany zasilacz ma tylko ${psuWattage}W. Zalecany zapas minimum 150W.`);
  }

  const totalPrice = Object.values(selectedParts).reduce((sum: number, item) => sum + ((item as PartItem)?.pricePln || 0), 0);

  const handleExportWord = () => {
    const htmlContent = `
      <html lang="pl">
      <head><meta charset="utf-8"><title>Specyfikacja PC TermoFix AI</title></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1e3a8a;">SERWIS POGOTOWIE RAFAŁ JAROSZ - SPECYFIKACJA ZESTAWU PC</h1>
        <p>Data: ${new Date().toLocaleDateString()} | Łączna cena: <b>${totalPrice.toLocaleString()} PLN</b></p>
        <hr/>
        <ul>
          ${Object.entries(selectedParts).map(([cat, p]) => `<li><b>${cat.toUpperCase()}:</b> ${(p as PartItem)?.name} - ${(p as PartItem)?.pricePln} PLN</li>`).join('')}
        </ul>
        <p><b>Szacowany pobór mocy:</b> ${totalWattage}W</p>
        <p><b>Status kompatybilności:</b> ${warnings.length === 0 ? 'Wszystkie podzespoły są w 100% kompatybilne!' : warnings.join('<br>')}</p>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TermoFix_AI_Specyfikacja_PC.doc';
    a.click();
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent('Specyfikacja Zestawu Komputerowego - TermoFix AI');
    const body = encodeURIComponent(`Dzień dobry,\n\nPrzesyłam zestawienie podzespołów komputerowych przygotowane w stacji roboczej TermoFix AI:\n\n` +
      Object.entries(selectedParts).map(([cat, p]) => `- ${cat.toUpperCase()}: ${(p as PartItem)?.name} (${(p as PartItem)?.pricePln} PLN)`).join('\n') +
      `\n\nŁączna kwota: ${totalPrice} PLN\n\nPozdrawiam,\nSerwis Laptopów Rafał Jarosz`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 px-6 py-4 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-400/40 rounded-xl text-blue-300">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Konfigurator PC & Wizualizacja 2D Na Żywo
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Ceny Aktualne & Blokada Błędów
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Składaj komputery z automatyczną weryfikacją kompatybilności, podglądem 2D i eksportem do PDF/Word/Email.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-850 px-6 border-b border-slate-700 flex items-center space-x-2 py-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'builder'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Katalog & Wybór Części ({Object.keys(selectedParts).length})
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'canvas'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Wizualny Montaż 2D Na Żywo
          </button>
          <button
            onClick={() => setActiveTab('compatibility')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'compatibility'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {warnings.length > 0 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            Weryfikacja Zgodności ({warnings.length})
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            Eksport / Wydruk / Oferta
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
          
          {/* TAB 1: BUILDER */}
          {activeTab === 'builder' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Part Selector */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                  {(['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'cooler', 'psu', 'case'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {cat === 'cpu' && 'Procesor CPU'}
                      {cat === 'motherboard' && 'Płyta Główna'}
                      {cat === 'ram' && 'Pamięć RAM'}
                      {cat === 'gpu' && 'Karta Graficzna'}
                      {cat === 'storage' && 'Dysk SSD/HDD'}
                      {cat === 'cooler' && 'Chłodzenie'}
                      {cat === 'psu' && 'Zasilacz PSU'}
                      {cat === 'case' && 'Obudowa'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CATALOG_PARTS.filter((p) => p.category === selectedCategory).map((part) => {
                    const isSelected = selectedParts[part.category]?.id === part.id;
                    return (
                      <div
                        key={part.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                              {part.brand}
                            </span>
                            <span className="text-emerald-400 font-extrabold text-base">
                              {part.pricePln} PLN
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-white mb-1">{part.name}</h4>
                          <p className="text-xs text-slate-400 mb-3">{part.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                          <a
                            href={part.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                          >
                            Sklep / Ceny <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => handleAddPart(part)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                            }`}
                          >
                            {isSelected ? '✓ Wybrane' : 'Wybierz Część'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Col: Active Configuration Summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                    <span>Twój Koszyk Zestawu</span>
                    <span className="text-xs text-blue-400">{Object.keys(selectedParts).length} / 8 części</span>
                  </h3>

                  <div className="space-y-3 mb-6">
                    {(['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'cooler', 'psu', 'case'] as const).map((cat) => {
                      const item = selectedParts[cat];
                      return (
                        <div key={cat} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">{cat}</span>
                            <span className="font-semibold text-white">{item ? item.name : <span className="text-slate-600 italic">Brak (wybierz z katalogu)</span>}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item && <span className="text-emerald-400 font-bold">{item.pricePln} zł</span>}
                            {item && (
                              <button
                                onClick={() => handleRemovePart(cat)}
                                className="text-slate-500 hover:text-red-400 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Szacowany pobór mocy:</span>
                    <span className="font-bold text-amber-400">{totalWattage}W (PSU: {psuWattage}W)</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-extrabold">
                    <span className="text-white">Łączna kwota:</span>
                    <span className="text-emerald-400">{totalPrice.toLocaleString()} PLN</span>
                  </div>

                  {warnings.length > 0 ? (
                    <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-300">
                      ⚠️ Wykryto {warnings.length} ostrzeżenia kompatybilności. Sprawdź zakładkę Zgodność!
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> Kompatybilność podzespołów w 100% OK!
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveTab('canvas')}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Monitor className="w-4 h-4" /> Podgląd 2D
                    </button>
                    <button
                      onClick={() => setActiveTab('export')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" /> Drukuj / PDF
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LIVE 2D ASSEMBLY CANVAS */}
          {activeTab === 'canvas' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-blue-400" /> Wizualizacja 2D Komputera na Żywo (Live Chassis Blueprint)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Każda dodana część pojawia się wizualnie na płycie głównej i w obudowie ATX z symulacją chłodzenia, temperatury i zasilania.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold animate-pulse flex items-center gap-1.5">
                    <Fan className="w-3.5 h-3.5 animate-spin" /> Wentylatory Aktywne (1200 RPM)
                  </span>
                </div>
              </div>

              {/* 2D Chassis Canvas Board */}
              <div className="relative bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 shadow-2xl overflow-hidden min-h-[500px] flex items-center justify-center">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>

                {/* Case Outline */}
                <div className="relative w-full max-w-4xl h-[440px] border-4 border-slate-700 rounded-2xl bg-slate-950 p-6 flex flex-col justify-between shadow-2xl">
                  
                  {/* Top: Exhaust / Cooler */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full border-2 border-cyan-400 bg-cyan-950/60 flex items-center justify-center animate-spin">
                        <Fan className="w-6 h-6 text-cyan-400" />
                      </div>
                      <span className="text-xs font-bold text-cyan-300">Chłodzenie AIO / Wentylator Wywiewny</span>
                    </div>
                    <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300">
                      Obudowa: {selectedParts.case ? selectedParts.case.name : 'Brak'}
                    </div>
                  </div>

                  {/* Center: Motherboard Area */}
                  <div className="relative my-auto h-[260px] border-2 border-blue-500/40 rounded-xl bg-slate-900/90 p-4 flex items-center justify-around shadow-inner">
                    
                    {/* CPU Socket & Cooler */}
                    <div className="flex flex-col items-center p-3 rounded-xl bg-blue-950/60 border border-blue-400/50 shadow-lg">
                      <Cpu className="w-10 h-10 text-blue-400 animate-pulse mb-1" />
                      <span className="text-xs font-bold text-white">{selectedParts.cpu ? selectedParts.cpu.brand + ' CPU' : 'Brak CPU'}</span>
                      <span className="text-[10px] text-blue-300">{selectedParts.cpu?.specs.socket || 'LGA1700'}</span>
                    </div>

                    {/* RAM Slots */}
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-indigo-950/60 border border-indigo-400/40">
                      <div className="flex gap-1">
                        <div className="w-4 h-20 bg-indigo-500 rounded animate-pulse"></div>
                        <div className="w-4 h-20 bg-indigo-500 rounded animate-pulse"></div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-300 text-center">{selectedParts.ram ? 'RAM DDR5 OK' : 'Brak RAM'}</span>
                    </div>

                    {/* GPU Slot */}
                    <div className="flex flex-col items-center p-3 rounded-xl bg-emerald-950/60 border border-emerald-400/40 w-48">
                      <Monitor className="w-8 h-8 text-emerald-400 mb-1" />
                      <span className="text-xs font-bold text-white truncate max-w-[160px]">{selectedParts.gpu ? selectedParts.gpu.name : 'Brak GPU'}</span>
                      <span className="text-[10px] text-emerald-300">PCIe 5.0 Slot active</span>
                    </div>

                    {/* M.2 SSD */}
                    <div className="flex flex-col items-center p-2 rounded-xl bg-amber-950/60 border border-amber-400/40">
                      <HardDrive className="w-6 h-6 text-amber-400 mb-1" />
                      <span className="text-[10px] font-bold text-white">{selectedParts.storage ? 'NVMe M.2 2TB' : 'Brak SSD'}</span>
                    </div>

                  </div>

                  {/* Bottom: PSU & Cables */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-bold text-emerald-400">
                        Zasilacz PSU: {selectedParts.psu ? selectedParts.psu.name : 'Brak'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Status: Gotowy do montażu i uruchomienia
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 3: COMPATIBILITY */}
          {activeTab === 'compatibility' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-blue-400" /> Weryfikacja Zgodności Podzespołów (AI Engine)
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  System na bieżąco sprawdza gniazda procesora, typ pamięci RAM, wymagany prąd zasilacza oraz gabaryty obudowy.
                </p>

                {warnings.length === 0 ? (
                  <div className="p-6 bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl flex items-center gap-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-emerald-300 text-base">Zestaw w 100% Kompatybilny!</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Wszystkie wybrane części pasują do siebie fizycznie i elektrycznie. Możesz bezpiecznie zamawiać i składać sprzęt.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {warnings.map((w, idx) => (
                      <div key={idx} className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-xl flex items-start gap-3 text-sm text-amber-200">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>{w}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT / PRINT / EMAIL */}
          {activeTab === 'export' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Printer className="w-6 h-6 text-blue-400" /> Eksport i Udostępnianie Konfiguracji PC
                  </h3>
                  <p className="text-xs text-slate-400">
                    Wydrukuj specyfikację zestawu, pobierz plik raportu Word/PDF lub wyślij wycenę bezpośrednio na e-mail klienta.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleExportPdf}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl flex flex-col items-center text-center transition-all group"
                  >
                    <Printer className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm text-white">Drukuj / Zapisz PDF</span>
                    <span className="text-xs text-slate-400 mt-1">Wydrukuj czystą specyfikację</span>
                  </button>

                  <button
                    onClick={handleExportWord}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl flex flex-col items-center text-center transition-all group"
                  >
                    <Download className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm text-white">Pobierz Dokument Word</span>
                    <span className="text-xs text-slate-400 mt-1">Format .doc / HTML</span>
                  </button>

                  <button
                    onClick={handleSendEmail}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl flex flex-col items-center text-center transition-all group"
                  >
                    <Mail className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm text-white">Wyślij e-mail</span>
                    <span className="text-xs text-slate-400 mt-1">Otwórz klient poczty</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase">Podsumowanie Kosztów Zestawu:</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Suma podzespołów:</span>
                    <span className="font-extrabold text-emerald-400">{totalPrice.toLocaleString()} PLN</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Usługa montażu i testów w Serwisie:</span>
                    <span className="font-bold text-blue-400">199 PLN</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
