import {
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import type { Criteria, Visit } from "@/lib/protocol/types";
import { gaitSpeed, visitAxes } from "@/lib/protocol/compute";

export function TrajectoryChart({
  visits,
  criteria,
}: {
  visits: Visit[];
  criteria: Criteria;
}) {
  const rows = visits.map((v) => {
    const axes = visitAxes(v, criteria);
    const trials = v.gaitTimesSec.map((t, i) => ({
      key: `t${i + 1}`,
      speed: gaitSpeed(criteria.gaitCourseM, t),
    }));
    return {
      date: v.isoDate.slice(5),
      iso: v.isoDate,
      level: axes.gait.level,
      t1: trials[0]?.speed ?? null,
      t2: trials[1]?.speed ?? null,
      t3: trials[2]?.speed ?? null,
    };
  });

  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink-muted">No visits yet. A single measurement is a point.</p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#d9d1c4" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: "#5e584f", fontSize: 12 }} />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#5e584f", fontSize: 12 }}
            width={48}
            label={{ value: "m/s", angle: -90, position: "insideLeft", fill: "#8a8378" }}
          />
          <Tooltip
            contentStyle={{
              background: "#fffdf8",
              border: "1px solid #d9d1c4",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine
            y={criteria.gaitCriterionMs}
            stroke="#8a3b32"
            strokeDasharray="6 4"
            label={{ value: `C ${criteria.gaitCriterionMs} m/s`, fill: "#8a3b32", fontSize: 11, position: "insideTopRight" }}
          />
          <Line
            type="monotone"
            dataKey="level"
            name="Level (median)"
            stroke="#1e4a46"
            strokeWidth={2}
            dot={{ r: 4, fill: "#1e4a46" }}
            connectNulls
          />
          <Scatter dataKey="t1" name="Trial 1" fill="#8a8378" />
          <Scatter dataKey="t2" name="Trial 2" fill="#8a8378" />
          <Scatter dataKey="t3" name="Trial 3" fill="#8a8378" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
