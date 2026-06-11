"use client";

import { useToast, toastManager } from '@/hooks/useToast';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none md:bottom-8 md:right-8 lg:bottom-10 lg:right-10">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={twMerge(
            clsx(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-900/5 transition-all animate-in slide-in-from-bottom-5 fade-in-20 duration-300",
              {
                "border-l-4 border-l-green-500": toast.type === "success",
                "border-l-4 border-l-red-500": toast.type === "error",
                "border-l-4 border-l-blue-500": toast.type === "info",
              }
            )
          )}
        >
          <div className="flex-shrink-0">
            {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {toast.type === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            {toast.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-semibold text-slate-800">{toast.message}</p>
          </div>
          <button
            onClick={() => toastManager.remove(toast.id)}
            className="flex-shrink-0 ml-4 inline-flex text-slate-400 hover:text-slate-500 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
