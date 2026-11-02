"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TriggerCount } from "@/lib/dashboard";

const ROW = 40;

// Horizontal bars so trigger names stay readable. One series, so one color
// (sage); the title names it, values sit at the bar tips, and a hidden table
// carries the same numbers for screen readers.
export function TriggerChart({ data }: { data: TriggerCount[] }) {
  const rows = data.map((t) => ({ label: `${t.emoji} ${t.name}`, count: t.count }));

  return (
    <figure>
      <div aria-hidden="true" style={{ height: rows.length * ROW + 32 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              tick={{ fill: "var(--foreground)", fontSize: 14 }}
            />
            <Tooltip
              cursor={{ fill: "var(--sage-light)" }}
              formatter={(value) => [value, "Affirmations"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <Bar dataKey="count" fill="var(--sage)" barSize={20} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              <LabelList dataKey="count" position="right" fill="var(--foreground)" fontSize={13} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Affirmations per trigger</caption>
        <thead>
          <tr>
            <th>Trigger</th>
            <th>Affirmations</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
