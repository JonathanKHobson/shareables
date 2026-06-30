const state = {
  data: null,
  searchTerm: ""
};

const byId = (id) => document.getElementById(id);

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function renderOverview(data) {
  byId("question-count").textContent = data.recommendations.length;
  byId("source-count").textContent = data.sources.length;
  byId("primary-question").textContent = data.projectContext.primaryQuestion;

  const filters = byId("measurement-filters");
  filters.innerHTML = "";
  data.projectContext.measurementFilters.forEach((filter) => {
    filters.appendChild(el("li", { text: filter }));
  });
}

function renderRecommendations(data) {
  const list = byId("recommendation-list");
  list.innerHTML = "";

  data.recommendations.forEach((rec, index) => {
    const details = el("details", {
      className: "recommendation",
      id: rec.id,
      open: index === 0 ? "" : null
    });

    const summary = el("summary", { className: "rec-summary" }, [
      el("span", { className: "rank-badge", text: rec.rank }),
      el("span", {}, [
        el("span", { className: "rec-title-row" }, [
          el("h3", { text: rec.title }),
          el("span", { className: "type-pill", text: `${rec.sourceIds.length} sources` })
        ]),
        el("p", { className: "question", text: rec.question })
      ])
    ]);

    const tagRow = el("div", { className: "tag-row" });
    rec.tags.forEach((tag) => tagRow.appendChild(el("span", { className: "pill", text: tag })));

    const sourceRow = el("div", { className: "source-chip-row" });
    rec.sourceIds.forEach((sourceId) => {
      const source = data.sources.find((item) => item.id === sourceId);
      sourceRow.appendChild(el("a", {
        className: "source-chip",
        href: `#source-${sourceId}`,
        text: `${sourceId} ${source ? source.shortCitation : ""}`.trim()
      }));
    });

    const body = el("div", { className: "rec-body" }, [
      tagRow,
      el("div", { className: "detail-grid" }, [
        detailBlock("Candidate measure", rec.candidateMeasure),
        detailBlock("Move", rec.move),
        detailBlock("Why this one", rec.why),
        detailBlock("Listen for", rec.listenFor),
        detailBlock("GATHER alignment", rec.outcomeAlignment),
        detailBlock("Citation line", rec.keyCitations)
      ]),
      el("div", { className: "caution" }, [
        el("strong", { text: "Facilitator caution" }),
        el("p", { text: rec.caution })
      ]),
      el("div", {}, [
        el("strong", { text: "Source path" }),
        sourceRow
      ])
    ]);

    details.append(summary, body);
    list.appendChild(details);
  });
}

function detailBlock(label, text) {
  return el("div", { className: "detail-block" }, [
    el("strong", { text: label }),
    el("p", { text })
  ]);
}

function renderSources(data) {
  byId("source-note").textContent = data.sourceLinkingNote;
  const list = byId("source-list");
  list.innerHTML = "";

  const term = state.searchTerm.trim().toLowerCase();
  data.sources.forEach((source) => {
    const haystack = [
      source.id,
      source.shortCitation,
      source.fullCitation,
      source.sourceFileLookup,
      source.note,
      source.sourceType,
      `measure ${source.usedBy.join(" measure ")}`
    ].join(" ").toLowerCase();
    const hidden = term && !haystack.includes(term);

    const details = el("details", {
      className: hidden ? "source-card is-hidden" : "source-card",
      id: `source-${source.id}`
    });

    const usedBy = source.usedBy.map((rank) => `Measure ${rank}`).join(", ");
    const summary = el("summary", {}, [
      el("span", { className: "source-title" }, [
        el("strong", { text: `${source.id} - ${source.shortCitation}` }),
        el("span", { className: "source-meta", text: `${source.sourceType} | ${usedBy}` })
      ]),
      el("span", { className: "type-pill", text: source.url ? "public link" : "lookup only" })
    ]);

    const links = el("div", { className: "source-links" });
    if (source.url) {
      links.appendChild(el("a", {
        className: "text-button",
        href: source.url,
        target: "_blank",
        rel: "noreferrer",
        text: "Open public source"
      }));
    }
    source.usedBy.forEach((rank) => {
      links.appendChild(el("a", {
        className: "text-button",
        href: `#measure-${rank}`,
        text: `View measure ${rank}`
      }));
    });

    const body = el("div", { className: "source-body" }, [
      el("p", { text: source.fullCitation }),
      links,
      el("div", { className: "lookup" }, [
        el("strong", { text: "Source file lookup" }),
        el("p", { text: source.sourceFileLookup })
      ]),
      source.note ? el("div", { className: "note" }, [
        el("strong", { text: "Source note" }),
        el("p", { text: source.note })
      ]) : null
    ]);

    details.append(summary, body);
    list.appendChild(details);
  });
}

function renderSafeguards(data) {
  const list = byId("safeguards-list");
  list.innerHTML = "";
  data.safeguards.forEach((item) => list.appendChild(el("li", { text: item })));
}

function wireControls() {
  document.querySelector("[data-expand='recommendations']").addEventListener("click", () => {
    document.querySelectorAll(".recommendation").forEach((node) => { node.open = true; });
  });

  document.querySelector("[data-collapse='recommendations']").addEventListener("click", () => {
    document.querySelectorAll(".recommendation").forEach((node) => { node.open = false; });
  });

  byId("source-search").addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderSources(state.data);
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    const target = document.querySelector(link.getAttribute("href"));
    if (target && target.tagName.toLowerCase() === "details") {
      target.open = true;
    }
  });

  window.addEventListener("hashchange", openHashTarget);
  openHashTarget();
}

function openHashTarget() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (target && target.tagName.toLowerCase() === "details") {
    target.open = true;
  }
}

async function init() {
  const response = await fetch("./data/recommendations.json");
  if (!response.ok) {
    throw new Error(`Unable to load recommendation data: ${response.status}`);
  }
  state.data = await response.json();
  renderOverview(state.data);
  renderRecommendations(state.data);
  renderSources(state.data);
  renderSafeguards(state.data);
  wireControls();
}

init().catch((error) => {
  document.body.appendChild(el("pre", {
    text: error.message,
    style: "padding: 1rem; color: #8d2f1f; white-space: pre-wrap;"
  }));
});
