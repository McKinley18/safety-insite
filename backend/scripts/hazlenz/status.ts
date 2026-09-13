/**
 * §263 — `hazlenz:status`. THE ANSWER TO "WHERE ARE WE" IN UNDER A SECOND, WITHOUT READING ANYTHING.
 *
 * It reads the current-state manifest and prints it as a short summary. It computes nothing and
 * verifies nothing — that is `hazlenz:verify`, deliberately a different command, because a status
 * line that silently ran a verification would make people trust a cached answer. If you need to
 * know that the state is TRUE rather than what it CLAIMS, run the verifier.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const REPO = join(__dirname, '..', '..', '..');

interface State {
  asOf: string; branch: string;
  candidate: { identity: string; label: string; contractVersion: string; protectedModules: number };
  integration: {
    stage: string; commit: string; terminal: string;
    routes: Record<string, { method: string; path: string; throttle: string }>;
    statesReachableToday: string[];
    statesAwaitingTheConfirmationAction: string[];
    analysisStates: string[];
  };
  acceptedLimitations: { id: string }[];
  knownGaps: { id: string; status: string }[];
  nextAuthorizedWork: { item: string; blockedUntil: string };
  commands: Record<string, string>;
}

function main(): void {
  const state = JSON.parse(readFileSync(
    join(REPO, 'verification', 'current', 'EXPERT-HAZLENZ-STATE.json'), 'utf8')) as State;
  const blockers = JSON.parse(readFileSync(
    join(REPO, 'verification', 'current', 'BETA-BLOCKERS.json'), 'utf8')) as {
      blocksExternalBetaNow: { id: string; severity: string }[];
    };

  console.log('EXPERT HAZLENZ — CURRENT STATE');
  console.log(`  as of              ${state.asOf}   branch ${state.branch}`);
  console.log(`  candidate          ${state.candidate.label}  ${state.candidate.identity.slice(0, 16)}…`);
  console.log(`  contract           ${state.candidate.contractVersion}`);
  console.log(`  protected modules  ${state.candidate.protectedModules}`);
  console.log(`  integration        ${state.integration.stage} (${state.integration.commit})`);
  for (const [name, route] of Object.entries(state.integration.routes)) {
    console.log(`  route ${name.padEnd(12)} ${route.method} ${route.path}`);
    console.log(`        ${''.padEnd(12)} throttle ${route.throttle}`);
  }
  // DERIVED, NOT WRITTEN OUT. §264 made the two human states reachable and the hardcoded
  // parenthetical that said they were not immediately contradicted the count beside it.
  const reachable = state.integration.statesReachableToday.length;
  const total = state.integration.analysisStates.length;
  const pending = state.integration.statesAwaitingTheConfirmationAction;
  console.log(`  states reachable   ${reachable} of ${total}`
    + (pending.length > 0 ? `  (${pending.join(', ')} await the confirmation action)` : ''));
  console.log(`  accepted limits    ${state.acceptedLimitations.map(l => l.id).join(', ')}`);
  console.log(`  beta blockers      ${blockers.blocksExternalBetaNow.length}: `
    + blockers.blocksExternalBetaNow.map(b => b.id).join(', '));
  console.log(`  live gaps          ${state.knownGaps.filter(g => g.status === 'UNVERIFIED_LIVE').length} unverified, `
    + `${state.knownGaps.filter(g => g.status === 'ENVIRONMENTALLY_BLOCKED').length} environmentally blocked`);
  console.log(`  next              ${state.nextAuthorizedWork.item}`);
  console.log(`                     blocked until ${state.nextAuthorizedWork.blockedUntil}`);
  console.log('\n  terminal          ' + state.integration.terminal);
  console.log('\nCommands');
  for (const [name, command] of Object.entries(state.commands)) {
    console.log(`  ${name.padEnd(26)} ${command}`);
  }
  console.log('\nFull detail: verification/current/EXPERT-HAZLENZ-STATE.json'
    + ' · project-docs/current/CURRENT-STATE.md');
}

if (require.main === module) main();
