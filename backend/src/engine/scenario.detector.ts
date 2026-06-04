const conditionKeywords = {
  missing: ["missing", "not present", "absent"],
  damaged: ["damaged", "broken", "defective"],
  blocked: ["blocked", "obstructed"],
};

const contextKeywords = {
  lift: ["lift", "scissor lift", "manlift", "aerial"],
  fireProtection: ["fire extinguisher", "extinguisher"],
};

export const detectScenario = (text: string) => {
  const t = text.toLowerCase();

  const conditions = Object.entries(conditionKeywords)
    .filter(([_, words]) => words.some(w => t.includes(w)))
    .map(([key]) => key);

  const contexts = Object.entries(contextKeywords)
    .filter(([_, words]) => words.some(w => t.includes(w)))
    .map(([key]) => key);

  return { conditions, contexts };
};
