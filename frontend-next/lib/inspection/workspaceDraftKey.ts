/**
 * §280 (D-035) — the workspace draft key prefix, alone, in a module that imports nothing.
 *
 * It lives apart from `workspaceDraft.ts` to break an import cycle rather than to organise
 * anything: `lib/auth.ts` needs the prefix at module-evaluation time for its sign-out sweep, and
 * `workspaceDraft.ts` reaches `lib/auth.ts` transitively through `offline/offlineIdentity.ts`.
 * A leaf module is the version of that graph with no cycle in it at all, rather than one that
 * happens to initialise in a working order today.
 */
export const WORKSPACE_DRAFT_PREFIX = "safety_insite_workspace_draft_v1:";
