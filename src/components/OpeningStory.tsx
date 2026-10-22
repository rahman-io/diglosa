import React, { useState, useEffect } from 'react';
import { RPG_LILA, RPG_RAJA, RPG_HINT } from '../data/gameData';
import { OWL_SPR, NPC_SPR } from '../data/assets';
import { sfx } from '../utils/audio';

interface OpeningStoryProps {
  onComplete: () => void;
}

export const OpeningStory: React.FC<OpeningStoryProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'owl' | 'lila' | 'run' | 'raja' | 'hint'>('owl');
  const [lineIdx, setLineIdx] = useState(0);

  // Auto transition for owl flying
  useEffect(() => {
    if (phase === 'owl') {
      sfx.door();
      const timer = setTimeout(() => {
        setPhase('lila');
        setLineIdx(0);
      }, 2500);
      return () => clearTimeout(timer);
    }
    if (phase === 'run') {
      const timer = setTimeout(() => {
        setPhase('raja');
        setLineIdx(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const currentLines = phase === 'lila' ? RPG_LILA : phase === 'raja' ? RPG_RAJA : phase === 'hint' ? RPG_HINT : [];
  const currentLine = currentLines[lineIdx];

  const handleNextLine = () => {
    sfx.tick();
    if (lineIdx + 1 < currentLines.length) {
      setLineIdx(lineIdx + 1);
    } else {
      if (phase === 'lila') {
        setPhase('run');
      } else if (phase === 'raja') {
        setPhase('hint');
        setLineIdx(0);
      } else if (phase === 'hint') {
        sfx.fanfare();
        onComplete();
      }
    }
  };

  const handleSkip = () => {
    sfx.tick();
    setPhase('hint');
    setLineIdx(RPG_HINT.length - 1);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#13071f] flex flex-col items-center justify-between p-4 overflow-hidden select-none font-['Nunito',sans-serif]">
      {/* Background forest illustration */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 blur-[1px] pointer-events-none"
        style={{ backgroundImage: `url('/forest.webp')` }}
      />

      {/* Top bar with Skip button */}
      <header className="relative z-20 w-full max-w-4xl flex justify-between items-center py-2">
        <div className="bg-[#2a133d]/80 px-3 py-1 rounded-full border border-purple-400/30 text-xs font-bold text-amber-300">
          📜 Prolog Cerita: Kisah Lila & Raja Aksara
        </div>
        <button
          onClick={handleSkip}
          className="bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-200 px-3 py-1 rounded-lg text-xs font-bold border border-white/20 transition-all cursor-pointer"
        >
          Lewati Cerita ⏩
        </button>
      </header>

      {/* Center Cinematic Scene */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full max-w-2xl text-center">
        {phase === 'owl' && (
          <div className="flex flex-col items-center animate-bounce">
            <img
              src={OWL_SPR.fly || '/owl/up.webp'}
              alt="Owl"
              className="w-32 h-32 object-contain drop-shadow-[0_8px_20px_rgba(255,200,0,0.4)]"
            />
            <div className="mt-4 text-amber-200 font-bold text-lg drop-shadow">
              ✉️ Seekor burung hantu meluncur dari langit membawa sepucuk surat...
            </div>
          </div>
        )}

        {phase === 'lila' && (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={NPC_SPR?.lila?.u?.idle || '/npc/lila-idle.webp'}
                alt="Lila"
                className="h-48 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>
        )}

        {phase === 'run' && (
          <div className="flex flex-col items-center">
            <div className="relative mb-4 animate-pulse">
              <img
                src="/hero-walk.webp"
                alt="Hero running"
                className="h-40 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]"
                style={{ objectPosition: '0 0', width: '92px' }}
              />
            </div>
            <div className="text-amber-200 font-bold text-base drop-shadow">
              Hoot berlari menuju Pintu Ungu di utara hutan...
            </div>
          </div>
        )}

        {phase === 'raja' && (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={NPC_SPR?.raja?.u?.idle || '/npc/raja-idle.webp'}
                alt="Raja Aksara"
                className="h-52 object-contain drop-shadow-[0_8px_20px_rgba(168,85,247,0.5)]"
              />
            </div>
          </div>
        )}

        {phase === 'hint' && (
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img
                src={OWL_SPR.land || '/owl/land.webp'}
                alt="Owl Mentor"
                className="h-36 object-contain drop-shadow-[0_6px_16px_rgba(255,215,0,0.5)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom RPG Dialogue Box */}
      {currentLine && (
        <div className="relative z-20 w-full max-w-2xl bg-[#1b0b2b]/95 border-2 border-[#ffc95e] rounded-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md">
          {/* Character Label */}
          <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-1.5">
            <div className="font-['Lilita_One',sans-serif] text-base tracking-wider text-[#ffd24a] flex items-center gap-2">
              <span>{phase === 'lila' ? '🌸 Lila' : phase === 'raja' ? '👑 Raja Aksara' : '🦉 Hoot si Burung Hantu'}</span>
            </div>
            <span className="text-xs text-stone-400">
              {lineIdx + 1} / {currentLines.length}
            </span>
          </div>

          {/* Dialogue English & Indonesian */}
          <div className="mb-4 space-y-1">
            <div className="text-lg sm:text-xl font-black text-white leading-snug">
              "{currentLine[0]}"
            </div>
            <div className="text-sm sm:text-base font-semibold text-amber-200/90 italic">
              ({currentLine[1]})
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={handleNextLine}
              className="py-2.5 px-6 rounded-xl font-['Lilita_One',sans-serif] text-base text-stone-900 bg-gradient-to-r from-[#ffd24a] to-[#f59e0b] hover:brightness-110 active:scale-95 shadow-md border border-[#fef08a] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{lineIdx + 1 < currentLines.length ? 'Lanjut ➡️' : phase === 'hint' ? '🚀 Mulai Petualangan!' : 'Lanjut ➡️'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
