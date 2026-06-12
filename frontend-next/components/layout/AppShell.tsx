"use client";

const DISABLE_AUTH_FOR_LOCAL_DEV = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

import Link from "next/link";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { ToastContainer } from "@/components/ui/Toast";
import { Wifi, WifiOff, Moon, Sun } from "lucide-react";
import {
  getAutoLockMinutes,
  getProtectedModeLabel,
  hasPinSet,
  isPinRequired,
  isSessionUnlocked,
  lockSession,
} from "@/lib/pinSecurity";
import { downloadSafeScopeBrainBundle } from "@/lib/safescopeBrainBundle";
import { getStoredPlanCode, type PlanCode } from "@/lib/planEntitlements";

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

const publicNavItems = [
  { href: "/about", label: "About" },
  { href: "/legal", label: "Legal" },
  { href: "/safescope", label: "SafeScope" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Create Account" },
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
  const [hasAuthSession, setHasAuthSession] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
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

  const isPublicPage = isAuthPublicPage || (isMarketingPage && !hasAuthSession);
  const showPublicMarketingNav = isMarketingPage && !hasAuthSession;
  const showAppNav = !isPublicPage;

  // Public/auth/marketing pages show the marketing footer.
  // Signed-in app pages use app navigation only.
  const showPublicFooter = isPublicPage;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      window.localStorage.getItem("sentinel_auth_token") ||
      window.localStorage.getItem("token");

    setHasAuthSession(Boolean(token) || DISABLE_AUTH_FOR_LOCAL_DEV);
    setPlanCode(getStoredPlanCode());
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!profileOpen) return;

      const target = event.target as Node;

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setSecurityLabel(getProtectedModeLabel());

    if (DISABLE_AUTH_FOR_LOCAL_DEV || isPublicPage || pathname === "/unlock") return;

    const token =
      window.localStorage.getItem("sentinel_auth_token") ||
      window.localStorage.getItem("token");

    if (!token) {
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
    const saved = localStorage.getItem("sentinel_dark_mode");
    if (saved === "false") {
      setDarkMode(false);
    }
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
    <div className="flex min-h-screen flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors">
      <ToastContainer />
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B1320] px-4 py-3 shadow-lg shadow-slate-950/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <Link
            href={showAppNav ? "/command-center" : "/"}
            className="flex min-w-0 items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="Sentinel Safety"
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          {showPublicMarketingNav && (
            <nav className="flex flex-wrap items-center justify-end gap-2">
              {publicNavItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "rounded-full px-3 py-2 text-xs font-black tracking-tight transition sm:px-4 sm:text-sm",
                      active
                        ? "bg-[#1D72B8] text-[#F4F6F8] shadow-md shadow-blue-900/20"
                        : "text-[#B8C0CC] hover:bg-white/10 hover:text-[#E2E6EA]",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

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
                          : "text-[#B8C0CC] hover:bg-white/10 hover:text-[#E2E6EA]",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center gap-4">
                {!isOnline && (
                  <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 ring-1 ring-orange-500/20" title="Offline Mode: Using local SafeScope AI Brain">
                    <WifiOff className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-xs font-black text-orange-400 hidden sm:inline-block">Offline</span>
                  </div>
                )}
                {isOnline && (
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/20 hidden lg:flex" title="Connected">
                    <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400">Live</span>
                  </div>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((open) => !open)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F4FF] text-sm font-black text-[#102A43] ring-2 ring-blue-100 transition hover:bg-white active:scale-95"
                    aria-label="Open profile menu"
                  >
                    CM
                  </button>

                  {profileOpen && (
                    <div
                      ref={profileMenuRef}
                      className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xl"
                    >
                      <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20">
                        <p className="text-xs font-black text-[#AEB6C2]">
                          {securityLabel}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {planCode === "company" ? (
                            <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-blue-500 dark:text-sky-400">
                              Company Tier
                            </span>
                          ) : planCode === "pro" || planCode === "plus" ? (
                            <span className="rounded bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-orange-500 dark:text-orange-400">
                              Pro Tier
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-slate-500/10 border border-slate-500/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                Basic Tier
                              </span>
                              <Link
                                href="/settings"
                                className="text-[10px] font-black text-[#1D72B8] hover:underline"
                                onClick={() => setProfileOpen(false)}
                              >
                                Upgrade
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDarkMode(!darkMode)}
                        className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
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
                          className="block w-full min-h-[48px] px-4 py-4 text-left text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Lock App
                        </button>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-4 min-h-[48px] text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        User Profile
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-4 min-h-[48px] text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Settings
                      </Link>

                      <Link
                        href="/about"
                        onClick={() => setProfileOpen(false)}
                        className="block border-t border-slate-100 px-4 py-3 min-h-[44px] text-sm font-black text-[#102A43] dark:border-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        About
                      </Link>

                      <Link
                        href="/legal"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 min-h-[44px] text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Legal
                      </Link>

                      <Link
                        href="/safescope"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-3 min-h-[44px] text-sm font-black text-[#102A43] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        SafeScope
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          window.localStorage.removeItem("token");
                          window.localStorage.removeItem("sentinel_auth_token");
                          window.localStorage.removeItem("sentinel_auth_user");
                          window.location.href = "/login";
                        }}
                        className="block w-full min-h-[48px] px-4 py-4 text-left text-sm font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <main
        className={`mx-auto w-full max-w-[1200px] flex-1 px-4 pt-5 sm:px-6 md:pt-7 ${showAppNav ? "pb-52 lg:pb-10" : "pb-6"}`}
      >
        {children}
      </main>

      {showPublicFooter && (
      <footer className="mt-auto w-full border-t border-slate-800 bg-[#0F172A]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 px-5 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              style={{ color: "#FFFFFF" }}
              className="text-sm font-black !text-white hover:opacity-80"
            >
              About
            </Link>

            <span className="h-4 w-px bg-[#6F7782]" />

            <Link
              href="/legal"
              style={{ color: "#FFFFFF" }}
              className="text-sm font-black !text-white hover:opacity-80"
            >
              Legal
            </Link>

            <span className="h-4 w-px bg-[#6F7782]" />

            <Link
              href="/safescope"
              style={{ color: "#FFFFFF" }}
              className="text-sm font-black !text-white hover:opacity-80"
            >
              SafeScope
              <span className="ml-[1px] align-super text-[9px]">TM</span>
            </Link>
          </div>

          <p className="m-0 text-center text-[13px] !text-white/80">
            © {new Date().getFullYear()} Sentinel Safety. All rights reserved.
          </p>
        </div>
      </footer>
      )}

      {showAppNav && <MobileTabBar />}
    </div>
  );
}
