import React, { useState } from 'react';
import { GameState, Difficulty, FXMode } from '../types/game';
import { sfx } from '../utils/audio';

interface OptionsModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateState: (partial: Partial<GameState>) => void;
  onResetProgress: () => void;
  onReplayIntro: () => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  gameState,
  onClose,
  onUpdateState,
  onResetProgress,
  onReplayIntro,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm select-none font-['Nunito',sans-serif]">
      <div className="relative w-full max-w-lg bg-[#221035] border-2 border-[#ffbe53] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#2c1545] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h2 className="text-xl font-['Lilita_One',sans-serif] tracking-wider text-[#ffd24a]">
              Pengaturan Permainan
            </h2>
          </div>
          <button
            onClick={() => {
              sfx.tick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-sm font-black cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Difficulty */}
          <div>
            <label className="block text-xs font-black uppercase text-amber-300 tracking-wider mb-2">
              Tingkat Kesulitan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'santai', label: 'Santai', desc: 'Tanpa penembak' },
                  { id: 'petualang', label: 'Petualang', desc: 'Standar' },
                  { id: 'pendekar', label: 'Pendekar', desc: 'Timer cepat' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    sfx.tick();
                    onUpdateState({ diff: d.id as Difficulty });
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    gameState.diff === d.id
                      ? 'bg-amber-500/30 border-amber-400 text-white shadow-md'
                      : 'bg-black/20 border-white/10 text-stone-400 hover:text-white'
                  }`}
                >
                  <div className="font-extrabold text-sm">{d.label}</div>
                  <div className="text-[10px] text-amber-200/70">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Timer */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/10">
            <div>
              <div className="font-bold text-sm text-white">Timer Waktu Soal</div>
              <div className="text-xs text-stone-400">Batasi waktu menjawab pada duel dan kuis</div>
            </div>
            <button
              onClick={() => {
                sfx.tick();
                onUpdateState({ qtimer: gameState.qtimer === 'off' ? 'on' : 'off' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                gameState.qtimer !== 'off'
                  ? 'bg-green-600 text-white'
                  : 'bg-stone-700 text-stone-400'
              }`}
            >
              {gameState.qtimer !== 'off' ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          {/* Visual FX & Vibration */}
          <div>
            <label className="block text-xs font-black uppercase text-amber-300 tracking-wider mb-2">
              Efek Visual & Partikel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'full', label: 'Penuh (Full)' },
                  { id: 'lite', label: 'Ringan (Lite)' },
                  { id: 'off', label: 'Mati (Off)' },
                ] as const
              ).map((fx) => (
                <button
                  key={fx.id}
                  onClick={() => {
                    sfx.tick();
                    onUpdateState({ fx: fx.id as FXMode });
                  }}
                  className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    gameState.fx === fx.id
                      ? 'bg-purple-600/40 border-purple-400 text-white'
                      : 'bg-black/20 border-white/10 text-stone-400 hover:text-white'
                  }`}
                >
                  {fx.label}
                </button>
              ))}
            </div>
          </div>

          {/* Replay Intro Story */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                sfx.tick();
                onClose();
                onReplayIntro();
              }}
              className="w-full py-2.5 rounded-xl bg-[#341653] hover:bg-[#431d6b] text-amber-200 text-xs font-bold border border-purple-400/30 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🎬 Putar Ulang Cerita Pembuka (Prolog)</span>
            </button>
          </div>

          {/* Reset Progress */}
          <div className="pt-2 border-t border-white/10">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-bold border border-red-500/30 cursor-pointer transition-all"
              >
                ⚠️ Reset Seluruh Progres Game
              </button>
            ) : (
              <div className="p-3 bg-red-950/70 border border-red-500 rounded-xl space-y-2 text-center">
                <div className="text-xs font-bold text-red-200">
                  Apakah kamu yakin ingin menghapus seluruh data kata, nyawa, dan mahkota?
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sfx.boom();
                      onResetProgress();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs cursor-pointer"
                  >
                    Ya, Reset Sekarang
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-200 font-bold text-xs cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
