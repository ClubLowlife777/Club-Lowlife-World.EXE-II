const GridRunner = {
  canvas: null,
  ctx: null,
  running: false,
  score: 0,
  player: { x: 288, y: 288, gridX: 9, gridY: 9, dir: 'none' },
  dots: [],
  ghosts: [],

  start() {
    if (!State.spendTokens(5)) {
      State.showToast("INSUFFICIENT TOKENS! NEED 5 COINS TO PLAY.");
      return;
    }
    this.canvas = document.getElementById('arcadeCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 600; this.canvas.height = 450;
    document.getElementById('arcadeTitle').innerText = "ARCADE // GRID RUNNER (NEON LABYRINTH)";
    document.getElementById('arcadeControlsHint').innerText = "[WASD / ARROWS] STEER CYBER BYTE";
    document.getElementById('arcadeModal').classList.remove('hidden');
    State.activeMiniGame = this;

    this.score = 0;
    this.player = { x: 300, y: 350, dir: 'up' };
    this.ghosts = [
      { x: 100, y: 80, color: '#ff003c', type: 'hunter' },
      { x: 500, y: 80, color: '#a855f7', type: 'flanker' }
    ];

    this.dots = [];
    for (let x = 60; x <= 540; x += 40) {
      for (let y = 50; y <= 400; y += 35) {
        this.dots.push({ x, y, collected: false });
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
    if (Input.keys.left) { p.x -= 3.5; p.dir = 'left'; }
    if (Input.keys.right) { p.x += 3.5; p.dir = 'right'; }
    if (Input.keys.up) { p.y -= 3.5; p.dir = 'up'; }
    if (Input.keys.down) { p.y += 3.5; p.dir = 'down'; }

    p.x = Math.max(40, Math.min(560, p.x));
    p.y = Math.max(40, Math.min(410, p.y));

    // Dot collection
    this.dots.forEach(d => {
      if (!d.collected && Math.hypot(d.x - p.x, d.y - p.y) < 14) {
        d.collected = true;
        this.score += 10;
        AudioEngine.playSfx('coin');
      }
    });

    // Smart AI movement
    this.ghosts.forEach(g => {
      let targetX = p.x;
      let targetY = p.y;
      if (g.type === 'flanker') {
        if (p.dir === 'left') targetX -= 60;
        else if (p.dir === 'right') targetX += 60;
        else if (p.dir === 'up') targetY -= 60;
        else if (p.dir === 'down') targetY += 60;
      }
      const angle = Math.atan2(targetY - g.y, targetX - g.x);
      g.x += Math.cos(angle) * 2.2;
      g.y += Math.sin(angle) * 2.2;

      if (Math.hypot(g.x - p.x, g.y - p.y) < 16) {
        this.stop();
        AudioEngine.playSfx('stomp');
        State.showToast(`CORNERED BY SMART AI! SCORE: ${this.score}`);
      }
    });

    if (this.dots.filter(d => !d.collected).length === 0) {
      this.stop();
      State.addTokens(25);
      AudioEngine.playSfx('win');
      State.showToast("LABYRINTH CLEARED! +25 TOKENS!");
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#06080e'; ctx.fillRect(0, 0, 600, 450);

    // Dots
    ctx.fillStyle = '#facc15';
    this.dots.forEach(d => {
      if (!d.collected) {
        ctx.beginPath(); ctx.arc(d.x, d.y, 3, 0, Math.PI * 2); ctx.fill();
      }
    });

    // Player
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath(); ctx.arc(this.player.x, this.player.y, 8, 0, Math.PI * 2); ctx.fill();

    // Ghosts
    this.ghosts.forEach(g => {
      ctx.fillStyle = g.color;
      ctx.beginPath(); ctx.arc(g.x, g.y, 9, 0, Math.PI * 2); ctx.fill();
    });

    ctx.fillStyle = '#ffffff'; ctx.font = '12px "Share Tech Mono"';
    ctx.fillText(`SCORE: ${this.score}`, 15, 20);
  }
};
