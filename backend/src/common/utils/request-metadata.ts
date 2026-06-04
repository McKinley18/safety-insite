export function getRequestMetadata(req: any) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip =
    typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : req.ip || req.socket.remoteAddress || 'unknown';

  return {
    ipAddress: ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    origin: req.headers.origin || 'unknown',
    referer: req.headers.referer || 'unknown',
    timestamp: new Date().toISOString(),
  };
}
