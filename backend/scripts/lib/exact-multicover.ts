/**
 * §132 -- EXACT minimum-cardinality set-multicover, for cohort joint feasibility.
 *
 * The question "what is the smallest row set satisfying every frozen class minimum at once" is a
 * set-multicover minimisation. A greedy answer is an UPPER bound and proves nothing about
 * minimality, so this module solves it exactly by branch and bound.
 *
 * Rows are grouped into TYPES by their class-membership vector, because two rows with identical
 * memberships are interchangeable. The search then assigns a count to each type rather than
 * deciding rows one at a time.
 *
 * ==================== WHY THE BOUNDS ARE VALID ====================
 *
 * One additional row reduces any single class deficit by at most one, so `max_c deficit_c` is an
 * admissible lower bound on the rows still needed. Where two classes are MUTUALLY EXCLUSIVE -- no
 * row can belong to both -- their deficits add, giving a stronger admissible bound. Both are
 * lower bounds, so pruning against them never discards an optimal solution.
 *
 * Capacity pruning is exact rather than heuristic: if the rows still available cannot cover a
 * class's remaining deficit, the branch is infeasible, not merely unpromising.
 */

export interface CoverType {
  /** Classes every row of this type belongs to. */
  classes: readonly string[];
  /** How many rows of this type exist. */
  capacity: number;
  /** Row ids, so a witness can name real rows. */
  rowIds: readonly string[];
}

export interface MulticoverResult {
  feasible: boolean;
  /** Proven minimum cardinality, when feasible. */
  minimum: number | null;
  /** One optimal selection, as counts per type index. */
  witnessCounts: number[] | null;
  /** Classes whose total supply is below their minimum -- infeasible at any size. */
  absoluteBlockers: string[];
  nodesExplored: number;
  /** True when the search completed rather than hitting the node ceiling. */
  proven: boolean;
}

/**
 * Solve exactly. `mutuallyExclusive` lists pairs of class names no row can hold simultaneously;
 * they strengthen the bound and must be genuinely exclusive in the input or the result is wrong.
 */
export function solveMulticover(
  types: readonly CoverType[],
  minima: ReadonlyMap<string, number>,
  mutuallyExclusive: ReadonlyArray<readonly [string, string]> = [],
  nodeCeiling = 20_000_000,
): MulticoverResult {
  const classes = [...minima.keys()].filter(c => (minima.get(c) ?? 0) > 0);
  const idx = new Map(classes.map((c, i) => [c, i]));
  const need0 = classes.map(c => minima.get(c) ?? 0);

  // Per-type coverage vector over the constrained classes.
  const cover = types.map(t => {
    const v = new Array(classes.length).fill(0);
    for (const c of t.classes) { const i = idx.get(c); if (i !== undefined) v[i] = 1; }
    return v;
  });

  // Absolute supply check: total capacity per class against its minimum.
  const totalCap = new Array(classes.length).fill(0);
  types.forEach((t, ti) => cover[ti].forEach((v, i) => { if (v) totalCap[i] += t.capacity; }));
  const absoluteBlockers = classes
    .filter((c, i) => totalCap[i] < need0[i])
    .map((c, _) => {
      const i = idx.get(c)!;
      return `${c}: supply ${totalCap[i]} < minimum ${need0[i]} (short ${need0[i] - totalCap[i]})`;
    });
  if (absoluteBlockers.length > 0) {
    return { feasible: false, minimum: null, witnessCounts: null, absoluteBlockers,
      nodesExplored: 0, proven: true };
  }

  const exclusivePairs = mutuallyExclusive
    .map(([a, b]) => [idx.get(a), idx.get(b)] as const)
    .filter((p): p is readonly [number, number] => p[0] !== undefined && p[1] !== undefined);

  // Suffix capacity per class, so capacity pruning is O(1) at each node.
  const suffixCap: number[][] = Array.from({ length: types.length + 1 },
    () => new Array(classes.length).fill(0));
  for (let ti = types.length - 1; ti >= 0; ti -= 1) {
    for (let i = 0; i < classes.length; i += 1) {
      suffixCap[ti][i] = suffixCap[ti + 1][i] + (cover[ti][i] ? types[ti].capacity : 0);
    }
  }

  const lowerBound = (need: number[]): number => {
    let lb = 0;
    for (const d of need) if (d > lb) lb = d;
    for (const [a, b] of exclusivePairs) {
      const s = need[a] + need[b];
      if (s > lb) lb = s;
    }
    return lb;
  };

  let best = Infinity;
  let bestCounts: number[] | null = null;
  let nodes = 0;
  let exhausted = true;
  const counts = new Array(types.length).fill(0);

  const dfs = (ti: number, used: number, need: number[]): void => {
    nodes += 1;
    if (nodes > nodeCeiling) { exhausted = false; return; }
    const lb = lowerBound(need);
    if (lb === 0) {
      if (used < best) { best = used; bestCounts = [...counts]; }
      return;
    }
    if (used + lb >= best) return;
    if (ti >= types.length) return;
    for (let i = 0; i < classes.length; i += 1) {
      if (need[i] > suffixCap[ti][i]) return;   // cannot possibly be covered
    }
    // Taking more of a type than the largest deficit it touches can never help.
    let maxUseful = 0;
    for (let i = 0; i < classes.length; i += 1) {
      if (cover[ti][i] && need[i] > maxUseful) maxUseful = need[i];
    }
    const hi = Math.min(types[ti].capacity, maxUseful);
    for (let n = hi; n >= 0; n -= 1) {
      counts[ti] = n;
      const next = need.slice();
      if (n > 0) for (let i = 0; i < classes.length; i += 1) {
        if (cover[ti][i]) next[i] = Math.max(0, next[i] - n);
      }
      dfs(ti + 1, used + n, next);
    }
    counts[ti] = 0;
  };

  // Most-useful-first ordering makes the incumbent good early, which is what prunes the tree.
  const order = types.map((_, i) => i).sort((a, b) => {
    const score = (ti: number) => cover[ti].reduce((s, v, i) => s + (v ? need0[i] : 0), 0);
    return score(b) - score(a);
  });
  const reordered = order.map(i => types[i]);
  if (order.some((v, i) => v !== i)) {
    const res = solveMulticoverOrdered(reordered, classes, idx, need0, exclusivePairs, nodeCeiling);
    return { ...res, absoluteBlockers,
      witnessCounts: res.witnessCounts
        ? types.map((_, original) => res.witnessCounts![order.indexOf(original)])
        : null };
  }

  dfs(0, 0, need0.slice());
  return { feasible: bestCounts !== null, minimum: bestCounts !== null ? best : null,
    witnessCounts: bestCounts, absoluteBlockers, nodesExplored: nodes, proven: exhausted };
}

/** Same search, on an already-ordered type list. Split out so the ordering step stays readable. */
function solveMulticoverOrdered(
  types: readonly CoverType[], classes: string[], idx: Map<string, number>, need0: number[],
  exclusivePairs: ReadonlyArray<readonly [number, number]>, nodeCeiling: number,
): Omit<MulticoverResult, 'absoluteBlockers'> {
  const cover = types.map(t => {
    const v = new Array(classes.length).fill(0);
    for (const c of t.classes) { const i = idx.get(c); if (i !== undefined) v[i] = 1; }
    return v;
  });
  const suffixCap: number[][] = Array.from({ length: types.length + 1 },
    () => new Array(classes.length).fill(0));
  for (let ti = types.length - 1; ti >= 0; ti -= 1) {
    for (let i = 0; i < classes.length; i += 1) {
      suffixCap[ti][i] = suffixCap[ti + 1][i] + (cover[ti][i] ? types[ti].capacity : 0);
    }
  }
  const lowerBound = (need: number[]): number => {
    let lb = 0;
    for (const d of need) if (d > lb) lb = d;
    for (const [a, b] of exclusivePairs) { const s = need[a] + need[b]; if (s > lb) lb = s; }
    return lb;
  };
  let best = Infinity;
  let bestCounts: number[] | null = null;
  let nodes = 0;
  let exhausted = true;
  const counts = new Array(types.length).fill(0);
  const dfs = (ti: number, used: number, need: number[]): void => {
    nodes += 1;
    if (nodes > nodeCeiling) { exhausted = false; return; }
    const lb = lowerBound(need);
    if (lb === 0) { if (used < best) { best = used; bestCounts = [...counts]; } return; }
    if (used + lb >= best) return;
    if (ti >= types.length) return;
    for (let i = 0; i < classes.length; i += 1) if (need[i] > suffixCap[ti][i]) return;
    let maxUseful = 0;
    for (let i = 0; i < classes.length; i += 1) {
      if (cover[ti][i] && need[i] > maxUseful) maxUseful = need[i];
    }
    const hi = Math.min(types[ti].capacity, maxUseful);
    for (let n = hi; n >= 0; n -= 1) {
      counts[ti] = n;
      const next = need.slice();
      if (n > 0) for (let i = 0; i < classes.length; i += 1) {
        if (cover[ti][i]) next[i] = Math.max(0, next[i] - n);
      }
      dfs(ti + 1, used + n, next);
    }
    counts[ti] = 0;
  };
  dfs(0, 0, need0.slice());
  return { feasible: bestCounts !== null, minimum: bestCounts !== null ? best : null,
    witnessCounts: bestCounts, nodesExplored: nodes, proven: exhausted };
}
