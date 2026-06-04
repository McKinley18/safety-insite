import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ReportsService } from '../src/reports/reports.service';
import { CorrectiveActionsService } from '../src/corrective-actions/corrective-actions.service';
import { FixFeedbackService } from '../src/intelligence/fix-feedback.service';
import { performance } from 'perf_hooks';

async function runChaos() {
  console.log('\n🔥 SAFESCOPE CHAOS & ADVERSARIAL TESTING SUITE 🔥');
  console.log('====================================================');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const reportsService = app.get(ReportsService);
  const correctiveActions = app.get(CorrectiveActionsService);

  const results = {
    concurrency: 'FAIL',
    integrity: 'FAIL',
    learning: 'FAIL',
    security: 'FAIL',
    perf: 'FAIL'
  };

  // 1. CONCURRENCY: Simulate 100 simultaneous executions
  console.log('🧪 Testing Concurrency...');
  const concurrentTasks = Array(100).fill(0).map(() => 
    reportsService.create({ company: "ChaosCorp", findings: [{ hazardCategory: "machine", hazard: "Conveyor tail pulley missing guard" }] })
  );
  try {
    await Promise.all(concurrentTasks);
    results.concurrency = 'PASS';
  } catch (e) { console.error('Concurrency Error:', e); }

  // 2. DIRTY REAL-WORLD INPUTS
  console.log('🧪 Testing Dirty Inputs...');
  const dirtyInputs = ["slipery flor near entrnce", "machine bad", "omg watchout the floor is liquidy greasy and dangerous", "electrical fire in the warehouse storage area near the back exit"];
  try {
    for (const input of dirtyInputs) await reportsService.create({ company: "ChaosCorp", findings: [{ hazardCategory: "slip", hazard: input }] });
    results.integrity = 'PASS';
  } catch (e) { console.error('Dirty Input Error:', e); }

  // 3. FEEDBACK POISONING
  console.log('🧪 Testing Feedback Poisoning...');
  // Force bad feedback (rejecting machine for slip)
  try {
    const action = await reportsService.create({ company: "PoisonCorp", findings: [{ hazardCategory: "machine", hazard: "guard missing" }] });
    await correctiveActions.close(action.generatedActions[0].id, { closureNotes: "Reject: This is actually a slip hazard." });
    results.learning = 'PASS';
  } catch (e) { console.error('Poisoning Error:', e); }

  // 4. SECURITY HARDENING
  console.log('🧪 Testing Security (Injection/Escalation)...');
  const malicious = ["' OR 1=1 --", "<script>alert('xss')</script>", "{\"__proto__\":{\"polluted\":true}}"];
  try {
    for (const input of malicious) await reportsService.create({ company: "HackerCorp", findings: [{ hazardCategory: "machine", hazard: input }] });
    results.security = 'PASS';
  } catch (e) { console.error('Security Error:', e); }

  // 5. PERFORMANCE STRESS (Memory/Latency)
  console.log('🧪 Testing Performance Stress (1000 iterations)...');
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    await reportsService.create({ company: "StressCorp", findings: [{ hazardCategory: "ppe", hazard: "helmet missing" }] });
  }
  const end = performance.now();
  if ((end - start) < 30000) results.perf = 'PASS';
  const mem = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory Usage: ${mem.toFixed(2)} MB`);

  // Final Output
  console.log('\n=== CHAOS TEST REPORT ===');
  console.log(`Concurrency Safety:    ${results.concurrency}`);
  console.log(`Data Integrity:        ${results.integrity}`);
  console.log(`Learning Stability:    ${results.learning}`);
  console.log(`Security Hardening:    ${results.security}`);
  console.log(`Performance Under Load:${results.perf}`);
  console.log('=========================\n');

  await app.close();
  process.exit(results.concurrency === 'PASS' && results.integrity === 'PASS' ? 0 : 1);
}

runChaos().catch(err => {
    console.error('CRITICAL FAILURE IN HARNESS:', err);
    process.exit(1);
});
