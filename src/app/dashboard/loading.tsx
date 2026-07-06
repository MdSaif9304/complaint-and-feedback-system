import { StatCardSkeleton, RowSkeleton, Skeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div>
      // Test
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="mt-8 space-y-3">
        <Skeleton className="mb-3 h-5 w-40" />
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </div>
  );
}
