// KRONOS / ARCH·TECH BRAND SYSTEM ENGINE

// Default Initial Content Calendar Data (Pre-populated for Arch & Tech B2B)
const DEFAULT_POSTS = [
  {
    id: 1,
    title: "El error de los $20,000 en obra",
    format: "Reel",
    pillar: "Enemigo Común / Disruptivo",
    date: "2026-11-25",
    status: "Listo para Grabar",
    hook: "¿Sabías que el 80% de los sobrecostes ocurren frente a una pantalla?",
    cta: "Escribe PROYECTO por DM",
    notes: "Grabar en el estudio con software 3D visible de fondo."
  },
  {
    id: 2,
    title: "Por qué los planos 2D están quebrando constructoras",
    format: "Carrusel",
    pillar: "Educación & Contraste",
    date: "2026-11-28",
    status: "Guion Listo",
    hook: "La comparativa que ningún director de obra quiere ver.",
    cta: "Guarda este post para tu próxima junta de obra",
    notes: "Usar la plantilla de 5 slides con render isométrico."
  },
  {
    id: 3,
    title: "Cómo la visualización 4K redujo 3 semanas de preventa",
    format: "LinkedIn",
    pillar: "Autoridad / Caso de Estudio",
    date: "2026-12-02",
    status: "Idea",
    hook: "Caso real: de maqueta digital a cierre de inversión en tiempo récord.",
    cta: "Conectemos por mensaje si estás desarrollando un proyecto similar.",
    notes: "Orientado a directores inmobiliarios."
  },
  {
    id: 4,
    title: "El detrás de escena: Detectando choques entre tuberías y vigas",
    format: "Reel",
    pillar: "Proceso & Técnica",
    date: "2026-12-05",
    status: "Idea",
    hook: "Miren lo que pasa cuando abrimos este plano en el software...",
    cta: "¿Tu estudio hace clash detection antes de construir?",
    notes: "Grabar pantalla con zoom dinámico a las colisiones."
  }
];

// State Management
let posts = JSON.parse(localStorage.getItem('arch_tech_posts')) || DEFAULT_POSTS;
let activeFilter = 'all';

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderContentTable();
  updateOutreach();
  
  // Hash navigation check
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    navigate(hash);
  }
});

// Navigation Engine
function navigate(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(sec => sec.style.display = 'none');

  // Show target section
  const target = document.getElementById(`sec-${sectionId}`);
  if (target) {
    target.style.display = 'block';
  } else {
    document.getElementById('sec-overview').style.display = 'block';
    sectionId = 'overview';
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
    overview: 'Resumen Ejecutivo',
    calendar: 'Parrilla de Contenido',
    concept: 'Propósito y Concepto',
    enemy: 'Enemigo Común',
    audience: 'Cliente Ideal B2B',
    colors: 'Colores & Tokens',
    typography: 'Tipografía & Jerarquía',
    logo: 'Monograma & Retícula',
    photography: 'Fotografía & Arte',
    tone: 'Voz & Tono',
    scripts: 'Teleprompter & Guiones',
    carousel: 'Simulador de Carruseles',
    outreach: 'Plantillas de Outreach'
  };

  const currentLabel = document.getElementById('currentSectionName');
  if (currentLabel && nameMap[sectionId]) {
    currentLabel.textContent = nameMap[sectionId];
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Carousel Slide Switcher
function switchSlide(slideNum) {
  // Update tabs
  document.querySelectorAll('.c-tab').forEach((tab, index) => {
    tab.classList.toggle('active', index + 1 === slideNum);
  });

  // Update slide display
  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById(`slide${i}`);
    if (el) {
      el.style.display = (i === slideNum) ? 'flex' : 'none';
    }
  }
}

// Token Copy with Toast
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

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Outreach Template Generator
function updateOutreach() {
  const leadName = document.getElementById('leadName')?.value || '[Nombre]';
  const firmName = document.getElementById('firmName')?.value || '[Estudio]';

  document.querySelectorAll('.lead-var').forEach(el => el.textContent = leadName);
  document.querySelectorAll('.firm-var').forEach(el => el.textContent = firmName);
}

// CONTENT CALENDAR (PARRILLA) MANAGEMENT
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

    const badgeClass = post.format === 'Reel' ? 'badge-reel' : post.format === 'Carrusel' ? 'badge-carrusel' : 'badge-linkedin';

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
  localStorage.setItem('arch_tech_posts', JSON.stringify(posts));
}

// Search Filter across platform
function handleSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return;

  const cards = document.querySelectorAll('.card, .stat-card, .service-box');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(q)) {
      card.style.outline = '2px solid var(--color-brand)';
    } else {
      card.style.outline = 'none';
    }
  });
}
