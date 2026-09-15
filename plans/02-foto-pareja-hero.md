# Plan 02 — Foto de la pareja en la portada (Módulo 1)

## Objetivo
Añadir la foto de Joly & Jhon en el hero (primera sección). Estilo
"polaroid": marco blanco con esquinas redondeadas y una ligera rotación en
desktop; completamente recta en mobile.

## Imagen de origen
`/home/oscar/Downloads/WhatsApp Image 2026-07-26 at 12.14.53 PM.jpeg` (~2.4 MB)

## Pasos

### 1. Copiar y optimizar el asset
```bash
cp "/home/oscar/Downloads/WhatsApp Image 2026-07-26 at 12.14.53 PM.jpeg" assets/pareja.jpeg
```
2.4 MB es pesado para la primera pantalla. Optimizar si hay herramienta
disponible (ImageMagick / `cwebp`), p.ej.:
```bash
magick assets/pareja.jpeg -resize 1200x1200\> -quality 82 assets/pareja.jpeg
```
Objetivo: ≤ 400 KB. Si no hay herramienta, copiar tal cual y dejarlo anotado
como TODO de optimización.

### 2. `index.html` — insertar en el hero
Dentro de `.hero__content`, **después de `.hero__date` y antes del botón**
(la foto como pieza central entre la fecha y el CTA):

```html
<figure class="hero__photo">
  <img src="assets/pareja.jpeg" alt="Joly y Jhon" width="600" height="600"
       loading="eager" decoding="async" />
</figure>
```
(los `width/height` reales se ajustan al ratio de la imagen para evitar CLS).

> Nota: el bloque comentado de foto opcional en el Módulo 2 (`#historia`)
> se deja como está o se elimina el comentario para no duplicar concepto.

### 3. `css/styles.css` — estilos `.hero__photo`

Base (mobile — **recta, sin rotación**):
```css
.hero__photo {
  margin: 0 auto 2rem;
  width: min(72vw, 19rem);
  padding: 0.6rem 0.6rem 2.2rem;        /* borde inferior más grueso, tipo polaroid */
  background: var(--color-white);
  border-radius: 0.75rem;               /* esquinas un poco redondeadas */
  box-shadow: 0 14px 34px rgba(74, 66, 57, 0.22);
}
.hero__photo img {
  border-radius: 0.45rem;               /* la foto también, un poco menos */
  width: 100%;
  height: auto;
  object-fit: cover;
  aspect-ratio: 1 / 1;                  /* ajustar al ratio real de la foto */
}
```

Desktop (`@media (min-width: 48rem)`) — **rotación ligera**:
```css
.hero__photo {
  transform: rotate(-2.5deg);
  width: min(24vw, 21rem);
  transition: transform 0.3s ease;
}
.hero__photo:hover { transform: rotate(-1deg) scale(1.02); }
```

### 4. Ajustes de layout del hero
- El hero es `min-height: 100svh`; al sumar la foto puede desbordar en
  pantallas bajas. Verificar y, si hace falta:
  - reducir `--fs-hero` un poco en mobile, o
  - permitir que el hero crezca (`min-height` ya lo permite; solo asegurar
    que el `.hero__scroll` (⌄) no se solape con el contenido).
- La foto va dentro de `.hero__content.reveal`, así que hereda la animación
  de aparición — no requiere JS extra.
- Respetar `prefers-reduced-motion`: si se anima la rotación en hover,
  envolverla en la media query correspondiente (opcional, es hover).

## Archivos tocados
- `assets/pareja.jpeg` (nuevo)
- `index.html` (hero, Módulo 1)
- `css/styles.css` (`.hero__photo`, posible ajuste de `.hero`)

## Criterio de aceptación
- Mobile: foto recta, marco blanco con esquinas redondeadas, sin overflow.
- Desktop: misma foto con rotación sutil (~-2.5°), se endereza un poco al
  hover.
- El hero sigue viéndose completo y equilibrado; el indicador de scroll (⌄)
  no se solapa.
