# Plan 04 — Modal de dress code con pestañas "Mujeres" / "Hombres"

## Objetivo
Añadir un botón en la tarjeta de **Dress Code** (Módulo 4) que abra un modal
con sugerencias de vestimenta, organizadas en dos pestañas: **Mujeres** y
**Hombres**.

> ⚠️ **Dependencia:** reutiliza el componente modal genérico del
> **Plan 03** (`.modal`, controlador `[data-modal-open]` en `main.js`).
> Ejecutar después del Plan 03.
>
> ⚠️ Las imágenes de sugerencias las pasará el usuario después; el plan deja
> la estructura con placeholders en `assets/dresscode/`.

## Pasos

### 1. Preparar carpeta de assets
```bash
mkdir -p assets/dresscode
```
Imágenes esperadas: `mujeres-01.jpg…`, `hombres-01.jpg…` (4–6 por pestaña).

### 2. `index.html` — botón en la tarjeta dress code
La tarjeta `.card--dress` es `display: block` con la ilustración flotante.
Añadir el botón **al final de la tarjeta, después de `.card__avoid`**, con
la misma sangría lateral que el texto:

```html
<div class="card__cta">
  <button type="button" class="btn btn--outline"
          data-modal-open="modal-dresscode">
    Ver sugerencias
  </button>
</div>
```
CSS: `.card--dress .card__cta { margin: 1rem 1.4rem 0; }` (alineado con el
resto del contenido de la tarjeta; centrado si se ve mejor).

### 3. `index.html` — marcado del modal (junto al modal de hospedaje)

```html
<div class="modal" id="modal-dresscode" role="dialog" aria-modal="true"
     aria-labelledby="modal-dresscode-title" hidden>
  <div class="modal__overlay" data-modal-close></div>
  <div class="modal__dialog">
    <button type="button" class="modal__close" data-modal-close
            aria-label="Cerrar">✕</button>
    <h2 class="modal__title" id="modal-dresscode-title">Inspiración Boho Chic</h2>

    <!-- Pestañas -->
    <div class="tabs" role="tablist" aria-label="Sugerencias de vestimenta">
      <button type="button" class="tabs__tab is-active" role="tab"
              id="tab-mujeres" aria-selected="true"
              aria-controls="panel-mujeres" data-tab="panel-mujeres">
        Mujeres
      </button>
      <button type="button" class="tabs__tab" role="tab"
              id="tab-hombres" aria-selected="false"
              aria-controls="panel-hombres" data-tab="panel-hombres">
        Hombres
      </button>
    </div>

    <div class="tabs__panel" role="tabpanel" id="panel-mujeres"
         aria-labelledby="tab-mujeres">
      <div class="modal__gallery">
        <img src="assets/dresscode/mujeres-01.jpg" alt="Sugerencia de vestido boho 1" loading="lazy" />
        <img src="assets/dresscode/mujeres-02.jpg" alt="Sugerencia de vestido boho 2" loading="lazy" />
        <!-- más imágenes al recibir los archivos -->
      </div>
    </div>

    <div class="tabs__panel" role="tabpanel" id="panel-hombres"
         aria-labelledby="tab-hombres" hidden>
      <div class="modal__gallery">
        <img src="assets/dresscode/hombres-01.jpg" alt="Sugerencia de traje boho 1" loading="lazy" />
        <img src="assets/dresscode/hombres-02.jpg" alt="Sugerencia de traje boho 2" loading="lazy" />
        <!-- más imágenes al recibir los archivos -->
      </div>
    </div>
  </div>
</div>
```

### 4. `css/styles.css` — estilos de las pestañas
- `.tabs`: fila centrada con `gap`, debajo del título del modal.
- `.tabs__tab`: estilo pill coherente con los radios del formulario
  (borde oliva, texto `--color-ink-soft`); `.is-active` / `[aria-selected="true"]`:
  fondo `--color-olive`, texto blanco (mismo patrón visual que
  `.radio input:checked + span`, reutilizar valores).
- `.tabs__panel[hidden] { display: none; }`.
- La galería reutiliza `.modal__gallery` del Plan 03 (scroll-snap
  horizontal). Para dress code puede verse mejor **grid de 2 columnas con
  scroll vertical del diálogo** — decidir al tener las fotos; dejar ambas
  opciones anotadas (`.modal__gallery--grid` como modificador opcional).

### 5. `js/main.js` — lógica de pestañas
Dentro de la sección de modales (o su propia IIFE `tabs`), genérica para
cualquier `.tabs`:

```js
document.querySelectorAll(".tabs").forEach((tabs) => {
  tabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".tabs__tab");
    if (!tab) return;
    const root = tabs.closest(".modal__dialog");
    root.querySelectorAll(".tabs__tab").forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    root.querySelectorAll(".tabs__panel").forEach((p) => {
      p.hidden = p.id !== tab.dataset.tab;
    });
  });
});
```
Extra: al **abrir** el modal de dress code, resetear a la pestaña "Mujeres"
(por si el usuario la dejó en "Hombres" la vez anterior). Flechas
izquierda/derecha entre tabs: opcional, no necesario.

## Archivos tocados
- `assets/dresscode/` (nuevo, vacío hasta recibir imágenes)
- `index.html` (botón en `.card--dress` + marcado del modal con tabs)
- `css/styles.css` (`.tabs…`, `.card__cta`, opcional `.modal__gallery--grid`)
- `js/main.js` (lógica de pestañas + reset al abrir)

## Criterio de aceptación
- La tarjeta dress code muestra el botón "Ver sugerencias" sin romper el
  layout de la ilustración flotante.
- El modal abre con la pestaña "Mujeres" activa; alternar entre pestañas
  cambia la galería sin cerrar el modal.
- Mismos comportamientos de cierre que el modal de hospedaje (✕, overlay,
  Escape, foco).
- Estructura lista para soltar las imágenes reales en `assets/dresscode/`.
