const ALLOWED_KEYS = new Set([
  'lengthM',
  'widthM',
  'thicknessM',
  'grainAngleRad',
  'grainDensity',
  'showDimensions',
  'showOrientation',
]);

export const DEFAULT_PARAMETERS = Object.freeze({
  lengthM: 0.30,
  widthM: 0.075,
  thicknessM: 0.025,
  grainAngleRad: Math.PI / 22.5,
  grainDensity: 'medium',
  showDimensions: true,
  showOrientation: true,
});

function finiteRange(name, value, min, max, unit) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(name + ' must be a finite number in [' + min + ', ' + max + '] ' + unit + '.');
  }
}

export function validateParameters(values = {}) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Parameters must be an object.');
  }
  for (const key of Object.keys(values)) {
    if (!ALLOWED_KEYS.has(key)) throw new TypeError('Unknown parameter: ' + key);
  }

  const next = { ...DEFAULT_PARAMETERS, ...values };
  finiteRange('lengthM', next.lengthM, 0.10, 1.20, 'm');
  finiteRange('widthM', next.widthM, 0.025, 0.30, 'm');
  finiteRange('thicknessM', next.thicknessM, 0.005, 0.10, 'm');
  finiteRange('grainAngleRad', next.grainAngleRad, -Math.PI / 4, Math.PI / 4, 'rad');

  if (!['none', 'light', 'medium', 'dense'].includes(next.grainDensity)) {
    throw new RangeError('grainDensity must be "none", "light", "medium", or "dense".');
  }
  if (typeof next.showDimensions !== 'boolean') {
    throw new TypeError('showDimensions must be boolean.');
  }
  if (typeof next.showOrientation !== 'boolean') {
    throw new TypeError('showOrientation must be boolean.');
  }
  return next;
}

export function computeTimberSpecimen(values = {}) {
  const p = validateParameters(values);
  const direction = {
    x: Math.cos(p.grainAngleRad),
    y: 0,
    z: -Math.sin(p.grainAngleRad),
  };
  return {
    dimensionsM: {
      length: p.lengthM,
      width: p.widthM,
      thickness: p.thicknessM,
    },
    volumeM3: p.lengthM * p.widthM * p.thicknessM,
    grainAngleRad: p.grainAngleRad,
    grainDirectionUnit: direction,
    coordinateMeaning: {
      specimenLongitudinal: '+X',
      thickness: '+Y',
      width: '+Z/-Z',
      positiveGrainAngle: 'from +X toward -Z on the displayed top surface',
    },
    interpretation:
      'Stylized surface grain direction only; not anatomical L/R/T classification, defect grading, or a material-property model.',
  };
}
