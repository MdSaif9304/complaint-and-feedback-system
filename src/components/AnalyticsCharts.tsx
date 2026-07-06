"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "@/components/theme/ThemeProvider";

type Datum = { name: string; value: number };

function usePalette() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    fg: dark ? "#fafafa" : "#171717",
    grid: dark ? "#262626" : "#e5e5e5",
    axis: dark ? "#a3a3a3" : "#737373",
    // Monochrome ramp for categorical slices
    ramp: dark
      ? ["#fafafa", "#d4d4d4", "#a3a3a3", "#8c8c8c", "#737373", "#595959", "#404040", "#2a2a2a"]
      : ["#171717", "#404040", "#595959", "#737373", "#8c8c8c", "#a6a6a6", "#bfbfbf", "#d4d4d4"],
    tooltip: {
      backgroundColor: dark ? "#171717" : "#ffffff",
      border: `1px solid ${dark ? "#404040" : "#e5e5e5"}`,
      borderRadius: 12,
      color: dark ? "#fafafa" : "#171717",
      fontSize: 12,
    } as React.CSSProperties,
    cursor: dark ? "#26262680" : "#f5f5f5",
  };
}

export function CategoryBarChart({ data }: { data: Datum[] }) {
  const p = usePalette();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: p.axis }} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12, fill: p.axis }} allowDecimals={false} />
        <Tooltip cursor={{ fill: p.cursor }} contentStyle={p.tooltip} />
        <Bar dataKey="value" fill={p.fg} radius={[6, 6, 0, 0]} name="Complaints" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: Datum[] }) {
  const p = usePalette();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => `${e.name}: ${e.value}`} stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={p.ramp[i % p.ramp.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={p.tooltip} />
        <Legend wrapperStyle={{ fontSize: 12, color: p.axis }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyLineChart({ data }: { data: Datum[] }) {
  const p = usePalette();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: p.axis }} />
        <YAxis tick={{ fontSize: 12, fill: p.axis }} allowDecimals={false} />
        <Tooltip contentStyle={p.tooltip} />
        <Line type="monotone" dataKey="value" stroke={p.fg} strokeWidth={2.5} dot={{ r: 4, fill: p.fg }} name="Complaints" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RatingBarChart({ data }: { data: Datum[] }) {
  const p = usePalette();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: p.axis }} />
        <YAxis tick={{ fontSize: 12, fill: p.axis }} allowDecimals={false} />
        <Tooltip cursor={{ fill: p.cursor }} contentStyle={p.tooltip} />
        <Bar dataKey="value" fill={p.fg} radius={[6, 6, 0, 0]} name="Responses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
