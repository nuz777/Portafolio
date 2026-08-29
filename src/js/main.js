 // ── DARK/LIGHT TOGGLE ──
      const html = document.documentElement;
      const themeBtn = document.getElementById("themeToggle");
      const saved = localStorage.getItem("theme") || "light";
      html.setAttribute("data-theme", saved);

      themeBtn.addEventListener("click", () => {
        const current = html.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });

      // ── HAMBURGER ──
      const btn = document.getElementById("hamburger");
      const menu = document.getElementById("mobileMenu");

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

      // ── SCROLL FADE-IN ──
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

      document
        .querySelectorAll(".fade-in")
        .forEach((el) => observer.observe(el));

      // ── HIDE/SHOW NAV ON SCROLL ──
      const nav = document.getElementById("mainNav");
      const heroSection = document.getElementById("inicio");
      let lastScrollY = window.scrollY;
      let heroBottom = 0;

      function updateHeroBottom() {
        const rect = heroSection.getBoundingClientRect();
        heroBottom = rect.bottom + window.scrollY;
      }

      updateHeroBottom();
      window.addEventListener("resize", updateHeroBottom);

      window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        // Solo ocultar si ya pasamos el hero
        if (currentScrollY > heroBottom) {
          if (currentScrollY > lastScrollY) {
            // Scrolling down → hide
            nav.classList.add("nav-hidden");
            nav.classList.remove("nav-visible");
          } else {
            // Scrolling up → show
            nav.classList.remove("nav-hidden");
            nav.classList.add("nav-visible");
          }
        } else {
          // Dentro del hero, siempre visible
          nav.classList.remove("nav-hidden");
          nav.classList.add("nav-visible");
        }

        lastScrollY = currentScrollY;
      });

      // Set initial state
      nav.classList.add("nav-visible");

      // ── ESTADO DEL CURSOR (puntero real + cursor visible, compartido) ──
      const pointerState = {
        x: innerWidth / 2,
        y: innerHeight / 2,
        active: false,
      };
      const cursorLead = {
        x: innerWidth / 2,
        y: innerHeight / 2,
        active: false,
      };

      addEventListener(
        "mousemove",
        (e) => {
          pointerState.x = e.clientX;
          pointerState.y = e.clientY;
          pointerState.active = true;
        },
        { passive: true },
      );
      document.addEventListener("mouseleave", () => {
        pointerState.active = false;
      });

      // ── CONSTELLATION BACKGROUND ──
      (() => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const canvas = document.getElementById("bg-constellation");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        let w = 0,
          h = 0;
        let particles = [];
        let running = true;

        const LINK = 120;
        const LINK2 = LINK * LINK;
        const MOUSE_R = 170;
        const MOUSE_R2 = MOUSE_R * MOUSE_R;
        const CELL = LINK / 2;
        const RANGE = 2;
        const BUCKETS = 6;
        const grid = new Map();
        const lineSegs = Array.from({ length: BUCKETS }, () => []);
        const mouseSegs = Array.from({ length: BUCKETS }, () => []);

        let dotFill = "";
        let lineColors = [];
        let mouseColors = [];

        const isDark = () =>
          document.documentElement.getAttribute("data-theme") === "dark";

        function refreshPalette() {
          const dark = isDark();
          const dotColor = dark ? "96,165,250" : "37,99,235";
          const lineColor = dark ? "59,130,246" : "37,99,235";
          dotFill = "rgba(" + dotColor + "," + (dark ? "0.7" : "0.5") + ")";
          lineColors = [];
          mouseColors = [];
          for (let i = 0; i < BUCKETS; i++) {
            lineColors.push(
              "rgba(" + lineColor + "," + (0.22 * (i / (BUCKETS - 1))).toFixed(2) + ")",
            );
            mouseColors.push(
              "rgba(" + lineColor + "," + (0.35 * (i / (BUCKETS - 1))).toFixed(2) + ")",
            );
          }
        }
        refreshPalette();
        new MutationObserver(refreshPalette).observe(
          document.documentElement,
          { attributes: true, attributeFilter: ["data-theme"] },
        );

        function resize() {
          const dpr = Math.min(devicePixelRatio || 1, 2);
          w = innerWidth;
          h = innerHeight;
          canvas.width = w * dpr;
          canvas.height = h * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          seed();
        }

        function seed() {
          const count = Math.min(90, Math.floor((w * h) / 18000));
          particles = Array.from({ length: count }, (_, i) => ({
            i,
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 1.6 + 0.6,
          }));
        }

        function buildGrid() {
          grid.clear();
          for (const p of particles) {
            const cx = (p.x / CELL) | 0;
            const cy = (p.y / CELL) | 0;
            const key = cx + ":" + cy;
            let cell = grid.get(key);
            if (!cell) {
              cell = [];
              grid.set(key, cell);
            }
            cell.push(p);
          }
        }

        function step() {
          if (!running) return;

          for (const arr of lineSegs) arr.length = 0;
          for (const arr of mouseSegs) arr.length = 0;

          ctx.clearRect(0, 0, w, h);

          for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -10) p.x = w + 10;
            else if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            else if (p.y > h + 10) p.y = -10;
          }

          buildGrid();

          // Punto de anclaje: el cursor VISIBLE (con lerp), no el puntero crudo
          const useLead = pointerState.active && cursorLead.active;
          const ex = pointerState.active
            ? useLead
              ? cursorLead.x
              : pointerState.x
            : -9999;
          const ey = pointerState.active
            ? useLead
              ? cursorLead.y
              : pointerState.y
            : -9999;

          // Recorrer vecinos por grilla (evita el O(n²))
          for (let i = 0; i < particles.length; i++) {
            const a = particles[i];
            const ax = a.x;
            const ay = a.y;
            const acx = (ax / CELL) | 0;
            const acy = (ay / CELL) | 0;

            for (let ox = -RANGE; ox <= RANGE; ox++) {
              for (let oy = -RANGE; oy <= RANGE; oy++) {
                const cell = grid.get(acx + ox + ":" + (acy + oy));
                if (!cell) continue;
                for (let k = 0; k < cell.length; k++) {
                  const b = cell[k];
                  if (b.i <= a.i) continue;
                  const dx = ax - b.x;
                  const dy = ay - b.y;
                  const d2 = dx * dx + dy * dy;
                  if (d2 < LINK2) {
                    const t = 1 - Math.sqrt(d2) / LINK;
                    const idx = ((t * (BUCKETS - 1)) | 0);
                    const arr = lineSegs[idx < BUCKETS ? idx : BUCKETS - 1];
                    arr.push(ax, ay, b.x, b.y);
                  }
                }
              }
            }

            // Conexión con el cursor
            if (pointerState.active) {
              const mdx = ax - ex;
              const mdy = ay - ey;
              const md2 = mdx * mdx + mdy * mdy;
              if (md2 < MOUSE_R2) {
                const t = 1 - Math.sqrt(md2) / MOUSE_R;
                const idx = t * (BUCKETS - 1);
                const arr2 = mouseSegs[idx < BUCKETS ? idx | 0 : BUCKETS - 1];
                arr2.push(ax, ay, ex, ey);
              }
            }
          }

          // Trazar líneas agrupadas por color (una stroke por bucket)
          ctx.lineWidth = 1;
          for (let s = 0; s < BUCKETS; s++) {
            const arrP = lineSegs[s];
            if (arrP.length) {
              ctx.strokeStyle = lineColors[s];
              ctx.beginPath();
              for (let k = 0; k < arrP.length; k += 4) {
                ctx.moveTo(arrP[k], arrP[k + 1]);
                ctx.lineTo(arrP[k + 2], arrP[k + 3]);
              }
              ctx.stroke();
            }
            const arrM = mouseSegs[s];
            if (arrM.length) {
              ctx.strokeStyle = mouseColors[s];
              ctx.beginPath();
              for (let k = 0; k < arrM.length; k += 4) {
                ctx.moveTo(arrM[k], arrM[k + 1]);
                ctx.lineTo(arrM[k + 2], arrM[k + 3]);
              }
              ctx.stroke();
            }
          }

          // Puntos en un solo path
          ctx.fillStyle = dotFill;
          ctx.beginPath();
          for (const p of particles) {
            ctx.moveTo(p.x + p.r, p.y);
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          }
          ctx.fill();

          requestAnimationFrame(step);
        }

        addEventListener("resize", resize);
        document.addEventListener("visibilitychange", () => {
          const wasRunning = running;
          running = !document.hidden;
          if (running && !wasRunning) requestAnimationFrame(step);
        });

        resize();
        requestAnimationFrame(step);
      })();

      // ── TOOLTIP DE TECNOLOGÍAS ──
      (() => {
        const icons = document.querySelectorAll(".stack-icon[data-info]");
        if (!icons.length) return;

        const tip = document.createElement("div");
        tip.className = "tech-tip";
        document.body.appendChild(tip);

        const cursorDot = document.querySelector(".cursor-dot");
        const cursorRing = document.querySelector(".cursor-ring");

        let activeImg = null;

        function blurCursor() {
          if (cursorDot) cursorDot.style.filter = "blur(8px)";
          if (cursorRing) cursorRing.style.filter = "blur(10px)";
        }
        function unblurCursor() {
          if (cursorDot) cursorDot.style.filter = "";
          if (cursorRing) cursorRing.style.filter = "";
        }

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
          tip.innerHTML =
            "<strong></strong><span></span>";
          tip.querySelector("strong").textContent =
            img.dataset.name || img.alt;
          tip.querySelector("span").textContent = img.dataset.info;
          position();
          tip.classList.add("show");
          blurCursor();
        }

        function hide() {
          activeImg = null;
          tip.classList.remove("show");
          unblurCursor();
        }

        icons.forEach((img) => {
          img.addEventListener("mouseenter", () => show(img));
          img.addEventListener("mouseleave", hide);
        });

        addEventListener("scroll", () => requestAnimationFrame(position), {
          passive: true,
        });
        addEventListener("resize", hide);
      })();

      // ── CUSTOM CURSOR (bolita azul que persigue el mouse) ──
      (() => {
        if (!matchMedia("(pointer: fine)").matches) return;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const dot = document.querySelector(".cursor-dot");
        const ring = document.querySelector(".cursor-ring");
        if (!dot || !ring) return;

        document.body.classList.add("has-custom-cursor");

        let dx = pointerState.x,
          dy = pointerState.y,
          rx = pointerState.x,
          ry = pointerState.y;
        let seen = false;

        addEventListener("mousemove", (e) => {
          if (!seen) {
            seen = true;
            dx = rx = e.clientX;
            dy = ry = e.clientY;
            cursorLead.x = dx;
            cursorLead.y = dy;
            cursorLead.active = true;
            dot.style.opacity = "1";
            ring.style.opacity = "1";
          }
        });

        document.addEventListener("mouseleave", () => {
          cursorLead.active = false;
          dot.style.opacity = "0";
          ring.style.opacity = "0";
          seen = false;
        });

        const hoverSel =
          'a, button, [role="button"], input, textarea, select, label';
        document.addEventListener("mouseover", (e) => {
          ring.classList.toggle(
            "is-hover",
            !!e.target.closest && e.target.closest(hoverSel),
          );
        });
        addEventListener("mousedown", () => ring.classList.add("is-down"));
        addEventListener("mouseup", () => ring.classList.remove("is-down"));

        // Actualizar la posición visible que sigue la constelación y el DOM
        (function loop() {
          dx += (pointerState.x - dx) * 0.4;
          dy += (pointerState.y - dy) * 0.4;
          rx += (pointerState.x - rx) * 0.16;
          ry += (pointerState.y - ry) * 0.16;

          cursorLead.x = dx;
          cursorLead.y = dy;

          const qdx = Math.round(dx * 10) / 10;
          const qdy = Math.round(dy * 10) / 10;
          const qrx = Math.round(rx * 10) / 10;
          const qry = Math.round(ry * 10) / 10;

          const dt = "translate(" + qdx + "px," + qdy + "px) translate(-50%,-50%)";
          const rt = "translate(" + qrx + "px," + qry + "px) translate(-50%,-50%)";
          if (dot._t !== dt) {
            dot.style.transform = dt;
            dot._t = dt;
          }
          if (ring._t !== rt) {
            ring.style.transform = rt;
            ring._t = rt;
          }

          requestAnimationFrame(loop);
        })();
      })();

      // ── PROYECTO ACTUAL: PESTAÑAS ──
      (() => {
        const btns = document.querySelectorAll(".current-tabs .tab-btn");
        const panels = document.querySelectorAll(".tab-panel");
        if (!btns.length || !panels.length) return;

        function activate(tabId) {
          btns.forEach((b) => {
            const on = b.dataset.tab === tabId;
            b.classList.toggle("active", on);
            b.setAttribute("aria-selected", on);
          });
          panels.forEach((p) =>
            p.classList.toggle("active", p.id === "tab-" + tabId),
          );
        }

        btns.forEach((b) =>
          b.addEventListener("click", () => activate(b.dataset.tab)),
        );
      })();

      // ── SMOOTH SCROLL (lerp suave tipo Lenis, solo desktop) ──
      (() => {
        if (!matchMedia("(pointer: fine)").matches) return;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const doc = document.documentElement;
        doc.style.scrollBehavior = "auto";

        let target = window.scrollY;
        let current = target;
        let lastWritten = target;
        const EASE = 0.09;

        const maxScroll = () =>
          Math.max(0, doc.scrollHeight - innerHeight);
        const clamp = (v) => Math.max(0, Math.min(v, maxScroll()));

        addEventListener(
          "wheel",
          (e) => {
            if (e.ctrlKey) return;
            e.preventDefault();
            const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
            target = clamp(target + dy);
          },
          { passive: false },
        );

        const keySteps = {
          ArrowDown: 80,
          ArrowUp: -80,
          PageDown: () => innerHeight * 0.85,
          PageUp: () => -innerHeight * 0.85,
          " ": () => innerHeight * 0.85,
        };
        addEventListener("keydown", (e) => {
          if (/input|textarea|select/i.test(e.target.tagName)) return;
          if (e.key === "Home") {
            e.preventDefault();
            target = 0;
            return;
          }
          if (e.key === "End") {
            e.preventDefault();
            target = maxScroll();
            return;
          }
          const stepFn = keySteps[e.key];
          if (!stepFn) return;
          e.preventDefault();
          target = clamp(target + stepFn());
        });

        // Anclas internas con offset del nav
        document.addEventListener("click", (e) => {
          const a = e.target.closest('a[href^="#"]');
          if (!a) return;
          const id = a.getAttribute("href").slice(1);
          if (!id) {
            e.preventDefault();
            target = 0;
            return;
          }
          const el = document.getElementById(id);
          if (!el) return;
          e.preventDefault();
          if (typeof closeMenu === "function") closeMenu();
          target = clamp(
            el.getBoundingClientRect().top +
              window.scrollY -
              70,
          );
        });

        // Resincronizar si el usuario scrollea por fuera (barra espaciadora de scroll, etc.)
        addEventListener("scroll", () => {
          if (Math.abs(window.scrollY - lastWritten) > 1.5) {
            current = target = window.scrollY;
            lastWritten = window.scrollY;
          }
        });

        (function loop() {
          const next = current + (target - current) * EASE;
          current = Math.abs(target - next) < 0.3 ? target : next;
          window.scrollTo(0, current);
          lastWritten = current;
          requestAnimationFrame(loop);
        })();
      })();