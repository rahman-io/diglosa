import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types/game';
import { WORDS } from '../data/vocab';
import { generateQuizQuestion, getAreaWordIndices } from '../utils/gameHelpers';
import { sfx, speakEnglish } from '../utils/audio';

interface DuelModalProps {
  monster: {
    name: string;
    hp: number;
    maxHp: number;
    isBoss?: boolean;
    bossKey?: string;
    areaId?: string;
    areaIndex?: number;
    sprite?: string;
  };
  gameState: GameState;
  onWin: (loot: { gems: number; xp: number; bossDefeated?: boolean }) => void;
  onLose: () => void;
}

export const DuelModal: React.FC<DuelModalProps> = ({
  monster,
  gameState,
  onWin,
  onLose,
}) => {
  const [heroHp, setHeroHp] = useState(gameState.hp);
  const [monHp, setMonHp] = useState(monster.hp);
  const [phase, setPhase] = useState<'take' | 'answer' | 'feedback' | 'win' | 'lose'>('take');
  const [takeTime, setTakeTime] = useState(gameState.diff === 'santai' ? 5 : 3);
  const [monProgress, setMonProgress] = useState(0); // 0 to 1 as monster advances

  // Items active in duel
  const hasSword = !!gameState.story?.items?.['pedang'];
  const hasShield = !!gameState.story?.items?.['perisai'];
  const [shieldUsed, setShieldUsed] = useState(false);
  const hasWhistle = !!gameState.story?.items?.['peluit'];
  const [whistleUsed, setWhistleUsed] = useState(false);

  // Question state
  const areaIdx = monster.areaIndex ?? 0;
  const areaWordIndices = getAreaWordIndices(areaIdx);
  const [currentQ, setCurrentQ] = useState<any>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Boss mechanics
  const [slimedOpt, setSlimedOpt] = useState<number | null>(null); // Pasar
  const [lockedOpt, setLockedOpt] = useState<number | null>(null); // Kota
  const [prevQ, setPrevQ] = useState<any>(null); // Waktu rewind

  // Generate question
  const spawnQuestion = () => {
    // Check Waktu rewind mechanic
    if (monster.bossKey === 'menara' && prevQ && Math.random() < 0.4) {
      setCurrentQ(prevQ);
      setPrevQ(null);
    } else {
      const randomWord = areaWordIndices[Math.floor(Math.random() * areaWordIndices.length)];
      const q = generateQuizQuestion(randomWord, areaWordIndices);
      setCurrentQ(q);
      if (monster.bossKey === 'menara') setPrevQ(q);
    }

    // Apply Pasar slime
    if (monster.bossKey === 'pasar' && Math.random() < 0.55) {
      setSlimedOpt(Math.floor(Math.random() * 4));
    } else {
      setSlimedOpt(null);
    }

    // Apply Kota lock
    if (monster.bossKey === 'kota') {
      // Lock a wrong option
      const wrong = [0, 1, 2, 3].filter((i) => i !== currentQ?.answerIndex);
      if (wrong.length > 0) {
        setLockedOpt(wrong[Math.floor(Math.random() * wrong.length)]);
      }
    } else {
      setLockedOpt(null);
    }

    setTakeTime(gameState.diff === 'santai' ? 5 : 3);
    setMonProgress(0);
    setPhase('take');
    setSelectedOpt(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    spawnQuestion();
  }, []);

  // Speak word when question appears
  useEffect(() => {
    if (currentQ?.en) {
      speakEnglish(currentQ.en);
    }
  }, [currentQ]);

  // Take countdown timer
  useEffect(() => {
    if (phase !== 'take') return;
    const interval = setInterval(() => {
      setTakeTime((prev) => {
        if (prev <= 0.1) {
          // Monster strikes!
          handleMonsterTake();
          return 0;
        }
        return prev - 0.1;
      });
      setMonProgress((prev) => Math.min(1, prev + 0.035));
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  // Player presses AMBIL!
  const handlePlayerTake = () => {
    sfx.tick();
    setPhase('answer');
  };

  // Whistle item used
  const handleUseWhistle = () => {
    if (whistleUsed || !currentQ) return;
    sfx.fanfare();
    setWhistleUsed(true);
    // Find wrong option and hide it
    const wrong = [0, 1, 2, 3].filter((i) => i !== currentQ.answerIndex && i !== lockedOpt);
    if (wrong.length > 0) {
      setLockedOpt(wrong[0]);
    }
  };

  // Monster takes if player is too slow
  const handleMonsterTake = () => {
    sfx.hurt();
    // Monster guesses
    const monsterGuessesRight = Math.random() < 0.65;
    if (monsterGuessesRight) {
      // Player takes damage
      if (hasShield && !shieldUsed) {
        setShieldUsed(true);
        sfx.door();
      } else {
        const nextHp = heroHp - 1;
        setHeroHp(nextHp);
        if (nextHp <= 0) {
          setPhase('lose');
          sfx.lose();
          setTimeout(() => onLose(), 1500);
          return;
        }
      }
    } else {
      // Monster missed / damaged itself
      setMonHp((prev) => Math.max(0, prev - 1));
    }
    setTimeout(() => spawnQuestion(), 1200);
  };

  // Player answers
  const handleAnswer = (index: number) => {
    if (phase !== 'answer' || selectedOpt !== null) return;
    setSelectedOpt(index);
    const correct = index === currentQ.answerIndex;
    setIsCorrect(correct);
    setPhase('feedback');

    if (correct) {
      sfx.ok();
      sfx.shoot();
      const dmg = hasSword ? 2 : 1;
      const nextMonHp = Math.max(0, monHp - dmg);
      setMonHp(nextMonHp);

      if (nextMonHp <= 0) {
        // Monster defeated!
        setPhase('win');
        sfx.fanfare();
        confetti({ particleCount: 90, spread: 80 });
        setTimeout(() => {
          onWin({
            gems: monster.isBoss ? 5 : 1,
            xp: monster.isBoss ? 50 : 15,
            bossDefeated: monster.isBoss,
          });
        }, 1500);
        return;
      }
    } else {
      sfx.no();
      sfx.hurt();

      // Satwa boss regenerates HP on wrong answers
      if (monster.bossKey === 'satwa' && monHp < monster.maxHp) {
        setMonHp((prev) => prev + 1);
      }

      // Check shield
      if (hasShield && !shieldUsed) {
        setShieldUsed(true);
        sfx.door();
      } else {
        const nextHp = heroHp - 1;
        setHeroHp(nextHp);
        if (nextHp <= 0) {
          setPhase('lose');
          sfx.lose();
          setTimeout(() => onLose(), 1500);
          return;
        }
      }
    }

    setTimeout(() => {
      spawnQuestion();
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none font-['Nunito',sans-serif] text-white">
      <div className="w-full max-w-xl bg-[#231139] border-2 border-[#ffbe53] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4">
        {/* Top Header: Lives & Boss Tag */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          {/* Hero Lives */}
          <div className="flex items-center gap-1.5 bg-[#170828] px-3 py-1 rounded-full border border-red-500/40">
            <span className="text-base">❤️</span>
            <span className="font-extrabold text-sm text-red-300">
              {heroHp} / {gameState.maxhp}
            </span>
          </div>

          <div className="font-['Lilita_One',sans-serif] text-base text-[#ffd24a] tracking-wider">
            {monster.isBoss ? `👑 BOS: ${monster.name}` : `⚔️ DUEL: ${monster.name}`}
          </div>

          {/* Monster Lives */}
          <div className="flex items-center gap-1.5 bg-[#170828] px-3 py-1 rounded-full border border-purple-500/40">
            <span className="text-base">👾</span>
            <span className="font-extrabold text-sm text-purple-300">
              {monHp} / {monster.maxHp}
            </span>
          </div>
        </div>

        {/* Duel Arena Strip */}
        <div className="relative w-full h-32 rounded-2xl overflow-hidden border-2 border-[#8a4b1c] bg-gradient-to-b from-[#ffe3a6] via-[#ffc95e] to-[#6fae3d] flex items-end justify-between px-6 pb-2 shadow-inner">
          {/* Hero Sprite */}
          <div className="relative z-10 flex flex-col items-center">
            <img
              src="/hero.webp"
              alt="Hero"
              className="h-20 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Projectile animation if correct */}
          {isCorrect === true && (
            <div className="absolute left-16 bottom-10 w-4 h-4 rounded-full bg-cyan-300 border-2 border-white shadow-[0_0_12px_#38bdf8] animate-ping" />
          )}

          {/* Advancing Monster Sprite */}
          <div
            className="relative z-10 flex flex-col items-center transition-transform duration-100"
            style={{
              transform: `translateX(-${monProgress * 120}px)`,
            }}
          >
            {monster.sprite ? (
              <img
                src={monster.sprite}
                alt={monster.name}
                className="h-16 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              />
            ) : (
              <span className="text-5xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                {monster.isBoss ? '🐉' : '👾'}
              </span>
            )}
          </div>
        </div>

        {/* Question Prompt */}
        {currentQ && (
          <div className="text-center py-1">
            <div className="text-xs font-black uppercase tracking-widest text-amber-300">
              Kosakata Target
            </div>
            <div className="text-3xl font-['Lilita_One',sans-serif] text-white tracking-wide flex items-center justify-center gap-2">
              <span>{currentQ.en}</span>
              <button
                onClick={() => speakEnglish(currentQ.en)}
                className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 text-sm flex items-center justify-center cursor-pointer"
              >
                🔊
              </button>
            </div>
          </div>
        )}

        {/* Phase Action: AMBIL! Button or 4 Choices */}
        {phase === 'take' && (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handlePlayerTake}
              className="w-full py-4 rounded-2xl font-['Lilita_One',sans-serif] text-2xl tracking-wider text-stone-900 bg-gradient-to-r from-[#ffd24a] via-[#f59e0b] to-[#ea580c] hover:brightness-110 active:scale-95 shadow-[0_6px_24px_rgba(245,158,11,0.5)] border-2 border-[#fef08a] transition-all cursor-pointer flex items-center justify-center gap-2 animate-pulse"
            >
              <span>⚡ AMBIL SOAL! ({takeTime.toFixed(1)}s)</span>
            </button>
            <div className="text-xs text-amber-200/80 font-bold">
              Tekan AMBIL sebelum monster menerjang untuk merebut hak menjawab!
            </div>
          </div>
        )}

        {(phase === 'answer' || phase === 'feedback') && currentQ && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2.5">
              {currentQ.options.map((opt: string, i: number) => {
                const isSelected = selectedOpt === i;
                const isAnswer = i === currentQ.answerIndex;
                const isLocked = lockedOpt === i;
                const isSlimed = slimedOpt === i;

                let btnClass = 'bg-[#1a082c] border-white/15 text-white hover:border-amber-400';

                if (isLocked) {
                  btnClass = 'bg-stone-900/60 border-stone-700 text-stone-500 opacity-50 cursor-not-allowed';
                } else if (phase === 'feedback') {
                  if (isAnswer) {
                    btnClass = 'bg-green-600 border-green-300 text-white animate-pulse';
                  } else if (isSelected) {
                    btnClass = 'bg-red-600 border-red-300 text-white';
                  } else {
                    btnClass = 'bg-black/30 border-white/5 opacity-50';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={isLocked || phase === 'feedback'}
                    onClick={() => handleAnswer(i)}
                    className={`p-3 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center ${btnClass}`}
                  >
                    {isLocked ? (
                      <span>🔒 Terkunci</span>
                    ) : isSlimed ? (
                      <span className="text-lime-400 font-black">🟢 ???</span>
                    ) : (
                      <span>{opt}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Item usage during duel */}
            {hasWhistle && !whistleUsed && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleUseWhistle}
                  className="px-4 py-1.5 rounded-full bg-cyan-700/60 hover:bg-cyan-600 text-cyan-200 text-xs font-bold border border-cyan-400/40 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>🪈 Gunakan Peluit Rimba (Hapus 1 Pilihan Salah)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Win / Lose State */}
        {phase === 'win' && (
          <div className="text-center font-['Lilita_One',sans-serif] text-2xl text-amber-300 py-3 animate-bounce">
            🎉 Menang Duel! Monster Berhasil Ditaklukkan!
          </div>
        )}

        {phase === 'lose' && (
          <div className="text-center font-['Lilita_One',sans-serif] text-2xl text-red-400 py-3">
            💔 Nyawa Habis! Hoot mundur ke Hutan...
          </div>
        )}
      </div>
    </div>
  );
};
