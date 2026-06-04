const fs = require('fs');
let content = fs.readFileSync('backend/src/standards/seeds/standards.seed.ts', 'utf8');

// Use a regex to add missing fields to OSHA rows.
// This replaces the malformed entries with complete objects.
const oshaFix = content.replace(
  /\{ source: "OSHA", citation: "29 CFR 1910.212", heading: "General requirements for all machines", keywords: \["guard","machine","saw","blade"\] \}/g,
  "{ source: 'OSHA', titleNumber: '29', part: '1910', section: '212', citation: '29 CFR 1910.212', heading: 'General requirements for all machines', standardText: 'Standard text.', keywords: ['guard', 'machine', 'saw', 'blade'] }"
);

fs.writeFileSync('backend/src/standards/seeds/standards.seed.ts', oshaFix);
