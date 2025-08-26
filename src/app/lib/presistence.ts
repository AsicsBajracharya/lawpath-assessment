"use client";

import { useEffect, useState } from "react";

const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = safe(() => {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    }, initial);

    setValue((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(stored)) {
        return stored;
      }
      return prev;
    });
    setIsHydrated(true);
  }, [key, initial]);

  // Save to localStorage when value changes (but not during initial hydration)
  useEffect(() => {
    if (isHydrated) {
      const currentStored = safe(() => {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }, null);

      // Only save if the value is actually different from what's stored
      if (JSON.stringify(currentStored) !== JSON.stringify(value)) {
        safe(
          () => localStorage.setItem(key, JSON.stringify(value)),
          undefined as any
        );
      }
    }
  }, [key, value, isHydrated]);

  return [value, setValue] as const;
}
