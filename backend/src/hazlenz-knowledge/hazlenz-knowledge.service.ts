import { Injectable, NotFoundException } from "@nestjs/common";
import { getSourceGovernance } from "./sources/source-governance-helper";
import { buildSourceSynthesis } from "./sources/source-synthesis-helper";
import { scoreKnowledgeDomainAlignment } from "./scoring/knowledge-domain-scoring.helper";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { SafeScopeKnowledgeChunk } from "./entities/safescope-knowledge-chunk.entity";
import {
  SafeScopeKnowledgeApprovalStatus,
  SafeScopeKnowledgeDocument,
  SafeScopeKnowledgeSourceType,
} from "./entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeRetrievalLog } from "./entities/safescope-knowledge-retrieval-log.entity";
import { SafeScopeKnowledgeSource } from "./entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "./entities/safescope-knowledge-ingestion-run.entity";
import {
  getSourceRole,
  ROLE_LABELS,
  ROLE_GUIDANCE,
} from "./sources/source-role-helper";

type CreateSafeScopeKnowledgeDocumentDto = {
  title: string;
  agency?: string;
  sourceType?: SafeScopeKnowledgeSourceType;
  authorityTier?: number;
  citation?: string;
  sourceUrl?: string;
  publishedAt?: string;
  reviewedAt?: string;
  approvalStatus?: SafeScopeKnowledgeApprovalStatus;
  summary?: string;
  rawText: string;
  hazardTags?: string[];
  equipmentTags?: string[];
  taskTags?: string[];
  standardTags?: string[];
  lessonTags?: string[];
};

type SearchSafeScopeKnowledgeDto = {
  query: string;
  agency?: string;
  agencyMode?: string;
  sourceTypes?: string[];
  approvedOnly?: boolean;
  limit?: number;
  workspaceId?: string;
  reportId?: string;
  findingId?: string;
};

@Injectable()
export class SafeScopeKnowledgeService {
  constructor(
    @InjectRepository(SafeScopeKnowledgeDocument)
    private readonly documentRepo: Repository<SafeScopeKnowledgeDocument>,
    @InjectRepository(SafeScopeKnowledgeChunk)
    private readonly chunkRepo: Repository<SafeScopeKnowledgeChunk>,
    @InjectRepository(SafeScopeKnowledgeRetrievalLog)
    private readonly retrievalLogRepo: Repository<SafeScopeKnowledgeRetrievalLog>,
    @InjectRepository(SafeScopeKnowledgeSource)
    private readonly sourceRepo: Repository<SafeScopeKnowledgeSource>,
    @InjectRepository(SafeScopeKnowledgeIngestionRun)
    private readonly ingestionRunRepo: Repository<SafeScopeKnowledgeIngestionRun>,
  ) {}

  async createDocument(dto: CreateSafeScopeKnowledgeDocumentDto) {
    const document = this.documentRepo.create({
      title: dto.title,
      agency: (dto.agency as any) || "Other",
      sourceType: dto.sourceType || "other",
      authorityTier:
        dto.authorityTier ?? this.defaultAuthorityTier(dto.sourceType),
      citation: dto.citation || null,
      sourceUrl: dto.sourceUrl || null,
      publishedAt: dto.publishedAt || null,
      reviewedAt: dto.reviewedAt || null,
      approvalStatus: dto.approvalStatus || "draft",
      summary: dto.summary || null,
      rawText: dto.rawText,
      hazardTags: this.normalizeTags(dto.hazardTags),
      equipmentTags: this.normalizeTags(dto.equipmentTags),
      taskTags: this.normalizeTags(dto.taskTags),
      standardTags: this.normalizeTags(dto.standardTags),
      lessonTags: this.normalizeTags(dto.lessonTags),
    });

    const saved = await this.documentRepo.save(document);
    await this.rebuildChunks(saved.id);

    return this.findDocument(saved.id);
  }

  async listDocuments() {
    return this.documentRepo.find({
      order: { createdAt: "DESC" },
      take: 250,
    });
  }

  async listPendingDocuments() {
    return this.documentRepo.find({
      where: { approvalStatus: "pending_review" },
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async approveDocument(id: string) {
    return this.updateDocumentApprovalStatus(id, "approved");
  }

  async rejectDocument(id: string) {
    return this.updateDocumentApprovalStatus(id, "rejected");
  }

  async getStatusCounts() {
    const statuses = ["pending_review", "approved", "rejected"];
    const results = await Promise.all(
      statuses.map((status) =>
        this.documentRepo.count({ where: { approvalStatus: status as any } }),
      ),
    );
    return Object.fromEntries(statuses.map((s, i) => [s, results[i]]));
  }

  async listSources() {
    return this.sourceRepo.find({
      order: { agency: "ASC", name: "ASC" },
      take: 100,
    });
  }

  async upsertSource(dto: {
    name: string;
    agency: string;
    sourceType: string;
    trustLevel?: string;
    defaultAuthorityTier?: number;
    baseUrl: string;
    description?: string;
    status?: string;
    metadataJson?: Record<string, any>;
  }) {
    const existing = await this.sourceRepo.findOne({
      where: { name: dto.name },
    });

    const source = existing || new SafeScopeKnowledgeSource();

    Object.assign(source, {
      name: dto.name,
      agency: dto.agency,
      sourceType: dto.sourceType,
      trustLevel: dto.trustLevel || "official",
      defaultAuthorityTier: dto.defaultAuthorityTier || 3,
      baseUrl: dto.baseUrl,
      description: dto.description || null,
      status: dto.status || "active",
      metadataJson: dto.metadataJson || {},
    });

    return this.sourceRepo.save(source);
  }

  async listIngestionRuns() {
    return this.ingestionRunRepo.find({
      order: { createdAt: "DESC" },
      take: 100,
    });
  }

  async createIngestionRun(dto: {
    sourceId?: string;
    sourceName: string;
    agency: string;
    sourceType: string;
    metadataJson?: Record<string, any>;
  }) {
    return this.ingestionRunRepo.save(
      this.ingestionRunRepo.create({
        sourceId: dto.sourceId || null,
        sourceName: dto.sourceName,
        agency: dto.agency,
        sourceType: dto.sourceType,
        status: "queued",
        metadataJson: dto.metadataJson || {},
      }),
    );
  }

  async markIngestionRunRunning(id: string) {
    const run = await this.ingestionRunRepo.findOne({ where: { id } });
    if (!run) throw new NotFoundException("SafeScope ingestion run not found");

    run.status = "running";
    run.startedAt = new Date();

    return this.ingestionRunRepo.save(run);
  }

  async completeIngestionRun(
    id: string,
    result: {
      discoveredCount?: number;
      ingestedCount?: number;
      pendingReviewCount?: number;
      approvedCount?: number;
      skippedCount?: number;
      warnings?: string[];
      status?: "completed" | "completed_with_warnings" | "failed";
      errorMessage?: string;
      metadataJson?: Record<string, any>;
    },
  ) {
    const run = await this.ingestionRunRepo.findOne({ where: { id } });
    if (!run) throw new NotFoundException("SafeScope ingestion run not found");

    run.status =
      result.status ||
      ((result.warnings || []).length
        ? "completed_with_warnings"
        : "completed");
    run.discoveredCount = result.discoveredCount ?? run.discoveredCount;
    run.ingestedCount = result.ingestedCount ?? run.ingestedCount;
    run.pendingReviewCount =
      result.pendingReviewCount ?? run.pendingReviewCount;
    run.approvedCount = result.approvedCount ?? run.approvedCount;
    run.skippedCount = result.skippedCount ?? run.skippedCount;
    run.warnings = result.warnings || [];
    run.errorMessage = result.errorMessage || null;
    run.metadataJson = {
      ...(run.metadataJson || {}),
      ...(result.metadataJson || {}),
    };
    run.completedAt = new Date();

    return this.ingestionRunRepo.save(run);
  }

  async findDocument(id: string) {
    const document = await this.documentRepo.findOne({
      where: { id },
      relations: { chunks: true },
      order: { chunks: { chunkIndex: "ASC" } as any },
    });

    if (!document)
      throw new NotFoundException("SafeScope knowledge document not found");

    return document;
  }

  async updateDocumentApprovalStatus(
    id: string,
    status: "draft" | "pending_review" | "approved" | "rejected" | "archived",
  ) {
    const document = await this.documentRepo.findOne({
      where: { id },
      relations: { chunks: true },
    });

    if (!document) {
      throw new NotFoundException("SafeScope knowledge document not found");
    }

    document.approvalStatus = status;

    if (status === "approved") {
      document.reviewedAt = new Date().toISOString();
    }

    const saved = await this.documentRepo.save(document);

    if (document.chunks?.length) {
      await this.chunkRepo.save(
        document.chunks.map((chunk) => {
          chunk.authorityTier = saved.authorityTier;
          chunk.confidenceWeight = this.authorityWeight(saved.authorityTier);
          return chunk;
        }),
      );
    }

    return saved;
  }

  async rebuildChunks(documentId: string) {
    const document = await this.documentRepo.findOne({
      where: { id: documentId },
    });
    if (!document)
      throw new NotFoundException("SafeScope knowledge document not found");

    await this.chunkRepo.delete({ documentId });

    const chunks = this.chunkText(document.rawText).map((chunkText, index) =>
      this.chunkRepo.create({
        documentId: document.id,
        document,
        chunkIndex: index,
        sectionHeading: this.extractHeading(chunkText),
        chunkText,
        chunkSummary: this.summarizeChunk(chunkText),
        citation: document.citation || null,
        authorityTier: document.authorityTier,
        hazardTags: document.hazardTags || [],
        equipmentTags: document.equipmentTags || [],
        taskTags: document.taskTags || [],
        standardTags: document.standardTags || [],
        lessonTags: document.lessonTags || [],
        confidenceWeight: this.authorityWeight(document.authorityTier),
      }),
    );

    return this.chunkRepo.save(chunks);
  }

  async search(dto: SearchSafeScopeKnowledgeDto) {
    const limit = Math.min(Math.max(dto.limit || 8, 1), 25);
    const query = (dto.query || "").trim();

    if (!query) {
      return {
        query,
        confidence: 0,
        matches: [],
        reasoning: {
          evidenceGaps: ["Enter a hazard description or search phrase."],
          caution:
            "HazLenz AI Knowledge Brain requires an observation before it can retrieve supporting references.",
        },
      };
    }

    const terms = this.extractTerms(query);

    const chunks = await this.chunkRepo.find({
      where: terms.length
        ? terms.map((term) => ({
            chunkText: ILike(`%${term}%`),
          }))
        : {},
      relations: { document: true },
      take: 300,
    });

    const directCitationTerms = this.directCitationRecallTerms(query, dto.agencyMode);

    if (directCitationTerms.length) {
      const directChunks = await this.chunkRepo.find({
        where: directCitationTerms.flatMap((term) => [
          { citation: ILike(`%${term}%`) },
          { sectionHeading: ILike(`%${term}%`) },
          { chunkText: ILike(`%${term}%`) },
        ]),
        relations: { document: true },
        take: 50,
      });

      const merged = new Map(chunks.map((chunk) => [chunk.id, chunk]));
      for (const chunk of directChunks) merged.set(chunk.id, chunk);
      chunks.splice(0, chunks.length, ...merged.values());
    }

    const filtered = chunks.filter((chunk) => {
      if (
        dto.approvedOnly !== false &&
        chunk.document?.approvalStatus !== "approved"
      ) {
        return false;
      }

      if (
        dto.agency &&
        dto.agency !== "all" &&
        chunk.document?.agency !== dto.agency
      ) {
        return false;
      }

      if (
        dto.sourceTypes?.length &&
        !dto.sourceTypes.includes(chunk.document?.sourceType)
      ) {
        return false;
      }

      return true;
    });

    const scored = filtered
      .map((chunk) => ({
        chunk,
        score: this.scoreChunk(query, terms, chunk, dto.agencyMode),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const matches = scored.map(({ chunk, score }) => {
      const isStarterReference =
        String(chunk.citation || "").startsWith("SAFE-SCOPE-") ||
        String(chunk.document?.title || "")
          .toLowerCase()
          .includes("starter reference");

      const effectiveSourceType = isStarterReference
        ? "training_material"
        : chunk.document?.sourceType || "";

      const effectiveAuthorityTier = isStarterReference
        ? 5
        : chunk.authorityTier;

      const role = isStarterReference
        ? "supporting_reference"
        : getSourceRole(effectiveSourceType, effectiveAuthorityTier);

      const governance = isStarterReference
        ? getSourceGovernance({
            sourceType: effectiveSourceType,
            sourceRole: role,
            authorityTier: effectiveAuthorityTier,
          })
        : getSourceGovernance(effectiveSourceType, effectiveAuthorityTier);

      return {
        chunkId: chunk.id,
        documentId: chunk.documentId,
        title: chunk.document?.title,
        agency: chunk.document?.agency,
        sourceType: effectiveSourceType,
        originalSourceType: chunk.document?.sourceType,
        sourceRole: role,
        sourceRoleLabel: ROLE_LABELS[role],
        usageGuidance: ROLE_GUIDANCE[role],
        sourceGovernance: governance,
        isPrimaryAuthority:
          !isStarterReference &&
          chunk.authorityTier === 1 &&
          chunk.document?.sourceType === "regulation" &&
          Boolean(chunk.document?.sourceUrl),
        isSupportiveAuthority: isStarterReference || effectiveAuthorityTier > 1,
        authorityTier: effectiveAuthorityTier,
        originalAuthorityTier: chunk.authorityTier,
        citation: chunk.citation,
        sourceUrl: chunk.document?.sourceUrl,
        sectionHeading: chunk.sectionHeading,
        excerpt: chunk.chunkText.slice(0, 900),
        tags: {
          hazards: chunk.hazardTags,
          equipment: chunk.equipmentTags,
          tasks: chunk.taskTags,
          standards: chunk.standardTags,
          lessons: chunk.lessonTags,
        },
        score,
        reason: this.explainMatch(terms, chunk),
      };
    });

    const confidence = matches.length
      ? Number(Math.min(0.95, matches[0].score / 100).toFixed(2))
      : 0;

    const evidenceGaps = this.evidenceGaps(query, matches);
    const sourceSynthesis = buildSourceSynthesis(matches);

    await this.retrievalLogRepo.save(
      this.retrievalLogRepo.create({
        workspaceId: dto.workspaceId || null,
        reportId: dto.reportId || null,
        findingId: dto.findingId || null,
        queryText: query,
        retrievedChunkIds: matches.map((match) => match.chunkId),
        selectedChunkIds: matches.slice(0, 5).map((match) => match.chunkId),
        confidence,
        reasoningJson: {
          evidenceGaps,
          topAuthorityTier: matches[0]?.authorityTier || null,
          sourceMix: matches.reduce((acc: Record<string, number>, match) => {
            const key = match.sourceType || "unknown";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {}),
        },
      }),
    );

    return {
      query,
      confidence,
      matches,
      sourceSynthesis,
      reasoning: {
        evidenceGaps,
        caution:
          "HazLenz AI references supporting knowledge and likely applicability. Final compliance decisions require qualified review.",
      },
    };
  }

  async retrieveForHazard(input: {
    fusedText: string;
    agencyMode?: string;
    classification?: string;
    location?: string;
    workspaceId?: string;
    reportId?: string;
    findingId?: string;
  }) {
    const query = [
      input.classification,
      input.fusedText,
      input.location ? `location ${input.location}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const agency =
      input.agencyMode === "msha" || input.agencyMode?.startsWith("msha_")
        ? "MSHA"
        : input.agencyMode?.startsWith("osha")
          ? "OSHA"
          : undefined;

    return this.search({
      query,
      agency,
      agencyMode: input.agencyMode,
      approvedOnly: true,
      limit: 8,
      workspaceId: input.workspaceId,
      reportId: input.reportId,
      findingId: input.findingId,
    });
  }

  private chunkText(rawText: string) {
    const clean = String(rawText || "")
      .replace(/\r/g, "")
      .trim();
    if (!clean) return [];

    const paragraphs = clean
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);
    const chunks: string[] = [];
    let current = "";

    for (const paragraph of paragraphs) {
      if ((current + "\n\n" + paragraph).length > 1800 && current) {
        chunks.push(current.trim());
        current = paragraph;
      } else {
        current = current ? `${current}\n\n${paragraph}` : paragraph;
      }
    }

    if (current.trim()) chunks.push(current.trim());

    return chunks.length ? chunks : [clean.slice(0, 1800)];
  }

  private extractHeading(text: string) {
    const firstLine = text.split("\n").find(Boolean)?.trim();
    if (!firstLine) return null;
    return firstLine.length <= 160 ? firstLine : null;
  }

  private summarizeChunk(text: string) {
    const firstSentence = text.split(/(?<=[.!?])\s+/)[0];
    return firstSentence?.slice(0, 280) || null;
  }

  private extractTerms(query: string) {
    const stopTerms = new Set([
      "condition",
      "hazard",
      "hazards",
      "observed",
      "exposed",
      "during",
      "operation",
      "location",
      "photo",
      "shows",
      "shown",
      "near",
      "area",
      "deck",
      "miners",
      "workers",
      "employees",
      "safety",
      "review",
      "current",
    ]);

    const normalized = query
      .toLowerCase()
      .replace(/[^a-z0-9\s/-]/g, " ");

    const meaningfulPhrases = [
      "machine guarding",
      "moving parts",
      "rotating parts",
      "conveyor pulley",
      "drive pulley",
      "pinch point",
      "unguarded moving parts",
      "mobile equipment",
      "haul truck",
      "forklift",
      "fall protection",
      "lockout tagout",
      "confined space",
      "electrical panel",
    ].filter((phrase) => normalized.includes(phrase));

    const tokens = normalized
      .split(/\s+/)
      .filter((term) => term.length >= 4 && !stopTerms.has(term))
      .slice(0, 20);

    return Array.from(new Set([...meaningfulPhrases, ...tokens]));
  }

  private directCitationRecallTerms(query: string, agencyMode?: string) {
    const normalizedQuery = `${agencyMode || ""} ${query}`
      .toLowerCase()
      .replace(/[^a-z0-9.\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (
      agencyMode === "osha_construction" &&
      /(fall protection|open side|open edge|unprotected|guardrail|safety net|personal fall arrest|lower level|walking working surface)/.test(
        normalizedQuery,
      )
    ) {
      return ["1926.501", "1926.502", "1926.500"];
    }

    if (
      agencyMode === "msha_mnm_surface" &&
      /(lockout|locked out|tagged|deenergized|de-energized|electrically powered equipment|mechanical work|repair)/.test(
        normalizedQuery,
      )
    ) {
      return ["56.12016", "56.12017"];
    }

    if (
      agencyMode === "msha_mnm_underground" &&
      /(lockout|locked out|tagged|deenergized|de-energized|electrically powered equipment|mechanical work|repair)/.test(
        normalizedQuery,
      )
    ) {
      return ["57.12016", "57.12017"];
    }

    if (
      agencyMode === "msha_coal_underground" &&
      /(machine guarding|unguarded|guard|guarding|moving machine parts|moving parts|conveyor|pulley|drive pulley|tail pulley|head pulley|sprocket|chain|shaft)/.test(
        normalizedQuery,
      )
    ) {
      return ["75.1722"];
    }

    if (
      agencyMode === "msha_coal_underground" &&
      /(lockout|locked out|tagged|deenergized|de-energized|electrical work|power circuits|distribution circuits|repair)/.test(
        normalizedQuery,
      )
    ) {
      return ["75.511", "75.511-1", "75.153"];
    }

    return [];
  }

  private scoreChunk(
    query: string,
    terms: string[],
    chunk: SafeScopeKnowledgeChunk,
    agencyMode?: string,
  ) {
    const haystack = [
      chunk.chunkText,
      chunk.chunkSummary,
      chunk.citation,
      ...(chunk.hazardTags || []),
      ...(chunk.equipmentTags || []),
      ...(chunk.taskTags || []),
      ...(chunk.standardTags || []),
      ...(chunk.lessonTags || []),
      chunk.document?.title,
      chunk.document?.sourceType,
      chunk.document?.agency,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const termScore = terms.reduce(
      (score, term) => score + (haystack.includes(term) ? 10 : 0),
      0,
    );
    const normalizedQuery = query.toLowerCase();
    const phraseScore = haystack.includes(normalizedQuery) ? 25 : 0;
    const authorityScore = Math.max(0, 35 - chunk.authorityTier * 5);
    const tagScore =
      [
        ...(chunk.hazardTags || []),
        ...(chunk.equipmentTags || []),
        ...(chunk.taskTags || []),
        ...(chunk.lessonTags || []),
      ].filter((tag) => normalizedQuery.includes(String(tag).toLowerCase()))
        .length * 8;

    const normalizedCitation = String(chunk.citation || "").toLowerCase();
    const compactCitation = normalizedCitation.replace(/^(29|30) cfr\s+/, "");

    const exactCitationScore =
      normalizedCitation && normalizedQuery.includes(normalizedCitation)
        ? 120
        : compactCitation && normalizedQuery.includes(compactCitation)
          ? 100
          : 0;

    const heading = String(chunk.sectionHeading || "").toLowerCase();
    const citation = String(chunk.citation || "").toLowerCase();
    const title = String(chunk.document?.title || "").toLowerCase();
    const sourceType = String(chunk.document?.sourceType || "").toLowerCase();

    const domainScore = scoreKnowledgeDomainAlignment({
      normalizedQuery,
      haystack,
      heading,
      title,
      citation,
      normalizedCitation,
      sourceType,
      agencyMode,
    });

    return (
      termScore +
      phraseScore +
      authorityScore +
      tagScore +
      exactCitationScore +
      domainScore
    );
  }

  private explainMatch(terms: string[], chunk: SafeScopeKnowledgeChunk) {
    const text = chunk.chunkText.toLowerCase();
    const matchedTerms = terms.filter((term) => text.includes(term));

    const reasons = [];
    if (matchedTerms.length)
      reasons.push(`Matched terms: ${matchedTerms.join(", ")}`);
    reasons.push(`Authority tier ${chunk.authorityTier}`);
    if (chunk.citation) reasons.push(`Reference: ${chunk.citation}`);

    return reasons.join(" · ");
  }

  private evidenceGaps(query: string, matches: any[]) {
    const gaps = [];
    const lower = query.toLowerCase();

    if (!/(photo|image|visible|observed|see|shown)/.test(lower)) {
      gaps.push("Confirm visible evidence or attach a supporting photo.");
    }

    if (
      !/(energized|locked|deenergized|maintenance|operating|running|shutdown)/.test(
        lower,
      )
    ) {
      gaps.push(
        "Confirm operating/energy state and whether maintenance is involved.",
      );
    }

    if (
      !/(exposed|guard|missing|damaged|unguarded|blocked|leaking|open|failed)/.test(
        lower,
      )
    ) {
      gaps.push("Clarify the exact exposure or failed control.");
    }

    if (!matches.length) {
      gaps.push(
        "No approved knowledge match found yet; add or approve reference material.",
      );
    }

    return gaps;
  }

  private defaultAuthorityTier(sourceType?: SafeScopeKnowledgeSourceType) {
    if (sourceType === "regulation") return 1;
    if (["policy", "interpretation", "directive"].includes(String(sourceType)))
      return 2;
    if (["accident_report", "fatality_report"].includes(String(sourceType)))
      return 3;
    if (["journal", "case_study"].includes(String(sourceType))) return 4;
    return 5;
  }

  private authorityWeight(authorityTier: number) {
    return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
  }

  private normalizeTags(tags?: string[]) {
    return Array.isArray(tags)
      ? Array.from(
          new Set(tags.map((tag) => String(tag).trim()).filter(Boolean)),
        )
      : [];
  }
}
