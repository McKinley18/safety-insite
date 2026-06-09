import { SiteMemoryService } from '../src/safescope-v2/site-memory/site-memory.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function validate() {
  console.log('--- Testing SafeScope Temporal Hazard Memory ---');

  const service = new SiteMemoryService();
  const currentDate = new Date('2026-06-01');

  // Case 1: No prior findings
  console.log('  Testing Case 1: No prior findings');
  const res1 = service.evaluate({
    currentClassification: 'machine_guarding',
    currentLocation: 'Conveyor 4 Crusher Feed',
    priorFindings: [],
    currentDate,
  });

  assert(!res1.recurringRiskDetected, 'Should not detect recurring risk with no prior findings.');
  assert(res1.degradationRisk === 'low', 'Degradation risk should be low.');
  assert(res1.temporalRecurrence.escalationLevel === 'none', 'Escalation level should be none.');
  assert(!res1.temporalRecurrence.hierarchyOfControlsShift, 'Should not shift controls.');

  // Case 2: Critical Recurrence (same category + same location within 30 days)
  console.log('  Testing Case 2: Critical Recurrence (within 30 days)');
  const res2 = service.evaluate({
    currentClassification: 'machine_guarding',
    currentLocation: 'Conveyor 4 Crusher Feed',
    priorFindings: [
      {
        classification: 'machine_guarding',
        location: 'Conveyor 4 Crusher Feed',
        date: '2026-05-15', // 17 days ago
      }
    ],
    currentDate,
  });

  assert(res2.recurringRiskDetected, 'Should detect recurring risk.');
  assert(res2.degradationRisk === 'critical', 'Degradation risk should be escalated to critical.');
  assert(res2.temporalRecurrence.escalationLevel === 'critical', 'Escalation level should be critical.');
  assert(res2.temporalRecurrence.hierarchyOfControlsShift, 'Should recommend hierarchy of controls shift.');
  assert(res2.siteMemorySummary.includes('CRITICAL TEMPORAL RECURRENCE'), 'Summary should mention critical recurrence.');
  assert(res2.recommendedAction.includes('IMMEDIATE ESCALATION'), 'Action should recommend immediate escalation to Engineering Controls.');

  // Case 3: High Recurrence (2+ category + location within 90 days)
  console.log('  Testing Case 3: High Recurrence (within 90 days)');
  const res3 = service.evaluate({
    currentClassification: 'lockout_tagout',
    currentLocation: 'Primary Crusher MCC',
    priorFindings: [
      {
        classification: 'lockout_tagout',
        location: 'Primary Crusher MCC',
        date: '2026-04-15', // 47 days ago
      },
      {
        classification: 'lockout_tagout',
        location: 'Primary Crusher MCC',
        date: '2026-04-01', // 61 days ago
      }
    ],
    currentDate,
  });

  assert(res3.recurringRiskDetected, 'Should detect recurring risk.');
  assert(res3.degradationRisk === 'high', 'Degradation risk should be high.');
  assert(res3.temporalRecurrence.escalationLevel === 'high', 'Escalation level should be high.');
  assert(res3.temporalRecurrence.hierarchyOfControlsShift, 'Should recommend hierarchy of controls shift.');
  assert(res3.siteMemorySummary.includes('HIGH TEMPORAL RECURRENCE'), 'Summary should mention high recurrence.');

  // Case 4: Chronic Recurrence (3+ category + location within 180 days)
  console.log('  Testing Case 4: Chronic Recurrence (within 180 days)');
  const res4 = service.evaluate({
    currentClassification: 'electrical',
    currentLocation: 'Maintenance Shop Bay 1',
    priorFindings: [
      {
        classification: 'electrical',
        location: 'Maintenance Shop Bay 1',
        date: '2026-01-15', // 137 days ago
      },
      {
        classification: 'electrical',
        location: 'Maintenance Shop Bay 1',
        date: '2026-02-15', // 106 days ago
      },
      {
        classification: 'electrical',
        location: 'Maintenance Shop Bay 1',
        date: '2025-12-15', // 169 days ago
      }
    ],
    currentDate,
  });

  assert(res4.recurringRiskDetected, 'Should detect recurring risk.');
  assert(res4.degradationRisk === 'high', 'Degradation risk should be high.');
  assert(res4.temporalRecurrence.escalationLevel === 'medium', 'Escalation level should be medium.');
  assert(res4.siteMemorySummary.includes('recurring operational patterns'), 'Summary should fall back to general memory.');

  // Case 5: Repeat Category at different locations
  console.log('  Testing Case 5: Repeat Category at different locations');
  const res5 = service.evaluate({
    currentClassification: 'electrical',
    currentLocation: 'Maintenance Shop Bay 1',
    priorFindings: [
      {
        classification: 'electrical',
        location: 'Conveyor 2 Tail Pulley',
        date: '2026-05-15', // 17 days ago, but different location
      },
      {
        classification: 'electrical',
        location: 'Crusher Control Room',
        date: '2026-05-20', // 12 days ago, but different location
      }
    ],
    currentDate,
  });

  assert(res5.recurringRiskDetected, 'Should detect general recurring risk (classification count >= 2).');
  assert(res5.degradationRisk === 'medium', 'Degradation risk should be medium due to operational pattern.');
  assert(res5.temporalRecurrence.escalationLevel === 'none', 'Escalation level should remain none (locations differ).');

  console.log('✅ SafeScope Temporal Hazard Memory validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
