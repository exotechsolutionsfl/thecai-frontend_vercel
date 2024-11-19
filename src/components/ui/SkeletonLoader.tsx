'use client'

import * as React from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { cn } from '@/lib/utils'

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
}

const SkeletonLoader = React.forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  ({ count = 1, className, ...props }, ref) => {
    const { theme } = useTheme()

    const skeletonItem = (
      <div
        className={cn(
          "animate-pulse rounded-md",
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200',
          className
        )}
        {...props}
      />
    )

    return (
      <div ref={ref} className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <React.Fragment key={index}>{skeletonItem}</React.Fragment>
        ))}
      </div>
    )
  }
)

SkeletonLoader.displayName = 'SkeletonLoader'

export { SkeletonLoader }