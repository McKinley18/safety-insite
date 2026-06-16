"use client";

const DISABLE_AUTH_FOR_LOCAL_DEV = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

import Link from "next/link";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { ToastContainer } from "@/components/ui/Toast";
import { Moon, Sun, Wifi, WifiOff } from "lucide-react";
import {
  getAutoLockMinutes,
  getProtectedModeLabel,
  hasPinSet,
  isPinRequired,
  isSessionUnlocked,
  lockSession,
} from "@/lib/pinSecurity";
import { downloadSafeScopeBrainBundle } from "@/lib/safescopeBrainBundle";
import { AI_ENGINE_NAME, APP_NAME, BRAND_HEADER_LOGO } from "@/lib/brand";
import { getStoredPlanCode, type PlanCode } from "@/lib/planEntitlements";
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
  "/safescope",
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
      "/inspection-walkthrough",
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
    href: "/analytics",
    label: "Insights",
    icon: "📈",
    activeRoots: ["/analytics"],
  },
  {
    href: "/company",
    label: "Company",
    icon: "🏢",
    activeRoots: ["/company"],
  },
  {
    href: "/safescope-knowledge/review",
    label: "Review",
    icon: "✓",
    activeRoots: ["/safescope-knowledge/review"],
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
  const [darkMode, setDarkMode] = useState(false);
  const [planCode, setPlanCode] = useState<string>("basic");
  const isOnline = useNetworkStatus();

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const [securityLabel, setSecurityLabel] = useState("Standard Mode");

  const isAuthPublicPage = authPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isMarketingPage = marketingRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Auth and marketing pages should keep the public layout.
  // A stale local token should not make public pages show the signed-in profile badge.
  const isPublicPage = isAuthPublicPage || isMarketingPage;
  const showAppNav = !isPublicPage;

  // Public/auth/marketing pages show the marketing footer.
  // Signed-in app pages use app navigation only.
  const showPublicFooter = isPublicPage;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Local dev auth bypass should prevent protected-route redirects,
    // but it should not make public marketing pages render as signed-in.
    setHasAuthSession(hasAuthToken());
    setPlanCode(getStoredPlanCode());
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

    setSecurityLabel(getProtectedModeLabel());

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
          setSecurityLabel(getProtectedModeLabel());
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

  useEffect(() => {
    const themeVersion = "theme-reset-2026-06-13-v1";
    const savedThemeVersion = localStorage.getItem("sentinel_theme_version");

    if (savedThemeVersion !== themeVersion) {
      localStorage.setItem("sentinel_theme_version", themeVersion);
      localStorage.setItem("sentinel_dark_mode", "false");
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
      return;
    }

    const saved = localStorage.getItem("sentinel_dark_mode");
    setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("sentinel_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("sentinel_dark_mode", "false");
    }
  }, [darkMode]);

  return (
    <div className="sentinel-modern-shell flex min-h-dvh flex-col text-slate-900 dark:text-slate-100 transition-colors">
      <ToastContainer />
      <header className="sticky top-0 z-[900] w-full overflow-visible border-b border-white/10 bg-[linear-gradient(135deg,#0B1320_0%,#102A43_52%,#0B1320_100%)] px-3 py-2 shadow-lg shadow-slate-950/10 backdrop-blur-xl sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <Link
            href={showAppNav ? "/command-center" : "/"}
            className="flex min-w-0 items-center gap-3"
          >
            <img
              src={BRAND_HEADER_LOGO}
              alt={`${APP_NAME} powered by ${AI_ENGINE_NAME}`}
              className="h-12 w-auto max-w-[280px] object-contain sm:h-14 sm:max-w-[340px] lg:h-16 lg:max-w-[390px]"
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
                        "rounded-full px-4 py-2 text-sm font-black tracking-tight transition",
                        active
                          ? "bg-[#1D72B8] text-[#F4F6F8] shadow-md shadow-blue-900/20"
                          : "text-[#D1D5DB] hover:bg-white/10 hover:text-[#E2E6EA]",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center gap-4">
                {!isOnline && (
                  <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 ring-1 ring-orange-500/20" title="Offline Mode: Using local HazLenz AI Brain">
                    <WifiOff className="h-3.5 w-3.5 text-orange-700" />
                    <span className="text-xs font-black text-orange-800 hidden sm:inline-block">Offline</span>
                  </div>
                )}
                {isOnline && (
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/20 hidden lg:flex" title="Connected">
                    <Wifi className="h-3.5 w-3.5 text-emerald-700" />
                    <span className="text-xs font-black text-emerald-800">Live</span>
                  </div>
                )}

                <div className="relative z-[950] overflow-visible">
                  <button
                    ref={profileButtonRef}
                    type="button"
                    onClick={() => setProfileOpen((open) => !open)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F4FF] text-xs font-black text-[#102A43] ring-2 ring-blue-100 transition hover:bg-white active:scale-95 sm:h-12 sm:w-12 sm:text-sm"
                    aria-label="Open profile menu"
                  >
                    CM
                  </button>

                  {profileOpen && portalMounted &&
                    createPortal(
                      <div
                        ref={profileMenuRef}
                        className="fixed right-3 top-[72px] z-[2147483647] w-56 overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(180deg,#F0F8FF_0%,#FFFFFF_45%,#F8FAFC_100%)] dark:border-slate-800 dark:bg-[linear-gradient(180deg,#102A43_0%,#0F172A_55%,#020617_100%)] shadow-2xl shadow-slate-950/30 sm:right-4 sm:top-[82px]"
                      >
                      <button
                        type="button"
                        onClick={() => setDarkMode(!darkMode)}
                        className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-[#E8F4FF] dark:hover:bg-slate-800 transition-colors"
                      >
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </button>

                      {isPinRequired() && (
                        <button
                          type="button"
                          onClick={() => {
                            lockSession();
                            setProfileOpen(false);
                            router.push("/unlock");
                          }}
                          className="block w-full min-h-[48px] px-4 py-4 text-left text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-[#E8F4FF] dark:hover:bg-slate-800 transition-colors"
                        >
                          Lock App
                        </button>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-4 min-h-[48px] text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-[#E8F4FF] dark:hover:bg-slate-800 transition-colors"
                      >
                        User Profile
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-4 min-h-[48px] text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-[#E8F4FF] dark:hover:bg-slate-800 transition-colors"
                      >
                        Settings
                      </Link>

                      <Link
                        href="/about"
                        onClick={() => setProfileOpen(false)}
                        className="block border-t border-slate-100 px-4 py-3 min-h-[44px] text-sm font-black text-[#102A43] dark:border-slate-800 dark:text-slate-200 hover:bg-[#E8F4FF] dark:hover:bg-slate-800 transition-colors"
                      >
                        About
                      </Link>

                      <Link
                        href="/legal"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 min-h-[44px] text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-[#E8F4FF] dark:hover:bg-slate-800 transition-colors"
                      >
                        Legal
                      </Link>

                      <Link
                        href="/safescope"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 min-h-[44px] text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-[#E8F4FF] dark:hover:bg-slate-800 transition-colors"
                      >
                        HazLenz AI
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          clearAuthSession();
                          window.location.href = "/login";
                        }}
                        className="block w-full min-h-[48px] border-t border-blue-100 px-4 py-4 text-left text-sm font-black text-red-600 hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-900/20 transition-colors"
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
        className={`sentinel-app-main mx-auto w-full max-w-[1200px] flex-1 px-3 pt-3 sm:px-5 sm:pt-5 md:px-6 md:pt-6 ${showAppNav ? "" : "pb-4 sm:pb-6"}`}
      >
        {children}
      </main>
      {showPublicFooter && (
        <footer className="mt-auto w-full bg-[#0B1320] text-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-black">
              <Link href="/about" className="text-slate-200 transition hover:text-[#5DB7FF]">
                About
              </Link>
              <Link href="/legal" className="text-slate-200 transition hover:text-[#5DB7FF]">
                Legal
              </Link>
              <Link href="/safescope" className="text-slate-200 transition hover:text-[#5DB7FF]">
                HazLenz AI
              </Link>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4 text-center">
              <p className="text-xs font-semibold leading-5 text-slate-400">
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
