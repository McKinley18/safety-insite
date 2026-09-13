/**
 * §105 DIAGNOSTIC — what does the producer actually put in `quotedText`, and why did it not bind?
 *
 * A rejected analysis carries no validated candidates, so the probe can report THAT a quote failed
 * to bind but not WHAT was attempted. Distinguishing "the model paraphrased" from "the model copied
 * correctly and the binder is too strict" decides whether the next change belongs in the model's
 * prompt or in the binder, and guessing between those would be exactly the wrong way to spend a
 * production edit. So this reads the bound raw BEFORE the boundary runs.
 *
 * Local provider only. $0.00.
 */
import { OllamaExpertProvider } from '../src/hazlenz/expert-hazlenz-adapters/ollama-expert-provider';
import { ROUTING_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/routing-fixtures';
import { GROUNDING_FIXTURES } from '../src/hazlenz/expert-hazlenz/fixtures/grounding-fixtures';

const WANTED = (process.env.DIAG_CASES || 'R5,H7,H8').split(',');
const REPEATS = Number(process.env.DIAG_REPEATS || 2);

(async function main() {
  const provider = new OllamaExpertProvider();
  const all = [...ROUTING_FIXTURES, ...GROUNDING_FIXTURES];
  for (const id of WANTED) {
    const f = all.find(x => x.id === id);
    if (!f) { console.log(`?? unknown case ${id}`); continue; }
    const obs = f.input.authoritativeSources[0].text;
    console.log(`\n================ ${id} ================`);
    console.log(`OBSERVATION: ${JSON.stringify(obs)}\n`);
    for (let i = 1; i <= REPEATS; i += 1) {
      const r = await provider.analyze(f.input);
      if (!r.ok) { console.log(`  #${i} provider failure ${r.kind}`); continue; }
      const raw = r.raw as any;
      const cands = (raw?.expertHazardCandidates ?? []) as any[];
      console.log(`  #${i}  ${cands.length} candidate(s)`);
      for (const c of cands) {
        console.log(`     status=${c.groundingStatus}  evidence=${(c.evidence ?? []).length}`);
        for (const e of c.evidence ?? []) {
          const bound = e.startOffset >= 0;
          console.log(`       ${bound ? 'BOUND    ' : 'UNBINDABLE'} ${JSON.stringify(e.quotedText)}`);
          if (!bound) {
            const norm = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase();
            console.log(`         whitespace/case-normalised present in source? `
              + `${norm(obs).includes(norm(e.quotedText))}`);
          }
        }
      }
    }
  }
})();
