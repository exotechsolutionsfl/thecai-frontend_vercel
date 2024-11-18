'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Vehicle {
  make: string
  model: string
  year: string
}

interface VehicleContextType {
  savedVehicles: Vehicle[]
  setSavedVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined)

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    const storedVehicles = localStorage.getItem('savedVehicles')
    if (storedVehicles) {
      setSavedVehicles(JSON.parse(storedVehicles))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('savedVehicles', JSON.stringify(savedVehicles))
  }, [savedVehicles])

  return (
    <VehicleContext.Provider value={{ savedVehicles, setSavedVehicles }}>
      {children}
    </VehicleContext.Provider>
  )
}

export function useSavedVehicles() {
  const context = useContext(VehicleContext)
  if (context === undefined) {
    throw new Error('useSavedVehicles must be used within a VehicleProvider')
  }
  return context
}