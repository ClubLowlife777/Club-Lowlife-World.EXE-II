const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const camera = { x: 0, y: 0, width: 800, height: 600 };

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
}

function drawUnderground() {
  ctx.fillStyle = '#080a0f'; ctx.fillRect(0, 0, 1600, 1000);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)'; ctx.lineWidth = 1;
  for (let x = 0; x < 1600; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1000); ctx.stroke(); }
  for (let y = 0; y < 1000; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1600, y); ctx.stroke(); }

  // Walls
  ctx.fillStyle = '#1b2233';
  Dimensions.undergroundObstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));

  // Trunk Pop Vehicle
  ctx.fillStyle = '#111827'; ctx.fillRect(180, 720, 140, 70);
  ctx.fillStyle = '#ff003c'; ctx.fillRect(185, 780, 20, 6); ctx.fillRect(295, 780, 20, 6); // Tail lights
  // Hydraulic Popped Trunk Lid[cite: 6]
  ctx.fillStyle = '#1f2937'; ctx.fillRect(205, 700, 90, 25);
  ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 9px "Share Tech Mono"';
  ctx.fillText("TRUNK POP // MERCH[cite: 2, 6]", 195, 745);

  // Arcade Alley
  const arcadeTitles = ['VOID INVADERS', 'GRID RUNNER', 'LOWLIFE LEAP'];
  arcadeTitles.forEach((title, idx) => {
    ctx.fillStyle = '#1e1b4b'; ctx.fillRect(500 + idx * 120, 60, 70, 70);
    ctx.strokeStyle = '#00f0ff'; ctx.strokeRect(500 + idx * 120, 60, 70, 70);
    ctx.fillStyle = '#facc15'; ctx.fillRect(508 + idx * 120, 68, 54, 30); // CRT screen
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px "Chakra Petch"';
    ctx.fillText(title, 505 + idx * 120, 115);
  });

  drawPortalsAndEntities('underground');
}

function drawRetrocade() {
  ctx.fillStyle = '#120524'; ctx.fillRect(0, 0, 1600, 1000);

  // Audio-Reactive Dance Floor (8x8)
  const colors = ['#ec4899', '#00f0ff', '#a855f7', '#facc15'];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = colors[(i + j + AudioEngine.bgmStepIndex) % colors.length];
      ctx.globalAlpha = 0.35;
      ctx.fillRect(650 + i * 38, 450 + j * 38, 35, 35);
      ctx.globalAlpha = 1.0;
    }
  }

  // DJ Stage & Live Visualizer Bars
  ctx.fillStyle = '#2e1065'; ctx.fillRect(710, 170, 180, 75);
  ctx.strokeStyle = '#ec4899'; ctx.strokeRect(710, 170, 180, 75);

  // Animated Visualizer Columns
  for (let b = 0; b < 12; b++) {
    const barH = 10 + Math.sin((Date.now() / 120) + b) * 16 + (AudioEngine.isBgmPlaying ? 12 : 0);
    ctx.fillStyle = b % 2 === 0 ? '#00f0ff' : '#ec4899';
    ctx.fillRect(725 + b * 12, 175 - barH, 8, barH);
  }

  // Turntables
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(750, 205, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(850, 205, 14, 0, Math.PI * 2); ctx.fill();

  // Casino Slots Bank
  ctx.fillStyle = '#3b1a03'; ctx.fillRect(1080, 130, 160, 65);
  ctx.strokeStyle = '#facc15'; ctx.strokeRect(1080, 130, 160, 65);
  ctx.fillStyle = '#facc15'; ctx.font = '10px "Share Tech Mono"';
  ctx.fillText("🎰 CYBER SLOTS (5🪙)", 1095, 165);

  drawPortalsAndEntities('retrocade');
}

function drawWasteland() {
  ctx.fillStyle = '#07090e'; ctx.fillRect(0, 0, 6400, 4800);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)'; ctx.lineWidth = 1;
  for (let x = 0; x < 6400; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 4800); ctx.stroke(); }
  for (let y = 0; y < 4800; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(6400, y); ctx.stroke(); }

  // Toxic Chemical Sludge Pools
  Dimensions.environmentalHazards.forEach(h => {
    ctx.fillStyle = '#14532d'; ctx.fillRect(h.x, h.y, h.width, h.height);
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.strokeRect(h.x, h.y, h.width, h.height);
  });

  // Obstacles & Buildings
  Dimensions.worldObstacles.forEach(o => {
    ctx.fillStyle = '#0e121b'; ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.strokeStyle = '#262c3d'; ctx.lineWidth = 1.5; ctx.strokeRect(o.x, o.y, o.width, o.height);
    if (o.label) {
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px "Share Tech Mono"';
      ctx.fillText(o.label, o.x + 15, o.y + 25);
    }
  });

  // Destructible Doors
  Dimensions.destructibleDoors.forEach(d => {
    if (!d.shattered) {
      ctx.fillStyle = '#3f0c10'; ctx.fillRect(d.x, d.y, d.width, d.height);
      ctx.strokeStyle = '#ff003c'; ctx.lineWidth = 2.5; ctx.strokeRect(d.x, d.y, d.width, d.height);
      ctx.fillStyle = '#ff003c'; ctx.font = 'bold 9px "Share Tech Mono"';
      ctx.fillText(`BREACH [${d.hp} HP]`, d.x + 8, d.y + 20);
    }
  });

  // THE SUBTERRANEAN HOLDING CHAMBER SCENE[cite: 6]
  drawHoldingChamberInterior();

  // Loot Chests
  Dimensions.wastelandChests.forEach(c => {
    ctx.fillStyle = c.opened ? '#1f2937' : (c.type === 'vault' || c.type === 'master_holding' ? '#4c1d95' : '#065f46');
    ctx.fillRect(c.x, c.y, c.width, c.height);
    ctx.strokeStyle = c.type === 'master_holding' ? '#facc15' : '#00f0ff';
    ctx.lineWidth = 2; ctx.strokeRect(c.x, c.y, c.width, c.height);
  });

  // Extraction Rift
  drawPortal(3120, 150, '#10b981', '#facc15', "NEURAL EXTRACTION GATE [50 TAPES][cite: 4]");

  drawPortalsAndEntities('wasteland');
}

function drawHoldingChamberInterior() {
  // Flickering Old CRT Television[cite: 6]
  const tvX = 3200, tvY = 3850;
  ctx.fillStyle = '#1c1917'; ctx.fillRect(tvX, tvY, 48, 36);
  // Harsh White/Blue TV Static Snow[cite: 6]
  ctx.fillStyle = Math.random() < 0.5 ? '#e0f2fe' : '#ffffff';
  ctx.fillRect(tvX + 4, tvY + 4, 40, 28);

  // The Bound "Old Self" tied to metal chair[cite: 6]
  const chairX = 3212, chairY = 3910;
  ctx.fillStyle = '#475569'; ctx.fillRect(chairX + 4, chairY + 12, 16, 20); // Chair
  ctx.fillStyle = '#ec4899'; ctx.fillRect(chairX + 2, chairY + 4, 20, 16); // Colorful Retrocade Tee[cite: 6]
  ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(chairX + 12, chairY - 2, 7, 0, Math.PI * 2); ctx.fill(); // Head slumped[cite: 6]
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px "Share Tech Mono"';
  ctx.fillText("CAPTIVE OLD SELF[cite: 6]", chairX - 16, chairY + 38);
}

function drawPortalsAndEntities(dim) {
  // Friendly NPCs
  (Entities.friendlyNpcs[dim] || []).forEach(n => {
    const bob = n.dancePhase !== undefined ? Math.sin((Date.now() / 150) + n.dancePhase) * 3 : 0;
    drawPixelCharacter(n.x, n.y + bob, n.color, '#00f0ff', '#1f2937', 'down', false, 0);
    ctx.fillStyle = '#ffffff'; ctx.font = '9px "Share Tech Mono"';
    ctx.fillText(n.name, n.x - 12, n.y - 8);
  });

  // Hostile Mobs & Bosses
  if (dim === 'wasteland') {
    Entities.hostileNpcs.forEach(n => {
      if (!n.alive) return;
      if (n.isBoss) {
        ctx.fillStyle = n.color; ctx.fillRect(n.x, n.y, n.width, n.height);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(n.x, n.y, n.width, n.height);
        // Boss Health Bar Overhead
        ctx.fillStyle = '#000'; ctx.fillRect(n.x - 20, n.y - 14, n.width + 40, 6);
        ctx.fillStyle = '#ff003c'; ctx.fillRect(n.x - 20, n.y - 14, (n.width + 40) * (n.hp / n.maxHp), 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px "Share Tech Mono"';
        ctx.fillText(n.name, n.x - 25, n.y - 18);
      } else {
        ctx.fillStyle = n.type === 'drone' ? '#00f0ff' : '#ff003c';
        ctx.fillRect(n.x, n.y, n.width, n.height);
      }
    });
  }

  // Loot Pickups
  Entities.lootPickups.forEach(p => {
    ctx.fillStyle = p.type === 'coin' ? '#facc15' : '#eab308';
    ctx.beginPath(); ctx.arc(p.x, p.y + Math.sin(Date.now() / 180 + p.floatOffset) * 3, p.radius, 0, Math.PI * 2); ctx.fill();
  });

  // Projectiles
  Combat.projectiles.forEach(p => {
    ctx.fillStyle = p.color || '#00f0ff';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
  });

  Combat.enemyProjectiles.forEach(ep => {
    ctx.fillStyle = '#ff003c';
    ctx.beginPath(); ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2); ctx.fill();
  });

  // Melee Slashes
  Combat.meleeSlashes.forEach(s => {
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.type === 'magic_purple' ? 7 : (s.type === 'heavy_cleave' ? 5 : 3.5);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 1.5);
    ctx.stroke();
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

  // Player Avatar
  const p = Entities.player;
  const currentSkin = State.SKINS_DATA.find(s => s.id === State.userProfile.activeSkin) || State.SKINS_DATA[0];
  if (p.iFrames % 4 < 2) {
    drawPixelCharacter(p.x, p.y, currentSkin.coat, currentSkin.visor, currentSkin.pants, p.direction, p.isMoving, p.animTimer);
  }
}

// ALGORITHMIC PIXEL-ART AVATAR RENDERER
function drawPixelCharacter(px, py, coatColor, visorColor, pantsColor, direction, isMoving, animTimer) {
  const walkBob = isMoving ? Math.sin(animTimer * 0.35) * 3 : 0;
  const legOffset = isMoving ? Math.sin(animTimer * 0.35) * 4 : 0;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.ellipse(px + 13, py + 37, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

  // Cosmic Purple Charge Ring Aura
  if (Combat.isHoldingSlash && Combat.comboStep === 3) {
    const holdSec = (Date.now() - Combat.slashHoldStartTime) / 1000;
    ctx.save();
    ctx.strokeStyle = holdSec >= 2.5 ? '#a855f7' : (holdSec >= 1.2 ? '#ff7700' : '#ff003c');
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px + 13, py + 18, 26 + Math.sin(Date.now() / 70) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Legs & Combat Boots
  ctx.fillStyle = pantsColor;
  ctx.fillRect(px + 5, py + 26 + legOffset, 6, 11 - legOffset);
  ctx.fillRect(px + 15, py + 26 - legOffset, 6, 11 + legOffset);
  ctx.fillStyle = '#000000'; // Boots
  ctx.fillRect(px + 4, py + 34 + legOffset, 7, 4);
  ctx.fillRect(px + 15, py + 34 - legOffset, 7, 4);

  // Structured Heavy Duster / Coat[cite: 6]
  ctx.fillStyle = coatColor;
  ctx.fillRect(px + 3, py + 12 + walkBob, 20, 18);

  // Dynamic Coat Tail Reaction
  if (direction === 'up') {
    ctx.fillRect(px + 4, py + 28 + walkBob, 18, 6);
  } else if (direction === 'left') {
    ctx.fillRect(px + 16, py + 24 + walkBob, 8, 8);
  } else if (direction === 'right') {
    ctx.fillRect(px + 2, py + 24 + walkBob, 8, 8);
  }

  // Tactical Helmet / Mask[cite: 6]
  ctx.fillStyle = '#090b10';
  ctx.beginPath(); ctx.arc(px + 13, py + 7 + walkBob, 9, 0, Math.PI * 2); ctx.fill();

  // Illuminated Glowing Visor Slit[cite: 6]
  ctx.fillStyle = visorColor;
  if (direction === 'down') ctx.fillRect(px + 8, py + 6 + walkBob, 10, 3);
  else if (direction === 'left') ctx.fillRect(px + 5, py + 6 + walkBob, 6, 3);
  else if (direction === 'right') ctx.fillRect(px + 15, py + 6 + walkBob, 6, 3);
  else if (direction === 'up') ctx.fillRect(px + 10, py + 3 + walkBob, 6, 2); // Rear helmet sensor
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

  // Camera Dampening & Subpixel Clamping
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
