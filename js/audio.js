/**
 * CLUB LOWLIFE // 8-BIT ARCADE AUDIO ENGINE & OFFICIAL "DANCING" 128-STEP MIDI SEQUENCER
 * File: js/audio.js
 * Engine: Hybrid HTML5 8-Bit Remastered Audio + Web Audio API 6-Channel Chiptune Synth & AnalyserNode
 */

const AudioEngine = {
  ctx: null,
  isBgmPlaying: false,
  bgmMasterGain: null,
  sfxMasterGain: null,
  analyser: null,
  freqData: null,
  bgmAudioEl: null,
  bgmStepIndex: 0, // 0..127 (8-bar 16th-note loop from official DANCING MIDI stems)
  bgmTimer: null,
  bgmTempo: 130,
  bgmVersion: 'dancing_master',
  lowPassFilter: null,
  subBoostFilter: null,
  studioMix: {
    subBoost: false,
    clubDoorFilter: false,
    chiptuneBoost: false,
    spatialAuto: false
  },

  // Track Catalog: 8-Bit Masters (Punchy Club Mix) + Authentic NES Chiptune Versions
  TRACK_CATALOG: {
    dancing_master: { title: '"DANCING" (8-BIT MASTER)',      src: 'assets/audio/dancing_8bit_master.m4a',      tempo: 130, rate: 1.0, synthMix: 0.15 },
    dancing_nes:    { title: '"DANCING" (NES VERSION)',       src: 'assets/audio/dancing_nes.m4a',              tempo: 130, rate: 1.0, synthMix: 0.25 },
    dancing_synth:  { title: '"DANCING" (PURE NES SYNTH)',    src: null,                                        tempo: 130, rate: 1.0, synthMix: 1.00 },

    t777_master:    { title: '"777 HIGHS" (8-BIT MASTER)',     src: 'assets/audio/777_8bit_master.m4a',          tempo: 136, rate: 1.0, synthMix: 0.15 },
    t777_nes:       { title: '"777 HIGHS" (NES VERSION)',      src: 'assets/audio/777_nes.m4a',                  tempo: 136, rate: 1.0, synthMix: 0.25 },

    martian_master: { title: '"MARTIAN UNIV" (8-BIT MASTER)',  src: 'assets/audio/martian_uni_8bit_master.m4a',  tempo: 140, rate: 1.0, synthMix: 0.15 },
    martian_nes:    { title: '"MARTIAN UNIV" (NES VERSION)',   src: 'assets/audio/martian_uni_nes.m4a',          tempo: 140, rate: 1.0, synthMix: 0.25 },

    hold_master:    { title: '"HOLD ME DOWN" (8-BIT MASTER)',  src: 'assets/audio/hold_me_down_8bit_master.m4a', tempo: 139, rate: 1.0, synthMix: 0.15 },
    hold_nes:       { title: '"HOLD ME DOWN" (NES VERSION)',   src: 'assets/audio/hold_me_down_nes.m4a',         tempo: 139, rate: 1.0, synthMix: 0.25 },

    mobb_master:    { title: '"MOBB" (8-BIT MASTER)',          src: 'assets/audio/mobb_8bit_master.m4a',         tempo: 140, rate: 1.0, synthMix: 0.15 },
    mobb_nes:       { title: '"MOBB" (NES VERSION)',           src: 'assets/audio/mobb_nes.m4a',                 tempo: 140, rate: 1.0, synthMix: 0.25 },

    galaga_master:  { title: '"GALAGA" (8-BIT MASTER)',        src: 'assets/audio/galaga_8bit_master.m4a',       tempo: 142, rate: 1.0, synthMix: 0.15 },
    galaga_nes:     { title: '"GALAGA" (NES VERSION)',         src: 'assets/audio/galaga_nes.m4a',               tempo: 142, rate: 1.0, synthMix: 0.25 },

    geeked_master:  { title: '"GEEKED" (8-BIT MASTER)',        src: 'assets/audio/geeked_8bit_master.m4a',       tempo: 148, rate: 1.0, synthMix: 0.15 },
    geeked_nes:     { title: '"GEEKED" (NES VERSION)',         src: 'assets/audio/geeked_nes.m4a',               tempo: 148, rate: 1.0, synthMix: 0.25 },

    vip_techno:     { title: '"DANCING" (138 BPM VIP TECHNO)', src: 'assets/audio/dancing_8bit_master.m4a',      tempo: 138, rate: 1.06, synthMix: 0.36 }
  },

  // =========================================================================
  // OFFICIAL "DANCING" 128-STEP MIDI DATA (EXTRACTED FROM DANCING SOUND KIT)
  // =========================================================================
  // LEAD.mid: [startStep, durationSteps, midiNote]
  DANCING_LEAD_MIDI: [
    [0, 8, 83], [6, 8, 76], [12, 12, 83], [22, 4, 79], [24, 4, 86], [26, 4, 83], [28, 4, 79], [30, 4, 81],
    [32, 8, 83], [38, 8, 88], [44, 12, 83], [54, 4, 79], [56, 4, 86], [58, 4, 83], [60, 6, 79],
    [64, 8, 83], [70, 8, 76], [76, 12, 83], [86, 4, 79], [88, 4, 86], [90, 4, 83], [92, 4, 79], [94, 4, 81],
    [96, 8, 83], [102, 8, 88], [108, 12, 83], [118, 4, 79], [120, 4, 86], [122, 4, 83], [124, 4, 79]
  ],

  // DROP BASS #1.mid + DROP BASS #2.mid: [startStep, durationSteps, midiNote]
  DANCING_BASS_MIDI: [
    [0, 10, 48], [10, 2, 48], [14, 2, 60], [16, 10, 48], [26, 2, 48], [30, 2, 55],
    [32, 2, 40], [34, 2, 40], [38, 2, 52], [42, 2, 52], [44, 1, 52], [45, 1, 52], [46, 1, 52],
    [48, 2, 43], [50, 2, 43], [54, 2, 52], [58, 2, 52], [60, 4, 55],
    [64, 10, 48], [74, 2, 48], [78, 2, 60], [80, 10, 48], [90, 2, 48], [92, 2, 43], [94, 2, 55],
    [96, 2, 40], [98, 2, 40], [102, 2, 52], [106, 2, 52], [108, 1, 52], [109, 1, 52],
    [112, 2, 43], [114, 4, 43], [118, 2, 52], [122, 2, 52], [124, 2, 55], [126, 2, 57]
  ],

  // MAIN PROGRESSION.mid: Syncopated 9th Chord Stabs (Cmaj9 -> Em9 -> Gmaj9)
  DANCING_CHORD_STEPS: {
    0: [60, 64, 67, 71, 74], 3: [60, 64, 67, 71, 74], 6: [60, 64, 67, 71, 74], 10: [60, 64, 67, 71, 74],
    16: [60, 64, 67, 71, 74], 19: [60, 64, 67, 71, 74], 22: [60, 64, 67, 71, 74], 26: [60, 64, 67, 71, 74], 30: [59, 64, 67, 71, 74],
    32: [52, 64, 67, 71, 74], 35: [52, 64, 67, 71, 74], 38: [52, 64, 67, 71, 74], 42: [52, 64, 67, 71, 74], 46: [59, 64, 67, 71, 74],
    48: [55, 64, 67, 71, 74], 51: [55, 64, 67, 71, 74], 54: [55, 64, 67, 71, 74], 58: [55, 64, 67, 71, 74], 62: [57, 64, 67, 71, 74],
    64: [60, 64, 67, 71, 74], 67: [60, 64, 67, 71, 74], 70: [60, 64, 67, 71, 74], 74: [60, 64, 67, 71, 74],
    80: [60, 64, 67, 71, 74], 83: [60, 64, 67, 71, 74], 86: [60, 64, 67, 71, 74], 90: [60, 64, 67, 71, 74], 94: [59, 64, 67, 71, 74],
    96: [52, 64, 67, 71, 74], 99: [52, 64, 67, 71, 74], 102: [52, 64, 67, 71, 74], 106: [52, 64, 67, 71, 74], 110: [59, 64, 67, 71, 74],
    112: [55, 64, 67, 71, 74], 115: [55, 64, 67, 71, 74], 118: [55, 64, 67, 71, 74], 122: [55, 64, 67, 71, 74], 126: [57, 64, 67, 71, 74]
  },

  // CLAV.mid Steps (16-step pattern repeating across 128 steps, pitching 60 -> 57 on bars 3-4)
  DANCING_CLAV_MOD16: [0, 2, 4, 5, 7, 9, 10, 13],

  // TOM.mid Steps: { step: midiNote }
  DANCING_TOM_STEPS: { 28: 62, 56: 64, 58: 62, 62: 57, 92: 62, 120: 64, 122: 62, 126: 57 },

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  },

  async init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();

          this.analyser = this.ctx.createAnalyser();
          this.analyser.fftSize = 64;
          this.analyser.smoothingTimeConstant = 0.72;
          this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

          this.subBoostFilter = this.ctx.createBiquadFilter();
          this.subBoostFilter.type = 'lowshelf';
          this.subBoostFilter.frequency.setValueAtTime(105, this.ctx.currentTime);
          this.subBoostFilter.gain.setValueAtTime(0, this.ctx.currentTime);

          this.lowPassFilter = this.ctx.createBiquadFilter();
          this.lowPassFilter.type = 'lowpass';
          this.lowPassFilter.frequency.setValueAtTime(18000, this.ctx.currentTime);

          this.bgmMasterGain = this.ctx.createGain();
          this.bgmMasterGain.gain.setValueAtTime(0.36, this.ctx.currentTime);
          this.bgmMasterGain.connect(this.subBoostFilter);
          this.subBoostFilter.connect(this.lowPassFilter);
          this.lowPassFilter.connect(this.analyser);
          this.analyser.connect(this.ctx.destination);

          this.sfxMasterGain = this.ctx.createGain();
          this.sfxMasterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
          this.sfxMasterGain.connect(this.ctx.destination);
        }
      }

      if (!this.bgmAudioEl) {
        this.bgmAudioEl = new Audio();
        this.bgmAudioEl.loop = true;
        this.bgmAudioEl.volume = 0.84;
        this.bgmAudioEl.preload = 'auto';
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  },

  // Real-Time Web Audio AnalyserNode Telemetry for Reactive World Assets & Beat-Sync Combat
  getAudioTelemetry() {
    const defaultBins = new Array(16).fill(0);
    if (!this.isBgmPlaying || !this.analyser || !this.freqData) {
      return {
        active: false,
        subEnergy: 0,
        midHighEnergy: 0,
        bins: defaultBins,
        isVip: this.bgmVersion === 'vip_techno',
        onBeat: false
      };
    }

    this.analyser.getByteFrequencyData(this.freqData);

    const subRaw = (this.freqData[0] + this.freqData[1] + this.freqData[2]) / (3 * 255);
    let midSum = 0;
    for (let i = 3; i <= 10; i++) midSum += (this.freqData[i] || 0);
    const midHighRaw = midSum / (8 * 255);

    const bins = [];
    for (let b = 0; b < 16; b++) {
      bins.push((this.freqData[b] || 0) / 255);
    }

    const isVip = this.bgmVersion === 'vip_techno';
    const onBeat = (this.bgmStepIndex % 4 === 0) || subRaw > 0.42;

    return {
      active: true,
      subEnergy: Math.min(1, subRaw * 1.55),
      midHighEnergy: Math.min(1, midHighRaw * 1.65),
      bins,
      isVip,
      onBeat
    };
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
      const cfg = this.TRACK_CATALOG[this.bgmVersion] || this.TRACK_CATALOG.dancing_master;
      if (window.State && typeof State.showToast === 'function') {
        State.showToast(`BROADCASTING: ${cfg.title} 🔊`);
      }
    } else {
      if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
      if (this.bgmAudioEl) {
        this.bgmAudioEl.pause();
      }
      if (window.State && typeof State.showToast === 'function') {
        State.showToast("BROADCAST PAUSED");
      }
    }
  },

  startBgmLoop() {
    if (!this.ctx) return;
    if (this.bgmTimer) clearInterval(this.bgmTimer);

    const cfg = this.TRACK_CATALOG[this.bgmVersion] || this.TRACK_CATALOG.dancing_master;
    this.bgmTempo = cfg.tempo || 130;

    // Update HUD Track Label
    const trackLabel = document.getElementById('activeTrackName');
    if (trackLabel) trackLabel.innerText = cfg.title;

    // Start 8-Bit Remastered Audio Track if available
    if (this.bgmAudioEl) {
      if (cfg.src) {
        const currentSrc = this.bgmAudioEl.getAttribute('data-src');
        if (currentSrc !== cfg.src) {
          this.bgmAudioEl.src = cfg.src;
          this.bgmAudioEl.setAttribute('data-src', cfg.src);
          this.bgmAudioEl.currentTime = 0;
        }
        this.bgmAudioEl.playbackRate = cfg.rate || 1.0;
        this.bgmAudioEl.volume = 0.85;
        this.bgmAudioEl.play().catch(() => {
          // If audio file isn't loaded yet, 8-bit MIDI synth carries the full mix
        });
      } else {
        this.bgmAudioEl.pause();
      }
    }

    // Adjust Web Audio 8-Bit Chiptune Synth Layer Gain (0.28 when layered with master, 0.45 in Pure 8-Bit mode)
    if (this.bgmMasterGain && this.ctx) {
      const targetGain = cfg.src ? (cfg.synthMix || 0.25) : 0.44;
      this.bgmMasterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }

    const stepIntervalMs = (60 / this.bgmTempo / 4) * 1000;
    this.bgmTimer = setInterval(() => {
      this.playBgmStep();
      this.bgmStepIndex = (this.bgmStepIndex + 1) % 128;
    }, stepIntervalMs);
  },

  // =========================================================================
  // 6-CHANNEL 8-BIT CHIPTUNE SYNTHESIZER (OFFICIAL "DANCING" MIDI ARRANGEMENT)
  // =========================================================================
  playBgmStep() {
    if (!this.ctx || !this.isBgmPlaying) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
      return;
    }

    const now = this.ctx.currentTime;
    const step = this.bgmStepIndex; // 0..127
    const stepDurSec = 60 / this.bgmTempo / 4;
    const isVip = this.bgmVersion === 'vip_techno';
    const dest = this.bgmMasterGain || this.ctx.destination;

    // 1. CHANNEL 01: SUB-100HZ MONO BASS + 8-BIT SQUARE HARMONIC (DROP BASS #1 & #2)
    const bassNoteEvt = this.DANCING_BASS_MIDI.find(n => n[0] === step);
    if (bassNoteEvt) {
      const [, durSteps, midi] = bassNoteEvt;
      const freq = this.midiToFreq(midi);
      const noteLen = Math.max(0.08, durSteps * stepDurSec * 0.9);

      // Pure Mono Sub-Bass (<100Hz Dossier Spec)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq * 0.5, now);
      subGain.gain.setValueAtTime(0.28, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + noteLen);
      subOsc.connect(subGain);
      subGain.connect(dest);
      subOsc.start(now);
      subOsc.stop(now + noteLen + 0.01);

      // 8-Bit Chiptune Square/Saw Bass Layer
      const chipBass = this.ctx.createOscillator();
      const chipFilter = this.ctx.createBiquadFilter();
      const chipGain = this.ctx.createGain();
      chipBass.type = isVip ? 'sawtooth' : 'square';
      chipBass.frequency.setValueAtTime(freq, now);

      chipFilter.type = 'lowpass';
      chipFilter.frequency.setValueAtTime(isVip ? 2400 : 1250, now);
      chipFilter.frequency.exponentialRampToValueAtTime(320, now + Math.min(0.22, noteLen));
      chipFilter.Q.setValueAtTime(isVip ? 5.5 : 2.5, now);

      chipGain.gain.setValueAtTime(0.14, now);
      chipGain.gain.exponentialRampToValueAtTime(0.001, now + noteLen);

      chipBass.connect(chipFilter);
      chipFilter.connect(chipGain);
      chipGain.connect(dest);
      chipBass.start(now);
      chipBass.stop(now + noteLen + 0.01);
    }

    // 2. CHANNEL 02: 8-BIT NES SQUARE LEAD MELODY (LEAD.mid)
    const leadEvt = this.DANCING_LEAD_MIDI.find(n => n[0] === step);
    if (leadEvt) {
      const [, durSteps, midi] = leadEvt;
      const freq = this.midiToFreq(midi);
      const noteLen = Math.max(0.10, durSteps * stepDurSec * 0.88);

      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'square';
      leadOsc.frequency.setValueAtTime(freq, now);
      // Subtle 8-bit chiptune pitch slide / vibrato
      leadOsc.frequency.setValueAtTime(freq * 1.006, now + noteLen * 0.5);
      leadOsc.frequency.setValueAtTime(freq, now + noteLen * 0.75);

      leadGain.gain.setValueAtTime(0.001, now);
      leadGain.gain.linearRampToValueAtTime(0.095, now + 0.012);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + noteLen);

      leadOsc.connect(leadGain);
      leadGain.connect(dest);
      leadOsc.start(now);
      leadOsc.stop(now + noteLen + 0.01);
    }

    // 3. CHANNEL 03: MAIN PROGRESSION 8-BIT CHORD ARPEGGIO STABS (MAIN PROGRESSION.mid)
    const chordNotes = this.DANCING_CHORD_STEPS[step];
    if (chordNotes) {
      // Classic 8-bit fast chord arpeggio + warm triangle pad stab
      chordNotes.forEach((midi, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'square';
        const arpOffset = idx * 0.014; // Fast 8-bit chiptune arpeggio roll!
        osc.frequency.setValueAtTime(this.midiToFreq(midi), now + arpOffset);

        g.gain.setValueAtTime(0.032, now + arpOffset);
        g.gain.exponentialRampToValueAtTime(0.001, now + arpOffset + stepDurSec * 1.8);

        osc.connect(g);
        g.connect(dest);
        osc.start(now + arpOffset);
        osc.stop(now + arpOffset + stepDurSec * 1.9);
      });
    }

    // 4. CHANNEL 04: 8-BIT PULSE CLAVINET (CLAV.mid)
    if (this.DANCING_CLAV_MOD16.includes(step % 16)) {
      const clavMidi = (step >= 32 && step < 64) || (step >= 96) ? 69 : 72; // A4 / C5
      const clavOsc = this.ctx.createOscillator();
      const clavGain = this.ctx.createGain();
      clavOsc.type = 'square';
      clavOsc.frequency.setValueAtTime(this.midiToFreq(clavMidi), now);
      clavGain.gain.setValueAtTime(0.035, now);
      clavGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      clavOsc.connect(clavGain);
      clavGain.connect(dest);
      clavOsc.start(now);
      clavOsc.stop(now + 0.06);
    }

    // 5. CHANNEL 05: DRUM KIT (4-ON-THE-FLOOR KICK, MAIN SNARE, OPEN HAT & TOM FILLS)
    // Four-on-the-floor Club Kick on steps 0, 4, 8, 12...
    if (step % 4 === 0) {
      this.synthesizeKick(now);
    }
    // MAIN SNARE on beats 2 & 4 (steps 4, 12, 20, 28...)
    if (step % 8 === 4) {
      this.synthesize8BitSnare(now, step % 16 === 12);
    }
    // OPEN HAT on off-beats (steps 2, 6, 10, 14...)
    if (step % 4 === 2) {
      this.synthesize8BitHat(now);
    }
    // TOM.mid Fills
    if (this.DANCING_TOM_STEPS[step]) {
      const tomFreq = this.midiToFreq(this.DANCING_TOM_STEPS[step] - 12);
      const tomOsc = this.ctx.createOscillator();
      const tomG = this.ctx.createGain();
      tomOsc.type = 'triangle';
      tomOsc.frequency.setValueAtTime(tomFreq * 1.4, now);
      tomOsc.frequency.exponentialRampToValueAtTime(tomFreq * 0.7, now + 0.11);
      tomG.gain.setValueAtTime(0.16, now);
      tomG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      tomOsc.connect(tomG);
      tomG.connect(dest);
      tomOsc.start(now);
      tomOsc.stop(now + 0.13);
    }
  },

  synthesizeKick(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);

    g.gain.setValueAtTime(0.38, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(g);
    g.connect(this.bgmMasterGain || this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.16);
  },

  synthesize8BitSnare(time, isLayered = false) {
    if (!this.ctx) return;
    const dest = this.bgmMasterGain || this.ctx.destination;
    // 8-Bit Tone Body
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isLayered ? 240 : 200, time);
    osc.frequency.exponentialRampToValueAtTime(95, time + 0.07);
    g.gain.setValueAtTime(0.16, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(g);
    g.connect(dest);
    osc.start(time);
    osc.stop(time + 0.09);
  },

  synthesize8BitHat(time) {
    if (!this.ctx) return;
    const dest = this.bgmMasterGain || this.ctx.destination;
    // High-frequency metallic 8-bit pulse hat
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(3800, time);
    osc.frequency.exponentialRampToValueAtTime(6200, time + 0.04);
    g.gain.setValueAtTime(0.035, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
    osc.connect(g);
    g.connect(dest);
    osc.start(time);
    osc.stop(time + 0.05);
  },

  toggleStudioEffect(key) {
    if (!this.ctx) this.init();
    if (!this.studioMix.hasOwnProperty(key)) return;
    this.studioMix[key] = !this.studioMix[key];
    this.applyStudioMixState();

    const labels = {
      subBoost: this.studioMix.subBoost ? '808 SUB-BASS BOOST (+8dB <105Hz): ON 🔊' : '808 SUB-BASS BOOST: FLAT',
      clubDoorFilter: this.studioMix.clubDoorFilter ? 'HALLWAY MUFFLE FILTER (950Hz LPF): ON 🚪' : 'HALLWAY FILTER: FULL CLARITY',
      chiptuneBoost: this.studioMix.chiptuneBoost ? '6-CH MIDI SYNTH OVERLAY BOOST: ON 🎹' : '6-CH MIDI SYNTH OVERLAY: STANDARD',
      spatialAuto: this.studioMix.spatialAuto ? 'SPATIAL CLUB ACOUSTICS: AUTO ON 🎧' : 'SPATIAL CLUB ACOUSTICS: OFF'
    };
    if (window.State && typeof State.showToast === 'function' && labels[key]) {
      State.showToast(labels[key]);
    }
    if (window.State && typeof State.renderStudioMixerButtons === 'function') {
      State.renderStudioMixerButtons();
    }
  },

  applyStudioMixState() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const cfg = this.TRACK_CATALOG[this.bgmVersion] || this.TRACK_CATALOG.dancing_master;

    if (this.subBoostFilter) {
      this.subBoostFilter.gain.setValueAtTime(this.studioMix.subBoost ? 8.5 : 0, now);
    }

    let cutoff = this.studioMix.clubDoorFilter ? 920 : 18000;
    let audioVol = this.studioMix.clubDoorFilter ? 0.56 : 0.85;

    if (this.studioMix.spatialAuto && window.State && State.currentDimension === 'retrocade' && window.Entities && Entities.player) {
      const px = Entities.player.x;
      const py = Entities.player.y;
      const onDanceFloor = px > 900 && px < 1500 && py > 200 && py < 820;
      if (!onDanceFloor) {
        cutoff = Math.min(cutoff, 1150);
        audioVol = 0.62;
      } else {
        cutoff = 18000;
        audioVol = 0.92;
      }
    }

    if (this.lowPassFilter) {
      this.lowPassFilter.frequency.setValueAtTime(cutoff, now);
    }
    if (this.bgmAudioEl) {
      this.bgmAudioEl.volume = audioVol;
    }
    if (this.bgmMasterGain) {
      const baseGain = cfg.src ? (cfg.synthMix || 0.20) : 0.44;
      const targetGain = this.studioMix.chiptuneBoost ? Math.min(0.55, baseGain + 0.22) : baseGain;
      this.bgmMasterGain.gain.setValueAtTime(targetGain, now);
    }
  },

  setTrackBgm(version) {
    this.bgmVersion = this.TRACK_CATALOG[version] ? version : 'dancing_master';
    const sel = document.getElementById('trackVersionSelect');
    if (sel) sel.value = this.bgmVersion;

    const cfg = this.TRACK_CATALOG[this.bgmVersion];
    this.bgmTempo = cfg ? cfg.tempo : 130;

    if (window.State && typeof State.recordDailyAction === 'function') {
      State.recordDailyAction('music_switch', 1);
    }

    if (!this.isBgmPlaying) {
      this.toggleBgm();
    } else {
      this.startBgmLoop();
      this.applyStudioMixState();
      if (window.State && typeof State.showToast === 'function' && cfg) {
        State.showToast(`SWITCHED TRACK: ${cfg.title} 💿`);
      }
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
      } else if (type === 'deflect') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1320, now);
        osc.frequency.exponentialRampToValueAtTime(2640, now + 0.09);
        g.gain.setValueAtTime(0.28, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'dash') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.11);
        g.gain.setValueAtTime(0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'beat_crit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12);
        g.gain.setValueAtTime(0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'boss_warn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(340, now + 0.18);
        g.gain.setValueAtTime(0.16, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
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
