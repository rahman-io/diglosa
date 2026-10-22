import React from 'react';
import { sfx } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onOpenBag: () => void;
  onOpenMap: () => void;
  onOpenOptions: () => void;
  onReturnTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenBag,
  onOpenMap,
  onOpenOptions,
  onReturnTitle,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md select-none font-['Nunito',sans-serif]">
      <div className="w-full max-w-sm bg-[#221035] border-2 border-[#ffbe53] rounded-3xl p-6 shadow-2xl text-white flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl mb-3">
          ⏸️
        </div>
        <h2 className="text-2xl font-['Lilita_One',sans-serif] tracking-wider text-[#ffd24a] mb-1">
          Menu Jeda
        </h2>
        <p className="text-xs text-stone-300 text-center mb-6">
          Petualangan sedang dijeda. Pilih aksi untuk melanjutkan.
        </p>

        <div className="w-full space-y-2.5">
          <button
            onClick={() => {
              sfx.tick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl font-['Lilita_One',sans-serif] text-base text-stone-900 bg-gradient-to-r from-[#ffd24a] to-[#f59e0b] hover:brightness-110 active:scale-95 shadow-md border border-[#fef08a] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>▶️ Lanjutkan Bermain</span>
          </button>

          <button
            onClick={() => {
              sfx.pick();
              onOpenBag();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-[#341753] hover:bg-[#451f6f] border border-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🎒 Tas & Perlengkapan</span>
          </button>

          <button
            onClick={() => {
              sfx.door();
              onOpenMap();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-[#341753] hover:bg-[#451f6f] border border-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🗺️ Buka Peta Dunia</span>
          </button>

          <button
            onClick={() => {
              sfx.tick();
              onOpenOptions();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-[#341753] hover:bg-[#451f6f] border border-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚙️ Pengaturan / Opsi</span>
          </button>

          <button
            onClick={() => {
              sfx.lose();
              onReturnTitle();
            }}
            className="w-full py-2 px-4 rounded-xl font-bold text-xs text-stone-400 hover:text-white bg-black/20 hover:bg-black/40 border border-white/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>🚪 Kembali ke Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
