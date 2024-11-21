import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  const skeletonItem = (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-4">
          {skeletonItem}
        </div>
      ))}
    </>
  )
}