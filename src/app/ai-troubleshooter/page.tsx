'use client'

import React, { useReducer, useCallback, useEffect, Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { initialState, reducer } from './state'
import { Card, CardContent } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useToast } from '@/hooks/useToast'

const VehicleSelection = React.lazy(() => import('@/components/vehicle-selection'))
const ChatInterface = React.lazy(() => import('./chat-interface'))

export default function AITroubleshooter() {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('aiTroubleshooterState')
      return savedState ? JSON.parse(savedState) : initial
    }
    return initial
  })

  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem('aiTroubleshooterState', JSON.stringify(state))
  }, [state])

  const handleConfirm = useCallback(() => {
    if (state.selectedMake && state.selectedModel && state.selectedYear) {
      console.log('Setting showChat to true');
      dispatch({ type: 'SET_SHOW_CHAT', payload: true })
    } else {
      toast({
        title: "Incomplete Selection",
        description: "Please select make, model, and year before continuing.",
        variant: "warning",
      })
    }
  }, [state.selectedMake, state.selectedModel, state.selectedYear, toast])

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background pt-16 px-4 lg:px-8">
        <div className="w-full h-full max-w-screen-2xl mx-auto flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!state.showChat ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto"
              >
                <Suspense fallback={
                  <Card className="w-full max-w-7xl mx-auto max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <CardContent className="pt-6">
                      <h1 className="text-2xl font-bold mb-8 text-center">
                        AI Troubleshooter
                      </h1>
                      <div className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-1/2 mx-auto" />
                      </div>
                    </CardContent>
                  </Card>
                }>
                  <VehicleSelection state={state} dispatch={dispatch} onConfirm={handleConfirm} isLoading={isLoading} setIsLoading={setIsLoading} />
                </Suspense>
              </motion.div>
            ) : (
              <Suspense fallback={
                <Card className="w-full h-full">
                  <CardContent className="h-full flex items-center justify-center">
                    <Skeleton className="h-[500px] w-full" />
                  </CardContent>
                </Card>
              }>
                <ChatInterface state={state} dispatch={dispatch} />
              </Suspense>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  )
}