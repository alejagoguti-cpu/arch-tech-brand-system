// ARCH·TECH STUDIO | BRAND & CREATIVE ENGINE

// Default Initial Content Calendar Data (Architecture, Tech & Lifestyle)
const DEFAULT_POSTS = [
  {
    id: 1,
    title: "Un día conmigo diseñando un ático de lujo con IA",
    format: "Lifestyle",
    pillar: "Lifestyle & Rutina",
    date: "2026-11-24",
    status: "Listo para Grabar",
    hook: "Así se proyecta una residencia de $1.5M antes de que exista el primer plano.",
    cta: "Comenta 'ÁTICO' si quieres ver el render final",
    notes: "Tomas: café matutino → pantalla con iPad y software 3D → resultado en obra."
  },
  {
    id: 2,
    title: "El error de los $20,000 en obra",
    format: "Reel",
    pillar: "Enemigo Común / Disruptivo",
    date: "2026-11-26",
    status: "Guion Listo",
    hook: "¿Sabías que el 80% de los sobrecostes ocurren frente a una pantalla?",
    cta: "Escribe PROYECTO por DM para auditar tu diseño",
    notes: "Grabar en el estudio con software 3D visible de fondo."
  },
  {
    id: 3,
    title: "Qué llevo en mi bolso de arquitecta para reunión de $1M",
    format: "Lifestyle",
    pillar: "Lifestyle & Rutina",
    date: "2026-11-28",
    status: "Idea",
    hook: "Las 4 herramientas indispensables que nunca dejo en mi estudio.",
    cta: "¿Cuál de estos objetos crees que es el más caro?",
    notes: "Planos cenitales de iPad, libreta Moleskine, medidor láser y gafas."
  },
  {
    id: 4,
    title: "Por qué los planos 2D están quebrando constructoras",
    format: "Carrusel",
    pillar: "Proceso & Técnica",
    date: "2026-12-01",
    status: "Guion Listo",
    hook: "La comparativa técnica que ningún director de obra quiere ver.",
    cta: "Guarda este post para tu próxima junta de obra",
    notes: "Diseñar con la plantilla 'vs' en Canva Studio."
  },
  {
    id: 5,
    title: "3 detalles de hoteles de lujo para aplicar en arquitectura",
    format: "Lifestyle",
    pillar: "Lifestyle & Rutina",
    date: "2026-12-04",
    status: "Idea",
    hook: "Iluminación oculta, zócalos invertidos y puertas ras de techo.",
    cta: "Guarda este video de inspiración",
    notes: "Tomas en un hotel o espacio con arquitectura escultural."
  }
];

// State Management
let posts = JSON.parse(localStorage.getItem('arch_tech_posts_v2')) || DEFAULT_POSTS;
let activeFilter = 'all';

// Canva Studio State
let canvasConfig = {
  bg: '#0c0d10',
  accent: '#00B7CB',
  pattern: 'dots',
  uploadedImage: null
};

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderContentTable();
  updateOutreach();
  initCanvasStudio();
  
  // Hash navigation check
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    navigate(hash);
  }
});

// Navigation Engine
function navigate(sectionId) {
  // El Studio es una capa a pantalla completa sobre el Inicio
  if (sectionId === 'studio') {
    if (window.Studio) window.Studio.open();
    sectionId = 'inicio';
  }
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => sec.style.display = 'none');

  const target = document.getElementById(`sec-${sectionId}`);
  if (target) {
    target.style.display = 'block';
  } else {
    document.getElementById('sec-inicio').style.display = 'block';
    sectionId = 'inicio';
  }

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${sectionId}`) {
      item.classList.add('active');
    }
  });

  // Update breadcrumb
  const nameMap = {
    inicio: 'Inicio',
    lifestyle: 'Universo Lifestyle & Estética',
    calendar: 'Parrilla de Contenido',
    studio: 'Studio',
    scripts: 'Teleprompter & Guiones',
    concept: 'Propósito y Concepto',
    enemy: 'Enemigo Común',
    colors: 'Colores & Tokens',
    photography: 'Fotografía & Arte',
    outreach: 'Plantillas de Outreach B2B'
  };

  const currentLabel = document.getElementById('currentSectionName');
  if (currentLabel && nameMap[sectionId]) {
    currentLabel.textContent = nameMap[sectionId];
  }


  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// IFRAME PRESET SWITCHER
function setIframeSource(url) {
  const iframe = document.getElementById('animacionesIframe');
  const display = document.getElementById('frameUrlDisplay');
  const extLink = document.getElementById('frameExternalLink');

  if (iframe) iframe.src = url;
  if (display) display.textContent = url;
  if (extLink) extLink.href = url;

  showToast('Cargando vista previa en el estudio...');
}

// LIFESTYLE QUICK ADD TO CALENDAR
function addLifestyleIdeaToCalendar(title) {
  const newPost = {
    id: Date.now(),
    title: title,
    format: "Lifestyle",
    pillar: "Lifestyle & Rutina",
    date: new Date().toISOString().split('T')[0],
    status: "Idea",
    hook: "Toma cinematográfica inicial estética.",
    cta: "Guarda este post o comenta por DM"
  };

  posts.unshift(newPost);
  savePosts();
  renderContentTable();
  navigate('calendar');
  showToast(`¡Agregado a tu parrilla: "${title.substring(0, 30)}..."!`);
}

// ==========================================
// CANVA STUDIO ENGINE (HTML5 CANVAS 1080x1350)
// ==========================================
function initCanvasStudio() {
  renderCanvas();
}

function switchStudioTab(tabId) {
  document.querySelectorAll('.s-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.studio-panel-content').forEach(p => p.style.display = 'none');

  const panel = document.getElementById(`stab-${tabId}`);
  if (panel) panel.style.display = 'block';

  event.target.classList.add('active');
}

function setCanvasBg(color) {
  canvasConfig.bg = color;
  renderCanvas();
}

function setCanvasAccent(color) {
  canvasConfig.accent = color;
  renderCanvas();
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      canvasConfig.uploadedImage = img;
      renderCanvas();
      showToast('Imagen cargada al lienzo');
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function clearUploadedImage() {
  canvasConfig.uploadedImage = null;
  document.getElementById('imageUploader').value = '';
  renderCanvas();
  showToast('Imagen quitada');
}

function loadTemplate(tplName) {
  const kicker = document.getElementById('canvasKicker');
  const title = document.getElementById('canvasTitle');
  const sub = document.getElementById('canvasSubtitle');
  const cta = document.getElementById('canvasCta');

  if (tplName === 'lifestyle') {
    canvasConfig.bg = '#0e1014';
    canvasConfig.accent = '#E5A962';
    if (kicker) kicker.value = "ARCH·TECH • ARCHITECTURAL LIFESTYLE";
    if (title) title.value = "The Architecture of Living Well: 3 Reglas de Oro.";
    if (sub) sub.value = "El verdadero lujo no es recargar los espacios; es dominar la luz natural, la acústica y la nobleza de los materiales.";
    if (cta) cta.value = "Desliza para ver la guía completa →";
  } else if (tplName === 'hook') {
    canvasConfig.bg = '#0c0d10';
    canvasConfig.accent = '#00B7CB';
    if (kicker) kicker.value = "ARQUITECTURA & TECNOLOGÍA B2B";
    if (title) title.value = "El 80% de los sobrecostes ocurren por planos 2D desconectados.";
    if (sub) sub.value = "Cuando las instalaciones chocan con una viga en obra, demoler cuesta miles de dólares. La coordinación digital lo resuelve en minutos.";
    if (cta) cta.value = "Comenta 'PROYECTO' para auditar tu caso →";
  } else if (tplName === 'vs') {
    canvasConfig.bg = '#111318';
    canvasConfig.accent = '#0066FF';
    if (kicker) kicker.value = "LA COMPARATIVA TÉCNICA";
    if (title) title.value = "Planos 2D Tradicionales vs. Simulación Digital BIM.";
    if (sub) sub.value = "Los estudios que siguen proyectando en papel asumen un 18% de sobrecostes como normales. La tecnología los erradica.";
    if (cta) cta.value = "Guarda esta comparativa para tu equipo →";
  } else if (tplName === 'clash') {
    canvasConfig.bg = '#08090b';
    canvasConfig.accent = '#FF3344';
    if (kicker) kicker.value = "DETECCIÓN PREVENTIVA EN OBRA";
    if (title) title.value = "Clash Detection: Anticipando el desastre antes de construir.";
    if (sub) sub.value = "Así es como encontramos 47 interferencias mecánicas en un edificio de 12 plantas antes de verter el primer metro de hormigón.";
    if (cta) cta.value = "Escribe 'CLASH' por mensaje directo →";
  } else if (tplName === 'cta') {
    canvasConfig.bg = '#0e121a';
    canvasConfig.accent = '#00B7CB';
    if (kicker) kicker.value = "COLABORACIONES & FIRMAS";
    if (title) title.value = "¿Diriges un Estudio de Arquitectura o Constructora?";
    if (sub) sub.value = "Ayudo a despachos a cerrar ventas inmobiliarias más rápido y eliminar errores de obra con visualización 4K y coordinación digital.";
    if (cta) cta.value = "Envía un DM con la palabra 'PROYECTO' →";
  }

  renderCanvas();
  showToast(`Plantilla "${tplName.toUpperCase()}" cargada`);
}

function renderCanvas() {
  const canvas = document.getElementById('mainCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Background Fill
  ctx.fillStyle = canvasConfig.bg;
  ctx.fillRect(0, 0, width, height);

  // Background Pattern (Dots or Grid)
  const patternType = document.getElementById('canvasBgPattern')?.value || 'dots';
  if (patternType === 'dots') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const spacing = 36;
    for (let x = 20; x < width; x += spacing) {
      for (let y = 20; y < height; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternType === 'grid') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const spacing = 48;
    for (let x = 0; x < width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (patternType === 'gradient') {
    const grad = ctx.createRadialGradient(width / 2, 200, 20, width / 2, 200, 600);
    grad.addColorStop(0, canvasConfig.accent + '33');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Uploaded Image if exists
  if (canvasConfig.uploadedImage) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    const img = canvasConfig.uploadedImage;
    const scale = Math.max(width / img.width, height / img.height);
    const x = (width / 2) - (img.width / 2) * scale;
    const y = (height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    ctx.restore();
  }

  // Outer Border Frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Kicker Tag
  const kicker = document.getElementById('canvasKicker')?.value || 'ARCH·TECH STUDIO';
  ctx.font = '700 24px "Space Grotesk", sans-serif';
  ctx.fillStyle = canvasConfig.accent;
  ctx.letterSpacing = '3px';
  ctx.fillText(kicker.toUpperCase(), 90, 130);

  // Accent Line under Kicker
  ctx.fillStyle = canvasConfig.accent;
  ctx.fillRect(90, 150, 60, 4);

  // Main Title
  const title = document.getElementById('canvasTitle')?.value || 'Título Principal';
  ctx.font = '800 64px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.letterSpacing = '-1px';
  wrapText(ctx, title, 90, 260, width - 180, 78);

  // Graphic Element
  const graphicType = document.getElementById('canvasGraphic')?.value || 'prism';
  if (graphicType === 'prism') {
    ctx.save();
    ctx.translate(width / 2, 700);
    ctx.strokeStyle = canvasConfig.accent;
    ctx.lineWidth = 3;
    
    // Isometric Cube
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(80, -45);
    ctx.lineTo(80, 50);
    ctx.lineTo(0, 95);
    ctx.lineTo(-80, 50);
    ctx.lineTo(-80, -45);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 95);
    ctx.moveTo(0, 0);
    ctx.lineTo(80, -45);
    ctx.moveTo(0, 0);
    ctx.lineTo(-80, -45);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();
    ctx.restore();
  }

  // Subtitle / Paragraph
  const subtitle = document.getElementById('canvasSubtitle')?.value || '';
  ctx.font = '400 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#A0AEC0';
  ctx.letterSpacing = '0px';
  wrapText(ctx, subtitle, 90, 920, width - 180, 48);

  // Bottom CTA Pill
  const cta = document.getElementById('canvasCta')?.value || 'Desliza para ver más →';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  roundRect(ctx, 90, 1140, width - 180, 70, 35);
  ctx.fill();
  ctx.strokeStyle = canvasConfig.accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 26px "Space Grotesk", sans-serif';
  ctx.fillStyle = canvasConfig.accent;
  ctx.textAlign = 'center';
  ctx.fillText(cta, width / 2, 1184);
  ctx.textAlign = 'left';

  // Bottom Author Watermark
  const author = document.getElementById('canvasAuthor')?.value || '@tu_marca';
  ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText(author, 90, 1260);
}

// Canvas Helpers
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

function downloadCanvasImage() {
  const canvas = document.getElementById('mainCanvas');
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = `arch-lifestyle-post-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('¡Imagen PNG (1080x1350) descargada con éxito!');
}

// ==========================================
// CONTENT CALENDAR (PARRILLA) MANAGEMENT
// ==========================================
function renderContentTable() {
  const tbody = document.getElementById('contentTableBody');
  if (!tbody) return;

  const filtered = activeFilter === 'all' 
    ? posts 
    : posts.filter(p => p.format.toLowerCase() === activeFilter.toLowerCase());

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 32px;">No hay publicaciones registradas con este filtro.</td></tr>`;
    return;
  }

  filtered.forEach(post => {
    const tr = document.createElement('tr');

    const badgeClass = post.format === 'Reel' 
      ? 'badge-reel' 
      : post.format === 'Carrusel' 
      ? 'badge-carrusel' 
      : post.format === 'Lifestyle'
      ? 'badge-lifestyle'
      : 'badge-linkedin';

    tr.innerHTML = `
      <td><strong>${post.title}</strong><br><small style="color: var(--text-dim);">${post.hook || ''}</small></td>
      <td><span class="format-badge ${badgeClass}">${post.format}</span></td>
      <td><span style="font-size: 0.8rem; color: var(--text-muted);">${post.pillar}</span></td>
      <td><span style="font-family: var(--font-mono); font-size: 0.8rem;">${post.date}</span></td>
      <td>
        <select class="status-select" onchange="updatePostStatus(${post.id}, this.value)">
          <option value="Idea" ${post.status === 'Idea' ? 'selected' : ''}>💡 Idea</option>
          <option value="Guion Listo" ${post.status === 'Guion Listo' ? 'selected' : ''}>📝 Guion Listo</option>
          <option value="Listo para Grabar" ${post.status === 'Listo para Grabar' ? 'selected' : ''}>🎥 Grabar</option>
          <option value="En Edición" ${post.status === 'En Edición' ? 'selected' : ''}>✂️ Editando</option>
          <option value="Publicado" ${post.status === 'Publicado' ? 'selected' : ''}>🚀 Publicado</option>
        </select>
      </td>
      <td>
        <button class="btn-copy" style="padding: 4px 8px;" onclick="deletePost(${post.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterContent(format, btn) {
  activeFilter = format;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderContentTable();
}

function updatePostStatus(id, newStatus) {
  const post = posts.find(p => p.id === id);
  if (post) {
    post.status = newStatus;
    savePosts();
    showToast(`Estado actualizado: ${newStatus}`);
  }
}

function deletePost(id) {
  if (confirm('¿Deseas eliminar esta publicación de la parrilla?')) {
    posts = posts.filter(p => p.id !== id);
    savePosts();
    renderContentTable();
    showToast('Publicación eliminada');
  }
}

function openAddModal() {
  document.getElementById('postModal').style.display = 'flex';
}

function closeAddModal() {
  document.getElementById('postModal').style.display = 'none';
}

function handleAddPost(event) {
  event.preventDefault();
  const title = document.getElementById('newPostTitle').value;
  const format = document.getElementById('newPostFormat').value;
  const pillar = document.getElementById('newPostPillar').value;
  const date = document.getElementById('newPostDate').value || new Date().toISOString().split('T')[0];
  const hook = document.getElementById('newPostHook').value;

  const newPost = {
    id: Date.now(),
    title,
    format,
    pillar,
    date,
    status: 'Idea',
    hook,
    cta: 'Escribe PROYECTO por DM'
  };

  posts.unshift(newPost);
  savePosts();
  renderContentTable();
  closeAddModal();
  showToast('¡Nueva idea agregada a tu parrilla!');
  event.target.reset();
}

function savePosts() {
  localStorage.setItem('arch_tech_posts_v2', JSON.stringify(posts));
}

// Toast
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Copy Token / Text
function copyToken(value) {
  navigator.clipboard.writeText(value).then(() => {
    showToast(`Token copiado: ${value}`);
  });
}

function copyText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copiado al portapapeles con éxito');
  });
}

// Outreach Template Generator
function updateOutreach() {
  const leadName = document.getElementById('leadName')?.value || '[Nombre]';
  const firmName = document.getElementById('firmName')?.value || '[Estudio]';

  document.querySelectorAll('.lead-var').forEach(el => el.textContent = leadName);
  document.querySelectorAll('.firm-var').forEach(el => el.textContent = firmName);
}
