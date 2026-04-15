/* ═══════════════════════════════════════════════════════════
   config.js — Configuración global de la aplicación
   ─────────────────────────────────────────────────────────
   IMPORTANTE: Reemplaza TMDB_API_KEY con tu clave personal.
   Regístrate gratis en: https://www.themoviedb.org/signup
   Luego: Perfil → Settings → API → Create API Key (v3 auth)
═══════════════════════════════════════════════════════════ */

// ── TMDB (The Movie Database) ───────────────────────────
export const TMDB_API_KEY   = 'PEGA_TU_API_KEY_AQUI';
export const TMDB_BASE_URL  = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_W500  = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMAGE_W1280 = 'https://image.tmdb.org/t/p/w1280';
export const TMDB_LANGUAGE  = 'es-ES';   // respuestas en español

// Imagen de reemplazo cuando no hay poster
export const IMG_PLACEHOLDER =
  'https://via.placeholder.com/500x750/1f1f1f/555555?text=Sin+Imagen';

// ── DummyJSON (reseñas CRUD simuladas) ─────────────────
export const DUMMY_BASE_URL = 'https://dummyjson.com';

// ── Paginación ──────────────────────────────────────────
// TMDB devuelve 20 resultados por página por defecto
// El máximo de páginas que TMDB permite consultar es 500
export const MAX_TMDB_PAGES = 500;
