/**
 * CLUB LOWLIFE // CORE COMBAT & TARGETING ENGINE
 * File: js/world/combat.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Ray-Casting & AABB Physics
 */

const Combat = {
  projectiles: [],
  enemyProjectiles: [],
  meleeSlashes: [],
  explosions: [],
  floatingNumbers: [],

  comboStep: 0,
  lastSlashTapTime: 0,
  COMBO_RESET_WINDOW_MS: 1200,
  isHoldingSlash: false,
  slashHoldStartTime: 0,
  isChargingShoot: false,
  shootChargeStartTime: 0,
  shootCooldown: 0,

  checkCollision(r1, r2) {
    return (
      r1 && r2 &&
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  },

  startShootInput() {
    if (window.AudioEngine && AudioEngine.init) AudioEngine.init();
    if (Date.now() < this.shootCooldown) return;
    this.isChargingShoot = true;
    this.shootChargeStartTime = Date.now();
    const chargeFill = document.getElementById('btnShootChargeFill');
    if (chargeFill) chargeFill.style.opacity = '1';
  },

  releaseShootInput() {
    if (!this.isChargingShoot) return;
    this.isChargingShoot = false;
    const chargeFill = document.getElementById('btnShootChargeFill');
    if (chargeFill) chargeFill.style.opacity = '0';

    const holdSeconds = (Date.now() - this.shootChargeStartTime) / 1000;
    const p = Entities.player;
    let vx = 0, vy = 0;
    if (p.direction === 'up') vy = -1;
    else if (p.direction === 'down') vy = 1;
    else if (p.direction === 'left') vx = -1;
    else if (p.direction === 'right') vx = 1;

    if (holdSeconds >= 1.0) {
      this.shootCooldown = Date.now() + 850;
      if (window.AudioEngine) AudioEngine.playSfx('laser');
      this.projectiles.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        vx: vx * 8.5, vy: vy * 8.5, speed: 8.5, radius: 14,
        isCharged: true, damage: 120, aoeRadius: 150, life: 85, color: '#00f0ff'
      });
      if (window.State) State.showToast("RELEASED CHARGED PLASMA ORB! 💥");
    } else {
      this.shootCooldown = Date.now() + 180;
      if (window.AudioEngine) AudioEngine.playSfx('laser');
      this.projectiles.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        vx: vx * 12.5, vy: vy * 12.5, speed: 12.5, radius: 5,
        isCharged: false, damage: 30, aoeRadius: 0, life: 60, color: '#facc15'
      });
    }
  },

  startSlashInput() {
    if (window.AudioEngine && AudioEngine.init) AudioEngine.init();
    const now = Date.now();
    this.isHoldingSlash = true;
    this.slashHoldStartTime = now;
    if (now - this.lastSlashTapTime > this.COMBO_RESET_WINDOW_MS) {
      this.comboStep = 0;
    }
    const ring = document.getElementById('btnSlashChargeRing');
    if (ring) ring.style.opacity = '1';
  },

  releaseSlashInput() {
    if (!this.isHoldingSlash) return;
    this.isHoldingSlash = false;
    const ring = document.getElementById('btnSlashChargeRing');
    if (ring) ring.style.opacity = '0';

    const now = Date.now();
    const holdSeconds = (now - this.slashHoldStartTime) / 1000;

    if (holdSeconds >= 1.5) {
      this.executeDevastatingChargeSlash();
      this.comboStep = 0;
      this.lastSlashTapTime = now;
    } else if (holdSeconds >= 0.7) {
      this.executeMidChargeSlash();
      this.comboStep = 0;
      this.lastSlashTapTime = now;
    } else {
      this.executeComboSlash(this.comboStep);
      this.comboStep = (this.comboStep + 1) % 4;
      this.lastSlashTapTime = now;
    }
  },

  executeComboSlash(step) {
    const p = Entities.player;
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;
    const offset = 34;

    if (p.direction === 'up') slashY -= offset;
    else if (p.direction === 'down') slashY += offset;
    else if (p.direction === 'left') slashX -= offset;
    else if (p.direction === 'right') slashX += offset;

    if (step === 0) {
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      this.meleeSlashes.push({ x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'stab_thrust', color: '#ff003c', radius: 36, life: 9, damage: 35 });
      this.checkMeleeHits(slashX, slashY, 48, 35, false, p.direction);
    } else if (step === 1) {
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      this.meleeSlashes.push({ x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'crescent_sweep', color: '#00f0ff', radius: 48, life: 11, damage: 50 });
      this.checkMeleeHits(slashX, slashY, 56, 50, false, p.direction);
    } else if (step === 2) {
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      this.meleeSlashes.push({ x: p.x + p.width / 2, y: p.y + p.height / 2, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'spinning_vortex', color: '#ff7700', radius: 64, life: 13, damage: 75 });
      this.checkMeleeHits(p.x + p.width / 2, p.y + p.height / 2, 72, 75, false, 'radial');
    } else if (step === 3) {
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      if (window.State) State.triggerScreenShake(7, 14);
      this.meleeSlashes.push({ x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'ground_slam', color: '#facc15', radius: 76, life: 15, damage: 100 });
      this.checkMeleeHits(slashX, slashY, 82, 100, true, p.direction);
    }
  },

  executeMidChargeSlash() {
    const p = Entities.player;
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;
    const offset = 38;

    if (p.direction === 'up') slashY -= offset;
    else if (p.direction === 'down') slashY += offset;
    else if (p.direction === 'left') slashX -= offset;
    else if (p.direction === 'right') slashX += offset;

    if (window.AudioEngine) AudioEngine.playSfx('slash');
    this.meleeSlashes.push({ x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'crescent_sweep', color: '#ff7700', radius: 64, life: 14, damage: 115 });
    this.checkMeleeHits(slashX, slashY, 74, 115, true, p.direction);
  },

  executeDevastatingChargeSlash() {
    const p = Entities.player;
    const slashX = p.x + p.width / 2;
    const slashY = p.y + p.height / 2;

    if (window.AudioEngine) AudioEngine.playSfx('win');
    if (window.State) State.triggerScreenShake(16, 28);

    this.meleeSlashes.push({ x: slashX, y: slashY, originX: slashX, originY: slashY, dir: p.direction, type: 'devastating_breaker', color: '#a855f7', radius: 95, life: 25, damage: 185 });
    this.explosions.push({ x: slashX, y: slashY, radius: 10, maxRadius: 220, color: '#a855f7', life: 30 });

    if (State.currentDimension === 'wasteland') {
      Entities.hostileNpcs.forEach(n => {
        if (n.alive) {
          const dist = Math.hypot((n.x + n.width / 2) - slashX, (n.y + n.height / 2) - slashY);
          if (dist <= 220) {
            const angle = Math.atan2((n.y + n.height / 2) - slashY, (n.x + n.width / 2) - slashX);
            const knockDir = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
              ? (Math.cos(angle) > 0 ? 'right' : 'left') : (Math.sin(angle) > 0 ? 'down' : 'up');
            Entities.damageNpc(n, 185, knockDir);
            this.spawnDamageNumber(n.x + n.width / 2, n.y - 12, 185, '#a855f7', true);
          }
        }
      });
    }

    if (State.currentDimension === 'underground' && Entities.trainingDummies) {
      Entities.trainingDummies.forEach(d => {
        if (Math.hypot((d.x + d.width / 2) - slashX, (d.y + d.height / 2) - slashY) <= 220) {
          this.spawnDamageNumber(d.x + d.width / 2, d.y - 12, 185, '#a855f7', true);
        }
      });
    }

    this.checkDestructibleDoors(slashX, slashY, 130, 185, true);
    if (window.State) State.showToast("DEVASTATING COSMIC SHOCKWAVE DISCHARGED! ⚡💜");
  },

  checkMeleeHits(hitX, hitY, hitRadius, damage, isCharged, knockDirMode) {
    if (State.currentDimension === 'wasteland') {
      Entities.hostileNpcs.forEach(npc => {
        if (npc.alive) {
          const dist = Math.hypot((npc.x + npc.width / 2) - hitX, (npc.y + npc.height / 2) - hitY);
          if (dist <= hitRadius) {
            let actualKnockDir = knockDirMode;
            if (knockDirMode === 'radial') {
              const angle = Math.atan2((npc.y + npc.height / 2) - hitY, (npc.x + npc.width / 2) - hitX);
              actualKnockDir = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
                ? (Math.cos(angle) > 0 ? 'right' : 'left') : (Math.sin(angle) > 0 ? 'down' : 'up');
            }
            Entities.damageNpc(npc, damage, actualKnockDir);
            this.spawnDamageNumber(npc.x + npc.width / 2, npc.y - 8, damage, isCharged ? '#ff7700' : '#ffffff', isCharged);
          }
        }
      });
      this.checkDestructibleDoors(hitX, hitY, hitRadius, damage, isCharged);
    }

    if (State.currentDimension === 'underground' && Entities.trainingDummies) {
      Entities.trainingDummies.forEach(dummy => {
        if (Math.hypot((dummy.x + dummy.width / 2) - hitX, (dummy.y + dummy.height / 2) - hitY) <= hitRadius) {
          if (window.AudioEngine) AudioEngine.playSfx('stomp');
          this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 8, damage, isCharged ? '#ff7700' : '#00f0ff', isCharged);
        }
      });
    }
  },

  checkDestructibleDoors(hitX, hitY, hitRadius, damage, isCharged) {
    if (State.currentDimension !== 'wasteland' || !window.Dimensions || !Dimensions.destructibleDoors) return;
    Dimensions.destructibleDoors.forEach(d => {
      if (!d.shattered) {
        if (Math.hypot((d.x + d.width / 2) - hitX, (d.y + d.height / 2) - hitY) <= hitRadius + 30) {
          if (isCharged) {
            d.hp -= damage;
            if (window.AudioEngine) AudioEngine.playSfx('stomp');
            this.spawnDamageNumber(d.x + d.width / 2, d.y - 14, damage, '#ff003c', true);
            if (d.hp <= 0) {
              d.shattered = true;
              if (window.AudioEngine) AudioEngine.playSfx('win');
              if (window.State) {
                State.triggerScreenShake(14, 24);
                State.showToast("BREACH DESTROYED // SECRET PATH OPENED! 🚪🔓");
                State.save();
              }
            } else {
              if (window.State) State.showToast(`DOOR INTEGRITY: ${d.hp}/${d.maxHp} HP`);
            }
          } else {
            if (window.State) State.showToast("ARMORED: REQUIRES CHARGED ATTACK!");
          }
        }
      }
    });
  },

  spawnDamageNumber(x, y, amount, color = '#ffffff', isCrit = false) {
    this.floatingNumbers.push({
      x: x + (Math.random() * 16 - 8), y: y, text: isCrit ? `CRIT ${amount}` : `-${amount}`,
      color: color, scale: isCrit ? 1.3 : 1.0, life: 35, maxLife: 35
    });
  },

  update() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (State.currentDimension === 'wasteland') {
        let bestTarget = null, bestScore = -Infinity;
        for (let n of Entities.hostileNpcs) {
          if (n.alive) {
            const dx = (n.x + n.width / 2) - p.x;
            const dy = (n.y + n.height / 2) - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 650) {
              const currentAngle = Math.atan2(p.vy, p.vx);
              const targetAngle = Math.atan2(dy, dx);
              let angleDiff = Math.abs(targetAngle - currentAngle);
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              angleDiff = Math.abs(angleDiff);
              const totalScore = ((Math.PI - angleDiff) / Math.PI) * 1.5 + ((650 - dist) / 650);
              if (totalScore > bestScore) { bestScore = totalScore; bestTarget = n; }
            }
          }
        }
        if (bestTarget) {
          const targetAngle = Math.atan2((bestTarget.y + bestTarget.height / 2) - p.y, (bestTarget.x + bestTarget.width / 2) - p.x);
          const currentAngle = Math.atan2(p.vy, p.vx);
          let angleDiff = targetAngle - currentAngle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          const turnRate = p.isCharged ? 0.12 : 0.22;
          const newAngle = currentAngle + Math.max(-turnRate, Math.min(turnRate, angleDiff));
          p.vx = Math.cos(newAngle) * p.speed; p.vy = Math.sin(newAngle) * p.speed;
        }
      }

      p.x += p.vx; p.y += p.vy; p.life--;

      let hit = false;
      const pBox = { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 };

      if (State.currentDimension === 'wasteland' && window.Dimensions) {
        if (Dimensions.destructibleDoors) {
          Dimensions.destructibleDoors.forEach(d => {
            if (!d.shattered && this.checkCollision(pBox, d)) {
              hit = true;
              if (p.isCharged) {
                d.hp -= p.damage;
                this.spawnDamageNumber(d.x + d.width / 2, d.y - 10, p.damage, '#00f0ff', true);
                if (d.hp <= 0) { d.shattered = true; if(window.State) State.save(); }
              }
            }
          });
        }
        if (!hit) {
          for (let npc of Entities.hostileNpcs) {
            if (npc.alive && this.checkCollision(pBox, npc)) {
              Entities.damageNpc(npc, p.damage, p.vx > 0 ? 'right' : 'left');
              this.spawnDamageNumber(npc.x + npc.width / 2, npc.y - 10, p.damage, p.isCharged ? '#00f0ff' : '#facc15', p.isCharged);
              hit = true; break;
            }
          }
        }
      }

      if (!hit && State.currentDimension === 'underground' && Entities.trainingDummies) {
        for (let dummy of Entities.trainingDummies) {
          if (this.checkCollision(pBox, dummy)) {
            if (window.AudioEngine) AudioEngine.playSfx('stomp');
            this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 10, p.damage, p.isCharged ? '#00f0ff' : '#facc15', p.isCharged);
            hit = true; break;
          }
        }
      }

      if (!hit && window.Dimensions) {
        const obs = Dimensions.getActiveObstacles ? Dimensions.getActiveObstacles() : [];
        for (let o of obs) {
          if (this.checkCollision(pBox, o)) { hit = true; break; }
        }
      }

      if (hit) {
        if (p.isCharged) {
          if (window.AudioEngine) AudioEngine.playSfx('stomp');
          if (window.State) State.triggerScreenShake(9, 16);
          this.explosions.push({ x: p.x, y: p.y, radius: 10, maxRadius: p.aoeRadius, color: '#00f0ff', life: 24 });
          if (State.currentDimension === 'wasteland') {
            Entities.hostileNpcs.forEach(n => {
              if (n.alive && Math.hypot((n.x + n.width / 2) - p.x, (n.y + n.height / 2) - p.y) <= p.aoeRadius) {
                Entities.damageNpc(n, 85, 'down');
                this.spawnDamageNumber(n.x + n.width / 2, n.y - 8, 85, '#00f0ff', true);
              }
            });
          }
        }
        this.projectiles.splice(i, 1);
      } else if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx; ep.y += ep.vy; ep.life--;
      const p = Entities.player;
      if (Math.hypot((p.x + p.width / 2) - ep.x, (p.y + p.height / 2) - ep.y) < p.width * 0.7) {
        Entities.damagePlayer(ep.damage, ep.vx > 0 ? 'right' : 'left');
        this.spawnDamageNumber(p.x + p.width / 2, p.y - 14, ep.damage, '#ff003c', false);
        this.enemyProjectiles.splice(i, 1);
      } else if (ep.life <= 0) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    for (let i = this.meleeSlashes.length - 1; i >= 0; i--) {
      this.meleeSlashes[i].life--;
      if (this.meleeSlashes[i].life <= 0) this.meleeSlashes.splice(i, 1);
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.radius += (exp.maxRadius - exp.radius) * 0.28;
      exp.life--;
      if (exp.life <= 0) this.explosions.splice(i, 1);
    }
    for (let i = this.floatingNumbers.length - 1; i >= 0; i--) {
      const fn = this.floatingNumbers[i];
      fn.y -= 0.85; fn.life--;
      if (fn.life <= 0) this.floatingNumbers.splice(i, 1);
    }
  },

  renderDamageNumbers(ctx) {
    if (!this.floatingNumbers || this.floatingNumbers.length === 0) return;
    this.floatingNumbers.forEach(fn => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, fn.life / fn.maxLife);
      ctx.font = `bold ${Math.floor(10 * fn.scale)}px "Share Tech Mono"`;
      ctx.fillStyle = fn.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(fn.text, fn.x, fn.y);
      ctx.restore();
    });
  }
};
