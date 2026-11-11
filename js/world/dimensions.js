/**
 * CLUB LOWLIFE // UNIVERSE DIMENSIONS & COLLISION MATRICES
 * File: js/world/dimensions.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Physics
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
    { id: 'disco_room', x: 880, y: 120, width: 160, height: 100, label: 'DISCOGRAPHY VAULT', action: () => { const m = document.getElementById('discoModal'); if (m) m.classList.remove('hidden'); } },
    { id: 'portal_retrocade', x: 2200, y: 900, width: 80, height: 80, label: 'WARP: RETROCADE DISTRICT 84', action: () => { if (window.State) State.switchDimension('retrocade', 1200, 750); } },
    { id: 'truck_merch', x: 180, y: 200, width: 150, height: 90, label: 'TRUNK POP // MERCH', action: () => { const m = document.getElementById('merchModal'); if (m) m.classList.remove('hidden'); } },
    { id: 'arcade_galaga', x: 1650, y: 120, width: 70, height: 70, label: 'PLAY VOID INVADERS [5🪙]', action: () => { if (window.VoidInvaders) VoidInvaders.start(); } },
    { id: 'arcade_pacman', x: 1800, y: 120, width: 70, height: 70, label: 'PLAY GRID RUNNER [5🪙]', action: () => { if (window.GridRunner) GridRunner.start(); } },
    { id: 'arcade_mario', x: 1950, y: 120, width: 70, height: 70, label: 'PLAY LOWLIFE LEAP [5🪙]', action: () => { if (window.LowlifeLeap) LowlifeLeap.start(); } }
  ],

  // =========================================================================
  // 2. DISTRICT 84 // RETROCADE (2400 x 1200 px Neon Lounge)
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
    { id: 'music_kiosk_lounge', x: 260, y: 220, width: 160, height: 100, label: 'CLUB LOWLIFE MUSIC KIOSK', action: () => { const m = document.getElementById('discoModal'); if (m) m.classList.remove('hidden'); } },
    { id: 'casino_slots_classic', x: 1880, y: 180, width: 130, height: 70, label: 'CLASSIC 3-REEL SLOTS [5🪙]', action: () => { if (window.CasinoGame) CasinoGame.open('classic'); } },
    { id: 'casino_slots_highroller', x: 2120, y: 180, width: 150, height: 70, label: 'HIGH-ROLLER 5-LANE SLOTS [25🪙]', action: () => { if (window.CasinoGame) CasinoGame.open('highroller'); } }
  ],

  // =========================================================================
  // 3. THE ASHEN WASTELAND (6400 x 4800 px Corruption Battleground)
  // =========================================================================
  worldObstacles: [
    { x: 0, y: 0, width: 6400, height: 50, label: "WASTELAND PERIMETER NORTH" },
    { x: 0, y: 4750, width: 6400, height: 50, label: "WASTELAND PERIMETER SOUTH" },
    { x: 0, y: 0, width: 50, height: 4800, label: "WASTELAND PERIMETER WEST" },
    { x: 6350, y: 0, width: 50, height: 4800, label: "WASTELAND PERIMETER EAST" },

    // Highway Overpass
    { x: 600, y: 800, width: 40, height: 180, label: "HIGHWAY PILLAR NW" },
    { x: 600, y: 800, width: 900, height: 40, label: "ELEVATED HIGHWAY DECK" },
    { x: 1500, y: 800, width: 40, height: 750, label: "HIGHWAY PILLAR EAST" },

    // Northern Obsidian Canyon
    { x: 4200, y: 400, width: 1600, height: 140, label: "OBSIDIAN PLATEAU" },
    { x: 4200, y: 540, width: 140, height: 700, label: "CANYON WEST WALL" },
    { x: 5660, y: 540, width: 140, height: 700, label: "CANYON EAST WALL" },
    { x: 4500, y: 1100, width: 350, height: 120, label: "CANYON LEDGE WEST" },
    { x: 4970, y: 1100, width: 530, height: 120, label: "CANYON LEDGE EAST" },

    // Substance Silo 07 Complex
    { x: 1000, y: 1800, width: 650, height: 350, label: "SUBSTANCE SILO 07" },
    { x: 800, y: 2300, width: 400, height: 200, label: "CHEMICAL VATS" },
    { x: 1800, y: 2100, width: 450, height: 180, label: "REFINERY ANNEX" },

    // Martian University Research Annex (160px Southern Entrance Gap at X: 2320-2480)
    { x: 2100, y: 1200, width: 600, height: 35, label: "MARTIAN UNIV. LAB NORTH" },
    { x: 2100, y: 1200, width: 35, height: 500, label: "MARTIAN UNIV. WEST WALL" },
    { x: 2665, y: 1200, width: 35, height: 500, label: "MARTIAN UNIV. EAST WALL" },
    { x: 2100, y: 1665, width: 220, height: 35, label: "MARTIAN UNIV. SOUTH (W)" },
    { x: 2480, y: 1665, width: 220, height: 35, label: "MARTIAN UNIV. SOUTH (E)" },

    // Sector 777 Overlook ("Living on the Highs") (180px Western Entrance Gap at Y: 2510-2690)
    { x: 3800, y: 2300, width: 600, height: 35, label: "SECTOR 777 LOUNGE NORTH" },
    { x: 4365, y: 2300, width: 35, height: 550, label: "SECTOR 777 EAST WALL" },
    { x: 3800, y: 2815, width: 600, height: 35, label: "SECTOR 777 SOUTH WALL" },
    { x: 3800, y: 2300, width: 35, height: 210, label: "SECTOR 777 WEST (N)" },
    { x: 3800, y: 2690, width: 35, height: 160, label: "SECTOR 777 WEST (S)" },

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
    { x: 3700, y: 4265, width: 350, height: 35, label: "WASHROOM SOUTH WALL" }
  ],

  destructibleDoors: [
    { id: "drainage_breach", x: 3160, y: 4365, width: 180, height: 35, hp: 160, maxHp: 160, shattered: false, label: "REINFORCED DRAINAGE BREACH [160 HP]" },
    { id: "cave_rubble", x: 4850, y: 1100, width: 120, height: 40, hp: 120, maxHp: 120, shattered: false, label: "CAVE BOULDERS [120 HP]" }
  ],

  environmentalHazards: [
    { x: 1100, y: 2150, width: 500, height: 160, type: 'sludge', label: 'CHEMICAL SLUDGE PIT 01' },
    { x: 1800, y: 2280, width: 380, height: 140, type: 'sludge', label: 'CHEMICAL SLUDGE PIT 02' },
    { x: 4400, y: 900, width: 280, height: 180, type: 'sludge', label: 'TOXIC DISCHARGE RUNOFF' }
  ],

  wastelandChests: [
    { id: "c1", x: 800, y: 650, width: 36, height: 28, type: "supply", label: "HIGHWAY SUPPLY CRATE", opened: false },
    { id: "c2", x: 1600, y: 1950, width: 38, height: 30, type: "biohazard", label: "SILO 07 HAZMAT CACHE", opened: false },
    { id: "c3", x: 5500, y: 700, width: 40, height: 32, type: "vault", label: "OBSOLETE CAVE VAULT", skinReward: "cave_stalker", opened: false },
    { id: "c4", x: 3220, y: 3950, width: 44, height: 34, type: "master_holding", label: "GOLDEN MASTER VAULT", skinReward: "static_nightmare", opened: false },
    { id: "c5", x: 2380, y: 1320, width: 40, height: 32, type: "vault", label: "MARTIAN UNIVERSITY ARCHIVE VAULT", skinReward: "sound_designer", opened: false },
    { id: "c6", x: 4220, y: 2450, width: 40, height: 32, type: "vault", label: "SECTOR 777 VIP STASH", skinReward: "jackpot_777", opened: false },
    { id: "c7", x: 3920, y: 4180, width: 38, height: 30, type: "biohazard", label: "WASHROOM AMBER VIAL CACHE", opened: false },
    { id: "c8", x: 920, y: 1420, width: 36, height: 28, type: "supply", label: "OVERPASS DROP CRATE", opened: false }
  ],

  wastelandZones: [
    { id: 'portal_retrocade_back', x: 650, y: 1020, width: 80, height: 80, label: 'WARP: RETROCADE DISTRICT 84', action: () => { if (window.State) State.switchDimension('retrocade', 1200, 750); } },
    { id: 'getaway_van_log', x: 460, y: 1080, width: 130, height: 75, label: 'INSPECT EXTRACTION GETAWAY VAN', action: () => {
      const m = document.getElementById('npcModal');
      if (m) {
        document.getElementById('npcName').innerText = 'EXTRACTION TRANSIT LOG // SCENE 01';
        document.getElementById('npcRole').innerText = 'SYNDICATE DISPATCH ARCHIVE';
        document.getElementById('npcAvatarIcon').innerText = '🚐';
        document.getElementById('npcDialogueText').innerText = 'Headlights cut through the heavy rain haze[cite: 14]. The trunk latch is popped—heavy combat boots left tracks leading toward the Subterranean Holding Chamber in the south[cite: 14]. The old colorful Retrocade self is being held inside[cite: 14].';
        m.classList.remove('hidden');
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
        document.getElementById('npcDialogueText').innerText = '[PRESSURIZED AIR HISS] You unlatch the side seals and lift the matte-black helmet in front of the cracked glass[cite: 14]. The captor holding the old era hostage was never an outsider—it is you, stripped of color, ushering in the dark new era[cite: 14].';
        m.classList.remove('hidden');
      }
    }},
    { id: 'bonfire_safe_zone', x: 2180, y: 2780, width: 240, height: 240, label: "CONNER CADE'S BONFIRE SAFE ZONE", action: () => {
      const m = document.getElementById('npcModal');
      if (m) {
        document.getElementById('npcName').innerText = "CONNER CADE'S CREATIVE BONFIRE";
        document.getElementById('npcRole').innerText = 'NEUTRAL CREATIVE REFUGE';
        document.getElementById('npcAvatarIcon').innerText = '🔥';
        document.getElementById('npcDialogueText').innerText = "Warm orange light flickers against the wet asphalt[cite: 12, 14]. Enemies cannot aggro inside this perimeter. Creatives from Milwaukee's underground gather here to share unreleased mixes and plan the next visual drops[cite: 12, 14].";
        m.classList.remove('hidden');
      }
    }},
    { id: 'trunk_drop', x: 1700, y: 1850, width: 140, height: 70, label: 'BURNED-OUT TRUNK DROP', action: () => { const m = document.getElementById('merchModal'); if (m) m.classList.remove('hidden'); } },
    { id: 'cassette_drop', x: 4900, y: 650, width: 140, height: 70, label: 'CASSETTE AIR-DROP CLAIM', action: () => { const m = document.getElementById('cassetteClaimModal'); if (m) m.classList.remove('hidden'); } },
    { id: 'gated_rift', x: 3120, y: 150, width: 180, height: 100, label: 'NEURAL EXTRACTION GATE [50 TAPES]', action: () => { const m = document.getElementById('gatedModal'); if (m) m.classList.remove('hidden'); } }
  ],

  getActiveObstacles() {
    if (window.State && State.currentDimension === 'wasteland') return this.worldObstacles;
    if (window.State && State.currentDimension === 'retrocade') return this.retrocadeObstacles;
    return this.undergroundObstacles;
  },

  getActiveDoorways() {
    if (window.State && State.currentDimension === 'underground') return this.undergroundDoorways;
    return [];
  },

  getActiveZones() {
    let zones = [];
    if (window.State && State.currentDimension === 'wasteland') zones = [...this.wastelandZones];
    else if (window.State && State.currentDimension === 'retrocade') zones = [...this.retrocadeZones];
    else zones = [...this.undergroundZones];

    // Append Lore Cassettes active in current dimension
    if (window.State && Array.isArray(State.loreTapes)) {
      State.loreTapes.forEach(t => {
        if (t.dim === State.currentDimension) {
          zones.push({
            id: t.id,
            x: t.x - 20, y: t.y - 20, width: 40, height: 40,
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
