const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const camera = { x: 0, y: 0, width: 800, height: 600 };

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

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  camera.width = canvas.width;
  camera.height = canvas.height;
}
window.addEventListener('resize', resizeCanvas);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Screen Shake Offset
  let shakeX = 0, shakeY = 0;
  if (State.screenShake.duration > 0) {
    shakeX = (Math.random() - 0.5) * State.screenShake.intensity;
    shakeY = (Math.random() - 0.5) * State.screenShake.intensity;
    State.screenShake.duration--;
  }

  ctx.translate(-Math.floor(camera.x) + shakeX, -Math.floor(camera.y) + shakeY);

  if (State.currentDimension === 'underground') drawUnderground();
  else if (State.currentDimension === 'retrocade') drawRetrocade();
  else drawWasteland();

  ctx.restore();

  if (State.currentDimension === 'wasteland') {
    drawRainOverlay();
  }
}

// 1. LIGHTER UNDERGROUND NIGHT SHIFT (2400 x 1200)
function drawUnderground() {
  ctx.fillStyle = '#161d2f'; ctx.fillRect(0, 0, 2400, 1200);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)'; ctx.lineWidth = 1;
  for (let x = 0; x < 2400; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1200); ctx.stroke(); }
  for (let y = 0; y < 1200; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2400, y); ctx.stroke(); }

  ctx.fillStyle = '#222b40';
  Dimensions.undergroundObstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.strokeStyle = '#384869'; ctx.lineWidth = 2; ctx.strokeRect(o.x, o.y, o.width, o.height);
  });

  // West Bay: Trunk Pop Vehicle
  ctx.fillStyle = '#1e293b'; ctx.fillRect(180, 200, 150, 75);
  ctx.fillStyle = '#ff003c'; ctx.fillRect(185, 265, 20, 6); ctx.fillRect(305, 265, 20, 6);
  ctx.fillStyle = '#334155'; ctx.fillRect(210, 180, 90, 25);
  ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("TRUNK POP // MERCH", 195, 235);

  // North Central: Studio Mastering Suite
  ctx.fillStyle = '#1e2030'; ctx.fillRect(825, 45, 470, 300);
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 11px "Chakra Petch"';
  ctx.fillText("DISCOGRAPHY VAULT // MASTERING SUITE", 860, 90);

  // East Bay: Arcade Row
  const arcadeTitles = ['VOID INVADERS', 'GRID RUNNER', 'LOWLIFE LEAP'];
  arcadeTitles.forEach((title, idx) => {
    ctx.fillStyle = '#312e81'; ctx.fillRect(1650 + idx * 150, 120, 70, 70);
    ctx.strokeStyle = '#00f0ff'; ctx.strokeRect(1650 + idx * 150, 120, 70, 70);
    ctx.fillStyle = '#facc15'; ctx.fillRect(1658 + idx * 150, 128, 54, 30);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px "Chakra Petch"';
    ctx.fillText(title, 1655 + idx * 150, 175);
  });

  drawPortalsAndEntities('underground');
}

// 2. LIGHTER 3-ROOM RETROCADE / NIRVANA COMPLEX (2400 x 1200)
function drawRetrocade() {
  ctx.fillStyle = '#24143a'; ctx.fillRect(0, 0, 2400, 1200);

  ctx.strokeStyle = 'rgba(236, 72, 153, 0.12)'; ctx.lineWidth = 1;
  for (let x = 0; x < 2400; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1200); ctx.stroke(); }
  for (let y = 0; y < 1200; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2400, y); ctx.stroke(); }

  ctx.fillStyle = '#3b1d5c';
  Dimensions.retrocadeObstacles.forEach(o => {
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2; ctx.strokeRect(o.x, o.y, o.width, o.height);
  });

  // VISIBLE DJ STAGE BARRIER WALL
  ctx.fillStyle = 'rgba(168, 85, 247, 0.35)'; ctx.fillRect(920, 240, 560, 25);
  ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3; ctx.strokeRect(920, 240, 560, 25);
  for (let s = 920; s < 1480; s += 20) {
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(s, 240); ctx.lineTo(s + 12, 265); ctx.stroke();
  }
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("▲ ACOUSTIC SECURITY WALL ▲", 1100, 257);

  // Dance Floor (10x8 matrix)
  const colors = ['#ec4899', '#00f0ff', '#a855f7', '#facc15'];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = colors[(i + j + AudioEngine.bgmStepIndex) % colors.length];
      ctx.globalAlpha = 0.42;
      ctx.fillRect(980 + i * 42, 420 + j * 40, 38, 36);
      ctx.globalAlpha = 1.0;
    }
  }

  // DJ Stage & Animated Visualizer
  ctx.fillStyle = '#4c1d95'; ctx.fillRect(1060, 140, 280, 80);
  ctx.strokeStyle = '#f43f5e'; ctx.strokeRect(1060, 140, 280, 80);
  for (let b = 0; b < 16; b++) {
    const barH = 10 + Math.sin((Date.now() / 120) + b) * 16 + (AudioEngine.isBgmPlaying ? 12 : 0);
    ctx.fillStyle = b % 2 === 0 ? '#00f0ff' : '#ec4899';
    ctx.fillRect(1080 + b * 15, 140 - barH, 10, barH);
  }

  // Room 2 (West): Music Kiosk Lounge
  ctx.fillStyle = '#1e1430'; ctx.fillRect(60, 60, 580, 1050);
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 12px "Chakra Petch"';
  ctx.fillText("NIRVANA // CLUB LOWLIFE MUSIC KIOSK", 160, 100);
  ctx.fillStyle = '#431407'; ctx.fillRect(260, 220, 160, 90);
  ctx.strokeStyle = '#f97316'; ctx.strokeRect(260, 220, 160, 90);
  ctx.fillStyle = '#fed7aa'; ctx.font = 'bold 10px "Share Tech Mono"';
  ctx.fillText("🎵 MUSIC STEM KIOSK", 280, 270);

  // Room 3 (East): High-Stakes Cyber Casino
  ctx.fillStyle = '#1e1430'; ctx.fillRect(1770, 60, 560, 1050);
  ctx.fillStyle = '#facc15'; ctx.font = 'bold 12px "Chakra Petch"';
  ctx.fillText("HIGH-STAKES CASINO // DISTRICT 84", 1900, 100);
  ctx.fillStyle = '#581c87'; ctx.fillRect(1880, 180, 130, 70);
  ctx.strokeStyle = '#c084fc'; ctx.strokeRect(1880, 180, 130, 70);
  ctx.fillStyle = '#facc15'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("🎰 3-REEL CLASSIC (5🪙)", 1888, 220);
  ctx.fillStyle = '#713f12'; ctx.fillRect(2120, 180, 150, 70);
  ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2; ctx.strokeRect(2120, 180, 150, 70);
  ctx.fillStyle = '#fef08a'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("💎 5-LANE HIGH ROLLER (25🪙)", 2125, 220);

  drawPortalsAndEntities('retrocade');
}

// 3. LIGHTER RAINY ASHEN WASTELAND (6400 x 4800)
function drawWasteland() {
  ctx.fillStyle = '#181f2c'; ctx.fillRect(0, 0, 6400, 4800);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)'; ctx.lineWidth = 1;
  for (let x = 0; x < 6400; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 4800); ctx.stroke(); }
  for (let y = 0; y < 4800; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(6400, y); ctx.stroke(); }

  Dimensions.environmentalHazards.forEach(h => {
    ctx.fillStyle = '#166534'; ctx.fillRect(h.x, h.y, h.width, h.height);
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.strokeRect(h.x, h.y, h.width, h.height);
  });

  Dimensions.worldObstacles.forEach(o => {
    ctx.fillStyle = '#222d3d'; ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.strokeStyle = '#384860'; ctx.lineWidth = 2; ctx.strokeRect(o.x, o.y, o.width, o.height);
    if (o.label) {
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 11px "Share Tech Mono"';
      ctx.fillText(o.label, o.x + 15, o.y + 25);
    }
  });

  Dimensions.destructibleDoors.forEach(d => {
    if (!d.shattered) {
      ctx.fillStyle = '#4c0519'; ctx.fillRect(d.x, d.y, d.width, d.height);
      ctx.strokeStyle = '#ff003c'; ctx.lineWidth = 2.5; ctx.strokeRect(d.x, d.y, d.width, d.height);
      ctx.fillStyle = '#ff003c'; ctx.font = 'bold 9px "Share Tech Mono"';
      ctx.fillText(`BREACH [${d.hp} HP]`, d.x + 8, d.y + 20);
    }
  });

  drawHoldingChamberInterior();

  Dimensions.wastelandChests.forEach(c => {
    ctx.fillStyle = c.opened ? '#334155' : (c.type === 'master_holding' ? '#701a75' : '#047857');
    ctx.fillRect(c.x, c.y, c.width, c.height);
    ctx.strokeStyle = c.type === 'master_holding' ? '#facc15' : '#00f0ff';
    ctx.lineWidth = 2; ctx.strokeRect(c.x, c.y, c.width, c.height);
  });

  drawPortal(3120, 150, '#10b981', '#facc15', "NEURAL EXTRACTION GATE [50 TAPES]");

  drawPortalsAndEntities('wasteland');
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
}

// RENDERING FOR CHARACTERS, HOMING TRAILS, & DISTINCT 4-HIT SLASH ANIMATIONS
function drawPortalsAndEntities(dim) {
  // Friendly NPCs
  (Entities.friendlyNpcs[dim] || []).forEach(n => {
    const bob = n.dancePhase !== undefined ? Math.sin((Date.now() / 150) + n.dancePhase) * 3.5 : 0;
    drawPixelCharacter(n.x, n.y + bob, n.coat, n.visor, n.pants, 'down', false, 0);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Share Tech Mono"';
    ctx.fillText(n.name, n.x - 12, n.y - 8);
  });

  // Wasteland Enemies
  if (dim === 'wasteland') {
    Entities.hostileNpcs.forEach(n => {
      if (!n.alive) return;
      if (n.tier === 'boss') {
        drawPixelCharacter(n.x, n.y, n.coat, n.visor, n.pants, 'down', true, 0, 1.4);
        ctx.fillStyle = '#000'; ctx.fillRect(n.x - 25, n.y - 18, n.width + 50, 7);
        ctx.fillStyle = '#ff003c'; ctx.fillRect(n.x - 25, n.y - 18, (n.width + 50) * (n.hp / n.maxHp), 7);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(n.x - 25, n.y - 18, n.width + 50, 7);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Share Tech Mono"';
        ctx.fillText(n.name, n.x - 30, n.y - 22);
      } else if (n.tier === 'mid') {
        drawPixelCharacter(n.x, n.y, n.coat, n.visor, n.pants, 'down', true, 0, 1.15);
        ctx.fillStyle = n.visor;
        ctx.fillRect(n.x - 3, n.y + 12, 4, 8);
        ctx.fillRect(n.x + n.width - 1, n.y + 12, 4, 8);
        ctx.fillStyle = '#ffffff'; ctx.font = '8px "Share Tech Mono"';
        ctx.fillText(n.name, n.x - 10, n.y - 6);
      } else {
        drawPixelCharacter(n.x, n.y, n.coat, n.visor, n.pants, 'down', true, 0, 1.0);
      }
    });
  }

  // Loot Pickups
  Entities.lootPickups.forEach(p => {
    ctx.fillStyle = p.type === 'coin' ? '#facc15' : '#eab308';
    ctx.beginPath(); ctx.arc(p.x, p.y + Math.sin(Date.now() / 180 + p.floatOffset) * 3, p.radius, 0, Math.PI * 2); ctx.fill();
  });

  // Homing Projectiles with Glow Trail
  Combat.projectiles.forEach(p => {
    ctx.save();
    // Glowing homing speed tail
    ctx.strokeStyle = p.color || '#00f0ff';
    ctx.lineWidth = p.isCharged ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
    ctx.stroke();

    // Projectile Head
    ctx.fillStyle = p.color || '#00f0ff';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  // Enemy Projectiles
  Combat.enemyProjectiles.forEach(ep => {
    ctx.fillStyle = '#ff003c';
    ctx.beginPath(); ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2); ctx.fill();
  });

  // DISTINCT PROCEDURAL 4-HIT SLASH ANIMATIONS
  Combat.meleeSlashes.forEach(s => {
    ctx.save();
    ctx.strokeStyle = s.color;

    if (s.type === 'stab_thrust') {
      // ANIMATION 1: Piercing Forward Needle Beam
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.originX, s.originY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      // Thrust impact spark diamond
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.type === 'crescent_sweep') {
      // ANIMATION 2: Wide Curved Crescent Arc
      ctx.lineWidth = 5;
      ctx.beginPath();
      let sa = 0, ea = Math.PI;
      if (s.dir === 'up') { sa = Math.PI * 1.1; ea = Math.PI * 1.9; }
      else if (s.dir === 'down') { sa = Math.PI * 0.1; ea = Math.PI * 0.9; }
      else if (s.dir === 'left') { sa = Math.PI * 0.6; ea = Math.PI * 1.4; }
      else if (s.dir === 'right') { sa = -Math.PI * 0.4; ea = Math.PI * 0.4; }
      ctx.arc(s.x, s.y, s.radius, sa, ea);
      ctx.stroke();
    } else if (s.type === 'spinning_vortex') {
      // ANIMATION 3: 360-Degree Dual Vortex Disc
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.arc(s.x, s.y, s.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (s.type === 'ground_slam') {
      // ANIMATION 4: Heavy Overhead Dimensional Fissure Cleave
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(s.originX, s.originY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      // Expanding wedge cross-line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x - 20, s.y - 10);
      ctx.lineTo(s.x + 20, s.y + 10);
      ctx.stroke();
    } else if (s.type === 'devastating_breaker') {
      // DEVASTATING 1.5s FULL CHARGE: 360 Cosmic Purple Lightning Wave
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      // Inner pulsating core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  });

  // Explosions
  Combat.explosions.forEach(exp => {
    ctx.save();
    ctx.strokeStyle = exp.color;
    ctx.lineWidth = 4 * (exp.life / 25);
    ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  });

  // Player Character
  const p = Entities.player;
  const currentSkin = State.SKINS_DATA.find(s => s.id === State.userProfile.activeSkin) || State.SKINS_DATA[0];
  if (p.iFrames % 4 < 2) {
    drawPixelCharacter(p.x, p.y, currentSkin.coat, currentSkin.visor, currentSkin.pants, p.direction, p.isMoving, p.animTimer, 1.0);
  }
}

// PIXEL CHARACTER ENGINE WITH CHARGE PROGRESSION AURA
function drawPixelCharacter(px, py, coatColor, visorColor, pantsColor, direction, isMoving, animTimer, scale = 1.0) {
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);

  const walkBob = isMoving ? Math.sin(animTimer * 0.35) * 3 : 0;
  const legOffset = isMoving ? Math.sin(animTimer * 0.35) * 4 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(13, 37, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

  // CHARGE AURAS (ANYTIME CHARGE UP TO 1.5s)
  if (Combat.isHoldingSlash) {
    const holdSec = (Date.now() - Combat.slashHoldStartTime) / 1000;
    if (holdSec >= 1.5) {
      // Radiant Cosmic Purple Aura (Fully Charged)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(13, 18, 30 + Math.sin(Date.now() / 50) * 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (holdSec >= 0.7) {
      // Molten Orange Aura
      ctx.strokeStyle = '#ff7700';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(13, 18, 25 + Math.sin(Date.now() / 70) * 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (holdSec >= 0.2) {
      // Early Cyan Aura
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(13, 18, 22, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Combat Boots & Legs
  ctx.fillStyle = pantsColor;
  ctx.fillRect(5, 26 + legOffset, 6, 11 - legOffset);
  ctx.fillRect(15, 26 - legOffset, 6, 11 + legOffset);
  ctx.fillStyle = '#000';
  ctx.fillRect(4, 34 + legOffset, 7, 4);
  ctx.fillRect(15, 34 - legOffset, 7, 4);

  // Heavy Trench Duster
  ctx.fillStyle = coatColor;
  ctx.fillRect(3, 12 + walkBob, 20, 18);
  if (direction === 'up') ctx.fillRect(4, 28 + walkBob, 18, 6);
  else if (direction === 'left') ctx.fillRect(16, 24 + walkBob, 8, 8);
  else if (direction === 'right') ctx.fillRect(2, 24 + walkBob, 8, 8);

  // Tactical Mask & Visor
  ctx.fillStyle = '#090b10';
  ctx.beginPath(); ctx.arc(13, 7 + walkBob, 9, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = visorColor;
  if (direction === 'down') ctx.fillRect(8, 6 + walkBob, 10, 3);
  else if (direction === 'left') ctx.fillRect(5, 6 + walkBob, 6, 3);
  else if (direction === 'right') ctx.fillRect(15, 6 + walkBob, 6, 3);
  else if (direction === 'up') ctx.fillRect(10, 3 + walkBob, 6, 2);

  ctx.restore();
}

function drawPortal(px, py, color1, color2, label) {
  const time = Date.now() / 250;
  ctx.save(); ctx.translate(px + 40, py + 40);
  ctx.strokeStyle = color1; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.arc(0, 0, 30 + Math.sin(time) * 4, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color2; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 20 + Math.cos(time) * 4, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText(label, px - 15, py + 95);
}

function gameLoop() {
  Entities.update();
  Combat.update();

  const cfg = State.DIMENSIONS[State.currentDimension];
  const targetX = Entities.player.x - camera.width / 2;
  const targetY = Entities.player.y - camera.height / 2;

  camera.x += (targetX - camera.x) * 0.12;
  camera.y += (targetY - camera.y) * 0.12;
  camera.x = Math.max(0, Math.min(cfg.width - camera.width, camera.x));
  camera.y = Math.max(0, Math.min(cfg.height - camera.height, camera.y));

  draw();
  requestAnimationFrame(gameLoop);
}

window.onload = function() {
  resizeCanvas();
  State.init();
  Input.init();
  Entities.init();
  gameLoop();
};
