import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface DynamicBreadcrumbsProps {
  breadcrumbs: Array<{ label: string; level: number }>
  onBreadcrumbClick: (level: number) => void
  vehicle: {
    make: string
    model: string
    year: string
  }
}

export default function DynamicBreadcrumbs({
  breadcrumbs,
  onBreadcrumbClick,
  vehicle
}: DynamicBreadcrumbsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 mb-6" aria-label="Breadcrumbs">
      <Button
        variant="ghost"
        className="text-sm"
        onClick={() => onBreadcrumbClick(1)}
      >
        {vehicle.make} {vehicle.model} ({vehicle.year})
      </Button>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => onBreadcrumbClick(crumb.level)}
          >
            {crumb.label}
          </Button>
        </div>
      ))}
    </nav>
  )
}