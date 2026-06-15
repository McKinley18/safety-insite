"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import {
  getAutoLockMinutes,
  hasPinSet,
  setPin,
  unlockSession,
  verifyPin,
} from "@/lib/pinSecurity";

export default function UnlockPage() {
  const router = useRouter();
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [status, setStatus] = useState("");

  const pinExists = typeof window !== "undefined" ? hasPinSet() : false;

  async function submit() {
    setStatus("");

    if (!/^\d{4,6}$/.test(pin)) {
      setStatus("Enter a 4 to 6 digit PIN.");
      return;
    }

    if (!pinExists) {
      if (pin !== confirmPin) {
        setStatus("PIN entries do not match.");
        return;
      }

      await setPin(pin);
      unlockSession(getAutoLockMinutes());
      router.push("/command-center");
      return;
    }

    const valid = await verifyPin(pin);

    if (!valid) {
      setStatus("Incorrect PIN.");
      return;
    }

    unlockSession(getAutoLockMinutes());
    router.push("/command-center");
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <PageHeader
        eyebrow="Protected Mode"
        title={pinExists ? "Unlock SightSignal" : "Create Local PIN"}
        description={
          pinExists
            ? "Enter your PIN to unlock encrypted local inspection reports on this device."
            : "Create a PIN to protect encrypted local inspection reports on this device."
        }
      />

      <AppPanel variant="dark" padding="md" className="rounded-[24px] p-5 sm:p-5">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[1px] text-[#F97316]">
          Local Security
        </p>

        <label className="block">
          <span className="text-sm font-black text-white">PIN</span>
          <AppInput
            value={pin}
            onChange={(event) => setPinValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            type="password"
            className="mt-2 border-white/10 text-center text-xl font-black tracking-[8px] focus:border-white/10"
          />
        </label>

        {!pinExists && (
          <label className="mt-4 block">
            <span className="text-sm font-black text-white">Confirm PIN</span>
            <AppInput
              value={confirmPin}
              onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              type="password"
              className="mt-2 border-white/10 text-center text-xl font-black tracking-[8px] focus:border-white/10"
            />
          </label>
        )}

        <AppButton
          type="button"
          onClick={submit}
          fullWidth
          size="lg"
          className="mt-5 bg-[#1D72B8] hover:bg-[#1D72B8]"
        >
          {pinExists ? "Unlock" : "Create PIN"}
        </AppButton>

        {status && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
            {status}
          </p>
        )}
      </AppPanel>
    </section>
  );
}
