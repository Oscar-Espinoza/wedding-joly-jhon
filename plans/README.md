# Planes de cambios — Joly & Jhon

Ejecutar **en orden, uno por uno**. Cada documento es independiente salvo la
dependencia marcada en el Plan 04.

| # | Documento | Qué hace | Depende de |
|---|-----------|----------|------------|
| 01 | [01-fondo-papel.md](01-fondo-papel.md) | Textura de papel como fondo global; secciones con color translúcido | — |
| 02 | [02-foto-pareja-hero.md](02-foto-pareja-hero.md) | Foto de la pareja en la portada, estilo polaroid (recta en mobile, rotada en desktop) | — |
| 03 | [03-modal-hospedaje.md](03-modal-hospedaje.md) | Modal con galería del lugar al hacer clic en "Ver hospedaje" + componente modal genérico | — |
| 04 | [04-modal-dresscode.md](04-modal-dresscode.md) | Botón "Ver sugerencias" en dress code + modal con pestañas Mujeres/Hombres | Plan 03 |
| 05 | [05-sobre-invitado-url.md](05-sobre-invitado-url.md) | Sobre con sello de cera de portada + nombre del invitado desde la URL (`/josh/kevin`) + `_redirects` SPA para Cloudflare Pages + prefill del RSVP | — |

Pendiente del usuario:
- Fotos del hospedaje → `assets/hospedaje/` (Plan 03)
- Imágenes de sugerencias de vestimenta → `assets/dresscode/` (Plan 04)
