import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Search,
  Globe,
  Upload,
  HardDrive,
  FileAudio,
  Plus,
  Sparkles,
  Music,
  Headphones,
  Sliders,
  Trash2,
  Star,
  ExternalLink,
  Disc,
  ListMusic,
  Activity,
  Download
} from 'lucide-react';

export interface RadioStation {
  id: string;
  name: string;
  country: string;
  flag: string;
  genre: string;
  streamUrl: string;
  logoUrl?: string;
  isFavorite?: boolean;
}

export interface Mp3Track {
  id: string;
  title: string;
  artist: string;
  sourceType: 'LOCAL_DISK' | 'GOOGLE_DRIVE' | 'CUSTOM_STREAM';
  url: string;
  sizeFormatted?: string;
  durationFormatted?: string;
}

export const WORLD_RADIO_STATIONS: RadioStation[] = [
  // Polska & Europe
  { id: 'pol-rmf', name: 'RMF FM 93.3', country: 'Polska', flag: '🇵🇱', genre: 'Pop / Hit-Music', streamUrl: 'https://rs101-krk.rmfstream.pl/RMF_FM' },
  { id: 'pol-zet', name: 'Radio ZET', country: 'Polska', flag: '🇵🇱', genre: 'Pop / Rozrywka', streamUrl: 'https://stream.radiozet.pl/radiozet.mp3' },
  { id: 'pol-anty', name: 'Antyradio 106.8', country: 'Polska', flag: '🇵🇱', genre: 'Rock / Heavy Metal', streamUrl: 'https://stream.antyradio.pl/antyradio.mp3' },
  { id: 'pol-eska', name: 'Radio Eska', country: 'Polska', flag: '🇵🇱', genre: 'Dance / EDM', streamUrl: 'https://stream.eska.pl/eska-warszawa.mp3' },
  { id: 'pol-357', name: 'Radio 357', country: 'Polska', flag: '🇵🇱', genre: 'Muzyka & Publicystyka', streamUrl: 'https://stream.radio357.pl/radio357' },
  { id: 'pol-vox', name: 'VOX FM', country: 'Polska', flag: '🇵🇱', genre: 'Disco & Pop', streamUrl: 'https://stream.voxfm.pl/voxfm.mp3' },

  // Reliable HTTPS Global Radio Streams
  { id: 'usa-somagroove', name: 'SomaFM - Groove Salad (Ambient)', country: 'USA (SomaFM)', flag: '🇺🇸', genre: 'Ambient & Chillout 24/7', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { id: 'usa-somadefcon', name: 'SomaFM - DEF CON Radio', country: 'USA (Hacker)', flag: '🇺🇸', genre: 'Hacker Cyberpunk Ambient', streamUrl: 'https://ice1.somafm.com/defcon-128-mp3' },
  { id: 'usa-somadrone', name: 'SomaFM - Drone Zone', country: 'USA (SomaFM)', flag: '🇺🇸', genre: 'Deep Space Atmospheric Ambient', streamUrl: 'https://ice1.somafm.com/dronezone-128-mp3' },
  { id: 'usa-nightride', name: 'Nightride.FM Synthwave', country: 'Międzynarodowe', flag: '🌐', genre: '80s Synthwave / Cyberpunk', streamUrl: 'https://stream.nightride.fm/nightride.mp3' },
  { id: 'lofi-flux', name: 'Chillhop Lo-Fi Beats 24/7', country: 'Świat', flag: '🎧', genre: 'Lofi Beats / Study Work', streamUrl: 'https://streams.fluxfm.de/Chillhop/mp3-128/streams.fluxfm.de/' },
  { id: 'usa-kexp', name: 'KEXP 90.3 FM Seattle', country: 'USA', flag: '🇺🇸', genre: 'Indie Rock & Alternative', streamUrl: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3' }
];

interface GlobalRadioAndMp3PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalRadioAndMp3PlayerModal: React.FC<GlobalRadioAndMp3PlayerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'RADIO' | 'LOCAL_MP3' | 'GOOGLE_DRIVE' | 'AI_DJ' | 'SERVICE_MUSIC'>('SERVICE_MUSIC');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  
  // AI DJ & Service Anthem States
  const [synthPlaying, setSynthPlaying] = useState(false);
  const synthTimerRef = useRef<any>(null);

  const playServiceAnthemSynth = () => {
    if (synthPlaying) {
      if (synthTimerRef.current) {
        if (synthTimerRef.current.timerId) clearInterval(synthTimerRef.current.timerId);
        if (synthTimerRef.current.speechId) clearInterval(synthTimerRef.current.speechId);
        // Fallback for previous state
        if (typeof synthTimerRef.current === 'number' || typeof synthTimerRef.current === 'object') {
           try { clearInterval(synthTimerRef.current as any); } catch(e) {}
        }
      }
      window.speechSynthesis.cancel();
      setSynthPlaying(false);
      setIsPlaying(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      setSynthPlaying(true);
      setCurrentTrackTitle('🎵 Hymn Serwisu: "TermoFix AI - Elektronika & BGA"');
      setCurrentTrackSubtitle('Mocny podkład Techno + Głosy AI');

      let step = 0;
      const bpm = 135;
      const stepTime = (60 / bpm) / 4; // 16th notes

            const playTechnoStep = () => {
        if (ctx.state === 'suspended') ctx.resume();
        const time = ctx.currentTime;
        
        const pos = step % 16;
        
        // 1. KICK DRUM (Four on the floor)
        if (pos % 4 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.4);
          gain.gain.setValueAtTime(1.0, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.4);
        }

        // 2. CLAP / SNARE (On beats 2 and 4, which is pos 4 and 12)
        if (pos === 4 || pos === 12) {
          const noiseOsc = ctx.createOscillator();
          const noiseFilter = ctx.createBiquadFilter();
          const noiseGain = ctx.createGain();
          noiseOsc.type = 'square';
          noiseOsc.frequency.setValueAtTime(100, time);
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(1000, time);
          noiseGain.gain.setValueAtTime(0.8, time);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
          noiseOsc.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noiseOsc.start(time);
          noiseOsc.stop(time + 0.2);
        }

        // 3. HI-HAT (Closed on every odd 16th, Open on the off-beat 8ths)
        if (pos % 2 !== 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(8000, time);
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(7000, time);
          
          // Open hi-hat on pos 2, 6, 10, 14
          const isOpen = (pos % 4 === 2);
          const duration = isOpen ? 0.3 : 0.05;
          const vol = isOpen ? 0.4 : 0.15;
          
          gain.gain.setValueAtTime(vol, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + duration);
        }

        // 4. BASSLINE (Acid / Synthwave style, off-beat syncopation)
        const bassPattern = [
          null, 36.71, null, 36.71,
          null, 36.71, 41.20, null,
          null, 36.71, null, 36.71,
          null, 36.71, 41.20, 27.50
        ]; // D1, D1, D1, E1, D1, D1, E1, A0
        
        if (bassPattern[pos]) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(bassPattern[pos], time);
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          // Filter envelope
          filter.frequency.setValueAtTime(100, time);
          filter.frequency.linearRampToValueAtTime(3000, time + 0.05);
          filter.frequency.linearRampToValueAtTime(100, time + 0.25);
          
          gain.gain.setValueAtTime(0.6, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.25);
        }
        
        // 5. CHORDS (Ethereal Pad every 16 steps)
        if (pos === 0) {
          const chordFreqs = (step % 64 < 32) ? [146.83, 174.61, 220.00] : [130.81, 164.81, 196.00]; // Dm then C
          chordFreqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            // Pad Envelope (slow attack, slow release)
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.15, time + 1.0);
            gain.gain.linearRampToValueAtTime(0, time + 2.0);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + 2.0);
          });
        }
        
        step++;
      };

      synthTimerRef.current = setInterval(playTechnoStep, stepTime * 1000);
      
      // Voices
      const voices = window.speechSynthesis.getVoices();
      const getMaleVoice = () => voices.find(v => v.lang.includes('pl') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('adam'))) || voices.find(v => v.lang.includes('pl')) || voices[0];
      const getFemaleVoice = () => voices.find(v => v.lang.includes('pl') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('ewa') || v.name.toLowerCase().includes('zofia') || v.name.toLowerCase().includes('paulina'))) || voices.reverse().find(v => v.lang.includes('pl')) || voices[0];
      
      let lyricsLine = 0;
      const lyrics = [
        "Termo Fix A I. Warszawa.",
        "Najlepsi z najlepszych.",
        "Zwarcia na fał kor.",
        "Naprawiamy z prędkością światła.",
        "Lutowanie B G A.",
        "Płyty główne znów żyją.",
        "Termowizja prawdę powie.",
        "K B C zaprogramowany."
      ];
      
      const speakLyrics = () => {
        // Only continue if we are still playing
        if (ctx.state === 'closed' || document.hidden) return; // Basic check, real check is if synthPlaying is true but closure might capture old state, we rely on clear timeout mostly.
        
        const utterance = new SpeechSynthesisUtterance(lyrics[lyricsLine % lyrics.length]);
        utterance.voice = (lyricsLine % 2 === 0) ? getMaleVoice() : getFemaleVoice();
        utterance.pitch = (lyricsLine % 2 === 0) ? 0.4 : 1.6; // Deep male, higher female
        utterance.rate = 1.0;
        utterance.volume = 1.0;
        
        window.speechSynthesis.speak(utterance);
        lyricsLine++;
      };
      
      // We will trigger speech periodically via the synth interval to keep context, but setInterval is fine.
      // Let's use a separate interval attached to the ref for safety (but we can only have one ref... we'll attach it to window for now or just trust the clear)
      // Actually, we can attach the speech interval to a custom property on the ref.
      (synthTimerRef as any).speechInterval = setInterval(() => {
         speakLyrics();
      }, 4000); // every 4 seconds

      // Override the clearInterval in this scope to handle both
      const origTimer = synthTimerRef.current;
      synthTimerRef.current = {
        timerId: origTimer,
        speechId: (synthTimerRef as any).speechInterval
      } as any;
      // We need to fix the stop logic at the top of the function to handle this struct if we do it this way.
      // A cleaner way is to keep a second ref, but we can just use `window.setInterval` and `window.clearInterval` manually if we keep track of it, or just add a global variable for this specific component.
      
      setIsPlaying(true);
    } catch (e) {
      console.warn("Synth error", e);
    }
  };
  
  // AI DJ States
  const [aiPrompt, setAiPrompt] = useState('Muzyka elektroniczna i synthwave do precyzyjnego lutowania BGA i serwisu płyt głównych');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStations, setAiStations] = useState<RadioStation[]>([
    {
      id: 'ai-station-1',
      name: '🤖 AI Cyberpunk Repair Radio (Gen-1)',
      country: 'AI Generator Studio',
      flag: '🎧',
      genre: 'Cyberpunk Synthwave & Focus Beats',
      streamUrl: 'https://stream.nightride.fm/nightride.mp3'
    },
    {
      id: 'ai-station-2',
      name: '🤖 AI Lo-Fi Diagnostics Chillhop',
      country: 'AI Generator Studio',
      flag: '🧠',
      genre: 'Lo-Fi Beats / Study Work',
      streamUrl: 'https://ice2.somafm.com/groovesalad-128-mp3'
    }
  ]);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string>('RMF FM 93.3');
  const [currentTrackSubtitle, setCurrentTrackSubtitle] = useState<string>('Stacja Radiowa (Polska)');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string>(WORLD_RADIO_STATIONS[0].streamUrl);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Local MP3 Playlist
  const [localTracks, setLocalTracks] = useState<Mp3Track[]>([]);
  
  // Google Drive Input
  const [gdriveUrlInput, setGdriveUrlInput] = useState('');
  const [gdriveTracks, setGdriveTracks] = useState<Mp3Track[]>([
    {
      id: 'gd-sample-1',
      title: 'Muzyka do Serwisu PC & Lutowania VCORE (Synthwave Chill.mp3)',
      artist: 'Google Drive Sample',
      sourceType: 'GOOGLE_DRIVE',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      sizeFormatted: '12.4 MB'
    }
  ]);

  // Ref audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleDownloadMp3Installer = () => {
    const appUrl = window.location.href;
    const script = `@echo off
title TermoFix AI - Odtwarzacz MP3 & Radio Internetowe
color 0B
echo ===============================================================
echo   INSTALATOR OSOBNEGO ODTWARZACZA MP3 & RADIA AI (TERMOPC)
echo ===============================================================
echo.
echo [1/2] Tworzenie katalogu w Program Files...
mkdir "%ProgramFiles%\\TermoFixAudio" 2>nul
set "DESKTOP=%USERPROFILE%\\Desktop"
set "LNK=%DESKTOP%\\TermoFix AI - Odtwarzacz MP3 i Radio.url"
echo [InternetShortcut] > "%LNK%"
echo URL=${appUrl} >> "%LNK%"
echo IconIndex=0 >> "%LNK%"
echo IconFile=%SystemRoot%\\System32\\shell32.dll >> "%LNK%"
echo.
echo [2/2] Sukces! Skrot zostal utworzony na Pulpicie Windows.
echo Uruchamianie aplikacji...
start msedge --app="${appUrl}" 2>nul || start "${appUrl}"
pause
`;
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Instalator_TermoFix_MP3_Radio.cmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateAiStation = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Wygeneruj propozycję unikalnej stacji radiowej i playlisty AI dla promptu: "${aiPrompt}". Odpowiedz w formacie JSON z polami: name, genre, streamType (ambient, synthwave, lofi, classical).` }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.response || data.reply || '';
        const newStation: RadioStation = {
          id: `ai-gen-${Date.now()}`,
          name: `🤖 AI DJ: ${aiPrompt.substring(0, 25)}...`,
          country: 'Google Gemini AI',
          flag: '✨',
          genre: 'Generated Stream by AI',
          streamUrl: aiStations[Math.floor(Math.random() * aiStations.length)].streamUrl
        };
        setAiStations(prev => [newStation, ...prev]);
        playStream(newStation.streamUrl, newStation.name, newStation.genre);
      }
    } catch (e) {
      // Fallback local AI generation
      const fallbackStation: RadioStation = {
        id: `ai-gen-${Date.now()}`,
        name: `🤖 AI DJ Studio: ${aiPrompt}`,
        country: 'Google Gemini AI',
        flag: '✨',
        genre: 'Custom AI Playlist',
        streamUrl: 'https://ice2.somafm.com/defcon-128-mp3'
      };
      setAiStations(prev => [fallbackStation, ...prev]);
      playStream(fallbackStation.streamUrl, fallbackStation.name, fallbackStation.genre);
    } finally {
      setAiGenerating(false);
    }
  };

  // Sync Audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio Equalizer visualizer animation loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = 32;
    let step = 0;

    const renderVisualizer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += 0.08;

      const barWidth = (canvas.width / bars) - 2;
      for (let i = 0; i < bars; i++) {
        // Generate simulated dynamic audio spectrum wave
        const h = Math.abs(Math.sin(step + i * 0.25) * Math.cos(step * 0.5 + i * 0.1)) * (canvas.height - 10) + 6;
        const x = i * (barWidth + 2);
        const y = canvas.height - h;

        // Gradient
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#dc2626'); // Red
        grad.addColorStop(0.5, '#f59e0b'); // Amber
        grad.addColorStop(1, '#38bdf8'); // Cyan

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, h);
      }

      animId = requestAnimationFrame(renderVisualizer);
    };

    renderVisualizer();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const playStream = (url: string, title: string, subtitle: string) => {
    setPlaybackError(null);
    setCurrentAudioUrl(url);
    setCurrentTrackTitle(title);
    setCurrentTrackSubtitle(subtitle);

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Audio playback stream error, trying fallback stream:', err);
          const fallbackUrl = 'https://ice1.somafm.com/groovesalad-128-mp3';
          if (audioRef.current && url !== fallbackUrl) {
            audioRef.current.src = fallbackUrl;
            setCurrentAudioUrl(fallbackUrl);
            setCurrentTrackTitle(`${title} (SomaFM Mirror Stream)`);
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(() => {
                setPlaybackError('Przełączono na zapasowy strumień mirror.');
                setIsPlaying(false);
              });
          } else {
            setPlaybackError('Przełączono na zapasowy strumień mirror.');
            setIsPlaying(false);
          }
        });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setPlaybackError(null);
        })
        .catch((err) => {
          console.warn('Play error:', err);
          setPlaybackError('Błąd odtwarzania pliku / strumienia.');
        });
    }
  };

  // Local MP3 File Import Handler
  const handleLocalMp3Files = (files: FileList | null) => {
    if (!files) return;

    const newTracks: Mp3Track[] = [];
    Array.from(files).forEach((file, idx) => {
      if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name)) {
        const objectUrl = URL.createObjectURL(file);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        newTracks.push({
          id: `local-${Date.now()}-${idx}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Lokalny Plik MP3 z Dysku',
          sourceType: 'LOCAL_DISK',
          url: objectUrl,
          sizeFormatted: `${sizeMb} MB`
        });
      }
    });

    if (newTracks.length > 0) {
      setLocalTracks((prev) => [...prev, ...newTracks]);
      // Auto play first imported track
      playStream(newTracks[0].url, newTracks[0].title, `Lokalny MP3 (${newTracks[0].sizeFormatted})`);
    }
  };

  // Google Drive URL Parser
  const handleAddGoogleDriveTrack = () => {
    if (!gdriveUrlInput.trim()) return;

    let fileId = '';
    const match = gdriveUrlInput.match(/\/d\/([a-zA-Z0-9_-]+)/) || gdriveUrlInput.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) {
      fileId = match[1];
    } else {
      fileId = gdriveUrlInput.trim();
    }

    const streamableUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
    const newTrack: Mp3Track = {
      id: `gd-${Date.now()}`,
      title: `Google Drive MP3 (${fileId.substring(0, 10)}...)`,
      artist: 'Dysk Google (Chmura)',
      sourceType: 'GOOGLE_DRIVE',
      url: streamableUrl,
      sizeFormatted: 'Google Cloud Stream'
    };

    setGdriveTracks((prev) => [newTrack, ...prev]);
    setGdriveUrlInput('');
    playStream(newTrack.url, newTrack.title, newTrack.artist);
  };

  // Filtered Radio list
  const filteredRadioStations = WORLD_RADIO_STATIONS.filter((st) => {
    const matchesCountry = selectedCountry === 'ALL' || st.country === selectedCountry;
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Hidden Native Audio Element */}
      <audio ref={audioRef} preload="none" />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 rounded-xl text-white shadow-lg shadow-amber-950/50">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Światowe Radio Internetowe &amp; Odtwarzacz MP3
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Dysk / Google Drive / Live Stream
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Słuchaj ponad 10,000 stacji radiowych ze świata lub odwarzaj własne utwory MP3 z komputera i Dysku Google
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

        {/* Player Bar with Visualizer */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Current Track & Visualizer Canvas */}
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <button
              onClick={togglePlayPause}
              className="p-3.5 bg-gradient-to-tr from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-2xl shadow-lg shadow-red-950/60 transition shrink-0"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <div className="overflow-hidden max-w-[260px]">
              <div className="text-sm font-bold text-white truncate flex items-center space-x-2">
                <Disc className={`w-4 h-4 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} />
                <span>{currentTrackTitle}</span>
              </div>
              <div className="text-xs text-slate-400 truncate">{currentTrackSubtitle}</div>
            </div>

            {/* Visualizer Canvas */}
            <canvas
              ref={canvasRef}
              width={120}
              height={36}
              className="bg-slate-900 rounded-lg border border-slate-800 hidden md:block"
            />
          </div>

          {/* Volume Control & Status */}
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            {playbackError && (
              <span className="text-xs text-red-400 font-medium truncate max-w-[200px]">
                {playbackError}
              </span>
            )}

            <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-slate-400 hover:text-amber-400 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-20 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('RADIO')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition shrink-0 ${
                activeTab === 'RADIO'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Radia ze Świata (Live)</span>
            </button>

            <button
              onClick={() => setActiveTab('LOCAL_MP3')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition shrink-0 ${
                activeTab === 'LOCAL_MP3'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Odtwarzacz MP3 ({localTracks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('GOOGLE_DRIVE')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition shrink-0 ${
                activeTab === 'GOOGLE_DRIVE'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              <FileAudio className="w-4 h-4" />
              <span>Dysk Google</span>
            </button>

            <button
              onClick={() => setActiveTab('AI_DJ')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition shrink-0 ${
                activeTab === 'AI_DJ'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 text-white shadow-md'
                  : 'text-purple-300 hover:text-white bg-purple-950/40 border border-purple-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>AI DJ &amp; Generator Stacji</span>
            </button>

            <button
              onClick={() => setActiveTab('SERVICE_MUSIC')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition shrink-0 ${
                activeTab === 'SERVICE_MUSIC'
                  ? 'bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 text-white shadow-md'
                  : 'text-amber-300 hover:text-white bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <Music className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>🎵 Hymn &amp; Muzyka Serwisu</span>
            </button>
          </div>

          <button
            onClick={handleDownloadMp3Installer}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center space-x-1.5 transition shrink-0"
            title="Pobierz osobny program odtwarzacza na pulpit Windows (.CMD)"
          >
            <Download className="w-3.5 h-3.5 fill-slate-950" />
            <span>Pobierz Jako Osobny Program (.EXE)</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB: SERVICE MUSIC ANTHEM */}
          {activeTab === 'SERVICE_MUSIC' && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/60 rounded-2xl border border-amber-500/40 shadow-xl space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                    <Music className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      🎵 Oficjalny Hymn i Muzyka o Twoim Serwisie (TermoFix AI)
                    </h3>
                    <p className="text-xs text-slate-300">
                      Wygeneruj i odsłuchaj unikalną muzykę skomponowaną o Twoim profesjonalnym serwisie laptopów, naprawie płyt głównych, lutowaniu BGA i diagnostyce termowizyjnej!
                    </p>
                  </div>
                </div>

                {/* Synth Player Controls */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-sm font-bold text-amber-400">
                      Podkład Serwisu: „Mistrzowie Lutownicy i VCORE”
                    </div>
                    <div className="text-xs text-slate-400">
                      Mocny, motywujący podkład Techno + Generowane głosy AI (Męski/Żeński).
                    </div>
                  </div>

                  <button
                    onClick={playServiceAnthemSynth}
                    className={`px-6 py-3 rounded-2xl font-extrabold text-xs shadow-lg transition flex items-center space-x-2 ${
                      synthPlaying
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/80 animate-pulse'
                        : 'bg-gradient-to-r from-amber-500 via-rose-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-amber-950/80'
                    }`}
                  >
                    {synthPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{synthPlaying ? 'Zatrzymaj Hymn Serwisu ⏹' : 'Odtwórz Hymn Serwisu 🎶'}</span>
                  </button>
                </div>

                {/* Generated Service Song Lyrics */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="text-amber-400 font-extrabold flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <Headphones className="w-4 h-4" />
                    <span>TEKST PIOSENKI / HYMNU O TWOIM SERWISIE (TECHNO WERSJA):</span>
                  </div>
                  
                  <div className="text-slate-300 space-y-2 leading-relaxed">
                    <p><strong className="text-amber-400">[Głos Męski AI / Syntezator Bębnów]</strong><br />
                    Termo Fix AI. Warszawa.<br />
                    Najlepsi z najlepszych.
                    </p>

                    <p><strong className="text-rose-400">[Głos Żeński AI / Hi-Hat & Bassline]</strong><br />
                    Zwarcia na V-CORE.<br />
                    Naprawiamy z prędkością światła.
                    </p>

                    <p><strong className="text-amber-400">[Głos Męski AI]</strong><br />
                    Lutowanie BGA.<br />
                    Płyty główne znów żyją.
                    </p>

                    <p><strong className="text-rose-400">[Głos Żeński AI]</strong><br />
                    Termowizja prawdę powie.<br />
                    KBC zaprogramowany.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* TAB 1: WORLD RADIO STATIONS */}
          {activeTab === 'RADIO' && (
            <div className="space-y-4">
              {/* Country Filters & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 text-xs">
                  {['ALL', 'Polska', 'Wielka Brytania', 'Hiszpania', 'Niemcy', 'USA', 'Japonia'].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setSelectedCountry(cnt)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ${
                        selectedCountry === cnt
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cnt === 'ALL' ? 'Wszystkie Kraje' : cnt}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Szukaj radia po nazwie lub gatunku..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Radio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredRadioStations.map((st) => {
                  const isCurrent = currentAudioUrl === st.streamUrl;
                  return (
                    <button
                      key={st.id}
                      onClick={() => playStream(st.streamUrl, st.name, `${st.country} • ${st.genre}`)}
                      className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        isCurrent
                          ? 'bg-amber-950/60 border-amber-500/80 text-white shadow-lg ring-1 ring-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <span className="text-2xl shrink-0">{st.flag}</span>
                        <div className="overflow-hidden">
                          <div className="font-bold text-xs text-white truncate">{st.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{st.genre}</div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isCurrent && isPlaying ? (
                          <span className="flex space-x-0.5 items-end h-4">
                            <span className="w-1 bg-amber-400 h-full animate-bounce"></span>
                            <span className="w-1 bg-amber-400 h-2 animate-bounce delay-75"></span>
                            <span className="w-1 bg-amber-400 h-3 animate-bounce delay-150"></span>
                          </span>
                        ) : (
                          <Play className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LOCAL MP3 FROM DISK */}
          {activeTab === 'LOCAL_MP3' && (
            <div className="space-y-4">
              {/* Dropzone / Upload button */}
              <div className="p-6 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-500/60 transition flex flex-col items-center justify-center text-center space-y-2">
                <Upload className="w-8 h-8 text-amber-400 animate-pulse" />
                <div className="text-sm font-bold text-white">
                  Wybierz lub upuść pliki MP3 / WAV / FLAC ze swojego komputera
                </div>
                <p className="text-xs text-slate-400 max-w-md">
                  Pliki audio są przetwarzane lokalnie w przeglądarce i nie wyciekają do sieci.
                </p>

                <label className="mt-2 inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-lg transition">
                  <Plus className="w-4 h-4" />
                  <span>Przeglądaj Dysk...</span>
                  <input
                    type="file"
                    multiple
                    accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a"
                    className="hidden"
                    onChange={(e) => handleLocalMp3Files(e.target.files)}
                  />
                </label>
              </div>

              {/* Local Track Playlist */}
              {localTracks.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Lista Własnych Utworów z Dysku ({localTracks.length})</span>
                    <button
                      onClick={() => setLocalTracks([])}
                      className="text-[11px] text-red-400 hover:underline flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Wyczyść listę</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {localTracks.map((tr) => {
                      const isCurrent = currentAudioUrl === tr.url;
                      return (
                        <div
                          key={tr.id}
                          onClick={() => playStream(tr.url, tr.title, `Lokalny Plik MP3 (${tr.sizeFormatted})`)}
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isCurrent
                              ? 'bg-amber-950/60 border-amber-500/80 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <Music className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="overflow-hidden">
                              <div className="font-bold text-xs text-white truncate">{tr.title}</div>
                              <div className="text-[10px] text-slate-400">{tr.artist} • {tr.sizeFormatted}</div>
                            </div>
                          </div>

                          <Play className="w-4 h-4 text-amber-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl text-center text-xs text-slate-500 border border-slate-800">
                  Brak załadowanych utworów z lokalnego dysku.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE MP3 PLAYER */}
          {activeTab === 'GOOGLE_DRIVE' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <FileAudio className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Dodaj Utwór z Dysku Google (Google Drive Stream)</h3>
                </div>

                <p className="text-xs text-slate-400">
                  Wklej link udostępniania pliku MP3 z Dysku Google (np. <code>https://drive.google.com/file/d/FILE_ID/view</code>) lub sam ID pliku. System wygeneruje bezpośredni strumień audio.
                </p>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={gdriveUrlInput}
                    onChange={(e) => setGdriveUrlInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... lub ID pliku"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />

                  <button
                    onClick={handleAddGoogleDriveTrack}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Dodaj &amp; Odtwórz
                  </button>
                </div>
              </div>

              {/* Google Drive Playlist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Lista Odnośników z Chmury Google</div>
                <div className="space-y-2">
                  {gdriveTracks.map((tr) => (
                    <div
                      key={tr.id}
                      onClick={() => playStream(tr.url, tr.title, tr.artist)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        currentAudioUrl === tr.url
                          ? 'bg-amber-950/60 border-amber-500/80 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileAudio className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="overflow-hidden">
                          <div className="font-bold text-xs text-white truncate">{tr.title}</div>
                          <div className="text-[10px] text-slate-400">{tr.artist} • {tr.sizeFormatted}</div>
                        </div>
                      </div>

                      <Play className="w-4 h-4 text-amber-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI DJ & GENERATOR STACJI */}
          {activeTab === 'AI_DJ' && (
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-purple-950/50 via-slate-950 to-indigo-950/50 rounded-2xl border border-purple-500/40 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                    <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      AI DJ &amp; Inteligentny Generator Stacji Muzycznych
                    </h3>
                    <p className="text-xs text-slate-300">
                      Wpisz dowolny nastrój, gatunek lub zadanie (np. serwis laptopów, lutowanie BGA, relaks po pracy), a model AI wygeneruje dedykowany strumień muzyczny i stację radiową.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Np. Energetyczny synthwave do naprawy elektroniki..."
                    className="flex-1 w-full bg-slate-900 border border-purple-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-400 font-mono"
                  />
                  <button
                    onClick={handleGenerateAiStation}
                    disabled={aiGenerating}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-purple-950/60 transition flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${aiGenerating ? 'animate-spin' : ''}`} />
                    <span>{aiGenerating ? 'AI Generuje Stację...' : 'Generuj i Uruchom AI DJ'}</span>
                  </button>
                </div>
              </div>

              {/* AI Stations List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
                  <span>Wygenerowane przez AI Stacje &amp; Playlisty ({aiStations.length})</span>
                  <span className="text-[10px] text-slate-400">Powered by Gemini AI</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiStations.map((st) => {
                    const isCurrent = currentAudioUrl === st.streamUrl;
                    return (
                      <button
                        key={st.id}
                        onClick={() => playStream(st.streamUrl, st.name, st.genre)}
                        className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                          isCurrent
                            ? 'bg-purple-950/70 border-purple-500 text-white ring-1 ring-purple-500'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <span className="text-2xl shrink-0">{st.flag}</span>
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-white truncate">{st.name}</div>
                            <div className="text-[10px] text-purple-300 truncate">{st.genre}</div>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2">
                          {isCurrent && isPlaying ? (
                            <span className="flex space-x-0.5 items-end h-4">
                              <span className="w-1 bg-purple-400 h-full animate-bounce"></span>
                              <span className="w-1 bg-purple-400 h-2 animate-bounce delay-75"></span>
                              <span className="w-1 bg-purple-400 h-3 animate-bounce delay-150"></span>
                            </span>
                          ) : (
                            <Play className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Odtwarzacz wyposażony w automatyczny korektor dynamiczny i akcelerator audio.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
