import { DEFAULT_SUPPORT_PARAMETERS, describeSupport, validateSupportParameters } from './model.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(name, attrs = {}, text = '') {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}

export function createAsset(context) {
  if (!context || !(context.container instanceof Element)) throw new TypeError('context.container must be a DOM Element');
  let disposed = false;
  let timeSeconds = 0;
  let parameters = { ...DEFAULT_SUPPORT_PARAMETERS };
  let viewport = { width: 640, height: 360, pixelRatio: 1 };

  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = ':host{display:block}.wrap{font:14px/1.35 system-ui,sans-serif;color:#111827;background:#fff;border:1px solid #d1d5db;border-radius:12px;padding:12px}svg{display:block;width:100%;height:auto;max-height:420px}.note{margin:.6rem 0 0}';
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const svg = svgEl('svg', { viewBox: '0 0 640 320', role: 'img', 'aria-label': 'Structural support reaction diagram' });
  const note = document.createElement('p');
  note.className = 'note';
  shadow.append(style, wrap);
  wrap.append(svg, note);
  context.container.append(host);

  function line(x1, y1, x2, y2, width = 3) {
    svg.append(svgEl('line', { x1, y1, x2, y2, stroke: 'currentColor', 'stroke-width': width, 'stroke-linecap': 'round' }));
  }
  function text(x, y, value, anchor = 'middle', size = 16, weight = 500) {
    svg.append(svgEl('text', { x, y, 'text-anchor': anchor, 'font-size': size, 'font-family': 'system-ui,sans-serif', 'font-weight': weight, fill: 'currentColor' }, value));
  }
  function arrow(x1, y1, x2, y2, label) {
    line(x1, y1, x2, y2, 3);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const s = 10;
    const points = [
      [x2, y2],
      [x2 - s * Math.cos(angle - Math.PI / 6), y2 - s * Math.sin(angle - Math.PI / 6)],
      [x2 - s * Math.cos(angle + Math.PI / 6), y2 - s * Math.sin(angle + Math.PI / 6)]
    ];
    svg.append(svgEl('polygon', { points: points.map(p => p.join(',')).join(' '), fill: 'currentColor' }));
    text(x2 + (x2 === x1 ? 18 : 0), y2 + (y2 === y1 ? -12 : 0), label, 'middle', 15, 700);
  }
  function drawSupport(type) {
    line(190, 125, 450, 125, 8);
    if (type === 'pin' || type === 'roller') {
      svg.append(svgEl('polygon', { points: '320,125 275,205 365,205', fill: 'none', stroke: 'currentColor', 'stroke-width': 4 }));
      if (type === 'roller') {
        for (const cx of [292, 320, 348]) svg.append(svgEl('circle', { cx, cy: 217, r: 9, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }));
        line(260, 230, 380, 230, 3);
      } else {
        line(260, 205, 380, 205, 3);
      }
    } else {
      line(320, 92, 320, 230, 12);
      for (let y = 98; y <= 226; y += 18) line(320, y, 344, y - 14, 2);
    }
  }
  function drawMomentArrow() {
    svg.append(svgEl('path', { d: 'M 380 205 A 62 62 0 0 0 374 111', fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    svg.append(svgEl('polygon', { points: '374,111 362,119 378,126', fill: 'currentColor' }));
    text(412, 151, 'Mz', 'middle', 15, 700);
  }
  function draw() {
    svg.replaceChildren();
    const state = describeSupport(parameters);
    text(320, 34, state.label, 'middle', 23, 750);
    text(320, 60, 'Possible reaction components for restrained planar DOF', 'middle', 14, 500);
    drawSupport(state.supportType);
    if (state.showReactionDirections) {
      if (state.possibleReactions.includes('Rx')) arrow(320, 125, 420, 125, 'Rx');
      if (state.possibleReactions.includes('Ry')) arrow(320, 125, 320, 54, 'Ry');
      if (state.possibleReactions.includes('Mz')) drawMomentArrow();
    }
    text(320, 279, 'Restrained DOF: ' + state.restrainedDofs.join(', '), 'middle', 16, 650);
    note.textContent = 'Arrows indicate admissible positive reaction components, not solved force signs or magnitudes.';
    svg.setAttribute('aria-label', state.label + '. Restrained degrees of freedom: ' + state.restrainedDofs.join(', ') + '. Possible reactions: ' + state.possibleReactions.join(', ') + '.');
  }

  draw();

  return {
    setParameters(next = {}) {
      if (disposed) throw new Error('Asset is disposed');
      parameters = validateSupportParameters(next, parameters);
      draw();
    },
    update(nextTimeSeconds) {
      if (disposed) throw new Error('Asset is disposed');
      if (!Number.isFinite(nextTimeSeconds) || nextTimeSeconds < 0) throw new RangeError('timeSeconds must be finite and nonnegative');
      timeSeconds = nextTimeSeconds;
    },
    reset() {
      if (disposed) throw new Error('Asset is disposed');
      parameters = { ...DEFAULT_SUPPORT_PARAMETERS };
      timeSeconds = 0;
      draw();
    },
    resize(width, height, pixelRatio = 1) {
      if (disposed) throw new Error('Asset is disposed');
      for (const value of [width, height, pixelRatio]) if (!Number.isFinite(value) || value <= 0) throw new RangeError('resize values must be finite and positive');
      viewport = { width, height, pixelRatio };
      host.style.width = width + 'px';
      host.style.maxWidth = '100%';
    },
    snapshot() {
      return { ...describeSupport(parameters), timeSeconds, viewport: { ...viewport } };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      host.remove();
    }
  };
}
