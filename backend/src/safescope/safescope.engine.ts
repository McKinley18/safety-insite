export async function analyzeHazard(hazard: string) {
  const text = hazard.toLowerCase();

  let category = 'General';
  let citations: string[] = [];

  if (text.includes('edge') || text.includes('fall')) {
    category = 'Fall Protection';
    citations = ['56.11012', '57.11012'];
  }

  if (text.includes('electrical') || text.includes('wiring')) {
    category = 'Electrical';
    citations = ['56.12004'];
  }

  return {
    category,
    citations,
  };
}
