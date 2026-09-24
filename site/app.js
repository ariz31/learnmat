const state = {
  catalog: null,
  assets: [],
  filtered: [],
  selectedId: null,
  viewport: localStorage.getItem("learnmat-viewer-viewport") || "fit"
};

const mobileQuery = matchMedia("(max-width: 760px)");
let previewLoadTimer = 0;
let previewNavigation = 0;

const els = {
  workspace: document.querySelector("#workspace"),
  catalogPanel: document.querySelector("#catalog-panel"),
  catalogToggle: document.querySelector("#catalog-toggle"),
  homeLink: document.querySelector("#home-link"),
  topbarContext: document.querySelector("#topbar-context"),
  assetTools: document.querySelector("#asset-tools"),
  filterToggle: document.querySelector("#filter-toggle"),
  filterPanel: document.querySelector("#filter-panel"),
  search: document.querySelector("#search-input"),
  category: document.querySelector("#category-filter"),
  status: document.querySelector("#status-filter"),
  origin: document.querySelector("#origin-filter"),
  clearFilters: document.querySelector("#clear-filters"),
  assetList: document.querySelector("#asset-list"),
  catalogEmpty: document.querySelector("#catalog-empty"),
  homeView: document.querySelector("#home-view"),
  homeGrid: document.querySelector("#home-grid"),
  homeEmpty: document.querySelector("#home-empty"),
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
  return String(value || "unknown")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(value) {
  return "status-" + String(value || "unknown")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase();
}

function assetSearchText(asset) {
  return [
    asset.id,
    asset.title,
    asset.description,
    asset.category,
    asset.status,
    asset.kind,
    ...(asset.topics || []),
    ...(asset.learningObjectives || [])
  ].join(" ").toLowerCase();
}

function selectedAsset() {
  return state.assets.find((asset) => asset.id === state.selectedId) || null;
}

function updateHash(id) {
  const next = id ? "#asset=" + encodeURIComponent(id) : "";
  const target = location.pathname + location.search + next;
  if (location.pathname + location.search + location.hash !== target) {
    history.replaceState(null, "", target);
  }
}

function assetFromHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  return params.get("asset");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { els.toast.hidden = true; }, 2200);
}

function fillSelect(select, values, labeler) {
  const current = select.value;
  while (select.options.length > 1) select.remove(1);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labeler ? labeler(value) : humanize(value);
    select.appendChild(option);
  });
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

function initFilters() {
  fillSelect(els.category, unique(state.assets.map((asset) => asset.category)));
  fillSelect(els.status, unique(state.assets.map((asset) => asset.status)));
}

function applyFilters() {
  const query = normalize(els.search.value);
  const category = els.category.value;
  const status = els.status.value;
  const origin = els.origin.value;

  state.filtered = state.assets.filter((asset) => {
    if (query && !asset._search.includes(query)) return false;
    if (category && asset.category !== category) return false;
    if (status && asset.status !== status) return false;
    if (origin && asset.origin !== origin) return false;
    return true;
  });

  renderAssetList();
  renderHomeGrid();
}

function renderAssetList() {
  els.assetList.replaceChildren();
  els.catalogEmpty.hidden = state.filtered.length !== 0;

  state.filtered.forEach((asset) => {
    const button = create("button", "asset-item");
    button.type = "button";
    button.dataset.assetId = asset.id;
    button.setAttribute("aria-current", asset.id === state.selectedId ? "true" : "false");
    if (asset.id === state.selectedId) button.classList.add("is-selected");

    const copy = create("span", "asset-item-copy");
    copy.appendChild(create("span", "asset-item-title", asset.title || asset.id));
    copy.appendChild(create("span", "asset-item-subtitle", humanize(asset.category)));
    button.append(copy);

    button.addEventListener("click", () => {
      selectAsset(asset.id);
      if (mobileQuery.matches) setCatalogOpen(false);
    });

    els.assetList.appendChild(button);
  });
}

function renderHomeGrid() {
  els.homeGrid.replaceChildren();
  els.homeEmpty.hidden = state.filtered.length !== 0;

  state.filtered.forEach((asset) => {
    const button = create("button", "home-card");
    button.type = "button";
    button.setAttribute("aria-label", "Open " + (asset.title || asset.id));

    const top = create("span", "home-card-top");
    top.append(create("span", "home-card-category", humanize(asset.category)));

    const copy = create("span", "home-card-copy");
    copy.appendChild(create("span", "home-card-title", asset.title || asset.id));
    copy.appendChild(create(
      "span",
      "home-card-meta",
      [humanize(asset.status), asset.networkRequired === true ? "Live WebGL" : "Three.js"].join(" · ")
    ));
    button.append(top, copy);
    button.addEventListener("click", () => selectAsset(asset.id));
    els.homeGrid.appendChild(button);
  });
}

function metadataRows(target, rows) {
  target.replaceChildren();
  rows.forEach((row) => {
    target.append(
      create("dt", "", row[0]),
      create("dd", "", row[1] === null || row[1] === undefined || row[1] === "" ? "—" : row[1])
    );
  });
}

function renderTopics(asset) {
  els.topics.replaceChildren();
  (asset.topics || []).forEach((topic) => els.topics.appendChild(create("span", "", topic)));
}

function renderObjectives(asset) {
  els.objectives.replaceChildren();
  (asset.learningObjectives || []).forEach((objective) => els.objectives.appendChild(create("li", "", objective)));
}

function renderReviews(asset) {
  els.reviewGrid.replaceChildren();
  const verification = asset.verification || {};
  [
    ["Engineering", verification.engineeringReview],
    ["Browser", verification.browserReview],
    ["Accessibility", verification.accessibilityReview]
  ].forEach((entry) => {
    const item = create("div", "review-item");
    item.append(
      create("strong", "", entry[0]),
      create("span", statusClass(entry[1]), humanize(entry[1]))
    );
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
  deps.forEach((dep) => {
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
  els.runtimeContract.textContent = component
    ? "Contract " + (component.contractVersion || "unknown")
    : "No component contract";

  names.sort().forEach((name) => {
    const spec = params[name] || {};
    const tr = document.createElement("tr");
    const range = spec.min !== undefined || spec.max !== undefined
      ? formatParameterValue(spec.min) + " – " + formatParameterValue(spec.max)
      : "—";
    [name, formatParameterValue(spec.default), range, spec.unit || "—"].forEach((value) => {
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
  const parts = ["Live Three.js asset. Static image previews are not used."];
  if (asset.previewPolicy === "repository-component") {
    parts.push("Repository-authored component sandbox permits same-origin module loading.");
  } else {
    parts.push("Catalog example runs in the stricter isolated sandbox.");
  }
  if (asset.networkRequired === true) parts.push("Remote runtime dependencies may be required.");
  if (asset.status !== "approved") parts.push("Status: " + humanize(asset.status) + "; presence does not imply approval.");
  return parts.join(" ");
}

function applyViewport() {
  const value = state.viewport;
  els.viewport.value = value;
  if (value === "fit") {
    els.deviceFrame.style.width = "100%";
    els.deviceFrame.style.height = mobileQuery.matches ? "560px" : "700px";
    return;
  }
  const parts = value.split("x").map(Number);
  els.deviceFrame.style.width = parts[0] + "px";
  els.deviceFrame.style.height = parts[1] + "px";
}

function setPreviewLoading(message, stateName = "loading") {
  els.previewLoading.textContent = message;
  els.previewLoading.dataset.state = stateName;
  els.previewLoading.hidden = false;
}

function clearPreviewLoading() {
  clearTimeout(previewLoadTimer);
  previewLoadTimer = 0;
  els.previewLoading.hidden = true;
  els.previewLoading.dataset.state = "";
}

function renderPreview(asset, forceReload) {
  els.frame.setAttribute("sandbox", sandboxFor(asset));
  els.previewSecurity.textContent = asset.previewPolicy === "repository-component"
    ? "Repository component sandbox"
    : "Strict candidate sandbox";
  els.frame.title = (asset.title || asset.id) + " live asset";

  const current = els.frame.dataset.assetId;
  const shouldNavigate = forceReload || current !== asset.id || els.frame.src === "about:blank";

  if (shouldNavigate) {
    const token = String(++previewNavigation);
    clearTimeout(previewLoadTimer);
    setPreviewLoading("Loading asset…");
    els.frame.dataset.assetId = asset.id;
    els.frame.dataset.loadToken = token;
    els.frame.src = asset.entrypointUrl;

    previewLoadTimer = setTimeout(() => {
      if (
        els.frame.dataset.loadToken === token &&
        els.frame.dataset.assetId === asset.id &&
        !els.previewLoading.hidden
      ) {
        setPreviewLoading("Still loading — tap to retry", "slow");
      }
    }, 8000);
  } else {
    clearPreviewLoading();
  }

  els.previewNotice.textContent = previewNotice(asset);
  applyViewport();
}

function renderAsset(asset) {
  els.homeView.hidden = true;
  els.assetView.hidden = false;
  els.assetTools.hidden = false;
  els.topbarContext.textContent = asset.title || asset.id;

  els.eyebrow.textContent = humanize(asset.category) + " · Three.js · v" + asset.version;
  els.title.textContent = asset.title || asset.id;
  els.description.textContent = asset.description || "";

  const source = asset.entrypointSourceUrl || asset.sourceUrl;
  if (source) {
    els.sourceLink.href = source;
    els.sourceLink.removeAttribute("aria-disabled");
  } else {
    els.sourceLink.removeAttribute("href");
    els.sourceLink.setAttribute("aria-disabled", "true");
  }

  els.statusBadge.textContent = humanize(asset.status);
  els.statusBadge.className = "badge " + statusClass(asset.status);

  metadataRows(els.overview, [
    ["Asset ID", asset.id],
    ["Kind", humanize(asset.kind)],
    ["Renderer", "Three.js"],
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
  document.title = (asset.title || asset.id) + " · LearnMat";
}

function showHome(updateUrl) {
  state.selectedId = null;
  els.assetView.hidden = true;
  els.homeView.hidden = false;
  els.assetTools.hidden = true;
  els.topbarContext.textContent = "Assets";
  clearPreviewLoading();
  els.frame.src = "about:blank";
  els.frame.dataset.assetId = "";
  els.frame.dataset.loadToken = "";
  renderAssetList();
  renderHomeGrid();
  if (updateUrl !== false) updateHash(null);
  document.title = "LearnMat Asset Viewer";
}

function selectAsset(id) {
  const asset = state.assets.find((item) => item.id === id);
  if (!asset) return;
  state.selectedId = id;
  updateHash(id);
  renderAssetList();
  renderAsset(asset);
}

function reloadPreview() {
  const asset = selectedAsset();
  if (!asset) return;
  clearTimeout(previewLoadTimer);
  setPreviewLoading("Reloading asset…");
  els.frame.dataset.assetId = "";
  els.frame.dataset.loadToken = "";
  els.frame.src = "about:blank";
  requestAnimationFrame(() => renderPreview(asset, true));
}

function setCatalogOpen(open) {
  if (mobileQuery.matches) {
    els.workspace.classList.remove("sidebar-hidden");
    els.catalogPanel.classList.toggle("is-open", open);
  } else {
    els.catalogPanel.classList.remove("is-open");
    els.workspace.classList.toggle("sidebar-hidden", !open);
  }
  els.catalogToggle.setAttribute("aria-expanded", open ? "true" : "false");
  els.catalogToggle.setAttribute("aria-label", open ? "Hide asset sidebar" : "Show asset sidebar");
  els.catalogToggle.title = open ? "Hide sidebar" : "Show sidebar";
}

function catalogIsOpen() {
  return mobileQuery.matches
    ? els.catalogPanel.classList.contains("is-open")
    : !els.workspace.classList.contains("sidebar-hidden");
}

function setFiltersOpen(open) {
  els.filterPanel.hidden = !open;
  els.filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
  els.filterToggle.setAttribute("aria-label", open ? "Hide filters" : "Show filters");
  els.filterToggle.title = open ? "Hide filters" : "Filters";
}

function clearFilters() {
  els.search.value = "";
  els.category.value = "";
  els.status.value = "";
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
  applyTheme(stored || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
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
  [els.search, els.category, els.status, els.origin].forEach((control) => {
    control.addEventListener(control === els.search ? "input" : "change", applyFilters);
  });

  els.clearFilters.addEventListener("click", clearFilters);
  els.filterToggle.addEventListener("click", () => setFiltersOpen(els.filterPanel.hidden));
  els.catalogToggle.addEventListener("click", () => setCatalogOpen(!catalogIsOpen()));

  els.homeLink.addEventListener("click", (event) => {
    event.preventDefault();
    showHome(true);
    if (mobileQuery.matches) setCatalogOpen(false);
  });

  els.themeToggle.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  els.viewport.addEventListener("change", () => {
    state.viewport = els.viewport.value;
    localStorage.setItem("learnmat-viewer-viewport", state.viewport);
    applyViewport();
  });

  els.reload.addEventListener("click", reloadPreview);
  els.open.addEventListener("click", () => {
    const asset = selectedAsset();
    if (asset) window.open(asset.entrypointUrl, "_blank", "noopener,noreferrer");
  });

  els.fullscreen.addEventListener("click", async () => {
    try {
      await els.previewStage.requestFullscreen();
    } catch {
      showToast("Fullscreen is not available in this browser context.");
    }
  });

  els.shareButton.addEventListener("click", copyShareLink);
  els.previewLoading.addEventListener("click", () => {
    if (els.previewLoading.dataset.state === "slow") reloadPreview();
  });
  els.frame.addEventListener("load", () => {
    if (els.frame.src !== "about:blank") clearPreviewLoading();
  });

  addEventListener("hashchange", () => {
    const id = assetFromHash();
    if (id) {
      if (id !== state.selectedId) selectAsset(id);
    } else if (state.selectedId) {
      showHome(false);
    }
  });

  mobileQuery.addEventListener("change", () => {
    setCatalogOpen(!mobileQuery.matches);
    applyViewport();
  });

  addEventListener("keydown", (event) => {
    const target = event.target;
    const editing = target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;

    if (event.key === "/" && !editing) {
      event.preventDefault();
      if (!catalogIsOpen()) setCatalogOpen(true);
      setTimeout(() => els.search.focus(), 0);
      return;
    }

    if (event.key === "Escape" && !els.filterPanel.hidden) {
      setFiltersOpen(false);
      return;
    }

    if (event.key === "Escape" && mobileQuery.matches && catalogIsOpen()) {
      setCatalogOpen(false);
      return;
    }

    if (!editing && state.selectedId && (event.key === "r" || event.key === "R")) {
      event.preventDefault();
      reloadPreview();
    }

    if (!editing && state.selectedId && (event.key === "f" || event.key === "F")) {
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
  state.assets = catalog.assets
    .filter((asset) => asset.renderer === "threejs")
    .map((asset) => Object.assign({}, asset, { _search: assetSearchText(asset) }))
    .sort((a, b) => {
      const category = String(a.category).localeCompare(String(b.category));
      return category || String(a.title || a.id).localeCompare(String(b.title || b.id));
    });

  initFilters();
  applyFilters();

  const requested = assetFromHash();
  if (requested && state.assets.some((asset) => asset.id === requested)) selectAsset(requested);
  else showHome(false);
}

async function start() {
  initTheme();
  bindEvents();
  setFiltersOpen(false);
  setCatalogOpen(!mobileQuery.matches);
  els.viewport.value = state.viewport;

  try {
    await loadCatalog();
  } catch (error) {
    console.error(error);
    els.homeGrid.replaceChildren();
    els.homeView.querySelector("h1").textContent = "Catalog unavailable";
    els.homeView.querySelector(".home-heading p:not(.eyebrow)").textContent =
      error instanceof Error ? error.message : String(error);
  }
}

start();