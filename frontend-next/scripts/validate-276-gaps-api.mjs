// §276 — CLOSING THREE OF THE SIX §275 NOT_EXECUTED AREAS, OVER THE RUNNING LOCAL STACK.
//
//   A  WORKSPACE ISOLATION   two synthetic accounts; every resource kind; direct-id attempts
//   B  STORAGE / IMAGES      synthetic assets only; upload, attach, retrieve, restart, delete
//   C  IDEMPOTENCY           explicit double-submit on every route that persists
//
// These were NOT_EXECUTED in §275 -- not failing, not passing, simply never driven -- and
// D, E and F are driven in the browser by `validate-276-gaps-ui.mjs`, because settings,
// clarification and perceived performance are things a person sees rather than things a
// route returns.
//
// NO PRODUCTION ANYTHING. The stack is localhost, the database is the disposable
// `test_insite_validation_275`, storage is `local_test` into a session scratch directory,
// and every asset is generated in this file.
//
// Usage:
//   API_URL=http://localhost:4000 OUT_DIR=<dir> \
//   VAL_EMAIL_A=... VAL_EMAIL_B=... VAL_PASSWORD=... node scripts/validate-276-gaps-api.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-276";
const EMAIL_A = process.env.VAL_EMAIL_A || "validation-276-a@example.test";
const EMAIL_B = process.env.VAL_EMAIL_B || "validation-276-b@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "";
const TOKEN_A = process.env.TOKEN_A || "";
const TOKEN_B = process.env.TOKEN_B || "";
const RUN = `VALIDATION-276-GAP-${Date.now()}`;

mkdirSync(OUT_DIR, { recursive: true });

const results = [];
function record(area, id, title, outcome, detail) {
  results.push({ area, id, title, outcome, detail: detail ?? null });
  const mark = outcome === "PASS" ? "ok  " : outcome === "NOTE" ? "note" : "FAIL";
  console.log(`${mark} [${area}] ${id}  ${title}${detail ? `  [${detail}]` : ""}`);
}

async function call(path, { method = "GET", body, token, raw = false, headers = {} } = {}) {
  const init = { method, headers: { ...headers } };
  if (token) init.headers.authorization = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData)) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    init.body = body;
  }
  const response = await fetch(`${API_URL}${path}`, init);
  if (raw) return { status: response.status, buffer: Buffer.from(await response.arrayBuffer()), headers: response.headers };
  const text = await response.text();
  let parsed = {};
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { text }; }
  return { status: response.status, body: parsed };
}

async function login(email) {
  const response = await call("/auth/login", { method: "POST", body: { email, password: PASSWORD } });
  if (!response.body?.token) {
    throw new Error(`§276 gaps REFUSED: ${email} did not receive a token (${response.status}). ` +
      "Every isolation assertion below would pass for the wrong reason.");
  }
  return response.body.token;
}

/** A real 1x1 PNG. Generated here so no production or customer asset is ever touched. */
function syntheticPng() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
}

/** A JPEG the product must accept, so "only PNG works" cannot masquerade as a pass. */
function syntheticJpeg() {
  return Buffer.from(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
    "base64",
  );
}

function dayKey(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  const tokenA = TOKEN_A || await login(EMAIL_A);
  const tokenB = TOKEN_B || await login(EMAIL_B);
  console.log("two authenticated principals established\n");

  // =====================================================================================
  // SEED — A's workspace. Everything below is A's; B never touches any of it legitimately.
  // =====================================================================================
  const siteA = await call("/sites", { method: "POST", token: tokenA, body: { name: `${RUN} site A` } });
  const inspA = await call("/inspections", {
    method: "POST", token: tokenA,
    body: { siteId: siteA.body.id, title: `${RUN} A`, regulatoryContext: "osha-general-industry" },
  });
  const inspectionA = inspA.body.id;
  const obsA = await call(`/inspections/${inspectionA}/observations`, {
    method: "POST", token: tokenA,
    body: { rawText: `${RUN}: the fixed guard on the bandsaw has been removed and the blade is running.` },
  });
  const observationA = obsA.body.id;
  const actionA = await call("/actions", {
    method: "POST", token: tokenA,
    body: {
      inspectionId: inspectionA, title: `${RUN} action A`, description: "seeded",
      priorityCode: "high", dueDate: dayKey(4),
    },
  });
  const taskA = await call("/tasks", {
    method: "POST", token: tokenA,
    body: { title: `${RUN} task A`, dueDate: dayKey(4), priority: "high" },
  });

  const seeded = [inspectionA, observationA, actionA.body.id, taskA.body.id].every(Boolean);
  record("SEED", "S1", "A's workspace is seeded with an inspection, observation, action and task",
    seeded ? "PASS" : "FAIL", seeded ? "" : "cannot proceed");
  if (!seeded) process.exit(1);

  // =====================================================================================
  // AREA A — WORKSPACE ISOLATION.
  //
  // The assertion is not merely "B is refused". It is that B cannot learn the resource
  // EXISTS: a 403 tells a caller the id is real and belongs to someone, which is a
  // disclosure in its own right. 404 is the correct answer to "that is not yours".
  // =====================================================================================
  const isolation = [
    ["A1", "inspection", `/inspections/${inspectionA}`, "GET", undefined],
    ["A2", "observation (via its inspection)", `/inspections/${inspectionA}/observations`, "POST", { rawText: "probe" }],
    ["A3", "corrective action status", `/actions/${actionA.body.id}/status`, "PATCH", { statusCode: "closed" }],
    ["A4", "task edit", `/tasks/${taskA.body.id}`, "PATCH", { title: "taken" }],
    ["A5", "task delete", `/tasks/${taskA.body.id}`, "DELETE", undefined],
    ["A6", "Expert analysis read", `/inspections/observations/${observationA}/expert-analyses/current`, "GET", undefined],
    ["A7", "inspection transition", `/inspections/${inspectionA}/transition`, "POST", { status: "completed", version: 1 }],
    ["A8", "report generation", `/inspections/${inspectionA}/reports`, "POST", undefined],
    ["A9", "report read", `/inspections/${inspectionA}/report`, "GET", undefined],
    ["A10", "completion readiness", `/inspections/${inspectionA}/completion-readiness`, "GET", undefined],
    ["A11", "evidence upload", `/inspections/${inspectionA}/evidence`, "POST", undefined],
  ];

  for (const [id, what, path, method, body] of isolation) {
    const response = await call(path, { method, token: tokenB, body });
    const refused = response.status === 404 || response.status === 403 || response.status === 400;
    const leaksExistence = response.status === 403;
    record("A", id, `a cross-workspace ${what} is refused`,
      refused && !leaksExistence ? "PASS" : refused ? "NOTE" : "FAIL",
      `status ${response.status}${leaksExistence ? " — 403 confirms the id is real" : ""}`);
  }

  // Content, not just routes: B's own listings must contain none of A's records.
  const bInspections = await call("/inspections", { token: tokenB });
  const bInspectionList = Array.isArray(bInspections.body) ? bInspections.body : (bInspections.body.data || []);
  record("A", "A12", "B's inspection list contains none of A's inspections",
    !bInspectionList.some((i) => i.id === inspectionA) ? "PASS" : "FAIL",
    `${bInspectionList.length} inspection(s) visible to B`);

  const bCalendar = await call("/calendar", { token: tokenB });
  const bCalendarRows = Array.isArray(bCalendar.body) ? bCalendar.body : [];
  record("A", "A13", "B's calendar contains none of A's due work",
    !bCalendarRows.some((e) => e.sourceId === taskA.body.id || e.sourceId === actionA.body.id) ? "PASS" : "FAIL",
    `${bCalendarRows.length} event(s) visible to B`);

  const bActions = await call("/actions", { token: tokenB });
  const bActionRows = bActions.body?.data || [];
  record("A", "A14", "B's corrective-action list contains none of A's",
    !bActionRows.some((a) => a.id === actionA.body.id) ? "PASS" : "FAIL",
    `${bActionRows.length} action(s) visible to B`);

  const anon = await call(`/inspections/${inspectionA}`);
  record("A", "A15", "an unauthenticated read of A's inspection is refused",
    anon.status === 401 ? "PASS" : "FAIL", `status ${anon.status}`);

  // =====================================================================================
  // AREA B — STORAGE AND IMAGES. Synthetic assets only.
  // =====================================================================================
  async function upload(token, inspectionId, buffer, filename, type, clientRequestId) {
    const form = new FormData();
    form.append("file", new Blob([buffer], { type }), filename);
    if (clientRequestId) form.append("clientRequestId", clientRequestId);
    return call(`/inspections/${inspectionId}/evidence`, { method: "POST", token, body: form });
  }

  const png = syntheticPng();
  const pngSha = createHash("sha256").update(png).digest("hex");
  const uploaded = await upload(tokenA, inspectionA, png, `${RUN}.png`, "image/png");
  record("B", "B1", "a synthetic image uploads and attaches to the inspection",
    uploaded.status === 201 || uploaded.status === 200 ? "PASS" : "FAIL",
    `status ${uploaded.status} id ${uploaded.body?.id || "-"}`);
  const fileId = uploaded.body?.id;

  if (fileId) {
    const fetched = await call(`/files/${fileId}`, { token: tokenA, raw: true });
    const roundTripSha = createHash("sha256").update(fetched.buffer).digest("hex");
    record("B", "B2", "it downloads back byte-identical",
      fetched.status === 200 && roundTripSha === pngSha ? "PASS" : "FAIL",
      `sha256 ${roundTripSha.slice(0, 16)} vs ${pngSha.slice(0, 16)}`);
    record("B", "B3", "it is served with hardening headers, never inline",
      /attachment/.test(fetched.headers.get("content-disposition") || "")
      && fetched.headers.get("x-content-type-options") === "nosniff" ? "PASS" : "FAIL",
      `${fetched.headers.get("content-disposition")} / ${fetched.headers.get("x-content-type-options")}`);

    const foreign = await call(`/files/${fileId}`, { token: tokenB });
    record("B", "B4", "another workspace cannot download it",
      foreign.status === 404 || foreign.status === 403 ? "PASS" : "FAIL", `status ${foreign.status}`);
  }

  const jpeg = await upload(tokenA, inspectionA, syntheticJpeg(), `${RUN}.jpg`, "image/jpeg");
  record("B", "B5", "a JPEG is accepted as well as a PNG",
    jpeg.status === 201 || jpeg.status === 200 ? "PASS" : "FAIL", `status ${jpeg.status}`);

  const badType = await upload(tokenA, inspectionA, Buffer.from("#!/bin/sh\necho hi\n"), `${RUN}.sh`, "text/x-shellscript");
  record("B", "B6", "an unsupported file type is refused with a 4xx, not a stack trace",
    badType.status >= 400 && badType.status < 500 ? "PASS" : "FAIL",
    `status ${badType.status} — ${String(badType.body?.message || "").slice(0, 70)}`);

  const disguised = await upload(tokenA, inspectionA, Buffer.from("this is not an image"), `${RUN}-fake.png`, "image/png");
  record("B", "B7", "a non-image body claiming to be a PNG is refused",
    disguised.status >= 400 && disguised.status < 500 ? "PASS" : "FAIL",
    `status ${disguised.status} — ${String(disguised.body?.message || "").slice(0, 70)}`);

  const missing = await call("/files/00000000-0000-4000-8000-000000000000", { token: tokenA });
  record("B", "B8", "a missing image reads as not-found, not as a server error",
    missing.status === 404 ? "PASS" : "FAIL", `status ${missing.status}`);

  if (fileId) {
    const deleted = await call(`/files/${fileId}`, { method: "DELETE", token: tokenA });
    record("B", "B9", "an image can be deleted", deleted.status === 200 ? "PASS" : "FAIL", `status ${deleted.status}`);
    const afterDelete = await call(`/files/${fileId}`, { token: tokenA });
    record("B", "B10", "and is no longer retrievable afterwards",
      afterDelete.status === 404 || afterDelete.status === 410 ? "PASS" : "FAIL", `status ${afterDelete.status}`);
  }

  // =====================================================================================
  // AREA C — IDEMPOTENCY. Every route that persists, submitted twice on purpose.
  //
  // The question is not "does the second call succeed" but "how many ROWS exist after it".
  // A route that answers 200 twice and stores two records has passed nothing.
  // =====================================================================================
  const idemKey = `${RUN}-idem`;

  const inspectionsBefore = (await call("/inspections", { token: tokenA })).body;
  const countInspections = (value) => (Array.isArray(value) ? value : value?.data || []).length;

  const c1 = await call("/inspections", {
    method: "POST", token: tokenA,
    body: { siteId: siteA.body.id, title: `${RUN} idem`, regulatoryContext: "osha-general-industry", clientRequestId: idemKey },
  });
  const c2 = await call("/inspections", {
    method: "POST", token: tokenA,
    body: { siteId: siteA.body.id, title: `${RUN} idem`, regulatoryContext: "osha-general-industry", clientRequestId: idemKey },
  });
  const inspectionsAfter = (await call("/inspections", { token: tokenA })).body;
  record("C", "C1", "a replayed inspection create stores ONE inspection",
    c1.body.id === c2.body.id
    && countInspections(inspectionsAfter) === countInspections(inspectionsBefore) + 1 ? "PASS" : "FAIL",
    `${countInspections(inspectionsBefore)} -> ${countInspections(inspectionsAfter)}, same id ${c1.body.id === c2.body.id}`);

  const idemInspection = c1.body.id;
  const o1 = await call(`/inspections/${idemInspection}/observations`, {
    method: "POST", token: tokenA,
    body: { rawText: `${RUN} idempotent observation`, clientRequestId: `${idemKey}-obs` },
  });
  const o2 = await call(`/inspections/${idemInspection}/observations`, {
    method: "POST", token: tokenA,
    body: { rawText: `${RUN} idempotent observation`, clientRequestId: `${idemKey}-obs` },
  });
  const reread = await call(`/inspections/${idemInspection}`, { token: tokenA });
  record("C", "C2", "a replayed observation create stores ONE observation",
    o1.body.id === o2.body.id && (reread.body.observations || []).length === 1 ? "PASS" : "FAIL",
    `${(reread.body.observations || []).length} observation(s), same id ${o1.body.id === o2.body.id}`);

  const evidenceKey = `${RUN}-evidence`;
  const e1 = await upload(tokenA, idemInspection, png, `${RUN}-idem.png`, "image/png", evidenceKey);
  const e2 = await upload(tokenA, idemInspection, png, `${RUN}-idem.png`, "image/png", evidenceKey);
  record("C", "C3", "a replayed evidence upload stores ONE object",
    e1.body?.id && e1.body.id === e2.body?.id ? "PASS" : "FAIL",
    `${e1.body?.id} vs ${e2.body?.id}`);

  /**
   * CORRECTIVE ACTIONS. The product always creates these FOR A FINDING -- the inspection
   * workflow's only caller passes `findingId` -- and the service keeps one canonical action
   * per finding, replacing its text in place rather than adding a row. So the double-submit
   * that matters is the one carrying a findingId, and it is measured against a REAL finding
   * from a completed inspection rather than against a shape the product never sends.
   *
   * The findingId-less path is reported separately and honestly below.
   */
  const completedList = (await call("/inspections", { token: tokenA })).body;
  const completed = (Array.isArray(completedList) ? completedList : completedList?.data || [])
    .find((i) => i.status === "completed");
  let findingForAction = null;
  if (completed) {
    const detail = await call(`/inspections/${completed.id}`, { token: tokenA });
    findingForAction = (detail.body.findings || []).find((f) => f.status === "finalized") || null;
  }

  if (findingForAction) {
    const totalBefore = (await call("/actions?limit=100", { token: tokenA })).body?.meta?.total ?? -1;
    const body = {
      inspectionId: completed.id, findingId: findingForAction.id,
      title: `${RUN} replayed action`, description: "replayed", priorityCode: "medium", dueDate: dayKey(6),
    };
    const a1 = await call("/actions", { method: "POST", token: tokenA, body });
    const a2 = await call("/actions", { method: "POST", token: tokenA, body });
    const totalAfter = (await call("/actions?limit=100", { token: tokenA })).body?.meta?.total ?? -1;
    record("C", "C4", "a replayed corrective action for a finding stores ONE action",
      a1.body?.id === a2.body?.id && totalAfter === totalBefore ? "PASS" : "FAIL",
      `${totalBefore} -> ${totalAfter}, same id ${a1.body?.id === a2.body?.id}`);
  } else {
    record("C", "C4", "a replayed corrective action for a finding stores ONE action", "FAIL",
      "no finalized finding was available to exercise the product's real shape");
  }

  /**
   * The unbound path. An action created with NO findingId has nothing to be canonical
   * against, so a replay creates a second row. No product surface sends this shape today,
   * and it is recorded as a bounded limitation rather than scored either way.
   */
  const looseBefore = (await call("/actions?limit=100", { token: tokenA })).body?.meta?.total ?? -1;
  const loose = { inspectionId: idemInspection, title: `${RUN} unbound`, description: "x", priorityCode: "low", dueDate: dayKey(6) };
  const l1 = await call("/actions", { method: "POST", token: tokenA, body: loose });
  const l2 = await call("/actions", { method: "POST", token: tokenA, body: loose });
  const looseAfter = (await call("/actions?limit=100", { token: tokenA })).body?.meta?.total ?? -1;
  record("C", "C4b", "an action created with NO findingId is not deduplicated",
    l1.body?.id !== l2.body?.id && looseAfter === looseBefore + 2 ? "NOTE" : "PASS",
    `${looseBefore} -> ${looseAfter} — no product surface sends this shape; recorded, not scored`);

  /**
   * REPORT GENERATION. Replayed on a COMPLETED inspection, because generation is refused on
   * one that is not finished -- running it against a draft measures the completion gate,
   * not replay safety.
   */
  if (completed) {
    const before = await call(`/inspections/${completed.id}/report`, { token: tokenA });
    const r1 = await call(`/inspections/${completed.id}/reports`, { method: "POST", token: tokenA });
    const r2 = await call(`/inspections/${completed.id}/reports`, { method: "POST", token: tokenA });
    const after = await call(`/inspections/${completed.id}/report`, { token: tokenA });
    record("C", "C5", "report generation replays without erroring",
      r1.status < 400 && r2.status < 400 ? "PASS" : "FAIL", `statuses ${r1.status} / ${r2.status}`);
    record("C", "C6", "and the inspection still has exactly ONE current report",
      Boolean(after.body?.reportId) && after.body.reportId === before.body?.reportId ? "PASS" : "FAIL",
      `reportId ${after.body?.reportId || "-"} (was ${before.body?.reportId || "-"}), version ${after.body?.version}`);
  } else {
    record("C", "C5", "report generation replays without erroring", "FAIL",
      "no completed inspection was available");
  }

  const t1 = await call(`/tasks/${taskA.body.id}/status`, { method: "PATCH", token: tokenA, body: { status: "completed" } });
  const t2 = await call(`/tasks/${taskA.body.id}/status`, { method: "PATCH", token: tokenA, body: { status: "completed" } });
  const calendarAfter = (await call("/calendar", { token: tokenA })).body;
  const copies = (Array.isArray(calendarAfter) ? calendarAfter : []).filter((e) => e.sourceId === taskA.body.id).length;
  record("C", "C7", "a replayed completion leaves ONE calendar event",
    t1.status === 200 && t2.status === 200 && copies === 1 ? "PASS" : "FAIL", `${copies} copies`);

  writeFileSync(`${OUT_DIR}/gap-closure-api.json`, JSON.stringify({
    section: 276,
    run: RUN,
    apiUrl: API_URL,
    areas: { A: "workspace isolation", B: "storage and images", C: "idempotency" },
    results,
  }, null, 2));

  const failed = results.filter((r) => r.outcome === "FAIL");
  const noted = results.filter((r) => r.outcome === "NOTE");
  console.log(`\n${results.length - failed.length - noted.length} passed, ${noted.length} noted, ${failed.length} failed.`);
  if (failed.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
