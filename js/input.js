/**
 * CLUB LOWLIFE // INPUT MANAGER & PROXIMITY ENGINE
 * File: js/input.js
 * Engine: Vanilla HTML5 Canvas / Decoupled Physics
 */

const Input = {
  keys: { up: false, down: false, left: false, right: false, shift: false },
  analogVector: { x: 0, y: 0, active: false },
  joystickTouchId: null,
  activeInteractable: null,

  init() {
    // --- KEYBOARD LISTENERS ---
    window.addEventListener('keydown', (e) => {
      // 1. If user is currently typing in an input field (e.g., Username Modal), do not capture gameplay keys
      if (e.target && e.target.tagName === 'INPUT') {
        if (e.code === 'Escape') State.closeModals();
        return;
      }

      if (window.AudioEngine && AudioEngine.init) AudioEngine.init();

      // Prevent page scrolling on arrow keys & space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (['ShiftLeft', 'ShiftRight'].includes(e.code)) this.keys.shift = true;

      if (e.code === 'KeyE') this.triggerInteraction();
      if (e.code === 'KeyJ' && !e.repeat && window.Combat) Combat.startShootInput();
      if (e.code === 'KeyK' && !e.repeat && window.Combat) Combat.startSlashInput();
      if (e.code === 'Escape') State.closeModals();
    });

    window.addEventListener('keyup', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;

      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (['ShiftLeft', 'ShiftRight'].includes(e.code)) this.keys.shift = false;

      if (e.code === 'KeyJ' && window.Combat) Combat.releaseShootInput();
      if (e.code === 'KeyK' && window.Combat) Combat.releaseSlashInput();
    });

    this.bindTouchJoystick();
    this.bindCombatButtons();
    this.bindHudButtons();

    // Start proximity scanning loop (checks every 80ms for nearby NPCs, chests, and kiosks)
    setInterval(() => this.updateProximity(), 80);
  },

  // =========================================================================
  // VIRTUAL 360 TOUCH JOYSTICK (MOBILE)
  // =========================================================================
  bindTouchJoystick() {
    const zone = document.getElementById('joystickZone');
    const knob = document.getElementById('joystickKnob');
    if (!zone || !knob) return;

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (window.AudioEngine && AudioEngine.init) AudioEngine.init();

      for (let t of e.changedTouches) {
        if (this.joystickTouchId === null) {
          this.joystickTouchId = t.identifier;
          this.updateJoystick(t.clientX, t.clientY, zone, knob);
          break;
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      for (let t of e.changedTouches) {
        if (t.identifier === this.joystickTouchId) {
          e.preventDefault();
          this.updateJoystick(t.clientX, t.clientY, zone, knob);
          break;
        }
      }
    }, { passive: false });

    const endHandler = (e) => {
      for (let t of e.changedTouches) {
        if (t.identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.analogVector.x = 0;
          this.analogVector.y = 0;
          this.analogVector.active = false;
          knob.style.transform = `translate(0px, 0px)`;
          break;
        }
      }
    };

    window.addEventListener('touchend', endHandler, { passive: false });
    window.addEventListener('touchcancel', endHandler, { passive: false });
  },

  updateJoystick(touchX, touchY, zone, knob) {
    const rect = zone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = touchX - centerX;
    let dy = touchY - centerY;
    const radius = 46;
    const dist = Math.hypot(dx, dy);

    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }

    knob.style.transform = `translate(${dx}px, ${dy}px)`;

    if (dist > 8) {
      this.analogVector.active = true;
      this.analogVector.x = dx / radius;
      this.analogVector.y = dy / radius;
    } else {
      this.analogVector.active = false;
      this.analogVector.x = 0;
      this.analogVector.y = 0;
    }
  },

  // =========================================================================
  // ON-SCREEN COMBAT & ACTION BUTTONS
  // =========================================================================
  bindCombatButtons() {
    const bShoot = document.getElementById('btnShoot');
    const bSlash = document.getElementById('btnSlash');
    const bAction = document.getElementById('btnAction');
    const promptBanner = document.getElementById('interactionPrompt');

    if (bShoot) {
      bShoot.addEventListener('touchstart', (e) => { e.preventDefault(); if (window.Combat) Combat.startShootInput(); }, { passive: false });
      bShoot.addEventListener('touchend', (e) => { e.preventDefault(); if (window.Combat) Combat.releaseShootInput(); }, { passive: false });
      bShoot.addEventListener('mousedown', (e) => { e.preventDefault(); if (window.Combat) Combat.startShootInput(); });
      bShoot.addEventListener('mouseup', (e) => { e.preventDefault(); if (window.Combat) Combat.releaseShootInput(); });
    }

    if (bSlash) {
      bSlash.addEventListener('touchstart', (e) => { e.preventDefault(); if (window.Combat) Combat.startSlashInput(); }, { passive: false });
      bSlash.addEventListener('touchend', (e) => { e.preventDefault(); if (window.Combat) Combat.releaseSlashInput(); }, { passive: false });
      bSlash.addEventListener('mousedown', (e) => { e.preventDefault(); if (window.Combat) Combat.startSlashInput(); });
      bSlash.addEventListener('mouseup', (e) => { e.preventDefault(); if (window.Combat) Combat.releaseSlashInput(); });
    }

    // Action button with instant touch feedback
    if (bAction) {
      const handleAction = (e) => {
        e.preventDefault();
        this.triggerInteraction();
      };
      bAction.addEventListener('touchstart', handleAction, { passive: false });
      bAction.addEventListener('click', handleAction);
    }

    // Clicking the floating on-screen interaction prompt banner also triggers the action
    if (promptBanner) {
      promptBanner.addEventListener('click', () => this.triggerInteraction());
    }
  },

  // =========================================================================
  // PERSISTENT TOP HUD CONTROLS
  // =========================================================================
  bindHudButtons() {
    // Quick Warp cycling through canonical safe spawn points
    document.getElementById('quickWarpBtn')?.addEventListener('click', () => {
      if (window.AudioEngine && AudioEngine.init) AudioEngine.init();
      if (State.currentDimension === 'underground') {
        State.switchDimension('retrocade', 1200, 750);
      } else if (State.currentDimension === 'retrocade') {
        State.switchDimension('wasteland', 800, 800);
      } else {
        State.switchDimension('underground', 350, 750);
      }
    });

    document.getElementById('bgmToggleBtn')?.addEventListener('click', () => {
      if (window.AudioEngine && AudioEngine.toggleBgm) AudioEngine.toggleBgm();
    });

    document.getElementById('trackVersionSelect')?.addEventListener('change', (e) => {
      if (window.AudioEngine && AudioEngine.setTrackBgm) AudioEngine.setTrackBgm(e.target.value);
    });

    document.getElementById('openLinksModalBtn')?.addEventListener('click', () => {
      if (typeof openDiscographyModal === 'function') openDiscographyModal();
    });

    document.getElementById('openSkinsBtn')?.addEventListener('click', () => {
      State.renderSkins();
      document.getElementById('skinsModal')?.classList.remove('hidden');
    });
  },

  // =========================================================================
  // PROXIMITY DETECTION & INTERACTION RESOLUTION
  // =========================================================================
  updateProximity() {
    if (!window.Entities || !Entities.player || !window.Dimensions) return;

    const p = Entities.player;
    const px = p.x + p.width / 2;
    const py = p.y + p.height / 2;
    const dim = State.currentDimension;

    let nearest = null;
    let minDistance = 75; // 75px interaction radius

    // 1. Check Interactive Map Zones (Kiosks, Portals, Arcades, Merch)
    const activeZones = Dimensions.getActiveZones ? Dimensions.getActiveZones() : [];
    for (let z of activeZones) {
      const zx = z.x + z.width / 2;
      const zy = z.y + z.height / 2;
      const d = Math.hypot(px - zx, py - zy);
      if (d < minDistance) {
        minDistance = d;
        nearest = { type: 'zone', data: z, label: z.label || 'INTERACT' };
      }
    }

    // 2. Check Friendly NPCs (Dialogue)
    const npcs = (Entities.friendlyNpcs && Entities.friendlyNpcs[dim]) ? Entities.friendlyNpcs[dim] : [];
    for (let n of npcs) {
      const nx = n.x + n.width / 2;
      const ny = n.y + n.height / 2;
      const d = Math.hypot(px - nx, py - ny);
      if (d < minDistance) {
        minDistance = d;
        nearest = { type: 'npc', data: n, label: `TALK TO ${n.name}` };
      }
    }

    // 3. Check Wasteland Chests
    if (dim === 'wasteland' && Dimensions.wastelandChests) {
      for (let c of Dimensions.wastelandChests) {
        if (c.opened) continue;
        const cx = c.x + c.width / 2;
        const cy = c.y + c.height / 2;
        const d = Math.hypot(px - cx, py - cy);
        if (d < minDistance) {
          minDistance = d;
          nearest = { type: 'chest', data: c, label: `OPEN ${c.label}` };
        }
      }
    }

    // Update Banner UI State
    const banner = document.getElementById('interactionPrompt');
    const label = document.getElementById('promptText');
    const actionBtn = document.getElementById('btnAction');

    this.activeInteractable = nearest;

    if (nearest && banner && label) {
      label.innerText = `[E] ${nearest.label}`;
      banner.classList.remove('hidden');
      if (actionBtn) {
        actionBtn.classList.add('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.4)]');
      }
    } else if (banner) {
      banner.classList.add('hidden');
      if (actionBtn) {
        actionBtn.classList.remove('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.4)]');
      }
    }
  },

  triggerInteraction() {
    // If a proximity target is active, resolve it immediately
    if (this.activeInteractable) {
      const { type, data } = this.activeInteractable;

      if (type === 'zone' && typeof data.action === 'function') {
        data.action();
        return;
      }

      if (type === 'npc') {
        const modal = document.getElementById('npcModal');
        const nameEl = document.getElementById('npcName');
        const roleEl = document.getElementById('npcRole');
        const textEl = document.getElementById('npcDialogueText');
        const iconEl = document.getElementById('npcAvatarIcon');

        if (nameEl) nameEl.innerText = data.name;
        if (roleEl) roleEl.innerText = data.role;
        if (textEl) textEl.innerText = data.dialogue;
        if (iconEl) iconEl.innerText = data.icon || '👤';
        if (modal) modal.classList.remove('hidden');
        return;
      }

      if (type === 'chest' && window.Entities && Entities.openChest) {
        Entities.openChest(data);
        return;
      }
    }

    // Fallback hook to Combat if defined
    if (window.Combat && typeof Combat.triggerActiveInteraction === 'function') {
      Combat.triggerActiveInteraction();
    }
  }
};
