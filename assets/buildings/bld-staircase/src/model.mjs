export const DEFAULT_PARAMETERS = Object.freeze({
  totalRise: 3.0,
  risers: 17,
  going: 0.28,
  width: 1.20
});

export const PARAMETER_LIMITS = Object.freeze({
  totalRise: [0.60, 6.0],
  risers: [3, 30],
  going: [0.20, 0.45],
  width: [0.75, 2.50]
});

function finiteRange(name, value) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(name + " must be finite");
  const [min, max] = PARAMETER_LIMITS[name];
  if (number < min || number > max) {
    throw new RangeError(name + " must be between " + min + " and " + max);
  }
  return number;
}

export function normalizeParameters(input = {}) {
  const merged = { ...DEFAULT_PARAMETERS, ...input };
  const totalRise = finiteRange("totalRise", merged.totalRise);
  const risers = finiteRange("risers", merged.risers);
  const going = finiteRange("going", merged.going);
  const width = finiteRange("width", merged.width);

  if (!Number.isInteger(risers)) throw new TypeError("risers must be an integer");

  return Object.freeze({ totalRise, risers, going, width });
}

export function buildStaircaseModel(input = {}) {
  const p = normalizeParameters(input);
  const riserHeight = p.totalRise / p.risers;
  const goings = p.risers - 1;
  const flightRun = goings * p.going;
  const pitchRadians = Math.atan2(p.totalRise, flightRun);

  const steps = [];
  for (let index = 0; index < p.risers; index += 1) {
    const x = Math.min(index, goings) * p.going;
    const bottomY = index * riserHeight;
    const topY = (index + 1) * riserHeight;
    steps.push(Object.freeze({
      index,
      riserX: x,
      bottomY,
      topY,
      treadStartX: index < goings ? x : null,
      treadEndX: index < goings ? (index + 1) * p.going : null,
      treadY: index < goings ? topY : null
    }));
  }

  return Object.freeze({
    parameters: p,
    riserHeight,
    goings,
    flightRun,
    pitchRadians,
    steps: Object.freeze(steps),
    bounds: Object.freeze({
      min: Object.freeze({ x: 0, y: 0, z: -p.width }),
      max: Object.freeze({ x: flightRun, y: p.totalRise, z: 0 })
    })
  });
}
