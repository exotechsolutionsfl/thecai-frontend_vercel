import { useCallback, useEffect } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, AlertTriangle } from 'lucide-react'
import { State, Action } from './state'
import { apiFetch } from '@api/api'

interface VehicleSelectionProps {
  state: State
  dispatch: React.Dispatch<Action>
  onConfirm: () => void
}

export default function VehicleSelection({ state, dispatch, onConfirm }: VehicleSelectionProps) {
  const { theme } = useTheme()

  const fetchMakes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { makes: true } })
    try {
      const data = await apiFetch('api/vehicle-makes')
      dispatch({ type: 'SET_MAKES', payload: data.makes || [] })
    } catch (error) {
      console.error("Error fetching makes:", error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An unknown error occurred while fetching makes' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { makes: false } })
    }
  }, [dispatch])

  const fetchModels = useCallback(async (make: string) => {
    dispatch({ type: 'SET_LOADING', payload: { models: true } })
    try {
      const data = await apiFetch(`api/vehicle-models?make=${encodeURIComponent(make)}`)
      dispatch({ type: 'SET_MODELS', payload: data.models })
    } catch (error) {
      console.error(`Error fetching models for ${make}:`, error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An unknown error occurred while fetching models' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { models: false } })
    }
  }, [dispatch])

  const fetchYears = useCallback(async (make: string, model: string) => {
    dispatch({ type: 'SET_LOADING', payload: { years: true } })
    try {
      const data = await apiFetch(`api/vehicle-years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
      dispatch({ type: 'SET_YEARS', payload: data.years.map(String) })
    } catch (error) {
      console.error(`Error fetching years for ${make} ${model}:`, error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An unknown error occurred while fetching years' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { years: false } })
    }
  }, [dispatch])

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const make = e.target.value
    dispatch({ type: 'SET_SELECTED_MAKE', payload: make })
    if (make) {
      fetchModels(make)
    } else {
      dispatch({ type: 'SET_MODELS', payload: [] })
    }
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value
    dispatch({ type: 'SET_SELECTED_MODEL', payload: model })
    if (state.selectedMake && model) {
      fetchYears(state.selectedMake, model)
    } else {
      dispatch({ type: 'SET_YEARS', payload: [] })
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_SELECTED_YEAR', payload: e.target.value })
  }

  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-900'} flex items-center`}
          >
            <AlertTriangle className="mr-2" />
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>
      {state.loading.makes ? (
        <div className="flex justify-center items-center h-32">
          <Settings className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <label htmlFor="make" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Make
          </label>
          <select
            id="make"
            value={state.selectedMake}
            onChange={handleMakeChange}
            className={`w-full p-3 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-750' 
                : 'bg-white text-black border-gray-200 hover:bg-gray-50'
            } border shadow-sm transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none`}
          >
            <option value="">Select Make</option>
            {state.makes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
          <AnimatePresence>
            {state.selectedMake && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="model" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Model
                </label>
                <select
                  id="model"
                  value={state.selectedModel}
                  onChange={handleModelChange}
                  className={`w-full p-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-750' 
                      : 'bg-white text-black border-gray-200 hover:bg-gray-50'
                  } border shadow-sm transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none`}
                >
                  <option value="">Select Model</option>
                  {state.models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {state.selectedMake && state.selectedModel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="year" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Year
                </label>
                <select
                  id="year"
                  value={state.selectedYear}
                  onChange={handleYearChange}
                  className={`w-full p-3 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-750' 
                      : 'bg-white text-black border-gray-200 hover:bg-gray-50'
                  } border shadow-sm transition-all duration-300 focus:ring-2 focus:ring-blue-500 outline-none`}
                >
                  <option value="">Select Year</option>
                  {state.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {state.selectedMake && state.selectedModel && state.selectedYear && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={onConfirm}
                className={`w-full p-3 rounded-lg font-medium text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Start Chat
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}