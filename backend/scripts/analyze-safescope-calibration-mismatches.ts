import * as fs from 'fs';
import * as path from 'path';

const resultsPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json');
const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

console.log("Analyzing Mismatches...");

const analysis = {
    totalCases: results.summary.totalCases,
    metrics: results.summary.metrics,
    topMismatchPairs: {} as Record<string, number>,
    recommendations: results.summary.recommendations,
    mismatchReasoning: {
        outputContractMapping: "Fields like hazardFamily and jurisdiction showing high 'field_not_available' or 'mismatch'.",
        aliasMapping: "Some mechanisms map partially via aliasMap, but many remain 'actual_value_different'.",
        reasoningTuning: "High mismatch in scenarioFamily and hazardFamily suggests underlying engine routing needs investigation."
    }
};

// Simple aggregate of top mismatches for the report
for (const detail of results.details) {
    for (const cat in detail.scoring) {
        if (detail.scoring[cat].status === 'actual_value_different') {
            const pair = `${detail.scoring[cat].expected}:${detail.scoring[cat].actual}`;
            analysis.topMismatchPairs[pair] = (analysis.topMismatchPairs[pair] || 0) + 1;
        }
    }
}

// Sort top mismatch pairs
const sortedPairs = Object.entries(analysis.topMismatchPairs).sort((a, b) => b[1] - a[1]);
analysis.topMismatchPairs = Object.fromEntries(sortedPairs.slice(0, 10));

console.log("Mismatch Analysis generated.");
fs.writeFileSync(path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-200-mismatch-analysis.v1.json'), JSON.stringify(analysis, null, 2));
EOF
,file_path: