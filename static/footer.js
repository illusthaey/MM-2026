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
// + 추가: "우주 탐험/우주 전쟁" 테마 토글
// - 기본값: 우주 테마(space)
// - localStorage에 선택값 저장(edu_theme)
// - <html data-theme="space"> 를 통해 style.css의 우주 테마 활성화

(function () {
  // -----------------------------
  // 0) Theme boot (가장 먼저 적용: 첫 페인트 전환 최소화)
  // -----------------------------
  const THEME_KEY = "edu_theme";
  const THEME_SPACE = "space";
  const THEME_CLASSIC = "classic";
  const DEFAULT_THEME = THEME_SPACE;

  function safeGetTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return v || DEFAULT_THEME;
    } catch (_) {
      return DEFAULT_THEME;
    }
  }

  function safeSetTheme(v) {
    try {
      localStorage.setItem(THEME_KEY, v);
    } catch (_) {}
  }

  function applyTheme(v) {
    const root = document.documentElement;

    if (v === THEME_SPACE) {
      root.dataset.theme = THEME_SPACE;
      return;
    }

    // classic(기본 테마): data-theme 제거
    try {
      delete root.dataset.theme;
    } catch (_) {
      root.removeAttribute("data-theme");
    }
  }

  // 즉시 적용
  applyTheme(safeGetTheme());

  const FOOTER_HTML = `
<footer class="site-footer">
  <div class="shell">
    © <span id="footer-year"></span>.
    업무천재 고주무관. All rights reserved. · Contact: edusproutcomics@naver.com · 개인 제작·운영 페이지.<br/>
    <br/>
    ※본 사이트는 현장 업무 편의를 위해 개인적으로 제작한 참고용 도구이며, 공식 업무 지침이나 법적 해석을 대체하지 않습니다. 또한 서버와 데이터베이스 없이 운영하기 때문에 업로드한 파일 내용이 저장되지 않습니다. (기술적으로 저장이 불가능) <br/>
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
  // 1) 페이지 상단으로 가기 플로팅 버튼 (모든 페이지)
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

  // -----------------------------
  // 2) 테마 토글 플로팅 버튼 (모든 페이지)
  // -----------------------------
  const THEME_FAB_ID = "theme-toggle-fab";
  const THEME_BUTTON_ID = "btnThemeToggle";
  const THEME_STYLE_ID = "theme-toggle-style";

  const THEME_TOGGLE_HTML = `
<div id="${THEME_FAB_ID}" class="theme-toggle-fab" aria-label="테마 전환">
  <button class="btn" type="button" id="${THEME_BUTTON_ID}" aria-pressed="false" title="테마 전환">
    테마
  </button>
</div>
`.trim();

  const THEME_TOGGLE_CSS = `
/* 테마 토글 버튼: 화면에서만 보이고 인쇄물에는 안 찍힘 */
@media print{
  #${THEME_FAB_ID}{ display:none !important; }
}

#${THEME_FAB_ID}.theme-toggle-fab{
  position: fixed;
  left: 12px;
  left: calc(12px + env(safe-area-inset-left));
  bottom: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 2147483646;
  display: flex;
  align-items: center;
}

/* 기존 btn 스타일을 존중하되, 둥글게/컴팩트하게 */
#${THEME_FAB_ID} .btn{
  border-radius: 999px;
  padding: 10px 14px;
  line-height: 1;
  white-space: nowrap;
  font-weight: 800;
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

  function ensureStyle(id, cssText) {
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.textContent = cssText;

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
    ensureStyle(BTT_STYLE_ID, BACK_TO_TOP_CSS);

    // 이미 있으면 지우고 다시(표준화)
    const old = document.getElementById(BTT_FAB_ID);
    if (old) old.remove();

    const fab = toElement(BACK_TO_TOP_HTML);
    document.body.appendChild(fab);

    bindBackToTop();
    ensureBackToTopScrollWatcher();
  }

  function syncThemeToggleText() {
    const btn = document.getElementById(THEME_BUTTON_ID);
    if (!btn) return;

    const isSpace = document.documentElement.dataset.theme === THEME_SPACE;
    btn.textContent = isSpace ? "테마: 우주" : "테마: 기본";
    btn.setAttribute("aria-pressed", String(isSpace));
  }

  function bindThemeToggle() {
    const btn = document.getElementById(THEME_BUTTON_ID);
    if (!btn) return;

    // 중복 바인딩 방지
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    btn.addEventListener("click", () => {
      const isSpace = document.documentElement.dataset.theme === THEME_SPACE;
      const next = isSpace ? THEME_CLASSIC : THEME_SPACE;

      safeSetTheme(next);
      applyTheme(next);
      syncThemeToggleText();
    });

    // 최초 텍스트 동기화
    syncThemeToggleText();
  }

  function injectThemeToggleFab() {
    ensureStyle(THEME_STYLE_ID, THEME_TOGGLE_CSS);

    // 이미 있으면 지우고 다시(표준화)
    const old = document.getElementById(THEME_FAB_ID);
    if (old) old.remove();

    const fab = toElement(THEME_TOGGLE_HTML);
    document.body.appendChild(fab);

    bindThemeToggle();
  }

  function removeExisting() {
    // 기존에 HTML로 박혀 있던 것들까지 전부 제거 (강제 덮어쓰기)
    document.querySelectorAll(".home-link-wrap").forEach((el) => el.remove());
    document.querySelectorAll("footer.site-footer").forEach((el) => el.remove());

    // 기존 상단 가기 버튼(있다면) 제거 — 표준 UI로 강제 덮어쓰기
    const selectors = [
      `#${BTT_FAB_ID}`,
      `#${THEME_FAB_ID}`,
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

  function injectStandard() {
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

    // 5) 페이지 상단으로 가기 버튼 주입(모든 페이지)
    injectBackToTopFab();

    // 6) 테마 토글 버튼 주입(모든 페이지)
    injectThemeToggleFab();
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
