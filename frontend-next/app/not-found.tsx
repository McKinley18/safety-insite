import { AppLinkButton } from "@/components/ui/AppLinkButton";
import SystemStatePanel from "@/components/system/SystemStatePanel";
import { NOT_FOUND_TITLE } from "@/lib/pageTitles";

/**
 * §280 (D-034) — THE 404.
 *
 * Before this file, an unmatched URL rendered Next.js' own unbranded default: a bare "404 | This
 * page could not be found" on a white page with no product name, no navigation and nowhere to go.
 * A customer who mistyped a bookmark had no way to tell whether Safety InSite was broken.
 *
 * It renders inside the root layout, so it inherits the header, the navigation, the theme and the
 * tab bar. That is the point — a 404 that still looks like the product is a 404 the user can walk
 * out of.
 *
 * TWO RECOVERY ACTIONS, BOTH TRUE. The dashboard is where a signed-in inspector's work is, and
 * Inspections is where the workflow starts. Neither claims to know what the user was looking for,
 * because nothing here does.
 *
 * A signed-OUT visitor to an unknown URL does not reach this page: AppShell's guard redirects any
 * unrecognised path to /login before it renders. That is pre-existing behaviour and is recorded in
 * the §280 review rather than changed here — who a mistyped URL belongs to is a product decision.
 */
export const metadata = {
  title: NOT_FOUND_TITLE,
  description: "That page does not exist in Safety InSite.",
};

export default function NotFound() {
  return (
    <SystemStatePanel
      eyebrow="Page not found"
      title="That page does not exist"
      tone="attention"
      body={
        <>
          <p>
            The address you followed is not part of Safety InSite. It may have been mistyped, or it
            may belong to a page that has since been removed.
          </p>
          <p>Nothing has been lost — your inspections and reports are unaffected.</p>
        </>
      }
      actions={
        <>
          <AppLinkButton href="/command-center" variant="primary" size="lg">
            Go to dashboard
          </AppLinkButton>
          <AppLinkButton href="/inspections" variant="secondary" size="lg">
            View inspections
          </AppLinkButton>
        </>
      }
    />
  );
}
