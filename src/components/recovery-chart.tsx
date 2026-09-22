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
import type { LoadedBout } from "@/lib/protocol/types";
import {
  fitRecoveryRateConstant,
  recoveryCurve,
  restingValue,
} from "@/lib/protocol/compute";

export function RecoveryChart({ bout }: { bout: LoadedBout }) {
  const rest = restingValue(bout);
  const samples = bout.samples.filter(
    (s) => s.value != null && Number.isFinite(s.value),
  ) as Array<{ hoursAfterLoad: number; value: number }>;
  const fit = rest != null ? fitRecoveryRateConstant(rest, bout.samples) : null;
  const maxH = Math.max(6, ...bout.samples.map((s) => s.hoursAfterLoad), 0);
  const hours = Array.from({ length: 25 }, (_, i) => (i / 24) * maxH);
  const curve = fit ? recoveryCurve(fit, hours) : [];

  const rows = hours.map((h) => {
    const sample = samples.find((s) => Math.abs(s.hoursAfterLoad - h) < 1e-6);
    const fitted = curve.find((c) => Math.abs(c.hours - h) < 1e-9);
    return {
      hours: Number(h.toFixed(3)),
      sample: sample?.value ?? null,
      fitted: fitted?.fitted ?? null,
    };
  });
  for (const s of samples) {
    if (!rows.some((r) => Math.abs(r.hours - s.hoursAfterLoad) < 1e-6)) {
      rows.push({ hours: s.hoursAfterLoad, sample: s.value, fitted: null });
    }
  }
  rows.sort((a, b) => a.hours - b.hours);

  if (samples.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Record samples after the load. The quantity is the speed of the return, not the trough.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid stroke="#d9d1c4" strokeDasharray="3 3" />
          <XAxis
            dataKey="hours"
            type="number"
            domain={[0, maxH]}
            tick={{ fill: "#5e584f", fontSize: 12 }}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "#5e584f", fontSize: 12 }}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "#fffdf8",
              border: "1px solid #d9d1c4",
              borderRadius: 8,
            }}
          />
          <Legend />
          {rest != null ? (
            <ReferenceLine
              y={rest}
              stroke="#8a8378"
              strokeDasharray="4 4"
              label={{ value: "rest", fill: "#8a8378", fontSize: 11, position: "insideTopRight" }}
            />
          ) : null}
          {fit ? (
            <Line
              type="monotone"
              dataKey="fitted"
              name="fitted return"
              stroke="#1e4a46"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ) : null}
          <Scatter dataKey="sample" name="sample" fill="#8a3b32" />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-ink-subtle">
        Hours after load · {bout.unit || "value"} against the individual’s resting value
      </p>
    </div>
  );
}
