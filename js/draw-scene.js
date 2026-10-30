'use strict';

/* ---------------------------------------------------------------- scene */

function stationNeedsAttention(st) {
  if (!game) return false;
  if (st.id === 'coffee') return game.meters.coffee < 45;
  if (st.id === 'sink') return game.meters.clean < 55;
  if (st.id === 'toys') return game.meters.clean < 55;
  if (st.id === 'couch') return game.meters.sanity < 55;
  if (st.id === 'stove') return game.dinner < game.day * 100 - 10 || game.dinner < 30;
  return false;
}

function drawStationGlow(st, now) {
  if (st.cd > 0.15 || !stationNeedsAttention(st)) return;
  const pulse = 0.5 + 0.5 * Math.sin(now * 4 + st.x * 0.01);
  const g = ctx.createRadialGradient(st.x, st.y, 8, st.x, st.y, 72);
  g.addColorStop(0, `rgba(255, 224, 138, ${0.28 + pulse * 0.16})`);
  g.addColorStop(0.65, `rgba(255, 205, 112, ${0.1 + pulse * 0.07})`);
  g.addColorStop(1, 'rgba(255, 205, 112, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(st.x, st.y, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = `rgba(255, 232, 170, ${0.42 + pulse * 0.32})`;
  ctx.lineWidth = 2.4;
  ctx.setLineDash([5, 7]);
  ctx.beginPath();
  ctx.arc(st.x, st.y, 42 + pulse * 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCooldown(st) {
  if (st.cd <= 0.05) return;
  const progress = clamp(1 - st.cd / st.cdMax, 0, 1);
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 248, 238, 0.52)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(st.x, st.y, 48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.stroke();
  ctx.restore();
}

function drawWindow(now) {
  const win = layout.window;
  const x = win.x;
  const y = win.y;
  const w = win.w;
  const h = win.h;
  const t = game.day;

  let top;
  let bottom;
  if (t < 0.5) {
    top = mixColor('#9ad9f7', '#8fd0f0', t / 0.5);
    bottom = mixColor('#ffe7b0', '#ffdda0', t / 0.5);
  } else if (t < 0.8) {
    top = mixColor('#8fd0f0', '#f7a072', (t - 0.5) / 0.3);
    bottom = mixColor('#ffdda0', '#ffd6a5', (t - 0.5) / 0.3);
  } else {
    top = mixColor('#f7a072', '#5b4b8a', (t - 0.8) / 0.2);
    bottom = mixColor('#ffd6a5', '#f6a26b', (t - 0.8) / 0.2);
  }

  drawShadow(x, y + h / 2 + 14, w * 0.54, 10, 0.12);
  fillRR(x - w / 2 - 9, y - h / 2 - 9, w + 18, h + 18, 16, '#d8b08a');

  ctx.save();
  rr(x - w / 2, y - h / 2, w, h, 12);
  ctx.clip();

  const sky = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  sky.addColorStop(0, top);
  sky.addColorStop(1, bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(x - w / 2, y - h / 2, w, h);

  const sunX = x - w / 2 + 24 + (w - 48) * t;
  const sunY = y + h / 2 - 26 - Math.sin(t * Math.PI) * (h * 0.55);
  const sunR = 17;
  const glow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, sunR * 3);
  glow.addColorStop(0, 'rgba(255, 240, 170, 0.95)');
  glow.addColorStop(0.4, 'rgba(255, 213, 112, 0.45)');
  glow.addColorStop(1, 'rgba(255, 213, 112, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = t > 0.82 ? '#ffb35c' : '#ffd166';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 3; i += 1) {
    const cw = 40 + i * 9;
    const cx = x - w / 2 - 40 + ((now * (7 + i * 2) + i * 90) % (w + 80));
    const cy = y - h * 0.25 + i * 24;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.62 - i * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw * 0.42, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + cw * 0.28, cy - 5, cw * 0.3, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - cw * 0.3, cy + 2, cw * 0.26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(91, 154, 116, 0.65)';
  ctx.beginPath();
  ctx.ellipse(x - w * 0.25, y + h / 2 - 12, w * 0.32, 26, 0, Math.PI, Math.PI * 2);
  ctx.ellipse(x + w * 0.28, y + h / 2 - 8, w * 0.38, 32, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(68, 124, 94, 0.7)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.08, y + h / 2 - 4, w * 0.5, 18, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 4; i += 1) {
    const hx = x - w * 0.34 + i * w * 0.22;
    const hy = y + h / 2 - 18;
    ctx.fillStyle = 'rgba(255, 246, 232, 0.62)';
    ctx.fillRect(hx, hy - 10, 13, 12);
    ctx.fillStyle = 'rgba(217, 139, 114, 0.7)';
    ctx.beginPath();
    ctx.moveTo(hx - 2, hy - 10);
    ctx.lineTo(hx + 6.5, hy - 17);
    ctx.lineTo(hx + 15, hy - 10);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  ctx.strokeStyle = '#fff8ee';
  ctx.lineWidth = 7;
  rr(x - w / 2, y - h / 2, w, h, 12);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x, y + h / 2);
  ctx.moveTo(x - w / 2, y + h * 0.04);
  ctx.lineTo(x + w / 2, y + h * 0.04);
  ctx.stroke();

  fillRR(x - w / 2 - 12, y + h / 2 + 4, w + 24, 12, 6, '#e7c9a9');
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(x - w / 2 - 12, y + h / 2 + 4, w + 24, 3);

  fillRR(x - w / 2 - 22, y - h / 2 - 12, 22, h + 26, 9, '#d98b72');
  fillRR(x + w / 2, y - h / 2 - 12, 22, h + 26, 9, '#d98b72');
  ctx.strokeStyle = 'rgba(155, 79, 62, 0.28)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 17 + i * 7, y - h / 2 - 4);
    ctx.lineTo(x - w / 2 - 17 + i * 7, y + h / 2 + 6);
    ctx.moveTo(x + w / 2 + 5 + i * 7, y - h / 2 - 4);
    ctx.lineTo(x + w / 2 + 5 + i * 7, y + h / 2 + 6);
    ctx.stroke();
  }

  const px = x + w / 2 - 30;
  const py = y + h / 2 + 1;
  ctx.fillStyle = '#c97b55';
  ctx.beginPath();
  ctx.moveTo(px - 12, py);
  ctx.lineTo(px + 12, py);
  ctx.lineTo(px + 8, py + 15);
  ctx.lineTo(px - 8, py + 15);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4f8a63';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px, py - 2);
  ctx.lineTo(px, py - 18);
  ctx.moveTo(px, py - 8);
  ctx.lineTo(px - 9, py - 16);
  ctx.moveTo(px, py - 12);
  ctx.lineTo(px + 9, py - 20);
  ctx.stroke();
}

function drawClock(now) {
  const c = layout.clock;
  const minutes = 480 + game.day * 600;
  const hourAngle = (((minutes / 60) % 12) / 12) * Math.PI * 2 - Math.PI / 2;
  const minuteAngle = ((minutes % 60) / 60) * Math.PI * 2 - Math.PI / 2;

  drawShadow(c.x, c.y + c.r + 7, c.r * 0.8, 4, 0.1);
  ctx.fillStyle = '#e7c9a9';
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r + 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff8ee';
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#264653';
  ctx.lineWidth = 2.4;
  ctx.stroke();

  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2;
    ctx.fillStyle = 'rgba(38, 70, 83, 0.5)';
    ctx.beginPath();
    ctx.arc(c.x + Math.cos(a) * (c.r - 6), c.y + Math.sin(a) * (c.r - 6), 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#264653';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + Math.cos(hourAngle) * c.r * 0.45, c.y + Math.sin(hourAngle) * c.r * 0.45);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + Math.cos(minuteAngle) * c.r * 0.68, c.y + Math.sin(minuteAngle) * c.r * 0.68);
  ctx.stroke();
  ctx.fillStyle = '#e76f51';
  ctx.beginPath();
  ctx.arc(c.x, c.y, 2.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawPhotoFrame() {
  const x = W * 0.9;
  const y = 205;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.035);
  drawShadow(3, 31, 27, 5, 0.1);
  fillRR(-25, -30, 50, 60, 5, '#fff8ee');
  fillRR(-20, -25, 40, 50, 3, '#cfe8e2');
  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.arc(0, 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e76f51';
  ctx.beginPath();
  ctx.arc(-9, 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a9d8f';
  ctx.beginPath();
  ctx.arc(9, 2, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4a7b9';
  heartPath(0, -13, 5);
  ctx.fill();
  ctx.restore();
}

function drawBackground(now) {
  const wall = ctx.createLinearGradient(0, 0, 0, layout.wallBottom);
  wall.addColorStop(0, '#f9e7d4');
  wall.addColorStop(0.6, '#f3dcc5');
  wall.addColorStop(1, '#eccfb4');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, layout.wallBottom);

  ctx.save();
  ctx.fillStyle = 'rgba(181, 101, 74, 0.1)';
  for (let y = 38; y < layout.wallBottom - 20; y += 54) {
    for (let x = 18; x < W + 30; x += 54) {
      const offset = ((y / 54) % 2) * 27;
      ctx.beginPath();
      ctx.arc(x + offset, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  drawWindow(now);
  drawClock(now);
  drawPhotoFrame();

  ctx.fillStyle = '#e3b98f';
  ctx.fillRect(0, layout.wallBottom - 20, W, 20);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(0, layout.wallBottom - 20, W, 3);

  const floor = ctx.createLinearGradient(0, layout.wallBottom, 0, H);
  floor.addColorStop(0, '#cb9162');
  floor.addColorStop(0.5, '#bc7d4f');
  floor.addColorStop(1, '#a9663f');
  ctx.fillStyle = floor;
  ctx.fillRect(0, layout.wallBottom, W, H - layout.wallBottom);

  ctx.save();
  ctx.strokeStyle = 'rgba(90, 50, 26, 0.18)';
  ctx.lineWidth = 1.4;
  for (let y = layout.wallBottom + 48; y < H; y += 58) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let y = layout.wallBottom; y < H; y += 58) {
    const offset = ((y / 58) % 2) * 70;
    for (let x = offset; x < W; x += 140) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, Math.min(H, y + 58));
      ctx.stroke();
    }
  }
  ctx.restore();

  const beam = ctx.createLinearGradient(layout.window.x, layout.window.y + layout.window.h / 2, layout.window.x, H);
  beam.addColorStop(0, 'rgba(255, 244, 198, 0.22)');
  beam.addColorStop(1, 'rgba(255, 244, 198, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(layout.window.x - layout.window.w / 2, layout.window.y + layout.window.h / 2);
  ctx.lineTo(layout.window.x + layout.window.w / 2, layout.window.y + layout.window.h / 2);
  ctx.lineTo(layout.window.x + layout.window.w * 0.8, H);
  ctx.lineTo(layout.window.x - layout.window.w * 0.8, H);
  ctx.closePath();
  ctx.fill();

  drawRug();
}

function drawRug() {
  const rug = layout.rug;
  drawShadow(rug.x, rug.y + rug.h * 0.32, rug.w * 0.5, 18, 0.12);
  fillRR(rug.x - rug.w / 2, rug.y - rug.h / 2, rug.w, rug.h, 30, '#2a9d8f');
  fillRR(rug.x - rug.w / 2 + 9, rug.y - rug.h / 2 + 9, rug.w - 18, rug.h - 18, 24, '#f6e7d6');
  fillRR(rug.x - rug.w / 2 + 20, rug.y - rug.h / 2 + 20, rug.w - 40, rug.h - 40, 20, '#35b3a3');

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 248, 238, 0.5)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 12]);
  rr(rug.x - rug.w / 2 + 34, rug.y - rug.h / 2 + 34, rug.w - 68, rug.h - 68, 16);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 248, 238, 0.85)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i += 1) {
    const x = rug.x - rug.w / 2 + 22 + i * ((rug.w - 44) / 7);
    ctx.beginPath();
    ctx.moveTo(x, rug.y + rug.h / 2);
    ctx.lineTo(x, rug.y + rug.h / 2 + 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCounter(now) {
  fillRR(W * 0.02, 330, W * 0.96, 68, 8, '#cfe8e2');
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.58)';
  ctx.lineWidth = 1.2;
  for (let x = W * 0.02 + 34; x < W * 0.98; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x, 330);
    ctx.lineTo(x, 398);
    ctx.stroke();
  }
  for (let y = 356; y < 398; y += 24) {
    ctx.beginPath();
    ctx.moveTo(W * 0.02, y);
    ctx.lineTo(W * 0.98, y);
    ctx.stroke();
  }
  ctx.restore();

  const counter = ctx.createLinearGradient(0, 392, 0, 494);
  counter.addColorStop(0, '#f4e2cc');
  counter.addColorStop(0.16, '#e8cdb0');
  counter.addColorStop(1, '#c99569');
  fillRR(W * 0.015, 392, W * 0.97, 102, 12, counter);
  fillRR(W * 0.015, 392, W * 0.97, 18, 9, '#f7e9d8');
  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.fillRect(W * 0.03, 395, W * 0.94, 3);

  ctx.save();
  ctx.strokeStyle = 'rgba(120, 76, 42, 0.26)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 5; i += 1) {
    const x = W * 0.02 + (W * 0.96 * i) / 5;
    ctx.beginPath();
    ctx.moveTo(x, 414);
    ctx.lineTo(x, 488);
    ctx.stroke();
  }
  for (let i = 0; i < 5; i += 1) {
    const x = W * 0.02 + (W * 0.96 * (i + 0.5)) / 5;
    fillRR(x - 14, 424, 28, 6, 3, 'rgba(255, 248, 238, 0.7)');
  }
  ctx.restore();

  const fx = W * 0.68;
  const fy = 386;
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(fx, fy + 4, 24, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.arc(fx - 8, fy, 8, 0, Math.PI * 2);
  ctx.arc(fx + 7, fy - 2, 7, 0, Math.PI * 2);
  ctx.arc(fx + 1, fy - 9, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(fx - 10, fy - 3, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawCoffee(st, now) {
  drawStationGlow(st, now);
  const x = st.x;
  const top = 308;
  const body = ctx.createLinearGradient(0, top, 0, 394);
  body.addColorStop(0, '#3d5f6b');
  body.addColorStop(1, '#223b45');
  fillRR(x - 31, top, 62, 84, 13, body);
  fillRR(x - 26, top - 6, 52, 12, 6, '#4a707c');
  fillRR(x - 22, top + 13, 44, 31, 7, '#f2dfc8');
  fillRR(x - 19, top + 17, 38, 9, 4, '#d8b08a');
  ctx.fillStyle = '#264653';
  ctx.beginPath();
  ctx.arc(x + 17, top + 37, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = game.meters.coffee < 22 ? '#e76f51' : '#2a9d8f';
  ctx.beginPath();
  ctx.arc(x + 17, top + 24, 2.4, 0, Math.PI * 2);
  ctx.fill();

  fillRR(x - 5, top + 43, 10, 16, 3, '#264653');
  ctx.fillStyle = '#e76f51';
  ctx.beginPath();
  ctx.ellipse(x, 381, 13, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  fillRR(x - 14, 366, 24, 17, 5, '#e76f51');
  ctx.strokeStyle = '#e76f51';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + 13, 373, 7, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = '#fff8ee';
  ctx.beginPath();
  ctx.ellipse(x - 2, 369, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  if (game.meters.coffee < 50) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 248, 238, 0.55)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 2; i += 1) {
      const sx = x - 3 + i * 9;
      const off = Math.sin(now * 2 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(sx, 358);
      ctx.bezierCurveTo(sx + 5 + off, 350, sx - 4 + off, 344, sx + 2, 336);
      ctx.stroke();
    }
    ctx.restore();
  }
  drawCooldown(st);
}

function drawSink(st, now) {
  drawStationGlow(st, now);
  const x = st.x;
  ctx.fillStyle = '#9fd8f5';
  ctx.beginPath();
  ctx.ellipse(x, 402, 54, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6aa9c4';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#5b9fbf';
  ctx.beginPath();
  ctx.ellipse(x, 402, 43, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x - 12, 399, 15, 3.5, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#d9e2e6';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 37, 397);
  ctx.lineTo(x + 37, 365);
  ctx.quadraticCurveTo(x + 37, 352, x + 22, 352);
  ctx.lineTo(x + 10, 352);
  ctx.stroke();
  ctx.strokeStyle = '#b8c9cf';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 37, 397);
  ctx.lineTo(x + 37, 365);
  ctx.stroke();
  ctx.fillStyle = '#b8c9cf';
  ctx.beginPath();
  ctx.arc(x + 37, 397, 5, 0, Math.PI * 2);
  ctx.fill();

  if (game.meters.clean < 68) {
    const plates = game.meters.clean < 34 ? 4 : 2;
    for (let i = 0; i < plates; i += 1) {
      ctx.fillStyle = i % 2 ? '#fff8ee' : '#e7d8c8';
      ctx.beginPath();
      ctx.ellipse(x - 36 + i * 3, 388 - i * 5, 17, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 90, 70, 0.24)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  fillRR(x - 49, 385, 17, 11, 3, '#e9c46a');
  ctx.fillStyle = '#2a9d8f';
  ctx.beginPath();
  ctx.ellipse(x - 40, 388, 8, 3.5, -0.1, 0, Math.PI * 2);
  ctx.fill();

  if (st.pulse > 0.1) {
    for (let i = 0; i < 3; i += 1) {
      const a = now * 3 + i * 2;
      ctx.strokeStyle = 'rgba(159, 216, 245, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x - 10 + i * 12, 390 - Math.sin(a) * 6, 4 + i * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  drawCooldown(st);
}

function drawStove(st, now) {
  drawStationGlow(st, now);
  const x = st.x;
  const body = ctx.createLinearGradient(0, 320, 0, 492);
  body.addColorStop(0, '#3d5f6b');
  body.addColorStop(1, '#1d333c');
  fillRR(x - 48, 318, 96, 174, 11, body);
  fillRR(x - 52, 314, 104, 15, 7, '#264653');
  fillRR(x - 38, 352, 76, 62, 8, '#2f4c57');
  fillRR(x - 33, 358, 66, 50, 6, '#1b3039');
  ctx.strokeStyle = 'rgba(255, 248, 238, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 24, 366);
  ctx.lineTo(x + 24, 366);
  ctx.stroke();
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath();
    ctx.arc(x - 24 + i * 24, 340, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const burn = game.events.some((e) => e.type === 'burn' && e.state === 'active');
  const potY = 296 + Math.sin(now * 2.4) * 0.8;
  fillRR(x - 29, potY, 58, 32, 7, '#d9e2e6');
  fillRR(x - 25, potY + 4, 50, 9, 4, '#b8c9cf');
  ctx.strokeStyle = '#aebfc5';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 31, potY + 13);
  ctx.lineTo(x - 42, potY + 13);
  ctx.moveTo(x + 31, potY + 13);
  ctx.lineTo(x + 42, potY + 13);
  ctx.stroke();
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(x, potY, 27, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x - 9, potY - 1, 8, 2, -0.1, 0, Math.PI * 2);
  ctx.fill();

  if (!burn && game.dinner < 100) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 248, 238, 0.5)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 2; i += 1) {
      const sx = x - 7 + i * 14;
      const off = Math.sin(now * 2.2 + i * 1.6) * 3;
      ctx.beginPath();
      ctx.moveTo(sx, potY - 8);
      ctx.bezierCurveTo(sx + 5 + off, potY - 17, sx - 4 + off, potY - 24, sx + 2, potY - 32);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (burn) {
    for (let i = 0; i < 5; i += 1) {
      const fx = x - 20 + i * 10;
      const h = 12 + Math.sin(now * 9 + i * 1.7) * 6 + i * 2;
      ctx.fillStyle = i % 2 ? '#ffb347' : '#e76f51';
      ctx.beginPath();
      ctx.moveTo(fx, potY + 2);
      ctx.quadraticCurveTo(fx - 7, potY - h * 0.4, fx, potY - h);
      ctx.quadraticCurveTo(fx + 7, potY - h * 0.4, fx, potY + 2);
      ctx.fill();
    }
  }
  drawCooldown(st);
}

function drawCouch(st, now) {
  drawStationGlow(st, now);
  const x = st.x;
  const y = st.y;
  const cw = Math.min(190, W * 0.36);
  const half = cw / 2;
  drawShadow(x, y + 13, half * 0.95, 13, 0.16);
  fillRR(x - half, y - 92, cw, 68, 20, '#248f83');
  fillRR(x - half + 10, y - 84, cw / 2 - 14, 52, 14, '#2fa99b');
  fillRR(x + 4, y - 84, cw / 2 - 14, 52, 14, '#2fa99b');
  fillRR(x - half - 9, y - 42, cw + 18, 50, 18, '#35b3a3');
  fillRR(x - half + 2, y - 36, cw / 2 - 8, 38, 12, '#41c1b2');
  fillRR(x + 6, y - 36, cw / 2 - 8, 38, 12, '#41c1b2');
  fillRR(x - half - 13, y - 50, 23, 54, 11, '#23887c');
  fillRR(x + half - 10, y - 50, 23, 54, 11, '#23887c');

  ctx.fillStyle = '#1d6d64';
  fillRR(x - half + 12, y + 6, 12, 12, 3, '#1d6d64');
  fillRR(x + half - 24, y + 6, 12, 12, 3, '#1d6d64');

  ctx.save();
  ctx.translate(x - half + 18, y - 48);
  ctx.rotate(-0.12);
  fillRR(0, 0, 58, 42, 8, '#e9c46a');
  ctx.fillStyle = 'rgba(255, 248, 238, 0.55)';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(5 + i * 17, 6, 4, 30);
  }
  ctx.restore();

  ctx.save();
  ctx.translate(x + half - 34, y - 44);
  ctx.rotate(0.12);
  fillRR(-19, -17, 38, 34, 9, '#fff4e6');
  ctx.fillStyle = '#f4a7b9';
  heartPath(0, 0, 7);
  ctx.fill();
  ctx.restore();

  if (game.meters.sanity < 38) {
    ctx.save();
    ctx.fillStyle = 'rgba(38, 70, 83, 0.62)';
    ctx.font = `900 13px ${FONT}`;
    ctx.textAlign = 'center';
    for (let i = 0; i < 2; i += 1) {
      const zy = y - 112 - ((now * 14 + i * 22) % 44);
      ctx.globalAlpha = 0.65 - i * 0.2;
      ctx.fillText('z', x + 38 + i * 13, zy);
    }
    ctx.restore();
  }
  drawCooldown(st);
}

function drawToys(st, now) {
  drawStationGlow(st, now);
  const x = st.x;
  const y = st.y;
  const mess = 1 - clamp(game.meters.clean, 0, 100) / 100;
  const count = 2 + Math.floor(mess * 6);
  drawShadow(x, y + 7, 58, 12, 0.14);

  const spots = [
    { dx: -46, dy: 4, type: 'block', color: '#e76f51', rot: -0.24 },
    { dx: 18, dy: 8, type: 'ball', color: '#e9c46a', rot: 0 },
    { dx: -8, dy: -12, type: 'teddy', color: '#b5654a', rot: 0.05 },
    { dx: 48, dy: 0, type: 'block', color: '#2a9d8f', rot: 0.32 },
    { dx: -28, dy: -20, type: 'car', color: '#4a9fd0', rot: -0.06 },
    { dx: 36, dy: -22, type: 'block', color: '#f4a7b9', rot: -0.4 },
    { dx: 0, dy: -30, type: 'ball', color: '#9fd8f5', rot: 0 },
    { dx: 60, dy: -18, type: 'teddy', color: '#e9a23b', rot: -0.08 },
  ];

  for (let i = 0; i < count; i += 1) {
    const spot = spots[i];
    ctx.save();
    ctx.translate(x + spot.dx, y + spot.dy);
    ctx.rotate(spot.rot);
    if (spot.type === 'block') {
      fillRR(-11, -11, 22, 22, 4, spot.color);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(-7, -7, 14, 3);
      ctx.strokeStyle = 'rgba(38, 70, 83, 0.2)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-11, -11, 22, 22);
    } else if (spot.type === 'ball') {
      ctx.fillStyle = spot.color;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 7, -0.7, 0.7);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(-4, -4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (spot.type === 'teddy') {
      ctx.fillStyle = spot.color;
      ctx.beginPath();
      ctx.arc(0, 5, 10, 0, Math.PI * 2);
      ctx.arc(0, -9, 8, 0, Math.PI * 2);
      ctx.arc(-8, -15, 3.4, 0, Math.PI * 2);
      ctx.arc(8, -15, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff4e6';
      ctx.beginPath();
      ctx.ellipse(0, -7, 4, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#264653';
      ctx.beginPath();
      ctx.arc(-3, -11, 1.3, 0, Math.PI * 2);
      ctx.arc(3, -11, 1.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (spot.type === 'car') {
      fillRR(-14, -6, 28, 12, 4, spot.color);
      fillRR(-8, -12, 16, 9, 4, spot.color);
      ctx.fillStyle = '#264653';
      ctx.beginPath();
      ctx.arc(-8, 7, 4, 0, Math.PI * 2);
      ctx.arc(8, 7, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9fd8f5';
      ctx.fillRect(-5, -10, 10, 5);
    }
    ctx.restore();
  }

  if (st.pulse > 0.1) {
    ctx.save();
    ctx.globalAlpha = st.pulse;
    ctx.strokeStyle = '#fff8ee';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y - 8, 62 + (1 - st.pulse) * 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  drawCooldown(st);
}

function drawPlant(now) {
  const x = layout.plant.x;
  const y = layout.plant.y;
  drawShadow(x, y + 22, 22, 6, 0.14);
  ctx.fillStyle = '#c97b55';
  ctx.beginPath();
  ctx.moveTo(x - 17, y);
  ctx.lineTo(x + 17, y);
  ctx.lineTo(x + 12, y + 25);
  ctx.lineTo(x - 12, y + 25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.fillRect(x - 13, y + 2, 26, 3);
  ctx.strokeStyle = '#4f8a63';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  const sway = Math.sin(now * 1.4) * 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + sway, y - 24, x + sway, y - 42);
  ctx.moveTo(x + sway, y - 24);
  ctx.quadraticCurveTo(x - 18 + sway, y - 34, x - 22 + sway, y - 24);
  ctx.moveTo(x + sway, y - 31);
  ctx.quadraticCurveTo(x + 20 + sway, y - 42, x + 25 + sway, y - 31);
  ctx.stroke();
  ctx.fillStyle = '#4f8a63';
  for (let i = 0; i < 5; i += 1) {
    const a = -2.4 + i * 0.75;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(a) * 17 + sway,
      y - 37 + Math.sin(a) * 10,
      9,
      5,
      a + 0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawStations(now) {
  for (const st of game.stations) {
    if (st.id === 'coffee') drawCoffee(st, now);
    else if (st.id === 'sink') drawSink(st, now);
    else if (st.id === 'stove') drawStove(st, now);
  }
}

function drawEventEffects(now) {
  for (const ev of game.events) {
    if (ev.type === 'spill' && (ev.state === 'active' || ev.pop > 0)) {
      const a = ev.state === 'active' ? 1 : clamp(ev.pop / 0.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(122, 190, 222, 0.68)';
      ctx.beginPath();
      ctx.ellipse(ev.x, ev.y + 24, 36, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(210, 242, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(ev.x - 10, ev.y + 20, 12, 3.4, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (ev.type === 'tantrum' && ev.kid && ev.state === 'active') {
      ctx.save();
      ctx.strokeStyle = 'rgba(231, 111, 81, 0.75)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i += 1) {
        const a = now * 5 + i * 2.1;
        const px = ev.kid.x + Math.cos(a) * 20;
        const py = ev.kid.y - 92 + Math.sin(a) * 9;
        ctx.beginPath();
        ctx.moveTo(px - 4, py);
        ctx.lineTo(px + 4, py);
        ctx.moveTo(px, py - 4);
        ctx.lineTo(px, py + 4);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function drawParticles(now) {
  for (const p of game.particles) {
    const a = clamp(p.life / p.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    if (p.type === 'steam') {
      ctx.fillStyle = alpha(p.color === '#fff8ee' ? '#ffffff' : p.color, 0.28 * a);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'bubble') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'heart') {
      ctx.fillStyle = p.color;
      heartPath(p.x, p.y, p.size);
      ctx.fill();
    } else if (p.type === 'sparkle') {
      ctx.fillStyle = p.color;
      sparklePath(p.x, p.y, p.size);
      ctx.fill();
    } else if (p.type === 'confetti') {
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
    }
    ctx.restore();
  }
}

function drawFloats() {
  for (const f of game.floats) {
    const a = clamp(f.life / f.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `900 ${f.size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3.4;
    ctx.strokeStyle = 'rgba(255, 248, 238, 0.92)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

function drawRipples() {
  for (const r of game.ripples) {
    const a = clamp(r.life / r.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = a * 0.8;
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawLighting(now) {
  const t = game.day;
  if (t > 0.55) {
    const a = ((t - 0.55) / 0.45) * 0.16;
    ctx.fillStyle = `rgba(120, 64, 104, ${a})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (t > 0.78) {
    const a = ((t - 0.78) / 0.22) * 0.12;
    ctx.fillStyle = `rgba(48, 34, 82, ${a})`;
    ctx.fillRect(0, 0, W, H);
  }

  const topShade = ctx.createLinearGradient(0, 0, 0, 170);
  topShade.addColorStop(0, 'rgba(38, 70, 83, 0.16)');
  topShade.addColorStop(1, 'rgba(38, 70, 83, 0)');
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, W, 170);

  const bottomShade = ctx.createLinearGradient(0, H - 130, 0, H);
  bottomShade.addColorStop(0, 'rgba(38, 70, 83, 0)');
  bottomShade.addColorStop(1, 'rgba(38, 70, 83, 0.13)');
  ctx.fillStyle = bottomShade;
  ctx.fillRect(0, H - 130, W, 130);

  const vignette = ctx.createRadialGradient(W / 2, H * 0.52, Math.min(W, H) * 0.32, W / 2, H * 0.52, Math.max(W, H) * 0.72);
  vignette.addColorStop(0, 'rgba(38, 70, 83, 0)');
  vignette.addColorStop(1, 'rgba(38, 70, 83, 0.19)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function render(now) {
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const shake = game.shake;
  ctx.save();
  if (shake > 0.1) {
    ctx.translate((Math.random() * 2 - 1) * shake, (Math.random() * 2 - 1) * shake);
  }

  drawBackground(now);
  drawPlant(now);
  drawCounter(now);
  drawStations(now);
  drawCouch(game.stations.find((s) => s.id === 'couch'), now);
  drawToys(game.stations.find((s) => s.id === 'toys'), now);
  drawEventEffects(now);
  drawEntities(now);
  drawKidPrompts(now);
  drawEventBubbles(now);
  drawParticles(now);
  drawFloats();
  drawRipples();
  ctx.restore();

  drawLighting(now);
  if (game.flash > 0.01) {
    ctx.fillStyle = alpha(game.flashColor, game.flash * 0.32);
    ctx.fillRect(0, 0, W, H);
  }
}
