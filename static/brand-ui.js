(function () {
  const FALLBACK = {
    masterBrand: "고주무관의 쉬운 학교행정",
    editionTitle: "문막초 교직원 안내",
    schoolName: "문막초등학교",
    schoolShortName: "문막초",
    operatorName: "고주무관",
    slogan: "교직원이 덜 헤매도록, 행정은 더 쉽게",
    homeHeadline: "문막초 교직원을 위한 쉬운 학교행정 안내",
    homeSubtitle: "문막초가 좋은 행정실 주무관 고주무관이, 자주 묻는 행정·회계 업무를 이해하기 쉽게 정리했습니다.",
    trustMessage: "이 웹페이지는 업무 참고용이며, 최종 기준은 공문·지침 등 공식 자료를 우선합니다.",
    affectionLine: "문막초를 더 편하게 돕기 위해 만든 개인 운영 페이지입니다.",
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

  function resolvePath(obj, path) {
    return String(path || "")
      .split(".")
      .filter(Boolean)
      .reduce((acc, key) => (acc && key in acc ? acc[key] : undefined), obj);
  }

  function interpolate(template, cfg) {
    return String(template || "").replace(/\{([^}]+)\}/g, function (_, key) {
      const value = resolvePath(cfg, key.trim());
      return value === undefined || value === null ? "" : String(value);
    });
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

  function applyBrand(cfg) {
    const brand = Object.assign({}, FALLBACK, cfg || {});
    document.documentElement.style.setProperty("--brand-accent", brand.brandAccentColor || FALLBACK.brandAccentColor);
    document.documentElement.style.setProperty("--school-accent", brand.schoolAccentColor || FALLBACK.schoolAccentColor);
    document.documentElement.setAttribute("data-light-only", brand.lightOnly ? "true" : "false");
    document.documentElement.removeAttribute("data-theme");
    ensureMetaColorScheme();

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
      if (href) el.setAttribute("href", href);
    });

    const metaTitle = document.querySelector('meta[name="x-brand-title"]');
    if (metaTitle && metaTitle.content) {
      document.title = interpolate(metaTitle.content, brand);
    }

    window.BrandUI = {
      brand: brand,
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
