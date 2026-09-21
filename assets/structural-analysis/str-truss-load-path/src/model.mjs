export const DEFAULT_TRUSS_PARAMETERS = Object.freeze({ spanM: 8, riseM: 3, loadN: 40000 });

export const TRUSS_LIMITS = Object.freeze({
  spanM: Object.freeze([2, 30]),
  riseM: Object.freeze([0.5, 15]),
  loadN: Object.freeze([0, 1e6])
});

export function validateTrussParameters(next = {}, current = DEFAULT_TRUSS_PARAMETERS) {
  for (const key of Object.keys(next)) {
    if (!Object.hasOwn(DEFAULT_TRUSS_PARAMETERS, key)) throw new TypeError('Unknown parameter: ' + key);
  }
  const merged = { ...current, ...next };
  for (const [key, [min, max]] of Object.entries(TRUSS_LIMITS)) {
    const value = merged[key];
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new RangeError(key + ' must be finite and within [' + min + ', ' + max + ']');
    }
  }
  return merged;
}

export function solveTriangularTruss(parameters) {
  const p = validateTrussParameters(parameters, DEFAULT_TRUSS_PARAMETERS);
  const half = p.spanM / 2;
  const diagonalLength = Math.hypot(half, p.riseM);
  const sinTheta = p.riseM / diagonalLength;
  const cosTheta = half / diagonalLength;
  const tanTheta = p.riseM / half;
  const diagonalCompressionN = p.loadN === 0 ? 0 : p.loadN / (2 * sinTheta);
  const bottomTensionN = p.loadN === 0 ? 0 : p.loadN / (2 * tanTheta);

  return {
    parameters: { ...p },
    thetaRad: Math.atan2(p.riseM, half),
    reactionsN: { Ax: 0, Ay: p.loadN / 2, Cy: p.loadN / 2 },
    memberForcesN: {
      AB: -diagonalCompressionN,
      BC: -diagonalCompressionN,
      AC: bottomTensionN
    },
    geometryM: {
      A: { x: 0, y: 0 },
      B: { x: half, y: p.riseM },
      C: { x: p.spanM, y: 0 }
    },
    directionCosines: { diagonal: { cos: cosTheta, sin: sinTheta } },
    axialForceConvention: 'positive tension; negative compression'
  };
}
