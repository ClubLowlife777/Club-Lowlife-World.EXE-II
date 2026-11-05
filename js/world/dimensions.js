const Dimensions = {
  undergroundObstacles: [
    { x: 0, y: 0, width: 1600, height: 28 }, { x: 0, y: 972, width: 1600, height: 28 },
    { x: 0, y: 0, width: 28, height: 1000 }, { x: 1572, y: 0, width: 28, height: 1000 },
    { x: 28, y: 350, width: 1300, height: 30 }, { x: 360, y: 28, width: 20, height: 210 }
  ],

  retrocadeObstacles: [
    { x: 0, y: 0, width: 1600, height: 28 }, { x: 0, y: 972, width: 1600, height: 28 },
    { x: 0, y: 0, width: 28, height: 1000 }, { x: 1572, y: 0, width: 28, height: 1000 },
    { x: 28, y: 440, width: 1300, height: 30 }, { x: 480, y: 28, width: 22, height: 300 }
  ],

  // 6400 x 4800 Massive Wasteland World Obstacles
  worldObstacles: [
    // World Boundary Enclosure
    { x: 0, y: 0, width: 6400, height: 50 }, { x: 0, y: 4750, width: 6400, height: 50 },
    { x: 0, y: 0, width: 50, height: 4800 }, { x: 6350, y: 0, width: 50, height: 4800 },

    // Zone 1: Northern Obsidian Canyon & Caves
    { x: 4200, y: 400, width: 1600, height: 140, label: "OBSIDIAN PLATEAU" },
    { x: 4200, y: 540, width: 140, height: 700 }, { x: 5660, y: 540, width: 140, height: 700 },
    { x: 4500, y: 1100, width: 1000, height: 120 },

    // Zone 2: Substance Silo 07 & Chemical Runoff
    { x: 1000, y: 1800, width: 650, height: 350, label: "SUBSTANCE SILO 07" },
    { x: 800, y: 2300, width: 400, height: 200, label: "CHEMICAL VATS" },
    { x: 1800, y: 2100, width: 450, height: 180, label: "REFINERY ANNEX" },

    // Zone 3: Dead Pine Cyber-Forest & Highway Overpass
    { x: 600, y: 800, width: 40, height: 750, label: "ELEVATED FREEWAY PILLARS" },
    { x: 600, y: 800, width: 900, height: 40 },
    { x: 1500, y: 800, width: 40, height: 750 },

    // Zone 4: The Subterranean Holding Chamber Complex[cite: 6]
    { x: 2800, y: 3800, width: 900, height: 35 },
    { x: 2800, y: 3800, width: 35, height: 600 },
    { x: 3665, y: 3800, width: 35, height: 600 },
    { x: 2800, y: 4365, width: 360, height: 35 },
    { x: 3340, y: 4365, width: 360, height: 35 } // Opening guarded by Drainage Breach
  ],

  destructibleDoors: [
    { id: "drainage_breach", x: 3160, y: 4365, width: 180, height: 35, hp: 160, maxHp: 160, shattered: false, label: "REINFORCED DRAINAGE BREACH [160 HP]" },
    { id: "cave_rubble", x: 4850, y: 1100, width: 120, height: 40, hp: 120, maxHp: 120, shattered: false, label: "OBSIDIAN CAVE COLLAPSE [120 HP]" }
  ],

  environmentalHazards: [
    { x: 1100, y: 2150, width: 500, height: 160, type: 'sludge' },
    { x: 1800, y: 2280, width: 380, height: 140, type: 'sludge' },
    { x: 4400, y: 900, width: 280, height: 180, type: 'sludge' }
  ],

  wastelandChests: [
    { id: "c1", x: 800, y: 650, width: 32, height: 26, type: "supply", label: "HIGHWAY SUPPLY CRATE", opened: false },
    { id: "c2", x: 1600, y: 1950, width: 36, height: 28, type: "biohazard", label: "SILO 07 HAZMAT CACHE", opened: false },
    { id: "c3", x: 5500, y: 700, width: 38, height: 30, type: "vault", label: "OBSOLETE CAVE VAULT", skinReward: "cave_stalker", opened: false },
    { id: "c4", x: 3220, y: 3950, width: 42, height: 32, type: "master_holding", label: "GOLDEN MASTER CRT VAULT[cite: 6]", skinReward: "static_nightmare", opened: false }
  ],

  undergroundZones: [
    { id: 'disco_room', x: 70, y: 140, width: 160, height: 100, label: 'DISCOGRAPHY VAULT', action: () => document.getElementById('discoModal').classList.remove('hidden') },
    { id: 'portal_retrocade', x: 1440, y: 640, width: 80, height: 80, label: 'WARP: RETROCADE NEON', action: () => State.switchDimension('retrocade', 750, 750) },
    { id: 'truck_merch', x: 180, y: 720, width: 140, height: 80, label: 'TRUNK POP // MERCH[cite: 2, 6]', action: () => document.getElementById('merchModal').classList.remove('hidden') },
    { id: 'arcade_galaga', x: 500, y: 60, width: 70, height: 70, label: 'PLAY VOID INVADERS [5🪙]', action: () => VoidInvaders.start() },
    { id: 'arcade_pacman', x: 620, y: 60, width: 70, height: 70, label: 'PLAY GRID RUNNER [5🪙]', action: () => GridRunner.start() },
    { id: 'arcade_mario', x: 740, y: 60, width: 70, height: 70, label: 'PLAY LOWLIFE LEAP [5🪙]', action: () => LowlifeLeap.start() }
  ],

  retrocadeZones: [
    { id: 'portal_underground', x: 100, y: 840, width: 80, height: 80, label: 'WARP: UNDERGROUND', action: () => State.switchDimension('underground', 320, 750) },
    { id: 'portal_wasteland', x: 750, y: 840, width: 80, height: 80, label: 'WARP: ASHEN WASTELAND', action: () => State.switchDimension('wasteland', 800, 800) },
    { id: 'casino_slots', x: 1080, y: 130, width: 160, height: 80, label: 'CASINO SLOTS [5🪙]', action: () => CasinoGame.open() }
  ],

  wastelandZones: [
    { id: 'portal_retrocade_back', x: 800, y: 700, width: 80, height: 80, label: 'WARP: RETROCADE DISTRICT 84', action: () => State.switchDimension('retrocade', 750, 750) },
    { id: 'trunk_drop', x: 1700, y: 1850, width: 140, height: 70, label: 'BURNED-OUT TRUNK DROP[cite: 2, 6]', action: () => document.getElementById('merchModal').classList.remove('hidden') },
    { id: 'cassette_drop', x: 4900, y: 650, width: 140, height: 70, label: 'CASSETTE AIR-DROP CLAIM[cite: 4]', action: () => document.getElementById('cassetteClaimModal').classList.remove('hidden') },
    { id: 'gated_rift', x: 3120, y: 150, width: 180, height: 100, label: 'EXTRACTION GATE [50 TAPES][cite: 4]', action: () => document.getElementById('gatedModal').classList.remove('hidden') }
  ],

  getActiveObstacles() {
    if (State.currentDimension === 'wasteland') return this.worldObstacles;
    if (State.currentDimension === 'retrocade') return this.retrocadeObstacles;
    return this.undergroundObstacles;
  },

  getActiveZones() {
    if (State.currentDimension === 'wasteland') return this.wastelandZones;
    if (State.currentDimension === 'retrocade') return this.retrocadeZones;
    return this.undergroundZones;
  }
};
