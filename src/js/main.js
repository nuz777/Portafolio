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

      // ── CONSTELLATION BACKGROUND ──
      (() => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const canvas = document.getElementById("bg-constellation");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        let w = 0,
          h = 0;
        let particles = [];
        const mouse = { x: -9999, y: -9999 };
        let running = true;

        const isDark = () =>
          document.documentElement.getAttribute("data-theme") === "dark";

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
          const count = Math.min(110, Math.floor((w * h) / 16000));
          particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 1.6 + 0.6,
          }));
        }

        function step() {
          if (!running) return;
          ctx.clearRect(0, 0, w, h);

          const dark = isDark();
          const dotColor = dark ? "96,165,250" : "37,99,235";
          const lineColor = dark ? "59,130,246" : "37,99,235";
          const LINK = 120;

          for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -10) p.x = w + 10;
            else if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            else if (p.y > h + 10) p.y = -10;
          }

          for (let i = 0; i < particles.length; i++) {
            const a = particles[i];

            for (let j = i + 1; j < particles.length; j++) {
              const b = particles[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < LINK * LINK) {
                const t = 1 - Math.sqrt(d2) / LINK;
                ctx.strokeStyle =
                  "rgba(" + lineColor + "," + (t * 0.22).toFixed(3) + ")";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }

            const mdx = a.x - mouse.x;
            const mdy = a.y - mouse.y;
            const md2 = mdx * mdx + mdy * mdy;
            const M = 170;
            if (md2 < M * M) {
              const t = 1 - Math.sqrt(md2) / M;
              ctx.strokeStyle =
                "rgba(" + lineColor + "," + (t * 0.35).toFixed(3) + ")";
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
            }

            ctx.fillStyle =
              "rgba(" + dotColor + "," + (dark ? "0.7" : "0.5") + ")";
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fill();
          }

          requestAnimationFrame(step);
        }

        addEventListener("mousemove", (e) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        });
        document.addEventListener("mouseleave", () => {
          mouse.x = -9999;
          mouse.y = -9999;
        });
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
          tip.innerHTML =
            "<strong></strong><span></span>";
          tip.querySelector("strong").textContent =
            img.dataset.name || img.alt;
          tip.querySelector("span").textContent = img.dataset.info;
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

        let mx = innerWidth / 2,
          my = innerHeight / 2;
        let dx = mx,
          dy = my,
          rx = mx,
          ry = my;
        let seen = false;

        addEventListener("mousemove", (e) => {
          mx = e.clientX;
          my = e.clientY;
          if (!seen) {
            seen = true;
            dx = rx = mx;
            dy = ry = my;
            dot.style.opacity = "1";
            ring.style.opacity = "1";
          }
        });

        document.addEventListener("mouseleave", () => {
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

        (function loop() {
          dx += (mx - dx) * 0.4;
          dy += (my - dy) * 0.4;
          rx += (mx - rx) * 0.16;
          ry += (my - ry) * 0.16;
          dot.style.transform =
            "translate(" + dx + "px," + dy + "px) translate(-50%,-50%)";
          ring.style.transform =
            "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
          requestAnimationFrame(loop);
        })();
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