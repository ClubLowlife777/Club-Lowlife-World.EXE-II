/**
 * CLUB LOWLIFE // ARCADE CABINET 01: LOWLIFE GALAGA x RAIDEN III (VOID INVADERS)
 * File: js/arcade/voidInvaders.js
 * Mechanics: Galaga Fleet + Raiden III Weapon Crystals (Red Wide Vulcan, Blue Lightning Laser,
 *            Green Undulating Proton Laser), Homing Radar Missiles, Flash-Shot 2x Multiplier,
 *            808 Overdrive Bomb & Score->XP Payout
 */

const VoidInvaders = {
  canvas: null,
  ctx: null,
  running: false,
  gameOver: false,
  rewardsPaid: false,
  animId: null,
  diveCooldown: 120,
  score: 0,
  wave: 1,
  fleetTime: 0,
  lastShot: 0,
  lastMissileTime: 0,
  bombLatch: false,
  bombFlashTimer: 0,
  player: {
    x: 284, y: 404, width: 28, height: 20,
    lives: 4, iFrames: 0,
    weaponType: 'vulcan', // 'vulcan' | 'laser' | 'proton'
    weaponLevel: 1,       // 1..3
    missileLevel: 0,      // 0..2 (Radar Missiles)
    bombs: 1,
    vx: 0
  },
  lasers: [],
  beams: [],
  missiles: [],
  enemyLasers: [],
  enemies: [],
  powerups: [],
  particles: [],
  popups: [],
  stars: [],

  WEAPON_META: {
    vulcan: { label: 'VULCAN', color: '#ff3b5c', accent: '#facc15' },
    laser:  { label: 'LASER',  color: '#00f0ff', accent: '#ffffff' },
    proton: { label: 'PROTON', color: '#4ade80', accent: '#bbf7d0' }
  },

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
    if (title) title.innerText = "LOWLIFE GALAGA // RAIDEN III EDITION";
    const hint = document.getElementById('arcadeControlsHint');
    if (hint) hint.innerText = "[A/D / ◀▶] STEER  •  [SPACE / J / FIRE] SHOOT  •  [S / ▼] 808 BOMB  •  GRAB RED/BLUE/GREEN CRYSTALS";
    const modal = document.getElementById('arcadeModal');
    if (modal) modal.classList.remove('hidden');
    if (window.State) {
      State.activeMiniGame = this;
      if (typeof State.recordDailyAction === 'function') State.recordDailyAction('arcade_play', 1);
    }

    this.score = 0;
    this.wave = 1;
    this.gameOver = false;
    this.rewardsPaid = false;
    this.diveCooldown = 140;
    this.lastShot = 0;
    this.lastMissileTime = 0;
    this.bombLatch = false;
    this.bombFlashTimer = 0;
    this.player = {
      x: 286, y: 404, width: 28, height: 20,
      lives: 4, iFrames: 60,
      weaponType: 'vulcan',
      weaponLevel: 1,
      missileLevel: 0,
      bombs: 1,
      vx: 0
    };
    this.lasers = [];
    this.beams = [];
    this.missiles = [];
    this.enemyLasers = [];
    this.powerups = [];
    this.particles = [];
    this.popups = [];

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
    this.diveCooldown = 150;
    const cmdHp = waveNum >= 2 ? 3 : 2;
    const rows = [
      { type: 'commander', hp: cmdHp, pts: 150, color: '#facc15', count: 4, startX: 165, spacing: 82, y: 54 },
      { type: 'hornet',    hp: 1,     pts: 80,  color: '#ff003c', count: 7, startX: 105, spacing: 62, y: 94 },
      { type: 'interceptor', hp: 1,   pts: 60,  color: '#00f0ff', count: 7, startX: 105, spacing: 62, y: 132 },
      { type: 'drone',     hp: 1,     pts: 50,  color: '#a855f7', count: 7, startX: 105, spacing: 62, y: 170 }
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
          y: homeY - 120 - rIdx * 20,
          width: r.type === 'commander' ? 28 : 24,
          height: r.type === 'commander' ? 20 : 16,
          hp: r.hp,
          maxHp: r.hp,
          pts: r.pts,
          color: r.color,
          alive: true,
          state: 'entering',
          flashTimer: 95, // Raiden III Flash Shot bonus window while entering/right after settling
          diveTimer: 180 + (rIdx * 45) + Math.random() * 280,
          divePhase: 0,
          diveOriginX: homeX,
          firedOnDive: false
        });
      }
    });
  },

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (window.State && typeof State.recordArcadeScore === 'function') {
      State.recordArcadeScore('voidInvaders', this.score);
    }
    if (!this.rewardsPaid && this.score > 0 && window.State && typeof State.awardArcadeRewards === 'function') {
      this.rewardsPaid = true;
      State.awardArcadeRewards("LOWLIFE GALAGA", this.score, this.wave > 1);
    }
  },

  endGame(victory = false) {
    this.gameOver = true;
    if (window.State && typeof State.recordArcadeScore === 'function') {
      State.recordArcadeScore('voidInvaders', this.score);
    }
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

  spawnPopup(x, y, text, color = '#facc15') {
    this.popups.push({ x, y, text, color, life: 34, maxLife: 34 });
  },

  maybeDropRaidenPowerup(enemy) {
    const roll = Math.random();
    const isCmd = enemy.type === 'commander';
    const isHornet = enemy.type === 'hornet';
    const dropChance = isCmd ? 0.85 : (isHornet ? 0.28 : 0.08);
    if (roll > dropChance) return;

    const kindRoll = Math.random();
    let kind = 'crystal';
    let weapon = 'vulcan';
    if (kindRoll < 0.62) {
      kind = 'crystal';
      const wList = ['vulcan', 'laser', 'proton'];
      weapon = wList[Math.floor(Math.random() * wList.length)];
    } else if (kindRoll < 0.88) {
      kind = 'radar';
    } else {
      kind = 'bomb';
    }

    this.powerups.push({
      x: enemy.x + 6,
      y: enemy.y,
      vy: 1.85,
      kind,
      weapon,
      cycleTimer: 0
    });
  },

  damageEnemy(e, dmg, hitX, hitY) {
    if (!e || !e.alive) return;
    e.hp -= dmg;
    if (e.hp <= 0) {
      e.alive = false;
      const isFlash = e.flashTimer > 0;
      const diveBonus = e.state === 'diving' ? 2 : 1;
      const flashMult = isFlash ? 2 : 1;
      const pts = e.pts * diveBonus * flashMult;
      this.score += pts;

      this.spawnParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 12);
      if (isFlash) {
        this.spawnPopup(e.x + e.width / 2, e.y - 6, `⚡FLASH +${pts}`, '#facc15');
      }
      if (window.AudioEngine) AudioEngine.playSfx('stomp');
      this.maybeDropRaidenPowerup(e);
    } else {
      e.color = '#ff003c';
      this.spawnParticles(hitX, hitY, '#facc15', 4);
      if (window.AudioEngine) AudioEngine.playSfx('spin');
    }
  },

  fireMainWeapon() {
    const p = this.player;
    const now = Date.now();
    const cx = p.x + p.width / 2;
    const cy = p.y - 4;
    const lvl = p.weaponLevel;

    if (p.weaponType === 'vulcan') {
      if (now - this.lastShot < 130) return;
      this.lastShot = now;
      const angles = lvl === 1
        ? [-0.14, 0, 0.14]
        : (lvl === 2 ? [-0.26, -0.13, 0, 0.13, 0.26] : [-0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36]);
      angles.forEach(a => {
        this.lasers.push({
          x: cx - 2, y: cy,
          vx: Math.sin(a) * 11.5, vy: -Math.cos(a) * 11.5,
          w: 4, h: 11, dmg: 1,
          color: a === 0 ? '#facc15' : '#ff3b5c'
        });
      });
      if (window.AudioEngine) AudioEngine.playSfx('laser');
    } else if (p.weaponType === 'laser') {
      // Lightning Laser: Piercing concentrated blue beam that swerves slightly with ship velocity
      if (now - this.lastShot < 95) return;
      this.lastShot = now;
      const beamW = 5 + lvl * 3;
      const swerve = (p.vx || 0) * 1.4;
      this.beams.push({
        kind: 'lightning',
        x: cx,
        swerve,
        w: beamW,
        dmg: lvl >= 3 ? 2 : 1,
        life: 6,
        maxLife: 6,
        color: '#00f0ff'
      });
      // Instant piercing beam collision check straight up the lane
      for (let e of this.enemies) {
        if (!e.alive) continue;
        const exMid = e.x + e.width / 2;
        const beamAtY = cx + swerve * ((p.y - e.y) / 400);
        if (Math.abs(exMid - beamAtY) <= (e.width / 2 + beamW / 2) && e.y < p.y) {
          this.damageEnemy(e, lvl >= 3 ? 2 : 1, exMid, e.y + e.height);
        }
      }
      if (window.AudioEngine && Math.random() < 0.45) AudioEngine.playSfx('laser');
    } else if (p.weaponType === 'proton') {
      // Proton Laser: Raiden III undulating green sweeping plasma streams
      if (now - this.lastShot < 110) return;
      this.lastShot = now;
      const streamCount = lvl + 1; // 2, 3, 4 sweeping streams
      const phase = this.fleetTime * 6.5;
      this.beams.push({
        kind: 'proton',
        x: cx,
        streamCount,
        phase,
        w: 3 + lvl,
        life: 7,
        maxLife: 7,
        color: '#4ade80'
      });
      for (let s = 0; s < streamCount; s++) {
        const sOffset = (s - (streamCount - 1) / 2) * 26;
        for (let e of this.enemies) {
          if (!e.alive || e.y >= p.y) continue;
          const t = (p.y - e.y) / 400;
          const waveX = cx + sOffset + Math.sin(phase + t * 7 + s * 1.3) * (18 + lvl * 5);
          const exMid = e.x + e.width / 2;
          if (Math.abs(exMid - waveX) <= e.width / 2 + 8) {
            this.damageEnemy(e, 1, exMid, e.y + e.height);
          }
        }
      }
      if (window.AudioEngine && Math.random() < 0.40) AudioEngine.playSfx('spin');
    }

    // Secondary Weapon: Homing Radar Missiles ('R' pod)
    if (p.missileLevel > 0) {
      const missileCd = p.missileLevel >= 2 ? 420 : 620;
      if (now - this.lastMissileTime >= missileCd) {
        this.lastMissileTime = now;
        const offsets = p.missileLevel >= 2 ? [-10, 10] : [0];
        offsets.forEach(ox => {
          this.missiles.push({
            x: cx + ox, y: cy + 4,
            vx: ox * 0.12, vy: -5.4,
            speed: 6.2,
            life: 110
          });
        });
      }
    }
  },

  triggerOverdriveBomb() {
    const p = this.player;
    if (p.bombs <= 0) return;
    p.bombs--;
    p.iFrames = Math.max(p.iFrames, 70);
    this.bombFlashTimer = 18;
    this.enemyLasers = [];
    this.spawnPopup(300, 220, "💣 808 OVERDRIVE BOMB!", '#00f0ff');
    if (window.AudioEngine) AudioEngine.playSfx('win');
    if (window.State && typeof State.triggerScreenShake === 'function') {
      State.triggerScreenShake(12, 20);
    }

    this.enemies.forEach(e => {
      if (e.alive) {
        this.damageEnemy(e, 2, e.x + e.width / 2, e.y + e.height / 2);
      }
    });
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
    this.fleetTime += 0.032;
    if (this.diveCooldown > 0) this.diveCooldown--;
    if (this.bombFlashTimer > 0) this.bombFlashTimer--;
    const p = this.player;
    if (p.iFrames > 0) p.iFrames--;

    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > 450) { s.y = 0; s.x = Math.random() * 600; }
    });

    const prevX = p.x;
    const ax = (window.Input && Input.analogVector && Input.analogVector.active) ? Input.analogVector.x : 0;
    if ((window.Input && Input.keys.left) || ax < -0.18) p.x = Math.max(14, p.x - 5.6);
    if ((window.Input && Input.keys.right) || ax > 0.18) p.x = Math.min(558, p.x + 5.6);
    p.vx = p.x - prevX;

    // 808 Overdrive Bomb ([S] / [ArrowDown] / Mobile [▼])
    const wantsBomb = !!(window.Input && Input.keys.down);
    if (wantsBomb && !this.bombLatch) {
      this.bombLatch = true;
      this.triggerOverdriveBomb();
    } else if (!wantsBomb) {
      this.bombLatch = false;
    }

    // Fire Active Raiden III Weapon + Missiles
    const wantsFire = window.Input && (Input.keys.fire || Input.keys.up || Input.keys.shift);
    if (wantsFire) {
      this.fireMainWeapon();
    }

    // Update Vulcan Bullets
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.x += (l.vx || 0);
      l.y += l.vy;
      let hit = false;
      for (let e of this.enemies) {
        if (e.alive && l.x + 6 > e.x - 2 && l.x - 2 < e.x + e.width + 2 && l.y < e.y + e.height + 2 && l.y + 12 > e.y - 2) {
          this.damageEnemy(e, l.dmg || 1, l.x, l.y);
          hit = true;
          break;
        }
      }
      if (hit || l.y < -15 || l.x < -15 || l.x > 615) this.lasers.splice(i, 1);
    }

    // Update Beams (visual decay)
    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life--;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }

    // Update Homing Radar Missiles
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.life--;
      let target = null;
      let bestDist = Infinity;
      for (let e of this.enemies) {
        if (!e.alive) continue;
        const d = Math.hypot((e.x + e.width / 2) - m.x, (e.y + e.height / 2) - m.y) - (e.state === 'diving' ? 75 : 0);
        if (d < bestDist) { bestDist = d; target = e; }
      }
      if (target) {
        const ang = Math.atan2((target.y + target.height / 2) - m.y, (target.x + target.width / 2) - m.x);
        const curAng = Math.atan2(m.vy, m.vx);
        let diff = ang - curAng;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const nextAng = curAng + Math.max(-0.14, Math.min(0.14, diff));
        m.vx = Math.cos(nextAng) * m.speed;
        m.vy = Math.sin(nextAng) * m.speed;
      }
      m.x += m.vx;
      m.y += m.vy;

      let detonated = false;
      for (let e of this.enemies) {
        if (e.alive && Math.hypot((e.x + e.width / 2) - m.x, (e.y + e.height / 2) - m.y) < 18) {
          detonated = true;
          // Radar Missile AoE Blast
          this.spawnParticles(m.x, m.y, '#c084fc', 14);
          for (let splash of this.enemies) {
            if (splash.alive && Math.hypot((splash.x + splash.width / 2) - m.x, (splash.y + splash.height / 2) - m.y) <= 42) {
              this.damageEnemy(splash, 1, m.x, m.y);
            }
          }
          break;
        }
      }
      if (detonated || m.life <= 0 || m.y < -20 || m.x < -20 || m.x > 620) {
        this.missiles.splice(i, 1);
      }
    }

    // Update Raiden III Crystals & Secondary Pods
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      pw.y += pw.vy;
      if (pw.kind === 'crystal') {
        pw.cycleTimer = (pw.cycleTimer || 0) + 1;
        // Cycle crystal color every ~2.2 seconds just like Raiden III!
        if (pw.cycleTimer % 130 === 0) {
          const order = ['vulcan', 'laser', 'proton'];
          pw.weapon = order[(order.indexOf(pw.weapon) + 1) % order.length];
        }
      }
      if (Math.hypot((pw.x + 9) - (p.x + 14), (pw.y + 7) - (p.y + 10)) < 26) {
        if (pw.kind === 'crystal') {
          if (p.weaponType === pw.weapon) {
            if (p.weaponLevel < 3) {
              p.weaponLevel++;
              this.spawnPopup(p.x + 14, p.y - 12, `${this.WEAPON_META[pw.weapon].label} LVL ${p.weaponLevel}!`, this.WEAPON_META[pw.weapon].color);
            } else {
              this.score += 250;
              this.spawnPopup(p.x + 14, p.y - 12, `MAX POWER +250!`, '#facc15');
            }
          } else {
            p.weaponType = pw.weapon;
            this.spawnPopup(p.x + 14, p.y - 12, `EQUIPPED ${this.WEAPON_META[pw.weapon].label}!`, this.WEAPON_META[pw.weapon].color);
          }
        } else if (pw.kind === 'radar') {
          p.missileLevel = Math.min(2, p.missileLevel + 1);
          this.score += 120;
          this.spawnPopup(p.x + 14, p.y - 12, `RADAR MISSILE LVL ${p.missileLevel}!`, '#c084fc');
        } else if (pw.kind === 'bomb') {
          p.bombs = Math.min(4, p.bombs + 1);
          this.score += 100;
          this.spawnPopup(p.x + 14, p.y - 12, `+1 808 BOMB!`, '#facc15');
        }
        if (window.AudioEngine) AudioEngine.playSfx('win');
        this.powerups.splice(i, 1);
      } else if (pw.y > 460) {
        this.powerups.splice(i, 1);
      }
    }

    // Update Galaga Fleet & Controlled Dive-Bombers
    const swayOffset = Math.sin(this.fleetTime) * 30;
    let aliveCount = 0;
    let activeDivers = this.enemies.filter(e => e.alive && e.state === 'diving').length;
    const maxDivers = this.wave === 1 ? 1 : 2;
    const maxEnemyLasers = 2 + this.wave;

    this.enemies.forEach(e => {
      if (!e.alive) return;
      aliveCount++;
      if (e.flashTimer > 0) e.flashTimer--;

      const targetHomeX = e.homeX + swayOffset;
      const targetHomeY = e.homeY + Math.cos(this.fleetTime * 1.4 + e.homeX * 0.02) * 3;

      if (e.state === 'entering') {
        e.x += (targetHomeX - e.x) * 0.11;
        e.y += (targetHomeY - e.y) * 0.11;
        if (Math.hypot(targetHomeX - e.x, targetHomeY - e.y) < 3) {
          e.state = 'formation';
        }
      } else if (e.state === 'formation') {
        e.x = targetHomeX;
        e.y = targetHomeY;
        e.diveTimer--;
        if (e.diveTimer <= 0 && activeDivers < maxDivers && this.diveCooldown <= 0) {
          e.state = 'diving';
          e.divePhase = 0;
          e.diveOriginX = e.x;
          e.firedOnDive = false;
          e.flashTimer = 75; // Fresh Flash Shot window on dive initiation
          activeDivers++;
          this.diveCooldown = Math.max(85, 165 - this.wave * 20);
        }
        if (this.enemyLasers.length < maxEnemyLasers && Math.random() < (0.00055 + this.wave * 0.0002)) {
          this.enemyLasers.push({ x: e.x + e.width / 2, y: e.y + e.height, vx: 0, vy: 3.1 + this.wave * 0.25 });
        }
      } else if (e.state === 'diving') {
        e.divePhase += 0.042;
        e.y += 1.75 + this.wave * 0.22;
        e.x = Math.max(18, Math.min(554, e.diveOriginX + Math.sin(e.divePhase * 1.9) * 44 + ((p.x - e.diveOriginX) * 0.16)));

        if (!e.firedOnDive && e.y > 140 && e.y < 230 && this.enemyLasers.length < maxEnemyLasers) {
          e.firedOnDive = true;
          const aim = Math.atan2(p.y - e.y, p.x - e.x);
          this.enemyLasers.push({
            x: e.x + e.width / 2, y: e.y + e.height,
            vx: Math.cos(aim) * 2.2, vy: Math.max(2.8, Math.sin(aim) * 3.4)
          });
        }

        if (p.iFrames <= 0 && Math.hypot((e.x + e.width / 2) - (p.x + 14), (e.y + e.height / 2) - (p.y + 10)) < 17) {
          e.alive = false;
          this.damagePlayer();
        }

        if (e.y > 465) {
          e.y = -30;
          e.state = 'entering';
          e.diveTimer = 220 + Math.random() * 240;
          e.firedOnDive = false;
        }
      }
    });

    // Enemy Lasers Hit Check
    for (let i = this.enemyLasers.length - 1; i >= 0; i--) {
      const el = this.enemyLasers[i];
      el.x += (el.vx || 0);
      el.y += el.vy;
      if (p.iFrames <= 0 && Math.hypot(el.x - (p.x + 14), el.y - (p.y + 10)) < 11) {
        this.enemyLasers.splice(i, 1);
        this.damagePlayer();
      } else if (el.y > 460 || el.x < 0 || el.x > 600) {
        this.enemyLasers.splice(i, 1);
      }
    }

    // Particles & Floating Popups
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y -= 0.7;
      pop.life--;
      if (pop.life <= 0) this.popups.splice(i, 1);
    }

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
    p.iFrames = 60;
    p.weaponLevel = Math.max(1, p.weaponLevel - 1);
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

    // 808 Overdrive Bomb Shockwave Flash
    if (this.bombFlashTimer > 0) {
      ctx.save();
      ctx.globalAlpha = (this.bombFlashTimer / 18) * 0.45;
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(0, 0, 600, 450);
      ctx.restore();
    }

    // Raiden III Crystal & Pod Powerups
    this.powerups.forEach(pw => {
      ctx.save();
      if (pw.kind === 'crystal') {
        const meta = this.WEAPON_META[pw.weapon] || this.WEAPON_META.vulcan;
        ctx.fillStyle = meta.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pw.x + 9, pw.y);
        ctx.lineTo(pw.x + 18, pw.y + 7);
        ctx.lineTo(pw.x + 9, pw.y + 14);
        ctx.lineTo(pw.x, pw.y + 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = pw.kind === 'radar' ? '#a855f7' : '#eab308';
        ctx.fillRect(pw.x, pw.y, 18, 14);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(pw.x, pw.y, 18, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Share Tech Mono"';
        ctx.fillText(pw.kind === 'radar' ? 'R' : 'B', pw.x + 6, pw.y + 10);
      }
      ctx.restore();
    });

    // Lightning & Proton Laser Beams
    const p = this.player;
    this.beams.forEach(b => {
      ctx.save();
      ctx.globalAlpha = Math.max(0.25, b.life / b.maxLife);
      if (b.kind === 'lightning') {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = b.w;
        ctx.beginPath();
        ctx.moveTo(b.x, p.y);
        ctx.lineTo(b.x + b.swerve, 28);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, b.w * 0.4);
        ctx.stroke();
      } else if (b.kind === 'proton') {
        for (let s = 0; s < b.streamCount; s++) {
          const sOff = (s - (b.streamCount - 1) / 2) * 26;
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = b.w;
          ctx.beginPath();
          for (let y = p.y; y >= 28; y -= 16) {
            const t = (p.y - y) / 400;
            const wx = b.x + sOff + Math.sin(b.phase + t * 7 + s * 1.3) * (18 + p.weaponLevel * 5);
            if (y === p.y) ctx.moveTo(wx, y);
            else ctx.lineTo(wx, y);
          }
          ctx.stroke();
          ctx.strokeStyle = '#ecfdf5';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
      ctx.restore();
    });

    // Player Starfighter
    const activeMeta = this.WEAPON_META[p.weaponType] || this.WEAPON_META.vulcan;
    if (p.lives > 0 && p.iFrames % 4 < 2) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = activeMeta.color;
      ctx.beginPath();
      ctx.moveTo(14, -4);
      ctx.lineTo(20, 18);
      ctx.lineTo(8, 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 8, 28, 6);
      ctx.fillStyle = '#ff003c';
      ctx.fillRect(0, 4, 4, 12);
      ctx.fillRect(24, 4, 4, 12);
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
      ctx.fillRect(4, 2, e.width - 8, e.height - 4);
      ctx.fillRect(0, 4 + wingFlap, 4, e.height - 6);
      ctx.fillRect(e.width - 4, 4 + wingFlap, 4, e.height - 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 6, 3, 3);
      ctx.fillRect(e.width - 10, 6, 3, 3);
      ctx.restore();
    });

    // Vulcan Bullets & Radar Missiles
    this.lasers.forEach(l => {
      ctx.fillStyle = l.color || '#facc15';
      ctx.fillRect(l.x, l.y, l.w || 4, l.h || 11);
    });
    this.missiles.forEach(m => {
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(m.x - 2, m.y - 5, 4, 10);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(m.x - 1, m.y + 4, 2, 4);
    });
    ctx.fillStyle = '#ff003c';
    this.enemyLasers.forEach(el => {
      ctx.beginPath();
      ctx.arc(el.x, el.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Explosion Particles & Popups
    this.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillRect(pt.x, pt.y, 3, 3);
      ctx.globalAlpha = 1.0;
    });
    this.popups.forEach(pop => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.life / pop.maxLife);
      ctx.fillStyle = pop.color;
      ctx.font = 'bold 10px "Share Tech Mono"';
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    });

    // Live Top Arcade HUD
    const est = (window.State && typeof State.calculateArcadeRewards === 'function')
      ? State.calculateArcadeRewards(this.score, this.wave > 1)
      : { xp: Math.floor(this.score / 25), tokens: Math.floor(this.score / 80) };

    ctx.fillStyle = 'rgba(8, 10, 16, 0.90)';
    ctx.fillRect(0, 0, 600, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Share Tech Mono"';
    ctx.fillText(`SCORE:${this.score}`, 8, 19);
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`W${this.wave}/3`, 112, 19);
    ctx.fillStyle = activeMeta.color;
    ctx.fillText(`${activeMeta.label} L${p.weaponLevel}${p.missileLevel > 0 ? `+R${p.missileLevel}` : ''}`, 158, 19);
    ctx.fillStyle = '#facc15';
    ctx.fillText(`💣${p.bombs}`, 265, 19);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`+${est.xp}XP/+${est.tokens}🪙`, 312, 19);
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`LIVES:${'▲'.repeat(Math.max(0, p.lives))}`, 492, 19);

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
