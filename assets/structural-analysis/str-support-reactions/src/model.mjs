export const DEFAULT_SUPPORT_PARAMETERS = Object.freeze({ supportType: 'pin', showReactionDirections: true });

export const SUPPORT_DEFINITIONS = Object.freeze({
  pin: Object.freeze({
    restrainedDofs: Object.freeze(['x', 'y']),
    possibleReactions: Object.freeze(['Rx', 'Ry']),
    label: 'Pin support'
  }),
  roller: Object.freeze({
    restrainedDofs: Object.freeze(['y']),
    possibleReactions: Object.freeze(['Ry']),
    label: 'Roller support on horizontal surface'
  }),
  fixed: Object.freeze({
    restrainedDofs: Object.freeze(['x', 'y', 'rz']),
    possibleReactions: Object.freeze(['Rx', 'Ry', 'Mz']),
    label: 'Fixed support'
  })
});

export function validateSupportParameters(next = {}, current = DEFAULT_SUPPORT_PARAMETERS) {
  for (const key of Object.keys(next)) {
    if (!Object.hasOwn(DEFAULT_SUPPORT_PARAMETERS, key)) throw new TypeError('Unknown parameter: ' + key);
  }
  const merged = { ...current, ...next };
  if (!Object.hasOwn(SUPPORT_DEFINITIONS, merged.supportType)) throw new RangeError('supportType must be pin, roller, or fixed');
  if (typeof merged.showReactionDirections !== 'boolean') throw new TypeError('showReactionDirections must be boolean');
  return merged;
}

export function describeSupport(parameters) {
  const checked = validateSupportParameters(parameters, DEFAULT_SUPPORT_PARAMETERS);
  const definition = SUPPORT_DEFINITIONS[checked.supportType];
  return {
    supportType: checked.supportType,
    showReactionDirections: checked.showReactionDirections,
    label: definition.label,
    restrainedDofs: [...definition.restrainedDofs],
    possibleReactions: [...definition.possibleReactions]
  };
}
