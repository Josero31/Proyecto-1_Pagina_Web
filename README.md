# CineReview — Blog de Películas y Series

Blog CRUD completo construido con HTML5, CSS3 y JavaScript ES2022+ (Vanilla, sin frameworks).

## Descripción

CineReview permite descubrir películas y series, leer sus detalles y gestionar reseñas completas con calificación, género y contenido. Implementa las cuatro operaciones CRUD sobre una API REST real.

## API utilizada

**The Movie Database (TMDB)** — `https://api.themoviedb.org/3`
- GET `/movie/popular` — Listado paginado de películas populares
- GET `/movie/{id}` — Detalle completo de una película
- GET `/search/movie` — Búsqueda por texto
- GET `/discover/movie` — Filtros por género, año y ordenamiento
- GET `/genre/movie/list` — Lista de géneros disponibles

**DummyJSON** — `https://dummyjson.com/posts` (reseñas CRUD simuladas)
- POST `/posts/add` — Crear reseña
- PUT `/posts/{id}` — Editar reseña
- DELETE `/posts/{id}` — Eliminar reseña

## Instrucciones de uso

### 1. Obtener API Key de TMDB (gratis)

1. Crear cuenta en [themoviedb.org](https://www.themoviedb.org/signup)
2. Ir a **Perfil → Settings → API → Create API Key**
3. Elegir "Developer" y completar el formulario
4. Copiar la **API Key (v3 auth)**

### 2. Configurar la API Key

Abrir `js/config.js` y reemplazar:

```js
export const TMDB_API_KEY = 'PEGA_TU_API_KEY_AQUI';
```

### 3. Ejecutar el proyecto

El proyecto usa ES Modules (`type="module"`), por lo que **no puede abrirse directamente con doble clic**. Necesita un servidor HTTP local.

**Opción A — VS Code (recomendado):**
Instalar la extensión **Live Server** y hacer clic en "Go Live".

**Opción B — Python:**
```bash
python -m http.server 5500
```
Luego abrir `http://localhost:5500`

## Funcionalidades implementadas

| RF | Descripción | Estado |
|----|-------------|--------|
| RF-01 | Listado paginado con skeleton loader | ✅ |
| RF-02 | Vista de detalle con 6+ campos + navegación | ✅ |
| RF-03 | Crear reseña (POST) con validación JS | ✅ |
| RF-04 | Editar reseña (PUT) con formulario precargado | ✅ |
| RF-05 | Eliminar reseña (DELETE) con confirmación | ✅ |
| RF-06 | Búsqueda + filtro género + filtro año | ✅ |
| RF-07 | Skeleton, toast, error, estado vacío | ✅ |
| RF-08 | Navegación clara + sección de Estadísticas | ✅ |

## Estructura del proyecto

```
proyecto-blog/
├── index.html
├── .gitignore
├── README.md
├── css/
│   ├── main.css         ← variables, reset, utilidades
│   ├── layout.css       ← navbar, hero, filtros, footer
│   └── components.css   ← cards, botones, forms, skeleton, toasts
└── js/
    ├── config.js        ← URLs y claves de API
    ├── state.js         ← estado global compartido
    ├── api.js           ← todas las funciones fetch
    ├── ui.js            ← funciones que manipulan el DOM
    ├── validation.js    ← validaciones de formularios
    ├── router.js        ← navegación entre vistas
    └── main.js          ← punto de entrada e inicialización
```

## Sección adicional — Estadísticas

La sección **Estadísticas** muestra un resumen de la actividad de la sesión:
- Total de reseñas escritas
- Calificación promedio
- Género más reseñado
- Película mejor calificada

Esta sección es dinámica y se actualiza en tiempo real con cada reseña creada o eliminada.

## Integrantes

- [Nombre Integrante 1]
- [Nombre Integrante 2]

## Despliegue

Disponible en: [URL de GitHub Pages / Netlify]

---

> Datos de películas provistos por [The Movie Database (TMDB)](https://www.themoviedb.org).
> Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB.
