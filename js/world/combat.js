/**
 * CLUB LOWLIFE // CORE COMBAT & TARGETING ENGINE
 * File: js/world/combat.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Physics
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
      r1.x < r2.x + (r2.width || 0) &&
      r1.x + (r1.width || 0) > r2.x &&
      r1.y < r2.y + (r2.height || 0) &&
      r1.y + (r1.height || 0) > r2.y
    );
  },

  startShootInput() {
    if (window.AudioEngine && typeof AudioEngine.init === 'function') AudioEngine.init();
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

    if (!window.Entities || !Entities.player) return;
    const p = Entities.player;

    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);
    const hasTapeSaturator = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_tape_saturator'));

    const holdSeconds = (Date.now() - this.shootChargeStartTime) / 1000;
    const requiredHold = isHypercharged ? 0.5 : 1.0;

    let vx = 0, vy = 0;
    const dir = p.direction || 'down';

    if (dir === 'up') vy = -1;
    else if (dir === 'down') vy = 1;
    else if (dir === 'left') vx = -1;
    else if (dir === 'right') vx = 1;
    else vy = 1;

    // Analog Tape Saturator boosts damage by 35% and alters color to warm orange[cite: 2, 6, 14]
    const damageMultiplier = (hasTapeSaturator ? 1.35 : 1.0) * (isHypercharged ? 1.5 : 1.0);
    const plasmaColor = hasTapeSaturator ? '#f97316' : '#00f0ff';

    if (holdSeconds >= requiredHold) {
      this.shootCooldown = Date.now() + (isHypercharged ? 400 : 850);
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('laser');
      const dmg = Math.round(120 * damageMultiplier);
      this.projectiles.push({
        x: p.x + (p.width || 26) / 2, 
        y: p.y + (p.height || 38) / 2,
        vx: vx * 9.5, vy: vy * 9.5, speed: 9.5, radius: 14,
        isCharged: true, damage: dmg, aoeRadius: 150, life: 85, color: plasmaColor
      });
      if (window.State && typeof State.showToast === 'function') State.showToast("RELEASED CHARGED PLASMA ORB! 💥");
    } else {
      this.shootCooldown = Date.now() + 180;
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('laser');
      const dmg = Math.round(30 * damageMultiplier);
      this.projectiles.push({
        x: p.x + (p.width || 26) / 2, 
        y: p.y + (p.height || 38) / 2,
        vx: vx * 13, vy: vy * 13, speed: 13, radius: 5,
        isCharged: false, damage: dmg, aoeRadius: 0, life: 60, color: hasTapeSaturator ? '#fbbf24' : '#facc15'
      });
    }
  },

  startSlashInput() {
    if (window.AudioEngine && typeof AudioEngine.init === 'function') AudioEngine.init();
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
    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);

    const devastatingThreshold = isHypercharged ? 0.75 : 1.5;
    const midThreshold = isHypercharged ? 0.35 : 0.7;

    if (holdSeconds >= devastatingThreshold) {
      this.executeDevastatingChargeSlash();
      this.comboStep = 0;
      this.lastSlashTapTime = now;
    } else if (holdSeconds >= midThreshold) {
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
    if (!window.Entities || !Entities.player) return;
    const p = Entities.player;
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;
    const offset = 34;

    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);
    const dmgMult = isHypercharged ? 1.6 : 1.0;

    if (p.direction === 'up') slashY -= offset;
    else if (p.direction === 'down') slashY += offset;
    else if (p.direction === 'left') slashX -= offset;
    else if (p.direction === 'right') slashX += offset;

    if (step === 0) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('slash');
      const dmg = Math.round(35 * dmgMult);
      this.meleeSlashes.push({ x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'stab_thrust', color: '#ff003c', radius: 36, life: 9, damage: dmg });
      this.checkMeleeHits(slashX, slashY, 48, dmg, false, p.direction);
    } else if (step === 1) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('slash');
      const dmg = Math.round(50 * dmgMult);
      this.meleeSlashes.push({ x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'crescent_sweep', color: '#00f0ff', radius: 48, life: 11, damage: dmg });
      this.checkMeleeHits(slashX, slashY, 56, dmg, false, p.direction);
    } else if (step === 2) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('slash');
      const dmg = Math.round(75 * dmgMult);
      this.meleeSlashes.push({ x: p.x + p.width / 2, y: p.y + p.height / 2, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'spinning_vortex', color: '#ff7700', radius: 64, life: 13, damage: dmg });
      this.checkMeleeHits(p.x + p.width / 2, p.y + p.height / 2, 72, dmg, false, 'radial');
    } else if (step === 3) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('slash');
      if (window.State && typeof State.triggerScreenShake === 'function') State.triggerScreenShake(7, 14);
      const dmg = Math.round(100 * dmgMult);
      this.meleeSlashes.push({ x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'ground_slam', color: '#facc15', radius: 76, life: 15, damage: dmg });
      this.checkMeleeHits(slashX, slashY, 82, dmg, true, p.direction);
    }
  },

  executeMidChargeSlash() {
    if (!window.Entities || !Entities.player) return;
    const p = Entities.player;
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;
    const offset = 38;

    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);
    const dmg = Math.round(115 * (isHypercharged ? 1.6 : 1.0));

    if (p.direction === 'up') slashY -= offset;
    else if (p.direction === 'down') slashY += offset;
    else if (p.direction === 'left') slashX -= offset;
    else if (p.direction === 'right') slashX += offset;

    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('slash');
    this.meleeSlashes.push({ x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2, dir: p.direction, type: 'crescent_sweep', color: '#ff7700', radius: 64, life: 14, damage: dmg });
    this.checkMeleeHits(slashX, slashY, 74, dmg, true, p.direction);
  },

  executeDevastatingChargeSlash() {
    if (!window.Entities || !Entities.player) return;
    const p = Entities.player;
    const slashX = p.x + p.width / 2;
    const slashY = p.y + p.height / 2;

    const hasSubWoofer = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_sub_woofer'));
    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);

    // Sub-Woofer Relic Expands Shockwave Radius to 310px & Deals 225 Damage[cite: 2, 6, 14]
    const aoeRadius = hasSubWoofer ? 310 : 220;
    const baseDmg = hasSubWoofer ? 225 : 185;
    const dmg = Math.round(baseDmg * (isHypercharged ? 1.5 : 1.0));

    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
    if (window.State && typeof State.triggerScreenShake === 'function') State.triggerScreenShake(18, 30);

    this.meleeSlashes.push({ x: slashX, y: slashY, originX: slashX, originY: slashY, dir: p.direction, type: 'devastating_breaker', color: hasSubWoofer ? '#00f0ff' : '#a855f7', radius: 95, life: 25, damage: dmg });
    this.explosions.push({ x: slashX, y: slashY, radius: 10, maxRadius: aoeRadius, color: hasSubWoofer ? '#00f0ff' : '#a855f7', life: 32 });

    if (window.State && State.currentDimension === 'wasteland' && Entities.hostileNpcs) {
      Entities.hostileNpcs.forEach(n => {
        if (n.alive) {
          const dist = Math.hypot((n.x + n.width / 2) - slashX, (n.y + n.height / 2) - slashY);
          if (dist <= aoeRadius) {
            const angle = Math.atan2((n.y + n.height / 2) - slashY, (n.x + n.width / 2) - slashX);
            const knockDir = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
              ? (Math.cos(angle) > 0 ? 'right' : 'left') : (Math.sin(angle) > 0 ? 'down' : 'up');
            Entities.damageNpc(n, dmg, knockDir);
            this.spawnDamageNumber(n.x + n.width / 2, n.y - 12, dmg, hasSubWoofer ? '#00f0ff' : '#a855f7', true);
          }
        }
      });
    }

    if (window.State && State.currentDimension === 'underground' && Entities.trainingDummies) {
      Entities.trainingDummies.forEach(d => {
        if (Math.hypot((d.x + d.width / 2) - slashX, (d.y + d.height / 2) - slashY) <= aoeRadius) {
          this.spawnDamageNumber(d.x + d.width / 2, d.y - 12, dmg, hasSubWoofer ? '#00f0ff' : '#a855f7', true);
        }
      });
    }

    this.checkDestructibleDoors(slashX, slashY, 130, dmg, true);
    if (window.State && typeof State.showToast === 'function') {
      State.showToast(hasSubWoofer ? "PURE MONO SUB-BASS SHOCKWAVE DISCHARGED! 🔊⚡[cite: 1, 14]" : "DEVASTATING COSMIC SHOCKWAVE DISCHARGED! ⚡💜[cite: 2]");
    }
  },

  checkMeleeHits(hitX, hitY, hitRadius, damage, isCharged, knockDirMode) {
    if (window.State && State.currentDimension === 'wasteland' && Entities.hostileNpcs) {
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

    if (window.State && State.currentDimension === 'underground' && Entities.trainingDummies) {
      Entities.trainingDummies.forEach(dummy => {
        if (Math.hypot((dummy.x + dummy.width / 2) - hitX, (dummy.y + dummy.height / 2) - hitY) <= hitRadius) {
          if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
          this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 8, damage, isCharged ? '#ff7700' : '#00f0ff', isCharged);
        }
      });
    }
  },

  checkDestructibleDoors(hitX, hitY, hitRadius, damage, isCharged) {
    if (!window.State || State.currentDimension !== 'wasteland' || !window.Dimensions || !Dimensions.destructibleDoors) return;
    Dimensions.destructibleDoors.forEach(d => {
      if (!d.shattered) {
        if (Math.hypot((d.x + d.width / 2) - hitX, (d.y + d.height / 2) - hitY) <= hitRadius + 30) {
          if (isCharged) {
            d.hp -= damage;
            if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
            this.spawnDamageNumber(d.x + d.width / 2, d.y - 14, damage, '#ff003c', true);
            if (d.hp <= 0) {
              d.shattered = true;
              if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
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

      if (window.State && State.currentDimension === 'wasteland' && window.Entities && Entities.hostileNpcs) {
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
          p.vx = Math.cos(newAngle) * p.speed; 
          p.vy = Math.sin(newAngle) * p.speed;
        }
      }

      p.x += p.vx; 
      p.y += p.vy; 
      p.life--;

      let hit = false;
      const pBox = { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 };

      if (window.State && State.currentDimension === 'wasteland' && window.Dimensions) {
        if (Dimensions.destructibleDoors) {
          Dimensions.destructibleDoors.forEach(d => {
            if (!d.shattered && this.checkCollision(pBox, d)) {
              hit = true;
              if (p.isCharged) {
                d.hp -= p.damage;
                this.spawnDamageNumber(d.x + d.width / 2, d.y - 10, p.damage, '#00f0ff', true);
                if (d.hp <= 0) { d.shattered = true; if (window.State) State.save(); }
              }
            }
          });
        }
        if (!hit && window.Entities && Entities.hostileNpcs) {
          for (let npc of Entities.hostileNpcs) {
            if (npc.alive && this.checkCollision(pBox, npc)) {
              Entities.damageNpc(npc, p.damage, p.vx > 0 ? 'right' : 'left');
              this.spawnDamageNumber(npc.x + npc.width / 2, npc.y - 10, p.damage, p.isCharged ? '#00f0ff' : '#facc15', p.isCharged);
              hit = true; break;
            }
          }
        }
      }

      if (!hit && window.State && State.currentDimension === 'underground' && window.Entities && Entities.trainingDummies) {
        for (let dummy of Entities.trainingDummies) {
          if (this.checkCollision(pBox, dummy)) {
            if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
            this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 10, p.damage, p.isCharged ? '#00f0ff' : '#facc15', p.isCharged);
            hit = true; break;
          }
        }
      }

      if (!hit && window.Dimensions) {
        const obs = typeof Dimensions.getActiveObstacles === 'function' ? Dimensions.getActiveObstacles() : (Dimensions.undergroundObstacles || []);
        for (let o of obs) {
          if (this.checkCollision(pBox, o)) { hit = true; break; }
        }
      }

      if (hit) {
        if (p.isCharged) {
          if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
          if (window.State && typeof State.triggerScreenShake === 'function') State.triggerScreenShake(9, 16);
          this.explosions.push({ x: p.x, y: p.y, radius: 10, maxRadius: p.aoeRadius, color: p.color || '#00f0ff', life: 24 });
          if (window.State && State.currentDimension === 'wasteland' && window.Entities && Entities.hostileNpcs) {
            Entities.hostileNpcs.forEach(n => {
              if (n.alive && Math.hypot((n.x + n.width / 2) - p.x, (n.y + n.height / 2) - p.y) <= p.aoeRadius) {
                Entities.damageNpc(n, Math.round(p.damage * 0.7), 'down');
                this.spawnDamageNumber(n.x + n.width / 2, n.y - 8, Math.round(p.damage * 0.7), p.color || '#00f0ff', true);
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
      ep.x += ep.vx; 
      ep.y += ep.vy; 
      ep.life--;
      if (window.Entities && Entities.player) {
        const p = Entities.player;
        if (Math.hypot((p.x + p.width / 2) - ep.x, (p.y + p.height / 2) - ep.y) < p.width * 0.7) {
          Entities.damagePlayer(ep.damage, ep.vx > 0 ? 'right' : 'left');
          this.spawnDamageNumber(p.x + p.width / 2, p.y - 14, ep.damage, '#ff003c', false);
          this.enemyProjectiles.splice(i, 1);
          continue;
        }
      }
      if (ep.life <= 0) {
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
      fn.y -= 0.85; 
      fn.life--;
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

window.Combat = Combat;
