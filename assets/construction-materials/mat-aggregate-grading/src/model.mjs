const ALLOWED_KEYS = new Set(['gradingPreset','sampleMassKg','showParticles','showRetainedMass']);

export const SIEVE_OPENINGS_MM = Object.freeze([37.5,25,19,12.5,9.5,4.75,2.36,1.18,0.60,0.30,0.15]);

export const GRADING_PRESETS = Object.freeze({
  balanced: Object.freeze([100,95,85,68,55,33,20,12,7,4,2]),
  'coarse-heavy': Object.freeze([100,90,72,48,35,18,10,6,3,1,0]),
  'fine-heavy': Object.freeze([100,99,96,90,84,68,52,38,27,18,10]),
});

export const DEFAULT_PARAMETERS = Object.freeze({
  gradingPreset: 'balanced',
  sampleMassKg: 5,
  showParticles: true,
  showRetainedMass: true,
});

function validateCurve(values) {
  if (values.length !== SIEVE_OPENINGS_MM.length) throw new Error('Preset length mismatch.');
  let previous = 100;
  for (const value of values) {
    if (!Number.isFinite(value) || value < 0 || value > 100) throw new Error('Percent passing must be in [0,100].');
    if (value > previous) throw new Error('Percent passing must not increase as sieve opening decreases.');
    previous = value;
  }
}

export function validateParameters(values = {}) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new TypeError('Parameters must be an object.');
  for (const key of Object.keys(values)) {
    if (!ALLOWED_KEYS.has(key)) throw new TypeError('Unknown parameter: ' + key);
  }
  const p = { ...DEFAULT_PARAMETERS, ...values };
  if (!(p.gradingPreset in GRADING_PRESETS)) throw new RangeError('Unsupported gradingPreset.');
  if (!Number.isFinite(p.sampleMassKg) || p.sampleMassKg < 0.5 || p.sampleMassKg > 50) {
    throw new RangeError('sampleMassKg must be finite and in [0.5,50] kg.');
  }
  if (typeof p.showParticles !== 'boolean' || typeof p.showRetainedMass !== 'boolean') {
    throw new TypeError('showParticles and showRetainedMass must be boolean.');
  }
  validateCurve(GRADING_PRESETS[p.gradingPreset]);
  return p;
}

export function computeGrading(values = {}) {
  const p = validateParameters(values);
  const passing = GRADING_PRESETS[p.gradingPreset];
  const rows = [];
  let previousPassing = 100;
  let retainedSum = 0;

  for (let i=0;i<SIEVE_OPENINGS_MM.length;i+=1) {
    const percentPassing = passing[i];
    const percentRetained = previousPassing - percentPassing;
    retainedSum += percentRetained;
    rows.push({
      openingMm: SIEVE_OPENINGS_MM[i],
      percentPassing,
      percentRetained,
      cumulativeRetained: 100 - percentPassing,
      retainedMassKg: p.sampleMassKg * percentRetained / 100,
    });
    previousPassing = percentPassing;
  }

  const panPercent = passing[passing.length-1];
  retainedSum += panPercent;
  return {
    preset: p.gradingPreset,
    sampleMassKg: p.sampleMassKg,
    rows,
    pan: {
      percentRetained: panPercent,
      retainedMassKg: p.sampleMassKg * panPercent / 100,
    },
    retainedPercentTotal: retainedSum,
    retainedMassTotalKg: p.sampleMassKg * retainedSum / 100,
    interpretation: 'Illustrative grading distribution only; no specification envelope or material acceptance criterion is encoded.',
  };
}
