export const calculateControlScore = (
  required: string[],
  present: { control: string }[]
) => {
  const presentSet = new Set(present.map(p => p.control));

  const missing = required.filter(r => !presentSet.has(r));

  const score =
    required.length === 0
      ? 100
      : Math.round(((required.length - missing.length) / required.length) * 100);

  return {
    score,
    requiredCount: required.length,
    missingCount: missing.length,
    missingControls: missing
  };
};
