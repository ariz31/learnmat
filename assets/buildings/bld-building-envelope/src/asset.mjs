import { DEFAULT_PARAMETERS, buildEnvelopeModel } from "./model.mjs";

const NS = "http://www.w3.org/2000/svg";

function svgElement(name, attributes = {}) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }
  return node;
}

function polygon(points, className) {
  return svgElement("polygon", {
    points: points.map((point) => point.join(",")).join(" "),
    class: className
  });
}

function line(a, b, className) {
  return svgElement("line", {
    x1: a[0],
    y1: a[1],
    x2: b[0],
    y2: b[1],
    class: className
  });
}

function textAt(label, point, className, anchor = "middle") {
  const node = svgElement("text", {
    x: point[0],
    y: point[1],
    class: className,
    "text-anchor": anchor
  });
  node.textContent = label;
  return node;
}

function projectFactory(model) {
  const usableWidth = 540;
  const usableHeight = 390;
  const sx = usableWidth / (model.width + model.depth * 0.58);
  const sy = usableHeight / (model.height + model.depth * 0.34);
  const scale = Math.max(4, Math.min(sx, sy));
  const ox = 390;
  const oy = 465;
  return (x, y, z) => {
    const d = -z;
    return [
      ox + x * scale - d * scale * 0.52,
      oy - y * scale - d * scale * 0.27
    ];
  };
}

function renderScene(svg, summary, model) {
  svg.replaceChildren();
  const project = projectFactory(model);
  const p = (x, y, z) => project(x, y, z);
  const x0 = -model.width / 2;
  const x1 = model.width / 2;
  const z0 = 0;
  const z1 = -model.depth;
  const h = model.height;
  const cutX = x1 - model.width * model.parameters.cutaway;

  const ground = polygon(
    [p(x0 - 1.4, 0, 1.1), p(x1 + 1.4, 0, 1.1), p(x1 + 1.4, 0, z1 - 1.2), p(x0 - 1.4, 0, z1 - 1.2)],
    "lm-ground"
  );
  svg.append(ground);

  const roof = polygon(
    [p(x0, h, z0), p(cutX, h, z0), p(cutX, h, z1), p(x0, h, z1)],
    "lm-roof"
  );
  svg.append(roof);

  const leftWall = polygon(
    [p(x0, 0, z0), p(x0, h, z0), p(x0, h, z1), p(x0, 0, z1)],
    "lm-side"
  );
  svg.append(leftWall);

  const backWall = polygon(
    [p(x0, 0, z1), p(cutX, 0, z1), p(cutX, h, z1), p(x0, h, z1)],
    "lm-back"
  );
  svg.append(backWall);

  for (const elevation of model.floorElevations) {
    const slab = polygon(
      [p(x0, elevation, z0), p(x1, elevation, z0), p(x1, elevation, z1), p(x0, elevation, z1)],
      elevation === 0 ? "lm-slab lm-slab-base" : "lm-slab"
    );
    svg.append(slab);
  }

  const front = polygon(
    [p(x0, 0, z0), p(cutX, 0, z0), p(cutX, h, z0), p(x0, h, z0)],
    "lm-front"
  );
  svg.append(front);

  for (const opening of model.openings) {
    const half = opening.width / 2;
    const left = opening.centerX - half;
    const right = opening.centerX + half;
    if (right > cutX) continue;
    const bottom = opening.bottomY;
    const top = bottom + opening.height;
    svg.append(polygon(
      [p(left, bottom, z0 - 0.012), p(right, bottom, z0 - 0.012), p(right, top, z0 - 0.012), p(left, top, z0 - 0.012)],
      "lm-opening"
    ));
  }

  svg.append(line(p(cutX, 0, z0), p(cutX, h, z0), "lm-cut"));
  svg.append(line(p(cutX, 0, z0), p(cutX, 0, z1), "lm-cut"));
  svg.append(line(p(cutX, h, z0), p(cutX, h, z1), "lm-cut"));

  const widthA = p(x0, -0.55, z0);
  const widthB = p(x1, -0.55, z0);
  svg.append(line(widthA, widthB, "lm-dimension"));
  svg.append(textAt(model.width.toFixed(1) + " m width", [(widthA[0] + widthB[0]) / 2, widthA[1] + 20], "lm-label"));

  const heightA = p(x0 - 0.7, 0, z0);
  const heightB = p(x0 - 0.7, h, z0);
  svg.append(line(heightA, heightB, "lm-dimension"));
  svg.append(textAt(model.height.toFixed(1) + " m", [heightA[0] - 10, (heightA[1] + heightB[1]) / 2], "lm-label", "end"));

  const depthA = p(x0 - 0.55, 0, z0);
  const depthB = p(x0 - 0.55, 0, z1);
  svg.append(line(depthA, depthB, "lm-dimension"));
  svg.append(textAt(model.depth.toFixed(1) + " m depth", [(depthA[0] + depthB[0]) / 2 - 16, (depthA[1] + depthB[1]) / 2 - 8], "lm-label", "end"));

  summary.textContent =
    model.parameters.floors + " floors · " +
    model.parameters.bays + " bays · " +
    model.openings.length + " facade openings · cutaway " +
    Math.round(model.parameters.cutaway * 100) + "%";
}

export function createAsset(context = {}) {
  const container = context.container;
  if (!container || typeof container.appendChild !== "function") {
    throw new TypeError("createAsset requires context.container");
  }

  const root = document.createElement("section");
  root.dataset.learnmatEnvelope = "";
  root.setAttribute("aria-label", "Parametric building envelope");
  root.innerHTML =
    '<style>' +
    '[data-learnmat-envelope]{box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;color:#172033;background:#fff;border:1px solid #d7deea;border-radius:14px;padding:12px;display:grid;gap:8px;min-width:0}' +
    '[data-learnmat-envelope] svg{width:100%;height:auto;display:block;min-height:280px;background:linear-gradient(#f7f9fc,#eef3f8);border-radius:10px}' +
    '[data-learnmat-envelope] .lm-ground{fill:#e7ebe4;stroke:#bdc6b7;stroke-width:1}' +
    '[data-learnmat-envelope] .lm-front{fill:#d9e4f0;stroke:#34475d;stroke-width:1.4}' +
    '[data-learnmat-envelope] .lm-side{fill:#c2d1e0;stroke:#34475d;stroke-width:1.4}' +
    '[data-learnmat-envelope] .lm-back{fill:#edf3f8;stroke:#60758a;stroke-width:1}' +
    '[data-learnmat-envelope] .lm-roof{fill:#eef2f5;stroke:#34475d;stroke-width:1.2}' +
    '[data-learnmat-envelope] .lm-slab{fill:#f9fbfd;fill-opacity:.88;stroke:#70859a;stroke-width:1}' +
    '[data-learnmat-envelope] .lm-slab-base{fill:#dfe6ec}' +
    '[data-learnmat-envelope] .lm-opening{fill:#5f7895;stroke:#24384d;stroke-width:.7}' +
    '[data-learnmat-envelope] .lm-cut{stroke:#c15454;stroke-width:2;stroke-dasharray:6 4;fill:none}' +
    '[data-learnmat-envelope] .lm-dimension{stroke:#384a5b;stroke-width:1;stroke-dasharray:3 3}' +
    '[data-learnmat-envelope] .lm-label{font-size:13px;fill:#27394b;font-weight:650}' +
    '[data-learnmat-envelope] .lm-summary{margin:0;font-size:13px;line-height:1.45;color:#475569}' +
    '@media (prefers-reduced-motion:reduce){[data-learnmat-envelope] *{scroll-behavior:auto!important}}' +
    '</style>' +
    '<svg viewBox="0 0 860 560" role="img" aria-label="Parametric building envelope cutaway">' +
    '<title>Parametric building envelope cutaway</title>' +
    '<desc>Axonometric building shell with floor slabs, facade openings, overall dimensions, and a cutaway plane.</desc>' +
    '</svg>' +
    '<p class="lm-summary" aria-live="polite"></p>';

  const svg = root.querySelector("svg");
  const summary = root.querySelector(".lm-summary");
  container.appendChild(root);

  let disposed = false;
  let parameters = { ...DEFAULT_PARAMETERS };
  let model = buildEnvelopeModel(parameters);
  let timeSeconds = 0;
  renderScene(svg, summary, model);

  function assertLive() {
    if (disposed) throw new Error("Building envelope asset has been disposed");
  }

  return {
    setParameters(next = {}) {
      assertLive();
      const candidate = buildEnvelopeModel({ ...parameters, ...next });
      parameters = { ...candidate.parameters };
      model = candidate;
      renderScene(svg, summary, model);
    },
    update(nextTimeSeconds) {
      assertLive();
      if (!Number.isFinite(nextTimeSeconds)) throw new TypeError("timeSeconds must be finite");
      timeSeconds = nextTimeSeconds;
    },
    reset() {
      assertLive();
      parameters = { ...DEFAULT_PARAMETERS };
      model = buildEnvelopeModel(parameters);
      timeSeconds = 0;
      renderScene(svg, summary, model);
    },
    resize(width, height, pixelRatio = 1) {
      assertLive();
      if (![width, height, pixelRatio].every(Number.isFinite)) {
        throw new TypeError("resize values must be finite");
      }
      if (width <= 0 || height <= 0 || pixelRatio <= 0) {
        throw new RangeError("resize values must be greater than zero");
      }
      root.style.maxWidth = width + "px";
    },
    snapshot() {
      assertLive();
      return {
        parameters: { ...parameters },
        timeSeconds,
        bounds: {
          min: { ...model.bounds.min },
          max: { ...model.bounds.max }
        },
        floorElevations: [...model.floorElevations],
        openingCount: model.openings.length,
        cutawayDepth: model.cutawayDepth
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.remove();
    }
  };
}
