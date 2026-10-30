'use strict';

const H = 900;
const DAY_SECONDS = 150;
const FONT = 'ui-rounded, "SF Pro Rounded", "Nunito", "Segoe UI", system-ui, sans-serif';
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const stage = document.getElementById('stage');

const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const miniScreen = document.getElementById('miniGame');
const endScreen = document.getElementById('endScreen');

const playBtn = document.getElementById('playBtn');
const startTiltBtn = document.getElementById('startTiltBtn');
const btnSound = document.getElementById('btnSound');
const btnTilt = document.getElementById('btnTilt');
const btnPause = document.getElementById('btnPause');
const tiltLabel = document.getElementById('tiltLabel');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const replayBtn = document.getElementById('replayBtn');
const endMenuBtn = document.getElementById('endMenuBtn');

const clockText = document.getElementById('clockText');
const clockIcon = document.getElementById('clockIcon');
const dayFill = document.getElementById('dayFill');
const dinnerFill = document.getElementById('dinnerFill');
const dinnerText = document.getElementById('dinnerText');
const scoreText = document.getElementById('scoreText');
const comboBadge = document.getElementById('comboBadge');
const bestScore = document.getElementById('bestScore');
const hint = document.getElementById('hint');
const toastEl = document.getElementById('toast');
const sr = document.getElementById('sr');

const meterEls = {
  coffee: document.getElementById('meter-coffee'),
  sanity: document.getElementById('meter-sanity'),
  kids: document.getElementById('meter-kids'),
  clean: document.getElementById('meter-clean'),
};

const balanceTrack = document.getElementById('balanceTrack');
const balanceBag = document.getElementById('balanceBag');
const dangerFill = document.getElementById('dangerFill');
const miniTimer = document.getElementById('miniTimer');
const miniTiltBtn = document.getElementById('miniTiltBtn');
const miniResult = document.getElementById('miniResult');

const endEmoji = document.getElementById('endEmoji');
const endGrade = document.getElementById('endGrade');
const endTitle = document.getElementById('endTitle');
const endSub = document.getElementById('endSub');
const statScore = document.getElementById('statScore');
const statDinner = document.getElementById('statDinner');
const statCoffee = document.getElementById('statCoffee');
const statSanity = document.getElementById('statSanity');
const statKids = document.getElementById('statKids');
const statClean = document.getElementById('statClean');
const endBest = document.getElementById('endBest');

const STATION_DEFS = [
  { id: 'coffee', label: 'Coffee', icon: '☕', cdMax: 7.4, color: '#8a5a2b' },
  { id: 'sink', label: 'Dishes', icon: '🧽', cdMax: 5.6, color: '#4a9fd0' },
  { id: 'stove', label: 'Cook', icon: '🍳', cdMax: 2.2, color: '#e76f51' },
  { id: 'couch', label: 'Rest', icon: '🛋️', cdMax: 9.5, color: '#2a9d8f' },
  { id: 'toys', label: 'Tidy', icon: '🧸', cdMax: 5.6, color: '#e9a23b' },
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (x1, y1, x2, y2) => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
};

let scale = 1;
let dpr = 1;
let W = 480;
let layout = null;
let game = null;
let soundOn = readSound();
let audio = null;
let musicTimer = null;
let musicStep = 0;
let hintTimer = 0;
let toastTimer = 0;
let last = performance.now();
let motionAttached = false;
let hasDraggedMini = false;
let hudCache = {};

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixColor(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))}, ${Math.round(lerp(A[1], B[1], t))}, ${Math.round(lerp(A[2], B[2], t))})`;
}

function alpha(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function formatScore(n) {
  return Math.max(0, Math.round(n)).toLocaleString('en-US');
}

function rr(x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fillRR(x, y, w, h, r, fill) {
  rr(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRR(x, y, w, h, r, stroke, width = 1) {
  rr(x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function heartPath(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.38);
  ctx.bezierCurveTo(x - s * 1.25, y - s * 0.32, x - s * 0.58, y - s * 1.12, x, y - s * 0.46);
  ctx.bezierCurveTo(x + s * 0.58, y - s * 1.12, x + s * 1.25, y - s * 0.32, x, y + s * 0.38);
  ctx.closePath();
}

function sparklePath(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.closePath();
}

function drawShadow(x, y, rx, ry, a = 0.18) {
  ctx.save();
  ctx.fillStyle = `rgba(38, 70, 83, ${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ---------------------------------------------------------------- storage */

function readBest() {
  try {
    return Number(localStorage.getItem('momSim.best')) || 0;
  } catch {
    return 0;
  }
}

function writeBest(value) {
  try {
    localStorage.setItem('momSim.best', String(Math.round(value)));
  } catch {
    /* storage may be unavailable */
  }
}

function readSound() {
  try {
    const value = localStorage.getItem('momSim.sound');
    return value === null ? true : value === '1';
  } catch {
    return true;
  }
}

function writeSound(value) {
  try {
    localStorage.setItem('momSim.sound', value ? '1' : '0');
  } catch {
    /* storage may be unavailable */
  }
}

/* ---------------------------------------------------------------- audio */

function initAudio() {
  if (!soundOn) return;
  if (!audio) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      audio = new AC();
    } catch {
      return;
    }
  }
  if (audio.state === 'suspended') audio.resume().catch(() => {});
}

function tone(freq, dur = 0.12, type = 'sine', vol = 0.05, delay = 0) {
  if (!soundOn || !audio) return;
  const t0 = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function playGood() {
  tone(523.25, 0.1, 'sine', 0.045);
  tone(659.25, 0.1, 'sine', 0.04, 0.055);
  tone(783.99, 0.16, 'sine', 0.035, 0.11);
}

function playSoft() {
  tone(440, 0.06, 'sine', 0.025);
}

function playAlert() {
  tone(880, 0.08, 'triangle', 0.04);
  tone(1046.5, 0.1, 'triangle', 0.035, 0.09);
}

function playBad() {
  tone(196, 0.16, 'sawtooth', 0.04);
  tone(146.83, 0.22, 'sawtooth', 0.035, 0.08);
  tone(110, 0.28, 'triangle', 0.03, 0.16);
}

function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.28, 'sine', 0.045, i * 0.12));
}

function playLose() {
  [392, 329.63, 261.63, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.04, i * 0.14));
}

const MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];

function startMusic() {
  if (!soundOn || !audio || musicTimer) return;
  musicTimer = setInterval(() => {
    if (!soundOn || !game || game.mode !== 'playing') return;
    const f = MELODY[musicStep % MELODY.length];
    musicStep += 1;
    tone(f, 0.55, 'sine', 0.011);
    if (musicStep % 4 === 0) tone(f / 2, 0.85, 'triangle', 0.008);
  }, 820);
}

function stopMusic() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

function vibrate(pattern) {
  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

/* ---------------------------------------------------------------- layout */

function layoutGame() {
  const rect = canvas.getBoundingClientRect();
  const cw = rect.width || window.innerWidth || 390;
  const ch = rect.height || window.innerHeight || 844;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(cw * dpr));
  canvas.height = Math.max(1, Math.round(ch * dpr));
  scale = ch / H;
  W = cw / scale;

  layout = {
    W,
    H,
    wallBottom: 500,
    window: { x: W / 2, y: 214, w: Math.min(W * 0.54, 300), h: 170 },
    clock: { x: W * 0.095, y: 208, r: 24 },
    coffee: { x: W * 0.14, y: 360 },
    sink: { x: W * 0.5, y: 402 },
    stove: { x: W * 0.86, y: 358 },
    couch: { x: W * 0.2, y: 690 },
    toys: { x: W * 0.82, y: 720 },
    momHome: { x: W * 0.5, y: 646 },
    kidArea: { x1: W * 0.31, x2: W * 0.69, y1: 575, y2: 700 },
    rug: { x: W * 0.5, y: 722, w: Math.min(W * 0.8, 480), h: 190 },
    plant: { x: W * 0.955, y: 648 },
  };

  if (game) {
    for (const st of game.stations) {
      const point = layout[st.id];
      if (point) {
        st.x = point.x;
        st.y = point.y;
      }
    }
    if (game.mode === 'start' || game.mode === 'over') {
      resetPositions();
    } else {
      game.mom.x = clamp(game.mom.x, 24, W - 24);
      game.mom.y = clamp(game.mom.y, 470, H - 40);
      game.mom.tx = clamp(game.mom.tx, 24, W - 24);
      game.mom.ty = clamp(game.mom.ty, 470, H - 40);
      for (const kid of game.kids) {
        kid.x = clamp(kid.x, 24, W - 24);
        kid.y = clamp(kid.y, 470, H - 40);
        kid.tx = clamp(kid.tx, 24, W - 24);
        kid.ty = clamp(kid.ty, 470, H - 40);
      }
    }
  }
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}

/* ---------------------------------------------------------------- state */

function newGameState(prev) {
  return {
    mode: 'start',
    time: 0,
    day: 0,
    score: 0,
    combo: 0,
    comboTimer: 0,
    meters: { coffee: 90, sanity: 88, kids: 82, clean: 86 },
    dinner: 0,
    mom: {
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
      facing: 1,
      walkT: 0,
      armT: 0,
      pending: null,
      blink: 2 + Math.random() * 2,
    },
    kids: [
      { x: 0, y: 0, tx: 0, ty: 0, facing: 1, walkT: 0, timer: 1, cd: 0, speed: 48, kind: 0 },
      { x: 0, y: 0, tx: 0, ty: 0, facing: -1, walkT: 0, timer: 2, cd: 0, speed: 43, kind: 1 },
    ],
    stations: STATION_DEFS.map((def) => ({ ...def, x: 0, y: 0, cd: 0, pulse: 0 })),
    events: [],
    particles: [],
    floats: [],
    ripples: [],
    nextEventAt: 9,
    groceryDone: false,
    groceryAt: 0.46,
    shake: 0,
    flash: 0,
    flashColor: '#e76f51',
    coffeeWarned: false,
    cleanWarned: false,
    mini: null,
    ambientAt: 0.3,
    tiltEnabled: prev ? prev.tiltEnabled : false,
    tiltRaw: prev ? prev.tiltRaw : 0,
    tiltSmoothed: prev ? prev.tiltSmoothed : 0,
    tiltHasData: prev ? prev.tiltHasData : false,
  };
}

function resetGame() {
  const prev = game;
  game = newGameState(prev);
  layoutGame();
  resetPositions();
  hudCache = {};
  updateHud(true);
}

function resetPositions() {
  if (!layout || !game) return;
  const mom = game.mom;
  mom.x = mom.tx = layout.momHome.x;
  mom.y = mom.ty = layout.momHome.y;
  mom.facing = 1;
  mom.walkT = 0;
  mom.armT = 0;
  mom.pending = null;
  const area = layout.kidArea;
  game.kids.forEach((kid, i) => {
    kid.x = area.x1 + (area.x2 - area.x1) * (0.28 + i * 0.44);
    kid.y = area.y1 + (area.y2 - area.y1) * (0.5 + i * 0.12);
    kid.tx = kid.x;
    kid.ty = kid.y;
    kid.facing = i === 0 ? 1 : -1;
    kid.walkT = 0;
    kid.cd = 0;
    kid.timer = 1 + Math.random() * 2.5;
  });
}

/* ---------------------------------------------------------------- tilt */

function supportsMotion() {
  return typeof window.DeviceMotionEvent !== 'undefined';
}

function motionHandler(event) {
  const acc = event.accelerationIncludingGravity;
  if (!acc || typeof acc.x !== 'number' || !game) return;
  game.tiltRaw = acc.x;
  game.tiltHasData = true;
}

function attachMotion() {
  if (motionAttached) return;
  window.addEventListener('devicemotion', motionHandler, { passive: true });
  motionAttached = true;
}

async function requestTilt() {
  if (!game) return false;
  if (game.tiltEnabled) {
    game.tiltEnabled = false;
    updateTiltUI();
    toast('Tilt controls off');
    return false;
  }
  if (!supportsMotion()) {
    toast('Tilt is not available on this device');
    return false;
  }
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const result = await DeviceMotionEvent.requestPermission();
      if (result !== 'granted') {
        toast('Motion permission was not granted');
        return false;
      }
    } catch {
      toast('Motion permission is unavailable here');
      return false;
    }
  }
  attachMotion();
  game.tiltEnabled = true;
  game.tiltBase = game.tiltRaw;
  updateTiltUI();
  toast('Tilt controls on. Tilt to steer the grocery bag.');
  playSoft();
  return true;
}

function updateTiltUI() {
  const on = Boolean(game && game.tiltEnabled);
  tiltLabel.textContent = on ? 'Tilt on' : 'Tilt off';
  btnTilt.classList.toggle('active', on);
  btnTilt.setAttribute('aria-label', on ? 'Disable tilt controls' : 'Enable tilt controls');
  startTiltBtn.textContent = on ? '📱 Tilt: On' : '📱 Tilt: Off';
  startTiltBtn.classList.toggle('active', on);
  if (!miniScreen.classList.contains('hidden')) {
    miniTiltBtn.textContent = on ? 'Tilt active ✓' : supportsMotion() ? 'Enable Tilt' : 'Touch mode';
  }
}

/* ---------------------------------------------------------------- ui helpers */

function toast(message, ms = 1900) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

function showHint(message, ms = 5000) {
  hint.textContent = message;
  hint.classList.add('show');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => hint.classList.remove('show'), ms);
}

function updateSoundUI() {
  btnSound.classList.toggle('muted', !soundOn);
  btnSound.setAttribute('aria-label', soundOn ? 'Mute sound' : 'Unmute sound');
}

function toggleSound() {
  soundOn = !soundOn;
  writeSound(soundOn);
  if (soundOn) {
    initAudio();
    if (game.mode === 'playing') startMusic();
    toast('Sound on');
    playSoft();
  } else {
    stopMusic();
    toast('Sound off');
  }
  updateSoundUI();
}

function togglePause() {
  if (game.mode === 'playing') {
    game.mode = 'paused';
    pauseScreen.classList.remove('hidden');
    stopMusic();
    playSoft();
  } else if (game.mode === 'paused') {
    game.mode = 'playing';
    pauseScreen.classList.add('hidden');
    if (soundOn) {
      initAudio();
      startMusic();
    }
    playSoft();
  }
}

function comboMultiplier() {
  return Math.min(5, 1 + Math.max(0, game.combo - 1) * 0.5);
}

function addComboAndScore(base, x, y, color) {
  game.combo += 1;
  game.comboTimer = 4.2;
  const mult = comboMultiplier();
  const points = Math.round(base * mult);
  game.score += points;
  if (x !== undefined) addFloat(x, y, `+${points}`, color || '#2a9d8f', 15);
  return points;
}

function addMeter(key, amount) {
  game.meters[key] = clamp(game.meters[key] + amount, 0, 100);
  const el = meterEls[key];
  if (el) {
    el.classList.add('bump');
    clearTimeout(el._bumpTimer);
    el._bumpTimer = setTimeout(() => el.classList.remove('bump'), 170);
  }
}

function addDinner(amount) {
  game.dinner = clamp(game.dinner + amount, 0, 100);
}

/* ---------------------------------------------------------------- flow */

function startGame() {
  resetGame();
  game.mode = 'playing';
  startScreen.classList.add('hidden');
  pauseScreen.classList.add('hidden');
  miniScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  initAudio();
  if (soundOn) startMusic();
  updateHud(true);
  showHint('Tap glowing things to help!', 5200);
  burst(game.mom.x, game.mom.y - 95, 'sparkle', 10, '#e9c46a');
  playSoft();
  sr.textContent =
    'Game started. Keep coffee, sanity, kids, and clean above zero. Cook dinner before 6 PM.';
}

function goMenu() {
  stopMusic();
  pauseScreen.classList.add('hidden');
  miniScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  resetGame();
  game.mode = 'start';
  startScreen.classList.remove('hidden');
  bestScore.textContent = formatScore(readBest());
  updateHud(true);
  updateTiltUI();
  sr.textContent = 'Main menu. Press play to start.';
}

function computeGrade(reason) {
  if (reason === 'sanity' || reason === 'kids') return 'F';
  const avg = (game.meters.coffee + game.meters.sanity + game.meters.kids + game.meters.clean) / 4;
  let grade = 'C';
  if (game.score >= 4200 && avg >= 55 && game.dinner >= 99.5) grade = 'S';
  else if (game.score >= 2800 && game.dinner >= 99.5) grade = 'A';
  else if (game.score >= 1500) grade = 'B';
  if (reason === 'takeout' && grade === 'S') grade = 'A';
  return grade;
}

function endGame(reason) {
  if (game.mode !== 'playing') return;
  game.mode = 'over';
  stopMusic();

  const previousBest = readBest();
  const isBest = game.score > previousBest;
  if (isBest) writeBest(game.score);
  const shownBest = Math.max(previousBest, game.score);
  bestScore.textContent = formatScore(shownBest);

  const grade = computeGrade(reason);
  let title = 'Day Complete!';
  let sub = 'Dinner is served and everyone survived. You are a legend.';
  let emoji = '🏆';
  if (reason === 'takeout') {
    title = 'Takeout Night';
    sub = 'You made it to 6 PM, but dinner was not ready. It happens to the best of us.';
    emoji = '🥡';
  } else if (reason === 'sanity') {
    title = 'Mom Down';
    sub = 'The mental load hit zero. The couch is calling your name.';
    emoji = '🫠';
  } else if (reason === 'kids') {
    title = 'Tiny Rebellion';
    sub = 'The kids reached critical meltdown. Tomorrow is a brand new day.';
    emoji = '😤';
  }

  endEmoji.textContent = emoji;
  endGrade.textContent = grade;
  endGrade.className = 'grade' + (grade === 'S' ? ' grade-s' : grade === 'F' ? ' grade-f' : '');
  endTitle.textContent = title;
  endSub.textContent = sub;
  statScore.textContent = formatScore(game.score);
  statDinner.textContent = `${Math.round(game.dinner)}%`;
  statCoffee.textContent = `${Math.round(game.meters.coffee)}%`;
  statSanity.textContent = `${Math.round(game.meters.sanity)}%`;
  statKids.textContent = `${Math.round(game.meters.kids)}%`;
  statClean.textContent = `${Math.round(game.meters.clean)}%`;
  endBest.classList.toggle('show', isBest);
  endBest.textContent = isBest ? 'New best score!' : `Best ${formatScore(shownBest)}`;
  endScreen.classList.remove('hidden');

  if (grade === 'F' || reason === 'takeout') playLose();
  else playWin();
  vibrate(grade === 'F' ? [40, 50, 40] : [18, 40, 18, 40, 30]);
  sr.textContent = `${title}. Grade ${grade}. Score ${formatScore(game.score)}.`;
}

/* ---------------------------------------------------------------- mini game */

function startMini() {
  game.mode = 'minigame';
  game.mini = {
    t: 0,
    duration: 6,
    p: 0,
    v: 0,
    danger: 0,
    input: 0,
    dragging: false,
    dragInput: 0,
    baseTilt: game.tiltSmoothed,
    result: null,
    resultT: 0,
  };
  hasDraggedMini = false;
  miniResult.classList.add('hidden');
  miniResult.className = 'mini-result hidden';
  miniResult.textContent = '';
  balanceBag.style.left = '50%';
  dangerFill.style.width = '0%';
  miniTimer.textContent = '6.0s';
  miniScreen.classList.remove('hidden');
  updateTiltUI();
  playAlert();
  toast('Grocery run! Keep the bag balanced.', 2200);
}

function showMiniResult(title, sub, good) {
  miniResult.innerHTML = '';
  const strong = document.createElement('span');
  strong.textContent = title;
  const small = document.createElement('small');
  small.textContent = sub;
  miniResult.append(strong, small);
  miniResult.className = `mini-result ${good ? 'good' : 'bad'}`;
}

function finishMini() {
  const result = game.mini ? game.mini.result : null;
  miniScreen.classList.add('hidden');
  game.mini = null;
  game.mode = 'playing';
  game.nextEventAt = Math.max(game.nextEventAt, 4);
  if (result === 'good') {
    toast('Groceries delivered! +22 dinner', 2200);
    addFloat(layout.momHome.x, 540, '+22 Dinner', '#e76f51', 17);
    burst(layout.momHome.x, 560, 'confetti', 18, '#e9c46a');
  } else if (result === 'bad') {
    toast('Groceries everywhere...', 2000);
  }
}

function updateMini(dt) {
  const m = game.mini;
  if (!m) return;
  if (m.result) {
    m.resultT -= dt;
    if (m.resultT <= 0) finishMini();
    return;
  }

  m.t += dt;
  let input = 0;
  if (m.dragging) input = m.dragInput;
  else if (game.tiltEnabled && game.tiltHasData) {
    input = clamp((game.tiltSmoothed - m.baseTilt) / 5.5, -1, 1);
  }
  m.input = input;

  const noise = Math.sin(m.t * 2.1) * 0.55 + Math.sin(m.t * 3.7 + 1.2) * 0.35;
  m.v += (input * 2.9 - m.p * 1.15 + noise) * dt;
  m.v *= Math.pow(0.985, dt * 60);
  m.p += m.v * dt;

  if (m.p > 1) {
    m.p = 1;
    m.v *= -0.35;
    m.danger += 14;
  } else if (m.p < -1) {
    m.p = -1;
    m.v *= -0.35;
    m.danger += 14;
  }
  if (Math.abs(m.p) > 0.44) m.danger += 34 * dt;
  else m.danger -= 24 * dt;
  m.danger = clamp(m.danger, 0, 100);

  balanceBag.style.left = `${50 + m.p * 47}%`;
  dangerFill.style.width = `${m.danger}%`;
  miniTimer.textContent = `${Math.max(0, m.duration - m.t).toFixed(1)}s`;

  if (m.danger >= 100) {
    m.result = 'bad';
    m.resultT = 1.25;
    addDinner(-12);
    game.meters.sanity = clamp(game.meters.sanity - 8, 0, 100);
    game.combo = 0;
    game.comboTimer = 0;
    game.shake = 9;
    game.flash = 0.42;
    game.flashColor = '#d64545';
    showMiniResult('Oops!', 'The groceries hit the floor. -12 dinner', false);
    playBad();
    vibrate([30, 40, 30]);
  } else if (m.t >= m.duration) {
    m.result = 'good';
    m.resultT = 1.25;
    addDinner(22);
    game.score += 250;
    game.meters.sanity = clamp(game.meters.sanity + 5, 0, 100);
    game.combo = Math.max(game.combo, 2);
    game.comboTimer = 4.2;
    showMiniResult('Balanced!', '+22 dinner · +250 score', true);
    playWin();
    vibrate([15, 30, 15]);
  }
}

function miniPointer(event) {
  if (!game.mini || game.mini.result) return;
  const rect = balanceTrack.getBoundingClientRect();
  if (!rect.width) return;
  const rel = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  game.mini.dragging = true;
  game.mini.dragInput = clamp((rel - 0.5) / 0.5, -1, 1);
  game.mini.p = clamp((rel - 0.5) / 0.47, -1, 1);
  game.mini.v = 0;
  if (!hasDraggedMini) {
    hasDraggedMini = true;
    miniTiltBtn.textContent = game.tiltEnabled ? 'Tilt active ✓' : 'Drag mode';
  }
}
