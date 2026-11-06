const Combat = {
  projectiles: [],
  enemyProjectiles: [],
  meleeSlashes: [],
  explosions: [],

  // 4-Hit Combo State Machine
  comboStep: 0,
  lastSlashTapTime: 0,
  COMBO_RESET_WINDOW_MS: 1200,
  isHoldingSlash: false,
  slashHoldStartTime: 0,

  // Charged Plasma Orbs
  isChargingShoot: false,
  shootChargeStartTime: 0,
  shootCooldown: 0,

  activeInteractable: null,

  checkCollision(r1, r2) {
    return (r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y);
  },

  // 1.0s CHARGED PLASMA PROJECTILES WITH HOMING
  startShootInput() {
    AudioEngine.init();
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

    // 1.0 SECOND CHARGE THRESHOLD
    if (holdSeconds >= 1.0) {
      this.shootCooldown = Date.now() + 850;
      AudioEngine.playSfx('laser');
      this.projectiles.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        vx: vx * 8.5, vy: vy * 8.5,
        speed: 8.5,
        radius: 14,
        isCharged: true,
        damage: 120,
        aoeRadius: 150,
        life: 80,
        color: '#00f0ff'
      });
      State.showToast("RELEASED HOMING PLASMA ORB! 💥");
    } else {
      this.shootCooldown = Date.now() + 180;
      AudioEngine.playSfx('laser');
      this.projectiles.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        vx: vx * 12.5, vy: vy * 12.5,
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

  // 4-HIT COMBO + CHARGE AT ANY TIME (1.5s FULL CHARGE)
  startSlashInput() {
    AudioEngine.init();
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

    // 1.5s DEVASTATING ATTACK (TRIGGERABLE AFTER ANY HIT OR FROM NEUTRAL)
    if (holdSeconds >= 1.5) {
      this.executeDevastatingChargeSlash();
      this.comboStep = 0;
      this.lastSlashTapTime = now;
    } else if (holdSeconds >= 0.7) {
      this.executeMidChargeSlash();
      this.comboStep = 0;
      this.lastSlashTapTime = now;
    } else {
      // Normal Tap: Execute distinct animation for current combo step
      this.executeComboSlash(this.comboStep);
      this.comboStep = (this.comboStep + 1) % 4;
      this.lastSlashTapTime = now;
    }
  },

  executeComboSlash(step) {
    const p = Entities.player;
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;
    const offset = 32;

    if (p.direction === 'up') slashY -= offset;
    else if (p.direction === 'down') slashY += offset;
    else if (p.direction === 'left') slashX -= offset;
    else if (p.direction === 'right') slashX += offset;

    if (step === 0) {
      // HIT 1: Swift Piercing Thrust
      AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'stab_thrust', color: '#ff003c', radius: 36, life: 9, damage: 35
      });
      this.checkMeleeHits(slashX, slashY, 48, 35, false);
    } else if (step === 1) {
      // HIT 2: Sweeping Crescent Arc
      AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'crescent_sweep', color: '#00f0ff', radius: 48, life: 11, damage: 50
      });
      this.checkMeleeHits(slashX, slashY, 56, 50, false);
    } else if (step === 2) {
      // HIT 3: 360-Degree Spinning Vortex Cleave
      AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'spinning_vortex', color: '#ff7700', radius: 64, life: 13, damage: 75
      });
      this.checkMeleeHits(p.x + p.width / 2, p.y + p.height / 2, 70, 75, false);
    } else if (step === 3) {
      // HIT 4: Dimensional Fissure Ground Slam
      AudioEngine.playSfx('slash');
      State.triggerScreenShake(7, 14);
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'ground_slam', color: '#facc15', radius: 72, life: 15, damage: 100
      });
      this.checkMeleeHits(slashX, slashY, 78, 100, true);
    }
  },

  executeMidChargeSlash() {
    const p = Entities.player;
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;
    AudioEngine.playSfx('slash');
    this.meleeSlashes.push({
      x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
      dir: p.direction, type: 'crescent_sweep', color: '#ff7700', radius: 62, life: 14, damage: 115
    });
    this.checkMeleeHits(slashX, slashY, 72, 115, true);
  },

  executeDevastatingChargeSlash() {
    const p = Entities.player;
    const slashX = p.x + p.width / 2;
    const slashY = p.y + p.height / 2;

    AudioEngine.playSfx('win');
    State.triggerScreenShake(16, 28);

    // 360-Degree Cosmic Purple Shockwave
    this.meleeSlashes.push({
      x: slashX, y: slashY, originX: slashX, originY: slashY,
      dir: p.direction, type: 'devastating_breaker', color: '#a855f7', radius: 95, life: 25, damage: 185
    });

    this.explosions.push({
      x: slashX, y: slashY, radius: 10, maxRadius: 220, color: '#a855f7', life: 30
    });

    // Proximity damage to all nearby enemies in 220px radius
    Entities.hostileNpcs.forEach(n => {
      if (n.alive) {
        const dist = Math.hypot((n.x + n.width / 2) - slashX, (n.y + n.height / 2) - slashY);
        if (dist <= 220) {
          Entities.damageNpc(n, 185, p.direction);
        }
      }
    });

    this.checkDestructibleDoors(slashX, slashY, 110, 185, true);
    State.showToast("DEVASTATING COSMIC SHOCKWAVE DISCHARGED! ⚡💜");
  },

  checkMeleeHits(hitX, hitY, hitRadius, damage, isCharged) {
    if (State.currentDimension === 'wasteland') {
      Entities.hostileNpcs.forEach(npc => {
        if (npc.alive) {
          const dist = Math.hypot((npc.x + npc.width / 2) - hitX, (npc.y + npc.height / 2) - hitY);
          if (dist <= hitRadius) {
            Entities.damageNpc(npc, damage, Entities.player.direction);
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
        if (Math.hypot(doorCenterX - hitX, doorCenterY - hitY) <= hitRadius + 25) {
          if (isCharged) {
            d.hp -= damage;
            AudioEngine.playSfx('stomp');
            if (d.hp <= 0) {
              d.shattered = true;
              AudioEngine.playSfx('win');
              State.triggerScreenShake(12, 22);
              State.showToast("BREACH DESTROYED // SECRET PATH OPENED! 🚪🔓");
            } else {
              State.showToast(`DOOR INTEGRITY: ${d.hp}/${d.maxHp} HP`);
            }
          } else {
            State.showToast("BLOCKED: REQUIRES CHARGED ATTACK!");
          }
        }
      }
    });
  },

  update() {
    // HOMING PROJECTILE LOGIC
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // Track nearest alive enemy if in Wasteland
      if (State.currentDimension === 'wasteland') {
        let nearest = null;
        let nearestDist = 650;
        for (let n of Entities.hostileNpcs) {
          if (n.alive) {
            const d = Math.hypot((n.x + n.width / 2) - p.x, (n.y + n.height / 2) - p.y);
            if (d < nearestDist) {
              nearestDist = d;
              nearest = n;
            }
          }
        }

        if (nearest) {
          const targetX = nearest.x + nearest.width / 2;
          const targetY = nearest.y + nearest.height / 2;
          const targetAngle = Math.atan2(targetY - p.y, targetX - p.x);
          const currentAngle = Math.atan2(p.vy, p.vx);

          let angleDiff = targetAngle - currentAngle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          // Steer towards target smoothly
          const turnRate = p.isCharged ? 0.09 : 0.18;
          const newAngle = currentAngle + Math.max(-turnRate, Math.min(turnRate, angleDiff));

          p.vx = Math.cos(newAngle) * p.speed;
          p.vy = Math.sin(newAngle) * p.speed;
        }
      }

      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      let hit = false;
      const obs = Dimensions.getActiveObstacles();
      for (let o of obs) {
        if (p.x > o.x && p.x < o.x + o.width && p.y > o.y && p.y < o.y + o.height) {
          hit = true; break;
        }
      }

      if (!hit && State.currentDimension === 'wasteland') {
        Dimensions.destructibleDoors.forEach(d => {
          if (!d.shattered && p.x > d.x && p.x < d.x + d.width && p.y > d.y && p.y < d.y + d.height) {
            hit = true;
            if (p.isCharged) {
              d.hp -= p.damage;
              if (d.hp <= 0) {
                d.shattered = true;
                State.showToast("BREACH BLOWN OPEN BY CHARGED PLASMA! 🚪🔓");
              }
            }
          }
        });

        for (let npc of Entities.hostileNpcs) {
          if (npc.alive && p.x > npc.x && p.x < npc.x + npc.width && p.y > npc.y && p.y < npc.y + npc.height) {
            Entities.damageNpc(npc, p.damage, p.vx > 0 ? 'right' : 'left');
            hit = true;
            break;
          }
        }
      }

      if (hit) {
        if (p.isCharged) {
          AudioEngine.playSfx('stomp');
          State.triggerScreenShake(9, 16);
          this.explosions.push({ x: p.x, y: p.y, radius: 10, maxRadius: p.aoeRadius, color: '#00f0ff', life: 24 });
          Entities.hostileNpcs.forEach(n => {
            if (n.alive && Math.hypot((n.x + n.width / 2) - p.x, (n.y + n.height / 2) - p.y) <= p.aoeRadius) {
              Entities.damageNpc(n, 85, 'down');
            }
          });
        }
        this.projectiles.splice(i, 1);
      } else if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Enemy Projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx; ep.y += ep.vy; ep.life--;

      const p = Entities.player;
      if (Math.hypot(p.x + p.width / 2 - ep.x, p.y + p.height / 2 - ep.y) < p.width) {
        Entities.damagePlayer(ep.damage, ep.vx > 0 ? 'right' : 'left');
        this.enemyProjectiles.splice(i, 1);
      } else if (ep.life <= 0) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // Slashes & Explosions
    for (let i = this.meleeSlashes.length - 1; i >= 0; i--) {
      this.meleeSlashes[i].life--;
      if (this.meleeSlashes[i].life <= 0) this.meleeSlashes.splice(i, 1);
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.radius += (exp.maxRadius - exp.radius) * 0.25;
      exp.life--;
      if (exp.life <= 0) this.explosions.splice(i, 1);
    }

    this.checkProximity();
  },

  checkProximity() {
    const p = Entities.player;
    const prompt = document.getElementById('interactionPrompt');
    const promptText = document.getElementById('promptText');
    const actionLabel = document.getElementById('btnActionLabel');

    this.activeInteractable = null;
    const pBox = { x: p.x - 22, y: p.y - 22, width: p.width + 44, height: p.height + 44 };

    // Friendly NPCs
    const npcs = Entities.friendlyNpcs[State.currentDimension] || [];
    for (let n of npcs) {
      if (this.checkCollision(pBox, n)) {
        this.activeInteractable = { type: 'npc', data: n };
        promptText.innerText = `[E] TALK TO ${n.name}`;
        actionLabel.innerText = "TALK";
        prompt.classList.remove('hidden');
        return;
      }
    }

    // Loot Chests
    if (State.currentDimension === 'wasteland') {
      for (let c of Dimensions.wastelandChests) {
        if (!c.opened && this.checkCollision(pBox, c)) {
          this.activeInteractable = { type: 'chest', data: c };
          promptText.innerText = `[E] RAID ${c.label}`;
          actionLabel.innerText = "OPEN";
          prompt.classList.remove('hidden');
          return;
        }
      }
    }

    // Interactive World Zones
    const zones = Dimensions.getActiveZones();
    for (let z of zones) {
      if (this.checkCollision(pBox, z)) {
        this.activeInteractable = { type: 'zone', data: z };
        promptText.innerText = `[E] ${z.label}`;
        actionLabel.innerText = "ENTER";
        prompt.classList.remove('hidden');
        return;
      }
    }

    prompt.classList.add('hidden');
    actionLabel.innerText = "ACTION";
  },

  triggerActiveInteraction() {
    if (!this.activeInteractable) return;
    const item = this.activeInteractable;
    if (item.type === 'npc') {
      const n = item.data;
      document.getElementById('npcName').innerText = n.name;
      document.getElementById('npcRole').innerText = n.role;
      document.getElementById('npcAvatarIcon').innerText = n.icon;
      document.getElementById('npcDialogueText').innerText = n.dialogue;
      document.getElementById('npcModal').classList.remove('hidden');
    } else if (item.type === 'chest') {
      Entities.openChest(item.data);
    } else if (item.type === 'zone') {
      item.data.action();
    }
  }
};
