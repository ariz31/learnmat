const state = {
  catalog: null,
  assets: [],
  filtered: [],
  selectedId: null,
  previewMode: "interactive",
  viewport: localStorage.getItem("learnmat-viewer-viewport") || "fit"
};

const els = {
  catalogSummary: document.querySelector("#catalog-summary"),
  catalogPanel: document.querySelector("#catalog-panel"),
  catalogToggle: document.querySelector("#catalog-toggle"),
  search: document.querySelector("#search-input"),
  category: document.querySelector("#category-filter"),
  status: document.querySelector("#status-filter"),
  renderer: document.querySelector("#renderer-filter"),
  origin: document.querySelector("#origin-filter"),
  clearFilters: document.querySelector("#clear-filters"),
  resultCount: document.querySelector("#result-count"),
  assetList: document.querySelector("#asset-list"),
  catalogEmpty: document.querySelector("#catalog-empty"),
  viewerEmpty: document.querySelector("#viewer-empty"),
  assetView: document.querySelector("#asset-view"),
  eyebrow: document.querySelector("#asset-eyebrow"),
  title: document.querySelector("#asset-title"),
  description: document.querySelector("#asset-description"),
  sourceLink: document.querySelector("#source-link"),
  shareButton: document.querySelector("#share-button"),
  viewport: document.querySelector("#viewport-select"),
  previewStage: document.querySelector("#preview-stage"),
  deviceFrame: document.querySelector("#device-frame"),
  frame: document.querySelector("#asset-frame"),
  previewImage: document.querySelector("#preview-image"),
  previewLoading: document.querySelector("#preview-loading"),
  previewNotice: document.querySelector("#preview-notice"),
  previewSecurity: document.querySelector("#preview-security"),
  reload: document.querySelector("#reload-preview"),
  open: document.querySelector("#open-preview"),
  fullscreen: document.querySelector("#fullscreen-preview"),
  statusBadge: document.querySelector("#asset-status"),
  overview: document.querySelector("#overview-metadata"),
  topics: document.querySelector("#topic-list"),
  objectives: document.querySelector("#objective-list"),
  reviewGrid: document.querySelector("#review-grid"),
  verificationNote: document.querySelector("#verification-note"),
  rights: document.querySelector("#rights-metadata"),
  dependencies: document.querySelector("#dependency-list"),
  runtimeContract: document.querySelector("#runtime-contract"),
  parameterBody: document.querySelector("#parameter-table-body"),
  parameterEmpty: document.querySelector("#parameter-empty"),
  themeToggle: document.querySelector("#theme-toggle"),
  toast: document.querySelector("#toast")
};

function create(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function humanize(value) {
  return String(value || "unknown").replace(/[-_]+/g, " ").replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

function statusClass(value) {
  return "status-" + String(value || "unknown").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function assetSearchText(asset) {
  return [
    asset.id,
    asset.title,
    asset.description,
    asset.category,
    asset.status,
    asset.kind,
    asset.renderer,
    ...(asset.topics || []),
    ...(asset.learningObjectives || [])
  ].join(" ").toLowerCase();
}

function selectedAsset() {
  return state.assets.find(function (asset) {
    return asset.id === state.selectedId;
  }) || null;
}

function updateHash(id) {
  const next = id ? "#asset=" + encodeURIComponent(id) : "";
  if (location.hash !== next) history.replaceState(null, "", location.pathname + location.search + next);
}

function assetFromHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  return params.get("asset");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    els.toast.hidden = true;
  }, 2200);
}

function fillSelect(select, values, labeler) {
  const current = select.value;
  while (select.options.length > 1) select.remove(1);
  values.forEach(function (value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labeler ? labeler(value) : humanize(value);
    select.appendChild(option);
  });
  if ([...select.options].some(function (option) { return option.value === current; })) {
    select.value = current;
  }
}

function initFilters() {
  fillSelect(els.category, unique(state.assets.map(function (asset) { return asset.category; })));
  fillSelect(els.status, unique(state.assets.map(function (asset) { return asset.status; })));
  fillSelect(els.renderer, unique(state.assets.map(function (asset) { return asset.renderer; })));
}

function applyFilters() {
  const query = normalize(els.search.value);
  const category = els.category.value;
  const status = els.status.value;
  const renderer = els.renderer.value;
  const origin = els.origin.value;

  state.filtered = state.assets.filter(function (asset) {
    if (query && !asset._search.includes(query)) return false;
    if (category && asset.category !== category) return false;
    if (status && asset.status !== status) return false;
    if (renderer && asset.renderer !== renderer) return false;
    if (origin && asset.origin !== origin) return false;
    return true;
  });

  renderAssetList();
}

function renderAssetList() {
  els.assetList.replaceChildren();
  els.catalogEmpty.hidden = state.filtered.length !== 0;
  els.resultCount.textContent = state.filtered.length + (state.filtered.length === 1 ? " asset" : " assets");

  state.filtered.forEach(function (asset) {
    const button = create("button", "asset-item");
    button.type = "button";
    button.dataset.assetId = asset.id;
    button.setAttribute("aria-current", asset.id === state.selectedId ? "true" : "false");
    if (asset.id === state.selectedId) button.classList.add("is-selected");

    const thumb = create("span", "asset-thumb");
    if (asset.previewUrl) {
      const image = document.createElement("img");
      image.src = asset.previewUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", function () {
        thumb.replaceChildren(create("span", "", asset.renderer ? asset.renderer.toUpperCase() : "HTML"));
      }, { once: true });
      thumb.appendChild(image);
    } else {
      thumb.appendChild(create("span", "", asset.renderer ? asset.renderer.toUpperCase() : "HTML"));
    }

    const copy = create("span", "asset-item-copy");
    copy.appendChild(create("span", "asset-item-title", asset.title || asset.id));

    const meta = create("span", "asset-item-meta");
    const status = create("span", "mini-badge " + statusClass(asset.status), humanize(asset.status));
    const category = create("span", "mini-badge", humanize(asset.category));
    meta.append(status, category);
    if (asset.networkRequired === true) meta.appendChild(create("span", "mini-badge", "Network"));
    copy.appendChild(meta);

    button.append(thumb, copy);
    button.addEventListener("click", function () {
      selectAsset(asset.id);
      if (matchMedia("(max-width: 760px)").matches) setCatalogOpen(false);
    });
    els.assetList.appendChild(button);
  });
}

function metadataRows(target, rows) {
  target.replaceChildren();
  rows.forEach(function (row) {
    const dt = create("dt", "", row[0]);
    const dd = create("dd", "", row[1] === null || row[1] === undefined || row[1] === "" ? "—" : row[1]);
    target.append(dt, dd);
  });
}

function renderTopics(asset) {
  els.topics.replaceChildren();
  (asset.topics || []).forEach(function (topic) {
    els.topics.appendChild(create("span", "", topic));
  });
}

function renderObjectives(asset) {
  els.objectives.replaceChildren();
  (asset.learningObjectives || []).forEach(function (objective) {
    els.objectives.appendChild(create("li", "", objective));
  });
}

function renderReviews(asset) {
  els.reviewGrid.replaceChildren();
  const verification = asset.verification || {};
  [
    ["Engineering", verification.engineeringReview],
    ["Browser", verification.browserReview],
    ["Accessibility", verification.accessibilityReview]
  ].forEach(function (entry) {
    const item = create("div", "review-item");
    item.append(create("strong", "", entry[0]), create("span", statusClass(entry[1]), humanize(entry[1])));
    els.reviewGrid.appendChild(item);
  });
  els.verificationNote.textContent = verification.notes || "No verification note is recorded.";
}

function renderDependencies(asset) {
  els.dependencies.replaceChildren();
  const deps = asset.dependencies || [];
  if (!deps.length) {
    els.dependencies.appendChild(create("p", "detail-note", "No external runtime dependencies declared."));
    return;
  }
  const list = create("ul", "dependency-list");
  deps.forEach(function (dep) {
    const label = [dep.name, dep.version].filter(Boolean).join(" · ");
    list.appendChild(create("li", "", label + (dep.embedded ? " · embedded" : " · external")));
  });
  els.dependencies.appendChild(list);
}

function formatParameterValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function renderParameters(asset) {
  els.parameterBody.replaceChildren();
  const component = asset.component;
  const params = component && component.parameters ? component.parameters : {};
  const names = Object.keys(params);
  els.parameterEmpty.hidden = names.length !== 0;
  els.runtimeContract.textContent = component ? "Contract " + (component.contractVersion || "unknown") : "No component contract";

  names.sort().forEach(function (name) {
    const spec = params[name] || {};
    const tr = document.createElement("tr");
    const range = spec.min !== undefined || spec.max !== undefined
      ? formatParameterValue(spec.min) + " – " + formatParameterValue(spec.max)
      : "—";
    [name, formatParameterValue(spec.default), range, spec.unit || "—"].forEach(function (value) {
      tr.appendChild(create("td", "", value));
    });
    els.parameterBody.appendChild(tr);
  });
}

function sandboxFor(asset) {
  const capabilities = ["allow-scripts", "allow-forms", "allow-modals", "allow-pointer-lock", "allow-downloads"];
  if (asset.previewPolicy === "repository-component") capabilities.push("allow-same-origin");
  return capabilities.join(" ");
}

function previewNotice(asset) {
  const parts = [];
  if (asset.previewPolicy === "repository-component") {
    parts.push("Repository-authored component preview: same-origin is enabled so local ES modules can load.");
  } else {
    parts.push("Legacy/intake HTML runs in a stricter opaque-origin sandbox.");
  }
  if (asset.networkRequired === true) {
    parts.push("This entry declares network dependencies; remote libraries may be required.");
  } else if (asset.networkRequired === false) {
    parts.push("No network dependency is declared.");
  } else {
    parts.push("Network requirement has not been verified.");
  }
  if (asset.status !== "approved") {
    parts.push("Status: " + humanize(asset.status) + "; this viewer does not imply approval.");
  }
  return parts.join(" ");
}

function applyViewport() {
  const value = state.viewport;
  els.viewport.value = value;
  if (value === "fit") {
    els.deviceFrame.style.width = "100%";
    els.deviceFrame.style.height = matchMedia("(max-width: 760px)").matches ? "560px" : "700px";
    return;
  }
  const parts = value.split("x").map(Number);
  els.deviceFrame.style.width = parts[0] + "px";
  els.deviceFrame.style.height = parts[1] + "px";
}

function renderPreview(asset, forceReload) {
  if (state.previewMode === "image" && !asset.previewUrl) state.previewMode = "interactive";
  const imageMode = state.previewMode === "image" && asset.previewUrl;
  els.previewImage.hidden = !imageMode;
  els.frame.hidden = imageMode;
  els.reload.disabled = imageMode;

  document.querySelectorAll("[data-preview-mode]").forEach(function (button) {
    const requested = button.dataset.previewMode;
    button.classList.toggle("is-active", requested === state.previewMode);
    if (requested === "image") button.disabled = !asset.previewUrl;
  });

  if (imageMode) {
    els.previewLoading.hidden = true;
    if (els.previewImage.src !== new URL(asset.previewUrl, location.href).href || forceReload) {
      els.previewImage.src = asset.previewUrl;
    }
    els.previewImage.alt = asset.title + " static preview";
  } else {
    els.previewLoading.hidden = false;
    els.previewLoading.textContent = "Loading interactive preview…";
    const sandbox = sandboxFor(asset);
    els.frame.setAttribute("sandbox", sandbox);
    els.previewSecurity.textContent = asset.previewPolicy === "repository-component" ? "Repository component sandbox" : "Strict candidate sandbox";
    els.frame.title = asset.title + " interactive preview";
    const current = els.frame.dataset.assetId;
    if (forceReload || current !== asset.id) {
      els.frame.dataset.assetId = asset.id;
      els.frame.src = asset.entrypointUrl;
    }
  }

  els.previewNotice.textContent = previewNotice(asset);
  applyViewport();
}

function renderAsset(asset) {
  els.viewerEmpty.hidden = true;
  els.assetView.hidden = false;

  els.eyebrow.textContent = humanize(asset.category) + " · " + humanize(asset.renderer) + " · v" + asset.version;
  els.title.textContent = asset.title || asset.id;
  els.description.textContent = asset.description || "";
  els.sourceLink.href = asset.entrypointSourceUrl || asset.sourceUrl;

  els.statusBadge.textContent = humanize(asset.status);
  els.statusBadge.className = "badge " + statusClass(asset.status);

  metadataRows(els.overview, [
    ["Asset ID", asset.id],
    ["Kind", humanize(asset.kind)],
    ["Renderer", humanize(asset.renderer)],
    ["Entrypoint", asset.entrypoint],
    ["Source class", asset.origin === "curated" ? "Curated asset" : "Catalog example"],
    ["Network required", asset.networkRequired === true ? "Yes" : asset.networkRequired === false ? "No" : "Unknown"]
  ]);

  renderTopics(asset);
  renderObjectives(asset);
  renderReviews(asset);

  const rights = asset.rights || {};
  metadataRows(els.rights, [
    ["Rights status", humanize(rights.status)],
    ["License", rights.licenseExpression || "Not confirmed"],
    ["License file", rights.licenseFile || "—"],
    ["Attribution", rights.attribution || "—"]
  ]);

  renderDependencies(asset);
  renderParameters(asset);
  renderPreview(asset, false);
}

function selectAsset(id) {
  const asset = state.assets.find(function (item) { return item.id === id; });
  if (!asset) return;
  state.selectedId = id;
  updateHash(id);
  renderAssetList();
  renderAsset(asset);
}

function reloadPreview() {
  const asset = selectedAsset();
  if (!asset || state.previewMode === "image") return;
  els.previewLoading.hidden = false;
  els.frame.src = "about:blank";
  requestAnimationFrame(function () {
    els.frame.src = asset.entrypointUrl;
  });
}

function setCatalogOpen(open) {
  els.catalogPanel.classList.toggle("is-open", open);
  els.catalogToggle.setAttribute("aria-expanded", open ? "true" : "false");
}

function clearFilters() {
  els.search.value = "";
  els.category.value = "";
  els.status.value = "";
  els.renderer.value = "";
  els.origin.value = "";
  applyFilters();
  els.search.focus();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("learnmat-viewer-theme", theme);
  els.themeToggle.setAttribute("aria-label", theme === "dark" ? "Use light theme" : "Use dark theme");
}

function initTheme() {
  const stored = localStorage.getItem("learnmat-viewer-theme");
  const theme = stored || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(theme);
}

async function copyShareLink() {
  const asset = selectedAsset();
  if (!asset) return;
  const url = location.origin + location.pathname + "#asset=" + encodeURIComponent(asset.id);
  try {
    await navigator.clipboard.writeText(url);
    showToast("Asset link copied.");
  } catch {
    showToast(url);
  }
}

function bindEvents() {
  [els.search, els.category, els.status, els.renderer, els.origin].forEach(function (control) {
    control.addEventListener(control === els.search ? "input" : "change", applyFilters);
  });

  els.clearFilters.addEventListener("click", clearFilters);
  els.catalogToggle.addEventListener("click", function () {
    setCatalogOpen(!els.catalogPanel.classList.contains("is-open"));
  });

  els.themeToggle.addEventListener("click", function () {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  els.viewport.addEventListener("change", function () {
    state.viewport = els.viewport.value;
    localStorage.setItem("learnmat-viewer-viewport", state.viewport);
    applyViewport();
  });

  document.querySelectorAll("[data-preview-mode]").forEach(function (button) {
    button.addEventListener("click", function () {
      const asset = selectedAsset();
      if (!asset) return;
      if (button.dataset.previewMode === "image" && !asset.previewUrl) return;
      state.previewMode = button.dataset.previewMode;
      renderPreview(asset, false);
    });
  });

  els.reload.addEventListener("click", reloadPreview);
  els.open.addEventListener("click", function () {
    const asset = selectedAsset();
    if (asset) window.open(asset.entrypointUrl, "_blank", "noopener,noreferrer");
  });
  els.fullscreen.addEventListener("click", async function () {
    try {
      await els.previewStage.requestFullscreen();
    } catch {
      showToast("Fullscreen is not available in this browser context.");
    }
  });
  els.shareButton.addEventListener("click", copyShareLink);

  els.frame.addEventListener("load", function () {
    if (els.frame.src === "about:blank") return;
    els.previewLoading.hidden = true;
  });

  els.previewImage.addEventListener("load", function () {
    els.previewLoading.hidden = true;
  });
  els.previewImage.addEventListener("error", function () {
    els.previewLoading.hidden = false;
    els.previewLoading.textContent = "Static preview failed to load.";
  });

  addEventListener("hashchange", function () {
    const id = assetFromHash();
    if (id && id !== state.selectedId) selectAsset(id);
  });

  addEventListener("keydown", function (event) {
    const target = event.target;
    const editing = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (event.key === "/" && !editing) {
      event.preventDefault();
      els.search.focus();
      return;
    }
    if (event.key === "Escape" && els.catalogPanel.classList.contains("is-open")) {
      setCatalogOpen(false);
      return;
    }
    if (!editing && (event.key === "r" || event.key === "R")) {
      event.preventDefault();
      reloadPreview();
    }
    if (!editing && (event.key === "f" || event.key === "F")) {
      event.preventDefault();
      els.fullscreen.click();
    }
  });
}

async function loadCatalog() {
  const response = await fetch("/catalog.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Catalog request failed with HTTP " + response.status);
  const catalog = await response.json();
  if (!catalog || !Array.isArray(catalog.assets)) throw new Error("Invalid generated catalog");

  state.catalog = catalog;
  state.assets = catalog.assets.map(function (asset) {
    return Object.assign({}, asset, { _search: assetSearchText(asset) });
  }).sort(function (a, b) {
    const category = String(a.category).localeCompare(String(b.category));
    return category || String(a.title || a.id).localeCompare(String(b.title || b.id));
  });

  const categoryCount = unique(state.assets.map(function (asset) { return asset.category; })).length;
  els.catalogSummary.textContent = state.assets.length + " assets · " + categoryCount + " categories · source " + String(catalog.sourceCommit || "unknown").slice(0, 7);

  initFilters();
  applyFilters();

  const requested = assetFromHash();
  const defaultId = requested && state.assets.some(function (asset) { return asset.id === requested; })
    ? requested
    : state.assets[0]?.id;

  if (defaultId) selectAsset(defaultId);
}

async function start() {
  initTheme();
  bindEvents();
  els.viewport.value = state.viewport;
  try {
    await loadCatalog();
  } catch (error) {
    console.error(error);
    els.catalogSummary.textContent = "Catalog unavailable";
    els.viewerEmpty.querySelector("h1").textContent = "The catalog could not be loaded";
    els.viewerEmpty.querySelector("p").textContent = error instanceof Error ? error.message : String(error);
  }
}

start();
