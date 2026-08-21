'use client';

import { useEffect, useRef } from 'react';

/*
  StormAtmosphere — atmospheric luminous cloud backdrop for the hero.

  Visual direction:
  - Visible billowing clouds with soft white, silver, and misty highlights
  - Cinematic, ethereal depth against the dark near-black background
  - Interactive: subtle, smooth cursor parallax with inertia
  - High performance: sampled grid rendering, Page Visibility pause, prefers-reduced-motion support
*/

function smoothNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

function interpolatedNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const n00 = smoothNoise(xi,     yi,     seed);
  const n10 = smoothNoise(xi + 1, yi,     seed);
  const n01 = smoothNoise(xi,     yi + 1, seed);
  const n11 = smoothNoise(xi + 1, yi + 1, seed);

  return (
    n00 * (1 - ux) * (1 - uy) +
    n10 * ux       * (1 - uy) +
    n01 * (1 - ux) * uy       +
    n11 * ux       * uy
  );
}

function lerpColor(c1: number[], c2: number[], t: number) {
  return [
    c1[0] + (c2[0] - c1[0]) * t,
    c1[1] + (c2[1] - c1[1]) * t,
    c1[2] + (c2[2] - c1[2]) * t,
  ];
}

// Luminous soft white / silver / cool mist palette
const COLOR_SHADOW = [135, 150, 170]; // soft misty blue-slate
const COLOR_MID    = [210, 222, 238]; // luminous silver wisp
const COLOR_HIGH   = [252, 253, 255]; // crisp white cloud crest

function getCloudColor(density: number) {
  if (density < 0.5) {
    return lerpColor(COLOR_SHADOW, COLOR_MID, density * 2);
  } else {
    return lerpColor(COLOR_MID, COLOR_HIGH, (density - 0.5) * 2);
  }
}

interface CloudLayer {
  seed: number;
  scale: number;
  speed: number;
  opacity: number;
  parallax: number;
}

const LAYERS: CloudLayer[] = [
  { seed: 101, scale: 1.2, speed: 0.004, opacity: 0.35, parallax: 0.12 }, // broad atmospheric mass
  { seed: 205, scale: 2.4, speed: 0.008, opacity: 0.28, parallax: 0.24 }, // billowing mid cloud formations
  { seed: 317, scale: 4.8, speed: 0.014, opacity: 0.18, parallax: 0.40 }, // foreground wisps & edges
];

export default function StormAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const hiddenRef = useRef<boolean>(false);
  
  // Cursor tracking for smooth parallax
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SCALE = Math.min(window.devicePixelRatio * 0.4, 0.75);
    const GRID = 3; // high visual fidelity with smooth performance

    function resize() {
      if (!canvas || !ctx) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width  = Math.round(w * SCALE);
      canvas.height = Math.round(h * SCALE);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    function onVisibilityChange() {
      hiddenRef.current = document.hidden;
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    function onMouseMove(e: MouseEvent) {
      if (reducedMotion) return;
      const rect = canvas?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetMouseRef.current = { x: (x - 0.5) * 2, y: (y - 0.5) * 2 };
    }
    window.addEventListener('mousemove', onMouseMove);

    function draw(t: number) {
      if (!ctx || !canvas) return;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      const stepX = GRID;
      const stepY = GRID;
      const cols = Math.ceil(W / stepX);
      const rows = Math.ceil(H / stepY);

      // Smooth inertia lerp for mouse parallax
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.04;

      for (const layer of LAYERS) {
        const offsetX = t * layer.speed;
        const offsetY = t * layer.speed * 0.25;

        const mouseOffsetX = mouseRef.current.x * layer.parallax;
        const mouseOffsetY = mouseRef.current.y * layer.parallax;

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const px = col * stepX;
            const py = row * stepY;

            const nx = (px / W) * layer.scale + offsetX + mouseOffsetX;
            const ny = (py / H) * layer.scale + offsetY + mouseOffsetY;

            // Multi-octave Fractal Noise (FBM)
            let noise = interpolatedNoise(nx, ny, layer.seed);
            noise += 0.5 * interpolatedNoise(nx * 2.1, ny * 2.1, layer.seed + 11);
            noise += 0.25 * interpolatedNoise(nx * 4.2, ny * 4.2, layer.seed + 23);
            noise = noise / 1.75;

            // Soft vignette and height falloff
            const vertFade = Math.pow(1 - (py / H) * 0.75, 1.2);
            const horzDist = Math.abs((px / W) - 0.5);
            const horzFade = Math.max(0, 1 - horzDist * 1.3);
            const fade = Math.max(0, Math.min(1, vertFade * horzFade));

            // Soft thresholding for visible cloud volume
            const THRESHOLD = 0.28;
            let density = (noise - THRESHOLD) / (1 - THRESHOLD);
            if (density < 0) density = 0;
            if (density > 1) density = 1;

            const alpha = density * layer.opacity * fade;
            if (alpha < 0.008) continue;

            const color = getCloudColor(density);
            ctx.fillStyle = `rgba(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])}, ${alpha})`;
            ctx.fillRect(px, py, stepX + 1, stepY + 1);
          }
        }
      }
    }

    const TARGET_INTERVAL = 1000 / 30;

    function animate(ts: number) {
      if (!hiddenRef.current) {
        const elapsed = ts - lastFrameRef.current;
        if (elapsed >= TARGET_INTERVAL) {
          lastFrameRef.current = ts;
          timeRef.current += reducedMotion ? (elapsed * 0.0001) : (elapsed * 0.0008);
          draw(timeRef.current);
        }
      }
      frameRef.current = requestAnimationFrame(animate);
    }

    if (reducedMotion) {
      draw(0);
      frameRef.current = requestAnimationFrame(animate);
    } else {
      frameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
        mixBlendMode: 'screen',
        opacity: 0.95,
      }}
    />
  );
}
