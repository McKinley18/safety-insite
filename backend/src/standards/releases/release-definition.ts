import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { releaseCitationKey } from './citation-identity';

/**
 * KG-5B (Phase 3) -- EXPLICIT RELEASE MEMBERSHIP.
 *
 * =====================================================================================
 * THE DEFECT THIS ANSWERS
 * =====================================================================================
 *
 * `finalize-regulatory-release.ts` selected `FROM standards_master` with no `WHERE` clause.
 * Release membership was therefore "every row in the live corpus at the moment finalization ran".
 * That is not a definition of membership; it is the absence of one. Its consequences are all
 * observable:
 *
 *   - inserting an unrelated legacy row changes the release manifest;
 *   - deleting an unrelated legacy row changes the release manifest;
 *   - a release is not reproducible from version control, only from a database state;
 *   - and a reviewer cannot be shown, before finalization, what they are about to freeze.
 *
 * A release is a reviewed regulatory artifact. What is in it must be a DECISION, recorded in
 * version control, reviewable in a diff, and identical on every machine.
 *
 * =====================================================================================
 * WHY MEMBERSHIP IS NAMED BY citationKey
 * =====================================================================================
 *
 * `citationKey` is the LOGICAL regulatory identity from `citation-identity.ts`: it unifies
 * `1910.147` and `29 CFR 1910.147` while preserving every subsection level, so `1926.50` and
 * `1926.501` are -- correctly -- different members. Naming members by the published citation
 * STRING instead would make membership depend on the formatting accident that KG5A-DISC-01 is
 * about; naming them by database id would make it depend on a row that governed construction is
 * forbidden to touch.
 *
 * The published `citation` is carried alongside as a human-readable cross-check, and the loader
 * refuses a definition whose `citation` does not normalize to its own `citationKey` -- so a typo
 * in either field is a refusal rather than a silently different release.
 *
 * =====================================================================================
 * THE OPTIONAL PINS, AND WHY THEY ARE NOT "FORCING A DIGEST"
 * =====================================================================================
 *
 * A definition may pin `expectedManifestChecksum` and per-member `expectedRecordChecksum`. These
 * are VERIFICATIONS, never inputs: the builder computes the manifest from the governed source set
 * and REFUSES if a pin disagrees. Nothing is ever adjusted to satisfy a pin. For
 * `federal-core-2026-07-30.1` the pins are the values KG-5A measured, which turns the definition
 * into a self-checking reproduction of a release 27 reviewers' recorded comparisons refer to.
 */

export const RELEASE_DEFINITION_SCHEMA_VERSION = 'insite.governed-release-definition.v1';

export interface ReleaseDefinitionMember {
  /** Logical regulatory identity. THE membership key. */
  citationKey: string;
  /** Published citation, for human review. Must normalize to `citationKey`. */
  citation: string;
  agency: string;
  /** Optional verification pin. Never an input to construction. */
  expectedRecordChecksum?: string;
}

export interface ReleaseDefinition {
  schemaVersion: string;
  releaseId: string;
  releaseVersion: string;
  parserVersion: string;
  applicabilitySchemaVersion: string;
  description: string;
  members: ReleaseDefinitionMember[];
  expectedManifestChecksum?: string;
  expectedRecordCount?: number;
}

export class ReleaseDefinitionInvalid extends Error {
  constructor(readonly problems: string[]) {
    super(`Release definition is invalid:\n  - ${problems.join('\n  - ')}`);
    this.name = 'ReleaseDefinitionInvalid';
  }
}

export const RELEASE_DEFINITION_DIRECTORY = join(__dirname, 'definitions');

/**
 * Validates a definition structurally. Every failure is collected rather than thrown on first
 * sight, because an operator fixing a definition should see all of its problems at once.
 */
export function validateReleaseDefinition(definition: ReleaseDefinition): string[] {
  const problems: string[] = [];

  if (definition.schemaVersion !== RELEASE_DEFINITION_SCHEMA_VERSION) {
    problems.push(
      `schemaVersion is '${definition.schemaVersion}', expected '${RELEASE_DEFINITION_SCHEMA_VERSION}'.`,
    );
  }
  for (const field of ['releaseId', 'releaseVersion', 'parserVersion', 'applicabilitySchemaVersion'] as const) {
    if (!definition[field] || !String(definition[field]).trim()) problems.push(`${field} is required.`);
  }
  if (!Array.isArray(definition.members) || definition.members.length === 0) {
    problems.push('members must be a non-empty array.');
    return problems;
  }

  const seen = new Set<string>();
  definition.members.forEach((member, index) => {
    const where = `members[${index}]`;
    if (!member.citationKey) { problems.push(`${where}.citationKey is required.`); return; }
    if (!member.citation) { problems.push(`${where}.citation is required.`); return; }

    // The cross-check. A definition where the two disagree is ambiguous about which regulation it
    // names, and an ambiguous membership entry must never be resolved by preferring one field.
    const derived = releaseCitationKey(member.citation);
    if (derived !== member.citationKey) {
      problems.push(
        `${where}: citation '${member.citation}' normalizes to '${derived}', ` +
        `but citationKey says '${member.citationKey}'.`,
      );
    }
    if (seen.has(member.citationKey)) {
      problems.push(`${where}: duplicate citationKey '${member.citationKey}'.`);
    }
    seen.add(member.citationKey);

    if (member.expectedRecordChecksum && !/^[0-9a-f]{64}$/.test(member.expectedRecordChecksum)) {
      problems.push(`${where}.expectedRecordChecksum is not a sha256 hex digest.`);
    }
  });

  if (definition.expectedManifestChecksum && !/^[0-9a-f]{64}$/.test(definition.expectedManifestChecksum)) {
    problems.push('expectedManifestChecksum is not a sha256 hex digest.');
  }
  if (definition.expectedRecordCount !== undefined
      && definition.expectedRecordCount !== definition.members.length) {
    problems.push(
      `expectedRecordCount ${definition.expectedRecordCount} disagrees with ` +
      `${definition.members.length} declared members.`,
    );
  }
  return problems;
}

/** Loads and validates one definition by releaseId. Throws `ReleaseDefinitionInvalid` if unusable. */
export function loadReleaseDefinition(releaseId: string): ReleaseDefinition {
  const path = join(RELEASE_DEFINITION_DIRECTORY, `${releaseId}.json`);
  if (!existsSync(path)) {
    throw new ReleaseDefinitionInvalid([
      `No release definition file for '${releaseId}'. Expected ${path}. ` +
      'Governed releases are constructed only from a version-controlled definition; there is no ' +
      'path that infers membership from database contents.',
    ]);
  }
  const definition = JSON.parse(readFileSync(path, 'utf8')) as ReleaseDefinition;
  if (definition.releaseId !== releaseId) {
    throw new ReleaseDefinitionInvalid([
      `File ${releaseId}.json declares releaseId '${definition.releaseId}'.`,
    ]);
  }
  const problems = validateReleaseDefinition(definition);
  if (problems.length) throw new ReleaseDefinitionInvalid(problems);
  return definition;
}

/** Every definition present in the repository. Used by `regulatory-release status`. */
export function listReleaseDefinitions(): ReleaseDefinition[] {
  if (!existsSync(RELEASE_DEFINITION_DIRECTORY)) return [];
  return readdirSync(RELEASE_DEFINITION_DIRECTORY)
    .filter(name => name.endsWith('.json'))
    .map(name => loadReleaseDefinition(name.replace(/\.json$/, '')))
    .sort((a, b) => a.releaseId.localeCompare(b.releaseId));
}
