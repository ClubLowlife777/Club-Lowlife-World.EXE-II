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

  // --- 4-Hit Procedural Combo State Machine ---
  comboStep: 0,
  lastSlashTapTime: 0,
  COMBO_RESET_WINDOW_MS: 1200,
  isHoldingSlash: false,
  slashHoldStartTime: 0,

  // --- Charged Plasma Orbs ---
  isChargingShoot: false,
  shootChargeStartTime: 0,
  shootCooldown: 0,

  activeInteractable: null,

  /**
   * Fast Axis-Aligned Bounding Box (AABB) Collision Detector
   */
  checkCollision(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  },

  // =========================================================================
  // 1. PLASMA PROJECTILE FIRE & 1.0s CHARGE RELEASE
  // =========================================================================
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

    // 1.0s CHARGE THRESHOLD: Devastating Homing Plasma Orb
    if (holdSeconds >= 1.0) {
      this.shootCooldown = Date.now() + 850;
      if (window.AudioEngine) AudioEngine.playSfx('laser');
      this.projectiles.push({
        x: p.x + p.width / 2,
        y: p.y + p.height / 2,
        vx: vx * 8.5,
        vy: vy * 8.5,
        speed: 8.5,
        radius: 14,
        isCharged: true,
        damage: 120,
        aoeRadius: 150,
        life: 80,
        color: '#00f0ff'
      });
      State.showToast("RELEASED CHARGED PLASMA ORB! 💥");
    } else {
      // Rapid Tapped Plasma Bolt
      this.shootCooldown = Date.now() + 180;
      if (window.AudioEngine) AudioEngine.playSfx('laser');
      this.projectiles.push({
        x: p.x + p.width / 2,
        y: p.y + p.height / 2,
        vx: vx * 12.5,
        vy: vy * 12.5,
        speed: 12.5,
        radius: 5,
        isCharged: false,
        damage: 30,
        aoeRadius: 0,
        life: 55,
        color: '#facc15'
      });
    }
  },

  // =========================================================================
  // 2. 4-HIT COMBO & ANYTIME 1.5s CHARGE DISCHARGE
  // =========================================================================
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

    // 1.5s FULL CHARGE: 360 Cosmic Purple Lightning Wave
    if (holdSeconds >= 1.5) {
      this.executeDevastatingChargeSlash();
      this.comboStep = 0;
      this.lastSlashTapTime = now;
    } else if (holdSeconds >= 0.7) {
      // 0.7s MID CHARGE: Heavy Molten Orange Cleave
      this.executeMidChargeSlash();
      this.comboStep = 0;
      this.lastSlashTapTime = now;
    } else {
      // Normal Tap: Execute current combo step
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
      // HIT 1: Swift Piercing Needle Thrust (35 DMG)
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'stab_thrust', color: '#ff003c', radius: 36, life: 9, damage: 35
      });
      this.checkMeleeHits(slashX, slashY, 48, 35, false, p.direction);
    } else if (step === 1) {
      // HIT 2: Sweeping Crescent Arc (50 DMG)
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'crescent_sweep', color: '#00f0ff', radius: 48, life: 11, damage: 50
      });
      this.checkMeleeHits(slashX, slashY, 56, 50, false, p.direction);
    } else if (step === 2) {
      // HIT 3: 360-Degree Spinning Dual Vortex Disc (75 DMG)
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'spinning_vortex', color: '#ff7700', radius: 64, life: 13, damage: 75
      });
      this.checkMeleeHits(p.x + p.width / 2, p.y + p.height / 2, 72, 75, false, 'radial');
    } else if (step === 3) {
      // HIT 4: Dimensional Fissure Ground Slam (100 DMG)
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      State.triggerScreenShake(7, 14);
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'ground_slam', color: '#facc15', radius: 76, life: 15, damage: 100
      });
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
    this.meleeSlashes.push({
      x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
      dir: p.direction, type: 'crescent_sweep', color: '#ff7700', radius: 64, life: 14, damage: 115
    });
    this.checkMeleeHits(slashX, slashY, 74, 115, true, p.direction);
  },

  executeDevastatingChargeSlash() {
    const p = Entities.player;
    const slashX = p.x + p.width / 2;
    const slashY = p.y + p.height / 2;

    if (window.AudioEngine) AudioEngine.playSfx('win');
    State.triggerScreenShake(16, 28);

    // 360 Cosmic Purple Lightning Wave
    this.meleeSlashes.push({
      x: slashX, y: slashY, originX: slashX, originY: slashY,
      dir: p.direction, type: 'devastating_breaker', color: '#a855f7', radius: 95, life: 25, damage: 185
    });

    this.explosions.push({
      x: slashX, y: slashY, radius: 10, maxRadius: 220, color: '#a855f7', life: 30
    });

    // 220px Radial Impact Zone
    Entities.hostileNpcs.forEach(n => {
      if (n.alive) {
        const dist = Math.hypot((n.x + n.width / 2) - slashX, (n.y + n.height / 2) - slashY);
        if (dist <= 220) {
          const angle = Math.atan2((n.y + n.height / 2) - slashY, (n.x + n.width / 2) - slashX);
          const knockDir = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
            ? (Math.cos(angle) > 0 ? 'right' : 'left')
            : (Math.sin(angle) > 0 ? 'down' : 'up');

          Entities.damageNpc(n, 185, knockDir);
          this.spawnDamageNumber(n.x + n.width / 2, n.y - 12, 185, '#a855f7', true);
        }
      }
    });

    this.checkDestructibleDoors(slashX, slashY, 130, 185, true);
    State.showToast("DEVASTATING COSMIC SHOCKWAVE DISCHARGED! ⚡💜");
  },

  // =========================================================================
  // 3. HITBOX REGISTRATION & DAMAGE APPLICATION
  // =========================================================================
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
                ? (Math.cos(angle) > 0 ? 'right' : 'left')
                : (Math.sin(angle) > 0 ? 'down' : 'up');
            }

            Entities.damageNpc(npc, damage, actualKnockDir);
            this.spawnDamageNumber(npc.x + npc.width / 2, npc.y - 8, damage, isCharged ? '#ff7700' : '#ffffff', isCharged);
          }
        }
      });

      this.checkDestructibleDoors(hitX, hitY, hitRadius, damage, isCharged);
    }
  },

  checkDestructibleDoors(hitX, hitY, hitRadius, damage, isCharged) {
    Dimensions.destructibleDoors.forEach(d => {
      if (!d.shattered) {
        const doorCenterX = d.x + d.width / 2;
        const doorCenterY = d.y + d.height / 2;
        if (Math.hypot(doorCenterX - hitX, doorCenterY - hitY) <= hitRadius + 30) {
          if (isCharged) {
            d.hp -= damage;
            if (window.AudioEngine) AudioEngine.playSfx('stomp');
            this.spawnDamageNumber(doorCenterX, doorCenterY - 14, damage, '#ff003c', true);

            if (d.hp <= 0) {
              d.shattered = true;
              if (window.AudioEngine) AudioEngine.playSfx('win');
              State.triggerScreenShake(14, 24);
              State.showToast("BREACH DESTROYED // SECRET PATH OPENED! 🚪🔓");
              State.save();
            } else {
              State.showToast(`DOOR INTEGRITY: ${d.hp}/${d.maxHp} HP`);
            }
          } else {
            State.showToast("ARMORED: REQUIRES CHARGED ATTACK!");
          }
        }
      }
    });
  },

  spawnDamageNumber(x, y, amount, color = '#ffffff', isCrit = false) {
    this.floatingNumbers.push({
      x: x + (Math.random() * 16 - 8),
      y: y,
      text: isCrit ? `CRIT ${amount}` : `-${amount}`,
      color: color,
      scale: isCrit ? 1.3 : 1.0,
      life: 35,
      maxLife: 35
    });
  },

  // =========================================================================
  // 4. ENGINE FRAME TICK & HOMING VECTOR SOLVER
  // =========================================================================
  update() {
    // --- 1. Homing Projectile Physics ---
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (State.currentDimension === 'wasteland') {
        let bestTarget = null;
        let bestScore = -Infinity;

        // Target acquisition prioritizing forward cone over backward targets
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

              // Higher score for closer targets within a forward 120° cone
              const forwardBias = (Math.PI - angleDiff) / Math.PI;
              const proximityScore = (650 - dist) / 650;
              const totalScore = forwardBias * 1.5 + proximityScore;

              if (totalScore > bestScore) {
                bestScore = totalScore;
                bestTarget = n;
              }
            }
          }
        }

        if (bestTarget) {
          const targetX = bestTarget.x + bestTarget.width / 2;
          const targetY = bestTarget.y + bestTarget.height / 2;
          const targetAngle = Math.atan2(targetY - p.y, targetX - p.x);
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

      // Destructible Doors Checked FIRST
      if (State.currentDimension === 'wasteland') {
        Dimensions.destructibleDoors.forEach(d => {
          if (!d.shattered && this.checkCollision(pBox, d)) {
            hit = true;
            if (p.isCharged) {
              d.hp -= p.damage;
              this.spawnDamageNumber(d.x + d.width / 2, d.y - 10, p.damage, '#00f0ff', true);
              if (d.hp <= 0) {
                d.shattered = true;
                if (window.AudioEngine) AudioEngine.playSfx('win');
                State.triggerScreenShake(14, 24);
                State.showToast("BREACH BLOWN OPEN BY CHARGED PLASMA! 🚪🔓");
                State.save();
              }
            }
          }
        });

        // Hostile NPCs
        if (!hit) {
          for (let npc of Entities.hostileNpcs) {
            if (npc.alive && this.checkCollision(pBox, npc)) {
              Entities.damageNpc(npc, p.damage, p.vx > 0 ? 'right' : 'left');
              this.spawnDamageNumber(npc.x + npc.width / 2, npc.y - 10, p.damage, p.isCharged ? '#00f0ff' : '#facc15', p.isCharged);
              hit = true;
              break;
            }
          }
        }
      }

      // Static Obstacles Wall Check
      if (!hit) {
        const obs = Dimensions.getActiveObstacles();
        for (let o of obs) {
          if (this.checkCollision(pBox, o)) {
            hit = true;
            break;
          }
        }
      }

      if (hit) {
        if (p.isCharged) {
          if (window.AudioEngine) AudioEngine.playSfx('stomp');
          State.triggerScreenShake(9, 16);
          this.explosions.push({
            x: p.x, y: p.y, radius: 10, maxRadius: p.aoeRadius, color: '#00f0ff', life: 24
          });

          Entities.hostileNpcs.forEach(n => {
            if (n.alive && Math.hypot((n.x + n.width / 2) - p.x, (n.y + n.height / 2) - p.y) <= p.aoeRadius) {
              Entities.damageNpc(n, 85, 'down');
              this.spawnDamageNumber(n.x + n.width / 2, n.y - 8, 85, '#00f0ff', true);
            }
          });
        }
        this.projectiles.splice(i, 1);
      } else if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // --- 2. Enemy Projectiles ---
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx;
      ep.y += ep.vy;
      ep.life--;

      const p = Entities.player;
      const playerCenterDist = Math.hypot((p.x + p.width / 2) - ep.x, (p.y + p.height / 2) - ep.y);

      // Tight hurtbox calculation
      if (playerCenterDist < p.width * 0.7) {
        Entities.damagePlayer(ep.damage, ep.vx > 0 ? 'right' : 'left');
        this.spawnDamageNumber(p.x + p.width / 2, p.y - 14, ep.damage, '#ff003c', false);
        this.enemyProjectiles.splice(i, 1);
      } else if (ep.life <= 0) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // --- 3. Melee Slashes Lifecycles ---
    for (let i = this.meleeSlashes.length - 1; i >= 0; i--) {
      this.meleeSlashes[i].life--;
      if (this.meleeSlashes[i].life <= 0) this.meleeSlashes.splice(i, 1);
    }

    // --- 4. Shockwave & AoE Explosions ---
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.radius += (exp.maxRadius - exp.radius) * 0.28;
      exp.life--;
      if (exp.life <= 0) this.explosions.splice(i, 1);
    }

    // --- 5. Floating Damage Numbers Lifecycles ---
    for (let i = this.floatingNumbers.length - 1; i >= 0; i--) {
      const fn = this.floatingNumbers[i];
      fn.y -= 0.85; // Rise up
      fn.life--;
      if (fn.life <= 0) this.floatingNumbers.splice(i, 1);
    }
  },

  /**
   * Renders rising arcade damage popups in world camera coordinates.
   */
  renderDamageNumbers(ctx) {
    if (!this.floatingNumbers || this.floatingNumbers.length === 0) return;

    this.floatingNumbers.forEach(fn => {
      ctx.save();
      const opacity = fn.life / fn.maxLife;
      ctx.globalAlpha = Math.max(0, opacity);
      ctx.font = `bold ${Math.floor(10 * fn.scale)}px "Share Tech Mono"`;
      ctx.fillStyle = fn.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(fn.text, fn.x, fn.y);
      ctx.restore();
    });
  },

  triggerActiveInteraction() {
    if (window.Input && typeof Input.triggerInteraction === 'function') {
      Input.triggerInteraction();
    }
  }
};
