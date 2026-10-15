import { useEffect, useRef, useState } from "react";
import FlapText from "./FlapText";
import FlipClock from "./FlipClock";
import { useCanHover, useReducedMotion, useSeen } from "../hooks";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const imagePath = (file) => `${BASE}/images/projects/${file}`;
const pad = (n) => String(n).padStart(2, "0");

const PREVIEW_WIDTH = 300;
const PREVIEW_GAP = 28;

// A screenshot that trails the cursor while a row is hovered.
function Preview({ projects, active, reduced }) {
  const ref = useRef(null);

  useEffect(() => {
    const target = { x: 0, y: 0 };
    let pos = null;
    let frame;

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!pos) pos = { ...target };
    };

    const loop = () => {
      const node = ref.current;
      if (node && pos) {
        const ease = reduced ? 1 : 0.16;
        pos.x += (target.x - pos.x) * ease;
        pos.y += (target.y - pos.y) * ease;
        const flip = pos.x + PREVIEW_GAP + PREVIEW_WIDTH > window.innerWidth - 16;
        const x = flip ? pos.x - PREVIEW_GAP - PREVIEW_WIDTH : pos.x + PREVIEW_GAP;
        const y = Math.min(pos.y - 40, window.innerHeight - node.offsetHeight - 16);
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div ref={ref} className="preview" data-on={active ? "true" : "false"} aria-hidden="true">
      <div className="preview__frame">
        {projects.map((project) => (
          <img
            key={project.title}
            src={imagePath(project.image)}
            alt=""
            data-active={active === project.title ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}

export default function Board({ projects, initialCount = 6 }) {
  const ref = useRef(null);
  const seen = useSeen(ref, 0.15);
  const reduced = useReducedMotion();
  const canHover = useCanHover();
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(null);

  // Scrolling moves rows out from under a still cursor without firing
  // pointerleave, so drop the preview rather than show a stale screenshot.
  useEffect(() => {
    if (!hovered) return undefined;
    const clear = () => setHovered(null);
    window.addEventListener("scroll", clear, { passive: true, once: true });
    return () => window.removeEventListener("scroll", clear);
  }, [hovered]);

  const rows = expanded ? projects : projects.slice(0, initialCount);
  const hiddenCount = projects.length - initialCount;
  const withImages = projects.filter((project) => project.image);

  return (
    <section className="board" ref={ref} aria-labelledby="departures">
      <header className="board__head">
        <div>
          <h2 id="departures" className="board__title">
            Departures
          </h2>
          <p className="board__sub">Projects I&rsquo;ve built</p>
        </div>
        <FlipClock />
      </header>

      <div className="board__cols" aria-hidden="true">
        <span>No.</span>
        <span>Destination</span>
        <span className="board__cols-remark">Remarks</span>
        <span>Status</span>
      </div>

      <ol className="board__rows" id="board-rows">
        {rows.map((project, index) => {
          const batch = index < initialCount ? index : index - initialCount;
          const delay = batch * 160;

          return (
            <li key={project.title} className="board__row">
              <a
                href={project.url}
                className="board__link"
                onPointerEnter={() => setHovered(project.image ? project.title : null)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(null)}
              >
                <span className="board__no">{pad(index + 1)}</span>
                <FlapText
                  className="board__dest"
                  text={project.title}
                  go={seen}
                  animate={!reduced}
                  delay={delay}
                  stagger={40}
                />
                <FlapText
                  className="board__remark"
                  text={project.remark}
                  go={seen}
                  animate={!reduced}
                  delay={delay + 200}
                  stagger={9}
                />
                <span className="board__status" data-status={project.status.toLowerCase()}>
                  <span className="lamp" aria-hidden="true" />
                  <FlapText
                    text={project.status}
                    go={seen}
                    animate={!reduced}
                    delay={delay + 380}
                    stagger={45}
                  />
                </span>
              </a>
            </li>
          );
        })}
      </ol>

      {hiddenCount > 0 ? (
        <button
          type="button"
          className="board__more"
          aria-expanded={expanded}
          aria-controls="board-rows"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Fewer departures" : `${hiddenCount} more departures`}
          <span className="board__more-icon" aria-hidden="true" />
        </button>
      ) : null}

      {canHover ? <Preview projects={withImages} active={hovered} reduced={reduced} /> : null}
    </section>
  );
}
