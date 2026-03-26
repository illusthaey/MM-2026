(function () {
  const C = window.NewsletterCommon;

  if (!C) return;

  function autoSummary(entry, category) {
    const answerLines = C.getAnswerLines(entry);
    return [
      { label: "질문", text: C.getQuestion(entry) },
      { label: "한 줄 정리", text: answerLines[0] || "등록된 답변이 아직 없습니다." },
      { label: "분야", text: category?.title || "미분류" },
    ];
  }

  function autoSections(entry) {
    const sections = [];
    const answerLines = C.getAnswerLines(entry);

    sections.push({
      id: "sec-answer",
      title: "1. 짧게 보는 답변",
      subtitle: "·대문 카드에서 펼쳐지는 답변을 한 번 더 정리합니다.",
      blocks: [
        {
          type: "list",
          cardTitle: "바로 확인할 핵심",
          className: "faq-answer-list",
          items: answerLines.length ? answerLines.slice(0, 10) : ["등록된 답변이 아직 없습니다."],
        },
      ],
    });

    if (C.normalizeArray(entry?.references).length) {
      sections.push({
        id: "sec-reference",
        title: "2. 같이 보면 좋은 문서",
        subtitle: "·업무 판단이 헷갈릴 때 먼저 펼쳐볼 문서입니다.",
        blocks: [
          {
            type: "list",
            cardTitle: "관련 문서",
            items: entry.references,
          },
        ],
      });
    }

    if (C.normalizeArray(entry?.summaryBullets).length) {
      sections.push({
        id: "sec-check",
        title: "3. 같이 기억할 포인트",
        subtitle: "·질문 주변에서 함께 보는 체크 포인트입니다.",
        blocks: [
          {
            type: "checklistCard",
            title: "체크 포인트",
            items: entry.summaryBullets,
          },
        ],
      });
    }

    return sections;
  }

  function renderMeta(entry, category) {
    const target = document.getElementById("article-meta");
    if (!target) return;

    target.innerHTML = "";

    const line1 = document.createElement("span");
    line1.textContent = "·분야: " + (category?.title || "미분류");
    target.appendChild(line1);
    target.appendChild(document.createElement("br"));

    const line2 = document.createElement("span");
    line2.textContent = "·최종 업데이트: " + (entry?.updatedAtText || "업데이트 예정");
    target.appendChild(line2);

    if (C.normalizeArray(entry?.references).length) {
      target.appendChild(document.createElement("br"));
      const line3 = document.createElement("span");
      line3.textContent = "·관련 문서: " + entry.references.join(", ");
      target.appendChild(line3);
    }
  }

  function renderSummary(entry, category) {
    const target = document.getElementById("summary-list");
    if (!target) return;
    target.innerHTML = "";
    target.appendChild(C.renderSummaryList(autoSummary(entry, category)));
  }

  function renderToc(sections, hasRelated) {
    const wrap = document.getElementById("detail-toc-wrap");
    const target = document.getElementById("toc-chips");
    if (!wrap || !target) return;

    target.innerHTML = "";

    C.normalizeArray(sections).forEach((section) => {
      const link = C.createEl("a", "chip");
      link.href = "#" + section.id;
      link.textContent = section.title;
      target.appendChild(link);
    });

    if (hasRelated) {
      const related = C.createEl("a", "chip");
      related.href = "#sec-related";
      related.textContent = "같이 보면 좋은 질문";
      target.appendChild(related);
    }

    wrap.hidden = !target.children.length;
  }

  function renderSections(entry) {
    const target = document.getElementById("article-sections");
    if (!target) return [];

    const sections = C.normalizeArray(entry?.detailSections).length
      ? entry.detailSections
      : autoSections(entry);

    target.innerHTML = "";
    sections.forEach((section) => {
      target.appendChild(C.renderSection(section));
    });
    return sections;
  }

  function renderRelated(entry, manifest, root) {
    const section = document.getElementById("sec-related");
    const body = document.getElementById("related-body");
    if (!section || !body) return false;

    const explicit = C.normalizeArray(entry?.relatedSlugs)
      .map((slug) => C.findEntry(manifest, slug))
      .filter(Boolean);

    const sameCategory = C.getEntries(manifest)
      .filter((item) => item.slug !== entry.slug && item.categoryId === entry.categoryId)
      .slice(0, 3);

    const merged = [];
    [...explicit, ...sameCategory].forEach((item) => {
      if (!merged.find((saved) => saved.slug === item.slug)) {
        merged.push(item);
      }
    });

    body.innerHTML = "";

    if (!merged.length) {
      section.hidden = true;
      return false;
    }

    section.hidden = false;
    merged.slice(0, 3).forEach((item) => {
      const category = C.findCategory(manifest, item.categoryId);
      const card = C.createButtonLink(C.getQuestion(item), C.detailHref(item.slug, root), "faq-related-link");
      const wrap = C.createEl("article", "faq-related-card");
      const top = C.createEl("div", "faq-related-card__top");
      top.appendChild(C.createEl("span", "badge", category?.title || "FAQ"));
      if (item?.updatedAtText) {
        top.appendChild(C.createEl("span", "faq-card__date", item.updatedAtText));
      }
      wrap.appendChild(top);
      wrap.appendChild(card);

      const answerLines = C.getAnswerLines(item);
      if (answerLines.length) {
        wrap.appendChild(C.createEl("p", "faq-related-card__text", answerLines[0]));
      }
      body.appendChild(wrap);
    });

    return true;
  }

  function setHeader(entry, category, root) {
    const title = C.getQuestion(entry);
    document.title = title + " | 한 입 행정 FAQ";
    C.ensureText("article-title", title);
    C.ensureText("article-subtitle", entry?.subtitle || (category?.title || "") + " FAQ 상세");
    const backLink = document.getElementById("btn-back-index");
    if (backLink) {
      backLink.href = C.indexHref(root);
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
      showError("detail/index.html?slug=질문슬러그 형태로 접속해 주세요.");
      return;
    }

    try {
      const manifest = await C.fetchJson(C.manifestHref(root));
      const entry = C.findEntry(manifest, slug);

      if (!entry) {
        showError("요청한 질문을 찾지 못했습니다.", "newsletters.json 안의 slug를 확인해 주세요.");
        return;
      }

      const category = C.findCategory(manifest, entry.categoryId);
      setHeader(entry, category, root);
      renderMeta(entry, category);
      renderSummary(entry, category);
      const sections = renderSections(entry);
      const hasRelated = renderRelated(entry, manifest, root);
      renderToc(sections, hasRelated);

      const loading = document.getElementById("detail-loading");
      const renderArea = document.getElementById("detail-render-area");
      if (loading) loading.hidden = true;
      if (renderArea) renderArea.hidden = false;
    } catch (error) {
      console.error(error);
      showError("상세 데이터를 불러오지 못했습니다.", "newsletters.json 경로와 JSON 문법을 확인해 주세요.");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
