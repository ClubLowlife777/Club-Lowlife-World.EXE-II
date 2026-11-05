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
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.bgmMasterGain = this.ctx.createGain();
      this.bgmMasterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.bgmMasterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggleBgm() {
    this.init();
    this.isBgmPlaying = !this.isBgmPlaying;
    const icon = document.getElementById('bgmPlayIcon');
    if (this.isBgmPlaying) {
      if (icon) icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      this.startBgmLoop();
      State.showToast("BROADCASTING: 'DANCING'");
    } else {
      if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
      State.showToast("BROADCAST PAUSED");
    }
  },

  startBgmLoop() {
    if (!this.ctx) return;
    const intervalMs = (60 / this.bgmTempo / 4) * 1000;
    this.bgmTimer = setInterval(() => {
      this.playBgmStep();
      this.bgmStepIndex = (this.bgmStepIndex + 1) % 16;
    }, intervalMs);
  },

  playBgmStep() {
    if (!this.ctx || !this.isBgmPlaying) return;
    const now = this.ctx.currentTime;
    const bassFreq = this.noirBassNotes[this.bgmStepIndex];
    if (bassFreq > 0) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, now);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(g); g.connect(this.bgmMasterGain);
      osc.start(now); osc.stop(now + 0.35);
    }
  },

  setTrackBgm(version) {
    this.bgmVersion = version;
    const sel = document.getElementById('trackVersionSelect');
    if (sel) sel.value = version;
    this.bgmTempo = version === 'spedup' ? 150 : version === 'slowed' ? 104 : 130;
    if (this.isBgmPlaying) { clearInterval(this.bgmTimer); this.startBgmLoop(); }
  },

  playSfx(type) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.connect(g); g.connect(this.ctx.destination);

      if (type === 'coin') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(980, now); osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        g.gain.setValueAtTime(0.15, now); g.gain.linearRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
      } else if (type === 'laser') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
      } else if (type === 'slash') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(420, now); osc.frequency.linearRampToValueAtTime(140, now + 0.08);
        g.gain.setValueAtTime(0.25, now); g.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now); osc.stop(now + 0.08);
      } else if (type === 'jump') {
        osc.type = 'square'; osc.frequency.setValueAtTime(160, now); osc.frequency.linearRampToValueAtTime(380, now + 0.15);
        g.gain.setValueAtTime(0.15, now); g.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'stomp') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, now); osc.frequency.linearRampToValueAtTime(60, now + 0.1);
        g.gain.setValueAtTime(0.25, now); g.gain.linearRampToValueAtTime(0.001, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
      } else if (type === 'spin') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(700, now + 0.05);
        g.gain.setValueAtTime(0.1, now); g.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
      } else if (type === 'win') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.1); osc.frequency.setValueAtTime(783, now + 0.2);
        g.gain.setValueAtTime(0.25, now); g.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.start(now); osc.stop(now + 0.35);
      }
    } catch (e) {}
  }
};
