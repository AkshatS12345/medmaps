import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

// Realistic 3D Earth rendered with cobe: deep-blue oceans, glowing teal
// landmasses + facility markers, slow automatic Y-axis spin.
export default function Globe({ markers = [] }) {
  const canvasRef = useRef(null);
  const markersRef = useRef(markers);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;
    let globe = null;
    let raf = 0;
    let tries = 0;

    const init = () => {
      // Wait until the canvas has a real, non-zero size before creating the
      // WebGL program — otherwise cobe's shader setup fails.
      if ((canvas.clientWidth === 0 || canvas.clientHeight === 0) && tries < 30) {
        tries++;
        raf = requestAnimationFrame(init);
        return;
      }

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio, 2),
        width: w,
        height: h,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 20000,
        mapBrightness: 6,
        baseColor: [0.06, 0.12, 0.27], // deep blue oceans
        markerColor: [0.16, 0.95, 0.7], // teal landmasses
        glowColor: [0.06, 0.7, 0.6], // teal atmosphere glow
        markers: markersRef.current,
        onRender: (state) => {
          state.width = canvas.clientWidth || w;
          state.height = canvas.clientHeight || h;
          state.phi = phi;
          phi += 0.0045;
        },
      });
    };

    init();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (globe) globe.destroy();
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}