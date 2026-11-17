/**
 * CLUB LOWLIFE // ARCADE CABINET 02: PAC-LOWLIFE (GRID RUNNER NEON LABYRINTH)
 * File: js/arcade/gridRunner.js
 * Mechanics: True 19x13 Neon Tile Maze, Side Warp Tunnels, 4 Distinct Ghosts,
 *            808 Power Pellets (Frightened Ghost Chomping), Turn-Buffering & Score->XP Payout
 */

const GridRunner = {
  canvas: null,
  ctx: null,
  running: false,
  gameOver: false,
  rewardsPaid: false,
  score: 0,
  lives: 3,
  frightenedTimer: 0,
  ghostCombo: 0,
  tileSize: 30,
  offsetX: 15,
  offsetY: 42,

  // 19 cols x 13 rows Symmetric Cyber-Maze (1=Wall, 0=Dot, 2=808 Power Pellet, 3=Empty/House)
  MAZE_TEMPLATE: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [3,3,1,1,0,1,1,3,3,3,3,3,1,1,0,1,1,3,3],
    [1,0,0,0,0,1,0,3,1,3,1,3,0,1,0,0,0,0,1],
    [1,0,1,1,0,0,0,3,1,1,1,3,0,0,0,1,1,0,1],
    [1,0,0,1,0,1,0,0,0,3,0,0,0,1,0,1,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],

  grid: [],
  dotsRemaining: 0,
  bonusTape: null,
  player: { col: 9, row: 9, x: 0, y: 0, dir: 'left', nextDir: 'left', speed: 2.5, mouthAngle: 0 },
  ghosts: [],

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
    if (title) title.innerText = "PAC-LOWLIFE // GRID RUNNER LABYRINTH";
    const hint = document.getElementById('arcadeControlsHint');
    if (hint) hint.innerText = "[WASD / ARROWS / D-PAD] STEER  •  EAT 808 PELLETS TO CHOMP GHOSTS  •  25 PTS = +1 XP";
    const modal = document.getElementById('arcadeModal');
    if (modal) modal.classList.remove('hidden');
    if (window.State) {
      State.activeMiniGame = this;
      if (typeof State.recordDailyAction === 'function') State.recordDailyAction('arcade_play', 1);
    }

    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.rewardsPaid = false;
    this.frightenedTimer = 0;
    this.buildMaze();
    this.resetPositions();

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

  buildMaze() {
    this.grid = this.MAZE_TEMPLATE.map(row => [...row]);
    this.dotsRemaining = 0;
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[0].length; c++) {
        if (this.grid[r][c] === 0 || this.grid[r][c] === 2) {
          this.dotsRemaining++;
        }
      }
    }
    this.bonusTape = { col: 9, row: 6, active: false, timer: 420 };
  },

  resetPositions() {
    const ts = this.tileSize;
    this.player = {
      x: this.offsetX + 9 * ts + ts / 2,
      y: this.offsetY + 9 * ts + ts / 2,
      dir: 'left',
      nextDir: 'left',
      speed: 2.5,
      mouthPhase: 0
    };

    this.ghosts = [
      { name: 'BLINK-808', color: '#ff003c', x: this.offsetX + 9 * ts + ts / 2,  y: this.offsetY + 5 * ts + ts / 2, dir: 'left',  speed: 1.68, behavior: 'chase' },
      { name: 'PINK-SYNTH', color: '#ec4899', x: this.offsetX + 8 * ts + ts / 2,  y: this.offsetY + 6 * ts + ts / 2, dir: 'up',    speed: 1.58, behavior: 'ambush' },
      { name: 'INK-GLITCH', color: '#00f0ff', x: this.offsetX + 10 * ts + ts / 2, y: this.offsetY + 6 * ts + ts / 2, dir: 'up',    speed: 1.52, behavior: 'patrol' },
      { name: 'CLYDE-BASS', color: '#f97316', x: this.offsetX + 9 * ts + ts / 2,  y: this.offsetY + 6 * ts + ts / 2, dir: 'right', speed: 1.45, behavior: 'random' }
    ];
  },

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (window.State && typeof State.recordArcadeScore === 'function') {
      State.recordArcadeScore('gridRunner', this.score);
    }
    if (!this.rewardsPaid && this.score > 0 && window.State && typeof State.awardArcadeRewards === 'function') {
      this.rewardsPaid = true;
      State.awardArcadeRewards("PAC-LOWLIFE", this.score, this.dotsRemaining === 0);
    }
  },

  endGame(cleared = false) {
    this.gameOver = true;
    this.stageCleared = cleared;
    if (window.State && typeof State.recordArcadeScore === 'function') {
      State.recordArcadeScore('gridRunner', this.score);
    }
    if (!this.rewardsPaid && window.State && typeof State.awardArcadeRewards === 'function') {
      this.rewardsPaid = true;
      State.awardArcadeRewards("PAC-LOWLIFE", this.score, cleared);
    }
  },

  isWall(col, row) {
    if (row < 0 || row >= 13) return true;
    // Allow horizontal tunnel wrap on row 6
    if (col < 0 || col >= 19) return row !== 6;
    return this.grid[row][col] === 1;
  },

  getDirVec(dir) {
    if (dir === 'left') return { dx: -1, dy: 0 };
    if (dir === 'right') return { dx: 1, dy: 0 };
    if (dir === 'up') return { dx: 0, dy: -1 };
    if (dir === 'down') return { dx: 0, dy: 1 };
    return { dx: 0, dy: 0 };
  },

  canMove(x, y, dir) {
    const ts = this.tileSize;
    const { dx, dy } = this.getDirVec(dir);
    const lookAhead = ts * 0.48;
    const checkX = x + dx * lookAhead;
    const checkY = y + dy * lookAhead;
    const col = Math.floor((checkX - this.offsetX) / ts);
    const row = Math.floor((checkY - this.offsetY) / ts);
    return !this.isWall(col, row);
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
    const ts = this.tileSize;
    const p = this.player;
    p.mouthPhase += 0.22;

    if (this.frightenedTimer > 0) this.frightenedTimer--;

    // Read Input (Keyboard + Touch D-Pad + Analog Joystick) into Turn Buffer
    const av = (window.Input && Input.analogVector && Input.analogVector.active) ? Input.analogVector : { x: 0, y: 0 };
    if ((window.Input && Input.keys.left) || av.x < -0.25) p.nextDir = 'left';
    else if ((window.Input && Input.keys.right) || av.x > 0.25) p.nextDir = 'right';
    else if ((window.Input && Input.keys.up) || av.y < -0.25) p.nextDir = 'up';
    else if ((window.Input && Input.keys.down) || av.y > 0.25) p.nextDir = 'down';

    // Snap & Turn at Tile Centers
    const col = Math.floor((p.x - this.offsetX) / ts);
    const row = Math.floor((p.y - this.offsetY) / ts);
    const centerX = this.offsetX + col * ts + ts / 2;
    const centerY = this.offsetY + row * ts + ts / 2;

    if (p.nextDir !== p.dir) {
      const isOpposite =
        (p.dir === 'left' && p.nextDir === 'right') ||
        (p.dir === 'right' && p.nextDir === 'left') ||
        (p.dir === 'up' && p.nextDir === 'down') ||
        (p.dir === 'down' && p.nextDir === 'up');

      if (isOpposite) {
        p.dir = p.nextDir;
      } else if (Math.hypot(p.x - centerX, p.y - centerY) < 6 && this.canMove(centerX, centerY, p.nextDir)) {
        p.x = centerX;
        p.y = centerY;
        p.dir = p.nextDir;
      }
    }

    if (this.canMove(p.x, p.y, p.dir)) {
      const { dx, dy } = this.getDirVec(p.dir);
      p.x += dx * p.speed;
      p.y += dy * p.speed;
      if (dx !== 0) p.y += (centerY - p.y) * 0.25;
      if (dy !== 0) p.x += (centerX - p.x) * 0.25;
    }

    // Side Warp Tunnel Wrap
    const maxW = this.offsetX + 19 * ts;
    if (p.x < this.offsetX) p.x = maxW - 4;
    else if (p.x > maxW) p.x = this.offsetX + 4;

    // Collect Dots & 808 Power Pellets
    const curCol = Math.floor((p.x - this.offsetX) / ts);
    const curRow = Math.floor((p.y - this.offsetY) / ts);
    if (curRow >= 0 && curRow < 13 && curCol >= 0 && curCol < 19) {
      const cell = this.grid[curRow][curCol];
      if (cell === 0) {
        this.grid[curRow][curCol] = 3;
        this.score += 15;
        this.dotsRemaining--;
        if (window.AudioEngine) AudioEngine.playSfx('coin');
      } else if (cell === 2) {
        this.grid[curRow][curCol] = 3;
        this.score += 50;
        this.dotsRemaining--;
        this.frightenedTimer = 420; // 7 seconds of Frightened Ghosts!
        this.ghostCombo = 0;
        if (window.AudioEngine) AudioEngine.playSfx('beat_crit');
      }
    }

    // Spawn & Collect Bonus Golden Cassette
    if (this.bonusTape) {
      this.bonusTape.timer--;
      if (this.bonusTape.timer === 0) this.bonusTape.active = true;
      if (this.bonusTape.active && curCol === this.bonusTape.col && curRow === this.bonusTape.row) {
        this.bonusTape.active = false;
        this.score += 250;
        if (window.AudioEngine) AudioEngine.playSfx('win');
      }
    }

    // Update Ghosts
    const dirs = ['up', 'down', 'left', 'right'];
    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };

    this.ghosts.forEach(g => {
      const gSpeed = this.frightenedTimer > 0 ? g.speed * 0.62 : g.speed;
      const gCol = Math.floor((g.x - this.offsetX) / ts);
      const gRow = Math.floor((g.y - this.offsetY) / ts);
      const gCenterX = this.offsetX + gCol * ts + ts / 2;
      const gCenterY = this.offsetY + gRow * ts + ts / 2;

      if (Math.hypot(g.x - gCenterX, g.y - gCenterY) < gSpeed * 0.9) {
        const validDirs = dirs.filter(d => d !== opp[g.dir] && this.canMove(gCenterX, gCenterY, d));
        if (validDirs.length === 0) {
          g.dir = opp[g.dir];
        } else if (validDirs.length > 1 || !this.canMove(gCenterX, gCenterY, g.dir)) {
          g.x = gCenterX;
          g.y = gCenterY;
          if (this.frightenedTimer > 0 || g.behavior === 'random' && Math.random() < 0.45) {
            g.dir = validDirs[Math.floor(Math.random() * validDirs.length)];
          } else {
            let tx = p.x, ty = p.y;
            if (g.behavior === 'ambush') {
              const pv = this.getDirVec(p.dir);
              tx += pv.dx * 90;
              ty += pv.dy * 90;
            }
            validDirs.sort((a, b) => {
              const va = this.getDirVec(a);
              const vb = this.getDirVec(b);
              const da = Math.hypot((gCenterX + va.dx * ts) - tx, (gCenterY + va.dy * ts) - ty);
              const db = Math.hypot((gCenterX + vb.dx * ts) - tx, (gCenterY + vb.dy * ts) - ty);
              return da - db;
            });
            g.dir = validDirs[0];
          }
        }
      }

      const gv = this.getDirVec(g.dir);
      g.x += gv.dx * gSpeed;
      g.y += gv.dy * gSpeed;

      if (g.x < this.offsetX) g.x = maxW - 4;
      else if (g.x > maxW) g.x = this.offsetX + 4;

      // Ghost Collision Check
      if (Math.hypot(g.x - p.x, g.y - p.y) < 16) {
        if (this.frightenedTimer > 0) {
          this.ghostCombo++;
          const chompPts = 200 * this.ghostCombo;
          this.score += chompPts;
          g.x = this.offsetX + 9 * ts + ts / 2;
          g.y = this.offsetY + 6 * ts + ts / 2;
          g.dir = 'up';
          if (window.AudioEngine) AudioEngine.playSfx('win');
        } else {
          this.lives--;
          if (window.AudioEngine) AudioEngine.playSfx('stomp');
          if (this.lives <= 0) {
            this.endGame(false);
          } else {
            this.resetPositions();
          }
        }
      }
    });

    if (this.dotsRemaining <= 0) {
      this.score += 500;
      if (window.AudioEngine) AudioEngine.playSfx('win');
      this.endGame(true);
    }
  },

  draw() {
    const ctx = this.ctx;
    const ts = this.tileSize;
    ctx.fillStyle = '#06080e';
    ctx.fillRect(0, 0, 600, 450);

    // Draw Maze Walls, Dots & 808 Power Pellets
    for (let r = 0; r < 13; r++) {
      for (let c = 0; c < 19; c++) {
        const x = this.offsetX + c * ts;
        const y = this.offsetY + r * ts;
        const cell = this.grid[r][c];

        if (cell === 1) {
          ctx.fillStyle = '#111c38';
          ctx.fillRect(x + 2, y + 2, ts - 4, ts - 4);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4);
        } else if (cell === 0) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(x + ts / 2, y + ts / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 2) {
          const pulse = 6 + Math.sin(Date.now() / 120) * 2;
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(x + ts / 2, y + ts / 2, pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + ts / 2, y + ts / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Bonus Golden Cassette in Center
    if (this.bonusTape && this.bonusTape.active) {
      const bx = this.offsetX + this.bonusTape.col * ts + ts / 2;
      const by = this.offsetY + this.bonusTape.row * ts + ts / 2;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(bx - 9, by - 6, 18, 12);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(bx - 9, by - 6, 18, 12);
    }

    // Draw Pac-Lowlife (Animated Chomping Mouth + Cyber Visor)
    const p = this.player;
    const mouth = 0.08 + Math.abs(Math.sin(p.mouthPhase)) * 0.28;
    let rot = 0;
    if (p.dir === 'right') rot = 0;
    else if (p.dir === 'down') rot = Math.PI * 0.5;
    else if (p.dir === 'left') rot = Math.PI;
    else if (p.dir === 'up') rot = -Math.PI * 0.5;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(rot);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 11, mouth * Math.PI, (2 - mouth) * Math.PI);
    ctx.closePath();
    ctx.fill();
    // Lowlife Cyan Visor Strip
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(0, -6, 7, 3);
    ctx.restore();

    // Draw 4 Ghosts (Classic Dome + Wavy Skirt + Directional Eyes)
    this.ghosts.forEach(g => {
      const isFrightened = this.frightenedTimer > 0;
      const isFlashing = this.frightenedTimer > 0 && this.frightenedTimer < 110 && Math.floor(Date.now() / 120) % 2 === 0;
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.fillStyle = isFrightened ? (isFlashing ? '#ffffff' : '#1d4ed8') : g.color;
      ctx.beginPath();
      ctx.arc(0, -2, 10, Math.PI, 0, false);
      ctx.lineTo(10, 10);
      ctx.lineTo(5, 7);
      ctx.lineTo(0, 10);
      ctx.lineTo(-5, 7);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.fill();

      // Ghost Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -3, 3, 0, Math.PI * 2);
      ctx.arc(4, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFrightened ? '#facc15' : '#090b10';
      ctx.beginPath();
      ctx.arc(-4, -3, 1.5, 0, Math.PI * 2);
      ctx.arc(4, -3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Live Top Arcade HUD
    const est = (window.State && typeof State.calculateArcadeRewards === 'function')
      ? State.calculateArcadeRewards(this.score, this.dotsRemaining === 0)
      : { xp: Math.floor(this.score / 25), tokens: Math.floor(this.score / 80) };

    ctx.fillStyle = 'rgba(8, 10, 16, 0.92)';
    ctx.fillRect(0, 0, 600, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Share Tech Mono"';
    ctx.fillText(`SCORE: ${this.score}`, 14, 21);
    ctx.fillStyle = '#ec4899';
    ctx.fillText(`DOTS: ${this.dotsRemaining}`, 145, 21);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`REWARD: +${est.xp} XP / +${est.tokens}🪙`, 255, 21);
    ctx.fillStyle = '#facc15';
    ctx.fillText(`LIVES: ${'●'.repeat(Math.max(0, this.lives))}`, 500, 21);

    // Game Over / Victory Summary Overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(5, 6, 11, 0.90)';
      ctx.fillRect(90, 115, 420, 210);
      ctx.strokeStyle = this.stageCleared ? '#4ade80' : '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(90, 115, 420, 210);

      ctx.textAlign = 'center';
      ctx.fillStyle = this.stageCleared ? '#4ade80' : '#ff003c';
      ctx.font = 'bold 20px "Chakra Petch"';
      ctx.fillText(this.stageCleared ? "NEON LABYRINTH CLEARED!" : "PAC-LOWLIFE DEREZZED", 300, 158);

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

window.GridRunner = GridRunner;
