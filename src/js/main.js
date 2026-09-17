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

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

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