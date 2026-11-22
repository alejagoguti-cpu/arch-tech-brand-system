/* =====================================================================
   AGG STUDIO — editor tipo Canva para la marca personal
   Alejandra Gómez Gutiérrez. Vanilla JS, sin compilar.
   - Un solo motor de dibujo (canvas) para editar y exportar: lo que ves
     es lo que descargas.
   - Colores "$0..$4" y fuentes "$head/$body" son tokens del kit de marca:
     cambiar la marca actualiza todos los diseños.
   ===================================================================== */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const uid = () => Math.random().toString(36).slice(2, 10);
const clone = (o) => JSON.parse(JSON.stringify(o));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const clamp01 = (v) => clamp(v, 0, 1);
const easeOut = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const easeInOut = (v) => { v = clamp01(v); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const easeBack = (v) => { v = clamp01(v); const c = 1.5; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); };
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const toast = (m) => (window.showToast ? window.showToast(m) : console.log(m));

/* ------------------------------------------------------------------ */
/* Iconos (trazo, 24px)                                                */
/* ------------------------------------------------------------------ */
const ICONS = {
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  shapes: '<circle cx="7.5" cy="7.5" r="4.5"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="M17 3l4 7h-8z"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  brand: '<path d="M12 3l2.6 5.6L20 9.5l-4 4 1 5.8-5-2.8-5 2.8 1-5.8-4-4 5.4-.9z"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
  bg: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h3"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  alignL: '<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>',
  alignC: '<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>',
  alignR: '<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>',
  caps: '<path d="M3 18l4-12 4 12M4.5 14h5M14 18l3.5-9 3.5 9M15 15h5"/>',
  spacing: '<path d="M4 4v16M20 4v16M8 12h8M10 9l-2 3 2 3M14 9l2 3-2 3"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  wand: '<path d="M15 4V2M15 10V8M11 6h2M17 6h2M4 20L14 10"/><path d="M19 13l1 1M19 13l-1 1"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  opacity: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 7h4M12 11h5M12 15h4" />',
  resize: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  dup: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'
};
const icon = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;

/* ------------------------------------------------------------------ */
/* Kit de marca                                                         */
/* ------------------------------------------------------------------ */
const BRAND_KEY = 'agg_brand_v1';
const DEFAULT_BRAND = {
  name: 'Alejandra Gómez Gutiérrez',
  monogram: 'AGG',
  tagline: 'Arquitectura · Tecnología · Lifestyle',
  colors: ['#0e0e10', '#f4efe7', '#c8a97e', '#2a2a2e', '#8c867d'],
  colorNames: ['Ónix', 'Marfil', 'Champagne', 'Grafito', 'Piedra'],
  head: 'Cormorant Garamond',
  body: 'Manrope',
  logo: null
};
let brand = loadBrand();
function loadBrand() {
  try { const b = JSON.parse(localStorage.getItem(BRAND_KEY)); if (b) return { ...clone(DEFAULT_BRAND), ...b }; } catch (e) { /* sin almacenamiento */ }
  return clone(DEFAULT_BRAND);
}
function saveBrand() {
  try { localStorage.setItem(BRAND_KEY, JSON.stringify(brand)); } catch (e) { toast('No se pudo guardar la marca (almacenamiento lleno)'); }
  applyBrandToShell();
}
const rc = (c) => (typeof c === 'string' && c[0] === '$' ? brand.colors[+c.slice(1)] || '#000000' : c || 'transparent');
const rf = (f) => (f === '$head' ? brand.head : f === '$body' ? brand.body : f || brand.body);

const FONTS = [
  'Cormorant Garamond', 'Playfair Display', 'Bodoni Moda', 'Fraunces', 'DM Serif Display', 'Italiana', 'Cinzel',
  'Manrope', 'Inter', 'Montserrat', 'Plus Jakarta Sans', 'Syne', 'Space Grotesk', 'Michroma', 'Jost'
];
const FONT_PAIRS = [
  { name: 'Editorial', head: 'Cormorant Garamond', body: 'Manrope' },
  { name: 'Revista', head: 'Playfair Display', body: 'Inter' },
  { name: 'Alta costura', head: 'Bodoni Moda', body: 'Jost' },
  { name: 'Galería', head: 'Italiana', body: 'Manrope' },
  { name: 'Contemporáneo', head: 'Syne', body: 'Inter' },
  { name: 'Arquitectura', head: 'Michroma', body: 'Manrope' },
  { name: 'Cálido', head: 'Fraunces', body: 'Plus Jakarta Sans' },
  { name: 'Clásico', head: 'Cinzel', body: 'Montserrat' }
];

// Carga de fuentes: el canvas no espera a las fuentes, así que se piden
// explícitamente y se vuelve a dibujar (y a medir el texto) cuando llegan.
const fontReq = new Set();
function ensureFont(family, weight = 400, italic = false) {
  const key = `${italic ? 'italic ' : ''}${weight} ${family}`;
  if (fontReq.has(key)) return;
  fontReq.add(key);
  document.fonts.load(`${italic ? 'italic ' : ''}${weight} 40px "${family}"`).then(() => {
    refitAllText();
    requestRender(true);
    clearTimeout(ensureFont.t);
    ensureFont.t = setTimeout(() => {
      if (root && !root.hidden && state.drawer === 'templates') paintTemplateThumbs();
      if (document.getElementById('homeTemplates')) paintHomeTemplates();
    }, 150);
  }).catch(() => {});
}

/* ------------------------------------------------------------------ */
/* Almacenamiento (IndexedDB, con respaldo en memoria)                  */
/* ------------------------------------------------------------------ */
const DB = (() => {
  let dbp = null;
  const mem = { designs: new Map(), uploads: new Map() };
  function open() {
    if (!dbp) {
      dbp = new Promise((res, rej) => {
        try {
          const r = indexedDB.open('agg-studio', 1);
          r.onupgradeneeded = () => {
            const d = r.result;
            if (!d.objectStoreNames.contains('designs')) d.createObjectStore('designs', { keyPath: 'id' });
            if (!d.objectStoreNames.contains('uploads')) d.createObjectStore('uploads', { keyPath: 'id' });
          };
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      }).catch(() => null);
    }
    return dbp;
  }
  async function run(store, mode, fn) {
    const d = await open();
    if (!d) return fn(null, mem[store]);
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const req = fn(t.objectStore(store));
      t.oncomplete = () => res(req && 'result' in req ? req.result : undefined);
      t.onerror = () => rej(t.error);
    });
  }
  return {
    all: (s) => run(s, 'readonly', (st, m) => (st ? st.getAll() : Array.from(m.values()))),
    put: (s, v) => run(s, 'readwrite', (st, m) => (st ? st.put(v) : m.set(v.id, v))),
    del: (s, id) => run(s, 'readwrite', (st, m) => (st ? st.delete(id) : m.delete(id)))
  };
})();

/* ------------------------------------------------------------------ */
/* Formatos y modelo                                                    */
/* ------------------------------------------------------------------ */
const FORMATS = {
  story: { w: 1080, h: 1920, name: 'Reel / Story', ratio: '9:16' },
  post: { w: 1080, h: 1350, name: 'Post vertical', ratio: '4:5' },
  square: { w: 1080, h: 1080, name: 'Post cuadrado', ratio: '1:1' },
  wide: { w: 1920, h: 1080, name: 'Presentación', ratio: '16:9' }
};
const ANIMS = [
  { id: 'none', name: 'Ninguna' }, { id: 'fade', name: 'Fundido' }, { id: 'rise', name: 'Ascenso' },
  { id: 'pop', name: 'Pop' }, { id: 'slideL', name: 'Desde la izquierda' }, { id: 'slideR', name: 'Desde la derecha' },
  { id: 'blur', name: 'Desenfoque' }, { id: 'type', name: 'Máquina de escribir' }, { id: 'wipe', name: 'Barrido' },
  { id: 'zoom', name: 'Acercamiento' }
];

const base = (o) => ({ id: uid(), x: 0, y: 0, w: 400, h: 400, rot: 0, op: 1, locked: false, anim: { type: 'rise', delay: 0, dur: 0.8 }, ...o });
const T = (text, o = {}) => base({ type: 'text', text, font: '$body', size: 48, weight: 400, italic: false, upper: false, color: '$1', align: 'left', lh: 1.25, ls: 0, h: 0, ...o, anim: { type: 'rise', delay: 0, dur: 0.8, ...(o.anim || {}) } });
const S = (shape, o = {}) => base({ type: 'shape', shape, fill: '$2', stroke: '', sw: 0, radius: 0, ...o, anim: { type: 'fade', delay: 0, dur: 0.8, ...(o.anim || {}) } });
const IMG = (o = {}) => base({ type: 'image', src: null, mask: 'rect', radius: 0, ...o, anim: { type: 'fade', delay: 0, dur: 1, ...(o.anim || {}) } });
const LOGO = (o = {}) => base({ type: 'logo', style: 'ring', color: '$2', ...o, anim: { type: 'pop', delay: 0, dur: 0.9, ...(o.anim || {}) } });
const PAGE = (els, o = {}) => ({ id: uid(), dur: 4, bg: { type: 'solid', c1: '$0', c2: '$3', angle: 160, img: null, tint: 0.45 }, glow: { on: true, color: '$2', x: 0.5, y: 0.08, size: 0.75, a: 0.22 }, grain: true, grid: 'none', els, ...o });

function newDesign(fmt = 'story', name = 'Diseño sin título') {
  const f = FORMATS[fmt] || FORMATS.story;
  return { id: uid(), name, w: f.w, h: f.h, created: Date.now(), updated: Date.now(), pages: [PAGE([])] };
}

/* ------------------------------------------------------------------ */
/* Plantillas premium (usan el kit de marca)                            */
/* ------------------------------------------------------------------ */
const kicker = (text, o = {}) => T(text, { size: 26, weight: 600, upper: true, ls: 7, color: '$2', align: 'center', ...o });

const TEMPLATES = [
  {
    id: 'promo', name: 'Video promo de marca', fmt: 'story', badge: 'Video · 5 escenas',
    build() {
      const d = newDesign('story', 'Video promo de marca');
      d.pages = [
        PAGE([
          kicker(brand.tagline, { x: 90, y: 560, w: 900 }),
          S('rect', { x: 500, y: 640, w: 80, h: 2, anim: { type: 'wipe', delay: 0.2, dur: 0.8 } }),
          T('Diseño espacios que se construyen bien.', { font: '$head', size: 136, weight: 500, lh: 1.0, align: 'center', x: 70, y: 720, w: 940, anim: { type: 'rise', delay: 0.35, dur: 1 } }),
          T('y que se viven mejor.', { font: '$head', size: 70, italic: true, color: '$2', align: 'center', x: 90, y: 1300, w: 900, anim: { type: 'fade', delay: 1.1, dur: 1 } }),
          T('¿Tu proyecto ya tiene coordinación digital?', { size: 36, color: '$4', align: 'center', x: 140, y: 1640, w: 800, anim: { type: 'fade', delay: 1.6, dur: 0.8 } })
        ], { dur: 4, glow: { on: true, color: '$2', x: 0.5, y: 0.0, size: 0.8, a: 0.25 } }),
        PAGE([
          T('01', { font: '$head', size: 240, color: '$2', op: 0.35, x: 90, y: 250, w: 500, anim: { type: 'fade', delay: 0, dur: 1 } }),
          kicker('El problema', { align: 'left', x: 96, y: 560, w: 800 }),
          T('El 80% de los sobrecostos nace en planos que no conversan entre sí.', { font: '$head', size: 100, weight: 500, lh: 1.04, x: 90, y: 630, w: 900, anim: { type: 'rise', delay: 0.25, dur: 1 } }),
          S('rect', { x: 96, y: 1250, w: 120, h: 2, anim: { type: 'wipe', delay: 0.9, dur: 0.8 } }),
          T('Estructura, redes y arquitectura dibujadas por separado: el choque aparece en obra, cuando corregir cuesta diez veces más.', { size: 38, color: '$4', lh: 1.45, x: 96, y: 1310, w: 860, anim: { type: 'fade', delay: 1.1, dur: 0.9 } })
        ], { dur: 5, glow: { on: true, color: '$2', x: 1.0, y: 0.35, size: 0.7, a: 0.18 } }),
        PAGE([
          kicker('Lo que hago', { x: 90, y: 300, w: 900 }),
          T('Tres formas de cuidar tu proyecto', { font: '$head', size: 104, weight: 500, lh: 1.02, align: 'center', x: 90, y: 370, w: 900, anim: { type: 'rise', delay: 0.15, dur: 0.9 } }),
          ...[['01', 'Modelado BIM', 'Arquitectura, estructura y redes en un solo modelo.'],
              ['02', 'Coordinación técnica', 'Los choques se resuelven en pantalla, no en obra.'],
              ['03', 'Visualización 4K', 'Renders y recorridos para vender antes de construir.']].flatMap(([n, t, s], i) => {
            const y = 820 + i * 330, dl = 0.6 + i * 0.35;
            return [
              S('rect', { x: 90, y: y - 40, w: 900, h: 2, fill: '$4', op: 0.45, anim: { type: 'wipe', delay: dl - 0.2, dur: 0.8 } }),
              T(n, { font: '$head', size: 64, color: '$2', x: 90, y, w: 140, anim: { type: 'fade', delay: dl, dur: 0.7 } }),
              T(t, { size: 46, weight: 600, x: 250, y: y + 4, w: 740, anim: { type: 'slideR', delay: dl, dur: 0.8 } }),
              T(s, { size: 33, color: '$4', lh: 1.4, x: 250, y: y + 76, w: 700, anim: { type: 'fade', delay: dl + 0.15, dur: 0.8 } })
            ];
          })
        ], { dur: 5.5 }),
        PAGE([
          kicker('Caso real · Edificio de 12 pisos', { x: 90, y: 420, w: 900 }),
          S('ellipse', { x: 230, y: 640, w: 620, h: 620, fill: '', stroke: '$2', sw: 3, anim: { type: 'zoom', delay: 0.1, dur: 1.2 } }),
          T('47', { font: '$head', size: 330, weight: 500, align: 'center', x: 240, y: 720, w: 600, anim: { type: 'pop', delay: 0.4, dur: 1 } }),
          T('interferencias resueltas antes de construir', { font: '$head', size: 64, italic: true, align: 'center', color: '$1', x: 140, y: 1340, w: 800, anim: { type: 'rise', delay: 0.9, dur: 0.9 } }),
          T('Cada una habría sido una demolición en obra.', { size: 34, color: '$4', align: 'center', x: 140, y: 1560, w: 800, anim: { type: 'fade', delay: 1.4, dur: 0.8 } })
        ], { dur: 4.5, glow: { on: true, color: '$2', x: 0.5, y: 0.5, size: 0.6, a: 0.2 } }),
        PAGE([
          LOGO({ x: 400, y: 420, w: 280, h: 280 }),
          T(brand.name, { font: '$head', size: 92, weight: 500, align: 'center', lh: 1.05, x: 90, y: 800, w: 900, anim: { type: 'rise', delay: 0.5, dur: 1 } }),
          kicker(brand.tagline, { x: 90, y: 1060, w: 900, size: 24, anim: { type: 'fade', delay: 0.9, dur: 0.8 } }),
          S('pill', { x: 220, y: 1340, w: 640, h: 124, fill: '$2', anim: { type: 'pop', delay: 1.2, dur: 0.8 } }),
          T('Escríbeme “PROYECTO”', { size: 40, weight: 700, color: '$0', align: 'center', x: 220, y: 1378, w: 640, anim: { type: 'pop', delay: 1.25, dur: 0.8 } }),
          T('@tu_usuario', { size: 32, color: '$4', align: 'center', x: 240, y: 1580, w: 600, anim: { type: 'fade', delay: 1.5, dur: 0.8 } })
        ], { dur: 5, glow: { on: true, color: '$2', x: 0.5, y: 0.25, size: 0.7, a: 0.28 } })
      ];
      return d;
    }
  },
  {
    id: 'frase', name: 'Frase editorial', fmt: 'post', badge: 'Post 4:5',
    build() {
      const d = newDesign('post', 'Frase editorial');
      d.pages = [PAGE([
        T('“', { font: '$head', size: 320, color: '$2', align: 'center', x: 340, y: 120, w: 400, anim: { type: 'fade', delay: 0, dur: 1 } }),
        T('El verdadero lujo no es llenar un espacio, es saber qué dejar fuera.', { font: '$head', size: 84, weight: 500, italic: true, lh: 1.1, color: '$0', align: 'center', x: 110, y: 470, w: 860, anim: { type: 'rise', delay: 0.3, dur: 1 } }),
        S('rect', { x: 500, y: 1010, w: 80, h: 2, fill: '$2', anim: { type: 'wipe', delay: 0.9, dur: 0.8 } }),
        kicker(brand.name, { x: 90, y: 1060, w: 900, color: '$3', size: 24 })
      ], { bg: { type: 'solid', c1: '$1', c2: '$1', angle: 160, img: null, tint: 0.45 }, glow: { on: false, color: '$2', x: 0.5, y: 0, size: 0.7, a: 0.15 }, grain: true })];
      return d;
    }
  },
  {
    id: 'carrusel', name: 'Carrusel educativo', fmt: 'post', badge: 'Carrusel · 3',
    build() {
      const d = newDesign('post', 'Carrusel educativo');
      d.pages = [
        PAGE([
          IMG({ x: 240, y: 110, w: 600, h: 640, mask: 'arch' }),
          kicker('Guía rápida', { x: 90, y: 820, w: 900 }),
          T('3 reglas para un espacio que se siente caro', { font: '$head', size: 88, weight: 500, lh: 1.02, align: 'center', x: 90, y: 880, w: 900 }),
          T('Desliza →', { size: 28, weight: 600, color: '$2', align: 'center', x: 390, y: 1230, w: 300 })
        ]),
        PAGE([
          T('01', { font: '$head', size: 200, color: '$2', op: 0.4, x: 90, y: 120, w: 400 }),
          T('La luz natural manda', { font: '$head', size: 96, weight: 500, x: 90, y: 420, w: 900 }),
          T('Orienta los espacios de estar hacia la mejor luz y deja que los materiales la reciban. Ninguna lámpara compite con eso.', { size: 38, color: '$4', lh: 1.45, x: 90, y: 680, w: 860 })
        ]),
        PAGE([
          LOGO({ x: 420, y: 220, w: 240, h: 240 }),
          T('¿Quieres el resto de la guía?', { font: '$head', size: 92, weight: 500, align: 'center', x: 90, y: 560, w: 900 }),
          T('Guárdala y escríbeme “GUÍA”.', { size: 40, color: '$2', align: 'center', x: 90, y: 860, w: 900 })
        ])
      ];
      return d;
    }
  },
  {
    id: 'story', name: 'Historia con foto', fmt: 'story', badge: 'Story 9:16',
    build() {
      const d = newDesign('story', 'Historia con foto');
      d.pages = [PAGE([
        IMG({ x: 0, y: 0, w: 1080, h: 1920, anim: { type: 'zoom', delay: 0, dur: 2 } }),
        S('rect', { x: 0, y: 1000, w: 1080, h: 920, fill: '$0', op: 0.72, anim: { type: 'fade', delay: 0.2, dur: 1 } }),
        kicker('Nuevo proyecto', { align: 'left', x: 90, y: 1160, w: 900 }),
        T('Casa Travertino', { font: '$head', size: 140, weight: 500, x: 84, y: 1220, w: 920, anim: { type: 'rise', delay: 0.5, dur: 1 } }),
        T('Luz, piedra y madera en 320 m². Mira el recorrido completo.', { size: 38, color: '$1', op: 0.8, lh: 1.4, x: 90, y: 1420, w: 860, anim: { type: 'fade', delay: 1, dur: 0.8 } }),
        S('pill', { x: 90, y: 1640, w: 420, h: 104, fill: '$1', anim: { type: 'pop', delay: 1.3, dur: 0.7 } }),
        T('Ver proyecto', { size: 34, weight: 700, color: '$0', align: 'center', x: 90, y: 1672, w: 420, anim: { type: 'pop', delay: 1.35, dur: 0.7 } })
      ], { glow: { on: false, color: '$2', x: 0.5, y: 0, size: 0.7, a: 0.2 } })];
      return d;
    }
  },
  {
    id: 'presenta', name: 'Portada de presentación', fmt: 'wide', badge: '16:9',
    build() {
      const d = newDesign('wide', 'Portada de presentación');
      d.pages = [PAGE([
        IMG({ x: 1060, y: 90, w: 770, h: 900, mask: 'arch' }),
        kicker(brand.tagline, { align: 'left', x: 120, y: 300, w: 820 }),
        T('Propuesta de diseño', { font: '$head', size: 130, weight: 500, lh: 1, x: 112, y: 360, w: 860 }),
        S('rect', { x: 120, y: 690, w: 120, h: 2 }),
        T(brand.name, { size: 34, weight: 600, x: 120, y: 740, w: 800 }),
        T('Noviembre 2026', { size: 30, color: '$4', x: 120, y: 800, w: 800 })
      ], { glow: { on: true, color: '$2', x: 0, y: 0, size: 0.6, a: 0.18 } })];
      return d;
    }
  }
];

/* ------------------------------------------------------------------ */
/* Imágenes                                                             */
/* ------------------------------------------------------------------ */
const uploads = new Map(); // id -> {id, data, w, h, name}
const imgCache = new Map();
function getImg(src) {
  if (!src) return null;
  let data = src;
  if (src === 'brand:logo') data = brand.logo;
  else if (src.startsWith('up:')) data = uploads.get(src.slice(3))?.data;
  if (!data) return null;
  let img = imgCache.get(data);
  if (!img) {
    img = new Image();
    img.onload = () => requestRender(true);
    img.src = data;
    imgCache.set(data, img);
  }
  return img.complete && img.naturalWidth ? img : null;
}

function fileToData(file, max = 2000) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const png = /png|svg|webp/.test(file.type);
      res({ data: c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.9), w: c.width, h: c.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = rej;
    img.src = url;
  });
}

/* ------------------------------------------------------------------ */
/* Dibujo                                                               */
/* ------------------------------------------------------------------ */
const mctx = document.createElement('canvas').getContext('2d'); // para medir
function fontStr(el) { return `${el.italic ? 'italic ' : ''}${el.weight || 400} ${el.size}px "${rf(el.font)}"`; }
function setLS(ctx, ls) { if ('letterSpacing' in ctx) ctx.letterSpacing = `${ls || 0}px`; }

function layoutText(el) {
  const fam = rf(el.font);
  ensureFont(fam, el.weight || 400, el.italic);
  mctx.font = fontStr(el);
  setLS(mctx, el.ls);
  const txt = el.upper ? String(el.text).toUpperCase() : String(el.text);
  const lines = [];
  for (const para of txt.split('\n')) {
    const words = para.split(/ +/);
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (line && mctx.measureText(test).width > el.w + 0.5) { lines.push(line); line = w; } else line = test;
    }
    lines.push(line);
  }
  return lines;
}
function fitText(el) { if (el.type === 'text') el.h = Math.max(1, layoutText(el).length) * el.size * el.lh; }
function refitAllText() { if (state.design) state.design.pages.forEach(p => p.els.forEach(fitText)); }

function shapePath(ctx, kind, w, h, r = 0) {
  ctx.beginPath();
  const x = -w / 2, y = -h / 2;
  if (kind === 'ellipse') ctx.ellipse(0, 0, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
  else if (kind === 'triangle') { ctx.moveTo(0, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); }
  else if (kind === 'arch') { const rr = Math.min(w / 2, h); ctx.moveTo(x, y + h); ctx.lineTo(x, y + rr); ctx.arc(0, y + rr, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); }
  else if (kind === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? 0.42 : 1;
      ctx.lineTo(Math.cos(a) * w / 2 * rad, Math.sin(a) * h / 2 * rad);
    }
    ctx.closePath();
  } else if (kind === 'sparkle') {
    const k = 0.18;
    ctx.moveTo(0, y); ctx.quadraticCurveTo(w * k / 2, -h * k / 2, x + w, 0); ctx.quadraticCurveTo(w * k / 2, h * k / 2, 0, y + h);
    ctx.quadraticCurveTo(-w * k / 2, h * k / 2, x, 0); ctx.quadraticCurveTo(-w * k / 2, -h * k / 2, 0, y); ctx.closePath();
  } else {
    let rad = kind === 'pill' ? Math.min(w, h) / 2 : Math.min(r, Math.min(w, h) / 2);
    rad = Math.max(0, rad);
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }
}

function hexA(hex, a) {
  const h = rc(hex).replace('#', '');
  if (!/^[0-9a-f]{3,8}$/i.test(h)) return `rgba(0,0,0,${a})`;
  const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6);
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function lum(hex) {
  const h = rc(hex).replace('#', '');
  if (h.length < 6) return 0;
  const n = parseInt(h.slice(0, 6), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

let noiseTile = null;
const patCache = new WeakMap();
function grainPattern(ctx) {
  if (!noiseTile) {
    noiseTile = document.createElement('canvas');
    noiseTile.width = noiseTile.height = 160;
    const c = noiseTile.getContext('2d');
    const id = c.createImageData(160, 160);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 255;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 255;
    }
    c.putImageData(id, 0, 0);
  }
  let p = patCache.get(ctx);
  if (!p) { p = ctx.createPattern(noiseTile, 'repeat'); patCache.set(ctx, p); }
  return p;
}

function drawCover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * s, ih = img.naturalHeight * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function drawBg(ctx, page, W, H, t) {
  const b = page.bg;
  if (b.type === 'linear') {
    const a = (b.angle || 160) * Math.PI / 180, cx = W / 2, cy = H / 2, L = Math.abs(W * Math.sin(a)) + Math.abs(H * Math.cos(a));
    const g = ctx.createLinearGradient(cx - Math.sin(a) * L / 2, cy + Math.cos(a) * L / 2, cx + Math.sin(a) * L / 2, cy - Math.cos(a) * L / 2);
    g.addColorStop(0, rc(b.c1)); g.addColorStop(1, rc(b.c2));
    ctx.fillStyle = g;
  } else if (b.type === 'radial') {
    const g = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, Math.max(W, H) * 0.85);
    g.addColorStop(0, rc(b.c2)); g.addColorStop(1, rc(b.c1));
    ctx.fillStyle = g;
  } else ctx.fillStyle = rc(b.c1);
  ctx.fillRect(0, 0, W, H);

  if (b.type === 'image') {
    const img = getImg(b.img);
    if (img) {
      ctx.save();
      const z = t == null ? 1 : 1.06 - 0.06 * clamp01(t / 6);
      ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      drawCover(ctx, img, 0, 0, W, H);
      ctx.restore();
      ctx.fillStyle = hexA(b.c1, b.tint ?? 0.45);
      ctx.fillRect(0, 0, W, H);
    }
  }

  const gl = page.glow;
  if (gl && gl.on) {
    const dx = t == null ? 0 : Math.sin(t * 0.5) * 0.03, dy = t == null ? 0 : Math.cos(t * 0.4) * 0.02;
    const R = Math.max(W, H) * gl.size;
    const g = ctx.createRadialGradient((gl.x + dx) * W, (gl.y + dy) * H, 0, (gl.x + dx) * W, (gl.y + dy) * H, R);
    g.addColorStop(0, hexA(gl.color, gl.a));
    g.addColorStop(0.55, hexA(gl.color, gl.a * 0.35));
    g.addColorStop(1, hexA(gl.color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  if (page.grid && page.grid !== 'none') {
    const light = lum(b.c1) < 0.5;
    ctx.fillStyle = ctx.strokeStyle = light ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const step = Math.round(W / 20);
    if (page.grid === 'dots') {
      for (let x = step / 2; x < W; x += step) for (let y = step / 2; y < H; y += step) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    } else {
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = step; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = step; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
    }
  }
}

function drawGrain(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = grainPattern(ctx);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function animState(el, t) {
  const full = { a: 1, dx: 0, dy: 0, s: 1, blur: 0, chars: Infinity, wipe: 1 };
  const an = el.anim;
  if (t == null || !an || an.type === 'none') return full;
  const p = clamp01((t - (an.delay || 0)) / Math.max(0.05, an.dur || 0.8));
  const e = easeOut(p);
  switch (an.type) {
    case 'fade': return { ...full, a: e };
    case 'rise': return { ...full, a: e, dy: (1 - e) * 70 };
    case 'pop': return { ...full, a: clamp01(p * 2.5), s: 0.55 + 0.45 * easeBack(p) };
    case 'slideL': return { ...full, a: e, dx: -(1 - e) * 160 };
    case 'slideR': return { ...full, a: e, dx: (1 - e) * 160 };
    case 'blur': return { ...full, a: e, blur: (1 - e) * 24 };
    case 'type': return { ...full, a: p > 0 ? 1 : 0, chars: p };
    case 'wipe': return { ...full, wipe: easeInOut(p) };
    case 'zoom': return { ...full, a: e, s: 1.25 - 0.25 * e };
    default: return full;
  }
}

function drawEl(ctx, el, t, opts) {
  if (opts && opts.hide === el.id) return;
  const st = animState(el, t);
  if (st.a <= 0 || st.wipe <= 0) return;
  ctx.save();
  ctx.globalAlpha *= (el.op ?? 1) * st.a;
  const cx = el.x + el.w / 2 + st.dx, cy = el.y + el.h / 2 + st.dy;
  ctx.translate(cx, cy);
  if (el.rot) ctx.rotate(el.rot * Math.PI / 180);
  if (st.s !== 1) ctx.scale(st.s, st.s);
  if (st.blur > 0.3) ctx.filter = `blur(${st.blur}px)`;
  if (st.wipe < 1) { ctx.beginPath(); ctx.rect(-el.w / 2 - 4, -el.h / 2 - 400, el.w * st.wipe + 8, el.h + 800); ctx.clip(); }

  if (el.type === 'text') drawText(ctx, el, st);
  else if (el.type === 'shape') drawShape(ctx, el);
  else if (el.type === 'image') drawImageEl(ctx, el, opts);
  else if (el.type === 'logo') drawLogo(ctx, el);
  ctx.restore();
}

function drawText(ctx, el, st) {
  const lines = layoutText(el);
  ctx.font = fontStr(el);
  setLS(ctx, el.ls);
  ctx.fillStyle = rc(el.color);
  ctx.textBaseline = 'middle';
  ctx.textAlign = el.align === 'center' ? 'center' : el.align === 'right' ? 'right' : 'left';
  const x0 = el.align === 'center' ? 0 : el.align === 'right' ? el.w / 2 : -el.w / 2;
  const lh = el.size * el.lh;
  const h = lines.length * lh;
  let budget = st.chars === Infinity ? Infinity : Math.floor(lines.join('').length * st.chars);
  lines.forEach((ln, i) => {
    if (budget <= 0) return;
    const s = budget === Infinity ? ln : ln.slice(0, budget);
    if (budget !== Infinity) budget -= ln.length;
    // corrección: el espaciado entre letras deja un hueco al final de la línea
    const shift = el.ls && ctx.textAlign !== 'left' ? (ctx.textAlign === 'center' ? el.ls / 2 : el.ls) : 0;
    ctx.fillText(s, x0 + shift, -h / 2 + lh * i + lh / 2);
  });
}

function drawShape(ctx, el) {
  if (el.shape === 'line') {
    ctx.strokeStyle = rc(el.fill || el.stroke);
    ctx.lineWidth = Math.max(1, el.h);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-el.w / 2, 0); ctx.lineTo(el.w / 2, 0); ctx.stroke();
    return;
  }
  shapePath(ctx, el.shape, el.w, el.h, el.radius);
  if (el.fill) { ctx.fillStyle = rc(el.fill); ctx.fill(); }
  if (el.stroke && el.sw > 0) { ctx.lineWidth = el.sw; ctx.strokeStyle = rc(el.stroke); ctx.stroke(); }
}

function drawImageEl(ctx, el, opts) {
  ctx.save();
  shapePath(ctx, el.mask === 'circle' ? 'ellipse' : el.mask === 'arch' ? 'arch' : 'rect', el.w, el.h, el.mask === 'rounded' ? Math.min(el.w, el.h) * 0.08 : el.radius || 0);
  ctx.clip();
  const img = getImg(el.src);
  if (img) drawCover(ctx, img, -el.w / 2, -el.h / 2, el.w, el.h);
  else {
    // marco vacío: tono neutro con trama fina
    ctx.fillStyle = hexA('$3', 1);
    ctx.fillRect(-el.w / 2, -el.h / 2, el.w, el.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = -el.h; k < el.w + el.h; k += 28) { ctx.moveTo(-el.w / 2 + k, -el.h / 2); ctx.lineTo(-el.w / 2 + k - el.h, el.h / 2); }
    ctx.stroke();
    if (opts && opts.editor) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `600 ${Math.max(18, Math.min(el.w, el.h) * 0.05)}px Manrope`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      setLS(ctx, 0);
      ctx.fillText('Sube una foto y haz clic para ponerla aquí', 0, 0);
    }
  }
  ctx.restore();
}

function drawLogo(ctx, el) {
  const s = Math.min(el.w, el.h);
  const col = rc(el.color);
  if (brand.logo && el.style !== 'mono') {
    const img = getImg('brand:logo');
    if (img) {
      const k = Math.min(el.w / img.naturalWidth, el.h / img.naturalHeight);
      ctx.drawImage(img, -img.naturalWidth * k / 2, -img.naturalHeight * k / 2, img.naturalWidth * k, img.naturalHeight * k);
      return;
    }
  }
  // monograma: anillo fino + iniciales en la tipografía de titulares
  const mono = brand.monogram || 'A';
  if (el.style !== 'plain') {
    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1.5, s * 0.012);
    ctx.beginPath(); ctx.arc(0, 0, s / 2 - ctx.lineWidth, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha *= 0.45;
    ctx.beginPath(); ctx.arc(0, 0, s / 2 - s * 0.07, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha /= 0.45;
  }
  ensureFont(brand.head, 500);
  const size = s * (mono.length > 2 ? 0.3 : 0.4);
  ctx.font = `500 ${size}px "${brand.head}"`;
  setLS(ctx, size * 0.08);
  ctx.fillStyle = col;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mono, size * 0.04, size * 0.04);
}

function drawPage(ctx, page, W, H, t, opts) {
  drawBg(ctx, page, W, H, t);
  for (const el of page.els) drawEl(ctx, el, t, opts);
  if (page.grain) drawGrain(ctx, W, H);
}

// Línea de tiempo del diseño completo (las páginas se encadenan con fundido)
const TR = 0.5;
function timeline(d) {
  let s = 0;
  return d.pages.map((p, i) => { const w = { i, start: s, end: s + p.dur }; s += p.dur - TR; return w; });
}
function totalDur(d) { const tl = timeline(d); return tl.length ? tl[tl.length - 1].end : 0; }
function drawAt(ctx, d, T) {
  const tl = timeline(d);
  let drew = false;
  tl.forEach((w) => {
    if (T < w.start || T > w.end) return;
    const lt = T - w.start;
    ctx.save();
    ctx.globalAlpha = w.i === 0 || !drew ? 1 : easeInOut(lt / TR);
    drawPage(ctx, d.pages[w.i], d.w, d.h, lt);
    ctx.restore();
    drew = true;
  });
  if (!drew) drawPage(ctx, d.pages[d.pages.length - 1], d.w, d.h, null);
}
function pageAt(d, T) {
  const tl = timeline(d);
  let idx = 0;
  tl.forEach(w => { if (T >= w.start + (w.i ? TR / 2 : 0)) idx = w.i; });
  return idx;
}

/* ------------------------------------------------------------------ */
/* Estado del editor                                                    */
/* ------------------------------------------------------------------ */
const state = {
  design: null, page: 0, sel: null, hover: null, zoom: 0.3, fit: true,
  drawer: 'templates', right: null, playing: false, playT: 0, editing: null,
  clipboard: null, undo: [], redo: [], snap: '', designs: []
};
const dsg = () => state.design;
const pg = () => dsg().pages[state.page];
const selEl = () => (state.sel ? pg().els.find(e => e.id === state.sel) : null);

function commit() {
  const s = JSON.stringify(dsg());
  if (s === state.snap) return;
  if (state.snap) state.undo.push(state.snap);
  if (state.undo.length > 80) state.undo.shift();
  state.snap = s;
  state.redo = [];
  scheduleSave();
  updateUndoUI();
  scheduleThumbs();
}
function undo() {
  if (!state.undo.length) return;
  state.redo.push(state.snap);
  state.snap = state.undo.pop();
  restoreSnap();
}
function redo() {
  if (!state.redo.length) return;
  state.undo.push(state.snap);
  state.snap = state.redo.pop();
  restoreSnap();
}
function restoreSnap() {
  state.design = JSON.parse(state.snap);
  state.page = clamp(state.page, 0, dsg().pages.length - 1);
  if (!selEl()) state.sel = null;
  refitAllText();
  scheduleSave();
  renderAll();
}

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  setSaveStatus('Guardando…');
  saveTimer = setTimeout(async () => {
    const d = dsg();
    d.updated = Date.now();
    d.thumb = thumbData(d, 0, 360);
    try { await DB.put('designs', clone(d)); setSaveStatus('Guardado'); } catch (e) { setSaveStatus('Sin guardar'); }
    localStorage.setItem('agg_last_design', d.id);
  }, 700);
}
function setSaveStatus(s) { const el = $('#stSave'); if (el) el.textContent = s; }

function thumbData(d, i, w) {
  const c = document.createElement('canvas');
  const k = w / d.w;
  c.width = w; c.height = Math.round(d.h * k);
  const ctx = c.getContext('2d');
  ctx.scale(k, k);
  drawPage(ctx, d.pages[i], d.w, d.h, null);
  return c.toDataURL('image/jpeg', 0.82);
}

/* ------------------------------------------------------------------ */
/* Interfaz                                                             */
/* ------------------------------------------------------------------ */
let root, canvas, ctx, overlay, stageArea, stageBox;

function buildShell() {
  root = document.createElement('div');
  root.id = 'studioApp';
  root.className = 'st-app';
  root.hidden = true;
  root.innerHTML = `
  <header class="st-top">
    <div class="st-top-l">
      <button class="st-iconbtn st-back" data-act="close" title="Volver al tablero">${icon('back')}<span>Tablero</span></button>
      <div class="st-mark" data-brand="monogram">AGG</div>
      <input class="st-name" id="stName" spellcheck="false" aria-label="Nombre del diseño">
      <span class="st-save" id="stSave">Guardado</span>
    </div>
    <div class="st-top-c">
      <button class="st-iconbtn" data-act="undo" id="stUndo" title="Deshacer (Ctrl+Z)">${icon('undo')}</button>
      <button class="st-iconbtn" data-act="redo" id="stRedo" title="Rehacer (Ctrl+Y)">${icon('redo')}</button>
      <div class="st-sep"></div>
      <div class="st-menu-wrap">
        <button class="st-pillbtn" data-act="menu-resize">${icon('resize', 16)}<span id="stFmt">9:16</span>${icon('chevron', 14)}</button>
        <div class="st-menu" id="stMenuResize"></div>
      </div>
    </div>
    <div class="st-top-r">
      <button class="st-pillbtn" data-act="play-all">${icon('play', 14)}<span>Reproducir</span></button>
      <div class="st-menu-wrap">
        <button class="st-primary" data-act="menu-download">${icon('download', 16)}<span>Descargar</span></button>
        <div class="st-menu st-menu-r" id="stMenuDownload">
          <button data-act="dl-png">Imagen PNG · esta página<small>Máxima calidad</small></button>
          <button data-act="dl-jpg">Imagen JPG · esta página<small>Más liviana</small></button>
          <button data-act="dl-all">Todas las páginas en PNG<small>Para carruseles</small></button>
          <button data-act="dl-mp4">Video MP4 animado<small>Con animaciones y transiciones</small></button>
        </div>
      </div>
    </div>
  </header>
  <div class="st-body">
    <nav class="st-rail">
      ${[['templates', 'layout', 'Diseño'], ['elements', 'shapes', 'Elementos'], ['text', 'type', 'Texto'], ['brand', 'brand', 'Marca'], ['uploads', 'upload', 'Subidas'], ['background', 'bg', 'Fondo'], ['projects', 'folder', 'Proyectos']]
        .map(([id, ic, label]) => `<button class="st-rail-btn" data-drawer="${id}">${icon(ic, 22)}<span>${label}</span></button>`).join('')}
    </nav>
    <aside class="st-drawer" id="stDrawer"></aside>
    <main class="st-main">
      <div class="st-ctx" id="stCtx"></div>
      <div class="st-stage-area" id="stStageArea">
        <div class="st-stage" id="stStage">
          <canvas id="stCanvas"></canvas>
          <div class="st-overlay" id="stOverlay"></div>
        </div>
      </div>
      <footer class="st-bottom">
        <button class="st-playbtn" data-act="play-all" id="stPlayBtn" title="Reproducir (Espacio)">${icon('play', 16)}</button>
        <div class="st-pages" id="stPages"></div>
        <div class="st-zoom">
          <span id="stTime" class="st-time"></span>
          <input type="range" id="stZoom" min="10" max="200" value="30" aria-label="Zoom">
          <button class="st-zoomlabel" data-act="fit" id="stZoomLabel" title="Ajustar a la pantalla">30%</button>
        </div>
      </footer>
    </main>
    <aside class="st-right" id="stRight" hidden></aside>
  </div>
  <div class="st-pop" id="stPop" hidden></div>
  <div class="st-cmenu" id="stCmenu" hidden></div>
  <div class="st-modal" id="stModal" hidden></div>
  <textarea class="st-edit" id="stEdit" hidden spellcheck="false"></textarea>
  <input type="file" id="stFile" accept="image/*" multiple hidden>
  <input type="file" id="stLogoFile" accept="image/*" hidden>`;
  document.body.appendChild(root);

  canvas = $('#stCanvas'); ctx = canvas.getContext('2d');
  overlay = $('#stOverlay'); stageArea = $('#stStageArea'); stageBox = $('#stStage');

  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  root.addEventListener('change', onChange);
  overlay.addEventListener('pointerdown', onPointerDown);
  overlay.addEventListener('pointermove', onPointerMove);
  overlay.addEventListener('pointerup', onPointerUp);
  overlay.addEventListener('dblclick', onDblClick);
  overlay.addEventListener('contextmenu', onContext);
  stageArea.addEventListener('pointerdown', (e) => { if (e.target === stageArea) { select(null); closeFloating(); } });
  stageArea.addEventListener('wheel', onWheel, { passive: false });
  stageArea.addEventListener('dragover', (e) => { e.preventDefault(); stageArea.classList.add('st-drop'); });
  stageArea.addEventListener('dragleave', () => stageArea.classList.remove('st-drop'));
  stageArea.addEventListener('drop', onDrop);
  window.addEventListener('resize', () => { if (!root.hidden) { if (state.fit) fitZoom(); layoutStage(); } });
  document.addEventListener('keydown', onKey);
  $('#stName').addEventListener('change', (e) => { dsg().name = e.target.value.trim() || 'Diseño sin título'; commit(); });
  $('#stZoom').addEventListener('input', (e) => { state.fit = false; state.zoom = e.target.value / 100; layoutStage(); });
  $('#stFile').addEventListener('change', (e) => handleFiles(e.target.files));
  $('#stLogoFile').addEventListener('change', onLogoFile);
  const ed = $('#stEdit');
  ed.addEventListener('input', onEditInput);
  ed.addEventListener('blur', endEdit);
  ed.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); ed.blur(); } e.stopPropagation(); });
}

/* ---------- Render ---------- */
let rafPending = false, thumbsNeeded = false;
function requestRender(withThumbs) {
  if (withThumbs) thumbsNeeded = true;
  if (rafPending || !root || root.hidden) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    renderStage();
    if (thumbsNeeded) { thumbsNeeded = false; scheduleThumbs(); }
  });
}
function renderStage() {
  const d = dsg();
  if (!d) return;
  if (canvas.width !== d.w || canvas.height !== d.h) { canvas.width = d.w; canvas.height = d.h; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, d.w, d.h);
  if (state.playing && playRange && playRange.page != null) drawPage(ctx, d.pages[playRange.page], d.w, d.h, state.playT);
  else if (state.playing) drawAt(ctx, d, state.playT);
  else drawPage(ctx, pg(), d.w, d.h, null, { editor: true, hide: state.editing });
  renderSelection();
}

function fitZoom() {
  const d = dsg();
  const r = stageArea.getBoundingClientRect();
  const z = Math.min((r.width - 80) / d.w, (r.height - 80) / d.h);
  state.zoom = clamp(z, 0.08, 2);
}
function layoutStage() {
  const d = dsg();
  const w = d.w * state.zoom, h = d.h * state.zoom;
  stageBox.style.width = `${w}px`;
  stageBox.style.height = `${h}px`;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  $('#stZoom').value = Math.round(state.zoom * 100);
  $('#stZoomLabel').textContent = `${Math.round(state.zoom * 100)}%`;
  renderSelection();
  if (state.editing) positionEditor();
}

function renderSelection() {
  const z = state.zoom;
  let html = '';
  const hov = state.hover && state.hover !== state.sel && !state.playing ? pg().els.find(e => e.id === state.hover) : null;
  if (hov) html += `<div class="st-hover" style="${boxStyle(hov, z)}"></div>`;
  const el = !state.playing && selEl();
  if (el && !state.editing) {
    const isText = el.type === 'text';
    const handles = isText ? ['nw', 'ne', 'se', 'sw', 'e', 'w'] : el.type === 'shape' && el.shape === 'line' ? ['e', 'w'] : ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    html += `<div class="st-sel ${el.locked ? 'is-locked' : ''}" style="${boxStyle(el, z)}">
      ${el.locked ? `<span class="st-lockbadge">${icon('lock', 12)}</span>` : handles.map(h => `<span class="st-h st-h-${h}" data-h="${h}"></span>`).join('') + `<span class="st-rot" data-h="rot">${icon('redo', 12)}</span>`}
      <span class="st-dim">${Math.round(el.w)} × ${Math.round(el.h)}</span>
    </div>`;
  }
  html += guides.map(g => g.axis === 'x'
    ? `<div class="st-guide st-guide-v" style="left:${g.v * z}px"></div>`
    : `<div class="st-guide st-guide-h" style="top:${g.v * z}px"></div>`).join('');
  overlay.innerHTML = html;
}
function boxStyle(el, z) {
  return `left:${el.x * z}px;top:${el.y * z}px;width:${el.w * z}px;height:${Math.max(el.h, 2) * z}px;transform:rotate(${el.rot || 0}deg)`;
}

function renderAll() {
  if (!dsg()) return;
  $('#stName').value = dsg().name;
  const fmt = Object.values(FORMATS).find(f => f.w === dsg().w && f.h === dsg().h);
  $('#stFmt').textContent = fmt ? fmt.ratio : `${dsg().w}×${dsg().h}`;
  if (state.fit) fitZoom();
  layoutStage();
  renderStage();
  renderPages();
  renderCtx();
  renderDrawer();
  renderRight();
  updateUndoUI();
}
function updateUndoUI() {
  $('#stUndo').disabled = !state.undo.length;
  $('#stRedo').disabled = !state.redo.length;
}

/* ---------- Páginas ---------- */
let thumbTimer = null;
function scheduleThumbs() { clearTimeout(thumbTimer); thumbTimer = setTimeout(renderPageThumbs, 250); }
function renderPages() {
  const d = dsg();
  const box = $('#stPages');
  const th = 64, tw = Math.round(th * d.w / d.h);
  box.innerHTML = d.pages.map((p, i) => `
    <div class="st-page ${i === state.page ? 'is-active' : ''}" data-page="${i}" draggable="true">
      <canvas width="${tw * 2}" height="${th * 2}" style="width:${tw}px;height:${th}px"></canvas>
      <span class="st-page-n">${i + 1}</span>
      <span class="st-page-dur">${p.dur.toFixed(1)}s</span>
    </div>`).join('') + `<button class="st-page-add" data-act="add-page" title="Agregar página">${icon('plus', 18)}</button>`;
  renderPageThumbs();
  const tt = totalDur(d);
  $('#stTime').textContent = `${d.pages.length} ${d.pages.length === 1 ? 'página' : 'páginas'} · ${tt.toFixed(1)} s`;
  // arrastrar para reordenar
  $$('.st-page', box).forEach(n => {
    n.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/page', n.dataset.page); });
    n.addEventListener('dragover', (e) => e.preventDefault());
    n.addEventListener('drop', (e) => {
      e.preventDefault();
      const from = +e.dataTransfer.getData('text/page'), to = +n.dataset.page;
      if (Number.isNaN(from) || from === to) return;
      const [p] = d.pages.splice(from, 1);
      d.pages.splice(to, 0, p);
      state.page = to;
      commit(); renderAll();
    });
  });
}
function renderPageThumbs() {
  const d = dsg();
  if (!d || root.hidden) return;
  $$('.st-page canvas', $('#stPages')).forEach((c, i) => {
    if (!d.pages[i]) return;
    const x = c.getContext('2d');
    const k = c.width / d.w;
    x.setTransform(k, 0, 0, k, 0, 0);
    drawPage(x, d.pages[i], d.w, d.h, null);
  });
}

/* ---------- Barra contextual ---------- */
function swatchBtn(act, color, title) {
  const c = rc(color);
  const none = !color;
  return `<button class="st-swatch ${none ? 'is-none' : ''}" data-act="${act}" title="${title}" style="--c:${none ? 'transparent' : c}"></button>`;
}
function renderCtx() {
  const bar = $('#stCtx');
  const el = selEl();
  if (state.playing) { bar.innerHTML = `<div class="st-ctx-note">Reproduciendo… haz clic en el lienzo o pulsa Espacio para detener</div>`; return; }
  if (!el) {
    const p = pg();
    bar.innerHTML = `
      <div class="st-ctx-group">${swatchBtn('pick-bg', p.bg.c1, 'Color de fondo')}<span class="st-ctx-label">Fondo</span></div>
      <div class="st-ctx-sep"></div>
      <label class="st-ctx-group st-ctx-label">Duración <input class="st-num" type="number" min="1" max="30" step="0.5" value="${p.dur}" data-input="page-dur"> s</label>
      <div class="st-ctx-sep"></div>
      <button class="st-ctx-btn" data-act="magic-anim">${icon('wand', 18)}<span>Animar página</span></button>
      <button class="st-ctx-btn" data-act="dup-page">${icon('dup', 18)}<span>Duplicar página</span></button>
      <button class="st-ctx-btn" data-act="del-page" ${dsg().pages.length < 2 ? 'disabled' : ''}>${icon('trash', 18)}<span>Eliminar página</span></button>`;
    return;
  }
  let html = '';
  if (el.type === 'text') {
    html += `
      <button class="st-fontbtn" data-act="pick-font" style="font-family:'${rf(el.font)}'">${esc(el.font === '$head' ? `${brand.head} · titular` : el.font === '$body' ? `${brand.body} · texto` : el.font)}${icon('chevron', 14)}</button>
      <div class="st-stepper"><button data-act="size-" title="Más pequeño">${icon('minus', 14)}</button><input type="number" value="${Math.round(el.size)}" data-input="size" aria-label="Tamaño"><button data-act="size+" title="Más grande">${icon('plus', 14)}</button></div>
      ${swatchBtn('pick-color', el.color, 'Color del texto')}
      <div class="st-ctx-sep"></div>
      <button class="st-tbtn ${el.weight >= 600 ? 'is-on' : ''}" data-act="bold" title="Negrita (Ctrl+B)"><b>B</b></button>
      <button class="st-tbtn ${el.italic ? 'is-on' : ''}" data-act="italic" title="Cursiva (Ctrl+I)"><i style="font-family:Georgia">I</i></button>
      <button class="st-tbtn" data-act="align" title="Alineación">${icon(el.align === 'center' ? 'alignC' : el.align === 'right' ? 'alignR' : 'alignL', 18)}</button>
      <button class="st-tbtn ${el.upper ? 'is-on' : ''}" data-act="upper" title="Mayúsculas">${icon('caps', 18)}</button>
      <button class="st-tbtn" data-act="pop-spacing" title="Espaciado">${icon('spacing', 18)}</button>`;
  } else if (el.type === 'shape') {
    html += `${swatchBtn('pick-fill', el.fill, 'Relleno')}<span class="st-ctx-label">Relleno</span>
      ${el.shape !== 'line' ? `${swatchBtn('pick-stroke', el.stroke, 'Borde')}<span class="st-ctx-label">Borde</span>
      <label class="st-ctx-label">Grosor <input class="st-num" type="number" min="0" max="60" value="${el.sw}" data-input="sw"></label>` : `<label class="st-ctx-label">Grosor <input class="st-num" type="number" min="1" max="60" value="${Math.round(el.h)}" data-input="lineh"></label>`}
      ${el.shape === 'rect' ? `<label class="st-ctx-label">Esquinas <input class="st-num" type="number" min="0" max="500" value="${el.radius}" data-input="radius"></label>` : ''}`;
  } else if (el.type === 'image') {
    html += `<button class="st-ctx-btn" data-act="replace-img">${icon('image', 18)}<span>${el.src ? 'Reemplazar' : 'Poner foto'}</span></button>
      <div class="st-seg">${[['rect', 'Recto'], ['rounded', 'Suave'], ['circle', 'Círculo'], ['arch', 'Arco']].map(([m, l]) => `<button class="${el.mask === m ? 'is-on' : ''}" data-act="mask" data-v="${m}">${l}</button>`).join('')}</div>`;
  } else if (el.type === 'logo') {
    html += `${swatchBtn('pick-logo', el.color, 'Color del monograma')}
      <div class="st-seg">${[['ring', 'Con anillo'], ['plain', 'Solo letras']].map(([m, l]) => `<button class="${el.style === m ? 'is-on' : ''}" data-act="logo-style" data-v="${m}">${l}</button>`).join('')}</div>
      ${brand.logo ? '' : `<button class="st-ctx-btn" data-drawer="brand">${icon('upload', 18)}<span>Subir mi logo</span></button>`}`;
  }
  html += `<div class="st-ctx-sep"></div>
    <button class="st-ctx-btn ${state.right === 'animate' ? 'is-on' : ''}" data-act="right-animate">${icon('wand', 18)}<span>Animar</span></button>
    <button class="st-ctx-btn ${state.right === 'position' ? 'is-on' : ''}" data-act="right-position">${icon('layers', 18)}<span>Posición</span></button>
    <button class="st-tbtn" data-act="pop-opacity" title="Transparencia">${icon('opacity', 18)}</button>
    <button class="st-tbtn" data-act="lock" title="${el.locked ? 'Desbloquear' : 'Bloquear'}">${icon(el.locked ? 'lock' : 'unlock', 18)}</button>
    <button class="st-tbtn" data-act="duplicate" title="Duplicar (Ctrl+D)">${icon('dup', 18)}</button>
    <button class="st-tbtn" data-act="delete" title="Eliminar (Supr)">${icon('trash', 18)}</button>`;
  bar.innerHTML = html;
}

/* ---------- Paneles izquierdos ---------- */
let tplThumbs = null;
function renderDrawer() {
  const dr = $('#stDrawer');
  $$('.st-rail-btn', root).forEach(b => b.classList.toggle('is-active', b.dataset.drawer === state.drawer));
  dr.hidden = !state.drawer;
  root.classList.toggle('no-drawer', !state.drawer);
  if (!state.drawer) return;
  const f = DRAWERS[state.drawer];
  dr.innerHTML = `<div class="st-drawer-in">${f()}</div>`;
  if (state.drawer === 'templates') paintTemplateThumbs();
}

const DRAWERS = {
  templates() {
    return `<h3 class="st-h3">Plantillas de tu marca</h3>
      <p class="st-muted">Usan tus colores y tipografías. Cámbialos en <b>Marca</b> y se actualizan solas.</p>
      <div class="st-tpl-grid">${TEMPLATES.map(t => `
        <button class="st-tpl" data-act="use-tpl" data-v="${t.id}">
          <canvas data-tpl="${t.id}"></canvas>
          <span class="st-tpl-name">${t.name}</span><span class="st-tpl-badge">${t.badge}</span>
        </button>`).join('')}</div>
      <h3 class="st-h3">Empezar en blanco</h3>
      <div class="st-fmt-grid">${Object.entries(FORMATS).map(([k, f]) => `
        <button class="st-fmt" data-act="new-blank" data-v="${k}"><span class="st-fmt-shape" style="aspect-ratio:${f.w}/${f.h}"></span><b>${f.name}</b><small>${f.ratio} · ${f.w}×${f.h}</small></button>`).join('')}</div>`;
  },
  elements() {
    const shapes = [['rect', 'Rectángulo'], ['rounded', 'Redondeado'], ['ellipse', 'Círculo'], ['pill', 'Píldora'], ['arch', 'Arco'], ['triangle', 'Triángulo'], ['star', 'Estrella'], ['sparkle', 'Destello'], ['line', 'Línea']];
    const svgFor = (s) => {
      const m = { rect: '<rect x="8" y="12" width="40" height="32"/>', rounded: '<rect x="8" y="12" width="40" height="32" rx="9"/>', ellipse: '<circle cx="28" cy="28" r="18"/>', pill: '<rect x="6" y="18" width="44" height="20" rx="10"/>', arch: '<path d="M12 46V26a16 16 0 0 1 32 0v20z"/>', triangle: '<path d="M28 9l20 36H8z"/>', star: '<path d="M28 8l5.6 12.4 13.4 1.4-10 9 2.9 13.2L28 37.2 16.1 44l2.9-13.2-10-9 13.4-1.4z"/>', sparkle: '<path d="M28 6c1.5 12 8 20.5 20 22-12 1.5-18.5 10-20 22-1.5-12-8-20.5-20-22 12-1.5 18.5-10 20-22z"/>', line: '<path d="M8 28h40" stroke-width="3" fill="none" stroke="currentColor"/>' };
      return `<svg viewBox="0 0 56 56" fill="currentColor">${m[s]}</svg>`;
    };
    return `<h3 class="st-h3">Formas</h3>
      <div class="st-el-grid">${shapes.map(([s, n]) => `<button class="st-el" data-act="add-shape" data-v="${s}" title="${n}">${svgFor(s)}</button>`).join('')}</div>
      <h3 class="st-h3">Marcos para fotos</h3>
      <div class="st-el-grid">${[['rect', '<rect x="8" y="8" width="40" height="40"/>'], ['rounded', '<rect x="8" y="8" width="40" height="40" rx="8"/>'], ['circle', '<circle cx="28" cy="28" r="20"/>'], ['arch', '<path d="M10 50V28a18 18 0 0 1 36 0v22z"/>']]
        .map(([m, p]) => `<button class="st-el st-frame" data-act="add-frame" data-v="${m}"><svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3">${p}</svg></button>`).join('')}</div>
      <h3 class="st-h3">Detalles de marca</h3>
      <div class="st-list">
        <button class="st-row" data-act="add-logo"><span class="st-row-ic st-mono-ic">${esc(brand.monogram)}</span><span><b>${brand.logo ? 'Mi logo' : 'Monograma'}</b><small>${brand.logo ? 'El logo que subiste' : 'Tus iniciales con anillo'}</small></span></button>
        <button class="st-row" data-act="add-number"><span class="st-row-ic" style="font-family:'${brand.head}'">01</span><span><b>Número editorial</b><small>Para pasos o capítulos</small></span></button>
        <button class="st-row" data-act="add-divider"><span class="st-row-ic">—</span><span><b>Línea divisoria</b><small>Fina, en color de acento</small></span></button>
        <button class="st-row" data-act="add-tag"><span class="st-row-ic">Aa</span><span><b>Etiqueta</b><small>Texto en mayúsculas espaciadas</small></span></button>
        <button class="st-row" data-act="add-button"><span class="st-row-ic">▭</span><span><b>Botón</b><small>Llamado a la acción</small></span></button>
      </div>`;
  },
  text() {
    return `<button class="st-addtext st-addtext-h" data-act="add-text" data-v="h" style="font-family:'${brand.head}'">Añadir un título</button>
      <button class="st-addtext st-addtext-s" data-act="add-text" data-v="s" style="font-family:'${brand.body}'">Añadir un subtítulo</button>
      <button class="st-addtext st-addtext-b" data-act="add-text" data-v="b" style="font-family:'${brand.body}'">Añadir texto de párrafo</button>
      <button class="st-addtext st-addtext-k" data-act="add-text" data-v="k" style="font-family:'${brand.body}'">ETIQUETA ESPACIADA</button>
      <h3 class="st-h3">Combinaciones de fuentes</h3>
      <div class="st-pairs">${FONT_PAIRS.map((p, i) => `
        <button class="st-pair" data-act="add-pair" data-v="${i}">
          <span style="font-family:'${p.head}'">${p.name}</span>
          <small style="font-family:'${p.body}'">${p.head} + ${p.body}</small>
        </button>`).join('')}</div>`;
  },
  brand() {
    return `<h3 class="st-h3">Kit de marca</h3>
      <p class="st-muted">Todo lo que cambies aquí se aplica a todos tus diseños.</p>
      <div class="st-logo-box">
        <div class="st-logo-prev">${brand.logo ? `<img src="${brand.logo}" alt="Logo">` : `<span style="font-family:'${brand.head}'">${esc(brand.monogram)}</span>`}</div>
        <div>
          <b>${brand.logo ? 'Tu logo' : 'Aún no hay logo'}</b>
          <small>${brand.logo ? 'Se usa en el elemento “Mi logo”.' : 'Mientras tanto usamos tu monograma.'}</small>
          <div class="st-btnrow"><button class="st-btn" data-act="upload-logo">${brand.logo ? 'Cambiar' : 'Subir logo'}</button>${brand.logo ? '<button class="st-btn st-btn-ghost" data-act="remove-logo">Quitar</button>' : ''}</div>
        </div>
      </div>
      <label class="st-field"><span>Nombre</span><input data-input="brand-name" value="${esc(brand.name)}"></label>
      <label class="st-field"><span>Monograma</span><input data-input="brand-mono" maxlength="4" value="${esc(brand.monogram)}"></label>
      <label class="st-field"><span>Lema</span><input data-input="brand-tag" value="${esc(brand.tagline)}"></label>
      <h3 class="st-h3">Colores</h3>
      <div class="st-brand-colors">${brand.colors.map((c, i) => `
        <label class="st-bcolor"><input type="color" value="${c}" data-input="brand-color" data-i="${i}"><span style="background:${c}"></span><small>${esc(brand.colorNames[i] || `Color ${i + 1}`)}</small></label>`).join('')}</div>
      <p class="st-muted st-tiny">1 fondo · 2 texto claro · 3 acento · 4 superficie · 5 texto suave</p>
      <h3 class="st-h3">Tipografías</h3>
      <label class="st-field"><span>Titulares</span><select data-input="brand-head">${FONTS.map(f => `<option ${f === brand.head ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
      <label class="st-field"><span>Textos</span><select data-input="brand-body">${FONTS.map(f => `<option ${f === brand.body ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
      <div class="st-brand-preview">
        <span style="font-family:'${brand.head}'">${esc(brand.name)}</span>
        <small style="font-family:'${brand.body}'">${esc(brand.tagline)}</small>
      </div>
      <button class="st-btn st-btn-ghost w-full" data-act="reset-brand">Restablecer kit</button>`;
  },
  uploads() {
    const list = Array.from(uploads.values()).sort((a, b) => b.t - a.t);
    return `<button class="st-btn st-btn-big" data-act="upload">${icon('upload', 18)} Subir fotos o renders</button>
      <p class="st-muted">También puedes arrastrarlas al lienzo. Si tienes un marco seleccionado, la foto va dentro.</p>
      ${list.length ? `<div class="st-up-grid">${list.map(u => `
        <div class="st-up"><button class="st-up-img" data-act="use-upload" data-v="${u.id}"><img src="${u.data}" alt=""></button><button class="st-up-x" data-act="del-upload" data-v="${u.id}" title="Borrar">${icon('x', 12)}</button></div>`).join('')}</div>`
        : `<div class="st-empty">${icon('image', 28)}<span>Aquí aparecerán tus fotos</span></div>`}`;
  },
  background() {
    const p = pg();
    const solids = ['$0', '$1', '$2', '$3', '$4', '#ffffff', '#000000', '#1c1a17', '#e9e1d4', '#d8cfc2', '#3b3a36', '#5b4a3a'];
    const grads = [['linear', '$0', '$3'], ['linear', '$3', '$0'], ['radial', '$0', '$3'], ['linear', '#1a1714', '#3a2f24'], ['linear', '$1', '#d9cdbb'], ['radial', '#0e0e10', '#2c2620']];
    const glows = [['Ninguno', null], ['Arriba', [0.5, 0, 0.8]], ['Esquina', [0, 0, 0.7]], ['Lateral', [1, 0.4, 0.7]], ['Centro', [0.5, 0.5, 0.6]], ['Abajo', [0.5, 1, 0.8]]];
    const ups = Array.from(uploads.values()).slice(0, 8);
    return `<h3 class="st-h3">Color</h3>
      <div class="st-sw-grid">${solids.map(c => `<button class="st-sw ${p.bg.type === 'solid' && p.bg.c1 === c ? 'is-on' : ''}" data-act="bg-solid" data-v="${c}" style="background:${rc(c)}" title="${c[0] === '$' ? 'Color de marca' : c}"></button>`).join('')}
        <label class="st-sw st-sw-custom" title="Otro color"><input type="color" data-input="bg-custom" value="${rc(p.bg.c1)}">+</label></div>
      <h3 class="st-h3">Degradados</h3>
      <div class="st-sw-grid">${grads.map(([t, a, b], i) => `<button class="st-sw st-sw-lg" data-act="bg-grad" data-v="${i}" style="background:${t === 'radial' ? `radial-gradient(circle at 50% 35%, ${rc(b)}, ${rc(a)})` : `linear-gradient(160deg, ${rc(a)}, ${rc(b)})`}"></button>`).join('')}</div>
      <h3 class="st-h3">Luz ambiental</h3>
      <div class="st-chip-row">${glows.map(([n, g], i) => `<button class="st-chip ${(!g && !p.glow?.on) || (g && p.glow?.on && p.glow.x === g[0] && p.glow.y === g[1]) ? 'is-on' : ''}" data-act="bg-glow" data-v="${i}">${n}</button>`).join('')}</div>
      ${p.glow?.on ? `<label class="st-field st-field-row"><span>Intensidad</span><input type="range" min="0.05" max="0.6" step="0.01" value="${p.glow.a}" data-input="glow-a"></label>
      <div class="st-field st-field-row"><span>Color de la luz</span>${swatchBtn('pick-glow', p.glow.color, 'Color de la luz')}</div>` : ''}
      <h3 class="st-h3">Textura</h3>
      <div class="st-chip-row">
        <button class="st-chip ${p.grain ? 'is-on' : ''}" data-act="bg-grain">Grano de película</button>
        ${[['none', 'Sin retícula'], ['dots', 'Puntos'], ['lines', 'Retícula']].map(([g, n]) => `<button class="st-chip ${p.grid === g ? 'is-on' : ''}" data-act="bg-grid" data-v="${g}">${n}</button>`).join('')}
      </div>
      <h3 class="st-h3">Foto de fondo</h3>
      ${ups.length ? `<div class="st-up-grid st-up-grid-sm">${ups.map(u => `<button class="st-up-img ${p.bg.img === 'up:' + u.id ? 'is-on' : ''}" data-act="bg-img" data-v="${u.id}"><img src="${u.data}" alt=""></button>`).join('')}</div>` : '<p class="st-muted">Sube fotos en <b>Subidas</b> para usarlas de fondo.</p>'}
      ${p.bg.type === 'image' ? `<label class="st-field st-field-row"><span>Oscurecer</span><input type="range" min="0" max="0.9" step="0.01" value="${p.bg.tint}" data-input="bg-tint"></label><button class="st-btn st-btn-ghost w-full" data-act="bg-solid" data-v="${p.bg.c1}">Quitar foto de fondo</button>` : ''}
      <button class="st-btn st-btn-ghost w-full" data-act="bg-all">Usar este fondo en todas las páginas</button>`;
  },
  projects() {
    const list = state.designs.slice().sort((a, b) => b.updated - a.updated);
    return `<button class="st-btn st-btn-big" data-drawer="templates">${icon('plus', 18)} Crear un diseño</button>
      <h3 class="st-h3">Tus diseños</h3>
      <div class="st-proj-grid">${list.map(d => `
        <div class="st-proj ${d.id === dsg().id ? 'is-on' : ''}">
          <button class="st-proj-img" data-act="open-design" data-v="${d.id}">${d.thumb ? `<img src="${d.thumb}" alt="">` : ''}</button>
          <div class="st-proj-meta"><b>${esc(d.name)}</b><small>${new Date(d.updated).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · ${d.pages.length} p.</small></div>
          <div class="st-proj-acts"><button data-act="dup-design" data-v="${d.id}" title="Duplicar">${icon('dup', 14)}</button><button data-act="del-design" data-v="${d.id}" title="Eliminar">${icon('trash', 14)}</button></div>
        </div>`).join('')}</div>`;
  }
};

function paintTemplateThumbs() {
  if (!tplThumbs) tplThumbs = {};
  $$('canvas[data-tpl]', root).forEach(c => {
    const t = TEMPLATES.find(x => x.id === c.dataset.tpl);
    const d = t.build();
    refitDesign(d);
    const w = 260, k = w / d.w;
    c.width = w; c.height = Math.round(d.h * k);
    const x = c.getContext('2d');
    x.scale(k, k);
    drawPage(x, d.pages[0], d.w, d.h, null);
  });
}
function refitDesign(d) { d.pages.forEach(p => p.els.forEach(fitText)); }

/* ---------- Panel derecho ---------- */
function renderRight() {
  const box = $('#stRight');
  const el = selEl();
  if (!state.right || !el) { box.hidden = true; root.classList.remove('has-right'); return; }
  box.hidden = false;
  root.classList.add('has-right');
  if (state.right === 'animate') {
    const an = el.anim || { type: 'none', delay: 0, dur: 0.8 };
    box.innerHTML = `<div class="st-right-head"><h3>Animación</h3><button class="st-iconbtn" data-act="right-close">${icon('x', 18)}</button></div>
      <div class="st-anim-grid">${ANIMS.filter(a => a.id !== 'type' || el.type === 'text').map(a => `
        <button class="st-anim ${an.type === a.id ? 'is-on' : ''}" data-act="set-anim" data-v="${a.id}"><span class="st-anim-demo st-anim-${a.id}">Aa</span><small>${a.name}</small></button>`).join('')}</div>
      <label class="st-field st-field-row"><span>Empieza a los</span><input class="st-num" type="number" min="0" max="20" step="0.1" value="${an.delay}" data-input="anim-delay"> s</label>
      <label class="st-field st-field-row"><span>Duración</span><input class="st-num" type="number" min="0.1" max="5" step="0.1" value="${an.dur}" data-input="anim-dur"> s</label>
      <button class="st-btn w-full" data-act="preview-page">${icon('play', 14)} Ver esta página animada</button>`;
  } else {
    box.innerHTML = `<div class="st-right-head"><h3>Posición</h3><button class="st-iconbtn" data-act="right-close">${icon('x', 18)}</button></div>
      <h4 class="st-h4">Capas</h4>
      <div class="st-btngrid2">
        <button class="st-btn st-btn-ghost" data-act="layer" data-v="up">Adelante</button><button class="st-btn st-btn-ghost" data-act="layer" data-v="down">Atrás</button>
        <button class="st-btn st-btn-ghost" data-act="layer" data-v="top">Al frente</button><button class="st-btn st-btn-ghost" data-act="layer" data-v="bottom">Al fondo</button>
      </div>
      <h4 class="st-h4">Alinear con la página</h4>
      <div class="st-btngrid3">${[['left', 'Izquierda'], ['hcenter', 'Centro'], ['right', 'Derecha'], ['top', 'Arriba'], ['vcenter', 'Medio'], ['bottom', 'Abajo']].map(([v, n]) => `<button class="st-btn st-btn-ghost" data-act="align-page" data-v="${v}">${n}</button>`).join('')}</div>
      <h4 class="st-h4">Medidas</h4>
      <div class="st-btngrid2">
        <label class="st-field"><span>X</span><input type="number" value="${Math.round(el.x)}" data-input="pos-x"></label>
        <label class="st-field"><span>Y</span><input type="number" value="${Math.round(el.y)}" data-input="pos-y"></label>
        <label class="st-field"><span>Ancho</span><input type="number" value="${Math.round(el.w)}" data-input="pos-w"></label>
        <label class="st-field"><span>Alto</span><input type="number" value="${Math.round(el.h)}" data-input="pos-h" ${el.type === 'text' ? 'disabled' : ''}></label>
        <label class="st-field"><span>Rotación</span><input type="number" value="${Math.round(el.rot || 0)}" data-input="pos-rot"></label>
      </div>
      <h4 class="st-h4">Capas de esta página</h4>
      <div class="st-layers">${pg().els.slice().reverse().map(e => `<button class="st-layer ${e.id === el.id ? 'is-on' : ''}" data-act="select-el" data-v="${e.id}"><span class="st-layer-t">${e.type === 'text' ? 'T' : e.type === 'image' ? '▣' : e.type === 'logo' ? '◎' : '◆'}</span>${esc(e.type === 'text' ? e.text.slice(0, 28) : e.type === 'image' ? 'Foto' : e.type === 'logo' ? 'Logo' : 'Forma')}</button>`).join('')}</div>`;
  }
}

/* ---------- Ventanas flotantes ---------- */
function closeFloating() {
  $('#stPop').hidden = true;
  $('#stCmenu').hidden = true;
  $$('.st-menu', root).forEach(m => m.classList.remove('is-open'));
}
function openPop(anchor, html, onBind) {
  const pop = $('#stPop');
  pop.innerHTML = html;
  pop.hidden = false;
  const r = anchor.getBoundingClientRect();
  const pr = pop.getBoundingClientRect();
  let left = r.left, top = r.bottom + 8;
  if (left + pr.width > innerWidth - 12) left = innerWidth - pr.width - 12;
  if (top + pr.height > innerHeight - 12) top = Math.max(12, r.top - pr.height - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  if (onBind) onBind(pop);
}

function docColors() {
  const set = new Set();
  dsg().pages.forEach(p => { set.add(p.bg.c1); p.els.forEach(e => { if (e.color) set.add(e.color); if (e.fill) set.add(e.fill); }); });
  return Array.from(set).filter(c => c && c[0] === '#').slice(0, 10);
}
let colorCb = null;
function openColor(anchor, current, cb, allowNone) {
  colorCb = cb;
  const presets = ['#ffffff', '#000000', '#f5f0e8', '#e6dccd', '#c8a97e', '#a88b5f', '#6f6a62', '#3a3632', '#1c1a17', '#8a9a8c', '#9b6b52', '#2f3b4a'];
  openPop(anchor, `
    <div class="st-pop-in st-colorpop">
      <h4 class="st-h4">Colores de tu marca</h4>
      <div class="st-sw-grid">${brand.colors.map((c, i) => `<button class="st-sw ${current === '$' + i ? 'is-on' : ''}" data-color="$${i}" style="background:${c}" title="${esc(brand.colorNames[i] || '')}"></button>`).join('')}
        ${allowNone ? `<button class="st-sw st-sw-none ${!current ? 'is-on' : ''}" data-color="" title="Sin color"></button>` : ''}</div>
      ${docColors().length ? `<h4 class="st-h4">En este diseño</h4><div class="st-sw-grid">${docColors().map(c => `<button class="st-sw ${current === c ? 'is-on' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}</div>` : ''}
      <h4 class="st-h4">Neutros premium</h4>
      <div class="st-sw-grid">${presets.map(c => `<button class="st-sw ${current === c ? 'is-on' : ''}" data-color="${c}" style="background:${c}"></button>`).join('')}</div>
      <label class="st-hexrow"><input type="color" value="${rc(current) && rc(current)[0] === '#' ? rc(current).slice(0, 7) : '#c8a97e'}" data-color-input><input type="text" value="${rc(current)}" data-hex maxlength="7"></label>
    </div>`, (pop) => {
    pop.onclick = (e) => { const b = e.target.closest('[data-color]'); if (b) { colorCb(b.dataset.color); closeFloating(); } };
    $('[data-color-input]', pop).oninput = (e) => colorCb(e.target.value);
    $('[data-hex]', pop).onchange = (e) => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) colorCb(e.target.value); };
  });
}

function openFontPop(anchor, el) {
  openPop(anchor, `<div class="st-pop-in st-fontpop">
    <h4 class="st-h4">Fuentes de tu marca</h4>
    <button class="st-fontopt ${el.font === '$head' ? 'is-on' : ''}" data-font="$head" style="font-family:'${brand.head}'">${brand.head}<small>Titulares</small></button>
    <button class="st-fontopt ${el.font === '$body' ? 'is-on' : ''}" data-font="$body" style="font-family:'${brand.body}'">${brand.body}<small>Textos</small></button>
    <h4 class="st-h4">Todas las fuentes</h4>
    ${FONTS.map(f => `<button class="st-fontopt ${el.font === f ? 'is-on' : ''}" data-font="${f}" style="font-family:'${f}'">${f}</button>`).join('')}
    <h4 class="st-h4">Peso</h4>
    <div class="st-seg">${[[300, 'Light'], [400, 'Regular'], [500, 'Medium'], [600, 'Semi'], [700, 'Bold']].map(([w, n]) => `<button class="${el.weight === w ? 'is-on' : ''}" data-weight="${w}">${n}</button>`).join('')}</div>
  </div>`, (pop) => {
    pop.onclick = (e) => {
      const f = e.target.closest('[data-font]');
      const w = e.target.closest('[data-weight]');
      if (f) { el.font = f.dataset.font; }
      else if (w) { el.weight = +w.dataset.weight; }
      else return;
      fitText(el); commit(); renderStage(); renderCtx(); closeFloating();
    };
  });
}

/* ---------- Acciones ---------- */
function select(id) {
  if (state.editing) endEdit();
  state.sel = id;
  if (!id) state.right = state.right && null;
  renderCtx(); renderRight(); renderSelection();
}
function contrastColor() { return lum(pg().bg.c1) < 0.5 ? '$1' : '$0'; }
function addEl(el, opts = {}) {
  const d = dsg();
  if (el.type === 'text') fitText(el);
  if (!opts.keepPos) { el.x = (d.w - el.w) / 2; el.y = (d.h - el.h) / 2; }
  pg().els.push(el);
  commit();
  select(el.id);
  renderStage();
}

function onClick(e) {
  const dr = e.target.closest('[data-drawer]');
  if (dr) {
    const id = dr.dataset.drawer;
    state.drawer = state.drawer === id && dr.classList.contains('st-rail-btn') ? null : id;
    renderDrawer();
    if (state.fit) { fitZoom(); layoutStage(); }
    return;
  }
  const b = e.target.closest('[data-act]');
  if (!b) { if (!e.target.closest('.st-pop, .st-menu, .st-cmenu')) closeFloating(); return; }
  const act = b.dataset.act, v = b.dataset.v;
  const el = selEl();
  const d = dsg();
  if (!act.startsWith('pick') && !act.startsWith('pop-') && !act.startsWith('menu') && act !== 'pick-font') closeFloating();

  switch (act) {
    case 'close': close(); break;
    case 'undo': undo(); break;
    case 'redo': redo(); break;
    case 'menu-resize': {
      const m = $('#stMenuResize');
      m.innerHTML = Object.entries(FORMATS).map(([k, f]) => `<button data-act="resize" data-v="${k}">${f.name}<small>${f.ratio} · ${f.w}×${f.h}</small></button>`).join('');
      m.classList.toggle('is-open'); break;
    }
    case 'menu-download': $('#stMenuDownload').classList.toggle('is-open'); break;
    case 'resize': resizeDesign(FORMATS[v]); break;
    case 'fit': state.fit = true; fitZoom(); layoutStage(); break;
    case 'play-all': togglePlay(); break;
    case 'preview-page': playPage(); break;
    case 'dl-png': exportImage('png', [state.page]); break;
    case 'dl-jpg': exportImage('jpeg', [state.page]); break;
    case 'dl-all': exportImage('png', d.pages.map((_, i) => i)); break;
    case 'dl-mp4': exportVideo(); break;

    case 'add-page': d.pages.splice(state.page + 1, 0, PAGE([], { bg: clone(pg().bg), glow: clone(pg().glow), grain: pg().grain, grid: pg().grid })); state.page++; state.sel = null; commit(); renderAll(); break;
    case 'dup-page': { const p = clone(pg()); p.id = uid(); p.els.forEach(x => (x.id = uid())); d.pages.splice(state.page + 1, 0, p); state.page++; commit(); renderAll(); break; }
    case 'del-page': if (d.pages.length > 1) { d.pages.splice(state.page, 1); state.page = Math.min(state.page, d.pages.length - 1); state.sel = null; commit(); renderAll(); } break;
    case 'magic-anim': magicAnimate(); break;

    case 'use-tpl': { const t = TEMPLATES.find(x => x.id === v); openDesign(t.build(), true); toast(`Plantilla “${t.name}” lista`); break; }
    case 'new-blank': openDesign(newDesign(v), true); break;
    case 'open-design': { const x = state.designs.find(y => y.id === v); if (x) openDesign(clone(x)); break; }
    case 'dup-design': { const x = clone(state.designs.find(y => y.id === v)); x.id = uid(); x.name += ' (copia)'; x.updated = Date.now(); DB.put('designs', x).then(refreshDesigns); break; }
    case 'del-design':
      if (v === d.id) { toast('Abre otro diseño antes de eliminar este'); break; }
      if (confirm('¿Eliminar este diseño? No se puede deshacer.')) DB.del('designs', v).then(refreshDesigns);
      break;

    case 'add-shape': {
      const sh = v === 'rounded' ? S('rect', { radius: 60 }) : S(v);
      if (v === 'line') { sh.w = 500; sh.h = 4; }
      else { sh.w = 420; sh.h = v === 'pill' ? 160 : v === 'arch' ? 520 : 420; }
      addEl(sh); break;
    }
    case 'add-frame': addEl(IMG({ mask: v, w: 600, h: v === 'arch' ? 760 : 600 })); break;
    case 'add-logo': addEl(LOGO({ w: 260, h: 260, color: '$2' })); break;
    case 'add-number': addEl(T('01', { font: '$head', size: 180, color: '$2', w: 360, op: 0.6 })); break;
    case 'add-divider': addEl(S('rect', { w: 160, h: 2, fill: '$2', anim: { type: 'wipe', delay: 0, dur: 0.8 } })); break;
    case 'add-tag': addEl(T('NUEVO PROYECTO', { size: 26, weight: 600, upper: true, ls: 7, color: '$2', align: 'center', w: 700 })); break;
    case 'add-button': {
      const w = 600, h = 120, x = (d.w - w) / 2, y = d.h * 0.72;
      const pill = S('pill', { x, y, w, h, fill: '$2', anim: { type: 'pop', delay: 0, dur: 0.7 } });
      const tx = T('Escríbeme “PROYECTO”', { size: 40, weight: 700, color: '$0', align: 'center', x, w, anim: { type: 'pop', delay: 0.05, dur: 0.7 } });
      fitText(tx); tx.y = y + (h - tx.h) / 2;
      pg().els.push(pill, tx); commit(); select(tx.id); renderStage(); break;
    }
    case 'add-text': {
      const c = contrastColor();
      const presets = {
        h: T('Añade un título', { font: '$head', size: 120, weight: 500, align: 'center', color: c, w: Math.min(900, d.w - 160), lh: 1.05 }),
        s: T('Añade un subtítulo', { size: 56, weight: 600, align: 'center', color: c, w: Math.min(800, d.w - 160) }),
        b: T('Escribe aquí un texto corto que cuente tu idea con calma y claridad.', { size: 36, color: c === '$1' ? '$4' : '$3', lh: 1.45, align: 'center', w: Math.min(760, d.w - 160) }),
        k: T('Etiqueta', { size: 26, weight: 600, upper: true, ls: 7, color: '$2', align: 'center', w: 600 })
      };
      addEl(presets[v]); break;
    }
    case 'add-pair': {
      const p = FONT_PAIRS[+v], c = contrastColor();
      const a = T('Título elegante', { font: p.head, size: 112, weight: 500, align: 'center', color: c, w: Math.min(900, d.w - 160), lh: 1.05 });
      const s2 = T('Un subtítulo que acompaña', { font: p.body, size: 38, align: 'center', color: '$2', w: Math.min(800, d.w - 160) });
      fitText(a); fitText(s2);
      a.x = (d.w - a.w) / 2; s2.x = (d.w - s2.w) / 2;
      a.y = d.h / 2 - a.h - 10; s2.y = d.h / 2 + 30;
      pg().els.push(a, s2); commit(); select(a.id); renderStage(); break;
    }

    case 'upload': $('#stFile').click(); break;
    case 'use-upload': useUpload(v); break;
    case 'del-upload': uploads.delete(v); DB.del('uploads', v); renderDrawer(); break;
    case 'upload-logo': $('#stLogoFile').click(); break;
    case 'remove-logo': brand.logo = null; saveBrand(); renderDrawer(); requestRender(true); break;
    case 'reset-brand': if (confirm('¿Volver al kit de marca original?')) { brand = clone(DEFAULT_BRAND); saveBrand(); refitAllText(); renderAll(); } break;

    case 'bg-solid': pg().bg = { ...pg().bg, type: 'solid', c1: v, img: null }; commit(); renderStage(); renderDrawer(); renderCtx(); break;
    case 'bg-grad': { const g = [['linear', '$0', '$3'], ['linear', '$3', '$0'], ['radial', '$0', '$3'], ['linear', '#1a1714', '#3a2f24'], ['linear', '$1', '#d9cdbb'], ['radial', '#0e0e10', '#2c2620']][+v]; pg().bg = { ...pg().bg, type: g[0], c1: g[1], c2: g[2], img: null }; commit(); renderStage(); renderDrawer(); break; }
    case 'bg-glow': { const g = [null, [0.5, 0, 0.8], [0, 0, 0.7], [1, 0.4, 0.7], [0.5, 0.5, 0.6], [0.5, 1, 0.8]][+v]; pg().glow = g ? { ...(pg().glow || {}), on: true, color: pg().glow?.color || '$2', a: pg().glow?.a || 0.22, x: g[0], y: g[1], size: g[2] } : { ...(pg().glow || {}), on: false }; commit(); renderStage(); renderDrawer(); break; }
    case 'bg-grain': pg().grain = !pg().grain; commit(); renderStage(); renderDrawer(); break;
    case 'bg-grid': pg().grid = v; commit(); renderStage(); renderDrawer(); break;
    case 'bg-img': pg().bg = { ...pg().bg, type: 'image', img: 'up:' + v, tint: pg().bg.tint ?? 0.45 }; commit(); renderStage(); renderDrawer(); break;
    case 'bg-all': d.pages.forEach(p => { if (p !== pg()) { p.bg = clone(pg().bg); p.glow = clone(pg().glow); p.grain = pg().grain; p.grid = pg().grid; } }); commit(); renderAll(); toast('Fondo aplicado a todas las páginas'); break;
    case 'pick-bg': openColor(b, pg().bg.c1, (c) => { pg().bg = { ...pg().bg, type: 'solid', c1: c || '$0' }; commit(); renderStage(); renderCtx(); }); break;
    case 'pick-glow': openColor(b, pg().glow.color, (c) => { pg().glow.color = c || '$2'; commit(); renderStage(); renderDrawer(); }); break;

    case 'pick-color': if (el) openColor(b, el.color, (c) => { el.color = c || '$1'; commit(); renderStage(); renderCtx(); }); break;
    case 'pick-fill': if (el) openColor(b, el.fill, (c) => { el.fill = c; commit(); renderStage(); renderCtx(); }, true); break;
    case 'pick-stroke': if (el) openColor(b, el.stroke, (c) => { el.stroke = c; if (c && !el.sw) el.sw = 4; commit(); renderStage(); renderCtx(); }, true); break;
    case 'pick-logo': if (el) openColor(b, el.color, (c) => { el.color = c || '$2'; commit(); renderStage(); renderCtx(); }); break;
    case 'pick-font': if (el) openFontPop(b, el); break;
    case 'size-': case 'size+': if (el) { const steps = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 110, 120, 140, 160, 180, 200, 240, 280, 320, 400]; const cur = el.size; el.size = act === 'size+' ? (steps.find(s => s > cur) || cur + 40) : (steps.slice().reverse().find(s => s < cur) || Math.max(8, cur - 4)); fitText(el); commit(); renderStage(); renderCtx(); } break;
    case 'bold': if (el) { el.weight = el.weight >= 600 ? 400 : 700; fitText(el); commit(); renderStage(); renderCtx(); } break;
    case 'italic': if (el) { el.italic = !el.italic; fitText(el); commit(); renderStage(); renderCtx(); } break;
    case 'align': if (el) { el.align = { left: 'center', center: 'right', right: 'left' }[el.align] || 'left'; commit(); renderStage(); renderCtx(); } break;
    case 'upper': if (el) { el.upper = !el.upper; fitText(el); commit(); renderStage(); renderCtx(); } break;
    case 'pop-spacing': if (el) openPop(b, `<div class="st-pop-in"><label class="st-field"><span>Espaciado entre letras</span><input type="range" min="-5" max="30" step="0.5" value="${el.ls}" data-input="ls"></label><label class="st-field"><span>Interlineado</span><input type="range" min="0.8" max="2.2" step="0.01" value="${el.lh}" data-input="lh"></label></div>`); break;
    case 'pop-opacity': if (el) openPop(b, `<div class="st-pop-in"><label class="st-field"><span>Transparencia</span><input type="range" min="0.05" max="1" step="0.01" value="${el.op}" data-input="op"></label></div>`); break;
    case 'lock': if (el) { el.locked = !el.locked; commit(); renderCtx(); renderSelection(); } break;
    case 'duplicate': duplicateSel(); break;
    case 'delete': deleteSel(); break;
    case 'mask': if (el) { el.mask = v; commit(); renderStage(); renderCtx(); } break;
    case 'logo-style': if (el) { el.style = v; commit(); renderStage(); renderCtx(); } break;
    case 'replace-img': state.drawer = 'uploads'; renderDrawer(); if (!uploads.size) $('#stFile').click(); break;

    case 'right-animate': state.right = state.right === 'animate' ? null : 'animate'; renderRight(); renderCtx(); break;
    case 'right-position': state.right = state.right === 'position' ? null : 'position'; renderRight(); renderCtx(); break;
    case 'right-close': state.right = null; renderRight(); renderCtx(); break;
    case 'set-anim': if (el) { el.anim = { ...(el.anim || { delay: 0, dur: 0.8 }), type: v }; commit(); renderRight(); playPage(); } break;
    case 'layer': layer(v); break;
    case 'align-page': if (el) { if (v === 'left') el.x = 0; if (v === 'hcenter') el.x = (d.w - el.w) / 2; if (v === 'right') el.x = d.w - el.w; if (v === 'top') el.y = 0; if (v === 'vcenter') el.y = (d.h - el.h) / 2; if (v === 'bottom') el.y = d.h - el.h; commit(); renderStage(); renderRight(); } break;
    case 'select-el': select(v); break;
    case 'cm-copy': copySel(); break;
    case 'cm-paste': paste(); break;
    default: break;
  }
  const pageBtn = e.target.closest('[data-page]');
  if (pageBtn && !b) { /* manejado abajo */ }
}
// clic en miniaturas de página (no tienen data-act para no interferir con arrastrar)
document.addEventListener('click', (e) => {
  const p = e.target.closest('.st-page');
  if (!p || !root || root.hidden) return;
  if (state.playing) stopPlay();
  state.page = +p.dataset.page;
  state.sel = null;
  renderAll();
});

function onInput(e) {
  const t = e.target;
  const k = t.dataset.input;
  if (!k) return;
  const el = selEl();
  const v = t.value;
  switch (k) {
    case 'size': if (el && +v > 0) { el.size = +v; fitText(el); renderStage(); } break;
    case 'ls': if (el) { el.ls = +v; fitText(el); renderStage(); } break;
    case 'lh': if (el) { el.lh = +v; fitText(el); renderStage(); } break;
    case 'op': if (el) { el.op = +v; renderStage(); } break;
    case 'sw': if (el) { el.sw = +v; renderStage(); } break;
    case 'lineh': if (el) { el.h = Math.max(1, +v); renderStage(); } break;
    case 'radius': if (el) { el.radius = +v; renderStage(); } break;
    case 'page-dur': if (+v >= 1) { pg().dur = +v; renderPages(); } break;
    case 'anim-delay': if (el) el.anim.delay = Math.max(0, +v); break;
    case 'anim-dur': if (el) el.anim.dur = Math.max(0.1, +v); break;
    case 'pos-x': if (el) { el.x = +v; renderStage(); } break;
    case 'pos-y': if (el) { el.y = +v; renderStage(); } break;
    case 'pos-w': if (el && +v > 4) { el.w = +v; fitText(el); renderStage(); } break;
    case 'pos-h': if (el && +v > 1) { el.h = +v; renderStage(); } break;
    case 'pos-rot': if (el) { el.rot = +v; renderStage(); } break;
    case 'glow-a': pg().glow.a = +v; renderStage(); break;
    case 'bg-tint': pg().bg.tint = +v; renderStage(); break;
    case 'bg-custom': pg().bg = { ...pg().bg, type: 'solid', c1: v }; renderStage(); break;
    case 'brand-name': brand.name = v; saveBrand(); break;
    case 'brand-mono': brand.monogram = v.toUpperCase(); saveBrand(); requestRender(true); break;
    case 'brand-tag': brand.tagline = v; saveBrand(); break;
    case 'brand-color': brand.colors[+t.dataset.i] = v; t.nextElementSibling.style.background = v; saveBrand(); requestRender(true); break;
    default: return;
  }
  clearTimeout(onInput.t);
  onInput.t = setTimeout(commit, 400);
}
function onChange(e) {
  const k = e.target.dataset.input;
  if (k === 'brand-head' || k === 'brand-body') {
    brand[k === 'brand-head' ? 'head' : 'body'] = e.target.value;
    saveBrand();
    ensureFont(brand.head, 500); ensureFont(brand.body, 400);
    refitAllText(); renderAll();
  }
  if (k === 'brand-name' || k === 'brand-tag' || k === 'brand-mono') renderDrawer();
  if (['pos-x', 'pos-y', 'pos-w', 'pos-h', 'pos-rot', 'page-dur', 'anim-delay', 'anim-dur'].includes(k)) { commit(); renderSelection(); }
}

function magicAnimate() {
  const els = pg().els;
  // ordenar de arriba abajo y escalonar
  const order = els.slice().sort((a, b) => a.y - b.y);
  order.forEach((el, i) => {
    const big = el.type === 'text' && el.size >= 80;
    el.anim = { type: el.type === 'image' ? 'zoom' : el.type === 'logo' ? 'pop' : el.type === 'shape' ? (el.shape === 'rect' && el.h <= 6 ? 'wipe' : 'fade') : big ? 'rise' : 'fade', delay: +(0.15 + i * 0.22).toFixed(2), dur: big ? 1 : 0.8 };
  });
  commit();
  playPage();
  toast('Animación elegante aplicada a la página');
}

function layer(v) {
  const els = pg().els, el = selEl();
  if (!el) return;
  const i = els.indexOf(el);
  els.splice(i, 1);
  const to = v === 'up' ? Math.min(els.length, i + 1) : v === 'down' ? Math.max(0, i - 1) : v === 'top' ? els.length : 0;
  els.splice(to, 0, el);
  commit(); renderStage(); renderRight();
}
function duplicateSel() {
  const el = selEl();
  if (!el) return;
  const c = clone(el); c.id = uid(); c.x += 30; c.y += 30;
  pg().els.push(c); commit(); select(c.id); renderStage();
}
function deleteSel() {
  const el = selEl();
  if (!el) return;
  pg().els = pg().els.filter(x => x !== el);
  state.sel = null; state.right = null;
  commit(); renderStage(); renderCtx(); renderRight();
}
function copySel() { const el = selEl(); if (el) { state.clipboard = clone(el); toast('Copiado'); } }
function paste() {
  if (!state.clipboard) return;
  const c = clone(state.clipboard); c.id = uid(); c.x += 30; c.y += 30;
  state.clipboard = clone(c);
  pg().els.push(c); commit(); select(c.id); renderStage();
}

function resizeDesign(f) {
  const d = dsg();
  if (!f || (f.w === d.w && f.h === d.h)) return;
  const sx = f.w / d.w, sy = f.h / d.h, s = Math.min(sx, sy);
  d.pages.forEach(p => p.els.forEach(el => {
    if (el.type === 'image' && el.x <= 1 && el.y <= 1 && el.w >= d.w - 2 && el.h >= d.h - 2) { el.w = f.w; el.h = f.h; return; } // foto a sangre
    const cx = (el.x + el.w / 2) * sx, cy = (el.y + el.h / 2) * sy;
    el.w *= s; el.h *= s;
    if (el.type === 'text') { el.size *= s; el.w = Math.min(f.w - 60, el.w * (sx / s > 1.2 ? 1.25 : 1)); fitText(el); }
    el.x = cx - el.w / 2; el.y = cy - el.h / 2;
  }));
  d.w = f.w; d.h = f.h;
  state.fit = true;
  commit(); renderAll();
  toast(`Diseño adaptado a ${f.ratio}`);
}

/* ---------- Subidas ---------- */
async function handleFiles(files, dropPoint) {
  const list = Array.from(files || []).filter(f => f.type.startsWith('image/'));
  if (!list.length) return;
  let last = null;
  for (const f of list) {
    try {
      const r = await fileToData(f);
      const u = { id: uid(), data: r.data, w: r.w, h: r.h, name: f.name, t: Date.now() };
      uploads.set(u.id, u);
      DB.put('uploads', u).catch(() => toast('La foto es muy pesada para guardarla, pero puedes usarla ahora'));
      last = u;
    } catch (e) { toast(`No se pudo leer ${f.name}`); }
  }
  $('#stFile').value = '';
  state.drawer = 'uploads';
  renderDrawer();
  if (last) useUpload(last.id, dropPoint);
}
function useUpload(id, point) {
  const u = uploads.get(id);
  if (!u) return;
  const el = selEl();
  const d = dsg();
  if (el && el.type === 'image') { el.src = 'up:' + id; commit(); renderStage(); renderCtx(); return; }
  // ¿se soltó sobre un marco vacío?
  if (point) {
    const hit = hitTest(point);
    if (hit && hit.type === 'image') { hit.src = 'up:' + id; commit(); select(hit.id); renderStage(); return; }
  }
  const k = Math.min(d.w * 0.7 / u.w, d.h * 0.6 / u.h);
  const img = IMG({ src: 'up:' + id, w: u.w * k, h: u.h * k });
  addEl(img);
}
function onDrop(e) {
  e.preventDefault();
  stageArea.classList.remove('st-drop');
  if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files, toDesign(e));
}
async function onLogoFile(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = await fileToData(f, 900);
  brand.logo = r.data;
  saveBrand();
  e.target.value = '';
  // poner el logo real en los elementos de logo
  imgCache.clear();
  renderDrawer(); requestRender(true);
  toast('Logo cargado: ya aparece en tus diseños');
}

/* ---------- Puntero: mover, escalar, rotar ---------- */
let drag = null, guides = [];
function toDesign(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / state.zoom, y: (e.clientY - r.top) / state.zoom };
}
function hitTest(p) {
  const els = pg().els;
  for (let i = els.length - 1; i >= 0; i--) {
    const el = els[i];
    const cx = el.x + el.w / 2, cy = el.y + el.h / 2, a = -(el.rot || 0) * Math.PI / 180;
    const dx = p.x - cx, dy = p.y - cy;
    const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
    const pad = 6 / state.zoom;
    if (Math.abs(lx) <= el.w / 2 + pad && Math.abs(ly) <= Math.max(el.h, 8) / 2 + pad) return el;
  }
  return null;
}
function onPointerDown(e) {
  if (e.button === 2) return;
  if (state.playing) { stopPlay(); return; }
  closeFloating();
  const p = toDesign(e);
  const h = e.target.closest('[data-h]');
  const el = selEl();
  if (h && el && !el.locked) {
    drag = { mode: h.dataset.h === 'rot' ? 'rot' : 'resize', h: h.dataset.h, start: p, orig: clone(el), moved: false };
  } else {
    const hit = hitTest(p);
    if (!hit) { select(null); return; }
    if (hit.id !== state.sel) select(hit.id);
    if (hit.locked) return;
    drag = { mode: 'move', start: p, orig: clone(hit), moved: false };
  }
  overlay.setPointerCapture(e.pointerId);
}
function onPointerMove(e) {
  const p = toDesign(e);
  if (!drag) {
    const hit = hitTest(p);
    const id = hit ? hit.id : null;
    if (id !== state.hover) { state.hover = id; renderSelection(); }
    overlay.style.cursor = hit ? (hit.locked ? 'default' : 'move') : 'default';
    return;
  }
  const el = selEl();
  if (!el) return;
  const o = drag.orig, d = dsg();
  const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
  if (!drag.moved && Math.hypot(dx, dy) * state.zoom < 3) return;
  drag.moved = true;
  guides = [];

  if (drag.mode === 'move') {
    let nx = o.x + dx, ny = o.y + dy;
    if (!e.altKey) {
      const th = 7 / state.zoom;
      const xs = [0, d.w / 2, d.w], ys = [0, d.h / 2, d.h];
      pg().els.forEach(x => { if (x.id !== el.id) { xs.push(x.x, x.x + x.w / 2, x.x + x.w); ys.push(x.y, x.y + x.h / 2, x.y + x.h); } });
      const snap = (pos, size, targets, axis) => {
        let best = null;
        [0, size / 2, size].forEach(off => targets.forEach(t => {
          const dd = t - (pos + off);
          if (Math.abs(dd) < th && (!best || Math.abs(dd) < Math.abs(best.dd))) best = { dd, t };
        }));
        if (best) { guides.push({ axis, v: best.t }); return pos + best.dd; }
        return pos;
      };
      nx = snap(nx, el.w, xs, 'x');
      ny = snap(ny, el.h, ys, 'y');
    }
    el.x = nx; el.y = ny;
  } else if (drag.mode === 'rot') {
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    let a = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 90;
    a = ((a % 360) + 360) % 360;
    if (e.shiftKey) a = Math.round(a / 15) * 15;
    else [0, 90, 180, 270, 360].forEach(s => { if (Math.abs(a - s) < 4) a = s % 360; });
    el.rot = Math.round(a * 10) / 10;
  } else {
    const hx = drag.h.includes('e') ? 1 : drag.h.includes('w') ? -1 : 0;
    const hy = drag.h.includes('s') ? 1 : drag.h.includes('n') ? -1 : 0;
    const r = (o.rot || 0) * Math.PI / 180;
    const lx = dx * Math.cos(-r) - dy * Math.sin(-r), ly = dx * Math.sin(-r) + dy * Math.cos(-r);
    let nw = o.w + hx * lx, nh = o.h + hy * ly;
    const corner = hx !== 0 && hy !== 0;
    if (el.type === 'text') {
      if (corner) {
        const s = Math.max(0.1, nw / o.w);
        el.size = Math.max(6, o.size * s);
        nw = o.w * s;
      }
      el.w = Math.max(40, nw);
      fitText(el);
      nh = el.h;
    } else {
      const keep = corner && (el.type === 'image' || el.type === 'logo' || e.shiftKey);
      if (keep) { const s = Math.max(nw / o.w, nh / o.h); nw = o.w * s; nh = o.h * s; }
      nw = Math.max(8, nw);
      nh = el.type === 'shape' && el.shape === 'line' ? o.h : Math.max(8, nh);
      el.w = nw; el.h = nh;
    }
    // mantener fijo el lado opuesto
    const ow = el.type === 'text' && !corner ? el.w : nw;
    const offX = hx * (ow - o.w) / 2, offY = el.type === 'text' ? (corner ? hy * (nh - o.h) / 2 : (nh - o.h) / 2) : hy * (nh - o.h) / 2;
    const ocx = o.x + o.w / 2 + offX * Math.cos(r) - offY * Math.sin(r);
    const ocy = o.y + o.h / 2 + offX * Math.sin(r) + offY * Math.cos(r);
    el.x = ocx - el.w / 2;
    el.y = ocy - el.h / 2;
    if (el.type === 'text' && !corner) el.y = o.y; // el texto crece hacia abajo
  }
  requestRender();
}
function onPointerUp() {
  if (drag && drag.moved) { commit(); renderCtx(); if (state.right === 'position') renderRight(); }
  drag = null;
  if (guides.length) { guides = []; renderSelection(); }
}
function onDblClick(e) {
  const hit = hitTest(toDesign(e));
  if (hit && hit.type === 'text' && !hit.locked) startEdit(hit);
  else if (hit && hit.type === 'image') { select(hit.id); state.drawer = 'uploads'; renderDrawer(); if (!uploads.size) $('#stFile').click(); }
}
function onContext(e) {
  e.preventDefault();
  const hit = hitTest(toDesign(e));
  if (hit) select(hit.id);
  const m = $('#stCmenu');
  m.innerHTML = hit
    ? `<button data-act="cm-copy">Copiar<kbd>Ctrl C</kbd></button><button data-act="cm-paste" ${state.clipboard ? '' : 'disabled'}>Pegar<kbd>Ctrl V</kbd></button><button data-act="duplicate">Duplicar<kbd>Ctrl D</kbd></button><hr><button data-act="layer" data-v="top">Traer al frente</button><button data-act="layer" data-v="bottom">Enviar al fondo</button><button data-act="right-animate">Animar…</button><button data-act="lock">${hit.locked ? 'Desbloquear' : 'Bloquear'}</button><hr><button data-act="delete" class="is-danger">Eliminar<kbd>Supr</kbd></button>`
    : `<button data-act="cm-paste" ${state.clipboard ? '' : 'disabled'}>Pegar<kbd>Ctrl V</kbd></button><button data-act="magic-anim">Animar página</button><button data-act="add-page">Agregar página</button>`;
  m.hidden = false;
  m.style.left = `${Math.min(e.clientX, innerWidth - 230)}px`;
  m.style.top = `${Math.min(e.clientY, innerHeight - m.offsetHeight - 10)}px`;
}
function onWheel(e) {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  state.fit = false;
  state.zoom = clamp(state.zoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.08, 2);
  layoutStage();
}

/* ---------- Edición de texto en el lienzo ---------- */
function startEdit(el) {
  state.sel = el.id;
  state.editing = el.id;
  const ed = $('#stEdit');
  ed.hidden = false;
  ed.value = el.text;
  positionEditor();
  renderStage();
  ed.focus();
  ed.select();
}
function positionEditor() {
  const el = selEl();
  if (!el) return;
  const ed = $('#stEdit');
  const r = canvas.getBoundingClientRect();
  const z = state.zoom;
  Object.assign(ed.style, {
    left: `${r.left + el.x * z}px`, top: `${r.top + el.y * z}px`, width: `${el.w * z + 4}px`, height: `${Math.max(el.h, el.size * el.lh) * z + 6}px`,
    font: `${el.italic ? 'italic ' : ''}${el.weight} ${el.size * z}px "${rf(el.font)}"`, lineHeight: String(el.lh),
    letterSpacing: `${(el.ls || 0) * z}px`, textAlign: el.align, color: rc(el.color), textTransform: el.upper ? 'uppercase' : 'none',
    transform: `rotate(${el.rot || 0}deg)`
  });
}
function onEditInput(e) {
  const el = selEl();
  if (!el) return;
  el.text = e.target.value;
  fitText(el);
  positionEditor();
}
function endEdit() {
  if (!state.editing) return;
  const ed = $('#stEdit');
  ed.hidden = true;
  const el = selEl();
  state.editing = null;
  if (el && !el.text.trim()) { pg().els = pg().els.filter(x => x !== el); state.sel = null; }
  commit();
  renderStage(); renderCtx();
}

/* ---------- Teclado ---------- */
function onKey(e) {
  if (!root || root.hidden) return;
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || state.editing) return;
  const mod = e.ctrlKey || e.metaKey;
  const el = selEl();
  const k = e.key.toLowerCase();
  if (mod && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && k === 'y') { e.preventDefault(); redo(); return; }
  if (mod && k === 'd') { e.preventDefault(); duplicateSel(); return; }
  if (mod && k === 'c') { copySel(); return; }
  if (mod && k === 'v') { e.preventDefault(); paste(); return; }
  if (mod && k === 'b' && el?.type === 'text') { e.preventDefault(); el.weight = el.weight >= 600 ? 400 : 700; fitText(el); commit(); renderStage(); renderCtx(); return; }
  if (mod && k === 'i' && el?.type === 'text') { e.preventDefault(); el.italic = !el.italic; fitText(el); commit(); renderStage(); renderCtx(); return; }
  if (mod && (k === ']' || k === '[')) { e.preventDefault(); layer(k === ']' ? (e.shiftKey ? 'top' : 'up') : (e.shiftKey ? 'bottom' : 'down')); return; }
  if (k === ' ') { e.preventDefault(); togglePlay(); return; }
  if (k === 'escape') { closeFloating(); select(null); return; }
  if (!el) return;
  if (k === 'delete' || k === 'backspace') { e.preventDefault(); deleteSel(); return; }
  if (k === 'enter' && el.type === 'text') { e.preventDefault(); startEdit(el); return; }
  const step = e.shiftKey ? 10 : 1;
  const mv = { arrowleft: [-step, 0], arrowright: [step, 0], arrowup: [0, -step], arrowdown: [0, step] }[k];
  if (mv && !el.locked) { e.preventDefault(); el.x += mv[0]; el.y += mv[1]; renderStage(); clearTimeout(onKey.t); onKey.t = setTimeout(commit, 400); }
}

/* ---------- Reproducción ---------- */
let playRaf = 0, playLast = 0, playRange = null;
function togglePlay() { state.playing ? stopPlay() : startPlay(null); }
function playPage() {
  startPlay({ page: state.page, from: 0, to: pg().dur });
}
function startPlay(range) {
  if (state.editing) endEdit();
  playRange = range;
  state.playing = true;
  state.playT = range ? range.from : 0;
  playLast = 0;
  root.classList.add('is-playing');
  $('#stPlayBtn').innerHTML = icon('pause', 16);
  renderCtx();
  cancelAnimationFrame(playRaf);
  const step = (ts) => {
    if (!state.playing) return;
    if (!playLast) playLast = ts;
    state.playT += (ts - playLast) / 1000;
    playLast = ts;
    const end = playRange ? playRange.to : totalDur(dsg());
    if (state.playT >= end) {
      if (playRange) { stopPlay(); return; }
      state.playT = 0;
    }
    const pi = pageAt(dsg(), state.playT);
    if (!playRange && pi !== state.page) { state.page = pi; $$('.st-page', root).forEach((n, i) => n.classList.toggle('is-active', i === pi)); }
    renderStage();
    playRaf = requestAnimationFrame(step);
  };
  playRaf = requestAnimationFrame(step);
}
function stopPlay() {
  state.playing = false;
  cancelAnimationFrame(playRaf);
  root.classList.remove('is-playing');
  $('#stPlayBtn').innerHTML = icon('play', 16);
  renderAll();
}

/* ---------- Exportar ---------- */
function slug(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'diseno'; }
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
async function exportImage(type, pages) {
  const d = dsg();
  await document.fonts.ready;
  for (const i of pages) {
    const c = document.createElement('canvas');
    c.width = d.w; c.height = d.h;
    drawPage(c.getContext('2d'), d.pages[i], d.w, d.h, null);
    const blob = await new Promise(r => c.toBlob(r, `image/${type}`, 0.95));
    download(blob, `${slug(d.name)}${pages.length > 1 || d.pages.length > 1 ? `-${i + 1}` : ''}.${type === 'jpeg' ? 'jpg' : 'png'}`);
    if (pages.length > 1) await new Promise(r => setTimeout(r, 350));
  }
  toast(pages.length > 1 ? `${pages.length} imágenes descargadas` : 'Imagen descargada');
}

function pickMime() {
  // H.264 Main 4.0: el nivel 3.0 (42E01E) no admite 1080×1920 y graba vacío.
  const opts = ['video/mp4;codecs=avc1.4d0028', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
  return opts.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
}
async function exportVideo() {
  const d = dsg();
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { toast('Tu navegador no exporta video. Usa Chrome o Edge.'); return; }
  if (state.playing) stopPlay();
  await document.fonts.ready;
  const total = totalDur(d);
  const modal = $('#stModal');
  modal.hidden = false;
  modal.innerHTML = `<div class="st-modal-card"><h3>Creando tu video</h3><p>Se graba en tiempo real (${total.toFixed(0)} s). Deja esta pestaña abierta y visible.</p><div class="st-progress"><span id="stProg"></span></div><button class="st-btn st-btn-ghost" id="stCancelVid">Cancelar</button></div>`;
  const c = document.createElement('canvas');
  c.width = d.w; c.height = d.h;
  c.className = 'st-rec-canvas';
  document.body.appendChild(c);
  const x = c.getContext('2d');
  drawAt(x, d, 0);
  const mime = pickMime();
  const stream = c.captureStream(30);
  let cancelled = false;
  const finish = () => { c.remove(); modal.hidden = true; };
  $('#stCancelVid').onclick = () => { cancelled = true; };
  // calentamiento del codificador (tarda ~1,5 s en arrancar y se comería el inicio)
  const warm = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  warm.start(250);
  for (let i = 0; i < 50 && !cancelled; i++) { drawAt(x, d, 0); await new Promise(r => setTimeout(r, 33)); }
  warm.stop();
  if (cancelled) { finish(); return; }
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 14_000_000 } : undefined);
  const chunks = [];
  rec.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
  rec.onstop = () => {
    finish();
    if (cancelled) return;
    const type = rec.mimeType || mime || 'video/webm';
    const blob = new Blob(chunks, { type });
    if (!blob.size) { toast('No se pudo grabar el video en este navegador'); return; }
    download(blob, `${slug(d.name)}.${type.includes('mp4') ? 'mp4' : 'webm'}`);
    toast('Video descargado');
  };
  rec.start(250);
  const t0 = performance.now();
  const tick = () => {
    const T = (performance.now() - t0) / 1000;
    if (cancelled || T >= total) { drawAt(x, d, total); setTimeout(() => rec.stop(), 120); return; }
    drawAt(x, d, T);
    const pr = $('#stProg');
    if (pr) pr.style.width = `${(T / total) * 100}%`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ */
/* Abrir / cerrar                                                       */
/* ------------------------------------------------------------------ */
async function refreshDesigns() {
  try { state.designs = await DB.all('designs'); } catch (e) { state.designs = []; }
  if (state.drawer === 'projects') renderDrawer();
  renderHome();
}
function openDesign(d, isNew) {
  if (state.playing) stopPlay();
  refitDesign(d);
  state.design = d;
  state.page = 0; state.sel = null; state.right = null;
  state.undo = []; state.redo = []; state.snap = JSON.stringify(d);
  state.fit = true;
  if (root.hidden) show();
  renderAll();
  if (isNew) { scheduleSave(); setTimeout(refreshDesigns, 900); }
  localStorage.setItem('agg_last_design', d.id);
}
function show() {
  root.hidden = false;
  document.body.classList.add('studio-open');
  requestAnimationFrame(() => { fitZoom(); renderAll(); });
}
function close() {
  if (state.editing) endEdit();
  if (state.playing) stopPlay();
  closeFloating();
  root.hidden = true;
  document.body.classList.remove('studio-open');
  refreshDesigns();
  if (location.hash === '#studio') history.replaceState(null, '', '#inicio');
  if (window.navigate) window.navigate('inicio');
}
async function open(id, fmtOrTpl) {
  await readyP;
  if (fmtOrTpl) {
    const t = TEMPLATES.find(x => x.id === fmtOrTpl);
    openDesign(t ? t.build() : newDesign(fmtOrTpl), true);
    return;
  }
  const want = id || localStorage.getItem('agg_last_design');
  const found = state.designs.find(x => x.id === want) || state.designs.slice().sort((a, b) => b.updated - a.updated)[0];
  openDesign(found ? clone(found) : TEMPLATES[0].build(), !found);
}

/* ------------------------------------------------------------------ */
/* Inicio del tablero y marca en la interfaz                            */
/* ------------------------------------------------------------------ */
function applyBrandToShell() {
  $$('[data-brand="name"]').forEach(n => { n.textContent = brand.name; });
  $$('[data-brand="monogram"]').forEach(n => { n.textContent = brand.monogram; n.style.fontFamily = `'${brand.head}'`; });
  $$('[data-brand="tagline"]').forEach(n => { n.textContent = brand.tagline; });
  $$('[data-brand="first"]').forEach(n => { n.textContent = brand.name.split(' ')[0]; });
}
function renderHome() {
  const box = document.getElementById('homeRecent');
  if (box) {
    const list = state.designs.slice().sort((a, b) => b.updated - a.updated).slice(0, 8);
    box.innerHTML = list.length ? list.map(d => `
      <a class="home-card" href="#studio" data-open-design="${d.id}">
        <span class="home-card-img">${d.thumb ? `<img src="${d.thumb}" alt="">` : ''}</span>
        <b>${esc(d.name)}</b><small>Editado ${new Date(d.updated).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}</small>
      </a>`).join('')
      : `<div class="home-empty">Aún no tienes diseños. Empieza con una plantilla de abajo.</div>`;
  }
  const tb = document.getElementById('homeTemplates');
  if (tb && !tb.dataset.done) {
    tb.dataset.done = '1';
    tb.innerHTML = TEMPLATES.map(t => `<a class="home-tpl" href="#studio" data-open-tpl="${t.id}"><canvas data-home-tpl="${t.id}"></canvas><b>${t.name}</b><small>${t.badge}</small></a>`).join('');
  }
  if (tb) paintHomeTemplates();
}
function paintHomeTemplates() {
  $$('canvas[data-home-tpl]').forEach(c => {
    const t = TEMPLATES.find(x => x.id === c.dataset.homeTpl);
    const d = t.build();
    refitDesign(d);
    const w = 320, k = w / d.w;
    c.width = w; c.height = Math.round(d.h * k);
    const x = c.getContext('2d');
    x.scale(k, k);
    drawPage(x, d.pages[0], d.w, d.h, null);
  });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-open-design],[data-open-tpl],[data-open-fmt]');
  if (!a) return;
  e.preventDefault();
  history.replaceState(null, '', '#studio');
  if (a.dataset.openDesign) open(a.dataset.openDesign);
  else if (a.dataset.openTpl) open(null, a.dataset.openTpl);
  else open(null, a.dataset.openFmt);
});

let ready;
const readyP = new Promise(r => (ready = r));
async function init() {
  buildShell();
  applyBrandToShell();
  [brand.head, brand.body, 'Manrope'].forEach(f => { ensureFont(f, 400); ensureFont(f, 500); ensureFont(f, 600); });
  ensureFont(brand.head, 500, true);
  try { (await DB.all('uploads')).forEach(u => uploads.set(u.id, u)); } catch (e) { /* sin subidas */ }
  await refreshDesigns();
  ready();
  document.fonts.ready.then(() => { renderHome(); });
}

window.Studio = { open, close, get brand() { return brand; } };
document.addEventListener('DOMContentLoaded', init);
})();
