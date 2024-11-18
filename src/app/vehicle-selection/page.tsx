'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2, Save, Check } from 'lucide-react'
import { apiFetch } from '@api/api'
import { useTheme } from '@context/ThemeProvider'
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
}

function SelectDropdown({ label, options, value, onChange, loading }: SelectDropdownProps) {
  const { theme } = useTheme()

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id={label} className="w-full">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.length > 0 ? (
            options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>
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
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [loading, setLoading] = useState({
    page: true,
    makes: true,
    models: false,
    years: false,
    vehicleType: false,
  })
  const [isSaved, setIsSaved] = useState(false)

  const router = useRouter()
  const { theme } = useTheme()
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

  const handleMakeChange = (make: string) => {
    setSelectedMake(make)
    setSelectedModel('')
    setSelectedYear('')
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
    setIsSaved(false)
    if (selectedMake && model) {
      fetchYears(selectedMake, model)
    } else {
      setYears([])
    }
  }

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    setIsSaved(false)
  }

  const handleContinue = async () => {
    if (selectedMake && selectedModel && selectedYear) {
      setLoading(prev => ({ ...prev, vehicleType: true }))
      try {
        const data = await apiFetch(`api/main-topics?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${encodeURIComponent(selectedYear)}`)
        const url = data.isLegacy
          ? `/legacy-main-topics?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${encodeURIComponent(selectedYear)}`
          : `/main-topics?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${encodeURIComponent(selectedYear)}`
        router.push(url)
      } catch (error) {
        console.error("Error checking vehicle type:", error)
        alert("An error occurred. Please try again.")
      } finally {
        setLoading(prev => ({ ...prev, vehicleType: false }))
      }
    } else {
      alert("Please select make, model, and year.")
    }
  }

  const handleSaveVehicle = () => {
    if (selectedMake && selectedModel && selectedYear) {
      const newVehicle = { make: selectedMake, model: selectedModel, year: selectedYear }
      const updatedVehicles = [...savedVehicles, newVehicle]
      setSavedVehicles(updatedVehicles)
      setIsSaved(true)
    } else {
      alert('Please select make, model, and year before saving.')
    }
  }

  if (loading.page) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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

            <AnimatePresence>
              {selectedMake && (
                <motion.div
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
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedModel && (
                <motion.div
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
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedYear && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex space-x-2"
                >
                  <Button
                    onClick={handleContinue}
                    className="flex-1"
                    disabled={loading.vehicleType}
                  >
                    {loading.vehicleType ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Continue
                  </Button>
                  <Button
                    onClick={handleSaveVehicle}
                    variant="outline"
                    disabled={isSaved}
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