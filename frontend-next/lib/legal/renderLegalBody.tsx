import React from "react";

/**
 * §308 (LG-3) — RENDERING A LEGAL DOCUMENT BODY AS DATA, NEVER AS MARKUP.
 *
 * ---------------------------------------------------------------------------------------------
 * THE SECURITY PROPERTY, AND WHY IT IS STRUCTURAL RATHER THAN A FILTER.
 *
 * §308 requires that a legal document cannot become an injection surface, and the usual answer —
 * convert Markdown to an HTML string, then sanitise it — is the weaker one. It keeps a sink in the
 * code (`dangerouslySetInnerHTML`) and stakes the whole property on a sanitiser being correct and
 * staying correct, which is a claim about a dependency rather than about this file.
 *
 * So there is NO HTML SINK HERE AT ALL. This parser emits React elements directly. A `<script>` in
 * a document body is never parsed as an element, never handed to a sanitiser, and never reaches
 * `innerHTML`; it arrives at the DOM as a text node and is displayed as the characters
 * `<script>...`. That is not sanitisation succeeding, it is there being nothing to sanitise, and it
 * holds for payloads nobody has thought of yet.
 *
 * `npm run check:legal-documents` and the §308 suite both assert that `dangerouslySetInnerHTML`
 * appears nowhere in the legal rendering path, so the property cannot be lost by a later edit
 * without a gate noticing.
 *
 * ---------------------------------------------------------------------------------------------
 * THE SUBSET IS SMALL ON PURPOSE.
 *
 * Headings, paragraphs, unordered and ordered lists, blockquotes, horizontal rules, bold, italic,
 * inline code and links. That is what a Terms of Service or a Privacy Notice actually uses. Every
 * construct omitted — images, tables, raw HTML, reference links, footnotes — is one whose absence
 * costs a legal document nothing and whose presence would widen the surface.
 *
 * LINKS ARE THE ONE PLACE A PARSER CAN STILL BETRAY YOU, because a URL is attacker-controlled data
 * that the browser executes if its scheme says so. `https:`, `http:` and `mailto:` are permitted;
 * everything else — `javascript:`, `data:`, `vbscript:`, a scheme-relative `//host` — renders as
 * plain text carrying the URL, so the reader can still see what the document said without the
 * browser being asked to act on it.
 */

const SAFE_LINK_SCHEMES = new Set(["http:", "https:", "mailto:"]);

/**
 * Is this href safe to put in an anchor?
 *
 * Parsed with `new URL` against a base rather than matched with a regular expression, because
 * scheme detection by regex is where this kind of check usually goes wrong: `java\tscript:`,
 * `JaVaScript:`, a leading newline and percent-encoding all defeat the obvious pattern and none of
 * them defeats a parser. A relative href resolves against the base and inherits `https:`, which is
 * correct — a relative link cannot carry a scheme.
 */
export function isSafeHref(href: string): boolean {
  const raw = String(href ?? "").trim();
  if (!raw) return false;
  // A scheme-relative URL borrows the page's scheme and points at another host. Legal documents
  // have no reason to use one, and it is a common way to smuggle an off-site destination past a
  // scheme check.
  if (raw.startsWith("//")) return false;
  try {
    const parsed = new URL(raw, "https://legal.invalid/");
    return SAFE_LINK_SCHEMES.has(parsed.protocol);
  } catch {
    return false;
  }
}

type Inline = React.ReactNode;

/**
 * Inline formatting: `**bold**`, `*italic*`, `` `code` `` and `[text](href)`.
 *
 * One pass, one regular expression, and the ONLY thing it ever produces is a React element or a
 * string. There is no branch in this function that can emit markup.
 */
function renderInline(text: string, keyPrefix: string): Inline[] {
  const nodes: Inline[] = [];
  const pattern = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(\[[^\]]*\]\([^)\s]*\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${index++}`;

    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em] dark:bg-slate-800">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const href = token.slice(split + 2, -1);
      if (isSafeHref(href)) {
        nodes.push(
          <a
            key={key}
            href={href}
            // A document is authored by counsel, not by this application, so an external link
            // opens in a new tab and carries noopener/noreferrer — the destination must not get a
            // handle on the window that opened it.
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-semibold text-[#1D72B8] underline underline-offset-2 hover:text-[#0B1320] dark:text-[#5DB7FF]"
          >
            {label}
          </a>,
        );
      } else {
        /*
         * REFUSED, AND SHOWN. The reader still sees exactly what the document said, including the
         * URL, so nothing is hidden from them — the browser is simply never asked to act on it.
         * Silently dropping the link would quietly alter the document, which for a legal text is
         * its own kind of wrong.
         */
        nodes.push(
          <span key={key} title="This link was not rendered as a link because its address does not use a permitted scheme.">
            {label} ({href})
          </span>,
        );
      }
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.length ? nodes : [text];
}

/**
 * Parse a legal document body into React elements.
 *
 * Block-level, line-oriented, and deliberately unclever. Anything it does not recognise becomes a
 * paragraph of plain text — which is the correct failure mode for a document renderer, because an
 * unrecognised construct should still be READ by the person the document is for.
 */
export function renderLegalBody(body: string): React.ReactNode[] {
  const lines = String(body ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;
  let key = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    paragraph = [];
    if (!text) return;
    blocks.push(
      <p key={`p${key++}`} className="text-[15px] leading-7 text-slate-700 dark:text-slate-200">
        {renderInline(text, `p${key}`)}
      </p>,
    );
  };

  const flushList = () => {
    if (!listItems.length) return;
    const items = listItems;
    listItems = [];
    const ListTag = listOrdered ? "ol" : "ul";
    blocks.push(
      <ListTag
        key={`l${key++}`}
        className={`ml-5 space-y-1.5 text-[15px] leading-7 text-slate-700 dark:text-slate-200 ${
          listOrdered ? "list-decimal" : "list-disc"
        }`}
      >
        {items.map((item, i) => (
          <li key={`li${i}`}>{renderInline(item, `l${key}-${i}`)}</li>
        ))}
      </ListTag>,
    );
  };

  const flushAll = () => { flushParagraph(); flushList(); };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) { flushAll(); continue; }

    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const text = heading[2];
      // h1 is the page's own title, so a document's own `#` heading renders at h2 and below. Two
      // h1s on a page is an accessibility fault, and a legal page is one a screen reader user has
      // every reason to navigate by heading.
      const Tag = (`h${Math.min(level + 1, 6)}`) as "h2" | "h3" | "h4" | "h5" | "h6";
      const size = level === 1
        ? "mt-8 text-xl font-black"
        : level === 2
          ? "mt-7 text-lg font-black"
          : "mt-6 text-base font-black";
      blocks.push(
        <Tag key={`h${key++}`} className={`${size} tracking-tight text-slate-900 dark:text-white`}>
          {renderInline(text, `h${key}`)}
        </Tag>,
      );
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushAll();
      blocks.push(<hr key={`hr${key++}`} className="my-7 border-slate-200 dark:border-slate-800" />);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(trimmed);
    if (quote) {
      flushAll();
      blocks.push(
        <blockquote
          key={`q${key++}`}
          className="border-l-4 border-slate-300 pl-4 text-[15px] italic leading-7 text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          {renderInline(quote[1], `q${key}`)}
        </blockquote>,
      );
      continue;
    }

    const bullet = /^[-*+]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      if (listOrdered) flushList();
      listOrdered = false;
      listItems.push(bullet[1]);
      continue;
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    if (numbered) {
      flushParagraph();
      if (!listOrdered) flushList();
      listOrdered = true;
      listItems.push(numbered[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushAll();
  return blocks;
}
