const CasinoGame = {
  currentMode: 'classic', // 'classic' (3 reels, 5 tokens) or 'highroller' (5 reels, 25 tokens)
  reels: ['📼', '7️⃣', '💿', '💀', '🪙', '💎'],

  open(mode = 'classic') {
    this.currentMode = mode;
    const modal = document.getElementById('casinoModal');
    modal.classList.remove('hidden');

    const title = document.querySelector('#casinoModal span');
    const btn = document.getElementById('slotSpinBtn');
    const msg = document.getElementById('slotPayoutMsg');

    if (mode === 'highroller') {
      title.innerText = "RETROCADE // 5-LANE HIGH ROLLER (25🪙 BET)";
      btn.innerText = "SPIN HIGH ROLLER (25 TOKENS)";
      msg.innerText = "5-LANE MULTIPLIER: 5 MATCHES PAYS +500 TOKENS & 5 CASSETTES!";
      this.ensureFiveReels();
    } else {
      title.innerText = "RETROCADE // CLASSIC 3-REEL CYBER SLOTS (5🪙 BET)";
      btn.innerText = "SPIN CLASSIC (5 TOKENS)";
      msg.innerText = "3 REELS: MATCH 3 TO WIN";
      this.ensureThreeReels();
    }
  },

  ensureFiveReels() {
    let r4 = document.getElementById('slotReel4');
    let r5 = document.getElementById('slotReel5');
    if (!r4) {
      const container = document.getElementById('slotReel1').parentElement;
      r4 = document.createElement('div');
      r4.id = 'slotReel4';
      r4.className = 'w-16 h-20 bg-neutral-900 border border-neutral-700 rounded flex items-center justify-center text-4xl';
      r4.innerText = '💎';
      container.appendChild(r4);

      r5 = document.createElement('div');
      r5.id = 'slotReel5';
      r5.className = 'w-16 h-20 bg-neutral-900 border border-neutral-700 rounded flex items-center justify-center text-4xl';
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
    const betCost = this.currentMode === 'highroller' ? 25 : 5;
    if (!State.spendTokens(betCost)) {
      State.showToast(`INSUFFICIENT TOKENS! NEED ${betCost} TOKENS.`);
      return;
    }

    AudioEngine.playSfx('spin');
    const r1 = document.getElementById('slotReel1');
    const r2 = document.getElementById('slotReel2');
    const r3 = document.getElementById('slotReel3');
    const r4 = document.getElementById('slotReel4');
    const r5 = document.getElementById('slotReel5');
    const msg = document.getElementById('slotPayoutMsg');
    msg.innerText = "SPINNING CYBER REELS...";

    let counter = 0;
    const interval = setInterval(() => {
      r1.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      r2.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      r3.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      if (this.currentMode === 'highroller' && r4 && r5) {
        r4.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
        r5.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      }
      counter++;
      if (counter > 14) {
        clearInterval(interval);
        if (this.currentMode === 'highroller') {
          this.evaluateHighRoller([r1.innerText, r2.innerText, r3.innerText, r4.innerText, r5.innerText]);
        } else {
          this.evaluateClassic([r1.innerText, r2.innerText, r3.innerText]);
        }
      }
    }, 55);
  },

  evaluateClassic(reels) {
    const [v1, v2, v3] = reels;
    const msg = document.getElementById('slotPayoutMsg');

    if (v1 === '📼' && v2 === '📼' && v3 === '📼') {
      State.addTokens(100);
      State.addRareTape(); State.addRareTape();
      AudioEngine.playSfx('win');
      msg.innerText = "JACKPOT! +100 TOKENS & +2 RARE CASSETTES! 📼✨";
    } else if (v1 === '7️⃣' && v2 === '7️⃣' && v3 === '7️⃣') {
      State.addTokens(77);
      AudioEngine.playSfx('win');
      msg.innerText = "777 MATCH! +77 TOKENS! 🪙";
    } else if (v1 === '💎' && v2 === '💎' && v3 === '💎') {
      State.addTokens(60);
      AudioEngine.playSfx('win');
      msg.innerText = "DIAMOND TRIFECTA! +60 TOKENS! 💎";
    } else if (v1 === v2 || v2 === v3 || v1 === v3) {
      State.addTokens(10);
      AudioEngine.playSfx('coin');
      msg.innerText = "DOUBLE MATCH! +10 TOKENS RETURN!";
    } else {
      msg.innerText = "NO MATCH. RE-ARM AND SPIN AGAIN.";
    }
  },

  evaluateHighRoller(reels) {
    const msg = document.getElementById('slotPayoutMsg');
    // Count occurrences of each symbol
    const counts = {};
    reels.forEach(r => counts[r] = (counts[r] || 0) + 1);

    const maxMatch = Math.max(...Object.values(counts));

    if (maxMatch === 5) {
      State.addTokens(500);
      for (let i = 0; i < 5; i++) State.addRareTape();
      AudioEngine.playSfx('win');
      State.triggerScreenShake(15, 25);
      msg.innerText = "5-OF-A-KIND JACKPOT! +500 TOKENS & +5 RARE CASSETTES! 🌌👑";
    } else if (maxMatch === 4) {
      State.addTokens(200);
      State.addRareTape(); State.addRareTape();
      AudioEngine.playSfx('win');
      msg.innerText = "4-OF-A-KIND! +200 TOKENS & +2 CASSETTES! 💎⚡";
    } else if (maxMatch === 3) {
      State.addTokens(65);
      AudioEngine.playSfx('coin');
      msg.innerText = "3-OF-A-KIND! +65 TOKENS! 🪙";
    } else if (maxMatch === 2) {
      State.addTokens(20);
      msg.innerText = "PAIR MATCH: +20 TOKENS RETURN.";
    } else {
      msg.innerText = "NO LANE COMBINATIONS HIT. TRY AGAIN.";
    }
  }
};
