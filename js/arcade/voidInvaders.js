/**
 * CLUB LOWLIFE // ARCADE CABINET 01: LOWLIFE GALAGA (VOID INVADERS)
 * File: js/arcade/voidInvaders.js
 * Mechanics: Coordinated Fleet Formation, Sine-Wave Dive-Bombers, 2-HP Command Cruisers,
 *            Twin-Synth Dual Blaster Powerup, Multi-Wave Escalation & Score->XP Payout
 */

const VoidInvaders = {
  canvas: null,
  ctx: null,
  running: false,
  gameOver: false,
  rewardsPaid: false,
  score: 0,
  wave: 1,
  fleetTime: 0,
  player: { x: 284, y: 404, width: 28, height: 20, lives: 3, iFrames: 0, dualLaserTimer: 0 },
  lasers: [],
  enemyLasers: [],
  enemies: [],
  powerups: [],
  particles: [],
  stars: [],

  start() {
    this.canvas = document.getElementById('arcadeCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 600;
    this.canvas.height = 450;

    const title = document.getElementById('arcadeTitle');
    if (title) title.innerText = "LOWLIFE GALAGA // VOID INVADERS";
    const hint = document.getElementById('arcadeControlsHint');
    if (hint) hint.innerText = "[A/D / ◀▶] STEER  •  [SPACE / J / FIRE] SHOOT  •  25 PTS = +1 XP";
    const modal = document.getElementById('arcadeModal');
    if (modal) modal.classList.remove('hidden');
    if (window.State) State.activeMiniGame = this;

    this.score = 0;
    this.wave = 1;
    this.gameOver = false;
    this.rewardsPaid = false;
    this.player = { x: 286, y: 404, width: 28, height: 20, lives: 3, iFrames: 0, dualLaserTimer: 0 };
    this.lasers = [];
    this.enemyLasers = [];
    this.powerups = [];
    this.particles = [];

    this.stars = [];
    for (let s = 0; s < 55; s++) {
      this.stars.push({
        x: Math.random() * 600,
        y: Math.random() * 450,
        speed: 0.6 + Math.random() * 2.2,
        size: Math.random() < 0.3 ? 2 : 1,
        color: ['#ffffff', '#00f0ff', '#ec4899', '#a855f7'][Math.floor(Math.random() * 4)]
      });
    }

    this.spawnWave(1);
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

  spawnWave(waveNum) {
    this.enemies = [];
    this.fleetTime = 0;
    const rows = [
      { type: 'commander', hp: 2, pts: 150, color: '#facc15', count: 4, startX: 165, spacing: 82, y: 52 },
      { type: 'hornet',    hp: 1, pts: 80,  color: '#ff003c', count: 8, startX: 90,  spacing: 60, y: 92 },
      { type: 'interceptor', hp: 1, pts: 60, color: '#00f0ff', count: 8, startX: 90, spacing: 60, y: 130 },
      { type: 'drone',     hp: 1, pts: 50,  color: '#a855f7', count: 8, startX: 90,  spacing: 60, y: 168 }
    ];

    rows.forEach((r, rIdx) => {
      for (let c = 0; c < r.count; c++) {
        const homeX = r.startX + c * r.spacing;
        const homeY = r.y;
        this.enemies.push({
          type: r.type,
          homeX,
          homeY,
          x: homeX,
          y: homeY - 120 - rIdx * 20, // Swoop into formation on wave start
          width: r.type === 'commander' ? 28 : 24,
          height: r.type === 'commander' ? 20 : 16,
          hp: r.hp,
          maxHp: r.hp,
          pts: r.pts,
          color: r.color,
          alive: true,
          state: 'entering', // 'entering' | 'formation' | 'diving'
          diveTimer: 90 + Math.random() * Math.max(80, 260 - waveNum * 30),
          divePhase: 0,
          diveOriginX: homeX
        });
      }
    });
  },

  stop() {
    this.running = false;
    if (!this.rewardsPaid && this.score > 0 && window.State && typeof State.awardArcadeRewards === 'function') {
      this.rewardsPaid = true;
      State.awardArcadeRewards("LOWLIFE GALAGA", this.score, this.wave > 1);
    }
  },

  endGame(victory = false) {
    this.gameOver = true;
    if (!this.rewardsPaid && window.State && typeof State.awardArcadeRewards === 'function') {
      this.rewardsPaid = true;
      this.lastRewards = State.awardArcadeRewards("LOWLIFE GALAGA", this.score, victory || this.wave > 1);
    }
  },

  spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        color: i % 3 === 0 ? '#ffffff' : color,
        life: 16 + Math.floor(Math.random() * 10),
        maxLife: 26
      });
    }
  },

  loop() {
    if (!this.running) return;
    if (!this.gameOver) {
      this.update();
    }
    this.draw();
    requestAnimationFrame(() => this.loop());
  },

  update() {
    this.fleetTime += 0.04;
    const p = this.player;
    if (p.iFrames > 0) p.iFrames--;
    if (p.dualLaserTimer > 0) p.dualLaserTimer--;

    // Starfield Scroll
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > 450) { s.y = 0; s.x = Math.random() * 600; }
    });

    // Steer Ship (Keyboard + Mobile Touch D-Pad + Analog Joystick)
    const ax = (window.Input && Input.analogVector && Input.analogVector.active) ? Input.analogVector.x : 0;
    if ((window.Input && Input.keys.left) || ax < -0.18) p.x = Math.max(14, p.x - 5.4);
    if ((window.Input && Input.keys.right) || ax > 0.18) p.x = Math.min(558, p.x + 5.4);

    // Fire Plasma Bursts ([Space], [J], [W], [Up], or Mobile Fire Button)
    const wantsFire = window.Input && (Input.keys.fire || Input.keys.up || Input.keys.shift);
    if (wantsFire && (!this.lastShot || Date.now() - this.lastShot > 190)) {
      if (p.dualLaserTimer > 0) {
        this.lasers.push({ x: p.x + 3, y: p.y - 4, vy: -10.5, color: '#4ade80' });
        this.lasers.push({ x: p.x + p.width - 7, y: p.y - 4, vy: -10.5, color: '#4ade80' });
      } else {
        this.lasers.push({ x: p.x + 12, y: p.y - 4, vy: -10.5, color: '#facc15' });
      }
      if (window.AudioEngine) AudioEngine.playSfx('laser');
      this.lastShot = Date.now();
    }

    // Update Player Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.y += l.vy;
      let hit = false;
      for (let e of this.enemies) {
        if (e.alive && l.x + 4 > e.x && l.x < e.x + e.width && l.y < e.y + e.height && l.y + 12 > e.y) {
          e.hp--;
          hit = true;
          if (e.hp <= 0) {
            e.alive = false;
            const diveBonus = e.state === 'diving' ? 2 : 1;
            this.score += e.pts * diveBonus;
            this.spawnParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 12);
            if (window.AudioEngine) AudioEngine.playSfx('stomp');
            // Command Cruisers can drop Twin-Synth Dual Blaster Powerup
            if (e.type === 'commander' && Math.random() < 0.55) {
              this.powerups.push({ x: e.x + 6, y: e.y, vy: 2.4, type: 'dual_laser' });
            }
          } else {
            // Damaged Command Cruiser turns Crimson
            e.color = '#ff003c';
            this.spawnParticles(l.x, l.y, '#facc15', 5);
            if (window.AudioEngine) AudioEngine.playSfx('spin');
          }
          break;
        }
      }
      if (hit || l.y < -15) this.lasers.splice(i, 1);
    }

    // Update Powerup Capsules
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      pw.y += pw.vy;
      if (Math.hypot((pw.x + 8) - (p.x + 14), (pw.y + 8) - (p.y + 10)) < 22) {
        p.dualLaserTimer = 600; // 10 seconds of Twin-Synth Blaster
        this.score += 100;
        if (window.AudioEngine) AudioEngine.playSfx('win');
        this.powerups.splice(i, 1);
      } else if (pw.y > 460) {
        this.powerups.splice(i, 1);
      }
    }

    // Update Galaga Fleet & Kamikaze Dive-Bombers
    const swayOffset = Math.sin(this.fleetTime) * 34;
    let aliveCount = 0;
    const activeDivers = this.enemies.filter(e => e.alive && e.state === 'diving').length;
    const maxDivers = 2 + this.wave;

    this.enemies.forEach(e => {
      if (!e.alive) return;
      aliveCount++;

      const targetHomeX = e.homeX + swayOffset;
      const targetHomeY = e.homeY + Math.cos(this.fleetTime * 1.5 + e.homeX * 0.02) * 4;

      if (e.state === 'entering') {
        e.x += (targetHomeX - e.x) * 0.12;
        e.y += (targetHomeY - e.y) * 0.12;
        if (Math.hypot(targetHomeX - e.x, targetHomeY - e.y) < 3) {
          e.state = 'formation';
        }
      } else if (e.state === 'formation') {
        e.x = targetHomeX;
        e.y = targetHomeY;
        e.diveTimer--;
        if (e.diveTimer <= 0 && activeDivers < maxDivers) {
          e.state = 'diving';
          e.divePhase = 0;
          e.diveOriginX = e.x;
        }
        if (Math.random() < 0.004 + this.wave * 0.001) {
          this.enemyLasers.push({ x: e.x + e.width / 2, y: e.y + e.height, vx: 0, vy: 4.5 + this.wave * 0.4 });
        }
      } else if (e.state === 'diving') {
        e.divePhase += 0.055;
        e.y += 3.2 + this.wave * 0.35;
        e.x = e.diveOriginX + Math.sin(e.divePhase * 2.2) * 75 + ((p.x - e.diveOriginX) * 0.25);

        if (Math.floor(e.divePhase * 18) === 10) {
          const aim = Math.atan2(p.y - e.y, p.x - e.x);
          this.enemyLasers.push({
            x: e.x + e.width / 2, y: e.y + e.height,
            vx: Math.cos(aim) * 5.2, vy: Math.sin(aim) * 5.2
          });
        }

        // Kamikaze collision with player ship
        if (p.iFrames <= 0 && Math.hypot((e.x + e.width / 2) - (p.x + 14), (e.y + e.height / 2) - (p.y + 10)) < 20) {
          e.alive = false;
          this.damagePlayer();
        }

        // Loop back from top of screen if survived dive
        if (e.y > 465) {
          e.y = -30;
          e.state = 'entering';
          e.diveTimer = 140 + Math.random() * 180;
        }
      }
    });

    // Enemy Lasers Hit Check
    for (let i = this.enemyLasers.length - 1; i >= 0; i--) {
      const el = this.enemyLasers[i];
      el.x += (el.vx || 0);
      el.y += el.vy;
      if (p.iFrames <= 0 && Math.hypot(el.x - (p.x + 14), el.y - (p.y + 10)) < 15) {
        this.enemyLasers.splice(i, 1);
        this.damagePlayer();
      } else if (el.y > 460 || el.x < 0 || el.x > 600) {
        this.enemyLasers.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // Wave Clear Check -> Advance to Next Escalating Wave!
    if (aliveCount === 0) {
      this.score += 300 * this.wave;
      if (window.AudioEngine) AudioEngine.playSfx('win');
      if (this.wave >= 3) {
        this.endGame(true);
      } else {
        this.wave++;
        this.enemyLasers = [];
        this.spawnWave(this.wave);
      }
    }
  },

  damagePlayer() {
    const p = this.player;
    p.lives--;
    p.iFrames = 55;
    p.dualLaserTimer = 0;
    this.spawnParticles(p.x + 14, p.y + 10, '#00f0ff', 16);
    if (window.AudioEngine) AudioEngine.playSfx('stomp');
    if (p.lives <= 0) {
      this.endGame(false);
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#05060b';
    ctx.fillRect(0, 0, 600, 450);

    // Starfield
    this.stars.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Powerups
    this.powerups.forEach(pw => {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(pw.x, pw.y, 18, 14);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(pw.x, pw.y, 18, 14);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px "Share Tech Mono"';
      ctx.fillText("2X", pw.x + 3, pw.y + 10);
    });

    // Player Starfighter (Galaga Twin-Wing Silhouette)
    const p = this.player;
    if (p.lives > 0 && p.iFrames % 4 < 2) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = p.dualLaserTimer > 0 ? '#4ade80' : '#00f0ff';
      // Center Fuselage
      ctx.beginPath();
      ctx.moveTo(14, -4);
      ctx.lineTo(20, 18);
      ctx.lineTo(8, 18);
      ctx.closePath();
      ctx.fill();
      // Swept Wings
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 8, 28, 6);
      ctx.fillStyle = '#ff003c';
      ctx.fillRect(0, 4, 4, 12);
      ctx.fillRect(24, 4, 4, 12);
      // Thruster Flame
      ctx.fillStyle = '#facc15';
      ctx.fillRect(11, 18, 6, 3 + Math.random() * 4);
      ctx.restore();
    }

    // Galaga Alien Fleet
    this.enemies.forEach(e => {
      if (!e.alive) return;
      ctx.save();
      ctx.translate(e.x, e.y);
      const wingFlap = Math.sin(this.fleetTime * 3 + e.homeX) > 0 ? 2 : -2;
      ctx.fillStyle = e.color;
      // Winged Insectoid Chassis
      ctx.fillRect(4, 2, e.width - 8, e.height - 4);
      ctx.fillRect(0, 4 + wingFlap, 4, e.height - 6);
      ctx.fillRect(e.width - 4, 4 + wingFlap, 4, e.height - 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 6, 3, 3);
      ctx.fillRect(e.width - 10, 6, 3, 3);
      ctx.restore();
    });

    // Lasers
    this.lasers.forEach(l => {
      ctx.fillStyle = l.color || '#facc15';
      ctx.fillRect(l.x, l.y, 4, 12);
    });
    ctx.fillStyle = '#ff003c';
    this.enemyLasers.forEach(el => {
      ctx.beginPath();
      ctx.arc(el.x, el.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Explosion Particles
    this.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillRect(pt.x, pt.y, 3, 3);
      ctx.globalAlpha = 1.0;
    });

    // Live Top Arcade HUD (Score + Wave + Live XP/Token Conversion)
    const est = (window.State && typeof State.calculateArcadeRewards === 'function')
      ? State.calculateArcadeRewards(this.score, this.wave > 1)
      : { xp: Math.floor(this.score / 25), tokens: Math.floor(this.score / 80) };

    ctx.fillStyle = 'rgba(8, 10, 16, 0.85)';
    ctx.fillRect(0, 0, 600, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Share Tech Mono"';
    ctx.fillText(`SCORE: ${this.score}`, 12, 18);
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`WAVE ${this.wave}/3`, 150, 18);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`REWARD: +${est.xp} XP / +${est.tokens}🪙`, 255, 18);
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`LIVES: ${'▲'.repeat(Math.max(0, p.lives))}`, 500, 18);

    // Game Over / Victory Summary Overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(5, 6, 11, 0.88)';
      ctx.fillRect(90, 115, 420, 210);
      ctx.strokeStyle = p.lives > 0 ? '#4ade80' : '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(90, 115, 420, 210);

      ctx.textAlign = 'center';
      ctx.fillStyle = p.lives > 0 ? '#4ade80' : '#ff003c';
      ctx.font = 'bold 20px "Chakra Petch"';
      ctx.fillText(p.lives > 0 ? "VOID FLEET ANNIHILATED!" : "STARFIGHTER DESTROYED", 300, 158);

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

window.VoidInvaders = VoidInvaders;
