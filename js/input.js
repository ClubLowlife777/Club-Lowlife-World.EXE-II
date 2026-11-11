/**
 * CLUB LOWLIFE // INPUT MANAGER & PROXIMITY ENGINE (MOBILE OPTIMIZED)
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

      if (window.AudioEngine && typeof AudioEngine.init === 'function') AudioEngine.init();

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) || ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const code = e.code;
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup') this.keys.up = true;
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown') this.keys.down = true;
      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'arrowleft') this.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'arrowright') this.keys.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') this.keys.shift = true;

      if ((code === 'KeyE' || key === 'e') && !e.repeat) this.triggerInteraction();
      if ((code === 'KeyQ' || key === 'q') && !e.repeat && window.State && typeof State.useAmberVial === 'function') {
        State.useAmberVial();
      }
      if ((code === 'KeyJ' || key === 'j') && !e.repeat && window.Combat && typeof Combat.startShootInput === 'function') {
        Combat.startShootInput();
      }
      if ((code === 'KeyK' || key === 'k') && !e.repeat && window.Combat && typeof Combat.startSlashInput === 'function') {
        Combat.startSlashInput();
      }
      if ((code === 'Escape' || key === 'escape') && window.State) State.closeModals();
    });

    window.addEventListener('keyup', (e) => {
      if (e.target && e.target.tagName === 'INPUT') return;

      const code = e.code;
      const key = (e.key || '').toLowerCase();

      if (code === 'KeyW' || code === 'ArrowUp' || key === 'w' || key === 'arrowup') this.keys.up = false;
      if (code === 'KeyS' || code === 'ArrowDown' || key === 's' || key === 'arrowdown') this.keys.down = false;
      if (code === 'KeyA' || code === 'ArrowLeft' || key === 'a' || key === 'arrowleft') this.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight' || key === 'd' || key === 'arrowright') this.keys.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight' || key === 'shift') this.keys.shift = false;

      if ((code === 'KeyJ' || key === 'j') && window.Combat && typeof Combat.releaseShootInput === 'function') {
        Combat.releaseShootInput();
      }
      if ((code === 'KeyK' || key === 'k') && window.Combat && typeof Combat.releaseSlashInput === 'function') {
        Combat.releaseSlashInput();
      }
    });

    window.addEventListener('blur', () => this.resetKeys());

    this.bindTouchJoystick();
    this.bindCombatButtons();
    this.bindHudButtons();

    setInterval(() => this.updateProximity(), 80);
  },

  resetKeys() {
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.shift = false;
    if (window.Combat) {
      if (typeof Combat.releaseShootInput === 'function') Combat.releaseShootInput();
      if (typeof Combat.releaseSlashInput === 'function') Combat.releaseSlashInput();
    }
  },

  getMovementVector() {
    let vx = 0;
    let vy = 0;

    if (this.keys.up) vy -= 1;
    if (this.keys.down) vy += 1;
    if (this.keys.left) vx -= 1;
    if (this.keys.right) vx += 1;

    if (this.analogVector.active) {
      vx = this.analogVector.x;
      vy = this.analogVector.y;
    } else if (vx !== 0 && vy !== 0) {
      const invSqrt = 1 / Math.SQRT2;
      vx *= invSqrt;
      vy *= invSqrt;
    }

    return { x: vx, y: vy, isMoving: vx !== 0 || vy !== 0 };
  },

  bindTouchJoystick() {
    const zone = document.getElementById('joystickZone');
    const knob = document.getElementById('joystickKnob');
    if (!zone || !knob) return;

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (window.AudioEngine && typeof AudioEngine.init === 'function') AudioEngine.init();
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

  bindCombatButtons() {
    const bShoot = document.getElementById('btnShoot');
    const bSlash = document.getElementById('btnSlash');
    const bAction = document.getElementById('btnAction');
    const bVial = document.getElementById('btnVial');
    const promptBanner = document.getElementById('interactionPrompt');

    if (bVial) {
      bVial.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (window.State && typeof State.useAmberVial === 'function') State.useAmberVial();
      }, { passive: false });
    }

    if (bShoot) {
      const startShoot = (e) => { e.preventDefault(); if (window.Combat && Combat.startShootInput) Combat.startShootInput(); };
      const stopShoot = (e) => { e.preventDefault(); if (window.Combat && Combat.releaseShootInput) Combat.releaseShootInput(); };

      bShoot.addEventListener('touchstart', startShoot, { passive: false });
      bShoot.addEventListener('touchend', stopShoot, { passive: false });
      bShoot.addEventListener('touchcancel', stopShoot, { passive: false });
      bShoot.addEventListener('mousedown', startShoot);
      bShoot.addEventListener('mouseup', stopShoot);
      bShoot.addEventListener('mouseleave', stopShoot);
    }

    if (bSlash) {
      const startSlash = (e) => { e.preventDefault(); if (window.Combat && Combat.startSlashInput) Combat.startSlashInput(); };
      const stopSlash = (e) => { e.preventDefault(); if (window.Combat && Combat.releaseSlashInput) Combat.releaseSlashInput(); };

      bSlash.addEventListener('touchstart', startSlash, { passive: false });
      bSlash.addEventListener('touchend', stopSlash, { passive: false });
      bSlash.addEventListener('touchcancel', stopSlash, { passive: false });
      bSlash.addEventListener('mousedown', startSlash);
      bSlash.addEventListener('mouseup', stopSlash);
      bSlash.addEventListener('mouseleave', stopSlash);
    }

    if (bAction) {
      const handleAction = (e) => { e.preventDefault(); this.triggerInteraction(); };
      bAction.addEventListener('touchstart', handleAction, { passive: false });
      bAction.addEventListener('click', handleAction);
    }

    // Tapping the banner anywhere activates the interaction on mobile
    if (promptBanner) {
      promptBanner.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.triggerInteraction();
      }, { passive: false });
      promptBanner.addEventListener('click', () => this.triggerInteraction());
    }
  },

  bindHudButtons() {
    const warpBtn = document.getElementById('quickWarpBtn') || document.getElementById('btnWarp');
    if (warpBtn) {
      warpBtn.onclick = () => {
        if (window.AudioEngine && typeof AudioEngine.init === 'function') AudioEngine.init();
        if (!window.State || typeof State.switchDimension !== 'function') return;

        if (State.currentDimension === 'underground') {
          State.switchDimension('retrocade', 1200, 750);
        } else if (State.currentDimension === 'retrocade') {
          State.switchDimension('wasteland', 650, 1100);
        } else {
          State.switchDimension('underground', 350, 750);
        }
      };
    }

    const bgmBtn = document.getElementById('bgmToggleBtn');
    if (bgmBtn) {
      bgmBtn.onclick = () => {
        if (window.AudioEngine && typeof AudioEngine.toggleBgm === 'function') AudioEngine.toggleBgm();
      };
    }

    const trackSelect = document.getElementById('trackVersionSelect');
    if (trackSelect) {
      trackSelect.onchange = (e) => {
        if (window.AudioEngine && typeof AudioEngine.setTrackBgm === 'function') AudioEngine.setTrackBgm(e.target.value);
      };
    }

    const linksBtn = document.getElementById('openLinksModalBtn');
    if (linksBtn) {
      linksBtn.onclick = (e) => {
        e.preventDefault();
        if (typeof openDiscographyModal === 'function') openDiscographyModal();
      };
    }

    const skinsBtn = document.getElementById('openSkinsBtn');
    if (skinsBtn) {
      skinsBtn.onclick = (e) => {
        e.preventDefault();
        if (window.State && typeof State.renderSkins === 'function') {
          State.renderSkins();
        }
        const modal = document.getElementById('skinLockerModal') || document.getElementById('skinsModal');
        if (modal) modal.classList.remove('hidden');
      };
    }
  },

  updateProximity() {
    if (!window.Entities || !Entities.player || !window.Dimensions || !window.State) return;

    const p = Entities.player;
    const dim = State.currentDimension;

    // Generous proximity detection radius so phone users don't have to be pixel-perfect
    const pBox = { x: p.x - 45, y: p.y - 45, width: (p.width || 32) + 90, height: (p.height || 32) + 90 };
    const checkOverlap = (b1, b2) => (
      b1.x < b2.x + b2.width &&
      b1.x + b1.width > b2.x &&
      b1.y < b2.y + b2.height &&
      b1.y + b1.height > b2.y
    );

    let nearest = null;
    const activeZones = typeof Dimensions.getActiveZones === 'function' ? Dimensions.getActiveZones() : [];
    for (let z of activeZones) {
      if (checkOverlap(pBox, z)) {
        nearest = { type: 'zone', data: z, label: z.label || 'INTERACT' };
        break;
      }
    }

    if (!nearest) {
      const npcs = (Entities.friendlyNpcs && Entities.friendlyNpcs[dim]) ? Entities.friendlyNpcs[dim] : [];
      for (let n of npcs) {
        if (checkOverlap(pBox, n)) {
          nearest = { type: 'npc', data: n, label: `TALK TO ${n.name}` };
          break;
        }
      }
    }

    if (!nearest && dim === 'wasteland' && Dimensions.wastelandChests) {
      for (let c of Dimensions.wastelandChests) {
        if (!c.opened && checkOverlap(pBox, c)) {
          nearest = { type: 'chest', data: c, label: `OPEN ${c.label || 'CHEST'}` };
          break;
        }
      }
    }

    const banner = document.getElementById('interactionPrompt');
    const label = document.getElementById('promptText');
    const actionBtn = document.getElementById('btnAction');
    this.activeInteractable = nearest;

    if (nearest && banner && label) {
      label.innerText = `[TAP] ${nearest.label}`;
      banner.classList.remove('hidden');
      if (actionBtn) {
        actionBtn.classList.remove('border-neutral-600');
        actionBtn.classList.add('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.6)]');
      }
    } else if (banner) {
      banner.classList.add('hidden');
      if (actionBtn) {
        actionBtn.classList.remove('border-[#00f0ff]', 'text-[#00f0ff]', 'shadow-[0_0_15px_rgba(0,240,255,0.6)]');
        actionBtn.classList.add('border-neutral-600');
      }
    }
  },

  triggerInteraction() {
    if (!this.activeInteractable) return;

    const { type, data } = this.activeInteractable;
    if (type === 'zone' && typeof data.action === 'function') {
      data.action();
    } else if (type === 'npc') {
      const modal = document.getElementById('npcModal');
      const nEl = document.getElementById('npcName');
      const rEl = document.getElementById('npcRole');
      const dEl = document.getElementById('npcDialogueText');
      const iEl = document.getElementById('npcAvatarIcon');

      if (nEl) nEl.innerText = data.name || 'NPC';
      if (rEl) rEl.innerText = data.role || 'OPERATIVE';
      if (dEl) dEl.innerText = data.dialogue || '...';
      if (iEl) iEl.innerText = data.icon || '👤';
      if (modal) modal.classList.remove('hidden');
    } else if (type === 'chest' && window.Entities && typeof Entities.openChest === 'function') {
      Entities.openChest(data);
    }
  }
};

window.Input = Input;

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  Input.init();
}
