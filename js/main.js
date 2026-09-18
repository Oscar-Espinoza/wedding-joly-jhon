/* =========================================================
   JOLY & JOHN — main.js
   - Cuenta regresiva (Módulo 11)
   - Animación de aparición (scroll reveal)
   - Envío de formularios a Google Sheets (Apps Script)
   ========================================================= */

/* ---------- CONFIG ---------- */
/* TODO: pegar aquí la URL del Web App de Google Apps Script
   (se genera al desplegar el script conectado a la hoja de cálculo).
   Mientras esté vacío, el formulario solo valida y muestra
   un mensaje de éxito simulado en la consola. */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzzPHT6yL3K9o0Ht2xWBF49eY-HsYSTR5IQ_AHG4jkCQHw9hvuqMDPONHzdKlGftfmn/exec";

/* ---------- 0. SOBRE PERSONALIZADO (nombres desde la URL) ---------- */
(function envelopeGuest() {
  const overlay = document.getElementById("envelope-overlay");
  const envelope = document.getElementById("envelope");
  const seal = document.getElementById("envelope-seal");
  const guestNameEl = document.getElementById("guest-name");
  const guestLabelEl = document.getElementById("guest-label");
  const rsvpName = document.getElementById("nombre");
  const music = document.getElementById("bg-music");

  if (!overlay || !envelope || !seal) return;

  function parseGuestNames() {
    const path = window.location.pathname;
    // Tomar solo el primer segmento de la ruta (Cloudflare Pages
    // funciona mejor con un solo nivel, ej. /Ale&Juley).
    let first = path
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => s.toLowerCase() !== "index.html" && !s.includes("."))[0];

    if (!first) return null;

    try { first = decodeURIComponent(first); } catch (_) { /* usar crudo */ }

    // Permitir separar dos nombres con & dentro del primer segmento.
    const rawNames = first.includes("&") ? first.split("&") : [first];

    return rawNames
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        s = s.replace(/[-_]+/g, " ");
        return s
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
      });
  }

  const names = parseGuestNames();
  if (names) {
    const displayNames = names.join(" & ");
    if (guestNameEl) guestNameEl.textContent = displayNames;
    // En el RSVP pre-llenamos solo el primer nombre
    if (rsvpName) rsvpName.value = names[0];
  } else {
    if (guestNameEl) guestNameEl.textContent = "Invitados";
    if (guestLabelEl) guestLabelEl.textContent = "Queridos";
  }

  // Bloquear scroll mientras el sobre está visible y poner foco en el sello
  document.body.classList.add("has-envelope");
  seal.focus();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let isClosing = false;

  // La animación terminó: desvanecer el overlay y revelar el sitio
  function finishEnvelope() {
    if (isClosing) return;
    isClosing = true;

    overlay.classList.add("is-done");
    document.body.classList.remove("has-envelope");

    function remove() {
      overlay.removeEventListener("transitionend", remove);
      if (overlay.parentNode) overlay.remove();
      // Devolver el foco al contenido para no dejarlo en un elemento inexistente
      const hero = document.getElementById("inicio");
      if (hero) {
        hero.setAttribute("tabindex", "-1");
        hero.focus({ preventScroll: true });
      }
    }

    overlay.addEventListener("transitionend", remove);
    // Respaldo por si transitionend no dispara
    setTimeout(remove, 600);
  }

  // Abrir el sobre al hacer clic en el sello (una sola vez).
  // La solapa gira (0.7s) y el sobre entero se desliza fuera de la
  // pantalla revelando la invitación (termina ~1.65s).
  seal.addEventListener(
    "click",
    () => {
      envelope.classList.add("is-open");
      seal.disabled = true;

      // Iniciar música de fondo tras la interacción del usuario
      if (music) {
        music.volume = 0.6;
        music.play().catch((err) => {
          console.info("[wedding] No se pudo reproducir la música:", err);
        });
      }

      // Esperar a que termine la secuencia (solapa + salida del sobre)
      setTimeout(finishEnvelope, reduceMotion ? 150 : 1700);
    },
    { once: true }
  );
})();

/* Pausar la música de fondo mientras se reproduce el video del lugar. */
(function coordinateVenueVideoAudio() {
  const video = document.getElementById("venue-video");
  const music = document.getElementById("bg-music");
  if (!video || !music) return;

  let shouldResumeMusic = false;

  video.addEventListener("play", () => {
    shouldResumeMusic = !music.paused;
    if (shouldResumeMusic) music.pause();
  });

  function resumeMusic() {
    if (!shouldResumeMusic) return;
    shouldResumeMusic = false;
    music.play().catch(() => {});
  }

  video.addEventListener("pause", resumeMusic);
  video.addEventListener("ended", resumeMusic);
})();

/* ---------- 1. CUENTA REGRESIVA ---------- */
(function countdown() {
  const el = document.getElementById("countdown");
  if (!el) return;

  const target = new Date(el.dataset.target).getTime();
  const units = {
    days: el.querySelector('[data-unit="days"]'),
    hours: el.querySelector('[data-unit="hours"]'),
    minutes: el.querySelector('[data-unit="minutes"]'),
    seconds: el.querySelector('[data-unit="seconds"]'),
  };

  function tick() {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    units.days.textContent = d;
    units.hours.textContent = String(h).padStart(2, "0");
    units.minutes.textContent = String(m).padStart(2, "0");
    units.seconds.textContent = String(s).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
})();

/* ---------- 2. SCROLL REVEAL ---------- */
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((i) => observer.observe(i));
})();

/* ---------- 3. FORMULARIOS → GOOGLE SHEETS ----------
   Enviamos los datos mediante un formulario oculto + iframe.
   Esto evita las restricciones CORS y las redirecciones 302 que
   devuelve Apps Script cuando usamos fetch.
-------------------------------------------------------- */
let _appsScriptIframe = null;

function getAppsScriptIframe() {
  if (_appsScriptIframe && _appsScriptIframe.parentNode) return _appsScriptIframe;

  _appsScriptIframe = document.createElement("iframe");
  _appsScriptIframe.name = "apps-script-iframe";
  _appsScriptIframe.id = "apps-script-iframe";
  _appsScriptIframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;opacity:0;";
  _appsScriptIframe.setAttribute("aria-hidden", "true");
  _appsScriptIframe.src = "about:blank";
  document.body.appendChild(_appsScriptIframe);
  return _appsScriptIframe;
}

function submitToAppsScript(data, onSuccess, onError) {
  if (!APPS_SCRIPT_URL) {
    console.info("[wedding] APPS_SCRIPT_URL vacío — datos simulados:", data);
    onSuccess();
    return;
  }

  const iframe = getAppsScriptIframe();

  // Esperar a que el iframe esté listo para evitar que el form se abra en nueva ventana
  function doSubmit() {
    const form = document.createElement("form");
    form.action = APPS_SCRIPT_URL;
    form.method = "POST";
    form.target = "apps-script-iframe";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(data);
    form.appendChild(input);

    let cleanedUp = false;
    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      if (form.parentNode) form.parentNode.removeChild(form);
    }

    const onLoad = () => {
      cleanup();
      onSuccess();
    };

    const onError = () => {
      cleanup();
      onError(new Error("Error al enviar el formulario"));
    };

    iframe.addEventListener("load", onLoad, { once: true });
    iframe.addEventListener("error", onError, { once: true });

    setTimeout(() => {
      cleanup();
      iframe.removeEventListener("load", onLoad);
      iframe.removeEventListener("error", onError);
      onError(new Error("El envío tardó demasiado"));
    }, 10000);

    document.body.appendChild(form);
    form.submit();
  }

  if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
    doSubmit();
  } else {
    iframe.addEventListener("load", function ready() {
      if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
        doSubmit();
      }
    }, { once: true });
  }
}

function setupForm(formId, statusId) {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.classList.remove("form__status--error");

    if (!form.checkValidity()) {
      status.textContent = "Por favor completa los campos requeridos.";
      status.classList.add("form__status--error");
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (formId === "rsvp-form") {
      data.hospedaje = data.asistencia === "si" ? "si" : "no";
    }
    data.url = window.location.pathname;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = "Enviando…";

    submitToAppsScript(
      data,
      () => {
        status.textContent = "¡Gracias! Tu respuesta fue enviada. 💛";
        form.reset();
        btn.textContent = "Confirmado";
        btn.disabled = true;
      },
      (err) => {
        console.error("[wedding] Error al enviar:", err);
        status.textContent = "Hubo un problema. Inténtalo de nuevo, por favor.";
        status.classList.add("form__status--error");
        btn.disabled = false;
      }
    );
  });
}

/* Formulario RSVP: envía nombre, asistencia, hospedaje implícito
   y URL del enlace (para saber quién respondió). */
setupForm("rsvp-form", "rsvp-status");

/* ---------- 4. MODALES ----------
   Controlador genérico: cualquier [data-modal-open="<id>"] abre el
   modal con ese id; dentro del modal, [data-modal-close] lo cierra.
   Incluye: foco al abrir/cerrar, cierre con Escape y click en overlay. */
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

  // Cerrar con Escape (si el lightbox está abierto, él lo gestiona primero)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const lightbox = document.getElementById("lightbox");
    if (lightbox && !lightbox.hidden) return;
    const open = document.querySelector(".modal:not([hidden])");
    if (open) closeModal(open);
  });
})();

/* ---------- 4.5 TABS (pestañas dentro de modales) ---------- */
(function tabs() {
  function resetToFirstTab(modal) {
    const firstTab = modal.querySelector(".tabs__tab");
    if (!firstTab) return;
    switchTab(firstTab);
  }

  function switchTab(activeTab) {
    const root = activeTab.closest(".modal__dialog");
    if (!root) return;
    const panelId = activeTab.dataset.tab;

    root.querySelectorAll(".tabs__tab").forEach((t) => {
      const active = t === activeTab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });

    root.querySelectorAll(".tabs__panel").forEach((p) => {
      p.hidden = p.id !== panelId;
    });
  }

  document.querySelectorAll(".tabs").forEach((tabs) => {
    tabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".tabs__tab");
      if (!tab) return;
      e.preventDefault();
      switchTab(tab);
    });
  });

  // Al abrir el modal de dress code, activar la pestaña indicada
  // (o la primera si no hay preferencia).
  document.querySelectorAll("[data-modal-open='modal-dresscode']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = document.getElementById("modal-dresscode");
      if (!modal) return;
      const tabId = btn.dataset.modalTab;
      if (tabId) {
        const tab = modal.querySelector(`.tabs__tab[data-tab="${tabId}"]`);
        if (tab) switchTab(tab);
      } else {
        resetToFirstTab(modal);
      }
    });
  });
})();

/* ---------- 5. LIGHTBOX ----------
   Al hacer clic en una foto de cualquier .modal__gallery se abre en
   grande. Navegación: botones ‹ ›, flechas del teclado y swipe táctil. */
(function lightbox() {
  const box = document.getElementById("lightbox");
  if (!box) return;

  const img = box.querySelector(".lightbox__img");
  let photos = [];
  let index = 0;
  let returnFocus = null;

  function show(i) {
    index = (i + photos.length) % photos.length; // navegación circular
    img.src = photos[index].src;
    img.alt = photos[index].alt;
  }

  function open(photosList, i, trigger) {
    photos = photosList;
    returnFocus = trigger || null;
    box.hidden = false;
    show(i);
    box.querySelector(".lightbox__close").focus();
  }

  function close() {
    box.hidden = true;
    img.src = "";
    returnFocus?.focus();
  }

  // Abrir: clic en cualquier foto de una galería (modal o sección del lugar)
  document.querySelectorAll(".modal__gallery, .venue__gallery").forEach((gallery) => {
    const list = [...gallery.querySelectorAll("img")];
    list.forEach((photo, i) => {
      photo.addEventListener("click", () => open(list, i, photo));
    });
  });

  // Cerrar: overlay y botón ✕
  box.addEventListener("click", (e) => {
    if (e.target.closest("[data-lightbox-close]")) close();
  });

  // Anterior / siguiente
  box.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(index - 1));
  box.querySelector(".lightbox__nav--next").addEventListener("click", () => show(index + 1));

  // Teclado: Escape cierra, flechas navegan
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  });

  // Swipe táctil: izquierda = siguiente, derecha = anterior
  let touchX = null;
  box.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 40) return; // umbral mínimo
    show(dx < 0 ? index + 1 : index - 1);
  }, { passive: true });
})();
