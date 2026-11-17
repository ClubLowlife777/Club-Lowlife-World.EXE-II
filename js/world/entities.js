/**
 * CLUB LOWLIFE // ENTITY MANAGEMENT, ESCALATING WORLD BOSSES & COMBAT AI
 * File: js/world/entities.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Physics (Rev 5.20 - 6 Wasteland Bosses + Horizon Boss & High Density)
 */

const Entities = {
  player: {
    x: 350, y: 750, width: 26, height: 38,
    direction: 'down',
    baseSpeed: 5.6,
    sprintSpeed: 8.8,
    hp: 100, maxHp: 100,
    iFrames: 0,
    knockbackVx: 0, knockbackVy: 0,
    isMoving: false, animTimer: 0,
    danceTimer: 0, safeZoneRegenTimer: 0
  },

  // Canonical World Boss Definitions for Initial Spawn & Timed Respawns
  BOSS_TEMPLATES: {
    boss_blade_zero: {
      id: 'boss_blade_zero',
      dim: 'wasteland',
      baseName: 'HIGH EXECUTIONER "BLADE-ZERO"',
      x: 3200, y: 4100, width: 42, height: 52,
      baseHp: 1600, speed: 3.8,
      coat: '#050507', visor: '#ff003c', pants: '#000000'
    },
    boss_chem_enforcer: {
      id: 'boss_chem_enforcer',
      dim: 'wasteland',
      baseName: 'CHEM-ENFORCER UNIT 09',
      x: 1400, y: 2200, width: 40, height: 50,
      baseHp: 750, speed: 2.7,
      coat: '#365314', visor: '#84cc16', pants: '#1a2e05'
    },
    boss_drone_queen: {
      id: 'boss_drone_queen',
      dim: 'wasteland',
      baseName: 'THE HOLLOW DRONE QUEEN',
      x: 4800, y: 800, width: 44, height: 48,
      baseHp: 850, speed: 3.2,
      coat: '#0c4a6e', visor: '#00f0ff', pants: '#082f49'
    },
    boss_furnace_warden: {
      id: 'boss_furnace_warden',
      dim: 'wasteland',
      baseName: 'VULCAN-808 // FURNACE OVERLORD',
      x: 950, y: 4020, width: 44, height: 52,
      baseHp: 1150, speed: 3.1,
      coat: '#431407', visor: '#f97316', pants: '#1c1917'
    },
    boss_drain_leviathan: {
      id: 'boss_drain_leviathan',
      dim: 'wasteland',
      baseName: 'SUB-ZERO // THE DRAIN EXECUTIONER',
      x: 2220, y: 4240, width: 42, height: 50,
      baseHp: 1050, speed: 3.6,
      coat: '#134e4a', visor: '#00f0ff', pants: '#042f2e'
    },
    boss_signal_archon: {
      id: 'boss_signal_archon',
      dim: 'wasteland',
      baseName: 'ARCHON VEX // APEX SIGNAL SOVEREIGN',
      x: 5550, y: 3800, width: 44, height: 54,
      baseHp: 1450, speed: 3.5,
      coat: '#090b10', visor: '#f43f5e', pants: '#1e1b4b'
    },
    boss_astral_architect: {
      id: 'boss_astral_architect',
      dim: 'horizon',
      baseName: 'OMEGA-777 // THE ASTRAL ARCHITECT',
      x: 1800, y: 480, width: 46, height: 56,
      baseHp: 2000, speed: 3.7,
      coat: '#312e81', visor: '#facc15', pants: '#09090b'
    }
  },

  bossRespawnTimers: {},

  // Dossier Section 2: Enemy NPC Scaling (+3.75% HP & damage per level, 0% speed scaling)
  getEnemyLevelScaleMult() {
    if (window.State && typeof State.getEnemyScaleMultiplier === 'function') {
      return State.getEnemyScaleMultiplier();
    }
    const lvl = (window.State && State.userProfile && State.userProfile.level) ? State.userProfile.level : 1;
    return 1 + Math.max(0, lvl - 1) * 0.0375;
  },

  // Returns how many times a specific World Boss has been defeated
  getBossKillCount(bossId) {
    if (!window.State || !State.userProfile) return 0;
    if (!State.userProfile.bossKillCounts || typeof State.userProfile.bossKillCounts !== 'object') {
      State.userProfile.bossKillCounts = {};
    }
    if (typeof State.userProfile.bossKillCounts[bossId] === 'number') {
      return State.userProfile.bossKillCounts[bossId];
    }
    if (Array.isArray(State.userProfile.bossesDefeated) && State.userProfile.bossesDefeated.includes(bossId)) {
      State.userProfile.bossKillCounts[bossId] = 1;
      return 1;
    }
    return 0;
  },

  friendlyNpcs: {
    underground: [
      { id: 'u_mech', x: 360, y: 260, width: 26, height: 38, name: 'HYPE MECHANIC', role: 'STREET CREW', coat: '#10b981', visor: '#facc15', pants: '#064e3b', icon: '🔧', dialogue: "The trunk pop truck is unlocked in Bay 1. Grab code LOWLIFEWORLD15 for 15% off official merch." },
      { id: 'u_tech', x: 1600, y: 150, width: 26, height: 38, name: 'ARCADE TECH', role: 'NEO-GEO REPAIR', coat: '#0284c7', visor: '#00f0ff', pants: '#0c4a6e', icon: '🕹️', dialogue: "We keep these cabinets calibrated. Grid Runner's purple drone predicts your turns—steer early!" },
      { id: 'u_eng', x: 1050, y: 150, width: 26, height: 38, name: 'AUDIO ENGINEER', role: 'STUDIO MASTER', coat: '#ca8a04', visor: '#fef08a', pants: '#713f12', icon: '🎛️', dialogue: "The low-end sub on 'DANCING' is summed to pure mono below 100 Hz for massive club systems and earbuds alike." },
      { id: 'u_drifter1', x: 250, y: 650, width: 26, height: 38, name: 'GARAGE DRIFTER', role: 'OUTLAW', coat: '#475569', visor: '#38bdf8', pants: '#1e293b', icon: '🕶️', dialogue: "The night shift underground is the only place immune to the syndicate signal." },
      { id: 'u_drifter2', x: 1900, y: 750, width: 26, height: 38, name: 'SUBWAY RUNNER', role: 'COURIER', coat: '#7c3aed', visor: '#e879f9', pants: '#4c1d95', icon: '👟', dialogue: "I deliver cassettes across dimensions. Check The Furnace, The Drain, Echo Cavern, and the Apex Citadel in the Wasteland for new boss bounties!" },
      { id: 'u_sentry', x: 2150, y: 840, width: 26, height: 38, name: 'RIFT SENTRY', role: 'GATE WATCHER', coat: '#dc2626', visor: '#ff003c', pants: '#7f1d1d', icon: '🛡️', dialogue: "Beyond this warp lies District 84 Retrocade. Keep your tokens ready." }
    ],
    retrocade: [
      { id: 'r_dj', x: 1180, y: 180, width: 30, height: 40, name: 'DJ LOWLIFE', role: 'RESIDENT RECORD CUTTER', coat: '#701a75', visor: '#f472b6', pants: '#4a044e', icon: '🎧', dialogue: "Broadcast live! Groove on beat on the dance floor to extract sound tokens, or tip 25 tokens in the Store for 3 minutes of Overdrive!" },
      { id: 'r_bartender', x: 480, y: 180, width: 26, height: 38, name: 'BAR MASTER', role: 'LOUNGE HOST', coat: '#0f766e', visor: '#2dd4bf', pants: '#134e4a', icon: '🍸', dialogue: "Welcome to Nirvana Lounge. Check the interactive Music Kiosk on the north wall." },
      { id: 'r_curator', x: 230, y: 220, width: 26, height: 38, name: 'KIOSK CURATOR', role: 'CATALOG ARCHIVIST', coat: '#c2410c', visor: '#fed7aa', pants: '#7c2d12', icon: '💿', dialogue: "Here you can audition original, sped-up, and slowed cuts of the single." },
      { id: 'r_croupier', x: 2020, y: 180, width: 26, height: 38, name: 'HIGH-ROLLER CROUPIER', role: 'VIP DEALER', coat: '#a16207', visor: '#fef08a', pants: '#713f12', icon: '🎰', dialogue: "The 5-lane slots on the right are for serious players: 25 tokens per roll with massive multiplier yields." },
      { id: 'd1', x: 1040, y: 460, width: 26, height: 38, name: 'NEON GROOVER', role: 'CLUBBER', coat: '#06b6d4', visor: '#ec4899', pants: '#0891b2', icon: '💃', dancePhase: 0, dialogue: "The bassline in this place is unmatched." },
      { id: 'd2', x: 1120, y: 520, width: 26, height: 38, name: 'CYBER VIP', role: 'CLUBBER', coat: '#8b5cf6', visor: '#a855f7', pants: '#5b21b6', icon: '🕺', dancePhase: 1, dialogue: "District 84 is the peak of the Retrocade era." },
      { id: 'd3', x: 1200, y: 470, width: 26, height: 38, name: 'GLOW RUNNER', role: 'CLUBBER', coat: '#f43f5e', visor: '#00f0ff', pants: '#be123c', icon: '💃', dancePhase: 2, dialogue: "Watch your step around the DJ booth barrier wall." },
      { id: 'd4', x: 1280, y: 530, width: 26, height: 38, name: 'SYNTH KID', role: 'CLUBBER', coat: '#eab308', visor: '#ffffff', pants: '#854d0e', icon: '🕺', dancePhase: 3, dialogue: "The floor lights sync to the tempo index." },
      { id: 'd5', x: 1080, y: 620, width: 26, height: 38, name: 'ACID RAIDER', role: 'CLUBBER', coat: '#10b981', visor: '#facc15', pants: '#047857', icon: '💃', dancePhase: 4, dialogue: "Keep moving and racking up tokens." },
      { id: 'd6', x: 1240, y: 620, width: 26, height: 38, name: 'CHIP DRIFTER', role: 'CLUBBER', coat: '#ec4899', visor: '#00f0ff', pants: '#9d174d', icon: '🕺', dancePhase: 5, dialogue: "Hit the casino room on the east wing when you're done dancing." },
      { id: 'd7', x: 1160, y: 680, width: 26, height: 38, name: 'SHADOW VIP', role: 'CLUBBER', coat: '#64748b', visor: '#38bdf8', pants: '#334155', icon: '💃', dancePhase: 6, dialogue: "Lowlife forever." },
      { id: 'd8', x: 1320, y: 670, width: 26, height: 38, name: 'VAPOR ENFORCER', role: 'CLUBBER', coat: '#d946ef', visor: '#fdf4ff', pants: '#86198f', icon: '🕺', dancePhase: 7, dialogue: "Enjoy the rhythm while the rifts are stable." }
    ],
    wasteland: [
      { id: 'w_conner', x: 2260, y: 2890, width: 28, height: 40, name: 'CONNER CADE', role: 'BONFIRE HOST & PRODUCER', coat: '#9a3412', visor: '#fb923c', pants: '#431407', icon: '🔥', dialogue: "Welcome to the bonfire. Pull up a seat. Out here in the Corruption, you need a safe circle to test raw mixes and build real ideas. The enforcers won't cross this perimeter." },
      { id: 'w_visualist', x: 2340, y: 2880, width: 26, height: 38, name: 'MKE DIRECTOR', role: 'CINEMATOGRAPHER', coat: '#1e293b', visor: '#38bdf8', pants: '#0f172a', icon: '🎥', dialogue: "The lighting on this short film had to be grim—tube lights, handheld smoke, and rain. Check the mirror in the washroom down south if you want to see the mask come off." },
      { id: 'w_producer', x: 2310, y: 2950, width: 26, height: 38, name: 'CREATIVE HOMIE', role: 'BEATSMITH', coat: '#15803d', visor: '#86efac', pants: '#14532d', icon: '🎹', dialogue: "Six World Bosses now rule the Wasteland: Blade-Zero in the Holding Chamber, Chem-Enforcer at Silo 07, Drone Queen in Obsidian Canyon, Vulcan-808 in The Furnace, Sub-Zero in The Drain, and Archon Vex in the Apex Signal Citadel!" },
      { id: 'w_medic', x: 1920, y: 520, width: 26, height: 38, name: 'BIO-MEDIC VERA', role: 'RUST SANCTUARY CLINIC', coat: '#0f766e', visor: '#4ade80', pants: '#042f2e', icon: '🩺', dialogue: "The Rust Sanctuary is neutral ground. Step up to the Bio-Pod terminal to patch up your neural frame, or rest inside these walls where syndicate patrols cannot aggro." },
      { id: 'w_quartermaster', x: 2240, y: 520, width: 26, height: 38, name: 'QUARTERMASTER KNOX', role: 'SANCTUARY ARMORER', coat: '#78350f', visor: '#facc15', pants: '#292524', icon: '🛡️', dialogue: "South of Martian University lies the submerged Deep Void Data Vault. You'll need a charged [K] Devastating Breaker or Charged Plasma shot to crack its 220-HP airlock seal." }
    ],
    horizon: [
      { id: 'h_archivist', x: 1620, y: 1920, width: 28, height: 40, name: 'SERAPH-01', role: 'HORIZON GATEKEEPER', coat: '#312e81', visor: '#00f0ff', pants: '#1e1b4b', icon: '🌌', dialogue: "You collected all 50 Battle Cassettes and breached the Extraction Rift. Welcome to Chapter III: The Horizon. Ahead lies the Astral Sovereign Keep and Omega-777." },
      { id: 'h_engineer', x: 640, y: 1080, width: 26, height: 38, name: 'ASTRAL ENGINEER', role: 'ZERO-G ACOUSTICS', coat: '#701a75', visor: '#f472b6', pants: '#4a044e', icon: '🎛️', dialogue: "In the Zero-G Mastering Sanctum, audio waves travel without atmospheric distortion. Tap the console to trigger full Astral Resonance before challenging Omega-777." }
    ]
  },

  hostileNpcs: [],
  trainingDummies: [],
  lootPickups: [],

  // Strategic Garrison Hotspots so every castle, dungeon, cave & ruin has active guards
  WASTELAND_GARRISON_HOTSPOTS: [
    // The Furnace Foundry (SW Dungeon)
    { x: 650, y: 3320, tier: 'mid' }, { x: 1220, y: 3420, tier: 'regular' }, { x: 720, y: 4050, tier: 'mid' }, { x: 1320, y: 3980, tier: 'regular' },
    // Undercity Transit Core "The Drain" (S-Central Subway Dungeon)
    { x: 2050, y: 3620, tier: 'regular' }, { x: 2380, y: 3900, tier: 'mid' }, { x: 2020, y: 4180, tier: 'mid' },
    // Deep Void Data Vault & Martian University (Central)
    { x: 3340, y: 1750, tier: 'mid' }, { x: 2880, y: 1550, tier: 'regular' }, { x: 2400, y: 1850, tier: 'regular' },
    // Echo Cavern & Crystal Grotto (East Cave Network)
    { x: 4950, y: 1850, tier: 'regular' }, { x: 5400, y: 1780, tier: 'mid' }, { x: 5420, y: 2420, tier: 'regular' }, { x: 5820, y: 2280, tier: 'mid' },
    // Apex Signal Array & Syndicate Citadel (SE Castle Fortress)
    { x: 4750, y: 3550, tier: 'mid' }, { x: 4950, y: 3950, tier: 'regular' }, { x: 5420, y: 3340, tier: 'mid' }, { x: 5780, y: 4240, tier: 'mid' },
    // Obsidian Canyon & Northern Badlands (NE)
    { x: 4550, y: 720, tier: 'regular' }, { x: 5250, y: 880, tier: 'mid' }, { x: 3550, y: 580, tier: 'regular' },
    // Substance Silo 07 & Highway Overpass (West)
    { x: 1450, y: 1650, tier: 'regular' }, { x: 680, y: 2050, tier: 'mid' }, { x: 1350, y: 2680, tier: 'regular' },
    // Holding Chamber & Southern Badlands
    { x: 3050, y: 3580, tier: 'regular' }, { x: 3520, y: 4560, tier: 'mid' }, { x: 4220, y: 3650, tier: 'regular' }
  ],

  init() {
    if (window.State && State.userProfile) {
      if (!State.userProfile.bossKillCounts || typeof State.userProfile.bossKillCounts !== 'object') {
        State.userProfile.bossKillCounts = {};
      }
      if (State.userProfile.lastPosition) {
        this.player.x = State.userProfile.lastPosition.x || 350;
        this.player.y = State.userProfile.lastPosition.y || 750;
      }
      if (State.userProfile.lastDimension) {
        State.currentDimension = State.userProfile.lastDimension;
        const cfg = State.DIMENSIONS ? State.DIMENSIONS[State.currentDimension] : null;
        const badge = document.getElementById('dimensionBadge');
        if (badge && cfg) badge.innerText = `DIMENSION: ${cfg.name}`;
      }
      if (typeof State.getPlayerMaxHp === 'function') {
        this.player.maxHp = State.getPlayerMaxHp();
        this.player.hp = this.player.maxHp;
      }
    }

    if (window.Dimensions && window.State && State.userProfile && Array.isArray(State.userProfile.chestsOpened)) {
      if (Dimensions.wastelandChests) {
        Dimensions.wastelandChests.forEach(c => {
          if (State.userProfile.chestsOpened.includes(c.id)) c.opened = true;
        });
      }
      if (Dimensions.horizonChests) {
        Dimensions.horizonChests.forEach(c => {
          if (State.userProfile.chestsOpened.includes(c.id)) c.opened = true;
        });
      }
    }

    this.trainingDummies = [
      {
        id: 'u_dummy',
        x: 480, y: 220, width: 28, height: 42,
        name: 'HOLOGRAM TARGET DUMMY',
        hp: 99999, maxHp: 99999,
        alive: true,
        coat: '#38bdf8', visor: '#00f0ff', pants: '#0369a1'
      }
    ];

    this.updatePlayerHealthUI();
    this.spawnWastelandBosses();
    this.spawnGarrisonHotspots();

    for (let i = 0; i < 16; i++) {
      this.spawnWastelandCombatant(true, 'wasteland');
    }
    for (let i = 0; i < 8; i++) {
      this.spawnWastelandCombatant(true, 'horizon');
    }
    setInterval(() => {
      this.spawnWastelandCombatant(false, 'wasteland');
      this.spawnWastelandCombatant(false, 'horizon');
    }, 9000);
  },

  // Spawns or Respawns a single World Boss scaled by Player Level AND Prior Defeat Count
  spawnSingleBoss(bossId, isRespawn = false) {
    const t = this.BOSS_TEMPLATES[bossId];
    if (!t) return;

    this.hostileNpcs = this.hostileNpcs.filter(n => n.id !== bossId);

    const kills = this.getBossKillCount(bossId);
    const playerLevelScale = this.getEnemyLevelScaleMult();

    // Bosses gain +45% compounding Max HP and +25% attack damage per prior defeat
    const bossKillHpMult = Math.pow(1.45, kills);
    const bossKillDmgMult = 1 + (kills * 0.25);

    const scaledHp = Math.round(t.baseHp * playerLevelScale * bossKillHpMult);
    const markSuffix = kills > 0 ? ` [MK ${kills + 1}]` : '';

    this.hostileNpcs.push({
      id: t.id,
      dim: t.dim || 'wasteland',
      tier: 'boss',
      name: `${t.baseName}${markSuffix}`,
      x: t.x, y: t.y, width: t.width, height: t.height,
      hp: scaledHp, maxHp: scaledHp, speed: t.speed,
      dmgMult: bossKillDmgMult,
      killTier: kills,
      alive: true, state: 'peaceful', aggroTimer: 0, attackCooldown: 0,
      knockbackVx: 0, knockbackVy: 0,
      coat: t.coat, visor: t.visor, pants: t.pants
    });

    if (isRespawn && window.State && State.currentDimension === (t.dim || 'wasteland')) {
      State.showToast(`⚠️ SYNDICATE REINFORCEMENT: ${t.baseName}${markSuffix} HAS RESPAWNED!`);
    }
  },

  spawnWastelandBosses() {
    this.hostileNpcs = this.hostileNpcs.filter(n => n.tier !== 'boss');
    Object.keys(this.BOSS_TEMPLATES).forEach(bossId => {
      this.spawnSingleBoss(bossId, false);
    });
  },

  scheduleBossRespawn(bossId) {
    if (this.bossRespawnTimers[bossId]) {
      clearTimeout(this.bossRespawnTimers[bossId]);
    }
    this.bossRespawnTimers[bossId] = setTimeout(() => {
      delete this.bossRespawnTimers[bossId];
      this.spawnSingleBoss(bossId, true);
    }, 45000);
  },

  createCombatantObject(spawnX, spawnY, isMidTier, dim = 'wasteland') {
    const scale = this.getEnemyLevelScaleMult();
    if (isMidTier) {
      const midTypes = [
        { type: 'chem_brute', name: 'CHEM BRUTE', coat: '#4d7c0f', visor: '#a3e635', pants: '#14532d', hp: 260, speed: 2.6 },
        { type: 'heavy_enforcer', name: 'SYNDICATE HEAVY', coat: '#1e293b', visor: '#f97316', pants: '#0f172a', hp: 320, speed: 2.4 },
        { type: 'phase_stalker', name: 'PHASE STALKER', coat: '#4c1d95', visor: '#c084fc', pants: '#2e1065', hp: 220, speed: 3.4 },
        { type: 'furnace_hellion', name: 'FURNACE PYRO-GUARD', coat: '#7c2d12', visor: '#facc15', pants: '#431407', hp: 290, speed: 2.8 },
        { type: 'citadel_templar', name: 'CITADEL SENTINEL', coat: '#31102f', visor: '#ff003c', pants: '#090b10', hp: 340, speed: 2.7 }
      ];
      const template = midTypes[Math.floor(Math.random() * midTypes.length)];
      const scaledHp = Math.round(template.hp * scale);
      return {
        id: Math.random().toString(36).substr(2, 9), dim, tier: 'mid', name: template.name, type: template.type,
        x: spawnX, y: spawnY, width: 32, height: 44, hp: scaledHp, maxHp: scaledHp, speed: template.speed,
        coat: template.coat, visor: template.visor, pants: template.pants,
        alive: true, state: 'peaceful', aggroTimer: 0, attackCooldown: 0, knockbackVx: 0, knockbackVy: 0,
        dir: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)], moveTimer: 30 + Math.floor(Math.random() * 40)
      };
    } else {
      const regTypes = [
        { type: 'scout_drone', name: 'SCOUT DRONE', coat: '#0284c7', visor: '#38bdf8', pants: '#0369a1', hp: 60, speed: 2.5 },
        { type: 'scavenger', name: 'SCAVENGER', coat: '#78350f', visor: '#fbbf24', pants: '#451a03', hp: 90, speed: 3.0 },
        { type: 'patrol', name: 'OUTPOST PATROL', coat: '#334155', visor: '#ff003c', pants: '#1e293b', hp: 80, speed: 2.8 },
        { type: 'cave_crawler', name: 'CAVERN STALKER', coat: '#134e4a', visor: '#2dd4bf', pants: '#042f2e', hp: 95, speed: 3.1 },
        { type: 'drain_runner', name: 'DRAIN CONTRABANDIST', coat: '#3b0764', visor: '#e879f9', pants: '#1e1b4b', hp: 85, speed: 3.2 }
      ];
      const template = regTypes[Math.floor(Math.random() * regTypes.length)];
      const scaledHp = Math.round(template.hp * scale);
      return {
        id: Math.random().toString(36).substr(2, 9), dim, tier: 'regular', name: template.name, type: template.type,
        x: spawnX, y: spawnY, width: 24, height: 36, hp: scaledHp, maxHp: scaledHp, speed: template.speed,
        coat: template.coat, visor: template.visor, pants: template.pants,
        alive: true, state: 'peaceful', aggroTimer: 0, attackCooldown: 0, knockbackVx: 0, knockbackVy: 0,
        dir: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)], moveTimer: 25 + Math.floor(Math.random() * 45)
      };
    }
  },

  spawnGarrisonHotspots() {
    this.WASTELAND_GARRISON_HOTSPOTS.forEach(spot => {
      this.hostileNpcs.push(this.createCombatantObject(spot.x, spot.y, spot.tier === 'mid', 'wasteland'));
    });
  },

  isPointInSafeZone(x, y, dim = 'wasteland') {
    if (dim !== 'wasteland') return false;
    // Conner Cade's Bonfire (Radius 180 around 2300, 2900)
    if (Math.hypot(x - 2300, y - 2900) < 180) return true;
    // The Rust Sanctuary (X: 1650..2550, Y: 260..820)
    if (x >= 1660 && x <= 2540 && y >= 270 && y <= 810) return true;
    return false;
  },

  spawnWastelandCombatant(force = false, targetDim = 'wasteland') {
    if (!force && (!window.State || State.currentDimension !== targetDim)) return;

    const maxCap = targetDim === 'horizon' ? 12 : 44;
    const livingRegularAndMid = this.hostileNpcs.filter(n => n.alive && n.tier !== 'boss' && (n.dim || 'wasteland') === targetDim);
    if (livingRegularAndMid.length >= maxCap) return;

    const p = this.player;
    const obstacles = targetDim === 'horizon'
      ? ((window.Dimensions && Dimensions.horizonObstacles) ? Dimensions.horizonObstacles : [])
      : ((window.Dimensions && Dimensions.worldObstacles) ? Dimensions.worldObstacles : []);

    const mapW = targetDim === 'horizon' ? 3600 : 6400;
    const mapH = targetDim === 'horizon' ? 2400 : 4800;

    let spawnX = 0, spawnY = 0;
    let validSpawn = false;
    let attempts = 0;

    while (!validSpawn && attempts < 25) {
      spawnX = 250 + Math.random() * (mapW - 500);
      spawnY = 250 + Math.random() * (mapH - 500);

      const distToPlayer = (window.State && State.currentDimension === targetDim) ? Math.hypot(spawnX - p.x, spawnY - p.y) : 9999;
      const inSafeZone = this.isPointInSafeZone(spawnX, spawnY, targetDim);
      const testBox = { x: spawnX - 10, y: spawnY - 10, width: 52, height: 64 };

      let insideWall = false;
      for (let o of obstacles) {
        if (
          testBox.x < o.x + o.width &&
          testBox.x + testBox.width > o.x &&
          testBox.y < o.y + o.height &&
          testBox.y + testBox.height > o.y
        ) {
          insideWall = true;
          break;
        }
      }

      if (distToPlayer > 520 && !inSafeZone && !insideWall) {
        validSpawn = true;
      }
      attempts++;
    }

    if (!validSpawn) return;

    const isMidTier = Math.random() < 0.42;
    this.hostileNpcs.push(this.createCombatantObject(spawnX, spawnY, isMidTier, targetDim));
  },

  damageNpc(npc, amount, knockDir) {
    if (!npc.alive) return;
    npc.hp -= amount;
    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
    npc.state = 'aggro';
    npc.aggroTimer = 350;

    const force = npc.tier === 'boss' ? 2.5 : npc.tier === 'mid' ? 5 : 8;
    if (knockDir === 'up') npc.knockbackVy = -force;
    else if (knockDir === 'down') npc.knockbackVy = force;
    else if (knockDir === 'left') npc.knockbackVx = -force;
    else if (knockDir === 'right') npc.knockbackVx = force;

    if (npc.hp <= 0 && npc.hp !== 99999) {
      npc.alive = false;

      if (npc.tier === 'boss' && window.State) {
        State.userProfile.bossesDefeated = State.userProfile.bossesDefeated || [];
        State.userProfile.bossKillCounts = State.userProfile.bossKillCounts || {};

        const prevKills = this.getBossKillCount(npc.id);
        const isFirstKill = prevKills === 0 && !State.userProfile.bossesDefeated.includes(npc.id);

        if (!State.userProfile.bossesDefeated.includes(npc.id)) {
          State.userProfile.bossesDefeated.push(npc.id);
        }
        State.userProfile.bossKillCounts[npc.id] = prevKills + 1;

        this.spawnLoot(npc.x + npc.width / 2, npc.y + npc.height / 2, 'boss', npc.id, isFirstKill, prevKills);

        const bossXpReward = 500 + (prevKills * 250);
        if (typeof State.addXp === 'function') {
          State.addXp(bossXpReward, `${npc.name} DEFEATED`);
        }

        if (isFirstKill) {
          if (npc.id === 'boss_blade_zero') {
            State.unlockVipStem();
          } else if (npc.id === 'boss_chem_enforcer') {
            State.unlockRelic('relic_tape_saturator');
          } else if (npc.id === 'boss_drone_queen') {
            State.unlockRelic('relic_gross_beat');
          } else if (npc.id === 'boss_furnace_warden') {
            State.unlockRelic('relic_sub_woofer');
          } else if (npc.id === 'boss_signal_archon') {
            State.unlockRelic('relic_peak_controller');
          }
          State.showToast(`BOSS VANQUISHED: ${npc.name} (+${bossXpReward} XP & FIRST-KILL LOOT)! 🏆`);
        } else {
          State.showToast(`${npc.name} VANQUISHED (+${bossXpReward} XP & BONUS BOUNTY)! REINFORCING IN 45S... 🔥`);
        }

        State.triggerScreenShake(20, 35);
        State.save();

        this.scheduleBossRespawn(npc.id);
      } else {
        this.spawnLoot(npc.x + npc.width / 2, npc.y + npc.height / 2, npc.tier, npc.id, false, 0);
        if (window.State && typeof State.addXp === 'function') {
          const xpReward = npc.tier === 'mid' ? 65 : 20;
          State.addXp(xpReward, `${npc.name} ELIMINATED`);
        }
      }
    }
  },

  spawnLoot(lx, ly, tier, bossId, isFirstKill = true, prevKills = 0) {
    const styleMult = (window.Combat && typeof Combat.getStyleTokenMultiplier === 'function')
      ? Combat.getStyleTokenMultiplier()
      : 1.0;
    const baseTokenCount = tier === 'boss' ? (25 + prevKills * 10) : (tier === 'mid' ? 8 : 3);
    const tokenCount = Math.round(baseTokenCount * styleMult);
    for (let i = 0; i < tokenCount; i++) {
      this.lootPickups.push({
        x: lx + (Math.random() * 44 - 22),
        y: ly + (Math.random() * 44 - 22),
        type: 'coin',
        value: 5,
        radius: 6,
        floatOffset: Math.random() * Math.PI * 2
      });
    }

    if (tier === 'mid' && Math.random() < 0.40) {
      this.lootPickups.push({ x: lx, y: ly, type: 'amber_vial', radius: 8, floatOffset: Math.random() * Math.PI * 2 });
    }

    if (tier === 'boss') {
      if (isFirstKill) {
        for (let t = 0; t < 6; t++) {
          this.lootPickups.push({ x: lx + (Math.random() * 50 - 25), y: ly + (Math.random() * 50 - 25), type: 'rare_tape', radius: 9, floatOffset: Math.random() * Math.PI * 2 });
        }
        this.lootPickups.push({ x: lx + 15, y: ly, type: 'amber_vial', radius: 8, floatOffset: Math.random() * Math.PI * 2 });
        this.lootPickups.push({ x: lx - 15, y: ly, type: 'amber_vial', radius: 8, floatOffset: Math.random() * Math.PI * 2 });

        if (window.State) {
          if (bossId === 'boss_blade_zero') State.unlockSkin('blade_zero');
          else if (bossId === 'boss_chem_enforcer') State.unlockSkin('chem_enforcer');
          else if (bossId === 'boss_drone_queen') State.unlockSkin('drone_whisperer');
          else if (bossId === 'boss_furnace_warden') State.unlockSkin('reese_bass_juggernaut');
          else if (bossId === 'boss_drain_leviathan') State.unlockSkin('trenchcoat_executioner');
          else if (bossId === 'boss_signal_archon') State.unlockSkin('omega_enforcer');
          else if (bossId === 'boss_astral_architect') State.unlockSkin('the_creator');
        }
      } else {
        // Repeat boss kills also drop 2 Battle Cassettes so players can farm toward 50
        for (let t = 0; t < 2; t++) {
          this.lootPickups.push({ x: lx + (Math.random() * 30 - 15), y: ly + (Math.random() * 30 - 15), type: 'rare_tape', radius: 9, floatOffset: Math.random() * Math.PI * 2 });
        }
      }
    } else if (tier === 'mid') {
      if (Math.random() < 0.65) this.lootPickups.push({ x: lx, y: ly, type: 'rare_tape', radius: 9, floatOffset: Math.random() * Math.PI * 2 });
    } else if (Math.random() < 0.25) {
      this.lootPickups.push({ x: lx, y: ly, type: 'rare_tape', radius: 9, floatOffset: Math.random() * Math.PI * 2 });
    }
  },

  openChest(c) {
    c.opened = true;
    if (window.State) {
      State.userProfile.chestsOpened = State.userProfile.chestsOpened || [];
      if (!State.userProfile.chestsOpened.includes(c.id)) {
        State.userProfile.chestsOpened.push(c.id);
      }
    }
    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
    if (window.State) State.triggerScreenShake(6, 12);

    if (c.type === 'supply' && window.State) {
      State.addTokens(35); State.addRareTape();
      if (typeof State.addXp === 'function') State.addXp(35, "SUPPLY CRATE");
      State.showToast("SUPPLY CRATE: +35 TOKENS, +35 XP & +1 RARE CASSETTE! 📦");
    } else if (c.type === 'biohazard' && window.State) {
      State.addTokens(75); State.addRareTape(); State.addRareTape();
      State.userProfile.amberVials = (State.userProfile.amberVials || 0) + 1;
      this.player.hp = this.player.maxHp;
      this.updatePlayerHealthUI();
      if (typeof State.addXp === 'function') State.addXp(50, "HAZMAT CACHE");
      State.showToast("HAZMAT CACHE: +75 TOKENS, +50 XP, FULL HEAL & +1 AMBER VIAL! 🧪");
    } else if (c.type === 'vault' && window.State) {
      State.addTokens(150); State.addRareTape(); State.addRareTape(); State.addRareTape();
      if (c.relicReward) {
        State.unlockRelic(c.relicReward);
      }
      State.unlockSkin(c.skinReward || 'drifter');
      if (typeof State.addXp === 'function') State.addXp(85, "VAULT BREACH");
      State.showToast(`VAULT UNLOCKED: +150 TOKENS, +85 XP, +3 TAPES & EXCLUSIVE GEAR! 💎🎛️`);
    } else if (c.type === 'master_holding' && window.State) {
      State.addTokens(300);
      for (let i = 0; i < 10; i++) State.addRareTape();
      State.unlockRelic('relic_sub_woofer');
      State.unlockSkin(c.skinReward || 'static_nightmare');
      if (typeof State.addXp === 'function') State.addXp(120, "MASTER VAULT BREACH");
      State.showToast("GOLDEN MASTER VAULT: +300 TOKENS, +120 XP, +10 TAPES & MYTHIC LOOT! 💿⚡");
    }
    if (window.State) State.save();
  },

  damagePlayer(amount, knockDir) {
    const p = this.player;
    if (p.iFrames > 0) return;

    const hasPeakController = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_peak_controller'));
    const finalDamage = hasPeakController ? Math.max(1, Math.round(amount * 0.80)) : amount;

    p.hp = Math.max(0, p.hp - finalDamage);
    p.iFrames = 30;
    if (window.Combat && typeof Combat.onPlayerDamaged === 'function') Combat.onPlayerDamaged();
    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
    if (window.State) State.triggerScreenShake(8, 14);

    const force = hasPeakController ? 8 : 11;
    if (knockDir === 'up') p.knockbackVy = -force;
    else if (knockDir === 'down') p.knockbackVy = force;
    else if (knockDir === 'left') p.knockbackVx = -force;
    else if (knockDir === 'right') p.knockbackVx = force;

    this.updatePlayerHealthUI();

    if (p.hp <= 0 && window.State) {
      State.showToast("NEURAL LINK CRITICAL // RESPAWNING...");
      setTimeout(() => {
        const cfg = State.DIMENSIONS && State.DIMENSIONS[State.currentDimension];
        p.x = (cfg && cfg.defaultSpawn) ? cfg.defaultSpawn.x : 350;
        p.y = (cfg && cfg.defaultSpawn) ? cfg.defaultSpawn.y : 750;
        p.hp = p.maxHp;
        this.updatePlayerHealthUI();
        State.save();
      }, 1000);
    }
  },

  updatePlayerHealthUI() {
    const bar = document.getElementById('playerHpBar');
    const text = document.getElementById('playerHpText');
    if (bar && text) {
      const pct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
      bar.style.width = `${pct}%`;
      text.innerText = `${this.player.hp}/${this.player.maxHp}`;
    }
  },

  update() {
    const p = this.player;
    if (p.iFrames > 0) p.iFrames--;
    if (this.trainingDummies) {
      this.trainingDummies.forEach(td => {
        if (td.hitFlash > 0) td.hitFlash--;
      });
    }

    if (window.State && State.userProfile) {
      if (State.userProfile.hyperchargeTimer > 0) State.userProfile.hyperchargeTimer--;
      if (State.userProfile.djOverdriveTimer > 0) State.userProfile.djOverdriveTimer--;
    }

    // Passive Bio-Regen inside Safe Zones (Conner Cade Bonfire & The Rust Sanctuary)
    if (window.State && this.isPointInSafeZone(p.x, p.y, State.currentDimension)) {
      p.safeZoneRegenTimer = (p.safeZoneRegenTimer || 0) + 1;
      if (p.safeZoneRegenTimer % 45 === 0 && p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + 2);
        this.updatePlayerHealthUI();
      }
    }

    const activeObs = (window.Dimensions && typeof Dimensions.getActiveObstacles === 'function') 
      ? Dimensions.getActiveObstacles() 
      : [];

    if (Math.abs(p.knockbackVx) > 0.05 || Math.abs(p.knockbackVy) > 0.05) {
      const testBoxX = { x: p.x + p.knockbackVx, y: p.y, width: p.width, height: p.height };
      let hitWallX = false;
      for (let o of activeObs) {
        if (window.Combat && Combat.checkCollision(testBoxX, o)) { hitWallX = true; break; }
      }
      if (hitWallX) {
        p.knockbackVx = -p.knockbackVx * 0.45;
        if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
      } else {
        p.x += p.knockbackVx;
      }

      const testBoxY = { x: p.x, y: p.y + p.knockbackVy, width: p.width, height: p.height };
      let hitWallY = false;
      for (let o of activeObs) {
        if (window.Combat && Combat.checkCollision(testBoxY, o)) { hitWallY = true; break; }
      }
      if (hitWallY) {
        p.knockbackVy = -p.knockbackVy * 0.45;
        if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('stomp');
      } else {
        p.y += p.knockbackVy;
      }

      p.knockbackVx *= 0.84;
      p.knockbackVy *= 0.84;
    } else {
      const hasGrossBeat = (window.State && typeof State.hasRelicEquipped === 'function' && State.hasRelicEquipped('relic_gross_beat'));
      const hasDjOverdrive = (window.State && State.userProfile && State.userProfile.djOverdriveTimer > 0);
      const sprintRelicMult = hasGrossBeat ? 1.20 : 1.0;
      const overdriveMult = hasDjOverdrive ? 1.15 : 1.0;

      let currentSpeed = ((window.Input && Input.keys && Input.keys.shift) ? (p.sprintSpeed * sprintRelicMult) : p.baseSpeed) * overdriveMult;
      
      if (window.State && State.currentDimension === 'wasteland' && window.Dimensions && Dimensions.environmentalHazards) {
        Dimensions.environmentalHazards.forEach(h => {
          if (h.type === 'sludge' && p.x > h.x && p.x < h.x + h.width && p.y > h.y && p.y < h.y + h.height) {
            currentSpeed *= 0.55;
            if (Math.random() < 0.04) this.damagePlayer(1, 'down');
          }
        });
      }

      let dx = 0, dy = 0;
      if (window.Input && typeof Input.getMovementVector === 'function') {
        const vec = Input.getMovementVector();
        dx = vec.x;
        dy = vec.y;
      } else if (window.Input && Input.analogVector && Input.analogVector.active) {
        dx = Input.analogVector.x; 
        dy = Input.analogVector.y;
      } else if (window.Input && Input.keys) {
        if (Input.keys.up) dy -= 1;
        if (Input.keys.down) dy += 1;
        if (Input.keys.left) dx -= 1;
        if (Input.keys.right) dx += 1;
        if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
      }

      if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02) {
        p.isMoving = true;
        p.animTimer++;
        if (Math.abs(dx) > Math.abs(dy)) p.direction = dx > 0 ? 'right' : 'left';
        else p.direction = dy > 0 ? 'down' : 'up';

        const moveSpeed = currentSpeed * ((window.Input && Input.analogVector && Input.analogVector.active) ? Math.min(1, Math.hypot(dx, dy)) : 1);
        const newX = p.x + dx * moveSpeed;
        const newY = p.y + dy * moveSpeed;

        const boxX = { x: newX, y: p.y, width: p.width, height: p.height };
        const boxY = { x: p.x, y: newY, width: p.width, height: p.height };

        let colX = false, colY = false;
        for (let o of activeObs) {
          if (window.Combat && Combat.checkCollision(boxX, o)) colX = true;
          if (window.Combat && Combat.checkCollision(boxY, o)) colY = true;
        }

        if (window.State && State.currentDimension === 'wasteland' && window.Dimensions && Dimensions.destructibleDoors) {
          Dimensions.destructibleDoors.forEach(d => {
            if (!d.shattered) {
              if (window.Combat && Combat.checkCollision(boxX, d)) colX = true;
              if (window.Combat && Combat.checkCollision(boxY, d)) colY = true;
            }
          });
        }

        if (!colX) p.x = newX;
        if (!colY) p.y = newY;
      } else {
        p.isMoving = false;
      }
    }

    const cfg = (window.State && State.DIMENSIONS) ? State.DIMENSIONS[State.currentDimension] : null;
    if (cfg) {
      p.x = Math.max(10, Math.min(cfg.width - p.width - 10, p.x));
      p.y = Math.max(10, Math.min(cfg.height - p.height - 10, p.y));
    }

    if (window.State && State.currentDimension === 'retrocade' && p.x > 980 && p.x < 1400 && p.y > 420 && p.y < 740) {
      p.danceTimer++;
      if (p.danceTimer % 150 === 0) {
        const yieldTokens = (State.userProfile && State.userProfile.djOverdriveTimer > 0) ? 2 : 1;
        State.addTokens(yieldTokens);
        if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('coin');
        State.showToast(`DANCE FLOOR GROOVE: +${yieldTokens} TOKEN${yieldTokens > 1 ? 'S (2X OVERDRIVE)' : ''}! 💃`);
      }
    }

    this.updateHostileAI();
    this.updateLootPickups();
  },

  updateHostileAI() {
    if (!window.State || (State.currentDimension !== 'wasteland' && State.currentDimension !== 'horizon')) return;
    const activeDim = State.currentDimension;
    const p = this.player;
    const enemyDmgScale = this.getEnemyLevelScaleMult();

    const obstacles = (window.Dimensions && typeof Dimensions.getActiveObstacles === 'function') 
      ? Dimensions.getActiveObstacles() 
      : [];
    const doors = (activeDim === 'wasteland' && window.Dimensions && Dimensions.destructibleDoors) 
      ? Dimensions.destructibleDoors.filter(d => !d.shattered) 
      : [];

    const playerInSafeZone = this.isPointInSafeZone(p.x, p.y, activeDim);
    const maxBoundX = activeDim === 'horizon' ? 3540 : 6340;
    const maxBoundY = activeDim === 'horizon' ? 2340 : 4740;

    this.hostileNpcs.forEach(n => {
      if (!n.alive || (n.dim || 'wasteland') !== activeDim) return;
      if (n.hitFlash > 0) n.hitFlash--;
      const dist = Math.hypot(p.x - n.x, p.y - n.y);
      const aggroRange = n.tier === 'boss' ? 560 : n.tier === 'mid' ? 380 : 270;

      if (dist < aggroRange && n.state === 'peaceful' && !playerInSafeZone) {
        n.state = 'aggro';
        n.aggroTimer = 350;
      }

      if (playerInSafeZone && n.state === 'aggro') {
        n.state = 'peaceful';
      }

      if (Math.abs(n.knockbackVx) > 0.1 || Math.abs(n.knockbackVy) > 0.1) {
        const testX = { x: n.x + n.knockbackVx, y: n.y, width: n.width, height: n.height };
        let hitX = false;
        for (let o of obstacles) {
          if (window.Combat && Combat.checkCollision(testX, o)) { hitX = true; break; }
        }
        for (let d of doors) {
          if (window.Combat && Combat.checkCollision(testX, d)) { hitX = true; break; }
        }
        if (!hitX) n.x += n.knockbackVx;
        else n.knockbackVx = 0;

        const testY = { x: n.x, y: n.y + n.knockbackVy, width: n.width, height: n.height };
        let hitY = false;
        for (let o of obstacles) {
          if (window.Combat && Combat.checkCollision(testY, o)) { hitY = true; break; }
        }
        for (let d of doors) {
          if (window.Combat && Combat.checkCollision(testY, d)) { hitY = true; break; }
        }
        if (!hitY) n.y += n.knockbackVy;
        else n.knockbackVy = 0;

        n.knockbackVx *= 0.82; 
        n.knockbackVy *= 0.82;
        return;
      }

      if (n.attackCooldown > 0) n.attackCooldown--;
      if (n.specialCooldown === undefined) n.specialCooldown = 140;
      if (n.specialCooldown > 0) n.specialCooldown--;

      if (n.state === 'aggro' && !playerInSafeZone) {
        n.aggroTimer--;
        if (n.aggroTimer <= 0 && dist > 620) n.state = 'peaceful';

        const angle = Math.atan2(p.y - n.y, p.x - n.x);
        let vx = Math.cos(angle) * n.speed;
        let vy = Math.sin(angle) * n.speed;
        const bossMarkDmgMult = n.dmgMult || 1.0;

        if (n.tier === 'boss') {
          const scaledBossProjDmg = Math.round(24 * enemyDmgScale * bossMarkDmgMult);

          // Signature Boss Special Attacks (Telegraphed AoE / Spiral Nova / Shadow Lunge)
          if (dist < 440 && n.specialCooldown <= 0) {
            n.specialCooldown = 190;
            if (n.id === 'boss_drone_queen' && window.Combat && Combat.enemyProjectiles) {
              // 10-Way 360° Spiral EMP Nova
              if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('boss_warn');
              for (let k = 0; k < 10; k++) {
                const a = (Math.PI * 2 * k) / 10 + (Date.now() * 0.002);
                Combat.enemyProjectiles.push({
                  x: n.x + n.width / 2, y: n.y + n.height / 2,
                  vx: Math.cos(a) * 6.8, vy: Math.sin(a) * 6.8,
                  radius: 6, color: '#00f0ff', damage: scaledBossProjDmg, life: 75
                });
              }
            } else if (n.id === 'boss_blade_zero' && window.Combat && Combat.enemyProjectiles) {
              // Blood-Rave Shadow Lunge + 5-Blade Crimson Crescent Fan
              if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('dash');
              vx *= 3.2;
              vy *= 3.2;
              for (let s = -0.5; s <= 0.5; s += 0.25) {
                Combat.enemyProjectiles.push({
                  x: n.x + n.width / 2, y: n.y + n.height / 2,
                  vx: Math.cos(angle + s) * 9.2, vy: Math.sin(angle + s) * 9.2,
                  radius: 7, color: '#ff003c', damage: scaledBossProjDmg, life: 60
                });
              }
            } else if (window.Combat && typeof Combat.spawnBossTelegraph === 'function') {
              Combat.spawnBossTelegraph(n, p.x + p.width / 2, p.y + p.height / 2, scaledBossProjDmg);
            }
          }

          if (dist < 360 && n.attackCooldown <= 0) {
            n.attackCooldown = 52;
            if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('laser');
            for (let spread = -0.25; spread <= 0.25; spread += 0.25) {
              if (window.Combat && Combat.enemyProjectiles) {
                Combat.enemyProjectiles.push({
                  x: n.x + n.width / 2, y: n.y + n.height / 2,
                  vx: Math.cos(angle + spread) * 7.8, vy: Math.sin(angle + spread) * 7.8,
                  radius: 6, color: n.visor || '#ff003c', damage: scaledBossProjDmg, life: 65
                });
              }
            }
          }
        } else if (n.tier === 'mid') {
          if (dist < 270 && n.attackCooldown <= 0) {
            n.attackCooldown = 68;
            if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('laser');
            const scaledMidProjDmg = Math.round(18 * enemyDmgScale);
            if (window.Combat && Combat.enemyProjectiles) {
              Combat.enemyProjectiles.push({
                x: n.x + n.width / 2, y: n.y + n.height / 2,
                vx: Math.cos(angle) * 7, vy: Math.sin(angle) * 7,
                radius: 5, damage: scaledMidProjDmg, life: 55
              });
            }
          }
        }

        if (dist < 42 && n.attackCooldown <= 0) {
          n.attackCooldown = 48;
          if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('slash');
          const baseMeleeDmg = n.tier === 'boss' ? 28 : n.tier === 'mid' ? 19 : 12;
          const scaledMeleeDmg = Math.round(baseMeleeDmg * enemyDmgScale * bossMarkDmgMult);
          this.damagePlayer(scaledMeleeDmg, Math.cos(angle) > 0 ? 'right' : 'left');
        }

        const nextBoxX = { x: n.x + vx, y: n.y, width: n.width, height: n.height };
        let colX = false;
        for (let o of obstacles) {
          if (window.Combat && Combat.checkCollision(nextBoxX, o)) { colX = true; break; }
        }
        for (let d of doors) {
          if (window.Combat && Combat.checkCollision(nextBoxX, d)) { colX = true; break; }
        }
        if (!colX && !this.isPointInSafeZone(n.x + vx, n.y, activeDim)) n.x += vx;

        const nextBoxY = { x: n.x, y: n.y + vy, width: n.width, height: n.height };
        let colY = false;
        for (let o of obstacles) {
          if (window.Combat && Combat.checkCollision(nextBoxY, o)) { colY = true; break; }
        }
        for (let d of doors) {
          if (window.Combat && Combat.checkCollision(nextBoxY, d)) { colY = true; break; }
        }
        if (!colY && !this.isPointInSafeZone(n.x, n.y + vy, activeDim)) n.y += vy;

      } else {
        n.moveTimer--;
        if (n.moveTimer <= 0) {
          n.moveTimer = 40 + Math.floor(Math.random() * 60);
          n.dir = ['up', 'down', 'left', 'right', 'idle'][Math.floor(Math.random() * 5)];
        }
        if (n.dir !== 'idle') {
          const wanderSpeed = n.speed * 0.45;
          let wvx = 0, wvy = 0;
          if (n.dir === 'up') wvy = -wanderSpeed;
          else if (n.dir === 'down') wvy = wanderSpeed;
          else if (n.dir === 'left') wvx = -wanderSpeed;
          else if (n.dir === 'right') wvx = wanderSpeed;

          const wanderBoxX = { x: n.x + wvx, y: n.y, width: n.width, height: n.height };
          let wColX = false;
          for (let o of obstacles) {
            if (window.Combat && Combat.checkCollision(wanderBoxX, o)) { wColX = true; break; }
          }
          for (let d of doors) {
            if (window.Combat && Combat.checkCollision(wanderBoxX, d)) { wColX = true; break; }
          }
          if (!wColX && !this.isPointInSafeZone(n.x + wvx, n.y, activeDim)) n.x = Math.max(60, Math.min(maxBoundX, n.x + wvx));
          else n.dir = 'idle';

          const wanderBoxY = { x: n.x, y: n.y + wvy, width: n.width, height: n.height };
          let wColY = false;
          for (let o of obstacles) {
            if (window.Combat && Combat.checkCollision(wanderBoxY, o)) { wColY = true; break; }
          }
          for (let d of doors) {
            if (window.Combat && Combat.checkCollision(wanderBoxY, d)) { wColY = true; break; }
          }
          if (!wColY && !this.isPointInSafeZone(n.x, n.y + wvy, activeDim)) n.y = Math.max(60, Math.min(maxBoundY, n.y + wvy));
          else n.dir = 'idle';
        }
      }
    });
  },

  updateLootPickups() {
    const p = this.player;
    for (let i = this.lootPickups.length - 1; i >= 0; i--) {
      const item = this.lootPickups[i];
      const dist = Math.hypot((p.x + p.width / 2) - item.x, (p.y + p.height / 2) - item.y);
      if (dist < 160) {
        item.x += ((p.x + p.width / 2) - item.x) * 0.18;
        item.y += ((p.y + p.height / 2) - item.y) * 0.18;
      }
      if (dist < 24) {
        if (item.type === 'coin') {
          if (window.State) State.addTokens(item.value);
          if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('coin');
          if (window.State) State.showToast(`+${item.value} SOUND TOKENS! 🪙`);
        } else if (item.type === 'rare_tape') {
          if (window.State) {
            State.addRareTape();
            State.showToast(`RARE BATTLE CASSETTE ACQUIRED! (${State.userProfile.collectedRareTapes}/${State.RARE_TAPES_THRESHOLD}) 📼`);
          }
          if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
        } else if (item.type === 'amber_vial') {
          if (window.State) {
            State.userProfile.amberVials = (State.userProfile.amberVials || 0) + 1;
            State.save();
            State.showToast("AMBER DROPPER VIAL ACQUIRED! (+1 VIAL [Q]) 🧪");
          }
          if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
        }
        this.lootPickups.splice(i, 1);
      }
    }
  }
};

window.Entities = Entities;
