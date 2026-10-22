import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WORDS } from '../data/vocab';
import { GameState, WordProgress } from '../types/game';
import {
  generateQuizQuestion,
  generateMatchGame,
  getAreaWordIndices,
  getLevel,
} from '../utils/gameHelpers';
import { sfx, speakEnglish } from '../utils/audio';

export type GameMode = 'cards' | 'quiz' | 'listen' | 'type' | 'match';

interface VocabGameProps {
  mode: GameMode;
  areaIndex: number;
  gameState: GameState;
  onFinish: (result: { xp: number; gems: number; answers: Array<{ idx: number; ok: boolean }> }) => void;
  onExit: () => void;
}

export const VocabGame: React.FC<VocabGameProps> = ({
  mode,
  areaIndex,
  gameState,
  onFinish,
  onExit,
}) => {
  const [wordIndices, setWordIndices] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Array<{ idx: number; ok: boolean }>>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Cards state
  const [flipped, setFlipped] = useState(false);

  // Quiz / Listen state
  const [quizQ, setQuizQ] = useState<any>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<boolean | null>(null);

  // Type state
  const [typeInput, setTypeInput] = useState('');
  const [typeFeedback, setTypeFeedback] = useState<boolean | null>(null);

  // Match state
  const [matchCards, setMatchCards] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(mode === 'match' ? 120 : 15);
  const maxTime = mode === 'match' ? 120 : 15;

  // Initialize word pool
  useEffect(() => {
    const indices = getAreaWordIndices(areaIndex);
    const chosen = indices.slice(0, mode === 'match' ? 8 : 10);
    setWordIndices(chosen);
    setCurrentIdx(0);
    setAnswers([]);
    setIsFinished(false);

    if (mode === 'quiz' || mode === 'listen') {
      if (chosen.length > 0) {
        setQuizQ(generateQuizQuestion(chosen[0], indices));
      }
    } else if (mode === 'match') {
      setMatchCards(generateMatchGame(indices, 8));
    }
  }, [mode, areaIndex]);

  // Speech on question load
  useEffect(() => {
    if ((mode === 'quiz' || mode === 'listen') && quizQ) {
      speakEnglish(quizQ.en);
    }
    if (mode === 'cards' && wordIndices[currentIdx] != null) {
      speakEnglish(WORDS[wordIndices[currentIdx]].en);
    }
  }, [quizQ, currentIdx, mode]);

  // Timer countdown
  useEffect(() => {
    if (isFinished || gameState.qtimer === 'off' || mode === 'cards') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timeout
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIdx, isFinished, mode, gameState.qtimer]);

  const handleTimeout = () => {
    if (mode === 'quiz' || mode === 'listen') {
      if (quizFeedback === null) {
        sfx.lose();
        setQuizFeedback(false);
      }
    } else if (mode === 'type') {
      if (typeFeedback === null) {
        sfx.lose();
        setTypeFeedback(false);
      }
    }
  };

  const currentWord = wordIndices[currentIdx] != null ? WORDS[wordIndices[currentIdx]] : null;

  // Next question
  const advanceQuestion = (ok: boolean) => {
    const targetIdx = wordIndices[currentIdx];
    const newAnswers = [...answers, { idx: targetIdx, ok }];
    setAnswers(newAnswers);

    if (currentIdx + 1 < wordIndices.length) {
      setCurrentIdx(currentIdx + 1);
      setFlipped(false);
      setSelectedOpt(null);
      setQuizFeedback(null);
      setTypeInput('');
      setTypeFeedback(null);
      setTimeLeft(15);

      if (mode === 'quiz' || mode === 'listen') {
        setQuizQ(generateQuizQuestion(wordIndices[currentIdx + 1], getAreaWordIndices(areaIndex)));
      }
    } else {
      // Done!
      setIsFinished(true);
      sfx.fanfare();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Match card click
  const handleMatchCardClick = (index: number) => {
    if (matchCards[index].matched || selectedCards.includes(index) || selectedCards.length >= 2) return;
    sfx.flip();
    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const cardA = matchCards[newSelected[0]];
      const cardB = matchCards[newSelected[1]];
      if (cardA.wordIndex === cardB.wordIndex && cardA.lang !== cardB.lang) {
        // Match!
        sfx.ok();
        setTimeout(() => {
          setMatchCards((prev) =>
            prev.map((c, i) => (i === newSelected[0] || i === newSelected[1] ? { ...c, matched: true } : c))
          );
          setSelectedCards([]);

          // Check if all matched
          const remaining = matchCards.filter(
            (c, i) => !c.matched && i !== newSelected[0] && i !== newSelected[1]
          );
          if (remaining.length === 0) {
            setIsFinished(true);
            sfx.fanfare();
            confetti({ particleCount: 80, spread: 70 });
          }
        }, 400);
      } else {
        // Not a match
        sfx.no();
        setTimeout(() => {
          setSelectedCards([]);
        }, 800);
      }
    }
  };

  // Result calculations
  const correctCount = mode === 'match' ? 8 : answers.filter((a) => a.ok).length;
  const totalQuestions = mode === 'match' ? 8 : wordIndices.length;
  const earnedXp = correctCount * 10;
  const earnedGems = correctCount >= Math.floor(totalQuestions * 0.7) ? 2 : 1;

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140624]/90 backdrop-blur-md select-none font-['Nunito',sans-serif] text-white">
        <div className="w-full max-w-md bg-[#25123d] border-2 border-[#ffbe53] rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mb-4 animate-bounce">
            🏆
          </div>

          <h2 className="text-3xl font-['Lilita_One',sans-serif] tracking-wider text-[#ffd24a] mb-1">
            Latihan Selesai!
          </h2>
          <p className="text-sm font-bold text-stone-300 mb-6">
            Hasil: {correctCount} dari {totalQuestions} soal berhasil dijawab!
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="bg-[#170a27] p-3 rounded-2xl border border-white/10">
              <div className="text-xs text-stone-400 font-bold uppercase">XP Diperoleh</div>
              <div className="text-2xl font-black text-amber-300">+{earnedXp} XP</div>
            </div>
            <div className="bg-[#170a27] p-3 rounded-2xl border border-white/10">
              <div className="text-xs text-stone-400 font-bold uppercase">Hadiah Berlian</div>
              <div className="text-2xl font-black text-cyan-300">+{earnedGems} 💎</div>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.fanfare();
              onFinish({ xp: earnedXp, gems: earnedGems, answers });
            }}
            className="w-full py-3.5 px-6 rounded-2xl font-['Lilita_One',sans-serif] text-lg text-stone-900 bg-gradient-to-r from-[#ffd24a] to-[#f59e0b] hover:brightness-110 active:scale-95 shadow-lg border border-[#fef08a] transition-all cursor-pointer"
          >
            Selesai & Ambil Hadiah ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-6 bg-[#1a092c] select-none font-['Nunito',sans-serif] text-white overflow-hidden">
      {/* Top Header */}
      <header className="w-full max-w-3xl flex items-center justify-between py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.tick();
              onExit();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-bold cursor-pointer transition-all"
          >
            ✕ Keluar
          </button>
          <span className="font-['Lilita_One',sans-serif] text-lg text-amber-300 tracking-wider">
            {mode === 'cards'
              ? '🃏 Kartu Kilat'
              : mode === 'quiz'
              ? '⚡ Kuis Kilat'
              : mode === 'listen'
              ? '🎧 Telinga Tajam'
              : mode === 'type'
              ? '✍️ Jago Ejaan'
              : '🧩 Pasang Kartu'}
          </span>
        </div>

        {/* Progress & Timer */}
        <div className="flex items-center gap-3">
          {mode !== 'cards' && gameState.qtimer !== 'off' && (
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/10 text-xs font-black">
              <span>⏱️</span>
              <span className={timeLeft <= 4 ? 'text-red-400 animate-pulse' : 'text-amber-300'}>
                {timeLeft}s
              </span>
            </div>
          )}
          <span className="text-xs font-bold bg-purple-900/60 px-3 py-1 rounded-full border border-purple-400/30">
            {currentIdx + 1} / {wordIndices.length || 8}
          </span>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center py-4">
        {/* Flashcards */}
        {mode === 'cards' && currentWord && (
          <div className="w-full flex flex-col items-center gap-6">
            <div
              onClick={() => {
                sfx.flip();
                setFlipped(!flipped);
              }}
              className="w-full max-w-sm h-64 bg-[#281345] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-300 active:scale-95 transition-all"
            >
              <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">
                {flipped ? 'Arti Indonesia' : 'Kosakata Bahasa Inggris'}
              </div>
              <div className="text-4xl font-['Lilita_One',sans-serif] text-white tracking-wide mb-2">
                {flipped ? currentWord.id : currentWord.en}
              </div>
              {!flipped && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakEnglish(currentWord.en);
                    sfx.pick();
                  }}
                  className="mt-3 w-10 h-10 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 flex items-center justify-center text-lg transition-all"
                >
                  🔊
                </button>
              )}
              <div className="text-[11px] text-stone-400 mt-6 italic">
                Ketuk kartu untuk membalik
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <button
                onClick={() => {
                  sfx.no();
                  advanceQuestion(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 font-bold text-sm border border-white/10 transition-all cursor-pointer"
              >
                Belum Ingat ✗
              </button>
              <button
                onClick={() => {
                  sfx.ok();
                  advanceQuestion(true);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 hover:brightness-110 active:scale-95 text-white font-['Lilita_One',sans-serif] text-base border border-emerald-300 shadow-md transition-all cursor-pointer"
              >
                Sudah Hafal ✓
              </button>
            </div>
          </div>
        )}

        {/* Quiz or Listen */}
        {(mode === 'quiz' || mode === 'listen') && quizQ && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full bg-[#271243] border-2 border-purple-400/40 rounded-3xl p-6 shadow-xl text-center flex flex-col items-center">
              <div className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1">
                {mode === 'quiz' ? 'Terjemahkan kata ini' : 'Dengarkan suara berikut'}
              </div>

              {mode === 'quiz' ? (
                <div className="text-3xl sm:text-4xl font-['Lilita_One',sans-serif] text-white tracking-wide my-2 flex items-center gap-3">
                  <span>{quizQ.en}</span>
                  <button
                    onClick={() => speakEnglish(quizQ.en)}
                    className="w-9 h-9 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 flex items-center justify-center text-base cursor-pointer"
                  >
                    🔊
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => speakEnglish(quizQ.en)}
                  className="my-3 py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-900 font-black text-lg flex items-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <span>🔊 Putar Ulang Suara</span>
                </button>
              )}
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {quizQ.options.map((opt: string, i: number) => {
                const isSelected = selectedOpt === i;
                const isCorrect = i === quizQ.answerIndex;
                let btnStyle = 'bg-[#1e0a35] border-white/15 text-white hover:border-amber-400';

                if (quizFeedback !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-green-600/90 border-green-300 text-white animate-pulse';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-600/90 border-red-300 text-white';
                  } else {
                    btnStyle = 'bg-black/30 border-white/5 opacity-50';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={quizFeedback !== null}
                    onClick={() => {
                      setSelectedOpt(i);
                      const ok = i === quizQ.answerIndex;
                      if (ok) sfx.ok();
                      else sfx.no();
                      setQuizFeedback(ok);
                      setTimeout(() => advanceQuestion(ok), 1100);
                    }}
                    className={`p-4 rounded-2xl border-2 font-bold text-base transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Spelling / Type */}
        {mode === 'type' && currentWord && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full bg-[#271243] border-2 border-purple-400/40 rounded-3xl p-6 shadow-xl text-center">
              <div className="text-xs font-black text-amber-300 uppercase tracking-widest mb-2">
                Ketik ejaan bahasa Inggris untuk:
              </div>
              <div className="text-3xl font-['Lilita_One',sans-serif] text-[#ffd24a] mb-2">
                "{currentWord.id}"
              </div>
              <button
                onClick={() => speakEnglish(currentWord.en)}
                className="mt-1 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔊 Dengarkan petunjuk suara</span>
              </button>
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!typeInput.trim() || typeFeedback !== null) return;
                const ok = typeInput.trim().toLowerCase() === currentWord.en.toLowerCase();
                if (ok) sfx.ok();
                else sfx.no();
                setTypeFeedback(ok);
                setTimeout(() => advanceQuestion(ok), 1200);
              }}
              className="w-full max-w-md flex flex-col gap-3"
            >
              <input
                type="text"
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value)}
                autoFocus
                placeholder="Ketik kata bahasa Inggris di sini..."
                className={`w-full py-3 px-4 rounded-2xl text-center font-bold text-lg bg-[#150727] border-2 focus:outline-none transition-all ${
                  typeFeedback === true
                    ? 'border-green-400 text-green-300 bg-green-950/40'
                    : typeFeedback === false
                    ? 'border-red-400 text-red-300 bg-red-950/40'
                    : 'border-white/20 text-white focus:border-amber-400'
                }`}
              />

              {typeFeedback === false && (
                <div className="text-center text-sm font-bold text-amber-300">
                  Jawaban benar: <span className="underline">{currentWord.en}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={typeFeedback !== null}
                className="py-3 rounded-2xl font-['Lilita_One',sans-serif] text-base text-stone-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 shadow-md cursor-pointer transition-all"
              >
                Kirim Jawaban ➔
              </button>
            </form>
          </div>
        )}

        {/* Pasang Kartu (Matching Game) */}
        {mode === 'match' && (
          <div className="w-full grid grid-cols-4 gap-2.5 max-w-lg">
            {matchCards.map((card, i) => {
              const isSelected = selectedCards.includes(i);
              return (
                <button
                  key={card.id}
                  disabled={card.matched}
                  onClick={() => handleMatchCardClick(i)}
                  className={`aspect-[4/3] rounded-2xl p-2 border-2 font-bold text-xs sm:text-sm flex items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                    card.matched
                      ? 'bg-green-950/40 border-green-500/40 text-green-400/40 scale-90 opacity-40'
                      : isSelected
                      ? 'bg-amber-500 border-amber-300 text-stone-900 shadow-lg scale-105'
                      : 'bg-[#220d3d] border-white/15 text-white hover:border-amber-400/60'
                  }`}
                >
                  <span className="line-clamp-2">{card.text}</span>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
