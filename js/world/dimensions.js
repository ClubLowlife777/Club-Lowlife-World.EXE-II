/**
 * CLUB LOWLIFE // UNIVERSE DIMENSIONS & COLLISION MATRICES
 * File: js/world/dimensions.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Physics (Rev 5.20 - Dense Wasteland & Chapter III Horizon)
 */

const Dimensions = {
  // =========================================================================
  // 1. UNDERGROUND NIGHT SHIFT (2400 x 1200 px Starting Hub)
  // =========================================================================
  undergroundObstacles: [
    { x: 0, y: 0, width: 2400, height: 35, label: "PERIMETER NORTH" },
    { x: 0, y: 1165, width: 2400, height: 35, label: "PERIMETER SOUTH" },
    { x: 0, y: 0, width: 35, height: 1200, label: "PERIMETER WEST" },
    { x: 2365, y: 0, width: 35, height: 1200, label: "PERIMETER EAST" },

    // Tuning Garage & Trunk Bay (120px Opening at X=260-380)
    { x: 35, y: 450, width: 225, height: 25, label: "GARAGE SOUTH WALL (WEST)" },
    { x: 380, y: 450, width: 255, height: 25, label: "GARAGE SOUTH WALL (EAST)" },
    { x: 635, y: 35, width: 25, height: 185, label: "GARAGE EAST WALL (NORTH)" },
    { x: 635, y: 320, width: 25, height: 155, label: "GARAGE EAST WALL (SOUTH)" },

    // Studio Mastering Suite (100px Double Door at X=1000-1100)
    { x: 800, y: 35, width: 25, height: 320, label: "STUDIO WEST WALL" },
    { x: 800, y: 355, width: 200, height: 25, label: "STUDIO SOUTH WALL (WEST)" },
    { x: 1100, y: 355, width: 200, height: 25, label: "STUDIO SOUTH WALL (EAST)" },
    { x: 1300, y: 35, width: 25, height: 345, label: "STUDIO EAST WALL" },

    // Arcade Hall & Generator Alley (Openings at Y=200-320 and X=1700-1800)
    { x: 1450, y: 35, width: 25, height: 165, label: "ARCADE WEST WALL (NORTH)" },
    { x: 1450, y: 320, width: 25, height: 160, label: "ARCADE WEST WALL (SOUTH)" },
    { x: 1450, y: 480, width: 250, height: 25, label: "ARCADE SOUTH WALL (WEST)" },
    { x: 1800, y: 480, width: 565, height: 25, label: "ARCADE SOUTH WALL (EAST)" },
    { x: 1750, y: 505, width: 25, height: 165, label: "GENERATOR DIVIDER (NORTH)" },
    { x: 1750, y: 770, width: 25, height: 155, label: "GENERATOR DIVIDER (SOUTH)" }
  ],

  undergroundDoorways: [
    { id: 'bay_rollup', x: 260, y: 450, width: 120, height: 25, type: 'rollup', label: 'BAY 01 ROLLUP DOOR' },
    { id: 'garage_service', x: 635, y: 220, width: 25, height: 100, type: 'service', label: 'GARAGE ACCESS DOOR' },
    { id: 'studio_double_door', x: 1000, y: 355, width: 100, height: 25, type: 'acoustic', label: 'MASTERING SUITE ENTRANCE' },
    { id: 'arcade_arch', x: 1450, y: 200, width: 25, height: 120, type: 'neon_arch', label: 'NEO-ARCADE ARCHWAY' },
    { id: 'arcade_south', x: 1700, y: 480, width: 100, height: 25, type: 'arcade_concourse', label: 'ARCADE SOUTH ENTRANCE' },
    { id: 'gen_alley', x: 1750, y: 670, width: 25, height: 100, type: 'service', label: 'GENERATOR ALLEY ACCESS' }
  ],

  undergroundZones: [
    { 
      id: 'disco_room', 
      x: 880, y: 120, width: 160, height: 95, 
      label: 'DISCOGRAPHY & STREAMING QUESTS', 
      action: () => { 
        if (typeof openDiscographyModal === 'function') {
          openDiscographyModal();
        } else {
          const m = document.getElementById('discoModal'); 
          if (m) m.classList.remove('hidden'); 
        }
      } 
    },
    { 
      id: 'portal_retrocade', 
      x: 2200, y: 900, width: 80, height: 80, 
      label: 'WARP: RETROCADE NIRVANA', 
      action: () => { 
        if (window.State) State.switchDimension('retrocade', 1200, 750); 
      } 
    },
    { 
      id: 'truck_merch', 
      x: 180, y: 200, width: 150, height: 90, 
      label: 'TRUNK POP // MERCH & FAST TRAVEL', 
      action: () => { 
        const m = document.getElementById('merchModal'); 
        if (m) m.classList.remove('hidden'); 
      } 
    },
    { 
      id: 'arcade_galaga', 
      x: 1640, y: 110, width: 90, height: 90, 
      label: 'PLAY LOWLIFE GALAGA // VOID INVADERS [5🪙]', 
      action: () => {
        if (!window.State || !State.spendTokens(5)) {
          if (window.State) State.showToast("INSUFFICIENT TOKENS // NEED 5🪙 TO PLAY!");
          return;
        }
        const modal = document.getElementById('arcadeModal');
        if (modal) modal.classList.remove('hidden');
        if (window.VoidInvaders && typeof VoidInvaders.start === 'function') {
          State.activeMiniGame = VoidInvaders;
          VoidInvaders.start();
        }
      } 
    },
    { 
      id: 'arcade_pacman', 
      x: 1790, y: 110, width: 90, height: 90, 
      label: 'PLAY PAC-LOWLIFE // GRID RUNNER [5🪙]', 
      action: () => {
        if (!window.State || !State.spendTokens(5)) {
          if (window.State) State.showToast("INSUFFICIENT TOKENS // NEED 5🪙 TO PLAY!");
          return;
        }
        const modal = document.getElementById('arcadeModal');
        if (modal) modal.classList.remove('hidden');
        if (window.GridRunner && typeof GridRunner.start === 'function') {
          State.activeMiniGame = GridRunner;
          GridRunner.start();
        }
      } 
    },
    { 
      id: 'arcade_mario', 
      x: 1940, y: 110, width: 90, height: 90, 
      label: 'PLAY SUPER LOWLIFE BROS [5🪙]', 
      action: () => {
        if (!window.State || !State.spendTokens(5)) {
          if (window.State) State.showToast("INSUFFICIENT TOKENS // NEED 5🪙 TO PLAY!");
          return;
        }
        const modal = document.getElementById('arcadeModal');
        if (modal) modal.classList.remove('hidden');
        if (window.LowlifeLeap && typeof LowlifeLeap.start === 'function') {
          State.activeMiniGame = LowlifeLeap;
          LowlifeLeap.start();
        }
      } 
    }
  ],

  // =========================================================================
  // 2. NIRVANA // RETROCADE (2400 x 1200 px Neon Lounge)
  // =========================================================================
  retrocadeObstacles: [
    { x: 0, y: 0, width: 2400, height: 35, label: "PERIMETER NORTH" },
    { x: 0, y: 1165, width: 2400, height: 35, label: "PERIMETER SOUTH" },
    { x: 0, y: 0, width: 35, height: 1200, label: "PERIMETER WEST" },
    { x: 2365, y: 0, width: 35, height: 1200, label: "PERIMETER EAST" },

    { x: 680, y: 35, width: 30, height: 465, label: "LOUNGE PARTITION NORTH" },
    { x: 680, y: 660, width: 30, height: 505, label: "LOUNGE PARTITION SOUTH" },

    { x: 1720, y: 35, width: 30, height: 465, label: "CASINO PARTITION NORTH" },
    { x: 1720, y: 660, width: 30, height: 505, label: "CASINO PARTITION SOUTH" },

    { x: 920, y: 240, width: 560, height: 25, label: "DJ STAGE BARRIER" },
    { x: 920, y: 120, width: 25, height: 120, label: "DJ BOOTH FLANK WEST" },
    { x: 1455, y: 120, width: 25, height: 120, label: "DJ BOOTH FLANK EAST" }
  ],

  retrocadeZones: [
    { id: 'portal_underground', x: 800, y: 1050, width: 80, height: 80, label: 'WARP: UNDERGROUND NIGHT SHIFT', action: () => { if (window.State) State.switchDimension('underground', 350, 750); } },
    { id: 'portal_wasteland', x: 1520, y: 1050, width: 80, height: 80, label: 'WARP: ASHEN WASTELAND', action: () => { if (window.State) State.switchDimension('wasteland', 650, 1100); } },
    { id: 'music_kiosk_lounge', x: 245, y: 205, width: 190, height: 120, label: 'CLUB LOWLIFE MUSIC & STREAMING QUESTS', action: () => { if (typeof openDiscographyModal === 'function') openDiscographyModal(); else { const m = document.getElementById('discoModal'); if (m) m.classList.remove('hidden'); } } },
    { id: 'casino_slots_classic', x: 1860, y: 165, width: 170, height: 105, label: 'PLAY CLASSIC 3-REEL SLOTS [5🪙]', action: () => { if (window.CasinoGame) window.CasinoGame.open('classic'); else if (typeof CasinoGame !== 'undefined') CasinoGame.open('classic'); } },
    { id: 'casino_slots_highroller', x: 2100, y: 165, width: 185, height: 105, label: 'PLAY HIGH-ROLLER 5-LANE SLOTS [25🪙]', action: () => { if (window.CasinoGame) window.CasinoGame.open('highroller'); else if (typeof CasinoGame !== 'undefined') CasinoGame.open('highroller'); } }
  ],

  // =========================================================================
  // 3. THE ASHEN WASTELAND (6400 x 4800 px High-Density Corruption Battleground)
  // =========================================================================
  worldObstacles: [
    { x: 0, y: 0, width: 6400, height: 50, label: "WASTELAND PERIMETER NORTH" },
    { x: 0, y: 4750, width: 6400, height: 50, label: "WASTELAND PERIMETER SOUTH" },
    { x: 0, y: 0, width: 50, height: 4800, label: "WASTELAND PERIMETER WEST" },
    { x: 6350, y: 0, width: 50, height: 4800, label: "WASTELAND PERIMETER EAST" },

    // Highway Overpass (Northwest Spawn Sector)
    { x: 600, y: 800, width: 40, height: 180, label: "HIGHWAY PILLAR NW" },
    { x: 600, y: 800, width: 900, height: 40, label: "ELEVATED HIGHWAY DECK" },
    { x: 1500, y: 800, width: 40, height: 750, label: "HIGHWAY PILLAR EAST" },

    // Dossier Node 4: THE RUST SANCTUARY (Secured Safe Zone & Bio-Clinic, North-West-Central)
    { x: 1650, y: 260, width: 900, height: 35, label: "RUST SANCTUARY NORTH WALL" },
    { x: 1650, y: 260, width: 35, height: 560, label: "RUST SANCTUARY WEST WALL" },
    { x: 2515, y: 260, width: 35, height: 560, label: "RUST SANCTUARY EAST WALL" },
    { x: 1650, y: 785, width: 340, height: 35, label: "SANCTUARY GATE WEST" },
    { x: 2170, y: 785, width: 380, height: 35, label: "SANCTUARY GATE EAST" },

    // Northern Obsidian Canyon (Northeast Boss Sector)
    { x: 4200, y: 400, width: 1600, height: 140, label: "OBSIDIAN PLATEAU" },
    { x: 4200, y: 540, width: 140, height: 700, label: "CANYON WEST WALL" },
    { x: 5660, y: 540, width: 140, height: 700, label: "CANYON EAST WALL" },
    { x: 4500, y: 1100, width: 350, height: 120, label: "CANYON LEDGE WEST" },
    { x: 4970, y: 1100, width: 530, height: 120, label: "CANYON LEDGE EAST" },

    // Substance Silo 07 Complex (West-Central Boss Sector)
    { x: 1000, y: 1800, width: 650, height: 350, label: "SUBSTANCE SILO 07" },
    { x: 800, y: 2300, width: 400, height: 200, label: "CHEMICAL VATS" },
    { x: 1800, y: 2100, width: 450, height: 180, label: "REFINERY ANNEX" },

    // Martian University Research Annex (160px Southern Entrance Gap at X: 2320-2480)
    { x: 2100, y: 1200, width: 600, height: 35, label: "MARTIAN UNIV. LAB NORTH" },
    { x: 2100, y: 1200, width: 35, height: 500, label: "MARTIAN UNIV. WEST WALL" },
    { x: 2665, y: 1200, width: 35, height: 500, label: "MARTIAN UNIV. EAST WALL" },
    { x: 2100, y: 1665, width: 220, height: 35, label: "MARTIAN UNIV. SOUTH (W)" },
    { x: 2480, y: 1665, width: 220, height: 35, label: "MARTIAN UNIV. SOUTH (E)" },

    // Dossier Node 5: DEEP VOID DATA VAULT (Submerged Air-Gapped Mainframe Dungeon, Central)
    { x: 3000, y: 1200, width: 700, height: 40, label: "DEEP VOID VAULT NORTH" },
    { x: 3000, y: 1200, width: 40, height: 750, label: "DEEP VOID VAULT WEST" },
    { x: 3660, y: 1200, width: 40, height: 750, label: "DEEP VOID VAULT EAST" },
    { x: 3040, y: 1550, width: 230, height: 35, label: "AIRLOCK BULKHEAD WEST" },
    { x: 3430, y: 1550, width: 230, height: 35, label: "AIRLOCK BULKHEAD EAST" },
    { x: 3000, y: 1910, width: 250, height: 40, label: "VAULT OUTER GATE (W)" },
    { x: 3450, y: 1910, width: 250, height: 40, label: "VAULT OUTER GATE (E)" },

    // Sector 777 Overlook ("Living on the Highs") (180px Western Entrance Gap at Y: 2510-2690)
    { x: 3800, y: 2300, width: 600, height: 35, label: "SECTOR 777 LOUNGE NORTH" },
    { x: 4365, y: 2300, width: 35, height: 550, label: "SECTOR 777 EAST WALL" },
    { x: 3800, y: 2815, width: 600, height: 35, label: "SECTOR 777 SOUTH WALL" },
    { x: 3800, y: 2300, width: 35, height: 210, label: "SECTOR 777 WEST (N)" },
    { x: 3800, y: 2690, width: 35, height: 160, label: "SECTOR 777 WEST (S)" },

    // ECHO CAVERN & CRYSTAL GROTTO (Subterranean Cave System, East-Central)
    { x: 4750, y: 1550, width: 1300, height: 65, label: "ECHO CAVERN NORTH RIDGE" },
    { x: 5985, y: 1550, width: 65, height: 1100, label: "ECHO CAVERN EAST CLIFF" },
    { x: 4750, y: 2585, width: 1300, height: 65, label: "ECHO CAVERN SOUTH RIDGE" },
    { x: 4750, y: 1550, width: 65, height: 380, label: "CAVERN MOUTH NORTH" },
    { x: 4750, y: 2150, width: 65, height: 500, label: "CAVERN MOUTH SOUTH" },
    { x: 5180, y: 1820, width: 90, height: 90, label: "BASALT STALAGMITE 01" },
    { x: 5520, y: 2180, width: 100, height: 90, label: "BASALT STALAGMITE 02" },
    { x: 5650, y: 1615, width: 40, height: 420, label: "CRYSTAL GROTTO WALL" },

    // Dossier Node 3: BLACK-MARKET TECH REFINERY ("THE FURNACE" Foundry Dungeon, Southwest)
    { x: 350, y: 3100, width: 520, height: 40, label: "THE FURNACE NORTH (W)" },
    { x: 1070, y: 3100, width: 580, height: 40, label: "THE FURNACE NORTH (E)" },
    { x: 350, y: 3100, width: 40, height: 1250, label: "THE FURNACE WEST BASTION" },
    { x: 350, y: 4310, width: 1300, height: 40, label: "THE FURNACE SOUTH BASTION" },
    { x: 1610, y: 3100, width: 40, height: 500, label: "THE FURNACE EAST (N)" },
    { x: 1610, y: 3800, width: 40, height: 550, label: "THE FURNACE EAST (S)" },
    { x: 390, y: 3700, width: 440, height: 35, label: "SMELTING CORE BULKHEAD (W)" },
    { x: 1010, y: 3700, width: 600, height: 35, label: "SMELTING CORE BULKHEAD (E)" },

    // Dossier Node 1: UNDERCITY TRANSIT CORE ("THE DRAIN" Subway Dungeon, South-Central-West)
    { x: 1850, y: 3450, width: 280, height: 35, label: "THE DRAIN TUNNEL (NW)" },
    { x: 2310, y: 3450, width: 310, height: 35, label: "THE DRAIN TUNNEL (NE)" },
    { x: 1850, y: 3450, width: 35, height: 1000, label: "THE DRAIN WEST WALL" },
    { x: 2585, y: 3450, width: 35, height: 1000, label: "THE DRAIN EAST WALL" },
    { x: 1885, y: 3780, width: 420, height: 30, label: "SUB-LEVEL BAFFLE 01" },
    { x: 2160, y: 4060, width: 425, height: 30, label: "SUB-LEVEL BAFFLE 02" },
    { x: 1850, y: 4415, width: 770, height: 35, label: "THE DRAIN TERMINUS SOUTH" },

    // The Subterranean Holding Chamber (Connected via 140px Doorway at Y: 4030-4170 to Washroom)
    { x: 2800, y: 3800, width: 900, height: 35, label: "CHAMBER NORTH WALL" },
    { x: 2800, y: 3800, width: 35, height: 600, label: "CHAMBER WEST WALL" },
    { x: 3665, y: 3800, width: 35, height: 230, label: "CHAMBER EAST WALL (N)" },
    { x: 3665, y: 4170, width: 35, height: 230, label: "CHAMBER EAST WALL (S)" },
    { x: 2800, y: 4365, width: 360, height: 35, label: "CHAMBER SOUTH WALL (WEST)" },
    { x: 3340, y: 4365, width: 360, height: 35, label: "CHAMBER SOUTH WALL (EAST)" },

    // Industrial Washroom (Short Film Mirror Reveal)
    { x: 3700, y: 3900, width: 350, height: 35, label: "WASHROOM NORTH WALL" },
    { x: 4015, y: 3900, width: 35, height: 400, label: "WASHROOM EAST WALL" },
    { x: 3700, y: 4265, width: 350, height: 35, label: "WASHROOM SOUTH WALL" },

    // Dossier Node 2: APEX SIGNAL ARRAY & SYNDICATE CITADEL (Castle Fortress, Southeast)
    { x: 4450, y: 3150, width: 45, height: 520, label: "CITADEL GATEHOUSE NORTH" },
    { x: 4450, y: 3890, width: 45, height: 610, label: "CITADEL GATEHOUSE SOUTH" },
    { x: 4450, y: 3150, width: 680, height: 45, label: "CITADEL BATTLEMENT NW" },
    { x: 5330, y: 3150, width: 770, height: 45, label: "CITADEL BATTLEMENT NE" },
    { x: 6055, y: 3150, width: 45, height: 1350, label: "CITADEL EAST KEEP WALL" },
    { x: 4450, y: 4455, width: 1650, height: 45, label: "CITADEL SOUTH RAMPART" },
    { x: 5250, y: 3500, width: 550, height: 35, label: "APEX SPIRE INNER KEEP (N)" },
    { x: 5250, y: 4120, width: 550, height: 35, label: "APEX SPIRE INNER KEEP (S)" }
  ],

  destructibleDoors: [
    { id: "drainage_breach", x: 3160, y: 4365, width: 180, height: 35, hp: 160, maxHp: 160, shattered: false, label: "REINFORCED DRAINAGE BREACH [160 HP]" },
    { id: "cave_rubble", x: 4850, y: 1100, width: 120, height: 40, hp: 120, maxHp: 120, shattered: false, label: "CAVE BOULDERS [120 HP]" },
    { id: "void_vault_seal", x: 3270, y: 1550, width: 160, height: 35, hp: 220, maxHp: 220, shattered: false, label: "DEEP VOID AIRLOCK SEAL [220 HP]" },
    { id: "furnace_blast_door", x: 830, y: 3700, width: 180, height: 35, hp: 180, maxHp: 180, shattered: false, label: "SMELTING CORE BLAST DOOR [180 HP]" },
    { id: "grotto_boulder", x: 5650, y: 2035, width: 40, height: 140, hp: 140, maxHp: 140, shattered: false, label: "CRYSTAL GROTTO ROCKSLIDE [140 HP]" },
    { id: "citadel_keep_gate", x: 4450, y: 3670, width: 45, height: 220, hp: 200, maxHp: 200, shattered: false, label: "CITADEL PORTCULLIS GATE [200 HP]" }
  ],

  environmentalHazards: [
    { x: 1100, y: 2150, width: 500, height: 160, type: 'sludge', label: 'CHEMICAL SLUDGE PIT 01' },
    { x: 1800, y: 2280, width: 380, height: 140, type: 'sludge', label: 'CHEMICAL SLUDGE PIT 02' },
    { x: 4400, y: 900, width: 280, height: 180, type: 'sludge', label: 'TOXIC DISCHARGE RUNOFF' },
    { x: 460, y: 3420, width: 340, height: 160, type: 'sludge', label: 'MOLTEN ALLOY SLAG PIT' },
    { x: 1920, y: 3880, width: 210, height: 140, type: 'sludge', label: 'UNDERCITY SEWAGE SURGE' },
    { x: 5050, y: 2320, width: 360, height: 160, type: 'sludge', label: 'RADIOACTIVE CAVERN POOL' },
    { x: 4720, y: 4160, width: 380, height: 160, type: 'sludge', label: 'CITADEL COOLANT TRENCH' }
  ],

  wastelandChests: [
    // Original 8 Chests
    { id: "c1", x: 800, y: 650, width: 36, height: 28, type: "supply", label: "HIGHWAY SUPPLY CRATE", opened: false },
    { id: "c2", x: 1600, y: 1950, width: 38, height: 30, type: "biohazard", label: "SILO 07 HAZMAT CACHE", opened: false },
    { id: "c3", x: 5500, y: 700, width: 40, height: 32, type: "vault", label: "OBSOLETE CAVE VAULT", relicReward: "relic_peak_controller", skinReward: "cave_stalker", opened: false },
    { id: "c4", x: 3220, y: 3950, width: 44, height: 34, type: "master_holding", label: "GOLDEN MASTER VAULT", skinReward: "static_nightmare", opened: false },
    { id: "c5", x: 2380, y: 1320, width: 40, height: 32, type: "vault", label: "MARTIAN UNIVERSITY ARCHIVE VAULT", relicReward: "relic_tape_saturator", skinReward: "sound_designer", opened: false },
    { id: "c6", x: 4220, y: 2450, width: 40, height: 32, type: "vault", label: "SECTOR 777 VIP STASH", relicReward: "relic_gross_beat", skinReward: "jackpot_777", opened: false },
    { id: "c7", x: 3920, y: 4180, width: 38, height: 30, type: "biohazard", label: "WASHROOM AMBER VIAL CACHE", opened: false },
    { id: "c8", x: 920, y: 1420, width: 36, height: 28, type: "supply", label: "OVERPASS DROP CRATE", opened: false },

    // New Dense Wasteland Chests (Dungeons, Caves, Castles & Infrastructure Nodes)
    { id: "c9", x: 1780, y: 360, width: 38, height: 30, type: "biohazard", label: "RUST SANCTUARY MED-STASH", opened: false },
    { id: "c10", x: 2380, y: 360, width: 36, height: 28, type: "supply", label: "SANCTUARY QUARTERMASTER CRATE", opened: false },
    { id: "c11", x: 3330, y: 1320, width: 44, height: 34, type: "master_holding", label: "DEEP VOID MAINFRAME VAULT", skinReward: "zero_frame_phantom", opened: false },
    { id: "c12", x: 3520, y: 1720, width: 36, height: 28, type: "supply", label: "AIRLOCK TELEMETRY CRATE", opened: false },
    { id: "c13", x: 520, y: 4160, width: 40, height: 32, type: "vault", label: "THE FURNACE ALLOY VAULT", skinReward: "carbon_enforcer", opened: false },
    { id: "c14", x: 1450, y: 3300, width: 38, height: 30, type: "biohazard", label: "FOUNDRY COOLANT CACHE", opened: false },
    { id: "c15", x: 1420, y: 4160, width: 36, height: 28, type: "supply", label: "SMELTING CORE MUNITIONS", opened: false },
    { id: "c16", x: 1960, y: 4280, width: 40, height: 32, type: "vault", label: "UNDERCITY DRAIN CONTRABAND VAULT", skinReward: "drainage_hermit", opened: false },
    { id: "c17", x: 2460, y: 3600, width: 36, height: 28, type: "supply", label: "TRANSIT PLATFORM CRATE", opened: false },
    { id: "c18", x: 5820, y: 1720, width: 40, height: 32, type: "vault", label: "CRYSTAL GROTTO ANCIENT VAULT", skinReward: "obsidian_scout", opened: false },
    { id: "c19", x: 5340, y: 1980, width: 38, height: 30, type: "biohazard", label: "ECHO CAVERN SPORE CACHE", opened: false },
    { id: "c20", x: 5880, y: 3780, width: 44, height: 34, type: "master_holding", label: "APEX CITADEL SOVEREIGN VAULT", skinReward: "omega_enforcer", opened: false },
    { id: "c21", x: 4680, y: 3320, width: 38, height: 30, type: "biohazard", label: "CITADEL GARRISON MED-CACHE", opened: false },
    { id: "c22", x: 5620, y: 4320, width: 36, height: 28, type: "supply", label: "BROADCAST SPIRE BATTERY CRATE", opened: false }
  ],

  wastelandZones: [
    { id: 'portal_retrocade_back', x: 650, y: 1020, width: 80, height: 80, label: 'WARP: RETROCADE NIRVANA', action: () => { if (window.State) State.switchDimension('retrocade', 1200, 750); } },
    { id: 'getaway_van_log', x: 460, y: 1080, width: 135, height: 85, label: 'BLACK VAN // FAST TRAVEL & TRANSIT LOG', action: () => {
      if (typeof openFastTravelModal === 'function') {
        openFastTravelModal();
      } else {
        const m = document.getElementById('npcModal');
        if (m) m.classList.remove('hidden');
      }
    }},
    { id: 'washroom_mirror', x: 3880, y: 3940, width: 90, height: 60, label: 'LOOK INTO CRACKED WASHROOM MIRROR', action: () => {
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
      if (window.State) State.unlockSkin('old_self');
      const m = document.getElementById('npcModal');
      if (m) {
        document.getElementById('npcName').innerText = 'THE MIRROR REVEAL // SCENE 04';
        document.getElementById('npcRole').innerText = 'INDUSTRIAL RESTROOM (TUBE LIGHT)';
        document.getElementById('npcAvatarIcon').innerText = '🪞';
        document.getElementById('npcDialogueText').innerText = '[PRESSURIZED AIR HISS] You unlatch the side seals and lift the matte-black helmet in front of the cracked glass. The captor holding the old era hostage was never an outsider—it is you, stripped of color, ushering in the dark new era.';
        m.classList.remove('hidden');
      }
    }},
    { id: 'bonfire_safe_zone', x: 2270, y: 2870, width: 60, height: 60, label: "CONNER CADE'S BONFIRE SAFE ZONE", action: () => {
      const m = document.getElementById('npcModal');
      if (m) {
        document.getElementById('npcName').innerText = "CONNER CADE'S CREATIVE BONFIRE";
        document.getElementById('npcRole').innerText = 'NEUTRAL CREATIVE REFUGE';
        document.getElementById('npcAvatarIcon').innerText = '🔥';
        document.getElementById('npcDialogueText').innerText = "Warm orange light flickers against the wet asphalt. Enemies cannot aggro inside this perimeter. Creatives from Milwaukee's underground gather here to share unreleased mixes and plan the next visual drops.";
        m.classList.remove('hidden');
      }
    }},
    { id: 'rust_sanctuary_clinic', x: 2010, y: 420, width: 160, height: 110, label: 'RUST SANCTUARY BIO-CLINIC [FULL HEAL]', action: () => {
      if (window.Entities && Entities.player) {
        Entities.player.hp = Entities.player.maxHp;
        if (typeof Entities.updatePlayerHealthUI === 'function') Entities.updatePlayerHealthUI();
      }
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
      if (window.State) State.showToast("RUST SANCTUARY BIO-POD: HP FULLY RESTORED! 💚");
    }},
    { id: 'deep_void_terminal', x: 3120, y: 1320, width: 130, height: 80, label: 'ACCESS DEEP VOID MAINFRAME', action: () => {
      const m = document.getElementById('npcModal');
      if (m) {
        document.getElementById('npcName').innerText = 'DEEP VOID DATA VAULT // NODE 05';
        document.getElementById('npcRole').innerText = 'SUBMERGED AIR-GAPPED MAINFRAME';
        document.getElementById('npcAvatarIcon').innerText = '🖥️';
        document.getElementById('npcDialogueText').innerText = 'ENCRYPTED TELEMETRY VERIFIED: All 6 Wasteland World Bosses (Blade-Zero, Chem-Enforcer, Drone Queen, Vulcan-808, Sub-Zero, and Archon Vex) are broadcasting live coordinates to your tactical radar.';
        m.classList.remove('hidden');
      }
    }},
    { id: 'trunk_drop', x: 1700, y: 1850, width: 140, height: 70, label: 'BURNED-OUT TRUNK DROP', action: () => { const m = document.getElementById('merchModal'); if (m) m.classList.remove('hidden'); } },
    { id: 'cassette_drop', x: 4900, y: 650, width: 140, height: 70, label: 'CASSETTE AIR-DROP CLAIM', action: () => { const m = document.getElementById('cassetteClaimModal'); if (m) m.classList.remove('hidden'); } },
    { id: 'gated_rift', x: 3120, y: 150, width: 180, height: 100, label: 'NEURAL EXTRACTION GATE [50 TAPES]', action: () => {
      if (window.State) State.updateHud();
      const m = document.getElementById('gatedModal');
      if (m) m.classList.remove('hidden');
    }}
  ],

  // =========================================================================
  // 4. CHAPTER III // THE HORIZON DIMENSION (3600 x 2400 px Astral Citadel)
  // =========================================================================
  horizonObstacles: [
    { x: 0, y: 0, width: 3600, height: 45, label: "HORIZON PERIMETER NORTH" },
    { x: 0, y: 2355, width: 3600, height: 45, label: "HORIZON PERIMETER SOUTH" },
    { x: 0, y: 0, width: 45, height: 2400, label: "HORIZON PERIMETER WEST" },
    { x: 3555, y: 0, width: 45, height: 2400, label: "HORIZON PERIMETER EAST" },

    // Astral Sovereign Keep (Northern Star Castle, X: 1200-2400, Y: 200-950)
    { x: 1200, y: 200, width: 1200, height: 40, label: "ASTRAL KEEP NORTH CREST" },
    { x: 1200, y: 200, width: 40, height: 750, label: "ASTRAL KEEP WEST TOWER" },
    { x: 2360, y: 200, width: 40, height: 750, label: "ASTRAL KEEP EAST TOWER" },
    { x: 1200, y: 910, width: 480, height: 40, label: "ASTRAL KEEP GATE WEST" },
    { x: 1920, y: 910, width: 480, height: 40, label: "ASTRAL KEEP GATE EAST" },

    // Zero-G Mastering Sanctum (West Wing, X: 250-1000, Y: 750-1500)
    { x: 250, y: 750, width: 750, height: 35, label: "ZERO-G SANCTUM NORTH" },
    { x: 250, y: 750, width: 35, height: 750, label: "ZERO-G SANCTUM WEST" },
    { x: 250, y: 1465, width: 750, height: 35, label: "ZERO-G SANCTUM SOUTH" },
    { x: 965, y: 750, width: 35, height: 280, label: "SANCTUM PORTAL WALL (N)" },
    { x: 965, y: 1220, width: 35, height: 280, label: "SANCTUM PORTAL WALL (S)" },

    // Syndicate Archive Bastion (East Wing, X: 2600-3350, Y: 750-1500)
    { x: 2600, y: 750, width: 750, height: 35, label: "ARCHIVE BASTION NORTH" },
    { x: 3315, y: 750, width: 35, height: 750, label: "ARCHIVE BASTION EAST" },
    { x: 2600, y: 1465, width: 750, height: 35, label: "ARCHIVE BASTION SOUTH" },
    { x: 2600, y: 750, width: 35, height: 280, label: "BASTION GATE WALL (N)" },
    { x: 2600, y: 1220, width: 35, height: 280, label: "BASTION GATE WALL (S)" },

    // Starlight Bridge Pylons (Central Conduit)
    { x: 1480, y: 1320, width: 70, height: 320, label: "PRISMATIC PYLON WEST" },
    { x: 2050, y: 1320, width: 70, height: 320, label: "PRISMATIC PYLON EAST" }
  ],

  horizonChests: [
    { id: "hc1", x: 1780, y: 290, width: 44, height: 34, type: "master_holding", label: "ASTRAL THRONE MASTER VAULT", skinReward: "the_creator", opened: false },
    { id: "hc2", x: 420, y: 1080, width: 40, height: 32, type: "vault", label: "ZERO-G ACOUSTIC VAULT", skinReward: "grandmaster_producer", opened: false },
    { id: "hc3", x: 3120, y: 1080, width: 40, height: 32, type: "vault", label: "ARCHIVE BASTION VAULT", skinReward: "lowlife_legend", opened: false },
    { id: "hc4", x: 1320, y: 340, width: 38, height: 30, type: "biohazard", label: "CELESTIAL AMBER CACHE", opened: false }
  ],

  horizonZones: [
    { id: 'portal_wasteland_return', x: 1760, y: 2180, width: 80, height: 80, label: 'WARP: ASHEN WASTELAND', action: () => { if (window.State) State.switchDimension('wasteland', 3170, 280); } },
    { id: 'portal_underground_return', x: 1520, y: 2180, width: 80, height: 80, label: 'WARP: UNDERGROUND HUB', action: () => { if (window.State) State.switchDimension('underground', 350, 750); } },
    { id: 'zero_g_console', x: 520, y: 920, width: 180, height: 90, label: 'ZERO-G MASTERING SANCTUM [OVERDRIVE + HEAL]', action: () => {
      if (window.Entities && Entities.player) {
        Entities.player.hp = Entities.player.maxHp;
        if (typeof Entities.updatePlayerHealthUI === 'function') Entities.updatePlayerHealthUI();
      }
      if (window.State && State.userProfile) {
        State.userProfile.djOverdriveTimer = 10800;
        State.userProfile.hyperchargeTimer = 600;
        State.save();
        State.showToast("ASTRAL RESONANCE ENGAGED: FULL HP + HYPERCHARGE + 3M OVERDRIVE! 🌌⚡");
      }
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('win');
    }}
  ],

  getActiveObstacles() {
    if (window.State && State.currentDimension === 'horizon') return this.horizonObstacles;
    if (window.State && State.currentDimension === 'wasteland') return this.worldObstacles;
    if (window.State && State.currentDimension === 'retrocade') return this.retrocadeObstacles;
    return this.undergroundObstacles;
  },

  getActiveDoorways() {
    if (window.State && State.currentDimension === 'underground') return this.undergroundDoorways;
    return [];
  },

  getActiveChests() {
    if (window.State && State.currentDimension === 'horizon') return this.horizonChests;
    if (window.State && State.currentDimension === 'wasteland') return this.wastelandChests;
    return [];
  },

  getActiveZones() {
    let zones = [];
    if (window.State && State.currentDimension === 'horizon') zones = [...this.horizonZones];
    else if (window.State && State.currentDimension === 'wasteland') zones = [...this.wastelandZones];
    else if (window.State && State.currentDimension === 'retrocade') zones = [...this.retrocadeZones];
    else zones = [...this.undergroundZones];

    if (window.State && Array.isArray(State.loreTapes)) {
      State.loreTapes.forEach(t => {
        if (t.dim === State.currentDimension) {
          zones.push({
            id: t.id,
            x: t.x - 25, 
            y: t.y - 25, 
            width: 50, 
            height: 50,
            label: `LISTEN TO ${t.title}`,
            action: () => State.inspectLoreTape(t)
          });
        }
      });
    }

    return zones;
  }
};

window.Dimensions = Dimensions;
