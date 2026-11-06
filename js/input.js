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
    window.addEventListener('keydown', (e) => {
      if (e.target && e.target.tagName === 'INPUT') {
        if (e.code === 'Escape' && window.State) State.closeModals();
        return;
      }
      if (window.AudioEngine && AudioEngine.init) AudioEngine.init();

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();

      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (['ShiftLeft', 'ShiftRight'].includes(e.code)) this.keys.shift = true;

      if (e.code === 'KeyE') this.triggerInteraction();
      if (e.code === 'KeyJ' && !e.repeat && window.Combat) Combat.startShootInput();
      if (e.code === 'KeyK' && !e.repeat && window.Combat) Combat.startSlashInput();
      if (e.code === 'Escape' && window.State) State.closeModals();
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

    setInterval(() => this.updateProximity(), 80);
  },

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
          this.analogVector.x = 0; this.analogVector.y = 0; this.analogVector.active = false;
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
    if (dist > radius) { dx = (dx / dist) * radius; dy = (dy / dist) * radius; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    if (dist > 8) {
      this.analogVector.active = true;
      this.analogVector.x = dx / radius;
      this.analogVector.y = dy / radius;
    } else {
      this.analogVector.active = false;
      this.analogVector.x = 0; this.analogVector.y = 0;
    }
  },

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
    if (bAction) {
      const handleAction = (e) => { e.preventDefault(); this.triggerInteraction(); };
      bAction.addEventListener('touchstart', handleAction, { passive: false });
      bAction.addEventListener('click', handleAction);
    }
    if (promptBanner) promptBanner.addEventListener('click', () => this.triggerInteraction());
  },

  bindHudButtons() {
    // Quick Warp Engine
    document.getElementById('quickWarpBtn')?.addEventListener('click', () => {
      if (window.AudioEngine && AudioEngine.init) AudioEngine.init();
      if (!window.State) return;
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

    // Links Modal Engine
    document.getElementById('openLinksModalBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof openDiscographyModal === 'function') {
        openDiscographyModal();
      }
    });

    // Skins Locker Engine
    document.getElementById('openSkinsBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.State && typeof State.renderSkins === 'function') {
        State.renderSkins();
      }
      const modal = document.getElementById('skinsModal');
      if (modal) modal.classList.remove('hidden');
    });
  },

  updateProximity() {
    if (!window.Entities || !Entities.player || !window.Dimensions || !window.State) return;

    const p = Entities.player;
    const dim = State.currentDimension;

    const pBox = { x: p.x - 35, y: p.y - 35, width: p.width + 70, height: p.height + 70 };
    const checkOverlap = (b1, b2) => (b1.x < b2.x + b2.width && b1.x + b1.width > b2.x && b1.y < b2.y + b2.height && b1.y + b1.height > b2.y);

    let nearest = null;
    const activeZones = Dimensions.getActiveZones ? Dimensions.getActiveZones() : [];
    for (let z of activeZones) {
      if (checkOverlap(pBox, z)) { nearest = { type: 'zone', data: z, label: z.label || 'INTERACT' }; break; }
    }
    if (!nearest) {
      const npcs = (Entities.friendlyNpcs && Entities.friendlyNpcs[dim]) ? Entities.friendlyNpcs[dim] : [];
      for (let n of npcs) {
        if (checkOverlap(pBox, n)) { nearest = { type: 'npc', data: n, label: `TALK TO ${n.name}` }; break; }
      }
    }
    if (!nearest && dim === 'wasteland' && Dimensions.wastelandChests) {
      for (let c of Dimensions.wastelandChests) {
        if (!c.opened && checkOverlap(pBox, c)) { nearest = { type: 'chest', data: c, label: `OPEN ${c.label}` }; break; }
      }
    }

    const banner = document.getElementById('interactionPrompt');
    const label = document.getElementById('promptText');
    const actionBtn = document.getElementById('btnAction');
    this.activeInteractable = nearest;

    if (nearest && banner && label) {
      label.innerText = `[E] ${nearest.label}`;
      banner.classList.remove('hidden');
      if (actionBtn) actionBtn.classList.add('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.4)]');
    } else if (banner) {
      banner.classList.add('hidden');
      if (actionBtn) actionBtn.classList.remove('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.4)]');
    }
  },

  triggerInteraction() {
    if (this.activeInteractable) {
      const { type, data } = this.activeInteractable;
      if (type === 'zone' && typeof data.action === 'function') {
        data.action();
      } else if (type === 'npc') {
        const modal = document.getElementById('npcModal');
        if (document.getElementById('npcName')) document.getElementById('npcName').innerText = data.name;
        if (document.getElementById('npcRole')) document.getElementById('npcRole').innerText = data.role;
        if (document.getElementById('npcDialogueText')) document.getElementById('npcDialogueText').innerText = data.dialogue;
        if (document.getElementById('npcAvatarIcon')) document.getElementById('npcAvatarIcon').innerText = data.icon || '👤';
        if (modal) modal.classList.remove('hidden');
      } else if (type === 'chest' && window.Entities) {
        Entities.openChest(data);
      }
    }
  }
};
