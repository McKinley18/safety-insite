# Safety InSite Memory Efficiency Checklist

## Backend classify path

- Keep normal classify output concise.
- Hide debug/reviewer payloads unless explicitly requested.
- Avoid loading large source/reviewer arrays into normal field responses.
- Avoid logging full classify JSON responses.
- Keep static standards cached in compact structures.
- Prefer deterministic rule/candidate matching over broad repeated DB lookups.
- Guard optional persistence/feedback calls so missing tables do not interrupt classification.
- Keep Render build using capped TypeScript memory.

## Frontend

- Do not store huge HazLenz raw responses in localStorage unless needed.
- Store finalized finding summaries, not every debug field.
- Keep report generation using normalized fields.
- Keep mobile screens light and avoid rendering large hidden JSON blocks.

## Output size targets

- Normal classify response target: under 75 KB.
- Preferred mobile response target: under 50 KB.
- Debug response may be larger but should require an explicit debug flag.

## Commit discipline

- One concern per commit.
- Build backend before backend push.
- Build frontend before frontend push.
- Run one classify smoke test before deployment.
