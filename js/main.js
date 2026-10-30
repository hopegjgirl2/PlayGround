'use strict';

/* ---------------------------------------------------------------- hud */

function updateHud(force = false) {
  if (!game) return;

  const keys = ['coffee', 'sanity', 'kids', 'clean'];
  for (const key of keys) {
    const pct = clamp(game.meters[key], 0, 100);
    const el = meterEls[key];
    if (!el) continue;
    const fill = el.querySelector('.m-fill');
    if (fill) fill.style.transform = `scaleX(${pct / 100})`;
    const low = pct < 22;
    const mid = pct >= 22 && pct < 45;
    const cached = hudCache[key];
    if (force || !cached || cached.low !== low) el.classList.toggle('low', low);
    if (force || !cached || cached.mid !== mid) el.classList.toggle('mid', mid);
    hudCache[key] = { low, mid };
  }

  const minutes = 480 + game.day * 600;
  const rounded = Math.round(minutes / 5) * 5;
  const hh = Math.floor(rounded / 60);
  const mm = rounded % 60;
  const h12 = ((hh + 11) % 12) + 1;
  const ampm = hh < 12 ? 'AM' : 'PM';
  const clock = `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
  if (force || clock !== hudCache.clock) {
    clockText.textContent = clock;
    hudCache.clock = clock;
  }

  const icon = game.day < 0.33 ? '☀️' : game.day < 0.68 ? '🌤️' : game.day < 0.9 ? '🌇' : '🌙';
  if (force || icon !== hudCache.icon) {
    clockIcon.textContent = icon;
    hudCache.icon = icon;
  }

  const dayPct = Math.round(game.day * 1000) / 10;
  if (force || dayPct !== hudCache.day) {
    dayFill.style.width = `${dayPct}%`;
    hudCache.day = dayPct;
  }

  const dinner = Math.round(game.dinner);
  if (force || dinner !== hudCache.dinner) {
    dinnerFill.style.width = `${clamp(game.dinner, 0, 100)}%`;
    dinnerText.textContent = `${dinner}%`;
    hudCache.dinner = dinner;
  }

  if (force || game.score !== hudCache.score) {
    scoreText.textContent = formatScore(game.score);
    hudCache.score = game.score;
  }

  const comboOn = game.combo > 1;
  if (force || comboOn !== hudCache.comboOn) {
    comboBadge.classList.toggle('show', comboOn);
    hudCache.comboOn = comboOn;
  }
  if (comboOn) {
    const label = `x${comboMultiplier().toFixed(1)}`;
    if (force || label !== hudCache.comboLabel) {
      comboBadge.textContent = label;
      hudCache.comboLabel = label;
    }
  }
}

/* ---------------------------------------------------------------- loop */

function frame(timestamp) {
  if (!game) return;
  const raw = (timestamp - last) / 1000;
  const dt = clamp(Number.isFinite(raw) ? raw : 0, 0, 0.05);
  last = timestamp;

  if (game.tiltHasData) {
    game.tiltSmoothed = lerp(game.tiltSmoothed, game.tiltRaw, Math.min(1, dt * 12));
  }

  if (game.mode === 'playing') {
    update(dt);
  } else if (game.mode === 'minigame') {
    updateMini(dt);
  } else if (game.mode === 'start') {
    updateKids(dt * 0.55);
  }

  if (game.mode !== 'paused') {
    updateParticles(dt);
    updateFloats(dt);
    updateRipples(dt);
    game.shake = Math.max(0, game.shake - dt * 70);
    game.flash = Math.max(0, game.flash - dt * 2.2);
  }

  render(timestamp / 1000);
  updateHud(false);
  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------------- input */

function onKeyDown(event) {
  if (!game) return;
  const key = event.key.toLowerCase();
  const target = event.target;
  const onControl =
    target && target.closest && target.closest('button, input, textarea, select, a');

  if (key === 'escape') {
    if (game.mode === 'playing' || game.mode === 'paused') {
      togglePause();
      event.preventDefault();
    }
    return;
  }
  if (onControl) return;

  if (key === 'm') {
    initAudio();
    toggleSound();
    event.preventDefault();
  } else if (key === 't') {
    requestTilt();
    event.preventDefault();
  } else if (key === 'p') {
    if (game.mode === 'playing' || game.mode === 'paused') {
      togglePause();
      event.preventDefault();
    }
  } else if (key === ' ' || key === 'enter') {
    if (game.mode === 'start' || game.mode === 'over') {
      startGame();
      event.preventDefault();
    } else if (game.mode === 'paused') {
      togglePause();
      event.preventDefault();
    }
  } else if (key === 'r') {
    if (game.mode === 'over' || game.mode === 'paused') {
      startGame();
      event.preventDefault();
    }
  }
}

/* ---------------------------------------------------------------- init */

function init() {
  resetGame();
  bestScore.textContent = formatScore(readBest());
  updateSoundUI();
  updateTiltUI();

  playBtn.addEventListener('click', startGame);
  startTiltBtn.addEventListener('click', () => {
    requestTilt();
  });
  btnTilt.addEventListener('click', () => {
    requestTilt();
  });
  btnSound.addEventListener('click', () => {
    initAudio();
    toggleSound();
  });
  btnPause.addEventListener('click', togglePause);
  resumeBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', startGame);
  menuBtn.addEventListener('click', goMenu);
  replayBtn.addEventListener('click', startGame);
  endMenuBtn.addEventListener('click', goMenu);

  miniTiltBtn.addEventListener('click', async () => {
    const enabled = await requestTilt();
    if (enabled && game.mini) game.mini.baseTilt = game.tiltSmoothed;
  });

  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('pointerleave', () => {
    canvas.style.cursor = 'default';
  });

  balanceTrack.addEventListener(
    'pointerdown',
    (event) => {
      if (!game.mini || game.mini.result) return;
      event.preventDefault();
      try {
        balanceTrack.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      miniPointer(event);
    },
    { passive: false }
  );
  balanceTrack.addEventListener(
    'pointermove',
    (event) => {
      if (!game.mini || game.mini.result || !game.mini.dragging) return;
      event.preventDefault();
      miniPointer(event);
    },
    { passive: false }
  );
  const endDrag = (event) => {
    if (game.mini) {
      game.mini.dragging = false;
      game.mini.dragInput = 0;
    }
    try {
      balanceTrack.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };
  balanceTrack.addEventListener('pointerup', endDrag);
  balanceTrack.addEventListener('pointercancel', endDrag);

  window.addEventListener('keydown', onKeyDown);

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      layoutGame();
      hudCache = {};
      updateHud(true);
    }, 80);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  if (window.ResizeObserver) {
    new ResizeObserver(onResize).observe(stage);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (game.mode === 'playing') {
        game.mode = 'paused';
        pauseScreen.classList.remove('hidden');
        stopMusic();
      }
      if (audio && audio.suspend) audio.suspend().catch(() => {});
    } else if (soundOn) {
      initAudio();
      if (game.mode === 'playing') startMusic();
    }
  });

  window.momSimDebug = {
    state: () => game,
    start: startGame,
    end: (reason = 'win') => endGame(reason),
    mini: () => {
      game.groceryDone = true;
      startMini();
    },
    spawn: (type) => spawnEvent(type),
    setTime: (fraction) => {
      game.time = clamp(fraction, 0, 1) * DAY_SECONDS;
      game.day = clamp(fraction, 0, 1);
    },
    addMeter,
    addDinner,
    resolveAll: () => {
      for (const ev of game.events.filter((e) => e.state === 'active')) resolveEvent(ev);
    },
  };

  requestAnimationFrame((timestamp) => {
    last = timestamp;
    requestAnimationFrame(frame);
  });
}

init();
