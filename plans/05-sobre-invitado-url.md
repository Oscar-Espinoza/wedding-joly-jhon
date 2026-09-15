# Plan 05 — Sobre con sello de cera + nombre del invitado desde la URL

## Objetivo
Convertir la página en una **invitación personalizada**: al abrir el enlace
aparece un **sobre cerrado** a pantalla completa con un sello de cera rojo
("Abrir"); al hacer clic, la solapa gira, sale la carta con el **nombre del
invitado leído desde la URL** (`/josh` → "Josh", `/josh/kevin` → "Josh &
Kevin"), los nombres de la pareja, la fecha, el lugar y un botón que cierra
el sobre y revela el sitio (que sigue siendo el `index.html` actual con su
formulario RSVP).

> ⚠️ **Sin framework ni build.** Todo es HTML/CSS/JS puro en los archivos
> existentes: `index.html`, `css/styles.css`, `js/main.js` + un archivo
> nuevo `_redirects` para Cloudflare Pages.

## Piezas

1. **`_redirects`** (nuevo) — fallback SPA para que cualquier ruta sirva
   `index.html`.
2. **`index.html`** — overlay del sobre (marcado al inicio de `<body>`) +
   marcado de la carta con los datos del evento.
3. **`css/styles.css`** — estilos del sobre, solapa, sello de cera, carta y
   las `@keyframes` de apertura.
4. **`js/main.js`** — parser del nombre desde la URL, listener del sello,
   control del scroll y prefill del campo `nombre` del RSVP.

---

## Pasos

### 1. `_redirects` — fallback SPA en Cloudflare Pages
Crear el archivo `_redirects` en la **raíz del proyecto** (mismo nivel que
`index.html`; Pages lo lee del directorio de salida):

```
/*  /index.html  200
```

- Es un **rewrite** (código 200), no una redirección: la URL en el
  navegador sigue siendo `/josh/kevin`, pero se sirve `index.html`.
- Cloudflare Pages sirve primero los archivos estáticos reales
  (`/css/styles.css`, `/js/main.js`, `/assets/...`, `favicon`) y solo aplica
  el fallback a rutas sin archivo coincidente — no hace falta listar las
  rutas de assets.

### 2. `index.html` — marcado del sobre (overlay)
Insertar **justo después de `<body>`**, antes del contenido actual:

```html
<!-- MÓDULO 0 — SOBRE / PORTADA PERSONALIZADA -->
<div class="envelope-overlay" id="envelope-overlay">
  <div class="envelope" id="envelope">
    <!-- Capa 1: parte trasera del sobre -->
    <div class="envelope__back"></div>

    <!-- Capa 2: la carta (sale de dentro del sobre) -->
    <div class="envelope__letter" id="envelope-letter">
      <p class="letter__eyebrow">Renovación de votos</p>
      <p class="letter__guest">
        <span class="letter__guest-label">Querido/a(s)</span>
        <span class="letter__guest-name" id="guest-name">Invitados</span>
      </p>
      <h1 class="letter__couple">Joly &amp; Jhon</h1>
      <p class="letter__date">3 de diciembre de 2026</p>
      <p class="letter__venue"><!-- lugar cuando se confirme (data-todo) --></p>
      <button type="button" class="btn btn--primary" id="envelope-enter">
        Ver la invitación
      </button>
    </div>

    <!-- Capa 3: bolsillo frontal del sobre -->
    <div class="envelope__front"></div>

    <!-- Capa 4: solapa (gira sobre el borde superior) -->
    <div class="envelope__flap"></div>

    <!-- Capa 5: sello de cera -->
    <button type="button" class="envelope__seal" id="envelope-seal"
            aria-label="Abrir la invitación">
      <span>Abrir</span>
    </button>
  </div>
</div>
```

Notas de marcado:
- El sello es un `<button>` (accesible por teclado), no un div.
- La carta contiene el botón `#envelope-enter` que cierra el overlay y deja
  ver el sitio; el resto del `index.html` no cambia.
- Reutilizar los tokens y clases del design system: fondo del overlay
  `--color-linen` (con la textura de papel del Plan 01 si aplica), sello
  rojo — usar un rojo cera coherente con la paleta
  (`--color-terracotta`/`--color-terracotta-d` o un `--color-wax: #9e3b32`
  nuevo en `:root`).

### 3. `css/styles.css` — estilos y animación del sobre

**Layout del overlay:**
- `.envelope-overlay`: `position: fixed; inset: 0; z-index: 1000;`
  `display: grid; place-items: center;` fondo lino. Cubre todo el sitio
  hasta que se abre.
- `body.has-envelope { overflow: hidden; }` — bloquea el scroll mientras el
  sobre está visible.
- `.envelope`: tamaño responsive, p. ej.
  `width: min(90vw, 34rem); aspect-ratio: 7 / 5; position: relative;`
  con `perspective: 1200px` **en `.envelope`** (necesario para que el
  `rotateX` de la solapa se vea 3D).

**Capas (z-index — ver GOTCHAS):**
| Elemento | z-index | Nota |
|---|---|---|
| `.envelope__back` | 1 | rectángulo trasero |
| `.envelope__letter` | 2 | sale por arriba al abrir |
| `.envelope__front` | 3 | bolsillo (triángulos laterales + inferior con `clip-path`) |
| `.envelope__flap` | 4 cerrado → 1 abierto | `transform-origin: top center` |
| `.envelope__seal` | 5 | círculo centrado sobre la solapa |

**Animación (transiciones + keyframes, sin librerías):** todo se dispara
añadiendo la clase `.is-open` a `.envelope`:

1. **Solapa** — `@keyframes flap-open { to { transform: rotateX(-180deg) } }`,
   `animation: flap-open .7s ease forwards` con
   `backface-visibility: hidden`. En el mismo keyframe, al 50% bajar el
   z-index (`z-index` se puede animar por pasos dentro de `@keyframes`,
   aunque no transiciona suave) para que la solapa quede **detrás** de la
   carta al girar.
2. **Sello** — `transition: opacity .3s, transform .3s`; con `.is-open`
   pasa a `opacity: 0; transform: scale(.6); pointer-events: none`.
3. **Carta** — `@keyframes letter-out`:
   `0% { transform: translateY(0) scale(.9) }` →
   `100% { transform: translateY(-38%) scale(1) }`,
   con `animation: letter-out .8s ease .75s forwards` (el `animation-delay`
   espera a que termine la solapa). Con `.is-open` además la carta sube su
   z-index (4–6) para que al salir quede por encima del bolsillo.
4. **Salida del overlay** — al hacer clic en `#envelope-enter` se añade
   `.is-done` a `.envelope-overlay`: `transition: opacity .5s` →
   `opacity: 0; visibility: hidden` y el overlay se elimina del flujo
   (`visibility: hidden` + `pointer-events: none`; el `display: none` final
   lo hace JS tras el `transitionend`).

**Responsive y accesibilidad:**
- Mobile-first: el sobre ocupa casi todo el ancho; la carta abierta debe
  caber en pantalla (limitar `max-height` con scroll interno si el texto
  crece).
- `@media (prefers-reduced-motion: reduce)`: saltar las animaciones — el
  primer clic abre directamente el estado final de la carta (deshabilitar
  keyframes y mostrar `.is-open` sin transiciones).

### 4. `js/main.js` — nombre del invitado desde la URL
IIFE nueva `guestName` (o sección al inicio de `main.js`), ejecutada en
`DOMContentLoaded`:

```text
parseGuestNames():
  1. path = window.location.pathname            // "/josh/kevin/"
  2. segments = path.split("/")
       .map(s => s.trim())
       .filter(Boolean)                         // quita vacíos de "/" y
                                                // trailing slashes
  3. Ignorar segmentos reservados: "index.html" (y cualquier cosa con "."
     como "favicon.ico") — por si alguien entra por /index.html
  4. Por segmento:
       s = decodeURIComponent(s)                // "Mar%C3%ADa" → "María"
         (envolver en try/catch: si falla, usar el segmento en crudo)
       s = s.replace(/[-_]+/g, " ")             // "josh-michael" → "josh michael"
       s = s.split(" ")
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ")                          // "María", "Juan Carlos"
  5. return segments.length ? segments.join(" & ") : null
```

Uso del resultado:
- Con nombres: `guest-name`.textContent = "Josh & Kevin".
- Sin nombres (URL raíz): saludo genérico — `guest-name` = "Invitados" (o
  "Familia y amigos") y dejar la etiqueta "Querido/a(s)" o cambiarla a
  "Queridos".
- **Prefill del RSVP**: si hay nombres, escribirlos en el input
  `#nombre` del formulario `#rsvp-form` (`value = names`). El campo es de
  texto libre, así que "Josh & Kevin" entra tal cual.

### 5. `js/main.js` — apertura del sobre
- Al cargar: añadir `has-envelope` a `<body>` (bloquea scroll). El overlay
  está en el HTML, así que no hay flash de contenido.
- Listener en `#envelope-seal` (un solo clic, `{ once: true }`):
  - `envelope.classList.add("is-open")` — dispara toda la secuencia CSS.
  - `seal.disabled = true`.
- Listener en `#envelope-enter`:
  - `overlay.classList.add("is-done")` (fade-out).
  - `body.classList.remove("has-envelope")` (devuelve el scroll).
  - En `transitionend` del overlay (o un `setTimeout` de respaldo de ~600 ms):
    `overlay.remove()`.
- Accesibilidad: al cargar, `seal.focus()`; al abrir, mover el foco a
  `#envelope-enter`. Escape después de abrir = mismo efecto que
  `#envelope-enter` (opcional).

### 6. RSVP — confirmación y envío (ya existe, solo ajustes)
El flujo ya está implementado en `js/main.js` (`setupForm` → POST JSON como
`text/plain` con `mode: "no-cors"` a `APPS_SCRIPT_URL`, mensajes de éxito/
error en `#rsvp-status`). Este plan solo añade:
- El **prefill de `#nombre`** (paso 4).
- Al hacer clic en "Ver la invitación" se puede hacer scroll suave a
  `#rsvp` si se quiere llevar al invitado directo al formulario — opcional;
  por defecto mostrar el hero.
- Campos: se mantienen los actuales (`nombre`, `asistencia`, `hospedaje`,
  `ciudad`). Si se quiere "número de acompañantes", añadir un
  `<input type="number" name="acompanantes" min="0">` al formulario y el
  campo llega solo al Sheet (el front ya serializa todo el form) — dejarlo
  como decisión pendiente, no bloqueante.
- Pegar la URL real del Web App en `APPS_SCRIPT_URL` (sigue pendiente, ver
  CONTEXT.md → TODO 5).

### 7. Despliegue en Cloudflare Pages
- Framework preset: **None**. Build command: **vacío**. Output directory:
  `/` (la raíz del repo) — el sitio es 100% estático.
- `_redirects` debe quedar en la raíz del output (donde está `index.html`).
- Dominio personalizado: Pages → Custom domains → añadir el dominio y
  apuntar el DNS (CNAME al `*.pages.dev`). Las invitaciones se reparten
  como `midominio.com/josh/kevin`.
- Los nombres viven **solo en la URL**: no hay que generar páginas por
  invitado; crear una invitación nueva = compartir un link nuevo.

---

## GOTCHAS

1. **CORS / Apps Script**: el preflight de CORS rompe el POST si se envía
   JSON con `Content-Type: application/json`. Por eso el front envía el
   JSON **como string con `text/plain` y `mode: "no-cors"`** (ya
   implementado): no hay preflight y Apps Script lo lee con
   `JSON.parse(e.postData.contents)`. Consecuencia: la respuesta es opaca —
   el "Gracias" se muestra si el `fetch` no lanza excepción de red, no se
   puede leer el status real. El `doPost` del script debe capturar errores
   y hacer siempre `appendRow` dentro de try/catch con `LockService` para
   escrituras concurrentes.
2. **Capitalización de nombres**:
   - `charAt(0).toUpperCase()` funciona con tildes (`"maría"` → `"María"`).
   - `decodeURIComponent` puede **lanzar excepción** con URLs malformadas
     (`/%E0%A4%A`) — envolver en try/catch y caer al segmento crudo.
   - Nombres compuestos: decidir la convención de URLs y documentarla —
     `/juan-carlos` → "Juan Carlos" (guiones → espacios); `/mariajose` →
     "Mariajose" (sin magia). Apellidos tipo "de la cruz": ponerlos con
     guiones en el link (`/ana/de-la-cruz`) — quedará "Ana & De La Cruz";
     si molesta la mayúscula en "De", lista de excepciones (`de`, `la`,
     `del`, `y`) que se dejan en minúscula salvo primera palabra.
   - Todo el matching es case-insensitive gracias al `.toLowerCase()` del
     resto de la palabra (`/JOSH` → "Josh").
3. **Z-index del sobre** (el punto más frágil):
   - El z-index **no transiciona suavemente**: hay que cambiarlo dentro del
     `@keyframes` de la solapa (a mitad del giro) y de la carta (al empezar
     a salir), o vía `animation-fill-mode: forwards`.
   - `perspective` va en el **padre** (`.envelope`), no en la solapa; la
     solapa necesita `transform-origin: top center` y
     `backface-visibility: hidden` (o una cara trasera pintada si se quiere
     ver el forro interior del sobre).
   - Si la carta se recorta al salir, revisar `overflow` en `.envelope`:
     debe ser `visible` una vez abierta (o dar alto extra al contenedor).
   - El sello (z 5) debe desactivar `pointer-events` al abrirse para no
     interceptar clics de la carta.
4. **Scroll y foco**: no olvidar quitar `has-envelope` del body al cerrar;
   si el overlay se elimina con `display:none` directo, el foco queda en un
   elemento inexistente — mover el foco al hero o al `#envelope-enter`
   antes de quitarlo.
5. **Trailing slashes y rutas raras**: `/`, `/josh/`, `//josh` — el
   `.filter(Boolean)` los cubre todos. `/index.html` debe filtrarse
   explícitamente (regla del punto 3 del parser).
6. **`_redirects`**: el código debe ser `200` (rewrite). Con `301/302` la
   URL cambiaría a `/` y se perdería el nombre. El archivo va sin extensión
   y con al menos un espacio entre columnas.
7. **Caché de Pages**: tras el deploy, si el sobre no aparece o el JS viejo
   sigue activo, hacer hard-refresh / purgar caché — Pages cachea assets
   estáticos agresivamente.
8. **SEO/compartir**: el `og:title`/`og:description` son genéricos (la
   personalización es solo en cliente vía JS; los previews de WhatsApp no
   ejecutan JS). Aceptable: el sobre ya es la experiencia.

## Archivos tocados
- `_redirects` (nuevo, 1 línea)
- `index.html` (overlay del sobre + carta, Módulo 0)
- `css/styles.css` (`:root` color cera opcional, `.envelope*`, `.letter*`,
  `@keyframes flap-open / letter-out`, `body.has-envelope`,
  `prefers-reduced-motion`)
- `js/main.js` (IIFE `guestName`, listeners sello/entrar, prefill
  `#nombre`)

## Criterio de aceptación
- `/:nombre` y `/:nombre/:nombre2` (con trailing slash, mayúsculas y
  tildes codificadas) muestran los nombres capitalizados y unidos con
  " & " en la carta y prefills en `#nombre`.
- `/` muestra el saludo genérico sin romper nada.
- Clic en el sello → solapa gira, sello se desvanece, carta sube y escala;
  clic en "Ver la invitación" → fade-out del overlay, scroll restaurado,
  sitio completo navegable.
- Sin librerías de animación; con `prefers-reduced-motion` la carta aparece
  sin animación.
- El RSVP envía al Apps Script sin preflight CORS y muestra "Gracias" /
  error según corresponda (con `APPS_SCRIPT_URL` configurada).
- Deploy en Cloudflare Pages sin build command; rutas arbitrarias sirven
  `index.html` con la URL intacta; assets estáticos siguen cargando.
