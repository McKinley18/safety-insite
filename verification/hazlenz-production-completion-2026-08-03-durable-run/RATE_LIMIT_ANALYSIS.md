# Rate-limit analysis

The production classify route uses a 100-request/60-second throttler. The durable runner now supports pacing, HTTP 429 recognition, Retry-After parsing, exponential backoff with jitter, checkpoint writes after each accepted case, resume, and duplicate-result prevention. No production limit was changed.

