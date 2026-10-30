'use strict';

/* ---------------------------------------------------------------- particles */

function addParticle(type, x, y, opts = {}) {
  if (!game) return;
  const p = {
    type,
    x,
    y,
    vx: opts.vx ?? (Math.random() * 2 - 1) * 26,
    vy: opts.vy ?? -30 - Math.random() * 30,
    life: opts.life ?? 0.8 + Math.random() * 0.6,
    maxLife: 0,
    size: opts.size ?? 5 + Math.random() * 5,
    color: opts.color ?? '#fff8ee',
    rot: opts.rot ?? Math.random() * Math.PI * 2,
    rotV: opts.rotV ?? (Math.random() * 2 - 1) * 3,
    gravity: opts.gravity ?? 0,
  };
  p.maxLife = p.life;
  game.particles.push(p);
  if (game.particles.length > 240) game.particles.splice(0, game.particles.length - 240);
}

function burst(x, y, type, count, color) {
  const palette = [color, '#e76f51', '#2a9d8f', '#f4a7b9', '#e9c46a', '#fff8ee'];
  for (let i = 0; i < count; i += 1) {
    if (type === 'steam') {
      addParticle('steam', x + (Math.random() * 2 - 1) * 18, y + (Math.random() * 2 - 1) * 8, {
        vx: (Math.random() * 2 - 1) * 12,
        vy: -24 - Math.random() * 28,
        life: 0.7 + Math.random() * 0.7,
        size: 5 + Math.random() * 7,
        color: '#fff8ee',
      });
    } else if (type === 'bubble') {
      addParticle('bubble', x + (Math.random() * 2 - 1) * 30, y + (Math.random() * 2 - 1) * 18, {
        vx: (Math.random() * 2 - 1) * 34,
        vy: -30 - Math.random() * 55,
        life: 0.6 + Math.random() * 0.7,
        size: 3 + Math.random() * 5,
        color: color || '#9fd8f5',
      });
    } else if (type === 'heart') {
      addParticle('heart', x + (Math.random() * 2 - 1) * 28, y + (Math.random() * 2 - 1) * 18, {
        vx: (Math.random() * 2 - 1) * 42,
        vy: -40 - Math.random() * 55,
        life: 0.8 + Math.random() * 0.6,
        size: 5 + Math.random() * 5,
        color: color || '#f4a7b9',
        gravity: 12,
      });
    } else if (type === 'sparkle') {
      addParticle('sparkle', x + (Math.random() * 2 - 1) * 34, y + (Math.random() * 2 - 1) * 26, {
        vx: (Math.random() * 2 - 1) * 58,
        vy: -30 - Math.random() * 58,
        life: 0.45 + Math.random() * 0.6,
        size: 3.5 + Math.random() * 5,
        color: color || '#e9c46a',
        gravity: 20,
      });
    } else if (type === 'confetti') {
      addParticle('confetti', x + (Math.random() * 2 - 1) * 36, y + (Math.random() * 2 - 1) * 22, {
        vx: (Math.random() * 2 - 1) * 120,
        vy: -90 - Math.random() * 110,
        life: 1.1 + Math.random() * 0.8,
        size: 3.5 + Math.random() * 4.5,
        color: palette[Math.floor(Math.random() * palette.length)],
        gravity: 260,
        rotV: (Math.random() * 2 - 1) * 10,
      });
    } else {
      addParticle('sparkle', x, y, { color: color || '#e9c46a' });
    }
  }
}

function addFloat(x, y, text, color, size = 13) {
  if (!game) return;
  game.floats.push({
    x,
    y,
    vy: -38,
    life: 1.15,
    maxLife: 1.15,
    text,
    color: color || '#264653',
    size,
  });
  if (game.floats.length > 36) game.floats.splice(0, game.floats.length - 36);
}

function addRipple(x, y, color) {
  if (!game) return;
  game.ripples.push({ x, y, r: 6, life: 0.5, maxLife: 0.5, color: color || '#fff8ee' });
  if (game.ripples.length > 20) game.ripples.splice(0, game.ripples.length - 20);
}

function updateParticles(dt) {
  if (!game) return;
  for (let i = game.particles.length - 1; i >= 0; i -= 1) {
    const p = game.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      game.particles.splice(i, 1);
      continue;
    }
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.rotV * dt;
    if (p.type === 'steam') p.size += dt * 12;
  }
}

function updateFloats(dt) {
  if (!game) return;
  for (let i = game.floats.length - 1; i >= 0; i -= 1) {
    const f = game.floats[i];
    f.life -= dt;
    if (f.life <= 0) {
      game.floats.splice(i, 1);
      continue;
    }
    f.y += f.vy * dt;
    f.vy *= Math.pow(0.94, dt * 60);
  }
}

function updateRipples(dt) {
  if (!game) return;
  for (let i = game.ripples.length - 1; i >= 0; i -= 1) {
    const r = game.ripples[i];
    r.life -= dt;
    if (r.life <= 0) {
      game.ripples.splice(i, 1);
      continue;
    }
    r.r += dt * 150;
  }
}

/* ---------------------------------------------------------------- interactions */

function stationStandPoint(st) {
  if (st.id === 'couch') return { x: st.x + 62, y: st.y + 54 };
  if (st.id === 'toys') return { x: st.x - 62, y: st.y + 32 };
  return { x: st.x, y: st.y + 92 };
}

function queueStation(st) {
  if (!game || game.mode !== 'playing') return;
  if (st.cd > 0.02) {
    addFloat(st.x, st.y - 66, 'one sec...', '#7a5a4a', 12);
    playSoft();
    return;
  }
  if (game.mom.pending && game.mom.pending.kind === 'station' && game.mom.pending.station === st) {
    return;
  }
  const point = stationStandPoint(st);
  game.mom.pending = { kind: 'station', station: st };
  game.mom.tx = clamp(point.x, 24, W - 24);
  game.mom.ty = clamp(point.y, 470, H - 40);
  st.pulse = Math.max(st.pulse, 0.5);
}

function queueKid(kid) {
  if (!game || game.mode !== 'playing') return;
  if (kid.cd > 0.02) {
    addFloat(kid.x, kid.y - 96, 'aww...', '#7a5a4a', 12);
    playSoft();
    return;
  }
  if (game.mom.pending && game.mom.pending.kind === 'kid' && game.mom.pending.kid === kid) {
    return;
  }
  game.mom.pending = { kind: 'kid', kid };
  game.mom.tx = kid.x;
  game.mom.ty = kid.y + 26;
}

function hitTest(x, y) {
  if (!game) return null;
  for (let i = game.events.length - 1; i >= 0; i -= 1) {
    const ev = game.events[i];
    if (ev.state !== 'active') continue;
    const r = ev.r + 16;
    if (dist2(x, y, ev.x, ev.y) <= r * r) return { type: 'event', ev };
  }
  for (const kid of game.kids) {
    if (dist2(x, y, kid.x, kid.y - 38) <= 42 * 42) return { type: 'kid', kid };
  }
  for (const st of game.stations) {
    if (dist2(x, y, st.x, st.y) <= 56 * 56) return { type: 'station', st };
  }
  return null;
}

function toLogical(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
}

function onPointerDown(event) {
  if (!game || game.mode !== 'playing') return;
  event.preventDefault();
  const p = toLogical(event.clientX, event.clientY);
  addRipple(p.x, p.y, '#fff8ee');
  const hit = hitTest(p.x, p.y);
  if (!hit) {
    playSoft();
    return;
  }
  if (hit.type === 'event') resolveEvent(hit.ev);
  else if (hit.type === 'kid') queueKid(hit.kid);
  else queueStation(hit.st);
}

function onPointerMove(event) {
  if (!game || game.mode !== 'playing') {
    canvas.style.cursor = 'default';
    return;
  }
  const p = toLogical(event.clientX, event.clientY);
  canvas.style.cursor = hitTest(p.x, p.y) ? 'pointer' : 'default';
}

/* ---------------------------------------------------------------- actions */

function doStationAction(st) {
  if (!game || game.mode !== 'playing' || st.cd > 0) return;
  const lowCoffee = game.meters.coffee < 22;
  st.cd = st.cdMax * (lowCoffee ? 1.35 : 1);
  st.pulse = 1;
  game.mom.armT = 0.55;
  game.mom.facing = st.x < game.mom.x ? -1 : 1;

  let label = '';
  let color = st.color;
  let base = 20;
  switch (st.id) {
    case 'coffee':
      addMeter('coffee', 38);
      addMeter('sanity', 2);
      label = '+Coffee';
      color = '#8a5a2b';
      base = 22;
      burst(st.x, st.y - 38, 'steam', 8, '#fff8ee');
      break;
    case 'sink':
      addMeter('clean', 24);
      label = '+Clean';
      color = '#4a9fd0';
      base = 20;
      burst(st.x, st.y - 6, 'bubble', 10, '#9fd8f5');
      break;
    case 'stove':
      addDinner(14);
      label = '+Dinner';
      color = '#e76f51';
      base = 26;
      burst(st.x, st.y - 48, 'steam', 7, '#fff8ee');
      break;
    case 'couch':
      addMeter('sanity', 22);
      addMeter('coffee', 2);
      label = '+Sanity';
      color = '#2a9d8f';
      base = 18;
      burst(st.x, st.y - 50, 'heart', 6, '#f4a7b9');
      break;
    case 'toys':
      addMeter('clean', 20);
      label = '+Clean';
      color = '#e9a23b';
      base = 20;
      burst(st.x, st.y - 16, 'sparkle', 8, '#e9c46a');
      break;
    default:
      break;
  }
  addComboAndScore(base, st.x, st.y - 76, color);
  addFloat(st.x, st.y - 96, label, color, 13);
  playGood();
  vibrate(12);
}

function doKidAction(kid) {
  if (!game || game.mode !== 'playing' || kid.cd > 0) return;
  const lowCoffee = game.meters.coffee < 22;
  kid.cd = 4.2 * (lowCoffee ? 1.35 : 1);
  game.mom.armT = 0.6;
  game.mom.facing = kid.x < game.mom.x ? -1 : 1;
  addMeter('kids', 20);
  addMeter('sanity', 1);
  addComboAndScore(22, kid.x, kid.y - 102, '#e76f51');
  addFloat(kid.x, kid.y - 122, '+Happy', '#e76f51', 13);
  burst(kid.x, kid.y - 70, 'heart', 8, '#f4a7b9');
  playGood();
  vibrate(12);
}

/* ---------------------------------------------------------------- events */

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.w, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.w;
    if (roll <= 0) return item.type;
  }
  return items[items.length - 1].type;
}

function spawnEvent(forceType) {
  if (!game || game.mode !== 'playing') return;
  const activeTypes = new Set(
    game.events.filter((e) => e.state === 'active').map((e) => e.type)
  );
  const options = [
    { type: 'spill', w: (game.meters.clean < 50 ? 3.2 : 1) * (activeTypes.has('spill') ? 0.25 : 1) },
    { type: 'tantrum', w: (game.meters.kids < 55 ? 3.2 : 1) * (activeTypes.has('tantrum') ? 0.25 : 1) },
    { type: 'phone', w: 1.15 * (activeTypes.has('phone') ? 0.25 : 1) },
    {
      type: 'burn',
      w:
        (game.dinner < game.day * 100 - 8 || game.dinner < 35 ? 2.2 : 0.75) *
        (activeTypes.has('burn') ? 0.25 : 1),
    },
  ];
  const type = forceType || pickWeighted(options);
  const ev = {
    type,
    state: 'active',
    t: 0,
    duration: 7,
    pop: 1,
    r: 27,
    wobble: Math.random() * 6,
    x: W / 2,
    y: 560,
    icon: '💧',
    label: 'Spill!',
    color: '#4a9fd0',
  };

  if (type === 'spill') {
    ev.x = W * (0.28 + Math.random() * 0.44);
    ev.y = 565 + Math.random() * 185;
    ev.icon = '💧';
    ev.label = 'Spill!';
    ev.color = '#4a9fd0';
    ev.duration = 7;
  } else if (type === 'tantrum') {
    const kid = game.kids[Math.floor(Math.random() * game.kids.length)];
    ev.kid = kid;
    ev.x = kid.x;
    ev.y = kid.y - 104;
    ev.icon = '😤';
    ev.label = 'Tantrum!';
    ev.color = '#e76f51';
    ev.duration = 7;
  } else if (type === 'phone') {
    ev.x = W / 2;
    ev.y = 536;
    ev.icon = '📞';
    ev.label = 'Phone!';
    ev.color = '#e9a23b';
    ev.duration = 6.5;
  } else if (type === 'burn') {
    ev.x = layout.stove.x;
    ev.y = layout.stove.y - 96;
    ev.icon = '🔥';
    ev.label = 'Burning!';
    ev.color = '#e76f51';
    ev.duration = 6;
  }

  game.events.push(ev);
  playAlert();
  addFloat(ev.x, ev.y + 50, ev.label, ev.color, 12);
}

function resolveEvent(ev) {
  if (!game || ev.state !== 'active') return;
  ev.state = 'resolved';
  ev.pop = 0.36;
  let base = 38;
  let label = '+Score';
  let color = ev.color;

  if (ev.type === 'spill') {
    addMeter('clean', 10);
    base = 36;
    label = '+Clean';
    color = '#4a9fd0';
    burst(ev.x, ev.y + 26, 'bubble', 8, '#9fd8f5');
  } else if (ev.type === 'tantrum') {
    addMeter('kids', 10);
    addMeter('sanity', 2);
    base = 38;
    label = '+Happy';
    color = '#e76f51';
    burst(ev.x, ev.y, 'heart', 8, '#f4a7b9');
  } else if (ev.type === 'phone') {
    addMeter('sanity', 5);
    base = 48;
    label = '+Sanity';
    color = '#e9a23b';
    burst(ev.x, ev.y, 'sparkle', 8, '#e9c46a');
  } else if (ev.type === 'burn') {
    addDinner(8);
    addMeter('sanity', 1);
    base = 48;
    label = 'Saved!';
    color = '#e76f51';
    burst(ev.x, ev.y, 'steam', 10, '#fff8ee');
  }

  addComboAndScore(base, ev.x, ev.y - 46, color);
  addFloat(ev.x, ev.y - 68, label, color, 13);
  game.mom.armT = 0.5;
  playGood();
  vibrate(14);
}

function missEvent(ev) {
  ev.state = 'missed';
  ev.pop = 0.42;
  game.combo = 0;
  game.comboTimer = 0;
  game.shake = 10;
  game.flash = 0.5;
  game.flashColor = '#d64545';
  let label = '';
  if (ev.type === 'spill') {
    game.meters.clean = clamp(game.meters.clean - 16, 0, 100);
    label = '-Clean';
  } else if (ev.type === 'tantrum') {
    game.meters.kids = clamp(game.meters.kids - 16, 0, 100);
    label = '-Happy';
  } else if (ev.type === 'phone') {
    game.meters.sanity = clamp(game.meters.sanity - 10, 0, 100);
    label = '-Sanity';
  } else if (ev.type === 'burn') {
    addDinner(-18);
    label = '-Dinner';
  }
  addFloat(ev.x, ev.y - 46, label, '#d64545', 14);
  playBad();
  vibrate([22, 30, 22]);
}

/* ---------------------------------------------------------------- update */

function update(dt) {
  game.time += dt;
  game.day = Math.min(1, game.time / DAY_SECONDS);

  const lowCoffee = game.meters.coffee < 22;
  const fatigue = lowCoffee ? 1.25 : 1;
  const crash = game.meters.coffee <= 0 ? 1.45 : fatigue;

  game.meters.coffee = clamp(game.meters.coffee - 0.62 * dt * fatigue, 0, 100);
  game.meters.sanity = clamp(game.meters.sanity - 0.38 * dt * crash, 0, 100);
  game.meters.kids = clamp(game.meters.kids - 0.45 * dt * crash, 0, 100);
  game.meters.clean = clamp(game.meters.clean - 0.5 * dt * crash, 0, 100);

  if (game.meters.clean < 25) {
    game.meters.kids = clamp(game.meters.kids - 0.08 * dt, 0, 100);
    game.meters.sanity = clamp(game.meters.sanity - 0.05 * dt, 0, 100);
  }

  for (const st of game.stations) {
    st.cd = Math.max(0, st.cd - dt);
    st.pulse = Math.max(0, st.pulse - dt * 3);
  }

  updateMom(dt);
  updateKids(dt);
  updateEvents(dt);
  ambient(dt);

  if (game.comboTimer > 0) {
    game.comboTimer -= dt;
    if (game.comboTimer <= 0) game.combo = 0;
  }

  if (!game.groceryDone && game.day >= game.groceryAt) {
    game.groceryDone = true;
    startMini();
    return;
  }

  if (!game.coffeeWarned && game.meters.coffee <= 0) {
    game.coffeeWarned = true;
    toast('Running on fumes... drink some coffee!', 2300);
  }
  if (!game.cleanWarned && game.meters.clean <= 5) {
    game.cleanWarned = true;
    toast('The mess is taking over!', 2200);
    spawnEvent('spill');
  }

  if (game.meters.sanity <= 0) {
    endGame('sanity');
    return;
  }
  if (game.meters.kids <= 0) {
    endGame('kids');
    return;
  }
  if (game.time >= DAY_SECONDS) {
    endGame(game.dinner >= 99.5 ? 'win' : 'takeout');
  }
}

function updateMom(dt) {
  const mom = game.mom;
  if (mom.pending && mom.pending.kind === 'kid') {
    const kid = mom.pending.kid;
    mom.tx = clamp(kid.x, 24, W - 24);
    mom.ty = clamp(kid.y + 26, 470, H - 40);
  }

  const dx = mom.tx - mom.x;
  const dy = mom.ty - mom.y;
  const d = Math.hypot(dx, dy);
  const speed = 560 * (game.meters.coffee < 12 ? 0.62 : 1);

  if (d > 3) {
    const step = Math.min(d, speed * dt);
    mom.x += (dx / d) * step;
    mom.y += (dy / d) * step;
    if (dx < -2) mom.facing = -1;
    else if (dx > 2) mom.facing = 1;
    mom.walkT += dt * (speed / 560) * 9;
  } else {
    mom.x = mom.tx;
    mom.y = mom.ty;
    mom.walkT = 0;
    if (mom.pending) {
      const pending = mom.pending;
      mom.pending = null;
      if (pending.kind === 'station') doStationAction(pending.station);
      else if (pending.kind === 'kid') doKidAction(pending.kid);
    }
  }

  mom.armT = Math.max(0, mom.armT - dt * 2.2);
  mom.blink -= dt;
  if (mom.blink < 0) mom.blink = 2.4 + Math.random() * 3;
}

function updateKids(dt) {
  const area = layout.kidArea;
  for (const kid of game.kids) {
    kid.cd = Math.max(0, kid.cd - dt);
    kid.timer -= dt;
    if (kid.timer <= 0) {
      kid.timer = 1.4 + Math.random() * 2.8;
      kid.tx = area.x1 + Math.random() * (area.x2 - area.x1);
      kid.ty = area.y1 + Math.random() * (area.y2 - area.y1);
    }
    const dx = kid.tx - kid.x;
    const dy = kid.ty - kid.y;
    const d = Math.hypot(dx, dy);
    const sad = game.meters.kids < 35;
    const speed = kid.speed * (sad ? 0.55 : 1) * (game.meters.kids > 75 ? 1.15 : 1);
    if (d > 4) {
      const step = Math.min(d, speed * dt);
      kid.x += (dx / d) * step;
      kid.y += (dy / d) * step;
      if (dx < -1) kid.facing = -1;
      else if (dx > 1) kid.facing = 1;
      kid.walkT += dt * 8;
    } else {
      kid.walkT = 0;
    }
  }
}

function updateEvents(dt) {
  game.nextEventAt -= dt;
  const active = game.events.filter((e) => e.state === 'active');
  if (game.nextEventAt <= 0 && active.length < 2) {
    spawnEvent();
    game.nextEventAt = 7.5 + Math.random() * 4.5;
  }

  for (const ev of game.events) {
    if (ev.state === 'active') {
      ev.t += dt;
      if (ev.kid) {
        ev.x = ev.kid.x;
        ev.y = ev.kid.y - 104;
      }
      if (ev.t >= ev.duration) missEvent(ev);
    } else {
      ev.pop -= dt;
    }
  }
  game.events = game.events.filter((e) => e.state === 'active' || e.pop > 0);
}

function ambient(dt) {
  game.ambientAt -= dt;
  if (game.ambientAt > 0) return;
  game.ambientAt = 0.42 + Math.random() * 0.4;
  if (game.dinner < 100) {
    addParticle('steam', layout.stove.x + (Math.random() * 2 - 1) * 8, layout.stove.y - 48, {
      vx: (Math.random() * 2 - 1) * 6,
      vy: -18 - Math.random() * 16,
      life: 0.8 + Math.random() * 0.5,
      size: 4 + Math.random() * 4,
      color: '#fff8ee',
    });
  }
  if (game.meters.coffee < 65) {
    addParticle('steam', layout.coffee.x + 9, layout.coffee.y - 44, {
      vx: (Math.random() * 2 - 1) * 4,
      vy: -14 - Math.random() * 12,
      life: 0.7 + Math.random() * 0.4,
      size: 3 + Math.random() * 3,
      color: '#fff8ee',
    });
  }
  if (Math.random() < 0.35) {
    const wx = layout.window.x + (Math.random() * 2 - 1) * layout.window.w * 0.4;
    const wy = layout.window.y + (Math.random() * 2 - 1) * layout.window.h * 0.35;
    addParticle('sparkle', wx, wy, {
      vx: (Math.random() * 2 - 1) * 6,
      vy: -6 - Math.random() * 8,
      life: 0.8 + Math.random() * 0.8,
      size: 1.5 + Math.random() * 2.5,
      color: '#fff8ee',
      gravity: 0,
    });
  }
}
