// ==========================================================
// VIDEO PROMO 9:16 — Marca personal Alejandra Gómez Gutiérrez
// Mismo esquema del promo de Bitaxus (Remotion), hecho en canvas
// para que viva dentro del tablero sin compilar nada.
// ==========================================================

const VW = 1080;
const VH = 1920;
const VFPS = 30;
const VTRANS = 0.45; // segundos de transición entre escenas
const VSTORE = 'agg_promo_v1';

const PROMO_DEFAULTS = {
  acento: '#00b7cb',
  escena1: {
    frase: 'ARQUITECTURA · TECNOLOGÍA · LIFESTYLE',
    linea1: 'Diseño espacios',
    linea2: 'que se construyen bien.',
    pregunta: '¿Tu proyecto ya tiene coordinación digital?'
  },
  escena2: {
    titular: 'Así empieza cada proyecto',
    contacto: 'Alejandra · Arquitecta',
    mensajes: [
      { quien: 'cliente', texto: 'Hola Alejandra, tenemos un edificio de 12 pisos y los planos no cuadran 😩', hora: '9:41' },
      { quien: 'yo', texto: 'Lo modelamos en BIM y encontramos los choques antes de obra.', hora: '9:42' },
      { quien: 'cliente', texto: '¿Y cuánto tiempo toma?', hora: '9:42' },
      { quien: 'yo', texto: 'Días, no meses. Y te ahorras la demolición ✨', hora: '9:43' }
    ]
  },
  escena3: {
    titular: 'Lo que hago por tu proyecto',
    beneficios: [
      { icono: '🏛️', titulo: 'Modelado BIM', texto: 'Arquitectura, estructura y redes en un solo modelo.' },
      { icono: '🔍', titulo: 'Detección de interferencias', texto: 'Los choques se resuelven en pantalla, no en obra.' },
      { icono: '🎬', titulo: 'Renders y recorridos 4K', texto: 'Para vender el proyecto antes de construirlo.' }
    ]
  },
  escena4: {
    titular1: 'Errores evitados',
    titular2: 'antes de construir',
    prefijo: '',
    numero: 47,
    sufijo: ' interferencias',
    nota: 'Edificio de 12 pisos · coordinación BIM'
  },
  escena5: {
    nombre1: 'ALEJANDRA',
    nombre2: 'GÓMEZ GUTIÉRREZ',
    frase: 'Arquitectura, tecnología y lifestyle.',
    boton: 'Escríbeme “PROYECTO”',
    web: 'Arquitectura · BIM · Visualización'
  },
  duracion: { escena1: 3.5, escena2: 6, escena3: 5, escena4: 4, escena5: 4.5 }
};

let promo = loadPromo();
let promoPhoto = null;
const promoLogo = new Image();
promoLogo.src = 'assets/icono-turquesa.png';
const promoLogoWhite = new Image();
promoLogoWhite.src = 'assets/icono-blanco.png';

let vTime = 0;
let vPlaying = false;
let vLastTs = 0;
let vRecording = null;

function loadPromo() {
  try {
    const saved = JSON.parse(localStorage.getItem(VSTORE));
    if (saved) return deepMerge(structuredClone(PROMO_DEFAULTS), saved);
  } catch (e) { /* sin almacenamiento: usar valores por defecto */ }
  return structuredClone(PROMO_DEFAULTS);
}

function deepMerge(base, extra) {
  for (const k of Object.keys(extra || {})) {
    if (Array.isArray(extra[k])) base[k] = extra[k];
    else if (extra[k] && typeof extra[k] === 'object') base[k] = deepMerge(base[k] || {}, extra[k]);
    else base[k] = extra[k];
  }
  return base;
}

function savePromo() {
  try { localStorage.setItem(VSTORE, JSON.stringify(promo)); } catch (e) { /* ignorar */ }
}

// ---------- Línea de tiempo ----------
const SCENES = ['escena1', 'escena2', 'escena3', 'escena4', 'escena5'];

function sceneWindows() {
  let start = 0;
  return SCENES.map((key, i) => {
    const dur = Math.max(1, Number(promo.duracion[key]) || 1);
    const w = { key, start, end: start + dur, dur };
    start += dur - VTRANS;
    return w;
  });
}

function promoTotal() {
  const w = sceneWindows();
  return w[w.length - 1].end;
}

// ---------- Utilidades de animación ----------
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const easeInOut = (v) => { v = clamp01(v); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const easeBack = (v) => { v = clamp01(v); const c = 1.6; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); };
const prog = (t, a, d) => clamp01((t - a) / d);

function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function glassPanel(ctx, x, y, w, h, r, accent, strong) {
  ctx.save();
  rr(ctx, x, y, w, h, r);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, strong ? hexToRgba(accent, 0.22) : 'rgba(255,255,255,0.09)');
  g.addColorStop(1, strong ? hexToRgba(accent, 0.08) : 'rgba(255,255,255,0.03)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = strong ? hexToRgba(accent, 0.7) : 'rgba(255,255,255,0.16)';
  ctx.stroke();
  // brillo superior
  ctx.clip();
  const s = ctx.createLinearGradient(x, y, x, y + h * 0.4);
  s.addColorStop(0, 'rgba(255,255,255,0.10)');
  s.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = s;
  ctx.fillRect(x, y, w, h * 0.4);
  ctx.restore();
}

// Texto que entra palabra por palabra desde abajo.
function revealText(ctx, text, cx, y, t, opts) {
  const { font, color, maxWidth = 900, lineHeight = 100, delay = 0, stagger = 0.06, align = 'center' } = opts;
  ctx.font = font;
  ctx.textBaseline = 'alphabetic';
  const lines = wrapLines(ctx, text, maxWidth);
  let idx = 0;
  lines.forEach((line, li) => {
    const words = line.split(' ');
    const lineW = ctx.measureText(line).width;
    let x = align === 'center' ? cx - lineW / 2 : cx;
    const ly = y + li * lineHeight;
    words.forEach((w) => {
      const p = easeOut(prog(t, delay + idx * stagger, 0.55));
      ctx.save();
      ctx.globalAlpha *= p;
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.fillText(w, x, ly + (1 - p) * 50);
      ctx.restore();
      x += ctx.measureText(w + ' ').width;
      idx++;
    });
  });
  return lines.length;
}

// ---------- Fondo ----------
function drawBackground(ctx, t, accent) {
  ctx.fillStyle = '#06080a';
  ctx.fillRect(0, 0, VW, VH);

  const orbs = [
    { x: 0.15 + 0.06 * Math.sin(t * 0.4), y: 0.12 + 0.04 * Math.cos(t * 0.3), r: 820, a: 0.42 },
    { x: 0.92 + 0.05 * Math.cos(t * 0.35), y: 0.62 + 0.05 * Math.sin(t * 0.28), r: 760, a: 0.30 },
    { x: 0.35 + 0.08 * Math.sin(t * 0.22), y: 1.02, r: 900, a: 0.26 }
  ];
  for (const o of orbs) {
    const g = ctx.createRadialGradient(o.x * VW, o.y * VH, 0, o.x * VW, o.y * VH, o.r);
    g.addColorStop(0, hexToRgba(accent, o.a));
    g.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VW, VH);
  }

  // rejilla de puntos (blueprint)
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  const off = (t * 6) % 54;
  for (let x = 27; x < VW; x += 54) {
    for (let y = 27 - off; y < VH; y += 54) {
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
  }

  // viñeta
  const v = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VH * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, VW, VH);
}

function drawLogo(ctx, img, cx, cy, h, alpha) {
  if (!img.complete || !img.naturalWidth) return;
  const w = h * (img.naturalWidth / img.naturalHeight);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

function drawCover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * s;
  const ih = img.naturalHeight * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

// ---------- Escenas ----------
function sceneHook(ctx, t, d, p, accent) {
  if (promoPhoto) {
    ctx.save();
    ctx.globalAlpha *= 0.35 * easeOut(prog(t, 0, 1));
    const z = 1.08 - 0.06 * clamp01(t / d);
    ctx.translate(VW / 2, VH / 2);
    ctx.scale(z, z);
    drawCover(ctx, promoPhoto, -VW / 2, -VH / 2, VW, VH);
    ctx.restore();
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, 'rgba(6,8,10,0.6)');
    g.addColorStop(0.5, 'rgba(6,8,10,0.2)');
    g.addColorStop(1, 'rgba(6,8,10,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VW, VH);
  }

  drawLogo(ctx, promoLogo, VW / 2, 330, 150, easeOut(prog(t, 0, 0.6)));

  // kicker en pastilla de vidrio
  ctx.font = '600 28px Montserrat';
  const kw = ctx.measureText(p.frase).width + 70;
  const kp = easeOut(prog(t, 0.15, 0.6));
  ctx.save();
  ctx.globalAlpha *= kp;
  glassPanel(ctx, VW / 2 - kw / 2, 520 + (1 - kp) * 20, kw, 64, 32, accent, false);
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.frase, VW / 2, 553 + (1 - kp) * 20);
  ctx.restore();

  const n1 = revealText(ctx, p.linea1, VW / 2, 820, t, { font: '400 92px Michroma', color: '#ffffff', maxWidth: 940, lineHeight: 120, delay: 0.35 });
  const y2 = 820 + n1 * 120 + 20;
  const n2 = revealText(ctx, p.linea2, VW / 2, y2, t, { font: '400 92px Michroma', color: accent, maxWidth: 940, lineHeight: 120, delay: 0.75 });

  // subrayado que crece
  const lp = easeInOut(prog(t, 1.3, 0.7));
  const ly = y2 + (n2 - 1) * 120 + 60;
  ctx.fillStyle = accent;
  ctx.fillRect(VW / 2 - 220 * lp, ly, 440 * lp, 6);

  ctx.save();
  ctx.globalAlpha *= easeOut(prog(t, 1.7, 0.6));
  ctx.font = '500 44px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  wrapLines(ctx, p.pregunta, 860).forEach((l, i) => ctx.fillText(l, VW / 2, ly + 160 + i * 62));
  ctx.restore();
}

function sceneChat(ctx, t, d, p, accent) {
  revealText(ctx, p.titular, VW / 2, 250, t, { font: '400 62px Michroma', color: '#ffffff', maxWidth: 940, lineHeight: 84, delay: 0.05 });

  // teléfono
  const pp = easeBack(prog(t, 0.2, 0.8));
  const pw = 760, ph = 1380, px = (VW - pw) / 2, py = 420 + (1 - pp) * 300;
  ctx.save();
  ctx.globalAlpha *= clamp01(pp * 1.4);
  ctx.shadowColor = hexToRgba(accent, 0.45);
  ctx.shadowBlur = 90;
  rr(ctx, px, py, pw, ph, 80);
  ctx.fillStyle = '#0d1114';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.stroke();

  // pantalla
  const sx = px + 26, sy = py + 26, sw = pw - 52, sh = ph - 52;
  ctx.save();
  rr(ctx, sx, sy, sw, sh, 58);
  ctx.clip();
  ctx.fillStyle = '#0a0e11';
  ctx.fillRect(sx, sy, sw, sh);

  // cabecera
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(sx, sy, sw, 170);
  ctx.beginPath();
  ctx.arc(sx + 90, sy + 100, 40, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(accent, 0.18);
  ctx.fill();
  drawLogo(ctx, promoLogo, sx + 90, sy + 100, 50, 1);
  ctx.fillStyle = '#fff';
  ctx.font = '600 32px Montserrat';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.contacto, sx + 150, sy + 88);
  ctx.fillStyle = accent;
  ctx.font = '500 24px Montserrat';
  ctx.fillText('en línea', sx + 150, sy + 124);

  // mensajes
  const msgs = p.mensajes || [];
  const startT = 0.9;
  const step = Math.max(0.6, (d - startT - 1.2) / Math.max(1, msgs.length));
  let y = sy + 220;
  msgs.forEach((m, i) => {
    const appear = startT + i * step;
    const mine = m.quien !== 'cliente';
    ctx.font = '500 31px Montserrat';
    const lines = wrapLines(ctx, m.texto, sw * 0.62);
    const bw = Math.min(sw * 0.74, Math.max(...lines.map(l => ctx.measureText(l).width)) + 64);
    const bh = lines.length * 42 + 66;
    const bx = mine ? sx + sw - bw - 30 : sx + 30;

    // "escribiendo..." antes de cada mensaje
    const typingP = prog(t, appear - 0.45, 0.45);
    if (typingP > 0 && typingP < 1 && t < appear) {
      const tx = mine ? sx + sw - 150 : sx + 30;
      rr(ctx, tx, y, 120, 64, 32);
      ctx.fillStyle = mine ? hexToRgba(accent, 0.35) : 'rgba(255,255,255,0.1)';
      ctx.fill();
      for (let k = 0; k < 3; k++) {
        const bounce = Math.sin(t * 12 - k * 0.8) * 5;
        ctx.beginPath();
        ctx.arc(tx + 36 + k * 24, y + 32 + bounce, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fill();
      }
    }

    const ap = easeBack(prog(t, appear, 0.4));
    if (ap <= 0) return;
    ctx.save();
    ctx.globalAlpha *= clamp01(ap * 1.5);
    const ox = mine ? bx + bw : bx;
    ctx.translate(ox, y + bh / 2);
    ctx.scale(0.6 + 0.4 * ap, 0.6 + 0.4 * ap);
    ctx.translate(-ox, -(y + bh / 2));
    rr(ctx, bx, y, bw, bh, 30);
    if (mine) {
      const g = ctx.createLinearGradient(bx, y, bx + bw, y + bh);
      g.addColorStop(0, accent);
      g.addColorStop(1, hexToRgba(accent, 0.7));
      ctx.fillStyle = g;
    } else ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.fillStyle = mine ? '#04181b' : '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    lines.forEach((l, li) => ctx.fillText(l, bx + 32, y + 52 + li * 42));
    ctx.font = '500 21px Montserrat';
    ctx.fillStyle = mine ? 'rgba(4,24,27,0.6)' : 'rgba(255,255,255,0.45)';
    ctx.textAlign = 'right';
    ctx.fillText(m.hora || '', bx + bw - 26, y + bh - 18);
    ctx.restore();
    y += bh + 26;
  });
  ctx.restore(); // pantalla
  ctx.restore(); // teléfono
}

function sceneFeatures(ctx, t, d, p, accent) {
  const n = revealText(ctx, p.titular, VW / 2, 330, t, { font: '400 70px Michroma', color: '#ffffff', maxWidth: 920, lineHeight: 96, delay: 0.05 });
  const list = p.beneficios || [];
  const cardH = 330, gap = 46;
  const top = 330 + n * 96 + 90;
  list.forEach((b, i) => {
    const cp = easeOut(prog(t, 0.5 + i * 0.35, 0.7));
    if (cp <= 0) return;
    const x = 90 + (1 - cp) * (i % 2 ? 300 : -300);
    const y = top + i * (cardH + gap);
    ctx.save();
    ctx.globalAlpha *= cp;
    glassPanel(ctx, x, y, VW - 180, cardH, 40, accent, i === 0 && false);
    // número + ícono
    ctx.fillStyle = hexToRgba(accent, 0.16);
    rr(ctx, x + 50, y + 50, 130, 130, 32);
    ctx.fill();
    ctx.font = '72px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(b.icono || '•', x + 115, y + 118);
    ctx.font = '400 26px Michroma';
    ctx.fillStyle = accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('0' + (i + 1), x + 50, y + 260);
    ctx.font = '700 46px Montserrat';
    ctx.fillStyle = '#fff';
    const tl = wrapLines(ctx, b.titulo, VW - 180 - 290);
    tl.slice(0, 2).forEach((l, li) => ctx.fillText(l, x + 220, y + 100 + li * 54));
    ctx.font = '500 32px Montserrat';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    wrapLines(ctx, b.texto, VW - 180 - 290).slice(0, 3).forEach((l, li) => ctx.fillText(l, x + 220, y + 100 + tl.length * 54 + 14 + li * 44));
    // barra de acento
    ctx.fillStyle = accent;
    ctx.fillRect(x, y + 70, 6, cardH - 140);
    ctx.restore();
  });
}

function sceneNumber(ctx, t, d, p, accent) {
  const n1 = revealText(ctx, p.titular1, VW / 2, 560, t, { font: '400 74px Michroma', color: '#ffffff', maxWidth: 940, lineHeight: 100, delay: 0.05 });
  revealText(ctx, p.titular2, VW / 2, 560 + n1 * 100 + 20, t, { font: '400 74px Michroma', color: 'rgba(255,255,255,0.55)', maxWidth: 940, lineHeight: 100, delay: 0.3 });

  // anillo de progreso
  const rp = easeInOut(prog(t, 0.5, 1.8));
  const cx = VW / 2, cy = 1120, r = 250;
  ctx.lineWidth = 18;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.lineCap = 'round';
  ctx.shadowColor = accent;
  ctx.shadowBlur = 40;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rp);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineCap = 'butt';

  const val = Math.round((Number(p.numero) || 0) * rp);
  ctx.save();
  ctx.globalAlpha *= easeOut(prog(t, 0.4, 0.5));
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.font = '400 150px Michroma';
  ctx.fillText(`${p.prefijo || ''}${val.toLocaleString('es-CO')}`, cx, cy - 10);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha *= easeOut(prog(t, 1.4, 0.6));
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = '700 54px Montserrat';
  ctx.fillText((p.sufijo || '').trim(), cx, cy + r + 130);
  ctx.font = '500 36px Montserrat';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  wrapLines(ctx, p.nota, 860).forEach((l, i) => ctx.fillText(l, cx, cy + r + 210 + i * 50));
  ctx.restore();
}

function sceneCta(ctx, t, d, p, accent) {
  // logo grande con halo
  const lp = easeBack(prog(t, 0.05, 0.9));
  const halo = ctx.createRadialGradient(VW / 2, 600, 0, VW / 2, 600, 420);
  halo.addColorStop(0, hexToRgba(accent, 0.35 * lp));
  halo.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 100, VW, 1000);

  if (promoPhoto) {
    const pr = easeOut(prog(t, 0.05, 0.8));
    ctx.save();
    ctx.globalAlpha *= pr;
    ctx.beginPath();
    ctx.arc(VW / 2, 600, 250, 0, Math.PI * 2);
    ctx.clip();
    drawCover(ctx, promoPhoto, VW / 2 - 250, 350, 500, 500);
    ctx.restore();
    ctx.lineWidth = 8;
    ctx.strokeStyle = hexToRgba(accent, pr);
    ctx.beginPath();
    ctx.arc(VW / 2, 600, 254, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(VW / 2 + 190, 790);
    ctx.scale(lp, lp);
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#06080a';
    ctx.fill();
    drawLogo(ctx, promoLogo, 0, 0, 90, 1);
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(VW / 2, 600);
    ctx.scale(lp, lp);
    drawLogo(ctx, promoLogo, 0, 0, 440, 1);
    ctx.restore();
  }

  // nombre con espaciado ancho
  const np = easeOut(prog(t, 0.6, 0.7));
  ctx.save();
  ctx.globalAlpha *= np;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = '400 84px Michroma';
  fitText(ctx, p.nombre1, 960, 84);
  ctx.fillText(p.nombre1, VW / 2, 1010 + (1 - np) * 30);
  ctx.fillStyle = accent;
  ctx.font = '400 50px Michroma';
  fitText(ctx, p.nombre2, 960, 50);
  ctx.fillText(p.nombre2, VW / 2, 1090 + (1 - np) * 30);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha *= easeOut(prog(t, 1.0, 0.6));
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '500 42px Montserrat';
  wrapLines(ctx, p.frase, 880).forEach((l, i) => ctx.fillText(l, VW / 2, 1230 + i * 58));
  ctx.restore();

  // botón de vidrio con pulso
  const bp = easeBack(prog(t, 1.3, 0.6));
  if (bp > 0) {
    ctx.font = '700 44px Montserrat';
    const bw = Math.min(940, ctx.measureText(p.boton).width + 140);
    const pulse = 1 + 0.025 * Math.sin(t * 5) * clamp01(t - 2);
    ctx.save();
    ctx.translate(VW / 2, 1440);
    ctx.scale(bp * pulse, bp * pulse);
    ctx.shadowColor = hexToRgba(accent, 0.6);
    ctx.shadowBlur = 50;
    glassPanel(ctx, -bw / 2, -60, bw, 120, 60, accent, true);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.boton, 0, 2);
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha *= easeOut(prog(t, 1.7, 0.6));
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '600 32px Montserrat';
  ctx.fillText(p.web, VW / 2, 1620);
  ctx.restore();
}

function fitText(ctx, text, maxW, size) {
  const w = ctx.measureText(text).width;
  if (w > maxW) ctx.font = ctx.font.replace(`${size}px`, `${Math.floor(size * maxW / w)}px`);
}

const SCENE_DRAW = { escena1: sceneHook, escena2: sceneChat, escena3: sceneFeatures, escena4: sceneNumber, escena5: sceneCta };

function drawPromoFrame(ctx, t) {
  const accent = promo.acento || '#00b7cb';
  drawBackground(ctx, t, accent);
  const wins = sceneWindows();
  wins.forEach((w, i) => {
    if (t < w.start || t > w.end) return;
    const lt = t - w.start;
    const fadeIn = i === 0 ? 1 : easeInOut(lt / VTRANS);
    const fadeOut = i === wins.length - 1 ? 1 : easeInOut((w.end - t) / VTRANS);
    const a = Math.min(fadeIn, fadeOut);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    // entra desde abajo, sale hacia arriba
    const dy = (1 - fadeIn) * 120 - (1 - fadeOut) * 120;
    ctx.translate(0, dy);
    SCENE_DRAW[w.key](ctx, lt, w.dur, promo[w.key], accent);
    ctx.restore();
  });
}

// ---------- Reproductor ----------
function vCanvas() { return document.getElementById('promoCanvas'); }

function renderPromo() {
  const c = vCanvas();
  if (!c) return;
  drawPromoFrame(c.getContext('2d'), vTime);
  const total = promoTotal();
  const scrub = document.getElementById('promoScrub');
  if (scrub) { scrub.max = total; scrub.value = vTime; }
  const lbl = document.getElementById('promoTimeLabel');
  if (lbl) lbl.textContent = `${vTime.toFixed(1)} s / ${total.toFixed(1)} s`;
  document.querySelectorAll('.v-scene-chip').forEach((chip, i) => {
    const w = sceneWindows()[i];
    chip.classList.toggle('active', vTime >= w.start && vTime < w.end - VTRANS / 2);
  });
}

function promoLoop(ts) {
  if (!vPlaying) return;
  if (!vLastTs) vLastTs = ts;
  vTime += (ts - vLastTs) / 1000;
  vLastTs = ts;
  const total = promoTotal();
  if (vTime >= total) {
    if (vRecording) { vTime = total; renderPromo(); stopPromoRecording(); return; }
    vTime = 0;
  }
  renderPromo();
  requestAnimationFrame(promoLoop);
}

function togglePromoPlay(force) {
  vPlaying = typeof force === 'boolean' ? force : !vPlaying;
  const btn = document.getElementById('promoPlayBtn');
  if (btn) btn.textContent = vPlaying ? '❚❚ Pausa' : '▶ Reproducir';
  if (vPlaying) { vLastTs = 0; requestAnimationFrame(promoLoop); }
}

function scrubPromo(v) {
  togglePromoPlay(false);
  vTime = Number(v);
  renderPromo();
}

function jumpToScene(i) {
  togglePromoPlay(false);
  vTime = sceneWindows()[i].start + (i === 0 ? 0 : VTRANS);
  renderPromo();
}

// ---------- Exportar video ----------
function pickMime() {
    // H.264 Main 4.0: el nivel 3.0 (42E01E) no admite 1080×1920 y graba vacío.
  const opts = ['video/mp4;codecs=avc1.4d0028', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return opts.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
}

function exportPromoVideo() {
  if (vRecording) return;
  const c = vCanvas();
  if (!c.captureStream || !window.MediaRecorder) {
    showToast('Tu navegador no permite exportar video. Usa Chrome o Edge.');
    return;
  }
  const mime = pickMime();
  const stream = c.captureStream(VFPS);
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 12_000_000 } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  rec.onstop = () => {
    const type = rec.mimeType || mime || 'video/webm';
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(chunks, { type });
    if (!blob.size) {
      setExportUI(false);
      showToast('No se pudo grabar el video en este navegador. Prueba con Chrome o Edge.');
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `promo-alejandra-gomez-gutierrez.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    setExportUI(false);
    showToast(`Video descargado (.${ext})`);
  };
  vRecording = rec;
  setExportUI(true);
  togglePromoPlay(false);
  vTime = 0;
  renderPromo();
  // El codificador tarda ~1,5 s en arrancar y se come el comienzo del video:
  // primero una grabación de calentamiento que se descarta.
  const warm = new MediaRecorder(c.captureStream(VFPS), mime ? { mimeType: mime } : undefined);
  warm.start(250);
  let k = 0;
  const iv = setInterval(() => {
    renderPromo(); // el stream solo emite cuadros cuando el canvas cambia
    if (++k > 50) {
      clearInterval(iv);
      warm.stop();
      rec.start(250);
      togglePromoPlay(true);
    }
  }, 1000 / VFPS);
}

function stopPromoRecording() {
  togglePromoPlay(false);
  if (vRecording) {
    const rec = vRecording;
    vRecording = null;
    setTimeout(() => rec.stop(), 150);
  }
}

function setExportUI(on) {
  const btn = document.getElementById('promoExportBtn');
  if (btn) {
    btn.disabled = on;
    btn.textContent = on ? '● Grabando… deja esta pestaña visible' : '⬇ Exportar video 1080×1920';
  }
}

function downloadPromoFrame() {
  const a = document.createElement('a');
  a.download = `promo-fotograma-${vTime.toFixed(1)}s.png`;
  a.href = vCanvas().toDataURL('image/png');
  a.click();
}

// ---------- Panel de edición ----------
const FIELD_LABELS = {
  frase: 'Etiqueta superior', linea1: 'Titular línea 1', linea2: 'Titular línea 2 (color)', pregunta: 'Pregunta',
  titular: 'Titular', contacto: 'Nombre en el chat',
  titular1: 'Titular', titular2: 'Titular (gris)', prefijo: 'Antes del número', numero: 'Número', sufijo: 'Después del número', nota: 'Nota',
  nombre1: 'Nombre', nombre2: 'Apellidos', boton: 'Botón', web: 'Línea final'
};
const SCENE_TITLES = { escena1: '1 · Gancho', escena2: '2 · Chat', escena3: '3 · Servicios', escena4: '4 · Cifra', escena5: '5 · Cierre' };

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function buildPromoEditor() {
  const box = document.getElementById('promoSceneFields');
  if (!box) return;
  box.innerHTML = SCENES.map((key, si) => {
    const p = promo[key];
    let html = `<details class="v-scene" ${si === 0 ? 'open' : ''}><summary>${SCENE_TITLES[key]}<span class="v-dur"><input type="number" min="1" max="20" step="0.5" value="${promo.duracion[key]}" onclick="event.stopPropagation()" oninput="setPromoDur('${key}', this.value)"> s</span></summary><div class="v-fields">`;
    for (const f of Object.keys(p)) {
      if (Array.isArray(p[f])) continue;
      const long = String(p[f]).length > 34;
      const input = long
        ? `<textarea rows="2" oninput="setPromo('${key}','${f}',this.value)">${esc(p[f])}</textarea>`
        : `<input type="${f === 'numero' ? 'number' : 'text'}" value="${esc(p[f])}" oninput="setPromo('${key}','${f}',this.value)">`;
      html += `<div class="form-group"><label>${FIELD_LABELS[f] || f}</label>${input}</div>`;
    }
    if (key === 'escena2') {
      p.mensajes.forEach((m, i) => {
        html += `<div class="v-msg"><select onchange="setPromoItem('escena2','mensajes',${i},'quien',this.value)">
          <option value="cliente" ${m.quien === 'cliente' ? 'selected' : ''}>Cliente</option>
          <option value="yo" ${m.quien !== 'cliente' ? 'selected' : ''}>Yo</option></select>
          <input type="text" class="v-hora" value="${esc(m.hora)}" oninput="setPromoItem('escena2','mensajes',${i},'hora',this.value)">
          <button class="v-x" title="Quitar" onclick="removePromoItem('escena2','mensajes',${i})">×</button>
          <textarea rows="2" oninput="setPromoItem('escena2','mensajes',${i},'texto',this.value)">${esc(m.texto)}</textarea></div>`;
      });
      html += `<button class="btn-secondary w-100" onclick="addPromoItem('escena2','mensajes',{quien:'yo',texto:'Nuevo mensaje',hora:'9:44'})">+ Mensaje</button>`;
    }
    if (key === 'escena3') {
      p.beneficios.forEach((b, i) => {
        html += `<div class="v-msg"><input type="text" class="v-ico" value="${esc(b.icono)}" oninput="setPromoItem('escena3','beneficios',${i},'icono',this.value)">
          <input type="text" value="${esc(b.titulo)}" oninput="setPromoItem('escena3','beneficios',${i},'titulo',this.value)">
          <button class="v-x" title="Quitar" onclick="removePromoItem('escena3','beneficios',${i})">×</button>
          <textarea rows="2" oninput="setPromoItem('escena3','beneficios',${i},'texto',this.value)">${esc(b.texto)}</textarea></div>`;
      });
      if (p.beneficios.length < 4) html += `<button class="btn-secondary w-100" onclick="addPromoItem('escena3','beneficios',{icono:'📐',titulo:'Nuevo servicio',texto:'Descripción corta.'})">+ Servicio</button>`;
    }
    return html + `</div></details>`;
  }).join('');
}

function promoChanged() { savePromo(); if (!vPlaying) renderPromo(); }
function setPromo(scene, field, value) { promo[scene][field] = field === 'numero' ? Number(value) : value; promoChanged(); }
function setPromoItem(scene, list, i, field, value) { promo[scene][list][i][field] = value; promoChanged(); }
function addPromoItem(scene, list, item) { promo[scene][list].push(item); buildPromoEditor(); promoChanged(); }
function removePromoItem(scene, list, i) { promo[scene][list].splice(i, 1); buildPromoEditor(); promoChanged(); }
function setPromoDur(scene, v) { const n = Number(v); if (n >= 1) { promo.duracion[scene] = n; promoChanged(); } }

function setPromoAccent(color, btn) {
  promo.acento = color;
  document.querySelectorAll('#vtab-style .sw-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const picker = document.getElementById('promoAccentPicker');
  if (picker) picker.value = color;
  promoChanged();
}

function resetPromo() {
  if (!confirm('¿Volver a los textos originales del video?')) return;
  promo = structuredClone(PROMO_DEFAULTS);
  buildPromoEditor();
  promoChanged();
  showToast('Video restablecido');
}

function handlePromoPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => { promoPhoto = img; renderPromo(); showToast('Foto agregada al video'); };
  img.src = URL.createObjectURL(file);
}

function clearPromoPhoto() {
  promoPhoto = null;
  const inp = document.getElementById('promoPhotoInput');
  if (inp) inp.value = '';
  renderPromo();
}

function switchVideoTab(tabId, btn) {
  document.querySelectorAll('.v-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.video-panel-content').forEach(p => p.style.display = 'none');
  document.getElementById(`vtab-${tabId}`).style.display = 'block';
  btn.classList.add('active');
}

function setStudioMode(mode) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.getElementById('studioPostMode').style.display = mode === 'post' ? '' : 'none';
  document.getElementById('studioVideoMode').style.display = mode === 'video' ? '' : 'none';
  if (mode === 'video') renderPromo(); else { togglePromoPlay(false); renderCanvas(); }
  try { localStorage.setItem('agg_studio_mode', mode); } catch (e) { /* ignorar */ }
}

function initPromoStudio() {
  if (!document.getElementById('promoCanvas')) return;
  buildPromoEditor();
  const picker = document.getElementById('promoAccentPicker');
  if (picker) picker.value = promo.acento;
  let mode = 'video';
  try { mode = localStorage.getItem('agg_studio_mode') || 'video'; } catch (e) { /* ignorar */ }
  setStudioMode(mode);
  // primer fotograma vistoso (con el titular ya escrito)
  vTime = 2.6;
  Promise.all([
    document.fonts.load('400 80px Michroma'),
    document.fonts.load('500 40px Montserrat'),
    document.fonts.load('700 40px Montserrat'),
    new Promise(r => promoLogo.complete ? r() : (promoLogo.onload = promoLogo.onerror = r))
  ]).finally(renderPromo);
  renderPromo();
}

document.addEventListener('DOMContentLoaded', initPromoStudio);
