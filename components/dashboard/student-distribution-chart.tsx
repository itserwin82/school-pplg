"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StudentDistributionChartProps = {
  data: {
    name: string;
    siswa: number;
  }[];
};

export function StudentDistributionChart({
  data,
}: StudentDistributionChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        Belum ada data kelas.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--color-muted-foreground)"
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--color-muted-foreground)"
          />

          <Tooltip
            cursor={{
              fill: "var(--color-muted)",
            }}
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
              fontSize: "12px",
            }}
            formatter={(value) => [`${value} siswa`, "Jumlah"]}
          />

          <Bar
            dataKey="siswa"
            fill="var(--color-primary)"
            radius={[8, 8, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}