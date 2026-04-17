/* ═══════════════════════════════════════════════════════════
   router.js — Navegación entre vistas y carga de datos
   ─────────────────────────────────────────────────────────
   · navigateTo(view, params) es el único punto de entrada
     para cambiar de vista.
   · Cada función loadXxxView() orquesta api.js + ui.js.
═══════════════════════════════════════════════════════════ */

import {
  getPopularMovies,
  searchMovies,
  discoverMovies,
  getMovieById,
  getReviews,
} from './api.js';

import {
  renderSkeleton,
  renderMovieCards,
  renderPagination,
  renderMovieDetail,
  renderReviews,
  renderStats,
  updateResultsCount,
  showError,
  showEmptyState,
  showStatsError,
  setActiveNavLink,
} from './ui.js';

import { state } from './state.js';

/* ──────────────────────────────────────────────────────────
   navigateTo — punto central de enrutamiento
────────────────────────────────────────────────────────── */

/**
 * Cambia la vista activa y carga su contenido.
 * @param {string} view   - 'home' | 'detail' | 'create' | 'edit' | 'stats'
 * @param {Object} params - Parámetros opcionales (ej. { movieId: 550 })
 */
export function navigateTo(view, params = {}) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('active');
  });

  // Mostrar la vista objetivo
  const target = document.getElementById(`view-${view}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // Actualizar estado y nav
  state.currentView = view;
  setActiveNavLink(view);

  // Cerrar menú móvil si está abierto
  document.getElementById('nav-links')?.classList.remove('open');

  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cargar contenido según la vista
  switch (view) {
    case 'home':
      loadHomeView();
      break;

    case 'detail':
      if (params.movieId) {
        state.currentMovieId = params.movieId;
        loadDetailView(params.movieId);
      }
      break;

    case 'create':
      // El formulario ya está en el HTML; main.js gestiona el submit
      break;

    case 'edit':
      if (params.review) {
        prefillEditForm(params.review);
      }
      break;

    case 'stats':
      loadStatsView();
      break;
  }
}

/* ──────────────────────────────────────────────────────────
   loadHomeView — GET listado con filtros y paginación
────────────────────────────────────────────────────────── */

/**
 * Obtiene películas según el estado actual (búsqueda / filtros / popular)
 * y las renderiza en el grid con paginación.
 */
export async function loadHomeView() {
  renderSkeleton(10);

  try {
    let data;

    if (state.searchQuery) {
      // RF-06 Filtro 1: búsqueda por texto
      data = await searchMovies(state.searchQuery, state.currentPage);

    } else if (state.selectedGenre || state.selectedYear || state.sortBy !== 'popularity.desc') {
      // RF-06 Filtros 2 y 3: género, año, ordenamiento
      data = await discoverMovies({
        genre:  state.selectedGenre,
        year:   state.selectedYear,
        sortBy: state.sortBy,
        page:   state.currentPage,
      });

    } else {
      // RF-01: listado popular por defecto
      data = await getPopularMovies(state.currentPage);
    }

    state.totalPages   = data.total_pages;
    state.totalResults = data.total_results;

    renderMovieCards(data.results);
    renderPagination(state.currentPage, state.totalPages);
    updateResultsCount(state.totalResults);

    // Delegar eventos de cards y paginación
    attachCardEvents();
    attachPaginationEvents();

  } catch (error) {
    showError(`No se pudo cargar el listado: ${error.message}`);
  }
}

/* ──────────────────────────────────────────────────────────
   loadDetailView — GET detalle por ID
────────────────────────────────────────────────────────── */

/**
 * Obtiene el detalle completo de una película y sus reseñas.
 * @param {number|string} movieId
 */
export async function loadDetailView(movieId) {
  const container = document.getElementById('movie-detail');
  if (container) {
    container.innerHTML = '<div class="spinner" style="margin-top:4rem"></div>';
  }

  try {
    // GET por ID (segundo GET requerido por RT-03)
    const movie = await getMovieById(movieId);
    renderMovieDetail(movie);

    // Cargar reseñas (GET /posts)
    loadReviewsForDetail();

    // Eventos del detalle (botón escribir reseña)
    attachDetailEvents();

  } catch (error) {
    if (container) {
      container.innerHTML = `
        <div class="error-state" style="margin-top:4rem">
          <p class="error-icon">⚠️</p>
          <p class="error-message">No se pudo cargar el detalle: ${error.message}</p>
        </div>
      `;
    }
  }
}

/**
 * Carga y muestra las reseñas en la sección del detalle.
 */
async function loadReviewsForDetail() {
  try {
    const data = await getReviews();
    state.reviews = data.posts || [];
    renderReviews(state.reviews);
    attachReviewEvents();
  } catch {
    const list = document.getElementById('reviews-list');
    if (list) list.innerHTML = '<p class="text-muted">No se pudieron cargar las reseñas.</p>';
  }
}

/* ──────────────────────────────────────────────────────────
   loadStatsView — Sección adicional del equipo
────────────────────────────────────────────────────────── */

async function loadStatsView() {
  const container = document.getElementById('stats-content');
  if (container) {
    container.innerHTML = '<div class="spinner" style="margin-top:2rem"></div>';
  }

  try {
    // Si no hay reseñas cargadas aún (usuario fue directo a Stats), cargarlas
    if (state.reviews.length === 0) {
      const data   = await getReviews();
      state.reviews = data.posts || [];
    }
    renderStats(state.reviews, state.sessionReviews);
  } catch (error) {
    showStatsError(`No se pudieron cargar las estadísticas: ${error.message}`);
  }
}

/* ──────────────────────────────────────────────────────────
   prefillEditForm — Pre-carga formulario de edición
────────────────────────────────────────────────────────── */

/**
 * Rellena el formulario de edición con los datos de la reseña.
 * @param {Object} review
 */
export function prefillEditForm(review) {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? '';
  };

  setVal('edit-review-id',    review.id);
  setVal('edit-movie-title',  review.movieTitle || review.title || '');
  setVal('edit-author',       review.author || '');
  setVal('edit-rating',       review.rating || '');
  setVal('edit-genre',        review.genre || '');
  setVal('edit-body',         review.body || '');

  // Actualizar preview de estrellas con la calificación cargada
  const ratingVal = review.rating ? String(review.rating) : '';
  const preview   = document.getElementById('rating-preview-edit');
  if (preview && ratingVal) {
    const n      = parseInt(ratingVal, 10);
    const filled = Math.round(n / 2);
    const empty  = 5 - filled;
    preview.textContent = '★'.repeat(filled) + '☆'.repeat(empty) + `  ${n}/10`;
  }

  // Actualizar contador de caracteres con el body cargado
  const body    = review.body || '';
  const counter = document.getElementById('counter-edit-body');
  if (counter) {
    counter.textContent = `${body.length} / 2000`;
    counter.classList.toggle('counter-warn',  body.length >= 1700);
    counter.classList.toggle('counter-limit', body.length >= 2000);
  }
}

/* ──────────────────────────────────────────────────────────
   Delegación de eventos internos (sólo los que dependen
   de elementos inyectados dinámicamente)
────────────────────────────────────────────────────────── */

/**
 * Escucha clics en las tarjetas del grid para navegar al detalle.
 * Usa delegación desde el grid.
 */
function attachCardEvents() {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  grid.addEventListener('click', handleCardClick, { once: true });
}

function handleCardClick(e) {
  const btn  = e.target.closest('.ver-detalle-btn');
  const card = e.target.closest('.movie-card');

  if (btn) {
    navigateTo('detail', { movieId: btn.dataset.movieId });
    return;
  }

  if (card && card.dataset.movieId) {
    navigateTo('detail', { movieId: card.dataset.movieId });
  }
}

/**
 * Escucha clics en botones de paginación.
 */
function attachPaginationEvents() {
  const container = document.getElementById('pagination');
  if (!container) return;

  container.addEventListener('click', e => {
    if (e.target.id === 'prev-page' && state.currentPage > 1) {
      state.currentPage--;
      loadHomeView();
    } else if (e.target.id === 'next-page') {
      state.currentPage++;
      loadHomeView();
    }
  }, { once: true });
}

/**
 * Escucha el botón "Escribir Reseña" del detalle.
 */
function attachDetailEvents() {
  document.getElementById('write-review-btn')?.addEventListener('click', () => {
    navigateTo('create');
  });
}

/**
 * Escucha eventos de editar / eliminar reseñas.
 * Los handlers de submit/delete están en main.js.
 */
function attachReviewEvents() {
  const list = document.getElementById('reviews-list');
  if (!list) return;

  list.addEventListener('click', e => {
    const editBtn   = e.target.closest('.edit-review-btn');
    const deleteBtn = e.target.closest('.delete-review-btn');

    if (editBtn) {
      const id = editBtn.dataset.reviewId;
      const review = state.reviews.find(r => String(r.id) === String(id));
      if (review) {
        state.currentReviewId = id;
        navigateTo('edit', { review });
      }
    }

    if (deleteBtn) {
      const id     = deleteBtn.dataset.reviewId;
      const review = state.reviews.find(r => String(r.id) === String(id));
      state.pendingDeleteId = id;

      // Mostrar el título de la película en el modal
      const nameEl = document.getElementById('delete-movie-name');
      if (nameEl) {
        nameEl.textContent = review?.movieTitle || review?.title || 'esta reseña';
      }

      document.getElementById('confirm-modal')?.classList.remove('hidden');
    }
  });
}
