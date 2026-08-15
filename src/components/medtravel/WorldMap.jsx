import React from "react";

// Stylized, simplified world map silhouette in slate/blue tones.
export default function WorldMap() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1000 520"
      >
        {/* Dot grid overlay */}
        <defs>
          <pattern id="mapdots" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="13" cy="13" r="1.3" fill="#94a3b8" opacity="0.28" />
          </pattern>
        </defs>
        <rect width="1000" height="520" fill="url(#mapdots)" />

        {/* Simplified continent silhouettes */}
        <g fill="#cbd5e1" opacity="0.55" stroke="#94a3b8" strokeWidth="1">
          {/* North America */}
          <path d="M150,70 Q210,55 280,80 Q320,110 310,160 Q295,205 248,222 Q198,242 158,230 Q128,210 120,170 Q110,118 150,70 Z" />
          {/* Greenland */}
          <path d="M338,58 Q378,53 392,80 Q386,112 362,116 Q336,110 332,84 Z" />
          {/* Central America */}
          <path d="M250,232 Q278,235 288,258 Q282,278 262,276 Q248,262 250,232 Z" />
          {/* South America */}
          <path d="M268,282 Q322,270 332,302 Q326,362 306,412 Q290,452 268,456 Q248,440 244,400 Q238,342 268,282 Z" />
          {/* Europe */}
          <path d="M450,108 Q512,98 532,120 Q546,142 534,162 Q508,178 478,172 Q454,160 444,140 Q440,118 450,108 Z" />
          {/* Africa */}
          <path d="M472,208 Q542,198 572,232 Q582,292 556,342 Q530,392 500,402 Q470,392 456,350 Q446,290 472,208 Z" />
          {/* Asia */}
          <path d="M540,108 Q624,88 724,100 Q804,122 832,172 Q820,232 760,252 Q680,262 600,242 Q546,222 530,172 Q520,128 540,108 Z" />
          {/* Southeast Asia */}
          <path d="M760,262 Q802,256 812,278 Q802,298 770,292 Q756,278 760,262 Z" />
          {/* Australia */}
          <path d="M782,332 Q852,322 882,348 Q886,382 856,396 Q800,402 782,382 Q772,358 782,332 Z" />
        </g>

        {/* Connection arcs suggesting travel routes */}
        <g fill="none" stroke="#3b82f6" strokeWidth="1.4" opacity="0.35" strokeDasharray="3 4">
          <path d="M250,180 Q400,40 540,140" />
          <path d="M250,200 Q450,120 700,180" />
          <path d="M260,220 Q480,320 820,360" />
        </g>
        {/* Destination pins */}
        <g fill="#10b981" stroke="white" strokeWidth="1.5">
          <circle cx="250" cy="230" r="4" />
          <circle cx="540" cy="150" r="4" />
          <circle cx="700" cy="180" r="4" />
          <circle cx="820" cy="360" r="4" />
        </g>
      </svg>
    </div>
  );
}