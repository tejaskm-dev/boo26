"use client";

export type Toast = { id: number; label?: string; message: string };
type ToastListener = (toast: Toast) => void;

const listeners = new Set<ToastListener>();
let seq = 0;

/** Shows a toast. The one <Toaster /> in the layout is what draws it. */
export function toast(message: string, label?: string) {
  const next = { id: ++seq, label, message };
  for (const fn of listeners) fn(next);
}

/**
 * For anything announced but not live yet — the community channels, the
 * guidelines, the newsletter. Says so in place instead of sending the visitor
 * to a placeholder URL.
 */
export function comingSoon(what?: string) {
  toast("Coming soon", what);
}

export function subscribeToast(fn: ToastListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
