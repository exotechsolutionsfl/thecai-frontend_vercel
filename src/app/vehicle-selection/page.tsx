'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Check } from 'lucide-react'
import { apiFetch } from '@api/api'
import { useSavedVehicles } from '@context/VehicleContext'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { SelectDropdown } from "@/components/SelectDropdown"
import { useToast } from "@/hooks/useToast"
import { ErrorBoundary } from "@/components/ErrorBoundary"

interface Vehicle {
  make: string
  model: string
  year: string
  engine: string
}

export default function VehicleSelection() {
  const [makes, setMakes] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [engines, setEngines] = useState<string[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Partial<Vehicle>>({})
  const [loading, setLoading] = useState({
    page: true,
    makes: true,
    models: false,
    years: false,
    engines: false,
    vehicleType: false,
  })
  const [isSaved, setIsSaved] = useState(false)

  const router = useRouter()
  const { savedVehicles, setSavedVehicles } = useSavedVehicles()
  const { toast } = useToast()

  const fetchData = useCallback(async (endpoint: string, params: Record<string, string> = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const url = `${endpoint}${queryString ? `?${queryString}` : ''}`
    try {
      const data = await apiFetch(url)
      return data
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error)
      toast({
        title: "Error",
        description: `Failed to fetch ${endpoint.split('/').pop()}. Please try again.`,
        variant: "destructive",
      })
      throw error
    }
  }, [toast])

  const fetchMakes = useCallback(async () => {
    setLoading(prev => ({ ...prev, makes: true }))
    try {
      const data = await fetchData('api/vehicle-makes')
      setMakes(data.makes || [])
    } finally {
      setLoading(prev => ({ ...prev, makes: false, page: false }))
    }
  }, [fetchData])

  const fetchModels = useCallback(async (make: string) => {
    setLoading(prev => ({ ...prev, models: true }))
    try {
      const data = await fetchData('api/vehicle-models', { make })
      setModels(data.models || [])
    } finally {
      setLoading(prev => ({ ...prev, models: false }))
    }
  }, [fetchData])

  const fetchYears = useCallback(async (make: string, model: string) => {
    setLoading(prev => ({ ...prev, years: true }))
    try {
      const data = await fetchData('api/vehicle-years', { make, model })
      setYears(data.years.map(String) || [])
    } finally {
      setLoading(prev => ({ ...prev, years: false }))
    }
  }, [fetchData])

  const fetchEngines = useCallback(async (make: string, model: string, year: string) => {
    setLoading(prev => ({ ...prev, engines: true }))
    try {
      const data = await fetchData('api/vehicle-engine', { make, model, year })
      const engineOptions = data.engine ? [data.engine] : []
      setEngines(engineOptions)
      if (engineOptions.length === 1) {
        setSelectedVehicle(prev => ({ ...prev, engine: engineOptions[0] }))
      }
    } finally {
      setLoading(prev => ({ ...prev, engines: false }))
    }
  }, [fetchData])

  useEffect(() => {
    fetchMakes()
  }, [fetchMakes])

  const handleSelectionChange = useCallback((key: keyof Vehicle, value: string) => {
    setSelectedVehicle(prev => {
      const updated = { ...prev, [key]: value }
      if (key === 'make') {
        delete updated.model
        delete updated.year
        delete updated.engine
        fetchModels(value)
      } else if (key === 'model') {
        delete updated.year
        delete updated.engine
        fetchYears(updated.make!, value)
      } else if (key === 'year') {
        delete updated.engine
        fetchEngines(updated.make!, updated.model!, value)
      }
      return updated
    })
    setIsSaved(false)
  }, [fetchModels, fetchYears, fetchEngines])

  const handleContinue = useCallback(async () => {
    if (selectedVehicle.make && selectedVehicle.model && selectedVehicle.year && selectedVehicle.engine) {
      setLoading(prev => ({ ...prev, vehicleType: true }))
      try {
        const url = `/dynamic-content?${new URLSearchParams(selectedVehicle as Record<string, string>).toString()}`;
        router.push(url);
      } catch (error) {
        console.error("Error navigating to dynamic content:", error)
        toast({
          title: "Error",
          description: "An error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(prev => ({ ...prev, vehicleType: false }))
      }
    } else {
      toast({
        title: "Incomplete Selection",
        description: "Please select make, model, year, and engine.",
        variant: "warning",
      })
    }
  }, [selectedVehicle, router, toast])

  const handleSaveVehicle = useCallback(() => {
    if (selectedVehicle.make && selectedVehicle.model && selectedVehicle.year && selectedVehicle.engine) {
      const newVehicle = selectedVehicle as Vehicle
      const updatedVehicles = [...savedVehicles, newVehicle]
      setSavedVehicles(updatedVehicles)
      setIsSaved(true)
      toast({
        title: "Vehicle Saved",
        description: "Your vehicle has been saved successfully.",
        variant: "success",
      })
    } else {
      toast({
        title: "Incomplete Selection",
        description: "Please select make, model, year, and engine before saving.",
        variant: "warning",
      })
    }
  }, [selectedVehicle, savedVehicles, setSavedVehicles, toast])

  if (loading.page) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Select Your Vehicle</h1>
            <div className="space-y-6">
              <SelectDropdown
                label="Make"
                options={makes}
                value={selectedVehicle.make || ''}
                onChange={(value) => handleSelectionChange('make', value)}
                loading={loading.makes}
              />

              <AnimatePresence mode="wait">
                {selectedVehicle.make && (
                  <motion.div
                    key="model"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SelectDropdown
                      label="Model"
                      options={models}
                      value={selectedVehicle.model || ''}
                      onChange={(value) => handleSelectionChange('model', value)}
                      loading={loading.models}
                      disabled={!selectedVehicle.make}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {selectedVehicle.model && (
                  <motion.div
                    key="year"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SelectDropdown
                      label="Year"
                      options={years}
                      value={selectedVehicle.year || ''}
                      onChange={(value) => handleSelectionChange('year', value)}
                      loading={loading.years}
                      disabled={!selectedVehicle.model}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {selectedVehicle.year && (
                  <motion.div
                    key="engine"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SelectDropdown
                      label="Engine"
                      options={engines}
                      value={selectedVehicle.engine || ''}
                      onChange={(value) => handleSelectionChange('engine', value)}
                      loading={loading.engines}
                      disabled={!selectedVehicle.year}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {selectedVehicle.engine && (
                  <motion.div
                    key="buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex space-x-2"
                  >
                    <Button
                      onClick={handleContinue}
                      className="flex-1"
                      disabled={loading.vehicleType || !selectedVehicle.engine}
                    >
                      {loading.vehicleType ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Continue
                    </Button>
                    <Button
                      onClick={handleSaveVehicle}
                      variant="outline"
                      disabled={isSaved || !selectedVehicle.engine}
                    >
                      {isSaved ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}