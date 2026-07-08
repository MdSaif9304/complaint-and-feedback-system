"use client";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
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

// Validated, colorblind-safe palette (see dataviz skill). Each mode is its own
// set of steps tuned for that surface, not an automatic flip.
function usePalette() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    dark,
    text: dark ? "#c3c2b7" : "#52514e",
    grid: dark ? "#2c2c2a" : "#e1e0d9",
    axis: "#898781",
    // Categorical hues in fixed order (pie slices, category bars).
    categorical: dark
      ? ["#3987e5", "#199e70", "#c98500", "#008300", "#9085e9", "#e66767", "#d55181", "#d95926"]
      : ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#e87ba4", "#eb6834"],
    // Ordinal blue ramp for 1★→5★ (single hue, low→high prominence).
    ordinal: dark
      ? ["#184f95", "#256abf", "#3987e5", "#5598e7", "#9ec5f4"]
      : ["#9ec5f4", "#5598e7", "#2a78d6", "#1c5cab", "#104281"],
    series1: dark ? "#3987e5" : "#2a78d6",
    tooltipBg: dark ? "#1a1a19" : "#ffffff",
    tooltipBorder: dark ? "#383835" : "#e1e0d9",
    tooltipText: dark ? "#ffffff" : "#0b0b0b",
    cursor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
  };
}

function tooltipStyle(p: ReturnType<typeof usePalette>): React.CSSProperties {
  return {
    backgroundColor: p.tooltipBg,
    border: `1px solid ${p.tooltipBorder}`,
    borderRadius: 12,
    color: p.tooltipText,
    fontSize: 12,
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  };
}

const axisTick = (p: ReturnType<typeof usePalette>) => ({ fontSize: 12, fill: p.axis });

export function StatusPieChart({ data }: { data: Datum[] }) {
  const p = usePalette();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={48}
          outerRadius={82}
          paddingAngle={2}
          stroke={p.tooltipBg}
          strokeWidth={2}
          label={(e) => `${e.value}`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={p.categorical[i % p.categorical.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle(p)} />
        <Legend wrapperStyle={{ fontSize: 12, color: p.text }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: Datum[] }) {
  const p = usePalette();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
        <XAxis dataKey="name" tick={axisTick(p)} angle={-20} textAnchor="end" height={60} interval={0} />
        <YAxis tick={axisTick(p)} allowDecimals={false} />
        <Tooltip cursor={{ fill: p.cursor }} contentStyle={tooltipStyle(p)} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Complaints">
          {data.map((_, i) => (
            <Cell key={i} fill={p.categorical[i % p.categorical.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyLineChart({ data }: { data: Datum[] }) {
  const p = usePalette();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <defs>
          <linearGradient id="monthlyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.series1} stopOpacity={0.35} />
            <stop offset="100%" stopColor={p.series1} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
        <XAxis dataKey="name" tick={axisTick(p)} />
        <YAxis tick={axisTick(p)} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle(p)} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={p.series1}
          strokeWidth={2.5}
          fill="url(#monthlyFill)"
          dot={{ r: 3, fill: p.series1, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          name="Complaints"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RatingBarChart({ data }: { data: Datum[] }) {
  const p = usePalette();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={p.grid} vertical={false} />
        <XAxis dataKey="name" tick={axisTick(p)} />
        <YAxis tick={axisTick(p)} allowDecimals={false} />
        <Tooltip cursor={{ fill: p.cursor }} contentStyle={tooltipStyle(p)} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Responses">
          {data.map((_, i) => (
            <Cell key={i} fill={p.ordinal[i % p.ordinal.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
