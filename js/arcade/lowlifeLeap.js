/**
 * CLUB LOWLIFE // ARCADE CABINET 03: SUPER LOWLIFE BROS (SUBWAY ESCAPE)
 * File: js/arcade/lowlifeLeap.js
 * Mechanics: [?] Mystery Blocks, 808 Sub-Mushroom Power-Up, Warp Pipes, Ledge-Smart Crawlers,
 *            Floating Coin Arcs, Coyote-Time Jump Physics, Flagpole Bonus & Score->XP Payout
 */

const LowlifeLeap = {
  canvas: null,
  ctx: null,
  running: false,
  gameOver: false,
  stageCleared: false,
  rewardsPaid: false,
  score: 0,
  lives: 3,
  cameraX: 0,
  player: {
    x: 60, y: 310, width: 22, height: 28,
    vx: 0, vy: 0, grounded: false, coyoteFrames: 0,
    poweredUp: false, iFrames: 0, facing: 'right'
  },
  platforms: [],
  pipes: [],
  qBlocks: [],
  coins: [],
  mushrooms: [],
  enemies: [],
  popups: [],
  flag: { x: 2560, y: 150, width: 12, height: 230 },

  start() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.canvas = document.getElementById('arcadeCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 600;
    this.canvas.height = 450;

    const title = document.getElementById('arcadeTitle');
    if (title) title.innerText = "SUPER LOWLIFE BROS // SUBWAY ESCAPE";
    const hint = document.getElementById('arcadeControlsHint');
    if (hint) hint.innerText = "[A/D / ◀▶] RUN  •  [W / SPACE / FIRE] JUMP  •  HIT [?] BLOCKS & STOMP CRAWLERS";
    const modal = document.getElementById('arcadeModal');
    if (modal) modal.classList.remove('hidden');
    if (window.State) {
      State.activeMiniGame = this;
      if (typeof State.recordDailyAction === 'function') State.recordDailyAction('arcade_play', 1);
    }

    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.stageCleared = false;
    this.rewardsPaid = false;
    this.loadLevel(true);

    this.running = true;
    this.loop();
  },

  retry() {
    if (!window.State || !State.spendTokens(5)) {
      if (window.State) State.showToast("NEED 5🪙 TO INSERT COIN!");
      return;
    }
    this.start();
  },

  loadLevel(fullReset = false) {
    this.player.x = 60;
    this.player.y = 310;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.grounded = false;
    this.player.coyoteFrames = 0;
    this.player.iFrames = 30;
    this.cameraX = 0;

    if (!fullReset) return;

    this.player.poweredUp = false;
    this.player.height = 28;
    this.mushrooms = [];
    this.popups = [];

    // Ground & Elevated Platforms (World 1-1 Inspired Layout)
    this.platforms = [
      { x: 0,    y: 380, width: 780, height: 70, type: 'ground' },
      { x: 870,  y: 380, width: 680, height: 70, type: 'ground' },
      { x: 1640, y: 380, width: 520, height: 70, type: 'ground' },
      { x: 2250, y: 380, width: 550, height: 70, type: 'ground' },
      // Elevated Brick Ledges
      { x: 540,  y: 265, width: 140, height: 18, type: 'brick' },
      { x: 1120, y: 255, width: 160, height: 18, type: 'brick' },
      { x: 1420, y: 195, width: 130, height: 18, type: 'brick' },
      { x: 1820, y: 260, width: 160, height: 18, type: 'brick' },
      { x: 2040, y: 195, width: 140, height: 18, type: 'brick' },
      // Final Staircase before Flagpole
      { x: 2340, y: 340, width: 40,  height: 40, type: 'step' },
      { x: 2380, y: 300, width: 40,  height: 80, type: 'step' },
      { x: 2420, y: 260, width: 40,  height: 120, type: 'step' }
    ];

    // Neon Warp Pipes
    this.pipes = [
      { x: 370,  y: 320, width: 44, height: 60 },
      { x: 690,  y: 305, width: 44, height: 75 },
      { x: 1020, y: 315, width: 44, height: 65 },
      { x: 1710, y: 315, width: 44, height: 65 }
    ];

    // [?] Mystery Blocks (Hit from below for Coins or 808 Sub-Mushroom!)
    this.qBlocks = [
      { x: 210,  y: 275, width: 28, height: 28, hit: false, reward: 'coin', bounceY: 0 },
      { x: 268,  y: 275, width: 28, height: 28, hit: false, reward: 'mushroom', bounceY: 0 },
      { x: 300,  y: 185, width: 28, height: 28, hit: false, reward: 'coin', bounceY: 0 },
      { x: 940,  y: 270, width: 28, height: 28, hit: false, reward: 'coin', bounceY: 0 },
      { x: 1185, y: 165, width: 28, height: 28, hit: false, reward: 'mushroom', bounceY: 0 },
      { x: 1885, y: 170, width: 28, height: 28, hit: false, reward: 'coin', bounceY: 0 }
    ];

    // Floating Sound Coins
    this.coins = [
      { x: 382, y: 275, collected: false }, { x: 404, y: 275, collected: false },
      { x: 570, y: 230, collected: false }, { x: 605, y: 230, collected: false }, { x: 640, y: 230, collected: false },
      { x: 805, y: 280, collected: false }, { x: 835, y: 265, collected: false },
      { x: 1155, y: 220, collected: false }, { x: 1195, y: 220, collected: false }, { x: 1235, y: 220, collected: false },
      { x: 1455, y: 160, collected: false }, { x: 1495, y: 160, collected: false },
      { x: 1860, y: 225, collected: false }, { x: 1900, y: 225, collected: false },
      { x: 2080, y: 160, collected: false }, { x: 2120, y: 160, collected: false }
    ];

    // Ledge-Aware Enemies (Patrol within minX..maxX so they never fall off cliffs)
    this.enemies = [
      { x: 260,  y: 356, minX: 120,  maxX: 345,  width: 22, height: 24, vx: -1.6, type: 'goomba', alive: true },
      { x: 520,  y: 356, minX: 425,  maxX: 665,  width: 22, height: 24, vx: 1.7,  type: 'goomba', alive: true },
      { x: 960,  y: 356, minX: 880,  maxX: 1000, width: 22, height: 24, vx: -1.7, type: 'koopa',  alive: true },
      { x: 1260, y: 356, minX: 1080, maxX: 1510, width: 22, height: 24, vx: -2.0, type: 'goomba', alive: true },
      { x: 1440, y: 356, minX: 1080, maxX: 1510, width: 22, height: 24, vx: 1.9,  type: 'koopa',  alive: true },
      { x: 1850, y: 236, minX: 1825, maxX: 1955, width: 22, height: 24, vx: 1.5,  type: 'goomba', alive: true },
      { x: 1920, y: 356, minX: 1765, maxX: 2130, width: 22, height: 24, vx: -2.1, type: 'koopa',  alive: true }
    ];
  },

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (window.State && typeof State.recordArcadeScore === 'function') {
      State.recordArcadeScore('lowlifeLeap', this.score);
    }
    if (!this.rewardsPaid && this.score > 0 && window.State && typeof State.awardArcadeRewards === 'function') {
      this.rewardsPaid = true;
      State.awardArcadeRewards("SUPER LOWLIFE", this.score, this.stageCleared);
    }
  },

  endGame(cleared = false) {
    this.gameOver = true;
    this.stageCleared = cleared;
    if (window.State && typeof State.recordArcadeScore === 'function') {
      State.recordArcadeScore('lowlifeLeap', this.score);
    }
    if (!this.rewardsPaid && window.State && typeof State.awardArcadeRewards === 'function') {
      this.rewardsPaid = true;
      State.awardArcadeRewards("SUPER LOWLIFE", this.score, cleared);
    }
  },

  spawnPopup(x, y, text, color = '#facc15') {
    this.popups.push({ x, y, text, color, life: 28 });
  },

  loop() {
    if (!this.running) return;
    if (!this.gameOver) {
      this.update();
    }
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  },

  update() {
    const p = this.player;
    if (p.iFrames > 0) p.iFrames--;

    // Horizontal Movement (Keyboard + Touch D-Pad + Analog Joystick)
    const av = (window.Input && Input.analogVector && Input.analogVector.active) ? Input.analogVector : { x: 0, y: 0 };
    if ((window.Input && Input.keys.left) || av.x < -0.2) {
      p.vx = -4.6;
      p.facing = 'left';
    } else if ((window.Input && Input.keys.right) || av.x > 0.2) {
      p.vx = 4.6;
      p.facing = 'right';
    } else {
      p.vx *= 0.78;
    }

    if (p.grounded) p.coyoteFrames = 6;
    else if (p.coyoteFrames > 0) p.coyoteFrames--;

    // Jump ([W], [Up], [Space], [J], Touch FIRE/JUMP, or Up-Tilt)
    const wantsJump = window.Input && (Input.keys.up || Input.keys.fire || Input.keys.shift || av.y < -0.45);
    if (wantsJump && p.coyoteFrames > 0) {
      p.vy = p.poweredUp ? -12.6 : -11.8;
      p.grounded = false;
      p.coyoteFrames = 0;
      if (window.AudioEngine) AudioEngine.playSfx('jump');
    }

    p.vy = Math.min(11.5, p.vy + 0.62); // Gravity with terminal fall cap (no platform tunneling)

    // Horizontal Step + Pipe Side Collision
    p.x = Math.max(10, p.x + p.vx);
    const solidBlocks = [...this.platforms, ...this.pipes, ...this.qBlocks];
    for (let b of solidBlocks) {
      if (p.x + p.width > b.x && p.x < b.x + b.width && p.y + p.height > b.y + 4 && p.y < b.y + b.height - 4) {
        if (p.vx > 0) p.x = b.x - p.width;
        else if (p.vx < 0) p.x = b.x + b.width;
      }
    }

    // Vertical Step + Landing & Head-Bonk [?] Block Detection
    const prevBottom = p.y + p.height;
    const prevTop = p.y;
    p.y += p.vy;
    p.grounded = false;

    for (let b of solidBlocks) {
      if (p.x + p.width > b.x + 2 && p.x < b.x + b.width - 2) {
        // Landing on top
        if (p.vy >= 0 && prevBottom <= b.y + 14 && p.y + p.height >= b.y && p.y < b.y + b.height) {
          p.grounded = true;
          p.vy = 0;
          p.y = b.y - p.height;
        }
        // Bonking [?] block from below!
        else if (p.vy < 0 && prevTop >= b.y + b.height - 10 && p.y <= b.y + b.height && p.y > b.y) {
          p.y = b.y + b.height;
          p.vy = 1.5;
          if (b.reward && !b.hit) {
            b.hit = true;
            b.bounceY = -6;
            if (b.reward === 'coin') {
              this.score += 75;
              this.spawnPopup(b.x + 14, b.y - 10, "+75 🪙", '#facc15');
              if (window.AudioEngine) AudioEngine.playSfx('coin');
            } else if (b.reward === 'mushroom') {
              this.mushrooms.push({ x: b.x + 4, y: b.y - 22, width: 20, height: 20, vx: 2.0, vy: -3 });
              this.spawnPopup(b.x + 14, b.y - 10, "808 BOOST!", '#4ade80');
              if (window.AudioEngine) AudioEngine.playSfx('win');
            }
          } else {
            if (window.AudioEngine) AudioEngine.playSfx('spin');
          }
        }
      }
    }

    this.qBlocks.forEach(qb => {
      if (qb.bounceY < 0) qb.bounceY = Math.min(0, qb.bounceY + 1.5);
    });

    // Update Floating Coins
    this.coins.forEach(c => {
      if (!c.collected && Math.hypot((p.x + p.width / 2) - c.x, (p.y + p.height / 2) - c.y) < 18) {
        c.collected = true;
        this.score += 50;
        this.spawnPopup(c.x, c.y - 8, "+50", '#facc15');
        if (window.AudioEngine) AudioEngine.playSfx('coin');
      }
    });

    // Update 808 Sub-Mushrooms
    for (let i = this.mushrooms.length - 1; i >= 0; i--) {
      const m = this.mushrooms[i];
      m.vy += 0.45;
      m.x += m.vx;
      m.y += m.vy;
      for (let b of solidBlocks) {
        if (m.x + m.width > b.x && m.x < b.x + b.width && m.y + m.height >= b.y && m.y + m.height <= b.y + 16 && m.vy >= 0) {
          m.y = b.y - m.height;
          m.vy = 0;
        }
      }
      if (p.x + p.width > m.x && p.x < m.x + m.width && p.y + p.height > m.y && p.y < m.y + m.height) {
        this.score += 200;
        if (!p.poweredUp) {
          p.poweredUp = true;
          p.y -= 6;
          p.height = 34;
        }
        this.spawnPopup(p.x, p.y - 12, "SUPER LOWLIFE! +200", '#00f0ff');
        if (window.AudioEngine) AudioEngine.playSfx('win');
        this.mushrooms.splice(i, 1);
      } else if (m.y > 460) {
        this.mushrooms.splice(i, 1);
      }
    }

    // Update Ledge-Smart Enemies & Mario Stomp Physics
    for (let e of this.enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      if (e.x <= e.minX || e.x >= e.maxX) e.vx *= -1;

      if (p.x + p.width > e.x + 2 && p.x < e.x + e.width - 2 && p.y + p.height > e.y && p.y < e.y + e.height) {
        // Stomp from above
        if (p.vy > 0 && prevBottom <= e.y + 14) {
          e.alive = false;
          p.vy = -9.5;
          const pts = e.type === 'koopa' ? 150 : 100;
          this.score += pts;
          this.spawnPopup(e.x, e.y - 8, `+${pts} STOMP!`, '#4ade80');
          if (window.AudioEngine) AudioEngine.playSfx('stomp');
        } else if (p.iFrames <= 0) {
          if (p.poweredUp) {
            // Super Mario Shrink Shield!
            p.poweredUp = false;
            p.height = 28;
            p.iFrames = 55;
            this.spawnPopup(p.x, p.y - 10, "SHIELD BROKEN!", '#ff003c');
            if (window.AudioEngine) AudioEngine.playSfx('stomp');
          } else {
            this.loseLife();
            return;
          }
        }
      }
    }

    // Pit Fall Check
    if (p.y > 450) {
      this.loseLife();
      return;
    }

    // Syndicate Flagpole Clear!
    if (p.x + p.width >= this.flag.x) {
      const heightBonus = Math.max(100, Math.round((380 - p.y) * 2.5));
      this.score += heightBonus + 300;
      this.spawnPopup(this.flag.x, p.y, `FLAGPOLE +${heightBonus + 300}!`, '#4ade80');
      if (window.AudioEngine) AudioEngine.playSfx('win');
      this.endGame(true);
      return;
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      this.popups[i].y -= 0.8;
      this.popups[i].life--;
      if (this.popups[i].life <= 0) this.popups.splice(i, 1);
    }

    this.cameraX = Math.max(0, Math.min(2200, p.x - 180));
  },

  loseLife() {
    this.lives--;
    if (window.AudioEngine) AudioEngine.playSfx('stomp');
    if (this.lives <= 0) {
      this.endGame(false);
    } else {
      this.loadLevel(false);
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#090d18';
    ctx.fillRect(0, 0, 600, 450);

    // Distant Cyberpunk Skyline Parallax
    ctx.fillStyle = '#111827';
    for (let i = 0; i < 12; i++) {
      const bx = ((i * 140 - this.cameraX * 0.25) % 1600 + 1600) % 1600 - 100;
      const bh = 90 + (i % 3) * 45;
      ctx.fillRect(bx, 380 - bh, 85, bh);
    }

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Platforms & Bricks
    this.platforms.forEach(plat => {
      if (plat.type === 'ground') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(plat.x, plat.y, plat.width, 4);
      } else {
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#f97316';
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      }
    });

    // Neon Warp Pipes
    this.pipes.forEach(pipe => {
      ctx.fillStyle = '#047857';
      ctx.fillRect(pipe.x + 3, pipe.y + 12, pipe.width - 6, pipe.height - 12);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(pipe.x, pipe.y, pipe.width, 14);
      ctx.strokeStyle = '#4ade80';
      ctx.strokeRect(pipe.x, pipe.y, pipe.width, 14);
    });

    // [?] Mystery Blocks
    this.qBlocks.forEach(qb => {
      const by = qb.y + (qb.bounceY || 0);
      ctx.fillStyle = qb.hit ? '#475569' : '#eab308';
      ctx.fillRect(qb.x, by, qb.width, qb.height);
      ctx.strokeStyle = qb.hit ? '#94a3b8' : '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(qb.x, by, qb.width, qb.height);
      if (!qb.hit) {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px "Chakra Petch"';
        ctx.fillText("?", qb.x + 9, by + 20);
      }
    });

    // Floating Sound Coins
    this.coins.forEach(c => {
      if (c.collected) return;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(c.x, c.y + Math.sin(Date.now() / 150 + c.x) * 3, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 808 Sub-Mushrooms
    this.mushrooms.forEach(m => {
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(m.x + 10, m.y + 8, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(m.x + 4, m.y + 8, 12, 10);
    });

    // Syndicate Flagpole & Fortress Goal
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(this.flag.x + 4, this.flag.y, 4, this.flag.height);
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(this.flag.x + 8, this.flag.y + 8);
    ctx.lineTo(this.flag.x + 48, this.flag.y + 24);
    ctx.lineTo(this.flag.x + 8, this.flag.y + 40);
    ctx.closePath();
    ctx.fill();

    // Enemies (Goomba Crawlers & Koopa Drones)
    this.enemies.forEach(e => {
      if (!e.alive) return;
      ctx.fillStyle = e.type === 'koopa' ? '#a855f7' : '#ff003c';
      ctx.fillRect(e.x, e.y, e.width, e.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(e.x + 3, e.y + 5, 4, 4);
      ctx.fillRect(e.x + e.width - 7, e.y + 5, 4, 4);
    });

    // Super Lowlife Operative
    const p = this.player;
    if (p.iFrames % 4 < 2) {
      ctx.fillStyle = p.poweredUp ? '#facc15' : '#090b10';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.width, p.height);
      // Visor
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(p.facing === 'right' ? p.x + 10 : p.x + 2, p.y + 6, 10, 4);
    }

    // Popups
    this.popups.forEach(pop => {
      ctx.fillStyle = pop.color;
      ctx.font = 'bold 10px "Share Tech Mono"';
      ctx.fillText(pop.text, pop.x, pop.y);
    });

    ctx.restore();

    // Live Top Arcade HUD
    const est = (window.State && typeof State.calculateArcadeRewards === 'function')
      ? State.calculateArcadeRewards(this.score, this.stageCleared)
      : { xp: Math.floor(this.score / 25), tokens: Math.floor(this.score / 80) };

    ctx.fillStyle = 'rgba(8, 10, 16, 0.90)';
    ctx.fillRect(0, 0, 600, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Share Tech Mono"';
    ctx.fillText(`SCORE: ${this.score}`, 14, 20);
    ctx.fillStyle = p.poweredUp ? '#facc15' : '#94a3b8';
    ctx.fillText(p.poweredUp ? "MODE: SUPER 808" : "MODE: STANDARD", 140, 20);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`REWARD: +${est.xp} XP / +${est.tokens}🪙`, 275, 20);
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`LIVES: ${'♥'.repeat(Math.max(0, this.lives))}`, 505, 20);

    // Game Over / Stage Clear Summary Overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(5, 6, 11, 0.90)';
      ctx.fillRect(90, 115, 420, 210);
      ctx.strokeStyle = this.stageCleared ? '#4ade80' : '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(90, 115, 420, 210);

      ctx.textAlign = 'center';
      ctx.fillStyle = this.stageCleared ? '#4ade80' : '#ff003c';
      ctx.font = 'bold 20px "Chakra Petch"';
      ctx.fillText(this.stageCleared ? "SUBWAY COURSE CLEARED!" : "OPERATIVE DOWN", 300, 158);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Share Tech Mono"';
      ctx.fillText(`FINAL SCORE: ${this.score} PTS`, 300, 195);

      ctx.fillStyle = '#facc15';
      ctx.fillText(`EARNED: +${est.xp} XP  &  +${est.tokens} SOUND TOKENS 🪙`, 300, 228);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 12px "Share Tech Mono"';
      ctx.fillText("PRESS [SPACE / FIRE] OR TAP TO PLAY AGAIN (5🪙)", 300, 275);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "Share Tech Mono"';
      ctx.fillText("PRESS [ESC] OR TAP EXIT TO RETURN TO UNDERGROUND", 300, 302);
      ctx.textAlign = 'left';
    }
  }
};

window.LowlifeLeap = LowlifeLeap;
