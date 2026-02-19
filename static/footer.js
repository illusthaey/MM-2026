// /static/footer.js
// - footer.html fetch 없이, JS 하나로 푸터 DOM을 직접 삽입
// - 연도 자동 표기
// - (선택) 상세페이지에 "메인으로 돌아가기" 버튼을 footer 위에 자동 삽입

(function () {
  function isHomePage() {
    const path = (location.pathname || "/").toLowerCase();
    return path === "/" || path === "/index.html" || path === "/index.htm";
  }

  function ensureFooter() {
    // 이미 푸터 있으면 스킵 (중복 방지)
    if (document.querySelector("footer.site-footer")) return;

    const footer = document.createElement("footer");
    footer.className = "site-footer";

    // footer.html 내용 그대로 박아넣기 (id footer-year 유지)
    footer.innerHTML = `
      <div class="shell">
        © <span id="footer-year"></span>.
        업무천재 고주무관. All rights reserved. · Contact: edusproutcomics@naver.com · 개인 제작·운영 페이지.<br/>
        <br/>
        ※본 사이트는 현장 업무 편의를 위해 개인적으로 제작한 참고용 도구이며, 공식 업무 지침이나 법적 해석을 대체하지 않습니다. 또한 서버와 데이터베이스 없이 운영하기 때문에 업로드한 파일 내용이 저장되지 않습니다. 애초에 기술적으로 불가능해요. <br/>
      </div>
    `;

    document.body.appendChild(footer);
  }

  function setFooterYear() {
    const y = document.getElementById("footer-year");
    if (y) y.textContent = new Date().getFullYear();
  }

  // ===== (선택) 홈 버튼 자동 삽입 =====
  function ensureHomeButton() {
    // 메인에서는 만들지 않음
    if (isHomePage()) return;

    // 이미 존재하면 중복 생성 안 함
    if (document.querySelector(".home-link-wrap")) return;

    const wrap = document.createElement("div");
    wrap.className = "home-link-wrap";

    const a = document.createElement("a");
    a.className = "btn"; // 흰색 버튼 유지 (style.css 기본 .btn)
    a.href = "/";
    a.textContent = "메인으로 돌아가기";

    wrap.appendChild(a);

    // footer 바로 위에 삽입 (footer가 없으면 body 끝)
    const footer = document.querySelector("footer.site-footer, .site-footer, footer");
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(wrap, footer);
    } else {
      document.body.appendChild(wrap);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      ensureFooter();
      setFooterYear();

      // 홈버튼도 같이 켜고 싶으면 아래 줄 유지
      ensureHomeButton();
    } catch (e) {
      console.error("footer init failed:", e);
    }
  });
})();
