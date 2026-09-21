const ALLOWED_KEYS = new Set([
  'shape',
  'depthM',
  'flangeWidthM',
  'webThicknessM',
  'flangeThicknessM',
  'legXM',
  'legYM',
  'thicknessM',
  'showDimensions',
]);

export const DEFAULT_PARAMETERS = Object.freeze({
  shape: 'i-section',
  depthM: 0.30,
  flangeWidthM: 0.15,
  webThicknessM: 0.008,
  flangeThicknessM: 0.012,
  legXM: 0.10,
  legYM: 0.10,
  thicknessM: 0.010,
  showDimensions: true,
});

function finiteRange(name, value, min, max) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(name + ' must be a finite number in [' + min + ', ' + max + '] m.');
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
  if (!['i-section', 'channel', 'angle'].includes(next.shape)) {
    throw new RangeError('shape must be "i-section", "channel", or "angle".');
  }

  finiteRange('depthM', next.depthM, 0.08, 0.60);
  finiteRange('flangeWidthM', next.flangeWidthM, 0.05, 0.30);
  finiteRange('webThicknessM', next.webThicknessM, 0.003, 0.030);
  finiteRange('flangeThicknessM', next.flangeThicknessM, 0.004, 0.040);
  finiteRange('legXM', next.legXM, 0.04, 0.30);
  finiteRange('legYM', next.legYM, 0.04, 0.30);
  finiteRange('thicknessM', next.thicknessM, 0.003, 0.030);

  if (2 * next.flangeThicknessM >= next.depthM) {
    throw new RangeError('Two flange thicknesses must be less than the section depth.');
  }
  if (next.webThicknessM >= next.flangeWidthM) {
    throw new RangeError('Web thickness must be less than flange width.');
  }
  if (next.thicknessM >= Math.min(next.legXM, next.legYM)) {
    throw new RangeError('Angle thickness must be less than both leg lengths.');
  }
  if (typeof next.showDimensions !== 'boolean') {
    throw new TypeError('showDimensions must be boolean.');
  }

  return next;
}

export function computeSection(values = {}) {
  const p = validateParameters(values);

  if (p.shape === 'angle') {
    const areaM2 = p.thicknessM * (p.legXM + p.legYM - p.thicknessM);
    return {
      shape: p.shape,
      areaM2,
      dimensionsM: {
        legX: p.legXM,
        legY: p.legYM,
        thickness: p.thicknessM,
      },
      boundingBoxM: {
        width: p.legXM,
        height: p.legYM,
      },
      idealization: 'sharp-corner equal-thickness angle without root or toe radii',
    };
  }

  const areaM2 =
    2 * p.flangeWidthM * p.flangeThicknessM +
    (p.depthM - 2 * p.flangeThicknessM) * p.webThicknessM;

  return {
    shape: p.shape,
    areaM2,
    dimensionsM: {
      depth: p.depthM,
      flangeWidth: p.flangeWidthM,
      webThickness: p.webThicknessM,
      flangeThickness: p.flangeThicknessM,
    },
    boundingBoxM: {
      width: p.flangeWidthM,
      height: p.depthM,
    },
    idealization:
      p.shape === 'i-section'
        ? 'sharp-corner doubly symmetric I-section without fillets or flange taper'
        : 'sharp-corner channel without fillets or flange taper',
  };
}
