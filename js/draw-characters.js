'use strict';

function drawMom(now) {
  const mom = game.mom;
  const walking = mom.walkT > 0.08;
  const bob = walking ? Math.abs(Math.sin(mom.walkT)) * 3 : Math.sin(now * 2.1) * 1.4;
  const swing = walking ? Math.sin(mom.walkT) * 11 : 0;
  const lowCoffee = game.meters.coffee < 22;
  const lowSanity = game.meters.sanity < 30;
  const lowKids = game.meters.kids < 30;

  drawShadow(mom.x, mom.y + 1, 34, 9, 0.2);

  ctx.save();
  ctx.translate(mom.x, mom.y - bob);
  ctx.scale(mom.facing, 1);

  fillRR(-17 + swing * 0.34, -52, 13, 47, 6, '#264653');
  fillRR(3 - swing * 0.34, -52, 13, 47, 6, '#264653');
  ctx.fillStyle = '#e76f51';
  ctx.beginPath();
  ctx.ellipse(-10 + swing * 0.34, -4, 11, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(10 - swing * 0.34, -4, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const shirt = ctx.createLinearGradient(0, -116, 0, -44);
  shirt.addColorStop(0, '#35b3a3');
  shirt.addColorStop(1, '#23887c');
  fillRR(-31, -116, 62, 74, 24, shirt);
  fillRR(-33, -64, 66, 22, 10, '#1f7a70');

  fillRR(-22, -102, 44, 54, 14, '#fff4e6');
  fillRR(-11, -78, 22, 16, 5, '#e9c46a');
  ctx.fillStyle = 'rgba(181, 101, 74, 0.28)';
  ctx.beginPath();
  ctx.arc(-4, -70, 2, 0, Math.PI * 2);
  ctx.arc(4, -70, 2, 0, Math.PI * 2);
  ctx.fill();

  const lift = mom.armT > 0 ? Math.sin((1 - clamp(mom.armT / 0.6, 0, 1)) * Math.PI) : 0;
  const leftHand = { x: -34 + swing * 0.12, y: -61 + (walking ? swing * 0.18 : 0) };
  const rightHand = lift > 0.04
    ? { x: 39, y: -116 - lift * 17 }
    : { x: 34 - swing * 0.12, y: -61 - (walking ? swing * 0.18 : 0) };

  ctx.strokeStyle = '#2a9d8f';
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-25, -103);
  ctx.lineTo(leftHand.x, leftHand.y);
  ctx.moveTo(25, -103);
  ctx.lineTo(rightHand.x, rightHand.y);
  ctx.stroke();

  ctx.fillStyle = '#ffd7b5';
  ctx.beginPath();
  ctx.arc(leftHand.x, leftHand.y, 6.2, 0, Math.PI * 2);
  ctx.arc(rightHand.x, rightHand.y, 6.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e76f51';
  fillRR(leftHand.x - 7, leftHand.y - 4, 14, 12, 4, '#e76f51');
  ctx.strokeStyle = '#e76f51';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(leftHand.x + 7, leftHand.y + 2, 5, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = '#fff8ee';
  ctx.beginPath();
  ctx.ellipse(leftHand.x - 1, leftHand.y - 2, 5, 1.7, 0, 0, Math.PI * 2);
  ctx.fill();

  const hair = ctx.createLinearGradient(0, -162, 0, -98);
  hair.addColorStop(0, '#704733');
  hair.addColorStop(1, '#4c2e20');
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, -131, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -162, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-27, -118, 10, 0, Math.PI * 2);
  ctx.arc(27, -118, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffd7b5';
  ctx.beginPath();
  ctx.arc(0, -126, 25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-25, -134);
  ctx.quadraticCurveTo(-18, -154, 0, -154);
  ctx.quadraticCurveTo(18, -154, 25, -134);
  ctx.quadraticCurveTo(14, -142, 0, -142);
  ctx.quadraticCurveTo(-14, -142, -25, -134);
  ctx.closePath();
  ctx.fill();

  const blink = mom.blink < 0.12;
  ctx.strokeStyle = '#264653';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(-8.5, -126, 7.6, 0, Math.PI * 2);
  ctx.arc(8.5, -126, 7.6, 0, Math.PI * 2);
  ctx.moveTo(-1, -126);
  ctx.lineTo(1, -126);
  ctx.stroke();

  ctx.fillStyle = '#264653';
  if (blink) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -126);
    ctx.lineTo(-5, -126);
    ctx.moveTo(5, -126);
    ctx.lineTo(12, -126);
    ctx.stroke();
  } else if (lowCoffee) {
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-12, -128);
    ctx.lineTo(-5, -128);
    ctx.moveTo(5, -128);
    ctx.lineTo(12, -128);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-8.5, -125, 1.8, 0, Math.PI * 2);
    ctx.arc(8.5, -125, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(-8.5, -126, 2.4, 0, Math.PI * 2);
    ctx.arc(8.5, -126, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#b5654a';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (lowSanity || lowKids) {
    ctx.arc(0, -109, 5, Math.PI * 1.15, Math.PI * 1.85);
  } else {
    ctx.arc(0, -114, 7, 0.18 * Math.PI, 0.82 * Math.PI);
  }
  ctx.stroke();

  ctx.fillStyle = 'rgba(244, 167, 185, 0.78)';
  ctx.beginPath();
  ctx.ellipse(-17, -116, 5, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(17, -116, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.arc(-26, -119, 3.4, 0, Math.PI * 2);
  ctx.arc(26, -119, 3.4, 0, Math.PI * 2);
  ctx.fill();

  if (lowSanity) {
    ctx.fillStyle = 'rgba(122, 190, 222, 0.9)';
    ctx.beginPath();
    ctx.moveTo(21, -148);
    ctx.quadraticCurveTo(27, -140, 21, -137);
    ctx.quadraticCurveTo(15, -140, 21, -148);
    ctx.fill();
  }

  if (lift > 0.2) {
    ctx.fillStyle = '#e9c46a';
    sparklePath(rightHand.x + 10, rightHand.y - 8, 4 + lift * 3);
    ctx.fill();
  }

  ctx.restore();
}

function drawKid(kid, now) {
  const walking = kid.walkT > 0.08;
  const bob = walking ? Math.abs(Math.sin(kid.walkT)) * 2 : Math.sin(now * 3 + kid.kind * 2.1) * 1;
  const swing = walking ? Math.sin(kid.walkT) * 7 : 0;
  const sad = game.meters.kids < 35;
  const tantrum = game.events.some(
    (e) => e.type === 'tantrum' && e.state === 'active' && e.kid === kid
  );
  const shirt = kid.kind === 0 ? '#e76f51' : '#4a9fd0';
  const hairColor = kid.kind === 0 ? '#5b3a29' : '#704733';

  drawShadow(kid.x, kid.y + 1, 22, 6, 0.18);

  ctx.save();
  ctx.translate(kid.x, kid.y - bob);
  ctx.scale(kid.facing, 1);

  fillRR(-11 + swing * 0.35, -37, 9, 34, 4, '#264653');
  fillRR(2 - swing * 0.35, -37, 9, 34, 4, '#264653');
  ctx.fillStyle = '#fff4e6';
  ctx.beginPath();
  ctx.ellipse(-7 + swing * 0.35, -3, 7, 3.4, 0, 0, Math.PI * 2);
  ctx.ellipse(7 - swing * 0.35, -3, 7, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();

  fillRR(-19, -56, 38, 40, 13, shirt);
  fillRR(-13, -46, 26, 18, 6, 'rgba(255, 248, 238, 0.28)');
  ctx.fillStyle = 'rgba(38, 70, 83, 0.18)';
  ctx.beginPath();
  ctx.arc(-4, -37, 1.6, 0, Math.PI * 2);
  ctx.arc(4, -37, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = shirt;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-16, -49);
  ctx.lineTo(-23 - swing * 0.25, -28);
  ctx.moveTo(16, -49);
  ctx.lineTo(23 + swing * 0.25, -28);
  ctx.stroke();
  ctx.fillStyle = '#ffd7b5';
  ctx.beginPath();
  ctx.arc(-23 - swing * 0.25, -28, 4, 0, Math.PI * 2);
  ctx.arc(23 + swing * 0.25, -28, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(0, -73, 18, 0, Math.PI * 2);
  ctx.fill();

  if (kid.kind === 0) {
    ctx.beginPath();
    ctx.arc(-19, -76, 7, 0, Math.PI * 2);
    ctx.arc(19, -76, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f4a7b9';
    ctx.beginPath();
    ctx.arc(-15, -80, 2.2, 0, Math.PI * 2);
    ctx.arc(15, -80, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#ffd7b5';
  ctx.beginPath();
  ctx.arc(0, -71, 15.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.moveTo(-16, -77);
  ctx.quadraticCurveTo(-11, -92, 0, -92);
  ctx.quadraticCurveTo(11, -92, 16, -77);
  ctx.quadraticCurveTo(8, -82, 0, -82);
  ctx.quadraticCurveTo(-8, -82, -16, -77);
  ctx.closePath();
  ctx.fill();

  if (kid.kind === 1) {
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath();
    ctx.arc(0, -86, 15, Math.PI, Math.PI * 2);
    ctx.fill();
    fillRR(-16, -87, 32, 5, 2.5, '#e9a23b');
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath();
    ctx.ellipse(17, -84, 9, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#264653';
  ctx.beginPath();
  ctx.arc(-5.5, -72, 1.9, 0, Math.PI * 2);
  ctx.arc(5.5, -72, 1.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#b5654a';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (tantrum) {
    ctx.moveTo(-10, -79);
    ctx.lineTo(-3, -76);
    ctx.moveTo(10, -79);
    ctx.lineTo(3, -76);
    ctx.stroke();
    ctx.fillStyle = '#b5654a';
    ctx.beginPath();
    ctx.ellipse(0, -62, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (sad) {
    ctx.arc(0, -62, 5, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
  } else {
    ctx.arc(0, -65, 6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(244, 167, 185, 0.65)';
  ctx.beginPath();
  ctx.ellipse(-10, -66, 3.6, 2.1, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -66, 3.6, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawKidPrompts(now) {
  if (game.meters.kids >= 65) return;
  for (const kid of game.kids) {
    if (kid.cd > 0.05) continue;
    const tantrum = game.events.some(
      (e) => e.type === 'tantrum' && e.state === 'active' && e.kid === kid
    );
    if (tantrum) continue;
    const y = kid.y - 112 + Math.sin(now * 3 + kid.kind * 2) * 2.5;
    drawShadow(kid.x, y + 15, 12, 3, 0.1);
    ctx.fillStyle = '#fff8ee';
    ctx.beginPath();
    ctx.arc(kid.x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f4a7b9';
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.fillStyle = '#e76f51';
    heartPath(kid.x, y + 1, 6.5);
    ctx.fill();
  }
}

function drawEntities(now) {
  const items = [];
  for (const kid of game.kids) items.push({ y: kid.y, type: 'kid', kid });
  items.push({ y: game.mom.y, type: 'mom' });
  items.sort((a, b) => a.y - b.y);
  for (const item of items) {
    if (item.type === 'kid') drawKid(item.kid, now);
    else drawMom(now);
  }
}

function drawEventBubbles(now) {
  for (const ev of game.events) {
    if (ev.state !== 'active' && ev.pop <= 0) continue;
    const dying = ev.state !== 'active';
    const a = dying ? clamp(ev.pop / 0.4, 0, 1) : 1;
    const scale = dying ? 1 + (1 - a) * 0.55 : 1 + Math.sin(now * 4 + ev.wobble) * 0.05;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(ev.x, ev.y);
    ctx.scale(scale, scale);

    drawShadow(0, 8, 24, 7, 0.16);
    ctx.fillStyle = '#fff8ee';
    ctx.beginPath();
    ctx.arc(0, 0, ev.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ev.color;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ev.r - 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = `24px ${EMOJI_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ev.icon, 0, 1);

    if (!dying) {
      const remaining = clamp(1 - ev.t / ev.duration, 0, 1);
      ctx.strokeStyle = remaining < 0.3 ? '#d64545' : ev.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, ev.r + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remaining);
      ctx.stroke();
    }

    ctx.font = `900 10px ${FONT}`;
    const label = ev.label;
    const tw = ctx.measureText(label).width + 18;
    fillRR(-tw / 2, 33, tw, 18, 9, ev.color);
    ctx.fillStyle = '#fff8ee';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 42.5);

    if (ev.type === 'phone' && !dying) {
      ctx.strokeStyle = 'rgba(233, 162, 59, 0.7)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = 0; i < 2; i += 1) {
        const off = 34 + i * 7 + Math.sin(now * 8 + i) * 2;
        ctx.beginPath();
        ctx.arc(0, 0, off, -0.45, 0.45);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, off, Math.PI - 0.45, Math.PI + 0.45);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
