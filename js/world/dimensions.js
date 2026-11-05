const Dimensions = {
  // EXPANDED UNDERGROUND NIGHT SHIFT (2400 x 1200)
  undergroundObstacles: [
    // Outer Walls
    { x: 0, y: 0, width: 2400, height: 35 }, { x: 0, y: 1165, width: 2400, height: 35 },
    { x: 0, y: 0, width: 35, height: 1200 }, { x: 2365, y: 0, width: 35, height: 1200 },

    // Tuning Garage & Trunk Bay (West)
    { x: 35, y: 450, width: 600, height: 25 },
    { x: 635, y: 35, width: 25, height: 440 }, // Partition wall with opening at bottom

    // Studio Mastering Suite (North Central)
    { x: 800, y: 35, width: 25, height: 320 },
    { x: 800, y: 355, width: 500, height: 25 },
    { x: 1300, y: 35, width: 25, height: 345 },

    // Arcade Hall & Generator Alley (East)
    { x: 1450, y: 480, width: 915, height: 25 },
    { x: 1750, y: 505, width: 25, height: 420 }
  ],

  // 3-ROOM RETROCADE / NIRVANA COMPLEX (2400 x 1200)
  retrocadeObstacles: [
    // Outer perimeter
    { x: 0, y: 0, width: 2400, height: 35 }, { x: 0, y: 1165, width: 2400, height: 35 },
    { x: 0, y: 0, width: 35, height: 1200 }, { x: 2365, y: 0, width: 35, height: 1200 },

    // Room 1 (West: Music Kiosk Lounge) Partition (with doorway at Y=500-660)
    { x: 680, y: 35, width: 30, height: 465 },
    { x: 680, y: 660, width: 30, height: 505 },

    // Room 3 (East: Cyber Casino Hall) Partition (with doorway at Y=500-660)
    { x: 1720, y: 35, width: 30, height: 465 },
    { x: 1720, y: 660, width: 30, height: 505 },

    // CENTER ROOM: DJ BOOTH ACOUSTIC BARRIER WALL (Visible Stage Security Wall)
    { x: 920, y: 240, width: 560, height: 25, label: "DJ STAGE BARRIER" },
    { x: 920, y: 120, width: 25, height: 120 },
    { x: 1455, y: 120, width: 25, height: 120 }
  ],

  // 6400 x 4800 ASHEN WASTELAND
  worldObstacles: [
    { x: 0, y: 0, width: 6400, height: 50 }, { x: 0, y: 4750, width: 6400, height: 50 },
    { x: 0, y: 0, width: 50, height: 4800 }, { x: 6350, y: 0, width: 50, height: 4800 },

    // Northern Obsidian Canyon
    { x: 4200, y: 400, width: 1600, height: 140, label: "OBSIDIAN PLATEAU" },
    { x: 4200, y: 540, width: 140, height: 700 }, { x: 5660, y: 540, width: 140, height: 700 },
    { x: 4500, y: 1100, width: 1000, height: 120 },

    // Substance Silo 07
    { x: 1000, y: 1800, width: 650, height: 350, label: "SUBSTANCE SILO 07" },
    { x: 800, y: 2300, width: 400, height: 200, label: "CHEMICAL VATS" },
    { x: 1800, y: 2100, width: 450, height: 180, label: "REFINERY ANNEX" },

    // Highway Overpass
    { x: 600, y: 800, width: 40, height: 750, label: "ELEVATED HIGHWAY PILLARS" },
    { x: 600, y: 800, width: 900, height: 40 },
    { x: 1500, y: 800, width: 40, height: 750 },

    // The Subterranean Holding Chamber[cite: 2]
    { x: 2800, y: 3800, width: 900, height: 35 },
    { x: 2800, y: 3800, width: 35, height: 600 },
    { x: 3665, y: 3800, width: 35, height: 600 },
    { x: 2800, y: 4365, width: 360, height: 35 },
    { x: 3340, y: 4365, width: 360, height: 35 }
  ],

  destructibleDoors: [
    { id: "drainage_breach", x: 3160, y: 4365, width: 180, height: 35, hp: 160, maxHp: 160, shattered: false, label: "REINFORCED DRAINAGE BREACH [160 HP]" },
    { id: "cave_rubble", x: 4850, y: 1100, width: 120, height: 40, hp: 120, maxHp: 120, shattered: false, label: "CAVE BOULDERS [120 HP]" }
  ],

  environmentalHazards: [
    { x: 1100, y: 2150, width: 500, height: 160, type: 'sludge' },
    { x: 1800, y: 2280, width: 380, height: 140, type: 'sludge' },
    { x: 4400, y: 900, width: 280, height: 180, type: 'sludge' }
  ],

  wastelandChests: [
    { id: "c1", x: 800, y: 650, width: 36, height: 28, type: "supply", label: "HIGHWAY SUPPLY CRATE", opened: false },
    { id: "c2", x: 1600, y: 1950, width: 38, height: 30, type: "biohazard", label: "SILO 07 HAZMAT CACHE", opened: false },
    { id: "c3", x: 5500, y: 700, width: 40, height: 32, type: "vault", label: "OBSOLETE CAVE VAULT", skinReward: "cave_stalker", opened: false },
    { id: "c4", x: 3220, y: 3950, width: 44, height: 34, type: "master_holding", label: "GOLDEN MASTER VAULT", skinReward: "static_nightmare", opened: false }
  ],

  undergroundZones: [
    { id: 'disco_room', x: 880, y: 120, width: 160, height: 100, label: 'DISCOGRAPHY VAULT', action: () => document.getElementById('discoModal').classList.remove('hidden') },
    { id: 'portal_retrocade', x: 2200, y: 900, width: 80, height: 80, label: 'WARP: RETROCADE DISTRICT 84', action: () => State.switchDimension('retrocade', 1200, 750) },
    { id: 'truck_merch', x: 180, y: 200, width: 150, height: 90, label: 'TRUNK POP // MERCH', action: () => document.getElementById('merchModal').classList.remove('hidden') },
    { id: 'arcade_galaga', x: 1650, y: 120, width: 70, height: 70, label: 'PLAY VOID INVADERS [5🪙]', action: () => VoidInvaders.start() },
    { id: 'arcade_pacman', x: 1800, y: 120, width: 70, height: 70, label: 'PLAY GRID RUNNER [5🪙]', action: () => GridRunner.start() },
    { id: 'arcade_mario', x: 1950, y: 120, width: 70, height: 70, label: 'PLAY LOWLIFE LEAP [5🪙]', action: () => LowlifeLeap.start() }
  ],

  retrocadeZones: [
    { id: 'portal_underground', x: 800, y: 1050, width: 80, height: 80, label: 'WARP: UNDERGROUND NIGHT SHIFT', action: () => State.switchDimension('underground', 350, 750) },
    { id: 'portal_wasteland', x: 1520, y: 1050, width: 80, height: 80, label: 'WARP: ASHEN WASTELAND', action: () => State.switchDimension('wasteland', 800, 800) },
    { id: 'music_kiosk_lounge', x: 260, y: 220, width: 160, height: 100, label: 'CLUB LOWLIFE MUSIC KIOSK', action: () => document.getElementById('discoModal').classList.remove('hidden') },
    { id: 'casino_slots_classic', x: 1880, y: 180, width: 130, height: 70, label: 'CLASSIC 3-REEL SLOTS [5🪙]', action: () => CasinoGame.open('classic') },
    { id: 'casino_slots_highroller', x: 2120, y: 180, width: 150, height: 70, label: 'HIGH-ROLLER 5-LANE SLOTS [25🪙]', action: () => CasinoGame.open('highroller') }
  ],

  wastelandZones: [
    { id: 'portal_retrocade_back', x: 800, y: 700, width: 80, height: 80, label: 'WARP: RETROCADE DISTRICT 84', action: () => State.switchDimension('retrocade', 1200, 750) },
    { id: 'trunk_drop', x: 1700, y: 1850, width: 140, height: 70, label: 'BURNED-OUT TRUNK DROP', action: () => document.getElementById('merchModal').classList.remove('hidden') },
    { id: 'cassette_drop', x: 4900, y: 650, width: 140, height: 70, label: 'CASSETTE AIR-DROP CLAIM', action: () => document.getElementById('cassetteClaimModal').classList.remove('hidden') },
    { id: 'gated_rift', x: 3120, y: 150, width: 180, height: 100, label: 'NEURAL EXTRACTION GATE [50 TAPES]', action: () => document.getElementById('gatedModal').classList.remove('hidden') }
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
