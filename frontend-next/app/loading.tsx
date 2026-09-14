/**
 * §280 (D-034) — THE LOADING SURFACE.
 *
 * Safety InSite had no `loading.tsx`, so a route that suspended showed the previous page frozen,
 * or nothing at all, while every page invented its own "Loading…" text underneath.
 *
 * WHAT THIS IS AND IS NOT. It is the SEGMENT-level fallback the App Router shows while a route's
 * own module is still arriving — it is not a replacement for the in-page loading states that
 * cover data fetched after hydration, and it does not try to become one. A skeleton pretending to
 * be the specific page underneath would be a different lie on every route.
 *
 * It is deliberately quiet: the product's shell (header, navigation, theme) is already painted
 * around it, so all that is missing is the content column, and a large animated placeholder in
 * that hole reads as an error rather than as progress.
 *
 * ACCESSIBILITY. `role="status"` with `aria-live="polite"` announces the wait once. The visible
 * text is what is announced, so a screen-reader user is told the same thing a sighted one is
 * shown, and the animated bars are `aria-hidden` because they carry no information.
 *
 * `motion-reduce:animate-none` honours a reduced-motion preference: a pulsing block is exactly the
 * kind of movement that setting exists to suppress.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[70rem] px-1 py-10 sm:py-14">
      <div role="status" aria-live="polite" className="flex flex-col gap-4">
        <span className="text-sm font-black tracking-tight text-app-secondary">
          Loading Safety InSite…
        </span>
        <div aria-hidden="true" className="flex flex-col gap-3">
          <div className="h-8 w-2/5 animate-pulse rounded-lg bg-app-surface-muted motion-reduce:animate-none" />
          <div className="h-36 w-full animate-pulse rounded-2xl bg-app-surface-muted motion-reduce:animate-none" />
          <div className="h-36 w-full animate-pulse rounded-2xl bg-app-surface-muted motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
