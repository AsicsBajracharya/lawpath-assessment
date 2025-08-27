"use client";

import { useEffect, useState, useCallback, useRef } from "react";

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
  const isInitializedRef = useRef(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (isInitializedRef.current) return; // Prevent re-initialization
    
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
    isInitializedRef.current = true;
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

  // Memoize the setter function to prevent infinite loops
  const stableSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prevValue) => {
      // If newValue is a function, call it to get the actual new value
      const actualNewValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prevValue) : newValue;
      
      // Compare JSON strings to prevent unnecessary updates
      if (JSON.stringify(prevValue) === JSON.stringify(actualNewValue)) {
        return prevValue; // Return same reference if values are identical
      }
      
      return actualNewValue;
    });
  }, []);

  return [value, stableSetValue] as const;
}
