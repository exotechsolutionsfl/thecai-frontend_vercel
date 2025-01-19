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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-2">Your Vehicles</h2>
      {vehicles.length > 0 ? (
        <ul className="space-y-2" role="list">
          {vehicles.map((vehicle, index) => (
            <li key={index}>
              <Button
                variant="ghost"
                className="w-full justify-between group hover:bg-accent/50 text-left"
                onClick={() => onSelect(vehicle)}
                aria-label={`Select ${vehicle.make} ${vehicle.model} (${vehicle.year})`}
              >
                <span className="truncate flex-grow">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No vehicles added yet.</p>
      )}
      <Button
        variant="outline"
        className="w-full justify-start group hover:bg-accent/50"
        onClick={onAdd}
        aria-label="Add a new vehicle"
      >
        <Plus className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" aria-hidden="true" />
        Add Vehicle
      </Button>
    </div>
  )
}