'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, Loader2, Save, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@api/api'
import Loading from '@components/loading'
import { useTheme } from '@context/ThemeProvider'
import { useSavedVehicles } from '@context/VehicleContext'

interface SelectDropdownProps {
  label: string
  options: string[]
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  loading: boolean
}

function SelectDropdown({ label, options, value, onChange, loading }: SelectDropdownProps) {
  const { theme } = useTheme()

  return (
    <div className="relative">
      <label htmlFor={label} className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
        {label}
      </label>
      <div className="relative">
        <select
          id={label}
          value={value}
          onChange={onChange}
          className={`block w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'} border rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none`}
          disabled={loading}
        >
          <option value="">Select {label}</option>
          {options.length > 0 ? (
            options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))
          ) : (
            <option value="">No {label} available</option>
          )}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <Loader2 className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} animate-spin`} />
          ) : (
            <ChevronDownIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function Component() {
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

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const make = e.target.value
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

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value
    setSelectedModel(model)
    setSelectedYear('')
    setIsSaved(false)
    if (selectedMake && model) {
      fetchYears(selectedMake, model)
    } else {
      setYears([])
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value)
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
    return <Loading message={null} />
  }

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} font-sans`}>
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-full max-w-md p-4">
          <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Select Your Vehicle</h1>
          <div className="space-y-4">
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
                  <button
                    onClick={handleContinue}
                    className={`flex-1 ${theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black hover:bg-gray-800 text-white'} font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-all duration-300 ease-in-out`}
                    disabled={loading.vehicleType}
                  >
                    {loading.vehicleType ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : (
                      'Continue'
                    )}
                  </button>
                  <button
                    onClick={handleSaveVehicle}
                    className={`${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'} font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-all duration-300 ease-in-out`}
                    disabled={isSaved}
                  >
                    {isSaved ? (
                      <Check className="w-6 h-6 text-green-500" />
                    ) : (
                      <Save className="w-6 h-6" />
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}