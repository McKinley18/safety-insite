import { DataSource, ILike } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { fetch } from "undici";

config();

function normalize(citation: string) {
  return citation.toUpperCase()
    .replace(/§\s*/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/, "")
    .trim();
}

async function getGovInfoSections(title: string) {
  const url = `https://www.govinfo.gov/bulkdata/ECFR/title-${title}/ECFR-title${title}.xml`;
  const response = await fetch(url);
  const xml = await response.text();
  
  const sectionRegex = /<(?:DIV8|SECTION)[^>]*N="([^"]+)"[^>]*>([\s\S]*?)<\/(?:DIV8|SECTION)>/gi;
  const sections: { citation: string, heading: string }[] = [];
  let match;
  while ((match = sectionRegex.exec(xml)) !== null) {
      const headingMatch = match[2].match(/<HEAD>([\s\S]*?)<\/HEAD>/i);
      sections.push({
          citation: `${title} CFR ${match[1]}`,
          heading: headingMatch ? headingMatch[1].replace(/<[^>]*>?/gm, "").trim() : "Section"
      });
  }
  return sections;
}

async function run() {
  const ds = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL || "postgres://mckinley@localhost:5432/sentinel_safety",
    entities: [SafeScopeKnowledgeDocument, SafeScopeKnowledgeChunk],
    synchronize: false,
  });
  await ds.initialize();
  const chunkRepo = ds.getRepository(SafeScopeKnowledgeChunk);

  const titles = ["29", "30"];
  for (const title of titles) {
    console.log(`\nAuditing Title ${title}...`);
    
    const expected = await getGovInfoSections(title);
    
    const ingested = await chunkRepo.createQueryBuilder("c")
      .innerJoin("c.document", "d")
      .where("d.sourceType = 'regulation'")
      .andWhere("d.authorityTier = 1")
      .andWhere("d.sourceUrl ILIKE '%ecfr.gov%'")
      .andWhere("c.citation ILIKE :prefix", { prefix: `${title} CFR %` })
      .getMany();
      
    const ingestedCitations = new Set(ingested.map(c => normalize(c.citation || "")));

    console.log(`Expected: ${expected.length} sections`);
    console.log(`Ingested: ${ingested.length} sections`);
    
    console.log("Sample ingested citations (first 5):");
    ingested.slice(0, 5).forEach(c => console.log(` - ${c.citation}`));

    const missing = expected.filter(e => !ingestedCitations.has(normalize(e.citation)));
    console.log(`Missing sections: ${missing.length}`);
    missing.slice(0, 10).forEach(m => console.log(` - ${m.citation}`));
  }

  await ds.destroy();
}

run().catch(console.error);
