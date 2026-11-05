const Input = {
  keys: { up: false, down: false, left: false, right: false, shift: false },
  analogVector: { x: 0, y: 0, active: false },
  joystickTouchId: null,

  init() {
    window.addEventListener('keydown', (e) => {
      AudioEngine.init();
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (['ShiftLeft', 'ShiftRight'].includes(e.code)) this.keys.shift = true;
      if (e.code === 'KeyE') Combat.triggerActiveInteraction();
      if (e.code === 'KeyJ' && !e.repeat) Combat.startShootInput();
      if (e.code === 'KeyK' && !e.repeat) Combat.startSlashInput();
      if (e.code === 'Escape') State.closeModals();
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (['ShiftLeft', 'ShiftRight'].includes(e.code)) this.keys.shift = false;
      if (e.code === 'KeyJ') Combat.releaseShootInput();
      if (e.code === 'KeyK') Combat.releaseSlashInput();
    });

    this.bindTouchJoystick();
    this.bindCombatButtons();
    this.bindHudButtons();
  },

  bindTouchJoystick() {
    const zone = document.getElementById('joystickZone');
    const knob = document.getElementById('joystickKnob');
    if (!zone || !knob) return;

    zone.addEventListener('touchstart', (e) => {
      AudioEngine.init();
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
    if (dist > 10) {
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

    if (bShoot) {
      bShoot.addEventListener('touchstart', (e) => { e.preventDefault(); Combat.startShootInput(); });
      bShoot.addEventListener('touchend', (e) => { e.preventDefault(); Combat.releaseShootInput(); });
      bShoot.addEventListener('mousedown', (e) => { e.preventDefault(); Combat.startShootInput(); });
      bShoot.addEventListener('mouseup', (e) => { e.preventDefault(); Combat.releaseShootInput(); });
    }
    if (bSlash) {
      bSlash.addEventListener('touchstart', (e) => { e.preventDefault(); Combat.startSlashInput(); });
      bSlash.addEventListener('touchend', (e) => { e.preventDefault(); Combat.releaseSlashInput(); });
      bSlash.addEventListener('mousedown', (e) => { e.preventDefault(); Combat.startSlashInput(); });
      bSlash.addEventListener('mouseup', (e) => { e.preventDefault(); Combat.releaseSlashInput(); });
    }
    if (bAction) {
      bAction.addEventListener('click', () => Combat.triggerActiveInteraction());
    }
  },

  bindHudButtons() {
    document.getElementById('quickWarpBtn')?.addEventListener('click', () => {
      AudioEngine.init();
      if (State.currentDimension === 'underground') State.switchDimension('retrocade', 750, 750);
      else if (State.currentDimension === 'retrocade') State.switchDimension('wasteland', 1600, 1200);
      else State.switchDimension('underground', 320, 750);
    });
    document.getElementById('bgmToggleBtn')?.addEventListener('click', () => AudioEngine.toggleBgm());
    document.getElementById('trackVersionSelect')?.addEventListener('change', (e) => AudioEngine.setTrackBgm(e.target.value));
    document.getElementById('openLinksModalBtn')?.addEventListener('click', () => {
      document.getElementById('linksModal')?.classList.remove('hidden');
    });
    document.getElementById('openSkinsBtn')?.addEventListener('click', () => {
      State.renderSkins();
      document.getElementById('skinsModal')?.classList.remove('hidden');
    });
  }
};
