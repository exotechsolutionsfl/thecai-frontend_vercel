'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileSearch, Bot } from 'lucide-react'
import { useSavedVehicles } from '@context/VehicleContext'
import { useTheme } from '@context/ThemeProvider'
import { Card, CardContent } from "@/components/ui/Card"
import dynamic from 'next/dynamic'

const QuickActionButton = dynamic(() => import('@/components/QuickActionButton'))
const VehicleList = dynamic(() => import('@/components/VehicleList'))
const EmptyVehicleState = dynamic(() => import('@/components/EmptyVehicleState'))

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

  const handleGetStarted = useCallback(() => router.push('/vehicle-selection'), [router])
  const handleAITroubleshooter = useCallback(() => router.push('/ai-troubleshooter'), [router])
  const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
    router.push(`/dynamic-content?make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(vehicle.year)}`)
  }, [router])

  const quickActions = useMemo(() => [
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
  ], [handleGetStarted, handleAITroubleshooter])

  if (!mounted) return null

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <QuickActionButton key={index} {...action} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
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