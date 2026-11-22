// Fixed scene geometry (normalized) + 10 render styles. Same composition every style.
const G = {
  ground: 0.72,
  shop: { x0: 0.03, x1: 0.53, y0: 0.20, y1: 0.72 },
  sign: { x0: 0.07, x1: 0.49, y0: 0.255, y1: 0.325 },
  win: { x0: 0.08, x1: 0.48, y0: 0.40, y1: 0.665, cols: 4, rows: 3 },
  lantern: [0.10, 0.365],
  head: [0.60, 0.43], hr: 0.048,
  umb: { c: [0.665, 0.355], r: 0.215, h: 0.075 },
  hand: [0.652, 0.555],
  coat: [[0.578, 0.472], [0.642, 0.472], [0.668, 0.60], [0.69, 0.78], [0.548, 0.78], [0.565, 0.60]],
  legF: [[0.588, 0.778], [0.556, 0.842]],
  legB: [[0.648, 0.778], [0.676, 0.842]],
  arm: [[0.628, 0.49], [0.652, 0.555]],
  puddles: [[0.27, 0.865, 0.13, 0.016], [0.80, 0.895, 0.10, 0.013], [0.52, 0.945, 0.16, 0.018]],
  moon: [0.86, 0.105],
};

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const P = (W, H) => (p) => [p[0] * W, p[1] * H];

function poly(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// Umbrella canopy path: scalloped dome. returns path built on ctx
function umbPath(ctx, W, H, scallops = 6) {
  const { c, r, h } = G.umb; const cx = c[0] * W, cy = c[1] * H, R = r * W, D = h * H;
  ctx.beginPath();
  ctx.moveTo(cx - R, cy);
  ctx.bezierCurveTo(cx - R, cy - D * 1.25, cx - R * 0.35, cy - D * 1.45, cx, cy - D * 1.42);
  ctx.bezierCurveTo(cx + R * 0.35, cy - D * 1.45, cx + R, cy - D * 1.25, cx + R, cy);
  const seg = (2 * R) / scallops;
  for (let i = 0; i < scallops; i++) {
    const x1 = cx + R - seg * i, x2 = x1 - seg;
    ctx.quadraticCurveTo((x1 + x2) / 2, cy - D * 0.32, x2, cy);
  }
  ctx.closePath();
}
function umbRibs(ctx, W, H, n = 6) {
  const { c, r, h } = G.umb; const cx = c[0] * W, cy = c[1] * H, R = r * W, D = h * H;
  const seg = (2 * R) / n;
  ctx.beginPath();
  for (let i = 1; i < n; i++) { const x = cx - R + seg * i; ctx.moveTo(cx, cy - D * 1.42); ctx.quadraticCurveTo(cx + (x - cx) * 0.75, cy - D * 1.1, x, cy); }
}
function shaft(ctx, W, H) {
  const { c, h } = G.umb; const top = [c[0] * W, c[1] * H - h * H * 1.42];
  const hx = G.hand[0] * W, hy = G.hand[1] * H;
  ctx.beginPath(); ctx.moveTo(top[0], top[1] - 10); ctx.lineTo(top[0], c[1] * H);
  ctx.lineTo(hx, hy + 14); ctx.arc(hx - 7, hy + 14, 7, 0, Math.PI, false);
}
// Head profile facing left: circle + nose
function headPath(ctx, W, H, s = 1) {
  const [x, y] = [G.head[0] * W, G.head[1] * H]; const R = G.hr * W * s;
  ctx.beginPath(); ctx.arc(x, y, R, -Math.PI * 0.8, Math.PI * 0.85);
  ctx.lineTo(x - R * 1.02, y + R * 0.25); ctx.lineTo(x - R * 1.2, y + R * 0.08); ctx.lineTo(x - R * 1.0, y - R * 0.15); ctx.closePath();
}
function hairPath(ctx, W, H) {
  const [x, y] = [G.head[0] * W, G.head[1] * H]; const R = G.hr * W;
  ctx.beginPath(); ctx.arc(x + R * 0.12, y - R * 0.1, R * 1.03, Math.PI * 0.95, Math.PI * 2.35);
  ctx.quadraticCurveTo(x + R * 0.3, y - R * 0.2, x - R * 0.85, y - R * 0.45); ctx.closePath();
  ctx.moveTo(x + R * 1.45, y - R * 0.05); ctx.arc(x + R * 1.1, y - R * 0.05, R * 0.42, 0, Math.PI * 2);
}
function rain(ctx, W, H, t, { n = 90, len = 28, slant = -0.18, speed = 900, color = 'rgba(255,255,255,0.35)', width = 1.5, seed = 7, y0 = 0, y1 = 1 } = {}) {
  const R = rng(seed); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = R() * W * 1.2, sp = speed * (0.75 + R() * 0.5), off = R() * H;
    const span = (y1 - y0) * H; let y = y0 * H + ((off + t * sp) % span);
    const xx = x + slant * (y - y0 * H) - W * 0.05;
    ctx.moveTo(xx, y); ctx.lineTo(xx + slant * len, y + len);
  }
  ctx.stroke();
}

// ---------------- 1. 8-Bit Quest ----------------
function s1(ctx, W, H, t) {
  const k = 6, w = Math.ceil(W / k), h = Math.ceil(H / k);
  const o = s1.o || (s1.o = new OffscreenCanvas(w, h)); const c = o.getContext('2d');
  const p = P(w, h);
  c.fillStyle = '#0d2a3a'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#123a4c'; c.fillRect(0, 0, w, h * 0.2);
  // stars
  const R = rng(3); c.fillStyle = '#cfe8ff'; for (let i = 0; i < 18; i++) c.fillRect(Math.floor(R() * w), Math.floor(R() * h * 0.22), 1, 1);
  // moon ghost
  const [mx, my] = p(G.moon); c.fillStyle = '#f2f2f2'; c.fillRect(mx - 4, my - 4, 8, 7); c.fillRect(mx - 3, my - 5, 6, 1); c.fillRect(mx - 4, my + 3, 2, 1); c.fillRect(mx, my + 3, 2, 1); c.fillRect(mx + 3, my + 3, 1, 1);
  c.fillStyle = '#0d2a3a'; c.fillRect(mx - 2, my - 2, 1, 2); c.fillRect(mx + 1, my - 2, 1, 2);
  // shop
  const S = G.shop; c.fillStyle = '#3a2a4a'; c.fillRect(S.x0 * w, S.y0 * h, (S.x1 - S.x0) * w, (S.y1 - S.y0) * h);
  c.fillStyle = '#5b3d6b'; for (let y = S.y0 * h; y < S.y1 * h; y += 3) c.fillRect(S.x0 * w, Math.floor(y), (S.x1 - S.x0) * w, 1);
  const Wn = G.win; c.fillStyle = '#ffd23f'; c.fillRect(Math.floor(Wn.x0 * w), Math.floor(Wn.y0 * h), Math.floor((Wn.x1 - Wn.x0) * w), Math.floor((Wn.y1 - Wn.y0) * h));
  c.fillStyle = '#3a2a4a'; for (let i = 1; i < Wn.cols; i++) c.fillRect(Math.floor((Wn.x0 + (Wn.x1 - Wn.x0) * i / Wn.cols) * w), Math.floor(Wn.y0 * h), 1, Math.floor((Wn.y1 - Wn.y0) * h));
  for (let i = 1; i < Wn.rows; i++) c.fillRect(Math.floor(Wn.x0 * w), Math.floor((Wn.y0 + (Wn.y1 - Wn.y0) * i / Wn.rows) * h), Math.floor((Wn.x1 - Wn.x0) * w), 1);
  c.fillStyle = '#e0457b'; c.fillRect(Math.floor(G.sign.x0 * w), Math.floor(G.sign.y0 * h), Math.floor((G.sign.x1 - G.sign.x0) * w), Math.floor((G.sign.y1 - G.sign.y0) * h));
  // street
  c.fillStyle = '#16324a'; c.fillRect(0, G.ground * h, w, h); c.fillStyle = '#1f4260'; for (let x = 0; x < w; x += 6) c.fillRect(x, G.ground * h + 2, 3, 1);
  // puddles
  G.puddles.forEach(([x, y, rx]) => { c.fillStyle = '#2d6fa0'; c.fillRect(Math.floor((x - rx * 0.8) * w), Math.floor(y * h), Math.floor(rx * 1.6 * w), 2); c.fillStyle = '#5aa9e6'; c.fillRect(Math.floor((x - rx * 0.4) * w), Math.floor(y * h), Math.floor(rx * 0.5 * w), 1); });
  // feet glow
  c.fillStyle = 'rgba(80,170,255,0.45)'; c.fillRect(Math.floor(0.53 * w), Math.floor(0.835 * h), Math.floor(0.17 * w), 2);
  // figure (blocky)
  c.fillStyle = '#1c3d8f'; poly(c, G.coat.map(p)); c.fill();
  c.fillStyle = '#111'; c.fillRect(Math.floor(0.56 * w), Math.floor(0.78 * h), 3, Math.floor(0.06 * h)); c.fillRect(Math.floor(0.655 * w), Math.floor(0.78 * h), 3, Math.floor(0.06 * h));
  const [hx, hy] = p(G.head); const hr = Math.round(G.hr * w);
  c.fillStyle = '#f2c79b'; c.fillRect(Math.round(hx - hr), Math.round(hy - hr), hr * 2, hr * 2); c.fillRect(Math.round(hx - hr - 1), Math.round(hy), 1, 1);
  c.fillStyle = '#2a1a12'; c.fillRect(Math.round(hx - hr + 1), Math.round(hy - hr - 1), hr * 2, 2); c.fillRect(Math.round(hx), Math.round(hy - hr), hr + 1, hr + 1); c.fillRect(Math.round(hx + hr), Math.round(hy - 1), 2, 2);
  c.fillStyle = '#000'; c.fillRect(Math.round(hx - hr + 1), Math.round(hy - 1), 1, 1);
  // umbrella
  const u = G.umb; const ucx = u.c[0] * w, ucy = u.c[1] * h, uR = u.r * w;
  for (let row = 0; row < 6; row++) { const ww = Math.round(uR * Math.sqrt(1 - Math.pow((5 - row) / 6, 2)) * 1.0 + 2); c.fillStyle = row % 2 ? '#d7263d' : '#ff3b3b'; c.fillRect(Math.round(ucx - ww), Math.round(ucy - 6 + row), ww * 2, 1); }
  c.fillStyle = '#d7263d'; c.fillRect(Math.round(ucx - uR), Math.round(ucy), Math.round(uR * 2), 1);
  c.fillStyle = '#ddd'; c.fillRect(Math.round(ucx), Math.round(ucy), 1, Math.round((G.hand[1] - u.c[1]) * h) + 2);
  // banner RAIN QUEST
  c.fillStyle = '#ffd23f'; c.fillRect(Math.round(w * 0.12), 4, Math.round(w * 0.76), 13); c.fillStyle = '#b8860b'; c.fillRect(Math.round(w * 0.12), 16, Math.round(w * 0.76), 1);
  c.fillStyle = '#3a1d00'; c.font = 'bold 10px "DejaVu Sans Mono"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RAIN QUEST', w / 2, 11);
  // mini umbrellas row
  const cols = ['#ff3b3b', '#ffd23f', '#3ddc97', '#5aa9e6', '#c77dff', '#ff8c42', '#ff3b3b', '#5aa9e6'];
  cols.forEach((col, i) => { const x = Math.round(w * (0.08 + i * 0.12)), y = Math.round(h * 0.975); c.fillStyle = col; c.fillRect(x - 2, y - 2, 5, 1); c.fillRect(x - 1, y - 3, 3, 1); c.fillStyle = '#ddd'; c.fillRect(x, y - 1, 1, 2); });
  // rain pixels
  const Rr = rng(11); c.fillStyle = '#8ecbff'; for (let i = 0; i < 40; i++) { const x = Math.floor(Rr() * w), y = Math.floor((Rr() * h + t * 140 * (0.8 + Rr() * 0.4)) % h); c.fillRect(x, y, 1, 2); }
  ctx.imageSmoothingEnabled = false; ctx.drawImage(o, 0, 0, w * k, h * k); ctx.imageSmoothingEnabled = true;
}

// ---------------- 2. Chalk Doodle ----------------
function chalkLine(ctx, pts, { color = 'rgba(245,245,240,0.85)', w = 3, passes = 3, jit = 2.2, seed = 1, close = false } = {}) {
  const R = rng(seed);
  for (let k = 0; k < passes; k++) {
    ctx.strokeStyle = color; ctx.globalAlpha = 0.55 + R() * 0.3; ctx.lineWidth = w * (0.6 + R() * 0.6); ctx.lineCap = 'round';
    ctx.beginPath(); const arr = close ? [...pts, pts[0]] : pts;
    arr.forEach((p, i) => { const x = p[0] + (R() - 0.5) * jit * 2, y = p[1] + (R() - 0.5) * jit * 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function ellipsePts(cx, cy, rx, ry, n = 28, a0 = 0, a1 = Math.PI * 2) { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; }
function s2(ctx, W, H, t) {
  const p = P(W, H);
  ctx.fillStyle = '#1B4D3E'; ctx.fillRect(0, 0, W, H);
  // smudges
  const R = rng(5); for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.015 + R() * 0.03})`; ctx.beginPath(); ctx.ellipse(R() * W, R() * H, 30 + R() * 90, 10 + R() * 30, R() * 3, 0, 7); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, H - 18, W, 18); // chalk ledge
  const S = G.shop;
  chalkLine(ctx, [p([S.x0, S.y1]), p([S.x0, S.y0]), p([S.x1, S.y0]), p([S.x1, S.y1])], { seed: 2 });
  chalkLine(ctx, [p([S.x0 - 0.02, S.y0]), p([S.x0 + 0.06, S.y0 - 0.05]), p([S.x1 - 0.06, S.y0 - 0.05]), p([S.x1 + 0.02, S.y0])], { seed: 3 });
  const Wn = G.win; chalkLine(ctx, [p([Wn.x0, Wn.y0]), p([Wn.x1, Wn.y0]), p([Wn.x1, Wn.y1]), p([Wn.x0, Wn.y1])], { seed: 4, close: true, color: 'rgba(255,230,140,0.85)' });
  for (let i = 1; i < Wn.cols; i++) { const x = Wn.x0 + (Wn.x1 - Wn.x0) * i / Wn.cols; chalkLine(ctx, [p([x, Wn.y0]), p([x, Wn.y1])], { seed: 10 + i, passes: 2, color: 'rgba(255,230,140,0.7)' }); }
  chalkLine(ctx, [p([Wn.x0, (Wn.y0 + Wn.y1) / 2]), p([Wn.x1, (Wn.y0 + Wn.y1) / 2])], { seed: 19, passes: 2, color: 'rgba(255,230,140,0.7)' });
  // door outline on far left building edge
  chalkLine(ctx, [p([0.40, 0.72]), p([0.40, 0.69]), p([0.40, 0.69])], { seed: 20, passes: 1 });
  chalkLine(ctx, [p([0.0, G.ground]), p([1, G.ground])], { seed: 21 });
  ctx.font = '600 30px "Comic Relief"'; ctx.fillStyle = 'rgba(245,245,240,0.9)'; ctx.textAlign = 'center'; ctx.fillText('CAFÉ', W * 0.28, H * 0.302);
  // lantern
  const [lx, ly] = p(G.lantern); chalkLine(ctx, ellipsePts(lx, ly, 14, 18), { seed: 22, color: 'rgba(255,150,120,0.9)' }); chalkLine(ctx, [[lx, ly - 18], [lx, ly - 40]], { seed: 23, passes: 1 });
  // figure
  chalkLine(ctx, G.coat.map(p), { seed: 30, close: true, color: 'rgba(160,200,255,0.9)', w: 3.5 });
  chalkLine(ctx, G.legF.map(p), { seed: 31 }); chalkLine(ctx, G.legB.map(p), { seed: 32 });
  chalkLine(ctx, G.arm.map(p), { seed: 33 });
  const [hx, hy] = p(G.head), hr = G.hr * W;
  chalkLine(ctx, [...ellipsePts(hx, hy, hr, hr, 24, -Math.PI * 0.8, Math.PI * 0.85), [hx - hr * 1.02, hy + hr * 0.25], [hx - hr * 1.2, hy + hr * 0.08], [hx - hr, hy - hr * 0.15]], { seed: 34, close: true });
  chalkLine(ctx, ellipsePts(hx + hr * 1.1, hy - hr * 0.05, hr * 0.42, hr * 0.42, 14), { seed: 35 });
  chalkLine(ctx, ellipsePts(hx + hr * 0.1, hy - hr * 0.1, hr * 1.05, hr * 1.05, 16, Math.PI * 1.0, Math.PI * 1.95), { seed: 36 });
  // umbrella red chalk
  const u = G.umb, cx = u.c[0] * W, cy = u.c[1] * H, Rr = u.r * W, D = u.h * H;
  const dome = []; for (let i = 0; i <= 30; i++) { const a = Math.PI + Math.PI * i / 30; dome.push([cx + Math.cos(a) * Rr, cy + Math.sin(a) * D * 1.42]); }
  const sc = []; for (let i = 0; i <= 30; i++) { const x = cx + Rr - (2 * Rr) * i / 30; sc.push([x, cy - Math.abs(Math.sin(i / 30 * Math.PI * 6)) * D * 0.25]); }
  // fill with red chalk hatching
  ctx.save(); ctx.beginPath(); dome.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.clip();
  const Rh = rng(40); ctx.strokeStyle = 'rgba(230,60,60,0.55)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = cx - Rr - 40; x < cx + Rr; x += 7) { ctx.moveTo(x + Rh() * 3, cy + 5); ctx.lineTo(x + 40 + Rh() * 3, cy - D * 1.5); } ctx.stroke(); ctx.restore();
  chalkLine(ctx, dome, { seed: 41, color: 'rgba(240,70,70,0.95)', w: 4 }); chalkLine(ctx, sc, { seed: 42, color: 'rgba(240,70,70,0.95)', w: 3 });
  chalkLine(ctx, [[cx, cy - D * 1.42], [cx, cy], [G.hand[0] * W, G.hand[1] * H + 12]], { seed: 43, passes: 2 });
  // puddles circles
  G.puddles.forEach(([x, y, rx, ry], i) => chalkLine(ctx, ellipsePts(x * W, y * H, rx * W, ry * H * 1.4), { seed: 50 + i, passes: 2, color: 'rgba(170,215,255,0.8)' }));
  // rain dashes
  rain(ctx, W, H, t, { n: 60, len: 18, slant: -0.12, speed: 600, color: 'rgba(240,240,235,0.55)', width: 2.2, seed: 9 });
  // handwriting
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(250,250,245,0.92)'; ctx.font = '700 46px "Comic Relief"'; ctx.fillText('Rainy Night 101', W * 0.08, H * 0.095);
  chalkLine(ctx, [[W * 0.08, H * 0.11], [W * 0.80, H * 0.112]], { seed: 60, passes: 2 });
  ctx.font = '700 30px "Comic Relief"'; ctx.fillStyle = 'rgba(255,215,120,0.95)'; ctx.fillText('UMBRELLA > RAIN', W * 0.44, H * 0.18);
  chalkLine(ctx, [[W * 0.70, H * 0.192], [W * 0.73, H * 0.235], [W * 0.70, H * 0.262]], { seed: 61, color: 'rgba(255,215,120,0.95)' });
  chalkLine(ctx, [[W * 0.68, H * 0.245], [W * 0.70, H * 0.264], [W * 0.725, H * 0.25]], { seed: 62, color: 'rgba(255,215,120,0.95)', passes: 2 });
}

// ---------------- 3. Golden Neon ----------------
function glow(ctx, color, blur, fn) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = blur; fn(); ctx.shadowBlur = blur / 3; fn(); ctx.restore(); }
function s3(ctx, W, H, t) {
  const p = P(W, H);
  ctx.fillStyle = '#060606'; ctx.fillRect(0, 0, W, H);
  // spotlight cone
  const g = ctx.createLinearGradient(0, 0, 0, H * 0.86); g.addColorStop(0, 'rgba(255,190,90,0.28)'); g.addColorStop(1, 'rgba(255,170,60,0.03)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(W * 0.62, -10); ctx.lineTo(W * 0.68, -10); ctx.lineTo(W * 0.90, H * 0.86); ctx.lineTo(W * 0.40, H * 0.86); ctx.closePath(); ctx.fill();
  // faint shop line
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; const S = G.shop; ctx.strokeRect(S.x0 * W, S.y0 * H, (S.x1 - S.x0) * W, (S.y1 - S.y0) * H);
  const Wn = G.win; ctx.strokeStyle = 'rgba(255,200,110,0.35)'; ctx.strokeRect(Wn.x0 * W, Wn.y0 * H, (Wn.x1 - Wn.x0) * W, (Wn.y1 - Wn.y0) * H);
  // ground ring
  glow(ctx, '#ffb347', 25, () => { ctx.strokeStyle = '#f5b544'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(W * 0.62, H * 0.85, W * 0.21, H * 0.022, 0, 0, 7); ctx.stroke(); });
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, H * 0.85); ctx.lineTo(W, H * 0.85); ctx.stroke();
  // stick figure: head circle, triangle dress, stick legs
  glow(ctx, '#ffffff', 14, () => {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; const [hx, hy] = p(G.head), hr = G.hr * W * 0.85;
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx, hy + hr); ctx.lineTo(W * 0.54, H * 0.75); ctx.lineTo(W * 0.69, H * 0.75); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.59, H * 0.75); ctx.lineTo(W * 0.565, H * 0.845); ctx.moveTo(W * 0.64, H * 0.75); ctx.lineTo(W * 0.67, H * 0.845);
    ctx.moveTo(hx + 4, hy + hr + 30); ctx.lineTo(G.hand[0] * W, G.hand[1] * H); ctx.stroke();
  });
  // umbrella red-gold neon
  glow(ctx, '#ff4a2a', 30, () => { ctx.strokeStyle = '#ff4433'; ctx.lineWidth = 3.5; umbPath(ctx, W, H); ctx.stroke(); });
  glow(ctx, '#ffb347', 16, () => { ctx.strokeStyle = '#ffc861'; ctx.lineWidth = 2; umbRibs(ctx, W, H); ctx.stroke(); shaft(ctx, W, H); ctx.stroke(); });
  rain(ctx, W, H, t, { n: 50, len: 26, slant: -0.1, speed: 700, color: 'rgba(255,215,150,0.28)', width: 1.2, seed: 4 });
}

// ---------------- 4. Retro Console (low-poly) ----------------
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; r = Math.min(255, r * f) | 0; g = Math.min(255, g * f) | 0; b = Math.min(255, b * f) | 0; return `rgb(${r},${g},${b})`; }
function tri(ctx, a, b, c, col) { ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.closePath(); ctx.fill(); ctx.stroke(); }
function s4(ctx, W, H, t) {
  const p = P(W, H);
  // sky low-poly
  const R = rng(8); const cols = 7, rows = 5; const pts = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) pts.push([W * i / cols + (i && i < cols ? (R() - 0.5) * 40 : 0), H * 0.72 * j / rows + (j && j < rows ? (R() - 0.5) * 30 : 0)]);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const a = pts[j * (cols + 1) + i], b = pts[j * (cols + 1) + i + 1], c = pts[(j + 1) * (cols + 1) + i], d = pts[(j + 1) * (cols + 1) + i + 1]; tri(ctx, a, b, c, shade('#1a2240', 0.8 + R() * 0.35)); tri(ctx, b, d, c, shade('#1a2240', 0.8 + R() * 0.35)); }
  // building (extruded side)
  const S = G.shop; ctx.fillStyle = '#5a3a2a'; poly(ctx, [p([S.x1, S.y0]), p([S.x1 + 0.05, S.y0 + 0.03]), p([S.x1 + 0.05, S.y1]), p([S.x1, S.y1])]); ctx.fill();
  ctx.fillStyle = '#8a5a3a'; ctx.fillRect(S.x0 * W, S.y0 * H, (S.x1 - S.x0) * W, (S.y1 - S.y0) * H);
  ctx.fillStyle = '#6e452e'; for (let i = 0; i < 6; i++) ctx.fillRect(S.x0 * W, (S.y0 + i * 0.085) * H, (S.x1 - S.x0) * W, 4);
  // banners dark blue
  ctx.fillStyle = '#1e2f6b'; ctx.fillRect(G.sign.x0 * W, G.sign.y0 * H, (G.sign.x1 - G.sign.x0) * W, (G.sign.y1 - G.sign.y0) * H);
  ctx.fillStyle = '#2a3f8a'; poly(ctx, [p([G.sign.x0, G.sign.y0]), p([G.sign.x1, G.sign.y0]), p([G.sign.x1, (G.sign.y0 + G.sign.y1) / 2]), p([G.sign.x0, (G.sign.y0 + G.sign.y1) / 2])]); ctx.fill();
  [[0.06, 0.36], [0.46, 0.36]].forEach(([x, y]) => { ctx.fillStyle = '#1e2f6b'; poly(ctx, [p([x - 0.025, y]), p([x + 0.025, y]), p([x + 0.025, y + 0.13]), p([x, y + 0.115]), p([x - 0.025, y + 0.13])]); ctx.fill(); });
  // window tungsten orange
  const Wn = G.win; for (let r = 0; r < Wn.rows; r++) for (let c = 0; c < Wn.cols; c++) { const x0 = Wn.x0 + (Wn.x1 - Wn.x0) * c / Wn.cols, y0 = Wn.y0 + (Wn.y1 - Wn.y0) * r / Wn.rows, ww = (Wn.x1 - Wn.x0) / Wn.cols, hh = (Wn.y1 - Wn.y0) / Wn.rows; tri(ctx, p([x0 + 0.006, y0 + 0.004]), p([x0 + ww - 0.006, y0 + 0.004]), p([x0 + 0.006, y0 + hh - 0.004]), '#ffae4a'); tri(ctx, p([x0 + ww - 0.006, y0 + 0.004]), p([x0 + ww - 0.006, y0 + hh - 0.004]), p([x0 + 0.006, y0 + hh - 0.004]), '#f08c2e'); }
  // street: faceted
  const R2 = rng(12); for (let i = 0; i < 6; i++) { const y0 = G.ground + i * 0.047, y1 = y0 + 0.047; tri(ctx, [0, y0 * H], [W, y0 * H], [0, y1 * H], shade('#1c2236', 0.85 + R2() * 0.3)); tri(ctx, [W, y0 * H], [W, y1 * H], [0, y1 * H], shade('#1c2236', 0.85 + R2() * 0.3)); }
  // reflection: one soft window glow
  { const g = ctx.createLinearGradient(0, G.ground * H, 0, G.ground * H + H * 0.1); g.addColorStop(0, 'rgba(255,174,74,0.28)'); g.addColorStop(1, 'rgba(255,174,74,0)'); ctx.fillStyle = g; ctx.fillRect(Wn.x0 * W, G.ground * H, (Wn.x1 - Wn.x0) * W, H * 0.1); }
  G.puddles.forEach(([x, y, rx, ry]) => { ctx.fillStyle = '#2c3d66'; poly(ctx, [p([x - rx, y]), p([x - rx * 0.3, y - ry]), p([x + rx * 0.5, y - ry * 0.8]), p([x + rx, y]), p([x + rx * 0.2, y + ry])]); ctx.fill(); });
  // figure low-poly
  const cp = G.coat.map(p); const mid = p([0.615, 0.62]);
  for (let i = 0; i < cp.length; i++) tri(ctx, cp[i], cp[(i + 1) % cp.length], mid, shade('#1b2a52', i < 3 ? 1.25 - i * 0.08 : 0.8 + i * 0.03));
  tri(ctx, p([0.575, 0.778]), p([0.60, 0.778]), p([0.556, 0.845]), '#151515'); tri(ctx, p([0.64, 0.778]), p([0.665, 0.778]), p([0.68, 0.845]), '#222');
  const [hx, hy] = p(G.head), hr = G.hr * W; const hp = []; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; hp.push([hx + Math.cos(a) * hr, hy + Math.sin(a) * hr]); }
  for (let i = 0; i < 7; i++) tri(ctx, hp[i], hp[(i + 1) % 7], [hx, hy], shade('#e9b48a', 0.8 + ((i + 2) % 7) * 0.06));
  tri(ctx, [hx - hr * 0.9, hy - hr * 0.2], [hx - hr * 1.25, hy + hr * 0.1], [hx - hr * 0.9, hy + hr * 0.3], '#e0a77c');
  tri(ctx, [hx - hr, hy - hr * 0.4], [hx + hr * 1.1, hy - hr * 1.1], [hx + hr * 1.15, hy + hr * 0.4], '#2b1a14'); tri(ctx, [hx - hr, hy - hr * 0.4], [hx - hr * 0.2, hy - hr * 1.15], [hx + hr * 1.1, hy - hr * 1.1], '#3a241b');
  tri(ctx, [hx + hr * 1.0, hy - hr * 0.4], [hx + hr * 1.55, hy - hr * 0.1], [hx + hr * 1.05, hy + hr * 0.35], '#2b1a14');
  // umbrella faceted
  const u = G.umb, cx = u.c[0] * W, cy = u.c[1] * H, Rr = u.r * W, D = u.h * H * 1.42; const apex = [cx, cy - D];
  for (let i = 0; i < 6; i++) { const a = [cx - Rr + 2 * Rr * i / 6, cy - (i === 0 ? 0 : Math.sin(Math.PI * i / 6) * D * 0.35)], b = [cx - Rr + 2 * Rr * (i + 1) / 6, cy - (i === 5 ? 0 : Math.sin(Math.PI * (i + 1) / 6) * D * 0.35)]; tri(ctx, a, b, apex, i % 2 ? '#b3122a' : '#e0283c'); }
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - D); ctx.lineTo(cx, cy); ctx.lineTo(G.hand[0] * W, G.hand[1] * H + 10); ctx.stroke();
  // red reflection under figure
  ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#e0283c'; ctx.fillRect(cx - 30, H * 0.86, 60, H * 0.08); ctx.restore();
  rain(ctx, W, H, t, { n: 70, len: 30, slant: -0.15, speed: 900, color: 'rgba(190,210,255,0.35)', width: 2, seed: 2 });
}

// ---------------- 5. Pop Comic ----------------
function halftone(ctx, x, y, w, h, col, step = 14, rmax = 4.5, dir = 1) {
  ctx.fillStyle = col; for (let j = 0; j < h / step + 1; j++) for (let i = 0; i < w / step + 1; i++) { const px = x + i * step + (j % 2) * step / 2, py = y + j * step; const f = dir > 0 ? (py - y) / h : 1 - (py - y) / h; const r = rmax * (0.25 + 0.75 * f); ctx.beginPath(); ctx.arc(px, py, r, 0, 7); ctx.fill(); }
}
function s5(ctx, W, H, t) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  const pad = 16, gap = 14, h1 = H * 0.58;
  // top panel
  ctx.save(); rr(ctx, pad, pad, W - pad * 2, h1 - pad, 6); ctx.clip();
  ctx.fillStyle = '#2a6fdb'; ctx.fillRect(0, 0, W, h1); halftone(ctx, 0, 0, W, h1 * 0.55, '#7fb2ff', 16, 5, -1);
  ctx.fillStyle = '#ff2d2d'; ctx.beginPath(); ctx.arc(W * 0.85, h1 * 0.13, 30, 0, 7); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.stroke();
  // scale scene rows 0.18..0.90 into panel
  const s = (h1 - pad) / (0.72 * H); ctx.translate(W / 2, pad); ctx.scale(s, s); ctx.translate(-W / 2 - W * 0.04, -0.18 * H);
  comicScene(ctx, W, H, t);
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = '#000'; rr(ctx, pad, pad, W - pad * 2, h1 - pad, 6); ctx.stroke();
  // bottom panel: close-up
  const y2 = h1 + gap, h2 = H - y2 - pad;
  ctx.save(); rr(ctx, pad, y2, W - pad * 2, h2, 6); ctx.clip();
  ctx.fillStyle = '#ffb81c'; ctx.fillRect(0, y2, W, h2); halftone(ctx, 0, y2, W, h2, '#ff8a00', 13, 4.5, 1);
  // speed lines
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ctx.moveTo(W * 0.62 + Math.cos(a) * 140, y2 + h2 * 0.6 + Math.sin(a) * 140); ctx.lineTo(W * 0.62 + Math.cos(a) * 420, y2 + h2 * 0.6 + Math.sin(a) * 420); } ctx.stroke();
  // close-up: umbrella edge, face profile
  const fx = W * 0.62, fy = y2 + h2 * 0.62, R = h2 * 0.25;
  ctx.fillStyle = '#e8132b'; ctx.beginPath(); ctx.moveTo(W * 0.05, y2 + h2 * 0.18); ctx.quadraticCurveTo(W * 0.6, y2 - h2 * 0.25, W * 1.05, y2 + h2 * 0.22); ctx.lineTo(W * 1.05, y2 - 10); ctx.lineTo(W * 0.05, y2 - 10); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#000'; ctx.stroke();
  ctx.fillStyle = '#16244d'; ctx.beginPath(); ctx.moveTo(fx - R * 0.9, y2 + h2 + 10); ctx.quadraticCurveTo(fx - R * 0.7, fy + R * 1.2, fx, fy + R * 1.15); ctx.quadraticCurveTo(fx + R * 1.4, fy + R * 1.2, fx + R * 1.8, y2 + h2 + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f7c9a0'; ctx.beginPath(); ctx.arc(fx, fy, R, -Math.PI * 0.8, Math.PI * 0.85); ctx.lineTo(fx - R * 1.02, fy + R * 0.25); ctx.lineTo(fx - R * 1.22, fy + R * 0.06); ctx.lineTo(fx - R * 0.98, fy - R * 0.18); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1a0f0a'; ctx.beginPath(); ctx.arc(fx + R * 0.15, fy - R * 0.12, R * 1.05, Math.PI * 0.98, Math.PI * 2.3); ctx.quadraticCurveTo(fx + R * 0.2, fy - R * 0.25, fx - R * 0.85, fy - R * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(fx + R * 1.15, fy - R * 0.05, R * 0.42, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(fx - R * 0.55, fy - R * 0.02, 5, 8, 0, 0, 7); ctx.fill();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(fx - R * 0.7, fy - R * 0.22); ctx.lineTo(fx - R * 0.38, fy - R * 0.26); ctx.stroke();
  ctx.beginPath(); ctx.arc(fx - R * 0.72, fy + R * 0.48, R * 0.12, 0.1, 1.5); ctx.stroke();
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = '#000'; rr(ctx, pad, y2, W - pad * 2, h2, 6); ctx.stroke();
  // speech bubble
  const bx = W * 0.07, by = y2 + h2 * 0.30, bw = W * 0.40, bh = h2 * 0.24;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(bx + bw / 2, by + bh / 2, bw / 2, bh / 2, 0, 0, 7); ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bw * 0.78, by + bh * 0.85); ctx.lineTo(fx - R * 1.25, fy + R * 0.15); ctx.lineTo(bx + bw * 0.6, by + bh * 0.95); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(bx + bw / 2, by + bh / 2, bw / 2 - 3, bh / 2 - 3, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#000'; ctx.font = 'italic 900 28px "Archivo Black"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Almost', bx + bw / 2, by + bh * 0.38); ctx.fillText('home...', bx + bw / 2, by + bh * 0.66); ctx.textBaseline = 'alphabetic';
}
function comicScene(ctx, W, H, t) {
  const p = P(W, H); ctx.lineJoin = 'round';
  const ink = (lw = 5) => { ctx.lineWidth = lw; ctx.strokeStyle = '#000'; ctx.stroke(); };
  const S = G.shop; ctx.fillStyle = '#ffd400'; ctx.fillRect(S.x0 * W - 200, S.y0 * H, (S.x1 - S.x0) * W + 200, (S.y1 - S.y0) * H); ctx.beginPath(); ctx.rect(S.x0 * W - 200, S.y0 * H, (S.x1 - S.x0) * W + 200, (S.y1 - S.y0) * H); ink();
  halftone(ctx, S.x0 * W - 200, S.y0 * H, (S.x1 - S.x0) * W + 200, (S.y1 - S.y0) * H, 'rgba(255,120,0,0.6)', 14, 3.5, 1);
  ctx.fillStyle = '#ff7a00'; ctx.fillRect(G.sign.x0 * W, G.sign.y0 * H, (G.sign.x1 - G.sign.x0) * W, (G.sign.y1 - G.sign.y0) * H); ctx.beginPath(); ctx.rect(G.sign.x0 * W, G.sign.y0 * H, (G.sign.x1 - G.sign.x0) * W, (G.sign.y1 - G.sign.y0) * H); ink();
  ctx.fillStyle = '#000'; ctx.font = '900 40px "Archivo Black"'; ctx.textAlign = 'center'; ctx.fillText('BAKERY', (G.sign.x0 + G.sign.x1) / 2 * W, G.sign.y1 * H - 18);
  const Wn = G.win; ctx.fillStyle = '#fff6c2'; ctx.fillRect(Wn.x0 * W, Wn.y0 * H, (Wn.x1 - Wn.x0) * W, (Wn.y1 - Wn.y0) * H); ctx.beginPath(); for (let i = 0; i <= Wn.cols; i++) { const x = (Wn.x0 + (Wn.x1 - Wn.x0) * i / Wn.cols) * W; ctx.moveTo(x, Wn.y0 * H); ctx.lineTo(x, Wn.y1 * H); } for (let i = 0; i <= Wn.rows; i++) { const y = (Wn.y0 + (Wn.y1 - Wn.y0) * i / Wn.rows) * H; ctx.moveTo(Wn.x0 * W, y); ctx.lineTo(Wn.x1 * W, y); } ink(4);
  const [lx, ly] = p(G.lantern); ctx.fillStyle = '#ff2d2d'; ctx.beginPath(); ctx.ellipse(lx, ly, 18, 24, 0, 0, 7); ctx.fill(); ink(4); ctx.beginPath(); ctx.moveTo(lx, ly - 24); ctx.lineTo(lx, ly - 46); ink(3);
  ctx.fillStyle = '#1d3c8f'; ctx.fillRect(-300, G.ground * H, W + 600, H); ctx.beginPath(); ctx.moveTo(-300, G.ground * H); ctx.lineTo(W + 300, G.ground * H); ink();
  G.puddles.forEach(([x, y, rx, ry]) => { ctx.fillStyle = '#7fb2ff'; ctx.beginPath(); ctx.ellipse(x * W, y * H, rx * W, ry * H * 1.4, 0, 0, 7); ctx.fill(); ink(4); });
  ctx.fillStyle = '#16244d'; poly(ctx, G.coat.map(p)); ctx.fill(); ink();
  ctx.beginPath(); ctx.moveTo(...p(G.legF[0])); ctx.lineTo(...p(G.legF[1])); ctx.moveTo(...p(G.legB[0])); ctx.lineTo(...p(G.legB[1])); ink(9);
  ctx.fillStyle = '#f7c9a0'; headPath(ctx, W, H); ctx.fill(); ink(4); ctx.fillStyle = '#1a0f0a'; hairPath(ctx, W, H); ctx.fill(); ink(4);
  ctx.beginPath(); ctx.moveTo(...p(G.arm[0])); ctx.lineTo(...p(G.arm[1])); ink(7);
  shaft(ctx, W, H); ink(5);
  ctx.fillStyle = '#e8132b'; umbPath(ctx, W, H); ctx.fill(); ink(6); umbRibs(ctx, W, H); ink(3);
  rain(ctx, W, H, t, { n: 50, len: 30, slant: -0.2, speed: 800, color: 'rgba(255,255,255,0.8)', width: 3, seed: 5, y0: 0.1 });
}

// ---------------- 6. Flat Poster ----------------
function s6(ctx, W, H, t) {
  const p = P(W, H);
  ctx.fillStyle = '#1f2f6e'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f4e9c8'; ctx.beginPath(); ctx.arc(...p(G.moon), 42, 0, 7); ctx.fill();
  const S = G.shop; ctx.fillStyle = '#2b3f8c'; ctx.fillRect(S.x0 * W, S.y0 * H, (S.x1 - S.x0) * W, (S.y1 - S.y0) * H);
  ctx.fillStyle = '#ff6b5b'; ctx.fillRect(G.sign.x0 * W, G.sign.y0 * H, (G.sign.x1 - G.sign.x0) * W, (G.sign.y1 - G.sign.y0) * H);
  const Wn = G.win, gw = 0.008; for (let r = 0; r < Wn.rows; r++) for (let c = 0; c < Wn.cols; c++) { ctx.fillStyle = (r + c) % 3 ? '#ffd166' : '#ffc23d'; const x0 = Wn.x0 + (Wn.x1 - Wn.x0) * c / Wn.cols, y0 = Wn.y0 + (Wn.y1 - Wn.y0) * r / Wn.rows; ctx.fillRect((x0 + gw) * W, (y0 + gw * 0.6) * H, ((Wn.x1 - Wn.x0) / Wn.cols - gw * 2) * W, ((Wn.y1 - Wn.y0) / Wn.rows - gw * 1.2) * H); }
  ctx.fillStyle = '#ff6b5b'; ctx.beginPath(); ctx.arc(...p(G.lantern), 16, 0, 7); ctx.fill();
  ctx.fillStyle = '#16204d'; ctx.fillRect(0, G.ground * H, W, H);
  G.puddles.forEach(([x, y, rx, ry]) => { ctx.fillStyle = '#2b3f8c'; ctx.beginPath(); ctx.ellipse(x * W, y * H, rx * W, ry * H * 1.3, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#4d6bd6'; ctx.beginPath(); ctx.ellipse(x * W - rx * W * 0.3, y * H - 2, rx * W * 0.35, ry * H * 0.4, 0, 0, 7); ctx.fill(); });
  ctx.fillStyle = '#ffd166'; ctx.globalAlpha = 0.25; ctx.fillRect(Wn.x0 * W, G.ground * H + 6, (Wn.x1 - Wn.x0) * W, 10); ctx.globalAlpha = 1;
  ctx.fillStyle = '#0b1233'; poly(ctx, G.coat.map(p)); ctx.fill();
  ctx.fillStyle = '#0b1233'; poly(ctx, [p([0.57, 0.778]), p([0.60, 0.778]), p([0.57, 0.845]), p([0.545, 0.845])]); ctx.fill(); poly(ctx, [p([0.635, 0.778]), p([0.662, 0.778]), p([0.69, 0.845]), p([0.665, 0.845])]); ctx.fill();
  ctx.fillStyle = '#f2b38a'; headPath(ctx, W, H); ctx.fill(); ctx.fillStyle = '#0b1233'; hairPath(ctx, W, H); ctx.fill();
  ctx.fillStyle = '#e9e9e9'; shaft(ctx, W, H); ctx.lineWidth = 4; ctx.strokeStyle = '#e9e9e9'; ctx.stroke();
  ctx.fillStyle = '#ff4f4f'; umbPath(ctx, W, H); ctx.fill();
  ctx.fillStyle = '#e0373f'; ctx.save(); umbPath(ctx, W, H); ctx.clip(); ctx.fillRect(G.umb.c[0] * W, 0, W, H); ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(200,215,255,0.5)'; ctx.lineWidth = 2; rain(ctx, W, H, t, { n: 55, len: 40, slant: -0.35, speed: 700, color: 'rgba(200,215,255,0.5)', width: 2, seed: 6 }); ctx.restore();
}

// ---------------- 7. Line Diagram ----------------
function s7(ctx, W, H, t) {
  const p = P(W, H);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(80,120,200,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = 0; x < W; x += 28) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y < H; y += 28) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
  const Wn = G.win; ctx.fillStyle = '#f5a623'; ctx.fillRect(Wn.x0 * W, Wn.y0 * H, (Wn.x1 - Wn.x0) * W, (Wn.y1 - Wn.y0) * H); ctx.fillStyle = '#ffcf4a'; ctx.fillRect(Wn.x0 * W, Wn.y0 * H, (Wn.x1 - Wn.x0) * W * 0.5, (Wn.y1 - Wn.y0) * H);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6;
  const S = G.shop; ctx.strokeRect(S.x0 * W, S.y0 * H, (S.x1 - S.x0) * W, (S.y1 - S.y0) * H); ctx.strokeRect(G.sign.x0 * W, G.sign.y0 * H, (G.sign.x1 - G.sign.x0) * W, (G.sign.y1 - G.sign.y0) * H);
  ctx.beginPath(); ctx.moveTo(0, G.ground * H); ctx.lineTo(W, G.ground * H); ctx.stroke();
  // dimension line
  ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(W * 0.92, H * 0.28); ctx.lineTo(W * 0.92, H * 0.84); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(W * 0.90, H * 0.28); ctx.lineTo(W * 0.94, H * 0.28); ctx.moveTo(W * 0.90, H * 0.84); ctx.lineTo(W * 0.94, H * 0.84); ctx.stroke();
  ctx.fillStyle = '#9ab'; ctx.font = '500 15px "DejaVu Sans Mono"'; ctx.save(); ctx.translate(W * 0.955, H * 0.56); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('h = 1.70 m', 0, 0); ctx.restore();
  // figure
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; poly(ctx, G.coat.map(p)); ctx.stroke(); headPath(ctx, W, H); ctx.stroke(); hairPath(ctx, W, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(...p(G.legF[0])); ctx.lineTo(...p(G.legF[1])); ctx.moveTo(...p(G.legB[0])); ctx.lineTo(...p(G.legB[1])); ctx.moveTo(...p(G.arm[0])); ctx.lineTo(...p(G.arm[1])); ctx.stroke();
  shaft(ctx, W, H); ctx.stroke();
  ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 2.5; umbPath(ctx, W, H); ctx.stroke(); ctx.lineWidth = 1.2; umbRibs(ctx, W, H); ctx.stroke();
  // label
  const lx = G.umb.c[0] * W - G.umb.r * W * 0.6, ly = G.umb.c[1] * H - G.umb.h * H * 1.1;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(lx, ly, 4, 0, 7); ctx.moveTo(lx, ly); ctx.lineTo(W * 0.30, H * 0.17); ctx.lineTo(W * 0.08, H * 0.17); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = '600 22px "DejaVu Sans Mono"'; ctx.textAlign = 'left'; ctx.fillText('UMBRELLA', W * 0.08, H * 0.16);
  ctx.fillStyle = '#9ab'; ctx.font = '500 14px "DejaVu Sans Mono"'; ctx.fillText('FIG. 01 — RAIN / NIGHT', W * 0.08, H * 0.06);
  G.puddles.forEach(([x, y, rx, ry]) => { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x * W, y * H, rx * W, ry * H, 0, 0, 7); ctx.stroke(); });
  // blue rain ticks bottom
  rain(ctx, W, H, t, { n: 45, len: 10, slant: 0, speed: 260, color: '#3d8bff', width: 2, seed: 8, y0: 0.74, y1: 1 });
  rain(ctx, W, H, t, { n: 30, len: 14, slant: 0, speed: 500, color: 'rgba(61,139,255,0.45)', width: 1.2, seed: 18, y0: 0, y1: 0.74 });
  // lens flare beam
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(W * 0.5, H * 0.5); ctx.rotate(-0.62);
  const g = ctx.createLinearGradient(0, -40, 0, 40); g.addColorStop(0, 'rgba(255,190,90,0)'); g.addColorStop(0.5, 'rgba(255,190,90,0.22)'); g.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(-W * 1.2, -40, W * 2.4, 80);
  ctx.fillStyle = 'rgba(255,230,180,0.5)'; ctx.fillRect(-W * 1.2, -1, W * 2.4, 2); ctx.restore();
}

// ---------------- 8. Cinematic 3D (hero) ----------------
function s8(ctx, W, H, t) {
  const p = P(W, H);
  const bg = s8.bg || (s8.bg = new OffscreenCanvas(W, H)); const b = bg.getContext('2d');
  if (!s8.done) {
    s8.done = true;
    const sky = b.createLinearGradient(0, 0, 0, H * 0.72); sky.addColorStop(0, '#05080f'); sky.addColorStop(1, '#14213a'); b.fillStyle = sky; b.fillRect(0, 0, W, H);
    const S = G.shop; const wall = b.createLinearGradient(S.x0 * W, 0, S.x1 * W, 0); wall.addColorStop(0, '#2a1d17'); wall.addColorStop(1, '#3b281d'); b.fillStyle = wall; b.fillRect(S.x0 * W, S.y0 * H, (S.x1 - S.x0) * W, (S.y1 - S.y0) * H);
    const Wn = G.win; const wg = b.createRadialGradient(W * 0.28, H * 0.53, 10, W * 0.28, H * 0.53, W * 0.3); wg.addColorStop(0, '#ffd59a'); wg.addColorStop(1, '#e98a2e'); b.fillStyle = wg; b.fillRect(Wn.x0 * W, Wn.y0 * H, (Wn.x1 - Wn.x0) * W, (Wn.y1 - Wn.y0) * H);
    b.fillStyle = '#2a1a12'; for (let i = 1; i < Wn.cols; i++) b.fillRect((Wn.x0 + (Wn.x1 - Wn.x0) * i / Wn.cols) * W - 3, Wn.y0 * H, 6, (Wn.y1 - Wn.y0) * H); for (let i = 1; i < Wn.rows; i++) b.fillRect(Wn.x0 * W, (Wn.y0 + (Wn.y1 - Wn.y0) * i / Wn.rows) * H - 3, (Wn.x1 - Wn.x0) * W, 6);
    // silhouettes inside window
    b.fillStyle = 'rgba(120,60,20,0.35)'; b.beginPath(); b.arc(W * 0.20, H * 0.56, 16, 0, 7); b.fill(); b.fillRect(W * 0.18, H * 0.575, 26, 60);
    b.fillStyle = '#1a2b4a'; b.fillRect(G.sign.x0 * W, G.sign.y0 * H, (G.sign.x1 - G.sign.x0) * W, (G.sign.y1 - G.sign.y0) * H);
    b.fillStyle = '#ffcf8a'; b.font = '600 26px Lora'; b.textAlign = 'center'; b.fillText('Tea House', (G.sign.x0 + G.sign.x1) / 2 * W, G.sign.y1 * H - 20);
    // window bloom
    b.save(); b.globalCompositeOperation = 'lighter'; const bl = b.createRadialGradient(W * 0.28, H * 0.53, 20, W * 0.28, H * 0.53, W * 0.45); bl.addColorStop(0, 'rgba(255,170,80,0.35)'); bl.addColorStop(1, 'rgba(255,170,80,0)'); b.fillStyle = bl; b.fillRect(0, 0, W, H); b.restore();
    // lantern
    const [lx, ly] = p(G.lantern); const lg = b.createRadialGradient(lx, ly, 2, lx, ly, 26); lg.addColorStop(0, '#fff0c0'); lg.addColorStop(0.5, '#ff9a3c'); lg.addColorStop(1, '#c2410c'); b.fillStyle = lg; b.beginPath(); b.ellipse(lx, ly, 20, 26, 0, 0, 7); b.fill();
    b.save(); b.globalCompositeOperation = 'lighter'; const lb = b.createRadialGradient(lx, ly, 5, lx, ly, 110); lb.addColorStop(0, 'rgba(255,150,60,0.55)'); lb.addColorStop(1, 'rgba(255,150,60,0)'); b.fillStyle = lb; b.fillRect(0, 0, W, H); b.restore();
    // ground
    const gr = b.createLinearGradient(0, G.ground * H, 0, H); gr.addColorStop(0, '#111a2b'); gr.addColorStop(1, '#070b14'); b.fillStyle = gr; b.fillRect(0, G.ground * H, W, H);
    // reflections (mirror window)
    b.save(); b.globalAlpha = 0.35; b.filter = 'blur(6px)'; b.translate(0, G.ground * H * 2); b.scale(1, -1); b.drawImage(bg, 0, 0, W, G.ground * H, 0, 0, W, G.ground * H); b.restore();
    b.filter = 'none';
    // depth-of-field: blur whole background slightly
    const tmp = new OffscreenCanvas(W, H); const tc = tmp.getContext('2d'); tc.filter = 'blur(2.5px)'; tc.drawImage(bg, 0, 0); b.clearRect(0, 0, W, H); b.drawImage(tmp, 0, 0);
  }
  ctx.drawImage(bg, 0, 0);
  // puddle glowing rings (animated)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  G.puddles.forEach(([x, y, rx, ry], i) => {
    const g = ctx.createRadialGradient(x * W, y * H, 2, x * W, y * H, rx * W); g.addColorStop(0, 'rgba(70,150,255,0.35)'); g.addColorStop(1, 'rgba(70,150,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x * W, y * H, rx * W, ry * H * 1.6, 0, 0, 7); ctx.fill();
    for (let k = 0; k < 3; k++) { const ph = ((t * 0.7 + k / 3 + i * 0.3) % 1); ctx.strokeStyle = `rgba(110,180,255,${0.7 * (1 - ph)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x * W, y * H, rx * W * ph, ry * H * 1.4 * ph, 0, 0, 7); ctx.stroke(); }
  });
  ctx.restore();
  // figure shadow + reflection
  ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#c81e2a'; ctx.filter = 'blur(10px)'; ctx.beginPath(); ctx.ellipse(G.umb.c[0] * W, H * 0.92, G.umb.r * W * 0.8, 18, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.filter = 'none';
  // coat with gradient shading
  const cg = ctx.createLinearGradient(W * 0.55, 0, W * 0.69, 0); cg.addColorStop(0, '#2a3f72'); cg.addColorStop(0.5, '#15223f'); cg.addColorStop(1, '#0a1124'); ctx.fillStyle = cg; poly(ctx, G.coat.map(p)); ctx.fill();
  ctx.strokeStyle = 'rgba(255,170,90,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...p(G.coat[0])); ctx.lineTo(...p(G.coat[5])); ctx.lineTo(...p(G.coat[4])); ctx.stroke(); // warm rim from shop
  ctx.fillStyle = '#0b0b10'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(...p(G.legF[0])); ctx.lineTo(...p(G.legF[1])); ctx.moveTo(...p(G.legB[0])); ctx.lineTo(...p(G.legB[1])); ctx.stroke();
  const [hx, hy] = p(G.head); const hg = ctx.createRadialGradient(hx - 10, hy - 6, 3, hx, hy, G.hr * W * 1.3); hg.addColorStop(0, '#f6c9a4'); hg.addColorStop(1, '#a8694a'); ctx.fillStyle = hg; headPath(ctx, W, H); ctx.fill();
  ctx.fillStyle = '#1a100c'; hairPath(ctx, W, H); ctx.fill();
  ctx.strokeStyle = '#151a28'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(...p(G.arm[0])); ctx.lineTo(...p(G.arm[1])); ctx.stroke();
  ctx.strokeStyle = '#cfcfcf'; ctx.lineWidth = 3; shaft(ctx, W, H); ctx.stroke();
  // umbrella shaded
  const u = G.umb, cx = u.c[0] * W, cy = u.c[1] * H; const ug = ctx.createRadialGradient(cx - 50, cy - 70, 10, cx, cy - 20, u.r * W * 1.2); ug.addColorStop(0, '#ff5a5f'); ug.addColorStop(0.55, '#d0182a'); ug.addColorStop(1, '#6e0812'); ctx.fillStyle = ug; umbPath(ctx, W, H); ctx.fill();
  ctx.strokeStyle = 'rgba(80,0,10,0.6)'; ctx.lineWidth = 2; umbRibs(ctx, W, H); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,190,140,0.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - u.r * W, cy); ctx.bezierCurveTo(cx - u.r * W, cy - u.h * H * 1.25, cx - u.r * W * 0.35, cy - u.h * H * 1.45, cx, cy - u.h * H * 1.42); ctx.stroke();
  // rain near (sharp) + far (blurred)
  ctx.save(); ctx.filter = 'blur(1.5px)'; rain(ctx, W, H, t, { n: 70, len: 26, slant: -0.12, speed: 800, color: 'rgba(200,220,255,0.25)', width: 1.4, seed: 3 }); ctx.restore(); ctx.filter = 'none';
  rain(ctx, W, H, t, { n: 35, len: 46, slant: -0.12, speed: 1300, color: 'rgba(230,240,255,0.5)', width: 2, seed: 13 });
  // vignette
  const v = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.25, W / 2, H * 0.55, H * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// ---------------- 9. Toy Bricks ----------------
function brick(ctx, x, y, w, h, col, stud = true) {
  ctx.fillStyle = col; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x, y, w, 2); ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(x, y + h - 2, w, 2); ctx.fillRect(x + w - 2, y, 2, h);
}
function s9(ctx, W, H, t) {
  const p = P(W, H);
  ctx.fillStyle = '#1b2436'; ctx.fillRect(0, 0, W, H);
  // brick wall
  const bw = 46, bh = 22; const cols = ['#6b2a1f', '#7a3324', '#5e241b'];
  for (let y = 0, r = 0; y < G.ground * H; y += bh, r++) for (let x = -(r % 2) * bw / 2; x < W; x += bw) brick(ctx, x, y, bw, bh, cols[(r * 7 + Math.floor(x / bw)) % 3]);
  // shop windows cream
  const Wn = G.win; ctx.fillStyle = '#3a2418'; ctx.fillRect(Wn.x0 * W - 8, Wn.y0 * H - 8, (Wn.x1 - Wn.x0) * W + 16, (Wn.y1 - Wn.y0) * H + 16);
  for (let r = 0; r < Wn.rows; r++) for (let c = 0; c < Wn.cols; c++) { const x0 = (Wn.x0 + (Wn.x1 - Wn.x0) * c / Wn.cols) * W, y0 = (Wn.y0 + (Wn.y1 - Wn.y0) * r / Wn.rows) * H; brick(ctx, x0 + 3, y0 + 3, (Wn.x1 - Wn.x0) * W / Wn.cols - 6, (Wn.y1 - Wn.y0) * H / Wn.rows - 6, '#f3e3b5'); }
  // sign tile with studs
  brick(ctx, G.sign.x0 * W, G.sign.y0 * H, (G.sign.x1 - G.sign.x0) * W, (G.sign.y1 - G.sign.y0) * H, '#2d5bd1');
  ctx.fillStyle = '#fff'; ctx.font = '900 30px "Archivo Black"'; ctx.textAlign = 'center'; ctx.fillText('TOYS', (G.sign.x0 + G.sign.x1) / 2 * W, G.sign.y1 * H - 18);
  // pavement tiles
  const ty = G.ground * H; for (let y = ty, r = 0; y < H; y += 40, r++) for (let x = 0; x < W; x += 56) { brick(ctx, x, y, 56, 40, r % 2 ? '#9fb0c4' : '#aebdcf'); ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(x + 14 + i * 28, y + 20, 9, 5, 0, 0, 7); ctx.fill(); } ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(x + 14 + i * 28, y + 18, 9, 5, 0, 0, 7); ctx.fill(); } }
  G.puddles.forEach(([x, y, rx, ry]) => { ctx.fillStyle = 'rgba(80,130,200,0.55)'; ctx.beginPath(); ctx.ellipse(x * W, y * H, rx * W, ry * H * 1.5, 0, 0, 7); ctx.fill(); });
  // minifig
  const cx = W * 0.615; const sc = W / 560;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx, H * 0.845, 60 * sc, 10 * sc, 0, 0, 7); ctx.fill();
  // legs
  brick(ctx, cx - 34 * sc, H * 0.70, 68 * sc, 18 * sc, '#1a1a1a'); brick(ctx, cx - 32 * sc, H * 0.716, 30 * sc, H * 0.122, '#111'); brick(ctx, cx + 2 * sc, H * 0.716, 30 * sc, H * 0.122, '#1c1c1c');
  // torso trapezoid
  ctx.fillStyle = '#1e4fd6'; ctx.beginPath(); ctx.moveTo(cx - 26 * sc, H * 0.53); ctx.lineTo(cx + 26 * sc, H * 0.53); ctx.lineTo(cx + 36 * sc, H * 0.70); ctx.lineTo(cx - 36 * sc, H * 0.70); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(cx + 10 * sc, H * 0.53); ctx.lineTo(cx + 26 * sc, H * 0.53); ctx.lineTo(cx + 36 * sc, H * 0.70); ctx.lineTo(cx + 16 * sc, H * 0.70); ctx.fill();
  ctx.fillStyle = '#163ba3'; ctx.fillRect(cx - 2 * sc, H * 0.55, 4 * sc, H * 0.14); ctx.fillStyle = '#ffd23f'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx - 8 * sc, H * (0.57 + i * 0.04), 3 * sc, 0, 7); ctx.fill(); }
  // arm + claw hand holding umbrella
  ctx.fillStyle = '#1e4fd6'; ctx.save(); ctx.translate(cx + 22 * sc, H * 0.545); ctx.rotate(-0.35); ctx.fillRect(0, 0, 18 * sc, 48 * sc); ctx.restore();
  const hx = G.hand[0] * W + 4, hy = H * 0.585; ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(hx, hy, 10 * sc, 0.6, Math.PI * 2 - 0.6); ctx.lineTo(hx, hy); ctx.fill();
  // neck + head
  ctx.fillStyle = '#e8bc2e'; ctx.fillRect(cx - 10 * sc, H * 0.515, 20 * sc, 10 * sc);
  const hy0 = H * 0.405, hh = H * 0.11; const hg = ctx.createLinearGradient(cx - 30 * sc, 0, cx + 30 * sc, 0); hg.addColorStop(0, '#ffd84a'); hg.addColorStop(1, '#d9a91c'); ctx.fillStyle = hg; rr(ctx, cx - 28 * sc, hy0, 56 * sc, hh, 12 * sc); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx - 14 * sc, hy0 + hh * 0.42, 4 * sc, 0, 7); ctx.fill(); ctx.lineWidth = 3 * sc; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.arc(cx - 16 * sc, hy0 + hh * 0.62, 9 * sc, 0.3, 1.8); ctx.stroke();
  ctx.fillStyle = '#121212'; ctx.beginPath(); ctx.moveTo(cx - 32 * sc, hy0 + hh * 0.35); ctx.quadraticCurveTo(cx - 34 * sc, hy0 - 22 * sc, cx, hy0 - 22 * sc); ctx.quadraticCurveTo(cx + 40 * sc, hy0 - 20 * sc, cx + 36 * sc, hy0 + hh * 0.9); ctx.lineTo(cx + 18 * sc, hy0 + hh * 0.9); ctx.quadraticCurveTo(cx + 18 * sc, hy0 + 8 * sc, cx - 32 * sc, hy0 + hh * 0.35); ctx.fill();
  // umbrella: flat triangular roof brick
  const u = G.umb, ux = u.c[0] * W, uy = u.c[1] * H - 10, R = u.r * W;
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 6 * sc; ctx.beginPath(); ctx.moveTo(ux, uy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = '#e63322'; ctx.beginPath(); ctx.moveTo(ux - R, uy + 6); ctx.lineTo(ux, uy - u.h * H * 1.3); ctx.lineTo(ux + R, uy + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b8241a'; ctx.beginPath(); ctx.moveTo(ux, uy - u.h * H * 1.3); ctx.lineTo(ux + R, uy + 6); ctx.lineTo(ux + R, uy + 20); ctx.lineTo(ux, uy + 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c92a1c'; ctx.fillRect(ux - R, uy + 6, R, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = 0; i < 3; i++) { ctx.fillRect(ux - R + 24 + i * 34, uy - 4 - i * 20, 70 - i * 18, 3); }
  ctx.fillStyle = '#ff5a48'; rr(ctx, ux - 12, uy - u.h * H * 1.3 - 12, 24, 14, 4); ctx.fill();
  rain(ctx, W, H, t, { n: 65, len: 34, slant: -0.3, speed: 750, color: 'rgba(255,255,255,0.55)', width: 1.6, seed: 10 });
}

// ---------------- 10. Soft 3D ----------------
function s10(ctx, W, H, t) {
  const p = P(W, H);
  const bg = s10.bg || (s10.bg = new OffscreenCanvas(W, H)); const b = bg.getContext('2d');
  if (!s10.done) {
    s10.done = true;
    const g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f6b38a'); g.addColorStop(0.6, '#f3a07a'); g.addColorStop(1, '#e88a6a'); b.fillStyle = g; b.fillRect(0, 0, W, H);
    b.filter = 'blur(18px)';
    const S = G.shop; b.fillStyle = '#d9785a'; rr(b, S.x0 * W, S.y0 * H, (S.x1 - S.x0) * W, (S.y1 - S.y0) * H, 30); b.fill();
    const Wn = G.win; b.fillStyle = '#ffe2b0'; rr(b, Wn.x0 * W, Wn.y0 * H, (Wn.x1 - Wn.x0) * W, (Wn.y1 - Wn.y0) * H, 24); b.fill();
    const R = rng(20); for (let i = 0; i < 14; i++) { b.fillStyle = `rgba(255,${220 + R() * 35 | 0},${170 + R() * 50 | 0},${0.35 + R() * 0.3})`; b.beginPath(); b.arc(R() * W, R() * H * 0.65, 14 + R() * 30, 0, 7); b.fill(); }
    b.fillStyle = '#c8705a'; b.fillRect(0, G.ground * H, W, H);
    b.filter = 'none';
    const gr = b.createLinearGradient(0, G.ground * H, 0, H); gr.addColorStop(0, 'rgba(210,120,95,0.6)'); gr.addColorStop(1, 'rgba(190,100,85,0.9)'); b.fillStyle = gr; b.fillRect(0, G.ground * H, W, H);
    G.puddles.forEach(([x, y, rx, ry]) => { const pg = b.createRadialGradient(x * W, y * H, 2, x * W, y * H, rx * W); pg.addColorStop(0, 'rgba(255,220,190,0.6)'); pg.addColorStop(1, 'rgba(255,220,190,0)'); b.fillStyle = pg; b.beginPath(); b.ellipse(x * W, y * H, rx * W, ry * H * 1.5, 0, 0, 7); b.fill(); });
  }
  ctx.drawImage(bg, 0, 0);
  // soft shadow
  ctx.save(); ctx.filter = 'blur(12px)'; ctx.fillStyle = 'rgba(110,40,30,0.45)'; ctx.beginPath(); ctx.ellipse(W * 0.64, H * 0.85, W * 0.2, 16, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.filter = 'none';
  // legs rounded
  ctx.lineCap = 'round'; ctx.strokeStyle = '#3a2f3a'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(...p(G.legF[0])); ctx.lineTo(...p(G.legF[1])); ctx.moveTo(...p(G.legB[0])); ctx.lineTo(...p(G.legB[1])); ctx.stroke();
  // coat matte rounded
  ctx.save(); ctx.lineJoin = 'round'; const cg = ctx.createLinearGradient(W * 0.54, H * 0.47, W * 0.70, H * 0.78); cg.addColorStop(0, '#3d4f86'); cg.addColorStop(0.55, '#1f2b55'); cg.addColorStop(1, '#141b38'); ctx.fillStyle = cg; ctx.strokeStyle = cg; ctx.lineWidth = 22; poly(ctx, G.coat.map(p)); ctx.stroke(); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#25305c'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(...p(G.arm[0])); ctx.lineTo(...p(G.arm[1])); ctx.stroke();
  // head clay
  const [hx, hy] = p(G.head), hr = G.hr * W * 1.15; const hg = ctx.createRadialGradient(hx - hr * 0.4, hy - hr * 0.4, 2, hx, hy, hr * 1.2); hg.addColorStop(0, '#ffe0c8'); hg.addColorStop(1, '#d9946f'); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(hx - hr * 0.95, hy + hr * 0.08, hr * 0.2, 0, 7); ctx.fill();
  const hairG = ctx.createRadialGradient(hx, hy - hr, 2, hx + hr * 0.3, hy, hr * 1.4); hairG.addColorStop(0, '#5a3a2e'); hairG.addColorStop(1, '#2a1a16'); ctx.fillStyle = hairG; ctx.beginPath(); ctx.arc(hx + hr * 0.15, hy - hr * 0.1, hr * 1.04, Math.PI * 0.95, Math.PI * 2.3); ctx.quadraticCurveTo(hx + hr * 0.2, hy - hr * 0.3, hx - hr * 0.9, hy - hr * 0.4); ctx.fill(); ctx.beginPath(); ctx.arc(hx + hr * 1.15, hy - hr * 0.1, hr * 0.45, 0, 7); ctx.fill();
  ctx.fillStyle = '#2a1a16'; ctx.beginPath(); ctx.arc(hx - hr * 0.5, hy, 3.2, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(240,120,110,0.45)'; ctx.beginPath(); ctx.arc(hx - hr * 0.35, hy + hr * 0.35, hr * 0.18, 0, 7); ctx.fill();
  // conical umbrella with spokes
  const u = G.umb, cx = u.c[0] * W, cy = u.c[1] * H + 4, R = u.r * W, top = cy - u.h * H * 1.5;
  ctx.strokeStyle = '#efe6e0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, top - 10); ctx.lineTo(cx, cy); ctx.lineTo(G.hand[0] * W, G.hand[1] * H + 8); ctx.stroke();
  const ug = ctx.createLinearGradient(cx - R, top, cx + R, cy); ug.addColorStop(0, '#ff6b6b'); ug.addColorStop(0.5, '#e23b3b'); ug.addColorStop(1, '#a8202a'); ctx.fillStyle = ug;
  ctx.beginPath(); ctx.moveTo(cx, top); ctx.quadraticCurveTo(cx - R * 0.55, cy - 25, cx - R, cy); ctx.quadraticCurveTo(cx, cy + 22, cx + R, cy); ctx.quadraticCurveTo(cx + R * 0.55, cy - 25, cx, top); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,220,0.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = -3; i <= 3; i++) { const x = cx + R * i / 3.2; ctx.moveTo(cx, top); ctx.quadraticCurveTo(cx + (x - cx) * 0.55, cy - 20, x, cy + 14 * Math.cos(i / 3.2 * Math.PI / 2)); } ctx.stroke();
  // rain specks
  const Rr = rng(77); ctx.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 90; i++) { const x = Rr() * W, y = (Rr() * H + t * 220 * (0.7 + Rr() * 0.6)) % H; ctx.beginPath(); ctx.arc(x, y, 1.2 + Rr() * 1.6, 0, 7); ctx.fill(); }
}

const STYLES = [
  { name: '8-Bit Quest', pill: 'Fun retro pixel game', fn: s1 },
  { name: 'Chalk Doodle', pill: 'Classroom blackboard aesthetic', fn: s2 },
  { name: 'Golden Neon', pill: 'Clean glowing lines on dark', fn: s3 },
  { name: 'Retro Console', pill: 'Pure classic low-poly gaming feel', fn: s4 },
  { name: 'Pop Comic', pill: 'Comic panels + speech bubbles', fn: s5 },
  { name: 'Flat Poster', pill: 'Minimal, bold, super clean', fn: s6 },
  { name: 'Line Diagram', pill: 'Technical blueprint look', fn: s7 },
  { name: 'Cinematic 3D', pill: 'Lighting + rain', fn: s8 },
  { name: 'Toy Bricks', pill: 'LEGO-style animation', fn: s9 },
  { name: 'Soft 3D', pill: 'Smooth, cozy, matte 3D finish', fn: s10 },
];
