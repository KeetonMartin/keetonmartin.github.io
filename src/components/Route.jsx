import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks";

/**
 * Career as a rail line. As the reader scrolls, a small train runs down the
 * track and each stop lights up once it has been passed.
 */
export default function Route({ stops }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const list = ref.current;
    if (!list) return undefined;

    const dots = [...list.querySelectorAll(".stop")];

    if (reduced) {
      list.style.setProperty("--progress", "1");
      dots.forEach((dot) => (dot.dataset.passed = "true"));
      return undefined;
    }

    let frame = null;

    const update = () => {
      frame = null;
      const rect = list.getBoundingClientRect();
      const anchor = window.innerHeight * 0.62;
      const progress = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
      const head = progress * rect.height;
      list.style.setProperty("--progress", progress.toFixed(4));
      dots.forEach((dot) => {
        dot.dataset.passed = dot.offsetTop + 10 <= head ? "true" : "false";
      });
    };

    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div className="route" ref={ref}>
      <span className="route__track" aria-hidden="true">
        <span className="route__fill" />
        <span className="route__train" />
      </span>
      <ol className="route__stops">
        {stops.map((stop) => (
          <li
            key={`${stop.place}-${stop.when}`}
            className="stop"
            data-current={stop.current ? "true" : "false"}
            data-passed="false"
          >
            <span className="stop__dot" aria-hidden="true" />
            <div className="stop__head">
              <h3 className="stop__place">{stop.place}</h3>
              <span className="stop__when">{stop.when}</span>
            </div>
            <p className="stop__title">{stop.title}</p>
            {stop.note ? <p className="stop__note">{stop.note}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
