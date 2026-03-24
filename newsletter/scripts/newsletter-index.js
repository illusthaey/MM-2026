(function () {
  const C = window.NewsletterCommon;

  if (!C) return;

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

  function renderFeatured(manifest, root) {
    const target = document.getElementById("featured-list");
    if (!target) return;

    target.innerHTML = "";
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
      target.appendChild(
        C.renderToolCard(
          {
            ...item,
            secondaryHref: item.secondaryHref || "#sec-materials",
            secondaryLabel: item.secondaryLabel || "자료 제출 방법",
          },
          { root }
        )
      );
    });
  }

  function renderCategories(manifest, root) {
    const target = document.getElementById("category-list");
    if (!target) return;

    target.innerHTML = "";
    const articles = C.normalizeArray(manifest?.articles);

    C.normalizeArray(manifest?.categories).forEach((category) => {
      const categoryArticles = C.sortByUpdatedDesc(
        articles.filter((item) => item.categoryId === category.id)
      );
      target.appendChild(
        C.renderCategoryCard(
          category,
          categoryArticles.length,
          categoryArticles[0] || null,
          { root }
        )
      );
    });
  }

  function renderCatalog(manifest, root) {
    const target = document.getElementById("catalog-groups");
    if (!target) return;

    target.innerHTML = "";
    const articles = C.normalizeArray(manifest?.articles);

    C.normalizeArray(manifest?.categories).forEach((category) => {
      const groupArticles = C.sortByUpdatedDesc(
        articles.filter((item) => item.categoryId === category.id)
      );

      const group = C.createEl("section", "catalog-group");
      group.id = "group-" + category.id;

      const head = C.createEl("div", "catalog-group-head");
      head.appendChild(C.createEl("h3", "", category.title));
      head.appendChild(C.createEl("span", "catalog-count", groupArticles.length + "개 기사"));
      group.appendChild(head);

      if (category.groupDescription) {
        group.appendChild(C.createEl("p", "muted", category.groupDescription));
      }

      if (!groupArticles.length) {
        const box = C.createEl("div", "card");
        box.appendChild(C.createEl("p", "", "아직 등록된 기사가 없습니다."));
        group.appendChild(box);
      } else {
        const grid = C.createEl("div", "catalog-grid");
        groupArticles.forEach((article) => {
          grid.appendChild(
            C.renderToolCard(
              {
                ...article,
                secondaryHref: "#sec-materials",
                secondaryLabel: "자료 제출 방법",
              },
              { root }
            )
          );
        });
        group.appendChild(grid);
      }

      target.appendChild(group);
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

    try {
      const manifest = await C.fetchJson(C.manifestHref(root));

      renderHeader(manifest);
      renderIntro(manifest);
      renderFeatured(manifest, root);
      renderCategories(manifest, root);
      renderCatalog(manifest, root);
      renderMaterials(manifest);
      renderPrinciples(manifest);

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