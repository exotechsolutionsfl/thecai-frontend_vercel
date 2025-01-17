'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Check } from 'lucide-react'
import { apiFetch } from '@api/api'
import { useSavedVehicles } from '@context/VehicleContext'
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/label"

interface SelectDropdownProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  loading: boolean
  disabled?: boolean
}

function SelectDropdown({ label, options, value, onChange, loading, disabled }: SelectDropdownProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled || loading || options.length === 0}>
        <SelectTrigger id={label}>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="_empty" disabled>
              No {label} available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}

export default function VehicleSelection() {
  const [makes, setMakes] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [engines, setEngines] = useState<string[]>([])
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedEngine, setSelectedEngine] = useState('')
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

  useEffect(() => {
    fetchMakes()
  }, [])

  const fetchMakes = async () => {
    setLoading(prev => ({ ...prev, makes: true }))
    try {
      const data = await apiFetch('api/vehicle-makes')
      setMakes(data.makes || [])
    } catch (error) {
      console.error("Error fetching makes:", error)
    } finally {
      setLoading(prev => ({ ...prev, makes: false, page: false }))
    }
  }

  const fetchModels = async (make: string) => {
    setLoading(prev => ({ ...prev, models: true }))
    try {
      const data = await apiFetch(`api/vehicle-models?make=${encodeURIComponent(make)}`)
      setModels(data.models)
    } catch (error) {
      console.error(`Error fetching models for ${make}:`, error)
    } finally {
      setLoading(prev => ({ ...prev, models: false }))
    }
  }

  const fetchYears = async (make: string, model: string) => {
    setLoading(prev => ({ ...prev, years: true }))
    try {
      const data = await apiFetch(`api/vehicle-years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
      setYears(data.years.map(String))
    } catch (error) {
      console.error(`Error fetching years for ${make} ${model}:`, error)
    } finally {
      setLoading(prev => ({ ...prev, years: false }))
    }
  }

  const fetchEngines = async (make: string, model: string, year: string) => {
    setLoading(prev => ({ ...prev, engines: true }))
    try {
      const data = await apiFetch(`api/vehicle-engine?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}`)
      const engineOptions = data.engine ? [data.engine] : []
      setEngines(engineOptions)
      if (engineOptions.length === 1) {
        setSelectedEngine(engineOptions[0])
      }
    } catch (error) {
      console.error(`Error fetching engines for ${make} ${model} ${year}:`, error)
      setEngines([])
    } finally {
      setLoading(prev => ({ ...prev, engines: false }))
    }
  }

  const handleMakeChange = (make: string) => {
    setSelectedMake(make)
    setSelectedModel('')
    setSelectedYear('')
    setSelectedEngine('')
    setIsSaved(false)
    if (make) {
      fetchModels(make)
    } else {
      setModels([])
    }
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    setSelectedYear('')
    setSelectedEngine('')
    setIsSaved(false)
    if (selectedMake && model) {
      fetchYears(selectedMake, model)
    } else {
      setYears([])
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    setSelectedEngine('')
    setIsSaved(false)
    if (selectedMake && selectedModel && year) {
      fetchEngines(selectedMake, selectedModel, year)
    } else {
      setEngines([])
    }
  }

  const handleEngineChange = (engine: string) => {
    setSelectedEngine(engine)
    setIsSaved(false)
  }

  const handleContinue = async () => {
    if (selectedMake && selectedModel && selectedYear && selectedEngine) {
      setLoading(prev => ({ ...prev, vehicleType: true }))
      try {
        const url = `/dynamic-content?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${encodeURIComponent(selectedYear)}&engine=${encodeURIComponent(selectedEngine)}`;
        router.push(url);
      } catch (error) {
        console.error("Error checking vehicle type:", error)
        alert("An error occurred. Please try again.")
      } finally {
        setLoading(prev => ({ ...prev, vehicleType: false }))
      }
    } else {
      alert("Please select make, model, year, and engine.")
    }
  }

  const handleSaveVehicle = () => {
    if (selectedMake && selectedModel && selectedYear && selectedEngine) {
      const newVehicle = { make: selectedMake, model: selectedModel, year: selectedYear, engine: selectedEngine }
      const updatedVehicles = [...savedVehicles, newVehicle]
      setSavedVehicles(updatedVehicles)
      setIsSaved(true)
    } else {
      alert('Please select make, model, year, and engine before saving.')
    }
  }

  if (loading.page) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Select Your Vehicle</h1>
          <div className="space-y-6">
            <SelectDropdown
              label="Make"
              options={makes}
              value={selectedMake}
              onChange={handleMakeChange}
              loading={loading.makes}
            />

            <AnimatePresence mode="wait">
              {selectedMake && (
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
                    value={selectedModel}
                    onChange={handleModelChange}
                    loading={loading.models}
                    disabled={!selectedMake}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {selectedModel && (
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
                    value={selectedYear}
                    onChange={handleYearChange}
                    loading={loading.years}
                    disabled={!selectedModel}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {selectedYear && (
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
                    value={selectedEngine}
                    onChange={handleEngineChange}
                    loading={loading.engines}
                    disabled={!selectedYear}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {selectedEngine && (
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
                    disabled={loading.vehicleType || !selectedEngine}
                  >
                    {loading.vehicleType ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Continue
                  </Button>
                  <Button
                    onClick={handleSaveVehicle}
                    variant="outline"
                    disabled={isSaved || !selectedEngine}
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
  )
}