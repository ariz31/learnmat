const ALLOWED_KEYS = new Set([
  'shape',
  'diameterM',
  'heightM',
  'sideM',
  'aggregateLevel',
  'showDimensions',
]);

export const DEFAULT_PARAMETERS = Object.freeze({
  shape: 'cylinder',
  diameterM: 0.15,
  heightM: 0.30,
  sideM: 0.15,
  aggregateLevel: 'medium',
  showDimensions: true,
});

function finiteRange(name, value, min, max) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be a finite number in [${min}, ${max}] m.`);
  }
}

export function validateParameters(values = {}) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Parameters must be an object.');
  }
  for (const key of Object.keys(values)) {
    if (!ALLOWED_KEYS.has(key)) throw new TypeError(`Unknown parameter: ${key}`);
  }

  const next = { ...DEFAULT_PARAMETERS, ...values };
  if (!['cylinder', 'cube'].includes(next.shape)) {
    throw new RangeError('shape must be "cylinder" or "cube".');
  }
  finiteRange('diameterM', next.diameterM, 0.05, 0.30);
  finiteRange('heightM', next.heightM, 0.05, 0.60);
  finiteRange('sideM', next.sideM, 0.05, 0.30);

  if (!['none', 'light', 'medium'].includes(next.aggregateLevel)) {
    throw new RangeError('aggregateLevel must be "none", "light", or "medium".');
  }
  if (typeof next.showDimensions !== 'boolean') {
    throw new TypeError('showDimensions must be boolean.');
  }
  return next;
}

export function computeSpecimen(values = {}) {
  const p = validateParameters(values);
  if (p.shape === 'cylinder') {
    const radiusM = p.diameterM / 2;
    return {
      shape: 'cylinder',
      dimensionsM: { diameter: p.diameterM, height: p.heightM },
      volumeM3: Math.PI * radiusM * radiusM * p.heightM,
      surfaceAreaM2: 2 * Math.PI * radiusM * (p.heightM + radiusM),
      boundingBoxM: {
        min: { x: -radiusM, y: 0, z: -radiusM },
        max: { x: radiusM, y: p.heightM, z: radiusM },
      },
    };
  }

  return {
    shape: 'cube',
    dimensionsM: { side: p.sideM },
    volumeM3: p.sideM ** 3,
    surfaceAreaM2: 6 * p.sideM ** 2,
    boundingBoxM: {
      min: { x: -p.sideM / 2, y: 0, z: -p.sideM / 2 },
      max: { x: p.sideM / 2, y: p.sideM, z: p.sideM / 2 },
    },
  };
}
