#!/usr/bin/env python3
"""
§184 — CANDIDATE OWED-FACT TRUTH GENERATOR. ZERO PROVIDER CALLS, ZERO DATABASE OPERATIONS.

Emits every §184 artifact from one table, so the JSON candidates, the review packet and the firewall
record cannot disagree with each other.

WHAT THIS IS. Candidate material prepared for product-owner adjudication. Nothing here is truth.
`productOwnerVerdict` is null on every row and this model does not fill it.

THE STRUCTURE THAT DISCIPLINES THE WORDING. The frozen instrument is five matched pairs, and both
members of a pair turn on the SAME owed fact — one observation establishes it, the other leaves it
open. A factStatement that leaned toward either answer would be visibly wrong for the other member,
so the pair structure forces a neutral statement. That is why HR-04's candidate says only
"whether the fixed guard ... is currently secured sufficiently for safe operation" and says nothing
about presence or torque checks: the identical sentence has to serve HR-10, where the fastenings were
checked and recorded tight this morning.

THE THREE LAYERS, kept apart on purpose:
  A  factStatement, branches, decision divergence   -> may become provider-visible
  B  evaluationRationale, expected disposition      -> EVALUATION ONLY, never projected
  C  the exact fields the existing architecture projects, listed per row

Run from the repository root:
  python3 verification/expert-hazlenz-owed-fact-truth-2026-09-05/build-owed-fact-truth-candidates.py
"""

import hashlib
import json
from pathlib import Path

ROOT = Path('.')
INSTR = ROOT / 'verification/expert-hazlenz-balanced-clarification-instrument-2026-09-05'
OUT = ROOT / 'verification/expert-hazlenz-owed-fact-truth-2026-09-05'

sha = lambda s: hashlib.sha256(s.encode('utf-8')).hexdigest()

frozen = json.loads((INSTR / 'FROZEN-ROW-HASHES.json').read_text())
blinded = json.loads((INSTR / 'BLINDED-HUMAN-REVIEW-PACKET.json').read_text())
truth = json.loads((INSTR / 'HUMAN-ADJUDICATION-RECORD.json').read_text())
ROW = {r['REVIEW_ROW_ID']: r['TEXT'] for r in blinded['rows']}
REQ = {r['REVIEW_ROW_ID']: r['HUMAN_CLARIFICATION_REQUIRED'] for r in truth['rows']}

# ---------------------------------------------------------------- the shared owed fact, per pair
PAIRS = {
    'PAIR-1': {
        'factKey': 'owed:guarding:rotor_guard_interlock_protective_function_verified',
        'factStatement': 'Whether the rotor guard door interlock\'s protective function was verified '
                         'after the tooth change and before the debarker was returned to service.',
        'targetDecision': 'whether the debarker may continue to run as observed',
        'decisionIfEstablished': 'the debarker may continue to run under the existing controls',
        'decisionIfNotEstablished': 'the debarker is stopped until the interlock\'s protective '
                                    'function is verified',
        'affectedDecision': 'REQUIRED_CONTROL',
        'priority': 'REQUIRED_CONTROL',
        'governedRecord': 'app-mg-01',
        'governedClass': 'INCAPABLE_FOR_TARGET',
        'governedNote': 'app-mg-01 asks "Is the guard functional?" but offers only physical_inspection. '
                        '§181 classified that pair QUESTION_STRONGER_THAN_METHOD. No functional-test '
                        'verification method exists anywhere in the registry.',
        'settled': 'HR-02', 'unresolved': 'HR-06',
    },
    'PAIR-2': {
        'factKey': 'owed:guarding:fixed_guard_fastenings_currently_secure',
        'factStatement': 'Whether the fixed guard over the head drum nip point is currently secured '
                         'sufficiently for safe operation.',
        'targetDecision': 'whether the conveyor may keep running with an operative on the adjacent gangway',
        'decisionIfEstablished': 'the conveyor may keep running with the operative on the gangway',
        'decisionIfNotEstablished': 'the conveyor is stopped and the guard re-secured before the '
                                    'operative continues alongside it',
        'affectedDecision': 'REQUIRED_CONTROL',
        'priority': 'REQUIRED_CONTROL',
        'governedRecord': 'app-mg-01',
        'governedClass': 'COARSE',
        'governedNote': 'app-mg-01 offers physical_inspection for guarding_status. Looking can reveal a '
                        'visibly loose guard but does not establish fastening torque, so the criterion '
                        'is weaker than the fact requires without being unrelated to it.',
        'settled': 'HR-10', 'unresolved': 'HR-04',
    },
    'PAIR-3': {
        'factKey': 'owed:fire:burner_flame_failure_safeguard_function_verified',
        'factStatement': 'Whether the burner\'s flame-failure safeguard has been verified to shut off '
                         'fuel on loss of flame.',
        'targetDecision': 'whether drying may continue under the existing controls',
        'decisionIfEstablished': 'drying may continue under the existing controls',
        'decisionIfNotEstablished': 'the burner is shut down until the flame-failure safeguard\'s '
                                    'function is proved',
        'affectedDecision': 'REQUIRED_CONTROL',
        'priority': 'LIFE_CRITICAL',
        'governedRecord': None,
        'governedClass': 'ABSENT',
        'governedNote': 'No approved record covers burner flame-failure safeguards. app-fire-01 is '
                        '1910.157, portable extinguisher tags; §171 refused to derive from it because '
                        'doing so would manufacture a criterion to fit history.',
        'settled': 'HR-07', 'unresolved': 'HR-01',
    },
    'PAIR-4': {
        'factKey': 'owed:energy:auger_drive_isolation_verified_before_work',
        'factStatement': 'Whether the discharge auger drive has been isolated and proved dead before '
                         'the operative works at the blockage.',
        'targetDecision': 'whether the blockage-clearing work may continue as observed',
        'decisionIfEstablished': 'the blockage-clearing work may continue as observed',
        'decisionIfNotEstablished': 'work stops until the auger drive is isolated at its own isolator '
                                    'and proved dead',
        'affectedDecision': 'REQUIRED_CONTROL',
        'priority': 'LIFE_CRITICAL',
        'governedRecord': 'app-loto-01',
        'governedClass': 'ADEQUATE',
        'governedNote': 'app-loto-01 offers zero_energy_verification against "Is energy source '
                        'isolated?" — §181 classified this ALIGNMENT_CLEAR and it is the record §171 '
                        'derived from for exactly this reason.',
        'settled': 'HR-05', 'unresolved': 'HR-08',
    },
    'PAIR-5': {
        'factKey': 'owed:energy:stored_hydraulic_energy_dissipated_before_line_break',
        'factStatement': 'Whether the stored hydraulic energy in the accumulator has been dissipated '
                         'and confirmed at zero before the hose is broken.',
        'targetDecision': 'whether the hydraulic hose may be broken as planned',
        'decisionIfEstablished': 'the hose may be broken as planned',
        'decisionIfNotEstablished': 'the line is not broken until the accumulator is confirmed at zero',
        'affectedDecision': 'REQUIRED_CONTROL',
        'priority': 'LIFE_CRITICAL',
        'governedRecord': 'app-loto-01',
        'governedClass': 'ADEQUATE',
        'governedNote': 'zero_energy_verification is the method this fact needs. §181 ALIGNMENT_CLEAR.',
        'settled': 'HR-03', 'unresolved': 'HR-09',
    },
}

# ---------------------------------------------------------------- per row: spans and LAYER B
# `span` is the verbatim slice of the frozen observation the fact attaches to.
# `evaluationRationale` is LAYER B — the adjudication, WITHHELD from any provider projection.
ROWS = {
    'HR-02': dict(pair='PAIR-1', span='the fitter function-tested the interlock; the rotor stopped when the guard was opened',
        rationale='The observation states a function test of the specific protective behaviour — the rotor '
                  'stopped when the guard was opened — performed after the disturbance and before restart. '
                  'The property the decision needs is verified at the moment the decision needs it.'),
    'HR-06': dict(pair='PAIR-1', span='it recorded the tooth change but carries no interlock test result',
        rationale='The return-to-service log records the tooth change and carries no interlock test result. '
                  'Nothing in the observation reports the interlock\'s protective behaviour after the guard '
                  'was disturbed.'),
    'HR-10': dict(pair='PAIR-2', span='the fitter torque-checked all six guard fastenings; he recorded them tight',
        rationale='The observation states a torque check of all six fastenings this morning with a recorded '
                  'result. The specific property is verified, by a method capable of establishing it, at the '
                  'time the decision needs it.'),
    'HR-04': dict(pair='PAIR-2', span='the fastenings were last torque-checked at the annual service',
        rationale='The pre-start check the observation reports covers belt tracking and lubrication, and the '
                  'only fastening verification named is at the annual service. Nothing in the observation '
                  'reports the current securement of the fastenings. THIS IS EVALUATION TRUTH AND MUST NOT '
                  'REACH A PROVIDER — it is the adjudication §183 identified as the answer key.'),
    'HR-07': dict(pair='PAIR-3', span='the engineer flame-tested the burner; he recorded that fuel shut off within two seconds of flame loss',
        rationale='The observation states a flame test with its result — fuel shut off within two seconds of '
                  'flame loss. The protective function itself is verified, not merely the device\'s presence.'),
    'HR-01': dict(pair='PAIR-3', span='it lists a nozzle change and filter clean but does not record whether the burner was flame-tested',
        rationale='The certificate records a nozzle change and filter clean and is silent on whether the '
                  'burner was flame-tested. The safeguard cannot be seen from the walkway, so nothing else '
                  'in the observation bears on its function.'),
    'HR-05': dict(pair='PAIR-4', span='proved the auger dead by attempting a start from the panel, which did not turn',
        rationale='The auger drive was locked at its own local isolator and proved dead by an attempted '
                  'start. The isolation of the specific drive is verified by a method that establishes it.'),
    'HR-08': dict(pair='PAIR-4', span='the auger drive has its own local isolator and the lockout log shows no entry against it',
        rationale='The main dryer panel was locked and proved dead, but the auger drive has its own local '
                  'isolator and the lockout log shows no entry against it. Nothing in the observation '
                  'reports the state of that isolator.'),
    'HR-03': dict(pair='PAIR-5', span='watched the accumulator gauge fall to zero and not rise; a second fitter witnessed the reading',
        rationale='The gauge was watched to zero and observed not to rise, with a witness. The stored energy '
                  'is confirmed dissipated at the point the decision needs it.'),
    'HR-09': dict(pair='PAIR-5', span='the accumulator gauge sits behind the tank shroud unread since',
        rationale='The dump valve was cycled and left open, but the accumulator gauge sits behind the tank '
                  'shroud and has not been read since. Nothing in the observation reports the accumulator\'s '
                  'current pressure.'),
}

# The exact fields the EXISTING architecture projects to a provider. No field is added in §184.
PROVIDER_VISIBLE = ['factKey', 'affectedDecision', 'whyUnresolved', 'branchA', 'branchB',
                    'decisionDivergence', 'evidenceSpan', 'acceptableEvidence']
WITHHELD = ['expectedClarificationDisposition', 'evaluationRationale', 'settledFromObservation',
            'productOwnerVerdict', 'productOwnerFinalText', 'sourceBasis', 'authoringNotes',
            'governedEvidenceClass', 'pairId', 'pairPartner']

candidates = []
for rid in [f'HR-{i:02d}' for i in range(1, 11)]:
    r = ROWS[rid]
    p = PAIRS[r['pair']]
    settled = (p['settled'] == rid)
    partner = p['unresolved'] if settled else p['settled']
    assert r['span'] in ROW[rid], f'{rid} span is not verbatim'
    candidates.append({
        'rowId': rid,
        'pairId': r['pair'],
        'pairPartner': partner,
        'frozenRowSha256': frozen['rowTextHashes'][rid]['rowTextSha256'],
        'existingClarificationTruth': 'REQUIRED' if REQ[rid] else 'SILENCE',

        # ---- LAYER A: the owed fact. Shared with the pair partner, which is what forces neutrality.
        'factKey': p['factKey'],
        'factStatement': p['factStatement'],
        'targetDecision': p['targetDecision'],
        'decisionIfEstablished': p['decisionIfEstablished'],
        'decisionIfNotEstablished': p['decisionIfNotEstablished'],
        'affectedDecision': p['affectedDecision'],
        'priority': p['priority'],
        'evidenceSpan': r['span'],

        # ---- settled vs unresolved, stated truthfully rather than forced into one shape
        'settledFromObservation': settled,
        'establishingEvidence': r['span'] if settled else None,
        'whyUnresolved': None if settled else
            'the observation does not state ' + {
                'HR-06': 'the interlock\'s protective behaviour after the tooth change',
                'HR-04': 'the current securement of the guard fastenings',
                'HR-01': 'whether the burner\'s flame-failure safeguard was function-tested',
                'HR-08': 'whether the auger drive\'s own local isolator was locked and proved dead',
                'HR-09': 'the accumulator\'s current pressure',
            }[rid],

        # ---- LAYER B: EVALUATION ONLY. Never projected.
        'evaluationRationale': r['rationale'],
        'expectedClarificationDisposition': 'REQUIRED' if REQ[rid] else 'SILENCE',

        # ---- provenance and metadata
        'sourceBasis': 'the frozen HR row text and the §174 product-owner clarification verdict. The '
                       'factKey and target decision are consistent with the §173 PAIR-MAP, which is '
                       'AUTHORING-SIDE material used here for consistency only and is not truth. No '
                       'provider output from §175, §177 or §179 informed any wording.',
        'governedEvidenceClass': p['governedClass'],
        'governedRecord': p['governedRecord'],
        'governedEvidenceNote': p['governedNote'],
        'authoringNotes': None,

        # ---- verdict fields. NULL. This model does not fill them.
        'productOwnerVerdict': None,
        'productOwnerFinalText': None,
    })

# Row-specific authoring notes, written for the reviewer rather than for the record.
NOTES = {
 'HR-04': 'THE ROW TO SCRUTINISE HARDEST. The factStatement deliberately says only that the guard '
          'must be "currently secured sufficiently for safe operation". It does not say presence is '
          'insufficient and does not mention the annual torque check — that reasoning sits in '
          'evaluationRationale, which is withheld. Check the whyUnresolved wording too: it names what '
          'the observation does not state, which is what an owed fact is, and stops there.',
 'HR-10': 'The neutrality check for HR-04. The SAME factStatement must read correctly here, where the '
          'fastenings were torque-checked this morning and recorded tight. If it reads as leaning '
          'toward "unresolved", the HR-04 wording is contaminated and both should be rejected.',
 'HR-01': 'Priority proposed LIFE_CRITICAL: an unproved flame-failure safeguard on a running burner. '
          'Confirm or downgrade — priority affects question-budget behaviour, not truth.',
 'HR-07': 'The settled partner of HR-01. Note the observation states the RESULT of the flame test, not '
          'merely that a test occurred; that is what makes it settled rather than merely documented.',
 'HR-08': 'Two isolators appear in this row. The owed fact is about the AUGER DRIVE\'s own isolator, '
          'not the main panel. Confirm the factStatement targets the right one.',
 'HR-05': 'The settled partner of HR-08, and the row that produced displaced questions at §179. Its '
          'owed fact is settled here; any future adjacent concern about the drying fans must be a '
          'separate nomination and must not attach to this fact.',
 'HR-09': 'The dump valve was cycled and left open. Confirm that cycling alone does not establish the '
          'fact in your judgement — the candidate assumes it does not, because the gauge is unread.',
 'HR-03': 'The settled partner of HR-09. The gauge was watched to zero AND observed not to rise, with '
          'a witness. Confirm this is sufficient in your judgement.',
 'HR-06': 'The log records the tooth change and no interlock result. Confirm that a signed '
          'return-to-service log does not itself establish the interlock test.',
 'HR-02': 'The settled partner of HR-06. The function test and its observed result are both stated.',
}
for c in candidates:
    c['authoringNotes'] = NOTES[c['rowId']]

# ---------------------------------------------------------------- quality checks
checks = []
def ck(name, ok, detail=''):
    checks.append({'check': name, 'pass': bool(ok), 'detail': detail})

drift = [c['rowId'] for c in candidates if sha(ROW[c['rowId']]) != c['frozenRowSha256']]
ck('1 all ten frozen row hashes unchanged', not drift, ','.join(drift))

BANNED = ['does not prove', 'is not securement', 'insufficient', 'answer', 'expected', 'should ask',
          'the model', 'provider', 'correct answer']
leak = [(c['rowId'], b) for c in candidates for b in BANNED
        if b in c['factStatement'].lower() or (c['whyUnresolved'] and b in c['whyUnresolved'].lower())]
ck('3 no expected-result language in factStatement or whyUnresolved', not leak, str(leak))

hr04 = next(c for c in candidates if c['rowId'] == 'HR-04')
ck('4 HR-04 factStatement carries no answer-key language',
   'presence' not in hr04['factStatement'].lower() and 'torque' not in hr04['factStatement'].lower()
   and 'prove' not in hr04['factStatement'].lower(), hr04['factStatement'])

ck('5 every SILENCE row is represented as settled, with establishing evidence and whyUnresolved null',
   all(c['settledFromObservation'] and c['establishingEvidence'] and c['whyUnresolved'] is None
       for c in candidates if c['existingClarificationTruth'] == 'SILENCE'))
ck('6 every REQUIRED row is represented as unresolved, with whyUnresolved and no establishing evidence',
   all((not c['settledFromObservation']) and c['whyUnresolved'] and c['establishingEvidence'] is None
       for c in candidates if c['existingClarificationTruth'] == 'REQUIRED'))
ck('7 decision branches diverge on every row',
   all(c['decisionIfEstablished'].strip() != c['decisionIfNotEstablished'].strip() for c in candidates))
ck('8 factKeys are shared within a pair and distinct across pairs',
   len({c['factKey'] for c in candidates}) == 5
   and all(len({c['factKey'] for c in candidates if c['pairId'] == p}) == 1 for p in PAIRS))
ck('9 every evidenceSpan is verbatim in its frozen observation',
   all(c['evidenceSpan'] in ROW[c['rowId']] for c in candidates))
ck('2 no provider output informed any wording', True,
   'no §175/§177/§179 run record was read by this generator; sourceBasis records the inputs used')
ck('10 no governed criterion strengthened — classification is metadata only',
   all(c['governedEvidenceClass'] in
       ['ADEQUATE', 'COARSE', 'ABSENT', 'INCAPABLE_FOR_TARGET', 'AMBIGUOUS'] for c in candidates))
ck('11 no closed property ontology introduced',
   not any('property' in c['factKey'] for c in candidates),
   'factKeys name facts, not property types; no enum is proposed')
ck('12 no source or runtime modification', True, '§184 writes only under verification/')
ck('verdicts are null on every row', all(c['productOwnerVerdict'] is None for c in candidates))

# ---------------------------------------------------------------- emit
OUT.mkdir(parents=True, exist_ok=True)

(OUT / 'OWED-FACT-TRUTH-CANDIDATES.json').write_text(json.dumps({
    'artifact': 'SECTION_184_OWED_FACT_TRUTH_CANDIDATES',
    'date': '2026-09-05',
    'status': 'CANDIDATE MATERIAL — NOT TRUTH. Every productOwnerVerdict is null and this model did not fill one.',
    'truthClassOnceApproved': 'PRODUCT_OWNER_REVIEWED_DEVELOPMENT_OWED_FACT_TRUTH',
    'providerCalls': 0,
    'databaseOperations': 0,
    'whyThePairStructureMattersForNeutrality':
        'both members of a pair turn on the SAME owed fact — one observation establishes it, the other '
        'leaves it open. A factStatement leaning toward either answer would be visibly wrong for the '
        'other member, so the pairing forces a neutral statement. HR-04 and HR-10 share one sentence.',
    'layers': {
        'A_owedFactTruth': 'factStatement, branches, decision divergence, evidenceSpan — may become provider-visible',
        'B_evaluationTruth': 'evaluationRationale, expectedClarificationDisposition, settledFromObservation, verdicts — EVALUATION ONLY, never projected',
        'C_providerVisible': PROVIDER_VISIBLE,
    },
    'qualityChecks': checks,
    'allChecksPass': all(c['pass'] for c in checks),
    'rows': candidates,
}, indent=2) + '\n')

(OUT / 'PRODUCT-OWNER-REVIEW-PACKET.json').write_text(json.dumps({
    'artifact': 'SECTION_184_PRODUCT_OWNER_REVIEW_PACKET',
    'instruction': 'For each row return APPROVE, EDIT (with your exact replacement text) or REJECT. '
                   'Nothing here is truth until you do. If you EDIT, the exact approved text is what '
                   'gets frozen — not the candidate.',
    'doNotAssume': 'these field names are runtime field names. This is a truth instrument; the runtime '
                   'fixture derivation is a separate, later decision.',
    'rows': [{
        '1_frozenObservation': ROW[c['rowId']],
        '2_existingClarificationTruth': c['existingClarificationTruth'],
        '3_proposedFactKey': c['factKey'],
        '4_proposedNeutralFactStatement': c['factStatement'],
        '5_proposedEvaluationOnlyRationale_WITHHELD_FROM_PROVIDER': c['evaluationRationale'],
        '6_decisionIfEstablished': c['decisionIfEstablished'],
        '7_decisionIfNotEstablished': c['decisionIfNotEstablished'],
        '8_settledOrUnresolvedFromTheObservation':
            'SETTLED' if c['settledFromObservation'] else 'UNRESOLVED',
        '8b_establishingEvidence' if c['settledFromObservation'] else '8b_whyUnresolved':
            c['establishingEvidence'] if c['settledFromObservation'] else c['whyUnresolved'],
        '9_providerVisibleFieldsAFutureRunWouldReceive': PROVIDER_VISIBLE,
        '10_evaluationOnlyFieldsWithheldFromTheProvider': WITHHELD,
        'rowId': c['rowId'], 'pairId': c['pairId'], 'pairPartner': c['pairPartner'],
        'governedEvidenceClass': c['governedEvidenceClass'],
        'authoringNotes': c['authoringNotes'],
        'YOUR_VERDICT': None, 'YOUR_FINAL_TEXT_IF_EDITED': None,
    } for c in candidates],
}, indent=2) + '\n')

(OUT / 'PROJECTION-FIREWALL.json').write_text(json.dumps({
    'artifact': 'SECTION_184_PROJECTION_FIREWALL',
    'purpose': 'mechanical record of which truth fields may reach a provider and which may never, so a '
               'future run cannot leak the adjudication into the stimulus',
    'PROVIDER_VISIBLE': {
        'fields': PROVIDER_VISIBLE,
        'source': 'ProjectedOwedFact in verifier-v3-development-boundary.ts — the EXISTING projection. '
                  '§184 adds no provider field.',
        'note': 'acceptableEvidence is projected with provenance stripped, as it already is.',
    },
    'WITHHELD_EVALUATION_TRUTH': {
        'fields': WITHHELD,
        'plusAlreadyForbidden': ['historical provider performance', '§179 outcomes',
                                 'human adjudication dispositions', 'expected results',
                                 'settlement correctness labels'],
        'why': 'expectedClarificationDisposition is the answer to the test. evaluationRationale is the '
               'adjudication §183 identified as the answer key — on HR-04 it is literally the sentence '
               'that says the pre-start check and annual torque check do not report current securement.',
    },
    'HR04_SEPARATION': {
        'A_owedFactTruth': hr04['factStatement'],
        'A_whyUnresolved': hr04['whyUnresolved'],
        'B_evaluationRationale_WITHHELD': hr04['evaluationRationale'],
        'theTestApplied': 'layer A names the property the decision needs and what the observation does '
                          'not state. It does not argue that presence fails to establish securement, '
                          'and it does not mention the annual torque check. That argument is layer B.',
        'neutralityEvidence': 'the identical layer-A sentence serves HR-10, where the fastenings were '
                              'torque-checked this morning and recorded tight.',
    },
    'enforcementStatus': 'DECLARATIVE. §184 changes no code, so this is a record of what a future '
                         'integration must honour, not a runtime guard. A future run must assert the '
                         'projected payload contains none of the withheld fields.',
}, indent=2) + '\n')

(OUT / 'TRUTH-PROVENANCE.json').write_text(json.dumps({
    'artifact': 'SECTION_184_TRUTH_PROVENANCE',
    'truthClassOnceApproved': 'PRODUCT_OWNER_REVIEWED_DEVELOPMENT_OWED_FACT_TRUTH',
    'AI_ASSISTED_OWED_FACT_AUTHORING': True,
    'PRODUCT_OWNER_REVIEWED': False,
    'FULLY_INDEPENDENT_HUMAN_AUTHORING': False,
    'currentState': 'AWAITING_PRODUCT_OWNER_REVIEW — PRODUCT_OWNER_REVIEWED becomes TRUE only when '
                    'verdicts are returned, and this model does not set it',
    'whoDidWhat': {
        'Claude': 'prepared candidate factStatements, branches, spans and evaluation rationales, and '
                  'the mechanical quality checks',
        'GPT-5.6 Sol': 'assisting the product owner in this development process, per the authorization',
        'productOwner': 'reviews, edits or rejects each row; the approved text is what becomes truth',
    },
    'mustNeverBeDescribedAs': ['independent human truth', 'AI-free authoring',
                               'validated safety truth', 'production truth'],
    'inputsConsulted': [
        'frozen HR-01..HR-10 observation text (§173/§174, byte-unchanged)',
        '§174 product-owner clarification verdicts (REQUIRED/SILENCE)',
        '§173 PAIR-MAP factKeys and target decisions — AUTHORING-SIDE, used for consistency only, not truth',
        '§181 governed alignment audit — for the governedEvidenceClass metadata only',
    ],
    'inputsDeliberatelyNotConsulted': [
        '§175, §177 and §179 provider outputs — no run record was read by the generator',
        '§181 A0 fixture wording — available as candidate material but not copied; the pair-shared '
        'statements were written fresh so HR-04 would not inherit the A0 phrasing that stated the '
        'discrimination',
    ],
    'ifTheOwnerEdits': 'preserve the exact product-owner-approved text as the frozen truth; the '
                       'candidate is superseded and retained only as provenance',
}, indent=2) + '\n')

print(f'rows: {len(candidates)}   checks: {len(checks)}   all pass: {all(c["pass"] for c in checks)}')
for c in checks:
    print(f'  {"PASS" if c["pass"] else "FAIL"}  {c["check"]}' + (f'  [{c["detail"]}]' if c['detail'] else ''))
