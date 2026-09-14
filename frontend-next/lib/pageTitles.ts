/**
 * §280 (D-031) — THE ONE PLACE A PAGE'S NAME IS DECIDED.
 *
 * ==================== WHAT WAS WRONG ====================
 *
 * §279 measured that every authenticated page in Safety InSite shared a single `<title>`:
 * "Safety InSite — Field safety intelligence powered by HazLenz AI." Five open tabs were
 * indistinguishable from one another, every bookmark and history entry carried the same
 * sentence, and a screen reader announced that same sentence on arrival at every page. Only
 * `/login` differed, because it happened to have a layout of its own.
 *
 * ==================== ONE TABLE, AND THIN ADAPTERS ====================
 *
 * Every page in the authenticated product is a Client Component, so none of them can export
 * `metadata` itself. The names therefore live HERE, once, and each route carries a four-line
 * server `layout.tsx` that asks this module for them:
 *
 *     export const metadata = routeMetadata("/command-center");
 *
 * No title string is written anywhere but this file. `check:page-titles` fails the build if a
 * route in this map has no layout, or a layout names a route that is not in the map, so the two
 * cannot drift apart.
 *
 * A CLIENT-SIDE SETTER WAS TRIED FIRST, AND IS NOT WHAT SHIPPED. A `DocumentTitle` component
 * using `usePathname()` + `document.title` looked like the way to avoid seventeen files. Measured,
 * it worked on in-app navigation and NOT on a full document load: the App Router commits its own
 * metadata `<title>` during hydration, after the effect has run, so a hard load of
 * /command-center kept the default sentence while clicking through to /reports produced
 * "Reports · Safety InSite". A mechanism that is right half the time is worse than one that is
 * absent, because nobody knows which half they are looking at — and keeping both would be exactly
 * the duplicate implementation this decision rules out.
 *
 * ==================== THE CONVENTION ====================
 *
 * "<Page> · Safety InSite", which is `metadata.title.template` in the root layout. The name is
 * the shortest phrase that identifies the page to someone scanning a row of tabs — "Dashboard",
 * not "Dashboard — your due work and this week at a glance".
 */
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "./brand";

/** What every route is called, keyed by exact pathname. */
export const PAGE_TITLES: Record<string, string> = {
  // Signed out / public
  "/login": "Sign in",
  "/register": "Create account",
  "/forgot-password": "Forgot password",
  "/reset-password": "Reset password",
  "/about": "About",
  "/hazlenz": "HazLenz AI",
  "/legal": "Legal",
  "/pricing": "Pricing",

  // The product
  "/command-center": "Dashboard",
  "/inspections": "Inspections",
  "/inspection": "Inspection",
  "/inspection-cover": "New inspection",
  "/inspection-workspace": "Inspection workspace",
  "/inspection-review": "Finding review",
  "/inspection-complete": "Complete inspection",
  "/field-capture": "Field capture",
  "/reports": "Reports",
  "/safety-calendar": "Safety Calendar",
  "/settings": "Settings",
  "/profile": "Account",
  "/upgrade": "Upgrade",
  "/unlock": "Unlock",
};

/** The system surfaces, which have no route of their own. */
export const NOT_FOUND_TITLE = "Page not found";
export const ERROR_TITLE = "Something went wrong";

/**
 * The landing page keeps the full brand sentence: it is the one page whose title is read by
 * someone who does not yet know what the product is.
 */
export const DEFAULT_TITLE = `${APP_NAME} — ${APP_TAGLINE}`;

/** The page name alone, or null when the route has none. Trailing slashes are ignored. */
export function pageNameForPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return PAGE_TITLES[path] ?? null;
}

/** The complete document title for a route, template applied. */
export function documentTitleForPath(pathname: string | null | undefined): string {
  const name = pageNameForPath(pathname);
  return name ? `${name} · ${APP_NAME}` : DEFAULT_TITLE;
}

/**
 * What a route's `layout.tsx` exports as its `metadata`.
 *
 * Returns the bare NAME, not the full title: the root layout's `title.template` appends
 * " · Safety InSite", and returning the finished string here would produce
 * "Dashboard · Safety InSite · Safety InSite".
 *
 * Throws on an unknown route rather than falling back. A page whose name nobody chose is the
 * defect this whole module exists to fix, and a silent default is how it comes back.
 */
export function routeMetadata(pathname: string): { title: string; description: string } {
  const name = pageNameForPath(pathname);
  if (!name) {
    throw new Error(
      `routeMetadata("${pathname}"): no page name is registered for this route. Add one to `
      + "PAGE_TITLES in lib/pageTitles.ts — every customer-facing page needs a name somebody chose.",
    );
  }
  return { title: name, description: APP_DESCRIPTION };
}
