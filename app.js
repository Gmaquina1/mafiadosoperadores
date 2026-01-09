(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ===== CONFIG =====
  // Troque pelo número oficial no formato: 55 + DDD + número (sem espaços)
  // Ex.: 5538998465955
  const WHATSAPP_NUMBER = "5538998465955"; // <-- EDITA AQUI

  const makeWaUrl = (text) => {
    const msg = encodeURIComponent(text || "Quero falar com a Mafia dos Operadores.");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle (persist)
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("mdo_theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("mdo_theme", next);
  });

  // Mobile nav toggle
  const navToggle = $("#navToggle");
  const navList = $("#navList");
  navToggle?.addEventListener("click", () => {
    const open = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close nav on link click
  $$(".nav__link").forEach(a => {
    a.addEventListener("click", () => {
      navList?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Close nav if click outside (mobile)
  document.addEventListener("click", (e) => {
    if (!navList || !navToggle) return;
    const isOpen = navList.classList.contains("open");
    if (!isOpen) return;
    const target = e.target;
    const clickedInside = navList.contains(target) || navToggle.contains(target);
    if (!clickedInside) {
      navList.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Scroll progress
  const topProgress = $("#topProgress");
  const onScrollProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const pct = height > 0 ? (scrolled / height) * 100 : 0;
    if (topProgress) topProgress.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", onScrollProgress, { passive:true });
  onScrollProgress();

  // Reveal on scroll
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("show");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.16 });
  revealEls.forEach(el => io.observe(el));

  // Active section highlight
  const links = $$(".nav__link");
  const sections = links
    .map(a => ({ a, id: (a.getAttribute("href") || "").replace("#","") }))
    .filter(x => x.id);

  const secObserver = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (!ent.isIntersecting) return;
      const id = ent.target.id;
      links.forEach(l => l.classList.toggle("active", (l.getAttribute("href") === `#${id}`)));
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0.01 });

  sections.forEach(({id}) => {
    const sec = document.getElementById(id);
    if (sec) secObserver.observe(sec);
  });

  // Counters
  const counters = $$("[data-count]");
  const animateCount = (el) => {
    const target = Number(el.getAttribute("data-count") || "0");
    const duration = 1200;
    const start = performance.now();
    const from = 0;

    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (target - from) * eased);
      el.textContent = val.toLocaleString("pt-BR");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        animateCount(ent.target);
        counterObserver.unobserve(ent.target);
      }
    });
  }, { threshold: 0.35 });

  counters.forEach(c => counterObserver.observe(c));

  // Gallery filters
  const filterBtns = $$(".filter");
  const mediaItems = $$(".media");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const filter = btn.getAttribute("data-filter");
      mediaItems.forEach(item => {
        const cat = item.getAttribute("data-category");
        const show = filter === "all" || filter === cat;
        item.style.display = show ? "" : "none";
      });
    });
  });

  // Modal (image/video) with focus management
  const modal = $("#modal");
  const modalContent = $("#modalContent");
  const modalCaption = $("#modalCaption");
  let lastFocused = null;

  const openModal = ({type, src, caption}) => {
    if (!modal || !modalContent || !src) return;

    lastFocused = document.activeElement;
    modalContent.innerHTML = "";
    modalCaption.textContent = caption || "";

    if (type === "video") {
      const v = document.createElement("video");
      v.controls = true;
      v.playsInline = true;
      v.preload = "metadata";
      v.src = src;
      modalContent.appendChild(v);
      v.play().catch(()=>{});
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = caption || "Imagem";
      img.loading = "eager";
      modalContent.appendChild(img);
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const closeBtn = $(".modal__close", modal);
    closeBtn?.focus();
  };

  const closeModal = () => {
    if (!modal || !modalContent) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    modalContent.innerHTML = "";
    document.body.style.overflow = "";

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    lastFocused = null;
  };

  // Bind modal buttons
  $$("[data-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-modal");
      const src = btn.getAttribute("data-src");
      const caption = btn.getAttribute("data-caption") || "";
      openModal({type, src, caption});
    });
  });

  // Close modal (backdrop / close btn / ESC)
  modal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-close") === "true") closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // WhatsApp buttons
  const waLinks = $$(".js-wa");
  waLinks.forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const txt = a.getAttribute("data-wa-text") || "";
      window.open(makeWaUrl(txt), "_blank", "noopener,noreferrer");
    });
  });

  // Mini form submit -> WhatsApp
  const miniForm = $("#miniForm");
  miniForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(miniForm);
    const name = String(fd.get("name") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const msg =
      `Quero receber novidades da Confraternização da Mafia dos Operadores.\n` +
      (name ? `Nome: ${name}\n` : "") +
      (phone ? `WhatsApp: ${phone}\n` : "");
    window.open(makeWaUrl(msg), "_blank", "noopener,noreferrer");
  });
})();
