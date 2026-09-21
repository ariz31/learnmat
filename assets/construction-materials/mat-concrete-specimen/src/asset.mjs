import { DEFAULT_PARAMETERS, computeSpecimen, validateParameters } from './model.mjs';

function assertContainer(container) {
  if (!(container instanceof HTMLElement)) {
    throw new TypeError('context.container must be an HTMLElement.');
  }
}

function seedGenerator(seed) {
  let state = (Math.trunc(seed) >>> 0) || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function mm(valueM) {
  return Math.round(valueM * 1000);
}

function aggregateDots(count, seed, box) {
  if (!count) return '';
  const random = seedGenerator(seed);
  const dots = [];
  for (let i = 0; i < count; i += 1) {
    const x = box.x + 10 + random() * Math.max(1, box.width - 20);
    const y = box.y + 10 + random() * Math.max(1, box.height - 20);
    const r = 1.8 + random() * 4.2;
    const opacity = 0.14 + random() * 0.18;
    dots.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}" fill="#334155" opacity="${opacity.toFixed(2)}"/>`);
  }
  return dots.join('');
}

function cylinderSvg(p, seed) {
  const x = 178;
  const y = 88;
  const w = 250;
  const h = 236;
  const ellipseRy = 24;
  const dots = aggregateDots(p.aggregateLevel === 'none' ? 0 : p.aggregateLevel === 'light' ? 14 : 30, seed, {
    x,
    y: y + ellipseRy,
    width: w,
    height: h - 2 * ellipseRy,
  });
  const dimensions = p.showDimensions ? `
    <g class="lm-dim">
      <line x1="${x}" y1="55" x2="${x + w}" y2="55"/>
      <line x1="${x}" y1="47" x2="${x}" y2="64"/>
      <line x1="${x + w}" y1="47" x2="${x + w}" y2="64"/>
      <text x="${x + w / 2}" y="43" text-anchor="middle">Ø ${mm(p.diameterM)} mm nominal</text>
      <line x1="468" y1="${y}" x2="468" y2="${y + h}"/>
      <line x1="459" y1="${y}" x2="477" y2="${y}"/>
      <line x1="459" y1="${y + h}" x2="477" y2="${y + h}"/>
      <text x="486" y="${y + h / 2}" transform="rotate(90 486 ${y + h / 2})" text-anchor="middle">${mm(p.heightM)} mm nominal</text>
    </g>` : '';

  return `
    <g>
      <rect x="${x}" y="${y + ellipseRy}" width="${w}" height="${h - 2 * ellipseRy}" class="lm-concrete"/>
      <ellipse cx="${x + w / 2}" cy="${y + ellipseRy}" rx="${w / 2}" ry="${ellipseRy}" class="lm-top"/>
      <path d="M ${x} ${y + h - ellipseRy} A ${w / 2} ${ellipseRy} 0 0 0 ${x + w} ${y + h - ellipseRy}" class="lm-bottom"/>
      ${dots}
      <path d="M ${x + 30} ${y + 35} C ${x + 45} ${y + 70}, ${x + 38} ${y + 170}, ${x + 54} ${y + h - 38}" class="lm-highlight"/>
      ${dimensions}
    </g>`;
}

function cubeSvg(p, seed) {
  const x = 195;
  const y = 126;
  const s = 184;
  const dx = 58;
  const dy = -40;
  const dots = aggregateDots(p.aggregateLevel === 'none' ? 0 : p.aggregateLevel === 'light' ? 12 : 26, seed, {
    x,
    y,
    width: s,
    height: s,
  });
  const dimensions = p.showDimensions ? `
    <g class="lm-dim">
      <line x1="${x}" y1="${y + s + 38}" x2="${x + s}" y2="${y + s + 38}"/>
      <line x1="${x}" y1="${y + s + 29}" x2="${x}" y2="${y + s + 47}"/>
      <line x1="${x + s}" y1="${y + s + 29}" x2="${x + s}" y2="${y + s + 47}"/>
      <text x="${x + s / 2}" y="${y + s + 64}" text-anchor="middle">${mm(p.sideM)} mm nominal side</text>
    </g>` : '';

  return `
    <g>
      <polygon points="${x},${y} ${x + dx},${y + dy} ${x + s + dx},${y + dy} ${x + s},${y}" class="lm-top"/>
      <polygon points="${x + s},${y} ${x + s + dx},${y + dy} ${x + s + dx},${y + s + dy} ${x + s},${y + s}" class="lm-side"/>
      <rect x="${x}" y="${y}" width="${s}" height="${s}" class="lm-concrete"/>
      ${dots}
      <path d="M ${x + 25} ${y + 16} C ${x + 42} ${y + 70}, ${x + 32} ${y + 130}, ${x + 48} ${y + s - 15}" class="lm-highlight"/>
      ${dimensions}
    </g>`;
}

function summaryText(p, geometry) {
  const volumeL = geometry.volumeM3 * 1000;
  if (p.shape === 'cylinder') {
    return `Concrete cylinder specimen, nominal diameter ${mm(p.diameterM)} millimetres and height ${mm(p.heightM)} millimetres. Geometric volume ${volumeL.toFixed(3)} litres. Surface texture is illustrative only.`;
  }
  return `Concrete cube specimen, nominal side ${mm(p.sideM)} millimetres. Geometric volume ${volumeL.toFixed(3)} litres. Surface texture is illustrative only.`;
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
  root.className = 'lm-mat-concrete-specimen';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', 'Concrete specimen geometry');
  context.container.append(root);

  const ensureLive = () => {
    if (disposed) throw new Error('Concrete specimen asset has been disposed.');
  };

  const render = () => {
    ensureLive();
    const geometry = computeSpecimen(parameters);
    const shapeMarkup = parameters.shape === 'cylinder'
      ? cylinderSvg(parameters, context.seed)
      : cubeSvg(parameters, context.seed);

    root.innerHTML = `
      <style>
        .lm-mat-concrete-specimen{box-sizing:border-box;width:100%;min-width:260px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#0f172a}
        .lm-mat-concrete-specimen *{box-sizing:border-box}
        .lm-mat-concrete-specimen .lm-frame{border:1px solid #d7dde5;border-radius:18px;background:#f8fafc;padding:12px;box-shadow:0 12px 28px rgba(15,23,42,.08)}
        .lm-mat-concrete-specimen svg{display:block;width:100%;height:auto;max-height:520px}
        .lm-mat-concrete-specimen .lm-concrete{fill:#cbd0d4;stroke:#475569;stroke-width:2}
        .lm-mat-concrete-specimen .lm-top{fill:#dde1e4;stroke:#475569;stroke-width:2}
        .lm-mat-concrete-specimen .lm-side{fill:#b9c0c6;stroke:#475569;stroke-width:2}
        .lm-mat-concrete-specimen .lm-bottom{fill:none;stroke:#64748b;stroke-width:2}
        .lm-mat-concrete-specimen .lm-highlight{fill:none;stroke:#fff;stroke-width:9;stroke-linecap:round;opacity:.30}
        .lm-mat-concrete-specimen .lm-dim line{stroke:#334155;stroke-width:1.5}
        .lm-mat-concrete-specimen .lm-dim text{fill:#0f172a;font-size:15px;font-weight:650;letter-spacing:.01em}
        .lm-mat-concrete-specimen .lm-summary{margin:8px 6px 2px;font-size:14px;line-height:1.5;color:#334155}
        @media (prefers-reduced-motion:reduce){.lm-mat-concrete-specimen *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
      </style>
      <div class="lm-frame">
        <svg viewBox="0 0 640 410" role="img" aria-label="${parameters.shape === 'cylinder' ? 'Dimensioned concrete cylinder specimen' : 'Dimensioned concrete cube specimen'}">
          ${shapeMarkup}
          <text x="28" y="378" fill="#475569" font-size="13">Illustrative surface appearance — not aggregate scale or measured material data</text>
        </svg>
        <p class="lm-summary">${summaryText(parameters, geometry)}</p>
      </div>`;
  };

  render();

  return {
    setParameters(values) {
      ensureLive();
      const next = validateParameters({ ...parameters, ...values });
      parameters = { ...next };
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
          geometry: computeSpecimen(parameters),
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
