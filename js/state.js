/**
 * CLUB LOWLIFE // GLOBAL STATE & CATALOG
 * File: js/state.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Physics
 */

const State = {
  RARE_TAPES_THRESHOLD: 100,
  currentDimension: 'underground',
  activeMiniGame: null,

  // Dimension viewport & camera bounding boundaries (Synchronized to Dossier specs)
  DIMENSIONS: {
    underground: { name: "UNDERGROUND NIGHT SHIFT", width: 2400, height: 1200 },
    retrocade: { name: "NIRVANA (RETROCADE)", width: 2400, height: 1200 },
    wasteland: { name: "THE CORRUPTION", width: 6400, height: 4800 }
  },

  // =========================================================================
  // CENTRALIZED RELEASES & LINK-IN-BIO CATALOG
  // =========================================================================
  releases: [
    {
      id: "dancing",
      title: "DANCING",
      type: "SINGLE",
      status: "OUT NOW",
      badgeColor: "pink",
      highlight: true,
      description: "Transition single bridging the Retrocade era into the dark dystopia. Includes alternate nightcore, slowed + reverb, and club VIP edits.",
      links: [
        { platform: "SPOTIFY", url: "https://open.spotify.com/track/6jfPp34RiWhv8HUEfSpuhg?si=0d4c1e54e1fd4ee2", color: "emerald" },
        { platform: "APPLE MUSIC", url: "https://music.apple.com/us/song/dancing/6824158392", color: "rose" },
        { platform: "YOUTUBE", url: "https://music.youtube.com/playlist?list=OLAK5uy_m-WHYrOsDdXEtkUCJzW11ELfS7wifL1sc&si=6kMLhqT5LWGyFrhQ", color: "red" },
        { platform: "OTHER PLATFORMS", url: "https://clublowlife.dimensions.fm/dancing", color: "amber" }
      ]
    },
    {
      id: "retrocade_evolved",
      title: "RETROCADE EVOLVED",
      type: "DELUXE ALBUM",
      status: "STREAMING",
      badgeColor: "cyan",
      highlight: false,
      description: "Extended edition featuring exclusive bonus tracks not found on standard streaming platforms.",
      links: [
        { platform: "STREAM ALBUM", url: "https://clublowlife.dimensions.fm/retrocade-evolved", color: "cyan" },
        { platform: "LOWLIFE CASSETTE", url: "https://www.clublowlife.com", color: "purple" }
      ]
    }
  ],

  screenShake: { intensity: 0, duration: 0 },

  triggerScreenShake(intensity = 8, duration = 16) {
    this.screenShake.intensity = intensity;
    this.screenShake.duration = duration;
  },

  // =========================================================================
  // 60 PLAYABLE SKINS CATALOG
  // =========================================================================
  SKINS_DATA: [
    // 01-10: Founders & Street Enforcers
    { id: 'enforcer', name: 'THE NEW ERA ENFORCER', desc: 'Default tactical duster with neon cyan visor.', rarity: 'common', coat: '#090b10', trim: '#161d2a', visor: '#00f0ff', pants: '#06080c' },
    { id: 'recruit', name: 'SYNDICATE RECRUIT', desc: 'Gray combat vest with amber target optics.', rarity: 'common', coat: '#1f242e', trim: '#2d3748', visor: '#f59e0b', pants: '#11141a' },
    { id: 'vanguard', name: 'STREET VANGUARD', desc: 'Heavy street hoodie and crimson breather mask.', rarity: 'uncommon', coat: '#18181b', trim: '#ef4444', visor: '#ff003c', pants: '#09090b' },
    { id: 'alley_runner', name: 'ALLEY RUNNER', desc: 'Lightweight runner windbreaker with acid-green stripes.', rarity: 'uncommon', coat: '#14532d', trim: '#22c55e', visor: '#10b981', pants: '#052e16' },
    { id: 'concrete_ghost', name: 'CONCRETE GHOST', desc: 'Matte-white winter trench and smoked visor.', rarity: 'rare', coat: '#e2e8f0', trim: '#94a3b8', visor: '#38bdf8', pants: '#475569' },
    { id: 'tactical_op', name: 'TACTICAL OPERATIVE', desc: 'Ballistic harness and reinforced knee struts.', rarity: 'uncommon', coat: '#27272a', trim: '#3f3f46', visor: '#a855f7', pants: '#18181b' },
    { id: 'midnight_patrol', name: 'MIDNIGHT PATROL', desc: 'Deep-navy stealth slicker with electric blue optic.', rarity: 'rare', coat: '#0c1322', trim: '#1e3a8a', visor: '#3b82f6', pants: '#080d1a' },
    { id: 'night_drive', name: 'NIGHT-DRIVE DRIFTER', desc: 'Leather bomber jacket and polarized sunset lenses.', rarity: 'rare', coat: '#451a03', trim: '#d97706', visor: '#f97316', pants: '#1c1917' },
    { id: 'asphalt_raider', name: 'ASPHALT RAIDER', desc: 'Road-burned biker leathers with spiked cuffs.', rarity: 'rare', coat: '#1c1917', trim: '#78350f', visor: '#fbbf24', pants: '#0c0a09' },
    { id: 'lowlife_prime', name: 'LOWLIFE PRIME', desc: 'Chrome-trimmed syndicate trench with violet energy veins.', rarity: 'legendary', coat: '#1e1b4b', trim: '#6366f1', visor: '#c084fc', pants: '#0f172a' },

    // 11-20: Retrocade Vintage Era
    { id: 'old_self', name: 'THE OLD SELF (CAPTIVE)', desc: 'Saturated vintage graphic tee from the upbeat trap era.', rarity: 'legendary', coat: '#ec4899', trim: '#06b6d4', visor: '#facc15', pants: '#3b82f6' },
    { id: 'pixel_kid', name: '8-BIT PIXEL KID', desc: 'Cyan and magenta high-res pixel grid windbreaker.', rarity: 'uncommon', coat: '#0891b2', trim: '#f43f5e', visor: '#22d3ee', pants: '#0e7490' },
    { id: 'arcade_geeker', name: 'ARCADE GEEKER', desc: 'Oversized mustard coat with vintage neck cans.', rarity: 'common', coat: '#ca8a04', trim: '#eab308', visor: '#fef08a', pants: '#713f12' },
    { id: 'retrowave_rider', name: 'RETROWAVE RIDER', desc: 'Sunset gradient track coat and mirror aviator shades.', rarity: 'rare', coat: '#be185d', trim: '#fb7185', visor: '#f43f5e', pants: '#881337' },
    { id: 'synth_phantom', name: 'SYNTHWAVE PHANTOM', desc: 'Electric-violet grid trench with flowing wire ribbons.', rarity: 'rare', coat: '#581c87', trim: '#a855f7', visor: '#e879f9', pants: '#3b0764' },
    { id: 'joystick_brawler', name: 'JOYSTICK BRAWLER', desc: 'Sleeveless denim cut-off and tournament headband.', rarity: 'uncommon', coat: '#1d4ed8', trim: '#dc2626', visor: '#ef4444', pants: '#1e3a8a' },
    { id: 'crt_glitch', name: 'CRT GLITCH ECHO', desc: 'Body constantly strobing with interlaced TV scanlines.', rarity: 'epic', coat: '#334155', trim: '#64748b', visor: '#e2e8f0', pants: '#1e293b' },
    { id: 'tape_head', name: 'TAPE HEAD OPERATIVE', desc: 'Wears a battle cassette deck harnessed to chest.', rarity: 'epic', coat: '#713f12', trim: '#eab308', visor: '#fde047', pants: '#451a03' },
    { id: 'neon_qb', name: 'NEON QUARTERBACK', desc: 'Heavy sports varsity wool in radioactive pink/teal.', rarity: 'uncommon', coat: '#db2777', trim: '#06b6d4', visor: '#67e8f9', pants: '#9d174d' },
    { id: 'high_score_king', name: 'HIGH-SCORE KING', desc: 'Golden crown chassis and iridescent champion mantle.', rarity: 'legendary', coat: '#eab308', trim: '#fef08a', visor: '#ffffff', pants: '#854d0e' },

    // 21-30: Dystopian Hunters & Boss Drops
    { id: 'blade_zero', name: 'BLADE-ZERO // EXECUTIONER', desc: 'The dreaded trench duster dropped by the Holding Chamber Boss.', rarity: 'mythic', coat: '#050507', trim: '#ff003c', visor: '#ff003c', pants: '#000000' },
    { id: 'casshern_android', name: 'CASSHERN ANDROID', desc: 'Matte-white battle chassis with gold helmet crest.', rarity: 'mythic', coat: '#f8fafc', trim: '#e2e8f0', visor: '#eab308', pants: '#0f172a' },
    { id: 'sub_level_slayer', name: 'SUB-LEVEL SLAYER', desc: 'Armored external spine brace and dual optics.', rarity: 'epic', coat: '#1e293b', trim: '#0284c7', visor: '#38bdf8', pants: '#0f172a' },
    { id: 'drone_whisperer', name: 'DRONE QUEEN SLAYER', desc: 'Turbine drone chassis worn as a shoulder pauldron.', rarity: 'epic', coat: '#0f172a', trim: '#00f0ff', visor: '#00f0ff', pants: '#020617' },
    { id: 'chem_enforcer', name: 'CHEM-ENFORCER UNIT 09', desc: 'Sludge-sealed chemical hazmat dropped by Silo Boss.', rarity: 'epic', coat: '#3f6212', trim: '#84cc16', visor: '#a3e635', pants: '#1a2e05' },
    { id: 'neural_ripper', name: 'NEURAL RIPPER', desc: 'Exposed brainstem circuitry with pulsing telemetry.', rarity: 'rare', coat: '#312e81', trim: '#818cf8', visor: '#c7d2fe', pants: '#1e1b4b' },
    { id: 'mono_ronin', name: 'MONO RONIN', desc: 'Conical straw hat woven from carbon cyber cables.', rarity: 'rare', coat: '#18181b', trim: '#a1a1aa', visor: '#f43f5e', pants: '#09090b' },
    { id: 'carbon_enforcer', name: 'CARBON ENFORCER', desc: 'Woven carbon fiber chestplate with glowing orange heat vents.', rarity: 'rare', coat: '#1c1917', trim: '#ea580c', visor: '#ff7700', pants: '#0c0a09' },
    { id: 'phase_assassin', name: 'PHASE-SHIFT ASSASSIN', desc: 'Vibrating translucent silhouette with after-image trails.', rarity: 'legendary', coat: '#4c1d95', trim: '#8b5cf6', visor: '#ddd6fe', pants: '#2e1065' },
    { id: 'syndicate_warlord', name: 'SYNDICATE WARLORD', desc: 'Heavy fur-lined tactical mantle with gilded bionic arm.', rarity: 'legendary', coat: '#292524', trim: '#ca8a04', visor: '#facc15', pants: '#1c1917' },

    // 31-40: Wasteland Drifters & Cave Nomads
    { id: 'drifter', name: 'WASTELAND DRIFTER', desc: 'Torn hooded poncho over a weathered tactical rig.', rarity: 'rare', coat: '#292524', trim: '#78716c', visor: '#ff7700', pants: '#1c1917' },
    { id: 'sludge_scavenger', name: 'SLUDGE SCAVENGER', desc: 'Heavy rubberized boots and patched chemical tarp coat.', rarity: 'common', coat: '#365314', trim: '#4d7c0f', visor: '#84cc16', pants: '#1a2e05' },
    { id: 'rust_belt_nomad', name: 'RUST-BELT NOMAD', desc: 'Shoulder pads forged from scrap metal highway signs.', rarity: 'uncommon', coat: '#7c2d12', trim: '#9a3412', visor: '#fdba74', pants: '#431407' },
    { id: 'cave_stalker', name: 'CAVE STALKER', desc: 'Quad-night-vision goggles and mountaineering harness.', rarity: 'rare', coat: '#1e293b', trim: '#475569', visor: '#22c55e', pants: '#0f172a' },
    { id: 'drainage_hermit', name: 'DRAINAGE HERMIT', desc: 'Corroded neoprene diver suit and twin oxygen bottles.', rarity: 'uncommon', coat: '#134e4a', trim: '#0d9488', visor: '#2dd4bf', pants: '#042f2e' },
    { id: 'toxic_golem', name: 'TOXIC MOSS GOLEM', desc: 'Tactical body armor overgrown with luminescent wasteland flora.', rarity: 'rare', coat: '#14532d', trim: '#16a34a', visor: '#4ade80', pants: '#052e16' },
    { id: 'scrap_mechanic', name: 'SCRAP MECHANIST', desc: 'Welding mask and tool belts sparking on movement.', rarity: 'uncommon', coat: '#44403c', trim: '#78716c', visor: '#f59e0b', pants: '#292524' },
    { id: 'dune_strider', name: 'DUNE STRIDER', desc: 'Linen dust cloaks and polarized sandstorm blast goggles.', rarity: 'uncommon', coat: '#78716c', trim: '#a8a29e', visor: '#38bdf8', pants: '#57534e' },
    { id: 'silo_survivor', name: 'SILO SURVIVOR', desc: 'Lead-lined lab coat over industrial steel-toe trousers.', rarity: 'rare', coat: '#334155', trim: '#64748b', visor: '#facc15', pants: '#1e293b' },
    { id: 'obsidian_scout', name: 'OBSIDIAN SCOUT', desc: 'Chiseled black stone armor that deflects sniper lasers.', rarity: 'epic', coat: '#09090b', trim: '#27272a', visor: '#a855f7', pants: '#000000' },

    // 41-50: Casino VIP & Dance Floor Highlights
    { id: 'velvet_vip', name: 'VELVET VIP', desc: 'Burgundy silk tailored trench and wireframe sunglasses.', rarity: 'rare', coat: '#881337', trim: '#9f1239', visor: '#fecdd3', pants: '#4c0519' },
    { id: 'jackpot_777', name: 'JACKPOT 777', desc: 'Shimmering gold sequin tuxedo with holographic coins.', rarity: 'epic', coat: '#ca8a04', trim: '#eab308', visor: '#fef08a', pants: '#713f12' },
    { id: 'dj_resident', name: 'DJ RESIDENT', desc: 'Turntable slipmat cape and active visualizer headphones.', rarity: 'rare', coat: '#4c1d95', trim: '#7c3aed', visor: '#c084fc', pants: '#2e1065' },
    { id: 'vinyl_cutter', name: 'VINYL CUTTER', desc: 'Heavy leather mixing apron studded with rotary dial knobs.', rarity: 'uncommon', coat: '#18181b', trim: '#3f3f46', visor: '#00f0ff', pants: '#09090b' },
    { id: 'neon_dancer', name: 'NEON DANCER', desc: 'UV-reactive body harness with animated pulsing light bands.', rarity: 'uncommon', coat: '#0284c7', trim: '#38bdf8', visor: '#f43f5e', pants: '#0369a1' },
    { id: 'chip_leader', name: 'CHIP LEADER', desc: 'Trench coat lined with gold high-stakes casino plaques.', rarity: 'rare', coat: '#1e1b4b', trim: '#eab308', visor: '#fbbf24', pants: '#0f172a' },
    { id: 'diamond_dealer', name: 'DIAMOND DEALER', desc: 'Crisp white card croupier vest and mirror-plated visor.', rarity: 'rare', coat: '#f8fafc', trim: '#cbd5e1', visor: '#38bdf8', pants: '#0f172a' },
    { id: 'bassline_groover', name: 'BASSLINE GROOVER', desc: 'Puffer coat that vibrates and bounces to the live BGM bass.', rarity: 'uncommon', coat: '#9d174d', trim: '#db2777', visor: '#f472b6', pants: '#700736' },
    { id: 'discotheque_diva', name: 'DISCOTHEQUE DIVA', desc: 'Silver mirror-ball fragmented crop jacket and combat boots.', rarity: 'rare', coat: '#94a3b8', trim: '#e2e8f0', visor: '#ec4899', pants: '#334155' },
    { id: 'high_stakes_ghost', name: 'HIGH-STAKES GHOST', desc: 'Emerald translucent silhouette shuffling neon deck cards.', rarity: 'epic', coat: '#065f46', trim: '#10b981', visor: '#6ee7b7', pants: '#022c22' },

    // 51-60: Secret, Mythic & Link-in-Bio Exclusives
    { id: 'spotify_streamer', name: 'SPOTIFY STREAMER', desc: 'Unlocked by streaming DANCING. Mint-green frequency aura.', rarity: 'legendary', coat: '#052e16', trim: '#10b981', visor: '#1db954', pants: '#022c22' },
    { id: 'apple_lossless', name: 'APPLE LOSSLESS MASTER', desc: 'Minimalist white titanium shell with spatial audio rings.', rarity: 'legendary', coat: '#f1f5f9', trim: '#ffffff', visor: '#ff003c', pants: '#0f172a' },
    { id: 'redbull_rebel', name: 'REDBULL SETLIST REBEL', desc: 'Rally-style bomber jacket sporting the Chicago underground patch.', rarity: 'rare', coat: '#1e3a8a', trim: '#dc2626', visor: '#facc15', pants: '#172554' },
    { id: 'bonfire_chronicler', name: 'BONFIRE CHRONICLER', desc: 'Wool-lined parka with live embers trailing your footprints.', rarity: 'rare', coat: '#7c2d12', trim: '#ea580c', visor: '#f97316', pants: '#431407' },
    { id: 'sound_designer', name: 'THE SOUND DESIGNER', desc: 'Active 10-band graphic equalizer animated on back of trench.', rarity: 'epic', coat: '#0f172a', trim: '#00f0ff', visor: '#a855f7', pants: '#020617' },
    { id: 'fl_alchemist', name: 'FL STUDIO ALCHEMIST', desc: 'Orange mixer cap with physical volume faders on arm sleeves.', rarity: 'rare', coat: '#9a3412', trim: '#ea580c', visor: '#fb923c', pants: '#431407' },
    { id: 'tape_winner', name: 'THE 6-WINNER CLAIMANT', desc: 'Unlocked via Google Form claim. Pure gold cassette aura.', rarity: 'mythic', coat: '#713f12', trim: '#facc15', visor: '#ffffff', pants: '#451a03' },
    { id: 'static_nightmare', name: 'STATIC NIGHTMARE', desc: 'Grainy black-and-white silhouette torn from the CRT monitor.', rarity: 'mythic', coat: '#18181b', trim: '#71717a', visor: '#ffffff', pants: '#09090b' },
    { id: 'horizon_celestial', name: 'HORIZON CELESTIAL', desc: 'Prismatic duster shimmering with distant dimension stars.', rarity: 'mythic', coat: '#312e81', trim: '#ec4899', visor: '#00f0ff', pants: '#1e1b4b' },
    { id: 'the_creator', name: 'THE CREATOR // OMG LOWLIFE', desc: 'The signature crown, open trench, and master sound processor.', rarity: 'mythic', coat: '#000000', trim: '#facc15', visor: '#00f0ff', pants: '#09090b' }
  ],

  userProfile: {
    handle: "",
    activeSkin: "enforcer",
    unlockedSkins: ["enforcer"],
    collectedRareTapes: 0,
    casinoTokens: 100,
    bossesDefeated: [],
    chestsOpened: [],
    lastDimension: "underground",
    lastPosition: { x: 350, y: 750 }
  },

  init() {
    try {
      const saved = localStorage.getItem('club_lowlife_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.userProfile = { ...this.userProfile, ...parsed };
        if (this.userProfile.lastDimension) {
          this.currentDimension = this.userProfile.lastDimension;
        }
      }
    } catch (e) {
      console.warn("Storage access restricted. Progress will be session-only.", e);
    }

    this.updateHud();
    this.renderSkins();

    // First-time boot: prompt for username registration if empty
    if (!this.userProfile.handle || this.userProfile.handle.trim() === "") {
      setTimeout(() => {
        if (typeof openUsernameModal === 'function') openUsernameModal();
      }, 500);
    }
  },

  save() {
    if (typeof Entities !== 'undefined' && Entities && Entities.player) {
      this.userProfile.lastDimension = this.currentDimension;
      this.userProfile.lastPosition = {
        x: Math.round(Entities.player.x),
        y: Math.round(Entities.player.y)
      };
    }

    try {
      localStorage.setItem('club_lowlife_save', JSON.stringify(this.userProfile));
    } catch (e) {
      console.error("Save write failed:", e);
    }

    this.updateHud();
  },

  setHandle(rawHandle) {
    const clean = (rawHandle || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16);
    if (!clean) return false;
    this.userProfile.handle = clean;
    this.save();
    this.showToast(`IDENTITY CONFIRMED: ${clean.toUpperCase()} 🪪`);
    return true;
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

  unlockSkin(skinId) {
    if (!this.userProfile.unlockedSkins.includes(skinId)) {
      this.userProfile.unlockedSkins.push(skinId);
      const skin = this.SKINS_DATA.find(s => s.id === skinId);
      this.save();
      this.renderSkins();
      this.showToast(`NEW SKIN UNLOCKED: ${skin ? skin.name : skinId}! 🧥⚡`);
    }
  },

  updateHud() {
    const cEl = document.getElementById('casinoTokensCount');
    if (cEl) cEl.innerText = this.userProfile.casinoTokens;
    const tEl = document.getElementById('rareBattleTapeCount');
    if (tEl) tEl.innerText = `${this.userProfile.collectedRareTapes}/${this.RARE_TAPES_THRESHOLD}`;

    const handleBadge = document.getElementById('hudCallsign');
    if (handleBadge) handleBadge.innerText = this.userProfile.handle ? this.userProfile.handle.toUpperCase() : "UNREGISTERED";

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
    if (typeof Entities !== 'undefined' && Entities && Entities.player) {
      Entities.player.x = spawnX;
      Entities.player.y = spawnY;
    }
    const badge = document.getElementById('dimensionBadge');
    if (badge) badge.innerText = `DIMENSION: ${cfg.name}`;
    this.save();
    this.showToast(`WARPED TO ${cfg.name}! 🌀`);
  },

  showToast(msg) {
    const t = document.getElementById('toastMessage');
    if (!t) return;
    t.innerText = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    setTimeout(() => { 
      t.style.opacity = '0'; 
      t.style.transform = 'translateY(12px)'; 
    }, 2400);
  },

  closeModals() {
    document.querySelectorAll('.fixed').forEach(m => m.classList.add('hidden'));
    if (this.activeMiniGame && typeof this.activeMiniGame.stop === 'function') {
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
      item.className = `p-2.5 rounded border flex justify-between items-center ${isEquipped ? 'border-[#00f0ff] bg-[#00f0ff]/10' : (isUnlocked ? 'border-neutral-700 bg-black/60' : 'border-neutral-900 bg-neutral-950 opacity-40')}`;
      
      const badgeColor = s.rarity === 'mythic' ? 'text-amber-400 border-amber-400' : s.rarity === 'legendary' ? 'text-purple-400 border-purple-400' : s.rarity === 'epic' ? 'text-cyan-400 border-cyan-400' : 'text-neutral-400 border-neutral-700';

      item.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-6 h-6 rounded flex items-center justify-center border" style="background-color: ${s.coat}; border-color: ${s.visor}">
            <div class="w-2.5 h-1 rounded" style="background-color: ${s.visor}"></div>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-cyber font-bold text-white text-xs">${s.name}</span>
              <span class="text-[8px] font-mono uppercase px-1 py-0.2 border rounded ${badgeColor}">${s.rarity}</span>
            </div>
            <div class="text-[10px] text-neutral-400 leading-tight">${s.desc}</div>
          </div>
        </div>
        <div>
          ${isUnlocked 
            ? (isEquipped ? '<span class="text-[10px] text-[#00f0ff] font-cyber font-bold">EQUIPPED</span>' : `<button onclick="State.userProfile.activeSkin='${s.id}';State.save();State.renderSkins();State.showToast('EQUIPPED ${s.name}');" class="px-2 py-1 bg-neutral-800 text-white rounded text-xs hover:bg-[#00f0ff] hover:text-black font-cyber transition">EQUIP</button>`)
            : '<span class="text-[10px] text-neutral-600 font-mono">[LOCKED]</span>'}
        </div>
      `;
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
