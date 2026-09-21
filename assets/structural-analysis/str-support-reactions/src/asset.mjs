const SVG_NS = 'http://www.w3.org/2000/svg';
const SUPPORTS = {
  pin: { restrained: ['x', 'y'], reactions: ['Rx', 'Ry'], label: 'Pin support' },
  roller: { restrained: ['y'], reactions: ['Ry'], label: 'Roller support on horizontal surface' },
  fixed: { restrained: ['x', 'y', 'rz'], reactions: ['Rx', 'Ry', 'Mz'], label: 'Fixed support' }
};
const DEFAULTS = Object.freeze({ supportType: 'pin', showReactionDirections: true });

function svgEl(name, attrs = {}, text = '') {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}

function requireContainer(context) {
  if (!context || !(context.container instanceof Element)) throw new TypeError('context.container must be a DOM Element');
}

function validateParameters(next, current) {
  const merged = { ...current, ...next };
  if (!Object.hasOwn(SUPPORTS, merged.supportType)) throw new RangeError('supportType must be pin, roller, or fixed');
  if (typeof merged.showReactionDirections !== 'boolean') throw new TypeError('showReactionDirections must be boolean');
  return merged;
}

export function createAsset(context) {
  requireContainer(context);
  let disposed = false;
  let timeSeconds = 0;
  let parameters = { ...DEFAULTS };
  let viewport = { width: 640, height: 360, pixelRatio: 1 };

  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = ':host{display:block} .wrap{font:14px/1.35 system-ui,sans-serif;color:CanvasText;background:Canvas;border:1px solid color-mix(in srgb,CanvasText 18%,transparent);border-radius:12px;padding:12px} svg{display:block;width:100%;height:auto;max-height:420px} .note{margin:.6rem 0 0}';
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
    const p1 = [x2, y2];
    const p2 = [x2 - s * Math.cos(angle - Math.PI / 6), y2 - s * Math.sin(angle - Math.PI / 6)];
    const p3 = [x2 - s * Math.cos(angle + Math.PI / 6), y2 - s * Math.sin(angle + Math.PI / 6)];
    svg.append(svgEl('polygon', { points: [p1, p2, p3].map(p => p.join(',')).join(' '), fill: 'currentColor' }));
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
    const path = svgEl('path', { d: 'M 380 205 A 62 62 0 0 0 374 111', fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' });
    svg.append(path);
    svg.append(svgEl('polygon', { points: '374,111 362,119 378,126', fill: 'currentColor' }));
    text(412, 151, 'Mz', 'middle', 15, 700);
  }

  function draw() {
    svg.replaceChildren();
    const data = SUPPORTS[parameters.supportType];
    text(320, 34, data.label, 'middle', 23, 750);
    text(320, 60, 'Possible reaction components for restrained planar DOF', 'middle', 14, 500);
    drawSupport(parameters.supportType);
    if (parameters.showReactionDirections) {
      if (data.reactions.includes('Rx')) arrow(320, 125, 420, 125, 'Rx');
      if (data.reactions.includes('Ry')) arrow(320, 125, 320, 54, 'Ry');
      if (data.reactions.includes('Mz')) drawMomentArrow();
    }
    text(320, 279, 'Restrained DOF: ' + data.restrained.join(', '), 'middle', 16, 650);
    note.textContent = 'Arrows indicate admissible positive reaction components, not solved force signs or magnitudes.';
    svg.setAttribute('aria-label', data.label + '. Restrained degrees of freedom: ' + data.restrained.join(', ') + '. Possible reactions: ' + data.reactions.join(', ') + '.');
  }

  draw();

  return {
    setParameters(next = {}) {
      if (disposed) throw new Error('Asset is disposed');
      parameters = validateParameters(next, parameters);
      draw();
    },
    update(nextTimeSeconds) {
      if (disposed) throw new Error('Asset is disposed');
      if (!Number.isFinite(nextTimeSeconds) || nextTimeSeconds < 0) throw new RangeError('timeSeconds must be finite and nonnegative');
      timeSeconds = nextTimeSeconds;
    },
    reset() {
      if (disposed) throw new Error('Asset is disposed');
      parameters = { ...DEFAULTS };
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
      const data = SUPPORTS[parameters.supportType];
      return { parameters: { ...parameters }, restrainedDofs: [...data.restrained], possibleReactions: [...data.reactions], timeSeconds, viewport: { ...viewport } };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      host.remove();
    }
  };
}
