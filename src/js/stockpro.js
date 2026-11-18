// ── STOCKPRO: VITRINA CON DEMOS ANIMADAS ──
// Las demos (SVG + SMIL) se cargan solo cuando la sección se acerca a la pantalla.
// Avanzan solas de una pestaña a la siguiente, se pausan al pasar el cursor
// y cuando no están visibles, y respetan "reducir movimiento".
(() => {
  const section = document.getElementById("stockpro");
  if (!section) return;

  const stage = document.getElementById("spDemo");
  const tabs = Array.from(section.querySelectorAll(".sp-tab"));
  const playBtn = document.getElementById("spPlay");
  const DUR = { panel: 10, crear: 12, masivo: 12, importar: 13, buscar: 13, perfil: 11, tema: 9 };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let idx = 0;
  let svg = null;
  let visible = false;
  let hovering = false;
  let paused = reduced;
  let started = false;

  const loadDemos = () =>
    new Promise((resolve, reject) => {
      if (window.STOCKPRO_DEMOS) return resolve();
      const s = document.createElement("script");
      s.src = "./src/js/stockpro-demos.js?v=1";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

  const label = (key) => (window.I18N ? I18N.t(key) : key);

  function syncPlayButton() {
    if (!playBtn) return;
    playBtn.classList.toggle("is-paused", paused);
    playBtn.querySelector("[data-label]").textContent = label(paused ? "sp.play" : "sp.pause");
  }

  function sync() {
    if (!svg || !svg.pauseAnimations) return;
    if (visible && !hovering && !paused) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }

  function show(i, fromUser = false) {
    if (!window.STOCKPRO_DEMOS) return;
    idx = (i + tabs.length) % tabs.length;
    const key = tabs[idx].dataset.demo;
    tabs.forEach((t, k) => {
      const on = k === idx;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      t.style.setProperty("--p", 0);
    });
    stage.innerHTML = window.STOCKPRO_DEMOS[key];
    svg = stage.querySelector("svg");
    if (svg && svg.setCurrentTime) {
      svg.setCurrentTime(0);
      if (reduced) {
        svg.pauseAnimations();
        svg.setCurrentTime(DUR[key] * 0.6);
      }
    }
    sync();
    if (fromUser && window.innerWidth < 960) {
      tabs[idx].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }

  // La barra de progreso de la pestaña activa sigue el reloj del SVG
  (function tick() {
    if (svg && svg.getCurrentTime && !reduced) {
      const key = tabs[idx].dataset.demo;
      const p = Math.min(1, svg.getCurrentTime() / DUR[key]);
      tabs[idx].style.setProperty("--p", p.toFixed(4));
      if (p >= 1) show(idx + 1);
    }
    requestAnimationFrame(tick);
  })();

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(i, true));
    t.addEventListener("keydown", (e) => {
      const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!next) return;
      e.preventDefault();
      show(idx + next, true);
      tabs[idx].focus();
    });
  });

  stage.addEventListener("mouseenter", () => { hovering = true; sync(); });
  stage.addEventListener("mouseleave", () => { hovering = false; sync(); });

  if (playBtn) {
    if (reduced) playBtn.hidden = true;
    playBtn.addEventListener("click", () => {
      paused = !paused;
      syncPlayButton();
      sync();
    });
    document.addEventListener("i18nchange", syncPlayButton);
    syncPlayButton();
  }

  // Precarga cuando la sección está cerca; reproduce solo si está en pantalla
  new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting) || started) return;
      started = true;
      loadDemos()
        .then(() => show(0))
        .catch(() => {
          stage.innerHTML = `<div class="sp-placeholder">${label("sp.error")}</div>`;
        });
    },
    { rootMargin: "400px 0px" },
  ).observe(section);

  new IntersectionObserver(
    (entries) => entries.forEach((e) => { visible = e.isIntersecting; sync(); }),
    { threshold: 0.3 },
  ).observe(stage);
})();

// ── FILTROS DE PROYECTOS ──
(() => {
  const bar = document.querySelector(".project-filters");
  if (!bar) return;
  const cards = Array.from(document.querySelectorAll(".projects-grid .project-card"));
  const buttons = Array.from(bar.querySelectorAll(".pf-btn"));

  const matches = (card, f) => f === "all" || (card.dataset.cats || "").split(" ").includes(f);

  buttons.forEach((b) => {
    const n = cards.filter((c) => matches(c, b.dataset.filter)).length;
    const em = b.querySelector("em");
    if (em) em.textContent = n;
  });

  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      const f = b.dataset.filter;
      buttons.forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      cards.forEach((c) => {
        const show = matches(c, f);
        c.classList.toggle("is-filtered", !show);
        c.classList.remove("pf-enter");
        if (show) {
          c.classList.add("visible");
          void c.offsetWidth;
          c.classList.add("pf-enter");
        }
      });
    }),
  );
})();
