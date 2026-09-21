import { DEFAULTS, computePipeFlow, validatePipeFlowParameters } from './model.mjs';

const fmt = (value, digits = 3) => Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });

export function createAsset(context) {
  if (!context || !context.container || typeof context.container.appendChild !== 'function') {
    throw new TypeError('context.container must be a DOM element.');
  }
  const root = document.createElement('section');
  root.className = 'lm-pipe-flow';
  root.setAttribute('aria-label', 'Pipe flow continuity and head-loss visualization');
  context.container.appendChild(root);

  let parameters = { ...DEFAULTS };
  let timeSeconds = 0;
  let disposed = false;
  let width = 760;
  let height = 300;
  let state = computePipeFlow(parameters);

  const ensureActive = () => {
    if (disposed) throw new Error('Pipe-flow asset has been disposed.');
  };

  const render = () => {
    const s = state;
    const sign = s.flowDirection || 1;
    const phase = context.reducedMotion ? 0 : ((timeSeconds * 32 * sign) % 48);
    const flowLabel = s.flowDirection === 0 ? 'No flow' : (s.flowDirection > 0 ? 'Flow left to right' : 'Flow right to left');
    const arrow = s.flowDirection < 0 ? '←' : (s.flowDirection > 0 ? '→' : '—');
    root.innerHTML =
      '<style>.lm-pipe-flow{font:14px/1.35 system-ui,sans-serif;color:#10212b;display:grid;gap:10px;max-width:100%}.lm-pipe-flow *{box-sizing:border-box}.lm-pipe-flow svg{width:100%;height:auto;display:block;border:1px solid #c8d5dc;border-radius:14px;background:#f7fbfd}.lm-pipe-flow .m{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px}.lm-pipe-flow .c{padding:8px 10px;border:1px solid #dbe5ea;border-radius:10px;background:#fff}.lm-pipe-flow b{display:block;font-size:12px;color:#48616e}.lm-pipe-flow .v{font-weight:700;font-variant-numeric:tabular-nums}</style>' +
      '<svg viewBox="0 0 760 260" role="img" aria-label="' + flowLabel + '; mean velocity ' + fmt(s.velocity) + ' metres per second; Darcy-Weisbach head loss ' + fmt(s.headLoss) + ' metres">' +
      '<rect x="70" y="92" width="620" height="78" rx="39" fill="#dfe8ed" stroke="#607d8b" stroke-width="4"/>' +
      '<rect x="78" y="103" width="604" height="56" rx="28" fill="#d8f1fb" stroke="#8ec7dc"/>' +
      '<line x1="100" y1="131" x2="660" y2="131" stroke="#1686b0" stroke-width="5" stroke-dasharray="24 24" stroke-dashoffset="' + phase + '"/>' +
      '<text x="380" y="72" text-anchor="middle" font-size="18" font-weight="700">Q = A·V  ' + arrow + '</text>' +
      '<text x="380" y="205" text-anchor="middle" font-size="15">h_f = f (L/D) V²/(2g) = ' + fmt(s.headLoss,4) + ' m</text>' +
      '<text x="105" y="235" font-size="13">L = ' + fmt(parameters.length,2) + ' m</text>' +
      '<text x="300" y="235" font-size="13">D = ' + fmt(parameters.diameter,3) + ' m</text>' +
      '<text x="505" y="235" font-size="13">ε = ' + fmt(parameters.roughness,6) + ' m</text>' +
      '</svg>' +
      '<div class="m">' +
      '<div class="c"><b>Area</b><span class="v">' + fmt(s.area,4) + ' m²</span></div>' +
      '<div class="c"><b>Mean velocity</b><span class="v">' + fmt(s.velocity,4) + ' m/s</span></div>' +
      '<div class="c"><b>Reynolds number</b><span class="v">' + fmt(s.reynolds,0) + '</span></div>' +
      '<div class="c"><b>Friction factor</b><span class="v">' + fmt(s.frictionFactor,5) + '</span></div>' +
      '<div class="c"><b>Flow regime</b><span class="v">' + s.regime + '</span></div>' +
      '<div class="c"><b>Head loss magnitude</b><span class="v">' + fmt(s.headLoss,4) + ' m</span></div>' +
      '</div>';
  };

  const recalc = () => { state = computePipeFlow(parameters); render(); };
  render();

  return {
    setParameters(values) {
      ensureActive();
      parameters = validatePipeFlowParameters({ ...parameters, ...values });
      recalc();
    },
    update(value) {
      ensureActive();
      if (!Number.isFinite(value) || value < 0) throw new RangeError('timeSeconds must be finite and non-negative.');
      timeSeconds = value;
      render();
    },
    reset() {
      ensureActive();
      parameters = { ...DEFAULTS };
      timeSeconds = 0;
      recalc();
    },
    resize(nextWidth, nextHeight, pixelRatio) {
      ensureActive();
      if (![nextWidth, nextHeight, pixelRatio].every(Number.isFinite) || nextWidth <= 0 || nextHeight <= 0 || pixelRatio <= 0) {
        throw new RangeError('resize values must be finite and greater than zero.');
      }
      width = nextWidth;
      height = nextHeight;
      root.style.maxWidth = width + 'px';
      root.style.minHeight = Math.min(height, 300) + 'px';
    },
    snapshot() {
      ensureActive();
      return { timeSeconds, parameters: { ...parameters }, state: { ...state, parameters: { ...state.parameters } }, viewport: { width, height } };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.remove();
    }
  };
}
