"use client";

import { useEffect, useRef, useCallback } from "react";

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActive || event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [isActive],
  );

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, handleKeyDown]);

  return containerRef;
}
