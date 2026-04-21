'use client';

import { useEffect, useRef } from 'react';

const CHARS = '01アイウエオカキクケコサシスセソタチツテトHUNGKIROhungkiro{}[]<>/\\|=+-_*&^%$#@!';
const FONT_SIZE = 13;

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cols = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      cols  = Math.floor(canvas.width / FONT_SIZE);
      drops = Array(cols).fill(0).map(() => Math.random() * -50);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.fillStyle = 'rgba(8,8,8,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const ch    = CHARS[Math.floor(Math.random() * CHARS.length)];
        const alpha = Math.random() * 0.6 + 0.1;
        ctx.fillStyle = `rgba(200,200,200,${alpha})`;
        ctx.fillText(ch, i * FONT_SIZE, drops[i] * FONT_SIZE);

        if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 55);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        opacity: 0.07,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
