/*
 * PHASE 16 -- SYNTHETIC SCORER VALIDATION BOUND TO THE RUN-2 HOLDOUT.
 *
 * Re-runs the Amendment-3 suite against the FROZEN RUN-2 CONFIGURATION: the unmodified original
 * scorer ea5e50ae... called through the v2 validity layer b9a0a6bc..., over the 93-row Run-2
 * holdout f887cfd1...
 *
 * Every fixture is synthesized from rowIds and FROZEN GATE FLAGS ONLY, so each expected outcome
 * is known BY CONSTRUCTION. NO PROVIDER CALL. NO INFERENCE. NO RUN-2 SEMANTIC EVALUATION --
 * no observation value is read anywhere in this file.
 */
'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const ROOT=path.join(__dirname,'..','..','..');
const A2=path.join(ROOT,'verification','hazlenz-l3-acceptance-holdout-attempt2-2026-08-24');
const sha=(p)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const FROZEN=path.join(A2,'scorer','acceptance-scorer.js');
const V2=path.join(__dirname,'acceptance-scorer-v2.frozen-copy.js');
const HOLD=path.join(__dirname,'..','holdout','holdout-l3-acceptance-run2.json');

const frozen=require(FROZEN);
const { scoreAcceptanceV2 }=require(V2);
const holdout=JSON.parse(fs.readFileSync(HOLD,'utf8'));
const rows=holdout.rows;

let pass=0,fail=0; const out=[]; const p=(s)=>out.push(s===undefined?'':s);
const T=(n,c,d)=>{c?pass++:fail++;p('  '+(c?'PASS':'FAIL').padEnd(6)+' '+n+(d!==undefined?'   '+d:''));};

p('L3 RUN-2 ACCEPTANCE -- SYNTHETIC SCORER VALIDATION AGAINST THE FROZEN RUN-2 CONFIGURATION');
p('');
p('=== FROZEN IDENTITIES ===');
T('original scorer ea5e50ae, byte-unchanged', sha(FROZEN)==='ea5e50aea265370c9de72245c1c34075b44f0c3f2c8c91303c2f5eb92097d0b6');
T('v2 validity layer b9a0a6bc, byte-identical to the amendment original', sha(V2)==='b9a0a6bc9caebbc6218f3646276fcacdab598eca49a357711fa0d8ec054f1100');
T('Run-2 holdout f887cfd1', sha(HOLD)==='f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f');
T('Run-2 holdout carries 93 rows', rows.length===93);
p('');

const perfect=()=>rows.map(r=>({
  rowId:r.rowId, providerEvaluated:true, schemaValid:true, retries:0,
  candidates:[{candidateKey:'c1',hazardFamily:'falls',conditionState:'INSUFFICIENT_EVIDENCE'}],
  raisedClarification:r.expect.clarificationExpected===true,
  assertedState:'INSUFFICIENT_EVIDENCE', nonRetryableValidationReasons:[],
  safetyConsequentialRejection:false, decisionBoundaryCodes:[]}));
const clone=(x)=>JSON.parse(JSON.stringify(x));
const at=(rs,id)=>rs.find(x=>x.rowId===id);
const firstWith=(pred)=>rows.find(pred).rowId;

p('=== 1. COMPLETE VALID ALL-PASS PRESERVES THE ORIGINAL SCORER OUTCOME ===');
{
  const A=perfect(),B=perfect();
  const f=frozen.scoreAcceptance(holdout,A,B), v=scoreAcceptanceV2(holdout,A,B);
  T('original scorer all-pass baseline is a PASS', f.pass===true, f.terminal);
  T('v2 pass identical to original', v.pass===f.pass);
  T('v2 terminal identical to original', v.terminal===f.terminal, v.terminal);
  T('v2 gates byte-identical to original', JSON.stringify(v.gates)===JSON.stringify(f.gates));
  T('v2 byProvenance identical', JSON.stringify(v.byProvenance)===JSON.stringify(f.byProvenance));
  T('gate arithmetic AUTHORITATIVE on a complete run', v.gateArithmeticAuthoritative===true);
  T('modelAcceptanceResult ESTABLISHED_PASS', v.modelAcceptanceResult==='ESTABLISHED_PASS');
}
p('');
p('=== 2. EVERY COMPLETE G1..G10 FAILURE REMAINS EQUIVALENT ===');
const breakers={
  G1:(A)=>{at(A,firstWith(r=>r.expect.highConsequence===true)).candidates=[];},
  G2:(A)=>{at(A,firstWith(r=>r.expect.clarificationExpected!==true)).raisedClarification=true;},
  G3:(A)=>{at(A,firstWith(r=>r.expect.clarificationExpected===true)).raisedClarification=false;},
  G4:(A)=>{at(A,firstWith(r=>r.expect.inG4Denominator===true)).assertedState='ACTIVE';},
  G5:(A)=>{at(A,rows[0].rowId).safetyConsequentialRejection=true;},
  G6:(A)=>{at(A,rows[0].rowId).nonRetryableValidationReasons=['EVIDENCE_TEXT_MISMATCH'];},
  G7:(A)=>{at(A,firstWith(r=>r.expect.inG7Pole===true)).raisedClarification=true;},
  G8:(A)=>{at(A,rows[0].rowId).decisionBoundaryCodes=['INVALID_CLARIFICATION_DEPENDENCY'];},
  G9:(A,B)=>{at(B,rows[0].rowId).assertedState='ACTIVE';},
  G10:(A)=>{rows.slice(0,3).forEach(r=>{at(A,r.rowId).schemaValid=false;});},
};
Object.keys(breakers).forEach(gate=>{
  const A=clone(perfect()),B=clone(perfect());
  breakers[gate](A,B);
  const f=frozen.scoreAcceptance(holdout,A,B), v=scoreAcceptanceV2(holdout,A,B);
  const same=JSON.stringify(v.gates)===JSON.stringify(f.gates)&&v.pass===f.pass&&v.terminal===f.terminal;
  T(gate+' failure preserved and v2 identical to the original scorer',
    f.failedGates.indexOf(gate)>=0&&v.failedGates.indexOf(gate)>=0&&same&&v.pass===false, v.terminal);
  T(gate+' modelAcceptanceResult ESTABLISHED_FAIL', v.modelAcceptanceResult==='ESTABLISHED_FAIL');
});
p('');
p('=== 3. INCOMPLETE PROVIDER EVALUATION -> NOT_SCORABLE ===');
{
  const A=clone(perfect()),B=clone(perfect());
  const vic=at(A,rows[11].rowId);
  vic.providerEvaluated=false; vic.schemaValid=false; vic.candidates=[]; vic.raisedClarification=false; vic.assertedState=null;
  const f=frozen.scoreAcceptance(holdout,A,B), v=scoreAcceptanceV2(holdout,A,B);
  T('the original scorer alone would still report scorable = true', f.scorable===true);
  T('ONE missing provider evaluation is sufficient: scorable = false', v.scorable===false);
  T('raises INCOMPLETE_PROVIDER_EVALUATION', v.invalidReasons.indexOf('INCOMPLETE_PROVIDER_EVALUATION')>=0);
  T('EXPECTED_ROWS 93, PROVIDER_EVALUATED_ROWS 92', v.providerEvaluation.EXPECTED_ROWS===93&&v.providerEvaluation.PROVIDER_EVALUATED_ROWS===92);
  T('terminal NOT_SCORABLE', v.terminal.indexOf('NOT_SCORABLE')>=0, v.terminal);
  T('modelAcceptanceResult NOT_ESTABLISHED', v.modelAcceptanceResult==='NOT_ESTABLISHED');
}
{
  const A=clone(perfect()),B=clone(perfect());
  A.slice(40).forEach(r=>{r.providerEvaluated=false;r.schemaValid=false;r.candidates=[];r.raisedClarification=false;r.assertedState=null;});
  const v=scoreAcceptanceV2(holdout,A,B);
  T('MANY missing provider evaluations: scorable = false', v.scorable===false);
  T('PROVIDER_EVALUATED_ROWS = 40 of 93', v.providerEvaluation.PROVIDER_EVALUATED_ROWS===40);
  T('notEvaluatedRowIds = 53', v.providerEvaluation.notEvaluatedRowIds.length===53);
}
p('');
p('=== 4. MALFORMED / REFUSAL COUNT AS PROVIDER-EVALUATED WHERE FROZEN ===');
{
  const v2mod=require(V2);
  T('MALFORMED_STRUCTURED_OUTPUT is an EVALUATED kind', v2mod.EVALUATED_FAILURE_KINDS.indexOf('MALFORMED_STRUCTURED_OUTPUT')>=0);
  T('PROVIDER_REFUSAL is an EVALUATED kind', v2mod.EVALUATED_FAILURE_KINDS.indexOf('PROVIDER_REFUSAL')>=0);
  T('TIMEOUT / UNAVAILABLE / TRANSIENT / PERMANENT are NOT evaluated',
    ['TIMEOUT','UNAVAILABLE','TRANSIENT_ERROR','PERMANENT_CONFIGURATION_ERROR'].every(k=>v2mod.NOT_EVALUATED_FAILURE_KINDS.indexOf(k)>=0));
  // a malformed answer stays MEASURABLE: it is evaluated, so it can still fail G10.
  const A=clone(perfect()),B=clone(perfect());
  rows.slice(0,3).forEach(r=>{const x=at(A,r.rowId); x.providerEvaluated=true; x.schemaValid=false;});
  const v=scoreAcceptanceV2(holdout,A,B);
  T('a malformed-but-evaluated answer keeps the run SCORABLE', v.scorable===true);
  T('and it still fails G10 -- G10 keeps its teeth', v.failedGates.indexOf('G10')>=0, 'rate '+(v.gates.find(g=>g.name==='G10').rate*100).toFixed(1)+'%');
}
p('');
p('=== 5. PROVIDER-ERROR PLACEHOLDERS CANNOT CREATE SUBSTANTIVE PASS OR FAIL ===');
{
  const ph=rows.map(r=>({rowId:r.rowId,providerEvaluated:false,schemaValid:false,retries:0,candidates:[],
    raisedClarification:false,assertedState:null,nonRetryableValidationReasons:[],
    safetyConsequentialRejection:false,decisionBoundaryCodes:[]}));
  const f=frozen.scoreAcceptance(holdout,ph,ph), v=scoreAcceptanceV2(holdout,ph,ph);
  const hz=['G4','G5','G6','G7','G8'];
  T('the original scorer alone awards vacuous hard-zero PASSES', hz.every(n=>f.gates.find(g=>g.name===n).pass));
  T('v2 refuses: scorable = false', v.scorable===false);
  T('no substantive PASS is reachable', v.pass===false);
  T('no substantive FAIL is claimed either', v.modelAcceptanceResult==='NOT_ESTABLISHED');
  T('arithmetic marked NON-AUTHORITATIVE', v.gateArithmeticAuthoritative===false);
  T('terminal is NOT_SCORABLE, not FAILED and not PASSED',
    v.terminal.indexOf('NOT_SCORABLE')>=0&&v.terminal.indexOf('L3_ACCEPTANCE_FAILED')<0&&v.terminal.indexOf('PASSED')<0, v.terminal);
}
p('');
p('=== 6. HOLDOUT_SPENT IS INDEPENDENT OF SCORABILITY ===');
{
  const A=clone(perfect()); A.slice(1).forEach(r=>{r.providerEvaluated=false;});
  const v=scoreAcceptanceV2(holdout,A,clone(perfect()));
  T('the v2 result object carries NO spend field', JSON.stringify(v).match(/"[^"]*spent[^"]*"/i)===null);
  T('SCORABLE=false coexists with RUN2_HOLDOUT_SPENT held elsewhere', v.scorable===false);
}
p('');
p('=== 7. INCOMPLETE CAN NEVER PASS -- EXHAUSTIVE OVER ALL 93 ROWS, BOTH PROCESSES ===');
{
  let everA=false,everB=false;
  for(let k=0;k<rows.length;k++){
    const A=clone(perfect()),B=clone(perfect()); A[k].providerEvaluated=false;
    if(scoreAcceptanceV2(holdout,A,B).pass===true) everA=true;
  }
  for(let k=0;k<rows.length;k++){
    const A=clone(perfect()),B=clone(perfect()); B[k].providerEvaluated=false;
    if(scoreAcceptanceV2(holdout,A,B).pass===true) everB=true;
  }
  T('no single withheld process-A evaluation yields pass (93 cases)', !everA);
  T('no single withheld process-B evaluation yields pass (93 cases)', !everB);
  const U=clone(perfect()); delete U[5].providerEvaluated;
  const vU=scoreAcceptanceV2(holdout,U,clone(perfect()));
  T('an UNDECLARED providerEvaluated fails closed', vU.scorable===false&&vU.invalidReasons.indexOf('PROVIDER_EVALUATION_NOT_DECLARED')>=0);
}
p('');
p('=== 8. RUN-2 DENOMINATORS ARE CORRECTLY BOUND ===');
{
  const A=perfect(),B=perfect();
  const v=scoreAcceptanceV2(holdout,A,B);
  const g=(n)=>v.gates.find(x=>x.name===n);
  // G1's denominator is NOT a declared constant. Like |DEN_A|, it is a DISCOVERED property of the
  // reserved partition: highConsequence is assigned by pure table lookup on the frozen
  // severityExpectation field, and the offset-1 partition contains 2 `medium` rows. Run-1's
  // offset-0 partition happened to be 38/38 critical|high; THAT WAS AN ACCIDENT OF THAT PARTITION,
  // NOT A RULE. The holdout is not adjusted to restore 38 -- doing so would be exactly the
  // "change the builder to fit a number" failure D-72 forbids.
  const hcDerived = rows.filter(r=>r.expect.highConsequence===true).length;
  T('G1 denominator equals the frozen-metadata recount, whatever it is',
    g('G1').denominator===hcDerived, String(g('G1').denominator));
  T('G1 denominator is 36 for the offset-1 partition (25 critical + 11 high; 2 medium excluded)',
    g('G1').denominator===36, String(g('G1').denominator));
  T('G1 denominator is entirely INDEPENDENT_GAUNTLET rows',
    v.byProvenance.INDEPENDENT_GAUNTLET.g1Denominator===g('G1').denominator
    && v.byProvenance.INDEPENDENT_REALISM.g1Denominator===0
    && v.byProvenance.AUTHORED_CONTROL.g1Denominator===0);
  T('G3 DEN_A = 30 (Run-2, discovered after selection)', g('G3').denominatorA===30, String(g('G3').denominatorA));
  T('G4 denominator = 21 (Amendment 2 / D-E, unchanged)', g('G4').denominator===21);
  T('G7 pole = 11 (unchanged)', g('G7').denominator===11);
  T('G5/G6/G8/G9/G10 denominator = 93 (Run-2 row count)', ['G5','G6','G8','G9','G10'].every(n=>g(n).denominator===93));
  T('G2 threshold still 100%', g('G2').threshold==='100%');
  T('G3 threshold still 100% on BOTH', /100% on BOTH/.test(g('G3').threshold));
  T('G10 threshold still >=99% after <=1 retry', g('G10').threshold==='>=99% after <=1 retry');
  T('hard-zero gates still hard and still ZERO', ['G1','G4','G5','G6','G7','G8'].every(n=>g(n).hard===true&&g(n).threshold.indexOf('ZERO')===0));
  T('G10 remains the only non-hard gate', v.gates.filter(x=>x.hard===false).map(x=>x.name).join(',')==='G10');
  const bp=v.byProvenance;
  T('by-provenance rows 38 / 30 / 25', bp.INDEPENDENT_GAUNTLET.rows===38&&bp.INDEPENDENT_REALISM.rows===30&&bp.AUTHORED_CONTROL.rows===25);
  T('by-provenance G4 denominator is entirely authored', bp.AUTHORED_CONTROL.g4Denominator===21&&bp.INDEPENDENT_GAUNTLET.g4Denominator===0&&bp.INDEPENDENT_REALISM.g4Denominator===0);
  T('by-provenance G3 DEN_A splits 24 independent / 6 authored',
    bp.INDEPENDENT_REALISM.g3DenominatorA===24&&bp.AUTHORED_CONTROL.g3DenominatorA===6&&bp.INDEPENDENT_GAUNTLET.g3DenominatorA===0);
}
p('');
p('TOTAL: '+(pass+fail)+' assertions, '+pass+' PASS, '+fail+' FAIL');
p('NO PROVIDER CALL. NO INFERENCE. NO RUN-2 SEMANTIC EVALUATION. NO OBSERVATION VALUE READ.');
fs.writeFileSync(path.join(__dirname,'SYNTHETIC_SCORER_VALIDATION.txt'),out.join('\n')+'\n');
console.log(out.join('\n'));
if(fail>0) process.exit(1);
