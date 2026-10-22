import React, { useState } from 'react';
import { GameState } from '../types/game';
import { WORDS, CATEGORIES } from '../data/vocab';
import { WEAPONS, ITEMS, STORY } from '../data/gameData';
import { speakEnglish, sfx } from '../utils/audio';

interface BagModalProps {
  gameState: GameState;
  onClose: () => void;
  onEquipWeapon: (weaponId: string) => void;
  onBuyAmmo: (weaponId: string) => void;
}

export const BagModal: React.FC<BagModalProps> = ({
  gameState,
  onClose,
  onEquipWeapon,
  onBuyAmmo,
}) => {
  const [tab, setTab] = useState<'vocab' | 'weapons' | 'items'>('vocab');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<number>(-1);

  // Filter vocabulary
  const filteredWords = WORDS.map((w, idx) => ({ ...w, idx })).filter((w) => {
    const matchesCat = selectedCat === -1 || w.cat === selectedCat;
    const matchesSearch =
      !search ||
      w.en.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const crowns = gameState.story?.crown || {};
  const crownCount = Object.keys(crowns).length;
  const itemsOwned = gameState.story?.items || {};
  const currentWeapon = gameState.gun?.cur || 'ketapel';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm select-none font-['Nunito',sans-serif]">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#221035] border-2 border-[#ffbe53] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#2c1545] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <h2 className="text-xl font-['Lilita_One',sans-serif] tracking-wider text-[#ffd24a]">
              Tas & Perlengkapan Hoot
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

        {/* Tab Bar */}
        <div className="grid grid-cols-3 bg-[#1a092c] border-b border-white/10 text-sm font-bold">
          <button
            onClick={() => {
              sfx.tick();
              setTab('vocab');
            }}
            className={`py-2.5 text-center cursor-pointer transition-all border-b-2 ${
              tab === 'vocab'
                ? 'border-[#ffbe53] text-[#ffd24a] bg-white/5'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            📚 Kosakata ({WORDS.length})
          </button>
          <button
            onClick={() => {
              sfx.tick();
              setTab('weapons');
            }}
            className={`py-2.5 text-center cursor-pointer transition-all border-b-2 ${
              tab === 'weapons'
                ? 'border-[#ffbe53] text-[#ffd24a] bg-white/5'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            🔫 Senjata Blaster
          </button>
          <button
            onClick={() => {
              sfx.tick();
              setTab('items');
            }}
            className={`py-2.5 text-center cursor-pointer transition-all border-b-2 ${
              tab === 'items'
                ? 'border-[#ffbe53] text-[#ffd24a] bg-white/5'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            👑 Mahkota ({crownCount}/6)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'vocab' && (
            <div className="space-y-3">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Cari kata (English / Indonesia)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-[#150624] border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#ffd24a]"
                />
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(Number(e.target.value))}
                  className="bg-[#150624] border border-white/20 rounded-xl px-3 py-2 text-sm text-amber-200 focus:outline-none focus:border-[#ffd24a]"
                >
                  <option value={-1}>Semua Kategori (26 Bab)</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.idName} ({cat.enName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Word List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                {filteredWords.slice(0, 100).map((w) => {
                  const p = gameState.p?.[w.idx];
                  const mastered = p && p.r >= 3 && p.r > p.w;
                  const known = p && p.r + p.w > 0;

                  return (
                    <div
                      key={w.idx}
                      className="bg-[#1a092c] border border-white/10 rounded-xl p-2.5 flex items-center justify-between hover:border-amber-400/40 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            speakEnglish(w.en);
                            sfx.pick();
                          }}
                          className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center text-sm cursor-pointer"
                          title="Dengarkan pengucapan"
                        >
                          🔊
                        </button>
                        <div>
                          <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                            <span>{w.en}</span>
                            {mastered && <span className="text-xs text-yellow-400">⭐</span>}
                          </div>
                          <div className="text-xs text-amber-200/80">{w.id}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                          {CATEGORIES[w.cat]?.idName}
                        </div>
                        <div className="text-xs font-bold">
                          {known ? (
                            <span className={mastered ? 'text-green-400' : 'text-amber-400'}>
                              ✓ {p.r} / ✗ {p.w}
                            </span>
                          ) : (
                            <span className="text-stone-500">Belum</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'weapons' && (
            <div className="space-y-4">
              <div className="bg-[#1a082c] border border-amber-400/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-300 font-bold uppercase">Persediaan Berlian</div>
                  <div className="text-2xl font-black text-cyan-300">💎 {gameState.gems} Berlian</div>
                </div>
                <div className="text-xs text-stone-300 max-w-xs">
                  Gunakan berlian untuk mengisi ulang peluru blaster senjata saat berpetualang di dunia dalam.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(WEAPONS).map(([wId, wpn]: [string, any]) => {
                  const isCurrent = currentWeapon === wId;
                  const ammo = gameState.gun?.ammo?.[wId] || 0;
                  const owned = gameState.gun?.owned || wId === 'ketapel';

                  return (
                    <div
                      key={wId}
                      className={`rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#3b1968] border-[#ffd24a] shadow-lg'
                          : 'bg-[#1a092c] border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-['Lilita_One',sans-serif] text-lg text-white">
                            {wpn.n || wpn.name || wId}
                          </div>
                          <div className="text-xs text-amber-300 font-bold">
                            💥 Serangan: {wpn.dmg} • 🎯 Peluru: {ammo}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] uppercase">
                            Aktif
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-300 my-3">{wpn.d || wpn.desc}</p>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        {owned ? (
                          <>
                            {!isCurrent && (
                              <button
                                onClick={() => {
                                  sfx.flip();
                                  onEquipWeapon(wId);
                                }}
                                className="flex-1 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white cursor-pointer active:scale-95 transition-all"
                              >
                                Pasang
                              </button>
                            )}
                            <button
                              onClick={() => {
                                onBuyAmmo(wId);
                              }}
                              className="flex-1 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 font-bold text-xs text-white cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1"
                            >
                              <span>+5 Peluru</span>
                              <span className="text-cyan-200">(💎 3)</span>
                            </button>
                          </>
                        ) : (
                          <div className="w-full text-center text-xs text-stone-500 italic py-1">
                            🔒 Temukan di petualangan
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'items' && (
            <div className="space-y-4">
              {/* Crown of Lexicon */}
              <div className="bg-[#1a082c] border border-amber-400/40 rounded-2xl p-4">
                <h3 className="font-['Lilita_One',sans-serif] text-lg text-[#ffd24a] mb-2 flex items-center gap-2">
                  <span>👑 Mahkota Aksara ({crownCount} / 6 Pecahan)</span>
                </h3>
                <p className="text-xs text-stone-300 mb-4">
                  Kumpulkan keenam pecahan mahkota dari bos setiap wilayah untuk membuka gerbang Istana IELTS!
                </p>

                <div className="grid grid-cols-6 gap-2">
                  {['desa', 'pasar', 'satwa', 'kota', 'waktu', 'portal'].map((k, i) => {
                    const hasCrown = !!crowns[k];
                    return (
                      <div
                        key={k}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-all ${
                          hasCrown
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                            : 'bg-black/30 border-white/10 text-stone-600'
                        }`}
                      >
                        <span className="text-2xl">{hasCrown ? '👑' : '🔒'}</span>
                        <span className="text-[10px] font-black uppercase mt-1">Pecahan {i + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Artifact Items */}
              <div>
                <h3 className="font-['Lilita_One',sans-serif] text-base text-amber-200 mb-2">
                  Artifact & Pusaka Penjelajah
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(ITEMS).map(([itemId, item]: [string, any]) => {
                    const owned = !!itemsOwned[itemId];
                    return (
                      <div
                        key={itemId}
                        className={`rounded-xl p-3 border flex items-center gap-3 ${
                          owned
                            ? 'bg-[#28133f] border-amber-400/30 text-white'
                            : 'bg-black/20 border-white/5 text-stone-500'
                        }`}
                      >
                        <span className="text-3xl">{owned ? item.e || '✨' : '❓'}</span>
                        <div>
                          <div className="font-extrabold text-sm">{owned ? item.n : 'Terkunci'}</div>
                          <div className="text-xs text-stone-400">
                            {owned ? item.d || item.desc || 'Pusaka berkekuatan khusus' : 'Kalahkan bos area untuk meraih pusaka ini'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
