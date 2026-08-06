// High-reliability Audio and Vibration Engine for Mobile & Desktop Notifications

let audioCtx: AudioContext | null = null;
let isUnlocked = false;

// Generate a clean Telegram/WhatsApp style two-tone chime as Base64 WAV
function generateChimeWav(): string {
  const sampleRate = 22050;
  const duration = 0.4;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Synthesize pleasant two-tone chime (880Hz -> 1320Hz harmonic chime)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (t < 0.15) {
      // First high chime tone (880 Hz with quick decay)
      const env = Math.exp(-t * 18);
      sample = Math.sin(2 * Math.PI * 880 * t) * env;
    } else {
      // Second bright chime tone (1320 Hz)
      const t2 = t - 0.15;
      const env = Math.exp(-t2 * 14);
      sample = Math.sin(2 * Math.PI * 1320 * t2) * env;
    }

    // Clamp and convert to 16-bit integer
    const intSample = Math.max(-1, Math.min(1, sample)) * 32767;
    view.setInt16(44 + i * 2, intSample, true);
  }

  // Convert binary to base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

let cachedAudioElement: HTMLAudioElement | null = null;

export const initAudioUnlock = () => {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!cachedAudioElement) {
        cachedAudioElement = new Audio(generateChimeWav());
        cachedAudioElement.volume = 1.0;
      }
      isUnlocked = true;
    } catch (err) {
      console.warn('Audio unlock warning:', err);
    }
  };

  window.addEventListener('click', unlock, { once: false, passive: true });
  window.addEventListener('touchstart', unlock, { once: false, passive: true });
  window.addEventListener('keydown', unlock, { once: false, passive: true });
};

// Initialize unlock listeners
if (typeof window !== 'undefined') {
  initAudioUnlock();
}

export const playNotificationSound = () => {
  try {
    // 1. Trigger Mobile Haptic Vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 300]);
      } catch (_) {}
    }

    // 2. Play via HTML Audio Element (works great in background and mobile)
    try {
      if (!cachedAudioElement) {
        cachedAudioElement = new Audio(generateChimeWav());
      }
      cachedAudioElement.currentTime = 0;
      cachedAudioElement.volume = 1.0;
      const playPromise = cachedAudioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('HTMLAudio autoplay prevented, falling back to WebAudio oscillator:', err);
        });
      }
    } catch (e) {
      console.warn('HTMLAudio error:', e);
    }

    // 3. Play via Web Audio Oscillator as robust fallback
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';

      // First beep: 880Hz
      oscillator.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.8, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      // Second beep: 1320Hz
      oscillator.frequency.setValueAtTime(1320, now + 0.15);
      gainNode.gain.setValueAtTime(0.8, now + 0.16);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      oscillator.start(now);
      oscillator.stop(now + 0.38);
    } catch (err) {
      console.warn('WebAudio playback failed', err);
    }
  } catch (error) {
    console.warn('Notification sound failed', error);
  }
};
