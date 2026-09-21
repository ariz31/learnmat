const ALLOWED_KEYS = new Set([
  'lengthM','heightM','depthM','voidLengthM','voidDepthM','voidCount',
  'mortarJointM','view','showDimensions'
]);

export const DEFAULT_PARAMETERS = Object.freeze({
  lengthM: 0.40,
  heightM: 0.20,
  depthM: 0.15,
  voidLengthM: 0.12,
  voidDepthM: 0.09,
  voidCount: 2,
  mortarJointM: 0.01,
  view: 'unit',
  showDimensions: true,
});

function finiteRange(name, value, min, max) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be finite and in [${min}, ${max}] m.`);
  }
}

export function validateParameters(values = {}) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new TypeError('Parameters must be an object.');
  }
  for (const key of Object.keys(values)) {
    if (!ALLOWED_KEYS.has(key)) throw new TypeError(`Unknown parameter: ${key}`);
  }

  const p = { ...DEFAULT_PARAMETERS, ...values };
  finiteRange('lengthM', p.lengthM, 0.20, 0.60);
  finiteRange('heightM', p.heightM, 0.08, 0.30);
  finiteRange('depthM', p.depthM, 0.08, 0.30);
  finiteRange('voidLengthM', p.voidLengthM, 0.03, 0.24);
  finiteRange('voidDepthM', p.voidDepthM, 0.03, 0.20);
  finiteRange('mortarJointM', p.mortarJointM, 0, 0.03);

  if (!Number.isInteger(p.voidCount) || p.voidCount < 1 || p.voidCount > 3) {
    throw new RangeError('voidCount must be an integer from 1 to 3.');
  }
  if (!['unit', 'running-bond'].includes(p.view)) {
    throw new RangeError('view must be "unit" or "running-bond".');
  }
  if (typeof p.showDimensions !== 'boolean') {
    throw new TypeError('showDimensions must be boolean.');
  }
  if (p.voidDepthM >= p.depthM) {
    throw new RangeError('voidDepthM must be less than unit depthM.');
  }
  const totalVoidLength = p.voidCount * p.voidLengthM;
  if (totalVoidLength >= p.lengthM * 0.88) {
    throw new RangeError('Combined void length must leave visible end/intermediate webs.');
  }
  return p;
}

export function computeMasonryUnit(values = {}) {
  const p = validateParameters(values);
  const grossVolumeM3 = p.lengthM * p.heightM * p.depthM;
  const voidVolumeM3 = p.voidCount * p.voidLengthM * p.voidDepthM * p.heightM;
  const netSolidVolumeM3 = grossVolumeM3 - voidVolumeM3;
  const grossTopAreaM2 = p.lengthM * p.depthM;
  const voidTopAreaM2 = p.voidCount * p.voidLengthM * p.voidDepthM;
  return {
    dimensionsM: {
      length: p.lengthM,
      height: p.heightM,
      depth: p.depthM,
      voidLength: p.voidLengthM,
      voidDepth: p.voidDepthM,
      mortarJoint: p.mortarJointM,
    },
    voidCount: p.voidCount,
    grossVolumeM3,
    voidVolumeM3,
    netSolidVolumeM3,
    grossTopAreaM2,
    voidTopAreaM2,
    netTopAreaM2: grossTopAreaM2 - voidTopAreaM2,
    assumptions: [
      'rectangular prismatic unit',
      'rectangular through-voids extending full unit height',
      'sharp corners; no face-shell taper, webs, chamfers, ribs, or manufacturing tolerance',
      'running-bond view is schematic only and is not a code or construction-detail prescription',
    ],
  };
}
