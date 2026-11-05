const Combat = {
  projectiles: [],
  enemyProjectiles: [],
  meleeSlashes: [],
  explosions: [],

  // 4-Hit Combat State Machine
  comboStep: 0,
  lastSlashTapTime: 0,
  COMBO_RESET_WINDOW_MS: 1100,
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

  // PLASMA SHOOTING
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

    if (holdSeconds >= 1.0) {
      // Heavy Plasma Orb
      this.shootCooldown = Date.now() + 1100;
      AudioEngine.playSfx('laser');
      this.projectiles.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        vx: vx * 8, vy: vy * 8, radius: 14,
        isCharged: true, damage: 110, aoeRadius: 140, life: 75,
        color: '#00f0ff'
      });
      State.showToast("RELEASED CHARGED PLASMA ORB! 💥");
    } else {
      // Rapid Plasma Bolt
      this.shootCooldown = Date.now() + 220;
      AudioEngine.playSfx('laser');
      this.projectiles.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        vx: vx * 12, vy: vy * 12, radius: 4.5,
        isCharged: false, damage: 28, aoeRadius: 0, life: 50,
        color: '#facc15'
      });
    }
  },

  // 4-HIT MELEE & COSMIC CHARGE
  startSlashInput() {
    AudioEngine.init();
    const now = Date.now();
    this.isHoldingSlash = true;
    this.slashHoldStartTime = now;

    if (now - this.lastSlashTapTime > this.COMBO_RESET_WINDOW_MS) {
      this.comboStep = 0;
    }

    if (this.comboStep === 3) {
      const ring = document.getElementById('btnSlashChargeRing');
      if (ring) ring.style.opacity = '1';
    }
  },

  releaseSlashInput() {
    if (!this.isHoldingSlash) return;
    this.isHoldingSlash = false;
    const ring = document.getElementById('btnSlashChargeRing');
    if (ring) ring.style.opacity = '0';

    const now = Date.now();
    const holdSeconds = (now - this.slashHoldStartTime) / 1000;

    if (this.comboStep === 3) {
      this.executeChargeSlash(holdSeconds);
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
    const offset = 30;

    if (p.direction === 'up') slashY -= offset;
    else if (p.direction === 'down') slashY += offset;
    else if (p.direction === 'left') slashX -= offset;
    else if (p.direction === 'right') slashX += offset;

    if (step === 0) {
      AudioEngine.playSfx('slash');
      this.meleeSlashes.push({ x: slashX, y: slashY, dir: p.direction, type: 'stab', color: '#ff003c', radius: 30, life: 9, damage: 35 });
      this.checkMeleeHits(slashX, slashY, 45, 35, false);
    } else if (step === 1) {
      AudioEngine.playSfx('slash');
      this.meleeSlashes.push({ x: slashX, y: slashY, dir: p.direction, type: 'reverse_arc', color: '#ec4899', radius: 42, life: 11, damage: 50 });
      this.checkMeleeHits(slashX, slashY, 52, 50, false);
    } else if (step === 2) {
      AudioEngine.playSfx('slash');
      this.meleeSlashes.push({ x: slashX, y: slashY, dir: p.direction, type: 'heavy_cleave', color: '#00f0ff', radius: 50, life: 13, damage: 75 });
      this.checkMeleeHits(slashX, slashY, 60, 75, false);
    }
  },

  executeChargeSlash(seconds) {
    const p = Entities.player;
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;

    if (seconds >= 1.5) {
      // Cosmic Purple Proximity Shockwave
      AudioEngine.playSfx('win');
      State.triggerScreenShake(14, 25);

      this.meleeSlashes.push({
        x: slashX, y: slashY, dir: p.direction,
        type: 'magic_purple', color: '#a855f7', radius: 80, life: 22, damage: 160
      });

      this.explosions.push({
        x: slashX, y: slashY, radius: 10, maxRadius: 200, color: '#a855f7', life: 28
      });

      // Hit all enemies in 360-degree proximity
      Entities.hostileNpcs.forEach(n => {
        if (n.alive) {
          const dist = Math.hypot(n.x + n.width / 2 - slashX, n.y + n.height / 2 - slashY);
          if (dist <= 200) {
            Entities.damageNpc(n, 160, p.direction);
          }
        }
      });

      this.checkDestructibleDoors(slashX, slashY, 90, 160, true);
      State.showToast("COSMIC PURPLE SHOCKWAVE DISCHARGED! ⚡💜");
    } else if (seconds >= 1.2) {
      // Molten Orange Cleave
      AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: slashX, y: slashY, dir: p.direction,
        type: 'heavy_cleave', color: '#ff7700', radius: 58, life: 14, damage: 105
      });
      this.checkMeleeHits(slashX, slashY, 68, 105, true);
    } else {
      AudioEngine.playSfx('slash');
      this.meleeSlashes.push({
        x: slashX, y: slashY, dir: p.direction,
        type: 'heavy_cleave', color: '#ff003c', radius: 46, life: 10, damage: 65
      });
      this.checkMeleeHits(slashX, slashY, 52, 65, false);
    }
  },

  checkMeleeHits(hitX, hitY, hitRadius, damage, isCharged) {
    if (State.currentDimension === 'wasteland') {
      Entities.hostileNpcs.forEach(npc => {
        if (npc.alive) {
          const dist = Math.hypot(npc.x + npc.width / 2 - hitX, npc.y + npc.height / 2 - hitY);
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
              State.triggerScreenShake(10, 20);
              State.showToast("BREACH DESTROYED // SECRET PATH OPENED! 🚪🔓");
            } else {
              State.showToast(`DOOR INTEGRITY: ${d.hp}/${d.maxHp} HP`);
            }
          } else {
            State.showToast("BLOCKED: REQUIRES CHARGED PURPLE/ORANGE ATTACK!");
          }
        }
      }
    });
  },

  update() {
    // Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx; p.y += p.vy; p.life--;

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
          State.triggerScreenShake(8, 15);
          this.explosions.push({ x: p.x, y: p.y, radius: 10, maxRadius: p.aoeRadius, color: '#00f0ff', life: 22 });
          Entities.hostileNpcs.forEach(n => {
            if (n.alive && Math.hypot(n.x + n.width / 2 - p.x, n.y + n.height / 2 - p.y) <= p.aoeRadius) {
              Entities.damageNpc(n, 75, 'down');
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
