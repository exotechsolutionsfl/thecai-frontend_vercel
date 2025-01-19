import { Button } from "@/components/ui/Button"
import { Plus } from 'lucide-react'

interface EmptyVehicleStateProps {
  onClick: () => void
}

export default function EmptyVehicleState({ onClick }: EmptyVehicleStateProps) {
  return (
    <div className="text-center space-y-4">
      <p className="text-muted-foreground">No vehicles saved yet</p>
      <Button 
        variant="outline"
        onClick={onClick} 
        className="w-full sm:w-auto group hover:bg-accent/50"
      >
        <Plus className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
        Add Your First Vehicle
      </Button>
    </div>
  )
}

