import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

// Realistic 3D Earth rendered with cobe. Drag to spin it; release and it
// resumes its slow automatic rotation. Markers are the actual destinations
// returned by the API, sized by how much that option saves.
export default function Globe({ markers = [], legend = [] }) {
  const canvasRef = useRef(null);
  const pointerStart = useRef(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const autoRef = useRef(true);
  const [dragging, setDragging] = useState(false);

  // Re-create the globe whenever the marker set changes — cobe fixes markers
  // at construction time, so mutating them in onRender has no effect.
  const markerKey = JSON.stringify(
    markers.map((m) => [m.location?.[0], m.location?.[1], m.size])
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe = null;
    let raf = 0;
    let tries = 0;

    const init = () => {
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
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 20000,
        mapBrightness: 6,
        baseColor: [0.06, 0.12, 0.27],
        markerColor: [0.16, 0.95, 0.7],
        glowColor: [0.06, 0.7, 0.6],
        markers,
        onRender: (state) => {
          state.width = canvas.clientWidth || w;
          state.height = canvas.clientHeight || h;
          if (autoRef.current) phiRef.current += 0.0045;
          state.phi = phiRef.current;
          state.theta = thetaRef.current;
        },
      });
    };

    init();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (globe) globe.destroy();
    };
  }, [markerKey]);

  const onPointerDown = (e) => {
    pointerStart.current = { x: e.clientX, y: e.clientY, phi: phiRef.current, theta: thetaRef.current };
    autoRef.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const s = pointerStart.current;
    if (!s) return;
    phiRef.current = s.phi + (e.clientX - s.x) * 0.005;
    // Clamp tilt so the poles never flip past vertical.
    thetaRef.current = Math.max(
      -0.9,
      Math.min(0.9, s.theta + (e.clientY - s.y) * 0.005)
    );
  };

  const endDrag = () => {
    pointerStart.current = null;
    setDragging(false);
    // Resume the idle spin shortly after the user lets go.
    setTimeout(() => {
      autoRef.current = true;
    }, 1200);
  };

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="w-full h-full touch-none select-none"
        style={{
          width: "100%",
          height: "100%",
          cursor: dragging ? "grabbing" : "grab",
        }}
      />
      {legend.length > 0 && (
        <div className="absolute top-4 left-4 right-4 pointer-events-none">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">
            Best destinations · marker size = savings
          </p>
          <div className="space-y-1">
            {legend.map((l) => (
              <div
                key={l.country}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/70 backdrop-blur-sm border border-white/10 px-2.5 py-1.5 max-w-[280px]"
              >
                <span className="text-xs text-white truncate">{l.country}</span>
                <span
                  className={`text-xs font-semibold flex-shrink-0 ${
                    l.savings >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {l.savings >= 0 ? "+" : ""}
                  {Math.round(l.savings).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {markers.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-slate-400/80 pointer-events-none">
          {markers.length - 1} destination{markers.length === 2 ? "" : "s"} from JFK · drag to rotate
        </div>
      )}
    </div>
  );
}
