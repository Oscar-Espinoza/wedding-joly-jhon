# Plan 01 — Fondo de papel para toda la página

## Objetivo
Usar la imagen de textura de papel como fondo global de la página. Las
secciones conservan su color actual (lino, lino profundo, oliva), pero con
transparencia para que la textura del papel se perciba a través de ellas,
como si cada sección fuera papel teñido de ese color.

## Imagen de origen
`/home/oscar/Downloads/fondo_papel.jpeg` (~12 KB)

## Pasos

### 1. Copiar el asset
```bash
cp /home/oscar/Downloads/fondo_papel.jpeg assets/fondo-papel.jpeg
```
(nombre en minúsculas con guion, sin espacios ni guion bajo, para URLs limpias).

### 2. `css/styles.css` — fondo global en `body`
- Reemplazar la textura actual de puntos (`background-image:
  radial-gradient(...)` en `body`) por un pseudo-elemento fijo:

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background: url("../assets/fondo-papel.jpeg") center / 480px repeat;
  /* opcional: background-color de respaldo con --color-linen */
}
```

**Por qué un pseudo-elemento fijo y no `background-attachment: fixed` en
`body`:** `fixed` falla en iOS Safari; un `::before` con `position: fixed`
funciona igual en todos lados y el papel no "salta" al hacer scroll.
Revisar tamaño de tile (480px es punto de partida; ajustar según se vea el
patrón sin costuras visibles).

### 3. Hacer translúcidos los fondos de sección
Convertir los colores sólidos a `rgba()` con ~0.85–0.92 de opacidad
(suficiente para ver la textura sin perder el color ni legibilidad):

| Selector actual | Valor actual | Valor nuevo (aprox.) |
|---|---|---|
| `.section--tinted` | `#efe6d6` sólido | `rgba(239, 230, 214, 0.88)` |
| `.section--olive` | `#565a41` sólido | `rgba(86, 90, 65, 0.92)` |
| `.hero` (capa `var(--color-linen)` del `background:`) | sólido | `rgba(246, 241, 231, 0.85)` |
| `.section--cards::after` (veladura) | `rgba(246,241,231,0.74)` | bajar a ~`0.62` para que se note el papel |
| `.footer` | `var(--color-linen-deep)` | `rgba(239, 230, 214, 0.88)` |

**No tocar** (se quedan casi opacos por legibilidad):
- `.card` (blanco) — las tarjetas deben leerse como papel limpio sobre la mesa.
- `.form` (blanco) — igual.
- La capa `--color-linen` base de `body` se mantiene como color de respaldo
  bajo el pseudo-elemento.

### 4. Detalle fino
- Verificar que el texto siga teniendo buen contraste en todas las secciones
  (especialmente `.section--olive`).
- Verificar en mobile que el fondo fijo no cause repintados lentos; si hay
  lag, quitar `position: fixed` y dejar el fondo con scroll normal.

## Archivos tocados
- `assets/fondo-papel.jpeg` (nuevo)
- `css/styles.css` (body, .section--tinted, .section--olive, .hero,
  .section--cards::after, .footer)

## Criterio de aceptación
- La textura de papel se ve de borde a borde y queda fija al hacer scroll.
- Cada sección mantiene su identidad de color, pero "tinteada" sobre el papel.
- Contraste de texto sin cambios perceptibles.
- Sin problemas de rendimiento en mobile.
