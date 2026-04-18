<div align="center">
  <h3 align="center">CineReview — Blog de Películas y Series</h3>

  <p align="center">
    Un blog CRUD completo para descubrir películas, leer detalles y gestionar reseñas, construido con HTML5, CSS3 y JavaScript Vanilla.
    <br />
    <br />
    <a href="https://github.com/Josero31/Proyecto-1_Pagina_Web/issues">Reportar Bug</a>
    ·
    <a href="https://github.com/Josero31/Proyecto-1_Pagina_Web/issues">Solicitar Feature</a>
  </p>
</div>

---

## Tabla de Contenidos

1. [Sobre el Proyecto](#sobre-el-proyecto)
   - [Construido Con](#construido-con)
2. [Comenzando](#comenzando)
   - [Prerequisitos](#prerequisitos)
   - [Instalación](#instalación)
3. [Uso](#uso)
4. [Funcionalidades](#funcionalidades)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Contribuir](#contribuir)
7. [Licencia](#licencia)
8. [Contacto](#contacto)
9. [Agradecimientos](#agradecimientos)

---

## Sobre el Proyecto

CineReview es un blog interactivo que permite descubrir películas y series, leer sus detalles y gestionar reseñas completas con calificación, género y contenido. Implementa las cuatro operaciones CRUD sobre APIs REST reales.

Por qué CineReview:
* Consume datos reales de **The Movie Database (TMDB)** con paginación, búsqueda y filtros
* Gestión completa de reseñas (crear, leer, editar y eliminar) contra **DummyJSON**
* Estadísticas dinámicas de sesión: promedio de calificaciones, género más reseñado y más

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

### Construido Con

* [![HTML5][HTML5-badge]][HTML5-url]
* [![CSS3][CSS3-badge]][CSS3-url]
* [![JavaScript][JS-badge]][JS-url]
* [![TMDB][TMDB-badge]][TMDB-url]

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

## Comenzando

### Prerequisitos

No se requieren dependencias externas ni gestores de paquetes. Solo necesitas:
- Un navegador moderno con soporte para ES Modules
- Un servidor HTTP local (el proyecto **no puede abrirse con doble clic** debido a `type="module"`)

### Instalación

1. Obtén una API Key **gratuita** en [themoviedb.org](https://www.themoviedb.org/signup)
   - Ir a **Perfil → Settings → API → Create API Key**
   - Elegir "Developer" y copiar la **API Key (v3 auth)**

2. Clona el repositorio
   ```sh
   git clone https://github.com/Josero31/Proyecto-1_Pagina_Web.git
   ```

3. Configura tu API Key en `js/config.js`
   ```js
   export const TMDB_API_KEY = 'PEGA_TU_API_KEY_AQUI';
   ```

4. Levanta un servidor local

   **Opción A — VS Code (recomendado):**
   Instala la extensión **Live Server** y haz clic en "Go Live".

   **Opción B — Python:**
   ```sh
   python -m http.server 5500
   ```
   Luego abre `http://localhost:5500`

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

## Uso

CineReview se divide en varias vistas:

- **Inicio:** listado paginado de películas populares con skeleton loader
- **Detalle:** información completa de una película (título, sinopsis, géneros, calificación, etc.)
- **Reseñas:** formulario para crear, editar y eliminar reseñas con validación en tiempo real
- **Búsqueda y filtros:** busca por texto, filtra por género y año con ordenamiento
- **Estadísticas:** resumen dinámico de la sesión (total de reseñas, promedio, género más reseñado, mejor calificada)

_Para más detalles sobre la API, consulta la [documentación de TMDB](https://developer.themoviedb.org/docs)._

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

## Funcionalidades

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

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

## Estructura del Proyecto

```
Proyecto-1_Pagina_Web/
├── index.html
├── .gitignore
├── README.md
├── css/
│   ├── main.css          ← variables, reset, utilidades
│   ├── layout.css        ← navbar, hero, filtros, footer
│   └── components.css    ← cards, botones, forms, skeleton, toasts
└── js/
    ├── config.js         ← URLs y claves de API
    ├── state.js          ← estado global compartido
    ├── api.js            ← todas las funciones fetch
    ├── ui.js             ← funciones que manipulan el DOM
    ├── validation.js     ← validaciones de formularios
    ├── router.js         ← navegación entre vistas
    └── main.js           ← punto de entrada e inicialización
```

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

## Contribuir

Las contribuciones hacen que la comunidad open source sea un lugar increíble para aprender, inspirar y crear. Cualquier contribución es **muy apreciada**.

Si tienes alguna sugerencia para mejorar el proyecto, haz un fork del repositorio y crea un pull request, o abre un issue con la etiqueta "enhancement". ¡No olvides darle una estrella al proyecto!

1. Haz un Fork del proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

## Licencia

Distribuido bajo la Licencia MIT.

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

## Contacto

Jose Sanchez — [GitHub](https://github.com/Josero31)

Link del proyecto: [https://github.com/Josero31/Proyecto-1_Pagina_Web](https://github.com/Josero31/Proyecto-1_Pagina_Web)

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

## Agradecimientos

* [The Movie Database (TMDB)](https://www.themoviedb.org) — API de datos de películas
* [DummyJSON](https://dummyjson.com) — API REST simulada para reseñas
* [Shields.io](https://shields.io) — Badges del README
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template) — Estructura de este README
* [Live Server — VS Code](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

<p align="right">(<a href="#tabla-de-contenidos">volver arriba</a>)</p>

---

> Datos de películas provistos por [The Movie Database (TMDB)](https://www.themoviedb.org).
> Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB.

<!-- MARKDOWN LINKS & BADGES -->
[contributors-shield]: https://img.shields.io/github/contributors/Josero31/Proyecto-1_Pagina_Web.svg?style=for-the-badge
[contributors-url]: https://github.com/Josero31/Proyecto-1_Pagina_Web/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Josero31/Proyecto-1_Pagina_Web.svg?style=for-the-badge
[forks-url]: https://github.com/Josero31/Proyecto-1_Pagina_Web/network/members
[stars-shield]: https://img.shields.io/github/stars/Josero31/Proyecto-1_Pagina_Web.svg?style=for-the-badge
[stars-url]: https://github.com/Josero31/Proyecto-1_Pagina_Web/stargazers
[issues-shield]: https://img.shields.io/github/issues/Josero31/Proyecto-1_Pagina_Web.svg?style=for-the-badge
[issues-url]: https://github.com/Josero31/Proyecto-1_Pagina_Web/issues
[license-shield]: https://img.shields.io/github/license/Josero31/Proyecto-1_Pagina_Web.svg?style=for-the-badge
[license-url]: https://github.com/Josero31/Proyecto-1_Pagina_Web/blob/main/LICENSE.txt

[HTML5-badge]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML5-url]: https://developer.mozilla.org/es/docs/Web/HTML
[CSS3-badge]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS3-url]: https://developer.mozilla.org/es/docs/Web/CSS
[JS-badge]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JS-url]: https://developer.mozilla.org/es/docs/Web/JavaScript
[TMDB-badge]: https://img.shields.io/badge/TMDB-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white
[TMDB-url]: https://www.themoviedb.org
