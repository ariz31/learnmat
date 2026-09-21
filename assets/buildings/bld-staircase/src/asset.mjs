import { DEFAULT_PARAMETERS, buildStaircaseModel } from "./model.mjs";

const NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

function line(x1, y1, x2, y2, className) {
  return el("line", { x1, y1, x2, y2, class: className });
}

function text(value, x, y, className, anchor = "start") {
  const node = el("text", { x, y, class: className, "text-anchor": anchor });
  node.textContent = value;
  return node;
}

function render(svg, summary, model) {
  svg.replaceChildren();

  const left = 110;
  const right = 680;
  const top = 70;
  const bottom = 430;
  const run = Math.max(model.flightRun, 0.001);
  const sx = (right - left) / run;
  const sy = (bottom - top) / model.parameters.totalRise;
  const scale = Math.min(sx, sy);

  const px = (x) => left + x * scale;
  const py = (y) => bottom - y * scale;

  const pathParts = ["M", px(0), py(0)];
  for (const step of model.steps) {
    pathParts.push("L", px(step.riserX), py(step.topY));
    if (step.treadEndX !== null) pathParts.push("L", px(step.treadEndX), py(step.treadY));
  }
  pathParts.push("L", px(model.flightRun), py(0), "Z");

  svg.append(el("path", { d: pathParts.join(" "), class: "lm-stair-fill" }));

  for (const step of model.steps) {
    svg.append(line(
      px(step.riserX), py(step.bottomY),
      px(step.riserX), py(step.topY),
      "lm-step-line"
    ));
    if (step.treadEndX !== null) {
      svg.append(line(
        px(step.treadStartX), py(step.treadY),
        px(step.treadEndX), py(step.treadY),
        "lm-step-line"
      ));
    }
  }

  svg.append(line(px(0), py(0), px(model.flightRun), py(model.parameters.totalRise), "lm-pitch"));
  svg.append(text(
    (model.pitchRadians * 180 / Math.PI).toFixed(1) + "° geometric pitch",
    px(model.flightRun * 0.52),
    py(model.parameters.totalRise * 0.52) - 12,
    "lm-note",
    "middle"
  ));

  const riseDimX = px(0) - 26;
  svg.append(line(riseDimX, py(0), riseDimX, py(model.riserHeight), "lm-dimension"));
  svg.append(line(riseDimX - 5, py(0), riseDimX + 5, py(0), "lm-tick"));
  svg.append(line(riseDimX - 5, py(model.riserHeight), riseDimX + 5, py(model.riserHeight), "lm-tick"));
  svg.append(text(
    "rise " + (model.riserHeight * 1000).toFixed(1) + " mm",
    riseDimX - 10,
    (py(0) + py(model.riserHeight)) / 2 + 4,
    "lm-dim-label",
    "end"
  ));

  const goingDimY = py(0) + 34;
  svg.append(line(px(0), goingDimY, px(model.parameters.going), goingDimY, "lm-dimension"));
  svg.append(line(px(0), goingDimY - 5, px(0), goingDimY + 5, "lm-tick"));
  svg.append(line(px(model.parameters.going), goingDimY - 5, px(model.parameters.going), goingDimY + 5, "lm-tick"));
  svg.append(text(
    "going " + (model.parameters.going * 1000).toFixed(0) + " mm",
    (px(0) + px(model.parameters.going)) / 2,
    goingDimY + 20,
    "lm-dim-label",
    "middle"
  ));

  const overallRiseX = px(model.flightRun) + 42;
  svg.append(line(overallRiseX, py(0), overallRiseX, py(model.parameters.totalRise), "lm-overall"));
  svg.append(text(
    model.parameters.totalRise.toFixed(2) + " m total rise",
    overallRiseX + 10,
    (py(0) + py(model.parameters.totalRise)) / 2,
    "lm-dim-label"
  ));

  const overallRunY = py(0) + 82;
  svg.append(line(px(0), overallRunY, px(model.flightRun), overallRunY, "lm-overall"));
  svg.append(text(
    model.flightRun.toFixed(2) + " m flight run",
    (px(0) + px(model.flightRun)) / 2,
    overallRunY + 22,
    "lm-dim-label",
    "middle"
  ));

  const planX = 735;
  const planW = 110;
  const planH = Math.min(175, model.parameters.width * 70);
  const planY = 405 - planH / 2;
  svg.append(el("rect", { x: planX, y: planY, width: planW, height: planH, rx: 5, class: "lm-plan" }));
  svg.append(text("Width inset", planX + planW / 2, planY - 13, "lm-note", "middle"));
  svg.append(line(planX - 15, planY, planX - 15, planY + planH, "lm-dimension"));
  svg.append(text(
    model.parameters.width.toFixed(2) + " m",
    planX - 23,
    planY + planH / 2 + 5,
    "lm-dim-label",
    "end"
  ));
  svg.append(line(planX + planW / 2, planY + planH - 20, planX + planW / 2, planY + 22, "lm-direction"));
  svg.append(el("polygon", {
    points: [
      [planX + planW / 2, planY + 14],
      [planX + planW / 2 - 6, planY + 27],
      [planX + planW / 2 + 6, planY + 27]
    ].map((p) => p.join(",")).join(" "),
    class: "lm-direction-head"
  }));

  svg.append(text(
    "Geometry only — no jurisdiction-specific compliance check.",
    28, 535, "lm-footnote"
  ));

  summary.textContent =
    model.parameters.risers + " risers · " +
    model.goings + " goings · rise " +
    (model.riserHeight * 1000).toFixed(1) + " mm · going " +
    (model.parameters.going * 1000).toFixed(0) + " mm · width " +
    model.parameters.width.toFixed(2) + " m";
}

export function createAsset(context = {}) {
  const container = context.container;
  if (!container || typeof container.appendChild !== "function") {
    throw new TypeError("createAsset requires context.container");
  }

  const root = document.createElement("section");
  root.dataset.learnmatStaircase = "";
  root.setAttribute("aria-label", "Parametric staircase geometry");
  root.innerHTML =
    '<style>' +
    '[data-learnmat-staircase]{box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;color:#172033;background:#fff;border:1px solid #d7deea;border-radius:14px;padding:12px;display:grid;gap:8px;min-width:0}' +
    '[data-learnmat-staircase] svg{width:100%;height:auto;display:block;background:linear-gradient(#f9fbfc,#eef3f7);border-radius:10px}' +
    '[data-learnmat-staircase] .lm-stair-fill{fill:#dde5ec;stroke:#34475d;stroke-width:1}' +
    '[data-learnmat-staircase] .lm-step-line{stroke:#34475d;stroke-width:1.6}' +
    '[data-learnmat-staircase] .lm-pitch{stroke:#8a6470;stroke-width:1.3;stroke-dasharray:7 5}' +
    '[data-learnmat-staircase] .lm-dimension,[data-learnmat-staircase] .lm-overall{stroke:#526476;stroke-width:1.1}' +
    '[data-learnmat-staircase] .lm-overall{stroke-dasharray:4 3}' +
    '[data-learnmat-staircase] .lm-tick{stroke:#526476;stroke-width:1.1}' +
    '[data-learnmat-staircase] .lm-plan{fill:#f7fafc;stroke:#60758a;stroke-width:1.2}' +
    '[data-learnmat-staircase] .lm-direction{stroke:#60758a;stroke-width:1.4}' +
    '[data-learnmat-staircase] .lm-direction-head{fill:#60758a}' +
    '[data-learnmat-staircase] .lm-dim-label{font-size:13px;fill:#27394b;font-weight:650}' +
    '[data-learnmat-staircase] .lm-note{font-size:12.5px;fill:#59697a}' +
    '[data-learnmat-staircase] .lm-footnote{font-size:12.5px;fill:#59697a}' +
    '[data-learnmat-staircase] .lm-summary{margin:0;font-size:13px;line-height:1.45;color:#475569}' +
    '</style>' +
    '<svg viewBox="0 0 900 560" role="img" aria-label="Parametric staircase side profile with rise, going, total rise, run, width, and pitch">' +
    '<title>Parametric staircase geometry</title>' +
    '<desc>Exact side profile of a straight stair flight with dimensioned riser height, going, overall rise, flight run, width inset, and geometric pitch.</desc>' +
    '</svg>' +
    '<p class="lm-summary" aria-live="polite"></p>';

  const svg = root.querySelector("svg");
  const summary = root.querySelector(".lm-summary");
  container.appendChild(root);

  let disposed = false;
  let parameters = { ...DEFAULT_PARAMETERS };
  let model = buildStaircaseModel(parameters);
  let timeSeconds = 0;
  render(svg, summary, model);

  function assertLive() {
    if (disposed) throw new Error("Staircase asset has been disposed");
  }

  return {
    setParameters(next = {}) {
      assertLive();
      const candidate = buildStaircaseModel({ ...parameters, ...next });
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
      model = buildStaircaseModel(parameters);
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
        riserHeight: model.riserHeight,
        goings: model.goings,
        flightRun: model.flightRun,
        pitchRadians: model.pitchRadians,
        bounds: { min: { ...model.bounds.min }, max: { ...model.bounds.max } }
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.remove();
    }
  };
}
