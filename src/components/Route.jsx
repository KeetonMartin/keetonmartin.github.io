import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks";

/**
 * Career as a rail line. As the reader scrolls, a small train runs down the
 * track and each stop lights up once it has been passed. When it reaches the
 * last stop it docks: the train settles into the terminus and a buffer stop
 * appears.
 */
export default function Route({ stops }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const list = ref.current;
    if (!list) return undefined;

    const stopsEls = [...list.querySelectorAll(".stop")];
    const centerOf = (stop) => {
      const dot = stop.querySelector(".stop__dot");
      return stop.offsetTop + dot.offsetTop + dot.offsetHeight / 2;
    };

    // The track runs from the first stop's dot to the last one's, so the
    // line terminates at the final stop instead of trailing past it.
    const layTrack = () => {
      const first = centerOf(stopsEls[0]);
      const last = centerOf(stopsEls[stopsEls.length - 1]);
      list.style.setProperty("--track-top", `${first}px`);
      list.style.setProperty("--track-length", `${last - first}px`);
      return { first, length: last - first };
    };

    if (reduced) {
      layTrack();
      list.style.setProperty("--progress", "1");
      list.dataset.arrived = "true";
      stopsEls.forEach((stop) => (stop.dataset.passed = "true"));
      return undefined;
    }

    let frame = null;

    const update = () => {
      frame = null;
      const { first, length } = layTrack();
      const top = list.getBoundingClientRect().top + first;
      const anchor = window.innerHeight * 0.62;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const progress = atBottom
        ? 1
        : Math.min(1, Math.max(0, (anchor - top) / Math.max(length, 1)));
      const head = first + progress * length;
      list.style.setProperty("--progress", progress.toFixed(4));
      // A little hysteresis so the arrival doesn't flicker at the boundary.
      if (progress >= 0.999) list.dataset.arrived = "true";
      else if (progress < 0.97) list.dataset.arrived = "false";
      stopsEls.forEach((stop) => {
        stop.dataset.passed = centerOf(stop) <= head + 1 ? "true" : "false";
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
  }, [reduced, stops]);

  return (
    <div className="route" ref={ref} data-arrived="false">
      <span className="route__track" aria-hidden="true">
        <span className="route__fill" />
        <span className="route__train" />
      </span>
      <ol className="route__stops">
        {stops.map((stop, index) => {
          const isLast = index === stops.length - 1;

          return (
            <li
              key={`${stop.place}-${stop.when}`}
              className="stop"
              data-current={stop.current ? "true" : "false"}
              data-passed="false"
              data-terminus={isLast ? "true" : "false"}
            >
              <span className="stop__dot" aria-hidden="true" />
              {isLast ? (
                <span className="stop__buffer" aria-hidden="true" />
              ) : null}
              <div className="stop__head">
                <h3 className="stop__place">
                  {stop.place}
                  {isLast ? (
                    <span className="stop__terminus" aria-hidden="true">
                      Terminus
                    </span>
                  ) : null}
                </h3>
                <span className="stop__when">{stop.when}</span>
              </div>
              <p className="stop__title">{stop.title}</p>
              {stop.note ? <p className="stop__note">{stop.note}</p> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
