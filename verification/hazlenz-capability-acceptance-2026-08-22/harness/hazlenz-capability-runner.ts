/**
 * HazLenz capability acceptance RUNNER.
 * Executes the EXACT customer classify pipeline the controller executes, in-process,
 * against the frozen acceptance matrix. Captures raw output only -- scoring is a
 * separate program so expectations cannot be tuned while results are visible.
 */
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';
import { sanitizeHazLenzDisplayOutput } from '../src/safescope-v2/display/hazlenz-display-sanitizer';
import { enforceHazLenzEvidenceBoundary, normalizeHazardObservationText } from '../src/safescope-v2/display/hazlenz-evidence-boundary';
import { applyEvidenceFoundation, applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';
import { applyFinalizationGate } from '../src/safescope-v2/evidence/finalization-gate';
import { attachGuidedFindingResponse } from '../src/safescope-v2/display/guided-finding-response';

function scopesForRegulatoryContext(context: string): string[] | undefined {
  switch (context) {
    case 'msha': return ['msha'];
    case 'osha-general-industry': return ['osha_general_industry'];
    case 'osha-construction': return ['osha_construction'];
    default: return undefined;
  }
}

async function main() {
  const matrixPath = process.argv[2];
  const outPath = process.argv[3];
  const regimeOverride = process.argv[4] || null; // for the Phase-10 experiment
  const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const service = app.get(SafescopeV2Service);
  const out = fs.createWriteStream(outPath, { flags: 'w' });

  let n = 0;
  for (const sc of matrix.scenarios) {
    const regime = regimeOverride ? regimeOverride : sc.regime;
    const body: any = {
      text: sc.text,
      scopes: scopesForRegulatoryContext(regime),
      structuredObservation: { jurisdiction: regime },
    };
    const started = Date.now();
    let payload: any = null;
    let error: string | null = null;
    try {
      const result: any = await service.classify(
        normalizeHazardObservationText(body.text),
        body.scopes, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, body.structuredObservation, undefined, undefined,
      );
      const foundation = await service.hydrateFindingScopedStandards(
        applyFindingScopedStandards(applyEvidenceFoundation(enforceHazLenzEvidenceBoundary(result, body), body), body),
        null,
      );
      const guided = attachGuidedFindingResponse(
        sanitizeHazLenzDisplayOutput(applyFinalizationGate(foundation)), body,
      );
      payload = enforceHazLenzEvidenceBoundary(guided, body);
    } catch (e: any) {
      error = String(e?.stack || e?.message || e);
    }
    out.write(JSON.stringify({
      id: sc.id, cohort: sc.cohort, regimeUsed: regime, declaredRegime: sc.regime,
      title: sc.title, text: sc.text, latencyMs: Date.now() - started,
      error, payload,
    }) + '\n');
    n++;
    process.stderr.write(`[${n}/${matrix.scenarios.length}] ${sc.id} ${error ? 'ERROR' : 'ok'}\n`);
  }
  out.end();
  await app.close();
  process.stderr.write(`DONE ${n} scenarios -> ${outPath}\n`);
}
main().catch((e) => { console.error(e); process.exit(1); });
