/* ═══════════════════════════════════════════════════════════
   api.js — Todas las llamadas a APIs externas
   ─────────────────────────────────────────────────────────
   Reglas:
   · Este módulo SOLO hace fetch(). No toca el DOM.
   · Lanza Error con mensaje descriptivo si la respuesta falla.
   · ui.js y router.js consumen las funciones exportadas.
═══════════════════════════════════════════════════════════ */

import {
  TMDB_API_KEY,
  TMDB_BASE_URL,
  TMDB_LANGUAGE,
  DUMMY_BASE_URL,
} from './config.js';

/* ──────────────────────────────────────────────────────────
   Helpers internos
────────────────────────────────────────────────────────── */

/**
 * Hace fetch a un endpoint de TMDB con los parámetros dados.
 * @param {string} endpoint - Ruta relativa, ej. '/movie/popular'
 * @param {Object} params   - Query params adicionales
 * @returns {Promise<Object>} JSON de respuesta
 */
async function fetchTMDB(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', TMDB_LANGUAGE);

  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.status_message ||
      `Error ${response.status}: no se pudo conectar con la API de películas.`
    );
  }

  return response.json();
}

/**
 * Hace fetch a un endpoint de DummyJSON.
 * @param {string} endpoint - Ruta relativa, ej. '/posts/add'
 * @param {Object} [options] - Opciones de fetch (method, body)
 * @returns {Promise<Object>}
 */
async function fetchDummy(endpoint, options = {}) {
  const response = await fetch(`${DUMMY_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `Error ${response.status}: no se pudo completar la operación.`
    );
  }

  return response.json();
}

/* ──────────────────────────────────────────────────────────
   GET — TMDB
────────────────────────────────────────────────────────── */

/**
 * Obtiene películas populares paginadas.
 * Endpoint: GET /movie/popular
 * @param {number} page
 * @returns {Promise<{results, total_pages, total_results}>}
 */
export async function getPopularMovies(page = 1) {
  return fetchTMDB('/movie/popular', { page });
}

/**
 * Obtiene el detalle completo de una película por su ID.
 * Endpoint: GET /movie/{id}
 * Incluye: genres (array), runtime, budget, revenue, tagline, etc.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function getMovieById(id) {
  return fetchTMDB(`/movie/${id}`);
}

/**
 * Busca películas por texto libre.
 * Endpoint: GET /search/movie
 * @param {string} query
 * @param {number} page
 * @returns {Promise<{results, total_pages, total_results}>}
 */
export async function searchMovies(query, page = 1) {
  return fetchTMDB('/search/movie', { query, page });
}

/**
 * Obtiene la lista de géneros disponibles en TMDB.
 * Endpoint: GET /genre/movie/list
 * @returns {Promise<{genres: Array<{id, name}>}>}
 */
export async function getGenres() {
  return fetchTMDB('/genre/movie/list');
}

/**
 * Descubre películas con filtros combinados.
 * Endpoint: GET /discover/movie
 * @param {Object} opts
 * @param {string} [opts.genre]  - ID de género (ej. '28')
 * @param {string} [opts.year]   - Año (ej. '2023')
 * @param {string} [opts.sortBy] - Campo de ordenamiento (ej. 'popularity.desc')
 * @param {number} [opts.page]
 * @returns {Promise<{results, total_pages, total_results}>}
 */
export async function discoverMovies({ genre = '', year = '', sortBy = 'popularity.desc', page = 1 } = {}) {
  return fetchTMDB('/discover/movie', {
    with_genres:           genre,
    primary_release_year:  year,
    sort_by:               sortBy,
    page,
    'vote_count.gte':      50,   // evitar películas con muy pocos votos
  });
}

/* ──────────────────────────────────────────────────────────
   CRUD de Reseñas — DummyJSON /posts
   ─────────────────────────────────────────────────────────
   DummyJSON acepta los 4 verbos HTTP y responde con el
   objeto simulado. Los cambios NO persisten (documentado en
   la descripción del proyecto — está permitido).
────────────────────────────────────────────────────────── */

/**
 * Obtiene la lista de reseñas.
 * Endpoint: GET /posts?limit=30
 * @returns {Promise<{posts: Array}>}
 */
export async function getReviews() {
  return fetchDummy('/posts?limit=30&skip=0');
}

/**
 * Crea una nueva reseña.
 * Endpoint: POST /posts/add
 * @param {{title, body, userId}} data
 * @returns {Promise<Object>} Reseña creada (con id simulado)
 */
export async function createReview(data) {
  return fetchDummy('/posts/add', {
    method: 'POST',
    body: JSON.stringify({
      title:  data.title,
      body:   data.body,
      userId: 1,           // DummyJSON requiere un userId
      // Campos extra para nuestro blog:
      movieTitle: data.movieTitle,
      author:     data.author,
      rating:     data.rating,
      genre:      data.genre,
    }),
  });
}

/**
 * Actualiza una reseña existente.
 * Endpoint: PUT /posts/{id}
 * @param {number|string} id
 * @param {{title, body, movieTitle, author, rating, genre}} data
 * @returns {Promise<Object>} Reseña actualizada
 */
export async function updateReview(id, data) {
  return fetchDummy(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title:      data.title,
      body:       data.body,
      movieTitle: data.movieTitle,
      author:     data.author,
      rating:     data.rating,
      genre:      data.genre,
    }),
  });
}

/**
 * Elimina una reseña.
 * Endpoint: DELETE /posts/{id}
 * @param {number|string} id
 * @returns {Promise<Object>} Objeto con isDeleted: true
 */
export async function deleteReview(id) {
  return fetchDummy(`/posts/${id}`, { method: 'DELETE' });
}
