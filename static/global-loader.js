// /static/global-loader.js
// 사이트 공통 스크립트 모음
// 기본: 우클릭 / 선택 / 복사 허용
// 옵션: 필요한 경우 부분 복사만 제한

(function () {
  "use strict";

  // -----------------------------
  // 1. 도메인 체크
  //    - 허용한 호스트에서만 공통 스크립트 동작
  // -----------------------------
  const host = location.hostname || "";
  const allowed = [
    "edusprouthaey.co.kr",
    "eduworkhaey.co.kr",
    "savinghaey.co.kr",
    "archivinghaey.co.kr",
    "localhost",
    "127.0.0.1"
  ];

  if (!allowed.includes(host)) {
    return;
  }

  // -----------------------------
  // 2. 옵션
  //    - window.HAEY_COPY_OPTIONS 로 페이지별 override 가능
  // -----------------------------
  const defaultOptions = {
    // 제목 뒤에 점 표시
    titleMark: true,

    // 기본값: 모두 허용
    allowRightClick: true,
    allowTextSelection: true,
    allowCopy: true,
    allowDrag: true,

    // true로 켜면 부분 복사 금지 적용
    partialCopyLock: false,

    // 부분 복사 금지 방식
    // - "replace-with-whole": 일부만 선택해도 해당 블록 전체 텍스트로 대체 복사
    // - "block": 일부 선택 복사를 차단
    partialCopyAction: "replace-with-whole",

    // 부분 복사 금지를 적용할 영역
    // 가장 권장: 복사 보호할 본문 영역에 data-copy-whole 속성 부여
    partialCopySelector:
      "[data-copy-whole], [data-no-partial-copy], article, main, .post-content, .entry-content, .content, body",

    // 이 영역 안에서는 부분 복사 허용
    // 코드블록, 입력창, data-copy-allow 영역은 예외 처리
    allowPartialCopySelector:
      "input, textarea, select, [contenteditable='true'], [contenteditable='plaintext-only'], [data-copy-allow], pre, code",

    // 안내 문구 표시
    notice: true,
    replaceNoticeMessage: "부분 복사는 제한되어 전체 내용으로 복사했습니다.",
    blockNoticeMessage: "부분 복사가 제한된 영역입니다. 전체 내용을 복사해 주세요.",

    // 개발자도구 감지 새로고침 옵션. 기본 비활성화.
    devtoolsReload: false,

    // 필요 시 F12, Ctrl+U 등만 막을 수 있음. 기본 비활성화.
    // 복사 허용을 위해 Ctrl+C / Ctrl+A는 차단하지 않음.
    blockDevShortcuts: false
  };

  const userOptions =
    typeof window.HAEY_COPY_OPTIONS === "object" && window.HAEY_COPY_OPTIONS
      ? window.HAEY_COPY_OPTIONS
      : {};

  const options = Object.assign({}, defaultOptions, userOptions);

  // -----------------------------
  // 3. 보호 모드 표시
  // -----------------------------
  if (options.titleMark) {
    try {
      document.title += " •";
    } catch (_) {}
  }

  // -----------------------------
  // 4. 우클릭 / 선택 / 복사 / 드래그 허용 또는 선택 차단
  //    - 기본은 아무것도 막지 않음
  // -----------------------------
  const stop = e => e.preventDefault();

  if (!options.allowRightClick) {
    document.addEventListener("contextmenu", stop, {
      capture: true,
      passive: false
    });
  }

  if (!options.allowTextSelection) {
    document.addEventListener("selectstart", stop, {
      capture: true,
      passive: false
    });
  }

  if (!options.allowDrag) {
    document.addEventListener("dragstart", stop, {
      capture: true,
      passive: false
    });
  }

  if (!options.allowCopy) {
    document.addEventListener("copy", stop, true);
  }

  // 이전 버전에서 inline user-select:none 이 남아 있는 경우를 대비
  try {
    if (
      options.allowTextSelection &&
      document.documentElement.style.userSelect === "none"
    ) {
      document.documentElement.style.userSelect = "";
    }

    if (
      options.allowTextSelection &&
      document.body &&
      document.body.style.userSelect === "none"
    ) {
      document.body.style.userSelect = "";
    }
  } catch (_) {}

  // -----------------------------
  // 5. 필요 시 개발자 단축키만 선택 차단
  //    - Ctrl+C / Ctrl+A는 복사 허용 목적상 차단하지 않음
  // -----------------------------
  if (options.blockDevShortcuts) {
    document.addEventListener(
      "keydown",
      e => {
        const k = (e.key || "").toLowerCase();
        const ctrlOrMeta = e.ctrlKey || e.metaKey;

        // F12
        if (e.keyCode === 123) {
          e.preventDefault();
          return;
        }

        // Ctrl/Cmd + U, S
        if (ctrlOrMeta && ["u", "s"].includes(k)) {
          e.preventDefault();
          return;
        }

        // Ctrl/Cmd + Shift + I, J, C, K
        if (
          ctrlOrMeta &&
          e.shiftKey &&
          ["i", "j", "c", "k"].includes(k)
        ) {
          e.preventDefault();
        }
      },
      true
    );
  }

  // -----------------------------
  // 6. 부분 복사 금지 옵션
  // -----------------------------
  function toElement(node) {
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  }

  function closestOrNull(element, selector) {
    if (!element || !selector) return null;

    try {
      return element.closest(selector);
    } catch (_) {
      return null;
    }
  }

  function normalizeText(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\u00A0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function getVisibleText(element) {
    if (!element) return "";

    const text =
      typeof element.innerText === "string"
        ? element.innerText
        : element.textContent;

    return normalizeText(text);
  }

  function getSelectionLockRoot(range) {
    const commonElement = toElement(range.commonAncestorContainer);
    const startElement = toElement(range.startContainer);
    const endElement = toElement(range.endContainer);

    // input, textarea, pre, code, data-copy-allow 등은 부분 복사 허용
    if (
      closestOrNull(commonElement, options.allowPartialCopySelector) ||
      closestOrNull(startElement, options.allowPartialCopySelector) ||
      closestOrNull(endElement, options.allowPartialCopySelector)
    ) {
      return null;
    }

    return closestOrNull(commonElement, options.partialCopySelector);
  }

  function setClipboardText(event, text) {
    const value = normalizeText(text);

    if (
      event.clipboardData &&
      typeof event.clipboardData.setData === "function"
    ) {
      event.clipboardData.setData("text/plain", value);
      return true;
    }

    if (
      window.clipboardData &&
      typeof window.clipboardData.setData === "function"
    ) {
      window.clipboardData.setData("Text", value);
      return true;
    }

    return false;
  }

  let noticeTimer = null;

  function showNotice(message) {
    if (!options.notice || !message) return;

    try {
      let box = document.getElementById("haey-copy-notice");

      if (!box) {
        box = document.createElement("div");
        box.id = "haey-copy-notice";
        box.setAttribute("role", "status");
        box.style.position = "fixed";
        box.style.left = "50%";
        box.style.bottom = "24px";
        box.style.transform = "translateX(-50%)";
        box.style.zIndex = "2147483647";
        box.style.maxWidth = "min(520px, calc(100vw - 32px))";
        box.style.padding = "10px 14px";
        box.style.border = "1px solid rgba(0, 0, 0, 0.16)";
        box.style.borderRadius = "10px";
        box.style.background = "#ffffff";
        box.style.color = "#111111";
        box.style.boxShadow = "0 8px 28px rgba(0, 0, 0, 0.16)";
        box.style.fontSize = "14px";
        box.style.lineHeight = "1.45";
        box.style.textAlign = "center";
        box.style.pointerEvents = "none";
        box.style.opacity = "0";
        box.style.transition = "opacity 160ms ease";
        document.body.appendChild(box);
      }

      box.textContent = message;
      box.style.opacity = "1";

      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => {
        box.style.opacity = "0";
      }, 1800);
    } catch (_) {}
  }

  if (options.partialCopyLock) {
    document.addEventListener(
      "copy",
      e => {
        if (!options.allowCopy) return;

        const selection = window.getSelection ? window.getSelection() : null;
        if (!selection || selection.rangeCount === 0) return;

        const selectedText = normalizeText(selection.toString());
        if (!selectedText) return;

        const range = selection.getRangeAt(0);
        const lockRoot = getSelectionLockRoot(range);

        // 잠금 대상 밖이면 일반 복사 허용
        if (!lockRoot) return;

        const wholeText = getVisibleText(lockRoot);

        // 전체 블록을 선택한 경우는 그대로 허용
        if (selectedText === wholeText) return;

        e.preventDefault();

        if (options.partialCopyAction === "replace-with-whole") {
          const copied = setClipboardText(e, wholeText);

          if (copied) {
            showNotice(options.replaceNoticeMessage);
          }

          return;
        }

        showNotice(options.blockNoticeMessage);
      },
      true
    );
  }

  // -----------------------------
  // 7. 콘솔(DevTools) 감지해서 새로고침하는 옵션
  //    - 기본은 꺼둠. 필요하면 window.HAEY_COPY_OPTIONS에서 true로 변경.
  // -----------------------------
  if (options.devtoolsReload) {
    setInterval(() => {
      const t = Date.now();

      // debugger에서 멈추면 시간 차이가 크게 나므로 감지 가능
      // eslint-disable-next-line no-debugger
      debugger;

      const d = Date.now() - t;

      if (d > 120) {
        location.reload();
      }
    }, 2000);
  }

  // -----------------------------
  // 8. 공통 로딩 관련 훅
  // -----------------------------
  // window.addEventListener("load", () => {
  //   console.log("global-loader.js loaded");
  // });
})();
