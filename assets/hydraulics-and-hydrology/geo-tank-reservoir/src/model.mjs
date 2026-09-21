export const DEFAULTS = Object.freeze({
  tankArea: 12,
  initialLevel: 2,
  maxLevel: 5,
  inflow: 0.08,
  outflowDemand: 0.05
});

export function validateTankParameters(values) {
  const p = { ...DEFAULTS, ...values };
  for (const [name, value] of Object.entries(p)) {
    if (!Number.isFinite(value)) throw new TypeError(name + ' must be finite.');
  }
  if (p.tankArea <= 0 || p.maxLevel <= 0) throw new RangeError('tankArea and maxLevel must be greater than zero.');
  if (p.initialLevel < 0 || p.initialLevel > p.maxLevel) throw new RangeError('initialLevel must be between zero and maxLevel.');
  if (p.inflow < 0 || p.outflowDemand < 0) throw new RangeError('inflow and outflowDemand cannot be negative.');
  return p;
}

export function computeTankState(values = {}, timeSeconds = 0) {
  const p = validateTankParameters(values);
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0) throw new RangeError('timeSeconds must be finite and non-negative.');
  const netDemandedFlow = p.inflow - p.outflowDemand;
  const unconstrainedLevel = p.initialLevel + netDemandedFlow * timeSeconds / p.tankArea;
  const level = Math.min(p.maxLevel, Math.max(0, unconstrainedLevel));
  const atUpperLimit = unconstrainedLevel >= p.maxLevel && netDemandedFlow > 0;
  const atLowerLimit = unconstrainedLevel <= 0 && netDemandedFlow < 0;
  const overflowRate = atUpperLimit ? netDemandedFlow : 0;
  const supplyShortfall = atLowerLimit ? -netDemandedFlow : 0;
  const actualOutflow = p.outflowDemand - supplyShortfall;
  const storageRate = atUpperLimit || atLowerLimit ? 0 : netDemandedFlow;
  const volume = level * p.tankArea;
  const capacity = p.maxLevel * p.tankArea;
  const fillFraction = capacity === 0 ? 0 : volume / capacity;
  const timeToLimit = netDemandedFlow > 0
    ? (p.maxLevel - p.initialLevel) * p.tankArea / netDemandedFlow
    : netDemandedFlow < 0
      ? p.initialLevel * p.tankArea / (-netDemandedFlow)
      : Infinity;
  return { parameters:p, timeSeconds, netDemandedFlow, unconstrainedLevel, level, volume, capacity, fillFraction, overflowRate, supplyShortfall, actualOutflow, storageRate, timeToLimit, atUpperLimit, atLowerLimit };
}
