interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-64 skeleton rounded-xl" />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
