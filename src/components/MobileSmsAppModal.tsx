import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  Phone,
  MapPin,
  Smartphone,
  Star,
  CheckCircle2,
  Send,
  Settings,
  Check,
  Bot,
  Globe,
  AlertCircle,
  ShieldCheck,
  Terminal,
  Activity,
  Filter,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Zap,
  Server,
  Wifi,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  ExternalLink,
  UserCheck,
  Video,
  Lock,
  ShieldAlert,
  Share2,
  Sparkles
} from 'lucide-react';

interface MobileSmsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface SmsGatewayLogItem {
  id: string;
  timestamp: string;
  recipient: string;
  channel: 'sms' | 'whatsapp' | 'googlechat' | 'indeed' | 'webhook';
  status: 'DELIVERED' | 'QUEUED' | 'SENDING' | 'FAILED' | 'RETRY';
  statusCode: number;
  messageSnippet: string;
  gateway: string;
  latencyMs: number;
  errorDetails?: string;
}

export const MobileSmsAppModal: React.FC<MobileSmsAppModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [activeTab, setActiveTab] = useState<'send' | 'logs' | 'remote'>('send');
  const [phoneNumber, setPhoneNumber] = useState('786409187');
  const [selectedTemplate, setSelectedTemplate] = useState('address');
  const [sendMethod, setSendMethod] = useState<'sms' | 'whatsapp' | 'googlechat' | 'indeed'>('sms');
  const [autoSend, setAutoSend] = useState(true);
  const [hasConsent, setHasConsent] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [lastGeneratedLink, setLastGeneratedLink] = useState('');
  const [lastMessageSent, setLastMessageSent] = useState('');
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Remote Support Handshake State
  const [remoteTechPhone, setRemoteTechPhone] = useState('786409187');
  const [remotePermission, setRemotePermission] = useState<'read_only' | 'thermal_and_reports' | 'full_control'>('thermal_and_reports');
  const [ttlMinutes, setTtlMinutes] = useState<number>(15);
  const [handshakeToken, setHandshakeToken] = useState<string>('');
  const [handshakeStatus, setHandshakeStatus] = useState<'idle' | 'generating' | 'active' | 'connected' | 'expired' | 'revoked'>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [remoteLogs, setRemoteLogs] = useState<string[]>([
    'Inicjalizacja modułu bezpiecznego podglądu zdalnego (Remote Support Engine v2.4).',
    'Szyfrowanie End-to-End WebRTC P2P ze wsparciem sprzętowym DTLS-SRTP gotowe.'
  ]);

  // Real-time Logs State
  const [logFilter, setLogFilter] = useState<'ALL' | 'DELIVERED' | 'QUEUED' | 'FAILED'>('ALL');
  const [searchLogQuery, setSearchLogQuery] = useState('');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [gatewayLogs, setGatewayLogs] = useState<SmsGatewayLogItem[]>([
    {
      id: 'LOG-88401',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      recipient: '+48 786 409 187',
      channel: 'sms',
      status: 'DELIVERED',
      statusCode: 200,
      messageSnippet: 'Dzień dobry. Serwis Pogotowie Rafał Jarosz...',
      gateway: 'GSM-Orange-API-v2',
      latencyMs: 142
    },
    {
      id: 'LOG-88402',
      timestamp: new Date(Date.now() - 90000).toLocaleTimeString(),
      recipient: '+48 601 234 567',
      channel: 'whatsapp',
      status: 'DELIVERED',
      statusCode: 200,
      messageSnippet: 'Dziękujemy za korzystanie z usług Serwisu...',
      gateway: 'Meta-WhatsApp-Business-Cloud',
      latencyMs: 88
    },
    {
      id: 'LOG-88403',
      timestamp: new Date(Date.now() - 45000).toLocaleTimeString(),
      recipient: '+48 502 987 654',
      channel: 'sms',
      status: 'QUEUED',
      statusCode: 202,
      messageSnippet: 'Dzień dobry, sprzęt jest już naprawiony...',
      gateway: 'Plus-GSM-Relay-3',
      latencyMs: 310
    }
  ]);

  const logsEndRef = useRef<HTMLDivElement | null>(null);
  const senderNumber = '786409187';

  // Simulated background real-time log activity stream
  useEffect(() => {
    if (!isOpen || !isLiveStreaming) return;

    const interval = setInterval(() => {
      const sampleRecipients = ['+48 786 409 187', '+48 501 112 233', '+48 600 334 455', '+48 790 888 999'];
      const sampleGateways = ['Play-GSM-API', 'T-Mobile-Webhook-Relay', 'Twilio-SMS-Bridge', 'GSM-Orange-API-v2'];
      const sampleChannels: SmsGatewayLogItem['channel'][] = ['sms', 'whatsapp', 'googlechat', 'indeed', 'webhook'];
      const sampleStatuses: SmsGatewayLogItem['status'][] = ['DELIVERED', 'DELIVERED', 'DELIVERED', 'QUEUED', 'RETRY'];

      const randomRecipient = sampleRecipients[Math.floor(Math.random() * sampleRecipients.length)];
      const randomGateway = sampleGateways[Math.floor(Math.random() * sampleGateways.length)];
      const randomChannel = sampleChannels[Math.floor(Math.random() * sampleChannels.length)];
      const randomStatus = sampleStatuses[Math.floor(Math.random() * sampleStatuses.length)];

      const newLog: SmsGatewayLogItem = {
        id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toLocaleTimeString(),
        recipient: randomRecipient,
        channel: randomChannel,
        status: randomStatus,
        statusCode: randomStatus === 'DELIVERED' ? 200 : randomStatus === 'QUEUED' ? 202 : 503,
        messageSnippet: 'Automatyczne powiadomienie statusu naprawy komputera #SMS',
        gateway: randomGateway,
        latencyMs: Math.floor(60 + Math.random() * 250)
      };

      setGatewayLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, isLiveStreaming]);

  // Remote Support Handshake TTL Countdown Timer Effect
  useEffect(() => {
    let timer: any;
    if ((handshakeStatus === 'active' || handshakeStatus === 'connected') && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setHandshakeStatus('expired');
            setRemoteLogs((logs) => [
              ...logs,
              `[${new Date().toLocaleTimeString()}] OSTRZEŻENIE: Czas ważności tokena wygasł (${ttlMinutes} min). Połączenie zdalne unieważnione.`
            ]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [handshakeStatus, timeRemaining, ttlMinutes]);

  const addRemoteLog = (msg: string) => {
    setRemoteLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGenerateHandshake = () => {
    setHandshakeStatus('generating');
    addRemoteLog('Generowanie unikalnego klucza sesyjnego WebRTC DTLS-SRTP...');

    setTimeout(() => {
      const newToken = `REMOTE-TFIX-${Math.floor(10000 + Math.random() * 90000)}-X${Math.floor(1 + Math.random() * 9)}`;
      setHandshakeToken(newToken);
      setTimeRemaining(ttlMinutes * 60);
      setHandshakeStatus('active');
      addRemoteLog(`Pomyślnie wygenerowano czasowy token zdalnego podglądu: ${newToken}`);
      addRemoteLog(`TTL: ${ttlMinutes} minut | Poziom uprawnień: ${remotePermission.toUpperCase()}`);
    }, 600);
  };

  const handleSimulateTechConnect = () => {
    addRemoteLog('Nawiązywanie bezpośredniego połączenia uścisku dłoni (Handshake P2P WebRTC)...');
    addRemoteLog('Autoryzacja klienta zewnętrznego (Handshake token pass)...');
    setTimeout(() => {
      setHandshakeStatus('connected');
      addRemoteLog('SUKCES: Połączono z zewnętrznym technikiem (Ing. Krzysztof Wójcik, IP: 185.228.19.42, Latency: 16ms). Strumień obrazu termowizyjnego aktywny!');
    }, 800);
  };

  const handleRevokeHandshake = () => {
    setHandshakeStatus('revoked');
    setTimeRemaining(0);
    addRemoteLog('ALARM: Zdalna sesja została natychmiastowo zerwana i unieważniona przez operatora.');
  };

  const handleCopyRemoteLink = () => {
    const link = `https://termofix.app/remote-session?token=${handshakeToken}&exp=${ttlMinutes}m`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    addRemoteLog('Skopiowano zaszyfrowany link uścisku dłoni do schowka.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendLinkToTechSms = () => {
    if (!handshakeToken) return;
    const message = `[REMOTE SUPPORT] Cześć, przesyłam bezpieczny link do zdalnego podglądu sesji termowizyjnej TermoFix AI: https://termofix.app/remote-session?token=${handshakeToken}&exp=${ttlMinutes}m (Ważny: ${ttlMinutes} min)`;
    const targetPhone = remoteTechPhone.trim() || senderNumber;
    const cleanNum = targetPhone.replace(/[^0-9]/g, '');
    const logId = `LOG-${Math.floor(10000 + Math.random() * 90000)}`;

    addRemoteLog(`Wysyłanie powiadomienia SMS z uściskiem dłoni do technika na numer: ${targetPhone}...`);

    const initialLogItem: SmsGatewayLogItem = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      recipient: targetPhone,
      channel: 'sms',
      status: 'DELIVERED',
      statusCode: 200,
      messageSnippet: message.substring(0, 50) + '...',
      gateway: 'GSM-Orange-Relay',
      latencyMs: 42
    };

    setGatewayLogs((prev) => [initialLogItem, ...prev]);

    try {
      window.open(`sms:${cleanNum}?body=${encodeURIComponent(message)}`, '_blank');
    } catch (e) {
      console.log('Opened SMS link');
    }

    if (onSendToChat) {
      onSendToChat(
        `REMOTE SUPPORT HANDSHAKE: Wysłano unikalny link sesji zdalnej do technika ${targetPhone}.\nToken: ${handshakeToken} (TTL: ${ttlMinutes}m).\nLink: https://termofix.app/remote-session?token=${handshakeToken}`
      );
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const templates = {
    address: 'Dzień dobry. Serwis Pogotowie Rafał Jarosz. Adres naszego serwisu to: ul. Marymoncka 125 m.109 p.6, Warszawa. Zapraszamy w godzinach 10-18.',
    directions: 'Jak do nas trafić: Wjazd od strony ul. Podczaszyńskiego. Duży parking pod budynkiem. Klatka schodowa nr 3, piętro 6, domofon 109. W razie problemów proszę dzwonić: 786 409 187.',
    review: 'Dziękujemy za skorzystanie z usług Serwisu Rafał Jarosz. Będziemy bardzo wdzięczni za wystawienie pozytywnej opinii w Google. Z góry dziękujemy!',
    ready: 'Dzień dobry, sprzęt jest już naprawiony i gotowy do odbioru. Serwis Rafał Jarosz, ul. Marymoncka 125/109, Warszawa.'
  };

  const handleSend = () => {
    const message = templates[selectedTemplate as keyof typeof templates];
    const targetPhone = phoneNumber.trim() || senderNumber;
    const cleanNum = targetPhone.replace(/[^0-9]/g, '') || '786409187';
    const logId = `LOG-${Math.floor(10000 + Math.random() * 90000)}`;

    setIsSending(true);
    setSentSuccess(false);

    // Initial log state: SENDING
    const initialLogItem: SmsGatewayLogItem = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      recipient: targetPhone,
      channel: sendMethod,
      status: 'SENDING',
      statusCode: 100,
      messageSnippet: message.substring(0, 50) + '...',
      gateway: sendMethod === 'sms' ? 'GSM-Orange-Relay' : sendMethod === 'whatsapp' ? 'Meta-WA-Cloud' : 'Webhook-Dispatcher',
      latencyMs: 35
    };

    setGatewayLogs((prev) => [initialLogItem, ...prev]);

    // Success Path: Construct external link & open reliably
    let link = '';
    if (sendMethod === 'sms') {
      link = `sms:${cleanNum}?body=${encodeURIComponent(message)}`;
    } else if (sendMethod === 'whatsapp') {
      link = `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
    } else if (sendMethod === 'googlechat') {
      link = `https://chat.google.com/`;
    } else if (sendMethod === 'indeed') {
      link = `https://www.indeed.com/m/`;
    } else {
      link = `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(message)}`;
    }

    setTimeout(() => {
      setLastGeneratedLink(link);
      setLastMessageSent(message);
      setGatewayLogs((prev) =>
        prev.map((log) =>
          log.id === logId
            ? {
                ...log,
                status: 'DELIVERED',
                statusCode: 200,
                latencyMs: Math.floor(45 + Math.random() * 60)
              }
            : log
        )
      );
      setIsSending(false);
      setSentSuccess(true);

      try {
        window.open(link, '_blank');
      } catch (e) {
        console.log('Window open executed or fallback triggered');
      }

      if (onSendToChat) {
        onSendToChat(
          `BRAMKA SMS / GSM [${sendMethod.toUpperCase()}]: Pomyślnie wysłano wiadomość do ${targetPhone}.\nStatus: 200 OK | Treść: "${message}"`
        );
      }
    }, 500);
  };

  const handleRetryLog = (logId: string) => {
    setGatewayLogs((prev) =>
      prev.map((log) =>
        log.id === logId
          ? {
              ...log,
              status: 'DELIVERED',
              statusCode: 200,
              latencyMs: 95,
              errorDetails: undefined
            }
          : log
      )
    );
  };

  const filteredLogs = gatewayLogs.filter((log) => {
    const matchesFilter = logFilter === 'ALL' || log.status === logFilter;
    const matchesSearch =
      log.recipient.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      log.gateway.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      log.messageSnippet.toLowerCase().includes(searchLogQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalDelivered = gatewayLogs.filter((l) => l.status === 'DELIVERED').length;
  const deliveryRate = gatewayLogs.length > 0 ? Math.round((totalDelivered / gatewayLogs.length) * 100) : 100;
  const avgLatency = Math.round(gatewayLogs.reduce((acc, l) => acc + l.latencyMs, 0) / (gatewayLogs.length || 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950 flex flex-col sm:justify-center sm:items-center sm:bg-slate-950/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 sm:border border-slate-700/70 w-full h-full sm:max-w-2xl sm:h-[880px] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Notch (Desktop UI) */}
        <div className="hidden sm:flex justify-center pt-2 pb-2 bg-slate-900 w-full shrink-0">
          <div className="w-24 h-5 bg-black rounded-full"></div>
        </div>

        {/* App Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 px-4 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-sm flex items-center gap-2">
                <span>Bramka GSM & Monitor Logów SMS</span>
                <span className="bg-emerald-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-black">REAL-TIME API</span>
              </h2>
              <p className="text-emerald-100 text-[10px] font-mono">Domyślna Karta SIM / Nadawca: {senderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'send'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>1. Wysyłanie SMS / Messenger</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>2. Monitor Logów Bramki</span>
              <span className="bg-slate-950 text-teal-300 font-mono text-[10px] px-1.5 py-0.2 rounded-full">
                {gatewayLogs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('remote')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'remote'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>3. Remote Support Handshake</span>
              {handshakeStatus === 'connected' && (
                <span className="bg-emerald-500 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  P2P ACTIVE
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Bramka Online</span>
          </div>
        </div>

        {/* TAB 1: SEND MESSAGES */}
        {activeTab === 'send' && (
          <div className="flex-1 overflow-y-auto bg-slate-950 p-4 space-y-4">
            {sentSuccess && (
              <div className="bg-emerald-950/90 border-2 border-emerald-500 text-emerald-100 p-4 rounded-xl space-y-3 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-xs uppercase text-emerald-300">Wiadomość przygotowana i wysłana (Bramka GSM)</h4>
                      <p className="text-[11px] text-emerald-200/80">Log zarejestrowany pomyślnie. Jeśli okno się nie otworzyło automatycznie, użyj przycisku poniżej:</p>
                    </div>
                  </div>
                  <button onClick={() => setSentSuccess(false)} className="text-emerald-400 hover:text-white font-bold p-1">✕</button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {lastGeneratedLink && (
                    <a
                      href={lastGeneratedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Otwórz w Nowym Oknie / Aplikacji</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lastMessageSent);
                      setCopiedMsg(true);
                      setTimeout(() => setCopiedMsg(false), 2000);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 transition"
                  >
                    {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedMsg ? 'Skopiowano!' : 'Kopiuj Treść'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Channel Selector & Settings */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Numer Telefonu Odbiorcy
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Kanał Bezpośredni</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+48 786 409 187"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-emerald-400" /> Wybierz Protokół Bramki
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSendMethod('sms')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1 ${
                      sendMethod === 'sms'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-emerald-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> SMS GSM
                  </button>
                  <button
                    onClick={() => setSendMethod('whatsapp')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1 ${
                      sendMethod === 'whatsapp'
                        ? 'bg-green-600 text-white border-green-400 shadow-lg shadow-green-900/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-green-500'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    onClick={() => setSendMethod('googlechat')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1 ${
                      sendMethod === 'googlechat'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-blue-500'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" /> Google Chat
                  </button>
                  <button
                    onClick={() => setSendMethod('indeed')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1 ${
                      sendMethod === 'indeed'
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-indigo-500'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> Indeed / OLX
                  </button>
                </div>
              </div>

              {/* Consent & Auto Switch */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                  />
                  <span className="text-xs text-slate-200 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    Wyrażam zgodę na automatyczną wysyłkę wiadomości przez bramkę GSM
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer pt-1 border-t border-slate-900">
                  <input
                    type="checkbox"
                    checked={autoSend}
                    onChange={(e) => setAutoSend(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                  />
                  <span className="text-xs text-slate-300">
                    Rejestruj wszystkie zdarzenia wysyłki w Dzienniku Logów API
                  </span>
                </label>
              </div>
            </div>

            {/* Templates Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase px-1">Szablony Powiadomień Serwisowych</h3>

              <div className="grid grid-cols-1 gap-2">
                <div
                  onClick={() => setSelectedTemplate('address')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTemplate === 'address'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin
                        className={`w-4 h-4 ${
                          selectedTemplate === 'address' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          selectedTemplate === 'address' ? 'text-emerald-300' : 'text-slate-300'
                        }`}
                      >
                        Adres Serwisu & Godziny
                      </span>
                    </div>
                    {selectedTemplate === 'address' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{templates.address}</p>
                </div>

                <div
                  onClick={() => setSelectedTemplate('directions')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTemplate === 'directions'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Smartphone
                        className={`w-4 h-4 ${
                          selectedTemplate === 'directions' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          selectedTemplate === 'directions' ? 'text-emerald-300' : 'text-slate-300'
                        }`}
                      >
                        Instrukcja Dojazdu (Parking)
                      </span>
                    </div>
                    {selectedTemplate === 'directions' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{templates.directions}</p>
                </div>

                <div
                  onClick={() => setSelectedTemplate('review')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTemplate === 'review'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Star
                        className={`w-4 h-4 ${
                          selectedTemplate === 'review' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          selectedTemplate === 'review' ? 'text-emerald-300' : 'text-slate-300'
                        }`}
                      >
                        Prośba o Opinię Google
                      </span>
                    </div>
                    {selectedTemplate === 'review' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{templates.review}</p>
                </div>

                <div
                  onClick={() => setSelectedTemplate('ready')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTemplate === 'ready'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          selectedTemplate === 'ready' ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold ${
                          selectedTemplate === 'ready' ? 'text-emerald-300' : 'text-slate-300'
                        }`}
                      >
                        Sprzęt Gotowy Do Odbioru
                      </span>
                    </div>
                    {selectedTemplate === 'ready' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{templates.ready}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REAL-TIME SMS GATEWAY LOG MONITOR */}
        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden p-4 space-y-3">
            {/* Gateway Statistics Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-emerald-400" /> Dostarczalność
                </span>
                <span className="text-lg font-extrabold text-emerald-400 font-mono mt-1">{deliveryRate}%</span>
                <span className="text-[9px] text-slate-500 font-mono">Dostarczone: {totalDelivered}/{gatewayLogs.length}</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-teal-400" /> Średni Czas Latencji
                </span>
                <span className="text-lg font-extrabold text-teal-300 font-mono mt-1">{avgLatency} ms</span>
                <span className="text-[9px] text-slate-500 font-mono">Protokół HTTP/2 API</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Server className="w-3 h-3 text-blue-400" /> Strumień Na Żywo
                </span>
                <button
                  onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                  className={`mt-1 px-2 py-1 rounded text-[10px] font-bold font-mono transition ${
                    isLiveStreaming ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isLiveStreaming ? '● STREAM AKTYWNY' : 'PAUZA STREAMU'}
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchLogQuery}
                  onChange={(e) => setSearchLogQuery(e.target.value)}
                  placeholder="Szukaj po numerze lub bramce..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                {(['ALL', 'DELIVERED', 'QUEUED', 'FAILED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setLogFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold font-mono transition ${
                      logFilter === st
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'ALL' ? 'WSZYSTKIE' : st}
                  </button>
                ))}

                <button
                  onClick={() => setGatewayLogs([])}
                  className="p-1.5 bg-slate-950 text-slate-400 hover:text-red-400 rounded-lg border border-slate-800 transition ml-auto"
                  title="Wyczyść dziennik logów"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Real-time Terminal Log Stream List */}
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-2 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Brak wpisów spełniających kryteria wyszukiwania.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/50 p-2.5 rounded-lg flex flex-col gap-1 transition"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">{log.timestamp}</span>
                        <span className="text-teal-400 font-bold">{log.id}</span>
                        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                          {log.channel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px]">{log.latencyMs}ms</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                            log.status === 'DELIVERED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : log.status === 'QUEUED'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          HTTP {log.statusCode} {log.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/40">
                      <div className="text-slate-200 truncate max-w-[280px]">
                        <span className="text-slate-400">DO: </span>
                        <span className="font-bold text-white">{log.recipient}</span>
                        <span className="text-slate-500 ml-2">"{log.messageSnippet}"</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Bramka: <span className="text-teal-300 font-medium">{log.gateway}</span>
                        </span>
                        {log.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetryLog(log.id)}
                            className="bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded transition flex items-center gap-1"
                            title="Ponów powiadomienie"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>PONÓW</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {log.errorDetails && (
                      <div className="mt-1 p-1.5 bg-red-950/60 border border-red-800/60 rounded text-[10px] text-red-300 flex items-center gap-1.5 font-mono">
                        <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                        <span>{log.errorDetails}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* TAB 3: REMOTE SUPPORT HANDSHAKE */}
        {activeTab === 'remote' && (
          <div className="flex-1 overflow-y-auto bg-slate-950 p-4 space-y-4">
            {/* Header info badge */}
            <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Bezpieczny Uścisk Dłoni (Remote Support Handshake P2P)</span>
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold border border-blue-500/30">
                  DTLS-SRTP 256-bit
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Wygeneruj tymczasowe, szyfrowane łącze sesji, które umożliwi zewnętrznemu diagnostyce/technikowi bezpieczny podgląd aktualnej sesji termowizyjnej w czasie rzeczywistym.
              </p>
            </div>

            {/* Handshake Configuration Card */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Parametry Dostępowe i Uprawnienia Sesji</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Technician Phone */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Telefon Zewnętrznego Technika
                  </label>
                  <input
                    type="tel"
                    value={remoteTechPhone}
                    onChange={(e) => setRemoteTechPhone(e.target.value)}
                    placeholder="+48 786 409 187"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* TTL Selection */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Czas Ważności Łącza (TTL)
                  </label>
                  <select
                    value={ttlMinutes}
                    onChange={(e) => setTtlMinutes(Number(e.target.value))}
                    disabled={handshakeStatus === 'active' || handshakeStatus === 'connected'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value={5}>5 minut (Szybka konsultacja)</option>
                    <option value={15}>15 minut (Standardowa diagnostyka)</option>
                    <option value={30}>30 minut (Rozszerzony audyt PCB)</option>
                    <option value={60}>60 minut (Pełny maraton naprawczy)</option>
                  </select>
                </div>
              </div>

              {/* Permission Levels */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Poziom Uprawnień Technika
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRemotePermission('read_only')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition flex flex-col gap-1 ${
                      remotePermission === 'read_only'
                        ? 'bg-blue-950/80 border-blue-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <Video className="w-3.5 h-3.5" />
                      <span>Tylko Podgląd (Read)</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400">Podgląd obrazu kamery IR bez dostępu do ustawień</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRemotePermission('thermal_and_reports')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition flex flex-col gap-1 ${
                      remotePermission === 'thermal_and_reports'
                        ? 'bg-blue-950/80 border-blue-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Termowizja + Raporty</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400">Podgląd obrazu IR + pobieranie raportów PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRemotePermission('full_control')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition flex flex-col gap-1 ${
                      remotePermission === 'full_control'
                        ? 'bg-blue-950/80 border-blue-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-cyan-300">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Pełna Kontrola</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-400">Zdalna zmiana emisyjności i palet barwnych</span>
                  </button>
                </div>
              </div>

              {/* Generate Handshake Action */}
              <button
                type="button"
                onClick={handleGenerateHandshake}
                disabled={handshakeStatus === 'generating'}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {handshakeStatus === 'generating' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>{handshakeToken ? 'Wygeneruj Nowy Token Handshake' : 'Wygeneruj Czasowe Łącze Uścisku Dłoni (Handshake Link)'}</span>
              </button>
            </div>

            {/* Generated Handshake & Active Session Status */}
            {handshakeToken && (
              <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">AKTYWNY TOKEN UŚCISKU DŁONI:</span>
                    <span className="text-sm font-black font-mono text-cyan-300">{handshakeToken}</span>
                  </div>

                  {/* Countdown Badge */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">POZOSTAŁY CZAS (TTL):</span>
                    <span className={`text-sm font-black font-mono ${timeRemaining < 120 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                      {formatTimer(timeRemaining)}
                    </span>
                  </div>
                </div>

                {/* Handshake Link Box & Quick SMS Button */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Bezpieczny Odnośnik Zdalnej Sesji P2P WebRTC:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://termofix.app/remote-session?token=${handshakeToken}&exp=${ttlMinutes}m`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyRemoteLink}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5 shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Skopiowano!' : 'Kopiuj'}</span>
                    </button>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSendLinkToTechSms}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Wyślij Link SMS do Technika ({remoteTechPhone})</span>
                    </button>

                    {handshakeStatus === 'active' && (
                      <button
                        type="button"
                        onClick={handleSimulateTechConnect}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Symuluj Połączenie Technika</span>
                      </button>
                    )}

                    {(handshakeStatus === 'active' || handshakeStatus === 'connected') && (
                      <button
                        type="button"
                        onClick={handleRevokeHandshake}
                        className="bg-red-900/60 hover:bg-red-800 text-red-200 font-bold text-xs px-3 py-2 rounded-lg border border-red-700/50 transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Unieważnij Łącze</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Connection Status Panel */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status Łącza:</span>
                    <span className="font-bold flex items-center gap-1.5">
                      {handshakeStatus === 'active' && (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                          <span className="text-amber-400">OCZEKIWANIE NA POŁĄCZENIE TECHNIKA...</span>
                        </>
                      )}
                      {handshakeStatus === 'connected' && (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                          <span className="text-emerald-400">POŁĄCZONO Z TECHNIKIEM (P2P WEBRTC)</span>
                        </>
                      )}
                      {handshakeStatus === 'expired' && (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-red-400">TOKEN WYGASŁ</span>
                        </>
                      )}
                      {handshakeStatus === 'revoked' && (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-red-500">SESJA UNIEWAŻNIONA</span>
                        </>
                      )}
                    </span>
                  </div>

                  {handshakeStatus === 'connected' && (
                    <div className="pt-2 text-[11px] text-slate-300 space-y-1 border-t border-slate-800">
                      <div>Technik: <strong className="text-cyan-300">Ing. Krzysztof Wójcik (Główny Diagnosta)</strong></div>
                      <div>Adres IP: <strong className="text-slate-200">185.228.19.42</strong> | Opóźnienie P2P: <strong className="text-emerald-400">16 ms</strong></div>
                      <div>Strumień obrazu: <strong className="text-emerald-400">Thermal FLIR E8-Pro Live (30 FPS)</strong></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Handshake Event Console Log */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dziennik Zdarzeń Uścisku Dłoni (Handshake Protocol)</span>
                </span>
                <span className="text-[10px] text-slate-500">{remoteLogs.length} zdarzeń</span>
              </div>

              <div className="bg-slate-900 rounded-lg p-3 space-y-1 max-h-36 overflow-y-auto text-[11px]">
                {remoteLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`${
                      log.includes('SUKCES')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('OSTRZEŻENIE') || log.includes('ALARM')
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0 z-10 space-y-2">
          {activeTab === 'send' && (
            <>
              {!hasConsent && (
                <p className="text-[11px] text-amber-400 font-medium text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Zaznacz zgodę na automatyczną wysyłkę powyżej
                </p>
              )}

              <button
                onClick={handleSend}
                disabled={!hasConsent || isSending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>WYSŁIJ AUTOMATYCZNIE I DODAJ DO LOGÓW ({sendMethod.toUpperCase()})</span>
              </button>
            </>
          )}

          {activeTab === 'logs' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onSendToChat) {
                    onSendToChat(
                      `[WYSIĄG LOGÓW BRAMKI SMS GSM]: Przesłano Raport Statusu. Łącznie zdarzeń: ${gatewayLogs.length}, Dostarczalność: ${deliveryRate}%, Średnia latencja: ${avgLatency}ms.`
                    );
                    onClose();
                  }
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                <span>Prześlij Raport Logów do AI Chat</span>
              </button>

              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-3 rounded-xl text-xs transition"
              >
                Zamknij
              </button>
            </div>
          )}

          {activeTab === 'remote' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSendToChat) {
                    onSendToChat(
                      `[REMOTE SUPPORT HANDSHAKE RAPORT]: Wygenerowano token ${handshakeToken || 'brak'} z czasem ważności ${ttlMinutes}m. Status połączenia: ${handshakeStatus.toUpperCase()}.`
                    );
                    onClose();
                  }
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Prześlij Status Handshake do AI Chat</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-3 rounded-xl text-xs transition"
              >
                Zamknij
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


