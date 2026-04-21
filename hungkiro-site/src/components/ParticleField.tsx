'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number; y: number; z: number;
  px: number; py: number;
}

const N     = 180;
const Z_MAX = 1600;
const FOV   = 320;
const SPEED = 4;

function mkStar(W: number, H: number): Star {
  const x = (Math.random() - 0.5) * W * 2.5;
  const y = (Math.random() - 0.5) * H * 2.5;
  const z = Math.random() * Z_MAX;
  const sx = (x / z) * FOV + W / 2;
  const sy = (y / z) * FOV + H / 2;
  return { x, y, z, px: sx, py: sy };
}

export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let stars: Star[] = [];
    let raf: number;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = Array.from({ length: N }, () => mkStar(W, H));
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.fillStyle = 'rgba(8,8,8,0.18)';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;

      for (const s of stars) {
        const t = 1 - s.z / Z_MAX;          // 0=far, 1=close
        const sx = (s.x / s.z) * FOV + cx;
        const sy = (s.y / s.z) * FOV + cy;

        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(210,210,210,${t * 0.55})`;
        ctx.lineWidth   = t * 1.6;
        ctx.stroke();

        s.px = sx;
        s.py = sy;
        s.z -= SPEED + t * 3;               // accelerate near viewer

        if (s.z < 1 || sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) {
          const n = mkStar(W, H);
          Object.assign(s, n);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.55 }}
    />
  );
}
