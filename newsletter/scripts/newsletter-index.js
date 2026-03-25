(function () {
  const C = window.NewsletterCommon;

  if (!C) return;

  const state = {
    manifest: null,
    root: "",
    activeCategory: "all",
  };

  function categoryMap(manifest) {
    const map = new Map();
    C.normalizeArray(manifest?.categories).forEach((category) => {
      map.set(category.id, category);
    });
    return map;
  }

  function getLatestArticle(manifest) {
    return C.sortByUpdatedDesc(C.normalizeArray(manifest?.articles))[0] || null;
  }

  function renderIntro(manifest) {
    const introTarget = document.getElementById("intro-callout");
    const chipTarget = document.getElementById("status-chips");

    if (introTarget) {
      introTarget.innerHTML = "";
      const callout = C.createEl("div", "callout");
      callout.appendChild(C.renderSimpleList(manifest?.site?.introPoints || [], { className: "list-tight" }));
      introTarget.appendChild(callout);
    }

    if (chipTarget) {
      chipTarget.innerHTML = "";
      (manifest?.site?.statusChips || []).forEach((chip) => {
        const span = C.createEl("span", "chip");
        C.setRichText(span, chip);
        chipTarget.appendChild(span);
      });
    }
  }

  function renderHeroStats(manifest) {
    const target = document.getElementById("hero-stats");
    if (!target) return;

    const articles = C.normalizeArray(manifest?.articles);
    const categories = C.normalizeArray(manifest?.categories);
    const featured = articles.filter((item) => item.featured);
    const latest = getLatestArticle(manifest);
    const requiredCount = C.normalizeArray(manifest?.materials?.required).length;
    const principleCount = C.normalizeArray(manifest?.principles?.content).length + C.normalizeArray(manifest?.principles?.design).length;

    const cards = [
      {
        label: "추천 읽기",
        value: featured.length + "개",
        meta: "처음 읽기 좋은 안내를 모아두었습니다.",
        href: "#sec-featured",
      },
      {
        label: "분야별 뉴스레터",
        value: categories.length + "개",
        meta: "기초 행정부터 예산까지 분야별로 나뉩니다.",
        href: "#sec-categories",
      },
      {
        label: "전체 기사",
        value: articles.length + "개",
        meta: latest?.updatedAtText ? "최근 업데이트: " + latest.updatedAtText : "최신순으로 기사를 확인합니다.",
        href: "#sec-catalog",
      },
      {
        label: "자료 제출 안내",
        value: requiredCount + "개",
        meta: "행정실에 함께 주면 좋은 기본 자료입니다.",
        href: "#sec-materials",
      },
      {
        label: "작성 원칙",
        value: principleCount + "개",
        meta: "실무 중심으로 쓰는 공통 기준을 정리했습니다.",
        href: "#sec-principles",
      },
    ];

    target.innerHTML = "";
    cards.forEach((item) => {
      const card = document.createElement("a");
      card.className = "nl-stat-card nl-stat-card--link nl-stat-card--section";
      card.href = item.href;
      card.setAttribute("aria-label", item.label + " 섹션으로 이동");

      card.appendChild(C.createEl("p", "nl-stat-label", item.label));
      card.appendChild(C.createEl("p", "nl-stat-value", item.value));
      card.appendChild(C.createEl("p", "nl-stat-meta", item.meta));
      target.appendChild(card);
    });
  }

  function renderArticleCard(item, category, options = {}) {
    const root = options.root || state.root || C.getRoot();
    const href = item.href || C.detailHref(item.slug, root);
    const card = document.createElement("a");
    card.className = "nl-card nl-card--link nl-card--article";
    card.href = href;
    card.setAttribute("aria-label", (item.title || "뉴스레터") + " 상세페이지로 이동");

    const head = C.createEl("div", "nl-card-head");
    const topline = C.createEl("div", "nl-card-topline");
    const badge = C.createEl("span", "badge", category?.title || "뉴스레터");
    topline.appendChild(badge);

    if (item.updatedAtText) {
      topline.appendChild(C.createEl("span", "nl-card-date", "최종 업데이트: " + item.updatedAtText));
    }

    const title = C.createEl("h3", "nl-card-title", item.title || "제목 없음");

    head.appendChild(topline);
    head.appendChild(title);

    if (item.subtitle) {
      head.appendChild(C.createEl("p", "nl-card-sub", item.subtitle));
    }

    card.appendChild(head);

    const list = C.createEl("ul", "nl-card-list");
    C.normalizeArray(item.summaryBullets).slice(0, 3).forEach((bullet) => {
      const li = C.createEl("li", "", "·" + bullet);
      list.appendChild(li);
    });
    if (list.children.length) card.appendChild(list);

    const foot = C.createEl("div", "nl-card-foot");
    const metaRow = C.createEl("div", "nl-meta-row");

    if (category?.subtitle) {
      metaRow.appendChild(C.createEl("span", "nl-meta-chip", category.subtitle));
    }
    if (item.featured) {
      metaRow.appendChild(C.createEl("span", "nl-meta-chip", "추천 읽기"));
    }

    if (metaRow.children.length) {
      foot.appendChild(metaRow);
    }

    card.appendChild(foot);
    return card;
  }

  function renderCategoryDashboardCard(category, articles) {
    const latestArticle = C.sortByUpdatedDesc(articles)[0] || null;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "nl-card nl-card--button nl-card--filter";
    card.dataset.filterCategory = category.id || "";
    card.dataset.scrollTarget = "sec-catalog";
    card.setAttribute("aria-label", (category.title || "분야") + " 기사만 보기");

    const head = C.createEl("div", "nl-card-head");
    const topline = C.createEl("div", "nl-card-topline");
    topline.appendChild(C.createEl("span", "badge", "분야"));
    topline.appendChild(C.createEl("span", "nl-card-date", "기사 " + articles.length + "개"));
    head.appendChild(topline);

    const title = C.createEl("h3", "nl-card-title", category.title || "");
    head.appendChild(title);

    if (category.subtitle) {
      head.appendChild(C.createEl("p", "nl-card-sub", category.subtitle));
    }

    card.appendChild(head);

    const list = C.createEl("ul", "nl-card-list");
    C.normalizeArray(category.summaryBullets).slice(0, 3).forEach((bullet) => {
      list.appendChild(C.createEl("li", "", "·" + bullet));
    });
    if (list.children.length) {
      card.appendChild(list);
    }

    const foot = C.createEl("div", "nl-card-foot");
    const metaRow = C.createEl("div", "nl-meta-row");

    if (latestArticle?.updatedAtText) {
      metaRow.appendChild(C.createEl("span", "nl-meta-chip", "최신 " + latestArticle.updatedAtText));
    }
    if (metaRow.children.length) {
      foot.appendChild(metaRow);
    }

    foot.appendChild(
      C.createEl(
        "p",
        "nl-card-hint",
        category.groupDescription || "카드를 누르면 전체 기사 영역에서 이 분야만 모아 보여줍니다."
      )
    );
    card.appendChild(foot);
    return card;
  }

  function renderFeatured(manifest, root) {
    const target = document.getElementById("featured-list");
    if (!target) return;

    target.innerHTML = "";
    const categories = categoryMap(manifest);
    const featured = C.sortByUpdatedDesc(
      C.normalizeArray(manifest?.articles).filter((item) => item.featured)
    );

    if (!featured.length) {
      const box = C.createEl("div", "empty-box");
      box.appendChild(C.createEl("p", "", "표시할 추천 기사가 아직 없습니다."));
      target.appendChild(box);
      return;
    }

    featured.slice(0, 3).forEach((item) => {
      target.appendChild(renderArticleCard(item, categories.get(item.categoryId), { root }));
    });
  }

  function renderCategories(manifest) {
    const target = document.getElementById("category-list");
    if (!target) return;

    target.innerHTML = "";
    const articles = C.normalizeArray(manifest?.articles);

    C.normalizeArray(manifest?.categories).forEach((category) => {
      const categoryArticles = articles.filter((item) => item.categoryId === category.id);
      target.appendChild(renderCategoryDashboardCard(category, categoryArticles));
    });
  }

  function updateFilterButtons() {
    const buttons = document.querySelectorAll(".nl-filter-chip");
    buttons.forEach((button) => {
      const isActive = button.dataset.categoryId === state.activeCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function renderCatalogGrid() {
    const target = document.getElementById("catalog-grid");
    const count = document.getElementById("catalog-count");
    if (!target || !state.manifest) return;

    const categories = categoryMap(state.manifest);
    const allArticles = C.sortByUpdatedDesc(C.normalizeArray(state.manifest?.articles));
    const filtered = state.activeCategory === "all"
      ? allArticles
      : allArticles.filter((item) => item.categoryId === state.activeCategory);

    target.innerHTML = "";

    if (count) {
      const activeLabel = state.activeCategory === "all"
        ? "전체"
        : (categories.get(state.activeCategory)?.title || "선택 분야");
      count.textContent = activeLabel + " 기사 " + filtered.length + "개";
    }

    if (!filtered.length) {
      const box = C.createEl("div", "empty-box");
      box.appendChild(C.createEl("p", "", "선택한 분야에 등록된 기사가 없습니다."));
      target.appendChild(box);
      updateFilterButtons();
      return;
    }

    filtered.forEach((item) => {
      target.appendChild(renderArticleCard(item, categories.get(item.categoryId), { root: state.root }));
    });

    updateFilterButtons();
  }

  function renderCatalogFilters(manifest) {
    const target = document.getElementById("catalog-filters");
    if (!target) return;

    target.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = "chip nl-filter-chip is-active";
    allBtn.textContent = "전체";
    allBtn.dataset.categoryId = "all";
    allBtn.setAttribute("aria-pressed", "true");
    target.appendChild(allBtn);

    C.normalizeArray(manifest?.categories).forEach((category) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip nl-filter-chip";
      btn.textContent = category.title || "분야";
      btn.dataset.categoryId = category.id || "";
      btn.setAttribute("aria-pressed", "false");
      target.appendChild(btn);
    });

    target.addEventListener("click", (event) => {
      const button = event.target.closest(".nl-filter-chip");
      if (!button) return;
      state.activeCategory = button.dataset.categoryId || "all";
      renderCatalogGrid();
    });
  }

  function bindCategoryButtons() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter-category]");
      if (!button) return;
      state.activeCategory = button.dataset.filterCategory || "all";
      renderCatalogGrid();

      const scrollId = button.dataset.scrollTarget;
      if (scrollId) {
        const target = document.getElementById(scrollId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  function renderMaterials(manifest) {
    const required = document.getElementById("materials-required");
    const optional = document.getElementById("materials-optional");
    const example = document.getElementById("materials-example");

    if (required) {
      required.innerHTML = "";
      required.appendChild(C.renderSimpleList(manifest?.materials?.required || []));
    }

    if (optional) {
      optional.innerHTML = "";
      optional.appendChild(C.renderSimpleList(manifest?.materials?.optional || []));
    }

    if (example) {
      example.innerHTML = "";
      example.appendChild(C.renderSimpleList(manifest?.materials?.example || []));
    }
  }

  function renderPrinciples(manifest) {
    const content = document.getElementById("principles-content");
    const design = document.getElementById("principles-design");

    if (content) {
      content.innerHTML = "";
      content.appendChild(C.renderSimpleList(manifest?.principles?.content || []));
    }

    if (design) {
      design.innerHTML = "";
      design.appendChild(C.renderSimpleList(manifest?.principles?.design || []));
    }
  }

  function renderHeader(manifest) {
    C.ensureText("page-title", manifest?.site?.heading || "업무 뉴스레터");
    C.ensureText("page-subtitle", manifest?.site?.subtitle || "");
    if (manifest?.site?.pageTitle) {
      document.title = manifest.site.pageTitle;
    }
  }

  async function init() {
    const root = C.getRoot();
    const loading = document.getElementById("index-loading");
    const main = document.getElementById("index-render-area");
    state.root = root;

    try {
      const manifest = await C.fetchJson(C.manifestHref(root));
      state.manifest = manifest;

      renderHeader(manifest);
      renderIntro(manifest);
      renderHeroStats(manifest);
      renderFeatured(manifest, root);
      renderCategories(manifest);
      renderCatalogFilters(manifest);
      renderCatalogGrid();
      renderMaterials(manifest);
      renderPrinciples(manifest);
      bindCategoryButtons();

      if (loading) loading.hidden = true;
      if (main) main.hidden = false;
    } catch (error) {
      if (loading) loading.hidden = true;
      if (main) main.hidden = false;

      const target = document.getElementById("index-error");
      if (target) {
        target.hidden = false;
        C.renderError(
          target,
          "데이터를 불러오지 못했습니다.",
          "newsletters.json 경로와 JSON 문법을 확인해 주세요. 로컬에서는 file:// 대신 정적 서버나 실제 도메인으로 열어야 합니다."
        );
      }
      console.error(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
