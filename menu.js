/* Frost&Swirl — Home 1 Classic */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const themeButton = $("theme-toggle");
  const directionButton = $("direction-toggle");
  const menuButton = $("mobile-toggle");
  const nav = $("navigation");
  const homeButton = $("home-toggle");
  const homeOptions = $("home-options");
  const desktopMedia = window.matchMedia("(min-width: 1051px)");
  /* STORAGE */
  function readPreference(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }
  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Controls still work when browser storage is unavailable.
    }
  }
  /* ICONS */
  const iconPaths = {
    moon:
      '<path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z"/>',
    sun:
      '<circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    menu:
      '<path d="M4 6h16M4 12h16M4 18h16"/>',
    "chevron-down":
      '<path d="m6 9 6 6 6-6"/>',
    "arrow-right":
      '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    "map-pin":
      '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>' +
      '<circle cx="12" cy="10" r="2"/>',
    phone:
      '<path d="m5 3 4 1 1 5-3 2c2 3 3 4 6 6l2-3 5 1 1 4c-2 5-10 1-14-3S0 5 5 3Z"/>',
    mail:
      '<rect x="3" y="5" width="18" height="14" rx="2"/>' +
      '<path d="m3 6 9 7 9-7"/>'
  };
  function refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
      document.querySelectorAll("svg.lucide").forEach((svg) => {
        svg.setAttribute("aria-hidden", "true");
      });
      return;
    }
    document.querySelectorAll("i[data-lucide]").forEach((node) => {
      const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.8");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("aria-hidden", "true");
      svg.innerHTML =
        iconPaths[node.dataset.lucide] || iconPaths["arrow-right"];
      node.replaceWith(svg);
    });
  }
  /* LIGHT / DARK MODE */
  function setTheme(value) {
    const dark = value === "dark";
    root.dataset.theme = dark ? "dark" : "light";
    themeButton.setAttribute(
      "aria-label",
      `Switch to ${dark ? "light" : "dark"} mode`
    );
    themeButton.innerHTML =
      `<i data-lucide="${dark ? "sun" : "moon"}" aria-hidden="true"></i>`;
    savePreference("frost-swirl-theme", root.dataset.theme);
    refreshIcons();
  }
  const defaultTheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
  setTheme(readPreference("frost-swirl-theme", defaultTheme));
  themeButton.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
  /* RTL / LTR */
  function setDirection(value) {
    root.dir = value === "rtl" ? "rtl" : "ltr";
    const nextDirection = root.dir === "rtl" ? "LTR" : "RTL";
    directionButton.setAttribute(
      "aria-label",
      `Switch to ${
        nextDirection === "RTL" ? "right-to-left" : "left-to-right"
      } layout`
    );
    savePreference("frost-swirl-direction", root.dir);
  }
  setDirection(readPreference("frost-swirl-direction", "ltr"));
  directionButton.addEventListener("click", () => {
    setDirection(root.dir === "rtl" ? "ltr" : "rtl");
  });
  /* MOBILE MENU */
  function closeHomeDropdown() {
    homeOptions.hidden = true;
    homeButton.setAttribute("aria-expanded", "false");
  }
  function closeMobileMenu() {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    closeHomeDropdown();
  }
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );
    if (!open) {
      closeHomeDropdown();
    }
  });
  /* HOME DROPDOWN */
  homeButton.addEventListener("click", () => {
    homeOptions.hidden = !homeOptions.hidden;
    homeButton.setAttribute(
      "aria-expanded",
      String(!homeOptions.hidden)
    );
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".home-dropdown")) {
      closeHomeDropdown();
    }
    if (!event.target.closest(".header")) {
      closeMobileMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!homeOptions.hidden) {
      closeHomeDropdown();
      homeButton.focus();
    } else if (nav.classList.contains("open")) {
      closeMobileMenu();
      menuButton.focus();
    }
  });
  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".home-dropdown")) {
      closeHomeDropdown();
    }
    if (!event.target.closest(".header")) {
      closeMobileMenu();
    }
  });
  desktopMedia.addEventListener("change", closeMobileMenu);
  /* FULL-VIEWPORT HERO HEADER MEASUREMENT */
  const header = document.querySelector(".header");
  function measureHeader() {
    root.style.setProperty(
      "--header-height",
      `${header.getBoundingClientRect().height}px`
    );
  }
  if ("ResizeObserver" in window) {
    new ResizeObserver(measureHeader).observe(header);
  } else {
    window.addEventListener("resize", measureHeader);
  }
  measureHeader();
  /* SECTION LINKS AND DETAILS */
  function revealTarget(target) {
    if (target?.tagName === "DETAILS") {
      target.open = true;
    }
    if (target?.tagName === "DIALOG") {
      if (!target.open) {
        target.showModal();
      }
      return true;
    }
    return false;
  }
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (revealTarget(target)) {
        event.preventDefault();
      }
      if (link.closest("nav")) {
        closeMobileMenu();
      }
    });
  });
  function openHashTarget() {
    const target = document.getElementById(
      location.hash.slice(1)
    );
    if (target) {
      revealTarget(target);
    }
  }
  window.addEventListener("hashchange", openHashTarget);
  openHashTarget();
  /* POLICY DIALOGS */
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest("dialog").close();
    });
  });
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      const outside =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;
      if (outside) {
        dialog.close();
      }
    });
  });
  /* FOOTER YEAR */
  $("year").textContent = new Date().getFullYear();
  /* IMAGE FALLBACK */
  const fallbackSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450">
      <rect width="600" height="450" fill="#f6f5f3"/>
      <g fill="none" stroke="#D93675" stroke-width="8">
        <path d="M210 210h180l-30 160H240Z"/>
        <path d="M215 205c-40-55 30-75 75-85-20-25 0-45 35-65-8 45 70 50 35 100 50 5 60 45 25 55"/>
      </g>
      <text
        x="300"
        y="410"
        text-anchor="middle"
        fill="#262326"
        font-family="sans-serif"
        font-size="20"
      >
        Frost&amp;Swirl • Dessert image unavailable
      </text>
    </svg>
  `;
  const fallbackImage =
    "data:image/svg+xml," + encodeURIComponent(fallbackSvg);
  document.querySelectorAll("img").forEach((image) => {
    function replaceImage() {
      image.classList.add("image-fallback");
      image.src = fallbackImage;
      image.alt =
        "Dessert illustration. Original photograph unavailable.";
    }
    image.addEventListener("error", replaceImage, { once: true });
    if (image.complete && image.naturalWidth === 0) {
      replaceImage();
    }
  });
  refreshIcons();
  window.addEventListener("load", refreshIcons, { once: true });
});
document.addEventListener('DOMContentLoaded',()=>{
 const search=document.getElementById('menu-search');let category='all';
 function filter(){const q=(search?.value||'').trim().toLowerCase();let count=0;document.querySelectorAll('.product').forEach(card=>{card.hidden=!((category==='all'||card.dataset.category===category)&&card.dataset.name.includes(q));if(!card.hidden)count++});const empty=document.getElementById('menu-empty');if(empty)empty.hidden=count>0;const status=document.getElementById('menu-count');if(status)status.textContent=count+' treats found.'}
 search?.addEventListener('input',filter);document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter()}));if(search)filter();
 const form=document.getElementById('enquiry-form');const date=document.getElementById('date');function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};if(date)date.min=today();
 form?.addEventListener('submit',event=>{event.preventDefault();if(date)date.min=today();const phone=document.getElementById('phone');const digits=phone.value.replace(/\D/g,'');phone.setCustomValidity(/^[+\d\s().-]+$/.test(phone.value)&&digits.length>=7&&digits.length<=15?'':'Enter a valid phone number with 7–15 digits.');if(!form.reportValidity())return;document.getElementById('enquiry-status').textContent='Your details are valid. Demo only: no enquiry was sent, no booking was made, and no payment was taken.'});document.getElementById('phone')?.addEventListener('input',event=>event.target.setCustomValidity(''));
 document.querySelectorAll('[data-package]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('topic').value=button.dataset.package;document.getElementById('enquiry').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.getElementById('topic').focus({preventScroll:true})}));const topic=new URLSearchParams(location.search).get('topic');if(topic&&form)document.getElementById('message').value='I would like to enquire about '+topic+'.';
});
