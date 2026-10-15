import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks";

// Horizontal centers of the main line and the branch, in px from the
// route's left edge. They match the dot positions in App.css.
const MAIN_X = 5.5;
const BRANCH_X = 27.5;
const CURVE = 60;
const SAMPLES = 160;

/**
 * Career as a rail line. As the reader scrolls, a small train runs down the
 * track and each stop lights up once it has been passed. When it reaches the
 * last stop it docks: the train settles into the terminus and a buffer stop
 * appears.
 *
 * Consecutive stops with `lane: "branch"` sit on a parallel line that splits
 * off the main line below the stop before them and rejoins just above the
 * stop after them (e.g. internships taken during college).
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

    // Lay the branch: split off below the stop before the branch stops and
    // rejoin just above the stop after them. Curves shrink only if the gap
    // is too tight for a full-length easement.
    let laid = { d: null, lookup: null, total: 0 };

    const layBranch = () => {
      const svg = branchRef.current;
      const branched = stopsEls.filter((stop) => stop.dataset.lane === "branch");
      const before = stopsEls[stopsEls.indexOf(branched[0]) - 1];
      const after = stopsEls[stopsEls.indexOf(branched[branched.length - 1]) + 1];
      if (!svg || !branched.length || !before || !after) return null;

      const firstC = centerOf(branched[0]);
      const lastC = centerOf(branched[branched.length - 1]);
      const split = Math.max(centerOf(before) + 14, firstC - CURVE - 18);
      const splitCurve = Math.min(CURVE, firstC - 12 - split);
      const join = centerOf(after) - 14;
      const joinCurve = Math.min(CURVE, join - (lastC + 12));
      const d = [
        `M ${MAIN_X} ${split}`,
        `C ${MAIN_X} ${split + splitCurve / 2}, ${BRANCH_X} ${split + splitCurve / 2}, ${BRANCH_X} ${split + splitCurve}`,
        `L ${BRANCH_X} ${join - joinCurve}`,
        `C ${BRANCH_X} ${join - joinCurve / 2}, ${MAIN_X} ${join - joinCurve / 2}, ${MAIN_X} ${join}`
      ].join(" ");

      if (d !== laid.d) {
        svg.setAttribute("height", list.offsetHeight);
        const [base, fill] = svg.querySelectorAll("path");
        base.setAttribute("d", d);
        fill.setAttribute("d", d);
        // y only ever increases along the path, so a sampled table of
        // (y, length) lets the fill follow the curve's true length.
        const total = base.getTotalLength?.() ?? 0;
        const lookup = [];
        for (let i = 0; i <= SAMPLES; i += 1) {
          const at = (total * i) / SAMPLES;
          lookup.push([base.getPointAtLength?.(at)?.y ?? split, at]);
        }
        fill.style.strokeDasharray = `${total}`;
        laid = { d, lookup, total };
      }
      return laid;
    };

    // Fill the branch up to the train's height, measured along the path.
    const fillBranch = (branch, head) => {
      const fill = branchRef.current?.querySelector(".route__branch-fill");
      if (!branch || !fill || !branch.total) return;
      const { lookup, total } = branch;
      let length = 0;
      if (head >= lookup[lookup.length - 1][0]) length = total;
      else if (head > lookup[0][0]) {
        const i = lookup.findIndex(([y]) => y >= head);
        const [y0, l0] = lookup[i - 1];
        const [y1, l1] = lookup[i];
        length = l0 + ((head - y0) / Math.max(y1 - y0, 1e-6)) * (l1 - l0);
      }
      fill.style.strokeDashoffset = `${total - length}`;
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
        <path className="route__branch-base" />
        <path className="route__branch-fill" />
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
