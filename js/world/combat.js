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

  checkCollision(r1, r2) {
    return (
      r1 && r2 &&
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
    if (window.AudioEngine) AudioEngine.init();
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
        life: 85,
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
        life: 60,
        color: '#facc15'
      });
    }
  },

  // =========================================================================
  // 2. 4-HIT COMBO & ANYTIME 1.5s CHARGE DISCHARGE
  // =========================================================================
  startSlashInput() {
    if (window.AudioEngine) AudioEngine.init();
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
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'stab_thrust', color: '#ff003c', radius: 36, life: 9, damage: 35
      });
      this.checkMeleeHits(slashX, slashY, 48, 35, false, p.direction);
    } else if (step === 1) {
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'crescent_sweep', color: '#00f0ff', radius: 48, life: 11, damage: 50
      });
      this.checkMeleeHits(slashX, slashY, 56, 50, false, p.direction);
    } else if (step === 2) {
      if (window.AudioEngine) AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'spinning_vortex', color: '#ff7700', radius: 64, life: 13, damage: 75
      });
      this.checkMeleeHits(p.x + p.width / 2, p.y + p.height / 2, 72, 75, false, 'radial');
    } else if (step === 3) {
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

    this.meleeSlashes.push({
      x: slashX, y: slashY, originX: slashX, originY: slashY,
      dir: p.direction, type: 'devastating_breaker', color: '#a855f7', radius: 95, life: 25, damage: 185
    });

    this.explosions.push({
      x: slashX, y: slashY, radius: 10, maxRadius: 220, color: '#a855f7', life: 30
    });

    // 220px Radial Damage to Hostile NPCs
    if (State.currentDimension === 'wasteland') {
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
    }

    // Hit Underground Target Dummy
    if (State.currentDimension === 'underground' && Entities.trainingDummies) {
      Entities.trainingDummies.forEach(d => {
        if (Math.hypot((d.x + d.width / 2) - slashX, (d.y + d.height / 2) - slashY) <= 220) {
          this.spawnDamageNumber(d.x + d.width / 2, d.y - 12, 185, '#a855f7', true);
        }
      });
    }

    this.checkDestructibleDoors(slashX, slashY, 130, 185, true);
    State.showToast("DEVASTATING COSMIC SHOCKWAVE DISCHARGED! ⚡💜");
  },

  // =========================================================================
  // 3. HITBOX REGISTRATION & TARGET DUMMY TESTING
  // =========================================================================
  checkMeleeHits(hitX, hitY, hitRadius, damage, isCharged, knockDirMode) {
    // 1. Hostile Enemies in Wasteland
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

    // 2. Training Target Dummy in Underground Garage
    if (State.currentDimension === 'underground' && Entities.trainingDummies) {
      Entities.trainingDummies.forEach(dummy => {
        const dist = Math.hypot((dummy.x + dummy.width / 2) - hitX, (dummy.y + dummy.height / 2) - hitY);
        if (dist <= hitRadius) {
          if (window.AudioEngine) AudioEngine.playSfx('stomp');
          this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 8, damage, isCharged ? '#ff7700' : '#00f0ff', isCharged);
        }
      });
    }
  },

  checkDestructibleDoors(hitX, hitY, hitRadius, damage, isCharged) {
    if (State.currentDimension !== 'wasteland' || !Dimensions.destructibleDoors) return;

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
  // 4. ENGINE FRAME TICK & HOMING PROJECTILE LOGIC
  // =========================================================================
  update() {
    // 1. Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // Homing physics in Wasteland
      if (State.currentDimension === 'wasteland') {
        let bestTarget = null;
        let bestScore = -Infinity;

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

      // Destructible Doors
      if (State.currentDimension === 'wasteland' && Dimensions.destructibleDoors) {
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

        // Hostile Enemies
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

      // Check Underground Target Dummy
      if (!hit && State.currentDimension === 'underground' && Entities.trainingDummies) {
        for (let dummy of Entities.trainingDummies) {
          if (this.checkCollision(pBox, dummy)) {
            if (window.AudioEngine) AudioEngine.playSfx('stomp');
            this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 10, p.damage, p.isCharged ? '#00f0ff' : '#facc15', p.isCharged);
            hit = true;
            break;
          }
        }
      }

      // Obstacle collision
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

    // 2. Enemy Projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx;
      ep.y += ep.vy;
      ep.life--;

      const p = Entities.player;
      if (Math.hypot((p.x + p.width / 2) - ep.x, (p.y + p.height / 2) - ep.y) < p.width * 0.7) {
        Entities.damagePlayer(ep.damage, ep.vx > 0 ? 'right' : 'left');
        this.spawnDamageNumber(p.x + p.width / 2, p.y - 14, ep.damage, '#ff003c', false);
        this.enemyProjectiles.splice(i, 1);
      } else if (ep.life <= 0) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 3. Melee Slashes
    for (let i = this.meleeSlashes.length - 1; i >= 0; i--) {
      this.meleeSlashes[i].life--;
      if (this.meleeSlashes[i].life <= 0) this.meleeSlashes.splice(i, 1);
    }

    // 4. Explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.radius += (exp.maxRadius - exp.radius) * 0.28;
      exp.life--;
      if (exp.life <= 0) this.explosions.splice(i, 1);
    }

    // 5. Floating Numbers
    for (let i = this.floatingNumbers.length - 1; i >= 0; i--) {
      const fn = this.floatingNumbers[i];
      fn.y -= 0.85;
      fn.life--;
      if (fn.life <= 0) this.floatingNumbers.splice(i, 1);
    }

    // 6. Proximity Scanner
    this.checkProximity();
  },

  // =========================================================================
  // 5. PROXIMITY DETECTION & INTERACTION RESOLUTION
  // =========================================================================
  checkProximity() {
    if (!window.Entities || !Entities.player || !window.Dimensions) return;

    const p = Entities.player;
    const prompt = document.getElementById('interactionPrompt');
    const promptText = document.getElementById('promptText');
    const actionLabel = document.getElementById('btnActionLabel');
    const actionBtn = document.getElementById('btnAction');

    this.activeInteractable = null;
    const pBox = { x: p.x - 35, y: p.y - 35, width: p.width + 70, height: p.height + 70 };

    // 1. Friendly NPCs
    const npcs = (Entities.friendlyNpcs && Entities.friendlyNpcs[State.currentDimension]) || [];
    for (let n of npcs) {
      if (this.checkCollision(pBox, n)) {
        this.activeInteractable = { type: 'npc', data: n };
        if (promptText) promptText.innerText = `[E] TALK TO ${n.name}`;
        if (actionLabel) actionLabel.innerText = "TALK";
        if (prompt) prompt.classList.remove('hidden');
        if (actionBtn) actionBtn.classList.add('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.4)]');
        return;
      }
    }

    // 2. Wasteland Chests
    if (State.currentDimension === 'wasteland' && Dimensions.wastelandChests) {
      for (let c of Dimensions.wastelandChests) {
        if (!c.opened && this.checkCollision(pBox, c)) {
          this.activeInteractable = { type: 'chest', data: c };
          if (promptText) promptText.innerText = `[E] RAID ${c.label}`;
          if (actionLabel) actionLabel.innerText = "OPEN";
          if (prompt) prompt.classList.remove('hidden');
          if (actionBtn) actionBtn.classList.add('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.4)]');
          return;
        }
      }
    }

    // 3. Interactive World Zones (kiosks, portals, arcades, merch)
    const zones = Dimensions.getActiveZones ? Dimensions.getActiveZones() : [];
    for (let z of zones) {
      if (this.checkCollision(pBox, z)) {
        this.activeInteractable = { type: 'zone', data: z };
        if (promptText) promptText.innerText = `[E] ${z.label}`;
        if (actionLabel) actionLabel.innerText = "ENTER";
        if (prompt) prompt.classList.remove('hidden');
        if (actionBtn) actionBtn.classList.add('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.4)]');
        return;
      }
    }

    if (prompt) prompt.classList.add('hidden');
    if (actionLabel) actionLabel.innerText = "ACTION";
    if (actionBtn) actionBtn.classList.remove('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.4)]');
  },

  triggerActiveInteraction() {
    if (!this.activeInteractable) return;
    const item = this.activeInteractable;

    if (item.type === 'npc') {
      const n = item.data;
      const nameEl = document.getElementById('npcName');
      const roleEl = document.getElementById('npcRole');
      const iconEl = document.getElementById('npcAvatarIcon');
      const textEl = document.getElementById('npcDialogueText');
      const modal = document.getElementById('npcModal');
      if (nameEl) nameEl.innerText = n.name;
      if (roleEl) roleEl.innerText = n.role;
      if (iconEl) iconEl.innerText = n.icon || '👤';
      if (textEl) textEl.innerText = n.dialogue;
      if (modal) modal.classList.remove('hidden');
    } else if (item.type === 'chest') {
      Entities.openChest(item.data);
    } else if (item.type === 'zone' && typeof item.data.action === 'function') {
      item.data.action();
    }
  },

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
  }
};

// Wire bridge to Input if triggered from there
if (window.Input) {
  Input.triggerInteraction = () => Combat.triggerActiveInteraction();
}
