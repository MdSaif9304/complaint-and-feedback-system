import { STATUS_LABELS } from "@/lib/constants";

interface Update {
  status: string;
  note?: string;
  by: string;
  at: string | Date;
}

export default function ComplaintTimeline({ updates }: { updates: Update[] }) {
  if (!updates || updates.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No updates yet.</p>;
  }
  return (
    <ol className="relative space-y-6 border-l border-neutral-200 pl-6 dark:border-neutral-800">
      {updates.map((u, i) => {
        const isLatest = i === updates.length - 1;
        return (
          <li key={i} className="relative">
            <span
              className={`absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-neutral-50 dark:border-neutral-900 ${
                isLatest
                  ? "bg-neutral-900 dark:bg-white"
                  : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{STATUS_LABELS[u.status] || u.status}</span>
              <span className="text-xs text-neutral-400">
                {new Date(u.at).toLocaleString()}
              </span>
            </div>
            {u.note && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{u.note}</p>
            )}
            <p className="mt-0.5 text-xs text-neutral-400">by {u.by}</p>
          </li>
        );
      })}
    </ol>
  );
}
