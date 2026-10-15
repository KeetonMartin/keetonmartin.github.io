import { useLayoutEffect, useRef } from "react";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const LOWER = "abcdefghijklmnopqrstuvwxyz0123456789";
const FLAP_MS = 80;

// Cheap deterministic noise so each character cycles through its own
// sequence of glyphs, the way a split-flap drum would.
const glyphFor = (char, index, tick) => {
  const set = char === char.toLowerCase() && char !== char.toUpperCase() ? LOWER : UPPER;
  const n = Math.abs(Math.sin(index * 12.9898 + tick * 78.233) * 43758.5453);
  return set[Math.floor((n % 1) * set.length)];
};

/**
 * Text that settles into place like a split-flap departure board.
 * Characters appear left to right, flicker through a few glyphs, then land.
 * Word lengths never change mid-animation, so wrapping stays stable.
 */
export default function FlapText({ text, go, animate, delay = 0, stagger = 28, className }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (!animate) {
      node.textContent = text;
      node.dataset.state = "settled";
      return undefined;
    }

    if (!go) {
      node.textContent = text;
      node.dataset.state = "waiting";
      return undefined;
    }

    const chars = [...text];
    const settleAt = chars.map(
      (_, i) => i * stagger + 320 + ((Math.sin(i * 4.1) + 1) / 2) * 360
    );
    const end = Math.max(0, ...settleAt);
    let start = null;
    let frame;

    const step = (now) => {
      if (start === null) start = now + delay;
      const t = now - start;

      if (t >= 0) {
        node.dataset.state = "flapping";
        const tick = Math.floor(t / FLAP_MS);
        let out = "";
        for (let i = 0; i < chars.length; i += 1) {
          const c = chars[i];
          if (c === " " || t >= settleAt[i]) out += c;
          else if (t < i * stagger * 0.6) out += " ";
          else out += /[\p{L}\p{N}]/u.test(c) ? glyphFor(c, i, tick) : c;
        }
        node.textContent = out;
      }

      if (t < end) {
        frame = requestAnimationFrame(step);
      } else {
        node.textContent = text;
        node.dataset.state = "settled";
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text, go, animate, delay, stagger]);

  return <span ref={ref} className={className} data-state="waiting" />;
}
