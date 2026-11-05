const State = {
  RARE_TAPES_THRESHOLD: 50,
  currentDimension: 'underground',
  activeMiniGame: null,

  DIMENSIONS: {
    underground: { name: "UNDERGROUND", width: 1600, height: 1000 },
    retrocade: { name: "RETROCADE NEON", width: 1600, height: 1000 },
    wasteland: { name: "RUINED GRID", width: 3200, height: 2400 }
  },

  SKINS_DATA: [
    { id: 'enforcer', name: 'THE NEW ERA ENFORCER', desc: 'Default trench coat.' },
    { id: 'drifter', name: 'THE WASTELAND DRIFTER', desc: 'Unlocked from Obsolete Vault Safe.' }
  ],

  userProfile: {
    handle: "Enforcer_Guest",
    activeSkin: "enforcer",
    unlockedSkins: ["enforcer"],
    collectedRareTapes: 0,
    casinoTokens: 100,
    chestsOpened: []
  },

  init() {
    try {
      const saved = localStorage.getItem('club_lowlife_save');
      if (saved) this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
    } catch (e) {}
    this.updateHud();
    this.renderSkins();
  },

  save() {
    try { localStorage.setItem('club_lowlife_save', JSON.stringify(this.userProfile)); } catch (e) {}
    this.updateHud();
  },

  spendTokens(amount) {
    if (this.userProfile.casinoTokens >= amount) {
      this.userProfile.casinoTokens -= amount;
      this.save();
      return true;
    }
    return false;
  },

  addTokens(amount) {
    this.userProfile.casinoTokens += amount;
    this.save();
  },

  addRareTape() {
    this.userProfile.collectedRareTapes++;
    this.save();
  },

  updateHud() {
    const cEl = document.getElementById('casinoTokensCount');
    if (cEl) cEl.innerText = this.userProfile.casinoTokens;
    const tEl = document.getElementById('rareBattleTapeCount');
    if (tEl) tEl.innerText = `${this.userProfile.collectedRareTapes}/${this.RARE_TAPES_THRESHOLD}`;

    const gatedProgressText = document.getElementById('gatedTapeProgress');
    if (gatedProgressText) gatedProgressText.innerText = `${this.userProfile.collectedRareTapes} / ${this.RARE_TAPES_THRESHOLD} TAPES`;
    const gatedBar = document.getElementById('gatedProgressBar');
    if (gatedBar) {
      const pct = Math.min(100, Math.floor((this.userProfile.collectedRareTapes / this.RARE_TAPES_THRESHOLD) * 100));
      gatedBar.style.width = `${pct}%`;
    }
  },

  switchDimension(dimKey, spawnX, spawnY) {
    this.currentDimension = dimKey;
    const cfg = this.DIMENSIONS[dimKey];
    Entities.player.x = spawnX;
    Entities.player.y = spawnY;
    const badge = document.getElementById('dimensionBadge');
    if (badge) badge.innerText = `DIMENSION: ${cfg.name}`;
    this.showToast(`WARPED TO ${cfg.name}! 🌀`);
  },

  showToast(msg) {
    const t = document.getElementById('toastMessage');
    if (!t) return;
    t.innerText = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; }, 2200);
  },

  closeModals() {
    document.querySelectorAll('.fixed').forEach(m => m.classList.add('hidden'));
    if (this.activeMiniGame && this.activeMiniGame.stop) {
      this.activeMiniGame.stop();
    }
    this.activeMiniGame = null;
  },

  renderSkins() {
    const list = document.getElementById('skinsList');
    if (!list) return;
    list.innerHTML = '';
    this.SKINS_DATA.forEach(s => {
      const isUnlocked = this.userProfile.unlockedSkins.includes(s.id);
      const isEquipped = this.userProfile.activeSkin === s.id;
      const item = document.createElement('div');
      item.className = `p-2.5 rounded border flex justify-between items-center ${isEquipped ? 'border-[#00f0ff] bg-[#00f0ff]/10' : (isUnlocked ? 'border-neutral-700 bg-black/60' : 'border-neutral-900 bg-neutral-950 opacity-50')}`;
      item.innerHTML = `<div><div class="font-cyber font-bold text-white">${s.name}</div><div class="text-[10px] text-neutral-400">${s.desc}</div></div><div>${isUnlocked ? (isEquipped ? '' : `<button onclick="State.userProfile.activeSkin='${s.id}';State.save();State.renderSkins();State.showToast('EQUIPPED');" class="px-2 py-1 bg-neutral-800 text-white rounded text-xs">EQUIP</button>`) : '[LOCKED]'}</div>`;
      list.appendChild(item);
    });
  },

  attemptGateWarp() {
    if (this.userProfile.collectedRareTapes >= this.RARE_TAPES_THRESHOLD) {
      this.showToast("WARPING TO HORIZON DIMENSION // CHAPTER III UNLOCKED!");
      this.closeModals();
    } else {
      this.showToast(`ACCESS DENIED: NEED ${this.RARE_TAPES_THRESHOLD - this.userProfile.collectedRareTapes} MORE TAPES!`);
    }
  }
};
