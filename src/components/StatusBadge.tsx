import { STATUS_LABELS } from "@/lib/constants";

// Monochrome, theme-aware status styles with a leading indicator dot.
const STATUS_STYLE: Record<string, { pill: string; dot: string }> = {
  pending: {
    pill: "border-neutral-300 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
    dot: "bg-neutral-400",
  },
  "under-review": {
    pill: "border-neutral-300 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
    dot: "bg-neutral-500 dark:bg-neutral-400",
  },
  resolved: {
    pill: "border-transparent bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
    dot: "bg-white/70 dark:bg-neutral-900/70",
  },
  closed: {
    pill: "border-neutral-200 bg-neutral-100/70 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-400",
    dot: "bg-neutral-400",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span className={`badge ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const PRIORITY_STYLE: Record<string, string> = {
  low: "border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400",
  medium:
    "border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200",
  high: "border-neutral-900 font-semibold text-neutral-900 dark:border-neutral-100 dark:text-white",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`badge bg-transparent ${PRIORITY_STYLE[priority] || PRIORITY_STYLE.low}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}
