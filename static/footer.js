// /static/footer.js
// 목적: 페이지에 기존 footer/home 버튼이 있어도 "강제 덮어쓰기"로 표준 UI를 통일
// - 기존 footer.site-footer 제거
// - 기존 .home-link-wrap 제거
// - (메인 페이지 제외) home 버튼을 footer 바로 위에 삽입
// - footer는 항상 body 맨 끝에 삽입
// - footer-year에 올해 연도 자동 표기
// - fetch로 footer.html 불러오지 않음(단일 JS로 관리)
//
// + 추가: 모든 페이지에 "페이지 상단으로 가기" 플로팅 버튼 주입
// - 기존 상단 가기 버튼이 있더라도 강제 제거 후 표준 버튼으로 덮어쓰기
// - 스크롤 200px 이상 내려가면 노출, 클릭 시 상단으로 이동
// - 인쇄 시 버튼 숨김
//
// + 추가(2026.3.3): 레트로 테마 / 깔끔 테마 토글 + 빠른 이동(칩) 현재 위치 표시

(function () {
  // -----------------------------
  // 0) 테마(레트로/깔끔) — 로컬 저장
  // -----------------------------
  const THEME_KEY = "edu_theme";
  const DEFAULT_THEME = "retro"; // 기본값: 레트로

  function normalizeTheme(t) {
    return t === "classic" || t === "retro" ? t : DEFAULT_THEME;
  }

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function safeSet(key, val) {
    try {
      localStorage.setItem(key, String(val));
    } catch (_) {}
  }

  function getTheme() {
    return normalizeTheme(safeGet(THEME_KEY) || DEFAULT_THEME);
  }

  function syncThemeButtons(theme) {
    document
      .querySelectorAll('button.btn-theme[data-theme]')
      .forEach((btn) => {
        const active = btn.getAttribute("data-theme") === theme;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
      });
  }

  function applyTheme(theme, persist) {
    const t = normalizeTheme(theme);

    // html에 걸어두면 body 생성 전에도 CSS가 적용될 수 있어 플리커가 줄어듦
    try {
      document.documentElement.setAttribute("data-theme", t);
    } catch (_) {}

    if (document.body) {
      document.body.classList.toggle("theme-retro", t === "retro");
      document.body.classList.toggle("theme-classic", t === "classic");
    }

    syncThemeButtons(t);

    if (persist) safeSet(THEME_KEY, t);

    return t;
  }

  // 스크립트가 head에 있어도(혹시라도) 바로 테마를 먼저 맞춰둠
  const INITIAL_THEME = applyTheme(getTheme(), false);

  // -----------------------------
  // 1) footer / home 버튼 HTML
  // -----------------------------
  const FOOTER_HTML = `
<footer class="site-footer">
  <div class="shell">
    <div class="footer-main">
      © <span id="footer-year"></span>.
      업무천재 고주무관. All rights reserved. · Contact: edusproutcomics@naver.com · 개인 제작·운영 페이지.<br/>
      <br/>
      ※본 사이트는 현장 업무 편의를 위해 개인적으로 제작한 참고용 도구이며, 공식 업무 지침이나 법적 해석을 대체하지 않습니다.
      또한 서버와 데이터베이스 없이 운영하기 때문에 업로드한 파일 내용이 저장되지 않습니다. (기술적으로 저장이 불가능) <br/>
    </div>

    <div class="footer-tools" aria-label="화면 설정">
      <div class="theme-switch" role="group" aria-label="화면 테마 선택">
        <button type="button" class="btn btn-theme" data-theme="retro" aria-pressed="false">레트로</button>
        <button type="button" class="btn btn-theme" data-theme="classic" aria-pressed="false">깔끔</button>
      </div>
      <div class="muted footer-hint">·테마 설정은 이 브라우저(로컬)에 저장됩니다.</div>
    </div>
  </div>
</footer>
`.trim();

  // 요구사항에 맞춘 "정확한" 홈 버튼 마크업
  const HOME_BUTTON_HTML = `
<div class="home-link-wrap">
  <a class="btn" href="/">메인으로 돌아가기</a>
</div>
`.trim();

  // -----------------------------
  // 2) 페이지 상단으로 가기 플로팅 버튼 (모든 페이지)
  // -----------------------------
  const BTT_FAB_ID = "back-to-top-fab";
  const BTT_BUTTON_ID = "btnBackToTop";
  const BTT_STYLE_ID = "back-to-top-style";

  const BACK_TO_TOP_HTML = `
<div id="${BTT_FAB_ID}" class="back-to-top-fab" aria-label="페이지 상단으로 가기">
  <button class="btn" type="button" id="${BTT_BUTTON_ID}" title="페이지 상단으로 이동">
    ▲ 상단
  </button>
</div>
`.trim();

  const BACK_TO_TOP_CSS = `
/* 페이지 상단으로 가기 버튼: 화면에서만 보이고 인쇄물에는 안 찍힘 */
@media print{
  #${BTT_FAB_ID}{ display:none !important; }
}

#${BTT_FAB_ID}.back-to-top-fab{
  position: fixed;
  right: 12px;
  right: calc(12px + env(safe-area-inset-right));
  bottom: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 2147483646;
  display: none;
  align-items: center;
}

#${BTT_FAB_ID}.back-to-top-fab.is-visible{
  display: flex;
}

/* 기존 btn 스타일을 존중하되, 둥글게/컴팩트하게 */
#${BTT_FAB_ID} .btn{
  border-radius: 999px;
  padding: 10px 14px;
  line-height: 1;
  white-space: nowrap;
}
`.trim();

  function isHomePage() {
    const path = (location.pathname || "/").toLowerCase();
    return path === "/" || path === "/index.html" || path === "/index.htm";
  }

  function toElement(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  }

  function ensureBackToTopStyle() {
    if (document.getElementById(BTT_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = BTT_STYLE_ID;
    style.textContent = BACK_TO_TOP_CSS;

    (document.head || document.documentElement).appendChild(style);
  }

  function ensureBackToTopScrollWatcher() {
    const FLAG = "__eduworkhae_btt_scroll_watcher_bound__";
    if (window[FLAG]) return;
    window[FLAG] = true;

    const toggle = () => {
      const fab = document.getElementById(BTT_FAB_ID);
      if (!fab) return;

      const y =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      if (y > 200) fab.classList.add("is-visible");
      else fab.classList.remove("is-visible");
    };

    window.addEventListener("scroll", toggle, { passive: true });
    window.addEventListener("resize", toggle);
    window.addEventListener("orientationchange", toggle);

    // 초기 상태 동기화
    setTimeout(toggle, 0);
  }

  function bindBackToTop() {
    const btn = document.getElementById(BTT_BUTTON_ID);
    if (!btn) return;

    // 중복 바인딩 방지
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    btn.addEventListener("click", () => {
      const reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        window.scrollTo(0, 0);
        return;
      }

      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (_) {
        window.scrollTo(0, 0);
      }
    });
  }

  function injectBackToTopFab() {
    ensureBackToTopStyle();

    // 이미 있으면 지우고 다시(표준화)
    const old = document.getElementById(BTT_FAB_ID);
    if (old) old.remove();

    const fab = toElement(BACK_TO_TOP_HTML);
    document.body.appendChild(fab);

    bindBackToTop();
    ensureBackToTopScrollWatcher();
  }

  // -----------------------------
  // 3) 빠른 이동(칩) — 현재 위치 표시 + 부드러운 스크롤
  // -----------------------------
  function enhanceQuickNav() {
    const nav = document.querySelector("nav.quick-nav");
    if (!nav) return;

    const chips = Array.from(nav.querySelectorAll('a.chip[href^="#"]'));
    if (!chips.length) return;

    const items = chips
      .map((a) => {
        const href = a.getAttribute("href") || "";
        const id = decodeURIComponent(href.slice(1));
        const section = document.getElementById(id);
        if (!section) return null;
        return { id, a, section };
      })
      .filter(Boolean);

    if (!items.length) return;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 클릭 시: 스크롤 이동을 더 직관적으로(헤더/스티키 영역 고려)
    chips.forEach((a) => {
      if (a.dataset.smoothBound === "1") return;
      a.dataset.smoothBound = "1";

      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return;

        const id = decodeURIComponent(href.slice(1));
        const target = document.getElementById(id);
        if (!target) return;

        // 기본 점프는 막고, 부드러운 스크롤로 이동
        e.preventDefault();

        const top = target.getBoundingClientRect().top + window.pageYOffset - 12;

        try {
          window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
        } catch (_) {
          window.scrollTo(0, top);
        }

        // URL hash 동기화(뒤로가기/공유 편의)
        try {
          history.pushState(null, "", "#" + encodeURIComponent(id));
        } catch (_) {
          location.hash = id;
        }
      });
    });

    function setActive(id) {
      items.forEach(({ id: sid, a }) => {
        a.classList.toggle("is-active", sid === id);
        if (sid === id) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    }

    // hash 기반 초기 동기화
    const fromHash = () => {
      const raw = (location.hash || "").replace(/^#/, "");
      if (!raw) return;
      const id = decodeURIComponent(raw);
      setActive(id);
    };
    fromHash();

    // 관찰자(지원되면)로 현재 섹션 표시
    if (!("IntersectionObserver" in window)) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // 화면에 걸린 것 중 "가장 위쪽에 가까운" 섹션을 활성화
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visible && visible.target && visible.target.id) {
          setActive(visible.target.id);
        }
      },
      {
        root: null,
        // 위쪽 10% 부근에 걸리면 활성화. (아래쪽은 넉넉히 무시)
        rootMargin: "-10% 0px -70% 0px",
        threshold: [0.01, 0.1, 0.2],
      }
    );

    items.forEach(({ section }) => obs.observe(section));

    window.addEventListener("hashchange", fromHash);
  }

  // -----------------------------
  // 4) 기존 요소 제거 + 표준 요소 삽입
  // -----------------------------
  function removeExisting() {
    // 기존에 HTML로 박혀 있던 것들까지 전부 제거 (강제 덮어쓰기)
    document.querySelectorAll(".home-link-wrap").forEach((el) => el.remove());
    document.querySelectorAll("footer.site-footer").forEach((el) => el.remove());

    // ✅ 기존 상단 가기 버튼(있다면) 제거 — 표준 UI로 강제 덮어쓰기
    const selectors = [
      `#${BTT_FAB_ID}`,
      "#back-to-top",
      "#backToTop",
      ".back-to-top",
      ".backToTop",
      ".scroll-top",
      ".scrollToTop",
      ".go-top",
      ".goTop",
      ".to-top",
      ".toTop",
      ".btn-top",
      ".top-btn",
      ".top-button",
      ".move-top",
    ];

    try {
      document.querySelectorAll(selectors.join(",")).forEach((el) => el.remove());
    } catch (_) {
      // selector 이슈가 생겨도 footer 자체는 동작해야 하므로 조용히 무시
    }
  }

  function bindThemeButtons() {
    document.querySelectorAll('button.btn-theme[data-theme]').forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";

      btn.addEventListener("click", () => {
        const t = btn.getAttribute("data-theme") || DEFAULT_THEME;
        applyTheme(t, true);
      });
    });
  }

  function injectStandard() {
    // ✅ 0) 가능한 빨리 테마 적용(플리커 최소화)
    const currentTheme = applyTheme(getTheme(), false);

    removeExisting();

    // 1) (메인 제외) 홈 버튼 주입
    if (!isHomePage()) {
      const homeWrap = toElement(HOME_BUTTON_HTML);
      // 일단 body에 붙였다가 아래에서 footer 위로 정확히 위치시킴
      document.body.appendChild(homeWrap);
    }

    // 2) footer는 항상 body 맨 끝
    const footer = toElement(FOOTER_HTML);
    document.body.appendChild(footer);

    // 3) 홈 버튼을 footer "바로 위"로 이동(정렬 보장)
    if (!isHomePage()) {
      const homeWrap = document.querySelector(".home-link-wrap");
      const footerEl = document.querySelector("footer.site-footer");
      if (homeWrap && footerEl && footerEl.parentNode) {
        footerEl.parentNode.insertBefore(homeWrap, footerEl);
      }
    }

    // 4) 연도 세팅
    const y = document.getElementById("footer-year");
    if (y) y.textContent = new Date().getFullYear();

    // ✅ 5) 페이지 상단으로 가기 버튼 주입(모든 페이지)
    injectBackToTopFab();

    // ✅ 6) 테마 버튼 초기화/바인딩
    applyTheme(currentTheme, false);
    bindThemeButtons();

    // ✅ 7) 빠른 이동(칩) UX 강화
    enhanceQuickNav();
  }

  function init() {
    try {
      injectStandard();
    } catch (e) {
      console.error("footer.js init failed:", e);
    }
  }

  // head에 있든 body 끝에 있든 동작하게 처리
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
