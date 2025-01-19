import { Button } from "@/components/ui/Button"
import { ChevronRight, Plus } from 'lucide-react'

interface Vehicle {
  make: string
  model: string
  year: string
}

interface VehicleListProps {
  vehicles: Vehicle[]
  onSelect: (vehicle: Vehicle) => void
  onAdd: () => void
}

export default function VehicleList({ vehicles, onSelect, onAdd }: VehicleListProps) {
  return (
    <div className="space-y-2">
      {vehicles.map((vehicle, index) => (
        <Button
          key={index}
          variant="ghost"
          className="w-full justify-between group hover:bg-accent/50"
          onClick={() => onSelect(vehicle)}
        >
          <span className="truncate">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </span>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
        </Button>
      ))}
      <Button
        variant="outline"
        className="w-full justify-start group hover:bg-accent/50"
        onClick={onAdd}
      >
        <Plus className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
        Add Vehicle
      </Button>
    </div>
  )
}

