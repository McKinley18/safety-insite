import fs from 'node:fs';

const BASE = 'http://127.0.0.1:4000';
const TOKEN = fs.readFileSync(process.argv[2], 'utf8').trim();
const OUT_DIR = process.argv[3];

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

const RUN_SUFFIX = Date.now().toString(36);

async function createSite(name) {
  return api('POST', '/sites', { name: `${name} (${RUN_SUFFIX})` });
}

async function buildInspectionWithFindings(label, siteName, observations) {
  // observations: [{ text, findings: [{ hazardCategory, conclusion, actionTitle, actionDescription, actionPriority }] }]
  const site = await createSite(siteName);
  const inspection = await api('POST', '/inspections', { siteId: site.id, title: `${label} — ${siteName}` });
  console.log(`[${label}] inspection ${inspection.id}`);

  const createdActions = [];

  for (const obs of observations) {
    const observation = await api('POST', `/inspections/${inspection.id}/observations`, { rawText: obs.text });
    console.log(`[${label}] observation ${observation.id}`);

    const classify = await api('POST', '/safescope-v2/classify', {
      text: obs.text,
      scopes: ['all'],
      structuredObservation: { narrative: obs.text, jurisdiction: 'unknown' },
    });

    const idempotencyKey = `genreport-${label}-${observation.id}`.slice(0, 128);
    await api('POST', `/inspections/observations/${observation.id}/analyses`, {
      engineVersion: 'safescope-v2',
      idempotencyKey,
      requestVersion: 1,
      resultSnapshot: classify,
    });

    // Re-fetch inspection to see reconciled findings for this observation
    const refreshed = await api('GET', `/inspections/${inspection.id}`);
    const obsFindings = (refreshed.findings || []).filter(
      (f) => f.observationId === observation.id && f.status !== 'superseded',
    );
    console.log(`[${label}] reconciled ${obsFindings.length} finding(s) for observation ${observation.id}`);

    // Decomposition can legitimately surface more hazards than this fixture planned for one
    // observation; every reconciled finding must still get a review before the inspection can
    // complete, so extras fall back to a generic accept using the finding's own hazard label.
    for (let i = 0; i < obsFindings.length; i++) {
      const finding = obsFindings[i];
      const spec = obs.findings[i] || {
        hazardCategory: finding.hazardCategory || finding.hazardKey,
        conclusion: `Additional hazard identified during decomposition: ${finding.conclusion || finding.hazardKey}.`,
      };

      const review = await api('POST', `/inspections/observations/${observation.id}/reviews`, {
        findingId: finding.id,
        decision: 'accepted',
        rationale: spec.reviewRationale || 'Reviewed and confirmed by qualified inspector.',
      });

      await api('POST', `/inspections/observations/${observation.id}/findings`, {
        reviewId: review.id,
        hazardCategory: spec.hazardCategory,
        segmentKey: finding.segmentKey,
        conclusion: spec.conclusion,
      });

      if (spec.actionTitle) {
        const action = await api('POST', '/actions', {
          inspectionId: inspection.id,
          findingId: finding.id,
          title: spec.actionTitle,
          description: spec.actionDescription || spec.actionTitle,
          priorityCode: spec.actionPriority || 'medium',
          assignedToName: spec.actionOwner,
          dueDate: spec.actionDueDate,
        });
        createdActions.push(action.id);
      }
    }
  }

  let current = await api('GET', `/inspections/${inspection.id}`);
  await api('POST', `/inspections/${inspection.id}/transition`, { status: 'in_review', version: current.version });
  current = await api('GET', `/inspections/${inspection.id}`);
  await api('POST', `/inspections/${inspection.id}/transition`, { status: 'completed', version: current.version });
  console.log(`[${label}] inspection completed`);

  const report = await api('POST', `/inspections/${inspection.id}/reports`, {});
  console.log(`[${label}] report generated: version ${report.version}, status ${report.status}, size ${report.sizeBytes}`);

  const downloadRes = await fetch(`${BASE}/inspection-reports/${report.reportId}/versions/${report.version}/download`, {
    headers: { authorization: `Bearer ${TOKEN}` },
  });
  const buf = Buffer.from(await downloadRes.arrayBuffer());
  const outPath = `${OUT_DIR}/${label}.pdf`;
  fs.writeFileSync(outPath, buf);
  console.log(`[${label}] saved PDF -> ${outPath} (${buf.length} bytes)`);

  return { inspectionId: inspection.id, reportId: report.reportId, version: report.version, pdfPath: outPath, sizeBytes: buf.length };
}

const results = {};

// Report A — simple, one finding
results.ReportA = await buildInspectionWithFindings('ReportA', 'Riverside Distribution Center', [
  {
    text: 'Worker observed operating a bench grinder with the wheel guard removed, exposing the abrasive wheel at the point of operation.',
    findings: [
      {
        hazardCategory: 'machine_guarding',
        conclusion: 'Bench grinder point-of-operation guard was removed and not reinstalled, exposing the operator to direct contact with the rotating abrasive wheel.',
        actionTitle: 'Reinstall point-of-operation guard on bench grinder',
        actionDescription: 'Reinstall and verify the wheel guard on the bench grinder before further use; inspect guard fasteners for damage.',
        actionPriority: 'high',
        actionOwner: 'Maintenance Lead',
        actionDueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      },
    ],
  },
]);

// Report B — multi-hazard, at least three findings across different hazard families
// (machine guarding, fall protection, electrical/LOTO), each its own observation so
// each gets an independent HazLenz classify + decomposition + review.
results.ReportB = await buildInspectionWithFindings('ReportB', 'Northgate Manufacturing Plant', [
  {
    text: 'Machine operator working next to an unguarded rotating drive belt on the packaging line conveyor, point of operation fully exposed.',
    findings: [
      {
        hazardCategory: 'machine_guarding',
        conclusion: 'The packaging line conveyor drive belt lacks a fixed guard at the point of operation, exposing workers passing nearby to entanglement.',
        actionTitle: 'Install fixed guard on conveyor drive belt',
        actionDescription: 'Fabricate and install a fixed guard enclosing the conveyor drive belt point of operation; verify with a qualified technician before returning the line to service.',
        actionPriority: 'high',
        actionOwner: 'Line Maintenance',
        actionDueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      },
    ],
  },
  {
    text: 'Worker on elevated mezzanine platform approximately 12 feet above the warehouse floor with no guardrail or fall-arrest system in use along the open edge.',
    findings: [
      {
        hazardCategory: 'fall_protection',
        conclusion: 'The mezzanine platform edge has no guardrail system and workers were observed without personal fall-arrest equipment while working near the unprotected edge.',
        actionTitle: 'Install guardrail system on mezzanine edge',
        actionDescription: 'Install a compliant guardrail system along the open mezzanine edge; until installed, require fall-arrest harnesses tied off to an approved anchor point for any work within 6 feet of the edge.',
        actionPriority: 'urgent',
        actionOwner: 'Facilities Manager',
        actionDueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      },
    ],
  },
  {
    text: 'Electrician observed servicing a 480V motor control center panel without applying lockout/tagout, panel energized with cover removed.',
    findings: [
      {
        hazardCategory: 'lockout_tagout',
        conclusion: 'Energized 480V motor control center was serviced with the panel cover removed and no lockout/tagout applied, exposing the technician to arc flash and shock hazards.',
        actionTitle: 'Enforce lockout/tagout before MCC panel servicing',
        actionDescription: 'Retrain electrical staff on the site LOTO procedure for motor control centers; verify a lock/tag and zero-energy check is completed and documented before any panel cover is removed.',
        actionPriority: 'urgent',
        actionOwner: 'Electrical Safety Lead',
        actionDueDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
      },
    ],
  },
]);

// Report C — content/pagination stress test: long observation text, long corrective
// action narrative, multiple findings, mixed risk levels.
const longObservation = 'During a full-shift walkthrough of the fabrication bay, the inspector observed a series of related conditions around the CNC mill cell. '.repeat(6) +
  'The point-of-operation guard interlock on Mill 3 was found bypassed with a zip tie, allowing the spindle to run with the guard door open. Operators reported this has been the case for approximately three weeks following a changeover procedure, and that a work order was submitted but not yet actioned by maintenance. Multiple operators across two shifts confirmed the same bypass condition, and no compensating controls (e.g., light curtains, presence-sensing devices) were in place at the time of observation.';

const longActionDescription = 'Restore the point-of-operation interlock on Mill 3 to full working order and remove the zip-tie bypass immediately. '.repeat(4) +
  'Verify interlock function with a documented functional test (guard-open spindle-stop confirmation) before returning the machine to production use. Notify all shifts operating this cell of the corrective action and confirm understanding via toolbox talk sign-off. Escalate to the plant safety committee if the same bypass pattern recurs on any other CNC cell within the next 90 days, and consider a engineering root-cause review of the changeover procedure that is prompting operators to bypass the interlock in the first place.';

results.ReportC = await buildInspectionWithFindings('ReportC', 'Cascade Fabrication Works', [
  {
    text: longObservation,
    findings: [
      {
        hazardCategory: 'machine_guarding',
        conclusion: longObservation.slice(0, 400) + ' The interlock bypass constitutes a direct point-of-operation hazard during spindle rotation.',
        actionTitle: 'Restore CNC Mill 3 point-of-operation interlock and remove bypass',
        actionDescription: longActionDescription,
        actionPriority: 'urgent',
        actionOwner: 'Plant Maintenance Supervisor',
        actionDueDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
      },
    ],
  },
  {
    text: 'Compressed gas cylinders (oxygen and acetylene) stored together without separation and without secure chaining, near an active welding station.',
    findings: [
      {
        hazardCategory: 'compressed_gas',
        conclusion: 'Oxygen and acetylene cylinders were stored together unchained and unseparated near an active ignition source, contrary to standard compressed-gas storage practice.',
        actionTitle: 'Separate and secure compressed gas cylinders',
        actionDescription: 'Separate oxygen and fuel-gas cylinders by the required distance or fire-rated barrier, and secure all cylinders with chains or stands to prevent tipping.',
        actionPriority: 'medium',
        actionOwner: 'Shop Supervisor',
        actionDueDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      },
    ],
  },
  {
    text: 'Housekeeping walkway near the receiving dock was obstructed with pallets and stretch-wrap debris, partially blocking a marked emergency egress route.',
    findings: [
      {
        hazardCategory: 'emergency_egress',
        conclusion: 'Pallets and packaging debris were partially obstructing a marked emergency egress route near the receiving dock.',
        actionTitle: 'Clear obstructed egress route at receiving dock',
        actionDescription: 'Remove pallets and debris from the marked egress path and establish a daily housekeeping check for this area during receiving shifts.',
        actionPriority: 'low',
        actionOwner: 'Warehouse Lead',
        actionDueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      },
    ],
  },
]);

console.log(JSON.stringify(results, null, 2));
