const VoidInvaders = {
  canvas: null,
  ctx: null,
  running: false,
  score: 0,
  player: { x: 280, y: 400, width: 24, height: 16, vx: 0, lives: 3 },
  lasers: [],
  enemyLasers: [],
  enemies: [],

  start() {
    if (!State.spendTokens(5)) {
      State.showToast("INSUFFICIENT TOKENS! NEED 5 COINS TO PLAY.");
      return;
    }
    this.canvas = document.getElementById('arcadeCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 600; this.canvas.height = 450;
    document.getElementById('arcadeTitle').innerText = "ARCADE // VOID INVADERS (GALAGA PROTOCOL)";
    document.getElementById('arcadeControlsHint').innerText = "[A/D] STEER SHIP, [SPACE/J] FIRE PLASMA BURSTS";
    document.getElementById('arcadeModal').classList.remove('hidden');
    State.activeMiniGame = this;

    this.score = 0;
    this.player.lives = 3;
    this.player.x = 288;
    this.lasers = [];
    this.enemyLasers = [];
    this.enemies = [];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        this.enemies.push({
          x: 80 + col * 55, y: 40 + row * 40, width: 24, height: 18,
          alive: true, dir: 1, diveTimer: Math.random() * 200
        });
      }
    }

    this.running = true;
    this.loop();
  },

  stop() { this.running = false; },

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  },

  update() {
    const p = this.player;
    if (Input.keys.left) p.x = Math.max(10, p.x - 5);
    if (Input.keys.right) p.x = Math.min(566, p.x + 5);

    // Player fire
    if (Input.keys.up || Input.keys.shift) {
      if (!this.lastShot || Date.now() - this.lastShot > 220) {
        this.lasers.push({ x: p.x + 10, y: p.y, vy: -9 });
        AudioEngine.playSfx('laser');
        this.lastShot = Date.now();
      }
    }

    // Player lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.y += l.vy;
      for (let e of this.enemies) {
        if (e.alive && l.x > e.x && l.x < e.x + e.width && l.y > e.y && l.y < e.y + e.height) {
          e.alive = false;
          l.y = -999;
          this.score += 50;
          AudioEngine.playSfx('stomp');
          break;
        }
      }
      if (l.y < 0) this.lasers.splice(i, 1);
    }

    // Enemies & return fire
    let aliveCount = 0;
    this.enemies.forEach(e => {
      if (!e.alive) return;
      aliveCount++;
      e.x += e.dir * 1.2;
      if (e.x > 550 || e.x < 30) e.dir *= -1;

      // Enemy fires back at player
      if (Math.random() < 0.008) {
        this.enemyLasers.push({ x: e.x + 10, y: e.y + 18, vy: 5 });
      }
    });

    // Enemy lasers hit check
    for (let i = this.enemyLasers.length - 1; i >= 0; i--) {
      const el = this.enemyLasers[i];
      el.y += el.vy;
      if (Math.hypot(el.x - (p.x + 12), el.y - (p.y + 8)) < 16) {
        p.lives--;
        this.enemyLasers.splice(i, 1);
        AudioEngine.playSfx('stomp');
        if (p.lives <= 0) {
          this.stop();
          State.showToast(`MISSION FAILED! SCORE: ${this.score}`);
        }
      } else if (el.y > 450) {
        this.enemyLasers.splice(i, 1);
      }
    }

    if (aliveCount === 0) {
      this.stop();
      State.addTokens(20);
      AudioEngine.playSfx('win');
      State.showToast(`VOID CLEARED! +20 TOKENS WON!`);
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, 600, 450);

    // Player ship
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    // Enemies
    this.enemies.forEach(e => {
      if (!e.alive) return;
      ctx.fillStyle = '#ff003c';
      ctx.fillRect(e.x, e.y, e.width, e.height);
    });

    // Lasers
    ctx.fillStyle = '#facc15';
    this.lasers.forEach(l => ctx.fillRect(l.x, l.y, 4, 10));
    ctx.fillStyle = '#ff003c';
    this.enemyLasers.forEach(el => ctx.fillRect(el.x, el.y, 4, 10));

    // Stats
    ctx.fillStyle = '#ffffff'; ctx.font = '12px "Share Tech Mono"';
    ctx.fillText(`SCORE: ${this.score}`, 15, 20);
    ctx.fillText(`LIVES: ${this.player.lives}`, 520, 20);
  }
};
