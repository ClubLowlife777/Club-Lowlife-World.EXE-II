/**
 * CLUB LOWLIFE // PROCEDURAL WEB AUDIO SYNTHESIZER
 * File: js/audio.js
 * Engine: Web Audio API Procedural Synth & Stem Tempo Controller
 */

const AudioEngine = {
  ctx: null,
  isBgmPlaying: false,
  bgmMasterGain: null,
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
          this.bgmMasterGain = this.ctx.createGain();
          this.bgmMasterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
          this.bgmMasterGain.connect(this.ctx.destination);
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
      if (window.State && State.showToast) State.showToast("BROADCASTING: 'DANCING'");
    } else {
      if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
      if (window.State && State.showToast) State.showToast("BROADCAST PAUSED");
    }
  },

  startBgmLoop() {
    if (!this.ctx) return;
    clearInterval(this.bgmTimer);
    const intervalMs = (60 / this.bgmTempo / 4) * 1000;
    this.bgmTimer = setInterval(() => {
      this.playBgmStep();
      this.bgmStepIndex = (this.bgmStepIndex + 1) % 16;
    }, intervalMs);
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
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(g);
      g.connect(this.bgmMasterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  },

  setTrackBgm(version) {
    this.bgmVersion = version;
    const sel = document.getElementById('trackVersionSelect');
    if (sel) sel.value = version;
    this.bgmTempo = version === 'spedup' ? 150 : version === 'slowed' ? 104 : 130;
    
    // Auto-start playback if player clicked 'PLAY IN WORLD'
    if (!this.isBgmPlaying) {
      this.toggleBgm();
    } else {
      clearInterval(this.bgmTimer);
      this.startBgmLoop();
    }
  },

  playSfx(type) {
    // 1. Ensure AudioContext is instantiated and active
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
      g.connect(this.ctx.destination);

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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(783, now + 0.2);
        g.gain.setValueAtTime(0.25, now);
        g.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
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
