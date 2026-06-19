export function isHazLenzKnowledgeTelemetryEnabled() {
  return process.env.HAZLENZ_KNOWLEDGE_TELEMETRY === 'true';
}

export function logKnowledgeTelemetry(label: string, metadata: Record<string, any>) {
  if (!isHazLenzKnowledgeTelemetryEnabled()) return;
  console.info(`[HazLenz Telemetry] ${label}`, metadata);
}

export async function withKnowledgeTelemetry<T>(
  label: string,
  metadata: Record<string, any>,
  fn: () => Promise<T>
): Promise<T> {
  if (!isHazLenzKnowledgeTelemetryEnabled()) {
    return fn();
  }

  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    logKnowledgeTelemetry(label, { ...metadata, elapsedMs: (end - start).toFixed(2) });
    return result;
  } catch (error) {
    const end = performance.now();
    logKnowledgeTelemetry(label, { ...metadata, elapsedMs: (end - start).toFixed(2), error: error instanceof Error ? error.message : 'Unknown' });
    throw error;
  }
}
