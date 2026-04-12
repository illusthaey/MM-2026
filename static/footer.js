(function () {
  if (window.__STANDARD_BRAND_FOOTER_LOADED__) return;
  window.__STANDARD_BRAND_FOOTER_LOADED__ = true;

  const FALLBACK = {
    masterBrand: "고주무관의 쉬운 학교행정",
    editionTitle: "문막초 교직원 안내",
    operatorName: "고주무관",
    contactEmail: "edusproutcomics@naver.com",
    affectionLine: "문막초를 더 편하게 돕기 위해 만든 개인 운영 페이지입니다.",
    schoolShortName: "문막초",
    trustMessage: "이 웹페이지는 업무 참고용이며, 최종 기준은 공문·지침 등 공식 자료를 우선합니다.",
    playfulAlias: "업무천재 고주무관",
    brandAccentColor: "#1f3a5f",
    schoolAccentColor: "#628a63",
    routes: {
      home: "/"
    },
    lightOnly: true
  };

  function mergeBrand(raw) {
    const cfg = raw || {};
    const routes = Object.assign({}, FALLBACK.routes, cfg.routes || {});
    return Object.assign({}, FALLBACK, cfg, { routes: routes });
  }

  function loadBrand(done) {
    if (window.SITE_BRAND) {
      done(mergeBrand(window.SITE_BRAND));
      return;
    }

    const existing = document.querySelector('script[data-brand-config-loader="true"]');
    if (existing) {
      existing.addEventListener("load", function onLoad() {
        existing.removeEventListener("load", onLoad);
        done(mergeBrand(window.SITE_BRAND));
      });
      existing.addEventListener("error", function onError() {
        existing.removeEventListener("error", onError);
        done(mergeBrand(FALLBACK));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "/static/brand-config.js";
    script.async = false;
    script.setAttribute("data-brand-config-loader", "true");
    script.addEventListener("load", function () {
      done(mergeBrand(window.SITE_BRAND));
    });
    script.addEventListener("error", function () {
      done(mergeBrand(FALLBACK));
    });
    document.head.appendChild(script);
  }

  function ensureColorScheme() {
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "color-scheme");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "light");
  }

  function applyBrandGlobals(cfg) {
    document.documentElement.style.setProperty("--brand-accent", cfg.brandAccentColor || FALLBACK.brandAccentColor);
    document.documentElement.style.setProperty("--school-accent", cfg.schoolAccentColor || FALLBACK.schoolAccentColor);
    document.documentElement.setAttribute("data-light-only", cfg.lightOnly ? "true" : "false");
    document.documentElement.removeAttribute("data-theme");
    ensureColorScheme();

    if (document.body) {
      document.body.classList.remove("theme-retro", "theme-classic");
    }

    const title = String(document.title || "").trim();
    if (title && !title.includes(cfg.masterBrand)) {
      document.title = title + " | " + cfg.masterBrand;
    }
  }

  function isHomePage() {
    const path = String(location.pathname || "/").toLowerCase();
    return path === "/" || path === "/index.html" || path === "/index.htm";
  }

  function removeLegacyUi() {
    document.querySelectorAll(".home-link-wrap, footer.site-footer, footer.simple-footer").forEach(function (node) {
      node.remove();
    });
  }

  function createNode(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }

  function injectHomeLink(cfg) {
    if (isHomePage()) return;

    const linkHtml = [
      '<div class="home-link-wrap" data-standard-home-link="true">',
      '  <a class="btn btn-home" href="' + (cfg.routes.home || "/") + '">메인으로 돌아가기</a>',
      "</div>"
    ].join("");

    const link = createNode(linkHtml);
    document.body.appendChild(link);
  }

  function injectFooter(cfg) {
    const year = new Date().getFullYear();
    const playful = cfg.playfulAlias
      ? '<span class="footer-playful" title="보조 문구">' + cfg.playfulAlias + "</span>"
      : "";

    const html = [
      '<footer class="site-footer" data-standard-footer="true">',
      '  <div class="shell">',
      '    <p class="footer-brand">© ' + year + '. ' + cfg.masterBrand + '.</p>',
      '    <p>' + cfg.editionTitle + ' 운영판 · 운영자: ' + cfg.operatorName + ' · Contact: ' + cfg.contactEmail + '</p>',
      '    <p>' + cfg.trustMessage + '</p>',
      '    <p>' + cfg.affectionLine + ' ' + playful + '</p>',
      "  </div>",
      "</footer>"
    ].join("");

    document.body.appendChild(createNode(html));
  }

  function ensureBackToTop() {
    const styleId = "brand-back-to-top-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = [
        "@media print{#brandBackToTop{display:none !important;}}",
        "#brandBackToTop{position:fixed;right:16px;bottom:16px;z-index:2147483646;display:none;}",
        "#brandBackToTop.is-visible{display:block;}",
        "#brandBackToTop .btn{border-radius:999px;padding:10px 14px;box-shadow:0 10px 24px rgba(0,0,0,.14);}"
      ].join("");
      document.head.appendChild(style);
    }

    let wrap = document.getElementById("brandBackToTop");
    if (!wrap) {
      wrap = createNode('<div id="brandBackToTop" aria-label="페이지 상단으로 이동"><button type="button" class="btn">▲ 상단</button></div>');
      document.body.appendChild(wrap);
    }

    const button = wrap.querySelector("button");
    if (!button.dataset.bound) {
      button.dataset.bound = "true";
      button.addEventListener("click", function () {
        try {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (_) {
          window.scrollTo(0, 0);
        }
      });
    }

    const toggle = function () {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      wrap.classList.toggle("is-visible", y > 240);
    };

    if (!window.__brandBackToTopBound) {
      window.__brandBackToTopBound = true;
      window.addEventListener("scroll", toggle, { passive: true });
      window.addEventListener("resize", toggle);
      window.addEventListener("orientationchange", toggle);
    }

    toggle();
  }

  function init(cfg) {
    removeLegacyUi();
    applyBrandGlobals(cfg);
    injectHomeLink(cfg);
    injectFooter(cfg);
    ensureBackToTop();
  }

  function boot() {
    loadBrand(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
