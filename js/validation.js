/* ═══════════════════════════════════════════════════════════
   validation.js — Validación de formularios desde JavaScript
   ─────────────────────────────────────────────────────────
   RT-05: NO se confía en atributos HTML (required, minlength).
   Los mensajes de error se muestran inline junto a cada campo.
═══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   Reglas de validación
────────────────────────────────────────────────────────── */

const RULES = {
  movieTitle: {
    label: 'Título',
    validate(val) {
      if (!val.trim())           return 'El título es obligatorio.';
      if (val.trim().length < 2) return 'El título debe tener al menos 2 caracteres.';
      if (val.trim().length > 200) return 'El título no puede superar 200 caracteres.';
      return null;
    },
  },
  author: {
    label: 'Autor',
    validate(val) {
      if (!val.trim())           return 'El nombre es obligatorio.';
      if (val.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
      if (val.trim().length > 80) return 'El nombre no puede superar 80 caracteres.';
      return null;
    },
  },
  rating: {
    label: 'Calificación',
    validate(val) {
      if (!val.trim())           return 'La calificación es obligatoria.';
      const n = Number(val);
      if (isNaN(n) || !Number.isInteger(n)) return 'La calificación debe ser un número entero.';
      if (n < 1 || n > 10)       return 'La calificación debe estar entre 1 y 10.';
      return null;
    },
  },
  genre: {
    label: 'Género',
    validate(val) {
      if (!val.trim()) return 'Selecciona un género.';
      return null;
    },
  },
  body: {
    label: 'Reseña',
    validate(val) {
      if (!val.trim())            return 'La reseña es obligatoria.';
      if (val.trim().length < 20) return 'La reseña debe tener al menos 20 caracteres.';
      if (val.trim().length > 2000) return 'La reseña no puede superar 2000 caracteres.';
      return null;
    },
  },
};

/* ──────────────────────────────────────────────────────────
   validateForm — valida todos los campos de un formulario
────────────────────────────────────────────────────────── */

/**
 * Valida los campos de un formulario según las reglas definidas.
 * Muestra los errores inline y retorna si el formulario es válido.
 *
 * @param {string} prefix - Prefijo de los IDs en el HTML (ej. 'create' → 'create-movie-title')
 * @param {Object} data   - Objeto con los valores del formulario
 * @returns {boolean} true si todos los campos son válidos
 */
export function validateForm(prefix, data) {
  clearErrors(prefix);
  let isValid = true;

  for (const [field, rule] of Object.entries(RULES)) {
    const val   = String(data[field] ?? '');
    const error = rule.validate(val);

    if (error) {
      showFieldError(prefix, field, error);
      markFieldInvalid(prefix, field);
      isValid = false;
    }
  }

  return isValid;
}

/* ──────────────────────────────────────────────────────────
   Helpers de UI de errores
────────────────────────────────────────────────────────── */

/**
 * Muestra un mensaje de error junto al campo.
 * @param {string} prefix
 * @param {string} field
 * @param {string} message
 */
function showFieldError(prefix, field, message) {
  const el = document.getElementById(`error-${prefix}-${field}`);
  if (el) el.textContent = message;
}

/**
 * Añade clase de error al input / select / textarea.
 */
function markFieldInvalid(prefix, field) {
  // El campo del formulario puede llamarse create-movie-title, edit-movie-title, etc.
  const inputId = buildInputId(prefix, field);
  const input   = document.getElementById(inputId);
  if (input) input.classList.add('input-error');
}

/**
 * Limpia todos los mensajes y clases de error del formulario.
 * @param {string} prefix
 */
export function clearErrors(prefix) {
  for (const field of Object.keys(RULES)) {
    const errEl   = document.getElementById(`error-${prefix}-${field}`);
    const inputId = buildInputId(prefix, field);
    const input   = document.getElementById(inputId);

    if (errEl)  errEl.textContent = '';
    if (input)  input.classList.remove('input-error');
  }
}

/**
 * Construye el ID del input según la convención del HTML.
 * Ej. prefix='create', field='movieTitle' → 'create-movie-title'
 */
function buildInputId(prefix, field) {
  const slug = field.replace(/([A-Z])/g, '-$1').toLowerCase();
  return `${prefix}-${slug}`;
}

/* ──────────────────────────────────────────────────────────
   validateField — valida un único campo (para blur en tiempo real)
────────────────────────────────────────────────────────── */

/**
 * Valida un campo individual y muestra / limpia su error inline.
 * Llamado en el evento 'blur' de cada input para feedback inmediato.
 *
 * @param {string} prefix - 'create' | 'edit'
 * @param {string} field  - clave en RULES (ej. 'movieTitle')
 * @param {string} value  - valor actual del campo
 * @returns {boolean} true si el campo es válido
 */
export function validateField(prefix, field, value) {
  const rule = RULES[field];
  if (!rule) return true;

  const error   = rule.validate(String(value ?? ''));
  const inputId = buildInputId(prefix, field);
  const input   = document.getElementById(inputId);
  const errEl   = document.getElementById(`error-${prefix}-${field}`);

  if (error) {
    if (errEl)  errEl.textContent = error;
    if (input)  input.classList.add('input-error');
    return false;
  }

  if (errEl)  errEl.textContent = '';
  if (input)  input.classList.remove('input-error');
  return true;
}

/* ──────────────────────────────────────────────────────────
   Limpiar formulario
────────────────────────────────────────────────────────── */

/**
 * Resetea todos los campos de un formulario y sus errores.
 * @param {string} formId - ID del elemento <form>
 * @param {string} prefix
 */
export function resetForm(formId, prefix) {
  const form = document.getElementById(formId);
  if (form) form.reset();
  clearErrors(prefix);
}

/* ──────────────────────────────────────────────────────────
   Leer datos del formulario
────────────────────────────────────────────────────────── */

/**
 * Lee los valores de los campos del formulario como objeto.
 * @param {string} prefix - 'create' | 'edit'
 * @returns {Object} { movieTitle, author, rating, genre, body }
 */
export function getFormData(prefix) {
  const get = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  return {
    movieTitle: get(`${prefix}-movie-title`),
    author:     get(`${prefix}-author`),
    rating:     get(`${prefix}-rating`),
    genre:      get(`${prefix}-genre`),
    body:       get(`${prefix}-body`),
  };
}
