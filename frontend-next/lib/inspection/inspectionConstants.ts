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
    desc: "Add photo evidence, location, and a short observed-condition description.",
  },
  {
    title: "Step 2: Run SafeScope",
    desc: "Classify the finding, match likely standards, assess risk, and generate recommended actions.",
  },
  {
    title: "Step 3: Review & Validate",
    desc: "Review SafeScope reasoning, risk logic, standard matches, and corrective actions before saving.",
  },
  {
    title: "Step 4: Save & Generate",
    desc: "Save findings, choose report detail level, and generate the final report.",
  },
];
