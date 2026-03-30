(function () {
  const C = window.NewsletterCommon;

  if (!C) return;

  const state = {
    root: "",
    manifest: null,
    entry: null,
    category: null,
    summaryItems: [],
    sections: [],
    relatedItems: [],
    searchQuery: "",
  };

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

  function getDisplayTitle(entry) {
    return entry?.title || C.getQuestion(entry);
  }

  function buildSummaryItems(entry, category) {
    return C.normalizeArray(entry?.summary).length ? entry.summary : autoSummary(entry, category);
  }

  function buildSections(entry) {
    if (C.normalizeArray(entry?.sections).length) return entry.sections;
    if (C.normalizeArray(entry?.detailSections).length) return entry.detailSections;
    return autoSections(entry);
  }

  function renderMeta(entry, category) {
    const target = document.getElementById("article-meta");
    if (!target) return;

    target.innerHTML = "";

    const line1 = document.createElement("span");
    line1.textContent = "·분야: " + (category?.title || "미분류");
    target.appendChild(line1);

    if (C.normalizeArray(entry?.references).length) {
      target.appendChild(document.createElement("br"));
      const line2 = document.createElement("span");
      line2.textContent = "·관련 문서: " + entry.references.join(", ");
      target.appendChild(line2);
    }
  }

  function renderSummary(summaryItems) {
    const target = document.getElementById("summary-list");
    if (!target) return;
    target.innerHTML = "";
    target.appendChild(C.renderSummaryList(summaryItems));
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

  function renderSections(sections) {
    const target = document.getElementById("article-sections");
    if (!target) return;

    target.innerHTML = "";
    sections.forEach((section) => {
      target.appendChild(C.renderSection(section));
    });
  }

  function collectRelated(entry, manifest) {
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

    return merged.slice(0, 3);
  }

  function renderRelated(relatedItems, manifest, root) {
    const section = document.getElementById("sec-related");
    const body = document.getElementById("related-body");
    if (!section || !body) return false;

    body.innerHTML = "";

    if (!relatedItems.length) {
      section.hidden = true;
      return false;
    }

    section.hidden = false;
    relatedItems.forEach((item) => {
      const category = C.findCategory(manifest, item.categoryId);
      const card = C.createButtonLink(C.getQuestion(item), C.detailHref(item.slug, root), "faq-related-link");
      const wrap = C.createEl("article", "faq-related-card");
      const top = C.createEl("div", "faq-related-card__top");
      top.appendChild(C.createEl("span", "badge", category?.title || "FAQ"));
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
    const title = getDisplayTitle(entry);
    document.title = entry?.pageTitle || (title + " | 한 입 행정 FAQ");
    C.ensureText("article-title", title);
    C.ensureText(
      "article-subtitle",
      entry?.lead || entry?.subtitle || (category?.title ? category.title + " FAQ 상세" : "FAQ 상세")
    );

    const backLink = document.getElementById("btn-back-index");
    if (backLink) {
      backLink.href = entry?.indexPath || C.indexHref(root);
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

  function renderSearchStatus(totalCount) {
    const status = document.getElementById("detail-search-status");
    if (!status) return;

    if (!state.searchQuery.trim()) {
      status.textContent = "제목·요약·본문·관련 질문까지 한 번에 찾습니다.";
      return;
    }

    status.textContent = "\"" + state.searchQuery.trim() + "\" 검색 결과: " + totalCount + "개";
  }

  function applySearch(query) {
    state.searchQuery = query || "";
    const tokens = C.tokenizeSearchQuery(state.searchQuery);
    const hasSearch = !!tokens.length;

    const summaryCard = document.getElementById("detail-summary-card");
    const summaryMatch = C.matchesSearchQuery(state.summaryItems, tokens);
    if (summaryCard) {
      summaryCard.hidden = hasSearch ? !summaryMatch : false;
    }

    const sectionNodes = Array.from(document.querySelectorAll("#article-sections > section"));
    let visibleSectionCount = 0;
    const visibleSections = [];

    sectionNodes.forEach((node, index) => {
      const match = C.matchesSearchQuery(C.getSectionSearchText(state.sections[index]), tokens);
      node.hidden = hasSearch ? !match : false;
      if (!node.hidden) {
        visibleSectionCount += 1;
        visibleSections.push(state.sections[index]);
      }
    });

    const relatedSection = document.getElementById("sec-related");
    const relatedCards = Array.from(document.querySelectorAll("#related-body .faq-related-card"));
    let visibleRelatedCount = 0;

    relatedCards.forEach((node, index) => {
      const item = state.relatedItems[index];
      const category = C.findCategory(state.manifest, item?.categoryId);
      const match = C.matchesSearchQuery(C.getFaqSearchText(item, category), tokens);
      node.hidden = hasSearch ? !match : false;
      if (!node.hidden) {
        visibleRelatedCount += 1;
      }
    });

    if (relatedSection) {
      relatedSection.hidden = hasSearch ? visibleRelatedCount === 0 : state.relatedItems.length === 0;
    }

    renderToc(visibleSections, visibleRelatedCount > 0);

    const totalCount = (summaryCard && !summaryCard.hidden ? 1 : 0) + visibleSectionCount + visibleRelatedCount;
    renderSearchStatus(totalCount);

    const emptyBox = document.getElementById("detail-search-empty");
    if (emptyBox) {
      emptyBox.hidden = !hasSearch || totalCount > 0;
    }

    const clearButton = document.getElementById("detail-search-clear");
    if (clearButton) {
      clearButton.hidden = !hasSearch;
    }
  }

  function syncSearchControls() {
    const input = document.getElementById("detail-search-input");
    const clearButton = document.getElementById("detail-search-clear");

    if (input && input.value !== state.searchQuery) {
      input.value = state.searchQuery;
    }

    if (clearButton) {
      clearButton.hidden = !state.searchQuery.trim();
    }
  }

  function bindSearch() {
    const input = document.getElementById("detail-search-input");
    const clearButton = document.getElementById("detail-search-clear");

    if (input && !input.dataset.bound) {
      input.dataset.bound = "1";
      input.addEventListener("input", () => {
        applySearch(input.value || "");
        syncSearchControls();
      });
    }

    if (clearButton && !clearButton.dataset.bound) {
      clearButton.dataset.bound = "1";
      clearButton.addEventListener("click", () => {
        state.searchQuery = "";
        if (input) input.value = "";
        applySearch("");
        syncSearchControls();
        if (input) input.focus();
      });
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
      const baseEntry = C.findEntry(manifest, slug);

      if (!baseEntry) {
        showError("요청한 질문을 찾지 못했습니다.", "newsletters.json 안의 slug를 확인해 주세요.");
        return;
      }

      const articleData = await C.fetchJsonOrNull(C.articleDataHref(slug, root));
      const entry = {
        ...baseEntry,
        ...(articleData || {}),
        references: C.normalizeArray(articleData?.references).length ? articleData.references : baseEntry.references,
        relatedSlugs: C.normalizeArray(articleData?.relatedSlugs).length ? articleData.relatedSlugs : baseEntry.relatedSlugs,
      };

      const category = C.findCategory(manifest, entry.categoryId);
      const summaryItems = buildSummaryItems(entry, category);
      const sections = buildSections(entry);
      const relatedItems = collectRelated(entry, manifest);

      state.root = root;
      state.manifest = manifest;
      state.entry = entry;
      state.category = category;
      state.summaryItems = summaryItems;
      state.sections = sections;
      state.relatedItems = relatedItems;

      setHeader(entry, category, root);
      renderMeta(entry, category);
      renderSummary(summaryItems);
      renderSections(sections);
      const hasRelated = renderRelated(relatedItems, manifest, root);
      renderToc(sections, hasRelated);
      bindSearch();
      applySearch("");
      syncSearchControls();

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
