import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  IELTS_MODS,
  IELTS_LIS,
  IELTS_RD,
  IELTS_WR,
  IELTS_SPK,
  IELTS_EX,
} from '../data/ieltsData';
import { loadIeltsScores, saveIeltsScores } from '../utils/storage';
import { sfx, speakEnglish } from '../utils/audio';

interface IeltsAcademyProps {
  onReturnToForest: () => void;
}

export const IeltsAcademy: React.FC<IeltsAcademyProps> = ({ onReturnToForest }) => {
  const [activeTab, setActiveTab] = useState<'hall' | 'listening' | 'reading' | 'writing' | 'speaking' | 'scores'>('hall');
  const [scores, setScores] = useState<Record<string, any>>(loadIeltsScores());

  // Listening test state
  const [lisIdx, setLisIdx] = useState(0);
  const [lisAnswers, setLisAnswers] = useState<Record<number, number>>({});
  const [lisFinished, setLisFinished] = useState(false);

  // Reading test state
  const [rdIdx, setRdIdx] = useState(0);
  const [rdAnswers, setRdAnswers] = useState<Record<number, number>>({});
  const [rdFinished, setRdFinished] = useState(false);

  // Writing test state
  const [wrTask, setWrTask] = useState<1 | 2>(1);
  const [wrText, setWrText] = useState('');
  const [wrFinished, setWrFinished] = useState(false);

  // Speaking test state
  const [spkPart, setSpkPart] = useState(0);
  const [spkFinished, setSpkFinished] = useState(false);

  const saveScore = (mod: string, band: number) => {
    const next = { ...scores, [mod]: band, lastUpdate: Date.now() };
    setScores(next);
    saveIeltsScores(next);
  };

  // Listening submit
  const finishListening = () => {
    let correct = 0;
    IELTS_LIS.forEach((q: any, i: number) => {
      if (lisAnswers[i] === q.ans) correct++;
    });
    const band = Math.min(9, Math.max(3.5, 4.0 + correct * 0.5));
    saveScore('L', band);
    setLisFinished(true);
    sfx.fanfare();
    confetti({ particleCount: 60, spread: 50 });
  };

  // Reading submit
  const finishReading = () => {
    let correct = 0;
    const articles = IELTS_RD?.academic || [];
    articles.forEach((p: any, i: number) => {
      if (p.q && rdAnswers[i] === p.q.ans) correct++;
    });
    const band = Math.min(9, Math.max(3.5, 4.0 + correct * 0.6));
    saveScore('R', band);
    setRdFinished(true);
    sfx.fanfare();
    confetti({ particleCount: 60, spread: 50 });
  };

  // Writing submit
  const finishWriting = () => {
    const wordCount = wrText.trim().split(/\s+/).filter(Boolean).length;
    let band = 5.0;
    if (wordCount >= 150) band = 6.0;
    if (wordCount >= 220) band = 7.0;
    if (wordCount >= 280) band = 7.5;
    saveScore('W', band);
    setWrFinished(true);
    sfx.fanfare();
    confetti({ particleCount: 60, spread: 50 });
  };

  // Speaking submit
  const finishSpeaking = () => {
    saveScore('S', 6.5);
    setSpkFinished(true);
    sfx.fanfare();
    confetti({ particleCount: 60, spread: 50 });
  };

  // Calculate overall band
  const lBand = scores.L || 0;
  const rBand = scores.R || 0;
  const wBand = scores.W || 0;
  const sBand = scores.S || 0;
  const overallBand =
    lBand && rBand && wBand && sBand
      ? ((lBand + rBand + wBand + sBand) / 4).toFixed(1)
      : null;

  return (
    <div className="relative w-full h-full min-h-screen bg-[#110521] text-white flex flex-col font-['Nunito',sans-serif] select-none overflow-x-hidden">
      {/* Background Castle Painting */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url('/castle.webp')` }}
      />

      {/* Top Header */}
      <header className="relative z-10 w-full bg-[#200b39]/90 border-b border-[#a855f7]/40 px-4 py-3 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sfx.door();
              onReturnToForest();
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-bold cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>🌲 Kembali ke Hutan</span>
          </button>
          <h1 className="font-['Lilita_One',sans-serif] text-xl text-[#ffd24a] tracking-wider flex items-center gap-2">
            <span>🏰 Istana IELTS</span>
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => {
              sfx.tick();
              setActiveTab('hall');
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'hall'
                ? 'bg-amber-500 text-stone-900 font-black shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-stone-300'
            }`}
          >
            Aula Penguji
          </button>
          <button
            onClick={() => {
              sfx.tick();
              setActiveTab('scores');
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'scores'
                ? 'bg-amber-500 text-stone-900 font-black shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-stone-300'
            }`}
          >
            🏆 Rapor Skor
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-4 max-w-5xl mx-auto w-full">
        {/* Hall View: 4 Examiners */}
        {activeTab === 'hall' && (
          <div className="space-y-6">
            <div className="bg-[#210c3b]/85 border-2 border-purple-500/40 rounded-3xl p-6 backdrop-blur-md shadow-xl text-center">
              <h2 className="text-2xl sm:text-3xl font-['Lilita_One',sans-serif] text-[#ffd24a] mb-2">
                Selamat Datang di Akademi Ujian IELTS
              </h2>
              <p className="text-sm text-stone-300 max-w-xl mx-auto">
                Uji kemampuan bahasa Inggrismu dalam 4 modul resmi: Mendengar (Listening), Membaca (Reading), Menulis (Writing), dan Berbicara (Speaking).
              </p>
            </div>

            {/* Examiners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Listening */}
              <div className="bg-[#240e3f]/90 border-2 border-cyan-400/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-cyan-300 transition-all">
                <div className="flex items-start gap-4">
                  <img
                    src="/portraits/sera.webp"
                    alt="Sera"
                    className="w-16 h-16 rounded-2xl object-cover bg-cyan-900/40 border-2 border-cyan-400"
                  />
                  <div>
                    <div className="font-['Lilita_One',sans-serif] text-lg text-white">
                      🎧 Sera si Pendengar (Listening)
                    </div>
                    <div className="text-xs text-cyan-200 mt-0.5">
                      Aula Dengar • Dengarkan percakapan dan jawab soal ujian
                    </div>
                    <div className="mt-2 text-xs font-bold text-amber-300">
                      Skor Terakhir: {scores.L ? `Band ${scores.L}` : 'Belum diuji'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sfx.door();
                    setActiveTab('listening');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-['Lilita_One',sans-serif] text-white text-sm cursor-pointer active:scale-95 transition-all shadow-md"
                >
                  Mulai Ujian Listening ➔
                </button>
              </div>

              {/* Reading */}
              <div className="bg-[#240e3f]/90 border-2 border-emerald-400/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-emerald-300 transition-all">
                <div className="flex items-start gap-4">
                  <img
                    src="/portraits/bima.webp"
                    alt="Bima"
                    className="w-16 h-16 rounded-2xl object-cover bg-emerald-900/40 border-2 border-emerald-400"
                  />
                  <div>
                    <div className="font-['Lilita_One',sans-serif] text-lg text-white">
                      📖 Pustakawan Bima (Reading)
                    </div>
                    <div className="text-xs text-emerald-200 mt-0.5">
                      Perpustakaan • Pahami teks artikel bahasa Inggris
                    </div>
                    <div className="mt-2 text-xs font-bold text-amber-300">
                      Skor Terakhir: {scores.R ? `Band ${scores.R}` : 'Belum diuji'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sfx.door();
                    setActiveTab('reading');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-['Lilita_One',sans-serif] text-white text-sm cursor-pointer active:scale-95 transition-all shadow-md"
                >
                  Mulai Ujian Reading ➔
                </button>
              </div>

              {/* Writing */}
              <div className="bg-[#240e3f]/90 border-2 border-amber-400/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-amber-300 transition-all">
                <div className="flex items-start gap-4">
                  <img
                    src="/portraits/rangga.webp"
                    alt="Rangga"
                    className="w-16 h-16 rounded-2xl object-cover bg-amber-900/40 border-2 border-amber-400"
                  />
                  <div>
                    <div className="font-['Lilita_One',sans-serif] text-lg text-white">
                      ✍️ Rangga si Penulis (Writing)
                    </div>
                    <div className="text-xs text-amber-200 mt-0.5">
                      Meja Tulis • Tulis laporan Task 1 dan esai opini Task 2
                    </div>
                    <div className="mt-2 text-xs font-bold text-amber-300">
                      Skor Terakhir: {scores.W ? `Band ${scores.W}` : 'Belum diuji'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sfx.door();
                    setActiveTab('writing');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-['Lilita_One',sans-serif] text-white text-sm cursor-pointer active:scale-95 transition-all shadow-md"
                >
                  Mulai Ujian Writing ➔
                </button>
              </div>

              {/* Speaking */}
              <div className="bg-[#240e3f]/90 border-2 border-pink-400/40 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-pink-300 transition-all">
                <div className="flex items-start gap-4">
                  <img
                    src="/portraits/ayu.webp"
                    alt="Ayu"
                    className="w-16 h-16 rounded-2xl object-cover bg-pink-900/40 border-2 border-pink-400"
                  />
                  <div>
                    <div className="font-['Lilita_One',sans-serif] text-lg text-white">
                      🗣️ Ayu si Penguji (Speaking)
                    </div>
                    <div className="text-xs text-pink-200 mt-0.5">
                      Panggung Bicara • Latihan wawancara dan kelancaran berbicara
                    </div>
                    <div className="mt-2 text-xs font-bold text-amber-300">
                      Skor Terakhir: {scores.S ? `Band ${scores.S}` : 'Belum diuji'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sfx.door();
                    setActiveTab('speaking');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 font-['Lilita_One',sans-serif] text-white text-sm cursor-pointer active:scale-95 transition-all shadow-md"
                >
                  Mulai Ujian Speaking ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Listening Test Screen */}
        {activeTab === 'listening' && (
          <div className="bg-[#200c3b]/95 border-2 border-cyan-400/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Lilita_One',sans-serif] text-2xl text-cyan-300">
                🎧 Modul Listening IELTS
              </h2>
              <button
                onClick={() => setActiveTab('hall')}
                className="px-3 py-1 rounded-xl bg-stone-800 text-xs font-bold hover:bg-stone-700"
              >
                ✕ Kembali
              </button>
            </div>

            {!lisFinished ? (
              <div className="space-y-6">
                {IELTS_LIS.map((item: any, idx: number) => (
                  <div key={idx} className="bg-[#17072a] p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-cyan-200">Soal {idx + 1}</span>
                      <button
                        onClick={() => {
                          speakEnglish(item.audio || item.q);
                          sfx.pick();
                        }}
                        className="px-3 py-1 rounded-full bg-cyan-700/50 hover:bg-cyan-600 text-cyan-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>🔊 Putar Audio Soal</span>
                      </button>
                    </div>

                    <p className="text-base font-extrabold text-white">{item.q}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.opts.map((opt: string, optIdx: number) => {
                        const selected = lisAnswers[idx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              sfx.tick();
                              setLisAnswers({ ...lisAnswers, [idx]: optIdx });
                            }}
                            className={`p-3 rounded-xl border text-sm font-bold text-left transition-all cursor-pointer ${
                              selected
                                ? 'bg-cyan-600 border-cyan-300 text-white shadow-md'
                                : 'bg-[#220e3d] border-white/10 text-stone-300 hover:border-cyan-400/50'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  onClick={finishListening}
                  className="w-full py-3.5 rounded-2xl font-['Lilita_One',sans-serif] text-lg text-stone-900 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer transition-all"
                >
                  Selesai & Kumpulkan Jawaban Listening ➔
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="font-['Lilita_One',sans-serif] text-3xl text-cyan-300">
                  Ujian Listening Selesai!
                </h3>
                <div className="text-2xl font-black text-amber-300">
                  Perkiraan Nilai: Band {scores.L}
                </div>
                <button
                  onClick={() => {
                    setLisFinished(false);
                    setActiveTab('hall');
                  }}
                  className="py-2.5 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-sm text-white"
                >
                  Kembali ke Aula Penguji
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reading Test Screen */}
        {activeTab === 'reading' && (
          <div className="bg-[#200c3b]/95 border-2 border-emerald-400/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Lilita_One',sans-serif] text-2xl text-emerald-300">
                📖 Modul Reading IELTS
              </h2>
              <button
                onClick={() => setActiveTab('hall')}
                className="px-3 py-1 rounded-xl bg-stone-800 text-xs font-bold hover:bg-stone-700"
              >
                ✕ Kembali
              </button>
            </div>

            {!rdFinished ? (
              <div className="space-y-6">
                {(IELTS_RD?.academic || []).map((p: any, idx: number) => (
                  <div key={idx} className="bg-[#17072a] p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="font-['Lilita_One',sans-serif] text-lg text-emerald-300">
                      {p.title || `Bacaan ${idx + 1}`}
                    </div>
                    <div className="bg-[#240e3f] p-4 rounded-xl text-stone-200 text-sm leading-relaxed border border-white/5">
                      {p.text}
                    </div>

                    {p.q && (
                      <div className="space-y-2 pt-2">
                        <div className="font-bold text-sm text-white">{p.q.text}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {p.q.opts.map((opt: string, optIdx: number) => {
                            const selected = rdAnswers[idx] === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  sfx.tick();
                                  setRdAnswers({ ...rdAnswers, [idx]: optIdx });
                                }}
                                className={`p-3 rounded-xl border text-sm font-bold text-left transition-all cursor-pointer ${
                                  selected
                                    ? 'bg-emerald-600 border-emerald-300 text-white shadow-md'
                                    : 'bg-[#220e3d] border-white/10 text-stone-300 hover:border-emerald-400/50'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={finishReading}
                  className="w-full py-3.5 rounded-2xl font-['Lilita_One',sans-serif] text-lg text-stone-900 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer transition-all"
                >
                  Selesai & Kumpulkan Jawaban Reading ➔
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="font-['Lilita_One',sans-serif] text-3xl text-emerald-300">
                  Ujian Reading Selesai!
                </h3>
                <div className="text-2xl font-black text-amber-300">
                  Perkiraan Nilai: Band {scores.R}
                </div>
                <button
                  onClick={() => {
                    setRdFinished(false);
                    setActiveTab('hall');
                  }}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white"
                >
                  Kembali ke Aula Penguji
                </button>
              </div>
            )}
          </div>
        )}

        {/* Writing Test Screen */}
        {activeTab === 'writing' && (
          <div className="bg-[#200c3b]/95 border-2 border-amber-400/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Lilita_One',sans-serif] text-2xl text-amber-300">
                ✍️ Modul Writing IELTS
              </h2>
              <button
                onClick={() => setActiveTab('hall')}
                className="px-3 py-1 rounded-xl bg-stone-800 text-xs font-bold hover:bg-stone-700"
              >
                ✕ Kembali
              </button>
            </div>

            {!wrFinished ? (
              <div className="space-y-4">
                {/* Task selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setWrTask(1)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer ${
                      wrTask === 1 ? 'bg-amber-500 text-stone-900' : 'bg-white/10 text-stone-300'
                    }`}
                  >
                    Task 1 (Deskripsi / Laporan)
                  </button>
                  <button
                    onClick={() => setWrTask(2)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer ${
                      wrTask === 2 ? 'bg-amber-500 text-stone-900' : 'bg-white/10 text-stone-300'
                    }`}
                  >
                    Task 2 (Esai Argumen)
                  </button>
                </div>

                <div className="bg-[#17072a] p-4 rounded-2xl border border-white/10">
                  <div className="text-xs text-amber-300 font-black uppercase tracking-wider mb-1">
                    Topik Task {wrTask}
                  </div>
                  <div className="text-white font-bold text-sm sm:text-base">
                    {wrTask === 1
                      ? IELTS_WR?.academic?.t1?.p || 'Describe the trends shown in the diagram and highlight main features.'
                      : IELTS_WR?.academic?.t2?.p || 'Some people believe technology improves education. To what extent do you agree or disagree?'}
                  </div>
                </div>

                {/* Text area */}
                <div>
                  <textarea
                    rows={10}
                    value={wrText}
                    onChange={(e) => setWrText(e.target.value)}
                    placeholder="Tulis esaimu dalam bahasa Inggris di sini..."
                    className="w-full bg-[#150624] border border-white/20 rounded-2xl p-4 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center justify-between text-xs text-stone-400 px-1 mt-1">
                    <span>
                      Jumlah Kata: {wrText.trim().split(/\s+/).filter(Boolean).length} kata
                    </span>
                    <span>Minimal: {wrTask === 1 ? '150 kata' : '250 kata'}</span>
                  </div>
                </div>

                <button
                  onClick={finishWriting}
                  className="w-full py-3.5 rounded-2xl font-['Lilita_One',sans-serif] text-lg text-stone-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 shadow-lg cursor-pointer transition-all"
                >
                  Evaluasi Esai & Berikan Nilai ➔
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="font-['Lilita_One',sans-serif] text-3xl text-amber-300">
                  Ujian Writing Selesai!
                </h3>
                <div className="text-2xl font-black text-amber-300">
                  Perkiraan Nilai: Band {scores.W}
                </div>
                <button
                  onClick={() => {
                    setWrFinished(false);
                    setActiveTab('hall');
                  }}
                  className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-sm text-white"
                >
                  Kembali ke Aula Penguji
                </button>
              </div>
            )}
          </div>
        )}

        {/* Speaking Test Screen */}
        {activeTab === 'speaking' && (
          <div className="bg-[#200c3b]/95 border-2 border-pink-400/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Lilita_One',sans-serif] text-2xl text-pink-300">
                🗣️ Modul Speaking IELTS
              </h2>
              <button
                onClick={() => setActiveTab('hall')}
                className="px-3 py-1 rounded-xl bg-stone-800 text-xs font-bold hover:bg-stone-700"
              >
                ✕ Kembali
              </button>
            </div>

            {!spkFinished ? (
              <div className="space-y-6 text-center">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-pink-400">
                  <img src="/portraits/ayu.webp" alt="Ayu" className="w-full h-full object-cover" />
                </div>

                <div className="bg-[#17072a] p-5 rounded-2xl border border-white/10 max-w-lg mx-auto space-y-2">
                  <div className="text-xs text-pink-300 font-black uppercase tracking-wider">
                    Pertanyaan Penguji (Part {spkPart + 1})
                  </div>
                  <div className="text-lg font-black text-white">
                    "{(IELTS_SPK[spkPart] as any)?.q || (IELTS_SPK[spkPart] as any)?.prompt || 'Could you tell me about your hometown and what you like about it?'}"
                  </div>
                  <button
                    onClick={() => speakEnglish((IELTS_SPK[spkPart] as any)?.q || 'Hello')}
                    className="mt-2 px-4 py-1.5 rounded-full bg-pink-700/40 text-pink-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🔊 Putar Suara Penguji</span>
                  </button>
                </div>

                <div className="max-w-md mx-auto space-y-3">
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-sm text-stone-300">
                    🎤 Silakan jawab pertanyaan di atas dengan suara lantang dan jelas. Tekan tombol di bawah setelah selesai menjawab.
                  </div>

                  <div className="flex gap-2">
                    {spkPart + 1 < IELTS_SPK.length ? (
                      <button
                        onClick={() => {
                          sfx.ok();
                          setSpkPart(spkPart + 1);
                        }}
                        className="flex-1 py-3 rounded-2xl bg-pink-600 hover:bg-pink-500 font-['Lilita_One',sans-serif] text-base text-white cursor-pointer active:scale-95"
                      >
                        Lanjut ke Bagian Berikutnya ➔
                      </button>
                    ) : (
                      <button
                        onClick={finishSpeaking}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 font-['Lilita_One',sans-serif] text-base text-white cursor-pointer active:scale-95"
                      >
                        Selesai Wawancara ➔
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="font-['Lilita_One',sans-serif] text-3xl text-pink-300">
                  Ujian Speaking Selesai!
                </h3>
                <div className="text-2xl font-black text-amber-300">
                  Perkiraan Nilai: Band {scores.S}
                </div>
                <button
                  onClick={() => {
                    setSpkFinished(false);
                    setActiveTab('hall');
                  }}
                  className="py-2.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 font-bold text-sm text-white"
                >
                  Kembali ke Aula Penguji
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scorecard View */}
        {activeTab === 'scores' && (
          <div className="bg-[#200c3b]/95 border-2 border-amber-400/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Lilita_One',sans-serif] text-2xl text-amber-300">
                🏆 Rapor Hasil Ujian Resmi IELTS
              </h2>
              <button
                onClick={() => setActiveTab('hall')}
                className="px-3 py-1 rounded-xl bg-stone-800 text-xs font-bold hover:bg-stone-700"
              >
                ✕ Kembali
              </button>
            </div>

            {/* Overall Band Banner */}
            <div className="bg-gradient-to-r from-purple-900/60 via-amber-900/40 to-purple-900/60 border-2 border-amber-400 rounded-2xl p-6 text-center">
              <div className="text-xs font-black uppercase tracking-widest text-amber-300 mb-1">
                Overall Band Score (Skor Keseluruhan)
              </div>
              <div className="text-5xl font-['Lilita_One',sans-serif] text-white my-2">
                {overallBand ? `Band ${overallBand}` : 'Lengkapi 4 Modul'}
              </div>
              <div className="text-xs text-amber-200">
                {overallBand
                  ? Number(overallBand) >= 7.0
                    ? 'Tingkat Kemahiran: Advanced / C1 (Sangat Fasih)'
                    : Number(overallBand) >= 5.5
                    ? 'Tingkat Kemahiran: Intermediate / B2 (Cukup Fasih)'
                    : 'Tingkat Kemahiran: Basic / A2-B1 (Dasar & Berkembang)'
                  : 'Selesaikan Listening, Reading, Writing, dan Speaking untuk melihat Overall Band'}
              </div>
            </div>

            {/* 4 Skill Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#17072a] p-4 rounded-2xl border border-cyan-400/30 text-center">
                <div className="text-xs text-cyan-300 font-bold">🎧 Listening</div>
                <div className="text-2xl font-black text-white mt-1">
                  {scores.L ? `Band ${scores.L}` : '-'}
                </div>
              </div>
              <div className="bg-[#17072a] p-4 rounded-2xl border border-emerald-400/30 text-center">
                <div className="text-xs text-emerald-300 font-bold">📖 Reading</div>
                <div className="text-2xl font-black text-white mt-1">
                  {scores.R ? `Band ${scores.R}` : '-'}
                </div>
              </div>
              <div className="bg-[#17072a] p-4 rounded-2xl border border-amber-400/30 text-center">
                <div className="text-xs text-amber-300 font-bold">✍️ Writing</div>
                <div className="text-2xl font-black text-white mt-1">
                  {scores.W ? `Band ${scores.W}` : '-'}
                </div>
              </div>
              <div className="bg-[#17072a] p-4 rounded-2xl border border-pink-400/30 text-center">
                <div className="text-xs text-pink-300 font-bold">🗣️ Speaking</div>
                <div className="text-2xl font-black text-white mt-1">
                  {scores.S ? `Band ${scores.S}` : '-'}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
