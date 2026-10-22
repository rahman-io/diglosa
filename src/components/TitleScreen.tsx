import React from 'react';
import { GameState } from '../types/game';
import { getLevel } from '../utils/gameHelpers';
import { sfx } from '../utils/audio';

interface TitleScreenProps {
  gameState: GameState;
  onStartAdventure: () => void;
  onOpenIelts: () => void;
  onOpenBag: () => void;
  onOpenOptions: () => void;
  onOpenHelp: () => void;
  onReplayIntro: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  gameState,
  onStartAdventure,
  onOpenIelts,
  onOpenBag,
  onOpenOptions,
  onOpenHelp,
  onReplayIntro,
}) => {
  const lvl = getLevel(gameState.xp);
  const wordsKnown = Object.values(gameState.p || {}).filter((w) => w && w.r + w.w > 0).length;
  const hasSave = gameState.xp > 0 || wordsKnown > 0 || gameState.gems > 0;

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden select-none bg-[#1e0e2e] text-white flex flex-col items-center justify-between font-['Nunito',sans-serif]">
      {/* Background painted landscape */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url('/title-bg.webp')`,
          filter: 'brightness(0.92) contrast(1.05)',
        }}
      />

      {/* Atmospheric gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1b0a2a]/60 via-transparent to-[#1b0a2a]/85 pointer-events-none" />

      {/* Top Header / Player Quick Badge */}
      <header className="relative z-10 w-full max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-[#241335]/85 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-[#ffbe53]/40 shadow-lg">
          <img src="/hero-head.webp" alt="Hoot" className="w-9 h-9 rounded-full bg-[#ffbe53]/20 border border-[#ffbe53]" />
          <div>
            <div className="text-xs text-[#ffd24a] font-black uppercase tracking-wider">{lvl.title}</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Lv. {lvl.n}</span>
              <span className="text-xs text-stone-300">({gameState.xp} XP)</span>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#241335]/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-red-500/40 shadow-lg">
            <span className="text-lg">❤️</span>
            <span className="font-extrabold text-sm">{gameState.hp}/{gameState.maxhp}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#241335]/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border-2 border-cyan-400/40 shadow-lg">
            <span className="text-lg">💎</span>
            <span className="font-extrabold text-sm text-cyan-300">{gameState.gems}</span>
          </div>
        </div>
      </header>

      {/* Hero Animated Sprite in Center Stage */}
      <div className="relative z-10 my-auto flex flex-col items-center">
        {/* Title Logo */}
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#ff9900]/20 border border-[#ff9900]/60 text-xs font-black tracking-widest text-[#ffce52] uppercase mb-2">
            A1 Vocabulary RPG & IELTS Castle
          </div>
          <h1 className="text-4xl sm:text-6xl font-['Lilita_One',sans-serif] tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#fff5cc] via-[#ffcf40] to-[#f47c00] drop-shadow-[0_4px_16px_rgba(244,124,0,0.6)]">
            DIGLOSA
          </h1>
          <p className="text-sm sm:text-base font-bold text-[#fef1c4] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1">
            Petualangan Kata • Menjelajah Hutan & Menaklukkan Monster
          </p>
        </div>

        {/* Character Illustration with Breathing & Eye Blink */}
        <div className="relative w-36 h-48 flex items-center justify-center">
          {/* Floor Shadow */}
          <div className="absolute bottom-2 w-28 h-7 bg-black/45 rounded-full blur-[3px]" />
          {/* Hero Body with breath animation */}
          <div className="relative hbreath">
            <img
              src="/hero.webp"
              alt="Hero"
              className="h-44 w-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] object-contain"
            />
          </div>
        </div>

        {/* Stats Pill */}
        <div className="mt-3 flex items-center gap-4 bg-[#1b0b2b]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#ffbe53]/30 text-xs text-[#ffe29a] font-bold">
          <span>📚 {wordsKnown} / 826 kata dipelajari</span>
          <span>•</span>
          <span>👑 {Object.keys(gameState.story?.crown || {}).length} / 6 pecahan mahkota</span>
        </div>
      </div>

      {/* Main Menu Action Buttons */}
      <nav className="relative z-10 w-full max-w-md px-4 pb-8 flex flex-col gap-2.5">
        <button
          onClick={() => {
            sfx.fanfare();
            onStartAdventure();
          }}
          className="w-full py-3.5 px-6 rounded-2xl font-['Lilita_One',sans-serif] text-xl tracking-wide text-white bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#d97706] hover:brightness-110 active:scale-95 shadow-[0_6px_20px_rgba(234,88,12,0.45)] border-2 border-[#fef08a] transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>{hasSave ? '⚔️ Lanjut Petualangan' : '▶️ Mulai Petualangan'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              sfx.door();
              onOpenIelts();
            }}
            className="py-2.5 px-4 rounded-xl font-bold text-sm bg-[#3b1968]/90 hover:bg-[#4c2185] active:scale-95 text-[#fcd34d] border-2 border-[#a855f7]/50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>👑 Istana IELTS</span>
          </button>

          <button
            onClick={() => {
              sfx.pick();
              onOpenBag();
            }}
            className="py-2.5 px-4 rounded-xl font-bold text-sm bg-[#3b1968]/90 hover:bg-[#4c2185] active:scale-95 text-[#e2e8f0] border-2 border-[#a855f7]/50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🎒 Tas & Senjata</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              sfx.tick();
              onOpenHelp();
            }}
            className="py-2 px-2 rounded-xl text-xs font-bold bg-[#1e0e33]/90 hover:bg-[#2c154a] text-stone-300 border border-white/20 active:scale-95 transition-all text-center cursor-pointer"
          >
            📖 Bantuan
          </button>

          <button
            onClick={() => {
              sfx.tick();
              onReplayIntro();
            }}
            className="py-2 px-2 rounded-xl text-xs font-bold bg-[#1e0e33]/90 hover:bg-[#2c154a] text-stone-300 border border-white/20 active:scale-95 transition-all text-center cursor-pointer"
          >
            🎬 Cerita
          </button>

          <button
            onClick={() => {
              sfx.tick();
              onOpenOptions();
            }}
            className="py-2 px-2 rounded-xl text-xs font-bold bg-[#1e0e33]/90 hover:bg-[#2c154a] text-stone-300 border border-white/20 active:scale-95 transition-all text-center cursor-pointer"
          >
            ⚙️ Opsi
          </button>
        </div>
      </nav>
    </div>
  );
};
