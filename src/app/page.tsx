'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Plus, FileSearch, Settings, ChevronRight, Bot } from 'lucide-react'
import { useSavedVehicles } from '@context/VehicleContext'
import { useTheme } from '@context/ThemeProvider'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"

interface SavedVehicle {
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

  const handleGetStarted = () => {
    router.push('/vehicle-selection')
  }

  const handleSelectVehicle = (vehicle: SavedVehicle) => {
    router.push(`/main-topics?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(vehicle.year)}`)
  }

  const handleAITroubleshooter = () => {
    router.push('/ai-troubleshooter')
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-2">Autom8T</h1>
            <p className="text-xl md:text-2xl text-muted-foreground">Your Centralized Car Knowledge Hub</p>
          </motion.div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left" 
                    onClick={handleGetStarted}
                  >
                    <FileSearch className="mr-2 h-4 w-4" />
                    Search Knowledge Base
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left" 
                    onClick={handleAITroubleshooter}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    AI Troubleshooter
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">My Vehicles</h2>
                {savedVehicles.length > 0 ? (
                  <div className="space-y-2">
                    {savedVehicles.map((vehicle, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-between"
                        onClick={() => handleSelectVehicle(vehicle)}
                      >
                        <span>{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ))}
                    <Button className="w-full mt-4" onClick={handleGetStarted}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Vehicle
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={handleGetStarted}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Vehicle
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © 2023 Autom8T. All rights reserved.
      </footer>
    </div>
  )
}