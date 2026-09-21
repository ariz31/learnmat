import { DEFAULT_PARAMETERS, computeSection, validateParameters } from './model.mjs';

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

function mm(valueM) {
  return Math.round(valueM * 1000);
}

function mm2(valueM2) {
  return Math.round(valueM2 * 1000000);
}

function shapeLabel(shape) {
  if (shape === 'i-section') return 'I-section';
  if (shape === 'channel') return 'channel';
  return 'angle';
}

function addText(parent, text, x, y, attrs = {}) {
  const node = svgEl('text', { x, y, ...attrs });
  node.textContent = text;
  parent.append(node);
  return node;
}

function addLine(parent, x1, y1, x2, y2, className = 'lm-dim-line') {
  parent.append(svgEl('line', { x1, y1, x2, y2, class: className }));
}

function drawDimensions(svg, geometry, x, y, w, h, p) {
  if (!p.showDimensions) return;
  const group = svgEl('g', { class: 'lm-dimensions' });
  addLine(group, x, y - 28, x + w, y - 28);
  addLine(group, x, y - 36, x, y - 20);
  addLine(group, x + w, y - 36, x + w, y - 20);
  const widthLabel = p.shape === 'angle'
    ? mm(geometry.dimensionsM.legX) + ' mm leg'
    : mm(geometry.dimensionsM.flangeWidth) + ' mm flange width';
  addText(group, widthLabel, x + w / 2, y - 40, {
    'text-anchor': 'middle',
    class: 'lm-dim-text',
  });

  addLine(group, x + w + 34, y, x + w + 34, y + h);
  addLine(group, x + w + 26, y, x + w + 42, y);
  addLine(group, x + w + 26, y + h, x + w + 42, y + h);
  const heightLabel = p.shape === 'angle'
    ? mm(geometry.dimensionsM.legY) + ' mm leg'
    : mm(geometry.dimensionsM.depth) + ' mm depth';
  const label = addText(group, heightLabel, x + w + 57, y + h / 2, {
    'text-anchor': 'middle',
    class: 'lm-dim-text',
  });
  label.setAttribute('transform', 'rotate(90 ' + (x + w + 57) + ' ' + (y + h / 2) + ')');

  svg.append(group);
}

function drawSection(svg, p, geometry) {
  const box = geometry.boundingBoxM;
  const maxW = 300;
  const maxH = 252;
  const scale = Math.min(maxW / box.width, maxH / box.height);
  const w = box.width * scale;
  const h = box.height * scale;
  const x = 282 - w / 2;
  const y = 78 + (maxH - h) / 2;
  const group = svgEl('g', { class: 'lm-section-shape' });

  if (p.shape === 'i-section') {
    const tf = p.flangeThicknessM * scale;
    const tw = p.webThicknessM * scale;
    group.append(
      svgEl('rect', { x, y, width: w, height: tf, class: 'lm-steel' }),
      svgEl('rect', { x, y: y + h - tf, width: w, height: tf, class: 'lm-steel' }),
      svgEl('rect', {
        x: x + (w - tw) / 2,
        y: y + tf,
        width: tw,
        height: h - 2 * tf,
        class: 'lm-steel',
      }),
    );
  } else if (p.shape === 'channel') {
    const tf = p.flangeThicknessM * scale;
    const tw = p.webThicknessM * scale;
    group.append(
      svgEl('rect', { x, y, width: tw, height: h, class: 'lm-steel' }),
      svgEl('rect', { x: x + tw, y, width: w - tw, height: tf, class: 'lm-steel' }),
      svgEl('rect', {
        x: x + tw,
        y: y + h - tf,
        width: w - tw,
        height: tf,
        class: 'lm-steel',
      }),
    );
  } else {
    const t = p.thicknessM * scale;
    group.append(
      svgEl('rect', { x, y, width: t, height: h, class: 'lm-steel' }),
      svgEl('rect', { x: x + t, y: y + h - t, width: w - t, height: t, class: 'lm-steel' }),
    );
  }

  svg.append(group);
  drawDimensions(svg, geometry, x, y, w, h, p);

  const legendY = 368;
  if (p.shape === 'angle') {
    addText(svg, 't = ' + mm(p.thicknessM) + ' mm', 34, legendY, { class: 'lm-legend' });
  } else {
    addText(
      svg,
      'tweb = ' + mm(p.webThicknessM) + ' mm · tflange = ' + mm(p.flangeThicknessM) + ' mm',
      34,
      legendY,
      { class: 'lm-legend' },
    );
  }
  addText(svg, 'Idealized sharp-corner geometry — not a standard section designation', 34, 395, {
    class: 'lm-note',
  });
}

function summaryText(p, geometry) {
  const area = mm2(geometry.areaM2);
  if (p.shape === 'angle') {
    return 'Idealized angle, legs ' + mm(p.legXM) + ' × ' + mm(p.legYM) +
      ' mm, thickness ' + mm(p.thicknessM) + ' mm. Geometric area ' + area +
      ' mm². Fillets and rolling tolerances are omitted.';
  }
  return 'Idealized ' + shapeLabel(p.shape) + ', depth ' + mm(p.depthM) +
    ' mm, flange width ' + mm(p.flangeWidthM) + ' mm, web ' +
    mm(p.webThicknessM) + ' mm, flange ' + mm(p.flangeThicknessM) +
    ' mm. Geometric area ' + area + ' mm². Fillets and flange taper are omitted.';
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
  root.className = 'lm-mat-steel-sections';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', 'Parametric steel section geometry');
  context.container.append(root);

  const style = document.createElement('style');
  style.textContent = [
    '.lm-mat-steel-sections{box-sizing:border-box;width:100%;min-width:260px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0f172a}',
    '.lm-mat-steel-sections *{box-sizing:border-box}',
    '.lm-mat-steel-sections .lm-frame{border:1px solid #d7dde5;border-radius:18px;background:#f8fafc;padding:12px;box-shadow:0 12px 28px rgba(15,23,42,.08)}',
    '.lm-mat-steel-sections svg{display:block;width:100%;height:auto;max-height:520px}',
    '.lm-mat-steel-sections .lm-steel{fill:#64748b;stroke:#1e293b;stroke-width:2}',
    '.lm-mat-steel-sections .lm-dim-line{stroke:#334155;stroke-width:1.4}',
    '.lm-mat-steel-sections .lm-dim-text{fill:#0f172a;font-size:14px;font-weight:650}',
    '.lm-mat-steel-sections .lm-legend{fill:#334155;font-size:14px;font-weight:650}',
    '.lm-mat-steel-sections .lm-note{fill:#64748b;font-size:13px}',
    '.lm-mat-steel-sections .lm-summary{margin:8px 6px 2px;font-size:14px;line-height:1.5;color:#334155}',
    '@media (prefers-reduced-motion:reduce){.lm-mat-steel-sections *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}',
  ].join('');
  root.append(style);

  const frame = document.createElement('div');
  frame.className = 'lm-frame';
  const svg = svgEl('svg', {
    viewBox: '0 0 640 420',
    role: 'img',
  });
  const summary = document.createElement('p');
  summary.className = 'lm-summary';
  frame.append(svg, summary);
  root.append(frame);

  const ensureLive = () => {
    if (disposed) throw new Error('Steel section asset has been disposed.');
  };

  const render = () => {
    ensureLive();
    const geometry = computeSection(parameters);
    svg.replaceChildren();
    svg.setAttribute(
      'aria-label',
      'Dimensioned idealized ' + shapeLabel(parameters.shape) + ' steel cross-section',
    );
    drawSection(svg, parameters, geometry);
    summary.textContent = summaryText(parameters, geometry);
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
          geometry: computeSection(parameters),
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
