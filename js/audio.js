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
  // Original / Sped / Slow Bassline
  noirBassNotes: [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 110, 98, 98, 110, 130.81, 146.83, 130.81, 123.47, 98],
  // Unlocked Dystopian VIP Techno Acid Pattern (138 BPM Four-on-the-Floor)
  vipAcidBassNotes: [130.81, 261.63, 130.81, 196.00, 130.81, 293.66, 130.81, 146.83, 116.54, 233.08, 116.54, 174.61, 98.00, 196.00, 110.00, 220.00],

  async init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();

          this.bgmMasterGain = this.ctx.createGain();
          this.bgmMasterGain.gain.setValueAtTime(0.40, this.ctx.currentTime);
          this.bgmMasterGain.connect(this.ctx.destination);

          this.sfxMasterGain = this.ctx.createGain();
          this.sfxMasterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
          this.sfxMasterGain.connect(this.ctx.destination);
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  },

  async toggleBgm() {
    await this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isBgmPlaying = !this.isBgmPlaying;
    const icon = document.getElementById('bgmPlayIcon');

    if (this.isBgmPlaying) {
      if (icon) icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      this.startBgmLoop();
      if (window.State && typeof State.showToast === 'function') {
        State.showToast(this.bgmVersion === 'vip_techno' ? "BROADCASTING: 'DANCING (VIP TECHNO)' 🔊" : "BROADCASTING: 'DANCING'");
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
    const isVip = this.bgmVersion === 'vip_techno';
    const notesArray = isVip ? this.vipAcidBassNotes : this.noirBassNotes;
    const bassFreq = notesArray[this.bgmStepIndex];

    if (bassFreq > 0) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = isVip ? 'sawtooth' : 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, now);

      if (isVip) {
        // Acid Filter Envelope for VIP Stem
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.05);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);
        filter.Q.setValueAtTime(6, now);

        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.24, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(g);
      } else {
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.18, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(g);
      }

      g.connect(this.bgmMasterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isVip ? 0.24 : 0.30));

      // Industrial Rave Kick on beats 0, 4, 8, 12 in VIP mode
      if (isVip && this.bgmStepIndex % 4 === 0) {
        this.synthesizeKick(now);
      }
    }
  },

  synthesizeKick(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);

    g.gain.setValueAtTime(0.40, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(g);
    g.connect(this.bgmMasterGain || this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.16);
  },

  setTrackBgm(version) {
    this.bgmVersion = version;
    const sel = document.getElementById('trackVersionSelect');
    if (sel) sel.value = version;
    
    if (version === 'vip_techno') this.bgmTempo = 138;
    else if (version === 'spedup') this.bgmTempo = 150;
    else if (version === 'slowed') this.bgmTempo = 104;
    else this.bgmTempo = 130;

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
        const notes = [523.25, 659.25, 783.99];
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

window.AudioEngine = AudioEngine;

const unlockAudioOnGesture = () => {
  AudioEngine.init();
  window.removeEventListener('click', unlockAudioOnGesture);
  window.removeEventListener('keydown', unlockAudioOnGesture);
  window.removeEventListener('touchstart', unlockAudioOnGesture);
};
window.addEventListener('click', unlockAudioOnGesture);
window.addEventListener('keydown', unlockAudioOnGesture);
window.addEventListener('touchstart', unlockAudioOnGesture);
