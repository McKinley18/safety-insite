export const hazardCategoryOptions = [
  "Machine Guarding",
  "Electrical",
  "Fall Protection",
  "Walking/Working Surfaces",
  "Lockout/Tagout",
  "PPE",
  "Housekeeping",
  "Mobile Equipment",
  "Confined Space",
  "Fire Protection",
  "Hazard Communication",
  "Ergonomics",
  "Material Handling",
  "Emergency Egress",
  "Other",
];

export const severityScale = [
  { score: 1, label: "Minor", desc: "First aid or low-impact condition." },
  {
    score: 2,
    label: "Moderate",
    desc: "Medical treatment or limited damage possible.",
  },
  {
    score: 3,
    label: "Serious",
    desc: "Lost time injury or significant equipment damage possible.",
  },
  {
    score: 4,
    label: "Major",
    desc: "Permanent injury, major damage, or regulatory exposure.",
  },
  {
    score: 5,
    label: "Critical",
    desc: "Fatality, catastrophic injury, or imminent danger.",
  },
];

export const likelihoodScale = [
  { score: 1, label: "Rare", desc: "Not expected under normal conditions." },
  { score: 2, label: "Unlikely", desc: "Could happen, but not often." },
  { score: 3, label: "Possible", desc: "Could reasonably happen during work." },
  { score: 4, label: "Likely", desc: "Expected to happen if not corrected." },
  { score: 5, label: "Frequent", desc: "Happening now or repeatedly likely." },
];

export const inspectionSteps = [
  {
    title: "Step 1: Capture Finding",
    desc: "Capture photos, location, and observed condition.",
  },
  {
    title: "Step 2: SafeScope Review",
    desc: "Run SafeScope and confirm suggested intelligence.",
  },
  {
    title: "Step 3: Finding Review",
    desc: "Review and edit description, category, risk, and corrective actions.",
  },
  {
    title: "Step 4: Final Findings",
    desc: "Review the compiled findings list.",
  },
  {
    title: "Step 5: Report Options",
    desc: "Customize the report package before generation.",
  },
];
