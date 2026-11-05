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
  ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));

  if (State.currentDimension === 'underground') drawUnderground();
  else if (State.currentDimension === 'retrocade') drawRetrocade();
  else drawWasteland();

  ctx.restore();
}

function drawUnderground() {
  ctx.fillStyle = '#080a0f'; ctx.fillRect(0, 0, 1600, 1000);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)'; ctx.lineWidth = 1;
  for (let x = 0; x < 1600; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1000); ctx.stroke(); }
  for (let y = 0; y < 1000; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1600, y); ctx.stroke(); }

  // Walls
  ctx.fillStyle = '#1b2233';
  Dimensions.undergroundObstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));

  // Trunk Pop Vehicle
  ctx.fillStyle = '#111827'; ctx.fillRect(180, 720, 130, 60);
  ctx.fillStyle = '#ff003c'; ctx.fillRect(185, 770, 18, 6); ctx.fillRect(285, 770, 18, 6);
  ctx.fillStyle = '#ffffff'; ctx.font = '10px "Share Tech Mono"';
  ctx.fillText("TRUNK POP TRUCK", 195, 745);

  // Arcade Alley
  ['VOID INVADERS', 'GRID RUNNER', 'LOWLIFE LEAP'].forEach((title, idx) => {
    ctx.fillStyle = '#1e1b4b'; ctx.fillRect(500 + idx * 120, 60, 70, 70);
    ctx.strokeStyle = '#00f0ff'; ctx.strokeRect(500 + idx * 120, 60, 70, 70);
    ctx.fillStyle = '#00f0ff'; ctx.font = 'bold 8px "Chakra Petch"';
    ctx.fillText(title, 505 + idx * 120, 100);
  });

  drawPortalsAndNPCs('underground');
}

function drawRetrocade() {
  ctx.fillStyle = '#120524'; ctx.fillRect(0, 0, 1600, 1000);

  // Audio-Reactive Dance Floor (8x8)
  const colors = ['#ec4899', '#00f0ff', '#a855f7', '#facc15'];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = colors[(i + j + AudioEngine.bgmStepIndex) % colors.length];
      ctx.globalAlpha = 0.25;
      ctx.fillRect(650 + i * 36, 450 + j * 36, 34, 34);
      ctx.globalAlpha = 1.0;
    }
  }

  // DJ Booth
  ctx.fillStyle = '#2e1065'; ctx.fillRect(720, 180, 160, 60);
  ctx.strokeStyle = '#ec4899'; ctx.strokeRect(720, 180, 160, 60);
  ctx.fillStyle = '#ffffff'; ctx.font = '10px "Share Tech Mono"';
  ctx.fillText("DJ STAGE // TURNTABLES", 735, 215);

  // Casino Slots Bank
  ctx.fillStyle = '#3b1a03'; ctx.fillRect(1080, 130, 160, 60);
  ctx.strokeStyle = '#facc15'; ctx.strokeRect(1080, 130, 160, 60);
  ctx.fillStyle = '#facc15'; ctx.font = '10px "Share Tech Mono"';
  ctx.fillText("🎰 CYBER SLOTS (5🪙)", 1095, 165);

  drawPortalsAndNPCs('retrocade');
}

function drawWasteland() {
  ctx.fillStyle = '#07090e'; ctx.fillRect(0, 0, 3200, 2400);
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)'; ctx.lineWidth = 1;
  for (let x = 0; x < 3200; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 2400); ctx.stroke(); }
  for (let y = 0; y < 2400; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(3200, y); ctx.stroke(); }

  ctx.fillStyle = '#0f141f';
  Dimensions.worldObstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));

  Entities.hostileNpcs.forEach(n => {
    if (!n.alive) return;
    ctx.fillStyle = n.type === 'drone' ? '#00f0ff' : '#ff003c';
    ctx.fillRect(n.x, n.y, n.width, n.height);
  });

  drawPortalsAndNPCs('wasteland');
}

function drawPortalsAndNPCs(dim) {
  // Friendly NPCs
  (Entities.friendlyNpcs[dim] || []).forEach(n => {
    ctx.fillStyle = n.color; ctx.fillRect(n.x, n.y, n.width, n.height);
    ctx.fillStyle = '#ffffff'; ctx.font = '9px "Share Tech Mono"';
    ctx.fillText(n.name, n.x - 10, n.y - 6);
  });

  // Projectiles & Slashes
  Combat.projectiles.forEach(p => {
    ctx.fillStyle = '#00f0ff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
  });
  Combat.meleeSlashes.forEach(s => {
    ctx.strokeStyle = '#ff003c'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 1.5); ctx.stroke();
  });

  // Player
  const p = Entities.player;
  ctx.fillStyle = State.userProfile.activeSkin === 'drifter' ? '#ff7700' : '#00f0ff';
  ctx.fillRect(p.x, p.y, p.width, p.height);
}

function gameLoop() {
  Entities.update();
  Combat.update();

  const cfg = State.DIMENSIONS[State.currentDimension];
  const targetX = Entities.player.x - camera.width / 2;
  const targetY = Entities.player.y - camera.height / 2;
  camera.x += (targetX - camera.x) * 0.1;
  camera.y += (targetY - camera.y) * 0.1;
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
