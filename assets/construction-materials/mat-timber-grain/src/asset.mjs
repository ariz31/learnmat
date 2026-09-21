import { DEFAULT_PARAMETERS, computeTimberSpecimen, validateParameters } from './model.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';

function assertContainer(container) {
  if (!(container instanceof HTMLElement)) {
    throw new TypeError('context.container must be an HTMLElement.');
  }
}

function svgEl(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

function addText(parent, value, x, y, attrs = {}) {
  const node = svgEl('text', { x, y, ...attrs });
  node.textContent = value;
  parent.append(node);
  return node;
}

function addLine(parent, x1, y1, x2, y2, className) {
  parent.append(svgEl('line', { x1, y1, x2, y2, class: className }));
}

function mm(valueM) {
  return Math.round(valueM * 1000);
}

function degrees(valueRad) {
  return valueRad * 180 / Math.PI;
}

function seeded(seed) {
  let state = (Math.trunc(seed) >>> 0) || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function lineInsideRectangle(width, height, angle, offset) {
  const dx = Math.cos(angle);
  const dy = -Math.sin(angle);
  const nx = -dy;
  const ny = dx;
  const px = width / 2 + nx * offset;
  const py = height / 2 + ny * offset;
  let tMin = -Infinity;
  let tMax = Infinity;
  const epsilon = 1e-9;

  function constrain(position, direction, minValue, maxValue) {
    if (Math.abs(direction) < epsilon) {
      return position >= minValue && position <= maxValue;
    }
    let a = (minValue - position) / direction;
    let b = (maxValue - position) / direction;
    if (a > b) [a, b] = [b, a];
    tMin = Math.max(tMin, a);
    tMax = Math.min(tMax, b);
    return tMin <= tMax;
  }

  if (!constrain(px, dx, 0, width)) return null;
  if (!constrain(py, dy, 0, height)) return null;

  return {
    x1: px + dx * tMin,
    y1: py + dy * tMin,
    x2: px + dx * tMax,
    y2: py + dy * tMax,
  };
}

function grainCount(level) {
  if (level === 'none') return 0;
  if (level === 'light') return 9;
  if (level === 'medium') return 15;
  return 22;
}

function drawGrain(svg, x, y, width, height, angle, density, seed) {
  const count = grainCount(density);
  if (!count) return;
  const random = seeded(seed);
  const diagonal = Math.hypot(width, height);
  const spacing = diagonal / (count + 1);

  for (let i = 1; i <= count; i += 1) {
    const nominal = -diagonal / 2 + i * spacing;
    const offset = nominal + (random() - 0.5) * spacing * 0.28;
    const segment = lineInsideRectangle(width, height, angle, offset);
    if (!segment) continue;
    const line = svgEl('line', {
      x1: x + segment.x1,
      y1: y + segment.y1,
      x2: x + segment.x2,
      y2: y + segment.y2,
      class: 'lm-grain-line',
      opacity: (0.32 + random() * 0.30).toFixed(2),
      'stroke-width': (1.2 + random() * 1.6).toFixed(2),
    });
    svg.append(line);
  }
}

function drawArrow(svg, x, y, length, angle, label) {
  const dx = Math.cos(angle);
  const dy = -Math.sin(angle);
  const ex = x + dx * length;
  const ey = y + dy * length;
  addLine(svg, x, y, ex, ey, 'lm-axis-line');
  const back = 11;
  const half = 5;
  const px = -dy;
  const py = dx;
  svg.append(svgEl('polygon', {
    points:
      ex + ',' + ey + ' ' +
      (ex - dx * back + px * half) + ',' + (ey - dy * back + py * half) + ' ' +
      (ex - dx * back - px * half) + ',' + (ey - dy * back - py * half),
    class: 'lm-axis-head',
  }));
  addText(svg, label, ex + 8, ey - 8, { class: 'lm-axis-label' });
}

function drawDimensions(svg, x, y, width, height, p) {
  if (!p.showDimensions) return;
  addLine(svg, x, y + height + 30, x + width, y + height + 30, 'lm-dim-line');
  addLine(svg, x, y + height + 22, x, y + height + 38, 'lm-dim-line');
  addLine(svg, x + width, y + height + 22, x + width, y + height + 38, 'lm-dim-line');
  addText(svg, mm(p.lengthM) + ' mm length', x + width / 2, y + height + 52, {
    'text-anchor': 'middle',
    class: 'lm-dim-text',
  });

  addLine(svg, x - 30, y, x - 30, y + height, 'lm-dim-line');
  addLine(svg, x - 38, y, x - 22, y, 'lm-dim-line');
  addLine(svg, x - 38, y + height, x - 22, y + height, 'lm-dim-line');
  const label = addText(svg, mm(p.widthM) + ' mm width', x - 50, y + height / 2, {
    'text-anchor': 'middle',
    class: 'lm-dim-text',
  });
  label.setAttribute('transform', 'rotate(-90 ' + (x - 50) + ' ' + (y + height / 2) + ')');
}

function summaryText(p, result) {
  const volumeCm3 = result.volumeM3 * 1000000;
  return 'Timber specimen ' + mm(p.lengthM) + ' × ' + mm(p.widthM) + ' × ' +
    mm(p.thicknessM) + ' mm. Surface grain indicator is ' +
    degrees(p.grainAngleRad).toFixed(1) + '° from the specimen longitudinal axis. ' +
    'Geometric volume ' + volumeCm3.toFixed(1) +
    ' cm³. Grain lines are illustrative and carry no species, grade, or strength meaning.';
}

export function createAsset(context) {
  if (!context || typeof context !== 'object') throw new TypeError('context is required.');
  assertContainer(context.container);
  if (!Number.isFinite(context.seed)) throw new TypeError('context.seed must be finite.');

  let disposed = false;
  let parameters = { ...DEFAULT_PARAMETERS };
  let timeSeconds = 0;
  let viewport = { width: null, height: null, pixelRatio: null };

  const root = document.createElement('section');
  root.className = 'lm-mat-timber-grain';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', 'Timber specimen grain orientation');
  context.container.append(root);

  const style = document.createElement('style');
  style.textContent = [
    '.lm-mat-timber-grain{box-sizing:border-box;width:100%;min-width:260px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0f172a}',
    '.lm-mat-timber-grain *{box-sizing:border-box}',
    '.lm-mat-timber-grain .lm-frame{border:1px solid #d7dde5;border-radius:18px;background:#f8fafc;padding:12px;box-shadow:0 12px 28px rgba(15,23,42,.08)}',
    '.lm-mat-timber-grain svg{display:block;width:100%;height:auto;max-height:520px}',
    '.lm-mat-timber-grain .lm-board{fill:#d5a96f;stroke:#6b4423;stroke-width:2}',
    '.lm-mat-timber-grain .lm-grain-line{stroke:#7b4f28;stroke-linecap:round}',
    '.lm-mat-timber-grain .lm-dim-line{stroke:#334155;stroke-width:1.4}',
    '.lm-mat-timber-grain .lm-dim-text{fill:#0f172a;font-size:14px;font-weight:650}',
    '.lm-mat-timber-grain .lm-axis-line{stroke:#0f172a;stroke-width:2}',
    '.lm-mat-timber-grain .lm-axis-head{fill:#0f172a}',
    '.lm-mat-timber-grain .lm-axis-label{fill:#0f172a;font-size:14px;font-weight:750}',
    '.lm-mat-timber-grain .lm-note{fill:#64748b;font-size:13px}',
    '.lm-mat-timber-grain .lm-summary{margin:8px 6px 2px;font-size:14px;line-height:1.5;color:#334155}',
    '@media (prefers-reduced-motion:reduce){.lm-mat-timber-grain *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}',
  ].join('');
  root.append(style);

  const frame = document.createElement('div');
  frame.className = 'lm-frame';
  const svg = svgEl('svg', {
    viewBox: '0 0 700 430',
    role: 'img',
  });
  const summary = document.createElement('p');
  summary.className = 'lm-summary';
  frame.append(svg, summary);
  root.append(frame);

  const ensureLive = () => {
    if (disposed) throw new Error('Timber grain asset has been disposed.');
  };

  const render = () => {
    ensureLive();
    const result = computeTimberSpecimen(parameters);
    svg.replaceChildren();
    svg.setAttribute(
      'aria-label',
      'Dimensioned timber specimen with stylized surface grain orientation',
    );

    const maxWidth = 470;
    const maxHeight = 150;
    const ratio = parameters.widthM / parameters.lengthM;
    const boardWidth = maxWidth;
    const boardHeight = Math.min(maxHeight, Math.max(60, boardWidth * ratio));
    const x = 120;
    const y = 138 - boardHeight / 2 + 45;

    svg.append(svgEl('rect', {
      x,
      y,
      width: boardWidth,
      height: boardHeight,
      rx: 5,
      class: 'lm-board',
    }));

    drawGrain(
      svg,
      x,
      y,
      boardWidth,
      boardHeight,
      parameters.grainAngleRad,
      parameters.grainDensity,
      context.seed,
    );
    drawDimensions(svg, x, y, boardWidth, boardHeight, parameters);

    if (parameters.showOrientation) {
      const baseY = 95;
      drawArrow(svg, 180, baseY, 112, 0, 'specimen +X');
      drawArrow(
        svg,
        180,
        baseY,
        112,
        parameters.grainAngleRad,
        'grain ' + degrees(parameters.grainAngleRad).toFixed(1) + '°',
      );
    }

    const endScale = Math.min(150 / parameters.widthM, 70 / parameters.thicknessM);
    const endW = parameters.widthM * endScale;
    const endH = parameters.thicknessM * endScale;
    const endX = 350 - endW / 2;
    const endY = 322;
    svg.append(svgEl('rect', {
      x: endX,
      y: endY,
      width: endW,
      height: endH,
      class: 'lm-board',
    }));
    addText(svg, 'end view · thickness ' + mm(parameters.thicknessM) + ' mm', 350, endY + endH + 24, {
      'text-anchor': 'middle',
      class: 'lm-dim-text',
    });
    addText(svg, 'Stylized surface grain — not species anatomy, defect grade, or measured property data', 35, 412, {
      class: 'lm-note',
    });

    summary.textContent = summaryText(parameters, result);
  };

  render();

  return {
    setParameters(values) {
      ensureLive();
      parameters = validateParameters({ ...parameters, ...values });
      render();
    },
    update(nextTimeSeconds) {
      ensureLive();
      if (!Number.isFinite(nextTimeSeconds) || nextTimeSeconds < 0) {
        throw new RangeError('timeSeconds must be a finite non-negative number.');
      }
      timeSeconds = nextTimeSeconds;
    },
    reset() {
      ensureLive();
      parameters = { ...DEFAULT_PARAMETERS };
      timeSeconds = 0;
      render();
    },
    resize(width, height, pixelRatio) {
      ensureLive();
      if (![width, height, pixelRatio].every((value) => Number.isFinite(value) && value > 0)) {
        throw new RangeError('resize width, height, and pixelRatio must be finite positive numbers.');
      }
      viewport = { width, height, pixelRatio };
    },
    snapshot() {
      ensureLive();
      return {
        timeSeconds,
        parameters: { ...parameters },
        state: {
          specimen: computeTimberSpecimen(parameters),
          seed: context.seed,
          reducedMotion: Boolean(context.reducedMotion),
          viewport: { ...viewport },
        },
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.remove();
    },
  };
}
