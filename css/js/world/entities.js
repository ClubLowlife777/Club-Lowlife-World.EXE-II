const Entities = {
  player: {
    x: 320, y: 750, width: 24, height: 36,
    direction: 'down',
    baseSpeed: 6.5,
    sprintSpeed: 9.5,
    hp: 100, maxHp: 100,
    iFrames: 0,
    knockbackVx: 0, knockbackVy: 0,
    isMoving: false, animTimer: 0,
    danceTimer: 0
  },

  friendlyNpcs: {
    underground: [
      { id: 'mech', x: 330, y: 750, width: 24, height: 36, name: 'HYPE MECHANIC', role: 'STREET ENFORCER', icon: '🔧', dialogue: "The trunk is unlocked in the bay. Use code WASTELAND15 for 15% off official syndicate merch.", color: '#10b981' },
      { id: 'arcade_guy', x: 460, y: 80, width: 24, height: 36, name: 'CABINET GEEKER', role: 'ARCADE TECH', icon: '🕹️', dialogue: "Tokens are 5 coins a run. Watch out for the purple drone in Grid Runner—it predicts your turns to corner you.", color: '#00f0ff' }
    ],
    retrocade: [
      { id: 'dj', x: 740, y: 190, width: 28, height: 36, name: 'DJ LOWLIFE', role: 'RESIDENT RECORD CUTTER', icon: '🎧', dialogue: "Mastering 'DANCING' through these tubes. Dance on beat on the floor to mine free Sound Tokens.", color: '#ec4899' },
      { id: 'high_roller', x: 1040, y: 150, width: 24, height: 36, name: 'CHIP DRIFTER', role: 'VIP SYNDICATE', icon: '🎰', dialogue: "Hit triple cassettes on the cyber reels for a 100 token payout and 2 Rare Battle Cassettes.", color: '#facc15' }
    ]
  },

  cachesClaimed: [],
  hostileNpcs: [],
  lootPickups: [],

  init() {
    for (let i = 0; i < 15; i++) this.spawnWastelandNpc();
    setInterval(() => this.spawnWastelandNpc(), 3500);
  },

  claimSecretCache(worldId) {
    if (this.cachesClaimed.includes(worldId)) {
      State.showToast("CACHE ALREADY SEARCHED!");
      return;
    }
    this.cachesClaimed.push(worldId);
    AudioEngine.playSfx('win');
    if (worldId === 'underground') {
      State.addTokens(45);
      State.addRareTape();
      State.showToast("SECRET STASH FOUND! +45 TOKENS & +1 RARE CASSETTE! 📼");
    } else {
      State.addTokens(80);
      State.showToast("VIP CACHE RAIDED! +80 SOUND TOKENS! 🪙");
    }
  },

  spawnWastelandNpc() {
    if (State.currentDimension !== 'wasteland') return;
    if (this.hostileNpcs.filter(n => n.alive).length >= 22) return;
    const spawnX = 300 + Math.random() * (3200 - 600);
    const spawnY = 300 + Math.random() * (2400 - 600);
    const types = ['drone', 'enforcer', 'corrupt_hacker'];
    const type = types[Math.floor(Math.random() * types.length)];

    this.hostileNpcs.push({
      x: spawnX, y: spawnY, width: 24, height: 36,
      type: type, hp: type === 'drone' ? 40 : 80, maxHp: type === 'drone' ? 40 : 80,
      speed: type === 'drone' ? 2.2 : 3.0,
      alive: true, state: 'peaceful', aggroTimer: 0, attackCooldown: 0,
      knockbackVx: 0, knockbackVy: 0,
      dir: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
      moveTimer: 40
    });
  },

  update() {
    const p = this.player;
    if (p.iFrames > 0) p.iFrames--;

    const speed = Input.keys.shift ? p.sprintSpeed : p.baseSpeed;
    let dx = 0, dy = 0;

    if (Input.analogVector.active) {
      dx = Input.analogVector.x; dy = Input.analogVector.y;
    } else {
      if (Input.keys.up) dy -= 1;
      if (Input.keys.down) dy += 1;
      if (Input.keys.left) dx -= 1;
      if (Input.keys.right) dx += 1;
      if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
    }

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      p.isMoving = true;
      p.animTimer++;
      if (Math.abs(dx) > Math.abs(dy)) p.direction = dx > 0 ? 'right' : 'left';
      else p.direction = dy > 0 ? 'down' : 'up';

      const nx = p.x + dx * speed;
      const ny = p.y + dy * speed;
      const boxX = { x: nx, y: p.y, width: p.width, height: p.height };
      const boxY = { x: p.x, y: ny, width: p.width, height: p.height };

      let colX = false, colY = false;
      const obs = Dimensions.getActiveObstacles();
      for (let o of obs) {
        if (Combat.checkCollision(boxX, o)) colX = true;
        if (Combat.checkCollision(boxY, o)) colY = true;
      }
      if (!colX) p.x = nx;
      if (!colY) p.y = ny;
    } else {
      p.isMoving = false;
    }

    // Dance floor token mining
    if (State.currentDimension === 'retrocade' && p.x > 650 && p.x < 950 && p.y > 450 && p.y < 750) {
      p.danceTimer++;
      if (p.danceTimer % 180 === 0) {
        State.addTokens(1);
        AudioEngine.playSfx('coin');
        State.showToast("DANCE FLOOR GROOVE: +1 TOKEN! 💃");
      }
    }
  }
};
