const SVG_NS = 'http://www.w3.org/2000/svg';

const DEFAULTS = Object.freeze({ pathLength: 10, speed: 1.2, stepFrequency: 1.7, personHeight: 1.75 });
const LIMITS = Object.freeze({
  pathLength: [0.5, 50],
  speed: [0, 2.5],
  stepFrequency: [0.5, 3],
  personHeight: [1.4, 2.1]
});

function svgNode(name, attributes = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, String(value));
  return el;
}

function validate(name, value) {
  const [min, max] = LIMITS[name];
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(name + ' must be finite and between ' + min + ' and ' + max + '.');
  }
}

function normalize(next) {
  const merged = { ...DEFAULTS, ...next };
  for (const key of Object.keys(LIMITS)) validate(key, merged[key]);
  return merged;
}

export function createAsset(context = {}) {
  const container = context.container;
  if (!container || typeof container.appendChild !== 'function') {
    throw new TypeError('createAsset requires a DOM container.');
  }

  let disposed = false;
  let timeSeconds = 0;
  let params = normalize({});
  const reducedMotion = Boolean(context.reducedMotion);

  const root = document.createElement('div');
  root.setAttribute('data-learnmat-asset', 'sur-walking-person');
  root.style.width = '100%';
  root.style.maxWidth = '760px';
  root.style.fontFamily = 'system-ui, sans-serif';
  root.style.color = 'CanvasText';

  const svg = svgNode('svg', {
    viewBox: '0 0 720 400',
    role: 'img',
    'aria-label': 'Animated surveying field person walking along a measured straight path'
  });
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.style.display = 'block';

  const ground = svgNode('line', { x1: 70, y1: 320, x2: 650, y2: 320, stroke: 'currentColor', 'stroke-width': 3 });
  const start = svgNode('line', { x1: 80, y1: 300, x2: 80, y2: 335, stroke: 'currentColor', 'stroke-width': 2 });
  const end = svgNode('line', { x1: 640, y1: 300, x2: 640, y2: 335, stroke: 'currentColor', 'stroke-width': 2 });
  const pathLabel = svgNode('text', { x: 360, y: 355, 'text-anchor': 'middle', 'font-size': 18, fill: 'currentColor' });
  const statusLabel = svgNode('text', { x: 360, y: 45, 'text-anchor': 'middle', 'font-size': 18, fill: 'currentColor' });

  const person = svgNode('g');
  const head = svgNode('circle', { cx: 0, cy: -142, r: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 5 });
  const torso = svgNode('line', { x1: 0, y1: -124, x2: 0, y2: -66, stroke: 'currentColor', 'stroke-width': 7, 'stroke-linecap': 'round' });
  const armA = svgNode('line', { x1: 0, y1: -112, x2: -28, y2: -72, stroke: 'currentColor', 'stroke-width': 6, 'stroke-linecap': 'round' });
  const armB = svgNode('line', { x1: 0, y1: -112, x2: 28, y2: -72, stroke: 'currentColor', 'stroke-width': 6, 'stroke-linecap': 'round' });
  const legA = svgNode('line', { x1: 0, y1: -66, x2: -18, y2: 0, stroke: 'currentColor', 'stroke-width': 7, 'stroke-linecap': 'round' });
  const legB = svgNode('line', { x1: 0, y1: -66, x2: 18, y2: 0, stroke: 'currentColor', 'stroke-width': 7, 'stroke-linecap': 'round' });
  person.append(head, torso, armA, armB, legA, legB);
  svg.append(ground, start, end, pathLabel, statusLabel, person);
  root.appendChild(svg);
  container.appendChild(root);

  function ensureActive() {
    if (disposed) throw new Error('Asset has been disposed.');
  }

  function stateAt(t) {
    const safeTime = Math.max(0, t);
    const moving = params.speed > 0;
    const arrivalTime = moving ? params.pathLength / params.speed : Infinity;
    const activeTime = moving ? Math.min(safeTime, arrivalTime) : 0;
    const distance = moving ? Math.min(params.pathLength, params.speed * safeTime) : 0;
    const phase = 2 * Math.PI * params.stepFrequency * activeTime;
    return { safeTime, arrivalTime, distance, phase };
  }

  function render() {
    const state = stateAt(timeSeconds);
    const normalized = state.distance / params.pathLength;
    const x = 80 + normalized * 560;
    const scale = params.personHeight / 1.75;
    const walking = params.speed > 0 && state.distance < params.pathLength;
    const swing = reducedMotion || !walking ? 0 : Math.sin(state.phase) * 24;
    const bob = reducedMotion || !walking ? 0 : -Math.abs(Math.sin(state.phase)) * 3;
    person.setAttribute('transform', 'translate(' + x.toFixed(3) + ' ' + (320 + bob).toFixed(3) + ') scale(' + scale.toFixed(5) + ')');
    armA.setAttribute('transform', 'rotate(' + (-swing).toFixed(3) + ' 0 -112)');
    armB.setAttribute('transform', 'rotate(' + swing.toFixed(3) + ' 0 -112)');
    legA.setAttribute('transform', 'rotate(' + swing.toFixed(3) + ' 0 -66)');
    legB.setAttribute('transform', 'rotate(' + (-swing).toFixed(3) + ' 0 -66)');
    pathLabel.textContent = 'Path: ' + params.pathLength.toFixed(2) + ' m';
    statusLabel.textContent = 'Distance ' + state.distance.toFixed(2) + ' m · speed ' + params.speed.toFixed(2) + ' m/s';
  }

  function snapshot() {
    ensureActive();
    const state = stateAt(timeSeconds);
    return {
      id: 'sur-walking-person',
      timeSeconds: state.safeTime,
      parameters: { ...params },
      result: {
        distanceTravelled: state.distance,
        arrivalTime: Number.isFinite(state.arrivalTime) ? state.arrivalTime : null,
        pathFraction: state.distance / params.pathLength
      },
      pose: { x: state.distance, y: 0, z: 0, gaitPhaseRadians: state.phase }
    };
  }

  render();

  return {
    setParameters(next = {}) {
      ensureActive();
      params = normalize({ ...params, ...next });
      render();
      return snapshot();
    },
    update(nextTimeSeconds) {
      ensureActive();
      if (!Number.isFinite(nextTimeSeconds)) throw new TypeError('timeSeconds must be finite.');
      timeSeconds = Math.max(0, nextTimeSeconds);
      render();
      return snapshot();
    },
    reset() {
      ensureActive();
      params = normalize({});
      timeSeconds = 0;
      render();
      return snapshot();
    },
    resize(width, height, pixelRatio = 1) {
      ensureActive();
      if (![width, height, pixelRatio].every(Number.isFinite) || width <= 0 || height <= 0 || pixelRatio <= 0) {
        throw new RangeError('resize requires positive finite width, height, and pixelRatio.');
      }
      root.style.width = width + 'px';
      root.style.maxWidth = '100%';
      root.style.aspectRatio = width + ' / ' + height;
      return snapshot();
    },
    snapshot,
    dispose() {
      if (disposed) return;
      disposed = true;
      root.remove();
    }
  };
}
