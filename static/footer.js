// /static/footer.js
// 목적: 페이지에 기존 footer/home 버튼이 있어도 "강제 덮어쓰기"로 표준 UI를 통일
// - 기존 footer.site-footer 제거
// - 기존 .home-link-wrap 제거
// - (메인 페이지 제외) home 버튼을 footer 바로 위에 삽입
// - footer는 항상 body 맨 끝에 삽입
// - footer-year에 올해 연도 자동 표기
// - fetch로 footer.html 불러오지 않음(단일 JS로 관리)

(function () {
  const FOOTER_HTML = `
<footer class="site-footer">
  <div class="shell">
    © <span id="footer-year"></span>.
    업무천재 고주무관. All rights reserved. · Contact: edusproutcomics@naver.com · 개인 제작·운영 웹페이지.<br/>
    </div>
</footer>
`.trim();

  // 요구사항에 맞춘 "정확한" 홈 버튼 마크업
  const HOME_BUTTON_HTML = `
<div class="home-link-wrap">
  <a class="btn" href="/">메인으로 돌아가기</a>
</div>
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

  function removeExisting() {
    // 기존에 HTML로 박혀 있던 것들까지 전부 제거 (강제 덮어쓰기)
    document.querySelectorAll(".home-link-wrap").forEach((el) => el.remove());
    document.querySelectorAll("footer.site-footer").forEach((el) => el.remove());
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
