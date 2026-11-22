// 10 sample shorts, 10 s each, one per style. Needs scene.js helpers.
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ez = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const pop = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
function reveal(pts, f) { const n = Math.max(2, Math.floor(pts.length * clamp(f))); return f <= 0 ? [] : pts.slice(0, n); }
function txt(ctx, s, x, y, font, col, align = 'center') { ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textBaseline = 'alphabetic'; }

// ============ 1. 8-BIT: first Easter egg ============
function v1(ctx, W, H, t) {
  const k = 8, w = W / k, h = H / k; const o = v1.o || (v1.o = new OffscreenCanvas(w, h)); const c = o.getContext('2d');
  const secret = t >= 5;
  const hue = (t * 120) % 360;
  c.fillStyle = secret ? `hsl(${hue},60%,12%)` : '#120b26'; c.fillRect(0, 0, w, h);
  const wall = secret ? `hsl(${(hue + 180) % 360},80%,60%)` : '#7b5cff';
  c.fillStyle = wall;
  if (!secret) {
    // maze
    [[0, 30, 135, 4], [0, 30, 4, 180], [131, 30, 4, 180], [0, 206, 135, 4], [30, 60, 75, 4], [30, 60, 4, 60], [70, 100, 65, 4], [30, 150, 70, 4], [96, 150, 4, 30], [0, 120, 50, 4]].forEach(r => c.fillRect(...r));
    // castle at top
    c.fillStyle = '#ffd23f'; c.fillRect(50, 16, 36, 14); for (let i = 0; i < 5; i++) c.fillRect(50 + i * 8, 13, 4, 3); c.fillStyle = '#120b26'; c.fillRect(64, 22, 8, 8);
    // grey dot (the secret) blinks
    if ((t * 3) % 1 < 0.6) { c.fillStyle = '#9a9a9a'; c.fillRect(112, 186, 2, 2); }
    // dragon-ish enemy pacing
    const ex = 45 + Math.sin(t * 2) * 20; c.fillStyle = '#3ddc97'; c.fillRect(ex, 80, 6, 10); c.fillRect(ex + 6, 78, 4, 4); c.fillRect(ex - 3, 88, 3, 2);
    // hero path
    const path = [[12, 196], [12, 136], [60, 136], [60, 176], [112, 176], [112, 186]]; const f = clamp(t / 4.6) * (path.length - 1); const i = Math.min(path.length - 2, Math.floor(f)), r = f - i;
    const hx = path[i][0] + (path[i + 1][0] - path[i][0]) * r, hy = path[i][1] + (path[i + 1][1] - path[i][1]) * r;
    c.fillStyle = '#ffd23f'; c.fillRect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
    c.fillStyle = '#ffffff'; c.font = 'bold 9px "DejaVu Sans Mono"'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('1979', 4, 216); c.fillText('LIVES 3', 84, 216);
  } else {
    // secret room
    c.fillRect(0, 30, 135, 4); c.fillRect(0, 206, 135, 4); c.fillRect(0, 30, 4, 180); c.fillRect(131, 30, 4, 180);
    const lines = ['CREATED', 'BY', 'WARREN', 'ROBINETT']; c.textAlign = 'center'; c.textBaseline = 'top'; c.font = 'bold 12px "DejaVu Sans Mono"';
    lines.forEach((s, i) => { const ap = clamp((t - 5.3 - i * 0.35) / 0.2); if (ap <= 0) return; c.fillStyle = `hsl(${(hue + i * 60) % 360},100%,65%)`; c.fillText(s, 67, 70 + i * 22); });
    c.fillStyle = '#ffd23f'; c.fillRect(64, 180, 4, 4);
    // sparkles
    const R = rng(Math.floor(t * 6)); c.fillStyle = '#fff'; for (let i = 0; i < 12; i++) c.fillRect(Math.floor(8 + R() * 119), Math.floor(38 + R() * 160), 1, 1);
    c.fillStyle = '#fff'; c.font = 'bold 9px "DejaVu Sans Mono"'; c.fillText('SECRET ROOM!', 67, 17);
  }
  ctx.imageSmoothingEnabled = false; ctx.drawImage(o, 0, 0, W, H); ctx.imageSmoothingEnabled = true;
  if (t >= 5 && t < 5.25) { ctx.fillStyle = `rgba(255,255,255,${1 - (t - 5) / 0.25})`; ctx.fillRect(0, 0, W, H); }
  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);
}
v1.caps = [[0.3, 2.7, 'In 1979, Atari hid its *coders’ names'], [2.7, 5.0, 'So one coder *fought back'], [5.3, 7.6, 'He hid his name in a *secret room'], [7.6, 9.8, 'Gaming’s first *Easter egg']];

// ============ 2. CHALK: 60 minutes ============
function v2(ctx, W, H, t) {
  ctx.fillStyle = '#1B4D3E'; ctx.fillRect(0, 0, W, H);
  const R = rng(5); for (let i = 0; i < 60; i++) { ctx.fillStyle = `rgba(255,255,255,${0.015 + R() * 0.03})`; ctx.beginPath(); ctx.ellipse(R() * W, R() * H, 60 + R() * 160, 20 + R() * 60, R() * 3, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#5a3b22'; ctx.fillRect(0, H - 40, W, 40); ctx.fillStyle = '#eee'; ctx.fillRect(W * 0.7, H - 52, 70, 14);
  const hand = (s, x, y, size, col, f, align = 'center') => { const n = Math.floor(s.length * clamp(f)); ctx.save(); ctx.globalAlpha = 0.9; txt(ctx, s.slice(0, n), x, y, `700 ${size}px "Comic Relief"`, col, align); ctx.restore(); };
  if (t < 4.6) {
    const cx = W / 2, cy = H * 0.33, r = W * 0.25;
    chalkLine(ctx, reveal(ellipsePts(cx, cy, r, r, 60, -Math.PI / 2, Math.PI * 1.5), (t - 0.2) / 0.9), { seed: 1, w: 6 });
    for (let i = 0; i < 12; i++) { if (t < 0.9 + i * 0.05) continue; const a = i / 12 * Math.PI * 2; chalkLine(ctx, [[cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * 0.85], [cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95]], { seed: 10 + i, w: 5 }); }
    const ma = -Math.PI / 2 + t * 1.6; if (t > 1.4) { chalkLine(ctx, [[cx, cy], [cx + Math.cos(ma) * r * 0.75, cy + Math.sin(ma) * r * 0.75]], { seed: 30, w: 6 }); chalkLine(ctx, [[cx, cy], [cx + r * 0.45, cy - r * 0.2]], { seed: 31, w: 8 }); }
    hand('60', W * 0.36, H * 0.565, 190, '#ffe08a', (t - 1.2) / 0.4); hand('minutes', W * 0.62, H * 0.585, 70, '#f5f5f0', (t - 1.6) / 0.6, 'left');
    // ziggurat
    if (t > 2.6) { const f = (t - 2.6) / 1.2, bx = W * 0.27, by = H * 0.735; const zs = 0.55; const z0 = [[bx - 260, by], [bx - 260, by - 50], [bx - 180, by - 50], [bx - 180, by - 100], [bx - 100, by - 100], [bx - 100, by - 150], [bx + 100, by - 150], [bx + 100, by - 100], [bx + 180, by - 100], [bx + 180, by - 50], [bx + 260, by - 50], [bx + 260, by]]; const z = z0.map(([x, y]) => [bx + (x - bx) * zs, by + (y - by) * zs]); chalkLine(ctx, reveal(z, f), { seed: 40, w: 5, color: 'rgba(255,200,150,0.9)' }); hand('Ancient Babylon', W * 0.46, by - 40, 50, '#ffc896', (t - 3.3) / 0.8, 'left'); }
  } else {
    // eraser smear transition
    if (t < 4.9) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, 0, W * (t - 4.6) / 0.3, H); }
    hand('Base 60', W / 2, H * 0.12, 110, '#ffe08a', (t - 4.7) / 0.5);
    chalkLine(ctx, reveal([[W * 0.2, H * 0.17], [W * 0.8, H * 0.172]], (t - 5.0) / 0.4), { seed: 50, w: 5 });
    const rows = [['60 ÷ 2', '30'], ['60 ÷ 3', '20'], ['60 ÷ 4', '15'], ['60 ÷ 5', '12'], ['60 ÷ 6', '10'], ['60 ÷ 10', '6'], ['60 ÷ 12', '5']];
    rows.forEach(([a, b], i) => { const st = 6.4 + i * 0.42; if (t < st) return; const y = H * (0.29 + i * 0.062); hand(a, W * 0.30, y, 64, '#f5f5f0', (t - st) / 0.25); hand('= ' + b, W * 0.56, y, 64, '#ffe08a', (t - st - 0.15) / 0.2, 'left'); if (t > st + 0.3) chalkLine(ctx, [[W * 0.80, y], [W * 0.82, y + 14], [W * 0.86, y - 18]], { seed: 60 + i, w: 5, color: 'rgba(140,255,160,0.95)' }); });
    hand('“They counted in sixties”', W / 2, H * 0.22, 46, '#cfe', (t - 5.2) / 0.8);
  }
}
v2.caps = [[0.3, 2.5, 'Why are there *60 minutes in an hour?'], [2.5, 4.6, 'Blame ancient *Babylon'], [4.8, 6.6, 'They counted in *sixties'], [6.6, 9.8, 'Because 60 splits *evenly so many ways']];

// ============ 3. GOLDEN NEON: brain energy ============
function v3(ctx, W, H, t) {
  ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.35, 20, W / 2, H * 0.35, H * 0.55); g.addColorStop(0, 'rgba(255,170,60,0.10)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const pulse = 0.75 + 0.25 * Math.sin(t * 5);
  const brain = (cx, cy, s, a) => glow(ctx, '#ffb347', 40 * a, () => { ctx.strokeStyle = `rgba(255,200,97,${a})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(cx, cy, 120 * s, 85 * s, 0, 0, 7); ctx.moveTo(cx, cy - 85 * s); ctx.bezierCurveTo(cx - 20 * s, cy - 30 * s, cx + 20 * s, cy + 20 * s, cx, cy + 85 * s); for (let i = -1; i <= 1; i += 2) { ctx.moveTo(cx + i * 30 * s, cy - 60 * s); ctx.quadraticCurveTo(cx + i * 90 * s, cy - 40 * s, cx + i * 60 * s, cy); ctx.moveTo(cx + i * 40 * s, cy + 15 * s); ctx.quadraticCurveTo(cx + i * 100 * s, cy + 30 * s, cx + i * 70 * s, cy + 60 * s); } ctx.stroke(); });
  if (t < 5) {
    const f = ez(t / 0.9); const cx = W / 2, hy = H * 0.30, hr = 190;
    glow(ctx, '#ffffff', 18, () => { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, hy, hr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.stroke(); if (f > 0.5) { ctx.beginPath(); ctx.moveTo(cx, hy + hr); ctx.lineTo(cx, hy + hr + (H * 0.62 - hy - hr) * ez((t - 0.4) / 0.6)); ctx.moveTo(cx - 200, H * 0.53); ctx.lineTo(cx + 200, H * 0.53); ctx.stroke(); } });
    brain(cx, hy, 1.15, clamp((t - 0.6) / 0.4) * pulse);
    if (t > 0.6) { // sparks
      const R = rng(Math.floor(t * 8)); ctx.fillStyle = '#ffd27a'; for (let i = 0; i < 8; i++) { const a = R() * 7, d = 210 + R() * 60; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, hy + Math.sin(a) * d, 2.5, 0, 7); ctx.fill(); } }
    const lab = (s, x, y, col, st) => { const a = ez((t - st) / 0.4); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; glow(ctx, col, 20, () => txt(ctx, s, x, y, '300 64px Inter', col)); ctx.restore(); };
    lab('2% of your weight', W / 2, H * 0.67, '#ffffff', 0.6); lab('20% of your energy', W / 2, H * 0.72, '#ffc861', 2.8);
  } else {
    const cx = W / 2, by = H * 0.24, bw = 320, bh = 640, fill = ez((t - 5.3) / 0.8);
    glow(ctx, '#ffffff', 16, () => { ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(cx - bw / 2, by, bw, bh, 28); ctx.stroke(); ctx.beginPath(); ctx.roundRect(cx - 50, by - 34, 100, 34, 8); ctx.stroke(); });
    for (let i = 0; i < 5; i++) { const y = by + bh - (i + 1) * (bh / 5) + 14; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3; ctx.strokeRect(cx - bw / 2 + 22, y, bw - 44, bh / 5 - 28); }
    if (fill > 0) glow(ctx, '#ff9a2a', 50 * pulse, () => { ctx.fillStyle = `rgba(255,170,60,${0.85 * fill})`; ctx.fillRect(cx - bw / 2 + 22, by + bh - bh / 5 + 14, (bw - 44), (bh / 5 - 28)); });
    glow(ctx, '#ffb347', 30, () => txt(ctx, Math.round(20 * fill) + '%', cx, by + bh * 0.45, '200 150px Inter', '#ffc861'));
    if (t > 7.3) { const a = ez((t - 7.3) / 0.5); ctx.save(); ctx.globalAlpha = a; brain(cx + 270, H * 0.12, 0.45, pulse); glow(ctx, '#cfe0ff', 20, () => { ctx.strokeStyle = '#dbe7ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx - 300, H * 0.12, 55, Math.PI * 0.35, Math.PI * 1.65); ctx.arc(cx - 275, H * 0.115, 45, Math.PI * 1.55, Math.PI * 0.45, true); ctx.stroke(); txt(ctx, 'z', cx - 220, H * 0.08 - ((t * 30) % 30), '300 50px Inter', '#dbe7ff'); }); ctx.restore(); }
  }
}
v3.caps = [[0.3, 2.7, 'Your brain is only *2% of your weight'], [2.7, 5.0, 'But burns about *20% of your energy'], [5.2, 7.3, 'Thinking is *expensive'], [7.3, 9.8, 'And it never fully *switches off']];

// ============ 4. RETRO CONSOLE (low-poly): blowing cartridges ============
function lpBg(ctx, W, H, base, seed) { const R = rng(seed), cols = 6, rows = 10, pts = []; for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) pts.push([W * i / cols + (i && i < cols ? (R() - 0.5) * 100 : 0), H * j / rows + (j && j < rows ? (R() - 0.5) * 80 : 0)]); for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a = pts[j * (cols + 1) + i], b = pts[j * (cols + 1) + i + 1], c = pts[(j + 1) * (cols + 1) + i], d = pts[(j + 1) * (cols + 1) + i + 1]; tri(ctx, a, b, c, shade(base, 0.8 + R() * 0.4)); tri(ctx, b, d, c, shade(base, 0.8 + R() * 0.4)); } }
function box3(ctx, x, y, w, h, d, col) { // front + top + side, flat-shaded
  ctx.fillStyle = shade(col, 1.0); ctx.fillRect(x, y, w, h);
  ctx.fillStyle = shade(col, 1.25); poly(ctx, [[x, y], [x + d, y - d * 0.6], [x + w + d, y - d * 0.6], [x + w, y]]); ctx.fill();
  ctx.fillStyle = shade(col, 0.7); poly(ctx, [[x + w, y], [x + w + d, y - d * 0.6], [x + w + d, y + h - d * 0.6], [x + w, y + h]]); ctx.fill();
}
function v4(ctx, W, H, t) {
  lpBg(ctx, W, H, '#232a4a', 4);
  if (t < 5) {
    // floor
    tri(ctx, [0, H * 0.70], [W, H * 0.66], [W, H], '#3b2f2a'); tri(ctx, [0, H * 0.70], [W, H], [0, H], '#33281f');
    box3(ctx, W * 0.30, H * 0.52, W * 0.50, H * 0.15, 60, '#9a9fa8');
    ctx.fillStyle = '#4a4e56'; ctx.fillRect(W * 0.33, H * 0.57, W * 0.44, H * 0.025); ctx.fillStyle = '#1b1b1b'; ctx.fillRect(W * 0.40, H * 0.515, W * 0.30, 14);
    ctx.fillStyle = '#e0283c'; ctx.fillRect(W * 0.34, H * 0.625, 46, 22);
    // cartridge hovering & bobbing
    const cy = H * 0.30 + Math.sin(t * 2) * 10; box3(ctx, W * 0.42, cy, W * 0.26, H * 0.17, 30, '#7d828c');
    ctx.fillStyle = '#ff9a2a'; ctx.fillRect(W * 0.445, cy + 30, W * 0.21, H * 0.09); ctx.fillStyle = '#2a4bb5'; ctx.fillRect(W * 0.445, cy + 30, W * 0.21, H * 0.025);
    txt(ctx, 'GAME', W * 0.55, cy + 30 + H * 0.06, '900 46px "Archivo Black"', '#1b1b1b');
    // face blowing (left)
    const fx = W * 0.20, fy = H * 0.36; const R = 110; const hp = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; hp.push([fx + Math.cos(a) * R, fy + Math.sin(a) * R * 1.15]); }
    for (let i = 0; i < 8; i++) tri(ctx, hp[i], hp[(i + 1) % 8], [fx, fy], shade('#e9b48a', 0.75 + ((i + 6) % 8) * 0.06));
    tri(ctx, [fx - R, fy - 30], [fx + R * 0.2, fy - R * 1.25], [fx + R, fy - 40], '#3a241b'); tri(ctx, [fx - R, fy - 30], [fx - R * 0.5, fy - R * 1.05], [fx + R * 0.2, fy - R * 1.25], '#2b1a14');
    ctx.fillStyle = '#1b1b1b'; ctx.fillRect(fx + 30, fy - 20, 16, 16);
    const puff = 1 + 0.25 * Math.sin(t * 9); ctx.fillStyle = '#c47a5a'; ctx.beginPath(); ctx.ellipse(fx + R * 0.95, fy + 40, 16 * puff, 12, 0, 0, 7); ctx.fill();
    // air puffs
    for (let i = 0; i < 6; i++) { const ph = (t * 1.2 + i / 6) % 1; const x = fx + R + ph * (W * 0.42 - fx - R + 30), y = fy + 40 + (cy + H * 0.17 - fy - 40) * ph; ctx.save(); ctx.globalAlpha = 0.6 * (1 - ph); tri(ctx, [x, y - 14], [x + 26, y], [x, y + 14], '#e8f1ff'); ctx.restore(); }
    if (t > 2.8) { const a = pop((t - 2.8) / 0.4); ctx.save(); ctx.translate(W * 0.78, H * 0.22); ctx.scale(a, a); tri(ctx, [-70, -40], [70, -40], [0, 80], '#e0283c'); txt(ctx, '✗', 0, -5, '900 70px Inter', '#fff'); ctx.restore(); }
  } else {
    // close-up connector
    const px = W * 0.12, py = H * 0.36, pw = W * 0.76, ph = H * 0.26;
    box3(ctx, px, py - 140, pw, 140, 40, '#7d828c');
    ctx.fillStyle = '#1f6b3a'; ctx.fillRect(px, py, pw, ph); for (let i = 0; i < 10; i++) tri(ctx, [px + pw * i / 10, py], [px + pw * (i + 1) / 10, py], [px + pw * (i + 0.5) / 10, py + ph], shade('#1f6b3a', 0.85 + (i % 3) * 0.1));
    const n = 12; for (let i = 0; i < n; i++) { const x = px + 30 + i * (pw - 60) / n; const cor = clamp((t - 7.6 - (i % 5) * 0.25) / 0.8) * (i % 3 === 1 ? 1 : 0.6); ctx.fillStyle = cor > 0.5 ? shade('#c9a227', 0.75) : '#e8c547'; ctx.fillRect(x, py + ph * 0.35, (pw - 60) / n * 0.6, ph * 0.6); if (cor > 0) { ctx.fillStyle = `rgba(60,160,110,${cor})`; ctx.beginPath(); ctx.arc(x + 14, py + ph * 0.6 + (i % 2) * 40, 16 * cor, 0, 7); ctx.fill(); } }
    // droplets
    for (let i = 0; i < 9; i++) { const st = 5.3 + i * 0.18; if (t < st) continue; const x = px + 60 + i * pw / 9.5, y = py + ph * (0.45 + (i % 3) * 0.12) + Math.min(30, (t - st) * 15); const s = 18 + (i % 2) * 6; tri(ctx, [x, y - s * 1.4], [x - s, y + s * 0.3], [x + s, y + s * 0.3], '#79b8ff'); tri(ctx, [x - s, y + s * 0.3], [x + s, y + s * 0.3], [x, y + s], '#4a8be0'); }
    txt(ctx, 'MOISTURE', W * 0.5, H * 0.665, '900 60px "Archivo Black"', '#79b8ff');
    if (t > 7.4) txt(ctx, '→ CORROSION', W * 0.5, H * 0.71, '900 60px "Archivo Black"', '#4fd18b');
  }
}
v4.caps = [[0.3, 2.8, 'Did blowing on cartridges *work?'], [2.8, 5.0, 'Not *really'], [5.2, 7.4, 'Your breath added *moisture'], [7.4, 9.8, 'Which could *corrode the pins']];

// ============ 5. POP COMIC: octopus hearts ============
function heart(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * 0.35); ctx.bezierCurveTo(x - s * 1.1, y - s * 0.4, x - s * 0.45, y - s * 1.05, x, y - s * 0.45); ctx.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.4, x, y + s * 0.35); ctx.closePath(); }
function v5(ctx, W, H, t) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  const pad = 28, h1 = H * 0.50; const ink = (lw = 7) => { ctx.lineWidth = lw; ctx.strokeStyle = '#000'; ctx.lineJoin = 'round'; ctx.stroke(); };
  ctx.save(); rr(ctx, pad, pad, W - pad * 2, h1 - pad, 8); ctx.clip();
  ctx.fillStyle = '#22b8cf'; ctx.fillRect(0, 0, W, h1); halftone(ctx, 0, 0, W, h1, '#7ee3f2', 26, 8, 1);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * 7; ctx.moveTo(W / 2 + Math.cos(a) * 260, h1 * 0.55 + Math.sin(a) * 260); ctx.lineTo(W / 2 + Math.cos(a) * 900, h1 * 0.55 + Math.sin(a) * 900); } ctx.stroke();
  // octopus
  const ox = W * 0.5, oy = h1 * 0.42 + Math.sin(t * 2) * 8;
  for (let i = 0; i < 8; i++) { const bx = ox - 170 + i * 48; ctx.beginPath(); ctx.moveTo(bx, oy + 90); for (let s = 1; s <= 12; s++) { const yy = oy + 90 + s * 26, xx = bx + Math.sin(t * 3 + i + s * 0.5) * 18 + (i - 3.5) * s * 4; ctx.lineTo(xx, yy); } ctx.lineWidth = 34 - 0; ctx.strokeStyle = '#000'; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 24; ctx.strokeStyle = '#e8456b'; ctx.stroke(); }
  ctx.fillStyle = '#e8456b'; ctx.beginPath(); ctx.ellipse(ox, oy, 200, 170, 0, 0, 7); ctx.fill(); ink(9);
  halftone(ctx, ox + 40, oy - 160, 160, 300, 'rgba(160,20,60,0.35)', 18, 5, 1);
  ctx.fillStyle = '#fff'; [[-70, 20], [70, 20]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.ellipse(ox + dx, oy + dy, 42, 52, 0, 0, 7); ctx.fill(); ink(6); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(ox + dx + 8, oy + dy + 10, 18, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; });
  ctx.beginPath(); ctx.arc(ox, oy + 85, 26, 0.2, Math.PI - 0.2); ink(6);
  // SFX
  const beat = Math.floor(t * 2.4) % 3; ['BA-DUM!', 'BA-DUM!', 'BA-DUM!'].forEach((s, i) => { if (t < 0.4 + i * 0.4) return; ctx.save(); ctx.translate(W * (0.2 + i * 0.3), h1 * (0.12 + (i % 2) * 0.06)); ctx.rotate(-0.15 + i * 0.12); const sc = i === beat ? 1.12 : 1; ctx.scale(sc, sc); ctx.font = '900 54px "Archivo Black"'; ctx.textAlign = 'center'; ctx.lineWidth = 12; ctx.strokeStyle = '#000'; ctx.strokeText(s, 0, 0); ctx.fillStyle = '#ffe14d'; ctx.fillText(s, 0, 0); ctx.restore(); });
  ctx.restore(); rr(ctx, pad, pad, W - pad * 2, h1 - pad, 8); ink(9);
  // bubble
  if (t > 1.6) { const a = pop((t - 1.6) / 0.35); ctx.save(); ctx.translate(W * 0.73, h1 * 0.80); ctx.scale(a, a); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 230, 95, 0, 0, 7); ctx.fill(); ink(6); ctx.beginPath(); ctx.moveTo(-150, -50); ctx.lineTo(-230, -130); ctx.lineTo(-90, -75); ctx.fill(); ink(6); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 226, 91, 0, 0, 7); ctx.fill(); txt(ctx, 'Three hearts.', 0, -24, 'italic 900 44px "Archivo Black"', '#000'); txt(ctx, 'Still single.', 0, 30, 'italic 900 44px "Archivo Black"', '#e8132b'); ctx.restore(); }
  // panel 2
  if (t > 3.3) {
    const y2 = h1 + 20, h2 = H - y2 - pad, sl = ez((t - 3.3) / 0.35); ctx.save(); ctx.translate(0, (1 - sl) * 300); ctx.globalAlpha = sl;
    ctx.save(); rr(ctx, pad, y2, W - pad * 2, h2, 8); ctx.clip(); ctx.fillStyle = '#ffd21f'; ctx.fillRect(0, y2, W, h2); halftone(ctx, 0, y2, W, h2, '#ff9f1c', 22, 7, 1); ctx.restore(); rr(ctx, pad, y2, W - pad * 2, h2, 8); ink(9);
    const hb = (x, y, s, lbl, on, ph) => { const b = 1 + 0.08 * Math.max(0, Math.sin(t * 7 + ph)); ctx.save(); ctx.translate(x, y); ctx.scale(b, b); ctx.fillStyle = on ? '#e8132b' : '#ff6b81'; heart(ctx, 0, 0, s); ctx.fill(); ink(7); ctx.restore(); ctx.font = '900 46px "Archivo Black"'; ctx.textAlign = 'center'; ctx.lineWidth = 10; ctx.strokeStyle = '#000'; ctx.strokeText(lbl, x, y + s * 0.95); ctx.fillStyle = '#fff'; ctx.fillText(lbl, x, y + s * 0.95); };
    const g = t > 3.4 && t < 6.6, b = t >= 6.6;
    hb(W * 0.22, y2 + 150, 90, 'GILLS', g, 0); hb(W * 0.78, y2 + 150, 90, 'GILLS', g, 1); hb(W * 0.5, y2 + 270, 120, 'BODY', b, 2);
    ctx.restore();
  }
}
v5.caps = [[0.3, 3.2, 'An octopus has *three hearts'], [3.4, 6.4, 'Two pump blood to the *gills'], [6.6, 9.8, 'One pumps it to the *body']];

// ============ 6. FLAT POSTER: honey ============
function v6(ctx, W, H, t) {
  if (t < 5) {
    ctx.fillStyle = '#1f2f6e'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2b3f8c'; ctx.beginPath(); ctx.arc(W / 2, H * 0.44, W * 0.42, 0, 7); ctx.fill();
    // hexes
    for (let i = 0; i < 7; i++) { const a = i / 7 * 7 + 0.4, x = W / 2 + Math.cos(a) * W * 0.40, y = H * 0.44 + Math.sin(a) * W * 0.40; ctx.fillStyle = '#ffc23d'; ctx.beginPath(); for (let k = 0; k < 6; k++) { const b = k / 6 * Math.PI * 2; ctx.lineTo(x + Math.cos(b) * 34, y + Math.sin(b) * 34); } ctx.fill(); }
    const jx = W / 2, jy = H * 0.47, jw = 380, jh = 440;
    ctx.fillStyle = '#ffe6a6'; rr(ctx, jx - jw / 2, jy - jh / 2, jw, jh, 60); ctx.fill();
    ctx.fillStyle = '#f5a623'; rr(ctx, jx - jw / 2 + 24, jy - jh / 2 + 90, jw - 48, jh - 114, 40); ctx.fill();
    ctx.fillStyle = '#ffc23d'; rr(ctx, jx - jw / 2 + 50, jy - jh / 2 + 110, 40, jh - 180, 20); ctx.fill();
    ctx.fillStyle = '#d8402f'; rr(ctx, jx - jw / 2 - 20, jy - jh / 2 - 60, jw + 40, 80, 18); ctx.fill(); ctx.fillStyle = '#b8331f'; ctx.fillRect(jx - jw / 2 - 20, jy - jh / 2 - 6, jw + 40, 26);
    ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.arc(jx, jy + 40, 110, 0, 7); ctx.fill(); txt(ctx, 'HONEY', jx, jy + 40, '900 56px "Archivo Black"', '#d8402f');
    // drip
    const d = (t * 0.6) % 1; ctx.fillStyle = '#f5a623'; ctx.beginPath(); ctx.moveTo(jx + 120, jy - jh / 2 + 20); ctx.lineTo(jx + 150, jy - jh / 2 + 20); ctx.lineTo(jx + 135, jy - jh / 2 + 20 + 160 * d); ctx.fill(); ctx.beginPath(); ctx.arc(jx + 135, jy - jh / 2 + 20 + 160 * d, 16, 0, 7); ctx.fill();
    // bee figure-8
    const bx = W / 2 + Math.sin(t * 1.6) * W * 0.34, by = H * 0.20 + Math.sin(t * 3.2) * 60, dir = Math.cos(t * 1.6) > 0 ? 1 : -1;
    ctx.save(); ctx.translate(bx, by); ctx.scale(dir, 1); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.ellipse(-10, -40, 26, 40, -0.4 + Math.sin(t * 40) * 0.2, 0, 7); ctx.fill(); ctx.fillStyle = '#ffc23d'; ctx.beginPath(); ctx.ellipse(0, 0, 56, 38, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(-20, -38, 16, 76); ctx.fillRect(12, -36, 14, 72); ctx.beginPath(); ctx.arc(52, -6, 8, 0, 7); ctx.fill(); ctx.restore();
    // germ with X
    if (t > 2.8) { const a = pop((t - 2.8) / 0.4); ctx.save(); ctx.translate(W * 0.18, H * 0.66); ctx.scale(a, a); ctx.fillStyle = '#3ddc97'; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 7); ctx.fill(); for (let i = 0; i < 8; i++) { const b = i / 8 * 7; ctx.beginPath(); ctx.arc(Math.cos(b) * 70, Math.sin(b) * 70, 14, 0, 7); ctx.fill(); } ctx.strokeStyle = '#ff4f4f'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, -70); ctx.lineTo(70, 70); ctx.moveTo(70, -70); ctx.lineTo(-70, 70); ctx.stroke(); ctx.restore(); }
  } else {
    ctx.fillStyle = '#ffcf8b'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffb35c'; ctx.fillRect(0, H * 0.35, W, H * 0.2);
    ctx.fillStyle = '#fff1c9'; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.16, 90, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8944a'; ctx.beginPath(); ctx.moveTo(-50, H * 0.62); ctx.lineTo(W * 0.15, H * 0.42); ctx.lineTo(W * 0.38, H * 0.62); ctx.fill();
    const px = W * 0.56, pb = H * 0.66, ph = H * 0.42; ctx.fillStyle = '#f0a85a'; ctx.beginPath(); ctx.moveTo(px - 460, pb); ctx.lineTo(px, pb - ph); ctx.lineTo(px + 460, pb); ctx.fill(); ctx.fillStyle = '#d98a3c'; ctx.beginPath(); ctx.moveTo(px, pb - ph); ctx.lineTo(px + 460, pb); ctx.lineTo(px + 60, pb); ctx.fill();
    // chamber cutaway
    const op = ez((t - 5.2) / 0.6); ctx.fillStyle = '#3a2416'; rr(ctx, px - 150, pb - 260, 300 * op, 190, 14); ctx.fill();
    if (op > 0.9) { const gl = 0.6 + 0.4 * Math.sin(t * 5); ctx.fillStyle = `rgba(255,200,80,${0.35 * gl})`; ctx.beginPath(); ctx.arc(px, pb - 170, 120, 0, 7); ctx.fill(); ctx.fillStyle = '#ffe6a6'; rr(ctx, px - 45, pb - 220, 90, 110, 20); ctx.fill(); ctx.fillStyle = '#f5a623'; rr(ctx, px - 36, pb - 190, 72, 72, 14); ctx.fill(); ctx.fillStyle = '#d8402f'; rr(ctx, px - 52, pb - 236, 104, 26, 8); ctx.fill(); }
    ctx.fillStyle = '#f2b765'; ctx.fillRect(0, pb, W, H); ctx.fillStyle = '#e9a24f'; ctx.beginPath(); ctx.ellipse(W * 0.25, pb + 120, 400, 60, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(W * 0.85, pb + 240, 360, 50, 0, 0, 7); ctx.fill();
    if (t > 7.6) { const a = pop((t - 7.6) / 0.4); ctx.save(); ctx.translate(W / 2, H * 0.30); ctx.scale(a, a); ctx.fillStyle = '#1f2f6e'; rr(ctx, -260, -60, 520, 120, 60); ctx.fill(); txt(ctx, '~3,000 YEARS', 0, 2, '900 58px "Archivo Black"', '#ffc23d'); ctx.restore(); }
  }
}
v6.caps = [[0.3, 2.8, 'Honey basically *never spoils'], [2.8, 5.0, 'It’s too sugary for *germs'], [5.2, 7.6, 'Archaeologists found *edible honey'], [7.6, 9.8, 'In ancient *Egyptian tombs']];

// ============ 7. LINE DIAGRAM: paper plane ============
function arrow(ctx, x1, y1, x2, y2, col, lw = 4) { ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - Math.cos(a - 0.4) * 30, y2 - Math.sin(a - 0.4) * 30); ctx.lineTo(x2 - Math.cos(a + 0.4) * 30, y2 - Math.sin(a + 0.4) * 30); ctx.closePath(); ctx.fill(); }
function v7(ctx, W, H, t) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(80,120,200,0.14)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x < W; x += 54) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y < H; y += 54) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
  txt(ctx, 'FIG. 07 — PAPER AIRCRAFT / SIDE VIEW', 60, 190, '500 26px "DejaVu Sans Mono"', '#8fa3c0', 'left');
  const drift = t > 4.6 ? (t - 4.6) : 0; const cx = W * 0.42 + drift * 18, cy = H * 0.42 + drift * 10;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.04);
  const P1 = [[-330, -10], [330, 0], [-280, 70], [-330, -10]], P2 = [[-330, -10], [330, 0], [-250, -110], [-330, -10]], P3 = [[-280, 70], [-230, 26], [330, 0]];
  const L = (pts, f, col = '#fff', lw = 3) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.beginPath(); reveal(pts.flatMap((p, i) => i ? Array.from({ length: 20 }, (_, k) => [pts[i - 1][0] + (p[0] - pts[i - 1][0]) * (k + 1) / 20, pts[i - 1][1] + (p[1] - pts[i - 1][1]) * (k + 1) / 20]) : [p]), f).forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); };
  ctx.fillStyle = 'rgba(245,166,35,0.9)'; if (t > 1.6) { ctx.globalAlpha = ez((t - 1.6) / 0.5); poly(ctx, P2.slice(0, 3)); ctx.fill(); ctx.globalAlpha = 1; }
  L(P1, t / 0.9); L(P2, (t - 0.5) / 0.9); L(P3, (t - 1.0) / 0.6, '#9ab', 2);
  ctx.restore();
  // dimension
  if (t > 1.2 && t < 4.6) { ctx.strokeStyle = '#8fa3c0'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(cx - 330, cy + 180); ctx.lineTo(cx + 330, cy + 180); ctx.stroke(); ctx.setLineDash([]); txt(ctx, 'L = 297 mm (A4)', cx, cy + 215, '500 28px "DejaVu Sans Mono"', '#8fa3c0'); }
  if (t > 2.4 && t < 4.6) { const a = ez((t - 2.4) / 0.5); ctx.save(); ctx.globalAlpha = a; txt(ctx, '4 FORCES', W / 2, H * 0.66, '700 96px "DejaVu Sans Mono"', '#fff'); ctx.restore(); }
  if (t >= 4.6) {
    const show = (st) => ez((t - st) / 0.4);
    const lab = (s, x, y, col, a) => { ctx.save(); ctx.globalAlpha = a; txt(ctx, s, x, y, '700 34px "DejaVu Sans Mono"', col); ctx.restore(); };
    let a = show(4.7); if (a > 0) { ctx.save(); ctx.globalAlpha = a; arrow(ctx, cx + 340, cy, cx + 340 + 150 * a, cy, '#f5a623', 6); ctx.restore(); lab('THRUST', cx + 420, cy - 40, '#f5a623', a); }
    a = show(6.7); if (a > 0) { ctx.save(); ctx.globalAlpha = a; arrow(ctx, cx - 30, cy - 120, cx - 30, cy - 120 - 260 * a, '#3d8bff', 6); ctx.restore(); lab('LIFT', cx + 60, cy - 330, '#3d8bff', a); }
    a = show(7.1); if (a > 0) { ctx.save(); ctx.globalAlpha = a; arrow(ctx, cx - 30, cy + 90, cx - 30, cy + 90 + 240 * a, '#ffffff', 5); ctx.restore(); lab('WEIGHT', cx + 90, cy + 300, '#fff', a); }
    a = show(8.4); if (a > 0) { ctx.save(); ctx.globalAlpha = a; arrow(ctx, cx - 350, cy - 5, cx - 350 - 130 * a, cy - 5, '#ff5a4a', 6); ctx.restore(); lab('DRAG', cx - 420, cy - 50, '#ff5a4a', a); }
    // airflow ticks
    ctx.strokeStyle = 'rgba(61,139,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 14; i++) { const y = cy - 300 + i * 46 + (i > 6 ? 360 : 0); const x = W - ((t * 500 + i * 173) % (W + 200)); ctx.moveTo(x, y); ctx.lineTo(x + 70, y); } ctx.stroke();
  }
  // lens flare
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(W * 0.5, H * 0.45); ctx.rotate(-0.62); const g = ctx.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, 'rgba(255,190,90,0)'); g.addColorStop(0.5, 'rgba(255,190,90,0.12)'); g.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(-W * 1.5, -60, W * 3, 120); ctx.restore();
}
v7.caps = [[0.3, 2.4, 'How does a paper plane *fly?'], [2.4, 4.6, '*Four forces'], [4.7, 6.6, 'Your throw gives *thrust'], [6.6, 8.4, 'Wings turn speed into *lift'], [8.4, 9.8, 'Until *drag wins']];

// ============ 8. CINEMATIC 3D: lightning ============
function bolt(ctx, x, y, x2, y2, seed, w) { const R = rng(seed); const pts = [[x, y]]; let n = 14; for (let i = 1; i < n; i++) pts.push([x + (x2 - x) * i / n + (R() - 0.5) * 120, y + (y2 - y) * i / n]); pts.push([x2, y2]); ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); const b = pts[6]; ctx.lineWidth = w * 0.5; ctx.beginPath(); ctx.moveTo(...b); let bx = b[0], by = b[1]; for (let i = 0; i < 5; i++) { bx += 30 + R() * 50; by += 50 + R() * 40; ctx.lineTo(bx, by); } ctx.stroke(); }
function v8(ctx, W, H, t) {
  if (!v8.bg) { const o = new OffscreenCanvas(W, H), b = o.getContext('2d'); const g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05070d'); g.addColorStop(0.6, '#1b2438'); g.addColorStop(1, '#0c111c'); b.fillStyle = g; b.fillRect(0, 0, W, H); b.filter = 'blur(30px)'; const R = rng(4); for (let i = 0; i < 40; i++) { { const v = 35 + R() * 45; b.fillStyle = `rgba(${v},${v + 8},${v + 22},${0.5 + R() * 0.4})`; } b.beginPath(); b.ellipse(R() * W, R() * H * 0.45, 150 + R() * 250, 60 + R() * 90, 0, 0, 7); b.fill(); } b.filter = 'none'; v8.bg = o;
    const c = new OffscreenCanvas(W, H), d = c.getContext('2d'); const R2 = rng(9); let x = -20; while (x < W) { const w = 60 + R2() * 110, h = 120 + R2() * 360; d.fillStyle = '#05070b'; d.fillRect(x, H * 0.80 - h, w, h + H); for (let yy = H * 0.80 - h + 20; yy < H * 0.78; yy += 34) for (let xx = x + 12; xx < x + w - 14; xx += 26) if (R2() < 0.22) { d.fillStyle = `rgba(255,${170 + R2() * 60},90,${0.5 + R2() * 0.5})`; d.fillRect(xx, yy, 10, 14); } x += w + 6; } v8.city = c; }
  const flashes = [[0.9, 0.5, 11], [3.3, 0.6, 23]]; let fl = 0, act = null; flashes.forEach(([st, du, sd]) => { const e = t - st; if (e > 0 && e < du) { fl = Math.max(fl, (1 - e / du) * (0.6 + 0.4 * Math.abs(Math.sin(e * 60)))); act = sd; } });
  if (t < 5.1) {
    ctx.drawImage(v8.bg, 0, 0);
    if (fl > 0) { ctx.fillStyle = `rgba(170,190,255,${0.45 * fl})`; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(190,210,255,${fl})`; ctx.shadowColor = '#9fb8ff'; ctx.shadowBlur = 60; bolt(ctx, W * 0.55, H * 0.08, W * 0.45, H * 0.74, act, 10); ctx.strokeStyle = '#fff'; ctx.shadowBlur = 20; bolt(ctx, W * 0.55, H * 0.08, W * 0.45, H * 0.74, act, 4); ctx.restore(); }
    ctx.drawImage(v8.city, 0, 0); ctx.fillStyle = '#04060a'; ctx.fillRect(0, H * 0.80, W, H);
    // wet street reflection
    ctx.save(); ctx.globalAlpha = 0.25; ctx.filter = 'blur(8px)'; ctx.translate(0, H * 1.6); ctx.scale(1, -1); ctx.drawImage(v8.city, 0, H * 0.5, W, H * 0.3, 0, H * 0.5, W, H * 0.3); ctx.restore(); ctx.filter = 'none';
    ctx.save(); ctx.filter = 'blur(1.5px)'; rain(ctx, W, H, t, { n: 140, len: 40, slant: -0.1, speed: 1500, color: 'rgba(190,210,255,0.28)', width: 2, seed: 3 }); ctx.restore(); ctx.filter = 'none';
    rain(ctx, W, H, t, { n: 40, len: 80, slant: -0.1, speed: 2200, color: 'rgba(230,240,255,0.45)', width: 3, seed: 8 });
  } else {
    const e = t - 5.1; ctx.fillStyle = '#06080e'; ctx.fillRect(0, 0, W, H);
    const base = H * 0.66, top = H * 0.16, bw = 220; const fs = ez((e - 0.3) / 1.0) * 0.2, fb = ez((e - 2.2) / 1.6);
    // sun column
    const sx = W * 0.28, bx = W * 0.72;
    const sg = ctx.createRadialGradient(sx, H * 0.12, 10, sx, H * 0.12, 160); sg.addColorStop(0, '#fff3c4'); sg.addColorStop(0.35, '#ffb02e'); sg.addColorStop(1, 'rgba(255,120,20,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, H * 0.12, 160, 0, 7); ctx.fill();
    ctx.save(); ctx.strokeStyle = '#d8e4ff'; ctx.shadowColor = '#8fb0ff'; ctx.shadowBlur = 40; ctx.globalCompositeOperation = 'lighter'; ctx.save(); ctx.translate(bx - 60, H * 0.03); ctx.scale(0.18, 0.12); bolt(ctx, 300, 0, 330, 1300, 23, 50); ctx.restore(); ctx.restore();
    [[sx, fs, ['#ff7a1a', '#ffd166'], '~10,000°F', 'SUN’S SURFACE'], [bx, fb, ['#5a7dff', '#e8f0ff'], '~50,000°F', 'LIGHTNING']].forEach(([x, f, cols, v, l]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.06)'; rr(ctx, x - bw / 2, top + 140, bw, base - top - 140, 30); ctx.fill();
      const hh = (base - top - 140) * f; const g = ctx.createLinearGradient(0, base, 0, base - hh); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); ctx.save(); ctx.shadowColor = cols[0]; ctx.shadowBlur = 50; ctx.fillStyle = g; rr(ctx, x - bw / 2, base - hh, bw, hh, 30); ctx.fill(); ctx.restore();
      if (f > 0.02) txt(ctx, v, x, base - hh - 50, '800 64px Inter', '#fff'); txt(ctx, l, x, base + 60, '700 40px Inter', 'rgba(255,255,255,0.8)');
    });
    if (e > 2.4) { const a = pop((e - 3.6) / 0.4); if (a > 0) { ctx.save(); ctx.translate(W / 2, H * 0.40); ctx.scale(a, a); ctx.fillStyle = '#F97316'; rr(ctx, -80, -50, 160, 100, 50); ctx.fill(); txt(ctx, '×5', 0, 3, '900 64px Inter', '#fff'); ctx.restore(); } }
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
}
v8.caps = [[0.3, 1.9, 'Lightning is *hotter'], [1.9, 3.5, 'than the *Sun’s surface'], [3.5, 5.0, 'About *five times hotter'], [5.3, 7.4, 'Sun’s surface: about *10,000°F'], [7.4, 9.8, 'Lightning: around *50,000°F']];

// ============ 9. TOY BRICKS: phantom jam ============
function v9sim(t) {
  const N = 8, V = 230, dt = 1 / 30, xs = [], vs = [];
  for (let i = 0; i < N; i++) { xs.push(-1900 + i * 330); vs.push(V); }
  const steps = Math.round(t / dt);
  for (let k = 0; k < steps; k++) { const tt = k * dt;
    for (let i = N - 1; i >= 0; i--) {
      let want;
      if (i === N - 1) want = (tt > 2.4 && tt < 3.4) ? V * 0.08 : V;
      else want = clamp((xs[i + 1] - xs[i] - 250) * 1.3, 0, V);
      const rate = want < vs[i] ? 4.5 : 1.4; vs[i] += (want - vs[i]) * Math.min(1, dt * rate);
      xs[i] += vs[i] * dt; if (i < N - 1) xs[i] = Math.min(xs[i], xs[i + 1] - 232);
    } }
  return xs.map((x, i) => [x, vs[i] / V]);
}
function v9(ctx, W, H, t) {
  const cam = 230 * 0.55 * t - 750; const sc = W / 1080;
  ctx.fillStyle = '#9fd3ff'; ctx.fillRect(0, 0, W, H);
  // studded sky plate
  for (let y = 30; y < H * 0.5; y += 60) for (let x = ((-cam * 0.2) % 60) - 60; x < W; x += 60) { ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(x, y, 16, 0, 7); ctx.fill(); }
  // buildings parallax
  const R = rng(3); const bc = ['#e63322', '#ffd23f', '#1e4fd6', '#3ddc97', '#f5f5f5', '#ff8c42']; for (let i = -2; i < 14; i++) { const x = i * 200 - ((cam * 0.4) % 200), h = 300 + (i * 97 % 5) * 90, col = bc[(i + 20) % 6]; for (let y = H * 0.55 - h; y < H * 0.55; y += 40) brick(ctx, x, y, 190, 40, col); for (let y = H * 0.55 - h + 50; y < H * 0.52; y += 120) { ctx.fillStyle = '#cfe8ff'; ctx.fillRect(x + 30, y, 50, 60); ctx.fillRect(x + 110, y, 50, 60); } }
  // road plate
  for (let y = H * 0.55; y < H; y += 40) for (let x = -((cam) % 60) - 60; x < W; x += 60) brick(ctx, x, y, 60, 40, y > H * 0.82 ? '#4b8a3c' : '#6b7280');
  for (let x = -((cam) % 240) - 240; x < W; x += 240) brick(ctx, x, H * 0.685, 120, 16, '#f5f5f5');
  // cars
  const cars = v9sim(t); const cols = ['#ffd23f', '#1e4fd6', '#3ddc97', '#ff8c42', '#c77dff', '#f5f5f5', '#1e4fd6', '#e63322'];
  cars.forEach(([x, s], i) => { const cx = x - cam, cy = H * 0.66; if (cx < -300 || cx > W + 100) return; const col = cols[i];
    brick(ctx, cx, cy - 70, 220, 70, col); brick(ctx, cx + 40, cy - 140, 120, 70, col); ctx.fillStyle = '#cfe8ff'; ctx.fillRect(cx + 54, cy - 128, 40, 50); ctx.fillRect(cx + 106, cy - 128, 40, 50);
    for (let k = 0; k < 3; k++) { ctx.fillStyle = shade(col.length === 7 ? col : '#888888', 1.15); ctx.beginPath(); ctx.ellipse(cx + 62 + k * 38, cy - 146, 14, 7, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#111'; [cx + 50, cx + 170].forEach(wx => { ctx.beginPath(); ctx.arc(wx, cy, 34, 0, 7); ctx.fill(); ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(wx, cy, 14, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; });
    const br = s < 0.6; ctx.fillStyle = br ? '#ff2020' : '#7a1010'; ctx.fillRect(cx - 4, cy - 62, 14, 24); if (br) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(cx, cy - 50, 2, cx, cy - 50, 90); g.addColorStop(0, 'rgba(255,40,40,0.7)'); g.addColorStop(1, 'rgba(255,40,40,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 100, cy - 140, 200, 180); ctx.restore(); }
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(cx + 120, cy - 165, 16, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(cx + 104, cy - 186, 32, 10);
  });
  if (t > 5.2) { // wave marker: position of car currently slowest
    let mi = 0; cars.forEach(([x, s], i) => { if (s < cars[mi][1]) mi = i; }); const wx = cars[mi][0] - cam + 110; const a = ez((t - 5.2) / 0.4);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#e63322'; rr(ctx, wx - 180, H * 0.43, 360, 90, 20); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(wx - 180, H * 0.43, 360, 6); txt(ctx, '◀ JAM WAVE', wx, H * 0.43 + 46, '900 48px "Archivo Black"', '#fff'); ctx.restore(); }
}
v9.caps = [[0.3, 2.6, 'Stuck in a jam with *no crash?'], [2.6, 5.0, 'One driver taps the *brakes'], [5.2, 7.5, 'Everyone behind brakes *harder'], [7.5, 9.8, 'And the jam moves *backwards']];

// ============ 10. SOFT 3D: sloth ============
function slothDraw(ctx, x, y, s, t, swim) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const fur = (cx, cy, rx, ry, r = 0) => { const g = ctx.createRadialGradient(cx - rx * 0.4, cy - ry * 0.5, 4, cx, cy, Math.max(rx, ry) * 1.2); g.addColorStop(0, '#c9b08f'); g.addColorStop(1, '#7d6449'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, r, 0, 7); ctx.fill(); };
  // limbs
  ctx.lineCap = 'round'; const limb = (x1, y1, x2, y2) => { const g = ctx.createLinearGradient(x1, y1, x2, y2); g.addColorStop(0, '#a88d6c'); g.addColorStop(1, '#8a7055'); ctx.strokeStyle = g; ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.strokeStyle = '#efe4d2'; ctx.lineWidth = 6; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x2 + k * 10, y2); ctx.lineTo(x2 + k * 12, y2 - 26); ctx.stroke(); } };
  if (!swim) { limb(-70, -40, -60, -230); limb(70, -40, 60, -230); limb(-60, 120, -40, -200); limb(60, 120, 40, -200); }
  else { const p = Math.sin(t * 3) * 40; limb(-80, -20, -230, -60 + p); limb(80, -10, 220, -40 - p); limb(-60, 110, -200, 150 - p); limb(60, 110, 200, 160 + p); }
  fur(0, 40, 130, 150); fur(0, -95, 105, 92);
  ctx.fillStyle = '#f3e6cf'; ctx.beginPath(); ctx.ellipse(0, -85, 82, 64, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4a3626'; [[-38, -95, -0.5], [38, -95, 0.5]].forEach(([ex, ey, r]) => { ctx.beginPath(); ctx.ellipse(ex, ey, 30, 16, r, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#1c130c'; const blink = (t % 3.3) < 0.15 ? 0.15 : 1; [[-36, -94], [36, -94]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.ellipse(ex, ey, 7, 7 * blink, 0, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#2a1d14'; ctx.beginPath(); ctx.ellipse(0, -70, 14, 10, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2a1d14'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -62, 22, 0.35, Math.PI - 0.35); ctx.stroke();
  ctx.fillStyle = 'rgba(240,130,120,0.35)'; ctx.beginPath(); ctx.arc(-55, -62, 13, 0, 7); ctx.arc(55, -62, 13, 0, 7); ctx.fill();
  ctx.restore();
}
function v10(ctx, W, H, t) {
  if (t < 5) {
    if (!v10.bg) { const o = new OffscreenCanvas(W, H), b = o.getContext('2d'); const g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f8c9a0'); g.addColorStop(1, '#ef9f7c'); b.fillStyle = g; b.fillRect(0, 0, W, H); b.filter = 'blur(40px)'; const R = rng(2); for (let i = 0; i < 18; i++) { b.fillStyle = `rgba(${120 + R() * 60},${170 + R() * 50},${110 + R() * 40},0.55)`; b.beginPath(); b.arc(R() * W, R() * H * 0.5, 80 + R() * 140, 0, 7); b.fill(); } for (let i = 0; i < 10; i++) { b.fillStyle = 'rgba(255,235,200,0.6)'; b.beginPath(); b.arc(R() * W, R() * H, 30 + R() * 40, 0, 7); b.fill(); } b.filter = 'none'; v10.bg = o; }
    ctx.drawImage(v10.bg, 0, 0);
    // branch
    const by = H * 0.24; const g = ctx.createLinearGradient(0, by - 40, 0, by + 40); g.addColorStop(0, '#9a6b4a'); g.addColorStop(1, '#5e3c26'); ctx.strokeStyle = g; ctx.lineCap = 'round'; ctx.lineWidth = 70; ctx.beginPath(); ctx.moveTo(-50, by + 20); ctx.quadraticCurveTo(W / 2, by - 30, W + 50, by + 10); ctx.stroke();
    [[0.2, -1], [0.75, 1], [0.9, -1]].forEach(([x, d]) => { ctx.fillStyle = '#7cbf6a'; ctx.beginPath(); ctx.ellipse(W * x, by - 60, 70, 34, d * 0.5, 0, 7); ctx.fill(); ctx.fillStyle = '#9bd487'; ctx.beginPath(); ctx.ellipse(W * x - 10, by - 68, 40, 16, d * 0.5, 0, 7); ctx.fill(); });
    const sw = Math.sin(t * 0.9) * 0.06; ctx.save(); ctx.translate(W / 2, by); ctx.rotate(sw); ctx.save(); ctx.filter = 'blur(20px)'; ctx.fillStyle = 'rgba(120,50,40,0.25)'; ctx.beginPath(); ctx.ellipse(40, 520, 200, 60, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.filter = 'none'; slothDraw(ctx, 0, 330, 1.25, t, false); ctx.restore();
    if (t > 2.4) { const a = pop((t - 2.4) / 0.5); ctx.save(); ctx.translate(W * 0.80, H * 0.62); ctx.scale(a, a); ctx.fillStyle = 'rgba(255,255,255,0.92)'; rr(ctx, -200, -55, 400, 110, 55); ctx.fill(); txt(ctx, 'SWIM 3× FASTER', 0, 2, '800 40px Inter', '#2f6f8f'); ctx.restore(); }
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9ee0e8'); g.addColorStop(1, '#2f8fa8'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(255,255,240,0.07)'; ctx.beginPath(); const x = W * (0.1 + i * 0.22) + Math.sin(t + i) * 30; ctx.moveTo(x, 0); ctx.lineTo(x + 120, 0); ctx.lineTo(x + 300, H); ctx.lineTo(x + 80, H); ctx.fill(); } ctx.restore();
    const R = rng(5); for (let i = 0; i < 26; i++) { const x = R() * W, sp = 120 + R() * 160, y = H - ((t * sp + R() * H) % (H + 100)), r = 6 + R() * 16; const bg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); bg.addColorStop(0, 'rgba(255,255,255,0.9)'); bg.addColorStop(1, 'rgba(255,255,255,0.15)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x + Math.sin(t * 2 + i) * 10, y, r, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(20,80,100,0.35)'; ctx.beginPath(); ctx.ellipse(W / 2, H * 0.92, W * 0.7, 120, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(W / 2 + Math.sin(t * 0.8) * 30, H * 0.50 + Math.sin(t * 1.3) * 16); ctx.rotate(-1.35); slothDraw(ctx, 0, 0, 1.1, t, true); ctx.restore();
    const e = clamp((t - 7.2) / 2.0); const mins = Math.round(e * 40); const a = pop((t - 7.0) / 0.4);
    if (a > 0) { ctx.save(); ctx.translate(W / 2, H * 0.17); ctx.scale(a, a); ctx.shadowColor = 'rgba(0,40,60,0.35)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; rr(ctx, -230, -80, 460, 160, 80); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = '#F97316'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(-150, 0, 44, -Math.PI / 2, -Math.PI / 2 + e * Math.PI * 2); ctx.stroke(); txt(ctx, String(mins).padStart(2, '0') + ':00', 40, 4, '800 78px Inter', '#1f5f78'); ctx.restore(); }
  }
}
v10.caps = [[0.3, 2.4, 'Sloths are slow on *land'], [2.4, 4.8, 'But surprisingly good *swimmers'], [5.2, 7.2, 'They can hold their *breath'], [7.2, 9.8, 'For up to *40 minutes']];

const VIDEOS = [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10];
const TOPICS = ['First Easter Egg', '60 Minutes', 'Brain Power', 'Blowing Cartridges', 'Octopus Hearts', 'Honey', 'Paper Plane', 'Lightning', 'Phantom Jams', 'Sloth Breath'];
