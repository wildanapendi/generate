"use client";

import { useEffect, useRef } from "react";

/**
 * Debounced auto-save: when `value` changes, after `delay` ms of stillness
 * `onSave` is invoked. Re-firing the change resets the timer.
 *
 * Returns a `flush()` you can call to save immediately (e.g. on unload).
 */
export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<void> | void,
  options: {
    delay?: number;
    enabled?: boolean;
  } = {},
) {
  const { delay = 5000, enabled = true } = options;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value);
  const handler = useRef(onSave);

  // Keep refs current.
  useEffect(() => {
    latest.current = value;
  }, [value]);
  useEffect(() => {
    handler.current = onSave;
  });

  useEffect(() => {
    if (!enabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void handler.current(latest.current);
    }, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, delay, enabled]);

  function flush() {
    if (timer.current) clearTimeout(timer.current);
    return handler.current(latest.current);
  }

  return { flush };
}
