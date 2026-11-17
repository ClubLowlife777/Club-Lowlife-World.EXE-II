/**
 * CLUB LOWLIFE // UNIVERSE RENDER & MAIN ENGINE LOOP
 * File: js/main.js
 * Engine: Vanilla HTML5 Canvas + Web Audio API (Rev 5.00)
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const camera = {
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  zoom: 1.0,
  zoomPreset: 'wide', // 'far' | 'wide' | 'normal' | 'close'
  customZoom: null,
  radarExpanded: false,
  radarBounds: null,
  zoomBtnBounds: null,
  mapBtnBounds: null,

  cycleZoomPreset() {
    this.customZoom = null;
    const order = ['wide', 'far', 'normal', 'close'];
    const idx = order.indexOf(this.zoomPreset);
    this.zoomPreset = order[(idx + 1) % order.length];
    const labels = {
      wide: 'WIDE FIELD OF VIEW (DEFAULT)',
      far: 'TACTICAL FAR VIEW (MAX VISIBILITY)',
      normal: 'BALANCED MID VIEW',
      close: 'CLASSIC CLOSE-UP (1:1)'
    };
    if (window.State && typeof State.showToast === 'function') {
      State.showToast(`CAMERA ZOOM: ${labels[this.zoomPreset]} 🔍`);
    }
  },

  toggleRadarExpanded() {
    this.radarExpanded = !this.radarExpanded;
    if (window.State && typeof State.showToast === 'function') {
      State.showToast(this.radarExpanded ? 'TACTICAL MAP: EXPANDED VIEW 🗺️' : 'TACTICAL MAP: COMPACT VIEW 🗺️');
    }
  }
};
window.camera = camera;

function getEffectiveCameraZoom() {
  if (camera.customZoom !== null) {
    return Math.max(0.40, Math.min(1.15, camera.customZoom));
  }
  const shortSide = Math.min(canvas.width || 800, canvas.height || 600);
  const isMobile = shortSide < 680 || canvas.width < 768;

  if (isMobile) {
    // Mobile zoom presets ensure wide visibility around the character so enemies never blindside from off-screen
    const mobilePresets = {
      far: 0.44,
      wide: 0.56,
      normal: 0.72,
      close: 0.90
    };
    return mobilePresets[camera.zoomPreset] || 0.56;
  } else {
    const desktopPresets = {
      far: 0.62,
      wide: 0.78,
      normal: 0.90,
      close: 1.00
    };
    return desktopPresets[camera.zoomPreset] || 0.78;
  }
}

// RAIN ENGINE STATE
const rainDrops = [];
const MAX_RAIN = 120;
for (let i = 0; i < MAX_RAIN; i++) {
  rainDrops.push({
    x: Math.random() * 900,
    y: Math.random() * 700,
    len: 12 + Math.random() * 14,
    speed: 14 + Math.random() * 8
  });
}

// Gross Beat Relic After-Image Trail Buffer
const playerEchoTrail = [];

function resizeCanvas() {
  canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
  canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  const z = getEffectiveCameraZoom();
  camera.zoom = z;
  camera.width = canvas.width / z;
  camera.height = canvas.height / z;
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 120));
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resizeCanvas);
}

window.addEventListener('beforeunload', () => {
  if (window.State && typeof State.save === 'function') State.save();
});

function handleCanvasHudTap(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const cx = clientX - rect.left;
  const cy = clientY - rect.top;

  if (camera.zoomBtnBounds) {
    const b = camera.zoomBtnBounds;
    if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) {
      camera.cycleZoomPreset();
      return true;
    }
  }
  if (camera.mapBtnBounds) {
    const b = camera.mapBtnBounds;
    if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) {
      camera.toggleRadarExpanded();
      return true;
    }
  }
  if (camera.radarBounds) {
    const b = camera.radarBounds;
    if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) {
      camera.toggleRadarExpanded();
      return true;
    }
  }
  return false;
}

// Two-finger Pinch-to-Zoom on mobile canvas + Tap on Radar/Zoom HUD pills
let pinchStartDist = null;
let pinchStartZoom = 1.0;

canvas.addEventListener('touchstart', (e) => {
  if (window.AudioEngine && typeof AudioEngine.init === 'function') AudioEngine.init();
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    pinchStartDist = Math.hypot(dx, dy);
    pinchStartZoom = getEffectiveCameraZoom();
    return;
  }
  if (e.touches.length === 1) {
    const t = e.touches[0];
    if (handleCanvasHudTap(t.clientX, t.clientY)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2 && pinchStartDist && pinchStartDist > 20) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const ratio = dist / pinchStartDist;
    camera.customZoom = Math.max(0.40, Math.min(1.15, pinchStartZoom * ratio));
  }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    pinchStartDist = null;
  }
});

canvas.addEventListener('mousedown', (e) => {
  if (window.AudioEngine && typeof AudioEngine.init === 'function') AudioEngine.init();

  if (document.activeElement && document.activeElement.tagName === 'INPUT') {
    document.activeElement.blur();
  }

  if (e.button === 0 && handleCanvasHudTap(e.clientX, e.clientY)) {
    return;
  }

  if (e.button === 0 && window.Combat && typeof Combat.startSlashInput === 'function') {
    Combat.startSlashInput();
  } else if (e.button === 2 && window.Combat && typeof Combat.startShootInput === 'function') {
    e.preventDefault();
    Combat.startShootInput();
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (e.button === 0 && window.Combat && typeof Combat.releaseSlashInput === 'function') {
    Combat.releaseSlashInput();
  } else if (e.button === 2 && window.Combat && typeof Combat.releaseShootInput === 'function') {
    e.preventDefault();
    Combat.releaseShootInput();
  }
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  const zoom = getEffectiveCameraZoom();
  camera.zoom = zoom;

  let shakeX = 0, shakeY = 0;
  if (window.State && State.screenShake && State.screenShake.duration > 0) {
    shakeX = (Math.random() - 0.5) * State.screenShake.intensity;
    shakeY = (Math.random() - 0.5) * State.screenShake.intensity;
    State.screenShake.duration--;
  }

  ctx.scale(zoom, zoom);
  ctx.translate(-Math.floor(camera.x) + shakeX, -Math.floor(camera.y) + shakeY);

  const dim = (window.State && State.currentDimension) ? State.currentDimension : 'underground';
  if (dim === 'underground') drawUnderground();
  else if (dim === 'retrocade') drawRetrocade();
  else if (dim === 'horizon') drawHorizon();
  else drawWasteland();

  ctx.restore();

  if (dim === 'wasteland') {
    drawRainOverlay();
  }
  drawOffscreenThreatIndicators(dim);
  drawTacticalRadar(dim);
  drawCombatStyleHud();
}

// =========================================================================
// 1. UNDERGROUND NIGHT SHIFT (2400 x 1200)
// =========================================================================
function drawUnderground() {
  ctx.fillStyle = '#161d2f';
  ctx.fillRect(0, 0, 2400, 1200);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 2400; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1200); ctx.stroke();
  }
  for (let y = 0; y < 1200; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2400, y); ctx.stroke();
  }

  ctx.fillStyle = '#121929'; ctx.fillRect(35, 35, 600, 415);
  ctx.fillStyle = '#171a2a'; ctx.fillRect(800, 35, 500, 320);
  ctx.fillStyle = '#1b1730'; ctx.fillRect(1450, 35, 915, 445);
  ctx.fillStyle = '#131824'; ctx.fillRect(1450, 505, 915, 660);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px "Chakra Petch"';
  ctx.fillText("TUNING BAY 01 // MERCH & BLACK MARKET", 60, 65);
  ctx.fillText("MASTERING SUITE // DISCOGRAPHY VAULT", 830, 65);
  ctx.fillStyle = '#c084fc';
  ctx.fillText("NEO-ARCADE CONCOURSE // 3-CABINET ALLEY", 1480, 65);
  ctx.fillStyle = '#64748b';
  ctx.fillText("SUBTERRANEAN GENERATOR ANNEX", 1780, 535);

  ctx.fillStyle = '#222b40';
  if (typeof Dimensions !== 'undefined' && Dimensions.undergroundObstacles) {
    Dimensions.undergroundObstacles.forEach(o => {
      ctx.fillRect(o.x, o.y, o.width, o.height);
      ctx.strokeStyle = '#384869';
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, o.width, o.height);
    });
  }

  drawUndergroundDoorways();

  // West Bay: Trunk Pop Vehicle
  ctx.fillStyle = '#1e293b'; ctx.fillRect(180, 200, 150, 75);
  ctx.fillStyle = '#ff003c'; ctx.fillRect(185, 265, 20, 6); ctx.fillRect(305, 265, 20, 6);
  ctx.fillStyle = '#334155'; ctx.fillRect(210, 180, 90, 25);
  ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("TRUNK POP // MERCH", 195, 235);
  ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 8px "Share Tech Mono"';
  ctx.fillText("PROMO: LOWLIFEWORLD15", 200, 252);

  if (typeof Entities !== 'undefined' && Entities.trainingDummies) {
    Entities.trainingDummies.forEach(td => {
      ctx.save();
      const isFlashing = td.hitFlash > 0;
      ctx.fillStyle = isFlashing ? 'rgba(255, 255, 255, 0.85)' : 'rgba(2, 132, 199, 0.25)';
      ctx.fillRect(td.x - 2, td.y - 2, td.width + 4, td.height + 4);
      ctx.strokeStyle = isFlashing ? '#ffffff' : '#00f0ff';
      ctx.lineWidth = isFlashing ? 2.5 : 1.5;
      ctx.strokeRect(td.x, td.y, td.width, td.height);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#00f0ff';
      ctx.fillRect(td.x + 6, td.y + 8, td.width - 12, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px "Share Tech Mono"';
      ctx.fillText("TARGET DUMMY", td.x - 16, td.y - 6);
      ctx.restore();
    });
  }

  // Mastering Console (Reactive to Web Audio AnalyserNode)
  const ugTelemetry = (window.AudioEngine && typeof AudioEngine.getAudioTelemetry === 'function')
    ? AudioEngine.getAudioTelemetry()
    : { active: false, subEnergy: 0, bins: [] };
  ctx.fillStyle = '#0f172a'; ctx.fillRect(880, 120, 160, 90);
  ctx.strokeStyle = ugTelemetry.active && ugTelemetry.onBeat ? '#4ade80' : '#00f0ff';
  ctx.lineWidth = 1.5 + (ugTelemetry.subEnergy || 0) * 2;
  ctx.strokeRect(880, 120, 160, 90);
  ctx.fillStyle = '#0284c7'; ctx.fillRect(895, 130, 55, 30); ctx.fillRect(965, 130, 55, 30);
  for (let m = 0; m < 5; m++) {
    const fftVal = ugTelemetry.active ? (ugTelemetry.bins[m * 2] || 0) * 22 : (Math.sin((Date.now() / 150) + m) * 6);
    const barH = Math.max(4, Math.min(26, 8 + fftVal));
    ctx.fillStyle = ugTelemetry.isVip ? '#4ade80' : '#38bdf8';
    ctx.fillRect(900 + m * 9, 158 - barH, 6, barH);
    ctx.fillRect(970 + m * 9, 158 - barH, 6, barH);
  }
  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("MASTERING CONSOLE", 912, 182);
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 8px "Share Tech Mono"';
  ctx.fillText("[AUDIT DISCOGRAPHY]", 908, 198);

  const arcadeTitles = ['VOID INVADERS', 'PAC-LOWLIFE', 'SUPER LOWLIFE'];
  arcadeTitles.forEach((title, idx) => {
    const ax = 1650 + idx * 150;
    ctx.fillStyle = '#312e81'; ctx.fillRect(ax, 120, 70, 70);
    ctx.strokeStyle = '#00f0ff'; ctx.strokeRect(ax, 120, 70, 70);
    ctx.fillStyle = '#facc15'; ctx.fillRect(ax + 8, 128, 54, 30);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px "Chakra Petch"';
    ctx.fillText(title, ax + 5, 175);
    ctx.fillStyle = '#a5f3fc'; ctx.font = 'bold 7px "Share Tech Mono"';
    ctx.fillText("INSERT 5🪙", ax + 14, 186);
  });

  drawPortal(2200, 900, '#00f0ff', '#ec4899', "WARP: RETROCADE NIRVANA");
  drawPortalsAndEntities('underground');
}

function drawUndergroundDoorways() {
  const doorways = (typeof Dimensions !== 'undefined' && typeof Dimensions.getActiveDoorways === 'function')
    ? Dimensions.getActiveDoorways()
    : (typeof Dimensions !== 'undefined' && Dimensions.undergroundDoorways ? Dimensions.undergroundDoorways : []);

  doorways.forEach(door => {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.fillRect(door.x - 3, door.y - 3, door.width + 6, door.height + 6);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(door.x, door.y, door.width, door.height);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    if (door.width >= door.height) {
      ctx.moveTo(door.x, door.y + door.height / 2);
      ctx.lineTo(door.x + door.width, door.y + door.height / 2);
    } else {
      ctx.moveTo(door.x + door.width / 2, door.y);
      ctx.lineTo(door.x + door.width / 2, door.y + door.height);
    }
    ctx.stroke();

    if (door.label) {
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
      ctx.font = 'bold 7px "Share Tech Mono"';
      if (door.width >= door.height) {
        ctx.fillText(door.label, door.x + Math.max(6, (door.width - 90) / 2), door.y + door.height / 2 + 10);
      } else {
        ctx.save();
        ctx.translate(door.x - 4, door.y + door.height / 2 + 30);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(door.label, 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();
  });
}

// =========================================================================
// 2. RETROCADE / NIRVANA COMPLEX (2400 x 1200)
// =========================================================================
function drawRetrocade() {
  ctx.fillStyle = '#24143a'; ctx.fillRect(0, 0, 2400, 1200);

  ctx.strokeStyle = 'rgba(236, 72, 153, 0.12)'; ctx.lineWidth = 1;
  for (let x = 0; x < 2400; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1200); ctx.stroke(); }
  for (let y = 0; y < 1200; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2400, y); ctx.stroke(); }

  ctx.fillStyle = '#1e1430'; ctx.fillRect(35, 35, 645, 1130);
  ctx.fillStyle = '#1e1430'; ctx.fillRect(1750, 35, 615, 1130);

  ctx.fillStyle = '#3b1d5c';
  if (typeof Dimensions !== 'undefined' && Dimensions.retrocadeObstacles) {
    Dimensions.retrocadeObstacles.forEach(o => {
      ctx.fillRect(o.x, o.y, o.width, o.height);
      ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2; ctx.strokeRect(o.x, o.y, o.width, o.height);
    });
  }

  ctx.save();
  ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(680, 500, 30, 160);
  ctx.beginPath(); ctx.moveTo(695, 500); ctx.lineTo(695, 660); ctx.stroke();
  ctx.strokeRect(1720, 500, 30, 160);
  ctx.beginPath(); ctx.moveTo(1735, 500); ctx.lineTo(1735, 660); ctx.stroke();
  ctx.restore();

  // Directive 2: Web Audio AnalyserNode Reactive Stage, Lights & Dance Floor
  const audioTel = (window.AudioEngine && typeof AudioEngine.getAudioTelemetry === 'function')
    ? AudioEngine.getAudioTelemetry()
    : { active: false, subEnergy: 0, midHighEnergy: 0, bins: [], isVip: false, onBeat: false };

  // Reactive Ambient Stage & Laser Spotlights
  if (audioTel.active) {
    ctx.save();
    const beamAlpha = 0.08 + audioTel.subEnergy * 0.24;
    ctx.fillStyle = audioTel.isVip ? `rgba(74, 222, 128, ${beamAlpha})` : `rgba(0, 240, 255, ${beamAlpha})`;
    ctx.beginPath();
    ctx.moveTo(1100, 140); ctx.lineTo(920, 760); ctx.lineTo(1180, 760); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = audioTel.isVip ? `rgba(0, 240, 255, ${beamAlpha})` : `rgba(236, 72, 153, ${beamAlpha})`;
    ctx.beginPath();
    ctx.moveTo(1300, 140); ctx.lineTo(1220, 760); ctx.lineTo(1480, 760); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // DJ Barrier Wall (Pulses on Sub-Bass Kick)
  ctx.fillStyle = audioTel.isVip && audioTel.onBeat ? 'rgba(74, 222, 128, 0.45)' : 'rgba(168, 85, 247, 0.35)';
  ctx.fillRect(920, 240, 560, 25);
  ctx.strokeStyle = audioTel.isVip && audioTel.onBeat ? '#4ade80' : '#a855f7';
  ctx.lineWidth = 3 + audioTel.subEnergy * 3;
  ctx.strokeRect(920, 240, 560, 25);
  for (let s = 920; s < 1480; s += 20) {
    ctx.strokeStyle = audioTel.onBeat ? '#00f0ff' : '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s, 240); ctx.lineTo(s + 12, 265); ctx.stroke();
  }
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("▲ ACOUSTIC SECURITY WALL ▲", 1100, 257);

  // Dance Floor (10x8 Matrix Driven by Real-Time AnalyserNode FFT Bins & BPM)
  const vipColors = ['#4ade80', '#00f0ff', '#facc15', '#ec4899'];
  const stdColors = ['#ec4899', '#00f0ff', '#a855f7', '#facc15'];
  const palette = audioTel.isVip ? vipColors : stdColors;
  const stepIdx = window.AudioEngine ? AudioEngine.bgmStepIndex : 0;

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 8; j++) {
      const binEnergy = audioTel.active ? (audioTel.bins[(i + j) % 16] || 0) : 0;
      const distFromCenter = Math.hypot(i - 4.5, j - 3.5);
      const ripple = audioTel.active && audioTel.onBeat && distFromCenter < 3.8 ? 0.28 : 0;
      ctx.fillStyle = palette[(i + j + stepIdx) % palette.length];
      ctx.globalAlpha = Math.min(0.95, 0.32 + binEnergy * 0.48 + audioTel.subEnergy * 0.22 + ripple);
      const inset = audioTel.active && audioTel.onBeat ? 0 : 2;
      ctx.fillRect(980 + i * 42 + inset, 420 + j * 40 + inset, 38 - inset * 2, 36 - inset * 2);
      if (audioTel.active && (binEnergy > 0.45 || (audioTel.isVip && audioTel.onBeat && (i + j) % 2 === 0))) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(980 + i * 42, 420 + j * 40, 38, 36);
      }
      ctx.globalAlpha = 1.0;
    }
  }

  // DJ Stage 16-Band Real-Time FFT Visualizer
  ctx.fillStyle = '#4c1d95'; ctx.fillRect(1060, 140, 280, 80);
  ctx.strokeStyle = audioTel.isVip ? '#4ade80' : '#f43f5e';
  ctx.lineWidth = 2 + audioTel.subEnergy * 2.5;
  ctx.strokeRect(1060, 140, 280, 80);
  for (let b = 0; b < 16; b++) {
    const fftAmp = audioTel.active ? (audioTel.bins[b] || 0) * 68 : (Math.sin((Date.now() / 120) + b) * 10);
    const barH = Math.max(6, 10 + fftAmp);
    ctx.fillStyle = audioTel.isVip
      ? (b % 2 === 0 ? '#4ade80' : '#00f0ff')
      : (b % 2 === 0 ? '#00f0ff' : '#ec4899');
    ctx.fillRect(1080 + b * 15, 140 - barH, 10, barH);
  }

  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 12px "Chakra Petch"';
  ctx.fillText("NIRVANA // CLUB LOWLIFE MUSIC KIOSK", 160, 100);
  ctx.fillStyle = '#431407'; ctx.fillRect(260, 220, 160, 90);
  ctx.strokeStyle = '#f97316'; ctx.strokeRect(260, 220, 160, 90);
  ctx.fillStyle = '#fed7aa'; ctx.font = 'bold 10px "Share Tech Mono"';
  ctx.fillText("🎵 MUSIC STEM KIOSK", 280, 270);

  ctx.fillStyle = '#facc15'; ctx.font = 'bold 12px "Chakra Petch"';
  ctx.fillText("HIGH-STAKES CASINO // NIRVANA", 1900, 100);
  ctx.fillStyle = '#581c87'; ctx.fillRect(1880, 180, 130, 70);
  ctx.strokeStyle = '#c084fc'; ctx.strokeRect(1880, 180, 130, 70);
  ctx.fillStyle = '#facc15'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("🎰 3-REEL CLASSIC (5🪙)", 1888, 220);
  ctx.fillStyle = '#713f12'; ctx.fillRect(2120, 180, 150, 70);
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.strokeRect(2120, 180, 150, 70);
  ctx.fillStyle = '#fef08a'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("💎 5-LANE HIGH ROLLER (25🪙)", 2125, 220);

  drawPortal(800, 1050, '#00f0ff', '#3b82f6', "WARP: UNDERGROUND");
  drawPortal(1520, 1050, '#10b981', '#f43f5e', "WARP: ASHEN WASTELAND");

  drawPortalsAndEntities('retrocade');
}

// =========================================================================
// 3. THE ASHEN WASTELAND (6400 x 4800 - High-Density Corruption Battleground)
// =========================================================================
function drawWasteland() {
  ctx.fillStyle = '#181f2c'; ctx.fillRect(0, 0, 6400, 4800);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)'; ctx.lineWidth = 1;
  for (let x = 0; x < 6400; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 4800); ctx.stroke(); }
  for (let y = 0; y < 4800; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(6400, y); ctx.stroke(); }

  // Interior Floor Tints (Original + New Dungeons, Caves, Castles & Safe Zones)
  ctx.fillStyle = '#07241e'; ctx.fillRect(1685, 295, 830, 490); // Node 4: The Rust Sanctuary (Safe Zone)
  ctx.fillStyle = '#111827'; ctx.fillRect(2135, 1235, 530, 430); // Martian University
  ctx.fillStyle = '#091526'; ctx.fillRect(3040, 1240, 620, 670); // Node 5: Deep Void Data Vault
  ctx.fillStyle = '#1e1b4b'; ctx.fillRect(3835, 2335, 530, 480); // Sector 777 Overlook
  ctx.fillStyle = '#131c24'; ctx.fillRect(4815, 1615, 1170, 970); // Echo Cavern & Crystal Grotto
  ctx.fillStyle = '#261008'; ctx.fillRect(390, 3140, 1220, 1170); // Node 3: The Furnace Foundry Dungeon
  ctx.fillStyle = '#0b1922'; ctx.fillRect(1885, 3485, 700, 930); // Node 1: Undercity Transit Core ("The Drain")
  ctx.fillStyle = '#0f172a'; ctx.fillRect(2835, 3835, 830, 530); // Holding Chamber
  ctx.fillStyle = '#062e22'; ctx.fillRect(3700, 3935, 315, 330); // Industrial Washroom
  ctx.fillStyle = '#1c0d1f'; ctx.fillRect(4495, 3195, 1560, 1260); // Node 2: Apex Signal Array & Syndicate Citadel

  // Zone Header Titles & Architectural Landmarks
  ctx.font = 'bold 13px "Chakra Petch"';
  ctx.fillStyle = '#4ade80';
  ctx.fillText("THE RUST SANCTUARY // BIO-CLINIC [SAFE ZONE]", 1890, 340);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText("MARTIAN UNIVERSITY // FREQUENCY LAB", 2240, 1280);
  ctx.fillStyle = '#00f0ff';
  ctx.fillText("DEEP VOID DATA VAULT // SUBMERGED MAINFRAME", 3140, 1285);
  ctx.fillStyle = '#facc15';
  ctx.fillText("SECTOR 777 // LIVING ON THE HIGHS", 3940, 2380);
  ctx.fillStyle = '#2dd4bf';
  ctx.fillText("ECHO CAVERN & CRYSTAL GROTTO // ACOUSTIC DEPTHS", 5020, 1665);
  ctx.fillStyle = '#f97316';
  ctx.fillText("THE FURNACE // BLACK-MARKET TECH REFINERY [BOSS]", 560, 3190);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText("UNDERCITY TRANSIT CORE // 'THE DRAIN' [BOSS]", 1960, 3535);
  ctx.fillStyle = '#f43f5e';
  ctx.fillText("APEX SIGNAL CITADEL & BROADCAST SPIRE [EXTREME BOSS]", 4880, 3250);

  // Rust Sanctuary Bio-Pod Medical Rig
  ctx.save();
  ctx.fillStyle = '#064e3b'; ctx.fillRect(2030, 420, 140, 80);
  ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.strokeRect(2030, 420, 140, 80);
  ctx.fillStyle = '#4ade80'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("✚ BIO-POD CLINIC [E]", 2045, 464);
  ctx.restore();

  // Deep Void Mainframe Server Stack
  ctx.save();
  ctx.fillStyle = '#0f172a'; ctx.fillRect(3120, 1320, 130, 75);
  ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.strokeRect(3120, 1320, 130, 75);
  ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("🖥️ VOID MAINFRAME [E]", 3130, 1362);
  ctx.restore();

  // The Furnace Smelting Reactor Core
  ctx.save();
  const furnacePulse = Math.sin(Date.now() / 160) * 6;
  ctx.fillStyle = 'rgba(249, 115, 22, 0.22)';
  ctx.beginPath(); ctx.arc(950, 4020, 110 + furnacePulse, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(950, 4020, 75, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // Apex Signal Broadcast Spire (Citadel Centerpiece)
  ctx.save();
  const spirePulse = Math.sin(Date.now() / 140) * 12;
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(5550, 3800, 140 + spirePulse, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(5550, 3800, 90 - spirePulse * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // Extraction Getaway Van
  ctx.save();
  ctx.fillStyle = '#090b10'; ctx.fillRect(460, 1080, 125, 65);
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.strokeRect(460, 1080, 125, 65);
  ctx.fillStyle = '#ff003c'; ctx.fillRect(462, 1088, 6, 14); ctx.fillRect(462, 1124, 6, 14);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.14)';
  ctx.beginPath(); ctx.moveTo(585, 1090); ctx.lineTo(740, 1040); ctx.lineTo(740, 1120); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(585, 1135); ctx.lineTo(740, 1105); ctx.lineTo(740, 1185); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 8px "Share Tech Mono"';
  ctx.fillText("EXTRACTION VAN [E]", 472, 1116);
  ctx.restore();

  // Conner Cade's Creative Bonfire Safe Zone
  drawConnerCadeBonfire();

  if (typeof Dimensions !== 'undefined' && Dimensions.environmentalHazards) {
    Dimensions.environmentalHazards.forEach(h => {
      ctx.fillStyle = '#166534'; ctx.fillRect(h.x, h.y, h.width, h.height);
      ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.strokeRect(h.x, h.y, h.width, h.height);
    });
  }

  if (typeof Dimensions !== 'undefined' && Dimensions.worldObstacles) {
    Dimensions.worldObstacles.forEach(o => {
      ctx.fillStyle = '#222d3d'; ctx.fillRect(o.x, o.y, o.width, o.height);
      ctx.strokeStyle = '#384860'; ctx.lineWidth = 2; ctx.strokeRect(o.x, o.y, o.width, o.height);
      if (o.label) {
        ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px "Share Tech Mono"';
        ctx.fillText(o.label, o.x + 10, o.y + 22);
      }
    });
  }

  if (typeof Dimensions !== 'undefined' && Dimensions.destructibleDoors) {
    Dimensions.destructibleDoors.forEach(d => {
      if (!d.shattered) {
        ctx.fillStyle = '#4c0519'; ctx.fillRect(d.x, d.y, d.width, d.height);
        ctx.strokeStyle = '#ff003c'; ctx.lineWidth = 2.5; ctx.strokeRect(d.x, d.y, d.width, d.height);
        ctx.fillStyle = '#ff003c'; ctx.font = 'bold 9px "Share Tech Mono"';
        ctx.fillText(`BREACH [${d.hp} HP]`, d.x + 8, d.y + 20);
      }
    });
  }

  drawHoldingChamberInterior();

  if (typeof Dimensions !== 'undefined' && Dimensions.wastelandChests) {
    Dimensions.wastelandChests.forEach(c => {
      ctx.fillStyle = c.opened ? '#334155' : (c.type === 'master_holding' ? '#701a75' : '#047857');
      ctx.fillRect(c.x, c.y, c.width, c.height);
      ctx.strokeStyle = c.type === 'master_holding' ? '#facc15' : '#00f0ff';
      ctx.lineWidth = 2; ctx.strokeRect(c.x, c.y, c.width, c.height);
    });
  }

  drawPortal(650, 1020, '#a855f7', '#ec4899', "WARP: RETROCADE");
  drawPortal(3120, 150, '#10b981', '#facc15', "NEURAL EXTRACTION GATE [50 TAPES]");

  drawPortalsAndEntities('wasteland');
}

// =========================================================================
// 4. CHAPTER III // THE HORIZON DIMENSION (3600 x 2400 Astral Citadel)
// =========================================================================
function drawHorizon() {
  ctx.fillStyle = '#090618'; ctx.fillRect(0, 0, 3600, 2400);

  // Prismatic Astral Grid
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)'; ctx.lineWidth = 1;
  for (let x = 0; x < 3600; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 2400); ctx.stroke(); }
  for (let y = 0; y < 2400; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(3600, y); ctx.stroke(); }

  // Sanctum & Citadel Floor Tints
  ctx.fillStyle = '#17103a'; ctx.fillRect(1240, 240, 1120, 670); // Astral Sovereign Keep
  ctx.fillStyle = '#0e1b38'; ctx.fillRect(285, 785, 680, 680);   // Zero-G Mastering Sanctum
  ctx.fillStyle = '#1f1033'; ctx.fillRect(2635, 785, 680, 680);  // Syndicate Archive Bastion

  // Prismatic Starlight Conduit Bridge
  const bridgeGrad = ctx.createLinearGradient(1550, 950, 2050, 2100);
  bridgeGrad.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
  bridgeGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.18)');
  bridgeGrad.addColorStop(1, 'rgba(250, 204, 21, 0.18)');
  ctx.fillStyle = bridgeGrad;
  ctx.fillRect(1560, 950, 480, 1200);

  ctx.font = 'bold 15px "Chakra Petch"';
  ctx.fillStyle = '#facc15';
  ctx.fillText("ASTRAL SOVEREIGN KEEP // CHAPTER III SANCTUM", 1580, 285);
  ctx.fillStyle = '#00f0ff';
  ctx.fillText("ZERO-G MASTERING SANCTUM", 460, 835);
  ctx.fillStyle = '#ec4899';
  ctx.fillText("SYNDICATE ARCHIVE BASTION", 2820, 835);

  // Zero-G Console
  ctx.fillStyle = '#1e1b4b'; ctx.fillRect(520, 920, 180, 85);
  ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.strokeRect(520, 920, 180, 85);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("🌌 ASTRAL CONSOLE [E]", 545, 968);

  if (typeof Dimensions !== 'undefined' && Dimensions.horizonObstacles) {
    Dimensions.horizonObstacles.forEach(o => {
      ctx.fillStyle = '#25174a'; ctx.fillRect(o.x, o.y, o.width, o.height);
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.strokeRect(o.x, o.y, o.width, o.height);
      if (o.label) {
        ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 9px "Share Tech Mono"';
        ctx.fillText(o.label, o.x + 10, o.y + 22);
      }
    });
  }

  if (typeof Dimensions !== 'undefined' && Dimensions.horizonChests) {
    Dimensions.horizonChests.forEach(c => {
      ctx.fillStyle = c.opened ? '#334155' : (c.type === 'master_holding' ? '#701a75' : '#047857');
      ctx.fillRect(c.x, c.y, c.width, c.height);
      ctx.strokeStyle = c.type === 'master_holding' ? '#facc15' : '#00f0ff';
      ctx.lineWidth = 2; ctx.strokeRect(c.x, c.y, c.width, c.height);
    });
  }

  drawPortal(1760, 2180, '#00f0ff', '#10b981', "WARP: ASHEN WASTELAND");
  drawPortal(1520, 2180, '#ec4899', '#facc15', "WARP: UNDERGROUND HUB");

  drawPortalsAndEntities('horizon');
}

function drawOffscreenThreatIndicators(dim) {
  if ((dim !== 'wasteland' && dim !== 'horizon') || !window.Entities || !Entities.player || !Entities.hostileNpcs) return;

  const headerBottom = (document.querySelector('header')?.offsetHeight || 50) + 14;
  const padX = 22;
  const padTop = headerBottom + 10;
  const padBottom = canvas.width < 640 ? 150 : 28;
  const centerScreenX = canvas.width / 2;
  const centerScreenY = canvas.height / 2;
  const zoom = camera.zoom || 1.0;

  ctx.save();
  Entities.hostileNpcs.forEach(n => {
    if (!n.alive || (n.dim || 'wasteland') !== dim) return;
    const cx = n.x + (n.width || 24) / 2;
    const cy = n.y + (n.height || 36) / 2;
    const dist = Math.hypot(cx - Entities.player.x, cy - Entities.player.y);

    // Show indicator if enemy is aggroed or a boss within 850px, and currently outside the visible camera box
    const isRelevant = n.state === 'aggro' || (n.tier === 'boss' && dist < 850);
    if (!isRelevant) return;

    const screenX = (cx - camera.x) * zoom;
    const screenY = (cy - camera.y) * zoom;

    const isOffscreen = (
      screenX < 12 ||
      screenX > canvas.width - 12 ||
      screenY < headerBottom ||
      screenY > canvas.height - 12
    );
    if (!isOffscreen) return;

    const angle = Math.atan2(screenY - centerScreenY, screenX - centerScreenX);
    const ix = Math.max(padX, Math.min(canvas.width - padX, screenX));
    const iy = Math.max(padTop, Math.min(canvas.height - padBottom, screenY));

    const col = n.tier === 'boss' ? '#ff003c' : (n.tier === 'mid' ? '#f97316' : '#f43f5e');
    const pulse = 0.75 + Math.sin(Date.now() * 0.012) * 0.25;

    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(angle);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 8;

    const sz = n.tier === 'boss' ? 9 : 6.5;
    ctx.beginPath();
    ctx.moveTo(sz, 0);
    ctx.lineTo(-sz, -sz * 0.75);
    ctx.lineTo(-sz * 0.45, 0);
    ctx.lineTo(-sz, sz * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}

function drawTacticalRadar(dim) {
  if (!window.Entities || !Entities.player) return;

  const isMobile = canvas.width < 640;
  const headerBottom = (document.querySelector('header')?.offsetHeight || 50) + 6;
  const dimCfg = (window.State && State.DIMENSIONS && State.DIMENSIONS[dim])
    ? State.DIMENSIONS[dim]
    : { width: 2400, height: 1200, name: dim.toUpperCase() };

  const mapW = dimCfg.width || 2400;
  const mapH = dimCfg.height || 1200;

  const baseW = isMobile ? 118 : 156;
  const expandedW = isMobile ? Math.min(236, canvas.width - 20) : 276;
  const radarW = camera.radarExpanded ? expandedW : baseW;
  const radarH = Math.max(camera.radarExpanded ? 110 : 64, Math.round(radarW * (mapH / mapW)));
  const rx = canvas.width - radarW - 8;
  const ry = headerBottom;

  camera.radarBounds = { x: rx, y: ry, w: radarW, h: radarH };

  const themeColors = {
    underground: '#00f0ff',
    retrocade: '#ec4899',
    wasteland: '#00f0ff',
    horizon: '#a855f7'
  };
  const borderCol = themeColors[dim] || '#00f0ff';

  ctx.save();
  ctx.fillStyle = 'rgba(7, 10, 18, 0.90)';
  ctx.fillRect(rx, ry, radarW, radarH);
  ctx.strokeStyle = borderCol;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rx, ry, radarW, radarH);

  const sx = radarW / mapW;
  const sy = radarH / mapH;

  // Subtle Grid Inside Radar
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 0.5;
  for (let gx = 1; gx < 4; gx++) {
    ctx.beginPath();
    ctx.moveTo(rx + (radarW * gx) / 4, ry);
    ctx.lineTo(rx + (radarW * gx) / 4, ry + radarH);
    ctx.stroke();
  }
  for (let gy = 1; gy < 3; gy++) {
    ctx.beginPath();
    ctx.moveTo(rx, ry + (radarH * gy) / 3);
    ctx.lineTo(rx + radarW, ry + (radarH * gy) / 3);
    ctx.stroke();
  }

  // 1. Dimension-Specific Zone Highlights & Portals
  if (dim === 'underground') {
    // Tuning Bay / Merch
    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.fillRect(rx + 35 * sx, ry + 35 * sy, 600 * sx, 415 * sy);
    // Mastering Suite
    ctx.fillStyle = 'rgba(14, 165, 233, 0.20)';
    ctx.fillRect(rx + 800 * sx, ry + 35 * sy, 500 * sx, 320 * sy);
    // Neo-Arcade Concourse
    ctx.fillStyle = 'rgba(192, 132, 252, 0.18)';
    ctx.fillRect(rx + 1450 * sx, ry + 35 * sy, 915 * sx, 445 * sy);
    // Generator Annex
    ctx.fillStyle = 'rgba(100, 116, 139, 0.14)';
    ctx.fillRect(rx + 1450 * sx, ry + 505 * sy, 915 * sx, 660 * sy);

    // 3 Arcade Cabinets (Gold markers)
    ctx.fillStyle = '#facc15';
    [1650, 1800, 1950].forEach(ax => {
      ctx.fillRect(rx + ax * sx, ry + 120 * sy, Math.max(2.5, 70 * sx), Math.max(2.5, 70 * sy));
    });

    // Trunk Merch & Mastering Console
    ctx.fillStyle = '#ff003c';
    ctx.fillRect(rx + 180 * sx, ry + 200 * sy, Math.max(3, 150 * sx), Math.max(2.5, 75 * sy));
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(rx + 880 * sx, ry + 120 * sy, Math.max(3, 160 * sx), Math.max(2.5, 90 * sy));

    // Warp Portal to Retrocade (2200, 900)
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rx + 2240 * sx, ry + 940 * sy, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    if (camera.radarExpanded) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.font = 'bold 7px "Share Tech Mono"';
      ctx.fillText('MERCH', rx + 80 * sx, ry + 160 * sy);
      ctx.fillText('STUDIO', rx + 880 * sx, ry + 105 * sy);
      ctx.fillText('ARCADE', rx + 1660 * sx, ry + 105 * sy);
      ctx.fillStyle = '#ec4899';
      ctx.fillText('WARP', rx + 2060 * sx, ry + 945 * sy);
    }
  } else if (dim === 'retrocade') {
    // West Lounge
    ctx.fillStyle = 'rgba(168, 85, 247, 0.16)';
    ctx.fillRect(rx + 35 * sx, ry + 35 * sy, 645 * sx, 1130 * sy);
    // Dance Floor (Center)
    ctx.fillStyle = 'rgba(236, 72, 153, 0.28)';
    ctx.fillRect(rx + 980 * sx, ry + 420 * sy, 420 * sx, 320 * sy);
    // DJ Stage
    ctx.fillStyle = 'rgba(0, 240, 255, 0.26)';
    ctx.fillRect(rx + 920 * sx, ry + 120 * sy, 560 * sx, 145 * sy);
    // East Casino Wing
    ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
    ctx.fillRect(rx + 1750 * sx, ry + 35 * sy, 615 * sx, 1130 * sy);

    // Slot Machines & Music Kiosk
    ctx.fillStyle = '#facc15';
    ctx.fillRect(rx + 1880 * sx, ry + 180 * sy, Math.max(3, 130 * sx), Math.max(2.5, 70 * sy));
    ctx.fillRect(rx + 2120 * sx, ry + 180 * sy, Math.max(3, 150 * sx), Math.max(2.5, 70 * sy));
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(rx + 260 * sx, ry + 220 * sy, Math.max(3, 160 * sx), Math.max(2.5, 100 * sy));

    // Portals: Underground (800, 1050) & Wasteland (1520, 1050)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rx + 840 * sx, ry + 1090 * sy, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ff003c';
    ctx.beginPath();
    ctx.arc(rx + 1560 * sx, ry + 1090 * sy, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    if (camera.radarExpanded) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.font = 'bold 7px "Share Tech Mono"';
      ctx.fillText('LOUNGE', rx + 180 * sx, ry + 560 * sy);
      ctx.fillText('DANCE', rx + 1060 * sx, ry + 600 * sy);
      ctx.fillText('CASINO', rx + 1880 * sx, ry + 560 * sy);
    }
  } else if (dim === 'wasteland') {
    // Safe Zones (Green)
    ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
    ctx.fillRect(rx + 1650 * sx, ry + 260 * sy, 900 * sx, 560 * sy);
    ctx.beginPath();
    ctx.arc(rx + 2300 * sx, ry + 2900 * sy, 180 * sx, 0, Math.PI * 2);
    ctx.fill();

    // Destructible Doors (Orange)
    if (window.Dimensions && Dimensions.destructibleDoors) {
      ctx.fillStyle = '#f97316';
      Dimensions.destructibleDoors.forEach(d => {
        if (!d.shattered) {
          ctx.fillRect(rx + d.x * sx - 1, ry + d.y * sy - 1, Math.max(2.5, d.width * sx), Math.max(2.5, d.height * sy));
        }
      });
    }

    // Portals: Retrocade Return (650, 1020) & 50-Tape Horizon Gate (3120, 150)
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rx + 690 * sx, ry + 1060 * sy, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(rx + 3210 * sx, ry + 200 * sy, 4, 0, Math.PI * 2);
    ctx.stroke();

    if (camera.radarExpanded) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 7px "Share Tech Mono"';
      ctx.fillText('SANCTUARY', rx + 1720 * sx, ry + 580 * sy);
      ctx.fillText('BONFIRE', rx + 2050 * sx, ry + 2700 * sy);
      ctx.fillStyle = '#c084fc';
      ctx.fillText('RIFT', rx + 3320 * sx, ry + 260 * sy);
    }
  } else if (dim === 'horizon') {
    // Astral Keep, Zero-G Sanctum, Archive Bastion
    ctx.fillStyle = 'rgba(168, 85, 247, 0.20)';
    ctx.fillRect(rx + 1200 * sx, ry + 200 * sy, 1200 * sx, 750 * sy);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
    ctx.fillRect(rx + 250 * sx, ry + 750 * sy, 750 * sx, 750 * sy);
    ctx.fillStyle = 'rgba(236, 72, 153, 0.18)';
    ctx.fillRect(rx + 2600 * sx, ry + 750 * sy, 750 * sx, 750 * sy);

    // Return Portals (1760, 2180 & 1520, 2180)
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rx + 1800 * sx, ry + 2220 * sy, 3.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(rx + 1560 * sx, ry + 2220 * sy, 3.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2. Obstacles / Walls
  const obs = (window.Dimensions && typeof Dimensions.getActiveObstacles === 'function') ? Dimensions.getActiveObstacles() : [];
  ctx.fillStyle = 'rgba(148, 163, 184, 0.42)';
  obs.forEach(o => {
    ctx.fillRect(rx + o.x * sx, ry + o.y * sy, Math.max(1, o.width * sx), Math.max(1, o.height * sy));
  });

  // 3. Undiscovered Lore Tapes (Amber dots)
  if (window.State && Array.isArray(State.loreTapes)) {
    ctx.fillStyle = '#f59e0b';
    State.loreTapes.forEach(t => {
      if (t.dim === dim) {
        const isFound = State.userProfile && State.userProfile.discoveredLoreTapes && State.userProfile.discoveredLoreTapes.includes(t.id);
        if (!isFound) {
          ctx.fillRect(rx + t.x * sx - 1.5, ry + t.y * sy - 1.5, 3, 3);
        }
      }
    });
  }

  // 4. Unopened Chests (Gold dots)
  const chests = (window.Dimensions && typeof Dimensions.getActiveChests === 'function') ? Dimensions.getActiveChests() : [];
  ctx.fillStyle = '#facc15';
  chests.forEach(c => {
    if (!c.opened) {
      ctx.fillRect(rx + c.x * sx - 1.5, ry + c.y * sy - 1.5, 3, 3);
    }
  });

  // 5. Friendly NPCs (Emerald dots)
  if (Entities.friendlyNpcs && Entities.friendlyNpcs[dim]) {
    ctx.fillStyle = '#4ade80';
    Entities.friendlyNpcs[dim].forEach(fn => {
      ctx.fillRect(rx + fn.x * sx - 1.5, ry + fn.y * sy - 1.5, 3, 3);
    });
  }

  // 6. Hostiles & World Bosses
  if (Entities.hostileNpcs && (dim === 'wasteland' || dim === 'horizon')) {
    Entities.hostileNpcs.forEach(n => {
      if (!n.alive || (n.dim || 'wasteland') !== dim) return;
      if (n.tier === 'boss') {
        ctx.fillStyle = '#ff003c';
        ctx.beginPath();
        ctx.arc(rx + n.x * sx, ry + n.y * sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = n.tier === 'mid' ? '#f97316' : 'rgba(244, 63, 94, 0.72)';
        ctx.fillRect(rx + n.x * sx - 1, ry + n.y * sy - 1, 2, 2);
      }
    });
  }

  // 7. Current Camera Viewport Box on Minimap
  const vx = Math.max(rx, rx + camera.x * sx);
  const vy = Math.max(ry, ry + camera.y * sy);
  const vw = Math.min(radarW - (vx - rx), camera.width * sx);
  const vh = Math.min(radarH - (vy - ry), camera.height * sy);
  if (vw > 2 && vh > 2) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, vw, vh);
  }

  // 8. Player Position & Direction Indicator
  const px = rx + Entities.player.x * sx;
  const py = ry + Entities.player.y * sy;
  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.arc(px, py, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Map Title Overlay
  const mapLabels = {
    underground: 'MAP // UNDERGROUND',
    retrocade: 'MAP // NIRVANA',
    wasteland: 'MAP // WASTELAND',
    horizon: 'MAP // THE HORIZON'
  };
  ctx.fillStyle = 'rgba(7, 10, 18, 0.75)';
  ctx.fillRect(rx + 2, ry + radarH - 12, radarW - 4, 10);
  ctx.fillStyle = borderCol;
  ctx.font = 'bold 7.5px "Share Tech Mono"';
  ctx.fillText(mapLabels[dim] || 'TACTICAL MAP', rx + 5, ry + radarH - 4);

  // 9. Interactive Zoom & Map Expand Control Pills Below Radar
  const btnY = ry + radarH + 4;
  const btnH = isMobile ? 20 : 18;
  const halfW = Math.floor((radarW - 4) / 2);

  camera.zoomBtnBounds = { x: rx, y: btnY, w: halfW, h: btnH };
  camera.mapBtnBounds = { x: rx + halfW + 4, y: btnY, w: radarW - halfW - 4, h: btnH };

  // Zoom Pill
  ctx.fillStyle = 'rgba(11, 15, 25, 0.92)';
  ctx.fillRect(camera.zoomBtnBounds.x, camera.zoomBtnBounds.y, camera.zoomBtnBounds.w, camera.zoomBtnBounds.h);
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(camera.zoomBtnBounds.x, camera.zoomBtnBounds.y, camera.zoomBtnBounds.w, camera.zoomBtnBounds.h);

  const zoomTag = camera.customZoom !== null
    ? `${Math.round(camera.zoom * 100)}%`
    : camera.zoomPreset.toUpperCase();
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 7.5px "Share Tech Mono"';
  ctx.textAlign = 'center';
  ctx.fillText(`🔍 ${zoomTag}`, camera.zoomBtnBounds.x + camera.zoomBtnBounds.w / 2, btnY + btnH - 5);

  // Map Expand Pill
  ctx.fillStyle = 'rgba(11, 15, 25, 0.92)';
  ctx.fillRect(camera.mapBtnBounds.x, camera.mapBtnBounds.y, camera.mapBtnBounds.w, camera.mapBtnBounds.h);
  ctx.strokeStyle = borderCol;
  ctx.strokeRect(camera.mapBtnBounds.x, camera.mapBtnBounds.y, camera.mapBtnBounds.w, camera.mapBtnBounds.h);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(camera.radarExpanded ? '🗺️ MIN [-]' : '🗺️ MAP [+]', camera.mapBtnBounds.x + camera.mapBtnBounds.w / 2, btnY + btnH - 5);

  ctx.textAlign = 'left';
  ctx.restore();
}

function drawConnerCadeBonfire() {
  const bx = 2300, by = 2900;
  const time = Date.now() / 150;
  const pulse = Math.sin(time) * 10;

  ctx.save();

  ctx.strokeStyle = 'rgba(249, 115, 22, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(bx, by, 180 + Math.sin(time * 0.4) * 4, 0, Math.PI * 2);
  ctx.stroke();

  const grad = ctx.createRadialGradient(bx, by, 15, bx, by, 180);
  grad.addColorStop(0, 'rgba(251, 146, 60, 0.22)');
  grad.addColorStop(0.7, 'rgba(234, 88, 12, 0.08)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(bx, by, 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#44403c';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    const sx = bx + Math.cos(a) * 26;
    const sy = by + Math.sin(a) * 20;
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(bx - 16, by - 8); ctx.lineTo(bx + 16, by + 8);
  ctx.moveTo(bx - 16, by + 8); ctx.lineTo(bx + 16, by - 8);
  ctx.stroke();

  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.arc(bx, by - 4, 16 + pulse * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(bx, by - 8, 10 + pulse * 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(bx, by - 10, 5 + pulse * 0.2, 0, Math.PI * 2);
  ctx.fill();

  for (let e = 0; e < 5; e++) {
    const emberOffset = (time * 8 + e * 35) % 60;
    const ex = bx + Math.sin(time + e) * 14;
    const ey = by - 12 - emberOffset;
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(ex, ey, 2.5, 2.5);
  }

  ctx.setLineDash([]);
  ctx.fillStyle = '#fb923c';
  ctx.font = 'bold 10px "Chakra Petch"';
  ctx.textAlign = 'center';
  ctx.fillText("CONNER CADE'S CREATIVE BONFIRE [SAFE ZONE]", bx, by - 36);

  ctx.restore();
}

function drawRainOverlay() {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
  ctx.lineWidth = 1.5;

  rainDrops.forEach(r => {
    r.x += 2;
    r.y += r.speed;
    if (r.y > canvas.height) {
      r.y = -20;
      r.x = Math.random() * canvas.width;
      ctx.beginPath();
      ctx.arc(r.x, canvas.height - 10, 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x + 3, r.y + r.len);
    ctx.stroke();
  });

  ctx.restore();
}

function drawHoldingChamberInterior() {
  const tvX = 3200, tvY = 3850;
  ctx.fillStyle = '#292524'; ctx.fillRect(tvX, tvY, 52, 40);
  ctx.fillStyle = Math.random() < 0.5 ? '#e0f2fe' : '#ffffff';
  ctx.fillRect(tvX + 4, tvY + 4, 44, 32);

  const chairX = 3212, chairY = 3915;
  ctx.fillStyle = '#64748b'; ctx.fillRect(chairX + 4, chairY + 12, 16, 20);
  ctx.fillStyle = '#ec4899'; ctx.fillRect(chairX + 2, chairY + 4, 20, 16);
  ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(chairX + 12, chairY - 2, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px "Share Tech Mono"';
  ctx.fillText("CAPTIVE OLD SELF", chairX - 16, chairY + 38);

  ctx.save();
  ctx.fillStyle = 'rgba(74, 222, 128, 0.22)';
  ctx.fillRect(3840, 3940, 140, 90);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(3890, 3936, 55, 10);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(3890, 3936, 55, 10);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 8px "Share Tech Mono"';
  ctx.fillText("CRACKED MIRROR [E]", 3875, 3965);
  ctx.restore();
}

function drawPortalsAndEntities(dim) {
  // Friendly NPCs
  if (typeof Entities !== 'undefined' && Entities.friendlyNpcs) {
    (Entities.friendlyNpcs[dim] || []).forEach(n => {
      const bob = n.dancePhase !== undefined ? Math.sin((Date.now() / 150) + n.dancePhase) * 3.5 : 0;
      drawPixelCharacter(n.x, n.y + bob, n.coat, n.visor, n.pants, 'down', false, 0);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Share Tech Mono"';
      ctx.fillText(n.name, n.x - 12, n.y - 8);
    });
  }

  // Interactive Lore Cassettes Rendering
  if (window.State && Array.isArray(State.loreTapes)) {
    State.loreTapes.forEach(t => {
      if (t.dim === dim) {
        const isFound = State.userProfile && State.userProfile.discoveredLoreTapes && State.userProfile.discoveredLoreTapes.includes(t.id);
        const floatBob = Math.sin(Date.now() / 200 + t.x) * 4;

        ctx.save();
        ctx.fillStyle = isFound ? 'rgba(156, 163, 175, 0.35)' : 'rgba(245, 158, 11, 0.45)';
        ctx.beginPath();
        ctx.arc(t.x, t.y + floatBob, 14 + Math.sin(Date.now() / 150) * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isFound ? '#374151' : '#b45309';
        ctx.fillRect(t.x - 12, t.y - 8 + floatBob, 24, 16);
        ctx.strokeStyle = isFound ? '#9ca3af' : '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(t.x - 12, t.y - 8 + floatBob, 24, 16);

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(t.x - 5, t.y + floatBob, 3, 0, Math.PI * 2);
        ctx.arc(t.x + 5, t.y + floatBob, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isFound ? '#9ca3af' : '#facc15';
        ctx.font = 'bold 7px "Share Tech Mono"';
        ctx.textAlign = 'center';
        ctx.fillText("TAPE [E]", t.x, t.y - 12 + floatBob);
        ctx.restore();
      }
    });
  }

  // Boss Telegraphed Ground Warning Zones
  if (typeof Combat !== 'undefined' && Combat.telegraphs) {
    Combat.telegraphs.forEach(tg => {
      if (tg.dim !== dim) return;
      const pct = 1 - (tg.timer / tg.maxTimer);
      ctx.save();
      if (tg.type === 'molten_slam' || tg.type === 'orbital_strike') {
        ctx.fillStyle = tg.color;
        ctx.globalAlpha = 0.14 + pct * 0.24;
        ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.radius * pct, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = tg.color;
        ctx.lineWidth = 2.2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.arc(tg.x, tg.y, tg.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(tg.x - 12, tg.y); ctx.lineTo(tg.x + 12, tg.y);
        ctx.moveTo(tg.x, tg.y - 12); ctx.lineTo(tg.x, tg.y + 12);
        ctx.stroke();
      } else if (tg.type === 'rail_beam') {
        const endX = tg.x + Math.cos(tg.angle) * tg.length;
        const endY = tg.y + Math.sin(tg.angle) * tg.length;
        ctx.strokeStyle = tg.color;
        ctx.globalAlpha = 0.25 + pct * 0.45;
        ctx.lineWidth = tg.width * pct;
        ctx.beginPath(); ctx.moveTo(tg.x, tg.y); ctx.lineTo(endX, endY); ctx.stroke();
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(tg.x, tg.y); ctx.lineTo(endX, endY); ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Wasteland & Horizon Enemies (With White Hit-Flash)
  if ((dim === 'wasteland' || dim === 'horizon') && typeof Entities !== 'undefined' && Entities.hostileNpcs) {
    Entities.hostileNpcs.forEach(n => {
      if (!n.alive || (n.dim || 'wasteland') !== dim) return;
      const isHit = n.hitFlash > 0;
      const coatCol = isHit ? '#ffffff' : n.coat;
      const visorCol = isHit ? '#00f0ff' : n.visor;
      const pantsCol = isHit ? '#e2e8f0' : n.pants;

      if (n.tier === 'boss') {
        drawPixelCharacter(n.x, n.y, coatCol, visorCol, pantsCol, 'down', true, Date.now() * 0.02, 1.4, false);
        ctx.fillStyle = '#000'; ctx.fillRect(n.x - 25, n.y - 18, n.width + 50, 7);
        ctx.fillStyle = isHit ? '#ffffff' : '#ff003c';
        ctx.fillRect(n.x - 25, n.y - 18, (n.width + 50) * (n.hp / n.maxHp), 7);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(n.x - 25, n.y - 18, n.width + 50, 7);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Share Tech Mono"';
        ctx.fillText(n.name, n.x - 30, n.y - 22);
      } else if (n.tier === 'mid') {
        drawPixelCharacter(n.x, n.y, coatCol, visorCol, pantsCol, 'down', true, Date.now() * 0.02, 1.15, false);
        ctx.fillStyle = visorCol;
        ctx.fillRect(n.x - 3, n.y + 12, 4, 8);
        ctx.fillRect(n.x + n.width - 1, n.y + 12, 4, 8);
        ctx.fillStyle = '#ffffff'; ctx.font = '8px "Share Tech Mono"';
        ctx.fillText(n.name, n.x - 10, n.y - 6);
      } else {
        drawPixelCharacter(n.x, n.y, coatCol, visorCol, pantsCol, 'down', true, Date.now() * 0.02, 1.0, false);
      }
    });
  }

  // Loot Pickups (Coin, Rare Tape, Amber Vial)
  if (typeof Entities !== 'undefined' && Entities.lootPickups) {
    Entities.lootPickups.forEach(p => {
      const floatY = p.y + Math.sin(Date.now() / 180 + p.floatOffset) * 3;
      ctx.save();
      if (p.type === 'amber_vial') {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(p.x - 4, floatY - 6, 8, 12);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - 4, floatY - 6, 8, 12);
      } else if (p.type === 'rare_tape') {
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(p.x - 7, floatY - 5, 14, 10);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - 7, floatY - 5, 14, 10);
      } else {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(p.x, floatY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  // Muzzle Flashes
  if (typeof Combat !== 'undefined' && Combat.muzzleFlashes) {
    Combat.muzzleFlashes.forEach(mf => {
      ctx.save();
      ctx.translate(mf.x, mf.y);
      ctx.rotate(mf.angle);
      ctx.globalAlpha = mf.life / mf.maxLife;
      ctx.shadowColor = mf.color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(mf.radius * 1.4, 0);
      ctx.lineTo(-4, -mf.radius * 0.55);
      ctx.lineTo(0, 0);
      ctx.lineTo(-4, mf.radius * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  // Combat 2.0 Projectiles (Comet Ribbons & Orbiting Homing Sun)
  if (typeof Combat !== 'undefined' && Combat.projectiles) {
    Combat.projectiles.forEach(p => {
      ctx.save();
      const mainCol = p.color || '#00f0ff';
      const trailCol = p.trailColor || '#ec4899';
      ctx.shadowColor = mainCol;
      ctx.shadowBlur = p.isCharged ? 18 : 10;

      if (p.history && p.history.length > 1) {
        for (let h = 0; h < p.history.length - 1; h++) {
          const frac = (h + 1) / p.history.length;
          ctx.strokeStyle = h % 2 === 0 ? mainCol : trailCol;
          ctx.globalAlpha = frac * 0.75;
          ctx.lineWidth = Math.max(1.5, p.radius * 1.4 * frac);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.history[h].x, p.history[h].y);
          ctx.lineTo(p.history[h + 1].x, p.history[h + 1].y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1.0;

      if (p.isCharged) {
        const rot = Date.now() * 0.014;
        ctx.strokeStyle = trailCol;
        ctx.lineWidth = 2;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(rot);
        ctx.beginPath(); ctx.ellipse(0, 0, p.radius * 1.65, p.radius * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.rotate(Math.PI / 2);
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath(); ctx.ellipse(0, 0, p.radius * 1.45, p.radius * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = mainCol;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * 1.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }

  // Enemy Projectiles
  if (typeof Combat !== 'undefined' && Combat.enemyProjectiles) {
    Combat.enemyProjectiles.forEach(ep => {
      ctx.save();
      const epCol = ep.color || '#ff003c';
      ctx.shadowColor = epCol;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = epCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ep.x, ep.y);
      ctx.lineTo(ep.x - ep.vx * 1.8, ep.y - ep.vy * 1.8);
      ctx.stroke();
      ctx.fillStyle = epCol;
      ctx.beginPath(); ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(ep.x, ep.y, ep.radius * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }

  // Combat 2.0 Stylized Melee Slashes
  if (typeof Combat !== 'undefined' && Combat.meleeSlashes) {
    Combat.meleeSlashes.forEach(s => {
      const progress = 1 - (s.life / (s.maxLife || 12));
      const alpha = Math.min(1, (s.life / (s.maxLife || 12)) * 1.25);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 16;

      let baseAngle = Math.PI * 0.5;
      if (s.dir === 'up') baseAngle = -Math.PI * 0.5;
      else if (s.dir === 'down') baseAngle = Math.PI * 0.5;
      else if (s.dir === 'left') baseAngle = Math.PI;
      else if (s.dir === 'right') baseAngle = 0;

      if (s.type === 'stab_thrust') {
        ctx.translate(s.originX, s.originY);
        ctx.rotate(baseAngle);
        const reach = s.radius * (0.65 + progress * 0.65);

        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(reach * 0.45, -11 * (1 - progress * 0.4));
        ctx.lineTo(reach + 16, 0);
        ctx.lineTo(reach * 0.45, 11 * (1 - progress * 0.4));
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(reach * 0.5, -4.5);
        ctx.lineTo(reach + 10, 0);
        ctx.lineTo(reach * 0.5, 4.5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = s.secondaryColor || '#00f0ff';
        ctx.lineWidth = 2.5;
        for (let c = 0; c < 2; c++) {
          const cx = reach * (0.45 + c * 0.32);
          ctx.beginPath();
          ctx.moveTo(cx - 10, -16 + c * 3);
          ctx.lineTo(cx + 6, 0);
          ctx.lineTo(cx - 10, 16 - c * 3);
          ctx.stroke();
        }
      } else if (s.type === 'crescent_sweep') {
        drawTaperedCrescent(ctx, s.originX, s.originY, s.radius, baseAngle - 1.25 + progress * 0.35, baseAngle + 1.25 + progress * 0.35, 18 * (1 - progress * 0.35), s.color, '#ffffff');
        ctx.globalAlpha = alpha * 0.45;
        drawTaperedCrescent(ctx, s.originX, s.originY, s.radius * 0.78, baseAngle - 1.4, baseAngle + 1.1, 10, s.secondaryColor || '#00f0ff', s.color);
      } else if (s.type === 'spinning_vortex') {
        const spinRot = Date.now() * 0.024;
        for (let b = 0; b < 3; b++) {
          const aStart = spinRot + (b * Math.PI * 2) / 3;
          drawTaperedCrescent(ctx, s.x, s.y, s.radius, aStart, aStart + 1.35, 15, s.color, '#ffffff');
        }
        ctx.strokeStyle = s.secondaryColor || '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.radius * 0.52, 0, Math.PI * 2); ctx.stroke();
      } else if (s.type === 'ground_slam') {
        drawTaperedCrescent(ctx, s.originX, s.originY, s.radius, baseAngle - 1.45, baseAngle + 1.45, 24 * (1 - progress * 0.3), s.color, '#ffffff');
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        for (let f = -2; f <= 2; f++) {
          const fa = baseAngle + f * 0.35;
          ctx.beginPath();
          ctx.moveTo(s.originX, s.originY);
          ctx.lineTo(s.originX + Math.cos(fa) * (s.radius * 0.55), s.originY + Math.sin(fa) * (s.radius * 0.55) + 5);
          ctx.lineTo(s.originX + Math.cos(fa) * (s.radius * 1.05), s.originY + Math.sin(fa) * (s.radius * 1.05));
          ctx.stroke();
        }
      } else if (s.type === 'devastating_breaker') {
        const rot = Date.now() * 0.02;
        for (let b = 0; b < 4; b++) {
          const a0 = rot + (b * Math.PI) / 2;
          drawTaperedCrescent(ctx, s.x, s.y, s.radius * (0.7 + progress * 0.45), a0, a0 + 1.15, 18, s.color, '#ffffff');
        }
      }
      ctx.restore();
    });
  }

  // Explosions & 808 Sub-Bass Waveform Shockwaves
  if (typeof Combat !== 'undefined' && Combat.explosions) {
    Combat.explosions.forEach(exp => {
      const lifeRatio = exp.life / (exp.maxLife || 28);
      ctx.save();
      ctx.globalAlpha = Math.min(1, lifeRatio * 1.2);
      ctx.shadowColor = exp.color;
      ctx.shadowBlur = 16;

      if (exp.isSubWaveform) {
        ctx.strokeStyle = exp.color;
        ctx.lineWidth = 4.5 * lifeRatio;
        ctx.beginPath();
        const segments = 48;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const wave = Math.sin(theta * 12 + Date.now() * 0.04) * (9 * lifeRatio);
          const r = exp.radius + wave;
          const wx = exp.x + Math.cos(theta) * r;
          const wy = exp.y + Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * lifeRatio;
        ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius * 0.82, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.strokeStyle = exp.color;
        ctx.lineWidth = 5 * lifeRatio;
        ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Directional Hit-Sparks & Particle Streaks
  if (typeof Combat !== 'undefined' && Combat.particles) {
    Combat.particles.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.strokeStyle = pt.color;
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 8;
      ctx.lineWidth = pt.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x - pt.vx * 1.8, pt.y - pt.vy * 1.8);
      ctx.stroke();
      ctx.restore();
    });
  }

  // Anime X-Cross Impact Flashes
  if (typeof Combat !== 'undefined' && Combat.impactFlashes) {
    Combat.impactFlashes.forEach(fl => {
      const ratio = fl.life / fl.maxLife;
      ctx.save();
      ctx.translate(fl.x, fl.y);
      ctx.rotate(fl.angle);
      ctx.globalAlpha = ratio;
      ctx.shadowColor = fl.color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5 * ratio;
      const r = fl.radius * (1.2 - ratio * 0.3);
      ctx.beginPath();
      ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
      ctx.moveTo(0, -r); ctx.lineTo(0, r);
      ctx.stroke();
      ctx.restore();
    });
  }

  // Phase Dash Ghost Silhouettes
  if (typeof Combat !== 'undefined' && Combat.dashGhosts) {
    Combat.dashGhosts.forEach(dg => {
      ctx.save();
      ctx.globalAlpha = (dg.life / dg.maxLife) * 0.52;
      drawPixelCharacter(dg.x, dg.y, dg.coat, dg.visor, dg.pants, dg.dir || 'down', false, 0, 1.0, false);
      ctx.restore();
    });
  }

  if (typeof Combat !== 'undefined' && Combat.renderDamageNumbers) {
    Combat.renderDamageNumbers(ctx);
  }

  // Player & Gross Beat Motion-Blur Echoes
  if (typeof Entities !== 'undefined' && Entities.player) {
    const p = Entities.player;
    const skinId = State.userProfile && State.userProfile.activeSkin ? State.userProfile.activeSkin : 'enforcer';
    const currentSkin = (State.SKINS_DATA || []).find(s => s.id === skinId) || (State.SKINS_DATA ? State.SKINS_DATA[0] : { coat: '#090b10', visor: '#00f0ff', pants: '#06080c' });

    const hasGrossBeat = window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_gross_beat');
    if (hasGrossBeat && p.isMoving) {
      playerEchoTrail.push({ x: p.x, y: p.y, dir: p.direction, life: 8 });
      if (playerEchoTrail.length > 5) playerEchoTrail.shift();
    }

    for (let i = playerEchoTrail.length - 1; i >= 0; i--) {
      const echo = playerEchoTrail[i];
      echo.life--;
      if (echo.life <= 0) {
        playerEchoTrail.splice(i, 1);
      } else {
        ctx.save();
        ctx.globalAlpha = (echo.life / 10) * 0.35;
        drawPixelCharacter(echo.x, echo.y, '#00f0ff', '#a855f7', currentSkin.pants, echo.dir || 'down', false, 0, 1.0);
        ctx.restore();
      }
    }

    if ((p.iFrames || 0) % 4 < 2) {
      drawPixelCharacter(p.x, p.y, currentSkin.coat, currentSkin.visor, currentSkin.pants, p.direction || 'down', p.isMoving || false, p.animTimer || 0, 1.0, true);
      const lvl = (State.userProfile && State.userProfile.level) ? State.userProfile.level : 1;
      const handleStr = (State.userProfile && State.userProfile.handle) ? State.userProfile.handle : "UNREGISTERED";
      renderPlayerCallsign(ctx, p.x, p.y, handleStr, lvl);
    }
  }
}

function drawTaperedCrescent(ctx, cx, cy, radius, startAngle, endAngle, thickness, outerColor, coreColor) {
  const steps = 18;
  const outerPts = [];
  const innerPts = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + (endAngle - startAngle) * t;
    const profile = Math.sin(t * Math.PI);
    const rOuter = radius + (thickness * 0.45) * profile;
    const rInner = radius - (thickness * 0.55) * profile;
    outerPts.push({ x: cx + Math.cos(angle) * rOuter, y: cy + Math.sin(angle) * rOuter });
    innerPts.push({ x: cx + Math.cos(angle) * rInner, y: cy + Math.sin(angle) * rInner });
  }

  ctx.fillStyle = outerColor;
  ctx.beginPath();
  ctx.moveTo(outerPts[0].x, outerPts[0].y);
  for (let i = 1; i <= steps; i++) ctx.lineTo(outerPts[i].x, outerPts[i].y);
  for (let i = steps; i >= 0; i--) ctx.lineTo(innerPts[i].x, innerPts[i].y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = coreColor || '#ffffff';
  ctx.lineWidth = Math.max(1.8, thickness * 0.24);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle + 0.12, endAngle - 0.12);
  ctx.stroke();
}

function drawCombatStyleHud() {
  if (!window.Combat || typeof Combat.getStyleRankInfo !== 'function') return;
  const info = Combat.getStyleRankInfo();
  const now = Date.now();
  const dashRem = Math.max(0, Combat.dashCooldown - now);
  const dashPct = 1 - Math.min(1, dashRem / (Combat.DASH_COOLDOWN_MS || 850));
  const beatActive = (now - (Combat.lastBeatSyncTime || 0)) < 450;

  const isMobile = canvas.width < 640;
  const headerBottom = (document.querySelector('header')?.offsetHeight || 50) + 6;
  const wx = 8;
  const wy = headerBottom;
  const boxW = isMobile ? 136 : 156;
  const barW = boxW - 14;

  ctx.save();
  ctx.fillStyle = 'rgba(7, 10, 18, 0.86)';
  ctx.fillRect(wx, wy, boxW, Combat.stylePoints > 0 ? 52 : 24);
  ctx.strokeStyle = Combat.stylePoints > 0 ? info.color : 'rgba(0, 240, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(wx, wy, boxW, Combat.stylePoints > 0 ? 52 : 24);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 8px "Share Tech Mono"';
  ctx.fillText(dashPct >= 1 ? "DASH [SPC]: READY" : "DASH: RECHARGING", wx + 7, wy + 11);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(wx + 7, wy + 15, barW, 4);
  ctx.fillStyle = dashPct >= 1 ? '#00f0ff' : '#a855f7';
  ctx.fillRect(wx + 7, wy + 15, barW * dashPct, 4);

  if (Combat.stylePoints > 0) {
    ctx.fillStyle = info.color;
    ctx.font = isMobile ? 'bold 10px "Chakra Petch"' : 'bold 11px "Chakra Petch"';
    ctx.fillText(`RANK: ${info.rank}`, wx + 7, wy + 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px "Share Tech Mono"';
    ctx.fillText(`${Combat.comboHits} HIT // ${info.mult.toFixed(2)}x🪙`, wx + 7, wy + 46);

    if (beatActive) {
      ctx.fillStyle = '#facc15';
      ctx.fillText("🎵 BEAT!", wx + boxW - 44, wy + 46);
    }
  }
  ctx.restore();
}

// Dossier Section 7 Step 4: Render Level Tag in Overhead Player Callsign
function renderPlayerCallsign(ctx, px, py, handle, level = 1) {
  ctx.save();

  const headCenterX = px + 13;
  const tagY = py - 10;

  ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const cleanHandle = (handle || "UNREGISTERED").toUpperCase();
  const text = `[LVL ${level}] ${cleanHandle}`;
  const textWidth = ctx.measureText(text).width;
  const paddingX = 6;
  const pillHeight = 14;
  const pillY = tagY - pillHeight - 2;

  const isHypercharged = window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0;
  const isOverdrive = window.State && State.userProfile && State.userProfile.djOverdriveTimer > 0;
  const borderColor = isHypercharged ? '#f59e0b' : (isOverdrive ? '#ec4899' : '#00f0ff');

  ctx.fillStyle = 'rgba(7, 8, 11, 0.88)';
  ctx.fillRect(headCenterX - (textWidth / 2) - paddingX, pillY, textWidth + (paddingX * 2), pillHeight);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(headCenterX - (textWidth / 2) - paddingX, pillY, textWidth + (paddingX * 2), pillHeight);

  ctx.fillStyle = borderColor;
  ctx.beginPath();
  ctx.moveTo(headCenterX - 3, pillY + pillHeight);
  ctx.lineTo(headCenterX + 3, pillY + pillHeight);
  ctx.lineTo(headCenterX, pillY + pillHeight + 3);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, headCenterX, tagY - 2);

  ctx.restore();
}

function drawPixelCharacter(px, py, coatColor, visorColor, pantsColor, direction, isMoving, animTimer, scale = 1.0, isPlayer = false) {
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);

  const walkBob = isMoving ? Math.sin(animTimer * 0.35) * 3 : 0;
  const legOffset = isMoving ? Math.sin(animTimer * 0.35) * 4 : 0;

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(13, 37, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Player Charge Aura Vortex & Spiraling Particles
  if (isPlayer && typeof Combat !== 'undefined' && (Combat.isHoldingSlash || Combat.isChargingShoot)) {
    const startT = Combat.isHoldingSlash ? Combat.slashHoldStartTime : Combat.shootChargeStartTime;
    const holdSec = (Date.now() - startT) / 1000;
    if (holdSec >= 0.15) {
      const auraCol = holdSec >= 1.4 ? '#a855f7' : (holdSec >= 0.7 ? '#facc15' : visorColor);
      ctx.strokeStyle = auraCol;
      ctx.lineWidth = holdSec >= 1.4 ? 3 : 2;
      ctx.beginPath();
      ctx.arc(13, 18, 22 + Math.sin(Date.now() / 45) * 4, 0, Math.PI * 2);
      ctx.stroke();

      // Inward Spiraling Energy Motes
      for (let m = 0; m < 4; m++) {
        const angle = (Date.now() * 0.008) + (m * Math.PI) / 2;
        const dist = 16 + ((Date.now() * 0.05 + m * 8) % 14);
        ctx.fillStyle = m % 2 === 0 ? '#ffffff' : auraCol;
        ctx.fillRect(13 + Math.cos(angle) * dist - 1.5, 18 + Math.sin(angle) * dist - 1.5, 3, 3);
      }
    }
  }

  ctx.fillStyle = pantsColor;
  ctx.fillRect(5, 26 + legOffset, 6, 11 - legOffset);
  ctx.fillRect(15, 26 - legOffset, 6, 11 + legOffset);
  ctx.fillStyle = '#000';
  ctx.fillRect(4, 34 + legOffset, 7, 4);
  ctx.fillRect(15, 34 - legOffset, 7, 4);

  ctx.fillStyle = coatColor;
  ctx.fillRect(3, 12 + walkBob, 20, 18);
  if (direction === 'up') ctx.fillRect(4, 28 + walkBob, 18, 6);
  else if (direction === 'left') ctx.fillRect(16, 24 + walkBob, 8, 8);
  else if (direction === 'right') ctx.fillRect(2, 24 + walkBob, 8, 8);

  ctx.fillStyle = '#090b10';
  ctx.beginPath(); ctx.arc(13, 7 + walkBob, 9, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = visorColor;
  if (direction === 'down') ctx.fillRect(8, 6 + walkBob, 10, 3);
  else if (direction === 'left') ctx.fillRect(5, 6 + walkBob, 6, 3);
  else if (direction === 'right') ctx.fillRect(15, 6 + walkBob, 6, 3);
  else if (direction === 'up') ctx.fillRect(10, 3 + walkBob, 6, 2);

  // Visible Cyber-Katana / Glaive Flash in Hand During Attacks
  if (isPlayer && typeof Combat !== 'undefined' && (Date.now() - (Combat.lastWeaponSwingTime || 0)) < 220) {
    ctx.save();
    ctx.translate(13, 18 + walkBob);
    const swingAngle = ((Date.now() - Combat.lastWeaponSwingTime) / 220) * Math.PI * 0.85;
    let dirBase = 0;
    if (direction === 'down') dirBase = Math.PI * 0.5;
    else if (direction === 'up') dirBase = -Math.PI * 0.5;
    else if (direction === 'left') dirBase = Math.PI;
    ctx.rotate(dirBase - 0.4 + swingAngle);
    ctx.shadowColor = Combat.lastWeaponColor || visorColor;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(26, 0); ctx.stroke();
    ctx.strokeStyle = Combat.lastWeaponColor || visorColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(6, -1.5); ctx.lineTo(28, 0); ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function drawPortal(px, py, color1, color2, label) {
  const time = Date.now() / 250;
  ctx.save();
  ctx.translate(px + 40, py + 40);
  ctx.strokeStyle = color1; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.arc(0, 0, 30 + Math.sin(time) * 4, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color2; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 20 + Math.cos(time) * 4, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText(label, px - 15, py + 95);
}

function gameLoop() {
  // Hit-Stop Micro-Freeze for Heavy Impacts & Parries
  if (typeof Combat !== 'undefined' && Combat.hitStopFrames > 0) {
    Combat.hitStopFrames--;
    draw();
    requestAnimationFrame(gameLoop);
    return;
  }

  if (typeof Entities !== 'undefined' && Entities.update) Entities.update();
  if (typeof Combat !== 'undefined' && Combat.update) Combat.update();

  if (window.State && State.DIMENSIONS && State.currentDimension) {
    const cfg = State.DIMENSIONS[State.currentDimension];
    if (cfg && typeof Entities !== 'undefined' && Entities.player) {
      const zoom = getEffectiveCameraZoom();
      camera.zoom = zoom;
      camera.width = canvas.width / zoom;
      camera.height = canvas.height / zoom;

      const isMobilePortrait = canvas.width < 640 && canvas.height > canvas.width;
      const verticalBias = isMobilePortrait ? 0.43 : 0.50;

      const targetX = (Entities.player.x + (Entities.player.width || 26) / 2) - camera.width * 0.50;
      const targetY = (Entities.player.y + (Entities.player.height || 38) / 2) - camera.height * verticalBias;

      if (camera.width >= cfg.width) {
        camera.x = (cfg.width - camera.width) / 2;
      } else {
        camera.x += (targetX - camera.x) * 0.14;
        camera.x = Math.max(0, Math.min(cfg.width - camera.width, camera.x));
      }

      if (camera.height >= cfg.height) {
        camera.y = (cfg.height - camera.height) / 2;
      } else {
        camera.y += (targetY - camera.y) * 0.14;
        camera.y = Math.max(0, Math.min(cfg.height - camera.height, camera.y));
      }
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

window.onload = function() {
  resizeCanvas();
  if (window.State && typeof State.init === 'function') State.init();
  if (window.Input && typeof Input.init === 'function') Input.init();
  if (window.Entities && typeof Entities.init === 'function') Entities.init();
  gameLoop();
};
