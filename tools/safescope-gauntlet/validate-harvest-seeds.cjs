const fs = require("fs");

const filePath = "SAFE_SCOPE_SOURCE_HARVEST_SEEDS.json";
const seeds = JSON.parse(fs.readFileSync(filePath, "utf8"));
const allowedDomains = ["cdc.gov", "csb.gov", "msha.gov", "arlweb.msha.gov", "osha.gov", "bls.gov", "nsc.org", "injuryfacts.nsc.org"];

let invalidCount = 0;
const errors = [];
const urls = new Set();
const agencyCounts = {};

if (!Array.isArray(seeds)) {
    console.error("Seeds must be an array.");
    process.exit(1);
}

seeds.forEach(s => {
    // Check required fields
    const required = ["seedId", "sourceAgency", "sourceUrl", "sourceType", "expectedHazardCategory", "notes"];
    required.forEach(f => { if (!s[f]) { errors.push(`Missing field ${f} in ${s.seedId}`); invalidCount++; } });

    // Check URL
    if (urls.has(s.sourceUrl)) { errors.push(`Duplicate URL: ${s.sourceUrl}`); invalidCount++; }
    urls.add(s.sourceUrl);

    const domain = s.sourceUrl.replace(/^https?:\/\//, "").split("/")[0].replace("www.", "");
    if (!allowedDomains.some(d => domain.endsWith(d))) {
        errors.push(`Invalid domain: ${domain} for ${s.seedId}`);
        invalidCount++;
    }

    agencyCounts[s.sourceAgency] = (agencyCounts[s.sourceAgency] || 0) + 1;
});

let audit = "# SAFE_SCOPE_SOURCE_HARVEST_SEEDS_AUDIT.md\n\n";
audit += "- Seed count: " + seeds.length + "\n";
audit += "- Invalid count: " + invalidCount + "\n";
audit += "- Agency counts: " + JSON.stringify(agencyCounts) + "\n";
audit += "- Errors: " + JSON.stringify(errors) + "\n";

fs.writeFileSync("SAFE_SCOPE_SOURCE_HARVEST_SEEDS_AUDIT.md", audit);
console.log("Audit complete.");
if (invalidCount > 0) process.exit(1);
