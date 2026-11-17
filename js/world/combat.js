/**
 * CLUB LOWLIFE // CORE COMBAT 2.0, STYLE RANK, PARRY, PHASE DASH & VFX ENGINE
 * File: js/world/combat.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Physics (Rev 6.00 - Combat 2.0 Overhaul)
 */

const Combat = {
  projectiles: [],
  enemyProjectiles: [],
  meleeSlashes: [],
  explosions: [],
  floatingNumbers: [],
  particles: [],
  impactFlashes: [],
  muzzleFlashes: [],
  dashGhosts: [],
  telegraphs: [],

  comboStep: 0,
  lastSlashTapTime: 0,
  COMBO_RESET_WINDOW_MS: 1200,
  isHoldingSlash: false,
  slashHoldStartTime: 0,
  isChargingShoot: false,
  shootChargeStartTime: 0,
  shootCooldown: 0,

  // Phase Dash State ([Space] / Touch Dash)
  dashCooldown: 0,
  DASH_COOLDOWN_MS: 850,
  lastWeaponSwingTime: 0,
  lastWeaponColor: '#00f0ff',

  // Hit-Stop Micro-Freeze Counter (Frames)
  hitStopFrames: 0,

  cancelHeldInputs() {
    this.isHoldingSlash = false;
    this.isChargingShoot = false;
    const ring = document.getElementById('btnSlashChargeRing');
    if (ring) ring.style.opacity = '0';
    const chargeFill = document.getElementById('btnShootChargeFill');
    if (chargeFill) chargeFill.style.opacity = '0';
  },

  clearActiveEffects() {
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.meleeSlashes = [];
    this.explosions = [];
    this.floatingNumbers = [];
    this.particles = [];
    this.impactFlashes = [];
    this.muzzleFlashes = [];
    this.dashGhosts = [];
    this.telegraphs = [];
    this.hitStopFrames = 0;
    this.cancelHeldInputs();
  },

  // Style Rank & Rhythm Combo System (D -> C -> B -> A -> S -> LOWLIFE 777)
  stylePoints: 0,
  comboHits: 0,
  styleDecayTimer: 0,
  lastBeatSyncTime: 0,

  // Dossier Section 2: Player Offense Scaling (+5.0% damage per level)
  getPlayerLevelDamageMult() {
    if (window.State && typeof State.getPlayerDamageMultiplier === 'function') {
      return State.getPlayerDamageMultiplier();
    }
    const lvl = (window.State && State.userProfile && State.userProfile.level) ? State.userProfile.level : 1;
    return 1 + Math.max(0, lvl - 1) * 0.05;
  },

  // Returns custom combat VFX colors derived from the player's equipped skin (120-Skin Catalog)
  getActiveSkinPalette() {
    const fallback = { primary: '#00f0ff', secondary: '#ff003c', accent: '#facc15', coat: '#090b10' };
    if (!window.State || !State.SKINS_DATA) return fallback;
    const skinId = (State.userProfile && State.userProfile.activeSkin) ? State.userProfile.activeSkin : 'enforcer';
    const skin = State.SKINS_DATA.find(s => s.id === skinId);
    if (!skin) return fallback;

    const primary = (skin.visor && skin.visor !== '#000000') ? skin.visor : '#00f0ff';
    const secondary = (skin.trim && skin.trim !== '#000000' && skin.trim !== primary) ? skin.trim : '#ec4899';
    return {
      primary,
      secondary,
      accent: '#ffffff',
      coat: skin.coat || '#090b10',
      name: skin.name || 'OPERATIVE'
    };
  },

  // Checks if the player's attack landed on the live Web Audio AnalyserNode beat
  checkBeatSync() {
    if (!window.AudioEngine || typeof AudioEngine.getAudioTelemetry !== 'function') return false;
    const tel = AudioEngine.getAudioTelemetry();
    if (!tel || !tel.active) return false;
    if (tel.onBeat || tel.subEnergy > 0.40) {
      this.lastBeatSyncTime = Date.now();
      return true;
    }
    return false;
  },

  addStylePoints(points, hits = 1) {
    this.stylePoints = Math.min(220, this.stylePoints + points);
    this.comboHits += hits;
    this.styleDecayTimer = 270; // 4.5 seconds before decay begins
  },

  onPlayerDamaged() {
    if (this.stylePoints > 0) {
      this.stylePoints = Math.max(0, Math.floor(this.stylePoints * 0.62));
      this.comboHits = Math.max(0, Math.floor(this.comboHits * 0.5));
    }
  },

  getStyleRankInfo() {
    const pts = this.stylePoints;
    if (pts >= 150) return { rank: 'LOWLIFE // 777', short: '777', color: '#facc15', subColor: '#ff003c', mult: 1.50, nextPct: 100 };
    if (pts >= 100) return { rank: 'S // SOVEREIGN', short: 'S', color: '#ec4899', subColor: '#00f0ff', mult: 1.35, nextPct: Math.floor(((pts - 100) / 50) * 100) };
    if (pts >= 65)  return { rank: 'A // ASSASSIN', short: 'A', color: '#a855f7', subColor: '#c084fc', mult: 1.25, nextPct: Math.floor(((pts - 65) / 35) * 100) };
    if (pts >= 35)  return { rank: 'B // BREAKER', short: 'B', color: '#00f0ff', subColor: '#38bdf8', mult: 1.15, nextPct: Math.floor(((pts - 35) / 30) * 100) };
    if (pts >= 15)  return { rank: 'C // CUTTER', short: 'C', color: '#4ade80', subColor: '#22c55e', mult: 1.05, nextPct: Math.floor(((pts - 15) / 20) * 100) };
    return { rank: 'D // DRIFTER', short: 'D', color: '#94a3b8', subColor: '#64748b', mult: 1.00, nextPct: Math.floor((pts / 15) * 100) };
  },

  getStyleTokenMultiplier() {
    return this.getStyleRankInfo().mult;
  },

  triggerHitStop(frames = 2) {
    this.hitStopFrames = Math.max(this.hitStopFrames, frames);
  },

  spawnHitSparks(x, y, color = '#00f0ff', count = 12, baseAngle = null) {
    for (let i = 0; i < count; i++) {
      const angle = baseAngle !== null
        ? baseAngle + (Math.random() - 0.5) * 1.4
        : Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 6 + Math.random() * 10,
        size: 1.8 + Math.random() * 2.2,
        color: i % 3 === 0 ? '#ffffff' : color,
        life: 12 + Math.floor(Math.random() * 10),
        maxLife: 22
      });
    }
    this.impactFlashes.push({
      x, y,
      color,
      radius: 18 + Math.random() * 10,
      angle: Math.random() * Math.PI,
      life: 7,
      maxLife: 7
    });
  },

  checkCollision(r1, r2) {
    return (
      r1 && r2 &&
      r1.x < r2.x + (r2.width || 0) &&
      r1.x + (r1.width || 0) > r2.x &&
      r1.y < r2.y + (r2.height || 0) &&
      r1.y + (r1.height || 0) > r2.y
    );
  },

  // =========================================================================
  // PHASE DASH ([Space] / Touch Button) WITH ZIP-THROUGH DAMAGE & PERFECT DODGE
  // =========================================================================
  triggerDash() {
    const now = Date.now();
    if (now < this.dashCooldown) return;
    if (!window.Entities || !Entities.player) return;

    const p = Entities.player;
    const palette = this.getActiveSkinPalette();
    const hasPhaseBlade = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_phase_blade'));
    const hasVampireLimiter = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_vampire_limiter'));
    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);

    const activeCooldownMs = hasVampireLimiter ? 560 : this.DASH_COOLDOWN_MS;
    this.dashCooldown = now + activeCooldownMs;

    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
      AudioEngine.playSfx('dash');
    }

    let dx = 0, dy = 0;
    if (window.Input && typeof Input.getMovementVector === 'function') {
      const vec = Input.getMovementVector();
      dx = vec.x;
      dy = vec.y;
    }
    if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
      if (p.direction === 'up') dy = -1;
      else if (p.direction === 'down') dy = 1;
      else if (p.direction === 'left') dx = -1;
      else if (p.direction === 'right') dx = 1;
      else dy = 1;
    } else {
      const mag = Math.hypot(dx, dy) || 1;
      dx /= mag;
      dy /= mag;
    }

    // Check Perfect Phase (dashing right near an incoming enemy projectile)
    let perfectPhase = false;
    for (let ep of this.enemyProjectiles) {
      if (Math.hypot((p.x + p.width / 2) - ep.x, (p.y + p.height / 2) - ep.y) < 62) {
        perfectPhase = true;
        break;
      }
    }

    p.iFrames = Math.max(p.iFrames, 22);

    const activeObs = (window.Dimensions && typeof Dimensions.getActiveObstacles === 'function')
      ? Dimensions.getActiveObstacles()
      : [];
    const doors = (window.State && State.currentDimension === 'wasteland' && window.Dimensions && Dimensions.destructibleDoors)
      ? Dimensions.destructibleDoors.filter(d => !d.shattered)
      : [];
    const cfg = (window.State && State.DIMENSIONS) ? State.DIMENSIONS[State.currentDimension] : null;
    const activeDim = window.State ? State.currentDimension : 'underground';
    const isCombatDim = activeDim === 'wasteland' || activeDim === 'horizon';

    const steps = 8;
    const totalDist = hasPhaseBlade ? 156 : 138;
    const stepX = (dx * totalDist) / steps;
    const stepY = (dy * totalDist) / steps;

    const dashDmg = Math.round(
      48 * this.getPlayerLevelDamageMult() * (isHypercharged ? 1.4 : 1.0) * (hasPhaseBlade ? 1.8 : 1.0)
    );
    const dashHitRadius = hasPhaseBlade ? 58 : 44;
    const dashTrailCol = hasPhaseBlade ? '#c084fc' : palette.primary;
    const dashedIds = new Set();
    let dashHits = 0;

    for (let s = 1; s <= steps; s++) {
      this.dashGhosts.push({
        x: p.x,
        y: p.y,
        dir: p.direction,
        coat: dashTrailCol,
        visor: '#ffffff',
        pants: palette.secondary,
        life: 10 + s,
        maxLife: 18
      });

      const candX = p.x + stepX;
      const candY = p.y + stepY;
      const boxX = { x: candX, y: p.y, width: p.width, height: p.height };
      const boxY = { x: p.x, y: candY, width: p.width, height: p.height };

      let blockedX = false, blockedY = false;
      for (let o of activeObs) {
        if (this.checkCollision(boxX, o)) blockedX = true;
        if (this.checkCollision(boxY, o)) blockedY = true;
      }
      for (let d of doors) {
        if (this.checkCollision(boxX, d)) blockedX = true;
        if (this.checkCollision(boxY, d)) blockedY = true;
      }

      if (!blockedX) p.x = candX;
      if (!blockedY) p.y = candY;

      if (cfg) {
        p.x = Math.max(10, Math.min(cfg.width - p.width - 10, p.x));
        p.y = Math.max(10, Math.min(cfg.height - p.height - 10, p.y));
      }

      // Dash-Through Zip Strike along the movement path
      const pxMid = p.x + (p.width || 26) / 2;
      const pyMid = p.y + (p.height || 38) / 2;

      if (isCombatDim && Entities.hostileNpcs) {
        for (let npc of Entities.hostileNpcs) {
          if (!npc.alive || (npc.dim || 'wasteland') !== activeDim || dashedIds.has(npc.id)) continue;
          const dist = Math.hypot((npc.x + npc.width / 2) - pxMid, (npc.y + npc.height / 2) - pyMid);
          if (dist <= dashHitRadius) {
            dashedIds.add(npc.id);
            dashHits++;
            npc.hitFlash = 5;
            const knockDir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
            this.spawnHitSparks(npc.x + npc.width / 2, npc.y + npc.height / 2, dashTrailCol, hasPhaseBlade ? 16 : 10, Math.atan2(dy, dx));
            Entities.damageNpc(npc, dashDmg, knockDir);
            this.spawnDamageNumber(npc.x + npc.width / 2, npc.y - 12, `⚡${dashDmg}`, dashTrailCol, hasPhaseBlade);
          }
        }
      } else if (activeDim === 'underground' && Entities.trainingDummies) {
        for (let dummy of Entities.trainingDummies) {
          if (dashedIds.has(dummy.id)) continue;
          const dist = Math.hypot((dummy.x + dummy.width / 2) - pxMid, (dummy.y + dummy.height / 2) - pyMid);
          if (dist <= dashHitRadius) {
            dashedIds.add(dummy.id);
            dashHits++;
            dummy.hitFlash = 5;
            this.spawnHitSparks(dummy.x + dummy.width / 2, dummy.y + dummy.height / 2, dashTrailCol, 12, Math.atan2(dy, dx));
            this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 12, `⚡${dashDmg}`, dashTrailCol, hasPhaseBlade);
          }
        }
      }
    }

    if (dashHits > 0) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx(hasPhaseBlade ? 'beat_crit' : 'slash');
      this.triggerHitStop(2);
      this.addStylePoints(14 * dashHits, dashHits);
      this.meleeSlashes.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2,
        originX: p.x + p.width / 2 - dx * 55, originY: p.y + p.height / 2 - dy * 55,
        dir: p.direction, type: 'stab_thrust', color: dashTrailCol, secondaryColor: '#ffffff',
        radius: 64, life: 11, maxLife: 11, damage: dashDmg, isBeatSync: true
      });
      if (hasPhaseBlade || hasVampireLimiter) {
        const healAmt = (hasPhaseBlade ? 4 * dashHits : 0) + (hasVampireLimiter ? Math.max(1, Math.round(dashDmg * 0.06 * dashHits)) : 0);
        if (healAmt > 0 && p.hp < p.maxHp) {
          p.hp = Math.min(p.maxHp, p.hp + healAmt);
          if (typeof Entities.updatePlayerHealthUI === 'function') Entities.updatePlayerHealthUI();
          this.spawnDamageNumber(p.x + p.width / 2, p.y - 26, `+${healAmt} HP`, '#4ade80', false);
        }
      }
    }

    this.spawnHitSparks(p.x + p.width / 2, p.y + p.height / 2, palette.primary, 10, Math.atan2(-dy, -dx));

    if (perfectPhase) {
      p.hp = Math.min(p.maxHp, p.hp + 8);
      if (typeof Entities.updatePlayerHealthUI === 'function') Entities.updatePlayerHealthUI();
      this.addStylePoints(18, 1);
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('beat_crit');
      this.spawnDamageNumber(p.x + p.width / 2, p.y - 18, "⚡ PERFECT PHASE +8 HP", '#00f0ff', true);
    }
  },

  // =========================================================================
  // PLASMA BLASTER [J] (COMET BOLTS & ORBITING HOMING SUN)
  // =========================================================================
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
    const palette = this.getActiveSkinPalette();

    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);
    const hasTapeSaturator = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_tape_saturator'));
    const lvlMult = this.getPlayerLevelDamageMult();
    const isBeatSync = this.checkBeatSync();
    const beatMult = isBeatSync ? 1.25 : 1.0;

    const holdSeconds = (Date.now() - this.shootChargeStartTime) / 1000;
    const requiredHold = isHypercharged ? 0.5 : 1.0;

    let vx = 0, vy = 0;
    const dir = p.direction || 'down';

    if (dir === 'up') vy = -1;
    else if (dir === 'down') vy = 1;
    else if (dir === 'left') vx = -1;
    else if (dir === 'right') vx = 1;
    else vy = 1;

    const damageMultiplier = (hasTapeSaturator ? 1.35 : 1.0) * (isHypercharged ? 1.5 : 1.0) * lvlMult * beatMult;
    const primaryBoltColor = hasTapeSaturator ? '#f97316' : palette.primary;
    const secondaryBoltColor = hasTapeSaturator ? '#fbbf24' : palette.secondary;

    const originX = p.x + (p.width || 26) / 2 + vx * 14;
    const originY = p.y + (p.height || 38) / 2 + vy * 14;

    this.muzzleFlashes.push({
      x: originX, y: originY,
      angle: Math.atan2(vy, vx),
      color: primaryBoltColor,
      radius: holdSeconds >= requiredHold ? 22 : 13,
      life: 6, maxLife: 6
    });

    const hasArpeggiator = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_arpeggiator'));
    const baseAngle = Math.atan2(vy, vx);

    if (holdSeconds >= requiredHold) {
      this.shootCooldown = Date.now() + (isHypercharged ? 400 : 850);
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
        AudioEngine.playSfx(isBeatSync ? 'beat_crit' : 'laser');
      }
      const dmg = Math.round(120 * damageMultiplier);
      this.projectiles.push({
        x: originX,
        y: originY,
        vx: vx * 9.8, vy: vy * 9.8, speed: 9.8, radius: 14,
        isCharged: true, isBeatSync, damage: dmg, aoeRadius: 155, life: 90,
        color: primaryBoltColor, trailColor: secondaryBoltColor,
        history: []
      });
      if (hasArpeggiator) {
        const subDmg = Math.round(dmg * 0.55);
        [-0.36, 0.36].forEach(angOff => {
          const sa = baseAngle + angOff;
          this.projectiles.push({
            x: originX, y: originY,
            vx: Math.cos(sa) * 12.2, vy: Math.sin(sa) * 12.2, speed: 12.2, radius: 7,
            isCharged: false, isBeatSync, damage: subDmg, aoeRadius: 0, life: 72,
            color: '#e879f9', trailColor: primaryBoltColor, history: []
          });
        });
      }
      if (window.State && typeof State.showToast === 'function') {
        State.showToast(isBeatSync ? "🎵 BEAT-SYNCED PLASMA SUPERNOVA! ☄️" : "RELEASED CHARGED PLASMA ORB! ☄️");
      }
    } else {
      this.shootCooldown = Date.now() + 170;
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
        AudioEngine.playSfx(isBeatSync ? 'beat_crit' : 'laser');
      }
      const angles = hasArpeggiator ? [baseAngle - 0.20, baseAngle, baseAngle + 0.20] : [baseAngle];
      const perBoltMult = hasArpeggiator ? 0.85 : 1.0;
      const dmg = Math.round(30 * damageMultiplier * perBoltMult);
      angles.forEach((ang, idx) => {
        this.projectiles.push({
          x: originX,
          y: originY,
          vx: Math.cos(ang) * 13.5, vy: Math.sin(ang) * 13.5, speed: 13.5, radius: 5.5,
          isCharged: false, isBeatSync, damage: dmg, aoeRadius: 0, life: 60,
          color: (hasArpeggiator && idx !== 1) ? '#e879f9' : primaryBoltColor,
          trailColor: secondaryBoltColor,
          history: []
        });
      });
    }
  },

  // =========================================================================
  // MELEE BLADE ARSENAL [K] (CRESCENT RIBBONS, GLAIVE VORTEX & DEFLECTION)
  // =========================================================================
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

  // Slices or deflects incoming enemy projectiles back at the attacker for 2.5x damage!
  deflectEnemyProjectiles(hitX, hitY, hitRadius) {
    if (!this.enemyProjectiles || this.enemyProjectiles.length === 0) return;
    const palette = this.getActiveSkinPalette();
    let deflectedCount = 0;

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      const dist = Math.hypot(ep.x - hitX, ep.y - hitY);
      if (dist <= hitRadius + 22) {
        deflectedCount++;
        const speed = 14.5;
        const revAngle = Math.atan2(-ep.vy, -ep.vx);
        this.projectiles.push({
          x: ep.x, y: ep.y,
          vx: Math.cos(revAngle) * speed,
          vy: Math.sin(revAngle) * speed,
          speed,
          radius: 7,
          isCharged: false,
          isDeflected: true,
          damage: Math.round((ep.damage || 20) * 2.5),
          aoeRadius: 0,
          life: 65,
          color: '#ffffff',
          trailColor: palette.primary,
          history: []
        });
        this.spawnHitSparks(ep.x, ep.y, '#00f0ff', 10, revAngle);
        this.enemyProjectiles.splice(i, 1);
      }
    }

    if (deflectedCount > 0) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
        AudioEngine.playSfx('deflect');
      }
      this.triggerHitStop(2);
      this.addStylePoints(14 * deflectedCount, deflectedCount);
      if (window.Entities && Entities.player) {
        this.spawnDamageNumber(Entities.player.x + 13, Entities.player.y - 18, `⚔️ PARRY x${deflectedCount}!`, '#00f0ff', true);
      }
    }
  },

  executeComboSlash(step) {
    if (!window.Entities || !Entities.player) return;
    const p = Entities.player;
    const palette = this.getActiveSkinPalette();
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;
    const offset = 34;

    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);
    const isBeatSync = this.checkBeatSync();
    const beatMult = isBeatSync ? 1.25 : 1.0;
    const dmgMult = (isHypercharged ? 1.6 : 1.0) * this.getPlayerLevelDamageMult() * beatMult;

    if (p.direction === 'up') slashY -= offset;
    else if (p.direction === 'down') slashY += offset;
    else if (p.direction === 'left') slashX -= offset;
    else if (p.direction === 'right') slashX += offset;

    this.lastWeaponSwingTime = Date.now();
    const sfxToPlay = isBeatSync ? 'beat_crit' : 'slash';

    if (step === 0) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx(sfxToPlay);
      const dmg = Math.round(35 * dmgMult);
      const col = isBeatSync ? '#facc15' : palette.secondary;
      this.lastWeaponColor = col;
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'stab_thrust', color: col, secondaryColor: palette.primary,
        radius: 42, life: 11, maxLife: 11, damage: dmg, isBeatSync
      });
      this.deflectEnemyProjectiles(slashX, slashY, 52);
      this.checkMeleeHits(slashX, slashY, 52, dmg, isBeatSync, p.direction, false);
    } else if (step === 1) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx(sfxToPlay);
      const dmg = Math.round(50 * dmgMult);
      const col = isBeatSync ? '#facc15' : palette.primary;
      this.lastWeaponColor = col;
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'crescent_sweep', color: col, secondaryColor: palette.secondary,
        radius: 54, life: 13, maxLife: 13, damage: dmg, isBeatSync
      });
      this.deflectEnemyProjectiles(slashX, slashY, 60);
      this.checkMeleeHits(slashX, slashY, 60, dmg, isBeatSync, p.direction, false);
    } else if (step === 2) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx(sfxToPlay);
      const dmg = Math.round(75 * dmgMult);
      const col = isBeatSync ? '#facc15' : '#ff7700';
      this.lastWeaponColor = col;
      this.meleeSlashes.push({
        x: p.x + p.width / 2, y: p.y + p.height / 2, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'spinning_vortex', color: col, secondaryColor: palette.primary,
        radius: 68, life: 15, maxLife: 15, damage: dmg, isBeatSync
      });
      this.deflectEnemyProjectiles(p.x + p.width / 2, p.y + p.height / 2, 76);
      this.checkMeleeHits(p.x + p.width / 2, p.y + p.height / 2, 76, dmg, isBeatSync, 'radial', false);
    } else if (step === 3) {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx(sfxToPlay);
      if (window.State && typeof State.triggerScreenShake === 'function') State.triggerScreenShake(8, 15);
      const dmg = Math.round(100 * dmgMult);
      const col = '#facc15';
      this.lastWeaponColor = col;
      this.meleeSlashes.push({
        x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
        dir: p.direction, type: 'ground_slam', color: col, secondaryColor: palette.primary,
        radius: 82, life: 18, maxLife: 18, damage: dmg, isBeatSync
      });
      this.spawnHitSparks(slashX, slashY, col, 14);
      this.deflectEnemyProjectiles(slashX, slashY, 86);
      this.checkMeleeHits(slashX, slashY, 86, dmg, true, p.direction, true);
    }
  },

  executeMidChargeSlash() {
    if (!window.Entities || !Entities.player) return;
    const p = Entities.player;
    const palette = this.getActiveSkinPalette();
    let slashX = p.x + p.width / 2;
    let slashY = p.y + p.height / 2;
    const offset = 38;

    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);
    const isBeatSync = this.checkBeatSync();
    const dmg = Math.round(115 * (isHypercharged ? 1.6 : 1.0) * this.getPlayerLevelDamageMult() * (isBeatSync ? 1.25 : 1.0));

    if (p.direction === 'up') slashY -= offset;
    else if (p.direction === 'down') slashY += offset;
    else if (p.direction === 'left') slashX -= offset;
    else if (p.direction === 'right') slashX += offset;

    this.lastWeaponSwingTime = Date.now();
    this.lastWeaponColor = palette.primary;

    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('slash');
    this.meleeSlashes.push({
      x: slashX, y: slashY, originX: p.x + p.width / 2, originY: p.y + p.height / 2,
      dir: p.direction, type: 'crescent_sweep', color: '#ff7700', secondaryColor: palette.primary,
      radius: 70, life: 16, maxLife: 16, damage: dmg, isBeatSync
    });
    this.deflectEnemyProjectiles(slashX, slashY, 78);
    this.checkMeleeHits(slashX, slashY, 78, dmg, true, p.direction, true);
  },

  executeDevastatingChargeSlash() {
    if (!window.Entities || !Entities.player) return;
    const p = Entities.player;
    const palette = this.getActiveSkinPalette();
    const slashX = p.x + p.width / 2;
    const slashY = p.y + p.height / 2;

    const hasSubWoofer = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_sub_woofer'));
    const isHypercharged = (window.State && State.userProfile && State.userProfile.hyperchargeTimer > 0);
    const isBeatSync = this.checkBeatSync();

    const aoeRadius = hasSubWoofer ? 310 : 220;
    const baseDmg = hasSubWoofer ? 225 : 185;
    const dmg = Math.round(baseDmg * (isHypercharged ? 1.5 : 1.0) * this.getPlayerLevelDamageMult() * (isBeatSync ? 1.25 : 1.0));
    const waveColor = hasSubWoofer ? '#00f0ff' : palette.primary;

    this.lastWeaponSwingTime = Date.now();
    this.lastWeaponColor = waveColor;

    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
    if (window.State && typeof State.triggerScreenShake === 'function') State.triggerScreenShake(18, 30);

    this.meleeSlashes.push({
      x: slashX, y: slashY, originX: slashX, originY: slashY,
      dir: p.direction, type: 'devastating_breaker', color: waveColor, secondaryColor: palette.secondary,
      radius: 105, life: 26, maxLife: 26, damage: dmg, isBeatSync
    });
    this.explosions.push({
      x: slashX, y: slashY, radius: 12, maxRadius: aoeRadius,
      color: waveColor, secondaryColor: palette.secondary,
      isSubWaveform: true, life: 32, maxLife: 32
    });
    this.spawnHitSparks(slashX, slashY, waveColor, 22);
    this.deflectEnemyProjectiles(slashX, slashY, aoeRadius);

    let hitAny = false;
    if (window.State && (State.currentDimension === 'wasteland' || State.currentDimension === 'horizon') && Entities.hostileNpcs) {
      Entities.hostileNpcs.forEach(n => {
        if (n.alive && (n.dim || 'wasteland') === State.currentDimension) {
          const dist = Math.hypot((n.x + n.width / 2) - slashX, (n.y + n.height / 2) - slashY);
          if (dist <= aoeRadius) {
            hitAny = true;
            const angle = Math.atan2((n.y + n.height / 2) - slashY, (n.x + n.width / 2) - slashX);
            const knockDir = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
              ? (Math.cos(angle) > 0 ? 'right' : 'left') : (Math.sin(angle) > 0 ? 'down' : 'up');
            n.hitFlash = 5;
            this.spawnHitSparks(n.x + n.width / 2, n.y + n.height / 2, waveColor, 10, angle);
            Entities.damageNpc(n, dmg, knockDir);
            this.spawnDamageNumber(n.x + n.width / 2, n.y - 12, dmg, waveColor, true, isBeatSync);
          }
        }
      });
    }

    if (hitAny) {
      this.triggerHitStop(3);
      this.addStylePoints(22, 2);
    }

    if (window.State && State.currentDimension === 'underground' && Entities.trainingDummies) {
      Entities.trainingDummies.forEach(d => {
        if (Math.hypot((d.x + d.width / 2) - slashX, (d.y + d.height / 2) - slashY) <= aoeRadius) {
          d.hitFlash = 5;
          this.spawnHitSparks(d.x + d.width / 2, d.y + d.height / 2, waveColor, 12);
          this.addStylePoints(12, 1);
          this.spawnDamageNumber(d.x + d.width / 2, d.y - 12, dmg, waveColor, true, isBeatSync);
        }
      });
    }

    this.checkDestructibleDoors(slashX, slashY, 135, dmg, true);
    if (window.State && typeof State.showToast === 'function') {
      State.showToast(hasSubWoofer ? "PURE MONO SUB-BASS SHOCKWAVE DISCHARGED! 🔊⚡" : "DEVASTATING COSMIC SHOCKWAVE DISCHARGED! ⚡💥");
    }
  },

  checkMeleeHits(hitX, hitY, hitRadius, damage, isCharged, knockDirMode, isHeavy = false) {
    const palette = this.getActiveSkinPalette();
    let hitCount = 0;

    let realEnemyHits = 0;
    if (window.State && (State.currentDimension === 'wasteland' || State.currentDimension === 'horizon') && Entities.hostileNpcs) {
      Entities.hostileNpcs.forEach(npc => {
        if (npc.alive && (npc.dim || 'wasteland') === State.currentDimension) {
          const dist = Math.hypot((npc.x + npc.width / 2) - hitX, (npc.y + npc.height / 2) - hitY);
          if (dist <= hitRadius) {
            hitCount++;
            realEnemyHits++;
            let actualKnockDir = knockDirMode;
            const angle = Math.atan2((npc.y + npc.height / 2) - hitY, (npc.x + npc.width / 2) - hitX);
            if (knockDirMode === 'radial') {
              actualKnockDir = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))
                ? (Math.cos(angle) > 0 ? 'right' : 'left') : (Math.sin(angle) > 0 ? 'down' : 'up');
            }
            npc.hitFlash = 4;
            this.spawnHitSparks(npc.x + npc.width / 2, npc.y + npc.height / 2, palette.primary, isHeavy ? 14 : 8, angle);
            Entities.damageNpc(npc, damage, actualKnockDir);
            this.spawnDamageNumber(npc.x + npc.width / 2, npc.y - 8, damage, isCharged ? '#facc15' : '#ffffff', isCharged);
          }
        }
      });
      this.checkDestructibleDoors(hitX, hitY, hitRadius, damage, isCharged);
    }

    if (realEnemyHits > 0 && window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_vampire_limiter') && window.Entities && Entities.player) {
      const siphon = Math.max(2, Math.round(damage * 0.06 * realEnemyHits));
      if (Entities.player.hp < Entities.player.maxHp) {
        Entities.player.hp = Math.min(Entities.player.maxHp, Entities.player.hp + siphon);
        if (typeof Entities.updatePlayerHealthUI === 'function') Entities.updatePlayerHealthUI();
        this.spawnDamageNumber(Entities.player.x + Entities.player.width / 2, Entities.player.y - 16, `+${siphon} HP`, '#4ade80', false);
      }
    }

    if (window.State && State.currentDimension === 'underground' && Entities.trainingDummies) {
      Entities.trainingDummies.forEach(dummy => {
        if (Math.hypot((dummy.x + dummy.width / 2) - hitX, (dummy.y + dummy.height / 2) - hitY) <= hitRadius) {
          hitCount++;
          dummy.hitFlash = 4;
          this.spawnHitSparks(dummy.x + dummy.width / 2, dummy.y + dummy.height / 2, palette.primary, 10);
          if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
          this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 8, damage, isCharged ? '#facc15' : '#00f0ff', isCharged);
        }
      });
    }

    if (hitCount > 0) {
      this.addStylePoints((isCharged ? 12 : 8) * hitCount, hitCount);
      if (isHeavy) this.triggerHitStop(2);
    }
  },

  checkDestructibleDoors(hitX, hitY, hitRadius, damage, isCharged) {
    if (!window.State || State.currentDimension !== 'wasteland' || !window.Dimensions || !Dimensions.destructibleDoors) return;
    Dimensions.destructibleDoors.forEach(d => {
      if (!d.shattered) {
        if (Math.hypot((d.x + d.width / 2) - hitX, (d.y + d.height / 2) - hitY) <= hitRadius + 30) {
          if (isCharged) {
            d.hp -= damage;
            this.spawnHitSparks(d.x + d.width / 2, d.y + d.height / 2, '#ff003c', 14);
            if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
            this.spawnDamageNumber(d.x + d.width / 2, d.y - 14, damage, '#ff003c', true);
            if (d.hp <= 0) {
              d.shattered = true;
              if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
              if (window.State) {
                State.triggerScreenShake(14, 24);
                State.showToast("BREACH DESTROYED // SECRET PATH OPENED! 🔓💥");
                State.save();
              }
            } else {
              if (window.State) State.showToast(`DOOR INTEGRITY: ${d.hp}/${d.maxHp} HP`);
            }
          } else {
            if (window.State) State.showToast("ARMORED: REQUIRES CHARGED ATTACK OR 50🪙 BYPASS!");
          }
        }
      }
    });
  },

  // =========================================================================
  // TELEGRAPHED WORLD BOSS SIGNATURE ATTACKS
  // =========================================================================
  spawnBossTelegraph(boss, targetX, targetY, damage) {
    if (!boss || !window.State) return;
    const dim = boss.dim || State.currentDimension;
    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
      AudioEngine.playSfx('boss_warn');
    }

    if (boss.id === 'boss_furnace_warden') {
      // Vulcan-808: Molten 808 Sub-Slam around boss
      this.telegraphs.push({
        dim, type: 'molten_slam',
        x: boss.x + boss.width / 2, y: boss.y + boss.height / 2,
        radius: 175, color: '#f97316',
        timer: 42, maxTimer: 42, damage: Math.round(damage * 1.25)
      });
    } else if (boss.id === 'boss_drain_leviathan' || boss.id === 'boss_seraphim_echo') {
      // Sub-Zero & Seraphim Echo: High-Velocity Railgun Beam
      const angle = Math.atan2(targetY - (boss.y + boss.height / 2), targetX - (boss.x + boss.width / 2));
      this.telegraphs.push({
        dim, type: 'rail_beam',
        x: boss.x + boss.width / 2, y: boss.y + boss.height / 2,
        angle, length: 540, width: 38, color: boss.id === 'boss_seraphim_echo' ? '#f472b6' : '#00f0ff',
        timer: 38, maxTimer: 38, damage: Math.round(damage * 1.2)
      });
    } else if (boss.id === 'boss_signal_archon' || boss.id === 'boss_aether_oracle' || boss.id === 'boss_creator') {
      // Orbital Signal / Celestial Halo Strikes (CREATOR stacks extra reticles per phase!)
      const ph = boss.id === 'boss_creator' ? (boss.phase || 1) : 1;
      const strikeCount = boss.id === 'boss_creator' ? (2 + ph) : 3;
      const strikeCol = boss.id === 'boss_creator'
        ? (ph === 3 ? '#facc15' : (ph === 2 ? '#00f0ff' : '#ec4899'))
        : (boss.id === 'boss_aether_oracle' ? '#c084fc' : '#f43f5e');
      for (let k = 0; k < strikeCount; k++) {
        const ox = targetX + (k === 0 ? 0 : (Math.random() - 0.5) * 240);
        const oy = targetY + (k === 0 ? 0 : (Math.random() - 0.5) * 240);
        this.telegraphs.push({
          dim, type: 'orbital_strike',
          x: ox, y: oy,
          radius: boss.id === 'boss_creator' ? 84 : 75,
          color: strikeCol,
          timer: 44 + k * 7, maxTimer: 44 + k * 7, damage: Math.round(damage * 1.2)
        });
      }
    } else if (boss.id === 'boss_chem_enforcer') {
      // Chem-Enforcer: Dual Caustic Bio-Mortar Blast Zones
      for (let k = 0; k < 2; k++) {
        this.telegraphs.push({
          dim, type: 'orbital_strike',
          x: targetX + (k * 90 - 45), y: targetY + (Math.random() * 60 - 30),
          radius: 80, color: '#84cc16',
          timer: 44, maxTimer: 44, damage
        });
      }
    }
  },

  spawnDamageNumber(x, y, amountOrText, color = '#ffffff', isCrit = false, isBeatSync = false) {
    const label = typeof amountOrText === 'string'
      ? amountOrText
      : (isBeatSync ? `🎵 BEAT ${amountOrText}!` : (isCrit ? `CRIT ${amountOrText}` : `-${amountOrText}`));
    this.floatingNumbers.push({
      x: x + (Math.random() * 16 - 8), y: y, text: label,
      color: isBeatSync ? '#facc15' : color,
      scale: isBeatSync ? 1.45 : (isCrit ? 1.3 : 1.0),
      life: 38, maxLife: 38
    });
  },

  update() {
    // Decay Style Meter over time if out of combat
    if (this.styleDecayTimer > 0) {
      this.styleDecayTimer--;
    } else if (this.stylePoints > 0) {
      this.stylePoints = Math.max(0, this.stylePoints - 0.35);
      if (this.stylePoints === 0) this.comboHits = 0;
    }

    const isCombatDim = window.State && (State.currentDimension === 'wasteland' || State.currentDimension === 'horizon');

    // Update Player Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      p.history = p.history || [];
      p.history.push({ x: p.x, y: p.y });
      if (p.history.length > (p.isCharged ? 10 : 6)) p.history.shift();

      if (isCombatDim && window.Entities && Entities.hostileNpcs) {
        let bestTarget = null, bestScore = -Infinity;
        for (let n of Entities.hostileNpcs) {
          if (n.alive && (n.dim || 'wasteland') === State.currentDimension) {
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
          const turnRate = p.isCharged ? 0.13 : 0.22;
          const newAngle = currentAngle + Math.max(-turnRate, Math.min(turnRate, angleDiff));
          p.vx = Math.cos(newAngle) * p.speed; 
          p.vy = Math.sin(newAngle) * p.speed;
        }
      }

      p.x += p.vx; 
      p.y += p.vy; 
      p.life--;

      if (p.isCharged && p.life % 2 === 0) {
        this.particles.push({
          x: p.x + (Math.random() - 0.5) * 10,
          y: p.y + (Math.random() - 0.5) * 10,
          vx: -p.vx * 0.15 + (Math.random() - 0.5) * 1.5,
          vy: -p.vy * 0.15 + (Math.random() - 0.5) * 1.5,
          len: 5, size: 2.5,
          color: p.color || '#00f0ff',
          life: 12, maxLife: 12
        });
      }

      let hit = false;
      const pBox = { x: p.x - p.radius, y: p.y - p.radius, width: p.radius * 2, height: p.radius * 2 };

      if (isCombatDim && window.Dimensions) {
        if (State.currentDimension === 'wasteland' && Dimensions.destructibleDoors) {
          Dimensions.destructibleDoors.forEach(d => {
            if (!d.shattered && this.checkCollision(pBox, d)) {
              hit = true;
              this.spawnHitSparks(p.x, p.y, p.color || '#00f0ff', 10);
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
            if (npc.alive && (npc.dim || 'wasteland') === State.currentDimension && this.checkCollision(pBox, npc)) {
              npc.hitFlash = 4;
              this.spawnHitSparks(p.x, p.y, p.color || '#00f0ff', p.isCharged ? 16 : 9, Math.atan2(p.vy, p.vx));
              this.addStylePoints(p.isCharged ? 14 : (p.isDeflected ? 18 : 6), 1);
              Entities.damageNpc(npc, p.damage, p.vx > 0 ? 'right' : 'left');
              this.spawnDamageNumber(npc.x + npc.width / 2, npc.y - 10, p.damage, p.isCharged ? '#00f0ff' : '#facc15', p.isCharged || p.isDeflected, p.isBeatSync);
              hit = true; break;
            }
          }
        }
      }

      if (!hit && window.State && State.currentDimension === 'underground' && window.Entities && Entities.trainingDummies) {
        for (let dummy of Entities.trainingDummies) {
          if (this.checkCollision(pBox, dummy)) {
            dummy.hitFlash = 4;
            this.spawnHitSparks(p.x, p.y, p.color || '#00f0ff', 10, Math.atan2(p.vy, p.vx));
            this.addStylePoints(6, 1);
            if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
            this.spawnDamageNumber(dummy.x + dummy.width / 2, dummy.y - 10, p.damage, p.isCharged ? '#00f0ff' : '#facc15', p.isCharged, p.isBeatSync);
            hit = true; break;
          }
        }
      }

      if (!hit && window.Dimensions) {
        const obs = typeof Dimensions.getActiveObstacles === 'function' ? Dimensions.getActiveObstacles() : (Dimensions.undergroundObstacles || []);
        for (let o of obs) {
          if (this.checkCollision(pBox, o)) {
            this.spawnHitSparks(p.x, p.y, p.color || '#00f0ff', 6);
            hit = true; break;
          }
        }
      }

      if (hit) {
        if (p.isCharged) {
          if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
          if (window.State && typeof State.triggerScreenShake === 'function') State.triggerScreenShake(10, 18);
          this.triggerHitStop(2);
          this.explosions.push({
            x: p.x, y: p.y, radius: 10, maxRadius: p.aoeRadius,
            color: p.color || '#00f0ff', secondaryColor: p.trailColor || '#ec4899',
            isSubWaveform: false, life: 26, maxLife: 26
          });
          if (isCombatDim && window.Entities && Entities.hostileNpcs) {
            Entities.hostileNpcs.forEach(n => {
              if (n.alive && (n.dim || 'wasteland') === State.currentDimension && Math.hypot((n.x + n.width / 2) - p.x, (n.y + n.height / 2) - p.y) <= p.aoeRadius) {
                n.hitFlash = 4;
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

    // Update Enemy Projectiles (Blocked by Walls & Intact Security Doors)
    const activeEnemyObs = (window.Dimensions && typeof Dimensions.getActiveObstacles === 'function')
      ? Dimensions.getActiveObstacles()
      : [];
    const activeEnemyDoors = (window.State && State.currentDimension === 'wasteland' && window.Dimensions && Dimensions.destructibleDoors)
      ? Dimensions.destructibleDoors.filter(d => !d.shattered)
      : [];

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx; 
      ep.y += ep.vy; 
      ep.life--;

      const epRad = ep.radius || 5;
      const epBox = { x: ep.x - epRad, y: ep.y - epRad, width: epRad * 2, height: epRad * 2 };
      let hitWall = false;
      for (let o of activeEnemyObs) {
        if (this.checkCollision(epBox, o)) { hitWall = true; break; }
      }
      if (!hitWall) {
        for (let d of activeEnemyDoors) {
          if (this.checkCollision(epBox, d)) { hitWall = true; break; }
        }
      }
      if (hitWall) {
        this.spawnHitSparks(ep.x, ep.y, ep.color || '#ff003c', 6);
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (window.Entities && Entities.player) {
        const p = Entities.player;
        if (Math.hypot((p.x + p.width / 2) - ep.x, (p.y + p.height / 2) - ep.y) < p.width * 0.7) {
          this.spawnHitSparks(ep.x, ep.y, '#ff003c', 10);
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

    // Update Boss Telegraphed Signature Zones
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const tg = this.telegraphs[i];
      tg.timer--;
      if (tg.timer <= 0) {
        if (window.State && State.currentDimension === tg.dim && window.Entities && Entities.player) {
          const p = Entities.player;
          const px = p.x + p.width / 2;
          const py = p.y + p.height / 2;

          if (tg.type === 'molten_slam' || tg.type === 'orbital_strike') {
            this.explosions.push({
              x: tg.x, y: tg.y, radius: 12, maxRadius: tg.radius,
              color: tg.color, secondaryColor: '#ffffff', isSubWaveform: true, life: 22, maxLife: 22
            });
            this.spawnHitSparks(tg.x, tg.y, tg.color, 16);
            if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
            if (Math.hypot(px - tg.x, py - tg.y) <= tg.radius) {
              Entities.damagePlayer(tg.damage, px > tg.x ? 'right' : 'left');
              this.spawnDamageNumber(px, p.y - 14, tg.damage, tg.color, true);
            }
          } else if (tg.type === 'rail_beam') {
            const endX = tg.x + Math.cos(tg.angle) * tg.length;
            const endY = tg.y + Math.sin(tg.angle) * tg.length;
            this.spawnHitSparks(endX, endY, tg.color, 14);
            if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('laser');
            // Point-to-segment distance check for rail beam
            const l2 = tg.length * tg.length;
            let t = ((px - tg.x) * (endX - tg.x) + (py - tg.y) * (endY - tg.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            const projX = tg.x + t * (endX - tg.x);
            const projY = tg.y + t * (endY - tg.y);
            if (Math.hypot(px - projX, py - projY) <= tg.width) {
              Entities.damagePlayer(tg.damage, 'down');
              this.spawnDamageNumber(px, p.y - 14, tg.damage, tg.color, true);
            }
          }
        }
        this.telegraphs.splice(i, 1);
      }
    }

    for (let i = this.meleeSlashes.length - 1; i >= 0; i--) {
      this.meleeSlashes[i].life--;
      if (this.meleeSlashes[i].life <= 0) this.meleeSlashes.splice(i, 1);
    }

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.radius += (exp.maxRadius - exp.radius) * 0.26;
      exp.life--;
      if (exp.life <= 0) this.explosions.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vx *= 0.88;
      pt.vy *= 0.88;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.impactFlashes.length - 1; i >= 0; i--) {
      this.impactFlashes[i].life--;
      if (this.impactFlashes[i].life <= 0) this.impactFlashes.splice(i, 1);
    }

    for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
      this.muzzleFlashes[i].life--;
      if (this.muzzleFlashes[i].life <= 0) this.muzzleFlashes.splice(i, 1);
    }

    for (let i = this.dashGhosts.length - 1; i >= 0; i--) {
      this.dashGhosts[i].life--;
      if (this.dashGhosts[i].life <= 0) this.dashGhosts.splice(i, 1);
    }

    for (let i = this.floatingNumbers.length - 1; i >= 0; i--) {
      const fn = this.floatingNumbers[i];
      fn.y -= 0.9; 
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
      ctx.shadowBlur = 5;
      ctx.fillText(fn.text, fn.x, fn.y);
      ctx.restore();
    });
  }
};

window.Combat = Combat;
