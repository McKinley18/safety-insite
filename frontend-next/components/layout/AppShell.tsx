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
import { downloadSafeScopeBrainBundle } from "@/lib/safescopeBrainBundle";
import { AI_ENGINE_NAME, APP_NAME, BRAND_HEADER_LOGO } from "@/lib/brand";
import { clearAuthSession, hasAuthToken } from "@/lib/auth";

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
  const isOnline = useNetworkStatus();

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);

  const isAuthPublicPage = authPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isMarketingPage = marketingRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Auth and marketing pages should keep the public layout.
  // A stale local token should not make public pages show the signed-in profile badge.
  const isPublicPage = isAuthPublicPage || (isMarketingPage && !hasAuthSession);
  const showAppNav = !isPublicPage;

  // Public/auth/marketing pages show the marketing footer.
  // Signed-in app pages use app navigation only.
  const showPublicFooter = isPublicPage;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Local dev auth bypass should prevent protected-route redirects,
    // but it should not make public marketing pages render as signed-in.
    setHasAuthSession(hasAuthToken());
  }, [pathname]);

  useEffect(() => {
    setPortalMounted(true);
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

    const alreadyAttempted = window.sessionStorage.getItem(
      "sentinel_brain_sync_attempted",
    );

    if (!alreadyAttempted && navigator.onLine) {
      window.sessionStorage.setItem("sentinel_brain_sync_attempted", "true");
      downloadSafeScopeBrainBundle().catch(() => {
        // App startup should never be blocked by brain bundle refresh.
      });
    }

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
    <div className="sentinel-modern-shell min-h-svh overflow-x-hidden bg-app-page text-app-primary transition-colors">
      <ToastContainer />
      <header className="sticky top-0 z-[900] w-full overflow-visible border-b border-white/15 bg-gradient-to-r from-[#020f24] via-[#061f3f] to-[#0a355f] px-3 py-3 text-white shadow-lg shadow-slate-950/35 backdrop-blur-xl sm:px-5 sm:py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <Link
            href={showAppNav ? "/command-center" : "/"}
            className="relative flex h-[76px] w-[350px] shrink-0 self-center overflow-visible sm:h-24 sm:w-[470px] lg:h-24 lg:w-[580px]"
            aria-label="Safety InSite Home"
          >
            <img
              src={BRAND_HEADER_LOGO}
              alt="Safety InSite powered by HazLenz AI"
              className="absolute -left-9 top-[64%] h-[190px] w-auto max-w-none -translate-y-1/2 object-contain sm:-left-12 sm:h-[245px] lg:-left-16 lg:h-[288px]"
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
                  <div className="flex items-center gap-2 rounded-full bg-app-warning px-4 py-1.5 text-[13px] ring-1 ring-orange-500/20" title="Offline Mode: Using local HazLenz AI Brain">
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
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-app-brand-soft text-sm font-black text-app-primary ring-2 ring-blue-100 transition hover:bg-white/10 active:scale-95 dark:hover:bg-[#102A43] sm:h-14 sm:w-14 sm:text-base"
                    aria-label="Open profile menu"
                  >
                    CM
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
                          clearAuthSession();
                          window.location.href = "/login";
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

      <main
        className={`sentinel-app-main mx-auto w-full max-w-[1200px] overflow-visible px-3 pt-3 pb-32 sm:px-5 sm:pt-5 sm:pb-16 md:px-6 md:pt-6 ${showAppNav ? "" : "pb-8 sm:pb-10"}`}
      >
        {children}
      </main>
      {showPublicFooter && (
        <footer className="mt-auto w-full bg-[#07111F] text-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-black">
              <Link href="/about" className="text-slate-200 transition hover:text-[#5DB7FF]">
                About
              </Link>
              <Link href="/legal" className="text-slate-200 transition hover:text-[#5DB7FF]">
                Legal
              </Link>
              <Link href="/hazlenz" className="text-slate-200 transition hover:text-[#5DB7FF]">
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
