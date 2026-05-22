"use client";

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; baseAlpha: number };

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const dotsRef = useRef<Dot[]>([]);
  const spacing = 36;
  const radius = 150;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const dots: Dot[] = [];
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          dots.push({ x, y, baseAlpha: 0.04 + Math.random() * 0.03 });
        }
      }
      dotsRef.current = dots;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      for (const dot of dotsRef.current) {
        let distance = 0;
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          distance = Math.sqrt(dx * dx + dy * dy);
        }
        let opacity = dot.baseAlpha;
        let size = 1;
        if (distance < radius) {
          const factor = 1 - distance / radius;
          opacity = dot.baseAlpha + factor * 0.25;
          size = 1 + factor * 1.2;
        }
        ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onResize = () => init();

    init();
    let animId = requestAnimationFrame(draw);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: -1,
          background:
            "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.08) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,255,0,0.02))",
          backgroundSize: "100% 3px, 4px 100%",
        }}
        aria-hidden="true"
      />
    </>
  );
}
