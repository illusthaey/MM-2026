(function () {
  if (window.__MM_BRAND_UI_LOADED__) return;
  window.__MM_BRAND_UI_LOADED__ = true;

  const FALLBACK = {
    masterBrand: "업무천재 고주무관의 쉬운 학교행정",
    editionTitle: "문막초 교직원 안내",
    headerTitle: "교직원을 위한 쉬운 학교 행정 가이드",
    siteTitle: "교직원을 위한 쉬운 학교 행정 가이드 | 문막초 교직원 안내",
    schoolName: "문막초등학교",
    schoolShortName: "문막초",
    operatorName: "업무천재 고주무관",
    slogan: "교직원이 덜 헤매도록, 행정은 더 쉽게",
    homeHeadline: "문막초 교직원을 위한 쉬운 학교행정 안내",
    homeSubtitle: "문막초가 좋은 행정실 고주무관이, 자주 묻는 행정·회계 업무를 이해하기 쉽게 정리했습니다.",
    trustMessage: "이 웹페이지는 참고용 비공식 실무 도구이며, 공문·지침 등 공식 자료를 항상 확인합시다.",
    affectionLine: "교직원도 고주무관도 서로 더 편하기 위해 만든 개인 운영 웹페이지입니다.",
    brandAccentColor: "#1f3a5f",
    schoolAccentColor: "#628a63",
    routes: {
      home: "/",
      howToUse: "/notice/how-to-use/",
      notice: "/notice/",
      biteGuide: "/a-bite/",
      legacyNewsletter: "/newsletter/",
      detailedGuide: "/guide/",
      tools: "/tools/",
      downloads: "/file-download/",
      legacyABite: "/a-bite/"
    },
    lightOnly: true
  };

  function mergeBrand(raw) {
    const cfg = raw || {};
    return Object.assign({}, FALLBACK, cfg, {
      routes: Object.assign({}, FALLBACK.routes, cfg.routes || {})
    });
  }

  function resolvePath(obj, path) {
    return String(path || "")
      .split(".")
      .filter(Boolean)
      .reduce(function (acc, key) {
        return acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined;
      }, obj);
  }

  function interpolate(template, cfg) {
    return String(template || "").replace(/\{([^}]+)\}/g, function (_, key) {
      const value = resolvePath(cfg, key.trim());
      return value === undefined || value === null ? "" : String(value);
    });
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function isExternalUrl(href) {
    return /^https?:\/\//i.test(String(href || ""));
  }

  function externalLinkAttrs(href) {
    return isExternalUrl(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }

  function isHomePage() {
    const path = String(location.pathname || "/").toLowerCase();
    return path === "/" || path === "/index.html" || path === "/index.htm";
  }

  function toElement(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }

  function ensureMetaColorScheme() {
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "color-scheme");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "light");
  }

  function ensureHeaderStyle() {
    if (document.getElementById("mm-brand-header-style")) return;

    const style = document.createElement("style");
    style.id = "mm-brand-header-style";
    style.textContent = [
      ".brand-site-header{background:var(--bg,#fff);border-bottom:1px solid var(--border,#e5e7eb);}",
      ".brand-site-header .shell{max-width:var(--w-page,1280px);margin:0 auto;}",
      ".brand-home-link{display:inline-flex;align-items:center;gap:10px;min-width:0;color:var(--text,#111);font-weight:800;font-size:15px;letter-spacing:-.025em;text-decoration:none;white-space:nowrap;}",
      ".brand-home-link:hover{color:var(--brand-accent,var(--brand,#1f3a5f));text-decoration:none;}",
      ".brand-home-link__mark{width:9px;height:9px;border-radius:999px;background:var(--brand-accent,var(--brand,#1f3a5f));box-shadow:0 0 0 4px rgba(31,58,95,.08);flex:0 0 auto;}",
      ".brand-home-link__text{overflow:hidden;text-overflow:ellipsis;}",
      ".brand-site-header__right{display:flex;align-items:center;gap:8px;min-width:0;margin-left:16px;}",
      ".brand-site-header__tagline{color:var(--text-muted,#6b7280);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:min(34vw,420px);}",
      "@media (max-width:720px){.brand-site-header .shell{height:auto;min-height:56px;padding-top:10px;padding-bottom:10px;align-items:flex-start;gap:8px;}.brand-home-link{white-space:normal;line-height:1.35;}.brand-site-header__right{margin-left:0;}.brand-site-header__tagline{display:none;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function injectHeader(cfg) {
    if (!document.body) return;

    document.querySelectorAll('header.brand-site-header[data-brand-header="true"]').forEach(function (node) {
      node.remove();
    });

    ensureHeaderStyle();

    const homeHref = cfg.routes.home || "/";
    const headerTitle = cfg.headerTitle || cfg.masterBrand || FALLBACK.headerTitle;
    const slogan = cfg.slogan || "";

    const header = toElement([
      '<header class="site-header brand-site-header" data-brand-header="true">',
      '  <div class="shell">',
      '    <a class="brand-home-link" href="' + escapeAttribute(homeHref) + '" aria-label="메인으로 이동">',
      '      <span class="brand-home-link__mark" aria-hidden="true"></span>',
      '      <span class="brand-home-link__text">' + escapeHtml(headerTitle) + '</span>',
      '    </a>',
      '    <div class="brand-site-header__right">',
      slogan ? '      <span class="brand-site-header__tagline">' + escapeHtml(slogan) + '</span>' : '',
      '      <a class="btn-home" href="' + escapeAttribute(homeHref) + '"' + externalLinkAttrs(homeHref) + '>메인</a>',
      '    </div>',
      '  </div>',
      '</header>'
    ].join(""));

    const skipLink = document.querySelector(".skip-link");
    if (skipLink && skipLink.parentNode === document.body) {
      document.body.insertBefore(header, skipLink.nextSibling);
    } else {
      document.body.insertBefore(header, document.body.firstChild);
    }
  }

  function applyBrandText(brand) {
    document.querySelectorAll("[data-brand-key]").forEach(function (el) {
      const key = el.getAttribute("data-brand-key");
      const value = resolvePath(brand, key);
      if (value === undefined || value === null) return;
      if (el.hasAttribute("data-brand-html")) el.innerHTML = String(value);
      else el.textContent = String(value);
    });

    document.querySelectorAll("[data-brand-template]").forEach(function (el) {
      const template = el.getAttribute("data-brand-template");
      const rendered = interpolate(template, brand);
      if (el.hasAttribute("data-brand-html")) el.innerHTML = rendered;
      else el.textContent = rendered;
    });

    document.querySelectorAll("[data-brand-route]").forEach(function (el) {
      const routeKey = el.getAttribute("data-brand-route");
      const href = resolvePath(brand, "routes." + routeKey);
      if (!href) return;
      el.setAttribute("href", href);
      if (isExternalUrl(href)) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function applyMetaTitle(brand) {
    const metaTitle = document.querySelector('meta[name="x-brand-title"]');
    if (metaTitle && metaTitle.content) {
      document.title = interpolate(metaTitle.content, brand);
      return;
    }

    if (isHomePage() && brand.siteTitle) {
      document.title = brand.siteTitle;
    }
  }

  function applyBrand(cfg) {
    const brand = mergeBrand(cfg);

    document.documentElement.style.setProperty("--brand-accent", brand.brandAccentColor || FALLBACK.brandAccentColor);
    document.documentElement.style.setProperty("--school-accent", brand.schoolAccentColor || FALLBACK.schoolAccentColor);
    document.documentElement.style.setProperty("--brand-accent-color", brand.brandAccentColor || FALLBACK.brandAccentColor);
    document.documentElement.style.setProperty("--school-accent-color", brand.schoolAccentColor || FALLBACK.schoolAccentColor);
    document.documentElement.setAttribute("data-light-only", brand.lightOnly ? "true" : "false");
    document.documentElement.removeAttribute("data-theme");
    ensureMetaColorScheme();

    if (document.body) {
      document.body.classList.add("brand-site");
      if (isHomePage()) document.body.classList.add("page-home", "home-page");
    }

    injectHeader(brand);
    applyBrandText(brand);
    applyMetaTitle(brand);

    window.BrandUI = {
      brand: brand,
      applyBrand: applyBrand,
      injectHeader: injectHeader,
      resolvePath: function (path) { return resolvePath(brand, path); },
      interpolate: function (template) { return interpolate(template, brand); }
    };
  }

  function boot() {
    applyBrand(window.SITE_BRAND || FALLBACK);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
