const Combat = {
  projectiles: [],
  enemyProjectiles: [],
  meleeSlashes: [],
  activeInteractable: null,

  checkCollision(r1, r2) {
    return (r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y);
  },

  startShootInput() {
    AudioEngine.init();
    AudioEngine.playSfx('laser');
    let vx = 0, vy = 0;
    const p = Entities.player;
    if (p.direction === 'up') vy = -11;
    else if (p.direction === 'down') vy = 11;
    else if (p.direction === 'left') vx = -11;
    else if (p.direction === 'right') vx = 11;

    this.projectiles.push({
      x: p.x + p.width / 2, y: p.y + p.height / 2,
      vx, vy, radius: 5, damage: 30, life: 50
    });
  },

  releaseShootInput() {},
  startSlashInput() {
    AudioEngine.init();
    AudioEngine.playSfx('slash');
    const p = Entities.player;
    this.meleeSlashes.push({
      x: p.x + p.width / 2, y: p.y + p.height / 2,
      dir: p.direction, radius: 45, damage: 50, life: 8
    });
    this.checkMeleeHits(p.x, p.y, 50);
  },

  releaseSlashInput() {},

  checkMeleeHits(x, y, damage) {
    if (State.currentDimension !== 'wasteland') return;
    Entities.hostileNpcs.forEach(n => {
      if (n.alive && Math.hypot(n.x - x, n.y - y) < 60) {
        n.hp -= damage;
        AudioEngine.playSfx('stomp');
        if (n.hp <= 0) {
          n.alive = false;
          State.addTokens(5);
          if (Math.random() < 0.25) State.addRareTape();
        }
      }
    });
  },

  update() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx; p.y += p.vy; p.life--;
      if (State.currentDimension === 'wasteland') {
        Entities.hostileNpcs.forEach(n => {
          if (n.alive && Math.hypot(n.x - p.x, n.y - p.y) < 20) {
            n.hp -= p.damage;
            p.life = 0;
            if (n.hp <= 0) {
              n.alive = false;
              State.addTokens(5);
            }
          }
        });
      }
      if (p.life <= 0) this.projectiles.splice(i, 1);
    }

    for (let i = this.meleeSlashes.length - 1; i >= 0; i--) {
      this.meleeSlashes[i].life--;
      if (this.meleeSlashes[i].life <= 0) this.meleeSlashes.splice(i, 1);
    }
    this.checkProximity();
  },

  checkProximity() {
    const p = Entities.player;
    const prompt = document.getElementById('interactionPrompt');
    const promptText = document.getElementById('promptText');
    const actionLabel = document.getElementById('btnActionLabel');

    this.activeInteractable = null;
    const pBox = { x: p.x - 20, y: p.y - 20, width: p.width + 40, height: p.height + 40 };

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

    // World Zones
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
    } else if (item.type === 'zone') {
      item.data.action();
    }
  }
};
