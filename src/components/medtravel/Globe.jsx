import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

// Realistic 3D Earth rendered with cobe: deep-blue oceans, glowing teal
// landmasses, slow automatic Y-axis spin. Fills its parent container.
export default function Globe() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2),
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 20000,
      mapBrightness: 6,
      baseColor: [0.06, 0.12, 0.27], // deep blue oceans
      markerColor: [0.16, 0.95, 0.7], // teal landmasses
      glowColor: [0.06, 0.7, 0.6], // teal atmosphere glow
      onRender: (state) => {
        state.width = canvas.clientWidth;
        state.height = canvas.clientHeight;
        state.phi = phi;
        phi += 0.0045;
      },
    });

    return () => globe.destroy();
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