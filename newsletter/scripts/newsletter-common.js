(function () {
  function getRoot() {
    const raw = document.body?.dataset?.newsletterRoot || "/newsletter";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }

  function manifestHref(root = getRoot()) {
    return root + "/data/newsletters.json";
  }

  function articleDataHref(slug, root = getRoot()) {
    return root + "/data/articles/" + encodeURIComponent(slug || "") + ".json";
  }

  function detailHref(slug, root = getRoot()) {
    return root + "/detail/index.html?slug=" + encodeURIComponent(slug || "");
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

  async function fetchJsonOrNull(url) {
    try {
      return await fetchJson(url);
    } catch (_) {
      return null;
    }
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

    if (typeof value?.html === "string") {
      el.innerHTML = value.html;
      return;
    }

    if (value?.text !== undefined && value?.text !== null) {
      el.textContent = String(value.text);
    }
  }

  function richTextNode(tag, className, value) {
    const el = createEl(tag, className);
    setRichText(el, value);
    return el;
  }

  function appendChildren(parent, children) {
    (Array.isArray(children) ? children : []).filter(Boolean).forEach((child) => {
      parent.appendChild(child);
    });
    return parent;
  }

  function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function parseSlugFromLocation() {
    const url = new URL(window.location.href);
    return (url.searchParams.get("slug") || "").trim();
  }

  function sortByUpdatedDesc(items) {
    const list = [...normalizeArray(items)];
    const hasDatedEntry = list.some((item) => !!(Date.parse(item?.updatedAtIso || "") || 0));

    if (!hasDatedEntry) return list;

    return list.sort((a, b) => {
      const aa = Date.parse(a?.updatedAtIso || "") || 0;
      const bb = Date.parse(b?.updatedAtIso || "") || 0;
      return bb - aa;
    });
  }

  function getEntries(manifest) {
    return normalizeArray(manifest?.faqs?.length ? manifest.faqs : manifest?.articles);
  }

  function findCategory(manifest, categoryId) {
    return normalizeArray(manifest?.categories).find((item) => item.id === categoryId) || null;
  }

  function findEntry(manifest, slug) {
    return getEntries(manifest).find((item) => item.slug === slug) || null;
  }

  function getQuestion(item) {
    return item?.question || item?.title || "질문 없음";
  }

  function getAnswerLines(item) {
    const answerLines = normalizeArray(item?.answerLines);
    if (answerLines.length) return answerLines;

    const bullets = normalizeArray(item?.summaryBullets);
    if (bullets.length) return bullets;

    return item?.answer ? [item.answer] : [];
  }

  function getLatestEntry(manifest) {
    return sortByUpdatedDesc(getEntries(manifest))[0] || null;
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
      label.textContent = (item?.label || "").trim();
      li.appendChild(label);
      li.appendChild(document.createTextNode(": "));
      setRichText(li.appendChild(document.createElement("span")), item?.text || "");
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

  function renderFileCards(files) {
    const frag = document.createDocumentFragment();

    normalizeArray(files).forEach((file) => {
      const card = createEl("div", "card article-file-card");
      const titleWrap = createEl("div", "");
      const strong = createEl("b");
      strong.textContent = file?.title || "첨부파일";
      titleWrap.appendChild(strong);
      card.appendChild(titleWrap);

      if (file?.desc) {
        card.appendChild(createEl("div", "btn-desc", "·" + file.desc));
      }

      if (file?.href) {
        const row = createEl("div", "row gap");
        row.appendChild(
          createButtonLink(file.downloadLabel || "파일 다운로드", file.href, "btn", { download: true })
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
        const title = createEl("h3", "", block.cardTitle);
        title.style.marginTop = "0";
        wrap.appendChild(title);
      }
      wrap.appendChild(
        renderSimpleList(block.items, {
          className: block.className || "",
          ordered: !!block.ordered,
        })
      );
      return wrap;
    }

    if (block.type === "checklistCard") {
      const card = createEl("div", "card");
      const title = createEl("h3", "", block.title || "체크리스트");
      title.style.marginTop = "0";
      card.appendChild(title);
      card.appendChild(renderSimpleList(block.items, { className: "check-list" }));
      return card;
    }

    if (block.type === "gridCards") {
      const grid = createEl("div", "grid " + ((block.columns || 2) === 3 ? "three" : "two"));
      normalizeArray(block.cards).forEach((cardItem) => {
        const card = createEl("div", "card");
        const title = createEl("h3", "", cardItem?.title || "");
        title.style.marginTop = "0";
        card.appendChild(title);

        if (cardItem?.subtitle) {
          card.appendChild(createEl("p", "card-subtitle", cardItem.subtitle));
        }

        normalizeArray(cardItem?.paragraphs).forEach((text) => {
          card.appendChild(richTextNode("p", "", text));
        });

        if (normalizeArray(cardItem?.items).length) {
          card.appendChild(renderSimpleList(cardItem.items, { className: cardItem.listClassName || "check-list" }));
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

    if (block.type === "imageCards") {
      const grid = createEl("div", "grid " + ((block.columns || 2) === 3 ? "three" : "two"));
      normalizeArray(block.cards).forEach((cardItem) => {
        const card = createEl("div", "card article-image-card");
        const title = createEl("h3", "", cardItem?.title || "");
        title.style.marginTop = "0";
        card.appendChild(title);

        normalizeArray(cardItem?.paragraphs).forEach((text) => {
          card.appendChild(richTextNode("p", "", text));
        });

        if (cardItem?.src) {
          const figure = createEl("figure", "article-image-figure");
          const img = document.createElement("img");
          img.className = "article-image";
          img.src = cardItem.src;
          img.alt = cardItem.alt || cardItem.title || "안내 이미지";
          img.loading = "lazy";
          figure.appendChild(img);
          if (cardItem?.alt || cardItem?.caption) {
            figure.appendChild(createEl("figcaption", "article-image-caption", cardItem.caption || cardItem.alt));
          }
          card.appendChild(figure);
        }

        grid.appendChild(card);
      });
      return grid;
    }

    if (block.type === "steps") {
      const list = createEl("ol", "mini-steps");
      normalizeArray(block.items).forEach((item) => {
        const li = document.createElement("li");
        const strong = createEl("b", "", item?.title || "");
        li.appendChild(strong);
        li.appendChild(document.createTextNode(" "));
        setRichText(li.appendChild(document.createElement("span")), item?.text || "");
        list.appendChild(li);
      });
      return list;
    }

    if (block.type === "pathCard") {
      const card = createEl("div", "card");
      const title = createEl("h3", "", block.title || "참고 경로");
      title.style.marginTop = "0";
      card.appendChild(title);
      card.appendChild(createEl("div", "k-path", block.path || ""));
      if (block.note) {
        card.appendChild(createEl("p", "muted", block.note));
      }
      return card;
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
    sec.id = section?.id || "";
    sec.appendChild(createEl("h2", "", section?.title || ""));
    if (section?.subtitle) {
      sec.appendChild(createEl("p", "muted", section.subtitle));
    }
    sec.appendChild(document.createElement("hr"));

    normalizeArray(section?.blocks).forEach((block) => {
      const node = renderBlock(block);
      if (node) sec.appendChild(node);
    });

    return sec;
  }

  function renderError(container, title, message) {
    container.innerHTML = "";
    const box = createEl("div", "error-box");
    box.appendChild(createEl("h3", "", title || "오류"));
    if (message) {
      box.appendChild(createEl("p", "", message));
    }
    container.appendChild(box);
  }

  function ensureText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) {
      el.textContent = String(value);
    }
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function stripHtmlTags(value) {
    return String(value || "").replace(/<[^>]*>/g, " ");
  }

  function flattenSearchText(value) {
    if (value === undefined || value === null) return "";

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => flattenSearchText(item)).filter(Boolean).join(" ");
    }

    if (typeof value === "object") {
      if (typeof value.html === "string") {
        return stripHtmlTags(value.html);
      }

      return Object.values(value)
        .map((item) => flattenSearchText(item))
        .filter(Boolean)
        .join(" ");
    }

    return "";
  }

  function normalizeSearchText(value) {
    return flattenSearchText(value)
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenizeSearchQuery(query) {
    const normalized = normalizeSearchText(query);
    return normalized ? normalized.split(" ").filter(Boolean) : [];
  }

  function matchesSearchQuery(target, queryOrTokens) {
    const tokens = Array.isArray(queryOrTokens) ? queryOrTokens : tokenizeSearchQuery(queryOrTokens);
    if (!tokens.length) return true;

    const haystack = normalizeSearchText(target);
    const condensed = haystack.replace(/\s+/g, "");

    return tokens.every((token) => {
      const normalizedToken = normalizeSearchText(token);
      const condensedToken = normalizedToken.replace(/\s+/g, "");
      return haystack.includes(normalizedToken) || (!!condensedToken && condensed.includes(condensedToken));
    });
  }

  function getFaqSearchText(item, category) {
    return [
      getQuestion(item),
      item?.title,
      item?.subtitle,
      normalizeArray(item?.summaryBullets),
      getAnswerLines(item),
      normalizeArray(item?.keywords),
      normalizeArray(item?.references),
      category?.title,
      category?.subtitle,
      category?.dashboardDescription,
    ].map((part) => flattenSearchText(part)).join(" ");
  }

  function getSectionSearchText(section) {
    return [section?.title, section?.subtitle, flattenSearchText(section?.blocks)]
      .map((part) => flattenSearchText(part))
      .join(" ");
  }

  window.NewsletterCommon = {
    getRoot,
    manifestHref,
    articleDataHref,
    detailHref,
    indexHref,
    fetchJson,
    fetchJsonOrNull,
    createEl,
    setRichText,
    richTextNode,
    appendChildren,
    normalizeArray,
    parseSlugFromLocation,
    sortByUpdatedDesc,
    getEntries,
    findCategory,
    findEntry,
    getQuestion,
    getAnswerLines,
    getLatestEntry,
    renderSimpleList,
    renderSummaryList,
    renderStatusChips,
    createButtonLink,
    renderFileCards,
    renderBlock,
    renderSection,
    renderError,
    ensureText,
    scrollToId,
    stripHtmlTags,
    flattenSearchText,
    normalizeSearchText,
    tokenizeSearchQuery,
    matchesSearchQuery,
    getFaqSearchText,
    getSectionSearchText,
  };
})();
