import React from 'react';
import { GameState } from '../types/game';
import { AREA_DEF } from '../data/gameData';
import { getAreaStats } from '../utils/gameHelpers';
import { sfx } from '../utils/audio';

interface MapModalProps {
  gameState: GameState;
  onClose: () => void;
  onTravel: (mapId: string) => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  gameState,
  onClose,
  onTravel,
}) => {
  const crowns = gameState.story?.crown || {};
  const crownCount = Object.keys(crowns).length;
  const gateUnlocked = crownCount >= 6 || gameState.storyLock === false;

  const mapsList = [
    {
      id: 'hutan',
      title: 'Hutan Kata (Forest Hub)',
      desc: 'Pusat dunia dengan 6 penjaga wilayah dan gerbang ungu',
      icon: '🌲',
      bg: '/forest.webp',
      isUnlocked: true,
      isSaved: false,
    },
    ...AREA_DEF.map((area: any, idx: number) => {
      const isSaved = !!crowns[area.id];
      const stats = getAreaStats(idx, gameState.p || {});
      return {
        id: area.id,
        title: area.name,
        desc: `${area.e} Penjaga: ${area.npc.n} • ${stats.mastered}/${stats.total} kata dikuasai`,
        icon: area.e,
        bg: `/${area.id === 'desa' ? 'village' : area.id === 'pasar' ? 'market' : area.id === 'satwa' ? 'satwa' : area.id === 'kota' ? 'kota' : area.id === 'waktu' ? 'waktu' : 'cave'}.webp`,
        isUnlocked: true,
        isSaved,
      };
    }),
    {
      id: 'akademi',
      title: 'Istana IELTS',
      desc: 'Simulasi ujian Listening, Reading, Writing, & Speaking',
      icon: '🏰',
      bg: '/castle.webp',
      isUnlocked: gateUnlocked,
      isSaved: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm select-none font-['Nunito',sans-serif]">
      <div className="relative w-full max-w-2xl bg-[#221035] border-2 border-[#ffbe53] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#2c1545] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗺️</span>
            <h2 className="text-xl font-['Lilita_One',sans-serif] tracking-wider text-[#ffd24a]">
              Peta Dunia & Perjalanan Cepat
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

        {/* Areas List */}
        <div className="p-4 overflow-y-auto max-h-[70vh] space-y-2.5">
          {mapsList.map((m) => {
            const isCurrent = gameState.map === m.id;

            return (
              <div
                key={m.id}
                className={`relative rounded-2xl p-3.5 border-2 overflow-hidden flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'border-amber-400 bg-[#3a1a63] shadow-lg'
                    : m.isUnlocked
                    ? 'border-white/15 bg-[#1a092c] hover:border-amber-400/50'
                    : 'border-white/5 bg-black/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 z-10">
                  <span className="text-3xl p-2 rounded-xl bg-black/30 border border-white/10">
                    {m.icon}
                  </span>
                  <div>
                    <div className="font-['Lilita_One',sans-serif] text-base text-white flex items-center gap-2">
                      <span>{m.title}</span>
                      {m.isSaved && (
                        <span className="px-2 py-0.2 rounded-full bg-green-500/30 border border-green-400 text-green-300 text-[10px] font-bold">
                          ✓ Selamat
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-2 py-0.2 rounded-full bg-amber-400 text-stone-900 text-[10px] font-black uppercase">
                          Lokasi Sekarang
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-300 mt-0.5">{m.desc}</div>
                  </div>
                </div>

                <div className="z-10">
                  {m.isUnlocked ? (
                    <button
                      onClick={() => {
                        sfx.door();
                        onTravel(m.id);
                        onClose();
                      }}
                      className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 active:scale-95 font-bold text-xs text-white shadow-md cursor-pointer transition-all"
                    >
                      Kunjungi ➔
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-stone-500 italic flex items-center gap-1">
                      <span>🔒 Butuh 6 Mahkota</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
