# Portafolio · Iván Mejía (Nuz777)

Portafolio personal de desarrollo web full stack: proyectos, stack tecnológico, servicios y contacto.

**Sitio:** https://nuz777.github.io/Portafolio/

## Características

- Bilingüe (español / inglés) con cambio en vivo y preferencia guardada.
- Modo claro y oscuro, aplicado antes de pintar la página para evitar parpadeos.
- Filtros de proyectos por tecnología (JavaScript / TypeScript, C# / .NET, Python).
- Vista previa interactiva de cada proyecto en un modal (sitio en vivo o captura).
- Sección destacada de **StockPro** con demostraciones animadas en SVG: el cursor recorre cada flujo de la app (panel, crear productos, operaciones masivas, importación desde Excel, búsqueda, perfil y temas). Las demos se cargan solo al acercarse a la sección, se pausan fuera de pantalla o al pasar el cursor y respetan la preferencia de movimiento reducido.
- Animaciones de aparición, contadores, cursor personalizado en la sección de proyectos y modo pantalla completa.
- Diseño adaptable a móvil.

## Tecnologías

HTML, CSS y JavaScript sin frameworks ni proceso de compilación.

## Estructura

```
index.html
public/
├── favicon.svg
└── img/                    # Capturas de proyectos y fotos
src/
├── js/
│   ├── i18n.js             # Textos en español e inglés
│   ├── main.js             # Tema, navegación, animaciones y vista previa
│   ├── stockpro.js         # Vitrina de StockPro y filtros de proyectos
│   └── stockpro-demos.js   # Demos SVG generadas desde el proyecto StockPro
└── styles/
    ├── globals.css
    └── stockpro.css        # Vitrina, demos y filtros
```

## Uso local

Al ser un sitio estático, basta con servir la carpeta:

```bash
python3 -m http.server 8080
# o
npx serve .
```

## Agregar un proyecto

1. Copia un `<article class="project-card">` en `index.html` y ajusta imagen, textos, tecnologías y enlace.
2. Asigna `data-cats` con una o varias categorías: `js`, `dotnet`, `python`.
3. Si la descripción usa `data-i18n`, agrega la clave en ambos idiomas en `src/js/i18n.js`.
