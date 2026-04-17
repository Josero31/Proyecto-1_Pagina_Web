/* ═══════════════════════════════════════════════════════════
   state.js — Estado global compartido de la aplicación
   Todos los módulos importan desde aquí; nadie define
   estado propio.
═══════════════════════════════════════════════════════════ */

export const state = {
  // ── Navegación ──────────────────────────────────────
  currentView:    'home',   // 'home' | 'detail' | 'create' | 'edit' | 'stats'
  currentMovieId: null,     // ID de la película en vista de detalle

  // ── Paginación ──────────────────────────────────────
  currentPage:  1,
  totalPages:   1,
  totalResults: 0,

  // ── Filtros activos ─────────────────────────────────
  searchQuery:   '',        // texto libre
  selectedGenre: '',        // ID de género TMDB
  selectedYear:  '',        // año de lanzamiento
  sortBy:        'popularity.desc',

  // ── Catálogo ────────────────────────────────────────
  genres: [],               // lista de géneros TMDB: [{id, name}]

  // ── Reseñas (CRUD con DummyJSON) ───────────────────
  reviews:         [],      // reseñas cargadas en la sesión
  sessionReviews:  [],      // reseñas creadas/editadas en esta sesión
  currentReviewId: null,    // ID de la reseña en edición
  pendingDeleteId: null,    // ID esperando confirmación de borrado
};
