import React, { useState } from 'react';
import { sfx } from '../utils/audio';

export interface DialogOption {
  label: string;
  action: () => void;
  primary?: boolean;
}

interface RpgDialogProps {
  speaker: string;
  portrait?: string;
  avatarIcon?: string;
  enText: string;
  idText: string;
  options: DialogOption[];
  onClose: () => void;
}

export const RpgDialog: React.FC<RpgDialogProps> = ({
  speaker,
  portrait,
  avatarIcon = '🧙‍♂️',
  enText,
  idText,
  options,
  onClose,
}) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6 flex justify-center pointer-events-auto select-none font-['Nunito',sans-serif]">
      <div className="w-full max-w-2xl bg-[#1d0b2e]/95 border-2 border-[#ffbe53] rounded-3xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-md text-white flex flex-col gap-3">
        {/* Speaker Name and Avatar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-3">
            {portrait ? (
              <img
                src={portrait}
                alt={speaker}
                className="w-11 h-11 rounded-full object-cover bg-amber-400/20 border-2 border-amber-400"
              />
            ) : (
              <span className="w-11 h-11 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-2xl">
                {avatarIcon}
              </span>
            )}
            <div>
              <div className="font-['Lilita_One',sans-serif] text-lg text-[#ffd24a] tracking-wide">
                {speaker}
              </div>
              <div className="text-[11px] text-amber-200/70 uppercase tracking-widest font-black">
                Percakapan RPG
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.tick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-xs font-black cursor-pointer transition-all"
          >
            ✕
          </button>
        </div>

        {/* Text Area */}
        <div className="space-y-1 py-1">
          <div className="text-base sm:text-lg font-black text-white leading-snug">
            "{enText}"
          </div>
          <div className="text-xs sm:text-sm font-semibold text-amber-200/90 italic">
            ({idText})
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                sfx.tick();
                opt.action();
              }}
              className={`py-2 px-4 rounded-xl font-['Lilita_One',sans-serif] text-sm tracking-wide transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                opt.primary
                  ? 'bg-gradient-to-r from-[#ffd24a] to-[#f59e0b] text-stone-900 border border-[#fef08a] shadow-md hover:brightness-110'
                  : 'bg-[#371957] hover:bg-[#482172] text-white border border-white/15'
              }`}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
