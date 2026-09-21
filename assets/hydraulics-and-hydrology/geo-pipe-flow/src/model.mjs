export const DEFAULTS = Object.freeze({
  length: 30,
  diameter: 0.30,
  roughness: 0.00015,
  flowRate: 0.08,
  kinematicViscosity: 1.004e-6,
  gravity: 9.81
});

const finite = (name, value) => {
  if (!Number.isFinite(value)) throw new TypeError(name + ' must be finite.');
  return value;
};

export function validatePipeFlowParameters(values) {
  const p = { ...DEFAULTS, ...values };
  for (const [name, value] of Object.entries(p)) finite(name, value);
  if (p.length <= 0) throw new RangeError('length must be greater than zero.');
  if (p.diameter <= 0) throw new RangeError('diameter must be greater than zero.');
  if (p.roughness < 0) throw new RangeError('roughness cannot be negative.');
  if (p.roughness >= p.diameter) throw new RangeError('roughness must be smaller than diameter.');
  if (p.kinematicViscosity <= 0) throw new RangeError('kinematicViscosity must be greater than zero.');
  if (p.gravity <= 0) throw new RangeError('gravity must be greater than zero.');
  return p;
}

export function computePipeFlow(values = {}) {
  const p = validatePipeFlowParameters(values);
  const area = Math.PI * p.diameter * p.diameter / 4;
  const velocity = p.flowRate / area;
  const speed = Math.abs(velocity);
  const reynolds = speed * p.diameter / p.kinematicViscosity;
  let frictionFactor = 0;
  let regime = 'no-flow';
  if (reynolds > 0 && reynolds < 2300) {
    frictionFactor = 64 / reynolds;
    regime = 'laminar';
  } else if (reynolds >= 2300) {
    const relativeRoughness = p.roughness / p.diameter;
    frictionFactor = 0.25 / Math.pow(
      Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynolds, 0.9)),
      2
    );
    regime = reynolds < 4000 ? 'transitional-approximation' : 'turbulent';
  }
  const velocityHead = speed * speed / (2 * p.gravity);
  const headLoss = frictionFactor * (p.length / p.diameter) * velocityHead;
  return {
    parameters: p,
    area,
    velocity,
    speed,
    reynolds,
    frictionFactor,
    relativeRoughness: p.roughness / p.diameter,
    velocityHead,
    headLoss,
    regime,
    flowDirection: p.flowRate === 0 ? 0 : Math.sign(p.flowRate)
  };
}
