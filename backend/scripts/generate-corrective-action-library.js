const fs = require("fs");

const conditionLib = JSON.parse(
  fs.readFileSync("test-data/condition-library/hazard-condition-library.json", "utf8")
);

const out = "test-data/action-library/corrective-action-library.json";

const templates = {
  housekeeping: {
    regulatoryIntent: "Maintain clean and orderly work areas to prevent slip, trip, and access hazards.",
    correctiveActions: ["Remove debris, spillage, or obstruction.", "Restore safe walking or working surface.", "Document cleanup and recurrence controls."],
    verificationSteps: ["Area is clear.", "No slip/trip hazard remains."],
    rootCausePrompts: ["What caused the buildup?", "Is cleanup frequency adequate?"],
    suggestedSeverity: 3,
    suggestedLikelihood: 3,
    suggestedExposure: 3,
    suggestedPriority: "medium",
    defaultDaysToComplete: 3
  },
  machine_guarding: {
    regulatoryIntent: "Prevent contact with moving machine parts and nip points.",
    correctiveActions: ["Stop/restrict equipment use.", "Install or repair guarding.", "Verify guard is secure before operation."],
    verificationSteps: ["Guard installed.", "No access to moving parts."],
    rootCausePrompts: ["Why was guarding missing?", "Was inspection frequency adequate?"],
    suggestedSeverity: 5,
    suggestedLikelihood: 3,
    suggestedExposure: 4,
    suggestedPriority: "critical",
    defaultDaysToComplete: 0
  },
  lockout_tagout: {
    regulatoryIntent: "Control hazardous energy during servicing or maintenance.",
    correctiveActions: ["Stop work.", "Isolate energy sources.", "Apply lockout/tagout.", "Verify zero energy."],
    verificationSteps: ["Energy isolated.", "Lock/tag applied.", "Zero energy verified."],
    rootCausePrompts: ["Was LOTO procedure followed?", "Was employee trained?"],
    suggestedSeverity: 5,
    suggestedLikelihood: 4,
    suggestedExposure: 4,
    suggestedPriority: "critical",
    defaultDaysToComplete: 0
  },
  fall_protection: {
    regulatoryIntent: "Protect workers from falls from elevation, edges, holes, and openings.",
    correctiveActions: ["Stop exposed work.", "Install guardrail, cover, restraint, or fall arrest system.", "Verify protection before work resumes."],
    verificationSteps: ["Fall hazard protected.", "Workers protected correctly."],
    rootCausePrompts: ["Was fall protection planned?", "Was supervision adequate?"],
    suggestedSeverity: 5,
    suggestedLikelihood: 4,
    suggestedExposure: 4,
    suggestedPriority: "critical",
    defaultDaysToComplete: 0
  },
  electrical: {
    regulatoryIntent: "Prevent shock, burn, arc flash, and energized-part exposure.",
    correctiveActions: ["Restrict access.", "Have qualified person correct condition.", "Repair/cover/secure electrical component.", "Verify before release."],
    verificationSteps: ["Electrical condition corrected.", "Access/enclosure/clearance verified."],
    rootCausePrompts: ["Was damage or installation issue involved?", "Was qualified person assigned?"],
    suggestedSeverity: 5,
    suggestedLikelihood: 3,
    suggestedExposure: 3,
    suggestedPriority: "critical",
    defaultDaysToComplete: 0
  },
  mobile_equipment: {
    regulatoryIntent: "Prevent struck-by, runover, rollover, uncontrolled movement, and equipment-defect hazards.",
    correctiveActions: ["Remove unsafe equipment/activity from service.", "Correct defect or traffic issue.", "Verify safe operation before release."],
    verificationSteps: ["Unsafe condition corrected.", "Equipment/control verified."],
    rootCausePrompts: ["Was condition found in pre-op?", "Were traffic controls adequate?"],
    suggestedSeverity: 5,
    suggestedLikelihood: 3,
    suggestedExposure: 4,
    suggestedPriority: "critical",
    defaultDaysToComplete: 0
  },
  default: {
    regulatoryIntent: "Correct the identified hazardous condition using the hierarchy of controls.",
    correctiveActions: ["Control employee exposure.", "Correct hazard.", "Verify completion.", "Document evidence."],
    verificationSteps: ["Hazard controlled.", "Correction completed.", "Evidence attached."],
    rootCausePrompts: ["Why did the condition exist?", "What prevents recurrence?"],
    suggestedSeverity: 3,
    suggestedLikelihood: 3,
    suggestedExposure: 3,
    suggestedPriority: "medium",
    defaultDaysToComplete: 3
  }
};

const actions = conditionLib.conditions.map(c => {
  const t = templates[c.family] || templates.default;
  return {
    conditionId: c.conditionId,
    citation: c.citation,
    scope: c.scope,
    agency: c.agency,
    family: c.family,
    regulatoryIntent: t.regulatoryIntent,
    correctiveActions: t.correctiveActions,
    verificationSteps: t.verificationSteps,
    rootCausePrompts: t.rootCausePrompts,
    suggestedSeverity: t.suggestedSeverity,
    suggestedLikelihood: t.suggestedLikelihood,
    suggestedExposure: t.suggestedExposure,
    suggestedPriority: t.suggestedPriority,
    defaultDaysToComplete: t.defaultDaysToComplete,
    actionSource: templates[c.family] ? "family-template" : "fallback-template"
  };
});

fs.mkdirSync("test-data/action-library", { recursive: true });
fs.writeFileSync(out, JSON.stringify(actions, null, 2) + "\n");

console.log("WROTE =", out);
console.log("TOTAL_ACTION_MAPPINGS =", actions.length);
