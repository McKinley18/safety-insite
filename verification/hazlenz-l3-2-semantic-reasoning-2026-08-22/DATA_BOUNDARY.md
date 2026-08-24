# L3-2 — security and data-boundary review

## 1 — Where the boundary actually is

**Nothing leaves this machine.** The selected provider runs on `127.0.0.1:11434`. There is no
outbound request, no third-party processor, and no vendor data-handling agreement to rely on, because
no vendor receives anything.

That makes the §10 privacy requirements trivially satisfied *for this configuration* — and it also
means this review cannot be read as clearance for a hosted provider. What it establishes instead is
that the **input-contract boundary itself** is correct, which is the part that must hold whichever
provider is chosen later.

## 2 — Structural exclusion beats redaction, and is used first

Blueprint §29.10 requires redaction to run before transport "so it cannot be bypassed by a later
caller". `reasoning-input-builder.ts` goes further: the excluded categories have **no parameter to
enter through**. `ReasoningInputRequest` accepts an observation, an optional context string, a
regulatory context, a family list, candidate ids, answered clarifications, established-finding
summaries and advisory signals — and nothing else.

The suite asserts this by reading the interface's own source and failing if any of
`customerName`, `siteName`, `organizationId`, `userId`, `email`, `address`, `reviewState`,
`releaseId`, `standardText` ever appears in it.

| §15 category | How it is excluded | Verified by |
|---|---|---|
| personal / inspector names | no field | interface assertion |
| site or company identity | no field | interface assertion |
| account identifiers | no field | interface assertion |
| authentication material | no field | interface assertion |
| billing data | no field | interface assertion |
| unrelated inspection records | no field; established findings carry family + state only | interface assertion |
| governed review state | no field | interface assertion |
| release lifecycle state | no field | interface assertion |
| standards corpus text | candidate **ids** only; `citation` is held for the deterministic side and never reaches the prompt | prompt + schema assertions |
| arbitrary database rows | the builder reads no database | no import |
| photos / attachments | no field — `TEXT_FIRST_LEVEL3` | interface assertion |

## 3 — Redaction, the second layer

For identifiers an inspector typed *into* free text. Shape rules, not name lists — a name blocklist
fails silently on the first unlisted name.

`email · phone · ssn · street_address · mine_id · employee_id · url`

Redaction runs **before the text becomes the canonical source**, so evidence offsets index the
redacted string. A span therefore cannot quote something that was never sent — the property is
structural, not procedural.

Measured on a deliberately dirty observation carrying a name, badge id, email, phone, street address,
MSHA ID and URL: every identifier removed, the hazard content ("grinder guard missing") intact, and
the prompt verified to contain none of them.

## 4 — What is actually sent, measured from a real input

From `results/egress-inventory.json`, computed by `describeEgress()` on a live holdout input rather
than asserted:

* the redacted observation (one source, ~110–330 characters);
* the regulatory-context value and its provenance;
* 24 hazard-family names — the engine's own closed taxonomy;
* regulatory candidate **ids** when supplied — `regulatoryCitationStringsSent: false`;
* advisory hints when supplied, labelled unreliable;
* the analysis id.

## 5 — Secrets

There are none to leak: the local endpoint needs no credential. Verified anyway —

* no key, token or credential in any file added by this phase;
* `L3_OLLAMA_ENDPOINT` / `L3_OLLAMA_MODEL` / `L3_OLLAMA_TIMEOUT_MS` are the only env vars read, none secret;
* the failure taxonomy carries `HTTP <status>` and a 200-character truncated message — never a body, never a header;
* no prompt or provider response is persisted by the application; the evaluation artifacts under
  `results/` hold only observation text that came from the frozen public test matrix.

## 6 — Logging discipline

`describe()` truncates any exception to 200 characters and the adapter never logs an observation.
Raw provider exceptions do not cross the reasoning boundary — they become failure-taxonomy members,
so a stack trace carrying request content cannot reach a log through this path.

## 7 — What a hosted provider would still need

Recorded so it is not mistaken for done:

1. a zero-retention or short-retention agreement (Anthropic offers ZDR; default is 30-day deletion);
2. contractual no-training-on-inputs;
3. a re-run of this review against the real transport, including TLS and request-log behaviour;
4. a decision on whether observation text may cross a regional boundary.
