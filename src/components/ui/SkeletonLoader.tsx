import { useTheme } from '@context/ThemeProvider'

interface SkeletonLoaderProps {
  count?: number
  className?: string
}

export default function SkeletonLoader({ count = 1, className = '' }: SkeletonLoaderProps) {
  const { theme } = useTheme()

  const skeletonItem = (
    <div
      className={`animate-pulse rounded-md ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      } ${className}`}
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