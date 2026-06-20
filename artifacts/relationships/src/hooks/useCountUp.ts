import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up from 0 to `target` once the element
 * referenced by the returned ref scrolls into view. Accepts the original
 * display string (e.g. "200+", "7") and animates only the numeric part,
 * preserving any non-numeric prefix/suffix (e.g. "+", "%").
 */
export function useCountUp(value: string, duration = 1200) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(() => value.replace(/[0-9]/g, "0"));
  const hasAnimated = useRef(false);

  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (target === null) {
      setDisplay(value);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const start = performance.now();

            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(target * eased);
              setDisplay(`${current}${suffix}`);
              if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, suffix, duration, value]);

  return { ref, display };
}
