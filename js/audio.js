/**
 * CLUB LOWLIFE // PROCEDURAL WEB AUDIO SYNTHESIZER
 * File: js/audio.js
 * Engine: Web Audio API Procedural Synth & Stem Tempo Controller
 */

const AudioEngine = {
  ctx: null,
  isBgmPlaying: false,
  bgmMasterGain: null,
  sfxMasterGain: null,
  bgmStepIndex: 0,
  bgmTimer: null,
  bgmTempo: 130,
  bgmVersion: 'original',
  noirBassNotes: [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 110, 98, 98, 110, 130.81, 146.83, 130.81, 123.47, 98],

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          
          // Master Gain Bus for Music
          this.bgmMasterGain = this.ctx.createGain();
          this.bgmMasterGain.gain.setValueAtTime(0.40, this.ctx.currentTime);
          this.bgmMasterGain.connect(this.ctx.destination);

          // Master Gain Bus for Sound Effects
          this.sfxMasterGain = this.ctx.createGain();
          this.sfxMasterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
          this.sfxMasterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  },

  toggleBgm() {
    this.init();
    if (!this.ctx) return;

    this.isBgmPlaying = !this.isBgmPlaying;
    const icon = document.getElementById('bgmPlayIcon');
    if (this.isBgmPlaying) {
      if (icon) icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      this.startBgmLoop();
      if (window.State && typeof State.showToast === 'function') {
        State.showToast("BROADCASTING: 'DANCING'");
      }
    } else {
      if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
      if (window.State && typeof State.showToast === 'function') {
        State.showToast("BROADCAST PAUSED");
      }
    }
  },

  startBgmLoop() {
    if (!this.ctx) return;
    if (this.bgmTimer) clearInterval(this.bgmTimer);

    const stepIntervalMs = (60 / this.bgmTempo / 4) * 1000;
    this.bgmTimer = setInterval(() => {
      this.playBgmStep();
      this.bgmStepIndex = (this.bgmStepIndex + 1) % 16;
    }, stepIntervalMs);
  },

  playBgmStep() {
    if (!this.ctx || !this.isBgmPlaying) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
      return;
    }

    const now = this.ctx.currentTime;
    const bassFreq = this.noirBassNotes[this.bgmStepIndex];
    if (bassFreq > 0) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, now);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(g);
      g.connect(this.bgmMasterGain);

      osc.start(now);
      osc.stop(now + 0.30);
    }
  },

  setTrackBgm(version) {
    this.bgmVersion = version;
    const sel = document.getElementById('trackVersionSelect');
    if (sel) sel.value = version;
    this.bgmTempo = version === 'spedup' ? 150 : version === 'slowed' ? 104 : 130;

    if (!this.isBgmPlaying) {
      this.toggleBgm();
    } else {
      if (this.bgmTimer) clearInterval(this.bgmTimer);
      this.startBgmLoop();
    }
  },

  playSfx(type) {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.connect(g);
      g.connect(this.sfxMasterGain || this.ctx.destination);

      if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        g.gain.setValueAtTime(0.15, now);
        g.gain.linearRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'slash') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.08);
        g.gain.setValueAtTime(0.25, now);
        g.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(380, now + 0.15);
        g.gain.setValueAtTime(0.15, now);
        g.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'stomp') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.1);
        g.gain.setValueAtTime(0.25, now);
        g.gain.linearRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'spin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.05);
        g.gain.setValueAtTime(0.1, now);
        g.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'win') {
        // Multi-frequency celebratory chime
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          const chordOsc = this.ctx.createOscillator();
          const chordGain = this.ctx.createGain();
          const noteTime = now + (idx * 0.08);

          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(freq, noteTime);

          chordGain.gain.setValueAtTime(0.18, noteTime);
          chordGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

          chordOsc.connect(chordGain);
          chordGain.connect(this.sfxMasterGain || this.ctx.destination);

          chordOsc.start(noteTime);
          chordOsc.stop(noteTime + 0.26);
        });
      }
    } catch (e) {
      console.warn("SFX synthesis error:", e);
    }
  }
};

// Global user-gesture audio unlocker
const unlockAudioOnGesture = () => {
  AudioEngine.init();
  window.removeEventListener('click', unlockAudioOnGesture);
  window.removeEventListener('keydown', unlockAudioOnGesture);
  window.removeEventListener('touchstart', unlockAudioOnGesture);
};
window.addEventListener('click', unlockAudioOnGesture);
window.addEventListener('keydown', unlockAudioOnGesture);
window.addEventListener('touchstart', unlockAudioOnGesture);
