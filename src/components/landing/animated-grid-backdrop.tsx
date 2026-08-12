"use client";

import { useEffect, useId, useState } from "react";

const CELL = 44;
const COLS = 34;
const ROWS = 17;
const SQUARE_COUNT = 26;
const RESHUFFLE_MS = 5000;

type Square = {
  key: string;
  x: number;
  y: number;
  delay: string;
  duration: string;
};

function generateSquares(seed: number): Square[] {
  return Array.from({ length: SQUARE_COUNT }, (_, i) => ({
    key: `sq-${i}-${seed}`,
    x: Math.floor(Math.random() * COLS) * CELL + 1,
    y: Math.floor(Math.random() * ROWS) * CELL + 1,
    delay: `${(Math.random() * 4).toFixed(2)}s`,
    duration: `${(3 + Math.random() * 3).toFixed(2)}s`,
  }));
}

export function AnimatedGridBackdrop() {
  const patternId = useId();
  // Squares are random, so they're generated after mount — rendering them on the
  // server would produce different markup than the client's first paint.
  const [squares, setSquares] = useState<Square[]>([]);

  useEffect(() => {
    const shuffle = () => setSquares(generateSquares(Date.now()));
    // Deferred rather than called inline so the first paint isn't a cascading
    // render; the squares land on the next tick.
    const initial = setTimeout(shuffle, 0);
    const timer = setInterval(shuffle, RESHUFFLE_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[820px] overflow-hidden [mask-image:radial-gradient(620px_circle_at_50%_26%,#000_0%,transparent_100%)]"
    >
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0 text-[var(--gray-200)]"
      >
        <defs>
          <pattern
            id={patternId}
            width={CELL}
            height={CELL}
            patternUnits="userSpaceOnUse"
            x={-1}
            y={-1}
          >
            <path
              d={`M ${CELL} 0 L 0 0 0 ${CELL}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        <svg x={-1} y={-1} width="100%" height="100%" overflow="visible">
          {squares.map((s) => (
            <rect
              key={s.key}
              x={s.x}
              y={s.y}
              width={CELL - 1}
              height={CELL - 1}
              fill="currentColor"
              strokeWidth={0}
              opacity={0}
              style={{
                animation: `grid-square-fade ${s.duration} ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}
        </svg>
      </svg>
    </div>
  );
}
