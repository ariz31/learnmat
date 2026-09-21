export const DEFAULT_FRAME_PARAMETERS = Object.freeze({
  bayWidthM: 6,
  storyHeightM: 3.5,
  driftRatio: 0.015,
  exaggeration: 3
});

const LIMITS = Object.freeze({
  bayWidthM: Object.freeze([2, 20]),
  storyHeightM: Object.freeze([2, 10]),
  driftRatio: Object.freeze([-0.05, 0.05]),
  exaggeration: Object.freeze([1, 8])
});

export function validateFrameParameters(next = {}, current = DEFAULT_FRAME_PARAMETERS) {
  for (const key of Object.keys(next)) {
    if (!Object.hasOwn(DEFAULT_FRAME_PARAMETERS, key)) throw new TypeError('Unknown parameter: ' + key);
  }
  const merged = { ...current, ...next };
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const value = merged[key];
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new RangeError(key + ' must be finite and within [' + min + ', ' + max + ']');
    }
  }
  return merged;
}

export function solveFrameSway(parameters) {
  const p = validateFrameParameters(parameters, DEFAULT_FRAME_PARAMETERS);
  const deltaX = p.driftRatio * p.storyHeightM;
  return {
    parameters:{...p},
    deltaXM:deltaX,
    driftPercent:p.driftRatio*100,
    undeformed:{
      A:{x:0,y:0}, B:{x:p.bayWidthM,y:0},
      C:{x:0,y:p.storyHeightM}, D:{x:p.bayWidthM,y:p.storyHeightM}
    },
    deformed:{
      A:{x:0,y:0}, B:{x:p.bayWidthM,y:0},
      C:{x:deltaX,y:p.storyHeightM}, D:{x:p.bayWidthM+deltaX,y:p.storyHeightM}
    },
    assumptions:[
      'fixed bases',
      'rigid top beam remains horizontal',
      'prescribed story translation only',
      'no stiffness, force, moment, or code-compliance solution'
    ]
  };
}
