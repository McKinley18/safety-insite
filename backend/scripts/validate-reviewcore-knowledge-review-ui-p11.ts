import * as fs from 'fs';
import * as path from 'path';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const repoRoot = path.resolve(__dirname, '../..');
const overviewPath = path.join(repoRoot, 'frontend-next/app/safescope-knowledge/page.tsx');
const reviewPath = path.join(repoRoot, 'frontend-next/app/safescope-knowledge/review/page.tsx');

assert(fs.existsSync(overviewPath), 'Missing /safescope-knowledge page.');
assert(fs.existsSync(reviewPath), 'Missing /safescope-knowledge/review page.');

const overview = fs.readFileSync(overviewPath, 'utf8');
const review = fs.readFileSync(reviewPath, 'utf8');
const combined = `${overview}\n${review}`.toLowerCase();

[
  'searchSafeScopeKnowledge',
  'listSafeScopeKnowledgeDocuments',
  'runSearch',
  'searchResult',
  'documentsLoading',
  'documentsError',
].forEach((token) => {
  assert(overview.includes(token), `Overview page no longer preserves ${token}.`);
});

[
  'fetchCandidates',
  'isBackendConnected',
  'NEXT_PUBLIC_SAFESCOPE_REVIEW_DEMO_FALLBACK',
  'currentUserRole',
  'userPlanTier',
  'setCandidates',
  'API_BASE_URL',
  'authHeaders',
].forEach((token) => {
  assert(review.includes(token), `Review page no longer preserves ${token}.`);
});

[
  'Draft',
  'Needs Review',
  'Approved',
  'Rejected',
  'Superseded',
  'Advisory Only',
  'Does not declare violations',
  'Does not create citations',
  'Requires qualified review',
  'Unapproved records do not affect active retrieval',
  'Governed Approval Queue',
  'Approve',
  'Needs More Info',
  'Reject',
  'Supersede',
  'simulated local UI state until backend persistence is wired',
].forEach((phrase) => {
  assert(combined.includes(phrase.toLowerCase()), `Missing P11 governance UI phrase: ${phrase}`);
});

[
  'citation issued',
  'violation issued',
  'guaranteed compliance',
  'no human review required',
  'compliant',
  'noncompliant',
].forEach((phrase) => {
  assert(!combined.includes(phrase), `Prohibited final-decision phrase found: ${phrase}`);
});

console.log('P11 UI Validation Successful!');
