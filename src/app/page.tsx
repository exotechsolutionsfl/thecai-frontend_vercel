'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FileSearch, Bot, ChevronRight, Plus, Car } from 'lucide-react'
import { useSavedVehicles } from '@context/VehicleContext'
import { useTheme } from '@context/ThemeProvider'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  onClick: () => void
}

const QuickActionButton = ({ title, description, icon: Icon, onClick }: QuickAction) => (
  <Button 
    variant="outline" 
    className="w-full justify-start h-auto py-3 px-3 group hover:bg-accent/50"
    onClick={onClick}
  >
    <div className="flex items-center">
      <Icon className="h-5 w-5 mr-3 flex-shrink-0 group-hover:text-primary transition-colors" />
      <div className="text-left">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {description}
        </div>
      </div>
    </div>
  </Button>
)

const VehicleList = ({ 
  vehicles, 
  onSelect,
  onAdd 
}: { 
  vehicles: Vehicle[]
  onSelect: (vehicle: Vehicle) => void
  onAdd: () => void
}) => (
  <div className="space-y-2">
    {vehicles.map((vehicle, index) => (
      <Button
        key={index}
        variant="ghost"
        className="w-full justify-between group hover:bg-accent/50 py-2"
        onClick={() => onSelect(vehicle)}
      >
        <div className="flex items-center">
          <Car className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="truncate text-sm">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </span>
        </div>
        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
      </Button>
    ))}
    <Button
      variant="outline"
      className="w-full justify-center group hover:bg-accent/50 py-2"
      onClick={onAdd}
    >
      <Plus className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
      Add Vehicle
    </Button>
  </div>
)

const EmptyVehicleState = ({ onClick }: { onClick: () => void }) => (
  <div className="text-center space-y-4">
    <p className="text-sm text-muted-foreground">No vehicles saved yet</p>
    <Button 
      variant="outline"
      onClick={onClick} 
      className="w-full group hover:bg-accent/50"
    >
      <Plus className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
      Add Your First Vehicle
    </Button>
  </div>
)

interface Vehicle {
  make: string
  model: string
  year: string
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { savedVehicles } = useSavedVehicles()
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleGetStarted = () => router.push('/vehicle-selection')
  const handleAITroubleshooter = () => router.push('/ai-troubleshooter')
  const handleSelectVehicle = (vehicle: Vehicle) => {
    router.push(`/dynamic-content?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(vehicle.year)}`)
  }

  const quickActions: QuickAction[] = [
    {
      title: "Search Knowledge Base",
      description: "Find detailed information about your vehicle",
      icon: FileSearch,
      onClick: handleGetStarted
    },
    {
      title: "AI Troubleshooter",
      description: "Get AI-powered assistance for your vehicle",
      icon: Bot,
      onClick: handleAITroubleshooter
    }
  ]

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <QuickActionButton key={index} {...action} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">My Vehicles</h2>
                {savedVehicles.length > 0 ? (
                  <VehicleList
                    vehicles={savedVehicles}
                    onSelect={handleSelectVehicle}
                    onAdd={handleGetStarted}
                  />
                ) : (
                  <EmptyVehicleState onClick={handleGetStarted} />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <footer className="py-2 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ThecAI. All rights reserved.
      </footer>
    </div>
  )
}