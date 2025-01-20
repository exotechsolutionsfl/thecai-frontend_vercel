import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  count?: number
  variant?: "default" | "circular" | "rectangular"
}

export function Skeleton({ className, count = 1, variant = "default", ...props }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted"
  const variantClasses = {
    default: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-md",
  }

  const skeletonItem = (index: number) => (
    <div key={index} className={cn(baseClasses, variantClasses[variant], className)} {...props} />
  )

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-2 last:mb-0">
          {skeletonItem(index)}
        </div>
      ))}
    </>
  )
}