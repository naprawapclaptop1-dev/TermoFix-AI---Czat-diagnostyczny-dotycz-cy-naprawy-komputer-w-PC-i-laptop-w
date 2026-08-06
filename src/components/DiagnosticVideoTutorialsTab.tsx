import React, { useState } from 'react';
import { Play, Pause, Tv, CheckCircle2, Clock, Eye, Sparkles, Film, Tag } from 'lucide-react';
import { VIDEO_TUTORIALS, VideoTutorialItem } from './InstructionVideoTutorialsModal';

interface DiagnosticVideoTutorialsTabProps {
  categoryFilter?: string;
  defaultVideoId?: string;
  title?: string;
  onSendToChat?: (prompt: string) => void;
}

export const DiagnosticVideoTutorialsTab: React.FC<DiagnosticVideoTutorialsTabProps> = ({
  categoryFilter,
  defaultVideoId,
  title = "Biblioteka Poradników i Filmów Instruktażowych",
  onSendToChat
}) => {
  // Filter videos based on category if provided
  const relevantVideos = categoryFilter && categoryFilter !== 'ALL'
    ? VIDEO_TUTORIALS.filter(v => v.category.toLowerCase().includes(categoryFilter.toLowerCase()) || v.tags.some(t => t.toLowerCase().includes(categoryFilter.toLowerCase())))
    : VIDEO_TUTORIALS;

  const displayVideos = relevantVideos.length > 0 ? relevantVideos : VIDEO_TUTORIALS;

  const initialId = defaultVideoId && displayVideos.some(v => v.id === defaultVideoId)
    ? defaultVideoId
    : displayVideos[0].id;

  const [selectedVideoId, setSelectedVideoId] = useState<string>(initialId);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [checklist, setChecklist] = useState<{ [key: number]: boolean }>({});

  const currentVideo = displayVideos.find(v => v.id === selectedVideoId) || displayVideos[0];

  const toggleStep = (idx: number) => {
    setChecklist(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-4 font-sans text-slate-200">
      {/* Top Banner */}
      <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-red-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 rounded-xl text-white shadow-md">
            <Tv className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <span>{title}</span>
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                JAKOŚĆ 4K HD
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Oglądaj filmy z warsztatu serwisowego, analizuj sygnały i sprawdzaj listę kroków diagnostycznych
            </p>
          </div>
        </div>

        {onSendToChat && (
          <button
            onClick={() => onSendToChat(`Omów szczegółowo procedurę naprawy z filmu instruktażowego: "${currentVideo.title}". Przedstaw instrukcję krok po kroku oraz listę narzędzi.`)}
            className="bg-red-900/40 hover:bg-red-800 text-red-200 border border-red-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Zadaj pytanie AI o ten poradnik</span>
          </button>
        )}
      </div>

      {/* Main Grid: Video Player + List of Tutorials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column (2/3): Active Video Player & Step-by-Step Checklist */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Video Player Container */}
          <div className="bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative group">
            <video
              key={currentVideo.id}
              className="w-full aspect-video object-cover"
              controls
              autoPlay={isPlaying}
              poster={currentVideo.posterUrl}
              src={currentVideo.videoUrl}
            >
              Twoja przeglądarka nie obsługuje odtwarzacza wideo HTML5.
            </video>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 truncate">
                <Film className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-bold text-white truncate">{currentVideo.title}</span>
              </div>
              <div className="flex items-center space-x-3 shrink-0 text-slate-400 text-[11px] font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" /> {currentVideo.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-cyan-400" /> {currentVideo.views}
                </span>
              </div>
            </div>
          </div>

          {/* Description & Interactive Steps Checklist */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                <span>Opis Procedury Serwisowej</span>
                <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                  {currentVideo.author}
                </span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {currentVideo.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentVideo.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1 font-mono">
                  <Tag className="w-2.5 h-2.5 text-red-400" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Timestamped Checklist */}
            <div className="border-t border-slate-900 pt-3 space-y-2">
              <h5 className="font-bold text-amber-400 text-xs flex items-center justify-between">
                <span>Interaktywne Krok-Po-Kroku z Filmu:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Zaznacz ukończone punkty diagnostyczne
                </span>
              </h5>

              <div className="space-y-1.5">
                {currentVideo.steps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                      checklist[idx]
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checklist[idx]}
                      onChange={() => {}}
                      className="mt-0.5 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{step.title}</span>
                        <span className="font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 border border-slate-800">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (1/3): Video Selector list */}
        <div className="space-y-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="font-bold text-xs text-white">Poradniki Wideo ({displayVideos.length}):</span>
            <span className="text-[10px] text-slate-400">Wybierz film</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {displayVideos.map((vid) => {
              const isSelected = vid.id === selectedVideoId;
              return (
                <div
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideoId(vid.id);
                    setIsPlaying(true);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-red-950/40 border-red-500/60 shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="relative w-24 aspect-video bg-black rounded-lg overflow-hidden shrink-0 border border-slate-800">
                      <img src={vid.posterUrl} alt={vid.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className={`w-4 h-4 ${isSelected ? 'text-red-400 fill-red-400 animate-pulse' : 'text-white fill-white'}`} />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] px-1 rounded">
                        {vid.duration}
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block font-mono">
                        {vid.category}
                      </span>
                      <h5 className="font-bold text-xs text-white line-clamp-2 leading-tight">
                        {vid.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{vid.views} wyświetleń</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
