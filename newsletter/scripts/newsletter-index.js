(function () {
  const C = window.NewsletterCommon;

  if (!C) return;

  const state = {
    manifest: null,
    root: "",
    activeCategory: "all",
  };

  function renderHeader(manifest) {
    C.ensureText("page-title", manifest?.site?.heading || "한 입 크기로 잘라 먹는 행정 업무");
    C.ensureText("page-subtitle", manifest?.site?.subtitle || "");
    document.title = manifest?.site?.pageTitle || "한 입 행정 FAQ";
  }

  function renderDashboardIntro(manifest) {
    const introTarget = document.getElementById("dashboard-intro");
    const statusTarget = document.getElementById("dashboard-status");
    const latest = C.getLatestEntry(manifest);

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

      if (latest?.updatedAtText) {
        statusTarget.appendChild(C.createEl("span", "chip", "최근 수정 기준: " + latest.updatedAtText));
      }
    }
  }

  function renderOverviewStats(manifest) {
    const target = document.getElementById("overview-stats");
    if (!target) return;

    const entries = C.getEntries(manifest);
    const categories = C.normalizeArray(manifest?.categories);
    const latest = C.getLatestEntry(manifest);

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
        label: "최근 수정",
        value: latest?.updatedAtText || "-",
        meta: "가장 최근에 손본 질문 기준입니다.",
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

  function createFaqCard(entry, category) {
    const details = document.createElement("details");
    details.className = "faq-card";
    details.id = "faq-" + encodeURIComponent(entry.slug || "item");

    const summary = C.createEl("summary", "faq-card__summary");
    const top = C.createEl("div", "faq-card__topline");
    top.appendChild(C.createEl("span", "badge", category?.title || "FAQ"));

    if (entry?.updatedAtText) {
      top.appendChild(C.createEl("span", "faq-card__date", entry.updatedAtText));
    }

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

  function renderFaqList() {
    const target = document.getElementById("faq-list");
    const countTarget = document.getElementById("faq-count");
    if (!target || !state.manifest) return;

    const entries = C.sortByUpdatedDesc(C.getEntries(state.manifest));
    const filtered = state.activeCategory === "all"
      ? entries
      : entries.filter((item) => item.categoryId === state.activeCategory);

    const activeCategory = state.activeCategory === "all"
      ? null
      : C.findCategory(state.manifest, state.activeCategory);

    target.innerHTML = "";

    if (countTarget) {
      countTarget.textContent = (activeCategory?.title || "전체") + " FAQ " + filtered.length + "개";
    }

    if (!filtered.length) {
      const box = C.createEl("div", "empty-box");
      box.appendChild(C.createEl("p", "", "선택한 분야에 등록된 질문이 없습니다."));
      target.appendChild(box);
      updateFilterButtons();
      return;
    }

    filtered.forEach((entry) => {
      const category = C.findCategory(state.manifest, entry.categoryId);
      target.appendChild(createFaqCard(entry, category));
    });

    updateFilterButtons();
  }

  function bindActions() {
    const filterWrap = document.getElementById("faq-filters");
    const dashboardWrap = document.getElementById("dashboard-category-grid");

    if (filterWrap && !filterWrap.dataset.bound) {
      filterWrap.dataset.bound = "1";
      filterWrap.addEventListener("click", (event) => {
        const button = event.target.closest(".faq-filter-chip");
        if (!button) return;
        state.activeCategory = button.dataset.categoryId || "all";
        renderFaqList();
      });
    }

    if (dashboardWrap && !dashboardWrap.dataset.bound) {
      dashboardWrap.dataset.bound = "1";
      dashboardWrap.addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter-category]");
        if (!button) return;
        state.activeCategory = button.dataset.filterCategory || "all";
        renderFaqList();
        C.scrollToId("sec-all");
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
