# CONTEXT — Invitación Web Joly & Jhon

> Leer esto primero en cualquier sesión nueva. Resumen rápido del proyecto
> para no tener que releer todos los archivos.

## Qué es

Página estática (HTML/CSS/JS puro, sin build) — invitación a la **renovación
de votos de Joly & Jhon**, **3 de diciembre de 2026**. Estética **boho chic**:
flores silvestres, ramas de olivo, botánico. Idioma: **español**.

Se desplegará en **Cloudflare Pages** (plan gratis, `*.pages.dev`) → todo debe
seguir siendo estático, sin dependencias de servidor.

## Estructura de archivos

```
wedding-joly-jhon/
├── index.html      → única página, 11 módulos numerados con comentarios
├── css/styles.css  → tokens de diseño en :root + estilos (mobile-first)
├── js/main.js      → countdown, scroll-reveal, envío de formularios
├── assets/         → imágenes (vacío por ahora)
└── CONTEXT.md      → este archivo
```

## Design system (tokens en `css/styles.css` → `:root`)

- Colores: `--color-linen` (#f6f1e7, fondo), `--color-linen-deep`,
  `--color-olive` (#6f7355), `--color-olive-deep` (#565a41, secciones oscuras),
  `--color-terracotta` (#c06a3d, acento/botones), `--color-terracotta-d`,
  `--color-terracotta-soft` (#f2ddcd, tarjeta dress code), `--color-mustard`
  (#d9a441, detalles), `--color-sage` (#9a9d80, hojas claras), `--color-ink`,
  `--color-ink-soft`, `--color-white`.
- Fuentes (Google Fonts): `--font-script` = Great Vibes (nombres/acentos),
  `--font-serif` = Cormorant Garamond (texto), `--font-sans` = Montserrat
  (etiquetas/botones).
- Clases útiles: `.btn--primary` (terracota), `.btn--outline`, `.btn--light`;
  `.section--tinted`, `.section--olive`; `.reveal` (animación al hacer scroll);
  `.divider` (divisor botánico); `.eyebrow`; `.section__script`.

## Módulos del PDF (guía de contenido)

Origen: guía completa con 11 módulos. Todos implementados en `index.html` con
comentarios `MÓDULO N`. Ojo: los módulos 4 (dress code), 5 (hospedaje) y 6
(confirmar) viven juntos en la **sección de tarjetas** (`#detalles`,
`.cards`) — apiladas en mobile, 3 columnas en desktop (≥62rem), siguiendo el
mockup de referencia. Detalles del mockup implementados:

- Fondo de sección tipo "bosque desenfocado": manchas radiales verdes con
  `blur()` (`.section--cards::before`) bajo una veladura translúcida de lino
  (`::after`) — es CSS puro, no imagen; se puede reemplazar por foto real.
- Tarjeta dress code: banda terracota "acuarela" (`.card__band`, degradados)
  con texto blanco + ilustración SVG de traje y vestido (`.card__attire`,
  flotante a la derecha, el texto la envuelve). La tarjeta es `display:block`.
- Florales dentro de tarjetas: `.card__floral--bl/br` (reusan `#floral-corner`).
  Hospedaje: esquinas inferiores internas. Confirmar: se sale de la esquina
  inferior derecha (`overflow: visible` solo en esa tarjeta; la sección lo recorta).
- Tarjeta confirmar: fondo verde "bosque" (`::before` con manchas) y botón
  `btn--primary` (terracota, como en el mockup). El formulario RSVP completo sigue siendo su propia
  sección (`#rsvp`); la tarjeta "Confirma tu asistencia" hace scroll hacia él.
  Acompañantes: Opción 1 (celebración íntima), dentro de la sección RSVP.

## Florales (placeholders)

Las flores de las esquinas son un **SVG placeholder** definido una sola vez en
`index.html` como `<g id="floral-corner">` y reutilizado con `<use>` dentro de
`div.floral` (posiciones: `.floral--tl/tr/bl/br` — el SVG está dibujado para
la esquina superior izquierda y se voltea con `transform`). Están en: hero
(esquinas superiores), sección de tarjetas (inferior izquierda) y cierre
(esquinas inferiores, con `filter: brightness` para el fondo oliva).
**Pendiente del usuario:** extraer las flores reales del arte de la invitación
a PNG → poner en `assets/` y reemplazar los `<svg><use…>` por `<img>` dentro
de los mismos `div.floral` (el posicionamiento CSS ya sirve).

## Estado actual

1. **Lugar**: Las Caballerizas, RN205 km 92, Lobos. El mapa, enlace externo,
   galería y video están configurados.
2. **Horarios**: llegada 17:00 h y ceremonia 17:45 h.
3. **Hospedaje**: USD 100 por persona, dos noches del 3 al 5 de diciembre;
   salida el 5 a las 10:00 h. Las fotos de la casa están en
   `assets/hospedaje/` y se muestran en el modal.
4. **Foto de la pareja + historia en el hero**: HECHO (plan 02) —
   `assets/pareja.webp` (900×1200, 3:4) como polaroid
   (`.hero__photo`). El texto del Módulo 2 (historia) vive ahora en el hero
   (`.hero__story`); la sección `#historia` se eliminó y `hero__scroll`
   apunta a `#concepto`.
   - Mobile: foto recta entre la fecha y el botón; historia después del
     botón. `.hero__text` es `display: contents` y se ordena con flex
     (`order`: btn 1, story 2).
   - Desktop (≥62rem): grid con áreas `"text text" / "story photo"` —
     título arriba centrado a todo lo ancho, historia a la izquierda de la
     foto grande (`min(26vw, 22rem)`) con rotación -2.5° (hover la endereza).
   - `.hero` usa `grid-template-columns: minmax(0, 1fr)` como salvaguarda
     anti-overflow. Ojo: Chrome headless tiene ancho mínimo de ventana de
     500px — para validar mobile (390px) hay que forzar `html{width:390px}`
     en una copia de depuración y recortar la captura.
     4b. **PNGs florales reales** — ver sección "Florales (placeholders)".
5. **Google Sheets / RSVP**: `js/main.js` ya tiene todo el flujo
   (`setupForm`) y la URL del Web App está configurada en `APPS_SCRIPT_URL`.
   Plan: Google Apps Script `doPost` → append a hoja; el front envía JSON como
   `text/plain` con `mode: "no-cors"` (evita preflight). Campos RSVP: nombre,
   asistencia, hospedaje, ciudad. Canción: campo `cancion`. Ambos incluyen
   `tipo` ("rsvp" | "cancion") para distinguir filas.
6. Countdown apunta a `2026-12-03T17:45:00-03:00`, la hora de la ceremonia.

## Decisiones de diseño

- **Mobile-first** (la mayoría abrirá desde el celular); contenedor de lectura
  máx. ~640px; desktop solo añade padding y layout inline del form de canción.
- Esquinas florales: SVG placeholder inline (ver sección "Florales").
- Referencias visuales dadas por el usuario: mockup boho con tipografía script
  dorada, fondo lino texturizado, tarjetas terracota/oliva (imagen 1) y layout
  tipo invitación con foto hero (imagen 2).
