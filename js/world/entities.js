const Entities = {
  player: {
    x: 320, y: 750, width: 26, height: 38,
    direction: 'down',
    baseSpeed: 5.5,
    sprintSpeed: 8.5,
    hp: 100, maxHp: 100,
    iFrames: 0,
    knockbackVx: 0, knockbackVy: 0,
    isMoving: false, animTimer: 0,
    danceTimer: 0
  },

  friendlyNpcs: {
    underground: [
      { id: 'mech', x: 330, y: 750, width: 26, height: 38, name: 'HYPE MECHANIC', role: 'STREET ENFORCER', icon: '🔧', dialogue: "The trunk is popped in the bay. Use code WASTELAND15 for 15% off official apparel drops[cite: 2, 6].", color: '#10b981' },
      { id: 'arcade_guy', x: 450, y: 80, width: 26, height: 38, name: 'ARCADE TECH', role: 'NEO-GEO REPAIR', icon: '🕹️', dialogue: "Tokens are 5 coins a run. Watch out for the purple flanker in Grid Runner—it cuts off your exit turns.", color: '#00f0ff' },
      { id: 'beatmaker', x: 230, y: 150, width: 26, height: 38, name: 'STUDIO PRODUCER', role: 'MASTER ENGINEER', icon: '🎛️', dialogue: "We dialed in the 808s on 'DANCING' for phone speakers and stadium sound systems[cite: 4, 8]. Check the stems.", color: '#f59e0b' }
    ],
    retrocade: [
      { id: 'dj', x: 740, y: 190, width: 30, height: 40, name: 'DJ LOWLIFE', role: 'RESIDENT RECORD CUTTER', icon: '🎧', dialogue: "Mastering 'DANCING' live through the tubes[cite: 4, 6]. Groove on beat on the floor to mine free Sound Tokens.", color: '#ec4899' },
      { id: 'high_roller', x: 1040, y: 150, width: 26, height: 38, name: 'CHIP DRIFTER', role: 'VIP SYNDICATE', icon: '🎰', dialogue: "Triple cassettes on the cyber reels pays out 100 tokens and 2 Rare Battle Cassettes[cite: 4].", color: '#facc15' },
      // 6 Dancing Crowd NPCs with Rhythm Offsets
      { id: 'dancer_1', x: 670, y: 480, width: 24, height: 36, name: 'RAVER NEON', role: 'CLUBBER', icon: '💃', dialogue: "This bassline bounce hits different in District 84[cite: 4].", color: '#00f0ff', dancePhase: 0 },
      { id: 'dancer_2', x: 750, y: 520, width: 24, height: 36, name: 'BASS ADDICT', role: 'CLUBBER', icon: '🕺', dialogue: "Keep moving! The floor pulses every four beats.", color: '#a855f7', dancePhase: 1 },
      { id: 'dancer_3', x: 820, y: 480, width: 24, height: 36, name: 'CYBER GOTH', role: 'CLUBBER', icon: '💃', dialogue: "Club Lowlife never closes its rifts.", color: '#ec4899', dancePhase: 2 },
      { id: 'dancer_4', x: 700, y: 580, width: 24, height: 36, name: 'GLOW RUNNER', role: 'CLUBBER', icon: '🕺', dialogue: "I heard there is a secret holding chamber out in the wasteland.", color: '#facc15', dancePhase: 3 },
      { id: 'dancer_5', x: 790, y: 580, width: 24, height: 36, name: 'VIP PATRON', role: 'CLUBBER', icon: '🍸', dialogue: "The 50 cassette gate leads to the next dimension[cite: 4].", color: '#10b981', dancePhase: 4 },
      { id: 'dancer_6', x: 750, y: 640, width: 24, height: 36, name: 'SYNTH DRIFTER', role: 'CLUBBER', icon: '💃', dialogue: "Dancing unlocks hidden audio mixes[cite: 4].", color: '#ff7700', dancePhase: 5 }
    ]
  },

  hostileNpcs: [],
  lootPickups: [],

  init() {
    this.spawnWastelandBosses();
    for (let i = 0; i < 28; i++) this.spawnWastelandPatrol();
    setInterval(() => this.spawnWastelandPatrol(), 4000);
  },

  spawnWastelandBosses() {
    // World Boss: High Executioner "Blade-Zero" in The Holding Chamber
    this.hostileNpcs.push({
      id: 'boss_blade_zero', isBoss: true, name: 'HIGH EXECUTIONER "BLADE-ZERO"',
      x: 3200, y: 4100, width: 36, height: 50,
      type: 'boss_blade', hp: 1500, maxHp: 1500, speed: 3.6,
      alive: true, state: 'peaceful', aggroTimer: 0, attackCooldown: 0,
      knockbackVx: 0, knockbackVy: 0, color: '#ff003c', phase: 1
    });

    // Mini-Boss: Chem-Enforcer Unit 09 at Silo 07
    this.hostileNpcs.push({
      id: 'boss_chem_enforcer', isBoss: true, name: 'CHEM-ENFORCER UNIT 09',
      x: 1400, y: 2200, width: 34, height: 46,
      type: 'boss_chem', hp: 500, maxHp: 500, speed: 2.5,
      alive: true, state: 'peaceful', aggroTimer: 0, attackCooldown: 0,
      knockbackVx: 0, knockbackVy: 0, color: '#84cc16', phase: 1
    });

    // Mini-Boss: The Hollow Drone Queen in Obsidian Caves
    this.hostileNpcs.push({
      id: 'boss_drone_queen', isBoss: true, name: 'THE HOLLOW DRONE QUEEN',
      x: 4800, y: 800, width: 38, height: 44,
      type: 'boss_queen', hp: 650, maxHp: 650, speed: 3.0,
      alive: true, state: 'peaceful', aggroTimer: 0, attackCooldown: 0,
      knockbackVx: 0, knockbackVy: 0, color: '#00f0ff', phase: 1
    });
  },

  spawnWastelandPatrol() {
    if (State.currentDimension !== 'wasteland') return;
    if (this.hostileNpcs.filter(n => n.alive && !n.isBoss).length >= 35) return;

    const spawnX = 400 + Math.random() * (6400 - 800);
    const spawnY = 400 + Math.random() * (4800 - 800);
    const types = ['drone', 'enforcer', 'corrupt_hacker'];
    const type = types[Math.floor(Math.random() * types.length)];

    this.hostileNpcs.push({
      id: Math.random().toString(36).substr(2, 9),
      isBoss: false,
      x: spawnX, y: spawnY, width: 26, height: 38,
      type: type, hp: type === 'drone' ? 50 : 100, maxHp: type === 'drone' ? 50 : 100,
      speed: type === 'drone' ? 2.4 : 3.0,
      alive: true, state: 'peaceful', aggroTimer: 0, attackCooldown: 0,
      knockbackVx: 0, knockbackVy: 0,
      dir: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
      moveTimer: 45
    });
  },

  damageNpc(npc, amount, knockDir) {
    if (!npc.alive) return;
    npc.hp -= amount;
    AudioEngine.playSfx('stomp');
    npc.state = 'aggro';
    npc.aggroTimer = 350;

    const force = npc.isBoss ? 2 : 7;
    if (knockDir === 'up') npc.knockbackVy = -force;
    else if (knockDir === 'down') npc.knockbackVy = force;
    else if (knockDir === 'left') npc.knockbackVx = -force;
    else if (knockDir === 'right') npc.knockbackVx = force;

    if (npc.hp <= 0) {
      npc.alive = false;
      this.spawnLoot(npc.x + npc.width / 2, npc.y + npc.height / 2, npc.isBoss, npc.id);
      if (npc.isBoss) {
        State.showToast(`BOSS DEFEATED: ${npc.name}! 🏆`);
        State.triggerScreenShake(18, 35);
      }
    }
  },

  spawnLoot(lx, ly, isBoss, bossId) {
    const coinCount = isBoss ? 20 : (3 + Math.floor(Math.random() * 4));
    for (let i = 0; i < coinCount; i++) {
      this.lootPickups.push({
        x: lx + (Math.random() * 40 - 20), y: ly + (Math.random() * 40 - 20),
        type: 'coin', value: 5, radius: 6, floatOffset: Math.random() * Math.PI * 2
      });
    }

    if (isBoss) {
      for (let t = 0; t < 5; t++) {
        this.lootPickups.push({
          x: lx + (Math.random() * 50 - 25), y: ly + (Math.random() * 50 - 25),
          type: 'rare_tape', radius: 9, floatOffset: Math.random() * Math.PI * 2
        });
      }
      if (bossId === 'boss_blade_zero') State.unlockSkin('blade_zero');
      else if (bossId === 'boss_chem_enforcer') State.unlockSkin('chem_enforcer');
      else if (bossId === 'boss_drone_queen') State.unlockSkin('drone_whisperer');
    } else if (Math.random() < 0.35) {
      this.lootPickups.push({
        x: lx, y: ly, type: 'rare_tape', radius: 9, floatOffset: Math.random() * Math.PI * 2
      });
    }
  },

  openChest(c) {
    c.opened = true;
    AudioEngine.playSfx('win');
    State.triggerScreenShake(6, 12);

    if (c.type === 'supply') {
      State.addTokens(30);
      State.addRareTape();
      State.showToast("SYNDICATE CRATE: +30 TOKENS, +1 RARE CASSETTE! 📦[cite: 4]");
    } else if (c.type === 'biohazard') {
      State.addTokens(70);
      State.addRareTape();
      State.addRareTape();
      this.player.hp = this.player.maxHp;
      this.updatePlayerHealthUI();
      State.showToast("BIOHAZARD CACHE: +70 TOKENS, +2 TAPES, FULL HEAL! 🧪[cite: 4]");
    } else if (c.type === 'vault') {
      State.addTokens(150);
      State.addRareTape();
      State.addRareTape();
      State.addRareTape();
      State.unlockSkin(c.skinReward || 'drifter');
      State.showToast(`OBSOLETE VAULT: +150 TOKENS, +3 TAPES & NEW SKIN! 💎[cite: 4]`);
    } else if (c.type === 'master_holding') {
      State.addTokens(300);
      for (let i = 0; i < 10; i++) State.addRareTape();
      State.unlockSkin('static_nightmare');
      State.showToast("GOLDEN MASTER VAULT: UNCOMPRESSED 'DANCING' AUDIO & MYTHIC SKIN UNLOCKED! 💿⚡[cite: 4, 6]");
    }
    State.save();
  },

  damagePlayer(amount, knockDir) {
    const p = this.player;
    if (p.iFrames > 0) return;
    p.hp = Math.max(0, p.hp - amount);
    p.iFrames = 30;
    AudioEngine.playSfx('stomp');
    State.triggerScreenShake(7, 12);

    const force = 9;
    if (knockDir === 'up') p.knockbackVy = -force;
    else if (knockDir === 'down') p.knockbackVy = force;
    else if (knockDir === 'left') p.knockbackVx = -force;
    else if (knockDir === 'right') p.knockbackVx = force;

    this.updatePlayerHealthUI();

    if (p.hp <= 0) {
      State.showToast("NEURAL LINK SEVERED // RESPAWNING ENFORCER...");
      setTimeout(() => {
        p.x = State.currentDimension === 'wasteland' ? 800 : 320;
        p.y = State.currentDimension === 'wasteland' ? 800 : 750;
        p.hp = p.maxHp;
        this.updatePlayerHealthUI();
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

    // Hazardous Sludge Slowdown & Steam Damage
    let currentSpeed = Input.keys.shift ? p.sprintSpeed : p.baseSpeed;
    if (State.currentDimension === 'wasteland') {
      Dimensions.environmentalHazards.forEach(h => {
        if (h.type === 'sludge' && p.x > h.x && p.x < h.x + h.width && p.y > h.y && p.y < h.y + h.height) {
          currentSpeed *= 0.55;
          if (Math.random() < 0.05) this.damagePlayer(1, 'down');
        }
      });
    }

    // Decoupled Smooth Sliding Collision
    if (Math.abs(p.knockbackVx) > 0.1 || Math.abs(p.knockbackVy) > 0.1) {
      p.x += p.knockbackVx; p.y += p.knockbackVy;
      p.knockbackVx *= 0.82; p.knockbackVy *= 0.82;
    } else {
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

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        p.isMoving = true;
        p.animTimer++;
        if (Math.abs(dx) > Math.abs(dy)) p.direction = dx > 0 ? 'right' : 'left';
        else p.direction = dy > 0 ? 'down' : 'up';

        const moveSpeed = currentSpeed * (Input.analogVector.active ? Math.min(1, Math.hypot(dx, dy)) : 1);
        const newX = p.x + dx * moveSpeed;
        const newY = p.y + dy * moveSpeed;

        const boxX = { x: newX, y: p.y, width: p.width, height: p.height };
        const boxY = { x: p.x, y: newY, width: p.width, height: p.height };

        let colX = false, colY = false;
        const obs = Dimensions.getActiveObstacles();
        for (let o of obs) {
          if (Combat.checkCollision(boxX, o)) colX = true;
          if (Combat.checkCollision(boxY, o)) colY = true;
        }

        if (State.currentDimension === 'wasteland') {
          Dimensions.destructibleDoors.forEach(d => {
            if (!d.shattered) {
              if (Combat.checkCollision(boxX, d)) colX = true;
              if (Combat.checkCollision(boxY, d)) colY = true;
            }
          });
        }

        if (!colX) p.x = newX;
        if (!colY) p.y = newY;
      } else {
        p.isMoving = false;
      }
    }

    // Dance floor token generation
    if (State.currentDimension === 'retrocade' && p.x > 650 && p.x < 950 && p.y > 450 && p.y < 750) {
      p.danceTimer++;
      if (p.danceTimer % 160 === 0) {
        State.addTokens(1);
        AudioEngine.playSfx('coin');
        State.showToast("DANCE FLOOR GROOVE: +1 TOKEN! 💃");
      }
    }

    // Update Wasteland Mobs
    this.updateHostileAI();
    this.updateLootPickups();
  },

  updateHostileAI() {
    if (State.currentDimension !== 'wasteland') return;
    const p = this.player;

    this.hostileNpcs.forEach(n => {
      if (!n.alive) return;
      const dist = Math.hypot(p.x - n.x, p.y - n.y);

      if (dist < (n.isBoss ? 450 : 220) && n.state === 'peaceful') {
        n.state = 'aggro';
        n.aggroTimer = 250;
      }

      if (Math.abs(n.knockbackVx) > 0.1 || Math.abs(n.knockbackVy) > 0.1) {
        n.x += n.knockbackVx; n.y += n.knockbackVy;
        n.knockbackVx *= 0.8; n.knockbackVy *= 0.8;
        return;
      }

      if (n.attackCooldown > 0) n.attackCooldown--;

      if (n.state === 'aggro') {
        n.aggroTimer--;
        if (n.aggroTimer <= 0 && dist > 500) n.state = 'peaceful';

        const angle = Math.atan2(p.y - n.y, p.x - n.x);
        let vx = Math.cos(angle) * n.speed;
        let vy = Math.sin(angle) * n.speed;

        // Boss & Ranged Attacks
        if (n.type === 'drone' || n.type === 'boss_queen') {
          if (dist < 320 && n.attackCooldown <= 0) {
            n.attackCooldown = n.isBoss ? 45 : 75;
            AudioEngine.playSfx('laser');
            Combat.enemyProjectiles.push({
              x: n.x + n.width / 2, y: n.y + n.height / 2,
              vx: Math.cos(angle) * 7.5, vy: Math.sin(angle) * 7.5,
              radius: n.isBoss ? 6 : 4, damage: n.isBoss ? 22 : 14, life: 60
            });
          }
        } else {
          // Melee Striking
          if (dist < 45 && n.attackCooldown <= 0) {
            n.attackCooldown = 50;
            AudioEngine.playSfx('slash');
            this.damagePlayer(n.isBoss ? 28 : 18, Math.cos(angle) > 0 ? 'right' : 'left');
          }
        }

        n.x += vx; n.y += vy;
      }
    });
  },

  updateLootPickups() {
    const p = this.player;
    for (let i = this.lootPickups.length - 1; i >= 0; i--) {
      const item = this.lootPickups[i];
      const dist = Math.hypot((p.x + p.width / 2) - item.x, (p.y + p.height / 2) - item.y);
      if (dist < 150) {
        // Magnetic pull
        item.x += ((p.x + p.width / 2) - item.x) * 0.18;
        item.y += ((p.y + p.height / 2) - item.y) * 0.18;
      }
      if (dist < 22) {
        if (item.type === 'coin') {
          State.addTokens(item.value);
          AudioEngine.playSfx('coin');
          State.showToast(`+${item.value} SOUND TOKENS! 🪙`);
        } else if (item.type === 'rare_tape') {
          State.addRareTape();
          AudioEngine.playSfx('win');
          State.showToast(`RARE BATTLE CASSETTE ACQUIRED! (${State.userProfile.collectedRareTapes}/${State.RARE_TAPES_THRESHOLD}) 📼[cite: 4]`);
        }
        this.lootPickups.splice(i, 1);
      }
    }
  }
};
