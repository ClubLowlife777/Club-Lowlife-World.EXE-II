const LowlifeLeap = {
  canvas: null,
  ctx: null,
  running: false,
  score: 0,
  level: 1,
  cameraX: 0,
  player: { x: 50, y: 300, width: 20, height: 26, vx: 0, vy: 0, grounded: false },
  platforms: [],
  enemies: [],
  flag: { x: 1800, y: 220, width: 14, height: 160 },

  start() {
    if (!State.spendTokens(5)) {
      State.showToast("INSUFFICIENT TOKENS! NEED 5 COINS TO PLAY.");
      return;
    }
    this.canvas = document.getElementById('arcadeCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 600; this.canvas.height = 450;
    document.getElementById('arcadeTitle').innerText = "ARCADE // LOWLIFE LEAP (SUBWAY ESCAPE)";
    document.getElementById('arcadeControlsHint').innerText = "[A/D] SPRINT, [W/SPACE] JUMP ON CRAWLERS";
    document.getElementById('arcadeModal').classList.remove('hidden');
    State.activeMiniGame = this;

    this.score = 0;
    this.level = 1;
    this.loadLevel();
    this.running = true;
    this.loop();
  },

  loadLevel() {
    this.player.x = 50; this.player.y = 300; this.player.vy = 0;
    this.cameraX = 0;
    this.platforms = [
      { x: 0, y: 380, width: 600, height: 70 },
      { x: 700, y: 380, width: 600, height: 70 },
      { x: 1400, y: 380, width: 600, height: 70 },
      { x: 220, y: 270, width: 100, height: 18 },
      { x: 420, y: 220, width: 120, height: 18 },
      { x: 850, y: 250, width: 140, height: 18 },
      { x: 1100, y: 190, width: 120, height: 18 }
    ];
    this.enemies = [
      { x: 340, y: 356, width: 22, height: 24, vx: -1.5, alive: true },
      { x: 880, y: 356, width: 22, height: 24, vx: 1.5, alive: true },
      { x: 1500, y: 356, width: 22, height: 24, vx: -2, alive: true }
    ];
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
    if (Input.keys.left) p.vx = -4.5;
    else if (Input.keys.right) p.vx = 4.5;
    else p.vx *= 0.8;

    if ((Input.keys.up || Input.keys.shift) && p.grounded) {
      p.vy = -12;
      p.grounded = false;
      AudioEngine.playSfx('jump');
    }

    p.vy += 0.65; // Gravity
    p.x += p.vx;
    p.y += p.vy;

    // Platform collisions
    p.grounded = false;
    for (let plat of this.platforms) {
      if (p.x + p.width > plat.x && p.x < plat.x + plat.width && p.y + p.height >= plat.y && p.y + p.height <= plat.y + 16 && p.vy >= 0) {
        p.grounded = true;
        p.vy = 0;
        p.y = plat.y - p.height;
      }
    }

    // Enemy stomps
    for (let e of this.enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      if (e.x < 10 || e.x > 1950) e.vx *= -1;

      if (p.x + p.width > e.x && p.x < e.x + e.width && p.y + p.height > e.y && p.y < e.y + e.height) {
        if (p.vy > 0 && p.y + p.height - p.vy <= e.y + 10) {
          e.alive = false;
          p.vy = -9;
          this.score += 100;
          AudioEngine.playSfx('stomp');
        } else {
          this.stop();
          AudioEngine.playSfx('stomp');
          State.showToast("RUN OVER BY INDUSTRIAL CRAWLER!");
          return;
        }
      }
    }

    // Fall in pit
    if (p.y > 450) {
      this.stop();
      State.showToast("FELL DOWN SUBWAY HOLE!");
      return;
    }

    // Flag clear
    if (p.x > this.flag.x) {
      this.stop();
      State.addTokens(30);
      AudioEngine.playSfx('win');
      State.showToast("STAGE COMPLETED! +30 SOUND TOKENS!");
      return;
    }

    this.cameraX = p.x - 180;
  },

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0d14'; ctx.fillRect(0, 0, 600, 450);
    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Platforms
    ctx.fillStyle = '#1e293b';
    this.platforms.forEach(plat => ctx.fillRect(plat.x, plat.y, plat.width, plat.height));

    // Flagpole
    ctx.fillStyle = '#ffb300'; ctx.fillRect(this.flag.x, this.flag.y, this.flag.width, this.flag.height);

    // Enemies
    this.enemies.forEach(e => {
      if (!e.alive) return;
      ctx.fillStyle = '#ff003c';
      ctx.fillRect(e.x, e.y, e.width, e.height);
    });

    // Player
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    ctx.restore();
    ctx.fillStyle = '#ffffff'; ctx.font = '12px "Share Tech Mono"';
    ctx.fillText(`SCORE: ${this.score}`, 15, 20);
  }
};
