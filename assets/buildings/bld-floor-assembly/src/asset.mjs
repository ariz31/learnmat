import { DEFAULT_PARAMETERS, buildFloorAssemblyModel } from "./model.mjs";

const NS = "http://www.w3.org/2000/svg";

function node(name, attributes = {}) {
  const element = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

function polygon(points, className) {
  return node("polygon", {
    points: points.map((point) => point.join(",")).join(" "),
    class: className
  });
}

function line(a, b, className) {
  return node("line", {
    x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: className
  });
}

function label(value, x, y, className, anchor = "start") {
  const element = node("text", { x, y, class: className, "text-anchor": anchor });
  element.textContent = value;
  return element;
}

function projection(model) {
  const horizontalScale = Math.min(72, 530 / (model.width + model.depth * 0.52));
  const verticalScale = 380;
  const originX = 350;
  const originY = 470;
  return (x, y, z) => {
    const depth = -z;
    return [
      originX + x * horizontalScale - depth * horizontalScale * 0.48,
      originY - y * verticalScale - depth * horizontalScale * 0.24
    ];
  };
}

function drawPrism(svg, project, model, layer) {
  const x0 = -model.width / 2;
  const x1 = model.width / 2;
  const z0 = 0;
  const z1 = -model.depth;
  const y0 = layer.explodedBottomY;
  const y1 = layer.explodedTopY;
  const cls = "lm-layer lm-" + layer.key + (layer.kind === "void" ? " lm-void" : "");

  svg.append(
    polygon([project(x0,y1,z0), project(x1,y1,z0), project(x1,y1,z1), project(x0,y1,z1)], cls + " lm-top"),
    polygon([project(x0,y0,z0), project(x1,y0,z0), project(x1,y1,z0), project(x0,y1,z0)], cls + " lm-front"),
    polygon([project(x0,y0,z1), project(x0,y0,z0), project(x0,y1,z0), project(x0,y1,z1)], cls + " lm-side")
  );

  const center = project(x1, (y0 + y1) / 2, z0);
  const textX = 690;
  svg.append(line([center[0] + 8, center[1]], [textX - 12, center[1]], "lm-leader"));
  svg.append(label(
    layer.label + " · " + (layer.thickness * 1000).toFixed(layer.thickness < 0.01 ? 1 : 0) + " mm",
    textX,
    center[1] + 5,
    "lm-layer-label"
  ));
}

function render(svg, summary, model) {
  svg.replaceChildren();
  const project = projection(model);

  for (const layer of model.layers) drawPrism(svg, project, model, layer);

  const dimX = -model.width / 2 - 0.45;
  const bottom = project(dimX, 0, 0);
  const top = project(dimX, model.physicalBuildUp, 0);
  svg.append(line(bottom, top, "lm-dimension"));
  svg.append(label(
    (model.physicalBuildUp * 1000).toFixed(0) + " mm physical build-up",
    bottom[0] - 14,
    (bottom[1] + top[1]) / 2,
    "lm-dim-label",
    "end"
  ));

  svg.append(label(
    "Vertical thickness and exploded gaps are visually exaggerated for clarity.",
    28, 532, "lm-note"
  ));

  summary.textContent =
    "Physical build-up " + (model.physicalBuildUp * 1000).toFixed(0) + " mm · " +
    "solid material " + (model.solidThickness * 1000).toFixed(0) + " mm · " +
    "plan " + model.width.toFixed(1) + " × " + model.depth.toFixed(1) + " m";
}

export function createAsset(context = {}) {
  const container = context.container;
  if (!container || typeof container.appendChild !== "function") {
    throw new TypeError("createAsset requires context.container");
  }

  const root = document.createElement("section");
  root.dataset.learnmatFloorAssembly = "";
  root.setAttribute("aria-label", "Exploded floor assembly");
  root.innerHTML =
    '<style>' +
    '[data-learnmat-floor-assembly]{box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;color:#172033;background:#fff;border:1px solid #d7deea;border-radius:14px;padding:12px;display:grid;gap:8px;min-width:0}' +
    '[data-learnmat-floor-assembly] svg{width:100%;height:auto;display:block;background:linear-gradient(#f8fafc,#eef3f7);border-radius:10px}' +
    '[data-learnmat-floor-assembly] .lm-layer{stroke:#425466;stroke-width:1.1}' +
    '[data-learnmat-floor-assembly] .lm-finish{fill:#c9b18e}' +
    '[data-learnmat-floor-assembly] .lm-screed{fill:#d8d5cf}' +
    '[data-learnmat-floor-assembly] .lm-slab{fill:#b7bec6}' +
    '[data-learnmat-floor-assembly] .lm-ceilingBoard{fill:#f0eee7}' +
    '[data-learnmat-floor-assembly] .lm-void{fill:#dbe8f3;fill-opacity:.20;stroke:#6c89a5;stroke-dasharray:5 4}' +
    '[data-learnmat-floor-assembly] .lm-top{fill-opacity:.90}' +
    '[data-learnmat-floor-assembly] .lm-front{filter:brightness(.96)}' +
    '[data-learnmat-floor-assembly] .lm-side{filter:brightness(.90)}' +
    '[data-learnmat-floor-assembly] .lm-leader{stroke:#6b7b8e;stroke-width:1;stroke-dasharray:3 3}' +
    '[data-learnmat-floor-assembly] .lm-dimension{stroke:#384a5b;stroke-width:1.2;stroke-dasharray:4 3}' +
    '[data-learnmat-floor-assembly] .lm-layer-label{font-size:14px;fill:#27394b;font-weight:650}' +
    '[data-learnmat-floor-assembly] .lm-dim-label{font-size:13px;fill:#27394b;font-weight:650}' +
    '[data-learnmat-floor-assembly] .lm-note{font-size:12.5px;fill:#59697a}' +
    '[data-learnmat-floor-assembly] .lm-summary{margin:0;font-size:13px;line-height:1.45;color:#475569}' +
    '@media (prefers-reduced-motion:reduce){[data-learnmat-floor-assembly] *{scroll-behavior:auto!important}}' +
    '</style>' +
    '<svg viewBox="0 0 900 560" role="img" aria-label="Exploded floor assembly with dimensioned layers">' +
    '<title>Exploded floor assembly</title>' +
    '<desc>Dimensioned floor finish, screed, slab geometry, service void, and ceiling board shown in an exploded axonometric view.</desc>' +
    '</svg>' +
    '<p class="lm-summary" aria-live="polite"></p>';

  const svg = root.querySelector("svg");
  const summary = root.querySelector(".lm-summary");
  container.appendChild(root);

  let disposed = false;
  let parameters = { ...DEFAULT_PARAMETERS };
  let model = buildFloorAssemblyModel(parameters);
  let timeSeconds = 0;
  render(svg, summary, model);

  function assertLive() {
    if (disposed) throw new Error("Floor assembly asset has been disposed");
  }

  return {
    setParameters(next = {}) {
      assertLive();
      const candidate = buildFloorAssemblyModel({ ...parameters, ...next });
      parameters = { ...candidate.parameters };
      model = candidate;
      render(svg, summary, model);
    },
    update(nextTimeSeconds) {
      assertLive();
      if (!Number.isFinite(nextTimeSeconds)) throw new TypeError("timeSeconds must be finite");
      timeSeconds = nextTimeSeconds;
    },
    reset() {
      assertLive();
      parameters = { ...DEFAULT_PARAMETERS };
      model = buildFloorAssemblyModel(parameters);
      timeSeconds = 0;
      render(svg, summary, model);
    },
    resize(width, height, pixelRatio = 1) {
      assertLive();
      if (![width, height, pixelRatio].every(Number.isFinite)) {
        throw new TypeError("resize values must be finite");
      }
      if (width <= 0 || height <= 0 || pixelRatio <= 0) {
        throw new RangeError("resize values must be greater than zero");
      }
      root.style.width = width + "px";
      root.style.maxWidth = "100%";
      svg.style.maxHeight = height + "px";
    },
    snapshot() {
      assertLive();
      return {
        parameters: { ...parameters },
        timeSeconds,
        physicalBuildUp: model.physicalBuildUp,
        solidThickness: model.solidThickness,
        bounds: { min: { ...model.bounds.min }, max: { ...model.bounds.max } },
        layers: model.layers.map((layer) => ({
          key: layer.key,
          thickness: layer.thickness,
          bottomY: layer.bottomY,
          topY: layer.topY
        }))
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.remove();
    }
  };
}
