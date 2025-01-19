'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { State, Action } from '../app/ai-troubleshooter/state'
import { apiFetch as fetchData } from '@api/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/Skeleton"
import { Card, CardContent } from "@/components/ui/Card"
import { ErrorBoundary } from "@/components/ErrorBoundary"


interface VehicleSelectionProps {
  state: State
  dispatch: React.Dispatch<Action>
  onConfirm: () => void
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export default function VehicleSelection({ state, dispatch, onConfirm, isLoading, setIsLoading }: VehicleSelectionProps) {
  const [makes, setMakes] = useState(state.makes)

  const fetchMakes = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchData('api/vehicle-makes')
      setMakes(data.makes || [])
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading])

  const fetchModels = useCallback(async (make: string) => {
    dispatch({ type: 'SET_LOADING', payload: { models: true } })
    try {
      const data = await fetchData(`api/vehicle-models?make=${encodeURIComponent(make)}`)
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
      const data = await fetchData(`api/vehicle-years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`)
      dispatch({ type: 'SET_YEARS', payload: data.years.map(String) })
    } catch (error) {
      console.error(`Error fetching years for ${make} ${model}:`, error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'An unknown error occurred while fetching years' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { years: false } })
    }
  }, [dispatch])

  const handleMakeChange = (make: string) => {
    dispatch({ type: 'SET_SELECTED_MAKE', payload: make })
    if (make) {
      fetchModels(make)
    } else {
      dispatch({ type: 'SET_MODELS', payload: [] })
    }
  }

  const handleModelChange = (model: string) => {
    dispatch({ type: 'SET_SELECTED_MODEL', payload: model })
    if (state.selectedMake && model) {
      fetchYears(state.selectedMake, model)
    } else {
      dispatch({ type: 'SET_YEARS', payload: [] })
    }
  }

  const handleYearChange = (year: string) => {
    dispatch({ type: 'SET_SELECTED_YEAR', payload: year })
  }

  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Select Your Vehicle</h1>
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/2 mx-auto" />
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {state.error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{state.error}</span>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Select value={state.selectedMake} onValueChange={handleMakeChange}>
                    <SelectTrigger id="make">
                      <SelectValue placeholder="Select Make" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {makes.map(make => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AnimatePresence>
                  {state.selectedMake && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="model">Model</Label>
                      <Select value={state.selectedModel} onValueChange={handleModelChange}>
                        <SelectTrigger id="model">
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {state.models.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      className="space-y-2"
                    >
                      <Label htmlFor="year">Year</Label>
                      <Select value={state.selectedYear} onValueChange={handleYearChange}>
                        <SelectTrigger id="year">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {state.years.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {state.selectedMake && state.selectedModel && state.selectedYear && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button className="w-full" size="lg" onClick={onConfirm}>
                        Start Chat
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  )
}