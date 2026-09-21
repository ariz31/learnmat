export const DEFAULT_PARAMETERS = Object.freeze({
  width: 18,
  depth: 12,
  floorHeight: 3.2,
  floors: 4,
  bays: 4,
  openingWidth: 1.8,
  openingHeight: 1.5,
  sillHeight: 0.9,
  cutaway: 0.36
});

export const PARAMETER_LIMITS = Object.freeze({
  width: [6, 40],
  depth: [6, 30],
  floorHeight: [2.4, 5],
  floors: [1, 12],
  bays: [1, 10],
  openingWidth: [0.6, 4],
  openingHeight: [0.6, 3],
  sillHeight: [0, 1.5],
  cutaway: [0, 0.8]
});

function finite(name, value) {
  if (!Number.isFinite(value)) throw new TypeError(name + " must be finite");
  return value;
}

function ranged(name, value) {
  finite(name, value);
  const [min, max] = PARAMETER_LIMITS[name];
  if (value < min || value > max) {
    throw new RangeError(name + " must be between " + min + " and " + max);
  }
  return value;
}

function integer(name, value) {
  ranged(name, value);
  if (!Number.isInteger(value)) throw new TypeError(name + " must be an integer");
  return value;
}

export function normalizeParameters(input = {}) {
  const p = { ...DEFAULT_PARAMETERS, ...input };
  p.width = ranged("width", Number(p.width));
  p.depth = ranged("depth", Number(p.depth));
  p.floorHeight = ranged("floorHeight", Number(p.floorHeight));
  p.floors = integer("floors", Number(p.floors));
  p.bays = integer("bays", Number(p.bays));
  p.openingWidth = ranged("openingWidth", Number(p.openingWidth));
  p.openingHeight = ranged("openingHeight", Number(p.openingHeight));
  p.sillHeight = ranged("sillHeight", Number(p.sillHeight));
  p.cutaway = ranged("cutaway", Number(p.cutaway));

  const bayWidth = p.width / p.bays;
  const maxOpeningWidth = bayWidth * 0.72;
  if (p.openingWidth > maxOpeningWidth) {
    throw new RangeError(
      "openingWidth must not exceed 72% of bay width (" +
      maxOpeningWidth.toFixed(3) + " m for the current width and bays)"
    );
  }
  if (p.sillHeight + p.openingHeight > p.floorHeight - 0.25) {
    throw new RangeError(
      "sillHeight + openingHeight must leave at least 0.25 m below the floor above"
    );
  }
  return Object.freeze(p);
}

export function buildEnvelopeModel(input = {}) {
  const parameters = normalizeParameters(input);
  const height = parameters.floors * parameters.floorHeight;
  const bayWidth = parameters.width / parameters.bays;
  const floorElevations = Array.from(
    { length: parameters.floors + 1 },
    (_, index) => index * parameters.floorHeight
  );

  const openings = [];
  for (let floor = 0; floor < parameters.floors; floor += 1) {
    for (let bay = 0; bay < parameters.bays; bay += 1) {
      const centerX = -parameters.width / 2 + bayWidth * (bay + 0.5);
      openings.push({
        floor,
        bay,
        centerX,
        bottomY: floor * parameters.floorHeight + parameters.sillHeight,
        width: parameters.openingWidth,
        height: parameters.openingHeight,
        facadeZ: 0
      });
    }
  }

  return Object.freeze({
    parameters,
    width: parameters.width,
    depth: parameters.depth,
    height,
    bayWidth,
    cutawayDepth: parameters.depth * parameters.cutaway,
    floorElevations: Object.freeze(floorElevations),
    openings: Object.freeze(openings),
    bounds: Object.freeze({
      min: Object.freeze({
        x: -parameters.width / 2,
        y: 0,
        z: -parameters.depth
      }),
      max: Object.freeze({
        x: parameters.width / 2,
        y: height,
        z: 0
      })
    })
  });
}
