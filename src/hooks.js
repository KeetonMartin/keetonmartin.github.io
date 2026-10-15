import { useEffect, useState } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const matches = (query) =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matches(REDUCED_QUERY));

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const query = window.matchMedia(REDUCED_QUERY);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function useCanHover() {
  const [canHover] = useState(() => matches("(hover: hover) and (pointer: fine)"));
  return canHover;
}

// Flips to true once the element has scrolled into view, and stays true.
export function useSeen(ref, threshold = 0.2) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, seen, threshold]);

  return seen;
}

const NY_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
});

export function useNewYorkTime() {
  const [time, setTime] = useState(() => NY_TIME.format(new Date()));

  useEffect(() => {
    const id = setInterval(() => setTime(NY_TIME.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
