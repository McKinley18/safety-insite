"use client";

const DISABLE_AUTH_FOR_LOCAL_DEV = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true" && process.env.NODE_ENV !== "production";

import Link from "next/link";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { ToastContainer } from "@/components/ui/Toast";
import { Wifi, WifiOff } from "lucide-react";
import {
  getAutoLockMinutes,
  hasPinSet,
  isPinRequired,
  isSessionUnlocked,
  lockSession,
} from "@/lib/pinSecurity";
import { AI_ENGINE_NAME, APP_NAME, BRAND_HEADER_LOGO } from "@/lib/brand";
import { getAuthUser, hasAuthToken, logout } from "@/lib/auth";
import { usesFixedLightTheme } from "@/lib/theme";

function computeProfileInitials(user: { firstName?: string; lastName?: string; name?: string; email?: string }) {
  const first = (user.firstName || "").trim();
  const last = (user.lastName || "").trim();
  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  const nameParts = (user.name || "").trim().split(/\s+/).filter(Boolean);
  if (nameParts.length >= 2) return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
  if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase();

  const email = (user.email || "").trim();
  return email ? email.charAt(0).toUpperCase() : "";
}

const authPublicRoutes = [
  "/",
  "/login",
  "/register",
  "/create-account",
  "/forgot-password",
  "/reset-password",
  "/unlock",
];

const marketingRoutes = [
  "/about",
  "/legal",
  "/security",
  "/hazlenz",
  "/pricing",
];


const navItems = [
  {
    href: "/command-center",
    label: "Home",
    icon: "🏠",
    activeRoots: ["/command-center", "/dashboard"],
  },
  {
    href: "/inspections",
    label: "Inspect",
    icon: "📋",
    activeRoots: [
      "/inspections",
      "/inspection",
      "/inspection-cover",
    ],
  },
  { href: "/reports", label: "Reports", icon: "🗂", activeRoots: ["/reports"] },
  {
    href: "/safety-calendar",
    label: "Calendar",
    icon: "📅",
    activeRoots: ["/safety-calendar"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "⚙️",
    activeRoots: ["/settings"],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const [hasAuthSession, setHasAuthSession] = useState(false);
  const [profileInitials, setProfileInitials] = useState("");
  const isOnline = useNetworkStatus();

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);

  const isAuthPublicPage = authPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isMarketingPage = marketingRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // The public account journey has a fixed brand presentation. Keep these pages on
  // their designed light-card/navy palette regardless of the signed-in app preference.
  //
  // The pinned set comes from lib/theme (FIXED_LIGHT_THEME_ROUTES), not from
  // `authPublicRoutes`/`marketingRoutes` above -- those two also drive layout
  // (public footer, signed-out chrome), which is a different question from which
  // palette a route paints on. /upgrade is the case that separates them: it is an
  // authenticated app route that keeps the app nav, but it renders the same
  // fixed-light PricingContent as /pricing (bg-white cards, bg-[#E8F4FF] panels,
  // hard-coded text-[#102A43] buttons), and under the dark theme those surfaces kept
  // their light backgrounds while globals.css remapped the text on them to light --
  // measured 1.1:1 and 1.2:1, effectively invisible.
  const usesFixedAccountTheme = usesFixedLightTheme(pathname);

  // Auth and marketing pages should keep the public layout.
  // A stale local token should not make public pages show the signed-in profile badge.
  const isPublicPage = isAuthPublicPage || (isMarketingPage && !hasAuthSession);
  const showAppNav = !isPublicPage;

  // Public/auth/marketing pages show the marketing footer.
  // Signed-in app pages use app navigation only.
  const showPublicFooter = isPublicPage;

  useEffect(() => {
    const root = document.documentElement;

    // <body> is stamped as well as <html>. applyThemeToDocument() (the other writer,
    // via ThemeController) sets the class on both, and globals.css paints the page
    // background off `body`. Updating only the root here left `body.dark` in place on
    // a pinned-light route, so the light card sat on the dark page background.
    const body = document.body;

    if (usesFixedAccountTheme) {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
      body?.classList.remove("dark");
      body?.classList.add("light");
      if (body) body.style.colorScheme = "light";
      return;
    }

    const savedTheme = window.localStorage.getItem("safety_insite_theme") === "dark"
      ? "dark"
      : "light";
    root.classList.remove("light", "dark");
    root.classList.add(savedTheme);
    root.setAttribute("data-theme", savedTheme);
    root.style.colorScheme = savedTheme;
    body?.classList.remove("light", "dark");
    body?.classList.add(savedTheme);
    if (body) body.style.colorScheme = savedTheme;
  }, [usesFixedAccountTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Local dev auth bypass should prevent protected-route redirects,
    // but it should not make public marketing pages render as signed-in.
    const frame = window.requestAnimationFrame(() => {
      setHasAuthSession(hasAuthToken());
      setProfileInitials(computeProfileInitials(getAuthUser()));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPortalMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      if (!profileOpen) return;

      const target = event.target;

      if (
        target instanceof Node &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (DISABLE_AUTH_FOR_LOCAL_DEV || isPublicPage || pathname === "/unlock") return;

    if (!hasAuthToken()) {
      router.replace("/login");
      return;
    }

    if (isPinRequired() && (!hasPinSet() || !isSessionUnlocked())) {
      router.push("/unlock");
    }
  }, [isPublicPage, pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (DISABLE_AUTH_FOR_LOCAL_DEV || isPublicPage || pathname === "/unlock") return;

    // The offline HazLenz brain bundle prefetch is disabled for v1.0.
    //
    // downloadSafeScopeBrainBundle() requests GET {API}/offline/safescope-brain-bundle.json,
    // and the API exposes no such route: the bundle is written to backend/dist/offline/ by the
    // manual `export:safescope-knowledge` script, and the backend registers no static-asset
    // handler, so the request 404s in every environment. The failure was already swallowed, but
    // it still fired a console 404 on every signed-in session and the local brain was never
    // populated. Re-enable this together with a route that actually serves an approved bundle.

    if (!isPinRequired()) return;

    const autoLockMinutes = getAutoLockMinutes();
    if (!autoLockMinutes) return;

    let timer: number | undefined;

    const resetTimer = () => {
      if (timer) window.clearTimeout(timer);

      timer = window.setTimeout(
        () => {
          lockSession();
          router.push("/unlock");
        },
        autoLockMinutes * 60 * 1000,
      );
    };

    const events = ["mousemove", "keydown", "touchstart", "scroll"];
    events.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    );

    resetTimer();

    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isPublicPage, pathname, router]);

  return (
    <div
      className={`sentinel-modern-shell min-h-svh overflow-x-hidden bg-app-page text-app-primary transition-colors ${
        pathname === "/command-center" ? "command-center-page-background" : ""
      } ${showAppNav ? "dark-app-gradient-background" : ""}`}
    >
      <ToastContainer />
      <header className="sticky top-0 z-[900] w-full overflow-visible border-b border-white/15 bg-gradient-to-r from-[#020f24] via-[#061f3f] to-[#0a355f] px-3 py-3 text-white shadow-lg shadow-slate-950/35 backdrop-blur-xl sm:px-5 sm:py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <Link
            href={showAppNav ? "/command-center" : "/"}
            className="relative flex h-14 min-w-0 flex-1 self-center overflow-hidden sm:h-20 sm:max-w-[360px] lg:h-20 lg:max-w-[390px]"
            aria-label="Safety InSite Home"
          >
            <img
              src={BRAND_HEADER_LOGO}
              alt="Safety InSite powered by HazLenz AI"
              className="absolute left-[-24px] top-[-48px] h-[170px] w-auto max-w-none object-contain sm:left-[-34px] sm:top-[-62px] sm:h-[230px]"
            />
          </Link>

          {showAppNav && (
            <>
              <nav className="hidden items-center gap-2 lg:flex">
                {navItems.map((item) => {
                  const active = item.activeRoots.some(
                    (root) =>
                      pathname === root || pathname.startsWith(root + "/"),
                  );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "rounded-full px-7 py-3.5 text-base font-black tracking-tight transition",
                        active
                          ? "bg-white/15 text-white shadow-md shadow-slate-950/20 ring-1 ring-white/20"
                          : "text-blue-100 hover:bg-white/10 hover:text-white",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center gap-3">
                {!isOnline && (
                  <div className="flex items-center gap-2 rounded-full bg-app-warning px-4 py-1.5 text-[13px] ring-1 ring-orange-500/20" title="Offline — changes you make are kept on this device until the connection returns">
                    <WifiOff className="h-3.5 w-3.5 text-orange-700 dark:text-orange-200" />
                    <span className="hidden text-xs font-black text-orange-800 dark:text-orange-100 sm:inline-block">Offline</span>
                  </div>
                )}
                {isOnline && (
                  <div className="hidden items-center gap-2 rounded-full bg-app-success px-4 py-1.5 text-[13px] ring-1 ring-emerald-500/20 lg:flex" title="Connected">
                    <Wifi className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-200" />
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-100">Live</span>
                  </div>
                )}

                <div className="relative z-[950] -translate-x-2 overflow-visible">
                  <button
                    ref={profileButtonRef}
                    type="button"
                    onClick={() => setProfileOpen((open) => !open)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F4FF] text-xs font-black text-[#1D72B8] ring-2 ring-[#1D72B8]/30 transition hover:bg-white active:scale-95 sm:h-12 sm:w-12 sm:text-sm"
                    aria-label="Open profile menu"
                  >
                    {profileInitials}
                  </button>

                  {profileOpen && portalMounted &&
                    createPortal(
                      <div
                        ref={profileMenuRef}
                        className="fixed right-3 top-[72px] z-[2147483647] w-56 overflow-hidden rounded-2xl border border-app-border bg-app-surface text-app-primary shadow-2xl shadow-slate-950/20 dark:bg-[#07111F] sm:right-4 sm:top-[82px]"
                      >

                      {isPinRequired() && (
                        <button
                          type="button"
                          onClick={() => {
                            lockSession();
                            setProfileOpen(false);
                            router.push("/unlock");
                          }}
                          className="block w-full min-h-[52px] px-5 py-4 text-left text-[15px] font-black text-app-primary hover:bg-[#1D72B8] hover:text-white focus:bg-[#1D72B8] focus:text-white focus:outline-none active:bg-[#102A43] transition-colors"
                        >
                          Lock App
                        </button>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block min-h-[52px] px-5 py-4 text-[15px] font-black text-app-primary hover:bg-[#1D72B8] hover:text-white focus:bg-[#1D72B8] focus:text-white focus:outline-none active:bg-[#102A43] transition-colors"
                      >
                        User Profile
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="block min-h-[52px] px-5 py-4 text-[15px] font-black text-app-primary hover:bg-[#1D72B8] hover:text-white focus:bg-[#1D72B8] focus:text-white focus:outline-none active:bg-[#102A43] transition-colors"
                      >
                        Settings
                      </Link>

                      <Link
                        href="/about"
                        onClick={() => setProfileOpen(false)}
                        className="block min-h-[48px] border-t border-app-border px-5 py-3.5 text-[15px] font-black text-app-primary hover:bg-[#1D72B8] hover:text-white focus:bg-[#1D72B8] focus:text-white focus:outline-none active:bg-[#102A43] transition-colors"
                      >
                        About
                      </Link>

                      <Link
                        href="/legal"
                        onClick={() => setProfileOpen(false)}
                        className="block min-h-[48px] px-5 py-3.5 text-[15px] font-black text-app-primary hover:bg-[#1D72B8] hover:text-white focus:bg-[#1D72B8] focus:text-white focus:outline-none active:bg-[#102A43] transition-colors"
                      >
                        Legal
                      </Link>

                      <Link
                        href="/hazlenz"
                        onClick={() => setProfileOpen(false)}
                        className="block min-h-[48px] px-5 py-3.5 text-[15px] font-black text-app-primary hover:bg-[#1D72B8] hover:text-white focus:bg-[#1D72B8] focus:text-white focus:outline-none active:bg-[#102A43] transition-colors"
                      >
                        HazLenz AI
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          logout().finally(() => {
                            window.location.href = "/login";
                          });
                        }}
                        className="block w-full min-h-[52px] border-t border-app-border px-5 py-4 text-left text-[15px] font-black text-red-700 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white focus:outline-none active:bg-red-700 transition-colors dark:text-red-300 dark:hover:bg-red-600 dark:hover:text-white dark:focus:bg-red-600 dark:focus:text-white"
                      >
                        Sign Out
                      </button>
                      </div>,
                      document.body,
                    )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* The v1.0 release marker. This was a neon-green "Beta" chip -- the only use of
          #39FF88 anywhere in the product, and the only glowing element in a palette
          built on the #1D72B8 / #102A43 brand tokens. It now states the shipped
          version in the muted secondary text token, consistent with the rest of the
          chrome. */}
      <div className="mx-auto flex w-full max-w-[1200px] justify-end px-3 pt-2 sm:px-5 md:px-6">
        <span
          className="py-1 text-[11px] font-black uppercase tracking-[0.24em] text-app-secondary sm:text-xs"
          title={`${APP_NAME} version 1.0`}
        >
          v1.0
        </span>
      </div>

      <main
        className={`sentinel-app-main mx-auto w-full max-w-[1200px] overflow-visible px-3 pt-3 pb-32 sm:px-5 sm:pt-5 sm:pb-16 md:px-6 md:pt-6 ${showAppNav ? "" : "pb-8 sm:pb-10"}`}
      >
        {children}
      </main>
      {showPublicFooter && (
        <footer className="mt-auto w-full bg-[#07111F] text-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Standalone footer destinations, not inline prose links: each one needs a
                real tap target on a phone. The text was 20px tall, well under the 44px
                both platforms publish, so the padding here is the touch target rather
                than decoration. */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-black">
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center rounded-xl px-3 text-slate-200 transition hover:bg-white/10 hover:text-[#5DB7FF]"
              >
                About
              </Link>
              <Link
                href="/legal"
                className="inline-flex min-h-11 items-center rounded-xl px-3 text-slate-200 transition hover:bg-white/10 hover:text-[#5DB7FF]"
              >
                Legal
              </Link>
              <Link
                href="/hazlenz"
                className="inline-flex min-h-11 items-center rounded-xl px-3 text-slate-200 transition hover:bg-white/10 hover:text-[#5DB7FF]"
              >
                HazLenz AI
              </Link>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4 text-center">
              <p className="text-xs font-semibold leading-5 text-slate-300">
                © {new Date().getFullYear()} {APP_NAME}. Field safety intelligence powered by {AI_ENGINE_NAME}.
              </p>
            </div>
          </div>
        </footer>
      )}

      {showAppNav && <MobileTabBar />}
    </div>
  );
}
