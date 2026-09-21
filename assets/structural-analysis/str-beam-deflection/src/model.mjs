export const DEFAULT_BEAM_PARAMETERS = Object.freeze({
  spanM: 6,
  loadN: 20000,
  elasticModulusPa: 200e9,
  inertiaM4: 8e-5
});

export const BEAM_LIMITS = Object.freeze({
  spanM: Object.freeze([2, 20]),
  loadN: Object.freeze([0, 1e6]),
  elasticModulusPa: Object.freeze([1e9, 300e9]),
  inertiaM4: Object.freeze([1e-8, 1])
});

export function validateBeamParameters(next = {}, current = DEFAULT_BEAM_PARAMETERS) {
  for (const key of Object.keys(next)) {
    if (!Object.hasOwn(DEFAULT_BEAM_PARAMETERS, key)) throw new TypeError('Unknown parameter: ' + key);
  }
  const merged = { ...current, ...next };
  for (const [key, [min, max]] of Object.entries(BEAM_LIMITS)) {
    const value = merged[key];
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new RangeError(key + ' must be finite and within [' + min + ', ' + max + ']');
    }
  }
  return merged;
}

export function beamResponseAt(xM, parameters) {
  const p = validateBeamParameters(parameters, DEFAULT_BEAM_PARAMETERS);
  if (!Number.isFinite(xM) || xM < 0 || xM > p.spanM) throw new RangeError('xM must lie on the beam span');

  const half = p.spanM / 2;
  const reactionN = p.loadN / 2;
  const shearN = xM < half ? reactionN : xM > half ? -reactionN : 0;
  const momentNm = xM <= half ? reactionN * xM : reactionN * (p.spanM - xM);
  const a = Math.min(xM, p.spanM - xM);
  const deflectionM = p.loadN === 0
    ? 0
    : -p.loadN * a * (3 * p.spanM * p.spanM - 4 * a * a) /
      (48 * p.elasticModulusPa * p.inertiaM4);

  return { xM, shearN, momentNm, deflectionM };
}

export function solveBeam(parameters) {
  const p = validateBeamParameters(parameters, DEFAULT_BEAM_PARAMETERS);
  const L = p.spanM;
  const P = p.loadN;
  return {
    parameters: { ...p },
    reactionsN: { left: P / 2, right: P / 2 },
    maxMomentNm: P * L / 4,
    maxDeflectionM: P === 0 ? 0 : -P * L ** 3 / (48 * p.elasticModulusPa * p.inertiaM4),
    samples: [0, L / 4, L / 2, 3 * L / 4, L].map(x => beamResponseAt(x, p)),
    shearAtLoadConvention: 'zero at the discontinuity; left/right limits are +P/2 and -P/2'
  };
}
