(function () {
  const C = window.NewsletterCommon;

  if (!C) return;

  function renderMeta(article) {
    const target = document.getElementById("article-meta");
    if (!target) return;

    const refs = C.normalizeArray(article.references).join(", ");
    target.innerHTML = "";

    const line1 = document.createElement("span");
    line1.textContent = "·관련: " + (refs || "업데이트 예정");
    target.appendChild(line1);

    target.appendChild(document.createElement("br"));

    const line2 = document.createElement("span");
    line2.textContent = "·최종 업데이트: " + (article.updatedAtText || "업데이트 예정");
    target.appendChild(line2);
  }

  function renderSummary(article) {
    const target = document.getElementById("summary-list");
    if (!target) return;

    target.innerHTML = "";
    target.appendChild(C.renderSummaryList(article.summary || []));
  }

  function renderToc(article) {
    const target = document.getElementById("toc-chips");
    if (!target) return;

    target.innerHTML = "";
    C.normalizeArray(article.sections).forEach((section) => {
      const link = C.createEl("a", "chip");
      link.href = "#" + section.id;
      link.textContent = section.title;
      target.appendChild(link);
    });

    if (C.normalizeArray(article.files).length) {
      const fileChip = C.createEl("a", "chip");
      fileChip.href = "#sec-files";
      fileChip.textContent = "첨부파일";
      target.appendChild(fileChip);
    }

    if (C.normalizeArray(article.relatedSlugs).length) {
      const relatedChip = C.createEl("a", "chip");
      relatedChip.href = "#sec-related";
      relatedChip.textContent = "참고 자료";
      target.appendChild(relatedChip);
    }
  }

  function renderSections(article) {
    const target = document.getElementById("article-sections");
    if (!target) return;

    target.innerHTML = "";
    C.normalizeArray(article.sections).forEach((section) => {
      target.appendChild(C.renderSection(section));
    });
  }

  function renderFiles(article) {
    const section = document.getElementById("sec-files");
    const shortcut = document.getElementById("btn-files-shortcut");
    const body = document.getElementById("files-body");
    if (!section || !body) return;

    const files = C.normalizeArray(article.files);
    body.innerHTML = "";

    if (!files.length) {
      section.hidden = true;
      if (shortcut) shortcut.hidden = true;
      return;
    }

    section.hidden = false;
    if (shortcut) shortcut.hidden = false;
    body.appendChild(C.renderFileCards(files));
  }

  function renderRelated(article, manifest, root) {
    const section = document.getElementById("sec-related");
    const body = document.getElementById("related-body");
    if (!section || !body) return;

    const related = C.normalizeArray(article.relatedSlugs)
      .map((slug) => C.findArticleMeta(manifest, slug))
      .filter(Boolean);

    body.innerHTML = "";

    if (!related.length) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    const grid = C.createEl("div", "tool-grid");
    related.forEach((item) => {
      grid.appendChild(
        C.renderToolCard(
          {
            ...item,
            secondaryHref: C.indexHref(root),
            secondaryLabel: "대문으로",
          },
          { root }
        )
      );
    });
    body.appendChild(grid);
  }

  function setHeader(article, root) {
    const pageTitle = article.pageTitle || (article.title + "한 입 크기로 잘라먹기");
    document.title = pageTitle;
    C.ensureText("article-title", article.title || "상세 안내");
    C.ensureText("article-subtitle", article.lead || "필요한 내용만 짧고 간단하게 정리해서 안내드립니다.");
    const backLink = document.getElementById("btn-back-index");
    if (backLink) {
      backLink.href = article.indexPath || C.indexHref(root);
    }
  }

  function showError(title, message) {
    const loading = document.getElementById("detail-loading");
    const renderArea = document.getElementById("detail-render-area");
    const errorTarget = document.getElementById("detail-error");
    if (loading) loading.hidden = true;
    if (renderArea) renderArea.hidden = true;
    if (errorTarget) {
      errorTarget.hidden = false;
      C.renderError(errorTarget, title, message);
    }
  }

  async function init() {
    const root = C.getRoot();
    const slug = C.parseSlugFromLocation();

    if (!slug) {
      showError(
        "detail/index.html?slug=기사슬러그 형태로 접속해 주세요. 예: detail/index.html?slug=pre-establish-budget"
      );
      return;
    }

    try {
      const [manifest, article] = await Promise.all([
        C.fetchJson(C.manifestHref(root)),
        C.fetchJson(C.articleJsonHref(slug, root)),
      ]);

      setHeader(article, root);
      renderMeta(article);
      renderSummary(article);
      renderToc(article);
      renderSections(article);
      renderFiles(article);
      renderRelated(article, manifest, root);

      const loading = document.getElementById("detail-loading");
      const renderArea = document.getElementById("detail-render-area");
      if (loading) loading.hidden = true;
      if (renderArea) renderArea.hidden = false;
    } catch (error) {
      console.error(error);
      showError(
        "상세 데이터를 불러오지 못했습니다.",
        "articles/" + slug + "코드 확인 요망"
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
