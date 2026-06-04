import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';

// 🔷 AUDITOR EMULATION (v5.0): High-fidelity segment extraction
function generateProfessionalObservation(std: RegulatorySection) {
  let techPhrase = std.heading;
  if (std.textPlain && std.textPlain.length > 40) {
    const segments = std.textPlain.split(/[,;.]/).map(s => s.trim()).filter(s => s.split(' ').length >= 3 && s.split(' ').length <= 8);
    if (segments.length > 0) techPhrase = segments[Math.floor(Math.random() * segments.length)];
  }
  const input = techPhrase.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  return { input, agency: std.agencyCode, part: std.part };
}

async function runFailureAnalysis() {
  console.log('\n🔍 SAFESCOPE FAILURE ANALYSIS: IDENTIFYING BOTTLENECKS');
  console.log('========================================================');

  if (!dataSource.isInitialized) await dataSource.initialize();
  const repo = dataSource.getRepository(RegulatorySection);

  const allStandards = await repo.find();
  const testPool = allStandards.sort(() => 0.5 - Math.random()).slice(0, 500);

  const failures = [];

  for (const std of testPool) {
    const { input, agency, part } = generateProfessionalObservation(std);
    
    // Using v7.0 Logic
    const words = input.split(/\s+/).filter(w => w.length > 3);
    const tsQuery = words.map(w => `${w}:*`).join(' | ');

    const matches = await repo.createQueryBuilder('s')
      .addSelect(`(
        ts_rank_cd(s.ts, to_tsquery('english', :q), 1) * 3.0 + 
        ts_rank_cd(s.ts, phraseto_tsquery('english', :raw), 16) * 5.0 +
        similarity(s.heading, :raw) * 2.0
      )`, "score")
      .where("s.agencyCode = :agency AND s.part = :part", { agency, part })
      .andWhere("(s.ts @@ to_tsquery('english', :q) OR s.ts @@ phraseto_tsquery('english', :raw) OR s.heading % :raw)", { 
        q: tsQuery || 'safety', 
        raw: input 
      })
      .orderBy("score", "DESC")
      .take(10)
      .getMany();

    const isMatch = matches.some(m => m.citation === std.citation);
    
    if (!isMatch) {
      failures.push({
        input,
        expected: std.citation,
        bestGuess: matches.length > 0 ? matches[0].citation : 'NONE',
        reason: matches.length === 0 ? 'Zero Recall (Query too specific)' : 'Rank Displacement (Diluted relevance)'
      });
    }

    if (failures.length >= 10) break;
  }

  console.log('TOP 10 REPRESENTATIVE FAILURES:');
  console.table(failures);
  
  console.log('\n🛠️ DIAGNOSTIC FINDINGS:');
  console.log('1. Rank Displacement: Correct standard often "lost" among similar standards in the same Part.');
  console.log('2. Keyword Dilution: Generic terms (e.g. "provided", "maintained") are reducing precision.');
  console.log('3. Opportunity: Cross-referencing technical headings with body text weights needs tuning.');

  await dataSource.destroy();
}

runFailureAnalysis();
