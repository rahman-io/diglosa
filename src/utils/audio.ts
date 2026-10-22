// Audio synthesis using Web Audio API and SpeechSynthesis (zero external audio files)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function beep(freq: number, duration = 0.12, type: OscillatorType = 'sine', volume = 0.07, delay = 0) {
  try {
    const ac = getAudioContext();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const t0 = ac.currentTime + delay;

    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ac.destination);

    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch (e) {
    // Audio context may be blocked before interaction
  }
}

export function noise(duration = 0.15, volume = 0.08, delay = 0) {
  try {
    const ac = getAudioContext();
    if (!ac) return;
    const sampleRate = ac.sampleRate;
    const bufferSize = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = ac.createBuffer(1, bufferSize, sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      channel[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const src = ac.createBufferSource();
    const gain = ac.createGain();
    const t0 = ac.currentTime + delay;

    src.buffer = buffer;
    src.connect(gain);
    gain.connect(ac.destination);

    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.start(t0);
  } catch (e) {
    // ignore
  }
}

export const sfx = {
  tick: () => beep(980, 0.018, 'square', 0.012),
  fanfare: () => {
    [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.16, 'triangle', 0.07, i * 0.09));
    [784, 988, 1175, 1568].forEach((f, i) => beep(f, 0.24, 'triangle', 0.07, 0.45 + i * 0.1));
    noise(0.25, 0.05, 0.45);
  },
  lose: () => [330, 294, 262, 196].forEach((f, i) => beep(f, 0.24, 'sawtooth', 0.05, i * 0.17)),
  shoot: () => {
    beep(640, 0.06, 'square', 0.035);
    beep(330, 0.1, 'sawtooth', 0.03, 0.04);
  },
  hit: () => {
    noise(0.1, 0.08);
    beep(210, 0.08, 'square', 0.045);
  },
  boom: () => {
    noise(0.38, 0.13);
    beep(95, 0.32, 'sawtooth', 0.08);
    beep(60, 0.4, 'square', 0.05, 0.05);
  },
  hurt: () => {
    beep(160, 0.2, 'sawtooth', 0.07);
    noise(0.1, 0.06);
  },
  pick: () => {
    beep(880, 0.07, 'triangle', 0.06);
    beep(1320, 0.1, 'triangle', 0.06, 0.06);
  },
  door: () => {
    beep(330, 0.12, 'triangle', 0.06);
    beep(495, 0.12, 'triangle', 0.06, 0.1);
    beep(660, 0.2, 'triangle', 0.06, 0.2);
  },
  boss: () => {
    beep(110, 0.5, 'sawtooth', 0.09);
    beep(82, 0.7, 'square', 0.07, 0.15);
    noise(0.6, 0.08, 0.1);
  },
  ok: () => {
    beep(660, 0.1, 'triangle', 0.07);
    beep(990, 0.16, 'triangle', 0.07, 0.09);
  },
  no: () => beep(190, 0.24, 'sawtooth', 0.04),
  win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.2, 'triangle', 0.07, i * 0.1)),
  flip: () => beep(440, 0.05, 'square', 0.025),
};

export function speakEnglish(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Ignore speech errors
  }
}
