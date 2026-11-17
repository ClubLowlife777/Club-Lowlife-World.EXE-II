const CasinoGame = {
  currentMode: 'classic', // 'classic' (3 reels, 5 tokens) or 'highroller' (5 reels, 25 tokens)
  reels: ['📼', '7️⃣', '💿', '💀', '🪙', '💎'],
  isSpinning: false,

  open(mode = 'classic') {
    this.currentMode = mode;
    this.isSpinning = false;
    const modal = document.getElementById('casinoModal');
    if (modal) modal.classList.remove('hidden');

    const title = document.getElementById('casinoModalTitle') || document.querySelector('#casinoModal span');
    const btn = document.getElementById('slotSpinBtn');
    const msg = document.getElementById('slotPayoutMsg');

    if (mode === 'highroller') {
      if (title) title.innerText = "RETROCADE // 5-LANE HIGH ROLLER (25🪙 BET)";
      if (btn) btn.innerText = "SPIN HIGH ROLLER (25 TOKENS)";
      if (msg) msg.innerText = "5-LANE MULTIPLIER: 5 MATCHES PAYS +500 TOKENS & 5 CASSETTES!";
      this.ensureFiveReels();
    } else {
      if (title) title.innerText = "RETROCADE // CLASSIC 3-REEL CYBER SLOTS (5🪙 BET)";
      if (btn) btn.innerText = "SPIN CLASSIC (5 TOKENS)";
      if (msg) msg.innerText = "3 REELS: MATCH 3 TO WIN JACKPOT & CASSETTES!";
      this.ensureThreeReels();
    }
    this.syncTokenBadge();
  },

  syncTokenBadge() {
    const badge = document.getElementById('casinoModalTokenBalance');
    if (badge && window.State && State.userProfile) {
      badge.innerText = State.userProfile.casinoTokens;
    }
    if (window.State && typeof State.updateHud === 'function') {
      State.updateHud();
    }
  },

  ensureFiveReels() {
    let r4 = document.getElementById('slotReel4');
    let r5 = document.getElementById('slotReel5');
    if (!r4) {
      const r1 = document.getElementById('slotReel1');
      if (!r1 || !r1.parentElement) return;
      const container = r1.parentElement;
      r4 = document.createElement('div');
      r4.id = 'slotReel4';
      r4.className = 'w-11 h-14 sm:w-14 sm:h-16 shrink-0 bg-neutral-900 border border-neutral-700 rounded flex items-center justify-center text-xl sm:text-3xl';
      r4.innerText = '💎';
      container.appendChild(r4);

      r5 = document.createElement('div');
      r5.id = 'slotReel5';
      r5.className = 'w-11 h-14 sm:w-14 sm:h-16 shrink-0 bg-neutral-900 border border-neutral-700 rounded flex items-center justify-center text-xl sm:text-3xl';
      r5.innerText = '🪙';
      container.appendChild(r5);
    }
    r4.style.display = 'flex';
    r5.style.display = 'flex';
  },

  ensureThreeReels() {
    const r4 = document.getElementById('slotReel4');
    const r5 = document.getElementById('slotReel5');
    if (r4) r4.style.display = 'none';
    if (r5) r5.style.display = 'none';
  },

  spin() {
    if (this.isSpinning) return;
    const betCost = this.currentMode === 'highroller' ? 25 : 5;
    if (!window.State || !State.spendTokens(betCost)) {
      if (window.State) State.showToast(`INSUFFICIENT TOKENS! NEED ${betCost} TOKENS 🪙`);
      return;
    }

    this.isSpinning = true;
    this.syncTokenBadge();
    if (window.State && typeof State.recordDailyAction === 'function') {
      State.recordDailyAction('casino_spin', 1);
    }

    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') AudioEngine.playSfx('spin');
    const r1 = document.getElementById('slotReel1');
    const r2 = document.getElementById('slotReel2');
    const r3 = document.getElementById('slotReel3');
    const r4 = document.getElementById('slotReel4');
    const r5 = document.getElementById('slotReel5');
    const msg = document.getElementById('slotPayoutMsg');
    if (msg) msg.innerText = "SPINNING CYBER REELS...";

    let counter = 0;
    const interval = setInterval(() => {
      if (r1) r1.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      if (r2) r2.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      if (r3) r3.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      if (this.currentMode === 'highroller' && r4 && r5) {
        r4.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
        r5.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      }
      counter++;
      if (counter > 14) {
        clearInterval(interval);
        this.isSpinning = false;
        if (this.currentMode === 'highroller' && r4 && r5) {
          this.evaluateHighRoller([r1.innerText, r2.innerText, r3.innerText, r4.innerText, r5.innerText]);
        } else if (r1 && r2 && r3) {
          this.evaluateClassic([r1.innerText, r2.innerText, r3.innerText]);
        }
        this.syncTokenBadge();
      }
    }, 55);
  },

  evaluateClassic(reels) {
    const [v1, v2, v3] = reels;
    const msg = document.getElementById('slotPayoutMsg');

    if (v1 === '📼' && v2 === '📼' && v3 === '📼') {
      State.addTokens(100);
      State.addRareTape(); State.addRareTape();
      if (typeof State.addXp === 'function') State.addXp(90, "SLOTS CASSETTE JACKPOT");
      if (window.AudioEngine) AudioEngine.playSfx('win');
      if (msg) msg.innerText = "JACKPOT! +100 TOKENS, +90 XP & +2 RARE CASSETTES! 📼✨";
    } else if (v1 === '7️⃣' && v2 === '7️⃣' && v3 === '7️⃣') {
      State.addTokens(77);
      if (typeof State.addXp === 'function') State.addXp(77, "777 TRIPLE JACKPOT");
      if (window.AudioEngine) AudioEngine.playSfx('win');
      if (msg) msg.innerText = "777 MATCH! +77 TOKENS & +77 XP! 🪙";
    } else if (v1 === '💎' && v2 === '💎' && v3 === '💎') {
      State.addTokens(60);
      if (typeof State.addXp === 'function') State.addXp(50, "DIAMOND TRIFECTA");
      if (window.AudioEngine) AudioEngine.playSfx('win');
      if (msg) msg.innerText = "DIAMOND TRIFECTA! +60 TOKENS & +50 XP! 💎";
    } else if (v1 === v2 && v2 === v3) {
      State.addTokens(45);
      if (typeof State.addXp === 'function') State.addXp(35, "TRIPLE MATCH");
      if (window.AudioEngine) AudioEngine.playSfx('win');
      if (msg) msg.innerText = "TRIPLE MATCH! +45 TOKENS & +35 XP! ⚡";
    } else if (v1 === v2 || v2 === v3 || v1 === v3) {
      State.addTokens(10);
      if (typeof State.addXp === 'function') State.addXp(10, "SLOT PAIR MATCH");
      if (window.AudioEngine) AudioEngine.playSfx('coin');
      if (msg) msg.innerText = "DOUBLE MATCH! +10 TOKENS & +10 XP RETURN!";
    } else {
      if (msg) msg.innerText = "NO MATCH. RE-ARM AND SPIN AGAIN.";
    }
  },

  evaluateHighRoller(reels) {
    const msg = document.getElementById('slotPayoutMsg');
    const counts = {};
    reels.forEach(r => counts[r] = (counts[r] || 0) + 1);

    const maxMatch = Math.max(...Object.values(counts));

    if (maxMatch === 5) {
      State.addTokens(500);
      for (let i = 0; i < 5; i++) State.addRareTape();
      if (typeof State.addXp === 'function') State.addXp(180, "5-OF-A-KIND HIGH ROLLER JACKPOT");
      if (window.AudioEngine) AudioEngine.playSfx('win');
      State.triggerScreenShake(15, 25);
      if (msg) msg.innerText = "5-OF-A-KIND JACKPOT! +500 TOKENS, +180 XP & +5 CASSETTES! 🌌👑";
    } else if (maxMatch === 4) {
      State.addTokens(200);
      State.addRareTape(); State.addRareTape();
      if (typeof State.addXp === 'function') State.addXp(95, "4-OF-A-KIND HIGH ROLLER");
      if (window.AudioEngine) AudioEngine.playSfx('win');
      if (msg) msg.innerText = "4-OF-A-KIND! +200 TOKENS, +95 XP & +2 CASSETTES! 💎⚡";
    } else if (maxMatch === 3) {
      State.addTokens(65);
      if (typeof State.addXp === 'function') State.addXp(40, "3-OF-A-KIND HIGH ROLLER");
      if (window.AudioEngine) AudioEngine.playSfx('coin');
      if (msg) msg.innerText = "3-OF-A-KIND! +65 TOKENS & +40 XP! 🪙";
    } else if (maxMatch === 2) {
      State.addTokens(20);
      if (typeof State.addXp === 'function') State.addXp(12, "HIGH ROLLER PAIR");
      if (msg) msg.innerText = "PAIR MATCH: +20 TOKENS & +12 XP RETURN.";
    } else {
      if (msg) msg.innerText = "NO LANE COMBINATIONS HIT. TRY AGAIN.";
    }
  }
};

window.CasinoGame = CasinoGame;
