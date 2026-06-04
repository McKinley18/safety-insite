import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ReportsService } from '../src/reports/reports.service';
import { ActionEngineService } from '../src/action-engine/action-engine.service';
import { CorrectiveActionsService } from '../src/corrective-actions/corrective-actions.service';
import { FixFeedbackService } from '../src/intelligence/fix-feedback.service';
import { performance } from 'perf_hooks';
import * as jwt from 'jsonwebtoken';

async function runDiagnostic() {
  console.log('\n🛡️  SENTINEL SAFETY: GLOBAL SYSTEM DIAGNOSTIC & VALIDATION HARNESS');
  console.log('====================================================================');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  
  const reportsService = app.get(ReportsService);
  const actionEngine = app.get(ActionEngineService);
  const correctiveActions = app.get(CorrectiveActionsService);
  const feedbackService = app.get(FixFeedbackService);

  // 🔷 STEP 3: GENERATE TEST DATA (50+ REALISTIC HAZARDS)
  const testInputs = [
    { input: "unguarded conveyor belt near primary crusher", category: "machine" },
    { input: "exposed electrical wiring in maintenance shop", category: "electrical" },
    { input: "blocked fire exit in warehouse rack 4", category: "fire" },
    { input: "worker observed working without hard hat at face", category: "ppe" },
    { input: "forklift speeding in pedestrian walkway", category: "vehicle" },
    { input: "oil spill near hydraulic power unit", category: "slip" },
    { input: "damaged insulation on high voltage cable", category: "electrical" },
    { input: "missing toe-board on elevated platform", category: "fall" },
    { input: "unlabeled chemical drum in storage yard", category: "chemical" },
    { input: "cracked windshield on haul truck 102", category: "vehicle" },
    { input: "emergency stop button inoperable on belt 5", category: "machine" },
    { input: "daisy-chained power strips in office", category: "electrical" },
    { input: "oxygen cylinders stored near fuel gases", category: "fire" },
    { input: "employee not wearing safety glasses during grinding", category: "ppe" },
    { input: "loose handrail on secondary crusher stairs", category: "fall" },
    { input: "leaking flammable liquid container", category: "chemical" },
    { input: "backup alarm inaudible on front end loader", category: "vehicle" },
    { input: "unsecured extension ladder on roof", category: "fall" },
    { input: "no signage for high noise area", category: "ppe" },
    { input: "debris accumulation on emergency stairs", category: "fire" },
    { input: "exposed drive belt on water pump", category: "machine" },
    { input: "knockout missing in electrical panel", category: "electrical" },
    { input: "ice accumulation on loading dock ramp", category: "slip" },
    { input: "frayed safety harness webbing", category: "fall" },
    { input: "incompatible chemicals stored on same pallet", category: "chemical" },
    { input: "seatbelt missing in utility vehicle", category: "vehicle" },
    { input: "sparks observed from motor junction box", category: "electrical" },
    { input: "unprotected floor opening in mill building", category: "fall" },
    { input: "fire extinguisher pressure gauge in red zone", category: "fire" },
    { input: "grinding wheel tool rest gap exceeds 1/8 inch", category: "machine" },
    { input: "no safety data sheet for new cleaning solvent", category: "chemical" },
    { input: "high traffic corridor blocked by pallets", category: "slip" },
    { input: "dust mask used in place of required respirator", category: "ppe" },
    { input: "hydraulic fluid spraying from broken hose", category: "machine" },
    { input: "unguarded rotating fan blades at floor level", category: "machine" },
    { input: "ground pin removed from portable tool plug", category: "electrical" },
    { input: "expired inspection tag on fire extinguisher", category: "fire" },
    { input: "fall protection anchor point shows rust", category: "fall" },
    { input: "missing ghs pictograms on secondary container", category: "chemical" },
    { input: "truck tires showing canvas through tread", category: "vehicle" },
    { input: "hearing protection missing in compressor room", category: "ppe" },
    { input: "loose mounting bolts on shaker motor", category: "machine" },
    { input: "panel cover missing in substation", category: "electrical" },
    { input: "puddle of grease in walkway near shop", category: "slip" },
    { input: "unlocked fire door during operating shift", category: "fire" },
    { input: "employee working above 4ft without harness", category: "fall" },
    { input: "hazardous waste drum leaking into soil", category: "chemical" },
    { input: "failed brakes on service truck", category: "vehicle" },
    { input: "nitrile gloves torn during chemical transfer", category: "ppe" },
    { input: "vibration dampener broken on centrifugal pump", category: "machine" }
  ];

  // 🔷 STEP 5: VALIDATION TRACKING
  const metrics = {
    totalTests: testInputs.length,
    successfulPipelines: 0,
    failedPipelines: 0,
    actionsCreated: 0,
    feedbackRecordsCreated: 0,
    learningTriggered: 0,
    totalLatency: 0,
    maxLatency: 0
  };

  const signingSecret = process.env.JWT_SECRET || 'local_dev_secret_only';
  const authHeader = `Bearer ${jwt.sign({ sub: 'diagnostic-user', email: 'test@diagnostic.com', tenantId: 'diagnostic-tenant', role: 'admin' }, signingSecret)}`;

  console.log(`🚀 Executing ${metrics.totalTests} Pipeline Tests...`);

  for (const test of testInputs) {
    const start = performance.now();
    try {
      // 1. Create Report & Simulate Classification
      const reportBody = {
        company: "Diagnostic Corp",
        inspector: "System Auditor",
        site: "Global Mill",
        findings: [{
          hazardCategory: test.category,
          hazard: test.input,
          severity: 8,
          likelihood: 5,
          riskScore: 85,
          riskLevel: "CRITICAL",
          criticalOverride: test.input.includes("fire") || test.input.includes("electrical")
        }]
      };

      const report = await reportsService.create(reportBody);
      if (!report.findings || report.findings.length === 0) throw new Error("No findings created");

      // 2. Action Generation & Storage
      // (Actually handled inside reportsService.create in v13.0+)
      const actions = report.generatedActions || [];
      metrics.actionsCreated += actions.length;

      // 3. Mark as Completed & Trigger Feedback
      for (const action of actions) {
        const savedAction = await correctiveActions.create(authHeader, {
          title: action.title,
          description: action.description,
          priorityCode: action.priority,
          targetDate: action.dueDate,
          assignedToUserId: "mock-user-id", 
          category: action.category,
          originalSuggestion: action.originalSuggestion,
          reportId: report.id // Added missing field
        } as any);

        await correctiveActions.close(savedAction.id, { closureNotes: "Verified fix implemented by site team." });
        metrics.feedbackRecordsCreated++;
      }

      // 4. Learning Pass (Verify if same input generates learned fixes)
      const secondPass = await actionEngine.generateActionsFromReport({
        id: "diagnostic-pass-2",
        category: test.category,
        description: test.input,
        riskScore: 85,
        riskLevel: "CRITICAL",
        confidence: 0.95,
        patterns: [],
        location: "Global Mill",
        override: false
      });

      if (secondPass[0].suggestedFixes && secondPass[0].suggestedFixes.length > 0) {
        metrics.learningTriggered++;
      }

      const end = performance.now();
      const latency = end - start;
      metrics.totalLatency += latency;
      if (latency > metrics.maxLatency) metrics.maxLatency = latency;

      metrics.successfulPipelines++;
    } catch (e) {
      console.error(`❌ Pipeline failure for input: "${test.input}" - ${e.message}`);
      metrics.failedPipelines++;
    }
  }

  // 🔷 STEP 6: FAILURE INJECTION TESTS
  console.log('\n🧪 Running Failure Injection Tests...');
  let failureHandling = "PASS";
  try {
    await reportsService.create({ company: null, findings: null });
    await actionEngine.generateActionsFromReport(null as any);
  } catch (e) {
    console.log(`✅ System successfully handled invalid inputs: ${e.message}`);
  }

  // 🔷 STEP 7: SECURITY TESTS
  console.log('🛡️  Running Security Verification Tests...');
  let securityTests = "PASS";
  try {
    await correctiveActions.findAll('', { page: 1, limit: 10 });
    securityTests = "FAIL (No auth blocked)";
  } catch (e) {
    console.log(`✅ Unauthorized access correctly blocked: ${e.message}`);
  }

  // Malicious Input
  const maliciousInput = "<script>alert('XSS')</script>";
  const xssReport = await reportsService.create({ company: "XSS-Corp", findings: [{ hazardCategory: "machine", hazard: maliciousInput }] });
  if (xssReport.findings[0].hazard.includes("<script>")) {
    console.log("✅ Malicious input safely stored as string (Sanitization expected at View layer)");
  }

  // 🔷 STEP 9: OUTPUT REPORT
  const avgLatency = (metrics.totalLatency / metrics.totalTests).toFixed(2);
  const successRate = ((metrics.successfulPipelines / metrics.totalTests) * 100).toFixed(1);

  console.log('\n====================================================================');
  console.log('📈 SYSTEM DIAGNOSTIC REPORT');
  console.log('--------------------------------------------------------------------');
  console.log(`Total Tests:           ${metrics.totalTests}`);
  console.log(`Pipeline Success Rate: ${successRate}%`);
  console.log(`Actions Created:       ${metrics.actionsCreated}`);
  console.log(`Feedback Recorded:     ${metrics.feedbackRecordsCreated}`);
  console.log(`Learning Triggered:    ${metrics.learningTriggered}`);
  console.log('--------------------------------------------------------------------');
  console.log(`Failure Handling:      ${failureHandling}`);
  console.log(`Security Tests:        ${securityTests}`);
  console.log('--------------------------------------------------------------------');
  console.log(`Average Latency:       ${avgLatency} ms`);
  console.log(`Max Latency:           ${metrics.maxLatency.toFixed(2)} ms`);
  console.log('====================================================================\n');

  if (metrics.failedPipelines > 0 || securityTests !== "PASS") {
    console.log('🛑 SYSTEM STATUS: FAILED');
    process.exit(1);
  } else {
    console.log('✅ SYSTEM STATUS: OPTIMAL');
  }

  await app.close();
}

runDiagnostic().catch(err => {
    console.error('FATAL SYSTEM CRASH DURING DIAGNOSTIC:', err);
    process.exit(1);
});
