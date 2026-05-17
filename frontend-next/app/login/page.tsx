"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/safescope";
import { apiFetch } from "@/lib/apiFetch";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setStatusType("idle");
      setStatus("Signing in — waking secure workspace...");

      const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        setStatusType("error");
        setStatus("Sign in failed. Check your email and password.");
        return;
      }

      const data = await response.json();

      if (data.token) {
        window.localStorage.setItem("sentinel_auth_token", data.token);
        window.localStorage.setItem("token", data.token);

        if (data.user) {
          window.localStorage.setItem("sentinel_auth_user", JSON.stringify(data.user));
        }
      }

      if (data.user) {
        window.localStorage.setItem("sentinel_auth_user", JSON.stringify(data.user));
      }

      setStatusType("success");
      setStatus("Signed in successfully.");
      router.push("/command-center");
    } catch {
      setStatusType("error");
      setStatus("Server is waking up. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[28px] bg-[#0B1320] p-6 text-white shadow-xl shadow-slate-300/40">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-200">
          Sentinel Safety
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Welcome back to your command center.
        </h1>
        <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
          Access inspections, reports, corrective actions, and SafeScope intelligence from your secure workspace.
        </p>

        <div className="mt-6 space-y-3 text-sm font-bold text-slate-200">
          <p>✓ Protected workspace access</p>
          <p>✓ Audit-ready safety records</p>
          <p>✓ Operational risk intelligence</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">Sign In</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Access your Sentinel Safety workspace.
        </p>

        <div className="mt-5 space-y-3">
          <input
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold outline-none focus:border-[#1D72B8]"
          />

          <div className="relative">
            <input
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-sm font-bold outline-none focus:border-[#1D72B8]"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#1D72B8]">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" disabled={loading} className="block w-full rounded-xl bg-[#102A43] px-5 py-3 text-center text-sm font-black text-white disabled:opacity-60">
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Link href="/register" className="text-sm font-black text-[#1D72B8] hover:underline">
              Create an Account
            </Link>

            <Link href="/forgot-password" className="text-sm font-black text-slate-500 hover:text-[#1D72B8] hover:underline">
              Forgot Password?
            </Link>
          </div>

          {status && (
            <p className={`rounded-xl p-3 text-sm font-bold ${
              statusType === "error" ? "bg-red-50 text-red-700" :
              statusType === "success" ? "bg-emerald-50 text-emerald-700" :
              "bg-slate-50 text-slate-600"
            }`}>
              {status}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
