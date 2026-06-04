const fs = require('fs');
const path = require('path');

// Simulated DB - Loading existing test data to analyze
const testCases = require('./generated-tests.json');

// 🔷 RISK METADATA
const severityMap = { electrical: 10, fall: 9, machine: 8, fire: 7, chemical: 7, slip: 5, ppe: 3, vehicle: 6 };

function generatePreciseExplainableAlerts() {
  console.log("\n=== SAFESCOPE PRECISE XAI INTELLIGENCE AUDIT ===\n");

  const windowSize = 210;
  const currentWindow = testCases.slice(-windowSize);
  const previousWindow = testCases.slice(-(windowSize * 2), -windowSize);

  const categories = ["machine", "slip", "fall", "electrical", "vehicle", "fire", "ppe", "chemical"];
  
  // 🔷 HIGH-FIDELITY FAILURE PATTERNS
  const failurePatterns = [
    "missing guard", "exposed wire", "blocked exit", "no ppe", "oil spill", 
    "broken ladder", "damaged panel", "unsafe edge", "loose wiring", 
    "no helmet", "blocked corridor", "wet floor"
  ];
  const locationSignals = ["production", "warehouse", "entrance", "storage", "corridor", "shop"];

  const preciseAlerts = categories.map(cat => {
    const catFindings = currentWindow.filter(t => t.expected === cat);
    if (catFindings.length === 0) return null;

    // 1. TREND CALCULATION (v1.0)
    const currentFreq = catFindings.length;
    const previousFreq = previousWindow.filter(t => t.expected === cat).length;
    let growthRate = previousFreq > 0 ? (currentFreq - previousFreq) / previousFreq : 0;
    
    // Only alert on significant shifts or persistent high risk
    if (growthRate < 0.1 && currentFreq < 25) return null;

    // 🔷 2. PRECISE ROOT CAUSE ANALYSIS
    const patternCounts = {};
    catFindings.forEach(f => {
      failurePatterns.forEach(p => {
        if (f.input.toLowerCase().includes(p)) {
          patternCounts[p] = (patternCounts[p] || 0) + 1;
        }
      });
    });

    const topDrivers = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([phrase, count]) => ({ phrase, count }))
      .slice(0, 2);

    // 🔷 3. LOCATION TRIANGULATION
    const locCounts = {};
    catFindings.forEach(f => {
      locationSignals.forEach(l => {
        if (f.input.toLowerCase().includes(l)) {
          locCounts[l] = (locCounts[l] || 0) + 1;
        }
      });
    });
    const topLocation = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "undetermined location";

    // 🔷 4. EXECUTIVE MESSAGE ASSEMBLY
    let driverStr = "";
    if (topDrivers.length === 2) {
      driverStr = `${topDrivers[0].phrase} (${topDrivers[0].count}) and ${topDrivers[1].phrase} (${topDrivers[1].count})`;
    } else if (topDrivers.length === 1) {
      driverStr = `${topDrivers[0].phrase} (${topDrivers[0].count})`;
    } else {
      driverStr = "low-frequency but increasing occurrences";
    }

    const executiveSummary = `${cat.toUpperCase()} risk is increasing due to ${driverStr}, primarily in the ${topLocation}.`;

    return {
      hazard: cat.toUpperCase(),
      growthRate: parseFloat(growthRate.toFixed(2)),
      drivers: topDrivers,
      location: topLocation,
      executiveSummary
    };
  }).filter(a => a !== null);

  // 🔷 VALIDATION OUTPUT
  preciseAlerts.forEach(a => {
    console.log("---------------------------------------");
    console.log("HAZARD:      ", a.hazard);
    console.log("TOP DRIVERS: ", a.drivers.map(d => `${d.phrase} [${d.count}]`).join(", ") || "None detected");
    console.log("EXECUTIVE MESSAGE:");
    console.log(`> ${a.executiveSummary}`);
  });
  console.log("---------------------------------------");

  return preciseAlerts;
}

if (require.main === module) {
  generatePreciseExplainableAlerts();
}

module.exports = { generatePreciseExplainableAlerts };
