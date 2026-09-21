export const DEFAULTS = Object.freeze({
  width: 3,
  depth: 1.2,
  discharge: 4,
  bedSlope: 0.0015,
  manningN: 0.015,
  gravity: 9.81
});

export function validateOpenChannelParameters(values) {
  const p = { ...DEFAULTS, ...values };
  for (const [name, value] of Object.entries(p)) {
    if (!Number.isFinite(value)) throw new TypeError(name + ' must be finite.');
  }
  if (p.width <= 0 || p.depth <= 0 || p.manningN <= 0 || p.gravity <= 0) {
    throw new RangeError('width, depth, manningN, and gravity must be greater than zero.');
  }
  if (p.discharge < 0) throw new RangeError('discharge cannot be negative.');
  if (p.bedSlope < 0) throw new RangeError('bedSlope cannot be negative.');
  return p;
}

export function computeOpenChannel(values = {}) {
  const p = validateOpenChannelParameters(values);
  const area = p.width * p.depth;
  const wettedPerimeter = p.width + 2 * p.depth;
  const hydraulicRadius = area / wettedPerimeter;
  const velocity = p.discharge / area;
  const hydraulicDepth = area / p.width;
  const froude = velocity / Math.sqrt(p.gravity * hydraulicDepth);
  const specificEnergy = p.depth + velocity * velocity / (2 * p.gravity);
  const manningCapacity = (1 / p.manningN) * area * Math.pow(hydraulicRadius, 2 / 3) * Math.sqrt(p.bedSlope);
  const capacityRatio = manningCapacity === 0 ? (p.discharge === 0 ? 1 : Infinity) : p.discharge / manningCapacity;
  const regime = froude < 0.95 ? 'subcritical' : (froude > 1.05 ? 'supercritical' : 'near-critical');
  return { parameters:p, area, wettedPerimeter, hydraulicRadius, velocity, hydraulicDepth, froude, specificEnergy, manningCapacity, capacityRatio, regime };
}
