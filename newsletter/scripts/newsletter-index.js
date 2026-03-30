(function () {
  const C = window.NewsletterCommon;

  if (!C) return;

  const state = {
    root: "",
    manifest: null,
    activeCategory: "all",
    searchQuery: "",
  };

  function renderHeader(manifest) {
    C.ensureText("page-title", manifest?.site?.heading || manifest?.site?.pageTitle || "한 입 행정 FAQ");
    C.ensureText(
      "page-subtitle",
      manifest?.site?.subtitle || "자주 묻는 질문만 짧게 펼쳐보는 FAQ형 안내 페이지입니다."
    );

    if (manifest?.site?.pageTitle) {
      document.title = manifest.site.pageTitle;
    }
  }

  function renderDashboardIntro(manifest) {
    const introTarget = document.getElementById("dashboard-intro");
    const statusTarget = document.getElementById("dashboard-status");

    if (introTarget) {
      introTarget.innerHTML = "";
      const callout = C.createEl("div", "callout");
      callout.appendChild(
        C.renderSimpleList(manifest?.site?.introPoints || [], { className: "list-tight" })
      );
      introTarget.appendChild(callout);
    }

    if (statusTarget) {
      statusTarget.innerHTML = "";
      const chips = C.normalizeArray(manifest?.site?.statusChips);
      chips.forEach((chip) => {
        const span = C.createEl("span", "chip");
        C.setRichText(span, chip);
        statusTarget.appendChild(span);
      });
      statusTarget.hidden = !statusTarget.children.length;
    }
  }

  function renderOverviewStats(manifest) {
    const target = document.getElementById("overview-stats");
    if (!target) return;

    const entries = C.getEntries(manifest);
    const categories = C.normalizeArray(manifest?.categories);

    const cards = [
      {
        label: "전체 질문",
        value: entries.length + "개",
        meta: "현재 대문에서 바로 펼쳐볼 수 있는 FAQ 수입니다.",
      },
      {
        label: "분야",
        value: categories.length + "개",
        meta: "기초 행정부터 예산까지 분야별로 나누었습니다.",
      },
      {
        label: "검색",
        value: "질문·답변·키워드",
        meta: "전체 보기에서 원하는 표현을 바로 찾을 수 있습니다.",
      },
    ];

    target.innerHTML = "";
    cards.forEach((item) => {
      const card = C.createEl("article", "faq-overview-card");
      card.appendChild(C.createEl("p", "faq-overview-card__label", item.label));
      card.appendChild(C.createEl("p", "faq-overview-card__value", item.value));
      card.appendChild(C.createEl("p", "faq-overview-card__meta", item.meta));
      target.appendChild(card);
    });
  }

  function renderCategoryCards(manifest) {
    const target = document.getElementById("dashboard-category-grid");
    if (!target) return;

    const entries = C.getEntries(manifest);
    target.innerHTML = "";

    C.normalizeArray(manifest?.categories).forEach((category) => {
      const count = entries.filter((item) => item.categoryId === category.id).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "faq-category-card " + (category.buttonClass || "");
      button.dataset.filterCategory = category.id || "all";
      button.setAttribute("aria-label", (category.title || "분야") + " FAQ만 보기");

      const top = C.createEl("div", "faq-category-card__top");
      top.appendChild(C.createEl("span", "faq-category-card__label", "분야"));
      top.appendChild(C.createEl("span", "faq-category-card__count", count + "개"));
      button.appendChild(top);

      button.appendChild(C.createEl("h3", "faq-category-card__title", category.title || "분야"));
      button.appendChild(C.createEl("p", "faq-category-card__subtitle", category.subtitle || ""));
      button.appendChild(
        C.createEl(
          "p",
          "faq-category-card__desc",
          category.dashboardDescription || "카드를 누르면 전체 보기에서 이 분야만 모아 보여줍니다."
        )
      );

      target.appendChild(button);
    });
  }

  function updateFilterButtons() {
    const buttons = document.querySelectorAll(".faq-filter-chip");
    buttons.forEach((button) => {
      const isActive = button.dataset.categoryId === state.activeCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function renderFilterButtons(manifest) {
    const target = document.getElementById("faq-filters");
    if (!target) return;

    const entries = C.getEntries(manifest);
    target.innerHTML = "";

    const allButton = document.createElement("button");
    allButton.type = "button";
    allButton.className = "chip faq-filter-chip is-active";
    allButton.dataset.categoryId = "all";
    allButton.textContent = "전체 " + entries.length;
    allButton.setAttribute("aria-pressed", "true");
    target.appendChild(allButton);

    C.normalizeArray(manifest?.categories).forEach((category) => {
      const count = entries.filter((item) => item.categoryId === category.id).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip faq-filter-chip";
      button.dataset.categoryId = category.id || "";
      button.textContent = (category.title || "분야") + " " + count;
      button.setAttribute("aria-pressed", "false");
      target.appendChild(button);
    });
  }

  function createFaqCard(entry, category, options = {}) {
    const details = document.createElement("details");
    details.className = "faq-card";
    details.id = "faq-" + encodeURIComponent(entry.slug || "item");
    details.open = !!options.forceOpen;

    const summary = C.createEl("summary", "faq-card__summary");
    const top = C.createEl("div", "faq-card__topline");
    top.appendChild(C.createEl("span", "badge", category?.title || "FAQ"));
    summary.appendChild(top);
    summary.appendChild(C.createEl("h3", "faq-card__question", C.getQuestion(entry)));

    if (entry?.subtitle) {
      summary.appendChild(C.createEl("p", "faq-card__subtitle", entry.subtitle));
    }

    const previewChips = C.normalizeArray(entry?.summaryBullets).slice(0, 3);
    if (previewChips.length) {
      const chipRow = C.createEl("div", "faq-card__preview-chips");
      previewChips.forEach((chip) => {
        chipRow.appendChild(C.createEl("span", "faq-preview-chip", chip));
      });
      summary.appendChild(chipRow);
    }

    summary.appendChild(C.createEl("p", "faq-card__hint", "카드를 누르면 짧은 답변이 열립니다."));
    details.appendChild(summary);

    const body = C.createEl("div", "faq-card__body");
    body.appendChild(C.createEl("p", "faq-card__body-title", "짧게 보는 답변"));

    const answerLines = C.getAnswerLines(entry).slice(0, 10);
    if (answerLines.length) {
      body.appendChild(C.renderSimpleList(answerLines, { className: "faq-answer-list" }));
    } else {
      body.appendChild(C.createEl("p", "muted", "등록된 답변이 아직 없습니다."));
    }

    const metaRow = C.createEl("div", "faq-card__meta-row");
    C.normalizeArray(entry?.keywords).slice(0, 4).forEach((keyword) => {
      metaRow.appendChild(C.createEl("span", "faq-meta-chip", keyword));
    });
    C.normalizeArray(entry?.references).slice(0, 3).forEach((reference) => {
      metaRow.appendChild(C.createEl("span", "faq-ref-chip", reference));
    });
    if (metaRow.children.length) {
      body.appendChild(metaRow);
    }

    details.appendChild(body);
    return details;
  }

  function getFilteredEntries() {
    if (!state.manifest) return [];

    const tokens = C.tokenizeSearchQuery(state.searchQuery);
    const entries = C.sortByUpdatedDesc(C.getEntries(state.manifest));
    const categoryFiltered = state.activeCategory === "all"
      ? entries
      : entries.filter((item) => item.categoryId === state.activeCategory);

    return categoryFiltered.filter((entry) => {
      const category = C.findCategory(state.manifest, entry.categoryId);
      return C.matchesSearchQuery(C.getFaqSearchText(entry, category), tokens);
    });
  }

  function renderSearchStatus(resultCount, activeCategory) {
    const note = document.getElementById("faq-search-note");
    if (!note) return;

    if (!state.searchQuery.trim()) {
      note.textContent = "질문·답변·키워드·관련 문서까지 함께 찾습니다.";
      return;
    }

    note.textContent = "\"" + state.searchQuery.trim() + "\" 검색 결과: " + (activeCategory?.title || "전체") + " " + resultCount + "개";
  }

  function renderFaqList() {
    const target = document.getElementById("faq-list");
    const countTarget = document.getElementById("faq-count");
    if (!target || !state.manifest) return;

    const filtered = getFilteredEntries();
    const activeCategory = state.activeCategory === "all"
      ? null
      : C.findCategory(state.manifest, state.activeCategory);
    const hasSearch = !!state.searchQuery.trim();

    target.innerHTML = "";

    if (countTarget) {
      countTarget.textContent = (activeCategory?.title || "전체") + (hasSearch ? " 검색 결과 " : " FAQ ") + filtered.length + "개";
    }

    renderSearchStatus(filtered.length, activeCategory);

    if (!filtered.length) {
      const box = C.createEl("div", "empty-box");
      const message = hasSearch
        ? "현재 검색어에 맞는 질문이 없습니다. 다른 표현이나 띄어쓰기를 바꿔 다시 찾아보세요."
        : "선택한 분야에 등록된 질문이 없습니다.";
      box.appendChild(C.createEl("p", "", message));
      target.appendChild(box);
      updateFilterButtons();
      return;
    }

    filtered.forEach((entry) => {
      const category = C.findCategory(state.manifest, entry.categoryId);
      target.appendChild(createFaqCard(entry, category, { forceOpen: hasSearch }));
    });

    updateFilterButtons();
  }

  function syncSearchControls() {
    const input = document.getElementById("faq-search-input");
    const clearButton = document.getElementById("faq-search-clear");
    if (input && input.value !== state.searchQuery) {
      input.value = state.searchQuery;
    }
    if (clearButton) {
      clearButton.hidden = !state.searchQuery.trim();
    }
  }

  function bindActions() {
    const filterWrap = document.getElementById("faq-filters");
    const dashboardWrap = document.getElementById("dashboard-category-grid");
    const searchInput = document.getElementById("faq-search-input");
    const searchClear = document.getElementById("faq-search-clear");

    if (filterWrap && !filterWrap.dataset.bound) {
      filterWrap.dataset.bound = "1";
      filterWrap.addEventListener("click", (event) => {
        const button = event.target.closest(".faq-filter-chip");
        if (!button) return;
        state.activeCategory = button.dataset.categoryId || "all";
        renderFaqList();
        syncSearchControls();
      });
    }

    if (dashboardWrap && !dashboardWrap.dataset.bound) {
      dashboardWrap.dataset.bound = "1";
      dashboardWrap.addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter-category]");
        if (!button) return;
        state.activeCategory = button.dataset.filterCategory || "all";
        renderFaqList();
        syncSearchControls();
        C.scrollToId("sec-all");
      });
    }

    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "1";
      searchInput.addEventListener("input", () => {
        state.searchQuery = searchInput.value || "";
        renderFaqList();
        syncSearchControls();
      });
    }

    if (searchClear && !searchClear.dataset.bound) {
      searchClear.dataset.bound = "1";
      searchClear.addEventListener("click", () => {
        state.searchQuery = "";
        if (searchInput) searchInput.value = "";
        renderFaqList();
        syncSearchControls();
        if (searchInput) searchInput.focus();
      });
    }
  }

  async function init() {
    const root = C.getRoot();
    const loading = document.getElementById("index-loading");
    const renderArea = document.getElementById("index-render-area");
    const errorTarget = document.getElementById("index-error");
    state.root = root;

    try {
      const manifest = await C.fetchJson(C.manifestHref(root));
      state.manifest = manifest;

      renderHeader(manifest);
      renderDashboardIntro(manifest);
      renderOverviewStats(manifest);
      renderCategoryCards(manifest);
      renderFilterButtons(manifest);
      renderFaqList();
      bindActions();
      syncSearchControls();

      if (loading) loading.hidden = true;
      if (renderArea) renderArea.hidden = false;
    } catch (error) {
      console.error(error);
      if (loading) loading.hidden = true;
      if (renderArea) renderArea.hidden = true;
      if (errorTarget) {
        errorTarget.hidden = false;
        C.renderError(
          errorTarget,
          "FAQ 데이터를 불러오지 못했습니다.",
          "newsletters.json 경로와 JSON 문법을 확인해 주세요."
        );
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
