export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { timeoutMs?: number; retries?: number } = {},
) {
  const timeoutMs = options.timeoutMs ?? 25000;
  const retries = options.retries ?? 1;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers = new Headers(init.headers || {});

      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(input, {
        ...init,
        headers,
        signal: controller.signal,
      });

      window.clearTimeout(timeout);
      return response;
    } catch (error) {
      window.clearTimeout(timeout);
      lastError = error;

      if (attempt === retries) {
        throw error;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1200));
    }
  }

  throw lastError;
}
