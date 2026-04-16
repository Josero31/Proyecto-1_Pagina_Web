/* ═══════════════════════════════════════════════════════════
   main.js — Punto de entrada y orquestación de la app
   ─────────────────────────────────────────────────────────
   · Inicializa la aplicación al cargar el DOM.
   · Configura listeners globales: nav, filtros, formularios,
     modal de confirmación.
   · No hace fetch() directamente; delega a api.js y router.js.
═══════════════════════════════════════════════════════════ */

import { navigateTo, loadHomeView } from './router.js';
import { getGenres, createReview, updateReview, deleteReview } from './api.js';
import { showToast } from './ui.js';
import { validateForm, validateField, getFormData, resetForm, clearErrors } from './validation.js';
import { state } from './state.js';

/* ──────────────────────────────────────────────────────────
   Inicialización
────────────────────────────────────────────────────────── */

async function init() {
  setupNavigation();
  setupMobileMenu();
  setupFilters();
  setupCreateForm();
  setupEditForm();
  setupConfirmModal();
  setupBackButton();
  setupEmptyClearButton();

  await loadGenresFilter();
  populateYearFilter();

  // Carga inicial
  navigateTo('home');
}

/* ──────────────────────────────────────────────────────────
   Navegación — enlaces del navbar
────────────────────────────────────────────────────────── */

function setupNavigation() {
  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.dataset.view;

      // Al ir a home, resetear paginación
      if (view === 'home') {
        state.currentPage = 1;
      }

      navigateTo(view);
    });
  });
}

/* ──────────────────────────────────────────────────────────
   Menú móvil
────────────────────────────────────────────────────────── */

function setupMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');

  toggle?.addEventListener('click', () => {
    links?.classList.toggle('open');
  });
}

/* ──────────────────────────────────────────────────────────
   Filtros — búsqueda, género, año, orden
────────────────────────────────────────────────────────── */

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  const searchBtn   = document.getElementById('search-btn');
  const genreFilter = document.getElementById('genre-filter');
  const yearFilter  = document.getElementById('year-filter');
  const sortFilter  = document.getElementById('sort-filter');
  const clearBtn    = document.getElementById('clear-filters');

  // Buscar al hacer clic
  searchBtn?.addEventListener('click', applyFilters);

  // Buscar con Enter
  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyFilters();
  });

  // Aplicar al cambiar selects (RF-06: filtros combinables)
  genreFilter?.addEventListener('change', applyFilters);
  yearFilter?.addEventListener('change', applyFilters);
  sortFilter?.addEventListener('change', applyFilters);

  // Limpiar filtros
  clearBtn?.addEventListener('click', clearFilters);
}

function applyFilters() {
  state.searchQuery   = document.getElementById('search-input')?.value.trim() ?? '';
  state.selectedGenre = document.getElementById('genre-filter')?.value ?? '';
  state.selectedYear  = document.getElementById('year-filter')?.value ?? '';
  state.sortBy        = document.getElementById('sort-filter')?.value ?? 'popularity.desc';
  state.currentPage   = 1;

  // Si no estamos en home, navegar primero
  if (state.currentView !== 'home') {
    navigateTo('home');
  } else {
    loadHomeView();
  }
}

function clearFilters() {
  // Resetear estado
  state.searchQuery   = '';
  state.selectedGenre = '';
  state.selectedYear  = '';
  state.sortBy        = 'popularity.desc';
  state.currentPage   = 1;

  // Resetear controles
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  setVal('search-input', '');
  setVal('genre-filter', '');
  setVal('year-filter',  '');
  setVal('sort-filter',  'popularity.desc');

  loadHomeView();
}

/* ──────────────────────────────────────────────────────────
   Carga de géneros TMDB para el select de filtros
────────────────────────────────────────────────────────── */

async function loadGenresFilter() {
  try {
    const data  = await getGenres();
    state.genres = data.genres ?? [];

    const select = document.getElementById('genre-filter');
    if (!select) return;

    state.genres.forEach(genre => {
      const option = document.createElement('option');
      option.value       = genre.id;
      option.textContent = genre.name;
      select.appendChild(option);
    });
  } catch {
    // No es crítico; el filtro de género queda sin opciones
  }
}

/* ──────────────────────────────────────────────────────────
   Filtro por año — genera opciones dinámicamente
────────────────────────────────────────────────────────── */

function populateYearFilter() {
  const select = document.getElementById('year-filter');
  if (!select) return;

  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= 1970; year--) {
    const option = document.createElement('option');
    option.value       = year;
    option.textContent = year;
    select.appendChild(option);
  }
}

/* ──────────────────────────────────────────────────────────
   Formulario de CREAR reseña (POST)
────────────────────────────────────────────────────────── */

function setupCreateForm() {
  const form      = document.getElementById('create-form');
  const cancelBtn = document.getElementById('cancel-create');
  const submitBtn = document.getElementById('create-submit-btn');

  if (!form) return;

  // ── Cancelar ────────────────────────────────────────────
  cancelBtn?.addEventListener('click', () => {
    resetForm('create-form', 'create');
    resetRatingPreview('create');
    resetCharCounter('create-body');
    navigateTo('home');
  });

  // ── Validación en tiempo real por campo (blur) ─────────
  // Cada campo se valida individualmente al perder el foco,
  // mostrando el error inline sin necesidad de hacer submit.
  const blurFields = [
    { inputId: 'create-movie-title', field: 'movieTitle' },
    { inputId: 'create-author',      field: 'author'     },
    { inputId: 'create-rating',      field: 'rating'     },
    { inputId: 'create-genre',       field: 'genre'      },
    { inputId: 'create-body',        field: 'body'       },
  ];

  blurFields.forEach(({ inputId, field }) => {
    const el = document.getElementById(inputId);
    el?.addEventListener('blur', () => {
      validateField('create', field, el.value);
    });
  });

  // ── Contador de caracteres en textarea ─────────────────
  const textarea = document.getElementById('create-body');
  const counter  = document.getElementById('counter-create-body');
  const MAX_CHARS = 2000;

  textarea?.addEventListener('input', () => {
    const len = textarea.value.length;
    if (counter) {
      counter.textContent = `${len} / ${MAX_CHARS}`;
      counter.classList.toggle('counter-warn',  len >= MAX_CHARS * 0.85);
      counter.classList.toggle('counter-limit', len >= MAX_CHARS);
    }
  });

  // ── Preview de estrellas al escribir la calificación ───
  document.getElementById('create-rating')?.addEventListener('input', e => {
    updateRatingPreview('create', e.target.value);
  });

  // ── Submit — POST a la API ─────────────────────────────
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const data = getFormData('create');

    // Validación completa desde JS antes de enviar (RT-05)
    if (!validateForm('create', data)) {
      // Hacer foco en el primer campo con error para accesibilidad
      const firstError = form.querySelector('.input-error');
      firstError?.focus();
      return;
    }

    setSubmitLoading(submitBtn, true, 'Publicando…');

    try {
      const created = await createReview({
        title:      data.movieTitle,
        body:       data.body,
        movieTitle: data.movieTitle,
        author:     data.author,
        rating:     data.rating,
        genre:      data.genre,
      });

      // Reflejar inmediatamente en el estado local (sin recargar)
      state.reviews.unshift({
        ...created,
        movieTitle: data.movieTitle,
        author:     data.author,
        rating:     Number(data.rating),
        genre:      data.genre,
      });

      showToast('¡Reseña publicada con éxito! 🎬', 'success');
      resetForm('create-form', 'create');
      resetRatingPreview('create');
      resetCharCounter('create-body');
      navigateTo('home');

    } catch (error) {
      showToast(`Error al publicar: ${error.message}`, 'error');
    } finally {
      setSubmitLoading(submitBtn, false, 'Publicar Reseña');
    }
  });
}

/* ── Helpers del formulario Create ─────────────────────── */

/** Activa / desactiva el estado de carga del botón submit */
function setSubmitLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  const text    = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  if (text)    text.textContent = label;
  if (spinner) spinner.classList.toggle('hidden', !loading);
}

/** Muestra estrellas según la calificación ingresada */
function updateRatingPreview(prefix, value) {
  const preview = document.getElementById(`rating-preview-${prefix}`);
  if (!preview) return;
  const n = parseInt(value, 10);
  if (!value || isNaN(n) || n < 1 || n > 10) {
    preview.textContent = '';
    return;
  }
  const filled = Math.round(n / 2);         // escala 1-10 → 1-5 estrellas
  const empty  = 5 - filled;
  preview.textContent = '★'.repeat(filled) + '☆'.repeat(empty) + `  ${n}/10`;
}

/** Resetea el preview de estrellas */
function resetRatingPreview(prefix) {
  const preview = document.getElementById(`rating-preview-${prefix}`);
  if (preview) preview.textContent = '';
}

/** Resetea el contador de caracteres */
function resetCharCounter(textareaId) {
  const counter = document.getElementById(`counter-${textareaId}`);
  if (counter) {
    counter.textContent = '0 / 2000';
    counter.classList.remove('counter-warn', 'counter-limit');
  }
}

/* ──────────────────────────────────────────────────────────
   Formulario de EDITAR reseña (PUT)
────────────────────────────────────────────────────────── */

function setupEditForm() {
  const form      = document.getElementById('edit-form');
  const cancelBtn = document.getElementById('cancel-edit');
  const submitBtn = document.getElementById('edit-submit-btn');

  if (!form) return;

  cancelBtn?.addEventListener('click', () => {
    clearErrors('edit');
    navigateTo('home');
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const id   = document.getElementById('edit-review-id')?.value;
    const data = getFormData('edit');

    if (!validateForm('edit', data)) return;

    if (submitBtn) {
      submitBtn.disabled    = true;
      submitBtn.textContent = 'Guardando…';
    }

    try {
      const updated = await updateReview(id, {
        title:      data.movieTitle,
        body:       data.body,
        movieTitle: data.movieTitle,
        author:     data.author,
        rating:     data.rating,
        genre:      data.genre,
      });

      const idx = state.reviews.findIndex(r => String(r.id) === String(id));
      if (idx !== -1) {
        state.reviews[idx] = {
          ...state.reviews[idx],
          ...updated,
          movieTitle: data.movieTitle,
          author:     data.author,
          rating:     data.rating,
          genre:      data.genre,
        };
      }

      showToast('Reseña actualizada correctamente.', 'success');
      clearErrors('edit');
      navigateTo('home');

    } catch (error) {
      showToast(`Error al actualizar: ${error.message}`, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Guardar Cambios';
      }
    }
  });
}

/* ──────────────────────────────────────────────────────────
   Modal de confirmación para ELIMINAR (DELETE)
────────────────────────────────────────────────────────── */

function setupConfirmModal() {
  const modal     = document.getElementById('confirm-modal');
  const confirmBtn = document.getElementById('confirm-delete-btn');
  const cancelBtn  = document.getElementById('cancel-delete-btn');

  cancelBtn?.addEventListener('click', () => {
    state.pendingDeleteId = null;
    modal?.classList.add('hidden');
  });

  // Clic fuera del modal para cerrar
  modal?.addEventListener('click', e => {
    if (e.target === modal) {
      state.pendingDeleteId = null;
      modal.classList.add('hidden');
    }
  });

  confirmBtn?.addEventListener('click', async () => {
    const id = state.pendingDeleteId;
    if (!id) return;

    confirmBtn.disabled   = true;
    confirmBtn.textContent = 'Eliminando…';

    try {
      await deleteReview(id);

      // Remover del estado y del DOM inmediatamente
      state.reviews = state.reviews.filter(r => String(r.id) !== String(id));

      const card = document.querySelector(`[data-review-id="${id}"]`);
      card?.remove();

      showToast('Reseña eliminada.', 'success');

    } catch (error) {
      showToast(`Error al eliminar: ${error.message}`, 'error');
    } finally {
      state.pendingDeleteId = null;
      modal?.classList.add('hidden');
      confirmBtn.disabled   = false;
      confirmBtn.textContent = 'Eliminar';
    }
  });
}

/* ──────────────────────────────────────────────────────────
   Botón "Volver" del detalle
────────────────────────────────────────────────────────── */

function setupBackButton() {
  document.getElementById('back-to-home')?.addEventListener('click', () => {
    navigateTo('home');
  });
}

/* ──────────────────────────────────────────────────────────
   Estado vacío — botón limpiar búsqueda
────────────────────────────────────────────────────────── */

function setupEmptyClearButton() {
  document.getElementById('empty-clear-btn')?.addEventListener('click', () => {
    clearFilters();
  });
}

/* ──────────────────────────────────────────────────────────
   Arrancar
────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', init);
