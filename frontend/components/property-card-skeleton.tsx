import { cn } from "@/lib/utils";

/**
 * Skeleton placeholder matching PropertyCard dimensions to avoid layout shift000.
 */
export function PropertyCardSkeleton({
  variant = "grid",
  className,
}: {
  variant?: "grid" | "horizontal";
  className?: string;
}) {
  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "flex border-3 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] animate-pulse",
          className,
        )}
        aria-hidden
      >
        <div className="aspect-4/3 h-48 w-72 shrink-0 border-r-3 border-foreground bg-muted" />
        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="h-6 w-56 rounded bg-muted" />
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="mt-auto h-8 w-48 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-3 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] animate-pulse",
        className,
      )}
      aria-hidden
    >
      <div className="aspect-4/3 border-b-3 border-foreground bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-8 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}
