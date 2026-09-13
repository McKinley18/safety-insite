import { blocksMutation, getReleaseStatus, StaleClientError } from "./release/versionCheck";

// Auth is wired in via dynamic import (not a static import of "./auth") to
// avoid a module init cycle: auth.ts -> cloudReports.ts -> apiFetch.ts.
// Dynamic import resolves lazily at call time, once the module graph is
// already stable, so no cycle-order hazard.
async function attemptSessionRefresh(): Promise<string | null> {
  const auth = await import("./auth");
  const refreshed = await auth.refreshAuthSession();
  return refreshed ? auth.getAuthToken() : null;
}

async function doFetch(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(init.headers || {});

    if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(input, {
      ...init,
      headers,
      signal: controller.signal,
    });

    return response;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { timeoutMs?: number; retries?: number } = {},
) {
  const timeoutMs = options.timeoutMs ?? 25000;
  const retries = options.retries ?? 1;
  const url = String(input);
  const isAuthLifecycleCall = /\/auth\/(refresh|login|register|logout)(\?|$)/.test(url);

  // §279 — THE STALE-CLIENT WRITE GATE.
  //
  // Every frontend call to the API passes through here, which is why the gate lives here and not
  // in each caller: a gate that has to be remembered at thirty call sites is a gate with holes.
  //
  // It refuses only MUTATIONS, and only when the server has POSITIVELY said this client is below
  // the supported floor or a major ahead of it. Reads still work, sign-out still works, and a
  // server that could not be reached teaches the client nothing -- so an inspector on a bad
  // connection is never stopped. `blocksMutation` holds all of that; this is the enforcement.
  //
  // Throwing rather than returning a synthetic Response is deliberate. Callers here branch on
  // `response.ok` and would treat a fabricated 409 as an ordinary server rejection and show the
  // inspector a generic failure; an error with a name carries the reason all the way up.
  if (blocksMutation(init.method, url)) {
    throw new StaleClientError(getReleaseStatus().result.state);
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await doFetch(input, init, timeoutMs);

      if (response.status === 401 && !isAuthLifecycleCall) {
        const originalHeaders = new Headers(init.headers || {});
        if (originalHeaders.has("Authorization")) {
          const freshToken = await attemptSessionRefresh();
          if (freshToken) {
            originalHeaders.set("Authorization", `Bearer ${freshToken}`);
            return doFetch(input, { ...init, headers: originalHeaders }, timeoutMs);
          }
        }
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1200));
    }
  }

  throw lastError;
}
