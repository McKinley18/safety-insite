/**
 * KG-3F Phase 15 — real-Chromium verification of the Standard Detail panel.
 *
 * WHAT THIS ADDS OVER KG-3C. KG-3C verified the CONTENT GOVERNANCE axis (approved / unapproved /
 * citation-only) and could not verify anything else: with 0 of 26 records approved, the approved
 * cell was unreachable, and no predicate returned UNKNOWN, so "does the verified badge imply the
 * rule applies?" could not be asked, let alone answered.
 *
 * KG-3F makes it answerable. The fixtures put a real record in the approved state AND make the
 * corrected 56.14132 predicate return UNKNOWN, which produces the one genuinely dangerous cell:
 *
 *     approved regulatory TEXT  x  unestablished APPLICABILITY
 *
 * Here the card shows "Verified standard text" beside a rule HazLenz has NOT established applies.
 * If a reader takes the badge as confirmation of applicability, the product asserts a violation the
 * evidence does not support — the precise overreach Phases 5-7 removed from the engine. The badge
 * must therefore be visibly about the TEXT, and the applicability line must remain independently
 * uncertain in the same card, in every theme and viewport.
 *
 * The inverse error is also tested: an UNKNOWN applicability result must NOT be dressed as a corpus
 * failure. "We can't show you verified text" and "we can't establish that this rule applies" are
 * different statements with different remedies, and conflating them would make a correct predicate
 * look like a broken corpus — creating pressure to re-weaken the predicate.
 *
 * Usage:
 *   API_BASE_URL=… APP_BASE_URL=… OSHA_EMAIL=… OSHA_INSPECTION_ID=… MSHA_EMAIL=… \
 *   MSHA_INSPECTION_ID=… FIXTURE_PASSWORD=… SHOT_DIR=… node kg3f-standard-detail-contract.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4320';
const APP = process.env.APP_BASE_URL || 'http://127.0.0.1:3320';
const OUT = process.env.SHOT_DIR;
const PASSWORD = process.env.FIXTURE_PASSWORD || 'KG3fBrowser!Pass123';

fs.mkdirSync(OUT, { recursive: true });

const VERIFIED_BADGE = 'Verified standard text';
const UNAVAILABLE_NOTICE = 'Verified standard text is not currently available for this citation.';
const SOURCE_REVIEW_CAVEAT = 'has not completed source review';

/**
 * Internal governance vocabulary that must never reach a customer surface. A leak here is not
 * cosmetic: these terms name the approval machinery, and showing them invites a reader to treat an
 * internal review state as a legal conclusion.
 */
const FORBIDDEN = ['starter-unverified', 'reviewer_approved', 'recordChecksum', 'corpusBacked',
  'backingStatus', 'UNAPPROVED_CONTENT', 'CITATION_ONLY', 'APPROVED_GOVERNED_CONTENT',
  'effectiveReviewState', 'releaseId', 'mechanically_validated', 'approvalDigest',
  'substantiveContentDigest', 'sourceIdentityDigest'];

/**
 * The five states, keyed by the citation the Standard Detail panel shows.
 *
 * `content` is the governance axis; `applicability` is what the ENGINE measured (recorded by the
 * fixtures). They are declared separately here because the whole point of the phase is that they
 * are separately determined — a table that derived one from the other would encode the very
 * conflation under test.
 */
const STATES = [
  { key: 's1-approved-direct', inspection: 'osha', citation: '29 CFR 1926.501',
    content: 'APPROVED_GOVERNED_CONTENT', applicability: 'direct',
    scenario: '1. approved content + high applicability confidence' },
  { key: 's3-unapproved-strong', inspection: 'osha', citation: '29 CFR 1926.34(a)',
    content: 'UNAPPROVED_CONTENT', applicability: 'candidate',
    scenario: '3. unapproved content + strong applicability evidence' },
  { key: 's4-citation-only', inspection: 'msha', citation: '30 CFR 56.14132(b)(1)',
    content: 'CITATION_ONLY', applicability: 'direct',
    scenario: '4. citation-only — exact paragraph earned, corpus holds only the section' },
  /**
   * SCENARIOS 2 AND 5 ARE THE SAME CELL, and this is that cell.
   *
   * Scenario 2 asks for "approved content + low/uncertain applicability confidence". The first
   * fixture attempt targeted `29 CFR 1926.451(g)(1)`, which the engine does produce as an approved
   * candidate with `applicability: 'candidate'` — but only ever as an ADDITIONAL standard. The
   * Standard Detail panel renders the PRIMARY standard, so that citation is never the subject of
   * this card and the state was unreachable there. That is correct product behavior, not a gap.
   *
   * The corrected 56.14132 IS the same cell as a primary: approved section text, with the
   * obstructed-view trigger unestablished. It is also the more demanding instance, because the
   * consequence of misreading the badge here is asserting an MSHA violation. Verifying scenario 2
   * on this record tests the identical claim under strictly harder conditions.
   */
  { key: 's5-56-14132-corrected', inspection: 'msha', citation: '30 CFR 56.14132',
    content: 'APPROVED_GOVERNED_CONTENT', applicability: 'candidate',
    scenario: '2+5. approved TEXT + UNESTABLISHED applicability (corrected 56.14132)' },
];

const VIEWS = [
  { name: 'light',       theme: 'light', width: 1440, height: 1000, mobile: false },
  { name: 'dark',        theme: 'dark',  width: 1440, height: 1000, mobile: false },
  { name: 'mobile',      theme: 'light', width: 390,  height: 844,  mobile: true  },
  { name: 'mobile-dark', theme: 'dark',  width: 390,  height: 844,  mobile: true  },
];

const FIXTURES = {
  osha: { email: process.env.OSHA_EMAIL, inspectionId: process.env.OSHA_INSPECTION_ID },
  msha: { email: process.env.MSHA_EMAIL, inspectionId: process.env.MSHA_INSPECTION_ID },
};

/**
 * Reads the Standard Detail card as STRUCTURE rather than as flattened text.
 *
 * The first version regex'd `Confidence:\s*(.*)` out of `innerText` with whitespace collapsed, so
 * the captured "label" ran on through every following paragraph — the source-review caveat and the
 * evidence-gap list all became part of the confidence value, and assertions about the applicability
 * label were meaningless. Reading the specific nodes keeps the two axes separable in the harness,
 * which is the property the harness exists to check in the product.
 */
async function readCard(page) {
  return page.evaluate(() => {
    const card = document.querySelector('.guided-standard-card');
    if (!card) return null;
    // The citation lives in its own span inside the heading button; the sibling span is the title.
    const heading = card.querySelector('button span span');
    const citation = heading ? heading.textContent.trim() : '';
    // <p class="mt-3"><strong>Confidence:</strong> label</p>
    const confidenceP = Array.from(card.querySelectorAll('p')).find(p => {
      const strong = p.querySelector('strong');
      return strong && strong.textContent.trim() === 'Confidence:';
    });
    const confidenceLabel = confidenceP
      ? Array.from(confidenceP.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join(' ').trim()
      : '';
    const badgeEl = Array.from(card.querySelectorAll('span'))
      .find(s => s.textContent.trim() === 'Verified standard text');
    const noticeEl = Array.from(card.querySelectorAll('p'))
      .find(p => p.textContent.includes('not currently available for this citation'));
    const caveatEl = Array.from(card.querySelectorAll('p'))
      .find(p => p.textContent.includes('has not completed source review'));
    const headings = Array.from(card.querySelectorAll('h4')).map(h => h.textContent.trim());
    return {
      citation,
      confidenceLabel,
      hasBadge: !!badgeEl,
      hasNotice: !!noticeEl,
      hasSourceCaveat: !!caveatEl,
      hasSummaryLabel: card.innerText.toUpperCase().includes('HAZLENZ STANDARD SUMMARY'),
      hasEvidenceGaps: headings.some(h => /Details that would increase confidence/i.test(h)),
      text: card.innerText.replace(/\s+/g, ' ').trim(),
    };
  });
}

async function login(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  }).then(r => r.json());
  if (!res.token) throw new Error(`login failed for ${email}: ${JSON.stringify(res).slice(0, 200)}`);
  return res;
}

const sessions = {
  osha: await login(FIXTURES.osha.email),
  msha: await login(FIXTURES.msha.email),
};

const results = [];
const failures = [];
const browser = await chromium.launch();
console.log('Chromium', browser.version());

for (const view of VIEWS) {
  console.log(`\n=== view=${view.name} (${view.width}x${view.height}) ===`);

  for (const which of ['osha', 'msha']) {
    const states = STATES.filter(s => s.inspection === which);
    if (!states.length) continue;

    const ctx = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 2, isMobile: view.mobile, hasTouch: view.mobile,
      colorScheme: view.theme,
    });
    const page = await ctx.newPage();
    await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(([token, refresh, user, inspectionId, theme]) => {
      localStorage.setItem('sentinel_auth_token', token);
      localStorage.setItem('sentinel_auth_refresh_token', refresh);
      localStorage.setItem('sentinel_auth_user', JSON.stringify(user));
      localStorage.setItem('sentinel_selected_inspection_context',
        JSON.stringify({ persistedInspectionId: inspectionId }));
      localStorage.setItem('safety_insite_theme', theme);
    }, [sessions[which].token, sessions[which].refreshToken, sessions[which].user,
      FIXTURES[which].inspectionId, view.theme]);

    await page.goto(`${APP}/inspection-workspace`, { waitUntil: 'networkidle' });
    await page.waitForSelector('article', { timeout: 45000 });
    await page.waitForTimeout(1200);

    const findingCount = await page.evaluate(() => document.querySelectorAll('article').length);

    for (const state of states) {
      // Walk every finding and stop at the one whose Standard Detail names EXACTLY this citation.
      //
      // Matching on the rendered citation rather than on a hazard label keeps the harness correct
      // when the engine reassigns a hazard family — which is exactly what KG-3F changed for
      // 56.14132. But it must be an EXACT match against the citation heading, not a substring of
      // the card text: "30 CFR 56.14132" is a prefix of "30 CFR 56.14132(b)(1)", so a substring
      // search finds the paragraph card when looking for the section and silently verifies the
      // wrong state. That is the same parent/child collapse the KG-3E structured citation
      // comparison exists to prevent, reappearing in the test harness.
      let card = null, cardData = null, found = false;
      for (let i = 0; i < findingCount; i++) {
        const article = page.locator('article').nth(i);
        const reviewBtn = article.getByRole('button',
          { name: /Review this finding|Reviewing this finding/ });
        if (!(await reviewBtn.count())) continue;
        await reviewBtn.first().scrollIntoViewIfNeeded();
        await reviewBtn.first().click();
        await page.waitForTimeout(900);

        const candidate = page.locator('.guided-standard-card').first();
        if (!(await candidate.count())) continue;
        const data = await readCard(page);
        if (data && data.citation === state.citation) {
          card = candidate; cardData = data; found = true; break;
        }
      }

      const checks = [];
      const check = (name, ok, detail = '') => {
        checks.push({ name, ok, detail });
        if (!ok) failures.push(`[${view.name}/${state.key}] ${name} ${detail}`);
      };

      check('standard detail reachable for the citation', found,
        `no card showed "${state.citation}"`);
      if (!found) {
        results.push({ view: view.name, state: state.key, found: false, checks });
        continue;
      }

      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const pageText = await page.evaluate(() => document.body.innerText);
      const cardText = cardData.text;
      const {
        hasNotice, hasBadge, hasSourceCaveat, hasSummaryLabel, hasEvidenceGaps, confidenceLabel,
      } = cardData;

      // ---- CONTENT GOVERNANCE AXIS (KG-3C regression) ----------------------------------------
      check('citation heading names exactly this citation', cardData.citation === state.citation,
        `heading was "${cardData.citation}"`);
      if (state.content === 'APPROVED_GOVERNED_CONTENT') {
        check('verified badge shown', hasBadge);
        check('no unavailable notice', !hasNotice);
        // KG-3D: the badge and the source-review caveat are two computations of one fact and must
        // never both appear. KG-3C flagged this and could not reproduce it.
        check('no contradictory source-review caveat beside the badge', !hasSourceCaveat);
      } else if (state.content === 'UNAPPROVED_CONTENT') {
        check('no verified badge', !hasBadge);
        check('no unavailable notice', !hasNotice);
        check('summary shown under its honest label', hasSummaryLabel);
      } else {
        check('no verified-text claim', !hasBadge || hasNotice);
        check('unavailable notice shown', hasNotice);
        check('no fabricated body text', !hasSummaryLabel);
      }

      // ---- APPLICABILITY AXIS, AND ITS INDEPENDENCE ------------------------------------------
      check('an applicability confidence is stated', confidenceLabel.length > 0,
        `parsed "${confidenceLabel}"`);

      if (state.applicability === 'candidate') {
        // The card must not present this as a settled application of the rule.
        check('applicability is NOT presented as established',
          !/^\s*(direct|high|confirmed)\b/i.test(confidenceLabel),
          `confidence label was "${confidenceLabel}"`);
      }

      // THE CENTRAL PHASE-15 ASSERTION. Approved text + unestablished applicability: the badge is
      // present, and the card must still not claim the rule applies.
      if (state.content === 'APPROVED_GOVERNED_CONTENT' && state.applicability === 'candidate') {
        check('APPROVED TEXT DOES NOT IMPLY APPLICABILITY: badge present but applicability still '
          + 'qualified', hasBadge && !/^\s*(direct|high|confirmed)\b/i.test(confidenceLabel),
          `badge=${hasBadge} confidence="${confidenceLabel}"`);
        // An unestablished trigger is an evidence gap, and the card should say what would close it
        // rather than leaving the reader to infer the rule applies.
        check('the evidence gap is disclosed rather than left implicit', hasEvidenceGaps);
        // And it must not be dressed up as a corpus/content failure.
        check('UNKNOWN applicability is NOT presented as a corpus failure', !hasNotice);
      }

      // The inverse: citation-only is a CONTENT gap and must not be reported as low applicability.
      if (state.content === 'CITATION_ONLY') {
        check('content gap is stated as a content gap, not as an applicability failure', hasNotice);
      }

      // ---- vocabulary + layout ----------------------------------------------------------------
      for (const term of FORBIDDEN) {
        check(`no internal term "${term}" on page`, !pageText.includes(term));
      }
      const overflow = await page.evaluate(() => ({
        docScrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }));
      check('no horizontal page overflow', overflow.docScrollW <= overflow.innerW + 1,
        JSON.stringify(overflow));
      const box = await card.boundingBox();
      check('standard card has non-zero size', !!box && box.width > 50 && box.height > 30,
        JSON.stringify(box));

      const styles = await page.evaluate(() => {
        const c = document.querySelector('.guided-standard-card');
        if (!c) return null;
        const badge = Array.from(c.querySelectorAll('span'))
          .find(s => s.textContent.trim() === 'Verified standard text');
        const notice = Array.from(c.querySelectorAll('p'))
          .find(p => p.textContent.includes('not currently available for this citation'));
        const read = el => {
          if (!el) return null;
          const cs = getComputedStyle(el);
          return { color: cs.color, background: cs.backgroundColor, fontSize: cs.fontSize };
        };
        const cs = getComputedStyle(c);
        return { badge: read(badge), notice: read(notice),
          card: { background: cs.backgroundColor, color: cs.color } };
      });

      await card.screenshot({ path: path.join(OUT, `${state.key}-${view.name}.png`) });
      await page.screenshot({ path: path.join(OUT, `${state.key}-${view.name}-context.png`) });

      const ok = checks.every(c => c.ok);
      results.push({
        view: view.name, state: state.key, scenario: state.scenario,
        expectedContent: state.content, expectedApplicability: state.applicability,
        hasBadge, hasNotice, hasSourceCaveat, confidenceLabel, hasEvidenceGaps,
        styles, overflow, cardText: cardText.slice(0, 500), checks,
      });
      console.log(`  ${state.key.padEnd(24)} badge=${String(hasBadge).padEnd(5)} `
        + `notice=${String(hasNotice).padEnd(5)} confidence="${confidenceLabel}" `
        + `gaps=${String(hasEvidenceGaps).padEnd(5)} ${ok ? 'OK' : 'FAILED'}`);
    }
    await ctx.close();
  }
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'kg3f-browser-verification-results.json'),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    views: VIEWS.map(v => v.name), states: STATES,
    totalChecks: results.reduce((n, r) => n + r.checks.length, 0),
    failures, results,
  }, null, 2));

const total = results.reduce((n, r) => n + r.checks.length, 0);
console.log(`\n${failures.length === 0
  ? `ALL STANDARD-DETAIL CONTRACT CHECKS PASSED (${total}/${total})`
  : `FAILURES (${failures.length}/${total}):\n` + failures.join('\n')}`);
process.exitCode = failures.length === 0 ? 0 : 1;
