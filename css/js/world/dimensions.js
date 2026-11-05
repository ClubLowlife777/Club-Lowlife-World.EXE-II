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

  worldObstacles: [
    { x: 0, y: 0, width: 3200, height: 40 }, { x: 0, y: 2360, width: 3200, height: 40 },
    { x: 0, y: 0, width: 40, height: 2400 }, { x: 3160, y: 0, width: 40, height: 2400 },
    { x: 1200, y: 900, width: 350, height: 160, label: "COMMERCE MONOLITH" },
    { x: 1750, y: 900, width: 350, height: 160, label: "REFINERY ANNEX" },
    { x: 500, y: 1350, width: 360, height: 260, label: "SUBSTANCE SILO 07" },
    { x: 2300, y: 1350, width: 380, height: 260, label: "CASSETTE PRESSING RUINS" },
    { x: 200, y: 600, width: 20, height: 300 }, { x: 200, y: 600, width: 250, height: 20 },
    { x: 200, y: 900, width: 250, height: 20 }, { x: 450, y: 600, width: 20, height: 100 }, { x: 450, y: 800, width: 20, height: 120 }
  ],

  destructibleDoors: [
    { id: "pipeline_breach", x: 450, y: 700, width: 20, height: 100, hp: 120, maxHp: 120, shattered: false, label: "DRAINAGE BREACH" }
  ],

  undergroundZones: [
    { id: 'disco_room', x: 70, y: 140, width: 160, height: 100, label: 'DISCOGRAPHY VAULT', action: () => document.getElementById('discoModal').classList.remove('hidden') },
    { id: 'portal_retrocade', x: 1440, y: 640, width: 80, height: 80, label: 'WARP: RETROCADE NEON', action: () => State.switchDimension('retrocade', 750, 750) },
    { id: 'truck_merch', x: 180, y: 720, width: 140, height: 80, label: 'TRUNK POP // MERCH', action: () => document.getElementById('merchModal').classList.remove('hidden') },
    { id: 'arcade_galaga', x: 500, y: 60, width: 70, height: 70, label: 'PLAY VOID INVADERS [5🪙]', action: () => VoidInvaders.start() },
    { id: 'arcade_pacman', x: 620, y: 60, width: 70, height: 70, label: 'PLAY GRID RUNNER [5🪙]', action: () => GridRunner.start() },
    { id: 'arcade_mario', x: 740, y: 60, width: 70, height: 70, label: 'PLAY LOWLIFE LEAP [5🪙]', action: () => LowlifeLeap.start() },
    { id: 'cache_underground', x: 880, y: 60, width: 40, height: 40, label: 'SEARCH ARCADE CRATES', action: () => Entities.claimSecretCache('underground') }
  ],

  retrocadeZones: [
    { id: 'portal_underground', x: 100, y: 840, width: 80, height: 80, label: 'WARP: UNDERGROUND', action: () => State.switchDimension('underground', 320, 750) },
    { id: 'portal_wasteland', x: 750, y: 840, width: 80, height: 80, label: 'WARP: WASTELAND RUINS', action: () => State.switchDimension('wasteland', 1600, 1200) },
    { id: 'casino_slots', x: 1080, y: 130, width: 160, height: 80, label: 'CASINO SLOTS [5🪙]', action: () => CasinoGame.open() },
    { id: 'cache_retrocade', x: 920, y: 190, width: 40, height: 40, label: 'SEARCH VIP STAGE CURTAINS', action: () => Entities.claimSecretCache('retrocade') }
  ],

  wastelandZones: [
    { id: 'portal_retrocade_back', x: 1600, y: 2300, width: 80, height: 80, label: 'WARP: RETROCADE', action: () => State.switchDimension('retrocade', 750, 750) },
    { id: 'trunk_drop', x: 520, y: 1300, width: 140, height: 70, label: 'BURNED-OUT TRUNK DROP', action: () => document.getElementById('merchModal').classList.remove('hidden') },
    { id: 'cassette_drop', x: 2350, y: 1300, width: 140, height: 70, label: 'CASSETTE AIR-DROP FORM', action: () => document.getElementById('cassetteClaimModal').classList.remove('hidden') },
    { id: 'gated_rift', x: 1520, y: 150, width: 160, height: 100, label: 'EXTRACTION GATE [50 TAPES]', action: () => document.getElementById('gatedModal').classList.remove('hidden') }
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
