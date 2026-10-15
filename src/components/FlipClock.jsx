import { useState } from "react";
import { useNewYorkTime } from "../hooks";

function FlipDigit({ value }) {
  const [shown, setShown] = useState(value);
  const [previous, setPrevious] = useState(value);

  // Adjust state during render when the digit changes, so the flap
  // animation starts from the old face without a flash of the new one.
  if (value !== shown) {
    setPrevious(shown);
    setShown(value);
  }

  const flipping = previous !== shown;

  return (
    <span className="flip" aria-hidden="true">
      <span className="flip__half flip__half--top">
        <span>{shown}</span>
      </span>
      <span className="flip__half flip__half--bottom">
        <span>{previous}</span>
      </span>
      {flipping ? (
        <>
          <span key={`top-${shown}`} className="flip__half flip__half--top flip__flap-top">
            <span>{previous}</span>
          </span>
          <span
            key={`bottom-${shown}`}
            className="flip__half flip__half--bottom flip__flap-bottom"
            onAnimationEnd={() => setPrevious(shown)}
          >
            <span>{shown}</span>
          </span>
        </>
      ) : null}
    </span>
  );
}

export default function FlipClock() {
  const time = useNewYorkTime();
  const [hours, minutes] = time.split(":");

  return (
    <time className="clock" aria-label={`${time} in New York`}>
      <FlipDigit value={hours[0]} />
      <FlipDigit value={hours[1]} />
      <span className="clock__colon" aria-hidden="true">:</span>
      <FlipDigit value={minutes[0]} />
      <FlipDigit value={minutes[1]} />
    </time>
  );
}
