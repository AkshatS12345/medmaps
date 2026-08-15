import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CATEGORY_META, CATEGORY_ORDER } from "@/context/CartContext";

// Donut chart showing what percentage of the estimated trip total comes from
// each cost category (procedure, flights, hotel, transportation, etc.).
export default function CostBreakdownChart({ totals }) {
  const data = CATEGORY_ORDER.map((key) => ({
    key,
    name: CATEGORY_META[key].label,
    value: Math.round(totals[key] || 0),
    color: CATEGORY_META[key].color,
  })).filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${Number(value).toLocaleString()}`}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-slate-300 truncate">{d.name}</span>
            <span className="text-slate-500 ml-auto flex-shrink-0">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}