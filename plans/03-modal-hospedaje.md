# Plan 03 — Modal de hospedaje ("Ver hospedaje")

## Objetivo
Al hacer clic en **"Ver hospedaje"** (tarjeta Módulo 5) se abre un modal
con una galería de fotos del lugar. Este plan también crea el **componente
modal genérico reutilizable**, que el Plan 04 (dress code) reutilizará.

> ⚠️ Las fotos del lugar las pasará el usuario después. El plan deja la
> estructura lista con placeholders; solo habrá que soltar los archivos en
> `assets/hospedaje/` y actualizar los `src` si cambian los nombres.

## Pasos

### 1. Preparar carpeta de assets
```bash
mkdir -p assets/hospedaje
```
Imágenes esperadas: `assets/hospedaje/01.jpg`, `02.jpg`, `03.jpg`…
(mientras no existan, usar `alt` descriptivo; el modal funciona igual).

### 2. `index.html` — cambiar el enlace por un botón que abre el modal
En la tarjeta `#hospedaje`, reemplazar:
```html
<a href="#" class="btn btn--primary" data-todo="link-hospedaje">Ver hospedaje</a>
```
por:
```html
<button type="button" class="btn btn--primary" data-modal-open="modal-hospedaje">
  Ver hospedaje
</button>
```
> El `data-todo="link-hospedaje"` se conserva mentalmente: si más adelante
> hay link externo del lugar, se puede añadir como enlace dentro del modal.

### 3. `index.html` — marco del modal (antes de `</body>`, tras el `<footer>`)
Componente genérico: cualquier elemento con `data-modal-open="<id>"` abre el
modal con ese `id`.

```html
<div class="modal" id="modal-hospedaje" role="dialog" aria-modal="true"
     aria-labelledby="modal-hospedaje-title" hidden>
  <div class="modal__overlay" data-modal-close></div>
  <div class="modal__dialog">
    <button type="button" class="modal__close" data-modal-close
            aria-label="Cerrar">✕</button>
    <h2 class="modal__title" id="modal-hospedaje-title">El refugio</h2>
    <p class="modal__text">
      Así luce el lugar donde celebraremos — hospedaje tipo glamping en
      medio de la naturaleza.
    </p>
    <div class="modal__gallery">
      <img src="assets/hospedaje/01.jpg" alt="Vista del glamping" loading="lazy" />
      <img src="assets/hospedaje/02.jpg" alt="Interior de la tienda" loading="lazy" />
      <img src="assets/hospedaje/03.jpg" alt="Zona exterior del refugio" loading="lazy" />
    </div>
  </div>
</div>
```

### 4. `css/styles.css` — estilos del modal
- `.modal[hidden] { display: none; }` y estado abierto con `.modal` fijo a
  pantalla completa, `z-index` alto (sobre los florales).
- `.modal__overlay`: fondo oscuro `rgba(46, 50, 34, 0.6)` con
  `backdrop-filter: blur(4px)` (con fallback sin blur).
- `.modal__dialog`: tarjeta `var(--color-linen)` (o blanco), `border-radius:
  var(--radius)`, ancho `min(92vw, 40rem)`, `max-height: 88vh` con scroll
  interno, centrada con grid/flex. Animación de entrada suave (fade + subir
  unos px).
- `.modal__close`: botón circular arriba a la derecha, terracota.
- `.modal__gallery`: tira horizontal con **scroll-snap**
  (`scroll-snap-type: x mandatory`, cada img `scroll-snap-align: center`),
  fotos a ancho completo del diálogo, `border-radius` y `aspect-ratio: 4/3`
  con `object-fit: cover`. Simple y táctil; sin JS.
- `body.modal-open { overflow: hidden; }` para bloquear el scroll del fondo.
- Respetar `prefers-reduced-motion` en la animación de entrada.

### 5. `js/main.js` — controlador genérico de modales
Nueva sección `/* ---------- 4. MODALES ---------- */`:

```js
(function modals() {
  let lastTrigger = null;

  function openModal(id, trigger) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastTrigger = trigger || null;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector(".modal__close")?.focus();
  }

  function closeModal(modal) {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    lastTrigger?.focus();
  }

  // Abrir: cualquier [data-modal-open]
  document.querySelectorAll("[data-modal-open]").forEach((btn) => {
    btn.addEventListener("click", () =>
      openModal(btn.dataset.modalOpen, btn));
  });

  // Cerrar: overlay, botón ✕ (delegación por [data-modal-close])
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-close]")) closeModal(modal);
    });
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector(".modal:not([hidden])");
    if (open) closeModal(open);
  });
})();
```
Puntos de accesibilidad incluidos: foco al abrir/cerrar, `Escape`, click
fuera. (Focus trap completo: opcional, el diálogo es pequeño.)

## Archivos tocados
- `assets/hospedaje/` (nuevo, vacío hasta recibir fotos)
- `index.html` (botón en tarjeta `#hospedaje` + marcado del modal)
- `css/styles.css` (bloque `.modal…`)
- `js/main.js` (controlador de modales)

## Criterio de aceptación
- Click en "Ver hospedaje" abre el modal centrado con título, texto y
  galería deslizable.
- Cierra con ✕, click en el overlay y tecla `Escape`; devuelve el foco al
  botón.
- El fondo no hace scroll mientras el modal está abierto.
- Funciona en mobile y desktop; listo para recibir las fotos reales.
