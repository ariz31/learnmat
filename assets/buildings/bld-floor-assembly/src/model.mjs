export const DEFAULT_PARAMETERS = Object.freeze({
  width: 6,
  depth: 4,
  finishThickness: 0.012,
  screedThickness: 0.04,
  slabThickness: 0.15,
  serviceVoid: 0.30,
  ceilingBoardThickness: 0.012,
  explodeGap: 0.08
});

export const PARAMETER_LIMITS = Object.freeze({
  width: [2, 12],
  depth: [2, 12],
  finishThickness: [0.005, 0.04],
  screedThickness: [0.01, 0.10],
  slabThickness: [0.08, 0.40],
  serviceVoid: [0, 1.0],
  ceilingBoardThickness: [0.006, 0.03],
  explodeGap: [0, 0.25]
});

function checked(name, value) {
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
  const normalized = {};
  for (const key of Object.keys(DEFAULT_PARAMETERS)) {
    normalized[key] = checked(key, merged[key]);
  }
  return Object.freeze(normalized);
}

export function buildFloorAssemblyModel(input = {}) {
  const p = normalizeParameters(input);
  const definitions = [
    { key: "ceilingBoard", label: "Ceiling board", thickness: p.ceilingBoardThickness, kind: "solid" },
    { key: "serviceVoid", label: "Service void", thickness: p.serviceVoid, kind: "void" },
    { key: "slab", label: "Slab geometry", thickness: p.slabThickness, kind: "solid" },
    { key: "screed", label: "Screed / bedding", thickness: p.screedThickness, kind: "solid" },
    { key: "finish", label: "Floor finish", thickness: p.finishThickness, kind: "solid" }
  ];

  let cursor = 0;
  let separatedLayers = 0;
  const layers = definitions.map((definition, index) => {
    const bottomY = cursor;
    const topY = cursor + definition.thickness;
    const explodedOffset = separatedLayers * p.explodeGap;
    cursor = topY;
    if (definition.thickness > 0) separatedLayers += 1;
    return Object.freeze({
      ...definition,
      index,
      bottomY,
      topY,
      explodedBottomY: bottomY + explodedOffset,
      explodedTopY: topY + explodedOffset
    });
  });

  const solidThickness =
    p.finishThickness +
    p.screedThickness +
    p.slabThickness +
    p.ceilingBoardThickness;

  return Object.freeze({
    parameters: p,
    width: p.width,
    depth: p.depth,
    physicalBuildUp: cursor,
    solidThickness,
    layers: Object.freeze(layers),
    bounds: Object.freeze({
      min: Object.freeze({ x: -p.width / 2, y: 0, z: -p.depth }),
      max: Object.freeze({ x: p.width / 2, y: cursor, z: 0 })
    })
  });
}
