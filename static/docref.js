/* /static/docref.js
 * 문서번호/지침 자동 주입 + 문구 템플릿 치환 유틸
 */
(function () {
  const DOC_URL = "/static/document-number.json";

  function $(sel, el = document) { return el.querySelector(sel); }
  function $$(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  }

  function safeStr(v) {
    return (v === null || v === undefined) ? "" : String(v);
  }

  function formatDoc(d) {
    if (!d) return { label: "-", number: "-", title: "-" };
    return {
      label: safeStr(d.label || "-"),
      number: safeStr(d.number || "-"),
      title: safeStr(d.title || "-")
    };
  }

  // 텍스트에서 토큰 치환
  // {{DOC:leave}} => "복무 지침(문서번호) 제목"
  // {{DOCNO:leave}} => "문서번호"
  // {{DOCTITLE:leave}} => "제목"
  // {{DOCLABEL:leave}} => "라벨"
  function applyTokens(text, docsMap) {
    if (!text) return text;
    return text
      .replace(/\{\{DOC:([a-zA-Z0-9_\-]+)\}\}/g, (_, id) => {
        const d = formatDoc(docsMap[id]);
        return `${d.label}(${d.number}) ${d.title}`.trim();
      })
      .replace(/\{\{DOCNO:([a-zA-Z0-9_\-]+)\}\}/g, (_, id) => formatDoc(docsMap[id]).number)
      .replace(/\{\{DOCTITLE:([a-zA-Z0-9_\-]+)\}\}/g, (_, id) => formatDoc(docsMap[id]).title)
      .replace(/\{\{DOCLABEL:([a-zA-Z0-9_\-]+)\}\}/g, (_, id) => formatDoc(docsMap[id]).label);
  }

  // [data-doc-id] 블록 주입
  // 예시:
  // <li data-doc-id="leave">
  //   <span data-doc-field="number"></span>
  // </li>
  function injectDocFields(docsMap) {
    $$("[data-doc-id]").forEach(node => {
      const id = node.getAttribute("data-doc-id");
      const doc = formatDoc(docsMap[id]);

      $$("[data-doc-field]", node).forEach(span => {
        const field = span.getAttribute("data-doc-field");
        if (field === "label") span.textContent = doc.label;
        else if (field === "number") span.textContent = doc.number;
        else if (field === "title") span.textContent = doc.title;
      });
    });
  }

  // 본문 텍스트 노드(선택된 영역) 치환
  function replaceTextInElements(docsMap) {
    // data-doc-text="1" 붙은 요소만 치환(안전)
    $$("[data-doc-text='1']").forEach(el => {
      el.innerHTML = applyTokens(el.innerHTML, docsMap);
    });

    // 복사 버튼도 치환
    $$(".copy,[data-copy]").forEach(btn => {
      if (!btn.dataset) return;
      if (btn.dataset.copy) btn.dataset.copy = applyTokens(btn.dataset.copy, docsMap);
    });
  }

  // 전역 공개(필요 시 다른 스크립트에서 사용)
  window.DocRef = {
    load: async function () {
      const data = await fetchJSON(DOC_URL);
      const docsMap = (data && data.docs) ? data.docs : {};
      injectDocFields(docsMap);
      replaceTextInElements(docsMap);
      return docsMap;
    },
    applyTokens
  };

  // 자동 실행
  document.addEventListener("DOMContentLoaded", () => {
    window.DocRef.load().catch(err => {
      console.warn("[DocRef] load failed:", err);
      const t = $("#toast");
      if (t) { t.textContent = "문서번호 로딩 실패(경로/권한 확인)"; t.style.display = "block"; }
    });
  });
})();
