(function () {
  function getRoot() {
    const raw = document.body?.dataset?.newsletterRoot || "/newsletter";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }

  function manifestHref(root = getRoot()) {
    return root + "/data/newsletters.json";
  }

  function articleJsonHref(slug, root = getRoot()) {
    return root + "/data/articles/" + encodeURIComponent(slug) + ".json";
  }

  function detailHref(slug, root = getRoot()) {
    return root + "/detail/index.html?slug=" + encodeURIComponent(slug);
  }

  function indexHref(root = getRoot()) {
    return root + "/index.html";
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(response.status + " " + response.statusText + " - " + url);
    }

    return response.json();
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) {
      el.textContent = String(text);
    }
    return el;
  }

  function setRichText(el, value) {
    if (value === undefined || value === null) return;

    if (typeof value === "string" || typeof value === "number") {
      el.textContent = String(value);
      return;
    }

    if (typeof value.html === "string") {
      el.innerHTML = value.html;
      return;
    }

    if (value.text !== undefined && value.text !== null) {
      el.textContent = String(value.text);
    }
  }

  function appendChildren(parent, children) {
    children.filter(Boolean).forEach((child) => parent.appendChild(child));
    return parent;
  }

  function richTextNode(tag, className, value) {
    const el = createEl(tag, className);
    setRichText(el, value);
    return el;
  }

  function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function parseSlugFromLocation() {
    const url = new URL(window.location.href);
    return (url.searchParams.get("slug") || document.body?.dataset?.defaultSlug || "").trim();
  }

  function sortByUpdatedDesc(items) {
    return [...normalizeArray(items)].sort((a, b) => {
      const aa = Date.parse(a.updatedAtIso || "") || 0;
      const bb = Date.parse(b.updatedAtIso || "") || 0;
      return bb - aa;
    });
  }

  function findArticleMeta(manifest, slug) {
    return normalizeArray(manifest?.articles).find((item) => item.slug === slug) || null;
  }

  function findCategory(manifest, categoryId) {
    return normalizeArray(manifest?.categories).find((item) => item.id === categoryId) || null;
  }

  function renderSimpleList(items, options = {}) {
    const listTag = options.ordered ? "ol" : "ul";
    const list = createEl(listTag, options.className || "");
    normalizeArray(items).forEach((item) => {
      const li = document.createElement("li");
      if (typeof item === "string" || typeof item === "number") {
        li.textContent = String(item);
      } else if (item && typeof item === "object") {
        if (item.title && item.text) {
          const strong = createEl("b");
          strong.textContent = item.title;
          li.appendChild(strong);
          li.appendChild(document.createTextNode(" "));
          setRichText(li.appendChild(document.createElement("span")), item.text);
        } else if (typeof item.html === "string") {
          li.innerHTML = item.html;
        } else {
          li.textContent = String(item.text || "");
        }
      }
      list.appendChild(li);
    });
    return list;
  }

  function renderSummaryList(items) {
    const list = createEl("ul", "summary-list");
    normalizeArray(items).forEach((item) => {
      const li = document.createElement("li");
      const label = createEl("b");
      label.textContent = (item.label || "").trim();
      li.appendChild(label);
      li.appendChild(document.createTextNode(": "));
      setRichText(li.appendChild(document.createElement("span")), item.text || "");
      list.appendChild(li);
    });
    return list;
  }

  function renderStatusChips(items) {
    const row = createEl("div", "chip-row");
    normalizeArray(items).forEach((item) => {
      const chip = createEl("span", "chip");
      setRichText(chip, item);
      row.appendChild(chip);
    });
    return row;
  }

  function createButtonLink(label, href, className, extra = {}) {
    const a = createEl("a", className || "btn");
    a.href = href || "#";
    a.textContent = label || "바로가기";
    if (extra.target) a.target = extra.target;
    if (extra.rel) a.rel = extra.rel;
    if (extra.download) a.setAttribute("download", extra.download === true ? "" : extra.download);
    return a;
  }

  function renderToolCard(item, options = {}) {
    const root = options.root || getRoot();
    const article = createEl("article", "tool-card");
    const head = createEl("div", "tool-head");
    const title = createEl("p", "tool-title", item.title || "");
    const subtitle = createEl("p", "tool-sub", item.subtitle || "");
    head.appendChild(title);
    head.appendChild(subtitle);

    const body = createEl("div", "tool-body");
    const list = createEl("ul", "tool-list");
    normalizeArray(item.summaryBullets).forEach((bullet) => {
      const li = createEl("li");
      li.textContent = "·" + bullet;
      list.appendChild(li);
    });
    body.appendChild(list);

    if (item.updatedAtText) {
      body.appendChild(createEl("p", "tool-meta", "최종 업데이트: " + item.updatedAtText));
    }

    const row = createEl("div", "row gap");
    const primaryHref = item.href || detailHref(item.slug, root);
    row.appendChild(
      createButtonLink(
        item.primaryLabel || "상세 보기",
        primaryHref,
        "btn " + (item.buttonClass || "pastel-blue")
      )
    );

    if (item.secondaryHref) {
      row.appendChild(
        createButtonLink(
          item.secondaryLabel || "관련 항목",
          item.secondaryHref,
          "btn ghost"
        )
      );
    }

    body.appendChild(row);
    article.appendChild(head);
    article.appendChild(body);
    return article;
  }

  function renderCategoryCard(category, articleCount, latestArticle, options = {}) {
    const root = options.root || getRoot();
    const article = createEl("article", "tool-card");
    const head = createEl("div", "tool-head");
    head.appendChild(createEl("p", "tool-title", category.title || ""));
    head.appendChild(createEl("p", "tool-sub", category.subtitle || ""));
    article.appendChild(head);

    const body = createEl("div", "tool-body");
    const list = createEl("ul", "tool-list");
    normalizeArray(category.summaryBullets).forEach((bullet) => {
      const li = createEl("li");
      li.textContent = "·" + bullet;
      list.appendChild(li);
    });
    body.appendChild(list);

    const metaRow = createEl("div", "inline-chip-row");
    metaRow.appendChild(createEl("span", "inline-chip", "기사 " + articleCount + "개"));
    if (latestArticle?.updatedAtText) {
      metaRow.appendChild(createEl("span", "inline-chip", "최신 " + latestArticle.updatedAtText));
    }
    body.appendChild(metaRow);

    const row = createEl("div", "row gap");
    row.appendChild(
      createButtonLink(
        category.primaryLabel || "해당 분야 보기",
        "#group-" + encodeURIComponent(category.id || ""),
        "btn " + (category.buttonClass || "pastel-grey")
      )
    );

    if (latestArticle) {
      row.appendChild(
        createButtonLink(
          "최신 기사",
          detailHref(latestArticle.slug, root),
          "btn ghost"
        )
      );
    }

    body.appendChild(row);
    article.appendChild(body);
    return article;
  }

  function renderFileCards(files) {
    const frag = document.createDocumentFragment();

    normalizeArray(files).forEach((file) => {
      const card = createEl("div", "card article-file-card");
      card.appendChild(createEl("div", "", ""));
      const titleWrap = card.firstElementChild;
      const strong = createEl("b");
      strong.textContent = file.title || "첨부파일";
      titleWrap.appendChild(strong);

      if (file.desc) {
        card.appendChild(createEl("div", "btn-desc", "·" + file.desc));
      }

      if (file.href) {
        const row = createEl("div", "row gap");
        row.appendChild(
          createButtonLink(
            file.downloadLabel || "파일 다운로드",
            file.href,
            "btn",
            { download: true }
          )
        );
        row.appendChild(
          createButtonLink(
            file.viewLabel || "바로 보기",
            file.viewHref || file.href,
            "btn ghost",
            { target: "_blank", rel: "noopener" }
          )
        );
        card.appendChild(row);
      } else {
        card.appendChild(createEl("p", "muted", "※ 파일 링크가 아직 연결되지 않았습니다."));
      }

      frag.appendChild(card);
    });

    return frag;
  }

  function renderBlock(block) {
    if (!block || !block.type) return null;

    if (block.type === "paragraphs") {
      const wrap = createEl("div", "section-block");
      normalizeArray(block.items).forEach((item) => {
        wrap.appendChild(richTextNode("p", "", item));
      });
      return wrap;
    }

    if (block.type === "note") {
      const note = createEl("div", "quick-note");
      const strong = createEl("b");
      strong.textContent = (block.title || "실무 한 줄") + ": ";
      note.appendChild(strong);
      setRichText(note.appendChild(document.createElement("span")), block.text || "");
      return note;
    }

    if (block.type === "list") {
      const wrap = block.cardTitle ? createEl("div", "card") : createEl("div", "");
      if (block.cardTitle) {
        wrap.appendChild(createEl("h3", "", block.cardTitle));
      }
      wrap.appendChild(renderSimpleList(block.items, { className: block.className || "" , ordered: !!block.ordered }));
      return wrap;
    }

    if (block.type === "checklistCard") {
      const card = createEl("div", "card");
      const title = createEl("h3");
      title.style.marginTop = "0";
      title.textContent = block.title || "";
      card.appendChild(title);
      card.appendChild(renderSimpleList(block.items, { className: "check-list" }));
      return card;
    }

    if (block.type === "gridCards") {
      const grid = createEl("div", "grid " + ((block.columns || 2) === 3 ? "three" : "two"));
      normalizeArray(block.cards).forEach((cardItem) => {
        const card = createEl("div", "card");
        const title = createEl("h3");
        title.style.marginTop = "0";
        title.textContent = cardItem.title || "";
        card.appendChild(title);

        if (cardItem.subtitle) {
          card.appendChild(createEl("p", "card-subtitle", cardItem.subtitle));
        }

        normalizeArray(cardItem.paragraphs).forEach((text) => {
          card.appendChild(richTextNode("p", "", text));
        });

        if (normalizeArray(cardItem.items).length) {
          card.appendChild(renderSimpleList(cardItem.items, { className: cardItem.listClassName || "check-list" }));
        }

        if (cardItem.buttonHref) {
          const row = createEl("div", "row gap");
          row.appendChild(
            createButtonLink(
              cardItem.buttonLabel || "바로가기",
              cardItem.buttonHref,
              "btn " + (cardItem.buttonClass || "ghost")
            )
          );
          card.appendChild(row);
        }

        grid.appendChild(card);
      });
      return grid;
    }

    if (block.type === "table") {
      const wrap = createEl("div", "table-wrap");
      const table = createEl("table", "sheetlike simple-table");
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");

      normalizeArray(block.columns).forEach((col) => {
        const th = document.createElement("th");
        if (typeof col === "string") th.textContent = col;
        else setRichText(th, col);
        headRow.appendChild(th);
      });

      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      normalizeArray(block.rows).forEach((rowData) => {
        const tr = document.createElement("tr");
        normalizeArray(rowData).forEach((cellData) => {
          const td = document.createElement("td");
          if (cellData && typeof cellData === "object") {
            if (cellData.className) td.className = cellData.className;
            setRichText(td, cellData);
          } else {
            td.textContent = String(cellData ?? "");
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);

      if (block.note) {
        wrap.appendChild(createEl("p", "note", block.note));
      }

      return wrap;
    }

    if (block.type === "steps") {
      const list = createEl("ol", "mini-steps");
      normalizeArray(block.items).forEach((item) => {
        const li = document.createElement("li");
        const strong = createEl("b");
        strong.textContent = item.title || "";
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" "));
        setRichText(li.appendChild(document.createElement("span")), item.text || "");
        list.appendChild(li);
      });
      return list;
    }

    if (block.type === "pathCard") {
      const card = createEl("div", "card");
      const title = createEl("h3");
      title.style.marginTop = "0";
      title.textContent = block.title || "참고 경로";
      card.appendChild(title);
      card.appendChild(createEl("div", "k-path", block.path || ""));
      if (block.note) {
        card.appendChild(createEl("p", "muted", block.note));
      }
      return card;
    }

    if (block.type === "imageCards") {
      const grid = createEl("div", "grid " + ((block.columns || 2) === 3 ? "three" : "two"));
      normalizeArray(block.cards).forEach((item) => {
        const card = createEl("div", "card");
        const title = createEl("h3");
        title.style.marginTop = "0";
        title.textContent = item.title || "";
        card.appendChild(title);

        normalizeArray(item.paragraphs).forEach((text) => {
          card.appendChild(richTextNode("p", "", text));
        });

        const figure = createEl("figure", "tool-shot");
        const details = createEl("details", "img-zoom");
        const summary = document.createElement("summary");
        const img = document.createElement("img");
        img.src = item.src || "";
        img.alt = item.alt || item.title || "안내 이미지";
        img.className = "tool-thumb thumb";
        img.loading = "lazy";
        summary.appendChild(img);
        details.appendChild(summary);
        figure.appendChild(details);
        card.appendChild(figure);
        grid.appendChild(card);
      });
      return grid;
    }

    if (block.type === "files") {
      const wrap = createEl("div", "");
      wrap.appendChild(renderFileCards(block.items));
      return wrap;
    }

    return null;
  }

  function renderSection(section) {
    const sec = createEl("section", "section content");
    sec.id = section.id || "";
    sec.appendChild(createEl("h2", "", section.title || ""));
    if (section.subtitle) {
      sec.appendChild(createEl("p", "muted", section.subtitle));
    }
    sec.appendChild(document.createElement("hr"));

    normalizeArray(section.blocks).forEach((block) => {
      const node = renderBlock(block);
      if (node) sec.appendChild(node);
    });

    return sec;
  }

  function renderError(container, title, message) {
    container.innerHTML = "";
    const box = createEl("div", "error-box");
    box.appendChild(createEl("h3", "", title));
    box.appendChild(createEl("p", "", message));
    container.appendChild(box);
  }

  function ensureText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
      el.textContent = String(value);
    }
  }

  window.NewsletterCommon = {
    getRoot,
    manifestHref,
    articleJsonHref,
    detailHref,
    indexHref,
    fetchJson,
    createEl,
    setRichText,
    appendChildren,
    richTextNode,
    normalizeArray,
    parseSlugFromLocation,
    sortByUpdatedDesc,
    findArticleMeta,
    findCategory,
    renderSimpleList,
    renderSummaryList,
    renderStatusChips,
    createButtonLink,
    renderToolCard,
    renderCategoryCard,
    renderFileCards,
    renderBlock,
    renderSection,
    renderError,
    ensureText,
  };
})();
