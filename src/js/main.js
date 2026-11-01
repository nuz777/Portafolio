const html = document.documentElement;
const themeBtn = document.getElementById("themeToggle");
const saved = localStorage.getItem("theme") || "light";
html.setAttribute("data-theme", saved);

themeBtn.addEventListener("click", () => {
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

const fsBtns = document.querySelectorAll("[data-fs-toggle]");

function syncFs() {
  const active = !!document.fullscreenElement;
  fsBtns.forEach((b) => {
    b.classList.toggle("is-fullscreen", active);
    if (window.I18N) {
      b.setAttribute("aria-label", I18N.t(active ? "ui.fsExit" : "ui.fsEnter"));
    }
  });
}

function fsPop(btn) {
  btn.classList.remove("fs-pop");
  void btn.offsetWidth;
  btn.classList.add("fs-pop");
}

fsBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    fsPop(btn);
  }),
);

document.addEventListener("fullscreenchange", syncFs);
document.addEventListener("i18nchange", syncFs);
syncFs();

const btn = document.getElementById("hamburger");
const menu = document.getElementById("mobileMenu");

const nav = document.getElementById("mainNav");
const hero = document.getElementById("inicio");
let lastY = window.scrollY;
let heroBottom = 0;

function updateHeroBottom() {
  heroBottom = hero.getBoundingClientRect().bottom;
}
updateHeroBottom();
window.addEventListener("resize", updateHeroBottom);

window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    const pastHero = y > heroBottom - 8;
    if (pastHero && y > lastY && !nav.classList.contains("nav-hidden") && !menu.classList.contains("open")) {
      nav.classList.add("nav-hidden");
      nav.classList.remove("nav-visible");
    } else if ((!pastHero || y < lastY) && nav.classList.contains("nav-hidden")) {
      nav.classList.remove("nav-hidden");
      nav.classList.add("nav-visible");
    }
    lastY = y;
  },
  { passive: true },
);
nav.classList.add("nav-visible");

btn.addEventListener("click", () => {
  const open = btn.classList.toggle("open");
  menu.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
});

function closeMenu() {
  btn.classList.remove("open");
  menu.classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  if (!btn.contains(e.target) && !menu.contains(e.target)) closeMenu();
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".fade-in, .actual-hero").forEach((el) => observer.observe(el));

const sectionIds = ["inicio", "sobre-mi", "proyectos", "servicios", "contacto"];
const navLinks = document.querySelectorAll(".nav-links a");

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id),
        );
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px" },
);

document.querySelectorAll("section[id], .hero").forEach((s) => spy.observe(s));

const stackObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("entered");
        stackObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll(".stack-items").forEach((el) => stackObserver.observe(el));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      counterObserver.unobserve(e.target);
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      const dur = 1400;
      const t0 = performance.now();
      const fmt = (v) => Math.round(v) + (el.dataset.suffix || "");
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  },
  { threshold: 0.6 },
);

document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

(() => {
  const icons = document.querySelectorAll(".stack-icon[data-info]");
  if (!icons.length) return;

  const tip = document.createElement("div");
  tip.className = "tech-tip";
  document.body.appendChild(tip);

  let activeImg = null;

  function position() {
    if (!activeImg) return;
    const r = activeImg.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    let x = r.left + r.width / 2 - tw / 2;
    x = Math.max(8, Math.min(x, innerWidth - tw - 8));
    let y = r.top - th - 12;
    if (y < 76) y = r.bottom + 12;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }

  function show(img) {
    activeImg = img;
    tip.innerHTML = "<strong></strong><span></span>";
    tip.querySelector("strong").textContent = img.dataset.name || img.alt;
    const tipKey = img.dataset.tk;
    const info =
      window.I18N && tipKey ? I18N.t("tip." + tipKey) : img.dataset.info;
    tip.querySelector("span").textContent = info;
    position();
    tip.classList.add("show");
  }

  function hide() {
    activeImg = null;
    tip.classList.remove("show");
  }

  icons.forEach((img) => {
    img.addEventListener("mouseenter", () => show(img));
    img.addEventListener("mouseleave", hide);
  });

  addEventListener("scroll", () => requestAnimationFrame(position), { passive: true });
  addEventListener("resize", hide);
})();

// ── CURSOR AZUL CON EFECTOS EN ZONA DE TRABAJO RECIENTE (#proyectos) ──
(() => {
  const isFinePointer = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    window.innerWidth > 860;

  if (!isFinePointer()) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const section = document.getElementById("proyectos");
  if (!dot || !ring || !section) return;

  let mouseX = -100;
  let mouseY = -100;
  let dotX = -100;
  let dotY = -100;
  let ringX = -100;
  let ringY = -100;
  let inZone = false;

  function showCursor() {
    if (!isFinePointer() || inZone) return;
    inZone = true;
    document.body.classList.add("in-projects-zone");
    dot.style.opacity = "1";
    dot.style.visibility = "visible";
    ring.style.opacity = "1";
    ring.style.visibility = "visible";
  }

  function hideCursor() {
    if (!inZone) return;
    inZone = false;
    document.body.classList.remove("in-projects-zone");
    dot.style.opacity = "0";
    dot.style.visibility = "hidden";
    ring.style.opacity = "0";
    ring.style.visibility = "hidden";
    ring.classList.remove("is-hover", "is-down", "is-link-hover");
    dot.classList.remove("is-link-hover");
  }

  function checkZone(target) {
    if (!target) return false;
    return section === target || section.contains(target);
  }

  function onMouseMove(e) {
    const modalEl = document.getElementById("imageLightbox");
    if (modalEl && modalEl.classList.contains("is-open")) {
      if (inZone) hideCursor();
      return;
    }

    if (!isFinePointer()) {
      if (inZone) hideCursor();
      return;
    }

    mouseX = e.clientX;
    mouseY = e.clientY;

    const isInside = checkZone(e.target);
    if (isInside) {
      if (!inZone) {
        dotX = ringX = mouseX;
        dotY = ringY = mouseY;
        showCursor();
      }
      const isCardLink = !!(
        e.target &&
        e.target.closest &&
        e.target.closest(".card-link")
      );
      ring.classList.toggle("is-link-hover", isCardLink);
      dot.classList.toggle("is-link-hover", isCardLink);

      const interactive = isCardLink || !!(
        e.target &&
        e.target.closest &&
        e.target.closest("a, button, .project-card, .tech-badge, .tag, input, [role='button']")
      );
      ring.classList.toggle("is-hover", interactive);
    } else if (inZone) {
      hideCursor();
    }
  }

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("mouseleave", hideCursor);
  window.addEventListener("touchstart", hideCursor, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      if (!isFinePointer() && inZone) hideCursor();
    },
    { passive: true },
  );

  window.addEventListener("mousedown", () => {
    if (inZone) ring.classList.add("is-down");
  });

  window.addEventListener("mouseup", () => {
    if (inZone) ring.classList.remove("is-down");
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!isFinePointer()) {
        if (inZone) hideCursor();
        return;
      }
      if (mouseX < 0 || mouseY < 0) return;
      const el = document.elementFromPoint(mouseX, mouseY);
      const isInside = checkZone(el);
      if (isInside && !inZone) {
        dotX = ringX = mouseX;
        dotY = ringY = mouseY;
        showCursor();
      } else if (!isInside && inZone) {
        hideCursor();
      }
    },
    { passive: true },
  );

  (function loop() {
    if (inZone) {
      dotX += (mouseX - dotX) * 0.45;
      dotY += (mouseY - dotY) * 0.45;
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      const qdx = Math.round(dotX * 10) / 10;
      const qdy = Math.round(dotY * 10) / 10;
      const qrx = Math.round(ringX * 10) / 10;
      const qry = Math.round(ringY * 10) / 10;

      dot.style.transform = `translate3d(${qdx}px, ${qdy}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${qrx}px, ${qry}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(loop);
  })();
})();

// ── MODAL VISTA PREVIA INTERACTIVA (LIMPIO) ──
(() => {
  const modal = document.getElementById("imageLightbox");
  const modalImg = document.getElementById("lightboxImg");
  const modalTitle = document.getElementById("lightboxTitle");
  const closeBtn = document.getElementById("lightboxClose");
  const liveView = document.getElementById("liveView");
  const imageView = document.getElementById("imageView");
  const iframe = document.getElementById("browserIframe");
  const loader = document.getElementById("browserLoader");
  const extBtn = document.getElementById("browserExternal");
  const zoomValBtn = document.getElementById("zoomValue");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const modalContent = modal.querySelector(".lightbox-content");

  if (!modal || !modalImg || !iframe) return;

  // Sitios que actualmente tienen cabecera de seguridad X-Frame-Options: DENY o son repositorios
  const blockedFromIframe = [
    "github.com",
    "sau-nuz.vercel.app",
    "nuz-themes.vercel.app",
  ];

  let savedScrollY = 0;

  // Niveles de zoom para que en laptops a escala 100% no se sienta saturado ni gigante
  const zoomLevels = [0.65, 0.75, 0.8, 0.9, 1.0];
  let currentZoomIdx = 2; // Por defecto 80% en escritorios / laptops

  function applyPreviewZoom(idx) {
    currentZoomIdx = Math.max(0, Math.min(zoomLevels.length - 1, idx));
    const val = zoomLevels[currentZoomIdx];
    if (modalContent) {
      modalContent.style.setProperty("--preview-zoom", val);
    }
    if (zoomValBtn) {
      zoomValBtn.textContent = `${Math.round(val * 100)}%`;
    }
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      applyPreviewZoom(currentZoomIdx + 1);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      applyPreviewZoom(currentZoomIdx - 1);
    });
  }

  if (zoomValBtn) {
    zoomValBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Alternar rápidamente entre 80% y 100%
      if (zoomLevels[currentZoomIdx] === 0.8) {
        applyPreviewZoom(zoomLevels.indexOf(1.0));
      } else {
        applyPreviewZoom(zoomLevels.indexOf(0.8));
      }
    });
  }

  // Bloquear scroll de rueda y táctil para que el portafolio no se mueva de fondo
  modal.addEventListener(
    "wheel",
    (e) => {
      if (!e.target.closest(".preview-viewport.is-live")) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  modal.addEventListener(
    "touchmove",
    (e) => {
      if (!e.target.closest(".preview-viewport.is-live")) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  // Asegurar que si el navegador intenta mover el scroll mientras está abierto, se mantenga en savedScrollY
  window.addEventListener(
    "scroll",
    () => {
      if (modal.classList.contains("is-open") && savedScrollY >= 0) {
        if (Math.abs(window.scrollY - savedScrollY) > 2) {
          window.scrollTo(0, savedScrollY);
        }
      }
    },
    { passive: true }
  );

  function openModal(img, titleText, targetUrl) {
    const url = targetUrl || "";
    const title = titleText || img.alt || "Proyecto";

    // Guardar la posición exacta antes de bloquear
    savedScrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    modalImg.src = img.currentSrc || img.src;
    modalImg.alt = title;
    modalTitle.textContent = title;
    if (extBtn) {
      extBtn.href = url || "#";
      extBtn.style.display = url && url !== "#" ? "inline-flex" : "none";
    }

    const isBlocked = !url || url === "#" || blockedFromIframe.some((b) => url.includes(b));
    const zoomCtrl = document.getElementById("previewZoomCtrl");

    if (isBlocked) {
      // Mostrar captura en grande adaptada exactamente a la imagen (sin bordes negros)
      liveView.style.display = "none";
      imageView.style.display = "flex";
      iframe.src = "";
      if (modalContent) modalContent.classList.add("is-image-mode");
      if (zoomCtrl) zoomCtrl.style.display = "none";
    } else {
      // Cargar sitio en vivo interactivo en el iframe
      imageView.style.display = "none";
      liveView.style.display = "block";
      loader.classList.remove("is-hidden");
      iframe.src = url;
      if (modalContent) modalContent.classList.remove("is-image-mode");
      if (zoomCtrl && window.innerWidth > 640) zoomCtrl.style.display = "inline-flex";
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    // Ajustar zoom inicial: 80% en laptop/escritorio, 100% en pantallas móviles
    if (window.innerWidth <= 768) {
      applyPreviewZoom(zoomLevels.indexOf(1.0));
    } else {
      applyPreviewZoom(zoomLevels.indexOf(0.8));
    }
  }

  function closeModal(e) {
    if (e && e.preventDefault) e.preventDefault();

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    if (modalContent) modalContent.classList.remove("is-image-mode");

    // Restaurar inmediatamente la posición exacta del usuario en #proyectos sin animación de scroll al inicio
    if (typeof savedScrollY === "number" && savedScrollY >= 0) {
      const prevBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, savedScrollY);
      document.documentElement.style.scrollBehavior = prevBehavior;
      if (typeof lastY !== "undefined") {
        lastY = savedScrollY;
      }
    }

    setTimeout(() => {
      if (!modal.classList.contains("is-open")) {
        iframe.src = "";
        modalImg.src = "";
        loader.classList.remove("is-hidden");
      }
    }, 300);
  }

  if (extBtn) {
    extBtn.addEventListener("click", (e) => {
      if (!extBtn.href || extBtn.getAttribute("href") === "#") {
        e.preventDefault();
      }
    });
  }

  iframe.addEventListener("load", () => {
    loader.classList.add("is-hidden");
  });

  document.querySelectorAll(".card-thumb").forEach((thumb) => {
    thumb.setAttribute("role", "button");
    thumb.setAttribute("tabindex", "0");
    const img = thumb.querySelector("img");
    if (!img) return;

    const card = thumb.closest(".project-card");
    const titleEl = card ? card.querySelector(".card-title") : null;
    const title = titleEl ? titleEl.textContent.trim() : img.alt;
    const linkEl = card ? card.querySelector(".card-link") : null;
    const url = linkEl ? linkEl.href : "";

    thumb.setAttribute("aria-label", "Abrir vista previa de " + title);

    function trigger(e) {
      e.preventDefault();
      openModal(img, title, url);
    }

    thumb.addEventListener("click", trigger);
    thumb.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        trigger(e);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(e);
    });
  }

  modal.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("lightbox-backdrop") ||
      e.target === modal ||
      e.target === imageView
    ) {
      e.preventDefault();
      closeModal(e);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      e.preventDefault();
      closeModal(e);
    }
  });
})();
