(function () {
  var API = window.CONFIG.API;

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }
  function $(sel) {
    return document.querySelector(sel);
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function faNum(n) {
    var s = String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return s.replace(/[0-9]/g, function (d) {
      return "۰۱۲۳۴۵۶۷۸۹"[+d];
    });
  }
  function isExternal(href) {
    return /^(https?:)?\/\//.test(href || "");
  }
  function escHref(h) {
    try {
      if (typeof resolveHref === "function") h = resolveHref(h);
    } catch (e) {}
    return esc(h);
  }

  /* header blur overlay (mega / dropdown) */
  var headerBlur = { mega: false, drop: false };
  function syncHeaderBlur() {
    var el = $("#header-blur");
    if (el) el.classList.toggle("on", headerBlur.mega || headerBlur.drop);
  }

  /* header shrink on scroll (hysteresis like the original: >224 shrinks, <196 restores) */
  function initHeaderScroll() {
    var hdr = $(".bigheader");
    if (!hdr) return;
    var shrunk = false;
    function check() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (!shrunk && y > 224) {
        shrunk = true;
        hdr.classList.add("shrunk");
      } else if (shrunk && y < 196) {
        shrunk = false;
        hdr.classList.remove("shrunk");
      }
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
  }

  var STATIC = window.CONFIG.STATIC;
  var STATIC_DB = window.CONFIG.STATIC_DB || "db.json";
  var SITE = window.CONFIG.SITE || "https://kheilisabz.com";

  /* On GitHub Pages /books/... has no local file -> send to real site,
     like server.js does locally (302 to kheilisabz.com). */
  function resolveHref(href) {
    if (!href) return href;
    if (!STATIC) return href;
    if (/^(https?:)?\/\//.test(href) || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return href;
    if (href.charAt(0) === "/" && href !== "/" && href !== "/cart" && href !== "/login") {
      return SITE + href;
    }
    return href;
  }

  var paths = ["settings", "nav", "menu", "sliders", "sections", "seriesChips", "gradeChips", "banners", "footer", "users"];
  /* fetch with retry: API (json-server) starts slower than web server,
     so first page open used to fail and leave a blank page until manual refresh */
  function fetchJson(url, maxTries, delayMs) {
    maxTries = maxTries || 30;
    delayMs = delayMs || 500;
    function attempt(n) {
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
        return r.json();
      }).catch(function (err) {
        if (n >= maxTries) throw err;
        return new Promise(function (res) {
          setTimeout(res, delayMs);
        }).then(function () {
          return attempt(n + 1);
        });
      });
    }
    return attempt(1);
  }
  function loadDbFromApi() {
    return Promise.all(
      paths.map(function (p) {
        return fetchJson(API + "/" + p);
      })
    ).then(function (res) {
      var db = {};
      paths.forEach(function (p, i) {
        db[p] = res[i];
      });
      return db;
    });
  }
  /* Static mode (GitHub Pages): single db.json, no json-server */
  function loadDbStatic() {
    return fetch(STATIC_DB).then(function (r) {
      if (!r.ok) throw new Error("db.json HTTP " + r.status);
      return r.json();
    });
  }
  function loadDb() {
    if (STATIC) return loadDbStatic();
    /* locally: try API a few times, then fallback to db.json so file:// preview also works */
    return loadDbFromApi().catch(function () {
      return loadDbStatic();
    });
  }

  /* ---------------- nav ---------------- */
  function renderNav(db) {
    var ul = $("#nav-ul");
    if (!ul) return;
    var html = "";
    db.nav.forEach(function (item) {
      if (item.type === "mega") {
        html += '<li data-mega><span class="nav-label" id="mega-trigger">' + esc(item.label) + "</span></li>";
      } else if (item.type === "dropdown") {
        html +=
          '<li><div class="nav-dropdown"><span class="nav-label">' +
          esc(item.label) +
          '</span><div class="nav-dropdown-menu">' +
          item.items
            .map(function (i) {
              return (
                '<a href="' +
                esc(i.href) +
                '"' +
                (i.external ? ' target="_blank" rel="noopener"' : "") +
                ">" +
                esc(i.label) +
                "</a>"
              );
            })
            .join("") +
          "</div></div></li>";
      } else {
        html +=
          '<li><a href="' +
          esc(item.href) +
          '"' +
          (item.external ? ' target="_blank" rel="noopener"' : "") +
          ">" +
          esc(item.label) +
          "</a></li>";
      }
    });
    html += '<div class="start-home" id="start-home"></div>';
    ul.innerHTML = html;

    Array.prototype.forEach.call(ul.querySelectorAll(".nav-dropdown"), function (dd) {
      dd.addEventListener("mouseenter", function () {
        headerBlur.drop = true;
        syncHeaderBlur();
      });
      dd.addEventListener("mouseleave", function () {
        headerBlur.drop = false;
        syncHeaderBlur();
      });
    });

    var bar = $("#start-home");
    var items = Array.prototype.slice.call(ul.querySelectorAll("li"));
    function moveTo(li) {
      if (!bar || !li) return;
      var r = li.getBoundingClientRect();
      var ur = ul.getBoundingClientRect();
      bar.style.right = ur.right - r.right + "px";
      bar.style.width = r.width + "px";
    }
    if (items.length) {
      moveTo(items[0]);
      items.forEach(function (li) {
        li.addEventListener("mouseenter", function () {
          moveTo(li);
        });
      });
      ul.addEventListener("mouseleave", function () {
        moveTo(items[0]);
      });
    }
  }

  /* ---------------- megamenu ---------------- */
  function renderMega(db) {
    var trigger = $("#mega-trigger");
    var mega = $("#megainner");
    var menubar = $("#menubar");
    var scroll = $("#menuscroll");
    if (!trigger || !mega) return;
    var subs = (db.menu[0] && db.menu[0].SubCategories) || [];

    var html = "";
    subs.forEach(function (sc, i) {
      html +=
        '<li class="' +
        (i === 0 ? "selected-menu" : "") +
        '" data-i="' +
        i +
        '">' +
        (sc.Filter
          ? '<a href="/books?' + esc(sc.Filter) + '">' + esc(sc.Title) + "</a>"
          : "<span>" + esc(sc.Title) + "</span>") +
        "</li>";
    });
    menubar.innerHTML = html;

    function rowsFor(sc) {
      var rows = [];
      (sc.MenuHeaders || []).forEach(function (mh) {
        rows.push({ t: mh.Title, href: mh.Filter ? "/books?" + mh.Filter : "", grade: true });
        (mh.Items || []).forEach(function (it) {
          rows.push({ t: it.Title, href: it.Filter ? "/books?" + it.Filter : "", grade: false });
        });
      });
      return rows;
    }
    function renderSub(i) {
      var rows = rowsFor(subs[i] || {});
      var perCol = 10;
      var out = "";
      for (var k = 0; k < rows.length; k += perCol) {
        var col = rows.slice(k, k + perCol);
        out += '<div class="submenubar">' +
          col
            .map(function (r) {
              return (
                '<a class="' +
                (r.grade ? "grade-menu" : "") +
                '" href="' +
                (r.href ? esc(r.href) : "javascript:void(0)") +
                '">' +
                esc(r.t) +
                "</a>"
              );
            })
            .join("") +
          "</div>";
      }
      scroll.innerHTML = out;
    }
    renderSub(0);

    Array.prototype.forEach.call(menubar.querySelectorAll("li"), function (li) {
      function act() {
        Array.prototype.forEach.call(menubar.querySelectorAll("li"), function (x) {
          x.classList.remove("selected-menu");
        });
        li.classList.add("selected-menu");
        renderSub(+li.getAttribute("data-i"));
      }
      li.addEventListener("mouseenter", act);
      li.addEventListener("click", act);
    });

    var open = false;
    function setOpen(v) {
      open = v;
      mega.classList.toggle("open", v);
      mega.setAttribute("aria-hidden", String(!v));
      headerBlur.mega = v;
      syncHeaderBlur();
    }
    trigger.addEventListener("mouseenter", function () {
      setOpen(true);
    });
    trigger.parentElement.addEventListener("click", function () {
      setOpen(!open);
    });
    mega.addEventListener("mouseleave", function () {
      setOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (open && !mega.contains(e.target) && !(e.target.closest && e.target.closest("[data-mega]"))) {
        setOpen(false);
      }
    });
  }

  /* ---------------- hero ---------------- */
  var heroSwiper = null;
  function renderHero(db) {
    var wrap = $("#hero-wrapper");
    if (!wrap) return;
    wrap.innerHTML = db.sliders
      .map(function (s) {
        return (
          '<div class="swiper-slide"><a href="' +
          esc(s.href || "#") +
          '"' +
          (s.target === "_blank" ? ' target="_blank" rel="noopener"' : "") +
          '><img src="' +
          esc(s.image) +
          '" alt="slider" class="home-slider-img"></a></div>'
        );
      })
      .join("");
    heroSwiper = new Swiper("#hero-swiper", {
      rtl: true,
      slidesPerView: "auto",
      spaceBetween: 0,
      initialSlide: isMobile() ? 0 : 2,
      speed: 500,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: "#hero-swiper .swiper-pagination", clickable: true },
    });
  }

  /* ---------------- sections ---------------- */
  var specialImgs = ["images/special-one.png", "images/special-three.png", "images/new.png"];
  function specialHtml(sec, i) {
    var sizeAttr = i === 2 ? ' width="48" height="48"' : "";
    return (
      '<a class="swiper-slide special-tile' +
      (isMobile() ? "" : " hidden") +
      '" href="/kheilisabz"><div class="tile-inner"><p>' +
      esc(sec.title) +
      '</p><img src="' +
      specialImgs[i] +
      '" alt=""' +
      sizeAttr +
      "></div></a>"
    );
  }
  function cardHtml(p) {
    var d = p.discountPresent || 0;
    var oldRow = d ? '<p class="price-row"><span class="old-price">' + faNum(p.price) + "</span></p>" : "";
    var rowCls = d ? "price-row pb2" : "price-row with-margin pb2";
    return (
      '<a class="swiper-slide slider-item" href="' +
      esc(p.href) +
      '"><div class="image_product"><img src="' +
      esc(isMobile() ? p.imgMobile : p.imgDesktop) +
      '" alt="' +
      esc(p.title) +
      '">' +
      (d ? '<span class="discount">٪' + faNum(d) + "</span>" : "") +
      '</div><div class="price-info"><p class="slider-item-title">' +
      esc(p.title) +
      "</p>" +
      oldRow +
      '<p class="' +
      rowCls +
      '"><span class="sale_price">' +
      faNum(p.salePrice) +
      '</span><span class="toman">تومان</span></p></div></a>'
    );
  }
  function renderSections(db) {
    db.sections.forEach(function (sec, i) {
      var t = $("#title-" + (i + 1));
      if (t) t.textContent = sec.title;
      var wrap = document.querySelector("#books-" + (i + 1) + " .swiper-wrapper");
      if (!wrap) return;
      wrap.innerHTML = specialHtml(sec, i) + sec.products.map(cardHtml).join("");
    });
  }
  function initBooksSwipers() {
    var gap = isMobile() ? 14 : 10;
    Array.prototype.forEach.call(document.querySelectorAll(".books-swiper"), function (c) {
      new Swiper(c, {
        rtl: true,
        slidesPerView: "auto",
        spaceBetween: gap,
        navigation: {
          nextEl: c.querySelector(".swiper-button-next"),
          prevEl: c.querySelector(".swiper-button-prev"),
        },
      });
    });
  }

  /* ---------------- tiles & chips ---------------- */
  function renderTiles(db) {
    var el = $("#tile-series");
    if (!el) return;
    el.innerHTML = db.seriesChips
      .map(function (c) {
        var inner = c.image
          ? '<img src="' + esc(c.image) + '" alt="' + esc(c.label || "") + '" loading="lazy">'
          : "<span>" + esc(c.label || "") + "</span>";
        return '<a class="series-tile" href="' + esc(c.href) + '">' + inner + "</a>";
      })
      .join("");
  }
  function chipSwiper(containerId, chips) {
    var c = document.getElementById(containerId);
    if (!c) return;
    var wrap = c.querySelector(".swiper-wrapper");
    wrap.innerHTML = chips
      .map(function (ch) {
        return '<a class="swiper-slide chips" href="' + esc(ch.href) + '">' + esc(ch.label) + "</a>";
      })
      .join("");
    new Swiper(c, {
      rtl: true,
      slidesPerView: "auto",
      spaceBetween: 10.5,
    });
  }

  /* ---------------- banners ---------------- */
  function renderBanners(db) {
    var el = $("#banners");
    if (!el) return;
    var html = db.banners
      .map(function (b, i) {
        return (
          '<a class="banner' +
          (i === 0 ? " active" : "") +
          '" href="' +
          esc(b.href) +
          '"><img src="' +
          esc(b.image) +
          '" alt="' +
          esc(b.alt || "") +
          '">' +
          (isMobile() ? '<div class="description_product">' + esc(b.alt || "") + "</div>" : "") +
          "</a>"
        );
      })
      .join("");
    if (isMobile()) {
      html += '<div class="banners-arrow next" data-dir="next">‹</div><div class="banners-arrow prev" data-dir="prev">›</div>';
    }
    el.innerHTML = html;
    if (isMobile()) {
      var items = Array.prototype.slice.call(el.querySelectorAll(".banner"));
      var idx = 0;
      function go(n) {
        items[idx].classList.remove("active");
        idx = (n + items.length) % items.length;
        items[idx].classList.add("active");
      }
      el.querySelector('[data-dir="next"]').addEventListener("click", function () {
        go(idx + 1);
      });
      el.querySelector('[data-dir="prev"]').addEventListener("click", function () {
        go(idx - 1);
      });
    }
  }

  /* ---------------- footer ---------------- */
  function renderFooter(db) {
    if (!$("#site-footer")) return;
    var f = db.footer;
    var trust = (f.trust || [])
      .map(function (t) {
        return (
          '<a href="' + esc(t.href) + '" target="_blank" rel="noopener"><img src="' + esc(t.image) + '" alt="' + esc(t.alt || "") + '"></a>'
        );
      })
      .join("");
    var cols = f.cols
      .map(function (c, ci) {
        var ul =
          "<ul>" +
          c.items
            .map(function (i) {
              return (
                '<li><a href="' + esc(i.href) + '"' + (isExternal(i.href) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(i.txt) + "</a></li>"
              );
            })
            .join("") +
          "</ul>";
        var extra =
          ci === 1
            ? '<div class="divider footer__container__sm-divider"></div><div class="social_media">' +
              f.socials
                .map(function (s) {
                  return (
                    '<a href="' + esc(s.href) + '" target="_blank" rel="noopener"><img src="' + esc(s.image) + '" alt="' + esc(s.alt) + '"></a>'
                  );
                })
                .join("") +
              "</div>"
            : "";
        return '<div class="footer-col"><div class="footer-col-title">' + esc(c.title) + "</div>" + ul + extra + "</div>";
      })
      .join("");

    $("#site-footer").innerHTML =
      '<div class="container footer-container">' +
      '<div class="footer__logo"><img src="' + esc(f.logo) + '" alt="خیلی سبز"></div>' +
      '<div class="footer__content">' +
      '<div class="footer-desc">' +
      '<div class="footer-title">' + esc(f.aboutTitle) + "</div>" +
      '<div class="footer-about">' + f.about + "</div>" +
      '<div class="footer-trust">' + trust + "</div>" +
      "</div>" +
      cols +
      "</div>" +
      '<div class="divider footer-end-divider"></div>' +
      '<div class="copy-write">' + esc(f.copyright) + "</div>" +
      "</div>";
  }

  /* ---------------- popup ---------------- */
  function renderPopup(db) {
    var s = db.settings;
    var root = document.getElementById("popup-root");
    if (!root || !s.popupActive || localStorage.getItem("popup-see")) return;
    root.innerHTML =
      '<div class="popup-backdrop"><div class="popup-dialog"><a class="popup__link" href="' +
      esc(s.popupHref) +
      '" target="_blank" rel="noopener"><img src="' +
      esc(isMobile() ? s.popupImageMobile : s.popupImage) +
      '" width="600" alt=""></a></div></div>';
    function close() {
      localStorage.setItem("popup-see", "1");
      root.innerHTML = "";
    }
    root.querySelector(".popup-backdrop").addEventListener("click", function (e) {
      if (e.target === e.currentTarget) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------------- login popup ---------------- */
  function currentUser() {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  }
  function openLoginPopup() {
    var w = window.open(
      "login-popup.html",
      "_blank",
      "location=no,toolbar=no,width=500,height=500,left=100,top=100;"
    );
    if (w && w.focus) w.focus();
    return false;
  }
  function bindLoginPopup() {
    var btn = $(".login-button");
    if (btn) {
      if (!currentUser()) btn.setAttribute("href", "login-popup.html");
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (currentUser()) return;
        openLoginPopup();
      });
    }
    var navBtn = $('#bottom-nav a[href="login-popup.html"]');
    if (navBtn) {
      navBtn.addEventListener("click", function (e) {
        e.preventDefault();
        if (currentUser()) return;
        openLoginPopup();
      });
    }
  }
  function syncLoginLabel() {
    var lbl = $("#login-label");
    if (!lbl) return;
    var link = lbl.closest("a");
    var u = currentUser();
    if (u && u.name) {
      lbl.textContent = u.name;
      if (link) link.setAttribute("href", "javascript:void(0)");
    } else {
      lbl.textContent = "ورود یا ثبت‌نام";
      if (link) link.setAttribute("href", "login-popup.html");
    }
  }
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key === "user") syncLoginLabel();
  });

  /* ---------------- bottom nav & drawer ---------------- */
  function renderBottomNav() {
    if (!$("#bottom-nav")) return;
    var items = [
      { href: "/", icon: "images/icon-home.svg", label: "خانه", active: true },
      { href: "/search", icon: "images/icon-search-nav.svg" },
      { href: "/blog", icon: "images/icon-blog.svg" },
      { href: "/cart", icon: "images/icon-cart.svg" },
      { href: "login-popup.html", icon: "images/icon-user.svg" },
    ];
    $("#bottom-nav").innerHTML = items
      .map(function (i) {
        return (
          '<button type="button"><a href="' +
          i.href +
          '"><img src="' +
          i.icon +
          '" width="24" height="24" alt="">' +
          (i.label ? '<p class="item-name' + (i.active ? " active" : "") + '">' + i.label + "</p>" : "") +
          "</a></button>"
        );
      })
      .join("");
  }
  function renderDrawer(db) {
    var root = $("#drawer-root");
    var burger = $("#burger");
    if (!burger) return;
    burger.addEventListener("click", function () {
      var navHtml = db.nav
        .map(function (n) {
          if (n.type === "dropdown") {
            return n.items
              .map(function (i) {
                return '<a class="drawer-item" href="' + esc(i.href) + '"' + (i.external ? ' target="_blank"' : "") + ">" + esc(i.label) + "</a>";
              })
              .join("");
          }
          return '<a class="drawer-item" href="' + esc(n.href || "#") + '"' + (n.external ? ' target="_blank"' : "") + ">" + esc(n.label) + "</a>";
        })
        .join("");
      root.innerHTML =
        '<div class="drawer-backdrop"></div><div class="drawer"><a href="/"><img class="drawer-logo" src="images/logo-mobile.svg" alt=""></a>' + navHtml + "</div>";
      root.querySelector(".drawer-backdrop").addEventListener("click", function () {
        root.innerHTML = "";
      });
    });
  }

  /* ---------------- header extras ---------------- */
  function updateLogin(db) {
    syncLoginLabel();
    var s = db.settings;
    var input = $("#search-input");
    if (input && s.placeholder) input.setAttribute("placeholder", s.placeholder);
  }

  /* Static hosting (GitHub Pages): rewrite absolute links once + intercept future ones */
  function applyStaticLinkFix(scope) {
    if (!STATIC) return;
    try {
      (scope || document).querySelectorAll('a[href^="/"]').forEach(function (a) {
        var h = a.getAttribute("href");
        var fixed = resolveHref(h);
        if (fixed === "/") fixed = "index.html";
        else if (fixed === "/cart") fixed = SITE + "/cart";
        a.setAttribute("href", fixed);
        if (/^https?:\/\//.test(fixed)) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener");
        }
      });
    } catch (e) {}
  }
  if (STATIC) {
    document.addEventListener(
      "click",
      function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href^="/"]') : null;
        if (!a) return;
        var h = a.getAttribute("href") || "";
        if (/^(https?:)?\/\//.test(h)) return; /* already fixed */
        e.preventDefault();
        if (h === "/" || h === "") location.href = "index.html";
        else if (h === "/cart") window.open(SITE + "/cart", "_blank");
        else window.open(SITE + h, "_blank");
      },
      true
    );
  }

  /* ---------------- init ---------------- */
  initHeaderScroll();
  function boot() {
    loadDb()
      .then(function (db) {
        renderNav(db);
        renderMega(db);
        renderHero(db);
        renderSections(db);
        renderTiles(db);
        chipSwiper("series-chips-swiper", db.seriesChips);
        chipSwiper("grade-chips-swiper", db.gradeChips);
        renderBanners(db);
        renderFooter(db);
        renderBottomNav(db);
        renderDrawer(db);
        renderPopup(db);
        updateLogin(db);
        bindLoginPopup();
        initBooksSwipers();
        applyStaticLinkFix(document);
        /* drawer content is created later on burger click */
        document.addEventListener("click", function (e) {
          if (e.target && e.target.closest && e.target.closest("#burger")) {
            setTimeout(function () {
              applyStaticLinkFix(document.getElementById("drawer-root"));
            }, 0);
          }
        });
        window.__pageReady = true;
      })
      .catch(function (err) {
        console.error("load failed, retrying in 1s...", err);
        /* In static mode db.json missing = fatal, don't loop forever */
        if (STATIC) {
          console.error("static load failed, check db.json path");
          return;
        }
        /* never leave a blank page: keep retrying until API is up */
        setTimeout(boot, 1000);
      });
  }
  boot();
})();
