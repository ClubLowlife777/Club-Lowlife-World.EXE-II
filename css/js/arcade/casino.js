const CasinoGame = {
  reels: ['📼', '7️⃣', '💿', '💀', '🪙'],

  open() {
    document.getElementById('casinoModal').classList.remove('hidden');
    document.getElementById('slotPayoutMsg').innerText = "INSERT 5 TOKENS PER SPIN";
  },

  spin() {
    if (!State.spendTokens(5)) {
      State.showToast("INSUFFICIENT TOKENS TO BET!");
      return;
    }
    AudioEngine.playSfx('spin');
    const r1 = document.getElementById('slotReel1');
    const r2 = document.getElementById('slotReel2');
    const r3 = document.getElementById('slotReel3');
    const msg = document.getElementById('slotPayoutMsg');
    msg.innerText = "SPINNING CYBER REELS...";

    let counter = 0;
    const interval = setInterval(() => {
      r1.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      r2.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      r3.innerText = this.reels[Math.floor(Math.random() * this.reels.length)];
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        this.evaluateResult(r1.innerText, r2.innerText, r3.innerText);
      }
    }, 60);
  },

  evaluateResult(v1, v2, v3) {
    const msg = document.getElementById('slotPayoutMsg');
    if (v1 === '📼' && v2 === '📼' && v3 === '📼') {
      State.addTokens(100);
      State.addRareTape();
      State.addRareTape();
      AudioEngine.playSfx('win');
      msg.innerText = "JACKPOT! +100 TOKENS & +2 RARE BATTLE CASSETTES! 📼✨";
    } else if (v1 === '7️⃣' && v2 === '7️⃣' && v3 === '7️⃣') {
      State.addTokens(77);
      AudioEngine.playSfx('win');
      msg.innerText = "777 MATCH! +77 TOKENS! 🪙";
    } else if (v1 === '💿' && v2 === '💿' && v3 === '💿') {
      State.addTokens(50);
      AudioEngine.playSfx('win');
      msg.innerText = "STUDIO DISC MATCH! +50 TOKENS! 💿";
    } else if (v1 === v2 || v2 === v3 || v1 === v3) {
      State.addTokens(10);
      AudioEngine.playSfx('coin');
      msg.innerText = "DOUBLE MATCH! +10 TOKENS RETURN!";
    } else {
      msg.innerText = "NO MATCH. RE-ARM AND SPIN AGAIN.";
    }
  }
};
