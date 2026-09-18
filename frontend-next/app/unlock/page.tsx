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
      {/*
        * §319 (CM-3). THE PIN DOES NOT GATE DECRYPTION, AND THE OLD COPY SAID IT DID.
        *
        * §318 traced the mechanism. The encryption is REAL: AES-GCM through `crypto.subtle` in
        * `lib/encryption.ts`. But `getDeviceKey()` generates 32 random bytes and writes them
        * base64 IN CLEARTEXT to `localStorage`, in the same origin store as the ciphertext; and
        * `lib/pinSecurity.ts` stores a salted SHA-256 of the PIN in that same store and compares
        * it client-side. It never touches the key. So anyone holding the device holds both halves
        * and can clear the PIN hash.
        *
        * "Create a PIN to protect encrypted local inspection reports" invited a reader to conclude
        * that the PIN was what stood between an intruder and the reports. It was not.
        *
        * THE COPY IS CORRECTED RATHER THAN THE MECHANISM REBUILT, per §319's direction: deriving
        * the key from the PIN is a real cryptographic change with a consequence — a forgotten PIN
        * would then mean permanently unrecoverable local reports — and that is a product decision,
        * not a wording fix. CM-3 stays open for that decision; what closes here is the claim.
        *
        * What is said instead is exactly what is true: the lock is on this device, the reports are
        * stored encrypted at rest, and the key is held on the device too.
        */}
      <PageHeader
        eyebrow="Protected Mode"
        title={pinExists ? "Unlock Safety InSite" : "Create Local PIN"}
        description={
          pinExists
            ? "Enter your PIN to unlock this device's local inspection reports."
            : "Add a PIN lock for local inspection reports on this device."
        }
      />

      <AppPanel variant="dark" padding="md" className="rounded-[24px] p-5 sm:p-5">
        <p className="mb-2 text-[11px] font-black uppercase tracking-[1px] text-[#C2410C] dark:text-[#F97316]">
          Local Security
        </p>

        {/*
          * §319 (CM-3). The boundary, stated where the control is, rather than left for the reader
          * to infer. Deliberately not hedged into meaninglessness: at-rest encryption is real and
          * worth saying, and so is the fact that the key lives on the same device.
          */}
        <p className="mb-4 text-xs font-semibold leading-5 text-slate-200">
          This PIN is a lock screen for this device. Local reports are stored encrypted on the
          device, and the key is held on the device too — so the PIN keeps a passer-by out of the
          app, and it is not protection against someone who has the device itself. Your inspections
          on your Safety InSite account are not affected by this PIN.
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
