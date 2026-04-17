/* ═══════════════════════════════════════════════════════════
   ui.js — Funciones que manipulan el DOM
   ─────────────────────────────────────────────────────────
   Reglas:
   · Este módulo SOLO modifica el DOM.
   · NO hace fetch(). Recibe datos como parámetros.
   · Exporta funciones puras que router.js y main.js llaman.
═══════════════════════════════════════════════════════════ */

import {
  TMDB_IMAGE_W500,
  TMDB_IMAGE_W1280,
  IMG_PLACEHOLDER,
  MAX_TMDB_PAGES,
} from './config.js';

/* ──────────────────────────────────────────────────────────
   Skeleton Loader
────────────────────────────────────────────────────────── */

/**
 * Muestra tarjetas esqueleto mientras se carga el listado.
 * @param {number} count - Cantidad de skeletons a mostrar
 */
export function renderSkeleton(count = 10) {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="movie-card skeleton-card">
      <div class="skeleton skeleton-poster"></div>
      <div class="card-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-btn"></div>
      </div>
    </div>
  `).join('');

  hideEmptyState();
}

/* ──────────────────────────────────────────────────────────
   Movie Cards (Listado)
────────────────────────────────────────────────────────── */

/**
 * Renderiza el grid de tarjetas de películas.
 * @param {Array} movies - Array de objetos película de TMDB
 */
export function renderMovieCards(movies) {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  if (!movies || movies.length === 0) {
    grid.innerHTML = '';
    showEmptyState();
    return;
  }

  hideEmptyState();
  grid.innerHTML = movies.map(createMovieCardHTML).join('');
}

/**
 * Genera el HTML de una tarjeta de película.
 * @param {Object} movie
 * @returns {string} HTML string
 */
function createMovieCardHTML(movie) {
  const poster = movie.poster_path
    ? `${TMDB_IMAGE_W500}${movie.poster_path}`
    : IMG_PLACEHOLDER;

  const year    = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
  const rating  = movie.vote_average ? movie.vote_average.toFixed(1) : '–';
  const overview = movie.overview
    ? (movie.overview.length > 120
        ? `${movie.overview.slice(0, 120)}…`
        : movie.overview)
    : 'Sin descripción disponible.';

  return `
    <article class="movie-card" data-movie-id="${movie.id}" tabindex="0" role="button"
      aria-label="Ver detalle de ${escapeHTML(movie.title)}">
      <div class="card-poster">
        <img
          src="${poster}"
          alt="Poster de ${escapeHTML(movie.title)}"
          loading="lazy"
          onerror="this.src='${IMG_PLACEHOLDER}'"
        />
        <div class="card-rating">⭐ ${rating}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(movie.title)}</h3>
        <div class="card-meta">
          <span class="card-year">${year}</span>
        </div>
        <p class="card-overview">${escapeHTML(overview)}</p>
        <button class="btn btn-primary btn-sm ver-detalle-btn"
          data-movie-id="${movie.id}">
          Ver detalle
        </button>
      </div>
    </article>
  `;
}

/* ──────────────────────────────────────────────────────────
   Paginación
────────────────────────────────────────────────────────── */

/**
 * Renderiza los controles de paginación.
 * @param {number} currentPage
 * @param {number} totalPages
 */
export function renderPagination(currentPage, totalPages) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const pages = Math.min(totalPages, MAX_TMDB_PAGES);

  if (pages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <button class="pagination-btn" id="prev-page"
      ${currentPage === 1 ? 'disabled' : ''}>
      ← Anterior
    </button>
    <span class="pagination-info">Página ${currentPage} de ${pages.toLocaleString()}</span>
    <button class="pagination-btn" id="next-page"
      ${currentPage >= pages ? 'disabled' : ''}>
      Siguiente →
    </button>
  `;
}

/**
 * Actualiza el contador de resultados.
 * @param {number} total
 */
export function updateResultsCount(total) {
  const el = document.getElementById('movies-count');
  if (!el) return;
  el.textContent = total > 0
    ? `${total.toLocaleString()} películas encontradas`
    : '';
}

/* ──────────────────────────────────────────────────────────
   Movie Detail
────────────────────────────────────────────────────────── */

/**
 * Renderiza la vista de detalle completa de una película.
 * Muestra al menos 6 campos del objeto JSON (RF-02).
 * @param {Object} movie - Objeto TMDB con detalle completo
 */
export function renderMovieDetail(movie) {
  const container = document.getElementById('movie-detail');
  if (!container) return;

  const poster   = movie.poster_path
    ? `${TMDB_IMAGE_W500}${movie.poster_path}`
    : IMG_PLACEHOLDER;

  const backdrop = movie.backdrop_path
    ? `${TMDB_IMAGE_W1280}${movie.backdrop_path}`
    : '';

  const year     = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
  const runtime  = movie.runtime ? `${movie.runtime} min` : 'N/A';
  const rating   = movie.vote_average ? movie.vote_average.toFixed(1) : '–';
  const votes    = movie.vote_count ? movie.vote_count.toLocaleString() : '0';
  const budget   = movie.budget ? `$${movie.budget.toLocaleString()}` : 'N/A';
  const revenue  = movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'N/A';
  const language = movie.original_language
    ? movie.original_language.toUpperCase()
    : 'N/A';

  const genresHTML = movie.genres && movie.genres.length
    ? movie.genres.map(g => `<span class="genre-tag">${escapeHTML(g.name)}</span>`).join('')
    : '<span class="text-muted">N/A</span>';

  const backdropStyle = backdrop
    ? `style="background-image: url('${backdrop}')"`
    : '';

  container.innerHTML = `
    <!-- 1. Hero con backdrop + poster + info principal -->
    <div class="detail-hero" ${backdropStyle}>
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-content">
        <div class="detail-poster">
          <img src="${poster}" alt="Poster de ${escapeHTML(movie.title)}"
            onerror="this.src='${IMG_PLACEHOLDER}'" />
        </div>
        <div class="detail-info">
          <h1 class="detail-title">${escapeHTML(movie.title)}</h1>
          ${movie.tagline
            ? `<p class="detail-tagline">"${escapeHTML(movie.tagline)}"</p>`
            : ''}
          <div class="detail-meta">
            <span class="detail-badge rating-badge">⭐ ${rating}/10</span>
            <span class="detail-badge">📅 ${year}</span>
            <span class="detail-badge">⏱ ${runtime}</span>
            <span class="detail-badge">🗣 ${language}</span>
          </div>
          <div class="detail-genres">${genresHTML}</div>
        </div>
      </div>
    </div>

    <!-- 2. Cuerpo de detalle -->
    <div class="detail-body">

      <!-- Sinopsis (campo 1) -->
      <div class="detail-section">
        <h2>Sinopsis</h2>
        <p>${escapeHTML(movie.overview || 'Sin sinopsis disponible.')}</p>
      </div>

      <!-- Estadísticas (campos 2-6) -->
      <div class="detail-stats">
        <div class="stat-item">
          <span class="stat-label">Calificación</span>
          <span class="stat-value">${rating}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Votos</span>
          <span class="stat-value">${votes}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Duración</span>
          <span class="stat-value">${runtime}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Presupuesto</span>
          <span class="stat-value" style="font-size:1.1rem">${budget}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Recaudación</span>
          <span class="stat-value" style="font-size:1.1rem">${revenue}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Popularidad</span>
          <span class="stat-value">${Math.round(movie.popularity ?? 0)}</span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="detail-actions">
        <button class="btn btn-primary"
          id="write-review-btn"
          data-movie-id="${movie.id}"
          data-movie-title="${escapeHTML(movie.title)}">
          ✍️ Escribir Reseña
        </button>
      </div>

      <!-- Lista de reseñas -->
      <div class="detail-section">
        <h2>Reseñas de la comunidad</h2>
        <div id="reviews-list">
          <div class="spinner"></div>
        </div>
      </div>

    </div>
  `;
}

/* ──────────────────────────────────────────────────────────
   Reviews
────────────────────────────────────────────────────────── */

/**
 * Renderiza la lista de reseñas dentro del detalle.
 * @param {Array} reviews
 */
export function renderReviews(reviews) {
  const container = document.getElementById('reviews-list');
  if (!container) return;

  if (!reviews || reviews.length === 0) {
    container.innerHTML = '<p class="no-reviews">Sé el primero en escribir una reseña.</p>';
    return;
  }

  container.innerHTML = `
    <div class="reviews-list">
      ${reviews.map(r => createReviewCardHTML(r)).join('')}
    </div>
  `;
}

function createReviewCardHTML(review) {
  const rating = review.rating ?? '–';
  const genre  = review.genre ?? '';
  const author = review.author ?? `Usuario ${review.userId ?? ''}`;
  const body   = review.body ?? '';

  return `
    <div class="review-card" data-review-id="${review.id}">
      <div class="review-header">
        <div>
          <span class="review-author">${escapeHTML(author)}</span>
          <div class="review-meta">
            <span class="review-rating">⭐ ${rating}/10</span>
            ${genre ? `<span class="review-genre">${escapeHTML(genre)}</span>` : ''}
          </div>
        </div>
      </div>
      <p class="review-body">${escapeHTML(body)}</p>
      <div class="review-actions">
        <button class="btn btn-ghost edit-review-btn btn-sm"
          data-review-id="${review.id}">
          ✏️ Editar
        </button>
        <button class="btn btn-danger btn-sm delete-review-btn"
          data-review-id="${review.id}">
          🗑 Eliminar
        </button>
      </div>
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────
   Stats View
────────────────────────────────────────────────────────── */

/**
 * Renderiza la sección de estadísticas del blog.
 * @param {Array} reviews        - Todas las reseñas cargadas
 * @param {Array} sessionReviews - Reseñas creadas en esta sesión
 */
export function renderStats(reviews, sessionReviews = []) {
  const container = document.getElementById('stats-content');
  if (!container) return;

  // Reseñas con calificación (las de DummyJSON no tienen rating propio)
  const rated = reviews.filter(r => r.rating != null && r.rating !== '');
  const total  = reviews.length;

  const avgRating = rated.length > 0
    ? (rated.reduce((sum, r) => sum + Number(r.rating || 0), 0) / rated.length).toFixed(1)
    : '–';

  const genreCount = {};
  reviews.forEach(r => {
    if (r.genre) genreCount[r.genre] = (genreCount[r.genre] || 0) + 1;
  });
  const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];

  const highestRated = rated.reduce((best, r) => {
    return Number(r.rating) > Number(best?.rating ?? 0) ? r : best;
  }, null);

  if (total === 0) {
    container.innerHTML = `
      <div class="stats-empty">
        <p class="stats-empty-icon">📊</p>
        <p class="stats-empty-msg">Aún no hay reseñas registradas.</p>
        <p class="text-muted">Visita el detalle de una película y escribe la primera.</p>
      </div>
    `;
    return;
  }

  const sessionHTML = sessionReviews.length > 0 ? `
    <div class="stats-session">
      <h3 class="stats-session-title">Reseñas de esta sesión</h3>
      <div class="stats-session-list">
        ${sessionReviews.map(r => `
          <div class="stats-session-item">
            <span class="stats-session-movie">${escapeHTML(r.movieTitle || r.title || 'Sin título')}</span>
            <span class="stats-session-rating">⭐ ${r.rating ?? '–'}/10</span>
            ${r.genre ? `<span class="review-genre">${escapeHTML(r.genre)}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="stat-card">
      <span class="stat-card-icon">📝</span>
      <span class="stat-card-label">Total de reseñas</span>
      <span class="stat-card-value">${total}</span>
      <span class="stat-card-sub">en la base de datos</span>
    </div>

    <div class="stat-card">
      <span class="stat-card-icon">⭐</span>
      <span class="stat-card-label">Calificación promedio</span>
      <span class="stat-card-value">${avgRating}</span>
      <span class="stat-card-sub">sobre 10 puntos</span>
    </div>

    <div class="stat-card">
      <span class="stat-card-icon">🎭</span>
      <span class="stat-card-label">Género más reseñado</span>
      <span class="stat-card-value" style="font-size:1.4rem">
        ${topGenre ? escapeHTML(topGenre[0]) : '–'}
      </span>
      <span class="stat-card-sub">
        ${topGenre ? `${topGenre[1]} reseña${topGenre[1] > 1 ? 's' : ''}` : 'sin datos'}
      </span>
    </div>

    <div class="stat-card">
      <span class="stat-card-icon">🏆</span>
      <span class="stat-card-label">Mejor calificada</span>
      <span class="stat-card-value" style="font-size:1.2rem">
        ${highestRated ? escapeHTML(highestRated.movieTitle || highestRated.title || '–') : '–'}
      </span>
      <span class="stat-card-sub">
        ${highestRated ? `⭐ ${highestRated.rating}/10` : 'sin datos'}
      </span>
    </div>

    ${sessionHTML}
  `;
}

/**
 * Muestra un error en la vista de estadísticas.
 * @param {string} message
 */
export function showStatsError(message) {
  const container = document.getElementById('stats-content');
  if (!container) return;
  container.innerHTML = `
    <div class="error-state">
      <p class="error-icon">⚠️</p>
      <p class="error-message">${escapeHTML(message)}</p>
      <button class="btn btn-outline" onclick="location.reload()">Reintentar</button>
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────
   Estado Vacío y Error
────────────────────────────────────────────────────────── */

export function showEmptyState() {
  const el = document.getElementById('empty-state');
  if (el) el.classList.remove('hidden');
}

export function hideEmptyState() {
  const el = document.getElementById('empty-state');
  if (el) el.classList.add('hidden');
}

/**
 * Muestra un mensaje de error en el grid.
 * @param {string} message
 */
export function showError(message) {
  const grid = document.getElementById('movies-grid');
  if (!grid) return;

  hideEmptyState();
  grid.innerHTML = `
    <div class="error-state">
      <p class="error-icon">⚠️</p>
      <p class="error-message">${escapeHTML(message)}</p>
      <button class="btn btn-outline" onclick="location.reload()">
        Reintentar
      </button>
    </div>
  `;
}

/* ──────────────────────────────────────────────────────────
   Toast Notifications
────────────────────────────────────────────────────────── */

/**
 * Muestra una notificación temporal (toast).
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3200);
}

/* ──────────────────────────────────────────────────────────
   Nav: actualizar enlace activo
────────────────────────────────────────────────────────── */

/**
 * Marca como activo el enlace de navegación correspondiente.
 * @param {string} view
 */
export function setActiveNavLink(view) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.view === view);
  });
}

/* ──────────────────────────────────────────────────────────
   Helper: escapar HTML para prevenir XSS
────────────────────────────────────────────────────────── */

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}
