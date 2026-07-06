import { Skeleton } from "@/components/Skeleton";

export default function ComplaintDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="h-4 w-32" />
      <div className="card mt-3 space-y-4 p-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="card mt-5 space-y-4 p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
