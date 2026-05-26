"use client";

const DISABLE_AUTH_FOR_LOCAL_DEV = process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";

import Link from "next/link";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  getAutoLockMinutes,
  getProtectedModeLabel,
  hasPinSet,
  isPinRequired,
  isSessionUnlocked,
  lockSession,
} from "@/lib/pinSecurity";
import { downloadSafeScopeBrainBundle } from "@/lib/safescopeBrainBundle";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/create-account",
  "/forgot-password",
  "/reset-password",
  "/unlock",
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

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const [securityLabel, setSecurityLabel] = useState("Standard Mode");

  const isPublicPage = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

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

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-slate-900">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B1320]/95 px-4 py-3 shadow-lg shadow-slate-950/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <Link
            href={isPublicPage ? "/" : "/command-center"}
            className="flex min-w-0 items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="Sentinel Safety"
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          {!isPublicPage && (
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

              <div className="flex shrink-0 items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((open) => !open)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F4FF] text-xs font-black text-[#102A43] ring-1 ring-blue-100 transition hover:bg-white"
                    aria-label="Open profile menu"
                  >
                    CM
                  </button>

                  {profileOpen && (
                    <div
                      ref={profileMenuRef}
                      className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                    >
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-xs font-black text-[#AEB6C2]">
                          {securityLabel}
                        </p>
                      </div>

                      {isPinRequired() && (
                        <button
                          type="button"
                          onClick={() => {
                            lockSession();
                            setProfileOpen(false);
                            router.push("/unlock");
                          }}
                          className="block w-full px-4 py-3 text-left text-sm font-black text-[#102A43] hover:bg-slate-50"
                        >
                          Lock App
                        </button>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-4 text-sm font-black text-[#102A43] hover:bg-slate-50"
                      >
                        User Profile
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-4 text-sm font-black text-[#102A43] hover:bg-slate-50"
                      >
                        Settings
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          window.localStorage.removeItem("token");
                          window.localStorage.removeItem("sentinel_auth_token");
                          window.localStorage.removeItem("sentinel_auth_user");
                          window.location.href = "/login";
                        }}
                        className="block w-full px-4 py-4 text-left text-sm font-black text-red-700 hover:bg-red-50"
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
        className={`mx-auto w-full max-w-[1200px] flex-1 px-4 pt-5 sm:px-6 md:pt-7 ${isPublicPage ? "pb-6" : "pb-44 lg:pb-10"}`}
      >
        {children}
      </main>

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

      {!isPublicPage && <MobileTabBar />}
    </div>
  );
}
