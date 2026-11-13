/**
 * CLUB LOWLIFE // GLOBAL STATE, 120-SKIN CATALOG & PROGRESSION ENGINE
 * File: js/state.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Physics (Rev 5.10)
 */

const NEW_STORE_SKINS = [
  // GROUP 1: MILWAUKEE UNDERGROUND & NIGHT SHIFT (Skins 61-75 | 75-175 Tokens)
  { id: 'cream_city_drifter', name: 'CREAM CITY DRIFTER', desc: 'Weathered cream-brick leather duster with industrial river-steel trim.', rarity: 'uncommon', price: 75, category: 'store', coat: '#d6d3d1', trim: '#78716c', visor: '#f59e0b', pants: '#292524' },
  { id: 'lakefront_runner', name: 'LAKEFRONT RUNNER', desc: 'Windproof Michigan-gale shell with deep-water cyan reflective piping.', rarity: 'uncommon', price: 85, category: 'store', coat: '#0f172a', trim: '#0284c7', visor: '#38bdf8', pants: '#020617' },
  { id: 'cactus_club_drifter', name: 'CACTUS CLUB DRIFTER', desc: 'Bay View underground punk jacket covered in DIY tour patches.', rarity: 'rare', price: 110, category: 'store', coat: '#14532d', trim: '#dc2626', visor: '#4ade80', pants: '#052e16' },
  { id: 'hoan_bridge_glider', name: 'HOAN BRIDGE GLIDER', desc: 'High-span suspension yellow harness with harbor-beacon optics.', rarity: 'rare', price: 125, category: 'store', coat: '#713f12', trim: '#facc15', visor: '#fef08a', pants: '#1c1917' },
  { id: 'menomonee_rust_stalker', name: 'MENOMONEE VALLEY STALKER', desc: 'Foundry-ash trench coat forged in the industrial valley yards.', rarity: 'uncommon', price: 90, category: 'store', coat: '#431407', trim: '#9a3412', visor: '#fb923c', pants: '#1c1917' },
  { id: 'riverwest_courier', name: 'RIVERWEST NIGHT COURIER', desc: 'Spoke-card messenger vest built for late-night cassette drops.', rarity: 'uncommon', price: 80, category: 'store', coat: '#1e1b4b', trim: '#ec4899', visor: '#00f0ff', pants: '#09090b' },
  { id: 'kinnickinnic_mechanic', name: 'KK AVE TUNER', desc: 'Grease-stained midnight coveralls with neon underglow strips.', rarity: 'uncommon', price: 95, category: 'store', coat: '#18181b', trim: '#10b981', visor: '#34d399', pants: '#09090b' },
  { id: 'walkers_point_ghost', name: 'WALKERS POINT PHANTOM', desc: 'Warehouse-district stealth parka with cold-storage frost visor.', rarity: 'rare', price: 130, category: 'store', coat: '#334155', trim: '#94a3b8', visor: '#e0f2fe', pants: '#0f172a' },
  { id: 'third_ward_broker', name: 'THIRD WARD SYNDICATE', desc: 'Tailored charcoal wool overcoat with concealed studio drive pockets.', rarity: 'rare', price: 150, category: 'store', coat: '#1f2937', trim: '#d97706', visor: '#fbbf24', pants: '#111827' },
  { id: 'i94_midnight_racer', name: 'I-94 CORRIDOR RACER', desc: 'Carbon-kevlar highway suit built for 140 MPH rain runs.', rarity: 'rare', price: 160, category: 'store', coat: '#09090b', trim: '#ef4444', visor: '#ff003c', pants: '#000000' },
  { id: 'brady_st_prowler', name: 'EAST SIDE AFTERHOURS', desc: 'Vintage velvet underground jacket with neon marquee visor.', rarity: 'uncommon', price: 100, category: 'store', coat: '#4c1d95', trim: '#f43f5e', visor: '#f472b6', pants: '#2e1065' },
  { id: 'brewery_district_warden', name: 'COPPER VAT WARDEN', desc: 'Oxidized copper-plated shoulder rig over heavy canvas.', rarity: 'rare', price: 140, category: 'store', coat: '#7c2d12', trim: '#2dd4bf', visor: '#5eead4', pants: '#292524' },
  { id: 'six_mile_freeze', name: 'SUB-ZERO LAKE EFFECT', desc: 'Arctic-grade thermal duster immune to winter signal static.', rarity: 'rare', price: 155, category: 'store', coat: '#e2e8f0', trim: '#0284c7', visor: '#00f0ff', pants: '#1e293b' },
  { id: 'basement_venue_op', name: 'BASEMENT SHOW ENFORCER', desc: 'Sweat-proof tactical hoodie with stamped wristband cuffs.', rarity: 'uncommon', price: 105, category: 'store', coat: '#171717', trim: '#a855f7', visor: '#c084fc', pants: '#0a0a0a' },
  { id: 'milwaukee_iron_vet', name: '414 IRON VETERAN', desc: 'Heavy-gauge steel pauldron trench honoring the city underground.', rarity: 'epic', price: 175, category: 'store', coat: '#0f172a', trim: '#eab308', visor: '#facc15', pants: '#020617' },

  // GROUP 2: DYSTOPIAN CINEMA & ENFORCERS (Skins 76-90 | 220-400 Tokens)
  { id: 'trenchcoat_executioner', name: 'TRENCHCOAT EXECUTIONER', desc: 'Floor-length matte-black leather duster with silver vampire glaive clasps.', rarity: 'epic', price: 280, category: 'store', coat: '#050507', trim: '#cbd5e1', visor: '#ff003c', pants: '#000000' },
  { id: 'static_infiltrator', name: 'STATIC INFILTRATOR', desc: 'Dead-channel stealth suit that scrambles nearby security cameras.', rarity: 'epic', price: 240, category: 'store', coat: '#1e293b', trim: '#475569', visor: '#f8fafc', pants: '#0f172a' },
  { id: 'tube_light_stalker', name: 'TUBE LIGHT STALKER', desc: 'Washroom-green fluorescent aura over clinical hazard gear.', rarity: 'rare', price: 220, category: 'store', coat: '#134e4a', trim: '#4ade80', visor: '#bbf7d0', pants: '#042f2e' },
  { id: 'zero_frame_phantom', name: 'ZERO FRAME OPERATIVE', desc: '24-fps shutter-sync cloak that flickers between motion frames.', rarity: 'epic', price: 310, category: 'store', coat: '#09090b', trim: '#38bdf8', visor: '#00f0ff', pants: '#000000' },
  { id: 'neo_tokyo_purger', name: 'CAPSULE SYNDICATE DRIFTER', desc: 'Crimson biomorphic biker jacket with high-output laser targeter.', rarity: 'epic', price: 340, category: 'store', coat: '#991b1b', trim: '#dc2626', visor: '#fef08a', pants: '#450a0a' },
  { id: 'amber_vial_chemist', name: 'SUBSTANCE ALCHEMIST', desc: 'Bandolier of glowing amber dropper bottles strapped to a black lab trench.', rarity: 'epic', price: 290, category: 'store', coat: '#1c1917', trim: '#f59e0b', visor: '#fbbf24', pants: '#0c0a09' },
  { id: 'holding_cell_warden', name: 'INTERROGATION WARDEN', desc: 'Heavy rubberized apron and high-voltage stun gauntlets.', rarity: 'rare', price: 230, category: 'store', coat: '#27272a', trim: '#ef4444', visor: '#f87171', pants: '#18181b' },
  { id: 'casshern_ruin_guard', name: 'NEO-SAPIEN SENTINEL', desc: 'Porcelain-white angular armor plates with mournful scarlet optics.', rarity: 'epic', price: 360, category: 'store', coat: '#f1f5f9', trim: '#dc2626', visor: '#ff003c', pants: '#1e293b' },
  { id: 'daywalker_vanguard', name: 'BLOOD RAVE VANGUARD', desc: 'Titanium body-armor vest over a black tactical trench and UV shades.', rarity: 'epic', price: 390, category: 'store', coat: '#0a0a0a', trim: '#991b1b', visor: '#ff003c', pants: '#000000' },
  { id: 'cracked_mirror_double', name: 'DOPPELGANGER SHARD', desc: 'Reflective glass-fragmented coat showing the face behind the mask.', rarity: 'epic', price: 320, category: 'store', coat: '#475569', trim: '#e2e8f0', visor: '#38bdf8', pants: '#1e293b' },
  { id: 'rain_haze_sniper', name: 'DOWNPOUR MARKSMAN', desc: 'Hydrophobic gill-cloak designed for Acid Wasteland roof perches.', rarity: 'rare', price: 250, category: 'store', coat: '#0c4a6e', trim: '#0284c7', visor: '#00f0ff', pants: '#082f49' },
  { id: 'vhs_tracking_error', name: 'MAGNETIC RIBBON WRAITH', desc: 'Wrapped in unspooled VHS tape that hisses in the wind.', rarity: 'rare', price: 260, category: 'store', coat: '#18181b', trim: '#a855f7', visor: '#e879f9', pants: '#09090b' },
  { id: 'black_van_driver', name: 'EXTRACTION WHEELMAN', desc: 'Kevlar driving gloves, ballistic vest, and night-vision driving visor.', rarity: 'rare', price: 235, category: 'store', coat: '#111827', trim: '#10b981', visor: '#34d399', pants: '#030712' },
  { id: 'monochrome_Ronin', name: 'SILVER SCREEN RONIN', desc: 'High-contrast 35mm noir trench stripped of all color saturation.', rarity: 'epic', price: 350, category: 'store', coat: '#262626', trim: '#d4d4d4', visor: '#ffffff', pants: '#171717' },
  { id: 'omega_enforcer', name: 'SYNDICATE OMEGA COMMAND', desc: 'Supreme high-council obsidian armor with twin plasma cells.', rarity: 'legendary', price: 400, category: 'store', coat: '#090b10', trim: '#f43f5e', visor: '#00f0ff', pants: '#000000' },

  // GROUP 3: STUDIO ENGINEERING & DAW WORKFLOW (Skins 91-105 | 180-280 Tokens)
  { id: '808_mono_baseman', name: '808 MONO BASEMAN', desc: 'Sub-bass reactive heavy coat with cyan LED pulse meter down both arms.', rarity: 'rare', price: 200, category: 'store', coat: '#090d16', trim: '#00f0ff', visor: '#00f0ff', pants: '#05070c' },
  { id: 'dynamic_eq_specialist', name: 'DYNAMIC EQ SPECIALIST', desc: 'Dual-tone orange/charcoal jacket with active bell-curve graph patch.', rarity: 'rare', price: 190, category: 'store', coat: '#1c1917', trim: '#f97316', visor: '#fdba74', pants: '#0c0a09' },
  { id: 'patch_cable_weaver', name: 'PATCH CABLE WEAVER', desc: 'Tactical harness woven out of multi-colored 1/4-inch studio patch cables.', rarity: 'rare', price: 185, category: 'store', coat: '#1e1b4b', trim: '#ec4899', visor: '#facc15', pants: '#0f172a' },
  { id: 'reese_bass_juggernaut', name: 'REESE BASS JUGGERNAUT', desc: 'Padded low-frequency sub-suit with motorized detuned saw pack.', rarity: 'epic', price: 250, category: 'store', coat: '#31102f', trim: '#db2777', visor: '#f472b6', pants: '#180617' },
  { id: 'transient_carver', name: 'TRANSIENT CARVER', desc: 'Sharp geometric angles, ultra-clean edges, and razor-sharp white accents.', rarity: 'rare', price: 210, category: 'store', coat: '#0f172a', trim: '#f8fafc', visor: '#38bdf8', pants: '#020617' },
  { id: 'pink_noise_ghost', name: 'PINK NOISE GHOST', desc: 'Subtle TV-snow patterned jacket tuned to a flat -12 dBFS profile.', rarity: 'rare', price: 180, category: 'store', coat: '#4c0519', trim: '#fb7185', visor: '#ffe4e6', pants: '#1f030b' },
  { id: 'sidechain_commando', name: 'SIDECHAIN COMMANDO', desc: 'Pumping compressor gain-reduction meters illuminated on the forearms.', rarity: 'rare', price: 220, category: 'store', coat: '#1e293b', trim: '#22c55e', visor: '#4ade80', pants: '#0f172a' },
  { id: 'tape_reel_archivist', name: 'TAPE REEL ARCHIVIST', desc: 'Twin miniature spinning 2-inch master spools mounted on collar lapels.', rarity: 'rare', price: 230, category: 'store', coat: '#451a03', trim: '#d97706', visor: '#fde047', pants: '#1c1917' },
  { id: 'patcher_architect', name: 'PATCHER ARCHITECT', desc: 'Complex multi-node cyan and green routing cables mapped across chest.', rarity: 'epic', price: 260, category: 'store', coat: '#042f2e', trim: '#14b8a6', visor: '#00f0ff', pants: '#021716' },
  { id: 'haas_stereo_scout', name: 'HAAS STEREO SCOUT', desc: 'Asymmetrical jacket: left side pitch-shifted blue, right side delayed pink.', rarity: 'rare', price: 215, category: 'store', coat: '#1e3a8a', trim: '#ec4899', visor: '#00f0ff', pants: '#0f172a' },
  { id: 'true_peak_sentinel', name: 'TRUE PEAK SENTINEL', desc: 'Shielded red-line limiter armor with warning indicators at -0.3 dB.', rarity: 'epic', price: 275, category: 'store', coat: '#18181b', trim: '#ff003c', visor: '#facc15', pants: '#09090b' },
  { id: 'ghost_note_stalker', name: 'GHOST NOTE STALKER', desc: 'Semi-transparent pale gray silhouette mirroring the MIDI piano roll.', rarity: 'rare', price: 195, category: 'store', coat: '#334155', trim: '#94a3b8', visor: '#cbd5e1', pants: '#1e293b' },
  { id: 'edison_slicer', name: 'EDISON WAVE SLICER', desc: 'Precision optical goggles and glowing zero-crossing waveform blade.', rarity: 'rare', price: 225, category: 'store', coat: '#0f172a', trim: '#38bdf8', visor: '#7dd3fc', pants: '#020617' },
  { id: 'overdrive_alchemist', name: 'PREAMP OVERDRIVE', desc: 'Burnished copper flight suit with warm glowing vacuum-tube shoulders.', rarity: 'epic', price: 265, category: 'store', coat: '#7c2d12', trim: '#f59e0b', visor: '#fef08a', pants: '#431407' },
  { id: 'vocal_ducking_vip', name: 'VALHALLA REVERB VIP', desc: 'High-gloss dark velvet coat that trails shimmering decay particles.', rarity: 'epic', price: 280, category: 'store', coat: '#2e1065', trim: '#a855f7', visor: '#e879f9', pants: '#1e1b4b' },

  // GROUP 4: TRACK TITLES & CATALOG LEGENDS (Skins 106-120 | 500-1000 Tokens)
  { id: 'martian_scholar', name: 'MARTIAN SCHOLAR', desc: 'Deep purple astronaut flight suit with official Martian University patch.', rarity: 'epic', price: 500, category: 'store', coat: '#4c1d95', trim: '#c084fc', visor: '#00f0ff', pants: '#2e1065' },
  { id: 'campus_astronaut', name: 'CAMPUS ASTRONAUT', desc: 'Heavy padded white EVA environmental suit with gold polarized visor.', rarity: 'epic', price: 525, category: 'store', coat: '#f8fafc', trim: '#cbd5e1', visor: '#eab308', pants: '#334155' },
  { id: 'high_roller_777', name: '777 HIGH ROLLER', desc: 'Black velvet tuxedo with shimmering gold numeral dice embroidery.', rarity: 'legendary', price: 650, category: 'store', coat: '#09090b', trim: '#eab308', visor: '#fef08a', pants: '#000000' },
  { id: 'living_on_the_highs', name: 'LIVING ON THE HIGHS', desc: 'Sunset gradient flight jacket trailing warm stratosphere cloud embers.', rarity: 'legendary', price: 600, category: 'store', coat: '#be185d', trim: '#f97316', visor: '#fde047', pants: '#4c0519' },
  { id: 'hold_me_down_sentry', name: 'HOLD ME DOWN SENTRY', desc: 'Reinforced titanium leg braces and gravity-anchored shoulder clamps.', rarity: 'epic', price: 550, category: 'store', coat: '#1e293b', trim: '#38bdf8', visor: '#00f0ff', pants: '#0f172a' },
  { id: 'xx_executioner', name: 'XX IT EXECUTIONER', desc: 'Crossed dual neon-magenta X visor optics with matte-black cloak.', rarity: 'legendary', price: 680, category: 'store', coat: '#050507', trim: '#ec4899', visor: '#ff003c', pants: '#000000' },
  { id: 'loud_decibel_breaker', name: 'LOUD! DECIBEL BREAKER', desc: 'Heavy industrial riot suit with high-output acoustic horn pauldrons.', rarity: 'legendary', price: 620, category: 'store', coat: '#1c1917', trim: '#ef4444', visor: '#facc15', pants: '#0c0a09' },
  { id: 'dancing_nightcore', name: 'DANCING // 150 BPM NIGHTCORE', desc: 'Hyper-speed electric pink windbreaker with high-voltage cyan trim.', rarity: 'legendary', price: 700, category: 'store', coat: '#db2777', trim: '#00f0ff', visor: '#ffffff', pants: '#831843' },
  { id: 'dancing_slowed_reverb', name: 'DANCING // 104 BPM SLOWED', desc: 'Heavy trailing dark-plum trench surrounded by chopped & screwed haze.', rarity: 'legendary', price: 700, category: 'store', coat: '#3b0764', trim: '#9333ea', visor: '#d8b4fe', pants: '#1e1b4b' },
  { id: 'dancing_vip_rave', name: 'DANCING // 138 VIP TECHNO', desc: 'Four-on-the-floor strobe suit flashing in sync with the acid kick.', rarity: 'legendary', price: 777, category: 'store', coat: '#052e16', trim: '#4ade80', visor: '#00f0ff', pants: '#022c22' },
  { id: 'district_84_veteran', name: 'DISTRICT 84 VETERAN', desc: 'Scuffed retro arcade attendant uniform with rare enamel cabinet pins.', rarity: 'epic', price: 540, category: 'store', coat: '#1e1b4b', trim: '#f43f5e', visor: '#22d3ee', pants: '#0f172a' },
  { id: 'cassette_airdrop_vip', name: 'CASSETTE AIR-DROP VIP', desc: 'Gold-foil insulated courier suit with official syndicate manifest tags.', rarity: 'legendary', price: 800, category: 'store', coat: '#713f12', trim: '#facc15', visor: '#fef08a', pants: '#422006' },
  { id: 'syndicate_director', name: 'SHORT FILM AUTEUR', desc: 'Director slate-gray tactical trench with 35mm anamorphic lens visor.', rarity: 'legendary', price: 850, category: 'store', coat: '#18181b', trim: '#e4e4e7', visor: '#ff003c', pants: '#09090b' },
  { id: 'lowlife_legend', name: 'RETROCADE TO WASTELAND', desc: 'Iridescent split-era duster shifting between neon pink and matte black.', rarity: 'mythic', price: 925, category: 'store', coat: '#090b10', trim: '#ec4899', visor: '#00f0ff', pants: '#1e1b4b' },
  { id: 'grandmaster_producer', name: 'GRANDMASTER PRODUCER', desc: 'Sovereign black-and-gold studio mantle with holographic master fader.', rarity: 'mythic', price: 1000, category: 'store', coat: '#000000', trim: '#facc15', visor: '#ffffff', pants: '#09090b' }
];

const State = {
  RARE_TAPES_THRESHOLD: 50,
  currentDimension: 'underground',
  activeMiniGame: null,
  activeWardrobeFilter: 'all', // 'all' | 'unlocked' | 'store'

  DIMENSIONS: {
    underground: { name: "UNDERGROUND NIGHT SHIFT", width: 2400, height: 1200, defaultSpawn: { x: 350, y: 750 } },
    retrocade: { name: "NIRVANA (RETROCADE)", width: 2400, height: 1200, defaultSpawn: { x: 1200, y: 750 } },
    wasteland: { name: "THE CORRUPTION", width: 6400, height: 4800, defaultSpawn: { x: 650, y: 1100 } }
  },

  // Level Milestone Skin Map (Dossier Section 6)
  LEVEL_MILESTONE_SKINS: {
    2: 'recruit',
    4: 'tactical_op',
    6: 'sub_level_slayer',
    8: 'phase_assassin',
    10: 'lowlife_prime'
  },

  // Studio Hardware Relic Catalog (Phase 3 Stat Modifiers)
  STUDIO_GEAR_DATA: [
    {
      id: "relic_peak_controller",
      name: "FRUITY PEAK CONTROLLER",
      slot: "dynamics",
      icon: "🎚️",
      desc: "Inverted peak sidechaining. Reduces all incoming combat and collision damage by 20%.",
      buffText: "-20% DAMAGE TAKEN"
    },
    {
      id: "relic_sub_woofer",
      name: "SUB-100HZ MONO SUB-WOOFER",
      slot: "low_end",
      icon: "🔊",
      desc: "Summed pure mono sub punch. Expands [K] Devastating Breaker AoE radius from 220px to 310px and deals 225 damage.",
      buffText: "+90PX SHOCKWAVE AOE"
    },
    {
      id: "relic_tape_saturator",
      name: "ANALOG TAPE SATURATOR",
      slot: "harmonics",
      icon: "📼",
      desc: "Warm high-order harmonics. Increases [J] plasma projectile damage by 35% and turns plasma fiery orange.",
      buffText: "+35% PLASMA POWER"
    },
    {
      id: "relic_gross_beat",
      name: "GROSS BEAT TIME-SHIFTER",
      slot: "modulation",
      icon: "⏱️",
      desc: "Glitch-step time control. Boosts sprint speed by 20% and leaves after-image glitch echoes while moving.",
      buffText: "+20% SPRINT SPEED"
    }
  ],

  loreTapes: [
    {
      id: "lore_sub_bass",
      dim: "underground",
      x: 960, y: 215,
      title: "TAPE 01: 808 SUB HARMONICS",
      text: "The low-end sub on 'DANCING' is summed to pure mono below 100 Hz. When sub-frequencies spread into stereo, they cause severe phase cancellation on massive club sound systems and mobile speakers alike."
    },
    {
      id: "lore_fl_peak",
      dim: "underground",
      x: 1530, y: 150,
      title: "TAPE 02: THE FRUITY PEAK SIDECHAIN",
      text: "Instead of heavy compressor sidechaining that muddies the mix, linking the bass fader to Fruity Peak Controller with an inverted peak formula drops the bass instantly with zero pumping artifacts."
    },
    {
      id: "lore_retrocade_era",
      dim: "retrocade",
      x: 350, y: 310,
      title: "TAPE 03: THE RETROCADE ERA",
      text: "The original Retrocade sound was vibrant, upbeat electronic trap filled with electric cyan and magenta synths. In this new chapter, that era is held hostage as the sound mutates into darker industrial melodic rap."
    },
    {
      id: "lore_vip_techno",
      dim: "retrocade",
      x: 1950, y: 310,
      title: "TAPE 04: EXTENDED ALBUM CUTS",
      text: "The physical cassette giveaway features exclusive, unreleased VIP edits and extended tracks for 'Retro Cade Evolved' that were held back from mainstream streaming platforms."
    },
    {
      id: "lore_bonfire",
      dim: "wasteland",
      x: 2300, y: 2850,
      title: "TAPE 05: CONNER CADE'S SAFE ZONE",
      text: "Conner Cade's creative bonfire is a sanctuary in the center of the Corruption. Here, Milwaukee underground creatives gather to trade stems, test unreleased visualizers, and escape the syndicate signal."
    },
    {
      id: "lore_blade_rebrand",
      dim: "wasteland",
      x: 3680, y: 3950,
      title: "TAPE 06: BLADE X CASSHERN SINS",
      text: "The visual aesthetic for this new era was conceptualized as Blade walking through Casshern Sins—stark contrast, sweeping dusters, blacked-out helmets, and harsh CRT static."
    }
  ],

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

  SKINS_DATA: [
    // SKINS 01-60: BASE, MILESTONES, BOSS DROPS & EXPLORATION SECRETS
    { id: 'enforcer', name: 'THE NEW ERA ENFORCER', desc: 'Default tactical duster with neon cyan visor.', rarity: 'common', coat: '#090b10', trim: '#161d2a', visor: '#00f0ff', pants: '#06080c' },
    { id: 'recruit', name: 'SYNDICATE RECRUIT', desc: 'Unlocked at Level 2. Gray combat vest with amber target optics.', rarity: 'common', reqLevel: 2, coat: '#1f242e', trim: '#2d3748', visor: '#f59e0b', pants: '#11141a' },
    { id: 'vanguard', name: 'STREET VANGUARD', desc: 'Heavy street hoodie and crimson breather mask.', rarity: 'uncommon', price: 60, category: 'store', coat: '#18181b', trim: '#ef4444', visor: '#ff003c', pants: '#09090b' },
    { id: 'alley_runner', name: 'ALLEY RUNNER', desc: 'Lightweight runner windbreaker with acid-green stripes.', rarity: 'uncommon', price: 65, category: 'store', coat: '#14532d', trim: '#22c55e', visor: '#10b981', pants: '#052e16' },
    { id: 'concrete_ghost', name: 'CONCRETE GHOST', desc: 'Matte-white winter trench and smoked visor.', rarity: 'rare', price: 120, category: 'store', coat: '#e2e8f0', trim: '#94a3b8', visor: '#38bdf8', pants: '#475569' },
    { id: 'tactical_op', name: 'TACTICAL OPERATIVE', desc: 'Unlocked at Level 4. Ballistic harness and reinforced knee struts.', rarity: 'uncommon', reqLevel: 4, coat: '#27272a', trim: '#3f3f46', visor: '#a855f7', pants: '#18181b' },
    { id: 'midnight_patrol', name: 'MIDNIGHT PATROL', desc: 'Deep-navy stealth slicker with electric blue optic.', rarity: 'rare', price: 135, category: 'store', coat: '#0c1322', trim: '#1e3a8a', visor: '#3b82f6', pants: '#080d1a' },
    { id: 'night_drive', name: 'NIGHT-DRIVE DRIFTER', desc: 'Leather bomber jacket and polarized sunset lenses.', rarity: 'rare', price: 145, category: 'store', coat: '#451a03', trim: '#d97706', visor: '#f97316', pants: '#1c1917' },
    { id: 'asphalt_raider', name: 'ASPHALT RAIDER', desc: 'Road-burned biker leathers with spiked cuffs.', rarity: 'rare', price: 150, category: 'store', coat: '#1c1917', trim: '#78350f', visor: '#fbbf24', pants: '#0c0a09' },
    { id: 'lowlife_prime', name: 'LOWLIFE PRIME', desc: 'Unlocked at Level 10. Chrome-trimmed syndicate trench with violet energy veins.', rarity: 'legendary', reqLevel: 10, coat: '#1e1b4b', trim: '#6366f1', visor: '#c084fc', pants: '#0f172a' },
    { id: 'old_self', name: 'THE OLD SELF (CAPTIVE)', desc: 'Saturated vintage graphic tee from the upbeat trap era.', rarity: 'legendary', coat: '#ec4899', trim: '#06b6d4', visor: '#facc15', pants: '#3b82f6' },
    { id: 'pixel_kid', name: '8-BIT PIXEL KID', desc: 'Cyan and magenta high-res pixel grid windbreaker.', rarity: 'uncommon', price: 70, category: 'store', coat: '#0891b2', trim: '#f43f5e', visor: '#22d3ee', pants: '#0e7490' },
    { id: 'arcade_geeker', name: 'ARCADE GEEKER', desc: 'Oversized mustard coat with vintage neck cans.', rarity: 'common', price: 50, category: 'store', coat: '#ca8a04', trim: '#eab308', visor: '#fef08a', pants: '#713f12' },
    { id: 'retrowave_rider', name: 'RETROWAVE RIDER', desc: 'Sunset gradient track coat and mirror aviator shades.', rarity: 'rare', price: 140, category: 'store', coat: '#be185d', trim: '#fb7185', visor: '#f43f5e', pants: '#881337' },
    { id: 'synth_phantom', name: 'SYNTHWAVE PHANTOM', desc: 'Electric-violet grid trench with flowing wire ribbons.', rarity: 'rare', price: 165, category: 'store', coat: '#581c87', trim: '#a855f7', visor: '#e879f9', pants: '#3b0764' },
    { id: 'joystick_brawler', name: 'JOYSTICK BRAWLER', desc: 'Sleeveless denim cut-off and tournament headband.', rarity: 'uncommon', price: 80, category: 'store', coat: '#1d4ed8', trim: '#dc2626', visor: '#ef4444', pants: '#1e3a8a' },
    { id: 'crt_glitch', name: 'CRT GLITCH ECHO', desc: 'Body constantly strobing with interlaced TV scanlines.', rarity: 'epic', price: 260, category: 'store', coat: '#334155', trim: '#64748b', visor: '#e2e8f0', pants: '#1e293b' },
    { id: 'tape_head', name: 'TAPE HEAD OPERATIVE', desc: 'Wears a battle cassette deck harnessed to chest.', rarity: 'epic', price: 270, category: 'store', coat: '#713f12', trim: '#eab308', visor: '#fde047', pants: '#451a03' },
    { id: 'neon_qb', name: 'NEON QUARTERBACK', desc: 'Heavy sports varsity wool in radioactive pink/teal.', rarity: 'uncommon', price: 90, category: 'store', coat: '#db2777', trim: '#06b6d4', visor: '#67e8f9', pants: '#9d174d' },
    { id: 'high_score_king', name: 'HIGH-SCORE KING', desc: 'Golden crown chassis and iridescent champion mantle.', rarity: 'legendary', price: 450, category: 'store', coat: '#eab308', trim: '#fef08a', visor: '#ffffff', pants: '#854d0e' },
    { id: 'blade_zero', name: 'BLADE-ZERO // EXECUTIONER', desc: 'The dreaded trench duster dropped by the Holding Chamber Boss.', rarity: 'mythic', coat: '#050507', trim: '#ff003c', visor: '#ff003c', pants: '#000000' },
    { id: 'casshern_android', name: 'CASSHERN ANDROID', desc: 'Matte-white battle chassis with gold helmet crest.', rarity: 'mythic', price: 880, category: 'store', coat: '#f8fafc', trim: '#e2e8f0', visor: '#eab308', pants: '#0f172a' },
    { id: 'sub_level_slayer', name: 'SUB-LEVEL SLAYER', desc: 'Unlocked at Level 6. Armored external spine brace and dual optics.', rarity: 'epic', reqLevel: 6, coat: '#1e293b', trim: '#0284c7', visor: '#38bdf8', pants: '#0f172a' },
    { id: 'drone_whisperer', name: 'DRONE QUEEN SLAYER', desc: 'Turbine drone chassis worn as a shoulder pauldron.', rarity: 'epic', coat: '#0f172a', trim: '#00f0ff', visor: '#00f0ff', pants: '#020617' },
    { id: 'chem_enforcer', name: 'CHEM-ENFORCER UNIT 09', desc: 'Sludge-sealed chemical hazmat dropped by Silo Boss.', rarity: 'epic', coat: '#3f6212', trim: '#84cc16', visor: '#a3e635', pants: '#1a2e05' },
    { id: 'neural_ripper', name: 'NEURAL RIPPER', desc: 'Exposed brainstem circuitry with pulsing telemetry.', rarity: 'rare', price: 175, category: 'store', coat: '#312e81', trim: '#818cf8', visor: '#c7d2fe', pants: '#1e1b4b' },
    { id: 'mono_ronin', name: 'MONO RONIN', desc: 'Conical straw hat woven from carbon cyber cables.', rarity: 'rare', price: 185, category: 'store', coat: '#18181b', trim: '#a1a1aa', visor: '#f43f5e', pants: '#09090b' },
    { id: 'carbon_enforcer', name: 'CARBON ENFORCER', desc: 'Woven carbon fiber chestplate with glowing orange heat vents.', rarity: 'rare', price: 170, category: 'store', coat: '#1c1917', trim: '#ea580c', visor: '#ff7700', pants: '#0c0a09' },
    { id: 'phase_assassin', name: 'PHASE-SHIFT ASSASSIN', desc: 'Unlocked at Level 8. Vibrating translucent silhouette with after-image trails.', rarity: 'legendary', reqLevel: 8, coat: '#4c1d95', trim: '#8b5cf6', visor: '#ddd6fe', pants: '#2e1065' },
    { id: 'syndicate_warlord', name: 'SYNDICATE WARLORD', desc: 'Heavy fur-lined tactical mantle with gilded bionic arm.', rarity: 'legendary', price: 480, category: 'store', coat: '#292524', trim: '#ca8a04', visor: '#facc15', pants: '#1c1917' },
    { id: 'drifter', name: 'WASTELAND DRIFTER', desc: 'Torn hooded poncho over a weathered tactical rig.', rarity: 'rare', coat: '#292524', trim: '#78716c', visor: '#ff7700', pants: '#1c1917' },
    { id: 'sludge_scavenger', name: 'SLUDGE SCAVENGER', desc: 'Heavy rubberized boots and patched chemical tarp coat.', rarity: 'common', price: 55, category: 'store', coat: '#365314', trim: '#4d7c0f', visor: '#84cc16', pants: '#1a2e05' },
    { id: 'rust_belt_nomad', name: 'RUST-BELT NOMAD', desc: 'Shoulder pads forged from scrap metal highway signs.', rarity: 'uncommon', price: 85, category: 'store', coat: '#7c2d12', trim: '#9a3412', visor: '#fdba74', pants: '#431407' },
    { id: 'cave_stalker', name: 'CAVE STALKER', desc: 'Quad-night-vision goggles and mountaineering harness.', rarity: 'rare', price: 155, category: 'store', coat: '#1e293b', trim: '#475569', visor: '#22c55e', pants: '#0f172a' },
    { id: 'drainage_hermit', name: 'DRAINAGE HERMIT', desc: 'Corroded neoprene diver suit and twin oxygen bottles.', rarity: 'uncommon', price: 90, category: 'store', coat: '#134e4a', trim: '#0d9488', visor: '#2dd4bf', pants: '#042f2e' },
    { id: 'toxic_golem', name: 'TOXIC MOSS GOLEM', desc: 'Tactical body armor overgrown with luminescent wasteland flora.', rarity: 'rare', price: 160, category: 'store', coat: '#14532d', trim: '#16a34a', visor: '#4ade80', pants: '#052e16' },
    { id: 'scrap_mechanic', name: 'SCRAP MECHANIST', desc: 'Welding mask and tool belts sparking on movement.', rarity: 'uncommon', price: 95, category: 'store', coat: '#44403c', trim: '#78716c', visor: '#f59e0b', pants: '#292524' },
    { id: 'dune_strider', name: 'DUNE STRIDER', desc: 'Linen dust cloaks and polarized sandstorm blast goggles.', rarity: 'uncommon', price: 85, category: 'store', coat: '#78716c', trim: '#a8a29e', visor: '#38bdf8', pants: '#57534e' },
    { id: 'silo_survivor', name: 'SILO SURVIVOR', desc: 'Lead-lined lab coat over industrial steel-toe trousers.', rarity: 'rare', price: 145, category: 'store', coat: '#334155', trim: '#64748b', visor: '#facc15', pants: '#1e293b' },
    { id: 'obsidian_scout', name: 'OBSIDIAN SCOUT', desc: 'Chiseled black stone armor that deflects sniper lasers.', rarity: 'epic', price: 295, category: 'store', coat: '#09090b', trim: '#27272a', visor: '#a855f7', pants: '#000000' },
    { id: 'velvet_vip', name: 'VELVET VIP', desc: 'Burgundy silk tailored trench and wireframe sunglasses.', rarity: 'rare', price: 160, category: 'store', coat: '#881337', trim: '#9f1239', visor: '#fecdd3', pants: '#4c0519' },
    { id: 'jackpot_777', name: 'JACKPOT 777', desc: 'Shimmering gold sequin tuxedo with holographic coins.', rarity: 'epic', price: 333, category: 'store', coat: '#ca8a04', trim: '#eab308', visor: '#fef08a', pants: '#713f12' },
    { id: 'dj_resident', name: 'DJ RESIDENT', desc: 'Turntable slipmat cape and active visualizer headphones.', rarity: 'rare', price: 180, category: 'store', coat: '#4c1d95', trim: '#7c3aed', visor: '#c084fc', pants: '#2e1065' },
    { id: 'vinyl_cutter', name: 'VINYL CUTTER', desc: 'Heavy leather mixing apron studded with rotary dial knobs.', rarity: 'uncommon', price: 95, category: 'store', coat: '#18181b', trim: '#3f3f46', visor: '#00f0ff', pants: '#09090b' },
    { id: 'neon_dancer', name: 'NEON DANCER', desc: 'UV-reactive body harness with animated pulsing light bands.', rarity: 'uncommon', price: 100, category: 'store', coat: '#0284c7', trim: '#38bdf8', visor: '#f43f5e', pants: '#0369a1' },
    { id: 'chip_leader', name: 'CHIP LEADER', desc: 'Trench coat lined with gold high-stakes casino plaques.', rarity: 'rare', price: 190, category: 'store', coat: '#1e1b4b', trim: '#eab308', visor: '#fbbf24', pants: '#0f172a' },
    { id: 'diamond_dealer', name: 'DIAMOND DEALER', desc: 'Crisp white card croupier vest and mirror-plated visor.', rarity: 'rare', price: 175, category: 'store', coat: '#f8fafc', trim: '#cbd5e1', visor: '#38bdf8', pants: '#0f172a' },
    { id: 'bassline_groover', name: 'BASSLINE GROOVER', desc: 'Puffer coat that vibrates and bounces to the live BGM bass.', rarity: 'uncommon', price: 105, category: 'store', coat: '#9d174d', trim: '#db2777', visor: '#f472b6', pants: '#700736' },
    { id: 'discotheque_diva', name: 'DISCOTHEQUE DIVA', desc: 'Silver mirror-ball fragmented crop jacket and combat boots.', rarity: 'rare', price: 165, category: 'store', coat: '#94a3b8', trim: '#e2e8f0', visor: '#ec4899', pants: '#334155' },
    { id: 'high_stakes_ghost', name: 'HIGH-STAKES GHOST', desc: 'Emerald translucent silhouette shuffling neon deck cards.', rarity: 'epic', price: 310, category: 'store', coat: '#065f46', trim: '#10b981', visor: '#6ee7b7', pants: '#022c22' },
    { id: 'spotify_streamer', name: 'SPOTIFY STREAMER', desc: 'Unlocked by streaming DANCING. Mint-green frequency aura.', rarity: 'legendary', coat: '#052e16', trim: '#10b981', visor: '#1db954', pants: '#022c22' },
    { id: 'apple_lossless', name: 'APPLE LOSSLESS MASTER', desc: 'Minimalist white titanium shell with spatial audio rings.', rarity: 'legendary', coat: '#f1f5f9', trim: '#ffffff', visor: '#ff003c', pants: '#0f172a' },
    { id: 'redbull_rebel', name: 'REDBULL SETLIST REBEL', desc: 'Rally-style bomber jacket sporting the Chicago underground patch.', rarity: 'rare', price: 200, category: 'store', coat: '#1e3a8a', trim: '#dc2626', visor: '#facc15', pants: '#172554' },
    { id: 'bonfire_chronicler', name: 'BONFIRE CHRONICLER', desc: 'Wool-lined parka with live embers trailing your footprints.', rarity: 'rare', price: 195, category: 'store', coat: '#7c2d12', trim: '#ea580c', visor: '#f97316', pants: '#431407' },
    { id: 'sound_designer', name: 'THE SOUND DESIGNER', desc: 'Active 10-band graphic equalizer animated on back of trench.', rarity: 'epic', price: 285, category: 'store', coat: '#0f172a', trim: '#00f0ff', visor: '#a855f7', pants: '#020617' },
    { id: 'fl_alchemist', name: 'FL STUDIO ALCHEMIST', desc: 'Orange mixer cap with physical volume faders on arm sleeves.', rarity: 'rare', price: 210, category: 'store', coat: '#9a3412', trim: '#ea580c', visor: '#fb923c', pants: '#431407' },
    { id: 'tape_winner', name: 'THE 6-WINNER CLAIMANT', desc: 'Unlocked via Google Form claim. Pure gold cassette aura.', rarity: 'mythic', coat: '#713f12', trim: '#facc15', visor: '#ffffff', pants: '#451a03' },
    { id: 'static_nightmare', name: 'STATIC NIGHTMARE', desc: 'Grainy black-and-white silhouette torn from the CRT monitor.', rarity: 'mythic', coat: '#18181b', trim: '#71717a', visor: '#ffffff', pants: '#09090b' },
    { id: 'horizon_celestial', name: 'HORIZON CELESTIAL', desc: 'Prismatic duster shimmering with distant dimension stars.', rarity: 'mythic', price: 950, category: 'store', coat: '#312e81', trim: '#ec4899', visor: '#00f0ff', pants: '#1e1b4b' },
    { id: 'the_creator', name: 'THE CREATOR // OMG LOWLIFE', desc: 'The signature crown, open trench, and master sound processor.', rarity: 'mythic', price: 1000, category: 'store', coat: '#000000', trim: '#facc15', visor: '#00f0ff', pants: '#09090b' },
    // SKINS 61-120: BLACK MARKET STORE POOL
    ...NEW_STORE_SKINS
  ],

  userProfile: {
    handle: "",
    level: 1,
    xp: 0,
    activeSkin: "enforcer",
    unlockedSkins: ["enforcer"],
    collectedRareTapes: 0,
    discoveredLoreTapes: [],
    // RPG Relic & Consumable Inventory (Phase 3 + Rev 5.10)
    unlockedRelics: [],
    equippedRelics: [],
    amberVials: 1,
    unlockedVipStem: false,
    hyperchargeTimer: 0,
    djOverdriveTimer: 0, // 3-min buff from DJ booth (10,800 frames @ 60fps)
    casinoTokens: 100,
    bossesDefeated: [],
    bossKillCounts: {}, // Tracks how many times each World Boss has been defeated
    chestsOpened: [],
    crtEnabled: true, // Persists CRT Scanlines On/Off preference
    lastDimension: "underground",
    lastPosition: { x: 350, y: 750 }
  },

  init() {
    try {
      const saved = localStorage.getItem('club_lowlife_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.userProfile = { ...this.userProfile, ...parsed };
        if (typeof this.userProfile.level !== 'number' || this.userProfile.level < 1) this.userProfile.level = 1;
        if (typeof this.userProfile.xp !== 'number' || this.userProfile.xp < 0) this.userProfile.xp = 0;
        if (!Array.isArray(this.userProfile.discoveredLoreTapes)) this.userProfile.discoveredLoreTapes = [];
        if (!Array.isArray(this.userProfile.unlockedRelics)) this.userProfile.unlockedRelics = [];
        if (!Array.isArray(this.userProfile.equippedRelics)) this.userProfile.equippedRelics = [];
        if (!Array.isArray(this.userProfile.bossesDefeated)) this.userProfile.bossesDefeated = [];
        if (!this.userProfile.bossKillCounts || typeof this.userProfile.bossKillCounts !== 'object') {
          this.userProfile.bossKillCounts = {};
        }
        // Backfill kill counts for any bosses defeated in older save states
        this.userProfile.bossesDefeated.forEach(bossId => {
          if (typeof this.userProfile.bossKillCounts[bossId] !== 'number' || this.userProfile.bossKillCounts[bossId] < 1) {
            this.userProfile.bossKillCounts[bossId] = 1;
          }
        });
        if (typeof this.userProfile.amberVials !== 'number') this.userProfile.amberVials = 1;
        if (typeof this.userProfile.djOverdriveTimer !== 'number') this.userProfile.djOverdriveTimer = 0;
        if (typeof this.userProfile.crtEnabled !== 'boolean') this.userProfile.crtEnabled = true;
        if (this.userProfile.lastDimension) this.currentDimension = this.userProfile.lastDimension;

        // Wasteland Pillar Rescue Subroutine (Dossier Section 1)
        if (
          this.currentDimension === 'wasteland' &&
          this.userProfile.lastPosition &&
          this.userProfile.lastPosition.x >= 580 &&
          this.userProfile.lastPosition.x <= 1550 &&
          this.userProfile.lastPosition.y >= 760 &&
          this.userProfile.lastPosition.y <= 860
        ) {
          this.userProfile.lastPosition = { x: 650, y: 1100 };
        }
      }
    } catch (e) {
      console.warn("Storage access restricted. Progress will be session-only.", e);
    }

    this.checkLevelSkinUnlocks(false);
    this.syncPlayerLevelStats(false);
    this.syncCrtState();
    this.updateHud();
    this.renderSkins();

    if (this.userProfile.unlockedVipStem) {
      this.syncVipStemOption();
    }

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

  // =========================================================================
  // CRT SCANLINES ON / OFF TOGGLE (Direct DOM & Class Control)
  // =========================================================================
  toggleCrt() {
    this.userProfile.crtEnabled = !this.userProfile.crtEnabled;
    this.syncCrtState();
    this.save();
    this.showToast(this.userProfile.crtEnabled ? "CRT SCANLINES: ONLINE 📺" : "CLEAN SCREEN MODE: CRT OFF ✨");
  },

  syncCrtState() {
    const enabled = this.userProfile.crtEnabled !== false;
    if (document.body) {
      document.body.classList.toggle('crt-disabled', !enabled);
    }

    const overlay = document.getElementById('crtOverlay') || document.querySelector('.crt-overlay');
    const vignette = document.getElementById('crtVignette') || document.querySelector('.crt-vignette');
    if (overlay) {
      overlay.style.display = enabled ? 'block' : 'none';
      overlay.style.opacity = enabled ? '1' : '0';
    }
    if (vignette) {
      vignette.style.display = enabled ? 'block' : 'none';
      vignette.style.opacity = enabled ? '1' : '0';
    }

    const btn = document.getElementById('crtToggleBtn');
    if (btn) {
      btn.innerText = enabled ? 'CRT: ON' : 'CRT: OFF';
      btn.className = enabled
        ? 'px-1.5 py-0.5 bg-[#0e1117] border border-[#00f0ff]/60 rounded text-[10px] sm:text-xs text-[#00f0ff] font-mono active:scale-95 transition'
        : 'px-1.5 py-0.5 bg-[#0e1117] border border-neutral-700 rounded text-[10px] sm:text-xs text-neutral-400 font-mono active:scale-95 transition';
    }
  },

  // =========================================================================
  // ASYMMETRIC PROGRESSION & LEVELING ENGINE (Dossier Section 5.1 & 5.2)
  // =========================================================================
  getXpForNextLevel(lvl = this.userProfile.level) {
    // Progressive XP curve: Lvl 1->2 = 150 XP, Lvl 2->3 = 225 XP, etc.
    return Math.floor(150 * Math.pow(1.35, Math.max(0, (lvl || 1) - 1)));
  },

  getPlayerDamageMultiplier() {
    // +5.0% offense scaling per level: 1 + (Level - 1) * 0.05
    const lvl = Math.max(1, this.userProfile.level || 1);
    return 1 + (lvl - 1) * 0.05;
  },

  getEnemyScaleMultiplier() {
    // +3.75% enemy HP & attack scaling per level: 1 + (Level - 1) * 0.0375
    const lvl = Math.max(1, this.userProfile.level || 1);
    return 1 + (lvl - 1) * 0.0375;
  },

  getPlayerMaxHp() {
    // +10 flat Max HP per level (Level 1: 100 HP -> Level 10: 190 HP)
    const lvl = Math.max(1, this.userProfile.level || 1);
    return 100 + (lvl - 1) * 10;
  },

  syncPlayerLevelStats(fullHeal = false) {
    if (typeof Entities !== 'undefined' && Entities && Entities.player) {
      const targetMaxHp = this.getPlayerMaxHp();
      Entities.player.maxHp = targetMaxHp;
      if (fullHeal || Entities.player.hp > targetMaxHp) {
        Entities.player.hp = targetMaxHp;
      }
      if (typeof Entities.updatePlayerHealthUI === 'function') {
        Entities.updatePlayerHealthUI();
      }
    }
  },

  checkLevelSkinUnlocks(notify = true) {
    const lvl = this.userProfile.level || 1;
    Object.keys(this.LEVEL_MILESTONE_SKINS).forEach(reqLvlStr => {
      const reqLvl = parseInt(reqLvlStr, 10);
      const skinId = this.LEVEL_MILESTONE_SKINS[reqLvl];
      if (lvl >= reqLvl && !this.userProfile.unlockedSkins.includes(skinId)) {
        this.userProfile.unlockedSkins.push(skinId);
        if (notify) {
          const skinObj = this.SKINS_DATA.find(s => s.id === skinId);
          this.showToast(`LEVEL ${reqLvl} MILESTONE SKIN: ${skinObj ? skinObj.name : skinId}! 🧥⚡`);
        }
      }
    });
  },

  addXp(amount, reason = "") {
    if (!amount || amount <= 0) return;
    this.userProfile.xp = (this.userProfile.xp || 0) + Math.round(amount);

    let leveledUp = false;
    while (this.userProfile.xp >= this.getXpForNextLevel(this.userProfile.level)) {
      this.userProfile.xp -= this.getXpForNextLevel(this.userProfile.level);
      this.userProfile.level = (this.userProfile.level || 1) + 1;
      leveledUp = true;
    }

    if (leveledUp) {
      this.syncPlayerLevelStats(true); // Full HP restore on level up
      this.checkLevelSkinUnlocks(true);
      this.renderSkins();
      if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
        AudioEngine.playSfx('win');
      }
      this.triggerScreenShake(14, 24);
      const dmgBonus = Math.round((this.getPlayerDamageMultiplier() - 1) * 100);
      this.showToast(`LEVEL UP! LVL ${this.userProfile.level} // MAX HP ${this.getPlayerMaxHp()} & +${dmgBonus}% DMG! ⚡🔼`);
    } else if (reason) {
      this.showToast(`+${amount} XP // ${reason}`);
    }

    this.save();
  },

  // =========================================================================
  // BLACK MARKET ECONOMY & TOKEN SINKS (Dossier Section 5.3 & 6)
  // =========================================================================
  buySkin(skinId) {
    const skin = this.SKINS_DATA.find(s => s.id === skinId);
    if (!skin) return false;

    if (this.userProfile.unlockedSkins.includes(skinId)) {
      this.userProfile.activeSkin = skinId;
      this.save();
      this.renderSkins();
      this.showToast(`EQUIPPED ${skin.name}`);
      return true;
    }

    const price = skin.price || 150;
    if (this.userProfile.casinoTokens < price) {
      this.showToast(`INSUFFICIENT TOKENS: NEED ${price - this.userProfile.casinoTokens} MORE 🪙!`);
      return false;
    }

    this.userProfile.casinoTokens -= price;
    this.userProfile.unlockedSkins.push(skinId);
    this.userProfile.activeSkin = skinId;

    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
      AudioEngine.playSfx('win');
    }

    this.save();
    this.renderSkins();
    this.renderBlackMarketStore();
    this.showToast(`PURCHASED & EQUIPPED: ${skin.name}! 🧥🪙`);
    return true;
  },

  buyAmberVial() {
    const cost = 40; // Dossier Section 5.3: 40 tokens emergency Amber Vial restock
    if (!this.spendTokens(cost)) {
      this.showToast(`NEED ${cost} SOUND TOKENS FOR AMBER VIAL RESTOCK! 🧪`);
      return false;
    }
    this.userProfile.amberVials = (this.userProfile.amberVials || 0) + 1;
    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
      AudioEngine.playSfx('coin');
    }
    this.save();
    this.renderGearRack();
    this.renderBlackMarketStore();
    this.showToast("BLACK MARKET RESTOCK: +1 AMBER DROPPER VIAL! 🧪");
    return true;
  },

  activateDjOverdrive() {
    const cost = 25; // Dossier Section 5.3: 25 tokens for 3 min (+15% speed & 2x floor yield)
    if (!this.spendTokens(cost)) {
      this.showToast(`NEED ${cost} TOKENS FOR DJ BOOTH OVERDRIVE! 🎧`);
      return false;
    }
    this.userProfile.djOverdriveTimer = 10800; // 3 minutes @ 60fps
    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
      AudioEngine.playSfx('win');
    }
    this.triggerScreenShake(10, 18);
    this.save();
    this.renderBlackMarketStore();
    this.showToast("DJ OVERDRIVE ENGAGED (3 MIN): +15% SPEED & 2X FLOOR TOKENS! 🎧⚡");
    return true;
  },

  bypassSecurityDoor(doorObj) {
    const cost = 50; // Dossier Section 5.3: 50 tokens electronic door security bypass
    if (!doorObj || doorObj.shattered) return false;
    if (!this.spendTokens(cost)) {
      this.showToast(`SECURITY BYPASS REQUIRES ${cost} SOUND TOKENS! 🔐`);
      return false;
    }
    doorObj.shattered = true;
    doorObj.hp = 0;
    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
      AudioEngine.playSfx('win');
    }
    this.triggerScreenShake(8, 14);
    this.addXp(35, "SECURITY OVERRIDE");
    this.showToast("SECURITY BARRIER BYPASSED (-50 TOKENS)! 🔓⚡");
    this.save();
    return true;
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

  // Use Amber Dropper Vial Consumable (Phase 3 [Q] Action)
  useAmberVial() {
    if (this.userProfile.amberVials <= 0) {
      this.showToast("NO AMBER VIALS! BUY RESTOCK IN STORE (40🪙) OR LOOT CHESTS 🧪");
      return;
    }
    this.userProfile.amberVials--;
    this.userProfile.hyperchargeTimer = 600; // 10 seconds @ 60fps

    if (typeof Entities !== 'undefined' && Entities.player) {
      Entities.player.hp = Math.min(Entities.player.maxHp, Entities.player.hp + 50);
      if (typeof Entities.updatePlayerHealthUI === 'function') Entities.updatePlayerHealthUI();
    }

    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
      AudioEngine.playSfx('win');
    }

    this.triggerScreenShake(12, 18);
    this.showToast("AMBER SUBSTANCE ADMINISTERED: +50 HP & 10S HYPERCHARGE! 🧪⚡");
    this.save();
  },

  // Studio Hardware Relic Management (Phase 3)
  unlockRelic(relicId) {
    if (!this.userProfile.unlockedRelics.includes(relicId)) {
      this.userProfile.unlockedRelics.push(relicId);
      const r = this.STUDIO_GEAR_DATA.find(item => item.id === relicId);
      this.showToast(`HARDWARE ACQUIRED: ${r ? r.name : relicId}! 🎛️`);
      if (this.userProfile.equippedRelics.length < 2) {
        this.userProfile.equippedRelics.push(relicId);
      }
      this.save();
    }
  },

  toggleEquipRelic(relicId) {
    const idx = this.userProfile.equippedRelics.indexOf(relicId);
    if (idx >= 0) {
      this.userProfile.equippedRelics.splice(idx, 1);
      this.showToast("HARDWARE UNMOUNTED FROM RACK");
    } else {
      if (this.userProfile.equippedRelics.length >= 2) {
        this.showToast("RACK SLOTS FULL (MAX 2 RELICS EQUIPPED)!");
        return;
      }
      this.userProfile.equippedRelics.push(relicId);
      const r = this.STUDIO_GEAR_DATA.find(item => item.id === relicId);
      this.showToast(`RACK MOUNTED: ${r ? r.name : relicId}! ⚡`);
    }
    this.save();
    this.renderGearRack();
  },

  hasRelicEquipped(relicId) {
    return Array.isArray(this.userProfile.equippedRelics) && this.userProfile.equippedRelics.includes(relicId);
  },

  unlockVipStem() {
    this.userProfile.unlockedVipStem = true;
    this.syncVipStemOption();
    this.showToast("MASTER STEM UNLOCKED: 'DYSTOPIAN VIP TECHNO' AVAILABLE IN BROADCAST HUD! 💿🔊");
    this.save();
  },

  syncVipStemOption() {
    const sel = document.getElementById('trackVersionSelect');
    if (sel && !sel.querySelector('option[value="vip_techno"]')) {
      const opt = document.createElement('option');
      opt.value = 'vip_techno';
      opt.innerText = 'VIP TECHNO (138)';
      opt.className = 'text-amber-400 font-bold';
      sel.appendChild(opt);
    }
  },

  renderGearRack() {
    const container = document.getElementById('gearListContainer');
    const vialBadge = document.getElementById('gearModalVialCount');
    if (vialBadge) vialBadge.innerText = this.userProfile.amberVials;
    if (!container) return;

    container.innerHTML = this.STUDIO_GEAR_DATA.map(g => {
      const isUnlocked = this.userProfile.unlockedRelics.includes(g.id);
      const isEquipped = this.hasRelicEquipped(g.id);
      const borderClass = isEquipped 
        ? "border-purple-400 bg-purple-950/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        : (isUnlocked ? "border-neutral-700 bg-black/60" : "border-neutral-900 bg-neutral-950 opacity-40");

      return `
        <div class="p-3 border rounded-lg ${borderClass} flex items-center justify-between gap-2 transition font-mono">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded bg-black border border-purple-500/40 flex items-center justify-center text-lg">
              ${g.icon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-cyber font-bold text-white text-xs">${g.name}</span>
                <span class="text-[8px] font-mono uppercase px-1 py-0.2 border border-purple-400 text-purple-300 rounded">${g.buffText}</span>
              </div>
              <p class="text-[10px] text-neutral-400 leading-tight mt-0.5">${g.desc}</p>
            </div>
          </div>
          <div>
            ${isUnlocked 
              ? `<button onclick="State.toggleEquipRelic('${g.id}')" class="px-2.5 py-1 text-xs rounded font-cyber transition ${isEquipped ? 'bg-purple-600 text-white font-bold' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'}">
                   ${isEquipped ? 'MOUNTED' : 'MOUNT'}
                 </button>`
              : '<span class="text-[10px] text-neutral-600 font-mono">[LOCKED]</span>'}
          </div>
        </div>
      `;
    }).join("");
  },

  inspectLoreTape(tape) {
    if (!Array.isArray(this.userProfile.discoveredLoreTapes)) {
      this.userProfile.discoveredLoreTapes = [];
    }
    let newlyDecoded = false;
    if (!this.userProfile.discoveredLoreTapes.includes(tape.id)) {
      this.userProfile.discoveredLoreTapes.push(tape.id);
      this.userProfile.collectedRareTapes++;
      newlyDecoded = true;
    }
    if (window.AudioEngine && typeof AudioEngine.playSfx === 'function') {
      AudioEngine.playSfx('win');
    }

    const modal = document.getElementById('loreModal');
    const title = document.getElementById('loreModalTitle');
    const text = document.getElementById('loreModalText');
    const count = document.getElementById('loreModalTapeCount');

    if (title) title.innerText = tape.title;
    if (text) text.innerText = tape.text;
    if (count) count.innerText = `${this.userProfile.collectedRareTapes}/${this.RARE_TAPES_THRESHOLD}`;
    if (modal) modal.classList.remove('hidden');

    if (newlyDecoded) {
      // Dossier Section 5.2: Catalog Lore Cassette Decoded = +75 XP
      this.addXp(75, "LORE CASSETTE DECODED");
    } else {
      this.save();
    }
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
    const vEl = document.getElementById('hudVialCount');
    if (vEl) vEl.innerText = this.userProfile.amberVials;

    const handleBadge = document.getElementById('hudCallsign');
    if (handleBadge) {
      const nameStr = this.userProfile.handle ? this.userProfile.handle.toUpperCase() : "UNREGISTERED";
      handleBadge.innerText = `LVL ${this.userProfile.level || 1} // ${nameStr}`;
    }

    // Level & XP HUD Elements (Step 4 Hookups)
    const lvlBadge = document.getElementById('hudPlayerLevel');
    if (lvlBadge) lvlBadge.innerText = `LVL ${this.userProfile.level || 1}`;
    const xpText = document.getElementById('hudPlayerXpText');
    const nextXp = this.getXpForNextLevel(this.userProfile.level);
    if (xpText) xpText.innerText = `${this.userProfile.xp || 0}/${nextXp} XP`;
    const xpBar = document.getElementById('hudPlayerXpBar');
    if (xpBar) {
      const xpPct = Math.min(100, Math.floor(((this.userProfile.xp || 0) / nextXp) * 100));
      xpBar.style.width = `${xpPct}%`;
    }

    const storeTokenEl = document.getElementById('storeModalTokenBalance');
    if (storeTokenEl) storeTokenEl.innerText = this.userProfile.casinoTokens;

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
    const targetX = spawnX !== undefined ? spawnX : (cfg && cfg.defaultSpawn ? cfg.defaultSpawn.x : 350);
    const targetY = spawnY !== undefined ? spawnY : (cfg && cfg.defaultSpawn ? cfg.defaultSpawn.y : 750);

    if (typeof Entities !== 'undefined' && Entities && Entities.player) {
      Entities.player.x = targetX;
      Entities.player.y = targetY;
    }
    const badge = document.getElementById('dimensionBadge');
    if (badge && cfg) badge.innerText = `DIMENSION: ${cfg.name}`;
    this.save();
    if (cfg) this.showToast(`WARPED TO ${cfg.name}! 🌀`);
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
    document.querySelectorAll('[id$="Modal"]').forEach(m => m.classList.add('hidden'));
    if (this.activeMiniGame && typeof this.activeMiniGame.stop === 'function') {
      this.activeMiniGame.stop();
    }
    this.activeMiniGame = null;
  },

  setWardrobeFilter(filterKey) {
    this.activeWardrobeFilter = filterKey || 'all';
    this.renderSkins();
  },

  renderSkins() {
    const list = document.getElementById('skinsList');
    if (!list) return;
    list.innerHTML = '';

    const filteredSkins = this.SKINS_DATA.filter(s => {
      const isUnlocked = this.userProfile.unlockedSkins.includes(s.id);
      if (this.activeWardrobeFilter === 'unlocked') return isUnlocked;
      if (this.activeWardrobeFilter === 'store') return !isUnlocked && typeof s.price === 'number';
      return true;
    });

    filteredSkins.forEach(s => {
      const isUnlocked = this.userProfile.unlockedSkins.includes(s.id);
      const isEquipped = this.userProfile.activeSkin === s.id;
      const item = document.createElement('div');
      item.className = `p-2.5 rounded border flex justify-between items-center gap-2 ${isEquipped ? 'border-[#00f0ff] bg-[#00f0ff]/10' : (isUnlocked ? 'border-neutral-700 bg-black/60' : 'border-neutral-800 bg-neutral-950/90')}`;
      
      const badgeColor = s.rarity === 'mythic' ? 'text-amber-400 border-amber-400' : s.rarity === 'legendary' ? 'text-purple-400 border-purple-400' : s.rarity === 'epic' ? 'text-cyan-400 border-cyan-400' : 'text-neutral-400 border-neutral-700';

      let actionHtml = '';
      if (isUnlocked) {
        actionHtml = isEquipped
          ? '<span class="text-[10px] text-[#00f0ff] font-cyber font-bold px-2">EQUIPPED</span>'
          : `<button onclick="State.userProfile.activeSkin='${s.id}';State.save();State.renderSkins();State.showToast('EQUIPPED ${s.name.replace(/'/g, "\\'")}');" class="px-2.5 py-1 bg-neutral-800 text-white rounded text-xs hover:bg-[#00f0ff] hover:text-black font-cyber transition">EQUIP</button>`;
      } else if (typeof s.price === 'number') {
        const canAfford = this.userProfile.casinoTokens >= s.price;
        actionHtml = `<button onclick="State.buySkin('${s.id}')" class="px-2.5 py-1 rounded text-xs font-cyber font-bold transition ${canAfford ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-neutral-900 text-amber-500/60 border border-amber-500/30'}">BUY ${s.price}🪙</button>`;
      } else if (s.reqLevel) {
        actionHtml = `<span class="text-[10px] text-purple-400 font-mono">[LVL ${s.reqLevel}]</span>`;
      } else {
        actionHtml = '<span class="text-[10px] text-neutral-600 font-mono">[VAULT/BOSS]</span>';
      }

      item.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-6 h-6 rounded flex items-center justify-center border shrink-0" style="background-color: ${s.coat}; border-color: ${s.visor}">
            <div class="w-2.5 h-1 rounded" style="background-color: ${s.visor}"></div>
          </div>
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-cyber font-bold text-white text-xs">${s.name}</span>
              <span class="text-[8px] font-mono uppercase px-1 py-0.2 border rounded ${badgeColor}">${s.rarity}</span>
            </div>
            <div class="text-[10px] text-neutral-400 leading-tight">${s.desc}</div>
          </div>
        </div>
        <div class="shrink-0">
          ${actionHtml}
        </div>
      `;
      list.appendChild(item);
    });
  },

  renderBlackMarketStore() {
    const container = document.getElementById('blackMarketStoreList');
    const tokenEl = document.getElementById('storeModalTokenBalance');
    if (tokenEl) tokenEl.innerText = this.userProfile.casinoTokens;
    if (!container) return;

    const storeSkins = this.SKINS_DATA.filter(s => typeof s.price === 'number');
    container.innerHTML = storeSkins.map(s => {
      const isUnlocked = this.userProfile.unlockedSkins.includes(s.id);
      const isEquipped = this.userProfile.activeSkin === s.id;
      const canAfford = this.userProfile.casinoTokens >= s.price;
      const badgeColor = s.rarity === 'mythic' ? 'text-amber-400 border-amber-400' : s.rarity === 'legendary' ? 'text-purple-400 border-purple-400' : s.rarity === 'epic' ? 'text-cyan-400 border-cyan-400' : 'text-neutral-400 border-neutral-700';

      return `
        <div class="p-2.5 rounded border flex justify-between items-center gap-2 ${isUnlocked ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-neutral-800 bg-black/70'}">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded flex items-center justify-center border shrink-0" style="background-color: ${s.coat}; border-color: ${s.visor}">
              <div class="w-3 h-1 rounded" style="background-color: ${s.visor}"></div>
            </div>
            <div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-cyber font-bold text-white text-xs">${s.name}</span>
                <span class="text-[8px] font-mono uppercase px-1 py-0.2 border rounded ${badgeColor}">${s.rarity}</span>
              </div>
              <div class="text-[10px] text-neutral-400 leading-tight">${s.desc}</div>
            </div>
          </div>
          <div class="shrink-0">
            ${isUnlocked
              ? (isEquipped
                  ? '<span class="text-[10px] text-[#00f0ff] font-cyber font-bold">EQUIPPED</span>'
                  : `<button onclick="State.buySkin('${s.id}')" class="px-2.5 py-1 bg-neutral-800 text-white rounded text-xs hover:bg-[#00f0ff] hover:text-black font-cyber transition">EQUIP</button>`)
              : `<button onclick="State.buySkin('${s.id}')" class="px-2.5 py-1 rounded text-xs font-cyber font-bold transition ${canAfford ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-neutral-900 text-amber-500/60 border border-amber-500/30'}">${s.price} 🪙</button>`
            }
          </div>
        </div>
      `;
    }).join('');
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

window.State = State;
