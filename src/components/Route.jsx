import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks";

// Horizontal centers of the main line and the branch, in px from the
// route's left edge. They match the dot positions in App.css.
const MAIN_X = 5.5;
const BRANCH_X = 27.5;
const CURVE = 30;

/**
 * Career as a rail line. As the reader scrolls, a small train runs down the
 * track and each stop lights up once it has been passed. When it reaches the
 * last stop it docks: the train settles into the terminus and a buffer stop
 * appears.
 *
 * Stops with a `lane` form a loop: "branch" stops sit on a parallel line
 * that splits off the main line and rejoins it, while "main" stops in the
 * same stretch stay on the main line beside it (e.g. internships during
 * college).
 */
export default function Route({ stops }) {
  const ref = useRef(null);
  const branchRef = useRef(null);
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

    // Lay the branch: split off below the stop before the loop, run parallel
    // past every stop in it, and rejoin above the stop after it.
    const layBranch = () => {
      const svg = branchRef.current;
      const looped = stopsEls.filter((stop) => stop.dataset.lane);
      const start = stopsEls.indexOf(looped[0]);
      const end = stopsEls.indexOf(looped[looped.length - 1]);
      const before = stopsEls[start - 1];
      const after = stopsEls[end + 1];
      if (!svg || !looped.length || !before || !after) return null;

      const split = Math.max(centerOf(before) + 16, centerOf(looped[0]) - CURVE - 22);
      const join = Math.min(centerOf(after) - 16, centerOf(looped[looped.length - 1]) + CURVE + 22);
      const bend = CURVE / 2;
      const d = [
        `M ${MAIN_X} ${split}`,
        `C ${MAIN_X} ${split + bend}, ${BRANCH_X} ${split + bend}, ${BRANCH_X} ${split + CURVE}`,
        `L ${BRANCH_X} ${join - CURVE}`,
        `C ${BRANCH_X} ${join - bend}, ${MAIN_X} ${join - bend}, ${MAIN_X} ${join}`
      ].join(" ");

      svg.setAttribute("height", list.offsetHeight);
      svg.querySelectorAll("path").forEach((path) => path.setAttribute("d", d));
      return { split, join };
    };

    // Fill the branch as far as the train has travelled alongside it.
    const fillBranch = (branch, head) => {
      const fill = branchRef.current?.querySelector(".route__branch-fill");
      if (!branch || !fill) return;
      const share = Math.min(1, Math.max(0, (head - branch.split) / (branch.join - branch.split)));
      fill.style.strokeDashoffset = String(1 - share);
    };

    if (reduced) {
      layTrack();
      fillBranch(layBranch(), Infinity);
      list.style.setProperty("--progress", "1");
      list.dataset.arrived = "true";
      stopsEls.forEach((stop) => (stop.dataset.passed = "true"));
      return undefined;
    }

    let frame = null;

    const update = () => {
      frame = null;
      const { first, length } = layTrack();
      const branch = layBranch();
      const top = list.getBoundingClientRect().top + first;
      const anchor = window.innerHeight * 0.62;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const progress = atBottom
        ? 1
        : Math.min(1, Math.max(0, (anchor - top) / Math.max(length, 1)));
      const head = first + progress * length;
      list.style.setProperty("--progress", progress.toFixed(4));
      fillBranch(branch, head);
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
      <svg className="route__branch" ref={branchRef} width="40" height="0" aria-hidden="true">
        <path className="route__branch-base" pathLength="1" />
        <path className="route__branch-fill" pathLength="1" />
      </svg>
      <ol className="route__stops">
        {stops.map((stop, index) => {
          const isLast = index === stops.length - 1;

          return (
            <li
              key={`${stop.place}-${stop.when}`}
              className="stop"
              data-current={stop.current ? "true" : "false"}
            data-lane={stop.lane}
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
                      First stop
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
