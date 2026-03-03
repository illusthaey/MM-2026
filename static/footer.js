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
//
// + 추가(2026-03-03): "DMMD풍 게임 UI" 테마를 (홈 제외) 상세페이지에만 자동 적용
// - html[data-theme="dmmd"] 설정
// - /static/dmmd.css 를 head에 동적 삽입(페이지별 inline style보다 '뒤'에 오도록)

(function () {
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

  // ✅ 페이지 상단으로 가기 플로팅 버튼 (모든 페이지)
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

  // =========================
  // ✅ DMMD Theme Auto Apply
  // =========================
  const DMMD_THEME = "dmmd";
  const DMMD_LINK_ID = "dmmd-theme-css";
  const DMMD_CSS_HREF = "/static/dmmd.css?v=1";

  function isHomePage() {
    const path = (location.pathname || "/").toLowerCase();
    return path === "/" || path === "/index.html" || path === "/index.htm";
  }

  function shouldApplyDmmdTheme() {
    if (isHomePage()) return false;

    // 페이지별 opt-out: <body class="no-dmmd"> 로 비활성화 가능
    try {
      if (document.body && document.body.classList.contains("no-dmmd")) return false;
    } catch (_) {}

    // html에 이미 data-theme가 명시되어 있으면 존중(단, pastel/light류는 dmmd로 덮어쓰기 허용)
    try {
      const html = document.documentElement;
      const cur = (html.getAttribute("data-theme") || "").trim().toLowerCase();
      if (cur && !["pastel","light","corporate","lofi","retro","dark"].includes(cur)) {
        return false;
      }
    } catch (_) {}

    return true;
  }

  function ensureDmmdStylesheet() {
    const head = document.head || document.getElementsByTagName("head")[0];
    if (!head) return;

    if (document.getElementById(DMMD_LINK_ID)) return;

    const link = document.createElement("link");
    link.id = DMMD_LINK_ID;
    link.rel = "stylesheet";
    link.href = DMMD_CSS_HREF;

    head.appendChild(link);
  }

  function applyDmmdTheme() {
    if (!shouldApplyDmmdTheme()) return;

    try {
      const html = document.documentElement;
      html.setAttribute("data-theme", DMMD_THEME);
    } catch (_) {}

    try {
      if (document.body) document.body.classList.add("theme-dmmd");
    } catch (_) {}

    // dmmd.css는 "head의 맨 뒤"에 들어가야 inline style보다 우선권이 생김
    ensureDmmdStylesheet();
  }

  // =========================
  // 기존 로직
  // =========================
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

    setTimeout(toggle, 0);
  }

  function bindBackToTop() {
    const btn = document.getElementById(BTT_BUTTON_ID);
    if (!btn) return;

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

    const old = document.getElementById(BTT_FAB_ID);
    if (old) old.remove();

    const fab = toElement(BACK_TO_TOP_HTML);
    document.body.appendChild(fab);

    bindBackToTop();
    ensureBackToTopScrollWatcher();
  }

  function removeExisting() {
    document.querySelectorAll(".home-link-wrap").forEach((el) => el.remove());
    document.querySelectorAll("footer.site-footer").forEach((el) => el.remove());

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
    } catch (_) {}
  }

  function injectStandard() {
    // ✅ DMMD 테마 먼저 적용(스타일 우선권 확보)
    applyDmmdTheme();

    removeExisting();

    // 1) (메인 제외) 홈 버튼 주입
    if (!isHomePage()) {
      const homeWrap = toElement(HOME_BUTTON_HTML);
      document.body.appendChild(homeWrap);
    }

    // 2) footer는 항상 body 맨 끝
    const footer = toElement(FOOTER_HTML);
    document.body.appendChild(footer);

    // 3) 홈 버튼을 footer "바로 위"로 이동
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
  }

  function init() {
    try {
      injectStandard();
    } catch (e) {
      console.error("footer.js init failed:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
