import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  id: string;
  message: string;
  type: ToastType;
}

class ToastManager {
  private listeners: Set<(toasts: ToastOptions[]) => void> = new Set();
  private toasts: ToastOptions[] = [];

  subscribe(listener: (toasts: ToastOptions[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.toasts));
  }

  show(message: string, type: ToastType = 'info') {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts = [...this.toasts, { id, message, type }];
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const toastManager = new ToastManager();

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return { toasts, toast: toastManager };
}
