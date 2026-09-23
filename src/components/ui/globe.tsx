/**
 * Decorative COBE globe — used as the sign-in page visual only.
 *
 * This is NOT the BhoomiSetu GIS map. It renders no data layers and performs
 * no region selection; the real geographic source of truth remains
 * src/components/region-map.tsx.
 *
 * Adapted for BhoomiSetu:
 * - Green land dots on a dark green sphere (platform dark-section palette);
 *   no markers, arcs or flight semantics — a quiet rotating land sphere.
 * - Client-only mount: SSR renders an aspect-ratio placeholder, so hydration
 *   is untouched.
 * - Respects prefers-reduced-motion: draws a single static frame, no spin.
 * - Spin pauses while the tab is hidden or the canvas scrolls out of view.
 *   (Cobe v2 has no internal render loop; we drive `update()` ourselves.)
 */
import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { useMounted } from "../motion";

const BASE: [number, number, number] = [0.35, 0.52, 0.42]; // sea base; land dots brighten from this
const GLOW: [number, number, number] = [0.1, 0.19, 0.15]; // restrained green halo
const MARKER: [number, number, number] = [0.83, 0.66, 0.36]; // unused (no markers) but required

export function Globe({ className = "" }: { className?: string }) {
  const mounted = useMounted();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phi = 1.7;
    let visible = true;
    let raf = 0;

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 600,
      height: 600,
      phi,
      theta: 0.26,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 16000,
      mapBrightness: 2.2,
      baseColor: BASE,
      markerColor: MARKER,
      glowColor: GLOW,
      markers: [],
    });

    if (!reduced) {
      const loop = () => {
        if (visible && !document.hidden) phi += 0.0022;
        globe.update({ phi });
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // Fade the canvas in once the first frames are drawn.
    const fadeTimer = window.setTimeout(() => {
      canvas.style.opacity = "1";
    }, 150);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
      io.disconnect();
      globe.destroy();
    };
  }, [mounted]);

  if (!mounted) {
    // SSR/first-paint placeholder keeps the layout stable.
    return <div className={`aspect-square w-full ${className}`} aria-hidden="true" />;
  }

  return (
    <div className={`relative aspect-square w-full ${className}`} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.34 0.06 160 / 28%) 0%, transparent 62%)",
        }}
      />
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="relative h-full w-full opacity-0 transition-opacity duration-1000"
        style={{ contain: "strict" }}
      />
    </div>
  );
}
