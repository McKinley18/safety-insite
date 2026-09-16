import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "fs";
import { join } from "path";
import React from "react";

import { isSafeHref, renderLegalBody } from "../renderLegalBody";

/**
 * §308 (LG-3) — THE SANITISATION PROOF, MEASURED ON THE ACTUAL RENDERED HTML.
 *
 *   npm run test:legal-render
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS RENDERS RATHER THAN INSPECTS.
 *
 * It would be easy — and much weaker — to assert that the parser "handles" a payload by checking
 * the React element tree it returns. That proves something about a data structure. What actually
 * matters is the HTML a browser receives, so this runs the real renderer through
 * `renderToStaticMarkup` and asserts on the STRING, which is the same string React would put in
 * the DOM.
 *
 * The payloads come from the same hostile fixture the backend serves, read from disk rather than
 * duplicated here, so the thing proven safe is the thing actually published.
 */

let passed = 0;
const failures: string[] = [];
function check(condition: unknown, message: string, detail = ""): void {
  if (condition) { passed += 1; console.log(`ok    ${message}${detail ? `  [${detail}]` : ""}`); }
  else { failures.push(message); console.error(`FAIL  ${message}${detail ? `  [${detail}]` : ""}`); }
}

const HOSTILE_FIXTURE = join(
  __dirname, "..", "..", "..", "..", "backend", "legal-documents", "test-fixtures",
  "terms-0.0.0-hostile.1.md",
);
const hostileBody = readFileSync(HOSTILE_FIXTURE, "utf8");

const html = renderToStaticMarkup(
  React.createElement(React.Fragment, null, ...renderLegalBody(hostileBody)),
);

console.log("\n---- the hostile document, rendered ----\n");
console.log(`  fixture: backend/legal-documents/test-fixtures/terms-0.0.0-hostile.1.md`);
console.log(`  rendered HTML length: ${html.length}\n`);

// ---- the payloads must not be executable ------------------------------------------------------
check(hostileBody.includes("<script>"), "the fixture genuinely contains a <script> payload — "
  + "without this the assertions below would pass against a harmless document");

check(!/<script/i.test(html),
  "41-a NO <script> element in the rendered HTML — the payload arrived as a text node",
  /<script/i.test(html) ? "PRESENT" : "absent");
check(!/<iframe/i.test(html), "41-b NO <iframe> element in the rendered HTML");
check(!/<img[^>]*onerror/i.test(html), "41-c NO img with an onerror handler");
check(!/<svg/i.test(html), "41-d NO <svg> element");
/*
 * MEASURED INSIDE ACTUAL TAGS, WHICH IS THE ONLY PLACE AN ATTRIBUTE CAN EXIST.
 *
 * The first version of this assertion searched the whole HTML string for `on…=` and failed — on
 * `&lt;img src=x onerror=&quot;…&quot;&gt;`, which is the payload rendered as ESCAPED TEXT inside a
 * paragraph. That is the outcome this suite exists to prove, so the assertion was wrong and the
 * renderer was right. Extracting the real tags first measures the thing that matters: whether any
 * element the browser will construct carries a handler.
 */
const renderedTags = html.match(/<[a-zA-Z][^>]*>/g) || [];
const tagsWithHandlers = renderedTags.filter((tag) => /\son[a-z]+\s*=/i.test(tag));
check(tagsWithHandlers.length === 0,
  "41-e NO REAL ELEMENT carries an event-handler attribute (onclick, onerror, onload, …). The "
  + "payloads that contain them are text inside a paragraph, not attributes on an element.",
  tagsWithHandlers.join(", ") || `${renderedTags.length} tags, none with a handler`);
check(!/href\s*=\s*["']?\s*javascript:/i.test(html),
  "41-f NO href carrying a javascript: scheme");
check(!/href\s*=\s*["']?\s*data:/i.test(html),
  "41-g NO href carrying a data: scheme");

// ---- and the payloads are still VISIBLE, escaped -----------------------------------------------
check(html.includes("&lt;script&gt;"),
  "41-h the payload is VISIBLE as escaped text — the reader sees exactly what the document said, "
  + "which for a legal document matters as much as the safety");
check(html.includes("Ordinary text after the payloads"),
  "41-i and the renderer did not stop at the payload; the rest of the document rendered");

// ---- the two markdown-link payloads render as text, carrying their URL ------------------------
check(html.includes("a markdown link with a javascript scheme"),
  "41-j a markdown link with a javascript: scheme renders its LABEL as text");
check(!/<a[^>]*javascript:/i.test(html),
  "41-k and produces no anchor at all");
check(html.includes("a markdown link with a data scheme"),
  "41-l a markdown link with a data: scheme renders its label as text");

// ---- the scheme check itself -------------------------------------------------------------------
console.log("\n---- isSafeHref ----\n");
for (const [href, expected, why] of [
  ["https://example.invalid/x", true, "https"],
  ["http://example.invalid/x", true, "http"],
  ["mailto:privacy@example.invalid", true, "mailto"],
  ["/terms", true, "a relative path inherits the page scheme"],
  ["javascript:alert(1)", false, "javascript:"],
  ["JaVaScRiPt:alert(1)", false, "javascript: with mixed case"],
  ["  javascript:alert(1)  ", false, "javascript: with surrounding whitespace"],
  ["java\tscript:alert(1)", false, "javascript: split by a tab, which defeats a naive regex"],
  ["java\nscript:alert(1)", false, "javascript: split by a newline"],
  ["data:text/html;base64,PHNjcmlwdD4=", false, "data:"],
  ["vbscript:msgbox(1)", false, "vbscript:"],
  ["//evil.invalid/x", false, "a scheme-relative URL pointing at another host"],
  ["", false, "an empty href"],
] as const) {
  check(isSafeHref(href) === expected,
    `41-scheme ${why} -> ${expected ? "permitted" : "refused"}`,
    JSON.stringify(href));
}

// ---- an ordinary document still renders properly ------------------------------------------------
console.log("\n---- an ordinary document ----\n");
const ordinary = renderToStaticMarkup(
  React.createElement(React.Fragment, null, ...renderLegalBody([
    "# A heading",
    "",
    "A paragraph with **bold**, *italic* and a [link](https://example.invalid/ok).",
    "",
    "- first",
    "- second",
    "",
    "1. one",
    "2. two",
    "",
    "> a quotation",
    "",
    "---",
  ].join("\n"))),
);
check(ordinary.includes("<h2") && ordinary.includes("A heading"),
  "render-a a level-1 markdown heading becomes an h2, so the page keeps exactly one h1");
check(ordinary.includes("<strong>bold</strong>"), "render-b bold renders");
check(ordinary.includes("<em>italic</em>"), "render-c italic renders");
check(/<a [^>]*href="https:\/\/example\.invalid\/ok"/.test(ordinary)
  && ordinary.includes('rel="noopener noreferrer nofollow"'),
  "render-d a safe link renders as an anchor carrying noopener and noreferrer");
check(ordinary.includes("<ul") && ordinary.includes("<li>first</li>"), "render-e an unordered list renders");
check(ordinary.includes("<ol") && ordinary.includes("<li>one</li>"), "render-f an ordered list renders");
check(ordinary.includes("<blockquote"), "render-g a blockquote renders");
check(ordinary.includes("<hr"), "render-h a horizontal rule renders");

// ---- no HTML sink in the rendering path ---------------------------------------------------------
console.log("\n---- the structural property ----\n");
const renderPath = [
  join(__dirname, "..", "renderLegalBody.tsx"),
  join(__dirname, "..", "legalDocument.ts"),
  join(__dirname, "..", "..", "..", "components", "legal", "LegalDocumentPage.tsx"),
  join(__dirname, "..", "..", "..", "app", "terms", "page.tsx"),
  join(__dirname, "..", "..", "..", "app", "privacy", "page.tsx"),
];
const sinks = renderPath.filter((file) =>
  /dangerouslySetInnerHTML|innerHTML\s*=|document\.write|new Function\(|\beval\(/.test(
    readFileSync(file, "utf8").split("\n")
      .filter((line) => !line.trim().startsWith("*") && !line.trim().startsWith("//"))
      .join("\n"),
  ));
check(sinks.length === 0,
  "41-structural NO HTML SINK exists anywhere in the legal rendering path — the payloads above are "
  + "not sanitised, they are never parsed as markup at all, and that holds for payloads nobody has "
  + "thought of yet",
  sinks.join(", ") || `${renderPath.length} files clean`);

console.log(`\n${"=".repeat(88)}`);
console.log(`§308 LEGAL RENDERER: ${passed} passed, ${failures.length} failed.`);
if (failures.length) {
  console.log("\nFAILED:");
  for (const failure of failures) console.log(`  - ${failure}`);
}
console.log("=".repeat(88));
process.exit(failures.length === 0 ? 0 : 1);
