'use client';

import { useEffect, useRef } from 'react';

type Fly = { x: number; y: number; vx: number; vy: number; phase: number; speed: number; size: number; drift: number };

const ATTRACT_RADIUS = 220;
const MAX_SPEED = 0.55;

// Luciérnagas en el claro del bosque: parpadean, deambulan y se acercan al cursor.
// Se pausan fuera de pantalla o con la pestaña oculta.
export const Fireflies = ({ respectReducedMotion = false }: { respectReducedMotion?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Halo pre-renderizado: dibujarlo como imagen es mucho más barato que un gradiente por luciérnaga.
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d')!;
    const paintSprite = () => {
      const dark = document.documentElement.classList.contains('dark');
      const [r, g, b] = dark ? [236, 248, 150] : [196, 168, 40];
      const gradient = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
      gradient.addColorStop(0.1, `rgba(${r},${g},${b},1)`);
      gradient.addColorStop(0.22, `rgba(${r},${g},${b},0.55)`);
      gradient.addColorStop(0.5, `rgba(${r},${g},${b},0.14)`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
      sctx.clearRect(0, 0, 64, 64);
      sctx.fillStyle = gradient;
      sctx.fillRect(0, 0, 64, 64);
    };
    paintSprite();
    const themeObserver = new MutationObserver(paintSprite);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let width = 0, height = 0, flies: Fly[] = [];
    const pointer = { x: -9999, y: -9999, active: false };

    // Nacen sobre todo en la mitad derecha (el claro), algunas sueltas por el resto.
    const spawn = (): Fly => {
      const inClearing = Math.random() < 0.82;
      return {
        x: inClearing ? width * (0.5 + Math.random() * 0.45) : Math.random() * width,
        y: height * (0.12 + Math.random() * 0.76),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.1,
        size: 18 + Math.random() * 16,
        drift: Math.random() * 1000,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 700 ? 12 : 26;
      flies = Array.from({ length: count }, (_, i) => flies[i] ?? spawn());
    };
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
    };
    const onPointerLeave = () => { pointer.active = false; };

    let frame: number | null = null;
    let visible = true;
    const tick = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (const fly of flies) {
        // Deambular: un empuje suave que cambia con el tiempo.
        fly.vx += Math.cos(t * 0.4 + fly.drift) * 0.012;
        fly.vy += Math.sin(t * 0.33 + fly.drift * 1.3) * 0.012;
        if (pointer.active) {
          const dx = pointer.x - fly.x, dy = pointer.y - fly.y;
          const dist = Math.hypot(dx, dy);
          if (dist < ATTRACT_RADIUS && dist > 28) {
            const pull = (1 - dist / ATTRACT_RADIUS) * 0.035;
            fly.vx += (dx / dist) * pull;
            fly.vy += (dy / dist) * pull;
          } else if (dist <= 28) {
            fly.vx -= (dx / (dist || 1)) * 0.04;
            fly.vy -= (dy / (dist || 1)) * 0.04;
          }
        }
        fly.vx *= 0.985;
        fly.vy *= 0.985;
        const speed = Math.hypot(fly.vx, fly.vy);
        if (speed > MAX_SPEED) { fly.vx *= MAX_SPEED / speed; fly.vy *= MAX_SPEED / speed; }
        fly.x += fly.vx;
        fly.y += fly.vy;
        // Si se alejan demasiado, vuelven con suavidad.
        if (fly.x < -40 || fly.x > width + 40 || fly.y < -40 || fly.y > height + 40) Object.assign(fly, spawn());

        // Parpadeo: pulsos cortos con pausas, como las luciérnagas reales.
        const pulse = Math.max(0, Math.sin(t * fly.speed + fly.phase));
        const glow = 0.3 + 0.7 * pulse ** 2;
        ctx.globalAlpha = glow;
        const size = fly.size * (0.8 + 0.35 * glow);
        ctx.drawImage(sprite, fly.x - size / 2, fly.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(tick);
    };

    const start = () => { if (frame === null && visible && !document.hidden) frame = requestAnimationFrame(tick); };
    const stop = () => { if (frame !== null) cancelAnimationFrame(frame); frame = null; };
    const onVisibility = () => (document.hidden ? stop() : start());

    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start(); else stop();
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [respectReducedMotion]);

  return <canvas ref={canvasRef} className="fireflies" aria-hidden="true" />;
};
