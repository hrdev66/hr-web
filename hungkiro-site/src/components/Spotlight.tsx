'use client';

import { useEffect, useRef } from 'react';

export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const cur = useRef({ x: -9999, y: -9999 });
  const pos = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cur.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      pos.current.x = lerp(pos.current.x, cur.current.x, 0.07);
      pos.current.y = lerp(pos.current.y, cur.current.y, 0.07);

      if (ref.current) {
        const { x, y } = pos.current;
        ref.current.style.background = `
          radial-gradient(700px circle at ${x}px ${y}px,
            rgba(255,255,255,0.055) 0%,
            rgba(255,255,255,0.02)  30%,
            transparent             70%)
        `;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 6,
        transition: 'background 0.05s',
      }}
    />
  );
}
